import { http, HttpResponse, delay } from 'msw'
import { expandDemoRows, rebaseDemoDates } from '@/utils/demoRows'

// ──────────────────────────────────────────────────────────────
// Types (copied verbatim from the demo .vue files)
// ──────────────────────────────────────────────────────────────

// From SystemAdminsView.vue
type AdminStatus = '啟用' | '停用' | '鎖定' | '待啟用'

type AdminRow = {
    id: string
    account: string
    name: string
    email: string
    portal: string
    groups: string[]
    dataScope: string
    twoFactor: boolean
    status: AdminStatus
    lastLogin: string
    createdAt: string
    allowedIp: string
    note: string
}

// From SystemRolesView.vue
type PermissionKey = 'menu' | 'view' | 'detail' | 'operate' | 'export' | 'sensitive' | 'approve'

type PermissionRow = {
    module: string
    description: string
    permissions: Record<PermissionKey, boolean>
}

type RoleRow = {
    id: string
    name: string
    portal: string
    dataScope: string
    users: number
    status: string
    approvalLevel: string
    amountLimit: number
    updatedAt: string
    owner: string
    note: string
    matrix: PermissionRow[]
}

// From SystemLogsView.vue (demo uses `SystemLogRow`; aliased to `LogRow` for API consistency)
type LogRow = {
    id: string
    module: string
    action: string
    targetType: string
    targetId: string
    portal: string
    operator: string
    roleGroup: string
    dataScope: string
    result: string
    approvalNo: string
    beforeValue: string
    afterValue: string
    reason: string
    ip: string
    userAgent: string
    createdAt: string
}

// From SystemApprovalsView.vue
type ApprovalStatus = '待審核' | '已核准' | '已駁回' | '已取消'

type ApprovalRow = {
    id: string
    module: string
    type: string
    targetId: string
    targetName: string
    applicant: string
    applicantGroup: string
    reviewer: string
    level: string
    priority: string
    status: ApprovalStatus
    beforeValue: string
    afterValue: string
    reason: string
    riskNote: string
    relatedLog: string
    requestedAt: string
    reviewedAt: string
    comment: string
}

// From SystemCurrenciesView.vue
type CurrencyStatus = '啟用' | '停用' | '待審核'
type CurrencyCategory = '法幣' | '穩定幣' | '加密幣'
type RateSource = '每日匯率' | '固定匯率' | '手動維護' | '待接匯率源'

type CurrencyRow = {
    code: string
    name: string
    symbol: string
    category: CurrencyCategory
    decimalPlaces: number
    walletSupported: boolean
    settlementSupported: boolean
    reportSupported: boolean
    defaultSettlement: boolean
    fxRate: number
    rateSource: RateSource
    status: CurrencyStatus
    updatedAt: string
    note: string
}

// From SystemLanguagesView.vue
type LanguageStatus = '啟用' | '停用' | '待審核'

type LanguageRow = {
    code: string
    name: string
    nativeName: string
    locale: string
    direction: string
    portalEnabled: boolean
    gameAssetEnabled: boolean
    defaultLanguage: boolean
    translationCoverage: number
    status: LanguageStatus
    owner: string
    updatedAt: string
    note: string
}

// ──────────────────────────────────────────────────────────────
// Permission matrix helpers (copied verbatim from SystemRolesView.vue)
// ──────────────────────────────────────────────────────────────

const moduleTemplates: [string, string][] = [
    ['代理管理', '代理資料、佣金比例、結算幣別與綁定商戶'],
    ['商戶管理', '商戶 API、錢包、遊戲可見範圍與分潤'],
    ['遊戲管理', '遊戲上下架、維護排程、限紅模板與素材'],
    ['數值設定', 'RTP、波動率、賠率表、版本與模擬結果'],
    ['獎池管理', '獎池規則、累積比例、派發與人工調整'],
    ['交易明細', '注單、交易、退款、補單與 API Trace'],
    ['風控中心', '告警、規則、案件與處理紀錄'],
    ['報表總覽', '商戶、代理、遊戲、RTP 與結算報表'],
    ['系統管理', '管理員、角色權限、審核流程與操作紀錄'],
]

function makeMatrix(level: 'admin' | 'ops' | 'finance' | 'risk' | 'support'): PermissionRow[] {
    return moduleTemplates.map(([module, description]) => {
        const base: Record<PermissionKey, boolean> = {
            menu: true,
            view: true,
            detail: true,
            operate: false,
            export: false,
            sensitive: false,
            approve: false,
        }

        if (level === 'admin') {
            Object.assign(base, { operate: true, export: true, sensitive: true, approve: true })
        }

        if (level === 'ops') {
            Object.assign(base, {
                operate: ['代理管理', '商戶管理', '遊戲管理'].includes(module),
                export: ['代理管理', '商戶管理', '報表總覽'].includes(module),
                sensitive: ['商戶管理', '交易明細'].includes(module),
            })
            if (['數值設定', '系統管理'].includes(module)) Object.assign(base, { operate: false, approve: false, sensitive: false })
        }

        if (level === 'finance') {
            Object.assign(base, {
                menu: ['代理管理', '商戶管理', '交易明細', '報表總覽', '系統管理'].includes(module),
                view: ['代理管理', '商戶管理', '交易明細', '報表總覽', '系統管理'].includes(module),
                detail: ['代理管理', '商戶管理', '交易明細', '報表總覽'].includes(module),
                operate: module === '報表總覽',
                export: ['交易明細', '報表總覽'].includes(module),
                sensitive: ['代理管理', '商戶管理', '報表總覽'].includes(module),
                approve: ['報表總覽', '交易明細'].includes(module),
            })
        }

        if (level === 'risk') {
            Object.assign(base, {
                menu: ['交易明細', '風控中心', '報表總覽'].includes(module),
                view: ['交易明細', '風控中心', '報表總覽'].includes(module),
                detail: ['交易明細', '風控中心'].includes(module),
                operate: module === '風控中心',
                export: false,
                sensitive: ['交易明細', '風控中心'].includes(module),
                approve: module === '風控中心',
            })
        }

        if (level === 'support') {
            Object.assign(base, {
                menu: ['商戶管理', '交易明細', '風控中心'].includes(module),
                view: ['商戶管理', '交易明細', '風控中心'].includes(module),
                detail: ['商戶管理', '交易明細'].includes(module),
                operate: false,
                export: false,
                sensitive: false,
                approve: false,
            })
        }

        return { module, description, permissions: base }
    })
}

// ──────────────────────────────────────────────────────────────
// Seed data (verbatim from demo .vue files)
// ──────────────────────────────────────────────────────────────

const SEED_ADMINS: AdminRow[] = expandDemoRows([
    {
        id: 'ADM-001',
        account: 'supplier.admin',
        name: 'Supplier Admin',
        email: 'supplier.admin@example.com',
        portal: 'Supplier Portal',
        groups: ['系統管理員'],
        dataScope: '全部資料',
        twoFactor: true,
        status: '啟用',
        lastLogin: '2026-05-22 09:42:18',
        createdAt: '2026-01-08 10:12:00',
        allowedIp: '203.66.18.20, 10.0.0.0/24',
        note: '供應商總後台最高權限，正式環境需保留雙人審核。',
    },
    {
        id: 'ADM-002',
        account: 'ops.lead',
        name: 'Iris Chen',
        email: 'iris.chen@example.com',
        portal: 'Supplier Portal',
        groups: ['營運主管'],
        dataScope: '全部資料',
        twoFactor: true,
        status: '啟用',
        lastLogin: '2026-05-21 18:36:44',
        createdAt: '2026-02-12 13:25:00',
        allowedIp: '203.66.18.21',
        note: '可查看代理、商戶、遊戲與注單資料，不可修改 RTP。',
    },
    {
        id: 'ADM-003',
        account: 'finance.review',
        name: 'Ken Liu',
        email: 'ken.liu@example.com',
        portal: 'Supplier Portal',
        groups: ['財務主管'],
        dataScope: '全部資料',
        twoFactor: false,
        status: '待啟用',
        lastLogin: '-',
        createdAt: '2026-03-18 09:30:00',
        allowedIp: '203.66.18.22',
        note: '需完成 2FA 後才能審核結算單與分潤調整。',
    },
    {
        id: 'ADM-004',
        account: 'risk.operator',
        name: 'Mia Stone',
        email: 'mia.stone@example.com',
        portal: 'Supplier Portal',
        groups: ['風控人員'],
        dataScope: '全部資料',
        // 鎖定帳號 2FA 設為 false，使「已啟用 2FA」總數對齊「啟用」總數
        // （6 基底列 ×10 展開：啟用=30，原本 2FA=40 → 卡片數字打架，QA L-6）
        twoFactor: false,
        status: '鎖定',
        lastLogin: '2026-05-19 15:11:28',
        createdAt: '2026-04-02 16:05:00',
        allowedIp: '203.66.18.30',
        note: '連續登入失敗 5 次，需主管確認後解鎖。',
    },
    {
        id: 'ADM-005',
        account: 'agent.ops.demo',
        name: 'Alex Wang',
        email: 'alex.wang@example.com',
        portal: 'Agent Portal',
        groups: ['營運主管'],
        dataScope: '指定代理',
        twoFactor: true,
        status: '啟用',
        lastLogin: '2026-05-20 20:16:52',
        createdAt: '2026-04-22 11:18:00',
        allowedIp: '不限',
        note: '僅可查看 Royal Partner 與下屬商戶資料。',
    },
    {
        id: 'ADM-006',
        account: 'merchant.cs.demo',
        name: 'Nina Wu',
        email: 'nina.wu@example.com',
        portal: 'Merchant Portal',
        groups: ['客服人員'],
        dataScope: '指定商戶',
        twoFactor: false,
        status: '停用',
        lastLogin: '2026-05-08 08:42:31',
        createdAt: '2026-04-28 14:48:00',
        allowedIp: '不限',
        note: '商戶人員離職，保留操作紀錄不可硬刪除。',
    },
])

// Roles are a small config-like set (5 items) — no expandDemoRows.
const SEED_ROLES: RoleRow[] = [
    {
        id: 'ROLE-SUPER',
        name: '系統管理員',
        portal: 'Supplier Portal',
        dataScope: '全部資料',
        users: 3,
        status: '啟用',
        approvalLevel: '二審',
        amountLimit: 0,
        updatedAt: '2026-05-22 10:12:30',
        owner: 'Security Admin',
        note: '最高權限角色，需限制使用人數並定期複核。',
        matrix: makeMatrix('admin'),
    },
    {
        id: 'ROLE-OPS',
        name: '營運主管',
        portal: 'Supplier Portal',
        dataScope: '全部資料',
        users: 8,
        status: '啟用',
        approvalLevel: '一審',
        amountLimit: 50000,
        updatedAt: '2026-05-21 18:40:16',
        owner: 'Ops Lead',
        note: '可管理代理、商戶與遊戲營運設定，不可直接審核 RTP。',
        matrix: makeMatrix('ops'),
    },
    {
        id: 'ROLE-FIN',
        name: '財務主管',
        portal: 'Supplier Portal',
        dataScope: '全部資料',
        users: 5,
        status: '啟用',
        approvalLevel: '二審',
        amountLimit: 200000,
        updatedAt: '2026-05-20 14:28:09',
        owner: 'Finance Admin',
        note: '可查看分潤、佣金與應收欄位，結算鎖定需進入審核流程。',
        matrix: makeMatrix('finance'),
    },
    {
        id: 'ROLE-RISK',
        name: '風控人員',
        portal: 'Supplier Portal',
        dataScope: '全部資料',
        users: 6,
        status: '啟用',
        approvalLevel: '一審',
        amountLimit: 0,
        updatedAt: '2026-05-19 20:03:52',
        owner: 'Risk Lead',
        note: '可處理告警、案件與規則，不可匯出玩家敏感資料。',
        matrix: makeMatrix('risk'),
    },
    {
        id: 'ROLE-CS',
        name: '客服人員',
        portal: 'Merchant Portal',
        dataScope: '指定商戶',
        users: 12,
        status: '停用',
        approvalLevel: '無',
        amountLimit: 0,
        updatedAt: '2026-05-12 09:18:27',
        owner: 'Support Lead',
        note: '舊客服角色，未啟用 2FA 的帳號不可再綁定此角色。',
        matrix: makeMatrix('support'),
    },
]

const SEED_LOGS: LogRow[] = expandDemoRows([
    {
        id: 'LOG-20260522-001',
        module: '角色權限',
        action: '新增權限群組',
        targetType: '權限群組',
        targetId: 'ROLE-CUSTOM-06',
        portal: 'Supplier Portal',
        operator: 'Supplier Admin',
        roleGroup: '系統管理員',
        dataScope: '全部資料',
        result: '成功',
        approvalNo: 'APR-20260522-008',
        beforeValue: '無',
        afterValue: '建立自訂商戶營運權限群組，套用營運主管模板。',
        reason: '新增 Demo 職位權限。',
        ip: '203.66.18.20',
        userAgent: 'Chrome / Windows',
        createdAt: '2026-05-22 11:48:12',
    },
    {
        id: 'LOG-20260522-002',
        module: '商戶管理',
        action: '修改 Callback URL',
        targetType: '商戶',
        targetId: 'MER-001',
        portal: 'Supplier Portal',
        operator: 'Iris Chen',
        roleGroup: '營運主管',
        dataScope: '全部資料',
        result: '待審核',
        approvalNo: 'APR-20260522-009',
        beforeValue: 'https://wallet.golden.example/callback',
        afterValue: 'https://api.golden.example/wallet/callback',
        reason: '商戶正式錢包域名切換，需送審。',
        ip: '203.66.18.21',
        userAgent: 'Edge / Windows',
        createdAt: '2026-05-22 10:36:45',
    },
    {
        id: 'LOG-20260521-003',
        module: '結算管理',
        action: '鎖定結算單',
        targetType: '結算單',
        targetId: 'SET-202605-018',
        portal: 'Supplier Portal',
        operator: 'Ken Liu',
        roleGroup: '財務主管',
        dataScope: '全部資料',
        result: '成功',
        approvalNo: 'APR-20260521-021',
        beforeValue: '待確認',
        afterValue: '已鎖定',
        reason: '商戶對帳完成，鎖定正式結算結果。',
        ip: '203.66.18.22',
        userAgent: 'Chrome / macOS',
        createdAt: '2026-05-21 18:22:09',
    },
    {
        id: 'LOG-20260521-004',
        module: '數值設定',
        action: '送審 RTP 版本',
        targetType: '數值版本',
        targetId: 'MATH-RH5-2.1.4',
        portal: 'Supplier Portal',
        operator: 'Alex Wang',
        roleGroup: '技術人員',
        dataScope: '全部資料',
        result: '待審核',
        approvalNo: 'APR-20260521-028',
        beforeValue: 'RTP 96.20%',
        afterValue: 'RTP 96.50%',
        reason: 'Royal H5 新版本數值調整。',
        ip: '10.0.0.42',
        userAgent: 'Chrome / Windows',
        createdAt: '2026-05-21 15:14:33',
    },
    {
        id: 'LOG-20260520-005',
        module: '管理員列表',
        action: '解鎖帳號',
        targetType: '管理員',
        targetId: 'ADM-004',
        portal: 'Supplier Portal',
        operator: 'Supplier Admin',
        roleGroup: '系統管理員',
        dataScope: '全部資料',
        result: '成功',
        approvalNo: '-',
        beforeValue: '鎖定',
        afterValue: '啟用',
        reason: '確認登入失敗為誤操作，恢復風控人員登入。',
        ip: '203.66.18.20',
        userAgent: 'Chrome / Windows',
        createdAt: '2026-05-20 09:40:18',
    },
    {
        id: 'LOG-20260519-006',
        module: '交易明細',
        action: '重送交易',
        targetType: '交易單',
        targetId: 'TX-20260519-8831',
        portal: 'Supplier Portal',
        operator: 'Mia Stone',
        roleGroup: '風控人員',
        dataScope: '全部資料',
        result: '失敗',
        approvalNo: '-',
        beforeValue: 'API 504',
        afterValue: '重送失敗 API 502',
        reason: '商戶錢包逾時後重送仍失敗，轉人工處理。',
        ip: '203.66.18.30',
        userAgent: 'Firefox / Windows',
        createdAt: '2026-05-19 22:18:54',
    },
])

const SEED_APPROVALS: ApprovalRow[] = expandDemoRows([
    {
        id: 'APR-20260522-009',
        module: '商戶管理',
        type: '修改 Callback URL',
        targetId: 'MER-001',
        targetName: 'Golden Dragon',
        applicant: 'Iris Chen',
        applicantGroup: '營運主管',
        reviewer: '待指派',
        level: '二審',
        priority: '高',
        status: '待審核',
        beforeValue: 'https://wallet.golden.example/callback',
        afterValue: 'https://api.golden.example/wallet/callback',
        reason: '商戶正式錢包域名切換，需更新回呼 URL。',
        riskNote: '正式環境 Callback URL 會影響錢包交易回寫，需確認域名、憑證與 IP 白名單。',
        relatedLog: 'LOG-20260522-002',
        requestedAt: '2026-05-22 10:36:45',
        reviewedAt: '-',
        comment: '',
    },
    {
        id: 'APR-20260521-028',
        module: '數值設定',
        type: '送審 RTP 版本',
        targetId: 'MATH-RH5-2.1.4',
        targetName: 'Royal H5 / RTP 96.50%',
        applicant: 'Alex Wang',
        applicantGroup: '技術人員',
        reviewer: '待指派',
        level: '二審',
        priority: '高',
        status: '待審核',
        beforeValue: 'RTP 96.20% / 高波動',
        afterValue: 'RTP 96.50% / 高波動 / 新賠率表 v2.1.4',
        reason: '遊戲版本更新後需同步數值版本，等待模擬結果覆核。',
        riskNote: 'RTP 與賠率表屬敏感數值；需確認模擬樣本、偏離監控與生效商戶範圍。',
        relatedLog: 'LOG-20260521-004',
        requestedAt: '2026-05-21 15:14:33',
        reviewedAt: '-',
        comment: '',
    },
    {
        id: 'APR-20260521-021',
        module: '結算管理',
        type: '鎖定結算單',
        targetId: 'SET-202605-018',
        targetName: 'Golden Dragon / 2026-05',
        applicant: 'Ken Liu',
        applicantGroup: '財務主管',
        reviewer: 'Finance Admin',
        level: '一審',
        priority: '中',
        status: '已核准',
        beforeValue: '待確認',
        afterValue: '已鎖定',
        reason: '商戶對帳完成，鎖定正式結算結果。',
        riskNote: '已確認退款調整項與匯率批次。',
        relatedLog: 'LOG-20260521-003',
        requestedAt: '2026-05-21 17:58:12',
        reviewedAt: '2026-05-21 18:22:09',
        comment: '同意鎖定，本期調整項已完成覆核。',
    },
    {
        id: 'APR-20260520-018',
        module: '數值設定',
        type: 'RTP 生效範圍',
        targetId: 'MATH-CR-9720',
        targetName: 'Crash Rocket / RTP 97.20%',
        applicant: 'Math Ops',
        applicantGroup: '技術人員',
        reviewer: 'Risk Lead',
        level: '二審',
        priority: '高',
        status: '已駁回',
        beforeValue: '內部測試',
        afterValue: '全部正式商戶',
        reason: '申請將測試數值推送至正式商戶。',
        riskNote: '實際 RTP 偏離過高且樣本不足。',
        relatedLog: 'LOG-20260520-018',
        requestedAt: '2026-05-20 12:30:00',
        reviewedAt: '2026-05-20 13:05:24',
        comment: '駁回。請補足模擬與長週期樣本後重新送審。',
    },
    {
        id: 'APR-20260518-014',
        module: '獎池管理',
        type: '修改派發上限',
        targetId: 'JP-MEGA-001',
        targetName: 'Mega Pool',
        applicant: 'Supplier Admin',
        applicantGroup: '系統管理員',
        reviewer: '待指派',
        level: '二審',
        priority: '中',
        status: '待審核',
        beforeValue: '單次派發上限 USDT 80,000',
        afterValue: '單次派發上限 USDT 120,000',
        reason: '配合大型活動調整派發上限。',
        riskNote: '需確認資金池餘額、安全門檻與商戶公告時程。',
        relatedLog: 'LOG-20260518-014',
        requestedAt: '2026-05-18 18:06:35',
        reviewedAt: '-',
        comment: '',
    },
    {
        id: 'APR-20260517-006',
        module: '交易明細',
        type: '建立補單',
        targetId: 'ORD-20260517-9021',
        targetName: 'LuckyPlay / player_2109',
        applicant: 'Mia Stone',
        applicantGroup: '風控人員',
        reviewer: 'Risk Lead',
        level: '一審',
        priority: '中',
        status: '已核准',
        beforeValue: '交易失敗 / 未派彩',
        afterValue: '建立補單交易 USDT 450.00',
        reason: '錢包回調逾時，注單結果已確認為應派彩。',
        riskNote: '已核對遊戲結果與 API Trace。',
        relatedLog: 'LOG-20260517-006',
        requestedAt: '2026-05-17 09:10:20',
        reviewedAt: '2026-05-17 09:20:00',
        comment: '確認補單，保留 API Trace。',
    },
])

// Currencies are a small config-like set — no expandDemoRows.
const SEED_CURRENCIES: CurrencyRow[] = [
    {
        code: 'USDT',
        name: 'Tether',
        symbol: 'USDT',
        category: '穩定幣',
        decimalPlaces: 6,
        walletSupported: true,
        settlementSupported: true,
        reportSupported: true,
        defaultSettlement: true,
        fxRate: 1,
        rateSource: '固定匯率',
        status: '啟用',
        updatedAt: '2026-05-22 09:12:00',
        note: '主要對帳幣別，所有正式結算預設折算至 USDT。',
    },
    {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        category: '法幣',
        decimalPlaces: 2,
        walletSupported: true,
        settlementSupported: true,
        reportSupported: true,
        defaultSettlement: false,
        fxRate: 1,
        rateSource: '每日匯率',
        status: '啟用',
        updatedAt: '2026-05-22 08:30:00',
        note: '可作為商戶對帳幣別，正式匯率修改需送審。',
    },
    {
        code: 'TWD',
        name: 'New Taiwan Dollar',
        symbol: 'NT$',
        category: '法幣',
        decimalPlaces: 0,
        walletSupported: true,
        settlementSupported: true,
        reportSupported: true,
        defaultSettlement: false,
        fxRate: 0.03125,
        rateSource: '每日匯率',
        status: '啟用',
        updatedAt: '2026-05-21 18:00:00',
        note: '台灣商戶常用幣別，報表需保留原幣別與對帳幣別。',
    },
    {
        code: 'VND',
        name: 'Vietnamese Dong',
        symbol: 'VND',
        category: '法幣',
        decimalPlaces: 0,
        walletSupported: false,
        settlementSupported: false,
        reportSupported: true,
        defaultSettlement: false,
        fxRate: 0.000039,
        rateSource: '待接匯率源',
        status: '待審核',
        updatedAt: '2026-05-19 13:45:00',
        note: '僅報表試算，錢包與正式結算尚未開放。',
    },
    {
        code: 'HKD',
        name: 'Hong Kong Dollar',
        symbol: 'HK$',
        category: '法幣',
        decimalPlaces: 2,
        walletSupported: false,
        settlementSupported: false,
        reportSupported: false,
        defaultSettlement: false,
        fxRate: 0.128,
        rateSource: '手動維護',
        status: '停用',
        updatedAt: '2026-05-10 10:00:00',
        note: '暫停商戶接入，保留歷史報表查詢。',
    },
]

// Languages are a small config-like set — no expandDemoRows.
const SEED_LANGUAGES: LanguageRow[] = [
    {
        code: 'zh-TW',
        name: '繁體中文',
        nativeName: '繁體中文',
        locale: 'zh-TW',
        direction: 'LTR',
        portalEnabled: true,
        gameAssetEnabled: true,
        defaultLanguage: true,
        translationCoverage: 100,
        status: '啟用',
        owner: 'Product Ops',
        updatedAt: '2026-05-22 09:20:00',
        note: 'Portal 預設語系，遊戲素材與商戶後台皆支援。',
    },
    {
        code: 'en-US',
        name: '英文',
        nativeName: 'English',
        locale: 'en-US',
        direction: 'LTR',
        portalEnabled: true,
        gameAssetEnabled: true,
        defaultLanguage: false,
        translationCoverage: 98,
        status: '啟用',
        owner: 'Localization',
        updatedAt: '2026-05-21 17:10:00',
        note: '國際商戶與技術文件主要語系。',
    },
    {
        code: 'th-TH',
        name: '泰文',
        nativeName: 'ไทย',
        locale: 'th-TH',
        direction: 'LTR',
        portalEnabled: false,
        gameAssetEnabled: true,
        defaultLanguage: false,
        translationCoverage: 72,
        status: '待審核',
        owner: 'Localization',
        updatedAt: '2026-05-20 14:30:00',
        note: '遊戲素材翻譯中，Portal 文案尚未完成。',
    },
    {
        code: 'vi-VN',
        name: '越南文',
        nativeName: 'Tiếng Việt',
        locale: 'vi-VN',
        direction: 'LTR',
        portalEnabled: true,
        gameAssetEnabled: false,
        defaultLanguage: false,
        translationCoverage: 64,
        status: '待審核',
        owner: 'Merchant Ops',
        updatedAt: '2026-05-19 11:45:00',
        note: '商戶 Portal 試行，遊戲素材需補齊。',
    },
    {
        code: 'ja-JP',
        name: '日文',
        nativeName: '日本語',
        locale: 'ja-JP',
        direction: 'LTR',
        portalEnabled: false,
        gameAssetEnabled: false,
        defaultLanguage: false,
        translationCoverage: 28,
        status: '停用',
        owner: 'Product Ops',
        updatedAt: '2026-05-10 10:00:00',
        note: '暫不開放，保留未來市場擴充。',
    },
]

// ──────────────────────────────────────────────────────────────
// Handlers
// ──────────────────────────────────────────────────────────────

export const systemAdminHandlers = [
    http.get('/api/system/v2/admins', async () => {
        await delay(250)
        return HttpResponse.json(SEED_ADMINS)
    }),
    http.get('/api/system/v2/roles', async () => {
        await delay(200)
        return HttpResponse.json(rebaseDemoDates(SEED_ROLES))
    }),
    http.get('/api/system/v2/logs', async () => {
        await delay(300)
        return HttpResponse.json(SEED_LOGS)
    }),
    http.get('/api/system/v2/approvals', async () => {
        await delay(250)
        return HttpResponse.json(SEED_APPROVALS)
    }),
    http.get('/api/system/v2/currencies', async () => {
        await delay(150)
        return HttpResponse.json(rebaseDemoDates(SEED_CURRENCIES))
    }),
    http.get('/api/system/v2/languages', async () => {
        await delay(150)
        return HttpResponse.json(rebaseDemoDates(SEED_LANGUAGES))
    }),
]
