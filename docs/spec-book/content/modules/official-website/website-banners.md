# Banner 管理

## 章節狀態

| 項目 | 內容 |
| --- | --- |
| 規格成熟度 | Draft — DP04 產品語意已同步；正式實作 Mapping 待補 |
| 製作範圍 | Active |
| 對應路由 | `/website/banners` |
| 前端元件 | `src/views/GameWebsite/Banners.vue` |
| 主要來源 | `GAME_WEBSITE_SPEC.md`、`PROVIDER_PORTAL_UI_LAYOUT_SPEC.md` |
| 頁面角色 | Provider 自有遊戲官網的單一 Banner 編輯、預覽與發布入口 |

> 本頁只管理 Provider 自有官網 Banner，不是完整 CMS，也不管理遊戲大廳、GGAP、代理商或商戶內容。DP04 已定義產品發布契約；現行原型的儲存與發布仍只有 mock 提示，正式 API、媒體服務、permission key 與公開副作用待實作 Mapping。

## 1. 目的與責任邊界

- 以單一 Banner 為工作單位，管理內部名稱、顯示位置、順序、期間、連結、素材與四語系文案。
- 提供單一 Banner 預覽，確認目前選取語系的眉標、標題、簡述與 CTA。
- 允許儲存草稿並建立該 Banner 的發布工作；正式發布事件由發布紀錄頁追溯。
- 不提供整體官網版型編輯、公告、活動、SEO、曝光分析或完整首頁預覽。
- Banner 只引用 DP03 不可變素材版本，不直接覆寫已發布素材；新發布不得引用 `latest` 或 security-revoked 素材。

## 2. 內容與版本模型

- 穩定主體使用 `content_entry_id`，每次成功儲存建立不可變 Revision（`revision_id`）；內部名稱、位置與排序不可作 join key。
- 目前公開內容由獨立 `snapshot_id` 表示；編輯 local buffer 與建立 Revision 都不直接改變公開內容。
- 四語系文案、CTA、排程與 exact 素材同屬一個 Revision；第一版四語原子發布。
- 單一 Banner Entry 或版位是 publication scope；同 scope 最多一筆未完成的 state-changing Job。
- 發布成功才原子切換 Published Snapshot；工作失敗保持舊 Snapshot，Restore 則由歷史 Snapshot 建立新 Revision 與新 Job。

## 3. 六區塊資訊架構

1. Banner 摘要：總數、已發布、草稿／停用及最後更新。
2. 篩選與清單：狀態、位置、期間、關鍵字與選取脈絡。
3. 基本與排程：內部名稱、位置、狀態、順序、開始／結束與連結。
4. 多語文案與素材：四語系內容、素材版本及完整度。
5. 單一 Banner 預覽：語系、裝置與 CTA 安全預覽。
6. 儲存／發布與替代狀態：驗證、確認、工作結果、失敗及權限。

<!-- PAGE_VISUAL_START -->
<figure class="page-anatomy lifecycle-anatomy publishing-anatomy publishing-anatomy--website" aria-label="Banner 管理六區塊畫面示意">
  <div class="lifecycle-anatomy__canvas">
    <a class="anatomy-zone lifecycle-anatomy__cards" href="#4-banner-摘要與篩選" aria-label="前往第一區，Banner 摘要"><span class="anatomy-zone__number">01</span><span><small>目前 Banner</small><strong>03</strong><i>含 1 筆草稿</i></span><span><small>已發布</small><strong>02</strong><i>官網可見</i></span><span><small>最後更新</small><strong>08.05</strong><i>Provider Editor</i></span></a>
    <a class="anatomy-zone lifecycle-anatomy__filters" href="#4-banner-摘要與篩選" aria-label="前往第二區，篩選與清單"><span class="anatomy-zone__number">02</span><strong>Banner 素材與內容</strong><i>全部</i><i>已發布</i><i>草稿</i><i>已停用</i><b>3 筆內容</b></a>
    <a class="anatomy-zone lifecycle-anatomy__matrix publishing-anatomy__editor" href="#5-基本-排程與連結" aria-label="前往第三區，基本與排程"><span class="anatomy-zone__number">03</span><strong>編輯內容</strong><span><b>基本資料</b>內部名稱 · 顯示位置 · 順序 · 狀態</span><span><b>排程</b>開始時間 · 結束時間 · 時區</span><span><b>連結</b>目的地 · 安全驗證</span></a>
    <a class="anatomy-zone lifecycle-anatomy__table publishing-anatomy__copy" href="#6-多語文案與素材" aria-label="前往第四區，多語文案與素材"><span class="anatomy-zone__number">04</span><strong>四語系文案與素材</strong><small>繁中　簡中　English　日本語　｜　眉標　標題　簡述　CTA　素材版本</small><i>在極光之下，開始下一局　·　探索 Provider 最新推出的遊戲體驗　·　asset-v7</i></a>
    <div class="lifecycle-anatomy__split">
      <a class="anatomy-zone lifecycle-anatomy__detail publishing-anatomy__preview" href="#7-單一-banner-預覽" aria-label="前往第五區，單一 Banner 預覽"><span class="anatomy-zone__number">05</span><small>SINGLE BANNER PREVIEW</small><strong>在極光之下，開始下一局</strong><i>語系 · Desktop／Mobile · CTA 目的地</i></a>
      <a class="anatomy-zone lifecycle-anatomy__states" href="#8-儲存-發布與頁面狀態" aria-label="前往第六區，儲存發布與替代狀態"><span class="anatomy-zone__number">06</span><strong>儲存與發布</strong><i>儲存草稿</i><i>發布前檢查</i><i>確認</i><i>失敗</i><i>Forbidden</i></a>
    </div>
  </div>
  <div class="page-anatomy__legend"><span><i></i>Provider 自有官網</span><span><i></i>單一 Banner 預覽</span><small>參照現行 `/website/banners` 原型；發布按鈕目前只有 mock 提示。</small></div>
</figure>
<!-- PAGE_VISUAL_END -->

## 4. Banner 摘要與篩選

- 摘要至少顯示總數、已發布、草稿、已停用、最近成功發布與資料更新時間；來源失敗不得顯示 0。
- 篩選條件：關鍵字、狀態、顯示位置、排程期間；切換條件後由查詢動作套用。
- 清單列顯示縮圖、內部名稱、位置、目前公開狀態、草稿狀態、有效期間與最後更新。
- 選取 Banner 不應丟失尚未儲存內容；切換前提示儲存、捨棄或取消。

## 5. 基本、排程與連結

| 欄位 | 目前需求規則 |
| --- | --- |
| 內部名稱／位置 | 內部名稱必填；位置來自官網版型允許的 slot enum。 |
| 顯示順序 | 同一 slot 內的正整數；衝突由後端回傳或重排。 |
| 開始／結束 | 使用 Provider 設定時區並顯示 offset；結束可空。 |
| 連結 | 保存目的地類型與值；外部 URL 需 allowlist、HTTPS 與重新導向檢查。 |
| 狀態 | Revision、Publish Job、Public 與 Delivery 分開呈現，不使用單一 `status`。 |

停用與發布均需確認；已發布 Banner 的修改只形成草稿，不立即改變玩家看到的內容。

## 6. 多語文案與素材

- 固定支援 `zh-TW`、`zh-CN`、`en`、`ja` 並原子發布；fallback 固定為 `zh-CN → zh-TW`、`en → zh-TW`、`ja → en → zh-TW`。
- 欄位依 `STRICT`、`FALLBACK`、`OPTIONAL_HIDE` 執行；預覽與 Snapshot 保存 requested／resolved locale 與隱藏結果。
- 每語系包含眉標、標題、簡述與 CTA；長度限制、允許字元及必填由 schema 回傳。
- 顯示每語系完整度與錯誤數；切換語系不得遺失未儲存草稿。
- 素材以 `asset_id + asset_version_id` 引用，顯示 MIME、尺寸、裝置用途、掃描與審核狀態。
- Desktop／Mobile 是否共用素材由正式 slot schema 決定；不可由前端自行裁切成正式資產。

## 7. 單一 Banner 預覽

- 預覽由 exact Preview Manifest 固定 Revision、語系解析、裝置、素材 checksum、renderer version 與 validation result；每個組合區塊標示 draft／public 來源。
- CTA 預覽顯示正規化後目的地；外部連結不得在未驗證狀態直接開啟。
- 無素材、素材掃描中／失敗、缺翻譯或連結無效時呈現對應阻擋，不以 fallback mock 假裝完成。
- Preview token 必須短效、可撤銷、具 Provider／Revision／Manifest scope，不進長期 URL，並受獨立認證、Cache-Control、CSP 與 allowlist 保護。

## 8. 儲存、發布與頁面狀態

儲存需以 base revision／ETag 建立新 Revision；發布前重新檢查多語、素材、排程、連結、權限、核准與 expected published revision。Publish、Disable、Restore 都建立非同步 Job；高風險 CTA／素材／外部網域要求不同一人的第二人核准，重複送出以 idempotency key 防止副作用。

頁面支援 loading、empty、validation error、unsaved changes、conflict、preview unavailable、publish queued／running／failed／succeeded、partial source failure、stale 與 Forbidden。原型 notice 不得作為正式成功證據。

## 9. API、權限與稽核語意

後端能力包含 Entry／Revision／Snapshot 查詢、Create Revision、Validation、Preview Manifest／Token、Submit／Approve／Reject、Publish／Disable／Restore Job、取消排程、Job timeline 與 allowed actions。所有寫入強制 Provider scope、optimistic concurrency、逐次授權、actor、reason、idempotency 與 append-only audit；正式 path、schema 及 permission key 待實作 Mapping。

## 10. 響應式、無障礙與驗收

本頁使用 Portal `1500px` 寬版。Desktop 保留清單、編輯及預覽脈絡；窄版依序重排，語系與操作列可換行，預覽不產生水平溢出。Tab／按鈕支援鍵盤，狀態不只靠顏色。

驗收條件：草稿與公開版本分離；四語系與素材完整度可見；排程含時區；單一 Banner 預覽不冒充完整官網；失敗不改變公開版本；發布可由 job／audit 追溯。

## 11. 已確認基準與實作 Mapping

DP04 已確認官網與大廳獨立、四語與 fallback、exact 素材、Revision／Job／Snapshot、精確預覽、風險通道、併發、冪等、失敗保留舊版、還原與 audit 語意。仍待後端與基礎設施 Mapping 的項目為 API path／schema、slot 與媒體限制、permission key、Scheduler／Queue／CDN／Renderer、保存期限及正式測試證據；完成後才可把章節成熟度改為 Confirmed。
