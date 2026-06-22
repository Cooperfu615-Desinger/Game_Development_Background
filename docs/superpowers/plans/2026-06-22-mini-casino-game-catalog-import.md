# Mini Casino 遊戲目錄導入後台原型 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 以 Mini Casino 真實 28 款遊戲取代後台原型的假資料，讓遊戲管理模組 UI 反映真實遊戲目錄。

**Architecture:** 共修改 4 個檔案。`src/types/game.ts` 更新 category union 並新增 optional 遊戲數學參數欄位；`src/mocks/handlers/games.ts` 替換靜態 mockGames 陣列；`src/mocks/handlers/gameAdmin.ts` 替換 SEED_GAMES（這才是 UI 實際呼叫的遊戲列表）並更新 BASE_SETTINGS；`src/views/Games/Index.vue` 更新篩選器選項。

**Tech Stack:** Vue 3, TypeScript, MSW (Mock Service Worker), PrimeVue 4

---

## 背景說明（重要）

本 repo 有兩套遊戲 mock：

| 檔案 | 端點 | 呼叫方 |
|---|---|---|
| `src/mocks/handlers/games.ts` | `/api/games` | **目前無任何 view 呼叫** |
| `src/mocks/handlers/gameAdmin.ts` | `/api/games/v2/list` | `Games/Index.vue`（遊戲管理主頁） |

兩個都要更新，確保一致。`gameAdmin.ts` 才是使用者看到的 UI。

---

## 完整遊戲對照表（執行參考）

| # | gameId | displayName | category | type（中文） | rtp | chips | minBet | maxBetRatio | betZoneCount | singleBetOnly | payoutModel | volatility |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | baccarat | 百家樂 | table | 桌遊 | 98.9 | [10,50,100,500] | 10 | 0.30 | 5 | — | — | 低 |
| 2 | baccarat_p2p | 百家樂 P2P | table | 桌遊 | 99.0 | [10,50,100,500] | 10 | 0.50 | 1 | — | — | 低 |
| 3 | dragon_tiger | 龍虎 | table | 桌遊 | 96.6 | [10,50,100,500] | 10 | 0.30 | 12 | — | — | 中低 |
| 4 | niuniu | 牛牛 | table | 桌遊 | 97.0 | [10,50,100,500] | 10 | 0.30 | 4 | — | — | 中低 |
| 5 | caribbean_poker | 加勒比海撲克 | table | 桌遊 | 94.8 | [100,500,1000,5000] | 100 | 0.25 | 2 | — | — | 中低 |
| 6 | tuitongzi | 推筒子 | table | 桌遊 | 97.0 | [10,50,100,500] | 10 | 0.30 | 3 | — | — | 低 |
| 7 | pai_gow | 牌九 | table | 桌遊 | 97.3 | [100,500,1000,5000] | 100 | 0.50 | 1 | — | — | 中低 |
| 8 | mini_bj | 迷你21點 | table | 桌遊 | 99.0 | [10,50,100,500] | 10 | 0.50 | 1 | — | — | 低 |
| 9 | video_poker | 視訊撲克 | table | 桌遊 | 99.5 | [10,50,100,500] | 10 | 0.50 | 1 | — | — | 低 |
| 10 | crash | Crash | instant | 即時遊戲 | 99.0 | [100,500,1000,5000] | 100 | 0.50 | 1 | — | — | 中 |
| 11 | plinko | Plinko | instant | 即時遊戲 | 97.0 | [100,500,1000,5000] | 100 | 0.50 | 1 | — | — | 中 |
| 12 | tower | Tower | instant | 即時遊戲 | 99.0 | [100,500,1000,5000] | 100 | 0.50 | 1 | — | — | 中 |
| 13 | mines | Mines | instant | 即時遊戲 | 99.0 | [100,500,1000,5000] | 100 | 0.50 | 1 | — | — | 中 |
| 14 | hilo | HiLo | instant | 即時遊戲 | 97.0 | [10,50,100,500] | 10 | 0.50 | 1 | — | — | 中 |
| 15 | limbo | Limbo | instant | 即時遊戲 | 97.0 | [100,500,1000,5000] | 100 | 0.50 | 1 | — | — | 中 |
| 16 | flip | Flip | instant | 即時遊戲 | 99.0 | [100,500,1000,5000] | 100 | 0.50 | 2 | — | — | 低 |
| 17 | wheel | Wheel | instant | 即時遊戲 | 97.0 | [100,500,1000,5000] | 100 | 0.50 | 1 | — | — | 中 |
| 18 | pump | Pump | instant | 即時遊戲 | 98.0 | [100,500,1000,5000] | 100 | 0.50 | 1 | — | — | 中 |
| 19 | keno | Keno | instant | 即時遊戲 | 97.0 | [100,500,1000,5000] | 100 | 0.50 | 1 | — | — | 中 |
| 20 | dice | Dice | instant | 即時遊戲 | 98.0 | [100,500,1000,5000] | 100 | 0.50 | 4 | — | — | 中 |
| 21 | dice_size | 大小 | instant | 即時遊戲 | 97.2 | [100,500,1000,5000] | 100 | 0.50 | 3 | — | — | 低 |
| 22 | color_guess | 猜顏色 | instant | 即時遊戲 | 97.0 | [100,500,1000,5000] | 100 | 0.50 | 4 | — | — | 低 |
| 23 | zoo | Zoo | instant | 即時遊戲 | 98.0 | [100,500,1000,5000] | 100 | 0.50 | 6 | — | — | 中 |
| 24 | chicken | Chicken Road | instant | 即時遊戲 | 99.0 | [100,500,1000,5000] | 100 | 0.50 | 1 | — | — | 中 |
| 25 | packs | Packs | instant | 即時遊戲 | 97.0 | [10,50,100,500] | 10 | 0.30 | 1 | — | — | 中 |
| 26 | three_pick | Three Pick | instant | 即時遊戲 | 97.0 | [100,500,1000,5000] | 100 | 0.50 | 1 | true | total_multiplier | 中 |
| 27 | shoot_dragon_gate | 射龍門 | instant | 即時遊戲 | 97.0 | [10,50,100,500] | 20 | 0.50 | 2 | — | — | 中 |
| 28 | basketball | 籃球投籃機 | sport | 運動 | 96.0 | [10,50,100,500] | 10 | 0.50 | 1 | — | — | 高 |

---

## Task 1：更新 `src/types/game.ts`

**Files:**
- Modify: `src/types/game.ts`

- [ ] **Step 1：全量替換 `src/types/game.ts`**

```ts
export interface Game {
    id: string
    name: string
    status: 'active' | 'inactive'
    version: string
    rtp: number
    activeUsers: number
    publishedAt: string
    category: 'table' | 'instant' | 'sport'
    description?: string
    chipDenominations?: number[]
    minBet?: number
    maxBetRatio?: number
    betZoneCount?: number
    singleBetOnly?: boolean
    payoutModel?: string
}

export interface GameFilter {
    status: 'active' | 'inactive' | undefined
    search: string
    category: Game['category'] | undefined
    page: number
    pageSize: number
}

export interface GameListResponse {
    items: Game[]
    total: number
    page: number
    limit: number
}
```

- [ ] **Step 2：執行 type-check，確認無新增錯誤**

```bash
cd /Users/cooperfu/Desktop/Game_Development_Background && npm run type-check 2>&1 | tail -20
```

預期：無新增錯誤（原本若有既有錯誤可忽略，確認數量不增加即可）

- [ ] **Step 3：Commit**

```bash
git add src/types/game.ts
git commit -m "feat(types): Game category 改為 table/instant/sport，新增遊戲數學參數欄位"
```

---

## Task 2：更新 `src/mocks/handlers/games.ts`

**Files:**
- Modify: `src/mocks/handlers/games.ts`

- [ ] **Step 1：全量替換 `src/mocks/handlers/games.ts`**

```ts
import { http, HttpResponse, delay } from 'msw'
import { faker } from '@faker-js/faker'
import type { Game } from '@/types/game'

const mockGames: Game[] = [
    {
        id: 'baccarat', name: '百家樂', category: 'table', status: 'active',
        version: '1.0.0', rtp: 98.9, activeUsers: faker.number.int({ min: 100, max: 5000 }),
        publishedAt: faker.date.past({ years: 2 }).toISOString(),
        chipDenominations: [10, 50, 100, 500], minBet: 10, maxBetRatio: 0.30, betZoneCount: 5,
    },
    {
        id: 'baccarat_p2p', name: '百家樂 P2P', category: 'table', status: 'active',
        version: '1.0.0', rtp: 99.0, activeUsers: faker.number.int({ min: 0, max: 3000 }),
        publishedAt: faker.date.past({ years: 2 }).toISOString(),
        chipDenominations: [10, 50, 100, 500], minBet: 10, maxBetRatio: 0.50, betZoneCount: 1,
    },
    {
        id: 'dragon_tiger', name: '龍虎', category: 'table', status: 'active',
        version: '1.0.0', rtp: 96.6, activeUsers: faker.number.int({ min: 50, max: 4000 }),
        publishedAt: faker.date.past({ years: 2 }).toISOString(),
        chipDenominations: [10, 50, 100, 500], minBet: 10, maxBetRatio: 0.30, betZoneCount: 12,
    },
    {
        id: 'niuniu', name: '牛牛', category: 'table', status: 'active',
        version: '1.0.0', rtp: 97.0, activeUsers: faker.number.int({ min: 50, max: 3000 }),
        publishedAt: faker.date.past({ years: 2 }).toISOString(),
        chipDenominations: [10, 50, 100, 500], minBet: 10, maxBetRatio: 0.30, betZoneCount: 4,
    },
    {
        id: 'caribbean_poker', name: '加勒比海撲克', category: 'table', status: 'active',
        version: '1.0.0', rtp: 94.8, activeUsers: faker.number.int({ min: 0, max: 2000 }),
        publishedAt: faker.date.past({ years: 2 }).toISOString(),
        chipDenominations: [100, 500, 1000, 5000], minBet: 100, maxBetRatio: 0.25, betZoneCount: 2,
    },
    {
        id: 'tuitongzi', name: '推筒子', category: 'table', status: 'active',
        version: '1.0.0', rtp: 97.0, activeUsers: faker.number.int({ min: 50, max: 3000 }),
        publishedAt: faker.date.past({ years: 2 }).toISOString(),
        chipDenominations: [10, 50, 100, 500], minBet: 10, maxBetRatio: 0.30, betZoneCount: 3,
    },
    {
        id: 'pai_gow', name: '牌九', category: 'table', status: 'inactive',
        version: '1.0.0', rtp: 97.3, activeUsers: faker.number.int({ min: 0, max: 1000 }),
        publishedAt: faker.date.past({ years: 2 }).toISOString(),
        chipDenominations: [100, 500, 1000, 5000], minBet: 100, maxBetRatio: 0.50, betZoneCount: 1,
    },
    {
        id: 'mini_bj', name: '迷你21點', category: 'table', status: 'active',
        version: '1.0.0', rtp: 99.0, activeUsers: faker.number.int({ min: 50, max: 4000 }),
        publishedAt: faker.date.past({ years: 2 }).toISOString(),
        chipDenominations: [10, 50, 100, 500], minBet: 10, maxBetRatio: 0.50, betZoneCount: 1,
    },
    {
        id: 'video_poker', name: '視訊撲克', category: 'table', status: 'active',
        version: '1.0.0', rtp: 99.5, activeUsers: faker.number.int({ min: 50, max: 3000 }),
        publishedAt: faker.date.past({ years: 2 }).toISOString(),
        chipDenominations: [10, 50, 100, 500], minBet: 10, maxBetRatio: 0.50, betZoneCount: 1,
    },
    {
        id: 'crash', name: 'Crash', category: 'instant', status: 'active',
        version: '1.0.0', rtp: 99.0, activeUsers: faker.number.int({ min: 200, max: 5000 }),
        publishedAt: faker.date.past({ years: 2 }).toISOString(),
        chipDenominations: [100, 500, 1000, 5000], minBet: 100, maxBetRatio: 0.50, betZoneCount: 1,
    },
    {
        id: 'plinko', name: 'Plinko', category: 'instant', status: 'active',
        version: '1.0.0', rtp: 97.0, activeUsers: faker.number.int({ min: 100, max: 4000 }),
        publishedAt: faker.date.past({ years: 2 }).toISOString(),
        chipDenominations: [100, 500, 1000, 5000], minBet: 100, maxBetRatio: 0.50, betZoneCount: 1,
    },
    {
        id: 'tower', name: 'Tower', category: 'instant', status: 'active',
        version: '1.0.0', rtp: 99.0, activeUsers: faker.number.int({ min: 100, max: 4000 }),
        publishedAt: faker.date.past({ years: 2 }).toISOString(),
        chipDenominations: [100, 500, 1000, 5000], minBet: 100, maxBetRatio: 0.50, betZoneCount: 1,
    },
    {
        id: 'mines', name: 'Mines', category: 'instant', status: 'active',
        version: '1.0.0', rtp: 99.0, activeUsers: faker.number.int({ min: 100, max: 4000 }),
        publishedAt: faker.date.past({ years: 2 }).toISOString(),
        chipDenominations: [100, 500, 1000, 5000], minBet: 100, maxBetRatio: 0.50, betZoneCount: 1,
    },
    {
        id: 'hilo', name: 'HiLo', category: 'instant', status: 'active',
        version: '1.0.0', rtp: 97.0, activeUsers: faker.number.int({ min: 50, max: 3000 }),
        publishedAt: faker.date.past({ years: 2 }).toISOString(),
        chipDenominations: [10, 50, 100, 500], minBet: 10, maxBetRatio: 0.50, betZoneCount: 1,
    },
    {
        id: 'limbo', name: 'Limbo', category: 'instant', status: 'active',
        version: '1.0.0', rtp: 97.0, activeUsers: faker.number.int({ min: 50, max: 3000 }),
        publishedAt: faker.date.past({ years: 2 }).toISOString(),
        chipDenominations: [100, 500, 1000, 5000], minBet: 100, maxBetRatio: 0.50, betZoneCount: 1,
    },
    {
        id: 'flip', name: 'Flip', category: 'instant', status: 'active',
        version: '1.0.0', rtp: 99.0, activeUsers: faker.number.int({ min: 50, max: 3000 }),
        publishedAt: faker.date.past({ years: 2 }).toISOString(),
        chipDenominations: [100, 500, 1000, 5000], minBet: 100, maxBetRatio: 0.50, betZoneCount: 2,
    },
    {
        id: 'wheel', name: 'Wheel', category: 'instant', status: 'active',
        version: '1.0.0', rtp: 97.0, activeUsers: faker.number.int({ min: 100, max: 4000 }),
        publishedAt: faker.date.past({ years: 2 }).toISOString(),
        chipDenominations: [100, 500, 1000, 5000], minBet: 100, maxBetRatio: 0.50, betZoneCount: 1,
    },
    {
        id: 'pump', name: 'Pump', category: 'instant', status: 'active',
        version: '1.0.0', rtp: 98.0, activeUsers: faker.number.int({ min: 50, max: 3000 }),
        publishedAt: faker.date.past({ years: 2 }).toISOString(),
        chipDenominations: [100, 500, 1000, 5000], minBet: 100, maxBetRatio: 0.50, betZoneCount: 1,
    },
    {
        id: 'keno', name: 'Keno', category: 'instant', status: 'active',
        version: '1.0.0', rtp: 97.0, activeUsers: faker.number.int({ min: 50, max: 3000 }),
        publishedAt: faker.date.past({ years: 2 }).toISOString(),
        chipDenominations: [100, 500, 1000, 5000], minBet: 100, maxBetRatio: 0.50, betZoneCount: 1,
    },
    {
        id: 'dice', name: 'Dice', category: 'instant', status: 'active',
        version: '1.0.0', rtp: 98.0, activeUsers: faker.number.int({ min: 100, max: 4000 }),
        publishedAt: faker.date.past({ years: 2 }).toISOString(),
        chipDenominations: [100, 500, 1000, 5000], minBet: 100, maxBetRatio: 0.50, betZoneCount: 4,
    },
    {
        id: 'dice_size', name: '大小', category: 'instant', status: 'active',
        version: '1.0.0', rtp: 97.2, activeUsers: faker.number.int({ min: 50, max: 3000 }),
        publishedAt: faker.date.past({ years: 2 }).toISOString(),
        chipDenominations: [100, 500, 1000, 5000], minBet: 100, maxBetRatio: 0.50, betZoneCount: 3,
    },
    {
        id: 'color_guess', name: '猜顏色', category: 'instant', status: 'active',
        version: '1.0.0', rtp: 97.0, activeUsers: faker.number.int({ min: 50, max: 3000 }),
        publishedAt: faker.date.past({ years: 2 }).toISOString(),
        chipDenominations: [100, 500, 1000, 5000], minBet: 100, maxBetRatio: 0.50, betZoneCount: 4,
    },
    {
        id: 'zoo', name: 'Zoo', category: 'instant', status: 'active',
        version: '1.0.0', rtp: 98.0, activeUsers: faker.number.int({ min: 100, max: 4000 }),
        publishedAt: faker.date.past({ years: 2 }).toISOString(),
        chipDenominations: [100, 500, 1000, 5000], minBet: 100, maxBetRatio: 0.50, betZoneCount: 6,
    },
    {
        id: 'chicken', name: 'Chicken Road', category: 'instant', status: 'inactive',
        version: '1.0.0', rtp: 99.0, activeUsers: faker.number.int({ min: 0, max: 2000 }),
        publishedAt: faker.date.past({ years: 2 }).toISOString(),
        chipDenominations: [100, 500, 1000, 5000], minBet: 100, maxBetRatio: 0.50, betZoneCount: 1,
    },
    {
        id: 'packs', name: 'Packs', category: 'instant', status: 'active',
        version: '1.0.0', rtp: 97.0, activeUsers: faker.number.int({ min: 50, max: 3000 }),
        publishedAt: faker.date.past({ years: 2 }).toISOString(),
        chipDenominations: [10, 50, 100, 500], minBet: 10, maxBetRatio: 0.30, betZoneCount: 1,
    },
    {
        id: 'three_pick', name: 'Three Pick', category: 'instant', status: 'active',
        version: '1.0.0', rtp: 97.0, activeUsers: faker.number.int({ min: 50, max: 3000 }),
        publishedAt: faker.date.past({ years: 2 }).toISOString(),
        chipDenominations: [100, 500, 1000, 5000], minBet: 100, maxBetRatio: 0.50, betZoneCount: 1,
        singleBetOnly: true, payoutModel: 'total_multiplier',
    },
    {
        id: 'shoot_dragon_gate', name: '射龍門', category: 'instant', status: 'active',
        version: '1.0.0', rtp: 97.0, activeUsers: faker.number.int({ min: 50, max: 3000 }),
        publishedAt: faker.date.past({ years: 2 }).toISOString(),
        chipDenominations: [10, 50, 100, 500], minBet: 20, maxBetRatio: 0.50, betZoneCount: 2,
    },
    {
        id: 'basketball', name: '籃球投籃機', category: 'sport', status: 'active',
        version: '1.0.0', rtp: 96.0, activeUsers: faker.number.int({ min: 10, max: 1000 }),
        publishedAt: faker.date.past({ years: 1 }).toISOString(),
        chipDenominations: [10, 50, 100, 500], minBet: 10, maxBetRatio: 0.50, betZoneCount: 1,
    },
]

export const gameHandlers = [
    // GET /api/games — list with filter/pagination
    http.get('/api/games', async ({ request }) => {
        await delay(400)
        const url = new URL(request.url)
        const page = Number(url.searchParams.get('page') ?? 1)
        const limit = Number(url.searchParams.get('limit') ?? 20)
        const status = url.searchParams.get('status') ?? ''
        const search = url.searchParams.get('search') ?? ''
        const category = url.searchParams.get('category') ?? ''

        let filtered = [...mockGames]

        if (status) filtered = filtered.filter(g => g.status === status)
        if (category) filtered = filtered.filter(g => g.category === category)
        if (search) filtered = filtered.filter(g =>
            g.name.toLowerCase().includes(search.toLowerCase())
        )

        const total = filtered.length
        const items = filtered.slice((page - 1) * limit, page * limit)

        return HttpResponse.json({ code: 0, data: { items, total, page, limit } })
    }),

    // GET /api/games/:id — single game detail
    http.get('/api/games/:id', async ({ params }) => {
        await delay(300)
        const game = mockGames.find(g => g.id === params.id)
        if (!game) {
            return HttpResponse.json({ code: 404, message: 'Game not found' }, { status: 404 })
        }
        return HttpResponse.json({ code: 0, data: game })
    }),

    // PATCH /api/games/:id — update game
    http.patch('/api/games/:id', async ({ params, request }) => {
        await delay(500)
        const index = mockGames.findIndex(g => g.id === params.id)
        if (index === -1) {
            return HttpResponse.json({ code: 404, message: 'Game not found' }, { status: 404 })
        }
        const body = await request.json() as Partial<Game>
        mockGames[index] = { ...mockGames[index]!, ...body }
        return HttpResponse.json({ code: 0, data: mockGames[index] })
    })
]
```

- [ ] **Step 2：執行 type-check**

```bash
cd /Users/cooperfu/Desktop/Game_Development_Background && npm run type-check 2>&1 | tail -20
```

預期：無新增錯誤

- [ ] **Step 3：Commit**

```bash
git add src/mocks/handlers/games.ts
git commit -m "feat(mock): games.ts 替換為 Mini Casino 28 款真實遊戲"
```

---

## Task 3：更新 `src/mocks/handlers/gameAdmin.ts`

**Files:**
- Modify: `src/mocks/handlers/gameAdmin.ts`（只改 SEED_GAMES 陣列與 BASE_SETTINGS.gameTypes，其餘不動）

- [ ] **Step 1：找到並替換 `BASE_SETTINGS` 的 `gameTypes`**

找到檔案中這一行：
```ts
    gameTypes: ['老虎機', '桌遊', '小遊戲', '真人'],
```

改為：
```ts
    gameTypes: ['桌遊', '即時遊戲', '運動'],
```

- [ ] **Step 2：找到並替換 `SEED_GAMES` 陣列**

找到 `const SEED_GAMES: GameRow[] = [` 這一行直到對應的 `]`（結束 SEED_GAMES 宣告的那個），全量替換成以下內容：

```ts
const SEED_GAMES: GameRow[] = [
    {
        code: 'GAME-001', name: '百家樂', type: '桌遊',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 98.90%', rtp: '98.90%', volatility: '低',
        merchantCount: 20, visibleMerchants: ['MER-001 Golden Dragon', 'MER-002 LuckyPlay', 'MER-003 Nova Gaming'],
        limitTemplates: ['標準限額', 'VIP 限額'], defaultLimitTemplate: '標準限額',
        minBet: 10, maxBet: 10000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'baccarat-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-002', name: '百家樂 P2P', type: '桌遊',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 99.00%', rtp: '99.00%', volatility: '低',
        merchantCount: 15, visibleMerchants: ['MER-001 Golden Dragon', 'MER-002 LuckyPlay'],
        limitTemplates: ['標準限額'], defaultLimitTemplate: '標準限額',
        minBet: 10, maxBet: 10000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'baccarat-p2p-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-003', name: '龍虎', type: '桌遊',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 96.60%', rtp: '96.60%', volatility: '中低',
        merchantCount: 18, visibleMerchants: ['MER-001 Golden Dragon', 'MER-002 LuckyPlay', 'MER-004 Royal H5'],
        limitTemplates: ['標準限額', '高額限額'], defaultLimitTemplate: '標準限額',
        minBet: 10, maxBet: 10000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'dragon-tiger-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-004', name: '牛牛', type: '桌遊',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD', 'TWD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 97.00%', rtp: '97.00%', volatility: '中低',
        merchantCount: 14, visibleMerchants: ['MER-001 Golden Dragon', 'MER-003 Nova Gaming'],
        limitTemplates: ['標準限額'], defaultLimitTemplate: '標準限額',
        minBet: 10, maxBet: 10000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'niuniu-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-005', name: '加勒比海撲克', type: '桌遊',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 94.80%', rtp: '94.80%', volatility: '中低',
        merchantCount: 10, visibleMerchants: ['MER-001 Golden Dragon', 'MER-002 LuckyPlay'],
        limitTemplates: ['高額限額'], defaultLimitTemplate: '高額限額',
        minBet: 100, maxBet: 20000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'caribbean-poker-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-006', name: '推筒子', type: '桌遊',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'TWD'], languages: ['繁中'],
        version: 'v1.0.0', mathVersion: 'RTP 97.00%', rtp: '97.00%', volatility: '低',
        merchantCount: 12, visibleMerchants: ['MER-001 Golden Dragon', 'MER-004 Royal H5'],
        limitTemplates: ['標準限額', '低風險限額'], defaultLimitTemplate: '標準限額',
        minBet: 10, maxBet: 10000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'tuitongzi-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-007', name: '牌九', type: '桌遊',
        status: '測試中', environmentMode: '測試',
        platform: ['H5'], currencies: ['USDT'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 97.30%', rtp: '97.30%', volatility: '中低',
        merchantCount: 0, visibleMerchants: [],
        limitTemplates: ['高額限額'], defaultLimitTemplate: '高額限額',
        minBet: 100, maxBet: 20000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'paigow-h5', assetVersion: 'asset-2026.05', note: '上線審核中',
    },
    {
        code: 'GAME-008', name: '迷你21點', type: '桌遊',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 99.00%', rtp: '99.00%', volatility: '低',
        merchantCount: 16, visibleMerchants: ['MER-001 Golden Dragon', 'MER-002 LuckyPlay', 'MER-003 Nova Gaming'],
        limitTemplates: ['標準限額', 'VIP 限額'], defaultLimitTemplate: '標準限額',
        minBet: 10, maxBet: 10000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'mini-bj-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-009', name: '視訊撲克', type: '桌遊',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 99.50%', rtp: '99.50%', volatility: '低',
        merchantCount: 13, visibleMerchants: ['MER-001 Golden Dragon', 'MER-003 Nova Gaming'],
        limitTemplates: ['標準限額'], defaultLimitTemplate: '標準限額',
        minBet: 10, maxBet: 10000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'video-poker-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-010', name: 'Crash', type: '即時遊戲',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 99.00%', rtp: '99.00%', volatility: '中',
        merchantCount: 22, visibleMerchants: ['MER-001 Golden Dragon', 'MER-002 LuckyPlay', 'MER-003 Nova Gaming', 'MER-004 Royal H5'],
        limitTemplates: ['標準限額', '高額限額'], defaultLimitTemplate: '標準限額',
        minBet: 100, maxBet: 20000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'crash-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-011', name: 'Plinko', type: '即時遊戲',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 97.00%', rtp: '97.00%', volatility: '中',
        merchantCount: 17, visibleMerchants: ['MER-001 Golden Dragon', 'MER-002 LuckyPlay', 'MER-004 Royal H5'],
        limitTemplates: ['標準限額'], defaultLimitTemplate: '標準限額',
        minBet: 100, maxBet: 20000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'plinko-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-012', name: 'Tower', type: '即時遊戲',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 99.00%', rtp: '99.00%', volatility: '中',
        merchantCount: 15, visibleMerchants: ['MER-001 Golden Dragon', 'MER-002 LuckyPlay'],
        limitTemplates: ['標準限額'], defaultLimitTemplate: '標準限額',
        minBet: 100, maxBet: 20000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'tower-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-013', name: 'Mines', type: '即時遊戲',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 99.00%', rtp: '99.00%', volatility: '中',
        merchantCount: 19, visibleMerchants: ['MER-001 Golden Dragon', 'MER-002 LuckyPlay', 'MER-003 Nova Gaming'],
        limitTemplates: ['標準限額', '高額限額'], defaultLimitTemplate: '標準限額',
        minBet: 100, maxBet: 20000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'mines-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-014', name: 'HiLo', type: '即時遊戲',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 97.00%', rtp: '97.00%', volatility: '中',
        merchantCount: 11, visibleMerchants: ['MER-002 LuckyPlay', 'MER-004 Royal H5'],
        limitTemplates: ['標準限額', '低風險限額'], defaultLimitTemplate: '低風險限額',
        minBet: 10, maxBet: 10000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'hilo-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-015', name: 'Limbo', type: '即時遊戲',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 97.00%', rtp: '97.00%', volatility: '中',
        merchantCount: 10, visibleMerchants: ['MER-001 Golden Dragon', 'MER-003 Nova Gaming'],
        limitTemplates: ['標準限額'], defaultLimitTemplate: '標準限額',
        minBet: 100, maxBet: 20000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'limbo-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-016', name: 'Flip', type: '即時遊戲',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD', 'TWD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 99.00%', rtp: '99.00%', volatility: '低',
        merchantCount: 14, visibleMerchants: ['MER-001 Golden Dragon', 'MER-002 LuckyPlay'],
        limitTemplates: ['標準限額', '低風險限額'], defaultLimitTemplate: '低風險限額',
        minBet: 100, maxBet: 20000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'flip-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-017', name: 'Wheel', type: '即時遊戲',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 97.00%', rtp: '97.00%', volatility: '中',
        merchantCount: 16, visibleMerchants: ['MER-001 Golden Dragon', 'MER-003 Nova Gaming', 'MER-004 Royal H5'],
        limitTemplates: ['標準限額'], defaultLimitTemplate: '標準限額',
        minBet: 100, maxBet: 20000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'wheel-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-018', name: 'Pump', type: '即時遊戲',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 98.00%', rtp: '98.00%', volatility: '中',
        merchantCount: 9, visibleMerchants: ['MER-002 LuckyPlay', 'MER-003 Nova Gaming'],
        limitTemplates: ['標準限額'], defaultLimitTemplate: '標準限額',
        minBet: 100, maxBet: 20000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'pump-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-019', name: 'Keno', type: '即時遊戲',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 97.00%', rtp: '97.00%', volatility: '中',
        merchantCount: 12, visibleMerchants: ['MER-001 Golden Dragon', 'MER-004 Royal H5'],
        limitTemplates: ['標準限額'], defaultLimitTemplate: '標準限額',
        minBet: 100, maxBet: 20000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'keno-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-020', name: 'Dice', type: '即時遊戲',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 98.00%', rtp: '98.00%', volatility: '中',
        merchantCount: 18, visibleMerchants: ['MER-001 Golden Dragon', 'MER-002 LuckyPlay', 'MER-003 Nova Gaming'],
        limitTemplates: ['標準限額', '高額限額'], defaultLimitTemplate: '標準限額',
        minBet: 100, maxBet: 20000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'dice-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-021', name: '大小', type: '即時遊戲',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD', 'TWD'], languages: ['繁中'],
        version: 'v1.0.0', mathVersion: 'RTP 97.20%', rtp: '97.20%', volatility: '低',
        merchantCount: 13, visibleMerchants: ['MER-001 Golden Dragon', 'MER-004 Royal H5'],
        limitTemplates: ['標準限額', '低風險限額'], defaultLimitTemplate: '低風險限額',
        minBet: 100, maxBet: 20000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'dice-size-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-022', name: '猜顏色', type: '即時遊戲',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'TWD'], languages: ['繁中'],
        version: 'v1.0.0', mathVersion: 'RTP 97.00%', rtp: '97.00%', volatility: '低',
        merchantCount: 11, visibleMerchants: ['MER-003 Nova Gaming', 'MER-004 Royal H5'],
        limitTemplates: ['標準限額', '低風險限額'], defaultLimitTemplate: '低風險限額',
        minBet: 100, maxBet: 20000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'color-guess-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-023', name: 'Zoo', type: '即時遊戲',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 98.00%', rtp: '98.00%', volatility: '中',
        merchantCount: 14, visibleMerchants: ['MER-001 Golden Dragon', 'MER-002 LuckyPlay'],
        limitTemplates: ['標準限額'], defaultLimitTemplate: '標準限額',
        minBet: 100, maxBet: 20000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'zoo-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-024', name: 'Chicken Road', type: '即時遊戲',
        status: '維護中', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 99.00%', rtp: '99.00%', volatility: '中',
        merchantCount: 8, visibleMerchants: ['MER-002 LuckyPlay'],
        limitTemplates: ['標準限額'], defaultLimitTemplate: '標準限額',
        minBet: 100, maxBet: 20000, maintenance: true, maintenanceStart: timeAt(2), maintenanceEnd: timeAt(6),
        technicalOwner: 'Game Tech', packageId: 'chicken-h5', assetVersion: 'asset-2026.05', note: '熱更新中',
    },
    {
        code: 'GAME-025', name: 'Packs', type: '即時遊戲',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 97.00%', rtp: '97.00%', volatility: '中',
        merchantCount: 10, visibleMerchants: ['MER-001 Golden Dragon', 'MER-003 Nova Gaming'],
        limitTemplates: ['標準限額', '低風險限額'], defaultLimitTemplate: '低風險限額',
        minBet: 10, maxBet: 10000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'packs-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-026', name: 'Three Pick', type: '即時遊戲',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 97.00%', rtp: '97.00%', volatility: '中',
        merchantCount: 9, visibleMerchants: ['MER-002 LuckyPlay', 'MER-004 Royal H5'],
        limitTemplates: ['標準限額'], defaultLimitTemplate: '標準限額',
        minBet: 100, maxBet: 20000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'three-pick-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-027', name: '射龍門', type: '即時遊戲',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'TWD'], languages: ['繁中'],
        version: 'v1.0.0', mathVersion: 'RTP 97.00%', rtp: '97.00%', volatility: '中',
        merchantCount: 11, visibleMerchants: ['MER-001 Golden Dragon', 'MER-004 Royal H5'],
        limitTemplates: ['標準限額', '低風險限額'], defaultLimitTemplate: '低風險限額',
        minBet: 20, maxBet: 10000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'shoot-dragon-gate-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-028', name: '籃球投籃機', type: '運動',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 96.00%', rtp: '96.00%', volatility: '高',
        merchantCount: 5, visibleMerchants: ['MER-001 Golden Dragon', 'MER-002 LuckyPlay'],
        limitTemplates: ['標準限額'], defaultLimitTemplate: '標準限額',
        minBet: 10, maxBet: 10000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'basketball-h5', assetVersion: 'asset-2026.05', note: 'Beta',
    },
]
```

- [ ] **Step 3：執行 type-check**

```bash
cd /Users/cooperfu/Desktop/Game_Development_Background && npm run type-check 2>&1 | tail -20
```

預期：無新增錯誤

- [ ] **Step 4：Commit**

```bash
git add src/mocks/handlers/gameAdmin.ts
git commit -m "feat(mock): gameAdmin SEED_GAMES 替換為 28 款真實遊戲，更新遊戲類型分類"
```

---

## Task 4：更新 `src/views/Games/Index.vue` 篩選器選項

**Files:**
- Modify: `src/views/Games/Index.vue`（只改一行）

- [ ] **Step 1：找到並替換 `gameTypeOptions`**

找到第 67 行（附近）：
```ts
const gameTypeOptions = ['全部類型', '老虎機', '桌遊', '小遊戲', '真人'];
```

改為：
```ts
const gameTypeOptions = ['全部類型', '桌遊', '即時遊戲', '運動'];
```

- [ ] **Step 2：執行 type-check**

```bash
cd /Users/cooperfu/Desktop/Game_Development_Background && npm run type-check 2>&1 | tail -20
```

預期：無新增錯誤

- [ ] **Step 3：Commit**

```bash
git add src/views/Games/Index.vue
git commit -m "feat(ui): Games/Index 遊戲類型篩選器改為桌遊/即時遊戲/運動"
```

---

## Task 5：視覺驗證

**Files:** 無（只驗證）

- [ ] **Step 1：啟動 dev server（如已啟動請略過）**

```bash
cd /Users/cooperfu/Desktop/Game_Development_Background && npm run dev
```

預期：看到 `Local: http://localhost:5173/` 之類的輸出

- [ ] **Step 2：確認遊戲管理頁顯示真實遊戲**

打開瀏覽器 → 進入遊戲管理頁（`/games` 或對應路徑），確認：
- 遊戲列表出現真實遊戲名稱（百家樂、龍虎、Crash、Plinko 等）
- 「遊戲類型」篩選器顯示「桌遊」、「即時遊戲」、「運動」（不再出現「老虎機」）
- 按類型篩選後結果正確

- [ ] **Step 3：最終 commit（如有未 commit 的變更）**

確認無遺漏後已 commit 即完成。
