<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Toast from 'primevue/toast'
import { useAggregators } from '@/composables/useAggregators'
import AggregatorTable from './components/AggregatorTable.vue'
import AggregatorCreateModal from './components/AggregatorCreateModal.vue'
import type { CreateAggregatorPayload } from '@/types/aggregator'

const {
    aggregators,
    total,
    loading,
    creating,
    filters,
    toggleStatus,
    createAggregator,
    resetFilters,
} = useAggregators()

const showCreate = ref(false)

const statusOptions = [
    { label: '全部狀態', value: null },
    { label: '啟用中', value: 'active' },
    { label: '已停用', value: 'inactive' },
]

const handleCreate = async (payload: CreateAggregatorPayload) => {
    const ok = await createAggregator(payload)
    if (ok) showCreate.value = false
}

const onSearchChange = (v: string) => {
    filters.value = { ...filters.value, search: v ?? '', page: 1 }
}

const onStatusChange = (v: 'active' | 'inactive' | null) => {
    filters.value = {
        ...filters.value,
        status: v ?? undefined,
        page: 1,
    }
}
</script>

<template>
    <div class="hig-page">
        <!-- Header -->
        <header class="hig-page-header">
            <h1 class="hig-page-title">
                <i class="pi pi-share-alt" />
                聚合商管理
            </h1>
            <Button label="新增聚合商" icon="pi pi-plus" @click="showCreate = true" />
        </header>

        <!-- 篩選列 -->
        <div class="flex gap-3 flex-wrap items-center">
            <span class="p-input-icon-left" style="position: relative;">
                <InputText
                    :model-value="filters.search"
                    placeholder="搜尋名稱或代碼…"
                    class="w-56"
                    @update:model-value="onSearchChange"
                />
            </span>
            <Select
                :model-value="filters.status ?? null"
                :options="statusOptions"
                option-label="label"
                option-value="value"
                class="w-36"
                @update:model-value="onStatusChange"
            />
            <Button label="重置" severity="secondary" outlined @click="resetFilters" />
        </div>

        <!-- 表格 -->
        <section class="hig-card">
            <AggregatorTable
                :aggregators="aggregators"
                :total="total"
                :loading="loading"
                :filters="filters"
                @update:filters="filters = $event"
                @toggle-status="toggleStatus"
            />
        </section>

        <!-- 新增彈窗 -->
        <AggregatorCreateModal
            v-model:show="showCreate"
            :loading="creating"
            @submit="handleCreate"
        />

        <Toast position="top-right" />
    </div>
</template>
