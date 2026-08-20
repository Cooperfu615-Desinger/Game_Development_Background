# 大廳預覽

## 章節狀態

| 項目 | 內容 |
| --- | --- |
| 規格成熟度 | Draft — DP04 產品語意已同步；正式 Renderer Mapping 待補 |
| 製作範圍 | Active |
| 對應路由 | `/lobby/preview` |
| 前端元件 | `src/views/GameLobby/Preview.vue` |
| 主要來源 | `GAME_LOBBY_SPEC.md` |
| 頁面角色 | Provider 自有遊戲大廳公開版本／指定草稿的安全成果預覽 |

> 本頁只預覽遊戲大廳，不包含遊戲官網 Banner、法務內容或 GGAP 平台。畫面中的 DEMO identity／額度只是隔離展示脈絡，不是 Provider 錢包或正式會員。

## 1. 目的與責任邊界

- 在發布前後檢查完整大廳的四語、Desktop／Mobile、Catalog、遊戲卡與三層控制後的 CTA 結果。
- 依 exact Preview Manifest 組合指定 Revision 與 Public Snapshot；允許混合來源，但每個區塊必須明確標示 draft／public。
- 允許選取單一遊戲查看公開摘要及返回管理頁修正。
- 預覽中的「立即試玩」預設為安全模擬；是否可啟動隔離 DEMO 由權限與契約決定。
- 不建立公開分享、正式會員登入、錢包、Production Launch 或 GGAP 代理商控制。

## 2. 預覽來源與安全模型

- Preview Manifest 固定 Catalog Revision、每款 Game Content Revision、每區塊來源、語系解析、裝置、exact Asset、DP03 dependency snapshot、renderer version、validation result 與 hash；不得追蹤 latest。
- 草稿內容只對有權人員可見，回應與資產需避免公開 cache／搜尋索引。
- 外部媒體、YouTube、CTA 與遊戲啟動使用 preview sandbox、CSP、allowlist 及明確離開提示。
- Preview token 必須短效、Provider／Revision／Manifest scoped、可撤銷、不得放入長期 URL；第一版不提供匿名分享。

## 3. 六區塊資訊架構

1. 預覽控制列：公開／草稿、revision、裝置、語系與更新時間。
2. 玩家端頁首：品牌、DEMO 模式與非錢包展示額度。
3. 分類與遊戲網格：分類、卡片、公開數值及狀態 CTA。
4. 單筆遊戲詳情：說明、媒體、數值、狀態與來源 revision。
5. Mobile／語系／狀態檢查：各變體、缺漏與回到管理。
6. 預覽失效與安全狀態：expired、asset error、forbidden、stale。

<!-- PAGE_VISUAL_START -->
<figure class="page-anatomy lifecycle-anatomy publishing-anatomy publishing-anatomy--lobby" aria-label="大廳預覽六區塊畫面示意">
  <div class="lifecycle-anatomy__canvas publishing-anatomy__preview-canvas">
    <a class="anatomy-zone lifecycle-anatomy__filters" href="#4-預覽控制與來源" aria-label="前往第一區，預覽控制列"><span class="anatomy-zone__number">01</span><strong>預覽控制</strong><i>正式版本</i><i>編輯草稿 r13</i><i>Desktop</i><i>Mobile</i><i>繁中</i><b>Updated 10:20</b></a>
    <a class="anatomy-zone lifecycle-anatomy__toolbar publishing-anatomy__dark" href="#5-玩家端頁首與遊戲網格" aria-label="前往第二區，玩家端頁首"><span class="anatomy-zone__number">02</span><strong>PROVIDER · GAME LOBBY</strong><small>DEMO 模式 · 不涉及真實資金</small><i>展示額度 10,000 demo credits</i></a>
    <a class="anatomy-zone lifecycle-anatomy__table publishing-anatomy__dark publishing-anatomy__game-grid" href="#5-玩家端頁首與遊戲網格" aria-label="前往第三區，分類與遊戲網格"><span class="anatomy-zone__number">03</span><strong>全部　老虎機　捕魚機　棋牌　小遊戲</strong><small>翡翠天后［立即試玩］　深海龍王［立即試玩］　星際躍升［即將開放］</small><i>天宮寶藏［維護中］　糖果衝刺［即將開放］</i></a>
    <a class="anatomy-zone lifecycle-anatomy__detail publishing-anatomy__preview" href="#6-詳情-變體與修正導流" aria-label="前往第四區，單筆遊戲詳情"><span class="anatomy-zone__number">04</span><small>GAME DETAIL</small><strong>翡翠天后 · 已推出</strong><i>公開說明 · RTP · 波動度 · 最高倍率 · 素材／影片</i></a>
    <a class="anatomy-zone lifecycle-anatomy__matrix" href="#6-詳情-變體與修正導流" aria-label="前往第五區，變體與檢查"><span class="anatomy-zone__number">05</span><strong>預覽變體與檢查</strong><span><b>Desktop / Mobile</b>版面與 CTA</span><span><b>四語系</b>缺翻譯與 fallback</span><span><b>三狀態</b>可玩／不可玩行為</span></a>
    <a class="anatomy-zone lifecycle-anatomy__states" href="#7-頁面狀態與安全處理" aria-label="前往第六區，預覽失效與安全狀態"><span class="anatomy-zone__number">06</span><strong>安全與失效</strong><i>Expired</i><i>Asset error</i><i>Revision stale</i><i>Launch blocked</i><i>Forbidden</i></a>
  </div>
  <div class="page-anatomy__legend"><span><i></i>指定 revision 預覽</span><span><i></i>DEMO sandbox</span><small>參照現行 `/lobby/preview` 原型；DEMO 餘額不是錢包。</small></div>
</figure>
<!-- PAGE_VISUAL_END -->

## 4. 預覽控制與來源

- 控制列顯示 manifest ID、Catalog／Game Content Revision、每個區塊來源、owner、生成時間及未發布標示。
- 裝置切換是 layout preview，不只縮放整張畫面；Desktop／Mobile viewport 由核准 preset 定義。
- 語系固定 `zh-TW`、`zh-CN`、`en`、`ja`，依 `STRICT`／`FALLBACK`／`OPTIONAL_HIDE` 顯示解析來源、隱藏結果與 Blocking。
- 任何 manifest／mode／revision／game deep link 都需正規化；目標不存在或無權時顯示明確狀態，不可靜默改看 Published 或 latest。

## 5. 玩家端頁首與遊戲網格

- 頁首顯示 Provider 品牌、DEMO 模式、資料 revision 與非真實資金說明。
- 原型 `USD 10,000.00` 一律視為 mock；正式顯示採 Sandbox credit／Demo Points，明示非真實資金且不可被 API／匯出解讀為餘額。
- 分類來自公開 taxonomy；卡片顯示名稱、類型、RTP、素材及 CTA。
- coming soon、DP03 maintenance／suspended／retired 與 GGAP gate blocked 的 CTA disabled 且附原因；只有三層條件成立才允許安全 DEMO action。
- 卡片排序與內容完全來自 exact Catalog／Game Content Revision，runtime safety overlay 需標示來源，禁止部分讀取最新資料。

## 6. 詳情、變體與修正導流

單筆詳情顯示公開名稱／說明、玩法、RTP、波動度、最高倍率、素材、影片及玩家狀態。每個來源可追溯到 lobby、math、asset revision；關閉後焦點回到原卡片。

變體檢查顯示四語 × 兩裝置 × DP03／DP04／GGAP 狀態矩陣的結果與問題數，並以 exact IDs 導回來源管理頁。預覽不直接編輯、核准、發布或切換 Snapshot。

## 7. 頁面狀態與安全處理

支援 loading、empty lobby、revision missing／expired、asset unavailable、translation fallback、preview service error、DEMO launch blocked、stale 與 Forbidden。草稿失效後不得靜默切到公開版；需由使用者明確選擇。

## 8. API、權限、無障礙與驗收

後端提供 Create／Query Preview Manifest、短效 token、exact Revision／Snapshot、分類、遊戲詳情及可選 Sandbox launch token。公開與草稿來源使用適當 cache／authorization；草稿、素材及 token 不得洩漏。正式 path、schema、Renderer 與 permission key 待 Mapping。

使用 `1500px` 寬版；Portal Mobile 上的預覽控制仍可操作，內嵌 Desktop 畫布可在容器內縮放／捲動但頁面本身不得溢出。遊戲卡、disabled CTA、modal 焦點與色彩對比需可存取。

驗收需證明 exact Manifest 不漂移、混合來源清楚、四語／雙裝置／三層狀態可檢查、草稿受權限保護、展示 credit 不成為錢包、不可玩狀態無 Launch、錯誤不切換資料來源。

## 9. 已確認基準與實作 Mapping

DP04 已確認 exact Preview Manifest、區塊來源標示、四語解析、素材版本、裝置、三層狀態、短效 token、CSP 與 Sandbox 邊界。仍待 Mapping 的項目為正式 Preview API、Manifest schema、Renderer version、token transport、permission key、CDN／Cache 及瀏覽器驗收證據；完成後才可改為 Confirmed。
