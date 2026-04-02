export interface Settlement {
    id: string
    period: string
    type: 'daily' | 'weekly' | 'monthly'
    revenue: number
    revenueShare: number
    fee: number
    netAmount: number
    status: 'pending' | 'confirmed' | 'paid'
    createdAt: string
}

export interface Transaction {
    id: string
    betId: string
    playerId: string
    playerName: string
    gameId: string
    gameName: string
    type: 'bet' | 'win' | 'refund'
    amount: number
    currency: string
    createdAt: string
}

export interface Invoice {
    id: string
    invoiceNo: string
    period: string
    amount: number
    currency: string
    status: 'draft' | 'confirmed' | 'paid'
    dueDate: string
    createdAt: string
}

export interface SettlementFilter {
    startDate: number | null
    endDate: number | null
    status: Settlement['status'] | undefined
    page: number
    pageSize: number
}

export interface TransactionFilter {
    betId: string
    playerId: string
    gameId: string
    currency: string | undefined
    startDate: string | null
    endDate: string | null
    page: number
    pageSize: number
}

export interface InvoiceFilter {
    status: Invoice['status'] | undefined
    page: number
    pageSize: number
}
