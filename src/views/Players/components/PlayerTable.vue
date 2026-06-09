<script setup lang="ts">
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from 'primevue/button'
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
    { label: '全部地區', value: null },
    ...['TW', 'JP', 'KR', 'TH', 'VN', 'PH', 'MY', 'SG', 'HK', 'ID'].map((c) => ({ label: c, value: c })),
]

const STATUS_OPTIONS = [
    { label: '全部狀態', value: null },
    { label: '活躍', value: 'active' },
    { label: '非活躍', value: 'inactive' },
    { label: '封禁', value: 'banned' },
]

type Severity = 'success' | 'danger' | 'secondary'
const statusSeverity = (s: Player['status']): Severity =>
    s === 'active' ? 'success' : s === 'banned' ? 'danger' : 'secondary'
const statusLabel = (s: Player['status']) =>
    s === 'active' ? '活躍' : s === 'banned' ? '封禁' : '非活躍'

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('zh-TW')

const update = (patch: Partial<PlayerFilter>) => {
    emit('update:filters', { ...props.filters, ...patch, page: 1 })
}

const onPage = (e: { page: number }) => {
    emit('update:filters', { ...props.filters, page: e.page + 1 })
}

const onReset = () => {
    emit('update:filters', {
        search: '',
        status: undefined,
        country: undefined,
        page: 1,
        pageSize: 20,
    })
}
</script>

<template>
    <div class="flex flex-col gap-3">
        <!-- Filter -->
        <div class="flex flex-wrap gap-3">
            <InputText
                :model-value="filters.search"
                placeholder="搜尋玩家 ID 或用戶名…"
                class="w-56"
                @update:model-value="(v) => update({ search: v ?? '' })"
            />
            <Select
                :model-value="filters.country ?? null"
                :options="COUNTRY_OPTIONS"
                option-label="label"
                option-value="value"
                class="w-32"
                @update:model-value="(v) => update({ country: v ?? undefined })"
            />
            <Select
                :model-value="filters.status ?? null"
                :options="STATUS_OPTIONS"
                option-label="label"
                option-value="value"
                class="w-32"
                @update:model-value="(v) => update({ status: v ?? undefined })"
            />
            <Button label="重置" severity="secondary" outlined @click="onReset" />
        </div>

        <!-- Table -->
        <DataTable
            :value="players"
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
            <Column field="id" header="玩家 ID" style="width: 140px" />
            <Column field="username" header="用戶名" sortable />
            <Column field="country" header="地區" style="width: 80px" />
            <Column field="totalBets" header="總投注" sortable>
                <template #body="{ data }">${{ data.totalBets.toLocaleString() }}</template>
            </Column>
            <Column field="totalDeposits" header="總儲值" sortable>
                <template #body="{ data }">${{ data.totalDeposits.toLocaleString() }}</template>
            </Column>
            <Column field="lastActiveAt" header="最後活躍" sortable>
                <template #body="{ data }">{{ formatDate(data.lastActiveAt) }}</template>
            </Column>
            <Column header="狀態" style="width: 90px">
                <template #body="{ data }">
                    <Tag :severity="statusSeverity(data.status)" :value="statusLabel(data.status)" />
                </template>
            </Column>
        </DataTable>
    </div>
</template>
