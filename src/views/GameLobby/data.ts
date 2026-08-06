export type LobbyGameStatus = '即將開放' | '已推出' | '維護中'

export type LobbyGame = {
    id: string
    code: string
    name: string
    type: string
    version: string
    releaseAt: string
    status: LobbyGameStatus
    rtp: number
    volatility: string
    maxMultiplier: string
    minBet: string
    maxBet: string
    description: string
    art: string
    youtubeUrl: string
    updatedAt: string
}

export type DemoGameRow = {
    gameId: string
    gameName: string
    type: string
    activePlayers: number
    sessions: number
    betCount: number
    turnoverUsd: number
    playMinutes: number
    trend: number[]
}

export const localeOptions = ['繁中', '簡中', 'English', '日本語'] as const

export const lobbyGames: LobbyGame[] = [
    {
        id: 'game-001',
        code: 'JADE-QUEEN',
        name: '翡翠天后',
        type: '老虎機',
        version: 'v1.4.2',
        releaseAt: '2026-07-18 14:30',
        status: '已推出',
        rtp: 96.42,
        volatility: '高',
        maxMultiplier: 'x2,000',
        minBet: 'USD 0.10',
        maxBet: 'USD 50.00',
        description: '踏入雲上神殿，蒐集翡翠符印，啟動天后祝福與連線獎勵。',
        art: 'jade',
        youtubeUrl: 'https://www.youtube.com/watch?v=provider-jade-queen',
        updatedAt: '2026-08-05 16:24',
    },
    {
        id: 'game-002',
        code: 'DEEP-DRAGON',
        name: '深海龍王',
        type: '捕魚機',
        version: 'v2.1.0',
        releaseAt: '2026-06-28 09:00',
        status: '已推出',
        rtp: 97.1,
        volatility: '中高',
        maxMultiplier: 'x1,500',
        minBet: 'USD 0.20',
        maxBet: 'USD 100.00',
        description: '以深海寶藏為目標，鎖定巨龍後可開啟限時加成與團隊獎池。',
        art: 'deep',
        youtubeUrl: 'https://www.youtube.com/watch?v=provider-deep-dragon',
        updatedAt: '2026-08-04 11:08',
    },
    {
        id: 'game-003',
        code: 'EMBER-MAHJONG',
        name: '赤焰麻將',
        type: '棋牌',
        version: 'v1.8.6',
        releaseAt: '2026-05-22 18:10',
        status: '已推出',
        rtp: 96.8,
        volatility: '中',
        maxMultiplier: 'x800',
        minBet: 'USD 1.00',
        maxBet: 'USD 200.00',
        description: '經典麻將節奏結合連莊機制，兼具策略與快速對局的爽感。',
        art: 'ember',
        youtubeUrl: 'https://www.youtube.com/watch?v=provider-ember-mahjong',
        updatedAt: '2026-08-03 19:42',
    },
    {
        id: 'game-004',
        code: 'STAR-ASCENT',
        name: '星際躍升',
        type: '小遊戲',
        version: 'v0.9.3',
        releaseAt: '—',
        status: '即將開放',
        rtp: 95.9,
        volatility: '高',
        maxMultiplier: 'x10,000',
        minBet: 'USD 0.10',
        maxBet: 'USD 25.00',
        description: '在倒數結束前選擇撤離時機，穿越星門取得即時倍率。',
        art: 'cosmic',
        youtubeUrl: 'https://www.youtube.com/watch?v=provider-star-ascent',
        updatedAt: '2026-08-05 09:16',
    },
    {
        id: 'game-005',
        code: 'FORTUNE-VAULT',
        name: '天宮寶藏',
        type: '老虎機',
        version: 'v1.2.4',
        releaseAt: '2026-04-11 13:40',
        status: '維護中',
        rtp: 96.2,
        volatility: '中高',
        maxMultiplier: 'x1,200',
        minBet: 'USD 0.20',
        maxBet: 'USD 75.00',
        description: '集滿三枚天印進入寶藏回合，獲得自由旋轉與隨機倍數。',
        art: 'vault',
        youtubeUrl: 'https://www.youtube.com/watch?v=provider-fortune-vault',
        updatedAt: '2026-08-05 17:02',
    },
    {
        id: 'game-006',
        code: 'CANDY-RUSH',
        name: '糖果衝刺',
        type: '小遊戲',
        version: 'v1.0.1',
        releaseAt: '—',
        status: '即將開放',
        rtp: 95.8,
        volatility: '中低',
        maxMultiplier: 'x450',
        minBet: 'USD 0.10',
        maxBet: 'USD 20.00',
        description: '收集糖果能量躲避障礙，將連擊推進到更高的獎勵區間。',
        art: 'candy',
        youtubeUrl: 'https://www.youtube.com/watch?v=provider-candy-rush',
        updatedAt: '2026-08-02 14:50',
    },
]

export const demoGameRows: DemoGameRow[] = [
    { gameId: 'game-001', gameName: '翡翠天后', type: '老虎機', activePlayers: 42, sessions: 186, betCount: 6240, turnoverUsd: 184320, playMinutes: 4380, trend: [42, 54, 48, 62, 58, 74, 82] },
    { gameId: 'game-002', gameName: '深海龍王', type: '捕魚機', activePlayers: 31, sessions: 144, betCount: 4986, turnoverUsd: 143880, playMinutes: 3620, trend: [31, 44, 39, 56, 61, 52, 66] },
    { gameId: 'game-003', gameName: '赤焰麻將', type: '棋牌', activePlayers: 18, sessions: 96, betCount: 2280, turnoverUsd: 92160, playMinutes: 2140, trend: [20, 19, 27, 31, 28, 36, 34] },
    { gameId: 'game-004', gameName: '星際躍升', type: '小遊戲', activePlayers: 9, sessions: 72, betCount: 1420, turnoverUsd: 38400, playMinutes: 1060, trend: [8, 12, 16, 14, 18, 21, 19] },
]

export const statusClass = (status: LobbyGameStatus) => {
    if (status === '已推出') return 'is-live'
    if (status === '維護中') return 'is-maintenance'
    return 'is-upcoming'
}

export const formatUsd = (value: number) => `USD ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
