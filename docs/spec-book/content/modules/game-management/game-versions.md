# 遊戲版本

## 章節狀態

| 項目 | 內容 |
| --- | --- |
| 規格成熟度 | Draft — Batch C 完整頁面規格 |
| 製作範圍 | Active |
| 對應路由 | `/games/versions` |
| 前端元件 | `src/views/Games/Versions.vue` |
| 主要來源 | `GAME_LIST_SPEC.md`、現行原型 |
| 頁面角色 | 程式版本／Release 紀錄、相容性與回復基準 |

> 本頁管理 Provider 遊戲版本，不管理商戶主資料或商戶層級發布。原型的「影響商戶」是 mock 展示欄位；目標契約改用 Provider 可證明的環境／遊戲 scope，外部代理商／商戶資訊只能作 GGAP snapshot。

## 1. 目的與責任邊界

- 查詢程式版本、發布類型、狀態、組合關聯、驗證與回復基準。
- 建立版本草稿、查看內容差異與相容性，供環境與發布選用。
- 保留已發布版本與回復歷程，不原地改寫或刪除被引用版本。
- RTP／波動度／賠率表在數值設定；素材檔案在遊戲素材；環境生效在環境與發布。

## 2. 版本模型

- `game_version_id` 與語意版號／build ID 分開；版號顯示不得作唯一主鍵。
- 版本至少含 game_id、program version、release type、status、artifact checksum、compatibility、created／updated、owner、change log。
- 與數值、素材、設定的關聯是發布組合 snapshot，不將其資料複製成版本頁的另一真實來源。
- Draft 狀態方向：draft、testing、pending_review、approved、available、deprecated、archived；原型「已發布／已回滾」需在正式模型中拆清版本與 release job 狀態。

## 3. 六區塊資訊架構

1. 版本摘要：版本數、可用／待審核、回復基準、數值分離。
2. 查詢條件：遊戲、版號、狀態、發布類型、時間。
3. 結果與操作：筆數、applied filters、新增草稿、匯出。
4. 版本列表：程式、相容素材／數值、scope、驗證與狀態。
5. 版本詳情：checksum、change log、相容性、lineage 與引用。
6. 建立／回復申請與替代狀態。

<!-- PAGE_VISUAL_START -->
<figure class="page-anatomy lifecycle-anatomy lifecycle-anatomy--versions" aria-label="遊戲版本六區塊畫面示意">
  <div class="lifecycle-anatomy__canvas">
    <a class="anatomy-zone lifecycle-anatomy__cards lifecycle-anatomy__cards--four" href="#4-版本摘要" aria-label="前往第一區，版本摘要"><span class="anatomy-zone__number">01</span><span><small>版本紀錄</small><strong>24</strong><i>Available 16</i></span><span><small>待審核</small><strong>3</strong><i>Draft scope</i></span><span><small>回復基準</small><strong>保留</strong><i>immutable history</i></span><span><small>數值設定</small><strong>分離</strong><i>精確版本關聯</i></span></a>
    <a class="anatomy-zone lifecycle-anatomy__filters" href="#5-查詢與結果操作" aria-label="前往第二區，查詢條件"><span class="anatomy-zone__number">02</span><strong>查詢條件</strong><i>版號／遊戲／版本 ID</i><i>遊戲</i><i>狀態</i><i>發布類型</i><i>建立時間</i><b>查詢</b></a>
    <a class="anatomy-zone lifecycle-anatomy__toolbar" href="#5-查詢與結果操作" aria-label="前往第三區，結果與操作"><span class="anatomy-zone__number">03</span><strong>24 筆版本</strong><small>applied filters · updated_at desc</small><i>新增版本草稿　匯出完整結果</i></a>
    <a class="anatomy-zone lifecycle-anatomy__table" href="#6-版本列表" aria-label="前往第四區，版本列表"><span class="anatomy-zone__number">04</span><strong>版本列表</strong><small>版本 ID　遊戲　程式版號　Build　狀態　類型　相容數值／素材　驗證　可用環境　回復基準　更新　操作</small><i>gver-024　星際寶藏　v2.5.0　build-481　Approved　Minor　math-18 / asset-07　Passed　Production + DEMO　v2.4.1</i></a>
    <div class="lifecycle-anatomy__split">
      <a class="anatomy-zone lifecycle-anatomy__detail" href="#7-版本詳情" aria-label="前往第五區，版本詳情"><span class="anatomy-zone__number">05</span><small>VERSION DETAIL</small><strong>gver-024 / v2.5.0</strong><i>artifact checksum · change log · compatibility · lineage · references</i></a>
      <a class="anatomy-zone lifecycle-anatomy__actions" href="#8-建立與回復申請" aria-label="前往第六區，建立與回復申請"><span class="anatomy-zone__number">06</span><strong>版本操作</strong><i>建立草稿</i><i>驗證</i><i>送審</i><i>建立回復 release</i><i>衝突／失敗</i></a>
    </div>
  </div>
  <div class="page-anatomy__legend"><span><i></i>程式版本</span><span><i></i>發布組合參照</span><small>參照現行 `/games/versions` 原型；商戶不是 Provider 管理維度。</small></div>
</figure>
<!-- PAGE_VISUAL_END -->

## 4. 版本摘要

摘要分開版本本身的 status 與 release job／環境生效狀態。版本總數、可用、待審核由完整 Provider scope 計算；「回復基準」表示歷史可追溯，不代表一鍵回滾已核准。

## 5. 查詢與結果操作

查詢：keyword（version ID／semver／build／遊戲）、game_id、version status、release type、created／updated range。新增按鈕建立版本草稿，不直接建立已發布紀錄。匯出完整 applied filters 結果，正式權限待核准。

## 6. 版本列表

目標欄位：版本 ID、遊戲、程式版號、build ID、版本狀態、發布類型、相容數值版本、相容素材版本、驗證狀態、可用環境、回復基準、更新時間、操作。

- 原型「影響商戶」不得作目標主欄；若顯示外部影響，必須清楚標示 GGAP snapshot、來源與時間，且不提供維護入口。
- 預設 pending／failed 優先，再以 updated_at desc、version ID 穩定排序。
- 已被任何 release job／環境引用的版本不可刪除；archived 只限制新引用。

## 7. 版本詳情

大型 Dialog 顯示版本 ID、game、semver／build、artifact URI 摘要與 checksum、狀態、release type、change log、相容平台／API、數值／素材／設定參照、測試／安全驗證、lineage、使用中的環境／release jobs 與 audit。

## 8. 建立與回復申請

建立流程：草稿 → artifact 註冊 → 相容性／自動測試 → 送審 → approved／available。環境生效另由 `/games/environments` 建立 release job。

回復不是把版本狀態改回去，而是選擇仍可用的舊組合建立新的 release job；需重新 preflight、理由、核准、version 與 audit。不可刪除或改寫原發布歷史。

## 9. 頁面狀態與錯誤處理

支援 loading、empty、artifact missing、validation running／failed、review pending／rejected、incompatible reference、conflict、export、Forbidden。部分參照來源失敗時仍可看版本基本資料，但標示無法確認可發布性。

## 10. API 契約草案

| 能力 | 必要輸出／行為 |
| --- | --- |
| 列表／詳情 | 版本 schema、artifact、checksum、compatibility、references、lineage。 |
| 草稿／驗證／審核 | version、job、validation、approval、allowed actions、audit。 |
| 引用查詢 | active environments、release jobs、math／asset／setting versions。 |
| 匯出 | applied filters、完整結果、job／到期／權限。 |

正式生命週期、相容性、API、權限及檔案保存依集中 TBD。

## 11. 響應式、無障礙與驗收

頁面使用主內容完整寬度。Mobile 版本卡片保留 ID、版號、狀態、驗證、參照與詳情；長 checksum 可換行／複製。狀態不只靠顏色。

驗收條件：版本與 release job 狀態分離；數值／素材／設定採精確參照；商戶不成為管理維度；被引用版本不可刪除；回復建立新 job；列表、詳情、驗證、衝突、Forbidden 可驗收。

## 12. 測試重點

- 相同 semver 不同 build、checksum 不符、artifact 缺失、相容性失敗。
- 被引用／未引用版本的封存與刪除限制。
- 送審衝突、重複建立、回復目標失效與環境 preflight。
- 390px 長版號／checksum、表格、Dialog 與鍵盤。

## 13. 待確認事項

- `TBD-DOM-003`：版本、release job 與發布組合生命週期。
- `TBD-API-001`、`TBD-API-005`：共通／版本 API。
- `TBD-SEC-001`、`TBD-SEC-003`、`TBD-SEC-004`：權限、高風險操作與匯出。
- `TBD-NFR-004`、`TBD-EXT-003`：前端驗收與角色模型。

## 14. Draft 移除條件

版本／artifact schema、狀態、相容性、引用、審核、回復、API 與權限核准並通過驗收後，才可改為 Confirmed。
