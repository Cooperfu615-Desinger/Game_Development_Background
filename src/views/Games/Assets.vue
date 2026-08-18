<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import Badge from 'primevue/badge'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import FilterCard from '@/components/ui/FilterCard.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import StatusTag from '@/components/ui/StatusTag.vue'
import SummaryCardGrid from '@/components/ui/SummaryCardGrid.vue'
import { api } from '@/services/apiClient'
import type { AssetStatus, CreateAssetDraftPayload, GameAssetRecord, LifecycleSnapshot } from '@/types/providerGameLifecycle'

const toast = useToast()
const snapshot = ref<LifecycleSnapshot>({ games: [], versions: [], releases: [], environments: [], settingsSnapshots: [], mathSnapshots: [], assets: [], limitPlans: [] })
const loading = ref(true)
const actionLoading = ref(false)
const detailVisible = ref(false)
const uploadVisible = ref(false)
const selectedId = ref<string | null>(null)
const draftFilters = reactive({ keyword: '', gameId: 'all', type: 'all', locale: 'all', status: 'all' })
const appliedFilters = reactive({ keyword: '', gameId: 'all', type: 'all', locale: 'all', status: 'all' })
const uploadForm = reactive<CreateAssetDraftPayload>({ gameId: '', type: 'Icon', locale: '繁中', relatedVersionId: '', note: '', supersedesId: null })

const statusLabels: Record<AssetStatus, string> = { draft: '草稿', review: '審核中', approved: '已核准', published: '已發布', retired: '已退役' }
const typeValues: GameAssetRecord['type'][] = ['Icon', 'Banner', 'Loading', 'Table Skin']
const localeValues = ['繁中', '英文', '泰文', '越南文']
const gameOptions = computed(() => [{ label: '全部遊戲', value: 'all' }, ...snapshot.value.games.map((item) => ({ label: `${item.name} · ${item.id}`, value: item.id }))])
const uploadGameOptions = computed(() => gameOptions.value.slice(1))
const typeOptions = [{ label: '全部類型', value: 'all' }, ...typeValues.map((value) => ({ label: value, value }))]
const localeOptions = [{ label: '全部語系', value: 'all' }, ...localeValues.map((value) => ({ label: value, value }))]
const statusOptions = [{ label: '全部狀態', value: 'all' }, ...Object.entries(statusLabels).map(([value, label]) => ({ value, label }))]
const selectedAsset = computed(() => snapshot.value.assets.find((item) => item.id === selectedId.value) ?? null)
const versionOptions = computed(() => snapshot.value.versions.filter((item) => item.gameId === uploadForm.gameId).map((item) => ({ label: `${item.semver} · ${item.id}`, value: item.id })))

const rows = computed(() => {
    const keyword = appliedFilters.keyword.trim().toLowerCase()
    return snapshot.value.assets.filter((item) => {
        if (appliedFilters.gameId !== 'all' && item.gameId !== appliedFilters.gameId) return false
        if (appliedFilters.type !== 'all' && item.type !== appliedFilters.type) return false
        if (appliedFilters.locale !== 'all' && item.locale !== appliedFilters.locale) return false
        if (appliedFilters.status !== 'all' && item.status !== appliedFilters.status) return false
        return !keyword || [item.id, item.bundleId, item.gameId, item.gameName, item.checksum, item.storageRef].some((value) => value.toLowerCase().includes(keyword))
    })
})

const summaryCards = computed(() => [
    { label: '素材紀錄', value: snapshot.value.assets.length, helper: '每次上傳建立新 Asset ID' },
    { label: '不可變檔案', value: snapshot.value.assets.filter((item) => item.immutable).length, helper: 'Checksum 與 storage ref 固定' },
    { label: '支援語系', value: new Set(snapshot.value.assets.map((item) => item.locale)).size, helper: '語系素材分開保存' },
    { label: '關聯 Bundle', value: new Set(snapshot.value.assets.map((item) => item.bundleId)).size, helper: '由 Version 固定素材 Bundle' },
])

async function loadSnapshot() { loading.value = true; try { snapshot.value = await api.get<LifecycleSnapshot>('/api/provider/game-lifecycle') } finally { loading.value = false } }
function applyFilters() { Object.assign(appliedFilters, draftFilters) }
function resetFilters() { Object.assign(draftFilters, { keyword: '', gameId: 'all', type: 'all', locale: 'all', status: 'all' }); applyFilters() }
function openDetail(row: GameAssetRecord) { selectedId.value = row.id; detailVisible.value = true }
function formatTime(value: string) { return new Intl.DateTimeFormat('zh-TW', { dateStyle: 'medium', timeStyle: 'short', hour12: false }).format(new Date(value)) }

function openUpload(source?: GameAssetRecord) {
    const firstGame = source?.gameId ?? snapshot.value.games[0]?.id ?? ''
    Object.assign(uploadForm, { gameId: firstGame, type: source?.type ?? 'Icon', locale: source?.locale ?? '繁中', relatedVersionId: source?.relatedVersionIds[0] ?? '', note: source ? `建立 ${source.id} 的後繼素材` : '', supersedesId: source?.id ?? null })
    detailVisible.value = false
    uploadVisible.value = true
}

async function createAsset() {
    if (!uploadForm.gameId || !uploadForm.relatedVersionId || !uploadForm.note.trim()) return
    actionLoading.value = true
    try {
        const created = await api.post<GameAssetRecord>('/api/provider/game-lifecycle/assets', uploadForm)
        await loadSnapshot(); uploadVisible.value = false; selectedId.value = created.id; detailVisible.value = true
        toast.add({ severity: 'success', summary: '新素材草稿已建立', detail: `${created.id} 已保存新 checksum；舊素材沒有被覆寫。`, life: 3600 })
    } catch { toast.add({ severity: 'error', summary: '素材草稿建立失敗', detail: '請確認遊戲、Version 與備註。', life: 3200 }) }
    finally { actionLoading.value = false }
}

onMounted(loadSnapshot)
</script>

<template>
    <div class="page-stack game-assets-page lifecycle-assets-page">
        <SummaryCardGrid :cards="summaryCards" />
        <div class="asset-boundary-note"><i class="pi pi-images" /><div><strong>素材不可原地替換</strong><p>每次上傳都建立新的 Asset ID、checksum 與 storage reference；「後繼素材」只記錄 supersedes 關係，已發布 Artifact 仍引用原始檔案。</p></div></div>

        <FilterCard title="查詢條件" description="查詢素材紀錄、Bundle、語系、checksum 與關聯 Version。"><div class="asset-filter-grid"><div class="field asset-filter-keyword"><label>識別碼／遊戲／Checksum</label><InputText v-model="draftFilters.keyword" placeholder="Asset ID、Bundle ID、Game ID" fluid @keyup.enter="applyFilters" /></div><div class="field"><label>遊戲</label><Select v-model="draftFilters.gameId" :options="gameOptions" option-label="label" option-value="value" fluid /></div><div class="field"><label>素材類型</label><Select v-model="draftFilters.type" :options="typeOptions" option-label="label" option-value="value" fluid /></div><div class="field"><label>語系</label><Select v-model="draftFilters.locale" :options="localeOptions" option-label="label" option-value="value" fluid /></div><div class="field"><label>狀態</label><Select v-model="draftFilters.status" :options="statusOptions" option-label="label" option-value="value" fluid /></div><div class="asset-filter-actions"><Button label="查詢" icon="pi pi-search" @click="applyFilters" /><Button label="重置" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" /></div></div></FilterCard>

        <div class="agent-command-bar"><div><span class="table-count"><Badge :value="rows.length" severity="info" /> 筆素材紀錄</span><p>核心素材異動會要求新 Version／Artifact 並重新走 Test、DEMO、Production。</p></div><div class="agent-command-actions"><Button label="建立素材草稿" icon="pi pi-upload" @click="openUpload()" /></div></div>

        <SectionCard class="asset-lifecycle-table"><DataTable :value="rows" :loading="loading" scrollable paginator :rows="10" data-key="id" table-style="min-width:1400px"><template #empty><div class="asset-empty"><i class="pi pi-inbox" /><strong>沒有符合條件的素材紀錄</strong></div></template><Column field="id" header="Asset ID" frozen style="width:210px;min-width:210px"><template #body="{data}"><button class="asset-link" type="button" @click="openDetail(data)">{{ data.id }}</button></template></Column><Column header="預覽" style="width:80px;min-width:80px"><template #body="{data}"><div class="asset-thumb" :class="data.palette"><i class="pi pi-image" /></div></template></Column><Column header="遊戲" style="width:160px;min-width:160px"><template #body="{data}"><div class="asset-stack"><strong>{{ data.gameName }}</strong><span>{{ data.gameId }}</span></div></template></Column><Column field="type" header="類型" /><Column field="locale" header="語系" /><Column field="bundleId" header="Bundle ID" style="width:180px;min-width:180px" /><Column field="revision" header="素材版本" /><Column header="Checksum" style="width:180px;min-width:180px"><template #body="{data}"><code>{{ data.checksum }}</code></template></Column><Column header="狀態"><template #body="{data}"><StatusTag :value="statusLabels[data.status as AssetStatus]" /></template></Column><Column header="關聯 Version" style="width:180px;min-width:180px"><template #body="{data}">{{ data.relatedVersionIds.join('、') || '尚未綁定' }}</template></Column><Column header="操作" frozen align-frozen="right" style="width:116px;min-width:116px"><template #body="{data}"><div class="row-actions"><Button icon="pi pi-eye" text aria-label="查看素材" @click="openDetail(data)" /><Button icon="pi pi-copy" text aria-label="建立後繼素材" @click="openUpload(data)" /></div></template></Column></DataTable></SectionCard>

        <Dialog v-model:visible="detailVisible" modal dismissable-mask header="素材紀錄詳情" class="entity-dialog asset-detail-dialog"><div v-if="selectedAsset" class="entity-dialog-body"><div class="asset-detail-hero"><div class="asset-preview-panel" :class="selectedAsset.palette"><i class="pi pi-image" /><strong>{{ selectedAsset.type }}</strong><span>{{ selectedAsset.dimensions }}</span></div><div><span>{{ selectedAsset.gameName }} · {{ selectedAsset.locale }}</span><h3>{{ selectedAsset.id }}</h3><p>{{ selectedAsset.bundleId }} · {{ selectedAsset.revision }}</p></div><StatusTag :value="statusLabels[selectedAsset.status]" /></div><section class="dialog-section"><h3>不可變檔案資料</h3><div class="detail-grid dialog-detail-grid"><div><span>Checksum</span><strong>{{ selectedAsset.checksum }}</strong></div><div><span>Storage Ref</span><strong>{{ selectedAsset.storageRef }}</strong></div><div><span>尺寸</span><strong>{{ selectedAsset.dimensions }}</strong></div><div><span>檔案大小</span><strong>{{ selectedAsset.fileSize }}</strong></div><div><span>不可變</span><strong>{{ selectedAsset.immutable ? 'Immutable' : 'Draft metadata' }}</strong></div><div><span>後繼於</span><strong>{{ selectedAsset.supersedesId || '首筆素材' }}</strong></div></div></section><section class="dialog-section"><h3>Version 與稽核</h3><div class="detail-grid dialog-detail-grid"><div><span>關聯 Version</span><strong>{{ selectedAsset.relatedVersionIds.join('、') || '尚未綁定' }}</strong></div><div><span>負責單位</span><strong>{{ selectedAsset.owner }}</strong></div><div><span>更新時間</span><strong>{{ formatTime(selectedAsset.updatedAt) }}</strong></div><div class="detail-field-wide"><span>備註</span><strong>{{ selectedAsset.note }}</strong></div></div></section></div><template #footer><div class="dialog-footer-actions"><Button label="關閉" severity="secondary" outlined @click="detailVisible=false" /><Button label="建立後繼素材" icon="pi pi-copy" @click="selectedAsset && openUpload(selectedAsset)" /></div></template></Dialog>

        <Dialog v-model:visible="uploadVisible" modal header="建立素材草稿" class="entity-dialog asset-upload-dialog"><div class="entity-dialog-body"><div class="asset-upload-note"><i class="pi pi-info-circle" /><div><strong>建立新 Asset Record</strong><span>原型只建立 metadata 與 mock checksum，不執行真實檔案上傳；正式串接後仍必須產生新 storage object。</span></div></div><div class="dialog-form-grid"><div class="field field-span-6"><label>遊戲</label><Select v-model="uploadForm.gameId" :options="uploadGameOptions" option-label="label" option-value="value" fluid @change="uploadForm.relatedVersionId=''" /></div><div class="field field-span-3"><label>素材類型</label><Select v-model="uploadForm.type" :options="typeValues" fluid /></div><div class="field field-span-3"><label>語系</label><Select v-model="uploadForm.locale" :options="localeValues" fluid /></div><div class="field field-span-12"><label>關聯 Version</label><Select v-model="uploadForm.relatedVersionId" :options="versionOptions" option-label="label" option-value="value" placeholder="選擇要綁定的 Version" fluid /></div><div class="field field-span-12"><label>變更備註</label><Textarea v-model="uploadForm.note" rows="3" placeholder="說明新素材用途與差異" fluid /></div><div v-if="uploadForm.supersedesId" class="field field-span-12"><label>後繼素材</label><InputText :model-value="uploadForm.supersedesId" disabled fluid /></div></div></div><template #footer><div class="dialog-footer-actions"><Button label="取消" severity="secondary" outlined @click="uploadVisible=false" /><Button label="建立新素材紀錄" icon="pi pi-plus" :disabled="!uploadForm.gameId||!uploadForm.relatedVersionId||!uploadForm.note.trim()" :loading="actionLoading" @click="createAsset" /></div></template></Dialog>
    </div>
</template>

<style scoped>
.asset-boundary-note{display:flex;gap:12px;align-items:flex-start;padding:14px 16px;border:1px solid color-mix(in srgb,var(--primary) 20%,var(--border));border-radius:var(--radius);background:color-mix(in srgb,var(--primary) 6%,var(--surface-strong))}.asset-boundary-note i{color:var(--primary);margin-top:3px}.asset-boundary-note p{margin:3px 0 0;color:var(--muted);font-size:var(--font-sm);line-height:1.5}.asset-lifecycle-table{overflow:hidden}.asset-lifecycle-table :deep(.p-datatable-wrapper){overflow-x:auto}.asset-link{padding:0;border:0;background:none;color:var(--primary);font:inherit;font-weight:750;text-decoration:underline;text-underline-offset:3px;cursor:pointer}.asset-stack{display:grid;gap:3px}.asset-stack span{color:var(--muted);font-size:var(--font-xs)}.asset-lifecycle-table code{font-size:var(--font-xs)}.asset-empty{display:grid;justify-items:center;gap:7px;padding:36px;color:var(--muted)}.asset-detail-hero{display:grid;grid-template-columns:120px 1fr auto;gap:16px;align-items:start;padding:16px;border-radius:var(--radius);background:var(--surface-muted)}.asset-detail-hero .asset-preview-panel{min-height:100px}.asset-detail-hero>div:nth-child(2)>span,.asset-detail-hero p{margin:0;color:var(--muted);font-size:var(--font-sm)}.asset-detail-hero h3{margin:5px 0;overflow-wrap:anywhere}.asset-upload-note{display:flex;gap:12px;padding:14px;border:1px dashed var(--border);border-radius:var(--radius);background:var(--surface-muted)}.asset-upload-note>div{display:grid;gap:3px}.asset-upload-note span{color:var(--muted);font-size:var(--font-sm);line-height:1.5}.asset-detail-dialog{width:min(920px,calc(100vw - 32px))}.asset-upload-dialog{width:min(720px,calc(100vw - 32px))}@media(max-width:760px){.asset-filter-grid>.field,.asset-filter-keyword,.asset-filter-actions{grid-column:1/-1!important}.asset-filter-actions{flex-direction:column}.asset-filter-actions .p-button{width:100%}.asset-detail-hero{grid-template-columns:1fr}.dialog-form-grid{grid-template-columns:1fr}.dialog-form-grid>.field{grid-column:auto}}
</style>
