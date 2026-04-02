# 技術快速查閱卡片 (Quick Reference)

**快速查閱版本** - 適合在開發過程中快速找到答案

---

## 📦 依賴版本快查表

```
Vue 3                  3.5.24
TypeScript             5.9.3
Vite                   7.2.4
Naive UI               2.43.2
Tailwind CSS           3.4.17
Pinia                  3.0.4
Vue Router             4.6.4
Vue i18n               11.2.8
ECharts                6.0.0
big.js                 7.0.1
date-fns               4.1.0
MSW                    2.12.7
@vueuse/core           14.1.0
```

---

## 🔧 常用命令速查

```bash
# 開發
npm run dev                    # 啟動開發服務器 (Port 5173)

# 構建
npm run build                  # 生產構建
npm run type-check             # TypeScript 類型檢查

# 預覽
npm run preview                # 預覽構建結果

# 安裝依賴
npm install --legacy-peer-deps # 老版本相容安裝
```

---

## 📁 目錄結構速查

```
src/
├── views/          頁面視圖
├── components/     Vue 組件
├── composables/    業務邏輯 ⭐
├── stores/         Pinia 狀態
├── types/          TypeScript 型別
├── router/         路由配置
├── mocks/          Mock API
├── locales/        i18n 翻譯
├── layouts/        頁面佈局
├── utils/          工具函數
├── plugins/        插件配置
├── config/         配置文件
├── assets/         靜態資源
└── styles/         全局樣式
```

---

## 🎨 Naive UI 常用組件

```vue
<!-- 表格 -->
<n-data-table :columns="columns" :data="data" />

<!-- 輸入框 -->
<n-input v-model:value="text" />
<n-input-number v-model:value="number" />

<!-- 選擇器 -->
<n-select v-model:value="selected" :options="options" />
<n-date-picker v-model:value="date" />

<!-- 按鈕 -->
<n-button type="primary">保存</n-button>

<!-- 卡片 -->
<n-card title="標題">內容</n-card>

<!-- 模態框 -->
<n-modal v-model:show="showModal">內容</n-modal>

<!-- 訊息提示 -->
<n-message>信息</n-message>
<n-notification>通知</n-notification>

<!-- 標籤 -->
<n-tag type="success">成功</n-tag>
```

---

## 📐 Tailwind CSS 常用類

```html
<!-- 尺寸 -->
<div class="w-full h-screen p-4 m-2"></div>

<!-- 顏色 -->
<div class="bg-blue-500 text-white border-gray-200"></div>

<!-- 佈局 -->
<div class="flex justify-center items-center space-y-4"></div>
<div class="grid grid-cols-3 gap-4"></div>

<!-- 響應式 -->
<div class="md:w-1/2 lg:w-1/3 xl:w-1/4"></div>

<!-- 陰影與邊框 -->
<div class="shadow-md rounded-lg border border-gray-200"></div>

<!-- 文字 -->
<div class="text-lg font-bold text-center underline"></div>
```

---

## 🔗 路由配置

```typescript
// src/router/index.ts
const routes = [
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
        component: () => import('@/views/Dashboard/Index.vue'),
        meta: { title: '儀表板' }
      }
    ]
  }
]
```

---

## 💾 Pinia 狀態管理

```typescript
// src/stores/game.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGameStore = defineStore('game', () => {
  // 狀態
  const games = ref([])
  const loading = ref(false)

  // 方法
  const fetchGames = async () => {
    loading.value = true
    // API 調用
    loading.value = false
  }

  return {
    games,
    loading,
    fetchGames
  }
})

// 在組件中使用
const gameStore = useGameStore()
```

---

## 🧠 Composables 模式

```typescript
// src/composables/useGameManagement.ts
import { ref, computed, onMounted } from 'vue'

export function useGameManagement() {
  const games = ref([])
  const loading = ref(false)
  const searchText = ref('')

  const filteredGames = computed(() => {
    return games.value.filter(game =>
      game.name.includes(searchText.value)
    )
  })

  const fetchGames = async () => {
    loading.value = true
    try {
      const response = await fetch('/api/games')
      games.value = await response.json()
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    fetchGames()
  })

  return {
    games,
    loading,
    searchText,
    filteredGames,
    fetchGames
  }
}

// 在組件中使用
const { games, loading, fetchGames } = useGameManagement()
```

---

## 📝 TypeScript 型別定義

```typescript
// src/types/game.ts

export interface Game {
  id: string
  name: string
  status: 'active' | 'inactive'
  version: string
  rtp: number
  publishedAt: Date
  activeUsers: number
}

export interface GameFilter {
  status?: 'active' | 'inactive'
  search?: string
  page?: number
}

export type GameStatus = 'active' | 'inactive' | 'maintenance'
```

---

## 🌐 多語言 i18n

```typescript
// src/locales/zh-TW/common.ts
export default {
  save: '保存',
  delete: '刪除',
  confirm: '確認',
  cancel: '取消'
}

// 在組件中使用
<template>
  <button>{{ $t('common.save') }}</button>
</template>
```

---

## 🔐 認證 & 路由守衛

```typescript
// src/router/index.ts
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})
```

---

## 📡 Mock API 設置

```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/games', () => {
    return HttpResponse.json({
      code: 0,
      data: [...]
    })
  }),

  http.post('/api/games', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      code: 0,
      data: { id: '1', ...body }
    }, { status: 201 })
  })
]
```

---

## 📊 ECharts 基本設置

```typescript
import * as echarts from 'echarts'

const option = {
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      data: [120, 200, 150],
      type: 'line'
    }
  ]
}

// 在 Vue 組件中使用 vue-echarts
<v-chart :option="option" style="height: 300px" />
```

---

## 💰 精確計算 (big.js)

```typescript
import Big from 'big.js'

// ❌ 禁止
const total = 0.1 + 0.2  // 0.30000000000000004

// ✅ 推薦
const total = new Big(0.1).plus(0.2).toString()  // "0.3"

// 其他操作
new Big(100).minus(30)      // 減法
new Big(10).times(5)        // 乘法
new Big(100).div(3)         // 除法
new Big(99.999).toFixed(2)  // 四舍五入
```

---

## 📅 日期處理 (date-fns)

```typescript
import { format, parseISO, addDays, startOfMonth } from 'date-fns'
import { zhCN } from 'date-fns/locale'

// 格式化
format(new Date(), 'yyyy-MM-dd', { locale: zhCN })

// 解析
parseISO('2026-03-31')

// 日期運算
addDays(new Date(), 7)

// 月初/月末
startOfMonth(new Date())
```

---

## 🎯 開發規範速查

### ✅ 必須做

```vue
<!-- 使用 Naive UI 組件 -->
<n-button type="primary">按鈕</n-button>

<!-- 使用 Tailwind 樣式 -->
<div class="p-4 bg-white rounded-lg shadow-md"></div>

<!-- 邏輯分離到 composables -->
const { items, loading, fetch } = useMyLogic()

<!-- URL 驅動狀態 -->
const { tab } = useRoute().query

<!-- TypeScript 嚴格模式 -->
interface User {
  id: string
  name: string
}
```

### ❌ 禁止做

```vue
<!-- 禁止: 手寫 hex color -->
<div style="color: #FF0000">❌</div>

<!-- 禁止: 自定義 CSS 佈局 -->
<style scoped>
.custom { width: 100px; }  /* ❌ 用 Tailwind 替代 */
</style>

<!-- 禁止: div 手刻按鈕 -->
<div @click="handler" class="cursor-pointer">❌</div>

<!-- 禁止: 邏輯在組件中 -->
const items = ref([])
const loading = ref(false)
const fetch = async () => { ... }  /* ❌ 應在 composable */

<!-- 禁止: 使用 any 型別 -->
const data: any = ...  // ❌
```

---

## 📋 常用 Git 命令

```bash
# 創建新分支
git checkout -b feature/game-management

# 查看狀態
git status

# 提交代碼
git add .
git commit -m "feat: add game management page"

# 推送分支
git push origin feature/game-management

# 創建 Pull Request
gh pr create --title "Add game management" --body "..."

# 同步主分支
git pull origin main
```

---

## 🐛 常見問題速查

| 問題 | 解決方案 |
|------|--------|
| `npm install` 失敗 | 使用 `npm install --legacy-peer-deps` |
| TypeScript 編譯錯誤 | 運行 `npm run type-check` 查詳細錯誤 |
| Vite 文件監聽不工作 | 重啟開發服務器或檢查 WSL2 配置 |
| MSW Mock 未生效 | 檢查 `main.ts` 中的初始化邏輯 |
| 樣式未應用 | 檢查 Tailwind class 名是否正確拼寫 |
| Naive UI 主題未應用 | 檢查 `NConfigProvider` 是否正確包裹 |
| i18n 文本未翻譯 | 檢查 `locales/` 目錄結構是否完整 |

---

## 🚀 部署命令

```bash
# Vercel 部署
npm install -g vercel
vercel login
vercel

# 環境變數
VITE_API_BASE_URL=https://api.example.com
VITE_USE_MOCK=false

# 本地預構建
npm run build
npm run preview
```

---

## 📞 緊急聯絡清單

| 角色 | 聯絡 | 用途 |
|------|------|------|
| Tech Lead | @architect | 架構決策、Code Review |
| Frontend Lead | @frontend-lead | 前端問題、PR 審核 |
| Product Manager | @pm | 需求澄清、優先級 |
| DevOps | @devops | 部署、環境配置 |
| Backend Lead | @backend-lead | API 集成、規範同步 |

---

**最後更新**: 2026-03-31
**印刷版本**: 建議列印並貼在工位旁邊 📌
