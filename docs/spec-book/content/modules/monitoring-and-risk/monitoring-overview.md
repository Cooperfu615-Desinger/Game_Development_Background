# 監控總覽

## 章節狀態

| 項目 | 內容 |
| --- | --- |
| 規格成熟度 | Draft — Batch B 完整頁面規格 |
| 製作範圍 | Active |
| 對應路由 | `/monitoring` |
| 前端元件 | `src/views/Provider/MonitoringOverview.vue` |
| 主要來源 | `PROVIDER_MONITORING_OVERVIEW_SPEC.md` |
| 環境 | Production 或 DEMO 單選；Test 排除 |
| 監控主體 | Provider 自身遊戲服務、Game Round、GGAP 直接對接及風控訊號 |

> 本頁用於觀察與導流，不執行風控處理。Provider 只監控自身服務與對 GGAP 的直接整合，不推斷 GGAP 與代理商間的下游狀態。

## 1. 目的與使用情境

讓營運、技術、SRE 與風控人員在單一頁面確認目前服務健康、選定窗口內的 Round 成功率與 GGAP 延遲、各遊戲的異常集中位置，再導向 Risk Event、Alert 或 Game Round 追查。

## 2. 範圍與責任邊界

### 2.1 本頁包含

- Production／DEMO 分離的遊戲服務、Round、GGAP 直接對接與 Provider 風控指標。
- 五張摘要卡、關注項目切換、每遊戲監控列表與大型詳情 Dialog。
- 導向風控報表、告警處理及遊戲紀錄的 deep link。

### 2.2 本頁不包含

- Test 資料、正式財務聚合、錢包或代理商／商戶／會員主資料。
- GGAP 對代理商的遊戲開放狀態或平台內部健康。
- 隔離、解除、指派、結案或修改 Round 的操作。
- 把同一問題的 Risk Event 與 Alert 相加成「總異常」。

## 3. 核心名詞與指標

| 指標 | Draft 定義 |
| --- | --- |
| 服務健康 | `healthy expected service games / expected service games`；維護與無資料需獨立表達。 |
| Round 成功率 | `success / (success + failed + timeout)`；`processing` 不進分母。 |
| GGAP P95 | Provider 對 GGAP 成功回應樣本的 P95；整體狀態仍需同時考量 timeout／failure。 |
| 高風險告警 | High／Critical 且未 closed／false positive 的不重複 `alert_id`。 |
| 未處理異常 | pending／investigating 的不重複 `risk_event_id`。 |

- Risk Event 是客觀異常紀錄；Alert 是需要人處理的工作單位，兩者狀態分開。
- 目前狀態卡使用最新有效 snapshot；Round 成功率與 GGAP P95 使用已套用分析窗口。
- 正式門檻、採樣、最小樣本、嚴重度及 stale threshold 依 `TBD-DAT-005`。

## 4. 資訊架構與頁面區塊

1. 監控範圍與更新：環境、遊戲類型、遊戲、分析時間及最後更新。
2. 五張摘要卡：服務健康、Round 成功率、GGAP P95、高風險告警、未處理異常。
3. 關注項目：全部、服務異常、Round 失敗、GGAP 延遲、高風險告警、未處理異常。
4. 遊戲監控列表：每遊戲 × 環境的健康與導流。
5. 遊戲監控詳情：大型 Dialog 顯示服務、Round、GGAP、風控及關聯入口。
6. 替代狀態與跨頁導流：empty、stale、partial error、deep link。

<!-- PAGE_VISUAL_START -->
<figure class="page-anatomy ops-anatomy ops-anatomy--monitoring" aria-label="監控總覽六區塊畫面示意">
  <div class="ops-anatomy__canvas">
    <a class="anatomy-zone ops-anatomy__toolbar" href="#5-監控範圍與查詢" aria-label="前往第一區，監控範圍與查詢"><span class="anatomy-zone__number">01</span><span><small>MONITORING OVERVIEW</small><strong>遊戲監控總覽</strong><i>最後更新 10:24:18</i></span><b>Production　全部類型　全部遊戲　6 小時　↻</b></a>
    <a class="anatomy-zone ops-anatomy__cards ops-anatomy__cards--five" href="#6-五張摘要卡" aria-label="前往第二區，五張摘要卡"><span class="anatomy-zone__number">02</span><span><small>服務健康</small><strong>22 / 24</strong></span><span><small>Round 成功率</small><strong>99.82%</strong></span><span><small>GGAP P95</small><strong>126 ms</strong></span><span><small>高風險告警</small><strong>3</strong></span><span><small>未處理異常</small><strong>5</strong></span></a>
    <a class="anatomy-zone ops-anatomy__segments" href="#7-關注項目" aria-label="前往第三區，關注項目"><span class="anatomy-zone__number">03</span><strong>關注項目</strong><i class="is-active">全部 24</i><i>服務異常 2</i><i>Round 失敗 1</i><i>GGAP 延遲 2</i><i>高風險 3</i><i>未處理 5</i></a>
    <div class="ops-anatomy__split ops-anatomy__split--wide">
      <a class="anatomy-zone ops-anatomy__table" href="#8-遊戲監控列表" aria-label="前往第四區，遊戲監控列表"><span class="anatomy-zone__number">04</span><strong>遊戲監控列表</strong><small>狀態　遊戲　類型　版本　服務　Round 成功率　GGAP P95　告警　異常　檢查時間</small><i>異常　星際寶藏　老虎機　3.6.1　Error　97.8%　680 ms　2　1　10:24</i></a>
      <a class="anatomy-zone ops-anatomy__detail" href="#9-遊戲監控詳情" aria-label="前往第五區，遊戲監控詳情"><span class="anatomy-zone__number">05</span><small>GAME MONITOR DETAIL</small><strong>星際寶藏</strong><i>服務健康 · Round · GGAP · Risk Event · Alert</i><b>查看關聯紀錄 →</b></a>
    </div>
    <a class="anatomy-zone ops-anatomy__states" href="#11-頁面狀態與錯誤處理" aria-label="前往第六區，頁面狀態與錯誤處理"><span class="anatomy-zone__number">06</span><strong>替代狀態與跨頁導流</strong><i>載入中</i><i>全部正常</i><i>查無結果</i><i>資料過期</i><i>局部失敗</i><i>全部失敗</i></a>
  </div>
  <div class="page-anatomy__legend"><span><i></i>目前狀態</span><span><i></i>分析窗口</span><small>參照現行 `/monitoring` 原型；Test 永不納入。</small></div>
</figure>
<!-- PAGE_VISUAL_END -->

## 5. 監控範圍與查詢

| 欄位 | 技術值 | 預設 | 規則 |
| --- | --- | --- | --- |
| 環境 | `environment` | Production | Production／DEMO 單選，不可混合。 |
| 遊戲類型 | `game_type` | 全部 | 選項來自 Provider 遊戲主資料。 |
| 遊戲 | `game_id` | 全部 | 顯示名稱與 ID；送穩定 ID。 |
| 分析時間 | `from`、`to` | 近 6 小時 | 快速 1h／6h／24h 或自訂；建議最大 7 日。 |

- 編輯條件後按查詢才套用；手動更新使用目前 applied filters。
- 環境與遊戲條件同時套用目前狀態與期間指標；分析時間只套用期間指標。
- URL query 可保存非敏感篩選；不允許 `environment=all`。

## 6. 五張摘要卡

- 服務健康、高風險告警、未處理異常顯示目前 snapshot。
- Round 成功率、GGAP P95 顯示套用窗口結果。
- 每張卡顯示範圍、分子／分母或樣本量、狀態、最後資料時間；不可只顯示百分比。
- 點擊卡片只能設定列表的關注項目或導向擁有頁，不改變其他摘要計算。
- 高風險告警與未處理異常可能是同一問題，不可相加。

## 7. 關注項目

- 關注項目只篩選下方遊戲列表，不重新計算五張摘要卡。
- 可選全部、服務異常、Round 失敗、GGAP 延遲、高風險告警、未處理異常；單選且再次點擊目前項目回到全部。
- 顯示數量為符合該項目的遊戲列數或明確標示的事件數；正式口徑不可含糊。

## 8. 遊戲監控列表

列表以 `game_id × environment` 為一列，共 11 個主要欄位：

| 順序 | 欄位 | 規則 |
| ---: | --- | --- |
| 1 | 綜合狀態 | 優先序：已隔離、異常、降級、無資料、維護、正常。 |
| 2 | 遊戲 | 名稱主顯示、ID 次顯示。 |
| 3 | 類型 | 繁中顯示值。 |
| 4 | 版本 | 該環境目前服務版本。 |
| 5 | 遊戲服務 | 最新服務健康與檢查摘要。 |
| 6 | Round 成功率 | 套用分析窗口，含分子／分母。 |
| 7 | GGAP P95 | 成功樣本 P95，並標示 timeout／failure。 |
| 8 | 高風險告警 | 不重複 active `alert_id`。 |
| 9 | 未處理異常 | 不重複 active `risk_event_id`。 |
| 10 | 最後檢查 | 含時區及 stale 狀態。 |
| 11 | 詳情 | 開啟本列大型 Dialog。 |

- 預設依綜合狀態優先序，再以嚴重度、最後檢查時間、`game_id` 穩定排序。
- 排序與分頁由伺服器處理；摘要不受目前分頁影響。

## 9. 遊戲監控詳情

大型 Dialog 至少包含：

1. 遊戲名稱／ID、環境、版本、綜合狀態與最後檢查。
2. 遊戲服務實例、端點、錯誤摘要與健康檢查。
3. Round 成功／失敗／timeout／processing、成功率與窗口。
4. GGAP 直接 request 的 P50／P95、樣本、timeout、failure 與最近錯誤。
5. Risk Event 與 Alert 摘要，分別顯示 ID、狀態、嚴重度與數量。
6. 前往 `/reports`、`/monitoring/risk-reports`、`/monitoring/alerts` 的明確入口。

詳情不得提供修改 Round 或告警處理按鈕；原始 payload 的顯示、複製與遮罩依 `TBD-SEC-002`。

## 10. 跨頁導流

- Risk Event：`/monitoring/risk-reports?risk_event_id={id}&environment={env}`。
- Alert：`/monitoring/alerts?alert_id={id}&risk_event_id={id}&environment={env}`。
- Game Round：`/reports?provider_round_id={id}` 或帶明確時間、環境與遊戲脈絡。
- GGAP request 紀錄頁仍 Deferred；可顯示 request ID，但不可承諾可用 route 或正式行為。
- 目標頁需驗證 ID 與登入 scope；找不到時顯示錯誤，不可退回模糊列表冒充成功。

## 11. 頁面狀態與錯誤處理

| 狀態 | 必要行為 |
| --- | --- |
| 初始／查詢中 | 保留區塊 skeleton，停用重複查詢。 |
| 手動更新 | 使用 applied filters，顯示更新中與最後成功時間。 |
| 全部正常 | 顯示正常結論與完整列表，不以空白頁代替。 |
| 查無結果 | 保留篩選與摘要語意，提供清除條件。 |
| 無資料／過期 | 顯示 no-data／stale，不歸類正常。 |
| 局部失敗 | 成功指標可用；失敗欄位顯示 `—`、原因與重試。 |
| 全部失敗 | 整頁錯誤與重試；不得顯示舊值為目前狀態。 |
| 權限不足 | 隱藏不可見敏感資料；整頁無權則 Forbidden。 |

## 12. API 契約草案

| 能力 | 必要輸入 | 必要輸出 |
| --- | --- | --- |
| 監控摘要 | environment、game filters、analysis window | 五張卡、範圍、樣本、snapshot／window、資料時間 |
| 遊戲監控列表 | filters、focus、sort、page | 11 欄、total、穩定排序、部分失敗標記 |
| 遊戲監控詳情 | game_id、environment、window | 服務、Round、GGAP、Risk Event、Alert 與 deep links |

回應需含 `generated_at`、`timezone`、`environment`、`observation_window`、`data_status`、`source_failures` 或等價欄位。正式 path、schema、門檻與 permission key 依 `TBD-API-001`、`TBD-API-004`、`TBD-DAT-005`、`TBD-SEC-001`。

## 13. 響應式、無障礙與文案

- Desktop 內容上限依 Portal `1500px`；Dialog 使用大型內容區，不縮成難讀窄抽屜。
- Tablet 摘要卡兩欄；Mobile 單欄並將列表轉為可展開卡片或保留可操作水平捲動。
- 狀態、門檻超標與趨勢不能只靠顏色；提供文字、圖示、樣本與時間。
- Dialog 需管理焦點、Esc、標題關聯及關閉後焦點返回。

## 14. 前後端交付要求

前端：分開管理 draft／applied filters、summary／list／detail request、局部失敗與過期狀態；deep link 保留環境及精確 ID。

後端：排除 Test、強制單一環境、以一致窗口與門檻版本計算；保持 Risk Event／Alert ID 分離；回傳 Provider scope 內的直接 GGAP 訊號，不延伸下游推論。

## 15. 驗收條件

1. Production／DEMO 不混合，Test 永不出現。
2. 目前狀態與分析窗口的時間語意清楚且不互相污染。
3. 五張卡公式、樣本、範圍及最後更新時間可辨識。
4. 關注項目只篩選列表，不改變摘要卡。
5. 列表含 11 欄與明確綜合狀態優先序。
6. 詳情完整呈現服務、Round、GGAP、Risk Event、Alert 且只讀。
7. deep link 使用精確 ID，Deferred GGAP 頁不被假定完成。
8. Loading、全部正常、empty、stale、partial／all error、Forbidden 可驗收。

## 16. 測試重點

- 環境切換、自訂時間上限、重複查詢與 response race。
- 成功率分母、processing 排除、P95 樣本與 timeout／failure。
- 綜合狀態 precedence、相同事件的 Event／Alert 不重複合計。
- 詳情開關、焦點管理及三種 deep link 的有效／無效／無權案例。
- 來源局部失敗、stale、無資料與全失敗。

## 17. 待確認事項

- `TBD-DOM-001`、`TBD-DOM-004`：Round、Risk Event、Alert 與隔離模型。
- `TBD-DAT-002`、`TBD-DAT-003`、`TBD-DAT-005`：識別碼、窗口、新鮮度、門檻與採樣。
- `TBD-API-001`、`TBD-API-002`、`TBD-API-004`：共通、Round 與監控 API。
- `TBD-SEC-001`、`TBD-SEC-002`：scope、permission、敏感資料與 payload。
- `TBD-NFR-001`、`TBD-NFR-002`、`TBD-NFR-004`：效能、降級及前端品質。
- `TBD-EXT-001`、`TBD-EXT-003`：GGAP 正式規格與系統權限模型。

## 18. Placeholder／Draft 移除條件

本頁已有內容原型，不使用 Placeholder。只有指標公式、門檻／採樣、API、資料新鮮度、權限及 deep link 契約核准並通過驗收後，才可改為 Confirmed。
