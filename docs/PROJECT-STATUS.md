# 專案現況總覽 / Release Notes — 遊戲開發商管理總後台

**狀態日期**：2026-06-11
**目前版本**：`main` @ `50efc9f`（已部署、現網 HTTP 200）
**對外網址**：https://cooperfu615-desinger.github.io/Game_Development_Background/
**一句話**：單一前端、三 Portal（供應商總後台 / 代理後台 / 商戶後台）的遊戲開發商營運管理系統；目前為 **demo 可展示 + 前後端可接手**的完整交付狀態（前端骨架 + 可執行 API/權限契約，後端尚未接上、以 MSW 模擬）。

---

## 第一部分：對外總覽（產品 / 利害關係人）

### 這是什麼
一套遊戲開發商（供應商）的後台管理系統，涵蓋三種使用者視角：
- **供應商總後台**：完整管理權限——儀表板、代理 / 商戶 / 遊戲管理、獎池、交易明細、風控、報表結算、系統管理。
- **代理後台**：只看自己代理線下的商戶與報表，另有佣金報表、子帳號。
- **商戶後台**：只看自己的資料，另有商戶資料、API / 錢包、子帳號、風控告警、結算。

### 現在可以做什麼（已可展示）
- **40+ 個功能頁**全部可瀏覽、有資料、可互動（篩選、分頁、實體編輯彈窗、敏感值遮罩 / 還原、確認彈窗）。
- **三 Portal 即時切換**：右上切換器一點，選單、身份、可見資料範圍即時跟著變
  （供應商看全部 60 筆商戶、代理看自己線下 15 筆、商戶看自己 1 筆）。
- **亮 / 暗主題**全站一致、響應式（手機 / 平板 / 桌機）。
- **儀表板**含營收趨勢、幣別分布、RTP 趨勢等圖表與即時健康指標。

### 現階段定位（誠實說明）
- 這是**原型 / demo 階段**：資料為模擬（mock），尚未接真實後端與真實登入。
- 適合：對內 / 對外展示產品樣貌與流程、作為前後端開發的**規格與起手骨架**。
- 尚未適合：正式營運（需後端接上後才有真實資料、真實權限強制與安全性）。

---

## 第二部分：對內總覽（工程交接）

### 技術棧
Vue 3 + TypeScript + Vite ｜ PrimeVue 4 + @primeuix/themes（Apple HIG 客製 preset）｜
Pinia（4 store）｜ vue-router（hash）｜ vue-i18n（zh-TW，英文非交付目標）｜
圖表 ECharts + chart.js ｜ Mock 後端 MSW + faker ｜ 部署 GitHub Pages（CI: Node 24）。

### 規模
| 指標 | 數量 |
|---|---|
| 功能頁（.vue views） | 73 |
| 路由（named） | 87 |
| MSW handler 模組 | 17 |
| Pinia store | 4（auth / portal / permission / ui） |
| 交接文件 | 3（frontend / backend / api-contract） |

### 開發階段歷程（皆已 SHIPPED + 部署）
| 階段 | 內容 |
|---|---|
| **Phase A** | 對齊參考 demo：40+ 頁內容 / 視覺 / 互動全面對齊；demo 頁面級 CSS 整包移植 |
| **Phase B** | 架構優化：① bundle 拆分（首屏 entry 970KB→61KB，echarts/chartjs/mocks 按需載入）② mock 日期全域 rebase（資料永遠相對「今天」）③ 共用元件抽出（SummaryCardGrid / FilterCard）④ 深色模式相容 |
| **Phase C1** | Portal / Scope / Permission **架構地基**：mock bearer token → apiClient 單一接縫 → MSW scope 過濾 → RBAC 路由 / 選單守衛 → portal 切換生效 |
| **Phase C2** | Portal 專屬實頁（Spec 1 地基 + Spec 2 實頁）：代理佣金 / 子帳號、商戶資料 / API錢包 / 子帳號；9 個 scoped endpoint；全選單前綴路由無死連結 |
| **CI** | GitHub Actions 升級 Node 24 + 最新 actions |
| **QA** | 全站 QA 三波修正，18 項 17 清（詳見下方） |

### 核心架構（給接手工程師）
```
Portal 切換器 → authStore(mock bearer token，編碼 portal/role/dataScope/actorId)
            → apiClient（單一出口，自動附 Authorization: Bearer）
            → MSW handler（scope.ts 依 token dataScope 過濾，示範後端契約）
router.beforeEach（依 token portal claim 重簽 + meta.permission → /403）
buildMenuForPortal（依 portal 產生選單，連結走 /agent/* /merchant/* 前綴）
```
- **換真後端**：原則上只改 `src/services/apiClient.ts`（base URL + 真 token 來源）、移除 MSW；scope 過濾與權限強制改由後端負責。詳見 `docs/handoff/`。
- **契約文件**：
  - `docs/handoff/frontend.md` — apiClient 用法、portal 切換、頁面 fetch 模式、換後端步驟
  - `docs/handoff/backend.md` — token payload 契約、各 endpoint scope 過濾規則、權限矩陣
  - `docs/handoff/api-contract.md` — endpoint × method × permission × scope 對照（9 個 scoped endpoint）
- 設計 / 計畫文件在 `docs/superpowers/{specs,plans}/`，QA 報告在 `docs/qa/`。

### QA 結果（2026-06-11 結案）
全站功能 + 視覺驗證，**0 Critical / 0 High**；18 項發現中 **17 項已修並上線**，三波修正：
- Wave 1：tooltip 註冊、標題翻譯、topbar 身份、動態文案、MSW 靜音、KPI 對齊、移除半成品語言切換器
- Wave 2：列表查詢過濾生效（10 頁）、遊戲彈窗欄位重疊、商戶儲存二次確認、深連結 token 競態、stub 按鈕處置
- Wave 3：商戶 seed 名稱分散、敏感值還原態重置

### 已知限制 / 待真後端階段處理
1. **L-8 列表錯誤狀態**：fetch 失敗的 error / retry UI 尚未做（mock 無真實失敗路徑可驗）——接真後端時補。
2. **Mock token 不驗章**：base64 明文、僅示意；正式須由後端發放 / 驗證。
3. **部分非主流 fetch 未走 apiClient**：少數 GET 讀取（finance / analytics / platforms / players / aggregators）仍用原生 fetch，接真 auth 前需遷移到 `api.*`（mock 下不影響）。
4. **彙總端點 scope 為 best-effort**：reports / dashboard 的 scope 過濾為 pass-through；正式由後端依 scope 重算。
5. **英文 i18n 非交付目標**：頁面內容為 zh-TW；語言切換器已移除。
6. **環境注意**：dev server 的 MSW service worker 在長時間多次 HMR 後可能 desync（回 404 / 空資料）——unregister SW + 硬重載 或重啟 dev server 即可，非程式缺陷。

### 如何跑 / 部署
- 本地：`node node_modules/vite/bin/vite.js --host` → `http://localhost:5173/Game_Development_Background/`（登入頁有快速登入）
- Build：`node node_modules/vite/bin/vite.js build`（type-check 另跑 `npx vue-tsc --noEmit`）
- 部署：push 到 `main` → GitHub Actions（`.github/workflows/deploy.yml`）→ GitHub Pages，1~2 分鐘上線

---

*本文件為專案現況快照；後續有重大進展可直接更新本檔。*
