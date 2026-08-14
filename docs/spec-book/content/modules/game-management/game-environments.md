# 環境與發布

## 章節狀態

| 項目 | 內容 |
| --- | --- |
| 規格成熟度 | Draft — Batch C 完整頁面規格 |
| 製作範圍 | Active |
| 對應路由 | `/games/environments` |
| 前端元件 | `src/views/Provider/Placeholder.vue`（GameEnvironments） |
| 目前原型 | Placeholder blueprint；尚無正式發布操作 |
| 頁面角色 | Provider Production／DEMO 全域啟用、維護、停用與歷程 |

> 本規格建立目標頁面與流程骨架，不宣告 Placeholder 已完成實作。Provider 只控制遊戲全域狀態；GGAP 對已上架遊戲的代理商個別開放仍屬 GGAP，正式整合等待外部規格。

## 1. 目的與責任邊界

- 比較同一遊戲在 Production、DEMO、Test 的目前版本、狀態、健康與可用動作。
- 對已完成部署與驗證的發布組合，執行 Production／DEMO 啟用、維護、停用與回復。
- 顯示發布前檢查、進行中工作、結果、失敗原因及不可變操作歷程。
- Test 只讀，版本部署與更新由前後端／DevOps 負責；Portal 不提供操作。
- DEMO 資料隔離；不得進入正式 Game Round、財務或 Provider 風控。

## 2. 發布組合與 Guardrail

Draft 發布組合至少包含 `game_id`、程式版本、已核准數值版本、素材版本、設定版本、目標環境與組合 checksum。正式關聯與鎖定規則依 `TBD-DOM-003`。

- Production／DEMO 可生效不同組合；不得要求同步。
- 啟用、維護、停用只影響新 Launch；既有 Game Round 必須依規則完成 Settle、Callback 與 audit。
- Production 操作需權限、確認、版本併發與 audit；雙人核准待 `TBD-SEC-003`。
- GGAP 同步只顯示外部結果，不允許在本頁操作代理商個別開關。

## 3. 六區塊資訊架構

1. 環境摘要：Production、DEMO、Test 與待發布數量。
2. 查詢與遊戲脈絡：遊戲、環境、狀態、工作狀態與 deep link。
3. 環境矩陣：每遊戲三環境的版本、健康、狀態與 allowed action。
4. 待發布佇列：發布組合、驗證、審核與目標環境。
5. 發布詳情與確認：檢查結果、差異、風險、理由及執行結果。
6. 歷程與替代狀態：audit、失敗、回復、empty、Forbidden。

<!-- PAGE_VISUAL_START -->
<figure class="page-anatomy lifecycle-anatomy lifecycle-anatomy--environments" aria-label="環境與發布六區塊畫面示意">
  <div class="lifecycle-anatomy__canvas">
    <a class="anatomy-zone lifecycle-anatomy__cards lifecycle-anatomy__cards--four" href="#4-環境摘要" aria-label="前往第一區，環境摘要"><span class="anatomy-zone__number">01</span><span><small>Production</small><strong>14</strong><i>可服務遊戲</i></span><span><small>DEMO</small><strong>12</strong><i>隔離環境</i></span><span><small>Test</small><strong>16</strong><i>只讀監控</i></span><span><small>待發布</small><strong>2</strong><i>待驗證／核准</i></span></a>
    <a class="anatomy-zone lifecycle-anatomy__filters" href="#5-查詢與環境矩陣" aria-label="前往第二區，查詢與遊戲脈絡"><span class="anatomy-zone__number">02</span><strong>查詢與遊戲脈絡</strong><i>遊戲 ID／名稱</i><i>環境</i><i>環境狀態</i><i>發布工作狀態</i><i>版本</i><b>查詢</b></a>
    <a class="anatomy-zone lifecycle-anatomy__matrix" href="#5-查詢與環境矩陣" aria-label="前往第三區，環境矩陣"><span class="anatomy-zone__number">03</span><strong>環境矩陣</strong><span><b>Production</b>v2.4.1 · 上架 · Healthy · 維護／停用</span><span><b>DEMO</b>v2.5.0-rc1 · 待啟用 · Healthy · 啟用</span><span><b>Test</b>v2.5.1-dev · 已部署 · 只讀</span></a>
    <a class="anatomy-zone lifecycle-anatomy__table" href="#6-待發布佇列" aria-label="前往第四區，待發布佇列"><span class="anatomy-zone__number">04</span><strong>待發布佇列</strong><small>工作 ID　遊戲　目標環境　程式／數值／素材／設定版本　驗證　審核　建立時間　操作</small><i>rel-20260814-0021　星際寶藏　DEMO　v2.5.0 / math-18 / asset-07 / cfg-05　Passed　Approved　10:18</i></a>
    <div class="lifecycle-anatomy__split">
      <a class="anatomy-zone lifecycle-anatomy__detail" href="#7-發布詳情與操作" aria-label="前往第五區，發布詳情與操作"><span class="anatomy-zone__number">05</span><small>RELEASE DETAIL</small><strong>發布前檢查 8 / 8</strong><i>組合差異 · 影響範圍 · 健康檢查 · 理由 · 版本鎖</i></a>
      <a class="anatomy-zone lifecycle-anatomy__states" href="#9-頁面狀態與錯誤處理" aria-label="前往第六區，歷程與替代狀態"><span class="anatomy-zone__number">06</span><strong>歷程與替代狀態</strong><i>執行中</i><i>部分失敗</i><i>版本衝突</i><i>回復</i><i>Forbidden</i></a>
    </div>
  </div>
  <div class="page-anatomy__legend"><span><i></i>Provider 全域發布</span><span><i></i>Production 高風險操作</span><small>目標 Draft；現行頁仍為 Placeholder blueprint。</small></div>
</figure>
<!-- PAGE_VISUAL_END -->

## 4. 環境摘要

- Production／DEMO 統計目前可服務遊戲；Test 統計已部署且可觀察項目；待發布統計 active release jobs。
- 摘要使用完整 Provider scope，顯示最後更新與來源狀態；不得將 Test 算入前兩者。
- 點擊摘要只設定下方列表 scope，不執行操作。

## 5. 查詢與環境矩陣

查詢條件：`game_id`／名稱、environment、environment status、release job status、version。由 `/games` deep link 進入時套用精確 `game_id` 與 environment。

每遊戲 × 環境至少顯示：遊戲、環境、生效／部署版本、組合版本、狀態、服務健康、pending release、最後變更、GGAP 同步摘要、allowed actions。Test 的 allowed actions 永遠只讀。

狀態維度必須分開：環境可服務狀態、部署狀態、發布工作狀態、審核狀態、GGAP 同步狀態，禁止用單一 status 覆蓋。

## 6. 待發布佇列

列表至少含 release job ID、遊戲、目標環境、程式／數值／素材／設定版本、組合 checksum、驗證、審核、建立人、建立／更新時間、操作。預設依 Production、驗證失敗、待審核、建立時間排序。

- 只有通過組合完整性與相容性檢查的工作可送審／啟用。
- 同一 `game_id × environment` 同時只能有一個會改變生效版本的 active job；正式併發策略待核准。
- 刪除已執行工作不允許；草稿取消需保留 audit。

## 7. 發布詳情與操作

大型 Dialog／內容區包含：目標 snapshot、目前與目標組合差異、發布前檢查、環境健康、影響範圍、GGAP 依賴、審核、執行 timeline 與 audit。

| 動作 | Draft 前置條件 |
| --- | --- |
| 啟用 | Production／DEMO；部署完成、檢查通過、核准、環境可用、version 未衝突。 |
| 進入維護 | Production／DEMO；必填理由與時間；阻擋新 Launch。 |
| 結束維護 | 最新健康檢查通過；必填理由。 |
| 停用 | Production／DEMO；高風險確認；只阻擋新 Launch。 |
| 回復 | 目標組合仍可用且通過檢查；建立新 release job，不改寫歷史。 |

操作需 idempotency key、optimistic concurrency、allowed actions、結果與 trace。前端 mock 不得顯示為正式成功。

## 8. GGAP 與跨頁依賴

- 上游：遊戲設定、已核准數值、程式版本、素材版本組成發布輸入。
- 下游：遊戲列表取得環境 snapshot；官網／大廳只引用可公開的遊戲資料，不建立另一套主資料。
- GGAP 只接收 Provider 全域上架／Release 的整合結果；代理商個別開放由 GGAP 控制。
- GGAP 正式同步、ACK、錯誤與重試等待 `TBD-EXT-001`，本頁不自行發明契約。

## 9. 頁面狀態與錯誤處理

支援 loading、empty、query error、partial source failure、preflight failed、approval pending／rejected、queued、running、succeeded、failed、rollback required、conflict、stale、Forbidden。失敗不得改變畫面至成功狀態；重新整理後需能由 job ID 恢復進度。

## 10. API 契約草案

| 能力 | 必要輸出／行為 |
| --- | --- |
| 摘要／矩陣 | 三環境 snapshot、狀態維度、pending job、allowed actions。 |
| 組合／預檢 | 版本參照、checksum、validation items、warnings／blocking errors。 |
| 發布操作 | job ID、version、idempotency、status、trace、audit。 |
| 歷程／詳情 | before／target／result snapshot、actor、approval、timeline。 |

正式 path、schema、狀態機、補償與權限依 `TBD-DOM-003`、`TBD-API-005`、`TBD-SEC-003`、`TBD-NFR-003`。

## 11. 響應式、無障礙與驗收

本頁使用 Portal `1500px` 寬版。Desktop 顯示三欄矩陣與寬表；Mobile 依遊戲分組呈現三環境卡片，操作需保留明確目標、理由與確認。Dialog 管理焦點，狀態不只靠顏色。

驗收條件：三環境獨立；Test 無操作；發布組合可追溯四類版本；狀態維度不合併；Production 操作具 preflight／核准／併發／audit 骨架；既有 Round 不受中斷；GGAP 代理商開關不出現在本頁；所有替代狀態可驗收。

## 12. 測試重點

- Production／DEMO 不同版本、Test 只讀與跨環境 deep link。
- 缺版本、相容性失敗、核准拒絕、版本衝突、重複送出與頁面重載。
- 維護／停用期間新 Launch 與既有 Round Settle／Callback。
- GGAP 同步失敗不回滾已核准 Provider 狀態的正式補償策略（待契約）。
- 390px 操作確認、鍵盤、長版本號與 timeline。

## 13. 待確認事項

- `TBD-DOM-003`、`TBD-DOM-006`：發布組合、環境生命週期與 DEMO 模型。
- `TBD-API-001`、`TBD-API-005`：共通及發布 API。
- `TBD-SEC-001`、`TBD-SEC-003`：permission、核准、併發與 audit。
- `TBD-NFR-003`、`TBD-NFR-004`：冪等／補償、響應式與可存取性。
- `TBD-EXT-001`、`TBD-EXT-003`：GGAP 與系統權限規格。

## 14. Placeholder 移除條件

只有目標頁的環境矩陣、待發布佇列、詳情／預檢、替代狀態與只讀 Test 已實作並通過 UI 驗收後，才可移除程式 Placeholder；改為 Confirmed 還需正式生命週期、API、權限與 GGAP 契約核准。
