# 儀表板

## 章節狀態

| 項目 | 內容 |
| --- | --- |
| 規格成熟度 | Draft — Batch B 完整頁面規格 |
| 製作範圍 | Active |
| 對應路由 | `/dashboard` |
| 前端元件 | `src/views/Provider/Dashboard.vue` |
| 主要來源 | `PROVIDER_DASHBOARD_SPEC.md` |
| 正式財務環境 | Production only |
| 監控環境 | 依卡片標示 Production／DEMO；Test 不納入 |

> 儀表板是 Provider 跨模組營運摘要與工作入口，不是財務、監控、風控或通知中心的替代頁。原型資料皆為 mock；正式聚合、門檻、API、權限與通知行為仍受集中 TBD 管理。

## 1. 目的與使用情境

讓遊戲商營運、技術與管理者登入後快速回答三件事：服務是否正常、今日營運表現如何、目前有哪些工作需要處理。使用者再依卡片導向遊戲紀錄、財務、監控、風控或遊戲管理頁取得完整資訊。

## 2. 範圍與責任邊界

### 2.1 本頁包含

- Provider 自身遊戲服務、與 GGAP 直接對接狀態及未處理告警摘要。
- Production Game Round 的營運與財務摘要、近七日趨勢。
- 遊戲發布／維護、待處理工作、遊戲營運概況與通知入口。
- 各摘要來源頁的明確導流與最後更新時間。

### 2.2 本頁不包含

- 建立錢包或管理代理商、商戶、會員主資料。
- 推斷 GGAP 與代理商之間的平台狀態。
- 取代財務總覽、監控總覽、Risk Event 報表或 Alert 工作佇列。
- 在卡片上直接執行隔離、解除、結案、發布等高風險操作。
- 定義通知中心的類型、已讀、保存、管道或偏好；該模組目前 Deferred。

### 2.3 共通資料規則

- 金額主值使用 Provider 點數；USDT 僅作已保存換算資訊的對照。
- 正式營運與財務數字只取 Production；DEMO 只能出現在明確標示的發布／維護資訊，Test 全面排除。
- 今日／昨日／近 7 日只影響期間型營運數字，不得改變即時服務狀態。
- 卡片數字必須由完整資料集聚合，不得從畫面分頁或其他卡片反推。

## 3. 資訊架構與頁面區塊

頁面由上至下分為六個可點擊閱讀區塊：

1. 更新與期間：最後更新、手動更新、今日／昨日／近 7 日。
2. 即時狀態：Production 服務、GGAP 直接對接、待處理告警、發布／維護。
3. 營運摘要：Round、玩家、投注、派彩、GGR。
4. 近七日趨勢：營運量與財務走勢。
5. 待處理工作：依優先順序呈現最多五項行動入口。
6. 遊戲概況與通知依賴：遊戲狀態摘要及 Deferred 通知入口。

<!-- PAGE_VISUAL_START -->
<figure class="page-anatomy ops-anatomy ops-anatomy--dashboard" aria-label="儀表板六區塊畫面示意">
  <div class="ops-anatomy__canvas">
    <a class="anatomy-zone ops-anatomy__toolbar" href="#4-更新與期間" aria-label="前往第一區，更新與期間"><span class="anatomy-zone__number">01</span><span><small>DASHBOARD · PRODUCTION</small><strong>營運儀表板</strong><i>最後更新 10:24:18</i></span><b>今日　昨日　近 7 日　↻ 更新</b></a>
    <a class="anatomy-zone ops-anatomy__cards ops-anatomy__cards--four" href="#5-即時狀態" aria-label="前往第二區，即時狀態"><span class="anatomy-zone__number">02</span><span><small>Production 服務</small><strong>正常</strong><i>24 / 24</i></span><span><small>GGAP 直接對接</small><strong>正常</strong><i>P95 126 ms</i></span><span><small>待處理告警</small><strong>7</strong><i>2 Critical</i></span><span><small>發布／維護</small><strong>3</strong><i>含 DEMO</i></span></a>
    <a class="anatomy-zone ops-anatomy__cards ops-anatomy__cards--five" href="#6-營運摘要" aria-label="前往第三區，營運摘要"><span class="anatomy-zone__number">03</span><span><small>Game Round</small><strong>84,120</strong></span><span><small>玩家</small><strong>1,284</strong></span><span><small>投注</small><strong>12.46M pt</strong></span><span><small>派彩</small><strong>11.93M pt</strong></span><span><small>GGR</small><strong>+530K pt</strong></span></a>
    <div class="ops-anatomy__split">
      <a class="anatomy-zone ops-anatomy__chart" href="#7-近七日趨勢" aria-label="前往第四區，近七日趨勢"><span class="anatomy-zone__number">04</span><strong>近 7 日營運趨勢</strong><small>Round · 玩家 · 投注 · GGR</small><span><i></i><i></i><i></i><i></i><i></i><i></i></span></a>
      <a class="anatomy-zone ops-anatomy__work" href="#8-待處理工作" aria-label="前往第五區，待處理工作"><span class="anatomy-zone__number">05</span><strong>待處理工作</strong><small>Critical alert · 發布失敗 · 資料過期</small><i>查看全部工作 →</i></a>
    </div>
    <a class="anatomy-zone ops-anatomy__table" href="#9-遊戲概況與通知依賴" aria-label="前往第六區，遊戲概況與通知依賴"><span class="anatomy-zone__number">06</span><strong>遊戲營運概況</strong><small>遊戲　狀態　版本　Round　GGR　更新時間</small><i>通知中心為 Deferred dependency；本頁只保留入口與失敗降級。</i></a>
  </div>
  <div class="page-anatomy__legend"><span><i></i>目前狀態</span><span><i></i>期間摘要</span><small>參照現行 `/dashboard` 原型；數字不代表正式資料。</small></div>
</figure>
<!-- PAGE_VISUAL_END -->

## 4. 更新與期間

- 預設「今日」；可切換今日、昨日、近 7 日，所有期間型卡片與趨勢一次更新。
- 即時狀態不受期間切換影響，但必須套用登入 Provider scope。
- 手動更新同時觸發各資料區塊；部分失敗時保留成功資料並標示失敗區塊。
- 顯示 `generated_at` 或等價最後資料時間；過期判定與自動更新等待 `TBD-DAT-003`、`TBD-NFR-002`。

## 5. 即時狀態

| 卡片 | 定義與導流 |
| --- | --- |
| Production 服務 | Provider 正式服務健康摘要；導向 `/monitoring?environment=production`。 |
| GGAP 直接對接 | 只反映 Provider 與 GGAP 直接 request／callback 可用性，不延伸到代理商側。 |
| 待處理告警 | 未關閉且非誤報的 Alert 數；導向 `/monitoring/alerts`。 |
| 發布／維護 | Provider 自有遊戲發布、維護與異常摘要；可明確分列 Production／DEMO。 |

- 正常、警告、異常、維護、無資料必須同時使用文字與視覺標記。
- 卡片無資料不得顯示為正常；來源失敗不得顯示 0。

## 6. 營運摘要

| 指標 | Draft 口徑 |
| --- | --- |
| Game Round | 選定期間 Production 有效 Round 數。 |
| 玩家 | 期間內不重複 `member_id`；跨日不可直接相加。 |
| 投注 | Production 有效 Round 的 `SUM(bet_points)`。 |
| 派彩 | Production 有效 Round 的 `SUM(payout_points)`。 |
| GGR | Prototype 暫用 `bet_points - payout_points`，正式公式待核准。 |

金額以點數主顯示；USDT 對照與正負角度遵循財務總覽。點擊財務指標導向 `/finance`，Round 導向 `/reports`，並帶入等價明確時間條件。

## 7. 近七日趨勢

- 趨勢固定顯示近 7 個統計日，不因上方今日／昨日切換而改成單點圖；期間切換可用於指標比較，現行原型行為需由正式 API 最終確認。
- 序列至少包含 Round、玩家、投注及 GGR；不同單位使用分圖、雙軸或明確切換，不可用單一軸誤導。
- Tooltip 顯示統計日、完整值、單位、時區與資料狀態；無資料與 0 必須區分。

## 8. 待處理工作

- 最多顯示五項，依 Critical、高風險、失敗、逾期、最新順序排列。
- 每項必須有類型、摘要、環境、建立時間、目的 route；不得在儀表板直接執行處理。
- Alert 導向 `/monitoring/alerts?alert_id=...`；Risk Event 導向 `/monitoring/risk-reports?risk_event_id=...`；其他工作導向其擁有頁。
- 相同事件產生 Risk Event 與 Alert 時，不得合計為兩個獨立異常指標。

## 9. 遊戲概況與通知依賴

- 遊戲概況可含遊戲名稱／ID、Production 狀態、版本、期間 Round、GGR、最後更新及導流。
- 清單只作摘要，完整遊戲管理在 `/games`；排序、最大筆數及查看更多入口需明確。
- 最新通知區可保留 mock 入口，但通知中心仍為 Deferred；來源失敗不得阻擋其他儀表板區塊。
- 不在本頁定義通知類型、已讀、偏好、保存或正式 API，依 `TBD-EXT-002` 後續補充。

## 10. API 契約草案

> 以下僅定義能力邊界，不是已核准 path／schema。

| 能力 | 必要輸入 | 必要輸出 |
| --- | --- | --- |
| 即時狀態 | provider scope | 四類狀態、環境、來源狀態、`generated_at` |
| 營運摘要 | 明確 `from`、`to` | 五項指標、單位、口徑版本、資料時間 |
| 七日趨勢 | timezone、granularity | buckets、series、缺值與資料狀態 |
| 待處理工作 | provider scope、limit | 類型、嚴重度、ID、route、時間 |
| 遊戲概況 | period、limit | 遊戲快照、狀態、版本、指標與導流 |

每個子回應需能獨立表達 Loading、success、empty、stale、error、forbidden；後端必須做 Provider scope 授權。正式聚合、共通 envelope、路徑與 permission key 依 `TBD-API-001`、`TBD-API-003`、`TBD-API-004`、`TBD-SEC-001`。

## 11. 頁面狀態與錯誤處理

| 狀態 | 必要行為 |
| --- | --- |
| 首次載入 | 保留六區塊 skeleton，不先顯示 0 或正常。 |
| 手動更新 | 防止重複觸發，顯示更新中並以最後有效 request 為準。 |
| 局部失敗 | 成功區塊可用；失敗區顯示重試、來源與最後成功時間。 |
| 全部失敗 | 顯示整頁錯誤與重試，不保留容易誤判的舊狀態。 |
| 無資料 | 期間型數字依語意顯示 0／空狀態；即時狀態顯示無資料。 |
| 資料過期 | 顯示 stale 標記及最後更新時間，不冒充即時。 |
| 權限不足 | 只顯示有權區塊；整頁無權時提供明確 Forbidden。 |

## 12. 響應式、無障礙與文案

- Desktop 依 Provider Portal `1500px` 內容上限；規格網站畫面示意沿用文件有效寬度。
- Tablet 將狀態與指標卡改為兩欄；Mobile 單欄排列，工作入口保持可點擊。
- 數值、狀態與趨勢不能只靠顏色；卡片與圖表提供文字名稱、單位及可讀摘要。
- 台灣繁體中文為主，Route、ID、協定、環境及技術狀態保留英文。

## 13. 前後端交付要求

前端：以單一 applied period 驅動相關區塊、隔離各區 loading／error、保留最後更新時間、導流帶穩定 ID 與明確時間，不自行聚合正式財務。

後端：依 Provider scope 回傳可追溯聚合；區分即時狀態與期間數據；提供來源失敗、資料版本、時區、環境及資料新鮮度；不得回傳 Test 至監控／風控摘要。

## 14. 驗收條件

1. 頁面可清楚區分即時狀態、期間摘要、趨勢、工作與導流。
2. 今日／昨日／近 7 日不會改變即時狀態語意。
3. 正式財務只含 Production，Test 不出現在任何監控／風控數字。
4. GGAP 卡片只表達 Provider 直接整合，不推斷代理商側。
5. 所有數字有單位、範圍、資料時間與來源失敗狀態。
6. Risk Event 與 Alert 不被錯誤相加；工作項可導向正確 ID。
7. 通知中心不可用時，其他儀表板功能仍可使用。
8. Desktop、Tablet、Mobile 與鍵盤導覽符合共通規範。

## 15. 測試重點

- 期間切換、快速重複更新與 out-of-order response。
- 區塊 success／empty／stale／partial error／forbidden 組合。
- Production／DEMO／Test 隔離及點數／USDT 顯示。
- 各卡片 deep link、ID、時間區間與返回條件。
- 大數字、負 GGR、0、無法計算與來源延遲。

## 16. 待確認事項

- `TBD-DOM-001`、`TBD-DOM-002`：有效 Game Round 與財務公式。
- `TBD-DAT-001`、`TBD-DAT-003`、`TBD-DAT-005`：精度、時間、新鮮度、指標門檻與採樣。
- `TBD-API-001`、`TBD-API-003`、`TBD-API-004`：共通、財務與監控 API。
- `TBD-SEC-001`：頁面、卡片及資料 scope 權限。
- `TBD-NFR-001`、`TBD-NFR-002`、`TBD-NFR-004`：效能、快取降級與前端品質。
- `TBD-EXT-002`、`TBD-EXT-003`：通知中心及系統設定／權限模型。

## 17. Placeholder／Draft 移除條件

本頁已有內容原型，不使用 Placeholder。只有在正式聚合口徑、API schema、資料新鮮度、權限與依賴契約核准，且驗收測試通過後，才可由 Draft 改為 Confirmed。
