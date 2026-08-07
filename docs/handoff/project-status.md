# 專案現況總覽 / Project Status

> 狀態日期：2026-08-07
> 目前分支：`main`
> 文件狀態：Provider Portal 第一輪前端原型與工作規格已建立；正式 API、權限與後端資料契約待確認

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

目前程式仍保留早期三 Portal legacy code，但主要工作區已切換為 Provider Portal 目標導覽，並完成 Game Round、遊戲商財務總覽、遊戲大廳與遊戲官網的第一輪前端原型。它目前適合用於規格討論與畫面確認，不是正式營運系統。

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
| 通知中心 | `/notifications` 已有導覽入口，目前仍是 Provider placeholder，通知功能尚未完成 |
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
| 總覽 | `/dashboard` | 改為 Provider 指標與健康狀態 |
| 遊戲管理 | 舊 `/games` 及數個子頁 | 保留 legacy route；新版大廳遊戲資料與公開狀態由 `/lobby/*` 原型承接 |
| 遊戲大廳 | `/lobby`、`/lobby/games`、`/lobby/management`、`/lobby/demo`、`/lobby/preview` | 五頁前端原型已建立，後續接正式遊戲、狀態、DEMO 數據與素材 API |
| 數據與報表 | `/reports` 已是 Provider Game Round 頁面；其他舊報表仍存在 | 持續確認 Game Round API、聚合報表與正式資料契約 |
| 遊戲商財務 | `/finance` 已建立財務總覽原型；舊 `/finance/settlements`、`/finance/reconciliation`、`/finance/transactions` 仍保留 | 財務總覽先完成畫面與規格骨架，後續接 Game Round 聚合、點數 / USDT 與正式 API；不建立平台錢包 |
| 遊戲監控與風控 | `/risk` | 改為遊戲商遊戲、Game Round、異常與營運告警 |
| GGAP 對接 | 舊 `/aggregators` | 改為 GGAP 連線、同步、請求與錯誤狀態檢視 |
| 通知中心 | 尚未建立 | 必須建立，先以站內通知為主 |
| 官方網站 | `官方網站 > 遊戲官網` 已有 Banner 管理、法務與聯絡資訊、發布與版本紀錄三頁原型；同群組下另有遊戲大廳 | 後續接正式內容、圖片、發布、版本與權限功能；公告與活動暫不納入 |
| 系統設定 | `/system`、`/settings` | 保留，重新整理為 Provider 管理設定 |

以下功能目前不列入新版主要導覽：代理商管理、商戶管理、會員管理、平台管理、獨立獎池管理、遊戲商自有活動。獎池與活動未來若有明確需求，再另立規格。

## 4. 已確認的資料方向

### Game Round 是主要業務單位

- 不建立獨立的 Game Session 模組。
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
- `docs/GGAP_final_system_spec_tech.html` 是 GGAP 平台依據；Provider Portal 的補充對接契約見 `docs/PROVIDER_GGAP_INTEGRATION_CONTRACT.md`，不能直接把 GGAP Admin Portal 規格當成遊戲商畫面規格。

## 6. 現行產品規格

- [`docs/PROVIDER_PORTAL_SPEC.md`](../PROVIDER_PORTAL_SPEC.md)
- [`docs/PROVIDER_GGAP_INTEGRATION_CONTRACT.md`](../PROVIDER_GGAP_INTEGRATION_CONTRACT.md)
- [`docs/GAME_ROUND_AND_REPORTING_SPEC.md`](../GAME_ROUND_AND_REPORTING_SPEC.md)
- [`docs/GAME_VENDOR_FINANCE_REPORTING_SPEC.md`](../GAME_VENDOR_FINANCE_REPORTING_SPEC.md)
- [`docs/GAME_VENDOR_FINANCE_OVERVIEW_SPEC.md`](../GAME_VENDOR_FINANCE_OVERVIEW_SPEC.md)
- [`docs/NOTIFICATION_SPEC.md`](../NOTIFICATION_SPEC.md)
- [`docs/PROVIDER_PORTAL_NAVIGATION_SPEC.md`](../PROVIDER_PORTAL_NAVIGATION_SPEC.md)
- [`docs/GAME_LOBBY_SPEC.md`](../GAME_LOBBY_SPEC.md)
- [`docs/GAME_WEBSITE_SPEC.md`](../GAME_WEBSITE_SPEC.md)

上述文件是目前的工作規格。已確認的產品方向可直接作為原型調整依據；正式 API、狀態碼、精度與權限仍需後端 / GGAP 對接確認。

## 7. 下一階段優先工作

1. 與 GGAP / 後端對接團隊確認 Provider API、身份、冪等、錯誤與權限契約。
2. 將 Game Round 頁面接上正式資料，確認點數 / USDT、GGR 與報表指標的正式定義。
3. 將財務總覽接上 Game Round 聚合資料，確認日期篩選、不重複玩家數、GGR 與 USDT 規則。
4. 將遊戲大廳五頁接上正式遊戲資料、狀態、素材、YouTube 連結與 DEMO 數據。
5. 將遊戲官網三頁接上正式內容、圖片、四語系與發布版本流程。
6. 依通知規格把 `/notifications` placeholder 替換為站內通知中心。

## 8. 驗證與啟動

```bash
npm run dev
npm run build
npm run type-check
```

目前部署流程是 push 到 `main` 後由 GitHub Actions 部署 GitHub Pages。正式後端接入前，仍需完成真實登入、API 授權、錯誤狀態、資料權限與內容發布權限驗證。
