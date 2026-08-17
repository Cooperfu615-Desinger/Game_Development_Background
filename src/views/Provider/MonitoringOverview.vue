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
import type { MonitoringGame, MonitoringState, ProviderEnvironment, ProviderGameType } from '@/types/providerRisk'

type QuickRange = '24h' | '72h' | '120h'
type FocusKey = 'service' | 'round' | 'ggap' | 'high_alert' | 'unresolved' | ''
const route = useRoute()
const router = useRouter()
const { getRiskEvent, getAlertForEvent, refresh } = useProviderRiskMock()
const timezoneLabel = 'UTC+08:00 · Asia/Taipei'
const selectedGame = ref<MonitoringGame | null>(null)
const detailVisible = ref(false)
const focus = ref<FocusKey>('')
const autoRefresh = ref(true)
const flash = ref('')
const initializing = ref(true)
const syncingRoute = ref(false)
let timer: number | null = null

const filters = reactive({
    environment: 'production' as ProviderEnvironment,
    quickRange: '24h' as QuickRange,
    gameType: '' as ProviderGameType | '',
    game: '',
    state: '' as MonitoringState | '',
    scenario: 'contract' as 'contract' | 'empty',
})
const stateLabels: Record<MonitoringState, string> = {
    healthy: '健康', degraded: '降級', critical: '嚴重異常', isolated: '隔離中', no_data: '無資料', maintenance: '維護中',
}
const gameTypeLabels: Record<ProviderGameType, string> = { slots: '老虎機', crash: '碰撞遊戲', table: '棋牌遊戲' }

const environmentGames = computed(() => providerRiskState.monitoringGames.filter((game) => game.environment === filters.environment))
const visibleGames = computed(() => {
    if (filters.scenario === 'empty') return []
    return environmentGames.value
        .filter((game) => !filters.gameType || game.gameType === filters.gameType)
        .filter((game) => !filters.game || `${game.gameName} ${game.gameId} ${game.gameVersion}`.toLowerCase().includes(filters.game.toLowerCase()))
        .filter((game) => !filters.state || game.state === filters.state)
        .filter((game) => {
            if (!focus.value) return true
            if (focus.value === 'service') return !['healthy', 'maintenance'].includes(game.state)
            if (focus.value === 'round') return game.round.dataOutcome !== 'not_matched'
            if (focus.value === 'ggap') return game.ggap.dataOutcome !== 'not_matched'
            const events = game.riskEventIds.map(getRiskEvent).filter(Boolean)
            if (focus.value === 'unresolved') return events.some((event) => event && ['open', 'recovering'].includes(event.status))
            return events.some((event) => {
                if (!event || !['critical', 'high'].includes(event.severity)) return false
                const alert = getAlertForEvent(event.riskEventId)
                return alert && alert.status !== 'closed'
            })
        })
})

const activeAlerts = computed(() => providerRiskState.alerts.filter((alert) => alert.environment === filters.environment && alert.status !== 'closed'))
const unresolvedEvents = computed(() => providerRiskState.riskEvents.filter((event) => event.environment === filters.environment && ['open', 'recovering'].includes(event.status)))
const summaries = computed(() => {
    if (filters.scenario === 'empty') return [
        { key: 'service' as FocusKey, label: '服務健康', value: '無資料', note: 'no_data 不顯示為健康' },
        { key: 'round' as FocusKey, label: '回合成功率', value: '無資料', note: '沒有足夠有效樣本' },
        { key: 'ggap' as FocusKey, label: 'GGAP P95', value: '無資料', note: '直接對接資料不可用' },
        { key: 'high_alert' as FocusKey, label: '高風險告警', value: '無資料', note: '不可解讀為 0' },
        { key: 'unresolved' as FocusKey, label: '未解決事件', value: '無資料', note: '不可解讀為 0' },
    ]
    const expected = environmentGames.value.filter((game) => game.expectedService)
    const healthy = expected.filter((game) => game.state === 'healthy').length
    const roundEligible = expected.filter((game) => game.round.dataOutcome !== 'no_data' && game.round.dataOutcome !== 'insufficient_sample' && game.round.success !== null && game.round.failed !== null && game.round.timeout !== null)
    const roundSuccess = roundEligible.reduce((sum, game) => sum + (game.round.success ?? 0), 0)
    const roundTotal = roundEligible.reduce((sum, game) => sum + (game.round.success ?? 0) + (game.round.failed ?? 0) + (game.round.timeout ?? 0), 0)
    const p95Values = expected.map((game) => game.ggap.p95).filter((value): value is number => value !== null)
    const worstP95 = p95Values.length ? Math.max(...p95Values) : null
    return [
        { key: 'service' as FocusKey, label: '服務健康', value: `${healthy} / ${expected.length}`, note: `${expected.filter((game) => game.state === 'no_data').length} 個 no_data，未計為健康` },
        { key: 'round' as FocusKey, label: '回合成功率', value: roundTotal ? `${(roundSuccess / roundTotal * 100).toFixed(2)}%` : '無資料', note: `${roundEligible.length} 個具有效樣本的服務` },
        { key: 'ggap' as FocusKey, label: 'GGAP P95', value: worstP95 === null ? '無資料' : `${worstP95} ms`, note: 'Provider ↔ GGAP 直接對接最差 P95' },
        { key: 'high_alert' as FocusKey, label: '高風險告警', value: activeAlerts.value.filter((alert) => ['critical', 'high'].includes(alert.severity)).length, note: 'new + in_progress + monitoring' },
        { key: 'unresolved' as FocusKey, label: '未解決事件', value: unresolvedEvents.value.length, note: 'open + recovering' },
    ]
})

const detailEvents = computed(() => selectedGame.value?.riskEventIds.map(getRiskEvent).filter((event) => event !== null) ?? [])
function roundRate(game: MonitoringGame) {
    if (game.round.dataOutcome === 'no_data' || game.round.dataOutcome === 'insufficient_sample' || game.round.success === null || game.round.failed === null || game.round.timeout === null) return null
    const total = game.round.success + game.round.failed + game.round.timeout
    return total ? `${(game.round.success / total * 100).toFixed(2)}%` : null
}
function activateSummary(key: FocusKey) { focus.value = focus.value === key ? '' : key; filters.state = '' }
function openDetail(game: MonitoringGame) {
    selectedGame.value = game; detailVisible.value = true
    void router.replace({ query: { ...route.query, environment: game.environment, game_id: game.gameId } })
}
function closeDetail() { detailVisible.value = false; void router.replace({ query: { ...route.query, game_id: undefined } }) }
function jumpToEvent(riskEventId: string) { void router.push({ path: '/monitoring/risk-reports', query: { environment: filters.environment, risk_event_id: riskEventId } }) }
function jumpToAlert(riskEventId: string) {
    const alert = getAlertForEvent(riskEventId)
    if (alert) void router.push({ path: '/monitoring/alerts', query: { environment: filters.environment, risk_event_id: riskEventId, alert_id: alert.alertId } })
}
function jumpToRound(game: MonitoringGame) {
    if (!game.providerRoundId) return
    void router.push({ path: '/reports/provider-game-rounds', query: { environment: game.environment, provider_game_round_id: game.providerRoundId } })
}
function formatDate(value: Date | null | undefined) { return value ? new Intl.DateTimeFormat('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(value) : '—' }
function display(value: string | number | null | undefined) { return value === null || value === undefined || value === '' ? '無資料' : String(value) }
function resetFilters() { Object.assign(filters, { gameType: '', game: '', state: '', scenario: 'contract' }); focus.value = '' }
function configureTimer() {
    if (timer !== null) window.clearInterval(timer)
    timer = autoRefresh.value ? window.setInterval(refresh, 30_000) : null
}

async function syncFromRoute() {
    syncingRoute.value = true
    const queryEnvironment = route.query.environment
    const environment = queryEnvironment === 'production' || queryEnvironment === 'demo' ? queryEnvironment : filters.environment
    const gameId = typeof route.query.game_id === 'string' ? route.query.game_id : ''
    filters.environment = environment
    if (gameId) {
        const game = providerRiskState.monitoringGames.find((item) => item.environment === environment && item.gameId === gameId)
        if (game) { selectedGame.value = game; detailVisible.value = true }
        else flash.value = `找不到遊戲 ${gameId}，可能不屬於目前 Provider／環境。`
    } else detailVisible.value = false
    await nextTick()
    syncingRoute.value = false
}

onMounted(async () => {
    await syncFromRoute()
    configureTimer()
    initializing.value = false
})
onBeforeUnmount(() => { if (timer !== null) window.clearInterval(timer) })
watch(autoRefresh, configureTimer)
watch(() => [route.query.environment, route.query.game_id], () => { if (!initializing.value) void syncFromRoute() })
watch(() => filters.environment, () => {
    if (initializing.value || syncingRoute.value) return
    focus.value = ''
    detailVisible.value = false
    void router.replace({ query: { environment: filters.environment } })
})
</script>

<template>
    <main class="rc-page rc-stack">
        <header class="rc-header"><div><p class="rc-eyebrow">Monitoring overview</p><h1>監控總覽</h1><p class="rc-subtitle">只讀檢視 Provider 自有服務、Game Round、數值／資料品質與 GGAP 直接對接；所有狀態皆可追溯到 Signal 與 Detection Result。</p></div><button class="rc-button" @click="refresh">立即更新</button></header>
        <div class="rc-mock-banner"><span>READ ONLY</span><div><strong>{{ providerRiskState.mockLabel }}</strong><br>Production 與 DEMO 完全分離，Test 永久排除；no_data／insufficient_sample／evaluation_failed 不會顯示為健康或 0。</div></div>
        <div v-if="flash" class="rc-flash is-error">{{ flash }}</div>

        <section class="rc-card rc-control-card"><div class="rc-control-row"><div class="rc-inline"><strong>環境</strong><div class="rc-segment"><button :class="{ 'is-active': filters.environment === 'production' }" @click="filters.environment = 'production'">正式環境</button><button :class="{ 'is-active': filters.environment === 'demo' }" @click="filters.environment = 'demo'">DEMO</button></div></div><div class="rc-inline"><span class="rc-muted">時間</span><div class="rc-segment"><button v-for="value in ['24h','72h','120h']" :key="value" :class="{ 'is-active': filters.quickRange === value }" @click="filters.quickRange = value as QuickRange">{{ value }}</button></div></div><label class="rc-inline"><input v-model="autoRefresh" type="checkbox"> 30 秒自動更新</label><span class="rc-muted">{{ timezoneLabel }} · {{ formatDate(providerRiskState.lastUpdatedAt) }}</span></div></section>

        <section class="rc-summary-grid"><button v-for="item in summaries" :key="item.key" :class="['rc-card', 'rc-summary', { 'is-active': focus === item.key }]" @click="activateSummary(item.key)"><span class="rc-summary-label">{{ item.label }}</span><div class="rc-summary-value">{{ item.value }}</div><div class="rc-summary-note">{{ item.note }}</div></button></section>

        <section class="rc-card"><div class="rc-card-body rc-stack"><div class="rc-section-head"><div><p class="rc-eyebrow">Service list</p><h2>遊戲與整合監控</h2></div><span v-if="focus" class="rc-pill rc-pill--info">已套用摘要捷徑 · {{ focus }}</span></div><div class="rc-filters"><label class="rc-label">遊戲類型<select v-model="filters.gameType" class="rc-select"><option value="">全部</option><option v-for="(_, key) in gameTypeLabels" :key="key" :value="key">{{ gameTypeLabels[key] }}</option></select></label><label class="rc-label">遊戲／版本<input v-model="filters.game" class="rc-input" placeholder="名稱、ID 或版本"></label><label class="rc-label">服務狀態<select v-model="filters.state" class="rc-select"><option value="">全部</option><option v-for="(_, key) in stateLabels" :key="key" :value="key">{{ stateLabels[key] }}</option></select></label><label class="rc-label">資料情境<select v-model="filters.scenario" class="rc-select"><option value="contract">契約 Mock（含失敗／無資料）</option><option value="empty">空資料／載入失敗驗證</option></select></label><div class="rc-filter-actions"><button class="rc-button" @click="resetFilters">重設</button></div></div></div>
            <div class="rc-table-wrap"><table class="rc-table"><thead><tr><th>環境</th><th>遊戲／版本</th><th>類型</th><th>服務狀態</th><th>回合成功率</th><th>失敗／逾時／處理中</th><th>GGAP P50／P95／P99</th><th>GGAP 逾時／失敗／重試</th><th>Risk Event</th><th>最近檢查／新鮮度</th><th>回合追蹤</th></tr></thead><tbody>
                <tr v-for="game in visibleGames" :key="`${game.environment}-${game.gameId}-${game.gameVersion}`" @click="openDetail(game)"><td>{{ environmentLabels[game.environment] }}</td><td><span class="rc-primary">{{ game.gameName }}</span><span class="rc-secondary">{{ game.gameId }} · {{ game.gameVersion }}</span></td><td>{{ gameTypeLabels[game.gameType] }}</td><td><span :class="['rc-pill', `rc-pill--${game.state}`]">{{ stateLabels[game.state] }}</span><span class="rc-secondary">{{ game.serviceReason }}</span></td><td><template v-if="roundRate(game)">{{ roundRate(game) }}</template><span v-else :class="['rc-pill', `rc-pill--${game.round.dataOutcome}`]">{{ detectionOutcomeLabels[game.round.dataOutcome] }}</span></td><td>{{ display(game.round.failed) }} / {{ display(game.round.timeout) }} / {{ display(game.round.processing) }}</td><td>{{ display(game.ggap.p50) }} / {{ display(game.ggap.p95) }} / {{ display(game.ggap.p99) }} <span class="rc-secondary">ms</span></td><td>{{ display(game.ggap.timeouts) }} / {{ display(game.ggap.failures) }} / {{ display(game.ggap.retries) }}</td><td>{{ game.riskEventIds.length }}<span class="rc-secondary">{{ game.riskEventIds[0] ?? '—' }}</span></td><td>{{ formatDate(game.lastCheckedAt) }}<span class="rc-secondary">{{ game.dataFreshness }}</span></td><td><button class="rc-link" :disabled="!game.providerRoundId" @click.stop="jumpToRound(game)">{{ game.providerRoundId ?? '無關聯回合' }}</button></td></tr>
            </tbody></table><div v-if="!visibleGames.length" class="rc-empty"><strong>沒有可顯示的監控資料</strong><br>此狀態不代表服務健康、回合失敗為 0 或 GGAP 延遲為 0。</div></div>
        </section>

        <div v-if="detailVisible && selectedGame" class="rc-drawer-backdrop" @click.self="closeDetail"><aside class="rc-drawer" aria-label="監控詳情"><header class="rc-drawer-head"><div><p class="rc-eyebrow">Read-only monitoring chain</p><h2>{{ selectedGame.gameName }}</h2><code class="rc-code">{{ selectedGame.environment }}/{{ selectedGame.gameId }}/{{ selectedGame.gameVersion }}</code></div><button class="rc-button" @click="closeDetail">關閉</button></header><div class="rc-drawer-body">
            <section class="rc-card rc-detail-section"><div class="rc-section-head"><h3>服務與資料完整性</h3><span :class="['rc-pill', `rc-pill--${selectedGame.state}`]">{{ stateLabels[selectedGame.state] }}</span></div><dl class="rc-facts"><div class="rc-fact"><dt>服務判斷</dt><dd>{{ selectedGame.serviceReason }}</dd></div><div class="rc-fact"><dt>最近檢查</dt><dd>{{ formatDate(selectedGame.lastCheckedAt) }}</dd></div><div class="rc-fact"><dt>Freshness</dt><dd>{{ selectedGame.dataFreshness }}</dd></div><div class="rc-fact"><dt>Round Signal</dt><dd>{{ selectedGame.round.sourceSignalId }} · {{ selectedGame.round.dataOutcome }}</dd></div><div class="rc-fact"><dt>GGAP Signal</dt><dd>{{ selectedGame.ggap.sourceSignalId }} · {{ selectedGame.ggap.dataOutcome }}</dd></div><div class="rc-fact"><dt>Provider Round</dt><dd>{{ display(selectedGame.providerRoundId) }}</dd></div></dl></section>
            <section class="rc-card rc-detail-section"><h3>Signal → Detection Result → Risk Event</h3><div class="rc-evidence"><article v-for="event in detailEvents" :key="event.riskEventId" class="rc-evidence-item"><div class="rc-section-head"><strong>{{ anomalyLabels[event.anomalyType] }}</strong><span :class="['rc-pill', `rc-pill--${event.status}`]">{{ riskEventStatusLabels[event.status] }}</span></div><p>{{ sourceLabels[event.source] }} · {{ severityLabels[event.severity] }} · occurrence ×{{ event.occurrenceCount }}<br>{{ event.detection.ruleId }}@{{ event.detection.ruleVersion }} · {{ event.detection.evidenceSummary }}<br>Detection {{ event.detection.outcome }} · {{ event.detection.dataFreshness }}</p><code class="rc-code">{{ event.riskEventId }}<br>{{ event.detection.detectionResultId }}</code><div class="rc-actions" style="margin-top:.65rem"><button class="rc-button" @click="jumpToEvent(event.riskEventId)">事件證據</button><button v-if="getAlertForEvent(event.riskEventId)" class="rc-button rc-button--primary" @click="jumpToAlert(event.riskEventId)">Alert 工作台</button></div></article></div><div v-if="!detailEvents.length" class="rc-empty">目前沒有 Risk Event；這只表示本視窗沒有事件，不代表缺失資料是健康。</div></section>
            <section v-for="event in detailEvents" :key="`chain-${event.riskEventId}`" class="rc-card rc-detail-section"><h3>下游處理鏈 · {{ event.riskEventId }}</h3><template v-if="getAlertForEvent(event.riskEventId)"><dl class="rc-facts"><div class="rc-fact"><dt>Alert</dt><dd>{{ getAlertForEvent(event.riskEventId)?.alertId }} · {{ alertStatusLabels[getAlertForEvent(event.riskEventId)!.status] }}</dd></div><div class="rc-fact"><dt>Job</dt><dd>{{ display(getAlertForEvent(event.riskEventId)?.mitigationJobs.at(-1)?.mitigationJobId) }} · {{ display(getAlertForEvent(event.riskEventId)?.mitigationJobs.at(-1)?.status) }}</dd></div><div class="rc-fact"><dt>隔離 Desired／Actual</dt><dd>{{ display(getAlertForEvent(event.riskEventId)?.isolation?.desiredState) }} / {{ display(getAlertForEvent(event.riskEventId)?.isolation?.actualState) }}</dd></div><div class="rc-fact"><dt>Health</dt><dd>{{ display(getAlertForEvent(event.riskEventId)?.isolation?.healthVerification.result) }} · {{ display(getAlertForEvent(event.riskEventId)?.isolation?.healthVerification.dataFreshness) }}</dd></div><div class="rc-fact"><dt>GGAP Delivery</dt><dd>{{ display(getAlertForEvent(event.riskEventId)?.deliveries.at(-1)?.deliveryId) }} · {{ display(getAlertForEvent(event.riskEventId)?.deliveries.at(-1)?.status) }}</dd></div><div class="rc-fact"><dt>ACK</dt><dd>{{ formatDate(getAlertForEvent(event.riskEventId)?.deliveries.at(-1)?.acknowledgedAt) }}</dd></div></dl></template><div v-else class="rc-empty">此 Risk Event 尚未建立 Alert，監控頁不代替人工建立或合併狀態。</div></section>
        </div></aside></div>
    </main>
</template>

<style src="./risk-control.css"></style>
