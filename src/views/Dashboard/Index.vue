<script setup lang="ts">
import Button from 'primevue/button'
import { useDashboard } from '@/composables/useDashboard'
import StatCard from './components/StatCard.vue'
import RevenueTrendChart from './components/RevenueTrendChart.vue'
import TopGamesTable from './components/TopGamesTable.vue'

const {
    stats,
    topGames,
    revenueChartOption,
    period,
    loadingStats,
    loadingChart,
    loadingGames,
    changePeriod,
    refreshAll,
} = useDashboard()

const formatRevenue = (v: number) =>
    new Intl.NumberFormat('zh-TW', {
        style: 'currency',
        currency: 'TWD',
        maximumFractionDigits: 0,
    }).format(v)
</script>

<template>
    <div class="hig-page">
        <!-- Header -->
        <header class="hig-page-header">
            <div>
                <h1 class="hig-page-title">
                    <i class="pi pi-home" />
                    儀表板
                </h1>
                <p class="hig-page-subtitle">即時監控 · 遊戲平台總覽</p>
            </div>
            <Button
                label="重新整理"
                icon="pi pi-refresh"
                severity="secondary"
                outlined
                size="small"
                :loading="loadingStats"
                @click="refreshAll"
            />
        </header>

        <!-- Stat Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                label="活躍玩家"
                :value="stats ? stats.activePlayers.toLocaleString() : '—'"
                :trend="stats?.activePlayersTrend"
                :loading="loadingStats"
                icon="👥"
            />
            <StatCard
                label="今日營收"
                :value="stats ? formatRevenue(stats.todayRevenue) : '—'"
                :trend="stats?.todayRevenueTrend"
                :loading="loadingStats"
                icon="💰"
            />
            <StatCard
                label="周增長率"
                :value="stats ? `${stats.weeklyGrowth.toFixed(1)}%` : '—'"
                :trend="stats?.weeklyGrowth"
                :loading="loadingStats"
                icon="📈"
            />
            <StatCard
                label="當前在線"
                :value="stats ? stats.onlinePlayers.toLocaleString() : '—'"
                :loading="loadingStats"
                icon="🟢"
            />
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RevenueTrendChart
                :option="revenueChartOption"
                :period="period"
                :loading="loadingChart"
                @change-period="changePeriod"
            />
            <TopGamesTable :games="topGames" :loading="loadingGames" />
        </div>
    </div>
</template>
