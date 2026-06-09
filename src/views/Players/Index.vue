<script setup lang="ts">
import Skeleton from 'primevue/skeleton'
import VChart from 'vue-echarts'
import { usePlayerAnalytics } from '@/composables/usePlayerAnalytics'
import RetentionChart from './components/RetentionChart.vue'
import ArpuChart from './components/ArpuChart.vue'
import PlayerTable from './components/PlayerTable.vue'

const {
    overviewStats,
    dauChartOption,
    retentionData,
    arpuChartOption,
    loadingOverview,
    loadingRetention,
    loadingArpu,
    players,
    total,
    loadingPlayers,
    filters,
} = usePlayerAnalytics()
</script>

<template>
    <div class="hig-page">
        <!-- Header -->
        <header class="hig-page-header">
            <h1 class="hig-page-title">
                <i class="pi pi-user" />
                玩家分析
            </h1>
        </header>

        <!-- Overview Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div class="stat">
                <span class="stat-label">DAU（日活）</span>
                <Skeleton v-if="loadingOverview" width="6rem" height="1.5rem" />
                <span v-else class="stat-value">{{ (overviewStats?.dau ?? 0).toLocaleString() }}</span>
            </div>
            <div class="stat">
                <span class="stat-label">WAU（週活）</span>
                <Skeleton v-if="loadingOverview" width="6rem" height="1.5rem" />
                <span v-else class="stat-value">{{ (overviewStats?.wau ?? 0).toLocaleString() }}</span>
            </div>
            <div class="stat">
                <span class="stat-label">MAU（月活）</span>
                <Skeleton v-if="loadingOverview" width="6rem" height="1.5rem" />
                <span v-else class="stat-value">{{ (overviewStats?.mau ?? 0).toLocaleString() }}</span>
            </div>
            <div class="stat">
                <span class="stat-label">DAU 趨勢</span>
                <Skeleton v-if="loadingOverview" width="5rem" height="1.5rem" />
                <span
                    v-else
                    class="stat-value"
                    :class="(overviewStats?.dauTrend ?? 0) >= 0 ? 'trend-up' : 'trend-down'"
                >
                    {{ (overviewStats?.dauTrend ?? 0) >= 0 ? '↑' : '↓' }}
                    {{ Math.abs(overviewStats?.dauTrend ?? 0).toFixed(1) }}%
                </span>
            </div>
        </div>

        <!-- DAU/WAU/MAU 趨勢圖 -->
        <section class="hig-card chart-card">
            <header class="hig-card-header">
                <h3 class="hig-card-title">活躍用戶趨勢</h3>
            </header>
            <div class="hig-card-body chart-body">
                <Skeleton v-if="loadingOverview" width="100%" height="100%" />
                <VChart v-else :option="dauChartOption" autoresize class="h-full w-full" />
            </div>
        </section>

        <!-- 留存 + ARPU -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RetentionChart :data="retentionData" :loading="loadingRetention" />
            <ArpuChart :option="arpuChartOption" :loading="loadingArpu" />
        </div>

        <!-- 玩家列表 -->
        <section class="hig-card">
            <header class="hig-card-header">
                <h2 class="hig-card-title">玩家列表</h2>
            </header>
            <div class="hig-card-body">
                <PlayerTable
                    :players="players"
                    :total="total"
                    :loading="loadingPlayers"
                    :filters="filters"
                    @update:filters="filters = $event"
                />
            </div>
        </section>
    </div>
</template>

<style scoped>
.stat {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    padding: 0.875rem 1rem;
    background: var(--hig-bg-surface);
    border: 1px solid var(--hig-border-default);
    border-radius: var(--hig-radius-card);
    box-shadow: var(--hig-shadow-sm);
    min-height: 4.5rem;
    justify-content: center;
}
.stat-label {
    font-size: 0.75rem;
    color: var(--hig-text-secondary);
    font-weight: 500;
}
.stat-value {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--hig-text-primary);
    letter-spacing: -0.01em;
    font-variant-numeric: tabular-nums;
    line-height: 1.2;
}
.trend-up {
    color: var(--hig-green);
}
.trend-down {
    color: var(--hig-red);
}

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
