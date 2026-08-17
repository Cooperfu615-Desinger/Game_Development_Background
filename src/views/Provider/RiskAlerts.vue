<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { exportToCSV } from '@/utils/csvExport'
import {
    alertStatusLabels,
    anomalyLabels,
    environmentLabels,
    providerRiskState,
    resolutionCodeLabels,
    riskEventStatusLabels,
    severityLabels,
    sourceLabels,
    useProviderRiskMock,
} from '@/mocks/providerRisk'
import type { AlertAction, AlertResolutionCode, AlertStatus, CommandOutcome, ProviderEnvironment, RiskAlert, RiskSeverity, RiskSource } from '@/types/providerRisk'

type AlertScope = 'active' | AlertStatus | 'all'
type AlertSummaryShortcut = '' | 'takeover' | 'high' | 'isolated' | 'failed' | 'overdue'
type AlertFilter = {
    environment: ProviderEnvironment
    status: AlertScope
    severity: RiskSeverity | ''
    assignee: string
    unassigned: boolean
    game: string
    gameVersion: string
    alertId: string
    riskEventId: string
    createdStart: string
    createdEnd: string
    resolutionCode: AlertResolutionCode | ''
    source: RiskSource | ''
    anomalyType: string
    waitingReason: string
    jobType: string
    jobStatus: string
    desiredState: string
    actualState: string
    deliveryStatus: string
    providerRoundId: string
    ggapRoundId: string
}

const route = useRoute()
const router = useRouter()
const {
    getRiskEvent, latestJobAttempts, latestNecessaryDelivery, actionDisabledReason, closeGateFailures, applyAlertCommand, refresh,
} = useProviderRiskMock()
const rowsPerPage = 8
const page = ref(1)
const detailAlert = ref<RiskAlert | null>(null)
const detailVisible = ref(false)
const actionVisible = ref(false)
const advancedVisible = ref(false)
const flash = ref('')
const flashError = ref(false)
const versionSnapshot = ref(0)
const initializing = ref(true)
const syncingRoute = ref(false)
const summaryShortcut = ref<AlertSummaryShortcut>('')

function makeDefaults(environment: ProviderEnvironment = 'production'): AlertFilter {
    return {
        environment, status: 'active', severity: '', assignee: '', unassigned: false, game: '', gameVersion: '', alertId: '', riskEventId: '',
        createdStart: '', createdEnd: '', resolutionCode: '', source: '', anomalyType: '', waitingReason: '', jobType: '', jobStatus: '',
        desiredState: '', actualState: '', deliveryStatus: '', providerRoundId: '', ggapRoundId: '',
    }
}
const defaults = makeDefaults()
const draft = reactive<AlertFilter>({ ...defaults })
const appliedFilters = ref<AlertFilter>({ ...defaults })
const command = reactive({
    action: 'takeover' as AlertAction,
    reason: '',
    outcome: 'success' as CommandOutcome,
    assigneeName: '林怡君',
    reviewDueLocal: '',
    resolutionCode: '' as AlertResolutionCode | '',
})

const actionLabels: Record<AlertAction, string> = {
    takeover: '接手', assign: '指派／改派', add_note: '新增備註', move_to_monitoring: '轉入觀察', maintain_isolation: '維持／套用隔離', release_isolation: '解除隔離', retry_job: '重試失敗工作', resend_delivery: '重送 GGAP', close: '結案', reopen: '重新開啟',
}
const allActions = Object.keys(actionLabels) as AlertAction[]
const assignees = ['林怡君', '陳冠廷', '王子安', '風控值班組']
const outcomes: Array<{ value: CommandOutcome; label: string }> = [
    { value: 'success', label: '模擬執行成功' }, { value: 'failed', label: '模擬執行失敗' }, { value: 'version_conflict', label: '模擬版本衝突' }, { value: 'permission_denied', label: '模擬權限拒絕' },
]

function statusMatches(status: AlertStatus, scope: AlertScope) {
    return scope === 'all' || (scope === 'active' ? status !== 'closed' : status === scope)
}
function isOverdue(alert: RiskAlert) { return Boolean(alert.reviewDueAt && alert.reviewDueAt < new Date() && alert.status !== 'closed') }
function hasOperationalFailure(alert: RiskAlert) {
    return latestJobAttempts(alert).some((job) => job.status === 'failed')
        || alert.isolation?.actualState === 'failed'
        || latestNecessaryDelivery(alert)?.status === 'failed'
}
function matchesSummary(alert: RiskAlert, shortcut: Exclude<AlertSummaryShortcut, ''>) {
    if (shortcut === 'takeover') return alert.status === 'new' && alert.assigneeId === null
    if (shortcut === 'high') return (alert.severity === 'high' || alert.severity === 'critical') && alert.status !== 'closed'
    if (shortcut === 'isolated') return alert.isolation?.actualState === 'isolated'
    if (shortcut === 'failed') return hasOperationalFailure(alert)
    return isOverdue(alert)
}
function summaryMatches(shortcut: Exclude<AlertSummaryShortcut, ''>) {
    const matches = providerRiskState.alerts
        .filter((alert) => alert.environment === appliedFilters.value.environment && alert.status !== 'closed')
        .filter((alert) => matchesSummary(alert, shortcut))
    if (shortcut !== 'isolated') return matches.sort(compareAlerts)
    const seen = new Set<string>()
    return matches.filter((alert) => {
        const target = alert.isolation?.targetScope ?? alert.alertId
        if (seen.has(target)) return false
        seen.add(target)
        return true
    }).sort(compareAlerts)
}

function alertPriority(alert: RiskAlert) {
    if (alert.severity === 'critical') return 0
    if (hasOperationalFailure(alert)) return 1
    if (isOverdue(alert)) return 2
    if (alert.severity === 'high') return 3
    if (alert.severity === 'medium') return 4
    return alert.severity === 'low' ? 5 : 6
}
function compareAlerts(a: RiskAlert, b: RiskAlert) {
    const priority = alertPriority(a) - alertPriority(b)
    if (priority) return priority
    if (a.reviewDueAt && b.reviewDueAt) return a.reviewDueAt.getTime() - b.reviewDueAt.getTime()
    if (a.reviewDueAt) return -1
    if (b.reviewDueAt) return 1
    return b.createdAt.getTime() - a.createdAt.getTime()
}

const baseFilteredAlerts = computed(() => providerRiskState.alerts
    .filter((alert) => alert.environment === appliedFilters.value.environment)
    .filter((alert) => statusMatches(alert.status, appliedFilters.value.status))
    .filter((alert) => !appliedFilters.value.severity || alert.severity === appliedFilters.value.severity)
    .filter((alert) => !appliedFilters.value.assignee || (alert.assigneeName ?? '').toLowerCase().includes(appliedFilters.value.assignee.toLowerCase()))
    .filter((alert) => !appliedFilters.value.unassigned || alert.assigneeId === null)
    .filter((alert) => {
        const event = getRiskEvent(alert.riskEventId)
        return !appliedFilters.value.game || `${event?.gameId ?? ''} ${event?.gameName ?? ''}`.toLowerCase().includes(appliedFilters.value.game.toLowerCase())
    })
    .filter((alert) => {
        const event = getRiskEvent(alert.riskEventId)
        return !appliedFilters.value.gameVersion || event?.gameVersion.toLowerCase().includes(appliedFilters.value.gameVersion.toLowerCase())
    })
    .filter((alert) => !appliedFilters.value.alertId || alert.alertId.toLowerCase().includes(appliedFilters.value.alertId.toLowerCase()))
    .filter((alert) => !appliedFilters.value.riskEventId || alert.riskEventId.toLowerCase().includes(appliedFilters.value.riskEventId.toLowerCase()))
    .filter((alert) => !appliedFilters.value.createdStart || alert.createdAt >= new Date(appliedFilters.value.createdStart))
    .filter((alert) => !appliedFilters.value.createdEnd || alert.createdAt <= new Date(appliedFilters.value.createdEnd))
    .filter((alert) => !appliedFilters.value.resolutionCode || alert.resolutionCode === appliedFilters.value.resolutionCode)
    .filter((alert) => !appliedFilters.value.waitingReason || (alert.waitingReason ?? '').toLowerCase().includes(appliedFilters.value.waitingReason.toLowerCase()))
    .filter((alert) => {
        const event = getRiskEvent(alert.riskEventId)
        return (!appliedFilters.value.source || event?.source === appliedFilters.value.source)
            && (!appliedFilters.value.anomalyType || event?.anomalyType === appliedFilters.value.anomalyType)
            && (!appliedFilters.value.providerRoundId || event?.relatedRounds.some((round) => round.providerRoundId.includes(appliedFilters.value.providerRoundId)))
            && (!appliedFilters.value.ggapRoundId || event?.relatedRounds.some((round) => round.ggapRoundId.includes(appliedFilters.value.ggapRoundId)))
    })
    .filter((alert) => !appliedFilters.value.jobType || latestJobAttempts(alert).some((job) => job.actionType.toLowerCase().includes(appliedFilters.value.jobType.toLowerCase())))
    .filter((alert) => !appliedFilters.value.jobStatus || latestJobAttempts(alert).some((job) => job.status === appliedFilters.value.jobStatus))
    .filter((alert) => !appliedFilters.value.desiredState || alert.isolation?.desiredState === appliedFilters.value.desiredState)
    .filter((alert) => !appliedFilters.value.actualState || alert.isolation?.actualState === appliedFilters.value.actualState)
    .filter((alert) => !appliedFilters.value.deliveryStatus || latestNecessaryDelivery(alert)?.status === appliedFilters.value.deliveryStatus)
    .sort(compareAlerts))
const filteredAlerts = computed(() => summaryShortcut.value
    ? summaryMatches(summaryShortcut.value as Exclude<AlertSummaryShortcut, ''>)
    : baseFilteredAlerts.value)
const pagedAlerts = computed(() => filteredAlerts.value.slice((page.value - 1) * rowsPerPage, page.value * rowsPerPage))
const pageCount = computed(() => Math.max(1, Math.ceil(filteredAlerts.value.length / rowsPerPage)))
const summaries = computed(() => {
    return [
        { key: 'takeover' as const, label: '待接手', value: summaryMatches('takeover').length, note: 'new 且 assigneeId = null' },
        { key: 'high' as const, label: '高風險', value: summaryMatches('high').length, note: 'High + Critical，排除 closed' },
        { key: 'isolated' as const, label: '隔離中', value: summaryMatches('isolated').length, note: 'actualState = isolated，不重複 target' },
        { key: 'failed' as const, label: '工作或通知失敗', value: summaryMatches('failed').length, note: '最新有效 Job／Isolation／Delivery' },
        { key: 'overdue' as const, label: '逾期未覆核', value: summaryMatches('overdue').length, note: '已逾期且未結案' },
    ]
})

const detailEvent = computed(() => detailAlert.value ? getRiskEvent(detailAlert.value.riskEventId) : null)
const gatePreview = computed(() => detailAlert.value ? closeGateFailures(detailAlert.value, command.resolutionCode || null, command.reason) : [])

function validateCreatedRange() {
    if (!draft.createdStart || !draft.createdEnd) return ''
    return new Date(draft.createdStart) > new Date(draft.createdEnd) ? 'Alert 建立時間的開始不可晚於結束。' : ''
}
function applyFilters() {
    const error = validateCreatedRange()
    if (error) { flash.value = error; flashError.value = true; return false }
    appliedFilters.value = { ...draft }
    summaryShortcut.value = ''
    page.value = 1
    flashError.value = false
    return true
}
function resetFilters() { Object.assign(draft, makeDefaults(appliedFilters.value.environment)); applyFilters() }
function activateSummary(key: Exclude<AlertSummaryShortcut, ''>) {
    if (summaryShortcut.value === key) {
        summaryShortcut.value = ''
        page.value = 1
        return
    }
    const environment = appliedFilters.value.environment
    Object.assign(draft, makeDefaults(environment))
    appliedFilters.value = { ...draft }
    summaryShortcut.value = key
    page.value = 1
}
function openDetail(alert: RiskAlert) {
    detailAlert.value = alert
    versionSnapshot.value = alert.version
    detailVisible.value = true
    void router.replace({ query: { ...route.query, environment: alert.environment, alert_id: alert.alertId, risk_event_id: alert.riskEventId } })
}
function closeDetail() {
    detailVisible.value = false
    actionVisible.value = false
    void router.replace({ query: { ...route.query, alert_id: undefined, risk_event_id: undefined } })
}
function openAction(action: AlertAction) {
    if (!detailAlert.value) return
    command.action = action
    command.reason = ''
    command.outcome = 'success'
    command.assigneeName = detailAlert.value.assigneeName ?? assignees[0]
    command.reviewDueLocal = ''
    command.resolutionCode = ''
    versionSnapshot.value = detailAlert.value.version
    actionVisible.value = true
}
function disabledReason(action: AlertAction) {
    return detailAlert.value ? actionDisabledReason(detailAlert.value, action) : '沒有選定 Alert。'
}
function submitCommand() {
    if (!detailAlert.value) return
    const reviewDueAt = command.reviewDueLocal ? new Date(command.reviewDueLocal) : null
    const result = applyAlertCommand({
        alertId: detailAlert.value.alertId,
        action: command.action,
        reason: command.reason,
        expectedVersion: versionSnapshot.value,
        outcome: command.outcome,
        assigneeName: command.assigneeName,
        reviewDueAt,
        resolutionCode: command.resolutionCode || null,
    })
    flash.value = result.message
    flashError.value = !result.accepted
    if (result.accepted) {
        actionVisible.value = false
        versionSnapshot.value = detailAlert.value.version
    }
}
function jumpToRiskEvent(alert: RiskAlert) {
    void router.push({ path: '/monitoring/risk-reports', query: { environment: alert.environment, risk_event_id: alert.riskEventId } })
}
function jumpToRound(alert: RiskAlert) {
    const event = getRiskEvent(alert.riskEventId)
    const round = event?.relatedRounds[0]
    if (!round) return
    void router.push({ path: '/reports/provider-game-rounds', query: { environment: alert.environment, provider_game_round_id: round.providerRoundId, ggap_round_id: round.ggapRoundId } })
}
function exportCsv() {
    exportToCSV(filteredAlerts.value.map((alert) => {
        const event = getRiskEvent(alert.riskEventId)
        return { alertId: alert.alertId, riskEventId: alert.riskEventId, environment: alert.environment, severity: alert.severity, game: `${event?.gameName ?? ''} ${event?.gameVersion ?? ''}`, eventStatus: event?.status ?? '', alertStatus: alert.status, assignee: alert.assigneeName ?? '', waiting: alert.waitingReason ?? '', job: currentJob(alert)?.status ?? '', desired: alert.isolation?.desiredState ?? '', actual: alert.isolation?.actualState ?? '', delivery: latestNecessaryDelivery(alert)?.status ?? '', due: alert.reviewDueAt?.toISOString() ?? '' }
    }), `provider-risk-alerts-${appliedFilters.value.environment}`, { alertId: 'Alert ID', riskEventId: 'Risk Event ID', environment: '環境', severity: '嚴重度', game: '遊戲／版本', eventStatus: 'Event 狀態', alertStatus: 'Alert 狀態', assignee: '負責人', waiting: '等待原因', job: 'Job', desired: '隔離期望', actual: '隔離實際', delivery: 'GGAP Delivery', due: '覆核期限' })
    flash.value = `已匯出 ${filteredAlerts.value.length} 筆 Alert。`; flashError.value = false
}
function formatDate(value: Date | null | undefined) { return value ? new Intl.DateTimeFormat('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(value) : '—' }
function display(value: string | number | null | undefined) { return value === null || value === undefined || value === '' ? '—' : String(value) }
function currentJob(alert: RiskAlert) { return [...latestJobAttempts(alert)].sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime())[0] ?? null }

async function syncFromRoute() {
    syncingRoute.value = true
    const queryEnvironment = route.query.environment
    const alertId = typeof route.query.alert_id === 'string' ? route.query.alert_id : ''
    const riskEventId = typeof route.query.risk_event_id === 'string' ? route.query.risk_event_id : ''
    const alert = providerRiskState.alerts.find((item) => item.alertId === alertId || (!alertId && item.riskEventId === riskEventId))
    const environment = alert?.environment ?? (queryEnvironment === 'production' || queryEnvironment === 'demo' ? queryEnvironment : draft.environment)
    Object.assign(draft, makeDefaults(environment))
    if (alert?.status === 'closed') draft.status = 'closed'
    applyFilters()
    if (alert) { detailAlert.value = alert; versionSnapshot.value = alert.version; detailVisible.value = true }
    else if (alertId || riskEventId) { flash.value = `找不到指定 Alert／Risk Event，可能不屬於目前 Provider。`; flashError.value = true }
    else detailVisible.value = false
    await nextTick()
    syncingRoute.value = false
}

onMounted(async () => {
    await syncFromRoute()
    initializing.value = false
})
watch(() => [route.query.environment, route.query.alert_id, route.query.risk_event_id], () => { if (!initializing.value) void syncFromRoute() })
watch(() => draft.environment, () => {
    if (initializing.value || syncingRoute.value) return
    applyFilters()
    detailVisible.value = false
    void router.replace({ query: { environment: draft.environment } })
})
watch(pageCount, (count) => { if (page.value > count) page.value = count })
</script>

<template>
    <main class="rc-page rc-page--fluid rc-stack">
        <header class="rc-header"><div><p class="rc-eyebrow">Monitoring / Alert workbench</p><h1>風控告警處理</h1><p class="rc-subtitle">Alert 只追蹤人工處理進度；Risk Event、Job、隔離 desired／actual 與 GGAP Delivery 保持各自狀態與稽核軌跡。</p></div><div class="rc-actions"><button class="rc-button" @click="exportCsv">匯出 CSV</button><button class="rc-button" @click="refresh">重新整理</button></div></header>
        <div class="rc-mock-banner"><span>MOCK</span><div><strong>可互動命令模擬</strong><br>操作成功只代表 Command accepted；Job 會實際經過 queued → running → succeeded／failed，GGAP 會經過 pending → sending → sent → acknowledged／failed。</div></div>
        <div v-if="flash" :class="['rc-flash', { 'is-error': flashError }]">{{ flash }}</div>

        <section class="rc-card rc-control-card"><div class="rc-control-row"><div class="rc-inline"><strong>環境</strong><div class="rc-segment"><button :class="{ 'is-active': draft.environment === 'production' }" @click="draft.environment = 'production'">正式環境</button><button :class="{ 'is-active': draft.environment === 'demo' }" @click="draft.environment = 'demo'">DEMO</button></div></div><span class="rc-muted">Test 永久排除 · 更新 {{ formatDate(providerRiskState.lastUpdatedAt) }}</span></div></section>

        <section class="rc-summary-grid"><button v-for="item in summaries" :key="item.key" :class="['rc-card', 'rc-summary', { 'is-active': summaryShortcut === item.key }]" @click="activateSummary(item.key)"><span class="rc-summary-label">{{ item.label }}</span><div class="rc-summary-value">{{ item.value }}</div><div class="rc-summary-note">{{ item.note }}</div></button></section>

        <section class="rc-card"><div class="rc-card-body rc-stack"><div class="rc-section-head"><div><p class="rc-eyebrow">Queue filters</p><h2>告警工作佇列</h2></div><button class="rc-link" @click="advancedVisible = !advancedVisible">{{ advancedVisible ? '收合進階條件' : '展開進階條件' }}</button></div><div class="rc-filters">
            <label class="rc-label">Alert 範圍<select v-model="draft.status" class="rc-select"><option value="active">有效 Alert</option><option value="new">新告警</option><option value="in_progress">處理中</option><option value="monitoring">觀察中</option><option value="closed">已結案／歷史</option><option value="all">全部</option></select></label>
            <label class="rc-label">嚴重度<select v-model="draft.severity" class="rc-select"><option value="">全部</option><option v-for="value in ['critical','high','medium','low','info']" :key="value" :value="value">{{ severityLabels[value as RiskSeverity] }}</option></select></label>
            <label class="rc-label">負責人<input v-model="draft.assignee" class="rc-input" placeholder="人員名稱"></label>
            <label class="rc-label rc-checkbox"><input v-model="draft.unassigned" type="checkbox"> 僅未指派</label>
            <label class="rc-label">遊戲<input v-model="draft.game" class="rc-input" placeholder="名稱或 ID"></label>
            <label class="rc-label">Alert ID<input v-model="draft.alertId" class="rc-input" placeholder="alt_..."></label>
            <label class="rc-label">Risk Event ID<input v-model="draft.riskEventId" class="rc-input" placeholder="rsk_..."></label>
        </div><div v-if="advancedVisible" class="rc-filters">
            <label class="rc-label">建立開始<input v-model="draft.createdStart" type="datetime-local" class="rc-input"></label><label class="rc-label">建立結束<input v-model="draft.createdEnd" type="datetime-local" class="rc-input"></label>
            <label class="rc-label">Resolution Code<select v-model="draft.resolutionCode" class="rc-select"><option value="">全部</option><option v-for="(_, key) in resolutionCodeLabels" :key="key" :value="key">{{ resolutionCodeLabels[key] }}</option></select></label>
            <label class="rc-label">異常來源<select v-model="draft.source" class="rc-select"><option value="">全部</option><option v-for="(_, key) in sourceLabels" :key="key" :value="key">{{ sourceLabels[key] }}</option></select></label>
            <label class="rc-label">異常類型<select v-model="draft.anomalyType" class="rc-select"><option value="">全部</option><option v-for="(label, key) in anomalyLabels" :key="key" :value="key">{{ label }}</option></select></label>
            <label class="rc-label">遊戲版本<input v-model="draft.gameVersion" class="rc-input" placeholder="v2.4.1"></label>
            <label class="rc-label">Waiting reason<input v-model="draft.waitingReason" class="rc-input" placeholder="等待原因"></label>
            <label class="rc-label">Job type<input v-model="draft.jobType" class="rc-input" placeholder="apply_isolation"></label>
            <label class="rc-label">Job 最新狀態<select v-model="draft.jobStatus" class="rc-select"><option value="">全部</option><option v-for="value in ['queued','running','succeeded','failed','cancelled']" :key="value">{{ value }}</option></select></label>
            <label class="rc-label">隔離 desired<select v-model="draft.desiredState" class="rc-select"><option value="">全部</option><option value="not_isolated">not_isolated</option><option value="isolated">isolated</option></select></label>
            <label class="rc-label">隔離 actual<select v-model="draft.actualState" class="rc-select"><option value="">全部</option><option v-for="value in ['not_isolated','applying','isolated','releasing','failed']" :key="value">{{ value }}</option></select></label>
            <label class="rc-label">Delivery 最新必要狀態<select v-model="draft.deliveryStatus" class="rc-select"><option value="">全部</option><option v-for="value in ['pending','sending','sent','acknowledged','failed']" :key="value">{{ value }}</option></select></label>
            <label class="rc-label">Provider Game Round ID<input v-model="draft.providerRoundId" class="rc-input" placeholder="pr_..."></label><label class="rc-label">GGAP Round ID<input v-model="draft.ggapRoundId" class="rc-input" placeholder="ggap_..."></label>
        </div><div class="rc-actions"><button class="rc-button rc-button--primary" @click="applyFilters">套用篩選</button><button class="rc-button" @click="resetFilters">重設</button></div></div>
            <div class="rc-table-wrap"><table class="rc-table"><thead><tr><th>嚴重度</th><th>Alert ID</th><th>Risk Event／狀態</th><th>建立時間</th><th>環境</th><th>遊戲／版本</th><th>異常</th><th>影響回合</th><th>Alert 狀態</th><th>負責人／等待</th><th>Job</th><th>隔離 desired／actual</th><th>Delivery</th><th>覆核期限</th><th>版本</th><th>操作</th></tr></thead><tbody>
                <tr v-for="alert in pagedAlerts" :key="alert.alertId" @click="openDetail(alert)"><td><span :class="['rc-pill', `rc-pill--${alert.severity}`]">{{ severityLabels[alert.severity] }}</span></td><td><code>{{ alert.alertId }}</code></td><td><code>{{ alert.riskEventId }}</code><span v-if="getRiskEvent(alert.riskEventId)" class="rc-secondary">{{ riskEventStatusLabels[getRiskEvent(alert.riskEventId)!.status] }}</span></td><td>{{ formatDate(alert.createdAt) }}</td><td>{{ environmentLabels[alert.environment] }}</td><td><span class="rc-primary">{{ getRiskEvent(alert.riskEventId)?.gameName }}</span><span class="rc-secondary">{{ getRiskEvent(alert.riskEventId)?.gameId }} · {{ getRiskEvent(alert.riskEventId)?.gameVersion }}</span></td><td>{{ anomalyLabels[getRiskEvent(alert.riskEventId)?.anomalyType ?? ''] }}<span class="rc-secondary">{{ sourceLabels[getRiskEvent(alert.riskEventId)!.source] }}</span></td><td>{{ getRiskEvent(alert.riskEventId)?.affectedRounds ?? '—' }}</td><td><span :class="['rc-pill', `rc-pill--${alert.status}`]">{{ alertStatusLabels[alert.status] }}</span></td><td>{{ display(alert.assigneeName) }}<span class="rc-secondary">{{ display(alert.waitingReason) }}</span></td><td><span v-if="currentJob(alert)" :class="['rc-pill', `rc-pill--${currentJob(alert)?.status}`]">{{ currentJob(alert)?.status }}</span><span class="rc-secondary">{{ display(currentJob(alert)?.mitigationJobId) }}</span></td><td><span class="rc-secondary">D {{ display(alert.isolation?.desiredState) }}</span><span class="rc-secondary">A {{ display(alert.isolation?.actualState) }}</span></td><td><span v-if="latestNecessaryDelivery(alert)" :class="['rc-pill', `rc-pill--${latestNecessaryDelivery(alert)?.status}`]">{{ latestNecessaryDelivery(alert)?.status }}</span><span v-else>—</span></td><td :style="{ color: isOverdue(alert) ? '#b42318' : '' }">{{ formatDate(alert.reviewDueAt) }}</td><td>v{{ alert.version }}</td><td><button class="rc-button" @click.stop="openDetail(alert)">處理</button></td></tr>
            </tbody></table><div v-if="!pagedAlerts.length" class="rc-empty">沒有符合條件的 Alert。</div></div><div class="rc-pagination"><span>共 {{ filteredAlerts.length }} 筆 · 第 {{ page }} / {{ pageCount }} 頁</span><button class="rc-button" :disabled="page === 1" @click="page--">上一頁</button><button class="rc-button" :disabled="page === pageCount" @click="page++">下一頁</button></div>
        </section>

        <div v-if="detailVisible && detailAlert" class="rc-drawer-backdrop" @click.self="closeDetail"><aside class="rc-drawer" aria-label="Alert 詳情"><header class="rc-drawer-head"><div><p class="rc-eyebrow">Alert work item · version {{ detailAlert.version }}</p><h2>{{ detailEvent ? anomalyLabels[detailEvent.anomalyType] : '告警詳情' }}</h2><code class="rc-code">{{ detailAlert.alertId }}<br>{{ detailAlert.riskEventId }}</code></div><button class="rc-button" @click="closeDetail">關閉</button></header><div class="rc-drawer-body">
            <section class="rc-card rc-detail-section"><div class="rc-section-head"><h3>允許操作</h3><div><span :class="['rc-pill', `rc-pill--${detailAlert.status}`]">{{ alertStatusLabels[detailAlert.status] }}</span> <span class="rc-pill">version {{ detailAlert.version }}</span></div></div><div class="rc-action-grid"><button v-for="action in allActions" :key="action" class="rc-button" :class="{ 'rc-button--danger': action === 'close' || action === 'release_isolation' }" :disabled="Boolean(disabledReason(action))" :title="disabledReason(action) || `${actionLabels[action]} 會送出帶 expected_version 與 idempotency key 的 command`" @click="openAction(action)">{{ actionLabels[action] }}</button></div><p class="rc-muted">allowed_actions: {{ detailAlert.allowedActions.join(', ') || '無' }}。停用原因可將滑鼠移到按鈕查看。</p></section>
            <section class="rc-card rc-detail-section"><div class="rc-section-head"><h3>Alert 與 Risk Event（分離）</h3><button class="rc-button" @click="jumpToRiskEvent(detailAlert)">檢視事件證據</button></div><dl class="rc-facts"><div class="rc-fact"><dt>Alert 狀態</dt><dd>{{ alertStatusLabels[detailAlert.status] }}</dd></div><div class="rc-fact"><dt>Resolution Code</dt><dd>{{ detailAlert.resolutionCode ? resolutionCodeLabels[detailAlert.resolutionCode] : '—' }}</dd></div><div class="rc-fact"><dt>Assignee</dt><dd>{{ display(detailAlert.assigneeName) }}</dd></div><div class="rc-fact"><dt>Waiting / Review Due</dt><dd>{{ display(detailAlert.waitingReason) }} · {{ formatDate(detailAlert.reviewDueAt) }}</dd></div><div class="rc-fact"><dt>Risk Event 狀態</dt><dd>{{ detailEvent ? riskEventStatusLabels[detailEvent.status] : '—' }}</dd></div><div class="rc-fact"><dt>Detection Result</dt><dd>{{ detailEvent?.detection.outcome }} · {{ detailEvent?.detection.evidenceSummary }}</dd></div></dl></section>
            <section class="rc-card rc-detail-section"><h3>Mitigation Jobs</h3><div class="rc-evidence"><article v-for="job in detailAlert.mitigationJobs" :key="job.mitigationJobId" class="rc-evidence-item"><strong>{{ job.actionType }}</strong> <span :class="['rc-pill', `rc-pill--${job.status}`]">{{ job.status }}</span><p>target {{ job.targetScope }}<br>requested {{ formatDate(job.requestedAt) }} · started {{ formatDate(job.startedAt) }} · completed {{ formatDate(job.completedAt) }}<br>requested_by {{ job.requestedBy }} · approved_by {{ display(job.approvedBy) }} · attempt {{ job.attempt }}<br>{{ job.beforeState }} → {{ display(job.afterState) }}<br>{{ display(job.result || job.error) }} · health {{ display(job.healthVerificationResult) }}</p><code class="rc-code">{{ job.mitigationJobId }}<br>{{ job.idempotencyKey }}<br>{{ job.traceId }}</code></article></div><div v-if="!detailAlert.mitigationJobs.length" class="rc-empty">沒有工作；不推導為成功。</div></section>
            <section class="rc-card rc-detail-section"><h3>隔離 Desired／Actual 與健康證據</h3><template v-if="detailAlert.isolation"><dl class="rc-facts"><div class="rc-fact"><dt>Desired State</dt><dd>{{ detailAlert.isolation.desiredState }}</dd></div><div class="rc-fact"><dt>Actual State</dt><dd>{{ detailAlert.isolation.actualState }}</dd></div><div class="rc-fact"><dt>Scope／Version</dt><dd>{{ detailAlert.isolation.targetScope }} · v{{ detailAlert.isolation.version }}</dd></div><div class="rc-fact"><dt>Health Version／Time</dt><dd>{{ detailAlert.isolation.healthVerification.checkVersion }} · {{ formatDate(detailAlert.isolation.healthVerification.checkedAt) }}</dd></div><div class="rc-fact"><dt>Target／Window</dt><dd>{{ detailAlert.isolation.healthVerification.targetScope }} · {{ detailAlert.isolation.healthVerification.sampleWindow }}</dd></div><div class="rc-fact"><dt>Freshness／Result</dt><dd>{{ detailAlert.isolation.healthVerification.dataFreshness }} · {{ detailAlert.isolation.healthVerification.result }}</dd></div></dl><div v-if="detailAlert.isolation.healthVerification.failedItems.length" class="rc-gate" style="margin-top:.75rem">失敗項目：{{ detailAlert.isolation.healthVerification.failedItems.join('；') }}</div><p>{{ detailAlert.isolation.healthVerification.summary }} {{ display(detailAlert.isolation.failureReason) }}</p></template><div v-else class="rc-empty">沒有隔離物件；desired 與 actual 均不可自行推導。</div></section>
            <section class="rc-card rc-detail-section"><h3>具名守門 Waiver</h3><div v-if="detailAlert.namedWaivers.length" class="rc-evidence"><article v-for="waiver in detailAlert.namedWaivers" :key="waiver.waiverId" class="rc-evidence-item"><strong>{{ waiver.type }} · {{ waiver.target }}</strong><p>{{ waiver.reason }}<br>{{ waiver.grantedBy }} · {{ formatDate(waiver.grantedAt) }} · {{ waiver.permission }}</p><code class="rc-code">{{ waiver.waiverId }}</code></article></div><div v-else class="rc-empty">沒有具名 waiver；Job、Delivery 與 Isolation 必須各自通過。</div></section>
            <section class="rc-card rc-detail-section"><h3>GGAP Delivery 契約</h3><div class="rc-evidence"><article v-for="delivery in detailAlert.deliveries" :key="delivery.deliveryId" class="rc-evidence-item"><strong>{{ delivery.eventType }}</strong> <span :class="['rc-pill', `rc-pill--${delivery.status}`]">{{ delivery.status }}</span><p>{{ delivery.targetEnvironment }} · payload {{ delivery.payloadVersion }} · attempt {{ delivery.attempt }}<br>last sent {{ formatDate(delivery.lastSentAt) }} · ACK {{ formatDate(delivery.acknowledgedAt) }}<br>{{ display(delivery.protocolResult) }} · {{ delivery.reconciliationEvidence }}</p><code class="rc-code">{{ delivery.deliveryId }}<br>{{ delivery.idempotencyKey }}<br>{{ display(delivery.ggapTraceId) }}<br>{{ delivery.payloadSnapshot }}</code></article></div><div v-if="!detailAlert.deliveries.length" class="rc-empty">沒有必要投遞記錄；sent 也絕不視為 acknowledged。</div></section>
            <section v-if="detailEvent" class="rc-card rc-detail-section"><div class="rc-section-head"><h3>關聯 Game Round</h3><button class="rc-button" :disabled="!detailEvent.relatedRounds.length" @click="jumpToRound(detailAlert)">開啟回合查詢</button></div><div class="rc-evidence"><article v-for="round in detailEvent.relatedRounds" :key="round.providerRoundId" class="rc-evidence-item"><strong>{{ round.settledStatus }}</strong><code class="rc-code">{{ round.providerRoundId }}<br>{{ round.ggapRoundId }}</code><p>{{ formatDate(round.occurredAt) }}</p></article></div></section>
            <section class="rc-card rc-detail-section"><h3>Append-only Audit Timeline</h3><div class="rc-timeline"><article v-for="item in detailAlert.timeline" :key="item.auditId" :class="['rc-timeline-item', `is-${item.tone}`]"><time>{{ formatDate(item.occurredAt) }}</time><div><strong>{{ item.title }}</strong><p>{{ item.description }}</p><code class="rc-code">{{ item.actor }} · {{ item.requestId }} · {{ item.traceId }}</code></div></article></div></section>
        </div></aside></div>

        <div v-if="actionVisible && detailAlert" class="rc-modal-backdrop" @click.self="actionVisible = false"><section class="rc-card rc-modal"><p class="rc-eyebrow">Command · expected_version {{ versionSnapshot }}</p><h2>{{ actionLabels[command.action] }}</h2><p class="rc-muted">回應 accepted 只代表命令已接收，不代表 Job、副作用或 GGAP ACK 已成功。</p><div class="rc-form">
            <label class="rc-label">模擬結果<select v-model="command.outcome" class="rc-select"><option v-for="item in outcomes" :key="item.value" :value="item.value">{{ item.label }}</option></select></label>
            <label v-if="command.action === 'assign'" class="rc-label">負責人<select v-model="command.assigneeName" class="rc-select"><option v-for="name in assignees" :key="name">{{ name }}</option></select></label>
            <label v-if="command.action === 'move_to_monitoring'" class="rc-label">覆核期限<input v-model="command.reviewDueLocal" type="datetime-local" class="rc-input"></label>
            <label v-if="command.action === 'close'" class="rc-label">Resolution Code<select v-model="command.resolutionCode" class="rc-select"><option value="">請選擇</option><option v-for="(_, key) in resolutionCodeLabels" :key="key" :value="key">{{ resolutionCodeLabels[key] }}</option></select></label>
            <label class="rc-label">原因／備註<textarea v-model="command.reason" class="rc-input" placeholder="輸入可稽核的理由、觀察條件或交接說明"></textarea></label>
            <div v-if="command.action === 'close' && gatePreview.length" class="rc-gate"><strong>結案守門尚未通過</strong><ul><li v-for="failure in gatePreview" :key="failure">{{ failure }}</li></ul></div>
        </div><div class="rc-actions"><button class="rc-button" @click="actionVisible = false">取消</button><button class="rc-button rc-button--primary" @click="submitCommand">送出 Command</button></div></section></div>
    </main>
</template>

<style src="./risk-control.css"></style>
