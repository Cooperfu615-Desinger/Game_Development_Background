import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import type { Game, GameFilter } from '@/types/game'
import { exportToCSV } from '@/utils/csvExport'

export function useGameManagement() {
    const route = useRoute()
    const router = useRouter()
    const toast = useToast()
    const confirm = useConfirm()

    // ── 狀態 ──────────────────────────────────────
    const games = ref<Game[]>([])
    const total = ref(0)
    const loading = ref(false)
    const selectedIds = ref<string[]>([])

    const filters = ref<GameFilter>({
        status: (route.query.status as GameFilter['status']) ?? undefined,
        search: (route.query.search as string) ?? '',
        category: (route.query.category as GameFilter['category']) ?? undefined,
        page: Number(route.query.page ?? 1),
        pageSize: 20
    })

    // ── URL 同步 ───────────────────────────────────
    const syncToUrl = () => {
        const query: Record<string, string> = {}
        if (filters.value.status) query.status = filters.value.status
        if (filters.value.search) query.search = filters.value.search
        if (filters.value.category) query.category = filters.value.category
        if (filters.value.page > 1) query.page = String(filters.value.page)
        router.replace({ query })
    }

    // ── 方法 ──────────────────────────────────────
    const fetchGames = async () => {
        loading.value = true
        try {
            const params = new URLSearchParams()
            params.set('page', String(filters.value.page))
            params.set('limit', String(filters.value.pageSize))
            if (filters.value.status) params.set('status', filters.value.status)
            if (filters.value.search) params.set('search', filters.value.search)
            if (filters.value.category) params.set('category', filters.value.category)

            const res = await fetch(`/api/games?${params}`)
            const json = await res.json()
            games.value = json.data.items
            total.value = json.data.total
        } finally {
            loading.value = false
        }
    }

    const updateGame = async (id: string, patch: Partial<Game>): Promise<boolean> => {
        try {
            const res = await fetch(`/api/games/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(patch)
            })
            const json = await res.json()
            if (json.code === 0) {
                const idx = games.value.findIndex(g => g.id === id)
                if (idx !== -1) games.value[idx] = { ...games.value[idx]!, ...patch }
                return true
            }
            return false
        } catch {
            return false
        }
    }

    const toggleStatus = (game: Game) => {
        const next: Game['status'] = game.status === 'active' ? 'inactive' : 'active'
        const label = next === 'active' ? '上架' : '下架'
        confirm.require({
            header: `確認${label}`,
            message: `確定要將「${game.name}」${label}嗎？`,
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: '確認',
            rejectLabel: '取消',
            rejectProps: { severity: 'secondary', outlined: true },
            accept: async () => {
                const ok = await updateGame(game.id, { status: next })
                if (ok) toast.add({ severity: 'success', summary: `已${label}：${game.name}`, life: 1500 })
                else toast.add({ severity: 'error', summary: '操作失敗，請重試', life: 2500 })
            },
        })
    }

    const batchToggle = (status: Game['status']) => {
        if (!selectedIds.value.length) return
        const label = status === 'active' ? '上架' : '下架'
        confirm.require({
            header: `批量${label}`,
            message: `確定要將選取的 ${selectedIds.value.length} 個遊戲${label}嗎？`,
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: '確認',
            rejectLabel: '取消',
            rejectProps: { severity: 'secondary', outlined: true },
            accept: async () => {
                await Promise.all(selectedIds.value.map((id) => updateGame(id, { status })))
                toast.add({ severity: 'success', summary: `已批量${label} ${selectedIds.value.length} 個遊戲`, life: 2000 })
                selectedIds.value = []
            },
        })
    }

    const exportCSV = () => {
        if (!games.value.length) return
        exportToCSV(games.value, 'games-export', {
            id: 'ID',
            name: '遊戲名稱',
            status: '狀態',
            category: '類別',
            rtp: 'RTP (%)',
            version: '版本',
            activeUsers: '活躍玩家',
            publishedAt: '上架時間',
        })
        toast.add({ severity: 'success', summary: 'CSV 已匯出', life: 1500 })
    }

    const resetFilters = () => {
        filters.value = { status: undefined, search: '', category: undefined, page: 1, pageSize: 20 }
    }

    // ── 監聽 filters 同步 URL 並重新抓資料 ──────────
    watch(filters, () => {
        syncToUrl()
        fetchGames()
    }, { deep: true, immediate: true })

    return {
        games,
        total,
        loading,
        filters,
        selectedIds,
        fetchGames,
        toggleStatus,
        batchToggle,
        updateGame,
        exportCSV,
        resetFilters
    }
}
