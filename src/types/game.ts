export interface Game {
    id: string
    name: string
    status: 'active' | 'inactive'
    version: string
    rtp: number
    activeUsers: number
    publishedAt: string
    category: 'table' | 'instant' | 'sport'
    description?: string
    chipDenominations?: number[]
    minBet?: number
    maxBetRatio?: number
    betZoneCount?: number
    singleBetOnly?: boolean
    payoutModel?: string
}

export interface GameFilter {
    status: 'active' | 'inactive' | undefined
    search: string
    category: Game['category'] | undefined
    page: number
    pageSize: number
}

export interface GameListResponse {
    items: Game[]
    total: number
    page: number
    limit: number
}
