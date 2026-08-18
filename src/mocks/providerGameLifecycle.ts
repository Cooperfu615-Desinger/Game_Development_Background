import type {
    ChangeType,
    CreateAssetDraftPayload,
    CreateVersionDraftPayload,
    BetLimitPlan,
    EnvironmentDeployment,
    GameAssetRecord,
    GameAvailability,
    GameMathSnapshot,
    GameSettingsSnapshot,
    GameVersion,
    LifecycleGame,
    LifecycleSnapshot,
    ReleaseEnvironment,
    ReleaseRecord,
} from '@/types/providerGameLifecycle'

const now = () => new Date().toISOString()

export const lifecycleGames: LifecycleGame[] = [
    {
        id: 'SV-001',
        name: '星際寶藏',
        type: '老虎機',
        availability: 'available',
        availabilityUpdatedAt: '2026-08-18T01:20:00.000Z',
        availabilityReason: '正式服務中',
    },
    {
        id: 'NH-001',
        name: 'Neon Heist',
        type: '老虎機',
        availability: 'available',
        availabilityUpdatedAt: '2026-08-17T13:10:00.000Z',
        availabilityReason: '正式服務中',
    },
    {
        id: 'BC-001',
        name: 'Baccarat Pro',
        type: '棋牌',
        availability: 'maintenance',
        availabilityUpdatedAt: '2026-08-18T02:10:00.000Z',
        availabilityReason: '錢包回呼壓測與例行維護',
    },
    {
        id: 'CR-001',
        name: 'Crash Rocket',
        type: '迷你遊戲',
        availability: 'unpublished',
        availabilityUpdatedAt: '2026-08-16T08:45:00.000Z',
        availabilityReason: '尚未完成首版驗收',
    },
]

function artifact(versionId: string, buildId: string, checksum: string, gitCommit: string, builtAt: string) {
    return {
        buildId,
        versionId,
        checksum,
        manifestId: `manifest:${buildId.toLowerCase()}`,
        gitCommit,
        builtAt,
        immutable: true as const,
        size: '42.8 MB',
    }
}

export const lifecycleVersions: GameVersion[] = [
    {
        id: 'VER-SV-2.5.0', gameId: 'SV-001', gameName: '星際寶藏', semver: 'v2.5.0', status: 'approved', changeType: 'math',
        artifact: artifact('VER-SV-2.5.0', 'BLD-SV-250-7F2A', 'sha256:7f2a91…ce08', '7f2a91c8', '2026-08-17T08:40:00.000Z'),
        settingsRef: 'SET-SV-014', mathRef: 'MATH-SV-250', assetsRef: 'AST-SV-2026.08', validationStatus: 'passed',
        validationSummary: '單元、整合、Round 對帳與 DEMO 驗收均通過', publishedEnvironments: ['test', 'demo'], rollbackCandidate: false,
        owner: 'Slot Platform', summary: '調整 Bonus 數值並更新繁中活動素材。', changeLog: ['Bonus RTP 參數改版', '更新繁中活動素材', '補齊 Round trace 欄位'],
        releaseIds: ['REL-SV-250-T01', 'REL-SV-250-D01', 'REL-SV-250-P01'], basedOnVersionId: 'VER-SV-2.4.1', updatedAt: '2026-08-18T02:20:00.000Z',
    },
    {
        id: 'VER-SV-2.4.1', gameId: 'SV-001', gameName: '星際寶藏', semver: 'v2.4.1', status: 'published', changeType: 'fix',
        artifact: artifact('VER-SV-2.4.1', 'BLD-SV-241-9AC1', 'sha256:9ac184…12ab', '9ac1847e', '2026-08-02T06:15:00.000Z'),
        settingsRef: 'SET-SV-013', mathRef: 'MATH-SV-241', assetsRef: 'AST-SV-2026.07', validationStatus: 'passed',
        validationSummary: '正式環境運行中', publishedEnvironments: ['test', 'demo', 'production'], rollbackCandidate: true,
        owner: 'Slot Platform', summary: '正式環境穩定版本。', changeLog: ['修正斷線重連', '更新載入流程'], releaseIds: ['REL-SV-241-P01'],
        basedOnVersionId: 'VER-SV-2.3.8', updatedAt: '2026-08-02T08:25:00.000Z',
    },
    {
        id: 'VER-SV-2.3.8', gameId: 'SV-001', gameName: '星際寶藏', semver: 'v2.3.8', status: 'retired', changeType: 'fix',
        artifact: artifact('VER-SV-2.3.8', 'BLD-SV-238-31D0', 'sha256:31d049…af11', '31d049ad', '2026-07-12T04:10:00.000Z'),
        settingsRef: 'SET-SV-012', mathRef: 'MATH-SV-238', assetsRef: 'AST-SV-2026.06', validationStatus: 'passed',
        validationSummary: '已封存，可供緊急回復參考', publishedEnvironments: [], rollbackCandidate: false, owner: 'Slot Platform',
        summary: '已退役的舊正式版本。', changeLog: ['歷史版本封存'], releaseIds: ['REL-SV-238-P01'], basedOnVersionId: null,
        updatedAt: '2026-08-02T08:25:00.000Z',
    },
    {
        id: 'VER-NH-1.8.4', gameId: 'NH-001', gameName: 'Neon Heist', semver: 'v1.8.4', status: 'candidate', changeType: 'feature',
        artifact: artifact('VER-NH-1.8.4', 'BLD-NH-184-62B4', 'sha256:62b4d0…432f', '62b4d0f1', '2026-08-18T00:35:00.000Z'),
        settingsRef: 'SET-NH-009', mathRef: 'MATH-NH-183', assetsRef: 'AST-NH-2026.08', validationStatus: 'pending',
        validationSummary: 'Test 發布排程待執行', publishedEnvironments: [], rollbackCandidate: false, owner: 'Game Lab',
        summary: '新增免費遊戲回合提示。', changeLog: ['新增免費遊戲提示', '補英文與越南文'], releaseIds: ['REL-NH-184-T01'],
        basedOnVersionId: 'VER-NH-1.8.3', updatedAt: '2026-08-18T00:50:00.000Z',
    },
    {
        id: 'VER-NH-1.8.3', gameId: 'NH-001', gameName: 'Neon Heist', semver: 'v1.8.3', status: 'published', changeType: 'fix',
        artifact: artifact('VER-NH-1.8.3', 'BLD-NH-183-575A', 'sha256:575a12…f82a', '575a12d9', '2026-08-05T09:00:00.000Z'),
        settingsRef: 'SET-NH-008', mathRef: 'MATH-NH-183', assetsRef: 'AST-NH-2026.07', validationStatus: 'passed',
        validationSummary: '正式環境運行中', publishedEnvironments: ['test', 'demo', 'production'], rollbackCandidate: true, owner: 'Game Lab',
        summary: '正式環境穩定版本。', changeLog: ['修正行動版聲音初始化'], releaseIds: ['REL-NH-183-T01', 'REL-NH-183-D01', 'REL-NH-183-P01'], basedOnVersionId: null,
        updatedAt: '2026-08-05T11:30:00.000Z',
    },
    {
        id: 'VER-BC-3.1.0', gameId: 'BC-001', gameName: 'Baccarat Pro', semver: 'v3.1.0', status: 'approved', changeType: 'feature',
        artifact: artifact('VER-BC-3.1.0', 'BLD-BC-310-A841', 'sha256:a8410e…38d2', 'a8410e53', '2026-08-17T03:30:00.000Z'),
        settingsRef: 'SET-BC-021', mathRef: 'MATH-BC-309', assetsRef: 'AST-BC-2026.08', validationStatus: 'passed',
        validationSummary: 'Test 驗收通過，DEMO 待排程', publishedEnvironments: ['test'], rollbackCandidate: false, owner: 'Table Game Team',
        summary: '新版桌台同步與多語素材。', changeLog: ['桌台狀態同步', '補泰文素材'], releaseIds: ['REL-BC-310-T01', 'REL-BC-310-D01'],
        basedOnVersionId: 'VER-BC-3.0.9', updatedAt: '2026-08-18T01:45:00.000Z',
    },
    {
        id: 'VER-BC-3.0.9', gameId: 'BC-001', gameName: 'Baccarat Pro', semver: 'v3.0.9', status: 'published', changeType: 'fix',
        artifact: artifact('VER-BC-3.0.9', 'BLD-BC-309-134C', 'sha256:134c77…11ac', '134c77f2', '2026-07-30T07:25:00.000Z'),
        settingsRef: 'SET-BC-020', mathRef: 'MATH-BC-309', assetsRef: 'AST-BC-2026.07', validationStatus: 'passed',
        validationSummary: '正式環境維護中，Artifact 本身正常', publishedEnvironments: ['test', 'demo', 'production'], rollbackCandidate: true,
        owner: 'Table Game Team', summary: '正式環境目前版本。', changeLog: ['錢包回呼節流'], releaseIds: ['REL-BC-309-T01', 'REL-BC-309-D01', 'REL-BC-309-P01'],
        basedOnVersionId: null, updatedAt: '2026-08-18T02:10:00.000Z',
    },
    {
        id: 'VER-CR-0.8.3', gameId: 'CR-001', gameName: 'Crash Rocket', semver: 'v0.8.3', status: 'draft', changeType: 'feature',
        artifact: null, settingsRef: 'SET-CR-DRAFT', mathRef: 'MATH-CR-DRAFT', assetsRef: 'AST-CR-DRAFT', validationStatus: 'pending',
        validationSummary: '尚未建立不可變 Build Artifact', publishedEnvironments: [], rollbackCandidate: false, owner: 'Game Lab',
        summary: '首版多人倍率流程。', changeLog: ['多人倍率動畫', 'Web/H5 共用入口'], releaseIds: [], basedOnVersionId: null,
        updatedAt: '2026-08-16T08:45:00.000Z',
    },
]

const passedChecks = [
    { key: 'artifact', label: 'Artifact 完整性', status: 'passed' as const, detail: 'Checksum 與 manifest 一致' },
    { key: 'round', label: 'Game Round 對帳', status: 'passed' as const, detail: '下注、派彩與狀態樣本通過' },
    { key: 'rollback', label: '回復條件', status: 'passed' as const, detail: '上一個 Active Release 可用' },
]

function release(input: Partial<ReleaseRecord> & Pick<ReleaseRecord, 'id' | 'gameId' | 'gameName' | 'versionId' | 'semver' | 'buildId' | 'environment' | 'status'>): ReleaseRecord {
    const createdAt = input.createdAt ?? '2026-08-17T08:50:00.000Z'
    return {
        riskLane: 'fast', changeType: 'fix', sourceReleaseId: null, rollbackOfReleaseId: null, targetActiveReleaseId: null,
        validations: structuredClone(passedChecks), approvals: [{ role: '發布管理者', approver: 'Lin Yu', status: 'approved', at: createdAt }],
        scheduledAt: null, createdAt, updatedAt: input.updatedAt ?? createdAt, owner: 'Release Ops', note: '',
        timeline: [{ at: createdAt, actor: 'Release Ops', action: '建立發布紀錄', note: 'Artifact 與目標環境已固定' }],
        ...input,
    }
}

export const lifecycleReleases: ReleaseRecord[] = [
    release({ id: 'REL-SV-250-P01', gameId: 'SV-001', gameName: '星際寶藏', versionId: 'VER-SV-2.5.0', semver: 'v2.5.0', buildId: 'BLD-SV-250-7F2A', environment: 'production', status: 'awaiting_approval', riskLane: 'guarded', changeType: 'math', sourceReleaseId: 'REL-SV-250-D01', targetActiveReleaseId: 'REL-SV-241-P01', approvals: [{ role: '發布管理者', approver: 'Lin Yu', status: 'approved', at: '2026-08-18T02:05:00.000Z' }, { role: '數值覆核者', approver: null, status: 'pending', at: null }], note: 'RTP 參數異動，需第二人覆核。', updatedAt: '2026-08-18T02:20:00.000Z' }),
    release({ id: 'REL-SV-250-D01', gameId: 'SV-001', gameName: '星際寶藏', versionId: 'VER-SV-2.5.0', semver: 'v2.5.0', buildId: 'BLD-SV-250-7F2A', environment: 'demo', status: 'succeeded', sourceReleaseId: 'REL-SV-250-T01', updatedAt: '2026-08-18T01:40:00.000Z' }),
    release({ id: 'REL-SV-250-T01', gameId: 'SV-001', gameName: '星際寶藏', versionId: 'VER-SV-2.5.0', semver: 'v2.5.0', buildId: 'BLD-SV-250-7F2A', environment: 'test', status: 'succeeded', updatedAt: '2026-08-17T10:20:00.000Z' }),
    release({ id: 'REL-SV-241-P01', gameId: 'SV-001', gameName: '星際寶藏', versionId: 'VER-SV-2.4.1', semver: 'v2.4.1', buildId: 'BLD-SV-241-9AC1', environment: 'production', status: 'succeeded', targetActiveReleaseId: 'REL-SV-238-P01', updatedAt: '2026-08-02T08:25:00.000Z' }),
    release({ id: 'REL-NH-184-T01', gameId: 'NH-001', gameName: 'Neon Heist', versionId: 'VER-NH-1.8.4', semver: 'v1.8.4', buildId: 'BLD-NH-184-62B4', environment: 'test', status: 'scheduled', scheduledAt: '2026-08-18T04:00:00.000Z', validations: [{ key: 'artifact', label: 'Artifact 完整性', status: 'passed', detail: 'Checksum 與 manifest 一致' }, { key: 'round', label: 'Game Round 對帳', status: 'pending', detail: '發布後執行測試樣本' }], updatedAt: '2026-08-18T00:50:00.000Z' }),
    release({ id: 'REL-NH-183-T01', gameId: 'NH-001', gameName: 'Neon Heist', versionId: 'VER-NH-1.8.3', semver: 'v1.8.3', buildId: 'BLD-NH-183-575A', environment: 'test', status: 'succeeded', updatedAt: '2026-08-05T09:50:00.000Z' }),
    release({ id: 'REL-NH-183-D01', gameId: 'NH-001', gameName: 'Neon Heist', versionId: 'VER-NH-1.8.3', semver: 'v1.8.3', buildId: 'BLD-NH-183-575A', environment: 'demo', status: 'succeeded', sourceReleaseId: 'REL-NH-183-T01', updatedAt: '2026-08-05T10:40:00.000Z' }),
    release({ id: 'REL-NH-183-P01', gameId: 'NH-001', gameName: 'Neon Heist', versionId: 'VER-NH-1.8.3', semver: 'v1.8.3', buildId: 'BLD-NH-183-575A', environment: 'production', status: 'succeeded', updatedAt: '2026-08-05T11:30:00.000Z' }),
    release({ id: 'REL-BC-310-D01', gameId: 'BC-001', gameName: 'Baccarat Pro', versionId: 'VER-BC-3.1.0', semver: 'v3.1.0', buildId: 'BLD-BC-310-A841', environment: 'demo', status: 'scheduled', sourceReleaseId: 'REL-BC-310-T01', targetActiveReleaseId: 'REL-BC-309-P01', scheduledAt: '2026-08-18T06:00:00.000Z', updatedAt: '2026-08-18T01:45:00.000Z' }),
    release({ id: 'REL-BC-310-T01', gameId: 'BC-001', gameName: 'Baccarat Pro', versionId: 'VER-BC-3.1.0', semver: 'v3.1.0', buildId: 'BLD-BC-310-A841', environment: 'test', status: 'succeeded', updatedAt: '2026-08-17T06:20:00.000Z' }),
    release({ id: 'REL-BC-309-T01', gameId: 'BC-001', gameName: 'Baccarat Pro', versionId: 'VER-BC-3.0.9', semver: 'v3.0.9', buildId: 'BLD-BC-309-134C', environment: 'test', status: 'succeeded', updatedAt: '2026-07-30T08:10:00.000Z' }),
    release({ id: 'REL-BC-309-D01', gameId: 'BC-001', gameName: 'Baccarat Pro', versionId: 'VER-BC-3.0.9', semver: 'v3.0.9', buildId: 'BLD-BC-309-134C', environment: 'demo', status: 'succeeded', sourceReleaseId: 'REL-BC-309-T01', updatedAt: '2026-07-30T09:00:00.000Z' }),
    release({ id: 'REL-BC-309-P01', gameId: 'BC-001', gameName: 'Baccarat Pro', versionId: 'VER-BC-3.0.9', semver: 'v3.0.9', buildId: 'BLD-BC-309-134C', environment: 'production', status: 'succeeded', updatedAt: '2026-07-30T10:00:00.000Z' }),
]

function deployment(gameId: string, environment: ReleaseEnvironment, activeReleaseId: string | null, pendingReleaseId: string | null, overrides: Partial<EnvironmentDeployment> = {}): EnvironmentDeployment {
    const game = lifecycleGames.find((item) => item.id === gameId)!
    const releaseItem = lifecycleReleases.find((item) => item.id === activeReleaseId)
    return {
        gameId, gameName: game.name, gameType: game.type, availability: game.availability, environment,
        activeVersionId: releaseItem?.versionId ?? null, activeSemver: releaseItem?.semver ?? null, activeReleaseId,
        activeBuildId: releaseItem?.buildId ?? null, releaseStatus: releaseItem?.status ?? 'not_released', serviceEnabled: Boolean(activeReleaseId),
        health: activeReleaseId ? 'healthy' : 'no_data', ggapSync: environment === 'test' ? 'not_applicable' : activeReleaseId ? 'synced' : 'not_applicable',
        ggapSyncAt: activeReleaseId && environment !== 'test' ? releaseItem?.updatedAt ?? null : null, pendingReleaseId,
        updatedAt: releaseItem?.updatedAt ?? '2026-08-18T01:00:00.000Z', ...overrides,
    }
}

export const lifecycleEnvironments: EnvironmentDeployment[] = [
    deployment('SV-001', 'test', 'REL-SV-250-T01', null),
    deployment('SV-001', 'demo', 'REL-SV-250-D01', null),
    deployment('SV-001', 'production', 'REL-SV-241-P01', 'REL-SV-250-P01'),
    deployment('NH-001', 'test', null, 'REL-NH-184-T01', { serviceEnabled: true, health: 'healthy' }),
    deployment('NH-001', 'demo', 'REL-NH-183-D01', null),
    deployment('NH-001', 'production', 'REL-NH-183-P01', null),
    deployment('BC-001', 'test', 'REL-BC-310-T01', null),
    deployment('BC-001', 'demo', 'REL-BC-309-D01', 'REL-BC-310-D01'),
    deployment('BC-001', 'production', 'REL-BC-309-P01', null, { serviceEnabled: false, health: 'degraded', ggapSync: 'pending' }),
    deployment('CR-001', 'test', null, null),
    deployment('CR-001', 'demo', null, null),
    deployment('CR-001', 'production', null, null),
]

export const lifecycleLimitPlans: BetLimitPlan[] = [
    { id: 'LIMIT-STD-001', name: '標準限額', baseCurrency: 'USDT', minBet: 0.1, maxBet: 100, maxPayout: 10000, currencies: ['USDT', 'USD', 'TWD', 'VND'], status: 'published', updatedAt: '2026-08-02T07:10:00.000Z' },
    { id: 'LIMIT-LOW-002', name: '低風險限額', baseCurrency: 'USDT', minBet: 0.1, maxBet: 25, maxPayout: 2500, currencies: ['USDT', 'USD', 'TWD'], status: 'published', updatedAt: '2026-08-02T07:15:00.000Z' },
    { id: 'LIMIT-HIGH-003', name: '高額限額', baseCurrency: 'USDT', minBet: 1, maxBet: 500, maxPayout: 50000, currencies: ['USDT', 'USD', 'TWD', 'VND'], status: 'approved', updatedAt: '2026-08-17T09:30:00.000Z' },
    { id: 'LIMIT-QA-004', name: '測試限額', baseCurrency: 'USDT', minBet: 0.01, maxBet: 10, maxPayout: 1000, currencies: ['USDT'], status: 'draft', updatedAt: '2026-08-18T00:30:00.000Z' },
]

const slotBettingStructure = { id: 'BET-STRUCT-SLOT-003', label: 'Bet Level × Coin Value', formula: 'Total Bet = Bet × Coin Value × Bet Multiplier', betLevels: [1, 2, 5, 10, 20, 50], coinValues: [0.01, 0.02, 0.05, 0.1] }
const tableBettingStructure = { id: 'BET-STRUCT-TABLE-002', label: 'Table Stake', formula: 'Total Bet = selected area stakes total', betLevels: [1, 5, 10, 25, 50, 100], coinValues: [1] }
const crashBettingStructure = { id: 'BET-STRUCT-CRASH-001', label: 'Single Stake', formula: 'Total Bet = stake amount', betLevels: [1, 2, 5, 10, 25, 50], coinValues: [1] }
const commonCurrencyMultipliers = { id: 'CUR-MAP-2026-08', baseCurrency: 'USDT' as const, rates: [{ currency: 'USDT', multiplier: 1 }, { currency: 'USD', multiplier: 1 }, { currency: 'TWD', multiplier: 30 }, { currency: 'VND', multiplier: 2000 }] }

export const lifecycleSettingsSnapshots: GameSettingsSnapshot[] = [
    { id: 'SET-SV-014', gameId: 'SV-001', gameName: '星際寶藏', revision: 'r14', status: 'approved', bettingStructure: structuredClone(slotBettingStructure), currencyMultipliers: structuredClone(commonCurrencyMultipliers), limitPlanIds: ['LIMIT-STD-001', 'LIMIT-HIGH-003'], maintenancePolicy: '每日 03:00–04:00（需要時啟用）', platforms: ['H5', 'Web'], languages: ['繁中', '英文', '越南文'], relatedVersionIds: ['VER-SV-2.5.0'], immutable: true, owner: 'Slot Platform', updatedAt: '2026-08-17T08:20:00.000Z' },
    { id: 'SET-SV-013', gameId: 'SV-001', gameName: '星際寶藏', revision: 'r13', status: 'published', bettingStructure: structuredClone(slotBettingStructure), currencyMultipliers: structuredClone(commonCurrencyMultipliers), limitPlanIds: ['LIMIT-STD-001'], maintenancePolicy: '每日 03:00–04:00（需要時啟用）', platforms: ['H5', 'Web'], languages: ['繁中', '英文'], relatedVersionIds: ['VER-SV-2.4.1'], immutable: true, owner: 'Slot Platform', updatedAt: '2026-08-02T05:30:00.000Z' },
    { id: 'SET-NH-009', gameId: 'NH-001', gameName: 'Neon Heist', revision: 'r9', status: 'review', bettingStructure: structuredClone(slotBettingStructure), currencyMultipliers: structuredClone(commonCurrencyMultipliers), limitPlanIds: ['LIMIT-STD-001', 'LIMIT-LOW-002'], maintenancePolicy: '每週三 02:00–03:00', platforms: ['H5', 'Web'], languages: ['繁中', '英文', '越南文'], relatedVersionIds: ['VER-NH-1.8.4'], immutable: false, owner: 'Game Lab', updatedAt: '2026-08-18T00:25:00.000Z' },
    { id: 'SET-NH-008', gameId: 'NH-001', gameName: 'Neon Heist', revision: 'r8', status: 'published', bettingStructure: structuredClone(slotBettingStructure), currencyMultipliers: structuredClone(commonCurrencyMultipliers), limitPlanIds: ['LIMIT-STD-001'], maintenancePolicy: '每週三 02:00–03:00', platforms: ['H5', 'Web'], languages: ['繁中', '英文'], relatedVersionIds: ['VER-NH-1.8.3'], immutable: true, owner: 'Game Lab', updatedAt: '2026-08-05T08:30:00.000Z' },
    { id: 'SET-BC-021', gameId: 'BC-001', gameName: 'Baccarat Pro', revision: 'r21', status: 'approved', bettingStructure: structuredClone(tableBettingStructure), currencyMultipliers: structuredClone(commonCurrencyMultipliers), limitPlanIds: ['LIMIT-STD-001', 'LIMIT-HIGH-003'], maintenancePolicy: '每日 04:00–05:00', platforms: ['H5', 'Web'], languages: ['繁中', '英文', '泰文'], relatedVersionIds: ['VER-BC-3.1.0'], immutable: true, owner: 'Table Game Team', updatedAt: '2026-08-17T03:15:00.000Z' },
    { id: 'SET-BC-020', gameId: 'BC-001', gameName: 'Baccarat Pro', revision: 'r20', status: 'published', bettingStructure: structuredClone(tableBettingStructure), currencyMultipliers: structuredClone(commonCurrencyMultipliers), limitPlanIds: ['LIMIT-STD-001'], maintenancePolicy: '每日 04:00–05:00', platforms: ['H5', 'Web'], languages: ['繁中', '英文'], relatedVersionIds: ['VER-BC-3.0.9'], immutable: true, owner: 'Table Game Team', updatedAt: '2026-07-30T07:00:00.000Z' },
    { id: 'SET-CR-DRAFT', gameId: 'CR-001', gameName: 'Crash Rocket', revision: 'draft-1', status: 'draft', bettingStructure: structuredClone(crashBettingStructure), currencyMultipliers: structuredClone(commonCurrencyMultipliers), limitPlanIds: ['LIMIT-QA-004'], maintenancePolicy: '尚未設定', platforms: ['H5'], languages: ['繁中', '英文'], relatedVersionIds: ['VER-CR-0.8.3'], immutable: false, owner: 'Game Lab', updatedAt: '2026-08-16T08:20:00.000Z' },
]

export const lifecycleMathSnapshots: GameMathSnapshot[] = [
    { id: 'MATH-SV-250', gameId: 'SV-001', gameName: '星際寶藏', revision: 'math-2.5.0', status: 'approved', theoreticalRtp: 96.5, actualRtp: 96.42, deviation: -0.08, volatility: '中高', paytableId: 'PAY-SV-250', sampleRounds: 1250000, reviewNo: 'REV-MATH-260817-01', reviewer: 'Chen Wei', relatedVersionIds: ['VER-SV-2.5.0'], immutable: true, riskLane: 'guarded', note: 'Bonus RTP 異動已完成第二人覆核。', updatedAt: '2026-08-18T02:00:00.000Z' },
    { id: 'MATH-SV-241', gameId: 'SV-001', gameName: '星際寶藏', revision: 'math-2.4.1', status: 'published', theoreticalRtp: 96.2, actualRtp: 96.08, deviation: -0.12, volatility: '中', paytableId: 'PAY-SV-241', sampleRounds: 483210, reviewNo: 'REV-MATH-260801-03', reviewer: 'Chen Wei', relatedVersionIds: ['VER-SV-2.4.1'], immutable: true, riskLane: 'guarded', note: 'Production 目前數值快照。', updatedAt: '2026-08-18T01:10:00.000Z' },
    { id: 'MATH-NH-183', gameId: 'NH-001', gameName: 'Neon Heist', revision: 'math-1.8.3', status: 'published', theoreticalRtp: 97, actualRtp: 97.06, deviation: 0.06, volatility: '中', paytableId: 'PAY-NH-183', sampleRounds: 326850, reviewNo: 'REV-MATH-260804-02', reviewer: 'Lin Yu', relatedVersionIds: ['VER-NH-1.8.3', 'VER-NH-1.8.4'], immutable: true, riskLane: 'guarded', note: 'v1.8.4 未變更數值，沿用既有快照。', updatedAt: '2026-08-18T00:40:00.000Z' },
    { id: 'MATH-BC-309', gameId: 'BC-001', gameName: 'Baccarat Pro', revision: 'math-3.0.9', status: 'published', theoreticalRtp: 98.9, actualRtp: 98.82, deviation: -0.08, volatility: '低', paytableId: 'PAY-BC-309', sampleRounds: 218400, reviewNo: 'REV-MATH-260729-04', reviewer: 'Wang Jia', relatedVersionIds: ['VER-BC-3.0.9', 'VER-BC-3.1.0'], immutable: true, riskLane: 'guarded', note: '桌台數值未變更。', updatedAt: '2026-08-18T01:20:00.000Z' },
    { id: 'MATH-CR-DRAFT', gameId: 'CR-001', gameName: 'Crash Rocket', revision: 'draft-1', status: 'draft', theoreticalRtp: 97, actualRtp: 0, deviation: 0, volatility: '高', paytableId: 'PAY-CR-DRAFT', sampleRounds: 0, reviewNo: null, reviewer: null, relatedVersionIds: ['VER-CR-0.8.3'], immutable: false, riskLane: 'guarded', note: '尚未執行正式模擬與審核。', updatedAt: '2026-08-16T08:30:00.000Z' },
]

export const lifecycleAssets: GameAssetRecord[] = [
    { id: 'AST-SV-ICON-ZH-014', bundleId: 'AST-SV-2026.08', gameId: 'SV-001', gameName: '星際寶藏', type: 'Icon', locale: '繁中', revision: 'asset-r14', status: 'approved', checksum: 'sha256:asset-sv-014', storageRef: 'provider-assets/sv/2026-08/icon-zh.webp', dimensions: '512 × 512', fileSize: '186 KB', relatedVersionIds: ['VER-SV-2.5.0'], immutable: true, supersedesId: 'AST-SV-ICON-ZH-013', owner: 'Design Ops', note: 'v2.5.0 活動 Icon。', palette: 'asset-preview--gold', updatedAt: '2026-08-17T07:30:00.000Z' },
    { id: 'AST-SV-ICON-ZH-013', bundleId: 'AST-SV-2026.07', gameId: 'SV-001', gameName: '星際寶藏', type: 'Icon', locale: '繁中', revision: 'asset-r13', status: 'published', checksum: 'sha256:asset-sv-013', storageRef: 'provider-assets/sv/2026-07/icon-zh.webp', dimensions: '512 × 512', fileSize: '181 KB', relatedVersionIds: ['VER-SV-2.4.1'], immutable: true, supersedesId: null, owner: 'Design Ops', note: 'Production 目前素材。', palette: 'asset-preview--gold', updatedAt: '2026-08-02T05:00:00.000Z' },
    { id: 'AST-NH-BANNER-EN-009', bundleId: 'AST-NH-2026.08', gameId: 'NH-001', gameName: 'Neon Heist', type: 'Banner', locale: '英文', revision: 'asset-r9', status: 'review', checksum: 'sha256:asset-nh-009', storageRef: 'provider-assets/nh/2026-08/banner-en.webp', dimensions: '1920 × 640', fileSize: '742 KB', relatedVersionIds: ['VER-NH-1.8.4'], immutable: true, supersedesId: 'AST-NH-BANNER-EN-008', owner: 'Design Ops', note: '新增免費遊戲提示文案。', palette: 'asset-preview--blue', updatedAt: '2026-08-18T00:10:00.000Z' },
    { id: 'AST-NH-BANNER-EN-008', bundleId: 'AST-NH-2026.07', gameId: 'NH-001', gameName: 'Neon Heist', type: 'Banner', locale: '英文', revision: 'asset-r8', status: 'published', checksum: 'sha256:asset-nh-008', storageRef: 'provider-assets/nh/2026-07/banner-en.webp', dimensions: '1920 × 640', fileSize: '718 KB', relatedVersionIds: ['VER-NH-1.8.3'], immutable: true, supersedesId: null, owner: 'Design Ops', note: 'Production 目前素材。', palette: 'asset-preview--blue', updatedAt: '2026-08-05T08:10:00.000Z' },
    { id: 'AST-BC-TABLE-TH-021', bundleId: 'AST-BC-2026.08', gameId: 'BC-001', gameName: 'Baccarat Pro', type: 'Table Skin', locale: '泰文', revision: 'asset-r21', status: 'approved', checksum: 'sha256:asset-bc-021', storageRef: 'provider-assets/bc/2026-08/table-th.webp', dimensions: '2048 × 1024', fileSize: '1.2 MB', relatedVersionIds: ['VER-BC-3.1.0'], immutable: true, supersedesId: null, owner: 'Table Design', note: '新增泰文桌台素材。', palette: 'asset-preview--violet', updatedAt: '2026-08-17T03:00:00.000Z' },
    { id: 'AST-CR-LOADING-ZH-D01', bundleId: 'AST-CR-DRAFT', gameId: 'CR-001', gameName: 'Crash Rocket', type: 'Loading', locale: '繁中', revision: 'draft-1', status: 'draft', checksum: 'sha256:asset-cr-draft', storageRef: 'provider-assets/cr/draft/loading-zh.webp', dimensions: '1080 × 1080', fileSize: '408 KB', relatedVersionIds: ['VER-CR-0.8.3'], immutable: false, supersedesId: null, owner: 'Game Lab', note: '首版載入素材草稿。', palette: 'asset-preview--red', updatedAt: '2026-08-16T08:15:00.000Z' },
]

export function getLifecycleSnapshot(): LifecycleSnapshot {
    return structuredClone({
        games: lifecycleGames,
        versions: lifecycleVersions,
        releases: lifecycleReleases,
        environments: lifecycleEnvironments,
        settingsSnapshots: lifecycleSettingsSnapshots,
        mathSnapshots: lifecycleMathSnapshots,
        assets: lifecycleAssets,
        limitPlans: lifecycleLimitPlans,
    })
}

export function createVersionDraft(payload: CreateVersionDraftPayload): GameVersion {
    const game = lifecycleGames.find((item) => item.id === payload.gameId)
    if (!game) throw new Error('game_not_found')
    const stamp = Date.now().toString().slice(-6)
    const row: GameVersion = {
        id: `VER-${game.id}-${stamp}`, gameId: game.id, gameName: game.name, semver: payload.semver, status: 'draft',
        changeType: payload.changeType, artifact: null, settingsRef: '尚未固定', mathRef: '尚未固定', assetsRef: '尚未固定',
        validationStatus: 'pending', validationSummary: '草稿尚未建立 Build Artifact', publishedEnvironments: [], rollbackCandidate: false,
        owner: '目前操作者', summary: payload.summary, changeLog: ['建立版本草稿'], releaseIds: [], basedOnVersionId: null, updatedAt: now(),
    }
    lifecycleVersions.unshift(row)
    return structuredClone(row)
}

export function updateVersionStatus(id: string, status: GameVersion['status']): GameVersion {
    const row = lifecycleVersions.find((item) => item.id === id)
    if (!row) throw new Error('version_not_found')
    if (status === 'candidate' && !row.artifact) {
        row.artifact = artifact(row.id, `BLD-${row.gameId}-${Date.now().toString().slice(-4)}`, `sha256:mock-${Date.now().toString(16)}`, 'mock-local', now())
        row.validationSummary = 'Build Artifact 已固定，等待驗證'
    }
    if (status === 'approved') {
        row.validationStatus = 'passed'
        row.validationSummary = '驗證完成，可建立目標環境 Release'
    }
    if (status === 'cancelled') {
        row.rollbackCandidate = false
        row.validationSummary = '版本已取消，不可建立新 Release'
    }
    row.status = status
    row.updatedAt = now()
    return structuredClone(row)
}

export function approveRelease(id: string): ReleaseRecord {
    const row = lifecycleReleases.find((item) => item.id === id)
    if (!row) throw new Error('release_not_found')
    const pending = row.approvals.find((item) => item.status === 'pending')
    if (!pending) throw new Error('no_pending_approval')
    pending.status = 'approved'
    pending.approver = '目前操作者'
    pending.at = now()
    if (row.approvals.every((item) => item.status === 'approved')) row.status = 'scheduled'
    row.updatedAt = now()
    row.timeline.push({ at: row.updatedAt, actor: '目前操作者', action: '完成覆核', note: `${pending.role} 已核准` })
    return structuredClone(row)
}

export function executeRelease(id: string): ReleaseRecord {
    const row = lifecycleReleases.find((item) => item.id === id)
    if (!row) throw new Error('release_not_found')
    if (row.status !== 'scheduled') throw new Error('release_not_ready')
    if (row.environment === 'production') {
        const demoPassed = lifecycleReleases.some((item) => item.environment === 'demo' && item.buildId === row.buildId && item.status === 'succeeded')
        if (!demoPassed) throw new Error('same_artifact_demo_required')
    }
    row.status = 'succeeded'
    row.updatedAt = now()
    row.timeline.push({ at: row.updatedAt, actor: '目前操作者', action: '完成發布（原型）', note: '僅更新前端 mock 狀態，不代表執行真實 CI/CD' })
    const target = lifecycleEnvironments.find((item) => item.gameId === row.gameId && item.environment === row.environment)
    if (target) {
        target.activeVersionId = row.versionId
        target.activeSemver = row.semver
        target.activeReleaseId = row.id
        target.activeBuildId = row.buildId
        target.releaseStatus = row.status
        target.pendingReleaseId = null
        target.serviceEnabled = true
        target.health = 'healthy'
        target.ggapSync = row.environment === 'test' ? 'not_applicable' : 'pending'
        target.updatedAt = row.updatedAt
    }
    const version = lifecycleVersions.find((item) => item.id === row.versionId)
    if (version && !version.publishedEnvironments.includes(row.environment)) version.publishedEnvironments.push(row.environment)
    if (version && row.environment === 'production') version.status = 'published'
    return structuredClone(row)
}

export function createRollbackRelease(id: string): ReleaseRecord {
    const active = lifecycleReleases.find((item) => item.id === id)
    if (!active) throw new Error('release_not_found')
    const candidate = lifecycleVersions.find((item) => item.gameId === active.gameId && item.rollbackCandidate && item.id !== active.versionId)
        ?? lifecycleVersions.find((item) => item.gameId === active.gameId && item.id !== active.versionId && item.artifact)
    if (!candidate?.artifact) throw new Error('rollback_candidate_not_found')
    const createdAt = now()
    const rollback = release({
        id: `REL-RB-${Date.now().toString().slice(-8)}`, gameId: active.gameId, gameName: active.gameName,
        versionId: candidate.id, semver: candidate.semver, buildId: candidate.artifact.buildId, environment: active.environment,
        status: 'scheduled', riskLane: 'fast', changeType: 'fix', rollbackOfReleaseId: active.id, targetActiveReleaseId: active.id,
        createdAt, updatedAt: createdAt, note: `由 ${active.id} 回復至 ${candidate.semver}`,
        timeline: [{ at: createdAt, actor: '目前操作者', action: '建立回復發布紀錄', note: `原紀錄 ${active.id} 保持不可變` }],
    })
    lifecycleReleases.unshift(rollback)
    const target = lifecycleEnvironments.find((item) => item.gameId === active.gameId && item.environment === active.environment)
    if (target) target.pendingReleaseId = rollback.id
    return structuredClone(rollback)
}

export function updateGameAvailability(id: string, availability: GameAvailability, reason: string): LifecycleGame {
    const game = lifecycleGames.find((item) => item.id === id)
    if (!game) throw new Error('game_not_found')
    game.availability = availability
    game.availabilityReason = reason
    game.availabilityUpdatedAt = now()
    lifecycleEnvironments.filter((item) => item.gameId === id).forEach((item) => {
        item.availability = availability
        if (availability !== 'available') item.serviceEnabled = false
        item.ggapSync = item.environment === 'test' ? 'not_applicable' : 'pending'
        item.updatedAt = game.availabilityUpdatedAt
    })
    return structuredClone(game)
}

export function cloneSettingsSnapshot(id: string): GameSettingsSnapshot {
    const source = lifecycleSettingsSnapshots.find((item) => item.id === id)
    if (!source) throw new Error('settings_snapshot_not_found')
    const stamp = Date.now().toString().slice(-6)
    const draft: GameSettingsSnapshot = {
        ...structuredClone(source),
        id: `SET-${source.gameId}-D${stamp}`,
        revision: `draft-${stamp}`,
        status: 'draft',
        relatedVersionIds: [],
        immutable: false,
        owner: '目前操作者',
        updatedAt: now(),
    }
    lifecycleSettingsSnapshots.unshift(draft)
    return structuredClone(draft)
}

export function cloneMathSnapshot(id: string): GameMathSnapshot {
    const source = lifecycleMathSnapshots.find((item) => item.id === id)
    if (!source) throw new Error('math_snapshot_not_found')
    const stamp = Date.now().toString().slice(-6)
    const draft: GameMathSnapshot = {
        ...structuredClone(source),
        id: `MATH-${source.gameId}-D${stamp}`,
        revision: `draft-${stamp}`,
        status: 'draft',
        actualRtp: 0,
        deviation: 0,
        sampleRounds: 0,
        reviewNo: null,
        reviewer: null,
        relatedVersionIds: [],
        immutable: false,
        note: `由 ${source.id} 複製的新數值草稿。`,
        updatedAt: now(),
    } as GameMathSnapshot
    lifecycleMathSnapshots.unshift(draft)
    return structuredClone(draft)
}

export function submitMathSnapshot(id: string): GameMathSnapshot {
    const row = lifecycleMathSnapshots.find((item) => item.id === id)
    if (!row) throw new Error('math_snapshot_not_found')
    if (row.status !== 'draft') throw new Error('math_snapshot_not_draft')
    row.status = 'review'
    row.reviewNo = `REV-MATH-${Date.now().toString().slice(-8)}`
    row.sampleRounds = 1000000
    row.actualRtp = Number((row.theoreticalRtp - 0.03).toFixed(2))
    row.deviation = Number((row.actualRtp - row.theoreticalRtp).toFixed(2))
    row.updatedAt = now()
    row.note = '已建立加強覆核申請；數值異動一律走 guarded lane。'
    return structuredClone(row)
}

export function createAssetDraft(payload: CreateAssetDraftPayload): GameAssetRecord {
    const game = lifecycleGames.find((item) => item.id === payload.gameId)
    if (!game) throw new Error('game_not_found')
    const stamp = Date.now().toString().slice(-6)
    const row: GameAssetRecord = {
        id: `AST-${game.id}-${payload.type.toUpperCase().replace(' ', '-')}-${stamp}`,
        bundleId: `AST-${game.id}-DRAFT-${stamp}`,
        gameId: game.id,
        gameName: game.name,
        type: payload.type,
        locale: payload.locale,
        revision: `draft-${stamp}`,
        status: 'draft',
        checksum: `sha256:mock-asset-${stamp}`,
        storageRef: `provider-assets/${game.id.toLowerCase()}/draft/${stamp}`,
        dimensions: '待媒體檢查',
        fileSize: '待上傳',
        relatedVersionIds: payload.relatedVersionId ? [payload.relatedVersionId] : [],
        immutable: true,
        supersedesId: payload.supersedesId ?? null,
        owner: '目前操作者',
        note: payload.note,
        palette: 'asset-preview--blue',
        updatedAt: now(),
    }
    lifecycleAssets.unshift(row)
    return structuredClone(row)
}

export const lifecycleChangeTypes: ChangeType[] = ['feature', 'fix', 'math', 'asset', 'security', 'configuration']
