export const book = {
    title: 'Provider Portal 產品與系統規格書',
    shortTitle: 'Provider Portal Specs',
    version: '0.6.0-dependency-map',
    updatedAt: '2026-08-14',
    owner: 'Provider Portal Product / Engineering',
    status: 'Authoring Format Confirmed · Phase 1 Dependencies Mapped',
    description: '供產品、前端、後端、QA 與 GGAP 對接團隊共同使用的 Provider Portal 規格入口。',
}

export const statusLabels = {
    confirmed: { label: '已確認', tone: 'confirmed' },
    draft: { label: '草案', tone: 'draft' },
    outline: { label: '待整理', tone: 'outline' },
    tbd: { label: '待決策', tone: 'tbd' },
}

export const scopeLabels = {
    baseline: { label: '基準範本', shortLabel: 'BASELINE', tone: 'baseline' },
    active: { label: '本輪製作', shortLabel: 'ACTIVE', tone: 'active' },
    deferred: { label: '延後製作', shortLabel: 'DEFERRED', tone: 'deferred' },
    blocked: { label: '受阻', shortLabel: 'BLOCKED', tone: 'blocked' },
}

export const foundation = [
    {
        id: 'document-control',
        number: '00',
        title: '文件治理與使用方式',
        summary: '版本、狀態、適用對象、文件優先級與變更規則。',
        status: 'draft',
        content: 'content/00-document-control.md',
    },
    {
        id: 'product-overview',
        number: '01',
        title: '產品定位與目標',
        summary: 'Provider Portal 的產品定位、使用者、核心任務與目前階段。',
        status: 'draft',
        content: 'content/01-product-overview.md',
    },
    {
        id: 'system-boundary',
        number: '02',
        title: '系統與責任邊界',
        summary: 'Provider、GGAP、代理商、商戶、會員與錢包責任的正式分界。',
        status: 'draft',
        content: 'content/02-system-boundary.md',
    },
    {
        id: 'information-architecture',
        number: '03',
        title: '資訊架構與頁面地圖',
        summary: '九個主群組、32 個內容頁、route、成熟度與開發對應。',
        status: 'draft',
        content: 'content/03-information-architecture.md',
        generatedMatrix: true,
    },
    {
        id: 'common-domain-rules',
        number: '04',
        title: '共通領域規則',
        summary: 'Game Round、環境隔離、金額、時間、識別碼與資料顯示原則。',
        status: 'draft',
        content: 'content/04-common-domain-rules.md',
    },
]

export const modules = [
    {
        id: 'dashboard-module',
        number: '05.1',
        title: '總覽',
        summary: 'Provider 跨模組營運摘要與工作入口。',
        pages: [
            page('dashboard', '儀表板', '/dashboard', 'src/views/Provider/Dashboard.vue', 'complete', ['docs/PROVIDER_DASHBOARD_SPEC.md']),
        ],
    },
    {
        id: 'game-management-module',
        number: '05.2',
        title: '遊戲管理',
        summary: '遊戲主資料、版本、數值、素材及正式／DEMO 環境啟用。',
        pages: [
            page('game-list', '遊戲列表', '/games', 'src/views/Games/Index.vue', 'complete', ['docs/GAME_LIST_SPEC.md']),
            page('game-environments', '環境與發布', '/games/environments', 'src/views/Provider/Placeholder.vue', 'placeholder', ['docs/PROVIDER_PORTAL_SPEC.md', 'docs/PROVIDER_GGAP_INTEGRATION_CONTRACT.md']),
            page('game-settings', '遊戲設定', '/games/settings', 'src/views/Games/Settings.vue', 'complete', ['docs/PROVIDER_PORTAL_PAGE_MAP.md']),
            page('game-math', '數值設定', '/games/math', 'src/views/Games/Math.vue', 'complete', ['docs/PROVIDER_RISK_CONTROL_SPEC.md']),
            page('game-versions', '遊戲版本', '/games/versions', 'src/views/Games/Versions.vue', 'complete', ['docs/GAME_LIST_SPEC.md']),
            page('game-assets', '遊戲素材', '/games/assets', 'src/views/Games/Assets.vue', 'complete', ['docs/PROVIDER_PORTAL_PAGE_MAP.md']),
        ],
    },
    {
        id: 'data-reporting-module',
        number: '05.3',
        title: '數據與報表',
        summary: '以 Game Round 為主要業務紀錄的查詢、詳情與匯出。',
        pages: [
            page('game-round-records', '遊戲紀錄', '/reports', 'src/views/Reports/ProviderGameRounds.vue', 'complete', [
                'docs/GAME_ROUND_AND_REPORTING_SPEC.md',
                'docs/GAME_ROUND_RECORDS_SPEC.md',
                'docs/GAME_VENDOR_FINANCE_REPORTING_SPEC.md',
                'docs/PROVIDER_GGAP_INTEGRATION_CONTRACT.md',
                'docs/PROVIDER_PORTAL_UI_LAYOUT_SPEC.md',
            ], {
                status: 'draft',
                scope: 'baseline',
                content: 'content/modules/data-and-reporting/game-round-records.md',
                pilot: true,
                visualAtTop: true,
                visualTitle: '頁面畫面示意',
                visualSummary: '參照現行 /reports 原型；先掌握整體頁面，再點選區塊閱讀詳細規格。',
                visualZones: [
                    { number: '01', label: '頁首與資料範圍', href: '#4-1-頁首行為' },
                    { number: '02', label: '查詢條件', href: '#5-查詢條件' },
                    { number: '03', label: '查詢摘要', href: '#7-查詢摘要與彙總' },
                    { number: '04', label: '紀錄列表', href: '#6-列表規格' },
                    { number: '05', label: '替代狀態', href: '#12-頁面狀態與錯誤處理' },
                    { number: '06', label: 'Game Round 明細', href: '#8-game-round-明細' },
                ],
                visualNotes: ['Production only', '不含 DEMO / Test', 'Provider 點數為主', 'Mock 不等於正式契約'],
            }),
        ],
    },
    {
        id: 'provider-finance-module',
        number: '05.4',
        title: '遊戲商財務',
        summary: 'Provider 正式環境財務摘要與代理商 × 遊戲彙總。',
        pages: [
            page('finance-overview', '財務總覽', '/finance', 'src/views/Finance/Overview.vue', 'complete', ['docs/GAME_VENDOR_FINANCE_OVERVIEW_SPEC.md', 'docs/GAME_VENDOR_FINANCE_REPORTING_SPEC.md']),
            page('finance-agent-games', '代理商 × 遊戲彙總', '/finance/agent-games', 'src/views/Finance/AgentGames.vue', 'complete', ['docs/GAME_VENDOR_FINANCE_AGENT_GAME_SPEC.md', 'docs/GAME_VENDOR_FINANCE_REPORTING_SPEC.md']),
        ],
    },
    {
        id: 'monitoring-risk-module',
        number: '05.5',
        title: '遊戲監控與風控',
        summary: '服務健康、Risk Event 分析與 Alert 處理工作台。',
        pages: [
            page('monitoring-overview', '監控總覽', '/monitoring', 'src/views/Provider/MonitoringOverview.vue', 'complete', ['docs/PROVIDER_MONITORING_OVERVIEW_SPEC.md']),
            page('risk-reports', '風控報表', '/monitoring/risk-reports', 'src/views/Provider/RiskReports.vue', 'complete', ['docs/PROVIDER_RISK_REPORT_SPEC.md', 'docs/PROVIDER_RISK_CONTROL_SPEC.md']),
            page('risk-alerts', '風控告警／處理', '/monitoring/alerts', 'src/views/Provider/RiskAlerts.vue', 'complete', ['docs/PROVIDER_RISK_ALERT_HANDLING_SPEC.md', 'docs/PROVIDER_RISK_CONTROL_SPEC.md']),
        ],
    },
    {
        id: 'ggap-integration-module',
        number: '05.6',
        title: 'GGAP 對接',
        summary: 'Provider 與 GGAP 的連線、同步、請求、錯誤、重試及憑證。',
        pages: [
            deferredPage('ggap-overview', '對接總覽', '/ggap', 'src/views/Provider/Placeholder.vue', 'placeholder', ['docs/PROVIDER_GGAP_INTEGRATION_CONTRACT.md'], '等待取得並整合 GGAP 現行正式規格。', ['GGAP 現行系統與產品規格', 'Provider／GGAP 最新責任與資料邊界', '正式 API、認證、簽章、狀態與錯誤契約']),
            deferredPage('ggap-catalog-sync', '遊戲目錄同步', '/ggap/catalog-sync', 'src/views/Provider/Placeholder.vue', 'placeholder', ['docs/PROVIDER_GGAP_INTEGRATION_CONTRACT.md'], '等待取得並整合 GGAP 現行正式規格。', ['遊戲目錄同步方向與觸發時機', '上架狀態與代理商開放控制契約', '同步差異、冪等與重試規則']),
            deferredPage('ggap-requests', '請求與回呼紀錄', '/ggap/requests', 'src/views/Provider/Placeholder.vue', 'placeholder', ['docs/PROVIDER_GGAP_INTEGRATION_CONTRACT.md'], '等待取得並整合 GGAP 現行正式規格。', ['請求與 Callback 類型', '識別碼、ACK、保存與查詢規則', '敏感資料遮罩與檢視權限']),
            deferredPage('ggap-errors', '錯誤與重試', '/ggap/errors', 'src/views/Provider/Placeholder.vue', 'placeholder', ['docs/PROVIDER_GGAP_INTEGRATION_CONTRACT.md'], '等待取得並整合 GGAP 現行正式規格。', ['正式錯誤碼與可重試語意', '重試、補送、冪等與告警規則', '人工處理權限與稽核要求']),
            deferredPage('ggap-settings', '對接設定', '/ggap/settings', 'src/views/Provider/Placeholder.vue', 'placeholder', ['docs/PROVIDER_GGAP_INTEGRATION_CONTRACT.md'], '等待取得並整合 GGAP 現行正式規格。', ['環境、端點與認證模型', '憑證生命週期與輪替責任', '設定權限、驗證與稽核要求']),
        ],
    },
    {
        id: 'notifications-module',
        number: '05.7',
        title: '通知中心',
        summary: 'Provider 站內通知、已讀狀態與使用者偏好。',
        pages: [
            deferredPage('notifications', '全部通知', '/notifications', 'src/views/Provider/Placeholder.vue', 'placeholder', ['docs/NOTIFICATION_SPEC.md'], '通知中心的產品內容與行為尚未完成。', ['通知類型、來源與優先級', '已讀、封存與保留週期', '通知檢視權限與跨頁導流規則']),
            deferredPage('notification-preferences', '通知偏好', '/notifications/preferences', 'src/views/Provider/Placeholder.vue', 'placeholder', ['docs/NOTIFICATION_SPEC.md'], '通知中心的產品內容與行為尚未完成。', ['可設定的通知類型與管道', '預設值、繼承與停用限制', '偏好設定權限及生效時機']),
        ],
    },
    {
        id: 'official-website-module',
        number: '05.8',
        title: '官方網站',
        summary: '遊戲官網內容及 Provider 自有遊戲大廳。',
        pages: [
            page('website-banners', 'Banner 管理', '/website/banners', 'src/views/GameWebsite/Banners.vue', 'complete', ['docs/GAME_WEBSITE_SPEC.md']),
            page('website-content', '內容管理', '/website/content', 'src/views/GameWebsite/Content.vue', 'complete', ['docs/GAME_WEBSITE_SPEC.md']),
            page('website-releases', '發布紀錄', '/website/releases', 'src/views/GameWebsite/Releases.vue', 'complete', ['docs/GAME_WEBSITE_SPEC.md']),
            page('lobby-overview', '大廳總覽', '/lobby', 'src/views/GameLobby/Overview.vue', 'complete', ['docs/GAME_LOBBY_SPEC.md']),
            page('lobby-games', '遊戲清單', '/lobby/games', 'src/views/GameLobby/Games.vue', 'complete', ['docs/GAME_LOBBY_SPEC.md']),
            page('lobby-management', '遊戲管理', '/lobby/management', 'src/views/GameLobby/Management.vue', 'complete', ['docs/GAME_LOBBY_SPEC.md']),
            page('lobby-demo', 'DEMO環境數據', '/lobby/demo', 'src/views/GameLobby/DemoData.vue', 'complete', ['docs/GAME_LOBBY_SPEC.md']),
            page('lobby-preview', '大廳預覽', '/lobby/preview', 'src/views/GameLobby/Preview.vue', 'complete', ['docs/GAME_LOBBY_SPEC.md']),
        ],
    },
    {
        id: 'system-settings-module',
        number: '05.9',
        title: '系統設定',
        summary: 'Provider 使用者、角色、憑證與操作稽核。',
        pages: [
            deferredPage('settings-overview', '設定總覽', '/settings', 'src/views/Settings/Index.vue', 'complete', ['docs/PROVIDER_PORTAL_PAGE_MAP.md'], '系統設定的產品內容與權限模型尚未完成。', ['系統設定資訊架構', 'Provider 使用者與角色模型', '設定項目責任方與安全等級']),
            deferredPage('settings-permissions', '使用者與權限', '/settings/permissions', 'src/views/Settings/Permissions.vue', 'complete', ['docs/PROVIDER_PORTAL_PAGE_MAP.md'], '系統設定的產品內容與權限模型尚未完成。', ['Provider 使用者生命週期', '角色、permission key 與資料 scope', '高風險操作的授權與稽核規則']),
            deferredPage('settings-api-keys', 'API key 與憑證', '/settings/api-keys', 'src/views/Settings/ApiKeys.vue', 'complete', ['docs/PROVIDER_PORTAL_PAGE_MAP.md'], '系統設定的憑證管理規則尚未完成。', ['API key／憑證的用途與擁有者', '建立、顯示、輪替、撤銷與到期規則', '秘密資料遮罩、存放與操作稽核']),
            deferredPage('settings-audit-logs', '操作紀錄', '/system/logs', 'src/views/System/Logs.vue', 'complete', ['docs/PROVIDER_PORTAL_PAGE_MAP.md'], '系統設定的操作稽核規則尚未完成。', ['稽核事件範圍與欄位', '保存期限、查詢、匯出與遮罩規則', '操作紀錄檢視權限']),
        ],
    },
]

export const crossCutting = [
    section('api-integration', '06', 'API 與整合契約', '共用 API、分頁、排序、錯誤、冪等與 GGAP 對接規則。', 'content/06-api-and-integration.md'),
    section('security-permissions', '07', '安全與權限', 'Provider scope、角色權限、敏感資料、認證與 audit。', 'content/07-security-and-permissions.md'),
    section('non-functional-requirements', '08', '非功能性需求', '效能、可用性、保存期限、可觀測性、響應式與無障礙。', 'content/08-non-functional-requirements.md'),
    section('acceptance-qa', '09', '驗收與 QA', '前端、後端、整合與資料品質的共用驗收方式。', 'content/09-acceptance-and-qa.md'),
]

export const appendices = [
    section('data-dictionary', 'A', '資料字典', '共用識別碼、Game Round、金額與時間欄位。', 'content/appendices/data-dictionary.md'),
    section('status-enums', 'B', '狀態與枚舉', '跨頁共用狀態、顯示名稱與正式值。', 'content/appendices/status-enums.md'),
    { ...section('route-page-matrix', 'C', 'Route 與頁面矩陣', '32 個內容頁的集中追溯表。'), generatedMatrix: true },
    section('open-issues', 'D', '待決策與校正清單', '跨模組 TBD、現行文件／程式差異與阻擋範圍。', 'content/appendices/open-issues.md'),
    section('changelog', 'E', '版本紀錄', '規格網站與核准規格的變更摘要。', 'content/appendices/changelog.md'),
    { ...section('spec-book-authoring-guide', 'F', '規格書撰寫與交接規範', '可於本專案沿用，也可獨立移植至其他專案的規格網站方法、模板與品質標準。', 'SPEC_BOOK_AUTHORING_GUIDE.md'), status: 'confirmed' },
    { ...section('page-readiness-matrix', 'G', '第一階段頁面完成度矩陣', '21 個本輪頁面的來源、批次、逐面向完成度與待補主題。', 'content/appendices/page-readiness-matrix.md'), generatedReadiness: true },
    { ...section('page-reconciliation', 'H', '第一階段頁面三層校準', '逐頁區分已確認產品規則、現行原型實況與尚未確認的目標規格。', 'content/appendices/page-reconciliation.md'), generatedReconciliation: true },
    { ...section('page-dependency-map', 'I', '第一階段跨頁依賴圖', '四條核心業務鏈、共用契約與 Deferred 外部依賴。', 'content/appendices/page-dependency-map.md'), generatedDependencies: true },
]

function page(id, title, route, component, prototype, sources, overrides = {}) {
    return {
        id,
        title,
        route,
        component,
        prototype,
        status: 'outline',
        scope: 'active',
        summary: prototype === 'complete' ? '已有內容原型；正式資料契約仍待整理。' : '目前使用 Placeholder；等待內容與契約整理。',
        sources,
        ...overrides,
    }
}

function deferredPage(id, title, route, component, prototype, sources, deferredReason, requiredInputs) {
    return page(id, title, route, component, prototype, sources, {
        scope: 'deferred',
        summary: '本輪延後製作；等待必要規格與產品決策補齊。',
        deferredReason,
        requiredInputs,
    })
}

function section(id, number, title, summary, content) {
    return { id, number, title, summary, status: 'outline', content }
}
