export interface Agent {
    id: number;
    account: string;
    site_code: string;
    level: number;
    parent_id: number | null;
    balance: number;
    percent: number; // Share percentage
    commission_rate: number;
    player_count: number;
    monthly_performance: number;
    promotion_code: string; // e.g., REF123
    description?: string;
    state: 'active' | 'disabled';
    created_at: string;
    children_count?: number; // Mock helper to indicate if sub-agents exist
}

export interface AgentListResponse {
    code: number;
    msg: string;
    data: {
        list: Agent[];
        total: number;
    };
}
