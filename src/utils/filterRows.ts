/**
 * rowMatches — 列表頁「查詢」篩選的共用判斷（QA M-1）
 *
 * 背景：多個移植自 demo 的列表頁建好了 `filters` 篩選卡，但 DataTable 仍直接
 * 綁原始 `rows`，導致「查詢」不生效。各頁 filters 形狀與欄位對應不同（有複合
 * 值如 `${code} ${name}`、有陣列欄位如 currencies），故不採全自動對應，而是
 * 由各頁提供 keyword 欄位清單與每個 select 的 predicate，這裡統一處理：
 *   - 「全部X」/空值視為未啟用該條件
 *   - keyword 不分大小寫、跨指定欄位 includes
 *   - dateRange 以該列日期字串落在 [起, 訖] 整日範圍內
 *
 * 用法（各頁）：
 *   const filteredRows = computed(() => rows.filter((row) => rowMatches(row, {
 *     keyword: { value: filters.keyword, fields: ['code', 'name'] },
 *     selects: [{ value: filters.status, match: (r) => r.status === filters.status }],
 *     dateRange: { value: filters.createdAt, field: 'createdAt' },
 *   })))
 */

export type RowLike = Record<string, unknown>

export interface RowFilterSpec {
    keyword?: { value: unknown; fields: string[] }
    selects?: Array<{ value: unknown; match: (row: RowLike) => boolean }>
    dateRange?: { value: unknown; field: string }
}

// 篩選卡的「全部X」是各 select 的第一個選項；它與空值都代表「不過濾」
function isInactive(value: unknown): boolean {
    return value === undefined || value === null || value === '' || String(value).startsWith('全部')
}

function parseRowTime(raw: unknown): number {
    const text = String(raw ?? '').trim()
    if (!text) return Number.NaN
    // seed 日期格式為 'YYYY-MM-DD HH:mm'（空白分隔）；轉成可被 Date.parse 接受的形式
    return Date.parse(text.replace(' ', 'T'))
}

export function rowMatches(row: RowLike, spec: RowFilterSpec): boolean {
    if (spec.keyword) {
        const kw = String(spec.keyword.value ?? '').trim().toLowerCase()
        if (kw) {
            const hit = spec.keyword.fields.some((field) =>
                String(row[field] ?? '').toLowerCase().includes(kw)
            )
            if (!hit) return false
        }
    }

    if (spec.selects) {
        for (const select of spec.selects) {
            if (isInactive(select.value)) continue
            if (!select.match(row)) return false
        }
    }

    if (spec.dateRange) {
        const range = spec.dateRange.value as [Date | null, Date | null] | undefined
        if (Array.isArray(range) && (range[0] || range[1])) {
            const time = parseRowTime(row[spec.dateRange.field])
            if (!Number.isNaN(time)) {
                if (range[0]) {
                    const start = new Date(range[0])
                    start.setHours(0, 0, 0, 0)
                    if (time < start.getTime()) return false
                }
                if (range[1]) {
                    const end = new Date(range[1])
                    end.setHours(23, 59, 59, 999)
                    if (time > end.getTime()) return false
                }
            }
        }
    }

    return true
}
