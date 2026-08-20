# 文件治理與使用方式

本規格網站是 Provider Portal 後續產品確認、前端實作、後端契約與 QA 驗收的共同工作入口。規格網站的章節結構、Overview-first 閱讀流程與撰寫格式已確認；個別內容頁仍依其規格成熟度判斷，尚未全面取代既有現行 Spec 文件。

## 文件基本資料

| 項目 | 內容 |
|---|---|
| 文件名稱 | Provider Portal 產品與系統規格書 |
| 適用產品 | GGAP Provider Portal |
| 主要讀者 | 產品、前端、後端、QA、GGAP 對接團隊 |
| 目前版本 | `0.21.0-phase-three-pack-04-source-aligned` |
| 目前狀態 | Phase 3 · Product Contract Baselines |
| 主要語言 | 台灣繁體中文；技術值與協定名稱保留英文 |

## 規格狀態定義

| 狀態 | 定義 | 是否可直接開發 |
|---|---|---|
| 已確認（Confirmed） | 產品與責任方已確認，可作為實作與驗收依據 | 是 |
| 草案（Draft） | 方向已定，仍有欄位、枚舉或契約待核准 | 依 TBD 阻擋範圍判斷 |
| 待整理（Outline） | 已建立章節、來源及責任範圍，尚未形成完整可交付規格 | 否 |
| 待決策（TBD） | 核心決策尚未形成 | 否 |

> 頁面已有 mock 原型，不等於該頁 API、權限、狀態碼、精度與資料契約已確認。

## 製作範圍定義

規格成熟度回答「內容確認到什麼程度」，製作範圍回答「目前是否排入整理」。兩者必須獨立管理，不得因頁面延後，就把規格狀態誤標為 TBD；也不得因已有內容原型，就視為已排入本輪。

| 範圍 | 定義 | 本階段處理方式 |
|---|---|---|
| 基準範本（Baseline） | 已完成完整試作，作為後續頁面撰寫與審閱標準 | 維護並用於品質校正 |
| 本輪製作（Active） | 納入目前規格完善範圍 | 依核准批次整理 |
| 延後製作（Deferred） | 必要規格或產品決策尚未完成 | 僅列延後原因與必要輸入，不作為開發依據 |
| 受阻（Blocked） | 已開始整理，但存在明確且無法繞過的阻擋 | 記錄阻擋條件、責任方與解除條件 |

第一階段範圍已凍結為 32 個內容頁：1 頁 Baseline、20 頁 Active、11 頁 Deferred；目前沒有 Blocked 頁面。

## 文件優先級

發生內容衝突時，暫依下列順序判斷：

1. 最新確認的產品決策與已核准的 Provider Portal 規格。
2. GGAP 最新平台規格。
3. 最新 API 與前後端交接文件。
4. 實際程式碼與驗證結果。
5. `docs/archive/` 歷史文件。

本規格網站中的章節只有在標記為「已確認」後，才取代對應來源文件的重複說明。

## 變更原則

- 正式產品決策先更新規格，再修改原型與 API。
- 共通規則只維護一份，頁面規格使用連結引用。
- Mock 數字、展示資料與正式契約必須分開標示。
- 每個 TBD 必須標明決策責任方，以及是否阻擋前端、後端或正式上線。
- 已核准版本應輸出 PDF 快照並保留版本紀錄。

## 已確認的規格網站基準

- 完整規格書章節樹。
- 九個主模組與 32 個內容頁索引。
- 規格成熟度、原型成熟度、來源文件與前端元件追溯。
- 多頁 HTML 閱讀、全文搜尋、頁內目錄及列印版型。
- Overview-first、可點擊頁面畫面示意與返回閱讀動線。
- 內容頁有效寬度、Desktop／Mobile 響應式與文件標註色。
- 「遊戲紀錄」作為第一個完整頁面規格範本。
- 可獨立移植的規格書撰寫與交接規範。

> 「撰寫格式已確認」不代表所有內容頁均已 Confirmed。正式 API、權限、狀態 enum、資料精度與整合契約仍以各章節狀態及待決策清單為準。

第一階段的範圍、完成度、三層校準、跨頁依賴與集中 TBD 已完成封版驗證；驗證結果、限制及重開條件見附錄 J《第一階段封版驗證報告》。

第二階段 Batch A 已完成「遊戲紀錄、財務總覽、代理商 × 遊戲彙總」三頁的完整 Draft 規格與原型對齊畫面示意。此完成狀態代表產品／UI／驗收骨架可交付審閱，不代表集中 TBD 所列的正式公式、API、精度、權限、GGAP 或系統設定契約已核准。

第二階段 Batch B 已完成「儀表板、監控總覽、風控報表、風控告警／處理」四頁完整 Draft。四頁形成「跨模組摘要 → 服務與指標觀察 → Risk Event 分析 → Alert 人工作業」鏈，並明確保留 Test 排除、Production／DEMO 隔離、既有 Round 不受隔離阻斷及 GGAP／通知 Deferred 邊界。

第二階段 Batch C 已完成遊戲管理六頁完整 Draft，形成「遊戲主資料 → 一般設定 → 數值版本 → 程式版本 → 素材版本 → 環境發布」鏈。後續 DP03 原型實作已將「環境與發布」替換為內容原型，並讓六頁共用同一組生命週期 mock；正式 API、CI/CD、權限、核准及 GGAP 同步仍待集中 TBD。

第二階段 Batch D 已完成官方網站與遊戲大廳八頁完整 Draft；後續 DP04 已將其同步為 Content Entry／Revision／Published Snapshot／Publish Job、四條獨立發布流、exact Preview Manifest 與三層可玩性契約。DEMO identity、Sandbox credit 與技術工作階段不建立會員、錢包或 Game Session 業務模型，也不進入正式 Game Round、財務或 Provider 風控；正式 API、permission、Renderer 與 telemetry 實作仍待 Mapping。

第二階段 Batch A–D 共 21 頁已完成 Draft 封版驗證；產品與 UI、響應式、驗收及跨頁依賴骨架均通過 Gate，API、資料與權限仍維持 Partial，30 項集中 TBD 維持 Open。驗證結果、Deferred 邊界與第三階段入口見附錄 K《第二階段封版驗證報告》。

第三階段附錄 L《Decision Pack 01｜Game Round、投注與財務共用產品契約》已改以「目前需求基準」定位，直接定義 Round 1:N Bet、識別快照、時間／日結、遊戲投注結構／幣別倍率／下注限額、Provider Points／USDT 及正式財務調帳。它不再使用替代方案或 Q1–Q20 核准問卷；現行 Portal 仍為前端 mock，資料表、payload、精度、排程與 GGAP Backend 支援能力列為取得證據後的差異驗證點。

第三階段附錄 M《Decision Pack 02｜監控與風控共用產品契約》採用「目前需求基準」定位，不再以替代方案或逐題核准問卷表達。它直接定義 Signal → Detection Result → Risk Event → Alert → Mitigation Job → Recovery 的完整產品閉環，以及規則版本、事件／告警生命週期、隔離、GGAP 通知、可靠性與稽核要求。現行三個頁面仍是前端 mock；API path、實際門檻、permission key、資料表與 GGAP payload 屬外部驗證點，取得證據後以版本差異更新，不降低目前功能需求的完整度。

第三階段附錄 N《Decision Pack 03｜遊戲版本與發布生命週期》採用「目前需求基準」定位，直接定義 Game、Version、Artifact、Release、Test／DEMO／Production 晉級、標準快速發布＋高風險發布、Provider 全域可用性、GGAP 代理商開關邊界、回滾與既有 Game Round 相容。日常發布以自動檢查與單一發布管理者加速，數值、金額、契約、資料結構及安全變更才要求第二人核准；內容已回寫 Portal、遊戲列表、GGAP 契約、六個遊戲管理頁與共用資料／API／安全／QA 規格。Backend Git 只用於後續實作 Mapping，不阻擋本產品需求成立。

第三階段附錄 O《Decision Pack 03｜原型實作差異清單》已完成需求、原型與正式交付的逐項對照。Portal 的生命週期畫面與 mock 互動列為 `ALIGNED_PROTOTYPE`／`MOCK_ONLY`；資料持久化、CI/CD、權限與稽核列為 `BACKEND_PENDING`；GGAP 事件、ACK 與 Launch Gate 列為 `GGAP_PENDING`。這些分類不得互相替代，也不得因原型可操作而宣告正式功能完成。

第三階段附錄 P《Decision Pack 04｜官網與大廳內容發布契約》採用「目前需求基準」定位，直接定義 Content Entry、Revision、Published Snapshot、Publish Job、Preview Manifest、Publication Event，以及官網 Banner、官網內容、大廳單款遊戲內容與 Lobby Catalog 四條獨立發布流。四語系、不可變素材版本、精確預覽、一般快速／高風險第二人核准、排程、停用、還原、失敗保留舊版與 37 個跨頁驗收情境均已成立；實際 API、資料表、CDN、Scheduler、permission 與 GGAP Launch Mapping 待取得證據後補，不阻擋本產品契約成立。

DP04 已回寫 `GAME_WEBSITE_SPEC.md`、`GAME_LOBBY_SPEC.md`、八個頁面規格、Portal／Page Map／Navigation 與共通領域、資料、enum、API、安全、NFR、QA。產品層 TBD 已收斂為實作 Mapping；Portal Vue／mock 尚未於本版本修改，下一步先建立原型差異清單再交由開發 session 對齊。
