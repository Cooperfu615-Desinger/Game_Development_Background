import { faker } from '@faker-js/faker'

export function setupManualMock() {
    const originalFetch = window.fetch

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = input.toString()
        const method = init?.method || 'GET'

        console.log(`[Manual Mock] ${method} ${url}`)

        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

        // --- Auth: Login ---
        if (url.includes('/api/v2/auth/login') && method === 'POST') {
            await delay(800)
            // Parse body to check credentials (simplified)
            let body: any = {}
            if (init?.body) {
                try {
                    body = JSON.parse(init.body as string)
                } catch (e) { }
            }

            if (body.account === 'admin' && body.password === 'admin') {
                return new Response(JSON.stringify({
                    code: 0,
                    msg: 'Login Successful',
                    data: {
                        token: 'mock-jwt-token-' + faker.string.uuid(),
                        user: {
                            name: 'Super Admin',
                            avatar: faker.image.avatar(),
                            roles: ['admin']
                        }
                    }
                }), { status: 200, headers: { 'Content-Type': 'application/json' } })
            }
            return new Response(JSON.stringify({ code: 401, msg: 'Invalid credentials' }), { status: 200 })
        }

        // --- Agent: List ---
        if (url.includes('/api/v2/agents') && method === 'GET') {
            await delay(500)
            const list = Array.from({ length: 15 }).map(() => ({
                id: faker.number.int({ min: 10000, max: 99999 }),
                account: faker.internet.username(),
                site_code: faker.string.alphanumeric(4).toUpperCase(),
                level: 1,
                parent_id: null,
                balance: parseFloat(faker.finance.amount()),
                percent: faker.number.int({ min: 10, max: 90 }),
                state: faker.helpers.arrayElement(['active', 'disabled']),
                created_at: faker.date.recent().toISOString(),
                children_count: faker.number.int({ min: 0, max: 20 })
            }))
            return new Response(JSON.stringify({
                code: 0,
                msg: 'success',
                data: { list, total: 50 }
            }), { status: 200 })
        }

        // --- Bet Logs (Phase 8.8) ---
        if (url.includes('/api/v2/report/bet-logs') && method === 'POST') {
            await delay(600)
            const list = Array.from({ length: 50 }).map(() => {
                // Merchant data
                const merchantCode = `OP-${faker.number.int({ min: 1001, max: 1020 })}`
                const merchantName = faker.helpers.arrayElement(['Golden Dragon', 'Silver Tiger', 'Diamond Star', 'Royal Crown', 'Lucky 88', 'Grand Casino'])

                // Provider data
                const providerName = faker.helpers.arrayElement(['PG Soft', 'Evolution', 'Pragmatic Play'])
                const gameName = faker.helpers.arrayElement(['Fortune Tiger', 'Super Ace', 'Gates of Olympus', 'Sugar Rush', 'Crazy Time'])

                // Player IDs (dual-layer)
                const aggPlayerId = `PL-${faker.number.int({ min: 1000, max: 9999 })}`
                const merchantMemberId = `mem_${faker.internet.username().toLowerCase()}`

                // Financial scenarios
                const scenario = faker.helpers.weightedArrayElement([
                    { weight: 40, value: 'WIN' },    // 40% wins
                    { weight: 50, value: 'LOSS' },   // 50% losses
                    { weight: 10, value: 'REFUND' }  // 10% refunds/cancelled
                ])

                const baseBet = faker.number.float({ min: 10, max: 500, fractionDigits: 2 })
                let betAmount: number, payoutAmount: number, netWin: number, status: 'settled' | 'unsettled' | 'cancelled'

                switch (scenario) {
                    case 'WIN':
                        betAmount = baseBet
                        payoutAmount = baseBet * faker.number.float({ min: 1.5, max: 10, fractionDigits: 2 })
                        netWin = Number((payoutAmount - betAmount).toFixed(2))
                        status = 'settled'
                        break
                    case 'LOSS':
                        betAmount = baseBet
                        payoutAmount = faker.datatype.boolean(0.9) ? 0 : baseBet * faker.number.float({ min: 0.1, max: 0.9, fractionDigits: 2 })
                        netWin = Number((payoutAmount - betAmount).toFixed(2))
                        status = 'settled'
                        break
                    case 'REFUND':
                        betAmount = baseBet
                        payoutAmount = baseBet
                        netWin = 0
                        status = 'cancelled'
                        break
                    default:
                        betAmount = baseBet
                        payoutAmount = 0
                        netWin = -baseBet
                        status = 'settled'
                }

                return {
                    // Core IDs (Phase 8.8)
                    round_id: `R-${faker.string.numeric(12)}`,
                    id: `PF-${faker.string.numeric(10)}`,
                    created_at: faker.date.recent({ days: 1 }).toISOString(),

                    // Merchant info
                    merchant_display_id: merchantCode,
                    merchant_name: merchantName,

                    // Game info
                    provider_name: providerName,
                    game_name: gameName,

                    // Player IDs (dual-layer)
                    agg_player_id: aggPlayerId,
                    merchant_member_id: merchantMemberId,

                    // Financial
                    bet_amount: betAmount,
                    payout_amount: payoutAmount,
                    net_win: netWin,
                    currency: 'USD',

                    // Status
                    status,

                    // Detail
                    game_detail: {
                        round_id: `R-${faker.string.numeric(12)}`,
                        matrix: [],
                        lines_won: [],
                        free_games_triggered: false,
                        multiplier: 1,
                        currency: 'USD'
                    }
                }
            })

            // Sort by time desc
            list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

            return new Response(JSON.stringify({
                code: 0,
                msg: 'success',
                data: { list, total: 200 }
            }), { status: 200 })
        }

        // --- Financial Report ---
        if (url.includes('/api/v2/report/financial') && method === 'POST') {
            await delay(800)

            // Parse body to get groupBy
            let groupBy = 'date'
            if (init?.body) {
                try {
                    const body = JSON.parse(init.body as string)
                    if (body.groupBy) groupBy = body.groupBy
                } catch (e) { }
            }

            const count = groupBy === 'date' ? 30 : 15
            const list = Array.from({ length: count }).map((_, index) => {
                let key = ''
                if (groupBy === 'date') {
                    const d = new Date()
                    d.setDate(d.getDate() - (count - index - 1))
                    key = d.toISOString().split('T')[0] || ''
                } else {
                    key = faker.company.name()
                }

                const bet = parseFloat(faker.finance.amount({ min: 10000, max: 500000, dec: 2 }))
                // Random RTP between 80% and 120% (some loss scenarios for house)
                const rtp = faker.number.float({ min: 80, max: 120 })
                const win = bet * (rtp / 100)
                const ggr = bet - win

                return {
                    key: key,
                    total_bet: bet,
                    total_win: parseFloat(win.toFixed(2)),
                    ggr: parseFloat(ggr.toFixed(2)),
                    rtp: parseFloat(rtp.toFixed(2)),
                    round_count: faker.number.int({ min: 500, max: 5000 })
                }
            })

            return new Response(JSON.stringify({
                code: 0,
                msg: 'success',
                data: { list }
            }), { status: 200 })
        }

        // --- Agent: Create ---
        if (url.includes('/api/v1/agent/create') && method === 'POST') {
            await delay(800)
            return new Response(JSON.stringify({
                code: 0,
                msg: 'Agent Created Successfully',
                data: { id: 12345 }
            }), { status: 200 })
        }

        // --- Agent: Update ---
        if (url.includes('/api/v1/agent/update') && method === 'PUT') {
            await delay(800)
            return new Response(JSON.stringify({
                code: 0,
                msg: 'Agent Updated Successfully',
                data: null
            }), { status: 200 })
        }

        // Pass through to original fetch (network)
        return originalFetch(input, init)
    }

    console.log('[Manual Mock] Initialized fail-safe interceptor')
}
