<script setup lang="ts">
import { computed, h } from 'vue'
import { NDataTable, NTag, NButton, NSwitch, NSpace } from 'naive-ui'
import type { DataTableColumns, DataTableRowKey } from 'naive-ui'
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
    slot: '老虎機', table: '桌遊', live: '真人', fishing: '捕魚'
}

const columns = computed<DataTableColumns<Game>>(() => [
    { type: 'selection', width: 48 },
    {
        title: '遊戲名稱',
        key: 'name',
        sorter: (a, b) => a.name.localeCompare(b.name),
        ellipsis: { tooltip: true }
    },
    {
        title: '類別',
        key: 'category',
        width: 90,
        render: (row) => h(NTag, { size: 'small', bordered: false }, { default: () => categoryLabel[row.category] })
    },
    {
        title: 'RTP',
        key: 'rtp',
        width: 90,
        sorter: (a, b) => a.rtp - b.rtp,
        render: (row) => `${row.rtp.toFixed(1)}%`
    },
    {
        title: '活躍玩家',
        key: 'activeUsers',
        width: 110,
        sorter: (a, b) => a.activeUsers - b.activeUsers,
        render: (row) => row.activeUsers.toLocaleString()
    },
    {
        title: '版本',
        key: 'version',
        width: 80
    },
    {
        title: '狀態',
        key: 'status',
        width: 90,
        sorter: (a, b) => Number(a.status === 'active') - Number(b.status === 'active'),
        render: (row) => h(NSwitch, {
            value: row.status === 'active',
            size: 'small',
            onUpdateValue: () => emit('toggle-status', row)
        })
    },
    {
        title: '操作',
        key: 'actions',
        width: 130,
        render: (row) => h(NSpace, { size: 'small' }, {
            default: () => [
                h(NButton, { size: 'tiny', onClick: () => emit('view', row) }, { default: () => '詳情' }),
                h(NButton, { size: 'tiny', type: 'primary', onClick: () => emit('edit', row) }, { default: () => '編輯' })
            ]
        })
    }
])

const handleChecked = (keys: DataTableRowKey[]) => {
    emit('update:selected', keys as string[])
}

const pagination = computed(() => ({
    page: props.filters.page,
    pageSize: props.filters.pageSize,
    itemCount: props.total,
    showSizePicker: false,
    onChange: (page: number) => emit('update:filters', { ...props.filters, page })
}))
</script>

<template>
    <n-data-table
        :columns="columns"
        :data="games"
        :loading="loading"
        :pagination="pagination"
        :row-key="(row: Game) => row.id"
        remote
        @update:checked-row-keys="handleChecked"
    />
</template>
