# 遊戲商 Provider Portal 文件索引

> 文件版本：2.10.0
> 更新日期：2026-08-11
> 文件狀態：Provider Portal 導覽、頁面原型與監控／風控規格已整理；監控總覽前端 mock 原型已完成，正式 API、權限、警戒門檻、更新頻率與資料契約待確認

## 閱讀前提

本專案是 GGAP 的其中一個 Provider Portal，服務對象是遊戲商本身。
遊戲商負責遊戲主資料、遊戲規則、點數與 USDT 換算、遊戲上下架、遊戲紀錄、監控與遊戲商財務報表；GGAP 負責聚合平台、代理商與會員側的平台能力。

目前產品方向已與早期「遊戲開發商總控後台」不同。`docs/archive/` 內的文件只作為歷史決策、實作過程與 QA 備查，不可直接作為新功能規格依據。

## 現行文件

### 1. GGAP 平台規格

- [`GGAP_final_system_spec_tech.html`](./GGAP_final_system_spec_tech.html)
  - GGAP 平台的系統、業務、資料、API、財務與安全規格。
  - 此文件是 GGAP 端的參考依據，不等同於遊戲商 Provider Portal 規格。
  - Provider Portal 對接補充契約見 [`PROVIDER_GGAP_INTEGRATION_CONTRACT.md`](./PROVIDER_GGAP_INTEGRATION_CONTRACT.md)。

### 2. 專案交接文件

- [`handoff/project-status.md`](./handoff/project-status.md)
- [`handoff/frontend.md`](./handoff/frontend.md)
- [`handoff/backend.md`](./handoff/backend.md)
- [`handoff/api-contract.md`](./handoff/api-contract.md)

> 上述交接文件已依 Provider Portal 方向整理，並將「目前原型實況」與「目標規格草案」分開標示。正式 API 與資料欄位仍需由後端與 GGAP 對接團隊核准。

### 3. 現行產品規格

- [`PROVIDER_PORTAL_SPEC.md`](./PROVIDER_PORTAL_SPEC.md)
  - Provider Portal 定位、責任邊界、功能範圍與驗收方向。
- [`PROVIDER_GGAP_INTEGRATION_CONTRACT.md`](./PROVIDER_GGAP_INTEGRATION_CONTRACT.md)
  - Provider 與 GGAP 的資料脈絡、同步、啟動、結算與安全草案。
- [`GAME_ROUND_AND_REPORTING_SPEC.md`](./GAME_ROUND_AND_REPORTING_SPEC.md)
  - Game Round、遊戲紀錄、時間、狀態、點數 / USDT 與報表公式。
- [`GAME_ROUND_RECORDS_SPEC.md`](./GAME_ROUND_RECORDS_SPEC.md)
  - 正式環境單筆遊戲紀錄頁的欄位、查詢、排序、詳情與 Excel / CSV 匯出。
- [`GAME_VENDOR_FINANCE_REPORTING_SPEC.md`](./GAME_VENDOR_FINANCE_REPORTING_SPEC.md)
  - 遊戲商財務報表、顯示、匯出與對帳責任邊界。
- [`GAME_VENDOR_FINANCE_OVERVIEW_SPEC.md`](./GAME_VENDOR_FINANCE_OVERVIEW_SPEC.md)
  - 財務總覽頁面的查詢條件、統計卡片、趨勢圖、遊戲排行與原型限制。
- [`GAME_VENDOR_FINANCE_AGENT_GAME_SPEC.md`](./GAME_VENDOR_FINANCE_AGENT_GAME_SPEC.md)
  - 代理商 × 遊戲彙總、摘要區、欄位順序、Game Round 導入、自訂匯出、分頁與空資料狀態。
- [`NOTIFICATION_SPEC.md`](./NOTIFICATION_SPEC.md)
  - 通知類型、觸發、已讀、權限與站內通知中心。
- [`PROVIDER_RISK_CONTROL_SPEC.md`](./PROVIDER_RISK_CONTROL_SPEC.md)
  - Provider 風控責任、異常事件定義、Event ID、嚴重度、自動緩解、隔離與處理生命週期。
- [`PROVIDER_MONITORING_OVERVIEW_SPEC.md`](./PROVIDER_MONITORING_OVERVIEW_SPEC.md)
  - 監控總覽的 Production／DEMO 範圍、五張摘要卡、查詢、遊戲監控列表、詳情與跨頁導向。
- [`PROVIDER_DASHBOARD_SPEC.md`](./PROVIDER_DASHBOARD_SPEC.md)
  - Provider 跨模組營運儀表板、時間語意、摘要卡、趨勢與工作入口規格。
- [`PROVIDER_RISK_REPORT_SPEC.md`](./PROVIDER_RISK_REPORT_SPEC.md)
  - 風控報表的滾動時間、Production／DEMO、摘要卡、待關注異常、查詢、列表與 Risk Event 詳情。
- [`PROVIDER_RISK_ALERT_HANDLING_SPEC.md`](./PROVIDER_RISK_ALERT_HANDLING_SPEC.md)
  - 風控告警摘要、工作佇列、Alert 詳情、隔離／解除、GGAP 通知與處理狀態流轉。
- [`PROVIDER_PORTAL_NAVIGATION_SPEC.md`](./PROVIDER_PORTAL_NAVIGATION_SPEC.md)
  - 左側導覽、頁面範圍、舊功能移除、原型階段成果與整體驗證結果。
- [`PROVIDER_PORTAL_UI_LAYOUT_SPEC.md`](./PROVIDER_PORTAL_UI_LAYOUT_SPEC.md)
  - Provider Portal 共用頁面寬度、Placeholder 說明區塊與響應式版型規則。
- [`PROVIDER_PORTAL_PAGE_MAP.md`](./PROVIDER_PORTAL_PAGE_MAP.md)
  - Provider Portal 完整導覽階層、32 個內容頁 route、頁面責任、預計內容、原型與 Placeholder 狀態、API 待辦與範圍邊界。
- [`GAME_LIST_SPEC.md`](./GAME_LIST_SPEC.md)
  - 遊戲列表欄位、環境狀態、Release 摘要、RTP Tips、篩選與互動方向。
- [`GAME_LOBBY_SPEC.md`](./GAME_LOBBY_SPEC.md)
  - 遊戲大廳五頁前端原型、三種玩家狀態、DEMO環境數據、預覽與 Provider / GGAP 邊界。
- [`GAME_WEBSITE_SPEC.md`](./GAME_WEBSITE_SPEC.md)
  - 遊戲官網 Banner、法務與聯絡資訊、發布紀錄，以及公告 / 活動暫不納入的範圍。

> 以上文件目前是 Provider Portal 工作規格。產品方向已確認的內容可作為原型調整依據；API 路徑、欄位精度、狀態碼與正式權限仍需後端與 GGAP 對接團隊核准。

### 4. 技術參考

- [`TECH_QUICK_REFERENCE.md`](./TECH_QUICK_REFERENCE.md)
  - 目前前端技術棧、常用指令、目錄、API client 與 Provider 開發原則。
  - 若與實際程式碼不一致，以程式碼與最新交接文件為準。

## 文件使用提醒

Provider Portal 工作規格完成後，仍不應直接沿用封存區內舊有的玩家、代理商、商戶、獎池或平台管理規格。若工作規格與 GGAP 最新平台規格發生衝突，需先由產品、後端與 GGAP 對接團隊確認責任邊界。

## 封存文件

- [`archive/README.md`](./archive/README.md)

封存內容依性質分為：

- [`archive/legacy/`](./archive/legacy/)：早期產品、架構、開發與技術轉移文件。
- [`archive/qa/`](./archive/qa/)：舊版原型 QA 報告。
- [`archive/superpowers/`](./archive/superpowers/)：已完成的歷史規格與執行計畫。

封存文件保留原始內容與檔名，主要用途是追溯過去的設計決策、實作過程與測試結果。

## 文件優先級

發生內容衝突時，請依以下順序判斷：

1. 最新確認的產品決策與已核准的 Provider Portal 規格
2. GGAP 最新平台規格
3. 最新的 API 與前後端交接文件
4. 實際程式碼與測試結果
5. `docs/archive/` 歷史文件

## 更新規則

- 新的產品決策應先整理成現行規格，再修改原型或 API 文件。
- 舊規格不直接覆寫；若已失效，移入 `docs/archive/` 並保留歷史脈絡。
- GGAP 規格若由對接團隊提供新版本，應以新版本取代現行參考檔，並保留舊版備查。
- 文件中的路由、API、資料欄位與畫面狀態，應定期與實際程式碼核對。
