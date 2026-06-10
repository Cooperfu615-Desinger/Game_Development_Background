import { http, HttpResponse, delay } from 'msw'
import { expandDemoRows } from '@/utils/demoRows'

// ──────────────────────────────────────────────────────────────
// Types (copied verbatim from the demo agentRows shape)
// ──────────────────────────────────────────────────────────────

// From mock.ts agentRows / ListView.vue agent branch
type AgentRow = {
    code: string
    name: string
    parentAgent: string
    contact: string
    merchantCount: number
    commissionType: string
    commissionRate: string
    settlementCurrency: string
    status: string
    createdAt: string
}

// ──────────────────────────────────────────────────────────────
// Seed data (verbatim from demo mock.ts agentRows)
// ──────────────────────────────────────────────────────────────

const SEED_LIST: AgentRow[] = [
    {
        code: 'AG-001',
        name: '星河代理',
        parentAgent: '-',
        contact: 'Iris Chen',
        merchantCount: 12,
        commissionType: 'GGR 分潤',
        commissionRate: '8.00%',
        settlementCurrency: 'USDT',
        status: '啟用',
        createdAt: '2026-01-08 10:12',
    },
    {
        code: 'AG-002',
        name: '海納娛樂',
        parentAgent: 'AG-001',
        contact: 'Ken Liu',
        merchantCount: 6,
        commissionType: '流水',
        commissionRate: '1.50%',
        settlementCurrency: 'TWD',
        status: '測試中',
        createdAt: '2026-02-12 15:40',
    },
    {
        code: 'AG-003',
        name: 'Global Partner',
        parentAgent: '-',
        contact: 'Mia Stone',
        merchantCount: 4,
        commissionType: '固定',
        commissionRate: '0.00%',
        settlementCurrency: 'USD',
        status: '啟用',
        createdAt: '2026-03-18 09:24',
    },
    {
        code: 'AG-004',
        name: 'Royal Network',
        parentAgent: 'AG-003',
        contact: 'Alex Wang',
        merchantCount: 2,
        commissionType: 'GGR 分潤',
        commissionRate: '3.25%',
        settlementCurrency: 'USDT',
        status: '停用',
        createdAt: '2026-04-02 18:06',
    },
    {
        code: 'AG-005',
        name: '東方渠道',
        parentAgent: '-',
        contact: 'Yuna Lin',
        merchantCount: 3,
        commissionType: 'GGR 分潤',
        commissionRate: '5.20%',
        settlementCurrency: 'USDT',
        status: '待審核',
        createdAt: '2026-05-01 11:20',
    },
]

// ──────────────────────────────────────────────────────────────
// Handlers
// ──────────────────────────────────────────────────────────────

export const agentAdminHandlers = [
    http.get('/api/agents/v2/list', async () => {
        await delay(250)
        return HttpResponse.json(expandDemoRows(SEED_LIST))
    }),
]
