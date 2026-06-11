# 全站 QA 報告 — 遊戲開發商管理總後台

- **日期**：2026-06-11（檔名沿用任務指定的 2026-06-10）
- **測試者**：Claude（QA 工程師角色，報告 only，未修改任何程式碼）
- **分支 / commit**：`main` @ `671f3bd`
- **環境**：Vite dev server `:5173` + MSW mock backend；hash 路由；瀏覽器自動化（preview 工具）
- **登入身份**：總管理員（快速登入），核心測試涵蓋 supplier / agent / merchant 三個 Portal
- **方法**：逐區塊（A–J）覆蓋，非抽樣；互動一律用真實點擊（preview_click），列表筆數另以「直接打 API + 自建 token」交叉驗證

> ⚠️ **測試環境前置說明（重要，非缺陷）**：本 session 為了反覆切換身份做了多次硬重載，觸發了交接文件 H#5/C1-memory 已記載的「MSW service worker 在長 session 多次 HMR 後 desync（回 404 / SPA fallback），硬重載可修復」。這在測試中一度造成**假性空資料**，我已用「重啟 dev server + 直接打 API」排除，下方結論已修正。請你手動複驗時若遇到整頁空白/卡 loading，先硬重載再判斷。

---

## 嚴重度總覽

| 嚴重度 | 數量 | 說明 |
|---|---|---|
| 🔴 Critical | 0 | 無（原疑似「scope 全空」已查證為 MSW 環境假象，**已撤回**） |
| 🟠 High | 0 | 無確認項 |
| 🟡 Medium | 6 | 查詢未過濾（需修）、按鈕未接線、token 競態、v-tooltip 未註冊、i18n 內容未覆蓋、新增遊戲欄位重疊 |
| 🔵 Low | 9 | 標題原始 key、缺 key、顯示名未更新、硬編文案、KPI 不一致、環境切換無二次確認 等 |
| ⚪ Cosmetic / Env | 3 | MSW 噪音 log、seed 重複名、MSW desync（環境） |

**整體 ship-readiness：可上線（demo/原型用途），無阻斷性缺陷。** 但使用者確認後，**「查詢需接過濾」與「主要新增/動作按鈕需接線」已從「疑似刻意」轉為待修功能**；另有新增遊戲 dialog 欄位重疊需修版。

---

## 詳細問題清單

### 🟡 Medium

#### M-1　列表「查詢」篩選不生效（**需修復** — 使用者確認需接過濾）
- **頁面/路由**：`#/merchants`、`#/agents`（推測其他 demo 移植列表頁一致）
- **重現**：篩選卡輸入關鍵字「ZZZNOMATCH999」→ 點「查詢」
- **預期**：結果被過濾（0 筆或對應子集）
- **實際**：仍回 60 筆 / 10 列，count badge 不變（真實點擊複驗一致）
- **證據**：兩頁實測；`重置` 可正常清空欄位；分頁正常
- **疑似刻意設計？**：**否** — 使用者（PM）確認「查詢需要接過濾」。應實作篩選（前端過濾或將條件帶入 API query）。

#### M-1b　多頁工具列/動作按鈕未接邏輯（使用者回報，已複驗）
- **頁面/路由**：`#/games/math`（數值設定）、`#/merchants`（商戶列表）
- **重現與實際**：以下按鈕真實點擊後**無任何反應** — 無 dialog/drawer/popover、無 toast、無導頁、**無 JS error**（按鈕非 disabled、事件有觸發 → `@click` 未綁/空 handler，屬「未接線」展示按鈕，非當機）：
  - 數值設定：**新增數值版本**、**建立審核單**
  - 商戶列表：**欄位設定**
- **對照（正常）**：商戶列表「新增商戶」、遊戲列表「新增遊戲」**有**開 dialog → 部分 action 已接、部分未接，並非全頁皆停用
- **疑似刻意設計？**：**可能是**（demo 移植頁未接）。但含主要「新增/建立」動作，建議當「待補功能」追蹤並評估 UI 標註/暫隱。

#### M-5　「新增遊戲」Dialog 欄位重疊（使用者回報，已複驗）
- **頁面/路由**：`#/games` →「新增遊戲」→ 主檔資料 tab
- **重現**：開啟新增遊戲 dialog，看「狀態」與「環境模式」欄位
- **預期**：各欄位不重疊
- **實際**：「狀態」下拉（待審核 ▾）**溢出其格線欄位、壓到右側「環境模式」欄位**。實測：狀態下拉右緣 x=735，但環境模式欄位左緣 x=708 → **水平重疊約 27px**；下拉控件寬約 105px 卻只分配到約 62px 欄寬
- **證據**：使用者截圖 + DOM 幾何量測
- **原因推測**：該列 grid 欄寬分配不足（遊戲類型/狀態 欄太窄，或環境模式/維護排程 的「按鈕+toggle」複合欄太寬擠壓版面）
- **疑似刻意設計？**：**否**（版面缺陷）

#### M-2　Portal 切換 token 時序競態 → 深連結首載可能顯示前一 Portal 的 scope
- **頁面/路由**：深連結 `#/agent/merchants`（及其他 scoped 列表頁）
- **重現**：在 supplier 狀態直接導航到 `/agent/merchants`
- **預期**：立即顯示 agent scope（15 筆）
- **實際**：首次載入顯示 **60 筆**（supplier scope），再次於 agent 內導航後才修正為 15
- **原因推測**：列表 `onMounted` fetch 早於 `syncPortal` 重簽 token，首個請求帶到舊 Portal token
- **影響**：短暫 over-scope 顯示（agent 短暫看到全部商戶）；透過 topbar 切換（先到 dashboard）不受影響
- **疑似刻意設計？**：**否**

#### M-3　`v-tooltip` 指令未全域註冊 → tooltip 失效 + console 警告刷屏
- **頁面/路由**：`#/games/math`（`Math.vue`）、`#/jackpots/settings`、`#/games/settings`（`Settings.vue`）等
- **預期**：hover 顯示提示；console 零警告
- **實際**：`[Vue warn]: Failed to resolve directive: tooltip`，單頁掛載重複噴 ~16 次；對應 tooltip 不會顯示
- **證據**：console 連續多筆 `Failed to resolve directive: tooltip at <Math>` / `at <Settings>`
- **疑似刻意設計？**：**否** — 應在 plugin 註冊 PrimeVue `Tooltip` directive（一行修正）

#### M-4　i18n 覆蓋不完整 — 切英文只翻「導覽框架」，頁面內容仍硬編中文
- **頁面/路由**：全站（以 `#/merchants` 實測）
- **重現**：將 locale 切為 `en`
- **預期**：整頁英文
- **實際**：側邊選單 / 麵包屑 / 頁面 H1 正確翻成英文（如「Merchant List」「Bet Orders」「AGENT ZONE」）；但 **頁面主體仍中文**（KPI 標籤、篩選卡、表頭、按鈕、狀態徽章），實測 EN 模式下頁面 body 仍有 255 個中日韓字元
- **正面**：選單已翻譯、**畫面無外露的 `menu.xxx` 原始 key**
- **使用者確認**：「只有導覽列會切換語系，其他地方都不會」— 與本項一致。
- **疑似刻意設計？**：**否（待補）** — demo 移植頁硬編 zh-TW、不接 i18n。若 EN 為支援目標，頁面內容需逐頁接 i18n。

### 🔵 Low

| 編號 | 問題 | 頁面 | 預期 vs 實際 | 刻意? |
|---|---|---|---|---|
| L-1 | 瀏覽器分頁標題用原始 i18n key | 全站 `<title>` | 應為翻譯文字；實際 `menu.dashboard - …`、`common.login - …`、`menu.merchantList - …` | 否 |
| L-2 | `common.changeLanguage` key 在 zh+en 皆缺 | topbar 語言鈕 | aria-label 顯示原始 key；console 噴 `[intlify] Not found 'common.changeLanguage'` | 否 |
| L-3 | 語言切換鈕（地球）**有作用，但只有導覽列反映**（使用者確認，更正先前判斷） | topbar | 點擊確實切換 locale，但僅側邊選單/麵包屑/H1 變英文，頁面內容仍中文 → 實為 **M-4 覆蓋不全**，非按鈕失效。我自動化先前誤判為「無反應」是因只看頁面內容/htmlLang（後者未更新） | 否 → 併入 M-4 |
| L-4 | 切 Portal 後 topbar 右上顯示名仍「總管理員」 | 全站 topbar | token actorName 已正確切（Asia Master / 商戶），但顯示名未更新 | 否（顯示綁定） |
| L-5 | Dashboard「營運篩選」硬編「依目前 **Supplier Portal** dataScope」 | `#/dashboard`（agent/merchant 亦同） | 在 agent/merchant Portal 仍顯示 Supplier 字樣 | 否 |
| L-6 | 管理員頁 KPI 子標數字不一致 | `#/system/admins` | 卡1「啟用 30／停用 10」(=40) vs 卡2「啟用 40／未啟用 20」(=60)，啟用數 30≠40 | 否（疑 seed） |
| L-7 | 敏感值還原狀態跨 dialog 開關保留 | 商戶詳情 → API/安全 | 還原後關閉再開仍顯示明文；正式環境宜在關閉時重置遮罩 | 不確定 |
| L-8 | MSW desync 時列表無錯誤狀態，僅永久 loading/空 | 列表頁（環境觸發時） | fetch 失敗應有錯誤/重試 UI；實際靜默卡 loading 或空 | 不確定（mock 環境） |
| L-9 | 編輯商戶／環境切換無二次確認（使用者確認） | 商戶編輯 dialog | 任務列「環境切換確認」為預期安全機制；實際修改／切換正式↔測試**無二次確認彈窗** | 否（缺安全確認） |

### ⚪ Cosmetic / Env

| 編號 | 問題 | 說明 |
|---|---|---|
| C-1 | Console 大量 MSW debug log | 每支 API 噴 `Request/Handler/Response/console.groupEnd` 且全部雙倍輸出；上線前應移除/gating |
| C-2 | 商戶 seed 名稱重複 | agent 視角 15 筆多為「Golden Dragon」；mock 資料 cosmetic |
| C-3 | MSW service worker desync（環境，非缺陷） | 長 session 多次重載後 mock 後端停止攔截；硬重載/重啟 dev server 修復。已記載於交接文件 |

---

## ✅ 通過項目（重點）

- **A 路由/導覽**：45 條 supplier 路由全部可達，breadcrumb + H1 正確；深連結（SPA + 冷重載）OK；**404 / 403 頁正常**；`finance/reconciliation` 為刻意「開發中」stub。
- **B 資料載入**：列表有資料、筆數合理（商戶60/代理60/可調用遊戲1875/結算30…）；分頁正常；`重置` 正常。
- **D 實體 Dialog**：檢視/編輯/停用三態正常；6 分頁全渲染；**敏感值遮罩 + 還原 + 複製運作**（還原出 `pk_live_golden_demo_key`）；**停用原因 ≥6 字驗證正確**（2字 disabled／9字 enabled）；新增管理員 4 分頁含 2FA/允許 IP。
- **E Portal 切換（核心）**：機制全正常 — Portal 標籤/副標、選單過濾（supplier 12 群 / agent +代理專區 / merchant +商戶專區）、導頁、token 重簽（portal/role/dataScope/actorId/actorName）、`/agent/* /merchant/*` 前綴、`/403` deny guard。**Scope 過濾正確：直接打 API 自建 token 驗得 supplier/agent/merchant = 60 / 15 / 1；UI 亦覆驗 supplier 60、agent 15。**
- **F 主題**：深色 CSS 覆蓋良好（dashboard 圖表/KPI、merchants 表格/篩選/徽章）— 無白底白字。
- **H 響應式**：375 / 768 / 1440 皆無頁面水平溢出；mobile/tablet 收合為 hamburger drawer（可開、可捲）；寬表格於容器內水平捲動不破版；格線 4→2→1 欄重排。

---

## 頁面 × 結果 總覽

| 區塊 | 結果 | 問題數 |
|---|---|---|
| A 路由/導覽 | ✅ 通過 | 0（1 個刻意 stub） |
| B 資料載入 | ✅ 通過 | 0 |
| C 篩選卡 | ⚠️ 需修 | M-1（查詢需接過濾） |
| D 實體 Dialog | ⚠️ | M-1b（欄位設定未接）、M-5（新增遊戲欄位重疊）、L-7、L-9（環境切換無二次確認，使用者確認） |
| E Portal 切換 | ✅ 機制通過、scope 正確 | M-2, L-4, L-5 |
| F 主題 | ✅ 通過 | 0 |
| G i18n | ⚠️ | M-4, L-1, L-2, L-3 |
| H 響應式 | ✅ 通過 | 0（mobile topbar 略擠） |
| I Console | ⚠️ | M-3, C-1 |
| J 視覺細節 | ✅ 大致通過 | M-5, L-6, C-2 |

---

## 使用者複驗回饋（2026-06-11 第二輪，已併入上方）

1. **M-2 token 競態** → 使用者：「scope 正確就沒差」→ 維持 Medium、可低優先。
2. **L-3 / M-4 i18n** → 使用者確認「只有導覽列會切換語系」→ 更正 L-3（按鈕有作用）、強化 M-4（覆蓋不全為主因）。
3. **D 環境切換確認** → 使用者確認「編輯商戶修改後沒有彈出二次確認」→ 記為 **L-9**（缺安全確認）。
4. **M-1 查詢** → 使用者確認「查詢需要接過濾」→ M-1 從「疑似刻意」改為 **需修**。
5. **新發現（已複驗）**：商戶列表「欄位設定」按鈕無反應 → **M-1b**；「新增遊戲」dialog 欄位重疊 → **M-5**。

---

## 修正排程 / Disposition（2026-06-11 使用者決議，待 fix session 執行）

> 由 PM 複驗後拍板；fix session 依此表執行。每項標 wave + 處置。

### 決策摘要
1. **M-4 全站英文 i18n** → **不做（移出範圍）**。英文非交付目標。連帶處置：移除半成品的語言切換器（地球鈕）以免 demo 出現「只翻一半」的破功能；L-2 / L-3 隨之 moot。
2. **M-1b stub 按鈕** → **能接的接成真功能，無法接的標「即將推出」並 disable**（逐顆判斷）。
3. **M-1 查詢過濾** → 補那 5 頁外，**順手把 orders / transactions / jackpot 列表也查一遍補齊**。
4. **執行方式** → 開**獨立 fix session** 處理 Wave 1/2/3；主 session 只確認進度與方向。

### 處置表
| 項 | Wave | 處置 | Root cause（已查證） |
|---|---|---|---|
| ✅ M-3 tooltip 未註冊 | 1 | 修：plugins 註冊 PrimeVue `Tooltip` directive | `src/plugins/primevue.ts` 未 `app.directive('tooltip', Tooltip)` |
| ✅ L-1 標題原始 key | 1 | 修：afterEach 用 `i18n.global.t(meta.title)` | `router/index.ts:503` 直接 `String(to.meta.title)` |
| ✅ L-4 切 Portal 顯示名沒變 | 1 | 修：topbar 顯示名綁 `decodeToken(token).actorName` | `AppTopbar.vue:17` 綁 `authStore.userInfo.name`（登入寫死） |
| ✅ L-5 Dashboard 硬編 Supplier Portal | 1 | 修：描述綁 `portalStore.current.label` 動態化 | `Dashboard/Index.vue` 篩選卡描述硬編 |
| ✅ C-1 MSW debug log 刷屏 | 1 | 修：`worker.start({ quiet: true })`（MSW 內建日誌，非自訂 logger） | MSW 內建逐請求 log |
| ✅ L-6 管理員 KPI 數字打架 | 1 | 修：鎖定帳號 2FA→false，使 2FA 啟用數 30=啟用數 30 | systemAdmin seed 不一致 |
| ✅ L-2 changeLanguage 缺 key | 1 | **Moot**（語言切換器已移除） | — |
| ✅ 移除語言切換器 | 1 | 移除 topbar 地球鈕入口 + 刪 `LanguageSwitcher.vue`（i18n 基礎設施/zh-TW 保留） | M-4 決議連帶 |
| M-1 查詢未過濾 | 2 | 修：複製現有 `filteredRows` 樣板 | 5 頁 DataTable 綁原始 `rows`（Merchants/Agents/Games + Portal/SubAccounts + Agent/Commissions）；**另查 orders/transactions/jackpot** |
| M-5 新增遊戲 dialog 欄位重疊 | 2 | 修：該列 grid 欄寬/span | 狀態下拉溢出壓到環境模式欄 |
| L-9 環境切換無二次確認 | 2 | 修：查為何沒觸發、補確認彈窗 | 商戶編輯流程 |
| M-2 深連結 token 競態 | 2 | 修：beforeEach 在 fetch 前同步 token | onMounted fetch 早於 syncPortal 重簽 |
| M-1b stub 按鈕 | 2 | 能接的接、不能接的標「即將推出」+disable | 新增數值版本/建立審核單/欄位設定 無 handler |
| ✅ M-4 全站 i18n | — | **不做**；語言切換器已移除（Wave 1） | 頁面硬編 zh-TW |
| ✅ L-3 語言鈕只翻導覽 | — | 隨切換器移除而 moot（Wave 1） | 併入 M-4 |
| L-7 敏感值還原跨 dialog 保留 | 3 | 選做：關閉時重置遮罩 | UX |
| L-8 列表無錯誤狀態 | 3 | 選做（低優先，mock 環境） | 無 error/retry UI |
| C-2 seed 名稱重複 | 3 | 選做：分散 seed 名稱 | mock cosmetic |
| C-3 MSW desync | — | 不修（環境，已記交接文件） | — |

— 報告結束。QA session 未改任何程式碼、未 commit。Disposition 由主 session 於 2026-06-11 依使用者決議補上。
