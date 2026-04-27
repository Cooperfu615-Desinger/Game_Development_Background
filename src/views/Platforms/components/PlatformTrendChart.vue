<script setup lang="ts">
import { shallowRef, watch } from 'vue'
import { NCard, NSkeleton } from 'naive-ui'
import VChart from 'vue-echarts'
import type { EChartsOption } from 'echarts'
import type { TrendPoint } from '@/types/platform'

const props = defineProps<{
    data: TrendPoint[]
    loading: boolean
}>()

const chartOption = shallowRef({} as EChartsOption)

watch(
    () => props.data,
    (data) => {
        if (!data.length) return
        chartOption.value = {
            tooltip: { trigger: 'axis' },
            legend: { data: ['流水', 'GGR'], top: 8 },
            grid: { left: 70, right: 20, top: 40, bottom: 30 },
            xAxis: {
                type: 'category',
                data: data.map(d => d.date),
                axisLabel: { color: '#9ca3af', fontSize: 11 },
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    color: '#9ca3af',
                    fontSize: 11,
                    formatter: (v: number) =>
                        v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v}`,
                },
            },
            series: [
                {
                    name: '流水',
                    type: 'line',
                    data: data.map(d => d.turnover),
                    smooth: true,
                    itemStyle: { color: '#3b82f6' },
                    areaStyle: { color: 'rgba(59,130,246,0.1)' },
                },
                {
                    name: 'GGR',
                    type: 'line',
                    data: data.map(d => d.ggr),
                    smooth: true,
                    itemStyle: { color: '#22c55e' },
                    areaStyle: { color: 'rgba(34,197,94,0.1)' },
                },
            ],
        }
    },
    { immediate: true }
)
</script>

<template>
    <n-card title="流水趨勢" class="h-[360px]">
        <div class="h-[280px]">
            <n-skeleton v-if="loading" class="h-full" />
            <v-chart
                v-else
                :option="chartOption"
                autoresize
                class="h-full w-full"
            />
        </div>
    </n-card>
</template>
