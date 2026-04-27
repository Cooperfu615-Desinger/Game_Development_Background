// src/types/platform.ts

export interface Platform {
    id: string
    name: string
    aggregatorId: string
    aggregatorName: string
    hasAgentSystem: boolean
    status: 'active' | 'inactive'
    // 以下數字隨 period 切換（playerCount 為累計，不受 period 影響）
    playerCount: number
    activePlayers: number
    turnover: number
    ggr: number
    jpCount: number
    jpTotal: number
}

export interface PlatformStats {
    playerCount: number
    activePlayers: number
    turnover: number
    ggr: number
    jpCount: number
    jpTotal: number
    avgTurnoverPerPlayer: number
    maxJpAmount: number
}

export interface TrendPoint {
    date: string      // 'YYYY-MM-DD'
    turnover: number
    ggr: number
}

export interface PlatformPlayer {
    playerId: string
    agentId: string | null    // 無代理系統平台為 null
    totalTurnover: number     // 累計（不隨 period 變動）
    periodTurnover: number    // 本期（隨 period 變動）
    lastActiveAt: string      // ISO 8601
}
