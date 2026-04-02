# Claude Code 開發指引
# 博弈遊戲開發商的總控後台

> 本文件是 Claude Code 在此專案中的工作憲章。每次對話開始前請先讀此文件。

---

## 1. 專案背景

**專案名稱**: 博弈遊戲開發商的總控後台 (Game Developer Master Dashboard)
**業務角色**: 遊戲開發商管理自身遊戲產品的後台系統
**開發模式**: 前台原型先行，完成後交付前後端夥伴進行 API 串接
**參考架構**: 基於 Aggregator 專案改造（`ARCHITECTURE_ANALYSIS.md`）
**功能規範**: 詳見 `GAME_DEVELOPER_DASHBOARD_SPEC.md`

---

## 2. 技術棧（不可更改）

```
核心框架    Vue 3 (Script Setup + Composition API)
語言        TypeScript (Strict Mode，不允許 any)
建構工具    Vite
UI 框架     Naive UI（所有 UI 組件必須使用此庫）
樣式        Tailwind CSS（禁止手寫 <style scoped> 佈局）
狀態管理    Pinia
路由        Vue Router 4
國際化      Vue i18n（繁體中文為主，預留英文）
圖表        ECharts + vue-echarts
精確計算    big.js（所有金額計算必須使用）
日期處理    date-fns
API Mock    MSW + FakerJS（開發與生產原型均開啟）
```

---

## 3. 目錄結構（強制遵守）

```
src/
├── api/              # API 呼叫函數（目前為空，等待後端接手）
├── assets/           # 靜態資源
├── components/
│   ├── Common/       # 通用極小組件（StatusBadge, MoneyText, TrendValue）
│   └── Business/     # 業務特定組件（RTPSelector, GameStatusSwitch）
├── composables/      # ⭐ 所有業務邏輯必須在此（useXxx.ts）
├── config/           # 菜單設定（menu.ts）
├── layouts/          # 頁面佈局（MainLayout.vue, AppMenu.vue）
├── locales/          # i18n 翻譯（zh-TW/, en/）
├── mocks/            # MSW handlers + FakerJS 數據
│   └── data/         # 靜態 Mock 數據集
├── plugins/          # 插件（echarts.ts）
├── router/           # 路由設定與守衛
├── stores/           # Pinia 狀態管理
├── types/            # TypeScript 型別定義
├── utils/            # 工具函數（math.ts, csvExport.ts）
└── views/
    ├── Auth/         # 登入頁
    ├── Dashboard/    # 儀表板
    ├── Games/        # 遊戲管理
    ├── Players/      # 玩家分析
    ├── Finance/      # 財務結算
    └── Settings/     # 系統設置
```

---

## 4. 開發規範（違反即修正）

### 4.1 組件規範

```
✅ 按鈕   → <n-button>
✅ 輸入框  → <n-input> / <n-input-number>
✅ 選擇器  → <n-select> / <n-date-picker>
✅ 表格   → <n-data-table>
✅ 模態框  → <n-modal>
✅ 卡片   → <n-card>
✅ 通知   → <n-message> / <n-notification>
✅ 標籤   → <n-tag>

❌ 禁止 div 手刻按鈕
❌ 禁止 input HTML tag
❌ 禁止 table HTML tag
❌ 禁止 <style scoped> 寫佈局
❌ 禁止手寫 hex color（如 #FF0000）
❌ 禁止使用 any 型別
```

### 4.2 樣式規範

```
✅ 排版使用 Tailwind（flex, grid, gap, p-, m-, w-, h-）
✅ 顏色使用 Tailwind 標準色或 Naive UI Theme 變數
✅ Dashboard Widget 必須固定高度（h-[300px]）
✅ 列表頁使用 grid-cols-N 或 <n-grid>

❌ 禁止 style="width: 200px"（用 class="w-50"）
❌ 禁止 <style scoped> 佈局
```

### 4.3 業務邏輯規範

```
✅ 數據獲取、計算、篩選 → 抽至 composables/
✅ 全局狀態 → Pinia stores/
✅ 頁面組件只負責 UI 渲染與事件綁定
✅ 所有頁面主要狀態必須反映在 URL Query（如 ?tab=list&page=2）
✅ Sidebar active-key 必須 watch 路由變化

❌ 禁止在 .vue 中寫複雜業務邏輯
❌ 禁止用純 ref 變數切換主要頁面內容
```

### 4.4 表格規範

所有 `<n-data-table>` 必須實現：

- **排序**: 數值 `(a, b) => a.k - b.k`｜字串 `localeCompare`｜布爾 `Number(a.s) - Number(b.s)`
- **分頁**: 預設 pageSize = 20
- **空狀態**: 無資料時顯示友善提示
- **載入狀態**: `:loading="loading"` 必須傳入

### 4.5 金額計算規範

```typescript
// ❌ 禁止原生計算
const result = 0.1 + 0.2  // 0.30000000000000004

// ✅ 使用 big.js
import Big from 'big.js'
const result = new Big(0.1).plus(0.2).toString()  // "0.3"
```

---

## 5. Composable 標準模式

```typescript
// src/composables/useGameManagement.ts
import { ref, computed, onMounted } from 'vue'
import type { Game, GameFilter } from '@/types/game'

export function useGameManagement() {
  // ── 狀態 ──────────────────────────────────────
  const games = ref<Game[]>([])
  const loading = ref(false)
  const filters = ref<GameFilter>({
    status: undefined,
    search: '',
    page: 1,
    pageSize: 20
  })

  // ── 計算屬性 ──────────────────────────────────
  const filteredGames = computed(() => {
    return games.value.filter(g =>
      !filters.value.search || g.name.includes(filters.value.search)
    )
  })

  // ── 方法 ──────────────────────────────────────
  const fetchGames = async () => {
    loading.value = true
    try {
      const res = await fetch('/api/games')
      const json = await res.json()
      games.value = json.data
    } finally {
      loading.value = false
    }
  }

  // ── 生命週期 ──────────────────────────────────
  onMounted(fetchGames)

  return { games, loading, filters, filteredGames, fetchGames }
}
```

---

## 6. Mock API 標準格式

```typescript
// src/mocks/handlers/games.ts
import { http, HttpResponse } from 'msw'
import { faker } from '@faker-js/faker'

export const gameHandlers = [
  http.get('/api/games', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const limit = Number(url.searchParams.get('limit') ?? 20)

    const items = Array.from({ length: limit }, () => ({
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      status: faker.helpers.arrayElement(['active', 'inactive']),
      version: faker.system.semver(),
      rtp: faker.number.float({ min: 90, max: 98, fractionDigits: 1 }),
      activeUsers: faker.number.int({ min: 0, max: 5000 }),
      publishedAt: faker.date.past().toISOString()
    }))

    return HttpResponse.json({
      code: 0,
      data: { items, total: 50, page, limit }
    })
  })
]
```

---

## 7. 統一 API 響應格式

```typescript
// 所有 API 回傳必須符合此格式
interface ApiResponse<T> {
  code: number      // 0 = 成功，其他 = 錯誤
  data: T
  message?: string
}

// 列表類回傳格式
interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  limit: number
}
```

---

## 8. i18n 規範

```typescript
// src/locales/zh-TW/games.ts
export default {
  title: '遊戲管理',
  status: {
    active: '上架中',
    inactive: '已下架'
  },
  actions: {
    publish: '上架',
    unpublish: '下架',
    edit: '編輯'
  }
}

// 在組件中使用
{{ $t('games.title') }}
{{ $t('games.status.active') }}
```

---

## 9. 路由結構

```
/login                  登入頁
/                       → 重定向到 /dashboard
/dashboard              儀表板
/games                  遊戲列表
/games/:id              遊戲詳情
/players                玩家分析
/finance/settlements    結算報表
/finance/transactions   交易記錄
/finance/invoices       發票管理
/settings               系統設置
/settings/api-keys      API 密鑰管理
/settings/permissions   權限管理
```

---

## 10. 與使用者的協作方式

1. **實現前先確認**: 每個新功能開始前，先描述設計方案再動手
2. **數據結構先行**: 確認 types 再寫 composable，再寫組件
3. **分模組提交**: 每個完整功能模組完成後提交 git commit
4. **遇到不確定的交互邏輯**: 提出 2-3 個方案讓使用者選擇
5. **記錄到 DEVELOPMENT_NOTES.md**: 每個重大設計決策都要記錄

---

## 11. 每個功能模組完成的驗收清單

```
- [ ] TypeScript 無錯誤（vue-tsc --noEmit）
- [ ] 業務邏輯在 composable，組件保持輕量
- [ ] Mock API handler 已編寫，數據結構清晰
- [ ] 表格有排序、分頁、空狀態
- [ ] i18n 文本已添加（中文）
- [ ] URL 狀態同步（篩選條件在 query 中）
- [ ] 無 any 型別
- [ ] 無手寫 CSS 佈局
```
