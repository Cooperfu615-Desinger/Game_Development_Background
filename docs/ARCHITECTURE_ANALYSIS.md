# 專案架構分析報告

**專案名稱**: Antigravity Aggregator (B2B Game Platform)
**分析日期**: 2026-03-31
**目標用途**: 為新專案 "博弈遊戲開發商的總控後台" 提供架構參考

---

## 目錄

1. [現有專案概覽](#1-現有專案概覽)
2. [技術棧分析](#2-技術棧分析)
3. [架構設計模式](#3-架構設計模式)
4. [檔案結構與模組化](#4-檔案結構與模組化)
5. [核心功能模組](#5-核心功能模組)
6. [開發約定與最佳實踐](#6-開發約定與最佳實踐)
7. [新專案適配指南](#7-新專案適配指南)

---

## 1. 現有專案概覽

### 1.1 專案性質

- **名稱**: Antigravity Aggregator
- **類型**: B2B Game Aggregation Platform (遊戲聚合平台)
- **角色定位**: 充當上下游遊戲供應商與運營商的中介
- **核心特色**: 雙後台架構 (Master Admin + Merchant Portal)

### 1.2 業務模式

| 角色 | 描述 | 系統側 |
|------|------|--------|
| **Upstream (上游)** | 遊戲供應商 (GP, PG, Evolution) | 受管理 |
| **Midstream (中台)** | 聚合商 (本系統) | 清算與對接 |
| **Downstream (下游)** | 運營商/商戶 | 消費者 |

### 1.3 部署模式

- **前台架構**: Vue 3 SPA (部署至 Vercel)
- **後台架構**: Golang/Node.js (PostgreSQL + ClickHouse + Redis)
- **開發階段**: 前台原型 (MSW Mock 數據)
- **預計交付**: 前後端分離後，前台由前端團隊接手

---

## 2. 技術棧分析

### 2.1 前端技術棧

```json
{
  "core": {
    "framework": "Vue 3",
    "syntax": "Script Setup + Composition API",
    "language": "TypeScript (Strict Mode)",
    "build_tool": "Vite 7.2",
    "bundler": "esbuild"
  },
  "ui_framework": {
    "primary": "Naive UI 2.43",
    "features": [
      "Dark/Light Theme Support",
      "Component-rich (Table, Tree, Modal, etc.)",
      "Dark Mode Default for Master Admin"
    ]
  },
  "styling": {
    "primary": "Tailwind CSS 3.4",
    "approach": "Utility-first",
    "rule": "Minimal custom CSS (避免 <style scoped>)"
  },
  "state_management": {
    "solution": "Pinia 3.0",
    "approach": "Modular Stores",
    "key_stores": ["auth.ts"]
  },
  "routing": {
    "framework": "Vue Router 4.6",
    "features": [
      "Dynamic Route Permission",
      "beforeEach Guards",
      "Dual-role routing (/admin/*, /merchant/*)"
    ]
  },
  "internationalization": {
    "solution": "Vue i18n 11.2",
    "supported_languages": ["zh-TW", "en"],
    "structure": "Modular locales"
  },
  "data_visualization": {
    "primary": "ECharts 6.0 + vue-echarts 8.0",
    "use_cases": ["P&L Trends", "GGR Charts", "Statistics"]
  },
  "development": {
    "mocking": "MSW (Mock Service Worker) 2.12",
    "testing_data": "FakerJS 10.2",
    "utilities": [
      "date-fns 4.1",
      "big.js 7.0 (精準計算)",
      "nprogress 0.2 (進度條)",
      "@vueuse/core 14.1 (組件鉤子)"
    ]
  },
  "package_version": "0.0.1 (Prototype)"
}
```

### 2.2 依賴項詳細清單

**生產依賴** (dependencies):
```
vue@3.5.24          # 核心框架
vue-router@4.6.4    # 路由管理
pinia@3.0.4         # 狀態管理
naive-ui@2.43.2     # UI 組件庫
tailwindcss@3.4.17  # 樣式框架（devDep）
vue-i18n@11.2.8     # 國際化
echarts@6.0.0       # 數據可視化
vue-echarts@8.0.1   # Vue 適配器
big.js@7.0.1        # 精準算術
date-fns@4.1.0      # 日期處理
msw@2.12.7          # API Mock
nprogress@0.2.0     # 進度指示
@vueuse/core@14.1.0 # Vue 工具庫
```

**開發依賴** (devDependencies):
```
typescript@5.9.3       # 類型檢查
vite@7.2.4            # 構建工具
vue-tsc@3.1.4         # Vue TypeScript 檢查
@vitejs/plugin-vue@6  # Vite Vue 插件
```

---

## 3. 架構設計模式

### 3.1 分層架構 (Layered Architecture)

```
┌─────────────────────────────────────────┐
│      Presentation Layer (Views)         │
│  ┌──────────────┐  ┌──────────────┐    │
│  │ Master Views │  │ Merchant     │    │
│  │  /Admin/*    │  │ Views        │    │
│  └──────────────┘  │ /Merchant/*  │    │
│                    └──────────────┘    │
└─────────────────────────────────────────┘
                      │
┌─────────────────────────────────────────┐
│    Business Logic Layer (Composables)   │
│  ┌────────────────────────────────┐    │
│  │ useMerchantList.ts             │    │
│  │ useMerchantDetail.ts           │    │
│  │ useRoundSearch.ts              │    │
│  │ useAgentList.ts                │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘
                      │
┌─────────────────────────────────────────┐
│   Data & API Layer (API + Stores)       │
│  ┌──────────────┐  ┌──────────────┐    │
│  │ API Calls    │  │ Pinia Stores │    │
│  │ (api/*)      │  │ (stores/*)   │    │
│  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────┘
                      │
┌─────────────────────────────────────────┐
│   Mock Layer (MSW)                      │
│  ┌────────────────────────────────┐    │
│  │ src/mocks/handlers.ts          │    │
│  │ src/mocks/agent.ts             │    │
│  │ src/mocks/system.ts            │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

### 3.2 雙後台權限隔離模式

```
路由守衛 (router/index.ts)
        │
        ├─ /admin/* (Master Admin)
        │   ├─ 佈局: MasterLayout.vue (Dark Theme)
        │   ├─ 權限: 最高 (管理所有商戶、遊戲、風控)
        │   └─ 功能: Dashboard, Game Mgmt, Finance, etc.
        │
        └─ /merchant/* (Merchant Portal)
            ├─ 佈局: MerchantLayout.vue (Light Theme)
            ├─ 權限: 受限 (僅自身數據、下級代理)
            └─ 功能: My Games, Invoices, Reports, etc.
```

### 3.3 組件複用策略

```
src/components/
├── Common/                    # 通用極小組件
│   ├── StatusBadge.vue       # 狀態標籤
│   ├── MoneyText.vue         # 金額顯示
│   ├── TrendValue.vue        # 趨勢值
│   └── DateRangePicker.vue   # 日期範圍選擇
│
├── Business/                  # 業務特定組件
│   ├── RTPSelector.vue       # RTP 選擇器
│   ├── PageFilterBar.vue     # 篩選欄
│   └── StatusSwitch.vue      # 狀態開關
│
└── (Domain-specific subdirs)  # 領域特定
```

---

## 4. 檔案結構與模組化

### 4.1 完整目錄結構

```
src/
├── api/                    # API 定義 (目前空)
│
├── assets/                 # 靜態資源
│   └── images/
│
├── components/             # Vue 組件
│   ├── Common/            # 通用組件
│   ├── Business/          # 業務組件
│   └── ...
│
├── composables/            # 業務邏輯 (Composition Functions)
│   ├── useMerchantList.ts
│   ├── useMerchantDetail.ts
│   ├── useMerchantCreate.ts
│   ├── useRoundSearch.ts
│   └── useAgentList.ts
│
├── config/                 # 配置文件
│   ├── menu-master.ts      # Master Admin 菜單
│   └── menu-merchant.ts    # Merchant Portal 菜單
│
├── i18n.ts                 # 國際化配置
│
├── layouts/                # 頁面佈局
│   ├── MasterLayout.vue    # 總控佈局 (Dark)
│   ├── MerchantLayout.vue  # 商戶佈局 (Light)
│   └── AppMenu.vue         # 側邊菜單
│
├── locales/                # i18n 翻譯文件
│   ├── zh-TW/
│   │   ├── common.ts
│   │   ├── dashboard.ts
│   │   ├── menu.ts
│   │   └── ...
│   └── en/
│
├── mocks/                  # MSW Mock 配置
│   ├── browser.ts          # MSW 初始化
│   ├── handlers.ts         # Master Admin API Mock
│   ├── agent.ts            # Merchant API Mock
│   ├── finance.ts          # 財務相關 Mock
│   ├── funds.ts            # 資金相關 Mock
│   ├── system.ts           # 系統相關 Mock
│   ├── manual.ts           # 手動 Mock 數據
│   └── data/
│       └── games.ts        # 遊戲庫存 Mock 數據
│
├── plugins/                # 插件配置
│   └── echarts.ts         # ECharts 初始化
│
├── router/                 # 路由配置
│   ├── index.ts           # 主路由 + 權限守衛
│   └── guards.ts          # 路由守衛函數
│
├── scripts/                # 工具腳本
│   └── ...
│
├── stores/                 # Pinia 狀態管理
│   └── auth.ts            # 認證狀態
│
├── styles/                 # 全局樣式
│   └── style.css
│
├── types/                  # TypeScript 型別定義
│   ├── agent.ts           # Agent 相關型別
│   ├── dashboard.ts       # Dashboard 相關型別
│   ├── finance.ts         # 財務相關型別
│   ├── game.ts            # 遊戲相關型別
│   ├── merchant.ts        # 商戶相關型別
│   ├── provider.ts        # 供應商相關型別
│   ├── report.ts          # 報表相關型別
│   ├── system.ts          # 系統相關型別
│   └── table.ts           # 表格相關型別
│
├── utils/                  # 工具函數
│   ├── csvExport.ts       # CSV 導出
│   ├── math.ts            # 數學計算
│   ├── renderHelpers.ts   # 渲染輔助
│   └── ...
│
├── views/                  # 頁面視圖
│   ├── Auth/               # 認證相關
│   │   └── LoginPage.vue
│   ├── Error/              # 錯誤頁面
│   │   └── NotFound.vue
│   ├── Master/             # Master Admin 頁面
│   │   ├── Dashboard.vue
│   │   ├── MerchantManagement/
│   │   ├── GameCenter/
│   │   └── Finance/
│   └── Merchant/           # Merchant Portal 頁面
│       ├── Dashboard.vue
│       ├── MyGames/
│       ├── Finance/
│       └── Reports/
│
├── App.vue                 # 根組件
├── main.ts                 # 應用入口
└── style.css              # 全局樣式
```

### 4.2 模組化特點

| 層級 | 檔案 | 責任 |
|------|------|------|
| **Presentation** | `views/*.vue` | UI 渲染、用戶交互 |
| **Business Logic** | `composables/use*.ts` | 數據獲取、計算邏輯、狀態變動 |
| **Data** | `stores/*.ts`, `api/` | 全局狀態、API 呼叫 |
| **Domain Model** | `types/*.ts` | 型別定義、業務實體 |
| **Infrastructure** | `mocks/`, `config/`, `utils/` | 工具、配置、測試支持 |

---

## 5. 核心功能模組

### 5.1 Master Admin 主要功能

#### Dashboard (戰情中心)
- 實時 GGR 監控
- 活躍商戶數
- API 健康度指標
- P&L 趨勢圖表

#### Merchant Management (商戶管理)
- 商戶列表與詳情
- 商戶開戶與配置
- 額度管理與劃轉
- API Key 配置

#### Game Center (遊戲中心)
- 供應商管理
- 遊戲庫存同步
- RTP 設定
- 遊戲上架/下架

#### Finance & Settlement (財務清算)
- 對帳單生成
- 未結算報表
- 注單查詢
- 金流記錄

### 5.2 Merchant Portal 主要功能

#### Dashboard (商戶儀表板)
- 個人化營收卡片
- 轉化率分析
- 實時在線人數

#### My Games (我的遊戲)
- 自助上下架遊戲
- 遊戲狀態監控
- 熱門遊戲排序權重

#### Finance Center (財務中心)
- 我的帳單 (含 PDF 下載)
- 充值記錄
- 實時餘額查看

#### Reports (報表系統)
- 日營收報表
- 輸贏報表
- 下級代理貢獻度

---

## 6. 開發約定與最佳實踐

### 6.1 強制規範

#### A. UI 組件使用

| 類別 | 規則 | 禁止項 |
|------|------|--------|
| **按鈕** | 必用 `<n-button>` | 禁用 div 手刻按鈕 |
| **輸入框** | 必用 `<n-input>` | 禁用 input HTML tag |
| **表格** | 必用 `<n-data-table>` | 禁用 table HTML tag |
| **樹形結構** | 必用 `<n-tree>` | 禁用手刻遞迴 |
| **模態框** | 必用 `<n-modal>` | 禁用 div 模擬 |

#### B. 樣式與主題

| 類別 | 規則 |
|------|------|
| **顏色** | 禁止手寫 hex code，必用 Naive UI Theme 或 Tailwind 標準色 |
| **佈局** | 禁止 `<style scoped>`，必用 Tailwind Utility Classes |
| **自適應** | 所有組件必須響應式，使用 Tailwind 斷點 |
| **Dark Theme** | Master Admin 強制深色模式 |

#### C. 狀態管理

| 規則 | 說明 |
|------|------|
| **URL 驅動** | 主要頁面狀態必須反映在 URL Query 中 |
| **Pinia 存儲** | 全局狀態使用 Pinia，禁止過度 ref 變數 |
| **菜單同步** | Sidebar active-key 必須 watch 路由變化 |

#### D. 表格標準行為

所有 `<n-data-table>` 必須實現：

1. **排序** (Sorter)
   - 數值欄位: `(a, b) => a.key - b.key`
   - 字串欄位: `(a, b) => a.key.localeCompare(b.key)` (支持中文)
   - 布爾欄位: `(a, b) => Number(a.status) - Number(b.status)`

2. **篩選** (Filter)
   - 狀態欄位需要下拉篩選
   - 日期欄位需要日期範圍篩選

3. **分頁** (Pagination)
   - 預設分頁大小: 20-50
   - 支持動態改變每頁條數

### 6.2 代碼結構規範

#### Composable Pattern (業務邏輯分離)

```typescript
// src/composables/useMerchantList.ts
import { ref, computed } from 'vue'

export function useMerchantList() {
  // 響應式狀態
  const merchants = ref([])
  const loading = ref(false)
  const pagination = ref({ page: 1, pageSize: 20 })

  // 計算屬性
  const filteredMerchants = computed(() => {
    // 篩選邏輯
  })

  // 方法
  const fetchMerchants = async () => {
    loading.value = true
    // API 呼叫邏輯
  }

  return {
    merchants,
    loading,
    pagination,
    filteredMerchants,
    fetchMerchants
  }
}
```

#### View Component Pattern

```vue
<template>
  <div class="p-4">
    <!-- 頁面篩選欄 -->
    <PageFilterBar v-model="filters" />

    <!-- 資料表格 -->
    <n-data-table
      :columns="columns"
      :data="filteredData"
      :loading="loading"
      :pagination="pagination"
      @update:sorter="handleSort"
    />
  </div>
</template>

<script setup lang="ts">
// 導入業務邏輯
const { merchants, loading, fetchMerchants } = useMerchantList()

// 業務邏輯保持簡潔
onMounted(() => {
  fetchMerchants()
})
</script>
```

### 6.3 i18n 國際化

所有用戶可見文本必須國際化:

```typescript
// src/locales/zh-TW/common.ts
export default {
  save: '保存',
  delete: '刪除',
  confirm: '確認',
  cancel: '取消'
}

// 在組件中使用
{{ $t('common.save') }}
```

### 6.4 數據精準性

使用 `big.js` 進行貨幣計算:

```typescript
import Big from 'big.js'

// ❌ 不推薦
const total = 0.1 + 0.2  // 0.30000000000000004

// ✅ 推薦
const total = new Big(0.1).plus(0.2).toString()  // "0.3"
```

---

## 7. 新專案適配指南

### 7.1 新專案背景

**專案名稱**: 博弈遊戲開發商的總控後台
**業務定位**: 遊戲開發商管理自身遊戲產品的後台管理系統
**核心場景**:
- 遊戲版本管理與發佈
- 玩家數據與營收監控
- 風險控制與異常檢測
- 服務配置與上線管理

### 7.2 適用架構模式

| 模式 | 是否適用 | 說明 |
|------|---------|------|
| **分層架構** | ✅ 完全適用 | composables 分離業務邏輯 |
| **雙後台隔離** | ⚠️ 部分適用 | 改為單一後台 + 角色權限系統 |
| **組件複用** | ✅ 完全適用 | Naive UI + Tailwind 組合 |
| **MSW Mock** | ✅ 適用 | 前後端分離開發 |
| **i18n 國際化** | ✅ 適用 | 保留多語系支持 |

### 7.3 架構調整清單

#### 路由結構調整

```
現有模式:
/admin/*       (Master Admin)
/merchant/*    (Merchant Portal)

新項目模式:
/dashboard/*   (公共儀表板)
/games/*       (遊戲管理)
/players/*     (玩家管理)
/analytics/*   (數據分析)
/settings/*    (系統設置)
```

#### 功能模組調整

```
保留的模組:
✅ Dashboard (改為開發商管理視圖)
✅ Game Management (保留，核心功能)
✅ Finance & Analytics (改為營收分析)
✅ Reports (保留，報表系統)

新增的模組:
📌 Game Version Control (版本管理)
📌 Release Management (上線管理)
📌 Risk Control (風控告警)
📌 API Integration (供應商接入)
```

#### Pinia Stores 調整

```
保留:
✅ stores/auth.ts

新增:
📌 stores/game.ts       (遊戲相關狀態)
📌 stores/analytics.ts  (分析數據)
📌 stores/settings.ts   (系統設置)
```

#### Composables 調整

```
保留思路:
✅ 業務邏輯分離至 composables/

新增:
📌 useGameManagement.ts
📌 useGameRelease.ts
📌 usePlayerAnalytics.ts
📌 useRiskControl.ts
📌 useGameVersionControl.ts
```

### 7.4 技術棧繼承清單

| 技術 | 版本 | 新專案使用 |
|------|------|-----------|
| Vue 3 | 3.5.24 | ✅ 完全繼承 |
| TypeScript | 5.9.3 | ✅ 完全繼承 |
| Vite | 7.2.4 | ✅ 完全繼承 |
| Naive UI | 2.43.2 | ✅ 完全繼承 |
| Tailwind CSS | 3.4.17 | ✅ 完全繼承 |
| Pinia | 3.0.4 | ✅ 完全繼承 |
| Vue Router | 4.6.4 | ✅ 完全繼承 |
| Vue i18n | 11.2.8 | ✅ 完全繼承 |
| ECharts | 6.0.0 | ✅ 完全繼承 |
| MSW | 2.12.7 | ✅ 完全繼承 |
| big.js | 7.0.1 | ✅ 適度使用 |
| date-fns | 4.1.0 | ✅ 完全繼承 |

### 7.5 檔案結構參考

```
new-project/
├── src/
│   ├── api/                    # API 定義
│   ├── components/             # Vue 組件 (複用既有模式)
│   ├── composables/            # 業務邏輯 (新增 useGameManagement 等)
│   ├── config/                 # 配置文件
│   ├── layouts/                # 頁面佈局 (改為單一佈局)
│   ├── locales/                # i18n 翻譯文件 (繼承)
│   ├── mocks/                  # MSW Mock (根據新功能擴展)
│   ├── plugins/                # 插件配置
│   ├── router/                 # 路由配置 (調整路由結構)
│   ├── stores/                 # Pinia 狀態管理 (新增模塊)
│   ├── types/                  # TypeScript 型別 (新增遊戲相關型別)
│   ├── utils/                  # 工具函數
│   ├── views/                  # 頁面視圖 (新增遊戲/分析頁面)
│   ├── App.vue                 # 根組件
│   ├── main.ts                 # 應用入口
│   └── style.css              # 全局樣式
│
├── package.json                # 繼承依賴版本
├── tsconfig.json              # TypeScript 配置
├── vite.config.ts             # Vite 配置
├── tailwind.config.js         # Tailwind 配置
└── README.md                  # 項目文檔
```

### 7.6 開發工作流程

1. **初始化項目**
   ```bash
   npm create vite@latest game-developer-dashboard -- --template vue-ts
   npm install
   ```

2. **複製核心配置**
   - `tsconfig.json`, `vite.config.ts`, `tailwind.config.js`
   - `src/plugins/echarts.ts`, `src/i18n.ts`
   - `src/styles/style.css`

3. **建立新的佈局與路由**
   - 創建單一 `MainLayout.vue` (替代 Master/Merchant)
   - 實現角色權限系統 (替代路由隔離)

4. **開發新功能模組**
   - `composables/useGameManagement.ts`
   - `views/Games/`, `views/Analytics/`, 等

5. **Mock 數據準備**
   - 基於新的 API 規範編寫 MSW handlers

---

## 附錄 A: 關鍵配置文件範本

### A.1 main.ts 模式

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from './i18n'

// MSW 初始化 (開發 + 生產)
if (import.meta.env.DEV || import.meta.env.VITE_USE_MOCK === 'true') {
  import('./mocks/browser').then(({ worker }) => {
    worker.start()
  })
}

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(i18n)
app.mount('#app')
```

### A.2 router/index.ts 模式

```typescript
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/Dashboard/Index.vue')
      },
      // ... 其他路由
    ],
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 權限守衛
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
```

---

## 附錄 B: 開發命令參考

```bash
# 開發模式
npm run dev

# 生產構建
npm run build

# 類型檢查
vue-tsc

# 預覽構建結果
npm run preview
```

---

## 總結

本分析報告完整記錄了 Aggregator 專案的架構設計、技術棧與最佳實踐，為新專案 "博弈遊戲開發商的總控後台" 提供了清晰的架構參考與實施指南。

**關鍵優勢**:
- ✅ 成熟的分層架構，易於擴展
- ✅ 完整的 TypeScript 類型系統
- ✅ MSW Mock 支持前後端分離開發
- ✅ 國際化支持，可快速適配多地區
- ✅ 豐富的 UI 組件庫與樣式系統

**新專案實施建議**:
1. 直接繼承技術棧與項目結構
2. 調整路由結構至單一後台模式
3. 新增遊戲版本管理、風控告警等功能模組
4. 保留 MSW Mock 進行前後端分離開發
5. 建立詳細的 API 規範文檔
