// ─── 幣別投注範圍 ───────────────────────────────────────────────────────────
export interface BetRangeCurrency {
    currency: string   // e.g. 'USDT', 'TWD', 'USD'
    minBet: number
    maxBet: number
    maxWin: number     // 最大彩金（絕對金額）
}

// ─── 聚合商 ─────────────────────────────────────────────────────────────────
export interface Aggregator {
    id: string
    name: string
    code: string       // 唯一英文識別碼，e.g. 'self', 'partner-a'
    status: 'active' | 'inactive'
    connectionStatus: 'connected' | 'disconnected' | 'pending'
    apiEndpoint: string
    apiKey: string     // 顯示時遮罩
    gameCount: number  // 已開放遊戲數
    totalGames: number // 可配置遊戲總數
    description?: string
    createdAt: string
}

// ─── 聚合商 × 遊戲配置 ──────────────────────────────────────────────────────
export interface AggregatorGameConfig {
    gameId: string
    gameName: string
    category: 'slot' | 'crash' | 'table'
    enabled: boolean
    betRanges: BetRangeCurrency[]       // 此聚合商的實際設定
    masterBetRanges: BetRangeCurrency[] // 開發商定義上限（唯讀參考）
}

// ─── 篩選 & 建立 ─────────────────────────────────────────────────────────────
export interface AggregatorFilter {
    status: Aggregator['status'] | undefined
    search: string
    page: number
    pageSize: number
}

export interface CreateAggregatorPayload {
    name: string
    code: string
    apiEndpoint: string
    description?: string
}

// ─── 支援幣別（全系統共用常數） ────────────────────────────────────────────────
export const SUPPORTED_CURRENCIES = ['USDT', 'USD', 'TWD', 'CNY', 'MYR', 'THB', 'HKD'] as const
export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number]

// 開發商定義的全局上限（各幣別）
export const MASTER_LIMITS: Record<string, BetRangeCurrency> = {
    USDT: { currency: 'USDT', minBet: 0.1,  maxBet: 1000,  maxWin: 100000  },
    USD:  { currency: 'USD',  minBet: 0.1,  maxBet: 1000,  maxWin: 100000  },
    TWD:  { currency: 'TWD',  minBet: 3,    maxBet: 30000, maxWin: 3000000 },
    CNY:  { currency: 'CNY',  minBet: 1,    maxBet: 7000,  maxWin: 700000  },
    MYR:  { currency: 'MYR',  minBet: 0.5,  maxBet: 5000,  maxWin: 500000  },
    THB:  { currency: 'THB',  minBet: 3,    maxBet: 35000, maxWin: 3500000 },
    HKD:  { currency: 'HKD',  minBet: 1,    maxBet: 8000,  maxWin: 800000  },
}
