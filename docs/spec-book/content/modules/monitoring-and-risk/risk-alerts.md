# 風控告警／處理

## 章節狀態

| 項目 | 內容 |
| --- | --- |
| 規格成熟度 | Draft — Batch B 完整頁面規格 |
| 製作範圍 | Active |
| 對應路由 | `/monitoring/alerts` |
| 前端元件 | `src/views/Provider/RiskAlerts.vue` |
| 主要來源 | `PROVIDER_RISK_ALERT_HANDLING_SPEC.md`、`PROVIDER_RISK_CONTROL_SPEC.md` |
| 主要業務單位 | Alert |
| 環境 | Production 或 DEMO 單選；Test 排除 |

> 本頁是 Provider 風控人員的 Alert 工作佇列。現行操作只改變前端 mock；不代表已呼叫隔離、解除、GGAP 通知、結案或其他正式後端流程。正式權限、核准、併發與補償皆待集中 TBD 核准。

## 1. 目的與使用情境

讓風控、營運與值班人員從待處理告警中依優先序接手、指派、紀錄調查、檢視 Risk Event 與 Game Round 證據、確認自動緩解及隔離狀態，並在符合前置條件後完成處理、解除或結案。

## 2. 範圍與責任邊界

### 2.1 本頁包含

- Alert 摘要、目前工作 scope、常用／進階篩選、工作佇列及大型詳情。
- 接手、指派、備註、標記已緩解、維持／解除隔離、重試緩解、重送 GGAP、誤報、結案、重開的 Draft 操作規則。
- 關聯 Risk Event、Game Round、健康檢查、request ID 與完整操作歷程。

### 2.2 本頁不包含

- Test 資料或 Production／DEMO 混合佇列。
- 修改投注、派彩、點數／USDT 換算、已結算 Round 或 Risk Event 證據。
- 中斷既有 Round 的必要 Settle、Callback、audit 或追溯。
- GGAP 代理商個別開放控制；Provider 隔離僅限制約定 scope 的新 Launch。
- 將 GGAP 通知成功解讀為平台側已完成處理。

## 3. Alert 與處理模型

- Alert 是需要人員追蹤／處理的工作單位；`alert_id` 與 `risk_event_id` 分開。
- 主狀態 Draft：pending → investigating → mitigated → closed；false_positive 為例外終態；closed／false_positive 可依權限重開。
- Alert status、mitigation status、isolation status、GGAP notification status 是四個獨立維度，不可互相覆寫。
- 預設 scope 為 Production 且未 closed／false_positive 的 active alerts；摘要為目前狀態，不受建立時間範圍限制。
- 所有正式操作需 optimistic concurrency、後端授權與不可變 audit；原型 local mock 不產生正式副作用。

## 4. 資訊架構與頁面區塊

1. 五張工作摘要：未指派、高風險、已隔離、自動處理失敗、逾期複查。
2. 工作範圍與篩選：環境、狀態、嚴重度、遊戲、人員、建立時間及進階條件。
3. Alert 工作佇列：16 欄、營運優先排序、分頁及詳情入口。
4. Alert 詳情：事件證據、健康檢查、Round、request、狀態與操作歷程。
5. 固定操作與確認區：依狀態、權限及前置條件顯示可用動作。
6. 匯出、替代狀態、稽核與跨頁導流。

<!-- PAGE_VISUAL_START -->
<figure class="page-anatomy ops-anatomy ops-anatomy--risk-alerts" aria-label="風控告警處理六區塊畫面示意">
  <div class="ops-anatomy__canvas">
    <a class="anatomy-zone ops-anatomy__cards ops-anatomy__cards--five" href="#5-五張工作摘要" aria-label="前往第一區，五張工作摘要"><span class="anatomy-zone__number">01</span><span><small>未指派</small><strong>4</strong></span><span><small>高風險</small><strong>7</strong></span><span><small>已隔離</small><strong>3</strong></span><span><small>自動處理失敗</small><strong>2</strong></span><span><small>逾期複查</small><strong>1</strong></span></a>
    <a class="anatomy-zone ops-anatomy__toolbar" href="#6-工作範圍與篩選" aria-label="前往第二區，工作範圍與篩選"><span class="anatomy-zone__number">02</span><span><small>ALERT WORK QUEUE</small><strong>目前工作範圍</strong><i>Active alerts · current state</i></span><b>Production　全部狀態　High + Critical　未指派　進階篩選</b></a>
    <a class="anatomy-zone ops-anatomy__table" href="#7-alert-工作佇列" aria-label="前往第三區，Alert 工作佇列"><span class="anatomy-zone__number">03</span><strong>告警工作佇列</strong><small>Alert ID　嚴重度　狀態　遊戲　事件　負責人　緩解　隔離　GGAP　複查　建立　更新</small><i>alert-20260814-0018　Critical　Investigating　星際寶藏　數值偏離　王小明　Failed　Isolated</i></a>
    <div class="ops-anatomy__split ops-anatomy__split--wide">
      <a class="anatomy-zone ops-anatomy__detail" href="#8-alert-詳情" aria-label="前往第四區，Alert 詳情"><span class="anatomy-zone__number">04</span><small>ALERT DETAIL</small><strong>alert-20260814-0018</strong><i>Risk Event · Evidence · Health check · Rounds · Requests · Timeline</i><b>version 12</b></a>
      <a class="anatomy-zone ops-anatomy__actions" href="#9-操作與確認規則" aria-label="前往第五區，操作與確認規則"><span class="anatomy-zone__number">05</span><strong>處理操作</strong><i>接手</i><i>指派</i><i>新增備註</i><i>維持隔離</i><i>解除隔離</i><i>結案</i><small>正式操作需權限、理由、最新版本與稽核。</small></a>
    </div>
    <a class="anatomy-zone ops-anatomy__states" href="#11-頁面狀態與錯誤處理" aria-label="前往第六區，匯出與替代狀態"><span class="anatomy-zone__number">06</span><strong>匯出、替代狀態與稽核</strong><i>完整佇列匯出</i><i>無待辦</i><i>局部失敗</i><i>衝突需重新載入</i><i>權限不足</i></a>
  </div>
  <div class="page-anatomy__legend"><span><i></i>Alert 工作狀態</span><span><i></i>高風險操作</span><small>參照現行 `/monitoring/alerts` 原型；所有動作目前僅為 mock。</small></div>
</figure>
<!-- PAGE_VISUAL_END -->

## 5. 五張工作摘要

| 卡片 | Draft 定義 |
| --- | --- |
| 未指派 | active 且 `assignee_id` 為空。 |
| 高風險 | active 且 High／Critical。 |
| 已隔離 | active 且目前 isolation status 為 isolated。 |
| 自動處理失敗 | active 且 mitigation status 為 failed。 |
| 逾期複查 | active 且 `next_review_at < now`。 |

- 五張卡可重疊，不可相加；皆顯示目前 snapshot，不受建立時間範圍影響。
- 點擊卡片設定單一快捷 scope 並篩選下方佇列；再次點擊清除。
- 卡片使用完整資料集合，不受分頁影響；來源失敗不得顯示 0。

## 6. 工作範圍與篩選

預設：Production、active alerts、全部嚴重度／遊戲／人員。Production／DEMO 單選，Test 拒絕。

常用條件：`alert_id`、`risk_event_id`、環境、嚴重度、Alert status、遊戲、事件類型、負責人。進階條件：mitigation、isolation、GGAP notification、是否逾期、建立時間 `created_from/to`、關聯 Round／request ID。

- 建立時間只篩選佇列／歷史，不改變五張目前狀態卡。
- 精確 ID 使用完整比對；URL deep link 有 `alert_id` 時解析環境並開啟正確詳情。
- 無效、找不到或無權 ID 顯示明確錯誤，不 fallback 到一般佇列。

## 7. Alert 工作佇列

列表 16 個主要欄位：

| # | 欄位 | 規則 |
| ---: | --- | --- |
| 1 | Alert ID | 完整 ID、可複製、開啟詳情。 |
| 2 | 嚴重度 | Critical／High／Medium／Low。 |
| 3 | Alert 狀態 | 與其他處理狀態分開。 |
| 4 | 環境 | Production／DEMO。 |
| 5 | 遊戲 | 名稱與 ID。 |
| 6 | Risk Event | 事件類型及 `risk_event_id`。 |
| 7 | 影響摘要 | 服務／Round／玩家匿名範圍。 |
| 8 | 負責人 | 未指派或 Provider 使用者顯示名稱／ID。 |
| 9 | 緩解狀態 | not_started／running／succeeded／failed 等 Draft。 |
| 10 | 隔離狀態 | isolated／released 等 Draft。 |
| 11 | GGAP 通知 | pending／sent／ack／failed；不代表完成處理。 |
| 12 | 下次複查 | `next_review_at` 與逾期標示。 |
| 13 | 建立時間 | `created_at`、含時區。 |
| 14 | 最後更新 | `updated_at`。 |
| 15 | 版本 | optimistic concurrency version／etag。 |
| 16 | 詳情 | 開啟大型 Alert Dialog。 |

預設優先序：Critical、自動處理失敗、逾期、High、Medium、最近複查期限、`created_at`，最後以 `alert_id` 穩定排序。正式排序欄位與 null 規則由 API 核准。

## 8. Alert 詳情

大型 Dialog 至少包含：

1. Alert 摘要：ID、版本、狀態、嚴重度、環境、遊戲、負責人、建立／更新／複查時間。
2. Risk Event 證據：事件 ID、規則、門檻、觀察值、影響、來源與 `/monitoring/risk-reports` 導流。
3. 緩解與隔離：目標 scope、狀態、開始／結束、失敗原因、最新健康檢查。
4. GGAP 通知：request ID、送出、ACK、錯誤、重試；只表達直接整合結果。
5. 關聯 Game Round：精確 ID、狀態、時間與 `/reports` 導流；不可修改。
6. 操作歷程：actor、動作、before／after、reason、request／trace、時間及結果。

詳情載入後的每次操作都必須使用最新 `version`；衝突時保留未送出的備註／理由並要求重新載入確認。

## 9. 操作與確認規則

| 操作 | 主要前置條件與結果 |
| --- | --- |
| 接手 | active、目前未指派或允許覆寫；設定本人並進入 investigating。 |
| 指派／改派 | 需指派權限；目標使用者須在 Provider scope 且可用。 |
| 新增備註 | active 或可稽核歷史；內容不可改寫事件證據。 |
| 標記已緩解 | mitigation 已成功或經核准人工確認；不自動結案。 |
| 維持隔離 | 需理由與 `next_review_at`；隔離只阻擋新 Launch。 |
| 解除隔離 | 需最新成功健康檢查與理由；不改變既有 Round。 |
| 重試自動緩解 | 前次 failed／可重試；需冪等 key、執行狀態與有限重試。 |
| 重送 GGAP | 前次 failed／timeout；保持 request trace，不等同平台完成。 |
| 標記誤報 | 必填理由；如仍隔離必須先解除。 |
| 結案 | 必填理由；不得有 active isolation、GGAP notification failed 或 required action running。 |
| 重開 | closed／false_positive 且具權限；必填理由並建立 audit。 |

- 高風險操作需二次確認；正式是否雙人核准、重新驗證與 permission key 依 `TBD-SEC-003`。
- 後端是狀態轉換唯一權威；前端不得只靠按鈕顯示判斷可否操作。
- 操作失敗需區分 validation、forbidden、conflict、dependency failure、timeout；不樂觀顯示成功。

## 10. 隔離、Round 與 GGAP Guardrail

- Provider 隔離的最小 scope 必須明確到遊戲、版本、服務或其他核准維度，只阻擋該 scope 的新 Launch。
- 已存在 Round 的 Settle、必要 Callback、audit 與追溯必須持續；不得因隔離直接取消或改寫。
- GGAP 通知是外部訊息狀態；ACK 只代表約定層級的接收，不代表代理商開關已完成。
- 解除隔離依最新健康檢查；健康檢查過期、失敗或來源不可用時不得解除。

## 11. 頁面狀態與錯誤處理

| 狀態 | 必要行為 |
| --- | --- |
| 首次載入／更新 | 保留摘要、篩選、佇列與詳情骨架。 |
| 無待辦 | 摘要依完整資料顯示；佇列顯示 empty 與清除篩選入口。 |
| 局部失敗 | 摘要、列表、詳情、健康檢查或歷程可分區失敗。 |
| 操作進行中 | 鎖定相衝突按鈕，顯示可追蹤 request，防止重複送出。 |
| 驗證失敗 | 保留輸入，在欄位與確認區說明原因。 |
| 版本衝突 | 不覆蓋新資料；提示重新載入並保留使用者草稿。 |
| 依賴失敗 | 清楚區分隔離、健康檢查、緩解與 GGAP 通知，不誤改 Alert status。 |
| 權限不足 | 不渲染敏感資料或操作；顯示 Forbidden。 |
| Deep link 失敗 | invalid、not found、forbidden、environment mismatch 分開。 |

## 12. 匯出、稽核與通知依賴

- 匯出完整 applied queue，不受目前分頁；內容至少含 Alert／Event ID、各狀態、時間、負責人、環境、遊戲及必要 audit 摘要。
- 敏感欄位、檔案格式、保存、下載與匯出 audit 依 `TBD-SEC-004`。
- 每個操作記錄 actor、scope、action、before／after、reason、request／trace、version、timestamp、result。
- 通知中心目前 Deferred；可作未來操作完成／失敗入口，但不可成為唯一回饋，也不在本頁定義通知產品行為。

## 13. API 契約草案

| 能力 | 必要輸入 | 必要輸出 |
| --- | --- | --- |
| 摘要／佇列 | environment、active scope、filters、sort、page | 五卡、16 欄、total、snapshot time |
| Alert 詳情 | alert_id | version、Event、evidence、health、Round、requests、timeline、allowed actions |
| 狀態／指派操作 | alert_id、version、action payload、reason | 新版本、各獨立狀態、audit event、結果 |
| 緩解／隔離／GGAP | alert_id、version、idempotency key、scope | job／request、狀態、錯誤、trace |
| 匯出 | applied filters、format、fields | job ID、狀態、到期資訊 |

正式 path、schema、allowed-actions、enum、冪等、permission key、核准與錯誤碼由 `TBD-API-004`、`TBD-SEC-001`、`TBD-SEC-003`、`TBD-NFR-003` 管理。

## 14. 響應式、無障礙與文案

- Desktop 依 Portal `1500px`；詳情與固定操作區不得擠壓主要證據。
- Mobile 將佇列轉卡片，操作區置底但不得遮住內容；危險動作與一般動作視覺區分。
- Dialog／confirm 管理焦點、Escape、鍵盤循環、錯誤公告；狀態不可只靠顏色。
- 理由欄位標示必填、字數與敏感資訊提醒；技術 ID／enum 保留英文。

## 15. 前後端交付要求

前端：以伺服器 `allowed_actions` 及最新 version 控制操作；狀態四維分離；保留失敗輸入與衝突恢復；mock 必須明示無正式副作用。

後端：強制 Provider scope、單一環境與 Test 排除；驗證狀態機、前置條件、權限、版本及冪等；高風險操作完整 audit；隔離不得破壞既有 Round；外部失敗不得錯誤推進 Alert。

## 16. 驗收條件

1. Alert、Risk Event、緩解、隔離、GGAP 通知五種 ID／狀態不混用。
2. 五張卡可重疊且只設定佇列快捷 scope，不受建立時間範圍影響。
3. 16 欄佇列依營運優先序及穩定 ID 排序。
4. 大型詳情完整顯示 evidence、health、Round、request、timeline 及最新 version。
5. 所有操作符合前置條件、理由、確認、授權、併發與 audit 骨架。
6. 隔離只擋新 Launch；既有 Round Settle／Callback／audit 不受阻斷。
7. 無法解除、結案或誤報時顯示具體原因；操作失敗不冒充成功。
8. Production／DEMO 分離、Test 排除，通知中心不可用不影響頁面回饋。

## 17. 測試重點

- 摘要重疊、快捷 scope、active／history、created_at 範圍。
- 操作狀態機合法／非法轉換、缺理由、過期健康檢查、active isolation。
- 雙重點擊、timeout、重試、idempotency、版本衝突與跨人同時處理。
- mitigation／GGAP 部分失敗不錯誤推進 Alert status。
- 隔離前後的新 Launch 與既有 Round Settle／Callback 行為。
- 深連結、敏感 evidence、匯出、Mobile 固定操作區及鍵盤操作。

## 18. 待確認事項

- `TBD-DOM-004`：Alert、Risk Event、緩解與隔離正式生命週期。
- `TBD-DAT-002`、`TBD-DAT-003`、`TBD-DAT-004`、`TBD-DAT-005`：識別碼、時間、保存、門檻與健康檢查。
- `TBD-API-001`、`TBD-API-002`、`TBD-API-004`：共通、Round、Alert 工作 API。
- `TBD-SEC-001`、`TBD-SEC-002`、`TBD-SEC-003`、`TBD-SEC-004`：權限、遮罩、高風險操作、匯出與 audit。
- `TBD-NFR-001`、`TBD-NFR-002`、`TBD-NFR-003`、`TBD-NFR-004`：效能、降級、冪等／重試及前端品質。
- `TBD-EXT-001`、`TBD-EXT-002`、`TBD-EXT-003`：GGAP、通知中心與系統權限模型。

## 19. Placeholder／Draft 移除條件

本頁已有內容原型，不使用 Placeholder。只有 Alert 狀態機、操作前置條件、API、權限／核准、併發／冪等、隔離／GGAP 契約、audit 與驗收全部核准後，才可改為 Confirmed。
