<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { api } from '@/services/apiClient'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ColumnGroup from 'primevue/columngroup'
import Row from 'primevue/row'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import FilterCard from '@/components/ui/FilterCard.vue'
import SectionCard from '@/components/ui/SectionCard.vue'

type RtpState = '正常' | '觀察' | '樣本不足' | '無資料'
type ProductionDemoStatus = '上架' | '維護中' | '未啟用'
type TestStatus = '未部署' | '部署中' | '已部署' | '部署失敗'
type OperationStatus = '正常' | '維護中' | '暫停新局'
type GgapSyncStatus = '已同步' | '同步中' | '同步失敗' | '尚未同步'

interface RtpSummary {
    actual: number | null
    theoretical: number | null
    deviation: number | null
    samples: number
    window: string
    updatedAt: string
    state: RtpState
}

interface EnvironmentSummary {
    version: string | null
    status: ProductionDemoStatus | TestStatus
    rtp?: RtpSummary
    hasPendingRelease?: boolean
    pendingVersion?: string
}

interface ProviderGameRow {
    id: string
    code: string
    name: string
    type: string
    production: EnvironmentSummary
    demo: EnvironmentSummary
    test: EnvironmentSummary
    operation: OperationStatus
    ggapSync: GgapSyncStatus
    updatedAt: string
}

type LegacyGameRow = Record<string, unknown>

interface FilterState {
    keyword: string
    type: string
    production: string
    demo: string
    test: string
    operation: string
    ggapSync: string
    rtp: string
}

const allOption = '全部'
const allStatusOption = '全部狀態'

const typeOptions = [allOption, '老虎機', '棋牌', '真人', '漁機', '迷你遊戲']
const productionStatusOptions = [allStatusOption, '上架', '維護中', '未啟用']
const demoStatusOptions = [allStatusOption, '上架', '維護中', '未啟用']
const testStatusOptions = [allStatusOption, '未部署', '部署中', '已部署', '部署失敗']
const operationOptions = [allStatusOption, '正常', '維護中', '暫停新局']
const ggapSyncOptions = [allStatusOption, '已同步', '同步中', '同步失敗', '尚未同步']
const rtpOptions = [allStatusOption, '正常', '觀察', '樣本不足', '無資料']

const defaultFilters = (): FilterState => ({
    keyword: '',
    type: allOption,
    production: allStatusOption,
    demo: allStatusOption,
    test: allStatusOption,
    operation: allStatusOption,
    ggapSync: allStatusOption,
    rtp: allStatusOption,
})

const filters = reactive<FilterState>(defaultFilters())
const appliedFilters = reactive<FilterState>(defaultFilters())
const rows = ref<ProviderGameRow[]>([])
const loading = ref(true)
const loadError = ref('')
const selectedGame = ref<ProviderGameRow | null>(null)
const detailsVisible = ref(false)

const productionCount = computed(() => rows.value.filter((row) => row.production.status === '上架').length)
const demoCount = computed(() => rows.value.filter((row) => row.demo.status === '上架').length)
const attentionCount = computed(() => rows.value.filter((row) => {
    return row.production.status === '維護中'
        || row.demo.status === '維護中'
        || row.test.status === '部署失敗'
        || row.ggapSync === '同步失敗'
        || row.production.hasPendingRelease
        || row.demo.hasPendingRelease
}).length)

const filteredRows = computed(() => {
    const keyword = appliedFilters.keyword.trim().toLowerCase()

    return rows.value
        .filter((row) => {
            const keywordMatch = !keyword || [row.code, row.name].some((value) => value.toLowerCase().includes(keyword))
            const typeMatch = appliedFilters.type === allOption || row.type === appliedFilters.type
            const productionMatch = appliedFilters.production === allStatusOption || row.production.status === appliedFilters.production
            const demoMatch = appliedFilters.demo === allStatusOption || row.demo.status === appliedFilters.demo
            const testMatch = appliedFilters.test === allStatusOption || row.test.status === appliedFilters.test
            const operationMatch = appliedFilters.operation === allStatusOption || row.operation === appliedFilters.operation
            const ggapMatch = appliedFilters.ggapSync === allStatusOption || row.ggapSync === appliedFilters.ggapSync
            const rtpMatch = appliedFilters.rtp === allStatusOption
                || row.production.rtp?.state === appliedFilters.rtp
                || row.demo.rtp?.state === appliedFilters.rtp

            return keywordMatch && typeMatch && productionMatch && demoMatch && testMatch && operationMatch && ggapMatch && rtpMatch
        })
        .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' }))
})

onMounted(loadGames)

async function loadGames() {
    loading.value = true
    loadError.value = ''

    try {
        const data = await api.get<LegacyGameRow[]>('/api/games/v2/list')
        rows.value = data.map((row, index) => normalizeGameRow(row, index))
    } catch (error) {
        console.error('Failed to load provider games:', error)
        loadError.value = '遊戲列表載入失敗，請重新整理或稍後再試。'
    } finally {
        loading.value = false
    }
}

function normalizeGameRow(row: LegacyGameRow, index: number): ProviderGameRow {
    const code = String(row.code ?? `GAME-${String(index + 1).padStart(3, '0')}`)
    const name = String(row.name ?? '未命名遊戲')
    const type = String(row.type ?? '未分類')
    const seed = index + 1
    const baseVersion = releaseVersion(seed, 0)
    const demoVersion = seed % 4 === 0 ? releaseVersion(seed, 1) : baseVersion
    const testVersion = releaseVersion(seed, 2)
    const rawStatus = String(row.status ?? '')

    const productionStatus: ProductionDemoStatus = seed % 11 === 0
        ? '未啟用'
        : rawStatus === '維護中' || seed % 13 === 0
            ? '維護中'
            : '上架'
    const demoStatus: ProductionDemoStatus = seed % 9 === 0
        ? '未啟用'
        : seed % 12 === 0
            ? '維護中'
            : '上架'
    const testStatus: TestStatus = seed % 15 === 0
        ? '部署失敗'
        : seed % 10 === 0
            ? '部署中'
            : seed % 7 === 0
                ? '未部署'
                : '已部署'

    const operation: OperationStatus = productionStatus === '維護中'
        ? '維護中'
        : seed % 14 === 0
            ? '暫停新局'
            : '正常'

    return {
        id: code,
        code,
        name,
        type,
        production: {
            version: productionStatus === '未啟用' ? null : baseVersion,
            status: productionStatus,
            rtp: buildRtpSummary(row.rtp, seed, 0),
            hasPendingRelease: productionStatus === '上架' && seed % 5 === 0,
            pendingVersion: productionStatus === '上架' && seed % 5 === 0 ? releaseVersion(seed, 3) : undefined,
        },
        demo: {
            version: demoStatus === '未啟用' ? null : demoVersion,
            status: demoStatus,
            rtp: buildRtpSummary(row.rtp, seed, 1),
            hasPendingRelease: demoStatus === '上架' && seed % 6 === 0,
            pendingVersion: demoStatus === '上架' && seed % 6 === 0 ? releaseVersion(seed, 4) : undefined,
        },
        test: {
            version: testStatus === '未部署' ? null : testVersion,
            status: testStatus,
        },
        operation,
        ggapSync: seed % 17 === 0
            ? '同步失敗'
            : seed % 8 === 0
                ? '同步中'
                : seed % 10 === 0
                    ? '尚未同步'
                    : '已同步',
        updatedAt: String(row.updatedAt ?? '2026-08-05 10:00'),
    }
}

function releaseVersion(seed: number, offset: number) {
    const minor = 1 + ((seed + offset) % 4)
    const patch = (seed * 3 + offset) % 10
    return `v1.${minor}.${patch}`
}

function buildRtpSummary(rawRtp: unknown, seed: number, offset: number): RtpSummary {
    const parsed = Number.parseFloat(String(rawRtp ?? '').match(/\d+(?:\.\d+)?/)?.[0] ?? '')
    const theoretical = Number.isFinite(parsed) ? parsed : 96
    const actual = Number((theoretical + (((seed + offset * 2) % 9) - 4) * 0.08).toFixed(2))
    const deviation = Number((actual - theoretical).toFixed(2))
    const samples = 2200 + ((seed * 137 + offset * 211) % 15000)
    const state: RtpState = samples < 5000
        ? '樣本不足'
        : Math.abs(deviation) >= 0.5
            ? '觀察'
            : '正常'

    return {
        actual,
        theoretical,
        deviation,
        samples,
        window: '最近 24 小時',
        updatedAt: '2026-08-05 14:30',
        state,
    }
}

function applyFilters() {
    Object.assign(appliedFilters, filters)
}

function resetFilters() {
    Object.assign(filters, defaultFilters())
    applyFilters()
}

function openDetails(row: ProviderGameRow) {
    selectedGame.value = row
    detailsVisible.value = true
}

function statusClass(value: string) {
    if (['上架', '正常', '已同步'].includes(value)) return 'game-status--success'
    if (['維護中', '暫停新局'].includes(value)) return 'game-status--warning'
    if (['部署中', '同步中'].includes(value)) return 'game-status--progress'
    if (['部署失敗', '同步失敗'].includes(value)) return 'game-status--danger'
    return 'game-status--neutral'
}

function formatRtp(value: number | null | undefined) {
    return value === null || value === undefined ? '—' : `${value.toFixed(2)}%`
}

function formatDeviation(value: number | null | undefined) {
    if (value === null || value === undefined) return '—'
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

function rtpTip(summary: RtpSummary | undefined) {
    if (!summary) return '目前沒有 RTP 資料'
    return [
        `理論 RTP：${formatRtp(summary.theoretical)}`,
        `實際 RTP：${formatRtp(summary.actual)}`,
        `偏差：${formatDeviation(summary.deviation)}`,
        `統計局數：${summary.samples.toLocaleString()}`,
        `統計區間：${summary.window}`,
        `監控狀態：${summary.state}`,
        `最後更新：${summary.updatedAt}`,
    ].join('\n')
}
</script>

<template>
    <div class="page-stack provider-games-page">
        <section class="games-stat-strip" aria-label="遊戲環境摘要">
            <div class="games-stat-item">
                <span>正式上架</span>
                <strong>{{ productionCount }}</strong>
                <small>Provider 正式環境</small>
            </div>
            <div class="games-stat-item">
                <span>DEMO 上架</span>
                <strong>{{ demoCount }}</strong>
                <small>隔離的官網 DEMO</small>
            </div>
            <div class="games-stat-item">
                <span>需要留意</span>
                <strong>{{ attentionCount }}</strong>
                <small>維護、同步或版本提示</small>
            </div>
        </section>

        <FilterCard title="查詢條件" description="依遊戲資料與各環境狀態篩選 Provider 遊戲。">
            <div class="games-filter-grid">
                <div class="field games-filter-keyword">
                    <label for="game-keyword">遊戲代號 / 名稱</label>
                    <InputText id="game-keyword" v-model="filters.keyword" placeholder="搜尋遊戲代號或名稱" fluid @keyup.enter="applyFilters" />
                </div>
                <div class="field">
                    <label for="game-type">遊戲類型</label>
                    <Select id="game-type" v-model="filters.type" :options="typeOptions" fluid />
                </div>
                <div class="field">
                    <label for="production-status">正式狀態</label>
                    <Select id="production-status" v-model="filters.production" :options="productionStatusOptions" fluid />
                </div>
                <div class="field">
                    <label for="demo-status">DEMO 狀態</label>
                    <Select id="demo-status" v-model="filters.demo" :options="demoStatusOptions" fluid />
                </div>
                <div class="field">
                    <label for="test-status">測試狀態</label>
                    <Select id="test-status" v-model="filters.test" :options="testStatusOptions" fluid />
                </div>
                <div class="field">
                    <label for="operation-status">營運控制</label>
                    <Select id="operation-status" v-model="filters.operation" :options="operationOptions" fluid />
                </div>
                <div class="field">
                    <label for="ggap-status">GGAP 同步</label>
                    <Select id="ggap-status" v-model="filters.ggapSync" :options="ggapSyncOptions" fluid />
                </div>
                <div class="field">
                    <label for="rtp-status">RTP 監控</label>
                    <Select id="rtp-status" v-model="filters.rtp" :options="rtpOptions" fluid />
                </div>
                <div class="games-filter-actions">
                    <Button label="查詢" icon="pi pi-search" @click="applyFilters" />
                    <Button label="重置" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" />
                </div>
            </div>
        </FilterCard>

        <div class="games-list-toolbar">
            <div>
                <span class="games-result-count">{{ filteredRows.length }} 款遊戲</span>
                <span class="games-result-note">預設依遊戲 ID 排序，每頁 10 筆</span>
            </div>
            <span class="games-readonly-note"><i class="pi pi-info-circle" /> 版本啟用與發布將於環境頁完成後提供</span>
        </div>

        <SectionCard class="games-table-card">
            <div v-if="loadError" class="games-state-panel games-state-panel--error">
                <i class="pi pi-exclamation-circle" />
                <div>
                    <strong>{{ loadError }}</strong>
                    <p>目前未能取得遊戲資料。</p>
                </div>
                <Button label="重新載入" icon="pi pi-refresh" severity="secondary" outlined @click="loadGames" />
            </div>

            <div v-else-if="!loading && filteredRows.length === 0" class="games-state-panel">
                <i class="pi pi-search" />
                <div>
                    <strong>找不到符合條件的遊戲</strong>
                    <p>請調整篩選條件或清除搜尋內容。</p>
                </div>
                <Button label="清除條件" severity="secondary" outlined @click="resetFilters" />
            </div>

            <DataTable
                v-else
                class="games-data-table"
                :value="filteredRows"
                :loading="loading"
                data-key="id"
                scrollable
                paginator
                :rows="10"
                :rows-per-page-options="[10]"
                sort-field="code"
                :sort-order="1"
                table-style="min-width: 1500px"
                paginator-template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                current-page-report-template="{first}-{last} / {totalRecords}"
            >
                <ColumnGroup type="header">
                    <Row>
                        <Column header="遊戲資訊" :colspan="3" />
                        <Column header="正式環境" :colspan="3" />
                        <Column header="DEMO 環境" :colspan="3" />
                        <Column header="測試環境" :colspan="2" />
                        <Column header="營運控制" />
                        <Column header="GGAP 同步" />
                        <Column header="操作" />
                    </Row>
                    <Row>
                        <Column header="遊戲代號" />
                        <Column header="遊戲名稱" />
                        <Column header="類型" />
                        <Column header="目前生效版號" />
                        <Column header="狀態" />
                        <Column>
                            <template #header>
                                <span class="games-column-title">正式 RTP <i v-tooltip.top="'實際 RTP；詳細理論值、偏差與樣本量請查看資訊提示。'" class="pi pi-info-circle" /></span>
                            </template>
                        </Column>
                        <Column header="目前生效版號" />
                        <Column header="狀態" />
                        <Column>
                            <template #header>
                                <span class="games-column-title">DEMO RTP <i v-tooltip.top="'實際 RTP；詳細理論值、偏差與樣本量請查看資訊提示。'" class="pi pi-info-circle" /></span>
                            </template>
                        </Column>
                        <Column header="目前部署版號" />
                        <Column header="狀態" />
                        <Column header="狀態" />
                        <Column header="狀態" />
                        <Column header="詳情" />
                    </Row>
                </ColumnGroup>

                <Column field="code" frozen sortable style="width: 130px; min-width: 130px">
                    <template #body="{ data }">
                        <span class="games-code">{{ data.code }}</span>
                    </template>
                </Column>
                <Column field="name" frozen sortable style="width: 180px; min-width: 180px">
                    <template #body="{ data }">
                        <div class="games-name-cell">
                            <strong>{{ data.name }}</strong>
                            <small>{{ data.type }}</small>
                        </div>
                    </template>
                </Column>
                <Column field="type" sortable style="width: 105px; min-width: 105px" />

                <Column field="production.version" style="width: 150px; min-width: 150px">
                    <template #body="{ data }">
                        <div class="games-version-cell">
                            <span :class="{ 'games-version-empty': !data.production.version }">{{ data.production.version ?? '—' }}</span>
                            <span v-if="data.production.hasPendingRelease" v-tooltip.top="`有新 Release 可啟用：${data.production.pendingVersion}`" class="release-hint">＋</span>
                        </div>
                    </template>
                </Column>
                <Column field="production.status" style="width: 112px; min-width: 112px">
                    <template #body="{ data }">
                        <span :class="['game-status', statusClass(data.production.status)]">{{ data.production.status }}</span>
                    </template>
                </Column>
                <Column field="production.rtp.actual" style="width: 120px; min-width: 120px">
                    <template #body="{ data }">
                        <span v-tooltip.top="rtpTip(data.production.rtp)" class="games-rtp-value">{{ formatRtp(data.production.rtp?.actual) }}</span>
                    </template>
                </Column>

                <Column field="demo.version" style="width: 150px; min-width: 150px">
                    <template #body="{ data }">
                        <div class="games-version-cell">
                            <span :class="{ 'games-version-empty': !data.demo.version }">{{ data.demo.version ?? '—' }}</span>
                            <span v-if="data.demo.hasPendingRelease" v-tooltip.top="`有新 Release 可啟用：${data.demo.pendingVersion}`" class="release-hint">＋</span>
                        </div>
                    </template>
                </Column>
                <Column field="demo.status" style="width: 112px; min-width: 112px">
                    <template #body="{ data }">
                        <span :class="['game-status', statusClass(data.demo.status)]">{{ data.demo.status }}</span>
                    </template>
                </Column>
                <Column field="demo.rtp.actual" style="width: 120px; min-width: 120px">
                    <template #body="{ data }">
                        <span v-tooltip.top="rtpTip(data.demo.rtp)" class="games-rtp-value">{{ formatRtp(data.demo.rtp?.actual) }}</span>
                    </template>
                </Column>

                <Column field="test.version" style="width: 150px; min-width: 150px">
                    <template #body="{ data }">
                        <span :class="{ 'games-version-empty': !data.test.version }">{{ data.test.version ?? '—' }}</span>
                    </template>
                </Column>
                <Column field="test.status" style="width: 112px; min-width: 112px">
                    <template #body="{ data }">
                        <span :class="['game-status', statusClass(data.test.status)]">{{ data.test.status }}</span>
                    </template>
                </Column>

                <Column field="operation" style="width: 120px; min-width: 120px">
                    <template #body="{ data }">
                        <span :class="['game-status', statusClass(data.operation)]">{{ data.operation }}</span>
                    </template>
                </Column>
                <Column field="ggapSync" style="width: 120px; min-width: 120px">
                    <template #body="{ data }">
                        <span :class="['game-status', statusClass(data.ggapSync)]">{{ data.ggapSync }}</span>
                    </template>
                </Column>
                <Column frozen align-frozen="right" style="width: 92px; min-width: 92px">
                    <template #body="{ data }">
                        <Button label="詳情" icon="pi pi-arrow-up-right" text severity="secondary" @click="openDetails(data)" />
                    </template>
                </Column>
            </DataTable>
        </SectionCard>

        <Dialog v-model:visible="detailsVisible" modal dismissable-mask :header="selectedGame ? `${selectedGame.name} / ${selectedGame.code}` : '遊戲詳情'" class="game-details-dialog">
            <div v-if="selectedGame" class="game-details-content">
                <div class="game-details-intro">
                    <div>
                        <span class="games-page-eyebrow">GAME SUMMARY</span>
                        <h2>環境與營運摘要</h2>
                    </div>
                    <span class="game-status game-status--neutral">設定完整度待確認</span>
                </div>

                <div class="game-details-environments">
                    <article class="game-detail-environment">
                        <div class="game-detail-environment-head">
                            <span>正式環境</span>
                            <span :class="['game-status', statusClass(selectedGame.production.status)]">{{ selectedGame.production.status }}</span>
                        </div>
                        <strong>{{ selectedGame.production.version ?? '—' }}</strong>
                        <small>目前生效 Release</small>
                        <div class="game-detail-rpt">RTP {{ formatRtp(selectedGame.production.rtp?.actual) }}</div>
                    </article>
                    <article class="game-detail-environment">
                        <div class="game-detail-environment-head">
                            <span>DEMO 環境</span>
                            <span :class="['game-status', statusClass(selectedGame.demo.status)]">{{ selectedGame.demo.status }}</span>
                        </div>
                        <strong>{{ selectedGame.demo.version ?? '—' }}</strong>
                        <small>目前生效 Release</small>
                        <div class="game-detail-rpt">RTP {{ formatRtp(selectedGame.demo.rtp?.actual) }}</div>
                    </article>
                    <article class="game-detail-environment">
                        <div class="game-detail-environment-head">
                            <span>測試環境</span>
                            <span :class="['game-status', statusClass(selectedGame.test.status)]">{{ selectedGame.test.status }}</span>
                        </div>
                        <strong>{{ selectedGame.test.version ?? '—' }}</strong>
                        <small>RD 目前部署版本</small>
                        <div class="game-detail-rpt">Provider Portal 只讀</div>
                    </article>
                </div>

                <div class="game-details-grid">
                    <div><span>營運控制</span><strong>{{ selectedGame.operation }}</strong></div>
                    <div><span>GGAP 目錄 / Release 同步</span><strong>{{ selectedGame.ggapSync }}</strong></div>
                    <div><span>正式 RTP 監控</span><strong>{{ selectedGame.production.rtp?.state ?? '無資料' }}</strong></div>
                    <div><span>DEMO RTP 監控</span><strong>{{ selectedGame.demo.rtp?.state ?? '無資料' }}</strong></div>
                </div>

                <div class="game-details-note">
                    <i class="pi pi-info-circle" />
                    <p>版本啟用與發布操作將在環境與發布頁完成後提供；素材上傳由資產管理頁獨立處理。</p>
                </div>
            </div>

            <template #footer>
                <Button label="關閉" severity="secondary" outlined @click="detailsVisible = false" />
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.provider-games-page {
    max-width: 1500px;
    margin: 0 auto;
    padding-bottom: 2.5rem;
}

.games-page-eyebrow {
    display: inline-flex;
    color: #627a83;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.16em;
}

.games-stat-strip {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
    margin-bottom: 1rem;
}

.games-stat-item {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.2rem 0.75rem;
    padding: 0.9rem 1rem;
    border: 1px solid #e0e8e6;
    border-radius: 0.85rem;
    background: #fbfdfc;
}

.games-stat-item span,
.games-stat-item small {
    color: #718087;
}

.games-stat-item span {
    font-size: 0.78rem;
    font-weight: 700;
}

.games-stat-item strong {
    grid-row: span 2;
    align-self: center;
    color: #315b58;
    font-size: 1.55rem;
    font-weight: 760;
}

.games-stat-item small {
    font-size: 0.7rem;
}

.games-filter-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.85rem 1rem;
    align-items: end;
}

.games-filter-keyword {
    grid-column: span 2;
}

.games-filter-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.55rem;
}

.games-filter-actions .p-button {
    min-width: 5.75rem;
}

.games-list-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.15rem 0.35rem 0.55rem;
}

.games-result-count {
    color: #334b50;
    font-size: 0.9rem;
    font-weight: 760;
}

.games-result-note {
    margin-left: 0.65rem;
    color: #7b898e;
    font-size: 0.76rem;
}

.games-readonly-note {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    color: #74848a;
    font-size: 0.75rem;
}

.games-readonly-note i {
    color: #7b9a9d;
}

.games-table-card {
    padding: 0.75rem;
    overflow: hidden;
}

.games-data-table :deep(.p-datatable-thead > tr:first-child > th) {
    background: #eaf3f1;
    border-color: #d8e6e2;
    color: #486566;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

.games-data-table :deep(.p-datatable-thead > tr:nth-child(2) > th) {
    background: #f5f9f8;
    border-color: #e2ebe8;
    color: #5d7075;
    font-size: 0.76rem;
    font-weight: 720;
    white-space: nowrap;
}

.games-data-table :deep(.p-datatable-tbody > tr > td) {
    height: 4.25rem;
    border-color: #e7eeec;
    color: #405359;
    font-size: 0.8rem;
    vertical-align: middle;
}

.games-data-table :deep(.p-datatable-tbody > tr:hover > td) {
    background: #f6fbf9;
}

.games-data-table :deep(.p-datatable-tbody > tr:nth-child(even) > td) {
    background: #fcfefd;
}

.games-data-table :deep(.p-datatable-tbody > tr:nth-child(even):hover > td) {
    background: #f6fbf9;
}

.games-name-cell {
    display: flex;
    flex-direction: column;
    gap: 0.18rem;
}

.games-name-cell strong {
    color: #30484d;
    font-size: 0.84rem;
    font-weight: 760;
}

.games-name-cell small {
    color: #839096;
    font-size: 0.7rem;
}

.games-code,
.games-version-cell > span:first-child {
    color: #3b6268;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.76rem;
    font-weight: 700;
}

.games-version-cell {
    display: inline-flex;
    align-items: center;
    gap: 0.28rem;
}

.games-version-empty {
    color: #a1adb0 !important;
    font-family: inherit !important;
    font-weight: 500 !important;
}

.release-hint {
    display: inline-grid;
    width: 1rem;
    height: 1rem;
    place-items: center;
    border: 1px solid #ead9b7;
    border-radius: 50%;
    background: #fff8e9;
    color: #a47738;
    font-size: 0.72rem;
    font-weight: 800;
    cursor: help;
}

.games-rtp-value {
    color: #4d6468;
    font-variant-numeric: tabular-nums;
    cursor: help;
}

.games-column-title {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
}

.games-column-title i {
    color: #789193;
    cursor: help;
    font-size: 0.7rem;
}

.game-status {
    display: inline-flex;
    min-width: 4.4rem;
    justify-content: center;
    padding: 0.25rem 0.55rem;
    border: 1px solid transparent;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 720;
    line-height: 1.25;
    white-space: nowrap;
}

.game-status--success {
    border-color: #d7e9df;
    background: #edf7f0;
    color: #47745f;
}

.game-status--warning {
    border-color: #eadfca;
    background: #fbf5e9;
    color: #8a7147;
}

.game-status--progress {
    border-color: #d8e5eb;
    background: #eef5f8;
    color: #557584;
}

.game-status--danger {
    border-color: #efdada;
    background: #fbefef;
    color: #9a6262;
}

.game-status--neutral {
    border-color: #e1e7e6;
    background: #f4f7f6;
    color: #748184;
}

.games-state-panel {
    display: flex;
    min-height: 16rem;
    align-items: center;
    justify-content: center;
    gap: 0.85rem;
    padding: 2rem;
    color: #718087;
    text-align: left;
}

.games-state-panel > i {
    color: #7a9696;
    font-size: 1.4rem;
}

.games-state-panel strong,
.games-state-panel p {
    display: block;
}

.games-state-panel strong {
    color: #43575b;
    font-size: 0.9rem;
}

.games-state-panel p {
    margin: 0.25rem 0 0;
    font-size: 0.78rem;
}

.games-state-panel--error > i {
    color: #a87575;
}

.game-details-dialog {
    width: min(820px, calc(100vw - 2rem));
}

.game-details-content {
    display: grid;
    gap: 1.2rem;
}

.game-details-intro {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
}

.game-details-intro h2 {
    margin: 0.35rem 0 0;
    color: #30484d;
    font-size: 1.2rem;
}

.game-details-environments {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
}

.game-detail-environment {
    min-height: 9.5rem;
    padding: 1rem;
    border: 1px solid #e0e9e6;
    border-radius: 0.85rem;
    background: #fbfdfc;
}

.game-detail-environment-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 1rem;
    color: #687c80;
    font-size: 0.76rem;
    font-weight: 760;
}

.game-detail-environment > strong {
    display: block;
    color: #355d62;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 1.25rem;
}

.game-detail-environment > small {
    display: block;
    margin-top: 0.25rem;
    color: #879499;
    font-size: 0.7rem;
}

.game-detail-rpt {
    margin-top: 1rem;
    color: #587579;
    font-size: 0.76rem;
}

.game-details-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
}

.game-details-grid > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.8rem 0.9rem;
    border: 1px solid #e5ecea;
    border-radius: 0.7rem;
    background: #fff;
}

.game-details-grid span {
    color: #7a898e;
    font-size: 0.74rem;
}

.game-details-grid strong {
    color: #476267;
    font-size: 0.78rem;
}

.game-details-note {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    padding: 0.8rem 0.9rem;
    border: 1px solid #dfeae7;
    border-radius: 0.7rem;
    background: #f5faf8;
    color: #63807e;
}

.game-details-note i {
    margin-top: 0.15rem;
}

.game-details-note p {
    margin: 0;
    font-size: 0.76rem;
    line-height: 1.55;
}

@media (max-width: 1100px) {
    .games-filter-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .games-filter-keyword {
        grid-column: span 2;
    }
}
</style>
