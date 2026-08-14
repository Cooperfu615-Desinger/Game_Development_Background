# 風控報表

## 章節狀態

| 項目 | 內容 |
| --- | --- |
| 規格成熟度 | Draft — Batch B 完整頁面規格 |
| 製作範圍 | Active |
| 對應路由 | `/monitoring/risk-reports` |
| 前端元件 | `src/views/Provider/RiskReports.vue` |
| 主要來源 | `PROVIDER_RISK_REPORT_SPEC.md`、`PROVIDER_RISK_CONTROL_SPEC.md` |
| 主要業務單位 | Risk Event |
| 環境 | Production 或 DEMO 單選；Test 排除 |

> 本頁是 Provider 自身 Risk Event 的唯讀分析頁，不是 Alert 工作佇列。事件可有關聯 Alert，但兩者 ID、狀態與生命週期不得合併。

## 1. 目的與使用情境

供風控、營運與技術人員依滾動時間、環境、遊戲、事件類型、嚴重度與狀態分析異常，優先檢視需關注事件，追溯證據與 Game Round，並在需要人工處理時導向 Alert 頁。

## 2. 範圍與責任邊界

### 2.1 本頁包含

- Provider 自身遊戲服務、Round 結果、數值偏離與 GGAP 直接整合所產生的 Risk Event。
- 五張事件摘要、最多五筆待關注事件、完整篩選列表、事件詳情與匯出。
- 關聯 Game Round、Alert、緩解／隔離快照及 GGAP 通知結果的唯讀追溯。

### 2.2 本頁不包含

- Test 資料，或 Production／DEMO 混合統計。
- 告警指派、備註、隔離、解除、重試、結案或誤報操作。
- 修改投注、派彩、換算、已結算 Round 或風控證據。
- 將 Provider 隔離解讀為 GGAP 對代理商個別開關。

## 3. 名詞、時間與狀態

- 主時間欄位為 `detected_at`；預設 rolling 24 小時，快速選項 24／72／120 小時。
- Risk Event 代表已偵測的客觀異常；`risk_event_id` 必須唯一、穩定、可追溯。
- Draft 狀態至少區分 pending、investigating、resolved；正式 enum、終態與重開規則依 `TBD-DOM-004`。
- High／Critical 為高風險；正式嚴重度、門檻版本、樣本與 evidence schema 依 `TBD-DAT-005`。
- Production／DEMO 各自查詢與聚合；深連結事件若屬另一環境，頁面切換至事件環境再開啟詳情。

## 4. 資訊架構與頁面區塊

1. 查詢範圍：環境、滾動時間、遊戲與更新。
2. 五張摘要卡：全部、未處理、處理中、已解決、高風險。
3. 待關注異常：最多五筆 active High／Critical。
4. 篩選與事件列表：常用／進階條件、15 欄、排序、分頁。
5. Risk Event 詳情：大型 Dialog 顯示證據、影響、緩解、Round 與歷程。
6. 匯出、替代狀態與跨頁導流。

<!-- PAGE_VISUAL_START -->
<figure class="page-anatomy ops-anatomy ops-anatomy--risk-report" aria-label="風控報表六區塊畫面示意">
  <div class="ops-anatomy__canvas">
    <a class="anatomy-zone ops-anatomy__toolbar" href="#5-查詢範圍" aria-label="前往第一區，查詢範圍"><span class="anatomy-zone__number">01</span><span><small>RISK EVENT ANALYTICS</small><strong>風控報表</strong><i>detected_at · rolling window</i></span><b>Production　24h　72h　120h　全部遊戲　↻</b></a>
    <a class="anatomy-zone ops-anatomy__cards ops-anatomy__cards--five" href="#6-五張摘要卡" aria-label="前往第二區，五張摘要卡"><span class="anatomy-zone__number">02</span><span><small>全部事件</small><strong>38</strong></span><span><small>未處理</small><strong>5</strong></span><span><small>處理中</small><strong>4</strong></span><span><small>已解決</small><strong>29</strong></span><span><small>高風險</small><strong>7</strong></span></a>
    <a class="anatomy-zone ops-anatomy__attention" href="#7-待關注異常" aria-label="前往第三區，待關注異常"><span class="anatomy-zone__number">03</span><strong>待關注異常</strong><span><b>CRITICAL</b> payout deviation · mitigation failed</span><span><b>HIGH</b> GGAP timeout · not notified</span><span><b>HIGH</b> round failure spike · investigating</span></a>
    <a class="anatomy-zone ops-anatomy__table" href="#8-篩選與事件列表" aria-label="前往第四區，篩選與事件列表"><span class="anatomy-zone__number">04</span><strong>Risk Event 列表</strong><small>事件 ID　時間　環境　遊戲　類型　嚴重度　狀態　影響　緩解　隔離　Alert　Round　更新</small><i>risk-20260814-0031　10:18　Production　星際寶藏　數值偏離　Critical　Investigating</i></a>
    <div class="ops-anatomy__split">
      <a class="anatomy-zone ops-anatomy__detail" href="#9-risk-event-詳情" aria-label="前往第五區，Risk Event 詳情"><span class="anatomy-zone__number">05</span><small>RISK EVENT DETAIL</small><strong>risk-20260814-0031</strong><i>事件摘要 · 影響 · 規則證據 · 自動緩解 · Round · Timeline</i><b>前往 Alert →</b></a>
      <a class="anatomy-zone ops-anatomy__states" href="#11-頁面狀態與錯誤處理" aria-label="前往第六區，匯出與替代狀態"><span class="anatomy-zone__number">06</span><strong>匯出與替代狀態</strong><i>完整結果匯出</i><i>查無資料</i><i>查詢失敗</i><i>權限不足</i></a>
    </div>
  </div>
  <div class="page-anatomy__legend"><span><i></i>Risk Event</span><span><i></i>需人工關注</span><small>參照現行 `/monitoring/risk-reports` 原型；本頁全程唯讀。</small></div>
</figure>
<!-- PAGE_VISUAL_END -->

## 5. 查詢範圍

| 欄位 | 技術值 | 預設／規則 |
| --- | --- | --- |
| 環境 | `environment` | Production；Production／DEMO 單選。 |
| 快速時間 | `rolling_window` | 24h；另有 72h、120h。 |
| 起訖時間 | `detected_from`、`detected_to` | 自訂時取代快速時間；半開區間 `[from,to)`。 |
| 遊戲類型／遊戲 | `game_type`、`game_id` | 全部；選項限 Provider scope。 |
| 精確事件 | `risk_event_id` | 完整比對，不得模糊搜尋。 |

- URL 帶有效 `risk_event_id` 時，先解析事件並切到正確環境，再開啟詳情。
- ID 不存在、格式錯誤或無權時顯示對應錯誤，不可退回一般列表冒充成功。
- 切換環境清除不適用的遊戲與事件條件；Test 值直接拒絕。

## 6. 五張摘要卡

| 卡片 | 計算 |
| --- | --- |
| 全部事件 | 查詢窗口內不重複 `risk_event_id`。 |
| 未處理 | 狀態 pending。 |
| 處理中 | 狀態 investigating。 |
| 已解決 | 狀態 resolved。 |
| 高風險 | High／Critical；可與前三張狀態卡交集。 |

- 卡片使用完整篩選集合，不受列表分頁影響。
- 高風險不是互斥狀態，五張卡不可相加推回總數。
- empty 時顯示 0；來源失敗時顯示錯誤，不得沿用舊值或假裝 0。

## 7. 待關注異常

- 最多五筆 active High／Critical，優先序：Critical、緩解失敗、尚未隔離／GGAP 通知失敗、High、最新 `detected_at`。
- 每筆顯示 Risk Event ID、遊戲／環境、事件類型、嚴重度、狀態、關鍵證據、緩解／隔離／通知狀態及時間。
- 點擊開啟同頁詳情；本區不提供處理按鈕。
- 無待關注事件時顯示「目前無高風險待關注事件」，不隱藏整個區塊。

## 8. 篩選與事件列表

常用條件：事件 ID、遊戲、事件類型、嚴重度、狀態、是否有 Alert。進階條件可含規則 ID、緩解狀態、隔離狀態、GGAP 通知狀態、關聯 Round ID。

列表 15 個主要欄位：

| # | 欄位 | 顯示規則 |
| ---: | --- | --- |
| 1 | Risk Event ID | 完整 ID，可複製並開啟詳情。 |
| 2 | 偵測時間 | `detected_at`、含時區。 |
| 3 | 環境 | Production／DEMO。 |
| 4 | 遊戲 | 名稱與 `game_id`。 |
| 5 | 事件類型 | 繁中名稱、技術值輔助。 |
| 6 | 嚴重度 | Critical／High／Medium／Low。 |
| 7 | 事件狀態 | 與 Alert status 分開。 |
| 8 | 影響摘要 | 指標、範圍、樣本或 Round 數。 |
| 9 | 規則／門檻 | rule ID、版本與觸發值。 |
| 10 | 自動緩解 | 未執行／執行中／成功／失敗。 |
| 11 | 隔離狀態 | Provider scope 的隔離快照。 |
| 12 | GGAP 通知 | request／ACK 狀態；不代表平台完成處理。 |
| 13 | Alert | `alert_id` 與 Alert status；無則 `—`。 |
| 14 | 關聯 Round | 數量及精確導流入口。 |
| 15 | 更新／詳情 | `updated_at` 及開啟詳情。 |

- 預設 `detected_at desc`，同值以 `risk_event_id desc` 穩定排序。
- 排序、分頁、篩選由伺服器處理；頁碼超界時回到有效頁並提示。

## 9. Risk Event 詳情

使用大型 Dialog 或獨立內容區，不使用狹窄抽屜。至少包含：

1. 事件摘要：ID、環境、遊戲、類型、嚴重度、狀態、偵測／更新時間。
2. 影響範圍：受影響服務、版本、Round、玩家匿名數、時間窗口。
3. 規則證據：rule ID／版本、觀察值、門檻、樣本、資料來源。
4. 自動緩解與 GGAP：執行結果、隔離快照、request ID、ACK／錯誤；只讀。
5. 關聯 Game Round：精確 Provider／GGAP Round ID、時間、結果與 `/reports` 導流。
6. Timeline：偵測、升級、緩解、Alert 建立、通知、狀態變更與 actor。

若有 Alert，顯示「前往告警處理」並帶 `alert_id`、`risk_event_id`、`environment`；若沒有 Alert，不得自行在前端創建。

## 10. 匯出與跨頁導流

- 匯出完整 applied filters 結果，不受目前分頁或待關注五筆限制。
- 匯出包含篩選快照、產生時間、時區、環境、口徑／規則版本；敏感欄位、格式、同步／非同步、保存與下載權限依 `TBD-SEC-004`。
- Round 導向 `/reports`；Alert 導向 `/monitoring/alerts`；監控脈絡可返回 `/monitoring`。
- GGAP request 頁目前 Deferred，只保留 ID 與依賴說明。

## 11. 頁面狀態與錯誤處理

| 狀態 | 必要行為 |
| --- | --- |
| 首次載入／重新查詢 | 保留區塊 skeleton；以最後有效 request 為準。 |
| 無資料 | 五張摘要顯示 0，列表與待關注顯示明確 empty，匯出停用。 |
| 局部失敗 | 成功區塊保留；失敗區顯示來源與重試，不以 0 代替。 |
| 查詢失敗 | 保留條件，顯示重試；不可顯示舊結果為新查詢。 |
| 資料過期 | 標示 stale 及最後成功時間。 |
| 權限不足 | Forbidden；敏感 evidence 不可先渲染再隱藏。 |
| 匯出 | idle、queued、processing、completed、failed、expired。 |
| Deep link 失敗 | 分開顯示 invalid、not found、forbidden、environment mismatch。 |

## 12. API 契約草案

| 能力 | 必要輸入 | 必要輸出 |
| --- | --- | --- |
| 摘要／待關注 | environment、window、filters | 五項摘要、attention、資料時間、規則版本 |
| 事件列表 | filters、sort、page | 15 欄資料、total、穩定排序 |
| 事件詳情 | risk_event_id | 證據、影響、緩解、Round、Alert、timeline |
| 建立匯出 | applied filters、format、fields | job ID、狀態、保存／到期資訊 |

所有回應強制 Provider scope、單一環境、Test 排除，並帶 `generated_at`、`timezone`、`data_status`、`rule_version` 或等價欄位。正式 schema、enum、path、錯誤碼與 permission key 依集中 TBD。

## 13. 響應式、無障礙與文案

- Desktop 遵循 Portal `1500px`；詳情 Dialog 使用寬版資訊分區。
- Mobile 摘要單欄或雙欄、待關注卡片堆疊、列表轉卡片；保留 ID 複製與詳情入口。
- 嚴重度、狀態、成功／失敗必須有文字；表格 header、Dialog focus、鍵盤操作完整。
- 介面以台灣繁中為主；ID、rule、enum、request／trace 保留技術值。

## 14. 前後端交付要求

前端：分開 Risk Event／Alert state，所有操作留在 Alert 頁；以 applied filters 驅動摘要、待關注、列表與匯出；深連結先解析事件，不作模糊 fallback。

後端：提供不可變事件 ID、規則／門檻版本、事件時間與 evidence；隔離與 GGAP 僅回傳可證明快照；保留更正與稽核追溯，排除 Test。

## 15. 驗收條件

1. 頁面主單位明確為 Risk Event，與 Alert 狀態完全分離。
2. Production／DEMO 單選且不混合，Test 不可查詢。
3. 五張卡、待關注、列表與匯出使用同一 applied filters。
4. 待關注排序符合 Critical／失敗／通知／High／時間規則。
5. 15 欄列表及大型詳情可追溯規則、Round、Alert、緩解與時間線。
6. 本頁不出現隔離、解除、結案或修改 Round 操作。
7. 精確 deep link 能切換事件環境；無效或無權不 fallback。
8. empty、stale、partial error、Forbidden、匯出各狀態可驗收。

## 16. 測試重點

- rolling 24／72／120h、自訂區間與 detected_at 邊界。
- 相同事件的狀態／嚴重度交集、attention 排序與分頁穩定性。
- Event deep link 跨環境、not found、forbidden 與 malformed ID。
- Evidence 遮罩、Round／Alert 導流、Dialog focus。
- 匯出完整結果、無資料、queued／failed／expired。

## 17. 待確認事項

- `TBD-DOM-004`：Risk Event、Alert、緩解與隔離正式模型。
- `TBD-DAT-002`、`TBD-DAT-003`、`TBD-DAT-004`、`TBD-DAT-005`：識別碼、時間、保存、更正、門檻與 evidence。
- `TBD-API-001`、`TBD-API-002`、`TBD-API-004`：共通、Round、監控／風控及匯出 API。
- `TBD-SEC-001`、`TBD-SEC-002`、`TBD-SEC-004`：scope、敏感欄位與匯出權限。
- `TBD-NFR-001`、`TBD-NFR-002`、`TBD-NFR-004`：效能、stale／降級與前端品質。
- `TBD-EXT-001`、`TBD-EXT-003`：GGAP 正式規格與系統權限模型。

## 18. Placeholder／Draft 移除條件

本頁已有內容原型，不使用 Placeholder。只有 Event schema／enum、門檻、API、保存、遮罩、匯出及權限核准且驗收通過後，才可改為 Confirmed。
