# 遊戲設定

## 章節狀態

| 項目 | 內容 |
| --- | --- |
| 規格成熟度 | 目前需求基準 — 已同步 Decision Pack 03 |
| 製作範圍 | Active |
| 對應路由 | `/games/settings` |
| 前端元件 | `src/views/Games/Settings.vue` |
| 主要來源 | `PROVIDER_PORTAL_PAGE_MAP.md`、`Decision Pack 01`、`Decision Pack 03`、現行原型 |
| 頁面角色 | Provider 一般設定、維護與限紅模板 |

> 本頁不管理 RTP、賠率表、程式版本、素材或代理商／商戶／會員層級設定。設定版本是 Game Version 快照的一部分；畫面編輯只建立新版本，必須經環境 Release 才會生效。

## 1. 目的與責任邊界

- 管理 Provider 共用維護週期模板、遊戲投注結構、投注幣別倍率、下注限額方案與遊戲基礎選項。
- 允許單款遊戲引用已核准模板；不把模板本身當成已發布遊戲設定。
- 影響 Production 的異動必須形成新設定版本並進入 Release；一般設定走快速通道，限額、幣別倍率、金額或契約異動自動列為高風險並要求第二人核准。
- 金額限制以 Provider 點數為真實值；USDT 僅作換算對照。原型中的 USD／TWD 選項不是正式契約。

## 2. 設定模型

- `setting_template_id`、`setting_version`、status、scope、effective environments 與 audit version 必須穩定。
- 設定版本需保留 draft、validated、approved、retired 等成熟度與精確引用；實際 enum 取得後映射，不再另行改寫 DP03 Release 狀態。
- 已被 Version／Artifact／Release 引用的設定版本不可原地修改；需複製新版本。
- 同一遊戲實際套用結果需保存模板版本 snapshot，避免模板後續異動改寫歷史。

## 3. 六區塊資訊架構

1. 設定摘要：維護模板、限紅模板、Production 審核狀態。
2. 遊戲／版本脈絡：共用模板或精確遊戲套用範圍。
3. 維護週期模板：週期、時間、時區、範圍、啟用與版本。
4. 投注與限額方案：投注結構、幣別倍率、最小／最大投注、派彩上限與適用範圍。
5. 基礎選項：遊戲類型、平台、語系及預設設定。
6. 草稿、審核、狀態與稽核。

<!-- PAGE_VISUAL_START -->
<figure class="page-anatomy lifecycle-anatomy lifecycle-anatomy--settings" aria-label="遊戲設定六區塊畫面示意">
  <div class="lifecycle-anatomy__canvas">
    <a class="anatomy-zone lifecycle-anatomy__cards" href="#4-設定摘要與脈絡" aria-label="前往第一區，設定摘要"><span class="anatomy-zone__number">01</span><span><small>維護模板</small><strong>4</strong><i>2 active</i></span><span><small>限紅模板</small><strong>6</strong><i>Provider 點數</i></span><span><small>Production 異動</small><strong>需審核</strong><i>Draft policy</i></span></a>
    <a class="anatomy-zone lifecycle-anatomy__toolbar" href="#4-設定摘要與脈絡" aria-label="前往第二區，設定脈絡"><span class="anatomy-zone__number">02</span><strong>設定脈絡</strong><small>共用模板／指定遊戲 · Draft version</small><i>遊戲：全部　環境：Production + DEMO　狀態：Active</i></a>
    <a class="anatomy-zone lifecycle-anatomy__table" href="#5-維護週期模板" aria-label="前往第三區，維護週期模板"><span class="anatomy-zone__number">03</span><strong>維護週期模板</strong><small>模板 ID　名稱　週期　日期　起始　結束　時區　範圍　版本　狀態</small><i>maint-001　每週例行維護　每週　週三　03:00　04:00　Asia/Taipei　指定遊戲　v4　Active</i></a>
    <a class="anatomy-zone lifecycle-anatomy__table" href="#6-投注與限額方案" aria-label="前往第四區，投注與限額方案"><span class="anatomy-zone__number">04</span><strong>投注與限額方案</strong><small>方案 ID　Bet Level　幣別倍率　最小投注　最大投注　派彩上限　版本　狀態</small><i>limit-003　Level 01–12　固定倍率 v3　1 pt　5,000 pt　500,000 pt　v3　Approved</i></a>
    <div class="lifecycle-anatomy__split">
      <a class="anatomy-zone lifecycle-anatomy__detail" href="#7-基礎選項" aria-label="前往第五區，基礎選項"><span class="anatomy-zone__number">05</span><small>BASE OPTIONS</small><strong>遊戲類型 · 平台 · 語系</strong><i>穩定 enum · 繁中預設 · 不由自由文字建立</i></a>
      <a class="anatomy-zone lifecycle-anatomy__states" href="#8-草稿-審核與稽核" aria-label="前往第六區，草稿審核與稽核"><span class="anatomy-zone__number">06</span><strong>草稿、審核與稽核</strong><i>儲存草稿</i><i>驗證</i><i>送審</i><i>版本衝突</i><i>歷程</i></a>
    </div>
  </div>
  <div class="page-anatomy__legend"><span><i></i>設定模板</span><span><i></i>Production 異動需核准</span><small>參照現行 `/games/settings` 原型；表單編輯不等於正式生效。</small></div>
</figure>
<!-- PAGE_VISUAL_END -->

## 4. 設定摘要與脈絡

摘要使用完整 Provider scope，分別顯示模板總數／active／待審核；不可從目前表格分頁推算。頁面可由 `game_id` deep link 進入指定遊戲套用視角，但不得在此建立遊戲主資料。

## 5. 維護週期模板

欄位至少含模板 ID、名稱、週期（每日／每週／每月／指定日期）、日期規則、起訖時間、時區、scope、指定遊戲、版本、狀態、更新人／時間。

- 結束必須晚於開始；跨日需明確表示；重疊排程需警告或阻擋。
- 維護生效只阻擋新 Launch，不中斷既有 Round。
- UI toggle 只改草稿；正式啟用需通過後端驗證與核准。

## 6. 投注與限額方案

欄位至少含方案 ID、名稱、投注結構／Bet Level、Provider 點數規則版本、固定幣別倍率、最小投注、最大投注、單 Round／期間派彩上限（若適用）、scope、遊戲類型／遊戲、版本、狀態及時間。

- 必須滿足 `0 ≤ min_bet ≤ max_bet`，派彩上限與遊戲數值模型相容。
- 主值是 Provider 點數；各投注幣別使用版本化固定倍率映射，不直接套用即時市場匯率。若顯示 USDT 必須使用已指定規則版本，禁止把外部法幣當 Provider 限額主值。
- 修改 active 模板需複製新版本；Game Version 引用精確設定版本。
- 限額、固定幣別倍率與投注／Callback 契約變更均屬高風險 Release；一般顯示或非結果設定才可走快速通道。

## 7. 基礎選項

遊戲類型、支援平台、語系、預設維護模板與 Production 審核政策均需穩定 enum／ID。語系以台灣繁中為預設，fallback 與正式清單依 `TBD-DAT-006`。此區不得讓一般使用者自由建立會破壞跨頁 mapping 的 enum。

## 8. 草稿、審核與稽核

- 編輯產生 dirty state；離頁需提示。儲存草稿、驗證、送審、生效分開。
- Production 變更需差異預覽、最新 version 與 allowed action；系統自動風險分類，一般變更由發布管理者一人確認，高風險才要求第二位管理者。
- 併發衝突不得覆蓋他人新版本；保留使用者輸入並提供差異合併／重載。
- Audit 記錄 actor、template／game scope、before／after、reason、version、request／trace、結果及時間。

## 9. 頁面狀態與錯誤處理

支援 loading、empty、validation error、save draft、review pending／rejected、conflict、partial option failure、stale、Forbidden。API 失敗不得保留假成功 toggle；重試需使用相同冪等語意。

## 10. API 契約草案

| 能力 | 必要輸出／行為 |
| --- | --- |
| 摘要／模板查詢 | templates、versions、status、scope、total、option sources。 |
| 草稿／驗證 | version、validation errors／warnings、normalized values。 |
| 候選／狀態轉換 | risk classification、approval（若高風險）、allowed actions、new version、audit event。 |
| 遊戲套用 | game_id、template version snapshot、target environment、effective status。 |

正式 schema、生命週期與 permission 依 `TBD-DOM-003`、`TBD-API-005`、`TBD-SEC-001`、`TBD-SEC-003`。

## 11. 響應式、無障礙與驗收

頁面使用主內容完整寬度。Desktop 表格可水平捲動；Mobile 模板轉卡片／分段表單。欄位 label、錯誤、dirty、狀態與確認可被鍵盤及輔助科技辨識。

驗收條件：設定與數值／程式／素材分離並被 Version 精確引用；點數為限額主值；固定幣別倍率不使用即時匯率；active 不可原地改；維護不阻斷既有 Round；一般／高風險通道正確；遊戲套用保存版本 snapshot；Loading／error／conflict／Forbidden 可驗收。

## 12. 測試重點

- 跨日／重疊維護、時區與日光節約（若支援）。
- 點數最小／最大／派彩邊界、decimal、規則版本不相容。
- dirty 離頁、雙人同編、送審後再修改、重複送出與權限撤銷。
- 390px 表單、表格鍵盤、長模板名稱及欄位錯誤公告。

## 13. 待確認事項

- `TBD-DOM-003`：現有設定 schema 與 DP03 Version／Release 的 Mapping。
- `TBD-DAT-006`：語系與 fallback。
- `TBD-API-001`、`TBD-API-005`：共通／設定 API。
- `TBD-SEC-001`、`TBD-SEC-003`：權限、核准、併發與 audit。
- `TBD-NFR-004`、`TBD-EXT-003`：前端驗收及系統角色模型。

## 14. 實作接軌條件

目前產品行為依本頁、Decision Pack 01 與 Decision Pack 03 成立；正式 schema、API 與 permission 取得後建立 Mapping，並以驗收結果更新實作狀態。
