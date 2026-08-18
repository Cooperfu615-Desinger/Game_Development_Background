export type ProviderGameRoundStatus = 'processing' | 'settled' | 'cancelled' | 'rollback' | 'failed'

export type ProviderGameType = 'slots' | 'crash' | 'table'

export interface ProviderGameRound {
    round_id: string
    external_round_id: string
    provider_id: string
    game_id: string
    game_name: string
    game_type: ProviderGameType
    game_version: string
    build_id: string
    release_id: string
    settings_snapshot_id: string
    math_snapshot_id: string
    asset_bundle_id: string
    theoretical_rtp: string
    betting_structure_id: string
    betting_structure_snapshot: string
    currency_multiplier_id: string
    currency_multiplier_snapshot: string
    limit_plan_id: string
    limit_plan_snapshot: string
    snapshot_created_at: string
    agent_id: string
    agent_name: string
    member_id: string
    currency: 'USDT'
    request_id: string
    environment: 'production'
    bet_points: string
    payout_points: string
    net_result_points: string
    bet_usdt: string
    payout_usdt: string
    net_result_usdt: string
    conversion_rule_id: string
    conversion_rate: string
    conversion_rule: string
    started_at: string | null
    settled_at: string | null
    created_at: string
    updated_at: string
    status: ProviderGameRoundStatus
    status_description: string
    exception_reason: string | null
    retry_count: number
}

export interface ProviderGameRoundListResponse {
    items: ProviderGameRound[]
    total: number
    page: number
    page_size: number
}
