import Big from 'big.js'
import { delay, http, HttpResponse } from 'msw'
import type { ProviderGameRound, ProviderGameRoundStatus } from '@/types/gameRound'
import { compareProviderGameRounds, isProviderGameRoundSortField, type ProviderGameRoundSortOrder } from '@/utils/gameRoundSort'

interface RoundSeed {
    roundId: string
    externalRoundId: string
    gameId: string
    gameName: string
    gameType: ProviderGameRound['game_type']
    gameVersion: string
    releaseId: string
    agentId: string
    agentName: string
    memberId: string
    betPoints: string
    payoutPoints: string
    pointsPerUsdt: string
    startedAt?: string | null
    settledAt?: string | null
    createdAt: string
    updatedAt: string
    status: ProviderGameRoundStatus
    statusDescription: string
    exceptionReason?: string | null
    retryCount?: number
}

const providerId = 'provider-lucky-lab'

function buildRound(seed: RoundSeed): ProviderGameRound {
    const bet = new Big(seed.betPoints)
    const payout = new Big(seed.payoutPoints)
    const netResult = payout.minus(bet)
    const rate = new Big(seed.pointsPerUsdt)
    const snapshotKey = `${seed.gameId}-${seed.gameVersion}`.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()
    const bettingStructure = seed.gameType === 'slots'
        ? 'Total Bet = Bet Level × Coin Value × Bet Multiplier'
        : seed.gameType === 'table'
            ? 'Total Bet = selected area stakes total'
            : 'Total Bet = stake amount'
    const theoreticalRtp = seed.gameType === 'table' ? '98.90' : seed.gameType === 'crash' ? '97.00' : '96.20'
    const limitPlan = Number(seed.betPoints) >= 500 ? 'LIMIT-HIGH-HIST' : 'LIMIT-STD-HIST'

    return {
        round_id: seed.roundId,
        external_round_id: seed.externalRoundId,
        provider_id: providerId,
        game_id: seed.gameId,
        game_name: seed.gameName,
        game_type: seed.gameType,
        game_version: seed.gameVersion,
        build_id: `build-${snapshotKey}`,
        release_id: seed.releaseId,
        settings_snapshot_id: `settings-${snapshotKey}`,
        math_snapshot_id: `math-${snapshotKey}`,
        asset_bundle_id: `assets-${snapshotKey}`,
        theoretical_rtp: theoreticalRtp,
        betting_structure_id: seed.gameType === 'slots' ? 'BET-STRUCT-SLOT-HIST' : seed.gameType === 'table' ? 'BET-STRUCT-TABLE-HIST' : 'BET-STRUCT-CRASH-HIST',
        betting_structure_snapshot: bettingStructure,
        currency_multiplier_id: 'CUR-MAP-HIST-001',
        currency_multiplier_snapshot: 'USDT × 1；USD × 1；TWD × 30；VND × 2000',
        limit_plan_id: limitPlan,
        limit_plan_snapshot: limitPlan === 'LIMIT-HIGH-HIST' ? '1–500 USDT；派彩上限 50,000 USDT' : '0.1–100 USDT；派彩上限 10,000 USDT',
        snapshot_created_at: seed.createdAt,
        agent_id: seed.agentId,
        agent_name: seed.agentName,
        member_id: seed.memberId,
        currency: 'USDT',
        request_id: `req-${seed.roundId.replace('round-', '')}`,
        environment: 'production',
        bet_points: bet.toFixed(2),
        payout_points: payout.toFixed(2),
        net_result_points: netResult.toFixed(2),
        bet_usdt: bet.div(rate).toFixed(2),
        payout_usdt: payout.div(rate).toFixed(2),
        net_result_usdt: netResult.div(rate).toFixed(2),
        conversion_rule_id: `points-usdt-${seed.pointsPerUsdt.replace('.', '-')}-v3`,
        conversion_rate: seed.pointsPerUsdt,
        conversion_rule: `${seed.pointsPerUsdt} 點 = 1.00 USDT；沿用結算當下規則`,
        started_at: seed.startedAt ?? null,
        settled_at: seed.settledAt ?? null,
        created_at: seed.createdAt,
        updated_at: seed.updatedAt,
        status: seed.status,
        status_description: seed.statusDescription,
        exception_reason: seed.exceptionReason ?? null,
        retry_count: seed.retryCount ?? 0,
    }
}

// 專用 Provider Game Round mock；不共用 orders、transactions 或舊報表語意。
const mockGameRounds: ProviderGameRound[] = [
    buildRound({
        roundId: 'round-20260805-0098', externalRoundId: 'ggap-r-8f31a9', gameId: 'slot-orbit', gameName: '星際寶藏', gameType: 'slots', gameVersion: '3.8.1', releaseId: 'rel-20260718-03', agentId: 'agent-a031', agentName: '北辰娛樂代理', memberId: 'member-8e72a1', betPoints: '100', payoutPoints: '260', pointsPerUsdt: '100', startedAt: null, settledAt: '2026-08-05T15:18:42+08:00', createdAt: '2026-08-05T15:18:39+08:00', updatedAt: '2026-08-05T15:18:42+08:00', status: 'settled', statusDescription: '已完成遊戲結果與點數結算。',
    }),
    buildRound({
        roundId: 'round-20260805-0097', externalRoundId: 'ggap-r-7c20dd', gameId: 'crash-solo', gameName: 'Skyline Crash', gameType: 'crash', gameVersion: '2.4.0', releaseId: 'rel-20260730-01', agentId: 'agent-b204', agentName: '曜石通路', memberId: 'member-19b44c', betPoints: '500', payoutPoints: '125', pointsPerUsdt: '100', startedAt: '2026-08-05T15:14:10+08:00', settledAt: '2026-08-05T15:14:18+08:00', createdAt: '2026-08-05T15:14:10+08:00', updatedAt: '2026-08-05T15:14:18+08:00', status: 'settled', statusDescription: '已完成遊戲結果與點數結算。',
    }),
    buildRound({
        roundId: 'round-20260805-0096', externalRoundId: 'ggap-r-69b115', gameId: 'mini-burst', gameName: 'Mini Burst', gameType: 'crash', gameVersion: '1.9.2', releaseId: 'rel-20260712-02', agentId: 'agent-a031', agentName: '北辰娛樂代理', memberId: 'member-4af012', betPoints: '80', payoutPoints: '144', pointsPerUsdt: '80', startedAt: null, settledAt: '2026-08-05T15:07:03+08:00', createdAt: '2026-08-05T15:07:01+08:00', updatedAt: '2026-08-05T15:07:03+08:00', status: 'settled', statusDescription: '已完成遊戲結果與點數結算。',
    }),
    buildRound({
        roundId: 'round-20260805-0095', externalRoundId: 'ggap-r-4e5f80', gameId: 'slot-crown', gameName: 'Crown of Fortune', gameType: 'slots', gameVersion: '4.1.0', releaseId: 'rel-20260726-04', agentId: 'agent-c118', agentName: '流光遊戲通路', memberId: 'member-770cd8', betPoints: '250', payoutPoints: '0', pointsPerUsdt: '100', startedAt: null, settledAt: '2026-08-05T14:52:27+08:00', createdAt: '2026-08-05T14:52:24+08:00', updatedAt: '2026-08-05T14:52:27+08:00', status: 'settled', statusDescription: '已完成遊戲結果與點數結算。',
    }),
    buildRound({
        roundId: 'round-20260805-0094', externalRoundId: 'ggap-r-228a31', gameId: 'slot-neon', gameName: 'Neon Fruits', gameType: 'slots', gameVersion: '2.7.5', releaseId: 'rel-20260709-01', agentId: 'agent-b204', agentName: '曜石通路', memberId: 'member-31f08e', betPoints: '120', payoutPoints: '360', pointsPerUsdt: '100', startedAt: null, settledAt: '2026-08-05T14:31:56+08:00', createdAt: '2026-08-05T14:31:53+08:00', updatedAt: '2026-08-05T14:31:56+08:00', status: 'settled', statusDescription: '已完成遊戲結果與點數結算。',
    }),
    buildRound({
        roundId: 'round-20260805-0093', externalRoundId: 'ggap-r-0ba7e2', gameId: 'crash-solo', gameName: 'Skyline Crash', gameType: 'crash', gameVersion: '2.4.0', releaseId: 'rel-20260730-01', agentId: 'agent-c118', agentName: '流光遊戲通路', memberId: 'member-6ab7f2', betPoints: '1000', payoutPoints: '1750', pointsPerUsdt: '100', startedAt: '2026-08-05T14:12:28+08:00', settledAt: '2026-08-05T14:12:45+08:00', createdAt: '2026-08-05T14:12:28+08:00', updatedAt: '2026-08-05T14:12:45+08:00', status: 'settled', statusDescription: '已完成遊戲結果與點數結算。',
    }),
    buildRound({
        roundId: 'round-20260805-0092', externalRoundId: 'ggap-r-f1c4a6', gameId: 'slot-orbit', gameName: '星際寶藏', gameType: 'slots', gameVersion: '3.8.1', releaseId: 'rel-20260718-03', agentId: 'agent-a031', agentName: '北辰娛樂代理', memberId: 'member-0c72fe', betPoints: '50', payoutPoints: '20', pointsPerUsdt: '100', startedAt: null, settledAt: '2026-08-05T13:59:18+08:00', createdAt: '2026-08-05T13:59:16+08:00', updatedAt: '2026-08-05T13:59:18+08:00', status: 'settled', statusDescription: '已完成遊戲結果與點數結算。',
    }),
    buildRound({
        roundId: 'round-20260805-0091', externalRoundId: 'ggap-r-c54d11', gameId: 'mini-burst', gameName: 'Mini Burst', gameType: 'crash', gameVersion: '1.9.2', releaseId: 'rel-20260712-02', agentId: 'agent-b204', agentName: '曜石通路', memberId: 'member-82a912', betPoints: '200', payoutPoints: '420', pointsPerUsdt: '80', startedAt: null, settledAt: '2026-08-05T13:44:05+08:00', createdAt: '2026-08-05T13:44:02+08:00', updatedAt: '2026-08-05T13:44:05+08:00', status: 'settled', statusDescription: '已完成遊戲結果與點數結算。',
    }),
    buildRound({
        roundId: 'round-20260805-0090', externalRoundId: 'ggap-r-8d9a4c', gameId: 'slot-crown', gameName: 'Crown of Fortune', gameType: 'slots', gameVersion: '4.1.0', releaseId: 'rel-20260726-04', agentId: 'agent-c118', agentName: '流光遊戲通路', memberId: 'member-a340c1', betPoints: '300', payoutPoints: '210', pointsPerUsdt: '100', startedAt: null, settledAt: '2026-08-05T13:21:33+08:00', createdAt: '2026-08-05T13:21:31+08:00', updatedAt: '2026-08-05T13:21:33+08:00', status: 'settled', statusDescription: '已完成遊戲結果與點數結算。',
    }),
    buildRound({
        roundId: 'round-20260805-0089', externalRoundId: 'ggap-r-771d08', gameId: 'slot-neon', gameName: 'Neon Fruits', gameType: 'slots', gameVersion: '2.7.5', releaseId: 'rel-20260709-01', agentId: 'agent-a031', agentName: '北辰娛樂代理', memberId: 'member-5a8b6d', betPoints: '75', payoutPoints: '105', pointsPerUsdt: '100', startedAt: null, settledAt: '2026-08-05T12:58:47+08:00', createdAt: '2026-08-05T12:58:44+08:00', updatedAt: '2026-08-05T12:58:47+08:00', status: 'settled', statusDescription: '已完成遊戲結果與點數結算。',
    }),
    buildRound({
        roundId: 'round-20260805-0088', externalRoundId: 'ggap-r-5e21fb', gameId: 'crash-solo', gameName: 'Skyline Crash', gameType: 'crash', gameVersion: '2.4.0', releaseId: 'rel-20260730-01', agentId: 'agent-c118', agentName: '流光遊戲通路', memberId: 'member-2d6e9a', betPoints: '400', payoutPoints: '0', pointsPerUsdt: '100', startedAt: '2026-08-05T12:44:18+08:00', settledAt: null, createdAt: '2026-08-05T12:44:18+08:00', updatedAt: '2026-08-05T12:44:26+08:00', status: 'cancelled', statusDescription: '該局在結算前被取消，不形成有效結算。', exceptionReason: 'GGAP 在結算窗口內取消本局。',
    }),
    buildRound({
        roundId: 'round-20260805-0087', externalRoundId: 'ggap-r-3c91aa', gameId: 'mini-burst', gameName: 'Mini Burst', gameType: 'crash', gameVersion: '1.9.2', releaseId: 'rel-20260712-02', agentId: 'agent-b204', agentName: '曜石通路', memberId: 'member-bb08d1', betPoints: '160', payoutPoints: '160', pointsPerUsdt: '80', startedAt: null, settledAt: '2026-08-05T12:29:03+08:00', createdAt: '2026-08-05T12:28:58+08:00', updatedAt: '2026-08-05T12:29:06+08:00', status: 'rollback', statusDescription: '原已結算，後續依補償流程沖回。', exceptionReason: '結算回呼重複，已依 audit 流程回滾。', retryCount: 1,
    }),
    buildRound({
        roundId: 'round-20260805-0086', externalRoundId: 'ggap-r-1f0e45', gameId: 'slot-orbit', gameName: '星際寶藏', gameType: 'slots', gameVersion: '3.8.1', releaseId: 'rel-20260718-03', agentId: 'agent-a031', agentName: '北辰娛樂代理', memberId: 'member-947ad0', betPoints: '90', payoutPoints: '0', pointsPerUsdt: '100', startedAt: null, settledAt: null, createdAt: '2026-08-05T12:10:12+08:00', updatedAt: '2026-08-05T12:10:20+08:00', status: 'failed', statusDescription: '結算流程發生錯誤，等待重試或人工補處理。', exceptionReason: 'Provider settlement callback timeout。', retryCount: 2,
    }),
    buildRound({
        roundId: 'round-20260805-0085', externalRoundId: 'ggap-r-0d631c', gameId: 'slot-crown', gameName: 'Crown of Fortune', gameType: 'slots', gameVersion: '4.1.0', releaseId: 'rel-20260726-04', agentId: 'agent-c118', agentName: '流光遊戲通路', memberId: 'member-1bb8e2', betPoints: '180', payoutPoints: '360', pointsPerUsdt: '100', startedAt: null, settledAt: '2026-08-04T23:48:39+08:00', createdAt: '2026-08-04T23:48:35+08:00', updatedAt: '2026-08-04T23:48:39+08:00', status: 'settled', statusDescription: '已完成遊戲結果與點數結算。',
    }),
    buildRound({
        roundId: 'round-20260804-0084', externalRoundId: 'ggap-r-a08bf2', gameId: 'slot-neon', gameName: 'Neon Fruits', gameType: 'slots', gameVersion: '2.7.5', releaseId: 'rel-20260709-01', agentId: 'agent-b204', agentName: '曜石通路', memberId: 'member-77df08', betPoints: '220', payoutPoints: '99', pointsPerUsdt: '100', startedAt: null, settledAt: '2026-08-04T22:16:44+08:00', createdAt: '2026-08-04T22:16:41+08:00', updatedAt: '2026-08-04T22:16:44+08:00', status: 'settled', statusDescription: '已完成遊戲結果與點數結算。',
    }),
    buildRound({
        roundId: 'round-20260804-0083', externalRoundId: 'ggap-r-92de10', gameId: 'crash-solo', gameName: 'Skyline Crash', gameType: 'crash', gameVersion: '2.4.0', releaseId: 'rel-20260730-01', agentId: 'agent-a031', agentName: '北辰娛樂代理', memberId: 'member-03f19e', betPoints: '600', payoutPoints: '1320', pointsPerUsdt: '100', startedAt: '2026-08-04T21:40:10+08:00', settledAt: '2026-08-04T21:40:26+08:00', createdAt: '2026-08-04T21:40:10+08:00', updatedAt: '2026-08-04T21:40:26+08:00', status: 'settled', statusDescription: '已完成遊戲結果與點數結算。',
    }),
    buildRound({
        roundId: 'round-20260804-0082', externalRoundId: 'ggap-r-6e40b7', gameId: 'mini-burst', gameName: 'Mini Burst', gameType: 'crash', gameVersion: '1.9.2', releaseId: 'rel-20260712-02', agentId: 'agent-c118', agentName: '流光遊戲通路', memberId: 'member-5f8e11', betPoints: '40', payoutPoints: '0', pointsPerUsdt: '80', startedAt: null, settledAt: null, createdAt: '2026-08-05T15:23:02+08:00', updatedAt: '2026-08-05T15:23:08+08:00', status: 'processing', statusDescription: '遊戲結果已接收，尚未完成正式結算。',
    }),
]

export const providerGameRoundHandlers = [
    http.get('/api/provider/v1/game-rounds', async ({ request }) => {
        await delay(180)
        const url = new URL(request.url)
        const environment = url.searchParams.get('environment')
        const page = Math.max(1, Number(url.searchParams.get('page') ?? 1))
        const pageSize = Math.min(1000, Math.max(1, Number(url.searchParams.get('page_size') ?? 10)))
        const requestedSortBy = url.searchParams.get('sort_by') ?? ''
        const sortBy = isProviderGameRoundSortField(requestedSortBy) ? requestedSortBy : 'settled_at'
        const sortOrder: ProviderGameRoundSortOrder = url.searchParams.get('sort_order') === 'asc' ? 'asc' : 'desc'
        const fromValue = url.searchParams.get('from')
        const toValue = url.searchParams.get('to')
        const from = fromValue ? new Date(fromValue).getTime() : null
        const to = toValue ? new Date(toValue).getTime() : null
        const hasTimeFilter = from !== null || to !== null
        const gameQuery = (url.searchParams.get('game_query') ?? '').trim().toLowerCase()
        const gameType = url.searchParams.get('game_type') as ProviderGameRound['game_type'] | null
        const agentQuery = (url.searchParams.get('agent_query') ?? '').trim().toLowerCase()
        const roundId = (url.searchParams.get('round_id') ?? '').trim()
        const externalRoundId = (url.searchParams.get('external_round_id') ?? '').trim()
        const memberId = (url.searchParams.get('member_id') ?? '').trim().toLowerCase()
        const status = url.searchParams.get('status') as ProviderGameRoundStatus | null

        let filtered = mockGameRounds.filter((round) => {
            if (environment && environment !== 'production') return false
            if (gameQuery && !`${round.game_id} ${round.game_name}`.toLowerCase().includes(gameQuery)) return false
            if (gameType && round.game_type !== gameType) return false
            if (agentQuery && !`${round.agent_id} ${round.agent_name}`.toLowerCase().includes(agentQuery)) return false
            if (roundId && round.round_id !== roundId) return false
            if (externalRoundId && round.external_round_id !== externalRoundId) return false
            if (memberId && !round.member_id.toLowerCase().includes(memberId)) return false
            if (status && round.status !== status) return false

            // 未指定時間區間時保留未結算資料；指定任一邊界後，只查有 settled_at 的紀錄。
            if (hasTimeFilter && !round.settled_at) return false
            if (round.settled_at) {
                const settledTime = new Date(round.settled_at).getTime()
                if (from !== null && settledTime < from) return false
                if (to !== null && settledTime > to) return false
            }
            return true
        })

        filtered = filtered.sort((left, right) => compareProviderGameRounds(left, right, sortBy, sortOrder))
        const total = filtered.length
        const start = (page - 1) * pageSize

        return HttpResponse.json({
            items: filtered.slice(start, start + pageSize),
            total,
            page,
            page_size: pageSize,
        })
    }),

    http.get('/api/provider/v1/game-rounds/:roundId', async ({ params }) => {
        await delay(120)
        const round = mockGameRounds.find((item) => item.round_id === params.roundId)
        if (!round) return HttpResponse.json({ message: 'Game Round not found' }, { status: 404 })
        return HttpResponse.json(round)
    }),
]
