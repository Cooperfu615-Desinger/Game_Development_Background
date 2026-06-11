# Phase C2 — Spec 2「Portal 專屬實頁 + H#3」設計 Spec

**日期**：2026-06-11
**分支**：`feat/phase-c2-spec2-portal-pages`（自 main `c3ff8c6` 開）
**範圍**：把 C2 Spec 1 鋪好的 5 條佔位路由換成真實頁，並一併解決 C1 H#3（sticky portal / 共用選單連結）。
**前置**：C1 + C2 Spec 1 已 SHIPPED 到 main（merge `c3ff8c6`）。

---

## 一、目的

C2 Spec 1 已把「選單 → 前綴路由 → `meta.permission` 守衛 → 佔位頁」這條鏈鋪好。Spec 2 把佔位頁換成真實內容，並讓 agent/merchant 在自己 portal 內導航時**永遠留在自己 portal、用自己的 scoped token**（解 H#3，且絕不退回 supplier/全權限）。

### 目標（Goals）

1. 5 個真實頁：merchant 商戶資料、merchant API錢包、agent 佣金報表、agent 子帳號、merchant 子帳號（後兩者共用一個 portal 參數化元件）。
2. 新 MSW 端點 + seed，**一律遵守 C1 `scopeRows()` 契約**（own-agent-line / own-merchant）。
3. 解 H#3：agent/merchant 選單所有條目改指前綴路徑、且每條都有對應前綴路由（不留死連結）、token 始終是該 portal 的 scoped 身份。
4. 補 `docs/handoff/{backend,api-contract}.md` 新端點 scope 規則（延續 C1 交接文件）。

### 非目標（Non-Goals）

- C1 H#1 backtick / `window.fetch` → `api.*` 大遷移（接真後端開驗章前才做）。
- 欄位級 `canSeeField` 全面啟用（API錢包 secret 用**路由級** `api-wallet.view` + UI 遮罩，欄位級留另案）。
- 把 C1 既有 pass-through 報表/聚合端點改成真 scope（維持 C1 best-effort；見 §三）。
- 背景的 vue-router `RouteMeta` 型別 augmentation（獨立 chip，不併入）。
- merge / push / deploy（由人決定）。

---

## 二、H#3 解法（設計重點）

### 問題

C1 H#3：agent/merchant 選單裡的**共用條目**是絕對 supplier 路徑（如 `/merchants`、`/reports/merchants`）。C1 的前綴路由（`SHARED_DEFS`）只有 8 個 **top-level**（dashboard/merchants/games/orders/transactions/reports/settlements/risk），但選單含 **sub-page**（`/merchants/settings`、`/reports/merchants`、`/games/settings`…共 17 個無前綴路由）。所以「把選單連結改前綴」會對 sub-page 產生**死連結**。

而 Spec 1 review 已否決「補 supplier `meta.portal`」——因為那會讓 agent/merchant 點絕對 supplier 路徑時 `syncPortal('supplier')`、退回 super-admin token、看到全部資料（**從受限 portal 一鍵逃逸到全權限**，方向相反）。

### 採用解法（推薦）：擴 `SHARED_DEFS` 全覆蓋 + 選單前綴轉換，**不補 supplier `meta.portal`**

1. **擴 `SHARED_DEFS`**：把 agent ∪ merchant 選單用到的 17 個 sub-page 路徑全加進 `SHARED_DEFS`（指向各自既有 supplier 元件，與 §五附表一致）。factory 自動為 agent/merchant 各產生前綴路由 → 每個選單連結都有對應前綴路由，**無死連結**。
2. **選單前綴轉換**：`buildMenuForPortal` 對非 supplier 的**共用群組**，把每個 item 的 `to` 由 `/x` 改寫成 `/${portal}/x`（遞迴；附加的 self 群組已是前綴路徑，不再轉換）。
3. **不補 supplier `meta.portal`**：supplier 路由/選單維持現狀。前綴路由本身帶 `meta.portal='agent'/'merchant'`（factory 既有），`beforeEach` 對之 `syncPortal` → token 始終是該 portal scoped 身份。**切回 supplier 只透過 Topbar 切換器（`switchPortal`，C1 既有正常行為）。**

### 為何安全（達成「絕不逃回 supplier/全權限」）

- agent/merchant 選單只連到前綴路徑（`meta.portal=agent/merchant`），導航時 token 始終是 own-agent-line / own-merchant 身份，**永不變成 super-admin**。
- 沒有 supplier `meta.portal`，所以不存在「點共用條目→syncPortal('supplier')→全權限」的逃逸路徑。
- 對 C1 已 scope 的端點（如 merchants list）→ 資料 scoped；對 C1 pass-through 的報表/聚合端點 → 仍以**該 portal 的 scoped token** 呼叫（後端會 filter，mock 暫不 filter），**無權限提升**，與 C1 已知限制一致（非回歸）。

### 取捨與被否決的替代方案

- **取捨**：兩個 portal 都會拿到全部 `SHARED_DEFS` 的前綴路由（含該 portal 選單沒顯示的，如 agent 也有 `/agent/risk/*`）——這些是**無選單連結的無害路由**，深連結進去也只是該 portal scoped 顯示，不增風險。換得 factory 呼叫單純、零死連結。
- **替代 A（被否決）**：補 supplier `meta.portal` + 共用連結改前綴 → 否決，supplier meta.portal 製造「一鍵逃逸全權限」，與交付物方向相反（Spec 1 review 已定）。
- **替代 B（保底，未採用）**：維持 sticky（不改選單連結、不補 supplier meta.portal）。已安全（點絕對 supplier 路徑時 `portalMeta` 為 undefined → 不 syncPortal → 留在當前 portal token）。但 URL 不前綴、不可定址、選單 active 態易錯，留下 H#3 blemish。採用解法在同樣安全下額外換得可定址 URL 與正確 active 態，故不採 B。

---

## 三、資料與端點

新端點一律用 `src/mocks/scope.ts` 的 `scopeRows()`，並在 `src/mocks/handlers/index.ts` 註冊。三身份：supplier=all、agent=AG-001/`Asia Master`/own-agent-line、merchant=MER-001/`Golden Dragon`/own-merchant。

### 3.1 merchant 商戶資料 + API錢包 — **複用既有 `/api/merchants/v2/list`（不新增端點）**

**選擇與理由**：`MerchantRow`（`src/mocks/handlers/merchantAdmin.ts`）**已含全部欄位**——基本資訊（code/name/agent/status/currencies/defaultCurrency/settlementCurrency/languages/environmentMode/walletType/contact/createdAt/revenueType/revenueShare/rtpValue…）**與**憑證（`apiKey`/`secretKey`/`walletApi`/`callbackUrl`）。C1 已把該端點 scope 成 own-merchant → merchant token 下**恰好 1 筆**（Golden Dragon）。

→ 兩個 self 頁都呼叫 `api.get<MerchantRow[]>('/api/merchants/v2/list')` 取 `rows[0]`。**理由**：(a) 上層指定「優先複用既有端點」；(b) 欄位全在該列、零新增 merchant 端點；(c) 端到端示範 C1 own-merchant scope。

> **已知 trade-off（寫進 backend.md）**：該 list 端點在 supplier(all) 下會回傳 60 筆**含 secret**——這是 C1 既有 mock seed 行為（憑證放在 list 列）。Spec 2 不改它；但 backend.md 註明「正式後端：憑證須移到專屬 scoped self/credential 端點，不可放在 list」。Spec 2 用既有端點換取最小變更，把憑證端點硬化列為真後端 TODO。

> **self-view 取 `rows[0]` 的正確性**：5 條專屬路由帶 `meta.portal='merchant'`，`beforeEach` 會 `syncPortal('merchant')` → token=own-merchant → list 必為 1 筆，`rows[0]` 即本商戶。

### 3.2 agent 佣金報表 — **新端點 `GET /api/agents/v2/commissions`**

- **handler**：加在 `src/mocks/handlers/agentAdmin.ts`；`scopeRows(request, SEED_COMMISSIONS, { agentKey: 'agent' })`。
- **scope**：own-agent-line → 留 `row.agent === 'Asia Master'`；all → 全部；own-merchant → handler 未給 merchantKey，scopeRows 對 own-merchant 會嘗試 merchantKey/ code 比對皆不中 → 空（merchant 本就無此選單，可接受）。
- **CommissionRow**：`{ period: string; agent: string; merchant: string; bet: number; ggr: number; commissionType: string; commissionRate: number; commission: number; currency: string; settlementStatus: string }`。
- **seed**：多筆 `agent='Asia Master'`（跨 merchant Golden Dragon / Dragon Club、跨期）+ 多筆其他 agent（Prime Network / Nova Agent…）。→ supplier 看全部、agent(Asia Master) 只看自己線，筆數明顯不同（驗證點）。
- **頁面**：獨立頁 `src/views/Agent/Commissions.vue`（非 reports 子頁；對應 `/agent/commissions` 路由與 `agentSelf` 選單）。
- > own-agent-line 採 C1 既有「`agent` 欄位 === actorName」直接比對（不做 sub-agent 遞迴）——與 C1 scope 契約一致；sub-agent 線遞迴為真後端 TODO（已記於 C1 backend.md）。

### 3.3 子帳號（agent + merchant 共用）— **新端點 `GET /api/sub-accounts/v2/list`**

- **handler**：新檔 `src/mocks/handlers/subAccountAdmin.ts`，於 index.ts 註冊；`scopeRows(request, SEED_SUB_ACCOUNTS, { agentKey: 'agent', merchantKey: 'merchant' })`。
- **scope**：
  - own-agent-line → 留 `row.agent === 'Asia Master'`（代理自己的操作子帳號）。
  - own-merchant → 留 `row.merchant === 'Golden Dragon'`（或 `code === 'MER-001'`，scopeRows 既有 name/code 雙比對；sub-account 無 code 欄位，走 merchantKey name 比對）。
  - all → 全部。
- **SubAccountRow**：`{ id: string; username: string; displayName: string; ownerType: 'agent' | 'merchant'; agent: string; merchant: string; role: string; status: string; lastLoginAt: string; createdAt: string }`。
  - **agent 子帳號列**：`ownerType:'agent'`, `agent:'Asia Master'`, `merchant:''`。
  - **merchant 子帳號列**：`ownerType:'merchant'`, `merchant:'Golden Dragon'`, `agent:''`。
  - 加其他 owner 的列（agent='Prime Network'、merchant='LuckyPlay'…）讓 supplier 全量、各 portal 只見自己（筆數不同＝驗證點）。
  - > 設計取向：子帳號＝「該 actor 帳號下的操作員」。agent 列只帶 `agent`、merchant 列只帶 `merchant`，使 scopeRows 乾淨切分（agent 只見自己的、merchant 只見自己的）。若日後要 agent 看線下 merchant 的子帳號，調 seed 的 `agent` 欄位即可。
- **頁面**：**一個** portal 參數化元件 `src/views/Portal/SubAccounts.vue`，讀 `route.meta.portal` 決定標題/文案；`/agent/sub-accounts` 與 `/merchant/sub-accounts` 都指它；同一端點，scope 由 token 自動套。

### 3.4 端點 × scope 一覽（補進 api-contract.md）

| endpoint | method | 權限 | scope key | own-agent-line | own-merchant |
|---|---|---|---|---|---|
| `/api/merchants/v2/list`（複用，self 取[0]） | GET | merchants.view | agentKey:`agent`/merchantKey:`code` | （無此頁） | 1 筆（MER-001） |
| `/api/agents/v2/commissions`（新） | GET | commissions.view | agentKey:`agent` | `agent==='Asia Master'` | 空 |
| `/api/sub-accounts/v2/list`（新） | GET | sub-accounts.view | agentKey:`agent`,merchantKey:`merchant` | `agent==='Asia Master'` | `merchant==='Golden Dragon'` |

---

## 四、頁面設計（沿用既有 idiom）

設計系統：Apple HIG + demo-pages.css；用既有 UI 元件（`SectionCard`/`SensitiveValue`/`CurrencyAmount`/`StatusTag`…）與 HIG token。資料一律走 `api.*`（不裸 fetch）。頁面結構 mirror `src/views/Reports/Agents.vue`（`page-stack` + `SectionCard` + `DataTable`/`detail-grid`）。Spec 2 MVP 聚焦「資料正確 + scope 正確 + 渲染乾淨」；複雜圖表/篩選非必需。

1. **商戶資料 `Merchant/Profile.vue`**：self-view（read-only）。`SectionCard` + `detail-grid` 顯示基本資訊欄位（名稱/代號/所屬代理/狀態/幣別/語系/環境/錢包類型/分潤/聯絡人/建立時間）。
2. **API錢包 `Merchant/ApiWallet.vue`**：self-view。`SectionCard` 顯示 `walletApi`/`callbackUrl`（一般）+ `apiKey`/`secretKey`（用 `SensitiveValue` 預設遮罩、點眼睛才顯示）。頁面由 `api-wallet.view` 路由級權限守衛（已存在）；欄位級不啟用。
3. **佣金報表 `Agent/Commissions.vue`**：`SectionCard` + `DataTable`（期間/商戶/Bet/GGR/佣金類型/佣金比例/佣金金額/結算狀態），`CurrencyAmount` 金額、`StatusTag`/`Tag` 狀態。
4. **子帳號 `Portal/SubAccounts.vue`**：`SectionCard` + `DataTable`（帳號/顯示名/角色/狀態/最後登入/建立時間）；標題依 `route.meta.portal`（代理子帳號 / 商戶子帳號）。

---

## 五、檔案清單

**新增**
- `src/views/Merchant/Profile.vue`、`src/views/Merchant/ApiWallet.vue`
- `src/views/Agent/Commissions.vue`
- `src/views/Portal/SubAccounts.vue`
- `src/mocks/handlers/subAccountAdmin.ts`

**修改**
- `src/mocks/handlers/agentAdmin.ts`（+ `/api/agents/v2/commissions` + SEED_COMMISSIONS）
- `src/mocks/handlers/index.ts`（註冊 subAccountAdminHandlers）
- `src/router/index.ts`（5 條 ONLY_DEFS 換真元件；擴 `SHARED_DEFS` +17 sub-page）
- `src/config/menu-sakai.ts`（`buildMenuForPortal` 加共用群組前綴轉換）
- `docs/handoff/backend.md`、`docs/handoff/api-contract.md`（新端點 scope + self-view 複用 trade-off）

**刪除**
- `src/views/_Placeholder/PortalPagePlaceholder.vue`（5 條路由全換真元件後不再被引用）

**H#3 擴 SHARED_DEFS 對照（path → 既有元件）**
`merchants/settings`→Merchants/Settings、`games/settings`→Games/Settings、`games/math`→Games/Math、`games/versions`→Games/Versions、`games/assets`→Games/Assets、`games/merchant-access`→Games/MerchantAccess、`orders/abnormal`→Orders/Abnormal、`transactions/abnormal`→Transactions/Abnormal、`reports/merchants`→Reports/Merchants、`reports/agents`→Reports/Agents、`reports/games`→Reports/Games、`reports/rtp`→Reports/Rtp、`risk/alerts`→Risk/Alerts、`risk/rules`→Risk/Rules、`risk/rule-builder`→Risk/RuleBuilder、`risk/cases`→Risk/Cases、`risk/actions`→Risk/Actions。titleKey 用各自既有 `menu.*` key。

---

## 六、驗證

每 task：`node node_modules/vite/bin/vite.js build`（見 `built in`）+ `node node_modules/vue-tsc/bin/vue-tsc.js --noEmit`（exit 0）。關鍵頁 preview 瀏覽器：

- **正向渲染**（三 portal）：merchant 商戶資料顯示 Golden Dragon 自己那筆；API錢包 secret 預設遮罩、點顯示才露；agent 佣金報表渲染；agent/merchant 子帳號渲染。
- **scope 筆數正確**：佣金報表 supplier 筆數 > agent(Asia Master) 筆數；子帳號 supplier > agent、supplier > merchant，且 agent/merchant 各只見自己的。
- **H#3**：agent/merchant 點任一選單條目 → URL 變成 `/agent/*`、`/merchant/*` 前綴、停在自己 portal、topbar 身份不變（不退回 supplier）；無死連結（含 sub-page 如 `/agent/reports/merchants`）。
- **反向守衛仍在**：沿用 Spec 1 手法（同 portal 內強制缺權角色 → `/403`）確認 `meta.permission` deny 未被破壞。
- 注意：dev server 長 session HMR 後 MSW 失同步 → hard reload 恢復（非 bug）。

---

## 七、Spec 2 邊界

- **Spec 2（本文件）**：5 真實頁 + 2 新端點（commissions / sub-accounts，scoped）+ 複用 merchants list 做 self-view + H#3（擴 SHARED_DEFS + 選單前綴轉換、不補 supplier meta.portal）+ 交接文件補登 + 刪佔位頁。
- **之後（非 Spec 2）**：H#1 token 大遷移、欄位級 canSeeField、pass-through 報表/聚合端點真 scope、憑證專屬 scoped 端點、RouteMeta 型別 augmentation（背景 chip）。
