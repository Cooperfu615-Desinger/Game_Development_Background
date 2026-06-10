<script setup lang="ts">
import { shallowRef, watch } from 'vue'
import Skeleton from 'primevue/skeleton'
import VChart from 'vue-echarts'
import '@/plugins/echarts'
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
                data: data.map((d) => d.date),
                axisLabel: { color: '#8E8E93', fontSize: 11 },
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    color: '#8E8E93',
                    fontSize: 11,
                    formatter: (v: number) =>
                        v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v}`,
                },
            },
            series: [
                {
                    name: '流水',
                    type: 'line',
                    data: data.map((d) => d.turnover),
                    smooth: true,
                    itemStyle: { color: '#007AFF' }, // Apple Blue
                    areaStyle: { color: 'rgba(0,122,255,0.08)' },
                },
                {
                    name: 'GGR',
                    type: 'line',
                    data: data.map((d) => d.ggr),
                    smooth: true,
                    itemStyle: { color: '#34C759' }, // Apple Green
                    areaStyle: { color: 'rgba(52,199,89,0.08)' },
                },
            ],
        }
    },
    { immediate: true }
)
</script>

<template>
    <section class="hig-card chart-card">
        <header class="hig-card-header">
            <h3 class="hig-card-title">流水趨勢</h3>
        </header>
        <div class="hig-card-body chart-body">
            <Skeleton v-if="loading" width="100%" height="100%" />
            <VChart v-else :option="chartOption" autoresize class="h-full w-full" />
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
