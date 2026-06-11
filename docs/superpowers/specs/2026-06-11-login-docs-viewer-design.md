# 登入頁文件按鈕 + 交接文件檢視頁 — Design Spec

> 日期：2026-06-11
> 狀態：已過 brainstorming、使用者核准設計
> 目的：方便交接工作與前後端開發時快速檢閱 docs/handoff/ 交接文件

## 需求

登入頁快速登入列（PM 按鈕旁）新增一顆「📚 交接文件」按鈕，點擊後**另開新分頁**，
顯示 docs/handoff/ 裡的交接文件：左側導覽列選擇文件、右側以 HTML 格式顯示內容。

## 已確認的決策

| 決策點 | 結論 |
|---|---|
| 文件清單範圍 | **自動掃 docs/handoff/*.md**（import.meta.glob，未來新增文件零維護） |
| Markdown 渲染 | **加 `marked` 依賴**（GFM 表格/code block 支援，gzip ~12KB，lazy chunk） |
| 認證 | `/docs` **免登入**（入口在登入頁，點擊時尚未登入） |
| 內容時效 | build 時快照——Pages 上看到的是最後一次部署當下的文件（prototype 可接受） |

## 設計

### 1. 入口按鈕（src/views/auth/index.vue）

- 快速登入列（👑 總管理員 / 🔧 技術 / 📋 PM）後追加第四顆按鈕「📚 交接文件」。
- 同既有樣式：`size="small"` `severity="secondary"` `outlined`。
- 點擊：`window.open(router.resolve('/docs').href, '_blank')`——hash mode 下
  產生 `…/#/docs`，本機與 GitHub Pages（base `/Game_Development_Background/`）都正確。
- 按鈕文字走 i18n：`login.docs`（zh-TW「📚 交接文件」/ en「📚 Handoff Docs」）。

### 2. 路由 `/docs/:slug?`（公開、獨立版面）

- 頂層路由（不掛 MainLayout），比照 `/design-system` 的位置。
- `beforeEach` 免認證白名單：比照 `isLoginPath`，`to.path` 以 `/docs` 開頭即放行
  （一行判斷；不影響其他路由的認證/portal/權限守衛）。
- `:slug` 可選：`/docs/backend` 直連後端交接文件，可分享連結。
  無 slug 或 slug 不存在 → 顯示清單第一份文件（不另外導頁，網址保持原樣即可）。
- `meta.title`：`menu.handoffDocs`（i18n key，兩語系都加）。

### 3. 內容載入（自動掃描）

```ts
// 於 Docs/Index.vue 內
const modules = import.meta.glob('../../../docs/handoff/*.md', { query: '?raw', import: 'default' })
```

- lazy glob（不加 `eager`）→ 每份文件獨立 chunk，點開該文件才載入，不進主 bundle。
- slug = 檔名去掉 `.md`（`frontend.md` → `frontend`）。
- 已知三份固定標題與順序，其餘（未來新增）以檔名為標題、按字母序排在後面：

| 檔名 | 導覽標題 | 順序 |
|---|---|---|
| frontend.md | 前端交接 | 1 |
| backend.md | 後端交接 | 2 |
| api-contract.md | API 契約總表 | 3 |
| （其他 *.md） | 檔名 | 字母序append |

### 4. 檢視頁（src/views/Docs/Index.vue，新檔）

- 獨立全頁版面：左側固定寬度導覽列（文件清單），右側內容區獨立捲動。
- 導覽列點擊切換文件，同步以 `router.replace` 更新 slug（不增歷史紀錄）。
- `marked.parse(raw)` 轉 HTML 後以 `v-html` 呈現。
  - 內容為自家 repo 文件，**不加 sanitizer**（prototype 取捨，spec 記錄即可）。
- 樣式：HIG token（`--hig-*`），補 markdown 內容樣式（h1–h4 層級、表格框線與
  斑馬紋、inline code / code block 底色、blockquote、清單縮排）。
  表格過寬時內容區允許橫向捲動。
- 文件 chunk 載入失敗 → 內容區顯示簡單錯誤訊息（不做 retry）。
- 切換中顯示輕量 loading 狀態（避免閃爍即可，不做骨架屏）。

### 5. 依賴

- 新增 `marked`（runtime dependency）。只被 Docs 頁 import → 隨頁面 chunk lazy-load，
  不影響主 app 首屏。

### 6. 不做的事（YAGNI）

- 不做全文搜尋。
- 不做登入後入口（topbar/選單不加）。
- 不動 docs/handoff/ 內容本身。
- 不做深色模式切換鈕（跟隨既有 `.app-dark` class 機制）。
- 不做 md 內部相對連結／圖片解析（三份文件無此需求）。

## 驗證

本專案無單元測試，依既有規範：

1. `node node_modules/vite/bin/vite.js build` → 見 "built in"。
2. `node node_modules/vue-tsc/bin/vue-tsc.js --noEmit` → exit 0。
3. preview 抽查：
   - 登入頁有第四顆按鈕，點擊另開新分頁 `#/docs`。
   - 三份文件都渲染正常（特別確認 api-contract 的寬表格）。
   - `/docs/backend` 直連有效；亂打 slug fallback 到第一份。
   - 未登入訪問 `/dashboard` 仍被導去 `/login`（守衛不受影響）。
   - zh-TW / en 切換下按鈕文字正確。

## 影響範圍（預估）

- `src/views/auth/index.vue` — 加按鈕 + handler。
- `src/router/index.ts` — 加 `/docs/:slug?` 路由 + 白名單一行。
- `src/views/Docs/Index.vue` — 新檔（檢視頁）。
- `src/locales/zh-TW.json` / `en.json` — 各加 2 key（`login.docs`、`menu.handoffDocs`）。
- `package.json` — 加 `marked`。
