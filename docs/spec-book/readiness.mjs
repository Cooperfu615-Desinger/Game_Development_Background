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
    'website-banners': readiness('D', ['complete', 'complete', 'complete', 'complete', 'complete', 'complete'], ['partial', 'partial', 'partial', 'complete', 'complete', 'complete'], [
        'Banner／revision schema、媒體限制、slot、排程時區與裝置／語系 fallback',
        '驗證、預覽、發布 job、失敗／衝突及 API 契約',
        '內容操作 permission、外部連結／素材安全與 audit',
    ]),
    'website-content': readiness('D', ['complete', 'complete', 'complete', 'complete', 'complete', 'complete'], ['partial', 'partial', 'partial', 'complete', 'complete', 'complete'], [
        '多語內容／結構化聯絡 schema、必填、fallback 與富文字限制',
        '草稿 revision、預覽、發布 job、衝突與 API 契約',
        '法律內容 permission／核准、XSS／連結安全與 audit',
    ]),
    'website-releases': readiness('D', ['complete', 'complete', 'complete', 'complete', 'complete', 'complete'], ['partial', 'partial', 'partial', 'complete', 'complete', 'complete'], [
        '發布 event／job、snapshot、狀態與展示版號正式模型',
        '失敗、取消、衝突、新工作回復及保存規則',
        '事件查詢 API、檢視／發布 permission、錯誤遮罩與 audit',
    ]),
    'lobby-overview': readiness('D', ['complete', 'complete', 'complete', 'complete', 'complete', 'complete'], ['partial', 'partial', 'partial', 'complete', 'complete', 'complete'], [
        '大廳三狀態、readiness 與 DEMO 指標正式計算規則',
        '多來源摘要 API、更新頻率、延遲與局部降級契約',
        'DEMO／Production 隔離、跨頁資料 scope 與 permission',
    ]),
    'lobby-games': readiness('D', ['complete', 'complete', 'complete', 'complete', 'complete', 'complete'], ['partial', 'partial', 'partial', 'complete', 'complete', 'complete'], [
        '遊戲納入／移除條件、公開 snapshot、排序與三狀態正式模型',
        '清單／摘要 API、上游數值／素材參照與局部失敗契約',
        '資料 scope、檢視 permission 與 deep link 授權',
    ]),
    'lobby-management': readiness('D', ['complete', 'complete', 'complete', 'complete', 'complete', 'complete'], ['partial', 'partial', 'partial', 'complete', 'complete', 'complete'], [
        '上游唯讀欄位、lobby draft／published revision 與公開欄位 schema',
        '公開前規則、草稿／發布 API、衝突、失敗及新工作回復',
        '編輯／預覽／發布 permission、媒體安全、核准與 audit',
    ]),
    'lobby-demo': readiness('D', ['complete', 'complete', 'complete', 'complete', 'complete', 'complete'], ['partial', 'partial', 'partial', 'complete', 'complete', 'complete'], [
        'DEMO identity、試玩工作階段、credit、重設、保存與反濫用規則',
        '指標 schema、去重、時間口徑、資料品質、查詢／匯出 API',
        'DEMO namespace 隔離、識別遮罩、檢視／匯出 permission',
    ]),
    'lobby-preview': readiness('D', ['complete', 'complete', 'complete', 'complete', 'complete', 'complete'], ['partial', 'partial', 'partial', 'complete', 'complete', 'complete'], [
        'published／draft revision、語系、裝置、分類與三狀態 manifest',
        'preview／sandbox launch API、expired／stale／asset failure 契約',
        '草稿存取、短效 token、CSP、cache 與外部媒體安全',
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
