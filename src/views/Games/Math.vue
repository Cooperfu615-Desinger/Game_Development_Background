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
import Tag from 'primevue/tag'
import FilterCard from '@/components/ui/FilterCard.vue'
import SectionCard from '@/components/ui/SectionCard.vue'
import StatusTag from '@/components/ui/StatusTag.vue'
import SummaryCardGrid from '@/components/ui/SummaryCardGrid.vue'
import { api } from '@/services/apiClient'
import type { GameMathSnapshot, LifecycleSnapshot, SnapshotStatus } from '@/types/providerGameLifecycle'

const toast = useToast()
const snapshot = ref<LifecycleSnapshot>({ games: [], versions: [], releases: [], environments: [], settingsSnapshots: [], mathSnapshots: [], assets: [], limitPlans: [] })
const loading = ref(true)
const actionLoading = ref(false)
const detailVisible = ref(false)
const selectedId = ref<string | null>(null)
const draftFilters = reactive({ keyword: '', gameId: 'all', status: 'all', volatility: 'all' })
const appliedFilters = reactive({ keyword: '', gameId: 'all', status: 'all', volatility: 'all' })

const statusLabels: Record<SnapshotStatus, string> = { draft: '草稿', review: '加強覆核中', approved: '已核准', published: '已發布', retired: '已退役' }
const gameOptions = computed(() => [{ label: '全部遊戲', value: 'all' }, ...snapshot.value.games.map((item) => ({ label: `${item.name} · ${item.id}`, value: item.id }))])
const statusOptions = [{ label: '全部狀態', value: 'all' }, ...Object.entries(statusLabels).map(([value, label]) => ({ value, label }))]
const volatilityOptions = [{ label: '全部波動率', value: 'all' }, ...['低', '中', '中高', '高'].map((value) => ({ label: value, value }))]
const selectedMath = computed(() => snapshot.value.mathSnapshots.find((item) => item.id === selectedId.value) ?? null)
const relatedVersions = computed(() => selectedMath.value ? snapshot.value.versions.filter((item) => selectedMath.value!.relatedVersionIds.includes(item.id)) : [])

const rows = computed(() => {
    const keyword = appliedFilters.keyword.trim().toLowerCase()
    return snapshot.value.mathSnapshots.filter((item) => {
        if (appliedFilters.gameId !== 'all' && item.gameId !== appliedFilters.gameId) return false
        if (appliedFilters.status !== 'all' && item.status !== appliedFilters.status) return false
        if (appliedFilters.volatility !== 'all' && item.volatility !== appliedFilters.volatility) return false
        return !keyword || [item.id, item.gameId, item.gameName, item.revision, item.paytableId, item.reviewNo].some((value) => String(value ?? '').toLowerCase().includes(keyword))
    })
})

const summaryCards = computed(() => {
    const items = snapshot.value.mathSnapshots
    return [
        { label: '數值快照', value: items.length, helper: 'RTP、賠付表與波動率版本' },
        { label: '加強覆核中', value: items.filter((item) => item.status === 'review').length, helper: '數值異動固定走 guarded lane' },
        { label: '已發布不可變', value: items.filter((item) => item.status === 'published' && item.immutable).length, helper: '歷史 Game Round 永久引用' },
        { label: '模擬樣本', value: items.reduce((sum, item) => sum + item.sampleRounds, 0).toLocaleString(), helper: '各數值快照樣本總計' },
    ]
})

const trend = computed(() => snapshot.value.mathSnapshots.filter((item) => item.sampleRounds > 0).slice(0, 6).map((item) => ({ label: item.gameName, value: item.actualRtp })))

async function loadSnapshot() { loading.value = true; try { snapshot.value = await api.get<LifecycleSnapshot>('/api/provider/game-lifecycle') } finally { loading.value = false } }
function applyFilters() { Object.assign(appliedFilters, draftFilters) }
function resetFilters() { Object.assign(draftFilters, { keyword: '', gameId: 'all', status: 'all', volatility: 'all' }); applyFilters() }
function openDetail(row: GameMathSnapshot) { selectedId.value = row.id; detailVisible.value = true }
function formatTime(value: string) { return new Intl.DateTimeFormat('zh-TW', { dateStyle: 'medium', timeStyle: 'short', hour12: false }).format(new Date(value)) }
function deviationLabel(value: number) { return `${value > 0 ? '+' : ''}${value.toFixed(2)}%` }
function deviationSeverity(value: number) { return Math.abs(value) >= 0.5 ? 'danger' : Math.abs(value) >= 0.2 ? 'warn' : 'success' }

async function cloneMath(row = selectedMath.value) {
    if (!row) return
    actionLoading.value = true
    try {
        const created = await api.post<GameMathSnapshot>(`/api/provider/game-lifecycle/math/${row.id}/clone`)
        await loadSnapshot(); selectedId.value = created.id; detailVisible.value = true
        toast.add({ severity: 'success', summary: '數值草稿已建立', detail: `由 ${row.id} 複製；原快照與歷史 Game Round 保持不變。`, life: 3400 })
    } catch { toast.add({ severity: 'error', summary: '無法建立數值草稿', detail: '請稍後再試。', life: 3000 }) }
    finally { actionLoading.value = false }
}

async function submitMath() {
    if (!selectedMath.value) return
    actionLoading.value = true
    try {
        await api.patch(`/api/provider/game-lifecycle/math/${selectedMath.value.id}/submit`)
        await loadSnapshot()
        toast.add({ severity: 'success', summary: '已送加強覆核', detail: '數值異動固定判定為高風險；通過後才能綁定候選 Version。', life: 3600 })
    } catch { toast.add({ severity: 'error', summary: '送審失敗', detail: '只有草稿狀態可以送審。', life: 3000 }) }
    finally { actionLoading.value = false }
}

onMounted(loadSnapshot)
</script>

<template>
    <div class="page-stack game-math-page lifecycle-math-page">
        <SummaryCardGrid :cards="summaryCards" />

        <section class="math-monitor-grid">
            <SectionCard><template #header><div class="dialog-title-block"><h2>RTP 快照比較</h2><p>顯示各數值版本的 mock 實際 RTP；正式監控仍依 Production Game Round。</p></div></template><div class="rtp-trend"><div v-for="point in trend" :key="point.label" class="rtp-trend-bar"><span :style="{height:`${Math.max(18,point.value-80)*4}px`}" /><small>{{ point.label }}</small><strong>{{ point.value.toFixed(2) }}%</strong></div></div></SectionCard>
            <SectionCard><template #header><div class="dialog-title-block"><h2>高風險邊界</h2><p>RTP、賠付表、投注計算、幣別倍率或限額異動，都需要新 Artifact 與第二人覆核。</p></div></template><div class="math-risk-panel"><Tag value="GUARDED LANE" severity="warn" /><strong>不直接套用 Production</strong><p>先建立數值草稿 → 模擬 → 覆核 → 綁定 Candidate Version → Test／DEMO → Production。</p></div></SectionCard>
        </section>

        <FilterCard title="查詢條件" description="查詢數值快照、RTP、賠付表、波動率與關聯 Version。"><div class="math-filter-grid"><div class="field math-filter-keyword"><label>識別碼／遊戲／賠付表</label><InputText v-model="draftFilters.keyword" placeholder="Math ID、Game ID、Paytable ID" fluid @keyup.enter="applyFilters" /></div><div class="field"><label>遊戲</label><Select v-model="draftFilters.gameId" :options="gameOptions" option-label="label" option-value="value" fluid /></div><div class="field"><label>狀態</label><Select v-model="draftFilters.status" :options="statusOptions" option-label="label" option-value="value" fluid /></div><div class="field"><label>波動率</label><Select v-model="draftFilters.volatility" :options="volatilityOptions" option-label="label" option-value="value" fluid /></div><div class="math-filter-actions"><Button label="查詢" icon="pi pi-search" @click="applyFilters" /><Button label="重置" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" /></div></div></FilterCard>

        <div class="agent-command-bar"><div><span class="table-count"><Badge :value="rows.length" severity="info" /> 筆數值快照</span><p>已發布快照不可修改；「複製新版本」只建立草稿，不改變 Active Release。</p></div></div>

        <SectionCard class="math-lifecycle-table"><DataTable :value="rows" :loading="loading" scrollable paginator :rows="10" data-key="id" table-style="min-width:1320px"><template #empty><div class="math-empty"><i class="pi pi-inbox" /><strong>沒有符合條件的數值快照</strong></div></template><Column field="id" header="Math ID" frozen style="width:180px;min-width:180px"><template #body="{data}"><button class="math-link" type="button" @click="openDetail(data)">{{ data.id }}</button></template></Column><Column header="遊戲" style="width:160px;min-width:160px"><template #body="{data}"><div class="math-stack"><strong>{{ data.gameName }}</strong><span>{{ data.gameId }}</span></div></template></Column><Column field="revision" header="數值版本" /><Column field="paytableId" header="Paytable ID" /><Column header="理論 RTP" body-class="agent-table-cell-right"><template #body="{data}">{{ data.theoreticalRtp.toFixed(2) }}%</template></Column><Column header="實際 RTP" body-class="agent-table-cell-right"><template #body="{data}">{{ data.sampleRounds ? `${data.actualRtp.toFixed(2)}%` : '無資料' }}</template></Column><Column header="偏離"><template #body="{data}"><Tag v-if="data.sampleRounds" :value="deviationLabel(data.deviation)" :severity="deviationSeverity(data.deviation)" /><span v-else>—</span></template></Column><Column field="volatility" header="波動率" /><Column header="狀態"><template #body="{data}"><StatusTag :value="statusLabels[data.status as SnapshotStatus]" /></template></Column><Column header="樣本 Round" body-class="agent-table-cell-right"><template #body="{data}">{{ data.sampleRounds.toLocaleString() }}</template></Column><Column header="關聯 Version" style="width:190px;min-width:190px"><template #body="{data}">{{ data.relatedVersionIds.join('、') || '尚未綁定' }}</template></Column><Column header="操作" frozen align-frozen="right" style="width:90px;min-width:90px"><template #body="{data}"><Button icon="pi pi-eye" text aria-label="查看數值快照" @click="openDetail(data)" /></template></Column></DataTable></SectionCard>

        <Dialog v-model:visible="detailVisible" modal dismissable-mask header="數值快照詳情" class="entity-dialog math-detail-dialog"><div v-if="selectedMath" class="entity-dialog-body"><div class="math-detail-hero"><div><span>{{ selectedMath.gameName }} · {{ selectedMath.gameId }}</span><h3>{{ selectedMath.id }}</h3><p>{{ selectedMath.revision }} · {{ formatTime(selectedMath.updatedAt) }}</p></div><StatusTag :value="statusLabels[selectedMath.status]" /></div><section class="dialog-section"><h3>數值與模擬</h3><div class="detail-grid dialog-detail-grid"><div><span>理論 RTP</span><strong>{{ selectedMath.theoreticalRtp.toFixed(2) }}%</strong></div><div><span>實際 RTP</span><strong>{{ selectedMath.sampleRounds ? `${selectedMath.actualRtp.toFixed(2)}%` : '無資料' }}</strong></div><div><span>偏離</span><strong>{{ selectedMath.sampleRounds ? deviationLabel(selectedMath.deviation) : '—' }}</strong></div><div><span>波動率</span><strong>{{ selectedMath.volatility }}</strong></div><div><span>Paytable ID</span><strong>{{ selectedMath.paytableId }}</strong></div><div><span>模擬樣本</span><strong>{{ selectedMath.sampleRounds.toLocaleString() }}</strong></div></div></section><section class="dialog-section"><h3>覆核與 Version 關聯</h3><div class="detail-grid dialog-detail-grid"><div><span>風險通道</span><strong>Guarded Lane</strong></div><div><span>Review ID</span><strong>{{ selectedMath.reviewNo || '尚未送審' }}</strong></div><div><span>覆核人</span><strong>{{ selectedMath.reviewer || '尚未核准' }}</strong></div><div><span>不可變</span><strong>{{ selectedMath.immutable ? '已固定' : '草稿可編輯' }}</strong></div></div><div class="math-related-list"><div v-for="item in relatedVersions" :key="item.id"><strong>{{ item.semver }}</strong><span>{{ item.id }} · {{ item.status }}</span></div><p v-if="!relatedVersions.length">尚未綁定 Candidate Version。</p></div><p class="math-note">{{ selectedMath.note }}</p></section></div><template #footer><div class="dialog-footer-actions math-dialog-actions"><Button label="關閉" severity="secondary" outlined @click="detailVisible=false" /><Button label="複製新數值草稿" icon="pi pi-copy" severity="secondary" outlined :loading="actionLoading" @click="cloneMath()" /><Button v-if="selectedMath?.status==='draft'" label="送加強覆核" icon="pi pi-send" :loading="actionLoading" @click="submitMath" /></div></template></Dialog>
    </div>
</template>

<style scoped>
.math-risk-panel{display:grid;gap:8px;align-content:start}.math-risk-panel strong{font-size:1.1rem}.math-risk-panel p{margin:0;color:var(--muted);font-size:var(--font-sm);line-height:1.55}.math-lifecycle-table{overflow:hidden}.math-lifecycle-table :deep(.p-datatable-wrapper){overflow-x:auto}.math-link{padding:0;border:0;background:none;color:var(--primary);font:inherit;font-weight:750;text-decoration:underline;text-underline-offset:3px;cursor:pointer}.math-stack{display:grid;gap:3px}.math-stack span{color:var(--muted);font-size:var(--font-xs)}.math-empty{display:grid;justify-items:center;gap:7px;padding:36px;color:var(--muted)}.math-detail-hero{display:flex;justify-content:space-between;gap:16px;padding:16px;border-radius:var(--radius);background:var(--surface-muted)}.math-detail-hero span,.math-detail-hero p{margin:0;color:var(--muted);font-size:var(--font-sm)}.math-detail-hero h3{margin:4px 0}.math-related-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.math-related-list>div{display:grid;gap:3px;padding:12px;border:1px solid var(--border);border-radius:10px}.math-related-list span,.math-related-list p,.math-note{color:var(--muted);font-size:var(--font-sm)}.math-note{margin:0}.math-detail-dialog{width:min(900px,calc(100vw - 32px))}.math-dialog-actions{flex-wrap:wrap}@media(max-width:760px){.math-filter-grid>.field,.math-filter-keyword,.math-filter-actions{grid-column:1/-1!important}.math-filter-actions{flex-direction:column}.math-filter-actions .p-button{width:100%}.math-detail-hero{flex-direction:column}.math-related-list{grid-template-columns:1fr}.math-dialog-actions{display:grid;width:100%}.math-dialog-actions :deep(.p-button){width:100%}}
</style>
