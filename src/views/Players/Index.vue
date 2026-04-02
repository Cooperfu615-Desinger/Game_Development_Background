<script setup lang="ts">
import { NCard, NStatistic, NSkeleton, NIcon } from 'naive-ui'
import { PeopleAltOutlined } from '@vicons/material'
import VChart from 'vue-echarts'
import { usePlayerAnalytics } from '@/composables/usePlayerAnalytics'
import RetentionChart from './components/RetentionChart.vue'
import ArpuChart from './components/ArpuChart.vue'
import PlayerTable from './components/PlayerTable.vue'

const {
    overviewStats, dauChartOption, retentionData, arpuChartOption,
    loadingOverview, loadingRetention, loadingArpu,
    players, total, loadingPlayers, filters
} = usePlayerAnalytics()
</script>

<template>
    <div class="flex flex-col gap-6">
        <!-- Header -->
        <div class="flex items-center gap-2">
            <n-icon size="24"><PeopleAltOutlined /></n-icon>
            <h1 class="text-2xl font-bold">玩家分析</h1>
        </div>

        <!-- Overview Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <n-card class="h-[100px]">
                <n-skeleton v-if="loadingOverview" text :width="80" />
                <n-statistic v-else label="DAU（日活）" :value="overviewStats?.dau ?? 0" />
            </n-card>
            <n-card class="h-[100px]">
                <n-skeleton v-if="loadingOverview" text :width="80" />
                <n-statistic v-else label="WAU（週活）" :value="overviewStats?.wau ?? 0" />
            </n-card>
            <n-card class="h-[100px]">
                <n-skeleton v-if="loadingOverview" text :width="80" />
                <n-statistic v-else label="MAU（月活）" :value="overviewStats?.mau ?? 0" />
            </n-card>
            <n-card class="h-[100px]">
                <n-skeleton v-if="loadingOverview" text :width="80" />
                <n-statistic
                    v-else
                    label="DAU 趨勢"
                    :value="Math.abs(overviewStats?.dauTrend ?? 0)"
                    suffix="%"
                />
            </n-card>
        </div>

        <!-- DAU/WAU/MAU 趨勢圖 -->
        <n-card title="活躍用戶趨勢" class="h-[360px]">
            <div class="h-[280px]">
                <n-skeleton v-if="loadingOverview" class="h-full" />
                <v-chart v-else :option="dauChartOption" autoresize class="h-full w-full" />
            </div>
        </n-card>

        <!-- 留存 + ARPU -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RetentionChart :data="retentionData" :loading="loadingRetention" />
            <ArpuChart :option="arpuChartOption" :loading="loadingArpu" />
        </div>

        <!-- 玩家列表 -->
        <n-card title="玩家列表">
            <PlayerTable
                :players="players"
                :total="total"
                :loading="loadingPlayers"
                :filters="filters"
                @update:filters="filters = $event"
            />
        </n-card>
    </div>
</template>
