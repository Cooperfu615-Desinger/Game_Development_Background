# 技術棧切換計畫 — Naive UI → PrimeVue + Sakai

**日期**：2026-05-29
**範圍**：全專案 UI 框架遷移 + 引入 Pinia 狀態管理
**前置文件**：`2026-05-29-backend-restructure-analysis.md`

---

## 一、切換決策摘要

| 項目 | 變動 | 處理方式 |
|---|---|---|
| **UI 框架** | Naive UI → **PrimeVue 4 + Sakai 模板** | 🔴 大改 — 全部 .vue 元件替換 |
| **狀態管理** | Composables-only → **加入 Pinia** | 🟡 中等 — 漸進遷移，並存 |
| **圖表** | ECharts | ✅ 保留 |
| **路由模式** | History | ✅ 保留 |
| **樣式輔助** | Tailwind + design tokens | ✅ 保留 |

---

## 二、現況盤點

| 指標 | 數量 |
|---|---|
| 全專案 `.vue` 檔 | **56** |
| 使用 naive-ui 的檔 | **55**（幾乎全部） |
| 用到的 Naive UI 元件種類 | **約 35 種** |
| 既有 composables | 8 個 |
| 現有路由 | 約 14 條 |
| 現有 i18n key | 已建立完整 |

---

## 三、Naive UI ↔ PrimeVue 元件對照表

### 表單與輸入
| Naive UI | PrimeVue 4 | 備註 |
|---|---|---|
| `<n-button>` | `<Button>` | 屬性名相近 |
| `<n-input>` | `<InputText>` / `<Textarea>` | textarea 拆獨立元件 |
| `<n-input-number>` | `<InputNumber>` | ✅ 直接對應 |
| `<n-select>` | `<Select>` | PrimeVue 4 改名（原 Dropdown） |
| `<n-switch>` | `<ToggleSwitch>` | ✅ 直接對應 |
| `<n-radio-group>` / `<n-radio-button>` | `<RadioButton>` 用 v-model | API 不同 |
| `<n-slider>` | `<Slider>` | ✅ 直接對應 |
| `<n-date-picker>` | `<DatePicker>` | ✅ 直接對應 |
| `<n-form>` / `<n-form-item>` | 自製 `<FormField>` wrapper | PrimeVue 沒 Form 元件，用 `<div>` + label 包 |

### 資料展示
| Naive UI | PrimeVue 4 | 備註 |
|---|---|---|
| `<n-data-table>` | `<DataTable>` + `<Column>` | API 差很多，需重寫 |
| `<n-pagination>` | `<Paginator>` | 通常內建在 DataTable 中 |
| `<n-tag>` | `<Tag>` | ✅ 直接對應 |
| `<n-card>` | `<Card>` 或 `<div class="card">` | PrimeVue Card 較陽春，Sakai 通常用 `<div class="card">` |
| `<n-descriptions>` / `<n-descriptions-item>` | 自製 grid 結構 | 無對應元件 |
| `<n-statistic>` | 自製 | 無對應元件 |
| `<n-skeleton>` | `<Skeleton>` | ✅ 直接對應 |
| `<n-progress>` | `<ProgressBar>` | API 不同 |
| `<n-avatar>` | `<Avatar>` | ✅ 直接對應 |

### 反饋與彈窗
| Naive UI | PrimeVue 4 | 備註 |
|---|---|---|
| `<n-modal>` + `<n-card>` | `<Dialog>` | ✅ Dialog 直接含背景，無透明問題 |
| `<n-drawer>` + `<n-drawer-content>` | `<Drawer>` | ✅ 直接對應 |
| `useMessage()` | `useToast()` + `<Toast>` | API 不同 |
| `useDialog()` (confirm) | `useConfirm()` + `<ConfirmDialog>` | API 不同 |
| `<n-tooltip>` | `<Tooltip>` directive | 改成 `v-tooltip="..."` |
| `<n-alert>` | `<Message>` | API 不同 |
| `<n-result>` | 自製 | 無對應 |

### 導航與佈局
| Naive UI | PrimeVue 4 / Sakai | 備註 |
|---|---|---|
| `<n-layout>` / `<n-layout-sider>` / `<n-layout-header>` | Sakai 內建 Layout | 整套替換 |
| `<n-menu>` | `<PanelMenu>` / Sakai MenuItem | Sakai 提供完整 sidebar menu |
| `<n-breadcrumb>` / `<n-breadcrumb-item>` | `<Breadcrumb>` | ✅ 直接對應 |
| `<n-tabs>` | `<Tabs>` | PrimeVue 4 改名（原 TabView） |
| `<n-dropdown>` | `<Menu>` + popup mode | API 不同 |

### 其他
| Naive UI | PrimeVue 4 | 備註 |
|---|---|---|
| `<n-icon>` | `<i class="pi pi-xxx">` 或 `@vicons/material` 繼續用 | PrimeIcons 是 PrimeVue 配套 |
| `<n-divider>` | `<Divider>` | ✅ 直接對應 |
| `<n-space>` | `<div class="flex gap-x">` | 用 Tailwind 代替 |
| `<n-text>` | `<span>` / `<p>` | 用 HTML 標籤 + Tailwind |
| `<n-config-provider>` | 移除 | PrimeVue 不需要這層 |
| `<n-message-provider>` / `<n-dialog-provider>` | 改用 PrimeVue Service | App.vue 結構改變 |
| `<n-global-style>` | 移除 | 不需要 |

---

## 四、遷移階段規劃

### Phase 0 — 切換前準備（0.5 天）

- [ ] 建立 git branch：`feat/migrate-to-primevue`
- [ ] 凍結 main branch，禁止新功能直接合併（避免遷移衝突）
- [ ] 下載 Sakai 模板原始碼到 `_reference/` 資料夾供查閱
- [ ] 列出**保留不動**的模組（純資料 / utils / mocks / composables 都保留）

### Phase 1 — 並存安裝（1 天）

**目標**：兩套 UI 框架共存，現有頁面照常運作，新檔可開始用 PrimeVue。

- [ ] 安裝套件：
  ```bash
  npm i primevue@^4 @primevue/themes primeicons pinia pinia-plugin-persistedstate
  ```
- [ ] **保留** `naive-ui` 不移除（讓現有頁面繼續用）
- [ ] 新增 `src/plugins/primevue.ts`：初始化 PrimeVue + 主題覆寫
- [ ] 在 `main.ts` 註冊 PrimeVue、Pinia、ConfirmationService、ToastService
- [ ] PrimeVue theme 連到我們的 design tokens（顏色 / 圓角 / 字體）
- [ ] 跑 build 確認無衝突
- [ ] Commit & push

### Phase 2 — 引入 Sakai Layout（1~2 天）

**目標**：把 Sakai 的 Topbar + Sidebar + Layout 套進來，先讓**外殼**換上 PrimeVue。

- [ ] 從 Sakai 抽出 Layout 核心元件：
  - `AppLayout.vue` — 主框架
  - `AppTopbar.vue` — 頂部
  - `AppSidebar.vue` — 側邊選單
  - `AppMenu.vue` — 選單渲染
  - `AppFooter.vue` — 底部
- [ ] 把現有 `MainLayout.vue` 改用 Sakai 結構
- [ ] 選單資料從 `menu.ts` 對應到 Sakai MenuItem 格式
- [ ] 保留我們的**科幻 Dark theme** — 改 PrimeVue theme tokens 達成
- [ ] 整合 `Avatar` / 語言切換 / Theme Toggle
- [ ] 視覺驗收：截圖比對遷移前後
- [ ] Commit & push

### Phase 3 — Pinia 基礎 Store 建立（0.5 天）

**目標**：建立 Phase 4 開始遷移頁面時會需要的共享狀態。

- [ ] 建立 `src/stores/`：
  - `useAuthStore` — 當前使用者、權限
  - `usePortalStore` — Supplier / Agent / Merchant 切換
  - `usePermissionStore` — RBAC / dataScope 計算
  - `useUiStore` — Sidebar 開合、Theme 模式
- [ ] 開啟 `pinia-plugin-persistedstate` 持久化 auth & ui state
- [ ] 既有 composables 暫不動

### Phase 4 — 頁面逐頁遷移（3~5 天）

**目標**：把 56 個頁面從 Naive UI 切換到 PrimeVue。

**遷移順序**（從簡單到複雜，降低風險）：

| 批次 | 包含頁面 | 預估 | 風險 |
|---|---|---|---|
| 4.1 | Auth (Login.vue) | 0.5 天 | 🟢 低 |
| 4.2 | Error (404 / 500) | 0.3 天 | 🟢 低 |
| 4.3 | Settings (ApiKeys, Permissions) | 0.5 天 | 🟢 低 |
| 4.4 | Dashboard | 0.5 天 | 🟡 中 — 有圖表 |
| 4.5 | Aggregators (列表 + 詳情 + 模態) | 1 天 | 🟡 中 — 有 modal |
| 4.6 | Platforms (列表 + 詳情) | 1 天 | 🟡 中 — 圖表 + 表格 |
| 4.7 | Players + Finance skeleton | 0.5 天 | 🟢 低 |
| 4.8 | Games（現有版） | 0.5 天 | 🟡 中 |

**每頁切換 SOP**：
1. 開新 git commit per page
2. 依對照表 1:1 替換元件
3. 確認 build 通過
4. 瀏覽器驗收功能
5. 截圖前後對比

### Phase 5 — 移除 Naive UI（0.5 天）

**目標**：所有頁面遷移完成，清理舊框架。

- [ ] 全專案搜尋確認無任何 `from 'naive-ui'`
- [ ] 移除依賴：`npm rm naive-ui @vicons/material`（注意：圖示要先評估留不留）
- [ ] 清理 `src/style.css` 中的 `.n-*` 覆寫
- [ ] 清理 `App.vue` 的 `NConfigProvider` 等殘留
- [ ] 跑 build + 全頁面驗收
- [ ] Commit & merge 回 main

### Phase 6 — 開始新模組（遊戲管理 6 子頁，後續排程）

切換完成後，第一個全新模組**遊戲管理 6 子頁**會用：
- ✅ PrimeVue + Sakai
- ✅ Pinia store（GamesStore）
- ✅ Tailwind + design tokens
- ✅ ECharts
- ✅ MSW + faker
- ✅ catalog-driven（學參考 demo 模式）

這是新技術棧的第一個完整驗證，作為後續所有新模組的範本。

---

## 五、Sakai 模板整合策略

Sakai 是 PrimeVue 官方提供的 admin 模板，包含：

| 提供物 | 用法 |
|---|---|
| Layout 元件 | 整套導入到 `layouts/sakai/` |
| Topbar / Sidebar | 改連到我們的 menu.ts |
| Theme 切換器 | 改成觸發 Tailwind dark 模式 |
| Demo 頁面 | 不導入（只取架構） |
| Theme tokens | 部分覆寫成我們的科幻 cyan |

**整合原則**：
- ✅ 拿 Layout 結構與選單行為
- ❌ 不拿 Sakai 預設配色（太一般）
- ❌ 不拿 Sakai demo 頁面（我們有自己的）
- ✅ 拿 PrimeVue theme 客製方法

---

## 六、風險與緩解

| 風險 | 影響 | 緩解 |
|---|---|---|
| 兩套 UI 並存期間樣式衝突 | 中 | 用 CSS scope，PrimeVue 元件統一加 class 前綴 |
| 表格元件 API 差異大，遷移時間爆炸 | 高 | 預估時 DataTable 頁面 1 頁 1 天 |
| 科幻 dark theme 在 PrimeVue 跑不出來 | 中 | Phase 1 就做主題對齊驗證 |
| 元件對應沒看清楚，某些功能找不到對等 | 中 | 對照表先列完，遇到再補對照 |
| 第三方 ECharts 元件樣式對不上新 theme | 低 | 直接重用，圖表本來就獨立 |
| 遷移期間遊戲管理開發暫停 | 高 | 切換放在獨立 branch，主線 main 凍結 |

---

## 七、預估時程

| Phase | 工作 | 預估 |
|---|---|---|
| 0 | 準備 | 0.5 天 |
| 1 | 並存安裝 | 1 天 |
| 2 | Sakai Layout | 1.5 天 |
| 3 | Pinia 基礎 | 0.5 天 |
| 4 | 頁面遷移 | 4 天 |
| 5 | 清理 Naive UI | 0.5 天 |
| **小計** | **切換完成** | **8 天** |
| 6 | 遊戲管理 6 子頁（新技術棧第一個模組） | 8~12 天 |

---

## 八、執行原則

1. **獨立 branch** — 整個切換在 `feat/migrate-to-primevue` 分支，避免污染 main
2. **每頁獨立 commit** — 切換到一半也能 revert 個別頁面
3. **截圖驗收** — 每個 Phase 結束截圖，視覺差異有紀錄
4. **不動業務邏輯** — Composables / 資料 / mocks / utils 全保留
5. **科幻 dark 為主視覺基準** — PrimeVue theme 必須配出和我們現有風格 90% 相近
6. **遊戲管理在切換完成後才開始** — 避免邊切邊做兩頭忙

---

## 九、執行細節（已定案）

| 項目 | 決定 |
|---|---|
| **catalog-driven 範圍** | **B. 混合** — 重複性 CRUD 頁面用通用 view，特殊頁面客製 |
| **圖示** | **C. 並存** — PrimeIcons + `@vicons/material` 漸進替換 |
| **主題風格** | **Apple HIG** — 仿 macOS Sonoma / iCloud 風格，毛玻璃 + Apple Blue (`#007AFF`) |
| **執行模式** | **A. 按 Phase 順序執行** — 每個 Phase 結束視覺驗收 |

### Apple HIG 主題技術細節

| 元素 | 實作 |
|---|---|
| 字體 | `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans TC", system-ui` |
| 主色 | `#007AFF` Apple Blue |
| 強調色 | `#34C759` Green / `#FF9500` Orange / `#FF3B30` Red |
| 圓角 | Card 12px、Button 10px、Modal 14px |
| 毛玻璃 | `backdrop-filter: blur(20px) saturate(180%)` |
| 陰影 | `0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)` |
| 半透明 | Topbar/Sidebar 用 `rgba(255,255,255,0.72)` + blur |
| 動畫 | 0.3s cubic-bezier(0.4, 0, 0.2, 1) |

### 套件清單（鎖版本前綴）

```bash
# 主框架
npm i primevue@^4 @primeuix/themes primeicons tailwindcss-primeui

# 狀態管理
npm i pinia pinia-plugin-persistedstate

# 註：Sakai 5 使用 @primeuix/themes（非 @primevue/themes）
# 註：tailwindcss-primeui 讓 Tailwind 與 PrimeVue tokens 整合
```

### 保留套件

`naive-ui`、`@vicons/material`、`echarts`、`vue-echarts`、`msw`、`@faker-js/faker` 全部保留，遷移期間並存。
