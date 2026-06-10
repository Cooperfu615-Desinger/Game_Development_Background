import { http, HttpResponse, delay } from 'msw'
import { expandDemoRows } from '@/utils/demoRows'

// ──────────────────────────────────────────────────────────────
// Types (copied verbatim from the demo .vue files)
// ──────────────────────────────────────────────────────────────

// From OrderListView.vue
type OrderRow = {
    id: string
    roundId: string
    merchant: string
    playerId: string
    game: string
    gameType: string
    betAmount: string
    winAmount: string
    ggr: string
    currency: string
    settlementCurrency: string
    convertedGgr: string
    status: string
    riskStatus: string
    transactionStatus: string
    betAt: string
    settledAt: string
    result: string
    ip: string
    note: string
}

// From AbnormalOrdersView.vue
type AbnormalOrderRow = {
    caseId: string
    orderId: string
    roundId: string
    merchant: string
    playerId: string
    game: string
    gameType: string
    abnormalType: string
    betAmount: string
    winAmount: string
    ggr: string
    currency: string
    orderStatus: string
    processStatus: string
    riskLevel: string
    actionType: string
    assignee: string
    occurredAt: string
    lastActionAt: string
    playerIp: string
    gameResult: string
    reason: string
    suggestion: string
}

// From TransactionListView.vue
type TransactionRow = {
    id: string
    orderId: string
    merchant: string
    playerId: string
    type: string
    amount: string
    transactionCurrency: string
    walletCurrency: string
    status: string
    apiCode: string
    retryCount: number
    time: string
    nextRetryAt: string
    walletMode: string
    request: string
    response: string
    note: string
}

// From AbnormalTransactionsView.vue
type AbnormalTransactionRow = {
    caseId: string
    transactionId: string
    orderId: string
    merchant: string
    playerId: string
    type: string
    abnormalType: string
    amount: string
    currency: string
    apiCode: string
    retryCount: number
    status: string
    assignee: string
    occurredAt: string
    lastActionAt: string
    request: string
    response: string
    reason: string
    suggestion: string
}

// ──────────────────────────────────────────────────────────────
// Seed data (copied verbatim, with expandDemoRows applied)
// ──────────────────────────────────────────────────────────────

const SEED_ORDERS: OrderRow[] = expandDemoRows([
    {
        id: 'ORD-20260520-88421',
        roundId: 'RND-FT-20260520-0081',
        merchant: 'Golden Dragon',
        playerId: 'player_8831',
        game: 'Fortune Tiger',
        gameType: '老虎機',
        betAmount: 'USDT 12,000.00',
        winAmount: 'USDT 88,420.00',
        ggr: 'USDT -76,420.00',
        currency: 'USDT',
        settlementCurrency: 'USDT',
        convertedGgr: 'USDT -76,420.00',
        status: '已派彩',
        riskStatus: '高額中獎',
        transactionStatus: '已完成',
        betAt: '2026-05-20 10:38:12',
        settledAt: '2026-05-20 10:42:18',
        result: 'Grand Jackpot 命中',
        ip: '203.0.113.18',
        note: '關聯派發單 JP-PAY-20260520-001。',
    },
    {
        id: 'ORD-20260520-55102',
        roundId: 'RND-RS-20260520-0032',
        merchant: 'LuckyPlay',
        playerId: 'player_2109',
        game: 'Royal Spin',
        gameType: '老虎機',
        betAmount: 'TWD 8,000.00',
        winAmount: 'TWD 126,000.00',
        ggr: 'TWD -118,000.00',
        currency: 'TWD',
        settlementCurrency: 'USDT',
        convertedGgr: 'USDT -3,687.50',
        status: '派彩中',
        riskStatus: '錢包逾時',
        transactionStatus: '重試中',
        betAt: '2026-05-20 11:08:40',
        settledAt: '-',
        result: 'Free Spin 大獎',
        ip: '198.51.100.44',
        note: '錢包回應逾時，等待交易重送。',
    },
    {
        id: 'ORD-20260519-77218',
        roundId: 'RND-BC-20260519-0198',
        merchant: 'Nova Gaming',
        playerId: 'player_4420',
        game: 'Baccarat Pro',
        gameType: '桌遊',
        betAmount: 'USD 4,800.00',
        winAmount: 'USD 0.00',
        ggr: 'USD 4,800.00',
        currency: 'USD',
        settlementCurrency: 'USD',
        convertedGgr: 'USD 4,800.00',
        status: '已結算',
        riskStatus: '正常',
        transactionStatus: '已完成',
        betAt: '2026-05-19 22:16:03',
        settledAt: '2026-05-19 22:16:09',
        result: '莊家勝',
        ip: '192.0.2.77',
        note: '低額注單，自動結算。',
    },
    {
        id: 'ORD-20260518-32004',
        roundId: 'RND-CR-20260518-0049',
        merchant: 'Royal H5',
        playerId: 'player_7780',
        game: 'Crash Rocket',
        gameType: '小遊戲',
        betAmount: 'USDT 3,500.00',
        winAmount: 'USDT 0.00',
        ggr: 'USDT 3,500.00',
        currency: 'USDT',
        settlementCurrency: 'USDT',
        convertedGgr: 'USDT 3,500.00',
        status: '待確認',
        riskStatus: '風控覆核',
        transactionStatus: '人工處理',
        betAt: '2026-05-18 19:44:29',
        settledAt: '-',
        result: '局結果待覆核',
        ip: '203.0.113.205',
        note: '異常投注排除中，不可直接修改原始注單。',
    },
], 60)

const SEED_ABNORMAL_ORDERS: AbnormalOrderRow[] = expandDemoRows([
    {
        caseId: 'AOD-20260520-001',
        orderId: 'ORD-20260520-88421',
        roundId: 'RND-FT-20260520-0081',
        merchant: 'Golden Dragon',
        playerId: 'player_8831',
        game: 'Fortune Tiger',
        gameType: '老虎機',
        abnormalType: '高額派彩',
        betAmount: 'USDT 12,000.00',
        winAmount: 'USDT 88,420.00',
        ggr: 'USDT -76,420.00',
        currency: 'USDT',
        orderStatus: '已派彩',
        processStatus: '待確認',
        riskLevel: '高風險',
        actionType: '風控覆核',
        assignee: 'Iris Chen',
        occurredAt: '2026-05-20 10:42:18',
        lastActionAt: '2026-05-20 10:48:03',
        playerIp: '203.0.113.18',
        gameResult: 'Grand Jackpot 命中',
        reason: '單筆派彩超過商戶設定門檻，需確認遊戲結果與獎池流水。',
        suggestion: '比對遊戲結果、獎池派發紀錄與玩家行為後再結案。',
    },
    {
        caseId: 'AOD-20260520-002',
        orderId: 'ORD-20260520-55102',
        roundId: 'RND-RS-20260520-0032',
        merchant: 'LuckyPlay',
        playerId: 'player_2109',
        game: 'Royal Spin',
        gameType: '老虎機',
        abnormalType: '派彩逾時',
        betAmount: 'TWD 8,000.00',
        winAmount: 'TWD 126,000.00',
        ggr: 'TWD -118,000.00',
        currency: 'TWD',
        orderStatus: '派彩中',
        processStatus: '待處理',
        riskLevel: '中風險',
        actionType: '補單',
        assignee: 'Mia Chen',
        occurredAt: '2026-05-20 11:08:40',
        lastActionAt: '2026-05-20 11:12:05',
        playerIp: '198.51.100.44',
        gameResult: 'Free Spin 完成',
        reason: '遊戲端已完成派彩，但錢包交易逾時未完成入帳。',
        suggestion: '確認交易紀錄後建立補單，正式環境需送審。',
    },
    {
        caseId: 'AOD-20260519-003',
        orderId: 'ORD-20260519-77218',
        roundId: 'RND-BC-20260519-0198',
        merchant: 'Nova Gaming',
        playerId: 'player_4420',
        game: 'Baccarat Pro',
        gameType: '真人',
        abnormalType: '結果不一致',
        betAmount: 'USD 4,800.00',
        winAmount: 'USD 0.00',
        ggr: 'USD 4,800.00',
        currency: 'USD',
        orderStatus: '已結算',
        processStatus: '人工處理',
        riskLevel: '高風險',
        actionType: '退款',
        assignee: 'Alex Wang',
        occurredAt: '2026-05-19 22:16:03',
        lastActionAt: '2026-05-19 22:21:19',
        playerIp: '192.0.2.77',
        gameResult: '遊戲結果重送',
        reason: '遊戲結果與原局號回傳內容不一致，需保留原始注單並建立調整流程。',
        suggestion: '凍結原始注單結果，建立退款審核單並附上 API Trace。',
    },
    {
        caseId: 'AOD-20260518-004',
        orderId: 'ORD-20260518-32004',
        roundId: 'RND-CR-20260518-0049',
        merchant: 'Royal H5',
        playerId: 'player_7780',
        game: 'Crash Rocket',
        gameType: '即時遊戲',
        abnormalType: '重複下注',
        betAmount: 'USDT 3,500.00',
        winAmount: 'USDT 0.00',
        ggr: 'USDT 3,500.00',
        currency: 'USDT',
        orderStatus: '交易異常',
        processStatus: '待處理',
        riskLevel: '中風險',
        actionType: '風控標記',
        assignee: '未指派',
        occurredAt: '2026-05-18 19:44:29',
        lastActionAt: '2026-05-18 19:48:02',
        playerIp: '203.0.113.205',
        gameResult: '回合終止',
        reason: '同玩家、同局號短時間內出現重複下注交易。',
        suggestion: '比對交易冪等鍵與下注 API Request，必要時標記玩家風險。',
    },
], 60)

const SEED_TRANSACTIONS: TransactionRow[] = expandDemoRows([
    {
        id: 'TX-WLT-20260520-88421',
        orderId: 'ORD-20260520-88421',
        merchant: 'Golden Dragon',
        playerId: 'player_8831',
        type: '派彩',
        amount: 'USDT 88,420.00',
        transactionCurrency: 'USDT',
        walletCurrency: 'USDT',
        status: '已完成',
        apiCode: '200',
        retryCount: 0,
        time: '2026-05-20 10:42:18',
        nextRetryAt: '-',
        walletMode: '轉帳錢包',
        request: '{"merchant":"MER-001","playerId":"player_8831","amount":88420,"currency":"USDT","type":"payout"}',
        response: '{"code":200,"message":"success","walletBalance":183020.45}',
        note: '對應 Jackpot 派發，交易已完成並回寫注單。',
    },
    {
        id: 'TX-WLT-20260520-55102',
        orderId: 'ORD-20260520-55102',
        merchant: 'LuckyPlay',
        playerId: 'player_2109',
        type: '派彩',
        amount: 'TWD 126,000.00',
        transactionCurrency: 'TWD',
        walletCurrency: 'TWD',
        status: '重試中',
        apiCode: '504',
        retryCount: 3,
        time: '2026-05-20 11:09:14',
        nextRetryAt: '2026-05-20 11:14:14',
        walletMode: '轉帳錢包',
        request: '{"merchant":"MER-002","playerId":"player_2109","amount":126000,"currency":"TWD","type":"payout"}',
        response: '{"code":504,"message":"wallet timeout","retryable":true}',
        note: '錢包 API 逾時，系統依重試策略排程中。',
    },
    {
        id: 'TX-WLT-20260519-77218',
        orderId: 'ORD-20260519-77218',
        merchant: 'Nova Gaming',
        playerId: 'player_4420',
        type: '扣款',
        amount: 'USD 4,800.00',
        transactionCurrency: 'USD',
        walletCurrency: 'USD',
        status: '已完成',
        apiCode: '200',
        retryCount: 0,
        time: '2026-05-19 22:16:03',
        nextRetryAt: '-',
        walletMode: '單一錢包',
        request: '{"merchant":"MER-003","playerId":"player_4420","amount":4800,"currency":"USD","type":"bet"}',
        response: '{"code":200,"message":"success","walletBalance":5200}',
        note: '一般投注扣款，無異常。',
    },
    {
        id: 'TX-WLT-20260518-32004',
        orderId: 'ORD-20260518-32004',
        merchant: 'Royal H5',
        playerId: 'player_7780',
        type: '扣款',
        amount: 'USDT 3,500.00',
        transactionCurrency: 'USDT',
        walletCurrency: 'USDT',
        status: '人工處理',
        apiCode: '409',
        retryCount: 2,
        time: '2026-05-18 19:44:29',
        nextRetryAt: '-',
        walletMode: '轉帳錢包',
        request: '{"merchant":"MER-004","playerId":"player_7780","amount":3500,"currency":"USDT","type":"bet"}',
        response: '{"code":409,"message":"duplicate transaction detected","retryable":false}',
        note: '錢包回覆重複交易，已停止自動重試並等待人工確認。',
    },
    {
        id: 'TX-TRF-20260518-11890',
        orderId: '-',
        merchant: 'Golden Dragon',
        playerId: 'player_8831',
        type: '轉入',
        amount: 'USDT 20,000.00',
        transactionCurrency: 'USDT',
        walletCurrency: 'USDT',
        status: '已完成',
        apiCode: '200',
        retryCount: 0,
        time: '2026-05-18 15:20:10',
        nextRetryAt: '-',
        walletMode: '轉帳錢包',
        request: '{"merchant":"MER-001","playerId":"player_8831","amount":20000,"currency":"USDT","type":"transfer_in"}',
        response: '{"code":200,"message":"success","transferBalance":20000}',
        note: '玩家由商戶錢包轉入遊戲錢包，建立可投注餘額。',
    },
    {
        id: 'TX-TRF-20260518-11904',
        orderId: '-',
        merchant: 'Golden Dragon',
        playerId: 'player_8831',
        type: '轉出',
        amount: 'USDT -12,500.00',
        transactionCurrency: 'USDT',
        walletCurrency: 'USDT',
        status: '已完成',
        apiCode: '200',
        retryCount: 0,
        time: '2026-05-18 16:03:42',
        nextRetryAt: '-',
        walletMode: '轉帳錢包',
        request: '{"merchant":"MER-001","playerId":"player_8831","amount":12500,"currency":"USDT","type":"transfer_out"}',
        response: '{"code":200,"message":"success","transferBalance":7500}',
        note: '玩家由遊戲錢包轉出回商戶錢包，非注單交易但需納入對帳。',
    },
], 60)

const SEED_ABNORMAL_TXS: AbnormalTransactionRow[] = expandDemoRows([
    {
        caseId: 'ATX-20260520-001',
        transactionId: 'TX-WLT-20260520-55102',
        orderId: 'ORD-20260520-55102',
        merchant: 'LuckyPlay',
        playerId: 'player_2109',
        type: '派彩',
        abnormalType: '錢包逾時',
        amount: 'TWD 126,000.00',
        currency: 'TWD',
        apiCode: '504',
        retryCount: 3,
        status: '重試中',
        assignee: 'Mia Chen',
        occurredAt: '2026-05-20 11:09:14',
        lastActionAt: '2026-05-20 11:14:14',
        request: '{"merchant":"MER-002","playerId":"player_2109","amount":126000,"currency":"TWD","type":"payout"}',
        response: '{"code":504,"message":"wallet timeout","retryable":true}',
        reason: '商戶錢包 API 回應逾時，系統已依策略自動重試。',
        suggestion: '確認商戶錢包服務狀態；若下一次重試仍失敗，改為人工處理。',
    },
    {
        caseId: 'ATX-20260518-004',
        transactionId: 'TX-WLT-20260518-32004',
        orderId: 'ORD-20260518-32004',
        merchant: 'Royal H5',
        playerId: 'player_7780',
        type: '扣款',
        abnormalType: '重複交易',
        amount: 'USDT 3,500.00',
        currency: 'USDT',
        apiCode: '409',
        retryCount: 2,
        status: '人工處理',
        assignee: 'Alex Wang',
        occurredAt: '2026-05-18 19:44:29',
        lastActionAt: '2026-05-18 19:48:02',
        request: '{"merchant":"MER-004","playerId":"player_7780","amount":3500,"currency":"USDT","type":"bet"}',
        response: '{"code":409,"message":"duplicate transaction detected","retryable":false}',
        reason: '商戶錢包回覆重複交易，需比對原交易與錢包流水。',
        suggestion: '停止自動重送，檢查冪等鍵與商戶錢包流水後再結案。',
    },
    {
        caseId: 'ATX-20260518-006',
        transactionId: 'TX-TRF-20260518-11904',
        orderId: '-',
        merchant: 'Golden Dragon',
        playerId: 'player_8831',
        type: '轉出',
        abnormalType: '轉帳差異',
        amount: 'USDT -12,500.00',
        currency: 'USDT',
        apiCode: '200',
        retryCount: 0,
        status: '待確認',
        assignee: 'Iris Chen',
        occurredAt: '2026-05-18 16:03:42',
        lastActionAt: '2026-05-18 16:06:18',
        request: '{"merchant":"MER-001","playerId":"player_8831","amount":12500,"currency":"USDT","type":"transfer_out"}',
        response: '{"code":200,"message":"success","merchantBalanceDelta":-12490}',
        reason: '遊戲錢包轉出金額與商戶錢包入帳金額差異 10 USDT。',
        suggestion: '比對匯率、小數位與手續費設定；必要時建立調整單。',
    },
    {
        caseId: 'ATX-20260517-002',
        transactionId: 'TX-TRF-20260517-77411',
        orderId: '-',
        merchant: 'Nova Gaming',
        playerId: 'player_4420',
        type: '轉入',
        abnormalType: '餘額不足',
        amount: 'USD 8,000.00',
        currency: 'USD',
        apiCode: '402',
        retryCount: 1,
        status: '待處理',
        assignee: '未指派',
        occurredAt: '2026-05-17 09:32:11',
        lastActionAt: '2026-05-17 09:33:20',
        request: '{"merchant":"MER-003","playerId":"player_4420","amount":8000,"currency":"USD","type":"transfer_in"}',
        response: '{"code":402,"message":"insufficient merchant wallet balance","retryable":false}',
        reason: '商戶錢包餘額不足，轉入遊戲錢包失敗。',
        suggestion: '通知商戶補足錢包餘額後再由營運重新觸發轉入。',
    },
], 60)

// ──────────────────────────────────────────────────────────────
// Handlers
// ──────────────────────────────────────────────────────────────

export const orderAdminHandlers = [
    http.get('/api/orders/v2/list', async () => {
        await delay(250)
        return HttpResponse.json(SEED_ORDERS)
    }),
    http.get('/api/orders/v2/abnormal', async () => {
        await delay(250)
        return HttpResponse.json(SEED_ABNORMAL_ORDERS)
    }),
    http.get('/api/transactions/v2/list', async () => {
        await delay(250)
        return HttpResponse.json(SEED_TRANSACTIONS)
    }),
    http.get('/api/transactions/v2/abnormal', async () => {
        await delay(250)
        return HttpResponse.json(SEED_ABNORMAL_TXS)
    }),
]
