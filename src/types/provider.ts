export interface Provider {
    id: number;
    code: string;
    name: string;
    status: 'active' | 'maintenance';
    apiConfig: {
        apiUrl?: string;
        merchantCode?: string;
        secretKey?: string;
        revenueShare?: number;
        currency?: string;
        [key: string]: string | number | boolean | undefined;
    };
    type?: string;
    gameCount?: number;
    contract?: {
        costPercent: number;
        expiryDate: number | string;
    };
    contractConfig?: {
        settlement_currency: string;
        rules: {
            slot_free_spin: { enabled: boolean; provider_share: number };
            live_tip: { enabled: boolean; provider_share: number };
            card_fee: { enabled: boolean; provider_share: number };
        };
    };
    maintenanceConfig?: {
        isEmergency: boolean;
        startTime?: number;
        endTime?: number;
    };
}

export interface ProviderListResponse {
    code: number;
    msg: string;
    data: {
        list: Provider[];
        total: number;
    };
}
