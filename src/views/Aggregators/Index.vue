<script setup lang="ts">
import { ref } from 'vue'
import { NButton, NIcon, NInput, NSelect, NCard } from 'naive-ui'
import { HubOutlined, AddOutlined } from '@vicons/material'
import { useAggregators } from '@/composables/useAggregators'
import AggregatorTable from './components/AggregatorTable.vue'
import AggregatorCreateModal from './components/AggregatorCreateModal.vue'
import type { CreateAggregatorPayload } from '@/types/aggregator'

const {
    aggregators, total, loading, creating,
    filters, toggleStatus, createAggregator, resetFilters,
} = useAggregators()

const showCreate = ref(false)

const statusOptions = [
    { label: '全部狀態', value: undefined },
    { label: '啟用中',   value: 'active'  },
    { label: '已停用',   value: 'inactive' },
]

const handleCreate = async (payload: CreateAggregatorPayload) => {
    const ok = await createAggregator(payload)
    if (ok) showCreate.value = false
}
</script>

<template>
    <div class="flex flex-col gap-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
                <n-icon size="24"><HubOutlined /></n-icon>
                <h1 class="text-2xl font-bold">聚合商管理</h1>
            </div>
            <n-button type="primary" @click="showCreate = true">
                <template #icon><n-icon><AddOutlined /></n-icon></template>
                新增聚合商
            </n-button>
        </div>

        <!-- 篩選列 -->
        <div class="flex gap-3 flex-wrap">
            <n-input
                v-model:value="filters.search"
                placeholder="搜尋名稱或代碼..."
                clearable
                class="w-56"
                @update:value="filters = { ...filters, search: $event ?? '', page: 1 }"
            />
            <n-select
                :value="filters.status"
                :options="statusOptions"
                class="w-36"
                @update:value="filters = { ...filters, status: $event, page: 1 }"
            />
            <n-button @click="resetFilters">重置</n-button>
        </div>

        <!-- 表格 -->
        <n-card>
            <AggregatorTable
                :aggregators="aggregators"
                :total="total"
                :loading="loading"
                :filters="filters"
                @update:filters="filters = $event"
                @toggle-status="toggleStatus"
            />
        </n-card>

        <!-- 新增彈窗 -->
        <AggregatorCreateModal
            v-model:show="showCreate"
            :loading="creating"
            @submit="handleCreate"
        />
    </div>
</template>
