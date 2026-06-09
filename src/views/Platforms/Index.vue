<script setup lang="ts">
import Select from 'primevue/select'
import SelectButton from 'primevue/selectbutton'
import Skeleton from 'primevue/skeleton'
import { usePlatforms } from '@/composables/usePlatforms'
import PlatformCard from './components/PlatformCard.vue'

const { platforms, loading, selectedAggregatorId, period } = usePlatforms()

const aggregatorOptions = [
    { label: '自家聚合商', value: 'agg-001' },
    { label: '測試環境', value: 'agg-002' },
]

const periodOptions = [
    { label: '本週', value: 'week' },
    { label: '本月', value: 'month' },
]

const onPeriodChange = (v: 'week' | 'month' | null) => {
    if (v) period.value = v
}
</script>

<template>
    <div class="hig-page">
        <!-- Header -->
        <header class="hig-page-header">
            <h1 class="hig-page-title">
                <i class="pi pi-users" />
                平台分析
            </h1>
            <div class="flex items-center gap-3 flex-wrap">
                <Select
                    v-model="selectedAggregatorId"
                    :options="aggregatorOptions"
                    option-label="label"
                    option-value="value"
                    class="w-44"
                />
                <SelectButton
                    :model-value="period"
                    :options="periodOptions"
                    option-label="label"
                    option-value="value"
                    :allow-empty="false"
                    @update:model-value="onPeriodChange"
                />
            </div>
        </header>

        <!-- 平台卡片列表 -->
        <div v-if="loading" class="flex flex-col gap-3">
            <div v-for="i in 3" :key="i" class="loading-card">
                <Skeleton width="100%" height="3.5rem" />
            </div>
        </div>

        <div v-else class="flex flex-col gap-3">
            <PlatformCard v-for="p in platforms" :key="p.id" :platform="p" />
            <div v-if="platforms.length === 0" class="empty-state">
                此聚合商目前沒有對接平台
            </div>
        </div>
    </div>
</template>

<style scoped>
.loading-card {
    padding: 1.25rem 1.5rem;
    background: var(--hig-bg-surface);
    border: 1px solid var(--hig-border-default);
    border-radius: var(--hig-radius-card);
    box-shadow: var(--hig-shadow-sm);
}

.empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--hig-text-secondary);
    font-size: 0.9375rem;
}
</style>
