import { ref, shallowRef, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { EChartsOption } from 'echarts'
import type { Player, PlayerFilter, OverviewStats, RetentionData } from '@/types/player'

export function usePlayerAnalytics() {
    const route = useRoute()
    const router = useRouter()

    // ── 概況狀態 ───────────────────────────────────
    const overviewStats = ref<OverviewStats | null>(null)
    const dauChartOption = shallowRef({} as EChartsOption)
    const retentionData = ref<RetentionData[]>([])
    const arpuChartOption = shallowRef({} as EChartsOption)

    const loadingOverview = ref(false)
    const loadingRetention = ref(false)
    const loadingArpu = ref(false)

    // ── 玩家列表狀態 ───────────────────────────────
    const players = ref<Player[]>([])
    const total = ref(0)
    const loadingPlayers = ref(false)

    const filters = ref<PlayerFilter>({
        search: (route.query.search as string) ?? '',
        status: (route.query.status as PlayerFilter['status']) ?? undefined,
        country: (route.query.country as string) ?? undefined,
        page: Number(route.query.page ?? 1),
        pageSize: 20
    })

    // ── URL 同步 ───────────────────────────────────
    const syncToUrl = () => {
        const query: Record<string, string> = {}
        if (filters.value.search) query.search = filters.value.search
        if (filters.value.status) query.status = filters.value.status
        if (filters.value.country) query.country = filters.value.country
        if (filters.value.page > 1) query.page = String(filters.value.page)
        router.replace({ query })
    }

    // ── 概況 API ───────────────────────────────────
    const fetchOverview = async (period = '7d') => {
        loadingOverview.value = true
        try {
            const res = await fetch(`/api/analytics/overview?period=${period}`)
            const json = await res.json()
            const { dates, dau, wau, mau, summary } = json.data
            overviewStats.value = summary
            dauChartOption.value = buildDauChart(dates, dau, wau, mau)
        } finally {
            loadingOverview.value = false
        }
    }

    const fetchRetention = async () => {
        loadingRetention.value = true
        try {
            const res = await fetch('/api/analytics/retention')
            const json = await res.json()
            retentionData.value = json.data.items
        } finally {
            loadingRetention.value = false
        }
    }

    const fetchArpu = async () => {
        loadingArpu.value = true
        try {
            const res = await fetch('/api/analytics/arpu')
            const json = await res.json()
            arpuChartOption.value = buildArpuChart(json.data.dates, json.data.arpu)
        } finally {
            loadingArpu.value = false
        }
    }

    // ── 玩家列表 API ───────────────────────────────
    const fetchPlayers = async () => {
        loadingPlayers.value = true
        try {
            const params = new URLSearchParams()
            params.set('page', String(filters.value.page))
            params.set('limit', String(filters.value.pageSize))
            if (filters.value.search) params.set('search', filters.value.search)
            if (filters.value.status) params.set('status', filters.value.status)
            if (filters.value.country) params.set('country', filters.value.country)

            const res = await fetch(`/api/players?${params}`)
            const json = await res.json()
            players.value = json.data.items
            total.value = json.data.total
        } finally {
            loadingPlayers.value = false
        }
    }

    // ── ECharts Option Builders ────────────────────
    const buildDauChart = (dates: string[], dau: number[], wau: number[], mau: number[]): EChartsOption => ({
        tooltip: { trigger: 'axis' },
        legend: { data: ['DAU', 'WAU', 'MAU'], bottom: 0, textStyle: { color: '#9ca3af' } },
        grid: { left: 16, right: 16, top: 16, bottom: 40, containLabel: true },
        xAxis: {
            type: 'category', data: dates,
            axisLabel: { color: '#9ca3af', fontSize: 11 }
        },
        yAxis: {
            type: 'value',
            axisLabel: { color: '#9ca3af', fontSize: 11 },
            splitLine: { lineStyle: { color: '#374151' } }
        },
        series: [
            { name: 'DAU', type: 'line', data: dau, smooth: true, symbol: 'none', lineStyle: { color: '#6366f1' } },
            { name: 'WAU', type: 'line', data: wau, smooth: true, symbol: 'none', lineStyle: { color: '#10b981' } },
            { name: 'MAU', type: 'line', data: mau, smooth: true, symbol: 'none', lineStyle: { color: '#f59e0b' } }
        ]
    })

    const buildArpuChart = (dates: string[], arpu: number[]): EChartsOption => ({
        tooltip: { trigger: 'axis', formatter: (p: unknown) => {
            const pt = (p as Array<{ name: string; value: number }>)[0]
            if (!pt) return ''
            return `${pt.name}<br/>ARPU：$${pt.value.toFixed(2)}`
        }},
        grid: { left: 16, right: 16, top: 16, bottom: 24, containLabel: true },
        xAxis: {
            type: 'category', data: dates,
            axisLabel: { color: '#9ca3af', fontSize: 11 }
        },
        yAxis: {
            type: 'value',
            axisLabel: { color: '#9ca3af', fontSize: 11, formatter: (v: number) => `$${v}` },
            splitLine: { lineStyle: { color: '#374151' } }
        },
        series: [{
            type: 'bar', data: arpu,
            itemStyle: { color: '#6366f1', borderRadius: [4, 4, 0, 0] }
        }]
    })

    // ── 生命週期 ──────────────────────────────────
    onMounted(() => {
        fetchOverview()
        fetchRetention()
        fetchArpu()
    })

    watch(filters, () => {
        syncToUrl()
        fetchPlayers()
    }, { deep: true, immediate: true })

    return {
        overviewStats, dauChartOption, retentionData, arpuChartOption,
        loadingOverview, loadingRetention, loadingArpu,
        players, total, loadingPlayers, filters,
        fetchOverview, fetchRetention, fetchArpu, fetchPlayers
    }
}
