<script setup lang="ts">
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from 'primevue/button'
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
    { label: '全部狀態', value: null },
    { label: '上架中', value: 'active' },
    { label: '已下架', value: 'inactive' },
]

const categoryOptions = [
    { label: '全部類別', value: null },
    { label: '老虎機', value: 'slot' },
    { label: '桌遊', value: 'table' },
    { label: '真人', value: 'live' },
    { label: '捕魚', value: 'fishing' },
]
</script>

<template>
    <div class="flex flex-wrap gap-3 items-center">
        <InputText
            :model-value="filters.search"
            placeholder="搜尋遊戲名稱…"
            class="w-56"
            @update:model-value="(v) => update({ search: v ?? '' })"
        />
        <Select
            :model-value="filters.status ?? null"
            :options="statusOptions"
            option-label="label"
            option-value="value"
            class="w-36"
            @update:model-value="(v) => update({ status: v ?? undefined })"
        />
        <Select
            :model-value="filters.category ?? null"
            :options="categoryOptions"
            option-label="label"
            option-value="value"
            class="w-36"
            @update:model-value="(v) => update({ category: v ?? undefined })"
        />
        <Button
            label="重置"
            severity="secondary"
            outlined
            :disabled="loading"
            @click="emit('reset')"
        />
    </div>
</template>
