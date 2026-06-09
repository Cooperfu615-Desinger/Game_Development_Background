<script setup lang="ts">
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Skeleton from 'primevue/skeleton'
import type { TopGame } from '@/types/dashboard'

defineProps<{
    games: TopGame[]
    loading: boolean
}>()

// 對應 PrimeVue Tag severity（rank 1=warn / 2=info / 3+=secondary）
const rankSeverity = (rank: number): 'warn' | 'info' | 'secondary' => {
    if (rank === 1) return 'warn'
    if (rank === 2) return 'info'
    return 'secondary'
}
</script>

<template>
    <section class="hig-card games-card">
        <header class="hig-card-header">
            <h3 class="hig-card-title">熱門遊戲 TOP 5</h3>
        </header>

        <!-- Loading state -->
        <div v-if="loading" class="hig-card-body">
            <div class="flex flex-col gap-2">
                <Skeleton v-for="i in 5" :key="i" height="2.5rem" />
            </div>
        </div>

        <!-- Data table -->
        <DataTable
            v-else
            :value="games"
            size="small"
            sort-mode="single"
            :pt="{ root: { class: 'border-0' } }"
        >
            <Column header="排名" style="width: 70px">
                <template #body="{ data }">
                    <Tag :severity="rankSeverity(data.rank)" :value="`#${data.rank}`" />
                </template>
            </Column>
            <Column field="name" header="遊戲名稱" :pt="{ headerCell: { style: 'min-width: 6rem' } }" />
            <Column field="activePlayers" header="活躍玩家" sortable>
                <template #body="{ data }">{{ data.activePlayers.toLocaleString() }}</template>
            </Column>
            <Column field="revenueShare" header="營收佔比" sortable>
                <template #body="{ data }">{{ data.revenueShare.toFixed(1) }}%</template>
            </Column>
        </DataTable>
    </section>
</template>

<style scoped>
.games-card {
    height: 360px;
    display: flex;
    flex-direction: column;
}
.games-card :deep(.p-datatable-table-container) {
    overflow-y: auto;
    max-height: 290px;
}
</style>
