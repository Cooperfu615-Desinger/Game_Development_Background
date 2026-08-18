<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Badge from 'primevue/badge'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import Textarea from 'primevue/textarea'
import FilterCard from '@/components/ui/FilterCard.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import StatusTag from '@/components/ui/StatusTag.vue'
import SummaryCardGrid from '@/components/ui/SummaryCardGrid.vue'
import { api } from '@/services/apiClient'
import type {
    ChangeType,
    CreateVersionDraftPayload,
    GameVersion,
    GameVersionStatus,
    LifecycleSnapshot,
    ReleaseEnvironment,
} from '@/types/providerGameLifecycle'

const router = useRouter()
const toast = useToast()

const snapshot = ref<LifecycleSnapshot>({ games: [], versions: [], releases: [], environments: [] })
const loading = ref(true)
const actionLoading = ref(false)
const errorMessage = ref('')
const detailVisible = ref(false)
const createVisible = ref(false)
const selectedVersionId = ref<string | null>(null)

const draftFilters = reactive({ keyword: '', gameId: 'all', status: 'all', changeType: 'all' })
const appliedFilters = reactive({ keyword: '', gameId: 'all', status: 'all', changeType: 'all' })
const createForm = reactive<CreateVersionDraftPayload>({ gameId: '', semver: '', changeType: 'feature', summary: '' })

const statusLabels: Record<GameVersionStatus, string> = {
    draft: '草稿', candidate: '候選版', approved: '已核准', published: '已發布', retired: '已退役', cancelled: '已取消',
}
const validationLabels = { passed: '通過', failed: '失敗', pending: '待驗證', skipped: '略過' }
const changeTypeLabels: Record<ChangeType, string> = {
    feature: '功能', fix: '修補', math: '數值', asset: '素材', security: '安全性', configuration: '設定',
}
const environmentLabels: Record<ReleaseEnvironment, string> = { production: 'Production', demo: 'DEMO', test: 'Test' }
const statusOptions = [
    { label: '全部狀態', value: 'all' },
    ...Object.entries(statusLabels).map(([value, label]) => ({ label, value })),
]
const changeTypeOptions = [
    { label: '全部變更類型', value: 'all' },
    ...Object.entries(changeTypeLabels).map(([value, label]) => ({ label, value })),
]
const createChangeTypeOptions = changeTypeOptions.slice(1)

const gameOptions = computed(() => [
    { label: '全部遊戲', value: 'all' },
    ...snapshot.value.games.map((item) => ({ label: `${item.name} · ${item.id}`, value: item.id })),
])
const createGameOptions = computed(() => gameOptions.value.slice(1))
const selectedVersion = computed(() => snapshot.value.versions.find((item) => item.id === selectedVersionId.value) ?? null)
const selectedReleases = computed(() => selectedVersion.value
    ? snapshot.value.releases.filter((item) => selectedVersion.value!.releaseIds.includes(item.id))
    : [])

const filteredVersions = computed(() => {
    const keyword = appliedFilters.keyword.trim().toLowerCase()
    return snapshot.value.versions.filter((row) => {
        if (appliedFilters.gameId !== 'all' && row.gameId !== appliedFilters.gameId) return false
        if (appliedFilters.status !== 'all' && row.status !== appliedFilters.status) return false
        if (appliedFilters.changeType !== 'all' && row.changeType !== appliedFilters.changeType) return false
        if (!keyword) return true
        return [row.id, row.gameId, row.gameName, row.semver, row.artifact?.buildId, row.artifact?.checksum]
            .some((value) => String(value ?? '').toLowerCase().includes(keyword))
    })
})

const summaryCards = computed(() => {
    const versions = snapshot.value.versions
    const ready = versions.filter((row) => ['candidate', 'approved'].includes(row.status)).length
    const rollback = versions.filter((row) => row.rollbackCandidate).length
    const artifactPassed = versions.filter((row) => row.artifact && row.validationStatus === 'passed').length
    const production = versions.filter((row) => row.publishedEnvironments.includes('production')).length
    return [
        { label: '版本總數', value: String(versions.length), helper: 'Version 與 Release 分開管理' },
        { label: '候選／已核准', value: String(ready), helper: '可繼續驗證或建立 Release' },
        { label: '回復候選', value: String(rollback), helper: '僅標示可供新回復 Release 使用' },
        { label: 'Production 版本', value: String(production), helper: `Artifact 驗證通過 ${artifactPassed}` },
    ]
})

function formatTime(value: string) {
    return new Intl.DateTimeFormat('zh-TW', { dateStyle: 'medium', timeStyle: 'short', hour12: false }).format(new Date(value))
}

async function loadSnapshot() {
    loading.value = true
    errorMessage.value = ''
    try {
        snapshot.value = await api.get<LifecycleSnapshot>('/api/provider/game-lifecycle')
    } catch {
        errorMessage.value = '版本資料載入失敗，請稍後重試。'
    } finally {
        loading.value = false
    }
}

function applyFilters() {
    Object.assign(appliedFilters, draftFilters)
}

function resetFilters() {
    Object.assign(draftFilters, { keyword: '', gameId: 'all', status: 'all', changeType: 'all' })
    Object.assign(appliedFilters, draftFilters)
}

function openDetail(row: GameVersion) {
    selectedVersionId.value = row.id
    detailVisible.value = true
}

function openCreate() {
    const firstGame = snapshot.value.games[0]
    Object.assign(createForm, { gameId: firstGame?.id ?? '', semver: '', changeType: 'feature', summary: '' })
    createVisible.value = true
}

async function createDraft() {
    if (!createForm.gameId || !createForm.semver.trim() || !createForm.summary.trim()) return
    actionLoading.value = true
    try {
        const created = await api.post<GameVersion>('/api/provider/game-lifecycle/versions', createForm)
        await loadSnapshot()
        createVisible.value = false
        openDetail(created)
        toast.add({ severity: 'success', summary: '版本草稿已建立', detail: `${created.gameName} ${created.semver} 尚未包含 Build Artifact。`, life: 3200 })
    } catch {
        toast.add({ severity: 'error', summary: '草稿建立失敗', detail: '請確認遊戲與版本號。', life: 3200 })
    } finally {
        actionLoading.value = false
    }
}

async function updateStatus(status: GameVersionStatus) {
    if (!selectedVersion.value) return
    actionLoading.value = true
    try {
        await api.patch(`/api/provider/game-lifecycle/versions/${selectedVersion.value.id}/status`, { status })
        await loadSnapshot()
        toast.add({ severity: 'success', summary: `版本狀態已更新為「${statusLabels[status]}」`, detail: status === 'candidate' ? '已建立不可變 Artifact mock，等待驗證。' : '狀態已寫入集中 mock。', life: 3200 })
    } catch {
        toast.add({ severity: 'error', summary: '狀態更新失敗', detail: '目前版本不符合目標狀態的前置條件。', life: 3400 })
    } finally {
        actionLoading.value = false
    }
}

function openRelease(releaseId?: string) {
    if (!selectedVersion.value) return
    const release = releaseId ? snapshot.value.releases.find((item) => item.id === releaseId) : undefined
    void router.push({ path: '/games/environments', query: { game_id: selectedVersion.value.gameId, environment: release?.environment, release_id: release?.id } })
}

onMounted(loadSnapshot)
</script>

<template>
    <div class="page-stack game-versions-page lifecycle-versions-page">
        <SummaryCardGrid :cards="summaryCards" />

        <div class="version-boundary-strip">
            <div><span>01</span><strong>Version</strong><small>需求與設定快照</small></div>
            <i class="pi pi-angle-right" />
            <div><span>02</span><strong>Build Artifact</strong><small>不可變執行產物</small></div>
            <i class="pi pi-angle-right" />
            <div><span>03</span><strong>Release</strong><small>對單一環境的發布紀錄</small></div>
            <i class="pi pi-angle-right" />
            <div><span>04</span><strong>Active Release</strong><small>環境目前實際版本</small></div>
        </div>

        <FilterCard title="查詢條件" description="查詢 Version 與其不可變 Artifact；環境發布與回復請至「環境與發布」。">
            <div class="version-filter-grid">
                <div class="field version-filter-keyword">
                    <label>識別碼／版本／Artifact</label>
                    <InputText v-model="draftFilters.keyword" placeholder="Version ID、Build ID、checksum" fluid @keyup.enter="applyFilters" />
                </div>
                <div class="field">
                    <label>遊戲</label>
                    <Select v-model="draftFilters.gameId" :options="gameOptions" option-label="label" option-value="value" fluid />
                </div>
                <div class="field">
                    <label>版本狀態</label>
                    <Select v-model="draftFilters.status" :options="statusOptions" option-label="label" option-value="value" fluid />
                </div>
                <div class="field">
                    <label>變更類型</label>
                    <Select v-model="draftFilters.changeType" :options="changeTypeOptions" option-label="label" option-value="value" fluid />
                </div>
                <div class="version-filter-actions">
                    <Button label="查詢" icon="pi pi-search" @click="applyFilters" />
                    <Button label="重置" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" />
                </div>
            </div>
        </FilterCard>

        <div v-if="errorMessage" class="version-state version-state--error">
            <i class="pi pi-exclamation-triangle" /><div><strong>無法取得版本資料</strong><span>{{ errorMessage }}</span></div><Button label="重試" outlined @click="loadSnapshot" />
        </div>

        <template v-else>
            <div class="agent-command-bar">
                <div>
                    <span class="table-count"><Badge :value="filteredVersions.length" severity="info" /> 筆版本</span>
                    <p>Version 不使用「已回滾」狀態；回復一律建立新的 Release Record。</p>
                </div>
                <div class="agent-command-actions">
                    <Button label="新增版本草稿" icon="pi pi-plus" @click="openCreate" />
                    <Button label="環境與發布" icon="pi pi-cloud" severity="secondary" outlined @click="router.push('/games/environments')" />
                </div>
            </div>

            <SectionCard class="version-table-card">
                <DataTable :value="filteredVersions" :loading="loading" scrollable paginator :rows="10" :rows-per-page-options="[10, 20, 50]" data-key="id" table-style="min-width: 1540px">
                    <template #empty><div class="version-empty"><i class="pi pi-inbox" /><strong>沒有符合條件的版本</strong><span>請調整查詢條件或建立版本草稿。</span></div></template>
                    <Column field="id" header="Version ID" frozen style="width: 190px; min-width: 190px">
                        <template #body="{ data }"><button class="version-text-link" type="button" @click="openDetail(data)">{{ data.id }}</button></template>
                    </Column>
                    <Column field="gameName" header="遊戲" style="width: 160px; min-width: 160px">
                        <template #body="{ data }"><div class="version-id-stack"><strong>{{ data.gameName }}</strong><span>{{ data.gameId }}</span></div></template>
                    </Column>
                    <Column field="semver" header="SemVer" style="width: 96px; min-width: 96px" />
                    <Column header="Build Artifact" style="width: 180px; min-width: 180px">
                        <template #body="{ data }"><div class="version-id-stack"><strong>{{ data.artifact?.buildId || '尚未建立' }}</strong><span>{{ data.artifact?.checksum || 'Draft 無 Artifact' }}</span></div></template>
                    </Column>
                    <Column header="版本狀態" style="width: 110px; min-width: 110px"><template #body="{ data }"><StatusTag :value="statusLabels[data.status as GameVersionStatus]" /></template></Column>
                    <Column header="變更類型" style="width: 100px; min-width: 100px"><template #body="{ data }"><Tag :value="changeTypeLabels[data.changeType as ChangeType]" severity="secondary" /></template></Column>
                    <Column header="設定／數值／素材快照" style="width: 220px; min-width: 220px"><template #body="{ data }"><div class="version-ref-stack"><span>{{ data.settingsRef }}</span><span>{{ data.mathRef }}</span><span>{{ data.assetsRef }}</span></div></template></Column>
                    <Column header="驗證" style="width: 120px; min-width: 120px"><template #body="{ data }"><div class="version-id-stack"><StatusTag :value="validationLabels[data.validationStatus]" /><span>{{ data.validationSummary }}</span></div></template></Column>
                    <Column header="已發布環境" style="width: 190px; min-width: 190px"><template #body="{ data }"><div v-if="data.publishedEnvironments.length" class="version-tag-list"><Tag v-for="item in data.publishedEnvironments" :key="item" :value="environmentLabels[item as ReleaseEnvironment]" severity="info" /></div><span v-else>—</span></template></Column>
                    <Column header="回復候選" style="width: 100px; min-width: 100px"><template #body="{ data }"><StatusTag :value="data.rollbackCandidate ? '可用' : '否'" /></template></Column>
                    <Column header="更新時間" style="width: 170px; min-width: 170px"><template #body="{ data }">{{ formatTime(data.updatedAt) }}</template></Column>
                    <Column header="操作" frozen align-frozen="right" style="width: 94px; min-width: 94px"><template #body="{ data }"><Button v-tooltip.top="'查看版本'" icon="pi pi-eye" text aria-label="查看版本" @click="openDetail(data)" /></template></Column>
                </DataTable>
            </SectionCard>
        </template>

        <Dialog v-model:visible="detailVisible" modal dismissable-mask header="Version 詳情" class="entity-dialog version-detail-dialog">
            <div v-if="selectedVersion" class="entity-dialog-body">
                <div class="version-dialog-hero">
                    <div><span>{{ selectedVersion.gameName }} · {{ selectedVersion.gameId }}</span><h3>{{ selectedVersion.semver }}</h3><code>{{ selectedVersion.id }}</code></div>
                    <StatusTag :value="statusLabels[selectedVersion.status]" />
                </div>
                <section class="dialog-section">
                    <h3>版本定義</h3>
                    <div class="detail-grid dialog-detail-grid">
                        <div><span>變更類型</span><strong>{{ changeTypeLabels[selectedVersion.changeType] }}</strong></div>
                        <div><span>負責單位</span><strong>{{ selectedVersion.owner }}</strong></div>
                        <div><span>設定快照</span><strong>{{ selectedVersion.settingsRef }}</strong></div>
                        <div><span>數值快照</span><strong>{{ selectedVersion.mathRef }}</strong></div>
                        <div><span>素材快照</span><strong>{{ selectedVersion.assetsRef }}</strong></div>
                        <div><span>來源版本</span><strong>{{ selectedVersion.basedOnVersionId || '首版' }}</strong></div>
                    </div>
                    <p class="version-summary">{{ selectedVersion.summary }}</p>
                    <ul class="version-change-list"><li v-for="item in selectedVersion.changeLog" :key="item">{{ item }}</li></ul>
                </section>
                <section class="dialog-section">
                    <h3>Build Artifact</h3>
                    <div v-if="selectedVersion.artifact" class="detail-grid dialog-detail-grid">
                        <div><span>Build ID</span><strong>{{ selectedVersion.artifact.buildId }}</strong></div>
                        <div><span>Checksum</span><strong>{{ selectedVersion.artifact.checksum }}</strong></div>
                        <div><span>Manifest</span><strong>{{ selectedVersion.artifact.manifestId }}</strong></div>
                        <div><span>Git commit</span><strong>{{ selectedVersion.artifact.gitCommit }}</strong></div>
                        <div><span>建置時間</span><strong>{{ formatTime(selectedVersion.artifact.builtAt) }}</strong></div>
                        <div><span>不可變性</span><strong>Immutable</strong></div>
                    </div>
                    <div v-else class="version-artifact-empty"><i class="pi pi-box" /><div><strong>草稿尚無 Artifact</strong><span>送出候選版時才會固定 Build、checksum 與 manifest。</span></div></div>
                </section>
                <section class="dialog-section">
                    <h3>驗證與發布關聯</h3>
                    <div class="version-validation"><StatusTag :value="validationLabels[selectedVersion.validationStatus]" /><span>{{ selectedVersion.validationSummary }}</span></div>
                    <div v-if="selectedReleases.length" class="version-release-list">
                        <button v-for="item in selectedReleases" :key="item.id" type="button" @click="openRelease(item.id)"><span>{{ environmentLabels[item.environment] }}</span><strong>{{ item.id }}</strong><small>{{ item.buildId }}</small></button>
                    </div>
                    <div v-else class="version-artifact-empty"><i class="pi pi-cloud" /><div><strong>尚無 Release Record</strong><span>Version 核准後，才在目標環境建立獨立 Release。</span></div></div>
                </section>
            </div>
            <template #footer>
                <div class="dialog-footer-actions version-dialog-actions">
                    <Button label="關閉" severity="secondary" outlined @click="detailVisible = false" />
                    <Button v-if="selectedVersion?.status === 'draft'" label="建立 Artifact 並送候選" icon="pi pi-box" :loading="actionLoading" @click="updateStatus('candidate')" />
                    <Button v-if="selectedVersion?.status === 'candidate'" label="核准版本" icon="pi pi-check" :loading="actionLoading" @click="updateStatus('approved')" />
                    <Button v-if="selectedVersion && ['draft', 'candidate'].includes(selectedVersion.status)" label="取消版本" icon="pi pi-times" severity="danger" outlined :loading="actionLoading" @click="updateStatus('cancelled')" />
                    <Button v-if="selectedVersion?.status === 'approved' || selectedVersion?.status === 'published'" label="前往環境與發布" icon="pi pi-cloud" @click="openRelease(selectedReleases[0]?.id)" />
                </div>
            </template>
        </Dialog>

        <Dialog v-model:visible="createVisible" modal header="新增版本草稿" class="entity-dialog version-create-dialog">
            <div class="entity-dialog-body">
                <div class="version-draft-note"><i class="pi pi-file-edit" /><div><strong>先建立 Version，再產生 Artifact</strong><span>草稿只固定需求意圖；不會在此階段建立 Release 或影響任何環境。</span></div></div>
                <div class="dialog-form-grid">
                    <div class="field field-span-6"><label>遊戲</label><Select v-model="createForm.gameId" :options="createGameOptions" option-label="label" option-value="value" fluid /></div>
                    <div class="field field-span-3"><label>版本號</label><InputText v-model="createForm.semver" placeholder="例如 v2.6.0" fluid /></div>
                    <div class="field field-span-3"><label>變更類型</label><Select v-model="createForm.changeType" :options="createChangeTypeOptions" option-label="label" option-value="value" fluid /></div>
                    <div class="field field-span-12"><label>變更摘要</label><Textarea v-model="createForm.summary" rows="4" placeholder="說明本版目的與主要差異" fluid /></div>
                </div>
            </div>
            <template #footer><div class="dialog-footer-actions"><Button label="取消" severity="secondary" outlined @click="createVisible = false" /><Button label="建立草稿" icon="pi pi-plus" :disabled="!createForm.gameId || !createForm.semver.trim() || !createForm.summary.trim()" :loading="actionLoading" @click="createDraft" /></div></template>
        </Dialog>
    </div>
</template>

<style scoped>
.version-boundary-strip { display:grid; grid-template-columns:1fr auto 1fr auto 1fr auto 1fr; gap:10px; align-items:center; padding:14px; border:1px solid var(--border); border-radius:var(--radius); background:var(--surface-strong); }
.version-boundary-strip > div { display:grid; grid-template-columns:auto 1fr; gap:2px 9px; align-items:center; min-width:0; }
.version-boundary-strip span { grid-row:1 / 3; display:grid; place-items:center; width:30px; height:30px; border-radius:9px; background:color-mix(in srgb,var(--primary) 12%,var(--surface)); color:var(--primary); font-size:var(--font-xs); font-weight:850; }
.version-boundary-strip strong { color:var(--text); font-size:var(--font-sm); }
.version-boundary-strip small { overflow:hidden; color:var(--muted); font-size:var(--font-xs); text-overflow:ellipsis; white-space:nowrap; }
.version-boundary-strip > i { color:var(--muted); }
.version-table-card { overflow:hidden; }
.version-table-card :deep(.p-datatable-wrapper) { overflow-x:auto; }
.version-text-link { padding:0; border:0; background:none; color:var(--primary); font:inherit; font-weight:750; text-decoration:underline; text-underline-offset:3px; cursor:pointer; }
.version-id-stack,.version-ref-stack { display:grid; gap:3px; justify-items:start; min-width:0; }
.version-id-stack strong { color:var(--text); }
.version-id-stack span,.version-ref-stack span { max-width:210px; overflow:hidden; color:var(--muted); font-size:var(--font-xs); text-overflow:ellipsis; white-space:nowrap; }
.version-tag-list { display:flex; gap:4px; flex-wrap:wrap; }
.version-state { display:flex; gap:12px; align-items:center; padding:18px; border:1px solid var(--border); border-radius:var(--radius); background:var(--surface-strong); }
.version-state > div { display:grid; flex:1; gap:3px; }
.version-state span { color:var(--muted); font-size:var(--font-sm); }
.version-state--error > i { color:var(--danger); }
.version-empty { display:grid; justify-items:center; gap:6px; padding:40px 18px; color:var(--muted); }
.version-empty i { font-size:24px; }
.version-dialog-hero { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; padding:16px; border-radius:var(--radius); background:var(--surface-muted); }
.version-dialog-hero span { color:var(--muted); font-size:var(--font-sm); }
.version-dialog-hero h3 { margin:4px 0; font-size:1.2rem; }
.version-dialog-hero code { color:var(--primary); font-size:var(--font-xs); }
.version-summary { margin:0; color:var(--muted); font-size:var(--font-sm); line-height:1.55; }
.version-artifact-empty,.version-draft-note { display:flex; gap:12px; align-items:flex-start; padding:14px; border:1px dashed var(--border); border-radius:var(--radius); background:var(--surface-muted); }
.version-artifact-empty > div,.version-draft-note > div { display:grid; gap:3px; }
.version-artifact-empty span,.version-draft-note span { color:var(--muted); font-size:var(--font-sm); line-height:1.5; }
.version-validation { display:flex; align-items:center; gap:10px; color:var(--muted); font-size:var(--font-sm); }
.version-release-list { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; }
.version-release-list button { display:grid; gap:3px; padding:12px; border:1px solid var(--border); border-radius:10px; background:var(--surface-strong); text-align:left; cursor:pointer; }
.version-release-list button:hover { border-color:var(--primary); }
.version-release-list span,.version-release-list small { color:var(--muted); font-size:var(--font-xs); }
.version-release-list strong { color:var(--primary); }
.version-create-dialog { width:min(720px,calc(100vw - 32px)); }
.version-dialog-actions { flex-wrap:wrap; }
@media (max-width:1000px) { .version-boundary-strip { grid-template-columns:repeat(2,minmax(0,1fr)); } .version-boundary-strip > i { display:none; } }
@media (max-width:760px) { .version-filter-grid > .field,.version-filter-keyword,.version-filter-actions { grid-column:1 / -1 !important; } .version-filter-actions { flex-direction:column; } .version-filter-actions .p-button { width:100%; } .version-boundary-strip { grid-template-columns:1fr; } .version-dialog-hero { flex-direction:column; } .version-release-list { grid-template-columns:1fr; } .version-dialog-actions { display:grid; width:100%; } .version-dialog-actions :deep(.p-button) { width:100%; } .dialog-form-grid { grid-template-columns:1fr; } .dialog-form-grid > .field { grid-column:auto; } }
</style>
