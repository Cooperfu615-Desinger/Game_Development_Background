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
