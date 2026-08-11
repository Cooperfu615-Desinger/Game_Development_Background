# 專案現況總覽 / Project Status

> 狀態日期：2026-08-11
> 目前分支：`main`
> 文件狀態：Provider Portal 第一至六階段導覽、監控／風控獨立 mock 原型、文件地圖與整體驗證已完成；正式 API、權限、監控門檻、更新頻率與後端資料契約待確認

## 1. 產品定位

本專案是 GGAP 的其中一個 **Provider Portal**，使用者是遊戲商團隊。它的用途是協助遊戲商管理自己的遊戲、接收 GGAP 遊戲請求、保存 Game Round，以及查看遊戲商自己的監控與財務報表。

### 遊戲商負責

- 遊戲主資料、遊戲類型、版本與資產
- 遊戲規則、RTP、點數規則與限紅
- 遊戲全域上下架與維護狀態
- 接收 GGAP 提供的代理商、會員與幣別脈絡
- 保存完整 Game Round 與遊戲商點數 / USDT 資料
- 遊戲數據、遊戲商財務、監控與風控報表
- 遊戲官網 Banner、法務內容、聯絡資訊與發布紀錄
- 遊戲大廳公開遊戲資料、玩家狀態、DEMO 試玩與大廳預覽

### GGAP 負責

- 聚合平台、代理商、商戶與會員側的平台能力
- 代理商與會員的登入、錢包、交易與平台帳務
- 將下游金額轉換為代理商或商戶使用的金額
- 對已由遊戲商上架的遊戲，依代理商個別開啟或關閉
- GGAP 自身的財務、結算與平台風控

遊戲商不建立自己的錢包、代理商錢包或會員錢包，也不把代理商 / 商戶管理當作 Provider Portal 的主要功能。

## 2. 目前原型狀態

目前程式仍保留早期三 Portal legacy code，但主要工作區已切換為 Provider Portal 目標導覽，並完成 32 個導覽內容頁的 route、第一至六階段前端原型、文件同步與整體驗證；其中 23 個頁面已有完整內容原型、9 個頁面使用共用 Provider Placeholder mock blueprint，監控總覽、風控報表與風控告警／處理皆為獨立完整內容頁。它目前適合用於規格討論與畫面確認，不是正式營運系統。

| 項目 | 現況 |
|---|---|
| 前端 | Vue 3 + TypeScript + Vite + PrimeVue 4 |
| 後端 | 尚未接入真實後端；目前使用 MSW mock handlers |
| 認證 | mock token，尚未接真實登入與 JWT 驗證 |
| 資料 | mock / faker 資料，不代表正式資料模型 |
| Portal | 舊版 supplier / agent / merchant 三 Portal 架構仍在程式中 |
| 遊戲資料 | 已有遊戲清單、詳情、數學、版本、資產等原型頁 |
| 報表 | 已有舊版平台 / 代理 / 商戶導向報表，需重新定義為 Provider 報表 |
| Game Round | `/reports` 已建立 Provider Game Round 頁面，包含查詢、排序、分頁、詳情與 CSV / XLSX 匯出；正式 API 與資料契約仍待確認 |
| 監控總覽 | `/monitoring` 已完成獨立唯讀 mock 原型，具備期間 GGAP mock samples、五張摘要卡、列表、詳情、來源失敗狀態與跨頁導向；正式監控 API、警戒門檻與更新頻率待接 |
| Provider Placeholder | `/dashboard`、`/games/environments`、`/ggap/*`、`/notifications/*` 共 9 頁使用群組專屬 mock blueprint、摘要卡、展示列表與空資料狀態；監控總覽與兩個風控頁不再使用 Placeholder |
| 通知中心 | `/notifications`、`/notifications/preferences` 已有通知列表與偏好原型骨架，正式通知功能尚未完成 |
| 遊戲大廳 | 已建立 `/lobby`、`/lobby/games`、`/lobby/management`、`/lobby/demo`、`/lobby/preview` 五個前端原型頁 |
| 遊戲官網 | 已建立 `/website/banners`、`/website/content`、`/website/releases` 三個前端原型頁；`/website` 會導向 Banner 管理 |

### 原型規模快照

以下數量是目前程式結構的規模參考，不代表已完成的產品功能數量：

- `src/views/`：73 個 Vue view 檔案
- `src/router/`：包含舊版 supplier / agent / merchant 路由
- `src/mocks/handlers/`：17 個 mock handler 模組
- Pinia store：auth、portal、permission、ui 等 4 個主要 store

## 3. 目標導覽與實作狀態

| 目標導覽 | 目前原型 | 後續處理 |
|---|---|---|
| 總覽 | `/dashboard` | Phase 3 mock blueprint，後續接 Provider 指標與健康 API |
| 遊戲管理 | `/games`、`/games/environments`、`/games/settings`、`/games/math`、`/games/versions`、`/games/assets` | 遊戲管理既有頁面保留；環境與發布先以 Placeholder blueprint 承接 |
| 數據與報表 | `/reports` 已是 Provider 遊戲紀錄頁 | 持續確認 Game Round API、聚合報表與正式資料契約；不建立獨立 Game Round 財務明細頁 |
| 遊戲商財務 | `/finance` 財務總覽與 `/finance/agent-games` 代理商 × 遊戲彙總前端原型已完成；舊 `/finance/settlements`、`/finance/reconciliation`、`/finance/transactions` 仍保留 | 待接正式 API 與後續資料契約，確認 Game Round 聚合、點數 / USDT、不重複玩家數與 GGR；不建立平台錢包 |
| 遊戲監控與風控 | `/monitoring`、`/monitoring/risk-reports`、`/monitoring/alerts` | 三頁皆已完成獨立 mock 原型；後續接健康、Game Round、GGAP、Risk Event、Alert、操作與權限 API，並確認正式警戒門檻與更新頻率 |
| GGAP 對接 | `/ggap`、`/ggap/catalog-sync`、`/ggap/requests`、`/ggap/errors`、`/ggap/settings` | 已建立對接 mock blueprint，取代 `/aggregators` 的平台管理語意 |
| 通知中心 | `/notifications`、`/notifications/preferences` | 已建立通知列表與偏好 mock blueprint，後續接站內通知 API |
| 官方網站 | `官方網站 > 遊戲官網` 已有 Banner 管理、法務與聯絡資訊、發布與版本紀錄三頁原型；同群組下另有遊戲大廳 | 後續接正式內容、圖片、發布、版本與權限功能；公告與活動暫不納入 |
| 系統設定 | `/settings`、`/settings/permissions`、`/settings/api-keys`、`/system/logs` | 既有設定頁面保留，route title 已統一為 Provider 設定名稱 |

完整 route、責任、預計內容、原型狀態與 API 待辦見 [`PROVIDER_PORTAL_PAGE_MAP.md`](../PROVIDER_PORTAL_PAGE_MAP.md)。

以下功能目前不列入新版主要導覽：代理商管理、商戶管理、會員管理、平台管理、獨立獎池管理、遊戲商自有活動。獎池與活動未來若有明確需求，再另立規格。

## 4. 已確認的資料方向

### Game Round 是主要業務單位

- 不建立獨立的 Game Session 模組。
- 不建立獨立的 Game Round 財務明細頁；財務頁單筆詳情沿用 `/reports`「遊戲紀錄」。
- 老虎機與目前單人 Crash Game 以一筆結算完成的 Game Round 為主。
- 棋牌類型可保留 `started_at` 與 `settled_at`；老虎機 / 單人 Crash 仍以 `settled_at` 為主要時間。
- 未來多人 Crash 或多人玩法才增加共享局號與參與者關係，不改變單人玩法的基本記錄模型。

### 金額與報表

- GGAP 與遊戲商之間以 USDT 為主要標準幣別。
- 遊戲商點數是遊戲內計算單位，換算規則與限紅由遊戲商定義。
- 報表主要顯示遊戲商點數；需要時可查看換算後的 USDT。
- 匯出資料同時包含點數與 USDT 欄位。
- 主要聚合維度為時間、代理商、遊戲；指標包含投注筆數、玩家人數、投注總額、平均投注額、人均投注額、輸贏與 GGR。
- Provider Portal 不顯示「已匹配 / 不一致 / 待處理」等對帳狀態；實際 GGAP 比對由財務執行。

## 5. 技術與交接狀態

- `src/services/apiClient.ts` 是目前 API 單一出口，支援 `get`、`post`、`put`、`patch`、`del`。
- `src/mocks/` 只模擬前端流程，不是正式 API 實作。
- `src/stores/portal.ts`、`src/stores/auth.ts` 仍包含三 Portal 與 mock identity，後續需要改為 Provider 身份模型。
- `src/config/menu-sakai.ts` 已改為 Provider 目標導覽；「官方網站」底下分為「遊戲官網」與「遊戲大廳」，舊 legacy route 仍保留但不從主要導覽新增入口。
- `src/views/GameLobby/` 已包含五個遊戲大廳原型頁、mock 資料與共用樣式。
- `src/views/GameWebsite/` 已包含三個遊戲官網原型頁、四語系 mock 內容、Banner 單獨預覽與發布紀錄。
- `src/views/Finance/Overview.vue` 已建立 `/finance` 財務總覽原型，包含查詢條件、八項統計卡片、兩組趨勢圖與遊戲表現排行。
- `src/views/Finance/AgentGames.vue` 已完成 `/finance/agent-games` 代理商 × 遊戲彙總原型，包含摘要、排序、分頁、空資料、匯出欄位設定與導入 `/reports`。
- `src/views/Provider/MonitoringOverview.vue` 已完成監控總覽獨立 mock 原型；期間 GGAP 指標由同一組 `appliedFilters` 與 latency samples 解析，摘要、列表與詳情不使用 P95 加權平均。
- `src/views/Provider/Placeholder.vue` 已為 9 個 Provider route 提供群組專屬 mock blueprint，包含摘要卡、主要內容區塊、展示列表、空資料狀態與 API 待接說明。
- `src/views/Provider/RiskReports.vue` 與 `src/views/Provider/RiskAlerts.vue` 已承接風控報表、風控告警／處理完整 mock 內容；兩頁不顯示重複說明區塊。
- `src/views/Provider/RiskAlerts.vue` 已完成繁體中文介面與可見 mock 敘述，沿用風控報表的正式／展示環境、嚴重／高／中、遊戲回合、回呼與請求／回應術語；篩選選項保留中英對照，技術識別碼、API 路徑、錯誤碼、版本號與正式欄位值不翻譯。
- `docs/PROVIDER_PORTAL_PAGE_MAP.md` 已建立，集中記錄 32 個導覽內容頁與 1 個官方網站 redirect 入口。
- `docs/GGAP_final_system_spec_tech.html` 是 GGAP 平台依據；Provider Portal 的補充對接契約見 `docs/PROVIDER_GGAP_INTEGRATION_CONTRACT.md`，不能直接把 GGAP Admin Portal 規格當成遊戲商畫面規格。

## 6. 現行產品規格

- [`docs/PROVIDER_PORTAL_SPEC.md`](../PROVIDER_PORTAL_SPEC.md)
- [`docs/PROVIDER_GGAP_INTEGRATION_CONTRACT.md`](../PROVIDER_GGAP_INTEGRATION_CONTRACT.md)
- [`docs/GAME_ROUND_AND_REPORTING_SPEC.md`](../GAME_ROUND_AND_REPORTING_SPEC.md)
- [`docs/GAME_VENDOR_FINANCE_REPORTING_SPEC.md`](../GAME_VENDOR_FINANCE_REPORTING_SPEC.md)
- [`docs/GAME_VENDOR_FINANCE_OVERVIEW_SPEC.md`](../GAME_VENDOR_FINANCE_OVERVIEW_SPEC.md)
- [`docs/GAME_VENDOR_FINANCE_AGENT_GAME_SPEC.md`](../GAME_VENDOR_FINANCE_AGENT_GAME_SPEC.md)
- [`docs/NOTIFICATION_SPEC.md`](../NOTIFICATION_SPEC.md)
- [`docs/PROVIDER_PORTAL_NAVIGATION_SPEC.md`](../PROVIDER_PORTAL_NAVIGATION_SPEC.md)
- [`docs/PROVIDER_PORTAL_PAGE_MAP.md`](../PROVIDER_PORTAL_PAGE_MAP.md)
- [`docs/GAME_LOBBY_SPEC.md`](../GAME_LOBBY_SPEC.md)
- [`docs/GAME_WEBSITE_SPEC.md`](../GAME_WEBSITE_SPEC.md)

上述文件是目前的工作規格。已確認的產品方向可直接作為原型調整依據；正式 API、狀態碼、精度與權限仍需後端 / GGAP 對接確認。

## 7. 下一階段優先工作

1. 與 GGAP / 後端對接團隊確認 Provider API、身份、冪等、錯誤與權限契約。
2. 將 Game Round 頁面接上正式資料，確認點數 / USDT、GGR 與報表指標的正式定義。
3. 將財務總覽與代理商 × 遊戲彙總接上 Game Round 聚合資料，確認日期篩選、不重複玩家數、GGR 與 USDT 規則。
4. 依正式資料契約補齊財務報表權限、資料版本與查詢效能限制。
5. 將遊戲大廳五頁接上正式遊戲資料、狀態、素材、YouTube 連結與 DEMO API。
6. 將遊戲官網三頁接上正式內容、圖片、四語系與發布版本流程。
7. 依通知規格把通知 Placeholder 替換為正式站內通知中心。
8. 將監控總覽接上正式健康、Game Round、GGAP、Risk Event 與 Alert API，並由後端提供統一 aggregate percentile、警戒門檻與更新頻率。

## 8. 驗證與啟動

```bash
npm run dev
npm run build
npm run type-check
```

目前部署流程是 push 到 `main` 後由 GitHub Actions 部署 GitHub Pages。正式後端接入前，仍需完成真實登入、API 授權、錯誤狀態、資料權限與內容發布權限驗證。
