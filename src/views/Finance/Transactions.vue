<script setup lang="ts">
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from 'primevue/button'
import { useTransactions } from '@/composables/useFinance'
import type { Transaction } from '@/types/finance'

const { transactions, total, loading, filters, exportCSV } = useTransactions()

const CURRENCY_OPTS = [
    { label: '全部幣別', value: null },
    ...['TWD', 'USD', 'JPY', 'THB'].map((c) => ({ label: c, value: c })),
]

type Severity = 'success' | 'danger' | 'warn'
const TYPE_SEVERITY: Record<Transaction['type'], Severity> = {
    bet: 'danger',
    win: 'success',
    refund: 'warn',
}
const TYPE_LABEL: Record<Transaction['type'], string> = {
    bet: '投注',
    win: '獲勝',
    refund: '退款',
}

const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('zh-TW', { dateStyle: 'short', timeStyle: 'short' })

const update = (patch: Partial<typeof filters.value>) => {
    filters.value = { ...filters.value, ...patch, page: 1 }
}

const onPage = (e: { page: number }) => {
    filters.value = { ...filters.value, page: e.page + 1 }
}
</script>

<template>
    <div class="hig-page">
        <header class="hig-page-header">
            <h1 class="hig-page-title">
                <i class="pi pi-arrows-h" />
                交易記錄
            </h1>
            <Button
                label="匯出 CSV"
                icon="pi pi-download"
                severity="secondary"
                outlined
                @click="exportCSV"
            />
        </header>

        <!-- 篩選 -->
        <div class="flex flex-wrap gap-3 items-center">
            <InputText
                :model-value="filters.betId"
                placeholder="搜尋 Bet ID…"
                class="w-48"
                @update:model-value="(v) => update({ betId: v ?? '' })"
            />
            <InputText
                :model-value="filters.playerId"
                placeholder="搜尋玩家 ID…"
                class="w-48"
                @update:model-value="(v) => update({ playerId: v ?? '' })"
            />
            <Select
                :model-value="filters.currency ?? null"
                :options="CURRENCY_OPTS"
                option-label="label"
                option-value="value"
                class="w-32"
                @update:model-value="(v) => update({ currency: v ?? undefined })"
            />
        </div>

        <!-- 表格 -->
        <section class="hig-card">
            <DataTable
                :value="transactions"
                :loading="loading"
                data-key="id"
                size="small"
                sort-mode="single"
                paginator
                lazy
                :rows="filters.pageSize"
                :total-records="total"
                :first="(filters.page - 1) * filters.pageSize"
                @page="onPage"
            >
                <Column field="betId" header="Bet ID" style="width: 160px" />
                <Column field="playerName" header="玩家" />
                <Column field="gameName" header="遊戲" />
                <Column header="類型" style="width: 80px">
                    <template #body="{ data }">
                        <Tag :severity="TYPE_SEVERITY[data.type]" :value="TYPE_LABEL[data.type]" />
                    </template>
                </Column>
                <Column field="amount" header="金額" sortable>
                    <template #body="{ data }">
                        {{ data.amount.toLocaleString() }} {{ data.currency }}
                    </template>
                </Column>
                <Column field="createdAt" header="時間" sortable>
                    <template #body="{ data }">{{ formatDate(data.createdAt) }}</template>
                </Column>
            </DataTable>
        </section>
    </div>
</template>
