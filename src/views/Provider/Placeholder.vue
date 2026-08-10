<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

interface PlaceholderMeta {
    description?: string
    responsibility?: string
    apiNote?: string
}

interface PlaceholderSection {
    eyebrow: string
    title: string
    body: string
    icon: string
}

interface PlaceholderStat {
    label: string
    value: string
    note: string
}

interface PlaceholderTable {
    title: string
    caption: string
    columns: string[]
    rows: string[][]
}

interface PlaceholderBlueprint {
    sections: PlaceholderSection[]
    stats: PlaceholderStat[]
    table: PlaceholderTable
    emptyTitle: string
    emptyBody: string
    apiNote?: string
}

const route = useRoute()
const { t } = useI18n()
const hidePlaceholderIntro = computed(() => route.name === 'GameEnvironments' || route.name === 'ProviderMonitoring')

const placeholderMeta = computed<PlaceholderMeta>(() => {
    const meta = route.meta.providerPlaceholder
    return meta && typeof meta === 'object' ? (meta as PlaceholderMeta) : {}
})

const defaultBlueprint: PlaceholderBlueprint = {
    sections: [
        { eyebrow: 'SUMMARY', title: '摘要與狀態', body: '保留主要指標與目前狀態的摘要區塊。', icon: 'pi pi-chart-line' },
        { eyebrow: 'QUERY / LIST', title: '查詢條件與資料列表', body: '保留查詢條件、排序與資料列表的展示位置。', icon: 'pi pi-list' },
        { eyebrow: 'DETAIL / ACTION', title: '明細／操作入口', body: '保留單筆詳情、處理與後續操作的入口。', icon: 'pi pi-sliders-h' },
    ],
    stats: [
        { label: '展示資料', value: '—', note: 'Prototype / Mock data' },
        { label: '待確認項目', value: '—', note: '等待正式契約' },
        { label: '資料狀態', value: '空資料', note: '正式 API 尚未接入' },
    ],
    table: {
        title: '展示資料列表',
        caption: '目前先保留欄位與內容位置，未連接正式資料來源。',
        columns: ['項目', '狀態', '最後更新'],
        rows: [['Mock item', '待接資料', '—']],
    },
    emptyTitle: '目前尚無可展示的正式資料',
    emptyBody: '這個狀態保留查詢、清除條件與重新載入的後續位置；目前不連接正式 API。',
}

const pageBlueprints: Record<string, PlaceholderBlueprint> = {
    Dashboard: {
        sections: [
            { eyebrow: 'OPERATIONS SNAPSHOT', title: 'Provider 營運摘要', body: '快速掌握遊戲數量、正式上線狀態與近期營運規模。', icon: 'pi pi-chart-line' },
            { eyebrow: 'HEALTH SIGNALS', title: '連線與資料健康', body: '集中查看 GGAP 連線、Game Round 與資料服務健康訊號。', icon: 'pi pi-heart' },
            { eyebrow: 'ACTION QUEUE', title: '待處理事項', body: '保留告警、通知與需要營運人員檢視的工作入口。', icon: 'pi pi-inbox' },
        ],
        stats: [
            { label: '遊戲總數', value: '42', note: 'Provider mock catalog' },
            { label: '正式上線', value: '38', note: 'Production enabled' },
            { label: '待處理告警', value: '3', note: 'Risk queue' },
            { label: 'GGAP 健康', value: '99.98%', note: '近 24 小時展示值' },
        ],
        table: {
            title: '遊戲健康列表',
            caption: '以展示資料呈現遊戲、環境與服務狀態。',
            columns: ['遊戲', '環境', '服務狀態', '最近活動'],
            rows: [
                ['Neon Heist', 'Production', '正常', '2 分鐘前'],
                ['Crash Drift', 'DEMO', '需關注', '8 分鐘前'],
                ['Orbit Dice', 'Test', '測試中', '15 分鐘前'],
            ],
        },
        emptyTitle: '查無 Provider 營運資料',
        emptyBody: '正式接入後，這裡會保留日期範圍、環境與資料權限下的空資料狀態。',
    },
    GameEnvironments: {
        sections: [
            { eyebrow: 'ENVIRONMENT MATRIX', title: '正式／DEMO／測試環境', body: '分開呈現三種環境的版本、健康與可操作狀態。', icon: 'pi pi-server' },
            { eyebrow: 'RELEASE ENTRY', title: '已部署版本發布', body: '保留已部署版本啟用、停用與維護狀態的入口。', icon: 'pi pi-upload' },
            { eyebrow: 'AUDIT CONTEXT', title: '發布狀態與紀錄', body: '保留版本變更、環境差異與後續操作紀錄的位置。', icon: 'pi pi-history' },
        ],
        stats: [
            { label: 'Production', value: '14', note: '可服務遊戲' },
            { label: 'DEMO', value: '12', note: '隔離環境上線' },
            { label: 'Test', value: '16', note: '只讀監控' },
            { label: '待發布', value: '2', note: 'Mock release queue' },
        ],
        table: {
            title: '環境與版本狀態',
            caption: '展示正式、DEMO、測試環境與已部署版本。',
            columns: ['遊戲', '環境', '版本', '狀態'],
            rows: [
                ['Neon Heist', 'Production', 'v2.4.1', '已啟用'],
                ['Neon Heist', 'DEMO', 'v2.5.0-rc1', '待確認'],
                ['Crash Drift', 'Test', 'v1.8.3', '監控中'],
            ],
        },
        emptyTitle: '目前沒有符合條件的環境資料',
        emptyBody: '正式接入後會保留環境篩選、清除條件與重新載入的空資料狀態。',
        apiNote: '待接入環境狀態、部署版本、啟用操作與操作紀錄資料契約。',
    },
    ProviderMonitoring: {
        sections: [
            { eyebrow: 'FIVE SIGNALS', title: '五張監控摘要卡', body: '以服務可用性、Round 成功率、延遲、告警與異常量快速判讀健康度。', icon: 'pi pi-heart' },
            { eyebrow: 'HEALTH LIST', title: '遊戲健康列表', body: '呈現遊戲服務狀態、最近檢查時間與需要關注的項目。', icon: 'pi pi-list-check' },
            { eyebrow: 'DRILL-DOWN', title: '異常追蹤入口', body: '保留進入風控報表與告警處理頁的後續入口。', icon: 'pi pi-arrow-right-arrow-left' },
        ],
        stats: [
            { label: '遊戲健康', value: '42 / 45', note: '服務可用狀態' },
            { label: 'Round 成功率', value: '99.8%', note: '近 24 小時' },
            { label: 'GGAP 延遲', value: '182 ms', note: '展示平均值' },
            { label: '風控告警', value: '3', note: '高嚴重度 1' },
            { label: '未處理異常', value: '8', note: '待進一步檢視' },
        ],
        table: {
            title: '遊戲健康列表',
            caption: 'mock data 先展示健康狀態與最近檢查結果。',
            columns: ['遊戲', '健康度', '最近檢查', '處理狀態'],
            rows: [
                ['Neon Heist', '99.99%', '30 秒前', '正常'],
                ['Crash Drift', '98.42%', '1 分鐘前', '需關注'],
                ['Orbit Dice', '—', '3 分鐘前', '檢查中'],
            ],
        },
        emptyTitle: '目前沒有遊戲健康資料',
        emptyBody: '正式接入後會依遊戲、環境與時間範圍顯示健康列表與空資料狀態。',
    },
    ProviderRiskReports: {
        sections: [
            { eyebrow: 'QUERY', title: '異常數據查詢', body: '保留時間、遊戲、異常類型與嚴重度的查詢條件。', icon: 'pi pi-filter' },
            { eyebrow: 'TREND', title: '風控趨勢', body: '呈現異常數量、嚴重度與處理進度的趨勢區塊。', icon: 'pi pi-chart-bar' },
            { eyebrow: 'DETAIL LIST', title: '風控詳細列表', body: '保留異常事件、Game Round 脈絡與詳情入口。', icon: 'pi pi-list' },
        ],
        stats: [
            { label: '異常事件', value: '128', note: '近 7 日展示值' },
            { label: '高嚴重度', value: '7', note: '需要優先檢視' },
            { label: '已處理', value: '86%', note: 'mock handling rate' },
            { label: '異常趨勢', value: '-12%', note: '較前一期間' },
        ],
        table: {
            title: '風控異常詳細列表',
            caption: '展示異常類型、影響範圍與處理狀態。',
            columns: ['異常類型', '遊戲', '嚴重度', '狀態'],
            rows: [
                ['短時間重複結算', 'Neon Heist', '高', '待處理'],
                ['請求延遲升高', 'Crash Drift', '中', '調查中'],
                ['資料欄位缺失', 'Orbit Dice', '低', '已關閉'],
            ],
        },
        emptyTitle: '目前沒有符合條件的風控資料',
        emptyBody: '正式接入後會保留查詢條件，無資料時顯示清除條件與重新查詢入口。',
    },
    ProviderRiskAlerts: {
        sections: [
            { eyebrow: 'ALERT DETAIL', title: '告警詳情', body: '保留告警來源、嚴重度、影響遊戲與相關 Game Round 摘要。', icon: 'pi pi-exclamation-triangle' },
            { eyebrow: 'HANDLING', title: '處理狀態', body: '呈現待處理、調查中、已緩解與已關閉等狀態。', icon: 'pi pi-check-square' },
            { eyebrow: 'RESPONSE', title: '應變操作入口', body: '保留關閉遊戲、標記處理與通知 GGAP 的操作位置。', icon: 'pi pi-bolt' },
        ],
        stats: [
            { label: '開啟告警', value: '12', note: '目前工作佇列' },
            { label: '高嚴重度', value: '2', note: '需要優先處理' },
            { label: '調查中', value: '5', note: '已指派處理人' },
            { label: '已緩解', value: '18', note: '近 7 日展示值' },
        ],
        table: {
            title: '告警處理列表',
            caption: '展示告警狀態與預計處理動作，不執行正式操作。',
            columns: ['告警', '嚴重度', '狀態', '下一步'],
            rows: [
                ['結算失敗率升高', '高', '待處理', '通知 GGAP'],
                ['延遲超過門檻', '中', '調查中', '查看詳情'],
                ['遊戲健康檢查失敗', '中', '已緩解', '保留紀錄'],
            ],
        },
        emptyTitle: '目前沒有待處理告警',
        emptyBody: '正式接入後會保留告警篩選與狀態處理，空資料時不顯示誤導性的操作按鈕。',
    },
    ProviderGgap: {
        sections: [
            { eyebrow: 'CONNECTION', title: '連線狀態', body: '呈現 Provider 與 GGAP 的連線、認證與 Endpoint 健康狀態。', icon: 'pi pi-link' },
            { eyebrow: 'INTEGRATION HEALTH', title: '整體對接健康', body: '保留同步、請求、回呼與錯誤的整體健康摘要。', icon: 'pi pi-heart' },
            { eyebrow: 'EVENT STREAM', title: '對接事件入口', body: '保留前往目錄同步、請求紀錄與錯誤重試頁的工作入口。', icon: 'pi pi-share-alt' },
        ],
        stats: [
            { label: '連線狀態', value: '正常', note: 'Primary endpoint' },
            { label: '目錄同步', value: '99.9%', note: '近 24 小時' },
            { label: '請求成功率', value: '99.8%', note: '啟動／結算' },
            { label: '待處理錯誤', value: '2', note: '重試佇列' },
        ],
        table: {
            title: 'GGAP 對接健康',
            caption: '展示不同對接能力的健康狀態與最後更新時間。',
            columns: ['能力', '狀態', '成功率', '最後更新'],
            rows: [
                ['Game Catalog Sync', '正常', '99.9%', '2 分鐘前'],
                ['Launch / Settle', '正常', '99.8%', '1 分鐘前'],
                ['Callback', '需關注', '98.7%', '5 分鐘前'],
            ],
        },
        emptyTitle: '目前沒有 GGAP 對接資料',
        emptyBody: '正式接入後會依 Endpoint 與時間範圍呈現連線健康與事件狀態。',
    },
    ProviderGgapCatalogSync: {
        sections: [
            { eyebrow: 'SYNC STATUS', title: '同步狀態', body: '呈現遊戲目錄同步成功、失敗與待處理狀態。', icon: 'pi pi-sync' },
            { eyebrow: 'LAST RUN', title: '最後同步時間', body: '保留最近同步時間、批次識別與同步結果摘要。', icon: 'pi pi-clock' },
            { eyebrow: 'CATALOG DELTA', title: '目錄差異', body: '保留新增、更新與需要處理的遊戲目錄差異位置。', icon: 'pi pi-list' },
        ],
        stats: [
            { label: '目錄遊戲數', value: '42', note: 'Provider mock catalog' },
            { label: '最後同步', value: '10:32', note: 'UTC+08:00' },
            { label: '待處理差異', value: '1', note: '需要檢視' },
            { label: '同步錯誤', value: '0', note: '近 24 小時' },
        ],
        table: {
            title: '遊戲目錄同步列表',
            caption: '展示最後同步時間、差異與狀態。',
            columns: ['遊戲', '同步狀態', '最後同步', '差異'],
            rows: [
                ['Neon Heist', '已同步', '10:32', '無'],
                ['Crash Drift', '待確認', '10:31', '版本差異'],
                ['Orbit Dice', '已同步', '10:30', '無'],
            ],
        },
        emptyTitle: '目前沒有同步結果',
        emptyBody: '正式接入後會保留同步條件與批次結果，空資料時提供重置與重新同步的後續位置。',
    },
    ProviderGgapRequests: {
        sections: [
            { eyebrow: 'REQUEST TYPES', title: '啟動、結算與 Callback', body: '以事件類型區分 GGAP 請求與 Provider 回呼紀錄。', icon: 'pi pi-send' },
            { eyebrow: 'TRACE', title: '請求追蹤', body: '保留 Provider Round ID、GGAP Round ID 與請求時間線。', icon: 'pi pi-directions-alt' },
            { eyebrow: 'RESPONSE', title: '回應結果', body: '呈現成功、失敗、逾時與需要重試的事件狀態。', icon: 'pi pi-reply' },
        ],
        stats: [
            { label: 'Launch', value: '18,420', note: '近 24 小時' },
            { label: 'Settle', value: '18,392', note: '近 24 小時' },
            { label: 'Callback 成功率', value: '99.9%', note: '展示平均值' },
            { label: '失敗請求', value: '2', note: '待重試' },
        ],
        table: {
            title: '請求與回呼紀錄',
            caption: '展示請求類型、Round 脈絡與回應結果。',
            columns: ['事件', 'Round ID', '結果', '時間'],
            rows: [
                ['Launch', 'pr_8F31A', '成功', '10:34:21'],
                ['Settle', 'pr_8F319', '成功', '10:34:18'],
                ['Callback', 'pr_8F2E7', '待重試', '10:33:56'],
            ],
        },
        emptyTitle: '目前沒有請求或回呼紀錄',
        emptyBody: '正式接入後會保留事件篩選、Round 追蹤與空資料狀態。',
    },
    ProviderGgapErrors: {
        sections: [
            { eyebrow: 'ERROR QUEUE', title: '錯誤列表', body: '呈現錯誤類型、影響範圍與目前處理狀態。', icon: 'pi pi-times-circle' },
            { eyebrow: 'RETRY', title: '重試狀態', body: '保留重試次數、下一次重試時間與失敗原因。', icon: 'pi pi-refresh' },
            { eyebrow: 'RESEND', title: '補送入口', body: '保留補送事件與結果的工作位置，不執行正式補送。', icon: 'pi pi-upload' },
        ],
        stats: [
            { label: '開啟錯誤', value: '2', note: '目前待處理' },
            { label: '重試佇列', value: '4', note: '等待下一次執行' },
            { label: '補送成功率', value: '98.6%', note: '近 7 日展示值' },
            { label: '永久失敗', value: '1', note: '需人工檢視' },
        ],
        table: {
            title: '錯誤與重試列表',
            caption: '展示錯誤、重試次數與補送狀態。',
            columns: ['錯誤', '事件', '重試次數', '狀態'],
            rows: [
                ['Callback timeout', 'Callback', '2 / 3', '排程中'],
                ['Invalid payload', 'Settle', '0 / 3', '待檢視'],
                ['Endpoint unavailable', 'Launch', '3 / 3', '永久失敗'],
            ],
        },
        emptyTitle: '目前沒有錯誤或重試資料',
        emptyBody: '正式接入後會依錯誤狀態提供查詢、重試與補送結果的空資料狀態。',
    },
    ProviderGgapSettings: {
        sections: [
            { eyebrow: 'API', title: 'API 與 Endpoint', body: '保留 API 版本、Endpoint、連線模式與健康狀態欄位。', icon: 'pi pi-code' },
            { eyebrow: 'CREDENTIALS', title: '憑證狀態', body: '呈現憑證有效期、最後輪替時間與遮罩後的識別資訊。', icon: 'pi pi-key' },
            { eyebrow: 'SECURITY', title: '敏感值遮罩', body: '所有密鑰只呈現遮罩狀態與管理入口，不展示正式秘密。', icon: 'pi pi-lock' },
        ],
        stats: [
            { label: 'API 狀態', value: '正常', note: 'Provider endpoint' },
            { label: 'Endpoint', value: '3', note: 'Production / DEMO / Test' },
            { label: '憑證狀態', value: '有效', note: 'Mock certificate' },
            { label: '最後輪替', value: '21 日前', note: '展示資料' },
        ],
        table: {
            title: '對接設定摘要',
            caption: '展示 API、Endpoint 與憑證遮罩狀態。',
            columns: ['設定項目', '環境', '目前值', '狀態'],
            rows: [
                ['Base Endpoint', 'Production', 'https://api.••••', '已設定'],
                ['API key', 'DEMO', 'sk_••••••••', '已遮罩'],
                ['Callback secret', 'Test', '••••••••', '已遮罩'],
            ],
        },
        emptyTitle: '目前沒有對接設定資料',
        emptyBody: '正式接入後會依使用者權限呈現設定狀態，敏感值維持遮罩且不在原型中保存。',
        apiNote: '待接入 API、Endpoint、憑證輪替與敏感值遮罩的正式設定契約。',
    },
    ProviderNotifications: {
        sections: [
            { eyebrow: 'INBOX', title: '通知列表', body: '集中呈現對接、Game Round、財務、監控與安全通知。', icon: 'pi pi-bell' },
            { eyebrow: 'FILTERS', title: '未讀、類型與嚴重度', body: '保留未讀狀態、通知類型與嚴重度的篩選位置。', icon: 'pi pi-filter' },
            { eyebrow: 'PREFERENCES', title: '通知偏好入口', body: '保留前往通知偏好設定的入口與使用者提示。', icon: 'pi pi-cog' },
        ],
        stats: [
            { label: '未讀通知', value: '4', note: '目前 inbox' },
            { label: '高嚴重度', value: '1', note: '需要優先檢視' },
            { label: '對接通知', value: '3', note: '近 24 小時' },
            { label: '最新通知', value: '15 分鐘前', note: '展示時間' },
        ],
        table: {
            title: '通知列表',
            caption: '展示未讀狀態、類型、嚴重度與通知時間。',
            columns: ['通知', '類型', '嚴重度', '狀態'],
            rows: [
                ['Callback 重試完成', 'GGAP 對接', '低', '未讀'],
                ['結算失敗率升高', '監控告警', '高', '未讀'],
                ['報表匯出已完成', '財務', '資訊', '已讀'],
            ],
        },
        emptyTitle: '目前沒有通知',
        emptyBody: '正式接入後會保留類型與嚴重度篩選，沒有通知時顯示清楚的空 inbox 狀態。',
    },
    ProviderNotificationPreferences: {
        sections: [
            { eyebrow: 'TYPES', title: '通知類型', body: '保留對接、Game Round、財務、監控與安全通知的偏好入口。', icon: 'pi pi-list-check' },
            { eyebrow: 'SEVERITY', title: '嚴重度篩選', body: '呈現不同嚴重度的站內通知接收設定。', icon: 'pi pi-sliders-h' },
            { eyebrow: 'DELIVERY', title: '通知方式', body: '保留站內、Email 與摘要頻率等後續設定位置。', icon: 'pi pi-send' },
        ],
        stats: [
            { label: '已啟用類型', value: '4 / 5', note: 'Provider mock setting' },
            { label: '高嚴重度', value: '全部', note: '強制保留' },
            { label: 'Email', value: '關閉', note: '待確認正式設定' },
            { label: '摘要頻率', value: '每日', note: '展示偏好' },
        ],
        table: {
            title: '通知偏好摘要',
            caption: '展示通知類型、接收方式與目前 mock 狀態。',
            columns: ['通知類型', '站內', 'Email', '摘要'],
            rows: [
                ['GGAP 對接', '開啟', '關閉', '每日'],
                ['Game Round', '開啟', '關閉', '即時'],
                ['財務報表', '開啟', '關閉', '每日'],
                ['監控與風控', '開啟', '關閉', '即時'],
            ],
        },
        emptyTitle: '目前沒有通知偏好資料',
        emptyBody: '正式接入後會依 Provider 使用者與權限呈現偏好設定，未設定時保留初始狀態提示。',
    },
}

const pageTitle = computed(() => {
    const titleKey = String(route.meta.title ?? 'menu.providerPortal')
    return t(titleKey)
})

const blueprint = computed(() => pageBlueprints[String(route.name)] || defaultBlueprint)

const description = computed(() => placeholderMeta.value.description || 'Provider Portal 工作模組骨架已建立，後續將依核准規格接入資料與互動。')

const responsibility = computed(() => placeholderMeta.value.responsibility || `本頁先負責「${pageTitle.value}」的 Provider 工作入口與展示邊界，不承擔平台錢包、代理商、商戶、會員或平台結算管理。`)

const apiNote = computed(() => blueprint.value.apiNote || placeholderMeta.value.apiNote || '待確認正式 API、資料契約、權限、錯誤處理與資料空狀態後接入。')

const foundationCards = [
    {
        eyebrow: 'OWNERSHIP',
        title: 'Provider-owned',
        body: '只呈現遊戲商自己需要管理的遊戲、數據、財務、監控與內容工作。',
        icon: 'pi pi-building',
    },
    {
        eyebrow: 'NEXT CONTRACT',
        title: '等待正式契約',
        body: 'API、權限、狀態碼、點數精度與 USDT 換算規則確認後再接入真實資料。',
        icon: 'pi pi-file-edit',
    },
    {
        eyebrow: 'BOUNDARY',
        title: 'GGAP 分工清楚',
        body: '代理商開關、平台錢包、會員與 GGAP 平台結算留在 GGAP 責任範圍。',
        icon: 'pi pi-link',
    },
]
</script>

<template>
    <div :class="['provider-placeholder-page', 'page-stack', { 'provider-placeholder-page--wide': route.name === 'GameEnvironments' || route.name === 'ProviderMonitoring', 'provider-placeholder-page--environment': route.name === 'GameEnvironments' }]">
        <section v-if="!hidePlaceholderIntro" class="provider-placeholder-hero" aria-labelledby="provider-placeholder-title">
            <div class="provider-placeholder-grid" aria-hidden="true" />
            <div class="provider-placeholder-hero-content">
                <div class="provider-placeholder-kicker">
                    <span class="provider-placeholder-mark"><i class="pi pi-bolt" /></span>
                    <span>PROVIDER PORTAL / PROTOTYPE</span>
                </div>
                <h1 id="provider-placeholder-title">{{ pageTitle }}</h1>
                <p>{{ description }}</p>
            </div>
            <div class="provider-placeholder-status">
                <span class="provider-placeholder-status-dot" />
                <span>Prototype / Mock data</span>
            </div>
        </section>

        <section v-if="!hidePlaceholderIntro" class="provider-placeholder-context" aria-label="頁面資訊">
            <article>
                <span>功能說明</span>
                <p>{{ description }}</p>
            </article>
            <article>
                <span>頁面責任範圍</span>
                <p>{{ responsibility }}</p>
            </article>
        </section>

        <section v-if="!hidePlaceholderIntro" class="provider-placeholder-blueprint" aria-labelledby="provider-placeholder-blueprint-title">
            <div class="provider-placeholder-section-heading">
                <div>
                    <span class="provider-placeholder-next-label">PRIMARY CONTENT</span>
                    <h2 id="provider-placeholder-blueprint-title">主要內容區塊</h2>
                </div>
                <span class="provider-placeholder-section-tag">MOCK VIEW</span>
            </div>
            <div class="provider-placeholder-blueprint-grid">
                <article v-for="(section, index) in blueprint.sections" :key="section.title" class="provider-placeholder-blueprint-card">
                    <span class="provider-placeholder-blueprint-index">0{{ index + 1 }}</span>
                    <i :class="section.icon" class="provider-placeholder-blueprint-icon" />
                    <div>
                        <span class="provider-placeholder-blueprint-eyebrow">{{ section.eyebrow }}</span>
                        <h3>{{ section.title }}</h3>
                        <p>{{ section.body }}</p>
                    </div>
                    <i class="pi pi-arrow-up-right provider-placeholder-blueprint-arrow" />
                </article>
            </div>
        </section>

        <section class="provider-placeholder-mock-board" aria-label="展示資料摘要">
            <article v-for="stat in blueprint.stats" :key="stat.label" class="provider-placeholder-mock-stat">
                <span>{{ stat.label }}</span>
                <strong>{{ stat.value }}</strong>
                <small>{{ stat.note }}</small>
            </article>
        </section>

        <section class="provider-placeholder-data-preview" aria-labelledby="provider-placeholder-data-title">
            <div class="provider-placeholder-section-heading">
                <div>
                    <span class="provider-placeholder-next-label">MOCK DATA PREVIEW</span>
                    <h2 id="provider-placeholder-data-title">{{ blueprint.table.title }}</h2>
                    <p class="provider-placeholder-section-caption">{{ blueprint.table.caption }}</p>
                </div>
                <span class="provider-placeholder-section-tag">展示資料</span>
            </div>
            <div class="provider-placeholder-table-wrap">
                <table class="provider-placeholder-table">
                    <thead>
                        <tr>
                            <th v-for="column in blueprint.table.columns" :key="column">{{ column }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(row, rowIndex) in blueprint.table.rows" :key="`${row.join('-')}-${rowIndex}`">
                            <td v-for="(cell, cellIndex) in row" :key="`${cell}-${cellIndex}`">
                                <strong v-if="cellIndex === 0">{{ cell }}</strong>
                                <span v-else>{{ cell }}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <section class="provider-placeholder-empty" aria-label="空資料狀態">
            <div class="provider-placeholder-empty-icon"><i class="pi pi-inbox" /></div>
            <div>
                <span class="provider-placeholder-next-label">EMPTY DATA STATE</span>
                <h2>{{ blueprint.emptyTitle }}</h2>
                <p>{{ blueprint.emptyBody }}</p>
            </div>
            <span class="provider-placeholder-empty-badge">待接資料</span>
        </section>

        <section class="provider-placeholder-cards" aria-label="Provider Portal foundation">
            <article v-for="card in foundationCards" :key="card.eyebrow" class="provider-placeholder-card">
                <div class="provider-placeholder-card-icon"><i :class="card.icon" /></div>
                <span>{{ card.eyebrow }}</span>
                <h2>{{ card.title }}</h2>
                <p>{{ card.body }}</p>
            </article>
        </section>

        <section class="provider-placeholder-next">
            <div>
                <span class="provider-placeholder-next-label">NEXT API CONTRACT</span>
                <h2>正式 API 與資料契約待接入</h2>
                <p>{{ apiNote }}</p>
            </div>
            <div class="provider-placeholder-next-badge">
                <i class="pi pi-arrow-right" />
                <span>待正式資料</span>
            </div>
        </section>
    </div>
</template>

<style scoped>
.provider-placeholder-page {
    max-width: 1180px;
    margin: 0 auto;
    padding-bottom: 2rem;
}

.provider-placeholder-page--wide {
    max-width: 1500px;
}

.provider-placeholder-hero {
    position: relative;
    min-height: 18rem;
    overflow: hidden;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 2rem;
    padding: 2.5rem;
    color: #f4fbf8;
    border: 1px solid rgba(20, 104, 104, 0.28);
    border-radius: 1.5rem;
    background:
        radial-gradient(circle at 88% 18%, rgba(126, 231, 199, 0.28), transparent 28%),
        linear-gradient(132deg, #0d2731 0%, #104852 54%, #166b69 100%);
    box-shadow: 0 1.5rem 3.5rem rgba(13, 39, 49, 0.18);
}

.provider-placeholder-grid {
    position: absolute;
    inset: 0;
    opacity: 0.22;
    background-image:
        linear-gradient(rgba(220, 255, 243, 0.16) 1px, transparent 1px),
        linear-gradient(90deg, rgba(220, 255, 243, 0.16) 1px, transparent 1px);
    background-size: 2rem 2rem;
    mask-image: linear-gradient(135deg, black 0%, transparent 72%);
}

.provider-placeholder-hero-content,
.provider-placeholder-status {
    position: relative;
    z-index: 1;
}

.provider-placeholder-hero-content {
    max-width: 48rem;
}

.provider-placeholder-kicker,
.provider-placeholder-next-label {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    color: #a9e8d2;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.16em;
}

.provider-placeholder-mark {
    display: inline-grid;
    width: 1.75rem;
    height: 1.75rem;
    place-items: center;
    color: #0d2731;
    border-radius: 0.55rem;
    background: #a9e8d2;
}

.provider-placeholder-hero h1 {
    margin: 1.4rem 0 0.7rem;
    color: #ffffff;
    font-size: clamp(2rem, 4vw, 3.25rem);
    letter-spacing: -0.04em;
}

.provider-placeholder-hero p {
    max-width: 42rem;
    margin: 0;
    color: rgba(244, 251, 248, 0.8);
    font-size: 1rem;
    line-height: 1.75;
}

.provider-placeholder-context {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
    margin-top: 1rem;
}

.provider-placeholder-context article,
.provider-placeholder-blueprint,
.provider-placeholder-empty {
    border: 1px solid var(--hig-border-default);
    border-radius: 1.1rem;
    background: var(--hig-bg-surface);
    box-shadow: var(--hig-shadow-sm);
}

.provider-placeholder-context article {
    min-height: 8.5rem;
    padding: 1.35rem 1.5rem;
}

.provider-placeholder-context span,
.provider-placeholder-blueprint-card h3,
.provider-placeholder-empty h2 {
    color: var(--hig-text-primary);
}

.provider-placeholder-context span {
    color: var(--hig-text-tertiary);
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
}

.provider-placeholder-context p {
    margin: 0.7rem 0 0;
    color: var(--hig-text-secondary);
    line-height: 1.7;
}

.provider-placeholder-blueprint {
    margin-top: 1rem;
    padding: 1.5rem;
}

.provider-placeholder-section-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
}

.provider-placeholder-section-heading h2 {
    margin: 0.35rem 0 0;
    color: var(--hig-text-primary);
    font-size: 1.3rem;
}

.provider-placeholder-section-tag,
.provider-placeholder-empty-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.45rem 0.65rem;
    color: #12675d;
    border: 1px solid #b6dfd0;
    border-radius: 999px;
    background: #effaf5;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.08em;
}

.provider-placeholder-blueprint-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
    margin-top: 1.25rem;
}

.provider-placeholder-blueprint-card {
    position: relative;
    min-height: 8rem;
    padding: 1rem;
    overflow: hidden;
    border: 1px solid var(--hig-border-default);
    border-radius: 0.9rem;
    background: var(--hig-bg-surface-secondary, #f7faf9);
}

.provider-placeholder-blueprint-index {
    display: inline-flex;
    color: #2a9a83;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.12em;
}

.provider-placeholder-blueprint-card h3 {
    margin: 1rem 0 0.35rem;
    font-size: 0.95rem;
}

.provider-placeholder-blueprint-card p {
    max-width: 17rem;
    margin: 0;
    color: var(--hig-text-secondary);
    font-size: 0.8rem;
    line-height: 1.6;
}

.provider-placeholder-blueprint-card > i {
    position: absolute;
    right: 1rem;
    bottom: 1rem;
    color: #78b8a3;
}

.provider-placeholder-blueprint-card > i.provider-placeholder-blueprint-icon {
    position: static;
    display: grid;
    width: 2rem;
    height: 2rem;
    place-items: center;
    margin: 0.7rem 0 0;
    color: #12675d;
    border-radius: 0.6rem;
    background: #e4f6ef;
}

.provider-placeholder-blueprint-eyebrow {
    display: inline-flex;
    margin-top: 0.8rem;
    color: var(--hig-text-tertiary);
    font-size: 0.62rem;
    font-weight: 800;
    letter-spacing: 0.11em;
}

.provider-placeholder-blueprint-card h3 {
    margin-top: 0.35rem;
}

.provider-placeholder-blueprint-card > i.provider-placeholder-blueprint-arrow {
    position: absolute;
    right: 1rem;
    bottom: 1rem;
    display: block;
    width: auto;
    height: auto;
    margin: 0;
    color: #78b8a3;
    background: transparent;
}

.provider-placeholder-mock-board {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
    gap: 0.75rem;
    margin-top: 1rem;
}

.provider-placeholder-mock-stat {
    min-height: 8.5rem;
    padding: 1rem 1.1rem;
    border: 1px solid rgba(42, 154, 131, 0.22);
    border-radius: 1rem;
    background:
        linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(239, 250, 245, 0.92)),
        var(--hig-bg-surface);
    box-shadow: var(--hig-shadow-sm);
}

.provider-placeholder-mock-stat span,
.provider-placeholder-mock-stat small {
    display: block;
}

.provider-placeholder-mock-stat span {
    color: var(--hig-text-tertiary);
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.06em;
}

.provider-placeholder-mock-stat strong {
    display: block;
    margin-top: 0.9rem;
    color: #0d4f50;
    font-size: clamp(1.35rem, 2.4vw, 1.85rem);
    letter-spacing: -0.04em;
}

.provider-placeholder-mock-stat small {
    margin-top: 0.35rem;
    color: var(--hig-text-secondary);
    font-size: 0.75rem;
}

.provider-placeholder-page--environment .provider-placeholder-mock-stat {
    min-height: 12.75rem;
    padding: 1.25rem 1.35rem;
}

.provider-placeholder-page--environment .provider-placeholder-mock-stat strong {
    margin-top: 1.1rem;
    font-size: clamp(2rem, 3.2vw, 2.75rem);
}

.provider-placeholder-data-preview {
    margin-top: 1rem;
    padding: 1.5rem;
    border: 1px solid var(--hig-border-default);
    border-radius: 1.1rem;
    background: var(--hig-bg-surface);
    box-shadow: var(--hig-shadow-sm);
}

.provider-placeholder-section-caption {
    margin: 0.45rem 0 0;
    color: var(--hig-text-secondary);
    font-size: 0.85rem;
    line-height: 1.6;
}

.provider-placeholder-table-wrap {
    margin-top: 1.25rem;
    overflow-x: auto;
    border: 1px solid var(--hig-border-default);
    border-radius: 0.8rem;
}

.provider-placeholder-table {
    width: 100%;
    min-width: 640px;
    border-collapse: collapse;
    font-size: 0.82rem;
}

.provider-placeholder-table th,
.provider-placeholder-table td {
    padding: 0.85rem 1rem;
    text-align: left;
    border-bottom: 1px solid var(--hig-border-default);
    white-space: nowrap;
}

.provider-placeholder-table th {
    color: var(--hig-text-tertiary);
    background: #f6faf8;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.08em;
}

.provider-placeholder-table td {
    color: var(--hig-text-secondary);
}

.provider-placeholder-table tr:last-child td {
    border-bottom: 0;
}

.provider-placeholder-table td strong {
    color: var(--hig-text-primary);
    font-weight: 700;
}

.provider-placeholder-empty {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
    padding: 1.25rem 1.5rem;
    border-style: dashed;
}

.provider-placeholder-empty-icon {
    display: grid;
    width: 2.75rem;
    height: 2.75rem;
    flex-shrink: 0;
    place-items: center;
    color: #12675d;
    border-radius: 0.8rem;
    background: #e4f6ef;
    font-size: 1.15rem;
}

.provider-placeholder-empty h2 {
    margin: 0.35rem 0;
    font-size: 1rem;
}

.provider-placeholder-empty p {
    margin: 0;
    color: var(--hig-text-secondary);
    font-size: 0.85rem;
    line-height: 1.6;
}

.provider-placeholder-empty-badge {
    margin-left: auto;
    flex-shrink: 0;
}

.provider-placeholder-status {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    flex-shrink: 0;
    padding: 0.7rem 0.9rem;
    color: #d9fff1;
    border: 1px solid rgba(169, 232, 210, 0.3);
    border-radius: 999px;
    background: rgba(5, 31, 38, 0.28);
    font-size: 0.8rem;
    font-weight: 700;
}

.provider-placeholder-status-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: #8ff0c8;
    box-shadow: 0 0 0 0.25rem rgba(143, 240, 200, 0.12);
}

.provider-placeholder-cards {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
    margin-top: 1rem;
}

.provider-placeholder-card,
.provider-placeholder-next {
    border: 1px solid var(--hig-border-default);
    border-radius: 1.1rem;
    background: var(--hig-bg-surface);
    box-shadow: var(--hig-shadow-sm);
}

.provider-placeholder-card {
    min-height: 13rem;
    padding: 1.35rem;
}

.provider-placeholder-card-icon {
    display: grid;
    width: 2.5rem;
    height: 2.5rem;
    place-items: center;
    margin-bottom: 1.25rem;
    color: #0d6965;
    border-radius: 0.8rem;
    background: #e4f6ef;
    font-size: 1.1rem;
}

.provider-placeholder-card > span {
    color: var(--hig-text-tertiary);
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.14em;
}

.provider-placeholder-card h2,
.provider-placeholder-next h2 {
    margin: 0.45rem 0 0.55rem;
    color: var(--hig-text-primary);
    font-size: 1.05rem;
}

.provider-placeholder-card p,
.provider-placeholder-next p {
    margin: 0;
    color: var(--hig-text-secondary);
    font-size: 0.875rem;
    line-height: 1.7;
}

.provider-placeholder-next {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    margin-top: 1rem;
    padding: 1.35rem 1.5rem;
    border-left: 0.25rem solid #2a9a83;
}

.provider-placeholder-next-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    flex-shrink: 0;
    color: #12675d;
    font-size: 0.8rem;
    font-weight: 800;
}

@media (max-width: 760px) {
    .provider-placeholder-hero {
        min-height: auto;
        align-items: flex-start;
        flex-direction: column;
        padding: 1.5rem;
    }

    .provider-placeholder-status {
        margin-top: 0.25rem;
    }

    .provider-placeholder-cards {
        grid-template-columns: 1fr;
    }

    .provider-placeholder-context,
    .provider-placeholder-blueprint-grid {
        grid-template-columns: 1fr;
    }

    .provider-placeholder-data-preview,
    .provider-placeholder-blueprint {
        padding: 1rem;
    }

    .provider-placeholder-card {
        min-height: auto;
    }

    .provider-placeholder-next {
        align-items: flex-start;
        flex-direction: column;
    }

    .provider-placeholder-empty {
        align-items: flex-start;
        flex-wrap: wrap;
    }

    .provider-placeholder-empty-badge {
        margin-left: 0;
    }
}
</style>
