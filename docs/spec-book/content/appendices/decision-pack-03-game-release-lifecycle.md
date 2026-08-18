# Decision Pack 03｜遊戲版本與發布生命週期

<section class="decision-pack-hero decision-pack-hero--release" data-pack="DP / 03" aria-label="Decision Pack 03 摘要">
  <div class="decision-pack-hero__identity">
    <span>PHASE 3 · PRODUCT CONTRACT 03</span>
    <strong>讓同一份可追溯遊戲版本，安全而快速地走完建置、驗證、發布與復原</strong>
    <p>本包直接定義 Provider Portal 希望具備的遊戲版本與發布功能。日常版本採自動檢查與單一發布管理者的快速通道；只有金額、數值、契約、資料結構與安全相關變更才進入第二人核准的高風險通道。</p>
  </div>
  <div class="decision-pack-hero__stats">
    <div><strong>08</strong><span>共用契約群組</span></div>
    <div><strong>03</strong><span>完全隔離環境</span></div>
    <div><strong>02</strong><span>發布風險通道</span></div>
    <div><strong>01</strong><span>Active Release 真實來源</span></div>
  </div>
  <nav class="decision-pack-hero__nav decision-pack-hero__nav--release" aria-label="八項契約快速導覽">
    <a href="#1-四個核心物件與責任邊界"><b>01</b><span>核心物件</span></a>
    <a href="#2-版本與發布狀態"><b>02</b><span>生命週期</span></a>
    <a href="#3-三環境晉級"><b>03</b><span>環境晉級</span></a>
    <a href="#4-快速發布與高風險發布"><b>04</b><span>發布流程</span></a>
    <a href="#5-全域可用性與-ggap-邊界"><b>05</b><span>可用性邊界</span></a>
    <a href="#6-失敗回滾與緊急控制"><b>06</b><span>復原控制</span></a>
    <a href="#7-launch-與-game-round-相容性"><b>07</b><span>Round 相容</span></a>
    <a href="#8-權限稽核通知與驗收"><b>08</b><span>治理驗收</span></a>
  </nav>
</section>

## 文件定位

| 項目 | 目前需求基準 |
|---|---|
| 契約編號 | `DP-03` |
| 主題 | Game、Version、Artifact、Release、環境晉級、全域可用性、回滾與既有 Game Round 相容 |
| 直接影響頁面 | 遊戲列表、遊戲版本、環境與發布、遊戲設定、數值設定、遊戲素材 |
| 間接影響頁面 | 遊戲紀錄、監控總覽、風控報表、風控告警／處理、GGAP 對接 |
| 納管環境 | Test、DEMO、Production 各自部署與永久資料隔離 |
| 現行程式 | 遊戲管理已有多頁內容原型；環境與發布仍為 Placeholder，正式發布副作用尚未實作 |
| 文件用途 | 表達目前希望的完整產品功能；現有 Backend 與部署工具只用於後續接軌與差異分析 |

本包不是等待 Backend Git 的草稿。產品行為依本包成立；資料表、API path、CI/CD、permission key、GGAP payload 與實際 enum 取得後再建立 Mapping，不以現況缺口降低目前需求。

## 不可違反的產品邊界

1. Provider 擁有遊戲主資料、版本、Artifact、數值、素材、環境發布與全域上下架；GGAP 不建立或修改 Provider 版本。
2. GGAP 只針對 Provider 已全域可用的遊戲控制各代理商是否開放；Provider 不管理代理商、商戶、會員或錢包主資料。
3. Version 是功能快照，Artifact 是不可變執行產物，Release Record 是環境發布事實；三者不得共用同一個狀態或被原地覆寫。
4. Test、DEMO、Production 的資料、憑證、Game Round、財務與統計永久隔離；Test 不納入 Provider 正式監控與風控。
5. Production 必須使用已在 DEMO 通過的同一份 Artifact；任何會改變遊戲行為的內容變更都重新驗證。
6. 一般發布走快速通道；只有數值、金額、契約、資料結構、安全與無安全回滾等高風險變更要求第二人核准。
7. 發布、回滾、維護或隔離只改變新 Launch 與新 Round 的入口；既有 Game Round 永久依原版本完成。
8. Provider 緊急停用先在本地立即拒絕新 Launch，再可靠通知 GGAP；不得等待外部 ACK 才保護服務。

## 版本到服務的完整鏈

<ol class="release-lifecycle-flow" aria-label="遊戲版本與發布生命週期">
  <li><b>01</b><strong>Game</strong><span>穩定遊戲主體與全域可用性</span></li>
  <li><b>02</b><strong>Version</strong><span>程式、數值、設定與素材快照</span></li>
  <li><b>03</b><strong>Artifact</strong><span>不可變 build、manifest 與 checksum</span></li>
  <li><b>04</b><strong>Promotion</strong><span>Test → DEMO → Production 晉級</span></li>
  <li><b>05</b><strong>Release</strong><span>檢查、排程、部署、驗證與切換</span></li>
  <li><b>06</b><strong>Active</strong><span>新 Launch 使用的唯一有效版本</span></li>
</ol>

鏈上每一層都保存自己的 ID、版本、時間與狀態。版本是否成熟、某次部署是否成功，以及哪個 Production Release 目前有效，是三個不同問題。

---

## 1. 四個核心物件與責任邊界

<div class="decision-item-meta"><span>DP03-01</span><a href="open-issues.html#tbd-dom-003">TBD-DOM-003</a><a href="open-issues.html#tbd-dat-004">TBD-DAT-004</a><i>Product · Game Engineering · Backend</i></div>

<aside class="decision-recommendation">
  <strong>目前需求基準</strong>
  <p>Game 是長期主體，Version 是功能快照，Artifact 是不可變的執行產物，Release Record 是不可覆寫的環境發布事實。</p>
</aside>

### 1.1 Game

Game 使用穩定 `game_id` 表示一款遊戲，不因版本更新而更換。Provider 維護名稱、類型、介紹、目錄素材、語言、幣別、裝置、投注結構、投注幣別倍率、下注限額方案與全域可用性。

Game 不保存「目前版本」的可變副本；目前有效版本由 Production 的 Active Release 決定。

### 1.2 Game Version

Version 是一個可被驗證、審核與發布的完整功能快照，至少綁定：

- 遊戲程式與功能版本。
- 數值、RTP、賠付表與投注規則版本。
- 遊戲設定、限額與幣別倍率版本。
- 素材、語系與必要相容性資訊。
- 版本說明、已知問題與最低需求。

一款 Game 可有多個 Version；已成功發布 Production 的 Version 永久凍結，任何變更建立新版本或 Patch Version。

### 1.3 Build Artifact

每次建置產生唯一 `build_id`，並保存 Artifact manifest、checksum、Git commit、建置時間與各組成產物。Artifact 建立後不可覆寫；重新建置即使內容相似，也必須得到新的 `build_id`。

Test 可以反覆驗證不同 build。進入正式候選後，Version 綁定確切 Artifact；Production 不得用同一版本號悄悄替換執行內容。

### 1.4 Release Record

Release Record 代表「哪個 Version 與 Artifact，在何時以什麼結果進入哪個環境」。至少保存 `release_id`、目標環境、提交與執行者、風險通道、排程、驗證、前後 Active Release、回滾來源、結果與錯誤。

重新發布、失敗重試與回滾都建立新紀錄。核心綁定資料提交後不可改寫；狀態變化追加到 `release_status_history`。

### 1.5 關聯基數

| 關聯 | 正式語意 |
|---|---|
| Game 1:N Version | 一款遊戲可保留多個開發中、候選與已發布版本 |
| Version 1:N Build | Test 期間可有多次 build；正式候選綁定一個確切 Artifact manifest |
| Version 1:N Release | 同一版本可在不同環境發布，也可因重試或回滾產生多筆紀錄 |
| Environment 1 Active Release／Game | 同一遊戲在同一環境，同一時間只有一筆有效 Release |
| Release 1:N Status Event | 狀態、檢查、錯誤與操作者以 append-only 歷程保存 |

---

## 2. 版本與發布狀態

<div class="decision-item-meta"><span>DP03-02</span><a href="open-issues.html#tbd-dom-003">TBD-DOM-003</a><a href="open-issues.html#tbd-api-005">TBD-API-005</a><i>Product · Backend · QA</i></div>

<aside class="decision-recommendation">
  <strong>目前需求基準</strong>
  <p>Version 狀態描述內容成熟度；Release 狀態描述一次環境部署結果；現行版本只由目前生效的 Active Release 判定。</p>
</aside>

### 2.1 Version 生命週期

| API 值 | 顯示名稱 | 主要語意 |
|---|---|---|
| `draft` | 草稿 | 可編輯內容、建立 build，僅能正式部署 Test |
| `candidate` | 發布候選 | 已選定 Artifact 與完整快照，可進行 Test／DEMO 正式驗證 |
| `approved` | 已核准 | 必要驗證通過，可建立或執行 Production Release |
| `published` | 已發布 | 至少一次成功發布 Production；內容與 Artifact 永久凍結 |
| `retired` | 已退役 | 不再作為新 Launch、一般發布或回滾目標，歷史仍可追溯 |
| `cancelled` | 已取消 | 尚未成功發布 Production 的版本停止開發，保留取消證據 |

主要流程：

```text
draft → candidate → approved → published → retired
  └──────────────→ cancelled
candidate／approved → draft（內容變更並使既有核准失效）
```

`published` 只表示曾成功發布，不表示目前仍是 Active Version。被新版取代是由 Release 關係推導，不反覆改寫 Version 狀態。

### 2.2 Release 技術狀態與主要顯示

後端可保存 `checking`、`prechecking`、`deploying`、`verifying` 等細節；主要列表只聚合顯示：

| 主要顯示 | 對應語意 |
|---|---|
| 準備中 | 草稿、提交、自動檢查與需要修正 |
| 等待核准 | 被判定為高風險，等待另一位管理者核准 |
| 已排程 | 檢查與必要核准完成，等待執行 |
| 發布中 | 預檢、部署、健康驗證與流量切換進行中 |
| 已成功 | 新 Release 已成為 Active |
| 已失敗 | 本次嘗試停止，保存失敗階段與原因 |
| 已取消 | 尚未產生不可逆副作用前取消 |
| 已回滾 | 本次 Release 已被新的回滾 Release 取代 |

Release 失敗不會把 Version 自動退回草稿；只有內容需要修改時才建立新 build 並重新驗證。

---

## 3. 三環境晉級

<div class="decision-item-meta"><span>DP03-03</span><a href="open-issues.html#tbd-dom-003">TBD-DOM-003</a><a href="open-issues.html#tbd-nfr-003">TBD-NFR-003</a><i>Game Engineering · QA · SRE · Backend</i></div>

<aside class="decision-recommendation">
  <strong>目前需求基準</strong>
  <p>Test 驗證開發內容、DEMO 驗證正式候選、Production 只接受已在 DEMO 通過的同一份 Artifact；三個環境的資料、憑證與統計永久隔離。</p>
</aside>

<div class="release-environment-rail" aria-label="Test DEMO Production 環境晉級">
  <article><b>01 · TEST</b><strong>快速試錯</strong><span>Draft／Candidate、多次 build、Mock 與技術驗證；不進正式監控風控。</span></article>
  <article><b>02 · DEMO</b><strong>完整候選驗證</strong><span>只接受 Candidate，串接 GGAP Sandbox，驗證 Launch、Round、Callback 與幣別限額。</span></article>
  <article><b>03 · PRODUCTION</b><strong>正式業務</strong><span>只接受 Approved 與同一 Artifact；正式 Round、財務、監控與風控由此開始。</span></article>
</div>

### 3.1 晉級規則

```text
Draft／Candidate → Test → DEMO → Approved → Production
```

- Test 可替換 build；DEMO 通過後不可為 Production 重新建置。
- 程式、RTP、賠付表、投注計算、Game Round 規則、核心素材或影響結果的 Feature Flag 變更，都產生新 `build_id` 並重新驗證。
- API endpoint、憑證、Domain、CDN、Log level、容量與不影響遊戲結果的營運設定可依環境不同，但必須版本化並通過環境檢查。
- 同一遊戲在同一環境同一時間只允許一筆 Active Release；新的 Active 生效後才取代舊者。

### 3.2 資料隔離

每筆環境資料都具備不可省略的 `environment`，並在憑證、儲存、查詢、報表與匯出層隔離：

- Test 只供技術驗證，不產生正式財務、正式 Game Round、Risk Event 或 Alert。
- DEMO 可產生獨立展示與 Sandbox 整合資料，但不進 Production KPI、財務或遊戲紀錄。
- Production 是唯一正式業務資料來源；正式 API 必須拒絕 Test／DEMO 憑證。

---

## 4. 快速發布與高風險發布

<div class="decision-item-meta"><span>DP03-04</span><a href="open-issues.html#tbd-api-005">TBD-API-005</a><a href="open-issues.html#tbd-sec-003">TBD-SEC-003</a><i>Product · Release Manager · Security · Backend</i></div>

<aside class="decision-recommendation">
  <strong>目前需求基準</strong>
  <p>一般發布採單一發布管理者加自動檢查的快速流程；只有金額、數值、契約、資料結構、安全與無安全回滾等高風險變更才要求第二人核准。</p>
</aside>

<div class="release-lanes" aria-label="兩種發布通道">
  <article class="release-lane release-lane--fast">
    <span>DEFAULT · FAST LANE</span>
    <strong>標準快速發布</strong>
    <p>DEMO 已通過、同一 Artifact、沒有高風險變更且具備穩定回滾版本時，發布管理者可自行提交並立即發布或排程。</p>
    <code>自動檢查 → 一人確認 → 發布</code>
  </article>
  <article class="release-lane release-lane--guarded">
    <span>EXCEPTION · GUARDED LANE</span>
    <strong>高風險發布</strong>
    <p>涉及 RTP、賠付、幣別倍率、限額、Round／Callback 契約、migration、安全、略過檢查或沒有安全回滾時，要求第二位管理者核准。</p>
    <code>自動檢查 → 第二人核准 → 發布</code>
  </article>
</div>

### 4.1 使用者操作

一般 Production Release 只要求：

1. 選擇已通過 DEMO 的版本。
2. 填寫簡短更新說明。
3. 選擇立即發布或排程時間。
4. 確認執行。

系統自動帶入 `build_id`、Artifact checksum、DEMO 驗證、目前 Active Release、建議回滾版本、GGAP 設定、風險分類、發布後健康檢查與自動回滾條件。

### 4.2 發布執行

```text
自動檢查 → 排程／立即執行 → 再次預檢 → 部署
→ 健康與 Launch 驗證 → 原子切換 Active Release → 觀察
```

- 不得先切換流量，再等待健康檢查。
- 自動檢查失敗時不允許執行，也不得把 Release 標記成功。
- 同一遊戲與環境同時只能執行一筆發布。
- 時間後端以 UTC 保存，介面預設顯示 `Asia/Taipei` 與時區。
- 修改 Version、Artifact、數值或核心設定會使既有核准失效；只調整排程時間可保留核准，但需記錄前後時間。

### 4.3 取消與重試

- 草稿、檢查中、等待核准與已排程可由具權限者取消並填寫原因。
- 進入部署後不可一般取消，只能等待失敗處理、緊急停止或回滾。
- 已 Active 的 Release 不可取消，只能回滾、停用或以其他版本取代。
- 失敗重試建立新 Release Record，不覆寫原失敗紀錄。

### 4.4 簡化角色

| 角色 | 主要能力 |
|---|---|
| 唯讀 | 查看版本、發布、驗證與 audit |
| 編輯者 | 管理版本、Artifact、Test 與 DEMO |
| 發布管理者 | 一般 Production 發布、排程、取消與回滾 |
| 管理員／緊急處理者 | 高風險核准、緊急停用與特殊限制解除 |

後端仍可使用細粒度 Permission 強制授權，但主要 UI 不要求使用者理解大量 permission key。

---

## 5. 全域可用性與 GGAP 邊界

<div class="decision-item-meta"><span>DP03-05</span><a href="open-issues.html#tbd-ext-001">TBD-EXT-001</a><a href="open-issues.html#tbd-api-005">TBD-API-005</a><i>Provider · GGAP · Backend · Product</i></div>

<aside class="decision-recommendation">
  <strong>目前需求基準</strong>
  <p>Provider 決定遊戲能否全域提供；GGAP 決定已可用遊戲開放給哪些代理商。全域停用立即生效，全域啟用則在 GGAP 確認後才對外生效。</p>
</aside>

### 5.1 Provider 全域狀態

| API 值 | 顯示名稱 | 新 Launch |
|---|---|---|
| `unpublished` | 未上架 | 拒絕；可繼續 Test、DEMO 與 Production 準備 |
| `available` | 已上架 | Provider 允許，仍須通過 GGAP 代理商與使用者資格 |
| `maintenance` | 維護中 | 暫停；保留版本與 GGAP 原代理商設定 |
| `suspended` | 已暫停 | 事故、風控或安全緊急停止，立即拒絕 |
| `retired` | 已退役 | 永久拒絕；歷史 Round、財務與發布資料保留 |

Production 發布成功不自動代表全域上架。Provider 可先完成部署與驗證，再單獨決定何時切換 `available`。

### 5.2 最終 Launch Gate

```text
允許 Launch =
Provider global status 為 available
AND 存在有效 Production Active Release
AND 沒有 Provider 維護／暫停／隔離
AND GGAP 已對該代理商開放遊戲
AND GGAP 判定代理商、商戶與會員可使用
```

Provider 不建立或修改代理商、商戶、會員與錢包，也不替不同代理商指定不同 Provider 版本。GGAP Launch 應使用 Provider 當前有效版本。

### 5.3 同步安全策略

- 上架：Provider 發出狀態與版本，等待 GGAP ACK 後才對外允許新 Launch。
- 下架、維護、暫停：Provider 先在本地立即拒絕新 Launch，再以 outbox／等價可靠方式通知 GGAP 並持續重試。
- Provider 全域停用不刪除 GGAP 代理商開放設定；恢復 `available` 且同步成功後，原設定可重新生效。
- 每次同步至少可追蹤 `game_id`、Active Version、`release_id`、狀態、生效時間、原因、事件版本、idempotency key 與 ACK。

實際 event name、payload、簽章、錯誤碼與 ACK 格式屬後續接軌 Mapping，不阻擋本責任邊界成立。

---

## 6. 失敗回滾與緊急控制

<div class="decision-item-meta"><span>DP03-06</span><a href="open-issues.html#tbd-nfr-003">TBD-NFR-003</a><a href="open-issues.html#tbd-sec-003">TBD-SEC-003</a><i>SRE · Release Manager · Risk · Backend</i></div>

<aside class="decision-recommendation">
  <strong>目前需求基準</strong>
  <p>切換前失敗就維持舊版本；切換後失敗優先回滾；無法安全回滾就停止新 Launch；緊急停用立即在 Provider 生效。</p>
</aside>

### 6.1 失敗判斷

| 發生位置 | 主要行為 |
|---|---|
| Active 切換前 | Release 標記失敗，原 Active Release 繼續服務，不需假回滾 |
| 切換中或發布後驗證 | 停止新流量，使用預先指定版本自動回滾 |
| 已正常生效後事故 | 依影響隔離版本、人工回滾、全域暫停或發布修正版 |

每次 Production Release 必須預先指定回滾目標。目標需曾成功發布、Artifact 與設定完整、尚未退役、健康可用，且與目前資料格式及既有 Round 相容。

### 6.2 回滾

回滾建立新的 Release Record，直接使用原保留 Artifact，不重新建置舊版本。發布驗證期間的硬性失敗可依已核准 Release Plan 自動回滾；發布後較晚發現的問題由發布管理者人工回滾並記錄關聯事件。

若不存在安全回滾版本：

```text
停止新 Launch → global status = suspended → 等待 Forward Fix
```

不可逆 migration 必須在發布前標示「不可自動回滾」，準備 Forward Fix 與安全停用方案。

### 6.3 隔離與緊急停用

隔離至少支援遊戲＋環境，必要時縮小到版本。系統分開保存：

| 維度 | 目的 |
|---|---|
| `desired_state` | 目前要求 Launch Gate 達成 `isolated` 或 `not_isolated` |
| `actual_state` | 實際為未隔離、套用中、隔離中、解除中或失敗 |

隔離 Job 失敗時不得顯示為成功；應產生 Critical Alert，並在無法確定 Launch Gate 安全時改為全域 `suspended`。

緊急停用可由具緊急權限者單獨執行，不等待一般發布審核或 GGAP ACK。系統立即拒絕新 Launch、建立 Risk Event／Alert／audit，並可靠通知 GGAP。

### 6.4 恢復服務

解除隔離或暫停前至少要求：問題已修復或成功回滾、健康檢查與必要觀察窗口通過、沒有阻擋恢復的重大 Risk Event、Round／GGAP 驗證成功，以及具權限人員確認。

已被回滾的問題版本即使仍是 `published`，也禁止再次發布；若內容改變，建立新 Version 與 Artifact 重新走 Test／DEMO。

---

## 7. Launch 與 Game Round 相容性

<div class="decision-item-meta"><span>DP03-07</span><a href="open-issues.html#tbd-dom-001">TBD-DOM-001</a><a href="open-issues.html#tbd-dat-004">TBD-DAT-004</a><i>Backend · GGAP · Game Engineering · Finance</i></div>

<aside class="decision-recommendation">
  <strong>目前需求基準</strong>
  <p>Launch Context 短期綁定版本，Game Round 永久固定版本；發布、回滾、維護或隔離只改變新流量去向，既有 Round 依原版本完成與結算。</p>
</aside>

### 7.1 不建立 Game Session

Provider 可發出短效 Launch Token／Launch Context，綁定 `game_id`、`version_id`、`build_id`、`release_id`、環境、幣別、語系、GGAP Context、發出與到期時間；它是安全與路由資料，不是正式業務單位，不建立長期 Game Session 主資料。

Game Round 仍是唯一主要業務紀錄單位。

### 7.2 版本切換

| 時點 | 使用版本 |
|---|---|
| Active 切換前已發出的有效 Launch Context | 維持原版本直到 Token 到期或被強制失效 |
| Active 切換後的新 Launch | 使用新的 Active Version |
| 舊版本已開始的 Game Round | 永久依原版本、數值、倍率與限額完成 |
| 回滾後的新 Launch | 使用回滾後成為 Active 的版本 |
| 回滾前已由問題版本建立的 Round | 保留問題版本，不改寫成回滾版本 |

預設採平順切換；安全漏洞、錯誤賠付或重大數值問題可採強制切換，停止舊 Token 建立新 Round 並要求重新 Launch。平順或強制策略記錄於 Release Plan。

### 7.3 Round 不可變快照

Game Round 建立時至少固定：`round_id`、Game、Version、Build、Release、數值／RTP、投注結構、幣別倍率、限額方案、環境與建立時間。同一 Round 的多筆 Bet、Settlement、Cancel、Refund 與 Callback 都沿用相同快照。

發布、下架或隔離不得：

- 把舊 Round 改綁目前 Active Version。
- 用新數值重新計算舊 Round。
- 自動結束、取消、歸零或刪除既有 Round。
- 把舊版本財務結果歸到新版本。

### 7.4 維護與晚到請求

`maintenance`、`suspended` 或隔離後停止新 Launch 與新 Round，但仍接受既有 Round 必要的 Settlement、Cancel、Refund、Callback、冪等重試與查詢。

晚到請求先依 `round_id` 找回原版本與快照，再按原契約處理。找不到 Round 或版本快照時進入異常處理，不自行建立假 Round 補齊。

舊 Artifact 至少保留到「Launch Token 最長有效期＋Round 最長合理生命週期＋Callback／重試期間＋安全緩衝」結束。Breaking Change 需建立新的 Contract Version，舊契約保留至相關 Round 全部完成。

---

## 8. 權限稽核通知與驗收

<div class="decision-item-meta"><span>DP03-08</span><a href="open-issues.html#tbd-sec-001">TBD-SEC-001</a><a href="open-issues.html#tbd-sec-003">TBD-SEC-003</a><i>Product · Security · QA · Release Manager</i></div>

<aside class="decision-recommendation">
  <strong>目前需求基準</strong>
  <p>把安全控制盡量自動化並藏在流程後方：日常操作保持三步完成，高風險才增加核准；所有事實自動 audit，不要求使用者重複填寫。</p>
</aside>

### 8.1 權限與操作負擔

- Test 可由編輯者快速部署；DEMO 由具環境權限者確認；一般 Production 由發布管理者一人完成。
- 高風險發布才要求第二位管理者核准；提交者不得代替所需的第二位核准者。
- 緊急停用可以一人立即執行；解除時需健康驗證與具權限確認。
- 一般成功發布直接沿用版本更新說明；只有取消、人工回滾、略過檢查、隔離、緊急停用與強制解除要求額外原因。

### 8.2 Append-only Audit

所有人工與自動操作至少保存 actor／System、角色與權限快照、action、目標 ID、環境、前後值、原因、時間、request／correlation／trace ID、成功失敗、錯誤與關聯 Release／Risk Event／GGAP ACK。

已提交 Version、Artifact checksum、核准、Release、上下架、回滾、隔離、緊急停用與 Audit Log 不得由一般介面刪除。更正採追加補充，不修改歷史；Log 不保存密碼、Secret、完整 Token 或不必要的會員敏感資料。

### 8.3 最小必要通知

完整通知中心仍是 Deferred；本包只要求產生可追蹤的發布事件。主動通知集中在需要行動或有風險的情況：

- 高風險發布等待核准。
- 發布失敗或自動／人工回滾。
- 隔離、緊急停用與服務恢復。
- GGAP 同步持續失敗或長時間未 ACK。

一般提交、檢查通過與發布成功只進活動時間線，可對提交人顯示結果，不大量推播。通知以 `release_id`、`risk_event_id` 或 `incident_id` 聚合。

### 8.4 核心驗收情境

| 情境 | 預期結果 |
|---|---|
| Draft 直接發布 Production | 拒絕，提示尚未完成 DEMO 與核准條件 |
| Production Artifact 與 DEMO 不同 | 拒絕，要求新 build 重新走 Test／DEMO |
| 一般低風險版本發布 | 發布管理者通過自動檢查後可一人立即或排程發布 |
| RTP、限額、Callback 或 migration 變更 | 自動判為高風險，等待第二位管理者核准 |
| Active 切換前發布失敗 | 原版本繼續服務，新版本不接收 Launch |
| 切換後健康驗證失敗 | 使用預先指定 Artifact 建立回滾 Release |
| 舊 Round 晚到 Settlement | 依原 Version 與數值快照完成，不用 Active Version 重算 |
| Provider 維護但 GGAP 代理商仍啟用 | 新 Launch 拒絕，GGAP 原開關設定保留 |
| 緊急停用且 GGAP 未 ACK | Provider 立即拒絕新 Launch，外部同步持續重試 |
| Test、DEMO、Production 同時有相同 Game | 正式紀錄與財務只出現 Production，環境資料不混合 |

## 六個頁面的產品分工

| 頁面 | 核心責任 | 不負責 |
|---|---|---|
| 遊戲列表 | Game 主資料、環境摘要、Active Version 與全域可用性入口 | 不直接執行發布 |
| 遊戲版本 | 建立 Version、綁定 Artifact、查看驗證與候選成熟度 | 不把列表操作冒充 Production 成功 |
| 遊戲設定 | 維護一般設定與限額方案版本 | 不自行切換 Active Release |
| 數值設定 | 維護 RTP、賠付與數值版本，觸發高風險分類 | 不修改已發布數值快照 |
| 遊戲素材 | 維護不可變素材與語系版本 | 不以替換檔案覆寫已發布 Artifact |
| 環境與發布 | 晉級、風險通道、排程、部署、回滾、上下架與完整歷程 | 不管理 GGAP 代理商個別開關 |

## 原型與後續實作對照

| 能力 | 現行 Portal | 本規格要求的後續結果 |
|---|---|---|
| 遊戲、版本、設定、數值與素材頁 | 已有內容原型 | 以 Game／Version／Artifact／Release 關聯取代分散 mock 狀態 |
| 環境與發布 | 仍為 Placeholder | 實作三環境矩陣、快速／高風險通道、排程、驗證、回滾與歷程 |
| 版本與發布狀態 | 以頁面展示值為主 | 拆分 Version 成熟度、Release 結果與 Active Release |
| Production 操作 | 尚未產生正式副作用 | 後端自動檢查、風險分類、實際部署、健康驗證與 audit |
| GGAP 可用性同步 | 契約仍待現況對照 | Provider 全域狀態、可靠投遞、ACK 與代理商開關責任分離 |
| 既有 Round | 頁面規格已有保留原則 | Launch Context 與 Round 永久版本快照落實到正式契約 |

Decision Pack 03 已同步至原始頁面 Spec MD 與共用契約；目前仍不修改遊戲管理 Vue 原型。下一步由新開發 session 依「規格網站 → Spec MD → Portal 原型」順序實作。

## 實作接軌檢查清單

以下項目只用於拿到 Provider／GGAP Backend Git 後做現況 Mapping，不是本包的阻擋或待決策：

1. 現有 Game、Version、Artifact、Release 與 Active Version 的資料表、ID、enum 與 migration 對照。
2. CI/CD、Artifact Registry、同一 build 跨環境晉級、traffic switch、健康檢查與 rollback tool 的能力差異。
3. Launch Token 是否綁定 Version，以及 Game Round、Bet、Settlement、Cancel、Refund、Callback 的版本追溯現況。
4. GGAP 遊戲目錄、代理商遊戲開關、Launch Gate、狀態事件、ACK、冪等、重試與錯誤碼的實際命名。
5. 監控／風控 Isolation Job、desired／actual state、緊急停用與發布後健康驗證的整合點。
6. 現有角色、permission、Audit Log、通知事件與資料保存方式。

取得證據後輸出「已存在、部分存在、尚未存在、與需求衝突、僅命名不同、無法由 Git 判斷」差異表。差異表用來規劃實作；不直接以現有程式靜默覆蓋本需求基準。

## 規格同步範圍

本包已同步更新：

- `docs/GAME_LIST_SPEC.md`
- `docs/PROVIDER_GGAP_INTEGRATION_CONTRACT.md`
- 規格網站的遊戲列表、遊戲版本、環境與發布、遊戲設定、數值設定、遊戲素材頁
- 共通領域規則、資料字典、enum、API、安全、非功能性需求與 QA 章節

同步以本包為上游；各頁文件只描述自己的呈現與操作，不重複建立另一套 Version、Release、環境或上下架生命週期。實際 Backend／GGAP 證據取得後只新增 Mapping 與差異紀錄，不靜默改寫本基準。
