export type GameAvailability = 'unpublished' | 'available' | 'maintenance' | 'suspended' | 'retired'

export type GameVersionStatus = 'draft' | 'candidate' | 'approved' | 'published' | 'retired' | 'cancelled'

export type ReleaseEnvironment = 'test' | 'demo' | 'production'

export type ReleaseStatus =
    | 'preparing'
    | 'awaiting_approval'
    | 'scheduled'
    | 'deploying'
    | 'succeeded'
    | 'failed'
    | 'cancelled'
    | 'rolled_back'

export type ReleaseRiskLane = 'fast' | 'guarded'
export type ValidationStatus = 'passed' | 'failed' | 'pending' | 'skipped'
export type EnvironmentHealth = 'healthy' | 'degraded' | 'unavailable' | 'no_data'
export type GgapSyncStatus = 'synced' | 'pending' | 'failed' | 'not_applicable'
export type ChangeType = 'feature' | 'fix' | 'math' | 'asset' | 'security' | 'configuration'
export type SnapshotStatus = 'draft' | 'review' | 'approved' | 'published' | 'retired'
export type AssetStatus = 'draft' | 'review' | 'approved' | 'published' | 'retired'

export interface BuildArtifact {
    buildId: string
    versionId: string
    checksum: string
    manifestId: string
    gitCommit: string
    builtAt: string
    immutable: true
    size: string
}

export interface GameVersion {
    id: string
    gameId: string
    gameName: string
    semver: string
    status: GameVersionStatus
    changeType: ChangeType
    artifact: BuildArtifact | null
    settingsRef: string
    mathRef: string
    assetsRef: string
    validationStatus: ValidationStatus
    validationSummary: string
    publishedEnvironments: ReleaseEnvironment[]
    rollbackCandidate: boolean
    owner: string
    summary: string
    changeLog: string[]
    releaseIds: string[]
    basedOnVersionId: string | null
    updatedAt: string
}

export interface LifecycleGame {
    id: string
    name: string
    type: string
    availability: GameAvailability
    availabilityUpdatedAt: string
    availabilityReason: string
}

export interface ReleaseValidation {
    key: string
    label: string
    status: ValidationStatus
    detail: string
}

export interface ReleaseApproval {
    role: string
    approver: string | null
    status: 'pending' | 'approved' | 'rejected'
    at: string | null
}

export interface ReleaseTimelineEvent {
    at: string
    actor: string
    action: string
    note: string
}

export interface ReleaseRecord {
    id: string
    gameId: string
    gameName: string
    versionId: string
    semver: string
    buildId: string
    environment: ReleaseEnvironment
    status: ReleaseStatus
    riskLane: ReleaseRiskLane
    changeType: ChangeType
    sourceReleaseId: string | null
    rollbackOfReleaseId: string | null
    targetActiveReleaseId: string | null
    validations: ReleaseValidation[]
    approvals: ReleaseApproval[]
    scheduledAt: string | null
    createdAt: string
    updatedAt: string
    owner: string
    note: string
    timeline: ReleaseTimelineEvent[]
}

export interface EnvironmentDeployment {
    gameId: string
    gameName: string
    gameType: string
    availability: GameAvailability
    environment: ReleaseEnvironment
    activeVersionId: string | null
    activeSemver: string | null
    activeReleaseId: string | null
    activeBuildId: string | null
    releaseStatus: ReleaseStatus | 'not_released'
    serviceEnabled: boolean
    health: EnvironmentHealth
    ggapSync: GgapSyncStatus
    ggapSyncAt: string | null
    pendingReleaseId: string | null
    updatedAt: string
}

export interface BettingStructureSnapshot {
    id: string
    label: string
    formula: string
    betLevels: number[]
    coinValues: number[]
}

export interface CurrencyMultiplierSnapshot {
    id: string
    baseCurrency: 'USDT'
    rates: Array<{ currency: string; multiplier: number }>
}

export interface BetLimitPlan {
    id: string
    name: string
    baseCurrency: 'USDT'
    minBet: number
    maxBet: number
    maxPayout: number
    currencies: string[]
    status: SnapshotStatus
    updatedAt: string
}

export interface GameSettingsSnapshot {
    id: string
    gameId: string
    gameName: string
    revision: string
    status: SnapshotStatus
    bettingStructure: BettingStructureSnapshot
    currencyMultipliers: CurrencyMultiplierSnapshot
    limitPlanIds: string[]
    maintenancePolicy: string
    platforms: string[]
    languages: string[]
    relatedVersionIds: string[]
    immutable: boolean
    owner: string
    updatedAt: string
}

export interface GameMathSnapshot {
    id: string
    gameId: string
    gameName: string
    revision: string
    status: SnapshotStatus
    theoreticalRtp: number
    actualRtp: number
    deviation: number
    volatility: string
    paytableId: string
    sampleRounds: number
    reviewNo: string | null
    reviewer: string | null
    relatedVersionIds: string[]
    immutable: boolean
    riskLane: 'guarded'
    note: string
    updatedAt: string
}

export interface GameAssetRecord {
    id: string
    bundleId: string
    gameId: string
    gameName: string
    type: 'Icon' | 'Banner' | 'Loading' | 'Table Skin'
    locale: string
    revision: string
    status: AssetStatus
    checksum: string
    storageRef: string
    dimensions: string
    fileSize: string
    relatedVersionIds: string[]
    immutable: boolean
    supersedesId: string | null
    owner: string
    note: string
    palette: string
    updatedAt: string
}

export interface LifecycleSnapshot {
    games: LifecycleGame[]
    versions: GameVersion[]
    releases: ReleaseRecord[]
    environments: EnvironmentDeployment[]
    settingsSnapshots: GameSettingsSnapshot[]
    mathSnapshots: GameMathSnapshot[]
    assets: GameAssetRecord[]
    limitPlans: BetLimitPlan[]
}

export interface CreateVersionDraftPayload {
    gameId: string
    semver: string
    changeType: ChangeType
    summary: string
}

export interface UpdateVersionStatusPayload {
    status: GameVersionStatus
}

export interface UpdateAvailabilityPayload {
    availability: GameAvailability
    reason: string
}

export interface CreateAssetDraftPayload {
    gameId: string
    type: GameAssetRecord['type']
    locale: string
    relatedVersionId: string
    note: string
    supersedesId?: string | null
}
