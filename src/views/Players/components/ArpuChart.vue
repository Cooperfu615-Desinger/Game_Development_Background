<script setup lang="ts">
import Skeleton from 'primevue/skeleton'
import VChart from 'vue-echarts'
import '@/plugins/echarts'
import type { EChartsOption } from 'echarts'

defineProps<{
    option: EChartsOption
    loading: boolean
}>()
</script>

<template>
    <section class="hig-card arpu-card">
        <header class="hig-card-header">
            <h3 class="hig-card-title">ARPU 趨勢（近 30 天）</h3>
        </header>
        <div class="hig-card-body chart-body">
            <Skeleton v-if="loading" width="100%" height="100%" />
            <VChart v-else :option="option" autoresize class="h-full w-full" />
        </div>
    </section>
</template>

<style scoped>
.arpu-card {
    height: 360px;
    display: flex;
    flex-direction: column;
}
.chart-body {
    flex: 1 1 auto;
    min-height: 0;
}
</style>
