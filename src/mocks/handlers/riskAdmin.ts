import { http, HttpResponse, delay } from 'msw'
import { expandDemoRows, rebaseDemoDates } from '@/utils/demoRows'

// ──────────────────────────────────────────────────────────────
// Types (copied verbatim from the demo .vue files)
// ──────────────────────────────────────────────────────────────

// From RiskOverviewView.vue (inline `pendingAlerts`, no explicit type)
type PendingAlert = {
    id: string
    title: string
    merchant: string
    playerId: string
    level: string
    status: string
    time: string
}

// From RiskOverviewView.vue (inline `ruleHealthRows`, no explicit type)
type RuleHealth = {
    rule: string
    hits: number
    falsePositive: string
    cases: number
    status: string
}

// From RiskAlertsView.vue
type RiskAlertRow = {
    id: string
    ruleId: string
    ruleName: string
    alertType: string
    merchant: string
    playerId: string
    playerIp: string
    relatedOrder: string
    relatedTransaction: string
    caseId: string
    riskLevel: string
    status: string
    assignee: string
    hitValue: string
    threshold: string
    source: string
    occurredAt: string
    updatedAt: string
    summary: string
    evidence: string
    suggestion: string
}

// From RiskRulesView.vue
type RiskRuleRow = {
    id: string
    name: string
    category: string
    scope: string
    target: string
    threshold: string
    cycle: string
    action: string
    notify: string
    status: string
    reviewStatus: string
    riskLevel: string
    hitCount: number
    falsePositiveRate: string
    owner: string
    updatedAt: string
    description: string
}

// From RiskCasesView.vue
type CaseAction = {
    time: string
    actor: string
    action: string
    note: string
}

type RiskCaseRow = {
    id: string
    title: string
    riskType: string
    merchant: string
    playerId: string
    playerIp: string
    riskLevel: string
    priority: string
    status: string
    source: string
    assignee: string
    relatedAlert: string
    relatedOrders: string[]
    relatedTransactions: string[]
    evidence: string
    suggestion: string
    createdAt: string
    updatedAt: string
    slaDueAt: string
    lastAction: string
    actions: CaseAction[]
}

// From RiskActionsView.vue
type RiskActionRow = {
    id: string
    module: string
    actionType: string
    targetType: string
    targetId: string
    merchant: string
    playerId: string
    operator: string
    role: string
    result: string
    riskLevel: string
    beforeStatus: string
    afterStatus: string
    note: string
    ip: string
    userAgent: string
    source: string
    createdAt: string
}

// ──────────────────────────────────────────────────────────────
// Seed data (verbatim from demo .vue files)
// ──────────────────────────────────────────────────────────────

// Overview seeds are plain arrays in the demo (no expandDemoRows) — keep them as-is.
const SEED_PENDING_ALERTS: PendingAlert[] = [
    { id: 'RAL-20260520-001', title: 'Jackpot 派發頻率異常', merchant: 'Golden Dragon', playerId: 'GD_882019', level: '高風險', status: '待處理', time: '2026-05-20 10:42' },
    { id: 'RAL-20260516-008', title: '重複交易偵測', merchant: 'Golden Dragon', playerId: 'GD_770182', level: '高風險', status: '處理中', time: '2026-05-16 18:28' },
    { id: 'RAL-20260519-003', title: '玩家投注頻率超過門檻', merchant: 'Royal H5', playerId: 'RH_190028', level: '中風險', status: '已建案', time: '2026-05-19 13:02' },
    { id: 'RAL-20260521-006', title: '錢包 API 回應碼偏高', merchant: 'LuckyPlay', playerId: 'LP_552001', level: '中風險', status: '待處理', time: '2026-05-21 09:18' },
]

const SEED_RULE_HEALTH: RuleHealth[] = [
    { rule: '高額連續下注', hits: 42, falsePositive: '5.1%', cases: 8, status: '健康' },
    { rule: '重複交易偵測', hits: 31, falsePositive: '3.8%', cases: 6, status: '健康' },
    { rule: 'Jackpot 頻率偏移', hits: 18, falsePositive: '11.4%', cases: 5, status: '需調整' },
    { rule: '匯率偏差', hits: 9, falsePositive: '7.0%', cases: 2, status: '觀察' },
]

const SEED_ALERTS: RiskAlertRow[] = expandDemoRows([
    {
        id: 'RAL-20260520-001',
        ruleId: 'RR-JP-001',
        ruleName: '高額 Jackpot 派彩',
        alertType: '高額派彩',
        merchant: 'Golden Dragon',
        playerId: 'player_8831',
        playerIp: '203.74.18.91',
        relatedOrder: 'ORD-20260520-88421',
        relatedTransaction: 'TX-WLT-20260520-88421',
        caseId: '-',
        riskLevel: '高風險',
        status: '新告警',
        assignee: 'Iris Chen',
        hitValue: 'USDT 88,420',
        threshold: 'USDT 50,000',
        source: '風控規則',
        occurredAt: '2026-05-20 10:42:18',
        updatedAt: '2026-05-20 10:48:03',
        summary: '玩家單筆 Jackpot 派彩金額超過規則門檻，需要確認派彩、玩家行為與商戶錢包回應。',
        evidence: '規則 RR-JP-001 命中，相關 Jackpot 派發紀錄 JP-PAY-20260520-001。',
        suggestion: '先確認注單結果與錢包交易，再決定是否建立風控案件。',
    },
    {
        id: 'RAL-20260520-002',
        ruleId: 'RR-WLT-004',
        ruleName: '錢包 API 連續失敗',
        alertType: '錢包異常',
        merchant: 'LuckyPlay',
        playerId: 'player_2109',
        playerIp: '118.163.92.21',
        relatedOrder: 'ORD-20260520-55102',
        relatedTransaction: 'TX-WLT-20260520-55102',
        caseId: 'RC-20260520-002',
        riskLevel: '中風險',
        status: '已建案',
        assignee: 'Mia Chen',
        hitValue: '3 次失敗',
        threshold: '3 次 / 10 分鐘',
        source: '交易監控',
        occurredAt: '2026-05-20 11:09:14',
        updatedAt: '2026-05-20 11:18:41',
        summary: '錢包 API 連續逾時，可能造成交易重送或對帳落差。',
        evidence: 'API 回應碼 504，retryable=true，最近一次重試仍未成功。',
        suggestion: '建立案件並指派技術值班確認商戶錢包服務。',
    },
    {
        id: 'RAL-20260519-003',
        ruleId: 'RR-BET-009',
        ruleName: '玩家投注頻率異常',
        alertType: '投注頻率',
        merchant: 'Royal H5',
        playerId: 'player_7780',
        playerIp: '61.220.31.8',
        relatedOrder: 'ORD-20260518-32004',
        relatedTransaction: 'TX-WLT-20260518-32004',
        caseId: '-',
        riskLevel: '中風險',
        status: '已指派',
        assignee: 'Alex Wang',
        hitValue: '138 筆 / 5 分鐘',
        threshold: '120 筆 / 5 分鐘',
        source: '風控規則',
        occurredAt: '2026-05-19 13:02:22',
        updatedAt: '2026-05-19 13:04:11',
        summary: '玩家短時間投注頻率超過門檻，需確認是否為機器行為或促銷活動造成。',
        evidence: '5 分鐘內投注 138 筆，主要集中於 Crash Rocket。',
        suggestion: '先指派風控人員查看玩家歷史與 IP，再決定是否建案。',
    },
    {
        id: 'RAL-20260517-004',
        ruleId: 'RR-RTP-012',
        ruleName: 'RTP 偏移監控',
        alertType: 'RTP 偏移',
        merchant: 'Nova Gaming',
        playerId: '-',
        playerIp: '-',
        relatedOrder: '-',
        relatedTransaction: '-',
        caseId: '-',
        riskLevel: '低風險',
        status: '已關閉',
        assignee: 'Supplier Admin',
        hitValue: '+3.4%',
        threshold: '±3.0% / 24 小時',
        source: '數值監控',
        occurredAt: '2026-05-17 08:12:22',
        updatedAt: '2026-05-17 09:20:00',
        summary: '遊戲實際 RTP 偏移理論 RTP，已由數值團隊確認樣本量偏低。',
        evidence: '24 小時樣本不足，拉長區間後回到合理範圍。',
        suggestion: '關閉告警並持續觀察下一個統計週期。',
    },
    {
        id: 'RAL-20260516-008',
        ruleId: 'RR-TXN-017',
        ruleName: '重複交易偵測',
        alertType: '重複交易',
        merchant: 'Golden Dragon',
        playerId: 'player_4420',
        playerIp: '220.130.41.2',
        relatedOrder: 'ORD-20260516-77218',
        relatedTransaction: 'TX-TRF-20260516-77218',
        caseId: '-',
        riskLevel: '嚴重',
        status: '處理中',
        assignee: '未指派',
        hitValue: '2 次重複',
        threshold: '2 次 / 3 分鐘',
        source: '交易監控',
        occurredAt: '2026-05-16 18:28:44',
        updatedAt: '2026-05-16 18:34:10',
        summary: '同一交易單號短時間重複回報，可能導致錢包餘額或對帳異常。',
        evidence: '交易 TX-TRF-20260516-77218 收到兩次成功回調。',
        suggestion: '優先指派技術值班，確認商戶 callback 與交易冪等處理。',
    },
])

const SEED_RULES: RiskRuleRow[] = expandDemoRows([
    {
        id: 'RR-JP-001',
        name: '高額 Jackpot 派彩',
        category: '高額派彩',
        scope: '指定遊戲',
        target: '單筆派彩金額',
        threshold: 'USDT 50,000',
        cycle: '單筆',
        action: '建立風控案件',
        notify: '風控群組、財務群組',
        status: '啟用',
        reviewStatus: '已核准',
        riskLevel: '高風險',
        hitCount: 8,
        falsePositiveRate: '6.2%',
        owner: 'Iris Chen',
        updatedAt: '2026-05-20 09:30:18',
        description: '監控 Jackpot 單筆高額派彩，超過門檻時建立案件並通知風控與財務。',
    },
    {
        id: 'RR-WLT-004',
        name: '錢包 API 連續失敗',
        category: '錢包異常',
        scope: '指定商戶',
        target: '錢包 API 失敗次數',
        threshold: '3 次',
        cycle: '10 分鐘',
        action: '標記人工處理',
        notify: '技術值班、營運群組',
        status: '啟用',
        reviewStatus: '已核准',
        riskLevel: '中風險',
        hitCount: 14,
        falsePositiveRate: '4.8%',
        owner: 'Mia Chen',
        updatedAt: '2026-05-20 11:18:41',
        description: '偵測錢包 API 連續失敗或逾時，避免交易重送造成對帳落差。',
    },
    {
        id: 'RR-BET-009',
        name: '玩家投注頻率異常',
        category: '投注頻率',
        scope: '指定商戶',
        target: '玩家投注頻率',
        threshold: '120 筆',
        cycle: '5 分鐘',
        action: '只發送通知',
        notify: '風控群組',
        status: '待審核',
        reviewStatus: '送審中',
        riskLevel: '中風險',
        hitCount: 42,
        falsePositiveRate: '18.6%',
        owner: 'Alex Wang',
        updatedAt: '2026-05-18 18:06:35',
        description: '追蹤短時間高頻投注行為，先通知風控判斷是否需要建立案件。',
    },
    {
        id: 'RR-RTP-012',
        name: 'RTP 偏移監控',
        category: 'RTP 偏移',
        scope: '指定遊戲',
        target: 'RTP 偏移百分比',
        threshold: '±3.0%',
        cycle: '24 小時',
        action: '建立風控案件',
        notify: '風控群組、技術值班',
        status: '啟用',
        reviewStatus: '已核准',
        riskLevel: '高風險',
        hitCount: 3,
        falsePositiveRate: '2.1%',
        owner: 'Supplier Admin',
        updatedAt: '2026-05-17 08:12:22',
        description: '監控遊戲實際 RTP 與理論 RTP 偏移，提供數值團隊與風控追蹤。',
    },
    {
        id: 'RR-TXN-017',
        name: '重複交易偵測',
        category: '錢包異常',
        scope: '全域',
        target: '重複交易次數',
        threshold: '2 次',
        cycle: '3 分鐘',
        action: '鎖定交易重試',
        notify: '技術值班',
        status: '停用',
        reviewStatus: '已核准',
        riskLevel: '低風險',
        hitCount: 1,
        falsePositiveRate: '12.4%',
        owner: 'Mia Chen',
        updatedAt: '2026-05-15 16:48:10',
        description: '偵測相同交易單號在短時間內重複回報，停用後保留歷史命中紀錄。',
    },
])

const SEED_CASES: RiskCaseRow[] = expandDemoRows([
    {
        id: 'RC-20260520-001',
        title: '高額 Jackpot 派彩查核',
        riskType: '高額派彩',
        merchant: 'Golden Dragon',
        playerId: 'player_8831',
        playerIp: '203.74.18.91',
        riskLevel: '高風險',
        priority: 'P1',
        status: '調查中',
        source: '告警建案',
        assignee: 'Iris Chen',
        relatedAlert: 'RAL-20260520-001',
        relatedOrders: ['ORD-20260520-88421'],
        relatedTransactions: ['TX-WLT-20260520-88421'],
        evidence: 'Jackpot 派彩金額 USDT 88,420，超過規則門檻 USDT 50,000。',
        suggestion: '確認遊戲結果、錢包回調與玩家近期高額投注紀錄。',
        createdAt: '2026-05-20 10:48:03',
        updatedAt: '2026-05-20 11:02:18',
        slaDueAt: '2026-05-20 14:48:03',
        lastAction: 'Iris Chen 已接手查核派彩與錢包紀錄。',
        actions: [
            { time: '2026-05-20 10:48:03', actor: 'System', action: '建立案件', note: '由告警 RAL-20260520-001 建立。' },
            { time: '2026-05-20 11:02:18', actor: 'Iris Chen', action: '開始調查', note: '先核對遊戲結果與錢包回調。' },
        ],
    },
    {
        id: 'RC-20260520-002',
        title: '錢包 API 連續失敗',
        riskType: '錢包異常',
        merchant: 'LuckyPlay',
        playerId: 'player_2109',
        playerIp: '118.163.92.21',
        riskLevel: '中風險',
        priority: 'P2',
        status: '處理中',
        source: '交易監控',
        assignee: 'Mia Chen',
        relatedAlert: 'RAL-20260520-002',
        relatedOrders: ['ORD-20260520-55102'],
        relatedTransactions: ['TX-WLT-20260520-55102', 'TX-WLT-20260520-55102-R1'],
        evidence: '商戶錢包 API 回應 504，連續重試 3 次仍未成功。',
        suggestion: '確認商戶錢包服務狀態，必要時標記人工處理並通知商戶技術。',
        createdAt: '2026-05-20 11:14:14',
        updatedAt: '2026-05-20 11:18:41',
        slaDueAt: '2026-05-20 17:14:14',
        lastAction: '已通知技術值班確認商戶 wallet callback。',
        actions: [
            { time: '2026-05-20 11:14:14', actor: 'Mia Chen', action: '建立案件', note: '由錢包告警建案。' },
            { time: '2026-05-20 11:18:41', actor: 'Mia Chen', action: '通知技術', note: '請技術確認 merchant wallet API 連線。' },
        ],
    },
    {
        id: 'RC-20260519-009',
        title: '疑似重複派彩',
        riskType: '派彩異常',
        merchant: 'Nova Gaming',
        playerId: 'player_4420',
        playerIp: '220.130.41.2',
        riskLevel: '高風險',
        priority: 'P1',
        status: '待覆核',
        source: '異常交易',
        assignee: 'Alex Wang',
        relatedAlert: '-',
        relatedOrders: ['ORD-20260519-77218'],
        relatedTransactions: ['TX-WLT-20260519-77218', 'TX-WLT-20260519-77218-DUP'],
        evidence: '同一局號出現兩筆成功派彩交易，需要確認是否為商戶回調重送。',
        suggestion: '比對 API Trace、wallet transaction id 與商戶對帳資料。',
        createdAt: '2026-05-19 22:21:19',
        updatedAt: '2026-05-19 22:30:02',
        slaDueAt: '2026-05-20 02:21:19',
        lastAction: '等待財務覆核是否需要調整結算。',
        actions: [
            { time: '2026-05-19 22:21:19', actor: 'Alex Wang', action: '建立案件', note: '由異常交易建立案件。' },
            { time: '2026-05-19 22:30:02', actor: 'Alex Wang', action: '送交覆核', note: '疑似重複派彩，待財務確認。' },
        ],
    },
    {
        id: 'RC-20260518-006',
        title: '轉帳錢包餘額異常',
        riskType: '錢包異常',
        merchant: 'Golden Dragon',
        playerId: 'player_8831',
        playerIp: '203.74.18.91',
        riskLevel: '中風險',
        priority: 'P3',
        status: '待指派',
        source: '交易監控',
        assignee: '未指派',
        relatedAlert: '-',
        relatedOrders: [],
        relatedTransactions: ['TX-TRF-20260518-11904'],
        evidence: '轉出交易成功但玩家錢包餘額短時間未回補。',
        suggestion: '確認轉帳錢包轉入/轉出紀錄與商戶錢包餘額同步狀態。',
        createdAt: '2026-05-18 16:06:18',
        updatedAt: '2026-05-18 16:12:08',
        slaDueAt: '2026-05-19 16:06:18',
        lastAction: '等待風控人員接手。',
        actions: [
            { time: '2026-05-18 16:06:18', actor: 'System', action: '建立案件', note: '交易監控偵測轉帳錢包餘額異常。' },
        ],
    },
    {
        id: 'RC-20260517-004',
        title: 'RTP 偏移觀察',
        riskType: 'RTP 偏移',
        merchant: 'Nova Gaming',
        playerId: '-',
        playerIp: '-',
        riskLevel: '低風險',
        priority: 'P4',
        status: '已結案',
        source: '數值監控',
        assignee: 'Supplier Admin',
        relatedAlert: 'RAL-20260517-004',
        relatedOrders: [],
        relatedTransactions: [],
        evidence: '24 小時 RTP 偏移 +3.4%，拉長統計區間後回到合理範圍。',
        suggestion: '保留紀錄並於數值設定頁持續觀察版本表現。',
        createdAt: '2026-05-17 08:12:22',
        updatedAt: '2026-05-17 09:20:00',
        slaDueAt: '2026-05-18 08:12:22',
        lastAction: '樣本量不足造成短期偏移，已結案。',
        actions: [
            { time: '2026-05-17 08:12:22', actor: 'System', action: '建立案件', note: 'RTP 偏移告警建立觀察案件。' },
            { time: '2026-05-17 09:20:00', actor: 'Supplier Admin', action: '結案', note: '樣本量不足，延長區間後恢復正常。' },
        ],
    },
])

const SEED_ACTIONS: RiskActionRow[] = expandDemoRows([
    {
        id: 'RAC-20260520-001',
        module: '告警',
        actionType: '指派',
        targetType: '告警單',
        targetId: 'RAL-20260520-001',
        merchant: 'Golden Dragon',
        playerId: 'player_8831',
        operator: 'Supplier Admin',
        role: 'Risk Admin',
        result: '成功',
        riskLevel: '高風險',
        beforeStatus: '新告警',
        afterStatus: '已指派',
        note: '指派給 Iris Chen，優先確認 Jackpot 派彩與錢包回調。',
        ip: '10.10.20.11',
        userAgent: 'Chrome / Windows',
        source: 'Supplier Portal',
        createdAt: '2026-05-20 10:48:03',
    },
    {
        id: 'RAC-20260520-002',
        module: '告警',
        actionType: '建案',
        targetType: '風控案件',
        targetId: 'RC-20260520-001',
        merchant: 'Golden Dragon',
        playerId: 'player_8831',
        operator: 'Iris Chen',
        role: 'Risk Operator',
        result: '成功',
        riskLevel: '高風險',
        beforeStatus: '已指派',
        afterStatus: '已建案',
        note: '由告警 RAL-20260520-001 建立案件，帶入關聯注單與交易。',
        ip: '10.10.24.18',
        userAgent: 'Chrome / Windows',
        source: 'Supplier Portal',
        createdAt: '2026-05-20 11:02:18',
    },
    {
        id: 'RAC-20260520-003',
        module: '案件',
        actionType: '補充紀錄',
        targetType: '風控案件',
        targetId: 'RC-20260520-002',
        merchant: 'LuckyPlay',
        playerId: 'player_2109',
        operator: 'Mia Chen',
        role: 'Ops Lead',
        result: '成功',
        riskLevel: '中風險',
        beforeStatus: '處理中',
        afterStatus: '處理中',
        note: '已通知技術值班確認商戶 wallet callback 與 API 504 回應。',
        ip: '10.10.25.44',
        userAgent: 'Edge / Windows',
        source: 'Supplier Portal',
        createdAt: '2026-05-20 11:18:41',
    },
    {
        id: 'RAC-20260519-004',
        module: '案件',
        actionType: '送交覆核',
        targetType: '風控案件',
        targetId: 'RC-20260519-009',
        merchant: 'Nova Gaming',
        playerId: 'player_4420',
        operator: 'Alex Wang',
        role: 'Risk Manager',
        result: '成功',
        riskLevel: '高風險',
        beforeStatus: '調查中',
        afterStatus: '待覆核',
        note: '疑似重複派彩，送交財務確認是否需要調整結算。',
        ip: '10.10.21.77',
        userAgent: 'Chrome / macOS',
        source: 'Supplier Portal',
        createdAt: '2026-05-19 22:30:02',
    },
    {
        id: 'RAC-20260518-005',
        module: '規則',
        actionType: '停用送審',
        targetType: '風控規則',
        targetId: 'RR-BET-009',
        merchant: 'Royal H5',
        playerId: '-',
        operator: 'Supplier Admin',
        role: 'System Admin',
        result: '待審核',
        riskLevel: '中風險',
        beforeStatus: '啟用',
        afterStatus: '送審中',
        note: '玩家投注頻率規則誤報率偏高，申請停用並調整門檻。',
        ip: '10.10.20.11',
        userAgent: 'Chrome / Windows',
        source: 'Supplier Portal',
        createdAt: '2026-05-18 18:06:35',
    },
    {
        id: 'RAC-20260517-006',
        module: '案件',
        actionType: '結案',
        targetType: '風控案件',
        targetId: 'RC-20260517-004',
        merchant: 'Nova Gaming',
        playerId: '-',
        operator: 'Supplier Admin',
        role: 'System Admin',
        result: '成功',
        riskLevel: '低風險',
        beforeStatus: '待覆核',
        afterStatus: '已結案',
        note: 'RTP 偏移由樣本量不足造成，延長統計區間後恢復正常。',
        ip: '10.10.20.11',
        userAgent: 'Chrome / Windows',
        source: 'Supplier Portal',
        createdAt: '2026-05-17 09:20:00',
    },
])

// ──────────────────────────────────────────────────────────────
// Handlers
// ──────────────────────────────────────────────────────────────

export const riskAdminHandlers = [
    http.get('/api/risk/v2/overview', async () => {
        await delay(250)
        return HttpResponse.json(rebaseDemoDates({
            pendingAlerts: SEED_PENDING_ALERTS,
            ruleHealthRows: SEED_RULE_HEALTH,
        }))
    }),
    http.get('/api/risk/v2/alerts', async () => {
        await delay(250)
        return HttpResponse.json(SEED_ALERTS)
    }),
    http.get('/api/risk/v2/rules', async () => {
        await delay(250)
        return HttpResponse.json(SEED_RULES)
    }),
    http.get('/api/risk/v2/cases', async () => {
        await delay(250)
        return HttpResponse.json(SEED_CASES)
    }),
    http.get('/api/risk/v2/actions', async () => {
        await delay(250)
        return HttpResponse.json(SEED_ACTIONS)
    }),
]
