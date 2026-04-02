<script setup lang="ts">
import { NCard, NSkeleton } from 'naive-ui'
import VChart from 'vue-echarts'
import type { EChartsOption } from 'echarts'

defineProps<{
    option: EChartsOption
    loading: boolean
}>()
</script>

<template>
    <n-card title="ARPU 趨勢（近 30 天）" class="h-[360px]">
        <div class="h-[280px]">
            <n-skeleton v-if="loading" class="h-full" />
            <v-chart v-else :option="option" autoresize class="h-full w-full" />
        </div>
    </n-card>
</template>
