<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import Big from 'big.js'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import { useToast } from 'primevue/usetoast'
import DateTimeRangeField from '@/components/ui/DateTimeRangeField.vue'
import FilterCard from '@/components/ui/FilterCard.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import { api } from '@/services/apiClient'
import type { ProviderGameRound, ProviderGameRoundListResponse, ProviderGameRoundStatus } from '@/types/gameRound'
import { exportToCSV } from '@/utils/csvExport'
import { exportToXlsx, type XlsxColumn } from '@/utils/xlsxExport'

type SortOrder = 'asc' | 'desc'
type ExportKind = 'csv' | 'xlsx'

interface FilterState {
    dateRange: [Date | null, Date | null]
    gameQuery: string
    agentQuery: string
    roundId: string
    externalRoundId: string
    memberId: string
    status: ProviderGameRoundStatus | ''
}

interface DataTableSortEvent {
    sortField?: string | ((item: ProviderGameRound) => unknown)
    sortOrder?: number | null
}

interface DataTablePageEvent {
    first?: number
    rows?: number
}

const toast = useToast()
const pageSize = ref(10)
const first = ref(0)
const total = ref(0)
const sortBy = ref('settled_at')
const sortOrder = ref<SortOrder>('desc')
const rows = ref<ProviderGameRound[]>([])
const loading = ref(true)
const loadError = ref('')
const filters = reactive<FilterState>({
    dateRange: [null, null],
    gameQuery: '',
    agentQuery: '',
    roundId: '',
    externalRoundId: '',
    memberId: '',
    status: '',
})
const appliedFilters = ref<FilterState>(copyFilters(filters))
const detailsVisible = ref(false)
const detailLoading = ref(false)
const selectedRound = ref<ProviderGameRound | null>(null)
const exportLoading = ref<ExportKind | null>(null)

const statusOptions: Array<{ label: string; value: ProviderGameRoundStatus | '' }> = [
    { label: '全部狀態', value: '' },
    { label: '處理中', value: 'processing' },
    { label: '已結算', value: 'settled' },
    { label: '已取消', value: 'cancelled' },
    { label: '已回滾', value: 'rollback' },
    { label: '結算失敗', value: 'failed' },
]

const exportColumns: XlsxColumn[] = [
    { key: 'provider_id', label: 'Provider ID' },
    { key: 'environment', label: '資料環境' },
    { key: 'round_id', label: 'Provider Game Round ID' },
    { key: 'external_round_id', label: 'GGAP Round ID' },
    { key: 'game_id', label: '遊戲 ID' },
    { key: 'game_name', label: '遊戲名稱' },
    { key: 'game_type', label: '遊戲類型' },
    { key: 'game_version', label: '遊戲版本' },
    { key: 'release_id', label: 'Release ID' },
    { key: 'agent_id', label: '代理商 ID' },
    { key: 'agent_name', label: '代理商名稱' },
    { key: 'member_id', label: '會員 ID' },
    { key: 'currency', label: 'GGAP 幣別' },
    { key: 'request_id', label: 'Request ID' },
    { key: 'started_at', label: '開始時間' },
    { key: 'created_at', label: '建立時間' },
    { key: 'settled_at', label: '結算時間' },
    { key: 'updated_at', label: '最後更新時間' },
    { key: 'bet_points', label: '投注額（點數）' },
    { key: 'win_points', label: '派彩額（點數）' },
    { key: 'net_points', label: '玩家淨輸贏（點數）' },
    { key: 'bet_usdt', label: '投注額（USDT）' },
    { key: 'win_usdt', label: '派彩額（USDT）' },
    { key: 'net_usdt', label: '玩家淨輸贏（USDT）' },
    { key: 'conversion_rate', label: '換算比例（點／USDT）' },
    { key: 'conversion_rule_id', label: '換算規則版本' },
    { key: 'conversion_rule', label: '換算規則' },
    { key: 'status', label: '結算狀態' },
    { key: 'status_description', label: '狀態說明' },
    { key: 'exception_reason', label: '異常說明' },
    { key: 'retry_count', label: '重試次數' },
]

const resultDescription = computed(() => {
    if (loading.value) return '正在讀取 Provider 正式資料…'
    return `目前顯示 ${total.value.toLocaleString()} 筆正式 Game Round`
})

const detailStatusDescription = computed(() => selectedRound.value?.status_description ?? '')

onMounted(loadRounds)

function copyFilters(source: FilterState): FilterState {
    return {
        ...source,
        dateRange: [source.dateRange[0], source.dateRange[1]],
    }
}

function buildListPath(page = Math.floor(first.value / pageSize.value) + 1, size = pageSize.value) {
    const params = new URLSearchParams({
        environment: 'production',
        page: String(page),
        page_size: String(size),
        sort_by: sortBy.value,
        sort_order: sortOrder.value,
    })
    const active = appliedFilters.value
    const [from, to] = active.dateRange
    if (from) params.set('from', from.toISOString())
    if (to) params.set('to', to.toISOString())
    if (active.gameQuery.trim()) params.set('game_query', active.gameQuery.trim())
    if (active.agentQuery.trim()) params.set('agent_query', active.agentQuery.trim())
    if (active.roundId.trim()) params.set('round_id', active.roundId.trim())
    if (active.externalRoundId.trim()) params.set('external_round_id', active.externalRoundId.trim())
    if (active.memberId.trim()) params.set('member_id', active.memberId.trim())
    if (active.status) params.set('status', active.status)
    return `/api/provider/v1/game-rounds?${params.toString()}`
}

async function loadRounds() {
    loading.value = true
    loadError.value = ''
    try {
        const response = await api.get<ProviderGameRoundListResponse>(buildListPath())
        rows.value = response.items
        total.value = response.total
    } catch (error) {
        console.error('Failed to load provider game rounds:', error)
        rows.value = []
        total.value = 0
        loadError.value = '正式遊戲紀錄載入失敗，請重新載入。'
    } finally {
        loading.value = false
    }
}

function applyFilters() {
    appliedFilters.value = copyFilters(filters)
    first.value = 0
    loadRounds()
}

function resetFilters() {
    filters.dateRange = [null, null]
    filters.gameQuery = ''
    filters.agentQuery = ''
    filters.roundId = ''
    filters.externalRoundId = ''
    filters.memberId = ''
    filters.status = ''
    applyFilters()
}

function handlePage(event: DataTablePageEvent) {
    first.value = event.first ?? 0
    if (event.rows && event.rows !== pageSize.value) {
        pageSize.value = event.rows
        first.value = 0
    }
    loadRounds()
}

function handleSort(event: DataTableSortEvent) {
    if (typeof event.sortField === 'string' && event.sortField) sortBy.value = event.sortField
    sortOrder.value = event.sortOrder === 1 ? 'asc' : 'desc'
    first.value = 0
    loadRounds()
}

function requestSort(field: string) {
    if (sortBy.value === field) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
        sortBy.value = field
        sortOrder.value = 'asc'
    }
    first.value = 0
    loadRounds()
}

function sortIcon(field: string) {
    if (sortBy.value !== field) return 'pi pi-sort-alt'
    return sortOrder.value === 'asc' ? 'pi pi-sort-amount-up' : 'pi pi-sort-amount-down'
}

async function openDetails(row: ProviderGameRound) {
    selectedRound.value = row
    detailsVisible.value = true
    detailLoading.value = true
    try {
        selectedRound.value = await api.get<ProviderGameRound>(`/api/provider/v1/game-rounds/${encodeURIComponent(row.round_id)}`)
    } catch (error) {
        console.error('Failed to load game round detail:', error)
        toast.add({ severity: 'error', summary: '詳情載入失敗', detail: '請稍後重試。', life: 2500 })
    } finally {
        detailLoading.value = false
    }
}

async function exportRounds(kind: ExportKind) {
    exportLoading.value = kind
    try {
        const response = await api.get<ProviderGameRoundListResponse>(buildListPath(1, 1000))
        const data = response.items.map(toExportRecord)
        if (!data.length) {
            toast.add({ severity: 'warn', summary: '沒有可匯出的資料', detail: '請先調整查詢條件。', life: 2200 })
            return
        }

        const filename = `provider-game-rounds-${new Date().toISOString().slice(0, 10)}`
        if (kind === 'csv') {
            const headers = exportColumns.reduce<Record<string, string>>((result, column) => {
                result[column.key] = column.label
                return result
            }, {})
            exportToCSV(data, filename, headers)
        } else {
            exportToXlsx(data, filename, exportColumns)
        }
        toast.add({ severity: 'success', summary: `${kind === 'csv' ? 'CSV' : 'Excel'} 已匯出`, detail: `共 ${data.length} 筆正式 Game Round。`, life: 1800 })
    } catch (error) {
        console.error(`Failed to export ${kind}:`, error)
        toast.add({ severity: 'error', summary: '匯出失敗', detail: '請稍後重試。', life: 2500 })
    } finally {
        exportLoading.value = null
    }
}

function toExportRecord(round: ProviderGameRound) {
    return {
        provider_id: round.provider_id,
        environment: round.environment,
        round_id: round.round_id,
        external_round_id: round.external_round_id,
        game_id: round.game_id,
        game_name: round.game_name,
        game_type: gameTypeLabel(round.game_type),
        game_version: round.game_version,
        release_id: round.release_id,
        agent_id: round.agent_id,
        agent_name: round.agent_name,
        member_id: round.member_id,
        currency: round.currency,
        request_id: round.request_id,
        started_at: formatDateTime(round.started_at),
        created_at: formatDateTime(round.created_at),
        settled_at: formatDateTime(round.settled_at),
        updated_at: formatDateTime(round.updated_at),
        bet_points: round.bet_points,
        win_points: round.win_points,
        net_points: round.net_points,
        bet_usdt: round.bet_usdt,
        win_usdt: round.win_usdt,
        net_usdt: round.net_usdt,
        conversion_rate: round.conversion_rate,
        conversion_rule_id: round.conversion_rule_id,
        conversion_rule: round.conversion_rule,
        status: statusLabel(round.status),
        status_description: round.status_description,
        exception_reason: round.exception_reason ?? '',
        retry_count: round.retry_count,
    }
}

function formatDateTime(value: string | null | undefined) {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '—'
    const pad = (part: number) => String(part).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function formatAmount(value: string | null | undefined) {
    if (value === null || value === undefined || value === '') return '—'
    const fixed = new Big(value).toFixed(2)
    const [integer, decimal] = fixed.split('.')
    return `${integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${decimal}`
}

function formatSignedAmount(value: string | null | undefined) {
    if (value === null || value === undefined || value === '') return '—'
    const amount = new Big(value)
    if (amount.gt(0)) return `+${formatAmount(amount.toString())}`
    if (amount.lt(0)) return `−${formatAmount(amount.abs().toString())}`
    return formatAmount('0')
}

function isNegative(value: string | null | undefined) {
    return value ? new Big(value).lt(0) : false
}

function gameTypeLabel(value: ProviderGameRound['game_type']) {
    return { slots: '老虎機', crash: '單人 Crash', table: '棋牌' }[value] ?? value
}

function statusLabel(value: ProviderGameRoundStatus) {
    return statusOptions.find((option) => option.value === value)?.label ?? value
}

function statusClass(value: ProviderGameRoundStatus) {
    return {
        settled: 'round-status--settled',
        processing: 'round-status--processing',
        cancelled: 'round-status--cancelled',
        rollback: 'round-status--rollback',
        failed: 'round-status--failed',
    }[value]
}
</script>

<template>
    <div class="page-stack provider-rounds-page">
        <header class="rounds-page-header">
            <div>
                <span class="rounds-page-eyebrow">PROVIDER PORTAL / PRODUCTION RECORDS</span>
                <h1>正式遊戲紀錄</h1>
                <p>每列代表一筆正式環境 Game Round；以 Provider 點數追蹤單局投注、派彩與玩家淨輸贏。</p>
            </div>
            <div class="rounds-production-badge">
                <span class="rounds-production-dot" />
                <div>
                    <strong>正式環境</strong>
                    <small>固定查詢 production</small>
                </div>
            </div>
        </header>

        <section class="rounds-scope-rail" aria-label="資料範圍提示">
            <div><i class="pi pi-database" /><span>資料範圍</span><strong>Production only</strong></div>
            <div><i class="pi pi-calculator" /><span>金額邏輯</span><strong>淨輸贏 = 派彩額 − 投注額</strong></div>
            <div><i class="pi pi-info-circle" /><span>顯示原則</span><strong>點數為主；USDT 於詳情與匯出提供</strong></div>
        </section>

        <FilterCard title="查詢條件" description="依結算時間、遊戲、代理商、識別碼、會員與狀態查詢正式 Game Round。環境固定為 production。">
            <div class="rounds-filter-grid">
                <div class="rounds-filter-range">
                    <span class="rounds-filter-label">結算時間區間</span>
                    <DateTimeRangeField v-model="filters.dateRange" />
                </div>
                <div class="field">
                    <label for="round-game-query">遊戲名稱 / ID</label>
                    <InputText id="round-game-query" v-model="filters.gameQuery" placeholder="搜尋遊戲名稱或 ID" fluid @keyup.enter="applyFilters" />
                </div>
                <div class="field">
                    <label for="round-agent-query">代理商名稱 / ID</label>
                    <InputText id="round-agent-query" v-model="filters.agentQuery" placeholder="搜尋代理商名稱或 ID" fluid @keyup.enter="applyFilters" />
                </div>
                <div class="field">
                    <label for="round-provider-id">Provider Game Round ID</label>
                    <InputText id="round-provider-id" v-model="filters.roundId" placeholder="輸入完整 Provider Round ID" fluid @keyup.enter="applyFilters" />
                </div>
                <div class="field">
                    <label for="round-ggap-id">GGAP Round ID</label>
                    <InputText id="round-ggap-id" v-model="filters.externalRoundId" placeholder="輸入完整 GGAP Round ID" fluid @keyup.enter="applyFilters" />
                </div>
                <div class="field">
                    <label for="round-member-id">會員 ID</label>
                    <InputText id="round-member-id" v-model="filters.memberId" placeholder="輸入會員 ID" fluid @keyup.enter="applyFilters" />
                </div>
                <div class="field">
                    <label for="round-status">結算狀態</label>
                    <Select id="round-status" v-model="filters.status" :options="statusOptions" option-label="label" option-value="value" fluid />
                </div>
                <div class="rounds-filter-actions">
                    <Button label="查詢" icon="pi pi-search" @click="applyFilters" />
                    <Button label="重置" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" />
                </div>
            </div>
        </FilterCard>

        <div class="rounds-list-toolbar">
            <div>
                <span class="rounds-result-count">{{ resultDescription }}</span>
                <span class="rounds-result-note">預設依 settled_at 新到舊排序，未結算資料固定排在後面</span>
            </div>
            <div class="rounds-toolbar-actions">
                <Button icon="pi pi-refresh" text severity="secondary" aria-label="重新載入" v-tooltip.top="'重新載入資料'" :loading="loading" @click="loadRounds" />
                <Button label="CSV" icon="pi pi-file" severity="secondary" outlined :loading="exportLoading === 'csv'" :disabled="Boolean(exportLoading)" @click="exportRounds('csv')" />
                <Button label="Excel" icon="pi pi-file-excel" severity="secondary" outlined :loading="exportLoading === 'xlsx'" :disabled="Boolean(exportLoading)" @click="exportRounds('xlsx')" />
            </div>
        </div>

        <SectionCard class="rounds-table-card">
            <div v-if="loadError" class="rounds-state-panel rounds-state-panel--error">
                <i class="pi pi-exclamation-circle" />
                <div>
                    <strong>{{ loadError }}</strong>
                    <p>目前未能取得正式 Game Round 資料。</p>
                </div>
                <Button label="重新載入" icon="pi pi-refresh" severity="secondary" outlined @click="loadRounds" />
            </div>

            <div v-else-if="!loading && rows.length === 0" class="rounds-state-panel">
                <i class="pi pi-search" />
                <div>
                    <strong>找不到符合條件的正式遊戲紀錄</strong>
                    <p>請調整查詢條件或清除篩選內容。</p>
                </div>
                <Button label="清除條件" severity="secondary" outlined @click="resetFilters" />
            </div>

            <DataTable
                v-else
                class="rounds-data-table"
                :value="rows"
                :loading="loading"
                data-key="round_id"
                lazy
                scrollable
                paginator
                :first="first"
                :rows="pageSize"
                :total-records="total"
                :sort-field="sortBy"
                :sort-order="sortOrder === 'asc' ? 1 : -1"
                :rows-per-page-options="[10, 20, 50]"
                table-style="min-width: 2240px"
                paginator-template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
                current-page-report-template="{first}-{last} / {totalRecords}"
                @page="handlePage"
                @sort="handleSort"
            >
                <Column header="#" frozen style="width: 64px; min-width: 64px">
                    <template #body="{ index }">
                        <span class="round-sequence">{{ first + index + 1 }}</span>
                    </template>
                </Column>
                <Column field="settled_at" style="width: 164px; min-width: 164px">
                    <template #header><button class="rounds-sort-button" type="button" @click.stop="requestSort('settled_at')">結算時間 <i :class="sortIcon('settled_at')" /></button></template>
                    <template #body="{ data }"><span class="round-time">{{ formatDateTime(data.settled_at) }}</span></template>
                </Column>
                <Column field="round_id" style="width: 214px; min-width: 214px">
                    <template #header><button class="rounds-sort-button" type="button" @click.stop="requestSort('round_id')">Provider Game Round ID <i :class="sortIcon('round_id')" /></button></template>
                    <template #body="{ data }"><span class="round-id">{{ data.round_id }}</span></template>
                </Column>
                <Column field="external_round_id" style="width: 176px; min-width: 176px">
                    <template #header><button class="rounds-sort-button" type="button" @click.stop="requestSort('external_round_id')">GGAP Round ID <i :class="sortIcon('external_round_id')" /></button></template>
                    <template #body="{ data }"><span class="round-id">{{ data.external_round_id }}</span></template>
                </Column>
                <Column field="game_id" style="width: 132px; min-width: 132px">
                    <template #header><button class="rounds-sort-button" type="button" @click.stop="requestSort('game_id')">遊戲 ID <i :class="sortIcon('game_id')" /></button></template>
                    <template #body="{ data }"><span class="round-id">{{ data.game_id }}</span></template>
                </Column>
                <Column field="game_name" style="width: 176px; min-width: 176px">
                    <template #header><button class="rounds-sort-button" type="button" @click.stop="requestSort('game_name')">遊戲名稱 <i :class="sortIcon('game_name')" /></button></template>
                    <template #body="{ data }"><strong class="round-primary-text">{{ data.game_name }}</strong></template>
                </Column>
                <Column field="game_type" style="width: 120px; min-width: 120px">
                    <template #header><button class="rounds-sort-button" type="button" @click.stop="requestSort('game_type')">遊戲類型 <i :class="sortIcon('game_type')" /></button></template>
                    <template #body="{ data }"><span class="round-muted-text">{{ gameTypeLabel(data.game_type) }}</span></template>
                </Column>
                <Column field="game_version" style="width: 116px; min-width: 116px">
                    <template #header><button class="rounds-sort-button" type="button" @click.stop="requestSort('game_version')">遊戲版本 <i :class="sortIcon('game_version')" /></button></template>
                    <template #body="{ data }"><span class="round-version">{{ data.game_version }}</span></template>
                </Column>
                <Column field="agent_id" style="width: 124px; min-width: 124px">
                    <template #header><button class="rounds-sort-button" type="button" @click.stop="requestSort('agent_id')">代理商 ID <i :class="sortIcon('agent_id')" /></button></template>
                    <template #body="{ data }"><span class="round-id">{{ data.agent_id }}</span></template>
                </Column>
                <Column field="agent_name" style="width: 160px; min-width: 160px">
                    <template #header><button class="rounds-sort-button" type="button" @click.stop="requestSort('agent_name')">代理商名稱 <i :class="sortIcon('agent_name')" /></button></template>
                    <template #body="{ data }"><span class="round-primary-text">{{ data.agent_name }}</span></template>
                </Column>
                <Column field="member_id" style="width: 140px; min-width: 140px">
                    <template #header><button class="rounds-sort-button" type="button" @click.stop="requestSort('member_id')">會員 ID <i :class="sortIcon('member_id')" /></button></template>
                    <template #body="{ data }"><span class="round-id">{{ data.member_id }}</span></template>
                </Column>
                <Column field="bet_points" style="width: 126px; min-width: 126px">
                    <template #header><button class="rounds-sort-button" type="button" @click.stop="requestSort('bet_points')">投注額（點） <i :class="sortIcon('bet_points')" /></button></template>
                    <template #body="{ data }"><span class="round-amount">{{ formatAmount(data.bet_points) }}</span></template>
                </Column>
                <Column field="win_points" style="width: 126px; min-width: 126px">
                    <template #header><button class="rounds-sort-button" type="button" @click.stop="requestSort('win_points')">派彩額（點） <i :class="sortIcon('win_points')" /></button></template>
                    <template #body="{ data }"><span class="round-amount">{{ formatAmount(data.win_points) }}</span></template>
                </Column>
                <Column field="net_points" style="width: 148px; min-width: 148px">
                    <template #header><button class="rounds-sort-button" type="button" @click.stop="requestSort('net_points')">玩家淨輸贏（點） <i :class="sortIcon('net_points')" /></button></template>
                    <template #body="{ data }"><span class="round-amount round-net" :class="{ 'round-net--negative': isNegative(data.net_points), 'round-net--positive': !isNegative(data.net_points) }">{{ formatSignedAmount(data.net_points) }}</span></template>
                </Column>
                <Column field="status" style="width: 116px; min-width: 116px">
                    <template #header><button class="rounds-sort-button" type="button" @click.stop="requestSort('status')">結算狀態 <i :class="sortIcon('status')" /></button></template>
                    <template #body="{ data }"><span class="round-status" :class="statusClass(data.status)">{{ statusLabel(data.status) }}</span></template>
                </Column>
                <Column header="操作" frozen align-frozen="right" style="width: 96px; min-width: 96px">
                    <template #body="{ data }"><Button label="詳情" icon="pi pi-arrow-up-right" text severity="secondary" @click="openDetails(data)" /></template>
                </Column>
            </DataTable>
        </SectionCard>

        <Dialog v-model:visible="detailsVisible" modal dismissable-mask :header="selectedRound ? `${selectedRound.round_id} / Game Round 詳情` : 'Game Round 詳情'" class="round-detail-dialog">
            <div v-if="selectedRound" class="round-detail-content">
                <div v-if="detailLoading" class="round-detail-loading"><i class="pi pi-spin pi-spinner" /> 正在讀取完整紀錄…</div>
                <template v-else>
                    <div class="round-detail-hero">
                        <div>
                            <span class="rounds-page-eyebrow">PRODUCTION GAME ROUND</span>
                            <h2>{{ selectedRound.game_name }}</h2>
                            <p>{{ selectedRound.game_id }} · {{ gameTypeLabel(selectedRound.game_type) }} · {{ selectedRound.game_version }}</p>
                        </div>
                        <span class="round-status" :class="statusClass(selectedRound.status)">{{ statusLabel(selectedRound.status) }}</span>
                    </div>

                    <section class="round-detail-section">
                        <div class="round-detail-section-title"><span>識別與狀態</span><small>TRACEABILITY</small></div>
                        <div class="round-detail-grid">
                            <div><span>Provider Game Round ID</span><strong class="round-id">{{ selectedRound.round_id }}</strong></div>
                            <div><span>GGAP Round ID</span><strong class="round-id">{{ selectedRound.external_round_id }}</strong></div>
                            <div><span>Request ID</span><strong class="round-id">{{ selectedRound.request_id }}</strong></div>
                            <div><span>狀態說明</span><strong>{{ detailStatusDescription }}</strong></div>
                        </div>
                    </section>

                    <section class="round-detail-section">
                        <div class="round-detail-section-title"><span>遊戲與 GGAP 脈絡</span><small>CONTEXT SNAPSHOT</small></div>
                        <div class="round-detail-grid">
                            <div><span>遊戲 ID / 名稱</span><strong>{{ selectedRound.game_id }} · {{ selectedRound.game_name }}</strong></div>
                            <div><span>遊戲類型</span><strong>{{ gameTypeLabel(selectedRound.game_type) }}</strong></div>
                            <div><span>遊戲版本 / Release ID</span><strong>{{ selectedRound.game_version }} / {{ selectedRound.release_id }}</strong></div>
                            <div><span>代理商 ID / 名稱</span><strong>{{ selectedRound.agent_id }} · {{ selectedRound.agent_name }}</strong></div>
                            <div><span>會員 ID</span><strong class="round-id">{{ selectedRound.member_id }}</strong></div>
                            <div><span>GGAP 幣別</span><strong>{{ selectedRound.currency }}</strong></div>
                        </div>
                    </section>

                    <section class="round-detail-section">
                        <div class="round-detail-section-title"><span>時間</span><small>EVENT TIMELINE</small></div>
                        <div class="round-detail-grid round-detail-grid--four">
                            <div><span>開始時間</span><strong>{{ formatDateTime(selectedRound.started_at) }}</strong></div>
                            <div><span>建立時間</span><strong>{{ formatDateTime(selectedRound.created_at) }}</strong></div>
                            <div><span>結算時間</span><strong>{{ formatDateTime(selectedRound.settled_at) }}</strong></div>
                            <div><span>最後更新時間</span><strong>{{ formatDateTime(selectedRound.updated_at) }}</strong></div>
                        </div>
                    </section>

                    <section class="round-detail-section">
                        <div class="round-detail-section-title"><span>金額與換算</span><small>POINTS FIRST</small></div>
                        <div class="round-amount-table">
                            <div class="round-amount-table-row round-amount-table-head"><span>項目</span><span>Provider 點數</span><span>USDT</span></div>
                            <div class="round-amount-table-row"><span>投注額</span><strong>{{ formatAmount(selectedRound.bet_points) }}</strong><strong>{{ selectedRound.bet_usdt }} {{ selectedRound.currency }}</strong></div>
                            <div class="round-amount-table-row"><span>派彩額</span><strong>{{ formatAmount(selectedRound.win_points) }}</strong><strong>{{ selectedRound.win_usdt }} {{ selectedRound.currency }}</strong></div>
                            <div class="round-amount-table-row round-amount-table-net"><span>玩家淨輸贏</span><strong :class="{ 'round-net--negative': isNegative(selectedRound.net_points), 'round-net--positive': !isNegative(selectedRound.net_points) }">{{ formatSignedAmount(selectedRound.net_points) }}</strong><strong :class="{ 'round-net--negative': isNegative(selectedRound.net_usdt), 'round-net--positive': !isNegative(selectedRound.net_usdt) }">{{ formatSignedAmount(selectedRound.net_usdt) }} {{ selectedRound.currency }}</strong></div>
                        </div>
                        <div class="round-conversion-note"><i class="pi pi-calculator" /><div><strong>{{ selectedRound.conversion_rule_id }}</strong><span>{{ selectedRound.conversion_rule }}</span></div></div>
                    </section>

                    <section v-if="selectedRound.status !== 'settled'" class="round-detail-exception">
                        <i class="pi pi-exclamation-triangle" />
                        <div><strong>異常 / 補處理資訊</strong><p>{{ selectedRound.exception_reason ?? '目前沒有額外異常說明。' }}<span v-if="selectedRound.retry_count"> · 已重試 {{ selectedRound.retry_count }} 次</span></p></div>
                    </section>
                </template>
            </div>
            <template #footer><Button label="關閉" severity="secondary" outlined @click="detailsVisible = false" /></template>
        </Dialog>
    </div>
</template>

<style scoped>
.provider-rounds-page {
    max-width: 1680px;
    margin: 0 auto;
    padding-bottom: 2.5rem;
}

.rounds-page-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 2rem;
    padding: 0.35rem 0.25rem 1rem;
}

.rounds-page-eyebrow {
    display: inline-flex;
    color: #3b8178;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.16em;
}

.rounds-page-header h1 {
    margin: 0.45rem 0 0.35rem;
    color: #253a42;
    font-size: clamp(1.75rem, 3vw, 2.4rem);
    letter-spacing: -0.04em;
}

.rounds-page-header p {
    max-width: 50rem;
    margin: 0;
    color: #6a7b82;
    font-size: 0.9rem;
}

.rounds-production-badge {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 11rem;
    padding: 0.75rem 1rem;
    border: 1px solid #c8e4d9;
    border-radius: 0.9rem;
    background: #f3fbf7;
    color: #1f6558;
}

.rounds-production-dot {
    width: 0.65rem;
    height: 0.65rem;
    border-radius: 50%;
    background: #2f9a6f;
    box-shadow: 0 0 0 0.28rem rgba(47, 154, 111, 0.12);
}

.rounds-production-badge strong,
.rounds-production-badge small {
    display: block;
}

.rounds-production-badge strong { font-size: 0.85rem; }
.rounds-production-badge small { margin-top: 0.14rem; color: #6a8b81; font-size: 0.7rem; }

.rounds-scope-rail {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
    margin-bottom: 1rem;
    padding: 0.75rem 1rem;
    border: 1px solid #dce9e4;
    border-radius: 0.95rem;
    background: linear-gradient(115deg, #f7fbfa, #ffffff 54%, #f4faf8);
}

.rounds-scope-rail div {
    display: grid;
    grid-template-columns: auto auto 1fr;
    align-items: center;
    gap: 0.55rem;
    min-width: 0;
    padding: 0.3rem 0.55rem;
    border-right: 1px solid #e3efeb;
}

.rounds-scope-rail div:last-child { border-right: 0; }
.rounds-scope-rail i { color: #3b8178; font-size: 0.88rem; }
.rounds-scope-rail span { color: #73868a; font-size: 0.72rem; }
.rounds-scope-rail strong { min-width: 0; overflow: hidden; color: #294952; font-size: 0.78rem; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }

.rounds-filter-grid {
    display: grid;
    grid-template-columns: minmax(19rem, 2fr) repeat(3, minmax(12rem, 1fr));
    gap: 1rem;
    align-items: end;
}

.rounds-filter-range { min-width: 0; }
.rounds-filter-label { display: block; margin-bottom: 0.35rem; color: var(--hig-text-secondary); font-size: 0.75rem; font-weight: 500; }
.rounds-filter-range :deep(.date-time-range) { gap: 0.6rem; }
.rounds-filter-range :deep(.field) { gap: 0.35rem; }
.rounds-filter-grid .field { display: flex; min-width: 0; flex-direction: column; gap: 0.375rem; }
.rounds-filter-grid .field label { color: var(--hig-text-secondary); font-size: 0.75rem; font-weight: 500; }
.rounds-filter-actions { display: flex; gap: 0.6rem; align-items: center; }
.rounds-filter-actions .p-button { flex: 1; }

.rounds-list-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin: 1.25rem 0 0.7rem;
    padding: 0 0.25rem;
}

.rounds-result-count { color: #2c5157; font-size: 0.88rem; font-weight: 750; }
.rounds-result-note { margin-left: 0.7rem; color: #849398; font-size: 0.75rem; }
.rounds-toolbar-actions { display: flex; gap: 0.5rem; align-items: center; }

.rounds-table-card { overflow: hidden; padding: 0; }
.rounds-state-panel { display: flex; min-height: 18rem; align-items: center; justify-content: center; gap: 0.85rem; padding: 2rem; text-align: left; }
.rounds-state-panel > i { color: #5f9590; font-size: 1.5rem; }
.rounds-state-panel strong { color: #294952; font-size: 0.95rem; }
.rounds-state-panel p { margin: 0.25rem 0 0; color: #809097; font-size: 0.8rem; }
.rounds-state-panel .p-button { margin-left: 0.75rem; }
.rounds-state-panel--error > i { color: #cf6a58; }

.rounds-data-table :deep(.p-datatable-wrapper) { border-top: 1px solid #edf2f1; }
.rounds-data-table :deep(.p-datatable-thead > tr > th) { padding: 0.85rem 0.75rem; background: #f8fbfb; border-color: #e7eeee; color: #6f8388; font-size: 0.71rem; font-weight: 750; letter-spacing: 0.015em; white-space: nowrap; }
.rounds-data-table :deep(.p-datatable-thead > tr > th.p-datatable-frozen-column) { background: #f5faf9; }
.rounds-data-table :deep(.p-datatable-tbody > tr > td) { padding: 0.78rem 0.75rem; border-color: #edf2f1; color: #435a60; font-size: 0.78rem; white-space: nowrap; }
.rounds-data-table :deep(.p-datatable-tbody > tr:hover > td) { background: #f6fbf9; }
.rounds-data-table :deep(.p-datatable-tbody > tr > td.p-datatable-frozen-column) { background: #ffffff; }
.rounds-data-table :deep(.p-datatable-tbody > tr:hover > td.p-datatable-frozen-column) { background: #f6fbf9; }
.rounds-data-table :deep(.p-paginator) { justify-content: flex-end; border: 0; border-top: 1px solid #edf2f1; border-radius: 0; }
.rounds-data-table :deep(.p-sortable-column.p-highlight) { color: #2d796d; }
.rounds-data-table :deep(.p-column-header-content) { gap: 0.3rem; }
.rounds-sort-button { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0; border: 0; background: transparent; color: inherit; cursor: pointer; font: inherit; font-weight: inherit; text-align: left; white-space: nowrap; }
.rounds-sort-button:hover, .rounds-sort-button:focus-visible { color: #2d796d; }
.rounds-sort-button i { color: #9aabad; font-size: 0.68rem; }
.rounds-sort-button:hover i, .rounds-sort-button:focus-visible i { color: #2d796d; }

.round-sequence { color: #9aabad; font-variant-numeric: tabular-nums; }
.round-time { color: #49666b; font-variant-numeric: tabular-nums; }
.round-id { color: #2e6670; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.73rem; }
.round-primary-text { color: #2b4c52; font-weight: 700; }
.round-muted-text { color: #73868b; }
.round-version { color: #4d6a70; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.73rem; }
.round-amount { color: #304f55; font-variant-numeric: tabular-nums; font-weight: 650; }
.round-net--negative { color: #c55548 !important; }
.round-net--positive { color: #2e8c6d !important; }

.round-status { display: inline-flex; align-items: center; padding: 0.28rem 0.52rem; border: 1px solid transparent; border-radius: 999px; font-size: 0.7rem; font-weight: 750; }
.round-status--settled { border-color: #bce2cf; background: #effaf4; color: #247b59; }
.round-status--processing { border-color: #f0d394; background: #fff8e5; color: #9b6c16; }
.round-status--cancelled { border-color: #dedfe4; background: #f6f6f8; color: #6d737b; }
.round-status--rollback { border-color: #d6c9ed; background: #f7f2ff; color: #7656a3; }
.round-status--failed { border-color: #f0c8c1; background: #fff3f0; color: #b84f43; }

.round-detail-content { min-width: min(72rem, 78vw); padding: 0.2rem 0.1rem 0.5rem; }
.round-detail-hero { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; padding: 0.25rem 0 1.1rem; }
.round-detail-hero h2 { margin: 0.38rem 0 0.2rem; color: #294952; font-size: 1.35rem; letter-spacing: -0.025em; }
.round-detail-hero p { margin: 0; color: #789095; font-size: 0.8rem; }
.round-detail-loading { display: flex; min-height: 24rem; align-items: center; justify-content: center; gap: 0.55rem; color: #69858a; }
.round-detail-section { padding: 1rem 0; border-top: 1px solid #e8efed; }
.round-detail-section-title { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; margin-bottom: 0.75rem; color: #355960; font-size: 0.9rem; font-weight: 800; }
.round-detail-section-title small { color: #91a6a8; font-size: 0.62rem; font-weight: 800; letter-spacing: 0.14em; }
.round-detail-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.85rem 1.1rem; }
.round-detail-grid--four { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.round-detail-grid div { min-width: 0; }
.round-detail-grid span, .round-detail-grid strong { display: block; }
.round-detail-grid span { margin-bottom: 0.25rem; color: #8a9a9d; font-size: 0.7rem; }
.round-detail-grid strong { overflow: hidden; color: #38565c; font-size: 0.8rem; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
.round-detail-grid strong.round-id { color: #2e6670; font-size: 0.71rem; }

.round-amount-table { overflow: hidden; border: 1px solid #e3ece9; border-radius: 0.7rem; }
.round-amount-table-row { display: grid; grid-template-columns: 1.3fr 1fr 1fr; gap: 1rem; align-items: center; padding: 0.68rem 0.85rem; border-top: 1px solid #edf2f1; color: #536a6f; font-size: 0.8rem; }
.round-amount-table-row:first-child { border-top: 0; }
.round-amount-table-row strong { color: #31555b; font-variant-numeric: tabular-nums; }
.round-amount-table-head { background: #f7fbfa; border-top: 0; color: #839496; font-size: 0.7rem; font-weight: 700; }
.round-amount-table-net { background: #fbfdfc; }
.round-conversion-note { display: flex; align-items: flex-start; gap: 0.65rem; margin-top: 0.7rem; padding: 0.7rem 0.8rem; border-radius: 0.6rem; background: #f4faf8; color: #47736c; }
.round-conversion-note i { margin-top: 0.12rem; color: #3b8178; }
.round-conversion-note strong, .round-conversion-note span { display: block; }
.round-conversion-note strong { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.72rem; }
.round-conversion-note span { margin-top: 0.15rem; font-size: 0.75rem; }
.round-detail-exception { display: flex; align-items: flex-start; gap: 0.65rem; margin-top: 0.9rem; padding: 0.8rem; border: 1px solid #f0d7bb; border-radius: 0.65rem; background: #fff9f0; color: #946d3c; }
.round-detail-exception > i { margin-top: 0.12rem; }
.round-detail-exception strong { font-size: 0.8rem; }
.round-detail-exception p { margin: 0.2rem 0 0; font-size: 0.75rem; }

@media (max-width: 1100px) {
    .rounds-filter-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .rounds-filter-range { grid-column: 1 / -1; }
    .rounds-filter-actions { justify-content: flex-end; }
    .rounds-scope-rail { grid-template-columns: 1fr; }
    .rounds-scope-rail div { border-right: 0; border-bottom: 1px solid #e3efeb; }
    .rounds-scope-rail div:last-child { border-bottom: 0; }
    .round-detail-grid, .round-detail-grid--four { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 1350px) and (min-width: 701px) {
    .rounds-filter-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .rounds-filter-range { grid-column: 1 / -1; }
}

@media (max-width: 700px) {
    .rounds-page-header, .rounds-list-toolbar { align-items: flex-start; flex-direction: column; }
    .rounds-production-badge { width: 100%; }
    .rounds-filter-grid { grid-template-columns: 1fr; }
    .rounds-filter-range { grid-column: auto; }
    .rounds-filter-actions { justify-content: stretch; }
    .rounds-list-toolbar { gap: 0.7rem; }
    .rounds-result-note { display: block; margin: 0.25rem 0 0; }
    .rounds-toolbar-actions { width: 100%; }
    .rounds-toolbar-actions .p-button { flex: 1; }
    .round-detail-content { min-width: min(88vw, 34rem); }
    .round-detail-hero { flex-direction: column; }
    .round-detail-grid, .round-detail-grid--four { grid-template-columns: 1fr; }
    .round-amount-table-row { grid-template-columns: 1fr; gap: 0.25rem; }
    .round-amount-table-head { display: none; }
}
</style>
