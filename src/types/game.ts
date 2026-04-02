export interface Game {
    id: string
    name: string
    status: 'active' | 'inactive'
    version: string
    rtp: number
    activeUsers: number
    publishedAt: string
    category: 'slot' | 'table' | 'live' | 'fishing'
    description?: string
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
