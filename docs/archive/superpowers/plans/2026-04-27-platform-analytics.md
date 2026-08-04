# Platform Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 將「代理分析」頁面重構為「平台分析」模組，以遊戲平台（運營商）為主角，提供列表概覽與平台詳細頁（8 個數字卡 + 流水趨勢圖 + 玩家列表）。

**Architecture:** 沿用現有 composable + MSW mock handler 模式。新增 `src/types/platform.ts`、`src/mocks/handlers/platforms.ts`、`src/composables/usePlatforms.ts`、`src/composables/usePlatformDetail.ts`，以及 `views/Platforms/` 下的 Index / Detail 頁面與 4 個子元件。

**Tech Stack:** Vue 3 (Script Setup), TypeScript strict, Naive UI, ECharts + vue-echarts (shallowRef 模式), MSW + faker, Tailwind CSS

---

## 檔案結構

| 動作 | 路徑 |
|---|---|
| **新建** | `src/types/platform.ts` |
| **新建** | `src/mocks/handlers/platforms.ts` |
| **修改** | `src/mocks/handlers/index.ts` |
| **新建** | `src/composables/usePlatforms.ts` |
| **新建** | `src/composables/usePlatformDetail.ts` |
| **新建** | `src/views/Platforms/Index.vue` |
| **新建** | `src/views/Platforms/Detail.vue` |
| **新建** | `src/views/Platforms/components/PlatformCard.vue` |
| **新建** | `src/views/Platforms/components/PlatformStatCards.vue` |
| **新建** | `src/views/Platforms/components/PlatformTrendChart.vue` |
| **新建** | `src/views/Platforms/components/PlatformPlayerTable.vue` |
| **修改** | `src/router/index.ts` |
| **修改** | `src/config/menu.ts` |
| **修改** | `src/locales/zh-TW.json` |
| **修改** | `src/locales/en.json` |

---

## Task 1：型別定義

**Files:**
- Create: `src/types/platform.ts`

- [ ] **Step 1：建立型別檔案**

```typescript
// src/types/platform.ts

export interface Platform {
    id: string
    name: string
    aggregatorId: string
    aggregatorName: string
    hasAgentSystem: boolean
    status: 'active' | 'inactive'
    // 以下數字隨 period 切換（playerCount 為累計，不受 period 影響）
    playerCount: number
    activePlayers: number
    turnover: number
    ggr: number
    jpCount: number
    jpTotal: number
}

export interface PlatformStats {
    playerCount: number
    activePlayers: number
    turnover: number
    ggr: number
    jpCount: number
    jpTotal: number
    avgTurnoverPerPlayer: number
    maxJpAmount: number
}

export interface TrendPoint {
    date: string      // 'YYYY-MM-DD'
    turnover: number
    ggr: number
}

export interface PlatformPlayer {
    playerId: string
    agentId: string | null    // 無代理系統平台為 null
    totalTurnover: number     // 累計（不隨 period 變動）
    periodTurnover: number    // 本期（隨 period 變動）
    lastActiveAt: string      // ISO 8601
}
```

- [ ] **Step 2：執行 build 確認型別無誤**

```bash
cd /Users/cooperfu/Desktop/Game_Development_Background && npm run build 2>&1 | tail -5
```

預期：`✓ built in` 結尾，無 TS error

- [ ] **Step 3：Commit**

```bash
git add src/types/platform.ts
git commit -m "feat(platform): add type definitions for platform analytics module"
```

---

## Task 2：MSW Mock Handler

**Files:**
- Create: `src/mocks/handlers/platforms.ts`
- Modify: `src/mocks/handlers/index.ts`

- [ ] **Step 1：建立 platforms mock handler**

```typescript
// src/mocks/handlers/platforms.ts
import { http, HttpResponse, delay } from 'msw'
import { faker } from '@faker-js/faker'
import type { Platform, PlatformStats, TrendPoint, PlatformPlayer } from '@/types/platform'

// ─── 平台基礎資料 ─────────────────────────────────────────────────────────────
type PlatformMeta = Omit<Platform, 'playerCount' | 'activePlayers' | 'turnover' | 'ggr' | 'jpCount' | 'jpTotal'>

const PLATFORM_META: PlatformMeta[] = [
    {
        id: 'plat-001',
        name: '自家平台',
        aggregatorId: 'agg-001',
        aggregatorName: '自家聚合商',
        hasAgentSystem: true,
        status: 'active',
    },
    {
        id: 'plat-002',
        name: '老子有錢',
        aggregatorId: 'agg-001',
        aggregatorName: '自家聚合商',
        hasAgentSystem: false,
        status: 'active',
    },
    {
        id: 'plat-003',
        name: '星城 ONLINE',
        aggregatorId: 'agg-001',
        aggregatorName: '自家聚合商',
        hasAgentSystem: false,
        status: 'active',
    },
]

// ─── 預計算每平台統計數字（週 / 月）─────────────────────────────────────────────
interface PeriodStats {
    activePlayers: number
    turnover: number
    ggr: number
    jpCount: number
    jpTotal: number
    maxJpAmount: number
}

const STATS_STORE: Record<string, { week: PeriodStats; month: PeriodStats }> = {
    'plat-001': {
        week:  { activePlayers: 38, turnover: 89200,  ggr: 5798,  jpCount: 2, jpTotal: 28500, maxJpAmount: 18000 },
        month: { activePlayers: 51, turnover: 285000, ggr: 18525, jpCount: 7, jpTotal: 95000, maxJpAmount: 24000 },
    },
    'plat-002': {
        week:  { activePlayers: 22, turnover: 45800,  ggr: 2977,  jpCount: 1, jpTotal: 9800,  maxJpAmount: 9800  },
        month: { activePlayers: 30, turnover: 142000, ggr: 9230,  jpCount: 3, jpTotal: 31500, maxJpAmount: 15000 },
    },
    'plat-003': {
        week:  { activePlayers: 11, turnover: 28300,  ggr: 1840,  jpCount: 0, jpTotal: 0,     maxJpAmount: 0     },
        month: { activePlayers: 16, turnover: 89500,  ggr: 5818,  jpCount: 1, jpTotal: 12000, maxJpAmount: 12000 },
    },
}

// ─── 玩家資料（內部含 weekTurnover / monthTurnover）──────────────────────────────
interface MockPlayer {
    playerId: string
    agentId: string | null
    totalTurnover: number
    weekTurnover: number
    monthTurnover: number
    lastActiveAt: string
}

const AGENT_IDS = ['agent-001', 'agent-002', 'agent-003', 'agent-004', 'agent-005']

const createMockPlayers = (platformId: string, hasAgentSystem: boolean, count: number): MockPlayer[] =>
    Array.from({ length: count }, (_, i) => {
        const monthTurnover = faker.number.float({ min: 500, max: 50000, fractionDigits: 2 })
        return {
            playerId: `${platformId}-p${String(i + 1).padStart(4, '0')}`,
            agentId: hasAgentSystem ? (AGENT_IDS[i % AGENT_IDS.length] ?? null) : null,
            totalTurnover: parseFloat((monthTurnover * faker.number.float({ min: 1.5, max: 12 })).toFixed(2)),
            weekTurnover: parseFloat((monthTurnover * faker.number.float({ min: 0.15, max: 0.35 })).toFixed(2)),
            monthTurnover,
            lastActiveAt: faker.date.recent({ days: 30 }).toISOString(),
        }
    })

const playerStore: Record<string, MockPlayer[]> = {
    'plat-001': createMockPlayers('plat-001', true,  60),
    'plat-002': createMockPlayers('plat-002', false, 35),
    'plat-003': createMockPlayers('plat-003', false, 20),
}

// ─── 趨勢圖輔助 ───────────────────────────────────────────────────────────────
const generateTrend = (platformId: string, period: 'week' | 'month'): TrendPoint[] => {
    const days = period === 'week' ? 7 : 30
    const stats = STATS_STORE[platformId]?.[period]
    const baseTurnover = stats ? stats.turnover / days : 1000
    return Array.from({ length: days }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (days - 1 - i))
        const turnover = parseFloat((baseTurnover * faker.number.float({ min: 0.6, max: 1.4 })).toFixed(2))
        return {
            date: d.toISOString().slice(0, 10),
            turnover,
            ggr: parseFloat((turnover * 0.065).toFixed(2)),
        }
    })
}

// ─── Handlers ─────────────────────────────────────────────────────────────────
export const platformHandlers = [

    // GET /api/platforms — 平台列表
    http.get('/api/platforms', async ({ request }) => {
        await delay(400)
        const url = new URL(request.url)
        const aggregatorId = url.searchParams.get('aggregatorId') ?? 'agg-001'
        const period = (url.searchParams.get('period') ?? 'month') as 'week' | 'month'

        const items: Platform[] = PLATFORM_META
            .filter(p => p.aggregatorId === aggregatorId)
            .map(meta => {
                const s = STATS_STORE[meta.id]?.[period]
                const players = playerStore[meta.id] ?? []
                return {
                    ...meta,
                    playerCount: players.length,
                    activePlayers: s?.activePlayers ?? 0,
                    turnover:      s?.turnover      ?? 0,
                    ggr:           s?.ggr           ?? 0,
                    jpCount:       s?.jpCount       ?? 0,
                    jpTotal:       s?.jpTotal       ?? 0,
                }
            })

        return HttpResponse.json({ data: items })
    }),

    // GET /api/platforms/:id — 單一平台資訊
    http.get('/api/platforms/:id', async ({ params }) => {
        await delay(200)
        const meta = PLATFORM_META.find(p => p.id === params.id)
        if (!meta) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
        const players = playerStore[meta.id] ?? []
        const month = STATS_STORE[meta.id]?.month
        const platform: Platform = {
            ...meta,
            playerCount:   players.length,
            activePlayers: month?.activePlayers ?? 0,
            turnover:      month?.turnover      ?? 0,
            ggr:           month?.ggr           ?? 0,
            jpCount:       month?.jpCount       ?? 0,
            jpTotal:       month?.jpTotal       ?? 0,
        }
        return HttpResponse.json(platform)
    }),

    // GET /api/platforms/:id/stats — 詳細頁數字卡
    http.get('/api/platforms/:id/stats', async ({ params, request }) => {
        await delay(350)
        const url = new URL(request.url)
        const period = (url.searchParams.get('period') ?? 'month') as 'week' | 'month'
        const id = params.id as string
        const s = STATS_STORE[id]?.[period]
        const players = playerStore[id] ?? []
        if (!s) return HttpResponse.json({ message: 'Not found' }, { status: 404 })

        const stats: PlatformStats = {
            playerCount:           players.length,
            activePlayers:         s.activePlayers,
            turnover:              s.turnover,
            ggr:                   s.ggr,
            jpCount:               s.jpCount,
            jpTotal:               s.jpTotal,
            avgTurnoverPerPlayer:  s.activePlayers > 0
                ? parseFloat((s.turnover / s.activePlayers).toFixed(2))
                : 0,
            maxJpAmount:           s.maxJpAmount,
        }
        return HttpResponse.json(stats)
    }),

    // GET /api/platforms/:id/trend — 趨勢圖
    http.get('/api/platforms/:id/trend', async ({ params, request }) => {
        await delay(350)
        const url = new URL(request.url)
        const period = (url.searchParams.get('period') ?? 'month') as 'week' | 'month'
        const trend = generateTrend(params.id as string, period)
        return HttpResponse.json(trend)
    }),

    // GET /api/platforms/:id/players — 玩家列表
    http.get('/api/platforms/:id/players', async ({ params, request }) => {
        await delay(400)
        const url = new URL(request.url)
        const period = (url.searchParams.get('period') ?? 'month') as 'week' | 'month'
        const search = url.searchParams.get('search') ?? ''
        const page = parseInt(url.searchParams.get('page') ?? '1')
        const limit = parseInt(url.searchParams.get('limit') ?? '20')

        let list = playerStore[params.id as string] ?? []
        if (search) list = list.filter(p => p.playerId.includes(search) || (p.agentId ?? '').includes(search))

        const total = list.length
        const items: PlatformPlayer[] = list.slice((page - 1) * limit, page * limit).map(p => ({
            playerId:       p.playerId,
            agentId:        p.agentId,
            totalTurnover:  p.totalTurnover,
            periodTurnover: period === 'week' ? p.weekTurnover : p.monthTurnover,
            lastActiveAt:   p.lastActiveAt,
        }))

        return HttpResponse.json({ items, total, page, limit })
    }),
]
```

- [ ] **Step 2：在 `index.ts` 加入 platformHandlers**

修改 `src/mocks/handlers/index.ts`，在最後加入：

```typescript
import { authHandlers } from './auth'
import { dashboardHandlers } from './dashboard'
import { gameHandlers } from './games'
import { playerHandlers } from './players'
import { financeHandlers } from './finance'
import { settingsHandlers } from './settings'
import { aggregatorsHandlers } from './aggregators'
import { platformHandlers } from './platforms'

export const handlers = [
    ...authHandlers,
    ...dashboardHandlers,
    ...gameHandlers,
    ...playerHandlers,
    ...financeHandlers,
    ...settingsHandlers,
    ...aggregatorsHandlers,
    ...platformHandlers,
]
```

- [ ] **Step 3：執行 build 確認**

```bash
npm run build 2>&1 | tail -5
```

預期：`✓ built in` 結尾

- [ ] **Step 4：Commit**

```bash
git add src/mocks/handlers/platforms.ts src/mocks/handlers/index.ts
git commit -m "feat(platform): add MSW mock handlers with 3 platforms and 5 API endpoints"
```

---

## Task 3：usePlatforms Composable

**Files:**
- Create: `src/composables/usePlatforms.ts`

- [ ] **Step 1：建立 composable**

```typescript
// src/composables/usePlatforms.ts
import { ref, watch, onMounted } from 'vue'
import type { Platform } from '@/types/platform'

export function usePlatforms() {
    const platforms = ref<Platform[]>([])
    const loading = ref(false)
    const selectedAggregatorId = ref('agg-001')
    const period = ref<'week' | 'month'>('month')

    const fetchPlatforms = async () => {
        loading.value = true
        try {
            const params = new URLSearchParams({
                aggregatorId: selectedAggregatorId.value,
                period: period.value,
            })
            const res = await fetch(`/api/platforms?${params}`)
            if (!res.ok) return
            const json = await res.json() as { data: Platform[] }
            platforms.value = json.data
        } finally {
            loading.value = false
        }
    }

    watch([selectedAggregatorId, period], () => fetchPlatforms())
    onMounted(fetchPlatforms)

    return {
        platforms,
        loading,
        selectedAggregatorId,
        period,
        fetchPlatforms,
    }
}
```

- [ ] **Step 2：執行 build 確認**

```bash
npm run build 2>&1 | tail -5
```

預期：`✓ built in` 結尾

- [ ] **Step 3：Commit**

```bash
git add src/composables/usePlatforms.ts
git commit -m "feat(platform): add usePlatforms composable"
```

---

## Task 4：usePlatformDetail Composable

**Files:**
- Create: `src/composables/usePlatformDetail.ts`

- [ ] **Step 1：建立 composable**

```typescript
// src/composables/usePlatformDetail.ts
import { ref, watch, onMounted } from 'vue'
import type { Platform, PlatformStats, TrendPoint, PlatformPlayer } from '@/types/platform'

export function usePlatformDetail(platformId: string) {
    const platform = ref<Platform | null>(null)
    const stats = ref<PlatformStats | null>(null)
    const trendData = ref<TrendPoint[]>([])
    const players = ref<PlatformPlayer[]>([])
    const total = ref(0)

    const period = ref<'week' | 'month'>('month')
    const search = ref('')
    const page = ref(1)

    const loadingPlatform = ref(false)
    const loadingStats = ref(false)
    const loadingTrend = ref(false)
    const loadingPlayers = ref(false)

    const fetchPlatform = async () => {
        loadingPlatform.value = true
        try {
            const res = await fetch(`/api/platforms/${platformId}`)
            if (!res.ok) return
            platform.value = await res.json() as Platform
        } finally {
            loadingPlatform.value = false
        }
    }

    const fetchStats = async () => {
        loadingStats.value = true
        try {
            const res = await fetch(`/api/platforms/${platformId}/stats?period=${period.value}`)
            if (!res.ok) return
            stats.value = await res.json() as PlatformStats
        } finally {
            loadingStats.value = false
        }
    }

    const fetchTrend = async () => {
        loadingTrend.value = true
        try {
            const res = await fetch(`/api/platforms/${platformId}/trend?period=${period.value}`)
            if (!res.ok) return
            trendData.value = await res.json() as TrendPoint[]
        } finally {
            loadingTrend.value = false
        }
    }

    const fetchPlayers = async () => {
        loadingPlayers.value = true
        try {
            const params = new URLSearchParams({
                period: period.value,
                page: String(page.value),
                limit: '20',
            })
            if (search.value) params.set('search', search.value)
            const res = await fetch(`/api/platforms/${platformId}/players?${params}`)
            if (!res.ok) return
            const json = await res.json() as { items: PlatformPlayer[]; total: number }
            players.value = json.items
            total.value = json.total
        } finally {
            loadingPlayers.value = false
        }
    }

    // period 變更：重置頁碼，重新拉取全部數據
    watch(period, () => {
        page.value = 1
        fetchStats()
        fetchTrend()
        fetchPlayers()
    })

    // 搜尋或換頁：只重取玩家列表
    watch([search, page], () => fetchPlayers())

    onMounted(() => {
        fetchPlatform()
        fetchStats()
        fetchTrend()
        fetchPlayers()
    })

    return {
        platform, stats, trendData, players, total,
        period, search, page,
        loadingPlatform, loadingStats, loadingTrend, loadingPlayers,
    }
}
```

- [ ] **Step 2：執行 build 確認**

```bash
npm run build 2>&1 | tail -5
```

預期：`✓ built in` 結尾

- [ ] **Step 3：Commit**

```bash
git add src/composables/usePlatformDetail.ts
git commit -m "feat(platform): add usePlatformDetail composable"
```

---

## Task 5：PlatformCard 元件

**Files:**
- Create: `src/views/Platforms/components/PlatformCard.vue`

- [ ] **Step 1：建立目錄與元件**

```bash
mkdir -p /Users/cooperfu/Desktop/Game_Development_Background/src/views/Platforms/components
```

```vue
<!-- src/views/Platforms/components/PlatformCard.vue -->
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { NCard, NTag, NIcon } from 'naive-ui'
import { ChevronRightOutlined } from '@vicons/material'
import type { Platform } from '@/types/platform'

const props = defineProps<{ platform: Platform }>()
const router = useRouter()

const goto = () => router.push(`/platforms/${props.platform.id}`)

const fmt = (n: number) =>
    n >= 10000
        ? `$${(n / 1000).toFixed(1)}K`
        : `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`

const fmtCount = (n: number) => n.toLocaleString('en-US')
</script>

<template>
    <n-card
        class="cursor-pointer hover:border-blue-500 transition-colors"
        @click="goto"
    >
        <div class="flex items-center justify-between gap-4">
            <!-- 左側：平台名稱 + Tags -->
            <div class="flex flex-col gap-2 min-w-[160px]">
                <span class="text-base font-bold">{{ platform.name }}</span>
                <div class="flex items-center gap-2 flex-wrap">
                    <n-tag
                        :type="platform.status === 'active' ? 'success' : 'default'"
                        size="small"
                        round
                    >
                        {{ platform.status === 'active' ? '● 對接中' : '● 未對接' }}
                    </n-tag>
                    <n-tag
                        :type="platform.hasAgentSystem ? 'info' : 'default'"
                        size="small"
                    >
                        {{ platform.hasAgentSystem ? '有代理系統' : '無代理系統' }}
                    </n-tag>
                </div>
            </div>

            <!-- 中間：6 個數字 -->
            <div class="flex-1 grid grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-2">
                <div class="flex flex-col">
                    <span class="text-xs text-gray-500">玩家總數</span>
                    <span class="text-sm font-semibold">{{ fmtCount(platform.playerCount) }}</span>
                </div>
                <div class="flex flex-col">
                    <span class="text-xs text-gray-500">活躍玩家</span>
                    <span class="text-sm font-semibold">{{ fmtCount(platform.activePlayers) }}</span>
                </div>
                <div class="flex flex-col">
                    <span class="text-xs text-gray-500">流水</span>
                    <span class="text-sm font-semibold">{{ fmt(platform.turnover) }}</span>
                </div>
                <div class="flex flex-col">
                    <span class="text-xs text-gray-500">GGR</span>
                    <span class="text-sm font-semibold text-green-400">{{ fmt(platform.ggr) }}</span>
                </div>
                <div class="flex flex-col">
                    <span class="text-xs text-gray-500">JP 次數</span>
                    <span class="text-sm font-semibold">{{ platform.jpCount }} 次</span>
                </div>
                <div class="flex flex-col">
                    <span class="text-xs text-gray-500">JP 總金額</span>
                    <span class="text-sm font-semibold text-yellow-400">{{ fmt(platform.jpTotal) }}</span>
                </div>
            </div>

            <!-- 右箭頭 -->
            <n-icon size="20" class="text-gray-400 flex-shrink-0">
                <ChevronRightOutlined />
            </n-icon>
        </div>
    </n-card>
</template>
```

- [ ] **Step 2：執行 build 確認**

```bash
npm run build 2>&1 | tail -5
```

預期：`✓ built in` 結尾

- [ ] **Step 3：Commit**

```bash
git add src/views/Platforms/components/PlatformCard.vue
git commit -m "feat(platform): add PlatformCard component"
```

---

## Task 6：平台列表頁（Index.vue）

**Files:**
- Create: `src/views/Platforms/Index.vue`

- [ ] **Step 1：建立列表頁**

```vue
<!-- src/views/Platforms/Index.vue -->
<script setup lang="ts">
import { NIcon, NSelect, NSkeleton, NCard } from 'naive-ui'
import { GroupsOutlined } from '@vicons/material'
import { usePlatforms } from '@/composables/usePlatforms'
import PlatformCard from './components/PlatformCard.vue'

const { platforms, loading, selectedAggregatorId, period } = usePlatforms()

const aggregatorOptions = [
    { label: '自家聚合商', value: 'agg-001' },
    { label: '測試環境',   value: 'agg-002' },
]

const periodOptions = [
    { label: '本週', value: 'week' },
    { label: '本月', value: 'month' },
]
</script>

<template>
    <div class="flex flex-col gap-6">
        <!-- Header -->
        <div class="flex items-center justify-between flex-wrap gap-3">
            <div class="flex items-center gap-2">
                <n-icon size="24"><GroupsOutlined /></n-icon>
                <h1 class="text-2xl font-bold">平台分析</h1>
            </div>
            <div class="flex items-center gap-3">
                <n-select
                    v-model:value="selectedAggregatorId"
                    :options="aggregatorOptions"
                    class="w-44"
                />
                <div class="flex rounded overflow-hidden border border-gray-600">
                    <button
                        v-for="opt in periodOptions"
                        :key="opt.value"
                        class="px-3 py-1 text-sm transition-colors"
                        :class="period === opt.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-transparent text-gray-400 hover:text-white'"
                        @click="period = opt.value as 'week' | 'month'"
                    >
                        {{ opt.label }}
                    </button>
                </div>
            </div>
        </div>

        <!-- 平台卡片列表 -->
        <div v-if="loading" class="flex flex-col gap-4">
            <n-card v-for="i in 3" :key="i" class="h-[96px]">
                <n-skeleton text :repeat="2" />
            </n-card>
        </div>

        <div v-else class="flex flex-col gap-4">
            <PlatformCard
                v-for="p in platforms"
                :key="p.id"
                :platform="p"
            />
            <div v-if="platforms.length === 0" class="text-center py-12 text-gray-400">
                此聚合商目前沒有對接平台
            </div>
        </div>
    </div>
</template>
```

- [ ] **Step 2：執行 build 確認**

```bash
npm run build 2>&1 | tail -5
```

預期：`✓ built in` 結尾

- [ ] **Step 3：Commit**

```bash
git add src/views/Platforms/Index.vue
git commit -m "feat(platform): add platform list page"
```

---

## Task 7：PlatformStatCards 元件

**Files:**
- Create: `src/views/Platforms/components/PlatformStatCards.vue`

- [ ] **Step 1：建立元件**

```vue
<!-- src/views/Platforms/components/PlatformStatCards.vue -->
<script setup lang="ts">
import { NCard, NStatistic, NSkeleton } from 'naive-ui'
import type { PlatformStats } from '@/types/platform'

defineProps<{
    stats: PlatformStats | null
    loading: boolean
}>()

const fmtMoney = (n: number) =>
    `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
</script>

<template>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- 第一列 -->
        <n-card class="h-[100px]">
            <n-skeleton v-if="loading" text :width="80" />
            <n-statistic v-else label="玩家總數" :value="stats?.playerCount ?? 0" />
        </n-card>
        <n-card class="h-[100px]">
            <n-skeleton v-if="loading" text :width="80" />
            <n-statistic v-else label="活躍玩家" :value="stats?.activePlayers ?? 0" />
        </n-card>
        <n-card class="h-[100px]">
            <n-skeleton v-if="loading" text :width="80" />
            <n-statistic
                v-else
                label="流水"
                :value="fmtMoney(stats?.turnover ?? 0)"
            />
        </n-card>
        <n-card class="h-[100px]">
            <n-skeleton v-if="loading" text :width="80" />
            <n-statistic
                v-else
                label="GGR"
                :value="fmtMoney(stats?.ggr ?? 0)"
            />
        </n-card>

        <!-- 第二列 -->
        <n-card class="h-[100px]">
            <n-skeleton v-if="loading" text :width="80" />
            <n-statistic
                v-else
                label="JP 次數"
                :value="stats?.jpCount ?? 0"
                suffix="次"
            />
        </n-card>
        <n-card class="h-[100px]">
            <n-skeleton v-if="loading" text :width="80" />
            <n-statistic
                v-else
                label="JP 總金額"
                :value="fmtMoney(stats?.jpTotal ?? 0)"
            />
        </n-card>
        <n-card class="h-[100px]">
            <n-skeleton v-if="loading" text :width="80" />
            <n-statistic
                v-else
                label="平均每玩家流水"
                :value="fmtMoney(stats?.avgTurnoverPerPlayer ?? 0)"
            />
        </n-card>
        <n-card class="h-[100px]">
            <n-skeleton v-if="loading" text :width="80" />
            <n-statistic
                v-else
                label="最大單筆 JP"
                :value="fmtMoney(stats?.maxJpAmount ?? 0)"
            />
        </n-card>
    </div>
</template>
```

- [ ] **Step 2：執行 build 確認**

```bash
npm run build 2>&1 | tail -5
```

預期：`✓ built in` 結尾

- [ ] **Step 3：Commit**

```bash
git add src/views/Platforms/components/PlatformStatCards.vue
git commit -m "feat(platform): add PlatformStatCards component (8 stat cards)"
```

---

## Task 8：PlatformTrendChart 元件

**Files:**
- Create: `src/views/Platforms/components/PlatformTrendChart.vue`

- [ ] **Step 1：建立元件**

```vue
<!-- src/views/Platforms/components/PlatformTrendChart.vue -->
<script setup lang="ts">
import { shallowRef, watch } from 'vue'
import { NCard, NSkeleton } from 'naive-ui'
import VChart from 'vue-echarts'
import type { EChartsOption } from 'echarts'
import type { TrendPoint } from '@/types/platform'

const props = defineProps<{
    data: TrendPoint[]
    loading: boolean
}>()

const chartOption = shallowRef({} as EChartsOption)

watch(
    () => props.data,
    (data) => {
        if (!data.length) return
        chartOption.value = {
            tooltip: { trigger: 'axis' },
            legend: { data: ['流水', 'GGR'], top: 8 },
            grid: { left: 70, right: 20, top: 40, bottom: 30 },
            xAxis: {
                type: 'category',
                data: data.map(d => d.date),
                axisLabel: { color: '#9ca3af', fontSize: 11 },
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    color: '#9ca3af',
                    fontSize: 11,
                    formatter: (v: number) =>
                        v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v}`,
                },
            },
            series: [
                {
                    name: '流水',
                    type: 'line',
                    data: data.map(d => d.turnover),
                    smooth: true,
                    itemStyle: { color: '#3b82f6' },
                    areaStyle: { color: 'rgba(59,130,246,0.1)' },
                },
                {
                    name: 'GGR',
                    type: 'line',
                    data: data.map(d => d.ggr),
                    smooth: true,
                    itemStyle: { color: '#22c55e' },
                    areaStyle: { color: 'rgba(34,197,94,0.1)' },
                },
            ],
        }
    },
    { immediate: true }
)
</script>

<template>
    <n-card title="流水趨勢" class="h-[360px]">
        <div class="h-[280px]">
            <n-skeleton v-if="loading" class="h-full" />
            <v-chart
                v-else
                :option="chartOption"
                autoresize
                class="h-full w-full"
            />
        </div>
    </n-card>
</template>
```

- [ ] **Step 2：執行 build 確認**

```bash
npm run build 2>&1 | tail -5
```

預期：`✓ built in` 結尾

- [ ] **Step 3：Commit**

```bash
git add src/views/Platforms/components/PlatformTrendChart.vue
git commit -m "feat(platform): add PlatformTrendChart component (dual-line ECharts)"
```

---

## Task 9：PlatformPlayerTable 元件

**Files:**
- Create: `src/views/Platforms/components/PlatformPlayerTable.vue`

- [ ] **Step 1：建立元件**

```vue
<!-- src/views/Platforms/components/PlatformPlayerTable.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { NDataTable, NInput, NPagination } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import type { PlatformPlayer } from '@/types/platform'

const props = defineProps<{
    players: PlatformPlayer[]
    total: number
    loading: boolean
    hasAgentSystem: boolean
    search: string
    page: number
}>()

const emit = defineEmits<{
    (e: 'update:search', v: string): void
    (e: 'update:page', v: number): void
}>()

const fmtMoney = (n: number) =>
    `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('zh-TW')

const columns = computed<DataTableColumns<PlatformPlayer>>(() => {
    const base: DataTableColumns<PlatformPlayer> = [
        {
            title: '玩家 ID',
            key: 'playerId',
            render: (row) => row.playerId,
        },
        {
            title: '累計流水',
            key: 'totalTurnover',
            render: (row) => fmtMoney(row.totalTurnover),
            sorter: (a, b) => a.totalTurnover - b.totalTurnover,
        },
        {
            title: '本期流水',
            key: 'periodTurnover',
            render: (row) => fmtMoney(row.periodTurnover),
            sorter: (a, b) => a.periodTurnover - b.periodTurnover,
        },
        {
            title: '最後活躍',
            key: 'lastActiveAt',
            render: (row) => fmtDate(row.lastActiveAt),
        },
    ]

    if (props.hasAgentSystem) {
        base.splice(1, 0, {
            title: 'AgentID',
            key: 'agentId',
            render: (row) => row.agentId ?? '—',
        })
    }

    return base
})
</script>

<template>
    <div class="flex flex-col gap-4">
        <div class="flex justify-between items-center">
            <span class="text-sm text-gray-400">共 {{ total }} 位玩家</span>
            <n-input
                :value="search"
                placeholder="搜尋玩家 ID..."
                clearable
                class="w-56"
                @update:value="emit('update:search', $event)"
            />
        </div>

        <n-data-table
            :columns="columns"
            :data="players"
            :loading="loading"
            :pagination="false"
            :row-key="(r: PlatformPlayer) => r.playerId"
            size="small"
        />

        <div class="flex justify-end">
            <n-pagination
                :page="page"
                :page-count="Math.ceil(total / 20)"
                @update:page="emit('update:page', $event)"
            />
        </div>
    </div>
</template>
```

- [ ] **Step 2：執行 build 確認**

```bash
npm run build 2>&1 | tail -5
```

預期：`✓ built in` 結尾

- [ ] **Step 3：Commit**

```bash
git add src/views/Platforms/components/PlatformPlayerTable.vue
git commit -m "feat(platform): add PlatformPlayerTable with conditional AgentID column"
```

---

## Task 10：平台詳細頁（Detail.vue）

**Files:**
- Create: `src/views/Platforms/Detail.vue`

- [ ] **Step 1：建立詳細頁**

```vue
<!-- src/views/Platforms/Detail.vue -->
<script setup lang="ts">
import { NIcon, NTag, NCard, NBreadcrumb, NBreadcrumbItem } from 'naive-ui'
import { GroupsOutlined } from '@vicons/material'
import { useRoute, useRouter } from 'vue-router'
import { usePlatformDetail } from '@/composables/usePlatformDetail'
import PlatformStatCards from './components/PlatformStatCards.vue'
import PlatformTrendChart from './components/PlatformTrendChart.vue'
import PlatformPlayerTable from './components/PlatformPlayerTable.vue'

const route = useRoute()
const router = useRouter()
const platformId = route.params.id as string

const {
    platform, stats, trendData, players, total,
    period, search, page,
    loadingStats, loadingTrend, loadingPlayers,
} = usePlatformDetail(platformId)

const periodOptions = [
    { label: '本週', value: 'week' },
    { label: '本月', value: 'month' },
]
</script>

<template>
    <div class="flex flex-col gap-6">
        <!-- Breadcrumb -->
        <n-breadcrumb>
            <n-breadcrumb-item @click="router.push('/platforms')" style="cursor:pointer">
                平台分析
            </n-breadcrumb-item>
            <n-breadcrumb-item>{{ platform?.name ?? platformId }}</n-breadcrumb-item>
        </n-breadcrumb>

        <!-- Header -->
        <div class="flex items-center justify-between flex-wrap gap-3">
            <div class="flex items-center gap-3">
                <n-icon size="24"><GroupsOutlined /></n-icon>
                <h1 class="text-2xl font-bold">{{ platform?.name ?? '平台詳情' }}</h1>
                <n-tag
                    v-if="platform"
                    :type="platform.status === 'active' ? 'success' : 'default'"
                    size="small"
                    round
                >
                    {{ platform.status === 'active' ? '● 對接中' : '● 未對接' }}
                </n-tag>
                <n-tag
                    v-if="platform"
                    :type="platform.hasAgentSystem ? 'info' : 'default'"
                    size="small"
                >
                    {{ platform.hasAgentSystem ? '有代理系統' : '無代理系統' }}
                </n-tag>
            </div>

            <!-- 週 / 月 Toggle -->
            <div class="flex rounded overflow-hidden border border-gray-600">
                <button
                    v-for="opt in periodOptions"
                    :key="opt.value"
                    class="px-3 py-1 text-sm transition-colors"
                    :class="period === opt.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-transparent text-gray-400 hover:text-white'"
                    @click="period = opt.value as 'week' | 'month'"
                >
                    {{ opt.label }}
                </button>
            </div>
        </div>

        <!-- 8 個數字卡 -->
        <PlatformStatCards :stats="stats" :loading="loadingStats" />

        <!-- 趨勢圖 -->
        <PlatformTrendChart :data="trendData" :loading="loadingTrend" />

        <!-- 玩家列表 -->
        <n-card title="玩家列表">
            <PlatformPlayerTable
                :players="players"
                :total="total"
                :loading="loadingPlayers"
                :has-agent-system="platform?.hasAgentSystem ?? false"
                :search="search"
                :page="page"
                @update:search="search = $event; page = 1"
                @update:page="page = $event"
            />
        </n-card>
    </div>
</template>
```

- [ ] **Step 2：執行 build 確認**

```bash
npm run build 2>&1 | tail -5
```

預期：`✓ built in` 結尾

- [ ] **Step 3：Commit**

```bash
git add src/views/Platforms/Detail.vue
git commit -m "feat(platform): add platform detail page"
```

---

## Task 11：路由 + 選單 + i18n 串接

**Files:**
- Modify: `src/router/index.ts`
- Modify: `src/config/menu.ts`
- Modify: `src/locales/zh-TW.json`
- Modify: `src/locales/en.json`

- [ ] **Step 1：更新 router**

在 `src/router/index.ts` 的 `children` 陣列中，找到 agents 路由區塊：

```typescript
// ── 玩家 & 代理 ─────────────────────────────
{
    path: 'agents',
    name: 'Agents',
    component: () => import('../views/Agents/Index.vue'),
    meta: { title: 'menu.agents' }
},
```

替換為：

```typescript
// ── 平台分析 ──────────────────────────────────
{
    path: 'platforms',
    name: 'Platforms',
    component: () => import('../views/Platforms/Index.vue'),
    meta: { title: 'menu.platforms' }
},
{
    path: 'platforms/:id',
    name: 'PlatformDetail',
    component: () => import('../views/Platforms/Detail.vue'),
    meta: { title: 'menu.platformDetail' }
},
{
    path: 'agents',
    redirect: '/platforms'
},
```

- [ ] **Step 2：更新 menu.ts**

在 `src/config/menu.ts` 找到 `playerAndAgent` group 底下的 Agents 項目：

```typescript
{
    label: () => h(RouterLink, { to: '/agents' }, { default: () => t('menu.agents') }),
    key: 'Agents',
    icon: renderIcon(GroupsOutlined)
},
```

替換為：

```typescript
{
    label: () => h(RouterLink, { to: '/platforms' }, { default: () => t('menu.platforms') }),
    key: 'Platforms',
    icon: renderIcon(GroupsOutlined)
},
```

- [ ] **Step 3：更新 zh-TW.json**

在 `src/locales/zh-TW.json` 的 `"menu"` 物件中，找到 `"agents": "代理分析"` 這行，在它後面新增兩個 key（保留 `agents` 作為相容）：

```json
"agents": "代理分析",
"platforms": "平台分析",
"platformDetail": "平台詳情",
```

- [ ] **Step 4：更新 en.json**

在 `src/locales/en.json` 的 `"menu"` 物件中，找到 `"agents": "Agent Analytics"` 後面新增：

```json
"agents": "Agent Analytics",
"platforms": "Platform Analytics",
"platformDetail": "Platform Detail",
```

- [ ] **Step 5：執行 build 確認整體無誤**

```bash
npm run build 2>&1 | tail -8
```

預期：`✓ built in` 結尾，無 TS error

- [ ] **Step 6：Commit**

```bash
git add src/router/index.ts src/config/menu.ts src/locales/zh-TW.json src/locales/en.json
git commit -m "feat(platform): wire up routes, menu, and i18n for platform analytics"
```

- [ ] **Step 7：Push 到遠端**

```bash
git push origin main
```

---

## 完成後驗證清單

部署後在瀏覽器執行以下操作確認功能正確：

- [ ] 選單顯示「平台分析」，點擊導向 `/platforms`
- [ ] 列表頁顯示 3 個平台卡片（自家平台 / 老子有錢 / 星城 ONLINE）
- [ ] 切換本週 / 本月，卡片數字更新
- [ ] 切換聚合商 Selector 至「測試環境」，列表變空（agg-002 無對應平台）
- [ ] 點擊「自家平台」卡片，進入詳細頁
- [ ] 詳細頁顯示 8 個數字卡、趨勢圖、玩家列表
- [ ] 玩家列表有 AgentID 欄位（自家平台有代理系統）
- [ ] 返回，點擊「老子有錢」，詳細頁玩家列表**沒有** AgentID 欄位
- [ ] 詳細頁切換週 / 月，數字卡與趨勢圖同步更新
- [ ] 玩家列表搜尋框可過濾 playerId
- [ ] 分頁正常（每頁 20 筆）
- [ ] `/agents` 網址自動跳轉至 `/platforms`
