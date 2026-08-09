<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import Button from 'primevue/button'
import Chart from 'primevue/chart'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Select from 'primevue/select'
import SelectButton from 'primevue/selectbutton'
import SectionCard from '@/components/ui/SectionCard.vue'
import DateTimeRangeField from '@/components/ui/DateTimeRangeField.vue'

type DateRange = [Date | null, Date | null]
type QuickRangeKey = 'today' | 'yesterday' | 'last7' | 'last30' | 'custom'
type TrendGranularity = 'daily' | 'hourly'

interface FinanceGameRow {
    gameId: string
    gameName: string
    gameType: string
    agent: string
    betCount: number
    players: number
    betPoints: number
    payoutPoints: number
    betUsdt: number
    payoutUsdt: number
}

interface FinanceViewRow extends FinanceGameRow {
    netPoints: number
    ggrPoints: number
    netUsdt: number
    ggrUsdt: number
    averageBet: number
    perPlayerBet: number
    averageBetUsdt: number
    perPlayerBetUsdt: number
}

interface FilterState {
    dateRange: DateRange
    agent: string
    gameType: string
    game: string
}

const timezoneLabel = 'UTC+08:00 · Asia/Taipei'
const pointUnit = 'pt'
const ALL_AGENT = '全部代理商'
const ALL_GAME_TYPE = '全部遊戲類型'
const ALL_GAME = '全部遊戲'

const gameRows: FinanceGameRow[] = [
    { gameId: 'CV-001', gameName: 'Celestial Vault', gameType: '老虎機', agent: 'Aurora Network', betCount: 18420, players: 3280, betPoints: 2846500, payoutPoints: 2718180, betUsdt: 28465, payoutUsdt: 27181.8 },
    { gameId: 'ND-014', gameName: 'Neon Drift', gameType: '單人 Crash', agent: 'Northstar Gaming', betCount: 15980, players: 2940, betPoints: 2418800, payoutPoints: 2493800, betUsdt: 24188, payoutUsdt: 24938 },
    { gameId: 'LH-022', gameName: 'Lucky Harbor', gameType: '老虎機', agent: 'Aurora Network', betCount: 13760, players: 2610, betPoints: 1935600, payoutPoints: 1847100, betUsdt: 19356, payoutUsdt: 18471 },
    { gameId: 'PC-009', gameName: 'Paper Crane', gameType: '棋牌', agent: 'Meridian Play', betCount: 11240, players: 1980, betPoints: 1678800, payoutPoints: 1709400, betUsdt: 16788, payoutUsdt: 17094 },
    { gameId: 'SG-031', gameName: 'Solar Garden', gameType: '老虎機', agent: 'Northstar Gaming', betCount: 9860, players: 1730, betPoints: 1281800, payoutPoints: 1226200, betUsdt: 12818, payoutUsdt: 12262 },
    { gameId: 'FM-017', gameName: 'Fortune Mahjong', gameType: '棋牌', agent: 'Meridian Play', betCount: 8240, players: 1490, betPoints: 1042480, payoutPoints: 1010230, betUsdt: 10424.8, payoutUsdt: 10102.3 },
    { gameId: 'OR-006', gameName: 'Orbit Rush', gameType: '單人 Crash', agent: 'Cobalt Arcade', betCount: 6340, players: 1210, betPoints: 856900, payoutPoints: 882607, betUsdt: 8569, payoutUsdt: 8826.07 },
]

const agentOptions = [
    ALL_AGENT,
    'Aurora Network',
    'Northstar Gaming',
    'Meridian Play',
    'Cobalt Arcade',
]

const gameTypeOptions = [
    ALL_GAME_TYPE,
    '老虎機',
    '單人 Crash',
    '棋牌',
]

const gameOptions = computed(() => [
    ALL_GAME,
    ...gameRows.map((row) => row.gameName),
])

const quickRanges: Array<{ label: string; value: QuickRangeKey }> = [
    { label: '今日', value: 'today' },
    { label: '昨日', value: 'yesterday' },
    { label: '近 7 日', value: 'last7' },
    { label: '近 30 日', value: 'last30' },
    { label: '自訂', value: 'custom' },
]

const trendLabels = {
    daily: ['08/01', '08/02', '08/03', '08/04', '08/05', '08/06', '08/07'],
    hourly: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
}

const financialTrendValues = {
    daily: {
        bet: [1420000, 1680000, 1540000, 1890000, 2020000, 2180000, 2360000],
        payout: [1374000, 1723000, 1498000, 1793000, 1949000, 2085000, 2289087],
    },
    hourly: {
        bet: [298000, 402000, 568000, 716000, 524000, 442000],
        payout: [284000, 396000, 552000, 701000, 514000, 426000],
    },
}

const activityTrendValues = {
    daily: {
        betCount: [6840, 7820, 7440, 8560, 9120, 9640, 10240],
        players: [2480, 2760, 2640, 2940, 3120, 3260, 3410],
    },
    hourly: {
        betCount: [1240, 1680, 2240, 2880, 1960, 1540],
        players: [610, 820, 1090, 1320, 980, 760],
    },
}

const makeDayStart = (date: Date) => {
    const value = new Date(date)
    value.setHours(0, 0, 0, 0)
    return value
}

const makeDayEnd = (date: Date) => {
    const value = new Date(date)
    value.setHours(23, 59, 59, 999)
    return value
}

const makeRange = (key: Exclude<QuickRangeKey, 'custom'>): DateRange => {
    const today = new Date()
    const end = makeDayEnd(today)

    if (key === 'today') return [makeDayStart(today), end]
    if (key === 'yesterday') {
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        return [makeDayStart(yesterday), makeDayEnd(yesterday)]
    }

    const start = new Date(today)
    start.setDate(start.getDate() - (key === 'last7' ? 6 : 29))
    return [makeDayStart(start), end]
}

const copyFilters = (source: FilterState): FilterState => ({
    dateRange: [source.dateRange[0], source.dateRange[1]],
    agent: source.agent,
    gameType: source.gameType,
    game: source.game,
})

const defaultRange = makeRange('last7')
const selectedQuickRange = ref<QuickRangeKey>('last7')
const draftFilters = reactive<FilterState>({
    dateRange: defaultRange,
    agent: ALL_AGENT,
    gameType: ALL_GAME_TYPE,
    game: ALL_GAME,
})
const appliedFilters = ref<FilterState>(copyFilters(draftFilters))
const filterNotice = ref('')
const financialGranularity = ref<TrendGranularity>('daily')
const activityGranularity = ref<TrendGranularity>('daily')

const applyFilters = () => {
    appliedFilters.value = copyFilters(draftFilters)
    filterNotice.value = '已套用本地 mock 條件；正式 API 尚未接入。'
}

const resetFilters = () => {
    selectedQuickRange.value = 'last7'
    draftFilters.dateRange = makeRange('last7')
    draftFilters.agent = ALL_AGENT
    draftFilters.gameType = ALL_GAME_TYPE
    draftFilters.game = ALL_GAME
    applyFilters()
}

const chooseQuickRange = (key: QuickRangeKey) => {
    selectedQuickRange.value = key
    if (key !== 'custom') draftFilters.dateRange = makeRange(key)
}

const handleCustomRange = (value: DateRange) => {
    draftFilters.dateRange = value
    selectedQuickRange.value = 'custom'
}

const filteredGameRows = computed(() => gameRows.filter((row) => {
    const filters = appliedFilters.value
    return (filters.agent === ALL_AGENT || row.agent === filters.agent)
        && (filters.gameType === ALL_GAME_TYPE || row.gameType === filters.gameType)
        && (filters.game === ALL_GAME || row.gameName === filters.game)
}))

const toViewRow = (row: FinanceGameRow): FinanceViewRow => {
    const netPoints = row.payoutPoints - row.betPoints
    const ggrPoints = row.betPoints - row.payoutPoints
    const netUsdt = row.payoutUsdt - row.betUsdt
    const ggrUsdt = row.betUsdt - row.payoutUsdt
    return {
        ...row,
        netPoints,
        ggrPoints,
        netUsdt,
        ggrUsdt,
        averageBet: row.betCount ? row.betPoints / row.betCount : 0,
        perPlayerBet: row.players ? row.betPoints / row.players : 0,
        averageBetUsdt: row.betCount ? row.betUsdt / row.betCount : 0,
        perPlayerBetUsdt: row.players ? row.betUsdt / row.players : 0,
    }
}

const rankedGameRows = computed(() => filteredGameRows.value
    .map(toViewRow)
    .sort((left, right) => right.ggrPoints - left.ggrPoints))

const summary = computed(() => {
    const rows = filteredGameRows.value
    const total = rows.reduce((result, row) => ({
        betCount: result.betCount + row.betCount,
        players: result.players + row.players,
        betPoints: result.betPoints + row.betPoints,
        payoutPoints: result.payoutPoints + row.payoutPoints,
        betUsdt: result.betUsdt + row.betUsdt,
        payoutUsdt: result.payoutUsdt + row.payoutUsdt,
    }), { betCount: 0, players: 0, betPoints: 0, payoutPoints: 0, betUsdt: 0, payoutUsdt: 0 })

    return {
        ...total,
        netPoints: total.payoutPoints - total.betPoints,
        ggrPoints: total.betPoints - total.payoutPoints,
        netUsdt: total.payoutUsdt - total.betUsdt,
        ggrUsdt: total.betUsdt - total.payoutUsdt,
        averageBet: total.betCount ? total.betPoints / total.betCount : null,
        perPlayerBet: total.players ? total.betPoints / total.players : null,
        averageBetUsdt: total.betCount ? total.betUsdt / total.betCount : null,
        perPlayerBetUsdt: total.players ? total.betUsdt / total.players : null,
    }
})

const stats = computed(() => [
    { label: '投注總額', value: formatPoints(summary.value.betPoints), usdt: formatUsdt(summary.value.betUsdt), icon: 'pi pi-arrow-up-right', tone: 'teal', formula: '投注總額 = SUM(bet_points)' },
    { label: '派彩總額', value: formatPoints(summary.value.payoutPoints), usdt: formatUsdt(summary.value.payoutUsdt), icon: 'pi pi-arrow-down-left', tone: 'blue', formula: '派彩總額 = SUM(payout_points)' },
    { label: '淨輸贏', value: formatPoints(summary.value.netPoints), usdt: formatUsdt(summary.value.netUsdt), icon: 'pi pi-wave-pulse', tone: summary.value.netPoints >= 0 ? 'coral' : 'blue', formula: '淨輸贏 = 派彩總額 - 投注總額（prototype / draft）' },
    { label: 'GGR', value: formatPoints(summary.value.ggrPoints), usdt: formatUsdt(summary.value.ggrUsdt), icon: 'pi pi-chart-line', tone: 'coral', formula: 'GGR = 投注總額 - 派彩總額（prototype / draft）' },
    { label: '投注筆數', value: formatInteger(summary.value.betCount), usdt: null, icon: 'pi pi-list-check', tone: 'slate', helper: '有效 settled Game Round' },
    { label: '玩家人數', value: formatInteger(summary.value.players), usdt: null, icon: 'pi pi-users', tone: 'slate', helper: '不重複會員人數' },
    { label: '平均投注額', value: formatPointsOrDash(summary.value.averageBet), usdt: summary.value.averageBetUsdt === null ? null : formatUsdt(summary.value.averageBetUsdt), icon: 'pi pi-calculator', tone: 'teal', formula: '平均投注額 = 投注總額 ÷ 投注筆數（prototype / draft）' },
    { label: '人均投注額', value: formatPointsOrDash(summary.value.perPlayerBet), usdt: summary.value.perPlayerBetUsdt === null ? null : formatUsdt(summary.value.perPlayerBetUsdt), icon: 'pi pi-user', tone: 'teal', formula: '人均投注額 = 投注總額 ÷ 不重複玩家人數（prototype / draft）' },
])

const currentRangeLabel = computed(() => formatDateRange(appliedFilters.value.dateRange))

const financialChartData = computed(() => {
    const values = financialTrendValues[financialGranularity.value]
    const net = values.payout.map((payout, index) => payout - values.bet[index])
    const ggr = values.bet.map((bet, index) => bet - values.payout[index])
    return {
        labels: trendLabels[financialGranularity.value],
        datasets: [
            { label: '投注額', data: values.bet, borderColor: '#147c78', backgroundColor: 'rgba(20, 124, 120, .12)', fill: true, tension: 0.35, pointRadius: 2 },
            { label: '派彩額', data: values.payout, borderColor: '#4675a7', backgroundColor: 'rgba(70, 117, 167, .06)', fill: false, tension: 0.35, pointRadius: 2 },
            { label: '淨輸贏', data: net, borderColor: '#d98966', backgroundColor: 'rgba(217, 137, 102, .05)', fill: false, tension: 0.35, pointRadius: 2 },
            { label: 'GGR', data: ggr, borderColor: '#ae6c32', backgroundColor: 'rgba(174, 108, 50, .05)', fill: false, tension: 0.35, pointRadius: 2 },
        ],
    }
})

const activityChartData = computed(() => {
    const values = activityTrendValues[activityGranularity.value]
    return {
        labels: trendLabels[activityGranularity.value],
        datasets: [
            { label: '投注筆數', data: values.betCount, borderColor: '#147c78', backgroundColor: 'rgba(20, 124, 120, .12)', fill: true, tension: 0.35, pointRadius: 2 },
            { label: '玩家人數', data: values.players, borderColor: '#d98966', backgroundColor: 'rgba(217, 137, 102, .08)', fill: true, tension: 0.35, pointRadius: 2 },
        ],
    }
})

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
        legend: { position: 'bottom' as const, labels: { usePointStyle: true, boxWidth: 8, color: '#6f8182', padding: 16 } },
        tooltip: { callbacks: { label: (context: { dataset: { label?: string }; parsed: { y: number | null } }) => `${context.dataset.label ?? ''}: ${formatInteger(context.parsed.y ?? 0)}` } },
    },
    scales: {
        x: { grid: { display: false }, ticks: { color: '#849294' } },
        y: { grid: { color: 'rgba(111, 129, 130, .14)' }, ticks: { color: '#849294' } },
    },
}

const showExportNotice = () => {
    filterNotice.value = '匯出按鈕目前僅保留原型提示，正式 CSV / XLSX 服務尚未接入。'
}

function formatInteger(value: number) {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)
}

function formatPoints(value: number) {
    return `${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)} ${pointUnit}`
}

function formatUsdt(value: number) {
    return `≈ ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)} USDT`
}

function formatPointsOrDash(value: number | null) {
    return value === null ? '-' : formatPoints(value)
}

function formatDate(value: Date | null) {
    if (!value) return '未設定'
    return new Intl.DateTimeFormat('zh-TW', { month: '2-digit', day: '2-digit' }).format(value)
}

function formatDateRange(range: DateRange) {
    const [from, to] = range
    if (!from && !to) return '未設定'
    return `${formatDate(from)} — ${formatDate(to)}`
}
</script>

<template>
    <div class="finance-page page-stack">
        <SectionCard class="finance-filter-card">
            <template #header>
                <div class="finance-section-heading">
                    <div>
                        <span class="finance-eyebrow">QUERY SCOPE</span>
                        <h2>查詢條件</h2>
                        <p>僅查詢 production · settled Game Round；不含 DEMO 與測試環境。</p>
                    </div>
                    <span class="finance-scope-chip"><i class="pi pi-check-circle" /> Production only</span>
                </div>
            </template>

            <div class="finance-quick-range">
                <span class="finance-field-label">快速時間</span>
                <div class="finance-quick-buttons" role="group" aria-label="快速時間範圍">
                    <button
                        v-for="option in quickRanges"
                        :key="option.value"
                        type="button"
                        class="finance-quick-button"
                        :class="{ active: selectedQuickRange === option.value }"
                        @click="chooseQuickRange(option.value)"
                    >
                        {{ option.label }}
                    </button>
                </div>
            </div>

            <div class="finance-filter-grid">
                <div class="finance-filter-range">
                    <span class="finance-field-label">時間區間</span>
                    <DateTimeRangeField :model-value="draftFilters.dateRange" @update:model-value="handleCustomRange" />
                </div>
                <div class="field">
                    <label for="finance-agent">代理商</label>
                    <Select id="finance-agent" v-model="draftFilters.agent" :options="agentOptions" fluid />
                </div>
                <div class="field">
                    <label for="finance-game-type">遊戲類型</label>
                    <Select id="finance-game-type" v-model="draftFilters.gameType" :options="gameTypeOptions" fluid />
                </div>
                <div class="field">
                    <label for="finance-game">遊戲</label>
                    <Select id="finance-game" v-model="draftFilters.game" :options="gameOptions" fluid />
                </div>
                <div class="finance-filter-actions">
                    <Button label="查詢" icon="pi pi-search" @click="applyFilters" />
                    <Button label="重置" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" />
                </div>
            </div>
            <div v-if="filterNotice" class="finance-inline-notice"><i class="pi pi-info-circle" />{{ filterNotice }}</div>
        </SectionCard>

        <section class="finance-summary-grid" aria-label="財務統計卡片">
            <article v-for="stat in stats" :key="stat.label" class="finance-stat-card" :class="`finance-stat-card--${stat.tone}`">
                <div class="finance-stat-top">
                    <span class="finance-stat-label"><i :class="stat.icon" />{{ stat.label }}</span>
                    <button v-if="stat.formula" v-tooltip.top="stat.formula" type="button" class="finance-info-button" :aria-label="`${stat.label}公式說明`"><i class="pi pi-info-circle" /></button>
                </div>
                <strong class="finance-stat-value">{{ stat.value }}</strong>
                <span v-if="stat.usdt" class="finance-stat-usdt">{{ stat.usdt }}</span>
                <small>{{ stat.helper ?? 'Provider 點數主顯示 · USDT 對照' }}</small>
            </article>
        </section>

        <section class="finance-chart-grid">
            <SectionCard class="finance-panel finance-chart-panel">
                <template #header>
                    <div class="finance-section-heading">
                        <div>
                            <span class="finance-eyebrow">FINANCIAL SIGNAL</span>
                            <h2>財務金額趨勢</h2>
                            <p>Provider 點數 · {{ currentRangeLabel }} · {{ timezoneLabel }}</p>
                        </div>
                        <SelectButton v-model="financialGranularity" :options="[{ label: '每日', value: 'daily' }, { label: '每小時', value: 'hourly' }]" option-label="label" option-value="value" aria-label="財務金額趨勢粒度" />
                    </div>
                </template>
                <div class="finance-chart-legend-note"><span class="finance-dot finance-dot--teal" />投注額 <span class="finance-dot finance-dot--blue" />派彩額 <span class="finance-dot finance-dot--coral" />淨輸贏 / GGR</div>
                <div class="finance-chart-box"><Chart type="line" :data="financialChartData" :options="chartOptions" /></div>
            </SectionCard>

            <SectionCard class="finance-panel finance-chart-panel">
                <template #header>
                    <div class="finance-section-heading">
                        <div>
                            <span class="finance-eyebrow">ACTIVITY PULSE</span>
                            <h2>活躍度趨勢</h2>
                            <p>有效投注筆數與不重複玩家人數的展示型趨勢。</p>
                        </div>
                        <SelectButton v-model="activityGranularity" :options="[{ label: '每日', value: 'daily' }, { label: '每小時', value: 'hourly' }]" option-label="label" option-value="value" aria-label="活躍度趨勢粒度" />
                    </div>
                </template>
                <div class="finance-chart-legend-note"><span class="finance-dot finance-dot--teal" />投注筆數 <span class="finance-dot finance-dot--coral" />玩家人數</div>
                <div class="finance-chart-box"><Chart type="line" :data="activityChartData" :options="chartOptions" /></div>
            </SectionCard>
        </section>

        <SectionCard class="finance-panel finance-table-panel">
            <template #header>
                <div class="finance-section-heading">
                    <div>
                        <span class="finance-eyebrow">GAME PERFORMANCE</span>
                        <h2>遊戲表現排行</h2>
                        <p>依 GGR 由高至低排列；金額主要顯示 Provider 點數，USDT 為保存換算結果對照。</p>
                    </div>
                    <Button label="匯出（原型）" icon="pi pi-download" severity="secondary" outlined @click="showExportNotice" />
                </div>
            </template>

            <div class="finance-table-context">
                <span><i class="pi pi-database" /> {{ rankedGameRows.length }} 款遊戲</span>
                <span><i class="pi pi-clock" /> {{ timezoneLabel }}</span>
                <span class="finance-draft-label">DRAFT FORMULAS</span>
            </div>
            <div class="finance-table-shell">
                <DataTable class="finance-table" :value="rankedGameRows" scrollable scroll-height="31rem" striped-rows>
                    <Column field="gameName" header="遊戲名稱" frozen style="min-width: 12rem">
                        <template #body="{ data }">
                            <div class="finance-game-cell"><strong>{{ data.gameName }}</strong><small>{{ data.gameId }}</small></div>
                        </template>
                    </Column>
                    <Column field="gameType" header="遊戲類型" style="min-width: 8rem" />
                    <Column field="betCount" header="投注筆數" style="min-width: 7.5rem">
                        <template #body="{ data }">{{ formatInteger(data.betCount) }}</template>
                    </Column>
                    <Column field="players" header="玩家人數" style="min-width: 7.5rem">
                        <template #body="{ data }">{{ formatInteger(data.players) }}</template>
                    </Column>
                    <Column header="投注總額" style="min-width: 11.5rem">
                        <template #body="{ data }"><div class="finance-money-cell"><strong>{{ formatPoints(data.betPoints) }}</strong><small>{{ formatUsdt(data.betUsdt) }}</small></div></template>
                    </Column>
                    <Column header="派彩總額" style="min-width: 11.5rem">
                        <template #body="{ data }"><div class="finance-money-cell"><strong>{{ formatPoints(data.payoutPoints) }}</strong><small>{{ formatUsdt(data.payoutUsdt) }}</small></div></template>
                    </Column>
                    <Column header="淨輸贏" style="min-width: 11.5rem">
                        <template #body="{ data }"><div class="finance-money-cell" :class="{ 'is-negative': data.netPoints < 0 }"><strong>{{ formatPoints(data.netPoints) }}</strong><small>{{ formatUsdt(data.netUsdt) }}</small></div></template>
                    </Column>
                    <Column header="GGR" style="min-width: 11.5rem">
                        <template #body="{ data }"><div class="finance-money-cell" :class="{ 'is-negative': data.ggrPoints < 0 }"><strong>{{ formatPoints(data.ggrPoints) }}</strong><small>{{ formatUsdt(data.ggrUsdt) }}</small></div></template>
                    </Column>
                    <Column header="平均投注額" style="min-width: 11rem">
                        <template #body="{ data }"><div class="finance-money-cell"><strong>{{ formatPoints(data.averageBet) }}</strong><small>{{ formatUsdt(data.averageBetUsdt) }}</small></div></template>
                    </Column>
                    <Column header="人均投注額" style="min-width: 11rem">
                        <template #body="{ data }"><div class="finance-money-cell"><strong>{{ formatPoints(data.perPlayerBet) }}</strong><small>{{ formatUsdt(data.perPlayerBetUsdt) }}</small></div></template>
                    </Column>
                </DataTable>
            </div>
        </SectionCard>
    </div>
</template>

<style scoped>
.finance-page {
    --finance-ink: #17262b;
    --finance-muted: #6f8182;
    --finance-line: #dce8e4;
    --finance-soft: #f4f8f6;
    --finance-teal: #147c78;
    --finance-blue: #4675a7;
    --finance-coral: #d98966;
    --finance-deep: #10343a;
    max-width: 1400px;
    margin: 0 auto;
    padding-bottom: 2rem;
    color: var(--finance-ink);
}

:global(html.app-dark) .finance-page {
    --finance-ink: rgba(255, 255, 255, 0.92);
    --finance-muted: rgba(235, 235, 245, 0.62);
    --finance-line: rgba(255, 255, 255, 0.12);
    --finance-soft: rgba(255, 255, 255, 0.06);
    --finance-teal: #69d1c8;
    --finance-blue: #8eb7e4;
    --finance-coral: #f0a080;
    --finance-deep: #102328;
}

.finance-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: #b7f2dc;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.16em;
}

.finance-inline-notice {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    padding: 0.75rem 0.9rem;
    border: 1px solid #edd7c9;
    border-radius: 0.75rem;
    background: #fff8f2;
    color: #8d5c43;
    font-size: 0.78rem;
}

.finance-inline-notice { margin-top: 1rem; padding-block: 0.65rem; border-color: var(--finance-line); background: var(--finance-soft); color: var(--finance-muted); }
:global(html.app-dark) .finance-inline-notice { border-color: rgba(240, 160, 128, 0.28); background: rgba(240, 160, 128, 0.08); color: #f0c0a8; }

.finance-filter-card :deep(.section-card-head),
.finance-panel :deep(.section-card-head) { margin-bottom: 1.1rem; }

.finance-section-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    width: 100%;
}

.finance-eyebrow { color: var(--finance-teal); font-size: 0.62rem; letter-spacing: 0.14em; }
.finance-section-heading h2 { margin: 0.28rem 0 0.3rem; color: var(--finance-ink); font-size: 1.15rem; letter-spacing: -0.02em; }
.finance-section-heading p { margin: 0; color: var(--finance-muted); font-size: 0.78rem; line-height: 1.55; }

.finance-scope-chip,
.finance-draft-label {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    flex-shrink: 0;
    padding: 0.35rem 0.55rem;
    border: 1px solid rgba(20, 124, 120, 0.2);
    border-radius: 999px;
    background: var(--finance-soft);
    color: var(--finance-teal);
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.03em;
}

.finance-quick-range {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.7rem;
    margin-bottom: 1rem;
}

.finance-field-label,
.finance-filter-grid label { color: var(--finance-muted); font-size: 0.74rem; font-weight: 600; }
.finance-quick-buttons { display: flex; flex-wrap: wrap; gap: 0.3rem; padding: 0.22rem; border: 1px solid var(--finance-line); border-radius: 0.7rem; background: var(--finance-soft); }
.finance-quick-button { min-height: 1.95rem; padding: 0.35rem 0.62rem; border: 0; border-radius: 0.5rem; background: transparent; color: var(--finance-muted); font: inherit; font-size: 0.73rem; font-weight: 700; cursor: pointer; transition: 160ms ease; }
.finance-quick-button:hover { color: var(--finance-ink); background: rgba(20, 124, 120, 0.08); }
.finance-quick-button.active { color: #fff; background: var(--finance-teal); box-shadow: 0 0.25rem 0.8rem rgba(20, 124, 120, 0.18); }

.finance-filter-grid { display: grid; grid-template-columns: minmax(18rem, 2fr) repeat(3, minmax(9rem, 1fr)); align-items: end; gap: 0.8rem; }
.finance-filter-range { display: grid; gap: 0.35rem; min-width: 0; }
.finance-filter-range :deep(.date-time-range) { min-width: 0; }
.finance-filter-grid > .field { display: grid; gap: 0.35rem; min-width: 0; }
.finance-filter-actions { display: flex; justify-content: flex-end; gap: 0.5rem; grid-column: 1 / -1; }

.finance-summary-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.85rem; }
.finance-stat-card { position: relative; min-width: 0; overflow: hidden; padding: 1rem 1.05rem 1.1rem; border: 1px solid var(--finance-line); border-radius: 1rem; background: var(--hig-bg-surface); box-shadow: 0 0.7rem 1.8rem rgba(37, 87, 82, 0.05); }
.finance-stat-card::after { position: absolute; right: -1.1rem; bottom: -2rem; width: 5.2rem; height: 5.2rem; border: 1px solid rgba(20, 124, 120, 0.12); border-radius: 50%; content: ''; }
.finance-stat-card--coral { border-top: 2px solid var(--finance-coral); }
.finance-stat-card--blue { border-top: 2px solid var(--finance-blue); }
.finance-stat-card--teal { border-top: 2px solid var(--finance-teal); }
.finance-stat-card--slate { border-top: 2px solid #8a9899; }
.finance-stat-top { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
.finance-stat-label { display: inline-flex; align-items: center; gap: 0.42rem; color: var(--finance-muted); font-size: 0.74rem; font-weight: 700; }
.finance-stat-label i { color: var(--finance-teal); font-size: 0.82rem; }
.finance-info-button { display: grid; width: 1.55rem; height: 1.55rem; place-items: center; border: 0; border-radius: 50%; background: var(--finance-soft); color: var(--finance-muted); cursor: help; }
.finance-info-button:hover { color: var(--finance-teal); background: rgba(20, 124, 120, 0.12); }
.finance-stat-value { display: block; margin-top: 0.65rem; color: var(--finance-ink); font-family: Georgia, 'Times New Roman', serif; font-size: clamp(1.2rem, 2vw, 1.55rem); letter-spacing: -0.045em; line-height: 1.15; font-variant-numeric: tabular-nums; }
.finance-stat-usdt { display: block; margin-top: 0.28rem; color: var(--finance-teal); font-size: 0.72rem; font-variant-numeric: tabular-nums; }
.finance-stat-card small { display: block; margin-top: 0.6rem; color: var(--finance-muted); font-size: 0.68rem; line-height: 1.4; }

.finance-chart-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.finance-panel { min-width: 0; }
.finance-panel :deep(.p-selectbutton) { flex-shrink: 0; }
.finance-chart-legend-note { display: flex; align-items: center; flex-wrap: wrap; gap: 0.42rem; margin-bottom: 0.55rem; color: var(--finance-muted); font-size: 0.68rem; }
.finance-dot { width: 0.45rem; height: 0.45rem; margin-left: 0.25rem; border-radius: 50%; }
.finance-dot--teal { background: var(--finance-teal); }
.finance-dot--blue { background: var(--finance-blue); }
.finance-dot--coral { background: var(--finance-coral); }
.finance-chart-box { height: 17.5rem; min-width: 0; }
.finance-chart-box :deep(.p-chart) { display: block; width: 100%; height: 100%; }
.finance-chart-box :deep(canvas) { max-width: 100%; }

.finance-table-context { display: flex; align-items: center; flex-wrap: wrap; gap: 0.85rem; margin-bottom: 0.8rem; color: var(--finance-muted); font-size: 0.7rem; }
.finance-table-context span { display: inline-flex; align-items: center; gap: 0.32rem; }
.finance-table-context i { color: var(--finance-teal); }
.finance-draft-label { padding: 0.28rem 0.5rem; border-color: rgba(217, 137, 102, 0.25); color: var(--finance-coral); font-size: 0.6rem; }
.finance-table-shell { min-width: 0; overflow: hidden; border: 1px solid var(--finance-line); border-radius: 0.8rem; }
.finance-table :deep(.p-datatable-thead > tr > th) { white-space: nowrap; color: var(--finance-muted); background: var(--finance-soft); font-size: 0.7rem; }
.finance-table :deep(.p-datatable-tbody > tr > td) { color: var(--finance-ink); font-size: 0.76rem; vertical-align: middle; }
.finance-table :deep(.p-datatable-tbody > tr > td.p-frozen-column),
.finance-table :deep(.p-datatable-thead > tr > th.p-frozen-column) { background: var(--hig-bg-surface); }
.finance-game-cell, .finance-money-cell { display: grid; gap: 0.18rem; min-width: 0; }
.finance-game-cell strong, .finance-money-cell strong { color: var(--finance-ink); font-variant-numeric: tabular-nums; }
.finance-game-cell small, .finance-money-cell small { color: var(--finance-muted); font-size: 0.66rem; font-variant-numeric: tabular-nums; white-space: nowrap; }
.finance-money-cell.is-negative strong { color: var(--finance-coral); }

@media (max-width: 1180px) {
    .finance-summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .finance-filter-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .finance-filter-range, .finance-filter-actions { grid-column: 1 / -1; }
}

@media (max-width: 900px) {
    .finance-chart-grid { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
    .finance-section-heading { align-items: stretch; flex-direction: column; }
    .finance-section-heading > .p-selectbutton,
    .finance-section-heading > .p-button { width: 100%; }
    .finance-filter-grid { grid-template-columns: 1fr; }
    .finance-filter-range, .finance-filter-actions { grid-column: auto; }
    .finance-filter-actions { justify-content: stretch; }
    .finance-filter-actions .p-button { flex: 1; }
    .finance-summary-grid { grid-template-columns: 1fr; }
    .finance-chart-box { height: 15rem; }
    .finance-quick-range { align-items: flex-start; flex-direction: column; }
    .finance-quick-buttons { width: 100%; }
    .finance-quick-button { flex: 1; }
}
</style>
