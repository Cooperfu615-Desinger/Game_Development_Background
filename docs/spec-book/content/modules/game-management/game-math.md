# 數值設定

## 章節狀態

| 項目 | 內容 |
| --- | --- |
| 規格成熟度 | Draft — Batch C 完整頁面規格 |
| 製作範圍 | Active |
| 對應路由 | `/games/math` |
| 前端元件 | `src/views/Games/Math.vue` |
| 主要來源 | `PROVIDER_RISK_CONTROL_SPEC.md`、現行原型 |
| 頁面角色 | 遊戲數值版本、RTP 監控與審核入口 |

> 數值設定是 Provider 遊戲規則真實來源之一；RTP 監控是觀測結果。設定版本與監控指標不得混成同一狀態，原型的「偏離 ≥ 5%」僅為 mock，不是正式 Risk Event 門檻。

## 1. 目的與責任邊界

- 管理理論 RTP、波動度、賠率表、點數／限紅相容條件與數值版本。
- 顯示 Production／DEMO 的實際 RTP、樣本、窗口與偏差，協助決定是否調查。
- 透過複製、模擬、驗證、送審與發布組合生效，不直接改寫 active 數值。
- 不修改已結算 Game Round；不把單筆超額派彩直接判定為 Risk Event。

## 2. 數值與監控模型

- 數值版本至少含 `math_version_id`、game_id、理論 RTP、波動度、賠率表／checksum、點數規則、相容限紅、版本狀態與審核。
- 監控 snapshot 另含 environment、actual RTP、deviation、sample rounds、window、updated_at、rule／threshold version。
- 理論值與實際值需明確標示單位及基準；偏差公式與 percentage／percentage point 語意待核准。
- Production／DEMO 分開監控，Test 不進 Provider 風控。

## 3. 六區塊資訊架構

1. 數值摘要：版本、偏離、樣本、Production 審核。
2. RTP 監控趨勢：環境、窗口、理論線、實際值與樣本。
3. 查詢條件：遊戲、版本、狀態、波動度、環境與時間。
4. 數值版本列表：設定與監控欄位分區。
5. 數值詳情：規則、相容性、監控與版本 lineage。
6. 審核申請與替代狀態。

<!-- PAGE_VISUAL_START -->
<figure class="page-anatomy lifecycle-anatomy lifecycle-anatomy--math" aria-label="數值設定六區塊畫面示意">
  <div class="lifecycle-anatomy__canvas">
    <a class="anatomy-zone lifecycle-anatomy__cards lifecycle-anatomy__cards--four" href="#4-數值摘要" aria-label="前往第一區，數值摘要"><span class="anatomy-zone__number">01</span><span><small>數值版本</small><strong>18</strong><i>Active 12</i></span><span><small>需關注偏離</small><strong>3</strong><i>Draft rule</i></span><span><small>樣本 Round</small><strong>284K</strong><i>applied window</i></span><span><small>Production 異動</small><strong>需審核</strong><i>不可直改</i></span></a>
    <a class="anatomy-zone lifecycle-anatomy__chart" href="#5-rtp-監控趨勢" aria-label="前往第二區，RTP 監控趨勢"><span class="anatomy-zone__number">02</span><strong>RTP 監控趨勢</strong><small>Production · 近 7 日 · 理論 96.00%</small><span><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span></a>
    <a class="anatomy-zone lifecycle-anatomy__filters" href="#6-查詢條件" aria-label="前往第三區，查詢條件"><span class="anatomy-zone__number">03</span><strong>查詢條件</strong><i>遊戲／數值 ID</i><i>環境</i><i>狀態</i><i>波動度</i><i>監控時間</i><b>查詢</b></a>
    <a class="anatomy-zone lifecycle-anatomy__table" href="#7-數值版本列表" aria-label="前往第四區，數值版本列表"><span class="anatomy-zone__number">04</span><strong>數值版本列表</strong><small>數值 ID　遊戲　版本　理論 RTP　環境　實際 RTP　偏差　波動度　狀態　樣本　審核　更新　操作</small><i>math-018　星際寶藏　v3.2　96.00%　Production　96.08%　+0.08pp　中高　Active　82,410　APR-021</i></a>
    <div class="lifecycle-anatomy__split">
      <a class="anatomy-zone lifecycle-anatomy__detail" href="#8-數值詳情" aria-label="前往第五區，數值詳情"><span class="anatomy-zone__number">05</span><small>MATH VERSION DETAIL</small><strong>math-018 / v3.2</strong><i>理論規則 · 賠率 checksum · 相容限紅 · 監控 snapshot · lineage</i></a>
      <a class="anatomy-zone lifecycle-anatomy__actions" href="#9-審核與狀態" aria-label="前往第六區，審核與狀態"><span class="anatomy-zone__number">06</span><strong>審核申請</strong><i>複製新版本</i><i>模擬</i><i>驗證</i><i>送審</i><i>衝突／失敗</i></a>
    </div>
  </div>
  <div class="page-anatomy__legend"><span><i></i>數值版本</span><span><i></i>RTP 監控 snapshot</span><small>參照現行 `/games/math` 原型；固定偏離門檻不是正式契約。</small></div>
</figure>
<!-- PAGE_VISUAL_END -->

## 4. 數值摘要

四卡分別呈現數值版本、需關注偏離、樣本 Round、Production 異動政策。前三者需標示 applied environment／window；偏離卡依後端規則版本計算，不由前端固定 5%。卡片可導向列表篩選，不直接建立 Event 或審核。

## 5. RTP 監控趨勢

- environment 單選 Production／DEMO；顯示理論基準線、實際序列、樣本與資料缺口。
- Tooltip 含時間桶、理論／實際、偏差、樣本、門檻／規則版本及更新時間。
- 無資料與 0 分開；樣本不足不得顯示正常。正式指標依 `TBD-DAT-005`。

## 6. 查詢條件

關鍵字（game／math ID／review ID）、game_id、environment、math status、volatility、monitor window。設定狀態與監控狀態需用不同欄位；URL query 不放敏感內容。

## 7. 數值版本列表

目標欄位：數值 ID、遊戲、數值版本、理論 RTP、監控環境、實際 RTP、偏差、波動度、版本狀態、樣本 Round、審核單、更新時間、操作。若同一版本同時顯示多環境 snapshot，必須分列或明確切換，禁止混算。

- 預設 active／pending 優先，再以 updated_at desc、math ID 穩定排序。
- 列表與匯出由伺服器篩選分頁；實際 RTP 不從畫面 Round 即時計算。

## 8. 數值詳情

大型 Dialog 顯示：ID／遊戲／版本／狀態；理論 RTP、波動度、賠率表 checksum、點數與限紅相容性；監控 snapshot；來源版本、複製 lineage、審核、發布組合及 audit。已生效內容只讀。

## 9. 審核與狀態

流程骨架：從既有版本複製 → 編輯草稿 → 模擬／驗證 → 送審 → 核准 → 由環境發布組合生效 → 封存。Production 必填理由與差異，操作使用 version／idempotency；正式雙人核准待決策。

審核表單需顯示目前／目標值、差異、適用環境、模擬結果、相容限紅、風險說明及 reason。審核通過不等於已發布。

## 10. 頁面狀態與錯誤處理

支援 loading、empty、no monitoring data、sample insufficient、validation failed、simulation running／failed、review pending／rejected、conflict、export、Forbidden。監控來源失敗不得阻擋查看已核准理論版本，但需標示局部失敗。

## 11. API 契約草案

| 能力 | 必要輸出／行為 |
| --- | --- |
| 版本／詳情 | math schema、checksum、lineage、status、compatibility、approval。 |
| 監控／趨勢 | environment、window、buckets、actual／theoretical、sample、rule version。 |
| 草稿／模擬／審核 | validation、simulation job、version、approval、allowed actions、audit。 |
| 匯出 | applied filters、完整結果、job／到期／權限。 |

正式 API、decimal、門檻與 permission 依 `TBD-API-005`、`TBD-DAT-005`、`TBD-SEC-003`、`TBD-SEC-004`。

## 12. 響應式、無障礙與驗收

頁面使用主內容完整寬度。Mobile 卡片分開「設定」與「監控」，圖表提供等價表格／文字摘要，Dialog／審核管理焦點與錯誤公告。

驗收條件：理論設定與監控 snapshot 分離；Production／DEMO 不混算、Test 排除；active 不可直改；審核通過不等於發布；偏離門檻不寫死；既有 Round 不被修改；列表、詳情、狀態與跨頁發布關聯可追溯。

## 13. 測試重點

- decimal／百分點、理論與實際、極端值、樣本不足與資料缺口。
- 複製 lineage、草稿驗證、模擬 timeout、審核衝突與重複送出。
- Production／DEMO 同版本不同監控結果、Event 導流與匯出。
- 390px 圖表替代內容、寬表、Dialog 鍵盤與長 checksum。

## 14. 待確認事項

- `TBD-DOM-003`：數值版本與發布組合。
- `TBD-DAT-005`：RTP、樣本、窗口與風控門檻。
- `TBD-API-001`、`TBD-API-005`：共通／數值 API。
- `TBD-SEC-001`、`TBD-SEC-003`、`TBD-SEC-004`：權限、核准與匯出。
- `TBD-NFR-004`、`TBD-EXT-003`：前端驗收與角色模型。

## 15. Draft 移除條件

數值 schema、精度、模擬／審核／發布關聯、監控門檻、API 與權限核准且驗收通過後，才可改為 Confirmed。
