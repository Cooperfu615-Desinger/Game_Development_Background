// src/composables/usePlatformDetail.ts
import { ref, watch, onMounted } from 'vue'
import type { Platform, PlatformStats, TrendPoint, PlatformPlayer } from '@/types/platform'

export function usePlatformDetail(platformId: string) {
    const platform = ref<Platform | null>(null)
    const stats = ref<PlatformStats | null>(null)
    const trendData = ref<TrendPoint[]>([])
    const players = ref<PlatformPlayer[]>([])
    const total = ref(0)

    const period = ref<'week' | 'month'>('month')
    const search = ref('')
    const page = ref(1)

    const loadingPlatform = ref(false)
    const loadingStats = ref(false)
    const loadingTrend = ref(false)
    const loadingPlayers = ref(false)

    const fetchPlatform = async () => {
        loadingPlatform.value = true
        try {
            const res = await fetch(`/api/platforms/${platformId}`)
            if (!res.ok) return
            platform.value = await res.json() as Platform
        } finally {
            loadingPlatform.value = false
        }
    }

    const fetchStats = async () => {
        loadingStats.value = true
        try {
            const res = await fetch(`/api/platforms/${platformId}/stats?period=${period.value}`)
            if (!res.ok) return
            stats.value = await res.json() as PlatformStats
        } finally {
            loadingStats.value = false
        }
    }

    const fetchTrend = async () => {
        loadingTrend.value = true
        try {
            const res = await fetch(`/api/platforms/${platformId}/trend?period=${period.value}`)
            if (!res.ok) return
            trendData.value = await res.json() as TrendPoint[]
        } finally {
            loadingTrend.value = false
        }
    }

    const fetchPlayers = async () => {
        loadingPlayers.value = true
        try {
            const params = new URLSearchParams({
                period: period.value,
                page: String(page.value),
                limit: '20',
            })
            if (search.value) params.set('search', search.value)
            const res = await fetch(`/api/platforms/${platformId}/players?${params}`)
            if (!res.ok) return
            const json = await res.json() as { items: PlatformPlayer[]; total: number }
            players.value = json.items
            total.value = json.total
        } finally {
            loadingPlayers.value = false
        }
    }

    // period 變更：重置頁碼，重新拉取全部數據
    watch(period, () => {
        page.value = 1
        fetchStats()
        fetchTrend()
        fetchPlayers()
    })

    // 搜尋或換頁：只重取玩家列表
    watch([search, page], () => fetchPlayers())

    onMounted(() => {
        fetchPlatform()
        fetchStats()
        fetchTrend()
        fetchPlayers()
    })

    return {
        platform, stats, trendData, players, total,
        period, search, page,
        loadingPlatform, loadingStats, loadingTrend, loadingPlayers,
    }
}
