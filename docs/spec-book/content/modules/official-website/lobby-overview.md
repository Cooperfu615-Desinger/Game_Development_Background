# 大廳總覽

## 章節狀態

| 項目 | 內容 |
| --- | --- |
| 規格成熟度 | Draft — DP04 產品語意已同步；正式實作 Mapping 待補 |
| 製作範圍 | Active |
| 對應路由 | `/lobby` |
| 前端元件 | `src/views/GameLobby/Overview.vue` |
| 主要來源 | `GAME_LOBBY_SPEC.md`、`PROVIDER_PORTAL_SPEC.md` |
| 頁面角色 | Provider 自有玩家遊戲大廳的狀態、DEMO 摘要與工作入口 |

> 本模組不是 GGAP 平台大廳。摘要中的玩家、DEMO 額度與工作階段都是隔離展示資料，不建立會員或錢包主資料，也不得進入正式 Game Round、財務或 Provider 風控。

## 1. 目的與責任邊界

- 彙整 Published Catalog、玩家顯示結果、DP03 runtime overlay、Delivery 與資料完整度。
- 呈現隔離 DEMO 的營運摘要，提供遊戲清單、管理、數據及預覽入口。
- 本頁只讀取公開結果，不編輯、核准或發布；DP04 內容可見性不取代 DP03 技術可用性或 GGAP Launch Gate。
- GGAP 對代理商是否開放已上架遊戲的控制不在本頁。
- 不顯示或建立正式會員、錢包、代理商、商戶、結算或對帳資料。

## 2. 狀態與資料來源

- 玩家顯示狀態是衍生結果，不是單一可編輯 enum：Published Catalog 決定是否收錄，DP04 Content 決定 coming soon／playable 語意，DP03 `maintenance`／`suspended`／`retired` 作 runtime safety overlay。
- 每張摘要卡由後端聚合完整 Provider scope，不從目前顯示列反算。
- 遊戲狀態、公開內容 readiness 與 DEMO telemetry 是不同來源；任何來源失敗以局部降級呈現。
- 「目前」與「今日」需顯示資料更新時間及統計時區。

## 3. 六區塊資訊架構

1. 大廳狀態摘要：已推出、即將開放、維護中、DEMO 活躍。
2. 遊戲推出狀態：前五筆／需注意遊戲與清單入口。
3. DEMO 今日摘要：展示工作階段、試玩行為及熱門遊戲。
4. 資料管理入口：精確導向單筆遊戲或完整管理頁。
5. 公開準備度與預覽：缺漏、阻擋、草稿與公開成果入口。
6. 資料新鮮度與替代狀態：局部失敗、無資料及權限。

<!-- PAGE_VISUAL_START -->
<figure class="page-anatomy lifecycle-anatomy publishing-anatomy publishing-anatomy--lobby" aria-label="大廳總覽六區塊畫面示意">
  <div class="lifecycle-anatomy__canvas">
    <a class="anatomy-zone lifecycle-anatomy__cards lifecycle-anatomy__cards--four" href="#4-大廳狀態摘要" aria-label="前往第一區，大廳狀態摘要"><span class="anatomy-zone__number">01</span><span><small>已推出</small><strong>03</strong><i>可進入 DEMO</i></span><span><small>即將開放</small><strong>02</strong><i>可見不可玩</i></span><span><small>維護中</small><strong>01</strong><i>保留展示</i></span><span><small>DEMO 活躍</small><strong>100</strong><i>隔離資料</i></span></a>
    <div class="lifecycle-anatomy__split">
      <a class="anatomy-zone lifecycle-anatomy__matrix" href="#5-遊戲狀態與-demo-摘要" aria-label="前往第二區，遊戲推出狀態"><span class="anatomy-zone__number">02</span><strong>遊戲推出狀態</strong><span><b>翡翠天后</b>已推出 · v1.4.2</span><span><b>星際躍升</b>即將開放 · v0.9.3</span><span><b>天宮寶藏</b>維護中 · v1.2.4</span></a>
      <a class="anatomy-zone lifecycle-anatomy__chart publishing-anatomy__dark" href="#5-遊戲狀態與-demo-摘要" aria-label="前往第三區，DEMO 今日摘要"><span class="anatomy-zone__number">03</span><strong>DEMO 今日摘要</strong><small>隔離展示資料 · 不列正式財務</small><span><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span></a>
    </div>
    <a class="anatomy-zone lifecycle-anatomy__toolbar" href="#6-工作入口與公開準備度" aria-label="前往第四區，資料管理入口"><span class="anatomy-zone__number">04</span><strong>資料管理</strong><small>編輯公開資料、參數與素材引用</small><i>進入遊戲管理 →</i></a>
    <div class="lifecycle-anatomy__split">
      <a class="anatomy-zone lifecycle-anatomy__detail publishing-anatomy__preview" href="#6-工作入口與公開準備度" aria-label="前往第五區，公開準備度與預覽"><span class="anatomy-zone__number">05</span><small>PUBLIC READINESS</small><strong>5 款可公開 · 1 款待補</strong><i>缺語系／素材／數值 · 開啟草稿預覽</i></a>
      <a class="anatomy-zone lifecycle-anatomy__states" href="#7-頁面狀態與錯誤處理" aria-label="前往第六區，資料新鮮度與替代狀態"><span class="anatomy-zone__number">06</span><strong>資料狀態</strong><i>Updated 10:20</i><i>DEMO 延遲</i><i>局部失敗</i><i>Empty</i><i>Forbidden</i></a>
    </div>
  </div>
  <div class="page-anatomy__legend"><span><i></i>Provider 自有大廳</span><span><i></i>DEMO 隔離資料</span><small>參照現行 `/lobby` 原型；不建立會員或錢包主資料。</small></div>
</figure>
<!-- PAGE_VISUAL_END -->

## 4. 大廳狀態摘要

- 摘要至少呈現 playable、coming soon、maintenance／unavailable 與 Delivery 狀態；所有計數皆以目前 Published Catalog 為母體，定義需隨卡片顯示。
- DEMO 活躍顯示統計定義、時間點、更新時間；沒有資料與 0 必須分開。
- 點擊狀態卡導向 `/lobby/games?status=...`；點擊 DEMO 活躍導向 `/lobby/demo`。
- 摘要不顯示 Production 財務、正式會員或 GGAP 代理商數量。

## 5. 遊戲狀態與 DEMO 摘要

遊戲狀態列顯示穩定 `game_id`、名稱、類型、公開版本、玩家狀態、readiness 與更新時間；需注意項目優先，再依 `game_id` 穩定排序。

DEMO 今日摘要顯示隔離測試 identity、技術工作階段、試玩事件與 Sandbox credit 流量。`demo_session_id` 只為 telemetry 技術識別，不是正式業務 Game Session；Production 仍以 Game Round 為唯一主要紀錄單位。原型 USD 改視為 mock，正式 UI 使用 Demo Points／Sandbox credit，絕不解讀為錢包餘額。

## 6. 工作入口與公開準備度

- 資料管理導向 `/lobby/management`；有遊戲脈絡時必須攜帶精確 `game_id`。
- 完整預覽導向 exact `catalog_revision_id`／`preview_manifest_id`；若無權查看草稿則隱藏或禁用並說明，不能退回 latest。
- 準備度顯示通過、警告、阻擋與規則版本，不只顯示百分比；原型 `82%` 不是正式門檻。
- 大廳公開資料引用遊戲主資料／數值／素材核准 snapshot，不建立另一套真實來源。

## 7. 頁面狀態與錯誤處理

支援 full loading、partial loading、empty lobby、DEMO no data、source delayed、partial source failure、query error、stale 與 Forbidden。局部 DEMO 失敗不阻擋遊戲管理入口；遊戲狀態來源失敗不得沿用過期數字卻不標示。

## 8. API、權限與驗收

後端提供 Published Catalog／Game Content 摘要、DP03 overlay、Delivery、需注意遊戲、DEMO 摘要、readiness、generated_at 與 source status。後端強制 Provider scope，DEMO 與 Production 儲存／查詢鏈隔離；正式 path、schema、刷新頻率與 permission key 待實作 Mapping。

使用 `1500px` 寬版；Mobile 依「公開結果 → 注意項目 → DEMO → 工作入口」排列。驗收需證明狀態由三層控制正確衍生、未收錄遊戲不被計入、DEMO 不進正式報表／風控、百分比不冒充核准結果、deep link 精確且所有局部失敗可辨識。

## 9. 已確認基準與實作 Mapping

DP04 已確認 Published Catalog 母體、三層公開控制、衍生玩家狀態、Delivery、精確導流與 DEMO 隔離。仍待 Mapping 的項目為正式摘要／telemetry 公式、API schema、更新頻率、permission key、資料新鮮度與驗收證據；完成後才可改為 Confirmed。
