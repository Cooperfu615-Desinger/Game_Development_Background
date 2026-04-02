<script setup lang="ts">
import { computed, h } from 'vue'
import {
    NCard, NDataTable, NTag, NInput, NSelect,
    NButton, NIcon
} from 'naive-ui'
import { FileDownloadOutlined } from '@vicons/material'
import type { DataTableColumns } from 'naive-ui'
import { useTransactions } from '@/composables/useFinance'
import type { Transaction } from '@/types/finance'

const { transactions, total, loading, filters, exportCSV } = useTransactions()

const CURRENCY_OPTS = [
    { label: '全部幣別', value: undefined },
    ...['TWD', 'USD', 'JPY', 'THB'].map(c => ({ label: c, value: c }))
]

const TYPE_COLOR: Record<Transaction['type'], 'success' | 'error' | 'warning'> = {
    bet: 'error', win: 'success', refund: 'warning'
}
const TYPE_LABEL: Record<Transaction['type'], string> = {
    bet: '投注', win: '獲勝', refund: '退款'
}

const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('zh-TW', { dateStyle: 'short', timeStyle: 'short' })

const columns = computed<DataTableColumns<Transaction>>(() => [
    { title: 'Bet ID', key: 'betId', width: 150, ellipsis: true },
    { title: '玩家', key: 'playerName', ellipsis: true },
    { title: '遊戲', key: 'gameName', ellipsis: true },
    {
        title: '類型', key: 'type', width: 70,
        render: (row) => h(NTag, { type: TYPE_COLOR[row.type], size: 'small', bordered: false }, {
            default: () => TYPE_LABEL[row.type]
        })
    },
    {
        title: '金額', key: 'amount', width: 110,
        sorter: (a, b) => a.amount - b.amount,
        render: (row) => `${row.amount.toLocaleString()} ${row.currency}`
    },
    {
        title: '時間', key: 'createdAt', width: 140,
        sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        render: (row) => formatDate(row.createdAt)
    }
])

const update = (patch: Partial<typeof filters.value>) => {
    filters.value = { ...filters.value, ...patch, page: 1 }
}

const pagination = computed(() => ({
    page: filters.value.page,
    pageSize: filters.value.pageSize,
    itemCount: total.value,
    showSizePicker: false,
    onChange: (page: number) => { filters.value = { ...filters.value, page } }
}))
</script>

<template>
    <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold">交易記錄</h1>
            <n-button @click="exportCSV">
                <template #icon><n-icon><FileDownloadOutlined /></n-icon></template>
                匯出 CSV
            </n-button>
        </div>

        <!-- 篩選 -->
        <div class="flex flex-wrap gap-3">
            <n-input
                :value="filters.betId"
                placeholder="搜尋 Bet ID..."
                clearable
                class="w-48"
                @update:value="update({ betId: $event ?? '' })"
            />
            <n-input
                :value="filters.playerId"
                placeholder="搜尋玩家 ID..."
                clearable
                class="w-48"
                @update:value="update({ playerId: $event ?? '' })"
            />
            <n-select
                :value="filters.currency"
                :options="CURRENCY_OPTS"
                class="w-32"
                @update:value="update({ currency: $event })"
            />
        </div>

        <!-- 表格 -->
        <n-card>
            <n-data-table
                :columns="columns"
                :data="transactions"
                :loading="loading"
                :pagination="pagination"
                :row-key="(row: Transaction) => row.id"
                remote
                size="small"
            />
        </n-card>
    </div>
</template>
