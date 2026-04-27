import { http, HttpResponse } from 'msw'
import type { Aggregator, AggregatorGameConfig, CreateAggregatorPayload, BetRangeCurrency } from '@/types/aggregator'
import { MASTER_LIMITS } from '@/types/aggregator'

// ─── 遊戲主資料（10 款，含三種類型）────────────────────────────────────────────
const BASE_GAMES: Pick<AggregatorGameConfig, 'gameId' | 'gameName' | 'category'>[] = [
    { gameId: 'g-001', gameName: 'Golden Fortune Slot', category: 'slot'  },
    { gameId: 'g-002', gameName: 'Dragon\'s Treasure',  category: 'slot'  },
    { gameId: 'g-003', gameName: 'Lucky Sevens',        category: 'slot'  },
    { gameId: 'g-004', gameName: 'Wild Safari Slot',    category: 'slot'  },
    { gameId: 'g-005', gameName: 'Mystic Forest Slot',  category: 'slot'  },
    { gameId: 'g-006', gameName: 'Space Adventure',     category: 'slot'  },
    { gameId: 'g-007', gameName: 'CrashX Pro',          category: 'crash' },
    { gameId: 'g-008', gameName: 'Rocket Rush',         category: 'crash' },
    { gameId: 'g-009', gameName: 'Texas Hold\'em',      category: 'table' },
    { gameId: 'g-010', gameName: 'Baccarat Classic',    category: 'table' },
]

// ─── 各幣別的開發商主設定上限（唯讀參考）─────────────────────────────────────────
const masterBetRangesAll: BetRangeCurrency[] = [
    MASTER_LIMITS['USDT'] as BetRangeCurrency,
    MASTER_LIMITS['TWD']  as BetRangeCurrency,
    MASTER_LIMITS['USD']  as BetRangeCurrency,
]

// ─── 聚合商基礎資料 ────────────────────────────────────────────────────────────
let aggregators: Aggregator[] = [
    {
        id: 'agg-001',
        name: '自家聚合商',
        code: 'self',
        status: 'active',
        connectionStatus: 'connected',
        apiEndpoint: 'https://api.self-aggregator.com/v1',
        apiKey: 'sk-self-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        gameCount: 10,
        totalGames: 10,
        description: '自行開發的聚合商，第一期對接目標',
        createdAt: '2026-01-15T08:00:00Z',
    },
    {
        id: 'agg-002',
        name: '測試環境',
        code: 'sandbox',
        status: 'active',
        connectionStatus: 'disconnected',
        apiEndpoint: 'https://sandbox.self-aggregator.com/v1',
        apiKey: 'sk-sandbox-yyyyyyyyyyyyyyyyyyyyyyyyyyyy',
        gameCount: 6,
        totalGames: 10,
        description: '開發測試用沙盒環境',
        createdAt: '2026-02-01T09:00:00Z',
    },
    {
        id: 'agg-003',
        name: '預備合作夥伴 A',
        code: 'partner-a',
        status: 'inactive',
        connectionStatus: 'pending',
        apiEndpoint: 'https://api.partner-a.com/games/v2',
        apiKey: 'sk-partner-zzzzzzzzzzzzzzzzzzzzzzzzzzzz',
        gameCount: 0,
        totalGames: 10,
        description: '規劃中的第三方聚合商，預計 2027 Q1 對接',
        createdAt: '2026-03-10T10:00:00Z',
    },
]

// ─── 遊戲配置資料（聚合商 × 遊戲 × 幣別）──────────────────────────────────────
type GameConfigStore = Record<string, AggregatorGameConfig[]>

const gameConfigs: GameConfigStore = {
    'agg-001': BASE_GAMES.map(g => ({
        ...g,
        enabled: true,
        masterBetRanges: masterBetRangesAll,
        betRanges: [
            { currency: 'USDT', minBet: 1,   maxBet: 500,   maxWin: 50000   },
            { currency: 'TWD',  minBet: 30,  maxBet: 15000, maxWin: 1500000 },
            { currency: 'USD',  minBet: 1,   maxBet: 500,   maxWin: 50000   },
        ],
    })),
    'agg-002': BASE_GAMES.map((g, i) => ({
        ...g,
        enabled: i < 6, // 只開前 6 款
        masterBetRanges: masterBetRangesAll,
        betRanges: i < 6 ? [
            { currency: 'USDT', minBet: 0.1, maxBet: 50,   maxWin: 5000  },
            { currency: 'TWD',  minBet: 3,   maxBet: 1500, maxWin: 150000 },
        ] : [],
    })),
    'agg-003': BASE_GAMES.map(g => ({
        ...g,
        enabled: false,
        masterBetRanges: masterBetRangesAll,
        betRanges: [],
    })),
}

// ─── Handlers ─────────────────────────────────────────────────────────────────
export const aggregatorsHandlers = [

    // GET /api/aggregators — 列表（含搜索 + 狀態篩選 + 分頁）
    http.get('/api/aggregators', ({ request }) => {
        const url = new URL(request.url)
        const status = url.searchParams.get('status')
        const search = url.searchParams.get('search') ?? ''
        const page = parseInt(url.searchParams.get('page') ?? '1')
        const pageSize = parseInt(url.searchParams.get('pageSize') ?? '10')

        let filtered = aggregators
        if (status) filtered = filtered.filter(a => a.status === status)
        if (search) filtered = filtered.filter(a =>
            a.name.toLowerCase().includes(search.toLowerCase()) ||
            a.code.toLowerCase().includes(search.toLowerCase())
        )

        const total = filtered.length
        const data = filtered.slice((page - 1) * pageSize, page * pageSize)
        return HttpResponse.json({ data, total, page, pageSize })
    }),

    // GET /api/aggregators/:id — 單一詳情
    http.get('/api/aggregators/:id', ({ params }) => {
        const agg = aggregators.find(a => a.id === params.id)
        if (!agg) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
        return HttpResponse.json(agg)
    }),

    // POST /api/aggregators — 新增
    http.post('/api/aggregators', async ({ request }) => {
        const body = await request.json() as CreateAggregatorPayload
        const newAgg: Aggregator = {
            id: `agg-${String(Date.now()).slice(-4)}`,
            name: body.name,
            code: body.code,
            status: 'active',
            connectionStatus: 'pending',
            apiEndpoint: body.apiEndpoint,
            apiKey: `sk-${body.code}-${'x'.repeat(32)}`,
            gameCount: 0,
            totalGames: BASE_GAMES.length,
            description: body.description ?? '',
            createdAt: new Date().toISOString(),
        }
        aggregators = [...aggregators, newAgg]
        gameConfigs[newAgg.id] = BASE_GAMES.map(g => ({
            ...g,
            enabled: false,
            masterBetRanges: masterBetRangesAll,
            betRanges: [],
        }))
        return HttpResponse.json(newAgg, { status: 201 })
    }),

    // PATCH /api/aggregators/:id/status — 切換啟用狀態
    http.patch('/api/aggregators/:id/status', async ({ params, request }) => {
        const body = await request.json() as { status: 'active' | 'inactive' }
        aggregators = aggregators.map(a =>
            a.id === params.id ? { ...a, status: body.status } : a
        )
        const updated = aggregators.find(a => a.id === params.id)
        return HttpResponse.json(updated)
    }),

    // GET /api/aggregators/:id/games — 遊戲配置列表
    http.get('/api/aggregators/:id/games', ({ params }) => {
        const configs = gameConfigs[params.id as string]
        if (!configs) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
        return HttpResponse.json({ data: configs, total: configs.length })
    }),

    // PATCH /api/aggregators/:id/games/:gameId — 更新遊戲配置（enabled + betRanges）
    http.patch('/api/aggregators/:id/games/:gameId', async ({ params, request }) => {
        const aggId = params.id as string
        const gameId = params.gameId as string
        const body = await request.json() as Partial<AggregatorGameConfig>

        const configs = gameConfigs[aggId]
        if (!configs) return HttpResponse.json({ message: 'Not found' }, { status: 404 })

        gameConfigs[aggId] = configs.map(c =>
            c.gameId === gameId ? { ...c, ...body } : c
        )

        // 同步更新聚合商的 gameCount
        const enabledCount = gameConfigs[aggId].filter(c => c.enabled).length
        aggregators = aggregators.map(a =>
            a.id === aggId ? { ...a, gameCount: enabledCount } : a
        )

        const updated = gameConfigs[aggId].find(c => c.gameId === gameId)
        return HttpResponse.json(updated)
    }),
]
