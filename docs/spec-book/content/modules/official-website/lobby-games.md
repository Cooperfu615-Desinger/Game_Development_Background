# 遊戲清單

## 章節狀態

| 項目 | 內容 |
| --- | --- |
| 規格成熟度 | Draft — DP04 產品語意已同步；正式實作 Mapping 待補 |
| 製作範圍 | Active |
| 對應路由 | `/lobby/games` |
| 前端元件 | `src/views/GameLobby/Games.vue` |
| 主要來源 | `GAME_LOBBY_SPEC.md`、`GAME_LIST_SPEC.md` |
| 頁面角色 | 已納入 Provider 自有大廳之遊戲與玩家公開摘要清單 |

> 本頁是大廳公開資料的唯讀清單與入口，不直接編輯或批次改狀態。大廳狀態不取代 Provider 全域上架，也不控制 GGAP 代理商個別開放。

## 1. 目的與責任邊界

- 查找目前 Published Catalog 收錄的遊戲與玩家公開投影。
- 顯示玩家公開版號、RTP、波動度、最高倍率及資料完整度。
- 導向單筆遊戲管理與精確預覽。
- 不直接修改正式遊戲主資料、數值版本、素材版本或環境狀態。
- 不顯示 GGAP 對帳、代理商開關、正式 Game Round 或財務資訊。

## 2. 納入與公開規則

- 大廳項目以 `game_id` 引用 Provider 遊戲主資料；名稱／代碼為 snapshot，不作 join key。
- 只有目前 Published Catalog 收錄、且其 exact Game Content Revision 可解析的項目出現在本清單；未發布草稿與未收錄 Game 不出現。
- 玩家狀態由 DP04 coming soon／playable、DP03 runtime overlay 與 GGAP Launch Gate 衍生；`maintenance` 可保留內容，`suspended`／`retired` 不得 Launch，是否隱藏依安全政策。
- 公開數值來自已核准 snapshot，不允許在列表直接編輯。

## 3. 六區塊資訊架構

1. 清單摘要：Published Catalog 遊戲、衍生狀態、Delivery 與需處理項目。
2. 查詢條件：關鍵字、玩家顯示狀態、類型、Delivery 與公開版號。
3. 結果摘要：命中數、applied filters、排序與更新時間。
4. 遊戲列表：八個主要欄位、分頁與狀態語意。
5. 單筆公開摘要：內容、素材、數值來源及問題提示。
6. 詳情／預覽與替代狀態：deep link、empty、error、stale、Forbidden。

<!-- PAGE_VISUAL_START -->
<figure class="page-anatomy lifecycle-anatomy publishing-anatomy publishing-anatomy--lobby" aria-label="大廳遊戲清單六區塊畫面示意">
  <div class="lifecycle-anatomy__canvas">
    <a class="anatomy-zone lifecycle-anatomy__cards lifecycle-anatomy__cards--four" href="#4-摘要-查詢與結果" aria-label="前往第一區，清單摘要"><span class="anatomy-zone__number">01</span><span><small>大廳遊戲</small><strong>06</strong><i>完整集合</i></span><span><small>已推出</small><strong>03</strong><i>可試玩</i></span><span><small>即將／維護</small><strong>03</strong><i>保留展示</i></span><span><small>需補資料</small><strong>01</strong><i>公開阻擋</i></span></a>
    <a class="anatomy-zone lifecycle-anatomy__filters" href="#4-摘要-查詢與結果" aria-label="前往第二區，查詢條件"><span class="anatomy-zone__number">02</span><strong>查詢遊戲</strong><i>名稱／代碼／類型</i><i>玩家狀態</i><i>類型</i><i>準備度</i><i>版號</i><b>查詢</b></a>
    <a class="anatomy-zone lifecycle-anatomy__toolbar" href="#4-摘要-查詢與結果" aria-label="前往第三區，結果摘要"><span class="anatomy-zone__number">03</span><strong>6 款大廳遊戲</strong><small>依公開排序 · 每頁 20 筆 · Updated 10:20</small><i>清單唯讀；編輯請進入遊戲管理</i></a>
    <a class="anatomy-zone lifecycle-anatomy__table" href="#5-遊戲列表規格" aria-label="前往第四區，遊戲列表"><span class="anatomy-zone__number">04</span><strong>遊戲列表</strong><small>遊戲　版號　上架時間　玩家狀態　RTP　波動度　最高倍率　操作</small><i>翡翠天后 / JADE-QUEEN　v1.4.2　07.18　已推出　96.42%　高　x2,000　詳情／預覽</i></a>
    <div class="lifecycle-anatomy__split">
      <a class="anatomy-zone lifecycle-anatomy__detail" href="#6-公開摘要與跨頁導流" aria-label="前往第五區，單筆公開摘要"><span class="anatomy-zone__number">05</span><small>PUBLIC SNAPSHOT</small><strong>翡翠天后 · lobby-r12</strong><i>四語內容 · math-18 · asset-07 · readiness 5/5</i></a>
      <a class="anatomy-zone lifecycle-anatomy__states" href="#7-頁面狀態與錯誤處理" aria-label="前往第六區，導流與替代狀態"><span class="anatomy-zone__number">06</span><strong>詳情與預覽</strong><i>精確 game_id</i><i>No snapshot</i><i>Stale</i><i>Error</i><i>Forbidden</i></a>
    </div>
  </div>
  <div class="page-anatomy__legend"><span><i></i>玩家公開摘要</span><span><i></i>唯讀清單</span><small>參照現行 `/lobby/games` 原型；不包含批次變更或 GGAP 開關。</small></div>
</figure>
<!-- PAGE_VISUAL_END -->

## 4. 摘要、查詢與結果

查詢包含 keyword、玩家狀態、遊戲類型、readiness、公開版號；編輯條件不立即改變結果，查詢後建立 applied filters。預設依公開排序與 `game_id` 穩定次序，正式分頁／排序由伺服器處理。

摘要使用完整 Published Catalog 集合，顯示衍生狀態、Delivery 與需處理數量；資料來源失敗不顯示 0。由總覽 deep link 進入時套用 query 並可清除。

## 5. 遊戲列表規格

| 欄位 | 規則 |
| --- | --- |
| 遊戲 | 名稱、代碼、類型、`game_id`；長文字可展開。 |
| 版號 | 大廳公開 snapshot 的展示版號，不等同 Production artifact 版號。 |
| 上架時間 | 玩家首次已推出時間；未推出顯示 `—`。 |
| 狀態 | 顯示 DP04 內容語意、DP03 runtime overlay 與最終 CTA 結果，不以單一 enum 混用。 |
| Delivery | `propagating`、`healthy`、`degraded`、`failed` 與目前 Snapshot。 |
| RTP／波動度／最高倍率 | 引用已核准公開數值 snapshot；缺值顯示 `—` 與原因。 |
| 操作 | 精確導向管理及預覽；不得直接變更狀態。 |

Desktop 使用可捲動表格；Mobile 轉卡片並保留全部公開欄位與兩個入口。

## 6. 公開摘要與跨頁導流

單筆摘要顯示 Catalog Revision、exact Game Content Revision、四語解析、素材／數值參照、DP03 overlay、玩家結果、Published Snapshot、Delivery 及阻擋／警告。詳情與預覽攜帶精確 `game_id`、`catalog_revision_id`、`revision_id` 或 `snapshot_id`；來源缺失時顯示原因，不可靜默套用 latest。

## 7. 頁面狀態與錯誤處理

支援 loading、empty、no match、query error、partial field unavailable、snapshot missing、stale、invalid deep link 與 Forbidden。局部公開數值失敗顯示 `—`，不得顯示 0% 或推算 mock。

## 8. API、權限與驗收

後端提供 Published Catalog 摘要、filter options、列表與 exact Snapshot 摘要；強制 Provider scope 並回傳 stable sorting、generated_at、source status 與 allowed links。正式 API path、schema 與 permission key 待實作 Mapping。

本頁使用 `1500px` 寬版。驗收條件：只顯示 Published Catalog；exact Game Content Revision 與公開數值可追溯；列表唯讀；三層狀態不混用；Desktop／Mobile、鍵盤與替代狀態可驗收。

## 9. 已確認基準與實作 Mapping

DP04 已確認 Catalog 收錄、exact content revision、排序、公開 Snapshot、四語 fallback、狀態矩陣與移除／停用語意。仍待 Mapping 的項目為正式列表／摘要 API、schema、permission key、排序效能、錯誤 transport 與驗收證據；完成後才可改為 Confirmed。
