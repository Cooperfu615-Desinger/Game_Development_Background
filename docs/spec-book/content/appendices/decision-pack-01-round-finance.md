# Decision Pack 01｜Game Round、投注與財務共用產品契約

<section class="decision-pack-hero decision-pack-hero--round" data-pack="DP / 01" aria-label="Decision Pack 01 摘要">
  <div class="decision-pack-hero__identity">
    <span>PHASE 3 · PRODUCT CONTRACT 01</span>
    <strong>從一筆 Game Round，建立可銜接、可統計、可對帳的共同語言</strong>
    <p>本包直接定義 Provider Portal 希望具備的 Round、Bet、投注設定、時間、幣別與正式財務能力，作為產品、前端、後端、QA、Finance 與 GGAP 對接的共同分析基準；實際 Backend 差異於取得證據後以版本更新處理。</p>
  </div>
  <div class="decision-pack-hero__stats">
    <div><strong>06</strong><span>共用契約群組</span></div>
    <div><strong>07</strong><span>直接影響頁面</span></div>
    <div><strong>02</strong><span>對接資料模式</span></div>
    <div><strong>01</strong><span>正式結算幣別</span></div>
  </div>
  <nav class="decision-pack-hero__nav decision-pack-hero__nav--six" aria-label="六項契約快速導覽">
    <a href="#1-game-round-bet-與結算生命週期"><b>01</b><span>Round 與 Bet</span></a>
    <a href="#2-跨系統識別碼與交易快照"><b>02</b><span>識別與快照</span></a>
    <a href="#3-時間-統計窗口與日結帳期"><b>03</b><span>時間與日結</span></a>
    <a href="#4-遊戲投注結構-幣別倍率與下注限額"><b>04</b><span>投注設定</span></a>
    <a href="#5-provider-points-usdt-匯率與精度"><b>05</b><span>幣別與精度</span></a>
    <a href="#6-財務指標-調整與正式結算邊界"><b>06</b><span>財務與調帳</span></a>
  </nav>
</section>

## 文件定位

| 項目 | 目前需求基準 |
|---|---|
| 契約編號 | `DP-01` |
| 主題 | Game Round、Bet、識別快照、時間／日結、投注設定、Provider Points／USDT 與正式財務 |
| 直接影響頁面 | 遊戲紀錄、財務總覽、代理商 × 遊戲彙總、儀表板、監控總覽、風控報表、風控告警／處理 |
| 主要業務單位 | Game Round；不另建 Provider Game Session |
| 正式資料環境 | Production only；DEMO、Test 不進正式遊戲紀錄與財務，Test 不進 Provider 風控 |
| 現行程式 | 七個頁面已有前端 mock；正式資料模型、API、持久化、結算與對接副作用尚待後續實作 |
| 文件用途 | 表達目前希望具備的完整產品功能；交付評估後的調整以新版本修訂 |

本包不把「尚未取得 GGAP 或現行 Backend Git」解讀為產品需求尚未成立。產品與資料語意依本包描述；資料表、API path、正式 payload、精度位數、權限 key 與排程實作等技術值，待取得證據後對照修正。

## 不可違反的產品邊界

1. Game Round 是 Provider 的主要業務紀錄；正式模型支援一個 Round 包含一筆或多筆 Bet，但不因此另建 Provider Game Session。
2. Provider 負責遊戲主資料、版本、數值、素材、全域上下架、Round 紀錄、遊戲商財務及自身監控風控；不建立代理商、商戶、會員或錢包主資料。
3. GGAP 可對已上架遊戲控制各代理商是否開放；Provider 不把這類開關收回自身管理。
4. Production、DEMO、Test 必須隔離。正式 Round、財務與結算只使用 Production；DEMO／Test 不得以篩選遺漏的方式混入正式資料。
5. Provider Points 是遊戲數值與 Portal 比較主值；投注幣別固定倍率、會員顯示幣別及正式結算匯率是不同概念，不得共用一個 `rate` 欄位。
6. Provider 與 GGAP 的正式結算幣別固定為 USDT；原生幣別模式只增加交易脈絡，不改變正式結算幣別。
7. 原始請求、Round、Bet、結算版本、Callback、回滾與調整證據採 append-only；不得靜默刪除、覆寫或用假負值 Round 掩蓋更正。

## 整體契約鏈

<ol class="round-contract-flow" aria-label="Game Round 與財務契約鏈">
  <li><b>01</b><strong>Game Context</strong><span>遊戲、版本、環境與投注設定版本</span></li>
  <li><b>02</b><strong>Game Round</strong><span>一次玩家業務回合與跨系統追蹤主體</span></li>
  <li><b>03</b><strong>Bet 1:N</strong><span>一筆或多筆實際投注及其不可變證據</span></li>
  <li><b>04</b><strong>Payout / Settlement</strong><span>依派彩範圍建立一次有效財務效果</span></li>
  <li><b>05</b><strong>Adjustment</strong><span>回滾、更正、差異與版本化調帳</span></li>
  <li><b>06</b><strong>Reports / Daily Settlement</strong><span>營運報表與鎖定日結各自可追溯</span></li>
</ol>

鏈上每一層都保存自己的 ID、時間、狀態與版本。頁面可以把資料組成一列或一個抽屜，但不得因此省略 Bet、結算、調整或對接證據的正式層次。

---

## 1. Game Round、Bet 與結算生命週期

<div class="decision-item-meta"><span>DP01-01</span><a href="open-issues.html#tbd-dom-001">TBD-DOM-001</a><a href="open-issues.html#tbd-dom-002">TBD-DOM-002</a><i>Product · Backend · Data · GGAP</i></div>

<aside class="decision-recommendation">
  <strong>目前需求基準</strong>
  <p>一個玩家業務回合只建立一個 Game Round；正式模型支援 Round 1:N Bet。Round 保存目前業務狀態，Bet、派彩、請求 attempt、Callback、結算版本、回滾與更正另存不可變證據。</p>
</aside>

### 1.1 核心物件與基數

| 物件 | 正式責任 | 基數／關聯 | 保存原則 |
|---|---|---|---|
| Game Round | Provider 的主要業務與查詢單位 | 一個 Round 包含 1:N Bet | 一個業務回合只建立一次；重送與重試不得產生重複 Round |
| Bet | 一次實際投注效果 | N:1 Round | 每筆具 `bet_id`、金額、時間、狀態與設定 snapshot |
| Payout | 派彩效果 | 依 `payout_scope` 關聯 Bet、Round 或兩者 | 每份金額只能進正式聚合一次 |
| Settlement Version | 某次有效結算結果 | 一個 Round 可有多個版本，只有一版目前有效 | 新版本追加，不覆寫舊版本 |
| Round Event／Attempt | 請求、重試、Callback、狀態轉移等證據 | N:1 Round | append-only，保存前後狀態、原因與 trace |
| Adjustment／Reversal | 更正、沖回或跨期差異 | 關聯原 Round、Bet、Settlement | 使用 signed amount 與明確原因，不建立假負值 Round |

遊戲版本必須宣告：

- `bet_mode=single`：一個 Round 通常只有一筆 Bet。
- `bet_mode=multiple`：一個 Round 可包含多筆 Bet，供魚機、棋牌或其他複合玩法銜接。
- `payout_scope=bet`：派彩逐筆對應 Bet。
- `payout_scope=round`：派彩只在 Round 層結算。
- `payout_scope=hybrid`：同時存在 Bet 與 Round 層效果；必須以 settlement line 或等價來源標記實際入帳範圍，避免重複計算。

支援 `multiple` 是聚合相容能力，不要求所有自製遊戲改成多 Bet，也不在本包提前規定各種棋牌桌局或多人玩法細節。每款遊戲依實際玩法選擇版本模式。

### 1.2 Round 狀態

| API 值 | 顯示名稱 | 財務效果 | 終態 | 主要轉換 |
|---|---|---:|:---:|---|
| `processing` | 處理中 | 尚無有效結算 | 否 | `settled`、`cancelled`、`failed` |
| `settled` | 已結算 | 依目前有效 settlement version | 條件式 | 可追加更正版本；完整沖回後進入 `rolled_back` |
| `cancelled` | 已取消 | 無 | 是 | 不恢復；重新投注建立新的業務 Round |
| `failed` | 結算失敗 | 無有效結算 | 是 | 只在有限重試耗盡後成立；遲到結果走 reconciliation／correction |
| `rolled_back` | 已回滾 | 原有效效果已完整沖回 | 是 | 不直接改回 `settled` |

正式 canonical 值採 `rolled_back`。既有原型、舊資料或外部輸入若使用 `rollback`，只在相容層映射為 `rolled_back`，不得讓兩個值同時成為正式狀態。

### 1.3 冪等、重試與遲到結果

- Provider 第一次接受可識別業務請求時建立 Round，初始狀態為 `processing`。
- 同一 logical command 的網路重送沿用同一 `request_id`／idempotency key，回傳相同結果，不重複建立 Round、Bet 或財務效果。
- 暫時性逾時與單次 attempt 失敗只記錄事件；有限重試耗盡後才把 Round 標記為 `failed`。
- `failed` 後到達的有效 Callback 不得靜默把狀態改回 `settled`；必須建立 reconciliation case，再由明確 correction 流程形成新結算版本。
- `settled` 的部分金額更正維持 Round 為 `settled` 並增加 `settlement_version`；只有完整沖回才進入 `rolled_back`。
- 正式 Game Round 不提供一般刪除操作。

### 1.4 計數與金額聚合單位

`Round 1:N Bet` 成立後，Round 數與 Bet 數必須分開：

```text
round_count = count(distinct effective round_id)
bet_count   = count(effective bet_id)
average_bet = total_bet / bet_count
```

- `single` 遊戲的 `round_count` 與 `bet_count` 通常相同；`multiple` 遊戲不相同。
- 完整沖回或無有效財務效果的資料不進目前有效計數；調整紀錄本身不增加 Round 或 Bet 筆數。
- 表格若顯示「投注筆數」必須使用 `bet_count`；若顯示「局數／Round 數」使用 `round_count`，不得再用同一欄位名稱互換。
- 金額依有效 settlement line 聚合，並依 `payout_scope` 確保每份投注或派彩只計算一次。

---

## 2. 跨系統識別碼與交易快照

<div class="decision-item-meta"><span>DP01-02</span><a href="open-issues.html#tbd-dat-002">TBD-DAT-002</a><i>Backend · Data · GGAP · Security</i></div>

<aside class="decision-recommendation">
  <strong>目前需求基準</strong>
  <p><code>round_id</code> 是 Provider 的查詢與追蹤主鍵；Bet、交易、結算、調整與事件各自具識別碼。GGAP 與其他外部 ID 保留來源脈絡及複合唯一性，不直接取代 Provider 主鍵。</p>
</aside>

### 2.1 識別碼責任

| 識別 | 建立方／責任 | 唯一性與用途 |
|---|---|---|
| `round_id` | Provider | Provider 內部主鍵；所有頁面與 evidence 可由此追溯 |
| `bet_id` | Provider 或依對接契約映射 | 一筆 Bet 的穩定識別；同一 Bet 的重送不得產生新 ID |
| `transaction_id` | 產生該資金／遊戲交易的一方 | 區分 Bet、Win、Refund、Rollback 等 transaction |
| `external_round_id`／`external_bet_id` | GGAP 或外部來源 | 對接查詢與比對；不假設跨 provider、environment、source 全域唯一 |
| `request_id` | logical command 發起方 | 指令與冪等層級；不同操作使用不同值，不等同 Round 或 Event |
| `provider_event_id` | Provider | 一筆 append-only domain／integration event |
| `settlement_id` | 結算服務 | 一個正式結算或 settlement line 的穩定識別 |
| `adjustment_id` | 調整服務 | 一筆回滾、更正或差異調帳的穩定識別 |

外部識別在正式契約未保證全域唯一前，至少以 `provider_id + environment + source_system + external_id` 建立複合唯一鍵或去重範圍。所有 UI 查詢與 deep link 必須保留環境脈絡，避免 Production 與 DEMO 撞號。

### 2.2 Round 與 Bet snapshot

每筆 Round 至少保存交易當下的：

- `provider_id`、`environment`、`game_id`、`game_name_snapshot`、`game_type`、`release_id`／實際版本。
- `bet_mode`、`payout_scope` 及三層投注設定的版本識別。
- GGAP 提供的 `agent_id` 與可取得的 `agent_name_snapshot`；只代表交易脈絡，不形成 Provider 代理商主資料。
- GGAP 提供的 opaque `member_ref`；遮罩、查詢與匯出權限依安全契約處理，Provider 不建立會員主檔。
- `merchant_id` 若對接追蹤必要，只作後端受限脈絡，不作 Provider UI 或正式財務維度。
- 資料來源、payload version、trace ID 與建立時可得的外部狀態。

每筆 Bet 另保存 `bet_id`、Bet 序號、實際 `total_bet`、幣別／點數金額、時間、狀態及對應 payout／settlement 關聯。

snapshot 缺值保存為 `null` 並記錄來源狀態；不得查詢時 join 最新名稱後靜默改寫歷史。若基於授權必須更新顯示名稱，應保存獨立的 display override 與稽核，不改動原始 snapshot。

### 2.3 追蹤鏈

遊戲紀錄明細應可從 `round_id` 追到 Bet、transaction、settlement version、adjustment、request／Callback attempt 與 GGAP trace。財務、監控或風控導向遊戲紀錄時，也必須攜帶足以還原相同環境、時間基準及識別範圍的 query。

Provider 可保存外部識別及名稱快照，但不得因此提供代理商、商戶、會員或錢包的新增、編輯、停用或主檔治理功能。

---

## 3. 時間、統計窗口與日結帳期

<div class="decision-item-meta"><span>DP01-03</span><a href="open-issues.html#tbd-dat-003">TBD-DAT-003</a><i>Product · Backend · Data · Finance · SRE</i></div>

<aside class="decision-recommendation">
  <strong>目前需求基準</strong>
  <p>所有事件保存 absolute instant，API 使用 RFC 3339 並帶 offset；查詢採半開區間 <code>[from, to)</code>。Portal 顯示、營運報表與正式日結的時區角色分開保存，不因目前都落在 UTC+8 而合併語意。</p>
</aside>

### 3.1 時間欄位

| 欄位 | 正式語意 | 主要用途 |
|---|---|---|
| `created_at` | Provider 建立 Round 紀錄的技術時間 | 未結算／失敗追查與寫入追蹤 |
| `started_at` | 遊戲玩法開始時間 | 遊戲時長；現行不提供時可為 `null` |
| `bet_at` | Bet 被接受的業務時間 | Bet 排序、交易證據與延遲分析 |
| `settled_at` | 目前有效結算完成時間 | 正式財務、報表及遊戲紀錄預設統計 |
| `updated_at` | Round 最新狀態／版本寫入時間 | 資料新鮮度與支援追查 |
| event `occurred_at` | 重試、Callback、更正或回滾實際發生時間 | timeline、audit 與 reconciliation |

原始時間不可被改寫；若後續收到更可信的業務時間，應保存來源版本與修正紀錄。`settled_at=null` 不得以 `created_at` 冒充結算時間。

### 3.2 四個時間角色

| 角色 | 第一版基準 | 用途 |
|---|---|---|
| 儲存／傳輸時間 | UTC absolute instant；RFC 3339 | 跨系統交換與排序 |
| `display_timezone` | Portal 預設 `Asia/Taipei` | 畫面格式化與使用者輸入日區間 |
| `report_timezone` | API／匯出明確回傳；第一版預設 `Asia/Taipei` | 營運報表切日與圖表 bucket |
| `settlement_timezone` | GGAP 日結語意使用北京時區 `Asia/Shanghai` | 正式帳期、匯率鎖定與日結批次 |

台北與北京目前同為 UTC+8，不代表兩者可以共用一個無名稱 offset。日後規則、地區或排程改變時，兩個角色仍須可獨立版本化。

### 3.3 查詢與統計窗口

- 財務總覽、代理商 × 遊戲彙總與 Dashboard 財務數字固定使用 `settled_at`。
- 遊戲紀錄預設 `time_basis=settled_at`；查詢 `processing`、`failed` 或寫入異常時，使用者明確切換 `time_basis=created_at`。
- 財務跨頁導向遊戲紀錄時必須帶 `time_basis=settled_at`、相同 `[from,to)`、environment 與有效資料版本。
- API request／response 必須明示 `time_basis`、timezone 與區間；不得依 Round 狀態暗中切換時間欄位。
- 即時／歷史營運報表回傳 `data_version` 與 `calculated_at`，允許因後續更正以新版本重算。

### 3.4 正式日結

正式日結保存 `business_date`、`settlement_timezone`、`settlement_batch_id`、rate snapshot、資料截止點與鎖定版本。依現行 GGAP 技術規格，日結以北京時區為語意基準：00:00 鎖定適用匯率，01:00 執行 T-1 帳期；若實際 Backend 排程不同，後續以差異表修訂時間值，但仍保留「匯率鎖定」與「結算批次不可變」兩項能力。

已鎖定日結不得因營運報表重算而被覆寫。後到 Callback、回滾或更正造成跨期差異時，建立 adjustment／reversal 並落在可追溯的新批次。

---

## 4. 遊戲投注結構、幣別倍率與下注限額

<div class="decision-item-meta"><span>DP01-04</span><a href="open-issues.html#tbd-dat-001">TBD-DAT-001</a><i>Product · Game Math · Backend · GGAP</i></div>

<aside class="decision-recommendation">
  <strong>目前需求基準</strong>
  <p>投注設定拆成「遊戲投注結構、投注幣別倍率、下注限額方案」三層。遊戲先計算最後的 <code>total_bet</code>，再以固定、版本化的產品倍率映射各幣別，最後由限額方案驗證；固定倍率不是即時市場匯率。</p>
</aside>

### 4.1 三層模型

| 層級 | 責任 | 典型內容 | 版本化要求 |
|---|---|---|---|
| 遊戲投注結構 | 定義一款遊戲如何組成最終投注額 | Bet、Coin Value、Multiplier、Lines、Bet Level 或遊戲專屬元件 | 隨遊戲／版本保存；不同遊戲可不同 |
| 投注幣別倍率 | 將同一投注階梯映射成各幣別可接受的固定產品金額 | `currency_code`、`multiplier_value`、生效區間與取位規則 | 建立 `bet_currency_profile_id/version`；不得隨市場匯率浮動 |
| 下注限額方案 | 限制每筆最終投注額及必要的日／局／功能上限 | min／max total bet、允許 bet level、遊戲／版本／幣別 scope | 建立 `limit_scheme_id/version`；已發布版本不可原地改寫 |

PP 老虎機畫面中的 Bet、Coin Value、Bet Multiplier 與 Total Bet 屬於第一層「遊戲投注結構」。它能說明遊戲如何組成投注，但不能單獨決定幣別倍率或 Provider 下注限額。

### 4.2 固定倍率

投注幣別倍率是產品設定，不是金融換匯：

- 各幣別使用經產品確認的固定相對比例，讓投注階梯符合當地常用面額與遊戲體驗。
- 美金、台幣、越南盾等比率只可作規劃示例；實際值必須以版本化 profile 發布，不在程式中硬編碼示例數字。
- profile 調整只影響生效後的新 Launch／Round；歷史 Round 使用自己的 `bet_currency_profile_id/version` 還原。
- 倍率欄位名稱必須帶用途，例如 `bet_currency_multiplier`，不得與 `settlement_rate` 或 GGAP `base_rate` 共用。

### 4.3 限額驗證與責任

- Provider 擁有下注限額方案內容、版本與全域有效性；GGAP 只同步、開放或依代理商指派，不得修改 Provider 方案內容。
- 限額以遊戲完成所有元件計算後的 `total_bet` 驗證，不逐一限制 Coin Value、Multiplier 等 UI 元件。
- Launch 回應應包含或可取得生效的投注結構、幣別倍率與限額版本；下注時 Backend 仍須以正式版本重新驗證，不能只信任前端。
- 方案可依 game、version、environment、currency 與其他必要 scope 建立，但不得用代理商主檔作 Provider 內部管理來源。
- 版本未發布、幣別不支援、金額不在允許階梯或超出 min／max 時拒絕 Bet，回傳可辨識錯誤碼且不建立有效財務效果。
- 已開始 Round 使用啟動時鎖定的設定版本完成；後續停用或調整不回寫歷史。

每筆 Round 至少 snapshot：

```text
bet_structure_version
bet_currency_profile_id / bet_currency_profile_version
limit_scheme_id / limit_scheme_version
actual_total_bet
```

---

## 5. Provider Points、USDT、匯率與精度

<div class="decision-item-meta"><span>DP01-05</span><a href="open-issues.html#tbd-dat-001">TBD-DAT-001</a><a href="open-issues.html#tbd-ext-001">TBD-EXT-001</a><i>Finance · Backend · Data · GGAP</i></div>

<aside class="decision-recommendation">
  <strong>目前需求基準</strong>
  <p>Provider Points、投注幣別倍率、會員顯示幣別與正式結算幣別分層保存。Provider 與 GGAP 正式結算固定使用 USDT；每次換算都帶明確方向、來源、版本與 snapshot，歷史不得套用最新值重算。</p>
</aside>

### 5.1 四種金額角色

| 角色 | 用途 | 是否正式結算 | 主要規則 |
|---|---|:---:|---|
| Provider Points | 遊戲數值、投注／派彩主值及 Portal 比較 | 否 | 由 Provider 保存，跨遊戲與報表使用一致語意 |
| `bet_currency_multiplier` | 投注階梯的固定產品映射 | 否 | 不跟隨市場匯率；見第 4 節 |
| `display_currency`／native amount | GGAP 會員錢包或前端顯示脈絡 | 否 | Provider 不建立或管理該錢包，只保存必要交易 snapshot |
| `settlement_currency` | Provider 與 GGAP 正式結算 | 是 | 固定 `USDT` |

欄位不得只命名為 `currency`、`amount` 或 `rate`。API、資料表與匯出必須用名稱或同層 metadata 說明金額角色與換算方向。

### 5.2 兩種 GGAP 對接資料模式

| 模式 | 對接行為 | 正式結算 | 第一版策略 |
|---|---|---|---|
| `USDT_ONLY` | Provider 對 GGAP 的 Bet／Win 傳送 USDT；Provider 同時保存 Points 與轉換 snapshot | USDT | 預設啟用，降低兩邊重複換算與對帳差異 |
| `NATIVE_CURRENCY` | 額外保存並傳送契約允許的原生顯示幣別／金額及其換算 snapshot | 仍為 USDT | 保留切換能力；實際啟用幣別與 payload 待 GGAP Backend 驗證 |

模式由版本化 integration profile 控制，至少依 GGAP environment 與契約版本生效。切換只影響新交易，不重寫既有 Round；同一交易不得同時用兩種模式產生兩份正式財務效果。

### 5.3 換算方向與 snapshot

Provider Points 對 USDT 的 rate 必須以欄位名稱固定方向，例如：

```text
provider_points_per_usdt = N
amount_usdt = amount_points / provider_points_per_usdt
```

若正式 Backend 選擇反向欄位，則必須明確命名為 `usdt_per_provider_point`，不得只存模糊的 `conversion_rate`。

GGAP 原生顯示幣別換算使用獨立的 `base_rate` 語意：

```text
base_rate = N display_currency per 1 USDT
amount_usdt = amount_native / base_rate
```

兩條 rate 可以來自不同 profile，絕不能拿第 4 節的固定投注幣別倍率代替。每筆有效 settlement version 至少保存：

- 原始 Points、USDT 及有使用時的 native amount／currency。
- rate 值、方向、`conversion_rule_id`／rate ID、來源與生效時間。
- integration mode、payload version、量化前必要中間值與量化後正式金額。
- `calculated_at`、settlement version 及可回溯的規則 snapshot。

### 5.4 Decimal、量化與顯示

- 所有正式金額與 rate 以 JSON decimal string 傳輸；不得以 JavaScript binary float 作為正式計算值。
- Points、USDT、native amount 與 rate 各自具有固定 storage／calculation scale；正式位數由 Backend／Finance 對照 GGAP 契約填入。
- 一個 calculation profile 只能使用一個明確 rounding mode；不得由前端或各報表自行決定。
- 每筆 settlement version 建立時完成換算與量化；營運聚合加總已保存的正式值，不套用最新 rate。
- 顯示精度可少於儲存精度，但詳情與匯出必須能依權限提供可對帳值。
- 若要計算淨額，先以未量化的同一來源算式計算，再依 profile 量化；不得用兩個已分別取位的顯示值相減冒充正式淨額。

---

## 6. 財務指標、調整與正式結算邊界

<div class="decision-item-meta"><span>DP01-06</span><a href="open-issues.html#tbd-dom-002">TBD-DOM-002</a><a href="open-issues.html#tbd-dat-001">TBD-DAT-001</a><i>Product · Finance · Backend · Data · QA</i></div>

<aside class="decision-recommendation">
  <strong>目前需求基準</strong>
  <p>正式報表以 Production 中有效 Bet、Payout、Settlement 與 Adjustment 為唯一來源。玩家淨輸贏與 Provider GGR 使用相反視角；營運報表可版本化重算，鎖定日結只能用後續調整修正。</p>
</aside>

### 6.1 正式公式與方向

對目前非多人共池玩法，基本方向為：

```text
player_net = total_payout - total_bet
provider_ggr = total_bet - total_payout
```

| 指標 | 定義 | 正值代表 |
|---|---|---|
| `total_bet` | 有效 Bet 金額加總 | 玩家投注增加 |
| `total_payout` | 依 `payout_scope` 計入一次的有效派彩金額 | 玩家取得派彩增加 |
| `player_net` | `total_payout - total_bet` | 玩家淨贏 |
| `provider_ggr` | `total_bet - total_payout` | Provider 毛遊戲收入為正 |
| `round_count` | 有效 `round_id` 去重數 | 有效局數 |
| `bet_count` | 有效 `bet_id` 數 | 有效投注筆數 |
| `average_bet` | `total_bet / bet_count` | 每筆 Bet 平均金額 |
| `member_count` | distinct opaque `member_ref` | 該查詢範圍的不重複會員脈絡數 |

`member_count` 是非可加總指標：各代理商、遊戲或日期分組的 distinct count 相加不一定等於總數。API 必須直接回傳查詢範圍總 distinct 值。

### 6.2 有效資料與重複計算防護

- 只納入 Production；DEMO、Test 必須在資料來源／partition 層隔離，而不是只靠前端預設篩選。
- `cancelled`、`failed` 及完整 `rolled_back` 不產生目前有效投注／派彩效果。
- `settled` 使用目前有效 settlement version；舊版本仍保存但不重複聚合。
- `payout_scope=bet` 時加總 Bet 級 payout；`payout_scope=round` 時只加總 Round 級 payout；`hybrid` 依 settlement line 的入帳標記計一次。
- Adjustment 以 signed amount 影響指定財務指標與帳期，不增加 Round／Bet 計數。
- 同一 transaction、settlement line、adjustment 或 Callback 的冪等重送不得增加第二次財務效果。

### 6.3 營運報表與正式結算

| 面向 | Provider 營運報表 | GGAP 正式日結 |
|---|---|---|
| 目的 | 即時查詢、營運分析、問題追蹤 | 雙方對帳與正式應收／應付 |
| 時間 | 依查詢 `time_basis`／report timezone | 依 `business_date`／settlement timezone |
| 更新 | 新 settlement version 或 correction 後可重算 | 鎖定後不改寫；差異進新 adjustment／reversal |
| 追溯 | `data_version`、`calculated_at` | `settlement_batch_id`、rate snapshot、locked version |
| 維度 | 遊戲、版本、代理商快照等分析維度 | `provider_id + settlement_currency + period` 為正式主維度 |

代理商 × 遊戲是 Provider 分析與追查維度，不是 Provider 與 GGAP 的正式結算主鍵。正式 `provider_payable` 也不等同 GGR；GGAP 若套用 provider cost、固定費、分成或 adjustment，必須保存各自 line item、公式版本與來源，不能用單一 GGR 欄位替代。

### 6.4 調整、回滾與對帳差異

- 部分金額更正：建立新 settlement version 或 adjustment，保存原值、新值、delta、原因與責任人。
- 完整沖回：Round 進入 `rolled_back`，建立 reversal 連回原始 transaction／settlement；不得刪除原資料。
- 跨期更正：營運報表可在新 `data_version` 呈現重算結果；正式日結以新帳期 adjustment 反映。
- Provider 與 GGAP 金額、狀態或 rate snapshot 不一致時建立 reconciliation evidence，顯示雙方值與差異，不以任一方最新值靜默覆蓋。
- 所有人工調整需具權限、原因、前後值、actor、時間、request／trace ID 與必要覆核。

## 七個頁面的產品分工

| 頁面 | 核心問題 | 主要資料單位 | 邊界 |
|---|---|---|---|
| 遊戲紀錄 | 單筆 Round 發生了什麼？ | Round＋Bet＋交易／結算／調整證據 | 追溯明細，不自行重算另一套財務 |
| 財務總覽 | 指定期間整體投注、派彩與 GGR 如何？ | 有效財務效果聚合 | 使用 `settled_at` 與正式公式 |
| 代理商 × 遊戲彙總 | 哪些代理商脈絡與遊戲構成結果？ | 分析維度聚合 | 不成為正式結算主維度或代理商主檔 |
| 儀表板 | 現在最重要的業務摘要為何？ | 已定義來源的摘要 | 不建立獨立計算口徑 |
| 監控總覽 | Round 流程目前是否健康？ | 狀態／延遲／錯誤率 | 不修改財務結果 |
| 風控報表 | 哪些異常與 Round 證據有關？ | Risk Event＋Round 關聯 | 不取代 Round 或 settlement |
| 風控告警／處理 | 誰處理異常，是否需要緩解？ | Alert＋Mitigation Job | 隔離不取消既有 Round 或竄改金額 |

## 原型與後續實作對照

| 能力 | 現行 Portal | 本規格要求的後續結果 |
|---|---|---|
| 遊戲紀錄與財務頁面 | 已有高擬真 mock、篩選、列表、摘要與明細 | 接上 Round 1:N Bet、正式計數與版本化財務來源 |
| Round 狀態 | 使用 mock 狀態與單列資料 | canonical enum、append-only event、reconciliation 與相容映射 |
| 投注設定 | 頁面已有遊戲／數值設定骨架 | 三層版本模型、Launch snapshot 與 Backend 驗證 |
| Points／USDT | 目前以展示換算值為主 | 金額角色分層、integration mode、rate snapshot 與 decimal profile |
| 財務與日結 | mock 加總與趨勢 | 營運報表版本、正式 settlement batch、adjustment 與 reconciliation |
| 跨頁導流 | 已有 query／deep link 概念 | 傳遞 environment、time basis、版本與穩定識別 |

目前這個 session 只重寫規格網站內容，不修改 Portal Vue 原型或原始頁面 Spec MD。後續應先將本包同步至來源 Spec MD，再由新的開發 session 依三方一致內容實作原型與 Backend 契約。

## 外部驗證點

以下內容不改變產品功能方向，但需在取得 GGAP 或現行 Backend Git 後填入實際值並產出差異表：

1. Round、Bet、Transaction、Settlement、Adjustment 的 migration、model、enum、唯一鍵及實際狀態轉換。
2. Launch、Bet、Win、Refund、Rollback、查單、Callback 的 path、payload version、簽章、錯誤碼與冪等契約。
3. 正式 decimal storage／calculation／display scale、rounding mode、rate ID、rate 來源與序列化規則。
4. `USDT_ONLY` 的實際 payload，以及 `NATIVE_CURRENCY` 是否已被 GGAP Backend 支援、可啟用幣別與切換 scope。
5. 時間 query、Callback 延遲處理、00:00 匯率鎖定、01:00 T-1 日結及 settlement job 的實際 mapping。
6. GGAP provider cost、固定費、分成、調整與 payable line item 的正式公式及 settlement schema。
7. 正式 permission key、敏感 member reference 遮罩、雙人覆核、資料保存年限與 audit 匯出方式。

取得證據後，逐項選擇「沿用現況、調整 Backend、調整規格或增加相容層」，不得直接用既有實作靜默覆蓋本需求基準。

## 規格同步範圍

本包完成審閱後，下一步同步更新：

- `docs/GAME_ROUND_AND_REPORTING_SPEC.md`
- `docs/GAME_ROUND_RECORDS_SPEC.md`
- `docs/GAME_VENDOR_FINANCE_REPORTING_SPEC.md`
- `docs/GAME_VENDOR_FINANCE_OVERVIEW_SPEC.md`
- `docs/GAME_VENDOR_FINANCE_AGENT_GAME_SPEC.md`
- `docs/PROVIDER_GGAP_INTEGRATION_CONTRACT.md`
- 規格網站的遊戲紀錄、財務、儀表板、監控與風控頁面，以及共通 enum、資料字典、API／QA 章節

同步時以本包的 Round／Bet 基數、三層投注設定、幣別角色、時間角色與財務公式為上游；頁面文件只描述各自呈現與操作，不重複發明不同口徑。
