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
        const id = params.id as string
        if (!STATS_STORE[id]) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
        const url = new URL(request.url)
        const period = (url.searchParams.get('period') ?? 'month') as 'week' | 'month'
        const trend = generateTrend(id, period)
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
