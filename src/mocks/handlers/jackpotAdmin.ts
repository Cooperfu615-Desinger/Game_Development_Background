import { http, HttpResponse, delay } from 'msw'
import { expandDemoRows, rebaseDemoDates } from '@/utils/demoRows'

// ──────────────────────────────────────────────────────────────
// Types (copied verbatim from the demo .vue files)
// ──────────────────────────────────────────────────────────────

// From JackpotListView.vue
type JackpotRow = {
    code: string
    name: string
    type: string
    currency: string
    balance: string
    contributionRate: number
    payoutRule: string
    boundGames: number
    merchants: number
    status: string
    reviewStatus: string
    updatedAt: string
    maintainer: string
    note: string
}

// From JackpotSettingsView.vue (settings reactive object — type derived verbatim)
type JackpotSettings = {
    defaultCurrency: string
    settlementCurrency: string
    allowMultiCurrency: boolean
    requirePayoutReview: boolean
    requireManualAdjustReview: boolean
    reserveOriginalCurrencyReport: boolean
    balanceAlertThreshold: number
    maxManualAdjustAmount: number
    auditRetentionDays: number
    effectiveEnvironment: string
}

// From JackpotSettingsView.vue (demo uses `RuleTemplate`; aliased to `JackpotRuleTemplate` for API consistency)
type JackpotRuleTemplate = {
    id: string
    name: string
    type: string
    currency: string
    contributionRate: number
    triggerMode: string
    payoutCap: number
    reviewRequired: boolean
    status: string
    updatedAt: string
}

// From JackpotSettingsView.vue (demo uses `ScheduleTemplate`; aliased to `JackpotScheduleTemplate` for API consistency)
type JackpotScheduleTemplate = {
    id: string
    name: string
    cycle: string
    timeWindow: string
    scope: string
    status: string
}

// From JackpotTransactionsView.vue
type JackpotTransactionRow = {
    id: string
    jackpot: string
    merchant: string
    game: string
    type: string
    direction: 'in' | 'out'
    amount: string
    currency: string
    balanceBefore: string
    balanceAfter: string
    relatedNo: string
    operator: string
    status: string
    reconciled: string
    occurredAt: string
    reason: string
}

// From JackpotPayoutsView.vue (demo uses `PayoutRow`; aliased to `JackpotPayoutRow` for API consistency)
type JackpotPayoutRow = {
    id: string
    jackpot: string
    merchant: string
    game: string
    playerId: string
    orderId: string
    payoutAmount: string
    currency: string
    status: string
    reviewStatus: string
    payoutAt: string
    reviewer: string
    walletTxId: string
    note: string
}

// ──────────────────────────────────────────────────────────────
// Seed data (verbatim from demo .vue files)
// ──────────────────────────────────────────────────────────────

const SEED_LIST: JackpotRow[] = expandDemoRows([
    {
        code: 'JP-GRAND-USDT',
        name: 'Grand Jackpot',
        type: '全域累積',
        currency: 'USDT',
        balance: 'USDT 895,526.80',
        contributionRate: 1.2,
        payoutRule: '隨機觸發 + 高額雙審',
        boundGames: 18,
        merchants: 12,
        status: '啟用',
        reviewStatus: '已完成',
        updatedAt: '2026-05-20 11:02:18',
        maintainer: 'Ops Lead',
        note: '正式主獎池，金額異動需審核。',
    },
    {
        code: 'JP-DAILY-TWD',
        name: 'Daily Drop',
        type: '每日派發',
        currency: 'TWD',
        balance: 'TWD 1,233,400.00',
        contributionRate: 0.8,
        payoutRule: '每日固定時段派發',
        boundGames: 9,
        merchants: 6,
        status: '觀察中',
        reviewStatus: '待審核',
        updatedAt: '2026-05-20 11:20:05',
        maintainer: 'Finance Lead',
        note: '錢包逾時回補後等待覆核。',
    },
    {
        code: 'JP-MINOR-USD',
        name: 'Minor Pool',
        type: '小額累積',
        currency: 'USD',
        balance: 'USD 69,252.70',
        contributionRate: 0.35,
        payoutRule: '低額自動派發',
        boundGames: 6,
        merchants: 4,
        status: '啟用',
        reviewStatus: '已完成',
        updatedAt: '2026-05-19 22:30:31',
        maintainer: 'Ops Reviewer',
        note: '低額獎池，允許自動派發。',
    },
    {
        code: 'JP-ROYAL-USDT',
        name: 'Royal Jackpot',
        type: '指定商戶',
        currency: 'USDT',
        balance: 'USDT 210,880.00',
        contributionRate: 1.5,
        payoutRule: '指定商戶活動池',
        boundGames: 4,
        merchants: 1,
        status: '維護中',
        reviewStatus: '待審核',
        updatedAt: '2026-05-18 19:58:40',
        maintainer: 'Risk Lead',
        note: '活動結束後需確認是否封存。',
    },
])

const SEED_SETTINGS: JackpotSettings = {
    defaultCurrency: 'USDT',
    settlementCurrency: 'USDT',
    allowMultiCurrency: true,
    requirePayoutReview: true,
    requireManualAdjustReview: true,
    reserveOriginalCurrencyReport: true,
    balanceAlertThreshold: 100000,
    maxManualAdjustAmount: 5000,
    auditRetentionDays: 365,
    effectiveEnvironment: '正式',
}

// Rule templates are a small config-like set — no expandDemoRows.
const SEED_RULE_TEMPLATES: JackpotRuleTemplate[] = [
    {
        id: 'JPR-GRAND-USDT',
        name: 'Grand Jackpot 標準規則',
        type: '全域累積',
        currency: 'USDT',
        contributionRate: 1.2,
        triggerMode: '隨機觸發',
        payoutCap: 250000,
        reviewRequired: true,
        status: '啟用',
        updatedAt: '2026-05-20 11:02:18',
    },
    {
        id: 'JPR-DAILY-TWD',
        name: 'Daily Drop 每日派發',
        type: '每日派發',
        currency: 'TWD',
        contributionRate: 0.8,
        triggerMode: '固定時段',
        payoutCap: 500000,
        reviewRequired: true,
        status: '待審核',
        updatedAt: '2026-05-20 11:20:05',
    },
    {
        id: 'JPR-MINOR-USD',
        name: 'Minor Pool 小額自動',
        type: '小額累積',
        currency: 'USD',
        contributionRate: 0.35,
        triggerMode: '下注觸發',
        payoutCap: 10000,
        reviewRequired: false,
        status: '啟用',
        updatedAt: '2026-05-19 22:30:31',
    },
]

// Schedule templates are a small config-like set — no expandDemoRows.
const SEED_SCHEDULE_TEMPLATES: JackpotScheduleTemplate[] = [
    { id: 'SCH-DAILY-RESET', name: '每日重算視窗', cycle: '每日', timeWindow: '05:00:00 - 05:30:00', scope: '全部獎池', status: '啟用' },
    { id: 'SCH-WEEKLY-AUDIT', name: '週對帳鎖定', cycle: '每週', timeWindow: '週一 03:00:00 - 04:00:00', scope: '正式獎池', status: '啟用' },
    { id: 'SCH-MONTHLY-ARCHIVE', name: '月封存檢查', cycle: '每月', timeWindow: '1 日 02:00:00 - 03:00:00', scope: '封存候選', status: '待審核' },
]

const SEED_TRANSACTIONS: JackpotTransactionRow[] = expandDemoRows([
    {
        id: 'JP-TX-20260520-0188',
        jackpot: 'Grand Jackpot',
        merchant: 'Golden Dragon',
        game: 'Fortune Tiger',
        type: '投注累積',
        direction: 'in',
        amount: 'USDT 1,842.00',
        currency: 'USDT',
        balanceBefore: 'USDT 982,104.80',
        balanceAfter: 'USDT 983,946.80',
        relatedNo: 'ORD-20260520-88421',
        operator: 'System',
        status: '已入帳',
        reconciled: '已完成',
        occurredAt: '2026-05-20 10:38:12',
        reason: '依 Grand Jackpot 累積比例自動入池。',
    },
    {
        id: 'JP-TX-20260520-0189',
        jackpot: 'Grand Jackpot',
        merchant: 'Golden Dragon',
        game: 'Fortune Tiger',
        type: '獎池派發',
        direction: 'out',
        amount: 'USDT 88,420.00',
        currency: 'USDT',
        balanceBefore: 'USDT 983,946.80',
        balanceAfter: 'USDT 895,526.80',
        relatedNo: 'JP-PAY-20260520-001',
        operator: 'System',
        status: '已扣帳',
        reconciled: '已完成',
        occurredAt: '2026-05-20 10:42:18',
        reason: '命中 Jackpot 後自動派發至玩家錢包。',
    },
    {
        id: 'JP-TX-20260520-0190',
        jackpot: 'Daily Drop',
        merchant: 'LuckyPlay',
        game: 'Royal Spin',
        type: '人工回補',
        direction: 'in',
        amount: 'TWD 25,000.00',
        currency: 'TWD',
        balanceBefore: 'TWD 1,208,400.00',
        balanceAfter: 'TWD 1,233,400.00',
        relatedNo: 'APR-20260520-022',
        operator: 'Finance Lead',
        status: '已入帳',
        reconciled: '待審核',
        occurredAt: '2026-05-20 11:20:05',
        reason: '錢包逾時後補回 Daily Drop 池額，等待財務覆核。',
    },
    {
        id: 'JP-TX-20260519-0137',
        jackpot: 'Minor Pool',
        merchant: 'Nova Gaming',
        game: 'Baccarat Pro',
        type: '比例調整',
        direction: 'in',
        amount: 'USD 312.50',
        currency: 'USD',
        balanceBefore: 'USD 68,940.20',
        balanceAfter: 'USD 69,252.70',
        relatedNo: 'CFG-20260519-007',
        operator: 'Ops Reviewer',
        status: '已入帳',
        reconciled: '已完成',
        occurredAt: '2026-05-19 22:30:31',
        reason: '投注累積比例更新後，依差額補入。',
    },
    {
        id: 'JP-TX-20260518-0094',
        jackpot: 'Grand Jackpot',
        merchant: 'Royal H5',
        game: 'Crash Rocket',
        type: '人工調整',
        direction: 'out',
        amount: 'USDT 3,500.00',
        currency: 'USDT',
        balanceBefore: 'USDT 899,026.80',
        balanceAfter: 'USDT 895,526.80',
        relatedNo: 'APR-20260518-018',
        operator: 'Risk Lead',
        status: '處理中',
        reconciled: '待審核',
        occurredAt: '2026-05-18 19:58:40',
        reason: '異常投注排除後，需人工調整獎池餘額。',
    },
])

const SEED_PAYOUTS: JackpotPayoutRow[] = expandDemoRows([
    {
        id: 'JP-PAY-20260520-001',
        jackpot: 'Grand Jackpot',
        merchant: 'Golden Dragon',
        game: 'Fortune Tiger',
        playerId: 'player_8831',
        orderId: 'ORD-20260520-88421',
        payoutAmount: 'USDT 88,420.00',
        currency: 'USDT',
        status: '已派發',
        reviewStatus: '已完成',
        payoutAt: '2026-05-20 10:42:18',
        reviewer: 'Finance Lead',
        walletTxId: 'TX-JP-88421',
        note: '自動派發成功，已關聯注單與錢包交易。',
    },
    {
        id: 'JP-PAY-20260520-002',
        jackpot: 'Daily Drop',
        merchant: 'LuckyPlay',
        game: 'Royal Spin',
        playerId: 'player_2109',
        orderId: 'ORD-20260520-55102',
        payoutAmount: 'TWD 126,000.00',
        currency: 'TWD',
        status: '處理中',
        reviewStatus: '待審核',
        payoutAt: '2026-05-20 11:08:40',
        reviewer: '-',
        walletTxId: 'TX-JP-55102',
        note: '錢包回應逾時，等待人工確認後重送。',
    },
    {
        id: 'JP-PAY-20260519-003',
        jackpot: 'Minor Pool',
        merchant: 'Nova Gaming',
        game: 'Baccarat Pro',
        playerId: 'player_4420',
        orderId: 'ORD-20260519-77218',
        payoutAmount: 'USD 4,800.00',
        currency: 'USD',
        status: '已派發',
        reviewStatus: '已完成',
        payoutAt: '2026-05-19 22:16:03',
        reviewer: 'Ops Reviewer',
        walletTxId: 'TX-JP-77218',
        note: '低額派發，依規則自動通過。',
    },
    {
        id: 'JP-PAY-20260518-004',
        jackpot: 'Grand Jackpot',
        merchant: 'Royal H5',
        game: 'Crash Rocket',
        playerId: 'player_7780',
        orderId: 'ORD-20260518-32004',
        payoutAmount: 'USDT 210,000.00',
        currency: 'USDT',
        status: '待處理',
        reviewStatus: '待審核',
        payoutAt: '2026-05-18 19:44:29',
        reviewer: '-',
        walletTxId: '-',
        note: '高額 Jackpot 派發，需財務與風控雙審。',
    },
])

// ──────────────────────────────────────────────────────────────
// Handlers
// ──────────────────────────────────────────────────────────────

export const jackpotAdminHandlers = [
    http.get('/api/jackpot/v2/list', async () => {
        await delay(250)
        return HttpResponse.json(SEED_LIST)
    }),
    http.get('/api/jackpot/v2/settings', async () => {
        await delay(200)
        return HttpResponse.json(rebaseDemoDates({
            settings: SEED_SETTINGS,
            ruleTemplates: SEED_RULE_TEMPLATES,
            scheduleTemplates: SEED_SCHEDULE_TEMPLATES,
        }))
    }),
    http.get('/api/jackpot/v2/transactions', async () => {
        await delay(250)
        return HttpResponse.json(SEED_TRANSACTIONS)
    }),
    http.get('/api/jackpot/v2/payouts', async () => {
        await delay(250)
        return HttpResponse.json(SEED_PAYOUTS)
    }),
]
