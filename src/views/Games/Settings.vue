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
import type { GameSettingsSnapshot, LifecycleSnapshot, SnapshotStatus } from '@/types/providerGameLifecycle'

const toast = useToast()
const snapshot = ref<LifecycleSnapshot>({ games: [], versions: [], releases: [], environments: [], settingsSnapshots: [], mathSnapshots: [], assets: [], limitPlans: [] })
const loading = ref(true)
const actionLoading = ref(false)
const detailVisible = ref(false)
const selectedId = ref<string | null>(null)
const draftFilters = reactive({ keyword: '', gameId: 'all', status: 'all' })
const appliedFilters = reactive({ keyword: '', gameId: 'all', status: 'all' })

const statusLabels: Record<SnapshotStatus, string> = { draft: '草稿', review: '審核中', approved: '已核准', published: '已發布', retired: '已退役' }
const gameOptions = computed(() => [{ label: '全部遊戲', value: 'all' }, ...snapshot.value.games.map((item) => ({ label: `${item.name} · ${item.id}`, value: item.id }))])
const statusOptions = [{ label: '全部狀態', value: 'all' }, ...Object.entries(statusLabels).map(([value, label]) => ({ value, label }))]
const selectedSettings = computed(() => snapshot.value.settingsSnapshots.find((item) => item.id === selectedId.value) ?? null)
const selectedPlans = computed(() => selectedSettings.value ? snapshot.value.limitPlans.filter((item) => selectedSettings.value!.limitPlanIds.includes(item.id)) : [])

const rows = computed(() => {
    const keyword = appliedFilters.keyword.trim().toLowerCase()
    return snapshot.value.settingsSnapshots.filter((item) => {
        if (appliedFilters.gameId !== 'all' && item.gameId !== appliedFilters.gameId) return false
        if (appliedFilters.status !== 'all' && item.status !== appliedFilters.status) return false
        return !keyword || [item.id, item.gameId, item.gameName, item.revision, item.bettingStructure.id, item.currencyMultipliers.id].some((value) => value.toLowerCase().includes(keyword))
    })
})

const summaryCards = computed(() => [
    { label: '設定快照', value: snapshot.value.settingsSnapshots.length, helper: '已發布快照不可原地修改' },
    { label: '限額方案', value: snapshot.value.limitPlans.length, helper: '以 USDT 為基準定義' },
    { label: '幣別倍率', value: '固定映射', helper: 'USDT：USD：TWD：VND = 1：1：30：2000' },
    { label: '正式異動', value: '建立新 Version', helper: '設定、倍率與限額異動重新驗證' },
])

async function loadSnapshot() {
    loading.value = true
    try { snapshot.value = await api.get<LifecycleSnapshot>('/api/provider/game-lifecycle') }
    finally { loading.value = false }
}

function applyFilters() { Object.assign(appliedFilters, draftFilters) }
function resetFilters() { Object.assign(draftFilters, { keyword: '', gameId: 'all', status: 'all' }); applyFilters() }
function openDetail(row: GameSettingsSnapshot) { selectedId.value = row.id; detailVisible.value = true }
function formatTime(value: string) { return new Intl.DateTimeFormat('zh-TW', { dateStyle: 'medium', timeStyle: 'short', hour12: false }).format(new Date(value)) }
function formatRates(row: GameSettingsSnapshot) { return row.currencyMultipliers.rates.map((item) => `${item.currency} × ${item.multiplier}`).join(' · ') }

async function cloneSettings(row = selectedSettings.value) {
    if (!row) return
    actionLoading.value = true
    try {
        const created = await api.post<GameSettingsSnapshot>(`/api/provider/game-lifecycle/settings/${row.id}/clone`)
        await loadSnapshot()
        selectedId.value = created.id
        detailVisible.value = true
        toast.add({ severity: 'success', summary: '設定草稿已建立', detail: `已由 ${row.id} 建立 ${created.id}；原快照保持不變。`, life: 3400 })
    } catch {
        toast.add({ severity: 'error', summary: '無法建立設定草稿', detail: '請稍後再試。', life: 3000 })
    } finally { actionLoading.value = false }
}

onMounted(loadSnapshot)
</script>

<template>
    <div class="page-stack game-settings-lifecycle-page">
        <SummaryCardGrid :cards="summaryCards" />

        <div class="settings-boundary-note"><i class="pi pi-lock" /><div><strong>設定採版本快照</strong><p>投注結構、固定幣別倍率與下注限額方案會在 Version 成為 Candidate 時一起固定；已發布內容只讀，任何異動都先建立新設定草稿。</p></div></div>

        <FilterCard title="查詢條件" description="查詢遊戲設定快照、投注結構、幣別倍率與限額方案關聯。">
            <div class="settings-lifecycle-filter">
                <div class="field settings-lifecycle-keyword"><label>識別碼／遊戲／結構</label><InputText v-model="draftFilters.keyword" placeholder="Settings ID、Game ID、Bet Structure" fluid @keyup.enter="applyFilters" /></div>
                <div class="field"><label>遊戲</label><Select v-model="draftFilters.gameId" :options="gameOptions" option-label="label" option-value="value" fluid /></div>
                <div class="field"><label>快照狀態</label><Select v-model="draftFilters.status" :options="statusOptions" option-label="label" option-value="value" fluid /></div>
                <div class="settings-lifecycle-actions"><Button label="查詢" icon="pi pi-search" @click="applyFilters" /><Button label="重置" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" /></div>
            </div>
        </FilterCard>

        <div class="agent-command-bar"><div><span class="table-count"><Badge :value="rows.length" severity="info" /> 筆設定快照</span><p>草稿可以調整；進入 Candidate 後與 Version 一起固定並重新驗證。</p></div></div>

        <SectionCard class="settings-lifecycle-table">
            <DataTable :value="rows" :loading="loading" scrollable paginator :rows="10" data-key="id" table-style="min-width: 1280px">
                <template #empty><div class="settings-empty"><i class="pi pi-inbox" /><strong>沒有符合條件的設定快照</strong></div></template>
                <Column field="id" header="Settings ID" frozen style="width:190px;min-width:190px"><template #body="{ data }"><button class="settings-link" type="button" @click="openDetail(data)">{{ data.id }}</button></template></Column>
                <Column field="gameName" header="遊戲" style="width:160px;min-width:160px"><template #body="{ data }"><div class="settings-stack"><strong>{{ data.gameName }}</strong><span>{{ data.gameId }}</span></div></template></Column>
                <Column field="revision" header="修訂" style="width:100px;min-width:100px" />
                <Column header="投注結構" style="width:220px;min-width:220px"><template #body="{ data }"><div class="settings-stack"><strong>{{ data.bettingStructure.label }}</strong><span>{{ data.bettingStructure.id }}</span></div></template></Column>
                <Column header="幣別倍率快照" style="width:250px;min-width:250px"><template #body="{ data }"><div class="settings-stack"><strong>{{ data.currencyMultipliers.id }}</strong><span>{{ formatRates(data) }}</span></div></template></Column>
                <Column header="限額方案" style="width:210px;min-width:210px"><template #body="{ data }"><div class="settings-tags"><Tag v-for="item in data.limitPlanIds" :key="item" :value="item" severity="secondary" /></div></template></Column>
                <Column header="狀態" style="width:110px;min-width:110px"><template #body="{ data }"><StatusTag :value="statusLabels[data.status as SnapshotStatus]" /></template></Column>
                <Column header="不可變" style="width:100px;min-width:100px"><template #body="{ data }"><StatusTag :value="data.immutable ? '已固定' : '可編輯'" /></template></Column>
                <Column header="關聯 Version" style="width:190px;min-width:190px"><template #body="{ data }"><span>{{ data.relatedVersionIds.join('、') || '尚未綁定' }}</span></template></Column>
                <Column header="操作" frozen align-frozen="right" style="width:96px;min-width:96px"><template #body="{ data }"><Button v-tooltip.top="'查看設定快照'" icon="pi pi-eye" text aria-label="查看設定快照" @click="openDetail(data)" /></template></Column>
            </DataTable>
        </SectionCard>

        <SectionCard class="settings-lifecycle-table">
            <template #header><div class="dialog-title-block"><h2>下注限額方案</h2><p>所有方案先以 USDT 定義基準，再套用設定快照固定的幣別倍率；不是依即時市場匯率換算。</p></div></template>
            <DataTable :value="snapshot.limitPlans" :loading="loading" scrollable data-key="id" table-style="min-width:900px">
                <Column field="id" header="方案 ID" />
                <Column field="name" header="名稱" />
                <Column header="投注範圍（USDT）"><template #body="{ data }">{{ data.minBet }} ～ {{ data.maxBet }}</template></Column>
                <Column header="派彩上限（USDT）"><template #body="{ data }">{{ data.maxPayout.toLocaleString() }}</template></Column>
                <Column header="支援幣別"><template #body="{ data }">{{ data.currencies.join('、') }}</template></Column>
                <Column header="狀態"><template #body="{ data }"><StatusTag :value="statusLabels[data.status as SnapshotStatus]" /></template></Column>
            </DataTable>
        </SectionCard>

        <Dialog v-model:visible="detailVisible" modal dismissable-mask header="設定快照詳情" class="entity-dialog settings-detail-dialog">
            <div v-if="selectedSettings" class="entity-dialog-body">
                <div class="settings-detail-hero"><div><span>{{ selectedSettings.gameName }} · {{ selectedSettings.gameId }}</span><h3>{{ selectedSettings.id }}</h3><p>{{ selectedSettings.revision }} · {{ formatTime(selectedSettings.updatedAt) }}</p></div><StatusTag :value="statusLabels[selectedSettings.status]" /></div>
                <section class="dialog-section"><h3>遊戲投注結構</h3><div class="detail-grid dialog-detail-grid"><div><span>Structure ID</span><strong>{{ selectedSettings.bettingStructure.id }}</strong></div><div><span>結構</span><strong>{{ selectedSettings.bettingStructure.label }}</strong></div><div class="detail-field-wide"><span>公式</span><strong>{{ selectedSettings.bettingStructure.formula }}</strong></div><div><span>Bet Level</span><strong>{{ selectedSettings.bettingStructure.betLevels.join('、') }}</strong></div><div><span>Coin Value</span><strong>{{ selectedSettings.bettingStructure.coinValues.join('、') }}</strong></div></div></section>
                <section class="dialog-section"><h3>投注幣別倍率</h3><div class="settings-rate-grid"><div v-for="item in selectedSettings.currencyMultipliers.rates" :key="item.currency"><span>{{ item.currency }}</span><strong>× {{ item.multiplier }}</strong></div></div><p class="settings-detail-note">固定倍率屬版本快照，不使用即時匯率回算歷史 Game Round。</p></section>
                <section class="dialog-section"><h3>限額與相容性</h3><div class="settings-plan-list"><div v-for="item in selectedPlans" :key="item.id"><strong>{{ item.name }}</strong><span>{{ item.id }} · {{ item.minBet }}–{{ item.maxBet }} USDT · 派彩上限 {{ item.maxPayout.toLocaleString() }}</span></div></div><div class="detail-grid dialog-detail-grid"><div><span>平台</span><strong>{{ selectedSettings.platforms.join('、') }}</strong></div><div><span>語系</span><strong>{{ selectedSettings.languages.join('、') }}</strong></div><div class="detail-field-wide"><span>維護政策</span><strong>{{ selectedSettings.maintenancePolicy }}</strong></div></div></section>
            </div>
            <template #footer><div class="dialog-footer-actions"><Button label="關閉" severity="secondary" outlined @click="detailVisible=false" /><Button label="複製為新設定草稿" icon="pi pi-copy" :loading="actionLoading" @click="cloneSettings()" /></div></template>
        </Dialog>
    </div>
</template>

<style scoped>
.settings-boundary-note{display:flex;gap:12px;align-items:flex-start;padding:14px 16px;border:1px solid color-mix(in srgb,var(--primary) 20%,var(--border));border-radius:var(--radius);background:color-mix(in srgb,var(--primary) 6%,var(--surface-strong))}.settings-boundary-note i{color:var(--primary);margin-top:3px}.settings-boundary-note p{margin:3px 0 0;color:var(--muted);font-size:var(--font-sm);line-height:1.5}.settings-lifecycle-filter{display:grid;grid-template-columns:minmax(280px,2fr) repeat(2,minmax(160px,1fr)) auto;gap:14px 16px;align-items:end}.settings-lifecycle-actions{display:flex;gap:8px}.settings-lifecycle-table{overflow:hidden}.settings-lifecycle-table :deep(.p-datatable-wrapper){overflow-x:auto}.settings-link{padding:0;border:0;background:none;color:var(--primary);font:inherit;font-weight:750;text-decoration:underline;text-underline-offset:3px;cursor:pointer}.settings-stack{display:grid;gap:3px}.settings-stack span{max-width:240px;overflow:hidden;color:var(--muted);font-size:var(--font-xs);text-overflow:ellipsis;white-space:nowrap}.settings-tags{display:flex;gap:4px;flex-wrap:wrap}.settings-empty{display:grid;justify-items:center;gap:7px;padding:36px;color:var(--muted)}.settings-detail-hero{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;padding:16px;border-radius:var(--radius);background:var(--surface-muted)}.settings-detail-hero span,.settings-detail-hero p{margin:0;color:var(--muted);font-size:var(--font-sm)}.settings-detail-hero h3{margin:4px 0}.settings-rate-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.settings-rate-grid>div{display:grid;gap:4px;padding:12px;border:1px solid var(--border);border-radius:10px;background:var(--surface-strong)}.settings-rate-grid span,.settings-detail-note,.settings-plan-list span{color:var(--muted);font-size:var(--font-sm)}.settings-detail-note{margin:0}.settings-plan-list{display:grid;gap:8px}.settings-plan-list>div{display:grid;gap:3px;padding:12px;border:1px solid var(--border);border-radius:10px}.settings-detail-dialog{width:min(920px,calc(100vw - 32px))}@media(max-width:820px){.settings-lifecycle-filter{grid-template-columns:1fr}.settings-lifecycle-actions{flex-direction:column}.settings-lifecycle-actions .p-button{width:100%}.settings-rate-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:520px){.settings-rate-grid{grid-template-columns:1fr}.settings-detail-hero{flex-direction:column}}
</style>
