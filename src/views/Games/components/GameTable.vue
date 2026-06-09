<script setup lang="ts">
import { ref, watch } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import ToggleSwitch from 'primevue/toggleswitch'
import Button from 'primevue/button'
import type { Game, GameFilter } from '@/types/game'

const props = defineProps<{
    games: Game[]
    total: number
    loading: boolean
    filters: GameFilter
}>()

const emit = defineEmits<{
    (e: 'update:filters', v: GameFilter): void
    (e: 'view', game: Game): void
    (e: 'edit', game: Game): void
    (e: 'toggle-status', game: Game): void
    (e: 'update:selected', ids: string[]): void
}>()

const categoryLabel: Record<Game['category'], string> = {
    slot: '老虎機',
    table: '桌遊',
    live: '真人',
    fishing: '捕魚',
}

// ─── Selection ─────────────────────────────────────────
const selectedRows = ref<Game[]>([])
watch(selectedRows, (rows) => {
    emit('update:selected', rows.map((r) => r.id))
})
// Clear selection when game list changes (page change, filter change)
watch(
    () => props.games,
    () => {
        selectedRows.value = []
    }
)

const onPage = (e: { page: number }) => {
    emit('update:filters', { ...props.filters, page: e.page + 1 })
}
</script>

<template>
    <DataTable
        v-model:selection="selectedRows"
        :value="games"
        :loading="loading"
        data-key="id"
        sort-mode="single"
        paginator
        lazy
        :rows="filters.pageSize"
        :total-records="total"
        :first="(filters.page - 1) * filters.pageSize"
        @page="onPage"
    >
        <Column selection-mode="multiple" header-style="width: 3rem" />

        <Column field="name" header="遊戲名稱" sortable :pt="{ headerCell: { style: 'min-width: 10rem' } }" />

        <Column header="類別" style="width: 90px">
            <template #body="{ data }">
                <Tag severity="secondary" :value="categoryLabel[data.category]" />
            </template>
        </Column>

        <Column field="rtp" header="RTP" sortable style="width: 100px">
            <template #body="{ data }">{{ data.rtp.toFixed(1) }}%</template>
        </Column>

        <Column field="activeUsers" header="活躍玩家" sortable style="width: 120px">
            <template #body="{ data }">{{ data.activeUsers.toLocaleString() }}</template>
        </Column>

        <Column field="version" header="版本" style="width: 90px" />

        <Column field="status" header="狀態" sortable style="width: 90px">
            <template #body="{ data }">
                <ToggleSwitch
                    :model-value="data.status === 'active'"
                    @update:model-value="emit('toggle-status', data)"
                />
            </template>
        </Column>

        <Column header="操作" style="width: 150px">
            <template #body="{ data }">
                <div class="flex gap-1">
                    <Button label="詳情" size="small" text @click="emit('view', data)" />
                    <Button label="編輯" size="small" @click="emit('edit', data)" />
                </div>
            </template>
        </Column>
    </DataTable>
</template>
