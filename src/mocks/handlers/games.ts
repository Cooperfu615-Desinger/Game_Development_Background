import { http, HttpResponse, delay } from 'msw'
import { faker } from '@faker-js/faker'
import type { Game } from '@/types/game'

const GAME_NAMES = [
    'Fortune Dragon', 'Lucky Koi', 'Golden Tiger', 'Neon Rush', 'Mystic Reels',
    'Diamond Storm', 'Wild Safari', 'Aztec Gold', 'Ocean Treasure', 'Space Quest',
    'Phoenix Rising', 'Jade Emperor', 'Thunder Bolt', 'Crystal Cave', 'Solar Flare',
    'Monkey King', 'Panda Luck', 'Dragon Palace', 'Samurai Edge', 'Viking Voyage'
]

const CATEGORIES: Game['category'][] = ['slot', 'table', 'live', 'fishing']

// Seed stable mock data
const mockGames: Game[] = GAME_NAMES.map((name, i) => ({
    id: `game-${String(i + 1).padStart(3, '0')}`,
    name,
    status: i % 5 === 0 ? 'inactive' : 'active',
    version: `${faker.number.int({ min: 1, max: 3 })}.${faker.number.int({ min: 0, max: 9 })}.${faker.number.int({ min: 0, max: 9 })}`,
    rtp: faker.number.float({ min: 90, max: 98, fractionDigits: 1 }),
    activeUsers: faker.number.int({ min: 0, max: 5000 }),
    publishedAt: faker.date.past({ years: 2 }).toISOString(),
    category: CATEGORIES[i % CATEGORIES.length]!,
    description: faker.lorem.sentences(2)
}))

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
