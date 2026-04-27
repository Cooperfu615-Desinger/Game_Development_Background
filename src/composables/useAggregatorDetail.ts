import { ref, onMounted } from 'vue'
import type { Aggregator, AggregatorGameConfig } from '@/types/aggregator'

export function useAggregatorDetail(aggregatorId: string) {
    const aggregator = ref<Aggregator | null>(null)
    const gameConfigs = ref<AggregatorGameConfig[]>([])
    const loadingInfo = ref(false)
    const loadingGames = ref(false)
    const updatingGame = ref<string | null>(null) // 正在更新的 gameId

    // ── 讀取聚合商基本資訊 ───────────────────────────────────────────────────
    const fetchAggregator = async () => {
        loadingInfo.value = true
        try {
            const res = await fetch(`/api/aggregators/${aggregatorId}`)
            if (!res.ok) return
            aggregator.value = await res.json() as Aggregator
        } finally {
            loadingInfo.value = false
        }
    }

    // ── 讀取遊戲配置列表 ─────────────────────────────────────────────────────
    const fetchGameConfigs = async () => {
        loadingGames.value = true
        try {
            const res = await fetch(`/api/aggregators/${aggregatorId}/games`)
            if (!res.ok) return
            const json = await res.json() as { data: AggregatorGameConfig[] }
            gameConfigs.value = json.data
        } finally {
            loadingGames.value = false
        }
    }

    // ── 切換遊戲開放狀態 ─────────────────────────────────────────────────────
    const toggleGameEnabled = async (gameId: string, enabled: boolean) => {
        // 樂觀更新
        gameConfigs.value = gameConfigs.value.map(c =>
            c.gameId === gameId ? { ...c, enabled } : c
        )
        updatingGame.value = gameId
        try {
            await fetch(`/api/aggregators/${aggregatorId}/games/${gameId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled }),
            })
            // 同步更新聚合商的 gameCount
            if (aggregator.value) {
                aggregator.value = {
                    ...aggregator.value,
                    gameCount: gameConfigs.value.filter(c => c.enabled).length,
                }
            }
        } finally {
            updatingGame.value = null
        }
    }

    // ── 更新遊戲的 Bet Range 配置 ────────────────────────────────────────────
    const updateGameConfig = async (
        gameId: string,
        patch: Pick<AggregatorGameConfig, 'enabled' | 'betRanges'>
    ) => {
        updatingGame.value = gameId
        try {
            const res = await fetch(`/api/aggregators/${aggregatorId}/games/${gameId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(patch),
            })
            if (!res.ok) return false
            const updated = await res.json() as AggregatorGameConfig
            gameConfigs.value = gameConfigs.value.map(c =>
                c.gameId === gameId ? updated : c
            )
            if (aggregator.value) {
                aggregator.value = {
                    ...aggregator.value,
                    gameCount: gameConfigs.value.filter(c => c.enabled).length,
                }
            }
            return true
        } finally {
            updatingGame.value = null
        }
    }

    onMounted(() => {
        fetchAggregator()
        fetchGameConfigs()
    })

    return {
        aggregator, gameConfigs,
        loadingInfo, loadingGames, updatingGame,
        fetchAggregator, fetchGameConfigs,
        toggleGameEnabled, updateGameConfig,
    }
}
