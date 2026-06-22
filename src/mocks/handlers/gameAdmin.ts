import { http, HttpResponse, delay } from 'msw'
import { expandDemoRows, rebaseDemoDates } from '@/utils/demoRows'

// ──────────────────────────────────────────────────────────────
// Types (copied verbatim from the .vue files)
// ──────────────────────────────────────────────────────────────

// From Settings.vue
type MaintenanceTemplate = {
    name: string
    cycle: string
    day: string
    start: string
    end: string
    scope: string
    enabled: boolean
}

type LimitTemplate = {
    name: string
    currencies: string[]
    minBet: number
    maxBet: number
    maxPayout: number
    enabled: boolean
}

type BaseSettings = {
    gameTypes: string[]
    platforms: string[]
    languages: string[]
    defaultMaintenanceCycle: string
    requireApprovalForProduction: boolean
}

// From Index.vue (game list, demo gameRows shape)
type GameRow = {
    code: string
    name: string
    type: string
    status: string
    environmentMode: string
    platform: string[]
    currencies: string[]
    languages: string[]
    version: string
    mathVersion: string
    rtp: string
    volatility: string
    merchantCount: number
    visibleMerchants: string[]
    limitTemplates: string[]
    defaultLimitTemplate: string
    minBet: number
    maxBet: number
    maintenance: boolean
    maintenanceStart: string
    maintenanceEnd: string
    technicalOwner: string
    packageId: string
    assetVersion: string
    note: string
}

// From Math.vue
type MathRow = {
    id: string
    game: string
    version: string
    theoreticalRtp: number
    actualRtp: number
    deviation: number
    volatility: string
    status: string
    effectiveScope: string
    sampleBets: number
    reviewNo: string
    reviewer: string
    updatedAt: string
    note: string
}

// From Versions.vue
type VersionRow = {
    id: string
    game: string
    version: string
    assetVersion: string
    status: string
    releaseType: string
    releaseAt: string
    scope: string
    affectedMerchants: number
    rollbackTarget: string
    owner: string
    summary: string
    changeLog: string[]
}

// From Assets.vue
type AssetRow = {
    id: string
    game: string
    type: string
    locale: string
    version: string
    size: string
    fileSize: string
    status: string
    relatedVersion: string
    updatedAt: string
    owner: string
    palette: string
    note: string
}

// From MerchantAccess.vue
type AccessRow = {
    id: string
    merchant: string
    agent: string
    game: string
    gameType: string
    environment: string
    enabled: boolean
    status: string
    limitTemplates: string[]
    rtpMode: string
    launchUrl: string
    updatedAt: string
    pendingReview: boolean
    note: string
}

// ──────────────────────────────────────────────────────────────
// Seed data
// ──────────────────────────────────────────────────────────────

// Settings.vue uses Date objects but JSON cannot serialize Date,
// so return ISO string. Frontend will parse to Date on receive.
function timeAt(hour: number, minute = 0): string {
    const v = new Date()
    v.setHours(hour, minute, 0, 0)
    return v.toISOString()
}

const SEED_MAINTENANCE: MaintenanceTemplate[] = [
    { name: '每日例行維護', cycle: '每日', day: '每日', start: timeAt(3), end: timeAt(4), scope: '全部遊戲', enabled: true },
    { name: '每週版本窗口', cycle: '每週', day: '週三', start: timeAt(2), end: timeAt(5), scope: '指定遊戲', enabled: true },
    { name: '每月結算維護', cycle: '每月', day: '每月 1 日', start: timeAt(1), end: timeAt(3), scope: '全部遊戲', enabled: false },
]

const SEED_LIMITS: LimitTemplate[] = [
    { name: '標準限額', currencies: ['USDT', 'USD'], minBet: 1, maxBet: 5000, maxPayout: 100000, enabled: true },
    { name: '低風險限額', currencies: ['TWD', 'USDT'], minBet: 1, maxBet: 1000, maxPayout: 30000, enabled: true },
    { name: '高額限額', currencies: ['USDT', 'USD'], minBet: 10, maxBet: 20000, maxPayout: 500000, enabled: true },
    { name: 'VIP 限額', currencies: ['USDT'], minBet: 50, maxBet: 50000, maxPayout: 1000000, enabled: false },
]

const BASE_SETTINGS: BaseSettings = {
    gameTypes: ['桌遊', '即時遊戲', '運動'],
    platforms: ['H5', 'Web'],
    languages: ['繁中', '英文'],
    defaultMaintenanceCycle: '每日',
    requireApprovalForProduction: true,
}

const SEED_GAMES: GameRow[] = [
    {
        code: 'GAME-001', name: '百家樂', type: '桌遊',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 98.90%', rtp: '98.90%', volatility: '低',
        merchantCount: 20, visibleMerchants: ['MER-001 Golden Dragon', 'MER-002 LuckyPlay', 'MER-003 Nova Gaming'],
        limitTemplates: ['標準限額', 'VIP 限額'], defaultLimitTemplate: '標準限額',
        minBet: 10, maxBet: 10000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'baccarat-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-002', name: '百家樂 P2P', type: '桌遊',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 99.00%', rtp: '99.00%', volatility: '低',
        merchantCount: 15, visibleMerchants: ['MER-001 Golden Dragon', 'MER-002 LuckyPlay'],
        limitTemplates: ['標準限額'], defaultLimitTemplate: '標準限額',
        minBet: 10, maxBet: 10000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'baccarat-p2p-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-003', name: '龍虎', type: '桌遊',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 96.60%', rtp: '96.60%', volatility: '中低',
        merchantCount: 18, visibleMerchants: ['MER-001 Golden Dragon', 'MER-002 LuckyPlay', 'MER-004 Royal H5'],
        limitTemplates: ['標準限額', '高額限額'], defaultLimitTemplate: '標準限額',
        minBet: 10, maxBet: 10000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'dragon-tiger-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-004', name: '牛牛', type: '桌遊',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD', 'TWD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 97.00%', rtp: '97.00%', volatility: '中低',
        merchantCount: 14, visibleMerchants: ['MER-001 Golden Dragon', 'MER-003 Nova Gaming'],
        limitTemplates: ['標準限額'], defaultLimitTemplate: '標準限額',
        minBet: 10, maxBet: 10000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'niuniu-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-005', name: '加勒比海撲克', type: '桌遊',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 94.80%', rtp: '94.80%', volatility: '中低',
        merchantCount: 10, visibleMerchants: ['MER-001 Golden Dragon', 'MER-002 LuckyPlay'],
        limitTemplates: ['高額限額'], defaultLimitTemplate: '高額限額',
        minBet: 100, maxBet: 20000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'caribbean-poker-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-006', name: '推筒子', type: '桌遊',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'TWD'], languages: ['繁中'],
        version: 'v1.0.0', mathVersion: 'RTP 97.00%', rtp: '97.00%', volatility: '低',
        merchantCount: 12, visibleMerchants: ['MER-001 Golden Dragon', 'MER-004 Royal H5'],
        limitTemplates: ['標準限額', '低風險限額'], defaultLimitTemplate: '標準限額',
        minBet: 10, maxBet: 10000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'tuitongzi-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-007', name: '牌九', type: '桌遊',
        status: '測試中', environmentMode: '測試',
        platform: ['H5'], currencies: ['USDT'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 97.30%', rtp: '97.30%', volatility: '中低',
        merchantCount: 0, visibleMerchants: [],
        limitTemplates: ['高額限額'], defaultLimitTemplate: '高額限額',
        minBet: 100, maxBet: 20000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'paigow-h5', assetVersion: 'asset-2026.05', note: '上線審核中',
    },
    {
        code: 'GAME-008', name: '迷你21點', type: '桌遊',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 99.00%', rtp: '99.00%', volatility: '低',
        merchantCount: 16, visibleMerchants: ['MER-001 Golden Dragon', 'MER-002 LuckyPlay', 'MER-003 Nova Gaming'],
        limitTemplates: ['標準限額', 'VIP 限額'], defaultLimitTemplate: '標準限額',
        minBet: 10, maxBet: 10000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'mini-bj-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-009', name: '視訊撲克', type: '桌遊',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 99.50%', rtp: '99.50%', volatility: '低',
        merchantCount: 13, visibleMerchants: ['MER-001 Golden Dragon', 'MER-003 Nova Gaming'],
        limitTemplates: ['標準限額'], defaultLimitTemplate: '標準限額',
        minBet: 10, maxBet: 10000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'video-poker-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-010', name: 'Crash', type: '即時遊戲',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 99.00%', rtp: '99.00%', volatility: '中',
        merchantCount: 22, visibleMerchants: ['MER-001 Golden Dragon', 'MER-002 LuckyPlay', 'MER-003 Nova Gaming', 'MER-004 Royal H5'],
        limitTemplates: ['標準限額', '高額限額'], defaultLimitTemplate: '標準限額',
        minBet: 100, maxBet: 20000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'crash-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-011', name: 'Plinko', type: '即時遊戲',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 97.00%', rtp: '97.00%', volatility: '中',
        merchantCount: 17, visibleMerchants: ['MER-001 Golden Dragon', 'MER-002 LuckyPlay', 'MER-004 Royal H5'],
        limitTemplates: ['標準限額'], defaultLimitTemplate: '標準限額',
        minBet: 100, maxBet: 20000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'plinko-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-012', name: 'Tower', type: '即時遊戲',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 99.00%', rtp: '99.00%', volatility: '中',
        merchantCount: 15, visibleMerchants: ['MER-001 Golden Dragon', 'MER-002 LuckyPlay'],
        limitTemplates: ['標準限額'], defaultLimitTemplate: '標準限額',
        minBet: 100, maxBet: 20000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'tower-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-013', name: 'Mines', type: '即時遊戲',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 99.00%', rtp: '99.00%', volatility: '中',
        merchantCount: 19, visibleMerchants: ['MER-001 Golden Dragon', 'MER-002 LuckyPlay', 'MER-003 Nova Gaming'],
        limitTemplates: ['標準限額', '高額限額'], defaultLimitTemplate: '標準限額',
        minBet: 100, maxBet: 20000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'mines-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-014', name: 'HiLo', type: '即時遊戲',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 97.00%', rtp: '97.00%', volatility: '中',
        merchantCount: 11, visibleMerchants: ['MER-002 LuckyPlay', 'MER-004 Royal H5'],
        limitTemplates: ['標準限額', '低風險限額'], defaultLimitTemplate: '低風險限額',
        minBet: 10, maxBet: 10000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'hilo-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-015', name: 'Limbo', type: '即時遊戲',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 97.00%', rtp: '97.00%', volatility: '中',
        merchantCount: 10, visibleMerchants: ['MER-001 Golden Dragon', 'MER-003 Nova Gaming'],
        limitTemplates: ['標準限額'], defaultLimitTemplate: '標準限額',
        minBet: 100, maxBet: 20000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'limbo-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-016', name: 'Flip', type: '即時遊戲',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD', 'TWD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 99.00%', rtp: '99.00%', volatility: '低',
        merchantCount: 14, visibleMerchants: ['MER-001 Golden Dragon', 'MER-002 LuckyPlay'],
        limitTemplates: ['標準限額', '低風險限額'], defaultLimitTemplate: '低風險限額',
        minBet: 100, maxBet: 20000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'flip-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-017', name: 'Wheel', type: '即時遊戲',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 97.00%', rtp: '97.00%', volatility: '中',
        merchantCount: 16, visibleMerchants: ['MER-001 Golden Dragon', 'MER-003 Nova Gaming', 'MER-004 Royal H5'],
        limitTemplates: ['標準限額'], defaultLimitTemplate: '標準限額',
        minBet: 100, maxBet: 20000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'wheel-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-018', name: 'Pump', type: '即時遊戲',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 98.00%', rtp: '98.00%', volatility: '中',
        merchantCount: 9, visibleMerchants: ['MER-002 LuckyPlay', 'MER-003 Nova Gaming'],
        limitTemplates: ['標準限額'], defaultLimitTemplate: '標準限額',
        minBet: 100, maxBet: 20000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'pump-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-019', name: 'Keno', type: '即時遊戲',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 97.00%', rtp: '97.00%', volatility: '中',
        merchantCount: 12, visibleMerchants: ['MER-001 Golden Dragon', 'MER-004 Royal H5'],
        limitTemplates: ['標準限額'], defaultLimitTemplate: '標準限額',
        minBet: 100, maxBet: 20000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'keno-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-020', name: 'Dice', type: '即時遊戲',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 98.00%', rtp: '98.00%', volatility: '中',
        merchantCount: 18, visibleMerchants: ['MER-001 Golden Dragon', 'MER-002 LuckyPlay', 'MER-003 Nova Gaming'],
        limitTemplates: ['標準限額', '高額限額'], defaultLimitTemplate: '標準限額',
        minBet: 100, maxBet: 20000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'dice-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-021', name: '大小', type: '即時遊戲',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD', 'TWD'], languages: ['繁中'],
        version: 'v1.0.0', mathVersion: 'RTP 97.20%', rtp: '97.20%', volatility: '低',
        merchantCount: 13, visibleMerchants: ['MER-001 Golden Dragon', 'MER-004 Royal H5'],
        limitTemplates: ['標準限額', '低風險限額'], defaultLimitTemplate: '低風險限額',
        minBet: 100, maxBet: 20000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'dice-size-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-022', name: '猜顏色', type: '即時遊戲',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'TWD'], languages: ['繁中'],
        version: 'v1.0.0', mathVersion: 'RTP 97.00%', rtp: '97.00%', volatility: '低',
        merchantCount: 11, visibleMerchants: ['MER-003 Nova Gaming', 'MER-004 Royal H5'],
        limitTemplates: ['標準限額', '低風險限額'], defaultLimitTemplate: '低風險限額',
        minBet: 100, maxBet: 20000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'color-guess-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-023', name: 'Zoo', type: '即時遊戲',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 98.00%', rtp: '98.00%', volatility: '中',
        merchantCount: 14, visibleMerchants: ['MER-001 Golden Dragon', 'MER-002 LuckyPlay'],
        limitTemplates: ['標準限額'], defaultLimitTemplate: '標準限額',
        minBet: 100, maxBet: 20000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'zoo-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-024', name: 'Chicken Road', type: '即時遊戲',
        status: '維護中', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 99.00%', rtp: '99.00%', volatility: '中',
        merchantCount: 8, visibleMerchants: ['MER-002 LuckyPlay'],
        limitTemplates: ['標準限額'], defaultLimitTemplate: '標準限額',
        minBet: 100, maxBet: 20000, maintenance: true, maintenanceStart: timeAt(2), maintenanceEnd: timeAt(6),
        technicalOwner: 'Game Tech', packageId: 'chicken-h5', assetVersion: 'asset-2026.05', note: '熱更新中',
    },
    {
        code: 'GAME-025', name: 'Packs', type: '即時遊戲',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 97.00%', rtp: '97.00%', volatility: '中',
        merchantCount: 10, visibleMerchants: ['MER-001 Golden Dragon', 'MER-003 Nova Gaming'],
        limitTemplates: ['標準限額', '低風險限額'], defaultLimitTemplate: '低風險限額',
        minBet: 10, maxBet: 10000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'packs-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-026', name: 'Three Pick', type: '即時遊戲',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 97.00%', rtp: '97.00%', volatility: '中',
        merchantCount: 9, visibleMerchants: ['MER-002 LuckyPlay', 'MER-004 Royal H5'],
        limitTemplates: ['標準限額'], defaultLimitTemplate: '標準限額',
        minBet: 100, maxBet: 20000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'three-pick-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-027', name: '射龍門', type: '即時遊戲',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'TWD'], languages: ['繁中'],
        version: 'v1.0.0', mathVersion: 'RTP 97.00%', rtp: '97.00%', volatility: '中',
        merchantCount: 11, visibleMerchants: ['MER-001 Golden Dragon', 'MER-004 Royal H5'],
        limitTemplates: ['標準限額', '低風險限額'], defaultLimitTemplate: '低風險限額',
        minBet: 20, maxBet: 10000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'shoot-dragon-gate-h5', assetVersion: 'asset-2026.05', note: '',
    },
    {
        code: 'GAME-028', name: '籃球投籃機', type: '運動',
        status: '上架', environmentMode: '正式',
        platform: ['H5', 'Web'], currencies: ['USDT', 'USD'], languages: ['繁中', '英文'],
        version: 'v1.0.0', mathVersion: 'RTP 96.00%', rtp: '96.00%', volatility: '高',
        merchantCount: 5, visibleMerchants: ['MER-001 Golden Dragon', 'MER-002 LuckyPlay'],
        limitTemplates: ['標準限額'], defaultLimitTemplate: '標準限額',
        minBet: 10, maxBet: 10000, maintenance: false, maintenanceStart: '', maintenanceEnd: '',
        technicalOwner: 'Game Tech', packageId: 'basketball-h5', assetVersion: 'asset-2026.05', note: 'Beta',
    },
]

const SEED_MATH: MathRow[] = [
    {
        id: 'MATH-FT-9650',
        game: 'Fortune Tiger',
        version: 'RTP 96.50%',
        theoreticalRtp: 96.5,
        actualRtp: 97.18,
        deviation: 0.68,
        volatility: '中高',
        status: '已生效',
        effectiveScope: '全部正式商戶',
        sampleBets: 1288042,
        reviewNo: 'APR-20260518-011',
        reviewer: 'Risk Lead',
        updatedAt: '2026-05-20 10:00:00',
        note: '實際 RTP 在容許區間內。',
    },
    {
        id: 'MATH-RS-9580',
        game: 'Royal Spin',
        version: 'RTP 95.80%',
        theoreticalRtp: 95.8,
        actualRtp: 101.42,
        deviation: 5.62,
        volatility: '中',
        status: '觀察中',
        effectiveScope: '指定商戶',
        sampleBets: 284120,
        reviewNo: 'APR-20260519-004',
        reviewer: 'Math Ops',
        updatedAt: '2026-05-20 09:15:00',
        note: '維護期間樣本偏少，需持續觀察。',
    },
    {
        id: 'MATH-BC-9810',
        game: 'Baccarat Pro',
        version: 'RTP 98.10%',
        theoreticalRtp: 98.1,
        actualRtp: 97.72,
        deviation: -0.38,
        volatility: '低',
        status: '測試中',
        effectiveScope: '測試商戶',
        sampleBets: 93122,
        reviewNo: 'APR-20260516-007',
        reviewer: 'QA Reviewer',
        updatedAt: '2026-05-18 16:40:00',
        note: '等待 QA 驗收與長週期樣本。',
    },
    {
        id: 'MATH-CR-9720',
        game: 'Crash Rocket',
        version: 'RTP 97.20%',
        theoreticalRtp: 97.2,
        actualRtp: 111.86,
        deviation: 14.66,
        volatility: '高',
        status: '待審核',
        effectiveScope: '內部測試',
        sampleBets: 15480,
        reviewNo: 'APR-20260520-018',
        reviewer: '-',
        updatedAt: '2026-05-20 12:30:00',
        note: '高波動樣本不足，需補模擬結果後再審核。',
    },
]

const SEED_VERSIONS: VersionRow[] = [
    {
        id: 'REL-20260520-001',
        game: 'Fortune Tiger',
        version: 'v2.4.1',
        assetVersion: 'asset-2026.05',
        status: '已發布',
        releaseType: '正式發布',
        releaseAt: '2026-05-20 03:30:00',
        scope: '全部正式商戶',
        affectedMerchants: 18,
        rollbackTarget: 'v2.4.0',
        owner: 'Game Tech',
        summary: '優化載入速度與錢包回呼容錯。',
        changeLog: ['修正 H5 首次載入偶發白屏', '補強錢包回呼逾時重試', '更新繁中與英文素材'],
    },
    {
        id: 'REL-20260518-002',
        game: 'Royal Spin',
        version: 'v1.9.8',
        assetVersion: 'asset-2026.04',
        status: '維護中',
        releaseType: '修補發布',
        releaseAt: '2026-05-18 02:00:00',
        scope: '指定商戶',
        affectedMerchants: 12,
        rollbackTarget: 'v1.9.7',
        owner: 'Platform Team',
        summary: '修補錢包回調壓測問題，目前仍在維護排程內。',
        changeLog: ['調整交易重送節流', '補上維護公告文案', '更新 TWD 幣別素材'],
    },
    {
        id: 'REL-20260516-003',
        game: 'Baccarat Pro',
        version: 'v3.1.0-beta',
        assetVersion: 'asset-2026.05-beta',
        status: '測試中',
        releaseType: '測試發布',
        releaseAt: '2026-05-16 15:20:00',
        scope: '測試商戶',
        affectedMerchants: 5,
        rollbackTarget: 'v3.0.9',
        owner: 'Table Game Team',
        summary: '新版桌台流程進入 QA 驗收。',
        changeLog: ['新增桌台狀態同步', '調整 Web 版路由', '補泰文素材'],
    },
    {
        id: 'REL-20260512-004',
        game: 'Crash Rocket',
        version: 'v0.8.3',
        assetVersion: 'asset-2026.05-dev',
        status: '待審核',
        releaseType: '預發布',
        releaseAt: '2026-05-12 18:45:00',
        scope: '內部測試',
        affectedMerchants: 0,
        rollbackTarget: '-',
        owner: 'Game Lab',
        summary: '等待版本審核與數值驗收後才可進入測試商戶。',
        changeLog: ['新增倍率動畫', '調整 Web/H5 共用入口', '補越南文素材'],
    },
]

const SEED_ASSETS: AssetRow[] = [
    {
        id: 'AST-FT-ICON-ZH-001',
        game: 'Fortune Tiger',
        type: 'Icon',
        locale: '繁中',
        version: 'asset-2026.05',
        size: '512 x 512',
        fileSize: '184 KB',
        status: '已發布',
        relatedVersion: 'v2.4.1',
        updatedAt: '2026-05-20 03:10:00',
        owner: 'Design Ops',
        palette: 'asset-preview--gold',
        note: '新版品牌 icon，已隨 v2.4.1 發布。',
    },
    {
        id: 'AST-FT-BANNER-EN-002',
        game: 'Fortune Tiger',
        type: 'Banner',
        locale: '英文',
        version: 'asset-2026.05',
        size: '1920 x 640',
        fileSize: '780 KB',
        status: '已發布',
        relatedVersion: 'v2.4.1',
        updatedAt: '2026-05-20 03:12:00',
        owner: 'Design Ops',
        palette: 'asset-preview--blue',
        note: '英文 Banner，供 Web 與 H5 共用。',
    },
    {
        id: 'AST-RS-LOADING-ZH-003',
        game: 'Royal Spin',
        type: 'Loading',
        locale: '繁中',
        version: 'asset-2026.04',
        size: '1080 x 1080',
        fileSize: '430 KB',
        status: '維護中',
        relatedVersion: 'v1.9.8',
        updatedAt: '2026-05-18 02:00:00',
        owner: 'Platform Team',
        palette: 'asset-preview--green',
        note: '配合維護公告更新載入圖。',
    },
    {
        id: 'AST-BC-TABLE-TH-004',
        game: 'Baccarat Pro',
        type: 'Table Skin',
        locale: '泰文',
        version: 'asset-2026.05-beta',
        size: '2048 x 1024',
        fileSize: '1.2 MB',
        status: '測試中',
        relatedVersion: 'v3.1.0-beta',
        updatedAt: '2026-05-16 15:10:00',
        owner: 'Table Game Team',
        palette: 'asset-preview--violet',
        note: '泰文桌台素材等待 QA 驗收。',
    },
    {
        id: 'AST-CR-BANNER-VI-005',
        game: 'Crash Rocket',
        type: 'Banner',
        locale: '越南文',
        version: 'asset-2026.05-dev',
        size: '1920 x 640',
        fileSize: '910 KB',
        status: '待審核',
        relatedVersion: 'v0.8.3',
        updatedAt: '2026-05-12 18:20:00',
        owner: 'Game Lab',
        palette: 'asset-preview--red',
        note: '越南文 Banner 待產品確認文案。',
    },
]

const SEED_ACCESS: AccessRow[] = [
    {
        id: 'ACC-001',
        merchant: 'Golden Dragon',
        agent: 'Asia Master',
        game: 'Fortune Tiger',
        gameType: '老虎機',
        environment: '正式',
        enabled: true,
        status: '啟用',
        limitTemplates: ['標準限額', '高額限額'],
        rtpMode: '沿用遊戲預設',
        launchUrl: 'https://launch.example.com/fortune-tiger',
        updatedAt: '2026-05-20 11:30:00',
        pendingReview: false,
        note: '正式商戶主要遊戲。',
    },
    {
        id: 'ACC-002',
        merchant: 'LuckyPlay',
        agent: 'Prime Network',
        game: 'Royal Spin',
        gameType: '老虎機',
        environment: '正式',
        enabled: false,
        status: '維護中',
        limitTemplates: ['低風險限額'],
        rtpMode: '沿用遊戲預設',
        launchUrl: 'https://launch.example.com/royal-spin',
        updatedAt: '2026-05-20 02:00:00',
        pendingReview: false,
        note: '等待維護結束後恢復入口。',
    },
    {
        id: 'ACC-003',
        merchant: 'Nova Gaming',
        agent: 'Nova Agent',
        game: 'Baccarat Pro',
        gameType: '桌遊',
        environment: '測試',
        enabled: true,
        status: '測試中',
        limitTemplates: ['標準限額'],
        rtpMode: '商戶專屬版本',
        launchUrl: 'https://launch.example.com/baccarat-pro',
        updatedAt: '2026-05-18 16:20:00',
        pendingReview: true,
        note: '等待測試商戶驗收。',
    },
    {
        id: 'ACC-004',
        merchant: 'Royal H5',
        agent: 'Royal Partner',
        game: 'Crash Rocket',
        gameType: '小遊戲',
        environment: '測試',
        enabled: false,
        status: '待審核',
        limitTemplates: ['高額限額', 'VIP 限額'],
        rtpMode: '待審核版本',
        launchUrl: 'https://launch.example.com/crash-rocket',
        updatedAt: '2026-05-12 18:45:00',
        pendingReview: true,
        note: '需完成版本與數值審核。',
    },
]

// ──────────────────────────────────────────────────────────────
// Handlers
// ──────────────────────────────────────────────────────────────

export const gameAdminHandlers = [
    http.get('/api/games/v2/list', async () => {
        await delay(250)
        return HttpResponse.json(expandDemoRows(SEED_GAMES))
    }),

    http.get('/api/games/v2/settings', async () => {
        await delay(200)
        return HttpResponse.json(rebaseDemoDates({
            maintenanceTemplates: SEED_MAINTENANCE,
            limitTemplates: SEED_LIMITS,
            baseSettings: BASE_SETTINGS,
        }))
    }),

    http.get('/api/games/v2/math', async () => {
        await delay(250)
        return HttpResponse.json(expandDemoRows(SEED_MATH))
    }),

    http.get('/api/games/v2/versions', async () => {
        await delay(250)
        return HttpResponse.json(expandDemoRows(SEED_VERSIONS))
    }),

    http.get('/api/games/v2/assets', async () => {
        await delay(250)
        return HttpResponse.json(expandDemoRows(SEED_ASSETS))
    }),

    http.get('/api/games/v2/merchant-access', async () => {
        await delay(250)
        return HttpResponse.json(expandDemoRows(SEED_ACCESS))
    }),
]
