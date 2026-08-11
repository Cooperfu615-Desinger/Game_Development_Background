<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import RadioButton from 'primevue/radiobutton'
import Select from 'primevue/select'
import ToggleSwitch from 'primevue/toggleswitch'
import DateTimeRangeField from '@/components/ui/DateTimeRangeField.vue'

type Environment = 'production' | 'demo'
type GameType = 'slots' | 'crash' | 'table'
type QuickRange = '1h' | '6h' | '24h' | 'custom'
type FocusKey = 'all' | 'service' | 'round' | 'ggap' | 'alert' | 'risk'
type HealthStatus = 'normal' | 'degraded' | 'error' | 'isolated' | 'no_data' | 'maintenance'
type SignalStatus = 'normal' | 'warning' | 'danger' | 'no_data'
type Severity = 'info' | 'low' | 'medium' | 'high' | 'critical'
type HandlingStatus = 'pending' | 'investigating' | 'mitigated'
type MockScenario = 'standard' | 'all-normal' | 'empty' | 'health-no-data' | 'partial-failure' | 'all-failure'
type SortKey = 'overall' | 'game' | 'type' | 'version' | 'service' | 'roundRate' | 'ggapP95' | 'alerts' | 'risks' | 'lastChecked'
type SortDirection = 'asc' | 'desc'
type DateRange = [Date | null, Date | null]

interface RoundMetrics {
    success: number
    failed: number
    timeout: number
    processing: number
    status: SignalStatus
    mainFailureType: string
}

interface IntegrationBucket {
    observedAt: Date
    total: number
    timeouts: number
    failures: number
    retries: number
    latencySamples: number[]
}

interface IntegrationMetric {
    direction: 'GGAP → 遊戲商' | '遊戲商 → GGAP'
    apiType: string
    buckets: IntegrationBucket[]
    lastErrorAt: Date | null
    lastError: string
}

interface ResolvedIntegrationMetric {
    direction: IntegrationMetric['direction']
    apiType: string
    total: number
    p50: number | null
    p95: number | null
    p99: number | null
    timeouts: number
    failures: number
    retries: number
    latencySamples: number[]
    lastErrorAt: Date | null
    lastError: string
}

interface AlertItem {
    alertId: string
    riskEventId: string
    severity: 'high' | 'critical'
    status: HandlingStatus
    anomalyType: string
    overdue: boolean
    isolated: boolean
    mitigationFailed: boolean
}

interface RiskItem {
    riskEventId: string
    alertId?: string
    severity: Severity
    status: 'pending' | 'investigating'
    source: string
    anomalyType: string
    ongoing: boolean
}

interface GameMonitor {
    environment: Environment
    gameType: GameType
    gameId: string
    gameName: string
    version: string
    healthStatus: HealthStatus
    healthReason: string
    lastChecked: Date
    healthDataValid: boolean
    expectedService: boolean
    launchAvailable: boolean
    blockedNewLaunch: boolean
    round: RoundMetrics
    ggapStatus: SignalStatus
    integrations: IntegrationMetric[]
    alerts: AlertItem[]
    risks: RiskItem[]
    providerRoundId?: string
    ggapRoundId?: string
    ggapProviderEventId?: string
}

interface FilterState {
    environment: Environment
    gameType: GameType | ''
    game: string
    quickRange: QuickRange
    dateRange: DateRange
}

interface SummaryCard {
    key: Exclude<FocusKey, 'all'>
    label: string
    value: string
    status: string
    note: string
    icon: string
    tone: 'success' | 'warning' | 'danger' | 'neutral'
    tip: string
}

const router = useRouter()
const now = new Date()
const timezoneLabel = 'UTC+08:00 · Asia/Taipei'

const environmentLabels: Record<Environment, string> = {
    production: '正式環境',
    demo: '展示環境',
}

const environmentOptionLabels: Record<Environment, string> = {
    production: '正式環境（Production）',
    demo: '展示環境（DEMO）',
}

const gameTypeLabels: Record<GameType, string> = {
    slots: '老虎機',
    crash: '單人 Crash',
    table: '棋牌',
}

const healthLabels: Record<HealthStatus, string> = {
    normal: '正常',
    degraded: '降級',
    error: '異常',
    isolated: '隔離中',
    no_data: '無資料',
    maintenance: '維護中',
}

const signalLabels: Record<SignalStatus, string> = {
    normal: '正常',
    warning: '需關注',
    danger: '異常',
    no_data: '無資料',
}

const severityLabels: Record<Severity, string> = {
    info: '資訊',
    low: '低',
    medium: '中',
    high: '高',
    critical: '嚴重',
}

const handlingLabels: Record<HandlingStatus, string> = {
    pending: '待處理',
    investigating: '調查中',
    mitigated: '已緩解待覆核',
}

const sourceLabels: Record<string, string> = {
    game_round: '遊戲回合',
    game_service: '遊戲服務',
    ggap_request: 'GGAP 請求',
    callback: '回呼',
    data_quality: '資料品質',
    game_math: '遊戲數值',
}

const focusOptions: Array<{ label: string; value: FocusKey; icon: string }> = [
    { label: '全部', value: 'all', icon: 'pi pi-th-large' },
    { label: '服務異常', value: 'service', icon: 'pi pi-heart-fill' },
    { label: '遊戲回合失敗', value: 'round', icon: 'pi pi-times-circle' },
    { label: 'GGAP 延遲／逾時', value: 'ggap', icon: 'pi pi-clock' },
    { label: '高風險告警', value: 'alert', icon: 'pi pi-bell' },
    { label: '未處理異常', value: 'risk', icon: 'pi pi-exclamation-triangle' },
]

const quickRanges: Array<{ label: string; value: QuickRange }> = [
    { label: '近 1 小時', value: '1h' },
    { label: '近 6 小時', value: '6h' },
    { label: '近 24 小時', value: '24h' },
    { label: '自訂時間', value: 'custom' },
]

const scenarioOptions: Array<{ label: string; value: MockScenario }> = [
    { label: '標準監控', value: 'standard' },
    { label: '全部正常', value: 'all-normal' },
    { label: '查無資料', value: 'empty' },
    { label: '健康資料無資料', value: 'health-no-data' },
    { label: '部分來源失敗', value: 'partial-failure' },
    { label: '全部來源失敗', value: 'all-failure' },
]

const pageSizeOptions = [
    { label: '每頁 5 筆', value: 5 },
    { label: '每頁 10 筆', value: 10 },
]

function minutesAgo(minutes: number) {
    return new Date(now.getTime() - minutes * 60 * 1000)
}

function stringSeed(value: string) {
    return [...value].reduce((seed, character) => seed + character.charCodeAt(0), 0)
}

function distributeDailyCount(value: number, hourOffset: number, seed: number) {
    const base = Math.floor(value / 24)
    const remainder = value % 24
    return base + ((hourOffset * 7 + seed) % 24 < remainder ? 1 : 0)
}

function latencySamples(p50: number, p95: number, p99: number, hourOffset: number, seed: number) {
    const recentFactor = hourOffset === 0
        ? 1.12
        : hourOffset < 6
            ? 1.04
            : hourOffset < 24
                ? 0.94 + ((hourOffset + seed) % 5) * 0.02
                : 0.9 + ((hourOffset + seed) % 9) * 0.025
    return Array.from({ length: 100 }, (_, index) => {
        const quantile = (index + 1) / 100
        let latency = p99 * 1.04
        if (quantile <= 0.5) latency = p50 * (0.55 + quantile * 0.9)
        else if (quantile <= 0.95) latency = p50 + ((quantile - 0.5) / 0.45) * (p95 - p50)
        else if (quantile <= 0.99) latency = p95 + ((quantile - 0.95) / 0.04) * (p99 - p95)
        return Math.max(1, Math.round(latency * recentFactor))
    })
}

function integration(
    direction: IntegrationMetric['direction'],
    apiType: string,
    total: number,
    p50: number,
    p95: number,
    p99: number,
    timeouts = 0,
    failures = 0,
    retries = 0,
    lastError = '',
): IntegrationMetric {
    const seed = stringSeed(`${direction}-${apiType}`)
    return {
        direction,
        apiType,
        buckets: Array.from({ length: 7 * 24 }, (_, hourOffset) => ({
            observedAt: new Date(now.getTime() - (hourOffset + 0.5) * 60 * 60 * 1000),
            total: distributeDailyCount(total, hourOffset, seed),
            timeouts: distributeDailyCount(timeouts, hourOffset, seed + 3),
            failures: distributeDailyCount(failures, hourOffset, seed + 7),
            retries: distributeDailyCount(retries, hourOffset, seed + 11),
            latencySamples: latencySamples(p50, p95, p99, hourOffset, seed),
        })),
        lastErrorAt: lastError ? minutesAgo(18) : null,
        lastError,
    }
}

const mockGames: GameMonitor[] = [
    {
        environment: 'production', gameType: 'slots', gameId: 'gm_neon_heist', gameName: 'Neon Heist', version: 'v2.4.1',
        healthStatus: 'normal', healthReason: '健康檢查與核心服務正常', lastChecked: minutesAgo(1), healthDataValid: true, expectedService: true, launchAvailable: true, blockedNewLaunch: false,
        round: { success: 48234, failed: 8, timeout: 2, processing: 16, status: 'normal', mainFailureType: '結算回應失敗' },
        ggapStatus: 'normal', integrations: [integration('GGAP → 遊戲商', 'Launch', 24120, 48, 96, 142), integration('遊戲商 → GGAP', 'Settle', 24108, 62, 118, 176, 1, 0, 1)],
        alerts: [{ alertId: 'alt_01jz4m8v3k6q2d7p9x5n1c0bqa', riskEventId: 'rsk_01jz4m8v3k6q2d7p9x5n1c0bqa', severity: 'critical', status: 'pending', anomalyType: '結算失敗率升高', overdue: true, isolated: false, mitigationFailed: true }],
        risks: [{ riskEventId: 'rsk_01jz4m8v3k6q2d7p9x5n1c0bqa', alertId: 'alt_01jz4m8v3k6q2d7p9x5n1c0bqa', severity: 'critical', status: 'pending', source: 'game_round', anomalyType: '結算失敗率升高', ongoing: true }],
        providerRoundId: 'round-20260805-0098', ggapRoundId: 'ggap-r-8f31a9', ggapProviderEventId: 'pev_7d9c1a2e',
    },
    {
        environment: 'production', gameType: 'crash', gameId: 'ND-014', gameName: 'Neon Drift', version: 'v1.8.3',
        healthStatus: 'degraded', healthReason: '核心服務可用，但結算延遲率升高', lastChecked: minutesAgo(2), healthDataValid: true, expectedService: true, launchAvailable: true, blockedNewLaunch: false,
        round: { success: 18720, failed: 42, timeout: 19, processing: 8, status: 'warning', mainFailureType: '結算逾時' },
        ggapStatus: 'warning', integrations: [integration('GGAP → 遊戲商', 'Game Round', 9421, 121, 286, 514, 7, 4, 9, 'HTTP 504 / SETTLE_TIMEOUT'), integration('遊戲商 → GGAP', 'Settle', 9360, 142, 342, 608, 12, 5, 16, 'HTTP 504 / upstream timeout')],
        alerts: [{ alertId: 'alt_01jz4f6b2c9m7q8x3n5v0d1epa', riskEventId: 'rsk_01jz4f6b2c9m7q8x3n5v0d1epa', severity: 'high', status: 'investigating', anomalyType: '回呼確認逾時', overdue: false, isolated: true, mitigationFailed: false }],
        risks: [{ riskEventId: 'rsk_01jz4f6b2c9m7q8x3n5v0d1epa', alertId: 'alt_01jz4f6b2c9m7q8x3n5v0d1epa', severity: 'high', status: 'investigating', source: 'callback', anomalyType: '回呼確認逾時', ongoing: false }],
        providerRoundId: 'round-20260805-0097', ggapRoundId: 'ggap-r-7c20dd', ggapProviderEventId: 'pev_4f91c82a',
    },
    {
        environment: 'production', gameType: 'table', gameId: 'PC-009', gameName: 'Paper Crane', version: 'v3.1.0',
        healthStatus: 'isolated', healthReason: '命中核准規則，已阻擋新遊戲啟動', lastChecked: minutesAgo(1), healthDataValid: true, expectedService: true, launchAvailable: false, blockedNewLaunch: true,
        round: { success: 6204, failed: 96, timeout: 31, processing: 4, status: 'danger', mainFailureType: '重複結算' },
        ggapStatus: 'danger', integrations: [integration('GGAP → 遊戲商', 'Game Round', 3274, 182, 624, 1180, 28, 19, 31, 'HTTP 500 / DUPLICATE_SETTLEMENT'), integration('遊戲商 → GGAP', 'Callback', 3118, 204, 780, 1420, 38, 22, 44, 'HTTP 503 / callback unavailable')],
        alerts: [{ alertId: 'alt_01jz4b1p8w4y6h0m2k9d7c3sqa', riskEventId: 'rsk_01jz4b1p8w4y6h0m2k9d7c3sqa', severity: 'critical', status: 'mitigated', anomalyType: '重複結算風險', overdue: true, isolated: true, mitigationFailed: false }],
        risks: [{ riskEventId: 'rsk_01jz4b1p8w4y6h0m2k9d7c3sqa', alertId: 'alt_01jz4b1p8w4y6h0m2k9d7c3sqa', severity: 'critical', status: 'investigating', source: 'data_quality', anomalyType: '重複結算風險', ongoing: false }],
        providerRoundId: 'round-20260805-0096', ggapRoundId: 'ggap-r-69b115', ggapProviderEventId: 'pev_aa31d99e',
    },
    {
        environment: 'production', gameType: 'slots', gameId: 'SG-031', gameName: 'Solar Garden', version: 'v2.0.0',
        healthStatus: 'error', healthReason: '玩家啟動流程持續失敗', lastChecked: minutesAgo(3), healthDataValid: true, expectedService: true, launchAvailable: false, blockedNewLaunch: false,
        round: { success: 8124, failed: 76, timeout: 14, processing: 12, status: 'danger', mainFailureType: '遊戲啟動失敗' },
        ggapStatus: 'normal', integrations: [integration('GGAP → 遊戲商', 'Launch', 8240, 55, 108, 164, 0, 3, 3, 'HTTP 422 / GAME_BOOT_FAILED'), integration('遊戲商 → GGAP', '健康檢查', 286, 31, 64, 82)],
        alerts: [{ alertId: 'alt_01jz42n8w5q1d7c3m9x6v0bpea', riskEventId: 'rsk_01jz42n8w5q1d7c3m9x6v0bpea', severity: 'high', status: 'pending', anomalyType: '遊戲服務不可用', overdue: false, isolated: false, mitigationFailed: true }],
        risks: [{ riskEventId: 'rsk_01jz42n8w5q1d7c3m9x6v0bpea', alertId: 'alt_01jz42n8w5q1d7c3m9x6v0bpea', severity: 'high', status: 'pending', source: 'game_service', anomalyType: '遊戲服務不可用', ongoing: true }],
        providerRoundId: 'round-20260805-0095', ggapRoundId: 'ggap-r-4e5f80', ggapProviderEventId: 'pev_98c20b7a',
    },
    {
        environment: 'production', gameType: 'slots', gameId: 'gm_star_roulette', gameName: 'Star Roulette', version: 'v2.9.5',
        healthStatus: 'no_data', healthReason: '健康資料已超過有效時間', lastChecked: minutesAgo(38), healthDataValid: false, expectedService: true, launchAvailable: false, blockedNewLaunch: false,
        round: { success: 10204, failed: 4, timeout: 1, processing: 5, status: 'normal', mainFailureType: '必要資料缺失' },
        ggapStatus: 'no_data', integrations: [], alerts: [],
        risks: [],
        providerRoundId: 'round-20260805-0094', ggapRoundId: 'ggap-r-228a31',
    },
    {
        environment: 'production', gameType: 'slots', gameId: 'gm_golden_panda', gameName: 'Golden Panda', version: 'v5.2.0',
        healthStatus: 'maintenance', healthReason: '排定版本維護，預計 15:30 恢復', lastChecked: minutesAgo(8), healthDataValid: true, expectedService: false, launchAvailable: false, blockedNewLaunch: false,
        round: { success: 0, failed: 0, timeout: 0, processing: 0, status: 'no_data', mainFailureType: '—' },
        ggapStatus: 'no_data', integrations: [], alerts: [], risks: [],
    },
    {
        environment: 'production', gameType: 'slots', gameId: 'gm_ocean_treasure', gameName: 'Ocean Treasure', version: 'v1.6.8',
        healthStatus: 'normal', healthReason: '健康檢查與核心服務正常', lastChecked: minutesAgo(1), healthDataValid: true, expectedService: true, launchAvailable: true, blockedNewLaunch: false,
        round: { success: 36290, failed: 9, timeout: 2, processing: 11, status: 'normal', mainFailureType: '單筆結算失敗' },
        ggapStatus: 'normal', integrations: [integration('GGAP → 遊戲商', 'Launch', 18142, 42, 86, 126), integration('遊戲商 → GGAP', 'Settle', 18131, 58, 112, 170, 1, 1, 2)],
        alerts: [], risks: [], providerRoundId: 'round-20260805-0093', ggapRoundId: 'ggap-r-0ba7e2',
    },
    {
        environment: 'production', gameType: 'table', gameId: 'FM-017', gameName: 'Fortune Mahjong', version: 'v4.2.2',
        healthStatus: 'normal', healthReason: '遊戲服務正常；另有持續風控事件', lastChecked: minutesAgo(2), healthDataValid: true, expectedService: true, launchAvailable: true, blockedNewLaunch: false,
        round: { success: 12548, failed: 18, timeout: 3, processing: 9, status: 'warning', mainFailureType: '派彩結果異常' },
        ggapStatus: 'normal', integrations: [integration('GGAP → 遊戲商', 'Game Round', 6298, 52, 104, 158), integration('遊戲商 → GGAP', 'Settle', 6271, 71, 136, 208)],
        alerts: [], risks: [{ riskEventId: 'rsk_01jz3y7m4c8p1d6v0x9q2bnea', severity: 'medium', status: 'investigating', source: 'game_math', anomalyType: '派彩結果異常', ongoing: false }],
        providerRoundId: 'round-20260805-0092', ggapRoundId: 'ggap-r-f1c4a6', ggapProviderEventId: 'pev_1a3c70d8',
    },
    {
        environment: 'production', gameType: 'crash', gameId: 'gm_sky_rocket', gameName: 'Sky Rocket', version: 'v2.1.4',
        healthStatus: 'normal', healthReason: '健康檢查與核心服務正常', lastChecked: minutesAgo(2), healthDataValid: true, expectedService: true, launchAvailable: true, blockedNewLaunch: false,
        round: { success: 21481, failed: 5, timeout: 1, processing: 7, status: 'normal', mainFailureType: '回呼失敗' },
        ggapStatus: 'normal', integrations: [integration('GGAP → 遊戲商', 'Launch', 10744, 44, 88, 132), integration('遊戲商 → GGAP', 'Callback', 10738, 64, 122, 184, 0, 1, 1)],
        alerts: [], risks: [], providerRoundId: 'round-20260805-0091', ggapRoundId: 'ggap-r-c54d11',
    },
    {
        environment: 'demo', gameType: 'slots', gameId: 'gm_neon_heist', gameName: 'Neon Heist', version: 'v2.5.0-rc1',
        healthStatus: 'normal', healthReason: '展示環境健康檢查正常', lastChecked: minutesAgo(1), healthDataValid: true, expectedService: true, launchAvailable: true, blockedNewLaunch: false,
        round: { success: 3210, failed: 1, timeout: 0, processing: 2, status: 'normal', mainFailureType: '單筆結算失敗' },
        ggapStatus: 'normal', integrations: [integration('GGAP → 遊戲商', 'Launch', 1608, 38, 78, 112), integration('遊戲商 → GGAP', 'Settle', 1603, 52, 106, 158)], alerts: [], risks: [],
    },
    {
        environment: 'demo', gameType: 'crash', gameId: 'gm_crash_drift', gameName: 'Crash Drift', version: 'v1.9.0-rc2',
        healthStatus: 'normal', healthReason: '展示環境健康檢查正常', lastChecked: minutesAgo(2), healthDataValid: true, expectedService: true, launchAvailable: true, blockedNewLaunch: false,
        round: { success: 1846, failed: 0, timeout: 0, processing: 1, status: 'normal', mainFailureType: '—' },
        ggapStatus: 'normal', integrations: [integration('GGAP → 遊戲商', 'Game Round', 925, 46, 84, 118), integration('遊戲商 → GGAP', 'Settle', 921, 61, 116, 168)], alerts: [], risks: [],
    },
    {
        environment: 'demo', gameType: 'table', gameId: 'gm_lucky_mahjong', gameName: 'Lucky Mahjong', version: 'v4.1.0-beta1',
        healthStatus: 'normal', healthReason: '展示環境健康檢查正常', lastChecked: minutesAgo(3), healthDataValid: true, expectedService: true, launchAvailable: true, blockedNewLaunch: false,
        round: { success: 924, failed: 0, timeout: 0, processing: 1, status: 'normal', mainFailureType: '—' },
        ggapStatus: 'normal', integrations: [integration('GGAP → 遊戲商', 'Launch', 465, 42, 82, 120), integration('遊戲商 → GGAP', '健康檢查', 192, 26, 54, 76)], alerts: [], risks: [],
    },
]

const initialRange: DateRange = [new Date(now.getTime() - 24 * 60 * 60 * 1000), new Date(now)]
const initialFilters: FilterState = { environment: 'production', gameType: '', game: '', quickRange: '24h', dateRange: initialRange }
const draftFilters = reactive<FilterState>(cloneFilters(initialFilters))
const appliedFilters = ref<FilterState>(cloneFilters(initialFilters))
const focus = ref<FocusKey>('all')
const loading = ref(true)
const refreshing = ref(false)
const filterError = ref('')
const scenario = ref<MockScenario>('standard')
const autoUpdate = ref(true)
const lastUpdated = ref(new Date())
const selectedGame = ref<GameMonitor | null>(null)
const detailVisible = ref(false)
const sortKey = ref<SortKey>('overall')
const sortDirection = ref<SortDirection>('asc')
const page = ref(0)
const pageSize = ref(5)
let loadTimer: number | undefined
let refreshTimer: number | undefined
let autoTimer: number | undefined

function cloneFilters(source: FilterState): FilterState {
    return { ...source, dateRange: [source.dateRange[0] ? new Date(source.dateRange[0]) : null, source.dateRange[1] ? new Date(source.dateRange[1]) : null] }
}

const gameOptions = computed(() => {
    const seen = new Set<string>()
    return mockGames
        .filter((game) => game.environment === draftFilters.environment && (!draftFilters.gameType || game.gameType === draftFilters.gameType))
        .filter((game) => {
            if (seen.has(game.gameId)) return false
            seen.add(game.gameId)
            return true
        })
        .map((game) => ({ label: `${game.gameName} · ${game.gameId}`, value: game.gameId }))
})

function clearUnavailableGame() {
    if (draftFilters.game && !gameOptions.value.some((option) => option.value === draftFilters.game)) draftFilters.game = ''
}

function chooseQuickRange(range: QuickRange) {
    draftFilters.quickRange = range
    if (range === 'custom') return
    const hours = range === '1h' ? 1 : range === '6h' ? 6 : 24
    const end = new Date()
    draftFilters.dateRange = [new Date(end.getTime() - hours * 60 * 60 * 1000), end]
    filterError.value = ''
}

function handleCustomRange(range: DateRange) {
    draftFilters.quickRange = 'custom'
    draftFilters.dateRange = range
}

function validateFilters() {
    if (draftFilters.quickRange !== 'custom') return ''
    const [from, to] = draftFilters.dateRange
    if (!from || !to) return '請完整選擇自訂起始與結束時間。'
    if (from.getTime() > to.getTime()) return '自訂時間無效，起始時間不可晚於結束時間。'
    const duration = to.getTime() - from.getTime()
    if (duration > 7 * 24 * 60 * 60 * 1000) return '自訂時間最多 7 日；更長區間請前往風控報表。'
    return ''
}

function applyFilters() {
    const error = validateFilters()
    if (error) {
        filterError.value = error
        return
    }
    filterError.value = ''
    appliedFilters.value = cloneFilters(draftFilters)
    focus.value = 'all'
    page.value = 0
    simulateLoading(280)
}

function resetFilters() {
    Object.assign(draftFilters, cloneFilters(initialFilters))
    appliedFilters.value = cloneFilters(initialFilters)
    focus.value = 'all'
    sortKey.value = 'overall'
    sortDirection.value = 'asc'
    page.value = 0
    filterError.value = ''
    simulateLoading(220)
}

function simulateLoading(duration: number) {
    loading.value = true
    if (loadTimer) window.clearTimeout(loadTimer)
    loadTimer = window.setTimeout(() => {
        loading.value = false
        lastUpdated.value = new Date()
    }, duration)
}

function refreshData() {
    if (refreshing.value) return
    refreshing.value = true
    if (refreshTimer) window.clearTimeout(refreshTimer)
    refreshTimer = window.setTimeout(() => {
        refreshing.value = false
        lastUpdated.value = new Date()
    }, 520)
}

function setFocus(next: FocusKey) {
    focus.value = focus.value === next ? 'all' : next
    page.value = 0
}

function selectCard(key: Exclude<FocusKey, 'all'>) {
    setFocus(key)
    document.getElementById('monitoring-game-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function scaledCount(value: number) {
    const active = appliedFilters.value
    let factor = 1
    if (active.quickRange === '1h') factor = 1 / 24
    if (active.quickRange === '6h') factor = 0.25
    if (active.quickRange === 'custom' && active.dateRange[0] && active.dateRange[1]) {
        factor = Math.max(1 / 24, (active.dateRange[1].getTime() - active.dateRange[0].getTime()) / (24 * 60 * 60 * 1000))
    }
    return value === 0 ? 0 : Math.max(1, Math.round(value * factor))
}

function roundMetrics(game: GameMonitor): RoundMetrics {
    return {
        ...game.round,
        success: scaledCount(game.round.success),
        failed: scaledCount(game.round.failed),
        timeout: scaledCount(game.round.timeout),
        processing: scaledCount(game.round.processing),
    }
}

function percentile(samples: number[], percentileValue: number) {
    if (!samples.length) return null
    const sorted = [...samples].sort((left, right) => left - right)
    const position = (percentileValue / 100) * (sorted.length - 1)
    const lowerIndex = Math.floor(position)
    const upperIndex = Math.ceil(position)
    if (lowerIndex === upperIndex) return sorted[lowerIndex]
    const weight = position - lowerIndex
    return Math.round(sorted[lowerIndex] + (sorted[upperIndex] - sorted[lowerIndex]) * weight)
}

function resolveIntegration(metric: IntegrationMetric): ResolvedIntegrationMetric | null {
    const [from, to] = appliedFilters.value.dateRange
    if (!from || !to) return null
    const buckets = metric.buckets.filter((bucket) => bucket.observedAt >= from && bucket.observedAt <= to)
    if (!buckets.length) return null
    const samples = buckets.flatMap((bucket) => bucket.latencySamples)
    const lastErrorInRange = metric.lastErrorAt && metric.lastErrorAt >= from && metric.lastErrorAt <= to
    return {
        direction: metric.direction,
        apiType: metric.apiType,
        total: buckets.reduce((sum, bucket) => sum + bucket.total, 0),
        p50: percentile(samples, 50),
        p95: percentile(samples, 95),
        p99: percentile(samples, 99),
        timeouts: buckets.reduce((sum, bucket) => sum + bucket.timeouts, 0),
        failures: buckets.reduce((sum, bucket) => sum + bucket.failures, 0),
        retries: buckets.reduce((sum, bucket) => sum + bucket.retries, 0),
        latencySamples: samples,
        lastErrorAt: lastErrorInRange ? metric.lastErrorAt : null,
        lastError: lastErrorInRange ? metric.lastError : '',
    }
}

function gameKey(game: Pick<GameMonitor, 'environment' | 'gameId'>) {
    return `${game.environment}-${game.gameId}`
}

const resolvedIntegrationsByGame = computed(() => new Map(mockGames.map((game) => [
    gameKey(game),
    game.integrations.map(resolveIntegration).filter((metric): metric is ResolvedIntegrationMetric => metric !== null),
])))

function resolvedIntegrations(game: GameMonitor) {
    return resolvedIntegrationsByGame.value.get(gameKey(game)) ?? []
}

function aggregateIntegrations(game: GameMonitor) {
    const metrics = resolvedIntegrations(game)
    const samples = metrics.flatMap((metric) => metric.latencySamples)
    return {
        total: metrics.reduce((sum, metric) => sum + metric.total, 0),
        p50: percentile(samples, 50),
        p95: percentile(samples, 95),
        p99: percentile(samples, 99),
        timeouts: metrics.reduce((sum, metric) => sum + metric.timeouts, 0),
        failures: metrics.reduce((sum, metric) => sum + metric.failures, 0),
        retries: metrics.reduce((sum, metric) => sum + metric.retries, 0),
        latencySamples: samples,
    }
}

function transformForScenario(game: GameMonitor): GameMonitor {
    if (scenario.value === 'all-normal') {
        return {
            ...game,
            healthStatus: 'normal', healthReason: '健康檢查與核心服務正常', healthDataValid: true, expectedService: true, launchAvailable: true, blockedNewLaunch: false,
            round: { ...game.round, failed: 0, timeout: 0, status: 'normal', mainFailureType: '—' },
            ggapStatus: 'normal', alerts: [], risks: [],
        }
    }
    if (scenario.value === 'health-no-data') {
        return { ...game, healthStatus: 'no_data', healthReason: '健康資料尚未取得或已超過有效時間', healthDataValid: false, launchAvailable: false, lastChecked: minutesAgo(45) }
    }
    return game
}

const scopedGames = computed(() => {
    if (scenario.value === 'empty') return []
    return mockGames
        .filter((game) => game.environment === appliedFilters.value.environment)
        .filter((game) => !appliedFilters.value.gameType || game.gameType === appliedFilters.value.gameType)
        .filter((game) => !appliedFilters.value.game || game.gameId === appliedFilters.value.game)
        .map(transformForScenario)
})

function overallStatus(game: GameMonitor): HealthStatus {
    if (game.healthStatus === 'isolated') return 'isolated'
    if (game.healthStatus === 'error' || game.round.status === 'danger' || game.ggapStatus === 'danger' || game.risks.some((risk) => risk.ongoing && (risk.severity === 'critical' || risk.severity === 'high'))) return 'error'
    if (game.healthStatus === 'degraded' || game.round.status === 'warning' || game.ggapStatus === 'warning') return 'degraded'
    if (game.healthStatus === 'no_data') return 'no_data'
    if (game.healthStatus === 'maintenance') return 'maintenance'
    return 'normal'
}

function roundRate(game: GameMonitor) {
    const metrics = roundMetrics(game)
    const denominator = metrics.success + metrics.failed + metrics.timeout
    return denominator ? (metrics.success / denominator) * 100 : null
}

function ggapP95(game: GameMonitor) {
    if (!game.integrations.length || game.ggapStatus === 'no_data' || scenario.value === 'partial-failure') return null
    return aggregateIntegrations(game).p95
}

function matchesFocus(game: GameMonitor) {
    if (focus.value === 'all') return true
    if (focus.value === 'service') return ['isolated', 'error', 'degraded', 'no_data'].includes(game.healthStatus)
    if (focus.value === 'round') return game.round.failed + game.round.timeout > 0 && game.round.status !== 'normal'
    if (focus.value === 'ggap') return game.ggapStatus === 'warning' || game.ggapStatus === 'danger'
    if (focus.value === 'alert') return game.alerts.length > 0
    return game.risks.length > 0
}

const focusFilteredGames = computed(() => scopedGames.value.filter(matchesFocus))

const statusPriority: Record<HealthStatus, number> = { isolated: 1, error: 2, degraded: 3, no_data: 4, maintenance: 6, normal: 7 }

function defaultCompare(left: GameMonitor, right: GameMonitor) {
    const priority = (game: GameMonitor) => {
        const status = overallStatus(game)
        if (status === 'isolated') return 1
        if (status === 'error') return 2
        if (status === 'degraded') return 3
        if (status === 'no_data') return 4
        if (game.alerts.length) return 5
        if (game.risks.length) return 6
        if (status === 'maintenance') return 7
        return 8
    }
    const priorityDiff = priority(left) - priority(right)
    if (priorityDiff) return priorityDiff
    return right.lastChecked.getTime() - left.lastChecked.getTime()
}

function sortableValue(game: GameMonitor, key: SortKey): string | number {
    if (key === 'game') return game.gameName
    if (key === 'type') return gameTypeLabels[game.gameType]
    if (key === 'version') return game.version
    if (key === 'service') return statusPriority[game.healthStatus]
    if (key === 'roundRate') return roundRate(game) ?? -1
    if (key === 'ggapP95') return ggapP95(game) ?? -1
    if (key === 'alerts') return game.alerts.length
    if (key === 'risks') return game.risks.length
    if (key === 'lastChecked') return game.lastChecked.getTime()
    return statusPriority[overallStatus(game)]
}

const sortedGames = computed(() => [...focusFilteredGames.value].sort((left, right) => {
    if (sortKey.value === 'overall' && sortDirection.value === 'asc') return defaultCompare(left, right)
    const a = sortableValue(left, sortKey.value)
    const b = sortableValue(right, sortKey.value)
    const result = typeof a === 'string' && typeof b === 'string' ? a.localeCompare(b, 'zh-Hant') : Number(a) - Number(b)
    return sortDirection.value === 'asc' ? result : -result
}))

const pageCount = computed(() => Math.max(1, Math.ceil(sortedGames.value.length / pageSize.value)))
const pagedGames = computed(() => sortedGames.value.slice(page.value * pageSize.value, (page.value + 1) * pageSize.value))

function requestSort(key: SortKey) {
    if (sortKey.value === key) sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    else {
        sortKey.value = key
        sortDirection.value = key === 'game' || key === 'type' || key === 'version' ? 'asc' : 'desc'
    }
    page.value = 0
}

function sortIcon(key: SortKey) {
    if (sortKey.value !== key) return 'pi pi-sort-alt'
    return sortDirection.value === 'asc' ? 'pi pi-sort-amount-up-alt' : 'pi pi-sort-amount-down'
}

function changePageSize() {
    page.value = 0
}

function formatNumber(value: number) {
    return new Intl.NumberFormat('zh-TW').format(value)
}

function formatDateTime(value: Date | null) {
    if (!value) return '—'
    return new Intl.DateTimeFormat('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(value)
}

function formatPercent(value: number | null) {
    if (value === null) return '無資料'
    return `${value.toFixed(value >= 99 ? 2 : 1)}%`
}

function formatDuration() {
    const active = appliedFilters.value
    if (active.quickRange === '1h') return '近 1 小時'
    if (active.quickRange === '6h') return '近 6 小時'
    if (active.quickRange === '24h') return '近 24 小時'
    return `${formatDateTime(active.dateRange[0])} ～ ${formatDateTime(active.dateRange[1])}`
}

function healthClass(status: HealthStatus) {
    return `monitoring-pill--${status.replace('_', '-')}`
}

function signalClass(status: SignalStatus) {
    return `monitoring-pill--signal-${status.replace('_', '-')}`
}

function totalRoundMetrics() {
    return scopedGames.value.reduce((sum, game) => {
        const metrics = roundMetrics(game)
        sum.success += metrics.success
        sum.failed += metrics.failed
        sum.timeout += metrics.timeout
        sum.processing += metrics.processing
        return sum
    }, { success: 0, failed: 0, timeout: 0, processing: 0 })
}

function highestTone(statuses: SignalStatus[]): SummaryCard['tone'] {
    if (statuses.includes('danger')) return 'danger'
    if (statuses.includes('warning') || statuses.includes('no_data')) return 'warning'
    return statuses.length ? 'success' : 'neutral'
}

const summaryCards = computed<SummaryCard[]>(() => {
    const games = scopedGames.value
    const serviceCounts = (Object.keys(healthLabels) as HealthStatus[]).reduce<Record<HealthStatus, number>>((counts, status) => {
        counts[status] = games.filter((game) => game.healthStatus === status).length
        return counts
    }, { normal: 0, degraded: 0, error: 0, isolated: 0, no_data: 0, maintenance: 0 })
    const eligible = games.filter((game) => game.expectedService).length
    const healthy = games.filter((game) => game.expectedService && game.healthStatus === 'normal').length
    const serviceTone: SummaryCard['tone'] = serviceCounts.error || serviceCounts.isolated ? 'danger' : serviceCounts.degraded || serviceCounts.no_data ? 'warning' : games.length ? 'success' : 'neutral'
    const abnormalGames = games.filter((game) => !['normal', 'maintenance'].includes(game.healthStatus)).slice(0, 5)
    const rounds = totalRoundMetrics()
    const denominator = rounds.success + rounds.failed + rounds.timeout
    const successRate = denominator ? (rounds.success / denominator) * 100 : null
    const lowRateGames = [...games].filter((game) => roundRate(game) !== null).sort((a, b) => (roundRate(a) ?? 100) - (roundRate(b) ?? 100)).slice(0, 5)
    const integrations = games.flatMap((game) => resolvedIntegrations(game).map((metric) => ({ game, metric })))
    const totalRequests = integrations.reduce((sum, item) => sum + item.metric.total, 0)
    const latencySampleSet = integrations.flatMap((item) => item.metric.latencySamples)
    const overallP95 = scenario.value === 'partial-failure' ? null : percentile(latencySampleSet, 95)
    const timeoutCount = integrations.reduce((sum, item) => sum + item.metric.timeouts, 0)
    const failureCount = integrations.reduce((sum, item) => sum + item.metric.failures, 0)
    const retryCount = integrations.reduce((sum, item) => sum + item.metric.retries, 0)
    const attentionIntegrations = [...integrations].sort((a, b) => (b.metric.p95 ?? -1) - (a.metric.p95 ?? -1)).slice(0, 5)
    const alerts = games.flatMap((game) => game.alerts.map((alert) => ({ game, alert })))
    const criticalAlerts = alerts.filter((item) => item.alert.severity === 'critical').length
    const overdueAlerts = alerts.filter((item) => item.alert.overdue).length
    const mitigationFailed = alerts.filter((item) => item.alert.mitigationFailed).length
    const prioritizedAlerts = [...alerts].sort((a, b) => Number(b.alert.severity === 'critical') - Number(a.alert.severity === 'critical') || Number(b.alert.mitigationFailed) - Number(a.alert.mitigationFailed) || Number(b.alert.overdue) - Number(a.alert.overdue)).slice(0, 5)
    const risks = games.flatMap((game) => game.risks.map((risk) => ({ game, risk })))
    const ongoingRisks = risks.filter((item) => item.risk.ongoing).length
    const noAlertRisks = risks.filter((item) => !item.risk.alertId).length
    const prioritizedRisks = [...risks].sort((a, b) => ['critical', 'high', 'medium', 'low', 'info'].indexOf(a.risk.severity) - ['critical', 'high', 'medium', 'low', 'info'].indexOf(b.risk.severity) || Number(b.risk.ongoing) - Number(a.risk.ongoing)).slice(0, 5)

    return [
        {
            key: 'service', label: '遊戲服務健康', value: `${healthy} / ${eligible}`, status: serviceTone === 'danger' ? '存在服務事故' : serviceTone === 'warning' ? '需要確認' : games.length ? '全部可服務' : '無符合資料', note: `目前狀態 · 維護中 ${serviceCounts.maintenance}`,
            icon: 'pi pi-heart-fill', tone: serviceTone,
            tip: [`正常 ${serviceCounts.normal}｜降級 ${serviceCounts.degraded}｜異常 ${serviceCounts.error}`, `隔離中 ${serviceCounts.isolated}｜無資料 ${serviceCounts.no_data}｜維護中 ${serviceCounts.maintenance}`, ...abnormalGames.map((game) => `${game.gameName}｜${healthLabels[game.healthStatus]}｜${game.healthReason}｜${formatDateTime(game.lastChecked)}`)].join('\n'),
        },
        {
            key: 'round', label: '遊戲回合成功率', value: formatPercent(successRate), status: successRate === null ? '無資料' : highestTone(games.map((game) => game.round.status)) === 'danger' ? '存在失敗集中' : highestTone(games.map((game) => game.round.status)) === 'warning' ? '需關注' : '正常', note: `成功 ${formatNumber(rounds.success)} · 失敗 ${formatNumber(rounds.failed)} · 逾時 ${formatNumber(rounds.timeout)}`,
            icon: 'pi pi-check-circle', tone: successRate === null ? 'neutral' : highestTone(games.map((game) => game.round.status)),
            tip: [`公式：成功 ÷（成功＋失敗＋逾時）`, `成功 ${formatNumber(rounds.success)}｜失敗 ${formatNumber(rounds.failed)}｜逾時 ${formatNumber(rounds.timeout)}｜處理中未納入 ${formatNumber(rounds.processing)}`, ...lowRateGames.map((game) => `${game.gameName}｜${formatPercent(roundRate(game))}｜失敗 ${formatNumber(roundMetrics(game).failed)}｜${game.round.mainFailureType}`)].join('\n'),
        },
        {
            key: 'ggap', label: 'GGAP 請求延遲', value: overallP95 === null ? '無資料' : `P95 ${formatNumber(overallP95)} ms`, status: scenario.value === 'partial-failure' ? '來源載入失敗' : overallP95 === null ? '無請求資料' : highestTone(games.map((game) => game.ggapStatus)) === 'danger' ? '對接異常' : highestTone(games.map((game) => game.ggapStatus)) === 'warning' ? '延遲升高' : '正常', note: scenario.value === 'partial-failure' ? '逾時 — · 失敗 — · 重試 —' : `逾時 ${formatNumber(timeoutCount)} · 失敗 ${formatNumber(failureCount)} · 重試 ${formatNumber(retryCount)}`,
            icon: 'pi pi-bolt', tone: scenario.value === 'partial-failure' ? 'danger' : overallP95 === null ? 'neutral' : highestTone(games.map((game) => game.ggapStatus)),
            tip: scenario.value === 'partial-failure' ? 'GGAP 請求指標來源載入失敗；不沿用上一次的請求數、逾時、失敗、重試或 percentile。其他成功來源仍保留。' : [`成功回應請求 ${formatNumber(totalRequests)}｜逾時 ${formatNumber(timeoutCount)}｜失敗 ${formatNumber(failureCount)}｜重試 ${formatNumber(retryCount)}`, ...attentionIntegrations.map(({ game, metric }) => `${game.gameName}｜${metric.direction}｜${metric.apiType}｜P50 ${metric.p50 ?? '—'} / P95 ${metric.p95 ?? '—'} / P99 ${metric.p99 ?? '—'} ms`)].join('\n'),
        },
        {
            key: 'alert', label: '高風險告警', value: formatNumber(alerts.length), status: alerts.length === 0 ? '目前無未結案告警' : criticalAlerts || overdueAlerts || mitigationFailed ? '立即處理' : '優先確認', note: `目前未結案告警 · 嚴重 ${criticalAlerts} · 高 ${alerts.length - criticalAlerts}`,
            icon: 'pi pi-bell', tone: alerts.length === 0 ? 'success' : criticalAlerts || overdueAlerts || mitigationFailed ? 'danger' : 'warning',
            tip: [`嚴重 ${criticalAlerts}｜高 ${alerts.length - criticalAlerts}`, `待處理 ${alerts.filter((item) => item.alert.status === 'pending').length}｜調查中 ${alerts.filter((item) => item.alert.status === 'investigating').length}｜已緩解待覆核 ${alerts.filter((item) => item.alert.status === 'mitigated').length}`, `逾期未覆核 ${overdueAlerts}｜自動處理失敗 ${mitigationFailed}`, ...prioritizedAlerts.map(({ game, alert }) => `${game.gameName}｜${alert.anomalyType}｜${severityLabels[alert.severity]}｜${handlingLabels[alert.status]}${alert.isolated ? '｜隔離中' : ''}`)].join('\n'),
        },
        {
            key: 'risk', label: '未處理異常', value: formatNumber(risks.length), status: risks.length === 0 ? '目前無未完成事件' : risks.some((item) => ['critical', 'high'].includes(item.risk.severity) || item.risk.ongoing) ? '優先處理' : '待確認', note: `目前未完成事件 · 持續 ${ongoingRisks} · 未建立告警 ${noAlertRisks}`,
            icon: 'pi pi-exclamation-triangle', tone: risks.length === 0 ? 'success' : risks.some((item) => ['critical', 'high'].includes(item.risk.severity) || item.risk.ongoing) ? 'danger' : 'warning',
            tip: [`待處理 ${risks.filter((item) => item.risk.status === 'pending').length}｜調查中 ${risks.filter((item) => item.risk.status === 'investigating').length}`, `仍持續發生 ${ongoingRisks}｜尚未建立 Alert ${noAlertRisks}`, ...Object.entries(sourceLabels).map(([source, label]) => `${label} ${risks.filter((item) => item.risk.source === source).length}`).filter((item) => !item.endsWith(' 0')), ...prioritizedRisks.map(({ game, risk }) => `${game.gameName}｜${risk.anomalyType}｜${severityLabels[risk.severity]}｜${risk.status === 'pending' ? '待處理' : '調查中'}`)].slice(0, 11).join('\n'),
        },
    ]
})

const allNormal = computed(() => scopedGames.value.length > 0 && scopedGames.value.every((game) => overallStatus(game) === 'normal') && scenario.value !== 'partial-failure')
const hasHealthNoData = computed(() => scopedGames.value.some((game) => game.healthStatus === 'no_data'))
const selectedGameIntegrations = computed(() => selectedGame.value ? resolvedIntegrations(selectedGame.value) : [])
const liveConnection = computed(() => {
    if (scenario.value === 'all-failure') return { label: '監控資料連線失敗', icon: 'pi pi-times-circle', tone: 'danger' }
    if (scenario.value === 'partial-failure') return { label: '部分監控來源異常', icon: 'pi pi-exclamation-triangle', tone: 'warning' }
    return { label: '監控資料已連線', icon: 'pi pi-check-circle', tone: 'success' }
})

function openDetails(game: GameMonitor) {
    selectedGame.value = game
    detailVisible.value = true
}

function goToRiskEvent(riskEventId: string) {
    if (!riskEventId) return
    void router.push({ path: '/monitoring/risk-reports', query: { risk_event_id: riskEventId } })
}

function goToAlert(alert: AlertItem) {
    if (!alert.alertId || !alert.riskEventId) return
    void router.push({ path: '/monitoring/alerts', query: { alert_id: alert.alertId, risk_event_id: alert.riskEventId } })
}

function goToRound(game: GameMonitor) {
    if (!game.providerRoundId) return
    const query: Record<string, string> = { round_id: game.providerRoundId }
    if (game.ggapRoundId) query.external_round_id = game.ggapRoundId
    void router.push({ path: '/reports', query })
}

function goToGgapRequests(game: GameMonitor) {
    if (!game.ggapProviderEventId) return
    const query: Record<string, string> = { provider_event_id: game.ggapProviderEventId }
    if (game.alerts[0]?.alertId) query.alert_id = game.alerts[0].alertId
    void router.push({ path: '/ggap/requests', query })
}

function retryAllSources() {
    scenario.value = 'standard'
    simulateLoading(420)
}

watch([() => draftFilters.environment, () => draftFilters.gameType], clearUnavailableGame)
watch([focus, pageSize, scenario, () => appliedFilters.value], () => { page.value = 0 })
watch(autoUpdate, (enabled) => {
    if (autoTimer) window.clearInterval(autoTimer)
    if (enabled) autoTimer = window.setInterval(refreshData, 30_000)
})
watch(scenario, () => {
    detailVisible.value = false
    if (scenario.value !== 'all-failure') simulateLoading(180)
})

onMounted(() => {
    loadTimer = window.setTimeout(() => { loading.value = false }, 460)
    autoTimer = window.setInterval(refreshData, 30_000)
})

onBeforeUnmount(() => {
    if (loadTimer) window.clearTimeout(loadTimer)
    if (refreshTimer) window.clearTimeout(refreshTimer)
    if (autoTimer) window.clearInterval(autoTimer)
})
</script>

<template>
    <div class="monitoring-page page-stack">
        <section class="monitoring-control-card" aria-labelledby="monitoring-query-title">
            <div class="monitoring-section-heading monitoring-control-heading">
                <div>
                    <span class="monitoring-eyebrow">監控範圍</span>
                    <h2 id="monitoring-query-title">查詢條件</h2>
                    <p>目前狀態與期間指標會使用同一組已套用條件。</p>
                </div>
                <div class="monitoring-scope-meta"><i class="pi pi-clock" />{{ timezoneLabel }}</div>
            </div>

            <div class="monitoring-query-grid">
                <div class="monitoring-field monitoring-field--environment">
                    <span class="monitoring-field-label">環境</span>
                    <div class="monitoring-radio-group" role="radiogroup" aria-label="監控環境">
                        <label data-testid="monitoring-environment-production">
                            <RadioButton v-model="draftFilters.environment" name="monitoring-environment" value="production" />
                            <span>{{ environmentOptionLabels.production }}</span>
                        </label>
                        <label data-testid="monitoring-environment-demo">
                            <RadioButton v-model="draftFilters.environment" name="monitoring-environment" value="demo" />
                            <span>{{ environmentOptionLabels.demo }}</span>
                        </label>
                    </div>
                </div>
                <label class="monitoring-field">
                    <span class="monitoring-field-label">遊戲類型</span>
                    <Select v-model="draftFilters.gameType" :options="[{ label: '全部遊戲類型', value: '' }, ...Object.entries(gameTypeLabels).map(([value, label]) => ({ label, value }))]" option-label="label" option-value="value" fluid />
                </label>
                <label class="monitoring-field">
                    <span class="monitoring-field-label">遊戲</span>
                    <Select v-model="draftFilters.game" :options="[{ label: '全部遊戲', value: '' }, ...gameOptions]" option-label="label" option-value="value" filter filter-placeholder="搜尋遊戲名稱或 Game ID" fluid />
                </label>
            </div>

            <div class="monitoring-time-row">
                <div class="monitoring-field monitoring-field--time">
                    <span class="monitoring-field-label">分析時間</span>
                    <div class="monitoring-quick-range" role="group" aria-label="分析時間快捷選項">
                        <button v-for="option in quickRanges" :key="option.value" type="button" :class="{ active: draftFilters.quickRange === option.value }" :aria-pressed="draftFilters.quickRange === option.value" @click="chooseQuickRange(option.value)">{{ option.label }}</button>
                    </div>
                </div>
                <div class="monitoring-time-note"><i class="pi pi-info-circle" />分析時間只影響遊戲回合成功率、GGAP 請求延遲與期間明細。</div>
            </div>
            <DateTimeRangeField v-if="draftFilters.quickRange === 'custom'" :model-value="draftFilters.dateRange" class="monitoring-custom-range" @update:model-value="handleCustomRange" />
            <p v-if="filterError" class="monitoring-filter-error"><i class="pi pi-exclamation-circle" />{{ filterError }}</p>

            <div class="monitoring-control-footer">
                <div class="monitoring-applied-scope">
                    <span><i class="pi pi-server" />{{ environmentLabels[appliedFilters.environment] }}</span>
                    <span><i class="pi pi-calendar" />{{ formatDuration() }}</span>
                    <span><i class="pi pi-database" />Mock data</span>
                </div>
                <div class="monitoring-control-actions">
                    <Button label="重置" icon="pi pi-undo" severity="secondary" outlined data-testid="monitoring-reset" @click="resetFilters" />
                    <Button label="查詢" icon="pi pi-search" data-testid="monitoring-query" @click="applyFilters" />
                </div>
            </div>
        </section>

        <section class="monitoring-livebar" :aria-label="`監控更新狀態：${liveConnection.label}`" aria-live="polite">
            <div class="monitoring-live-status" :class="`monitoring-live-status--${liveConnection.tone}`"><i :class="liveConnection.icon" aria-hidden="true" /><span>{{ liveConnection.label }}</span></div>
            <div class="monitoring-live-actions">
                <label class="monitoring-scenario-field">
                    <span>狀態預覽（Mock）</span>
                    <Select v-model="scenario" :options="scenarioOptions" option-label="label" option-value="value" size="small" />
                </label>
                <span class="monitoring-updated">最後更新：{{ formatDateTime(lastUpdated) }}</span>
                <Button icon="pi pi-refresh" severity="secondary" text rounded aria-label="手動重新整理" v-tooltip.top="'手動重新整理'" :loading="refreshing" data-testid="monitoring-refresh" @click="refreshData" />
                <label class="monitoring-auto-update"><ToggleSwitch v-model="autoUpdate" input-id="monitoring-auto-update" /><span>自動更新</span></label>
            </div>
        </section>

        <div v-if="refreshing" class="monitoring-refresh-notice" role="status"><i class="pi pi-spin pi-spinner" />正在重新整理監控摘要與列表；目前資料暫時保留。</div>

        <section v-if="scenario === 'all-failure'" class="monitoring-global-state monitoring-global-state--error" role="alert">
            <i class="pi pi-cloud-download" />
            <div><strong>監控資料來源全部載入失敗</strong><p>目前無法取得服務健康、遊戲回合、GGAP、風控事件與告警資料。畫面不會沿用前一次數值。</p></div>
            <Button label="重新載入" icon="pi pi-refresh" severity="danger" outlined @click="retryAllSources" />
        </section>

        <template v-else>
            <section v-if="loading" class="monitoring-summary-grid" aria-label="監控摘要載入中" aria-busy="true">
                <article v-for="index in 5" :key="index" class="monitoring-summary-card monitoring-summary-card--loading"><span /><strong /><small /></article>
            </section>

            <section v-else class="monitoring-summary-grid" aria-label="監控摘要">
                <article v-for="card in summaryCards" :key="card.key" class="monitoring-summary-card" :class="[`monitoring-summary-card--${card.tone}`, { active: focus === card.key }]" role="button" tabindex="0" :aria-pressed="focus === card.key" :data-testid="`monitoring-card-${card.key}`" @click="selectCard(card.key)" @keydown.enter.prevent="selectCard(card.key)" @keydown.space.prevent="selectCard(card.key)">
                    <div class="monitoring-summary-top">
                        <span><i :class="card.icon" />{{ card.label }}</span>
                        <i class="pi pi-info-circle monitoring-info" tabindex="0" role="img" :aria-label="`${card.label}資訊提示`" v-tooltip.top="card.tip" @click.stop @keydown.stop />
                    </div>
                    <strong>{{ card.value }}</strong>
                    <span class="monitoring-summary-status" :class="`monitoring-summary-status--${card.tone}`">{{ card.status }}</span>
                    <small>{{ card.note }}</small>
                </article>
            </section>

            <section v-if="scenario === 'partial-failure'" class="monitoring-source-state monitoring-source-state--warning" role="status">
                <i class="pi pi-exclamation-triangle" /><div><strong>部分資料來源載入失敗</strong><p>GGAP 請求指標暫時無法取得；服務健康、遊戲回合、風控事件與告警仍可查看，失敗欄位不沿用舊值。</p></div>
            </section>
            <section v-else-if="allNormal" class="monitoring-source-state monitoring-source-state--success" role="status">
                <i class="pi pi-check-circle" /><div><strong>目前全部服務正常</strong><p>所選範圍內沒有服務異常、高風險告警或未處理異常；期間指標也在 mock 正常狀態。</p></div>
            </section>
            <section v-else-if="hasHealthNoData" class="monitoring-source-state monitoring-source-state--neutral" role="status">
                <i class="pi pi-clock" /><div><strong>部分健康資料尚未取得或已過期</strong><p>無資料不視為正常；請確認最後檢查時間與資料有效性。</p></div>
            </section>

            <section class="monitoring-focus-section" aria-labelledby="monitoring-focus-title">
                <div class="monitoring-section-heading">
                    <div><span class="monitoring-eyebrow">關注項目</span><h2 id="monitoring-focus-title">快速篩選遊戲監控列表</h2><p>只篩選下方列表，不重新計算摘要卡；再次點擊同一張卡可清除快捷條件。</p></div>
                </div>
                <div class="monitoring-segments" role="group" aria-label="關注項目">
                    <button v-for="option in focusOptions" :key="option.value" type="button" :class="{ active: focus === option.value }" :aria-pressed="focus === option.value" :data-testid="`monitoring-focus-${option.value}`" @click="focus = option.value; page = 0"><i :class="option.icon" />{{ option.label }}</button>
                </div>
            </section>

            <section id="monitoring-game-list" class="monitoring-list-section" aria-labelledby="monitoring-game-list-title">
                <div class="monitoring-section-heading monitoring-list-heading">
                    <div><span class="monitoring-eyebrow">逐款判讀</span><h2 id="monitoring-game-list-title">遊戲監控列表</h2><p>排序先作用於完整查詢結果，再進行分頁；整體狀態保留各信號的最高優先度。</p></div>
                    <div class="monitoring-list-meta"><span><i class="pi pi-database" />{{ formatNumber(sortedGames.length) }} 款遊戲</span><Select v-model="pageSize" :options="pageSizeOptions" option-label="label" option-value="value" size="small" @change="changePageSize" /></div>
                </div>

                <div v-if="loading" class="monitoring-table-state" aria-busy="true"><i class="pi pi-spin pi-spinner" /><div><strong>正在載入遊戲監控資料</strong><p>摘要與列表會使用同一組已套用條件。</p></div></div>
                <div v-else-if="!sortedGames.length" class="monitoring-table-state">
                    <i class="pi pi-inbox" /><div><strong>查無符合條件的遊戲</strong><p>目前環境、遊戲類型、遊戲與關注項目沒有相符資料。</p></div><Button label="重置條件" icon="pi pi-undo" severity="secondary" outlined @click="resetFilters" />
                </div>
                <div v-else class="monitoring-table-shell">
                    <div class="monitoring-table-scroll" tabindex="0" aria-label="遊戲監控列表，可水平捲動">
                        <table class="monitoring-table">
                            <thead><tr>
                                <th><button type="button" @click="requestSort('overall')">整體狀態 <i :class="sortIcon('overall')" /></button></th>
                                <th><button type="button" @click="requestSort('game')">遊戲名稱 <i :class="sortIcon('game')" /></button></th>
                                <th><button type="button" @click="requestSort('type')">遊戲類型 <i :class="sortIcon('type')" /></button></th>
                                <th><button type="button" @click="requestSort('version')">遊戲版本 <i :class="sortIcon('version')" /></button></th>
                                <th><button type="button" @click="requestSort('service')">遊戲服務 <i :class="sortIcon('service')" /></button></th>
                                <th><button type="button" @click="requestSort('roundRate')">遊戲回合成功率 <i class="pi pi-info-circle" v-tooltip.top="'成功 ÷（成功＋失敗＋逾時）；處理中不納入。'" tabindex="0" /><i :class="sortIcon('roundRate')" /></button></th>
                                <th><button type="button" @click="requestSort('ggapP95')">GGAP 請求延遲 <i class="pi pi-info-circle" v-tooltip.top="'所選分析時間內成功取得回應請求的整體 P95；狀態另考量逾時與失敗。'" tabindex="0" /><i :class="sortIcon('ggapP95')" /></button></th>
                                <th><button type="button" @click="requestSort('alerts')">高風險告警 <i :class="sortIcon('alerts')" /></button></th>
                                <th><button type="button" @click="requestSort('risks')">未處理異常 <i :class="sortIcon('risks')" /></button></th>
                                <th><button type="button" @click="requestSort('lastChecked')">最後檢查時間 <i :class="sortIcon('lastChecked')" /></button></th>
                                <th>操作</th>
                            </tr></thead>
                            <tbody><tr v-for="game in pagedGames" :key="`${game.environment}-${game.gameId}`" :data-testid="`monitoring-row-${game.gameId}`">
                                <td><span class="monitoring-pill" :class="healthClass(overallStatus(game))">{{ healthLabels[overallStatus(game)] }}</span></td>
                                <td><div class="monitoring-game-cell"><strong>{{ game.gameName }}</strong><code>{{ game.gameId }}</code></div></td>
                                <td>{{ gameTypeLabels[game.gameType] }}</td>
                                <td><code>{{ game.version }}</code></td>
                                <td><span class="monitoring-pill" :class="healthClass(game.healthStatus)">{{ healthLabels[game.healthStatus] }}</span><small class="monitoring-cell-note">{{ game.healthReason }}</small></td>
                                <td><strong class="monitoring-number">{{ formatPercent(roundRate(game)) }}</strong><small class="monitoring-cell-note">失敗 {{ formatNumber(roundMetrics(game).failed) }} · 逾時 {{ formatNumber(roundMetrics(game).timeout) }}</small></td>
                                <td><span v-if="scenario === 'partial-failure'" class="monitoring-pill monitoring-pill--no-data">無資料</span><template v-else><strong class="monitoring-number">{{ ggapP95(game) === null ? '無資料' : `P95 ${formatNumber(ggapP95(game) ?? 0)} ms` }}</strong><small class="monitoring-cell-note">{{ signalLabels[game.ggapStatus] }}</small></template></td>
                                <td><span :class="['monitoring-count', { 'monitoring-count--danger': game.alerts.length }]">{{ game.alerts.length }}</span></td>
                                <td><span :class="['monitoring-count', { 'monitoring-count--warning': game.risks.length }]">{{ game.risks.length }}</span></td>
                                <td><time class="monitoring-time">{{ formatDateTime(game.lastChecked) }}</time><small v-if="!game.healthDataValid" class="monitoring-cell-note monitoring-cell-note--danger">資料已過期</small></td>
                                <td><Button label="查看詳情" icon="pi pi-arrow-up-right" text data-testid="monitoring-open-detail" @click="openDetails(game)" /></td>
                            </tr></tbody>
                        </table>
                    </div>
                    <div class="monitoring-pagination">
                        <span>第 {{ page + 1 }} / {{ pageCount }} 頁</span>
                        <div><Button icon="pi pi-angle-left" severity="secondary" text rounded aria-label="上一頁" :disabled="page === 0" data-testid="monitoring-prev-page" @click="page--" /><Button icon="pi pi-angle-right" severity="secondary" text rounded aria-label="下一頁" :disabled="page >= pageCount - 1" data-testid="monitoring-next-page" @click="page++" /></div>
                    </div>
                </div>
            </section>
        </template>

        <Dialog v-model:visible="detailVisible" modal dismissable-mask class="monitoring-detail-dialog" :style="{ width: 'min(1240px, calc(100vw - 24px))' }" :header="selectedGame ? `${selectedGame.gameName} / 監控詳情` : '遊戲監控詳情'">
            <div v-if="selectedGame" class="monitoring-detail-content">
                <section class="monitoring-detail-hero">
                    <div><span class="monitoring-eyebrow">唯讀監控詳情</span><h2>{{ selectedGame.gameName }}</h2><code>{{ selectedGame.gameId }}</code></div>
                    <div class="monitoring-detail-badges"><span class="monitoring-pill" :class="healthClass(overallStatus(selectedGame))">整體 {{ healthLabels[overallStatus(selectedGame)] }}</span><span class="monitoring-pill monitoring-pill--neutral">{{ environmentLabels[selectedGame.environment] }}</span><span class="monitoring-pill monitoring-pill--neutral">{{ selectedGame.version }}</span></div>
                </section>

                <section class="monitoring-detail-section">
                    <div class="monitoring-detail-title"><i class="pi pi-server" /><div><h3>遊戲與服務</h3><p>遊戲本身的健康、可啟動與資料有效性。</p></div></div>
                    <div class="monitoring-fact-grid">
                        <div><span>遊戲類型</span><strong>{{ gameTypeLabels[selectedGame.gameType] }}</strong></div><div><span>遊戲版本</span><strong><code>{{ selectedGame.version }}</code></strong></div><div><span>遊戲服務狀態</span><strong>{{ healthLabels[selectedGame.healthStatus] }}</strong></div><div><span>最後健康檢查</span><strong>{{ formatDateTime(selectedGame.lastChecked) }}</strong></div><div><span>資料有效性</span><strong>{{ selectedGame.healthDataValid ? '有效' : '已過期／尚未取得' }}</strong></div><div><span>新遊戲啟動</span><strong>{{ selectedGame.blockedNewLaunch ? '已阻擋' : selectedGame.launchAvailable ? '可啟動' : '目前不可啟動' }}</strong></div>
                    </div>
                    <p class="monitoring-detail-reason"><i class="pi pi-info-circle" />{{ selectedGame.healthReason }}</p>
                </section>

                <section class="monitoring-detail-section">
                    <div class="monitoring-detail-title"><i class="pi pi-check-circle" /><div><h3>遊戲回合</h3><p>{{ formatDuration() }}</p></div></div>
                    <div class="monitoring-fact-grid">
                        <div><span>成功率</span><strong>{{ formatPercent(roundRate(selectedGame)) }}</strong></div><div><span>成功</span><strong>{{ formatNumber(roundMetrics(selectedGame).success) }}</strong></div><div><span>失敗</span><strong>{{ formatNumber(roundMetrics(selectedGame).failed) }}</strong></div><div><span>逾時</span><strong>{{ formatNumber(roundMetrics(selectedGame).timeout) }}</strong></div><div><span>處理中（未納入）</span><strong>{{ formatNumber(roundMetrics(selectedGame).processing) }}</strong></div><div><span>主要失敗類型</span><strong>{{ selectedGame.round.mainFailureType }}</strong></div>
                    </div>
                </section>

                <section class="monitoring-detail-section">
                    <div class="monitoring-detail-title"><i class="pi pi-bolt" /><div><h3>GGAP 直接對接</h3><p>依方向與 API 類型拆分，未推論 GGAP 與代理商下游狀態。</p></div></div>
                    <div v-if="scenario === 'partial-failure'" class="monitoring-detail-empty monitoring-detail-empty--warning"><i class="pi pi-exclamation-triangle" />GGAP 請求指標來源載入失敗；不顯示上一次數值。</div>
                    <div v-else-if="selectedGameIntegrations.length" class="monitoring-detail-table-wrap"><table class="monitoring-detail-table"><thead><tr><th>方向</th><th>API 類型</th><th>請求數</th><th>P50</th><th>P95</th><th>P99</th><th>逾時</th><th>失敗</th><th>重試</th><th>最近異常／錯誤摘要</th></tr></thead><tbody><tr v-for="metric in selectedGameIntegrations" :key="`${metric.direction}-${metric.apiType}`"><td>{{ metric.direction }}</td><td><code>{{ metric.apiType }}</code></td><td>{{ formatNumber(metric.total) }}</td><td>{{ metric.p50 === null ? '—' : `${metric.p50} ms` }}</td><td><strong>{{ metric.p95 === null ? '—' : `${metric.p95} ms` }}</strong></td><td>{{ metric.p99 === null ? '—' : `${metric.p99} ms` }}</td><td>{{ formatNumber(metric.timeouts) }}</td><td>{{ formatNumber(metric.failures) }}</td><td>{{ formatNumber(metric.retries) }}</td><td><time>{{ formatDateTime(metric.lastErrorAt) }}</time><small>{{ metric.lastError || '—' }}</small></td></tr></tbody></table></div>
                    <div v-else class="monitoring-detail-empty"><i class="pi pi-inbox" />所選分析時間內沒有 GGAP 直接對接請求，不視為正常。</div>
                </section>

                <section class="monitoring-detail-section">
                    <div class="monitoring-detail-title"><i class="pi pi-shield" /><div><h3>風控事件與告警</h3><p>目前未結案 Alert 與待處理／調查中的風控事件。</p></div></div>
                    <div class="monitoring-risk-grid">
                        <div><h4>高風險告警</h4><div v-if="selectedGame.alerts.length" class="monitoring-risk-list"><article v-for="alert in selectedGame.alerts" :key="alert.alertId"><div><span class="monitoring-pill" :class="alert.severity === 'critical' ? 'monitoring-pill--error' : 'monitoring-pill--degraded'">{{ severityLabels[alert.severity] }}</span><strong>{{ alert.anomalyType }}</strong></div><code>{{ alert.alertId }}</code><p>{{ handlingLabels[alert.status] }}<template v-if="alert.overdue"> · 已逾期</template><template v-if="alert.isolated"> · 隔離中</template><template v-if="alert.mitigationFailed"> · 自動處理失敗</template></p></article></div><p v-else class="monitoring-detail-empty"><i class="pi pi-check-circle" />目前沒有高風險告警。</p></div>
                        <div><h4>未處理風控事件</h4><div v-if="selectedGame.risks.length" class="monitoring-risk-list"><article v-for="risk in selectedGame.risks" :key="risk.riskEventId"><div><span class="monitoring-pill" :class="['critical', 'high'].includes(risk.severity) ? 'monitoring-pill--error' : 'monitoring-pill--degraded'">{{ severityLabels[risk.severity] }}</span><strong>{{ risk.anomalyType }}</strong></div><code>{{ risk.riskEventId }}</code><p>{{ sourceLabels[risk.source] }} · {{ risk.status === 'pending' ? '待處理' : '調查中' }}<template v-if="risk.ongoing"> · 持續發生</template><template v-if="!risk.alertId"> · 尚未建立 Alert</template></p></article></div><p v-else class="monitoring-detail-empty"><i class="pi pi-check-circle" />目前沒有未處理風控事件。</p></div>
                    </div>
                </section>

                <section class="monitoring-detail-section monitoring-detail-links">
                    <div class="monitoring-detail-title"><i class="pi pi-directions-alt" /><div><h3>關聯資料導向</h3><p>只顯示具備對應識別碼的有效入口；目標頁仍會驗證資料與權限。</p></div></div>
                    <div class="monitoring-link-grid">
                        <Button v-for="risk in selectedGame.risks" :key="`risk-${risk.riskEventId}`" :label="`查看風控事件 · ${risk.riskEventId}`" icon="pi pi-chart-bar" severity="secondary" outlined @click="goToRiskEvent(risk.riskEventId)" />
                        <Button v-for="alert in selectedGame.alerts" :key="`alert-${alert.alertId}`" :label="`前往告警處理 · ${alert.alertId}`" icon="pi pi-bell" severity="danger" outlined @click="goToAlert(alert)" />
                        <Button v-if="selectedGame.providerRoundId" label="查看遊戲紀錄" icon="pi pi-list" severity="secondary" outlined @click="goToRound(selectedGame)" />
                        <Button v-if="selectedGame.ggapProviderEventId" label="查看 GGAP 請求紀錄" icon="pi pi-send" severity="secondary" outlined @click="goToGgapRequests(selectedGame)" />
                    </div>
                    <p v-if="!selectedGame.risks.length && !selectedGame.alerts.length && !selectedGame.providerRoundId && !selectedGame.ggapProviderEventId" class="monitoring-detail-empty"><i class="pi pi-link" />目前沒有可導向的關聯識別資料。</p>
                </section>
            </div>
            <template #footer><div class="monitoring-detail-footer"><span><i class="pi pi-eye" />此視窗為唯讀監控詳情，不提供隔離、解除、修改或結案操作。</span><Button label="關閉" severity="secondary" outlined @click="detailVisible = false" /></div></template>
        </Dialog>
    </div>
</template>

<style scoped>
.monitoring-page {
    width: 100%;
    max-width: 1500px;
    min-width: 0;
    margin: 0 auto;
    padding-bottom: 2.75rem;
    overflow-x: hidden;
    --monitoring-ink: #233a40;
    --monitoring-muted: #687d80;
    --monitoring-line: #d8e6e1;
    --monitoring-soft: #f3f9f7;
    --monitoring-teal: #17766f;
    --monitoring-blue: #4d749f;
    --monitoring-amber: #b87528;
    --monitoring-red: #b94a47;
    --monitoring-green: #36835f;
}

.monitoring-control-card,
.monitoring-focus-section,
.monitoring-list-section {
    min-width: 0;
    padding: 1.25rem;
    border: 1px solid var(--monitoring-line);
    border-radius: 1rem;
    background: var(--hig-bg-surface);
    box-shadow: 0 .55rem 1.6rem rgba(31, 73, 68, .045);
}

.monitoring-section-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
.monitoring-section-heading h2 { margin: .24rem 0 0; color: var(--monitoring-ink); font-size: 1.08rem; letter-spacing: -.015em; }
.monitoring-section-heading p { margin: .32rem 0 0; color: var(--monitoring-muted); font-size: .76rem; line-height: 1.55; }
.monitoring-eyebrow { color: var(--monitoring-teal); font-size: .65rem; font-weight: 850; letter-spacing: .13em; }
.monitoring-scope-meta { display: inline-flex; align-items: center; gap: .4rem; flex-shrink: 0; padding: .45rem .65rem; color: var(--monitoring-teal); border: 1px solid #c9e2d9; border-radius: 999px; background: #f0faf6; font-size: .7rem; font-weight: 750; }
.monitoring-query-grid { display: grid; grid-template-columns: 1.55fr .8fr 1fr; gap: .85rem; margin-top: 1rem; }
.monitoring-field { display: grid; align-content: start; gap: .42rem; min-width: 0; }
.monitoring-field-label { color: var(--monitoring-muted); font-size: .71rem; font-weight: 800; }
.monitoring-radio-group { display: flex; min-height: 2.55rem; align-items: center; gap: .55rem; }
.monitoring-radio-group label { display: inline-flex; min-width: 0; align-items: center; gap: .42rem; padding: .55rem .72rem; border: 1px solid var(--monitoring-line); border-radius: .7rem; color: var(--monitoring-ink); background: #fbfefd; font-size: .75rem; cursor: pointer; }
.monitoring-time-row { display: flex; align-items: flex-end; justify-content: space-between; gap: 1rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--monitoring-line); }
.monitoring-field--time { flex: 1; }
.monitoring-quick-range { display: flex; flex-wrap: wrap; gap: .4rem; }
.monitoring-quick-range button,
.monitoring-segments button { display: inline-flex; align-items: center; justify-content: center; gap: .36rem; min-height: 2.2rem; padding: .48rem .72rem; color: var(--monitoring-muted); border: 1px solid var(--monitoring-line); border-radius: .65rem; background: #fff; font: inherit; font-size: .72rem; font-weight: 750; cursor: pointer; transition: border-color 150ms ease, color 150ms ease, background 150ms ease, transform 150ms ease; }
.monitoring-quick-range button:hover,
.monitoring-segments button:hover { color: var(--monitoring-teal); border-color: #96c8bb; }
.monitoring-quick-range button.active,
.monitoring-segments button.active { color: #fff; border-color: var(--monitoring-teal); background: var(--monitoring-teal); box-shadow: 0 .35rem .9rem rgba(23, 118, 111, .16); }
.monitoring-time-note { display: flex; max-width: 31rem; align-items: flex-start; gap: .38rem; color: var(--monitoring-muted); font-size: .7rem; line-height: 1.5; }
.monitoring-time-note i { margin-top: .12rem; color: var(--monitoring-teal); }
.monitoring-custom-range { max-width: 45rem; margin-top: .8rem; }
.monitoring-filter-error { display: flex; align-items: center; gap: .4rem; margin: .65rem 0 0; color: var(--monitoring-red); font-size: .73rem; }
.monitoring-control-footer { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-top: 1rem; }
.monitoring-applied-scope { display: flex; flex-wrap: wrap; gap: .45rem; }
.monitoring-applied-scope span { display: inline-flex; align-items: center; gap: .34rem; padding: .36rem .55rem; color: var(--monitoring-muted); border-radius: .55rem; background: var(--monitoring-soft); font-size: .68rem; }
.monitoring-applied-scope i { color: var(--monitoring-teal); }
.monitoring-control-actions { display: flex; justify-content: flex-end; gap: .45rem; }

.monitoring-livebar { display: flex; min-width: 0; align-items: center; justify-content: space-between; gap: 1rem; padding: .65rem .8rem; border: 1px solid var(--monitoring-line); border-radius: .8rem; background: linear-gradient(90deg, #f7fbfa, #fff); }
.monitoring-live-status { display: inline-flex; flex-shrink: 0; align-items: center; gap: .45rem; color: var(--monitoring-ink); font-size: .72rem; font-weight: 800; }
.monitoring-live-status--success i { color: var(--monitoring-green); }
.monitoring-live-status--warning { color: #89581d; }
.monitoring-live-status--warning i { color: var(--monitoring-amber); }
.monitoring-live-status--danger { color: #963d3a; }
.monitoring-live-status--danger i { color: var(--monitoring-red); }
.monitoring-live-actions { display: flex; min-width: 0; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: .55rem; }
.monitoring-scenario-field { display: flex; align-items: center; gap: .45rem; color: var(--monitoring-muted); font-size: .68rem; }
.monitoring-scenario-field :deep(.p-select) { min-width: 10.5rem; }
.monitoring-updated { color: var(--monitoring-muted); font-size: .69rem; font-variant-numeric: tabular-nums; }
.monitoring-auto-update { display: inline-flex; align-items: center; gap: .42rem; color: var(--monitoring-ink); font-size: .7rem; font-weight: 750; }
.monitoring-refresh-notice { display: flex; align-items: center; gap: .45rem; padding: .7rem .85rem; color: #416e9f; border: 1px solid #c9dced; border-radius: .75rem; background: #eff6fc; font-size: .72rem; }

.monitoring-summary-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: .75rem; }
.monitoring-summary-card { position: relative; min-width: 0; min-height: 10.2rem; overflow: hidden; padding: 1rem 1.05rem; color: inherit; border: 1px solid var(--monitoring-line); border-top: 3px solid var(--monitoring-blue); border-radius: 1rem; background: #fff; box-shadow: 0 .55rem 1.5rem rgba(37, 87, 82, .045); cursor: pointer; transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease; }
.monitoring-summary-card::after { position: absolute; right: -1.55rem; bottom: -2.2rem; width: 6rem; height: 6rem; border: 1px solid rgba(23, 118, 111, .1); border-radius: 50%; content: ''; }
.monitoring-summary-card:hover,
.monitoring-summary-card:focus-visible,
.monitoring-summary-card.active { z-index: 1; transform: translateY(-2px); border-color: var(--monitoring-teal); outline: none; box-shadow: 0 .8rem 1.8rem rgba(23, 118, 111, .14); }
.monitoring-summary-card--success { border-top-color: var(--monitoring-green); }
.monitoring-summary-card--warning { border-top-color: var(--monitoring-amber); }
.monitoring-summary-card--danger { border-top-color: var(--monitoring-red); }
.monitoring-summary-card--neutral { border-top-color: #829397; }
.monitoring-summary-top { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; gap: .4rem; color: var(--monitoring-muted); font-size: .71rem; font-weight: 850; }
.monitoring-summary-top > span { display: inline-flex; min-width: 0; align-items: center; gap: .38rem; white-space: nowrap; }
.monitoring-summary-top > span i { color: var(--monitoring-teal); }
.monitoring-info { flex-shrink: 0; color: var(--monitoring-muted); cursor: help; }
.monitoring-info:focus-visible { color: var(--monitoring-teal); outline: 2px solid #96c8bb; outline-offset: 2px; border-radius: 50%; }
.monitoring-summary-card > strong { position: relative; z-index: 1; display: block; margin-top: .75rem; color: var(--monitoring-ink); font-size: clamp(1.45rem, 2vw, 1.8rem); line-height: 1; font-variant-numeric: tabular-nums; }
.monitoring-summary-status { position: relative; z-index: 1; display: inline-flex; margin-top: .65rem; padding: .25rem .44rem; border-radius: 999px; font-size: .64rem; font-weight: 850; }
.monitoring-summary-status--success { color: #347553; background: #eff9f3; }
.monitoring-summary-status--warning { color: #96611e; background: #fff8e8; }
.monitoring-summary-status--danger { color: #a6413d; background: #fff0ee; }
.monitoring-summary-status--neutral { color: #5f7276; background: #f1f5f4; }
.monitoring-summary-card > small { position: relative; z-index: 1; display: block; margin-top: .55rem; overflow: hidden; color: var(--monitoring-muted); font-size: .66rem; line-height: 1.35; text-overflow: ellipsis; white-space: nowrap; }
.monitoring-summary-card--loading { cursor: wait; }
.monitoring-summary-card--loading span,
.monitoring-summary-card--loading strong,
.monitoring-summary-card--loading small { display: block; border-radius: .35rem; background: linear-gradient(90deg, #edf4f2 25%, #f8fbfa 50%, #edf4f2 75%); background-size: 200% 100%; animation: monitoring-shimmer 1.25s infinite; }
.monitoring-summary-card--loading span { width: 62%; height: .75rem; }
.monitoring-summary-card--loading strong { width: 48%; height: 1.8rem; margin-top: 1rem; }
.monitoring-summary-card--loading small { width: 82%; height: .65rem; margin-top: 1rem; }
@keyframes monitoring-shimmer { to { background-position: -200% 0; } }

.monitoring-source-state,
.monitoring-global-state,
.monitoring-table-state { display: flex; min-width: 0; align-items: center; gap: .8rem; padding: 1rem 1.15rem; border: 1px solid var(--monitoring-line); border-radius: .85rem; background: var(--monitoring-soft); }
.monitoring-source-state > i,
.monitoring-global-state > i,
.monitoring-table-state > i { flex-shrink: 0; color: var(--monitoring-teal); font-size: 1.2rem; }
.monitoring-source-state > div,
.monitoring-global-state > div,
.monitoring-table-state > div { flex: 1; min-width: 0; }
.monitoring-source-state strong,
.monitoring-global-state strong,
.monitoring-table-state strong { color: var(--monitoring-ink); font-size: .82rem; }
.monitoring-source-state p,
.monitoring-global-state p,
.monitoring-table-state p { margin: .2rem 0 0; color: var(--monitoring-muted); font-size: .72rem; line-height: 1.5; }
.monitoring-source-state--warning { border-color: #efd9b3; background: #fff9ed; }
.monitoring-source-state--warning > i { color: var(--monitoring-amber); }
.monitoring-source-state--success { border-color: #c8e2d3; background: #f0faf4; }
.monitoring-source-state--success > i { color: var(--monitoring-green); }
.monitoring-source-state--neutral { border-color: #c9dced; background: #f1f7fc; }
.monitoring-global-state--error { border-color: #eccbc8; background: #fff7f6; }
.monitoring-global-state--error > i { color: var(--monitoring-red); }

.monitoring-focus-section { display: grid; gap: .9rem; }
.monitoring-segments { display: flex; flex-wrap: wrap; gap: .42rem; }
.monitoring-list-section { display: grid; gap: .85rem; padding: 0; overflow: hidden; }
.monitoring-list-heading { align-items: end; padding: 1.2rem 1.25rem 0; }
.monitoring-list-meta { display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: .65rem; color: var(--monitoring-muted); font-size: .7rem; }
.monitoring-list-meta > span { display: inline-flex; align-items: center; gap: .35rem; }
.monitoring-list-meta i { color: var(--monitoring-teal); }
.monitoring-table-state { margin: 0 1.25rem 1.25rem; border-style: dashed; }
.monitoring-table-shell { min-width: 0; border-top: 1px solid var(--monitoring-line); }
.monitoring-table-scroll { width: 100%; max-width: 100%; min-width: 0; overflow-x: auto; overscroll-behavior-inline: contain; scrollbar-color: #afcbc5 transparent; }
.monitoring-table { width: 100%; min-width: 1750px; border-collapse: collapse; font-size: .72rem; }
.monitoring-table th { padding: .72rem .75rem; color: var(--monitoring-muted); background: #f5faf8; text-align: left; white-space: nowrap; }
.monitoring-table th button { display: inline-flex; align-items: center; gap: .3rem; padding: 0; color: inherit; border: 0; background: transparent; font: inherit; font-weight: 850; cursor: pointer; }
.monitoring-table th button:hover { color: var(--monitoring-teal); }
.monitoring-table td { max-width: 15rem; padding: .78rem .75rem; color: var(--monitoring-ink); border-top: 1px solid var(--monitoring-line); vertical-align: middle; white-space: nowrap; }
.monitoring-table tbody tr:hover { background: #fbfefd; }
.monitoring-game-cell { display: grid; gap: .18rem; }
.monitoring-game-cell strong { font-size: .75rem; }
.monitoring-game-cell code,
.monitoring-table code,
.monitoring-detail-content code { color: #456d77; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .67rem; overflow-wrap: anywhere; }
.monitoring-pill { display: inline-flex; width: max-content; align-items: center; justify-content: center; padding: .25rem .48rem; border: 1px solid transparent; border-radius: 999px; font-size: .63rem; font-weight: 850; line-height: 1.2; white-space: nowrap; }
.monitoring-pill--normal,
.monitoring-pill--signal-normal { color: #347553; border-color: #c8e2d3; background: #eff9f3; }
.monitoring-pill--degraded,
.monitoring-pill--signal-warning { color: #96611e; border-color: #efd9b3; background: #fff9eb; }
.monitoring-pill--error,
.monitoring-pill--isolated,
.monitoring-pill--signal-danger { color: #a6413d; border-color: #ecc5c2; background: #fff0ee; }
.monitoring-pill--isolated { box-shadow: inset 3px 0 0 #b94a47; }
.monitoring-pill--no-data,
.monitoring-pill--signal-no-data,
.monitoring-pill--maintenance,
.monitoring-pill--neutral { color: #5f7276; border-color: #d7e3e0; background: #f2f6f5; }
.monitoring-cell-note { display: block; max-width: 13rem; margin-top: .22rem; overflow: hidden; color: var(--monitoring-muted); font-size: .63rem; text-overflow: ellipsis; }
.monitoring-cell-note--danger { color: var(--monitoring-red); font-weight: 800; }
.monitoring-number { font-variant-numeric: tabular-nums; }
.monitoring-count { display: inline-grid; min-width: 1.75rem; height: 1.75rem; place-items: center; color: var(--monitoring-muted); border-radius: .55rem; background: #f1f6f4; font-weight: 850; font-variant-numeric: tabular-nums; }
.monitoring-count--danger { color: #a6413d; background: #fff0ee; }
.monitoring-count--warning { color: #96611e; background: #fff8e8; }
.monitoring-time { color: var(--monitoring-muted); font-variant-numeric: tabular-nums; }
.monitoring-pagination { display: flex; align-items: center; justify-content: flex-end; gap: .65rem; padding: .55rem .8rem; border-top: 1px solid var(--monitoring-line); color: var(--monitoring-muted); font-size: .68rem; }
.monitoring-pagination > div { display: flex; }

.monitoring-detail-content { display: grid; min-width: 0; gap: .85rem; }
.monitoring-detail-hero { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; padding: 1rem 1.1rem; border: 1px solid var(--monitoring-line); border-radius: .85rem; background: linear-gradient(135deg, #f4faf7, #fff); }
.monitoring-detail-hero h2 { margin: .28rem 0 .22rem; color: var(--monitoring-ink); font-size: 1.18rem; }
.monitoring-detail-badges { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: .35rem; }
.monitoring-detail-section { min-width: 0; padding: 1rem 1.1rem; border: 1px solid var(--monitoring-line); border-radius: .85rem; background: #fff; }
.monitoring-detail-title { display: flex; align-items: flex-start; gap: .65rem; }
.monitoring-detail-title > i { display: grid; width: 2rem; height: 2rem; flex-shrink: 0; place-items: center; color: var(--monitoring-teal); border-radius: .6rem; background: #eaf7f2; }
.monitoring-detail-title h3 { margin: 0; color: var(--monitoring-ink); font-size: .88rem; }
.monitoring-detail-title p { margin: .22rem 0 0; color: var(--monitoring-muted); font-size: .7rem; line-height: 1.45; }
.monitoring-fact-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: .55rem; margin-top: .85rem; }
.monitoring-fact-grid > div { display: grid; min-width: 0; gap: .28rem; padding: .7rem; border-radius: .65rem; background: var(--monitoring-soft); }
.monitoring-fact-grid span { color: var(--monitoring-muted); font-size: .64rem; }
.monitoring-fact-grid strong { color: var(--monitoring-ink); font-size: .75rem; overflow-wrap: anywhere; }
.monitoring-detail-reason { display: flex; align-items: flex-start; gap: .38rem; margin: .7rem 0 0; color: var(--monitoring-muted); font-size: .7rem; }
.monitoring-detail-reason i { margin-top: .12rem; color: var(--monitoring-teal); }
.monitoring-detail-table-wrap { max-width: 100%; margin-top: .85rem; overflow-x: auto; border: 1px solid var(--monitoring-line); border-radius: .7rem; }
.monitoring-detail-table { width: 100%; min-width: 1050px; border-collapse: collapse; font-size: .69rem; }
.monitoring-detail-table th,
.monitoring-detail-table td { padding: .65rem .7rem; border-bottom: 1px solid var(--monitoring-line); text-align: left; white-space: nowrap; }
.monitoring-detail-table th { color: var(--monitoring-muted); background: #f5faf8; font-size: .64rem; }
.monitoring-detail-table tr:last-child td { border-bottom: 0; }
.monitoring-detail-table td:last-child { min-width: 15rem; }
.monitoring-detail-table td:last-child small { display: block; margin-top: .15rem; color: var(--monitoring-muted); }
.monitoring-detail-empty { display: flex; align-items: flex-start; gap: .42rem; margin: .8rem 0 0; padding: .72rem .8rem; color: var(--monitoring-muted); border-radius: .65rem; background: var(--monitoring-soft); font-size: .7rem; line-height: 1.45; }
.monitoring-detail-empty i { color: var(--monitoring-teal); }
.monitoring-detail-empty--warning { color: #96611e; background: #fff9eb; }
.monitoring-detail-empty--warning i { color: var(--monitoring-amber); }
.monitoring-risk-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .7rem; margin-top: .85rem; }
.monitoring-risk-grid > div { min-width: 0; padding: .8rem; border: 1px solid var(--monitoring-line); border-radius: .7rem; }
.monitoring-risk-grid h4 { margin: 0; color: var(--monitoring-ink); font-size: .76rem; }
.monitoring-risk-list { display: grid; gap: .5rem; margin-top: .65rem; }
.monitoring-risk-list article { min-width: 0; padding: .65rem; border-radius: .6rem; background: var(--monitoring-soft); }
.monitoring-risk-list article > div { display: flex; align-items: center; gap: .4rem; }
.monitoring-risk-list strong { min-width: 0; color: var(--monitoring-ink); font-size: .72rem; }
.monitoring-risk-list code { display: block; margin-top: .42rem; word-break: break-all; }
.monitoring-risk-list p { margin: .3rem 0 0; color: var(--monitoring-muted); font-size: .67rem; }
.monitoring-link-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem; margin-top: .85rem; }
.monitoring-link-grid :deep(.p-button) { min-width: 0; justify-content: flex-start; }
.monitoring-link-grid :deep(.p-button-label) { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.monitoring-detail-footer { display: flex; width: 100%; align-items: center; justify-content: space-between; gap: 1rem; }
.monitoring-detail-footer span { display: flex; align-items: flex-start; gap: .38rem; color: var(--monitoring-muted); font-size: .69rem; line-height: 1.45; }
.monitoring-detail-footer i { margin-top: .12rem; color: var(--monitoring-teal); }

:global(.monitoring-detail-dialog.p-dialog) { width: min(1240px, calc(100vw - 24px)); max-width: calc(100vw - 24px); max-height: calc(100vh - 16px); min-width: 0; overflow: hidden; }
:global(.monitoring-detail-dialog .p-dialog-header) { display: flex; min-width: 0; max-width: 100%; align-items: flex-start; gap: .65rem; box-sizing: border-box; }
:global(.monitoring-detail-dialog .p-dialog-title) { min-width: 0; flex: 1 1 auto; max-width: 100%; overflow-wrap: anywhere; word-break: break-word; white-space: normal; line-height: 1.35; }
:global(.monitoring-detail-dialog .p-dialog-header-actions) { flex: 0 0 auto; }
:global(.monitoring-detail-dialog .p-dialog-content),
:global(.monitoring-detail-dialog .p-dialog-footer) { min-width: 0; max-width: 100%; box-sizing: border-box; overflow-x: hidden; }
:global(.monitoring-detail-dialog .p-dialog-content) { max-height: calc(100vh - 190px); overflow-y: auto; }
:global(.monitoring-detail-dialog .p-dialog-footer) { position: sticky; bottom: 0; z-index: 2; border-top: 1px solid var(--monitoring-line); background: rgba(255,255,255,.98); }

@media (max-width: 1180px) {
    .monitoring-summary-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .monitoring-fact-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

@media (max-width: 850px) {
    .monitoring-query-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .monitoring-field--environment { grid-column: 1 / -1; }
    .monitoring-time-row { align-items: flex-start; flex-direction: column; }
    .monitoring-time-note { max-width: none; }
    .monitoring-livebar { align-items: flex-start; flex-direction: column; }
    .monitoring-live-actions { width: 100%; justify-content: flex-start; }
}

@media (max-width: 680px) {
    .monitoring-page { padding-bottom: 1.5rem; }
    .monitoring-control-card,
    .monitoring-focus-section { padding: 1rem; }
    .monitoring-section-heading,
    .monitoring-control-footer,
    .monitoring-list-heading,
    .monitoring-detail-hero,
    .monitoring-detail-footer { align-items: flex-start; flex-direction: column; }
    .monitoring-query-grid,
    .monitoring-risk-grid,
    .monitoring-link-grid { grid-template-columns: 1fr; }
    .monitoring-field--environment { grid-column: auto; }
    .monitoring-radio-group { align-items: stretch; flex-direction: column; }
    .monitoring-radio-group label { width: 100%; }
    .monitoring-control-actions { width: 100%; }
    .monitoring-control-actions :deep(.p-button) { flex: 1; }
    .monitoring-summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .6rem; }
    .monitoring-summary-card { min-height: 9.5rem; padding: .85rem; }
    .monitoring-summary-top > span { white-space: normal; }
    .monitoring-summary-card > strong { font-size: 1.45rem; }
    .monitoring-live-actions { align-items: flex-start; flex-direction: column; }
    .monitoring-scenario-field { width: 100%; align-items: flex-start; flex-direction: column; }
    .monitoring-scenario-field :deep(.p-select) { width: 100%; }
    .monitoring-source-state,
    .monitoring-global-state,
    .monitoring-table-state { align-items: flex-start; flex-wrap: wrap; }
    .monitoring-list-heading { padding: 1rem 1rem 0; }
    .monitoring-list-meta { justify-content: flex-start; }
    .monitoring-table-state { margin: 0 1rem 1rem; }
    .monitoring-fact-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .monitoring-detail-badges { justify-content: flex-start; }
    .monitoring-link-grid :deep(.p-button-label) { white-space: normal; }
}

@media (max-width: 420px) {
    .monitoring-summary-grid { grid-template-columns: 1fr; }
    .monitoring-quick-range button { flex: 1 1 calc(50% - .4rem); }
    .monitoring-segments button { flex: 1 1 calc(50% - .42rem); }
    .monitoring-fact-grid { grid-template-columns: 1fr; }
    .monitoring-pagination { justify-content: space-between; }
    :global(.monitoring-detail-dialog.p-dialog) { width: calc(100vw - 16px) !important; max-width: calc(100vw - 16px); max-height: calc(100vh - 12px); }
    :global(.monitoring-detail-dialog .p-dialog-header) { padding: .75rem .85rem; }
    :global(.monitoring-detail-dialog .p-dialog-title) { font-size: .88rem; }
    :global(.monitoring-detail-dialog .p-dialog-content) { max-height: calc(100vh - 180px); padding: .8rem .85rem 1rem; }
    :global(.monitoring-detail-dialog .p-dialog-footer) { padding: .65rem .85rem .75rem; }
}
</style>
