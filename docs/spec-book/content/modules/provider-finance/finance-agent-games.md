# 代理商 × 遊戲彙總

## 章節狀態

| 項目 | 內容 |
| --- | --- |
| 規格成熟度 | Draft — Batch A 完整頁面規格 |
| 製作範圍 | Active |
| 對應路由 | `/finance/agent-games` |
| 前端元件 | `src/views/Finance/AgentGames.vue` |
| 主要來源 | `GAME_VENDOR_FINANCE_AGENT_GAME_SPEC.md`、`GAME_VENDOR_FINANCE_REPORTING_SPEC.md` |
| 資料環境 | Production only |
| 統計時間 | `settled_at` |
| 聚合鍵 | `agent_id × game_id` |

> 本頁使用代理商識別作交易脈絡與聚合維度，不表示 Provider 建立或管理代理商主資料。正式代理商快照、公式、API、權限與大量匯出仍由集中 TBD 管理。

## 1. 目的與使用情境

本頁讓 Provider 財務與營運人員將正式 Game Round 依「代理商 × 遊戲」分組，辨識各組投注、派彩、玩家輸贏與活動量，並從分組結果帶入條件回查來源 Game Round。

主要使用情境：

1. 比較不同代理商脈絡下各款遊戲的財務表現。
2. 依時間、代理商、遊戲類型或單款遊戲縮小彙總範圍。
3. 查看完整篩選集合的財務摘要，再檢視分組列表。
4. 依任一數值欄排序並分頁瀏覽。
5. 點選某組前往 `/reports`，回查構成該組的 Game Round。
6. 自訂匯出欄位與格式，輸出完整篩選結果。

## 2. 範圍與責任邊界

### 2.1 本頁包含

- 有效 Production Game Round 的代理商 × 遊戲聚合。
- 財務與活動摘要、排序、分頁、空白狀態與匯出設定。
- 代理商 ID／名稱與遊戲 ID／名稱的歷史脈絡顯示。
- 帶入代理商、遊戲及時間條件前往 Game Round 紀錄。

### 2.2 本頁不包含

- 代理商、商戶或會員主資料的建立、編輯、停用與權限設定。
- GGAP 對已上架遊戲的代理商個別開放控制。
- DEMO、Test、GGAP 平台帳務、錢包、分潤、結算或對帳工作流。
- 本頁專屬的 Game Round 詳情；單筆詳情統一由 `/reports` 提供。
- 修改財務聚合或來源 Game Round。

### 2.3 資料可見性與權限原則

- 所有結果先限制登入 Provider scope，再套用授權代理商交易脈絡。
- 代理商選項不得暴露未與本 Provider 產生授權關係或交易脈絡的資料。
- 列表、摘要、deep link 與匯出必須使用相同 scope；後端不得信任 URL 傳入的 `agent_id`。
- 代理商及會員識別的遮罩、複製與查詢權限等待 `TBD-SEC-002`。

## 3. 名詞與計算口徑

| 名詞／指標 | Draft 定義 |
| --- | --- |
| 聚合列 | 同一查詢範圍內，相同 `agent_id` 與 `game_id` 的有效 Game Round 集合。 |
| 代理商顯示 | `agent_id` 為穩定識別；名稱為交易時或核准策略所決定的快照，不是 Provider 主資料。 |
| 投注筆數 | 該聚合列的有效 settled Game Round 數量。 |
| 玩家人數 | 該聚合列內不重複 `member_id` 數量。 |
| 投注／派彩 | 該聚合列 `bet_points`／`payout_points` 的加總。 |
| 玩家淨輸贏 | `payout_points - bet_points`，以玩家角度顯示。 |
| GGR | Prototype 暫用 `bet_points - payout_points`。 |
| 平均投注額 | 投注總額 ÷ 投注筆數；分母為 0 顯示 `—`。 |
| 人均投注額 | 投注總額 ÷ 該列不重複玩家人數；分母為 0 顯示 `—`。 |

共同原則：

- 頁面摘要的玩家人數是完整篩選集合的 distinct union，不是各聚合列人數相加。
- `agent_id × game_id` 才是聚合鍵；名稱變更不得無意間拆成兩列。
- Provider 點數主顯示；USDT 聚合每筆 Round 保存值，不使用目前匯率重算。
- 統計時間使用 `settled_at`，且只含有效 Production Game Round。

## 4. 資訊架構與頁面區塊

頁面分為六個區塊：

1. 查詢範圍：快速時間、時間區間、代理商、遊戲類型及單款遊戲。
2. 查詢摘要：投注、派彩、玩家淨輸贏、GGR、投注筆數、玩家人數。
3. 彙總列表：代理商 × 遊戲的 11 個主要欄位。
4. 排序與分頁：完整集合先排序，再由伺服器分頁。
5. Game Round 導流：每列帶入條件前往 `/reports`。
6. 匯出與替代狀態：自訂欄位 Dialog、Empty、Error、Forbidden 與匯出生命週期。

<!-- PAGE_VISUAL_START -->
<figure class="page-anatomy finance-anatomy finance-anatomy--agent-games" aria-label="代理商乘遊戲彙總六區塊畫面示意">
  <div class="finance-anatomy__canvas">
    <a class="anatomy-zone finance-anatomy__filter" href="#5-查詢條件" aria-label="前往第一區，查詢條件規格">
      <span class="anatomy-zone__number">01</span><span class="finance-anatomy__eyebrow">QUERY SCOPE</span><strong>查詢條件</strong><small>固定 Production · 僅有效 settled Game Round</small>
      <span class="finance-anatomy__quick"><i>今日</i><i>昨日</i><i class="is-active">近 7 日</i><i>近 30 日</i><i>自訂</i></span>
      <span class="finance-anatomy__fields"><i>時間區間　2026/08/08 — 2026/08/14</i><i>代理商　全部代理商</i><i>遊戲類型　全部</i><i>單款遊戲　全部</i><b>⌕ 查詢</b></span>
    </a>
    <a class="anatomy-zone finance-anatomy__summary finance-anatomy__summary--six" href="#6-查詢摘要" aria-label="前往第二區，查詢摘要規格">
      <span class="anatomy-zone__number">02</span><span class="finance-anatomy__section-label">查詢摘要</span>
      <span class="finance-anatomy__stat"><small>投注總額</small><strong>12.46M pt</strong><i>≈ 124,600 USDT</i></span>
      <span class="finance-anatomy__stat"><small>派彩總額</small><strong>11.93M pt</strong><i>≈ 119,300 USDT</i></span>
      <span class="finance-anatomy__stat"><small>淨輸贏</small><strong>−530K pt</strong><i>玩家角度</i></span>
      <span class="finance-anatomy__stat"><small>GGR</small><strong>+530K pt</strong><i>Draft</i></span>
      <span class="finance-anatomy__stat"><small>投注筆數</small><strong>84,120</strong><i>有效 Round</i></span>
      <span class="finance-anatomy__stat"><small>玩家人數</small><strong>1,284</strong><i>全範圍不重複</i></span>
    </a>
    <a class="anatomy-zone finance-anatomy__ranking finance-anatomy__ranking--agent" href="#7-彙總列表規格" aria-label="前往第三區，彙總列表規格">
      <span class="anatomy-zone__number">03</span><span class="finance-anatomy__section-label">代理商 × 遊戲明細彙總</span><small>共 18 組 · 先排序，再分頁</small><span class="finance-anatomy__export">⇩ 匯出</span>
      <span class="finance-anatomy__table finance-anatomy__table--agent"><b>代理商</b><b>遊戲</b><b>類型</b><b>投注筆數</b><b>玩家</b><b>投注總額</b><b>GGR</b><i>Aurora · A031</i><i>Celestial Vault</i><i>老虎機</i><i>18,420</i><i>328</i><i>2.84M pt</i><i>+128K pt</i><i>Northstar · B204</i><i>Neon Drift</i><i>Crash</i><i>15,980</i><i>294</i><i>2.41M pt</i><i>−75K pt</i></span>
    </a>
    <div class="finance-anatomy__footer-grid">
      <a class="anatomy-zone finance-anatomy__compact" href="#8-排序與分頁" aria-label="前往第四區，排序與分頁規格"><span class="anatomy-zone__number">04</span><span class="finance-anatomy__section-label">排序與分頁</span><strong>GGR ↓</strong><small>1–10 / 18　‹　›　每頁 10</small></a>
      <a class="anatomy-zone finance-anatomy__compact" href="#9-game-round-導流" aria-label="前往第五區，Game Round 導流規格"><span class="anatomy-zone__number">05</span><span class="finance-anatomy__section-label">Game Round 導流</span><strong>↗ 查看明細</strong><small>帶入時間、agent_id、game_id</small></a>
      <a class="anatomy-zone finance-anatomy__compact finance-anatomy__compact--state" href="#11-頁面狀態與錯誤處理" aria-label="前往第六區，頁面狀態與錯誤處理規格"><span class="anatomy-zone__number">06</span><span class="finance-anatomy__section-label">匯出與替代狀態</span><strong>必要欄位 🔒 · 可選欄位</strong><small>Empty · Error · Forbidden · Export job</small></a>
    </div>
  </div>
  <div class="page-anatomy__legend"><span><i></i>主要閱讀順序</span><span><i></i>原型化財務資料</span><small>參照現行 `/finance/agent-games` 原型；代理商名稱與金額皆為 mock。</small></div>
</figure>
<!-- PAGE_VISUAL_END -->

## 5. 查詢條件

| 介面欄位 | 技術欄位 | 型別 | 必填 | 預設 | 規則 |
| --- | --- | --- | --- | --- | --- |
| 快速時間 | `quick_range` | UI state | 否 | 近 7 日 | 今日、昨日、近 7 日、近 30 日、自訂。 |
| 起始時間 | `from` | ISO 8601 datetime | 是 | 近 7 日起點 | 統計欄位固定 `settled_at`。 |
| 結束時間 | `to` | ISO 8601 datetime | 是 | 當日終點 | 不得早於起始時間。 |
| 代理商 | `agent_id` | string | 否 | 全部代理商 | 顯示快照名稱，送穩定 ID。 |
| 遊戲類型 | `game_type` | enum | 否 | 全部類型 | 沿用遊戲主資料。 |
| 單款遊戲 | `game_id` | string | 否 | 全部遊戲 | 顯示 `{game_name} · {game_id}`。 |

- 按「查詢」後才套用；「重置」回到近 7 日與全部維度。
- 結束時間早於起始時間時不送 request，欄位附近顯示錯誤。
- 套用條件同步至 URL query，供重新整理與跨頁返回。
- 若 `game_id` 不屬於選定 `game_type`，前端清除不相容值或提示；後端回傳欄位驗證錯誤。
- 代理商選項載入失敗時不可顯示無限制的自由輸入替代方案。

## 6. 查詢摘要

六張卡依序顯示投注總額、派彩總額、玩家淨輸贏、GGR、投注筆數、玩家人數。

- 摘要使用完整 applied filters，不受列表排序與分頁限制。
- 玩家人數以完整集合 distinct 計算；不可加總列表每列玩家人數。
- 金額主值為 Provider 點數，USDT 次值由保存的 Round 對照值加總。
- 公式說明可透過 tooltip 或可聚焦輔助按鈕查看。
- 0、負值與無法計算均有不同顯示，不只靠顏色。

## 7. 彙總列表規格

### 7.1 欄位順序

| 順序 | 介面欄位 | 技術欄位 | 顯示／計算規則 |
| ---: | --- | --- | --- |
| 1 | 代理商 | `agent_name`、`agent_id` | 名稱主顯示、ID 次顯示；名稱為快照。 |
| 2 | 遊戲 | `game_name`、`game_id` | 名稱主顯示、ID 次顯示。 |
| 3 | 遊戲類型 | `game_type` | 繁中標籤。 |
| 4 | 投注筆數 | `round_count` | 有效 settled Game Round 數量。 |
| 5 | 玩家人數 | `distinct_player_count` | 該列內不重複玩家。 |
| 6 | 投注總額 | `bet_points`、`bet_usdt` | 點數主值、USDT 次值。 |
| 7 | 派彩總額 | `payout_points`、`payout_usdt` | 點數主值、USDT 次值。 |
| 8 | 玩家淨輸贏 | `player_net_points`、`player_net_usdt` | 顯示正負與玩家角度。 |
| 9 | GGR | `ggr_points`、`ggr_usdt` | Draft 公式，顯示正負。 |
| 10 | 平均投注額 | `average_bet_points`、`average_bet_usdt` | 投注總額 ÷ Round 數。 |
| 11 | 人均投注額 | `bet_per_player_points`、`bet_per_player_usdt` | 投注總額 ÷ 該列不重複玩家。 |
| 固定操作 | 查看明細 | — | 帶入條件前往 `/reports`。 |

### 7.2 顯示規則

- 前兩欄在 Desktop 可凍結；操作欄固定於右側，但不能遮住資料或造成整頁 overflow。
- 表頭公式說明須可由鍵盤觸發，不能只依 hover。
- ID 與長名稱支援截斷並提供完整值；是否允許複製依資料分級。
- 數字採 tabular numerals 並靠右；幣別與單位不可只放在頁面其他位置。
- 點擊整列與「查看明細」結果一致；列內排序或複製控制不得誤觸導流。

## 8. 排序與分頁

- 所有 11 個顯示欄位可排序；預設 `bet_points desc`，同值以 `agent_id asc, game_id asc` 穩定排序。
- 第一次點欄位採升冪，再次點擊切換降冪；目前欄位與方向需有文字／ARIA 狀態。
- 正式資料由伺服器先對完整結果排序，再分頁；禁止只排序目前頁。
- 預設每頁 10 筆，建議選項 10、20、50；切換筆數回第一頁。
- 回應需提供 `total`、目前 offset／cursor 與穩定排序資訊。
- 新查詢後回第一頁；若資料更正使目前頁失效，導向最後有效頁並提示。

## 9. Game Round 導流

點擊聚合列或「查看明細」前往 `/reports`，帶入：

| Query | 來源 | 規則 |
| --- | --- | --- |
| `environment=production` | 固定 | 不可切換為 DEMO／Test。 |
| `from`、`to` | applied filters | 保持原時間與時區語意。 |
| `agent_query` | row `agent_id` | `/reports` 正式名稱待共通 API／URL 契約統一。 |
| `game_type` | row `game_type` | 作輔助條件。 |
| `game_query` | row `game_id` | 精確遊戲範圍。 |

- `/reports` 必須再次執行 Provider scope 與權限驗證。
- 若目標條件過期或不再授權，顯示安全的 Empty／Forbidden，不可回退為未篩選全表。
- 返回本頁時應還原原查詢、排序及分頁。
- 正式 query key 與最大 URL 資料範圍由 `TBD-API-002`、`TBD-API-003` 核准。

## 10. 匯出規格

### 10.1 匯出範圍

- 匯出完整 applied filters 結果，先使用正式排序，不受目前頁限制。
- 無資料時停用；權限不足不得建立工作。
- 格式目標為 XLSX、CSV；正式支援格式待核准。

### 10.2 必要欄位

必要欄位固定保留且不可取消：代理商 ID、代理商名稱、遊戲 ID、遊戲名稱、遊戲類型、查詢時間區間、報表產生時間、時區。

### 10.3 可選欄位群組

| 群組 | 欄位 |
| --- | --- |
| 活躍數據 | 投注筆數、不重複玩家人數 |
| 金額數據 | 投注、派彩、玩家淨輸贏、GGR |
| 效率指標 | 平均投注額、人均投注額 |
| 貨幣欄位 | Provider 點數、USDT 對照 |

- 至少選擇一組資料欄位；若只允許必要欄位，也必須清楚說明輸出內容。
- 匯出設定 Dialog 開啟後焦點進入標題或第一個控制，關閉後回到觸發按鈕。
- 同步／非同步、上限、檔案加密、下載 URL、保存、失效與 audit 等待 `TBD-SEC-004`、`TBD-NFR-001`。
- 通知中心尚 Deferred；匯出完成不能只依賴站內通知。

## 11. 頁面狀態與錯誤處理

| 狀態 | 必要介面與行為 |
| --- | --- |
| 首次載入 | 篩選、摘要及表格以 skeleton 保留布局；不可先顯示 0。 |
| 重新查詢 | 保留條件並避免舊 request 覆蓋新結果。 |
| 無資料 | 顯示「查無符合條件的彙總資料」、Production 範圍與重置入口。 |
| 查詢失敗 | 保留條件，顯示重試與 trace ID，不以 Empty 代替。 |
| 權限不足 | 不顯示快取內容；提供返回安全頁面的入口。 |
| 列表局部失敗 | 摘要若仍有效需標示不同資料時間；不得假裝完整一致。 |
| 匯出處理 | 已受理、處理中、完成、失敗、過期；防止重複建立。 |
| 導流失敗 | 保持目前列與頁面狀態，提示可重試。 |

## 12. API 契約草案

> Draft：以下能力不代表正式 endpoint。共通 envelope 由 `TBD-API-001`，財務聚合由 `TBD-API-003`，Round deep link 由 `TBD-API-002` 管理。

| 能力 | 建議輸入 | 必要輸出 |
| --- | --- | --- |
| 查詢摘要與列表 | filters、sort、page／cursor | summary、rows、total、data version、calculated time |
| 查詢篩選選項 | Provider scope、可選 search | 授權代理商脈絡、遊戲與類型選項 |
| 建立匯出 | filters、sort、fields、format | job ID、狀態、到期資訊 |
| 查詢匯出 | job ID | 狀態、失敗原因、安全下載資訊 |

每列至少包含穩定 `agent_id`、`game_id`、顯示快照、11 項欄位值、點數／USDT 與口徑版本。後端必須：

- 在資料庫或聚合層計算完整集合，不依賴前端加總。
- 以 decimal 保存金額，提供明確單位與精度。
- 使用 allowlist 驗證排序欄位與方向。
- 保證分頁排序穩定，資料更正後可辨識版本變化。
- 驗證 Provider scope、代理商交易脈絡與匯出權限。

## 13. 響應式與可存取性

- 不使用 page-level `max-width`；表格在自身容器水平捲動。
- 1360px 以下：摘要由六欄降為三欄；篩選降為兩欄。
- 900px 以下：結果工具列改直向，結果數與匯出仍可操作。
- 640px 以下：篩選與摘要單欄，操作按鈕可滿寬，匯出欄位單欄。
- 固定欄與操作 rail 在窄螢幕不可同時擠壓內容；可取消 frozen，保留水平捲動。
- 排序按鈕、列導流、分頁及 Dialog 全程可用鍵盤；目前排序以 `aria-sort` 或等價方式宣告。
- 狀態、正負與選取不能只靠顏色；390px、200% zoom 不造成整頁 overflow。

## 14. 前端實作要求

- 分離 draft filters、applied filters、sort、pagination、summary、rows 與 export state。
- 查詢、排序、換頁更新 URL；返回頁面可還原狀態。
- 正式資料來源接入後移除 production runtime mock fallback。
- 不在前端重算正式總摘要或跨頁 distinct players。
- 避免 row click 與操作按鈕觸發兩次導航。
- 對過期 request、重複匯出與 Dialog focus restoration 建立自動測試。

## 15. 後端實作要求

- 強制 Provider、Production、有效 Round 與授權代理商 scope。
- 以 `agent_id × game_id` 聚合，名稱只作顯示快照。
- 摘要 distinct players 使用完整集合；每列 distinct 使用各分組集合。
- 支援穩定 server-side sort／pagination 與可重現匯出。
- 回應含 `calculated_at`、`timezone`、`data_version`、口徑版本與 trace ID。
- 高成本查詢與匯出記錄操作者、條件摘要、結果數、狀態與稽核資訊。

## 16. 整合與資料一致性

- 與 `/finance` 共用有效 Round、時間、金額、匯率與財務公式。
- 與 `/reports` 共用穩定 Game Round 查詢欄位與權限語意。
- 代理商識別來自 GGAP 交易脈絡或核准快照，Provider 不建立另一套主資料。
- 來源 Round 更正後，財務總覽、代理商 × 遊戲、匯出與 `/reports` 必須能由版本／時間解釋差異。
- GGAP 與系統設定 Deferred 只作依賴，不由本頁推定其 API、角色或管理畫面。

## 17. 驗收條件

### 17.1 功能驗收

- 六區塊示意與詳細規格一致；六張摘要與 11 欄列表使用同一 applied filters。
- 所有允許欄位可穩定排序，分頁後順序不跳動。
- deep link 正確帶入時間、代理商與遊戲，返回時還原狀態。
- 匯出必要／可選欄位、格式及完整結果語意符合規格。

### 17.2 權限與隔離驗收

- 無法透過篩選選項、URL、排序、分頁、deep link 或匯出取得其他 Provider 或未授權代理商資料。
- 代理商／會員敏感識別依核准規則遮罩與稽核。

### 17.3 體驗與可存取性驗收

- Desktop、900px、640px、390px 無整頁水平 overflow。
- 排序、分頁、列導流與匯出 Dialog 可用鍵盤完成，焦點可預期。
- Empty、Error、Forbidden、Export status 不只依顏色辨識。

### 17.4 技術驗收

- 摘要 distinct players 不等於分組列加總，並有固定測試資料驗證。
- server-side sort 在跨頁與同值情況保持穩定。
- 點數／USDT、精度、快照與資料版本可被重現。

## 18. 測試情境清單

| 類別 | 核心情境 |
| --- | --- |
| 正常流程 | 預設查詢、各篩選組合、各欄排序、換頁、deep link、返回還原。 |
| 計算 | 跨列重複玩家、0 分母、正負值、不同匯率版本、名稱變更。 |
| 邊界值 | 無資料、最後一頁、同值排序、最大期間、長 ID／名稱。 |
| 錯誤 | 逾時、局部失敗、過期 request、導流失敗、匯出失敗／過期。 |
| 權限 | 越權 agent_id、直接 URL、匯出繞過、快取資料。 |
| 響應式 | 1440px、1360px、900px、640px、390px、200% zoom、表格捲動。 |

## 19. 待確認事項

| 集中 TBD | 本頁待確認內容 | 阻擋範圍 |
| --- | --- | --- |
| `TBD-DOM-001`、`TBD-DOM-002` | 有效 Round、公式、取消／更正與正負方向 | Backend、QA、Release |
| `TBD-DAT-001`、`TBD-DAT-002`、`TBD-DAT-003`、`TBD-DAT-004` | 精度、代理商／會員快照、時區與資料更正 | Backend、Integration、QA |
| `TBD-API-001`、`TBD-API-002`、`TBD-API-003` | 查詢、排序、分頁、deep link、匯出與 schema | Frontend、Backend、QA |
| `TBD-SEC-001`、`TBD-SEC-002`、`TBD-SEC-004`、`TBD-EXT-003` | scope、遮罩、匯出與 audit | Frontend、Backend、Release |
| `TBD-NFR-001` | 大量聚合、分頁與匯出效能 | Backend、SRE、QA |
| `TBD-EXT-001` | GGAP 正式代理商識別與整合契約 | Integration、Backend、Release |

## 20. 規格完成條件

升為 Confirmed 前必須完成：

- 核准代理商識別／名稱快照、有效 Round、財務公式、精度與匯率規則。
- 核准查詢、摘要、排序、分頁、deep link 與匯出 API。
- 核准財務檢視、識別遮罩、匯出 permission key 與 audit。
- 使用正式契約資料完成計算、權限、Desktop／Mobile、效能與匯出驗收。
