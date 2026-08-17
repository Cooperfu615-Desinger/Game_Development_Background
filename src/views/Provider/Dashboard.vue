<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Chart from 'primevue/chart'
import { anomalyLabels, providerRiskState, severityLabels } from '@/mocks/providerRisk'

type PeriodKey = 'today' | 'yesterday' | 'sevenDays'
type TrendKey = 'rounds' | 'bet' | 'ggr' | 'players'
type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'
type GameView = 'popular' | 'attention'

interface PeriodMetric {
    rounds: string
    players: string
    bet: string
    betUsdt: string
    payout: string
    payoutUsdt: string
    ggr: string
    ggrUsdt: string
}

interface StatusCard {
    label: string
    value: string
    status: string
    note: string
    icon: string
    tone: Tone
    route: string
    tip: string
}

interface GameRow {
    name: string
    id: string
    status: string
    tone: Tone
    rounds: string
    players: string
    signal: string
    signalTone: 'up' | 'down' | 'flat'
}

const router = useRouter()
const period = ref<PeriodKey>('today')
const trend = ref<TrendKey>('rounds')
const gameView = ref<GameView>('popular')
const refreshing = ref(false)
const lastUpdated = ref(providerRiskState.lastUpdatedAt)
let refreshTimer: number | undefined

const periodOptions: Array<{ label: string; value: PeriodKey }> = [
    { label: '今日', value: 'today' },
    { label: '昨日', value: 'yesterday' },
    { label: '近 7 日', value: 'sevenDays' },
]

const trendOptions: Array<{ label: string; value: TrendKey }> = [
    { label: '遊戲回合', value: 'rounds' },
    { label: '投注額', value: 'bet' },
    { label: 'GGR', value: 'ggr' },
    { label: '玩家人數', value: 'players' },
]

const periodMetrics: Record<PeriodKey, PeriodMetric> = {
    today: {
        rounds: '83,840', players: '15,240',
        bet: '12,060,880.00 pt', betUsdt: '約 120,608.80 USDT',
        payout: '11,887,517.00 pt', payoutUsdt: '約 118,875.17 USDT',
        ggr: '173,363.00 pt', ggrUsdt: '約 1,733.63 USDT',
    },
    yesterday: {
        rounds: '79,214', players: '14,680',
        bet: '11,424,960.00 pt', betUsdt: '約 114,249.60 USDT',
        payout: '11,276,781.00 pt', payoutUsdt: '約 112,767.81 USDT',
        ggr: '148,179.00 pt', ggrUsdt: '約 1,481.79 USDT',
    },
    sevenDays: {
        rounds: '552,416', players: '43,892',
        bet: '81,947,220.00 pt', betUsdt: '約 819,472.20 USDT',
        payout: '80,799,436.00 pt', payoutUsdt: '約 807,994.36 USDT',
        ggr: '1,147,784.00 pt', ggrUsdt: '約 11,477.84 USDT',
    },
}

const statusCards = computed<StatusCard[]>(() => {
    const games = providerRiskState.monitoringGames.filter((game) => game.environment === 'production')
    const expected = games.filter((game) => game.expectedService)
    const healthy = expected.filter((game) => game.state === 'healthy').length
    const p95Values = expected.map((game) => game.ggap.p95).filter((value): value is number => value !== null)
    const worstP95 = p95Values.length ? Math.max(...p95Values) : null
    const activeAlerts = providerRiskState.alerts.filter((alert) => alert.environment === 'production' && ['new', 'in_progress', 'monitoring'].includes(alert.status))
    const activeEvents = providerRiskState.riskEvents.filter((event) => event.environment === 'production' && ['open', 'recovering'].includes(event.status))
    return [
        {
            label: '正式環境服務', value: `${healthy} / ${expected.length}`, status: healthy === expected.length ? '全部健康' : '部分服務需關注',
            note: `no_data ${expected.filter((game) => game.state === 'no_data').length} · 隔離 ${expected.filter((game) => game.state === 'isolated').length}`, icon: 'pi pi-server', tone: healthy === expected.length ? 'success' : 'warning', route: '/monitoring?environment=production',
            tip: '只計算應提供服務的正式環境遊戲；no_data 不會算成健康。',
        },
        {
            label: 'GGAP 直接對接 P95', value: worstP95 === null ? '無資料' : `${worstP95} ms`, status: worstP95 === null ? '不可判定' : worstP95 > 500 ? '需關注' : '連線正常',
            note: 'Provider ↔ GGAP · 不推論下游', icon: 'pi pi-link', tone: worstP95 === null ? 'neutral' : worstP95 > 500 ? 'warning' : 'success', route: '/monitoring?environment=production',
            tip: '只顯示 Provider 與 GGAP 的直接整合證據，不包含 GGAP Agent 或其下游。',
        },
        {
            label: 'Active Alert', value: String(activeAlerts.length), status: `${activeAlerts.filter((alert) => ['high', 'critical'].includes(alert.severity)).length} 筆高風險`,
            note: `New ${activeAlerts.filter((alert) => alert.status === 'new').length} · 處理 ${activeAlerts.filter((alert) => alert.status === 'in_progress').length} · 觀察 ${activeAlerts.filter((alert) => alert.status === 'monitoring').length}`, icon: 'pi pi-bell', tone: activeAlerts.some((alert) => alert.severity === 'critical') ? 'danger' : 'warning', route: '/monitoring/alerts?environment=production',
            tip: 'Active Alert = new + in_progress + monitoring；不與 Risk Event 狀態合併。',
        },
        {
            label: '未解決 Risk Event', value: String(activeEvents.length), status: `${activeEvents.filter((event) => event.status === 'open').length} 筆異常中`,
            note: `Open ${activeEvents.filter((event) => event.status === 'open').length} · Recovering ${activeEvents.filter((event) => event.status === 'recovering').length}`, icon: 'pi pi-shield', tone: activeEvents.some((event) => event.severity === 'critical') ? 'danger' : 'info', route: '/monitoring/risk-reports?environment=production',
            tip: '未解決 Risk Event = open + recovering；Resolved 與 Invalidated 仍分開保留。',
        },
    ]
})

const operatingMetrics = computed(() => {
    const values = periodMetrics[period.value]
    return [
        { label: '遊戲回合數', value: values.rounds, note: '已完成結算', icon: 'pi pi-list-check', tip: '指定期間內完成結算的有效遊戲回合數。' },
        { label: '不重複玩家', value: values.players, note: '依會員 ID 去重', icon: 'pi pi-users', tip: '指定期間內實際產生有效遊戲回合的不重複會員人數。' },
        { label: '投注總額', value: values.bet, note: values.betUsdt, icon: 'pi pi-arrow-up-right', tip: '指定期間有效遊戲回合的投注點數總和；USDT 為換算對照。' },
        { label: '派彩總額', value: values.payout, note: values.payoutUsdt, icon: 'pi pi-arrow-down-left', tip: '指定期間有效遊戲回合的派彩點數總和；USDT 為換算對照。' },
        { label: 'GGR', value: values.ggr, note: values.ggrUsdt, icon: 'pi pi-chart-line', tip: 'GGR = 投注總額 - 派彩總額。' },
    ]
})

const trendSeries: Record<TrendKey, { data: number[]; color: string; fill: string; summary: string; unit: string }> = {
    rounds: { data: [71240, 74860, 73120, 76840, 79510, 81240, 83840], color: '#257164', fill: 'rgba(37, 113, 100, .12)', summary: '+8.4%', unit: '筆' },
    bet: { data: [9.82, 10.31, 10.08, 10.92, 11.18, 11.42, 12.06], color: '#3f6f9d', fill: 'rgba(63, 111, 157, .12)', summary: '+10.4%', unit: '百萬 pt' },
    ggr: { data: [142.4, 156.8, 131.2, 168.6, 152.9, 148.2, 173.4], color: '#b66c2f', fill: 'rgba(182, 108, 47, .12)', summary: '+12.8%', unit: '千 pt' },
    players: { data: [13240, 13980, 13620, 14240, 14510, 14680, 15240], color: '#6b5e9a', fill: 'rgba(107, 94, 154, .12)', summary: '+6.9%', unit: '人' },
}

const chartData = computed(() => {
    const selected = trendSeries[trend.value]
    return {
        labels: ['08/07', '08/08', '08/09', '08/10', '08/11', '08/12', '08/13'],
        datasets: [{
            data: selected.data,
            borderColor: selected.color,
            backgroundColor: selected.fill,
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: selected.color,
            pointBorderWidth: 2,
            fill: true,
            tension: 0.34,
        }],
    }
})

const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
        legend: { display: false },
        tooltip: {
            displayColors: false,
            callbacks: {
                label: (context: { formattedValue: string }) => `${context.formattedValue} ${trendSeries[trend.value].unit}`,
            },
        },
    },
    scales: {
        x: { grid: { display: false }, ticks: { color: '#758385', font: { size: 10 } }, border: { display: false } },
        y: { grid: { color: 'rgba(105, 126, 124, .13)' }, ticks: { color: '#758385', font: { size: 10 }, maxTicksLimit: 5 }, border: { display: false } },
    },
}))

const actionItems = computed(() => {
    const severityRank = { critical: 5, high: 4, medium: 3, low: 2, info: 1 }
    const alertItems = providerRiskState.alerts
        .filter((alert) => alert.environment === 'production' && alert.status !== 'closed')
        .sort((a, b) => severityRank[b.severity] - severityRank[a.severity] || b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, 4)
        .map((alert) => {
            const event = providerRiskState.riskEvents.find((item) => item.riskEventId === alert.riskEventId)
            return {
                title: event ? anomalyLabels[event.anomalyType] : '風控告警待處理',
                meta: `${event?.gameName ?? '未知遊戲'} · Alert ${alert.alertId} · Event ${alert.riskEventId}`,
                id: alert.alertId,
                label: severityLabels[alert.severity],
                tone: (['critical', 'high'].includes(alert.severity) ? 'danger' : 'warning') as Tone,
                icon: 'pi pi-exclamation-triangle',
                route: `/monitoring/alerts?environment=${alert.environment}&alert_id=${alert.alertId}&risk_event_id=${alert.riskEventId}`,
            }
        })
    const evidenceOnly = providerRiskState.riskEvents.find((event) => event.environment === 'production' && event.status === 'open' && !event.alertId)
    if (evidenceOnly) alertItems.push({
        title: anomalyLabels[evidenceOnly.anomalyType],
        meta: `${evidenceOnly.gameName} · Event ${evidenceOnly.riskEventId} · 尚未建立 Alert`,
        id: evidenceOnly.riskEventId,
        label: severityLabels[evidenceOnly.severity],
        tone: 'neutral', icon: 'pi pi-shield',
        route: `/monitoring/risk-reports?environment=${evidenceOnly.environment}&risk_event_id=${evidenceOnly.riskEventId}`,
    })
    return alertItems
})

const popularGames: GameRow[] = [
    { name: 'Neon Heist', id: 'gm_neon_heist', status: '正常', tone: 'success', rounds: '18,420', players: '2,846', signal: '+12.4%', signalTone: 'up' },
    { name: 'Skyline Crash', id: 'crash-solo', status: '正常', tone: 'success', rounds: '15,980', players: '2,418', signal: '+8.1%', signalTone: 'up' },
    { name: 'Crown of Fortune', id: 'slot-crown', status: '正常', tone: 'success', rounds: '12,640', players: '1,985', signal: '+3.6%', signalTone: 'up' },
    { name: 'Mini Burst', id: 'mini-burst', status: '正常', tone: 'success', rounds: '9,820', players: '1,642', signal: '-1.2%', signalTone: 'down' },
    { name: 'Paper Crane', id: 'PC-009', status: '隔離中', tone: 'danger', rounds: '6,304', players: '928', signal: '-18.6%', signalTone: 'down' },
]

const attentionGames: GameRow[] = [
    { name: 'Paper Crane', id: 'PC-009', status: '隔離中', tone: 'danger', rounds: '6,304', players: '928', signal: '重複結算', signalTone: 'flat' },
    { name: 'Solar Garden', id: 'SG-031', status: '異常', tone: 'danger', rounds: '8,214', players: '1,120', signal: '啟動失敗', signalTone: 'flat' },
    { name: 'Neon Drift', id: 'ND-014', status: '降級', tone: 'warning', rounds: '18,789', players: '2,194', signal: 'P95 608 ms', signalTone: 'flat' },
    { name: 'Star Roulette', id: 'gm_star_roulette', status: '無資料', tone: 'neutral', rounds: '10,214', players: '1,406', signal: '38 分鐘', signalTone: 'flat' },
]

const visibleGames = computed(() => gameView.value === 'popular' ? popularGames : attentionGames)

const notifications = [
    { title: 'Callback 重試已完成', type: 'GGAP 對接', time: '8 分鐘前', tone: 'success' as Tone, unread: true },
    { title: '結算失敗率升高', type: '風控告警', time: '12 分鐘前', tone: 'danger' as Tone, unread: true },
    { title: '財務報表匯出完成', type: '遊戲商財務', time: '34 分鐘前', tone: 'info' as Tone, unread: false },
    { title: 'DEMO 版本發布完成', type: '環境與發布', time: '1 小時前', tone: 'success' as Tone, unread: false },
    { title: '憑證將於 30 日後到期', type: '系統設定', time: '3 小時前', tone: 'warning' as Tone, unread: false },
]

const periodLabel = computed(() => periodOptions.find((item) => item.value === period.value)?.label ?? '今日')
const trendLabel = computed(() => trendOptions.find((item) => item.value === trend.value)?.label ?? '遊戲回合')

function formatDateTime(value: Date) {
    return new Intl.DateTimeFormat('zh-TW', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    }).format(value)
}

function navigate(route: string) {
    void router.push(route)
}

function refreshDashboard() {
    if (refreshTimer) window.clearTimeout(refreshTimer)
    refreshing.value = true
    refreshTimer = window.setTimeout(() => {
        lastUpdated.value = new Date()
        providerRiskState.lastUpdatedAt = new Date()
        refreshing.value = false
    }, 520)
}

onBeforeUnmount(() => {
    if (refreshTimer) window.clearTimeout(refreshTimer)
})
</script>

<template>
    <div class="provider-dashboard-page page-stack">
        <section class="dashboard-toolbar" aria-label="儀表板資料範圍">
            <div class="dashboard-live-state">
                <span class="dashboard-live-dot" aria-hidden="true" />
                <div>
                    <strong>資料更新正常</strong>
                    <span>最後更新 {{ formatDateTime(lastUpdated) }} · UTC+08:00</span>
                </div>
            </div>
            <div class="dashboard-toolbar-actions">
                <div class="dashboard-segments" role="group" aria-label="營運數據期間">
                    <button v-for="option in periodOptions" :key="option.value" type="button" :class="{ active: period === option.value }" :aria-pressed="period === option.value" @click="period = option.value">{{ option.label }}</button>
                </div>
                <Button icon="pi pi-refresh" severity="secondary" outlined rounded :loading="refreshing" aria-label="重新整理儀表板" v-tooltip.top="'重新整理'" @click="refreshDashboard" />
            </div>
        </section>

        <section class="dashboard-section" aria-labelledby="dashboard-status-title">
            <div class="dashboard-section-heading">
                <div><span>即時狀態</span><h2 id="dashboard-status-title">營運狀態</h2></div>
                <small>正式環境為主 · DEMO 僅納入環境狀態</small>
            </div>
            <div class="dashboard-status-grid">
                <button v-for="card in statusCards" :key="card.label" type="button" class="dashboard-status-card" :class="`dashboard-tone--${card.tone}`" @click="navigate(card.route)">
                    <span class="dashboard-card-icon"><i :class="card.icon" /></span>
                    <span class="dashboard-card-label">{{ card.label }}<i class="pi pi-info-circle" tabindex="0" :aria-label="`${card.label}提示`" v-tooltip.top="card.tip" @click.stop /></span>
                    <strong>{{ card.value }}</strong>
                    <span class="dashboard-state-pill">{{ card.status }}</span>
                    <small>{{ card.note }}</small>
                    <i class="pi pi-arrow-up-right dashboard-card-arrow" aria-hidden="true" />
                </button>
            </div>
        </section>

        <section class="dashboard-section" aria-labelledby="dashboard-operations-title">
            <div class="dashboard-section-heading">
                <div><span>正式環境 · {{ periodLabel }}</span><h2 id="dashboard-operations-title">營運數據</h2></div>
                <Button label="財務總覽" icon="pi pi-arrow-up-right" icon-pos="right" text @click="navigate('/finance')" />
            </div>
            <div class="dashboard-metric-grid">
                <article v-for="metric in operatingMetrics" :key="metric.label" class="dashboard-metric-card">
                    <div><span><i :class="metric.icon" />{{ metric.label }}</span><i class="pi pi-info-circle" tabindex="0" :aria-label="`${metric.label}提示`" v-tooltip.top="metric.tip" /></div>
                    <strong>{{ metric.value }}</strong>
                    <small>{{ metric.note }}</small>
                </article>
            </div>
        </section>

        <section class="dashboard-main-grid">
            <article class="dashboard-panel dashboard-trend-panel" aria-labelledby="dashboard-trend-title">
                <div class="dashboard-panel-heading">
                    <div><span>近 7 日</span><h2 id="dashboard-trend-title">營運趨勢</h2></div>
                    <div class="dashboard-trend-result"><span>{{ trendLabel }}</span><strong>{{ trendSeries[trend].summary }}</strong></div>
                </div>
                <div class="dashboard-segments dashboard-trend-segments" role="group" aria-label="趨勢指標">
                    <button v-for="option in trendOptions" :key="option.value" type="button" :class="{ active: trend === option.value }" :aria-pressed="trend === option.value" @click="trend = option.value">{{ option.label }}</button>
                </div>
                <div class="dashboard-chart-wrap"><Chart type="line" :data="chartData" :options="chartOptions" /></div>
            </article>

            <article class="dashboard-panel dashboard-action-panel" aria-labelledby="dashboard-action-title">
                <div class="dashboard-panel-heading">
                    <div><span>優先處理</span><h2 id="dashboard-action-title">待處理事項</h2></div>
                    <span class="dashboard-count-badge">{{ actionItems.length }}</span>
                </div>
                <div class="dashboard-action-list">
                    <button v-for="item in actionItems" :key="item.id" type="button" @click="navigate(item.route)">
                        <span class="dashboard-action-icon" :class="`dashboard-action-icon--${item.tone}`"><i :class="item.icon" /></span>
                        <span class="dashboard-action-copy"><strong>{{ item.title }}</strong><small>{{ item.meta }}</small></span>
                        <span class="dashboard-tag" :class="`dashboard-tag--${item.tone}`">{{ item.label }}</span>
                        <i class="pi pi-angle-right" aria-hidden="true" />
                    </button>
                </div>
                <Button label="查看全部告警" icon="pi pi-arrow-up-right" icon-pos="right" text class="dashboard-panel-link" @click="navigate('/monitoring/alerts')" />
            </article>
        </section>

        <section class="dashboard-bottom-grid">
            <article class="dashboard-panel dashboard-games-panel" aria-labelledby="dashboard-games-title">
                <div class="dashboard-panel-heading dashboard-games-heading">
                    <div><span>正式環境</span><h2 id="dashboard-games-title">遊戲營運概況</h2></div>
                    <div class="dashboard-segments" role="group" aria-label="遊戲概況類型">
                        <button type="button" :class="{ active: gameView === 'popular' }" :aria-pressed="gameView === 'popular'" @click="gameView = 'popular'">熱門遊戲</button>
                        <button type="button" :class="{ active: gameView === 'attention' }" :aria-pressed="gameView === 'attention'" @click="gameView = 'attention'">需要關注</button>
                    </div>
                </div>
                <div class="dashboard-game-table-wrap" tabindex="0" aria-label="遊戲營運概況，可水平捲動">
                    <table class="dashboard-game-table">
                        <thead><tr><th>遊戲</th><th>狀態</th><th>遊戲回合</th><th>玩家人數</th><th>{{ gameView === 'popular' ? '較前期' : '關注訊號' }}</th><th>操作</th></tr></thead>
                        <tbody>
                            <tr v-for="game in visibleGames" :key="game.id">
                                <td><strong>{{ game.name }}</strong><code>{{ game.id }}</code></td>
                                <td><span class="dashboard-tag" :class="`dashboard-tag--${game.tone}`">{{ game.status }}</span></td>
                                <td>{{ game.rounds }}</td><td>{{ game.players }}</td>
                                <td><span class="dashboard-signal" :class="`dashboard-signal--${game.signalTone}`">{{ game.signal }}</span></td>
                                <td><Button icon="pi pi-arrow-up-right" text rounded aria-label="查看遊戲監控" v-tooltip.left="'查看監控'" @click="navigate('/monitoring')" /></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </article>

            <article class="dashboard-panel dashboard-notification-panel" aria-labelledby="dashboard-notification-title">
                <div class="dashboard-panel-heading">
                    <div><span>通知中心</span><h2 id="dashboard-notification-title">最新通知</h2></div>
                    <span class="dashboard-unread"><i class="pi pi-circle-fill" />2 未讀</span>
                </div>
                <div class="dashboard-notification-list">
                    <button v-for="item in notifications" :key="`${item.title}-${item.time}`" type="button" @click="navigate('/notifications')">
                        <span class="dashboard-notification-mark" :class="`dashboard-notification-mark--${item.tone}`"><i v-if="item.unread" class="pi pi-circle-fill" /></span>
                        <span><strong>{{ item.title }}</strong><small>{{ item.type }} · {{ item.time }}</small></span>
                        <i class="pi pi-angle-right" aria-hidden="true" />
                    </button>
                </div>
                <Button label="查看全部通知" icon="pi pi-arrow-up-right" icon-pos="right" text class="dashboard-panel-link" @click="navigate('/notifications')" />
            </article>
        </section>
    </div>
</template>

<style scoped>
.provider-dashboard-page {
    width: 100%;
    max-width: 1500px;
    min-width: 0;
    margin: 0 auto;
    padding-bottom: 2.75rem;
    overflow-x: hidden;
    --dashboard-ink: #233a40;
    --dashboard-muted: #687d80;
    --dashboard-line: #d8e6e1;
    --dashboard-soft: #f3f9f7;
    --dashboard-teal: #17766f;
    --dashboard-blue: #4d749f;
    --dashboard-amber: #b87528;
    --dashboard-red: #b94a47;
    --dashboard-green: #36835f;
    --dashboard-violet: #6b5e9a;
}

.dashboard-toolbar,
.dashboard-panel {
    min-width: 0;
    border: 1px solid var(--dashboard-line);
    border-radius: .9rem;
    background: var(--hig-bg-surface, #fff);
    box-shadow: 0 .55rem 1.6rem rgba(31, 73, 68, .045);
}

.dashboard-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: .72rem .85rem; }
.dashboard-live-state { display: flex; min-width: 0; align-items: center; gap: .65rem; }
.dashboard-live-dot { width: .58rem; height: .58rem; flex: 0 0 auto; border: 2px solid #d7f0e1; border-radius: 50%; background: var(--dashboard-green); box-shadow: 0 0 0 .24rem #edf8f1; }
.dashboard-live-state div { display: grid; min-width: 0; gap: .12rem; }
.dashboard-live-state strong { color: var(--dashboard-ink); font-size: .75rem; }
.dashboard-live-state span { color: var(--dashboard-muted); font-size: .67rem; font-variant-numeric: tabular-nums; }
.dashboard-toolbar-actions { display: flex; align-items: center; gap: .55rem; }

.dashboard-segments { display: inline-flex; min-width: 0; padding: .2rem; border-radius: .65rem; background: #eef4f2; }
.dashboard-segments button { min-height: 2rem; padding: .4rem .68rem; color: var(--dashboard-muted); border: 0; border-radius: .48rem; background: transparent; font: inherit; font-size: .69rem; font-weight: 800; cursor: pointer; transition: color 150ms ease, background 150ms ease, box-shadow 150ms ease; }
.dashboard-segments button:hover { color: var(--dashboard-teal); }
.dashboard-segments button.active { color: var(--dashboard-ink); background: #fff; box-shadow: 0 .18rem .55rem rgba(35, 58, 64, .1); }
.dashboard-segments button:focus-visible { outline: 2px solid #8fc5b8; outline-offset: 1px; }

.dashboard-section { display: grid; gap: .8rem; }
.dashboard-section-heading,
.dashboard-panel-heading { display: flex; min-width: 0; align-items: flex-end; justify-content: space-between; gap: 1rem; }
.dashboard-section-heading > div,
.dashboard-panel-heading > div { min-width: 0; }
.dashboard-section-heading span,
.dashboard-panel-heading > div > span { color: var(--dashboard-teal); font-size: .62rem; font-weight: 850; letter-spacing: .12em; }
.dashboard-section-heading h2,
.dashboard-panel-heading h2 { margin: .2rem 0 0; color: var(--dashboard-ink); font-size: 1.02rem; letter-spacing: 0; }
.dashboard-section-heading > small { color: var(--dashboard-muted); font-size: .67rem; }

.dashboard-status-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .75rem; }
.dashboard-status-card { position: relative; display: grid; min-width: 0; min-height: 10.2rem; align-content: start; overflow: hidden; padding: 1rem; color: inherit; text-align: left; border: 1px solid var(--dashboard-line); border-top: 3px solid var(--dashboard-blue); border-radius: .9rem; background: var(--hig-bg-surface, #fff); box-shadow: 0 .45rem 1.25rem rgba(37, 87, 82, .04); cursor: pointer; transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease; }
.dashboard-status-card::after { position: absolute; right: -1.65rem; bottom: -2.45rem; width: 6.2rem; height: 6.2rem; border: 1px solid rgba(23, 118, 111, .1); border-radius: 50%; content: ''; }
.dashboard-status-card:hover,
.dashboard-status-card:focus-visible { transform: translateY(-2px); border-color: var(--dashboard-teal); outline: none; box-shadow: 0 .75rem 1.7rem rgba(23, 118, 111, .13); }
.dashboard-status-card.dashboard-tone--success { border-top-color: var(--dashboard-green); }
.dashboard-status-card.dashboard-tone--warning { border-top-color: var(--dashboard-amber); }
.dashboard-status-card.dashboard-tone--danger { border-top-color: var(--dashboard-red); }
.dashboard-status-card.dashboard-tone--info { border-top-color: var(--dashboard-blue); }
.dashboard-card-icon { position: absolute; top: .85rem; right: .9rem; display: grid; width: 2rem; height: 2rem; place-items: center; color: var(--dashboard-teal); border-radius: .62rem; background: var(--dashboard-soft); }
.dashboard-card-label { position: relative; z-index: 1; display: inline-flex; max-width: calc(100% - 2.5rem); align-items: center; gap: .34rem; color: var(--dashboard-muted); font-size: .7rem; font-weight: 850; }
.dashboard-card-label .pi-info-circle { cursor: help; }
.dashboard-status-card > strong { position: relative; z-index: 1; margin-top: .85rem; color: var(--dashboard-ink); font-family: Georgia, 'Times New Roman', serif; font-size: 1.75rem; line-height: 1; font-variant-numeric: tabular-nums; }
.dashboard-state-pill { position: relative; z-index: 1; width: fit-content; margin-top: .68rem; padding: .24rem .44rem; color: #5f7276; border-radius: 999px; background: #f1f5f4; font-size: .63rem; font-weight: 850; }
.dashboard-tone--success .dashboard-state-pill { color: #347553; background: #eff9f3; }
.dashboard-tone--warning .dashboard-state-pill { color: #96611e; background: #fff8e8; }
.dashboard-tone--danger .dashboard-state-pill { color: #a6413d; background: #fff0ee; }
.dashboard-tone--info .dashboard-state-pill { color: #416e9f; background: #eff6fc; }
.dashboard-status-card > small { position: relative; z-index: 1; margin-top: .5rem; color: var(--dashboard-muted); font-size: .65rem; }
.dashboard-card-arrow { position: absolute; right: .85rem; bottom: .8rem; z-index: 1; color: #80a8a0; font-size: .75rem; }

.dashboard-metric-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: .7rem; }
.dashboard-metric-card { position: relative; min-width: 0; min-height: 8.6rem; overflow: hidden; padding: .95rem; border: 1px solid var(--dashboard-line); border-radius: .85rem; background: var(--hig-bg-surface, #fff); box-shadow: 0 .4rem 1.2rem rgba(35, 58, 64, .035); }
.dashboard-metric-card::after { position: absolute; right: -2.2rem; bottom: -3.2rem; width: 6.8rem; height: 6.8rem; border: 1px solid rgba(77, 116, 159, .1); border-radius: 50%; content: ''; }
.dashboard-metric-card > div { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; gap: .45rem; color: var(--dashboard-muted); font-size: .67rem; font-weight: 850; }
.dashboard-metric-card > div span { display: inline-flex; min-width: 0; align-items: center; gap: .36rem; }
.dashboard-metric-card > div span i { color: var(--dashboard-teal); }
.dashboard-metric-card > div > i { flex-shrink: 0; cursor: help; }
.dashboard-metric-card > strong { position: relative; z-index: 1; display: block; margin-top: .8rem; overflow-wrap: anywhere; color: var(--dashboard-ink); font-family: Georgia, 'Times New Roman', serif; font-size: 1.24rem; line-height: 1.08; font-variant-numeric: tabular-nums; }
.dashboard-metric-card > small { position: relative; z-index: 1; display: block; margin-top: .52rem; color: var(--dashboard-teal); font-size: .63rem; font-variant-numeric: tabular-nums; }

.dashboard-main-grid,
.dashboard-bottom-grid { display: grid; grid-template-columns: minmax(0, 1.75fr) minmax(19rem, .85fr); gap: .8rem; align-items: stretch; }
.dashboard-panel { display: grid; min-width: 0; padding: 1rem; }
.dashboard-trend-panel { grid-template-columns: minmax(0, 1fr); }
.dashboard-count-badge { display: grid; min-width: 1.75rem; height: 1.75rem; place-items: center; color: #fff; border-radius: .55rem; background: var(--dashboard-red); font-size: .7rem; font-weight: 850; }
.dashboard-trend-result { display: grid; justify-items: end; gap: .1rem; }
.dashboard-trend-result span { color: var(--dashboard-muted); font-size: .65rem; }
.dashboard-trend-result strong { color: var(--dashboard-green); font-size: .86rem; }
.dashboard-trend-segments { width: fit-content; margin-top: .85rem; }
.dashboard-chart-wrap { position: relative; width: 100%; max-width: 100%; min-width: 0; height: 15.2rem; margin-top: .55rem; overflow: hidden; }
.dashboard-chart-wrap :deep(.p-chart) { width: 100% !important; max-width: 100%; min-width: 0; height: 100%; }
.dashboard-chart-wrap :deep(canvas) { width: 100% !important; max-width: 100%; height: 100% !important; }

.dashboard-action-panel,
.dashboard-notification-panel { align-content: start; }
.dashboard-action-list,
.dashboard-notification-list { display: grid; margin-top: .65rem; }
.dashboard-action-list button,
.dashboard-notification-list button { display: grid; min-width: 0; align-items: center; gap: .55rem; padding: .67rem 0; color: inherit; text-align: left; border: 0; border-bottom: 1px solid var(--dashboard-line); background: transparent; font: inherit; cursor: pointer; }
.dashboard-action-list button { grid-template-columns: auto minmax(0, 1fr) auto auto; }
.dashboard-notification-list button { grid-template-columns: auto minmax(0, 1fr) auto; }
.dashboard-action-list button:hover strong,
.dashboard-notification-list button:hover strong { color: var(--dashboard-teal); }
.dashboard-action-list button:focus-visible,
.dashboard-notification-list button:focus-visible { outline: 2px solid #8fc5b8; outline-offset: 2px; border-radius: .4rem; }
.dashboard-action-icon { display: grid; width: 1.85rem; height: 1.85rem; place-items: center; color: var(--dashboard-muted); border-radius: .55rem; background: var(--dashboard-soft); font-size: .72rem; }
.dashboard-action-icon--danger { color: var(--dashboard-red); background: #fff0ee; }
.dashboard-action-icon--warning { color: var(--dashboard-amber); background: #fff8e8; }
.dashboard-action-icon--info { color: var(--dashboard-blue); background: #eff6fc; }
.dashboard-action-copy { display: grid; min-width: 0; gap: .17rem; }
.dashboard-action-copy strong,
.dashboard-notification-list strong { overflow: hidden; color: var(--dashboard-ink); font-size: .69rem; text-overflow: ellipsis; white-space: nowrap; }
.dashboard-action-copy small,
.dashboard-notification-list small { color: var(--dashboard-muted); font-size: .61rem; }
.dashboard-action-list button > .pi-angle-right,
.dashboard-notification-list button > .pi-angle-right { color: #91a3a3; font-size: .68rem; }
.dashboard-panel-link { justify-self: end; margin-top: .45rem; }

.dashboard-tag { display: inline-flex; width: fit-content; align-items: center; justify-content: center; padding: .23rem .42rem; border-radius: 999px; color: #5f7276; background: #f1f5f4; font-size: .6rem; font-weight: 850; white-space: nowrap; }
.dashboard-tag--success { color: #347553; background: #eff9f3; }
.dashboard-tag--warning { color: #96611e; background: #fff8e8; }
.dashboard-tag--danger { color: #a6413d; background: #fff0ee; }
.dashboard-tag--info { color: #416e9f; background: #eff6fc; }
.dashboard-tag--neutral { color: #5f7276; background: #f1f5f4; }

.dashboard-games-panel { padding: 0; overflow: hidden; }
.dashboard-games-heading { padding: 1rem 1rem .8rem; }
.dashboard-game-table-wrap { min-width: 0; overflow-x: auto; border-top: 1px solid var(--dashboard-line); }
.dashboard-game-table { width: 100%; min-width: 650px; border-collapse: collapse; color: var(--dashboard-muted); font-size: .67rem; }
.dashboard-game-table th,
.dashboard-game-table td { padding: .66rem .72rem; border-bottom: 1px solid var(--dashboard-line); text-align: left; white-space: nowrap; }
.dashboard-game-table th { color: var(--dashboard-muted); background: #f5faf8; font-size: .61rem; font-weight: 850; }
.dashboard-game-table tbody tr:last-child td { border-bottom: 0; }
.dashboard-game-table tbody tr:hover { background: #fbfefd; }
.dashboard-game-table td:first-child { display: grid; min-width: 9rem; gap: .12rem; }
.dashboard-game-table td:first-child strong { color: var(--dashboard-ink); font-size: .7rem; }
.dashboard-game-table code { color: #5d7e83; font-size: .59rem; }
.dashboard-game-table td:nth-child(3),
.dashboard-game-table td:nth-child(4) { color: var(--dashboard-ink); font-weight: 750; font-variant-numeric: tabular-nums; }
.dashboard-signal { font-weight: 800; }
.dashboard-signal--up { color: var(--dashboard-green); }
.dashboard-signal--down { color: var(--dashboard-red); }
.dashboard-signal--flat { color: var(--dashboard-amber); }

.dashboard-unread { display: inline-flex; align-items: center; gap: .32rem; color: var(--dashboard-red); font-size: .64rem; font-weight: 850; }
.dashboard-unread i { font-size: .38rem; }
.dashboard-notification-mark { display: grid; width: 1.25rem; height: 1.25rem; place-items: center; border: 1px solid var(--dashboard-line); border-radius: 50%; }
.dashboard-notification-mark i { color: var(--dashboard-blue); font-size: .34rem; }
.dashboard-notification-mark--danger { border-color: #eccbc8; background: #fff7f6; }
.dashboard-notification-mark--danger i { color: var(--dashboard-red); }
.dashboard-notification-mark--warning { border-color: #efd9b3; background: #fff9ed; }
.dashboard-notification-mark--success { border-color: #c8e2d3; background: #f0faf4; }
.dashboard-notification-list button > span:nth-child(2) { display: grid; min-width: 0; gap: .18rem; }

@media (max-width: 1180px) {
    .dashboard-status-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .dashboard-metric-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .dashboard-main-grid,
    .dashboard-bottom-grid { grid-template-columns: 1fr; }
}

@media (max-width: 720px) {
    .provider-dashboard-page { padding-bottom: 1.5rem; }
    .dashboard-toolbar,
    .dashboard-section-heading,
    .dashboard-panel-heading { align-items: flex-start; flex-direction: column; }
    .dashboard-toolbar-actions { width: 100%; justify-content: space-between; }
    .dashboard-section-heading > small { max-width: 100%; }
    .dashboard-metric-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .dashboard-games-heading .dashboard-segments { width: 100%; }
    .dashboard-games-heading .dashboard-segments button { flex: 1; }
}

@media (max-width: 460px) {
    .dashboard-live-state span { white-space: normal; }
    .dashboard-toolbar-actions { align-items: stretch; }
    .dashboard-toolbar-actions .dashboard-segments { flex: 1; }
    .dashboard-toolbar-actions .dashboard-segments button { flex: 1; padding-inline: .4rem; }
    .dashboard-status-grid,
    .dashboard-metric-grid { grid-template-columns: 1fr; }
    .dashboard-trend-segments { display: grid; width: 100%; grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .dashboard-action-list button { grid-template-columns: auto minmax(0, 1fr) auto; }
    .dashboard-action-list button > .dashboard-tag { grid-column: 2; justify-self: start; }
    .dashboard-action-list button > .pi-angle-right { grid-column: 3; grid-row: 1 / span 2; }
}
</style>
