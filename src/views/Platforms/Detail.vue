<script setup lang="ts">
import Breadcrumb from 'primevue/breadcrumb'
import Tag from 'primevue/tag'
import SelectButton from 'primevue/selectbutton'
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import { usePlatformDetail } from '@/composables/usePlatformDetail'
import PlatformStatCards from './components/PlatformStatCards.vue'
import PlatformTrendChart from './components/PlatformTrendChart.vue'
import PlatformPlayerTable from './components/PlatformPlayerTable.vue'

const route = useRoute()
const router = useRouter()
const platformId = route.params.id as string

const {
    platform,
    stats,
    trendData,
    players,
    total,
    period,
    search,
    page,
    loadingStats,
    loadingTrend,
    loadingPlayers,
} = usePlatformDetail(platformId)

const periodOptions = [
    { label: '本週', value: 'week' },
    { label: '本月', value: 'month' },
]

const breadcrumbHome = { icon: 'pi pi-home', route: '/' }
const breadcrumbItems = computed(() => [
    { label: '平台分析', route: '/platforms' },
    { label: platform.value?.name ?? platformId },
])

const onBreadcrumbItemClick = (item: { route?: string }) => {
    if (item.route) router.push(item.route)
}

const onPeriodChange = (v: 'week' | 'month' | null) => {
    if (v) period.value = v
}

const onSearchUpdate = (v: string) => {
    search.value = v
    page.value = 1
}
</script>

<template>
    <div class="hig-page">
        <!-- Breadcrumb -->
        <Breadcrumb
            :model="breadcrumbItems"
            :home="breadcrumbHome"
            :pt="{ root: { class: 'border-0 px-0 bg-transparent' } }"
        >
            <template #item="{ item }">
                <span
                    class="breadcrumb-link"
                    :class="{ 'cursor-pointer': item.route }"
                    @click="onBreadcrumbItemClick(item)"
                >
                    {{ item.label }}
                </span>
            </template>
        </Breadcrumb>

        <!-- Header -->
        <header class="hig-page-header">
            <div class="flex items-center gap-3 flex-wrap">
                <h1 class="hig-page-title">
                    <i class="pi pi-users" />
                    {{ platform?.name ?? '平台詳情' }}
                </h1>
                <Tag
                    v-if="platform"
                    :severity="platform.status === 'active' ? 'success' : 'secondary'"
                    :value="platform.status === 'active' ? '● 對接中' : '● 未對接'"
                    rounded
                />
                <Tag
                    v-if="platform"
                    :severity="platform.hasAgentSystem ? 'info' : 'secondary'"
                    :value="platform.hasAgentSystem ? '有代理系統' : '無代理系統'"
                />
            </div>

            <SelectButton
                :model-value="period"
                :options="periodOptions"
                option-label="label"
                option-value="value"
                :allow-empty="false"
                @update:model-value="onPeriodChange"
            />
        </header>

        <!-- 8 個數字卡 -->
        <PlatformStatCards :stats="stats" :loading="loadingStats" />

        <!-- 趨勢圖 -->
        <PlatformTrendChart :data="trendData" :loading="loadingTrend" />

        <!-- 玩家列表 -->
        <section class="hig-card">
            <header class="hig-card-header">
                <h2 class="hig-card-title">玩家列表</h2>
            </header>
            <div class="hig-card-body">
                <PlatformPlayerTable
                    :players="players"
                    :total="total"
                    :loading="loadingPlayers"
                    :has-agent-system="platform?.hasAgentSystem ?? false"
                    :search="search"
                    :page="page"
                    @update:search="onSearchUpdate"
                    @update:page="(v) => (page = v)"
                />
            </div>
        </section>
    </div>
</template>

<style scoped>
.breadcrumb-link {
    color: var(--hig-text-secondary);
    transition: color var(--hig-duration-fast) var(--hig-ease);
}
.breadcrumb-link.cursor-pointer:hover {
    color: var(--hig-blue);
}
</style>
