# Provider 風控報表頁面規格

> 版本：0.1.0
> 更新日期：2026-08-10
> 狀態：產品方向已確認，前端原型已完成（mock data）；正式 API 契約待確認

本文件定義 Provider Portal「風控報表」頁面的資料範圍、摘要、待關注異常、查詢、列表與 Risk Event 詳情。異常定義、Event ID、嚴重度、處理生命週期與自動緩解規則統一依 [`PROVIDER_RISK_CONTROL_SPEC.md`](./PROVIDER_RISK_CONTROL_SPEC.md) 執行。

## 1. 頁面定位

風控報表回答「發生了什麼異常、影響範圍多大，以及目前處理到哪裡」。本頁以 Risk Event 為主要資料單位，提供查詢、分析、追溯與導向處理的入口。

本頁不是：

- 即時服務健康儀表板；即時狀態由監控總覽負責。
- 人工處理工作佇列；操作由風控告警／處理頁負責。
- 單筆 Game Round 報表；完整遊戲紀錄由 `/reports` 負責。
- GGAP 平台級、代理商、商戶、會員或錢包風控報表。

## 2. 資料範圍與時間

| 項目 | 定義 |
|---|---|
| 主要資料單位 | Provider Risk Event |
| 統計時間 | `detected_at` |
| 時區 | `UTC+08:00 Asia/Taipei` |
| 預設時間 | 目前時間往前 24 小時 |
| 快速時間 | 近 1 日、近 3 日、近 5 日，即滾動 24、72、120 小時 |
| 環境 | Production 或 DEMO，單選且不可混合 |
| 預設環境 | Production |
| 不納入環境 | Test；不建立本頁監控、風控事件或告警 |

切換時間或環境後，摘要卡、待關注異常與完整事件列表必須使用同一組查詢條件同步更新。

## 3. 頁面結構

第一版由上到下包含：

1. 時間與環境快速切換。
2. 五張風控摘要卡。
3. 待關注異常。
4. 查詢條件。
5. Risk Event 列表。
6. Risk Event 詳情入口。

## 4. 風控摘要卡

| 摘要卡 | 數據定義 | Tips 內容 |
|---|---|---|
| 異常事件總數 | 指定範圍內建立的全部 Risk Event | Failure、Timeout、Latency、Data Anomaly 等分類數量 |
| 未解決 | 狀態為待處理 | 各嚴重度數量與最久未處理時間 |
| 處理中 | 狀態為調查中，或已緩解但尚未結案 | 調查中與已緩解數量 |
| 已解決 | 狀態為已關閉或誤報 | 正常關閉、誤報與平均處理時間 |
| 高風險事件 | High 或 Critical，且狀態不為已關閉或誤報 | 受影響遊戲、隔離狀態與 GGAP 通知狀態 |

摘要卡依目前時間、環境及其他已套用篩選條件計算完整結果，不受列表分頁影響。卡片標題旁提供 info 或 Tips 入口，不把公式與狀態映射長期顯示在主畫面。

## 5. 待關注異常

待關注異常固定顯示最多五筆狀態不為已關閉或誤報的 High／Critical 事件，作為快速查看與處理入口，不單純顯示最新五筆。

排序優先度：

1. Critical。
2. 自動緩解失敗。
3. 尚未隔離或 GGAP 通知失敗。
4. High。
5. 相同條件下依 `detected_at` 由新到舊。

每筆至少顯示：

- 嚴重度。
- Risk Event ID。
- 偵測時間。
- 遊戲名稱與版本。
- 異常類型。
- 受影響 Game Round 數。
- 處理狀態。
- 自動緩解與隔離狀態。
- 查看詳情或前往處理入口。

沒有待關注事件時顯示清楚的正常狀態，不保留空白列表骨架。

## 6. 查詢條件

### 6.1 常用條件

- 時間：近 1 日、近 3 日、近 5 日或自訂區間。
- 環境：Production、DEMO。
- 遊戲類型。
- 遊戲。
- 異常類型。
- 嚴重度。
- 處理狀態：未解決、處理中、已解決。

### 6.2 進階條件

- Risk Event ID。
- 遊戲版本。
- 異常來源。
- 自動緩解狀態。
- 是否隔離。
- GGAP 通知狀態。
- Provider Game Round ID。
- GGAP Round ID。

Risk Event ID 與 Round ID 使用完整值精確查詢。代理商、商戶與會員不列為第一版主要篩選條件。

## 7. Risk Event 列表

欄位順序：

| 順序 | 欄位 |
|---:|---|
| 1 | 偵測時間 |
| 2 | Risk Event ID |
| 3 | 嚴重度 |
| 4 | 環境 |
| 5 | 異常來源 |
| 6 | 異常類型 |
| 7 | 遊戲名稱 |
| 8 | 遊戲版本 |
| 9 | 受影響 Game Round 數 |
| 10 | 處理狀態 |
| 11 | 自動緩解狀態 |
| 12 | 隔離狀態 |
| 13 | GGAP 通知狀態 |
| 14 | 最後更新時間 |
| 15 | 操作：查看詳情／前往處理 |

完整列表預設依 `detected_at` 由新到舊。Critical／High 的營運優先排序由上方待關注異常負責。Provider Game Round ID 與 GGAP Round ID 不放主要列表，因為一筆聚合事件可能關聯多筆 Round。

## 8. Risk Event 詳情

詳情使用獨立頁面或可容納完整內容的大型詳情視窗，不使用窄側欄。內容分為：

### 8.1 事件摘要

- Risk Event ID、嚴重度、環境。
- 異常來源、異常類型、處理狀態。
- 首次偵測、最後發生、發生次數。

### 8.2 影響範圍

- 遊戲名稱、Game ID、版本。
- 受影響 Game Round 數與是否仍持續發生。
- 自動緩解與隔離範圍。

### 8.3 異常判斷依據

- Rule ID、規則版本。
- 判斷門檻、實際數值與統計窗口。
- 錯誤碼、延遲或逾時資訊。
- 請求與回應摘要。

### 8.4 自動緩解與 GGAP 通知

- 執行動作、結果、時間與失敗原因。
- 隔離狀態與範圍。
- GGAP 通知、ACK 與重試結果。

### 8.5 關聯 Game Round

- Provider Game Round ID、GGAP Round ID。
- 結算狀態與發生時間。
- 導向遊戲紀錄詳情。
- 多筆 Round 使用分頁或展開明細，不在摘要中截斷為單一 ID。

### 8.6 事件時間線

- 偵測、升級、緩解、通知、人工接手、解除與結案紀錄。

## 9. 導向與操作邊界

- Risk Event 詳情維持唯讀。
- 事件已有 Alert 時提供「前往處理」並導向 `/monitoring/alerts` 的對應 Alert。
- 沒有 Alert 時只顯示事件證據與關聯資料。
- 本頁不得直接執行隔離、解除、重送 GGAP 通知、修改 Game Round 或結案。
- 監控總覽可直接導入 Risk Event 詳情或 Alert，不要求依序經過本頁。

## 10. 分頁、匯出與空資料

- 正式列表支援分頁，排序先作用於完整查詢結果再分頁。
- 匯出沿用共用報表規則，包含目前完整篩選結果、事件識別、狀態、規則版本與關聯 ID；正式欄位上限待 API 契約確認。
- 查無資料時保留目前條件，顯示清楚訊息並提供重置篩選。
- 無資料時摘要卡顯示 `0`，不得顯示 NaN 或沿用前一次查詢數值。

## 11. 原型階段限制

- 前端原型已完成畫面與規格骨架，使用完整 mock data，不接正式 API。
- Tips、篩選、詳情、分頁與匯出可先呈現入口及預期狀態，不要求完成真實資料流。
- 正式異常門檻、Rule ID、聚合方式、處理 SLA 與 GGAP ACK 仍待後端確認。
- Test 不得因 mock data 方便而出現在環境篩選或摘要中。

## 12. 驗收方向

- 預設顯示 Production 與滾動近 24 小時。
- 可切換 24、72、120 小時與自訂區間。
- Production 與 DEMO 數據不混合。
- 五張摘要卡定義與 Tips 正確。
- 待關注異常依營運優先度顯示最多五筆。
- 查詢條件、列表欄位與順序符合本文件。
- Risk Event 詳情具備完整證據、關聯 Round 與時間線。
- 只有存在 Alert 的事件顯示前往處理入口。
- 本頁不提供任何會改變營運狀態的操作。

## 13. 關聯文件

- [`PROVIDER_RISK_CONTROL_SPEC.md`](./PROVIDER_RISK_CONTROL_SPEC.md)
- [`PROVIDER_RISK_ALERT_HANDLING_SPEC.md`](./PROVIDER_RISK_ALERT_HANDLING_SPEC.md)
- [`PROVIDER_GGAP_INTEGRATION_CONTRACT.md`](./PROVIDER_GGAP_INTEGRATION_CONTRACT.md)
- [`GAME_ROUND_RECORDS_SPEC.md`](./GAME_ROUND_RECORDS_SPEC.md)
- [`PROVIDER_PORTAL_UI_LAYOUT_SPEC.md`](./PROVIDER_PORTAL_UI_LAYOUT_SPEC.md)
