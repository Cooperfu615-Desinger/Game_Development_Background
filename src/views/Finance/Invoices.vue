<script setup lang="ts">
import { computed, h } from 'vue'
import { NCard, NDataTable, NTag, NSelect, NButton } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { useInvoices } from '@/composables/useFinance'
import type { Invoice } from '@/types/finance'

const { invoices, total, loading, filters } = useInvoices()

const STATUS_OPTS = [
    { label: '全部狀態', value: undefined },
    { label: '草稿', value: 'draft' },
    { label: '已確認', value: 'confirmed' },
    { label: '已付款', value: 'paid' }
]

const statusType = (s: Invoice['status']) =>
    s === 'paid' ? 'success' : s === 'confirmed' ? 'info' : 'default'
const statusLabel = (s: Invoice['status']) =>
    s === 'paid' ? '已付款' : s === 'confirmed' ? '已確認' : '草稿'

const formatMoney = (v: number) =>
    new Intl.NumberFormat('zh-TW', { minimumFractionDigits: 2 }).format(v)

const columns = computed<DataTableColumns<Invoice>>(() => [
    { title: '發票號碼', key: 'invoiceNo', width: 180 },
    { title: '期間', key: 'period', width: 90, sorter: (a, b) => a.period.localeCompare(b.period) },
    {
        title: '金額', key: 'amount', width: 130,
        sorter: (a, b) => a.amount - b.amount,
        render: (row) => `${formatMoney(row.amount)} ${row.currency}`
    },
    {
        title: '狀態', key: 'status', width: 90,
        render: (row) => h(NTag, { type: statusType(row.status), size: 'small' }, {
            default: () => statusLabel(row.status)
        })
    },
    { title: '到期日', key: 'dueDate', width: 110 },
    {
        title: '操作', key: 'actions', width: 90,
        render: () => h(NButton, { size: 'tiny', disabled: true }, { default: () => '下載 PDF' })
    }
])

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
        <h1 class="text-2xl font-bold">發票管理</h1>

        <!-- 篩選 -->
        <div class="flex gap-3">
            <n-select
                :value="filters.status"
                :options="STATUS_OPTS"
                class="w-36"
                @update:value="filters = { ...filters, status: $event, page: 1 }"
            />
        </div>

        <!-- 表格 -->
        <n-card>
            <n-data-table
                :columns="columns"
                :data="invoices"
                :loading="loading"
                :pagination="pagination"
                :row-key="(row: Invoice) => row.id"
                remote
            />
        </n-card>
    </div>
</template>
