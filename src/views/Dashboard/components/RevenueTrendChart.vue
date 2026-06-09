<script setup lang="ts">
import SelectButton from 'primevue/selectbutton'
import Skeleton from 'primevue/skeleton'
import VChart from 'vue-echarts'
import type { EChartsOption } from 'echarts'
import type { RevenuePeriod } from '@/types/dashboard'

const props = defineProps<{
    option: EChartsOption
    period: RevenuePeriod
    loading: boolean
}>()

const emit = defineEmits<{
    (e: 'change-period', period: RevenuePeriod): void
}>()

const periodOptions = [
    { label: '7天', value: '7d' },
    { label: '14天', value: '14d' },
    { label: '30天', value: '30d' },
]

const onPeriodChange = (v: RevenuePeriod | null) => {
    if (v) emit('change-period', v)
}
</script>

<template>
    <section class="hig-card chart-card">
        <header class="hig-card-header">
            <h3 class="hig-card-title">營收趨勢</h3>
            <SelectButton
                :model-value="period"
                :options="periodOptions"
                option-label="label"
                option-value="value"
                :allow-empty="false"
                size="small"
                @update:model-value="onPeriodChange"
            />
        </header>
        <div class="hig-card-body chart-body">
            <Skeleton v-if="loading" width="100%" height="100%" />
            <VChart
                v-else
                :option="option"
                autoresize
                class="h-full w-full"
            />
        </div>
    </section>
</template>

<style scoped>
.chart-card {
    height: 360px;
    display: flex;
    flex-direction: column;
}
.chart-body {
    flex: 1 1 auto;
    min-height: 0;
}
</style>
