# Decision Pack 04｜官網與大廳內容發布契約

<section class="decision-pack-hero decision-pack-hero--content" data-pack="DP / 04" aria-label="Decision Pack 04 摘要">
  <div class="decision-pack-hero__identity">
    <span>PHASE 3 · PRODUCT CONTRACT 04</span>
    <strong>讓每一份公開內容都能精確預覽、安全發布、失敗保留舊版並完整追溯</strong>
    <p>本包直接定義 Provider 自有官網與遊戲大廳的內容生命週期。編輯中的 Revision 永不直接改變公開畫面；每次發布都綁定確切內容、語系、素材、驗證與核准證據，並由獨立 Published Snapshot 表示使用者目前真正看到的版本。</p>
  </div>
  <div class="decision-pack-hero__stats">
    <div><strong>09</strong><span>共用契約群組</span></div>
    <div><strong>04</strong><span>獨立發布流</span></div>
    <div><strong>04</strong><span>固定公開語系</span></div>
    <div><strong>37</strong><span>最低驗收情境</span></div>
  </div>
  <nav class="decision-pack-hero__nav decision-pack-hero__nav--content" aria-label="九項契約快速導覽">
    <a href="#1-核心物件與責任邊界"><b>01</b><span>核心物件</span></a>
    <a href="#2-共用引擎與獨立發布流"><b>02</b><span>發布流</span></a>
    <a href="#3-revision-job-與公開生命週期"><b>03</b><span>生命週期</span></a>
    <a href="#4-多語內容素材與-fallback"><b>04</b><span>語系素材</span></a>
    <a href="#5-驗證與精確預覽"><b>05</b><span>驗證預覽</span></a>
    <a href="#6-發布排程停用與還原"><b>06</b><span>發布復原</span></a>
    <a href="#7-權限核准併發與稽核"><b>07</b><span>治理稽核</span></a>
    <a href="#8-跨頁依賴替代狀態與驗收"><b>08</b><span>依賴驗收</span></a>
    <a href="#9-後端契約原型對照與外部邊界"><b>09</b><span>實作接軌</span></a>
  </nav>
</section>

## 文件定位

| 項目 | 目前需求基準 |
|---|---|
| 契約編號 | `DP-04` |
| 主題 | 官網與大廳內容編輯、Revision、驗證、精確預覽、核准、發布、排程、停用、還原與追溯 |
| 直接影響頁面 | Banner 管理、內容管理、官網發布紀錄、大廳總覽、遊戲清單、遊戲管理、大廳預覽 |
| 支援頁面 | DEMO 環境數據只提供 readiness／telemetry，不參與正式內容發布 |
| 上游依賴 | DP03 Game、Version、Asset 與 Provider global availability 的穩定識別及狀態 |
| 外部邊界 | GGAP 代理商開關與 Launch Gate 不由本包建立；通知中心、系統設定仍維持 Deferred |
| 現行程式 | 八個頁面均已有前端內容原型；正式內容持久化、發布副作用與公開前台串接尚待後續實作 |
| 文件用途 | 表達目前希望具備的完整產品功能；Backend、CDN、權限與 GGAP 證據取得後只補實作 Mapping |

本包不是等待 Backend Git 的草稿。產品行為依本包成立；實際 API path、資料表、Queue、Scheduler、CDN、permission key、event topic 與 GGAP Launch payload 取得後再建立 Mapping，不以現況缺口降低目前需求。

## 不可違反的產品邊界

1. DP04 只管理 Provider 自有官網與遊戲大廳的公開內容，不建立或修改 DP03 的 Game、Version、Artifact、Release 或遊戲數值。
2. 編輯、儲存與預覽不得直接改變公開內容；只有成功完成的 Publish Job 可以切換 Published Snapshot。
3. 官網 Banner、官網內容、大廳單款遊戲內容與大廳 Catalog 共用發布引擎，但各自擁有獨立 Revision、Job、Snapshot、失敗與還原歷程。
4. 公開內容可在遊戲不可啟動時顯示「即將推出」或維護資訊；能否真正 Launch 仍同時受 DP03 全域狀態與 GGAP 代理商開關控制。
5. Published Snapshot 必須固定確切 Revision、四語系有效內容、素材版本、Fallback 結果、驗證規則版本及核准證據，不得在執行時自動追蹤 `latest`。
6. 發布失敗必須保留舊的公開 Snapshot；還原不是原地覆寫，而是以歷史 Snapshot 建立新 Revision 與新 Publish Job。
7. DEMO 帳號、展示額度、試玩工作階段與 telemetry 不建立 Provider 會員、錢包或正式 Game Session，也不進入 Production Game Round、財務或 Provider 風控。
8. 前端的 `allowed_actions` 只控制操作呈現；後端每次儲存、預覽、核准、發布、停用與還原仍須重新驗證權限與資源版本。

## 從編輯到公開的完整鏈

<ol class="content-publishing-flow" aria-label="官網與大廳內容發布鏈">
  <li><b>01</b><strong>Content Entry</strong><span>穩定內容主體與 publication scope</span></li>
  <li><b>02</b><strong>Revision</strong><span>不可變文字、語系、素材與設定快照</span></li>
  <li><b>03</b><strong>Validation</strong><span>規則、依賴、安全與公開條件檢查</span></li>
  <li><b>04</b><strong>Preview</strong><span>依確切 Manifest 還原預計公開畫面</span></li>
  <li><b>05</b><strong>Publish Job</strong><span>立即、排程、停用或還原的執行工作</span></li>
  <li><b>06</b><strong>Snapshot</strong><span>對外唯一可見且可追溯的公開版本</span></li>
</ol>

鏈上每一層保存自己的 ID、狀態與時間。內容是否可繼續編輯、某次發布工作是否成功、目前公開的是哪個版本，以及 CDN 是否已健康傳播，是四個不同問題。

---

## 1. 核心物件與責任邊界

<div class="decision-item-meta"><span>DP04-01</span><a href="open-issues.html#tbd-dom-005">TBD-DOM-005</a><a href="open-issues.html#tbd-dat-004">TBD-DAT-004</a><i>Product · Content Operations · Backend</i></div>

<aside class="decision-recommendation">
  <strong>目前需求基準</strong>
  <p>Content Entry 是穩定主體，Revision 是不可變編輯版本，Published Snapshot 是公開事實，Publish Job 是一次執行工作，Preview Manifest 是精確預覽輸入，Publication Event 是不可覆寫歷程。</p>
</aside>

### 1.1 六個核心物件

| 物件 | 正式責任 | 建議主識別 | 不得混入的責任 |
|---|---|---|---|
| Content Entry | 表示一個可獨立維護的 Banner、法務內容、大廳遊戲內容或 Catalog | `content_entry_id` | 不保存目前公開內容的可變副本 |
| Content Revision | 一次完整儲存形成的不可變文字、語系、素材與設定快照 | `revision_id` | 不以原地更新取代新 Revision |
| Published Snapshot | 某 publication scope 目前真正對外生效的完整內容 | `snapshot_id` | 不引用 `latest` Revision 或素材 |
| Publish Job | 一次 publish、disable 或 restore 的執行與結果 | `publish_job_id` | 不把公開狀態直接當 Job 狀態 |
| Preview Manifest | 指定 Revision、公共基底、語系、裝置及依賴解析結果 | `preview_manifest_id` | 不在開啟時重新挑選最新版本 |
| Publication Event | 儲存、驗證、核准、執行、切換、失敗、補償與還原證據 | `publication_event_id` | 不得因資源刪除或結案而消失 |

### 1.2 Publication Scope

`publication_scope` 是同時只能有一筆狀態變更工作的鎖定範圍，也是 Published Snapshot 的唯一性範圍。第一版至少包含：

- 單一官網 Banner slot 或 Banner Entry。
- 單一官網內容區塊，例如條款、隱私權、負責任遊戲或聯絡資訊。
- 單一 Lobby Game Content。
- 整份 Lobby Catalog。

同一 scope 在同一時間只有一個有效公開 Snapshot，以及最多一個執行中或尚未完成的 state-changing Job。不同 scope 可以平行發布。

### 1.3 三個互不取代的公開控制

| 控制層 | 責任方 | 回答的問題 |
|---|---|---|
| DP03 技術可用性 | Provider Game／Release | 遊戲版本是否可被新 Launch 使用？ |
| DP04 內容可見性 | Provider Content Publishing | 官網或大廳要顯示什麼內容與操作？ |
| GGAP 代理商 Launch Gate | GGAP | 某代理商是否可啟動已全域可用的遊戲？ |

DP04 不得直接修改 DP03 或 GGAP 的狀態。公開 Snapshot 可以將遊戲標示為「即將推出」或「維護中」，但不得因內容顯示為可玩就繞過其他兩層控制。

---

## 2. 共用引擎與獨立發布流

<div class="decision-item-meta"><span>DP04-02</span><a href="open-issues.html#tbd-dom-005">TBD-DOM-005</a><a href="open-issues.html#tbd-api-006">TBD-API-006</a><i>Product · Content Operations · Frontend · Backend</i></div>

<aside class="decision-recommendation">
  <strong>目前需求基準</strong>
  <p>四種內容共用 Revision、驗證、預覽、核准、Job、Snapshot 與稽核能力，但任何一條發布成功或失敗都不得自動改變另一條發布流。</p>
</aside>

<div class="publishing-stream-grid" aria-label="四條獨立內容發布流">
  <article><b>01 · WEBSITE</b><strong>Banner</strong><span>版位、排程、CTA、四語文案與裝置素材。</span></article>
  <article><b>02 · WEBSITE</b><strong>Static Content</strong><span>法務、隱私、責任遊戲與結構化聯絡資訊。</span></article>
  <article><b>03 · LOBBY</b><strong>Game Content</strong><span>單款遊戲公開名稱、介紹、標籤、CTA 與素材。</span></article>
  <article><b>04 · LOBBY</b><strong>Catalog</strong><span>跨遊戲收錄、排序、分組、置頂與公開清單。</span></article>
</div>

### 2.1 獨立性規則

- 官網 Banner 與官網內容可以分開發布、停用與還原。
- Lobby Game Content 是單款遊戲的公開內容；Lobby Catalog 是跨遊戲集合與排序，兩者必須分開版本化。
- 單款遊戲內容更新不自動重排 Catalog；Catalog 發布也不原地修改單款遊戲內容。
- 官網《發布紀錄》只列官網 Banner 與官網內容的 Job、Snapshot 與失敗，不混入大廳發布。
- 大廳發布歷程由大廳管理與遊戲詳情呈現；未來可增加跨模組 Audit 查詢，但不得因此共用同一個 Job。
- 第一版不提供「官網＋大廳整站原子發布」。若未來存在大型聯合活動需求，再新增可選 Release Bundle；Bundle 也只能協調多筆獨立 Job，不改變各自 Snapshot。

### 2.2 共用能力與內容專屬規則

| 能力 | 四條發布流共用 | 內容專屬補充 |
|---|---|---|
| Revision | 不可變、完整快照、具 base revision | 各內容型別有自己的 schema |
| Validation | Blocking／Warning／Info、規則版本 | Banner 檢查版位；法務檢查嚴格語系；Lobby 檢查遊戲依賴 |
| Preview | Exact Revision／Manifest | 官網可整站預覽；大廳可指定 Catalog 與 Game Content 組合 |
| Publish Job | 立即、排程、停用、還原 | Banner 可額外設定生效／結束時間 |
| Snapshot | 固定有效內容與解析結果 | Catalog Snapshot 保存確切收錄遊戲內容版本 |
| Audit | Append-only、可依 ID 追溯 | 不同模組可以有不同檢視入口 |

---

## 3. Revision Job 與公開生命週期

<div class="decision-item-meta"><span>DP04-03</span><a href="open-issues.html#tbd-dom-005">TBD-DOM-005</a><a href="open-issues.html#tbd-dat-004">TBD-DAT-004</a><a href="open-issues.html#tbd-nfr-003">TBD-NFR-003</a><i>Product · Backend · QA · SRE</i></div>

<aside class="decision-recommendation">
  <strong>目前需求基準</strong>
  <p>Revision、Publish Job、Public 與 Delivery 各自擁有狀態；任何頁面都不得用一個 `status` 同時表示內容成熟度、發布工作進度、公開結果與 CDN 健康。</p>
</aside>

### 3.1 Revision 狀態

| API 值 | 顯示名稱 | 正式語意 |
|---|---|---|
| `draft` | 草稿 | 已儲存但仍可由後續新 Revision 取代；本身內容不可原地改寫 |
| `ready` | 可發布 | 指定規則版本驗證通過，可被預覽、核准或建立 Job |
| `superseded` | 已被新版本取代 | 同一 Entry 已有更新 Revision；仍可查詢與比較 |
| `archived` | 已封存 | 不再作一般發布候選；歷史 Snapshot 與 Audit 仍可追溯 |

瀏覽器尚未儲存的輸入只是 local edit buffer，不是 Revision。每次成功儲存都建立新的 `revision_id`；修改內容、語系、素材、CTA、排程規則或 Catalog 排序均不得覆寫既有 Revision。

### 3.2 Publish Job 狀態

| API 值 | 顯示名稱 | 正式語意 |
|---|---|---|
| `queued` | 已建立 | 已接受工作，等待立即執行或排程確認 |
| `scheduled` | 已排程 | 綁定確切 Revision 與執行時間，等待再次預檢 |
| `running` | 執行中 | 正在產生 Snapshot、傳播、切換或驗證 |
| `succeeded` | 已成功 | 目標公開狀態已原子切換並留下成功證據 |
| `failed` | 已失敗 | 本次工作停止；保存階段、原因、舊 Snapshot 與補償結果 |
| `cancelled` | 已取消 | 在不可逆副作用前取消，保存操作者與原因 |

若發布前檢查存在 Blocking，請求直接回傳 Validation Failed，不建立 Job。已排程工作執行前因依賴變動而不再符合條件，則建立或保留 Job 並標記 `failed / precondition_failed`。

### 3.3 Public 與 Delivery 狀態

| 維度 | API 值 | 顯示名稱 |
|---|---|---|
| Public | `unpublished` | 尚未有公開 Snapshot |
| Public | `published` | 有一筆目前有效的 Published Snapshot |
| Public | `disabled` | 已保留歷史，但目前不對外提供該內容 |
| Delivery | `propagating` | Snapshot 已切換，公開節點仍在傳播或驗證 |
| Delivery | `healthy` | 公開節點已確認提供目標 Snapshot |
| Delivery | `degraded` | 部分節點、語系或裝置未達預期，但可提供安全內容 |
| Delivery | `failed` | 公開交付驗證失敗，需補償、回復或人工處理 |

### 3.4 不可變與併發基準

- Revision 以 `base_revision_id` 或 ETag 做 optimistic concurrency；衝突時保留使用者未儲存輸入，提供比較與重新套用，不盲目合併。
- Job 綁定 `revision_id`、`expected_published_revision_id`、validation result、approval 與 manifest hash，不允許執行時換成最新版本。
- 同一 publication scope 同時只允許一筆尚未完成的 state-changing Job。
- Publish success 以原子指標或等效交易切換目前 Snapshot；失敗不得留下半新半舊的未定狀態。
- Restore 將歷史 Snapshot 複製為新 Revision，再重新驗證與建立新 Job；歷史紀錄不退回舊時間點。
- 已公開的 Revision、Snapshot、Job 與 Publication Event 不得 hard delete。

---

## 4. 多語內容素材與 Fallback

<div class="decision-item-meta"><span>DP04-04</span><a href="open-issues.html#tbd-dat-006">TBD-DAT-006</a><a href="open-issues.html#tbd-sec-005">TBD-SEC-005</a><i>Product · Content Operations · Accessibility · Security</i></div>

<aside class="decision-recommendation">
  <strong>目前需求基準</strong>
  <p>第一版固定 `zh-TW`、`zh-CN`、`en`、`ja` 四個公開語系並原子發布；Fallback 只能用於明確允許的欄位，Published Snapshot 必須保存最終實際採用的語系與素材版本。</p>
</aside>

### 4.1 公開語系

| Locale | 顯示名稱 | 預設 Fallback 鏈 |
|---|---|---|
| `zh-TW` | 台灣繁體中文 | 無；為主要編輯與校對語系 |
| `zh-CN` | 簡體中文 | `zh-TW` |
| `en` | English | `zh-TW` |
| `ja` | 日本語 | `en` → `zh-TW` |

每筆 Revision 保存四個語系的完整快照。第一版不提供語系個別發布，以免使用者在同一 publication scope 看到不同時間點的規則、CTA 或遊戲狀態。

### 4.2 欄位語系政策

| 政策 | 行為 | 適用範例 |
|---|---|---|
| `STRICT` | 所有必要語系都必須有有效內容，缺少即 Blocking | 條款、隱私、責任遊戲、重要風險提示 |
| `FALLBACK` | 可依固定鏈使用其他語系；Validation 顯示實際來源 | 一般遊戲介紹、非關鍵行銷副標 |
| `OPTIONAL_HIDE` | 缺少時隱藏該非必要欄位，不回退整個區塊 | 次要徽章、選配補充文案 |

Fallback 不可跨越欄位政策，也不得把任意第一個可用語系當成結果。Snapshot 需保存 `requested_locale`、`resolved_locale`、`fallback_chain` 與是否隱藏。

### 4.3 素材參照

DP04 不保存媒體 binary，而是引用 DP03 已建立的不可變素材版本。每個參照至少包含：

- `asset_id` 與 `asset_version_id`。
- `usage`、`locale`、`device` 與版位。
- checksum、媒體型別、尺寸與替代文字版本。
- 驗證當下的安全掃描與可用狀態。

不得引用 `latest asset`。沒有文字的共用素材可使用 locale-neutral `und`；含文字的圖片必須有對應 locale 版本。Desktop／Mobile 素材只有在版面與可讀性已確認安全時才可 Fallback，否則依欄位政策阻擋發布或隱藏。

### 4.4 素材失效與安全撤銷

- 一般素材被新版本取代時，既有 Snapshot 可繼續引用原版本；新 Revision 由營運人員決定是否升級。
- 素材被標記為 security-revoked 時，不得繼續由新 Publish Job 使用。
- 已公開 Snapshot 命中安全撤銷時，系統必須立即標示受影響 scope、套用安全替代內容或停用、建立高優先事件，並要求新 Revision 修復。
- Snapshot 必須保存有效素材解析結果，避免未來素材更新讓歷史預覽產生漂移。

---

## 5. 驗證與精確預覽

<div class="decision-item-meta"><span>DP04-05</span><a href="open-issues.html#tbd-api-006">TBD-API-006</a><a href="open-issues.html#tbd-sec-005">TBD-SEC-005</a><a href="open-issues.html#tbd-nfr-004">TBD-NFR-004</a><i>Content Operations · Frontend · Backend · Security · QA</i></div>

<aside class="decision-recommendation">
  <strong>目前需求基準</strong>
  <p>預覽必須由指定 Revision 與不可變 Preview Manifest 還原；發布前檢查分成編輯即時、後端權威與執行時重驗三階段，Blocking 不允許人工略過。</p>
</aside>

### 5.1 三階段檢查

| 階段 | 執行時機 | 責任 |
|---|---|---|
| Edit-time Validation | 編輯與儲存前後 | 快速提示必填、長度、格式、素材尺寸與本地可判斷問題 |
| Authoritative Pre-publish Validation | 建立 Ready、預覽確認、提交核准與建立 Job 前 | 由後端依規則版本檢查完整內容、安全、依賴、權限與公開條件 |
| Execution-time Revalidation | 排程或立即 Job 真正執行前 | 重查會隨時間變動的依賴、權限、素材撤銷、目前 Snapshot 與核准有效性 |

### 5.2 嚴重度

| Severity | 行為 |
|---|---|
| `BLOCKING` | 不得建立或執行 Publish Job；第一版沒有 override |
| `WARNING` | 可繼續，但必須明確確認並保存操作者、原因與規則版本 |
| `INFO` | 提供改善或資訊，不阻擋流程 |

Validation Result 至少保存 `rule_id`、`rule_version`、severity、result、`message_code`、`field_path`、locale、device、source snapshot、`detected_at` 與 remediation link，並綁定 `revision_id`、manifest hash 與完整規則版本。

### 5.3 共通檢查範圍

- Revision 完整性、base revision、schema 與必要欄位。
- 四語系及欄位層級 `STRICT`／`FALLBACK`／`OPTIONAL_HIDE`。
- 素材存在、安全狀態、checksum、格式、尺寸、裝置版本與 alt text。
- CTA 類型、內外部 URL、HTTPS、domain allowlist 與 redirect 安全。
- 富文字 sanitize、禁止標籤、嵌入來源、CSP 與外部媒體政策。
- optimistic concurrency、expected published revision 與同 scope active job。
- 排程時間、publication window、操作者權限、核准與風險分類。
- DP03 Game／Version／Asset／global availability 等外部依賴快照。

官網 Banner 額外檢查版位、裝置、開始／結束時間與 CTA；法務內容要求四語系嚴格完整；Lobby 額外檢查 game reference、DP03 相容、coming soon／playable 語意及 Catalog 排序完整性。

### 5.4 精確預覽

Preview Manifest 至少固定：

- 目標 `revision_id` 或 `catalog_revision_id`。
- 每個區塊採用 draft 還是目前 public 的明確來源。
- 每個語系、裝置與欄位的 resolved value／Fallback 結果。
- 每個素材的不可變版本與 checksum。
- DP03 依賴快照、遊戲狀態與可玩性呈現。
- renderer version、validation result 及 manifest hash。

提供單一內容預覽與完整官網／大廳組合預覽。組合預覽允許 draft 與 public 混合，但介面必須清楚標示每個區塊來源；不得在開啟或重新整理時靜默切換到 `latest`。

### 5.5 預覽安全與人工確認

- Preview token 必須短效、具 Provider／Revision／Manifest scope、可撤銷且不可由 query string 長期保存。
- 第一版不提供匿名分享；使用者必須具備預覽權限。
- 預覽使用獨立認證與 Cache-Control，不得被搜尋引擎或公開 CDN 索引。
- 外部連結、iframe、script、媒體與互動受 CSP／allowlist 限制；DEMO Launch 只能進 Sandbox。
- 自動檢查永遠必要；只有法務內容、主要 CTA、playable 狀態、重要素材或版面大幅變更，才額外要求人工預覽確認。
- 人工確認保存 `previewed_revision_id`、manifest hash、操作者與時間；內容或 manifest 改變後自動失效。

---

## 6. 發布排程停用與還原

<div class="decision-item-meta"><span>DP04-06</span><a href="open-issues.html#tbd-dat-003">TBD-DAT-003</a><a href="open-issues.html#tbd-api-006">TBD-API-006</a><a href="open-issues.html#tbd-nfr-003">TBD-NFR-003</a><i>Content Operations · Backend · SRE · QA</i></div>

<aside class="decision-recommendation">
  <strong>目前需求基準</strong>
  <p>Publish、Disable 與 Restore 都建立獨立 Job；立即與排程發布都綁定確切 Revision，切換失敗保留舊 Snapshot，重試與還原均建立新紀錄。</p>
</aside>

### 6.1 Job 類型與必要資料

第一版 `job_type`：

- `publish`：將指定 Revision 發布為目標 Snapshot。
- `disable`：停止公開指定 scope，但保留全部歷史。
- `restore`：以歷史 Snapshot 產生的新 Revision 重新發布。

Job 至少保存：Job／Entry／Revision／Scope ID、job type、expected published revision、effective time、status、actor、reason、idempotency key、validation、approval、source／target snapshot、retry／restore relation、trace ID 及各階段時間。

### 6.2 立即發布

```text
指定 Ready Revision → 權威驗證 → Warning 確認／必要核准
→ Scope Lock → 產生 Snapshot → 公開傳播 → 原子切換
→ Delivery Verify → Append-only Audit
```

- 切換前任何失敗都保留舊 Snapshot。
- 切換後 Delivery Verify 失敗，系統先執行可預期補償；無法安全回復時標記 `degraded` 或 `failed` 並發出事件。
- Job `succeeded` 表示目標公開狀態已成立；Delivery 可短暫為 `propagating`，但必須在可觀測期限內轉為健康或明確降級。

### 6.3 排程發布

- 後端以 UTC 保存，介面預設以 `Asia/Taipei` 顯示並同時顯示時區。
- 排程綁定確切 Revision、expected published revision、validation、approval 及執行時間，不追蹤 latest。
- 執行前重驗素材撤銷、DP03 狀態、權限、核准、規則版本與 public concurrency。
- 第一版同一 scope 只允許一筆未完成的排程 Job；修改排程以取消舊 Job 並建立新 Job 表示。
- `queued`／`scheduled` 可取消；`running` 原則上不可一般取消，只能等待結果或進入緊急處理。

Banner 的開始與結束時間屬同一 Publish Job 的 effective window，不為每個時間點建立互相無法追溯的 UI timer。若結束時需要回到先前內容，必須明確保存結束動作與目標 Snapshot。

### 6.4 停用、緊急停用與還原

- 一般 Disable 需具權限、填寫原因、通過必要核准並建立 Job。
- Emergency Disable 可由具專屬能力的單一操作者立即執行，不等待事前核准；必須填寫原因、取消同 scope 未來排程並進入事後覆核。
- Disable 不刪除 Entry、Revision、Snapshot 或歷程；重新公開必須以新 Job 執行。
- Restore 選擇歷史 Snapshot，複製為新 Revision，顯示與目前內容差異，重新驗證、核准並建立新 Job。
- 失敗重試建立新 `publish_job_id` 並保存 `retry_of_job_id`，不把原 Job 改回執行中。

### 6.5 DP03 狀態覆蓋

- `available`：DP04 Published Snapshot 可依內容設定顯示 playable CTA，最後仍由 GGAP Launch Gate 判斷。
- `maintenance`：大廳可保留公開內容，但以維護狀態覆蓋 CTA，不要求建立新 Revision。
- `suspended`：不得提供 Launch；前台顯示安全不可用狀態或依政策隱藏。
- `retired`：不得 Launch，系統建立內容停用／Catalog 移除工作提示，不自動改寫歷史 Revision。

DP03 即時狀態覆蓋是 runtime safety overlay，不是 DP04 內容修改。內容人員需要調整文字或 Catalog 時仍建立新的 Revision 與 Job。

### 6.6 事件與通知邊界

每次 Job 追加 queued、validated、approved、started、snapshot_created、activated、verified、failed、compensated、cancelled 等 Publication Event。通知中心仍為 Deferred；DP04 只發出穩定事件與導流 ID，不決定通知管道、偏好、已讀或保存介面。

---

## 7. 權限核准併發與稽核

<div class="decision-item-meta"><span>DP04-07</span><a href="open-issues.html#tbd-sec-001">TBD-SEC-001</a><a href="open-issues.html#tbd-sec-003">TBD-SEC-003</a><a href="open-issues.html#tbd-ext-003">TBD-EXT-003</a><i>Product · Security · Content Operations · Backend</i></div>

<aside class="decision-recommendation">
  <strong>目前需求基準</strong>
  <p>一般內容採具發布能力者的一人快速通道；法務、外部網域、可玩性、大量 Catalog、安全與重要 Warning 等高風險變更要求第二人核准。實際角色名稱與 permission key 待系統設定 Mapping。</p>
</aside>

### 7.1 Capability 模型

系統設定仍為 Deferred，因此本包先定義能力，不鎖定角色名稱：

| Capability | 主要操作 |
|---|---|
| Content Read | 查詢 Entry、Revision、Snapshot、Job 與歷程 |
| Content Edit | 建立 Revision、更新 local buffer、封存草稿 |
| Content Preview | 建立 Manifest／Token 並開啟精確預覽 |
| Content Submit | 提交高風險 Revision 核准 |
| Content Publish | 建立立即／排程 Publish Job 與取消未執行工作 |
| Content Disable／Restore | 一般停用、歷史還原與重新公開 |
| High-risk Approve | 核准或拒絕綁定確切 Revision 的高風險發布 |
| Emergency Disable | 不經事前核准立即停用並進入事後覆核 |
| Publication Audit Read | 查詢及依授權範圍匯出發布稽核 |

權限 scope 至少可限制 Provider、module、content type／entry、action 與 risk level。未授權預設拒絕。

### 7.2 快速與高風險通道

<div class="content-approval-lanes" aria-label="內容發布兩種治理通道">
  <article class="content-approval-lane content-approval-lane--fast"><span>DEFAULT · FAST</span><strong>一般內容快速通道</strong><p>既有網域 CTA、一般 Banner、一般遊戲文案、非關鍵素材、小範圍排序與不改變 playable 語意的更新。</p><code>自動檢查 → 一位具發布能力者 → 發布</code></article>
  <article class="content-approval-lane content-approval-lane--guarded"><span>EXCEPTION · GUARDED</span><strong>高風險第二人核准</strong><p>法務內容、新外部網域、playable／launch exposure、大量 Catalog、重要警語、安全規則或撤銷素材還原。</p><code>自動檢查 → 不同一人核准 → 發布</code></article>
</div>

- 一般通道允許同一位具權限者編輯並發布，不強制所有內容雙人流程。
- 高風險 Revision 的 submitter 不得自行 approve。
- 重要 Warning、CSP／外部媒體、主要 CTA、法務與大量 Catalog 變更必須由風險分類器或規則明確標記。
- Emergency Disable 是安全例外，只能減少公開範圍，不得用來發布新內容。

### 7.3 核准有效性

Approval 至少綁定 `revision_id`、manifest hash、validation result、publication scope、risk classification、approver、reason 與時間。以下任一變更都使核准失效：

- Revision、Manifest 或有效內容改變。
- Validation 規則或結果出現新的 Blocking／高風險 Warning。
- expected published revision 改變。
- publication scope 或風險分類改變。
- Submitter／approver 權限遭撤銷，或核准超過有效時間。
- 依賴素材遭安全撤銷。

### 7.4 兩種衝突

| 衝突 | 觸發 | 處理方式 |
|---|---|---|
| Revision Conflict | 儲存時 base revision／ETag 已過期 | 保留未儲存內容，顯示新舊差異，使用者選擇重新套用後建立新 Revision |
| Publication Conflict | 建立或執行 Job 時 current snapshot 不等於 expected published revision | 不切換公開內容；重新比較、驗證並建立新 Job |

Lobby Catalog 以整份 Catalog Revision 作鎖定單位，不嘗試在伺服器盲目合併兩個排序結果。

### 7.5 Append-only Audit

每筆 Audit 至少保存：audit／provider／resource／entry／revision／job／snapshot ID、action、actor、role／permission snapshot、before／after reference、approval、validation、reason、result、error code、request／trace ID 與時間。

Audit 保存參照、摘要與必要差異，不記錄 Preview token、秘密資料或未遮罩的敏感 payload。至少記錄：

- Revision 儲存、封存與比較。
- Preview Manifest／Token 建立、撤銷與失效。
- Validation、Warning 確認與人工預覽確認。
- Submit、Approve、Reject、approval expiry。
- Publish、Schedule、Cancel、Disable、Restore、Emergency Disable。
- Revision／Publication Conflict、Forbidden 與 Validation Failed。
- Delivery degradation、補償、重試、事後覆核與 Audit 匯出。

### 7.6 前端必須區分的錯誤

`Forbidden`、`Revision Conflict`、`Publication Conflict`、`Approval Required`、`Approval Expired`、`Job In Progress`、`Validation Failed`、`Dependency Changed` 不得被統一顯示為「操作失敗」。每個錯誤都要提供可行下一步，並保留 `trace_id` 供支援追蹤。

---

## 8. 跨頁依賴替代狀態與驗收

<div class="decision-item-meta"><span>DP04-08</span><a href="open-issues.html#tbd-dom-006">TBD-DOM-006</a><a href="open-issues.html#tbd-nfr-002">TBD-NFR-002</a><a href="open-issues.html#tbd-nfr-004">TBD-NFR-004</a><i>Product · Frontend · Backend · QA</i></div>

<aside class="decision-recommendation">
  <strong>目前需求基準</strong>
  <p>八個內容頁只能呈現自己負責的工作與公開結果；所有頁面都必須涵蓋正常、空白、錯誤、權限、衝突、依賴變動、工作執行與 Delivery 降級狀態，並以至少 37 個跨頁情境驗收。</p>
</aside>

### 8.1 頁面責任矩陣

| 頁面 | 主要讀取 | 允許操作 | 不得取代 |
|---|---|---|---|
| [Banner 管理](website-banners.html) | Banner Entry、Revision、Validation、Public Snapshot | 編輯、預覽、發布、排程、停用、還原 | 官網其他內容與大廳發布 |
| [內容管理](website-content.html) | 法務／聯絡 Entry、四語 Revision、Validation | 編輯、預覽、發布、排程、停用、還原 | Banner 與大廳內容 |
| [官網發布紀錄](website-releases.html) | 官網 Job、Snapshot、Event、Error、Audit | 查詢、追溯、依權限導向重試／還原 | 大廳發布歷程或遊戲版本發布 |
| [大廳總覽](lobby-overview.html) | Catalog／Game Content 公開摘要、readiness、Delivery | 觀察與導向工作頁 | 內容編輯、核准與正式發布 |
| [大廳遊戲清單](lobby-games.html) | Published Catalog 與每款公開結果 | 查詢、篩選、導向詳情 | DP03 Game master 或草稿編輯 |
| [大廳遊戲管理](lobby-management.html) | Game Content／Catalog Revision、Validation、Job | 編輯、排序、預覽、核准、發布、停用、還原 | DP03 版本、數值、素材 binary |
| [DEMO 環境數據](lobby-demo.html) | Sandbox readiness、telemetry、資料品質 | 查詢、重整、導向問題 | 正式 Game Round、財務、會員、錢包與發布事實 |
| [大廳預覽](lobby-preview.html) | Exact Manifest、Revision、locale、device、依賴快照 | 切換預覽視角與回到來源 | 編輯、核准、發布或自動切換 latest |

### 8.2 兩條依賴鏈

```text
DP03 Asset Version
  → 官網 Banner／Content Revision
  → Validation → Exact Preview → Publish Job
  → Website Published Snapshot → 官網發布紀錄
```

```text
DP03 Game／Version／Asset／Global Availability
  → Lobby Game Content Revision
  → Lobby Catalog Revision → Exact Preview → Publish Job
  → Lobby Published Catalog → 大廳總覽／遊戲清單
```

DEMO telemetry 只提供 readiness 與品質證據。DEMO 指標良好不會自動發布內容，指標不佳也不改寫 Revision；它只產生 Validation、Warning 或營運工作脈絡。

### 8.3 DP03 × DP04 公開結果矩陣

| DP03／DP04 組合 | 前台結果 |
|---|---|
| `available`＋DP04 published playable | 顯示內容與 Launch 入口；最終仍驗證 GGAP gate |
| `maintenance`＋DP04 published | 內容可見，顯示維護並停用 CTA |
| `suspended`＋DP04 published | 不可 Launch；依安全政策顯示不可用或隱藏 |
| DP04 published coming soon＋尚不可用 | 顯示「即將推出」，不得 Launch |
| `retired`＋DP04 published | 不可 Launch，建立停用／Catalog 移除工作 |
| DP04 `disabled` | 不公開該 scope，無論 DP03 是否 available |

### 8.4 Deep Link

允許使用 `content_entry_id`、`revision_id`、`publish_job_id`、`game_id`、`catalog_revision_id`、`mode`、`locale` 與 `device` 建立可重載的內部導流。Preview token、秘密資料與未遮罩 payload 不得放入 URL。目標 Revision 不存在或無權限時顯示明確狀態，不可靜默改看目前公開版本。

### 8.5 替代狀態

共通頁面至少支援：Loading、Empty、Query Failed、Partial Source、Stale、Forbidden、Revision Missing、Dependency Unavailable、Validation Failed、Revision Conflict、Publication Conflict、Approval Required／Expired、Job Queued／Scheduled／Running／Failed、Delivery Propagating／Degraded／Failed。

編輯頁另外支援：未儲存內容、儲存失敗、新 Revision 已存在、語系不完整、Fallback Warning、素材撤銷、Preview Failed、同 scope 已有 Job、Published Snapshot 已改變。

預覽頁另外支援：Token Expired、Manifest Missing、Asset Failed、Fallback Applied、DEMO Launch Blocked、部分區塊使用 Public、權限被撤銷及來源 Revision 已被新版本取代；任何情況都不得自動切換 latest。

發布紀錄必須顯示失敗階段、error code、activation 是否發生、補償結果、目前 Snapshot、retry／restore relation、source Revision 與 trace ID。

### 8.6 最低 37 個驗收情境

#### Revision 與公開分離

1. 編輯 local buffer 不改變公開頁。
2. 每次成功儲存建立新 Revision，舊 Revision 不被覆寫。
3. 預覽指定 Revision，不因新草稿出現而漂移。
4. 發布成功後目前 Snapshot 指向確切 Revision。
5. 發布失敗後公開內容仍是舊 Snapshot。
6. Restore 產生新 Revision 與新 Job，不改寫歷史。

#### 語系與素材

7. `STRICT` 欄位缺少任一必要語系時阻擋發布。
8. `FALLBACK` 依固定鏈解析並在預覽標示來源。
9. `OPTIONAL_HIDE` 缺少內容時只隱藏指定欄位。
10. Published Snapshot 保存四語系有效值與 resolved locale。
11. 素材固定 asset version，不因新素材上傳而改變公開畫面。
12. 含文字素材不得以 `und` 取代 locale-specific 版本。
13. Security-revoked 素材阻擋新發布並觸發既有公開處理。

#### 發布與排程

14. 立即發布依 exact Revision 建立 Job。
15. 排程發布等待期間新 Revision 不改變目標內容。
16. 排程執行前重新驗證動態依賴。
17. Expected published revision 不符時產生 Publication Conflict。
18. 同 scope 第二筆未完成 Job 被拒絕並提供既有 Job 導流。
19. 取消 queued／scheduled Job 不改變公開 Snapshot。
20. Running Job 不提供一般取消。
21. Retry 建立新 Job 並連回原失敗 Job。

#### 權限與核准

22. 無 Read 權限不可取得內容或透過 deep link 繞過。
23. `allowed_actions` 隱藏不允許操作，但後端仍拒絕偽造請求。
24. 一般低風險內容可由一位具發布能力者完成。
25. 高風險內容要求不同 submitter 的第二人核准。
26. Revision／Manifest／Validation 改變使核准失效。
27. 權限撤銷後已排程工作執行前失敗，不沿用過期授權。
28. Emergency Disable 可先停用並建立事後覆核，不可發布新內容。

#### 失敗、停用與還原

29. Snapshot 切換前失敗完全保留舊內容。
30. 切換後 Delivery Verify 失敗執行補償並記錄結果。
31. 無法安全補償時顯示 degraded／failed 與支援 trace。
32. Disable 保留 Entry、Revision、Snapshot 與 Audit。
33. Restore 前重新驗證目前規則、素材與依賴。

#### DP03、大廳與 DEMO

34. `maintenance` 即時覆蓋 CTA，但不改寫 Content Revision。
35. `suspended`／`retired` 不可透過 DP04 playable 文案繞過 Launch Gate。
36. Catalog 固定確切 Game Content Revision 與排序，不在讀取時追蹤 latest。
37. DEMO identity、credit 與 telemetry 不進入 Production Game Round、財務、會員、錢包或 Provider 風控。

以上情境同時需要 Desktop 與 390px Mobile 抽驗；操作須支援鍵盤與可見焦點，狀態不得只依顏色辨識，長 ID／繁中錯誤／多語內容不得造成頁面級水平溢位。

---

## 9. 後端契約原型對照與外部邊界

<div class="decision-item-meta"><span>DP04-09</span><a href="open-issues.html#tbd-api-001">TBD-API-001</a><a href="open-issues.html#tbd-api-006">TBD-API-006</a><a href="open-issues.html#tbd-ext-003">TBD-EXT-003</a><i>Product · Frontend · Backend · Security · SRE</i></div>

<aside class="decision-recommendation">
  <strong>目前需求基準</strong>
  <p>本包先鎖定後端必須達成的資料語意與行為，不預先指定 API URL、資料表、Queue 或 CDN 技術。取得 Backend／GGAP Git 後只補實作 Mapping 與差異，不以現有程式限制覆蓋本基準。</p>
</aside>

### 9.1 兩層契約

| 層級 | 現在是否成立 | 內容 |
|---|---|---|
| 產品語意契約 | 是；以本包為目前需求基準 | 核心物件、狀態、版本、驗證、預覽、核准、發布、失敗、還原、權限邏輯、稽核與驗收 |
| 實作對照契約 | 取得實際 Backend／基礎設施後補 | API URL／Method、request／response 欄位、資料表、Queue、Scheduler、CDN、permission key、event topic 與 error transport |

資料庫、Framework、Message Queue、Object Storage、CDN 或 CI/CD 選型不是本包產品決策。只要後端能證明符合產品語意、原子性、可靠性、安全與可觀測性，即可採用既有技術。

### 9.2 後端最少語意能力

| 能力 | 必須達成的結果 |
|---|---|
| Query Content Entry／Revision | 取得穩定主體、版本歷程、目前公開狀態及 allowed actions |
| Create Revision | 依 base revision 建立不可變新版本，衝突不覆蓋他人內容 |
| Run Validation | 以指定規則版本回傳 Blocking／Warning／Info 及欄位定位 |
| Create Preview Manifest／Token | 固定 exact Revision、依賴、語系、素材與 renderer version |
| Submit／Approve／Reject | 綁定 exact Revision、risk、manifest 與 validation evidence |
| Create Publish／Disable／Restore Job | 支援立即、排程、停用、還原、冪等與 expected public version |
| Cancel Scheduled Job | 只取消可安全取消的工作並保留原因與 Audit |
| Query Job Timeline | 提供階段、錯誤、切換、補償、重試及 trace |
| Query Published Snapshot | 明確回答目前實際對外的 exact Snapshot 與 Delivery 狀態 |
| Query Allowed Actions | 依操作者與 resource scope 提供介面提示；不取代後端授權 |

### 9.3 共用 Request／Response 原則

狀態變更請求原則上攜帶 `provider_id`、resource／entry／revision／scope ID、`base_revision_id` 或 ETag、`expected_published_revision_id`、`request_id`、`idempotency_key`、操作者、原因、有效時間與 validation／approval reference。

回應至少提供最新資源狀態、Revision／ETag、`allowed_actions`、`server_time`、`trace_id`、標準 error code 及是否可重試。重送同一 idempotency key 不得產生第二次發布副作用。

### 9.4 事件契約

DP04 定義必須發生的語意事件，不限定 Queue、Webhook 或其他技術：

- `content_revision_created`
- `content_validation_completed`
- `content_submitted`／`content_approved`／`content_rejected`
- `publish_job_created`／`publish_job_cancelled`／`publish_job_started`
- `published_snapshot_activated`
- `publish_job_failed`／`publish_compensated`
- `content_disabled`／`content_restored`
- `content_delivery_degraded`／`content_delivery_recovered`

事件至少包含 Provider、resource type、Entry／Revision／Job／Snapshot ID、actor、occurred time、result、error code 與 trace ID。通知中心只可消費這些事件，不反向成為發布成功的必要條件。

### 9.5 原型映射原則

- 原型中的狀態、按鈕、Dialog、抽屜、錯誤與 Mock 資料使用本包定義的語意，不自行建立另一套 lifecycle。
- 按鈕可用性依 `allowed_actions`、Validation、Approval、Concurrency 與 Job 狀態呈現。
- Route 只保存可重載的 ID、mode、locale 與 device，不保存 preview token 或秘密資料。
- Mock 操作可以模擬 Revision、Job 與 Snapshot 轉換，但必須標示不具正式持久化、公開前台、CDN 或 Audit 副作用。
- DEMO 數據不能因版面相似而併入正式內容、Round、財務或風控資料。

### 9.6 取得外部證據後補的 Mapping

- 後端實際 API、schema、enum、資料表與索引。
- Scheduler、Worker、Queue、Outbox、鎖與冪等的實際設計。
- Object Storage、CDN、Cache Invalidation、原子切換及補償方式。
- Provider Identity／Role 與本包 Capability 的 permission key 對照。
- 官網及大廳公開 renderer 如何讀取 Published Snapshot。
- DP03 Game、Version、Asset、global status 的實際欄位與事件。
- GGAP 代理商開關、Launch API 與錯誤狀態，只影響最後可玩性驗證。
- Audit、Trace、Metrics、Log 與 Alert 的實際格式及保存政策。

GGAP Git 不影響官網與大廳的編輯、Revision、Preview、Publish、Disable 或 Restore 契約；它只用於確認玩家真正啟動遊戲時的 agent gate、Launch 結果與錯誤 Mapping。

### 9.7 差異處理

1. 將實際欄位、狀態與流程映射到本包產品語意。
2. 可直接對應者標記為 Aligned。
3. 可透過 Adapter 轉換者記錄轉換、責任方與測試證據。
4. 缺少能力者建立 Implementation Gap，不把 Mock 宣告為完成。
5. 行為衝突者回到產品層決定修實作或修規格。
6. 未經確認不得因現有程式限制而降低公開安全、不可變、失敗保留舊版或追溯要求。

### 9.8 本包完成條件

- 四條發布流共用語意但獨立 Revision、Job、Snapshot 與失敗。
- Revision、Job、Public、Delivery 四種狀態分開。
- 四語系、素材版本、Fallback 與 validation resolution 固定進 Snapshot。
- 預覽與發布都綁定 exact Revision，不使用 latest。
- 發布失敗保留舊公開內容，停用與還原可完整追溯。
- 一般內容走一人快速通道，高風險內容要求不同一人核准。
- DP04 不繞過 DP03 技術可用性或 GGAP 代理商 Launch Gate。
- 八頁責任、替代狀態、deep link、37 個驗收情境與後端接軌方式均可追蹤。

達成以上條件即視為 DP04 產品需求基準完整。實際 Backend／CDN／權限／GGAP Mapping 是後續工程接軌工作，不重開本包產品決策。

## 規格同步與後續實作範圍

本包目前先作為規格網站的上游產品契約。後續依序：

1. 回寫 `docs/GAME_WEBSITE_SPEC.md`、`docs/GAME_LOBBY_SPEC.md` 及八個對應規格網站頁面。
2. 同步共通領域規則、資料字典、enum、API、安全、非功能性與 QA 章節。
3. 另開開發 session 對照 Portal 原型，建立正式差異清單後再修改 Vue 與 mock。
4. 取得 Backend／GGAP Git 後補實作 Mapping，不靜默改寫本需求基準。

規格網站、原始 Spec MD 與 Portal 原型必須依上述順序對齊，避免畫面先行產生另一套內容發布生命週期。
