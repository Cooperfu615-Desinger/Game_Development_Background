# Portal / Scope / Permission 架構地基（C1）— 設計 Spec

**日期**：2026-06-10
**範圍**：C1 架構地基（不含 C2 Portal 專屬頁面）
**目標讀者**：本專案後續接手的前端 / 後端工程團隊

---

## 一、目的與背景

本專案（遊戲開發商管理總後台）目前是 **單一前端 + MSW mock** 的原型，已具備：
- 三 Portal 型別（supplier / agent / merchant）與 RBAC/ABAC 型別系統（`src/types/portal.ts`）
- `usePortalStore`、`usePermissionStore`（已有資料，**但未接到路由 / 選單 / fetch**）
- Topbar portal 切換器 UI（Phase A6 已建，agent/merchant 目前停用）

**問題**：權限與 Portal 只是「躺著的型別」，不是可執行的契約。直接交接，工程團隊無法得知：
- auth context（身份 / scope）該從哪裡進入請求？
- 每個 API endpoint 後端該依什麼規則過濾資料？
- 前端路由 / 選單 / 按鈕該依什麼權限顯示？

**C1 目標**：把上述變成**一條乾淨、可執行、有文件**的架構接縫，讓團隊「拿著就能接著做、並換上真後端」。

### 目標（Goals）
1. 單一 auth 接縫：mock bearer token 編碼身份，API client 統一附帶。
2. 單一 scope 強制點：MSW 解 token 依 dataScope 過濾，**示範後端契約**。
3. RBAC 接上路由與選單；提供按鈕級 `can()` helper。
4. Portal 切換實際生效（換 token + 換選單 + 換身份）。
5. 三份交接文件（前端 / 後端 / API 契約）。

### 非目標（Non-Goals，留待 C2 或之後）
- Portal 專屬實頁（agent 佣金、merchant 商戶資料 / API 錢包 / 風控告警、子帳號）— 屬 **C2**。
- 真實 JWT 簽章 / 驗章（mock token 為 base64 明文，**僅示意**，正式由後端發 / 驗）。
- 按鈕級 / 欄位級權限的**全面**套用（C1 提供 helper + 契約矩陣，逐頁套用屬後續）。
- 真實資料庫多租戶查詢（MSW 過濾僅示範規則）。

---

## 二、架構總覽

```
┌─────────────┐   switchPortal()   ┌──────────────┐
│ Portal 切換器 │ ─────────────────> │ authStore    │  換發 mock token
└─────────────┘                    │ (token 來源)  │
                                   └──────┬───────┘
                                          │ Authorization: Bearer <token>
                                   ┌──────▼───────┐
   頁面 fetch ──────────────────>  │ apiClient    │  單一 chokepoint：附 token / 錯誤處理
                                   └──────┬───────┘
                                          │ /api/...
                                   ┌──────▼───────┐
                                   │ MSW handler  │  scope.ts 解 token → 依 dataScope 過濾
                                   └──────────────┘  （示範後端該做的事）

   router.beforeEach ──> permissionStore + portal meta ──> 無權限導 403
   menu-sakai ──> 依 portal 產生該 Portal 專屬選單
```

---

## 三、模組設計

### 3.1 Mock Bearer Token — `src/services/auth/mockToken.ts`

身份編碼成 JWT 風格字串：`base64url(header).base64url(payload).<mock-sig>`（**簽章固定字串，不驗章**）。

**Token payload 契約**：
```ts
interface TokenPayload {
  sub: string          // 使用者唯一 id，如 'user-sup-001'
  portal: 'supplier' | 'agent' | 'merchant'
  role: string         // role id，對應 permissionStore，如 'role-super-admin'
  dataScope: 'all' | 'own-agent-line' | 'own-merchant' | 'none'
  actorId: string      // 租戶識別：supplier→'SUP-001' / agent→'AG-001' / merchant→'MER-001'
  actorName: string    // 顯示名稱，亦為部分 mock 資料的過濾鍵
  iat: number          // 簽發時間（epoch 秒）
  exp: number          // 過期時間（mock 給長效）
}
```

提供：`encodeToken(payload)`、`decodeToken(token): TokenPayload | null`、`PORTAL_IDENTITIES`（三個內建身份常數）。

**三個內建身份**：
| portal | sub | role | dataScope | actorId | actorName |
|---|---|---|---|---|---|
| supplier | user-sup-001 | role-super-admin | all | SUP-001 | 供應商管理員 |
| agent | user-agent-001 | role-agent-user | own-agent-line | AG-001 | Asia Master |
| merchant | user-merchant-001 | role-merchant-user | own-merchant | MER-001 | Golden Dragon |

（role id 對應 `src/stores/permission.ts` 既有 `MOCK_ROLES`：`role-super-admin` / `role-agent-user` / `role-merchant-user`。）

> **資料一致性前置修正（必要）**：目前 `agentAdmin` seed 的 AG-001 名稱為「星河代理」，但 `merchantAdmin`/`orderAdmin` 等資料的擁有權欄位用的是「Asia Master」「Golden Dragon」等另一套名稱池。為讓 scope 過濾產出非空且合理的結果，C1 需對齊擁有權鍵：**agent 內建身份 actorName 採 `Asia Master`（與 merchant.agent 欄位一致）**，並確認 agentAdmin seed 至少有一筆 code=AG-001 且其名稱/或新增對照可連到 merchant 的 `agent` 值。詳見後端文件「擁有權鍵對照」。

### 3.2 API Client — `src/services/apiClient.ts`

包裝 `fetch` 的薄層，單一 chokepoint：
```ts
const api = {
  get(path, opts?), post(path, body?, opts?), put(...), del(...)
}
```
職責：
- 自動附 `Authorization: Bearer <authStore.token>`
- 統一 base path、JSON 解析、HTTP 錯誤 → throw（頁面 try/catch 既有模式不變）
- **換真後端時只改這一層**（base URL / 真實 token 來源）

**遷移範圍**：目前 43 處 `fetch('/api/...')`／38 檔 → 改走 `api.get(...)`。頁面的 `onMounted` + `reactive` + `loading` 模式不變。

### 3.3 Scope 強制 — `src/mocks/scope.ts`

MSW handler 端 helper（**模擬後端的 scope 過濾**）：
```ts
scopeRows(request, rows, { agentKey?, merchantKey? }): Row[]
```
- 從 request 的 `Authorization` 取 token → decode → 依 `dataScope`：
  - `all` → 原樣回傳
  - `own-agent-line` → 只留 `row[agentKey] === actorName`（代理線下）
  - `own-merchant` → 只留 `row[merchantKey] === actorName`（或 code === actorId）
  - `none` → 空陣列
- 各 list handler 傳入該資源的擁有權欄位名（見下表）。

**各 endpoint 擁有權欄位（後端過濾契約）**：
| 資源 | 過濾欄位 | own-agent-line | own-merchant |
|---|---|---|---|
| merchants | `agent` / `code` | `agent === actorName` | `code === actorId` |
| orders / abnormal-orders | `merchant` | merchant 屬該 agent 線 | `merchant === actorName` |
| transactions / abnormal | `merchant` | 同上 | `merchant === actorName` |
| risk alerts / cases | `merchant` | 同上 | `merchant === actorName` |
| agents | `code` / `parentAgent` | 自己 + 下級 | （merchant 無此頁） |
| reports（aggregate） | 維度 | 該線彙總 | 該商戶彙總 |
| jackpots | —（供應商層級） | pass-through 或唯讀 | 唯讀 |

> reports 為彙總資料，mock 採 best-effort（pass-through 或標記）；正式由後端依 scope 重算。契約文件會逐條列明。

### 3.4 RBAC / 權限接上

- **路由守衛**：`router.beforeEach` 讀 `to.meta.permission` 與 `to.meta.portal`，比對 `permissionStore.permissions` 與當前 portal；不符 → 導 `/403`。
- **選單**：`menu-sakai.ts` 由靜態單一選單改為 `buildMenuForPortal(t, portal)`：
  - supplier → 完整選單（現狀）
  - agent → 子集（儀表板 / 商戶 / 遊戲 / 交易 / 報表 / 佣金 / 操作紀錄）
  - merchant → 子集（儀表板 / 商戶資料 / API錢包 / 遊戲 / 交易 / 結算 / 報表 / 風控告警）
- **按鈕級**：提供 `usePermission().can('merchants.create')`；C1 接路由 + 選單，按鈕 / 欄位級**逐頁套用屬後續**，但契約矩陣於文件列齊。

### 3.5 Portal 切換 — `usePortalStore.switchPortal()`

切換時連動：
1. `authStore` 換發對應內建身份的 token
2. `permissionStore` 設為對應 role
3. 路由導向該 portal 的首頁（見 §3.6）
4. 選單 / topbar 身份 reactively 更新

Topbar 切換器（A6 已建）移除 agent/merchant 的 disabled。

### 3.6 路由模型 — 前綴 `/agent/*` `/merchant/*`（factory 產生）

- 共用元件**不複製**：用 route factory 產生前綴路由，指向同一批既有元件，差異由 `meta.portal` 表達。
  ```ts
  function portalRoutes(portal, defs) { /* 回傳帶 path 前綴 + meta.portal 的 route[] */ }
  ```
- supplier 維持無前綴（現狀），agent/merchant 各自一組前綴路由。
- `meta.portal` 驅動：portal store 同步、選單選用、身份顯示。
- 好處：URL 可定址、受眾分離明確、對齊 demo、未來可拆獨立 app。
- C1 只需讓**共用頁**在三 portal 下可達；C2 的 Portal 專屬頁再掛各自前綴。

---

## 四、交付文件（C1 同步產出）

1. **`docs/handoff/frontend.md`** — apiClient 用法、portal 切換、`can()` helper、頁面 fetch 模式、換真後端步驟、路由 factory 用法。
2. **`docs/handoff/backend.md`** — token payload 契約、各 endpoint scope 過濾規則、擁有權鍵對照、權限矩陣、API 清單、「mock → 真後端」對照。
3. **`docs/handoff/api-contract.md`** — endpoint × method × 所需 permission × scope 行為 對照總表。

---

## 五、檔案清單（新增 / 修改）

**新增**
- `src/services/auth/mockToken.ts`
- `src/services/apiClient.ts`
- `src/mocks/scope.ts`
- `src/router/portalRoutes.ts`（route factory）
- `docs/handoff/{frontend,backend,api-contract}.md`

**修改**
- `src/stores/portal.ts`（switchPortal 連動 token / role / 導頁）
- `src/stores/auth.ts`（持有 mock token、換發）
- `src/config/menu-sakai.ts`（`buildMenuForPortal`）
- `src/router/index.ts`（beforeEach 權限守衛 + 掛前綴路由）
- `src/layouts/sakai/AppTopbar.vue`（啟用 agent/merchant 切換）
- ~38 個 view / composable（`fetch` → `api`）
- list 類 MSW handlers（套 `scopeRows`）
- mock seed 擁有權鍵對齊（§3.1 前置修正）

---

## 六、風險與緩解

| 風險 | 緩解 |
|---|---|
| 43 處 fetch 遷移出錯 | apiClient 保持 `fetch` 相同回傳契約（回 JSON / throw），逐檔機械替換 + build 驗證 |
| scope 過濾把頁面變空（資料鍵不齊） | §3.1 先對齊擁有權鍵；scope helper 對未知鍵 fallback pass-through 並 `console.warn` |
| 路由前綴使既有連結失效 | supplier 維持無前綴；前綴路由為新增，不動現有 path |
| 權限守衛擋掉開發者測試 | 內建 supplier=super-admin（all 權限）為預設；切換才縮權 |
| mock token 被誤認為真 auth | 檔頭明確註記「base64 明文、不驗章、僅示意」；後端文件強調正式須伺服器發 / 驗 |

---

## 七、C1 / C2 邊界

- **C1（本 spec）**：架構接縫（token / apiClient / scope / 權限守衛 / portal 切換 / 路由 factory）+ 共用頁在三 portal 可達 + 三份交接文件。
- **C2（後續）**：Portal 專屬實頁（agent 佣金報表、merchant 商戶資料 / API錢包 / 風控告警、子帳號等），套用 C1 已建立的架構與 SOP。
