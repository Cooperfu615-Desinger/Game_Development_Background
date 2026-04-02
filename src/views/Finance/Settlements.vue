<script setup lang="ts">
import { computed, h } from 'vue'
import {
    NCard, NDataTable, NTag, NSelect, NDatePicker,
    NSpace, NStatistic, NSkeleton
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { useSettlements } from '@/composables/useFinance'
import type { Settlement } from '@/types/finance'

const { settlements, total, loading, filters, totalNetAmount } = useSettlements()

const statusOpts = [
    { label: '全部狀態', value: undefined },
    { label: '待確認', value: 'pending' },
    { label: '已確認', value: 'confirmed' },
    { label: '已付款', value: 'paid' }
]

const statusType = (s: Settlement['status']) =>
    s === 'paid' ? 'success' : s === 'confirmed' ? 'info' : 'warning'
const statusLabel = (s: Settlement['status']) =>
    s === 'paid' ? '已付款' : s === 'confirmed' ? '已確認' : '待確認'
const typeLabel = (t: Settlement['type']) =>
    t === 'monthly' ? '月結' : t === 'weekly' ? '週結' : '日結'

const formatMoney = (v: number) =>
    new Intl.NumberFormat('zh-TW', { minimumFractionDigits: 2 }).format(v)

const columns = computed<DataTableColumns<Settlement>>(() => [
    { title: '期間', key: 'period', sorter: (a, b) => a.period.localeCompare(b.period) },
    {
        title: '類型', key: 'type', width: 70,
        render: (row) => h(NTag, { size: 'small', bordered: false }, { default: () => typeLabel(row.type) })
    },
    {
        title: '總營收', key: 'revenue', width: 130,
        sorter: (a, b) => a.revenue - b.revenue,
        render: (row) => formatMoney(row.revenue)
    },
    {
        title: '分潤', key: 'revenueShare', width: 130,
        sorter: (a, b) => a.revenueShare - b.revenueShare,
        render: (row) => formatMoney(row.revenueShare)
    },
    {
        title: '手續費', key: 'fee', width: 110,
        sorter: (a, b) => a.fee - b.fee,
        render: (row) => formatMoney(row.fee)
    },
    {
        title: '淨金額', key: 'netAmount', width: 130,
        sorter: (a, b) => a.netAmount - b.netAmount,
        render: (row) => formatMoney(row.netAmount)
    },
    {
        title: '狀態', key: 'status', width: 90,
        render: (row) => h(NTag, { type: statusType(row.status), size: 'small' }, {
            default: () => statusLabel(row.status)
        })
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
        <h1 class="text-2xl font-bold">結算報表</h1>

        <!-- 統計卡片 -->
        <div class="grid grid-cols-2 gap-4">
            <n-card class="h-[80px]">
                <n-skeleton v-if="loading" text :width="100" />
                <n-statistic v-else label="本頁結算總計" :value="totalNetAmount()" />
            </n-card>
            <n-card class="h-[80px]">
                <n-skeleton v-if="loading" text :width="60" />
                <n-statistic v-else label="結算筆數" :value="total" />
            </n-card>
        </div>

        <!-- 篩選 -->
        <div class="flex flex-wrap gap-3">
            <n-date-picker
                v-model:value="filters.startDate"
                type="month"
                placeholder="開始月份"
                clearable
                class="w-40"
                @update:value="filters = { ...filters, page: 1 }"
            />
            <n-date-picker
                v-model:value="filters.endDate"
                type="month"
                placeholder="結束月份"
                clearable
                class="w-40"
                @update:value="filters = { ...filters, page: 1 }"
            />
            <n-select
                :value="filters.status"
                :options="statusOpts"
                class="w-36"
                @update:value="filters = { ...filters, status: $event, page: 1 }"
            />
        </div>

        <!-- 表格 -->
        <n-card>
            <n-data-table
                :columns="columns"
                :data="settlements"
                :loading="loading"
                :pagination="pagination"
                :row-key="(row: Settlement) => row.id"
                remote
            />
        </n-card>
    </div>
</template>
