# Decision Pack 02｜監控與風控共用產品契約

<section class="decision-pack-hero decision-pack-hero--risk" data-pack="DP / 02" aria-label="Decision Pack 02 摘要">
  <div class="decision-pack-hero__identity">
    <span>PHASE 3 · PRODUCT CONTRACT 02</span>
    <strong>從可觀測訊號，到可追蹤、可處理、可復原的風控閉環</strong>
    <p>本包直接定義 Provider Portal 希望具備的監控與風控功能，作為老闆、產品、前端、後端、QA 與 SRE 的共同分析基準；實際 Backend 與 GGAP 契約差異，於取得證據後以版本更新處理。</p>
  </div>
  <div class="decision-pack-hero__stats">
    <div><strong>05</strong><span>共用契約群組</span></div>
    <div><strong>03</strong><span>核心內容頁</span></div>
    <div><strong>02</strong><span>納管環境</span></div>
    <div><strong>01</strong><span>完整處理閉環</span></div>
  </div>
  <nav class="decision-pack-hero__nav" aria-label="五項契約快速導覽">
    <a href="#1-領域模型與責任鏈"><b>01</b><span>領域模型</span></a>
    <a href="#2-risk-event-與-alert-生命週期"><b>02</b><span>事件與告警</span></a>
    <a href="#3-規則評估與嚴重度"><b>03</b><span>規則評估</span></a>
    <a href="#4-緩解工作與隔離控制"><b>04</b><span>緩解與隔離</span></a>
    <a href="#5-ggap-通知-可靠性與稽核"><b>05</b><span>可靠性與稽核</span></a>
  </nav>
</section>

## 文件定位

| 項目 | 目前需求基準 |
|---|---|
| 契約編號 | `DP-02` |
| 主題 | Provider 自身監控、Risk Event、Alert、Mitigation Job、隔離與 GGAP 通知 |
| 直接影響頁面 | 監控總覽、風控報表、風控告警／處理 |
| 間接影響頁面 | 儀表板、遊戲紀錄、遊戲環境與發布 |
| 納管環境 | Production 與 DEMO 分開評估；Test 完全排除 |
| 現行程式 | 三個頁面已有高擬真前端 mock；正式偵測、持久化與副作用尚待後續實作 |
| 文件用途 | 表達目前希望的完整產品功能；交付評估後的調整以新版本修訂 |

本包不把「尚未接上正式 Backend」解讀為產品內容未成立。產品行為依本包描述；API path、資料表、權限 key、實際門檻數值及 GGAP payload 等實作細節，待取得後端證據後對照修正。

## 不可違反的產品邊界

1. Provider 只監控自身遊戲服務、Game Round、遊戲數值、資料品質及與 GGAP 的直接對接，不監控 GGAP 與代理商之間的下游營運。
2. Production 與 DEMO 的資料、規則、事件、告警及隔離狀態必須分開；Test 不產生 Provider Risk Event 或 Alert。
3. Risk Event 是客觀異常紀錄；Alert 是需要人員處理的工作項目，兩者不得共用同一狀態欄位。
4. 隔離只阻擋指定範圍的新 Launch；已開始的 Game Round 必須繼續完成，不得因隔離中斷結算。
5. 監控與風控不得直接修改投注、派彩、換算結果或已結算 Game Round，也不得以隔離取代正式回滾或補償。
6. 前端頁面是否開啟，不得影響後端持續偵測、建立事件、執行核准動作或保存稽核證據。

## 整體處理鏈

<ol class="risk-contract-flow" aria-label="監控與風控處理鏈">
  <li><b>01</b><strong>Monitoring Signal</strong><span>服務、Round、對接與數值的原始量測</span></li>
  <li><b>02</b><strong>Detection Result</strong><span>單次規則評估結果與完整證據</span></li>
  <li><b>03</b><strong>Risk Event</strong><span>去重後的客觀異常生命週期</span></li>
  <li><b>04</b><strong>Alert</strong><span>需要接手、調查與結案的工作項目</span></li>
  <li><b>05</b><strong>Mitigation Job</strong><span>可重試、可驗證的緩解或隔離工作</span></li>
  <li><b>06</b><strong>Recovery</strong><span>健康驗證、解除、通知與完整稽核</span></li>
</ol>

鏈上每一層都保存自己的 ID、時間、狀態與版本，不以一個巨型 `status` 代替所有進度。上游證據不可因下游結案而被刪除或覆寫。

---

## 1. 領域模型與責任鏈

<div class="decision-item-meta"><span>DP02-01</span><a href="open-issues.html#tbd-dom-004">TBD-DOM-004</a><a href="open-issues.html#tbd-dat-005">TBD-DAT-005</a><i>Product · Risk · Backend · SRE</i></div>

<aside class="decision-recommendation">
  <strong>目前需求基準</strong>
  <p>監控量測、規則判斷、客觀事件、人工工作與實際副作用分層保存。任何頁面都不得把 Signal、Risk Event、Alert 或隔離狀態當成同一筆資料。</p>
</aside>

### 1.1 核心物件

| 物件 | 正式責任 | 建議主識別 | 保存原則 |
|---|---|---|---|
| Monitoring Signal | 原始或聚合後的可觀測量測 | `signal_id` 或時間序列 key | 保留來源、時間、環境、scope 與資料品質 |
| Detection Result | 某規則版本在某次評估窗口的判斷 | `detection_result_id` | 不論命中與否均可追蹤評估時間、樣本與門檻 |
| Risk Event | 同一異常在一段生命週期中的客觀紀錄 | `risk_event_id` | 以 fingerprint 去重，累積 occurrence 與 evidence |
| Alert | 需要人員接手與結案的工作項目 | `alert_id` | 第一版一個 Risk Event 最多一個主要 Alert |
| Mitigation Job | 一次具體緩解、隔離、解除或通知工作 | `mitigation_job_id` | 每次執行獨立保存狀態、attempt、結果與錯誤 |
| Isolation Control | Launch Gate 希望狀態與實際狀態 | `isolation_id` | 以 environment、game、version、scope 精確控制 |
| GGAP Delivery | Provider 對 GGAP 的對接通知投遞 | `delivery_id` | 使用 outbox、冪等 key、有限重試與 ACK 追蹤 |

### 1.2 關聯與基數

- 一個 Monitoring Signal 可以被多個規則版本評估。
- 一個 Detection Result 只屬於一個規則版本與一個評估窗口。
- 多次命中同一 fingerprint 的結果可累積到同一個有效 Risk Event。
- 第一版一個 Risk Event 對應零或一個主要 Alert；Info／Low 或不需人工處理的事件可以沒有 Alert。
- 一個 Alert 可以關聯多個 Mitigation Job、隔離變更與 GGAP Delivery。
- 同一 Risk Event 可關聯多筆 Game Round 作證據，但 Risk Event 不取代 Game Round。

### 1.3 Fingerprint、去重與復發

`event_fingerprint` 至少由 `provider_id`、`environment`、異常來源、異常類型、`rule_id`、遊戲／版本 scope 及必要業務維度產生；不得包含會隨每次評估變動的時間戳或實際數值。

- 同一 fingerprint 在 Event 尚未結束時再次命中：沿用 `risk_event_id`，增加 `occurrence_count`、`last_detected_at` 與 evidence。
- 指標短暫恢復後又在恢復觀察期內命中：沿用原 Event，狀態回到 `open`。
- Event 已 `resolved` 後再次命中：建立新的 Risk Event，透過 `recurrence_group_id` 連回先前事件。
- 規則錯誤、資料污染或重複建檔：Event 可標記 `invalidated`，但原始 Detection Result 與稽核證據仍保留。

---

## 2. Risk Event 與 Alert 生命週期

<div class="decision-item-meta"><span>DP02-02</span><a href="open-issues.html#tbd-dom-004">TBD-DOM-004</a><a href="open-issues.html#tbd-dat-004">TBD-DAT-004</a><i>Product · Risk · Backend · QA</i></div>

<aside class="decision-recommendation">
  <strong>目前需求基準</strong>
  <p>Risk Event 只描述異常是否仍存在；Alert 只描述人工作業進度。指派、等待原因、緩解、隔離與 GGAP 通知均使用獨立欄位或資源。</p>
</aside>

### 2.1 Risk Event 狀態

| API 值 | 顯示名稱 | 進入條件 | 可離開至 |
|---|---|---|---|
| `open` | 異常中 | 規則命中且異常仍存在，或恢復觀察期內再次命中 | `recovering`、`invalidated` |
| `recovering` | 恢復觀察中 | 已低於恢復門檻，但尚未滿足連續健康窗口 | `resolved`、`open`、`invalidated` |
| `resolved` | 已恢復 | 已滿足恢復門檻與連續健康窗口 | 終態；復發建立新 Event |
| `invalidated` | 已作廢 | 證據無效、資料污染、規則錯誤或確認為重複事件 | 終態；不得計入有效風控統計 |

Event 狀態由偵測與證據決定，不因使用者「接手」或「結案」直接改變。`resolved` 也不代表關聯 Alert 已完成結案作業。

### 2.2 Alert 狀態

| API 值 | 顯示名稱 | 主要語意 |
|---|---|---|
| `new` | 待接手 | 已建立工作項目，尚未開始有效處理 |
| `in_progress` | 處理中 | 已接手、調查或執行必要緩解 |
| `monitoring` | 觀察中 | 主要影響已控制，等待健康觀察、解除或最終覆核 |
| `closed` | 已結案 | 必要工作完成，已記錄結案原因與結果 |

Alert 可以重新開啟至 `in_progress`，但必須保存重新開啟原因、操作者與前後版本。`false_positive` 不再是 Alert 狀態，而是結案時的 `resolution_code`。

第一版 `resolution_code`：

| 值 | 使用情境 |
|---|---|
| `recovered` | 異常已恢復，必要緩解、解除與通知均完成 |
| `false_positive` | 規則命中但確認不構成有效風險 |
| `duplicate` | 與另一筆有效事件重複，保留關聯主事件 |
| `accepted_risk` | 已評估並接受剩餘風險；必須填寫原因及覆核資訊 |
| `manual_resolution` | 透過人工處置完成，且不屬於以上分類 |

### 2.3 必須分開的狀態維度

| 維度 | 目的 | 範例 |
|---|---|---|
| `alert_status` | 人工作業進度 | `new`、`in_progress`、`monitoring`、`closed` |
| `assignee_id` | 目前負責人 | 未指派時為 `null`，不得用假帳號 sentinel 儲存 |
| `waiting_reason` | 目前等待事項 | 健康觀察、GGAP ACK、核准或外部處理 |
| `mitigation_status` | 關聯工作的彙總狀態 | 無需、等待、執行中、成功、部分失敗、失敗 |
| `isolation_actual_state` | Launch Gate 實際狀態 | 未隔離、套用中、隔離中、解除中、失敗 |
| `ggap_notification_status` | 對接投遞結果 | 無需、待送、已送、已確認、失敗 |

### 2.4 結案守門條件

Alert 只有在以下條件全部成立時才可 `closed`：

1. 已選擇 `resolution_code` 並填寫可稽核原因。
2. 所有必要 Mitigation Job 均已完成，或以具名核准方式明確豁免。
3. 不存在仍在套用、解除或失敗待處理的隔離工作。
4. 若 desired state 為未隔離，Launch Gate 的 actual state 也必須是未隔離。
5. 必要 GGAP 通知已 `acknowledged`，或已依權限記錄人工豁免與後續責任人。
6. Alert 使用最新資料版本送出，未覆蓋其他操作者的更新。

---

## 3. 規則評估與嚴重度

<div class="decision-item-meta"><span>DP02-03</span><a href="open-issues.html#tbd-dat-005">TBD-DAT-005</a><a href="open-issues.html#tbd-dat-003">TBD-DAT-003</a><i>Risk · SRE · Game Math · Backend</i></div>

<aside class="decision-recommendation">
  <strong>目前需求基準</strong>
  <p>規則必須版本化並保存完整評估快照。門檻不寫死在前端；觸發與恢復使用不同條件，並以最小樣本與連續窗口避免抖動。</p>
</aside>

### 3.1 Rule Definition

每個規則版本至少包含：

| 分類 | 必要內容 |
|---|---|
| 識別與版本 | `rule_id`、`rule_version`、名稱、說明、狀態、建立／啟用時間 |
| 適用範圍 | Provider、environment、異常來源、遊戲、版本、endpoint 或其他業務維度 |
| 量測定義 | metric、聚合函式、分子、分母、排除條件與資料來源 |
| 評估節奏 | observation window、evaluation interval、最小樣本量與允許資料延遲 |
| 判斷條件 | trigger threshold、recovery threshold、連續命中／健康窗口 |
| 嚴重度 | Info、Low、Medium、High、Critical 的分級條件與升降級規則 |
| 後續政策 | 是否建立 Alert、覆核時限、automation mode 及允許的動作模板 |

已啟用版本不可原地修改。調整門檻或 scope 必須建立新版本；Risk Event 保存命中當下的規則版本與判斷快照，歷史事件不套用新門檻重算。

規則版本狀態使用 `inactive`、`active`、`retired`。同一 `rule_id`、environment 與重疊 scope 在同一時間只允許一個有效版本。

### 3.2 評估結果

Detection Result 至少保存：

- 評估窗口 `[window_start, window_end)`、`evaluated_at` 與資料新鮮度。
- `sample_count`、分子、分母、聚合值及單位。
- trigger／recovery threshold、嚴重度區間與 `rule_version`。
- `matched`、`no_data`、`insufficient_sample` 或 `evaluation_failed` 等結果原因。
- 關聯遊戲、版本、environment、endpoint 與可追蹤來源。

`no_data`、樣本不足與評估失敗不得被當成健康。它們可依規則形成 Data Quality 或 Monitoring Pipeline 類型的 Risk Event，但不能偽造業務指標為 0。

### 3.3 觸發、恢復與嚴重度

- 規則可要求連續 N 個窗口命中後才建立或升級 Risk Event。
- 恢復門檻必須與觸發門檻分離，形成 hysteresis，避免指標在邊界反覆開關。
- `recovering` 必須通過連續健康窗口才可 `resolved`。
- 嚴重度表示影響程度，不等於自動化授權；Critical 也必須由 automation policy 決定能否自動隔離。
- 事件嚴重度升級沿用同一 `risk_event_id` 並保留歷程；降級不刪除先前高嚴重度證據。
- Production 與 DEMO 可使用不同規則版本與門檻，但不可混合樣本或共用 Event。

### 3.4 第一版規則類型

| 來源 | 典型指標／條件 |
|---|---|
| Game Service | health check、啟動成功率、錯誤率、資源或依賴異常 |
| Game Round | 成功率、處理中逾時、狀態與結算結果不一致 |
| GGAP Integration | request failure、timeout、P95／P99 latency、Callback／ACK 異常 |
| Data Quality | 必填缺值、重複 ID、非法狀態轉移、金額或版本不一致 |
| Game Math | RTP、命中率、派彩分布或其他需滿足最小樣本的數值偏離 |

正式數值門檻與樣本量由後端、SRE、風控及數值團隊依遊戲與環境設定；本規格定義的是必須具備的設定能力與判斷行為。

---

## 4. 緩解工作與隔離控制

<div class="decision-item-meta"><span>DP02-04</span><a href="open-issues.html#tbd-api-004">TBD-API-004</a><a href="open-issues.html#tbd-sec-003">TBD-SEC-003</a><i>Risk · Backend · SRE · Security</i></div>

<aside class="decision-recommendation">
  <strong>目前需求基準</strong>
  <p>所有會改變營運狀態的動作都建立 Mitigation Job。Alert 只發出意圖，不直接把按鈕點擊當成成功；系統必須回報實際執行狀態與健康驗證結果。</p>
</aside>

### 4.1 Automation Mode

| 模式 | 系統行為 | 適用原則 |
|---|---|---|
| `observe_only` | 只建立證據與 Event；必要時建立 Alert | 新規則、低信心或只需觀察的場景 |
| `approval_required` | 產生建議動作，等待具權限人員確認後建立 Job | 高影響、Production 或需要覆核的動作 |
| `automatic` | 命中核准政策後直接建立 Job，同時建立 Alert 供人工覆核 | 可逆、最小作用範圍且已有可靠健康檢查的動作 |

automation mode 綁定規則版本與動作模板；前端不得自行提升模式或擴大作用範圍。

### 4.2 Mitigation Job

| 狀態 | 語意 |
|---|---|
| `queued` | 已接受命令，等待執行 |
| `running` | 執行中；不得重複觸發同一冪等工作 |
| `succeeded` | 動作已完成，並保存結果與驗證證據 |
| `failed` | 已停止重試或發生不可恢復錯誤，需要人工處理 |
| `cancelled` | 尚未產生副作用前由核准流程取消 |

每個 Job 保存 `action_type`、target scope、requested by、approved by、`idempotency_key`、attempt、開始／完成時間、前後狀態、錯誤、trace ID 及驗證結果。重試建立新的 attempt，不覆寫前一次失敗證據。

### 4.3 隔離 desired／actual state

| 欄位 | 值 | 說明 |
|---|---|---|
| `desired_state` | `not_isolated`、`isolated` | 目前期望 Launch Gate 達成的狀態 |
| `actual_state` | `not_isolated`、`applying`、`isolated`、`releasing`、`failed` | Launch Gate 回報的實際狀態 |

- UI 必須同時呈現 desired 與 actual；兩者不一致時顯示「套用中／解除中／失敗」，不得提前宣告成功。
- 隔離 target 至少包含 environment、game；可再縮小至 version 或 endpoint。不得用模糊名稱作唯一 target。
- 隔離只阻擋新 Launch，既有 Game Round、Callback、結算及必要查單仍繼續處理。
- 不採用單純到期自動解除。解除前必須完成最新健康檢查、必要觀察窗口與具權限確認。
- 隔離或解除失敗時保留 desired state，actual state 標示 `failed`，建立或升級 Alert。
- GGAP 的代理商個別遊戲開關不等於 Provider 隔離；Provider 不管理其代理商開放設定。

### 4.4 健康驗證與可用操作

解除前的 health verification 至少回傳檢查版本、檢查時間、対象 scope、結果、失敗項目、樣本窗口及資料新鮮度。過期、無資料或部分失敗不能視為通過。

Alert 詳情的操作按鈕由後端回傳 `allowed_actions` 決定，前端仍可顯示禁止原因。後端必須再次驗證權限、最新版本、守門條件與 idempotency，不得信任前端顯示狀態。

---

## 5. GGAP 通知、可靠性與稽核

<div class="decision-item-meta"><span>DP02-05</span><a href="open-issues.html#tbd-nfr-003">TBD-NFR-003</a><a href="open-issues.html#tbd-ext-001">TBD-EXT-001</a><i>Backend · SRE · GGAP · Security</i></div>

<aside class="decision-recommendation">
  <strong>目前需求基準</strong>
  <p>Provider 的本地狀態變更與 GGAP 通知採 outbox 可靠投遞。重送沿用相同業務冪等 key；通知失敗必須可見、可重試且不回滾已正確生效的安全隔離。</p>
</aside>

### 5.1 GGAP Delivery

Provider 至少對以下事件提供版本化通知能力：隔離已套用、隔離已解除、隔離範圍或原因更新。正式 event name 及 payload 由取得 GGAP Backend 契約後對照。

每筆 Delivery 至少保存：

- `delivery_id`、`event_type`、`payload_version` 與 target GGAP environment。
- `risk_event_id`、`alert_id`、`isolation_id` 及精確遊戲／版本／環境 scope。
- `idempotency_key`、payload snapshot、建立時間及預期狀態。
- attempt 次數、最後送出時間、HTTP／協定結果、GGAP trace ID 與 ACK 時間。

投遞狀態使用 `pending`、`sending`、`sent`、`acknowledged`、`failed`。`sent` 只代表請求已成功送出；只有符合契約的 ACK 才能標記 `acknowledged`。

### 5.2 重試、補償與狀態真實性

- 本地交易完成狀態變更與 outbox 寫入，避免狀態已變更但通知永久遺失。
- 暫時性錯誤依退避策略有限重試；永久錯誤或重試耗盡標記 `failed` 並升級 Alert。
- 人工重送沿用相同業務冪等 key，新增 delivery attempt，不建立重複隔離效果。
- 通知失敗不應自動解除已生效的安全隔離；需由人員查看本地 actual state 與 GGAP 回報後決定後續處理。
- 若 GGAP 回報與 Provider actual state 不一致，建立 reconciliation evidence 並顯示需要人工確認，不以任一方最新值靜默覆寫歷史。

### 5.3 併發、權限與稽核

- Alert、Mitigation Job、Isolation Control 與 Delivery 都具備 `version` 或等價併發控制。
- 所有 command 接受 `idempotency_key`；相同 key 與相同 payload 回傳原結果，相同 key 與不同 payload 必須拒絕。
- 接手、改派、備註、維持隔離、解除、重試、豁免、結案與重新開啟均保存 actor、時間、原因、前後值、request／trace ID。
- 權限 key 與雙人核准角色待系統設定規格補齊；在此之前，產品行為仍要求後端強制授權、敏感操作重新確認及完整 audit。
- 系統通知中心屬 Deferred，不影響 Alert 工作佇列、GGAP Delivery 或操作時間線的正式保存。

## 三個頁面的產品分工

| 頁面 | 核心問題 | 主要單位 | 允許操作 |
|---|---|---|---|
| 監控總覽 | 現在是否健康、哪裡需要關注？ | 當前狀態與分析窗口 | 唯讀、篩選、重新整理與精確導流 |
| 風控報表 | 發生了什麼、證據與影響為何？ | Risk Event | 唯讀查詢、詳情、匯出與導向 Alert／Game Round |
| 風控告警／處理 | 誰負責、下一步做什麼、是否可結案？ | Alert | 接手、指派、備註、緩解、隔離、解除、重送與結案 |

Dashboard 只顯示跨模組摘要與工作入口，不建立另一套 Risk Event 或 Alert 真實來源。遊戲紀錄只提供關聯 Game Round 證據，不承擔告警處理。

## 原型與後續實作對照

| 能力 | 現行 Portal | 本規格要求的後續結果 |
|---|---|---|
| 三個頁面、篩選、列表、詳情、deep link | 已有高擬真 mock | 保留資訊架構並換用正式模型 |
| 目前狀態 enum | Event／Alert 處理概念混用 | 改為本包的 Event 與 Alert 獨立生命週期 |
| 操作按鈕 | 只修改前端本地狀態 | 建立 command、Job、實際狀態與 audit |
| 規則與指標 | 固定 mock 數字與情境 | 版本化規則、Detection Result 與正式資料來源 |
| 隔離與解除 | 模擬成功／失敗畫面 | Launch Gate desired／actual state 與健康驗證 |
| GGAP 通知 | 模擬狀態 | outbox、冪等、ACK、重試與 reconciliation |

目前這個 session 只建立規格網站內容，不修改 `MonitoringOverview.vue`、`RiskReports.vue` 或 `RiskAlerts.vue`。後續開發 session 應以本包、同步後的原始 Spec MD 及頁面規格共同實作。

## 外部驗證點

以下內容不改變產品功能方向，但需在取得 GGAP 或現行 Backend Git 後填入實際值：

1. 正式 API path、資料表、migration、enum 命名及狀態轉換實作。
2. 指標來源、查詢方式、資料延遲、評估排程及第一批實際門檻。
3. Launch Gate 的實際整合點、scope 能力與健康檢查介面。
4. GGAP payload、簽章、event name、ACK、錯誤碼、重試與查詢契約。
5. 正式 permission key、雙人核准角色、資料保存年限及 audit 匯出方式。
6. 既有 Backend 若已有 Event、Alert 或 Job 模型，與本包的欄位及狀態差異。

取得證據後應輸出差異表，逐項選擇「沿用現況、調整 Backend、調整規格或增加相容層」，不得直接用實作細節靜默覆蓋本需求基準。

## 規格同步範圍

本包完成審閱後，下一步同步更新：

- `docs/PROVIDER_RISK_CONTROL_SPEC.md`
- `docs/PROVIDER_MONITORING_OVERVIEW_SPEC.md`
- `docs/PROVIDER_RISK_REPORT_SPEC.md`
- `docs/PROVIDER_RISK_ALERT_HANDLING_SPEC.md`
- 規格網站的監控總覽、風控報表、風控告警／處理、共通 enum、資料字典及 API／QA 章節

同步時以本包的領域模型與生命週期為上游，頁面文件只描述各自呈現與操作，不重複發明不同狀態。
