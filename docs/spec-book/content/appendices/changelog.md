# 版本紀錄

## 0.21.0-phase-three-pack-04-source-aligned · 2026-08-20

- 將 DP04 回寫至 `GAME_WEBSITE_SPEC.md`、`GAME_LOBBY_SPEC.md`、`PROVIDER_PORTAL_SPEC.md`、導覽與頁面地圖。
- 同步官網 Banner／Content／Release 與 Lobby Overview／Games／Management／DEMO／Preview 八頁，統一 Content Entry、Revision、Job、Snapshot、exact Manifest 與四條獨立發布流。
- 以 Published Catalog、DP04 內容語意、DP03 runtime overlay 與 GGAP Launch Gate 取代舊「遊戲一定顯示／三種單一狀態」模型。
- 固定四語原子發布、`STRICT`／`FALLBACK`／`OPTIONAL_HIDE`、exact Asset Version、快速／高風險通道、失敗保留舊版與 Restore 新 Revision／Job。
- 同步共通領域、資料字典、狀態 enum、API、安全、NFR、QA、依賴圖、三層校準與交接索引。
- 新增 DP04 Source Spec Gate；本版本不修改 Portal Vue／mock，後續先建立差異清單再進行原型對齊。

## 0.20.0-phase-three-pack-04-baseline · 2026-08-20

- 建立附錄 P《Decision Pack 04｜官網與大廳內容發布契約》，作為八個官網／大廳頁面的上游產品需求基準。
- 定義 Content Entry、Revision、Published Snapshot、Publish Job、Preview Manifest、Publication Event，以及 Revision／Job／Public／Delivery 四組獨立狀態。
- 固定官網 Banner、官網內容、Lobby Game Content、Lobby Catalog 四條獨立發布流，以及 `zh-TW`、`zh-CN`、`en`、`ja` 四語系、欄位政策與素材 Fallback。
- 補齊精確預覽、三階段驗證、一般快速／高風險第二人核准、排程、停用、Emergency Disable、還原、補償與 append-only audit。
- 建立八頁責任矩陣、DP03 × DP04 結果矩陣、替代狀態與 37 個最低跨頁驗收情境。
- 分開產品語意契約與實作 Mapping；實際 API、資料表、Queue、Scheduler、CDN、permission 與 GGAP Launch 證據不阻擋 DP04 成立。
- 本版本只建立規格網站上游契約，尚未回寫 `GAME_WEBSITE_SPEC.md`、`GAME_LOBBY_SPEC.md` 或修改 Portal Vue 原型。

## 0.19.0-phase-three-pack-03-reconciled · 2026-08-18

- 新增附錄 O《Decision Pack 03｜原型實作差異清單》，逐項區分 `ALIGNED_PROTOTYPE`、`MOCK_ONLY`、`BACKEND_PENDING`、`GGAP_PENDING` 與 `OUT_OF_SCOPE`。
- 記錄 P0 `a1d5098`、P1 `c774bf8` 的七頁程式對照、八組 DP03 契約、集中前端模型、mock-only 行為及驗證證據。
- 將「環境與發布」現況由 Placeholder 更新為內容原型；全站目前為 25 個內容原型、7 個 Placeholder，Deferred 範圍仍維持 11 頁。
- 集中列出 Provider Backend、CI/CD、權限、Audit、Game Round 快照與 GGAP event／ACK／Launch Gate 的待接軌項目及正式上線阻擋條件。
- 本版本只校正規格網站與現況追溯，不把 mock 操作宣告為正式發布能力。

## 0.18.0-phase-three-pack-03-source-aligned · 2026-08-18

- 將 Decision Pack 03 回寫至 `PROVIDER_PORTAL_SPEC.md`、`PROVIDER_GGAP_INTEGRATION_CONTRACT.md`、`GAME_LIST_SPEC.md`、導覽與頁面地圖。
- 同步遊戲列表、環境與發布、遊戲設定、數值設定、遊戲版本、遊戲素材六頁，統一 Game／Version／Artifact／Release 與 Active Release 語意。
- 以 Test 快速 build、同一 Artifact 晉級 DEMO／Production、標準快速發布與高風險第二人核准取代舊有 Test 只讀與全面核准假設。
- 補齊 Provider 全域可用性、GGAP ACK／可靠投遞、回滾、Launch Context 及既有 Game Round 原版本快照。
- 更新共通領域規則、資料字典、狀態 enum、API、安全、非功能性與 QA，並保留實際 schema、permission、CI/CD 與 GGAP payload 為後續 Mapping。
- 本版本不修改 Portal Vue 原型；下一步交由新開發 session 依同步後 Spec MD 實作。

## 0.17.0-phase-three-pack-03-baseline · 2026-08-17

- 建立 Decision Pack 03《遊戲版本與發布生命週期》，作為 Game、Version、Artifact、Release 與 Active Release 的目前需求基準。
- 定義 `draft` → `candidate` → `approved` → `published` → `retired` 的版本生命週期，並與每個環境的 Release 結果分開。
- 固定 Test → DEMO → Production 的同一 Artifact 晉級與資料隔離規則；Test 不進正式監控風控，DEMO 不進正式 Round 或財務。
- 採用「標準快速發布＋高風險發布」雙通道：日常版本由單一發布管理者配合自動檢查完成，數值、金額、契約、migration、安全及無安全回滾等變更才要求第二人核准。
- 定義 Provider 全域可用性與 GGAP 代理商遊戲開關的兩層 Launch Gate，上架等待 ACK，下架／維護／暫停則先在 Provider 立即拒絕新 Launch。
- 補齊發布失敗、自動／人工回滾、隔離 desired／actual state、緊急停用、恢復守門與不可逆 migration 的安全行為。
- 明確保持 Game Round 為主要業務單位：Launch Context 只作短期路由，Round 永久固定原 Version／Build／Release／數值快照。
- 現有 Backend Git、CI/CD、GGAP payload、permission 與 audit 僅列為後續實作接軌檢查，不阻擋本產品需求基準成立；本版本不修改 Portal Vue 原型或原始頁面 Spec MD。

## 0.16.0-phase-three-contract-baselines · 2026-08-17

- 將 Decision Pack 01 從 Backend Evidence Pending 審閱問卷重寫為 Game Round、投注與財務的目前需求基準，與 Decision Pack 02 使用一致治理方式。
- 正式定義 Game Round 1:N Bet、`bet_mode`、`payout_scope`、append-only 事件／結算版本，以及 `round_count` 與 `bet_count` 分離口徑。
- 建立遊戲投注結構、固定投注幣別倍率、下注限額方案三層模型；Provider 擁有限額方案，GGAP 只同步、開放與指派。
- 分開 Provider Points、投注倍率、顯示幣別與 USDT 正式結算，保留 `USDT_ONLY`／`NATIVE_CURRENCY` 兩種版本化對接模式。
- 補齊 UTC／台北顯示／北京日結的時間角色、鎖定日結與營運報表重算差異，以及 adjustment／reversal／reconciliation 行為。
- 將 schema、enum、payload、精度、排程、permission 與 GGAP Backend 實際能力保留為外部差異驗證點，不再用其阻擋產品需求成立。
- 現行 Portal Vue 原型與原始頁面 Spec MD 尚未同步；後續依「規格網站 → 原始 Spec MD → 新開發 session」順序處理。

## 0.15.0-phase-three-pack-02-baseline · 2026-08-17

- 建立 Decision Pack 02《監控與風控共用產品契約》，以目前需求基準取代替代方案與逐題核准問卷。
- 定義 Monitoring Signal → Detection Result → Risk Event → Alert → Mitigation Job → Recovery 的分層領域模型與追蹤關係。
- 將 Risk Event 統一為 `open`、`recovering`、`resolved`、`invalidated`，Alert 統一為 `new`、`in_progress`、`monitoring`、`closed`；誤報改由 `resolution_code` 表達。
- 補齊 fingerprint 去重與復發、規則版本、觸發／恢復窗口、最小樣本、嚴重度與 automation mode。
- 定義 Mitigation Job、隔離 desired／actual state、Launch Gate、健康驗證及既有 Game Round 保留行為。
- 定義 GGAP outbox 投遞、冪等、ACK、有限重試、狀態對帳、併發控制與完整 audit。
- 現行三個 Portal 頁面仍維持前端 mock；本版本只新增規格網站內容，不修改原型程式。

## 0.14.1-phase-three-pack-01-evidence-pending · 2026-08-17

- 完成 GGAP 聚合原型的初步契約分析，確認其可作方向佐證，但不能取代測試環境實際 Backend Git。
- 將 Decision Pack 01 暫存為 Backend Evidence Pending；保留五項 TBD、五組建議與 Q1–Q20，不將任何外部依賴誤標為已確認。
- 記錄暫定方向：Provider 維持 Round 核心、對接層容許 `Round 1:N Bet`、投注設定採三層模型、下注限額由 Provider 擁有，以及 USDT-only 的條件式建議。
- 集中列出重開 Pack 01 所需的狀態 enum、時間 API、精度／rounding、實際資料表與 Callback payload 證據。
- 第三階段後續先討論 Decision Pack 02；Pack 01 待 GGAP Backend Evidence 到位後重新校準。

## 0.14.0-phase-three-pack-01-draft · 2026-08-14

- 建立第一份共用契約決策包，集中處理 Game Round 生命週期、識別與快照、時間窗口、點數／USDT 及財務公式五項 TBD。
- 每項決策均提供現況矛盾、建議方案、替代方案、影響與核准問題，共形成 Q1–Q20 的一次審閱清單。
- 規格網站新增可快速導覽的 Decision Dossier 版型，並將決策包納入側欄、全文搜尋與版本治理。
- 五項集中 TBD 仍維持原狀態；在責任方核准及同步共通規格、頁面、資料字典、enum 與測試前，不視為正式決議。
- `TBD-DAT-004`、GGAP 正式契約、API path、permission key 及 Deferred 模組不在本包決定。

## 0.13.0-phase-two-seal · 2026-08-14

- 完成 Phase 2 Batch A–D 共 21 個完整 Draft 頁的跨批次封版驗證。
- 新增第二階段專屬 `check-phase-two-seal.mjs`，驗證 21 頁、126 個示意區塊、11 頁 Deferred、30 項 Open TBD 與登入頁規格入口。
- 確認 252 個交付面向為 Complete 189、Partial 63、Missing 0；API、資料與權限維持 Partial，不誤標為正式契約。
- 新增附錄 K《第二階段封版驗證報告》，記錄自動 Gate、跨 Batch 一致性、非阻擋限制、重開條件與 Phase 3 入口。
- GGAP 對接、通知中心與系統設定共 11 頁維持 Deferred；Browserslist 更新與正式 HTML／PDF 快照留待整份規格書完成或契約核准後處理。

## 0.12.0-batch-d-draft · 2026-08-14

- 完成 Phase 2 Batch D：官方網站三頁與遊戲大廳五頁完整 Draft。
- 建立官網內容草稿 → 安全預覽 → 獨立發布／追溯，以及大廳草稿 → readiness → 指定 revision 預覽的兩條內容發布鏈。
- 八頁新增貼近現行官網／大廳原型的 Overview-first HTML／CSS 畫面示意與六區快速導覽。
- 分開遊戲主資料、官網內容、大廳公開 snapshot、發布工作與 DEMO telemetry，避免互相覆寫或冒充唯一真實來源。
- DEMO identity、展示 credit 與試玩工作階段不建立會員、錢包或正式 Game Session，也不納入 Game Round、財務或 Provider 風控。
- 正式內容／大廳生命週期、語系／素材 fallback、API、permission、公開內容安全與 DEMO 契約仍依集中 TBD 管理。

## 0.11.0-batch-c-draft · 2026-08-14

- 完成 Phase 2 Batch C：遊戲列表、環境與發布、遊戲設定、數值設定、遊戲版本、遊戲素材六頁完整 Draft。
- 建立遊戲主資料 → 設定 → 數值 → 程式版本 → 素材 → 環境發布的可追溯生命週期鏈。
- 六頁新增貼近 Provider Portal 原型的 Overview-first HTML／CSS 畫面示意與六區快速導覽。
- 將原型偏差校準為正式邊界：限紅以 Provider 點數為主、RTP 固定門檻維持 mock、商戶不作版本管理維度、素材採不可變版本。
- 環境與發布保留目標 Draft 與 Placeholder 移除條件；Test 只讀、既有 Round 不因維護／停用中斷、代理商個別開關留在 GGAP。
- 正式發布組合、API、permission、核准／併發、檔案與 GGAP 同步仍依集中 TBD 管理。

## 0.10.0-batch-b-draft · 2026-08-14

- 完成 Phase 2 Batch B：儀表板、監控總覽、風控報表、風控告警／處理四頁完整 Draft。
- 建立跨模組摘要 → 監控觀察 → Risk Event 分析 → Alert 處理的責任鏈，分開目前狀態、分析窗口及各工作單位。
- 四頁新增貼近現行 Provider 原型的 Overview-first HTML／CSS 畫面示意及六區塊快速導覽。
- 明確定義 Production／DEMO 單選、Test 排除、Risk Event ≠ Alert、隔離只阻擋新 Launch 且既有 Round 持續完成。
- 補齊查詢、欄位、排序、詳情、頁面狀態、deep link、API 責任、響應式、驗收與測試骨架。
- GGAP、通知中心、系統設定仍維持 Deferred；正式門檻、schema、permission、核准、冪等與 audit 依集中 TBD 管理。

## 0.9.0-batch-a-draft · 2026-08-14

- 完成 Phase 2 Batch A：遊戲紀錄、財務總覽、代理商 × 遊戲彙總三頁形成一致的 Game Round → 財務聚合 → 單筆追溯規格鏈。
- 新增財務總覽完整 Draft，涵蓋查詢、八張摘要卡、兩類趨勢、遊戲排行、匯出、狀態、API 責任與驗收。
- 新增代理商 × 遊戲彙總完整 Draft，涵蓋六張摘要、11 欄列表、伺服器排序分頁、Game Round deep link 與自訂匯出。
- 兩頁新增貼近現行 Provider 財務原型的 Overview-first HTML／CSS 畫面示意及六區塊快速導覽。
- 回填遊戲紀錄與兩個財務頁的跨頁責任、導流條件及集中 TBD 對照。
- API path、正式公式、decimal 精度、代理商快照、permission key、GGAP 與系統設定仍維持 Draft／Deferred，不將 mock 誤寫為正式契約。

## 0.8.0-phase-one-seal · 2026-08-14

- 以 `main@d827c59` 作為第一階段封版輸入基準，完成整體重新驗證。
- 新增可重跑的 `spec:seal` Gate，交叉驗證 route、主導覽、元件、來源、第一階段覆蓋與核心產品邊界。
- 確認 32 個內容頁、21 個本輪頁面、四條業務鏈、三項 Deferred 外部依賴及 30 項集中 TBD 彼此一致。
- 新增第一階段封版驗證報告，記錄 PASS 結論、251 項 assertion、非阻擋注意事項與重開條件。
- 封版僅代表第一階段規格整理輸入完整，不代表全部頁面、API、權限或 GGAP 契約已 Confirmed。

## 0.7.0-tbd-registry · 2026-08-14

- 將跨頁待決策集中為 Domain、Data、API、Security、NFR、External 六類登錄。
- 每項 TBD 具穩定 ID、工作優先級、狀態、責任方、需要時間、阻擋範圍、影響頁面與業務鏈。
- 建立 21 頁影響矩陣，確認所有 Baseline／Active 頁面均可追溯至共用 TBD。
- 保留遊戲紀錄 `GR-001～GR-014` 作局部來源參照，避免與跨頁決議重複或衝突。
- Deferred 模組只建立外部輸入項目，不推定其頁面、API 或權限契約。

## 0.6.0-dependency-map · 2026-08-14

- 新增第一階段四條核心跨頁依賴鏈。
- 讓每條箭頭具備上游輸出、下游用途、Guardrail 與契約成熟度。
- 21 個 Baseline／Active 頁面全部至少出現在一條依賴鏈。
- 集中標示 GGAP 對接、通知中心與系統設定三項 Deferred 外部依賴。
- 定義共用契約優先級，避免下游頁面重複發明 Game Round、財務、風控或發布口徑。

## 0.5.0-page-reconciliation · 2026-08-14

- 新增第一階段 21 頁三層校準表。
- 逐頁區分已確認產品規則、現行原型實況與目標草案／待確認內容。
- 標示大致一致、邊界注意及原型缺口，避免 mock 被誤讀為正式契約。
- 明確註記代理商／商戶／會員快照、DEMO 餘額、通知依賴及高擬真告警操作的責任限制。
- Deferred 11 頁維持不校準，等待必要輸入齊備後再加入。

## 0.4.0-readiness-audit · 2026-08-14

- 新增第一階段 21 頁逐面向完成度矩陣。
- 以「完整／部分／缺少／不適用」評估產品、UI 與開發交付面向，不使用主觀百分比。
- 集中列出頁面 route、元件、原型、來源、成熟度、製作範圍與批次。
- 建立 A–D 四批次及每頁待補主題，作為後續規格整理輸入。
- Deferred 11 頁不進行內容完成度評估，避免在必要輸入不足時產生推測規格。

## 0.3.0-scope-freeze · 2026-08-14

- 將規格成熟度與製作範圍拆分為兩個獨立維度。
- 凍結第一階段 32 頁範圍：1 頁 Baseline、20 頁 Active、11 頁 Deferred。
- GGAP 對接、通知中心與系統設定共 11 頁延後製作。
- 延後頁面改為最小等待說明，不產生推測性的畫面、欄位、API、權限或驗收骨架。
- 「環境與發布」維持 Active，但只整理 Provider 自有發布責任；GGAP 整合行為留待正式規格。

## 0.2.0-authoring-baseline · 2026-08-14

- 定版規格網站的 Overview-first 閱讀結構與內容頁版型。
- 將頁面示意移至追溯資訊後，加入區塊索引、章節高亮、展開／收合與返回入口。
- 精簡追溯卡與畫面示意，統一藍色標註並增加有效閱讀空間。
- 取消規格內文固定最大寬度，使內文填滿右側頁內目錄以外的主欄。
- 新增可獨立分享與跨專案移植的《產品規格網站撰寫與交接規範》。
- 本版本確認撰寫格式；個別產品內容仍依 Confirmed、Draft、Outline、TBD 分別治理。

## 0.1.0-structure · 2026-08-13

- 建立 Provider Portal 規格網站完整章節樹。
- 建立九個模組與 32 個內容頁集中索引。
- 區分規格成熟度與頁面原型成熟度。
- 建立文件治理、共通規則、技術附錄與 QA 章節。
- 以「遊戲紀錄」建立第一個完整頁面規格模板。
- 將規格網站外框對齊 Provider Portal 的 Apple HIG 設計語言，同時保留文件介面辨識。
- 依 `/reports` 原型補入可跳轉章節的六區塊 HTML/CSS 畫面解剖圖。

## 後續版本方向

- Phase 3 依 Domain／Data、API、Security、Lifecycle、Monitoring／Risk、QA／NFR 等共用契約收斂集中 TBD。
- 優先處理跨頁共用決策，避免頁面個別發明 Game Round、財務、監控、風控、權限或整合契約。
- 取得必要輸入後，再將 Deferred 頁面重新排入範圍。
- 第一個正式核准版本輸出單一 HTML 與 PDF 快照。
