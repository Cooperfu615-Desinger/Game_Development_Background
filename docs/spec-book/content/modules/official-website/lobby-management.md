# 遊戲管理

## 章節狀態

| 項目 | 內容 |
| --- | --- |
| 規格成熟度 | Draft — DP04 產品語意已同步；正式實作 Mapping 待補 |
| 製作範圍 | Active |
| 對應路由 | `/lobby/management` |
| 前端元件 | `src/views/GameLobby/Management.vue` |
| 主要來源 | `GAME_LOBBY_SPEC.md`、`GAME_LIST_SPEC.md` |
| 頁面角色 | Lobby Game Content 與 Lobby Catalog 的 Revision、檢查、預覽與發布工作台 |

> 大廳管理引用 DP03 Game、Version、核准數值與 exact Asset，不建立另一套遊戲真實來源。DP04 產品語意已成立；原型表單與 `5 / 5` 檢查仍是 mock，正式持久化與公開副作用尚未接入。

## 1. 目的與責任邊界

- 分別編輯單款 Lobby Game Content 與整份 Lobby Catalog Revision，並檢查、預覽及發布。
- 顯示但不直接修改遊戲主資料、程式版號與核准遊戲數值。
- DP04 只設定 coming soon／playable 等內容語意；DP03 runtime overlay 與 GGAP Gate 仍可阻擋 Launch。
- YouTube 第一階段只保存核准 URL，不上傳影片。
- 不管理 GGAP 代理商開關、正式會員、錢包或 Game Round。

## 2. Game Content 與 Catalog 版本模型

- Lobby Game Content 以 `content_entry_id + game_id + revision_id` 為工作脈絡；Lobby Catalog 使用獨立 `catalog_revision_id`。
- Catalog Revision 保存完整收錄、排序、分組、置頂及每筆 exact Game Content Revision；兩條發布流互不自動改變。
- 基本識別、類型、程式版號為上游唯讀 snapshot；公開名稱／說明、素材用途及玩家狀態為本頁草稿。
- RTP、波動度、最高倍率及限紅引用已核准數值／設定版本，禁止複製為不可追溯自由文字。
- 發布成功才原子切換各 scope 的 Published Snapshot；Restore 由歷史 Snapshot 建立新 Revision、重新驗證／核准並建立新 Job。

## 3. 六區塊資訊架構

1. 遊戲脈絡：遊戲選擇、穩定 ID、目前公開狀態與 draft revision。
2. 基本資料與參照：主資料、程式、數值及上架來源。
3. 四語系公開內容：名稱、簡述、玩法與完整度。
4. 圖片／影片與內容語意：素材版本、YouTube、coming soon／playable 與 Catalog 收錄。
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
- 頁首分別顯示 Game Content／Catalog draft、Published Snapshot、DP03 overlay、Delivery、最後更新者及未儲存狀態。
- 唯讀來源：Game ID、遊戲代碼、類型、程式版本、核准數值／設定版本。
- 可編輯範圍：多語公開內容、核准素材引用、YouTube URL、內容顯示語意、Catalog 收錄／排序與內部發布備註。

## 5. 公開內容與媒體

- 四語固定 `zh-TW`、`zh-CN`、`en`、`ja` 並原子發布；欄位依 `STRICT`／`FALLBACK`／`OPTIONAL_HIDE` 處理，預覽與 Snapshot 保存解析結果。
- 公開 RTP／波動度／最高倍率來自核准 math snapshot；投注顯示則引用設定版本及明確單位，不沿用原型 USD 作正式契約。
- 卡片／詳情圖片引用 `asset_version_id`，顯示用途、裝置、語系、掃描及審核狀態。
- YouTube URL 僅接受核准 domain／格式；預覽嵌入受 CSP、privacy mode 與可用性檢查。
- coming soon／playable 是 DP04 內容語意；`maintenance`／`suspended`／`retired` 由 DP03 runtime overlay 套用，不寫回 Content Revision。DEMO Launch 仍只進 Sandbox。

## 6. 公開前檢查與預覽

檢查包含：DP03 依賴、四語政策、公開數值、exact 素材、安全掃描、YouTube／CSP、內容語意、Catalog 完整性／排序、DEMO readiness、base／expected revision、權限與核准。每項回傳 rule ID、版本、severity、結果與修正導流；Blocking 不得略過。

預覽由 exact Preview Manifest 固定 Catalog Revision、Game Content Revision、區塊 draft／public 來源、locale、device、Asset、DP03 snapshot、renderer 與 hash；不得使用 latest 替代。

## 7. 儲存、發布與頁面狀態

儲存以 base revision／ETag 建立新 Revision；Publish／Disable／Restore 綁定 exact Revision、expected published revision、validation、approval 與 idempotency。playable、大量 Catalog、外部網域與重要素材走第二人核准。頁面支援 loading、unsaved、validation、dependency changed、asset revoked、Revision／Publication Conflict、Approval、Job 與 Delivery 狀態；失敗保持既有 Snapshot。

## 8. API、權限、稽核與驗收

後端提供 Game Content／Catalog Entry、Revision、Published Snapshot、DP03 參照、Validation、Preview Manifest／Token、Submit／Approve／Reject、Publish／Disable／Restore Job、timeline 與 allowed actions。讀取、編輯、預覽、提交、核准、發布、停用／還原及 Audit 可分 capability；後端逐次授權並保存 append-only 證據。

使用 `1500px` 寬版；Desktop 以 tabs／分區呈現，Mobile 保留 scope 與底部操作且不得水平溢出。驗收需證明 Game Content／Catalog 獨立、上游欄位唯讀、三層狀態正確、exact 四語／素材可追溯、Blocking 真正阻擋、衝突不覆蓋且公開 Snapshot 只在成功後改變。

## 9. 已確認基準與實作 Mapping

DP04 已確認兩條獨立發布流、Revision／Job／Snapshot、四語／素材、精確預覽、三層狀態、風險通道、衝突、失敗與還原。仍待 Mapping 的項目為正式欄位 schema、API path、permission key、媒體／Renderer／CDN、安全實作、Audit 保存及驗收證據；完成後才可改為 Confirmed。
