# 遊戲素材

## 章節狀態

| 項目 | 內容 |
| --- | --- |
| 規格成熟度 | Draft — Batch C 完整頁面規格 |
| 製作範圍 | Active |
| 對應路由 | `/games/assets` |
| 前端元件 | `src/views/Games/Assets.vue` |
| 主要來源 | `PROVIDER_PORTAL_PAGE_MAP.md`、現行原型 |
| 頁面角色 | 遊戲展示／營運素材、版本、語系與發布參照 |

> 現行上傳 Dialog 只建立前端 mock 草稿，沒有檔案傳輸、掃描、儲存或正式發布。素材替換不得原地覆寫已發布檔案；發布組合必須引用不可變素材版本。

## 1. 目的與責任邊界

- 管理 Provider 自身遊戲的 Icon、Banner、Loading、Table Skin 等素材及其語系／裝置用途。
- 預覽 metadata、版本、檔案驗證、掃描、審核與遊戲版本關聯。
- 建立上傳／替換草稿，通過處理後形成不可變素材版本，供發布組合引用。
- 不管理代理商／商戶品牌素材或會員資料；官網／大廳只引用已核准資產。

## 2. 素材模型

- `asset_id` 表示素材邏輯項，`asset_version_id` 表示不可變檔案版本；storage key／URL 不作主鍵。
- 至少保存 game_id、type、locale、device／usage、dimensions、file size、MIME、checksum、alt text、status、scan／validation、related game versions、owner、times。
- 語系以繁中預設；fallback、支援清單與同類素材完整性依 `TBD-DAT-006`。
- 已發布或被 release job 引用的素材版本不可覆寫／刪除；替換建立新版本。

## 3. 六區塊資訊架構

1. 素材摘要：總數、語系、關聯版本、待處理上傳。
2. 查詢條件：素材 ID、遊戲、類型、語系、狀態、更新時間。
3. 結果與操作：筆數、applied filters、上傳草稿、匯出。
4. 素材列表：預覽、metadata、版本、驗證與參照。
5. 素材詳情：安全預覽、checksum、usage、lineage 與引用。
6. 上傳／替換流程與替代狀態。

<!-- PAGE_VISUAL_START -->
<figure class="page-anatomy lifecycle-anatomy lifecycle-anatomy--assets" aria-label="遊戲素材六區塊畫面示意">
  <div class="lifecycle-anatomy__canvas">
    <a class="anatomy-zone lifecycle-anatomy__cards lifecycle-anatomy__cards--four" href="#4-素材摘要" aria-label="前往第一區，素材摘要"><span class="anatomy-zone__number">01</span><span><small>素材版本</small><strong>86</strong><i>Published 62</i></span><span><small>支援語系</small><strong>4</strong><i>zh-TW default</i></span><span><small>關聯版本</small><strong>18</strong><i>精確參照</i></span><span><small>待處理</small><strong>3</strong><i>scan／review</i></span></a>
    <a class="anatomy-zone lifecycle-anatomy__filters" href="#5-查詢與結果操作" aria-label="前往第二區，查詢條件"><span class="anatomy-zone__number">02</span><strong>查詢條件</strong><i>素材 ID／遊戲</i><i>遊戲</i><i>素材類型</i><i>語系</i><i>狀態</i><i>更新時間</i><b>查詢</b></a>
    <a class="anatomy-zone lifecycle-anatomy__toolbar" href="#5-查詢與結果操作" aria-label="前往第三區，結果與操作"><span class="anatomy-zone__number">03</span><strong>86 筆素材版本</strong><small>applied filters · updated_at desc</small><i>上傳素材　匯出 metadata</i></a>
    <a class="anatomy-zone lifecycle-anatomy__table lifecycle-anatomy__table--asset" href="#6-素材列表" aria-label="前往第四區，素材列表"><span class="anatomy-zone__number">04</span><strong>素材列表</strong><small>素材 ID　預覽　遊戲　類型　語系　用途　版本　尺寸　大小　狀態　掃描　關聯版本　更新　操作</small><i>asset-007　▣　星際寶藏　Banner　zh-TW　Lobby desktop　v4　1920×640　382KB　Approved　Passed　gver-024</i></a>
    <div class="lifecycle-anatomy__split">
      <a class="anatomy-zone lifecycle-anatomy__detail lifecycle-anatomy__detail--asset" href="#7-素材詳情" aria-label="前往第五區，素材詳情"><span class="anatomy-zone__number">05</span><small>ASSET DETAIL</small><strong>安全預覽 / asset-007-v4</strong><i>metadata · checksum · alt text · lineage · usage references</i></a>
      <a class="anatomy-zone lifecycle-anatomy__actions" href="#8-上傳與替換流程" aria-label="前往第六區，上傳與替換流程"><span class="anatomy-zone__number">06</span><strong>上傳／替換</strong><i>草稿</i><i>檔案驗證</i><i>惡意檔案掃描</i><i>審核</i><i>失敗／衝突</i></a>
    </div>
  </div>
  <div class="page-anatomy__legend"><span><i></i>不可變素材版本</span><span><i></i>檔案處理與審核</span><small>參照現行 `/games/assets` 原型；上傳入口目前無正式副作用。</small></div>
</figure>
<!-- PAGE_VISUAL_END -->

## 4. 素材摘要

摘要分別顯示 asset versions、可用語系、被引用的遊戲版本及待掃描／待審核。需標示 scope 與更新時間；來源失敗不得顯示 0。「上傳方式：入口」不是業務指標，目標 UI 改為待處理工作。

## 5. 查詢與結果操作

查詢：keyword（asset／version ID、遊戲）、game_id、type、locale、usage／device、status、scan status、updated range。上傳建立草稿；匯出只含授權 metadata，預設不打包原始檔。

## 6. 素材列表

目標欄位：素材／版本 ID、安全縮圖、遊戲、類型、語系、usage／device、版本、尺寸、檔案大小、狀態、scan／validation、關聯遊戲版本、更新時間、操作。

- 預覽使用受控衍生圖，不直接暴露私有 storage URL。
- MIME、extension、magic bytes、dimensions、size、checksum 均需後端驗證。
- 預設待處理／失敗優先，再以 updated_at desc、asset version ID 穩定排序。

## 7. 素材詳情

大型 Dialog 顯示安全預覽、完整 metadata、alt text、checksum、scan／validation、來源版本、替換 lineage、語系 fallback、使用中的遊戲版本／release jobs、owner、審核及 audit。下載原始檔需獨立權限與短效 URL。

## 8. 上傳與替換流程

流程：選遊戲／類型／locale／usage → 選檔 → client hint → server upload → MIME／尺寸／checksum／惡意檔案掃描 → metadata／alt text → 草稿 → 審核 → approved → 發布組合引用。

- 失敗上傳可有限重試；同 checksum 重複檔需提示既有版本。
- 替換建立新 `asset_version_id`，不得覆寫舊檔；已引用版本保持可重現。
- Production 使用的素材變更需理由、差異預覽與核准；正式檔案保存、刪除與 CDN 失效待契約。

## 9. 頁面狀態與錯誤處理

支援 loading、empty、uploading、processing、scan failed、validation failed、review pending／rejected、storage／preview error、duplicate、conflict、export、Forbidden。上傳成功但處理失敗不可顯示 approved；離頁後可依 job ID 恢復。

## 10. API 契約草案

| 能力 | 必要輸出／行為 |
| --- | --- |
| 列表／詳情 | asset／version schema、safe preview、validation、scan、references、lineage。 |
| 上傳 | upload session、限制、checksum、progress／job、idempotency、expiry。 |
| 草稿／審核 | metadata、version、validation、approval、allowed actions、audit。 |
| 下載／匯出 | 短效授權 URL 或 metadata job、到期與 audit。 |

正式格式、大小、儲存、API、權限與保存依 `TBD-DAT-006`、`TBD-API-005`、`TBD-SEC-003`、`TBD-SEC-004`。

## 11. 響應式、無障礙與驗收

頁面使用主內容完整寬度。Mobile 素材卡片保留縮圖、ID、類型、語系、狀態、掃描與詳情；上傳需鍵盤可用、進度與錯誤可公告。所有圖像必須有可管理 alt text 或明確裝飾性標記。

驗收條件：素材／版本 ID 分開；已引用檔案不可覆寫；語系與 usage 明確；預覽不暴露 storage；檔案驗證／掃描／審核骨架完整；上傳 mock 不冒充正式成功；Loading／processing／failure／Forbidden 可驗收。

## 12. 測試重點

- 錯 MIME／magic bytes、超尺寸／大小、惡意檔案、checksum 重複與網路中斷。
- 替換被引用素材、審核衝突、權限撤銷、短效 URL 到期。
- locale fallback、缺 alt text、多裝置用途與 release 組合引用。
- 390px 預覽、上傳進度、Dialog 焦點與鍵盤。

## 13. 待確認事項

- `TBD-DOM-003`：素材版本與發布組合。
- `TBD-DAT-006`：格式、尺寸、語系、usage、fallback 與 alt text。
- `TBD-API-001`、`TBD-API-005`：共通／素材 API。
- `TBD-SEC-001`、`TBD-SEC-003`、`TBD-SEC-004`：權限、核准、下載與保存。
- `TBD-NFR-004`、`TBD-EXT-003`：前端驗收與角色模型。

## 14. Draft 移除條件

素材 schema、檔案限制、掃描／儲存、版本／引用、上傳／審核、API 與權限核准並通過驗收後，才可改為 Confirmed。
