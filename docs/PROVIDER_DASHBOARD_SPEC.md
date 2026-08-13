# Provider Portal 儀表板規格

> 版本：0.1.0  
> 更新日期：2026-08-13  
> 狀態：前端 mock 原型已完成；正式 API、資料更新頻率、門檻與權限待確認

## 1. 頁面定位

儀表板是 Provider Portal 登入後的跨模組營運入口，不是財務總覽、監控總覽或風控報表的縮小複製。頁面需讓使用者快速確認：

1. 正式環境目前是否能正常服務。
2. 目前期間的營運規模與財務結果。
3. 是否有需要立即處理的異常、告警或發布工作。
4. 發現問題後應進入哪個頁面查詢或處理。

## 2. 責任邊界

儀表板只彙整遊戲商自己擁有或直接觀測的資料：

- Provider 正式環境遊戲與服務狀態。
- Provider Game Round、玩家、投注、派彩與 GGR 摘要。
- Provider 與 GGAP 的直接對接健康。
- Provider 風控事件、告警、發布與站內通知摘要。

儀表板不顯示平台或會員錢包、商戶資料、商戶排行、會員主資料、GGAP 下游狀態推論、完整明細、Test 環境或一般官網內容管理資料。

## 3. 頁面版型

- Route：`/dashboard`
- 實作：`src/views/Provider/Dashboard.vue`
- 外層最大寬度：`1500px`
- 頁面標題與麵包屑由主框架提供。
- 頁面直接從資料更新狀態與期間切換開始，不顯示 Hero、頁面資訊或 Placeholder blueprint。

桌機版由上而下分成：

1. 資料更新狀態與期間快捷選項。
2. 四張即時營運狀態卡。
3. 五張營運數據卡。
4. 近 7 日營運趨勢與待處理事項。
5. 遊戲營運概況與最新通知。

## 4. 環境與時間語意

### 4.1 環境

- 營運數據、財務摘要、趨勢與遊戲排行只計算正式環境（Production）。
- DEMO 不得混入正式投注、派彩、GGR、玩家或 Game Round 數據。
- DEMO 只可出現在發布、維護等環境狀態摘要。
- Test 不出現在儀表板。

### 4.2 期間

- 今日：`00:00:00` 至查詢當下，時區 `UTC+08:00 · Asia/Taipei`。
- 昨日：前一日 `00:00:00` 至 `23:59:59`。
- 近 7 日：包含當日的最近七個日曆日。

即時狀態不因上述期間切換而改變；各卡片需標示自己的觀測時間，例如 GGAP 健康使用近 24 小時。

## 5. 即時營運狀態

| 卡片 | 主要值 | 狀態與補充 | 導向 |
|---|---|---|---|
| 正式環境服務 | 正常遊戲數／應服務遊戲數 | 正常、維護、異常數量 | `/monitoring` |
| GGAP 對接狀態 | 成功率 | P95 延遲與觀測期間 | `/ggap` |
| 待處理告警 | 未完成告警數 | 嚴重、待處理與調查中數量 | `/monitoring/alerts` |
| 發布與維護 | 待發布數 | 維護中與停用遊戲數量 | `/games/environments` |

正式環境服務只將健康資料有效且整體狀態正常的遊戲計入分子。無資料、資料過期、維護、降級、隔離與異常不得視為正常。

GGAP 成功率僅計算 Provider 與 GGAP 直接對接請求，不得將 GGAP 與代理商下游狀態顯示成 Provider 已觀測事實。

待處理告警計入待處理、調查中與已緩解待覆核等尚未完成生命週期的告警；定義依 `PROVIDER_RISK_CONTROL_SPEC.md`。

## 6. 營運數據摘要

| 指標 | 定義 | 顯示方式 |
|---|---|---|
| 遊戲回合數 | 指定期間內完成結算的有效 Game Round 數 | 整數、千分位 |
| 不重複玩家 | 指定期間內產生有效 Game Round 的不重複會員 ID 數 | 整數、千分位 |
| 投注總額 | 有效 Game Round 的 Provider 投注點數總和 | Provider 點數主值、USDT 次要對照 |
| 派彩總額 | 有效 Game Round 的 Provider 派彩點數總和 | Provider 點數主值、USDT 次要對照 |
| GGR | 投注總額減派彩總額 | Provider 點數主值、USDT 次要對照 |

金額精度、有效 Game Round、換算結果與排除規則沿用 `GAME_ROUND_AND_REPORTING_SPEC.md` 與 `GAME_VENDOR_FINANCE_REPORTING_SPEC.md`。

## 7. 營運趨勢

- 固定顯示最近 7 日的每日聚合資料。
- 透過分段控制切換遊戲回合、投注額、GGR、玩家人數。
- 同一時間只顯示一項指標，並顯示相較前一個同長度期間的變化率。
- 投注與 GGR 以 Provider 點數為主要量綱。
- 詳細查詢導向財務總覽或監控總覽，不在儀表板新增複雜篩選器。

## 8. 待處理事項

預設顯示最高優先的 5 筆跨模組工作：

- 嚴重或高風險告警。
- 未解決且持續中的風控事件。
- 遊戲服務異常或健康資料過期。
- GGAP 請求、回呼或重試失敗。
- 待發布或需要維護確認的版本。

每筆至少包含項目名稱、遊戲或來源、時間、嚴重度／狀態、可追蹤 ID 與處理頁 route。排序先依嚴重度，其次依是否逾期、是否持續中與最後更新時間。

## 9. 遊戲營運概況

### 9.1 熱門遊戲

- 預設依有效 Game Round 數由高至低顯示前 5 款。
- 顯示遊戲、服務狀態、Game Round、玩家人數與較前期變化。

### 9.2 需要關注

- 只顯示降級、異常、隔離、無資料或主要期間指標異常的遊戲。
- 顯示最主要的關注訊號，例如重複結算、啟動失敗、P95 延遲或資料過期時間。
- 詳細資料導向 `/monitoring`，不在儀表板重複完整遊戲健康列表。

## 10. 最新通知

- 顯示最近 5 筆 Provider 站內通知。
- 顯示標題、通知類型、相對時間與未讀狀態。
- 點擊後導向 `/notifications`。
- 儀表板不提供通知偏好編輯或完整通知篩選。

## 11. 更新與資料狀態

- 顯示最後更新時間與時區，並提供手動重新整理與 loading 狀態。
- 任一正式資料來源失敗時不得沿用舊值冒充最新資料。
- 部分來源失敗時標示受影響區塊，其他成功來源仍可顯示。
- 全部來源失敗時顯示整頁資料來源異常與重新載入入口。

正式 API 可拆成即時狀態、期間營運摘要、七日趨勢、待處理事項、遊戲摘要與通知摘要等概念資源。回應至少需包含 `generated_at`、`timezone`、`environment`、`data_status`、觀測期間與來源失敗資訊。

## 12. 響應式要求

- 1180px 以下：狀態卡改為兩欄，營運卡改為三欄，主內容改為單欄。
- 720px 以下：營運卡改為兩欄，工具列與區塊標題改為上下排列。
- 460px 以下：狀態卡與營運卡改為單欄，趨勢切換改為兩欄。
- 遊戲表格在窄版由容器提供水平捲動。
- 所有導向、分段選項與列表項目均需支援鍵盤操作與 focus 狀態。

## 13. 原型驗收條件

- `/dashboard` 使用獨立頁面，不再由 Provider Placeholder 承接。
- 頁面沒有 Hero、頁面資訊或 blueprint 說明區塊。
- 不出現商戶、平台錢包、代理商排行與 Test 環境資料。
- Production 營運數據不混入 DEMO。
- 今日、昨日、近 7 日切換會同步更新五張營運數據卡。
- 趨勢指標切換會更新圖表與比較值。
- 即時狀態、待處理事項、遊戲概況與通知均有明確導向。
- 桌機與窄版不發生內容重疊、頁面水平溢出或空白圖表。

## 14. 相關文件

- [`PROVIDER_PORTAL_SPEC.md`](./PROVIDER_PORTAL_SPEC.md)
- [`PROVIDER_PORTAL_PAGE_MAP.md`](./PROVIDER_PORTAL_PAGE_MAP.md)
- [`PROVIDER_PORTAL_UI_LAYOUT_SPEC.md`](./PROVIDER_PORTAL_UI_LAYOUT_SPEC.md)
- [`GAME_ROUND_AND_REPORTING_SPEC.md`](./GAME_ROUND_AND_REPORTING_SPEC.md)
- [`GAME_VENDOR_FINANCE_REPORTING_SPEC.md`](./GAME_VENDOR_FINANCE_REPORTING_SPEC.md)
- [`PROVIDER_MONITORING_OVERVIEW_SPEC.md`](./PROVIDER_MONITORING_OVERVIEW_SPEC.md)
- [`PROVIDER_RISK_CONTROL_SPEC.md`](./PROVIDER_RISK_CONTROL_SPEC.md)
- [`PROVIDER_RISK_ALERT_HANDLING_SPEC.md`](./PROVIDER_RISK_ALERT_HANDLING_SPEC.md)
