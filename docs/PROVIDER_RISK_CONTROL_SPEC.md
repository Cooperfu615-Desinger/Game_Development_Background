# Provider 監控與風控共用產品規範

> 版本：0.4.0
> 更新日期：2026-08-17
> 狀態：目前需求基準；正式 API path、資料表、門檻、權限與 GGAP payload 待取得 Backend 證據後對照

本文件是 Provider Portal 監控總覽、風控報表與風控告警／處理頁面的共用上游，定義 Provider 自身監控、規則評估、Risk Event、Alert、Mitigation Job、隔離、GGAP 通知及稽核的產品契約。

目前需求基準以 [`Decision Pack 02｜監控與風控共用產品契約`](./spec-book/content/appendices/decision-pack-02-monitoring-risk.md) 為依據。尚未接上正式 Backend 不代表本文件的產品行為未成立；實作差異取得後以版本更新，不另維護競爭的事件或告警模型。

## 1. 規範目的

- 統一 Monitoring Signal、Detection Result、Risk Event、Alert 與實際副作用的責任。
- 讓每筆異常可追溯至規則版本、遊戲、環境、Game Round、GGAP 對接事件與處理工作。
- 讓監控觀察、事件分析及人工處理各自使用正確資料單位。
- 確保重複偵測、復發、緩解失敗、隔離與通知都可追蹤、可重試、可稽核。
- 避免把 GGAP 平台、代理商、商戶、會員、錢包或下游風控責任混入 Provider Portal。

## 2. 責任與資料邊界

### 2.1 Provider 負責

- 自身遊戲服務、必要依賴及健康檢查。
- Launch、Game Round、Settle、Callback 與直接 GGAP 對接的成功、錯誤、延遲及資料品質。
- 遊戲版本、數值、RTP、派彩分布及其他遊戲商可觀測的 Game Math 異常。
- 規則評估、Risk Event、Alert、Mitigation Job、隔離、恢復與稽核證據。
- 對 GGAP 的隔離／解除等通知，以及本地狀態與 GGAP 回報的差異追蹤。

### 2.2 GGAP 負責

- GGAP 平台健康、聚合層級監控及平台風控。
- 代理商、商戶、會員、平台錢包、平台交易及合規風控。
- GGAP 與代理商之間的下游營運、遊戲開放、網路及會員驗證狀態。
- 多家 Provider 的聚合判斷及 GGAP 自身處理流程。

Provider 可以保存 GGAP 傳入的代理商、商戶、會員及幣別脈絡作為交易或異常 snapshot，但不建立或管理其主資料，也不得把未抵達 Provider 的下游問題推定為 Provider 已觀測事實。

### 2.3 環境邊界

- Production 與 DEMO 使用相同領域模型，但 Signal、規則版本、Detection Result、Risk Event、Alert、Mitigation Job、隔離及投遞狀態必須分開。
- 查詢與摘要一次只使用一個環境，不得跨環境去重或聚合。
- Test 完全排除，不產生 Provider Risk Event 或 Alert，也不進監控與風控摘要。
- DEMO 的隔離或通知不得改變 Production 狀態；Production 的規則、門檻或事件也不得套用至 DEMO 資料。

### 2.4 不可違反的操作邊界

- 監控或風控不得直接修改投注、派彩、點數／USDT 換算、已結算 Game Round 或財務報表結果。
- 隔離只阻擋精確範圍的新 Launch；既有 Game Round、Settle、Callback、查單與必要重試持續完成。
- 隔離不等於 GGAP 針對個別代理商的遊戲開關，也不取代正式下架、回滾或財務補償。
- 前端頁面是否開啟，不得影響後端偵測、持久化、執行核准工作或保存稽核證據。

## 3. 三個頁面的責任分工

| 頁面 | 核心問題 | 主要資料單位 | 允許操作 |
|---|---|---|---|
| 監控總覽 | 現在是否健康、哪裡需要關注？ | 當前狀態、Signal 與分析窗口聚合 | 唯讀、篩選、重新整理與精確導流 |
| 風控報表 | 發生了什麼、證據與影響為何？ | Risk Event | 唯讀查詢、詳情、匯出與導向 Alert／Game Round |
| 風控告警／處理 | 誰負責、下一步做什麼、是否可結案？ | Alert | 接手、指派、備註、建立工作、隔離、解除、重送與結案 |

Dashboard 只顯示上述來源的跨模組摘要與入口，不建立第四套 Risk Event、Alert 或健康狀態真實來源。風控報表不取代遊戲紀錄；單筆 Round 完整內容仍由 `/reports` 負責。

## 4. 共用領域模型

整體處理鏈固定為：

```text
Monitoring Signal
→ Detection Result
→ Risk Event
→ Alert
→ Mitigation Job
→ Recovery / GGAP Delivery / Audit
```

| 物件 | 正式責任 | 建議識別 | 保存原則 |
|---|---|---|---|
| Monitoring Signal | 原始或聚合後的可觀測量測 | `signal_id` 或時間序列 key | 保存來源、時間、environment、scope、單位與資料品質 |
| Detection Result | 某規則版本在某評估窗口的判斷 | `detection_result_id` | 命中與未命中都可追蹤樣本、門檻與結果原因 |
| Risk Event | 同一異常生命週期的客觀紀錄 | `risk_event_id` | fingerprint 去重，累積 occurrence 與 evidence |
| Alert | 需要人員接手與結案的工作項目 | `alert_id` | 第一版一個 Event 最多一個主要 Alert |
| Mitigation Job | 一次具體緩解、隔離、解除或通知工作 | `mitigation_job_id` | 每次執行保存狀態、attempt、結果與錯誤 |
| Isolation Control | Launch Gate 的希望與實際狀態 | `isolation_id` | 精確綁定 environment、game、version 與 scope |
| GGAP Delivery | Provider 對 GGAP 的通知投遞 | `delivery_id` | outbox、冪等 key、有限重試與 ACK 追蹤 |

### 4.1 關聯與基數

- 一個 Monitoring Signal 可以被多個規則版本評估。
- 一個 Detection Result 只屬於一個規則版本及一個評估窗口。
- 多次命中同一 fingerprint 的結果可累積至同一有效 Risk Event。
- 第一版一個 Risk Event 對應零或一個主要 Alert；Info／Low 或不需人工處理的事件可以沒有 Alert。
- 一個 Alert 可以關聯多個 Mitigation Job、Isolation Control 變更與 GGAP Delivery。
- 一個 Risk Event 可以關聯多筆 Game Round；Risk Event 不取代 Round，也不得共用其識別碼。

### 4.2 識別與快照

- `risk_event_id`、`alert_id`、`mitigation_job_id`、`isolation_id` 與 `delivery_id` 各自永久穩定，不因狀態更新而更換。
- `provider_event_id` 用於 Provider／GGAP 對接事件，`request_id` 用於 logical command／冪等，兩者都不等於 `risk_event_id`。
- Event 保存遊戲、版本、environment、規則版本、異常類型、嚴重度、first／last detected time、occurrence、影響範圍及 evidence snapshot。
- 外部 Round、代理商或 opaque member reference 只作關聯脈絡，遵循正式遮罩與查詢權限，不形成 Provider 主資料。
- 精確 ID 格式、資料表與唯一索引由 Backend 實作證據對照；產品要求是穩定、不可回收、跨頁一致且可追蹤。

## 5. Signal、Detection Result 與規則評估

### 5.1 第一版 Signal 來源

| 來源 | 典型量測／條件 |
|---|---|
| Game Service | health check、啟動成功率、錯誤率、依賴或資源異常 |
| Game Round | 成功率、處理中逾時、狀態與結算結果不一致 |
| GGAP Integration | request failure、timeout、P50／P95／P99 latency、Callback／ACK 異常 |
| Data Quality | 必填缺值、重複 ID、非法狀態轉移、金額或版本不一致 |
| Game Math | RTP、命中率、派彩分布或其他需滿足最小樣本的數值偏離 |

失敗、逾時與延遲必須分開：失敗表示已有明確失敗結果；逾時表示等待上限內沒有必要結果；延遲表示流程已完成但耗時超過門檻。資料缺失、樣本不足與評估失敗不得被當成健康或數值 0。

### 5.2 Rule Definition

每個規則版本至少包含：

- `rule_id`、`rule_version`、名稱、說明、狀態、建立及啟用時間。
- Provider、environment、異常來源、遊戲、版本、endpoint 或其他適用 scope。
- metric、聚合函式、分子、分母、排除條件、單位及資料來源。
- observation window、evaluation interval、最小樣本量及允許資料延遲。
- trigger threshold、recovery threshold、連續命中／健康窗口及嚴重度條件。
- 是否建立 Alert、覆核時限、automation mode 與允許的動作模板。

規則版本狀態使用 `inactive`、`active`、`retired`。已啟用版本不可原地修改；同一 `rule_id`、environment 與重疊 scope 同一時間只允許一個有效版本。Event 保存命中當下規則 snapshot，歷史不得套用新門檻重算。

### 5.3 Detection Result

Detection Result 至少保存：

- `[window_start, window_end)`、`evaluated_at`、資料新鮮度與 environment。
- `sample_count`、分子、分母、聚合值及單位。
- trigger／recovery threshold、嚴重度區間與 `rule_version`。
- `matched`、`no_data`、`insufficient_sample` 或 `evaluation_failed` 等結果原因。
- 關聯遊戲、版本、endpoint、Round evidence 與可追蹤來源。

規則可以要求連續 N 個窗口命中後才建立或升級 Event。恢復使用不同門檻形成 hysteresis，並通過連續健康窗口後才可完成恢復。

## 6. Risk Event 生命週期

Risk Event 只描述客觀異常是否仍存在，不表示是否有人接手、是否隔離或 GGAP 是否已 ACK。

| API 值 | 顯示名稱 | 進入條件 | 可離開至 |
|---|---|---|---|
| `open` | 異常中 | 規則命中且異常仍存在，或恢復觀察期內再次命中 | `recovering`、`invalidated` |
| `recovering` | 恢復觀察中 | 已低於恢復門檻，但尚未滿足連續健康窗口 | `resolved`、`open`、`invalidated` |
| `resolved` | 已恢復 | 已滿足恢復門檻與連續健康窗口 | 終態；復發建立新 Event |
| `invalidated` | 已作廢 | 證據無效、資料污染、規則錯誤或確認為重複事件 | 終態；不得計入有效風控統計 |

Event 狀態由 Detection Result 與證據決定，不因接手、結案、誤報或隔離按鈕直接改變。`false_positive` 不是 Event 狀態；確認規則或資料無效時使用 `invalidated` 並保留原因。

### 6.1 Fingerprint、去重與復發

`event_fingerprint` 至少由 `provider_id`、environment、異常來源、異常類型、`rule_id`、遊戲／版本 scope 及必要業務維度產生，不包含每次變動的時間戳或實際值。

- 同一 fingerprint 在 Event 有效時再次命中：沿用 `risk_event_id`，增加 `occurrence_count`、`last_detected_at` 與 evidence。
- 指標短暫恢復後在恢復觀察期內再次命中：沿用原 Event，狀態回到 `open`。
- Event 已 `resolved` 後再次命中：建立新的 Risk Event，透過 `recurrence_group_id` 連回先前事件。
- 規則錯誤、資料污染或重複建檔：Event 轉為 `invalidated`，Detection Result 與 audit 仍保留。

## 7. Alert 生命週期與結案

Alert 只描述人工作業進度，與 Event、緩解、隔離及投遞狀態分開。

| API 值 | 顯示名稱 | 主要語意 |
|---|---|---|
| `new` | 待接手 | 工作項目已建立，尚未開始有效處理 |
| `in_progress` | 處理中 | 已接手、調查或執行必要緩解 |
| `monitoring` | 觀察中 | 主要影響已控制，等待健康觀察、解除或最終覆核 |
| `closed` | 已結案 | 必要工作完成並記錄結案原因及結果 |

Alert 可以從 `closed` 重新開啟至 `in_progress`，但必須保存原因、操作者及前後版本。結案結果使用獨立 `resolution_code`：

| 值 | 使用情境 |
|---|---|
| `recovered` | 異常已恢復，必要緩解、解除及通知均完成 |
| `false_positive` | 規則命中但確認不構成有效風險 |
| `duplicate` | 與另一筆有效事件重複，保留主事件關聯 |
| `accepted_risk` | 已評估並接受剩餘風險，需記錄原因與覆核 |
| `manual_resolution` | 透過人工處置完成且不屬於其他分類 |

Alert 結案守門條件：

1. 已選擇 `resolution_code` 並填寫可稽核原因。
2. 所有必要 Mitigation Job 已完成，或以具名核准明確豁免。
3. 不存在套用中、解除中或失敗待處理的隔離工作。
4. 若 desired state 為未隔離，Launch Gate actual state 也必須為未隔離。
5. 必要 GGAP Delivery 已 `acknowledged`，或已依權限記錄人工豁免與後續責任人。
6. 使用最新資料版本送出，未覆蓋其他操作者的更新。

## 8. 嚴重度與自動化模式

嚴重度使用 Info、Low、Medium、High、Critical，表示影響程度，不等同自動化授權。相同類型可以依影響範圍、持續時間、失敗比例、資料正確性及結算影響落在不同等級。

| 模式 | 系統行為 | 適用原則 |
|---|---|---|
| `observe_only` | 只建立 Detection Result／Event；必要時建立 Alert | 新規則、低信心或只需觀察 |
| `approval_required` | 產生建議動作，待具權限人員確認後建立 Job | Production 或高影響動作 |
| `automatic` | 命中核准政策後建立 Job，同時建立 Alert 供覆核 | 可逆、最小範圍且健康檢查可靠 |

automation mode 綁定規則版本與動作模板。前端不能提升模式、擴大 scope，或只因 Critical 就跳過授權與安全守門。

## 9. Mitigation Job 與隔離控制

所有會改變營運狀態的動作都建立 Mitigation Job。Alert 按鈕只發出 command，不直接把 UI 點擊視為副作用成功。

| Job 狀態 | 語意 |
|---|---|
| `queued` | 已接受命令，等待執行 |
| `running` | 執行中；相同冪等工作不得重複觸發 |
| `succeeded` | 動作完成，已保存結果及驗證證據 |
| `failed` | 停止重試或發生不可恢復錯誤，需要人工處理 |
| `cancelled` | 尚未產生副作用前由核准流程取消 |

每個 Job 保存 `action_type`、target scope、requested／approved by、`idempotency_key`、attempt、開始／完成時間、前後狀態、錯誤、trace ID 與驗證結果。重試增加 attempt，不覆寫先前失敗證據。

### 9.1 隔離 desired／actual state

| 欄位 | 值 | 說明 |
|---|---|---|
| `desired_state` | `not_isolated`、`isolated` | 期望 Launch Gate 達成的狀態 |
| `actual_state` | `not_isolated`、`applying`、`isolated`、`releasing`、`failed` | Launch Gate 回報的實際狀態 |

- UI 同時呈現 desired 與 actual；兩者不一致時不得提前宣告成功。
- target 至少包含 environment、game，可縮小至 version 或 endpoint，不用模糊名稱作唯一 target。
- 不採單純到期自動解除；解除前需最新健康檢查、必要觀察窗口與具權限確認。
- 解除檢查的過期、無資料或部分失敗都不能視為通過。
- 隔離／解除失敗保留 desired state，actual 標示 `failed` 並建立或升級 Alert。

Alert 詳情可用操作由 Backend 回傳 `allowed_actions`。前端顯示禁止原因；Backend 仍須驗證權限、最新版本、守門條件與 idempotency。

## 10. GGAP Delivery、可靠性與稽核

Provider 的本地狀態變更與 GGAP 通知採 outbox 可靠投遞。第一版至少支援隔離已套用、隔離已解除、隔離 scope／原因更新等版本化通知能力；正式 event name 及 payload 待 GGAP Backend 對照。

每筆 Delivery 保存 `delivery_id`、event type、payload version、target environment、Risk Event／Alert／Isolation 關聯、精確 target、`idempotency_key`、payload snapshot、attempt、協定結果、GGAP trace ID 與 ACK 時間。

投遞狀態：

| 狀態 | 語意 |
|---|---|
| `pending` | 已寫入 outbox，等待投遞 |
| `sending` | 投遞中 |
| `sent` | 請求已成功送出，尚未代表 GGAP 已確認 |
| `acknowledged` | 收到符合契約的 GGAP ACK |
| `failed` | 永久錯誤或有限重試耗盡 |

- 本地交易同時寫入狀態變更與 outbox，避免通知永久遺失。
- 暫時性錯誤依退避策略有限重試；人工重送沿用相同業務冪等 key，新增 attempt。
- 通知失敗不自動解除已生效的安全隔離。
- Provider actual state 與 GGAP 回報不一致時建立 reconciliation evidence，不以任一方最新值覆寫歷史。
- Alert、Job、Isolation 與 Delivery 使用 version 或等價併發控制。
- 接手、改派、備註、核准、隔離、解除、重送、豁免、結案與重新開啟均保存 actor、時間、原因、前後值、request／trace ID。
- 通知中心屬 Deferred；不影響 Alert 工作佇列、Delivery 或 audit 正式保存。

## 11. 顯示與術語規則

主要介面使用台灣繁體中文；API 值、ID、協定、錯誤碼、HTTP method、endpoint、版本與原始 payload 欄位維持英文。

| 技術術語 | 一般顯示 |
|---|---|
| Monitoring Signal | 監控訊號 |
| Detection Result | 偵測結果 |
| Risk Event | 風控事件 |
| Alert | 告警 |
| Mitigation Job | 緩解工作 |
| Isolation Control | 隔離控制 |
| Game Round | 遊戲回合 |
| Production／DEMO | 正式環境／展示環境 |
| Info／Low／Medium／High／Critical | 資訊／低／中／高／嚴重 |

狀態標籤顯示中文，篩選選項或詳情可使用「中文（English）」輔助。不得翻譯或改動 `risk_event_id`、`alert_id`、`provider_event_id`、Round ID、Rule ID 或正式 enum 值。

## 12. 外部驗證點

以下內容需要取得現行 Backend／GGAP Git 後填入實際值，但不改變上述產品行為：

1. 正式 API path、資料表、migration、enum 命名、唯一索引及狀態轉換實作。
2. 指標來源、資料延遲、評估排程、第一批實際門檻與最小樣本。
3. Launch Gate 實際整合點、可用 scope 及健康檢查介面。
4. GGAP payload、簽章、event name、ACK、錯誤碼、重試及查詢契約。
5. permission key、雙人核准角色、資料保存年限與 audit 匯出方式。
6. 既有 Backend 的 Event、Alert、Job、Isolation 或 outbox 模型與本規格的差異。

取得證據後輸出差異表，逐項選擇沿用現況、調整 Backend、調整規格或增加相容層，不直接以實作細節靜默覆蓋需求。

## 13. 第一版不處理

- 會員下注行為、信用、詐欺、洗錢或合規風險。
- 代理商、商戶、錢包、GGAP 平台或 GGAP 下游營運風控。
- 在風控報表直接執行隔離、解除、全域下架或財務調整。
- 自動補單、強制結算或修改已結算 Game Round。
- 未經版本化規則、授權及最小 scope 控制的自動停機。
- 以通知中心取代 Alert、Delivery 或正式稽核資料。

## 14. 關聯文件

- [`Decision Pack 02｜監控與風控共用產品契約`](./spec-book/content/appendices/decision-pack-02-monitoring-risk.md)
- [`PROVIDER_MONITORING_OVERVIEW_SPEC.md`](./PROVIDER_MONITORING_OVERVIEW_SPEC.md)
- [`PROVIDER_RISK_REPORT_SPEC.md`](./PROVIDER_RISK_REPORT_SPEC.md)
- [`PROVIDER_RISK_ALERT_HANDLING_SPEC.md`](./PROVIDER_RISK_ALERT_HANDLING_SPEC.md)
- [`PROVIDER_DASHBOARD_SPEC.md`](./PROVIDER_DASHBOARD_SPEC.md)
- [`PROVIDER_GGAP_INTEGRATION_CONTRACT.md`](./PROVIDER_GGAP_INTEGRATION_CONTRACT.md)
- [`GAME_ROUND_RECORDS_SPEC.md`](./GAME_ROUND_RECORDS_SPEC.md)
