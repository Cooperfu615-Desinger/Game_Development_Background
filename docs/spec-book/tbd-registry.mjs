export const tbdCategories = {
    domain: { number: '01', label: 'Domain', title: '產品領域與生命週期', tone: 'domain' },
    data: { number: '02', label: 'Data', title: '資料、計算與保存', tone: 'data' },
    api: { number: '03', label: 'API', title: '介面與整合契約', tone: 'api' },
    security: { number: '04', label: 'Security', title: '權限、敏感資料與稽核', tone: 'security' },
    nfr: { number: '05', label: 'NFR', title: '效能、可靠性與可用性', tone: 'nfr' },
    external: { number: '06', label: 'External', title: '外部規格與延後模組依賴', tone: 'external' },
}

export const tbdStatuses = {
    decision: { label: '待決策', tone: 'decision' },
    definition: { label: '待定義', tone: 'definition' },
    partial: { label: '部分已有', tone: 'partial' },
    external: { label: '等待外部輸入', tone: 'external' },
}

export const tbdPriorities = {
    P0: { label: 'P0', description: '阻擋正式資料／API／高風險流程或上線。', tone: 'p0' },
    P1: { label: 'P1', description: '阻擋模組完整規格、整合或驗收。', tone: 'p1' },
    P2: { label: 'P2', description: '不阻擋骨架撰寫，但需在正式驗收前完成。', tone: 'p2' },
}

export const blockingScopes = {
    frontend: 'Frontend',
    backend: 'Backend',
    integration: 'Integration',
    qa: 'QA',
    release: '正式上線',
}

export const tbdRegistry = [
    tbd('TBD-DOM-001', 'domain', 'Game Round 正式生命週期', '確認正式 round status、終態、取消／調整／延遲結算、重送、冪等與資料更正流程。', ['Product', 'Backend', 'GGAP'], ['game-round-records', 'finance-overview', 'finance-agent-games', 'monitoring-overview', 'risk-reports', 'risk-alerts', 'dashboard'], ['round-finance', 'monitoring-risk'], ['backend', 'integration', 'qa', 'release'], 'P0', 'partial', 'Batch A 契約整理前', ['GR-001', 'GR-014']),
    tbd('TBD-DOM-002', 'domain', '正式財務指標與正負方向', '確認有效 Game Round、投注、派彩、玩家淨輸贏、Provider GGR、取消／回滾／調整的唯一公式與正負方向。', ['Product', 'Finance', 'Backend'], ['game-round-records', 'finance-overview', 'finance-agent-games', 'dashboard'], ['round-finance'], ['backend', 'qa', 'release'], 'P0', 'partial', 'Batch A 契約整理前', ['GR-005']),
    tbd('TBD-DOM-003', 'domain', '遊戲發布組合與生命週期', '定義設定、數值、版本、素材如何組成可發布版本，以及草稿、審核、Production／DEMO 生效、維護、停用與回復狀態。', ['Product', 'Game Engineering', 'Backend'], ['game-list', 'game-environments', 'game-settings', 'game-math', 'game-versions', 'game-assets'], ['game-lifecycle'], ['frontend', 'backend', 'qa', 'release'], 'P0', 'definition', 'Batch C 開始前'),
    tbd('TBD-DOM-004', 'domain', 'Risk Event、Alert、緩解與隔離模型', '確認 Risk Event 與 Alert 的建立條件、狀態機、關聯、結案／誤報、緩解、隔離、解除及既有 Round 保留行為。', ['Product', 'Risk', 'Backend', 'SRE'], ['monitoring-overview', 'risk-reports', 'risk-alerts', 'game-round-records'], ['monitoring-risk'], ['backend', 'integration', 'qa', 'release'], 'P0', 'partial', 'Batch B 契約整理前'),
    tbd('TBD-DOM-005', 'domain', '官網與大廳發布模型', '確認官網內容、大廳公開內容、遊戲全域上架、草稿／公開版本、預覽及回復是獨立還是關聯生命週期。', ['Product', 'Content Operations', 'Frontend', 'Backend'], ['website-banners', 'website-content', 'website-releases', 'lobby-overview', 'lobby-games', 'lobby-management', 'lobby-preview'], ['website-lobby'], ['frontend', 'backend', 'qa'], 'P1', 'definition', 'Batch D 開始前'),
    tbd('TBD-DOM-006', 'domain', 'DEMO 展示模型與責任邊界', '定義 DEMO 帳號、玩家、Session、模擬餘額、資料重設與試玩啟動語意，並確認它們不形成 Provider 會員或錢包主資料。', ['Product', 'Backend', 'Security'], ['game-environments', 'lobby-overview', 'lobby-games', 'lobby-management', 'lobby-demo', 'lobby-preview'], ['website-lobby'], ['frontend', 'backend', 'qa'], 'P1', 'partial', 'Batch D 開始前'),

    tbd('TBD-DAT-001', 'data', '點數、USDT、匯率與精度', '確認點數與 USDT 的 decimal 精度、四捨五入、匯率方向、來源、生效時間、規則版本及歷史重現方式。', ['Finance', 'Backend', 'GGAP'], ['game-round-records', 'finance-overview', 'finance-agent-games', 'dashboard'], ['round-finance'], ['backend', 'integration', 'qa', 'release'], 'P0', 'partial', 'Batch A 契約整理前', ['GR-006']),
    tbd('TBD-DAT-002', 'data', '跨系統識別碼與交易快照', '確認 Provider／GGAP Round ID、request ID、agent／member 識別的生成、唯一性、交換時點、歷史名稱、遮罩與 snapshot／join 策略。', ['Backend', 'Data', 'GGAP', 'Security'], ['game-round-records', 'finance-agent-games', 'monitoring-overview', 'risk-reports', 'risk-alerts'], ['round-finance', 'monitoring-risk'], ['backend', 'integration', 'qa', 'release'], 'P0', 'partial', 'Batch A 契約整理前', ['GR-002', 'GR-007', 'GR-008', 'GR-009']),
    tbd('TBD-DAT-003', 'data', '時間、時區、窗口與資料新鮮度', '統一事件時間、結算時間、統計日、rolling window、顯示時區、資料更新時間、過期判定與跨日邊界。', ['Product', 'Backend', 'Data', 'SRE'], ['dashboard', 'game-round-records', 'finance-overview', 'finance-agent-games', 'monitoring-overview', 'risk-reports', 'risk-alerts', 'website-releases', 'lobby-demo'], ['round-finance', 'monitoring-risk', 'website-lobby'], ['backend', 'qa'], 'P1', 'partial', '各批次驗收前', ['GR-003']),
    tbd('TBD-DAT-004', 'data', '資料保存、更正與不可變追溯', '確認 Game Round、財務聚合、Risk Event、Alert、發布紀錄及 audit 的保存期限、更正方式、版本化與不可變欄位。', ['Product', 'Backend', 'Data Governance', 'Security'], ['game-round-records', 'finance-overview', 'finance-agent-games', 'risk-reports', 'risk-alerts', 'website-releases'], ['round-finance', 'monitoring-risk', 'website-lobby'], ['backend', 'qa', 'release'], 'P1', 'definition', '正式上線前'),
    tbd('TBD-DAT-005', 'data', '監控指標、門檻與採樣規則', '確認健康、成功率、延遲、數值偏離、嚴重度、統計窗口、樣本量、門檻版本及無資料判定。', ['Risk', 'SRE', 'Game Math', 'Backend'], ['dashboard', 'game-math', 'monitoring-overview', 'risk-reports', 'risk-alerts', 'lobby-demo'], ['monitoring-risk'], ['backend', 'qa', 'release'], 'P0', 'partial', 'Batch B 契約整理前'),
    tbd('TBD-DAT-006', 'data', '多語內容、素材與 fallback schema', '確認語系清單、繁中預設、fallback、文字／富文字限制、媒體格式、尺寸、大小、版本、裝置用途與可存取替代文字。', ['Product', 'Content Operations', 'Frontend', 'Backend'], ['game-assets', 'website-banners', 'website-content', 'website-releases', 'lobby-management', 'lobby-preview'], ['game-lifecycle', 'website-lobby'], ['frontend', 'backend', 'qa'], 'P1', 'definition', 'Batch C／D 開始前'),

    tbd('TBD-API-001', 'api', 'Provider Portal 共通 API 契約', '核准 base URL、版本、認證、錯誤 envelope、trace ID、分頁、排序、filter、冪等、欄位驗證及時間格式。', ['Backend', 'Frontend', 'Security'], allActivePages(), ['round-finance', 'monitoring-risk', 'game-lifecycle', 'website-lobby'], ['frontend', 'backend', 'integration', 'qa', 'release'], 'P0', 'definition', '第一個正式 API 前', ['GR-004', 'GR-013']),
    tbd('TBD-API-002', 'api', 'Game Round 查詢、詳情與匯出 API', '核准查詢條件、最大時間、列表／詳情 schema、狀態、原始 payload、跨頁 deep link、匯出上限與非同步流程。', ['Backend', 'Frontend', 'Security'], ['game-round-records', 'finance-agent-games', 'risk-reports', 'risk-alerts'], ['round-finance', 'monitoring-risk'], ['frontend', 'backend', 'qa', 'release'], 'P0', 'partial', 'Batch A 契約整理前', ['GR-003', 'GR-010', 'GR-011']),
    tbd('TBD-API-003', 'api', '財務聚合與排行 API', '定義財務總覽、代理商 × 遊戲、趨勢、排行、摘要、分頁與 Dashboard 摘要的 request／response 及大量資料策略。', ['Backend', 'Finance', 'Frontend'], ['finance-overview', 'finance-agent-games', 'dashboard'], ['round-finance'], ['frontend', 'backend', 'qa'], 'P0', 'definition', 'Batch A 契約整理前'),
    tbd('TBD-API-004', 'api', '監控、Risk Event 與 Alert API', '定義監控摘要、遊戲健康、Risk Event、Alert 工作佇列、詳情、指派、處理、隔離、解除及跨頁 query。', ['Backend', 'Risk', 'SRE', 'Frontend'], ['dashboard', 'monitoring-overview', 'risk-reports', 'risk-alerts', 'game-round-records'], ['monitoring-risk'], ['frontend', 'backend', 'integration', 'qa', 'release'], 'P0', 'definition', 'Batch B 契約整理前'),
    tbd('TBD-API-005', 'api', '遊戲生命週期與發布 API', '定義遊戲、設定、數值、版本、素材、環境、驗證、審核、發布、停用、維護與回復 API。', ['Game Engineering', 'Backend', 'Frontend', 'Security'], ['game-list', 'game-environments', 'game-settings', 'game-math', 'game-versions', 'game-assets'], ['game-lifecycle'], ['frontend', 'backend', 'integration', 'qa', 'release'], 'P0', 'definition', 'Batch C 開始前'),
    tbd('TBD-API-006', 'api', '官網與遊戲大廳 API', '定義 Banner、內容、發布紀錄、大廳遊戲、管理、DEMO 指標與預覽的 CRUD、版本、檢查與發布介面。', ['Backend', 'Frontend', 'Content Operations'], ['website-banners', 'website-content', 'website-releases', 'lobby-overview', 'lobby-games', 'lobby-management', 'lobby-demo', 'lobby-preview'], ['website-lobby'], ['frontend', 'backend', 'qa'], 'P1', 'definition', 'Batch D 開始前'),

    tbd('TBD-SEC-001', 'security', '角色、資料 scope 與 permission key', '定義 Provider 內部角色、讀取／匯出／發布／正式環境／風控處理等 action、資料 scope、預設拒絕及後端強制驗證。', ['Product', 'Security', 'Backend'], allActivePages(), ['round-finance', 'monitoring-risk', 'game-lifecycle', 'website-lobby'], ['frontend', 'backend', 'qa', 'release'], 'P0', 'external', '系統設定規格取得後'),
    tbd('TBD-SEC-002', 'security', '敏感識別、payload 與遮罩', '確認會員、代理商、request／trace ID、原始 payload、錯誤內容、財務與風控資料的分級、遮罩、複製、查詢與支援存取。', ['Security', 'Backend', 'Support'], ['game-round-records', 'finance-agent-games', 'monitoring-overview', 'risk-reports', 'risk-alerts'], ['round-finance', 'monitoring-risk'], ['frontend', 'backend', 'qa', 'release'], 'P0', 'definition', 'Batch A／B 契約整理前', ['GR-007', 'GR-009', 'GR-011']),
    tbd('TBD-SEC-003', 'security', '高風險操作、核准、併發與稽核', '確認 Production 發布、設定／數值異動、隔離／解除、風控結案、內容發布的雙人核准、重新驗證、併發鎖、失敗補償與 audit。', ['Product', 'Security', 'Backend', 'SRE'], ['game-environments', 'game-settings', 'game-math', 'game-versions', 'game-assets', 'risk-alerts', 'website-banners', 'website-content', 'website-releases', 'lobby-management'], ['monitoring-risk', 'game-lifecycle', 'website-lobby'], ['frontend', 'backend', 'qa', 'release'], 'P0', 'definition', '高風險操作實作前'),
    tbd('TBD-SEC-004', 'security', '匯出、下載與檔案保存權限', '確認可匯出欄位、資料範圍、同步／非同步、檔案加密、下載 URL、保存期限、權限變更與 audit。', ['Security', 'Backend', 'Product'], ['game-round-records', 'finance-overview', 'finance-agent-games', 'game-math', 'game-versions', 'game-assets', 'risk-reports', 'lobby-demo'], ['round-finance', 'monitoring-risk', 'game-lifecycle', 'website-lobby'], ['frontend', 'backend', 'qa', 'release'], 'P1', 'definition', '匯出功能實作前', ['GR-010']),
    tbd('TBD-SEC-005', 'security', '公開內容、預覽與媒體安全', '定義富文字／連結清理、媒體掃描、預覽存取、分享 token、草稿洩漏、CSP 及公開內容發布安全檢查。', ['Security', 'Frontend', 'Backend', 'Content Operations'], ['website-banners', 'website-content', 'lobby-management', 'lobby-preview'], ['website-lobby'], ['frontend', 'backend', 'qa', 'release'], 'P1', 'definition', 'Batch D 驗收前'),

    tbd('TBD-NFR-001', 'nfr', '查詢、列表、聚合與匯出效能門檻', '確認正式資料量、P95／P99 查詢延遲、分頁規模、聚合窗口、同步匯出上限、非同步完成時間與逾時策略。', ['Product', 'Backend', 'SRE', 'QA'], ['dashboard', 'game-list', 'game-round-records', 'finance-overview', 'finance-agent-games', 'monitoring-overview', 'risk-reports', 'risk-alerts'], ['round-finance', 'monitoring-risk'], ['backend', 'qa', 'release'], 'P1', 'definition', '效能驗收前', ['GR-012']),
    tbd('TBD-NFR-002', 'nfr', '資料更新、快取、失效與降級', '定義自動／手動更新、快取、stale threshold、最後更新時間、局部失敗、無資料與跨模組降級顯示。', ['SRE', 'Backend', 'Frontend', 'Product'], ['dashboard', 'finance-overview', 'monitoring-overview', 'risk-reports', 'risk-alerts', 'lobby-overview', 'lobby-demo'], ['round-finance', 'monitoring-risk', 'website-lobby'], ['frontend', 'backend', 'qa'], 'P1', 'partial', '各批次驗收前'),
    tbd('TBD-NFR-003', 'nfr', '可靠性、冪等、重試與可觀測性', '確認發布、Game Round、Callback、Alert 操作與內容發布的冪等 key、有限重試、補送、trace、metrics、logs 與人工復原流程。', ['Backend', 'SRE', 'GGAP'], ['game-round-records', 'game-environments', 'risk-alerts', 'website-releases', 'lobby-management'], ['round-finance', 'monitoring-risk', 'game-lifecycle', 'website-lobby'], ['backend', 'integration', 'qa', 'release'], 'P0', 'partial', '整合測試前'),
    tbd('TBD-NFR-004', 'nfr', '響應式、可存取性與繁中顯示驗收', '把共用 layout、390px Mobile、鍵盤、焦點、表格、Dialog、錯誤宣告、狀態非色彩辨識、長 ID 與繁中術語轉成逐頁驗收案例。', ['Frontend', 'QA', 'Product'], allActivePages(), ['round-finance', 'monitoring-risk', 'game-lifecycle', 'website-lobby'], ['frontend', 'qa'], 'P2', 'partial', '各頁規格完成前'),

    tbd('TBD-EXT-001', 'external', '取得並整合 GGAP 現行正式規格', '取得 GGAP 系統、遊戲目錄、啟動、錢包脈絡、結算、Callback、ACK、簽章、重試、狀態與代理商開放控制規格。', ['GGAP', 'Backend', 'Product'], ['game-environments', 'game-round-records', 'finance-agent-games', 'monitoring-overview', 'risk-reports', 'risk-alerts'], ['round-finance', 'monitoring-risk', 'game-lifecycle'], ['integration', 'backend', 'qa', 'release'], 'P0', 'external', 'GGAP 規格取得後'),
    tbd('TBD-EXT-002', 'external', '通知中心產品與事件契約', '確認通知類型、來源、優先級、已讀、保存、管道、偏好、權限、匯出完成與告警處理導流。', ['Product', 'Backend'], ['dashboard', 'risk-alerts'], ['round-finance', 'monitoring-risk'], ['frontend', 'backend', 'qa'], 'P2', 'external', '通知中心重新排入 Active 後'),
    tbd('TBD-EXT-003', 'external', '系統設定、角色、憑證與 audit 規格', '取得 Provider 使用者／角色模型、permission key、API key／憑證生命週期及操作紀錄 UI／資料契約。', ['Product', 'Security', 'Backend'], allActivePages(), ['round-finance', 'monitoring-risk', 'game-lifecycle', 'website-lobby'], ['frontend', 'backend', 'integration', 'qa', 'release'], 'P0', 'external', '系統設定重新排入 Active 後'),
]

function tbd(id, category, title, question, owners, pageIds, chainIds, blocks, priority, status, neededBy, legacyRefs = []) {
    return { id, category, title, question, owners, pageIds, chainIds, blocks, priority, status, neededBy, legacyRefs }
}

function allActivePages() {
    return [
        'dashboard',
        'game-list', 'game-environments', 'game-settings', 'game-math', 'game-versions', 'game-assets',
        'game-round-records',
        'finance-overview', 'finance-agent-games',
        'monitoring-overview', 'risk-reports', 'risk-alerts',
        'website-banners', 'website-content', 'website-releases',
        'lobby-overview', 'lobby-games', 'lobby-management', 'lobby-demo', 'lobby-preview',
    ]
}
