# DEMO環境數據

## 章節狀態

| 項目 | 內容 |
| --- | --- |
| 規格成熟度 | Draft — Batch D 完整頁面規格 |
| 製作範圍 | Active |
| 對應路由 | `/lobby/demo` |
| 前端元件 | `src/views/GameLobby/DemoData.vue` |
| 主要來源 | `GAME_LOBBY_SPEC.md`、`PROVIDER_PORTAL_SPEC.md` |
| 頁面角色 | Provider 自有大廳 DEMO 試玩 telemetry 與營運參考 |

> 本頁資料完全隔離，不納入正式 Game Round、財務、GGR 或 Provider 風控。畫面中的帳號、餘額與工作階段不是 Provider 會員、錢包或正式業務 Game Session；原型 USD 10,000 只是展示假資料。

## 1. 目的與責任邊界

- 查看今日、近 7 日與近 30 日的 DEMO 活躍、試玩工作階段、行為及各遊戲表現。
- 提供 DEMO 營運參考與資料品質提示，不提供正式財務結論。
- 隨機 DEMO identity 是短期技術識別，不建立固定會員帳號池。
- 展示額度是隔離沙盒 credit，不建立或連接 Provider／GGAP 錢包。
- Test 不納入本頁；本頁也不納入 Provider 風控監控。

## 2. DEMO 資料模型與隔離

- `demo_identity_id`、`demo_play_id`／`demo_session_id` 只存在 DEMO namespace，不得與 member ID、Provider／GGAP Round ID 共用。
- Production 正式紀錄仍以 Game Round 為主要業務單位；DEMO session 只是瀏覽／試玩 telemetry 分組。
- DEMO 資料庫、事件 topic、查詢 API、匯出與 retention 必須與 Production 分離。
- 原型「投注總額 USD」改稱 DEMO 試玩額度流量；正式顯示單位、精度與是否保留金額概念待 `TBD-DOM-006`。

## 3. 六區塊資訊架構

1. 查詢範圍：期間、遊戲、類型與資料更新時間。
2. DEMO 摘要：在線 identity、試玩工作階段、試玩行為、額度流量。
3. 活躍趨勢：時間序列、粒度、時區與缺口。
4. DEMO 規則與資料品質：隔離、派發、重設、延遲與 retention。
5. 各遊戲表現：玩家、工作階段、行為、額度及遊玩時間。
6. 匯出與替代狀態：empty、delayed、partial、failed、Forbidden。

<!-- PAGE_VISUAL_START -->
<figure class="page-anatomy lifecycle-anatomy publishing-anatomy publishing-anatomy--lobby" aria-label="DEMO環境數據六區塊畫面示意">
  <div class="lifecycle-anatomy__canvas">
    <a class="anatomy-zone lifecycle-anatomy__filters" href="#4-查詢與-demo-摘要" aria-label="前往第一區，查詢範圍"><span class="anatomy-zone__number">01</span><strong>DEMO 數據期間</strong><i>今日</i><i>近 7 日</i><i>近 30 日</i><i>遊戲</i><i>類型</i><b>查詢</b></a>
    <a class="anatomy-zone lifecycle-anatomy__cards lifecycle-anatomy__cards--four" href="#4-查詢與-demo-摘要" aria-label="前往第二區，DEMO 摘要"><span class="anatomy-zone__number">02</span><span><small>目前在線</small><strong>100</strong><i>DEMO identity</i></span><span><small>試玩工作階段</small><strong>498</strong><i>非正式 Session</i></span><span><small>試玩行為</small><strong>14.9k</strong><i>隔離事件</i></span><span><small>額度流量</small><strong>458k</strong><i>非財務</i></span></a>
    <div class="lifecycle-anatomy__split">
      <a class="anatomy-zone lifecycle-anatomy__chart publishing-anatomy__dark" href="#5-趨勢-規則與資料品質" aria-label="前往第三區，活躍趨勢"><span class="anatomy-zone__number">03</span><strong>玩家活躍趨勢</strong><small>Asia/Taipei · 1h bucket · Updated 10:20</small><span><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span></a>
      <a class="anatomy-zone lifecycle-anatomy__detail" href="#5-趨勢-規則與資料品質" aria-label="前往第四區，DEMO 規則與資料品質"><span class="anatomy-zone__number">04</span><small>DEMO GUARDRAILS</small><strong>隔離資料 · 無會員／錢包</strong><i>identity 派發 · credit reset · retention · source lag</i></a>
    </div>
    <a class="anatomy-zone lifecycle-anatomy__table" href="#6-各遊戲表現與匯出" aria-label="前往第五區，各遊戲表現"><span class="anatomy-zone__number">05</span><strong>各遊戲 DEMO 表現</strong><small>遊戲　目前 identity　試玩工作階段　試玩行為　額度流量　遊玩時間</small><i>翡翠天后　42　186　6,240　184,320 demo credits　4,380 min</i></a>
    <a class="anatomy-zone lifecycle-anatomy__states" href="#7-頁面狀態與錯誤處理" aria-label="前往第六區，匯出與替代狀態"><span class="anatomy-zone__number">06</span><strong>匯出與狀態</strong><i>CSV</i><i>No data</i><i>Delayed</i><i>Partial</i><i>Forbidden</i></a>
  </div>
  <div class="page-anatomy__legend"><span><i></i>DEMO telemetry only</span><span><i></i>不納正式財務／風控</span><small>參照現行 `/lobby/demo` 原型；USD 10,000 不升格為正式錢包契約。</small></div>
</figure>
<!-- PAGE_VISUAL_END -->

## 4. 查詢與 DEMO 摘要

期間支援今日、近 7 日、近 30 日，並可依 `game_id`、遊戲類型查詢；需顯示 applied range、時區、資料延遲與生成時間。摘要使用同一 applied filters：目前在線是 snapshot，其餘是期間聚合，標籤需區分時間語意。

各指標正式定義需說明去重 identity、工作階段開始／結束、事件去重、額度方向、遊玩時間及 late event 修正。無資料顯示 `—`，不是 0。

## 5. 趨勢、規則與資料品質

- 趨勢回傳 bucket start/end、value、completeness、generated_at；缺 bucket 顯示斷點，不補 0。
- 規則區顯示 DEMO namespace、identity TTL、初始／重設 credit、資料 retention、反濫用限制及規則版本。
- 原型「後端隨機生成、USD 10,000」是方向，不是核准契約；正式值由 API／設定回傳。
- 顯示 ingestion delay、last complete bucket、late events 與 source failure。

## 6. 各遊戲表現與匯出

列表包含 `game_id`／名稱／類型、active identities、demo play sessions、play events、credit flow、play duration、更新時間與資料品質。預設依活躍排序並由伺服器分頁。

匯出沿用 applied filters、欄位定義、單位、時區與生成時間，檔名明確包含 `DEMO`；不可與正式財務／Game Round 匯出放在同一檔案或同一 download namespace。

## 7. 頁面狀態與錯誤處理

支援 loading、no events、query error、partial game metrics、delayed、incomplete bucket、export queued／failed／expired、stale 與 Forbidden。任何資料都需有醒目 DEMO 標示，避免截圖或匯出被誤用為正式報表。

## 8. API、安全與驗收

API 提供 filter options、summary、trend、game performance、data quality 及 async export。後端強制 DEMO namespace／Provider scope，禁止 Production source fallback；識別碼需短期、遮罩且不可反查正式會員。

使用 `1500px` 寬版；Mobile 摘要、趨勢、規則、列表卡片依序排列。驗收需證明 DEMO 與正式資料完全隔離、工作階段不成為正式業務單位、原型 USD 不冒充錢包、匯出清楚標示且所有延遲／缺口可辨識。

## 9. 待確認與 Draft 移除條件

- `TBD-DOM-006`：DEMO identity、工作階段、credit、重設與 retention。
- `TBD-DAT-005`：指標、窗口、去重及資料品質。
- `TBD-API-006`、`TBD-SEC-001`：查詢／匯出 API、scope 與遮罩。

正式 DEMO 模型、指標、隔離、API、權限、保存及匯出規則核准後，才可改為 Confirmed。
