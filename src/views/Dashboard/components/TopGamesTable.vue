<script setup lang="ts">
import { computed } from 'vue'
import { NCard, NDataTable, NTag } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import type { TopGame } from '@/types/dashboard'

const props = defineProps<{
    games: TopGame[]
    loading: boolean
}>()

const rankColors: Record<number, 'warning' | 'info' | 'default'> = {
    1: 'warning',
    2: 'info',
    3: 'default'
}

const columns = computed<DataTableColumns<TopGame>>(() => [
    {
        title: '排名',
        key: 'rank',
        width: 60,
        render: (row) => {
            const type = rankColors[row.rank] ?? 'default'
            return h(NTag, { type, size: 'small', bordered: false }, { default: () => `#${row.rank}` })
        }
    },
    {
        title: '遊戲名稱',
        key: 'name',
        ellipsis: true
    },
    {
        title: '活躍玩家',
        key: 'activePlayers',
        sorter: (a, b) => a.activePlayers - b.activePlayers,
        render: (row) => row.activePlayers.toLocaleString()
    },
    {
        title: '營收佔比',
        key: 'revenueShare',
        sorter: (a, b) => a.revenueShare - b.revenueShare,
        render: (row) => `${row.revenueShare.toFixed(1)}%`
    }
])
</script>

<script lang="ts">
import { h } from 'vue'
</script>

<template>
    <n-card title="熱門遊戲 TOP 5" class="h-[360px]">
        <n-data-table
            :columns="columns"
            :data="games"
            :loading="loading"
            :pagination="false"
            size="small"
        />
    </n-card>
</template>
