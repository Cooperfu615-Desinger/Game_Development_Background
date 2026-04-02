import { http, HttpResponse, delay } from 'msw'
import { faker } from '@faker-js/faker'

export const dashboardHandlers = [
    // Dashboard stats cards
    http.get('/api/dashboard/stats', async () => {
        await delay(400)
        return HttpResponse.json({
            code: 0,
            data: {
                activePlayers: faker.number.int({ min: 8000, max: 15000 }),
                activePlayersTrend: faker.number.float({ min: -10, max: 20, fractionDigits: 1 }),
                todayRevenue: faker.number.float({ min: 50000, max: 200000, fractionDigits: 2 }),
                todayRevenueTrend: faker.number.float({ min: -5, max: 30, fractionDigits: 1 }),
                weeklyGrowth: faker.number.float({ min: -5, max: 15, fractionDigits: 1 }),
                onlinePlayers: faker.number.int({ min: 500, max: 3000 })
            }
        })
    }),

    // Revenue trend chart
    http.get('/api/dashboard/revenue', async ({ request }) => {
        await delay(400)
        const url = new URL(request.url)
        const period = url.searchParams.get('period') ?? '7d'
        const days = period === '30d' ? 30 : period === '14d' ? 14 : 7

        const dates: string[] = []
        const values: number[] = []
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            dates.push(d.toISOString().slice(0, 10))
            values.push(faker.number.float({ min: 30000, max: 200000, fractionDigits: 0 }))
        }

        return HttpResponse.json({
            code: 0,
            data: { dates, values, period }
        })
    }),

    // Top games
    http.get('/api/dashboard/top-games', async () => {
        await delay(400)
        const games = Array.from({ length: 5 }, (_, i) => ({
            rank: i + 1,
            id: faker.string.uuid(),
            name: faker.helpers.arrayElement([
                'Fortune Dragon', 'Lucky Koi', 'Golden Tiger', 'Neon Rush', 'Mystic Reels',
                'Diamond Storm', 'Wild Safari', 'Aztec Gold', 'Space Quest', 'Ocean Treasure'
            ]) + (i > 0 ? ` ${i + 1}` : ''),
            activePlayers: faker.number.int({ min: 200, max: 2000 }),
            revenueShare: faker.number.float({ min: 5, max: 30, fractionDigits: 1 })
        }))

        return HttpResponse.json({ code: 0, data: { items: games } })
    })
]
