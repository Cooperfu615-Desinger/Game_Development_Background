# 後端交接文件（Phase C1：Token / Scope / Permission 契約）

本文件給實作真實後端的工程師。C1 用 mock token + MSW 模擬了「身份簽發」與「資料 scope 過濾」；本文件把這些模擬背後的**契約**寫清楚，讓後端可以原樣實作。

---

## 1. Token Payload 契約

C1 的 mock token 是 `base64url(header).base64url(payload).mocksig` 格式（明文、不驗章，僅 demo）。正式後端需發放並驗證真 JWT，但 **payload 欄位契約應保持一致**，前端與 scope 過濾都依賴這些欄位。

| 欄位 | 型別 | 說明 |
|---|---|---|
| `sub` | `string` | 使用者 ID |
| `portal` | `'supplier' \| 'agent' \| 'merchant'` | 所屬 portal |
| `role` | `string` | 角色 ID（對應第 4 節權限矩陣） |
| `dataScope` | `'all' \| 'own-agent-line' \| 'own-merchant' \| 'none'` | 資料可見範圍（驅動第 2 節 scope 過濾） |
| `actorId` | `string` | 租戶 ID（例：`SUP-001` / `AG-001` / `MER-001`） |
| `actorName` | `string` | 顯示名稱，**同時是過濾鍵**（見第 3 節擁有權鍵對照） |
| `iat` | `number` | 簽發時間（mock 中為固定常數，確保建置可重現） |
| `exp` | `number` | 過期時間（mock 中為固定常數） |

> mock 將 `iat` / `exp` 設為固定常數以保持建置結果確定性；正式環境應使用真實時間並驗證過期。

### 三個內建身份（mock）

| portal | sub | role | dataScope | actorId | actorName |
|---|---|---|---|---|---|
| supplier | `user-sup-001` | `role-super-admin` | `all` | `SUP-001` | 供應商管理員 |
| agent | `user-agent-001` | `role-agent-user` | `own-agent-line` | `AG-001` | Asia Master |
| merchant | `user-merchant-001` | `role-merchant-user` | `own-merchant` | `MER-001` | Golden Dragon |

---

## 2. 各 endpoint 的 scope 過濾規則

C1 的 `src/mocks/scope.ts` 提供 `scopeRows(request, rows, { agentKey?, merchantKey? })`：讀 `Authorization` → `decodeToken` → 依 `dataScope` 過濾。通用規則：

- `all` → 回傳全部資料列。
- `none` → 回傳 `[]`。
- `own-agent-line` → 保留 `row[agentKey] === actorName`；若 handler 未傳 `agentKey` → **pass-through（不過濾）並 `console.warn`**。
- `own-merchant` → 保留 `row[merchantKey] === actorName` **或**（`'code' in row` 且 `row.code === actorId`）。

下表是 C1 已套用 scope 的 7 個端點，含過濾欄位與各身份在瀏覽器中驗證到的實際列數（supplier / agent / merchant）：

| endpoint | 過濾鍵 | own-agent-line 行為 | own-merchant 行為 | supplier | agent | merchant |
|---|---|---|---|---|---|---|
| `GET /api/merchants/v2/list` | `agentKey:'agent'`, `merchantKey:'code'` | 依 `merchant.agent` 過濾 | 依 `merchant.code` 過濾 | 60 | 15 | 1 |
| `GET /api/orders/v2/list` | `merchantKey:'merchant'` | pass-through（資料無 agent 欄位） | 依 `order.merchant` 過濾 | 60 | 60 | 15 |
| `GET /api/orders/v2/abnormal` | `merchantKey:'merchant'` | pass-through | Golden Dragon 子集 | 全部 | pass-through | 子集 |
| `GET /api/transactions/v2/list` | `merchantKey:'merchant'` | pass-through | 依 `transaction.merchant` 過濾 | 60 | 60 | 30 |
| `GET /api/transactions/v2/abnormal` | `merchantKey:'merchant'` | pass-through | Golden Dragon 子集 | 全部 | pass-through | 子集 |
| `GET /api/risk/v2/alerts` | `merchantKey:'merchant'` | pass-through | 依 `merchant` 過濾 | 60 | 60 | 24 |
| `GET /api/risk/v2/cases` | `merchantKey:'merchant'` | pass-through | 依 `merchant` 過濾 | 60 | 60 | 24 |

> 重點：order / risk 類端點在 `own-agent-line`（agent 身份）下是 **pass-through**，因為這些資料列沒有 `agent` 欄位可比對。這是 C1 的已知簡化，正式後端必須補上（見第 5 節）。

### C2 Spec 2 新增 / 複用端點

| endpoint | 過濾鍵 | own-agent-line | own-merchant |
|---|---|---|---|
| `GET /api/agents/v2/commissions`（新） | `agentKey:'agent'` | `agent==='Asia Master'`（6 筆中留 3） | 空（無 agentKey 命中、列無 code 欄位） |
| `GET /api/sub-accounts/v2/list`（新） | `agentKey:'agent'`,`merchantKey:'merchant'` | `agent==='Asia Master'`（9 筆中留 3） | `merchant==='Golden Dragon'`（9 筆中留 4） |
| `GET /api/merchants/v2/list`（self-view 複用，取首筆） | 同 C1（agentKey:`agent`/merchantKey:`code`） | 依 `merchant.agent` 過濾 | 1 筆（MER-001）；商戶資料 / API錢包 兩頁取 `rows[0]` |

> **self-view 複用 trade-off**：merchant 商戶資料 / API錢包 直接複用 own-merchant scope 後的 `/api/merchants/v2/list` 首筆。該 list 列含憑證（`apiKey`/`secretKey`/`walletApi`/`callbackUrl`），supplier(all) 下會回含 secret 的多筆——**正式後端必須把憑證移到專屬 own-merchant scoped 端點（如 `/api/merchant/v2/credentials`），不可放在 list**。前端 secret 顯示用 `SensitiveValue` 遮罩（UI 層，非安全邊界）。
> **commissions own-agent-line**：mock 採 `agent` 欄位直接比對 actorName；sub-agent 線遞迴為真後端 TODO（同第 5 節 order/risk 註記）。
> **sub-accounts 設計**：子帳號＝該 actor 帳號下的操作員。agent 列只帶 `agent`（`merchant:''`）、merchant 列只帶 `merchant`（`agent:''`），使 scopeRows 乾淨切分、空字串不會誤配。

### C1 未套 scope 的端點

以下端點在 C1 **完全未套用 scope**（pass-through），正式後端需依相關性自行套用：
risk overview / rules / actions、dashboard/\*、reports/\*（聚合，best-effort pass-through，後端需依 scope 重算）、jackpot/\*、games/\*、system/\*、settings/\*、platforms/\*、players/\*、finance/\*、aggregators/\*。

---

## 3. 擁有權鍵對照（關鍵）

scope 過濾用 token 的 `actorName` / `actorId` 去比對資料列欄位。對齊關係如下：

| 身份 | 比對來源 | 對應資料欄位 |
|---|---|---|
| agent（Asia Master） | `actorName === 'Asia Master'` | `merchant.agent` |
| merchant（Golden Dragon） | `actorId === 'MER-001'` | `merchant.code` |
| merchant（Golden Dragon） | `actorName === 'Golden Dragon'` | order / risk 資料列的 `merchant` 欄位 |

為了讓比對成立，C1 把 agent 的 `actorName` 從原本的「星河代理」**改名為 `Asia Master`**，使其與 `merchant.agent` 欄位的值對齊（`AG-001` = Asia Master）。後端在設計資料模型時，需確保「身份識別值」與「資料列上的擁有權欄位」一致，否則 scope 過濾會全數落空（回傳空集或全集）。

---

## 4. 權限矩陣（RBAC）

C1 在 `src/stores/permission.ts` 定義 `MOCK_ROLES`。`hasPermission` 處理 `'*'` 萬用字元（`role-super-admin` 擁有全部權限）。

| role id | label | permissions | dataScope |
|---|---|---|---|
| `role-super-admin` | 總管理員 | `['*']`（全部） | `all` |
| `role-operations` | 營運人員 | `dashboard.view`, `merchants.view/create/edit`, `agents.view/edit`, `games.view/edit`, `orders.view`, `transactions.view`, `reports.view/export` | `all` |
| `role-finance` | 財務人員 | `dashboard.view`, `reports.view/export`, `settlements.view/create/lock`, `reconciliation.view`, `transactions.view` | `all` |
| `role-risk` | 風控人員 | `dashboard.view`, `risk.view/handle`, `orders.view`, `orders.mark-abnormal`, `transactions.view` | `all` |
| `role-agent-user` | 代理使用者 | `dashboard.view`, `merchants.view`, `reports.view`, `commissions.view` | `own-agent-line` |
| `role-merchant-user` | 商戶使用者 | `dashboard.view`, `orders.view`, `transactions.view`, `reports.view`, `settlements.view` | `own-merchant` |

> 表中 `a/b/c` 為簡寫，例如 `merchants.view/create/edit` = `merchants.view`、`merchants.create`、`merchants.edit`。

後端應以 token 的 `role` 解析出該角色的權限集合，並在 API 層做授權檢查（不要只依賴前端 gating——前端 gating 只是 UX，不是安全邊界）。

---

## 5. Mock → 真後端對照

| C1 在 MSW / mock 模擬了什麼 | 正式後端需實作什麼 |
|---|---|
| `scope.ts` 讀 token 的 `dataScope` 對記憶體資料列過濾 | 在資料查詢層依 `dataScope` 加 WHERE 條件 / row-level security |
| `own-merchant` 用 `actorName`/`actorId` 比對 `merchant`/`code` | 用真正的租戶外鍵關聯過濾 |
| `own-agent-line` 對 order / risk 端點 = **pass-through** | **需實作 merchant→agent-line 成員關係解析**：先找出該 agent 線下的所有 merchant，再用 merchant 集合過濾 order / risk 資料。這是 C1 沒做、後端必做的 TODO |
| aggregate 端點（reports / dashboard）= best-effort pass-through | **依 scope 重新計算聚合值**（不能只過濾再回傳已算好的總數，否則數字會錯） |
| 未套 scope 的端點（第 2 節清單）= 直接回全量 | 依業務相關性決定是否套 scope，並實作之 |
| mock token 明文、不驗章 | 發放並驗證真 JWT（簽章、過期、撤銷） |

---

## 6. 安全須知

- **Mock token 不可當真 auth**：payload 為 base64 明文、簽章是字面值 `mocksig`、從不驗證。任何人都能偽造。正式環境必須由後端簽發並在每個請求驗證真 JWT。
- **前端 gating 不是安全邊界**：`hasPermission` 與 scope 在 C1 都跑在瀏覽器/MSW 端。正式環境的授權與資料過濾**必須在後端強制**，前端的對應邏輯只用於 UX。
- **token 覆蓋缺口**：C1 仍有部分前端呼叫未帶 token（見 `frontend.md` H#1）。後端啟用真 auth 後，這些呼叫會 401，需前端先完成遷移。

---

相關文件：API client 與頁面取數見 `frontend.md`；端點 × 權限 × scope 總表見 `api-contract.md`。
