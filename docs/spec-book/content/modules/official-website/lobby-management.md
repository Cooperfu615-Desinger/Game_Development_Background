# 遊戲管理

## 章節狀態

| 項目 | 內容 |
| --- | --- |
| 規格成熟度 | Draft — Batch D 完整頁面規格 |
| 製作範圍 | Active |
| 對應路由 | `/lobby/management` |
| 前端元件 | `src/views/GameLobby/Management.vue` |
| 主要來源 | `GAME_LOBBY_SPEC.md`、`GAME_LIST_SPEC.md` |
| 頁面角色 | 單一遊戲的大廳公開草稿、檢查與發布準備工作台 |

> 大廳管理引用 Provider 遊戲主資料、核准數值與素材，不建立另一套遊戲真實來源。原型表單與 `5 / 5` 檢查都是 mock；儲存、發布、權限與衝突尚未接入。

## 1. 目的與責任邊界

- 編輯大廳專用公開內容、素材引用與玩家狀態，並檢查是否可發布。
- 顯示但不直接修改遊戲主資料、程式版號與核准遊戲數值。
- 玩家狀態只控制 DEMO 啟動，不取代 Production／DEMO 環境全域上架。
- YouTube 第一階段只保存核准 URL，不上傳影片。
- 不管理 GGAP 代理商開關、正式會員、錢包或 Game Round。

## 2. 草稿與公開版本模型

- 工作單位是 `game_id + lobby_draft_revision`；published revision 與 draft 分離。
- 基本識別、類型、程式版號為上游唯讀 snapshot；公開名稱／說明、素材用途及玩家狀態為本頁草稿。
- RTP、波動度、最高倍率及限紅引用已核准數值／設定版本，禁止複製為不可追溯自由文字。
- 發布成功才替換公開 snapshot；回復建立新草稿與發布工作。

## 3. 六區塊資訊架構

1. 遊戲脈絡：遊戲選擇、穩定 ID、目前公開狀態與 draft revision。
2. 基本資料與參照：主資料、程式、數值及上架來源。
3. 四語系公開內容：名稱、簡述、玩法與完整度。
4. 圖片／影片與玩家狀態：素材版本、YouTube、三狀態。
5. 公開前檢查與完整預覽：blocking、warning、規則版本及 deep link。
6. 儲存／發布與替代狀態：unsaved、conflict、failed、Forbidden、audit。

<!-- PAGE_VISUAL_START -->
<figure class="page-anatomy lifecycle-anatomy publishing-anatomy publishing-anatomy--lobby" aria-label="大廳遊戲管理六區塊畫面示意">
  <div class="lifecycle-anatomy__canvas">
    <a class="anatomy-zone lifecycle-anatomy__toolbar" href="#4-遊戲脈絡與資料責任" aria-label="前往第一區，遊戲脈絡"><span class="anatomy-zone__number">01</span><strong>翡翠天后 / GAME-001</strong><small>JADE-QUEEN · 老虎機 · lobby draft-r13</small><i>目前公開：已推出 · published-r12</i></a>
    <a class="anatomy-zone lifecycle-anatomy__matrix" href="#4-遊戲脈絡與資料責任" aria-label="前往第二區，基本資料與參照"><span class="anatomy-zone__number">02</span><strong>基本資料與上游參照</strong><span><b>遊戲主資料</b>類型 · Game ID · 唯讀</span><span><b>程式／數值</b>v1.4.2 · math-18 · 已核准</span><span><b>公開限紅</b>cfg-05 · Provider 點數來源</span></a>
    <a class="anatomy-zone lifecycle-anatomy__table publishing-anatomy__editor-area" href="#5-公開內容與媒體" aria-label="前往第三區，四語系公開內容"><span class="anatomy-zone__number">03</span><strong>四語系公開內容</strong><small>繁中　簡中　English　日本語　｜　名稱　簡述　玩法說明　完整度</small><i>繁中 100%　簡中 100%　English 80%　日本語 100%　·　1 項待補</i></a>
    <a class="anatomy-zone lifecycle-anatomy__filters" href="#5-公開內容與媒體" aria-label="前往第四區，圖片影片與玩家狀態"><span class="anatomy-zone__number">04</span><strong>圖片、影片與玩家狀態</strong><i>asset-v7</i><i>YouTube URL</i><i>即將開放</i><i>已推出</i><i>維護中</i><b>已推出</b></a>
    <div class="lifecycle-anatomy__split">
      <a class="anatomy-zone lifecycle-anatomy__detail publishing-anatomy__preview" href="#6-公開前檢查與預覽" aria-label="前往第五區，公開前檢查與預覽"><span class="anatomy-zone__number">05</span><small>PUBLIC CHECK</small><strong>8 通過 · 1 阻擋</strong><i>語系 · 數值 · 素材 · URL · 狀態 · 開啟草稿預覽</i></a>
      <a class="anatomy-zone lifecycle-anatomy__states" href="#7-儲存-發布與頁面狀態" aria-label="前往第六區，儲存發布與替代狀態"><span class="anatomy-zone__number">06</span><strong>草稿與發布</strong><i>Unsaved</i><i>Validate</i><i>Conflict</i><i>Publish job</i><i>Forbidden</i></a>
    </div>
  </div>
  <div class="page-anatomy__legend"><span><i></i>大廳公開草稿</span><span><i></i>上游資料唯讀參照</span><small>參照現行 `/lobby/management` 原型；原型 5/5 不代表正式檢查。</small></div>
</figure>
<!-- PAGE_VISUAL_END -->

## 4. 遊戲脈絡與資料責任

- 由 query 進入時以精確 `game_id` 載入；不存在、無權或未納入大廳分開處理。
- 頁首顯示 draft／published revision、玩家狀態、最後更新者及未儲存狀態。
- 唯讀來源：Game ID、遊戲代碼、類型、程式版本、核准數值／設定版本。
- 可編輯範圍：多語公開內容、核准素材引用、YouTube URL、玩家狀態及內部發布備註。

## 5. 公開內容與媒體

- 四語系各自維護名稱、簡述及玩法；顯示字數、完整度、fallback 與驗證。
- 公開 RTP／波動度／最高倍率來自核准 math snapshot；投注顯示則引用設定版本及明確單位，不沿用原型 USD 作正式契約。
- 卡片／詳情圖片引用 `asset_version_id`，顯示用途、裝置、語系、掃描及審核狀態。
- YouTube URL 僅接受核准 domain／格式；預覽嵌入受 CSP、privacy mode 與可用性檢查。
- 三種玩家狀態附行為說明；已推出才允許 DEMO Launch。

## 6. 公開前檢查與預覽

檢查包含：主資料可用、四語完整、公開數值核准、素材可用、安全掃描、YouTube、玩家狀態、DEMO Launch readiness、revision conflict。每項回傳 rule ID、版本、severity、結果與修正導流；blocking 未清除不得發布。

預覽導向 `/lobby/preview?gameId=...&mode=draft&revision=...`，不得使用「最新草稿」替代精確 revision。

## 7. 儲存、發布與頁面狀態

儲存草稿需 revision concurrency；發布重新執行檢查、確認目標 revision 後建立 job。頁面支援 loading、unsaved changes、validation error、source changed、asset unavailable、conflict、queued／running／failed／succeeded、stale 與 Forbidden。失敗保持既有公開 revision。

## 8. API、權限、稽核與驗收

API 提供遊戲脈絡、draft／published snapshot、上游參照、驗證、儲存、預覽及發布 job。讀取、編輯、驗證、預覽草稿與發布可分 permission；操作記錄 actor、reason、before／after revision、結果及 trace。

使用 `1500px` 寬版；Desktop 以 tabs／分區呈現，Mobile 保留遊戲脈絡與底部操作且不得水平溢出。驗收需證明上游欄位不可改、三狀態行為正確、四語／素材可追溯、blocking 真正阻擋、衝突不覆蓋且公開版本只在成功後改變。

## 9. 待確認與 Draft 移除條件

- `TBD-DOM-005`：草稿、公開、回復與大廳生命週期。
- `TBD-DAT-006`：多語、素材、fallback 與公開欄位。
- `TBD-API-006`、`TBD-SEC-005`：管理、預覽、發布 API 與媒體安全。
- `TBD-SEC-001`、`TBD-SEC-003`：權限、核准與 audit。

正式欄位責任、版本模型、檢查、API、權限及發布流程核准後，才可改為 Confirmed。
