<script setup lang="ts">
import { NCard, NRadioGroup, NRadioButton, NSkeleton } from 'naive-ui'
import VChart from 'vue-echarts'
import type { EChartsOption } from 'echarts'
import type { RevenuePeriod } from '@/types/dashboard'

defineProps<{
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
    { label: '30天', value: '30d' }
]
</script>

<template>
    <n-card title="營收趨勢" class="h-[360px]">
        <template #header-extra>
            <n-radio-group
                :value="period"
                size="small"
                @update:value="(v: RevenuePeriod) => emit('change-period', v)"
            >
                <n-radio-button
                    v-for="opt in periodOptions"
                    :key="opt.value"
                    :value="opt.value"
                    :label="opt.label"
                />
            </n-radio-group>
        </template>

        <div class="h-[260px]">
            <n-skeleton v-if="loading" class="h-full" />
            <v-chart v-else :option="option" autoresize class="h-full w-full" />
        </div>
    </n-card>
</template>
