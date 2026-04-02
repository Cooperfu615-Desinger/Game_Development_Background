<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { 
  NCard, NGrid, NGridItem, NStatistic, 
  useMessage, NTag, NSkeleton, NList, NListItem, NProgress
} from 'naive-ui'
import { useI18n } from 'vue-i18n'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import MoneyText from '../../../components/Common/MoneyText.vue'

// ECharts Composition
use([CanvasRenderer, LineChart, PieChart, GridComponent, TooltipComponent, LegendComponent])

const message = useMessage()
const { t } = useI18n()
const loading = ref(true)

// Data State
const stats = ref({
    total_bet: 0,
    total_ggr: 0,
    rtp: 0,
    active_players: 0,
    total_requests: 0,
    avg_margin: 0,
    trend: [] as any[],
    provider_share: [] as any[],
    top_merchants: [] as any[],
    top_games: [] as any[],
    system_health: [] as any[]
})

// Line Chart (Revenue)
const lineOption = computed(() => ({
    tooltip: { trigger: 'axis' },
    legend: { data: [t('dashboard.totalGGR'), t('dashboard.totalBet')], bottom: 0, textStyle: { color: '#ccc' } },
    grid: { left: '3%', right: '4%', bottom: '10%', top: '3%', containLabel: true },
    xAxis: { 
        type: 'category', 
        data: stats.value.trend.map(t => t.date),
        axisLine: { lineStyle: { color: '#555' } }
    },
    yAxis: { 
        type: 'value',
        axisLine: { lineStyle: { color: '#555' } },
        splitLine: { lineStyle: { color: '#333' } }
    },
    series: [
        {
            name: t('dashboard.totalGGR'),
            type: 'line',
            data: stats.value.trend.map(t => t.ggr),
            smooth: true,
            itemStyle: { color: '#63e2b7' },
            areaStyle: { opacity: 0.1, color: '#63e2b7' }
        },
        {
            name: t('dashboard.totalBet'),
            type: 'line',
            data: stats.value.trend.map(t => t.bet),
            smooth: true,
            itemStyle: { color: '#70c0e8' }
        }
    ]
}))

// Pie Chart (Provider Share)
const pieOption = computed(() => ({
    tooltip: { trigger: 'item' },
    legend: { orient: 'horizontal', bottom: 0, textStyle: { color: '#ccc' } },
    series: [
        {
            name: t('dashboard.providerShare'),
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 5,
                borderColor: '#1e1e1e',
                borderWidth: 2
            },
            label: { show: false, position: 'center' },
            emphasis: {
                label: { show: true, fontSize: 20, fontWeight: 'bold', color: '#fff' }
            },
            labelLine: { show: false },
            data: stats.value.provider_share
        }
    ]
}))

const fetchDashboard = async () => {
    try {
        const res = await fetch('/api/v2/report/dashboard')
        const data = await res.json()
        if (data.code === 0) {
            stats.value = data.data
        }
    } catch (e) {
        message.error(t('dashboard.loadError'))
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchDashboard()
})
</script>

<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
       <h1 class="text-2xl font-bold flex items-center gap-2">
           <span>🛸</span> {{ t('dashboard.warRoom') }}
       </h1>
       <n-tag type="success" size="small" extract bordered>
           🟢 {{ t('dashboard.realTime') }}
       </n-tag>
    </div>

    <!-- Row 1: KPI Cards -->
    <n-grid x-gap="12" y-gap="12" cols="1 s:2 m:4" responsive="screen">
        <!-- GGR -->
        <n-grid-item>
             <n-card size="small" :class="stats.total_ggr >= 0 ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'">
                 <div class="text-sm text-gray-400 mb-1">{{ t('dashboard.totalGGR') }}</div>
                <div v-if="loading" class="h-8 flex items-center">
                    <n-skeleton text width="50%" />
                </div>
                <div v-else class="text-2xl font-bold">
                    <MoneyText :value="stats.total_ggr" currency="USD" />
                </div>
            </n-card>
        </n-grid-item>
        <!-- Active Players -->
        <n-grid-item>
            <n-card size="small">
                <div v-if="loading" class="h-10 flex items-center">
                    <n-skeleton text width="60%" />
                </div>
                <n-statistic v-else :label="t('dashboard.activePlayers')" :value="stats.active_players">
                    <template #suffix>👤</template>
                </n-statistic>
            </n-card>
        </n-grid-item>
        <!-- Total Requests -->
        <n-grid-item>
            <n-card size="small">
                <div v-if="loading" class="h-10 flex items-center">
                    <n-skeleton text width="60%" />
                </div>
                <n-statistic v-else :label="t('dashboard.requests')" :value="stats.total_requests">
                    <template #suffix>{{ t('dashboard.reqs') }}</template>
                </n-statistic>
            </n-card>
        </n-grid-item>
        <!-- Avg Margin -->
        <n-grid-item>
            <n-card size="small">
                 <div v-if="loading" class="h-10 flex items-center">
                    <n-skeleton text width="60%" />
                </div>
                <n-statistic v-else :label="t('dashboard.avgMargin')" :value="stats.avg_margin">
                    <template #suffix>%</template>
                </n-statistic>
            </n-card>
        </n-grid-item>
    </n-grid>

    <!-- Row 2: Charts -->
    <n-grid x-gap="12" y-gap="12" cols="1 m:3" responsive="screen">
        <!-- Line Chart (2/3 width) -->
        <n-grid-item span="2">
            <n-card :title="t('dashboard.revenueTrend')" size="small">
                <div class="h-[300px] w-full">
                    <n-skeleton v-if="loading" text :repeat="5" />
                    <v-chart v-else class="chart" :option="lineOption" autoresize />
                </div>
            </n-card>
        </n-grid-item>
        <!-- Pie Chart (1/3 width) -->
        <n-grid-item>
            <n-card :title="t('dashboard.providerShare')" size="small">
                <div class="h-[300px] w-full">
                    <n-skeleton v-if="loading" circle size="medium" />
                    <v-chart v-else class="chart" :option="pieOption" autoresize />
                </div>
            </n-card>
        </n-grid-item>
    </n-grid>

    <!-- Row 3: Top Lists & Health -->
    <n-grid x-gap="12" y-gap="12" cols="1 m:3" responsive="screen">
        <!-- Top Merchants -->
        <n-grid-item>
            <n-card :title="t('dashboard.topMerchants')" size="small">
                <n-list v-if="loading">
                    <n-list-item v-for="i in 5" :key="i">
                         <div class="flex justify-between">
                            <n-skeleton text width="40%" />
                            <n-skeleton text width="20%" />
                         </div>
                    </n-list-item>
                </n-list>
                <n-list hoverable v-else>
                    <n-list-item v-for="(m, i) in stats.top_merchants" :key="i">
                        <div class="flex justify-between">
                            <span>{{ i + 1 }}. {{ m.name }}</span>
                            <MoneyText :value="m.ggr" currency="USD" />
                        </div>
                    </n-list-item>
                </n-list>
            </n-card>
        </n-grid-item>

        <!-- Top Games -->
         <n-grid-item>
            <n-card :title="t('dashboard.topGames')" size="small">
                 <n-list v-if="loading">
                    <n-list-item v-for="i in 5" :key="i">
                         <div class="flex justify-between">
                            <n-skeleton text width="40%" />
                            <n-skeleton text width="20%" />
                         </div>
                    </n-list-item>
                </n-list>
                 <n-list hoverable v-else>
                    <n-list-item v-for="(g, i) in stats.top_games" :key="i">
                        <div class="flex justify-between">
                            <span>{{ i + 1 }}. {{ g.name }}</span>
                            <span class="font-mono text-gray-400">{{ g.bet_count.toLocaleString() }}</span>
                        </div>
                    </n-list-item>
                </n-list>
            </n-card>
        </n-grid-item>

        <!-- System Health -->
        <n-grid-item>
            <n-card :title="t('dashboard.systemHealth')" size="small">
                <n-list>
                    <n-list-item v-for="h in stats.system_health" :key="h.provider">
                        <div class="flex items-center justify-between mb-2">
                            <span class="font-bold">{{ h.provider }}</span>
                            <n-tag 
                                :type="h.status === 'healthy' ? 'success' : h.status === 'warning' ? 'warning' : 'error'" 
                                size="small"
                                round
                            >
                                {{ h.latency > 0 ? h.latency + ' ms' : 'TIMEOUT' }}
                            </n-tag>
                        </div>
                        <n-progress 
                            type="line" 
                            :percentage="h.status === 'healthy' ? 100 : h.status === 'warning' ? 80 : 30" 
                            :status="h.status === 'healthy' ? 'success' : h.status === 'warning' ? 'warning' : 'error'"
                            :show-indicator="false"
                            processing
                        />
                    </n-list-item>
                </n-list>
            </n-card>
        </n-grid-item>
    </n-grid>
  </div>
</template>

<style scoped>
.chart {
  height: 100%;
  width: 100%;
}
</style>
