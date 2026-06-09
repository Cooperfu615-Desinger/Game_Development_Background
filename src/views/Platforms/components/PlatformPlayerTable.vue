<script setup lang="ts">
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import type { PlatformPlayer } from '@/types/platform'

const props = defineProps<{
    players: PlatformPlayer[]
    total: number
    loading: boolean
    hasAgentSystem: boolean
    search: string
    page: number
}>()

const emit = defineEmits<{
    (e: 'update:search', v: string): void
    (e: 'update:page', v: number): void
}>()

const fmtMoney = (n: number) =>
    `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('zh-TW')

const PAGE_SIZE = 20

const onPage = (e: { page: number }) => {
    emit('update:page', e.page + 1)
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <div class="flex justify-between items-center flex-wrap gap-2">
            <span class="text-sm text-secondary">共 {{ total }} 位玩家</span>
            <InputText
                :model-value="search"
                placeholder="搜尋玩家 ID…"
                class="w-56"
                @update:model-value="emit('update:search', $event ?? '')"
            />
        </div>

        <DataTable
            :value="players"
            :loading="loading"
            data-key="playerId"
            size="small"
            sort-mode="single"
            paginator
            lazy
            :rows="PAGE_SIZE"
            :total-records="total"
            :first="(page - 1) * PAGE_SIZE"
            @page="onPage"
        >
            <Column field="playerId" header="玩家 ID" />

            <Column v-if="hasAgentSystem" header="AgentID">
                <template #body="{ data }">
                    {{ data.agentId ?? '—' }}
                </template>
            </Column>

            <Column field="totalTurnover" header="累計流水" sortable>
                <template #body="{ data }">{{ fmtMoney(data.totalTurnover) }}</template>
            </Column>

            <Column field="periodTurnover" header="本期流水" sortable>
                <template #body="{ data }">{{ fmtMoney(data.periodTurnover) }}</template>
            </Column>

            <Column field="lastActiveAt" header="最後活躍">
                <template #body="{ data }">{{ fmtDate(data.lastActiveAt) }}</template>
            </Column>
        </DataTable>
    </div>
</template>

<style scoped>
.text-secondary {
    color: var(--hig-text-secondary);
}
</style>
