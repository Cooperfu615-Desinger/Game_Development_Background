<script setup lang="ts">
import { computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import Skeleton from 'primevue/skeleton'
import { useSettlements } from '@/composables/useFinance'
import type { Settlement } from '@/types/finance'

const { settlements, total, loading, filters, totalNetAmount } = useSettlements()

const statusOpts = [
    { label: '全部狀態', value: null },
    { label: '待確認', value: 'pending' },
    { label: '已確認', value: 'confirmed' },
    { label: '已付款', value: 'paid' },
]

type Severity = 'success' | 'info' | 'warn' | 'secondary'
const statusSeverity = (s: Settlement['status']): Severity =>
    s === 'paid' ? 'success' : s === 'confirmed' ? 'info' : 'warn'
const statusLabel = (s: Settlement['status']) =>
    s === 'paid' ? '已付款' : s === 'confirmed' ? '已確認' : '待確認'
const typeLabel = (t: Settlement['type']) =>
    t === 'monthly' ? '月結' : t === 'weekly' ? '週結' : '日結'

const formatMoney = (v: number) =>
    new Intl.NumberFormat('zh-TW', { minimumFractionDigits: 2 }).format(v)

// ─── Date 雙向轉換（filter 存 timestamp，DatePicker 用 Date 物件） ───
const startDateModel = computed({
    get: () => (filters.value.startDate ? new Date(filters.value.startDate) : null),
    set: (v: Date | null) => {
        filters.value = { ...filters.value, startDate: v ? v.getTime() : null, page: 1 }
    },
})
const endDateModel = computed({
    get: () => (filters.value.endDate ? new Date(filters.value.endDate) : null),
    set: (v: Date | null) => {
        filters.value = { ...filters.value, endDate: v ? v.getTime() : null, page: 1 }
    },
})

const onStatusChange = (v: Settlement['status'] | null) => {
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
                <i class="pi pi-wallet" />
                結算報表
            </h1>
        </header>

        <!-- 統計卡片 -->
        <div class="grid grid-cols-2 gap-3">
            <div class="stat">
                <span class="stat-label">本頁結算總計</span>
                <Skeleton v-if="loading" width="8rem" height="1.5rem" />
                <span v-else class="stat-value">${{ formatMoney(totalNetAmount()) }}</span>
            </div>
            <div class="stat">
                <span class="stat-label">結算筆數</span>
                <Skeleton v-if="loading" width="4rem" height="1.5rem" />
                <span v-else class="stat-value">{{ total.toLocaleString() }}</span>
            </div>
        </div>

        <!-- 篩選 -->
        <div class="flex flex-wrap gap-3 items-center">
            <DatePicker
                v-model="startDateModel"
                view="month"
                date-format="yy/mm"
                placeholder="開始月份"
                show-button-bar
                class="w-40"
            />
            <DatePicker
                v-model="endDateModel"
                view="month"
                date-format="yy/mm"
                placeholder="結束月份"
                show-button-bar
                class="w-40"
            />
            <Select
                :model-value="filters.status ?? null"
                :options="statusOpts"
                option-label="label"
                option-value="value"
                class="w-36"
                @update:model-value="onStatusChange"
            />
        </div>

        <!-- 表格 -->
        <section class="hig-card">
            <DataTable
                :value="settlements"
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
                <Column field="period" header="期間" sortable />
                <Column header="類型" style="width: 80px">
                    <template #body="{ data }">
                        <Tag severity="secondary" :value="typeLabel(data.type)" />
                    </template>
                </Column>
                <Column field="revenue" header="總營收" sortable>
                    <template #body="{ data }">{{ formatMoney(data.revenue) }}</template>
                </Column>
                <Column field="revenueShare" header="分潤" sortable>
                    <template #body="{ data }">{{ formatMoney(data.revenueShare) }}</template>
                </Column>
                <Column field="fee" header="手續費" sortable>
                    <template #body="{ data }">{{ formatMoney(data.fee) }}</template>
                </Column>
                <Column field="netAmount" header="淨金額" sortable>
                    <template #body="{ data }">{{ formatMoney(data.netAmount) }}</template>
                </Column>
                <Column header="狀態" style="width: 100px">
                    <template #body="{ data }">
                        <Tag :severity="statusSeverity(data.status)" :value="statusLabel(data.status)" />
                    </template>
                </Column>
            </DataTable>
        </section>
    </div>
</template>

<style scoped>
.stat {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    padding: 0.875rem 1rem;
    background: var(--hig-bg-surface);
    border: 1px solid var(--hig-border-default);
    border-radius: var(--hig-radius-card);
    box-shadow: var(--hig-shadow-sm);
    min-height: 4rem;
    justify-content: center;
}
.stat-label {
    font-size: 0.75rem;
    color: var(--hig-text-secondary);
}
.stat-value {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--hig-text-primary);
    font-variant-numeric: tabular-nums;
}
</style>
