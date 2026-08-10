# Provider Portal 頁面地圖

> 文件版本：0.2.0
> 更新日期：2026-08-08
> 狀態：Provider Portal 第一至六階段導覽、路由、頁面原型、文件地圖與整體驗證已完成；正式 API、權限與資料契約待確認

本文件是 Provider Portal 導覽、route、頁面責任與原型狀態的集中索引。頁面資料目前以既有原型展示資料或共用 Provider Placeholder mock data 呈現，不代表正式 API、權限、狀態碼、精度與後端資料契約已定稿。

## 1. 導覽階層

```text
總覽
└─ 儀表板                         /dashboard

遊戲管理
├─ 遊戲列表                       /games
├─ 環境與發布                     /games/environments
├─ 遊戲設定                       /games/settings
├─ 數值設定                       /games/math
├─ 遊戲版本                       /games/versions
└─ 遊戲素材                       /games/assets

數據與報表
└─ 遊戲紀錄                       /reports

遊戲商財務
├─ 財務總覽                       /finance
└─ 代理商 × 遊戲彙總              /finance/agent-games

遊戲監控與風控
├─ 監控總覽                       /monitoring
├─ 風控報表                       /monitoring/risk-reports
└─ 風控告警／處理                 /monitoring/alerts

GGAP 對接
├─ 對接總覽                       /ggap
├─ 遊戲目錄同步                   /ggap/catalog-sync
├─ 請求與回呼紀錄                 /ggap/requests
├─ 錯誤與重試                     /ggap/errors
└─ 對接設定                       /ggap/settings

通知中心
├─ 全部通知                       /notifications
└─ 通知偏好                       /notifications/preferences

官方網站
├─ 遊戲官網                       /website → /website/banners
│  ├─ Banner 管理                 /website/banners
│  ├─ 內容管理                     /website/content
│  └─ 發布紀錄                     /website/releases
└─ 遊戲大廳
   ├─ 大廳總覽                     /lobby
   ├─ 遊戲清單                     /lobby/games
   ├─ 遊戲管理                     /lobby/management
   ├─ DEMO環境數據                 /lobby/demo
   └─ 大廳預覽                     /lobby/preview

系統設定
├─ 設定總覽                       /settings
├─ 使用者與權限                   /settings/permissions
├─ API key 與憑證                 /settings/api-keys
└─ 操作紀錄                       /system/logs
```

目前主要導覽包含 32 個可進入的內容頁，以及 1 個會導向 Banner 管理的「遊戲官網」入口 route。舊版 legacy route 仍可直接存取或作為遷移參考，但不出現在主要導覽。

## 2. 頁面與 route

### 2.1 總覽

| 頁面 | Route | 功能責任 | 預計顯示內容 | 原型狀態 | Placeholder | 後續 API／資料契約 |
|---|---|---|---|---|---|---|
| 儀表板 | `/dashboard` | Provider 營運摘要與健康狀態入口 | 遊戲數量、正式上線、待處理告警、GGAP 健康、遊戲健康列表 | Phase 3 mock blueprint | 是 | Provider dashboard summary、game health、notification summary |

### 2.2 遊戲管理

| 頁面 | Route | 功能責任 | 預計顯示內容 | 原型狀態 | Placeholder | 後續 API／資料契約 |
|---|---|---|---|---|---|---|
| 遊戲列表 | `/games` | 管理 Provider 遊戲主資料與全域狀態 | 遊戲名稱、類型、版本、狀態、環境與操作 | 既有前端原型 | 否 | Provider games list、game status、environment summary |
| 遊戲版本 | `/games/versions` | 管理已建立的遊戲版本與啟用狀態 | 版本列表、版本狀態、環境啟用狀態與版本資訊 | 既有前端原型 | 否 | Game versions、deployment status、activation contract |
| 遊戲設定 | `/games/settings` | 管理遊戲基本設定 | 遊戲基本資料、展示設定與 Provider 運營設定入口 | 既有前端原型 | 否 | Game settings schema、update contract、audit event |
| 數值設定 | `/games/math` | 管理遊戲數學與數值規則入口 | RTP、點數規則、限紅、換算規則與規則版本 | 既有前端原型 | 否 | Math config、RTP、point rule、conversion rule |
| 遊戲素材 | `/games/assets` | 管理遊戲展示與營運素材 | 圖片、影片、圖示、素材狀態與版本關聯 | 既有前端原型 | 否 | Asset metadata、storage reference、publish status |
| 環境與發布 | `/games/environments` | 管理正式、DEMO、測試環境狀態與已部署版本啟用入口 | Production、DEMO、Test 狀態、版本、發布狀態與操作紀錄 | Phase 3 mock blueprint | 是 | Environment status、deployed versions、release action、audit event |

### 2.3 數據與報表

| 頁面 | Route | 功能責任 | 預計顯示內容 | 原型狀態 | Placeholder | 後續 API／資料契約 |
|---|---|---|---|---|---|---|
| 遊戲紀錄 | `/reports` | 查詢正式環境單筆 Game Round | 查詢條件、Game Round 列表、單筆詳情、CSV／XLSX 匯出與空資料狀態 | Provider Game Round 原型已完成 | 否 | Game Round list/detail、settled_at、status、point／USDT fields、export contract |

### 2.4 遊戲商財務

| 頁面 | Route | 功能責任 | 預計顯示內容 | 原型狀態 | Placeholder | 後續 API／資料契約 |
|---|---|---|---|---|---|---|
| 財務總覽 | `/finance` | 查看 Provider 正式環境財務摘要 | 查詢條件、八張摘要卡、財務趨勢、活躍度趨勢、遊戲表現排行與匯出入口 | 既有財務原型 | 否 | Finance summary、trend aggregation、GGR、point／USDT、export contract |
| 代理商 × 遊戲彙總 | `/finance/agent-games` | 依代理商 × 遊戲彙總 Provider Game Round | 摘要卡、查詢、彙總表格、排序、分頁、匯出欄位設定與空資料狀態 | 既有財務原型 | 否 | Aggregated Game Round、distinct players、GGR、point／USDT、export job |

財務頁面不建立獨立的 Game Round 財務明細頁。單筆 Game Round 詳情沿用既有 `/reports`「遊戲紀錄」頁面，避免形成兩套明細資料呈現。

### 2.5 遊戲監控與風控

| 頁面 | Route | 功能責任 | 預計顯示內容 | 原型狀態 | Placeholder | 後續 API／資料契約 |
|---|---|---|---|---|---|---|
| 監控總覽 | `/monitoring` | 彙整 Provider 遊戲與對接健康 | 五張監控摘要卡、遊戲健康列表、異常追蹤入口 | Phase 3 mock blueprint | 是 | Health metrics、Game Round success rate、latency、alert summary |
| 風控報表 | `/monitoring/risk-reports` | 查詢與分析 Provider 端異常數據 | 滾動時間、環境、五張摘要卡、待關注異常、Risk Event 列表與詳情 | 前端原型已完成（mock data） | 否 | Risk event query、summary、event detail、export |
| 風控告警／處理 | `/monitoring/alerts` | 追蹤告警與 Provider 應變處理 | 五張告警摘要、16 欄工作佇列、Alert 詳情、隔離／解除與 GGAP 通知操作、處理時間線 | 前端完整原型已完成（mock data） | 否 | Alert lifecycle、mitigation action、notification event、audit event |

### 2.6 GGAP 對接

| 頁面 | Route | 功能責任 | 預計顯示內容 | 原型狀態 | Placeholder | 後續 API／資料契約 |
|---|---|---|---|---|---|---|
| 對接總覽 | `/ggap` | 查看 Provider 與 GGAP 的整體對接健康 | 連線狀態、整體健康、同步／請求／回呼／錯誤摘要 | Phase 3 mock blueprint | 是 | Connection health、integration summary、endpoint status |
| 遊戲目錄同步 | `/ggap/catalog-sync` | 追蹤遊戲目錄同步狀態 | 同步狀態、最後同步時間、批次結果與目錄差異 | Phase 3 mock blueprint | 是 | Catalog sync job、last sync、delta、retry status |
| 請求與回呼紀錄 | `/ggap/requests` | 追蹤啟動、結算與 Callback 事件 | Launch、Settle、Callback、Round trace、回應結果與時間線 | Phase 3 mock blueprint | 是 | Request／callback event、idempotency、Round trace |
| 錯誤與重試 | `/ggap/errors` | 查看對接錯誤、重試與補送狀態 | 錯誤列表、重試佇列、補送狀態與失敗原因 | Phase 3 mock blueprint | 是 | Error event、retry policy、resend job、failure reason |
| 對接設定 | `/ggap/settings` | 管理 API、Endpoint 與憑證狀態展示 | API、Endpoint、憑證有效期、輪替時間與敏感值遮罩 | Phase 3 mock blueprint | 是 | Integration settings、credential rotation、secret masking |

### 2.7 通知中心

| 頁面 | Route | 功能責任 | 預計顯示內容 | 原型狀態 | Placeholder | 後續 API／資料契約 |
|---|---|---|---|---|---|---|
| 全部通知 | `/notifications` | Provider 站內通知集中檢視 | 通知列表、未讀狀態、類型與嚴重度篩選、通知偏好入口 | Phase 3 mock blueprint | 是 | Notification list、read state、severity、type filter |
| 通知偏好 | `/notifications/preferences` | 管理 Provider 使用者通知偏好入口 | 通知類型、嚴重度、站內／Email／摘要頻率 | Phase 3 mock blueprint | 是 | Notification preference、delivery channel、digest setting |

### 2.8 官方網站與遊戲大廳

| 頁面 | Route | 功能責任 | 預計顯示內容 | 原型狀態 | Placeholder | 後續 API／資料契約 |
|---|---|---|---|---|---|---|
| 遊戲官網入口 | `/website` | 官方網站下的遊戲官網入口 | 導向 Banner 管理 | Redirect to `/website/banners` | 否 | Route redirect only |
| Banner 管理 | `/website/banners` | 管理官網 Banner 與展示素材 | Banner 列表、預覽、狀態與發布入口 | 既有前端原型 | 否 | Website banner、asset、publish contract |
| 內容管理 | `/website/content` | 管理法務與聯絡資訊內容 | 條款、隱私權、負責任遊戲、聯絡資訊與語系內容 | 既有前端原型 | 否 | Website content、locale、draft／publish contract |
| 發布紀錄 | `/website/releases` | 查看官網內容與版本發布狀態 | 發布紀錄、版本、環境與發布狀態 | 既有前端原型 | 否 | Website release、version、audit event |
| 大廳總覽 | `/lobby` | 查看遊戲大廳公開內容與狀態摘要 | 大廳內容摘要、玩家狀態與預覽入口 | 既有前端原型 | 否 | Lobby summary、public game data、status API |
| 遊戲清單 | `/lobby/games` | 管理大廳公開遊戲清單 | 公開遊戲資料、上架狀態與展示順序 | 既有前端原型 | 否 | Lobby game catalog、display order、status |
| 遊戲管理 | `/lobby/management` | 管理大廳遊戲展示狀態 | 玩家狀態、展示設定與公開狀態入口 | 既有前端原型 | 否 | Lobby game management、player state、publish status |
| DEMO環境數據 | `/lobby/demo` | 查看隔離 DEMO 環境的展示統計 | DEMO 玩家、Session、投注、遊玩時間與環境說明 | 既有前端原型 | 否 | Isolated DEMO analytics、session summary、demo data |
| 大廳預覽 | `/lobby/preview` | 預覽遊戲大廳對外展示效果 | 桌面／行動預覽、遊戲卡與公開狀態 | 既有前端原型 | 否 | Preview data、responsive presentation、asset reference |

官方網站與遊戲大廳目前不新增活動功能。活動、公告或遊戲內活動若未來需要，必須另立規格確認責任邊界。

### 2.9 系統設定

| 頁面 | Route | 功能責任 | 預計顯示內容 | 原型狀態 | Placeholder | 後續 API／資料契約 |
|---|---|---|---|---|---|---|
| 設定總覽 | `/settings` | Provider 系統設定入口 | Provider 設定摘要與設定模組入口 | 既有前端原型 | 否 | Provider settings、timezone、locale |
| 使用者與權限 | `/settings/permissions` | Provider 使用者、角色與權限入口 | 使用者、角色、權限範圍與狀態 | 既有前端原型 | 否 | Provider user、role、permission、tenant scope |
| API key 與憑證 | `/settings/api-keys` | 管理 Provider API key 與憑證入口 | API key、憑證狀態、遮罩與輪替入口 | 既有前端原型 | 否 | API key lifecycle、credential rotation、secret masking |
| 操作紀錄 | `/system/logs` | 查看 Provider 操作與稽核事件 | 操作人、事件、資源、時間與結果 | 既有前端原型 | 否 | Audit log、actor、resource、event payload |

## 3. 原型狀態摘要

| 狀態 | 數量 | 說明 |
|---|---:|---|
| 已完成內容頁原型 | 22 | 遊戲管理保留頁、遊戲紀錄、財務、官網、大廳、風控報表、風控告警／處理與系統設定頁 |
| Phase 3 mock blueprint Placeholder | 10 | 儀表板、環境發布、監控、GGAP 對接與通知頁 |
| 導覽入口 redirect | 1 | `/website` 導向 `/website/banners` |

## 4. 不屬於 Provider Portal 的功能範圍

- 平台錢包、Provider wallet、代理商錢包與會員錢包。
- 代理商、商戶、會員主資料管理與會員清單。
- GGAP 平台交易、平台結算、平台對帳與對帳匹配狀態。
- 代理商逐一開關遊戲的 Provider 控制台。
- 獨立的 Game Round 財務明細頁；單筆資料沿用 `/reports`「遊戲紀錄」。
- 獨立跨機台 Jackpot 管理。
- Provider 專屬活動、官網活動與遊戲內活動管理。
- 測試環境的上下架、版本更新或正式發布操作；測試環境只提供監控。

## 5. 文件與 API 待辦

- 以各頁正式 API、資料欄位、狀態碼、錯誤格式與 Provider scope 契約取代 mock data。
- 確認 Provider 內部角色、permission key、操作確認與 audit event。
- 確認點數精度、USDT 換算、GGR 正負方向與報表資料版本。
- 確認 GGAP 對接的簽章、冪等、Callback、重試與補送規則。
- 確認官網與遊戲大廳的內容、素材、發布、語系與 DEMO API。
