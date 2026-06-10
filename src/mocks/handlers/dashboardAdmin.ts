import { http, HttpResponse, delay } from 'msw'
import { expandDemoRows } from '@/utils/demoRows'

// ──────────────────────────────────────────────────────────────
// Types (copied verbatim from the demo DashboardView.vue / data/mock.ts)
// ──────────────────────────────────────────────────────────────

type DashboardKpi = {
    label: string
    value: string
    delta: string
    icon: string
    helper: string
    negative?: boolean
}

type RevenueTrendRow = {
    date: string
    bet: number
    win: number
    ggr: number
}

// Demo dashboard 的商戶排行取自 merchantRows（完整商戶主檔）前 8 筆；
// 這裡只回排行表會用到的欄位（demo 原始 mock 缺 currency 平面欄位，
// 表格的「幣別」欄會空白 — 這裡以 defaultCurrency 補上）
type MerchantRankRow = {
    code: string
    name: string
    agent: string
    currency: string
    bet: string
    ggr: string
    rtp: string
    status: string
}

type RiskAlertRow = {
    id: string
    level: string
    status: string
    message: string
    meta: string
}

// ──────────────────────────────────────────────────────────────
// Seeds (from demo data/mock.ts)
// ──────────────────────────────────────────────────────────────

const kpis: DashboardKpi[] = [
    { label: '總投注', value: 'USDT 101,092,200', delta: '+12.4%', icon: 'pi pi-wallet', helper: '依目前 Portal dataScope 彙總' },
    { label: '總派彩', value: 'USDT 106,780,800', delta: '+8.1%', icon: 'pi pi-send', helper: '含已完成與處理中注單' },
    { label: 'GGR', value: 'USDT -5,688,600', delta: '-3.2%', icon: 'pi pi-chart-line', helper: 'Bet - Win，可能為負', negative: true },
    { label: 'RTP', value: '105.63%', delta: '+4.1%', icon: 'pi pi-percentage', helper: 'Win / Bet，需觀察偏離' },
    { label: '有效投注', value: 'USDT 93,004,824', delta: '+9.8%', icon: 'pi pi-sync', helper: '分潤與結算參考值' },
    { label: '注單數', value: '8,809', delta: '+5.7%', icon: 'pi pi-receipt', helper: '成功與異常比例納入風控' },
    { label: '活躍玩家', value: '1,672', delta: '+4.4%', icon: 'pi pi-users', helper: '今日與本週去重玩家' },
    { label: '錢包成功率', value: '98.72%', delta: '+0.8%', icon: 'pi pi-shield', helper: '失敗 18 / 逾時 7' },
]

const revenueRows: RevenueTrendRow[] = [
    { date: '05/12', bet: 10800000, win: 10200000, ggr: 600000 },
    { date: '05/13', bet: 11600000, win: 11200000, ggr: 400000 },
    { date: '05/14', bet: 11100000, win: 11800000, ggr: -700000 },
    { date: '05/15', bet: 13200000, win: 12600000, ggr: 600000 },
    { date: '05/16', bet: 15100000, win: 16300000, ggr: -1200000 },
    { date: '05/17', bet: 13900000, win: 14100000, ggr: -200000 },
    { date: '05/18', bet: 15800000, win: 16600000, ggr: -800000 },
]

const merchantRankRows: MerchantRankRow[] = [
    { code: 'MER-001', name: 'Golden Dragon', agent: 'Asia Master', currency: 'USDT', bet: '31,420,000', ggr: '-1,280,000', rtp: '104.07%', status: '警示' },
    { code: 'MER-002', name: 'LuckyPlay', agent: 'Prime Network', currency: 'TWD', bet: '28,102,500', ggr: '2,310,400', rtp: '91.78%', status: '啟用' },
    { code: 'MER-003', name: 'Nova Gaming', agent: 'Nova Agent', currency: 'USD', bet: '18,802,110', ggr: '892,000', rtp: '95.26%', status: '啟用' },
    { code: 'MER-004', name: 'Royal H5', agent: 'Royal Partner', currency: 'USDT', bet: '12,402,800', ggr: '-640,200', rtp: '105.16%', status: '待審核' },
]

const riskRows: RiskAlertRow[] = [
    { id: 'risk-001', level: '高風險', status: '待處理', message: '實際 RTP 偏離理論 RTP 38.2%。', meta: 'Golden Dragon · Fortune Tiger · 2026-05-18 13:24' },
    { id: 'risk-002', level: '中風險', status: '處理中', message: '最近 15 分鐘錢包 API 逾時已達門檻。', meta: 'LuckyPlay · 錢包 API · 2026-05-18 12:40' },
    { id: 'risk-003', level: '低風險', status: '已結案', message: '匯率偏離參考來源 2.1%。', meta: 'Royal H5 · USD/USDT · 2026-05-18 09:12' },
]

// ──────────────────────────────────────────────────────────────
// Handlers
// ──────────────────────────────────────────────────────────────

export const dashboardAdminHandlers = [
    http.get('/api/dashboard/v2/kpis', async () => {
        await delay(200)
        return HttpResponse.json(kpis)
    }),

    http.get('/api/dashboard/v2/revenue-trend', async () => {
        await delay(200)
        return HttpResponse.json(revenueRows)
    }),

    http.get('/api/dashboard/v2/merchant-rank', async () => {
        await delay(250)
        // 排行榜固定取前 8，擴展後切片讓資料多樣
        return HttpResponse.json(expandDemoRows(merchantRankRows, 12).slice(0, 8))
    }),

    http.get('/api/dashboard/v2/risk-alerts', async () => {
        await delay(250)
        return HttpResponse.json(expandDemoRows(riskRows, 8).slice(0, 4))
    }),
]
