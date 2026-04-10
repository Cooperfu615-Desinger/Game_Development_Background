<script setup lang="ts">
import { NButton, NIcon } from 'naive-ui'
import { RefreshOutlined } from '@vicons/material'
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
    refreshAll
} = useDashboard()

const formatRevenue = (v: number) =>
    new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(v)
</script>

<template>
    <div class="flex flex-col gap-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div class="ds-page-header flex-1 mr-4">
                <h1>儀表板</h1>
                <p>即時監控 · 遊戲平台總覽</p>
            </div>
            <n-button size="small" @click="refreshAll" :loading="loadingStats">
                <template #icon>
                    <n-icon><RefreshOutlined /></n-icon>
                </template>
                重新整理
            </n-button>
        </div>

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
            <TopGamesTable
                :games="topGames"
                :loading="loadingGames"
            />
        </div>
    </div>
</template>
