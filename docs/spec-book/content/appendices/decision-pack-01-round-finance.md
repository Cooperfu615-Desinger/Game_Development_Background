# Decision Pack 01｜Game Round、時間與財務基準

<section class="decision-pack-hero" data-pack="DP / 01" aria-label="Decision Pack 01 摘要">
  <div class="decision-pack-hero__identity">
    <span>PHASE 3 · DECISION DOSSIER 01</span>
    <strong>先統一一筆 Round，再統一所有報表</strong>
    <p>本包已完成五個跨頁 TBD 的初步拆分；目前暫存並等待 GGAP 測試環境實際 Backend Git。既有建議、問題與暫定方向均保留，但不視為正式契約。</p>
  </div>
  <div class="decision-pack-hero__stats">
    <div><strong>05</strong><span>集中 TBD</span></div>
    <div><strong>07</strong><span>直接影響頁面</span></div>
    <div><strong>02</strong><span>P0 Domain</span></div>
    <div><strong>03</strong><span>Data 契約</span></div>
  </div>
  <nav class="decision-pack-hero__nav" aria-label="五項決策快速導覽">
    <a href="#1-game-round-正式生命週期"><b>01</b><span>Round 生命週期</span></a>
    <a href="#2-跨系統識別碼與交易快照"><b>02</b><span>識別與快照</span></a>
    <a href="#3-時間-時區與統計窗口"><b>03</b><span>時間與窗口</span></a>
    <a href="#4-點數-usdt-匯率與精度"><b>04</b><span>點數與 USDT</span></a>
    <a href="#5-正式財務指標與正負方向"><b>05</b><span>財務公式</span></a>
  </nav>
</section>

## 決策包狀態

| 項目 | 內容 |
|---|---|
| 決策包編號 | `DP-01` |
| 成熟度 | Backend Evidence Pending Draft — 已完成初步拆分，等待 GGAP 實際後端證據後重開 |
| 納入 TBD | `TBD-DOM-001`、`TBD-DOM-002`、`TBD-DAT-001`、`TBD-DAT-002`、`TBD-DAT-003` |
| 直接影響頁面 | 遊戲紀錄、財務總覽、代理商 × 遊戲彙總、儀表板、監控總覽、風控報表、風控告警／處理 |
| 不在本包決定 | GGAP 正式欄位／簽章／Callback、API path、permission key、全系統保存年限、棋牌與多人結算 |
| 建議核准順序 | Round 生命週期 → 識別碼 → 時間 → 金額 → 財務公式 |

> 本包不直接變更集中 TBD 狀態。只有責任方確認選項、記錄決議，並同步更新共通規格、頁面、資料字典、enum 與測試後，對應 TBD 才能視為收斂。

## 暫存紀錄｜2026-08-17

本包目前不是放棄或結案，而是停止在缺少實際後端證據時繼續推定契約。GGAP 聚合原型可作方向佐證，但其前端 mock、文件候選值與實際測試環境後端仍可能不同。

暫定保留方向：

1. Provider Portal 繼續以 Game Round 為主要業務紀錄；對接層容許 `Round 1:N Bet`，自製遊戲可依版本使用 `single` 或 `multiple` 模式。
2. Bet 數量與派彩範圍分開治理；`payout_scope` 可依遊戲版本採逐筆、Round 級或混合模式。
3. 投注設定拆為遊戲投注結構、固定投注幣別倍率及下注限額方案；固定倍率不是財務匯率，限額檢核最後的 `Total Bet`。
4. Provider 擁有下注限額方案與版本；GGAP 只同步、開放與指派，不修改 Provider 的限額內容。
5. 對接資料模型保留 `USDT_ONLY` 與 `NATIVE_CURRENCY`；產品優先評估 USDT-only，但需 GGAP 後端確認非 USDT 會員錢包的轉接責任。
6. 正式狀態 enum、時間 API、decimal scale／rounding、資料表、唯一鍵與 Callback payload 不在本次原型分析中定案。

重開本包所需證據：

- GGAP 測試環境實際部署的 Backend Repository、Branch／Tag／Commit。
- Round、Bet、Transaction、Settlement 的 migration、model、enum 與狀態轉換。
- 時間 query、帳期、延遲 Callback 與日結排程實作。
- 金額精度、rounding、匯率與序列化規則及測試。
- Launch、Bet、Win、Refund、Rollback、查單與冪等契約。

在取得上述證據前，Q1–Q20、五項集中 TBD 與受影響頁面仍維持 Draft／Partial，不因本次暫存而暗中核准。

## 已確認且不可違反的邊界

1. Game Round 是 Provider 的主要業務紀錄單位，不另建正式 Game Session 模組。
2. Production、DEMO、Test 必須隔離；正式財務與遊戲紀錄只使用 Production，Test 不進 Provider 風控。
3. Provider 不建立代理商、商戶、會員或錢包主資料；外部識別只作交易脈絡與追蹤快照。
4. Provider 點數是主值，USDT 是每筆 Round 保存的換算對照；歷史資料不得套用最新匯率重算。
5. 原始 Round、結算版本與更正證據不得被靜默刪除或覆寫。

## 決策地圖

| 順序 | 集中 TBD | 本次需要形成的答案 | 後續解鎖 |
|:---:|---|---|---|
| 1 | [`TBD-DOM-001`](open-issues.html#tbd-dom-001) | Round 狀態、終態、重試、回滾與更正模型 | 狀態 enum、有效 Round、監控與追蹤 |
| 2 | [`TBD-DAT-002`](open-issues.html#tbd-dat-002) | Provider／GGAP／request ID 角色與 snapshot 規則 | 查詢、deep link、冪等與歷史追溯 |
| 3 | [`TBD-DAT-003`](open-issues.html#tbd-dat-003) | 儲存時區、顯示時區、查詢欄位與時間邊界 | 報表期間、跨頁導流與測試案例 |
| 4 | [`TBD-DAT-001`](open-issues.html#tbd-dat-001) | decimal、匯率方向、量化與歷史重現 | 金額 schema、顯示、匯出與聚合 |
| 5 | [`TBD-DOM-002`](open-issues.html#tbd-dom-002) | 有效 Round、玩家淨輸贏、GGR 與回滾口徑 | 財務 API、Dashboard 與正式驗收 |

---

## 1. Game Round 正式生命週期

<div class="decision-item-meta"><span>DP01-01</span><a href="open-issues.html#tbd-dom-001">TBD-DOM-001</a><b>P0</b><i>Product · Backend · GGAP</i></div>

### 要解決的矛盾

目前頁面已有 `processing`、`settled`、`cancelled`、`rollback`、`failed`，但尚未定義哪些是終態、暫時失敗是否立刻變成 `failed`、重試是否建立新 Round，以及更正與回滾如何保留歷史。因此同一筆資料可能在遊戲紀錄、財務與監控被不同方式解讀。

### 建議方案 A｜Round 狀態與處理事件分離

<aside class="decision-recommendation">
  <strong>建議採用</strong>
  <p>一個玩家業務回合只建立一個 Provider Round。Round 保存目前業務狀態；每次請求、重試、結算、更正與回滾另存 append-only event。重試不建立新 Round，也不覆蓋先前證據。</p>
</aside>

建議狀態：

| API 候選值 | 顯示名稱 | 財務效果 | 是否終態 | 建議轉換 |
|---|---|---:|:---:|---|
| `processing` | 處理中 | 無 | 否 | `settled`、`cancelled`、`failed` |
| `settled` | 已結算 | 有 | 條件式 | 可因完整沖回進入 `rolled_back`；金額更正仍維持 `settled` 並增加版本 |
| `cancelled` | 已取消 | 無 | 是 | 不恢復；若重新投注應建立新的業務 Round |
| `failed` | 結算失敗 | 無 | 是 | 只在有限重試耗盡後使用；遲到結果需走明確更正流程 |
| `rolled_back` | 已回滾 | 原效果已完整沖回 | 是 | 不直接改回 `settled` |

建議行為：

- Provider 第一次接受可識別的業務請求時建立 Round，初始為 `processing`。
- 同一 logical request 的網路重送沿用相同 `request_id`，不得重複建立 Round 或重複產生財務效果。
- 暫時性逾時或單次 attempt 失敗記錄在 event，不立即把 Round 標為 `failed`。
- 有效結算保存 `settlement_version=1`；後續金額更正增加版本並保留前一版，不建立第二筆 Game Round。
- 完整沖回使用 `rolled_back`；目前原型值 `rollback` 是否改名需在核准時一併決定。
- 不提供刪除正式 Game Round 的一般操作。

### 替代方案比較

| 方案 | 說明 | 優點 | 主要風險 |
|---|---|---|---|
| A｜狀態＋事件分離 | 一個 Round、狀態快照、append-only event | 可追溯、可冪等、財務不重複 | 後端需建立事件與版本模型 |
| B｜只保留簡化終態 | Round 只保留處理中／已結算／已取消，錯誤全部在 log | 模型較小 | Portal 難以直接查詢失敗與回滾 |
| C｜每次重試／回滾建立新 Round | 每個動作都是新 Round | 寫入流程直觀 | 容易重複計數，破壞「一列一 Round」與追溯關係，不建議 |

### 請責任方確認

<ol class="decision-question-list">
  <li><b>Q1</b><span>是否採用「一個業務 Round＋append-only event」模型？</span></li>
  <li><b>Q2</b><span>正式 API 值使用 <code>rolled_back</code>，還是保留原型的 <code>rollback</code>？</span></li>
  <li><b>Q3</b><span><code>failed</code> 是否只在有限重試耗盡後成立，且視為終態？</span></li>
  <li><b>Q4</b><span>部分金額更正是否維持 <code>settled</code> 並增加 <code>settlement_version</code>？</span></li>
</ol>

---

## 2. 跨系統識別碼與交易快照

<div class="decision-item-meta"><span>DP01-02</span><a href="open-issues.html#tbd-dat-002">TBD-DAT-002</a><b>P0</b><i>Backend · Data · GGAP · Security</i></div>

### 要解決的矛盾

Provider Round ID、GGAP Round ID、request ID 與 event ID 都出現在追蹤流程，但其唯一性與重送角色尚未分開。代理商、會員與遊戲名稱也可能被誤寫成「查詢當下 join 的最新主資料」，造成歷史紀錄被改名或無法重現。

### 建議方案 A｜Provider ID 為主鍵，外部 ID 與脈絡採不可變快照

<aside class="decision-recommendation">
  <strong>建議採用</strong>
  <p><code>round_id</code> 是 Provider 唯一主鍵；<code>external_round_id</code> 只作 GGAP 對照與查詢。重送依 logical <code>request_id</code> 去重。Round 保存當時遊戲版本與外部脈絡 snapshot，不依賴查詢當下的外部主資料。</p>
</aside>

| 識別 | 建議責任 | 建議唯一性／索引 | 不得用來做什麼 |
|---|---|---|---|
| `round_id` | Provider 建立 | 建議全域唯一；資料隔離仍強制帶 `provider_id` 與 `environment` | 不從 GGAP ID 推導，不承載可變商業資訊 |
| `external_round_id` | GGAP 提供或映射 | 在 GGAP 契約確認前只建可查詢索引，不假設全域唯一 | 不作 Provider primary key |
| `request_id` | logical command 發起方提供／Provider 接收 | 同一操作重送沿用；不同操作使用新值 | 不等同 Round ID 或 event ID |
| `provider_event_id` | Provider 建立 | 每個 append-only event 唯一 | 不等同 Risk Event ID |
| `risk_event_id`／`alert_id` | Provider 風控建立 | 依各自模型唯一 | 不取代 Round 或 request 追蹤 |

Round 建議保存：

- `game_id`、`game_name_snapshot`、`game_type`、實際 `release_id`／版本。
- `agent_id` 與可取得的 `agent_name_snapshot`；只代表交易脈絡，不形成 Provider 代理商主資料。
- `member_id` 或 GGAP 提供的 opaque member reference；遮罩與查詢權限交由 `TBD-SEC-002`。
- `merchant_id` 若整合追蹤必要，可保存為後端受限快照，但不進 Provider UI、查詢與財務維度。
- snapshot 缺值保存為 `null` 與來源狀態，不用日後最新名稱靜默回填歷史。

### 替代方案比較

| 方案 | 說明 | 優點 | 主要風險 |
|---|---|---|---|
| A｜Provider 主鍵＋外部對照＋snapshot | Provider 內部穩定主鍵，GGAP 與名稱作歷史快照 | 可追溯、外部變更不改寫歷史 | 資料欄位較多，需治理敏感識別 |
| B｜GGAP Round ID 直接作主鍵 | 不建立 Provider Round ID | 欄位較少 | 綁定外部唯一性與格式，跨環境／重送風險高 |
| C｜只存 ID、查詢時 join 最新名稱 | 歷史名稱不保存 | 儲存較少 | 報表無法重現當時脈絡，不建議用於財務 |

### 請責任方確認

<ol class="decision-question-list">
  <li><b>Q5</b><span><code>round_id</code> 是否由 Provider 建立並作唯一主鍵？正式格式由 Backend 另提 schema。</span></li>
  <li><b>Q6</b><span>在取得 GGAP 契約前，是否同意不對 <code>external_round_id</code> 宣告全域唯一？</span></li>
  <li><b>Q7</b><span>遊戲、版本與代理商名稱是否採交易當下 snapshot，禁止以最新名稱覆寫歷史？</span></li>
  <li><b>Q8</b><span><code>merchant_id</code> 是否維持後端受限追蹤欄位，不進 Provider UI 與報表維度？</span></li>
</ol>

---

## 3. 時間、時區與統計窗口

<div class="decision-item-meta"><span>DP01-03</span><a href="open-issues.html#tbd-dat-003">TBD-DAT-003</a><b>P1</b><i>Product · Backend · Data · SRE</i></div>

### 要解決的矛盾

財務已明確使用 `settled_at`，但遊戲紀錄同時要查詢尚未產生 `settled_at` 的 `processing`／`failed` Round。若同一個「時間區間」在不同狀態下偷偷改用不同欄位，使用者與 QA 都無法判斷結果。

### 建議方案 A｜儲存 UTC、顯示台北、時間基準必須明示

<aside class="decision-recommendation">
  <strong>建議採用</strong>
  <p>所有事件保存 absolute instant，API 使用 RFC 3339 並帶 offset；Portal 預設以 <code>Asia/Taipei</code> 顯示與切日。財務固定依 <code>settled_at</code>；遊戲紀錄增加明確 <code>time_basis</code>，不得依狀態暗中切換。</p>
</aside>

| 時間欄位 | 正式語意 | 主要用途 | 是否可變 |
|---|---|---|:---:|
| `created_at` | Provider 建立 Round 紀錄的技術時間 | 未結算／失敗追查、資料寫入追蹤 | 否 |
| `started_at` | 遊戲玩法開始時間 | 遊戲時長與未來多人玩法；現行單人遊戲可空 | 否 |
| `settled_at` | 有效結算版本完成時間 | 正式遊戲紀錄預設排序、財務與報表統計 | 原始值否；更正另留版本時間 |
| `updated_at` | Round 最新狀態／版本寫入時間 | 資料新鮮度與支援追查 | 是 |
| event `occurred_at` | 重試、更正、回滾等事件實際發生時間 | 事件時間軸與 audit | 否 |

建議查詢規則：

- 財務總覽、代理商 × 遊戲彙總與 Dashboard 財務數字固定使用 `settled_at`。
- 遊戲紀錄預設 `time_basis=settled_at`；需要查詢 `processing`、`failed` 或技術寫入紀錄時，使用者明確切換 `time_basis=created_at`。
- 財務頁導向遊戲紀錄時必須帶入 `time_basis=settled_at`，避免同一期間筆數不一致。
- 所有區間採半開區間 `[from, to)`；日區間依 `Asia/Taipei` 產生邊界後轉成 UTC 傳輸。
- API 回傳原始時間含 `Z` 或明確 offset，並在 `meta.timezone` 說明顯示／聚合時區。
- `settled_at=null` 不得被填入 `created_at` 冒充結算時間。

### 替代方案比較

| 方案 | 說明 | 優點 | 主要風險 |
|---|---|---|---|
| A｜明確 `time_basis` | 財務固定結算時間；Round 頁可明確切換 | 語意可測、未結算資料可查 | Round 頁需增加控制與 query 契約 |
| B｜所有頁都用 `created_at` | 單一時間欄位 | 查詢簡單 | 財務跨日與延遲結算口徑錯誤 |
| C｜依狀態自動選欄位 | UI 不增加控制 | 畫面較少 | 同一區間混合不同時間語意，不建議 |

### 請責任方確認

<ol class="decision-question-list">
  <li><b>Q9</b><span>Portal 的預設顯示與統計日是否固定為 <code>Asia/Taipei</code>？</span></li>
  <li><b>Q10</b><span>是否採用半開區間 <code>[from, to)</code>，API 以 RFC 3339 absolute instant 傳輸？</span></li>
  <li><b>Q11</b><span>遊戲紀錄是否增加明確的 <code>time_basis</code>，預設 <code>settled_at</code>、追查未結算時使用 <code>created_at</code>？</span></li>
  <li><b>Q12</b><span>財務跨頁導流是否一律鎖定 <code>time_basis=settled_at</code>？</span></li>
</ol>

---

## 4. 點數、USDT、匯率與精度

<div class="decision-item-meta"><span>DP01-04</span><a href="open-issues.html#tbd-dat-001">TBD-DAT-001</a><b>P0</b><i>Finance · Backend · GGAP</i></div>

### 要解決的矛盾

目前已確認使用 decimal string、保存當次換算結果與 `conversion_rule_id`，但尚未決定點數／USDT scale、匯率方向、量化時點及 rounding mode。若各 API 或報表自行取位，總覽加總可能無法回到單筆 Round。

### 建議方案 A｜Provider 固定計算 profile＋每筆 Round 鎖定換算版本

<aside class="decision-recommendation">
  <strong>建議採用</strong>
  <p>第一版由 Provider 設定固定的 points、USDT 與 rate 計算 profile；傳輸一律使用 decimal string。每筆 Round 保存 canonical rate、方向、rule ID、量化後的各金額與規則版本，報表只加總保存值。</p>
</aside>

建議契約骨架：

| 項目 | 建議 |
|---|---|
| 傳輸型別 | JSON decimal string；不得使用 JavaScript binary float 作正式值 |
| canonical 匯率方向 | 建議 `usdt_per_point`，公式為 `usdt = points × rate`；若採其他方向必須在欄位名明示 |
| Round 保存 | `bet_points`、`payout_points`、`net_result_points`、三個對應 USDT、`conversion_rate`、`conversion_rule_id` |
| 量化時點 | 每筆 Round 結算版本建立時量化並保存；聚合時不再次逐筆換率 |
| 歷史重現 | 使用保存值與 rule snapshot；不得套用最新 rate 重算 |
| 顯示精度 | 可少於儲存精度，但完整值仍可在詳情／匯出依權限提供 |

建議計算順序：

```text
player_net_points = payout_points - bet_points
ggr_points        = bet_points - payout_points

bet_usdt          = quantize(bet_points × rate)
payout_usdt       = quantize(payout_points × rate)
player_net_usdt   = quantize((payout_points - bet_points) × rate)
ggr_usdt          = quantize((bet_points - payout_points) × rate)
```

`player_net_usdt` 不得用已量化的 `payout_usdt - bet_usdt` 反推，避免雙重四捨五入。正式 scale 與 rounding mode 仍需 Finance／Backend 填入：

| 待填參數 | 候選方向 | 本包建議 |
|---|---|---|
| `points_scale` | Provider 全域固定／依遊戲變動 | 第一版全域固定；顯示 scale 可依遊戲 |
| `usdt_scale` | 依 GGAP 契約固定 | 等 GGAP 確認具體位數，不先假設 |
| `rate_scale` | 高於金額 scale | Backend 提出足以避免中間運算損失的固定值 |
| `rounding_mode` | HALF_UP／HALF_EVEN／DOWN 等 | Finance 選定唯一模式並寫入 rule version |

### 替代方案比較

| 方案 | 說明 | 優點 | 主要風險 |
|---|---|---|---|
| A｜固定 profile＋Round snapshot | 固定 scale／rounding，每 Round 鎖定版本 | 容易重現、前後端一致 | 需先核准 profile |
| B｜各遊戲自行定 scale | 每款遊戲可不同 | 彈性最高 | 報表、匯出與比較複雜，第一版不建議 |
| C｜查詢時使用最新匯率 | 不保存 Round 換算值 | 儲存較少 | 歷史數字會改變，違反既有邊界 |

### 請責任方確認

<ol class="decision-question-list">
  <li><b>Q13</b><span>canonical rate 是否採 <code>usdt_per_point</code>，並以欄位名稱固定方向？</span></li>
  <li><b>Q14</b><span>第一版是否採 Provider 全域固定 points scale，而非每款遊戲各自定義？</span></li>
  <li><b>Q15</b><span>請 Finance／Backend 填入 points、USDT、rate scale 與唯一 rounding mode。</span></li>
  <li><b>Q16</b><span>是否確認聚合只加總每筆 Round 保存的量化值，不以最新 rate 重算？</span></li>
</ol>

---

## 5. 正式財務指標與正負方向

<div class="decision-item-meta"><span>DP01-05</span><a href="open-issues.html#tbd-dom-002">TBD-DOM-002</a><b>P0</b><i>Product · Finance · Backend</i></div>

### 要解決的矛盾

目前原型已使用「玩家淨輸贏＝派彩－投注」與「Provider GGR＝投注－派彩」，但取消、失敗、回滾、部分更正與跨期更正尚未形成唯一口徑。若只在前端以目前狀態過濾，歷史報表可能無法說明數字變化。

### 建議方案 A｜有效 Round 集合＋帶版本的 signed adjustment

<aside class="decision-recommendation">
  <strong>建議採用</strong>
  <p>一般財務只統計 Production 中目前有效的 settled Round。玩家淨輸贏採玩家角度，GGR 採 Provider 角度。更正與回滾以可追溯的 signed adjustment／settlement version 反映，不刪除原始 Round。</p>
</aside>

### 建議正式公式（限現行老虎機與單人 Crash）

| 指標 | 建議定義 | 正負方向 |
|---|---|---|
| 有效 Round | `environment=production`、來源可驗證、去重完成、目前具有效 `settled` 結算版本 | 取消、失敗與完整回滾不納入 |
| 投注筆數 | 有效 Round 數量 | 非負整數 |
| 投注總額 | `SUM(effective_bet_points)` | 非負 |
| 派彩總額 | `SUM(effective_payout_points)` | 非負；更正由版本／delta 調整 |
| 玩家淨輸贏 | `SUM(payout_points - bet_points)` | 正值＝玩家淨贏；負值＝玩家淨輸 |
| Provider GGR | `SUM(bet_points - payout_points)` | 正值＝Provider 毛收入；負值＝Provider 淨虧 |
| 平均投注額 | 投注總額 ÷ 投注筆數 | 分母 0 時 API 回 `null`、UI 顯示 `—` |
| 玩家人數 | 查詢範圍內有效 Round 的 distinct opaque `member_id` | 各分組人數不可直接相加 |
| 人均投注額 | 投注總額 ÷ distinct 玩家人數 | 分母 0 時 API 回 `null`、UI 顯示 `—` |

建議狀態處理：

| Round 狀態／事件 | 一般財務 | 查詢與稽核 |
|---|---|---|
| `processing` | 不納入 | 可在遊戲紀錄查詢 |
| `settled` | 納入目前有效結算版本 | 保留所有 settlement version |
| `cancelled` | 不納入 | 保留取消原因與時間 |
| `failed` | 不納入 | 保留 attempts 與最終原因 |
| `rolled_back` | 原財務效果完整沖回 | 原結算與 reversal event 均保留 |
| settlement adjustment | 以 signed delta 更新有效結果 | 保存前後版本、原因、操作者與時間 |

跨期更正建議：

- 即時營運報表允許舊期間數字因後續更正而改變，但回應必須帶 `calculated_at` 與 `data_version`。
- 原始 `settled_at` 不因更正而被覆寫；更正 event 另有 `occurred_at`。
- 是否建立日結／月結鎖定快照、重開會計期間與正式保存年限，交由 `TBD-DAT-004` 後續決策。
- 本公式不推定棋牌、本金返還、Bonus、Jackpot、稅、費用或分潤；新增玩法前需另行確認 effective bet／payout 定義。

### 替代方案比較

| 方案 | 說明 | 優點 | 主要風險 |
|---|---|---|---|
| A｜有效集合＋signed adjustment | 原始 Round 不變，更正以版本／delta 可追溯 | 財務可重現、監控可解釋 | 聚合需支援資料版本與重算 |
| B｜直接覆寫原 Round 金額 | 只保留最後值 | 查詢簡單 | 無法 audit、無法解釋歷史變動，不建議 |
| C｜回滾建立負值新 Game Round | 用新 Round 沖銷 | 聚合表面簡單 | 破壞一列一業務 Round、投注筆數容易失真 |

### 請責任方確認

<ol class="decision-question-list">
  <li><b>Q17</b><span>玩家淨輸贏是否固定採玩家角度，GGR 固定採 Provider 角度，兩者在現行玩法互為相反數？</span></li>
  <li><b>Q18</b><span>一般財務是否只納入 Production 中目前有效的 settled Round？</span></li>
  <li><b>Q19</b><span>更正／回滾是否採 settlement version＋signed adjustment，禁止覆寫或建立假 Round？</span></li>
  <li><b>Q20</b><span>即時歷史報表是否允許因後續更正重算，並用 <code>data_version</code>／<code>calculated_at</code> 追溯？</span></li>
</ol>

## 6. 一次審閱清單

責任方可以先依下表記錄方向；「同意建議」仍需在正式決議紀錄填寫確認人與日期。

| 決策組 | 核准問題 | 建議結果 | 審閱結果 |
|---|---:|---|---|
| Round 生命週期 | Q1–Q4 | 採方案 A；確認 enum 命名與 `failed` 終態 | 待填 |
| 識別與快照 | Q5–Q8 | 採方案 A；GGAP 外部唯一性維持等待 | 待填 |
| 時間與窗口 | Q9–Q12 | 採方案 A；台北顯示、UTC 傳輸、明確 `time_basis` | 待填 |
| 點數與 USDT | Q13–Q16 | 採方案 A；具體 scale／rounding 由 Finance／Backend 填入 | 待填 |
| 財務公式 | Q17–Q20 | 採方案 A；有效 Round＋signed adjustment | 待填 |

## 7. 決議後同步清單

本包核准後應一次更新：

1. [`共通領域規則`](common-domain-rules.html)：Round、環境、金額與時間正式規則。
2. [`資料字典`](data-dictionary.html)：ID、snapshot、decimal、rate 與 timestamp 欄位。
3. [`狀態與枚舉`](status-enums.html)：Round enum、終態與轉換。
4. [`遊戲紀錄`](game-round-records.html)：時間基準、狀態、詳情、排序與驗收。
5. [`財務總覽`](finance-overview.html)與[`代理商 × 遊戲彙總`](finance-agent-games.html)：有效 Round、公式、正負與資料版本。
6. 儀表板、監控總覽、風控報表與風控告警：只引用同一 Round／時間／金額語意，不另立公式。
7. [`待決策與校正清單`](open-issues.html)：保留 TBD ID，補上正式決議、日期、證據與剩餘限制。

## 8. 本包完成條件

Decision Pack 01 只有在以下條件都成立後才可標記 Confirmed：

- Q1–Q20 均有明確答案，或拆成具 owner 與期限的新 TBD。
- Product、Finance、Backend 對五組核心決策完成審閱；涉及 GGAP 的外部唯一性與 USDT 契約仍可明確維持 External。
- 共通規格、資料字典、enum、七個直接影響頁面與 QA 情境同步更新。
- 原型若需要新增 `time_basis` 或調整 `rollback` 命名，已決定修改方式與相容策略。
- 自動 Gate 確認集中 TBD、決策包、頁面引用與生成 HTML 沒有脫節。
