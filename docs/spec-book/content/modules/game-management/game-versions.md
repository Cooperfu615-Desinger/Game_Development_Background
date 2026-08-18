# 遊戲版本

## 章節狀態

| 項目 | 內容 |
| --- | --- |
| 規格成熟度 | 目前需求基準 — 已同步 Decision Pack 03 |
| 製作範圍 | Active |
| 對應路由 | `/games/versions` |
| 前端元件 | `src/views/Games/Versions.vue` |
| 主要來源 | `GAME_LIST_SPEC.md`、`Decision Pack 03`、現行原型 |
| 頁面角色 | 程式版本／Release 紀錄、相容性與回復基準 |

> 本頁管理 Game Version 與不可變 Build Artifact 關聯，不管理商戶主資料、商戶層級發布或環境 Active Release。原型的「影響商戶」不屬正式管理維度；外部影響只能顯示具來源時間的 GGAP snapshot。

## 1. 目的與責任邊界

- 查詢 Version、Build Artifact、內容快照、成熟度、驗證與 lineage。
- 建立版本草稿、查看內容差異與相容性，供環境與發布選用。
- 保留已發布版本與回復歷程，不原地改寫或刪除被引用版本。
- RTP／波動度／賠率表在數值設定；素材檔案在遊戲素材；環境生效在環境與發布。

## 2. 版本模型

- `version_id`、語意版號與 `build_id` 分開；三者不得互作唯一主鍵。
- Version 是程式、數值、設定、素材、語系與相容性的完整功能快照；Artifact 以 `build_id`、manifest、checksum、Git commit 與建置時間識別，建立後不可覆寫。
- Test 期間同一 Version 可有多次 Build；成為 Candidate 後綁定確切 Artifact，Production 發布後 Version 永久凍結。
- Version 正式狀態為 `draft`、`candidate`、`approved`、`published`、`retired`、`cancelled`。`published` 只代表曾成功發布 Production，不代表目前 Active。
- Release 結果與 Active Release 另由環境與發布頁管理；「已回滾」不是 Version 狀態。

## 3. 六區塊資訊架構

1. 版本摘要：版本數、可用／待審核、回復基準、數值分離。
2. 查詢條件：遊戲、版號、狀態、發布類型、時間。
3. 結果與操作：筆數、applied filters、新增草稿、匯出。
4. 版本列表：Version、Artifact、內容參照、驗證與成熟度。
5. 版本詳情：checksum、change log、相容性、lineage 與引用。
6. 建立／候選／核准操作與替代狀態。

<!-- PAGE_VISUAL_START -->
<figure class="page-anatomy lifecycle-anatomy lifecycle-anatomy--versions" aria-label="遊戲版本六區塊畫面示意">
  <div class="lifecycle-anatomy__canvas">
    <a class="anatomy-zone lifecycle-anatomy__cards lifecycle-anatomy__cards--four" href="#4-版本摘要" aria-label="前往第一區，版本摘要"><span class="anatomy-zone__number">01</span><span><small>版本紀錄</small><strong>24</strong><i>Published 16</i></span><span><small>候選／已核准</small><strong>3</strong><i>Candidate scope</i></span><span><small>回滾候選</small><strong>保留</strong><i>immutable Artifact</i></span><span><small>數值設定</small><strong>分離</strong><i>精確版本關聯</i></span></a>
    <a class="anatomy-zone lifecycle-anatomy__filters" href="#5-查詢與結果操作" aria-label="前往第二區，查詢條件"><span class="anatomy-zone__number">02</span><strong>查詢條件</strong><i>版號／遊戲／版本 ID</i><i>遊戲</i><i>狀態</i><i>發布類型</i><i>建立時間</i><b>查詢</b></a>
    <a class="anatomy-zone lifecycle-anatomy__toolbar" href="#5-查詢與結果操作" aria-label="前往第三區，結果與操作"><span class="anatomy-zone__number">03</span><strong>24 筆版本</strong><small>applied filters · updated_at desc</small><i>新增版本草稿　匯出完整結果</i></a>
    <a class="anatomy-zone lifecycle-anatomy__table" href="#6-版本列表" aria-label="前往第四區，版本列表"><span class="anatomy-zone__number">04</span><strong>版本列表</strong><small>版本 ID　遊戲　程式版號　Build　狀態　類型　相容數值／素材　驗證　可用環境　回復基準　更新　操作</small><i>gver-024　星際寶藏　v2.5.0　build-481　Approved　Minor　math-18 / asset-07　Passed　Production + DEMO　v2.4.1</i></a>
    <div class="lifecycle-anatomy__split">
      <a class="anatomy-zone lifecycle-anatomy__detail" href="#7-版本詳情" aria-label="前往第五區，版本詳情"><span class="anatomy-zone__number">05</span><small>VERSION DETAIL</small><strong>gver-024 / v2.5.0</strong><i>artifact checksum · change log · compatibility · lineage · references</i></a>
      <a class="anatomy-zone lifecycle-anatomy__actions" href="#8-建立-候選與核准" aria-label="前往第六區，建立候選與核准"><span class="anatomy-zone__number">06</span><strong>版本操作</strong><i>建立草稿</i><i>Build</i><i>候選</i><i>DEMO 驗證</i><i>核准</i></a>
    </div>
  </div>
  <div class="page-anatomy__legend"><span><i></i>Game Version</span><span><i></i>不可變 Artifact</span><small>參照現行 `/games/versions` 原型；商戶不是 Provider 管理維度。</small></div>
</figure>
<!-- PAGE_VISUAL_END -->

## 4. 版本摘要

摘要分開 Version 成熟度、Artifact 驗證與 Release／環境生效狀態。版本總數、Candidate、Approved 與已發布由完整 Provider scope 計算；「回滾候選」只表示 Artifact 仍被保留且相容，不代表可跳過環境預檢。

## 5. 查詢與結果操作

查詢：keyword（version ID／semver／build／遊戲）、game_id、version status、release type、created／updated range。新增按鈕建立版本草稿，不直接建立已發布紀錄。匯出完整 applied filters 結果，正式權限待核准。

## 6. 版本列表

目標欄位：Version ID、遊戲、語意版號、Build ID、Artifact checksum、Version 狀態、變更類型、設定／數值／素材參照、驗證狀態、已發布環境、回滾候選、更新時間、操作。

- 原型「影響商戶」不得作目標主欄；若顯示外部影響，必須清楚標示 GGAP snapshot、來源與時間，且不提供維護入口。
- 預設 pending／failed 優先，再以 updated_at desc、version ID 穩定排序。
- 已被任何 Release／Game Round 引用的 Version 或 Artifact 不可刪除；`retired` 只限制新 Launch、一般發布與回滾目標。

## 7. 版本詳情

大型 Dialog 顯示 Version ID、game、semver、Build／Artifact manifest 與 checksum、Git commit、狀態、change log、相容平台／契約、數值／素材／設定參照、測試／安全驗證、lineage、使用中的環境／Release、Game Round 引用與 audit。

## 8. 建立、候選與核准

建立流程：`draft` → 建立 Artifact → 自動測試／相容性 → `candidate` → DEMO 驗證 → `approved` → 由 `/games/environments` 建立 Production Release → `published`。

Candidate 或 Approved 的內容若改變，必須建立新 Build 並使既有核准失效；已發布 Version 的任何內容變更建立新 Version／Patch Version。回滾不是把 Version 狀態改回去，而是選擇仍安全的舊 Artifact 建立新 Release Record；不可刪除或改寫原發布歷史。

## 9. 頁面狀態與錯誤處理

支援 loading、empty、artifact missing、validation running／failed、review pending／rejected、incompatible reference、conflict、export、Forbidden。部分參照來源失敗時仍可看版本基本資料，但標示無法確認可發布性。

## 10. API 契約草案

| 能力 | 必要輸出／行為 |
| --- | --- |
| 列表／詳情 | 版本 schema、artifact、checksum、compatibility、references、lineage。 |
| 草稿／Build／驗證 | version、artifact manifest、checksum、validation、allowed actions、audit。 |
| 候選／核准 | candidate snapshot、DEMO evidence、risk classification、approval、audit。 |
| 引用查詢 | Active Releases、歷史 Releases、Game Rounds、math／asset／setting versions。 |
| 匯出 | applied filters、完整結果、job／到期／權限。 |

正式生命週期、相容性、API、權限及檔案保存依集中 TBD。

## 11. 響應式、無障礙與驗收

頁面使用主內容完整寬度。Mobile 版本卡片保留 ID、版號、狀態、驗證、參照與詳情；長 checksum 可換行／複製。狀態不只靠顏色。

驗收條件：Version、Artifact、Release 與 Active Release 分離；六個正式 Version 狀態正確；數值／素材／設定採精確參照；商戶不成為管理維度；被引用 Version／Artifact 不可刪除；回滾建立新 Release；列表、詳情、驗證、衝突、Forbidden 可驗收。

## 12. 測試重點

- 相同 semver 不同 build、checksum 不符、artifact 缺失、相容性失敗。
- 被引用／未引用版本的封存與刪除限制。
- 送審衝突、重複建立、回復目標失效與環境 preflight。
- 390px 長版號／checksum、表格、Dialog 與鍵盤。

## 13. 待確認事項

- `TBD-DOM-003`：現有 schema／enum 與 DP03 Version／Artifact／Release 的 Mapping。
- `TBD-API-001`、`TBD-API-005`：共通／版本 API。
- `TBD-SEC-001`、`TBD-SEC-003`、`TBD-SEC-004`：權限、高風險操作與匯出。
- `TBD-NFR-004`、`TBD-EXT-003`：前端驗收與角色模型。

## 14. 實作接軌條件

目前產品行為依本頁與 Decision Pack 03 成立；正式 schema、API 與 permission 取得後建立 Mapping，並以驗收結果更新實作狀態。
