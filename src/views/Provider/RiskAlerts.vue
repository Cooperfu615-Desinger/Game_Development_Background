<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import RadioButton from 'primevue/radiobutton'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import DateTimeRangeField from '@/components/ui/DateTimeRangeField.vue'

type Environment = 'production' | 'demo'
type Severity = 'medium' | 'high' | 'critical'
type AlertStatus = 'pending' | 'investigating' | 'mitigated' | 'closed' | 'false_positive'
type MitigationStatus = 'not_required' | 'pending' | 'applied' | 'failed' | 'released'
type IsolationStatus = 'not_isolated' | 'isolated' | 'released'
type GgapNotificationStatus = 'not_required' | 'pending' | 'sent' | 'failed' | 'acknowledged'
type DateRange = [Date | null, Date | null]
type AlertStatusFilter = AlertStatus | 'active' | ''
type ShortcutKey = 'unassigned' | 'high-risk' | 'isolated' | 'auto-failed' | 'overdue' | ''
type ActionType = 'takeover' | 'assign' | 'note' | 'mitigate' | 'maintain-isolation' | 'release-isolation' | 'retry-mitigation' | 'resend-ggap' | 'false-positive' | 'close' | 'reopen'

interface TimelineItem {
    time: Date
    label: string
    description: string
    tone: 'neutral' | 'warning' | 'danger' | 'success'
    actor?: string
}

interface RelatedRound {
    providerId: string
    ggapId: string
    settleStatus: string
    occurredAt: Date
}

interface RequestLog {
    id: string
    time: Date
    type: string
    status: string
    summary: string
}

interface HealthCheck {
    status: 'passed' | 'warning' | 'failed'
    checkedAt: Date
    summary: string
    checks: string[]
}

interface AlertRecord {
    alertId: string
    riskEventId: string
    createdAt: Date
    updatedAt: Date
    environment: Environment
    gameId: string
    gameName: string
    gameVersion: string
    anomalyType: string
    source: string
    severity: Severity
    affectedRounds: number
    status: AlertStatus
    assignee: string | null
    mitigationStatus: MitigationStatus
    mitigationAction: string
    mitigationScope: string
    isolationStatus: IsolationStatus
    isolationScopeKey: string
    isolatedAt: Date | null
    ggapNotificationStatus: GgapNotificationStatus
    reviewDueAt: Date | null
    providerRoundIds: string[]
    ggapRoundIds: string[]
    isOngoing: boolean
    firstSeenAt: Date
    lastOccurredAt: Date
    occurredCount: number
    ruleId: string
    ruleVersion: string
    threshold: string
    actualValue: string
    statisticWindow: string
    errorCode: string
    errorMessage: string
    requestSummary: string
    responseSummary: string
    mitigationFailureReason: string
    mitigationStartedAt: Date | null
    mitigationCompletedAt: Date | null
    ggapProviderEventId: string
    ggapSentAt: Date | null
    ggapAckAt: Date | null
    ggapRetryCount: number
    healthCheck: HealthCheck
    relatedRounds: RelatedRound[]
    requestLogs: RequestLog[]
    timeline: TimelineItem[]
}

interface FilterState {
    status: AlertStatusFilter
    severity: Severity | ''
    environment: Environment
    game: string
    anomalyType: string
    assignee: string
    overdue: 'yes' | 'no' | ''
    alertId: string
    riskEventId: string
    source: string
    gameVersion: string
    mitigationStatus: MitigationStatus | ''
    isolationStatus: IsolationStatus | ''
    ggapNotificationStatus: GgapNotificationStatus | ''
    providerGameRoundId: string
    ggapRoundId: string
    createdRange: DateRange
    shortcut: ShortcutKey
}

interface PageEvent {
    first?: number
    rows?: number
}

const route = useRoute()
const router = useRouter()
const toast = useToast()
const timezoneLabel = 'UTC+08:00 · Asia/Taipei'
const currentUser = '目前使用者'
const now = new Date()

const environmentLabels: Record<Environment, string> = {
    production: '正式環境',
    demo: '展示環境',
}

const environmentOptionLabels: Record<Environment, string> = {
    production: '正式環境（Production）',
    demo: '展示環境（DEMO）',
}

const severityLabels: Record<Severity, string> = {
    critical: '嚴重',
    high: '高',
    medium: '中',
}

const severityOptionLabels: Record<Severity, string> = {
    critical: '嚴重（Critical）',
    high: '高（High）',
    medium: '中（Medium）',
}

const statusLabels: Record<AlertStatus, string> = {
    pending: '待處理',
    investigating: '調查中',
    mitigated: '已緩解',
    closed: '已結案',
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

const notificationLabels: Record<GgapNotificationStatus, string> = {
    not_required: '不需通知',
    pending: '通知中',
    sent: '已送出',
    failed: '通知失敗',
    acknowledged: '已確認',
}

const sourceLabels: Record<string, string> = {
    game_round: '遊戲回合',
    callback: '回呼',
    ggap_request: 'GGAP 請求',
    game_service: '遊戲服務',
    data_quality: '資料品質',
    game_math: '遊戲數值',
}

const sourceOptionLabels: Record<string, string> = {
    game_round: '遊戲回合（Game Round）',
    callback: '回呼（Callback）',
    ggap_request: 'GGAP 請求（GGAP Request）',
    game_service: '遊戲服務（Game Service）',
    data_quality: '資料品質（Data Quality）',
    game_math: '遊戲數值（Game Math）',
}

const anomalyLabels: Record<string, string> = {
    settlement_failure: '結算失敗',
    callback_failure: '回呼失敗',
    duplicate_settlement: '重複結算',
    request_timeout: '請求逾時',
    service_unavailable: '遊戲服務不可用',
    payout_anomaly: '派彩結果異常',
}

const anomalyOptionLabels: Record<string, string> = {
    settlement_failure: '結算失敗（Settlement Failure）',
    callback_failure: '回呼失敗（Callback Failure）',
    duplicate_settlement: '重複結算（Duplicate Settlement）',
    request_timeout: '請求逾時（Request Timeout）',
    service_unavailable: '遊戲服務不可用（Service Unavailable）',
    payout_anomaly: '派彩結果異常（Payout Anomaly）',
}

const statusOptionLabels: Record<AlertStatus, string> = {
    pending: '待處理（Pending）',
    investigating: '調查中（Investigating）',
    mitigated: '已緩解（Mitigated）',
    closed: '已結案（Closed）',
    false_positive: '誤報（False positive）',
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

const notificationOptionLabels: Record<GgapNotificationStatus, string> = {
    not_required: '不需通知（Not required）',
    pending: '通知中（Pending）',
    sent: '已送出（Sent）',
    failed: '通知失敗（Failed）',
    acknowledged: '已確認（Acknowledged）',
}

const mockTextTranslations: Array<[string, string]> = [
    ['有限重試與新 Launch 限制', '有限重試與新遊戲啟動限制'],
    ['建立 Alert', '建立告警'],
    ['Alert 已結案', '告警已結案'],
    ['Callback 未', '回呼未'],
    ['失敗 Callback 已', '失敗回呼已'],
    ['既有 Round Callback', '既有遊戲回合回呼'],
    ['新 Launch 觀察', '新遊戲啟動觀察'],
    ['暫停新 Launch', '暫停新遊戲啟動'],
    ['Callback 重試中', '回呼重試中'],
    ['結算上游 unavailable', '結算上游服務不可用'],
    ['retry queue accepted', '重試佇列已接受'],
    ['Callback payload', '回呼負載'],
    ['Round 狀態', '回合狀態'],
    ['受影響 Round', '受影響回合'],
    ['Game service 仍', '遊戲服務仍'],
    ['GGAP Settle endpoint returned', 'GGAP 結算端點回傳'],
    ['Callback acknowledgement exceeded 90 seconds', '回呼確認回覆超過 90 秒'],
    ['Duplicate settle request rejected by idempotency guard', '重複結算請求已由冪等防護拒絕'],
    ['Game service unavailable', '遊戲服務不可用'],
    ['Payout exceeded configured range', '派彩超出設定範圍'],
    ['DEMO upstream response exceeded threshold', 'DEMO 上游回應超過門檻'],
    ['GGAP response exceeded timeout threshold', 'GGAP 回應超過逾時門檻'],
    ['Required field arrived after initial validation', '必要欄位於初次驗證後到達'],
    ['Callback response latency exceeded threshold', '回呼回應延遲超過門檻'],
    ['Round linkage was temporarily unavailable', '回合關聯暫時不可用'],
    ['Fields completed before settlement', '欄位已於結算前補齊'],
    ['Schema validator 暫時標記欄位缺失。', '結構驗證器暫時標記欄位缺失。'],
    ['Game service health', '遊戲服務健康'],
    ['Callback delivery queue', '回呼傳送佇列'],
    ['Callback queue', '回呼佇列'],
    ['Settle upstream unavailable', '結算上游服務不可用'],
    ['Settle upstream 仍', '結算上游仍'],
    ['Settle upstream', '結算上游'],
    ['New Launch guard', '新啟動防護'],
    ['DEMO service health', 'DEMO 服務健康'],
    ['Launch retry', '啟動重試'],
    ['DEMO Round settle', 'DEMO 回合結算'],
    ['Round settle', '回合結算'],
    ['Math rule sample', '數值規則樣本'],
    ['Idempotency guard', '冪等防護'],
    ['Game math monitor', '遊戲數值監控'],
    ['No ACK', '尚無 ACK'],
    ['ACK received after retry', '重試後收到 ACK'],
    ['Retry succeeded', '重試成功'],
    ['Pending rule review', '待規則覆核'],
    ['Link restored before close', '關聯已於結案前恢復'],
    ['Round reconciliation worker', '回合對帳工作程序'],
    ['demo endpoint', 'DEMO 端點'],
    ['delayed field hydration', '延遲欄位補齊'],
    ['interval', '間隔'],
    ['timeout', '逾時'],
    ['retry', '重試'],
    ['endpoint', '端點'],
    ['upstream unavailable', '上游服務不可用'],
    ['upstream', '上游'],
    ['Bad Gateway', '閘道錯誤'],
    ['Service Unavailable', '服務不可用'],
    ['idempotency key reused', '冪等鍵重複使用'],
    ['batch', '批次'],
    ['queue', '佇列'],
    ['sample', '樣本'],
    ['accepted', '已接受'],
    ['failed', '失敗'],
    ['passed', '通過'],
    ['pending', '處理中'],
    ['Health check', '健康檢查'],
    ['Settle', '結算'],
    ['Callback', '回呼'],
    ['Launch', '啟動'],
    ['Risk Event', '風控事件'],
    ['Game Round', '遊戲回合'],
    ['Round', '回合'],
    ['Alert', '告警'],
    ['Critical', '嚴重'],
    ['High', '高'],
    ['Medium', '中'],
    ['Production', '正式環境'],
]

function translateMockText(value: string) {
    return mockTextTranslations.reduce((text, [from, to]) => text.replaceAll(from, to), value)
}

function hoursAgo(hours: number, minutes = 0) {
    return new Date(now.getTime() - (hours * 60 + minutes) * 60 * 1000)
}

function hoursFromNow(hours: number, minutes = 0) {
    return new Date(now.getTime() + (hours * 60 + minutes) * 60 * 1000)
}

function formatDateTime(value: Date | null) {
    if (!value) return '—'
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

function formatShortDate(value: Date | null) {
    if (!value) return '無期限'
    return new Intl.DateTimeFormat('zh-TW', { timeZone: 'Asia/Taipei', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(value).replace('月', '/').replace('日', '')
}

function formatNumber(value: number) {
    return value.toLocaleString('en-US')
}

function formatDuration(milliseconds: number | null) {
    if (!milliseconds || milliseconds <= 0) return '0 分鐘'
    const minutes = Math.max(1, Math.round(milliseconds / 60000))
    const days = Math.floor(minutes / 1440)
    const hours = Math.floor((minutes % 1440) / 60)
    const remainder = minutes % 60
    if (days) return `${days} 日 ${hours} 小時`
    if (hours) return `${hours} 小時 ${remainder} 分鐘`
    return `${remainder} 分鐘`
}

function makeTimeline(eventTime: Date, items: Array<[number, string, string, TimelineItem['tone']]>): TimelineItem[] {
    return items.map(([offset, label, description, tone]) => ({
        time: new Date(eventTime.getTime() + offset * 60 * 1000),
        label,
        description,
        tone,
        actor: '風控自動化',
    }))
}

function makeAlert(input: Omit<AlertRecord, 'updatedAt' | 'firstSeenAt' | 'lastOccurredAt' | 'requestLogs'> & { requestLogs?: RequestLog[] }): AlertRecord {
    return {
        ...input,
        updatedAt: new Date(input.createdAt.getTime() + 26 * 60 * 1000),
        firstSeenAt: new Date(input.createdAt.getTime() - 42 * 60 * 1000),
        lastOccurredAt: new Date(input.createdAt.getTime() + 18 * 60 * 1000),
        requestLogs: input.requestLogs ?? [{ id: 'req_mock_001', time: input.createdAt, type: '風控偵測', status: '已記錄', summary: '已保存請求摘要與回應摘要。' }],
    }
}

const mockAlerts = ref<AlertRecord[]>([
    makeAlert({
        alertId: 'alt_01jz4m8v3k6q2d7p9x5n1c0bqa', riskEventId: 'rsk_01jz4m8v3k6q2d7p9x5n1c0bqa', createdAt: hoursAgo(3, 12), environment: 'production', gameId: 'NH-001', gameName: 'Neon Heist', gameVersion: 'v2.4.1', anomalyType: 'settlement_failure', source: 'game_round', severity: 'critical', affectedRounds: 146, status: 'pending', assignee: null, mitigationStatus: 'failed', mitigationAction: '重試結算 · 暫停新 Launch', mitigationScope: 'Neon Heist / v2.4.1 / Production', isolationStatus: 'not_isolated', isolationScopeKey: 'NH-001:v2.4.1:production', isolatedAt: null, ggapNotificationStatus: 'failed', reviewDueAt: hoursAgo(0, 42), providerRoundIds: ['pr_nh_8a31f2', 'pr_nh_8a31f3', 'pr_nh_8a31f4'], ggapRoundIds: ['gg_7A31F2', 'gg_7A31F3', 'gg_7A31F4'], isOngoing: true, occurredCount: 48, ruleId: 'risk.settlement.failure-rate', ruleVersion: 'v3.2', threshold: '失敗率 > 3% / 15 分鐘', actualValue: '11.8%（146 / 1,237）', statisticWindow: '近 15 分鐘', errorCode: 'SETTLE_UPSTREAM_502', errorMessage: 'GGAP Settle endpoint returned 502', requestSummary: 'POST /settle · timeout 5s · retry 2/3', responseSummary: '502 Bad Gateway · upstream unavailable', mitigationFailureReason: '暫停新 Launch 權限尚未取得；重試佇列持續失敗。', mitigationStartedAt: hoursAgo(3, 9), mitigationCompletedAt: null, ggapProviderEventId: 'pev_7d9c1a2e', ggapSentAt: hoursAgo(3, 5), ggapAckAt: null, ggapRetryCount: 3, healthCheck: { status: 'failed', checkedAt: hoursAgo(0, 8), summary: '未通過：Settle upstream 仍回傳 502。', checks: ['Game service health：正常', 'Settle upstream：失敗', 'Callback queue：等待重試'] }, relatedRounds: [{ providerId: 'pr_nh_8a31f2', ggapId: 'gg_7A31F2', settleStatus: '結算失敗', occurredAt: hoursAgo(3, 12) }, { providerId: 'pr_nh_8a31f3', ggapId: 'gg_7A31F3', settleStatus: '重試中', occurredAt: hoursAgo(3, 5) }], timeline: makeTimeline(hoursAgo(3, 12), [[0, '建立 Alert', '結算失敗率超過規則門檻。', 'danger'], [4, '自動緩解失敗', '有限重試與新 Launch 限制均未完成。', 'warning'], [18, 'GGAP 通知失敗', '通知已重試 3 次，尚未取得 ACK。', 'danger']]), requestLogs: [{ id: 'req_nh_settle_01', time: hoursAgo(3, 12), type: 'Settle', status: '502', summary: 'POST /settle · timeout 5s · retry 2/3' }, { id: 'req_nh_health_02', time: hoursAgo(0, 8), type: 'Health check', status: 'failed', summary: 'Settle upstream unavailable' }],
    }),
    makeAlert({
        alertId: 'alt_01jz4f6b2c9m7q8x3n5v0d1epa', riskEventId: 'rsk_01jz4f6b2c9m7q8x3n5v0d1epa', createdAt: hoursAgo(5, 18), environment: 'production', gameId: 'ND-014', gameName: 'Neon Drift', gameVersion: 'v1.8.3', anomalyType: 'callback_failure', source: 'callback', severity: 'high', affectedRounds: 64, status: 'investigating', assignee: '林怡君', mitigationStatus: 'applied', mitigationAction: '重新排入 Callback 可靠佇列', mitigationScope: 'Neon Drift / v1.8.3 / Production', isolationStatus: 'isolated', isolationScopeKey: 'ND-014:v1.8.3:production', isolatedAt: hoursAgo(5, 11), ggapNotificationStatus: 'acknowledged', reviewDueAt: hoursFromNow(1, 10), providerRoundIds: ['pr_nd_4f91a2'], ggapRoundIds: ['gg_4F91A2'], isOngoing: false, occurredCount: 19, ruleId: 'risk.callback.missing', ruleVersion: 'v2.6', threshold: '未收到 Callback > 90 秒', actualValue: '64 筆未收到 Callback', statisticWindow: '近 30 分鐘', errorCode: 'CALLBACK_ACK_TIMEOUT', errorMessage: 'Callback acknowledgement exceeded 90 seconds', requestSummary: 'Callback delivery queue · batch 4F91', responseSummary: 'No ACK · retry queue accepted', mitigationFailureReason: '—', mitigationStartedAt: hoursAgo(5, 14), mitigationCompletedAt: hoursAgo(5, 7), ggapProviderEventId: 'pev_4f91c82a', ggapSentAt: hoursAgo(5, 1), ggapAckAt: hoursAgo(4, 56), ggapRetryCount: 1, healthCheck: { status: 'passed', checkedAt: hoursAgo(0, 12), summary: '通過：Callback queue 已恢復消化。', checks: ['Game service health：正常', 'Callback queue：正常', 'Round settle：正常'] }, relatedRounds: [{ providerId: 'pr_nd_4f91a2', ggapId: 'gg_4F91A2', settleStatus: 'Callback 重試中', occurredAt: hoursAgo(5, 18) }], timeline: makeTimeline(hoursAgo(5, 18), [[0, '建立 Alert', 'Callback 未在等待時間內回覆。', 'danger'], [7, '自動緩解已套用', '失敗 Callback 已重新排入可靠佇列。', 'success'], [22, '人工接手', '林怡君開始調查受影響 Round。', 'warning']]),
    }),
    makeAlert({
        alertId: 'alt_01jz4b1p8w4y6h0m2k9d7c3sqa', riskEventId: 'rsk_01jz4b1p8w4y6h0m2k9d7c3sqa', createdAt: hoursAgo(9, 40), environment: 'production', gameId: 'PC-009', gameName: 'Paper Crane', gameVersion: 'v3.1.0', anomalyType: 'duplicate_settlement', source: 'data_quality', severity: 'critical', affectedRounds: 27, status: 'mitigated', assignee: '陳冠廷', mitigationStatus: 'applied', mitigationAction: '依冪等鍵忽略重複結算', mitigationScope: 'Paper Crane / v3.1.0 / Production', isolationStatus: 'isolated', isolationScopeKey: 'PC-009:v3.1.0:production', isolatedAt: hoursAgo(9, 35), ggapNotificationStatus: 'acknowledged', reviewDueAt: hoursAgo(0, 28), providerRoundIds: ['pr_pc_aa31d9', 'pr_pc_aa31da'], ggapRoundIds: ['gg_AA31D9', 'gg_AA31DA'], isOngoing: false, occurredCount: 9, ruleId: 'risk.round.duplicate-settle', ruleVersion: 'v1.9', threshold: '相同 Round ID 出現 2 次以上結算', actualValue: '27 筆重複請求', statisticWindow: '近 10 分鐘', errorCode: 'ROUND_IDEMPOTENCY_CONFLICT', errorMessage: 'Duplicate settle request rejected by idempotency guard', requestSummary: 'POST /settle · idempotency key reused', responseSummary: '409 Conflict · duplicate request ignored', mitigationFailureReason: '—', mitigationStartedAt: hoursAgo(9, 37), mitigationCompletedAt: hoursAgo(9, 35), ggapProviderEventId: 'pev_aa31d99e', ggapSentAt: hoursAgo(9, 22), ggapAckAt: hoursAgo(9, 20), ggapRetryCount: 0, healthCheck: { status: 'warning', checkedAt: hoursAgo(0, 18), summary: '部分通過：重複請求已停止，仍需觀察 15 分鐘。', checks: ['Game service health：正常', 'Idempotency guard：正常', '新 Launch 觀察窗口：進行中'] }, relatedRounds: [{ providerId: 'pr_pc_aa31d9', ggapId: 'gg_AA31D9', settleStatus: '已防重', occurredAt: hoursAgo(9, 40) }, { providerId: 'pr_pc_aa31da', ggapId: 'gg_AA31DA', settleStatus: '已防重', occurredAt: hoursAgo(9, 34) }], timeline: makeTimeline(hoursAgo(9, 40), [[0, '建立 Alert', '資料品質規則判定為重複結算。', 'danger'], [5, '自動緩解已套用', '冪等防重擋下重複請求。', 'success'], [31, '事件已緩解', '未再觀察到新的重複結算。', 'success']]),
    }),
    makeAlert({
        alertId: 'alt_01jz42n8w5q1d7c3m9x6v0bpea', riskEventId: 'rsk_01jz42n8w5q1d7c3m9x6v0bpea', createdAt: hoursAgo(21, 22), environment: 'production', gameId: 'SG-031', gameName: 'Solar Garden', gameVersion: 'v2.0.0', anomalyType: 'service_unavailable', source: 'game_service', severity: 'high', affectedRounds: 91, status: 'pending', assignee: null, mitigationStatus: 'failed', mitigationAction: '暫停指定版本新 Launch', mitigationScope: 'Solar Garden / v2.0.0 / Production', isolationStatus: 'not_isolated', isolationScopeKey: 'SG-031:v2.0.0:production', isolatedAt: null, ggapNotificationStatus: 'failed', reviewDueAt: hoursFromNow(0, 35), providerRoundIds: ['pr_sg_98c20b', 'pr_sg_98c21'], ggapRoundIds: ['gg_98C20B', 'gg_98C21'], isOngoing: true, occurredCount: 22, ruleId: 'risk.game-service.health', ruleVersion: 'v4.1', threshold: '健康檢查連續失敗 3 次', actualValue: '連續失敗 7 次', statisticWindow: '近 8 分鐘', errorCode: 'GAME_SERVICE_503', errorMessage: 'Game service unavailable', requestSummary: 'GET /health · interval 30s', responseSummary: '503 Service Unavailable', mitigationFailureReason: '版本隔離執行器尚未取得有效鎖。', mitigationStartedAt: hoursAgo(21, 18), mitigationCompletedAt: null, ggapProviderEventId: 'pev_98c20b7a', ggapSentAt: hoursAgo(21, 5), ggapAckAt: null, ggapRetryCount: 2, healthCheck: { status: 'failed', checkedAt: hoursAgo(0, 6), summary: '未通過：Game service 仍回傳 503。', checks: ['Game service health：失敗', 'New Launch guard：未套用', '既有 Round Callback：保留'] }, relatedRounds: [{ providerId: 'pr_sg_98c20b', ggapId: 'gg_98C20B', settleStatus: '等待服務恢復', occurredAt: hoursAgo(21, 22) }, { providerId: 'pr_sg_98c21', ggapId: 'gg_98C21', settleStatus: 'Callback 保留', occurredAt: hoursAgo(21, 15) }], timeline: makeTimeline(hoursAgo(21, 22), [[0, '建立 Alert', '健康檢查連續失敗，事件升級為 High。', 'danger'], [3, '自動緩解失敗', '版本隔離未成功套用。', 'warning'], [16, 'GGAP 通知失敗', '通知服務等待重試。', 'danger']]),
    }),
    makeAlert({
        alertId: 'alt_01jz3y7m4c8p1d6v0x9q2bnea', riskEventId: 'rsk_01jz3y7m4c8p1d6v0x9q2bnea', createdAt: hoursAgo(31, 10), environment: 'production', gameId: 'FM-017', gameName: 'Fortune Mahjong', gameVersion: 'v4.2.2', anomalyType: 'payout_anomaly', source: 'game_math', severity: 'medium', affectedRounds: 8, status: 'investigating', assignee: '王子安', mitigationStatus: 'pending', mitigationAction: '重新計算統計窗口', mitigationScope: 'Fortune Mahjong / v4.2.2 / Production', isolationStatus: 'not_isolated', isolationScopeKey: 'FM-017:v4.2.2:production', isolatedAt: null, ggapNotificationStatus: 'pending', reviewDueAt: hoursAgo(1, 18), providerRoundIds: ['pr_fm_1a3c70'], ggapRoundIds: ['gg_1A3C70'], isOngoing: false, occurredCount: 2, ruleId: 'risk.math.payout-spike', ruleVersion: 'v1.7', threshold: '單局派彩 > 限紅 4 倍', actualValue: '最高 5.6 倍', statisticWindow: '近 60 分鐘', errorCode: 'PAYOUT_OUTLIER', errorMessage: 'Payout exceeded configured range', requestSummary: 'Game math monitor · sample 8,412', responseSummary: 'Pending rule review', mitigationFailureReason: '—', mitigationStartedAt: hoursAgo(31, 2), mitigationCompletedAt: null, ggapProviderEventId: 'pev_1a3c70d8', ggapSentAt: hoursAgo(30, 48), ggapAckAt: null, ggapRetryCount: 0, healthCheck: { status: 'passed', checkedAt: hoursAgo(0, 32), summary: '通過：服務與資料結算流程正常。', checks: ['Game service health：正常', 'Round settle：正常', 'Math rule sample：待覆核'] }, relatedRounds: [{ providerId: 'pr_fm_1a3c70', ggapId: 'gg_1A3C70', settleStatus: '已完成，待調查', occurredAt: hoursAgo(31, 10) }], timeline: makeTimeline(hoursAgo(31, 10), [[0, '建立 Alert', '數值規則偵測到派彩離群。', 'warning'], [23, '人工接手', '王子安開始檢視規則版本與樣本量。', 'neutral']]),
    }),
    makeAlert({
        alertId: 'alt_01jz3s4v8n2d5c0m7x9q1bpea', riskEventId: 'rsk_01jz3s4v8n2d5c0m7x9q1bpea', createdAt: hoursAgo(8, 6), environment: 'demo', gameId: 'NH-001', gameName: 'Neon Heist', gameVersion: 'v2.5.0-rc1', anomalyType: 'request_timeout', source: 'ggap_request', severity: 'high', affectedRounds: 12, status: 'pending', assignee: null, mitigationStatus: 'applied', mitigationAction: 'DEMO Launch 重新排隊', mitigationScope: 'Neon Heist / v2.5.0-rc1 / DEMO', isolationStatus: 'isolated', isolationScopeKey: 'NH-001:v2.5.0-rc1:demo', isolatedAt: hoursAgo(8, 1), ggapNotificationStatus: 'sent', reviewDueAt: hoursFromNow(3), providerRoundIds: ['pr_nh_demo_5b1e'], ggapRoundIds: ['gg_DEMO5B1E'], isOngoing: false, occurredCount: 5, ruleId: 'risk.request.timeout', ruleVersion: 'v2.2', threshold: '回應時間 > 5,000 ms', actualValue: 'P95 8,140 ms', statisticWindow: '近 30 分鐘', errorCode: 'DEMO_UPSTREAM_TIMEOUT', errorMessage: 'DEMO upstream response exceeded threshold', requestSummary: 'POST /launch · demo endpoint', responseSummary: 'Retry succeeded · 200 OK', mitigationFailureReason: '—', mitigationStartedAt: hoursAgo(8, 4), mitigationCompletedAt: hoursAgo(8, 1), ggapProviderEventId: 'pev_5b1e092a', ggapSentAt: hoursAgo(8), ggapAckAt: null, ggapRetryCount: 1, healthCheck: { status: 'passed', checkedAt: hoursAgo(0, 20), summary: '通過：DEMO Launch 重試後恢復。', checks: ['DEMO service health：正常', 'Launch retry：成功', 'DEMO Round settle：正常'] }, relatedRounds: [{ providerId: 'pr_nh_demo_5b1e', ggapId: 'gg_DEMO5B1E', settleStatus: '已完成', occurredAt: hoursAgo(8, 6) }], timeline: makeTimeline(hoursAgo(8, 6), [[0, '建立 Alert', 'DEMO 請求超過逾時門檻。', 'warning'], [8, '自動緩解已套用', '請求已重新排隊並成功完成。', 'success']]),
    }),
    makeAlert({
        alertId: 'alt_01jz47q3n6p8v2c5m0x1d9beka', riskEventId: 'rsk_01jz47q3n6p8v2c5m0x1d9beka', createdAt: hoursAgo(14, 8), environment: 'production', gameId: 'LH-022', gameName: 'Lucky Harbor', gameVersion: 'v5.0.2', anomalyType: 'request_timeout', source: 'ggap_request', severity: 'medium', affectedRounds: 18, status: 'closed', assignee: '林怡君', mitigationStatus: 'released', mitigationAction: '可重試請求退避重試', mitigationScope: 'Lucky Harbor / v5.0.2 / Production', isolationStatus: 'released', isolationScopeKey: 'LH-022:v5.0.2:production', isolatedAt: hoursAgo(14, 4), ggapNotificationStatus: 'sent', reviewDueAt: null, providerRoundIds: ['pr_lh_1c0b83'], ggapRoundIds: ['gg_1C0B83'], isOngoing: false, occurredCount: 4, ruleId: 'risk.request.timeout', ruleVersion: 'v2.2', threshold: '回應時間 > 5,000 ms', actualValue: 'P95 7,240 ms', statisticWindow: '近 15 分鐘', errorCode: 'UPSTREAM_TIMEOUT', errorMessage: 'GGAP response exceeded timeout threshold', requestSummary: 'POST /launch · timeout 5s · retry 1/3', responseSummary: 'Retry succeeded · 200 OK', mitigationFailureReason: '—', mitigationStartedAt: hoursAgo(14, 4), mitigationCompletedAt: hoursAgo(14, 2), ggapProviderEventId: 'pev_1c0b83f4', ggapSentAt: hoursAgo(13, 55), ggapAckAt: null, ggapRetryCount: 1, healthCheck: { status: 'passed', checkedAt: hoursAgo(13, 45), summary: '通過：服務恢復且無持續影響。', checks: ['Game service health：正常', 'Launch retry：成功', 'Round settle：正常'] }, relatedRounds: [{ providerId: 'pr_lh_1c0b83', ggapId: 'gg_1C0B83', settleStatus: '已完成', occurredAt: hoursAgo(14, 8) }], timeline: makeTimeline(hoursAgo(14, 8), [[0, '建立 Alert', '請求超過逾時門檻。', 'warning'], [6, '自動緩解已套用', '退避重試成功，服務恢復。', 'success'], [86, 'Alert 已結案', '確認無持續影響後完成結案。', 'neutral']]),
    }),
    makeAlert({
        alertId: 'alt_01jz45k2a9d6m3p7x8v0c1bqea', riskEventId: 'rsk_01jz45k2a9d6m3p7x8v0c1bqea', createdAt: hoursAgo(17, 50), environment: 'production', gameId: 'OR-006', gameName: 'Orbit Rush', gameVersion: 'v1.4.8', anomalyType: 'callback_failure', source: 'callback', severity: 'medium', affectedRounds: 3, status: 'false_positive', assignee: '王子安', mitigationStatus: 'not_required', mitigationAction: '不需處理', mitigationScope: 'Orbit Rush / v1.4.8 / Production', isolationStatus: 'not_isolated', isolationScopeKey: 'OR-006:v1.4.8:production', isolatedAt: null, ggapNotificationStatus: 'not_required', reviewDueAt: null, providerRoundIds: ['pr_or_2c91a0'], ggapRoundIds: ['gg_2C91A0'], isOngoing: false, occurredCount: 3, ruleId: 'risk.payload.required-fields', ruleVersion: 'v1.4', threshold: '必要欄位缺失 >= 1', actualValue: '3 筆（已由延遲資料補齊）', statisticWindow: '近 30 分鐘', errorCode: 'PAYLOAD_FIELD_DELAYED', errorMessage: 'Required field arrived after initial validation', requestSummary: 'Callback payload · delayed field hydration', responseSummary: 'Fields completed before settlement', mitigationFailureReason: '—', mitigationStartedAt: null, mitigationCompletedAt: null, ggapProviderEventId: '—', ggapSentAt: null, ggapAckAt: null, ggapRetryCount: 0, healthCheck: { status: 'passed', checkedAt: hoursAgo(17, 15), summary: '通過：延遲資料已補齊。', checks: ['Callback payload：正常', 'Round settle：正常', '資料關聯：正常'] }, relatedRounds: [{ providerId: 'pr_or_2c91a0', ggapId: 'gg_2C91A0', settleStatus: '已完成', occurredAt: hoursAgo(17, 50) }], timeline: makeTimeline(hoursAgo(17, 50), [[0, '建立 Alert', 'Schema validator 暫時標記欄位缺失。', 'warning'], [12, '資料補齊', '延遲欄位到達，Round 狀態正常。', 'success'], [62, '確認誤報', '確認不構成實際資料異常。', 'neutral']]),
    }),
])

const assigneeOptions = computed(() => [
    { label: '全部負責人', value: '' },
    { label: '未指派', value: '__unassigned__' },
    ...Array.from(new Set(mockAlerts.value.map((alert) => alert.assignee).filter((value): value is string => Boolean(value)))).map((value) => ({ label: value, value })),
])
const assigneePeopleOptions = computed(() => Array.from(new Set(mockAlerts.value.map((alert) => alert.assignee).filter((value): value is string => Boolean(value)))).map((value) => ({ label: value, value })))
const gameOptions = computed(() => [{ label: '全部遊戲', value: '' }, ...Array.from(new Map(mockAlerts.value.map((alert) => [alert.gameId, { label: alert.gameName, value: alert.gameId }])).values())])
const anomalyOptions = computed(() => [{ label: '全部異常類型', value: '' }, ...Array.from(new Set(mockAlerts.value.map((alert) => alert.anomalyType))).map((value) => ({ label: anomalyOptionLabels[value], value }))])
const sourceOptions = computed(() => [{ label: '全部來源', value: '' }, ...Array.from(new Set(mockAlerts.value.map((alert) => alert.source))).map((value) => ({ label: sourceOptionLabels[value], value }))])
const gameVersionOptions = computed(() => [{ label: '全部遊戲版本', value: '' }, ...Array.from(new Set(mockAlerts.value.map((alert) => alert.gameVersion))).map((value) => ({ label: value, value }))])

const statusOptions = [
    { label: '未結案／非誤報（Active）', value: 'active' },
    { label: '全部狀態', value: '' },
    ...Object.entries(statusOptionLabels).map(([value, label]) => ({ value, label })),
]
const severityOptions = [{ label: '全部嚴重度', value: '' }, ...Object.entries(severityOptionLabels).map(([value, label]) => ({ value, label }))]
const mitigationOptions = [{ label: '全部緩解狀態', value: '' }, ...Object.entries(mitigationOptionLabels).map(([value, label]) => ({ value, label }))]
const isolationOptions = [{ label: '全部隔離狀態', value: '' }, ...Object.entries(isolationOptionLabels).map(([value, label]) => ({ value, label }))]
const notificationOptions = [{ label: '全部通知狀態', value: '' }, ...Object.entries(notificationOptionLabels).map(([value, label]) => ({ value, label }))]
const overdueOptions = [{ label: '全部', value: '' }, { label: '已逾期', value: 'yes' }, { label: '未逾期', value: 'no' }]

const initialFilters: FilterState = {
    status: 'active', severity: '', environment: 'production', game: '', anomalyType: '', assignee: '', overdue: '', alertId: '', riskEventId: '', source: '', gameVersion: '', mitigationStatus: '', isolationStatus: '', ggapNotificationStatus: '', providerGameRoundId: '', ggapRoundId: '', createdRange: [null, null], shortcut: '',
}

function cloneDateRange(range: DateRange): DateRange {
    return [range[0] ? new Date(range[0]) : null, range[1] ? new Date(range[1]) : null]
}

function cloneFilters(value: FilterState): FilterState {
    return { ...value, createdRange: cloneDateRange(value.createdRange) }
}

const draftFilters = reactive<FilterState>(cloneFilters(initialFilters))
const appliedFilters = ref<FilterState>(cloneFilters(initialFilters))
const advancedVisible = ref(false)
const loading = ref(true)
const loadError = ref('')
const queryError = ref('')
const first = ref(0)
const rowsPerPage = ref(8)
const selectedAlert = ref<AlertRecord | null>(null)
const detailVisible = ref(false)
const exportVisible = ref(false)
const exportFormat = ref<'csv' | 'xlsx'>('csv')
const exportNotice = ref('')
const actionVisible = ref(false)
const actionBusy = ref(false)
const actionError = ref('')
const pendingAction = ref<ActionType | null>(null)
const actionNote = ref('')
const actionAssignee = ref<string | null>(null)
const actionReviewDueAt = ref<Date | null>(null)

const activeAlert = (alert: AlertRecord) => !['closed', 'false_positive'].includes(alert.status)
const isOverdue = (alert: AlertRecord) => Boolean(activeAlert(alert) && alert.reviewDueAt && alert.reviewDueAt.getTime() < Date.now())
const autoProcessingFailed = (alert: AlertRecord) => activeAlert(alert) && (alert.mitigationStatus === 'failed' || alert.ggapNotificationStatus === 'failed')
const isIsolated = (alert: AlertRecord) => activeAlert(alert) && alert.isolationStatus === 'isolated'

function matchesShortcut(alert: AlertRecord, shortcut: ShortcutKey) {
    if (!shortcut) return true
    if (shortcut === 'unassigned') return activeAlert(alert) && !alert.assignee
    if (shortcut === 'high-risk') return activeAlert(alert) && ['critical', 'high'].includes(alert.severity)
    if (shortcut === 'isolated') return isIsolated(alert)
    if (shortcut === 'auto-failed') return autoProcessingFailed(alert)
    return isOverdue(alert)
}

const matchingRows = computed(() => {
    const filters = appliedFilters.value
    const [from, to] = filters.createdRange
    return mockAlerts.value
        .filter((alert) => {
            if (alert.environment !== filters.environment) return false
            if (filters.status === 'active' && !activeAlert(alert)) return false
            if (filters.status && filters.status !== 'active' && alert.status !== filters.status) return false
            if (filters.severity && alert.severity !== filters.severity) return false
            if (filters.game && alert.gameId !== filters.game) return false
            if (filters.anomalyType && alert.anomalyType !== filters.anomalyType) return false
            if (filters.assignee === '__unassigned__' && alert.assignee) return false
            if (filters.assignee && filters.assignee !== '__unassigned__' && alert.assignee !== filters.assignee) return false
            if (filters.overdue === 'yes' && !isOverdue(alert)) return false
            if (filters.overdue === 'no' && isOverdue(alert)) return false
            if (filters.alertId && alert.alertId !== filters.alertId.trim()) return false
            if (filters.riskEventId && alert.riskEventId !== filters.riskEventId.trim()) return false
            if (filters.source && alert.source !== filters.source) return false
            if (filters.gameVersion && alert.gameVersion !== filters.gameVersion) return false
            if (filters.mitigationStatus && alert.mitigationStatus !== filters.mitigationStatus) return false
            if (filters.isolationStatus && alert.isolationStatus !== filters.isolationStatus) return false
            if (filters.ggapNotificationStatus && alert.ggapNotificationStatus !== filters.ggapNotificationStatus) return false
            if (filters.providerGameRoundId && !alert.providerRoundIds.includes(filters.providerGameRoundId.trim())) return false
            if (filters.ggapRoundId && !alert.ggapRoundIds.includes(filters.ggapRoundId.trim())) return false
            if (from && alert.createdAt < from) return false
            if (to && alert.createdAt > to) return false
            return matchesShortcut(alert, filters.shortcut)
        })
        .sort(comparePriority)
})

function compareReviewDue(left: AlertRecord, right: AlertRecord) {
    if (left.reviewDueAt && right.reviewDueAt) return left.reviewDueAt.getTime() - right.reviewDueAt.getTime()
    if (left.reviewDueAt && !right.reviewDueAt) return -1
    if (!left.reviewDueAt && right.reviewDueAt) return 1
    return right.createdAt.getTime() - left.createdAt.getTime()
}

function comparePriority(left: AlertRecord, right: AlertRecord) {
    if (left.severity === 'critical' || right.severity === 'critical') {
        if (left.severity !== right.severity) return left.severity === 'critical' ? -1 : 1
    }
    const leftFailed = autoProcessingFailed(left)
    const rightFailed = autoProcessingFailed(right)
    if (leftFailed !== rightFailed) return leftFailed ? -1 : 1
    const leftLate = isOverdue(left)
    const rightLate = isOverdue(right)
    if (leftLate !== rightLate) return leftLate ? -1 : 1
    if (left.severity !== right.severity) {
        if (left.severity === 'high' || right.severity === 'high') return left.severity === 'high' ? -1 : 1
        return left.severity === 'medium' ? -1 : 1
    }
    return compareReviewDue(left, right)
}

const pagedRows = computed(() => matchingRows.value.slice(first.value, first.value + rowsPerPage.value))
const totalPages = computed(() => Math.max(1, Math.ceil(matchingRows.value.length / rowsPerPage.value)))
const currentPage = computed(() => Math.floor(first.value / rowsPerPage.value) + 1)

const isolationSummaryRows = computed(() => matchingRows.value.filter(isIsolated))
const summaryCards = computed(() => {
    const rows = mockAlerts.value.filter((alert) => alert.environment === appliedFilters.value.environment && activeAlert(alert))
    const unassigned = rows.filter((alert) => !alert.assignee)
    const highRisk = rows.filter((alert) => ['critical', 'high'].includes(alert.severity))
    const isolated = rows.filter(isIsolated)
    const failed = rows.filter(autoProcessingFailed)
    const overdue = rows.filter(isOverdue)
    const breakdown = (source: AlertRecord[]) => (['critical', 'high', 'medium'] as Severity[]).map((severity) => `${severityLabels[severity]} ${source.filter((alert) => alert.severity === severity).length}`).filter((item) => !item.endsWith(' 0')).join('、') || '目前沒有符合資料'
    const longestWaiting = unassigned.length ? Math.max(...unassigned.map((alert) => Date.now() - alert.createdAt.getTime())) : null
    const failedMitigation = failed.filter((alert) => alert.mitigationStatus === 'failed').length
    const failedNotification = failed.filter((alert) => alert.ggapNotificationStatus === 'failed').length
    return [
        { key: 'unassigned' as ShortcutKey, label: '待接手告警', value: unassigned.length, icon: 'pi pi-inbox', tone: 'blue', tip: `嚴重度：${breakdown(unassigned)}；最久等待 ${formatDuration(longestWaiting)}。` },
        { key: 'high-risk' as ShortcutKey, label: '高風險告警', value: highRisk.length, icon: 'pi pi-shield', tone: 'red', tip: `受影響遊戲：${new Set(highRisk.map((alert) => alert.gameName)).size} 款；隔離中 ${highRisk.filter((alert) => alert.isolationStatus === 'isolated').length} 筆、未隔離 ${highRisk.filter((alert) => alert.isolationStatus !== 'isolated').length} 筆。` },
        { key: 'isolated' as ShortcutKey, label: '隔離中', value: new Set(isolated.map((alert) => alert.isolationScopeKey)).size, icon: 'pi pi-lock', tone: 'amber', tip: isolated.length ? isolated.map((alert) => `${alert.gameName} ${alert.gameVersion} · ${environmentLabels[alert.environment]} · ${formatDuration(Date.now() - (alert.isolatedAt?.getTime() ?? Date.now()))}`).join('；') : '目前沒有仍阻擋新遊戲啟動的範圍。' },
        { key: 'auto-failed' as ShortcutKey, label: '自動處理失敗', value: failed.length, icon: 'pi pi-bolt', tone: 'red', tip: `緩解失敗 ${failedMitigation} 筆；GGAP 通知失敗 ${failedNotification} 筆。` },
        { key: 'overdue' as ShortcutKey, label: '逾期未覆核', value: overdue.length, icon: 'pi pi-calendar-clock', tone: 'green', tip: overdue.length ? overdue.map((alert) => `${alert.assignee ?? '未指派'} · ${alert.gameName} · 逾期 ${formatDuration(Date.now() - (alert.reviewDueAt?.getTime() ?? Date.now()))}`).join('；') : '目前沒有逾期覆核。' },
    ]
})

const tableDescription = computed(() => `${environmentLabels[appliedFilters.value.environment]} · ${formatNumber(matchingRows.value.length)} 筆結果 · 優先排序：嚴重 → 自動處理失敗 → 逾期 → 高 → 中`)
const appliedShortcutLabel = computed(() => {
    const card = summaryCards.value.find((item) => item.key === appliedFilters.value.shortcut)
    return card?.label ?? ''
})

function severityClass(value: Severity) { return `risk-alert-pill--${value}` }
function statusClass(value: AlertStatus) { return `risk-alert-pill--status-${value}` }
function mitigationClass(value: MitigationStatus) { return `risk-alert-pill--mitigation-${value}` }
function isolationClass(value: IsolationStatus) { return `risk-alert-pill--isolation-${value}` }
function notificationClass(value: GgapNotificationStatus) { return `risk-alert-pill--notification-${value}` }
function healthClass(value: HealthCheck['status']) { return `risk-alert-health--${value}` }

function chooseShortcut(key: ShortcutKey) {
    const nextShortcut = draftFilters.shortcut === key ? '' : key
    const environment = appliedFilters.value.environment
    Object.assign(draftFilters, cloneFilters(initialFilters), { environment, shortcut: nextShortcut })
    applyFilters()
}

function applyFilters() {
    const [from, to] = draftFilters.createdRange
    if (from && to && from.getTime() > to.getTime()) {
        loadError.value = '建立時間區間無效，起始時間不可晚於結束時間。'
        return
    }
    loadError.value = ''
    appliedFilters.value = cloneFilters(draftFilters)
    first.value = 0
    loading.value = true
    window.setTimeout(() => { loading.value = false }, 260)
}

function resetFilters() {
    Object.assign(draftFilters, cloneFilters(initialFilters))
    applyFilters()
}

function handlePage(event: PageEvent) {
    first.value = event.first ?? 0
    if (event.rows && event.rows !== rowsPerPage.value) {
        rowsPerPage.value = event.rows
        first.value = 0
    }
}

function openDetails(alert: AlertRecord) {
    selectedAlert.value = alert
    detailVisible.value = true
    queryError.value = ''
}

function queryValue(value: unknown) {
    if (Array.isArray(value)) return typeof value[0] === 'string' ? value[0] : ''
    return typeof value === 'string' ? value : ''
}

function openQueryTarget() {
    const alertId = queryValue(route.query.alert_id)
    const riskEventId = queryValue(route.query.risk_event_id)
    if (!alertId && !riskEventId) return
    const target = mockAlerts.value.find((alert) => (!alertId || alert.alertId === alertId) && (!riskEventId || alert.riskEventId === riskEventId))
    if (!target) {
        selectedAlert.value = null
        detailVisible.value = false
        queryError.value = `找不到指定的告警${alertId ? `：${alertId}` : ''}${riskEventId ? `（風控事件 ${riskEventId}）` : ''}。請確認識別碼後再試。`
        return
    }
    queryError.value = ''
    selectedAlert.value = target
    detailVisible.value = true
}

function goToRiskEvent(alert: AlertRecord) {
    router.push({ path: '/monitoring/risk-reports', query: { risk_event_id: alert.riskEventId } })
}

function goToRequestLogs(alert: AlertRecord) {
    router.push({ path: '/ggap/requests', query: { provider_event_id: alert.ggapProviderEventId, alert_id: alert.alertId } })
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

const actionTitles: Record<ActionType, string> = {
    takeover: '確認接手處理', assign: '指派／改派負責人', note: '新增處理備註', mitigate: '標記已緩解', 'maintain-isolation': '維持隔離', 'release-isolation': '解除隔離', 'retry-mitigation': '重試自動處理', 'resend-ggap': '重送 GGAP 通知', 'false-positive': '標記誤報', close: '結案', reopen: '重新開啟',
}
const actionLabels: Record<ActionType, string> = {
    takeover: '確認接手', assign: '確認指派', note: '新增備註', mitigate: '標記已緩解', 'maintain-isolation': '維持隔離', 'release-isolation': '確認解除隔離', 'retry-mitigation': '確認重試', 'resend-ggap': '確認重送', 'false-positive': '確認標記誤報', close: '確認結案', reopen: '確認重新開啟',
}
const actionNeedsReason = (action: ActionType | null) => Boolean(action && ['note', 'mitigate', 'maintain-isolation', 'release-isolation', 'retry-mitigation', 'resend-ggap', 'false-positive', 'close', 'reopen'].includes(action))

const canTakeover = computed(() => Boolean(selectedAlert.value && activeAlert(selectedAlert.value) && !selectedAlert.value.assignee))
const canAssign = computed(() => Boolean(selectedAlert.value && activeAlert(selectedAlert.value)))
const canMitigate = computed(() => Boolean(selectedAlert.value && activeAlert(selectedAlert.value) && selectedAlert.value.status !== 'mitigated'))
const canMaintainIsolation = computed(() => Boolean(selectedAlert.value && activeAlert(selectedAlert.value) && selectedAlert.value.isolationStatus === 'isolated'))
const canReleaseIsolation = computed(() => Boolean(selectedAlert.value && activeAlert(selectedAlert.value) && selectedAlert.value.isolationStatus === 'isolated' && selectedAlert.value.healthCheck.status === 'passed'))
const canRetryMitigation = computed(() => Boolean(selectedAlert.value && activeAlert(selectedAlert.value) && selectedAlert.value.mitigationStatus === 'failed'))
const canResendGgap = computed(() => Boolean(selectedAlert.value && activeAlert(selectedAlert.value) && selectedAlert.value.ggapNotificationStatus === 'failed'))
const canFalsePositive = computed(() => Boolean(selectedAlert.value && activeAlert(selectedAlert.value) && selectedAlert.value.isolationStatus !== 'isolated'))
const closeBlockReason = computed(() => {
    const alert = selectedAlert.value
    if (!alert || !activeAlert(alert)) return '此告警已不在可結案狀態。'
    if (alert.isolationStatus === 'isolated') return '仍有有效隔離，請先解除隔離。'
    if (alert.ggapNotificationStatus === 'failed') return 'GGAP 通知失敗，請先重送並取得結果。'
    if (alert.mitigationStatus === 'pending') return '必要自動處理仍在執行中，請等待完成。'
    return ''
})
const canClose = computed(() => Boolean(selectedAlert.value && !closeBlockReason.value))
const canReopen = computed(() => Boolean(selectedAlert.value && ['closed', 'false_positive'].includes(selectedAlert.value.status)))
const actionSubmitDisabled = computed(() => {
    if (!pendingAction.value || actionBusy.value) return true
    if (actionNeedsReason(pendingAction.value) && !actionNote.value.trim()) return true
    if (pendingAction.value === 'assign' && !actionAssignee.value) return true
    if (pendingAction.value === 'maintain-isolation' && !actionReviewDueAt.value) return true
    if (pendingAction.value === 'release-isolation' && !canReleaseIsolation.value) return true
    if (pendingAction.value === 'false-positive' && !canFalsePositive.value) return true
    if (pendingAction.value === 'close' && !canClose.value) return true
    return false
})

function actionDisabledReason(action: ActionType) {
    if (action === 'takeover' && !canTakeover.value) return '已有負責人或告警已結束。'
    if (action === 'assign' && !canAssign.value) return '已結案或誤報的告警不可再指派。'
    if (action === 'mitigate' && !canMitigate.value) return '目前狀態已是已緩解或不可操作。'
    if (action === 'maintain-isolation' && !canMaintainIsolation.value) return '目前沒有有效隔離可供維持。'
    if (action === 'release-isolation' && !canReleaseIsolation.value) return selectedAlert.value?.healthCheck.status === 'passed' ? '目前沒有有效隔離。' : '最新健康檢查尚未通過。'
    if (action === 'retry-mitigation' && !canRetryMitigation.value) return '目前沒有自動處理失敗。'
    if (action === 'resend-ggap' && !canResendGgap.value) return '目前沒有 GGAP 通知失敗。'
    if (action === 'false-positive' && !canFalsePositive.value) return selectedAlert.value?.isolationStatus === 'isolated' ? '標記誤報前必須先解除隔離。' : '已結束的告警不可標記誤報。'
    if (action === 'close' && !canClose.value) return closeBlockReason.value
    if (action === 'reopen' && !canReopen.value) return '只有已結案或誤報的告警可以重新開啟。'
    return ''
}

function openAction(action: ActionType) {
    if (!selectedAlert.value || actionBusy.value || actionDisabledReason(action)) return
    pendingAction.value = action
    actionVisible.value = true
    actionError.value = ''
    actionNote.value = ''
    actionAssignee.value = selectedAlert.value.assignee
    actionReviewDueAt.value = selectedAlert.value.reviewDueAt ? new Date(selectedAlert.value.reviewDueAt) : hoursFromNow(2)
}

function addTimeline(alert: AlertRecord, label: string, description: string, tone: TimelineItem['tone']) {
    alert.timeline.push({ time: new Date(), label, description, tone, actor: currentUser })
    alert.updatedAt = new Date()
}

function executeAction() {
    const alert = selectedAlert.value
    const action = pendingAction.value
    if (!alert || !action || actionSubmitDisabled.value) {
        actionError.value = '請完成必要欄位後再送出。'
        return
    }
    actionBusy.value = true
    actionError.value = ''
    window.setTimeout(() => {
        if (action === 'takeover') {
            alert.assignee = currentUser
            if (alert.status === 'pending') alert.status = 'investigating'
            addTimeline(alert, '人工接手', actionNote.value.trim() || `${currentUser} 接手此告警。`, 'warning')
        } else if (action === 'assign' && actionAssignee.value) {
            alert.assignee = actionAssignee.value
            addTimeline(alert, '指派負責人', `${currentUser} 將告警指派給 ${actionAssignee.value}。${actionNote.value.trim() ? ` 備註：${actionNote.value.trim()}` : ''}`, 'neutral')
        } else if (action === 'note') {
            addTimeline(alert, '新增處理備註', actionNote.value.trim(), 'neutral')
        } else if (action === 'mitigate') {
            alert.status = 'mitigated'
            alert.isOngoing = false
            addTimeline(alert, '標記已緩解', actionNote.value.trim(), 'success')
        } else if (action === 'maintain-isolation') {
            alert.isolationStatus = 'isolated'
            alert.reviewDueAt = actionReviewDueAt.value ? new Date(actionReviewDueAt.value) : alert.reviewDueAt
            addTimeline(alert, '維持隔離', `${actionNote.value.trim()}；下次覆核 ${formatDateTime(alert.reviewDueAt)}。`, 'warning')
        } else if (action === 'release-isolation') {
            alert.isolationStatus = 'released'
            alert.mitigationStatus = 'released'
            alert.ggapNotificationStatus = 'sent'
            alert.isOngoing = false
            addTimeline(alert, '解除隔離', `${actionNote.value.trim()}；健康檢查：${alert.healthCheck.summary}`, 'success')
        } else if (action === 'retry-mitigation') {
            alert.mitigationStatus = 'applied'
            alert.mitigationFailureReason = '—'
            alert.mitigationCompletedAt = new Date()
            if (alert.mitigationAction.includes('Launch')) {
                alert.isolationStatus = 'isolated'
                alert.isolatedAt = new Date()
            }
            addTimeline(alert, '重試自動處理', actionNote.value.trim(), 'success')
        } else if (action === 'resend-ggap') {
            alert.ggapNotificationStatus = 'acknowledged'
            alert.ggapRetryCount += 1
            alert.ggapAckAt = new Date()
            addTimeline(alert, '重送 GGAP 通知', `${actionNote.value.trim()}；原型 ACK 已回覆。`, 'success')
        } else if (action === 'false-positive') {
            alert.status = 'false_positive'
            alert.isOngoing = false
            addTimeline(alert, '標記誤報', actionNote.value.trim(), 'neutral')
        } else if (action === 'close') {
            alert.status = 'closed'
            alert.isOngoing = false
            addTimeline(alert, '告警已結案', actionNote.value.trim(), 'success')
        } else if (action === 'reopen') {
            alert.status = 'investigating'
            addTimeline(alert, '重新開啟 Alert', actionNote.value.trim(), 'warning')
        }
        actionBusy.value = false
        actionVisible.value = false
        pendingAction.value = null
        toast.add({ severity: 'success', summary: '原型狀態已更新', detail: '已更新前端模擬狀態與處理時間線；未修改正式資料。', life: 4200 })
    }, 320)
}

function closeActionDialog() {
    if (actionBusy.value) return
    actionVisible.value = false
    pendingAction.value = null
    actionError.value = ''
}

onMounted(() => {
    window.setTimeout(() => { loading.value = false }, 320)
    openQueryTarget()
})

watch(() => [route.query.alert_id, route.query.risk_event_id], openQueryTarget)
</script>

<template>
    <div class="risk-alerts-page page-stack">
        <div v-if="queryError" class="risk-alerts-state risk-alerts-state--error" role="alert"><i class="pi pi-exclamation-circle" /><div><strong>{{ queryError }}</strong><p>目前未開啟任何告警詳情，請從工作佇列選擇有效資料。</p></div><Button label="清除提示" icon="pi pi-times" severity="secondary" outlined @click="queryError = ''" /></div>

        <section class="risk-alert-summary-grid" aria-label="風控告警摘要">
            <button v-for="card in summaryCards" :key="card.key" type="button" class="risk-alert-summary-card" :class="[`risk-alert-summary-card--${card.tone}`, { active: appliedFilters.shortcut === card.key }]" :aria-pressed="appliedFilters.shortcut === card.key" @click="chooseShortcut(card.key)">
                <span class="risk-alert-summary-heading"><span><i :class="card.icon" />{{ card.label }}</span><i v-tooltip.top="card.tip" class="pi pi-info-circle risk-alert-info" /></span>
                <strong>{{ formatNumber(card.value) }}</strong>
                <small>{{ environmentLabels[appliedFilters.environment] }} · 未結案／非誤報</small>
            </button>
        </section>

        <section class="risk-alert-filter-card" aria-label="告警查詢條件">
            <div class="risk-alert-section-heading"><div><span class="risk-alert-eyebrow">工作佇列篩選</span><h2>查詢條件</h2></div><span class="risk-alert-scope-meta"><i class="pi pi-clock" />{{ timezoneLabel }} · 不使用快速時間範圍</span></div>
            <div class="risk-alert-filter-grid risk-alert-filter-grid--common">
                <div class="field"><label for="alert-status">告警狀態</label><Select id="alert-status" v-model="draftFilters.status" :options="statusOptions" option-label="label" option-value="value" fluid @change="draftFilters.shortcut = ''" /></div>
                <div class="field"><label for="alert-severity">嚴重度</label><Select id="alert-severity" v-model="draftFilters.severity" :options="severityOptions" option-label="label" option-value="value" fluid @change="draftFilters.shortcut = ''" /></div>
                <div class="field"><span class="risk-alert-field-label">環境</span><div class="risk-alert-radio-group" role="radiogroup" aria-label="環境"><label><RadioButton v-model="draftFilters.environment" name="alert-environment" value="production" @change="applyFilters" />{{ environmentOptionLabels.production }}</label><label><RadioButton v-model="draftFilters.environment" name="alert-environment" value="demo" @change="applyFilters" />{{ environmentOptionLabels.demo }}</label></div></div>
                <div class="field"><label for="alert-game">遊戲</label><Select id="alert-game" v-model="draftFilters.game" :options="gameOptions" option-label="label" option-value="value" fluid @change="draftFilters.shortcut = ''" /></div>
                <div class="field"><label for="alert-anomaly">異常類型</label><Select id="alert-anomaly" v-model="draftFilters.anomalyType" :options="anomalyOptions" option-label="label" option-value="value" fluid @change="draftFilters.shortcut = ''" /></div>
                <div class="field"><label for="alert-assignee">負責人</label><Select id="alert-assignee" v-model="draftFilters.assignee" :options="assigneeOptions" option-label="label" option-value="value" fluid @change="draftFilters.shortcut = ''" /></div>
                <div class="field"><label for="alert-overdue">是否逾期</label><Select id="alert-overdue" v-model="draftFilters.overdue" :options="overdueOptions" option-label="label" option-value="value" fluid @change="draftFilters.shortcut = ''" /></div>
            </div>
            <div class="risk-alert-filter-footer"><button type="button" class="risk-alert-advanced-toggle" :aria-expanded="advancedVisible" @click="advancedVisible = !advancedVisible"><i :class="advancedVisible ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" />{{ advancedVisible ? '收合進階條件' : '顯示進階條件' }}</button><div class="risk-alert-filter-actions"><Button label="查詢" icon="pi pi-search" data-testid="risk-alert-apply-filters" @click="applyFilters" /><Button label="重置" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" /></div></div>
            <div v-if="advancedVisible" class="risk-alert-filter-grid risk-alert-filter-grid--advanced">
                <div class="field"><label for="alert-id">告警 ID <small>精確</small></label><InputText id="alert-id" v-model="draftFilters.alertId" placeholder="輸入完整 alt_..." fluid @keyup.enter="applyFilters" /></div>
                <div class="field"><label for="alert-risk-event-id">風控事件 ID <small>精確</small></label><InputText id="alert-risk-event-id" v-model="draftFilters.riskEventId" placeholder="輸入完整 rsk_..." fluid @keyup.enter="applyFilters" /></div>
                <div class="field"><label for="alert-source">異常來源</label><Select id="alert-source" v-model="draftFilters.source" :options="sourceOptions" option-label="label" option-value="value" fluid /></div>
                <div class="field"><label for="alert-game-version">遊戲版本</label><Select id="alert-game-version" v-model="draftFilters.gameVersion" :options="gameVersionOptions" option-label="label" option-value="value" fluid /></div>
                <div class="field"><label for="alert-mitigation">自動緩解狀態</label><Select id="alert-mitigation" v-model="draftFilters.mitigationStatus" :options="mitigationOptions" option-label="label" option-value="value" fluid /></div>
                <div class="field"><label for="alert-isolation">隔離狀態</label><Select id="alert-isolation" v-model="draftFilters.isolationStatus" :options="isolationOptions" option-label="label" option-value="value" fluid /></div>
                <div class="field"><label for="alert-ggap-status">GGAP 通知狀態</label><Select id="alert-ggap-status" v-model="draftFilters.ggapNotificationStatus" :options="notificationOptions" option-label="label" option-value="value" fluid /></div>
                <div class="field"><label for="alert-provider-round">遊戲商遊戲局 ID <small>精確</small></label><InputText id="alert-provider-round" v-model="draftFilters.providerGameRoundId" placeholder="輸入完整 Round ID" fluid @keyup.enter="applyFilters" /></div>
                <div class="field"><label for="alert-ggap-round">GGAP 遊戲局 ID <small>精確</small></label><InputText id="alert-ggap-round" v-model="draftFilters.ggapRoundId" placeholder="輸入完整 Round ID" fluid @keyup.enter="applyFilters" /></div>
                <div class="field field-span-2"><label for="alert-created-range">告警建立時間區間</label><DateTimeRangeField id="alert-created-range" :model-value="draftFilters.createdRange" @update:model-value="draftFilters.createdRange = $event" /></div>
            </div>
            <div v-if="appliedShortcutLabel" class="risk-alert-applied-shortcut"><i class="pi pi-filter-fill" /><span>快捷篩選：{{ appliedShortcutLabel }}</span><button type="button" @click="chooseShortcut(appliedFilters.shortcut)">清除快捷篩選</button></div>
        </section>

        <section class="risk-alert-queue-section" aria-labelledby="risk-alert-queue-title">
            <div class="risk-alert-section-heading risk-alert-queue-heading"><div><span class="risk-alert-eyebrow">告警工作佇列</span><h2 id="risk-alert-queue-title">告警工作佇列</h2><p>{{ tableDescription }}</p></div><div class="risk-alert-list-actions"><span><i class="pi pi-database" />{{ formatNumber(matchingRows.length) }} 筆</span><Button label="匯出完整結果" icon="pi pi-download" severity="secondary" outlined :disabled="!matchingRows.length || loading" @click="openExport" /></div></div>
            <div v-if="exportNotice" class="risk-alerts-state risk-alerts-state--info" role="status"><i class="pi pi-info-circle" /><span>{{ exportNotice }}</span></div>
            <div v-if="loadError" class="risk-alerts-state risk-alerts-state--error" role="alert"><i class="pi pi-exclamation-circle" /><div><strong>{{ loadError }}</strong><p>請修正條件後重新查詢。</p></div><Button label="重置條件" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" /></div>
            <div v-else-if="loading" class="risk-alerts-state"><i class="pi pi-spin pi-spinner" /><div><strong>正在載入告警佇列</strong><p>正在套用環境、狀態與快捷條件。</p></div></div>
            <div v-else-if="!matchingRows.length" class="risk-alerts-state"><i class="pi pi-inbox" /><div><strong>目前沒有符合條件的告警</strong><p>目前查詢範圍沒有有效告警；可保留條件或重置篩選。</p></div><Button label="重置條件" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" /></div>
            <div v-else class="risk-alert-table-shell">
                <div class="risk-alert-table-scroll" tabindex="0" aria-label="告警工作佇列表格，可水平捲動"><table class="risk-alert-table"><thead><tr><th>嚴重度</th><th>告警 ID</th><th>風控事件 ID</th><th>建立時間</th><th>環境</th><th>遊戲名稱</th><th>遊戲版本</th><th>異常類型</th><th>受影響遊戲回合數</th><th>告警狀態</th><th>負責人</th><th>自動緩解狀態</th><th>隔離狀態</th><th>GGAP 通知狀態</th><th>覆核期限</th><th>操作</th></tr></thead><tbody><tr v-for="alert in pagedRows" :key="alert.alertId"><td><span class="risk-alert-pill" :class="severityClass(alert.severity)">{{ severityLabels[alert.severity] }}</span></td><td><code>{{ alert.alertId }}</code></td><td><code>{{ alert.riskEventId }}</code></td><td class="risk-alert-time">{{ formatDateTime(alert.createdAt) }}</td><td><span class="risk-alert-environment"><i class="pi pi-circle-fill" />{{ environmentLabels[alert.environment] }}</span></td><td><div class="risk-alert-game"><strong>{{ alert.gameName }}</strong><small>{{ alert.gameId }}</small></div></td><td>{{ alert.gameVersion }}</td><td><strong>{{ anomalyLabels[alert.anomalyType] }}</strong><small class="risk-alert-subline">{{ sourceLabels[alert.source] }}</small></td><td class="risk-alert-number">{{ formatNumber(alert.affectedRounds) }}</td><td><span class="risk-alert-pill" :class="statusClass(alert.status)">{{ statusLabels[alert.status] }}</span></td><td>{{ alert.assignee ?? '未指派' }}</td><td><span class="risk-alert-pill" :class="mitigationClass(alert.mitigationStatus)">{{ mitigationLabels[alert.mitigationStatus] }}</span></td><td><span class="risk-alert-pill" :class="isolationClass(alert.isolationStatus)">{{ isolationLabels[alert.isolationStatus] }}</span></td><td><span class="risk-alert-pill" :class="notificationClass(alert.ggapNotificationStatus)">{{ notificationLabels[alert.ggapNotificationStatus] }}</span></td><td><span :class="{ 'risk-alert-overdue': isOverdue(alert) }">{{ formatShortDate(alert.reviewDueAt) }}<small v-if="isOverdue(alert)" class="risk-alert-subline">已逾期</small></span></td><td><Button label="查看／處理" icon="pi pi-arrow-up-right" text severity="danger" @click="openDetails(alert)" /></td></tr></tbody></table></div>
                <div class="risk-alert-pagination"><span>第 {{ currentPage }} / {{ totalPages }} 頁 · {{ formatNumber(matchingRows.length) }} 筆</span><div><Button icon="pi pi-angle-double-left" text rounded severity="secondary" aria-label="第一頁" :disabled="first === 0" @click="handlePage({ first: 0 })" /><Button icon="pi pi-angle-left" text rounded severity="secondary" aria-label="上一頁" :disabled="first === 0" @click="handlePage({ first: Math.max(0, first - rowsPerPage) })" /><Button icon="pi pi-angle-right" text rounded severity="secondary" aria-label="下一頁" :disabled="currentPage >= totalPages" @click="handlePage({ first: Math.min((totalPages - 1) * rowsPerPage, first + rowsPerPage) })" /><Button icon="pi pi-angle-double-right" text rounded severity="secondary" aria-label="最後一頁" :disabled="currentPage >= totalPages" @click="handlePage({ first: (totalPages - 1) * rowsPerPage })" /></div><Select v-model="rowsPerPage" :options="[8, 16, 32]" aria-label="每頁筆數" @change="first = 0" /></div>
            </div>
        </section>

        <Dialog v-model:visible="exportVisible" modal dismissable-mask header="匯出告警工作佇列" class="risk-alert-export-dialog" :style="{ width: 'min(560px, calc(100vw - 24px))' }"><div class="risk-alert-dialog-body"><div class="risk-alert-dialog-intro"><i class="pi pi-file-export" /><div><strong>匯出完整篩選結果</strong><p>{{ environmentLabels[appliedFilters.environment] }} · {{ formatNumber(matchingRows.length) }} 筆，不受目前分頁限制。</p></div></div><div class="risk-alert-format"><span>檔案格式</span><label><RadioButton v-model="exportFormat" name="alert-export-format" value="csv" />CSV</label><label><RadioButton v-model="exportFormat" name="alert-export-format" value="xlsx" />XLSX</label></div><div class="risk-alert-mock-note"><i class="pi pi-info-circle" /><span>原型／模擬資料：目前只呈現完整匯出入口，不產生或傳送正式檔案。</span></div></div><template #footer><Button label="取消" severity="secondary" text @click="exportVisible = false" /><Button label="確認匯出" icon="pi pi-download" @click="runMockExport" /></template></Dialog>

        <Dialog v-model:visible="detailVisible" modal dismissable-mask class="risk-alert-detail-dialog" :style="{ width: 'min(1240px, calc(100vw - 24px))' }" :header="selectedAlert ? `${selectedAlert.alertId} / 告警詳情與處理` : '告警詳情與處理'"><div v-if="selectedAlert" class="risk-alert-detail-content">
            <div class="risk-alert-detail-hero"><div><span class="risk-alert-eyebrow">Provider 風控告警</span><h2>{{ selectedAlert.gameName }}</h2><p>{{ anomalyLabels[selectedAlert.anomalyType] }} · {{ selectedAlert.gameVersion }} · {{ environmentLabels[selectedAlert.environment] }}</p></div><div class="risk-alert-detail-badges"><span class="risk-alert-pill" :class="severityClass(selectedAlert.severity)">{{ severityLabels[selectedAlert.severity] }}</span><span class="risk-alert-pill" :class="statusClass(selectedAlert.status)">{{ statusLabels[selectedAlert.status] }}</span><span class="risk-alert-state-chip"><i class="pi pi-wrench" />可操作模擬</span></div></div>

            <section class="risk-alert-detail-section"><div class="risk-alert-detail-title"><i class="pi pi-file" /><h3>告警摘要</h3></div><div class="risk-alert-fact-grid"><div><span>告警 ID</span><code>{{ selectedAlert.alertId }}</code></div><div><span>風控事件 ID</span><code>{{ selectedAlert.riskEventId }}</code></div><div><span>建立時間</span><strong>{{ formatDateTime(selectedAlert.createdAt) }}</strong></div><div><span>環境／遊戲版本</span><strong>{{ environmentLabels[selectedAlert.environment] }} · {{ selectedAlert.gameVersion }}</strong></div><div><span>負責人</span><strong>{{ selectedAlert.assignee ?? '未指派' }}</strong></div><div><span>覆核期限</span><strong :class="{ 'risk-alert-overdue': isOverdue(selectedAlert) }">{{ formatDateTime(selectedAlert.reviewDueAt) }}{{ isOverdue(selectedAlert) ? ' · 已逾期' : '' }}</strong></div><div><span>告警狀態</span><span class="risk-alert-pill" :class="statusClass(selectedAlert.status)">{{ statusLabels[selectedAlert.status] }}</span></div><div><span>自動緩解狀態</span><span class="risk-alert-pill" :class="mitigationClass(selectedAlert.mitigationStatus)">{{ mitigationLabels[selectedAlert.mitigationStatus] }}</span></div><div><span>隔離狀態</span><span class="risk-alert-pill" :class="isolationClass(selectedAlert.isolationStatus)">{{ isolationLabels[selectedAlert.isolationStatus] }}</span></div></div></section>

            <div class="risk-alert-detail-two-column"><section class="risk-alert-detail-section"><div class="risk-alert-detail-title"><i class="pi pi-globe" /><h3>目前影響</h3></div><div class="risk-alert-fact-list"><div><span>受影響遊戲回合</span><strong>{{ formatNumber(selectedAlert.affectedRounds) }} 筆 · {{ selectedAlert.isOngoing ? '仍持續發生' : '目前未持續' }}</strong></div><div><span>首次／最後發生</span><strong>{{ formatDateTime(selectedAlert.firstSeenAt) }}<br>{{ formatDateTime(selectedAlert.lastOccurredAt) }}</strong></div><div><span>新遊戲啟動</span><strong>{{ selectedAlert.isolationStatus === 'isolated' ? '指定範圍阻擋中' : '未由此告警阻擋' }}</strong></div><div><span>既有遊戲回合</span><strong>結算／回呼依既有流程持續</strong></div><div><span>隔離範圍</span><strong>{{ selectedAlert.isolationStatus === 'isolated' ? translateMockText(selectedAlert.mitigationScope) : '—' }}</strong></div></div></section><section class="risk-alert-detail-section"><div class="risk-alert-detail-title"><i class="pi pi-sliders-h" /><h3>判斷依據</h3></div><div class="risk-alert-fact-list"><div><span>異常來源／類型</span><strong>{{ sourceLabels[selectedAlert.source] }} · {{ anomalyLabels[selectedAlert.anomalyType] }}</strong></div><div><span>規則 ID／版本</span><code>{{ selectedAlert.ruleId }} · {{ selectedAlert.ruleVersion }}</code></div><div><span>門檻／實際數值</span><strong>{{ translateMockText(selectedAlert.threshold) }}<br>{{ translateMockText(selectedAlert.actualValue) }}</strong></div><div><span>統計窗口</span><strong>{{ translateMockText(selectedAlert.statisticWindow) }}</strong></div><div><span>錯誤碼</span><code>{{ selectedAlert.errorCode }}</code></div></div></section></div>

            <section class="risk-alert-detail-section"><div class="risk-alert-detail-title"><i class="pi pi-code" /><h3>請求／回應摘要</h3></div><div class="risk-alert-code-grid"><div><span>請求</span><code>{{ translateMockText(selectedAlert.requestSummary) }}</code></div><div><span>回應</span><code>{{ translateMockText(selectedAlert.responseSummary) }}</code></div><div class="risk-alert-wide"><span>錯誤訊息</span><code>{{ translateMockText(selectedAlert.errorMessage) }}</code></div></div><div class="risk-alert-entry-links"><Button label="查看風控事件詳情" icon="pi pi-arrow-up-right" text severity="secondary" @click="goToRiskEvent(selectedAlert)" /><Button label="查看請求紀錄" icon="pi pi-list" text severity="secondary" @click="goToRequestLogs(selectedAlert)" /></div></section>

            <div class="risk-alert-detail-two-column"><section class="risk-alert-detail-section"><div class="risk-alert-detail-title"><i class="pi pi-bolt" /><h3>自動緩解結果</h3></div><div class="risk-alert-fact-list"><div><span>執行動作</span><strong>{{ translateMockText(selectedAlert.mitigationAction) }}</strong></div><div><span>目前狀態</span><span class="risk-alert-pill" :class="mitigationClass(selectedAlert.mitigationStatus)">{{ mitigationLabels[selectedAlert.mitigationStatus] }}</span></div><div><span>開始／完成</span><strong>{{ formatDateTime(selectedAlert.mitigationStartedAt) }} / {{ formatDateTime(selectedAlert.mitigationCompletedAt) }}</strong></div><div><span>作用範圍</span><strong>{{ translateMockText(selectedAlert.mitigationScope) }}</strong></div><div><span>失敗原因</span><strong>{{ translateMockText(selectedAlert.mitigationFailureReason) }}</strong></div></div></section><section class="risk-alert-detail-section"><div class="risk-alert-detail-title"><i class="pi pi-send" /><h3>GGAP 通知</h3></div><div class="risk-alert-fact-list"><div><span>通知狀態</span><span class="risk-alert-pill" :class="notificationClass(selectedAlert.ggapNotificationStatus)">{{ notificationLabels[selectedAlert.ggapNotificationStatus] }}</span></div><div><span>provider_event_id</span><code>{{ selectedAlert.ggapProviderEventId }}</code></div><div><span>送出／確認（ACK）</span><strong>{{ formatDateTime(selectedAlert.ggapSentAt) }} / {{ formatDateTime(selectedAlert.ggapAckAt) }}</strong></div><div><span>重試次數</span><strong>{{ selectedAlert.ggapRetryCount }} 次</strong></div></div></section></div>

            <section class="risk-alert-detail-section"><div class="risk-alert-detail-title"><i class="pi pi-heart" /><h3>最新健康檢查</h3><span class="risk-alert-health" :class="healthClass(selectedAlert.healthCheck.status)">{{ selectedAlert.healthCheck.status === 'passed' ? '已通過' : selectedAlert.healthCheck.status === 'warning' ? '部分通過' : '未通過' }}</span></div><div class="risk-alert-health-summary"><strong>{{ translateMockText(selectedAlert.healthCheck.summary) }}</strong><span>檢查時間 {{ formatDateTime(selectedAlert.healthCheck.checkedAt) }}</span></div><ul class="risk-alert-check-list"><li v-for="check in selectedAlert.healthCheck.checks" :key="check"><i class="pi pi-circle-fill" />{{ translateMockText(check) }}</li></ul></section>

            <section class="risk-alert-detail-section"><div class="risk-alert-detail-title"><i class="pi pi-directions-alt" /><h3>關聯遊戲回合</h3><span class="risk-alert-section-note">{{ formatNumber(selectedAlert.relatedRounds.length) }} 筆代表資料</span></div><div class="risk-alert-round-table-wrap"><table class="risk-alert-round-table"><thead><tr><th>遊戲商遊戲局 ID</th><th>GGAP 遊戲局 ID</th><th>結算狀態</th><th>發生時間</th><th>入口</th></tr></thead><tbody><tr v-for="round in selectedAlert.relatedRounds" :key="round.providerId"><td><code>{{ round.providerId }}</code></td><td><code>{{ round.ggapId }}</code></td><td>{{ translateMockText(round.settleStatus) }}</td><td>{{ formatDateTime(round.occurredAt) }}</td><td><Button label="遊戲紀錄" icon="pi pi-arrow-up-right" text severity="secondary" @click="goToRound(round)" /></td></tr></tbody></table></div></section>

            <section class="risk-alert-detail-section"><div class="risk-alert-detail-title"><i class="pi pi-list" /><h3>請求紀錄</h3><span class="risk-alert-section-note">敏感內容已遮罩</span></div><div class="risk-alert-request-list"><div v-for="request in selectedAlert.requestLogs" :key="request.id"><time>{{ formatDateTime(request.time) }}</time><strong>{{ translateMockText(request.type) }}</strong><span>{{ translateMockText(request.status) }}</span><p>{{ translateMockText(request.summary) }}</p></div></div></section>

            <section class="risk-alert-detail-section"><div class="risk-alert-detail-title"><i class="pi pi-history" /><h3>完整處理時間線</h3></div><ol class="risk-alert-timeline"><li v-for="item in selectedAlert.timeline" :key="`${item.label}-${item.time.toISOString()}`" :class="`risk-alert-timeline--${item.tone}`"><span class="risk-alert-timeline-dot" /><div><time>{{ formatDateTime(item.time) }} · {{ item.actor ?? '系統' }}</time><strong>{{ translateMockText(item.label) }}</strong><p>{{ translateMockText(item.description) }}</p></div></li></ol></section>
        </div><template #footer><div v-if="selectedAlert" class="risk-alert-detail-footer"><div class="risk-alert-detail-footer-note"><i class="pi pi-info-circle" />前端原型操作只更新模擬狀態與時間線，不會隔離遊戲、通知 GGAP、修改遊戲回合或正式資料。</div><div class="risk-alert-action-grid"><Button label="接手處理" icon="pi pi-user-plus" outlined :disabled="!canTakeover || actionBusy" :title="actionDisabledReason('takeover')" @click="openAction('takeover')" /><Button label="指派／改派" icon="pi pi-users" outlined :disabled="!canAssign || actionBusy" :title="actionDisabledReason('assign')" @click="openAction('assign')" /><Button label="新增備註" icon="pi pi-comment" outlined :disabled="actionBusy" @click="openAction('note')" /><Button label="標記已緩解" icon="pi pi-check" outlined :disabled="!canMitigate || actionBusy" :title="actionDisabledReason('mitigate')" @click="openAction('mitigate')" /><Button label="維持隔離" icon="pi pi-lock" outlined :disabled="!canMaintainIsolation || actionBusy" :title="actionDisabledReason('maintain-isolation')" @click="openAction('maintain-isolation')" /><Button label="解除隔離" icon="pi pi-lock-open" outlined :disabled="!canReleaseIsolation || actionBusy" :title="actionDisabledReason('release-isolation')" @click="openAction('release-isolation')" /><Button label="重試自動處理" icon="pi pi-refresh" outlined :disabled="!canRetryMitigation || actionBusy" :title="actionDisabledReason('retry-mitigation')" @click="openAction('retry-mitigation')" /><Button label="重送 GGAP 通知" icon="pi pi-send" outlined :disabled="!canResendGgap || actionBusy" :title="actionDisabledReason('resend-ggap')" @click="openAction('resend-ggap')" /><Button label="標記誤報" icon="pi pi-flag" outlined severity="secondary" :disabled="!canFalsePositive || actionBusy" :title="actionDisabledReason('false-positive')" @click="openAction('false-positive')" /><Button label="結案" icon="pi pi-check-circle" outlined severity="success" :disabled="!canClose || actionBusy" :title="actionDisabledReason('close')" @click="openAction('close')" /><Button label="重新開啟" icon="pi pi-replay" outlined severity="danger" :disabled="!canReopen || actionBusy" :title="actionDisabledReason('reopen')" @click="openAction('reopen')" /></div></div></template></Dialog>

        <Dialog v-model:visible="actionVisible" modal dismissable-mask :header="pendingAction ? actionTitles[pendingAction] : '確認處理'" class="risk-alert-action-dialog" :style="{ width: 'min(620px, calc(100vw - 24px))' }" @hide="closeActionDialog"><div v-if="selectedAlert && pendingAction" class="risk-alert-dialog-body"><div class="risk-alert-mock-note risk-alert-mock-note--strong"><i class="pi pi-info-circle" /><span>原型操作：只更新前端模擬狀態與處理時間線，未呼叫正式 API。</span></div><div class="risk-alert-action-context"><strong>{{ selectedAlert.alertId }}</strong><span>{{ selectedAlert.gameName }} · {{ statusLabels[selectedAlert.status] }} · 緩解 {{ mitigationLabels[selectedAlert.mitigationStatus] }}</span></div><div v-if="pendingAction === 'release-isolation'" class="risk-alert-health-check"><strong>解除隔離前最新健康檢查</strong><span :class="healthClass(selectedAlert.healthCheck.status)">{{ translateMockText(selectedAlert.healthCheck.summary) }}</span><small>{{ formatDateTime(selectedAlert.healthCheck.checkedAt) }}</small></div><div v-if="pendingAction === 'assign'" class="field"><label for="action-assignee">負責人 <small>必要</small></label><Select id="action-assignee" v-model="actionAssignee" :options="assigneePeopleOptions" option-label="label" option-value="value" fluid /></div><div v-if="pendingAction === 'maintain-isolation'" class="field"><label for="action-review-due">下次覆核時間 <small>必要</small></label><DatePicker id="action-review-due" v-model="actionReviewDueAt" show-icon show-time hour-format="24" placeholder="選擇覆核時間" fluid /></div><div class="field"><label for="action-note">{{ actionNeedsReason(pendingAction) ? '處理原因' : '補充備註' }} <small v-if="actionNeedsReason(pendingAction)">必要</small></label><Textarea id="action-note" v-model="actionNote" rows="4" auto-resize :placeholder="actionNeedsReason(pendingAction) ? '請輸入此次處理的原因，會寫入時間線。' : '可補充交接脈絡或處理說明。'" fluid @keyup.ctrl.enter="executeAction" /></div><p v-if="actionError" class="risk-alert-action-error" role="alert"><i class="pi pi-exclamation-circle" />{{ actionError }}</p><p v-if="pendingAction === 'close' && closeBlockReason" class="risk-alert-action-error" role="alert"><i class="pi pi-ban" />{{ closeBlockReason }}</p><p v-if="pendingAction === 'false-positive' && !canFalsePositive" class="risk-alert-action-error" role="alert"><i class="pi pi-ban" />{{ actionDisabledReason('false-positive') }}</p></div><template #footer><Button label="取消" severity="secondary" text :disabled="actionBusy" @click="closeActionDialog" /><Button :label="pendingAction ? actionLabels[pendingAction] : '確認'" icon="pi pi-check" :loading="actionBusy" :disabled="actionSubmitDisabled" @click="executeAction" /></template></Dialog>
    </div>
</template>

<style scoped>
.risk-alerts-page { width: 100%; min-width: 0; padding-bottom: 2.75rem; overflow-x: hidden; --risk-alert-ink: #253b42; --risk-alert-muted: #6d8083; --risk-alert-line: #dce9e4; --risk-alert-soft: #f4faf7; --risk-alert-teal: #197a73; --risk-alert-blue: #557aa7; --risk-alert-amber: #bd7a2c; --risk-alert-red: #bd514d; --risk-alert-green: #3a8865; }
.risk-alert-section-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }.risk-alert-section-heading h2 { margin: .25rem 0 .2rem; color: var(--risk-alert-ink); font-size: 1.16rem; letter-spacing: -.02em; }.risk-alert-section-heading p { margin: 0; color: var(--risk-alert-muted); font-size: .75rem; line-height: 1.5; }.risk-alert-eyebrow { display: block; color: var(--risk-alert-teal); font-size: .62rem; font-weight: 800; letter-spacing: .16em; }.risk-alert-scope-meta { display: inline-flex; align-items: center; gap: .4rem; color: var(--risk-alert-muted); font-size: .72rem; }
.risk-alert-summary-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: .8rem; }.risk-alert-summary-card { position: relative; min-width: 0; overflow: hidden; padding: 1rem 1.05rem 1.05rem; border: 1px solid var(--risk-alert-line); border-top: 2px solid var(--risk-alert-blue); border-radius: 1rem; color: inherit; text-align: left; background: #fff; box-shadow: 0 .55rem 1.5rem rgba(37, 87, 82, .045); cursor: pointer; transition: border-color 160ms ease, transform 160ms ease, box-shadow 160ms ease; }.risk-alert-summary-card::after { position: absolute; right: -1.2rem; bottom: -2rem; width: 5.3rem; height: 5.3rem; border: 1px solid rgba(20, 124, 120, .1); border-radius: 50%; content: ''; }.risk-alert-summary-card:hover, .risk-alert-summary-card.active { transform: translateY(-2px); border-color: var(--risk-alert-teal); box-shadow: 0 .75rem 1.7rem rgba(25, 122, 115, .13); }.risk-alert-summary-card--amber { border-top-color: var(--risk-alert-amber); }.risk-alert-summary-card--red { border-top-color: var(--risk-alert-red); }.risk-alert-summary-card--green { border-top-color: var(--risk-alert-green); }.risk-alert-summary-heading { position: relative; z-index: 1; display: flex; justify-content: space-between; gap: .45rem; align-items: center; color: var(--risk-alert-muted); font-size: .73rem; font-weight: 800; }.risk-alert-summary-heading > span { display: inline-flex; align-items: center; gap: .4rem; white-space: nowrap; }.risk-alert-summary-heading > span i { color: var(--risk-alert-teal); }.risk-alert-info { color: var(--risk-alert-muted); cursor: help; }.risk-alert-summary-card strong { position: relative; z-index: 1; display: block; margin-top: .65rem; color: var(--risk-alert-ink); font-size: 1.7rem; line-height: 1; font-variant-numeric: tabular-nums; }.risk-alert-summary-card small { position: relative; z-index: 1; display: block; margin-top: .55rem; overflow: hidden; color: var(--risk-alert-muted); font-size: .68rem; text-overflow: ellipsis; white-space: nowrap; }
.risk-alert-filter-card { padding: 1.15rem 1.25rem; border: 1px solid var(--risk-alert-line); border-radius: 1rem; background: linear-gradient(110deg, #f8fcfa 0%, #fff 52%, #f4faf8 100%); box-shadow: 0 .55rem 1.5rem rgba(37, 87, 82, .055); }.risk-alert-filter-grid { display: grid; gap: .8rem; margin-top: 1rem; }.risk-alert-filter-grid--common { grid-template-columns: repeat(4, minmax(0, 1fr)); }.risk-alert-filter-grid--advanced { grid-template-columns: repeat(4, minmax(0, 1fr)); margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--risk-alert-line); }.risk-alert-filter-grid .field { display: grid; gap: .35rem; min-width: 0; }.risk-alert-filter-grid label, .risk-alert-field-label { color: var(--risk-alert-muted); font-size: .74rem; font-weight: 700; }.risk-alert-filter-grid label small { margin-left: .2rem; color: var(--risk-alert-teal); font-size: .62rem; font-weight: 800; }.risk-alert-radio-group { display: flex; flex-wrap: wrap; align-items: center; gap: .8rem; min-height: 2.5rem; }.risk-alert-radio-group label { display: inline-flex; align-items: center; gap: .35rem; color: var(--risk-alert-ink); font-size: .8rem; cursor: pointer; }.risk-alert-filter-footer { display: flex; justify-content: space-between; gap: 1rem; align-items: center; margin-top: 1rem; }.risk-alert-advanced-toggle { display: inline-flex; align-items: center; gap: .4rem; padding: .4rem 0; border: 0; color: var(--risk-alert-teal); background: transparent; font: inherit; font-size: .76rem; font-weight: 800; cursor: pointer; }.risk-alert-filter-actions { display: flex; justify-content: flex-end; gap: .5rem; }.risk-alert-applied-shortcut { display: inline-flex; align-items: center; gap: .45rem; margin-top: 1rem; padding: .45rem .65rem; border: 1px solid #b9dcd2; border-radius: .65rem; color: var(--risk-alert-teal); background: #eff9f3; font-size: .73rem; }.risk-alert-applied-shortcut button { padding: 0; border: 0; color: inherit; background: transparent; font: inherit; font-weight: 800; cursor: pointer; }
.risk-alert-queue-section { display: grid; gap: .85rem; }.risk-alert-queue-heading { align-items: end; }.risk-alert-list-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; align-items: center; gap: .65rem; color: var(--risk-alert-muted); font-size: .72rem; }.risk-alert-list-actions > span { display: inline-flex; align-items: center; gap: .35rem; }.risk-alert-list-actions i { color: var(--risk-alert-teal); }.risk-alerts-state { display: flex; align-items: center; gap: .9rem; padding: 1.25rem 1.4rem; border: 1px dashed var(--risk-alert-line); border-radius: .9rem; color: var(--risk-alert-muted); background: var(--risk-alert-soft); }.risk-alerts-state > i { color: var(--risk-alert-teal); font-size: 1.25rem; }.risk-alerts-state > div { flex: 1; min-width: 0; }.risk-alerts-state strong { color: var(--risk-alert-ink); font-size: .86rem; }.risk-alerts-state p { margin: .2rem 0 0; color: var(--risk-alert-muted); font-size: .74rem; }.risk-alerts-state--error { border-color: #ecd1cf; color: var(--risk-alert-red); background: #fff8f7; }.risk-alerts-state--info { align-items: flex-start; padding: .7rem .85rem; border-style: solid; border-color: #c9dced; color: #416e9f; background: #eff6fc; font-size: .74rem; line-height: 1.5; }
.risk-alert-table-shell { min-width: 0; overflow: hidden; border: 1px solid var(--risk-alert-line); border-radius: .9rem; background: #fff; }.risk-alert-table-scroll { max-width: 100%; min-width: 0; overflow-x: auto; overscroll-behavior-inline: contain; scrollbar-color: #b4d0ca transparent; }.risk-alert-table { width: 100%; min-width: 2400px; border-collapse: collapse; font-size: .72rem; }.risk-alert-table th { padding: .75rem .8rem; color: var(--risk-alert-muted); background: #f6faf8; font-size: .68rem; font-weight: 800; text-align: left; white-space: nowrap; }.risk-alert-table td { padding: .8rem; color: var(--risk-alert-ink); border-top: 1px solid var(--risk-alert-line); vertical-align: middle; white-space: nowrap; }.risk-alert-table tbody tr:hover { background: #fbfefd; }.risk-alert-table code, .risk-alert-detail-content code { color: #456d77; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .68rem; overflow-wrap: anywhere; }.risk-alert-time { color: var(--risk-alert-muted); font-variant-numeric: tabular-nums; }.risk-alert-environment { display: inline-flex; align-items: center; gap: .35rem; color: var(--risk-alert-teal); font-weight: 800; }.risk-alert-environment i { font-size: .38rem; }.risk-alert-game { display: grid; gap: .18rem; }.risk-alert-game small, .risk-alert-subline { display: block; margin-top: .2rem; color: var(--risk-alert-muted); font-size: .65rem; }.risk-alert-number { font-variant-numeric: tabular-nums; font-weight: 800; text-align: right; }.risk-alert-overdue { color: var(--risk-alert-red); font-weight: 800; }.risk-alert-pill { display: inline-flex; align-items: center; justify-content: center; width: max-content; padding: .26rem .48rem; border: 1px solid transparent; border-radius: 999px; font-size: .64rem; font-weight: 800; line-height: 1.2; white-space: nowrap; }.risk-alert-pill--critical, .risk-alert-pill--notification-failed, .risk-alert-pill--mitigation-failed { color: #ad3f3a; border-color: #f0c5c1; background: #fff0ee; }.risk-alert-pill--critical { box-shadow: inset 3px 0 0 #c53e38; }.risk-alert-pill--high { color: #a35b2a; border-color: #efd2b4; background: #fff6e9; }.risk-alert-pill--medium, .risk-alert-pill--status-pending, .risk-alert-pill--mitigation-pending, .risk-alert-pill--notification-pending { color: #96611e; border-color: #f0d9ae; background: #fff9eb; }.risk-alert-pill--status-investigating, .risk-alert-pill--mitigation-applied, .risk-alert-pill--notification-sent { color: #416e9f; border-color: #c9dced; background: #eff6fc; }.risk-alert-pill--status-mitigated, .risk-alert-pill--status-closed, .risk-alert-pill--mitigation-released, .risk-alert-pill--notification-acknowledged, .risk-alert-pill--isolation-released { color: #347553; border-color: #c9e2d4; background: #eff9f3; }.risk-alert-pill--status-false_positive, .risk-alert-pill--mitigation-not_required, .risk-alert-pill--notification-not_required, .risk-alert-pill--isolation-not_isolated { color: #5f7276; border-color: #dbe6e4; background: #f4f8f7; }.risk-alert-pill--isolation-isolated { color: #8d4f42; border-color: #ecd0c8; background: #fff5f0; }
.risk-alert-pagination { display: flex; align-items: center; justify-content: flex-end; gap: .4rem; padding: .55rem .8rem; border-top: 1px solid var(--risk-alert-line); color: var(--risk-alert-muted); font-size: .72rem; }.risk-alert-pagination > div { display: flex; gap: .05rem; }.risk-alert-pagination .p-select { width: 5rem; }
.risk-alert-detail-content { display: grid; gap: 1rem; min-width: 0; max-width: 100%; overflow-x: hidden; }.risk-alert-detail-hero { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; padding: 1.1rem 1.2rem; border: 1px solid var(--risk-alert-line); border-radius: .95rem; background: linear-gradient(115deg, #f7fbfa, #fff 60%, #fff7f3); }.risk-alert-detail-hero h2 { margin: .25rem 0 .2rem; color: var(--risk-alert-ink); font-size: 1.28rem; }.risk-alert-detail-hero p { margin: 0; color: var(--risk-alert-muted); font-size: .78rem; }.risk-alert-detail-badges { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: .45rem; }.risk-alert-state-chip { display: inline-flex; align-items: center; gap: .3rem; padding: .28rem .5rem; border: 1px solid var(--risk-alert-line); border-radius: 999px; color: var(--risk-alert-muted); background: #fff; font-size: .65rem; font-weight: 800; }.risk-alert-detail-section { min-width: 0; padding: 1rem 1.05rem; border: 1px solid var(--risk-alert-line); border-radius: .9rem; background: #fff; }.risk-alert-detail-title { display: flex; align-items: center; flex-wrap: wrap; gap: .45rem; margin-bottom: .8rem; }.risk-alert-detail-title > i { color: var(--risk-alert-teal); }.risk-alert-detail-title h3 { margin: 0; color: var(--risk-alert-ink); font-size: .9rem; }.risk-alert-section-note { margin-left: auto; color: var(--risk-alert-muted); font-size: .68rem; }.risk-alert-fact-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .8rem 1rem; }.risk-alert-fact-grid > div, .risk-alert-fact-list > div, .risk-alert-code-grid > div { display: grid; gap: .22rem; min-width: 0; }.risk-alert-fact-grid span, .risk-alert-fact-list span, .risk-alert-code-grid span { color: var(--risk-alert-muted); font-size: .68rem; }.risk-alert-fact-grid strong, .risk-alert-fact-list strong { color: var(--risk-alert-ink); font-size: .77rem; line-height: 1.45; }.risk-alert-detail-two-column { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }.risk-alert-fact-list { display: grid; gap: .7rem; }.risk-alert-code-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .75rem; }.risk-alert-code-grid code { display: block; min-height: 2.8rem; padding: .6rem .7rem; overflow-wrap: anywhere; border-radius: .55rem; color: #49646a; background: #f4f8f7; line-height: 1.5; }.risk-alert-wide { grid-column: 1 / -1; }.risk-alert-entry-links { display: flex; flex-wrap: wrap; gap: .45rem; margin-top: .8rem; padding-top: .7rem; border-top: 1px solid var(--risk-alert-line); }.risk-alert-health { display: inline-flex; align-items: center; padding: .24rem .5rem; border-radius: 999px; font-size: .66rem; font-weight: 800; }.risk-alert-health--passed { color: #347553; background: #eff9f3; }.risk-alert-health--warning { color: #96611e; background: #fff9eb; }.risk-alert-health--failed { color: #ad3f3a; background: #fff0ee; }.risk-alert-health-summary { display: flex; flex-wrap: wrap; justify-content: space-between; gap: .6rem; color: var(--risk-alert-muted); font-size: .73rem; }.risk-alert-health-summary strong { color: var(--risk-alert-ink); }.risk-alert-check-list { display: flex; flex-wrap: wrap; gap: .55rem 1.1rem; margin: .8rem 0 0; padding: 0; color: var(--risk-alert-muted); font-size: .72rem; list-style: none; }.risk-alert-check-list i { margin-right: .25rem; color: var(--risk-alert-teal); font-size: .4rem; vertical-align: middle; }.risk-alert-round-table-wrap { max-width: 100%; min-width: 0; overflow-x: auto; overscroll-behavior-inline: contain; }.risk-alert-round-table { width: 100%; min-width: 700px; border-collapse: collapse; font-size: .72rem; }.risk-alert-round-table th, .risk-alert-round-table td { padding: .65rem .7rem; border-bottom: 1px solid var(--risk-alert-line); text-align: left; white-space: nowrap; }.risk-alert-round-table th { color: var(--risk-alert-muted); background: #f6faf8; font-size: .67rem; }.risk-alert-round-table tr:last-child td { border-bottom: 0; }.risk-alert-request-list { display: grid; gap: .55rem; }.risk-alert-request-list > div { display: grid; grid-template-columns: 11rem 9rem 7rem minmax(0, 1fr); align-items: center; gap: .7rem; padding: .7rem; border-radius: .65rem; background: #f6faf8; font-size: .72rem; }.risk-alert-request-list time { color: var(--risk-alert-muted); }.risk-alert-request-list span { color: var(--risk-alert-teal); font-weight: 800; }.risk-alert-request-list p { margin: 0; color: var(--risk-alert-muted); }.risk-alert-timeline { display: grid; gap: 0; margin: 0; padding: 0; list-style: none; }.risk-alert-timeline li { position: relative; display: grid; grid-template-columns: 1rem 1fr; gap: .7rem; min-height: 4.2rem; }.risk-alert-timeline-dot { position: relative; z-index: 1; width: .68rem; height: .68rem; margin-top: .23rem; border: 2px solid #fff; border-radius: 50%; background: var(--risk-alert-teal); box-shadow: 0 0 0 1px var(--risk-alert-line); }.risk-alert-timeline li:not(:last-child) .risk-alert-timeline-dot::after { position: absolute; top: .56rem; left: .18rem; width: 1px; height: 3.8rem; background: var(--risk-alert-line); content: ''; }.risk-alert-timeline--danger .risk-alert-timeline-dot { background: var(--risk-alert-red); }.risk-alert-timeline--warning .risk-alert-timeline-dot { background: var(--risk-alert-amber); }.risk-alert-timeline--success .risk-alert-timeline-dot { background: var(--risk-alert-green); }.risk-alert-timeline time { display: block; color: var(--risk-alert-muted); font-size: .67rem; }.risk-alert-timeline strong { display: block; margin-top: .18rem; color: var(--risk-alert-ink); font-size: .78rem; }.risk-alert-timeline p { margin: .18rem 0 0; color: var(--risk-alert-muted); font-size: .73rem; line-height: 1.5; }
.risk-alert-detail-footer { display: grid; gap: .7rem; min-width: 0; }.risk-alert-detail-footer-note { display: flex; align-items: flex-start; gap: .4rem; color: var(--risk-alert-muted); font-size: .7rem; line-height: 1.45; }.risk-alert-detail-footer-note i { color: var(--risk-alert-teal); }.risk-alert-action-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .45rem; }.risk-alert-action-grid .p-button { justify-content: flex-start; min-width: 0; font-size: .72rem; }.risk-alert-action-grid .p-button-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.risk-alert-dialog-body { display: grid; gap: 1rem; }.risk-alert-dialog-intro, .risk-alert-mock-note { display: flex; align-items: flex-start; gap: .6rem; padding: .8rem .9rem; border: 1px solid #c9dced; border-radius: .7rem; color: #416e9f; background: #eff6fc; font-size: .73rem; line-height: 1.5; }.risk-alert-dialog-intro > i, .risk-alert-mock-note > i { margin-top: .12rem; }.risk-alert-dialog-intro strong { color: var(--risk-alert-ink); font-size: .82rem; }.risk-alert-dialog-intro p { margin: .2rem 0 0; }.risk-alert-mock-note--strong { border-color: #f0d9ae; color: #96611e; background: #fff9eb; }.risk-alert-action-context { display: grid; gap: .22rem; padding: .75rem; border-radius: .7rem; background: #f6faf8; }.risk-alert-action-context strong { color: var(--risk-alert-ink); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .74rem; }.risk-alert-action-context span { color: var(--risk-alert-muted); font-size: .72rem; }.risk-alert-health-check { display: grid; gap: .25rem; padding: .8rem; border: 1px solid var(--risk-alert-line); border-radius: .7rem; background: #fff; }.risk-alert-health-check strong { color: var(--risk-alert-ink); font-size: .78rem; }.risk-alert-health-check span { font-size: .75rem; font-weight: 800; }.risk-alert-health-check small { color: var(--risk-alert-muted); font-size: .68rem; }.risk-alert-action-error { display: flex; align-items: flex-start; gap: .35rem; margin: 0; color: var(--risk-alert-red); font-size: .73rem; line-height: 1.45; }
:global(.risk-alert-detail-dialog.p-dialog), :global(.risk-alert-action-dialog.p-dialog), :global(.risk-alert-export-dialog.p-dialog) { width: min(1240px, calc(100vw - 24px)); max-width: calc(100vw - 24px); max-height: calc(100vh - 16px); min-width: 0; overflow: hidden; }
:global(.risk-alert-detail-dialog .p-dialog-header), :global(.risk-alert-action-dialog .p-dialog-header), :global(.risk-alert-export-dialog .p-dialog-header) { display: flex; min-width: 0; max-width: 100%; align-items: flex-start; gap: .65rem; box-sizing: border-box; }
:global(.risk-alert-detail-dialog .p-dialog-title), :global(.risk-alert-action-dialog .p-dialog-title), :global(.risk-alert-export-dialog .p-dialog-title) { min-width: 0; flex: 1 1 auto; max-width: 100%; overflow-wrap: anywhere; word-break: break-word; white-space: normal; line-height: 1.35; }
:global(.risk-alert-detail-dialog .p-dialog-header-actions), :global(.risk-alert-action-dialog .p-dialog-header-actions), :global(.risk-alert-export-dialog .p-dialog-header-actions) { flex: 0 0 auto; min-width: 0; }
:global(.risk-alert-detail-dialog .p-dialog-content), :global(.risk-alert-detail-dialog .p-dialog-footer), :global(.risk-alert-action-dialog .p-dialog-content), :global(.risk-alert-action-dialog .p-dialog-footer), :global(.risk-alert-export-dialog .p-dialog-content), :global(.risk-alert-export-dialog .p-dialog-footer) { min-width: 0; max-width: 100%; box-sizing: border-box; overflow-x: hidden; }
:global(.risk-alert-detail-dialog .p-dialog-content) { max-height: calc(100vh - 250px); overflow-y: auto; }
:global(.risk-alert-detail-dialog .p-dialog-footer) { position: sticky; bottom: 0; z-index: 2; border-top: 1px solid var(--risk-alert-line); background: rgba(255,255,255,.97); }
:global(.risk-alert-action-dialog .p-dialog-content), :global(.risk-alert-export-dialog .p-dialog-content) { max-height: calc(100vh - 210px); overflow-y: auto; }
@media (max-width: 1150px) { .risk-alert-summary-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }.risk-alert-filter-grid--common, .risk-alert-filter-grid--advanced { grid-template-columns: repeat(3, minmax(0, 1fr)); }.risk-alert-fact-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }.risk-alert-action-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }.risk-alert-request-list > div { grid-template-columns: 10rem 8rem 6rem minmax(0, 1fr); } }
@media (max-width: 760px) { .risk-alert-summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .6rem; }.risk-alert-summary-card { padding: .85rem; }.risk-alert-summary-card strong { font-size: 1.45rem; }.risk-alert-filter-card { padding: 1rem; }.risk-alert-section-heading, .risk-alert-detail-hero { flex-direction: column; }.risk-alert-filter-grid--common, .risk-alert-filter-grid--advanced, .risk-alert-detail-two-column, .risk-alert-code-grid { grid-template-columns: 1fr; }.risk-alert-filter-footer { align-items: stretch; flex-direction: column; }.risk-alert-filter-actions { justify-content: flex-start; }.risk-alert-list-actions { justify-content: flex-start; }.risk-alert-queue-heading { align-items: flex-start; }.risk-alert-fact-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }.risk-alert-detail-badges { justify-content: flex-start; }.risk-alert-action-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }.risk-alert-request-list > div { grid-template-columns: 1fr 1fr; }.risk-alert-request-list p { grid-column: 1 / -1; }.risk-alert-pagination { flex-wrap: wrap; justify-content: flex-start; }.risk-alerts-state { align-items: flex-start; flex-wrap: wrap; }.risk-alerts-state > div { min-width: 12rem; } }
@media (max-width: 420px) { :global(.risk-alert-detail-dialog.p-dialog), :global(.risk-alert-action-dialog.p-dialog), :global(.risk-alert-export-dialog.p-dialog) { width: calc(100vw - 16px) !important; max-width: calc(100vw - 16px); max-height: calc(100vh - 16px); }.risk-alert-summary-grid { grid-template-columns: 1fr; }.risk-alert-fact-grid { grid-template-columns: 1fr; }.risk-alert-action-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); max-height: 13.5rem; overflow-y: auto; padding-right: .15rem; }.risk-alert-action-grid .p-button { width: 100%; min-height: 2.5rem; justify-content: center; white-space: normal; }.risk-alert-action-grid .p-button-label { overflow: visible; text-overflow: clip; white-space: normal; line-height: 1.25; }.risk-alert-detail-footer-note { width: 100%; font-size: .68rem; }.risk-alert-scope-meta { align-self: flex-start; }.risk-alert-list-actions { width: 100%; }.risk-alert-list-actions .p-button { flex: 1; } :global(.risk-alert-detail-dialog .p-dialog-header), :global(.risk-alert-action-dialog .p-dialog-header), :global(.risk-alert-export-dialog .p-dialog-header) { padding: .75rem .85rem; }.risk-alert-detail-dialog { min-width: 0; }.risk-alert-detail-content { min-width: 0; }.risk-alert-detail-hero { padding: .85rem .9rem; }.risk-alert-detail-section { padding: .85rem .9rem; } :global(.risk-alert-detail-dialog .p-dialog-content) { max-height: calc(100vh - 360px); padding: .8rem .85rem 1rem; overflow-x: hidden; overflow-y: auto; } :global(.risk-alert-detail-dialog .p-dialog-footer) { max-height: 17.5rem; padding: .65rem .85rem .75rem; overflow-x: hidden; overflow-y: auto; } :global(.risk-alert-action-dialog .p-dialog-content), :global(.risk-alert-export-dialog .p-dialog-content) { max-height: calc(100vh - 180px); padding: .8rem .85rem 1rem; } :global(.risk-alert-action-dialog .p-dialog-footer), :global(.risk-alert-export-dialog .p-dialog-footer) { display: flex; flex-wrap: wrap; gap: .35rem; padding: .65rem .85rem .75rem; } :global(.risk-alert-detail-dialog .p-dialog-title), :global(.risk-alert-action-dialog .p-dialog-title), :global(.risk-alert-export-dialog .p-dialog-title) { font-size: .88rem; line-height: 1.3; } }
</style>
