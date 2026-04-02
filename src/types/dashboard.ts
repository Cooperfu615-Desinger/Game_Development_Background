export interface DashboardStats {
    activePlayers: number
    activePlayersTrend: number
    todayRevenue: number
    todayRevenueTrend: number
    weeklyGrowth: number
    onlinePlayers: number
}

export interface RevenueChartData {
    dates: string[]
    values: number[]
    period: string
}

export interface TopGame {
    rank: number
    id: string
    name: string
    activePlayers: number
    revenueShare: number
}

export type RevenuePeriod = '7d' | '14d' | '30d'
