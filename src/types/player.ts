export interface Player {
    id: string
    username: string
    country: string
    registeredAt: string
    lastActiveAt: string
    totalBets: number
    totalDeposits: number
    status: 'active' | 'inactive' | 'banned'
}

export interface PlayerFilter {
    search: string
    status: Player['status'] | undefined
    country: string | undefined
    page: number
    pageSize: number
}

export interface OverviewStats {
    dau: number
    wau: number
    mau: number
    dauTrend: number
}

export interface RetentionData {
    label: string
    d1: number
    d7: number
    d30: number
}

export interface ArpuPoint {
    date: string
    arpu: number
}
