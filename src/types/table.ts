// Common Table Types for DataTable components

import type { VNodeChild } from 'vue'

/**
 * Generic table row render function type
 * Use this instead of (row: any) => ... in DataTable columns
 */
export type TableRowRender<T> = (row: T, rowIndex: number) => VNodeChild

/**
 * Generic table row key function type
 */
export type TableRowKey<T> = (row: T) => string | number

/**
 * Common render icon function type
 * Use this instead of (icon: any) => ...
 */
export type IconComponent = object

export type RenderIconFn = (icon: IconComponent) => () => VNodeChild

/**
 * Fund Management Row Type
 */
export interface FundManagementRow {
    id: string
    merchant_id: string
    merchant_name: string
    type: 'top-up' | 'credit-limit' | 'manual-adjust'
    amount: number
    status: 'pending' | 'approved' | 'rejected'
    proof?: string
    reason?: string
    reviewer?: string
    created_at: string
    updated_at?: string
}

/**
 * Transaction Detail Row Type
 */
export interface TransactionDetailRow {
    id: string
    created_at: string
    player_id?: string
    game_name: string
    bet_amount: number
    payout_amount: number
    net_win: number
    status?: 'settled' | 'unsettled' | 'cancelled'
}

/**
 * Revenue Report Row Type
 */
export interface RevenueReportRow {
    key: string
    date: string
    active_players: number
    tx_count: number
    total_bet: number
    total_payout: number
    net_win: number
    rtp: number
    children?: RevenueReportRow[]
}

/**
 * Invoice Row Type (extends Invoice for table display)
 */
export interface InvoiceRow {
    id: string
    merchant_id: string
    merchant_name: string
    period: string
    total_ggr: number
    commission_rate: number
    amount_due: number
    status: 'pending' | 'paid' | 'verifying'
    created_at: string
    breakdown?: Array<{
        provider: string
        ggr: number
        rate: number
        amount: number
    }>
}
