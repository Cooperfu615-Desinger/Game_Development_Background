export const readinessLevels = {
    complete: { label: '完整', shortLabel: 'C', tone: 'complete' },
    partial: { label: '部分', shortLabel: 'P', tone: 'partial' },
    missing: { label: '缺少', shortLabel: 'M', tone: 'missing' },
    na: { label: '不適用', shortLabel: '—', tone: 'na' },
}

export const readinessDimensions = {
    productUi: [
        { key: 'purpose', label: '目的與情境' },
        { key: 'boundary', label: '責任邊界' },
        { key: 'visual', label: '畫面結構' },
        { key: 'fields', label: '欄位規則' },
        { key: 'interactions', label: '互動行為' },
        { key: 'states', label: '頁面狀態' },
    ],
    delivery: [
        { key: 'api', label: 'API 契約' },
        { key: 'data', label: '資料／計算' },
        { key: 'permissions', label: '權限／稽核' },
        { key: 'responsiveA11y', label: '響應式／無障礙' },
        { key: 'acceptance', label: '驗收／測試' },
        { key: 'dependencies', label: '跨頁依賴' },
    ],
}

export const pageReadiness = {
    dashboard: readiness('B', ['complete', 'complete', 'complete', 'complete', 'partial', 'partial'], ['missing', 'partial', 'missing', 'partial', 'partial', 'partial'], [
        '跨模組摘要的正式聚合口徑與資料來源',
        '更新頻率、資料新鮮度與降級顯示契約',
        '卡片導流與資料檢視權限',
    ]),
    'game-list': readiness('C', ['complete', 'complete', 'complete', 'complete', 'complete', 'partial'], ['missing', 'partial', 'partial', 'partial', 'missing', 'complete'], [
        '遊戲與環境狀態的正式來源及狀態轉換',
        '全域上架／下架 API、權限與操作稽核',
        'Loading、error、permission denied 與批次操作規則',
    ]),
    'game-environments': readiness('C', ['partial', 'partial', 'missing', 'missing', 'partial', 'missing'], ['missing', 'missing', 'missing', 'partial', 'missing', 'partial'], [
        'Provider 自有發布流程、狀態與版本／素材綁定',
        '發布前驗證、失敗、歷程與回復策略',
        'GGAP 同步與代理商開放控制契約（等待 GGAP 規格）',
    ]),
    'game-settings': readiness('C', ['partial', 'partial', 'partial', 'partial', 'partial', 'missing'], ['missing', 'missing', 'missing', 'partial', 'missing', 'partial'], [
        '設定分類、欄位 schema、預設值與驗證規則',
        '設定與遊戲版本／環境的綁定方式',
        '儲存、發布、權限與異動稽核契約',
    ]),
    'game-math': readiness('C', ['partial', 'partial', 'partial', 'partial', 'partial', 'missing'], ['missing', 'partial', 'missing', 'partial', 'missing', 'partial'], [
        '數值設定模型、精度、合法範圍與版本策略',
        '驗證、審核、發布及不可逆操作規則',
        '數值設定與風控監測門檻的責任關係',
    ]),
    'game-versions': readiness('C', ['partial', 'partial', 'partial', 'partial', 'partial', 'missing'], ['missing', 'partial', 'missing', 'partial', 'missing', 'partial'], [
        '版本生命週期、相容性、鎖定與狀態轉換',
        '版本與數值／素材／環境的發布綁定',
        '回復、刪除限制、權限與操作稽核',
    ]),
    'game-assets': readiness('C', ['partial', 'partial', 'partial', 'partial', 'partial', 'missing'], ['missing', 'missing', 'missing', 'partial', 'missing', 'partial'], [
        '素材類型、格式、大小、儲存與驗證規則',
        '素材與版本、語系、裝置及環境的綁定',
        '上傳、替換、發布、權限與稽核契約',
    ]),
    'game-round-records': readiness('A', ['complete', 'complete', 'complete', 'complete', 'complete', 'complete'], ['partial', 'partial', 'partial', 'complete', 'complete', 'complete'], [
        '正式 Game Round 狀態 enum 與生命週期',
        'Provider／GGAP Round ID、重送與冪等契約',
        '金額精度、會員識別遮罩、匯出與 permission key',
        '正式 API path、schema、錯誤碼與效能門檻',
    ]),
    'finance-overview': readiness('A', ['complete', 'complete', 'complete', 'complete', 'complete', 'complete'], ['partial', 'partial', 'partial', 'complete', 'complete', 'complete'], [
        '正式聚合口徑、點數／USDT 精度與資料更正規則',
        '摘要、趨勢與排行的 API／效能契約',
        '資料可見範圍、匯出與財務檢視權限',
    ]),
    'finance-agent-games': readiness('A', ['complete', 'complete', 'complete', 'complete', 'complete', 'complete'], ['partial', 'partial', 'partial', 'complete', 'complete', 'complete'], [
        '代理商識別快照來源與歷史名稱顯示規則',
        '聚合計算、精度、分頁排序與資料更正契約',
        '自訂匯出、Game Round 導流與權限 API',
    ]),
    'monitoring-overview': readiness('B', ['complete', 'complete', 'complete', 'complete', 'complete', 'complete'], ['missing', 'partial', 'partial', 'complete', 'partial', 'complete'], [
        '監控指標公式、門檻、採樣與資料來源',
        '更新頻率、資料延遲、可用性與降級契約',
        '查詢、詳情與跨頁導流 API／權限',
    ]),
    'risk-reports': readiness('B', ['complete', 'complete', 'complete', 'complete', 'complete', 'partial'], ['missing', 'partial', 'partial', 'partial', 'partial', 'complete'], [
        'Risk Event 正式 schema、enum 與聚合規則',
        '查詢、詳情、匯出 API 與保存期限',
        '敏感欄位、資料範圍與檢視權限',
    ]),
    'risk-alerts': readiness('B', ['complete', 'complete', 'complete', 'complete', 'complete', 'complete'], ['missing', 'partial', 'partial', 'partial', 'partial', 'complete'], [
        'Alert 操作權限、狀態流轉、併發與失敗處理',
        '自動緩解、GGAP 通知及人工處理契約',
        '工作佇列 API、操作稽核與保存規則',
    ]),
    'website-banners': readiness('D', ['complete', 'complete', 'complete', 'complete', 'complete', 'partial'], ['missing', 'partial', 'missing', 'partial', 'missing', 'partial'], [
        'Banner schema、媒體限制與裝置／語系規則',
        '排程、發布、版本、失敗與回復流程',
        '內容操作權限、API 與異動稽核',
    ]),
    'website-content': readiness('D', ['complete', 'complete', 'partial', 'complete', 'partial', 'missing'], ['missing', 'partial', 'missing', 'partial', 'missing', 'partial'], [
        '多語內容 schema、必填、驗證與 fallback 規則',
        '草稿、預覽、發布、失敗與版本流程',
        '內容操作權限、API 與異動稽核',
    ]),
    'website-releases': readiness('D', ['complete', 'complete', 'partial', 'partial', 'partial', 'partial'], ['missing', 'partial', 'missing', 'partial', 'missing', 'partial'], [
        '發布快照、狀態、版本與變更內容模型',
        '失敗、取消、回復及不可逆操作規則',
        '發布權限、API、操作人與稽核保存契約',
    ]),
    'lobby-overview': readiness('D', ['complete', 'complete', 'complete', 'complete', 'partial', 'partial'], ['missing', 'partial', 'missing', 'partial', 'missing', 'partial'], [
        '大廳公開狀態與檢查結果的正式計算規則',
        '總覽指標、資料來源與更新頻率',
        '跨頁導流、API 與資料檢視權限',
    ]),
    'lobby-games': readiness('D', ['complete', 'complete', 'complete', 'complete', 'complete', 'partial'], ['missing', 'partial', 'missing', 'partial', 'missing', 'partial'], [
        '遊戲納入條件、可見狀態、排序與環境隔離',
        '批次操作、失敗、衝突與儲存規則',
        '管理 API、權限與操作稽核',
    ]),
    'lobby-management': readiness('D', ['complete', 'complete', 'complete', 'complete', 'complete', 'partial'], ['missing', 'partial', 'missing', 'partial', 'missing', 'partial'], [
        '管理草稿、公開版本與變更集模型',
        '公開前驗證、衝突、失敗與回復規則',
        '發布 API、權限與操作稽核',
    ]),
    'lobby-demo': readiness('D', ['complete', 'complete', 'complete', 'complete', 'partial', 'partial'], ['missing', 'partial', 'missing', 'partial', 'missing', 'complete'], [
        'DEMO 資料隔離、保存期限與重設規則',
        '展示指標的 schema、時間口徑與資料來源',
        'DEMO 帳號、查詢 API 與檢視權限',
    ]),
    'lobby-preview': readiness('D', ['complete', 'complete', 'complete', 'complete', 'complete', 'partial'], ['missing', 'partial', 'missing', 'partial', 'missing', 'partial'], [
        '預覽資料來源、草稿版本與公開版本切換',
        '語系、裝置、環境模式與失效狀態',
        '預覽存取權、分享方式與 API 契約',
    ]),
}

function readiness(batch, productUiValues, deliveryValues, blockers) {
    const values = [...productUiValues, ...deliveryValues]
    const keys = [...readinessDimensions.productUi, ...readinessDimensions.delivery].map((item) => item.key)
    return {
        batch,
        ...Object.fromEntries(keys.map((key, index) => [key, values[index]])),
        blockers,
    }
}
