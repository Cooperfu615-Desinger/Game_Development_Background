# 遊戲商 Provider Portal 文件索引

> 文件版本：2.26.0
> 更新日期：2026-08-18
> 文件狀態：規格網站已進入第三階段；Decision Pack 01、02、03 均已形成目前需求基準；Decision Pack 02、03 已同步至對應原始 Spec MD；Pack 03 Portal 原型與正式差異清單已完成，Backend／GGAP Git 只作後續 Mapping

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
- [`spec-book/SPEC_BOOK_AUTHORING_GUIDE.md`](./spec-book/SPEC_BOOK_AUTHORING_GUIDE.md)
  - 規格網站的定版寫作方法、頁面模板、Overview-first 規則、驗收標準、維護流程與跨專案移植方式。
  - 文件可獨立複製至其他專案使用；Provider Portal 專案實例集中於最後一章。
- [`../public/provider-specs/page-readiness-matrix.html`](../public/provider-specs/page-readiness-matrix.html)
  - 第一階段 21 頁的集中清冊、A–D 批次、逐面向完成度及待補主題。
  - 11 個 Deferred 頁面不納入內容評估，待必要規格與產品決策齊備後再重新排程。
- [`../public/provider-specs/page-reconciliation.html`](../public/provider-specs/page-reconciliation.html)
  - 第一階段 21 頁的三層校準，分開呈現已確認產品規則、現行原型實況及目標草案／待確認內容。
  - 以大致一致、邊界注意與原型缺口標示規格撰寫時的校準風險。
- [`../public/provider-specs/page-dependency-map.html`](../public/provider-specs/page-dependency-map.html)
  - 第一階段四條核心業務鏈、15 條依賴關係、Guardrail 與共用契約優先級。
  - GGAP 對接、通知中心及系統設定只作 Deferred 外部依賴，不推定其正式契約。
- [`../public/provider-specs/open-issues.html`](../public/provider-specs/open-issues.html)
  - Domain、Data、API、Security、NFR、External 六類跨頁 TBD 集中登錄與 21 頁影響矩陣。
  - 頁面局部 TBD 保留來源 ID，但共用決議以此集中清單為唯一治理入口。
- [`../public/provider-specs/phase-one-validation-report.html`](../public/provider-specs/phase-one-validation-report.html)
  - 第一階段封版驗證結論、Gate、覆蓋數量、核心產品邊界、注意事項與重開條件。
  - 封版代表第一階段整理輸入可進入第二階段，不代表全部頁面或正式契約已 Confirmed。
- [`../public/provider-specs/phase-two-validation-report.html`](../public/provider-specs/phase-two-validation-report.html)
  - 第二階段 Batch A–D 共 21 頁的跨批次 Gate、交付覆蓋、網站追溯、Deferred 邊界及重開條件。
  - Draft Seal 代表規格骨架可進入第三階段共用契約收斂；API、資料、權限與 30 項集中 TBD 尚未 Confirmed。
- [`../public/provider-specs/decision-pack-01-round-finance.html`](../public/provider-specs/decision-pack-01-round-finance.html)
  - 第三階段 Game Round、投注與財務共用產品契約，直接定義 Round 1:N Bet、識別快照、時間／日結、三層投注設定、Provider Points／USDT 與正式財務調帳。
  - 本包是產品需求基準，不採逐題核准問卷；現行 Portal 仍為前端 mock，實際 schema、payload、精度、排程及 GGAP Backend 支援能力取得後再以版本差異更新。
- [`../public/provider-specs/decision-pack-02-monitoring-risk.html`](../public/provider-specs/decision-pack-02-monitoring-risk.html)
  - 第三階段監控與風控共用產品契約，直接表達目前希望具備的 Signal、Detection Result、Risk Event、Alert、Mitigation Job、隔離、GGAP 通知與稽核能力。
  - 本包是產品需求基準，不採逐題核准問卷；現行 Portal 仍為前端 mock，實際 Backend 與 GGAP 契約差異取得後再以版本更新。
  - 內容已同步至 `PROVIDER_MONITORING_OVERVIEW_SPEC.md`、`PROVIDER_RISK_CONTROL_SPEC.md`、`PROVIDER_RISK_REPORT_SPEC.md`、`PROVIDER_RISK_ALERT_HANDLING_SPEC.md`，Dashboard 只保留摘要與導流引用。
- [`../public/provider-specs/decision-pack-03-game-release-lifecycle.html`](../public/provider-specs/decision-pack-03-game-release-lifecycle.html)
  - 第三階段遊戲版本與發布生命週期共用產品契約，定義 Game、Version、Artifact、Release、三環境晉級、快速／高風險發布、Provider 全域可用性、GGAP 代理商開關邊界、回滾與既有 Game Round 相容。
  - 本包是目前需求基準，不等待 Backend Git 才成立；現有資料表、CI/CD、Launch Token、GGAP payload、permission 與 audit 只在後續建立實作差異表。
  - 內容已同步至 `PROVIDER_PORTAL_SPEC.md`、`PROVIDER_GGAP_INTEGRATION_CONTRACT.md`、`GAME_LIST_SPEC.md`、導覽／頁面地圖、六個遊戲管理頁、共用資料／API／安全／QA 規格及 Portal Vue 原型。
- [`../public/provider-specs/decision-pack-03-implementation-reconciliation.html`](../public/provider-specs/decision-pack-03-implementation-reconciliation.html)
  - 逐項對照 DP03 需求基準、目前原型、mock-only 限制、Provider Backend／CI/CD 待辦、GGAP 待接軌內容與正式上線阻擋條件。
  - 原型可操作不等於正式副作用完成；後續取得 Backend／GGAP Git 時，依清單更新 Mapping 結果，不回頭用現況覆蓋產品需求。
- [`../public/provider-specs/game-round-records.html`](../public/provider-specs/game-round-records.html)、[`../public/provider-specs/finance-overview.html`](../public/provider-specs/finance-overview.html)、[`../public/provider-specs/finance-agent-games.html`](../public/provider-specs/finance-agent-games.html)
  - 第二階段 Batch A 完整 Draft：Game Round 查詢、全域財務摘要及代理商 × 遊戲彙總。
  - 三頁均提供原型對齊的置頂畫面示意、完整規格、跨頁導流、驗收與集中 TBD 對照。
- [`../public/provider-specs/dashboard.html`](../public/provider-specs/dashboard.html)、[`../public/provider-specs/monitoring-overview.html`](../public/provider-specs/monitoring-overview.html)、[`../public/provider-specs/risk-reports.html`](../public/provider-specs/risk-reports.html)、[`../public/provider-specs/risk-alerts.html`](../public/provider-specs/risk-alerts.html)
  - 第二階段 Batch B 完整 Draft：跨模組摘要、服務與指標監控、Risk Event 分析及 Alert 處理。
  - 四頁均提供原型對齊的置頂六區畫面示意，並分開 Test、環境、時間、Event／Alert、隔離、GGAP 及 Deferred 通知邊界。
- [`../public/provider-specs/game-list.html`](../public/provider-specs/game-list.html)、[`../public/provider-specs/game-environments.html`](../public/provider-specs/game-environments.html)、[`../public/provider-specs/game-settings.html`](../public/provider-specs/game-settings.html)、[`../public/provider-specs/game-math.html`](../public/provider-specs/game-math.html)、[`../public/provider-specs/game-versions.html`](../public/provider-specs/game-versions.html)、[`../public/provider-specs/game-assets.html`](../public/provider-specs/game-assets.html)
  - 第二階段 Batch C 的頁面骨架已依 Decision Pack 03 回寫：Game／Version／Artifact／Release、Test → DEMO → Production、快速／高風險發布、回滾及全域可用性使用同一需求基準。
  - 環境與發布已完成三環境矩陣、快速／高風險通道、驗證、回復與歷程內容原型；目前操作只更新 mock，不代表正式 API、CI/CD、permission、audit 或 GGAP 副作用已完成。
- [`../public/provider-specs/website-banners.html`](../public/provider-specs/website-banners.html)、[`../public/provider-specs/website-content.html`](../public/provider-specs/website-content.html)、[`../public/provider-specs/website-releases.html`](../public/provider-specs/website-releases.html)、[`../public/provider-specs/lobby-overview.html`](../public/provider-specs/lobby-overview.html)、[`../public/provider-specs/lobby-games.html`](../public/provider-specs/lobby-games.html)、[`../public/provider-specs/lobby-management.html`](../public/provider-specs/lobby-management.html)、[`../public/provider-specs/lobby-demo.html`](../public/provider-specs/lobby-demo.html)、[`../public/provider-specs/lobby-preview.html`](../public/provider-specs/lobby-preview.html)
  - 第二階段 Batch D 完整 Draft：官網 Banner／靜態內容／發布追溯，以及大廳公開資料、管理、DEMO telemetry 與指定 revision 預覽。
  - DEMO 資料明確不建立會員、錢包或正式 Game Session，亦不混入 Production Game Round、財務與 Provider 風控。

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
