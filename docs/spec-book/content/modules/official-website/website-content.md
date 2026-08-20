# 內容管理

## 章節狀態

| 項目 | 內容 |
| --- | --- |
| 規格成熟度 | Draft — DP04 產品語意已同步；正式實作 Mapping 待補 |
| 製作範圍 | Active |
| 對應路由 | `/website/content` |
| 前端元件 | `src/views/GameWebsite/Content.vue` |
| 主要來源 | `GAME_WEBSITE_SPEC.md` |
| 頁面角色 | 官網條款、隱私權、負責任遊戲及聯絡資訊的低頻內容工作台 |

> 本頁不是完整 CMS。公告、活動、版型、SEO、全站導覽與 Footer 設定不在範圍；原型簡易工具列與發布提示不是正式富文字、清理或發布契約。

## 1. 目的與責任邊界

- 集中維護條款、隱私權政策、負責任遊戲及聯絡資訊四類內容。
- 每類內容分開保存草稿與公開版本，支援繁中、簡中、English、日本語。
- 條款／政策／負責任遊戲使用受限富文字 schema；聯絡資訊使用結構化欄位。
- Provider 只管理自有官網，不處理 GGAP、代理商、商戶或會員主資料。
- 發布前必須完成內容驗證與安全清理；條款、隱私權與負責任遊戲走高風險通道，要求不同一人的第二人核准。

## 2. 內容單位與版本

`content_key` 固定為 `terms`、`privacy`、`responsible`、`contact`。每個 key 對應穩定 Content Entry，每次儲存建立不可變 Revision，公開事實由 Published Snapshot 表示。不同 key 各有 publication scope、Revision、Job、Snapshot 與歷程，不以整個官網打包，也不共用可變版本序列。

## 3. 六區塊資訊架構

1. 內容摘要：四類內容、支援語系、更新及公開狀態。
2. 內容區塊導覽：條款、隱私權、負責任遊戲、聯絡資訊。
3. 語系與版本脈絡：語系、草稿／公開 revision、完整度與更新者。
4. 內容編輯：受限富文字或結構化聯絡欄位。
5. 發布前檢查與預覽：安全、完整度、差異摘要與目標語系。
6. 儲存／發布與替代狀態：驗證、衝突、失敗及權限。

<!-- PAGE_VISUAL_START -->
<figure class="page-anatomy lifecycle-anatomy publishing-anatomy publishing-anatomy--website" aria-label="內容管理六區塊畫面示意">
  <div class="lifecycle-anatomy__canvas">
    <a class="anatomy-zone lifecycle-anatomy__cards" href="#4-內容摘要與區塊導覽" aria-label="前往第一區，內容摘要"><span class="anatomy-zone__number">01</span><span><small>管理區塊</small><strong>04</strong><i>低頻內容</i></span><span><small>支援語系</small><strong>04</strong><i>繁中為主要語系</i></span><span><small>目前狀態</small><strong>公開</strong><i>最後檢視 08.04</i></span></a>
    <a class="anatomy-zone lifecycle-anatomy__filters" href="#4-內容摘要與區塊導覽" aria-label="前往第二區，內容區塊導覽"><span class="anatomy-zone__number">02</span><strong>網站內容</strong><i>條款</i><i>隱私權政策</i><i>負責任遊戲</i><i>聯絡資訊</i><b>選取區塊</b></a>
    <a class="anatomy-zone lifecycle-anatomy__toolbar" href="#5-語系-版本與編輯器" aria-label="前往第三區，語系與版本脈絡"><span class="anatomy-zone__number">03</span><strong>條款 · draft-r18</strong><small>公開版本 r17 · Provider Editor · 08.14 10:20</small><i>繁中　簡中　English　日本語</i></a>
    <a class="anatomy-zone lifecycle-anatomy__table publishing-anatomy__editor-area" href="#5-語系-版本與編輯器" aria-label="前往第四區，內容編輯"><span class="anatomy-zone__number">04</span><strong>受限內容編輯器</strong><small>標題　粗體　斜體　條列　安全連結　｜　字數與驗證</small><i>歡迎使用 Provider 提供的遊戲與相關服務……</i></a>
    <div class="lifecycle-anatomy__split">
      <a class="anatomy-zone lifecycle-anatomy__detail publishing-anatomy__preview" href="#6-發布前檢查與預覽" aria-label="前往第五區，發布前檢查與預覽"><span class="anatomy-zone__number">05</span><small>PUBLISH CHECK</small><strong>安全與完整度 8 / 8</strong><i>翻譯 · 必填 · HTML 清理 · 連結 · 差異摘要</i></a>
      <a class="anatomy-zone lifecycle-anatomy__states" href="#7-儲存-發布與頁面狀態" aria-label="前往第六區，儲存發布與替代狀態"><span class="anatomy-zone__number">06</span><strong>儲存與發布</strong><i>未儲存</i><i>驗證失敗</i><i>版本衝突</i><i>發布工作</i><i>Forbidden</i></a>
    </div>
  </div>
  <div class="page-anatomy__legend"><span><i></i>內容區塊獨立發布</span><span><i></i>受限富文字</span><small>參照現行 `/website/content` 原型；高風險第二人核准已定義，正式角色與 permission key 待 Mapping。</small></div>
</figure>
<!-- PAGE_VISUAL_END -->

## 4. 內容摘要與區塊導覽

- 摘要顯示內容區塊數、語系數、待處理草稿、最近成功發布與資料更新時間。
- 左側區塊顯示每類內容的公開／草稿狀態、缺翻譯數與最後更新；選取時保留未儲存提示。
- 公開內容讀取失敗與沒有公開版本需分開，不得以空字串代表成功。

## 5. 語系、版本與編輯器

- 語系切換顯示各自完整度；第一版四語原子發布。法務／責任遊戲使用 `STRICT`，一般欄位只可依固定 `FALLBACK` 或 `OPTIONAL_HIDE` 政策處理，不得靜默替換。
- 編輯器顯示 draft revision、published revision、更新者、更新時間及 unsaved 狀態。
- 受限富文字只允許核准的標題、段落、粗／斜體、條列與安全連結；禁止 script、inline event、iframe、任意 style 與未核准 embed。
- 聯絡資訊欄位包含客服 Email、服務時間、地址與回覆說明；Email 與時間格式需驗證。
- 儲存傳送結構化內容，不以未清理 HTML 作唯一來源。

## 6. 發布前檢查與預覽

檢查至少包含：必要語系、必填欄位、長度、富文字 schema、URL allowlist、HTML sanitation、聯絡格式、素材、base／expected revision、權限、核准與風險分類。精確預覽由 Preview Manifest 固定 Revision、四語解析、區塊來源、素材、renderer、validation 與 hash；不得靜默切換 latest。

## 7. 儲存、發布與頁面狀態

- 儲存草稿回傳新 revision；切換內容、語系或離頁前處理 unsaved changes。
- Publish／Disable／Restore 只針對目前 `content_key` 的 exact Revision；成功後切換 Published Snapshot 並建立不可變事件。
- 若 published revision 已變更，回傳 conflict 並要求比較／重新整理，不可覆蓋他人內容。
- 支援 loading、empty、validation error、sanitization rejected、conflict、preview error、publish queued／failed／succeeded、stale、Forbidden。

## 8. API、權限與稽核語意

後端提供 Entry／Revision／Snapshot、驗證、Create Revision、Preview Manifest／Token、Submit／Approve／Reject、Publish／Disable／Restore Job、timeline 與 allowed actions。法務類必須經不同一人的核准；每次儲存、預覽、核准、發布與失敗記錄 exact reference、actor、理由、結果與 trace。正式 path、schema、角色及 permission key 待實作 Mapping。

## 9. 響應式、無障礙與驗收

使用 `1500px` 寬版。窄版將區塊導覽移到編輯器上方；工具列可換行且每個格式動作有可讀名稱。焦點、錯誤與語系完整度可由鍵盤和讀屏辨識。

驗收條件：四類內容與四語系可追溯；聯絡資訊結構化；草稿不直接公開；非法 HTML／連結可被阻擋；衝突不覆蓋內容；發布事件可追溯且失敗保持既有公開版本。

## 10. 已確認基準與實作 Mapping

DP04 已確認內容獨立發布、四語原子性、欄位語系政策、受限富文字安全、精確預覽、高風險核准、Revision／Job／Snapshot、衝突、失敗與還原。仍待 Mapping 的項目為正式內容 schema、sanitizer／CSP 實作、API path、角色與 permission key、Renderer／CDN、保存及驗收證據；完成後才可改為 Confirmed。
