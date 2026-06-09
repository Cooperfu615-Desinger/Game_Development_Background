<script setup lang="ts">
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Select from 'primevue/select'
import Button from 'primevue/button'
import { useInvoices } from '@/composables/useFinance'
import type { Invoice } from '@/types/finance'

const { invoices, total, loading, filters } = useInvoices()

const STATUS_OPTS = [
    { label: '全部狀態', value: null },
    { label: '草稿', value: 'draft' },
    { label: '已確認', value: 'confirmed' },
    { label: '已付款', value: 'paid' },
]

type Severity = 'success' | 'info' | 'secondary'
const statusSeverity = (s: Invoice['status']): Severity =>
    s === 'paid' ? 'success' : s === 'confirmed' ? 'info' : 'secondary'
const statusLabel = (s: Invoice['status']) =>
    s === 'paid' ? '已付款' : s === 'confirmed' ? '已確認' : '草稿'

const formatMoney = (v: number) =>
    new Intl.NumberFormat('zh-TW', { minimumFractionDigits: 2 }).format(v)

const onStatusChange = (v: Invoice['status'] | null) => {
    filters.value = { ...filters.value, status: v ?? undefined, page: 1 }
}

const onPage = (e: { page: number }) => {
    filters.value = { ...filters.value, page: e.page + 1 }
}
</script>

<template>
    <div class="hig-page">
        <header class="hig-page-header">
            <h1 class="hig-page-title">
                <i class="pi pi-file" />
                發票管理
            </h1>
        </header>

        <!-- 篩選 -->
        <div class="flex gap-3">
            <Select
                :model-value="filters.status ?? null"
                :options="STATUS_OPTS"
                option-label="label"
                option-value="value"
                class="w-36"
                @update:model-value="onStatusChange"
            />
        </div>

        <!-- 表格 -->
        <section class="hig-card">
            <DataTable
                :value="invoices"
                :loading="loading"
                data-key="id"
                sort-mode="single"
                paginator
                lazy
                :rows="filters.pageSize"
                :total-records="total"
                :first="(filters.page - 1) * filters.pageSize"
                @page="onPage"
            >
                <Column field="invoiceNo" header="發票號碼" style="width: 200px" />
                <Column field="period" header="期間" sortable style="width: 100px" />
                <Column field="amount" header="金額" sortable>
                    <template #body="{ data }">
                        {{ formatMoney(data.amount) }} {{ data.currency }}
                    </template>
                </Column>
                <Column header="狀態" style="width: 100px">
                    <template #body="{ data }">
                        <Tag :severity="statusSeverity(data.status)" :value="statusLabel(data.status)" />
                    </template>
                </Column>
                <Column field="dueDate" header="到期日" style="width: 110px" />
                <Column header="操作" style="width: 110px">
                    <template #body>
                        <Button label="下載 PDF" size="small" disabled outlined />
                    </template>
                </Column>
            </DataTable>
        </section>
    </div>
</template>
