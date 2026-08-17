<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { exportToCSV } from '@/utils/csvExport'
import {
    alertStatusLabels,
    anomalyLabels,
    detectionOutcomeLabels,
    environmentLabels,
    providerRiskState,
    riskEventStatusLabels,
    severityLabels,
    sourceLabels,
    useProviderRiskMock,
} from '@/mocks/providerRisk'
import type { ProviderEnvironment, RiskEvent, RiskEventStatus, RiskSeverity, RiskSource } from '@/types/providerRisk'

type QuickRange = '24h' | '72h' | '120h' | 'custom'
type Filters = {
    environment: ProviderEnvironment
    quickRange: QuickRange
    severity: RiskSeverity | ''
    status: RiskEventStatus | ''
    source: RiskSource | ''
    gameId: string
    riskEventId: string
    jobStatus: string
    desiredState: string
    actualState: string
    deliveryStatus: string
    providerRoundId: string
    ggapRoundId: string
}

const route = useRoute()
const router = useRouter()
const { getAlertForEvent } = useProviderRiskMock()
const timezoneLabel = 'UTC+08:00 · Asia/Taipei'
const rowsPerPage = 8
const page = ref(1)
const detailEvent = ref<RiskEvent | null>(null)
const detailVisible = ref(false)
const advancedVisible = ref(false)
const flash = ref('')
const initializing = ref(true)
const syncingRoute = ref(false)

const defaults: Filters = {
    environment: 'production', quickRange: '72h', severity: '', status: '', source: '', gameId: '', riskEventId: '',
    jobStatus: '', desiredState: '', actualState: '', deliveryStatus: '', providerRoundId: '', ggapRoundId: '',
}
const draft = reactive<Filters>({ ...defaults })
const applied = ref<Filters>({ ...defaults })

const quickRangeOptions: Array<{ value: QuickRange; label: string }> = [
    { value: '24h', label: '24 小時' }, { value: '72h', label: '72 小時' }, { value: '120h', label: '5 天' }, { value: 'custom', label: '自訂' },
]
const severityOptions: Array<{ value: RiskSeverity | ''; label: string }> = [
    { value: '', label: '全部嚴重度' }, { value: 'critical', label: '嚴重' }, { value: 'high', label: '高' }, { value: 'medium', label: '中' }, { value: 'low', label: '低' }, { value: 'info', label: '資訊' },
]
const statusOptions: Array<{ value: RiskEventStatus | ''; label: string }> = [
    { value: '', label: '全部事件狀態' }, { value: 'open', label: '異常中' }, { value: 'recovering', label: '恢復觀察中' }, { value: 'resolved', label: '已恢復' }, { value: 'invalidated', label: '已作廢' },
]

function cutoff(range: QuickRange) {
    if (range === 'custom') return null
    return new Date(Date.now() - Number(range.replace('h', '')) * 3_600_000)
}

const filteredEvents = computed(() => {
    const f = applied.value
    const earliest = cutoff(f.quickRange)
    return providerRiskState.riskEvents
        .filter((event) => event.environment === f.environment)
        .filter((event) => !earliest || event.lastDetectedAt >= earliest)
        .filter((event) => !f.severity || event.severity === f.severity)
        .filter((event) => !f.status || event.status === f.status)
        .filter((event) => !f.source || event.source === f.source)
        .filter((event) => !f.gameId || `${event.gameId} ${event.gameName} ${event.gameVersion}`.toLowerCase().includes(f.gameId.toLowerCase()))
        .filter((event) => !f.riskEventId || event.riskEventId.toLowerCase().includes(f.riskEventId.toLowerCase()))
        .filter((event) => {
            const alert = getAlertForEvent(event.riskEventId)
            return !f.jobStatus || Boolean(alert?.mitigationJobs.some((job) => job.status === f.jobStatus))
        })
        .filter((event) => !f.desiredState || getAlertForEvent(event.riskEventId)?.isolation?.desiredState === f.desiredState)
        .filter((event) => !f.actualState || getAlertForEvent(event.riskEventId)?.isolation?.actualState === f.actualState)
        .filter((event) => !f.deliveryStatus || Boolean(getAlertForEvent(event.riskEventId)?.deliveries.some((item) => item.status === f.deliveryStatus)))
        .filter((event) => !f.providerRoundId || event.relatedRounds.some((round) => round.providerRoundId.includes(f.providerRoundId)))
        .filter((event) => !f.ggapRoundId || event.relatedRounds.some((round) => round.ggapRoundId.includes(f.ggapRoundId)))
        .sort((a, b) => b.lastDetectedAt.getTime() - a.lastDetectedAt.getTime())
})

const pagedEvents = computed(() => filteredEvents.value.slice((page.value - 1) * rowsPerPage, page.value * rowsPerPage))
const pageCount = computed(() => Math.max(1, Math.ceil(filteredEvents.value.length / rowsPerPage)))
const detailAlert = computed(() => detailEvent.value ? getAlertForEvent(detailEvent.value.riskEventId) : null)
const environmentEvents = computed(() => providerRiskState.riskEvents.filter((event) => event.environment === applied.value.environment))
const summaries = computed(() => {
    const events = environmentEvents.value
    return [
        { key: 'all', label: 'Risk Event 總數', value: events.length, note: '事件是規則命中的證據容器' },
        { key: 'open', label: '異常中', value: events.filter((event) => event.status === 'open').length, note: '仍持續命中或等待恢復' },
        { key: 'recovering', label: '恢復觀察中', value: events.filter((event) => event.status === 'recovering').length, note: '恢復窗口尚未完整通過' },
        { key: 'ended', label: '已結束', value: events.filter((event) => ['resolved', 'invalidated'].includes(event.status)).length, note: 'Resolved + Invalidated 分開保留' },
        { key: 'high', label: '高風險 Active Alert', value: providerRiskState.alerts.filter((alert) => alert.environment === applied.value.environment && alert.status !== 'closed' && ['high', 'critical'].includes(alert.severity)).length, note: 'Alert 狀態不回寫 Event' },
    ]
})
const attentionEvents = computed(() => filteredEvents.value.filter((event) => ['critical', 'high'].includes(event.severity) || ['no_data', 'evaluation_failed'].includes(event.detection.outcome)).slice(0, 3))

function applyFilters() {
    applied.value = { ...draft }
    page.value = 1
}
function resetFilters() {
    Object.assign(draft, defaults, { environment: applied.value.environment })
    applyFilters()
}
function activateSummary(key: string) {
    draft.status = key === 'open' || key === 'recovering' ? key : ''
    draft.severity = key === 'high' ? 'high' : ''
    applyFilters()
}
function openDetail(event: RiskEvent) {
    detailEvent.value = event
    detailVisible.value = true
    void router.replace({ query: { ...route.query, environment: event.environment, risk_event_id: event.riskEventId } })
}
function closeDetail() {
    detailVisible.value = false
    void router.replace({ query: { ...route.query, risk_event_id: undefined } })
}
function jumpToAlert(event: RiskEvent) {
    const alert = getAlertForEvent(event.riskEventId)
    if (!alert) return
    void router.push({ path: '/monitoring/alerts', query: { environment: event.environment, risk_event_id: event.riskEventId, alert_id: alert.alertId } })
}
function jumpToRound(event: RiskEvent) {
    const round = event.relatedRounds[0]
    if (!round) return
    void router.push({ path: '/reports/provider-game-rounds', query: { environment: event.environment, provider_game_round_id: round.providerRoundId, ggap_round_id: round.ggapRoundId } })
}
function exportCsv() {
    exportToCSV(filteredEvents.value.map((event) => {
        const alert = getAlertForEvent(event.riskEventId)
        return {
            riskEventId: event.riskEventId, fingerprint: event.eventFingerprint, recurrenceGroupId: event.recurrenceGroupId ?? '', environment: event.environment,
            game: `${event.gameName} ${event.gameVersion}`, source: event.source, severity: event.severity, eventStatus: event.status,
            detectionOutcome: event.detection.outcome, occurrenceCount: event.occurrenceCount, alertId: alert?.alertId ?? '', alertStatus: alert?.status ?? '',
            isolationDesired: alert?.isolation?.desiredState ?? '', isolationActual: alert?.isolation?.actualState ?? '', delivery: alert?.deliveries.at(-1)?.status ?? '',
        }
    }), `provider-risk-events-${applied.value.environment}`, {
        riskEventId: 'Risk Event ID', fingerprint: '事件指紋', recurrenceGroupId: '復發群組', environment: '環境', game: '遊戲／版本', source: '來源', severity: '嚴重度', eventStatus: 'Event 狀態', detectionOutcome: 'Detection 結果', occurrenceCount: '發生次數', alertId: 'Alert ID', alertStatus: 'Alert 狀態', isolationDesired: '隔離期望', isolationActual: '隔離實際', delivery: 'GGAP Delivery',
    })
    flash.value = `已匯出 ${filteredEvents.value.length} 筆目前篩選結果。`
}

function formatDate(value: Date | null) {
    return value ? new Intl.DateTimeFormat('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(value) : '—'
}
function display(value: string | number | null | undefined) { return value === null || value === undefined || value === '' ? '—' : String(value) }
function affectedRoundsLabel(event: RiskEvent) { return ['no_data', 'insufficient_sample', 'evaluation_failed'].includes(event.detection.outcome) ? '無資料' : String(event.affectedRounds) }
function latestJob(event: RiskEvent) { return getAlertForEvent(event.riskEventId)?.mitigationJobs.at(-1) ?? null }
function latestDelivery(event: RiskEvent) { return getAlertForEvent(event.riskEventId)?.deliveries.at(-1) ?? null }

async function syncFromRoute() {
    syncingRoute.value = true
    const queryEnvironment = route.query.environment
    applyFilters()
    const id = typeof route.query.risk_event_id === 'string' ? route.query.risk_event_id : ''
    const event = id ? providerRiskState.riskEvents.find((item) => item.riskEventId === id) : null
    const environment = event?.environment ?? (queryEnvironment === 'production' || queryEnvironment === 'demo' ? queryEnvironment : draft.environment)
    draft.environment = environment
    applyFilters()
    if (id) {
        if (event) { detailEvent.value = event; detailVisible.value = true }
        else flash.value = `找不到 Risk Event ${id}，可能不屬於目前 Provider。`
    } else detailVisible.value = false
    await nextTick()
    syncingRoute.value = false
}

onMounted(async () => {
    await syncFromRoute()
    initializing.value = false
})
watch(() => [route.query.environment, route.query.risk_event_id], () => { if (!initializing.value) void syncFromRoute() })
watch(() => draft.environment, () => {
    if (initializing.value || syncingRoute.value) return
    applyFilters()
    detailVisible.value = false
    void router.replace({ query: { environment: draft.environment } })
})
watch(pageCount, (count) => { if (page.value > count) page.value = count })
</script>

<template>
    <main class="rc-page rc-stack">
        <header class="rc-header">
            <div><p class="rc-eyebrow">Monitoring / Risk Events</p><h1>風險事件報告</h1><p class="rc-subtitle">以 Risk Event 為主體，保留偵測證據、復發關聯與下游 Alert／Job／隔離／GGAP Delivery 的獨立狀態。</p></div>
            <div class="rc-actions"><button class="rc-button" @click="exportCsv">匯出 CSV</button><button class="rc-button" @click="providerRiskState.lastUpdatedAt = new Date()">重新整理</button></div>
        </header>

        <div class="rc-mock-banner"><span>MOCK</span><div><strong>Decision Pack 02 模擬資料</strong><br>僅含 Provider 自有遊戲服務、Game Round、Game Math、Data Quality 與 GGAP 直接對接；Test 不會進入任何聚合。</div></div>
        <div v-if="flash" class="rc-flash">{{ flash }}</div>

        <section class="rc-card rc-control-card">
            <div class="rc-control-row">
                <div class="rc-inline"><strong>環境</strong><div class="rc-segment"><button :class="{ 'is-active': draft.environment === 'production' }" @click="draft.environment = 'production'">正式環境</button><button :class="{ 'is-active': draft.environment === 'demo' }" @click="draft.environment = 'demo'">DEMO</button></div></div>
                <div class="rc-inline"><span class="rc-muted">時間</span><div class="rc-segment"><button v-for="option in quickRangeOptions" :key="option.value" :class="{ 'is-active': draft.quickRange === option.value }" @click="draft.quickRange = option.value; applyFilters()">{{ option.label }}</button></div></div>
                <span class="rc-muted">{{ timezoneLabel }} · {{ formatDate(providerRiskState.lastUpdatedAt) }}</span>
            </div>
        </section>

        <section class="rc-summary-grid" aria-label="風險事件摘要">
            <button v-for="item in summaries" :key="item.key" class="rc-card rc-summary" @click="activateSummary(item.key)"><span class="rc-summary-label">{{ item.label }}</span><div class="rc-summary-value">{{ item.value }}</div><div class="rc-summary-note">{{ item.note }}</div></button>
        </section>

        <section v-if="attentionEvents.length" class="rc-card rc-card-body">
            <div class="rc-section-head"><div><p class="rc-eyebrow">Needs attention</p><h2>優先檢視</h2></div><span class="rc-muted">高嚴重度與資料品質異常</span></div>
            <div class="rc-attention"><button v-for="event in attentionEvents" :key="event.riskEventId" class="rc-attention-item" @click="openDetail(event)"><span><span :class="['rc-pill', `rc-pill--${event.severity}`]">{{ severityLabels[event.severity] }}</span> <span :class="['rc-pill', `rc-pill--${event.detection.outcome}`]">{{ detectionOutcomeLabels[event.detection.outcome] }}</span></span><span class="rc-attention-title">{{ anomalyLabels[event.anomalyType] }} · {{ event.gameName }}</span><code class="rc-code">{{ event.riskEventId }}</code></button></div>
        </section>

        <section class="rc-card">
            <div class="rc-card-body rc-stack">
                <div class="rc-section-head"><div><p class="rc-eyebrow">Filters</p><h2>事件篩選</h2></div><button class="rc-link" @click="advancedVisible = !advancedVisible">{{ advancedVisible ? '收合進階條件' : '展開進階條件' }}</button></div>
                <div class="rc-filters">
                    <label class="rc-label">嚴重度<select v-model="draft.severity" class="rc-select"><option v-for="option in severityOptions" :key="option.value" :value="option.value">{{ option.label }}</option></select></label>
                    <label class="rc-label">Event 狀態<select v-model="draft.status" class="rc-select"><option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option></select></label>
                    <label class="rc-label">來源<select v-model="draft.source" class="rc-select"><option value="">全部來源</option><option v-for="(_, key) in sourceLabels" :key="key" :value="key">{{ sourceLabels[key] }}</option></select></label>
                    <label class="rc-label">遊戲／版本<input v-model="draft.gameId" class="rc-input" placeholder="名稱、ID 或版本"></label>
                    <label class="rc-label">Risk Event ID<input v-model="draft.riskEventId" class="rc-input" placeholder="rsk_evt_..."></label>
                </div>
                <div v-if="advancedVisible" class="rc-filters">
                    <label class="rc-label">Job 狀態<select v-model="draft.jobStatus" class="rc-select"><option value="">全部</option><option v-for="value in ['queued','running','succeeded','failed','cancelled']" :key="value">{{ value }}</option></select></label>
                    <label class="rc-label">隔離期望<select v-model="draft.desiredState" class="rc-select"><option value="">全部</option><option value="not_isolated">not_isolated</option><option value="isolated">isolated</option></select></label>
                    <label class="rc-label">隔離實際<select v-model="draft.actualState" class="rc-select"><option value="">全部</option><option v-for="value in ['not_isolated','applying','isolated','releasing','failed']" :key="value">{{ value }}</option></select></label>
                    <label class="rc-label">GGAP Delivery<select v-model="draft.deliveryStatus" class="rc-select"><option value="">全部</option><option v-for="value in ['pending','sending','sent','acknowledged','failed']" :key="value">{{ value }}</option></select></label>
                    <label class="rc-label">Provider Round ID<input v-model="draft.providerRoundId" class="rc-input" placeholder="prv_rnd_..."></label>
                    <label class="rc-label">GGAP Round ID<input v-model="draft.ggapRoundId" class="rc-input" placeholder="ggap_rnd_..."></label>
                </div>
                <div class="rc-actions"><button class="rc-button rc-button--primary" @click="applyFilters">套用篩選</button><button class="rc-button" @click="resetFilters">重設</button></div>
            </div>

            <div class="rc-table-wrap">
                <table class="rc-table"><thead><tr><th>嚴重度</th><th>Risk Event</th><th>偵測／最近發生</th><th>環境</th><th>遊戲／版本</th><th>來源／異常</th><th>Detection</th><th>Event 狀態</th><th>影響回合</th><th>Alert</th><th>Job</th><th>隔離 期望／實際</th><th>GGAP Delivery</th><th>更新時間</th></tr></thead>
                    <tbody><tr v-for="event in pagedEvents" :key="event.riskEventId" @click="openDetail(event)"><td><span :class="['rc-pill', `rc-pill--${event.severity}`]">{{ severityLabels[event.severity] }}</span></td><td><code>{{ event.riskEventId }}</code><span class="rc-secondary">{{ event.eventFingerprint }} · ×{{ event.occurrenceCount }}</span></td><td>{{ formatDate(event.detectedAt) }}<span class="rc-secondary">{{ formatDate(event.lastDetectedAt) }}</span></td><td>{{ environmentLabels[event.environment] }}</td><td><span class="rc-primary">{{ event.gameName }}</span><span class="rc-secondary">{{ event.gameId }} · {{ event.gameVersion }}</span></td><td>{{ sourceLabels[event.source] }}<span class="rc-secondary">{{ anomalyLabels[event.anomalyType] }}</span></td><td><span :class="['rc-pill', `rc-pill--${event.detection.outcome}`]">{{ detectionOutcomeLabels[event.detection.outcome] }}</span></td><td><span :class="['rc-pill', `rc-pill--${event.status}`]">{{ riskEventStatusLabels[event.status] }}</span></td><td>{{ affectedRoundsLabel(event) }}</td><td><template v-if="getAlertForEvent(event.riskEventId)"><code>{{ getAlertForEvent(event.riskEventId)?.alertId }}</code><span class="rc-secondary">{{ alertStatusLabels[getAlertForEvent(event.riskEventId)!.status] }}</span></template><span v-else>—</span></td><td><span v-if="latestJob(event)" :class="['rc-pill', `rc-pill--${latestJob(event)?.status}`]">{{ latestJob(event)?.status }}</span><span v-else>—</span></td><td><template v-if="getAlertForEvent(event.riskEventId)?.isolation"><span class="rc-secondary">D {{ getAlertForEvent(event.riskEventId)?.isolation?.desiredState }}</span><span class="rc-secondary">A {{ getAlertForEvent(event.riskEventId)?.isolation?.actualState }}</span></template><span v-else>—</span></td><td><span v-if="latestDelivery(event)" :class="['rc-pill', `rc-pill--${latestDelivery(event)?.status}`]">{{ latestDelivery(event)?.status }}</span><span v-else>—</span></td><td>{{ formatDate(event.updatedAt) }}</td></tr></tbody>
                </table><div v-if="!pagedEvents.length" class="rc-empty">目前篩選沒有 Risk Event。no_data 不會顯示成健康或 0。</div>
            </div>
            <div class="rc-pagination"><span>共 {{ filteredEvents.length }} 筆 · 第 {{ page }} / {{ pageCount }} 頁</span><button class="rc-button" :disabled="page === 1" @click="page--">上一頁</button><button class="rc-button" :disabled="page === pageCount" @click="page++">下一頁</button></div>
        </section>

        <div v-if="detailVisible && detailEvent" class="rc-drawer-backdrop" @click.self="closeDetail">
            <aside class="rc-drawer" aria-label="Risk Event 詳情">
                <header class="rc-drawer-head"><div><p class="rc-eyebrow">Risk Event evidence</p><h2>{{ anomalyLabels[detailEvent.anomalyType] }}</h2><code class="rc-code">{{ detailEvent.riskEventId }}</code></div><button class="rc-button" @click="closeDetail">關閉</button></header>
                <div class="rc-drawer-body">
                    <section class="rc-card rc-detail-section"><div class="rc-section-head"><h3>事件識別與生命週期</h3><span :class="['rc-pill', `rc-pill--${detailEvent.status}`]">{{ riskEventStatusLabels[detailEvent.status] }}</span></div><dl class="rc-facts"><div class="rc-fact"><dt>Event Fingerprint</dt><dd>{{ detailEvent.eventFingerprint }}</dd></div><div class="rc-fact"><dt>復發群組</dt><dd>{{ display(detailEvent.recurrenceGroupId) }}</dd></div><div class="rc-fact"><dt>發生次數</dt><dd>{{ detailEvent.occurrenceCount }}</dd></div><div class="rc-fact"><dt>首次偵測</dt><dd>{{ formatDate(detailEvent.firstDetectedAt) }}</dd></div><div class="rc-fact"><dt>最近命中</dt><dd>{{ formatDate(detailEvent.lastDetectedAt) }}</dd></div><div class="rc-fact"><dt>作廢證據</dt><dd>{{ display(detailEvent.invalidationReason) }}</dd></div></dl></section>
                    <section class="rc-card rc-detail-section"><h3>Signal → Detection Result</h3><div class="rc-evidence"><article v-for="signal in detailEvent.signals" :key="signal.signalId" class="rc-evidence-item"><strong>{{ signal.metric }}</strong><span :class="['rc-pill', `rc-pill--${signal.outcome}`]">{{ detectionOutcomeLabels[signal.outcome] }}</span><p>{{ display(signal.value) }} {{ signal.unit }} · {{ signal.dataFreshness }}</p><code class="rc-code">{{ signal.signalId }}</code></article><article class="rc-evidence-item"><strong>{{ detailEvent.detection.ruleName }}</strong><span :class="['rc-pill', `rc-pill--${detailEvent.detection.outcome}`]">{{ detectionOutcomeLabels[detailEvent.detection.outcome] }}</span><p>{{ detailEvent.detection.evidenceSummary }}</p><p>actual {{ display(detailEvent.detection.actualValue) }} · trigger {{ detailEvent.detection.triggerThreshold }} · recovery {{ detailEvent.detection.recoveryThreshold }}</p><code class="rc-code">{{ detailEvent.detection.ruleId }}@{{ detailEvent.detection.ruleVersion }} · {{ detailEvent.detection.detectionResultId }}</code></article></div></section>
                    <section v-if="detailAlert" class="rc-card rc-detail-section"><div class="rc-section-head"><h3>Alert／Job／隔離／Delivery</h3><button class="rc-button rc-button--primary" @click="jumpToAlert(detailEvent)">前往 Alert 工作台</button></div><dl class="rc-facts"><div class="rc-fact"><dt>Alert</dt><dd>{{ detailAlert.alertId }} · {{ alertStatusLabels[detailAlert.status] }}</dd></div><div class="rc-fact"><dt>Assignee / Waiting</dt><dd>{{ display(detailAlert.assigneeName) }} / {{ display(detailAlert.waitingReason) }}</dd></div><div class="rc-fact"><dt>Resolution Code</dt><dd>{{ display(detailAlert.resolutionCode) }}</dd></div><div class="rc-fact"><dt>Isolation Desired</dt><dd>{{ display(detailAlert.isolation?.desiredState) }}</dd></div><div class="rc-fact"><dt>Isolation Actual</dt><dd>{{ display(detailAlert.isolation?.actualState) }}</dd></div><div class="rc-fact"><dt>Health</dt><dd>{{ display(detailAlert.isolation?.healthVerification.result) }} · {{ display(detailAlert.isolation?.healthVerification.dataFreshness) }}</dd></div></dl><div class="rc-evidence" style="margin-top:.75rem"><article v-for="job in detailAlert.mitigationJobs" :key="job.mitigationJobId" class="rc-evidence-item"><strong>Job · {{ job.actionType }}</strong><span :class="['rc-pill', `rc-pill--${job.status}`]">{{ job.status }}</span><p>{{ job.targetScope }} · attempt {{ job.attempt }}<br>{{ job.beforeState }} → {{ display(job.afterState) }}<br>{{ display(job.result || job.error) }}</p><code class="rc-code">{{ job.mitigationJobId }} · {{ job.idempotencyKey }} · {{ job.traceId }}</code></article><article v-for="delivery in detailAlert.deliveries" :key="delivery.deliveryId" class="rc-evidence-item"><strong>GGAP Delivery · {{ delivery.eventType }}</strong><span :class="['rc-pill', `rc-pill--${delivery.status}`]">{{ delivery.status }}</span><p>attempt {{ delivery.attempt }} · sent {{ formatDate(delivery.lastSentAt) }} · ACK {{ formatDate(delivery.acknowledgedAt) }}<br>{{ display(delivery.protocolResult) }} · {{ delivery.reconciliationEvidence }}</p><code class="rc-code">{{ delivery.deliveryId }} · {{ display(delivery.ggapTraceId) }}<br>{{ delivery.payloadSnapshot }}</code></article></div></section>
                    <section class="rc-card rc-detail-section"><div class="rc-section-head"><h3>關聯 Game Round</h3><button class="rc-button" :disabled="!detailEvent.relatedRounds.length" @click="jumpToRound(detailEvent)">開啟回合查詢</button></div><div class="rc-evidence"><article v-for="round in detailEvent.relatedRounds" :key="round.providerRoundId" class="rc-evidence-item"><strong>{{ round.settledStatus }}</strong><code class="rc-code">Provider {{ round.providerRoundId }}<br>GGAP {{ round.ggapRoundId }}</code><p>{{ formatDate(round.occurredAt) }}</p></article></div><div v-if="!detailEvent.relatedRounds.length" class="rc-empty">沒有關聯回合；不以 0 取代資料缺失。</div></section>
                    <section class="rc-card rc-detail-section"><h3>Append-only Audit Timeline</h3><div class="rc-timeline"><article v-for="item in detailEvent.timeline" :key="item.auditId" :class="['rc-timeline-item', `is-${item.tone}`]"><time>{{ formatDate(item.occurredAt) }}</time><div><strong>{{ item.title }}</strong><p>{{ item.description }}</p><code class="rc-code">{{ item.actor }} · {{ item.requestId }} · {{ item.traceId }}</code></div></article></div></section>
                </div>
            </aside>
        </div>
    </main>
</template>

<style src="./risk-control.css"></style>
