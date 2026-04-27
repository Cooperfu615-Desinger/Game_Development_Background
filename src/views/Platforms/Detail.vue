<!-- src/views/Platforms/Detail.vue -->
<script setup lang="ts">
import { NIcon, NTag, NCard, NBreadcrumb, NBreadcrumbItem } from 'naive-ui'
import { GroupsOutlined } from '@vicons/material'
import { useRoute } from 'vue-router'
import { usePlatformDetail } from '@/composables/usePlatformDetail'
import PlatformStatCards from './components/PlatformStatCards.vue'
import PlatformTrendChart from './components/PlatformTrendChart.vue'
import PlatformPlayerTable from './components/PlatformPlayerTable.vue'

const route = useRoute()
const platformId = route.params.id as string

const {
    platform, stats, trendData, players, total,
    period, search, page,
    loadingStats, loadingTrend, loadingPlayers,
    // loadingPlatform intentionally omitted — platform header renders immediately with null-safe fallback text
} = usePlatformDetail(platformId)

const periodOptions = [
    { label: '本週', value: 'week' },
    { label: '本月', value: 'month' },
]
</script>

<template>
    <div class="flex flex-col gap-6">
        <!-- Breadcrumb -->
        <n-breadcrumb>
            <n-breadcrumb-item href="/platforms">
                平台分析
            </n-breadcrumb-item>
            <n-breadcrumb-item>{{ platform?.name ?? platformId }}</n-breadcrumb-item>
        </n-breadcrumb>

        <!-- Header -->
        <div class="flex items-center justify-between flex-wrap gap-3">
            <div class="flex items-center gap-3">
                <n-icon size="24"><GroupsOutlined /></n-icon>
                <h1 class="text-2xl font-bold">{{ platform?.name ?? '平台詳情' }}</h1>
                <n-tag
                    v-if="platform"
                    :type="platform.status === 'active' ? 'success' : 'default'"
                    size="small"
                    round
                >
                    {{ platform.status === 'active' ? '● 對接中' : '● 未對接' }}
                </n-tag>
                <n-tag
                    v-if="platform"
                    :type="platform.hasAgentSystem ? 'info' : 'default'"
                    size="small"
                >
                    {{ platform.hasAgentSystem ? '有代理系統' : '無代理系統' }}
                </n-tag>
            </div>

            <!-- 週 / 月 Toggle -->
            <div class="flex rounded overflow-hidden border border-gray-600">
                <button
                    v-for="opt in periodOptions"
                    :key="opt.value"
                    class="px-3 py-1 text-sm transition-colors"
                    :class="period === opt.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-transparent text-gray-400 hover:text-white'"
                    @click="period = opt.value as 'week' | 'month'"
                >
                    {{ opt.label }}
                </button>
            </div>
        </div>

        <!-- 8 個數字卡 -->
        <PlatformStatCards :stats="stats" :loading="loadingStats" />

        <!-- 趨勢圖 -->
        <PlatformTrendChart :data="trendData" :loading="loadingTrend" />

        <!-- 玩家列表 -->
        <n-card title="玩家列表">
            <PlatformPlayerTable
                :players="players"
                :total="total"
                :loading="loadingPlayers"
                :has-agent-system="platform?.hasAgentSystem ?? false"
                :search="search"
                :page="page"
                @update:search="search = $event; page = 1"
                @update:page="page = $event"
            />
        </n-card>
    </div>
</template>
