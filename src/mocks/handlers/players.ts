import { http, HttpResponse, delay } from 'msw'
import { faker } from '@faker-js/faker'
import type { Player } from '@/types/player'

const COUNTRIES = ['TW', 'JP', 'KR', 'TH', 'VN', 'PH', 'MY', 'SG', 'HK', 'ID']
const STATUSES: Player['status'][] = ['active', 'active', 'active', 'inactive', 'banned']

const mockPlayers: Player[] = Array.from({ length: 80 }, (_, i) => ({
    id: `player-${String(i + 1).padStart(4, '0')}`,
    username: faker.internet.username(),
    country: COUNTRIES[i % COUNTRIES.length]!,
    registeredAt: faker.date.past({ years: 2 }).toISOString(),
    lastActiveAt: faker.date.recent({ days: 30 }).toISOString(),
    totalBets: faker.number.float({ min: 100, max: 500000, fractionDigits: 2 }),
    totalDeposits: faker.number.float({ min: 100, max: 100000, fractionDigits: 2 }),
    status: STATUSES[i % STATUSES.length]!
}))

export const playerHandlers = [
    // Overview stats (DAU/WAU/MAU)
    http.get('/api/analytics/overview', async ({ request }) => {
        await delay(400)
        const url = new URL(request.url)
        const period = url.searchParams.get('period') ?? '7d'
        const days = period === '30d' ? 30 : period === '14d' ? 14 : 7

        const dates: string[] = []
        const dau: number[] = []
        const wau: number[] = []
        const mau: number[] = []

        for (let i = days - 1; i >= 0; i--) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            dates.push(d.toISOString().slice(0, 10))
            dau.push(faker.number.int({ min: 800, max: 3000 }))
            wau.push(faker.number.int({ min: 3000, max: 8000 }))
            mau.push(faker.number.int({ min: 8000, max: 15000 }))
        }

        return HttpResponse.json({
            code: 0,
            data: {
                dates, dau, wau, mau,
                summary: {
                    dau: dau[dau.length - 1],
                    wau: wau[wau.length - 1],
                    mau: mau[mau.length - 1],
                    dauTrend: faker.number.float({ min: -10, max: 20, fractionDigits: 1 })
                }
            }
        })
    }),

    // Retention rates
    http.get('/api/analytics/retention', async () => {
        await delay(400)
        const games = ['Fortune Dragon', 'Lucky Koi', 'Golden Tiger', 'Diamond Storm', '全部遊戲']
        return HttpResponse.json({
            code: 0,
            data: {
                items: games.map(label => ({
                    label,
                    d1: faker.number.float({ min: 30, max: 60, fractionDigits: 1 }),
                    d7: faker.number.float({ min: 15, max: 35, fractionDigits: 1 }),
                    d30: faker.number.float({ min: 5, max: 20, fractionDigits: 1 })
                }))
            }
        })
    }),

    // ARPU trend
    http.get('/api/analytics/arpu', async () => {
        await delay(400)
        const dates: string[] = []
        const arpu: number[] = []
        for (let i = 29; i >= 0; i--) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            dates.push(d.toISOString().slice(0, 10))
            arpu.push(faker.number.float({ min: 20, max: 80, fractionDigits: 2 }))
        }
        return HttpResponse.json({ code: 0, data: { dates, arpu } })
    }),

    // Player list
    http.get('/api/players', async ({ request }) => {
        await delay(400)
        const url = new URL(request.url)
        const page = Number(url.searchParams.get('page') ?? 1)
        const limit = Number(url.searchParams.get('limit') ?? 20)
        const search = url.searchParams.get('search') ?? ''
        const status = url.searchParams.get('status') ?? ''
        const country = url.searchParams.get('country') ?? ''

        let filtered = [...mockPlayers]
        if (search) filtered = filtered.filter(p =>
            p.username.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search)
        )
        if (status) filtered = filtered.filter(p => p.status === status)
        if (country) filtered = filtered.filter(p => p.country === country)

        const total = filtered.length
        const items = filtered.slice((page - 1) * limit, page * limit)

        return HttpResponse.json({ code: 0, data: { items, total, page, limit } })
    }),

    // Single player
    http.get('/api/players/:id', async ({ params }) => {
        await delay(300)
        const player = mockPlayers.find(p => p.id === params.id)
        if (!player) return HttpResponse.json({ code: 404 }, { status: 404 })
        return HttpResponse.json({ code: 0, data: player })
    })
]
