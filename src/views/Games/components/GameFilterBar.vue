<script setup lang="ts">
import { NInput, NSelect, NButton } from 'naive-ui'
import type { GameFilter } from '@/types/game'

const props = defineProps<{ filters: GameFilter; loading: boolean }>()
const emit = defineEmits<{
    (e: 'update:filters', v: GameFilter): void
    (e: 'reset'): void
}>()

const update = (patch: Partial<GameFilter>) => {
    emit('update:filters', { ...props.filters, ...patch, page: 1 })
}

const statusOptions = [
    { label: '全部狀態', value: undefined },
    { label: '上架中', value: 'active' },
    { label: '已下架', value: 'inactive' }
]

const categoryOptions = [
    { label: '全部類別', value: undefined },
    { label: '老虎機', value: 'slot' },
    { label: '桌遊', value: 'table' },
    { label: '真人', value: 'live' },
    { label: '捕魚', value: 'fishing' }
]
</script>

<template>
    <div class="flex flex-wrap gap-3 items-center">
        <n-input
            :value="filters.search"
            placeholder="搜尋遊戲名稱..."
            clearable
            class="w-56"
            @update:value="update({ search: $event ?? '' })"
        />
        <n-select
            :value="filters.status"
            :options="statusOptions"
            class="w-36"
            @update:value="update({ status: $event })"
        />
        <n-select
            :value="filters.category"
            :options="categoryOptions"
            class="w-36"
            @update:value="update({ category: $event })"
        />
        <n-button @click="emit('reset')" :disabled="loading">重置</n-button>
    </div>
</template>
