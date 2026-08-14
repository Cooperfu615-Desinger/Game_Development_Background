export const dependencyMaturity = {
    boundary: { label: '邊界已確認', tone: 'boundary' },
    draft: { label: '契約待補', tone: 'draft' },
}

export const dependencyKinds = {
    data: '資料輸入',
    aggregate: '聚合／摘要',
    navigation: '導流／追溯',
    state: '狀態／生命週期',
    publication: '發布輸入',
    projection: '隔離投影',
}

export const dependencyChains = [
    {
        id: 'round-finance',
        number: '01',
        title: 'Game Round 與財務鏈',
        batch: 'A → B',
        summary: '以 Production Game Round 作正式財務聚合，再向上提供營運摘要。',
        nodes: [
            node('round-records', '遊戲紀錄', ['game-round-records'], '正式業務明細與追溯基準'),
            node('finance-overview-node', '財務總覽', ['finance-overview'], '全域財務聚合與趨勢'),
            node('finance-agent-game-node', '代理商 × 遊戲', ['finance-agent-games'], '依外部代理商脈絡切分聚合'),
            node('dashboard-finance-node', '儀表板', ['dashboard'], '跨模組營運摘要'),
        ],
        edges: [
            edge('round-records', 'finance-overview-node', 'aggregate', '有效 Production Game Round、點數金額、結算時間與狀態。', '建立投注、派彩、GGR、玩家與趨勢聚合。', 'DEMO／Test 不得混入；取消、回滾、失敗與更正規則需一致。', 'boundary'),
            edge('finance-overview-node', 'finance-agent-game-node', 'aggregate', '共通時間、金額、匯率與有效資料口徑。', '加入代理商 × 遊戲維度並可回查 Game Round。', '代理商是 GGAP 脈絡快照，不是 Provider 主資料。', 'draft'),
            edge('finance-agent-game-node', 'dashboard-finance-node', 'aggregate', '授權範圍內的財務摘要、排行與異常訊號。', '呈現跨模組營運摘要與工作入口。', 'Dashboard 不得創造不同的財務公式或資料範圍。', 'draft'),
        ],
    },
    {
        id: 'monitoring-risk',
        number: '02',
        title: '監控與風控鏈',
        batch: 'B → A',
        summary: '由服務監控發現異常，形成 Risk Event 與 Alert，最後回到 Game Round 追溯。',
        nodes: [
            node('monitoring-node', '監控總覽', ['monitoring-overview'], '服務健康與即時／窗口指標'),
            node('risk-report-node', '風控報表', ['risk-reports'], 'Risk Event 分析與影響範圍'),
            node('risk-alert-node', '風控告警／處理', ['risk-alerts'], 'Alert 工作佇列與處理歷程'),
            node('round-trace-node', 'Game Round 追溯', ['game-round-records'], '關聯明細與原始業務證據'),
        ],
        edges: [
            edge('monitoring-node', 'risk-report-node', 'state', '健康、成功率、延遲與資料品質異常訊號。', '形成可分析的 Risk Event 與統計窗口。', 'Test 不納入 Provider 風控；監控門檻不可直接視為正式風控門檻。', 'draft'),
            edge('risk-report-node', 'risk-alert-node', 'state', 'Risk Event ID、嚴重度、影響範圍與緩解脈絡。', '建立需要追蹤或人工處理的 Alert。', 'Risk Event、Alert、緩解與隔離狀態必須分離。', 'boundary'),
            edge('risk-alert-node', 'round-trace-node', 'navigation', 'Provider／GGAP Round ID、事件與 Alert 關聯。', '核對單筆回合、錯誤、金額及時間軸。', '隔離不得阻斷既有 Round 的必要結算、Callback 與 audit。', 'boundary'),
        ],
    },
    {
        id: 'game-lifecycle',
        number: '03',
        title: '遊戲生命週期鏈',
        batch: 'C',
        summary: '從遊戲主資料進入設定、數值、版本、素材，最後組成可發布的環境版本。',
        nodes: [
            node('game-list-node', '遊戲列表', ['game-list'], '遊戲 ID、主資料與全域狀態'),
            node('game-settings-node', '遊戲設定', ['game-settings'], '一般設定與營運模板'),
            node('game-math-node', '數值設定', ['game-math'], 'RTP、波動度與數值版本'),
            node('game-version-node', '遊戲版本', ['game-versions'], '程式／內容版本生命週期'),
            node('game-assets-node', '遊戲素材', ['game-assets'], '版本、語系與裝置素材'),
            node('game-release-node', '環境與發布', ['game-environments'], 'Production／DEMO 發布與全域狀態'),
        ],
        edges: [
            edge('game-list-node', 'game-settings-node', 'data', 'game_id、遊戲類型、主資料與可設定能力。', '限定設定所屬遊戲與可編輯範圍。', '不得衍生代理商、商戶或會員層級設定。', 'boundary'),
            edge('game-settings-node', 'game-math-node', 'data', '設定版本、環境與共通限制脈絡。', '驗證數值設定的適用遊戲與環境。', '一般設定與數值模型應分開版本化，正式關聯待確認。', 'draft'),
            edge('game-math-node', 'game-version-node', 'state', '已核准數值版本與生效條件。', '綁定可發布的遊戲版本。', 'RTP／賠率精度、審核與回復規則不得由畫面 mock 決定。', 'draft'),
            edge('game-version-node', 'game-assets-node', 'data', '遊戲版本、相容條件與目標裝置／語系。', '選擇對應素材版本並完成發布組合。', '素材不可形成與遊戲版本互相矛盾的獨立真實來源。', 'draft'),
            edge('game-assets-node', 'game-release-node', 'publication', '通過驗證的程式版本、數值版本與素材組合。', '執行環境發布、停用、維護及留下歷程。', 'Provider 只控制全域狀態；代理商個別開放屬 GGAP。', 'boundary'),
        ],
    },
    {
        id: 'website-lobby',
        number: '04',
        title: '官網與遊戲大廳鏈',
        batch: 'C → D',
        summary: '共用 Provider 遊戲主資料與素材，建立官網內容、大廳公開資料、DEMO 投影及預覽。',
        nodes: [
            node('game-master-node', '遊戲主資料', ['game-list'], '遊戲 ID、名稱、版本、數值與素材參照'),
            node('website-node', '官方網站', ['website-banners', 'website-content', 'website-releases'], 'Banner、靜態內容與網站發布紀錄'),
            node('lobby-node', '遊戲大廳', ['lobby-overview', 'lobby-games', 'lobby-management'], '公開遊戲清單、內容管理與檢查'),
            node('lobby-demo-node', 'DEMO 環境數據', ['lobby-demo'], '隔離展示指標與測試脈絡'),
            node('lobby-preview-node', '大廳預覽', ['lobby-preview'], '玩家端樣式的預覽投影'),
        ],
        edges: [
            edge('game-master-node', 'website-node', 'data', '遊戲識別、名稱、版本、數值與可用素材參照。', '建立 Provider 官網的 Banner 與靜態內容。', '官網不得複製出另一套遊戲主資料真實來源。', 'boundary'),
            edge('website-node', 'lobby-node', 'publication', '已發布的品牌、素材、語系與內容版本脈絡。', '建立大廳公開內容與檢查清單。', '官網發布與遊戲全域上架是不同生命週期，正式關聯待確認。', 'draft'),
            edge('lobby-node', 'lobby-demo-node', 'projection', '已選遊戲、公開資料、DEMO 可用狀態與展示設定。', '產生隔離的 DEMO 活躍與遊戲表現資料。', 'DEMO 不得混入 Production Game Round、財務或風控。', 'boundary'),
            edge('lobby-demo-node', 'lobby-preview-node', 'projection', 'DEMO 遊戲清單、展示狀態與模擬餘額脈絡。', '在 Desktop／Mobile／語系模式預覽玩家端成果。', 'DEMO 餘額、玩家與 Session 只可作展示，不代表 Provider 錢包或會員主資料。', 'boundary'),
        ],
    },
]

export const deferredDependencies = [
    {
        id: 'ggap-dependency',
        title: 'GGAP 對接規格',
        source: '05.6 GGAP 對接（Deferred）',
        targets: ['game-environments', 'game-round-records', 'finance-agent-games', 'monitoring-overview', 'risk-reports', 'risk-alerts'],
        knownBoundary: 'GGAP 擁有平台、代理商個別遊戲開放、會員／錢包與平台帳務；Provider 只保留外部識別與整合脈絡。',
        blockedContract: '正式 API、認證、簽章、Callback、ACK、重試、同步與狀態 enum。',
    },
    {
        id: 'notification-dependency',
        title: '通知中心規格',
        source: '05.7 通知中心（Deferred）',
        targets: ['dashboard', 'risk-alerts'],
        knownBoundary: 'Active 頁面可標示通知依賴或目前通知狀態，但不得反推通知類型、管道、偏好與生命週期。',
        blockedContract: '通知事件、優先級、已讀、保留、管道、偏好、權限與跨頁導流。',
    },
    {
        id: 'settings-dependency',
        title: '系統設定規格',
        source: '05.9 系統設定（Deferred）',
        targets: ['dashboard', 'game-list', 'game-environments', 'game-settings', 'game-math', 'game-versions', 'game-assets', 'game-round-records', 'finance-overview', 'finance-agent-games', 'monitoring-overview', 'risk-reports', 'risk-alerts', 'website-banners', 'website-content', 'website-releases', 'lobby-overview', 'lobby-games', 'lobby-management', 'lobby-demo', 'lobby-preview'],
        knownBoundary: '所有 Active 頁仍需遵守 Provider scope、最小權限、敏感資料與操作稽核原則。',
        blockedContract: '使用者／角色模型、permission key、API key／憑證生命週期及 audit log UI。',
    },
]

function node(id, label, pageIds, role) {
    return { id, label, pageIds, role }
}

function edge(from, to, kind, output, consumer, guardrail, maturity) {
    return { from, to, kind, output, consumer, guardrail, maturity }
}
