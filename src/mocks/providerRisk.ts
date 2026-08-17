import { reactive } from 'vue'
import type {
    AlertAction,
    AlertCommandInput,
    AlertCommandResult,
    AlertResolutionCode,
    AuditTimelineItem,
    DetectionOutcome,
    GgapDelivery,
    HealthVerification,
    IsolationControl,
    MitigationJob,
    MonitoringGame,
    MonitoringSignal,
    ProviderEnvironment,
    RiskAlert,
    RiskEvent,
    RiskEventStatus,
    RiskSeverity,
    RiskSource,
} from '@/types/providerRisk'

export const environmentLabels: Record<ProviderEnvironment, string> = {
    production: '正式環境',
    demo: '展示環境',
}

export const severityLabels: Record<RiskSeverity, string> = {
    info: '資訊',
    low: '低',
    medium: '中',
    high: '高',
    critical: '嚴重',
}

export const riskEventStatusLabels: Record<RiskEventStatus, string> = {
    open: '異常中',
    recovering: '恢復觀察中',
    resolved: '已恢復',
    invalidated: '已作廢',
}

export const alertStatusLabels = {
    new: '待接手',
    in_progress: '處理中',
    monitoring: '觀察中',
    closed: '已結案',
} as const

export const resolutionCodeLabels: Record<AlertResolutionCode, string> = {
    recovered: '已恢復',
    false_positive: '誤報',
    duplicate: '重複事件',
    accepted_risk: '接受風險',
    manual_resolution: '人工解決',
}

export const sourceLabels: Record<RiskSource, string> = {
    game_service: '遊戲服務',
    game_round: '遊戲回合',
    ggap_integration: 'GGAP 直接對接',
    data_quality: '資料品質',
    game_math: '遊戲數值',
}

export const anomalyLabels: Record<string, string> = {
    settlement_failure: '結算失敗率升高',
    callback_timeout: '回呼確認逾時',
    duplicate_settlement: '重複結算風險',
    request_latency: 'GGAP 請求延遲',
    delayed_payload: '必要欄位延遲',
    service_unavailable: '遊戲服務不可用',
    payout_anomaly: '派彩結果異常',
    monitoring_no_data: '監控資料中斷',
}

export const detectionOutcomeLabels: Record<DetectionOutcome, string> = {
    matched: '規則命中',
    not_matched: '未命中',
    no_data: '無資料',
    insufficient_sample: '樣本不足',
    evaluation_failed: '評估失敗',
}

const baseNow = new Date()
let sequence = 100

function uid(prefix: string) {
    sequence += 1
    return `${prefix}_${baseNow.getTime().toString(36)}_${sequence}`
}

function hoursAgo(hours: number, minutes = 0) {
    return new Date(baseNow.getTime() - (hours * 60 + minutes) * 60_000)
}

function hoursFromNow(hours: number, minutes = 0) {
    return new Date(baseNow.getTime() + (hours * 60 + minutes) * 60_000)
}

function audit(
    occurredAt: Date,
    type: string,
    title: string,
    description: string,
    tone: AuditTimelineItem['tone'],
    actor = '風控自動化',
): AuditTimelineItem {
    return {
        auditId: uid('aud'),
        occurredAt,
        actor,
        type,
        title,
        description,
        requestId: uid('req'),
        traceId: uid('trc'),
        tone,
    }
}

function health(
    gameId: string,
    gameVersion: string,
    environment: ProviderEnvironment,
    result: HealthVerification['result'],
    checkedAt: Date,
    failedItems: string[] = [],
): HealthVerification {
    return {
        verificationId: uid('hlv'),
        checkVersion: 'health-check/v2.3',
        checkedAt,
        targetScope: `${environment}/${gameId}/${gameVersion}/launch-gate`,
        sampleWindow: '連續 15 分鐘／3 個健康窗口',
        dataFreshness: result === 'stale' ? '資料已超過 10 分鐘有效期' : '最新樣本 2 分鐘內',
        result,
        failedItems,
        summary: result === 'passed'
            ? '核心服務、結算、回呼與資料品質均通過。'
            : result === 'partial'
                ? '部分檢查通過，仍有觀察項目。'
                : result === 'no_data'
                    ? '目前沒有足夠資料完成健康驗證。'
                    : result === 'stale'
                        ? '最近一次健康結果已過期，必須重新檢查。'
                        : '健康驗證未通過，禁止解除隔離。',
    }
}

function isolation(
    id: string,
    environment: ProviderEnvironment,
    gameId: string,
    gameVersion: string,
    desiredState: IsolationControl['desiredState'],
    actualState: IsolationControl['actualState'],
    verification: HealthVerification,
    failureReason: string | null = null,
): IsolationControl {
    return {
        isolationId: id,
        environment,
        gameId,
        gameVersion,
        targetScope: `${environment}/${gameId}/${gameVersion}/new-launch`,
        desiredState,
        actualState,
        version: 3,
        lastChangedAt: hoursAgo(1, 12),
        healthVerification: verification,
        failureReason,
    }
}

function job(
    id: string,
    actionType: string,
    targetScope: string,
    status: MitigationJob['status'],
    attempt = 1,
    necessary = true,
): MitigationJob {
    const requestedAt = hoursAgo(1, 20)
    return {
        mitigationJobId: id,
        actionType,
        targetScope,
        status,
        necessary,
        requestedBy: 'risk-automation@provider',
        approvedBy: actionType.includes('isolation') ? '林怡君' : 'policy/risk-v3',
        idempotencyKey: `idem:${id.replace(/_a\d+$/, '')}`,
        attempt,
        requestedAt,
        startedAt: status === 'queued' ? null : new Date(requestedAt.getTime() + 18_000),
        completedAt: ['succeeded', 'failed', 'cancelled'].includes(status) ? new Date(requestedAt.getTime() + 76_000) : null,
        beforeState: actionType.includes('release') ? 'isolated' : 'not_isolated',
        afterState: status === 'succeeded' ? (actionType.includes('release') ? 'not_isolated' : 'isolated') : null,
        result: status === 'succeeded' ? 'Launch Gate 已回報目標狀態，健康證據已保存。' : null,
        error: status === 'failed' ? 'LAUNCH_GATE_LOCK_TIMEOUT：執行器未取得 target lock。' : null,
        traceId: uid('trc_job'),
        healthVerificationResult: status === 'succeeded' ? 'passed' : status === 'failed' ? 'failed' : null,
    }
}

function delivery(
    id: string,
    environment: ProviderEnvironment,
    eventType: string,
    status: GgapDelivery['status'],
    attempt = 1,
    necessary = true,
): GgapDelivery {
    const sent = ['sent', 'acknowledged', 'failed'].includes(status)
    return {
        deliveryId: id,
        eventType,
        payloadVersion: 'provider-risk/v1',
        targetEnvironment: environment,
        status,
        necessary,
        idempotencyKey: `ggap:${id.replace(/_a\d+$/, '')}`,
        payloadSnapshot: JSON.stringify({ event_type: eventType, environment, scope: 'game_version', mock: true }, null, 2),
        attempt,
        createdAt: hoursAgo(1, 8),
        lastSentAt: sent ? hoursAgo(1, 6) : null,
        protocolResult: status === 'failed' ? 'HTTP 503 / retryable=true' : sent ? 'HTTP 202 / request accepted' : null,
        ggapTraceId: sent ? uid('ggap_trc') : null,
        acknowledgedAt: status === 'acknowledged' ? hoursAgo(1, 4) : null,
        reconciliationEvidence: status === 'acknowledged'
            ? 'Provider actual state 與 GGAP ACK 一致。'
            : status === 'failed'
                ? 'Provider 本地狀態保留；尚未取得 GGAP ACK，不自動回滾隔離。'
                : '等待 ACK 與本地狀態對照。',
    }
}

interface EventSeed {
    riskEventId: string
    alertId?: string | null
    hours: number
    environment: ProviderEnvironment
    gameType: RiskEvent['gameType']
    gameId: string
    gameName: string
    gameVersion: string
    source: RiskSource
    anomalyType: string
    severity: RiskSeverity
    status: RiskEventStatus
    affectedRounds: number
    occurrenceCount: number
    detectionOutcome?: DetectionOutcome
    ongoing?: boolean
    recurrenceGroupId?: string | null
    invalidationReason?: string | null
}

function createEvent(seed: EventSeed): RiskEvent {
    const detectedAt = hoursAgo(seed.hours)
    const outcome = seed.detectionOutcome ?? 'matched'
    const matched = outcome === 'matched'
    const signalId = `sig_${seed.riskEventId.slice(4, 17)}`
    const signal: MonitoringSignal = {
        signalId,
        source: seed.source,
        environment: seed.environment,
        scope: `${seed.gameId}/${seed.gameVersion}`,
        metric: seed.anomalyType,
        value: outcome === 'no_data' || outcome === 'evaluation_failed' ? null : matched ? `${seed.affectedRounds}` : '0',
        unit: seed.source === 'ggap_integration' ? 'ms' : 'events',
        observedAt: new Date(detectedAt.getTime() + 8 * 60_000),
        dataFreshness: outcome === 'no_data' ? '超過允許延遲 12 分鐘' : '2 分鐘',
        outcome,
    }
    return {
        riskEventId: seed.riskEventId,
        eventFingerprint: `fp:${seed.environment}:${seed.source}:${seed.anomalyType}:${seed.gameId}:${seed.gameVersion}`,
        recurrenceGroupId: seed.recurrenceGroupId ?? `rec:${seed.environment}:${seed.gameId}:${seed.anomalyType}`,
        occurrenceCount: seed.occurrenceCount,
        firstDetectedAt: new Date(detectedAt.getTime() - 42 * 60_000),
        lastDetectedAt: new Date(detectedAt.getTime() + 18 * 60_000),
        detectedAt,
        updatedAt: new Date(detectedAt.getTime() + 34 * 60_000),
        environment: seed.environment,
        gameType: seed.gameType,
        gameId: seed.gameId,
        gameName: seed.gameName,
        gameVersion: seed.gameVersion,
        source: seed.source,
        anomalyType: seed.anomalyType,
        severity: seed.severity,
        status: seed.status,
        affectedRounds: seed.affectedRounds,
        ongoing: seed.ongoing ?? seed.status === 'open',
        invalidationReason: seed.invalidationReason ?? null,
        detection: {
            detectionResultId: `det_${seed.riskEventId.slice(4)}`,
            ruleId: `risk.${seed.source}.${seed.anomalyType}`,
            ruleVersion: seed.environment === 'production' ? 'v3.2.1' : 'v2.8.0-demo',
            ruleName: `${anomalyLabels[seed.anomalyType]}偵測規則`,
            automationMode: seed.severity === 'critical' ? 'approval_required' : seed.severity === 'high' ? 'automatic' : 'observe_only',
            windowStart: new Date(detectedAt.getTime() - 15 * 60_000),
            windowEnd: detectedAt,
            evaluatedAt: new Date(detectedAt.getTime() + 22_000),
            sampleCount: outcome === 'no_data' ? null : outcome === 'insufficient_sample' ? 18 : 1237,
            numerator: matched ? seed.affectedRounds : null,
            denominator: outcome === 'no_data' ? null : 1237,
            actualValue: outcome === 'no_data' ? null : outcome === 'insufficient_sample' ? '18 samples' : `${seed.affectedRounds} / 1,237`,
            triggerThreshold: '連續 3 個窗口超過動態警戒門檻',
            recoveryThreshold: '連續 3 個健康窗口低於恢復門檻',
            dataFreshness: signal.dataFreshness,
            outcome,
            evidenceSummary: outcome === 'no_data'
                ? '監控管線未取得完整樣本；不將缺值視為 0 或健康。'
                : outcome === 'insufficient_sample'
                    ? '樣本量未達規則版本要求，不推定目前健康。'
                    : `${sourceLabels[seed.source]}訊號命中 ${anomalyLabels[seed.anomalyType]} 規則。`,
        },
        signals: [signal],
        relatedRounds: ['no_data', 'insufficient_sample', 'evaluation_failed'].includes(outcome) ? [] : Array.from({ length: Math.min(3, Math.max(1, Math.ceil(seed.affectedRounds / 50))) }, (_, index) => ({
            providerRoundId: `pr_${seed.gameId.toLowerCase()}_${seed.riskEventId.slice(-5)}${index + 1}`,
            ggapRoundId: `gg_${seed.riskEventId.slice(-5).toUpperCase()}${index + 1}`,
            settledStatus: seed.status === 'resolved' ? '已完成' : '保留既有結算／回呼流程',
            occurredAt: new Date(detectedAt.getTime() + index * 4 * 60_000),
        })),
        alertId: seed.alertId ?? null,
        timeline: [
            audit(detectedAt, 'detection_result', '偵測結果已保存', `${detectionOutcomeLabels[outcome]}；規則與 evidence snapshot 已鎖定。`, matched ? 'danger' : 'warning'),
            audit(new Date(detectedAt.getTime() + 25_000), 'risk_event', '建立風控事件', `使用 event_fingerprint 去重，occurrence_count=${seed.occurrenceCount}。`, 'warning'),
        ],
    }
}

const events: RiskEvent[] = [
    createEvent({ riskEventId: 'rsk_01jz4m8v3k6q2d7p9x5n1c0bqa', alertId: 'alt_01jz4m8v3k6q2d7p9x5n1c0bqa', hours: 3.2, environment: 'production', gameType: 'slots', gameId: 'NH-001', gameName: 'Neon Heist', gameVersion: 'v2.4.1', source: 'game_round', anomalyType: 'settlement_failure', severity: 'critical', status: 'open', affectedRounds: 146, occurrenceCount: 48 }),
    createEvent({ riskEventId: 'rsk_01jz4f6b2c9m7q8x3n5v0d1epa', alertId: 'alt_01jz4f6b2c9m7q8x3n5v0d1epa', hours: 5.3, environment: 'production', gameType: 'crash', gameId: 'ND-014', gameName: 'Neon Drift', gameVersion: 'v1.8.3', source: 'ggap_integration', anomalyType: 'callback_timeout', severity: 'high', status: 'recovering', affectedRounds: 64, occurrenceCount: 19, ongoing: false }),
    createEvent({ riskEventId: 'rsk_01jz4b1p8w4y6h0m2k9d7c3sqa', alertId: 'alt_01jz4b1p8w4y6h0m2k9d7c3sqa', hours: 9.7, environment: 'production', gameType: 'table', gameId: 'PC-009', gameName: 'Paper Crane', gameVersion: 'v3.1.0', source: 'data_quality', anomalyType: 'duplicate_settlement', severity: 'critical', status: 'recovering', affectedRounds: 27, occurrenceCount: 9, ongoing: false }),
    createEvent({ riskEventId: 'rsk_01jz47q3n6p8v2c5m0x1d9beka', alertId: 'alt_01jz47q3n6p8v2c5m0x1d9beka', hours: 14.1, environment: 'production', gameType: 'slots', gameId: 'LH-022', gameName: 'Lucky Harbor', gameVersion: 'v5.0.2', source: 'ggap_integration', anomalyType: 'request_latency', severity: 'medium', status: 'resolved', affectedRounds: 18, occurrenceCount: 4, ongoing: false }),
    createEvent({ riskEventId: 'rsk_01jz45k2a9d6m3p7x8v0c1bqea', alertId: 'alt_01jz45k2a9d6m3p7x8v0c1bqea', hours: 17.8, environment: 'production', gameType: 'crash', gameId: 'OR-006', gameName: 'Orbit Rush', gameVersion: 'v1.4.8', source: 'data_quality', anomalyType: 'delayed_payload', severity: 'low', status: 'invalidated', affectedRounds: 3, occurrenceCount: 3, ongoing: false, invalidationReason: '延遲資料在結算前補齊；規則 v1.4 的時間窗口設定錯誤。' }),
    createEvent({ riskEventId: 'rsk_01jz42n8w5q1d7c3m9x6v0bpea', alertId: 'alt_01jz42n8w5q1d7c3m9x6v0bpea', hours: 21.4, environment: 'production', gameType: 'slots', gameId: 'SG-031', gameName: 'Solar Garden', gameVersion: 'v2.0.0', source: 'game_service', anomalyType: 'service_unavailable', severity: 'high', status: 'open', affectedRounds: 91, occurrenceCount: 22 }),
    createEvent({ riskEventId: 'rsk_01jz3y7m4c8p1d6v0x9q2bnea', hours: 31.2, environment: 'production', gameType: 'table', gameId: 'FM-017', gameName: 'Fortune Mahjong', gameVersion: 'v4.2.2', source: 'game_math', anomalyType: 'payout_anomaly', severity: 'medium', status: 'open', affectedRounds: 8, occurrenceCount: 2, ongoing: true, detectionOutcome: 'insufficient_sample' }),
    createEvent({ riskEventId: 'rsk_01jz3nodatap0x9q2bnea6v4c8', hours: 1.4, environment: 'production', gameType: 'slots', gameId: 'SR-010', gameName: 'Star Roulette', gameVersion: 'v2.9.5', source: 'data_quality', anomalyType: 'monitoring_no_data', severity: 'medium', status: 'open', affectedRounds: 0, occurrenceCount: 6, ongoing: true, detectionOutcome: 'no_data' }),
    createEvent({ riskEventId: 'rsk_01jz3s4v8n2d5c0m7x9q1bpea', alertId: 'alt_01jz3s4v8n2d5c0m7x9q1bpea', hours: 8.1, environment: 'demo', gameType: 'slots', gameId: 'NH-001', gameName: 'Neon Heist', gameVersion: 'v2.5.0-rc1', source: 'ggap_integration', anomalyType: 'request_latency', severity: 'high', status: 'open', affectedRounds: 12, occurrenceCount: 5, ongoing: true }),
]

function eventById(id: string) {
    return events.find((event) => event.riskEventId === id)
}

function createAlert(
    alertId: string,
    riskEventId: string,
    status: RiskAlert['status'],
    assigneeName: string | null,
    waitingReason: string | null,
    reviewDueAt: Date | null,
    mitigationJobs: MitigationJob[],
    isolationControl: IsolationControl | null,
    deliveries: GgapDelivery[],
    resolutionCode: AlertResolutionCode | null = null,
    resolutionReason: string | null = null,
): RiskAlert {
    const event = eventById(riskEventId)
    if (!event) throw new Error(`Missing risk event ${riskEventId}`)
    const createdAt = new Date(event.detectedAt.getTime() + 28_000)
    const timeline = [
        audit(createdAt, 'alert', '建立告警工作項目', `Alert 與 ${riskEventId} 分開追蹤人工進度。`, 'warning'),
        ...mitigationJobs.map((item) => audit(item.requestedAt, 'mitigation_job', `緩解工作 ${item.status}`, `${item.mitigationJobId} · ${item.actionType}`, item.status === 'failed' ? 'danger' : 'success')),
    ]
    return {
        alertId,
        riskEventId,
        environment: event.environment,
        createdAt,
        updatedAt: new Date(createdAt.getTime() + 32 * 60_000),
        status,
        resolutionCode,
        resolutionReason,
        severity: event.severity,
        assigneeId: assigneeName ? `usr_${assigneeName}` : null,
        assigneeName,
        waitingReason,
        reviewDueAt,
        version: 7,
        allowedActions: [],
        mitigationJobs,
        isolation: isolationControl,
        deliveries,
        namedWaivers: [],
        timeline,
    }
}

const alerts: RiskAlert[] = [
    createAlert(
        'alt_01jz4m8v3k6q2d7p9x5n1c0bqa',
        'rsk_01jz4m8v3k6q2d7p9x5n1c0bqa',
        'new', null, '等待 Launch Gate lock 與 GGAP ACK', hoursAgo(0, 42),
        [job('job_nh_isolation_a1', 'apply_isolation', 'production/NH-001/v2.4.1/new-launch', 'failed')],
        isolation('iso_nh_prod_241', 'production', 'NH-001', 'v2.4.1', 'isolated', 'failed', health('NH-001', 'v2.4.1', 'production', 'failed', hoursAgo(0, 8), ['Settle upstream 仍回傳 HTTP 502']), 'LAUNCH_GATE_LOCK_TIMEOUT'),
        [delivery('dlv_nh_isolated_a1', 'production', 'provider_game_isolated', 'failed', 3)],
    ),
    createAlert(
        'alt_01jz4f6b2c9m7q8x3n5v0d1epa',
        'rsk_01jz4f6b2c9m7q8x3n5v0d1epa',
        'in_progress', '林怡君', '等待健康觀察窗口完成', hoursFromNow(1, 10),
        [job('job_nd_isolation_a1', 'apply_isolation', 'production/ND-014/v1.8.3/new-launch', 'succeeded')],
        isolation('iso_nd_prod_183', 'production', 'ND-014', 'v1.8.3', 'isolated', 'isolated', health('ND-014', 'v1.8.3', 'production', 'passed', hoursAgo(0, 12))),
        [delivery('dlv_nd_isolated_a1', 'production', 'provider_game_isolated', 'acknowledged')],
    ),
    createAlert(
        'alt_01jz4b1p8w4y6h0m2k9d7c3sqa',
        'rsk_01jz4b1p8w4y6h0m2k9d7c3sqa',
        'monitoring', '陳冠廷', '等待資料品質連續健康窗口', hoursAgo(0, 28),
        [job('job_pc_isolation_a1', 'apply_isolation', 'production/PC-009/v3.1.0/new-launch', 'succeeded')],
        isolation('iso_pc_prod_310', 'production', 'PC-009', 'v3.1.0', 'isolated', 'isolated', health('PC-009', 'v3.1.0', 'production', 'partial', hoursAgo(0, 18), ['健康窗口僅完成 2/3'])),
        [delivery('dlv_pc_isolated_a1', 'production', 'provider_game_isolated', 'acknowledged')],
    ),
    createAlert(
        'alt_01jz47q3n6p8v2c5m0x1d9beka',
        'rsk_01jz47q3n6p8v2c5m0x1d9beka',
        'closed', '王子安', null, null,
        [job('job_lh_retry_a1', 'retry_callback', 'production/LH-022/v5.0.2/callback', 'succeeded')],
        isolation('iso_lh_prod_502', 'production', 'LH-022', 'v5.0.2', 'not_isolated', 'not_isolated', health('LH-022', 'v5.0.2', 'production', 'passed', hoursAgo(12))),
        [delivery('dlv_lh_released_a1', 'production', 'provider_game_released', 'acknowledged')],
        'recovered', '健康窗口完成，必要工作與 GGAP ACK 均已驗證。',
    ),
    createAlert(
        'alt_01jz45k2a9d6m3p7x8v0c1bqea',
        'rsk_01jz45k2a9d6m3p7x8v0c1bqea',
        'closed', '王子安', null, null,
        [], null, [], 'false_positive', '規則時間窗口設定錯誤，原始證據保留並將 Event 作廢。',
    ),
    createAlert(
        'alt_01jz42n8w5q1d7c3m9x6v0bpea',
        'rsk_01jz42n8w5q1d7c3m9x6v0bpea',
        'new', null, '等待隔離工作重試', hoursFromNow(0, 35),
        [job('job_sg_isolation_a1', 'apply_isolation', 'production/SG-031/v2.0.0/new-launch', 'failed')],
        isolation('iso_sg_prod_200', 'production', 'SG-031', 'v2.0.0', 'isolated', 'failed', health('SG-031', 'v2.0.0', 'production', 'failed', hoursAgo(0, 6), ['Game service health 回傳 HTTP 503']), 'EXECUTOR_LOCK_UNAVAILABLE'),
        [delivery('dlv_sg_isolated_a1', 'production', 'provider_mitigation_failed', 'failed', 2)],
    ),
    createAlert(
        'alt_01jz3s4v8n2d5c0m7x9q1bpea',
        'rsk_01jz3s4v8n2d5c0m7x9q1bpea',
        'new', null, '等待 DEMO sandbox 對接覆核', hoursFromNow(3),
        [job('job_nh_demo_retry_a1', 'retry_launch', 'demo/NH-001/v2.5.0-rc1/launch', 'succeeded')],
        isolation('iso_nh_demo_250', 'demo', 'NH-001', 'v2.5.0-rc1', 'isolated', 'isolated', health('NH-001', 'v2.5.0-rc1', 'demo', 'passed', hoursAgo(0, 20))),
        [delivery('dlv_nh_demo_a1', 'demo', 'provider_game_isolated', 'sent')],
    ),
]

function monitoringGame(input: MonitoringGame): MonitoringGame {
    return input
}

const monitoringGames: MonitoringGame[] = [
    monitoringGame({ environment: 'production', gameType: 'slots', gameId: 'NH-001', gameName: 'Neon Heist', gameVersion: 'v2.4.1', state: 'critical', serviceReason: '核心服務可用，但結算失敗率持續高於門檻。', expectedService: true, lastCheckedAt: hoursAgo(0, 2), dataFreshness: '2 分鐘', round: { success: 48234, failed: 146, timeout: 12, processing: 16, dataOutcome: 'matched', sourceSignalId: 'sig_round_nh' }, ggap: { p50: 62, p95: 246, p99: 520, timeouts: 12, failures: 18, retries: 31, dataOutcome: 'matched', sourceSignalId: 'sig_ggap_nh' }, riskEventIds: ['rsk_01jz4m8v3k6q2d7p9x5n1c0bqa'], providerRoundId: 'pr_nh_8a31f21' }),
    monitoringGame({ environment: 'production', gameType: 'crash', gameId: 'ND-014', gameName: 'Neon Drift', gameVersion: 'v1.8.3', state: 'isolated', serviceReason: '指定版本新 Launch 隔離中；既有回合與 Callback 繼續完成。', expectedService: true, lastCheckedAt: hoursAgo(0, 2), dataFreshness: '2 分鐘', round: { success: 18720, failed: 42, timeout: 19, processing: 8, dataOutcome: 'matched', sourceSignalId: 'sig_round_nd' }, ggap: { p50: 142, p95: 342, p99: 608, timeouts: 12, failures: 5, retries: 16, dataOutcome: 'matched', sourceSignalId: 'sig_ggap_nd' }, riskEventIds: ['rsk_01jz4f6b2c9m7q8x3n5v0d1epa'], providerRoundId: 'pr_nd_4f91a21' }),
    monitoringGame({ environment: 'production', gameType: 'table', gameId: 'PC-009', gameName: 'Paper Crane', gameVersion: 'v3.1.0', state: 'isolated', serviceReason: '隔離已生效，解除前健康窗口僅完成 2/3。', expectedService: true, lastCheckedAt: hoursAgo(0, 1), dataFreshness: '1 分鐘', round: { success: 6204, failed: 96, timeout: 31, processing: 4, dataOutcome: 'matched', sourceSignalId: 'sig_round_pc' }, ggap: { p50: 204, p95: 780, p99: 1420, timeouts: 38, failures: 22, retries: 44, dataOutcome: 'matched', sourceSignalId: 'sig_ggap_pc' }, riskEventIds: ['rsk_01jz4b1p8w4y6h0m2k9d7c3sqa'], providerRoundId: 'pr_pc_aa31d91' }),
    monitoringGame({ environment: 'production', gameType: 'slots', gameId: 'SG-031', gameName: 'Solar Garden', gameVersion: 'v2.0.0', state: 'critical', serviceReason: '遊戲服務連續健康檢查失敗，隔離套用亦失敗。', expectedService: true, lastCheckedAt: hoursAgo(0, 3), dataFreshness: '3 分鐘', round: { success: 8124, failed: 76, timeout: 14, processing: 12, dataOutcome: 'matched', sourceSignalId: 'sig_round_sg' }, ggap: { p50: 55, p95: 108, p99: 164, timeouts: 0, failures: 3, retries: 3, dataOutcome: 'matched', sourceSignalId: 'sig_ggap_sg' }, riskEventIds: ['rsk_01jz42n8w5q1d7c3m9x6v0bpea'], providerRoundId: 'pr_sg_98c20b1' }),
    monitoringGame({ environment: 'production', gameType: 'slots', gameId: 'SR-010', gameName: 'Star Roulette', gameVersion: 'v2.9.5', state: 'no_data', serviceReason: '健康資料超過有效時間；不可顯示為健康。', expectedService: true, lastCheckedAt: hoursAgo(0, 38), dataFreshness: '已過期 28 分鐘', round: { success: null, failed: null, timeout: null, processing: null, dataOutcome: 'insufficient_sample', sourceSignalId: 'sig_round_sr' }, ggap: { p50: null, p95: null, p99: null, timeouts: null, failures: null, retries: null, dataOutcome: 'no_data', sourceSignalId: 'sig_ggap_sr' }, riskEventIds: ['rsk_01jz3nodatap0x9q2bnea6v4c8'], providerRoundId: null }),
    monitoringGame({ environment: 'production', gameType: 'table', gameId: 'FM-017', gameName: 'Fortune Mahjong', gameVersion: 'v4.2.2', state: 'degraded', serviceReason: '服務正常；遊戲數值樣本不足，仍需觀察。', expectedService: true, lastCheckedAt: hoursAgo(0, 2), dataFreshness: '2 分鐘', round: { success: 12548, failed: 18, timeout: 3, processing: 9, dataOutcome: 'matched', sourceSignalId: 'sig_round_fm' }, ggap: { p50: 71, p95: 136, p99: 208, timeouts: 0, failures: 0, retries: 1, dataOutcome: 'not_matched', sourceSignalId: 'sig_ggap_fm' }, riskEventIds: ['rsk_01jz3y7m4c8p1d6v0x9q2bnea'], providerRoundId: 'pr_fm_1a3c701' }),
    monitoringGame({ environment: 'production', gameType: 'slots', gameId: 'OT-018', gameName: 'Ocean Treasure', gameVersion: 'v1.6.8', state: 'healthy', serviceReason: '健康檢查、Round 與 GGAP 直接對接均正常。', expectedService: true, lastCheckedAt: hoursAgo(0, 1), dataFreshness: '1 分鐘', round: { success: 36290, failed: 9, timeout: 2, processing: 11, dataOutcome: 'not_matched', sourceSignalId: 'sig_round_ot' }, ggap: { p50: 58, p95: 112, p99: 170, timeouts: 1, failures: 1, retries: 2, dataOutcome: 'not_matched', sourceSignalId: 'sig_ggap_ot' }, riskEventIds: [], providerRoundId: 'pr_ot_0ba7e21' }),
    monitoringGame({ environment: 'production', gameType: 'slots', gameId: 'GP-021', gameName: 'Golden Panda', gameVersion: 'v5.2.0', state: 'maintenance', serviceReason: '排定版本維護，預計 15:30 恢復。', expectedService: false, lastCheckedAt: hoursAgo(0, 8), dataFreshness: '8 分鐘', round: { success: null, failed: null, timeout: null, processing: null, dataOutcome: 'no_data', sourceSignalId: 'sig_round_gp' }, ggap: { p50: null, p95: null, p99: null, timeouts: null, failures: null, retries: null, dataOutcome: 'no_data', sourceSignalId: 'sig_ggap_gp' }, riskEventIds: [], providerRoundId: null }),
    monitoringGame({ environment: 'demo', gameType: 'slots', gameId: 'NH-001', gameName: 'Neon Heist', gameVersion: 'v2.5.0-rc1', state: 'isolated', serviceReason: 'DEMO sandbox 新 Launch 隔離中，與 Production 狀態分離。', expectedService: true, lastCheckedAt: hoursAgo(0, 1), dataFreshness: '1 分鐘', round: { success: 3210, failed: 12, timeout: 1, processing: 2, dataOutcome: 'matched', sourceSignalId: 'sig_round_nh_demo' }, ggap: { p50: 52, p95: 206, p99: 358, timeouts: 3, failures: 1, retries: 4, dataOutcome: 'matched', sourceSignalId: 'sig_ggap_nh_demo' }, riskEventIds: ['rsk_01jz3s4v8n2d5c0m7x9q1bpea'], providerRoundId: 'pr_nh_demo_5b1e1' }),
    monitoringGame({ environment: 'demo', gameType: 'crash', gameId: 'CD-002', gameName: 'Crash Drift', gameVersion: 'v1.9.0-rc2', state: 'healthy', serviceReason: '展示環境健康檢查正常。', expectedService: true, lastCheckedAt: hoursAgo(0, 2), dataFreshness: '2 分鐘', round: { success: 1846, failed: 0, timeout: 0, processing: 1, dataOutcome: 'not_matched', sourceSignalId: 'sig_round_cd_demo' }, ggap: { p50: 61, p95: 116, p99: 168, timeouts: 0, failures: 0, retries: 0, dataOutcome: 'not_matched', sourceSignalId: 'sig_ggap_cd_demo' }, riskEventIds: [], providerRoundId: 'pr_cd_demo_001' }),
]

export const providerRiskState = reactive({
    riskEvents: events,
    alerts,
    monitoringGames,
    lastUpdatedAt: new Date(),
    mockLabel: '前端契約 Mock · 未連接正式 Backend／GGAP API',
})

function getRiskEvent(riskEventId: string) {
    return providerRiskState.riskEvents.find((event) => event.riskEventId === riskEventId) ?? null
}

function getAlert(alertId: string) {
    return providerRiskState.alerts.find((alert) => alert.alertId === alertId) ?? null
}

function getAlertForEvent(riskEventId: string) {
    return providerRiskState.alerts.find((alert) => alert.riskEventId === riskEventId) ?? null
}

function isActiveAlert(alert: RiskAlert) {
    return alert.status !== 'closed'
}

function latestJobAttempts(alert: RiskAlert) {
    const byIdempotencyKey = new Map<string, MitigationJob>()
    alert.mitigationJobs.forEach((item) => {
        const current = byIdempotencyKey.get(item.idempotencyKey)
        if (!current || item.attempt >= current.attempt) byIdempotencyKey.set(item.idempotencyKey, item)
    })
    return [...byIdempotencyKey.values()]
}

function latestNecessaryDelivery(alert: RiskAlert) {
    return [...alert.deliveries].reverse().find((item) => item.necessary) ?? null
}

function recomputeAllowedActions(alert: RiskAlert) {
    const actions: AlertAction[] = []
    if (alert.status === 'closed') {
        actions.push('reopen')
        alert.allowedActions = actions
        return
    }
    if (alert.status === 'new' && !alert.assigneeId) actions.push('takeover')
    actions.push('assign', 'add_note')
    if (alert.status === 'in_progress') actions.push('move_to_monitoring')
    if (!alert.isolation || alert.isolation.desiredState !== 'isolated' || alert.isolation.actualState === 'failed') actions.push('maintain_isolation')
    if (alert.isolation?.actualState === 'isolated') actions.push('release_isolation')
    if (latestJobAttempts(alert).some((item) => item.status === 'failed')) actions.push('retry_job')
    const currentDelivery = latestNecessaryDelivery(alert)
    if (currentDelivery && ['failed', 'sent'].includes(currentDelivery.status)) actions.push('resend_delivery')
    actions.push('close')
    alert.allowedActions = actions
}

providerRiskState.alerts.forEach(recomputeAllowedActions)

function pushAudit(alert: RiskAlert, type: string, title: string, description: string, tone: AuditTimelineItem['tone'], actor = '目前使用者') {
    const entry = audit(new Date(), type, title, description, tone, actor)
    alert.timeline.push(entry)
    const event = getRiskEvent(alert.riskEventId)
    if (event) {
        event.timeline.push({ ...entry, auditId: uid('aud_evt') })
        event.updatedAt = new Date()
    }
    alert.updatedAt = new Date()
    providerRiskState.lastUpdatedAt = new Date()
}

function closeGateFailures(alert: RiskAlert, resolutionCode?: AlertResolutionCode | null, reason = '') {
    const failures: string[] = []
    if (!resolutionCode) failures.push('尚未選擇 resolution_code。')
    if (!reason.trim()) failures.push('尚未填寫可稽核的結案原因。')
    const pendingJobs = latestJobAttempts(alert).filter((item) => item.necessary && ['queued', 'running', 'failed'].includes(item.status))
    if (pendingJobs.length && !alert.namedWaivers.some((item) => item.startsWith('job:'))) failures.push(`仍有 ${pendingJobs.length} 筆必要工作 queued／running／failed。`)
    if (alert.isolation?.desiredState === 'not_isolated' && alert.isolation.actualState !== 'not_isolated') failures.push('隔離 desired 已是 not_isolated，但 actual 尚未回到 not_isolated。')
    if (alert.isolation && ['applying', 'releasing', 'failed'].includes(alert.isolation.actualState)) failures.push(`隔離 actual_state=${alert.isolation.actualState}，仍不可結案。`)
    const necessaryDelivery = latestNecessaryDelivery(alert)
    if (necessaryDelivery && necessaryDelivery.status !== 'acknowledged' && !alert.namedWaivers.some((item) => item.startsWith('delivery:'))) failures.push(`必要 GGAP Delivery 尚未 acknowledged（${necessaryDelivery.status}）。`)
    return failures
}

function actionDisabledReason(alert: RiskAlert, action: AlertAction) {
    if (!alert.allowedActions.includes(action)) return 'Backend allowed_actions 未允許此操作。'
    if (action === 'release_isolation') {
        const verification = alert.isolation?.healthVerification
        if (!verification) return '沒有可驗證的最新健康檢查。'
        if (verification.result !== 'passed') return `健康檢查為 ${verification.result}，過期、無資料或部分失敗都不可解除。`
        if (verification.failedItems.length) return '健康檢查仍有失敗項目。'
    }
    if (action === 'retry_job' && !latestJobAttempts(alert).some((item) => item.status === 'failed')) return '目前沒有可重試的最新工作；歷史失敗已由後續 attempt 取代。'
    const currentDelivery = latestNecessaryDelivery(alert)
    if (action === 'resend_delivery' && (!currentDelivery || !['failed', 'sent'].includes(currentDelivery.status))) return '目前最新必要投遞沒有失敗或等待 ACK。'
    return ''
}

function setVersion(alert: RiskAlert) {
    alert.version += 1
    recomputeAllowedActions(alert)
}

function makeLiveJob(alert: RiskAlert, actionType: string, targetScope: string, attempt: number, idempotencyKey: string) {
    const liveJob: MitigationJob = {
        mitigationJobId: uid('job'),
        actionType,
        targetScope,
        status: 'queued',
        necessary: true,
        requestedBy: '目前使用者',
        approvedBy: '風控值班主管',
        idempotencyKey,
        attempt,
        requestedAt: new Date(),
        startedAt: null,
        completedAt: null,
        beforeState: alert.isolation?.actualState ?? 'not_isolated',
        afterState: null,
        result: null,
        error: null,
        traceId: uid('trc_job'),
        healthVerificationResult: null,
    }
    alert.mitigationJobs.push(liveJob)
    pushAudit(alert, 'mitigation_job', 'Command 已接受，工作進入 queued', `${liveJob.mitigationJobId} · ${actionType} · attempt ${attempt}`, 'info')
    return liveJob
}

function createLiveDelivery(alert: RiskAlert, eventType: string, outcome: AlertCommandInput['outcome']) {
    const event = getRiskEvent(alert.riskEventId)
    if (!event) return null
    const item: GgapDelivery = {
        deliveryId: uid('dlv'),
        eventType,
        payloadVersion: 'provider-risk/v1',
        targetEnvironment: alert.environment,
        status: 'pending',
        necessary: true,
        idempotencyKey: `ggap:${event.riskEventId}:${eventType}`,
        payloadSnapshot: JSON.stringify({ risk_event_id: event.riskEventId, alert_id: alert.alertId, event_type: eventType, environment: alert.environment, scope: alert.isolation?.targetScope, mock: true }, null, 2),
        attempt: 1,
        createdAt: new Date(),
        lastSentAt: null,
        protocolResult: null,
        ggapTraceId: null,
        acknowledgedAt: null,
        reconciliationEvidence: '等待投遞與 ACK。',
    }
    alert.deliveries.push(item)
    pushAudit(alert, 'ggap_delivery', 'GGAP Delivery 已寫入 outbox', `${item.deliveryId} · pending`, 'info')
    runDeliveryLifecycle(alert, item, outcome)
    return item
}

function runDeliveryLifecycle(alert: RiskAlert, item: GgapDelivery, outcome: AlertCommandInput['outcome']) {
    window.setTimeout(() => {
        item.status = 'sending'
        item.attempt += item.lastSentAt ? 1 : 0
        setVersion(alert)
        pushAudit(alert, 'ggap_delivery', 'GGAP Delivery sending', `${item.deliveryId} · attempt ${item.attempt}`, 'info')
    }, 420)
    window.setTimeout(() => {
        item.lastSentAt = new Date()
        item.ggapTraceId = uid('ggap_trc')
        if (outcome === 'failed') {
            item.status = 'failed'
            item.protocolResult = 'HTTP 503 / retryable=true'
            item.reconciliationEvidence = '本地安全狀態保留；通知失敗不自動解除隔離。'
            pushAudit(alert, 'ggap_delivery', 'GGAP Delivery failed', `${item.deliveryId} · HTTP 503`, 'danger')
        } else {
            item.status = 'sent'
            item.protocolResult = 'HTTP 202 / request accepted'
            item.reconciliationEvidence = '請求已送出，等待契約 ACK；sent 不等於 acknowledged。'
            pushAudit(alert, 'ggap_delivery', 'GGAP Delivery sent', `${item.deliveryId} 已送出，尚未 ACK。`, 'info')
        }
        setVersion(alert)
    }, 900)
    if (outcome !== 'failed') {
        window.setTimeout(() => {
            item.status = 'acknowledged'
            item.acknowledgedAt = new Date()
            item.reconciliationEvidence = 'Provider actual state 與 GGAP ACK 一致。'
            setVersion(alert)
            pushAudit(alert, 'ggap_delivery', 'GGAP Delivery acknowledged', `${item.deliveryId} 已取得符合契約的 ACK。`, 'success')
        }, 1550)
    }
}

function runJobLifecycle(alert: RiskAlert, item: MitigationJob, outcome: AlertCommandInput['outcome'], onSuccess: () => void, onFailure: () => void) {
    window.setTimeout(() => {
        item.status = 'running'
        item.startedAt = new Date()
        setVersion(alert)
        pushAudit(alert, 'mitigation_job', '工作進入 running', `${item.mitigationJobId} 正在執行；相同冪等工作不可重複觸發。`, 'warning')
    }, 450)
    window.setTimeout(() => {
        item.completedAt = new Date()
        if (outcome === 'failed') {
            item.status = 'failed'
            item.error = 'MOCK_EXECUTION_FAILED：執行器回報可重試錯誤。'
            item.healthVerificationResult = 'failed'
            onFailure()
            pushAudit(alert, 'mitigation_job', '工作執行失敗', `${item.mitigationJobId} · ${item.error}`, 'danger')
        } else {
            item.status = 'succeeded'
            item.result = '實際副作用已由執行器回報成功，並保存驗證證據。'
            item.healthVerificationResult = 'passed'
            onSuccess()
            pushAudit(alert, 'mitigation_job', '工作執行成功', `${item.mitigationJobId} · succeeded`, 'success')
        }
        setVersion(alert)
    }, 1300)
}

function applyAlertCommand(input: AlertCommandInput): AlertCommandResult {
    const alert = getAlert(input.alertId)
    if (!alert) return { accepted: false, message: '找不到指定 Alert。' }
    if (input.outcome === 'version_conflict' || input.expectedVersion !== alert.version) {
        return { accepted: false, message: `VERSION_CONFLICT：畫面 version=${input.expectedVersion}，最新 version=${alert.version}。請重新載入後再操作。` }
    }
    if (input.outcome === 'permission_denied') return { accepted: false, message: 'PERMISSION_DENIED：目前角色沒有此敏感 command 的執行權限。' }
    const disabled = actionDisabledReason(alert, input.action)
    if (disabled) return { accepted: false, message: disabled }
    const event = getRiskEvent(alert.riskEventId)
    if (!event) return { accepted: false, message: '關聯 Risk Event 不存在。' }
    const reason = input.reason.trim()

    if (input.action === 'takeover') {
        alert.assigneeId = 'usr_current'
        alert.assigneeName = '目前使用者'
        alert.status = 'in_progress'
        alert.waitingReason = null
        setVersion(alert)
        pushAudit(alert, 'alert_command', '接手處理', reason || '目前使用者接手此告警。', 'warning')
        return { accepted: true, message: '已接手，Alert 進入 in_progress。' }
    }
    if (input.action === 'assign') {
        if (!input.assigneeName) return { accepted: false, message: '請選擇負責人。' }
        const before = alert.assigneeName ?? '未指派'
        alert.assigneeId = `usr_${input.assigneeName}`
        alert.assigneeName = input.assigneeName
        setVersion(alert)
        pushAudit(alert, 'alert_command', '指派／改派', `${before} → ${input.assigneeName}。${reason}`, 'info')
        return { accepted: true, message: '負責人已更新，Alert 狀態未被合併改寫。' }
    }
    if (input.action === 'add_note') {
        if (!reason) return { accepted: false, message: '請輸入備註內容。' }
        setVersion(alert)
        pushAudit(alert, 'alert_note', '新增處理備註', reason, 'neutral')
        return { accepted: true, message: '備註已加入 append-only timeline。' }
    }
    if (input.action === 'move_to_monitoring') {
        if (!reason) return { accepted: false, message: '請填寫觀察條件與 waiting reason。' }
        alert.status = 'monitoring'
        alert.waitingReason = reason
        alert.reviewDueAt = input.reviewDueAt ?? hoursFromNow(2)
        setVersion(alert)
        pushAudit(alert, 'alert_command', '轉入觀察', `${reason}；覆核期限 ${alert.reviewDueAt.toISOString()}`, 'warning')
        return { accepted: true, message: 'Alert 已進入 monitoring；Risk Event 狀態維持獨立。' }
    }
    if (input.action === 'close') {
        const failures = closeGateFailures(alert, input.resolutionCode, reason)
        if (failures.length) return { accepted: false, message: `結案守門未通過：${failures.join(' ')}` }
        alert.status = 'closed'
        alert.resolutionCode = input.resolutionCode ?? null
        alert.resolutionReason = reason
        alert.waitingReason = null
        setVersion(alert)
        pushAudit(alert, 'alert_command', 'Alert 已結案', `${input.resolutionCode} · ${reason}`, 'success')
        return { accepted: true, message: 'Alert 已結案；Risk Event 狀態未被人工改寫。' }
    }
    if (input.action === 'reopen') {
        if (!reason) return { accepted: false, message: '請填寫重新開啟原因。' }
        alert.status = 'in_progress'
        alert.resolutionCode = null
        alert.resolutionReason = null
        alert.waitingReason = '重新開啟後待處理'
        setVersion(alert)
        pushAudit(alert, 'alert_command', '重新開啟 Alert', reason, 'warning')
        return { accepted: true, message: 'Alert 已重新開啟至 in_progress。' }
    }

    if (input.action === 'resend_delivery') {
        const item = latestNecessaryDelivery(alert)
        if (item && !['failed', 'sent'].includes(item.status)) return { accepted: false, message: '最新必要 Delivery 不需要重送。' }
        if (!item) return { accepted: false, message: '沒有可重送的 Delivery。' }
        item.status = 'pending'
        item.reconciliationEvidence = '人工重送已排入 outbox；沿用相同業務冪等 key。'
        setVersion(alert)
        pushAudit(alert, 'ggap_delivery', '重送 command 已接受', `${item.deliveryId} · idempotency_key=${item.idempotencyKey}`, 'warning')
        runDeliveryLifecycle(alert, item, input.outcome)
        return { accepted: true, message: 'Delivery 已回到 pending，將依序經過 sending／sent／ACK。', deliveryId: item.deliveryId }
    }

    let actionType = input.action
    let targetScope = `${alert.environment}/${event.gameId}/${event.gameVersion}`
    let attempt = 1
    let idempotencyKey = `cmd:${alert.alertId}:${input.action}`
    if (input.action === 'retry_job') {
        const failed = [...latestJobAttempts(alert)].reverse().find((item) => item.status === 'failed')
        if (!failed) return { accepted: false, message: '沒有可重試的失敗工作。' }
        actionType = failed.actionType as AlertAction
        targetScope = failed.targetScope
        attempt = failed.attempt + 1
        idempotencyKey = failed.idempotencyKey
    }
    if (input.action === 'maintain_isolation') {
        actionType = 'maintain_isolation'
        if (!alert.isolation) {
            alert.isolation = isolation(uid('iso'), alert.environment, event.gameId, event.gameVersion, 'isolated', 'applying', health(event.gameId, event.gameVersion, alert.environment, 'failed', new Date(), ['尚未完成隔離後健康驗證']))
        }
        alert.isolation.desiredState = 'isolated'
        alert.isolation.actualState = 'applying'
        alert.isolation.failureReason = null
        alert.isolation.lastChangedAt = new Date()
        targetScope = alert.isolation.targetScope
    }
    if (input.action === 'release_isolation' && alert.isolation) {
        actionType = 'release_isolation'
        alert.isolation.desiredState = 'not_isolated'
        alert.isolation.actualState = 'releasing'
        alert.isolation.failureReason = null
        alert.isolation.lastChangedAt = new Date()
        targetScope = alert.isolation.targetScope
    }
    const liveJob = makeLiveJob(alert, actionType, targetScope, attempt, idempotencyKey)
    setVersion(alert)
    runJobLifecycle(
        alert,
        liveJob,
        input.outcome,
        () => {
            if (alert.isolation && actionType.includes('isolation')) {
                const released = actionType.includes('release')
                alert.isolation.actualState = released ? 'not_isolated' : 'isolated'
                alert.isolation.desiredState = released ? 'not_isolated' : 'isolated'
                alert.isolation.version += 1
                alert.isolation.lastChangedAt = new Date()
                liveJob.afterState = alert.isolation.actualState
                createLiveDelivery(alert, released ? 'provider_game_released' : 'provider_game_isolated', input.outcome)
            }
        },
        () => {
            if (alert.isolation && actionType.includes('isolation')) {
                alert.isolation.actualState = 'failed'
                alert.isolation.failureReason = 'MOCK_EXECUTION_FAILED'
                alert.isolation.version += 1
                alert.isolation.lastChangedAt = new Date()
            }
        },
    )
    return { accepted: true, message: 'Command 已接受；queued 不代表副作用成功，請觀察 Job 實際狀態。', jobId: liveJob.mitigationJobId }
}

export function refreshProviderRiskMock() {
    providerRiskState.lastUpdatedAt = new Date()
}

export function useProviderRiskMock() {
    return {
        state: providerRiskState,
        getRiskEvent,
        getAlert,
        getAlertForEvent,
        isActiveAlert,
        latestJobAttempts,
        latestNecessaryDelivery,
        recomputeAllowedActions,
        closeGateFailures,
        actionDisabledReason,
        applyAlertCommand,
        refresh: refreshProviderRiskMock,
    }
}
