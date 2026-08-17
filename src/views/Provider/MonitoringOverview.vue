<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
import type { DetectionOutcome, MonitoringGame, MonitoringState, ProviderEnvironment, ProviderGameType } from '@/types/providerRisk'

type QuickRange = '1h' | '6h' | '24h' | 'custom'
type FocusKey = 'service' | 'round' | 'ggap' | 'high_alert' | 'unresolved' | ''
type MonitoringFilters = {
    environment: ProviderEnvironment
    quickRange: QuickRange
    customStart: string
    customEnd: string
    gameType: ProviderGameType | ''
    game: string
    state: MonitoringState | ''
    scenario: 'contract' | 'empty'
}
type PeriodRound = { success: number | null; failed: number | null; timeout: number | null; processing: number | null; dataOutcome: DetectionOutcome }
type PeriodGgap = { p50: number | null; p95: number | null; p99: number | null; timeouts: number | null; failures: number | null; retries: number | null; dataOutcome: DetectionOutcome }
type DisplayGame = MonitoringGame & { periodRound: PeriodRound; periodGgap: PeriodGgap; periodLatencySamples: number[] }
const route = useRoute()
const router = useRouter()
const { getRiskEvent, getAlertForEvent, refresh } = useProviderRiskMock()
const timezoneLabel = 'UTC+08:00 · Asia/Taipei'
const selectedGame = ref<DisplayGame | null>(null)
const detailVisible = ref(false)
const focus = ref<FocusKey>('')
const autoRefresh = ref(true)
const flash = ref('')
const flashError = ref(false)
const initializing = ref(true)
const syncingRoute = ref(false)
let timer: number | null = null

function toLocalInput(value: Date) {
    const offset = value.getTimezoneOffset() * 60_000
    return new Date(value.getTime() - offset).toISOString().slice(0, 16)
}
function makeDefaults(environment: ProviderEnvironment = 'production'): MonitoringFilters {
    const end = new Date()
    return {
        environment,
        quickRange: '24h',
        customStart: toLocalInput(new Date(end.getTime() - 24 * 3_600_000)),
        customEnd: toLocalInput(end),
        gameType: '', game: '', state: '', scenario: 'contract',
    }
}
const draftFilters = reactive<MonitoringFilters>(makeDefaults())
const appliedFilters = ref<MonitoringFilters>(makeDefaults())
const stateLabels: Record<MonitoringState, string> = {
    healthy: '健康', degraded: '降級', critical: '嚴重異常', isolated: '隔離中', no_data: '無資料', maintenance: '維護中',
}
const gameTypeLabels: Record<ProviderGameType, string> = { slots: '老虎機', crash: '碰撞遊戲', table: '棋牌遊戲' }

function timeBounds(filters: MonitoringFilters) {
    const end = filters.quickRange === 'custom' ? new Date(filters.customEnd) : new Date()
    const start = filters.quickRange === 'custom'
        ? new Date(filters.customStart)
        : new Date(end.getTime() - Number(filters.quickRange.replace('h', '')) * 3_600_000)
    return { start, end }
}
function validateTime(filters: MonitoringFilters) {
    if (filters.quickRange !== 'custom') return ''
    const { start, end } = timeBounds(filters)
    const now = new Date()
    if (!filters.customStart || !filters.customEnd || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '請完整填寫自訂時間的開始與結束。'
    if (start >= end) return '開始時間必須早於結束時間。'
    if (start > now || end > now) return '自訂時間不可包含未來時間。'
    if (end.getTime() - start.getTime() > 7 * 24 * 3_600_000) return '自訂分析時間不可超過 7 日。'
    return ''
}
function percentile(values: number[], percentage: number) {
    if (!values.length) return null
    const sorted = [...values].sort((a, b) => a - b)
    return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * percentage) - 1)]
}
function aggregateGame(game: MonitoringGame): DisplayGame {
    const { start, end } = timeBounds(appliedFilters.value)
    const buckets = game.periodBuckets.filter((bucket) => bucket.endedAt > start && bucket.startedAt < end)
    const roundBuckets = buckets.filter((bucket) => bucket.round.success !== null && bucket.round.failed !== null && bucket.round.timeout !== null)
    const ggapBuckets = buckets.filter((bucket) => bucket.ggap.latencySamples.length > 0)
    const sumRound = (key: 'success' | 'failed' | 'timeout' | 'processing') => roundBuckets.length
        ? roundBuckets.reduce((total, bucket) => total + (bucket.round[key] ?? 0), 0)
        : null
    const sumGgap = (key: 'timeouts' | 'failures' | 'retries') => ggapBuckets.length
        ? ggapBuckets.reduce((total, bucket) => total + (bucket.ggap[key] ?? 0), 0)
        : null
    const samples = ggapBuckets.flatMap((bucket) => bucket.ggap.latencySamples)
    return {
        ...game,
        periodRound: {
            success: sumRound('success'), failed: sumRound('failed'), timeout: sumRound('timeout'), processing: sumRound('processing'),
            dataOutcome: roundBuckets.length ? game.round.dataOutcome : game.round.dataOutcome === 'not_matched' ? 'no_data' : game.round.dataOutcome,
        },
        periodGgap: {
            p50: percentile(samples, .5), p95: percentile(samples, .95), p99: percentile(samples, .99),
            timeouts: sumGgap('timeouts'), failures: sumGgap('failures'), retries: sumGgap('retries'),
            dataOutcome: ggapBuckets.length ? game.ggap.dataOutcome : game.ggap.dataOutcome === 'not_matched' ? 'no_data' : game.ggap.dataOutcome,
        },
        periodLatencySamples: samples,
    }
}

const scopedGames = computed(() => {
    const filters = appliedFilters.value
    if (filters.scenario === 'empty') return []
    return providerRiskState.monitoringGames
        .filter((game) => game.environment === filters.environment)
        .filter((game) => !filters.gameType || game.gameType === filters.gameType)
        .filter((game) => !filters.game || `${game.gameName} ${game.gameId} ${game.gameVersion}`.toLowerCase().includes(filters.game.toLowerCase()))
})
const periodGames = computed(() => scopedGames.value.map(aggregateGame))
const scopedRiskEventIds = computed(() => new Set(scopedGames.value.flatMap((game) => game.riskEventIds)))
const visibleGames = computed(() => periodGames.value
        .filter((game) => !appliedFilters.value.state || game.state === appliedFilters.value.state)
        .filter((game) => {
            if (!focus.value) return true
            if (focus.value === 'service') return !['healthy', 'maintenance'].includes(game.state)
            if (focus.value === 'round') return game.periodRound.dataOutcome !== 'not_matched' || (game.periodRound.failed ?? 0) > 0 || (game.periodRound.timeout ?? 0) > 0
            if (focus.value === 'ggap') return game.periodGgap.dataOutcome !== 'not_matched' || (game.periodGgap.failures ?? 0) > 0 || (game.periodGgap.timeouts ?? 0) > 0
            const events = game.riskEventIds.map(getRiskEvent).filter(Boolean)
            if (focus.value === 'unresolved') return events.some((event) => event && ['open', 'recovering'].includes(event.status))
            return events.some((event) => {
                if (!event || !['critical', 'high'].includes(event.severity)) return false
                const alert = getAlertForEvent(event.riskEventId)
                return alert && alert.status !== 'closed'
            })
        }))

const activeAlerts = computed(() => providerRiskState.alerts.filter((alert) => alert.environment === appliedFilters.value.environment && alert.status !== 'closed' && scopedRiskEventIds.value.has(alert.riskEventId)))
const unresolvedEvents = computed(() => providerRiskState.riskEvents.filter((event) => event.environment === appliedFilters.value.environment && scopedRiskEventIds.value.has(event.riskEventId) && ['open', 'recovering'].includes(event.status)))
const summaries = computed(() => {
    if (appliedFilters.value.scenario === 'empty') return [
        { key: 'service' as FocusKey, label: '服務健康', value: '無資料', note: 'no_data 不顯示為健康' },
        { key: 'round' as FocusKey, label: '回合成功率', value: '無資料', note: '沒有足夠有效樣本' },
        { key: 'ggap' as FocusKey, label: 'GGAP P95', value: '無資料', note: '直接對接資料不可用' },
        { key: 'high_alert' as FocusKey, label: '高風險告警', value: '無資料', note: '不可解讀為 0' },
        { key: 'unresolved' as FocusKey, label: '未解決事件', value: '無資料', note: '不可解讀為 0' },
    ]
    const expected = periodGames.value.filter((game) => game.expectedService)
    const healthy = expected.filter((game) => game.state === 'healthy').length
    const roundEligible = expected.filter((game) => game.periodRound.success !== null && game.periodRound.failed !== null && game.periodRound.timeout !== null)
    const roundSuccess = roundEligible.reduce((sum, game) => sum + (game.periodRound.success ?? 0), 0)
    const roundTotal = roundEligible.reduce((sum, game) => sum + (game.periodRound.success ?? 0) + (game.periodRound.failed ?? 0) + (game.periodRound.timeout ?? 0), 0)
    const overallLatencySamples = periodGames.value.flatMap((game) => game.periodLatencySamples)
    const overallP50 = percentile(overallLatencySamples, .5)
    const overallP95 = percentile(overallLatencySamples, .95)
    const overallP99 = percentile(overallLatencySamples, .99)
    const overallTimeouts = periodGames.value.reduce((total, game) => total + (game.periodGgap.timeouts ?? 0), 0)
    const overallFailures = periodGames.value.reduce((total, game) => total + (game.periodGgap.failures ?? 0), 0)
    return [
        { key: 'service' as FocusKey, label: '服務健康', value: `${healthy} / ${expected.length}`, note: `${expected.filter((game) => game.state === 'no_data').length} 個 no_data，未計為健康` },
        { key: 'round' as FocusKey, label: '回合成功率', value: roundTotal ? `${(roundSuccess / roundTotal * 100).toFixed(2)}%` : '無資料', note: `${roundEligible.length} 個具有效樣本的服務` },
        { key: 'ggap' as FocusKey, label: 'GGAP P95', value: overallP95 === null ? '無資料' : `${overallP95} ms`, note: overallP95 === null ? '目前範圍沒有成功回應樣本' : `整體 P50 ${overallP50} · P99 ${overallP99} · 逾時 ${overallTimeouts}／失敗 ${overallFailures}` },
        { key: 'high_alert' as FocusKey, label: '高風險告警', value: activeAlerts.value.filter((alert) => ['critical', 'high'].includes(alert.severity)).length, note: 'new + in_progress + monitoring' },
        { key: 'unresolved' as FocusKey, label: '未解決事件', value: unresolvedEvents.value.length, note: 'open + recovering' },
    ]
})

const detailEvents = computed(() => selectedGame.value?.riskEventIds.map(getRiskEvent).filter((event) => event !== null) ?? [])
function roundRate(game: DisplayGame) {
    if (game.periodRound.success === null || game.periodRound.failed === null || game.periodRound.timeout === null) return null
    const total = game.periodRound.success + game.periodRound.failed + game.periodRound.timeout
    return total ? `${(game.periodRound.success / total * 100).toFixed(2)}%` : null
}
function activateSummary(key: FocusKey) { focus.value = focus.value === key ? '' : key }
async function replaceMonitoringRoute(query: { environment: ProviderEnvironment; game_id?: string }) {
    syncingRoute.value = true
    try {
        await router.replace({ query })
        await nextTick()
    } finally {
        syncingRoute.value = false
    }
}
function openDetail(game: DisplayGame) {
    selectedGame.value = game; detailVisible.value = true
    void replaceMonitoringRoute({ environment: game.environment, game_id: game.gameId })
}
function closeDetail() {
    detailVisible.value = false
    void replaceMonitoringRoute({ environment: appliedFilters.value.environment })
}
function jumpToEvent(riskEventId: string) { void router.push({ path: '/monitoring/risk-reports', query: { environment: appliedFilters.value.environment, risk_event_id: riskEventId } }) }
function jumpToAlert(riskEventId: string) {
    const alert = getAlertForEvent(riskEventId)
    if (alert) void router.push({ path: '/monitoring/alerts', query: { environment: appliedFilters.value.environment, risk_event_id: riskEventId, alert_id: alert.alertId } })
}
function jumpToRound(game: DisplayGame) {
    if (!game.providerRoundId) return
    void router.push({ path: '/reports/provider-game-rounds', query: { environment: game.environment, provider_game_round_id: game.providerRoundId } })
}
function formatDate(value: Date | null | undefined) { return value ? new Intl.DateTimeFormat('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(value) : '—' }
function display(value: string | number | null | undefined) { return value === null || value === undefined || value === '' ? '無資料' : String(value) }
function applyFilters() {
    const error = validateTime(draftFilters)
    if (error) { flash.value = error; flashError.value = true; return false }
    appliedFilters.value = { ...draftFilters }
    focus.value = ''
    flash.value = `已查詢 ${draftFilters.quickRange === 'custom' ? '自訂時間' : draftFilters.quickRange} 期間統計。`
    flashError.value = false
    const selected = selectedGame.value && providerRiskState.monitoringGames.find((game) =>
        game.environment === draftFilters.environment
        && game.gameId === selectedGame.value?.gameId
        && draftFilters.scenario === 'contract'
        && (!draftFilters.gameType || game.gameType === draftFilters.gameType)
        && (!draftFilters.game || `${game.gameName} ${game.gameId} ${game.gameVersion}`.toLowerCase().includes(draftFilters.game.toLowerCase()))
        && (!draftFilters.state || game.state === draftFilters.state),
    )
    if (selected) selectedGame.value = aggregateGame(selected)
    else detailVisible.value = false
    void replaceMonitoringRoute({ environment: draftFilters.environment, game_id: selected ? selected.gameId : undefined })
    return true
}
function resetFilters() {
    selectedGame.value = null
    detailVisible.value = false
    Object.assign(draftFilters, makeDefaults('production'))
    applyFilters()
}
function configureTimer() {
    if (timer !== null) window.clearInterval(timer)
    timer = autoRefresh.value ? window.setInterval(refresh, 30_000) : null
}

async function syncFromRoute() {
    syncingRoute.value = true
    try {
        const queryEnvironment = route.query.environment
        const environment = queryEnvironment === 'production' || queryEnvironment === 'demo' ? queryEnvironment : 'production'
        const gameId = typeof route.query.game_id === 'string' ? route.query.game_id : ''
        Object.assign(draftFilters, makeDefaults(environment))
        appliedFilters.value = { ...draftFilters }
        if (gameId) {
            const game = providerRiskState.monitoringGames.find((item) => item.environment === environment && item.gameId === gameId)
            if (game) { selectedGame.value = aggregateGame(game); detailVisible.value = true }
            else { flash.value = `找不到遊戲 ${gameId}，可能不屬於目前 Provider／環境。`; flashError.value = true }
        } else detailVisible.value = false
        await nextTick()
    } finally {
        syncingRoute.value = false
    }
}

onMounted(async () => {
    await syncFromRoute()
    configureTimer()
    initializing.value = false
})
onBeforeUnmount(() => { if (timer !== null) window.clearInterval(timer) })
watch(autoRefresh, configureTimer)
watch(() => [route.query.environment, route.query.game_id], () => { if (!initializing.value && !syncingRoute.value) void syncFromRoute() })
</script>

<template>
    <main class="rc-page rc-stack">
        <header class="rc-header"><div><p class="rc-eyebrow">Monitoring overview</p><h1>監控總覽</h1><p class="rc-subtitle">只讀檢視 Provider 自有服務、Game Round、數值／資料品質與 GGAP 直接對接；所有狀態皆可追溯到 Signal 與 Detection Result。</p></div><button class="rc-button" @click="refresh">立即更新</button></header>
        <div class="rc-mock-banner"><span>READ ONLY</span><div><strong>{{ providerRiskState.mockLabel }}</strong><br>Production 與 DEMO 完全分離，Test 永久排除；no_data／insufficient_sample／evaluation_failed 不會顯示為健康或 0。</div></div>
        <div v-if="flash" :class="['rc-flash', { 'is-error': flashError }]">{{ flash }}</div>

        <section class="rc-card rc-control-card rc-stack">
            <div class="rc-control-row"><div class="rc-inline"><strong>環境</strong><div class="rc-segment"><button :class="{ 'is-active': draftFilters.environment === 'production' }" @click="draftFilters.environment = 'production'">正式環境</button><button :class="{ 'is-active': draftFilters.environment === 'demo' }" @click="draftFilters.environment = 'demo'">DEMO</button></div></div><div class="rc-inline"><span class="rc-muted">分析時間</span><div class="rc-segment"><button v-for="item in [{ value: '1h', label: '近 1 小時' }, { value: '6h', label: '近 6 小時' }, { value: '24h', label: '近 24 小時' }, { value: 'custom', label: '自訂' }]" :key="item.value" :class="{ 'is-active': draftFilters.quickRange === item.value }" @click="draftFilters.quickRange = item.value as QuickRange">{{ item.label }}</button></div></div><label class="rc-inline"><input v-model="autoRefresh" type="checkbox"> 30 秒自動更新</label><span class="rc-muted">{{ timezoneLabel }} · {{ formatDate(providerRiskState.lastUpdatedAt) }}</span></div>
            <div v-if="draftFilters.quickRange === 'custom'" class="rc-custom-time"><label class="rc-label">開始時間<input v-model="draftFilters.customStart" type="datetime-local" class="rc-input" :max="toLocalInput(new Date())"></label><label class="rc-label">結束時間<input v-model="draftFilters.customEnd" type="datetime-local" class="rc-input" :max="toLocalInput(new Date())"></label><span class="rc-muted">最多 7 日</span></div>
            <p class="rc-muted">分析時間只影響遊戲回合成功率、GGAP 請求延遲與期間明細。</p>
        </section>

        <section class="rc-summary-grid"><button v-for="item in summaries" :key="item.key" :class="['rc-card', 'rc-summary', { 'is-active': focus === item.key }]" @click="activateSummary(item.key)"><span class="rc-summary-label">{{ item.label }}</span><div class="rc-summary-value">{{ item.value }}</div><div class="rc-summary-note">{{ item.note }}</div></button></section>

        <section class="rc-card"><div class="rc-card-body rc-stack"><div class="rc-section-head"><div><p class="rc-eyebrow">Service list</p><h2>遊戲與整合監控</h2></div><span v-if="focus" class="rc-pill rc-pill--info">已套用摘要捷徑 · {{ focus }}</span></div><div class="rc-filters"><label class="rc-label">遊戲類型<select v-model="draftFilters.gameType" class="rc-select"><option value="">全部遊戲類型</option><option v-for="(_, key) in gameTypeLabels" :key="key" :value="key">{{ gameTypeLabels[key] }}</option></select></label><label class="rc-label">遊戲／版本<input v-model="draftFilters.game" class="rc-input" placeholder="全部遊戲"></label><label class="rc-label">關注項目<select v-model="draftFilters.state" class="rc-select"><option value="">全部關注項目</option><option v-for="(_, key) in stateLabels" :key="key" :value="key">{{ stateLabels[key] }}</option></select></label><label class="rc-label">資料情境<select v-model="draftFilters.scenario" class="rc-select"><option value="contract">契約 Mock（含失敗／無資料）</option><option value="empty">空資料／載入失敗驗證</option></select></label></div><div class="rc-actions"><button class="rc-button rc-button--primary" @click="applyFilters">查詢</button><button class="rc-button" @click="resetFilters">重置</button></div></div>
            <div class="rc-table-wrap"><table class="rc-table"><thead><tr><th>環境</th><th>遊戲／版本</th><th>類型</th><th>服務狀態</th><th>回合成功率</th><th>失敗／逾時／處理中</th><th>GGAP P50／P95／P99</th><th>GGAP 逾時／失敗／重試</th><th>Risk Event</th><th>最近檢查／新鮮度</th><th>回合追蹤</th></tr></thead><tbody>
                <tr v-for="game in visibleGames" :key="`${game.environment}-${game.gameId}-${game.gameVersion}`" @click="openDetail(game)"><td>{{ environmentLabels[game.environment] }}</td><td><span class="rc-primary">{{ game.gameName }}</span><span class="rc-secondary">{{ game.gameId }} · {{ game.gameVersion }}</span></td><td>{{ gameTypeLabels[game.gameType] }}</td><td><span :class="['rc-pill', `rc-pill--${game.state}`]">{{ stateLabels[game.state] }}</span><span class="rc-secondary">{{ game.serviceReason }}</span></td><td><template v-if="roundRate(game)">{{ roundRate(game) }}</template><span v-else :class="['rc-pill', `rc-pill--${game.periodRound.dataOutcome}`]">{{ detectionOutcomeLabels[game.periodRound.dataOutcome] }}</span></td><td>{{ display(game.periodRound.failed) }} / {{ display(game.periodRound.timeout) }} / {{ display(game.periodRound.processing) }}</td><td>{{ display(game.periodGgap.p50) }} / {{ display(game.periodGgap.p95) }} / {{ display(game.periodGgap.p99) }} <span class="rc-secondary">ms</span></td><td>{{ display(game.periodGgap.timeouts) }} / {{ display(game.periodGgap.failures) }} / {{ display(game.periodGgap.retries) }}</td><td>{{ game.riskEventIds.length }}<span class="rc-secondary">{{ game.riskEventIds[0] ?? '—' }}</span></td><td>{{ formatDate(game.lastCheckedAt) }}<span class="rc-secondary">{{ game.dataFreshness }}</span></td><td><button class="rc-link" :disabled="!game.providerRoundId" @click.stop="jumpToRound(game)">{{ game.providerRoundId ?? '無關聯回合' }}</button></td></tr>
            </tbody></table><div v-if="!visibleGames.length" class="rc-empty"><strong>沒有可顯示的監控資料</strong><br>此狀態不代表服務健康、回合失敗為 0 或 GGAP 延遲為 0。</div></div>
        </section>

        <div v-if="detailVisible && selectedGame" class="rc-drawer-backdrop" @click.self="closeDetail"><aside class="rc-drawer" aria-label="監控詳情"><header class="rc-drawer-head"><div><p class="rc-eyebrow">Read-only monitoring chain</p><h2>{{ selectedGame.gameName }}</h2><code class="rc-code">{{ selectedGame.environment }}/{{ selectedGame.gameId }}/{{ selectedGame.gameVersion }}</code></div><button class="rc-button" @click="closeDetail">關閉</button></header><div class="rc-drawer-body">
            <section class="rc-card rc-detail-section"><div class="rc-section-head"><h3>服務與資料完整性</h3><span :class="['rc-pill', `rc-pill--${selectedGame.state}`]">{{ stateLabels[selectedGame.state] }}</span></div><dl class="rc-facts"><div class="rc-fact"><dt>服務判斷</dt><dd>{{ selectedGame.serviceReason }}</dd></div><div class="rc-fact"><dt>最近檢查</dt><dd>{{ formatDate(selectedGame.lastCheckedAt) }}</dd></div><div class="rc-fact"><dt>Freshness</dt><dd>{{ selectedGame.dataFreshness }}</dd></div><div class="rc-fact"><dt>Round Signal</dt><dd>{{ selectedGame.round.sourceSignalId }} · {{ selectedGame.round.dataOutcome }}</dd></div><div class="rc-fact"><dt>GGAP Signal</dt><dd>{{ selectedGame.ggap.sourceSignalId }} · {{ selectedGame.ggap.dataOutcome }}</dd></div><div class="rc-fact"><dt>Provider Round</dt><dd>{{ display(selectedGame.providerRoundId) }}</dd></div></dl></section>
            <section class="rc-card rc-detail-section"><div class="rc-section-head"><h3>目前分析期間</h3><span class="rc-pill rc-pill--info">{{ appliedFilters.quickRange === 'custom' ? '自訂' : appliedFilters.quickRange }}</span></div><dl class="rc-facts"><div class="rc-fact"><dt>回合成功率</dt><dd>{{ roundRate(selectedGame) ?? '無資料' }}</dd></div><div class="rc-fact"><dt>失敗／逾時／處理中</dt><dd>{{ display(selectedGame.periodRound.failed) }} / {{ display(selectedGame.periodRound.timeout) }} / {{ display(selectedGame.periodRound.processing) }}</dd></div><div class="rc-fact"><dt>GGAP P50／P95／P99</dt><dd>{{ display(selectedGame.periodGgap.p50) }} / {{ display(selectedGame.periodGgap.p95) }} / {{ display(selectedGame.periodGgap.p99) }} ms</dd></div><div class="rc-fact"><dt>GGAP 逾時／失敗／重試</dt><dd>{{ display(selectedGame.periodGgap.timeouts) }} / {{ display(selectedGame.periodGgap.failures) }} / {{ display(selectedGame.periodGgap.retries) }}</dd></div></dl></section>
            <section class="rc-card rc-detail-section"><h3>Signal → Detection Result → Risk Event</h3><div class="rc-evidence"><article v-for="event in detailEvents" :key="event.riskEventId" class="rc-evidence-item"><div class="rc-section-head"><strong>{{ anomalyLabels[event.anomalyType] }}</strong><span :class="['rc-pill', `rc-pill--${event.status}`]">{{ riskEventStatusLabels[event.status] }}</span></div><p>{{ sourceLabels[event.source] }} · {{ severityLabels[event.severity] }} · occurrence ×{{ event.occurrenceCount }}<br>{{ event.detection.ruleId }}@{{ event.detection.ruleVersion }} · {{ event.detection.evidenceSummary }}<br>Detection {{ event.detection.outcome }} · {{ event.detection.dataFreshness }}</p><code class="rc-code">{{ event.riskEventId }}<br>{{ event.detection.detectionResultId }}</code><div class="rc-actions" style="margin-top:.65rem"><button class="rc-button" @click="jumpToEvent(event.riskEventId)">事件證據</button><button v-if="getAlertForEvent(event.riskEventId)" class="rc-button rc-button--primary" @click="jumpToAlert(event.riskEventId)">Alert 工作台</button></div></article></div><div v-if="!detailEvents.length" class="rc-empty">目前沒有 Risk Event；這只表示本視窗沒有事件，不代表缺失資料是健康。</div></section>
            <section v-for="event in detailEvents" :key="`chain-${event.riskEventId}`" class="rc-card rc-detail-section"><h3>下游處理鏈 · {{ event.riskEventId }}</h3><template v-if="getAlertForEvent(event.riskEventId)"><dl class="rc-facts"><div class="rc-fact"><dt>Alert</dt><dd>{{ getAlertForEvent(event.riskEventId)?.alertId }} · {{ alertStatusLabels[getAlertForEvent(event.riskEventId)!.status] }}</dd></div><div class="rc-fact"><dt>Job</dt><dd>{{ display(getAlertForEvent(event.riskEventId)?.mitigationJobs.at(-1)?.mitigationJobId) }} · {{ display(getAlertForEvent(event.riskEventId)?.mitigationJobs.at(-1)?.status) }}</dd></div><div class="rc-fact"><dt>隔離 Desired／Actual</dt><dd>{{ display(getAlertForEvent(event.riskEventId)?.isolation?.desiredState) }} / {{ display(getAlertForEvent(event.riskEventId)?.isolation?.actualState) }}</dd></div><div class="rc-fact"><dt>Health</dt><dd>{{ display(getAlertForEvent(event.riskEventId)?.isolation?.healthVerification.result) }} · {{ display(getAlertForEvent(event.riskEventId)?.isolation?.healthVerification.dataFreshness) }}</dd></div><div class="rc-fact"><dt>GGAP Delivery</dt><dd>{{ display(getAlertForEvent(event.riskEventId)?.deliveries.at(-1)?.deliveryId) }} · {{ display(getAlertForEvent(event.riskEventId)?.deliveries.at(-1)?.status) }}</dd></div><div class="rc-fact"><dt>ACK</dt><dd>{{ formatDate(getAlertForEvent(event.riskEventId)?.deliveries.at(-1)?.acknowledgedAt) }}</dd></div></dl></template><div v-else class="rc-empty">此 Risk Event 尚未建立 Alert，監控頁不代替人工建立或合併狀態。</div></section>
        </div></aside></div>
    </main>
</template>

<style src="./risk-control.css"></style>
