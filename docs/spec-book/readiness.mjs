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
    dashboard: readiness('B', ['complete', 'complete', 'complete', 'complete', 'complete', 'complete'], ['partial', 'partial', 'partial', 'complete', 'complete', 'complete'], [
        '正式聚合口徑、資料來源、門檻與資料新鮮度',
        '摘要／趨勢／工作入口的 API schema 與資料 scope 權限',
        '通知中心維持 Deferred，正式事件與完成回饋待後續整合',
    ]),
    'game-list': readiness('C', ['complete', 'complete', 'complete', 'complete', 'complete', 'complete'], ['partial', 'partial', 'partial', 'complete', 'complete', 'complete'], [
        '遊戲與三環境狀態的正式來源、enum 與轉換規則',
        '列表／詳情／RTP／同步 API 及 Provider scope 權限',
        'GGAP 同步詳細契約等待外部規格，本頁僅保留摘要',
    ]),
    'game-environments': readiness('C', ['complete', 'complete', 'complete', 'complete', 'complete', 'complete'], ['partial', 'partial', 'partial', 'complete', 'complete', 'complete'], [
        '正式發布組合、生命週期、狀態機與補償策略',
        'Production 核准、allowed actions、併發、冪等與 audit 契約',
        'GGAP 同步等待外部規格；程式仍需由 Placeholder 實作成目標頁',
    ]),
    'game-settings': readiness('C', ['complete', 'complete', 'complete', 'complete', 'complete', 'complete'], ['partial', 'partial', 'partial', 'complete', 'complete', 'complete'], [
        '設定 schema、版本、時區、點數精度與相依驗證的正式契約',
        '草稿／審核／生效與遊戲／環境套用 API',
        'Production permission、併發、核准與 audit 契約',
    ]),
    'game-math': readiness('C', ['complete', 'complete', 'complete', 'complete', 'complete', 'complete'], ['partial', 'partial', 'partial', 'complete', 'complete', 'complete'], [
        '數值 schema、decimal、賠率 checksum、模擬與相容性契約',
        'RTP 監控窗口、樣本、偏離與正式風控門檻',
        '審核／發布／回復 API、permission、匯出與 audit',
    ]),
    'game-versions': readiness('C', ['complete', 'complete', 'complete', 'complete', 'complete', 'complete'], ['partial', 'partial', 'partial', 'complete', 'complete', 'complete'], [
        '版本／artifact schema、狀態、相容性與鎖定規則',
        '數值／素材／設定參照及 release job API',
        '審核、回復、封存／刪除限制、權限與 audit',
    ]),
    'game-assets': readiness('C', ['complete', 'complete', 'complete', 'complete', 'complete', 'complete'], ['partial', 'partial', 'partial', 'complete', 'complete', 'complete'], [
        '素材格式、尺寸、大小、語系／usage、fallback 與 alt text 契約',
        '上傳 session、掃描、儲存、預覽、版本與引用 API',
        '替換、審核、下載／匯出、權限、保存與 audit',
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
    'monitoring-overview': readiness('B', ['complete', 'complete', 'complete', 'complete', 'complete', 'complete'], ['partial', 'partial', 'partial', 'complete', 'complete', 'complete'], [
        '監控指標公式、門檻、採樣與資料來源',
        '更新頻率、資料延遲、可用性與降級契約',
        '查詢、詳情與跨頁導流 API／權限',
    ]),
    'risk-reports': readiness('B', ['complete', 'complete', 'complete', 'complete', 'complete', 'complete'], ['partial', 'partial', 'partial', 'complete', 'complete', 'complete'], [
        'Risk Event 正式 schema、enum 與聚合規則',
        '查詢、詳情、匯出 API 與保存期限',
        '敏感欄位、資料範圍與檢視權限',
    ]),
    'risk-alerts': readiness('B', ['complete', 'complete', 'complete', 'complete', 'complete', 'complete'], ['partial', 'partial', 'partial', 'complete', 'complete', 'complete'], [
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
