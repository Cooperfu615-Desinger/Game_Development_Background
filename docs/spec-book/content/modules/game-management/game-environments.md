# 環境與發布

## 章節狀態

| 項目 | 內容 |
| --- | --- |
| 規格成熟度 | 目前需求基準 — 已同步 Decision Pack 03 |
| 製作範圍 | Active |
| 對應路由 | `/games/environments` |
| 前端元件 | `src/views/Games/Environments.vue` |
| 目前原型 | 內容原型已完成；發布操作僅更新 MSW／記憶體 mock |
| 頁面角色 | Test → DEMO → Production 晉級、Active Release、回滾與 Provider 全域可用性 |

> 現行內容原型已依 Decision Pack 03 完成三環境 Release 與遊戲全域可用性流程。GGAP 只管理已可用遊戲的代理商個別開放；目前所有操作皆為前端 mock，實際 Backend、CI/CD 與 GGAP payload 取得後再做 Mapping。

## 1. 目的與責任邊界

- 比較同一遊戲在 Production、DEMO、Test 的目前版本、狀態、健康與可用動作。
- 建立 Test Release、將同一候選 Artifact 晉級 DEMO／Production，並執行排程、發布、維護、停用與回滾。
- 顯示發布前檢查、進行中工作、結果、失敗原因及不可變操作歷程。
- Test 可由具權限編輯者快速發布 build 與重跑驗證；不提供全域上架，也不進正式監控風控。
- DEMO 資料隔離；不得進入正式 Game Round、財務或 Provider 風控。

## 2. Release 與 Guardrail

每筆 Release Record 至少包含 `release_id`、`game_id`、`version_id`、`build_id`、Artifact manifest／checksum、目標環境、前後 Active Release、風險通道、排程、驗證、操作者、結果與錯誤。重試與回滾都建立新紀錄，核心綁定與歷程不可覆寫。

- Test 可反覆使用新 build；成為 Candidate 後鎖定 Artifact，DEMO 通過後 Production 必須使用同一 Artifact。
- 各環境因發布時點不同可暫時有不同 Active Release，但不得為 Production 重新 build。
- 啟用、維護、停用只影響新 Launch；既有 Game Round 必須依規則完成 Settle、Callback 與 audit。
- 快速／高風險發布採兩條通道：一般 Release 採自動檢查加一位發布管理者；RTP、金額、限額、契約、migration、安全、略過檢查或無安全回滾才進入第二人核准的高風險通道。
- GGAP 同步只顯示外部結果，不允許在本頁操作代理商個別開關。

## 3. 六區塊資訊架構

1. 環境摘要：Production、DEMO、Test 與待發布數量。
2. 查詢與遊戲脈絡：遊戲、環境、狀態、工作狀態與 deep link。
3. 環境矩陣：每遊戲三環境的版本、健康、狀態與 allowed action。
4. 待發布佇列：Version／Artifact、風險通道、驗證、必要核准與目標環境。
5. 發布詳情與確認：檢查結果、差異、風險、理由及執行結果。
6. 歷程與替代狀態：audit、失敗、回復、empty、Forbidden。

<!-- PAGE_VISUAL_START -->
<figure class="page-anatomy lifecycle-anatomy lifecycle-anatomy--environments" aria-label="環境與發布六區塊畫面示意">
  <div class="lifecycle-anatomy__canvas">
    <a class="anatomy-zone lifecycle-anatomy__cards lifecycle-anatomy__cards--four" href="#4-環境摘要" aria-label="前往第一區，環境摘要"><span class="anatomy-zone__number">01</span><span><small>Production</small><strong>14</strong><i>Active Release</i></span><span><small>DEMO</small><strong>12</strong><i>候選驗證</i></span><span><small>Test</small><strong>16</strong><i>快速 build</i></span><span><small>待發布</small><strong>2</strong><i>快速／高風險</i></span></a>
    <a class="anatomy-zone lifecycle-anatomy__filters" href="#5-查詢與環境矩陣" aria-label="前往第二區，查詢與遊戲脈絡"><span class="anatomy-zone__number">02</span><strong>查詢與遊戲脈絡</strong><i>遊戲 ID／名稱</i><i>環境</i><i>環境狀態</i><i>發布工作狀態</i><i>版本</i><b>查詢</b></a>
    <a class="anatomy-zone lifecycle-anatomy__matrix" href="#5-查詢與環境矩陣" aria-label="前往第三區，環境矩陣"><span class="anatomy-zone__number">03</span><strong>環境矩陣</strong><span><b>Production</b>v2.4.1 · Active · Healthy · 發布／回滾</span><span><b>DEMO</b>v2.5.0-rc1 · 驗證通過 · 晉級</span><span><b>Test</b>v2.5.1-dev · build-522 · 重新發布</span></a>
    <a class="anatomy-zone lifecycle-anatomy__table" href="#6-待發布佇列" aria-label="前往第四區，待發布佇列"><span class="anatomy-zone__number">04</span><strong>待發布佇列</strong><small>工作 ID　遊戲　目標環境　程式／數值／素材／設定版本　驗證　審核　建立時間　操作</small><i>rel-20260814-0021　星際寶藏　DEMO　v2.5.0 / math-18 / asset-07 / cfg-05　Passed　Approved　10:18</i></a>
    <div class="lifecycle-anatomy__split">
      <a class="anatomy-zone lifecycle-anatomy__detail" href="#7-發布詳情與操作" aria-label="前往第五區，發布詳情與操作"><span class="anatomy-zone__number">05</span><small>RELEASE DETAIL</small><strong>發布前檢查 8 / 8</strong><i>組合差異 · 影響範圍 · 健康檢查 · 理由 · 版本鎖</i></a>
      <a class="anatomy-zone lifecycle-anatomy__states" href="#9-頁面狀態與錯誤處理" aria-label="前往第六區，歷程與替代狀態"><span class="anatomy-zone__number">06</span><strong>歷程與替代狀態</strong><i>執行中</i><i>部分失敗</i><i>版本衝突</i><i>回復</i><i>Forbidden</i></a>
    </div>
  </div>
  <div class="page-anatomy__legend"><span><i></i>三環境 Release</span><span><i></i>快速／高風險通道</span><small>內容原型已完成；正式發布副作用仍待 Backend／CI/CD。</small></div>
</figure>
<!-- PAGE_VISUAL_END -->

## 4. 環境摘要

- Production／DEMO 統計目前具 Active Release 的可服務遊戲；Test 統計已發布／驗證項目；待發布統計進行中的 Releases。
- 摘要使用完整 Provider scope，顯示最後更新與來源狀態；不得將 Test 算入前兩者。
- 點擊摘要只設定下方列表 scope，不執行操作。

## 5. 查詢與環境矩陣

查詢條件：`game_id`／名稱、environment、global availability、Release status、Version。由 `/games` deep link 進入時套用精確 `game_id` 與 environment。

每遊戲 × 環境至少顯示：遊戲、環境、Active Version／Release、Build／Artifact、狀態、服務健康、pending release、最後變更、GGAP 同步摘要、allowed actions。Test 對唯讀者無操作；編輯者可建立／重試 Test Release。

狀態維度必須分開：環境可服務狀態、部署狀態、發布工作狀態、審核狀態、GGAP 同步狀態，禁止用單一 status 覆蓋。

## 6. 待發布佇列

列表至少含 Release ID、遊戲、目標環境、Version／Build／Artifact checksum、風險通道、驗證、必要核准、建立人、排程與建立／更新時間、操作。預設依 Production、驗證失敗、等待高風險核准、排程時間排序。

- 只有通過完整性與相容性檢查的 Release 可執行；Production 必須證明同一 Artifact 已通過 DEMO。
- 同一 `game_id × environment` 同時只能有一個會改變生效版本的 active job；正式併發策略待核准。
- 刪除已執行工作不允許；草稿取消需保留 audit。

## 7. 發布詳情與操作

大型 Dialog／內容區包含：目標 snapshot、目前與目標組合差異、發布前檢查、環境健康、影響範圍、GGAP 依賴、審核、執行 timeline 與 audit。

| 動作 | 前置條件 |
| --- | --- |
| Test 發布／重試 | 編輯者；Version 可建置、Artifact 完整、環境可用。 |
| DEMO 發布 | Candidate 與確切 Artifact；整合檢查通過。 |
| Production 發布 | Approved、同一 Artifact 已通過 DEMO、自動檢查通過；一般一人確認，高風險第二人核准。 |
| 進入維護 | Production／DEMO；必填理由與時間；阻擋新 Launch。 |
| 結束維護 | 最新健康檢查通過；必填理由。 |
| 暫停／緊急停用 | Provider 先立即拒絕新 Launch，再可靠通知 GGAP；緊急權限者可單人執行。 |
| 回滾 | 目標 Artifact 曾成功、仍安全且相容；建立新 Release Record，不改寫歷史。 |

操作需 idempotency key、optimistic concurrency、allowed actions、結果與 trace。前端 mock 不得顯示為正式成功。

## 8. GGAP 與跨頁依賴

- 上游：遊戲設定、已核准數值、程式版本、素材版本組成發布輸入。
- 下游：遊戲列表取得環境 snapshot；官網／大廳只引用可公開的遊戲資料，不建立另一套主資料。
- Provider `available` 需等待 GGAP ACK 才對外開放；維護、暫停、隔離與退役先由 Provider 本地拒絕新 Launch，再以可靠 outbox／等價機制通知 GGAP。
- GGAP 只接收 Provider 全域狀態與 Active Release 整合結果；代理商個別開放由 GGAP 控制。正式 event name、payload 與 ACK 取得後 Mapping。

## 9. 頁面狀態與錯誤處理

支援 loading、empty、query error、partial source failure、preflight failed、approval pending／rejected、queued、running、succeeded、failed、rollback required、conflict、stale、Forbidden。失敗不得改變畫面至成功狀態；重新整理後需能由 job ID 恢復進度。

## 10. API 契約草案

| 能力 | 必要輸出／行為 |
| --- | --- |
| 摘要／矩陣 | 三環境 snapshot、狀態維度、pending job、allowed actions。 |
| Version／Artifact 預檢 | Version 參照、Build、manifest、checksum、DEMO evidence、warnings／blocking errors。 |
| 發布操作 | Release ID、風險通道、idempotency、status、trace、audit。 |
| 歷程／詳情 | before／target／result Active Release、actor、必要 approval、timeline。 |

正式 path、schema、狀態機、補償與權限依 `TBD-DOM-003`、`TBD-API-005`、`TBD-SEC-003`、`TBD-NFR-003`。

## 11. 響應式、無障礙與驗收

本頁使用 Portal `1500px` 寬版。Desktop 顯示三欄矩陣與寬表；Mobile 依遊戲分組呈現三環境卡片，操作需保留明確目標、理由與確認。Dialog 管理焦點，狀態不只靠顏色。

驗收條件：三環境獨立；Test 可依權限快速發布；Production 使用 DEMO 同一 Artifact；Version／Artifact／Release／Active Release 分離；一般／高風險通道正確；回滾建立新紀錄；既有 Round 固定原版本；GGAP 代理商開關不出現在本頁；所有替代狀態可驗收。

## 12. 測試重點

- Test 多次 build、同一 Artifact 晉級 DEMO／Production 與跨環境 deep link。
- 缺版本、相容性失敗、核准拒絕、版本衝突、重複送出與頁面重載。
- 維護／停用期間新 Launch 與既有 Round Settle／Callback。
- GGAP 上架未 ACK 不對外開放；停用未 ACK 時 Provider 仍立即阻擋並持續重試。
- 390px 操作確認、鍵盤、長版本號與 timeline。

## 13. 待確認事項

- `TBD-DOM-003`、`TBD-DOM-006`：現有 schema／enum 與 DP03 Release／環境模型的 Mapping。
- `TBD-API-001`、`TBD-API-005`：共通及發布 API。
- `TBD-SEC-001`、`TBD-SEC-003`：permission、核准、併發與 audit。
- `TBD-NFR-003`、`TBD-NFR-004`：冪等／補償、響應式與可存取性。
- `TBD-EXT-001`、`TBD-EXT-003`：GGAP 與系統權限規格。

## 14. 正式實作接軌條件

環境矩陣、待發布佇列、快速／高風險通道、詳情／預檢、回滾、全域可用性與替代狀態已完成原型及 UI 驗收。正式上線前仍須接入持久化 API、CI/CD、permission、audit、補償與 GGAP 契約；不得把目前 mock 成功訊息視為真實發布完成。
