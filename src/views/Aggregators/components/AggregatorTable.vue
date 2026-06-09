<script setup lang="ts">
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import ToggleSwitch from 'primevue/toggleswitch'
import Button from 'primevue/button'
import { useRouter } from 'vue-router'
import type { Aggregator, AggregatorFilter } from '@/types/aggregator'

const props = defineProps<{
    aggregators: Aggregator[]
    total: number
    loading: boolean
    filters: AggregatorFilter
}>()

const emit = defineEmits<{
    (e: 'update:filters', v: AggregatorFilter): void
    (e: 'toggle-status', id: string, status: Aggregator['status']): void
}>()

const router = useRouter()

type Severity = 'success' | 'danger' | 'warn' | 'info' | 'secondary'
const connectionMeta = (s: Aggregator['connectionStatus']): { severity: Severity; label: string } => {
    if (s === 'connected') return { severity: 'success', label: '已連線' }
    if (s === 'disconnected') return { severity: 'danger', label: '離線' }
    return { severity: 'warn', label: '待確認' }
}

const onPage = (e: { page: number; rows: number }) => {
    emit('update:filters', { ...props.filters, page: e.page + 1 })
}

const onSwitchChange = (row: Aggregator) => {
    emit('toggle-status', row.id, row.status)
}
</script>

<template>
    <DataTable
        :value="aggregators"
        :loading="loading"
        :rows="filters.pageSize"
        :total-records="total"
        :first="(filters.page - 1) * filters.pageSize"
        paginator
        lazy
        data-key="id"
        @page="onPage"
    >
        <Column header="聚合商名稱" style="min-width: 11rem">
            <template #body="{ data }">
                <div>
                    <p class="font-medium">{{ data.name }}</p>
                    <p class="text-xs text-secondary mt-0.5">{{ data.code }}</p>
                </div>
            </template>
        </Column>

        <Column header="串接狀態" style="width: 110px">
            <template #body="{ data }">
                <Tag
                    :severity="connectionMeta(data.connectionStatus).severity"
                    :value="connectionMeta(data.connectionStatus).label"
                    rounded
                />
            </template>
        </Column>

        <Column header="啟用狀態" style="width: 100px">
            <template #body="{ data }">
                <ToggleSwitch
                    :model-value="data.status === 'active'"
                    @update:model-value="onSwitchChange(data)"
                />
            </template>
        </Column>

        <Column header="已開放遊戲" style="width: 120px">
            <template #body="{ data }">
                <span class="font-mono text-sm">{{ data.gameCount }} / {{ data.totalGames }}</span>
            </template>
        </Column>

        <Column header="API Endpoint" style="min-width: 14rem">
            <template #body="{ data }">
                <span
                    class="text-xs font-mono text-secondary truncate block max-w-full"
                    :title="data.apiEndpoint"
                >
                    {{ data.apiEndpoint }}
                </span>
            </template>
        </Column>

        <Column header="建立時間" style="width: 120px">
            <template #body="{ data }">
                <span class="text-xs">{{ data.createdAt.slice(0, 10) }}</span>
            </template>
        </Column>

        <Column header="操作" style="width: 80px" :pt="{ headerCell: { class: 'text-right' } }">
            <template #body="{ data }">
                <Button
                    label="詳情"
                    text
                    size="small"
                    @click="router.push(`/aggregators/${data.id}`)"
                />
            </template>
        </Column>
    </DataTable>
</template>

<style scoped>
.text-secondary {
    color: var(--hig-text-secondary);
}
</style>
