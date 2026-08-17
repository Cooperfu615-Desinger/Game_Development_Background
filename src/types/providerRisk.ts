export type ProviderEnvironment = 'production' | 'demo'
export type ProviderGameType = 'slots' | 'crash' | 'table'
export type RiskSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical'
export type RiskSource = 'game_service' | 'game_round' | 'ggap_integration' | 'data_quality' | 'game_math'

export type DetectionOutcome = 'matched' | 'not_matched' | 'no_data' | 'insufficient_sample' | 'evaluation_failed'
export type RiskEventStatus = 'open' | 'recovering' | 'resolved' | 'invalidated'
export type AlertStatus = 'new' | 'in_progress' | 'monitoring' | 'closed'
export type AlertResolutionCode = 'recovered' | 'false_positive' | 'duplicate' | 'accepted_risk' | 'manual_resolution'
export type MitigationJobStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled'
export type IsolationDesiredState = 'not_isolated' | 'isolated'
export type IsolationActualState = 'not_isolated' | 'applying' | 'isolated' | 'releasing' | 'failed'
export type GgapDeliveryStatus = 'pending' | 'sending' | 'sent' | 'acknowledged' | 'failed'
export type HealthVerificationResult = 'passed' | 'failed' | 'partial' | 'no_data' | 'stale'
export type MonitoringState = 'healthy' | 'degraded' | 'critical' | 'isolated' | 'no_data' | 'maintenance'
export type CommandOutcome = 'success' | 'failed' | 'version_conflict' | 'permission_denied'

export type AlertAction =
    | 'takeover'
    | 'assign'
    | 'add_note'
    | 'move_to_monitoring'
    | 'maintain_isolation'
    | 'release_isolation'
    | 'retry_job'
    | 'resend_delivery'
    | 'close'
    | 'reopen'

export interface MonitoringSignal {
    signalId: string
    source: RiskSource
    environment: ProviderEnvironment
    scope: string
    metric: string
    value: string | null
    unit: string
    observedAt: Date
    dataFreshness: string
    outcome: DetectionOutcome
}

export interface DetectionResult {
    detectionResultId: string
    ruleId: string
    ruleVersion: string
    ruleName: string
    automationMode: 'observe_only' | 'approval_required' | 'automatic'
    windowStart: Date
    windowEnd: Date
    evaluatedAt: Date
    sampleCount: number | null
    numerator: number | null
    denominator: number | null
    actualValue: string | null
    triggerThreshold: string
    recoveryThreshold: string
    dataFreshness: string
    outcome: DetectionOutcome
    evidenceSummary: string
}

export interface RelatedGameRound {
    providerRoundId: string
    ggapRoundId: string
    settledStatus: string
    occurredAt: Date
}

export interface AuditTimelineItem {
    auditId: string
    occurredAt: Date
    actor: string
    type: string
    title: string
    description: string
    fromValue?: string
    toValue?: string
    requestId?: string
    traceId?: string
    tone: 'neutral' | 'info' | 'warning' | 'danger' | 'success'
}

export interface HealthVerification {
    verificationId: string
    checkVersion: string
    checkedAt: Date
    targetScope: string
    sampleWindow: string
    dataFreshness: string
    result: HealthVerificationResult
    failedItems: string[]
    summary: string
}

export interface IsolationControl {
    isolationId: string
    environment: ProviderEnvironment
    gameId: string
    gameVersion: string
    targetScope: string
    desiredState: IsolationDesiredState
    actualState: IsolationActualState
    version: number
    lastChangedAt: Date
    healthVerification: HealthVerification
    failureReason: string | null
}

export interface MitigationJob {
    mitigationJobId: string
    actionType: string
    targetScope: string
    status: MitigationJobStatus
    necessary: boolean
    requestedBy: string
    approvedBy: string | null
    idempotencyKey: string
    attempt: number
    requestedAt: Date
    startedAt: Date | null
    completedAt: Date | null
    beforeState: string
    afterState: string | null
    result: string | null
    error: string | null
    traceId: string
    healthVerificationResult: HealthVerificationResult | null
}

export interface GgapDelivery {
    deliveryId: string
    eventType: string
    payloadVersion: string
    targetEnvironment: ProviderEnvironment
    status: GgapDeliveryStatus
    necessary: boolean
    idempotencyKey: string
    payloadSnapshot: string
    attempt: number
    createdAt: Date
    lastSentAt: Date | null
    protocolResult: string | null
    ggapTraceId: string | null
    acknowledgedAt: Date | null
    reconciliationEvidence: string
}

export interface RiskEvent {
    riskEventId: string
    eventFingerprint: string
    recurrenceGroupId: string | null
    occurrenceCount: number
    firstDetectedAt: Date
    lastDetectedAt: Date
    detectedAt: Date
    updatedAt: Date
    environment: ProviderEnvironment
    gameType: ProviderGameType
    gameId: string
    gameName: string
    gameVersion: string
    source: RiskSource
    anomalyType: string
    severity: RiskSeverity
    status: RiskEventStatus
    affectedRounds: number
    ongoing: boolean
    invalidationReason: string | null
    detection: DetectionResult
    signals: MonitoringSignal[]
    relatedRounds: RelatedGameRound[]
    alertId: string | null
    timeline: AuditTimelineItem[]
}

export interface RiskAlert {
    alertId: string
    riskEventId: string
    environment: ProviderEnvironment
    createdAt: Date
    updatedAt: Date
    status: AlertStatus
    resolutionCode: AlertResolutionCode | null
    resolutionReason: string | null
    severity: RiskSeverity
    assigneeId: string | null
    assigneeName: string | null
    waitingReason: string | null
    reviewDueAt: Date | null
    version: number
    allowedActions: AlertAction[]
    mitigationJobs: MitigationJob[]
    isolation: IsolationControl | null
    deliveries: GgapDelivery[]
    namedWaivers: string[]
    timeline: AuditTimelineItem[]
}

export interface MonitoringRoundMetric {
    success: number | null
    failed: number | null
    timeout: number | null
    processing: number | null
    dataOutcome: DetectionOutcome
    sourceSignalId: string
}

export interface MonitoringGgapMetric {
    p50: number | null
    p95: number | null
    p99: number | null
    timeouts: number | null
    failures: number | null
    retries: number | null
    dataOutcome: DetectionOutcome
    sourceSignalId: string
}

export interface MonitoringGame {
    environment: ProviderEnvironment
    gameType: ProviderGameType
    gameId: string
    gameName: string
    gameVersion: string
    state: MonitoringState
    serviceReason: string
    expectedService: boolean
    lastCheckedAt: Date
    dataFreshness: string
    round: MonitoringRoundMetric
    ggap: MonitoringGgapMetric
    riskEventIds: string[]
    providerRoundId: string | null
}

export interface AlertCommandInput {
    alertId: string
    action: AlertAction
    reason: string
    expectedVersion: number
    outcome: CommandOutcome
    assigneeName?: string
    reviewDueAt?: Date | null
    resolutionCode?: AlertResolutionCode | null
}

export interface AlertCommandResult {
    accepted: boolean
    message: string
    jobId?: string
    deliveryId?: string
}
