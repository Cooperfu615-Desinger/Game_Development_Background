import Big from 'big.js'
import type { ProviderGameRound, ProviderGameRoundStatus } from '@/types/gameRound'

export type ProviderGameRoundSortOrder = 'asc' | 'desc'

export type ProviderGameRoundSortField =
    | 'settled_at'
    | 'round_id'
    | 'external_round_id'
    | 'game_id'
    | 'game_name'
    | 'game_type'
    | 'game_version'
    | 'agent_id'
    | 'agent_name'
    | 'member_id'
    | 'bet_points'
    | 'payout_points'
    | 'net_result_points'
    | 'status'

export const providerGameRoundSortableFields: readonly ProviderGameRoundSortField[] = [
    'settled_at', 'round_id', 'external_round_id', 'game_id', 'game_name', 'game_type', 'game_version',
    'agent_id', 'agent_name', 'member_id', 'bet_points', 'payout_points', 'net_result_points', 'status',
]

// 固定業務順序：狀態升冪依流程由處理中到失敗，降冪完整反轉。
export const providerGameRoundStatusRank: Readonly<Record<ProviderGameRoundStatus, number>> = Object.freeze({
    processing: 1,
    settled: 2,
    cancelled: 3,
    rollback: 4,
    failed: 5,
})

export function isProviderGameRoundSortField(value: string): value is ProviderGameRoundSortField {
    return providerGameRoundSortableFields.includes(value as ProviderGameRoundSortField)
}

function compareTieBreaker(left: ProviderGameRound, right: ProviderGameRound, order: ProviderGameRoundSortOrder) {
    const comparison = left.round_id.localeCompare(right.round_id, undefined, { numeric: true, sensitivity: 'base' })
    return order === 'asc' ? comparison : -comparison
}

/**
 * Shared comparator for the mock API and the page's defensive client-side sort.
 * Null values stay after populated values; equal values use round_id in the
 * same direction as the requested sort to keep pagination stable.
 */
export function compareProviderGameRounds(
    left: ProviderGameRound,
    right: ProviderGameRound,
    field: ProviderGameRoundSortField,
    order: ProviderGameRoundSortOrder,
) {
    const leftValue = left[field as keyof ProviderGameRound]
    const rightValue = right[field as keyof ProviderGameRound]
    const leftMissing = leftValue === null || leftValue === undefined || leftValue === ''
    const rightMissing = rightValue === null || rightValue === undefined || rightValue === ''

    if (leftMissing || rightMissing) {
        if (leftMissing && rightMissing) return compareTieBreaker(left, right, order)
        return leftMissing ? 1 : -1
    }

    let comparison = 0
    if (field === 'status') {
        comparison = providerGameRoundStatusRank[left.status] - providerGameRoundStatusRank[right.status]
    } else if (['bet_points', 'payout_points', 'net_result_points'].includes(field)) {
        comparison = new Big(String(leftValue)).cmp(new Big(String(rightValue)))
    } else if (field === 'settled_at') {
        comparison = new Date(String(leftValue)).getTime() - new Date(String(rightValue)).getTime()
    } else {
        comparison = String(leftValue).localeCompare(String(rightValue), undefined, { numeric: true, sensitivity: 'base' })
    }

    if (comparison === 0) return compareTieBreaker(left, right, order)
    return order === 'asc' ? comparison : -comparison
}
