<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import RadioButton from 'primevue/radiobutton'
import Select from 'primevue/select'
import DateTimeRangeField from '@/components/ui/DateTimeRangeField.vue'
import SectionCard from '@/components/ui/SectionCard.vue'

type DateRange = [Date | null, Date | null]
type QuickRangeKey = 'today' | 'yesterday' | 'last7' | 'last30' | 'custom'
type GameType = 'slots' | 'crash' | 'table'
type SortField = 'agentName' | 'gameName' | 'gameType' | 'betCount' | 'players' | 'betPoints' | 'payoutPoints' | 'netPoints' | 'ggrPoints' | 'averageBet' | 'perPlayerBet'
type SortOrder = 'asc' | 'desc'
type ExportFormat = 'csv' | 'xlsx'

interface AgentGameRow {
    id: string
    agentId: string
    agentName: string
    gameId: string
    gameName: string
    gameType: GameType
    settledAt: Date
    playerIds: string[]
    betCount: number
    betPoints: number
    payoutPoints: number
    betUsdt: number
    payoutUsdt: number
}

interface AgentGameViewRow extends AgentGameRow {
    players: number
    netPoints: number
    ggrPoints: number
    netUsdt: number
    ggrUsdt: number
    averageBet: number | null
    perPlayerBet: number | null
    averageBetUsdt: number | null
    perPlayerBetUsdt: number | null
}

interface FilterState {
    dateRange: DateRange
    agent: string
    gameType: GameType | ''
    game: string
}

interface DataTablePageEvent {
    first?: number
    rows?: number
}

interface DataTableRowEvent {
    data: AgentGameViewRow
}

interface ExportField {
    key: string
    label: string
}

const router = useRouter()
const timezoneLabel = 'UTC+08:00 · Asia/Taipei'
const pointUnit = 'pt'
const ALL_AGENT = ''
const ALL_GAME_TYPE = ''
const ALL_GAME = ''

const gameTypeLabels: Record<GameType, string> = {
    slots: '老虎機',
    crash: '單人 Crash',
    table: '棋牌',
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

const makeSettledAt = (daysAgo: number, hour = 14) => {
    const value = new Date()
    value.setDate(value.getDate() - daysAgo)
    value.setHours(hour, 20, 0, 0)
    return value
}

const makePlayerIds = (prefix: string, count: number, shared: string[] = []) => [
    ...shared,
    ...Array.from({ length: Math.max(0, count - shared.length) }, (_, index) => `${prefix}-${String(index + 1).padStart(4, '0')}`),
]

// playerIds intentionally stay internal to the mock. Shared IDs between rows make
// the summary's distinct-player calculation behave like a real backend aggregate.
const auroraSharedPlayers = Array.from({ length: 24 }, (_, index) => `aurora-shared-${String(index + 1).padStart(3, '0')}`)
const northstarSharedPlayers = Array.from({ length: 16 }, (_, index) => `northstar-shared-${String(index + 1).padStart(3, '0')}`)
const meridianSharedPlayers = Array.from({ length: 12 }, (_, index) => `meridian-shared-${String(index + 1).padStart(3, '0')}`)

const mockRows: AgentGameRow[] = [
    { id: 'aura-cv', agentId: 'agent-a031', agentName: 'Aurora Network', gameId: 'CV-001', gameName: 'Celestial Vault', gameType: 'slots', settledAt: makeSettledAt(0, 15), playerIds: makePlayerIds('aurora-cv', 328, auroraSharedPlayers), betCount: 18420, betPoints: 2846500, payoutPoints: 2718180, betUsdt: 28465, payoutUsdt: 27181.8 },
    { id: 'north-nd', agentId: 'agent-b204', agentName: 'Northstar Gaming', gameId: 'ND-014', gameName: 'Neon Drift', gameType: 'crash', settledAt: makeSettledAt(0, 14), playerIds: makePlayerIds('northstar-nd', 294, northstarSharedPlayers), betCount: 15980, betPoints: 2418800, payoutPoints: 2493800, betUsdt: 24188, payoutUsdt: 24938 },
    { id: 'aura-lh', agentId: 'agent-a031', agentName: 'Aurora Network', gameId: 'LH-022', gameName: 'Lucky Harbor', gameType: 'slots', settledAt: makeSettledAt(1, 18), playerIds: makePlayerIds('aurora-lh', 261, auroraSharedPlayers), betCount: 13760, betPoints: 1935600, payoutPoints: 1847100, betUsdt: 19356, payoutUsdt: 18471 },
    { id: 'meridian-pc', agentId: 'agent-c118', agentName: 'Meridian Play', gameId: 'PC-009', gameName: 'Paper Crane', gameType: 'table', settledAt: makeSettledAt(1, 17), playerIds: makePlayerIds('meridian-pc', 198, meridianSharedPlayers), betCount: 11240, betPoints: 1678800, payoutPoints: 1709400, betUsdt: 16788, payoutUsdt: 17094 },
    { id: 'north-sg', agentId: 'agent-b204', agentName: 'Northstar Gaming', gameId: 'SG-031', gameName: 'Solar Garden', gameType: 'slots', settledAt: makeSettledAt(2, 16), playerIds: makePlayerIds('northstar-sg', 173, northstarSharedPlayers), betCount: 9860, betPoints: 1281800, payoutPoints: 1226200, betUsdt: 12818, payoutUsdt: 12262 },
    { id: 'meridian-fm', agentId: 'agent-c118', agentName: 'Meridian Play', gameId: 'FM-017', gameName: 'Fortune Mahjong', gameType: 'table', settledAt: makeSettledAt(2, 13), playerIds: makePlayerIds('meridian-fm', 149, meridianSharedPlayers), betCount: 8240, betPoints: 1042480, payoutPoints: 1010230, betUsdt: 10424.8, payoutUsdt: 10102.3 },
    { id: 'cobalt-or', agentId: 'agent-d226', agentName: 'Cobalt Arcade', gameId: 'OR-006', gameName: 'Orbit Rush', gameType: 'crash', settledAt: makeSettledAt(3, 20), playerIds: makePlayerIds('cobalt-or', 121), betCount: 6340, betPoints: 856900, payoutPoints: 882607, betUsdt: 8569, payoutUsdt: 8826.07 },
    { id: 'aura-rb', agentId: 'agent-a031', agentName: 'Aurora Network', gameId: 'RB-041', gameName: 'River Bloom', gameType: 'slots', settledAt: makeSettledAt(3, 11), playerIds: makePlayerIds('aurora-rb', 116, auroraSharedPlayers), betCount: 5890, betPoints: 742300, payoutPoints: 701920, betUsdt: 7423, payoutUsdt: 7019.2 },
    { id: 'north-mf', agentId: 'agent-b204', agentName: 'Northstar Gaming', gameId: 'MF-008', gameName: 'Meteor Forge', gameType: 'crash', settledAt: makeSettledAt(4, 19), playerIds: makePlayerIds('northstar-mf', 94, northstarSharedPlayers), betCount: 4980, betPoints: 624800, payoutPoints: 593560, betUsdt: 6248, payoutUsdt: 5935.6 },
    { id: 'meridian-rp', agentId: 'agent-c118', agentName: 'Meridian Play', gameId: 'RP-012', gameName: 'Royal Pavilion', gameType: 'table', settledAt: makeSettledAt(4, 10), playerIds: makePlayerIds('meridian-rp', 82, meridianSharedPlayers), betCount: 4320, betPoints: 518400, payoutPoints: 535420, betUsdt: 5184, payoutUsdt: 5354.2 },
    { id: 'cobalt-ss', agentId: 'agent-d226', agentName: 'Cobalt Arcade', gameId: 'SS-019', gameName: 'Skyline Sprint', gameType: 'crash', settledAt: makeSettledAt(5, 15), playerIds: makePlayerIds('cobalt-ss', 77), betCount: 3920, betPoints: 471600, payoutPoints: 438588, betUsdt: 4716, payoutUsdt: 4385.88 },
    { id: 'aura-mc', agentId: 'agent-a031', agentName: 'Aurora Network', gameId: 'MC-033', gameName: 'Moonlit Caravan', gameType: 'slots', settledAt: makeSettledAt(6, 12), playerIds: makePlayerIds('aurora-mc', 72, auroraSharedPlayers), betCount: 3480, betPoints: 429040, payoutPoints: 416168, betUsdt: 4290.4, payoutUsdt: 4161.68 },
    { id: 'north-ef', agentId: 'agent-b204', agentName: 'Northstar Gaming', gameId: 'EF-027', gameName: 'Ember Falls', gameType: 'slots', settledAt: makeSettledAt(7, 16), playerIds: makePlayerIds('northstar-ef', 61, northstarSharedPlayers), betCount: 2980, betPoints: 358600, payoutPoints: 376530, betUsdt: 3586, payoutUsdt: 3765.3 },
    { id: 'meridian-cc', agentId: 'agent-c118', agentName: 'Meridian Play', gameId: 'CC-005', gameName: 'Cloud Canton', gameType: 'table', settledAt: makeSettledAt(8, 14), playerIds: makePlayerIds('meridian-cc', 58, meridianSharedPlayers), betCount: 2660, betPoints: 332500, payoutPoints: 319200, betUsdt: 3325, payoutUsdt: 3192 },
    { id: 'cobalt-bp', agentId: 'agent-d226', agentName: 'Cobalt Arcade', gameId: 'BP-013', gameName: 'Beacon Pulse', gameType: 'crash', settledAt: makeSettledAt(12, 18), playerIds: makePlayerIds('cobalt-bp', 48), betCount: 2210, betPoints: 287300, payoutPoints: 300015, betUsdt: 2873, payoutUsdt: 3000.15 },
    { id: 'aura-ff', agentId: 'agent-a031', agentName: 'Aurora Network', gameId: 'FF-018', gameName: 'Frosted Fortune', gameType: 'slots', settledAt: makeSettledAt(16, 9), playerIds: makePlayerIds('aurora-ff', 42, auroraSharedPlayers), betCount: 1870, betPoints: 246840, payoutPoints: 229561, betUsdt: 2468.4, payoutUsdt: 2295.61 },
    { id: 'north-gl', agentId: 'agent-b204', agentName: 'Northstar Gaming', gameId: 'GL-021', gameName: 'Golden Lantern', gameType: 'slots', settledAt: makeSettledAt(24, 13), playerIds: makePlayerIds('northstar-gl', 39, northstarSharedPlayers), betCount: 1640, betPoints: 198440, payoutPoints: 207370, betUsdt: 1984.4, payoutUsdt: 2073.7 },
    { id: 'meridian-tt', agentId: 'agent-c118', agentName: 'Meridian Play', gameId: 'TT-026', gameName: 'Tea Table', gameType: 'table', settledAt: makeSettledAt(28, 11), playerIds: makePlayerIds('meridian-tt', 35, meridianSharedPlayers), betCount: 1290, betPoints: 161250, payoutPoints: 154000, betUsdt: 1612.5, payoutUsdt: 1540 },
]

const agentOptions = [
    { label: '全部代理商', value: ALL_AGENT },
    ...Array.from(new Map(mockRows.map((row) => [row.agentId, row.agentName])).entries()).map(([value, label]) => ({ label, value })),
]
const gameTypeOptions = [
    { label: '全部遊戲類型', value: ALL_GAME_TYPE },
    ...Object.entries(gameTypeLabels).map(([value, label]) => ({ label, value: value as GameType })),
]
const gameOptions = [
    { label: '全部遊戲', value: ALL_GAME },
    ...mockRows.map((row) => ({ label: `${row.gameName} · ${row.gameId}`, value: row.gameId })),
]
const quickRanges: Array<{ label: string; value: QuickRangeKey }> = [
    { label: '今日', value: 'today' },
    { label: '昨日', value: 'yesterday' },
    { label: '近 7 日', value: 'last7' },
    { label: '近 30 日', value: 'last30' },
    { label: '自訂', value: 'custom' },
]

const copyFilters = (source: FilterState): FilterState => ({
    dateRange: [source.dateRange[0], source.dateRange[1]],
    agent: source.agent,
    gameType: source.gameType,
    game: source.game,
})

const defaultRange = makeRange('last7')
const selectedQuickRange = ref<QuickRangeKey>('last7')
const draftFilters = reactive<FilterState>({ dateRange: defaultRange, agent: ALL_AGENT, gameType: ALL_GAME_TYPE, game: ALL_GAME })
const appliedFilters = ref<FilterState>(copyFilters(draftFilters))
const filterNotice = ref('')
const exportVisible = ref(false)
const exportFormat = ref<ExportFormat>('xlsx')
const pageSize = ref(10)
const first = ref(0)
const sortBy = ref<SortField>('betPoints')
const sortOrder = ref<SortOrder>('desc')

const requiredExportFields: ExportField[] = [
    { key: 'agent_id', label: '代理商 ID' },
    { key: 'agent_name', label: '代理商名稱' },
    { key: 'game_id', label: '遊戲 ID' },
    { key: 'game_name', label: '遊戲名稱' },
    { key: 'game_type', label: '遊戲類型' },
    { key: 'query_range', label: '查詢時間區間' },
    { key: 'generated_at', label: '報表產生時間' },
    { key: 'timezone', label: '時區' },
]
const optionalExportGroups: Array<{ label: string; fields: ExportField[] }> = [
    { label: '活躍數據', fields: [{ key: 'bet_count', label: '投注筆數' }, { key: 'players', label: '不重複玩家人數' }] },
    { label: '金額數據', fields: [{ key: 'bet', label: '投注' }, { key: 'payout', label: '派彩' }, { key: 'net', label: '淨輸贏' }, { key: 'ggr', label: 'GGR' }] },
    { label: '效率指標', fields: [{ key: 'average_bet', label: '平均投注額' }, { key: 'per_player_bet', label: '人均投注額' }] },
    { label: '貨幣欄位', fields: [{ key: 'provider_points', label: 'Provider 點數' }, { key: 'usdt', label: 'USDT' }] },
]
const exportSelections = reactive<Record<string, boolean>>(
    Object.fromEntries(optionalExportGroups.flatMap((group) => group.fields).map((field) => [field.key, true]))
)

const filteredRows = computed(() => mockRows.filter((row) => {
    const filters = appliedFilters.value
    const [from, to] = filters.dateRange
    return (filters.agent === ALL_AGENT || row.agentId === filters.agent)
        && (filters.gameType === ALL_GAME_TYPE || row.gameType === filters.gameType)
        && (filters.game === ALL_GAME || row.gameId === filters.game)
        && (!from || row.settledAt.getTime() >= from.getTime())
        && (!to || row.settledAt.getTime() <= to.getTime())
}))

const toViewRow = (row: AgentGameRow): AgentGameViewRow => {
    const players = row.playerIds.length
    const netPoints = row.payoutPoints - row.betPoints
    const ggrPoints = row.betPoints - row.payoutPoints
    const netUsdt = row.payoutUsdt - row.betUsdt
    const ggrUsdt = row.betUsdt - row.payoutUsdt
    return {
        ...row,
        players,
        netPoints,
        ggrPoints,
        netUsdt,
        ggrUsdt,
        averageBet: row.betCount ? row.betPoints / row.betCount : null,
        perPlayerBet: players ? row.betPoints / players : null,
        averageBetUsdt: row.betCount ? row.betUsdt / row.betCount : null,
        perPlayerBetUsdt: players ? row.betUsdt / players : null,
    }
}

const sortedRows = computed(() => {
    const rows = filteredRows.value.map(toViewRow)
    return rows.sort((left, right) => {
        const leftValue = left[sortBy.value]
        const rightValue = right[sortBy.value]
        const comparison = typeof leftValue === 'string' && typeof rightValue === 'string'
            ? leftValue.localeCompare(rightValue, 'zh-Hant')
            : Number(leftValue ?? 0) - Number(rightValue ?? 0)
        return sortOrder.value === 'asc' ? comparison : -comparison
    })
})

const visibleRows = computed(() => sortedRows.value.slice(first.value, first.value + pageSize.value))

const summary = computed(() => {
    const rows = filteredRows.value
    const totals = rows.reduce((result, row) => ({
        betCount: result.betCount + row.betCount,
        betPoints: result.betPoints + row.betPoints,
        payoutPoints: result.payoutPoints + row.payoutPoints,
        betUsdt: result.betUsdt + row.betUsdt,
        payoutUsdt: result.payoutUsdt + row.payoutUsdt,
    }), { betCount: 0, betPoints: 0, payoutPoints: 0, betUsdt: 0, payoutUsdt: 0 })
    const distinctPlayers = new Set(rows.flatMap((row) => row.playerIds)).size
    return {
        ...totals,
        players: distinctPlayers,
        netPoints: totals.payoutPoints - totals.betPoints,
        ggrPoints: totals.betPoints - totals.payoutPoints,
        netUsdt: totals.payoutUsdt - totals.betUsdt,
        ggrUsdt: totals.betUsdt - totals.payoutUsdt,
    }
})

const stats = computed(() => [
    { label: '投注總額', value: formatPoints(summary.value.betPoints), usdt: formatUsdt(summary.value.betUsdt), icon: 'pi pi-arrow-up-right', tone: 'teal', formula: '投注總額 = SUM(bet_points)，僅統計有效 settled Game Round。' },
    { label: '派彩總額', value: formatPoints(summary.value.payoutPoints), usdt: formatUsdt(summary.value.payoutUsdt), icon: 'pi pi-arrow-down-left', tone: 'blue', formula: '派彩總額 = SUM(payout_points)，統計時間使用 settled_at。' },
    { label: '淨輸贏', value: formatSignedPoints(summary.value.netPoints), usdt: formatSignedUsdt(summary.value.netUsdt), icon: 'pi pi-wave-pulse', tone: summary.value.netPoints >= 0 ? 'coral' : 'blue', formula: '淨輸贏 = 派彩總額 − 投注總額。' },
    { label: 'GGR', value: formatSignedPoints(summary.value.ggrPoints), usdt: formatSignedUsdt(summary.value.ggrUsdt), icon: 'pi pi-chart-line', tone: 'coral', formula: 'GGR = 投注總額 − 派彩總額（prototype / draft）。' },
    { label: '投注筆數', value: formatInteger(summary.value.betCount), usdt: '', icon: 'pi pi-list-check', tone: 'slate', formula: '有效 settled Game Round 的筆數。' },
    { label: '玩家人數', value: formatInteger(summary.value.players), usdt: '', icon: 'pi pi-users', tone: 'slate', formula: '指定範圍內不重複玩家人數；mock 以隱藏 player identity union 計算。' },
])

const currentRangeLabel = computed(() => formatDateRange(appliedFilters.value.dateRange))
const currentRangeQueryLabel = computed(() => `${currentRangeLabel.value} · ${timezoneLabel}`)

watch(sortedRows, (rows) => {
    if (first.value >= rows.length && rows.length > 0) first.value = 0
})

function applyFilters() {
    const [from, to] = draftFilters.dateRange
    if (from && to && from.getTime() > to.getTime()) {
        filterNotice.value = '時間區間無效：起始時間不可晚於結束時間。'
        return
    }
    appliedFilters.value = copyFilters(draftFilters)
    first.value = 0
    filterNotice.value = '已套用本地 mock 條件；摘要統計完整篩選結果，不受分頁限制。'
}

function resetFilters() {
    selectedQuickRange.value = 'last7'
    draftFilters.dateRange = makeRange('last7')
    draftFilters.agent = ALL_AGENT
    draftFilters.gameType = ALL_GAME_TYPE
    draftFilters.game = ALL_GAME
    applyFilters()
}

function chooseQuickRange(key: QuickRangeKey) {
    selectedQuickRange.value = key
    if (key !== 'custom') draftFilters.dateRange = makeRange(key)
}

function handleCustomRange(value: DateRange) {
    draftFilters.dateRange = value
    selectedQuickRange.value = 'custom'
}

function handlePage(event: DataTablePageEvent) {
    first.value = event.first ?? 0
    if (event.rows && event.rows !== pageSize.value) {
        pageSize.value = event.rows
        first.value = 0
    }
}

function requestSort(field: SortField) {
    if (sortBy.value === field) sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    else {
        sortBy.value = field
        sortOrder.value = 'asc'
    }
    first.value = 0
}

function sortIcon(field: SortField) {
    if (sortBy.value !== field) return 'pi pi-sort-alt'
    return sortOrder.value === 'asc' ? 'pi pi-sort-amount-up' : 'pi pi-sort-amount-down'
}

function openExport() {
    if (!filteredRows.value.length) return
    exportVisible.value = true
}

function runMockExport() {
    const selectedCount = optionalExportGroups.reduce((count, group) => count + group.fields.filter((field) => exportSelections[field.key]).length, 0)
    filterNotice.value = `已模擬建立 ${exportFormat.value.toUpperCase()} 匯出設定：${filteredRows.value.length} 組完整篩選結果、${selectedCount} 個可選欄位。正式產檔服務尚未接入。`
    exportVisible.value = false
}

function openRoundDetails(row: AgentGameViewRow) {
    const [from, to] = appliedFilters.value.dateRange
    router.push({
        path: '/reports',
        query: {
            environment: 'production',
            from: from ? from.toISOString() : undefined,
            to: to ? to.toISOString() : undefined,
            agent_query: row.agentId,
            game_type: row.gameType,
            game_query: row.gameId,
        },
    })
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

function formatSignedPoints(value: number) {
    if (value > 0) return `+${formatPoints(value)}`
    if (value < 0) return `−${formatPoints(Math.abs(value))}`
    return formatPoints(0)
}

function formatSignedUsdt(value: number) {
    if (value > 0) return `≈ +${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)} USDT`
    if (value < 0) return `≈ −${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(value))} USDT`
    return formatUsdt(0)
}

function formatDate(value: Date | null) {
    if (!value) return '未設定'
    return new Intl.DateTimeFormat('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(value)
}

function formatDateRange(range: DateRange) {
    const [from, to] = range
    if (!from && !to) return '未設定'
    return `${formatDate(from)} — ${formatDate(to)}`
}

function isNegative(value: number) {
    return value < 0
}
</script>

<template>
    <div class="agent-games-page page-stack">
        <SectionCard class="agent-games-filter-card">
            <template #header>
                <div class="agent-games-section-heading">
                    <div>
                        <span class="agent-games-eyebrow">QUERY SCOPE</span>
                        <h2>查詢條件</h2>
                        <p>固定 production · 僅有效 settled Game Round；不含 DEMO、測試、商戶或對帳狀態。</p>
                    </div>
                    <span class="agent-games-scope-chip"><i class="pi pi-check-circle" /> Production only</span>
                </div>
            </template>

            <div class="agent-games-quick-range">
                <span class="agent-games-field-label">快速時間</span>
                <div class="agent-games-quick-buttons" role="group" aria-label="快速時間範圍">
                    <button
                        v-for="option in quickRanges"
                        :key="option.value"
                        type="button"
                        class="agent-games-quick-button"
                        :class="{ active: selectedQuickRange === option.value }"
                        @click="chooseQuickRange(option.value)"
                    >
                        {{ option.label }}
                    </button>
                </div>
            </div>

            <div class="agent-games-filter-grid">
                <div class="agent-games-filter-range">
                    <span class="agent-games-field-label">時間區間</span>
                    <DateTimeRangeField :model-value="draftFilters.dateRange" @update:model-value="handleCustomRange" />
                </div>
                <div class="field">
                    <label for="agent-games-agent">代理商</label>
                    <Select id="agent-games-agent" v-model="draftFilters.agent" :options="agentOptions" option-label="label" option-value="value" fluid />
                </div>
                <div class="field">
                    <label for="agent-games-type">遊戲類型</label>
                    <Select id="agent-games-type" v-model="draftFilters.gameType" :options="gameTypeOptions" option-label="label" option-value="value" fluid />
                </div>
                <div class="field">
                    <label for="agent-games-game">單款遊戲</label>
                    <Select id="agent-games-game" v-model="draftFilters.game" :options="gameOptions" option-label="label" option-value="value" fluid />
                </div>
                <div class="agent-games-filter-actions">
                    <Button label="查詢" icon="pi pi-search" @click="applyFilters" />
                    <Button label="重置" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" />
                </div>
            </div>
            <div v-if="filterNotice" class="agent-games-inline-notice"><i class="pi pi-info-circle" />{{ filterNotice }}</div>
        </SectionCard>

        <section class="agent-games-summary-grid" aria-label="篩選結果摘要">
            <article v-for="stat in stats" :key="stat.label" class="agent-games-stat-card" :class="`agent-games-stat-card--${stat.tone}`">
                <div class="agent-games-stat-top">
                    <span class="agent-games-stat-label"><i :class="stat.icon" />{{ stat.label }}</span>
                    <button v-tooltip.top="stat.formula" type="button" class="agent-games-info-button" :aria-label="`${stat.label}公式說明`"><i class="pi pi-info-circle" /></button>
                </div>
                <strong class="agent-games-stat-value">{{ stat.value }}</strong>
                <span v-if="stat.usdt" class="agent-games-stat-usdt">{{ stat.usdt }}</span>
                <small>{{ stat.label === '玩家人數' ? '指定範圍內不重複玩家' : stat.label === '投注筆數' ? '有效 settled Game Round' : 'Provider 點數主顯示 · USDT 對照' }}</small>
            </article>
        </section>

        <section class="agent-games-results-section">
            <div class="agent-games-results-toolbar">
                <div>
                    <span class="agent-games-eyebrow">AGGREGATED RESULT</span>
                    <h2>代理商 × 遊戲明細彙總</h2>
                    <p>{{ currentRangeQueryLabel }} · 共 {{ formatInteger(sortedRows.length) }} 組；先排序，再分頁。</p>
                </div>
                <div class="agent-games-results-actions">
                    <span class="agent-games-result-count"><i class="pi pi-database" /> {{ formatInteger(sortedRows.length) }} 組結果</span>
                    <Button label="匯出" icon="pi pi-download" :disabled="!filteredRows.length" @click="openExport" />
                </div>
            </div>

            <SectionCard class="agent-games-table-card">
                <div v-if="!filteredRows.length" class="agent-games-empty-state">
                    <div class="agent-games-empty-icon"><i class="pi pi-search" /></div>
                    <div>
                        <strong>查無符合條件的彙總資料</strong>
                        <p>目前篩選沒有有效的 production Game Round 彙總，請調整條件或清除篩選。</p>
                    </div>
                    <Button label="重置篩選" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" />
                </div>

                <div v-else class="agent-games-table-stage">
                    <div class="agent-games-table-shell">
                        <DataTable
                            class="agent-games-data-table"
                            :value="sortedRows"
                            data-key="id"
                            scrollable
                            paginator
                            :first="first"
                            :rows="pageSize"
                            :rows-per-page-options="[10, 20, 50]"
                            paginator-template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
                            current-page-report-template="{first}-{last} / {totalRecords}"
                            table-style="min-width: 1692px"
                            @page="handlePage"
                            @row-click="(event: DataTableRowEvent) => openRoundDetails(event.data)"
                        >
                        <Column frozen style="width: 216px; min-width: 216px">
                            <template #header><button v-tooltip.top="'GGAP 傳入的代理商 ID 與名稱；不含商戶維度。'" class="agent-games-sort-button" type="button" @click="requestSort('agentName')">代理商 <i :class="sortIcon('agentName')" /></button></template>
                            <template #body="{ data }"><div class="agent-games-identity-cell"><strong>{{ data.agentName }}</strong><small>{{ data.agentId }}</small></div></template>
                        </Column>
                        <Column frozen style="width: 210px; min-width: 210px">
                            <template #header><button v-tooltip.top="'Game ID 與遊戲名稱；點擊列可導入既有 Game Round 明細。'" class="agent-games-sort-button" type="button" @click="requestSort('gameName')">遊戲 <i :class="sortIcon('gameName')" /></button></template>
                            <template #body="{ data }"><div class="agent-games-identity-cell"><strong>{{ data.gameName }}</strong><small>{{ data.gameId }}</small></div></template>
                        </Column>
                        <Column style="width: 118px; min-width: 118px">
                            <template #header><button v-tooltip.top="'依遊戲主資料類型分組。'" class="agent-games-sort-button" type="button" @click="requestSort('gameType')">遊戲類型 <i :class="sortIcon('gameType')" /></button></template>
                            <template #body="{ data }"><span class="agent-games-type-pill">{{ gameTypeLabels[data.gameType] }}</span></template>
                        </Column>
                        <Column style="width: 112px; min-width: 112px">
                            <template #header><button v-tooltip.top="'有效 settled Game Round 筆數。'" class="agent-games-sort-button" type="button" @click="requestSort('betCount')">投注筆數 <i :class="sortIcon('betCount')" /></button></template>
                            <template #body="{ data }"><span class="agent-games-number-cell">{{ formatInteger(data.betCount) }}</span></template>
                        </Column>
                        <Column style="width: 112px; min-width: 112px">
                            <template #header><button v-tooltip.top="'指定查詢範圍內不重複玩家人數；不是各遊戲玩家數直接相加。'" class="agent-games-sort-button" type="button" @click="requestSort('players')">玩家人數 <i :class="sortIcon('players')" /></button></template>
                            <template #body="{ data }"><div class="agent-games-number-cell"><strong>{{ formatInteger(data.players) }}</strong><small>不重複</small></div></template>
                        </Column>
                        <Column style="width: 154px; min-width: 154px">
                            <template #header><button v-tooltip.top="'投注總額 = SUM(bet_points)，另附保存的 USDT 對照。'" class="agent-games-sort-button" type="button" @click="requestSort('betPoints')">投注總額 <i :class="sortIcon('betPoints')" /></button></template>
                            <template #body="{ data }"><div class="agent-games-money-cell"><strong>{{ formatPoints(data.betPoints) }}</strong><small>{{ formatUsdt(data.betUsdt) }}</small></div></template>
                        </Column>
                        <Column style="width: 154px; min-width: 154px">
                            <template #header><button v-tooltip.top="'派彩總額 = SUM(payout_points)，另附保存的 USDT 對照。'" class="agent-games-sort-button" type="button" @click="requestSort('payoutPoints')">派彩總額 <i :class="sortIcon('payoutPoints')" /></button></template>
                            <template #body="{ data }"><div class="agent-games-money-cell"><strong>{{ formatPoints(data.payoutPoints) }}</strong><small>{{ formatUsdt(data.payoutUsdt) }}</small></div></template>
                        </Column>
                        <Column style="width: 154px; min-width: 154px">
                            <template #header><button v-tooltip.top="'淨輸贏 = 派彩總額 − 投注總額。'" class="agent-games-sort-button" type="button" @click="requestSort('netPoints')">淨輸贏 <i :class="sortIcon('netPoints')" /></button></template>
                            <template #body="{ data }"><div class="agent-games-money-cell" :class="{ 'is-negative': isNegative(data.netPoints) }"><strong>{{ formatSignedPoints(data.netPoints) }}</strong><small>{{ formatSignedUsdt(data.netUsdt) }}</small></div></template>
                        </Column>
                        <Column style="width: 154px; min-width: 154px">
                            <template #header><button v-tooltip.top="'GGR = 投注總額 − 派彩總額；正式定義仍待 Provider 核准。'" class="agent-games-sort-button" type="button" @click="requestSort('ggrPoints')">GGR <i :class="sortIcon('ggrPoints')" /></button></template>
                            <template #body="{ data }"><div class="agent-games-money-cell" :class="{ 'is-negative': isNegative(data.ggrPoints) }"><strong>{{ formatSignedPoints(data.ggrPoints) }}</strong><small>{{ formatSignedUsdt(data.ggrUsdt) }}</small></div></template>
                        </Column>
                        <Column style="width: 154px; min-width: 154px">
                            <template #header><button v-tooltip.top="'平均投注額 = 投注總額 ÷ 投注筆數。'" class="agent-games-sort-button" type="button" @click="requestSort('averageBet')">平均投注額 <i :class="sortIcon('averageBet')" /></button></template>
                            <template #body="{ data }"><div class="agent-games-money-cell"><strong>{{ data.averageBet === null ? '—' : formatPoints(data.averageBet) }}</strong><small>{{ data.averageBetUsdt === null ? '—' : formatUsdt(data.averageBetUsdt) }}</small></div></template>
                        </Column>
                        <Column style="width: 154px; min-width: 154px">
                            <template #header><button v-tooltip.top="'人均投注額 = 投注總額 ÷ 不重複玩家人數。'" class="agent-games-sort-button" type="button" @click="requestSort('perPlayerBet')">人均投注額 <i :class="sortIcon('perPlayerBet')" /></button></template>
                            <template #body="{ data }"><div class="agent-games-money-cell"><strong>{{ data.perPlayerBet === null ? '—' : formatPoints(data.perPlayerBet) }}</strong><small>{{ data.perPlayerBetUsdt === null ? '—' : formatUsdt(data.perPlayerBetUsdt) }}</small></div></template>
                        </Column>
                        </DataTable>
                    </div>
                    <aside class="agent-games-action-rail" aria-label="操作">
                        <div class="agent-games-action-header">操作</div>
                        <div v-for="row in visibleRows" :key="row.id" class="agent-games-action-cell">
                            <Button class="agent-games-action-button" label="查看明細" icon="pi pi-arrow-up-right" text severity="secondary" @click="openRoundDetails(row)" />
                        </div>
                    </aside>
                </div>
            </SectionCard>
        </section>

        <Dialog v-model:visible="exportVisible" modal :style="{ width: 'min(720px, calc(100vw - 32px))' }" header="匯出設定" class="agent-games-export-dialog">
            <div class="agent-games-export-intro"><i class="pi pi-file-export" /><div><strong>匯出完整篩選結果</strong><p>{{ currentRangeQueryLabel }} · {{ formatInteger(filteredRows.length) }} 組代理商 × 遊戲彙總，不受目前分頁限制。</p></div></div>

            <div class="agent-games-export-section">
                <div class="agent-games-export-section-heading"><span>必要欄位</span><small>固定保留</small></div>
                <div class="agent-games-export-required-grid">
                    <span v-for="field in requiredExportFields" :key="field.key"><i class="pi pi-lock" />{{ field.label }}</span>
                </div>
            </div>

            <div v-for="group in optionalExportGroups" :key="group.label" class="agent-games-export-section">
                <div class="agent-games-export-section-heading"><span>{{ group.label }}</span><small>可選欄位</small></div>
                <div class="agent-games-export-option-grid">
                    <label v-for="field in group.fields" :key="field.key"><Checkbox v-model="exportSelections[field.key]" binary />{{ field.label }}</label>
                </div>
            </div>

            <div class="agent-games-export-format">
                <span>檔案格式</span>
                <label><RadioButton v-model="exportFormat" value="xlsx" /> XLSX</label>
                <label><RadioButton v-model="exportFormat" value="csv" /> CSV</label>
            </div>
            <template #footer>
                <Button label="取消" severity="secondary" text @click="exportVisible = false" />
                <Button label="執行匯出" icon="pi pi-download" @click="runMockExport" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.agent-games-page {
    --agent-games-ink: #243b42;
    --agent-games-muted: #6d8083;
    --agent-games-teal: #197a73;
    --agent-games-blue: #557aa7;
    --agent-games-coral: #c9785e;
    --agent-games-line: #d9e8e3;
    --agent-games-soft: #f1f8f5;
    padding-bottom: 2.75rem;
}

.agent-games-inline-notice { display: flex; align-items: center; gap: 0.55rem; padding: 0.75rem 0.9rem; border: 1px solid #edd7c9; border-radius: 0.75rem; background: #fff8f2; color: #8d5c43; font-size: 0.78rem; }
.agent-games-inline-notice { margin-top: 1rem; padding-block: 0.65rem; border-color: var(--agent-games-line); background: var(--agent-games-soft); color: var(--agent-games-muted); }
.agent-games-filter-card :deep(.section-card-head) { margin-bottom: 1.1rem; }
.agent-games-section-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; width: 100%; }
.agent-games-eyebrow { color: var(--agent-games-teal); font-size: 0.62rem; letter-spacing: 0.14em; }
.agent-games-section-heading h2 { margin: 0.28rem 0 0.3rem; color: var(--agent-games-ink); font-size: 1.15rem; letter-spacing: -0.02em; }
.agent-games-section-heading p { margin: 0; color: var(--agent-games-muted); font-size: 0.78rem; line-height: 1.55; }
.agent-games-scope-chip { display: inline-flex; align-items: center; gap: 0.35rem; flex-shrink: 0; padding: 0.35rem 0.55rem; border: 1px solid rgba(20, 124, 120, 0.2); border-radius: 999px; background: var(--agent-games-soft); color: var(--agent-games-teal); font-size: 0.68rem; font-weight: 800; }
.agent-games-quick-range { display: flex; align-items: center; flex-wrap: wrap; gap: 0.7rem; margin-bottom: 1rem; }
.agent-games-field-label,
.agent-games-filter-grid label { color: var(--agent-games-muted); font-size: 0.74rem; font-weight: 600; }
.agent-games-quick-buttons { display: flex; flex-wrap: wrap; gap: 0.3rem; padding: 0.22rem; border: 1px solid var(--agent-games-line); border-radius: 0.7rem; background: var(--agent-games-soft); }
.agent-games-quick-button { min-height: 1.95rem; padding: 0.35rem 0.65rem; border: 0; border-radius: 0.5rem; background: transparent; color: var(--agent-games-muted); font: inherit; font-size: 0.73rem; font-weight: 700; cursor: pointer; transition: 160ms ease; }
.agent-games-quick-button:hover { color: var(--agent-games-ink); background: rgba(20, 124, 120, 0.08); }
.agent-games-quick-button.active { color: #fff; background: var(--agent-games-teal); box-shadow: 0 0.25rem 0.8rem rgba(20, 124, 120, 0.18); }
.agent-games-filter-grid { display: grid; grid-template-columns: minmax(18rem, 2fr) repeat(3, minmax(10rem, 1fr)); align-items: end; gap: 0.8rem; }
.agent-games-filter-range { display: grid; gap: 0.35rem; min-width: 0; }
.agent-games-filter-range :deep(.date-time-range) { min-width: 0; }
.agent-games-filter-grid > .field { display: grid; gap: 0.35rem; min-width: 0; }
.agent-games-filter-actions { display: flex; justify-content: flex-end; gap: 0.5rem; grid-column: 1 / -1; }

.agent-games-summary-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 0.85rem; }
.agent-games-stat-card { position: relative; min-width: 0; overflow: hidden; padding: 1rem 1.05rem 1.1rem; border: 1px solid var(--agent-games-line); border-radius: 1rem; background: var(--hig-bg-surface); box-shadow: 0 0.7rem 1.8rem rgba(37, 87, 82, 0.05); }
.agent-games-stat-card::after { position: absolute; right: -1.1rem; bottom: -2rem; width: 5.2rem; height: 5.2rem; border: 1px solid rgba(20, 124, 120, 0.12); border-radius: 50%; content: ''; }
.agent-games-stat-card--coral { border-top: 2px solid var(--agent-games-coral); }
.agent-games-stat-card--blue { border-top: 2px solid var(--agent-games-blue); }
.agent-games-stat-card--teal { border-top: 2px solid var(--agent-games-teal); }
.agent-games-stat-card--slate { border-top: 2px solid #8a9899; }
.agent-games-stat-top { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
.agent-games-stat-label { display: inline-flex; align-items: center; gap: 0.42rem; color: var(--agent-games-muted); font-size: 0.72rem; font-weight: 700; white-space: nowrap; }
.agent-games-stat-label i { color: var(--agent-games-teal); font-size: 0.82rem; }
.agent-games-info-button { display: grid; width: 1.55rem; height: 1.55rem; place-items: center; border: 0; border-radius: 50%; background: var(--agent-games-soft); color: var(--agent-games-muted); cursor: help; }
.agent-games-stat-value { display: block; margin-top: 0.65rem; color: var(--agent-games-ink); font-family: Georgia, 'Times New Roman', serif; font-size: clamp(1.05rem, 1.65vw, 1.42rem); letter-spacing: -0.045em; line-height: 1.15; font-variant-numeric: tabular-nums; }
.agent-games-stat-usdt { display: block; min-height: 1rem; margin-top: 0.28rem; color: var(--agent-games-teal); font-size: 0.68rem; font-variant-numeric: tabular-nums; white-space: nowrap; }
.agent-games-stat-card small { display: block; margin-top: 0.6rem; color: var(--agent-games-muted); font-size: 0.66rem; line-height: 1.4; }

.agent-games-results-section { display: grid; gap: 0.9rem; }
.agent-games-results-toolbar { display: flex; align-items: flex-end; justify-content: space-between; gap: 1rem; }
.agent-games-results-toolbar h2 { margin: 0.25rem 0 0.25rem; color: var(--agent-games-ink); font-size: 1.15rem; letter-spacing: -0.02em; }
.agent-games-results-toolbar p { margin: 0; color: var(--agent-games-muted); font-size: 0.76rem; }
.agent-games-results-actions { display: flex; align-items: center; gap: 0.75rem; }
.agent-games-result-count { display: inline-flex; align-items: center; gap: 0.35rem; color: var(--agent-games-muted); font-size: 0.72rem; white-space: nowrap; }
.agent-games-result-count i { color: var(--agent-games-teal); }
.agent-games-table-card { min-width: 0; padding: 0; overflow: hidden; }
.agent-games-table-stage { position: relative; min-width: 0; padding-inline-end: 152px; }
.agent-games-table-shell { min-width: 0; overflow: hidden; }
.agent-games-table-shell :deep(.p-datatable-table-container) { max-width: 100%; overflow: auto; }
.agent-games-data-table :deep(.p-datatable-thead > tr > th) { color: var(--agent-games-muted); background: var(--agent-games-soft); font-size: 0.7rem; }
.agent-games-data-table :deep(.p-datatable-tbody > tr) { cursor: pointer; }
.agent-games-data-table :deep(.p-datatable-tbody > tr:hover > td) { background: #f8fcfa; }
.agent-games-data-table :deep(.p-datatable-tbody > tr > td) { color: var(--agent-games-ink); font-size: 0.75rem; vertical-align: middle; }
.agent-games-data-table :deep(.p-frozen-column) { background: var(--hig-bg-surface); }
.agent-games-sort-button { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0; border: 0; background: transparent; color: inherit; font: inherit; font-weight: 700; cursor: pointer; white-space: nowrap; }
.agent-games-sort-button i { color: var(--agent-games-teal); font-size: 0.68rem; }
.agent-games-action-rail { position: absolute; inset-block-start: 0; inset-inline-end: 0; z-index: 2; width: 152px; background: var(--hig-bg-surface); border-left: 1px solid var(--hig-border-default); box-shadow: -0.45rem 0 1rem rgba(37, 87, 82, 0.05); }
.agent-games-action-header { display: flex; height: 42.9375px; align-items: center; justify-content: center; border-bottom: 1px solid var(--hig-border-default); background: var(--agent-games-soft); color: var(--agent-games-muted); font-weight: 700; white-space: nowrap; }
.agent-games-action-cell { display: flex; height: 64.0234px; align-items: center; justify-content: center; padding: 0.5rem; border-bottom: 1px solid var(--hig-border-subtle); min-width: 0; }
.agent-games-action-button { max-width: 100%; white-space: nowrap; }
.agent-games-identity-cell,
.agent-games-money-cell,
.agent-games-number-cell { display: grid; gap: 0.2rem; min-width: 0; }
.agent-games-identity-cell strong { overflow: hidden; color: var(--agent-games-ink); font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
.agent-games-identity-cell small,
.agent-games-money-cell small,
.agent-games-number-cell small { color: var(--agent-games-muted); font-size: 0.65rem; font-variant-numeric: tabular-nums; white-space: nowrap; }
.agent-games-money-cell strong,
.agent-games-number-cell strong { font-variant-numeric: tabular-nums; }
.agent-games-money-cell.is-negative strong { color: var(--agent-games-coral); }
.agent-games-type-pill { display: inline-flex; width: fit-content; padding: 0.24rem 0.42rem; border: 1px solid #d6e4ef; border-radius: 999px; background: #f2f7fb; color: #557aa7; font-size: 0.66rem; font-weight: 700; white-space: nowrap; }
.agent-games-empty-state { display: flex; align-items: center; gap: 1rem; min-height: 13rem; padding: 2.25rem 1.5rem; }
.agent-games-empty-icon { display: grid; width: 3rem; height: 3rem; flex: 0 0 auto; place-items: center; border-radius: 1rem; background: var(--agent-games-soft); color: var(--agent-games-teal); font-size: 1.25rem; }
.agent-games-empty-state strong { color: var(--agent-games-ink); font-size: 1rem; }
.agent-games-empty-state p { margin: 0.3rem 0 0; color: var(--agent-games-muted); font-size: 0.78rem; }
.agent-games-empty-state .p-button { margin-left: auto; flex: 0 0 auto; }

.agent-games-export-intro { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.85rem; border: 1px solid var(--agent-games-line); border-radius: 0.8rem; background: var(--agent-games-soft); color: var(--agent-games-teal); }
.agent-games-export-intro > i { margin-top: 0.15rem; font-size: 1.1rem; }
.agent-games-export-intro strong { display: block; color: var(--agent-games-ink); font-size: 0.88rem; }
.agent-games-export-intro p { margin: 0.2rem 0 0; color: var(--agent-games-muted); font-size: 0.72rem; line-height: 1.5; }
.agent-games-export-section { display: grid; gap: 0.55rem; margin-top: 1.15rem; }
.agent-games-export-section-heading { display: flex; align-items: center; justify-content: space-between; gap: 1rem; color: var(--agent-games-ink); font-size: 0.82rem; font-weight: 700; }
.agent-games-export-section-heading small { color: var(--agent-games-muted); font-size: 0.68rem; font-weight: 500; }
.agent-games-export-required-grid,
.agent-games-export-option-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.5rem; }
.agent-games-export-required-grid span,
.agent-games-export-option-grid label { display: flex; align-items: center; gap: 0.45rem; min-width: 0; padding: 0.55rem 0.65rem; border: 1px solid var(--hig-border-default); border-radius: 0.65rem; color: var(--agent-games-muted); font-size: 0.74rem; }
.agent-games-export-required-grid i { color: var(--agent-games-teal); font-size: 0.68rem; }
.agent-games-export-format { display: flex; align-items: center; flex-wrap: wrap; gap: 0.85rem; margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid var(--hig-border-subtle); color: var(--agent-games-muted); font-size: 0.78rem; }
.agent-games-export-format > span { color: var(--agent-games-ink); font-weight: 700; }
.agent-games-export-format label { display: inline-flex; align-items: center; gap: 0.35rem; }

@media (max-width: 1360px) {
    .agent-games-summary-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .agent-games-filter-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .agent-games-filter-range,
    .agent-games-filter-actions { grid-column: 1 / -1; }
}

@media (max-width: 900px) {
    .agent-games-results-toolbar { align-items: flex-start; flex-direction: column; }
    .agent-games-results-actions { width: 100%; justify-content: space-between; }
}

@media (max-width: 640px) {
    .agent-games-section-heading { align-items: stretch; flex-direction: column; }
    .agent-games-filter-grid { grid-template-columns: 1fr; }
    .agent-games-filter-range,
    .agent-games-filter-actions { grid-column: auto; }
    .agent-games-filter-actions { justify-content: stretch; }
    .agent-games-filter-actions .p-button { flex: 1; }
    .agent-games-summary-grid { grid-template-columns: 1fr; }
    .agent-games-quick-range { align-items: flex-start; flex-direction: column; }
    .agent-games-quick-buttons { width: 100%; }
    .agent-games-quick-button { flex: 1; }
    .agent-games-empty-state { align-items: flex-start; flex-wrap: wrap; }
    .agent-games-empty-state .p-button { margin-left: 0; }
    .agent-games-export-required-grid,
    .agent-games-export-option-grid { grid-template-columns: 1fr; }
}
</style>
