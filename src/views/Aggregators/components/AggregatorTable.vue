<script setup lang="ts">
import { computed, h } from 'vue'
import { NDataTable, NTag, NSwitch, NButton, NSpace } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
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

const connectionTag = (s: Aggregator['connectionStatus']) => {
    if (s === 'connected')    return { type: 'success' as const, label: '已連線' }
    if (s === 'disconnected') return { type: 'error'   as const, label: '離線'   }
    return                           { type: 'warning' as const, label: '待確認' }
}

const columns = computed<DataTableColumns<Aggregator>>(() => [
    {
        title: '聚合商名稱', key: 'name', width: 160,
        render: row => h('div', [
            h('p', { class: 'font-medium' }, row.name),
            h('p', { class: 'text-xs text-gray-500 mt-0.5' }, row.code),
        ])
    },
    {
        title: '串接狀態', key: 'connectionStatus', width: 110,
        render: row => {
            const t = connectionTag(row.connectionStatus)
            return h(NTag, { type: t.type, size: 'small', round: true }, { default: () => t.label })
        }
    },
    {
        title: '啟用狀態', key: 'status', width: 100,
        render: row => h(NSwitch, {
            value: row.status === 'active',
            size: 'small',
            onUpdateValue: () => emit('toggle-status', row.id, row.status),
        })
    },
    {
        title: '已開放遊戲', key: 'gameCount', width: 120,
        render: row => h('span', `${row.gameCount} / ${row.totalGames}`)
    },
    {
        title: 'API Endpoint', key: 'apiEndpoint', ellipsis: { tooltip: true },
        render: row => h('span', { class: 'text-xs text-gray-400 font-mono' }, row.apiEndpoint)
    },
    {
        title: '建立時間', key: 'createdAt', width: 120,
        render: row => h('span', { class: 'text-xs' }, row.createdAt.slice(0, 10))
    },
    {
        title: '操作', key: 'action', width: 80, fixed: 'right',
        render: row => h(NSpace, {}, {
            default: () => [
                h(NButton, {
                    size: 'small', text: true, type: 'primary',
                    onClick: () => router.push(`/aggregators/${row.id}`)
                }, { default: () => '詳情' })
            ]
        })
    },
])

const pagination = computed(() => ({
    page: props.filters.page,
    pageSize: props.filters.pageSize,
    itemCount: props.total,
    showSizePicker: false,
    onChange: (page: number) => emit('update:filters', { ...props.filters, page }),
}))
</script>

<template>
    <n-data-table
        :columns="columns"
        :data="aggregators"
        :loading="loading"
        :pagination="pagination"
        :row-key="(row: Aggregator) => row.id"
        remote
        scroll-x="800"
    />
</template>
