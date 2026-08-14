# 發布紀錄

## 章節狀態

| 項目 | 內容 |
| --- | --- |
| 規格成熟度 | Draft — Batch D 完整頁面規格 |
| 製作範圍 | Active |
| 對應路由 | `/website/releases` |
| 前端元件 | `src/views/GameWebsite/Releases.vue` |
| 主要來源 | `GAME_WEBSITE_SPEC.md` |
| 頁面角色 | Provider 官網內容發布事件與不可變版本快照的追溯頁 |

> 本頁只追溯官網 Banner 與靜態內容，不是遊戲程式版本、遊戲大廳公開版本或 GGAP 上架紀錄。現行原型只有已發布／草稿列表；目標 Draft 補上工作狀態與失敗追溯，但不擴張為整站版本打包或一鍵回滾。

## 1. 目的與責任邊界

- 查看 Banner、條款、隱私權、負責任遊戲與聯絡資訊的發布事件。
- 追溯發布目標、來源 revision、內容範圍、操作者、時間、結果與錯誤。
- 區分「內容草稿／公開狀態」與「發布工作狀態」。
- 不刪除或改寫已完成事件；不提供整體官網版本打包、差異全文或一鍵回滾。
- 若未來回復內容，需建立新的草稿／發布工作，不把舊事件改成目前版本。

## 2. 發布事件模型

穩定主鍵使用 `release_id`／`job_id`；展示版號可由系統產生，不作 join key。事件至少保存內容類型與 ID、來源 draft revision、前一 published revision、結果 revision、目標語系、狀態、actor、建立／開始／完成時間、idempotency key、trace ID、錯誤摘要及不可變 audit snapshot。

## 3. 六區塊資訊架構

1. 發布摘要：目前公開版本、待處理工作、最近發布與失敗。
2. 查詢與篩選：內容類型、狀態、操作者、時間、release ID。
3. 結果摘要：命中數、applied filters、排序及資料更新時間。
4. 發布事件列表：版號、範圍、revision、狀態、時間與操作者。
5. 發布詳情：before／source／result snapshot、timeline、trace 與錯誤。
6. 替代狀態與導流：running、failed、conflict、stale、Forbidden 及來源頁。

<!-- PAGE_VISUAL_START -->
<figure class="page-anatomy lifecycle-anatomy publishing-anatomy publishing-anatomy--website" aria-label="發布紀錄六區塊畫面示意">
  <div class="lifecycle-anatomy__canvas">
    <a class="anatomy-zone lifecycle-anatomy__cards" href="#4-發布摘要與查詢" aria-label="前往第一區，發布摘要"><span class="anatomy-zone__number">01</span><span><small>目前公開版本</small><strong>v1.4</strong><i>08.04 發布</i></span><span><small>待處理工作</small><strong>01</strong><i>Banner 草稿</i></span><span><small>最近發布人員</small><strong>Admin</strong><i>Provider Admin</i></span></a>
    <a class="anatomy-zone lifecycle-anatomy__filters" href="#4-發布摘要與查詢" aria-label="前往第二區，查詢與篩選"><span class="anatomy-zone__number">02</span><strong>官網發布事件</strong><i>全部</i><i>已發布</i><i>進行中</i><i>失敗</i><i>內容類型</i><b>查詢</b></a>
    <a class="anatomy-zone lifecycle-anatomy__toolbar" href="#5-結果摘要與發布列表" aria-label="前往第三區，結果摘要"><span class="anatomy-zone__number">03</span><strong>24 筆發布事件</strong><small>依建立時間倒序 · 最近更新 10:20</small><i>官網內容專用，不含遊戲／大廳版本</i></a>
    <a class="anatomy-zone lifecycle-anatomy__table" href="#5-結果摘要與發布列表" aria-label="前往第四區，發布事件列表"><span class="anatomy-zone__number">04</span><strong>發布事件列表</strong><small>版本　內容範圍　來源 revision　工作狀態　發布時間　操作者　詳情</small><i>v1.4.0　Banner／負責任遊戲　r18／r09　已發布　08.04 15:20　Provider Admin</i></a>
    <div class="lifecycle-anatomy__split">
      <a class="anatomy-zone lifecycle-anatomy__detail" href="#6-發布詳情與追溯" aria-label="前往第五區，發布詳情"><span class="anatomy-zone__number">05</span><small>RELEASE DETAIL</small><strong>release-web-20260804-014</strong><i>來源／結果 snapshot · timeline · actor · trace · error</i></a>
      <a class="anatomy-zone lifecycle-anatomy__states" href="#7-替代狀態與導流" aria-label="前往第六區，替代狀態與導流"><span class="anatomy-zone__number">06</span><strong>狀態與導流</strong><i>Queued</i><i>Running</i><i>Failed</i><i>Conflict</i><i>來源內容</i></a>
    </div>
  </div>
  <div class="page-anatomy__legend"><span><i></i>不可變發布事件</span><span><i></i>官網內容範圍</span><small>參照現行 `/website/releases` 原型；不包含一鍵回滾或全文差異。</small></div>
</figure>
<!-- PAGE_VISUAL_END -->

## 4. 發布摘要與查詢

- 摘要顯示最近成功發布、active jobs、近期待處理草稿與近期失敗；來源失敗不得顯示 0。
- 查詢支援 release／job ID、內容類型／ID、工作狀態、結果狀態、操作者及建立／完成時間。
- 時間使用 Provider 時區並保留原始 offset；預設近 30 日、建立時間倒序。

## 5. 結果摘要與發布列表

列表至少包含：展示版號、release ID、內容範圍、來源 revision、結果 revision、工作／公開狀態、建立／完成時間、actor、摘要與詳情入口。列表由伺服器排序分頁；長摘要截斷但保留可存取全文。

草稿不是發布事件成功；queued／running／failed 也不得顯示為已發布。已完成事件不可刪除或修改。

## 6. 發布詳情與追溯

詳情顯示來源內容 deep link、before／source／result snapshot references、語系範圍、驗證結果、工作 timeline、actor、理由、idempotency、trace ID 與錯誤。第一階段只提供結構化摘要，不提供全文差異或直接回復操作。

## 7. 替代狀態與導流

支援 loading、empty、query error、queued、running、succeeded、failed、cancelled、conflict、partial audit unavailable、stale 與 Forbidden。進行中頁面可輪詢／重新載入並由 job ID 恢復；失敗顯示可重試語意但實際重新發布回到來源頁建立新工作。

導流必須帶精確 `content_type`、`content_id` 與 revision；不得只用名稱搜尋。

## 8. API、權限、保存與驗收

API 提供摘要、查詢列表與 release／job 詳情；所有資料強制 Provider scope。查看內容、查看 audit 與執行發布可使用不同 permission。保存期限、匯出及敏感錯誤遮罩待核准。

本頁使用 `1500px` 寬版；Mobile 將事件轉為卡片，保留 ID、狀態、內容、時間、actor 與詳情。驗收需證明事件不可變、狀態維度分離、失敗不改變公開內容、跨頁可精確追溯且讀屏可辨識狀態。

## 9. 待確認與 Draft 移除條件

- `TBD-DOM-005`：官網內容版本與發布生命週期。
- `TBD-API-006`：發布 job、事件查詢與詳情 API。
- `TBD-SEC-001`、`TBD-SEC-003`、`TBD-SEC-005`：檢視／發布權限、核准與安全追溯。
- `TBD-NFR-003`：冪等、衝突、失敗及恢復。

正式事件 schema、狀態、API、權限、保存與 audit 規則核准並通過驗收後，才可改為 Confirmed。
