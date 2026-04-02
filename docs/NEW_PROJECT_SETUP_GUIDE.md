# 新專案快速啟動指南

**專案名稱**: 博弈遊戲開發商的總控後台
**基於模板**: Antigravity Aggregator
**準備時間**: ~2-3 小時
**交付形式**: 前後端分離 (前台 Vue SPA + 後台 API)

---

## 🚀 第一步：項目初始化

### 1.1 創建新項目

```bash
# 方案 A: 使用 Vite 官方模板
npm create vite@latest game-developer-dashboard -- --template vue-ts
cd game-developer-dashboard
npm install

# 方案 B: 克隆並修改現有 Aggregator (推薦)
git clone <aggregator-repo> game-developer-dashboard
cd game-developer-dashboard
rm -rf .git
git init
npm install --legacy-peer-deps  # 如需兼容
```

### 1.2 核心依賴安裝

```bash
# 生產依賴
npm install vue@3.5.24 \
  vue-router@4.6.4 \
  pinia@3.0.4 \
  naive-ui@2.43.2 \
  vue-i18n@11.2.8 \
  echarts@6.0.0 \
  vue-echarts@8.0.1 \
  big.js@7.0.1 \
  date-fns@4.1.0 \
  msw@2.12.7 \
  nprogress@0.2.0 \
  @vueuse/core@14.1.0 \
  @faker-js/faker@10.2.0

# 開發依賴
npm install -D typescript@5.9.3 \
  vite@7.2.4 \
  @vitejs/plugin-vue@6.0.1 \
  vue-tsc@3.1.4 \
  tailwindcss@3.4.17 \
  postcss@8.5.6 \
  autoprefixer@10.4.23 \
  @types/node@24.10.1
```

---

## 📁 第二步：目錄結構建立

### 2.1 創建關鍵目錄

```bash
mkdir -p src/{api,assets,components,composables,config,layouts,locales,mocks,plugins,router,scripts,stores,types,utils,views}

mkdir -p src/components/{Common,Business,Layout}
mkdir -p src/views/{Auth,Dashboard,Games,Players,Analytics,Settings}
mkdir -p src/locales/{zh-TW,en}
mkdir -p src/types
mkdir -p src/mocks/data
```

### 2.2 複製核心文件

從 Aggregator 複製以下文件到新專案:

```
# 配置文件
✅ tsconfig.json
✅ tsconfig.app.json
✅ tsconfig.node.json
✅ vite.config.ts
✅ tailwind.config.js
✅ postcss.config.js

# 源代碼核心
✅ src/main.ts
✅ src/style.css
✅ src/App.vue
✅ src/i18n.ts
✅ src/plugins/echarts.ts

# UI 與佈局
✅ src/layouts/*.vue (複用或修改)
✅ src/components/Common/*.vue (複用)
✅ src/config/menu-*.ts (修改為新結構)

# 工具與字典
✅ src/utils/*.ts (複用)
✅ src/locales/ (複用框架，翻譯內容重寫)
✅ src/types/table.ts (複用)

# HTML 入口
✅ index.html
✅ public/
```

---

## ⚙️ 第三步：配置調整

### 3.1 修改 package.json

```json
{
  "name": "game-developer-dashboard",
  "description": "Game Developer Master Dashboard",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc -b && vite build",
    "preview": "vite preview",
    "type-check": "vue-tsc --noEmit"
  }
}
```

### 3.2 修改 vite.config.ts

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    proxy: {
      // 如需代理真實後端 API
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
```

### 3.3 修改 tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {}
  },
  plugins: []
}
```

---

## 🎨 第四步：路由與佈局重構

### 4.1 調整路由結構

修改 `src/router/index.ts`:

```typescript
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 主佈局
import MainLayout from '@/layouts/MainLayout.vue'

// 頁面視圖
import Dashboard from '@/views/Dashboard/Index.vue'
import GameManagement from '@/views/Games/Index.vue'
import PlayerAnalytics from '@/views/Players/Index.vue'
import Analytics from '@/views/Analytics/Index.vue'
import Settings from '@/views/Settings/Index.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('@/views/Auth/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        component: Dashboard,
        meta: { title: '儀表板' }
      },
      {
        path: 'games',
        component: GameManagement,
        meta: { title: '遊戲管理' }
      },
      {
        path: 'players',
        component: PlayerAnalytics,
        meta: { title: '玩家分析' }
      },
      {
        path: 'analytics',
        component: Analytics,
        meta: { title: '數據分析' }
      },
      {
        path: 'settings',
        component: Settings,
        meta: { title: '系統設置' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守衛
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

### 4.2 建立統一佈局

新建 `src/layouts/MainLayout.vue`:

```vue
<template>
  <div class="flex h-screen bg-slate-900">
    <!-- 側邊欄 -->
    <aside class="w-64 bg-slate-800 text-white">
      <nav class="p-4">
        <h1 class="text-xl font-bold mb-8">遊戲開發商後台</h1>
        <AppMenu />
      </nav>
    </aside>

    <!-- 主容區 -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- 頂部欄 -->
      <header class="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
        <h2 class="text-lg font-semibold">{{ pageTitle }}</h2>
        <div class="flex items-center gap-4">
          <span>{{ username }}</span>
          <button @click="logout" class="text-red-500">登出</button>
        </div>
      </header>

      <!-- 內容區 -->
      <div class="flex-1 overflow-auto p-6 bg-slate-50">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppMenu from './AppMenu.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const pageTitle = computed(() => route.meta.title || '儀表板')
const username = computed(() => authStore.currentUser?.username || '用戶')

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
```

新建 `src/layouts/AppMenu.vue`:

```vue
<template>
  <n-menu
    :options="menuOptions"
    :value="activeKey"
    @update:value="handleMenuSelect"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NMenu, type MenuOption } from 'naive-ui'

const router = useRouter()
const route = useRoute()

const menuOptions: MenuOption[] = [
  {
    label: '儀表板',
    key: 'dashboard',
    icon: () => '📊'
  },
  {
    label: '遊戲管理',
    key: 'games',
    icon: () => '🎮'
  },
  {
    label: '玩家分析',
    key: 'players',
    icon: () => '👥'
  },
  {
    label: '數據分析',
    key: 'analytics',
    icon: () => '📈'
  },
  {
    label: '系統設置',
    key: 'settings',
    icon: () => '⚙️'
  }
]

const activeKey = computed(() => {
  const path = route.path
  return path.split('/')[1] || 'dashboard'
})

const handleMenuSelect = (key: string) => {
  router.push(`/${key}`)
}
</script>
```

---

## 🔌 第五步：Mock API 配置

### 5.1 MSW 初始化

新建 `src/mocks/browser.ts`:

```typescript
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
```

### 5.2 API Handlers 示例

新建 `src/mocks/handlers.ts`:

```typescript
import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker'

export const handlers = [
  // 登入
  http.post('/api/auth/login', async ({ request }) => {
    return HttpResponse.json({
      code: 0,
      data: {
        token: faker.string.uuid(),
        user: {
          id: 1,
          username: 'admin',
          role: 'admin'
        }
      }
    })
  }),

  // 獲取儀表板數據
  http.get('/api/dashboard/stats', () => {
    return HttpResponse.json({
      code: 0,
      data: {
        totalGames: 50,
        activeUsers: 1234,
        todayRevenue: 5000,
        weeklyGrowth: 12.5
      }
    })
  }),

  // 獲取遊戲列表
  http.get('/api/games', () => {
    return HttpResponse.json({
      code: 0,
      data: Array.from({ length: 20 }, () => ({
        id: faker.string.uuid(),
        name: faker.commerce.productName(),
        status: faker.helpers.arrayElement(['active', 'inactive']),
        version: faker.system.semver(),
        releaseDate: faker.date.past(),
        activeUsers: faker.number.int({ min: 100, max: 10000 })
      }))
    })
  })
]
```

### 5.3 main.ts 中啟動 MSW

```typescript
// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from './i18n'

// MSW 初始化 (開發 + 生產原型)
if (import.meta.env.DEV || import.meta.env.VITE_USE_MOCK === 'true') {
  import('./mocks/browser').then(({ worker }) => {
    worker.start({
      onUnhandledRequest: 'bypass'  // 允許真實請求通過
    })
  })
}

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(i18n)
app.mount('#app')
```

---

## 🏢 第六步：狀態管理與 Composables

### 6.1 建立 Auth Store

新建 `src/stores/auth.ts`:

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface User {
  id: number
  username: string
  role: string
}

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))

  const isAuthenticated = computed(() => !!token.value)

  const login = async (username: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    const result = await response.json()
    token.value = result.data.token
    currentUser.value = result.data.user
    localStorage.setItem('token', token.value)
  }

  const logout = () => {
    token.value = null
    currentUser.value = null
    localStorage.removeItem('token')
  }

  return {
    currentUser,
    token,
    isAuthenticated,
    login,
    logout
  }
})
```

### 6.2 建立業務 Composable

新建 `src/composables/useGameManagement.ts`:

```typescript
import { ref, computed, onMounted } from 'vue'

export interface Game {
  id: string
  name: string
  status: 'active' | 'inactive'
  version: string
  releaseDate: Date
  activeUsers: number
}

export function useGameManagement() {
  const games = ref<Game[]>([])
  const loading = ref(false)
  const searchText = ref('')

  const filteredGames = computed(() => {
    return games.value.filter(game =>
      game.name.toLowerCase().includes(searchText.value.toLowerCase())
    )
  })

  const fetchGames = async () => {
    loading.value = true
    try {
      const response = await fetch('/api/games')
      const result = await response.json()
      games.value = result.data
    } catch (error) {
      console.error('Failed to fetch games:', error)
    } finally {
      loading.value = false
    }
  }

  const toggleGameStatus = async (gameId: string) => {
    const game = games.value.find(g => g.id === gameId)
    if (!game) return

    game.status = game.status === 'active' ? 'inactive' : 'active'
    // 發送更新請求
    await fetch(`/api/games/${gameId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: game.status })
    })
  }

  onMounted(() => {
    fetchGames()
  })

  return {
    games,
    loading,
    searchText,
    filteredGames,
    fetchGames,
    toggleGameStatus
  }
}
```

---

## 🎯 第七步：建立首個頁面

### 7.1 儀表板頁面

新建 `src/views/Dashboard/Index.vue`:

```vue
<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold">儀表板</h1>

    <!-- 統計卡片 -->
    <div class="grid grid-cols-4 gap-4">
      <n-card title="遊戲總數">
        <div class="text-3xl font-bold text-blue-600">50</div>
      </n-card>
      <n-card title="活躍玩家">
        <div class="text-3xl font-bold text-green-600">1,234</div>
      </n-card>
      <n-card title="今日營收">
        <div class="text-3xl font-bold text-purple-600">$5,000</div>
      </n-card>
      <n-card title="周增長">
        <div class="text-3xl font-bold text-orange-600">+12.5%</div>
      </n-card>
    </div>

    <!-- 圖表 -->
    <n-card title="營收趨勢">
      <v-chart
        :option="chartOption"
        style="height: 300px"
      />
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NCard } from 'naive-ui'
import { ECharts } from '@/plugins/echarts'

const chartOption = ref({
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      data: [120, 200, 150, 80, 70, 110, 130],
      type: 'line'
    }
  ]
})
</script>
```

### 7.2 遊戲管理頁面

新建 `src/views/Games/Index.vue`:

```vue
<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">遊戲管理</h1>
      <n-button type="primary" @click="showCreateModal = true">
        + 新增遊戲
      </n-button>
    </div>

    <!-- 搜索欄 -->
    <n-input
      v-model:value="searchText"
      type="text"
      placeholder="搜索遊戲..."
      clearable
    />

    <!-- 遊戲表格 -->
    <n-data-table
      :columns="columns"
      :data="filteredGames"
      :loading="loading"
      :pagination="{ pageSize: 20 }"
      :scroll-x="800"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NButton, NInput, NDataTable, NTag } from 'naive-ui'
import { useGameManagement } from '@/composables/useGameManagement'

const { games, loading, searchText, filteredGames, toggleGameStatus } = useGameManagement()
const showCreateModal = ref(false)

const columns = [
  {
    title: '遊戲名稱',
    key: 'name',
    sorter: (a: any, b: any) => a.name.localeCompare(b.name)
  },
  {
    title: '版本',
    key: 'version',
    sorter: (a: any, b: any) => a.version.localeCompare(b.version)
  },
  {
    title: '活躍玩家',
    key: 'activeUsers',
    sorter: (a: any, b: any) => a.activeUsers - b.activeUsers
  },
  {
    title: '狀態',
    key: 'status',
    render: (row: any) => {
      const color = row.status === 'active' ? 'success' : 'error'
      return h(NTag, { type: color }, { default: () => row.status })
    }
  },
  {
    title: '操作',
    key: 'actions',
    render: (row: any) => {
      return h('div', { class: 'space-x-2' }, [
        h(NButton, {
          text: true,
          type: 'primary',
          onClick: () => toggleGameStatus(row.id)
        }, { default: () => '切換' }),
        h(NButton, {
          text: true,
          type: 'warning',
          onClick: () => {}
        }, { default: () => '編輯' })
      ])
    }
  }
]
</script>
```

---

## 🚢 第八步：構建與部署

### 8.1 構建命令

```bash
# 開發模式
npm run dev

# 類型檢查
npm run type-check

# 生產構建
npm run build

# 預覽構建結果
npm run preview
```

### 8.2 Vercel 部署

#### 方案 A: 使用 Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

#### 方案 B: 使用 Vercel 配置文件

新建 `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "env": {
    "VITE_USE_MOCK": "true"
  }
}
```

### 8.3 環境變數配置

新建 `.env.local` (本地開發):

```
VITE_API_BASE_URL=http://localhost:8080
VITE_USE_MOCK=true
```

新建 `.env.production` (生產環境):

```
VITE_API_BASE_URL=https://api.example.com
VITE_USE_MOCK=false
```

---

## 📋 檢查清單

初始化完成後，請確認:

- [ ] 項目成功初始化並 npm install
- [ ] 所有依賴已正確安裝
- [ ] TypeScript 配置正確
- [ ] 路由系統正常工作
- [ ] MSW Mock 在開發環境啟動
- [ ] 至少一個完整頁面已實現 (登入 + 儀表板)
- [ ] i18n 國際化正常工作
- [ ] Naive UI 主題已應用
- [ ] Tailwind CSS 樣式可用
- [ ] npm run build 能成功構建
- [ ] npm run preview 預覽正常

---

## 🔗 關聯文檔

| 文檔 | 用途 |
|------|------|
| `ARCHITECTURE_ANALYSIS.md` | 完整架構設計與技術棧分析 |
| `API_CONTRACT.md` | 後端 API 規範 (需根據遊戲開發商需求修改) |
| `TECH_STANDARDS.md` | 開發標準與最佳實踐 |

---

## 💡 常見問題

### Q: 如何添加新的 API Mock?

```typescript
// src/mocks/handlers.ts
http.get('/api/new-endpoint', () => {
  return HttpResponse.json({ ... })
})
```

### Q: 如何切換深色/淺色主題?

```vue
<script setup>
import { useTheme } from 'naive-ui'
const theme = useTheme()
theme.value = theme.value === 'dark' ? 'light' : 'dark'
</script>
```

### Q: 如何添加新的國際化文本?

```typescript
// src/locales/zh-TW/common.ts
export default {
  newText: '新文本'
}

// 在組件中使用
{{ $t('common.newText') }}
```

### Q: 如何與真實後端 API 對接?

1. 關閉 MSW Mock: `VITE_USE_MOCK=false`
2. 配置 API Base URL: `VITE_API_BASE_URL=https://api.example.com`
3. 在 `composables/` 中實現真實 API 調用
4. 測試 API 集成

---

**祝你開發愉快！🚀**
