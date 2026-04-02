import { http, HttpResponse, delay } from 'msw'
import { faker } from '@faker-js/faker'
import type { Settlement, Transaction, Invoice } from '@/types/finance'

const GAME_NAMES = ['Fortune Dragon', 'Lucky Koi', 'Golden Tiger', 'Diamond Storm', 'Wild Safari']
const CURRENCIES = ['TWD', 'USD', 'JPY', 'THB']
const STATUSES_S: Settlement['status'][] = ['pending', 'confirmed', 'paid']
const STATUSES_I: Invoice['status'][] = ['draft', 'confirmed', 'paid']

const mockSettlements: Settlement[] = Array.from({ length: 30 }, (_, i) => {
    const revenue = faker.number.float({ min: 50000, max: 500000, fractionDigits: 2 })
    const revenueShare = faker.number.float({ min: 0.1, max: 0.3, fractionDigits: 3 })
    const fee = faker.number.float({ min: 1000, max: 5000, fractionDigits: 2 })
    const d = new Date()
    d.setMonth(d.getMonth() - Math.floor(i / 2))
    return {
        id: `settle-${String(i + 1).padStart(3, '0')}`,
        period: d.toISOString().slice(0, 7),
        type: (['daily', 'weekly', 'monthly'] as const)[i % 3]!,
        revenue,
        revenueShare: Number((revenue * revenueShare).toFixed(2)),
        fee,
        netAmount: Number((revenue * revenueShare - fee).toFixed(2)),
        status: STATUSES_S[i % 3]!,
        createdAt: faker.date.recent({ days: 90 }).toISOString()
    }
})

const mockTransactions: Transaction[] = Array.from({ length: 100 }, (_, i) => ({
    id: `tx-${String(i + 1).padStart(5, '0')}`,
    betId: `bet-${faker.string.alphanumeric(8).toUpperCase()}`,
    playerId: `player-${String(faker.number.int({ min: 1, max: 80 })).padStart(4, '0')}`,
    playerName: faker.internet.username(),
    gameId: `game-${String((i % 20) + 1).padStart(3, '0')}`,
    gameName: GAME_NAMES[i % GAME_NAMES.length]!,
    type: (['bet', 'win', 'refund'] as const)[i % 3]!,
    amount: faker.number.float({ min: 10, max: 10000, fractionDigits: 2 }),
    currency: CURRENCIES[i % CURRENCIES.length]!,
    createdAt: faker.date.recent({ days: 30 }).toISOString()
}))

const mockInvoices: Invoice[] = Array.from({ length: 12 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const due = new Date(d)
    due.setDate(due.getDate() + 30)
    return {
        id: `inv-${String(i + 1).padStart(3, '0')}`,
        invoiceNo: `INV-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`,
        period: d.toISOString().slice(0, 7),
        amount: faker.number.float({ min: 10000, max: 200000, fractionDigits: 2 }),
        currency: 'TWD',
        status: STATUSES_I[i % 3]!,
        dueDate: due.toISOString().slice(0, 10),
        createdAt: d.toISOString()
    }
})

export const financeHandlers = [
    // Settlements
    http.get('/api/finance/settlements', async ({ request }) => {
        await delay(400)
        const url = new URL(request.url)
        const page = Number(url.searchParams.get('page') ?? 1)
        const limit = Number(url.searchParams.get('limit') ?? 20)
        const status = url.searchParams.get('status') ?? ''
        const startDate = url.searchParams.get('startDate') ?? ''
        const endDate = url.searchParams.get('endDate') ?? ''

        let filtered = [...mockSettlements]
        if (status) filtered = filtered.filter(s => s.status === status)
        if (startDate) filtered = filtered.filter(s => s.period >= startDate.slice(0, 7))
        if (endDate) filtered = filtered.filter(s => s.period <= endDate.slice(0, 7))

        const total = filtered.length
        const items = filtered.slice((page - 1) * limit, page * limit)
        return HttpResponse.json({ code: 0, data: { items, total, page, limit } })
    }),

    http.get('/api/finance/settlements/:id', async ({ params }) => {
        await delay(300)
        const item = mockSettlements.find(s => s.id === params.id)
        if (!item) return HttpResponse.json({ code: 404 }, { status: 404 })
        return HttpResponse.json({ code: 0, data: item })
    }),

    // Transactions
    http.get('/api/finance/transactions', async ({ request }) => {
        await delay(400)
        const url = new URL(request.url)
        const page = Number(url.searchParams.get('page') ?? 1)
        const limit = Number(url.searchParams.get('limit') ?? 20)
        const betId = url.searchParams.get('betId') ?? ''
        const playerId = url.searchParams.get('playerId') ?? ''
        const currency = url.searchParams.get('currency') ?? ''

        let filtered = [...mockTransactions]
        if (betId) filtered = filtered.filter(t => t.betId.includes(betId))
        if (playerId) filtered = filtered.filter(t => t.playerId.includes(playerId))
        if (currency) filtered = filtered.filter(t => t.currency === currency)

        const total = filtered.length
        const items = filtered.slice((page - 1) * limit, page * limit)
        return HttpResponse.json({ code: 0, data: { items, total, page, limit } })
    }),

    // Invoices
    http.get('/api/finance/invoices', async ({ request }) => {
        await delay(400)
        const url = new URL(request.url)
        const page = Number(url.searchParams.get('page') ?? 1)
        const limit = Number(url.searchParams.get('limit') ?? 20)
        const status = url.searchParams.get('status') ?? ''

        let filtered = [...mockInvoices]
        if (status) filtered = filtered.filter(i => i.status === status)

        const total = filtered.length
        const items = filtered.slice((page - 1) * limit, page * limit)
        return HttpResponse.json({ code: 0, data: { items, total, page, limit } })
    })
]
