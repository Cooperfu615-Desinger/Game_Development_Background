import { http, HttpResponse, delay } from 'msw'
import { expandDemoRows } from '@/utils/demoRows'

// ──────────────────────────────────────────────────────────────
// Types (copied from the demo .vue files)
// ──────────────────────────────────────────────────────────────

// From ReportOverviewView.vue (inline `reportRows`, no explicit type)
type ReportOverviewRow = {
    module: string
    path: string
    count: number
    ggr: number
    receivable: number
    status: string
    owner: string
}

// From MerchantReportView.vue (interface MerchantReportRow)
type MerchantReportRow = {
    code: string
    merchant: string
    agent: string
    walletType: string
    currency: string
    bet: number
    win: number
    ggr: number
    rtp: number
    revenueShare: number
    receivable: number
    activePlayers: number
    settlementStatus: string
    apiStatus: string
    updatedAt: string
    note: string
}

// From AgentReportView.vue (interface AgentReportRow)
type AgentReportRow = {
    code: string
    agent: string
    level: string
    parent: string
    merchants: number
    currency: string
    bet: number
    win: number
    ggr: number
    commissionType: string
    commissionRate: number
    commission: number
    settlementStatus: string
    status: string
    updatedAt: string
    note: string
}

// From GameReportView.vue (interface GameReportRow)
type GameReportRow = {
    id: string
    game: string
    gameType: string
    status: string
    merchants: number
    currency: string
    bet: number
    win: number
    ggr: number
    rtp: number
    rounds: number
    avgBet: number
    jackpotContribution: number
    updatedAt: string
    note: string
}

// From RtpReportView.vue (interface RtpRow)
type RtpReportRow = {
    id: string
    game: string
    gameType: string
    merchant: string
    mathVersion: string
    targetRtp: number
    actualRtp: number
    rounds: number
    bet: number
    win: number
    ggr: number
    currency: string
    status: string
    updatedAt: string
    note: string
}

// From SettlementListView.vue (interface SettlementRow)
type SettlementListRow = {
    id: string
    merchant: string
    agent: string
    cycle: string
    period: string
    currency: string
    bet: number
    win: number
    ggr: number
    revenueShare: number
    adjustment: number
    receivable: number
    fxRate: string
    status: '待對帳' | '對帳中' | '待審核' | '已鎖定' | '爭議中'
    lockedBy: string
    updatedAt: string
    note: string
}

// From SettlementDetailView.vue (inline `settlement` reactive + related arrays)
type SettlementCurrencyRow = {
    currency: string
    bet: number
    win: number
    ggr: number
    fxRate: string
    settlementGgr: number
    revenueShare: number
    receivable: number
}

type SettlementAdjustmentRow = {
    id: string
    type: string
    amount: number
    currency: string
    reason: string
    status: string
    applicant: string
}

type SettlementAuditRow = {
    time: string
    actor: string
    action: string
    target: string
    result: string
}

type SettlementDetail = {
    id: string
    merchant: string
    merchantCode: string
    agent: string
    cycle: string
    period: string
    status: string
    currency: string
    lockedBy: string
    generatedAt: string
    updatedAt: string
    owner: string
    note: string
    currencyRows: SettlementCurrencyRow[]
    adjustmentRows: SettlementAdjustmentRow[]
    auditRows: SettlementAuditRow[]
}

// ──────────────────────────────────────────────────────────────
// Seed data (verbatim from demo .vue files, expanded via expandDemoRows for lists)
// ──────────────────────────────────────────────────────────────

const SEED_OVERVIEW: ReportOverviewRow[] = expandDemoRows([
    { module: '商戶報表', path: '/reports/merchants', count: 5, ggr: 776900, receivable: 224709, status: '待審核 1 / 爭議 1', owner: 'Finance Admin' },
    { module: '代理報表', path: '/reports/agents', count: 5, ggr: 781180, receivable: 148142.8, status: '待處理 4', owner: 'Channel Ops' },
    { module: '遊戲報表', path: '/reports/games', count: 5, ggr: 776900, receivable: 0, status: '維護 1 / 觀察 1', owner: 'Game Ops' },
    { module: 'RTP 報表', path: '/reports/rtp', count: 5, ggr: 92335.5, receivable: 0, status: '偏離 1 / 樣本不足 1', owner: 'Math Team' },
    { module: '結算單列表', path: '/settlements', count: 5, ggr: 786080, receivable: 226980, status: '已鎖定 1 / 爭議 1', owner: 'Finance Admin' },
])

const SEED_MERCHANTS: MerchantReportRow[] = expandDemoRows([
    {
        code: 'MER-001',
        merchant: 'Golden Dragon',
        agent: 'Asia Master',
        walletType: '轉帳錢包',
        currency: 'USDT',
        bet: 1286800,
        win: 1212400,
        ggr: 74400,
        rtp: 94.22,
        revenueShare: 0.32,
        receivable: 23808,
        activePlayers: 1842,
        settlementStatus: '待審核',
        apiStatus: '正常',
        updatedAt: '2026-05-21 23:59:59',
        note: '本期含一筆退款調整，需財務覆核。',
    },
    {
        code: 'MER-002',
        merchant: 'LuckyPlay',
        agent: 'Prime Network',
        walletType: '單一錢包',
        currency: 'TWD',
        bet: 8842000,
        win: 8176000,
        ggr: 666000,
        rtp: 92.47,
        revenueShare: 0.28,
        receivable: 186480,
        activePlayers: 1260,
        settlementStatus: '對帳中',
        apiStatus: '正常',
        updatedAt: '2026-05-21 23:59:59',
        note: '商戶已下載對帳明細。',
    },
    {
        code: 'MER-003',
        merchant: 'Nova Gaming',
        agent: 'Nova Agent',
        walletType: '轉帳錢包',
        currency: 'USD',
        bet: 316400,
        win: 294920,
        ggr: 21480,
        rtp: 93.21,
        revenueShare: 0.3,
        receivable: 6444,
        activePlayers: 532,
        settlementStatus: '已鎖定',
        apiStatus: '正常',
        updatedAt: '2026-05-20 18:42:03',
        note: '結算單已鎖定。',
    },
    {
        code: 'MER-004',
        merchant: 'Royal H5',
        agent: 'Royal Partner',
        walletType: '轉帳錢包',
        currency: 'USDT',
        bet: 542000,
        win: 569200,
        ggr: -27200,
        rtp: 105.02,
        revenueShare: 0.25,
        receivable: -6800,
        activePlayers: 318,
        settlementStatus: '爭議中',
        apiStatus: '警示',
        updatedAt: '2026-05-21 23:18:27',
        note: '商戶回報派彩差異，等待交易核對。',
    },
    {
        code: 'MER-005',
        merchant: 'Dragon Club',
        agent: 'Asia Master',
        walletType: '單一錢包',
        currency: 'USDT',
        bet: 736500,
        win: 694280,
        ggr: 42220,
        rtp: 94.27,
        revenueShare: 0.35,
        receivable: 14777,
        activePlayers: 820,
        settlementStatus: '待對帳',
        apiStatus: '正常',
        updatedAt: '2026-05-21 22:50:12',
        note: '等待商戶確認對帳資料。',
    },
])

const SEED_AGENTS: AgentReportRow[] = expandDemoRows([
    {
        code: 'AG-001',
        agent: 'Asia Master',
        level: '一級代理',
        parent: '-',
        merchants: 18,
        currency: 'USDT',
        bet: 1868200,
        win: 1763400,
        ggr: 104800,
        commissionType: 'GGR',
        commissionRate: 0.08,
        commission: 8384,
        settlementStatus: '待審核',
        status: '啟用',
        updatedAt: '2026-05-21 23:59:59',
        note: '本期包含 Golden Dragon 與 Dragon Club 主要貢獻。',
    },
    {
        code: 'AG-002',
        agent: 'Prime Network',
        level: '一級代理',
        parent: '-',
        merchants: 9,
        currency: 'TWD',
        bet: 8842000,
        win: 8176000,
        ggr: 666000,
        commissionType: 'Turnover',
        commissionRate: 0.015,
        commission: 132630,
        settlementStatus: '對帳中',
        status: '啟用',
        updatedAt: '2026-05-21 23:59:59',
        note: '以流水計算佣金，需注意與 GGR 報表口徑不同。',
    },
    {
        code: 'AG-003',
        agent: 'Nova Agent',
        level: '二級代理',
        parent: 'Asia Master',
        merchants: 4,
        currency: 'USD',
        bet: 316400,
        win: 294920,
        ggr: 21480,
        commissionType: 'GGR',
        commissionRate: 0.06,
        commission: 1288.8,
        settlementStatus: '已鎖定',
        status: '啟用',
        updatedAt: '2026-05-20 18:42:03',
        note: '結算單已鎖定，佣金不可再直接修改。',
    },
    {
        code: 'AG-004',
        agent: 'Royal Partner',
        level: '二級代理',
        parent: 'Prime Network',
        merchants: 6,
        currency: 'USDT',
        bet: 542000,
        win: 569200,
        ggr: -27200,
        commissionType: 'GGR',
        commissionRate: 0.05,
        commission: -1360,
        settlementStatus: '爭議中',
        status: '觀察',
        updatedAt: '2026-05-21 23:18:27',
        note: '下屬商戶派彩差異導致本期佣金為負，等待交易核對。',
    },
    {
        code: 'AG-005',
        agent: 'Star Affiliate',
        level: '三級代理',
        parent: 'Nova Agent',
        merchants: 2,
        currency: 'USDT',
        bet: 248000,
        win: 231900,
        ggr: 16100,
        commissionType: 'Fixed',
        commissionRate: 0,
        commission: 1200,
        settlementStatus: '待對帳',
        status: '啟用',
        updatedAt: '2026-05-21 20:32:10',
        note: '固定佣金方案，需由財務確認是否達最低結算門檻。',
    },
])

const SEED_GAMES: GameReportRow[] = expandDemoRows([
    {
        id: 'GAME-FT',
        game: 'Fortune Tiger',
        gameType: 'Slot',
        status: '上架',
        merchants: 18,
        currency: 'USDT',
        bet: 1286800,
        win: 1212400,
        ggr: 74400,
        rtp: 94.22,
        rounds: 248820,
        avgBet: 5.17,
        jackpotContribution: 3860,
        updatedAt: '2026-05-21 23:59:59',
        note: '投注量最高，RTP 在可接受區間內。',
    },
    {
        id: 'GAME-RH',
        game: 'Royal H5',
        gameType: 'Table',
        status: '上架',
        merchants: 12,
        currency: 'TWD',
        bet: 8842000,
        win: 8176000,
        ggr: 666000,
        rtp: 92.47,
        rounds: 78220,
        avgBet: 113.04,
        jackpotContribution: 0,
        updatedAt: '2026-05-21 23:59:59',
        note: '桌牌遊戲 GGR 穩定，需觀察高額玩家集中度。',
    },
    {
        id: 'GAME-BJ',
        game: 'Blackjack Live',
        gameType: 'Live',
        status: '觀察',
        merchants: 9,
        currency: 'USD',
        bet: 316400,
        win: 294920,
        ggr: 21480,
        rtp: 93.21,
        rounds: 28640,
        avgBet: 11.05,
        jackpotContribution: 0,
        updatedAt: '2026-05-21 23:59:59',
        note: '樣本量中等，RTP 偏低但仍在觀察範圍。',
    },
    {
        id: 'GAME-BC',
        game: 'Baccarat Pro',
        gameType: 'Live',
        status: '維護中',
        merchants: 6,
        currency: 'USDT',
        bet: 542000,
        win: 569200,
        ggr: -27200,
        rtp: 105.02,
        rounds: 8420,
        avgBet: 64.37,
        jackpotContribution: 0,
        updatedAt: '2026-05-21 23:59:59',
        note: '短期 RTP 偏高，目前排入維護與結果核對。',
    },
    {
        id: 'GAME-DS',
        game: 'Dragon Slot',
        gameType: 'Slot',
        status: '上架',
        merchants: 15,
        currency: 'USDT',
        bet: 736500,
        win: 694280,
        ggr: 42220,
        rtp: 94.27,
        rounds: 166920,
        avgBet: 4.41,
        jackpotContribution: 2209,
        updatedAt: '2026-05-21 23:59:59',
        note: '投注量穩定，Jackpot 累積比例正常。',
    },
])

const SEED_RTP: RtpReportRow[] = expandDemoRows([
    {
        id: 'RTP-FT-GD-20260521',
        game: 'Fortune Tiger',
        gameType: 'Slot',
        merchant: 'Golden Dragon',
        mathVersion: 'MATH-FT-96A',
        targetRtp: 96,
        actualRtp: 101.8,
        rounds: 128430,
        bet: 482600,
        win: 491287,
        ggr: -8687,
        currency: 'USDT',
        status: '偏離',
        updatedAt: '2026-05-21 23:59:59',
        note: '實際 RTP 高於理論值 5.8%，需延長觀察並確認大獎派發。',
    },
    {
        id: 'RTP-RH-LP-20260521',
        game: 'Royal H5',
        gameType: 'Table',
        merchant: 'LuckyPlay',
        mathVersion: 'MATH-RH-97B',
        targetRtp: 97.2,
        actualRtp: 96.4,
        rounds: 78220,
        bet: 322100,
        win: 310502,
        ggr: 11598,
        currency: 'TWD',
        status: '正常',
        updatedAt: '2026-05-21 23:59:59',
        note: '偏離值在容許範圍內。',
    },
    {
        id: 'RTP-BJ-NG-20260521',
        game: 'Blackjack Live',
        gameType: 'Live',
        merchant: 'Nova Gaming',
        mathVersion: 'MATH-BJ-985',
        targetRtp: 98.5,
        actualRtp: 94.9,
        rounds: 28640,
        bet: 210400,
        win: 199670,
        ggr: 10730,
        currency: 'USD',
        status: '觀察',
        updatedAt: '2026-05-21 23:59:59',
        note: '樣本量中等，偏低 3.6%，先觀察下一個週期。',
    },
    {
        id: 'RTP-BC-RH-20260521',
        game: 'Baccarat Pro',
        gameType: 'Live',
        merchant: 'Royal H5',
        mathVersion: 'MATH-BC-976',
        targetRtp: 97.6,
        actualRtp: 104.1,
        rounds: 8420,
        bet: 126500,
        win: 131686,
        ggr: -5186,
        currency: 'USDT',
        status: '樣本不足',
        updatedAt: '2026-05-21 23:59:59',
        note: '偏離較高，但樣本局數不足，需延長時間區間再判斷。',
    },
    {
        id: 'RTP-FT-PN-20260521',
        game: 'Fortune Tiger',
        gameType: 'Slot',
        merchant: 'Prime Network',
        mathVersion: 'MATH-FT-96A',
        targetRtp: 96,
        actualRtp: 95.7,
        rounds: 166920,
        bet: 538400,
        win: 515489,
        ggr: 22911,
        currency: 'USDT',
        status: '正常',
        updatedAt: '2026-05-21 23:59:59',
        note: '偏離值穩定。',
    },
])

const SEED_SETTLEMENTS: SettlementListRow[] = expandDemoRows([
    {
        id: 'SET-202605-GD-001',
        merchant: 'Golden Dragon',
        agent: 'Asia Master',
        cycle: '月結',
        period: '2026-05-01 ~ 2026-05-31',
        currency: 'USDT',
        bet: 1268800,
        win: 1195200,
        ggr: 73600,
        revenueShare: 0.32,
        adjustment: -1200,
        receivable: 22352,
        fxRate: '1.000000',
        status: '待審核',
        lockedBy: '-',
        updatedAt: '2026-05-21 18:24:12',
        note: '含一筆退款調整，需財務覆核。',
    },
    {
        id: 'SET-202605-LP-002',
        merchant: 'LuckyPlay',
        agent: 'Prime Network',
        cycle: '週結',
        period: '2026-05-13 ~ 2026-05-19',
        currency: 'TWD',
        bet: 8842000,
        win: 8176000,
        ggr: 666000,
        revenueShare: 0.28,
        adjustment: 0,
        receivable: 186480,
        fxRate: '0.031250',
        status: '對帳中',
        lockedBy: '-',
        updatedAt: '2026-05-20 11:08:45',
        note: '商戶已下載對帳明細。',
    },
    {
        id: 'SET-202605-NG-003',
        merchant: 'Nova Gaming',
        agent: 'Nova Agent',
        cycle: '月結',
        period: '2026-05-01 ~ 2026-05-31',
        currency: 'USD',
        bet: 316400,
        win: 294920,
        ggr: 21480,
        revenueShare: 0.3,
        adjustment: 800,
        receivable: 7244,
        fxRate: '1.000000',
        status: '已鎖定',
        lockedBy: 'Finance Admin',
        updatedAt: '2026-05-19 16:42:03',
        note: '已鎖定，不可再修改金額。',
    },
    {
        id: 'SET-202605-RH-004',
        merchant: 'Royal H5',
        agent: 'Royal Partner',
        cycle: '日結',
        period: '2026-05-21',
        currency: 'USDT',
        bet: 542000,
        win: 569200,
        ggr: -27200,
        revenueShare: 0.25,
        adjustment: 0,
        receivable: -6800,
        fxRate: '1.000000',
        status: '爭議中',
        lockedBy: '-',
        updatedAt: '2026-05-21 23:18:27',
        note: '商戶回報派彩差異，等待交易核對。',
    },
    {
        id: 'SET-202605-GD-005',
        merchant: 'Golden Dragon',
        agent: 'Asia Master',
        cycle: '週結',
        period: '2026-05-06 ~ 2026-05-12',
        currency: 'USDT',
        bet: 936500,
        win: 884300,
        ggr: 52200,
        revenueShare: 0.32,
        adjustment: 0,
        receivable: 16704,
        fxRate: '1.000000',
        status: '待對帳',
        lockedBy: '-',
        updatedAt: '2026-05-13 09:12:19',
        note: '等待商戶確認。',
    },
])

const SEED_SETTLEMENT_DETAIL: SettlementDetail = {
    id: 'SET-202605-GD-001',
    merchant: 'Golden Dragon',
    merchantCode: 'MER-001',
    agent: 'Asia Master',
    cycle: '月結',
    period: '2026-05-01 ~ 2026-05-31',
    status: '待審核',
    currency: 'USDT',
    lockedBy: '-',
    generatedAt: '2026-05-21 18:24:12',
    updatedAt: '2026-05-21 18:24:12',
    owner: 'Finance Admin',
    note: '含一筆退款調整，需財務覆核後才能鎖定。',
    currencyRows: [
        { currency: 'USDT', bet: 1268800, win: 1195200, ggr: 73600, fxRate: '1.000000', settlementGgr: 73600, revenueShare: 0.32, receivable: 23552 },
        { currency: 'USD', bet: 182400, win: 175200, ggr: 7200, fxRate: '1.000000', settlementGgr: 7200, revenueShare: 0.32, receivable: 2304 },
        { currency: 'TWD', bet: 1680000, win: 1605200, ggr: 74800, fxRate: '0.031250', settlementGgr: 2337.5, revenueShare: 0.32, receivable: 748 },
    ],
    adjustmentRows: [
        { id: 'ADJ-001', type: '退款', amount: -1200, currency: 'USDT', reason: '異常注單退款', status: '待審核', applicant: 'Risk Admin' },
        { id: 'ADJ-002', type: '補單', amount: 0, currency: 'USDT', reason: '僅補交易紀錄，不調整金額', status: '已確認', applicant: 'Support Admin' },
        { id: 'ADJ-003', type: '人工折讓', amount: 800, currency: 'USD', reason: '商務協議調整', status: '待審核', applicant: 'Finance Admin' },
    ],
    auditRows: [
        { time: '2026-05-21 18:24:12', actor: 'System', action: '產生結算單', target: 'SET-202605-GD-001', result: '成功' },
        { time: '2026-05-21 19:10:44', actor: 'Merchant Admin', action: '下載對帳明細', target: 'SET-202605-GD-001', result: '成功' },
        { time: '2026-05-22 09:48:31', actor: 'Risk Admin', action: '送出退款調整', target: 'ADJ-001', result: '待審核' },
    ],
}

// ──────────────────────────────────────────────────────────────
// Handlers
// ──────────────────────────────────────────────────────────────

export const reportAdminHandlers = [
    http.get('/api/reports/v2/overview', async () => {
        await delay(250)
        return HttpResponse.json(SEED_OVERVIEW)
    }),
    http.get('/api/reports/v2/merchants', async () => {
        await delay(250)
        return HttpResponse.json(SEED_MERCHANTS)
    }),
    http.get('/api/reports/v2/agents', async () => {
        await delay(250)
        return HttpResponse.json(SEED_AGENTS)
    }),
    http.get('/api/reports/v2/games', async () => {
        await delay(250)
        return HttpResponse.json(SEED_GAMES)
    }),
    http.get('/api/reports/v2/rtp', async () => {
        await delay(250)
        return HttpResponse.json(SEED_RTP)
    }),
    http.get('/api/settlements/v2/list', async () => {
        await delay(300)
        return HttpResponse.json(SEED_SETTLEMENTS)
    }),
    http.get('/api/settlements/v2/detail/:id', async ({ params }) => {
        await delay(200)
        // Return the seed object — for demo, just return the same object regardless of id.
        // Override id field so frontend sees the requested id.
        return HttpResponse.json({
            ...SEED_SETTLEMENT_DETAIL,
            id: params.id,
        })
    }),
]
