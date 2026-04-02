import { ref, shallowRef, computed, onMounted, onUnmounted } from 'vue'
import type { EChartsOption } from 'echarts'
import type { DashboardStats, TopGame, RevenuePeriod } from '@/types/dashboard'

const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes

export function useDashboard() {
    // ── 狀態 ──────────────────────────────────────
    const stats = ref<DashboardStats | null>(null)
    const topGames = ref<TopGame[]>([])
    const revenueChartOption = shallowRef({} as EChartsOption)
    const period = ref<RevenuePeriod>('7d')

    const loadingStats = ref(false)
    const loadingChart = ref(false)
    const loadingGames = ref(false)

    let refreshTimer: ReturnType<typeof setInterval> | null = null

    // ── 計算屬性 ──────────────────────────────────
    const loading = computed(() => loadingStats.value || loadingChart.value || loadingGames.value)

    // ── 方法 ──────────────────────────────────────
    const fetchStats = async () => {
        loadingStats.value = true
        try {
            const res = await fetch('/api/dashboard/stats')
            const json = await res.json()
            stats.value = json.data
        } finally {
            loadingStats.value = false
        }
    }

    const fetchRevenue = async (p: RevenuePeriod = period.value) => {
        loadingChart.value = true
        try {
            const res = await fetch(`/api/dashboard/revenue?period=${p}`)
            const json = await res.json()
            const { dates, values } = json.data
            revenueChartOption.value = buildChartOption(dates, values)
        } finally {
            loadingChart.value = false
        }
    }

    const fetchTopGames = async () => {
        loadingGames.value = true
        try {
            const res = await fetch('/api/dashboard/top-games')
            const json = await res.json()
            topGames.value = json.data.items
        } finally {
            loadingGames.value = false
        }
    }

    const changePeriod = (p: RevenuePeriod) => {
        period.value = p
        fetchRevenue(p)
    }

    const refreshAll = () => {
        fetchStats()
        fetchRevenue()
        fetchTopGames()
    }

    // ── ECharts Option Builder ─────────────────────
    const buildChartOption = (dates: string[], values: number[]): EChartsOption => ({
        tooltip: {
            trigger: 'axis',
            formatter: (params: unknown) => {
                const p = (params as Array<{ name: string; value: number }>)[0]
                if (!p) return ''
                return `${p.name}<br/>營收：${p.value.toLocaleString()}`
            }
        },
        grid: { left: 16, right: 16, top: 16, bottom: 24, containLabel: true },
        xAxis: {
            type: 'category',
            data: dates,
            axisLine: { lineStyle: { color: '#4b5563' } },
            axisLabel: { color: '#9ca3af', fontSize: 11 }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                color: '#9ca3af',
                fontSize: 11,
                formatter: (v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)
            },
            splitLine: { lineStyle: { color: '#374151' } }
        },
        series: [{
            type: 'line',
            data: values,
            smooth: true,
            symbol: 'none',
            lineStyle: { color: '#6366f1', width: 2 },
            areaStyle: {
                color: {
                    type: 'linear',
                    x: 0, y: 0, x2: 0, y2: 1,
                    colorStops: [
                        { offset: 0, color: 'rgba(99,102,241,0.3)' },
                        { offset: 1, color: 'rgba(99,102,241,0)' }
                    ]
                }
            }
        }]
    })

    // ── 生命週期 ──────────────────────────────────
    onMounted(() => {
        refreshAll()
        refreshTimer = setInterval(refreshAll, AUTO_REFRESH_INTERVAL)
    })

    onUnmounted(() => {
        if (refreshTimer) clearInterval(refreshTimer)
    })

    return {
        stats,
        topGames,
        revenueChartOption,
        period,
        loading,
        loadingStats,
        loadingChart,
        loadingGames,
        changePeriod,
        refreshAll
    }
}
