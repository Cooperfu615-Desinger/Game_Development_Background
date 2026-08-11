# 前端交接文件：Provider Portal

> 狀態日期：2026-08-11
> 文件狀態：Provider Portal 第一至六階段導覽、頁面原型、風控報表與風控告警／處理原型、Placeholder blueprint、文件地圖與整體驗證已完成；正式 API、權限與資料契約待確認

本文件說明目前前端實際結構、目前仍存在的舊原型邊界，以及下一階段調整原型時應遵循的方向。

產品範圍、導覽、版型與風控依據：[`PROVIDER_PORTAL_SPEC.md`](../PROVIDER_PORTAL_SPEC.md)、[`PROVIDER_PORTAL_NAVIGATION_SPEC.md`](../PROVIDER_PORTAL_NAVIGATION_SPEC.md)、[`PROVIDER_PORTAL_UI_LAYOUT_SPEC.md`](../PROVIDER_PORTAL_UI_LAYOUT_SPEC.md)、[`PROVIDER_RISK_CONTROL_SPEC.md`](../PROVIDER_RISK_CONTROL_SPEC.md)、[`PROVIDER_RISK_REPORT_SPEC.md`](../PROVIDER_RISK_REPORT_SPEC.md)、[`PROVIDER_RISK_ALERT_HANDLING_SPEC.md`](../PROVIDER_RISK_ALERT_HANDLING_SPEC.md)。

## 1. 前端定位

前端是遊戲商的 Provider Portal 原型，不負責實作 GGAP 的代理商、商戶或會員後台。現有程式仍保留三 Portal 代碼，這些內容只代表歷史原型，不代表新版產品範圍。

新版前端的主要工作面向：

- Provider 遊戲主資料、版本、資產、規則與上下架
- Game Round 查詢與遊戲商財務 / 報表
- 遊戲監控、異常與風控告警；事件定義與嚴重度依 [`PROVIDER_RISK_CONTROL_SPEC.md`](../PROVIDER_RISK_CONTROL_SPEC.md)
- GGAP 對接狀態與通知
- 遊戲官網與遊戲大廳內容管理
- Provider 內部系統設定與權限

## 2. 主要目錄

| 路徑 | 用途 | 目前狀態 |
|---|---|---|
| `src/views/` | 頁面 | 含舊版及可重用的原型頁 |
| `src/components/` | 共用 UI 與圖表元件 | 可沿用，但新增頁面需遵循 PrimeVue 4 |
| `src/composables/` | 頁面資料與互動邏輯 | 部分仍以舊平台 / 代理 / 商戶命名 |
| `src/stores/` | Pinia 狀態 | auth、portal、permission、ui；portal store 後續需簡化 |
| `src/router/` | Vue Router 路由 | 目前仍有舊三 Portal 與大量 legacy route |
| `src/config/menu-sakai.ts` | 側邊導覽 | 已建立 Provider 目標導覽；仍保留部分舊版入口相容 |
| `src/services/apiClient.ts` | API 單一出口 | 目前已支援 GET / POST / PUT / PATCH / DELETE |
| `src/mocks/handlers/` | MSW mock API | 只供原型展示，不是正式 API 契約 |
| `src/views/GameLobby/` | 遊戲大廳頁面與展示資料 | 已建立五個前端原型入口；正式資料與 DEMO API 待接 |
| `src/views/GameWebsite/` | 遊戲官網頁面與展示資料 | 已建立三個前端原型入口；正式內容、素材與發布 API 待接 |
| `src/views/Finance/Overview.vue` | 遊戲商財務總覽 | 已建立 `/finance` 原型；正式 Game Round 聚合、玩家去重與財務 API 待接 |
| `src/views/Finance/AgentGames.vue` | 代理商 × 遊戲彙總 | 已完成 `/finance/agent-games` 原型；正式 API、匯出服務與後續資料契約待接 |
| `src/views/Provider/RiskReports.vue` | 風控報表 | 已完成 `/monitoring/risk-reports` 唯讀前端原型；正式 Risk Event query、summary、detail 與 export API 待接 |
| `src/views/Provider/RiskAlerts.vue` | 風控告警／處理 | 已完成 `/monitoring/alerts` 操作工作台 mock 原型；正式 Alert lifecycle、mitigation、通知、audit 與權限 API 待接 |
| `src/views/Provider/Placeholder.vue` | Provider Placeholder 共用頁面骨架 | 已為 10 個 route 配置群組專屬 mock blueprint；風控報表與風控告警／處理已改由獨立頁面承接 |
| `src/views/Docs/` | 文件檢視器 | 目前主要載入 `docs/handoff/*.md` |

## 3. 目前路由實況

目前仍存在下列 legacy route 群組：

- `/dashboard`
- `/aggregators/*`
- `/games/*`
- `/platforms/*`
- `/agents/*`
- `/merchants/*`
- `/players/*`
- `/orders/*`
- `/transactions/*`
- `/reports/*`
- `/settlements/*`
- `/risk/*`
- `/jackpots/*`
- `/system/*`
- `/settings/*`
- `/agent/*`、`/merchant/*`

這些路由先不在本文件中宣告為新版主要導覽已完成。它們仍可作為相容或遷移參考，但不應再從 Provider 主要選單新增入口。

目前已建立的 Provider 目標頁面：

- `/reports`：Provider Game Round 明細，支援查詢、排序、分頁、詳情與 CSV / XLSX 匯出。
- `/finance`：遊戲商財務總覽，包含時間 / 代理商 / 遊戲類型 / 遊戲篩選、八項統計卡片、兩組趨勢圖與遊戲表現排行。
- `/finance/agent-games`：代理商 × 遊戲彙總，包含完整結果摘要、欄位排序、分頁、空資料狀態、自訂匯出欄位與導入 `/reports`。
- `/monitoring/risk-reports`：風控報表前端原型，包含 Production／DEMO 單選、近 1／3／5 日與自訂時間、五張摘要卡 Tips、待關注異常、常用／進階查詢、15 欄 Risk Event 列表與大型唯讀詳情；使用 mock data。由 Alert 詳情帶入 `risk_event_id` 時會自動切換事件環境並開啟對應詳情，同頁 query 變更會重新定位，無效 ID 顯示明確錯誤；詳情只在有 Alert 時提供 `/monitoring/alerts` 導向。
- `/monitoring/alerts`：風控告警／處理前端原型，包含五張動態摘要卡與快捷篩選、Production／DEMO、主要／進階查詢、16 欄優先工作佇列、分頁、完整匯出入口、query 導入、Alert 詳情、Risk Event／請求紀錄／Game Round 導向、健康檢查、時間線與 11 項 mock 操作。摘要卡快捷篩選會回到有效 Alert 範圍並清除互斥條件；篩選器的 `__unassigned__` 只作為未指派查詢 sentinel，不是正式 `assignee` 值。操作只更新前端狀態，不接正式 API。
- `/monitoring/alerts` 的一般畫面、表格、摘要卡、詳情與操作 Dialog 已沿用風控報表的繁體中文術語；篩選選項保留中文／英文對照，技術 ID、API 路徑、錯誤碼、版本號與正式欄位值保持原樣，mock 健康檢查、請求紀錄、錯誤訊息與時間線的可見敘述已中文化。
- `/lobby`、`/lobby/games`、`/lobby/management`、`/lobby/demo`、`/lobby/preview`：遊戲大廳五個前端原型入口。
- `/website/banners`、`/website/content`、`/website/releases`：遊戲官網三個前端原型入口；`/website` 會導向 Banner 管理。
- `/dashboard`、`/games/environments`、`/monitoring`、`/ggap/*`、`/notifications/*`：10 個 Provider Placeholder blueprint 入口，依頁面成熟度顯示說明區塊、mock 摘要、展示列表、空資料狀態與 API 待接說明；風控報表與風控告警／處理已替換為獨立內容原型。

上述頁面目前以原型展示資料呈現，正式 API、權限、狀態碼、精度與錯誤處理仍待確認。完整頁面清單見 [`PROVIDER_PORTAL_PAGE_MAP.md`](../PROVIDER_PORTAL_PAGE_MAP.md)。

## 3.1 頁面版型

- 1500px 寬版頁、無固定最大寬度頁與 Placeholder 說明區塊的使用規則，統一見 [`PROVIDER_PORTAL_UI_LAYOUT_SPEC.md`](../PROVIDER_PORTAL_UI_LAYOUT_SPEC.md)。
- 新增頁面前先判斷內容型態與寬度類別；不要複製既有頁面的 `max-width`，也不要在已具備主要內容的頁面保留重複說明區塊。

## 4. 目標導覽對應

| Provider 導覽 | 頁面範圍 | 實作建議 |
|---|---|---|
| 總覽 | Provider 遊戲數、上架狀態、投注 / GGR、異常通知 | `/dashboard` 已有 mock blueprint；後續接 Provider 指標與健康 API |
| 遊戲管理 | 遊戲列表、環境與發布、設定、數值、版本、素材 | 既有遊戲頁面保留；`/games/environments` 先使用 Placeholder blueprint |
| 數據與報表 | `/reports` 遊戲紀錄、Provider 聚合報表 | 不再以平台 / 商戶報表作為主入口；不建立獨立 Game Round 財務明細 |
| 遊戲大廳 | 大廳總覽、遊戲清單、遊戲管理、DEMO環境數據、大廳預覽 | 已建立 `/lobby/*` 五頁原型；後續接正式遊戲資料、狀態與 DEMO API |
| 遊戲商財務 | `/finance` 財務總覽、`/finance/agent-games` 代理商 × 遊戲彙總 | 財務兩頁原型已完成；單筆 Game Round 沿用 `/reports` 遊戲紀錄，不建立第二套明細 |
| 遊戲監控與風控 | 監控總覽、風控報表、風控告警／處理 | `/monitoring` 仍為 Placeholder；`/monitoring/risk-reports` 與 `/monitoring/alerts` 已完成獨立 mock 原型，後續接健康、Risk Event、Alert 與操作 API |
| GGAP 對接 | 對接總覽、目錄同步、請求回呼、錯誤重試、對接設定 | `/ggap/*` 已建立群組專屬 Placeholder blueprint，取代 `/aggregators` 的平台管理語意 |
| 通知中心 | 全部通知、通知偏好 | `/notifications/*` 已建立群組專屬 Placeholder blueprint，後續接站內通知 API |
| 官方網站 | 遊戲官網 Banner、法務與聯絡資訊、發布與版本紀錄；遊戲大廳為同一主選單下的獨立子導覽 | 已建立 `/website/*` 三頁原型；公告與活動暫不納入現階段，與 GGAP 平台功能分離 |
| 系統設定 | Provider 使用者、權限、API key、操作紀錄 | `/settings/*` 與 `/system/logs` 既有頁面保留，route title 已統一為 Provider 設定名稱 |

### 不應出現在 Provider 主要選單

- 代理商管理
- 商戶管理
- 會員管理
- 平台管理
- Provider 錢包
- 獨立 Jackpot 管理
- GGAP 平台對帳狀態

GGAP 對已上架遊戲依代理商開啟 / 關閉的功能，屬 GGAP 的代理商側能力。Provider Portal 可以顯示同步或對接狀態，但不應把代理商逐一開關當成遊戲商主資料控制。

## 5. API client

```ts
import { api } from '@/services/apiClient'

const response = await api.get<GameRow[]>('/api/provider/v1/games')
await api.patch('/api/provider/v1/games/game-001', { status: 'published' })
```

目前 `apiClient` 的行為：

- 從 `authStore.token` 自動附加 `Authorization: Bearer <token>`。
- JSON body 自動設定 `Content-Type` 與序列化。
- 非 2xx 回應會拋出 `Error`。
- 回傳內容直接解析為 JSON，不會自動包成 `{ code, data }`。
- 目前 mock 路徑仍是 `/api/*`；`/api/provider/v1/*` 是待後端確認的目標命名，不代表已實作。

頁面資料請優先使用 `api.*`。接真後端前，需持續清查仍直接使用 `fetch` 或 `window.fetch` 的頁面，避免漏帶正式 token。

## 6. 認證與權限現況

目前 `authStore` 與 `portalStore` 仍會建立 supplier / agent / merchant mock identity；這是舊原型相容層，下一階段應改為：

- 單一 Provider Portal 身份
- Provider 內部角色與 permission
- Provider tenant / provider_id 資料範圍
- 後端簽發與驗證的正式 token

前端 `hasPermission` 只控制 UX 顯示，正式授權與資料過濾必須由後端強制執行。

## 7. Game Round 與報表畫面原則

目前 `src/views/Reports/ProviderGameRounds.vue` 已作為 `/reports` 的 Provider Game Round 原型頁，包含日期、遊戲、代理商、Round、外部 Round、會員與狀態篩選，預設依 `settled_at` 排序，並提供明細視窗及 CSV / XLSX 匯出。頁面已呈現 Provider 點數、USDT、換算率 / 規則、狀態與時間欄位；正式回應格式、資料精度、權限與錯誤處理仍待後端契約確認。

- Game Round 是主要明細單位，不新增 Game Session 導覽。
- slots / 單人 Crash 主要顯示 `settled_at`；棋牌可顯示 `started_at` 與 `settled_at`。
- 點數為主要顯示值，USDT 為可展開或匯出的換算值。
- 平均投注額、人均投注額等公式需由欄位旁 info tooltip 顯示。
- 報表是 Provider 自己整合的統計，不顯示 GGAP 對帳狀態。

遊戲大廳 DEMO環境數據中的 Session 只代表展示用的統計欄位，不建立獨立的 Game Session 模組。

目前 `src/views/Finance/Overview.vue` 的財務總覽只使用正式環境 mock data。日期範圍與圖表粒度具備原型操作，正式版本仍需接入 Game Round 聚合 API，並由後端提供不重複玩家數、GGR 定義、USDT 換算結果與報表資料版本。詳細頁面規格見 [`GAME_VENDOR_FINANCE_OVERVIEW_SPEC.md`](../GAME_VENDOR_FINANCE_OVERVIEW_SPEC.md)。財務單筆資料沿用 `/reports` 遊戲紀錄，不另建財務明細頁。

代理商 × 遊戲彙總的規格見 [`GAME_VENDOR_FINANCE_AGENT_GAME_SPEC.md`](../GAME_VENDOR_FINANCE_AGENT_GAME_SPEC.md)。目前已完成前端原型，承接財務總覽的近 7 日預設範圍與篩選條件，提供摘要、彙總列表、自訂匯出、分頁、空資料狀態，以及導入既有 `/reports` Game Round 明細頁的入口。正式 API、匯出服務與後續資料契約仍待接入確認。

## 8. 文件檢視器注意事項

目前文件檢視器是透過 `import.meta.glob` 收錄 `docs/handoff/*.md`。封存文件移至 `docs/archive/` 後，不會被當作現行 handoff 載入；若未來需要查閱封存內容，應另加明確的 archive 入口，不要混入現行文件清單。

## 9. 驗證方式

```bash
npm run build
npm run type-check
npm run dev
```

目前沒有單元測試框架。原型變更至少需完成 `git diff --check`、build、type-check，以及桌機 / 行動尺寸的頁面抽查。
