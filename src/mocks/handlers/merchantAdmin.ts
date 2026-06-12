import { http, HttpResponse, delay } from 'msw'
import { expandDemoRows } from '@/utils/demoRows'
import { scopeRows } from '@/mocks/scope'

// ──────────────────────────────────────────────────────────────
// Types (fields copied verbatim from the demo merchantRows seed)
// ──────────────────────────────────────────────────────────────

// From demo mock.ts merchantRows
type MerchantRow = {
    code: string
    name: string
    agent: string
    status: string
    currencies: string[]
    defaultCurrency: string
    settlementCurrency: string
    languages: string[]
    environmentMode: string
    walletType: string
    apiStatus: string
    gameCount: number
    gameLaunchEnabled: boolean
    availableGames: string[]
    gameLimitTemplate: string
    merchantRtpMode: string
    merchantMathScope: string
    rtpValue: number
    revenueType: string
    revenueShare: string
    bet: string
    ggr: string
    rtp: string
    createdAt: string
    apiKey: string
    secretKey: string
    walletApi: string
    callbackUrl: string
    contact: string
    note: string
}

// ──────────────────────────────────────────────────────────────
// Seed data (verbatim from demo mock.ts merchantRows)
// ──────────────────────────────────────────────────────────────

// 商戶名稱池（QA C-2）：expandDemoRows 把 4 筆基底循環成 60 筆時只變動 id/數字、
// 不變 name，使 base[0]（Golden Dragon / agent=Asia Master）的 15 個複本全叫
// Golden Dragon。改用名稱池依陣列 index 分散：agent 群落在 index 0,4,8,…,56（步進 4），
// 與池長 15 互質 → 15 筆殘差全異 → 每個 agent 視角下 15 筆名稱皆不同。
// 前 4 個沿用原 demo 名稱（含 index 0 = Golden Dragon，與 merchant token actorName 對齊）。
// 只改 name，不動 agent/code → scope 過濾（agentKey:'agent' / merchantKey:'code'）不受影響。
const MERCHANT_NAME_POOL = [
    'Golden Dragon', 'LuckyPlay', 'Nova Gaming', 'Royal H5', 'Silver Phoenix',
    'Jade Palace', 'Thunder Spin', 'Ocean Star', 'Crimson Lotus', 'Imperial Win',
    'Neon Tiger', 'Azure Fortune', 'Mystic Reels', 'Diamond Crown', 'Sunset Jackpot',
]

const SEED_LIST: MerchantRow[] = expandDemoRows([
    {
        code: 'MER-001',
        name: 'Golden Dragon',
        agent: 'Asia Master',
        status: '警示',
        currencies: ['USDT', 'USD'],
        defaultCurrency: 'USDT',
        settlementCurrency: 'USDT',
        languages: ['繁中', '英文'],
        environmentMode: '正式',
        walletType: '轉帳',
        apiStatus: '警示',
        gameCount: 42,
        gameLaunchEnabled: true,
        availableGames: ['GAME-001 Fortune Tiger', 'GAME-002 Royal Spin', 'GAME-003 Baccarat Pro'],
        gameLimitTemplate: '高額限額',
        merchantRtpMode: '商戶專屬 RTP',
        merchantMathScope: '商戶專屬版本',
        rtpValue: 104.07,
        revenueType: 'GGR 分潤',
        revenueShare: '18.00%',
        bet: '31,420,000',
        ggr: '-1,280,000',
        rtp: '104.07%',
        createdAt: '2026-01-18 09:30',
        apiKey: 'pk_live_golden_demo_key',
        secretKey: 'sk_live_golden_secret_once',
        walletApi: 'https://wallet.golden.example/api',
        callbackUrl: 'https://wallet.golden.example/callback',
        contact: 'Evan Lin',
        note: 'RTP 偏離待審核',
    },
    {
        code: 'MER-002',
        name: 'LuckyPlay',
        agent: 'Prime Network',
        status: '啟用',
        currencies: ['TWD'],
        defaultCurrency: 'TWD',
        settlementCurrency: 'USDT',
        languages: ['繁中'],
        environmentMode: '正式',
        walletType: '單一',
        apiStatus: '啟用',
        gameCount: 36,
        gameLaunchEnabled: true,
        availableGames: ['GAME-001 Fortune Tiger', 'GAME-002 Royal Spin'],
        gameLimitTemplate: '標準限額',
        merchantRtpMode: '沿用遊戲預設',
        merchantMathScope: '依遊戲版本',
        rtpValue: 91.78,
        revenueType: '流水',
        revenueShare: '2.50%',
        bet: '28,102,500',
        ggr: '2,310,400',
        rtp: '91.78%',
        createdAt: '2026-02-04 14:12',
        apiKey: 'pk_live_lucky_demo_key',
        secretKey: 'sk_live_lucky_secret_once',
        walletApi: 'https://wallet.lucky.example/api',
        callbackUrl: 'https://wallet.lucky.example/callback',
        contact: 'Nina Wu',
        note: '月結商戶',
    },
    {
        code: 'MER-003',
        name: 'Nova Gaming',
        agent: 'Nova Agent',
        status: '啟用',
        currencies: ['USD', 'USDT'],
        defaultCurrency: 'USD',
        settlementCurrency: 'USD',
        languages: ['英文', '泰文'],
        environmentMode: '測試',
        walletType: '轉帳',
        apiStatus: '啟用',
        gameCount: 28,
        gameLaunchEnabled: true,
        availableGames: ['GAME-001 Fortune Tiger', 'GAME-003 Baccarat Pro', 'GAME-004 Crash Rocket'],
        gameLimitTemplate: '低風險限額',
        merchantRtpMode: '沿用遊戲預設',
        merchantMathScope: '全商戶預設',
        rtpValue: 95.26,
        revenueType: 'GGR 分潤',
        revenueShare: '15.00%',
        bet: '18,802,110',
        ggr: '892,000',
        rtp: '95.26%',
        createdAt: '2026-03-11 16:40',
        apiKey: 'pk_live_nova_demo_key',
        secretKey: 'sk_live_nova_secret_once',
        walletApi: 'https://wallet.nova.example/api',
        callbackUrl: 'https://wallet.nova.example/callback',
        contact: 'Mia Stone',
        note: '正式 API 正常',
    },
    {
        code: 'MER-004',
        name: 'Royal H5',
        agent: 'Royal Partner',
        status: '待審核',
        currencies: ['USDT', 'TWD'],
        defaultCurrency: 'USDT',
        settlementCurrency: 'USDT',
        languages: ['繁中', '越南文'],
        environmentMode: '測試',
        walletType: '單一',
        apiStatus: '待審核',
        gameCount: 19,
        gameLaunchEnabled: false,
        availableGames: ['GAME-002 Royal Spin'],
        gameLimitTemplate: '標準限額',
        merchantRtpMode: '待審核版本',
        merchantMathScope: '商戶專屬版本',
        rtpValue: 105.16,
        revenueType: '固定',
        revenueShare: '0.00%',
        bet: '12,402,800',
        ggr: '-640,200',
        rtp: '105.16%',
        createdAt: '2026-04-22 11:05',
        apiKey: 'pk_live_royal_demo_key',
        secretKey: 'sk_live_royal_secret_once',
        walletApi: 'https://wallet.royal.example/api',
        callbackUrl: 'https://wallet.royal.example/callback',
        contact: 'Alex Wang',
        note: '回呼設定待審核',
    },
], 60).map((row, index) => ({
    ...row,
    name: MERCHANT_NAME_POOL[index % MERCHANT_NAME_POOL.length]!,
}))

// ──────────────────────────────────────────────────────────────
// Handlers
// ──────────────────────────────────────────────────────────────

export const merchantAdminHandlers = [
    http.get('/api/merchants/v2/list', async ({ request }) => {
        await delay(250)
        return HttpResponse.json(scopeRows(request, SEED_LIST, { agentKey: 'agent', merchantKey: 'code' }))
    }),
]
