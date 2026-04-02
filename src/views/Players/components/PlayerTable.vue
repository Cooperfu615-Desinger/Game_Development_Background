<script setup lang="ts">
import { computed, h } from 'vue'
import { NDataTable, NTag, NInput, NSelect, NButton } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import type { Player, PlayerFilter } from '@/types/player'

const props = defineProps<{
    players: Player[]
    total: number
    loading: boolean
    filters: PlayerFilter
}>()

const emit = defineEmits<{
    (e: 'update:filters', v: PlayerFilter): void
}>()

const COUNTRY_OPTIONS = [
    { label: '全部地區', value: undefined },
    ...['TW','JP','KR','TH','VN','PH','MY','SG','HK','ID'].map(c => ({ label: c, value: c }))
]

const STATUS_OPTIONS = [
    { label: '全部狀態', value: undefined },
    { label: '活躍', value: 'active' },
    { label: '非活躍', value: 'inactive' },
    { label: '封禁', value: 'banned' }
]

const statusType = (s: Player['status']) =>
    s === 'active' ? 'success' : s === 'banned' ? 'error' : 'default'
const statusLabel = (s: Player['status']) =>
    s === 'active' ? '活躍' : s === 'banned' ? '封禁' : '非活躍'

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('zh-TW')

const columns = computed<DataTableColumns<Player>>(() => [
    { title: '玩家 ID', key: 'id', width: 130, ellipsis: true },
    {
        title: '用戶名',
        key: 'username',
        sorter: (a, b) => a.username.localeCompare(b.username)
    },
    { title: '地區', key: 'country', width: 70 },
    {
        title: '總投注',
        key: 'totalBets',
        sorter: (a, b) => a.totalBets - b.totalBets,
        render: (row) => `$${row.totalBets.toLocaleString()}`
    },
    {
        title: '總儲值',
        key: 'totalDeposits',
        sorter: (a, b) => a.totalDeposits - b.totalDeposits,
        render: (row) => `$${row.totalDeposits.toLocaleString()}`
    },
    {
        title: '最後活躍',
        key: 'lastActiveAt',
        sorter: (a, b) => new Date(a.lastActiveAt).getTime() - new Date(b.lastActiveAt).getTime(),
        render: (row) => formatDate(row.lastActiveAt)
    },
    {
        title: '狀態',
        key: 'status',
        width: 80,
        render: (row) => h(NTag, { type: statusType(row.status), size: 'small', bordered: false }, {
            default: () => statusLabel(row.status)
        })
    }
])

const update = (patch: Partial<PlayerFilter>) =>
    emit('update:filters', { ...props.filters, ...patch, page: 1 })

const pagination = computed(() => ({
    page: props.filters.page,
    pageSize: props.filters.pageSize,
    itemCount: props.total,
    showSizePicker: false,
    onChange: (page: number) => emit('update:filters', { ...props.filters, page })
}))
</script>

<template>
    <div class="flex flex-col gap-3">
        <!-- Filter -->
        <div class="flex flex-wrap gap-3">
            <n-input
                :value="filters.search"
                placeholder="搜尋玩家 ID 或用戶名..."
                clearable
                class="w-56"
                @update:value="update({ search: $event ?? '' })"
            />
            <n-select
                :value="filters.country"
                :options="COUNTRY_OPTIONS"
                class="w-32"
                @update:value="update({ country: $event })"
            />
            <n-select
                :value="filters.status"
                :options="STATUS_OPTIONS"
                class="w-32"
                @update:value="update({ status: $event })"
            />
            <n-button @click="emit('update:filters', { search: '', status: undefined, country: undefined, page: 1, pageSize: 20 })">
                重置
            </n-button>
        </div>

        <!-- Table -->
        <n-data-table
            :columns="columns"
            :data="players"
            :loading="loading"
            :pagination="pagination"
            :row-key="(row: Player) => row.id"
            remote
            size="small"
        />
    </div>
</template>
