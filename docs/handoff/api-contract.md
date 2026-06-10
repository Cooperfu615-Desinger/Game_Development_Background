# API 契約總表（Phase C1）

本表是全部 mock 端點的單一索引：每個端點對應的 **method**、**所需 permission**、以及 **C1 的 scope 行為**。

- 「所需 permission」依第 4 節的角色權限推導（list 類給合理的 view 權限，mutation 給 create/edit/lock 等；無對應的權限以 `—` 標示）。這是建議值，供後端做 API 層授權時參照。
- 「C1 scope 行為」：已套 scope 的 7 個端點標明過濾鍵與行為；其餘標「C1 未套 scope（pass-through）」。
- 路徑中的 `:id` / `:gameId` 為路徑參數。

---

## 已套 scope 的端點（7 個）

| endpoint | method | 所需 permission | C1 scope 行為 |
|---|---|---|---|
| `/api/merchants/v2/list` | GET | `merchants.view` | scope 過濾（agentKey:`agent` / merchantKey:`code`）：all / own-agent-line / own-merchant |
| `/api/orders/v2/list` | GET | `orders.view` | scope 過濾（merchantKey:`merchant`）：own-merchant 過濾；own-agent-line pass-through |
| `/api/orders/v2/abnormal` | GET | `orders.view` | scope 過濾（merchantKey:`merchant`）：own-merchant 子集；own-agent-line pass-through |
| `/api/transactions/v2/list` | GET | `transactions.view` | scope 過濾（merchantKey:`merchant`）：own-merchant 過濾；own-agent-line pass-through |
| `/api/transactions/v2/abnormal` | GET | `transactions.view` | scope 過濾（merchantKey:`merchant`）：own-merchant 子集；own-agent-line pass-through |
| `/api/risk/v2/alerts` | GET | `risk.view` | scope 過濾（merchantKey:`merchant`）：own-merchant 過濾；own-agent-line pass-through |
| `/api/risk/v2/cases` | GET | `risk.view` | scope 過濾（merchantKey:`merchant`）：own-merchant 過濾；own-agent-line pass-through |

---

## 其餘端點（C1 未套 scope）

### GET

| endpoint | method | 所需 permission | C1 scope 行為 |
|---|---|---|---|
| `/api/agents/v2/list` | GET | `agents.view` | C1 未套 scope（pass-through） |
| `/api/aggregators` | GET | `—` | C1 未套 scope（pass-through） |
| `/api/aggregators/:id` | GET | `—` | C1 未套 scope（pass-through） |
| `/api/aggregators/:id/games` | GET | `—` | C1 未套 scope（pass-through） |
| `/api/analytics/arpu` | GET | `—` | C1 未套 scope（pass-through） |
| `/api/analytics/overview` | GET | `—` | C1 未套 scope（pass-through） |
| `/api/analytics/retention` | GET | `—` | C1 未套 scope（pass-through） |
| `/api/dashboard/v2/kpis` | GET | `dashboard.view` | C1 未套 scope（聚合，best-effort pass-through） |
| `/api/dashboard/v2/merchant-rank` | GET | `dashboard.view` | C1 未套 scope（聚合，best-effort pass-through） |
| `/api/dashboard/v2/revenue-trend` | GET | `dashboard.view` | C1 未套 scope（聚合，best-effort pass-through） |
| `/api/dashboard/v2/risk-alerts` | GET | `dashboard.view` | C1 未套 scope（聚合，best-effort pass-through） |
| `/api/finance/invoices` | GET | `—` | C1 未套 scope（pass-through） |
| `/api/finance/settlements` | GET | `settlements.view` | C1 未套 scope（pass-through） |
| `/api/finance/settlements/:id` | GET | `settlements.view` | C1 未套 scope（pass-through） |
| `/api/finance/transactions` | GET | `transactions.view` | C1 未套 scope（pass-through） |
| `/api/games` | GET | `games.view` | C1 未套 scope（pass-through） |
| `/api/games/:id` | GET | `games.view` | C1 未套 scope（pass-through） |
| `/api/games/v2/assets` | GET | `games.view` | C1 未套 scope（pass-through） |
| `/api/games/v2/list` | GET | `games.view` | C1 未套 scope（pass-through） |
| `/api/games/v2/math` | GET | `games.view` | C1 未套 scope（pass-through） |
| `/api/games/v2/merchant-access` | GET | `games.view` | C1 未套 scope（pass-through） |
| `/api/games/v2/settings` | GET | `games.view` | C1 未套 scope（pass-through） |
| `/api/games/v2/versions` | GET | `games.view` | C1 未套 scope（pass-through） |
| `/api/jackpot/v2/list` | GET | `—` | C1 未套 scope（pass-through） |
| `/api/jackpot/v2/payouts` | GET | `—` | C1 未套 scope（pass-through） |
| `/api/jackpot/v2/settings` | GET | `—` | C1 未套 scope（pass-through） |
| `/api/jackpot/v2/transactions` | GET | `—` | C1 未套 scope（pass-through） |
| `/api/platforms` | GET | `—` | C1 未套 scope（pass-through） |
| `/api/platforms/:id` | GET | `—` | C1 未套 scope（pass-through） |
| `/api/platforms/:id/players` | GET | `—` | C1 未套 scope（pass-through） |
| `/api/platforms/:id/stats` | GET | `—` | C1 未套 scope（pass-through） |
| `/api/platforms/:id/trend` | GET | `—` | C1 未套 scope（pass-through） |
| `/api/players` | GET | `—` | C1 未套 scope（pass-through） |
| `/api/players/:id` | GET | `—` | C1 未套 scope（pass-through） |
| `/api/reports/v2/agents` | GET | `reports.view` | C1 未套 scope（聚合，best-effort pass-through） |
| `/api/reports/v2/games` | GET | `reports.view` | C1 未套 scope（聚合，best-effort pass-through） |
| `/api/reports/v2/merchants` | GET | `reports.view` | C1 未套 scope（聚合，best-effort pass-through） |
| `/api/reports/v2/overview` | GET | `reports.view` | C1 未套 scope（聚合，best-effort pass-through） |
| `/api/reports/v2/rtp` | GET | `reports.view` | C1 未套 scope（聚合，best-effort pass-through） |
| `/api/risk/v2/actions` | GET | `risk.view` | C1 未套 scope（pass-through） |
| `/api/risk/v2/overview` | GET | `risk.view` | C1 未套 scope（聚合，best-effort pass-through） |
| `/api/risk/v2/rules` | GET | `risk.view` | C1 未套 scope（pass-through） |
| `/api/settings/api-keys` | GET | `—` | C1 未套 scope（pass-through） |
| `/api/settings/permissions` | GET | `—` | C1 未套 scope（pass-through） |
| `/api/settlements/v2/detail/:id` | GET | `settlements.view` | C1 未套 scope（pass-through） |
| `/api/settlements/v2/list` | GET | `settlements.view` | C1 未套 scope（pass-through） |
| `/api/system/v2/admins` | GET | `—` | C1 未套 scope（pass-through） |
| `/api/system/v2/approvals` | GET | `—` | C1 未套 scope（pass-through） |
| `/api/system/v2/currencies` | GET | `—` | C1 未套 scope（pass-through） |
| `/api/system/v2/languages` | GET | `—` | C1 未套 scope（pass-through） |
| `/api/system/v2/logs` | GET | `—` | C1 未套 scope（pass-through） |
| `/api/system/v2/roles` | GET | `—` | C1 未套 scope（pass-through） |

### POST

| endpoint | method | 所需 permission | C1 scope 行為 |
|---|---|---|---|
| `/api/login` | POST | `—`（公開：登入端點） | C1 未套 scope（pass-through） |
| `/api/settings/api-keys` | POST | `—`（建議 `settings` 類管理權限） | C1 未套 scope（pass-through） |
| `/api/aggregators` | POST | `—` | C1 未套 scope（pass-through） |

### PATCH

| endpoint | method | 所需 permission | C1 scope 行為 |
|---|---|---|---|
| `/api/aggregators/:id/games/:gameId` | PATCH | `—` | C1 未套 scope（pass-through） |
| `/api/aggregators/:id/status` | PATCH | `—` | C1 未套 scope（pass-through） |
| `/api/games/:id` | PATCH | `games.edit` | C1 未套 scope（pass-through） |

### DELETE

| endpoint | method | 所需 permission | C1 scope 行為 |
|---|---|---|---|
| `/api/settings/api-keys/:id` | DELETE | `—`（建議 `settings` 類管理權限） | C1 未套 scope（pass-through） |

---

## 補充說明

- **scope 行為的權威定義**見 `backend.md`（含過濾鍵對照、own-agent-line 在 order/risk 端點為 pass-through 的原因、aggregate 端點需依 scope 重算）。
- **未遷移 token 的呼叫**見 `frontend.md` 的已知限制 H#1：部分前端呼叫（含上表中 aggregators、platforms、players、finance、analytics 相關端點，及 api-keys DELETE / aggregators PATCH）目前仍用原生 `fetch`、**不帶 bearer token**。啟用真 auth 前必須遷移到 `api.*`，否則會 401；其中 PATCH 需在 `apiClient` 補 `patch` 方法。
- 「所需 permission」為依角色矩陣推導的建議值，非程式中既有設定（C1 路由未設 `meta.permission`）。後端應以此為基準在 API 層強制授權。
