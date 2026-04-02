<script setup lang="ts">
import { computed, h } from 'vue'
import { NCard, NDataTable, NSkeleton, NTag } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import type { RetentionData } from '@/types/player'

const props = defineProps<{
    data: RetentionData[]
    loading: boolean
}>()

const trendTag = (v: number) => {
    const type = v >= 40 ? 'success' : v >= 20 ? 'warning' : 'error'
    return h(NTag, { type, size: 'small', bordered: false }, { default: () => `${v.toFixed(1)}%` })
}

const columns = computed<DataTableColumns<RetentionData>>(() => [
    { title: '遊戲', key: 'label' },
    {
        title: 'D1 留存',
        key: 'd1',
        sorter: (a, b) => a.d1 - b.d1,
        render: (row) => trendTag(row.d1)
    },
    {
        title: 'D7 留存',
        key: 'd7',
        sorter: (a, b) => a.d7 - b.d7,
        render: (row) => trendTag(row.d7)
    },
    {
        title: 'D30 留存',
        key: 'd30',
        sorter: (a, b) => a.d30 - b.d30,
        render: (row) => trendTag(row.d30)
    }
])
</script>

<template>
    <n-card title="留存率報表" class="h-[360px]">
        <n-skeleton v-if="loading" :repeat="5" text />
        <n-data-table
            v-else
            :columns="columns"
            :data="data"
            :pagination="false"
            size="small"
        />
    </n-card>
</template>
