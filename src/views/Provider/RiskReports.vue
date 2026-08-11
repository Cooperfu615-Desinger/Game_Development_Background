<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import RadioButton from 'primevue/radiobutton'
import Select from 'primevue/select'
import DateTimeRangeField from '@/components/ui/DateTimeRangeField.vue'
import FilterCard from '@/components/ui/FilterCard.vue'
import SectionCard from '@/components/ui/SectionCard.vue'

type Environment = 'production' | 'demo'
type DateRange = [Date | null, Date | null]
type QuickRange = '24h' | '72h' | '120h' | 'custom'
type GameType = 'slots' | 'crash' | 'table'
type Severity = 'info' | 'low' | 'medium' | 'high' | 'critical'
type HandlingStatus = 'pending' | 'investigating' | 'mitigated' | 'closed' | 'false_positive'
type MitigationStatus = 'not_required' | 'pending' | 'applied' | 'failed' | 'released'
type IsolationStatus = 'not_isolated' | 'isolated' | 'released'
type GgapNotificationStatus = 'not_required' | 'pending' | 'sent' | 'failed' | 'acknowledged'

interface TimelineItem {
    time: Date
    label: string
    description: string
    tone: 'neutral' | 'warning' | 'danger' | 'success'
}

interface RelatedRound {
    providerId: string
    ggapId: string
    settleStatus: string
    occurredAt: Date
}

interface RiskEvent {
    riskEventId: string
    alertId?: string
    detectedAt: Date
    firstSeenAt: Date
    lastOccurredAt: Date
    occurredCount: number
    environment: Environment
    gameType: GameType
    gameId: string
    gameName: string
    gameVersion: string
    source: string
    anomalyType: string
    severity: Severity
    affectedRounds: number
    status: HandlingStatus
    mitigationStatus: MitigationStatus
    mitigationAction: string
    mitigationScope: string
    isolationStatus: IsolationStatus
    ggapNotificationStatus: GgapNotificationStatus
    updatedAt: Date
    providerRoundIds: string[]
    ggapRoundIds: string[]
    isOngoing: boolean
    ruleId: string
    ruleVersion: string
    threshold: string
    actualValue: string
    statisticWindow: string
    errorCode: string
    errorMessage: string
    requestSummary: string
    responseSummary: string
    mitigationStartedAt: Date | null
    mitigationCompletedAt: Date | null
    mitigationFailureReason: string
    ggapProviderEventId: string
    ggapSentAt: Date | null
    ggapAckAt: Date | null
    ggapRetryCount: number
    relatedRounds: RelatedRound[]
    timeline: TimelineItem[]
}

interface FilterState {
    quickRange: QuickRange
    dateRange: DateRange
    environment: Environment
    gameType: GameType | ''
    game: string
    anomalyType: string
    severity: Severity | ''
    status: 'unresolved' | 'in_progress' | 'resolved' | ''
    riskEventId: string
    gameVersion: string
    source: string
    mitigationStatus: MitigationStatus | ''
    isolationStatus: IsolationStatus | ''
    ggapNotificationStatus: GgapNotificationStatus | ''
    providerGameRoundId: string
    ggapRoundId: string
}

interface PageEvent {
    first?: number
    rows?: number
}

const route = useRoute()
const router = useRouter()
const timezoneLabel = 'UTC+08:00 · Asia/Taipei'
const now = new Date()

const gameTypeLabels: Record<GameType, string> = {
    slots: '老虎機',
    crash: '碰撞遊戲',
    table: '棋牌遊戲',
}

const environmentLabels: Record<Environment, string> = {
    production: '正式環境',
    demo: '展示環境',
}

const environmentOptionLabels: Record<Environment, string> = {
    production: '正式環境（Production）',
    demo: '展示環境（DEMO）',
}

const gameTypeOptionLabels: Record<GameType, string> = {
    slots: '老虎機（Slots）',
    crash: '碰撞遊戲（Crash）',
    table: '棋牌遊戲（Table）',
}

const sourceLabels: Record<string, string> = {
    game_round: '遊戲回合',
    ggap_request: 'GGAP 請求',
    callback: '回呼',
    data_quality: '資料品質',
    game_service: '遊戲服務',
    game_math: '遊戲數值',
}

const sourceOptionLabels: Record<string, string> = {
    game_round: '遊戲回合（Game Round）',
    ggap_request: 'GGAP 請求（GGAP Request）',
    callback: '回呼（Callback）',
    data_quality: '資料品質（Data Quality）',
    game_service: '遊戲服務（Game Service）',
    game_math: '遊戲數值（Game Math）',
}

const anomalyLabels: Record<string, string> = {
    settlement_failure: '結算失敗',
    callback_failure: '回呼失敗',
    duplicate_settlement: '重複結算',
    request_timeout: '請求逾時',
    callback_latency: '回呼延遲',
    data_missing: '必要資料缺失',
    service_unavailable: '遊戲服務不可用',
    payout_anomaly: '派彩結果異常',
    round_link_failure: '遊戲回合關聯失敗',
}

const anomalyOptionLabels: Record<string, string> = {
    settlement_failure: '結算失敗（Settlement Failure）',
    callback_failure: '回呼失敗（Callback Failure）',
    duplicate_settlement: '重複結算（Duplicate Settlement）',
    request_timeout: '請求逾時（Request Timeout）',
    callback_latency: '回呼延遲（Callback Latency）',
    data_missing: '必要資料缺失（Missing Data）',
    service_unavailable: '遊戲服務不可用（Service Unavailable）',
    payout_anomaly: '派彩結果異常（Payout Anomaly）',
    round_link_failure: '遊戲回合關聯失敗（Round Link Failure）',
}

const severityLabels: Record<Severity, string> = {
    info: '資訊',
    low: '低',
    medium: '中',
    high: '高',
    critical: '嚴重',
}

const severityOptionLabels: Record<Severity, string> = {
    info: '資訊（Info）',
    low: '低（Low）',
    medium: '中（Medium）',
    high: '高（High）',
    critical: '嚴重（Critical）',
}

const statusLabels: Record<HandlingStatus, string> = {
    pending: '待處理',
    investigating: '調查中',
    mitigated: '已緩解',
    closed: '已關閉',
    false_positive: '誤報',
}

const mitigationLabels: Record<MitigationStatus, string> = {
    not_required: '不需處理',
    pending: '處理中',
    applied: '已套用',
    failed: '處理失敗',
    released: '已解除',
}

const isolationLabels: Record<IsolationStatus, string> = {
    not_isolated: '未隔離',
    isolated: '隔離中',
    released: '已解除',
}

const ggapNotificationLabels: Record<GgapNotificationStatus, string> = {
    not_required: '不需通知',
    pending: '通知中',
    sent: '已送出',
    failed: '通知失敗',
    acknowledged: '已確認',
}

const mitigationOptionLabels: Record<MitigationStatus, string> = {
    not_required: '不需處理（Not required）',
    pending: '處理中（Pending）',
    applied: '已套用（Applied）',
    failed: '處理失敗（Failed）',
    released: '已解除（Released）',
}

const isolationOptionLabels: Record<IsolationStatus, string> = {
    not_isolated: '未隔離（Not isolated）',
    isolated: '隔離中（Isolated）',
    released: '已解除（Released）',
}

const ggapNotificationOptionLabels: Record<GgapNotificationStatus, string> = {
    not_required: '不需通知（Not required）',
    pending: '通知中（Pending）',
    sent: '已送出（Sent）',
    failed: '通知失敗（Failed）',
    acknowledged: '已確認（Acknowledged）',
}

function hoursAgo(hours: number, minutes = 0) {
    return new Date(now.getTime() - (hours * 60 + minutes) * 60 * 1000)
}

function cloneDateRange(range: DateRange): DateRange {
    return [range[0] ? new Date(range[0]) : null, range[1] ? new Date(range[1]) : null]
}

function rollingRange(hours: number): DateRange {
    return [new Date(now.getTime() - hours * 60 * 60 * 1000), new Date(now)]
}

function makeTimeline(eventTime: Date, items: Array<[number, string, string, TimelineItem['tone']]>) {
    return items.map(([offset, label, description, tone]) => ({
        time: new Date(eventTime.getTime() + offset * 60 * 1000),
        label,
        description,
        tone,
    }))
}

function makeEvent(input: Omit<RiskEvent, 'firstSeenAt' | 'lastOccurredAt' | 'updatedAt' | 'timeline' | 'relatedRounds' | 'providerRoundIds' | 'ggapRoundIds' | 'occurredCount' | 'mitigationStartedAt' | 'mitigationCompletedAt' | 'ggapSentAt' | 'ggapAckAt'> & { detectedAt: Date; relatedRounds: RelatedRound[]; timeline: TimelineItem[]; occurredCount: number; providerRoundIds: string[]; ggapRoundIds: string[]; mitigationStartedAt?: Date | null; mitigationCompletedAt?: Date | null; ggapSentAt?: Date | null; ggapAckAt?: Date | null; lastOccurredAt?: Date; updatedAt?: Date }): RiskEvent {
    return {
        ...input,
        firstSeenAt: new Date(input.detectedAt.getTime() - 42 * 60 * 1000),
        lastOccurredAt: input.lastOccurredAt ?? new Date(input.detectedAt.getTime() + 18 * 60 * 1000),
        updatedAt: input.updatedAt ?? new Date(input.detectedAt.getTime() + 32 * 60 * 1000),
        mitigationStartedAt: input.mitigationStartedAt ?? null,
        mitigationCompletedAt: input.mitigationCompletedAt ?? null,
        ggapSentAt: input.ggapSentAt ?? null,
        ggapAckAt: input.ggapAckAt ?? null,
    }
}

const mockEvents: RiskEvent[] = [
    makeEvent({
        riskEventId: 'rsk_01jz4m8v3k6q2d7p9x5n1c0bqa', alertId: 'alt_01jz4m8v3k6q2d7p9x5n1c0bqa', detectedAt: hoursAgo(3, 12), environment: 'production', gameType: 'slots', gameId: 'NH-001', gameName: 'Neon Heist', gameVersion: 'v2.4.1', source: 'game_round', anomalyType: 'settlement_failure', severity: 'critical', affectedRounds: 146, status: 'pending', mitigationStatus: 'failed', mitigationAction: '重試結算 · 暫停新 Launch', mitigationScope: 'Neon Heist / v2.4.1 / Production', isolationStatus: 'not_isolated', ggapNotificationStatus: 'failed', occurredCount: 48, isOngoing: true, ruleId: 'risk.settlement.failure-rate', ruleVersion: 'v3.2', threshold: '失敗率 > 3% / 15 分鐘', actualValue: '11.8%（146 / 1,237）', statisticWindow: '近 15 分鐘', errorCode: 'SETTLE_UPSTREAM_502', errorMessage: 'GGAP Settle endpoint returned 502', requestSummary: 'POST /settle · timeout 5s · retry 2/3', responseSummary: '502 Bad Gateway · upstream unavailable', mitigationFailureReason: '暫停新 Launch 權限尚未取得；重試佇列持續失敗。', ggapProviderEventId: 'pev_7d9c1a2e', ggapRetryCount: 3, providerRoundIds: ['pr_nh_8a31f2', 'pr_nh_8a31f3', 'pr_nh_8a31f4'], ggapRoundIds: ['gg_7A31F2', 'gg_7A31F3', 'gg_7A31F4'], relatedRounds: [
            { providerId: 'pr_nh_8a31f2', ggapId: 'gg_7A31F2', settleStatus: '結算失敗', occurredAt: hoursAgo(3, 12) },
            { providerId: 'pr_nh_8a31f3', ggapId: 'gg_7A31F3', settleStatus: '重試中', occurredAt: hoursAgo(3, 5) },
            { providerId: 'pr_nh_8a31f4', ggapId: 'gg_7A31F4', settleStatus: '結算失敗', occurredAt: hoursAgo(2, 58) },
        ], timeline: makeTimeline(hoursAgo(3, 12), [[0, '偵測 Risk Event', '結算失敗率超過規則門檻。', 'danger'], [4, '自動緩解失敗', '有限重試與新 Launch 限制均未完成。', 'warning'], [18, 'GGAP 通知失敗', '通知已重試 3 次，尚未取得 ACK。', 'danger']]), mitigationStartedAt: hoursAgo(3, 9), mitigationCompletedAt: null, ggapSentAt: hoursAgo(3, 5), ggapAckAt: null,
    }),
    makeEvent({
        riskEventId: 'rsk_01jz4f6b2c9m7q8x3n5v0d1epa', alertId: 'alt_01jz4f6b2c9m7q8x3n5v0d1epa', detectedAt: hoursAgo(5, 18), environment: 'production', gameType: 'crash', gameId: 'ND-014', gameName: 'Neon Drift', gameVersion: 'v1.8.3', source: 'callback', anomalyType: 'callback_failure', severity: 'high', affectedRounds: 64, status: 'investigating', mitigationStatus: 'applied', mitigationAction: '重新排入 Callback 可靠佇列', mitigationScope: 'Neon Drift / v1.8.3 / Production', isolationStatus: 'isolated', ggapNotificationStatus: 'acknowledged', occurredCount: 19, isOngoing: false, ruleId: 'risk.callback.missing', ruleVersion: 'v2.6', threshold: '未收到 Callback > 90 秒', actualValue: '64 筆未收到 Callback', statisticWindow: '近 30 分鐘', errorCode: 'CALLBACK_ACK_TIMEOUT', errorMessage: 'Callback acknowledgement exceeded 90 seconds', requestSummary: 'Callback delivery queue · batch 4F91', responseSummary: 'No ACK · retry queue accepted', mitigationFailureReason: '—', ggapProviderEventId: 'pev_4f91c82a', ggapRetryCount: 1, providerRoundIds: ['pr_nd_4f91a2'], ggapRoundIds: ['gg_4F91A2'], relatedRounds: [{ providerId: 'pr_nd_4f91a2', ggapId: 'gg_4F91A2', settleStatus: 'Callback 重試中', occurredAt: hoursAgo(5, 18) }], timeline: makeTimeline(hoursAgo(5, 18), [[0, '偵測 Risk Event', 'Callback 未在等待時間內回覆。', 'danger'], [7, '自動緩解已套用', '失敗 Callback 已重新排入可靠佇列。', 'success'], [22, '人工接手', '營運人員開始調查受影響 Round。', 'warning']]), mitigationStartedAt: hoursAgo(5, 14), mitigationCompletedAt: hoursAgo(5, 7), ggapSentAt: hoursAgo(5, 1), ggapAckAt: hoursAgo(4, 56),
    }),
    makeEvent({
        riskEventId: 'rsk_01jz4b1p8w4y6h0m2k9d7c3sqa', alertId: 'alt_01jz4b1p8w4y6h0m2k9d7c3sqa', detectedAt: hoursAgo(9, 40), environment: 'production', gameType: 'table', gameId: 'PC-009', gameName: 'Paper Crane', gameVersion: 'v3.1.0', source: 'data_quality', anomalyType: 'duplicate_settlement', severity: 'critical', affectedRounds: 27, status: 'mitigated', mitigationStatus: 'applied', mitigationAction: '依冪等鍵忽略重複結算', mitigationScope: 'Paper Crane / v3.1.0 / Production', isolationStatus: 'isolated', ggapNotificationStatus: 'acknowledged', occurredCount: 9, isOngoing: false, ruleId: 'risk.round.duplicate-settle', ruleVersion: 'v1.9', threshold: '相同 Round ID 出現 2 次以上結算', actualValue: '27 筆重複請求', statisticWindow: '近 10 分鐘', errorCode: 'ROUND_IDEMPOTENCY_CONFLICT', errorMessage: 'Duplicate settle request rejected by idempotency guard', requestSummary: 'POST /settle · idempotency key reused', responseSummary: '409 Conflict · duplicate request ignored', mitigationFailureReason: '—', ggapProviderEventId: 'pev_aa31d99e', ggapRetryCount: 0, providerRoundIds: ['pr_pc_aa31d9', 'pr_pc_aa31da'], ggapRoundIds: ['gg_AA31D9', 'gg_AA31DA'], relatedRounds: [{ providerId: 'pr_pc_aa31d9', ggapId: 'gg_AA31D9', settleStatus: '已防重', occurredAt: hoursAgo(9, 40) }, { providerId: 'pr_pc_aa31da', ggapId: 'gg_AA31DA', settleStatus: '已防重', occurredAt: hoursAgo(9, 34) }], timeline: makeTimeline(hoursAgo(9, 40), [[0, '偵測 Risk Event', '資料品質規則判定為重複結算。', 'danger'], [5, '自動緩解已套用', '冪等防重擋下重複請求。', 'success'], [31, '事件已緩解', '未再觀察到新的重複結算。', 'success']]), mitigationStartedAt: hoursAgo(9, 37), mitigationCompletedAt: hoursAgo(9, 35), ggapSentAt: hoursAgo(9, 22), ggapAckAt: hoursAgo(9, 20),
    }),
    makeEvent({
        riskEventId: 'rsk_01jz47q3n6p8v2c5m0x1d9beka', detectedAt: hoursAgo(14, 8), environment: 'production', gameType: 'slots', gameId: 'LH-022', gameName: 'Lucky Harbor', gameVersion: 'v5.0.2', source: 'ggap_request', anomalyType: 'request_timeout', severity: 'medium', affectedRounds: 18, status: 'closed', mitigationStatus: 'applied', mitigationAction: '可重試請求退避重試', mitigationScope: 'Lucky Harbor / v5.0.2 / Production', isolationStatus: 'released', ggapNotificationStatus: 'sent', occurredCount: 4, isOngoing: false, ruleId: 'risk.request.timeout', ruleVersion: 'v2.2', threshold: '回應時間 > 5,000 ms', actualValue: 'P95 7,240 ms', statisticWindow: '近 15 分鐘', errorCode: 'UPSTREAM_TIMEOUT', errorMessage: 'GGAP response exceeded timeout threshold', requestSummary: 'POST /launch · timeout 5s · retry 1/3', responseSummary: 'Retry succeeded · 200 OK', mitigationFailureReason: '—', ggapProviderEventId: 'pev_1c0b83f4', ggapRetryCount: 1, providerRoundIds: ['pr_lh_1c0b83'], ggapRoundIds: ['gg_1C0B83'], relatedRounds: [{ providerId: 'pr_lh_1c0b83', ggapId: 'gg_1C0B83', settleStatus: '已完成', occurredAt: hoursAgo(14, 8) }], timeline: makeTimeline(hoursAgo(14, 8), [[0, '偵測 Risk Event', '請求超過逾時門檻。', 'warning'], [6, '自動緩解已套用', '退避重試成功，服務恢復。', 'success'], [86, '事件已關閉', '確認無持續影響後完成結案。', 'neutral']]), mitigationStartedAt: hoursAgo(14, 4), mitigationCompletedAt: hoursAgo(14, 2), ggapSentAt: hoursAgo(13, 55), ggapAckAt: null,
    }),
    makeEvent({
        riskEventId: 'rsk_01jz45k2a9d6m3p7x8v0c1bqea', detectedAt: hoursAgo(17, 50), environment: 'production', gameType: 'crash', gameId: 'OR-006', gameName: 'Orbit Rush', gameVersion: 'v1.4.8', source: 'data_quality', anomalyType: 'data_missing', severity: 'low', affectedRounds: 3, status: 'false_positive', mitigationStatus: 'not_required', mitigationAction: '不需處理', mitigationScope: 'Orbit Rush / v1.4.8 / Production', isolationStatus: 'not_isolated', ggapNotificationStatus: 'not_required', occurredCount: 3, isOngoing: false, ruleId: 'risk.payload.required-fields', ruleVersion: 'v1.4', threshold: '必要欄位缺失 >= 1', actualValue: '3 筆（已由延遲資料補齊）', statisticWindow: '近 30 分鐘', errorCode: 'PAYLOAD_FIELD_DELAYED', errorMessage: 'Required field arrived after initial validation', requestSummary: 'Callback payload · delayed field hydration', responseSummary: 'Fields completed before settlement', mitigationFailureReason: '—', ggapProviderEventId: '—', ggapRetryCount: 0, providerRoundIds: ['pr_or_2c91a0'], ggapRoundIds: ['gg_2C91A0'], relatedRounds: [{ providerId: 'pr_or_2c91a0', ggapId: 'gg_2C91A0', settleStatus: '已完成', occurredAt: hoursAgo(17, 50) }], timeline: makeTimeline(hoursAgo(17, 50), [[0, '偵測 Risk Event', 'Schema validator 暫時標記欄位缺失。', 'warning'], [12, '資料補齊', '延遲欄位到達，Round 狀態正常。', 'success'], [62, '確認誤報', '確認不構成實際資料異常。', 'neutral']]), mitigationStartedAt: null, mitigationCompletedAt: null, ggapSentAt: null, ggapAckAt: null,
    }),
    makeEvent({
        riskEventId: 'rsk_01jz42n8w5q1d7c3m9x6v0bpea', alertId: 'alt_01jz42n8w5q1d7c3m9x6v0bpea', detectedAt: hoursAgo(21, 22), environment: 'production', gameType: 'slots', gameId: 'SG-031', gameName: 'Solar Garden', gameVersion: 'v2.0.0', source: 'game_service', anomalyType: 'service_unavailable', severity: 'high', affectedRounds: 91, status: 'pending', mitigationStatus: 'failed', mitigationAction: '暫停指定版本新 Launch', mitigationScope: 'Solar Garden / v2.0.0 / Production', isolationStatus: 'not_isolated', ggapNotificationStatus: 'failed', occurredCount: 22, isOngoing: true, ruleId: 'risk.game-service.health', ruleVersion: 'v4.1', threshold: '健康檢查連續失敗 3 次', actualValue: '連續失敗 7 次', statisticWindow: '近 8 分鐘', errorCode: 'GAME_SERVICE_503', errorMessage: 'Game service unavailable', requestSummary: 'GET /health · interval 30s', responseSummary: '503 Service Unavailable', mitigationFailureReason: '版本隔離執行器尚未取得有效鎖。', ggapProviderEventId: 'pev_98c20b7a', ggapRetryCount: 2, providerRoundIds: ['pr_sg_98c20b', 'pr_sg_98c21'], ggapRoundIds: ['gg_98C20B', 'gg_98C21'], relatedRounds: [{ providerId: 'pr_sg_98c20b', ggapId: 'gg_98C20B', settleStatus: '等待服務恢復', occurredAt: hoursAgo(21, 22) }, { providerId: 'pr_sg_98c21', ggapId: 'gg_98C21', settleStatus: 'Callback 保留', occurredAt: hoursAgo(21, 15) }], timeline: makeTimeline(hoursAgo(21, 22), [[0, '偵測 Risk Event', '健康檢查連續失敗，事件升級為 High。', 'danger'], [3, '自動緩解失敗', '版本隔離未成功套用。', 'warning'], [16, 'GGAP 通知失敗', '通知服務等待重試。', 'danger']]), mitigationStartedAt: hoursAgo(21, 18), mitigationCompletedAt: null, ggapSentAt: hoursAgo(21, 5), ggapAckAt: null,
    }),
    makeEvent({
        riskEventId: 'rsk_01jz3y7m4c8p1d6v0x9q2bnea', detectedAt: hoursAgo(31, 10), environment: 'production', gameType: 'table', gameId: 'FM-017', gameName: 'Fortune Mahjong', gameVersion: 'v4.2.2', source: 'game_math', anomalyType: 'payout_anomaly', severity: 'medium', affectedRounds: 8, status: 'investigating', mitigationStatus: 'pending', mitigationAction: '重新計算統計窗口', mitigationScope: 'Fortune Mahjong / v4.2.2 / Production', isolationStatus: 'not_isolated', ggapNotificationStatus: 'pending', occurredCount: 2, isOngoing: false, ruleId: 'risk.math.payout-spike', ruleVersion: 'v1.7', threshold: '單局派彩 > 限紅 4 倍', actualValue: '最高 5.6 倍', statisticWindow: '近 60 分鐘', errorCode: 'PAYOUT_OUTLIER', errorMessage: 'Payout exceeded configured range', requestSummary: 'Game math monitor · sample 8,412', responseSummary: 'Pending rule review', mitigationFailureReason: '—', ggapProviderEventId: 'pev_1a3c70d8', ggapRetryCount: 0, providerRoundIds: ['pr_fm_1a3c70'], ggapRoundIds: ['gg_1A3C70'], relatedRounds: [{ providerId: 'pr_fm_1a3c70', ggapId: 'gg_1A3C70', settleStatus: '已完成，待調查', occurredAt: hoursAgo(31, 10) }], timeline: makeTimeline(hoursAgo(31, 10), [[0, '偵測 Risk Event', '數值規則偵測到派彩離群。', 'warning'], [23, '人工接手', '營運人員開始檢視規則版本與樣本量。', 'neutral']]), mitigationStartedAt: hoursAgo(31, 2), mitigationCompletedAt: null, ggapSentAt: hoursAgo(30, 48), ggapAckAt: null,
    }),
    makeEvent({
        riskEventId: 'rsk_01jz3s4v8n2d5c0m7x9q1bpea', alertId: 'alt_01jz3s4v8n2d5c0m7x9q1bpea', detectedAt: hoursAgo(8, 6), environment: 'demo', gameType: 'slots', gameId: 'NH-001', gameName: 'Neon Heist', gameVersion: 'v2.5.0-rc1', source: 'ggap_request', anomalyType: 'request_timeout', severity: 'high', affectedRounds: 12, status: 'pending', mitigationStatus: 'applied', mitigationAction: 'DEMO Launch 重新排隊', mitigationScope: 'Neon Heist / v2.5.0-rc1 / DEMO', isolationStatus: 'isolated', ggapNotificationStatus: 'sent', occurredCount: 5, isOngoing: false, ruleId: 'risk.request.timeout', ruleVersion: 'v2.2', threshold: '回應時間 > 5,000 ms', actualValue: 'P95 8,140 ms', statisticWindow: '近 30 分鐘', errorCode: 'DEMO_UPSTREAM_TIMEOUT', errorMessage: 'DEMO upstream response exceeded threshold', requestSummary: 'POST /launch · demo endpoint', responseSummary: 'Retry succeeded · 200 OK', mitigationFailureReason: '—', ggapProviderEventId: 'pev_5b1e092a', ggapRetryCount: 1, providerRoundIds: ['pr_nh_demo_5b1e'], ggapRoundIds: ['gg_DEMO5B1E'], relatedRounds: [{ providerId: 'pr_nh_demo_5b1e', ggapId: 'gg_DEMO5B1E', settleStatus: '已完成', occurredAt: hoursAgo(8, 6) }], timeline: makeTimeline(hoursAgo(8, 6), [[0, '偵測 Risk Event', 'DEMO 請求超過逾時門檻。', 'warning'], [8, '自動緩解已套用', '請求已重新排隊並成功完成。', 'success']]), mitigationStartedAt: hoursAgo(8, 4), mitigationCompletedAt: hoursAgo(8, 1), ggapSentAt: hoursAgo(8), ggapAckAt: null,
    }),
    makeEvent({
        riskEventId: 'rsk_01jz3n2p6c8v4d0m9x1q7besa', detectedAt: hoursAgo(76, 30), environment: 'demo', gameType: 'crash', gameId: 'OR-006', gameName: 'Orbit Rush', gameVersion: 'v1.9.0-demo', source: 'callback', anomalyType: 'callback_latency', severity: 'medium', affectedRounds: 7, status: 'closed', mitigationStatus: 'applied', mitigationAction: 'Callback 退避重試', mitigationScope: 'Orbit Rush / v1.9.0-demo / DEMO', isolationStatus: 'released', ggapNotificationStatus: 'acknowledged', occurredCount: 3, isOngoing: false, ruleId: 'risk.callback.latency', ruleVersion: 'v2.1', threshold: 'P95 > 1,500 ms', actualValue: 'P95 2,140 ms', statisticWindow: '近 20 分鐘', errorCode: 'CALLBACK_LATENCY_HIGH', errorMessage: 'Callback response latency exceeded threshold', requestSummary: 'Callback delivery queue · demo batch', responseSummary: 'ACK received after retry', mitigationFailureReason: '—', ggapProviderEventId: 'pev_8b30a1c2', ggapRetryCount: 1, providerRoundIds: ['pr_or_demo_8b30'], ggapRoundIds: ['gg_DEMO8B30'], relatedRounds: [{ providerId: 'pr_or_demo_8b30', ggapId: 'gg_DEMO8B30', settleStatus: '已完成', occurredAt: hoursAgo(76, 30) }], timeline: makeTimeline(hoursAgo(76, 30), [[0, '偵測 Risk Event', 'DEMO Callback 延遲超過門檻。', 'warning'], [16, '自動緩解已套用', '退避重試成功並取得 ACK。', 'success'], [102, '事件已關閉', '完成唯讀檢視。', 'neutral']]), mitigationStartedAt: hoursAgo(76, 24), mitigationCompletedAt: hoursAgo(76, 18), ggapSentAt: hoursAgo(76, 10), ggapAckAt: hoursAgo(76, 8),
    }),
    makeEvent({
        riskEventId: 'rsk_01jz2k8d4v6p1c0m9x3q7bnea', detectedAt: hoursAgo(126), environment: 'production', gameType: 'slots', gameId: 'CV-001', gameName: 'Celestial Vault', gameVersion: 'v6.0.1', source: 'data_quality', anomalyType: 'round_link_failure', severity: 'low', affectedRounds: 2, status: 'closed', mitigationStatus: 'not_required', mitigationAction: '不需處理', mitigationScope: 'Celestial Vault / v6.0.1 / Production', isolationStatus: 'not_isolated', ggapNotificationStatus: 'not_required', occurredCount: 2, isOngoing: false, ruleId: 'risk.round.link', ruleVersion: 'v1.3', threshold: 'Round 關聯失敗 >= 1', actualValue: '2 筆待補資料', statisticWindow: '近 1 小時', errorCode: 'ROUND_LINK_PENDING', errorMessage: 'Round linkage was temporarily unavailable', requestSummary: 'Round reconciliation worker', responseSummary: 'Link restored before close', mitigationFailureReason: '—', ggapProviderEventId: '—', ggapRetryCount: 0, providerRoundIds: ['pr_cv_91a2'], ggapRoundIds: ['gg_91A2'], relatedRounds: [{ providerId: 'pr_cv_91a2', ggapId: 'gg_91A2', settleStatus: '已完成', occurredAt: hoursAgo(126) }], timeline: makeTimeline(hoursAgo(126), [[0, '偵測 Risk Event', 'Round 關聯暫時失敗。', 'warning'], [46, '事件已關閉', '關聯資料恢復且完成檢視。', 'neutral']]), mitigationStartedAt: null, mitigationCompletedAt: null, ggapSentAt: null, ggapAckAt: null,
    }),
]

const gameOptions = [{ label: '全部遊戲', value: '' }, ...Array.from(new Map(mockEvents.map((event) => [event.gameId, { label: event.gameName, value: event.gameId }])).values())]
const gameTypeOptions = [{ label: '全部類型', value: '' }, ...Object.entries(gameTypeOptionLabels).map(([value, label]) => ({ value, label }))]
const anomalyOptions = [{ label: '全部異常類型', value: '' }, ...Object.entries(anomalyOptionLabels).map(([value, label]) => ({ value, label }))]
const severityOptions = [{ label: '全部嚴重度', value: '' }, ...Object.entries(severityOptionLabels).map(([value, label]) => ({ value, label }))]
const sourceOptions = [{ label: '全部來源', value: '' }, ...Object.entries(sourceOptionLabels).map(([value, label]) => ({ value, label }))]
const mitigationOptions = [{ label: '全部緩解狀態', value: '' }, ...Object.entries(mitigationOptionLabels).map(([value, label]) => ({ value, label }))]
const isolationOptions = [{ label: '全部隔離狀態', value: '' }, ...Object.entries(isolationOptionLabels).map(([value, label]) => ({ value, label }))]
const ggapNotificationOptions = [{ label: '全部通知狀態', value: '' }, ...Object.entries(ggapNotificationOptionLabels).map(([value, label]) => ({ value, label }))]
const statusOptions = [
    { label: '全部處理狀態', value: '' },
    { label: '未解決', value: 'unresolved' },
    { label: '處理中', value: 'in_progress' },
    { label: '已解決', value: 'resolved' },
]

const initialFilters: FilterState = {
    quickRange: '24h',
    dateRange: rollingRange(24),
    environment: 'production',
    gameType: '',
    game: '',
    anomalyType: '',
    severity: '',
    status: '',
    riskEventId: '',
    gameVersion: '',
    source: '',
    mitigationStatus: '',
    isolationStatus: '',
    ggapNotificationStatus: '',
    providerGameRoundId: '',
    ggapRoundId: '',
}

const draftFilters = reactive<FilterState>({ ...initialFilters, dateRange: cloneDateRange(initialFilters.dateRange) })
const appliedFilters = ref<FilterState>({ ...initialFilters, dateRange: cloneDateRange(initialFilters.dateRange) })
const advancedVisible = ref(false)
const loading = ref(true)
const loadError = ref('')
const queryError = ref('')
const selectedEvent = ref<RiskEvent | null>(null)
const detailsVisible = ref(false)
const first = ref(0)
const exportVisible = ref(false)
const exportFormat = ref<'csv' | 'xlsx'>('csv')
const exportNotice = ref('')

const appliedRangeLabel = computed(() => {
    if (appliedFilters.value.quickRange === '24h') return '近 1 日 · 滾動 24 小時'
    if (appliedFilters.value.quickRange === '72h') return '近 3 日 · 滾動 72 小時'
    if (appliedFilters.value.quickRange === '120h') return '近 5 日 · 滾動 120 小時'
    const [from, to] = appliedFilters.value.dateRange
    return from && to ? `${formatDateTime(from)} — ${formatDateTime(to)}` : '自訂時間'
})

const matchingRows = computed(() => {
    const filters = appliedFilters.value
    const [from, to] = filters.dateRange
    return mockEvents
        .filter((event) => {
            if (event.environment !== filters.environment) return false
            if (from && event.detectedAt < from) return false
            if (to && event.detectedAt > to) return false
            if (filters.gameType && event.gameType !== filters.gameType) return false
            if (filters.game && event.gameId !== filters.game) return false
            if (filters.anomalyType && event.anomalyType !== filters.anomalyType) return false
            if (filters.severity && event.severity !== filters.severity) return false
            if (filters.status === 'unresolved' && event.status !== 'pending') return false
            if (filters.status === 'in_progress' && !['investigating', 'mitigated'].includes(event.status)) return false
            if (filters.status === 'resolved' && !['closed', 'false_positive'].includes(event.status)) return false
            if (filters.riskEventId && event.riskEventId !== filters.riskEventId.trim()) return false
            if (filters.gameVersion && event.gameVersion !== filters.gameVersion.trim()) return false
            if (filters.source && event.source !== filters.source) return false
            if (filters.mitigationStatus && event.mitigationStatus !== filters.mitigationStatus) return false
            if (filters.isolationStatus && event.isolationStatus !== filters.isolationStatus) return false
            if (filters.ggapNotificationStatus && event.ggapNotificationStatus !== filters.ggapNotificationStatus) return false
            if (filters.providerGameRoundId && !event.providerRoundIds.includes(filters.providerGameRoundId.trim())) return false
            if (filters.ggapRoundId && !event.ggapRoundIds.includes(filters.ggapRoundId.trim())) return false
            return true
        })
        .sort((left, right) => right.detectedAt.getTime() - left.detectedAt.getTime())
})

const summaryCards = computed(() => {
    const rows = matchingRows.value
    const unresolved = rows.filter((row) => row.status === 'pending')
    const inProgress = rows.filter((row) => ['investigating', 'mitigated'].includes(row.status))
    const resolved = rows.filter((row) => ['closed', 'false_positive'].includes(row.status))
    const highRisk = rows.filter((row) => ['high', 'critical'].includes(row.severity) && !['closed', 'false_positive'].includes(row.status))
    const unresolvedSeverity = (Object.keys(severityLabels) as Severity[])
        .map((severity) => `${severityLabels[severity]} ${unresolved.filter((row) => row.severity === severity).length}`)
        .filter((part) => !part.endsWith(' 0'))
        .join('、') || '無待處理事件'
    const longestWaiting = unresolved.length ? Math.max(...unresolved.map((row) => now.getTime() - row.detectedAt.getTime())) : null
    const investigating = inProgress.filter((row) => row.status === 'investigating').length
    const mitigated = inProgress.filter((row) => row.status === 'mitigated').length
    const closed = resolved.filter((row) => row.status === 'closed').length
    const falsePositive = resolved.filter((row) => row.status === 'false_positive').length
    const averageResolution = resolved.length
        ? resolved.reduce((total, row) => total + Math.max(0, row.updatedAt.getTime() - row.detectedAt.getTime()), 0) / resolved.length
        : null
    const affectedGames = new Set(highRisk.map((row) => row.gameName)).size
    const isolated = highRisk.filter((row) => row.isolationStatus === 'isolated').length
    const failedNotifications = highRisk.filter((row) => row.ggapNotificationStatus === 'failed').length
    return [
        { key: 'total', label: '異常事件總數', value: rows.length, icon: 'pi pi-chart-line', tone: 'blue', tip: `異常分類：${formatAnomalyBreakdown(rows)}。` },
        { key: 'unresolved', label: '未解決', value: unresolved.length, icon: 'pi pi-inbox', tone: 'amber', tip: `嚴重度拆分：${unresolvedSeverity}；最久未處理 ${formatDuration(longestWaiting)}。` },
        { key: 'in-progress', label: '處理中', value: inProgress.length, icon: 'pi pi-sync', tone: 'teal', tip: `調查中 ${investigating}、已緩解 ${mitigated}。` },
        { key: 'resolved', label: '已解決', value: resolved.length, icon: 'pi pi-check-circle', tone: 'green', tip: `已關閉 ${closed}、誤報 ${falsePositive}；平均處理時間 ${formatDuration(averageResolution)}。` },
        { key: 'high-risk', label: '高風險事件', value: highRisk.length, icon: 'pi pi-shield', tone: 'red', tip: `受影響遊戲 ${affectedGames} 款；隔離中 ${isolated} 筆；GGAP 通知失敗 ${failedNotifications} 筆。` },
    ]
})

const attentionRows = computed(() => matchingRows.value
    .filter((event) => ['high', 'critical'].includes(event.severity) && !['closed', 'false_positive'].includes(event.status))
    .sort((left, right) => {
        const priority = (event: RiskEvent) => {
            if (event.severity === 'critical') return 0
            if (event.mitigationStatus === 'failed') return 1
            if (event.isolationStatus === 'not_isolated' || event.ggapNotificationStatus === 'failed') return 2
            if (event.severity === 'high') return 3
            return 4
        }
        const priorityDifference = priority(left) - priority(right)
        if (priorityDifference) return priorityDifference
        return right.detectedAt.getTime() - left.detectedAt.getTime()
    })
    .slice(0, 5))

const tableDescription = computed(() => `依 detected_at 由新到舊排序 · ${appliedRangeLabel.value} · ${environmentLabels[appliedFilters.value.environment]} · 共 ${formatNumber(matchingRows.value.length)} 筆`)

function formatNumber(value: number) {
    return value.toLocaleString('en-US')
}

function formatDuration(milliseconds: number | null) {
    if (!milliseconds || milliseconds <= 0) return '0 分鐘'
    const totalMinutes = Math.max(1, Math.round(milliseconds / 60000))
    const days = Math.floor(totalMinutes / 1440)
    const hours = Math.floor((totalMinutes % 1440) / 60)
    const minutes = totalMinutes % 60
    if (days) return `${days} 日 ${hours} 小時`
    if (hours) return `${hours} 小時 ${minutes} 分鐘`
    return `${minutes} 分鐘`
}

function formatAnomalyBreakdown(rows: RiskEvent[]) {
    const counts = new Map<string, number>()
    rows.forEach((row) => counts.set(row.anomalyType, (counts.get(row.anomalyType) ?? 0) + 1))
    const breakdown = Array.from(counts.entries())
        .sort((left, right) => right[1] - left[1])
        .map(([type, count]) => `${anomalyLabels[type]} ${count}`)
    return breakdown.length ? breakdown.join('、') : '無事件'
}

const evidenceTranslations: Array<[string, string]> = [
    ['502 Bad Gateway', '502 Bad Gateway（閘道錯誤）'],
    ['503 Service Unavailable', '503 Service Unavailable（服務不可用）'],
    ['409 Conflict', '409 Conflict（衝突）'],
    ['200 OK', '200 OK（成功）'],
    ['新 Launch', '新啟動'],
    ['Duplicate settle request rejected by idempotency guard', '重複結算請求遭冪等防護拒絕'],
    ['GGAP response exceeded timeout threshold', 'GGAP 回應超過逾時門檻'],
    ['Required field arrived after initial validation', '必要欄位在初次驗證後才到達'],
    ['Payout exceeded configured range', '派彩超過已設定範圍'],
    ['DEMO upstream response exceeded threshold', '展示環境上游回應超過門檻'],
    ['Callback response latency exceeded threshold', '回呼回應延遲超過門檻'],
    ['Round linkage was temporarily unavailable', '遊戲回合關聯暫時無法使用'],
    ['upstream unavailable', '上游服務不可用'],
    ['retry queue accepted', '已接受重試佇列'],
    ['duplicate request ignored', '已忽略重複請求'],
    ['Retry succeeded', '重試成功'],
    ['Fields completed before settlement', '結算前已完成欄位補齊'],
    ['Pending rule review', '等待規則檢視'],
    ['ACK received after retry', '重試後收到確認'],
    ['Link restored before close', '關閉前已恢復關聯'],
    ['Schema validator', '結構驗證器'],
    ['idempotency key reused', '重複使用冪等鍵'],
    ['Callback acknowledgement', '回呼確認'],
    ['Callback delivery queue', '回呼傳送佇列'],
    ['Callback payload', '回呼內容'],
    ['Game math monitor', '遊戲數值監控'],
    ['Round reconciliation worker', '遊戲回合對帳工作程序'],
    ['demo endpoint', '展示環境端點'],
    ['endpoint', '端點'],
    ['demo batch', '展示環境批次'],
    ['batch', '批次'],
    ['sample', '樣本'],
    ['interval', '間隔'],
    ['5s', '5 秒'],
    ['30s', '30 秒'],
    ['timeout', '逾時'],
    ['retry', '重試'],
    ['No ACK', '未收到確認'],
    ['returned', '回傳'],
    ['exceeded', '超過'],
    ['Risk Event', '風控事件'],
    ['Game Round', '遊戲回合'],
    ['Callback', '回呼'],
    ['Settle', '結算'],
    ['Launch', '啟動'],
    ['Round', '回合'],
    ['High', '高'],
    ['Critical', '嚴重'],
    ['Production', '正式環境'],
    ['DEMO', '展示環境'],
    ['ACK', '確認'],
]

function formatEvidenceText(value: string) {
    return evidenceTranslations.reduce((result, [source, target]) => result.replaceAll(source, target), value)
}

function formatDateTime(value: Date) {
    return new Intl.DateTimeFormat('zh-TW', {
        timeZone: 'Asia/Taipei',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).format(value).replaceAll('/', '-')
}

function formatShortDate(value: Date) {
    return new Intl.DateTimeFormat('zh-TW', { timeZone: 'Asia/Taipei', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(value).replace('月', '/').replace('日', '')
}

function severityClass(value: Severity) {
    return `risk-pill--${value}`
}

function statusClass(value: HandlingStatus) {
    return `risk-pill--status-${value}`
}

function mitigationClass(value: MitigationStatus) {
    return `risk-pill--mitigation-${value}`
}

function isolationClass(value: IsolationStatus) {
    return `risk-pill--isolation-${value}`
}

function notificationClass(value: GgapNotificationStatus) {
    return `risk-pill--notification-${value}`
}

function cloneFilters(source: FilterState): FilterState {
    return { ...source, dateRange: cloneDateRange(source.dateRange) }
}

function chooseQuickRange(range: Exclude<QuickRange, 'custom'>) {
    const hours = range === '24h' ? 24 : range === '72h' ? 72 : 120
    draftFilters.quickRange = range
    draftFilters.dateRange = rollingRange(hours)
    applyFilters()
}

function handleCustomRange(range: DateRange) {
    draftFilters.quickRange = 'custom'
    draftFilters.dateRange = range
}

function applyFilters() {
    const [from, to] = draftFilters.dateRange
    if (from && to && from.getTime() > to.getTime()) {
        loadError.value = '時間區間無效，起始時間不可晚於結束時間。'
        return
    }
    loadError.value = ''
    appliedFilters.value = cloneFilters(draftFilters)
    first.value = 0
    loading.value = true
    window.setTimeout(() => { loading.value = false }, 220)
}

function resetFilters() {
    Object.assign(draftFilters, { ...initialFilters, dateRange: cloneDateRange(initialFilters.dateRange) })
    applyFilters()
}

function handlePage(event: PageEvent) {
    first.value = event.first ?? 0
}

function openDetails(event: RiskEvent) {
    selectedEvent.value = event
    detailsVisible.value = true
}

function queryValue(value: unknown) {
    if (Array.isArray(value)) return typeof value[0] === 'string' ? value[0] : ''
    return typeof value === 'string' ? value : ''
}

function openRiskEventFromQuery() {
    const riskEventId = queryValue(route.query.risk_event_id)
    if (!riskEventId) {
        queryError.value = ''
        return
    }

    const event = mockEvents.find((item) => item.riskEventId === riskEventId)
    if (!event) {
        selectedEvent.value = null
        detailsVisible.value = false
        queryError.value = `找不到指定的風控事件：${riskEventId}。請確認完整識別碼後再試。`
        return
    }

    queryError.value = ''
    if (appliedFilters.value.environment !== event.environment) {
        draftFilters.environment = event.environment
        appliedFilters.value = { ...appliedFilters.value, environment: event.environment }
        first.value = 0
    }
    openDetails(event)
}

function clearRiskEventQuery() {
    const nextQuery = { ...route.query }
    delete nextQuery.risk_event_id
    queryError.value = ''
    router.replace({ query: nextQuery })
}

function goToAlerts(event: RiskEvent) {
    if (!event.alertId) return
    router.push({ path: '/monitoring/alerts', query: { alert_id: event.alertId, risk_event_id: event.riskEventId } })
}

function goToRound(round: RelatedRound) {
    router.push({ path: '/reports', query: { round_id: round.providerId, external_round_id: round.ggapId } })
}

function openExport() {
    if (!matchingRows.value.length) return
    exportNotice.value = ''
    exportVisible.value = true
}

function runMockExport() {
    exportVisible.value = false
    exportNotice.value = `原型提示：已準備 ${formatNumber(matchingRows.value.length)} 筆完整篩選結果的 ${exportFormat.value.toUpperCase()} 匯出入口；目前不產生實體檔案。`
}

onMounted(() => {
    window.setTimeout(() => { loading.value = false }, 300)
    openRiskEventFromQuery()
})

watch(() => route.query.risk_event_id, openRiskEventFromQuery)
</script>

<template>
    <div class="risk-reports-page page-stack">
        <section v-if="!queryError" class="risk-report-control-card" aria-label="風控報表查詢範圍">
            <div class="risk-report-control-heading">
                <div>
                    <span class="risk-report-eyebrow">風控事件報表</span>
                    <h2>查詢範圍</h2>
                </div>
                <div class="risk-report-scope-meta"><i class="pi pi-clock" /> {{ timezoneLabel }}</div>
            </div>

            <div class="risk-report-control-grid">
                <div class="risk-report-environment-field">
                    <span class="risk-report-field-label">環境</span>
                    <div class="risk-report-radio-group" role="radiogroup" aria-label="環境">
                        <label class="risk-report-radio-option" data-testid="risk-environment-production">
                            <RadioButton v-model="draftFilters.environment" name="risk-environment" value="production" @change="applyFilters" />
                            <span>{{ environmentOptionLabels.production }}</span>
                        </label>
                        <label class="risk-report-radio-option" data-testid="risk-environment-demo">
                            <RadioButton v-model="draftFilters.environment" name="risk-environment" value="demo" @change="applyFilters" />
                            <span>{{ environmentOptionLabels.demo }}</span>
                        </label>
                    </div>
                </div>

                <div class="risk-report-time-field">
                    <span class="risk-report-field-label">時間</span>
                    <div class="risk-report-quick-buttons" role="group" aria-label="快速時間範圍">
                        <button v-for="option in [{ value: '24h', label: '近 1 日' }, { value: '72h', label: '近 3 日' }, { value: '120h', label: '近 5 日' }]" :key="option.value" type="button" class="risk-report-quick-button" :class="{ active: draftFilters.quickRange === option.value }" :data-testid="`risk-range-${option.value}`" @click="chooseQuickRange(option.value as '24h' | '72h' | '120h')">{{ option.label }}</button>
                        <button type="button" class="risk-report-quick-button" :class="{ active: draftFilters.quickRange === 'custom' }" data-testid="risk-range-custom" @click="draftFilters.quickRange = 'custom'">自訂時間</button>
                    </div>
                </div>

                <div class="risk-report-applied-scope"><i class="pi pi-filter" /><span>{{ environmentLabels[appliedFilters.environment] }} · {{ appliedRangeLabel }}</span></div>
            </div>
        </section>

        <section v-if="!queryError" class="risk-report-summary-grid" aria-label="風控摘要">
            <article v-for="card in summaryCards" :key="card.key" class="risk-report-summary-card" :class="`risk-report-summary-card--${card.tone}`">
                <div class="risk-report-summary-top">
                    <span><i :class="card.icon" />{{ card.label }}</span>
                    <button v-tooltip.top="card.tip" type="button" class="risk-report-info-button" :aria-label="`${card.label}提示`"><i class="pi pi-info-circle" /></button>
                </div>
                <strong>{{ formatNumber(card.value) }}</strong>
                <small>{{ appliedRangeLabel }} · {{ environmentLabels[appliedFilters.environment] }}</small>
            </article>
        </section>

        <div v-if="queryError" class="risk-report-state-panel risk-report-state-panel--error risk-report-query-error" role="alert"><i class="pi pi-exclamation-circle" /><div><strong>{{ queryError }}</strong><p>此頁未開啟其他事件，請確認風控事件 ID 或返回風控告警／處理。</p></div><Button label="返回列表" icon="pi pi-arrow-left" severity="secondary" outlined @click="clearRiskEventQuery" /></div>

        <section v-if="!queryError" class="risk-report-attention-section" aria-labelledby="risk-attention-title">
            <div class="risk-report-section-heading">
                <div>
                    <span class="risk-report-eyebrow">優先處理佇列</span>
                    <h2 id="risk-attention-title">待關注異常</h2>
                    <p>優先顯示嚴重、高風險、自動緩解失敗、尚未隔離或 GGAP 通知失敗的事件。</p>
                </div>
                <span class="risk-report-section-count">{{ attentionRows.length }} / 5 筆</span>
            </div>

            <div v-if="attentionRows.length" class="risk-report-attention-list">
                <article v-for="event in attentionRows" :key="event.riskEventId" class="risk-report-attention-row">
                    <div class="risk-report-attention-severity"><span class="risk-pill" :class="severityClass(event.severity)">{{ severityLabels[event.severity] }}</span><time>{{ formatShortDate(event.detectedAt) }}</time></div>
                    <div class="risk-report-attention-identity"><strong>{{ event.riskEventId }}</strong><span>{{ event.gameName }} · {{ event.gameVersion }}</span></div>
                    <div class="risk-report-attention-anomaly"><span>{{ anomalyLabels[event.anomalyType] }}</span><small>{{ formatNumber(event.affectedRounds) }} 個受影響回合</small></div>
                    <div class="risk-report-attention-status"><span class="risk-pill" :class="statusClass(event.status)">{{ statusLabels[event.status] }}</span><small>{{ mitigationLabels[event.mitigationStatus] }} · {{ isolationLabels[event.isolationStatus] }}</small></div>
                    <div class="risk-report-attention-actions"><Button label="查看詳情" icon="pi pi-arrow-up-right" text severity="secondary" :data-testid="`risk-attention-details-${event.riskEventId}`" @click="openDetails(event)" /><Button v-if="event.alertId" label="前往處理" icon="pi pi-external-link" text severity="danger" @click="goToAlerts(event)" /></div>
                </article>
            </div>
            <div v-else class="risk-report-attention-empty"><div class="risk-report-empty-icon"><i class="pi pi-check-circle" /></div><div><strong>目前沒有需要優先關注的事件</strong><p>目前查詢範圍內沒有未關閉的高風險或嚴重風控事件。</p></div></div>
        </section>

        <FilterCard v-if="!queryError" title="查詢條件" description="所有摘要、待關注異常與風控事件列表均依目前套用的查詢條件同步更新。">
            <template #default>
                <div class="risk-report-filter-range-row">
                    <div class="risk-report-date-range-field"><span class="risk-report-field-label">自訂時間區間</span><DateTimeRangeField :model-value="draftFilters.dateRange" @update:model-value="handleCustomRange" /></div>
                    <div class="risk-report-filter-help"><i class="pi pi-info-circle" /><span>事件統計時間使用 detected_at；時區固定為 {{ timezoneLabel }}。</span></div>
                </div>
                <div class="risk-report-filter-grid risk-report-filter-grid--common">
                    <div class="field"><label for="risk-game-type">遊戲類型</label><Select id="risk-game-type" v-model="draftFilters.gameType" :options="gameTypeOptions" option-label="label" option-value="value" fluid /></div>
                    <div class="field"><label for="risk-game">遊戲</label><Select id="risk-game" v-model="draftFilters.game" :options="gameOptions" option-label="label" option-value="value" fluid /></div>
                    <div class="field"><label for="risk-anomaly">異常類型</label><Select id="risk-anomaly" v-model="draftFilters.anomalyType" :options="anomalyOptions" option-label="label" option-value="value" fluid /></div>
                    <div class="field"><label for="risk-severity">嚴重度</label><Select id="risk-severity" v-model="draftFilters.severity" :options="severityOptions" option-label="label" option-value="value" fluid /></div>
                    <div class="field"><label for="risk-status">處理狀態</label><Select id="risk-status" v-model="draftFilters.status" :options="statusOptions" option-label="label" option-value="value" fluid /></div>
                </div>

                <div class="risk-report-filter-footer">
                    <button type="button" class="risk-report-advanced-toggle" data-testid="risk-advanced-toggle" :aria-expanded="advancedVisible" @click="advancedVisible = !advancedVisible"><i :class="advancedVisible ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" />{{ advancedVisible ? '收合進階條件' : '顯示進階條件' }}</button>
                    <div class="risk-report-filter-actions"><Button label="查詢" icon="pi pi-search" data-testid="risk-apply-filters" @click="applyFilters" /><Button label="重置" icon="pi pi-refresh" severity="secondary" outlined data-testid="risk-reset-filters" @click="resetFilters" /></div>
                </div>

                <div v-if="advancedVisible" class="risk-report-filter-grid risk-report-filter-grid--advanced">
                    <div class="field"><label for="risk-event-id">風控事件 ID（Risk Event ID） <small>精確查詢</small></label><InputText id="risk-event-id" v-model="draftFilters.riskEventId" placeholder="輸入完整 rsk_..." fluid @keyup.enter="applyFilters" /></div>
                    <div class="field"><label for="risk-game-version">遊戲版本</label><InputText id="risk-game-version" v-model="draftFilters.gameVersion" placeholder="例如 v2.4.1" fluid @keyup.enter="applyFilters" /></div>
                    <div class="field"><label for="risk-source">異常來源</label><Select id="risk-source" v-model="draftFilters.source" :options="sourceOptions" option-label="label" option-value="value" fluid /></div>
                    <div class="field"><label for="risk-mitigation">自動緩解狀態</label><Select id="risk-mitigation" v-model="draftFilters.mitigationStatus" :options="mitigationOptions" option-label="label" option-value="value" fluid /></div>
                    <div class="field"><label for="risk-isolation">是否隔離</label><Select id="risk-isolation" v-model="draftFilters.isolationStatus" :options="isolationOptions" option-label="label" option-value="value" fluid /></div>
                    <div class="field"><label for="risk-ggap-status">GGAP 通知狀態</label><Select id="risk-ggap-status" v-model="draftFilters.ggapNotificationStatus" :options="ggapNotificationOptions" option-label="label" option-value="value" fluid /></div>
                    <div class="field"><label for="risk-provider-round">供應商遊戲回合 ID（Provider Game Round ID） <small>精確查詢</small></label><InputText id="risk-provider-round" v-model="draftFilters.providerGameRoundId" placeholder="輸入完整回合 ID" fluid @keyup.enter="applyFilters" /></div>
                    <div class="field"><label for="risk-ggap-round">GGAP 回合 ID（GGAP Round ID） <small>精確查詢</small></label><InputText id="risk-ggap-round" v-model="draftFilters.ggapRoundId" placeholder="輸入完整回合 ID" fluid @keyup.enter="applyFilters" /></div>
                </div>
            </template>
        </FilterCard>

        <section v-if="!queryError" class="risk-report-list-section" aria-labelledby="risk-list-title">
            <div class="risk-report-section-heading risk-report-list-heading">
                <div><span class="risk-report-eyebrow">風控事件列表</span><h2 id="risk-list-title">風控事件列表</h2><p>{{ tableDescription }}</p></div>
                <div class="risk-report-list-meta"><span><i class="pi pi-lock" />唯讀查詢</span><span><i class="pi pi-database" />{{ formatNumber(matchingRows.length) }} 筆結果</span><Button label="匯出" icon="pi pi-download" severity="secondary" outlined :disabled="matchingRows.length === 0" data-testid="risk-export-button" @click="openExport" /></div>
            </div>

            <div v-if="exportNotice" class="risk-report-export-notice" role="status"><i class="pi pi-info-circle" /><span>{{ exportNotice }}</span></div>

            <SectionCard class="risk-report-table-card">
                <div v-if="loadError" class="risk-report-state-panel risk-report-state-panel--error"><i class="pi pi-exclamation-circle" /><div><strong>{{ loadError }}</strong><p>請修正條件後重新查詢。</p></div><Button label="重置條件" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" /></div>
                <div v-else-if="!loading && matchingRows.length === 0" class="risk-report-state-panel"><i class="pi pi-search" /><div><strong>查無符合條件的風控事件</strong><p>目前查詢條件沒有事件資料；摘要卡已同步顯示 0。</p></div><Button label="清除條件" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" /></div>
                <DataTable v-else class="risk-report-data-table" :value="matchingRows" data-key="riskEventId" :loading="loading" scrollable paginator :first="first" :rows="8" :rows-per-page-options="[8, 16, 32]" table-style="min-width: 2180px" paginator-template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown" current-page-report-template="{first}-{last} / {totalRecords}" @page="handlePage">
                    <Column field="detectedAt" header="偵測時間" style="width: 168px; min-width: 168px"><template #body="{ data }"><span class="risk-report-time-cell">{{ formatDateTime(data.detectedAt) }}</span></template></Column>
                    <Column field="riskEventId" header="事件 ID" style="width: 264px; min-width: 264px"><template #body="{ data }"><span class="risk-report-id-cell">{{ data.riskEventId }}</span></template></Column>
                    <Column field="severity" header="嚴重度" style="width: 110px; min-width: 110px"><template #body="{ data }"><span class="risk-pill" :class="severityClass(data.severity)">{{ severityLabels[data.severity] }}</span></template></Column>
                    <Column field="environment" header="環境" style="width: 110px; min-width: 110px"><template #body="{ data }"><span class="risk-report-environment-cell"><i class="pi pi-circle-fill" />{{ environmentLabels[data.environment] }}</span></template></Column>
                    <Column field="source" header="異常來源" style="width: 142px; min-width: 142px"><template #body="{ data }">{{ sourceLabels[data.source] }}</template></Column>
                    <Column field="anomalyType" header="異常類型" style="width: 172px; min-width: 172px"><template #body="{ data }"><strong>{{ anomalyLabels[data.anomalyType] }}</strong></template></Column>
                    <Column field="gameName" header="遊戲名稱" style="width: 160px; min-width: 160px"><template #body="{ data }"><div class="risk-report-game-cell"><strong>{{ data.gameName }}</strong><small>{{ data.gameId }}</small></div></template></Column>
                    <Column field="gameVersion" header="遊戲版本" style="width: 122px; min-width: 122px"><template #body="{ data }"><span class="risk-report-version-cell">{{ data.gameVersion }}</span></template></Column>
                    <Column field="affectedRounds" header="受影響回合數" style="width: 170px; min-width: 170px"><template #body="{ data }"><span class="risk-report-number-cell">{{ formatNumber(data.affectedRounds) }}</span></template></Column>
                    <Column field="status" header="處理狀態" style="width: 120px; min-width: 120px"><template #body="{ data }"><span class="risk-pill" :class="statusClass(data.status)">{{ statusLabels[data.status] }}</span></template></Column>
                    <Column field="mitigationStatus" header="自動緩解狀態" style="width: 138px; min-width: 138px"><template #body="{ data }"><span class="risk-pill" :class="mitigationClass(data.mitigationStatus)">{{ mitigationLabels[data.mitigationStatus] }}</span></template></Column>
                    <Column field="isolationStatus" header="隔離狀態" style="width: 110px; min-width: 110px"><template #body="{ data }"><span class="risk-pill" :class="isolationClass(data.isolationStatus)">{{ isolationLabels[data.isolationStatus] }}</span></template></Column>
                    <Column field="ggapNotificationStatus" header="GGAP 通知狀態" style="width: 132px; min-width: 132px"><template #body="{ data }"><span class="risk-pill" :class="notificationClass(data.ggapNotificationStatus)">{{ ggapNotificationLabels[data.ggapNotificationStatus] }}</span></template></Column>
                    <Column field="updatedAt" header="最後更新時間" style="width: 168px; min-width: 168px"><template #body="{ data }"><span class="risk-report-time-cell">{{ formatDateTime(data.updatedAt) }}</span></template></Column>
                    <Column header="操作" frozen align-frozen="right" style="width: 166px; min-width: 166px"><template #body="{ data }"><div class="risk-report-row-actions"><Button icon="pi pi-eye" text rounded severity="secondary" aria-label="查看風控事件詳情" data-testid="risk-details-button" @click.stop="openDetails(data)" /><Button v-if="data.alertId" icon="pi pi-external-link" text rounded severity="danger" aria-label="前往告警處理" @click.stop="goToAlerts(data)" /></div></template></Column>
                </DataTable>
            </SectionCard>
        </section>

        <Dialog v-model:visible="exportVisible" modal dismissable-mask header="匯出風控報表" class="risk-export-dialog" :style="{ width: 'min(560px, calc(100vw - 32px))' }">
            <div class="risk-export-content">
                <div class="risk-export-intro"><i class="pi pi-file-export" /><div><strong>匯出完整篩選結果</strong><p>{{ environmentLabels[appliedFilters.environment] }} · {{ appliedRangeLabel }} · {{ formatNumber(matchingRows.length) }} 筆，不受目前分頁限制。</p></div></div>
                <div class="risk-export-format"><span>檔案格式</span><label><RadioButton v-model="exportFormat" name="risk-export-format" value="csv" /> CSV</label><label><RadioButton v-model="exportFormat" name="risk-export-format" value="xlsx" /> XLSX</label></div>
                <div class="risk-export-mock-note"><i class="pi pi-info-circle" /><span>原型／模擬資料（Prototype / Mock data）：目前只呈現匯出入口與格式選擇，不產生實體檔案。</span></div>
            </div>
            <template #footer><Button label="取消" severity="secondary" text @click="exportVisible = false" /><Button label="確認匯出" icon="pi pi-download" @click="runMockExport" /></template>
        </Dialog>

        <Dialog v-model:visible="detailsVisible" modal dismissable-mask class="risk-detail-dialog" :style="{ width: 'min(1180px, calc(100vw - 32px))' }" :header="selectedEvent ? `${selectedEvent.riskEventId} / 風控事件詳情` : '風控事件詳情'">
            <div v-if="selectedEvent" class="risk-detail-content">
                <div class="risk-detail-hero">
                    <div><span class="risk-report-eyebrow">唯讀事件證據</span><h2>{{ selectedEvent.gameName }}</h2><p>{{ anomalyLabels[selectedEvent.anomalyType] }} · {{ selectedEvent.gameVersion }} · {{ environmentLabels[selectedEvent.environment] }}</p></div>
                    <div class="risk-detail-hero-badges"><span class="risk-pill" :class="severityClass(selectedEvent.severity)">{{ severityLabels[selectedEvent.severity] }}</span><span class="risk-pill" :class="statusClass(selectedEvent.status)">{{ statusLabels[selectedEvent.status] }}</span><span class="risk-readonly-chip"><i class="pi pi-lock" />唯讀</span></div>
                </div>

                <section class="risk-detail-section"><div class="risk-detail-section-title"><i class="pi pi-file" /><h3>事件摘要</h3></div><div class="risk-detail-fact-grid"><div><span>風控事件 ID（Risk Event ID）</span><strong class="risk-detail-mono">{{ selectedEvent.riskEventId }}</strong></div><div><span>異常來源</span><strong>{{ sourceLabels[selectedEvent.source] }}</strong></div><div><span>首次偵測</span><strong>{{ formatDateTime(selectedEvent.detectedAt) }}</strong></div><div><span>首次發生</span><strong>{{ formatDateTime(selectedEvent.firstSeenAt) }}</strong></div><div><span>最後發生</span><strong>{{ formatDateTime(selectedEvent.lastOccurredAt) }}</strong></div><div><span>發生次數</span><strong>{{ formatNumber(selectedEvent.occurredCount) }} 次</strong></div><div><span>最後更新時間</span><strong>{{ formatDateTime(selectedEvent.updatedAt) }}</strong></div></div></section>

                <div class="risk-detail-two-column">
                    <section class="risk-detail-section"><div class="risk-detail-section-title"><i class="pi pi-globe" /><h3>影響範圍</h3></div><div class="risk-detail-fact-list"><div><span>遊戲 ID（Game ID）／名稱</span><strong>{{ selectedEvent.gameId }} · {{ selectedEvent.gameName }}</strong></div><div><span>版本／環境</span><strong>{{ selectedEvent.gameVersion }} · {{ environmentLabels[selectedEvent.environment] }}</strong></div><div><span>受影響遊戲回合</span><strong>{{ formatNumber(selectedEvent.affectedRounds) }} 筆 · {{ selectedEvent.isOngoing ? '仍持續發生' : '目前未持續' }}</strong></div><div><span>緩解作用範圍</span><strong>{{ formatEvidenceText(selectedEvent.mitigationScope) }}</strong></div><div><span>隔離狀態</span><span class="risk-pill" :class="isolationClass(selectedEvent.isolationStatus)">{{ isolationLabels[selectedEvent.isolationStatus] }}</span></div></div></section>
                    <section class="risk-detail-section"><div class="risk-detail-section-title"><i class="pi pi-sliders-h" /><h3>異常判斷依據</h3></div><div class="risk-detail-fact-list"><div><span>規則 ID（Rule ID）／版本</span><strong class="risk-detail-mono">{{ selectedEvent.ruleId }} · {{ selectedEvent.ruleVersion }}</strong></div><div><span>判斷門檻</span><strong>{{ selectedEvent.threshold }}</strong></div><div><span>實際數值</span><strong>{{ selectedEvent.actualValue }}</strong></div><div><span>統計窗口</span><strong>{{ selectedEvent.statisticWindow }}</strong></div><div><span>錯誤碼</span><strong class="risk-detail-mono">{{ selectedEvent.errorCode }}</strong></div></div></section>
                </div>

                <section class="risk-detail-section"><div class="risk-detail-section-title"><i class="pi pi-code" /><h3>請求／回應摘要</h3></div><div class="risk-detail-code-grid"><div><span>請求（Request）</span><code>{{ formatEvidenceText(selectedEvent.requestSummary) }}</code></div><div><span>回應（Response）</span><code>{{ formatEvidenceText(selectedEvent.responseSummary) }}</code></div><div class="risk-detail-error"><span>錯誤訊息（Error message）</span><code>{{ formatEvidenceText(selectedEvent.errorMessage) }}</code></div></div></section>

                <div class="risk-detail-two-column">
                    <section class="risk-detail-section"><div class="risk-detail-section-title"><i class="pi pi-bolt" /><h3>自動緩解</h3></div><div class="risk-detail-fact-list"><div><span>執行動作</span><strong>{{ formatEvidenceText(selectedEvent.mitigationAction) }}</strong></div><div><span>目前狀態</span><span class="risk-pill" :class="mitigationClass(selectedEvent.mitigationStatus)">{{ mitigationLabels[selectedEvent.mitigationStatus] }}</span></div><div><span>開始／完成</span><strong>{{ selectedEvent.mitigationStartedAt ? formatDateTime(selectedEvent.mitigationStartedAt) : '—' }} / {{ selectedEvent.mitigationCompletedAt ? formatDateTime(selectedEvent.mitigationCompletedAt) : '—' }}</strong></div><div><span>失敗原因</span><strong>{{ formatEvidenceText(selectedEvent.mitigationFailureReason) }}</strong></div></div></section>
                    <section class="risk-detail-section"><div class="risk-detail-section-title"><i class="pi pi-send" /><h3>GGAP 通知</h3></div><div class="risk-detail-fact-list"><div><span>通知狀態</span><span class="risk-pill" :class="notificationClass(selectedEvent.ggapNotificationStatus)">{{ ggapNotificationLabels[selectedEvent.ggapNotificationStatus] }}</span></div><div><span>provider_event_id</span><strong class="risk-detail-mono">{{ selectedEvent.ggapProviderEventId }}</strong></div><div><span>送出／ACK</span><strong>{{ selectedEvent.ggapSentAt ? formatDateTime(selectedEvent.ggapSentAt) : '—' }} / {{ selectedEvent.ggapAckAt ? formatDateTime(selectedEvent.ggapAckAt) : '—' }}</strong></div><div><span>重試次數</span><strong>{{ selectedEvent.ggapRetryCount }} 次</strong></div></div></section>
                </div>

                <section class="risk-detail-section"><div class="risk-detail-section-title"><i class="pi pi-directions-alt" /><h3>關聯遊戲回合</h3></div><div class="risk-detail-round-table-wrap"><table class="risk-detail-round-table"><thead><tr><th>供應商遊戲回合 ID（Provider Game Round ID）</th><th>GGAP 回合 ID（GGAP Round ID）</th><th>結算狀態</th><th>發生時間</th><th>入口</th></tr></thead><tbody><tr v-for="round in selectedEvent.relatedRounds" :key="round.providerId"><td class="risk-detail-mono">{{ round.providerId }}</td><td class="risk-detail-mono">{{ round.ggapId }}</td><td>{{ formatEvidenceText(round.settleStatus) }}</td><td>{{ formatDateTime(round.occurredAt) }}</td><td><Button label="遊戲紀錄" icon="pi pi-arrow-up-right" text severity="secondary" @click="goToRound(round)" /></td></tr></tbody></table></div></section>

                <section class="risk-detail-section"><div class="risk-detail-section-title"><i class="pi pi-history" /><h3>事件時間線</h3></div><ol class="risk-detail-timeline"><li v-for="item in selectedEvent.timeline" :key="`${item.label}-${item.time.toISOString()}`" :class="`risk-detail-timeline--${item.tone}`"><span class="risk-detail-timeline-dot" /><div><time>{{ formatDateTime(item.time) }}</time><strong>{{ formatEvidenceText(item.label) }}</strong><p>{{ formatEvidenceText(item.description) }}</p></div></li></ol></section>
            </div>
            <template #footer><div class="risk-detail-footer"><span v-if="selectedEvent && selectedEvent.alertId" class="risk-detail-footer-note"><i class="pi pi-info-circle" />此事件已有告警，處理操作請前往告警處理頁。</span><span v-else class="risk-detail-footer-note"><i class="pi pi-lock" />此事件目前沒有告警；本頁僅提供唯讀證據。</span><div><Button v-if="selectedEvent?.alertId" label="前往處理" icon="pi pi-external-link" severity="danger" outlined @click="goToAlerts(selectedEvent)" /><Button label="關閉" severity="secondary" outlined @click="detailsVisible = false" /></div></div></template>
        </Dialog>
    </div>
</template>

<style scoped>
.risk-reports-page { max-width: 1500px; width: 100%; margin: 0 auto; padding-bottom: 2.75rem; --risk-ink: #253b42; --risk-muted: #6d8083; --risk-line: #dce9e4; --risk-soft: #f4faf7; --risk-teal: #197a73; --risk-blue: #557aa7; --risk-amber: #bd7a2c; --risk-red: #bd514d; --risk-green: #3a8865; }
.risk-report-control-card { padding: 1.15rem 1.25rem; border: 1px solid var(--risk-line); border-radius: 1rem; background: linear-gradient(110deg, #f8fcfa 0%, #fff 52%, #f4faf8 100%); box-shadow: 0 .55rem 1.5rem rgba(37, 87, 82, .055); }
.risk-report-control-heading, .risk-report-section-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
.risk-report-eyebrow { display: block; color: var(--risk-teal); font-size: .62rem; font-weight: 800; letter-spacing: .16em; }
.risk-report-control-heading h2, .risk-report-section-heading h2 { margin: .25rem 0 .2rem; color: var(--risk-ink); font-size: 1.12rem; letter-spacing: -.02em; }
.risk-report-control-heading h2 { font-size: 1rem; }
.risk-report-scope-meta, .risk-report-applied-scope { display: inline-flex; align-items: center; gap: .4rem; color: var(--risk-muted); font-size: .74rem; }
.risk-report-control-grid { display: grid; grid-template-columns: minmax(15rem, .9fr) minmax(22rem, 1.65fr) auto; align-items: end; gap: 1rem; margin-top: 1rem; }
.risk-report-environment-field, .risk-report-time-field, .risk-report-date-range-field { display: grid; gap: .4rem; min-width: 0; }
.risk-report-field-label, .risk-report-filter-grid label { color: var(--risk-muted); font-size: .74rem; font-weight: 700; }
.risk-report-radio-group { display: flex; flex-wrap: wrap; gap: .75rem; align-items: center; min-height: 2.5rem; }
.risk-report-radio-option { display: inline-flex; align-items: center; gap: .4rem; color: var(--risk-ink); font-size: .82rem; font-weight: 700; cursor: pointer; }
.risk-report-quick-buttons { display: flex; flex-wrap: wrap; gap: .3rem; padding: .22rem; border: 1px solid var(--risk-line); border-radius: .7rem; background: var(--risk-soft); }
.risk-report-quick-button { min-height: 2rem; padding: .36rem .7rem; border: 0; border-radius: .5rem; background: transparent; color: var(--risk-muted); font: inherit; font-size: .74rem; font-weight: 800; cursor: pointer; transition: 160ms ease; }
.risk-report-quick-button:hover { background: rgba(25, 122, 115, .08); color: var(--risk-ink); }
.risk-report-quick-button.active { background: var(--risk-teal); color: #fff; box-shadow: 0 .25rem .8rem rgba(25, 122, 115, .18); }
.risk-report-applied-scope { justify-content: flex-end; min-height: 2.5rem; white-space: nowrap; }
.risk-report-summary-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: .8rem; }
.risk-report-summary-card { position: relative; min-width: 0; overflow: hidden; padding: 1rem 1.05rem 1.05rem; border: 1px solid var(--risk-line); border-top: 2px solid var(--risk-blue); border-radius: 1rem; background: var(--hig-bg-surface); box-shadow: 0 .55rem 1.5rem rgba(37, 87, 82, .045); }
.risk-report-summary-card::after { position: absolute; right: -1.2rem; bottom: -2rem; width: 5.3rem; height: 5.3rem; border: 1px solid rgba(20, 124, 120, .1); border-radius: 50%; content: ''; }
.risk-report-summary-card--amber { border-top-color: var(--risk-amber); }.risk-report-summary-card--teal { border-top-color: var(--risk-teal); }.risk-report-summary-card--green { border-top-color: var(--risk-green); }.risk-report-summary-card--red { border-top-color: var(--risk-red); }
.risk-report-summary-top { display: flex; align-items: center; justify-content: space-between; gap: .45rem; }
.risk-report-summary-top > span { display: inline-flex; align-items: center; gap: .4rem; color: var(--risk-muted); font-size: .73rem; font-weight: 800; white-space: nowrap; }
.risk-report-summary-top > span i { color: var(--risk-teal); font-size: .78rem; }
.risk-report-info-button { position: relative; z-index: 1; display: inline-grid; place-items: center; width: 1.55rem; height: 1.55rem; padding: 0; border: 0; border-radius: 50%; color: var(--risk-muted); background: transparent; cursor: help; }.risk-report-info-button:hover { color: var(--risk-teal); background: var(--risk-soft); }
.risk-report-summary-card > strong { display: block; margin-top: .65rem; color: var(--risk-ink); font-size: 1.7rem; line-height: 1; font-variant-numeric: tabular-nums; }.risk-report-summary-card > small { display: block; margin-top: .55rem; color: var(--risk-muted); font-size: .68rem; white-space: nowrap; }
.risk-report-attention-section, .risk-report-list-section { display: grid; gap: .85rem; }
.risk-report-section-heading h2 { font-size: 1.18rem; }.risk-report-section-heading p { margin: 0; color: var(--risk-muted); font-size: .77rem; line-height: 1.55; }.risk-report-section-count { flex-shrink: 0; padding: .38rem .65rem; border: 1px solid var(--risk-line); border-radius: 999px; color: var(--risk-teal); background: var(--risk-soft); font-size: .7rem; font-weight: 800; }
.risk-report-attention-list { display: grid; gap: .55rem; }.risk-report-attention-row { display: grid; grid-template-columns: 7.25rem minmax(15rem, 1.35fr) minmax(11rem, 1fr) minmax(10rem, .9fr) auto; align-items: center; gap: .8rem; padding: .85rem 1rem; border: 1px solid var(--risk-line); border-radius: .9rem; background: var(--hig-bg-surface); box-shadow: 0 .35rem 1rem rgba(37, 87, 82, .035); }.risk-report-attention-severity, .risk-report-attention-status { display: grid; gap: .3rem; }.risk-report-attention-severity time, .risk-report-attention-status small, .risk-report-attention-anomaly small { color: var(--risk-muted); font-size: .68rem; }.risk-report-attention-identity, .risk-report-attention-anomaly { display: grid; gap: .25rem; min-width: 0; }.risk-report-attention-identity strong { overflow: hidden; color: var(--risk-ink); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .75rem; text-overflow: ellipsis; white-space: nowrap; }.risk-report-attention-identity span, .risk-report-attention-anomaly span { overflow: hidden; color: var(--risk-ink); font-size: .78rem; text-overflow: ellipsis; white-space: nowrap; }.risk-report-attention-actions { display: flex; justify-content: flex-end; gap: .1rem; white-space: nowrap; }
.risk-report-attention-empty, .risk-report-state-panel { display: flex; align-items: center; gap: .9rem; padding: 1.4rem; border: 1px dashed var(--risk-line); border-radius: .9rem; background: var(--risk-soft); }.risk-report-empty-icon { display: grid; place-items: center; width: 2.25rem; height: 2.25rem; border-radius: 50%; color: var(--risk-green); background: rgba(58, 136, 101, .12); }.risk-report-attention-empty strong, .risk-report-state-panel strong { color: var(--risk-ink); font-size: .86rem; }.risk-report-attention-empty p, .risk-report-state-panel p { margin: .2rem 0 0; color: var(--risk-muted); font-size: .75rem; }.risk-report-state-panel--error { border-color: #ecd1cf; background: #fff8f7; }.risk-report-state-panel--error > i { color: var(--risk-red); font-size: 1.25rem; }.risk-report-state-panel > div { flex: 1; }
.risk-report-filter-range-row { display: grid; grid-template-columns: minmax(28rem, 1.7fr) minmax(14rem, 1fr); align-items: end; gap: 1rem; margin-bottom: 1rem; }.risk-report-filter-help { display: flex; gap: .45rem; align-items: center; min-height: 2.5rem; color: var(--risk-muted); font-size: .73rem; line-height: 1.5; }.risk-report-filter-help i { color: var(--risk-teal); }.risk-report-filter-grid { display: grid; gap: .8rem; }.risk-report-filter-grid--common { grid-template-columns: repeat(5, minmax(0, 1fr)); }.risk-report-filter-grid--advanced { grid-template-columns: repeat(4, minmax(0, 1fr)); margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--risk-line); }.risk-report-filter-grid > .field { display: grid; gap: .35rem; min-width: 0; }.risk-report-filter-grid label small { margin-left: .22rem; color: var(--risk-teal); font-size: .62rem; font-weight: 800; }.risk-report-filter-footer { display: flex; justify-content: space-between; gap: 1rem; align-items: center; margin-top: 1rem; }.risk-report-advanced-toggle { display: inline-flex; align-items: center; gap: .4rem; padding: .4rem 0; border: 0; background: transparent; color: var(--risk-teal); font: inherit; font-size: .76rem; font-weight: 800; cursor: pointer; }.risk-report-filter-actions { display: flex; justify-content: flex-end; gap: .5rem; }
.risk-report-list-heading { align-items: end; }.risk-report-list-meta { display: flex; flex-wrap: wrap; justify-content: flex-end; align-items: center; gap: .65rem; color: var(--risk-muted); font-size: .72rem; }.risk-report-list-meta span { display: inline-flex; align-items: center; gap: .32rem; }.risk-report-list-meta i { color: var(--risk-teal); }.risk-report-list-meta :deep(.p-button) { flex-shrink: 0; }.risk-report-export-notice { display: flex; align-items: flex-start; gap: .5rem; padding: .7rem .85rem; border: 1px solid #c9dced; border-radius: .75rem; color: #416e9f; background: #eff6fc; font-size: .74rem; line-height: 1.5; }.risk-report-export-notice i { margin-top: .15rem; }.risk-report-table-card { min-width: 0; padding: 0; overflow: hidden; }.risk-report-table-card :deep(.p-datatable-wrapper) { scrollbar-color: #b4d0ca transparent; }.risk-report-table-card :deep(.p-datatable-table) { font-size: .76rem; }.risk-report-table-card :deep(.p-datatable-thead > tr > th) { padding: .75rem .8rem; color: var(--risk-muted); background: #f6faf8; font-size: .7rem; font-weight: 800; white-space: nowrap; }.risk-report-table-card :deep(.p-datatable-tbody > tr > td) { padding: .8rem; color: var(--risk-ink); border-color: var(--risk-line); vertical-align: middle; white-space: nowrap; }.risk-report-table-card :deep(.p-paginator) { justify-content: flex-end; gap: .15rem; padding: .65rem .85rem; border-top: 1px solid var(--risk-line); }.risk-report-time-cell { color: var(--risk-muted); font-variant-numeric: tabular-nums; }.risk-report-id-cell, .risk-detail-mono { color: #456d77; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .7rem; }.risk-detail-mono { overflow-wrap: anywhere; word-break: break-word; }.risk-report-environment-cell { display: inline-flex; align-items: center; gap: .35rem; color: var(--risk-teal); font-weight: 800; }.risk-report-environment-cell i { font-size: .38rem; }.risk-report-game-cell { display: grid; gap: .18rem; }.risk-report-game-cell strong { color: var(--risk-ink); }.risk-report-game-cell small, .risk-report-version-cell { color: var(--risk-muted); font-size: .68rem; }.risk-report-number-cell { font-variant-numeric: tabular-nums; font-weight: 800; }.risk-report-row-actions { display: flex; justify-content: center; gap: .1rem; }
.risk-export-content { display: grid; gap: 1rem; }.risk-export-intro { display: flex; gap: .7rem; align-items: flex-start; padding: .85rem; border: 1px solid var(--risk-line); border-radius: .75rem; background: var(--risk-soft); }.risk-export-intro > i { margin-top: .1rem; color: var(--risk-teal); font-size: 1.1rem; }.risk-export-intro strong { color: var(--risk-ink); font-size: .84rem; }.risk-export-intro p { margin: .25rem 0 0; color: var(--risk-muted); font-size: .74rem; line-height: 1.5; }.risk-export-format { display: flex; flex-wrap: wrap; align-items: center; gap: .8rem; color: var(--risk-ink); font-size: .78rem; font-weight: 700; }.risk-export-format > span { color: var(--risk-muted); }.risk-export-format label { display: inline-flex; align-items: center; gap: .35rem; cursor: pointer; }.risk-export-mock-note { display: flex; gap: .45rem; align-items: flex-start; padding: .7rem .8rem; border: 1px solid #f0d9ae; border-radius: .65rem; color: #96611e; background: #fff9eb; font-size: .72rem; line-height: 1.5; }.risk-export-mock-note i { margin-top: .15rem; }
.risk-pill { display: inline-flex; align-items: center; justify-content: center; width: max-content; padding: .26rem .48rem; border: 1px solid transparent; border-radius: 999px; font-size: .65rem; font-weight: 800; line-height: 1.2; white-space: nowrap; }.risk-pill--critical, .risk-pill--high, .risk-pill--notification-failed, .risk-pill--mitigation-failed { color: #ad3f3a; border-color: #f0c5c1; background: #fff0ee; }.risk-pill--critical { box-shadow: inset 3px 0 0 #c53e38; }.risk-pill--high { color: #a35b2a; border-color: #efd2b4; background: #fff6e9; }.risk-pill--medium, .risk-pill--status-pending, .risk-pill--mitigation-pending, .risk-pill--notification-pending { color: #96611e; border-color: #f0d9ae; background: #fff9eb; }.risk-pill--low, .risk-pill--info, .risk-pill--status-false_positive, .risk-pill--mitigation-not_required, .risk-pill--notification-not_required, .risk-pill--isolation-not_isolated { color: #5f7276; border-color: #dbe6e4; background: #f4f8f7; }.risk-pill--status-investigating, .risk-pill--mitigation-applied, .risk-pill--notification-sent { color: #416e9f; border-color: #c9dced; background: #eff6fc; }.risk-pill--status-mitigated, .risk-pill--status-closed, .risk-pill--mitigation-released, .risk-pill--notification-acknowledged, .risk-pill--isolation-released { color: #347553; border-color: #c9e2d4; background: #eff9f3; }.risk-pill--isolation-isolated { color: #8d4f42; border-color: #ecd0c8; background: #fff5f0; }
.risk-detail-content { display: grid; gap: 1rem; min-width: 0; max-width: 100%; overflow-x: hidden; }.risk-detail-hero { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; min-width: 0; padding: 1.1rem 1.2rem; border: 1px solid var(--risk-line); border-radius: .95rem; background: linear-gradient(115deg, #f7fbfa, #fff 60%, #fff7f3); }.risk-detail-hero h2 { margin: .25rem 0 .2rem; color: var(--risk-ink); font-size: 1.28rem; }.risk-detail-hero p { margin: 0; color: var(--risk-muted); font-size: .78rem; }.risk-detail-hero-badges { display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: .45rem; }.risk-readonly-chip { display: inline-flex; align-items: center; gap: .3rem; padding: .28rem .5rem; border: 1px solid var(--risk-line); border-radius: 999px; color: var(--risk-muted); background: var(--hig-bg-surface); font-size: .65rem; font-weight: 800; }.risk-detail-section { min-width: 0; max-width: 100%; padding: 1rem 1.05rem; border: 1px solid var(--risk-line); border-radius: .9rem; background: var(--hig-bg-surface); }.risk-detail-section-title { display: flex; align-items: center; gap: .45rem; margin-bottom: .8rem; }.risk-detail-section-title i { color: var(--risk-teal); }.risk-detail-section-title h3 { margin: 0; color: var(--risk-ink); font-size: .9rem; }.risk-detail-fact-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .8rem 1rem; }.risk-detail-fact-grid > div, .risk-detail-fact-list > div, .risk-detail-code-grid > div { display: grid; gap: .22rem; min-width: 0; }.risk-detail-fact-grid span, .risk-detail-fact-list span, .risk-detail-code-grid span { color: var(--risk-muted); font-size: .68rem; }.risk-detail-fact-grid strong, .risk-detail-fact-list strong { color: var(--risk-ink); font-size: .77rem; line-height: 1.45; }.risk-detail-two-column { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }.risk-detail-fact-list { display: grid; gap: .7rem; }.risk-detail-code-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .75rem; min-width: 0; }.risk-detail-code-grid code { display: block; min-height: 2.8rem; padding: .6rem .7rem; overflow-wrap: anywhere; border-radius: .55rem; color: #49646a; background: #f4f8f7; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .7rem; line-height: 1.5; }.risk-detail-error { grid-column: 1 / -1; }.risk-detail-round-table-wrap { width: 100%; max-width: 100%; min-width: 0; overflow-x: auto; overscroll-behavior-inline: contain; }.risk-detail-round-table { width: 100%; min-width: 720px; border-collapse: collapse; font-size: .72rem; }.risk-detail-round-table th { color: var(--risk-muted); background: #f6faf8; font-size: .67rem; text-align: left; }.risk-detail-round-table th, .risk-detail-round-table td { padding: .65rem .7rem; border-bottom: 1px solid var(--risk-line); white-space: nowrap; }.risk-detail-round-table tr:last-child td { border-bottom: 0; }.risk-detail-timeline { display: grid; gap: 0; margin: 0; padding: 0; list-style: none; }.risk-detail-timeline li { position: relative; display: grid; grid-template-columns: 1rem 1fr; gap: .7rem; min-height: 4.2rem; }.risk-detail-timeline-dot { position: relative; z-index: 1; width: .68rem; height: .68rem; margin-top: .23rem; border: 2px solid #fff; border-radius: 50%; background: var(--risk-teal); box-shadow: 0 0 0 1px var(--risk-line); }.risk-detail-timeline li:not(:last-child) .risk-detail-timeline-dot::after { position: absolute; top: .56rem; left: .18rem; width: 1px; height: 3.8rem; background: var(--risk-line); content: ''; }.risk-detail-timeline--danger .risk-detail-timeline-dot { background: var(--risk-red); }.risk-detail-timeline--warning .risk-detail-timeline-dot { background: var(--risk-amber); }.risk-detail-timeline--success .risk-detail-timeline-dot { background: var(--risk-green); }.risk-detail-timeline time { display: block; color: var(--risk-muted); font-size: .67rem; }.risk-detail-timeline strong { display: block; margin-top: .18rem; color: var(--risk-ink); font-size: .78rem; }.risk-detail-timeline p { margin: .18rem 0 0; color: var(--risk-muted); font-size: .73rem; line-height: 1.5; }.risk-detail-footer { display: flex; align-items: center; justify-content: space-between; gap: 1rem; width: 100%; min-width: 0; flex-wrap: wrap; }.risk-detail-footer-note { display: inline-flex; align-items: center; gap: .4rem; min-width: 0; color: var(--risk-muted); font-size: .7rem; text-align: left; }.risk-detail-footer-note i { color: var(--risk-teal); }.risk-detail-footer > div { display: flex; gap: .5rem; flex-wrap: wrap; }
.risk-reports-page :deep(.risk-detail-dialog.p-dialog) { max-width: calc(100vw - 24px); overflow: hidden; }.risk-reports-page :deep(.risk-detail-dialog .p-dialog-header) { min-width: 0; align-items: flex-start; gap: .65rem; }.risk-reports-page :deep(.risk-detail-dialog .p-dialog-title) { min-width: 0; flex: 1 1 auto; max-width: 100%; overflow-wrap: anywhere; word-break: break-word; white-space: normal; line-height: 1.35; }.risk-reports-page :deep(.risk-detail-dialog .p-dialog-header-actions), .risk-reports-page :deep(.risk-detail-dialog .p-dialog-close-button) { flex: 0 0 auto; }.risk-reports-page :deep(.risk-detail-dialog .p-dialog-content), .risk-reports-page :deep(.risk-detail-dialog .p-dialog-footer) { min-width: 0; max-width: 100%; overflow-x: hidden; }
:global(.risk-detail-dialog.p-dialog) { max-width: calc(100vw - 24px); overflow: hidden; }:global(.risk-detail-dialog .p-dialog-header) { display: flex; width: 100%; min-width: 0; box-sizing: border-box; align-items: flex-start; gap: .65rem; }:global(.risk-detail-dialog .p-dialog-title) { min-width: 0; flex: 1 1 auto; max-width: none; overflow-wrap: anywhere; word-break: break-word; white-space: normal; line-height: 1.35; }:global(.risk-detail-dialog .p-dialog-header-actions) { flex: 0 0 35px; min-width: 35px; margin-left: auto; }:global(.risk-detail-dialog .p-dialog-close-button) { flex: 0 0 35px; }:global(.risk-detail-dialog .p-dialog-content), :global(.risk-detail-dialog .p-dialog-footer) { min-width: 0; max-width: 100%; overflow-x: hidden; }
@media (max-width: 1150px) { .risk-report-control-grid { grid-template-columns: 1fr 1.35fr; }.risk-report-applied-scope { justify-content: flex-start; grid-column: 1 / -1; }.risk-report-summary-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }.risk-report-attention-row { grid-template-columns: 7rem minmax(14rem, 1fr) minmax(10rem, 1fr) auto; }.risk-report-attention-status { grid-column: 2; }.risk-report-attention-actions { grid-column: 4; grid-row: 1 / span 2; }.risk-report-filter-grid--common { grid-template-columns: repeat(3, minmax(0, 1fr)); }.risk-report-filter-grid--advanced { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 760px) { .risk-reports-page { padding-bottom: 1.5rem; }.risk-report-control-card { padding: 1rem; }.risk-report-control-heading, .risk-report-section-heading, .risk-detail-hero, .risk-detail-footer { flex-direction: column; }.risk-report-scope-meta { align-self: flex-start; }.risk-report-control-grid, .risk-report-filter-range-row, .risk-report-filter-grid--common, .risk-report-filter-grid--advanced, .risk-detail-two-column, .risk-detail-code-grid { grid-template-columns: 1fr; }.risk-report-applied-scope { grid-column: auto; }.risk-report-summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .6rem; }.risk-report-summary-card { padding: .85rem; }.risk-report-summary-card > strong { font-size: 1.45rem; }.risk-report-summary-card > small { overflow: hidden; text-overflow: ellipsis; }.risk-report-attention-row { grid-template-columns: 1fr; gap: .55rem; }.risk-report-attention-status, .risk-report-attention-actions { grid-column: auto; grid-row: auto; }.risk-report-attention-actions { justify-content: flex-start; flex-wrap: wrap; }.risk-report-filter-footer { align-items: stretch; flex-direction: column; }.risk-report-filter-actions { justify-content: flex-start; }.risk-report-list-meta { justify-content: flex-start; }.risk-report-state-panel, .risk-report-attention-empty { align-items: flex-start; flex-wrap: wrap; }.risk-report-state-panel > div { min-width: 12rem; }.risk-detail-fact-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }.risk-detail-footer > div { flex-wrap: wrap; }.risk-detail-footer-note { width: 100%; }.risk-detail-hero-badges { justify-content: flex-start; } }
@media (max-width: 420px) { .risk-report-summary-grid { grid-template-columns: 1fr; }.risk-detail-fact-grid { grid-template-columns: 1fr; }.risk-report-quick-button { flex: 1 1 auto; }.risk-report-filter-actions .p-button { flex: 1; }.risk-report-list-meta { width: 100%; justify-content: flex-start; }.risk-report-list-meta :deep(.p-button) { margin-top: .15rem; }:global(.risk-detail-dialog.p-dialog) { width: calc(100vw - 24px) !important; max-width: calc(100vw - 24px); }:global(.risk-detail-dialog .p-dialog-header) { padding: .8rem .9rem; }:global(.risk-detail-dialog .p-dialog-content) { padding: .85rem .9rem 1rem; }:global(.risk-detail-dialog .p-dialog-footer) { padding: .75rem .9rem; }:global(.risk-detail-dialog .p-dialog-title) { max-width: none; font-size: .88rem; }:global(.risk-detail-dialog .p-dialog-close-button) { margin-top: -.1rem; } }
</style>
