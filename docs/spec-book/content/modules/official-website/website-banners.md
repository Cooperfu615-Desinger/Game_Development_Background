# Banner 管理

## 章節狀態

| 項目 | 內容 |
| --- | --- |
| 規格成熟度 | Draft — Batch D 完整頁面規格 |
| 製作範圍 | Active |
| 對應路由 | `/website/banners` |
| 前端元件 | `src/views/GameWebsite/Banners.vue` |
| 主要來源 | `GAME_WEBSITE_SPEC.md`、`PROVIDER_PORTAL_UI_LAYOUT_SPEC.md` |
| 頁面角色 | Provider 自有遊戲官網的單一 Banner 編輯、預覽與發布入口 |

> 本頁只管理 Provider 自有官網 Banner，不是完整 CMS，也不管理遊戲大廳、GGAP、代理商或商戶內容。原型的儲存與發布只顯示 mock 提示；正式媒體、版本、排程、權限與發布契約仍受集中 TBD 管理。

## 1. 目的與責任邊界

- 以單一 Banner 為工作單位，管理內部名稱、顯示位置、順序、期間、連結、素材與四語系文案。
- 提供單一 Banner 預覽，確認目前選取語系的眉標、標題、簡述與 CTA。
- 允許儲存草稿並建立該 Banner 的發布工作；正式發布事件由發布紀錄頁追溯。
- 不提供整體官網版型編輯、公告、活動、SEO、曝光分析或完整首頁預覽。
- Banner 引用素材版本，不直接覆寫已發布素材；媒體安全依 `TBD-DAT-006`、`TBD-SEC-005`。

## 2. 內容與版本模型

- 穩定識別使用 `banner_id`；內部名稱、位置與顯示順序不可作 join key。
- 每個 Banner 保留 `draft_revision` 與 `published_revision`；編輯不直接覆蓋公開內容。
- 四語系文案同屬一個 revision snapshot；缺語系能否發布由正式 fallback 規則決定。
- 顯示排程使用明確時區；`end_at` 可為空，開始不得晚於結束。
- 發布成功後才更新 published snapshot；工作失敗時公開版本保持不變。

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

| 欄位 | Draft 規則 |
| --- | --- |
| 內部名稱／位置 | 內部名稱必填；位置來自官網版型允許的 slot enum。 |
| 顯示順序 | 同一 slot 內的正整數；衝突由後端回傳或重排。 |
| 開始／結束 | 使用 Provider 設定時區並顯示 offset；結束可空。 |
| 連結 | 保存目的地類型與值；外部 URL 需 allowlist、HTTPS 與重新導向檢查。 |
| 狀態 | 草稿、已發布、已停用是公開生命週期，不等同發布工作狀態。 |

停用與發布均需確認；已發布 Banner 的修改只形成草稿，不立即改變玩家看到的內容。

## 6. 多語文案與素材

- 固定支援繁中、簡中、English、日本語；繁中為主要編輯語系，但正式 fallback 待 `TBD-DAT-006`。
- 每語系包含眉標、標題、簡述與 CTA；長度限制、允許字元及必填由 schema 回傳。
- 顯示每語系完整度與錯誤數；切換語系不得遺失未儲存草稿。
- 素材以 `asset_id + asset_version_id` 引用，顯示 MIME、尺寸、裝置用途、掃描與審核狀態。
- Desktop／Mobile 是否共用素材由正式 slot schema 決定；不可由前端自行裁切成正式資產。

## 7. 單一 Banner 預覽

- 預覽明確標示資料 revision、語系、裝置、生成時間及「非完整官網」；禁止混用公開 snapshot 與未儲存欄位。
- CTA 預覽顯示正規化後目的地；外部連結不得在未驗證狀態直接開啟。
- 無素材、素材掃描中／失敗、缺翻譯或連結無效時呈現對應阻擋，不以 fallback mock 假裝完成。
- 預覽 token、草稿洩漏與 CSP 規則依 `TBD-SEC-005`。

## 8. 儲存、發布與頁面狀態

儲存草稿需驗證欄位並回傳 revision；發布前重新檢查多語、素材、排程、連結與版本衝突。發布建立非同步 job，成功後才建立不可變事件；重複送出需具 idempotency。

頁面支援 loading、empty、validation error、unsaved changes、conflict、preview unavailable、publish queued／running／failed／succeeded、partial source failure、stale 與 Forbidden。原型 notice 不得作為正式成功證據。

## 9. API、權限與稽核草案

API 能力包含摘要／清單、單筆 draft／published snapshot、驗證、儲存、預覽、發布／停用 job 與發布結果。所有寫入強制 Provider scope、revision concurrency、permission、actor 與 audit；正式 path、schema 及 permission key 依 `TBD-API-006`、`TBD-SEC-001`、`TBD-SEC-005`。

## 10. 響應式、無障礙與驗收

本頁使用 Portal `1500px` 寬版。Desktop 保留清單、編輯及預覽脈絡；窄版依序重排，語系與操作列可換行，預覽不產生水平溢出。Tab／按鈕支援鍵盤，狀態不只靠顏色。

驗收條件：草稿與公開版本分離；四語系與素材完整度可見；排程含時區；單一 Banner 預覽不冒充完整官網；失敗不改變公開版本；發布可由 job／audit 追溯。

## 11. 待確認與 Draft 移除條件

- `TBD-DOM-005`：官網內容與大廳發布是否保持獨立生命週期。
- `TBD-DAT-006`：媒體、語系、fallback、欄位限制。
- `TBD-API-006`、`TBD-SEC-005`：CRUD、預覽、發布與公開內容安全。
- `TBD-SEC-001`、`TBD-NFR-003`：權限、併發、冪等與 audit。

正式 schema、排程、媒體、預覽、發布 API、權限與失敗／衝突行為核准並通過驗收後，才可改為 Confirmed。
