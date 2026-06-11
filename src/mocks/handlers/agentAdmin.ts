import { http, HttpResponse, delay } from 'msw'
import { expandDemoRows } from '@/utils/demoRows'
import { scopeRows } from '@/mocks/scope'

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
        name: 'Asia Master',
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
// 佣金報表（C2 Spec 2）— type + seed
// 固定 6 筆（不 expandDemoRows）：all=6 / own-agent-line(Asia Master)=3 / own-merchant=0
// ──────────────────────────────────────────────────────────────

type CommissionRow = {
    period: string
    agent: string
    merchant: string
    bet: number
    ggr: number
    commissionType: string
    commissionRate: number
    commission: number
    currency: string
    settlementStatus: string
}

const SEED_COMMISSIONS: CommissionRow[] = [
    { period: '2026-05', agent: 'Asia Master', merchant: 'Golden Dragon', bet: 1286800, ggr: 74400, commissionType: 'GGR', commissionRate: 0.08, commission: 5952, currency: 'USDT', settlementStatus: '待審核' },
    { period: '2026-05', agent: 'Asia Master', merchant: 'Dragon Club', bet: 736500, ggr: 42220, commissionType: 'GGR', commissionRate: 0.08, commission: 3377.6, currency: 'USDT', settlementStatus: '待對帳' },
    { period: '2026-04', agent: 'Asia Master', merchant: 'Golden Dragon', bet: 1102300, ggr: 61800, commissionType: 'GGR', commissionRate: 0.08, commission: 4944, currency: 'USDT', settlementStatus: '已鎖定' },
    { period: '2026-05', agent: 'Prime Network', merchant: 'LuckyPlay', bet: 8842000, ggr: 666000, commissionType: 'Turnover', commissionRate: 0.015, commission: 132630, currency: 'TWD', settlementStatus: '對帳中' },
    { period: '2026-05', agent: 'Nova Agent', merchant: 'Nova Gaming', bet: 316400, ggr: 21480, commissionType: 'GGR', commissionRate: 0.06, commission: 1288.8, currency: 'USD', settlementStatus: '已鎖定' },
    { period: '2026-05', agent: 'Royal Partner', merchant: 'Royal H5', bet: 542000, ggr: -27200, commissionType: 'GGR', commissionRate: 0.05, commission: -1360, currency: 'USDT', settlementStatus: '爭議中' },
]

// ──────────────────────────────────────────────────────────────
// Handlers
// ──────────────────────────────────────────────────────────────

export const agentAdminHandlers = [
    http.get('/api/agents/v2/list', async () => {
        await delay(250)
        return HttpResponse.json(expandDemoRows(SEED_LIST))
    }),
    http.get('/api/agents/v2/commissions', async ({ request }) => {
        await delay(250)
        return HttpResponse.json(scopeRows(request, SEED_COMMISSIONS, { agentKey: 'agent' }))
    }),
]
