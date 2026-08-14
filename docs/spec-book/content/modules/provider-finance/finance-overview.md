# 財務總覽

## 章節狀態

| 項目 | 內容 |
| --- | --- |
| 規格成熟度 | Draft — Batch A 完整頁面規格 |
| 製作範圍 | Active |
| 對應路由 | `/finance` |
| 前端元件 | `src/views/Finance/Overview.vue` |
| 主要來源 | `GAME_VENDOR_FINANCE_OVERVIEW_SPEC.md`、`GAME_VENDOR_FINANCE_REPORTING_SPEC.md` |
| 資料環境 | Production only |
| 統計時間 | `settled_at` |
| 主要業務單位 | 有效且已結算的 Game Round 聚合 |

> 本頁產品目的、責任邊界、資訊架構與 Draft 顯示規則已整理完成。正式公式、精度、API、權限與大量資料策略仍受集中 TBD 阻擋，不得將原型 mock 當成正式財務契約。

## 1. 目的與使用情境

財務總覽讓遊戲商財務、營運與管理者快速掌握自身遊戲在正式環境中的整體投注、派彩、玩家輸贏、GGR、活動量與遊戲表現，並依時間、代理商脈絡、遊戲類型或單款遊戲縮小範圍。

主要使用情境：

1. 查看選定期間內的整體財務與活動摘要。
2. 比較投注、派彩、玩家淨輸贏與 GGR 的時間趨勢。
3. 檢視投注筆數與不重複玩家人數的變化。
4. 依 GGR 等指標辨識主要遊戲表現。
5. 進一步前往「代理商 × 遊戲彙總」或「遊戲紀錄」追查來源 Game Round。

## 2. 範圍與責任邊界

### 2.1 本頁包含

- 登入 Provider 自身遊戲產生的有效 Production Game Round 聚合。
- 查詢範圍內的財務摘要、活動摘要、趨勢與遊戲排行。
- Provider 點數主值及以每筆已保存換算資訊聚合的 USDT 對照值。
- GGAP 傳入的代理商識別脈絡，僅作篩選或報表維度。
- 由彙總結果前往其他 Provider 報表頁的導流入口。

### 2.2 本頁不包含

- DEMO 或 Test 資料；兩者不得混入正式財務聚合。
- GGAP 平台財務、代理商結算、商戶帳務、分潤或對帳工作流。
- 會員錢包、Provider 錢包、充值、提款或餘額調整。
- 代理商、商戶或會員主資料的建立與維護。
- 修改、刪除或重算 Game Round 的操作。
- 將 USDT 即時行情反套至歷史資料。

### 2.3 資料可見性與權限原則

- 後端必須以登入 Provider scope 限制所有查詢、趨勢、排行與匯出資料。
- 代理商篩選只能使用 Provider 有權看見的交易脈絡，不代表 Provider 擁有代理商主資料。
- 前端隱藏元件不能替代後端授權；查詢與匯出都需獨立檢核。
- 正式 permission key、角色與資料 scope 等待 `TBD-SEC-001`、`TBD-EXT-003`。

## 3. 名詞與計算口徑

| 名詞／指標 | Draft 定義 |
| --- | --- |
| 有效 Game Round | Production 中可納入正式財務的已結算回合；取消、回滾、調整與更正規則待 `TBD-DOM-001`、`TBD-DOM-002`。 |
| 投注總額 | `SUM(bet_points)`。 |
| 派彩總額 | `SUM(payout_points)`。 |
| 玩家淨輸贏 | `SUM(payout_points - bet_points)`；正值代表玩家淨贏。 |
| Provider GGR | Prototype 暫用 `SUM(bet_points - payout_points)`；正式方向與調整項待核准。 |
| 投注筆數 | 有效 settled Game Round 數量。 |
| 玩家人數 | 查詢範圍內不重複 `member_id` 數量，不得將各分組人數直接相加。 |
| 平均投注額 | `投注總額 ÷ 投注筆數`；分母為 0 時顯示 `—`。 |
| 人均投注額 | `投注總額 ÷ 不重複玩家人數`；分母為 0 時顯示 `—`。 |

共同口徑：

- 統計時間使用 `settled_at`，時間邊界採半開區間 `[from, to)`；正式時區等待 `TBD-DAT-003`。
- Provider 點數是計算及主顯示值；USDT 只能聚合每筆 Round 已保存的對照值，不得以目前匯率重算歷史。
- 所有卡片、圖表與排行必須使用同一套已套用條件與有效 Round 條件。
- 摘要與圖表不得由目前分頁資料推算。

## 4. 資訊架構與頁面區塊

頁面由上至下分為六個可辨識區塊：

1. 查詢範圍：快速時間、時間區間、代理商、遊戲類型與單款遊戲。
2. 財務摘要：八張財務與活動指標卡。
3. 財務趨勢：投注、派彩、玩家淨輸贏及 GGR。
4. 活動趨勢：投注筆數與不重複玩家人數。
5. 遊戲表現排行：依選定指標比較遊戲聚合結果。
6. 匯出與替代狀態：匯出入口及 Loading、Empty、Error、Forbidden、Stale。

<!-- PAGE_VISUAL_START -->
<figure class="page-anatomy finance-anatomy finance-anatomy--overview" aria-label="財務總覽六區塊畫面示意">
  <div class="finance-anatomy__canvas">
    <a class="anatomy-zone finance-anatomy__filter" href="#5-查詢條件" aria-label="前往第一區，查詢條件規格">
      <span class="anatomy-zone__number">01</span><span class="finance-anatomy__eyebrow">QUERY SCOPE</span><strong>查詢條件</strong><small>Production only · settled_at · UTC+08:00</small>
      <span class="finance-anatomy__quick"><i>今日</i><i>昨日</i><i class="is-active">近 7 日</i><i>近 30 日</i><i>自訂</i></span>
      <span class="finance-anatomy__fields"><i>時間區間　2026/08/08 — 2026/08/14</i><i>代理商　全部</i><i>遊戲類型　全部</i><i>單款遊戲　全部</i><b>⌕ 查詢</b></span>
    </a>
    <a class="anatomy-zone finance-anatomy__summary" href="#6-財務摘要" aria-label="前往第二區，財務摘要規格">
      <span class="anatomy-zone__number">02</span><span class="finance-anatomy__section-label">財務摘要</span>
      <span class="finance-anatomy__stat"><small>投注總額</small><strong>12.46M pt</strong><i>≈ 124,600 USDT</i></span>
      <span class="finance-anatomy__stat"><small>派彩總額</small><strong>11.93M pt</strong><i>≈ 119,300 USDT</i></span>
      <span class="finance-anatomy__stat"><small>玩家淨輸贏</small><strong>−530K pt</strong><i>玩家角度</i></span>
      <span class="finance-anatomy__stat"><small>GGR</small><strong>+530K pt</strong><i>Prototype / Draft</i></span>
      <span class="finance-anatomy__stat"><small>投注筆數</small><strong>84,120</strong><i>有效 Round</i></span>
      <span class="finance-anatomy__stat"><small>玩家人數</small><strong>1,284</strong><i>不重複</i></span>
      <span class="finance-anatomy__stat"><small>平均投注額</small><strong>148.12 pt</strong><i>每 Round</i></span>
      <span class="finance-anatomy__stat"><small>人均投注額</small><strong>9,704 pt</strong><i>每玩家</i></span>
    </a>
    <div class="finance-anatomy__charts">
      <a class="anatomy-zone finance-anatomy__chart" href="#7-1-財務趨勢" aria-label="前往第三區，財務趨勢規格">
        <span class="anatomy-zone__number">03</span><span class="finance-anatomy__section-label">財務趨勢</span><small>投注 · 派彩 · 玩家淨輸贏 · GGR</small>
        <span class="finance-anatomy__plot"><i></i><i></i><i></i><i></i><b></b></span><span class="finance-anatomy__axis">08/08　08/10　08/12　08/14</span>
      </a>
      <a class="anatomy-zone finance-anatomy__chart finance-anatomy__chart--activity" href="#7-2-活動趨勢" aria-label="前往第四區，活動趨勢規格">
        <span class="anatomy-zone__number">04</span><span class="finance-anatomy__section-label">活動趨勢</span><small>投注筆數 · 不重複玩家人數</small>
        <span class="finance-anatomy__bars"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span><span class="finance-anatomy__axis">08/08　08/10　08/12　08/14</span>
      </a>
    </div>
    <a class="anatomy-zone finance-anatomy__ranking" href="#8-遊戲表現排行" aria-label="前往第五區，遊戲表現排行規格">
      <span class="anatomy-zone__number">05</span><span class="finance-anatomy__section-label">遊戲表現排行</span><small>完整查詢結果 · 預設依 GGR 由高至低</small><span class="finance-anatomy__export">⇩ 匯出</span>
      <span class="finance-anatomy__table"><b>遊戲</b><b>類型</b><b>投注筆數</b><b>玩家</b><b>投注總額</b><b>派彩總額</b><b>GGR</b><i>Celestial Vault · CV-001</i><i>老虎機</i><i>18,420</i><i>328</i><i>2.84M pt</i><i>2.71M pt</i><i>+128K pt</i><i>Neon Drift · ND-014</i><i>Crash</i><i>15,980</i><i>294</i><i>2.41M pt</i><i>2.49M pt</i><i>−75K pt</i></span>
    </a>
    <a class="anatomy-zone finance-anatomy__states" href="#11-頁面狀態與錯誤處理" aria-label="前往第六區，頁面狀態與錯誤處理規格">
      <span class="anatomy-zone__number">06</span><span class="finance-anatomy__section-label">匯出與替代狀態</span><span><i>◌ 載入中</i><i>⌕ 查無資料</i><i>! 查詢失敗</i><i>⊘ 權限不足</i><i>↻ 資料過期</i><i>⇩ 匯出處理中</i></span>
    </a>
  </div>
  <div class="page-anatomy__legend"><span><i></i>主要閱讀順序</span><span><i></i>原型化財務資料</span><small>參照現行 `/finance` 原型；固定數字不代表正式回應值。</small></div>
</figure>
<!-- PAGE_VISUAL_END -->

## 5. 查詢條件

| 介面欄位 | 技術欄位 | 型別 | 必填 | 預設 | 規則 |
| --- | --- | --- | --- | --- | --- |
| 快速時間 | `quick_range` | UI state | 否 | 近 7 日 | 今日、昨日、近 7 日、近 30 日、自訂；送出前轉為明確時間。 |
| 起始時間 | `from` | ISO 8601 datetime | 是 | 近 7 日起點 | 不得晚於結束時間。 |
| 結束時間 | `to` | ISO 8601 datetime | 是 | 查詢當下／當日終點 | 以半開區間處理，避免跨批重複。 |
| 代理商 | `agent_id` | string | 否 | 全部 | 選項只來自有權檢視的交易脈絡；送穩定 ID。 |
| 遊戲類型 | `game_type` | enum | 否 | 全部 | 沿用遊戲主資料列舉。 |
| 單款遊戲 | `game_id` | string | 否 | 全部 | 顯示名稱與 ID，送穩定 ID。 |

行為規則：

- 編輯條件不立即改變結果；按「查詢」後一次套用摘要、圖表與排行。
- 「重置」恢復預設近 7 日與全部維度，並重新查詢。
- 套用條件後應同步至 URL query，以支援重新整理與跨頁返回；不得放入敏感會員資訊。
- 不允許的時間區間在前端先阻止送出；後端仍需再次驗證。
- 最大時間區間、預設時區與資料延遲門檻等待 `TBD-DAT-003`、`TBD-NFR-001`、`TBD-NFR-002`。

## 6. 財務摘要

八張摘要卡依序為投注總額、派彩總額、玩家淨輸贏、GGR、投注筆數、玩家人數、平均投注額、人均投注額。

- 金額卡主值顯示 Provider 點數，次值顯示 `≈ {value} USDT`。
- 正負值必須保留 `+`／`−`，並以文字說明角度；不可只用顏色表達。
- 卡片公式可透過 tooltip 或輔助說明查看，鍵盤與觸控皆可存取。
- `0` 與無法計算不同：0 顯示格式化數值；分母為 0 顯示 `—`。
- 摘要由完整篩選結果計算，不受排行筆數或分頁限制。
- 任一摘要分區失敗時不得默認顯示 0；應顯示局部錯誤或整頁錯誤。

## 7. 趨勢圖表

### 7.1 財務趨勢

| 序列 | 主單位 | 說明 |
| --- | --- | --- |
| 投注 | Provider 點數 | 每時間桶有效 Round 的投注加總。 |
| 派彩 | Provider 點數 | 每時間桶有效 Round 的派彩加總。 |
| 玩家淨輸贏 | Provider 點數 | 以玩家角度顯示正負。 |
| GGR | Provider 點數 | Prototype 公式；正式核准前標示 Draft。 |

### 7.2 活動趨勢

| 序列 | 單位 | 說明 |
| --- | --- | --- |
| 投注筆數 | Round | 每時間桶的有效 settled Game Round 數量。 |
| 玩家人數 | 人 | 每個時間桶內不重複玩家；跨桶不可直接相加推回期間總人數。 |

共同圖表規則：

- 依查詢跨度選擇小時或日粒度；原型的切換器為目標互動，正式自動選擇門檻待 API 契約。
- Tooltip 顯示完整時間桶、序列名稱、格式化主值及必要 USDT 對照。
- 圖例可切換序列，但不改變摘要與排行的後端條件。
- 空值表示沒有可用資料；不得以 0 補值掩蓋資料缺口。
- 圖表須提供可被輔助科技讀取的摘要或等價資料表。

## 8. 遊戲表現排行

| 順序 | 欄位 | 技術欄位 | 顯示與規則 |
| ---: | --- | --- | --- |
| 1 | 遊戲 | `game_name`、`game_id` | 名稱主顯示，ID 次顯示；來源為 Provider 遊戲主資料。 |
| 2 | 遊戲類型 | `game_type` | 使用繁中顯示值。 |
| 3 | 投注筆數 | `round_count` | 整數格式。 |
| 4 | 玩家人數 | `distinct_player_count` | 本遊戲分組內不重複。 |
| 5 | 投注總額 | `bet_points` | 點數主值、USDT 次值。 |
| 6 | 派彩總額 | `payout_points` | 點數主值、USDT 次值。 |
| 7 | 玩家淨輸贏 | `player_net_points` | 顯示正負與角度。 |
| 8 | GGR | `ggr_points` | 預設排序欄；Draft 公式。 |
| 9 | 平均投注額 | `average_bet_points` | 分母為 0 顯示 `—`。 |
| 10 | 人均投注額 | `bet_per_player_points` | 分母為 0 顯示 `—`。 |

- 預設依 `ggr_points desc`；同值時以 `game_id asc` 作穩定排序。
- 預設顯示前 10 名；若提供完整排行，使用伺服器排序與分頁。
- 點擊遊戲可前往 `/finance/agent-games` 並帶入目前時間、遊戲類型及 `game_id`。
- 資料列不得建立或修改遊戲主資料。

## 9. 匯出規格

- 匯出使用已套用條件，不使用尚未送出的表單草稿。
- 匯出涵蓋完整篩選結果，不受畫面排行筆數或分頁限制。
- 原型目前僅有提示；正式格式、欄位、同步／非同步門檻、保存及稽核等待 `TBD-SEC-004`、`TBD-NFR-001`。
- 無資料時停用匯出；權限不足回應不得啟動工作。
- 若採非同步流程，需顯示已受理、處理中、完成、失敗與過期；通知中心尚 Deferred，不可把通知當唯一完成入口。

## 10. API 契約草案

> Draft：以下是前後端責任切分，不是已核准 path 或 schema。正式契約由 `TBD-API-001`、`TBD-API-003` 管理。

建議能力拆分：

| 能力 | 建議輸入 | 必要輸出 |
| --- | --- | --- |
| 查詢摘要 | 共通 filters | 八項指標、點數／USDT、資料時間、口徑版本 |
| 查詢趨勢 | filters、granularity | buckets、四項財務序列、兩項活動序列、時區 |
| 查詢排行 | filters、sort、limit／page | 遊戲分組列、total、穩定排序欄位 |
| 建立匯出 | filters、format、fields | export job ID、狀態、到期資訊 |

後端要求：

- 一次 request 中的摘要、趨勢與排行必須能以相同資料版本或一致性標記解釋。
- 回應需帶 `calculated_at`、`timezone`、`data_version` 或等價追溯欄位。
- decimal 不得以二進位浮點作財務真實值；精度與序列化依 `TBD-DAT-001`。
- 不重複玩家必須由完整查詢集合計算。
- 取消、回滾與更正後的聚合更新策略需可追溯。

## 11. 頁面狀態與錯誤處理

| 狀態 | 必要介面與行為 |
| --- | --- |
| 首次載入 | 保留區塊結構並顯示 skeleton；不可先顯示 0。 |
| 重新查詢 | 保留舊結果或顯示 loading overlay，避免畫面跳動；以最後一次 request 為準。 |
| 無資料 | 保留套用條件，顯示 Production 範圍與重置入口；匯出停用。 |
| 查詢失敗 | 顯示可重試訊息與 trace ID；保留條件，不以空資料取代。 |
| 局部失敗 | 標示失敗區塊與資料時間；不得混用不同條件結果。 |
| 權限不足 | 不顯示歷史快取財務值；提供返回安全頁面的入口。 |
| 資料過期 | 顯示最後成功時間與過期提示，允許重試。 |
| 匯出處理 | 顯示受理、處理中、完成、失敗、過期；重複點擊需防重。 |

## 12. 響應式與可存取性

- 頁面不設 page-level `max-width`，使用主內容區完整寬度。
- Desktop：篩選器可為四欄；摘要最多四欄；兩張圖並排；排行在容器內捲動。
- 中型寬度：篩選及摘要降為兩欄，兩張圖改為單欄。
- Mobile：所有卡片單欄，操作按鈕可滿寬；表格只在自身容器水平捲動。
- 所有圖表需有文字摘要；顏色之外還要有名稱、圖例、正負符號或線型差異。
- tooltip、排序、查詢及匯出可由鍵盤操作，焦點順序符合視覺順序。
- 金額、長 ID 與繁中文字在 390px 寬度不得造成整頁溢位。

## 13. 前端實作要求

- 分離 draft filters、applied filters、request state 與 rendered data。
- 使用 request ID 或取消前一請求，避免較慢回應覆蓋新條件。
- URL query 與 applied filters 可雙向還原；無效 query 回到安全預設並提示。
- 金額與日期格式化集中處理，不在各卡片自行計算。
- 原型 mock 與正式 API adapter 分離；正式模式不得 fallback 到 mock。
- 圖表 resize、表格容器 overflow 與 Dialog focus trap 必須測試。

## 14. 後端實作要求

- 以 Provider tenant scope、Production 與有效 Round 條件作強制查詢前置條件。
- 摘要、圖表、排行共享同一財務口徑版本。
- 支援穩定排序、時間桶補充狀態、可追溯匯率資訊及資料更正。
- 對超過上限的查詢提供明確驗證錯誤，不可靜默截短期間。
- 記錄高成本查詢與匯出的操作者、條件摘要、結果量、狀態及 trace ID。

## 15. 整合與資料一致性

- 上游唯一來源為「遊戲紀錄」所代表的有效 Production Game Round。
- `/finance/agent-games` 必須沿用相同有效資料、時間、金額與匯率口徑。
- `/reports` 是單筆 Game Round 詳情唯一入口；本頁不建立第二套 Round 詳情。
- Dashboard 若重用財務摘要，必須引用相同口徑版本並標示時間範圍。
- GGAP 與系統設定仍為 Deferred；本頁只保留外部依賴，不補寫其 API 或權限模型。

## 16. 驗收條件

### 16.1 功能驗收

- 六個畫面區塊、八張摘要卡、兩張趨勢圖與遊戲排行均使用同一 applied filters。
- 快速時間、自訂區間、查詢、重置、排序、導流與匯出狀態符合規格。
- 0、負值、無法計算及無資料有不同且正確的呈現。

### 16.2 權限與隔離驗收

- DEMO／Test、其他 Provider 與未授權代理商脈絡無法透過 UI、URL 或 API 取得。
- 權限不足時不顯示快取資料，匯出也不得繞過檢視 scope。

### 16.3 體驗與可存取性驗收

- Desktop、900px 與 390px 皆無整頁水平 overflow。
- 圖表有等價文字資訊，查詢、排序與匯出可用鍵盤完成。
- Loading、Empty、Error、Forbidden、Stale 不只依顏色辨識。

### 16.4 技術驗收

- 財務 decimal、時區、資料版本與匯率可被測試重現。
- 併發查詢只顯示最後一次有效回應。
- 大量查詢、排序、排行與匯出符合核准效能門檻。

## 17. 測試情境清單

| 類別 | 核心情境 |
| --- | --- |
| 正常流程 | 預設近 7 日、各快速時間、自訂區間、各維度篩選、跨頁導流。 |
| 計算 | 正值、負值、0、分母為 0、不重複玩家、不同匯率版本。 |
| 邊界值 | 跨日、跨月、最大期間、時間桶切換、長遊戲名稱。 |
| 錯誤 | 摘要／圖表／排行局部失敗、逾時、重試、舊資料。 |
| 權限 | 其他 Provider、未授權代理商、直接 URL、匯出繞過。 |
| 響應式 | 1440px、900px、390px、表格捲動、200% zoom。 |

## 18. 待確認事項

| 集中 TBD | 本頁待確認內容 | 阻擋範圍 |
| --- | --- | --- |
| `TBD-DOM-001`、`TBD-DOM-002` | 有效 Round、取消／更正、公式與正負方向 | Backend、QA、Release |
| `TBD-DAT-001`、`TBD-DAT-003`、`TBD-DAT-004` | 精度、匯率、時區、資料更正與歷史重現 | Backend、QA |
| `TBD-API-001`、`TBD-API-003` | 共通 API、摘要、趨勢、排行與匯出契約 | Frontend、Backend、QA |
| `TBD-SEC-001`、`TBD-SEC-004`、`TBD-EXT-003` | 財務檢視／匯出權限與 audit | Frontend、Backend、Release |
| `TBD-NFR-001`、`TBD-NFR-002` | 效能、快取、新鮮度與降級 | Backend、SRE、QA |

## 19. 規格完成條件

升為 Confirmed 前必須完成：

- 核准財務公式、有效 Round、精度、匯率與資料更正規則。
- 核准摘要、趨勢、排行、導流與匯出 API schema。
- 核准財務檢視與匯出 permission key、資料 scope 及稽核。
- 以正式契約資料完成 Desktop／Mobile、計算、錯誤、權限與效能驗收。
