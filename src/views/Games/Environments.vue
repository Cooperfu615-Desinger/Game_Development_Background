<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Badge from 'primevue/badge'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import FilterCard from '@/components/ui/FilterCard.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import StatusTag from '@/components/ui/StatusTag.vue'
import SummaryCardGrid from '@/components/ui/SummaryCardGrid.vue'
import { api } from '@/services/apiClient'
import type {
    EnvironmentDeployment,
    GameAvailability,
    LifecycleSnapshot,
    ReleaseEnvironment,
    ReleaseRecord,
} from '@/types/providerGameLifecycle'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const snapshot = ref<LifecycleSnapshot>({ games: [], versions: [], releases: [], environments: [], settingsSnapshots: [], mathSnapshots: [], assets: [], limitPlans: [] })
const loading = ref(true)
const actionLoading = ref(false)
const errorMessage = ref('')
const detailVisible = ref(false)
const availabilityVisible = ref(false)
const selectedReleaseId = ref<string | null>(null)
const selectedGameId = ref<string | null>(null)

const draftFilters = reactive({ keyword: '', environment: 'all', availability: 'all' })
const appliedFilters = reactive({ keyword: '', environment: 'all', availability: 'all' })
const availabilityForm = reactive<{ availability: GameAvailability; reason: string }>({ availability: 'available', reason: '' })

const environmentOptions = [
    { label: '全部環境', value: 'all' },
    { label: 'Production', value: 'production' },
    { label: 'DEMO', value: 'demo' },
    { label: 'Test', value: 'test' },
]
const availabilityOptions = [
    { label: '全部全域狀態', value: 'all' },
    { label: '未發布', value: 'unpublished' },
    { label: '可用', value: 'available' },
    { label: '維護中', value: 'maintenance' },
    { label: '緊急停用', value: 'suspended' },
    { label: '已退役', value: 'retired' },
]
const editableAvailabilityOptions = availabilityOptions.slice(1)

const environmentLabels: Record<ReleaseEnvironment, string> = { production: 'Production', demo: 'DEMO', test: 'Test' }
const availabilityLabels: Record<GameAvailability, string> = {
    unpublished: '未發布', available: '可用', maintenance: '維護中', suspended: '緊急停用', retired: '已退役',
}
const healthLabels = { healthy: '健康', degraded: '效能降級', unavailable: '不可用', no_data: '無資料' }
const ggapLabels = { synced: '已同步', pending: '等待 ACK', failed: '同步失敗', not_applicable: '不適用' }
const releaseStatusLabels: Record<string, string> = {
    preparing: '準備中', awaiting_approval: '待覆核', scheduled: '已排程', deploying: '發布中', succeeded: '已成功',
    failed: '失敗', cancelled: '已取消', rolled_back: '已回復', not_released: '尚未發布',
}
const riskLabels = { fast: '標準流程', guarded: '加強覆核' }
const validationLabels = { passed: '通過', failed: '失敗', pending: '待執行', skipped: '略過' }

const releasesById = computed(() => new Map(snapshot.value.releases.map((item) => [item.id, item])))
const selectedRelease = computed(() => selectedReleaseId.value ? releasesById.value.get(selectedReleaseId.value) ?? null : null)
const selectedGame = computed(() => snapshot.value.games.find((item) => item.id === selectedGameId.value) ?? null)

const filteredRows = computed(() => {
    const keyword = appliedFilters.keyword.trim().toLowerCase()
    return snapshot.value.environments.filter((row) => {
        if (appliedFilters.environment !== 'all' && row.environment !== appliedFilters.environment) return false
        if (appliedFilters.availability !== 'all' && row.availability !== appliedFilters.availability) return false
        if (!keyword) return true
        return [row.gameId, row.gameName, row.activeSemver, row.activeReleaseId, row.pendingReleaseId]
            .some((value) => String(value ?? '').toLowerCase().includes(keyword))
    })
})

const pendingReleases = computed(() => snapshot.value.releases.filter((item) => ['awaiting_approval', 'scheduled', 'deploying'].includes(item.status)))

const summaryCards = computed(() => {
    const summary = (environment: ReleaseEnvironment) => {
        const rows = snapshot.value.environments.filter((item) => item.environment === environment)
        const active = rows.filter((item) => item.serviceEnabled).length
        const healthy = rows.filter((item) => item.health === 'healthy').length
        return { active, total: rows.length, healthy }
    }
    const prod = summary('production')
    const demo = summary('demo')
    const test = summary('test')
    return [
        { label: 'Production', value: `${prod.active} / ${prod.total}`, helper: `服務開放；健康 ${prod.healthy}` },
        { label: 'DEMO', value: `${demo.active} / ${demo.total}`, helper: `服務開放；健康 ${demo.healthy}` },
        { label: 'Test', value: `${test.active} / ${test.total}`, helper: '僅供驗證，不進正式報表與風控' },
        { label: '待處理發布', value: String(pendingReleases.value.length), helper: '待覆核、已排程或發布中' },
    ]
})

function formatTime(value: string | null) {
    if (!value) return '—'
    return new Intl.DateTimeFormat('zh-TW', { dateStyle: 'medium', timeStyle: 'short', hour12: false }).format(new Date(value))
}

async function loadSnapshot() {
    loading.value = true
    errorMessage.value = ''
    try {
        snapshot.value = await api.get<LifecycleSnapshot>('/api/provider/game-lifecycle')
        if (selectedReleaseId.value && !releasesById.value.has(selectedReleaseId.value)) selectedReleaseId.value = null
    } catch {
        errorMessage.value = '生命週期資料載入失敗，請稍後重試。'
    } finally {
        loading.value = false
    }
}

async function replaceRoute(extra: Record<string, string | undefined> = {}) {
    const query: Record<string, string> = {}
    if (appliedFilters.keyword) query.keyword = appliedFilters.keyword
    if (appliedFilters.environment !== 'all') query.environment = appliedFilters.environment
    if (appliedFilters.availability !== 'all') query.availability = appliedFilters.availability
    Object.entries(extra).forEach(([key, value]) => { if (value) query[key] = value })
    await router.replace({ query })
}

function applyFilters() {
    Object.assign(appliedFilters, draftFilters)
    void replaceRoute()
}

function resetFilters() {
    Object.assign(draftFilters, { keyword: '', environment: 'all', availability: 'all' })
    Object.assign(appliedFilters, draftFilters)
    void replaceRoute()
}

function openRelease(releaseId: string | null, row?: EnvironmentDeployment) {
    if (!releaseId) return
    selectedReleaseId.value = releaseId
    selectedGameId.value = row?.gameId ?? releasesById.value.get(releaseId)?.gameId ?? null
    detailVisible.value = true
    const releaseItem = releasesById.value.get(releaseId)
    void replaceRoute({ game_id: selectedGameId.value ?? undefined, environment: releaseItem?.environment, release_id: releaseId })
}

function closeRelease() {
    detailVisible.value = false
    selectedReleaseId.value = null
    selectedGameId.value = null
    void replaceRoute()
}

function openAvailability(gameId: string) {
    const game = snapshot.value.games.find((item) => item.id === gameId)
    if (!game) return
    selectedGameId.value = gameId
    availabilityForm.availability = game.availability
    availabilityForm.reason = game.availabilityReason
    availabilityVisible.value = true
}

async function runAction(path: string, success: string, method: 'patch' | 'post' = 'patch', body?: unknown) {
    actionLoading.value = true
    try {
        await api[method](path, body)
        toast.add({ severity: 'success', summary: success, detail: '已更新前端 mock 狀態；未觸發真實建置或部署。', life: 3200 })
        await loadSnapshot()
    } catch {
        toast.add({ severity: 'error', summary: '操作未完成', detail: '目前狀態不允許此操作，或前置條件尚未通過。', life: 3800 })
    } finally {
        actionLoading.value = false
    }
}

async function approveSelected() {
    if (!selectedRelease.value) return
    await runAction(`/api/provider/game-lifecycle/releases/${selectedRelease.value.id}/approve`, '覆核已完成')
}

async function executeSelected() {
    if (!selectedRelease.value) return
    await runAction(`/api/provider/game-lifecycle/releases/${selectedRelease.value.id}/execute`, '發布模擬已完成')
}

async function rollbackSelected() {
    if (!selectedRelease.value) return
    await runAction(`/api/provider/game-lifecycle/releases/${selectedRelease.value.id}/rollback`, '已建立新的回復發布紀錄', 'post')
}

async function saveAvailability() {
    if (!selectedGame.value || !availabilityForm.reason.trim()) return
    await runAction(`/api/provider/game-lifecycle/games/${selectedGame.value.id}/availability`, '全域可用狀態已更新', 'patch', availabilityForm)
    availabilityVisible.value = false
}

function syncFromRoute() {
    const keyword = String(route.query.keyword ?? '')
    const environment = environmentOptions.some((item) => item.value === route.query.environment) ? String(route.query.environment) : 'all'
    const availability = availabilityOptions.some((item) => item.value === route.query.availability) ? String(route.query.availability) : 'all'
    Object.assign(draftFilters, { keyword, environment, availability })
    Object.assign(appliedFilters, draftFilters)
    const releaseId = typeof route.query.release_id === 'string' ? route.query.release_id : null
    if (releaseId && releasesById.value.has(releaseId)) openRelease(releaseId)
}

watch(() => route.query, syncFromRoute)
onMounted(async () => {
    await loadSnapshot()
    syncFromRoute()
})
</script>

<template>
    <div class="page-stack game-environments-page">
        <SummaryCardGrid :cards="summaryCards" />

        <div class="lifecycle-boundary-note">
            <i class="pi pi-shield" />
            <div>
                <strong>發布控制台 · Prototype</strong>
                <p>本頁固定 Version／Artifact／Release 與環境狀態；操作只更新 mock，不代表真實 CI/CD。全域可用狀態與 GGAP 各代理開放權分開呈現。</p>
            </div>
        </div>

        <FilterCard title="查詢條件" description="依遊戲、環境與全域可用狀態查詢；正式環境深連結可保留目前篩選。">
            <div class="lifecycle-filter-grid">
                <div class="field lifecycle-filter-keyword">
                    <label>識別碼／遊戲／版本</label>
                    <InputText v-model="draftFilters.keyword" placeholder="輸入 Game、Version、Release 或 Build ID" fluid @keyup.enter="applyFilters" />
                </div>
                <div class="field">
                    <label>環境</label>
                    <Select v-model="draftFilters.environment" :options="environmentOptions" option-label="label" option-value="value" fluid />
                </div>
                <div class="field">
                    <label>全域狀態</label>
                    <Select v-model="draftFilters.availability" :options="availabilityOptions" option-label="label" option-value="value" fluid />
                </div>
                <div class="lifecycle-filter-actions">
                    <Button label="查詢" icon="pi pi-search" @click="applyFilters" />
                    <Button label="重置" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" />
                </div>
            </div>
        </FilterCard>

        <div v-if="errorMessage" class="lifecycle-state lifecycle-state--error">
            <i class="pi pi-exclamation-triangle" />
            <div><strong>無法取得環境資料</strong><span>{{ errorMessage }}</span></div>
            <Button label="重試" icon="pi pi-refresh" severity="secondary" outlined @click="loadSnapshot" />
        </div>

        <template v-else>
            <div class="agent-command-bar">
                <div>
                    <span class="table-count"><Badge :value="filteredRows.length" severity="info" /> 筆環境狀態</span>
                    <p>Release 是不可變稽核紀錄；回復會建立新 Release，不覆寫原紀錄。</p>
                </div>
                <div class="agent-command-actions">
                    <Button label="查看待處理佇列" icon="pi pi-clock" severity="secondary" outlined @click="document.getElementById('release-queue')?.scrollIntoView({ behavior: 'smooth' })" />
                </div>
            </div>

            <SectionCard class="lifecycle-table-card">
                <DataTable :value="filteredRows" :loading="loading" scrollable paginator :rows="10" :rows-per-page-options="[10, 20, 50]" table-style="min-width: 1360px">
                    <template #empty>
                        <div class="lifecycle-empty"><i class="pi pi-inbox" /><strong>沒有符合條件的環境資料</strong><span>請調整篩選條件後重新查詢。</span></div>
                    </template>
                    <Column field="gameId" header="遊戲" frozen style="width: 180px; min-width: 180px">
                        <template #body="{ data }">
                            <button class="lifecycle-link-cell" type="button" @click="openAvailability(data.gameId)">
                                <strong>{{ data.gameName }}</strong><span>{{ data.gameId }} · {{ data.gameType }}</span>
                            </button>
                        </template>
                    </Column>
                    <Column field="environment" header="環境" style="width: 112px; min-width: 112px">
                        <template #body="{ data }"><Tag :value="environmentLabels[data.environment as ReleaseEnvironment]" severity="secondary" /></template>
                    </Column>
                    <Column field="availability" header="全域可用狀態" style="width: 132px; min-width: 132px">
                        <template #body="{ data }"><StatusTag :value="availabilityLabels[data.availability as GameAvailability]" /></template>
                    </Column>
                    <Column header="Active Version / Build" style="width: 210px; min-width: 210px">
                        <template #body="{ data }">
                            <div class="lifecycle-id-stack"><strong>{{ data.activeSemver || '尚未發布' }}</strong><span>{{ data.activeBuildId || '—' }}</span></div>
                        </template>
                    </Column>
                    <Column field="activeReleaseId" header="Active Release" style="width: 178px; min-width: 178px">
                        <template #body="{ data }">
                            <button v-if="data.activeReleaseId" class="lifecycle-text-link" type="button" @click="openRelease(data.activeReleaseId, data)">{{ data.activeReleaseId }}</button>
                            <span v-else>—</span>
                        </template>
                    </Column>
                    <Column header="發布／服務" style="width: 160px; min-width: 160px">
                        <template #body="{ data }">
                            <div class="lifecycle-status-stack"><StatusTag :value="releaseStatusLabels[data.releaseStatus]" /><span>{{ data.serviceEnabled ? '服務開放' : '服務關閉' }}</span></div>
                        </template>
                    </Column>
                    <Column header="健康度" style="width: 120px; min-width: 120px">
                        <template #body="{ data }"><StatusTag :value="healthLabels[data.health]" /></template>
                    </Column>
                    <Column header="GGAP 同步" style="width: 132px; min-width: 132px">
                        <template #body="{ data }"><div class="lifecycle-id-stack"><StatusTag :value="ggapLabels[data.ggapSync]" /><span>{{ formatTime(data.ggapSyncAt) }}</span></div></template>
                    </Column>
                    <Column field="pendingReleaseId" header="待處理 Release" style="width: 180px; min-width: 180px">
                        <template #body="{ data }">
                            <button v-if="data.pendingReleaseId" class="lifecycle-text-link" type="button" @click="openRelease(data.pendingReleaseId, data)">{{ data.pendingReleaseId }}</button>
                            <span v-else>—</span>
                        </template>
                    </Column>
                    <Column header="操作" frozen align-frozen="right" style="width: 90px; min-width: 90px">
                        <template #body="{ data }"><Button v-tooltip.top="'查看環境紀錄'" icon="pi pi-eye" text aria-label="查看環境紀錄" @click="openRelease(data.pendingReleaseId || data.activeReleaseId, data)" /></template>
                    </Column>
                </DataTable>
            </SectionCard>

            <SectionCard id="release-queue" class="lifecycle-table-card">
                <template #header>
                    <div class="dialog-title-block"><h2>待處理發布佇列</h2><p>只有通過前置檢查與所需覆核的 Release 才能進入執行；Production 另檢查 DEMO 是否為同一 Artifact。</p></div>
                    <Badge :value="pendingReleases.length" severity="warn" />
                </template>
                <DataTable :value="pendingReleases" scrollable data-key="id" table-style="min-width: 980px">
                    <template #empty><div class="lifecycle-empty"><i class="pi pi-check-circle" /><strong>目前沒有待處理發布</strong></div></template>
                    <Column field="id" header="Release ID" style="width: 185px; min-width: 185px"><template #body="{ data }"><button class="lifecycle-text-link" type="button" @click="openRelease(data.id)">{{ data.id }}</button></template></Column>
                    <Column field="gameName" header="遊戲" />
                    <Column header="目標"><template #body="{ data }">{{ data.semver }} → {{ environmentLabels[data.environment as ReleaseEnvironment] }}</template></Column>
                    <Column header="流程"><template #body="{ data }"><Tag :value="riskLabels[data.riskLane as keyof typeof riskLabels]" :severity="data.riskLane === 'guarded' ? 'warn' : 'info'" /></template></Column>
                    <Column header="狀態"><template #body="{ data }"><StatusTag :value="releaseStatusLabels[data.status]" /></template></Column>
                    <Column header="更新時間"><template #body="{ data }">{{ formatTime(data.updatedAt) }}</template></Column>
                    <Column header="操作" style="width: 96px"><template #body="{ data }"><Button label="查看" text @click="openRelease(data.id)" /></template></Column>
                </DataTable>
            </SectionCard>
        </template>

        <Dialog v-model:visible="detailVisible" modal dismissable-mask header="Release 詳情" class="entity-dialog lifecycle-dialog" @hide="closeRelease">
            <div v-if="selectedRelease" class="entity-dialog-body">
                <div class="lifecycle-dialog-hero">
                    <div><span>{{ environmentLabels[selectedRelease.environment] }} · {{ riskLabels[selectedRelease.riskLane] }}</span><h3>{{ selectedRelease.gameName }} {{ selectedRelease.semver }}</h3><code>{{ selectedRelease.id }}</code></div>
                    <StatusTag :value="releaseStatusLabels[selectedRelease.status]" />
                </div>
                <section class="dialog-section">
                    <h3>固定發布快照</h3>
                    <div class="detail-grid dialog-detail-grid">
                        <div><span>Version ID</span><strong>{{ selectedRelease.versionId }}</strong></div>
                        <div><span>Build Artifact</span><strong>{{ selectedRelease.buildId }}</strong></div>
                        <div><span>目前 Active Release</span><strong>{{ selectedRelease.targetActiveReleaseId || '首次發布' }}</strong></div>
                        <div><span>來源 Release</span><strong>{{ selectedRelease.sourceReleaseId || '—' }}</strong></div>
                        <div><span>變更類型</span><strong>{{ selectedRelease.changeType }}</strong></div>
                        <div><span>排程</span><strong>{{ formatTime(selectedRelease.scheduledAt) }}</strong></div>
                    </div>
                </section>
                <section class="dialog-section">
                    <h3>前置檢查</h3>
                    <div class="lifecycle-check-list">
                        <div v-for="item in selectedRelease.validations" :key="item.key"><StatusTag :value="validationLabels[item.status]" /><div><strong>{{ item.label }}</strong><span>{{ item.detail }}</span></div></div>
                    </div>
                </section>
                <section class="dialog-section">
                    <h3>覆核</h3>
                    <div class="lifecycle-check-list">
                        <div v-for="item in selectedRelease.approvals" :key="item.role"><StatusTag :value="item.status === 'approved' ? '已核准' : item.status === 'rejected' ? '已拒絕' : '待覆核'" /><div><strong>{{ item.role }}</strong><span>{{ item.approver || '尚未指定' }} · {{ formatTime(item.at) }}</span></div></div>
                    </div>
                </section>
                <section class="dialog-section">
                    <h3>稽核時間線</h3>
                    <ol class="lifecycle-timeline"><li v-for="item in selectedRelease.timeline" :key="`${item.at}-${item.action}`"><span>{{ formatTime(item.at) }}</span><div><strong>{{ item.action }}</strong><small>{{ item.actor }} · {{ item.note }}</small></div></li></ol>
                </section>
            </div>
            <template #footer>
                <div class="dialog-footer-actions lifecycle-dialog-actions">
                    <Button label="關閉" severity="secondary" outlined @click="closeRelease" />
                    <Button v-if="selectedRelease?.status === 'awaiting_approval'" label="完成覆核" icon="pi pi-check" :loading="actionLoading" @click="approveSelected" />
                    <Button v-if="selectedRelease?.status === 'scheduled'" label="執行發布模擬" icon="pi pi-play" :loading="actionLoading" @click="executeSelected" />
                    <Button v-if="selectedRelease?.status === 'succeeded' && selectedRelease.environment === 'production'" label="建立回復 Release" icon="pi pi-undo" severity="warn" outlined :loading="actionLoading" @click="rollbackSelected" />
                    <Button v-if="selectedRelease" label="變更全域狀態" icon="pi pi-power-off" severity="secondary" @click="openAvailability(selectedRelease.gameId)" />
                </div>
            </template>
        </Dialog>

        <Dialog v-model:visible="availabilityVisible" modal header="變更遊戲全域可用狀態" class="entity-dialog lifecycle-small-dialog">
            <div v-if="selectedGame" class="entity-dialog-body">
                <div class="lifecycle-dialog-hero"><div><span>{{ selectedGame.id }}</span><h3>{{ selectedGame.name }}</h3><p>此狀態由 Provider 管理；GGAP 各代理開放權不在此設定。</p></div><StatusTag :value="availabilityLabels[selectedGame.availability]" /></div>
                <div class="field"><label>目標狀態</label><Select v-model="availabilityForm.availability" :options="editableAvailabilityOptions" option-label="label" option-value="value" fluid /></div>
                <div class="field"><label>異動原因（必填）</label><InputText v-model="availabilityForm.reason" placeholder="請填寫維護、停用或恢復原因" fluid /></div>
                <div class="notice-card"><i class="pi pi-info-circle" /><span>停用、維護或緊急停用會先關閉 Provider 本地服務，再將同步狀態標為等待 GGAP ACK。</span></div>
            </div>
            <template #footer><div class="dialog-footer-actions"><Button label="取消" severity="secondary" outlined @click="availabilityVisible = false" /><Button label="儲存變更" icon="pi pi-check" :disabled="!availabilityForm.reason.trim()" :loading="actionLoading" @click="saveAvailability" /></div></template>
        </Dialog>
    </div>
</template>

<style scoped>
.lifecycle-boundary-note { display:flex; gap:12px; align-items:flex-start; padding:14px 16px; border:1px solid color-mix(in srgb,var(--primary) 22%,var(--border)); border-radius:var(--radius); background:color-mix(in srgb,var(--primary) 6%,var(--surface-strong)); }
.lifecycle-boundary-note > i { display:grid; place-items:center; width:32px; height:32px; flex:0 0 32px; border-radius:9px; background:var(--surface-strong); color:var(--primary); }
.lifecycle-boundary-note strong { color:var(--text); }
.lifecycle-boundary-note p { margin:3px 0 0; color:var(--muted); font-size:var(--font-sm); line-height:1.55; }
.lifecycle-filter-grid { display:grid; grid-template-columns:minmax(280px,2fr) repeat(2,minmax(160px,1fr)) auto; gap:14px 16px; align-items:end; }
.lifecycle-filter-actions { display:flex; gap:8px; }
.lifecycle-table-card { overflow:hidden; }
.lifecycle-table-card :deep(.p-datatable-wrapper) { overflow-x:auto; }
.lifecycle-link-cell { display:grid; gap:3px; padding:0; border:0; background:none; text-align:left; cursor:pointer; }
.lifecycle-link-cell strong,.lifecycle-text-link { color:var(--primary); font-weight:750; }
.lifecycle-link-cell span,.lifecycle-id-stack span { color:var(--muted); font-size:var(--font-xs); }
.lifecycle-text-link { padding:0; border:0; background:none; font:inherit; cursor:pointer; text-decoration:underline; text-underline-offset:3px; }
.lifecycle-id-stack,.lifecycle-status-stack { display:grid; gap:4px; justify-items:start; }
.lifecycle-id-stack strong { color:var(--text); }
.lifecycle-status-stack span { color:var(--muted); font-size:var(--font-xs); }
.lifecycle-state { display:flex; gap:12px; align-items:center; padding:18px; border:1px solid var(--border); border-radius:var(--radius); background:var(--surface-strong); }
.lifecycle-state > div { display:grid; flex:1; gap:3px; }
.lifecycle-state span { color:var(--muted); font-size:var(--font-sm); }
.lifecycle-state--error > i { color:var(--danger); }
.lifecycle-empty { display:grid; justify-items:center; gap:6px; padding:38px 18px; color:var(--muted); }
.lifecycle-empty i { font-size:24px; }
.lifecycle-dialog-hero { display:flex; justify-content:space-between; gap:16px; align-items:flex-start; padding:16px; border-radius:var(--radius); background:var(--surface-muted); }
.lifecycle-dialog-hero span,.lifecycle-dialog-hero p { margin:0; color:var(--muted); font-size:var(--font-sm); }
.lifecycle-dialog-hero h3 { margin:4px 0; font-size:1.15rem; }
.lifecycle-dialog-hero code { color:var(--primary); font-size:var(--font-xs); }
.lifecycle-check-list { display:grid; gap:8px; }
.lifecycle-check-list > div { display:grid; grid-template-columns:92px 1fr; gap:12px; align-items:start; padding:11px 12px; border:1px solid var(--border); border-radius:10px; }
.lifecycle-check-list > div > div { display:grid; gap:3px; }
.lifecycle-check-list span { color:var(--muted); font-size:var(--font-xs); }
.lifecycle-timeline { display:grid; gap:0; margin:0; padding:0; list-style:none; }
.lifecycle-timeline li { display:grid; grid-template-columns:150px 1fr; gap:14px; padding:10px 0; border-bottom:1px solid var(--border); }
.lifecycle-timeline li > span,.lifecycle-timeline small { color:var(--muted); font-size:var(--font-xs); }
.lifecycle-timeline li > div { display:grid; gap:3px; }
.lifecycle-dialog-actions { flex-wrap:wrap; }
.lifecycle-small-dialog { width:min(620px,calc(100vw - 32px)); }
@media (max-width:900px) { .lifecycle-filter-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } .lifecycle-filter-keyword,.lifecycle-filter-actions { grid-column:1 / -1; } .lifecycle-filter-actions .p-button { flex:1; } }
@media (max-width:600px) { .lifecycle-filter-grid { grid-template-columns:1fr; } .lifecycle-filter-keyword,.lifecycle-filter-actions { grid-column:auto; } .lifecycle-filter-actions { flex-direction:column; } .lifecycle-dialog-hero { flex-direction:column; } .lifecycle-check-list > div { grid-template-columns:1fr; } .lifecycle-timeline li { grid-template-columns:1fr; gap:4px; } .lifecycle-dialog-actions { display:grid; width:100%; } .lifecycle-dialog-actions :deep(.p-button) { width:100%; } }
</style>
