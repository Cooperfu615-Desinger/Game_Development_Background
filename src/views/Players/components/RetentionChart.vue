<script setup lang="ts">
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Skeleton from 'primevue/skeleton'
import type { RetentionData } from '@/types/player'

defineProps<{
    data: RetentionData[]
    loading: boolean
}>()

type Severity = 'success' | 'warn' | 'danger'
const retentionSeverity = (v: number): Severity =>
    v >= 40 ? 'success' : v >= 20 ? 'warn' : 'danger'
</script>

<template>
    <section class="hig-card retention-card">
        <header class="hig-card-header">
            <h3 class="hig-card-title">留存率報表</h3>
        </header>

        <div v-if="loading" class="hig-card-body">
            <div class="flex flex-col gap-2">
                <Skeleton v-for="i in 5" :key="i" height="2rem" />
            </div>
        </div>

        <DataTable
            v-else
            :value="data"
            size="small"
            sort-mode="single"
            :pt="{ root: { class: 'border-0' } }"
        >
            <Column field="label" header="遊戲" />
            <Column field="d1" header="D1 留存" sortable>
                <template #body="{ data }">
                    <Tag :severity="retentionSeverity(data.d1)" :value="`${data.d1.toFixed(1)}%`" />
                </template>
            </Column>
            <Column field="d7" header="D7 留存" sortable>
                <template #body="{ data }">
                    <Tag :severity="retentionSeverity(data.d7)" :value="`${data.d7.toFixed(1)}%`" />
                </template>
            </Column>
            <Column field="d30" header="D30 留存" sortable>
                <template #body="{ data }">
                    <Tag :severity="retentionSeverity(data.d30)" :value="`${data.d30.toFixed(1)}%`" />
                </template>
            </Column>
        </DataTable>
    </section>
</template>

<style scoped>
.retention-card {
    height: 360px;
    display: flex;
    flex-direction: column;
}
.retention-card :deep(.p-datatable-table-container) {
    overflow-y: auto;
    max-height: 290px;
}
</style>
