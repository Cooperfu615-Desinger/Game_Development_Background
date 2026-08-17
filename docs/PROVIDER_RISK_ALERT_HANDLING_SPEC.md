# 遊戲商風控告警／處理頁面規格

> 版本：0.3.0
> 更新日期：2026-08-17
> 狀態：目前需求基準；現行前端為 mock，正式 command、Job、權限與 GGAP Delivery 待後續實作

本文件定義 Provider Portal「風控告警／處理」頁面的摘要、工作佇列、Alert 詳情、人工操作、Mitigation Job、隔離、GGAP Delivery 與結案守門。共用模型以 [`PROVIDER_RISK_CONTROL_SPEC.md`](./PROVIDER_RISK_CONTROL_SPEC.md) 及 [`Decision Pack 02`](./spec-book/content/appendices/decision-pack-02-monitoring-risk.md) 為上游。

## 1. 頁面定位

本頁回答「現在有哪些告警需要人員介入、誰負責、下一步做什麼，以及是否可以結案」。它是遊戲商風控的工作台，不是即時監控或唯讀歷史報表。

本頁負責：

- 顯示需要人工確認的 Alert 與營運優先度。
- 接手、指派、備註、覆核及依權限送出具體 command。
- 呈現 Mitigation Job、隔離 desired／actual state、健康驗證與 GGAP Delivery。
- 依完整守門條件結案或重新開啟 Alert。
- 保存操作、核准、執行、通知及失敗的完整稽核資料。

本頁不得修改投注、派彩、換算結果、Game Round 或直接執行強制結算。按鈕送出只代表 command 被接受；副作用是否成功必須以 Job、Launch Gate 或 Delivery 實際狀態為準。

## 2. Risk Event、Alert 與工作的關係

- Risk Event 是客觀異常紀錄，狀態只使用 `open`、`recovering`、`resolved`、`invalidated`。
- Alert 是人工作業項目，狀態只使用 `new`、`in_progress`、`monitoring`、`closed`。
- 第一版一個 Risk Event 對應零或一個主要 Alert；Info／Low 或不需人工介入的 Event 可以沒有 Alert。
- 一個 Alert 可以關聯多個 Mitigation Job、Isolation Control 變更及 GGAP Delivery。
- Event 已 `resolved` 不代表 Alert 已完成結案；Alert `closed` 也不得直接把 Event 改為 `resolved`。
- `false_positive` 是 Alert 結案的 `resolution_code`，不是 Event 或 Alert status。
- assignee、waiting reason、Job、隔離及 Delivery 狀態都使用獨立欄位／資源，不塞入 `alert_status`。

## 3. 資料範圍

| 項目 | 定義 |
|---|---|
| 主要資料單位 | Provider Risk Alert |
| 預設範圍 | `new`、`in_progress`、`monitoring` |
| 環境 | Production 或 DEMO，單選且不可混合 |
| 預設環境 | Production |
| 不納入環境 | Test |
| 歷史資料 | `closed`，可依 `resolution_code` 查詢 |
| 時間區間 | Alert `created_at`；只影響佇列及歷史查詢，不改變目前狀態摘要語意 |

由監控總覽或風控報表帶入完整 `alert_id`／`risk_event_id` 時，本頁自動切換至 Alert 所屬 environment 並開啟詳情。找不到、無權限或 ID 關聯不一致時顯示明確錯誤，不靜默開啟其他 Alert。

## 4. 五張告警摘要卡

同一 Alert 可同時符合不同營運條件，卡片數字不要求互相加總。

| 摘要卡 | 數據定義 | 提示內容 |
|---|---|---|
| 待接手告警 | `alert_status=new` 且 `assignee_id=null` | 嚴重度、最久等待時間與未指派遊戲 |
| 高風險告警 | High／Critical 且狀態不是 `closed` | 遊戲、Event 狀態、隔離及負責人 |
| 隔離中 | `isolation_actual_state=isolated` 的不重複 target | desired／actual、scope、持續時間與覆核期限 |
| 工作或通知失敗 | Mitigation Job、Isolation Control 或 GGAP Delivery 為 `failed` | 工作類型、attempt、錯誤與最後時間 |
| 逾期未覆核 | 已超過 `review_due_at` 且狀態不是 `closed` | 負責人、等待原因、逾期時間與未完成工作 |

摘要卡可套用佇列快捷條件。切換卡片時回到有效 Alert 範圍，清除互相衝突的狀態條件；再次點擊同一卡片只清除 shortcut。

## 5. 查詢條件

### 5.1 主要條件

- Alert 狀態：待接手（`new`）、處理中（`in_progress`）、觀察中（`monitoring`）、已結案（`closed`）。
- 嚴重度：Medium、High、Critical；必要時允許查詢規則建立的其他等級 Alert。
- environment：Production、DEMO。
- 遊戲、異常類型、負責人及是否逾期。

### 5.2 進階條件

- `alert_id`、`risk_event_id`。
- `resolution_code`：`recovered`、`false_positive`、`duplicate`、`accepted_risk`、`manual_resolution`。
- 異常來源、遊戲版本、waiting reason。
- Mitigation Job type／status。
- Isolation desired／actual state。
- GGAP Delivery status。
- Provider Game Round ID、GGAP Round ID。
- Alert 建立時間區間。

「未指派」查詢使用 query 語意或專用 filter value；不得把 sentinel 寫入正式 `assignee_id`、Alert 或 audit。

## 6. 工作佇列

| 順序 | 欄位 |
|---:|---|
| 1 | 嚴重度 |
| 2 | Alert ID |
| 3 | Risk Event ID／Event 狀態 |
| 4 | 建立時間 |
| 5 | environment |
| 6 | 遊戲名稱 |
| 7 | 遊戲版本 |
| 8 | 異常類型 |
| 9 | 受影響 Game Round 數 |
| 10 | Alert 狀態 |
| 11 | 負責人／waiting reason |
| 12 | Mitigation Job 彙總狀態 |
| 13 | 隔離 desired／actual state |
| 14 | GGAP Delivery 狀態 |
| 15 | 覆核期限 |
| 16 | 操作：查看／處理 |

預設排序：Critical → 工作／通知失敗 → 已逾期 → High → Medium；相同優先度依 `review_due_at` 由近到遠，沒有期限時依 `created_at` 由新到舊。

列表只提供詳情入口，不直接放置隔離、解除、結案或重送按鈕。排序先作用於完整結果再分頁；狀態及 target 必須來自同一資料版本。

## 7. Alert 詳情

詳情使用可容納完整內容的大型 Dialog 或獨立內容頁，至少包含：

### 7.1 Alert 摘要

- 嚴重度、Alert ID、Risk Event ID、Event 狀態。
- Alert 狀態、environment、遊戲、Game ID、版本、負責人及 waiting reason。
- 建立、更新、覆核期限、逾期及資料版本。

### 7.2 異常與影響

- 異常來源、類型、`event_fingerprint`、首次／最後偵測及 occurrence。
- Event 是否 `open`、`recovering`、`resolved` 或 `invalidated`。
- 受影響 Round、服務、遊戲版本及新 Launch 是否可用。
- 既有 Round、Settle、Callback 及查單是否持續運作。

### 7.3 Detection Result 與規則

- Detection Result ID、Rule ID、Rule Version 及 automation mode。
- 評估窗口、樣本、資料新鮮度、門檻、實際值與結果原因。
- 錯誤碼、請求／回應摘要與可追蹤 evidence。

### 7.4 Mitigation Job

- Job ID、action type、target、status、requested／approved by。
- idempotency key、attempt、開始／完成時間、前後狀態、結果與錯誤。
- 健康驗證版本、時間、樣本窗口、結果與失敗項目。

### 7.5 隔離控制

- Isolation ID、environment、game、version／endpoint scope。
- `desired_state` 與 `actual_state`，以及兩者不一致的原因。
- 套用／解除工作、健康檢查、覆核期限及失敗狀態。

### 7.6 GGAP Delivery

- Delivery ID、event type、payload version、idempotency key 與 payload snapshot。
- `pending`、`sending`、`sent`、`acknowledged`、`failed` 狀態。
- attempt、最後送出、協定結果、GGAP trace ID、ACK 及 reconciliation evidence。

### 7.7 關聯資料與時間線

- Provider／GGAP Round ID 與遊戲紀錄入口。
- Risk Event 詳情、request／Callback evidence 入口；敏感資訊依權限遮罩。
- Detection、Event、Alert、Job、隔離、Delivery、接手、指派、備註、豁免、結案及重新開啟的 append-only timeline。

詳情右側或底部設置固定操作區。所有操作前取得最新 Alert、Job、Isolation 與 Delivery version，不覆蓋其他操作者更新。

## 8. 處理操作

| 操作 | 使用時機 | 正式結果 |
|---|---|---|
| 接手處理 | `new` 且未指派 | 指派目前使用者，Alert 進入 `in_progress` |
| 指派／改派 | 交由其他人處理 | 更新 assignee；狀態不自動改變 |
| 新增備註 | 調查、交接或補充證據 | 寫入 append-only timeline |
| 轉入觀察 | 主要影響已控制 | Alert 進入 `monitoring`，設定健康觀察與覆核條件 |
| 維持隔離 | 問題尚未排除 | 建立／確認隔離 command 與 Job，設定下一次覆核期限 |
| 解除隔離 | 最新健康檢查通過 | 建立解除 Job；actual state 成功回到 `not_isolated` 後才算完成 |
| 重試工作 | Job 失敗且仍允許重試 | 沿用業務 idempotency key，新增 attempt，不覆寫失敗證據 |
| 重送 GGAP 通知 | Delivery 失敗或 ACK 未完成 | 沿用業務 idempotency key，新增 delivery attempt |
| 結案 | 所有守門條件成立 | 選擇 `resolution_code`、填原因，Alert 進入 `closed` |
| 重新開啟 | 已結案但需再次處理 | Alert 進入 `in_progress`，保存原因、actor 與前後版本 |

按鈕是否可用由 Backend 回傳 `allowed_actions`；前端需顯示禁止原因。Backend 仍須重新驗證權限、最新版本、守門條件、target scope 及 idempotency。

## 9. Alert 狀態與結案守門條件

主要流程：

```text
new → in_progress → monitoring → closed
```

- `monitoring` 若異常再次命中或觀察失敗，可回到 `in_progress`。
- `closed` 重新開啟只回到 `in_progress`，不得回到 `new` 偽裝為新工作。
- `false_positive`、`duplicate` 等只存在於 `resolution_code`，不建立額外 status。

Alert 只有在以下條件全部成立時才可 `closed`：

1. 已選擇 `resolution_code` 並填寫可稽核原因。
2. 所有必要 Mitigation Job 已 `succeeded`，或有具名核准豁免。
3. 不存在 `queued`、`running` 或 `failed` 待處理的必要工作。
4. 若 desired state 是 `not_isolated`，actual state 也必須為 `not_isolated`。
5. 必要 GGAP Delivery 已 `acknowledged`，或已記錄具權限豁免與後續責任人。
6. 使用最新資料 version，沒有併發衝突。

以 `false_positive` 結案時，若已有隔離仍須先解除或明確記錄核准豁免；不得靠改 resolution code 隱藏仍生效的 Launch Gate。

## 10. Job、隔離與 Delivery 狀態分離

| 維度 | 正式值／目的 |
|---|---|
| `alert_status` | `new`、`in_progress`、`monitoring`、`closed` |
| `mitigation_job_status` | `queued`、`running`、`succeeded`、`failed`、`cancelled` |
| `isolation_desired_state` | `not_isolated`、`isolated` |
| `isolation_actual_state` | `not_isolated`、`applying`、`isolated`、`releasing`、`failed` |
| `ggap_delivery_status` | `pending`、`sending`、`sent`、`acknowledged`、`failed` |

Alert 可以仍為 `new` 但自動隔離已成功，也可以在 `monitoring` 時等待 GGAP ACK。UI 必須同時顯示各維度，不能用單一「已緩解」覆蓋工作、隔離與通知真實狀態。

## 11. 冪等、併發、權限與稽核

- 每個 command 接受 `idempotency_key`；相同 key／相同 payload 回傳原結果，相同 key／不同 payload 必須拒絕。
- Alert、Job、Isolation 與 Delivery 使用 version 或等價 optimistic concurrency control。
- 所有敏感操作需權限、二次確認、原因及完整 audit；雙人核准角色與 permission key 待系統設定規格補齊。
- 接手、改派、備註、轉入觀察、維持隔離、解除、重試、重送、豁免、結案及重開均保存 actor、時間、原因、前後值、request／trace ID。
- 操作發生部分成功時逐項顯示實際狀態，不以 Alert 狀態掩蓋失敗的 Job 或 Delivery。

## 12. 空資料與錯誤狀態

- 沒有有效 Alert 時顯示目前無待處理告警。
- 篩選無結果時保留條件並提供重置。
- Job、Isolation 或 Delivery 失敗必須顯示失敗及重試／處理入口，不以無資料代替。
- version 衝突時要求重新載入最新狀態，不覆蓋其他人操作。
- 權限不足顯示唯讀詳情及禁止原因，不隱藏已發生的必要證據。

## 13. 現行原型與後續實作

目前 `/monitoring/alerts` 已具備 Production／DEMO、摘要、篩選、16 欄佇列、詳情 Dialog、時間線、操作確認與 mock 狀態變化，可保留其資訊架構與高擬真畫面。

後續開發需完成以下校正：

| 現行 mock | 目標結果 |
|---|---|
| 舊的待處理／調查中／已緩解／誤報狀態 | 改為 `new`／`in_progress`／`monitoring`／`closed`＋`resolution_code` |
| 按鈕直接改前端本地狀態 | 建立 command、Job、實際狀態與 audit |
| 單一自動緩解／隔離顯示 | 拆分 Job status 與 isolation desired／actual state |
| 模擬 GGAP 通知 | outbox、Delivery、ACK、有限重試與 reconciliation |
| 前端自行判斷操作可用 | Backend `allowed_actions`＋正式權限／version／idempotency 驗證 |

現行 mock 不代表已真的隔離遊戲、通知 GGAP 或修改正式資料。Test 不得出現在環境、摘要、佇列或詳情。

## 14. 驗收方向

- 預設顯示 Production 的 `new`、`in_progress`、`monitoring` Alert。
- Production 與 DEMO 單選且資料、Job、隔離與 Delivery 不混合；Test 不出現。
- 摘要卡、查詢、佇列與詳情使用一致的新 Alert 狀態及 resolution code。
- Risk Event、Alert、Job、Isolation、Delivery 與 audit 的 ID、狀態及 timeline 可分別追蹤。
- UI 同時顯示隔離 desired／actual，不在 applying／releasing 時提前宣告成功。
- 所有動作建立 command／Job 或 Delivery，不把按鈕點擊當成功。
- 結案守門完整；有效隔離、失敗工作或必要 ACK 未完成時不能結案。
- 不提供修改財務、投注、派彩或 Game Round 的入口。

## 15. 關聯文件

- [`Decision Pack 02｜監控與風控共用產品契約`](./spec-book/content/appendices/decision-pack-02-monitoring-risk.md)
- [`PROVIDER_RISK_CONTROL_SPEC.md`](./PROVIDER_RISK_CONTROL_SPEC.md)
- [`PROVIDER_RISK_REPORT_SPEC.md`](./PROVIDER_RISK_REPORT_SPEC.md)
- [`PROVIDER_MONITORING_OVERVIEW_SPEC.md`](./PROVIDER_MONITORING_OVERVIEW_SPEC.md)
- [`PROVIDER_GGAP_INTEGRATION_CONTRACT.md`](./PROVIDER_GGAP_INTEGRATION_CONTRACT.md)
- [`GAME_ROUND_RECORDS_SPEC.md`](./GAME_ROUND_RECORDS_SPEC.md)
- [`PROVIDER_PORTAL_UI_LAYOUT_SPEC.md`](./PROVIDER_PORTAL_UI_LAYOUT_SPEC.md)
