/**
 * expandDemoRows — 把少數 mock 樣本擴展成多筆假資料
 * From: reference demo (verbatim, no adaptation needed)
 *
 * 使用範例：
 *   const rows = expandDemoRows([
 *     { id: 'A-001', name: 'foo', amount: 100 },
 *     { id: 'A-002', name: 'bar', amount: 200 },
 *   ])  // → 60 筆，自動產生變化的 id / 數字
 */

type DemoRow = Record<string, unknown>

const identityKeys = [
    'id',
    'code',
    'orderNo',
    'roundNo',
    'transactionNo',
    'caseNo',
    'alertNo',
    'ruleId',
    'logId',
    'approvalId',
    'version',
]

const dateKeys = [
    'createdAt',
    'updatedAt',
    'occurredAt',
    'betAt',
    'time',
    'reviewedAt',
    'submittedAt',
    'payoutAt',
    'period',
]

function cloneRow<T>(row: T): T {
    return JSON.parse(JSON.stringify(row)) as T
}

function pad(index: number, length = 3) {
    return String(index).padStart(length, '0')
}

function suffixIdentity(value: unknown, index: number) {
    const text = String(value ?? 'DEMO')
    if (!text) return `DEMO-${pad(index)}`
    const withoutGeneratedSuffix = text.replace(/-\d{3,4}$/u, '')
    return `${withoutGeneratedSuffix}-${pad(index)}`
}

function shiftDate(value: unknown) {
    return value
}

function adjustNumber(value: unknown, index: number) {
    if (typeof value !== 'number') return value
    if (!Number.isFinite(value) || value === 0) return value
    const factor = 1 + ((index % 9) - 4) * 0.018
    return Number((value * factor).toFixed(Number.isInteger(value) ? 0 : 4))
}

function enhanceRow<T extends DemoRow>(row: T, index: number): T {
    const draft = cloneRow(row) as DemoRow

    for (const key of Object.keys(draft)) {
        if (identityKeys.includes(key)) {
            draft[key] = suffixIdentity(draft[key], index)
            continue
        }
        if (dateKeys.includes(key)) {
            draft[key] = shiftDate(draft[key])
            continue
        }
        if (typeof draft[key] === 'number') {
            draft[key] = adjustNumber(draft[key], index)
        }
    }

    return draft as T
}

// ─── 日期 rebase ────────────────────────────────────────────────
// Seed 的日期是照搬 demo 的固定字串（最早 2026-01-08、最新 2026-05-22）。
// 頁面常用「近 N 天」預設篩選，時間一久 seed 全部過期、列表變空
// （Phase A7 在操作紀錄頁實際發生過）。
// 解法：以 seed 中最新日期為錨點，把所有 YYYY-MM-DD 平移
// (今天 - 錨點) 天 — 最新資料永遠落在「今天」，相對間距與
// 「幾個月前建立」的語意都保留。時間部分（HH:mm）不動。

const ANCHOR_UTC = Date.UTC(2026, 4, 22) // 2026-05-22 — 所有 seed 中最新的日期
const DAY_MS = 86_400_000

const today = new Date()
const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
const deltaDays = Math.max(0, Math.floor((todayUtc - ANCHOR_UTC) / DAY_MS))

const dateStringRe = /\b(20\d{2})-(\d{2})-(\d{2})\b/g

function shiftDateString(value: string): string {
    if (deltaDays === 0) return value
    return value.replace(dateStringRe, (match, y: string, m: string, d: string) => {
        const shifted = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)) + deltaDays * DAY_MS)
        const yy = shifted.getUTCFullYear()
        const mm = String(shifted.getUTCMonth() + 1).padStart(2, '0')
        const dd = String(shifted.getUTCDate()).padStart(2, '0')
        return `${yy}-${mm}-${dd}`
    })
}

function rebaseValue(value: unknown): unknown {
    if (typeof value === 'string') return shiftDateString(value)
    if (Array.isArray(value)) return value.map(rebaseValue)
    if (value && typeof value === 'object') {
        const out: DemoRow = {}
        for (const [key, inner] of Object.entries(value as DemoRow)) out[key] = rebaseValue(inner)
        return out
    }
    return value
}

/**
 * rebaseDemoDates — 把資料內所有日期字串平移到以今天為錨點。
 * 接受任意 JSON 形狀（陣列 / 物件 / 複合 response）。
 * expandDemoRows 會自動套用；不經 expand 的 config 類 seed
 * （幣別 / 語系 / 複合 settings 端點）請在 handler 手動包一層。
 */
export function rebaseDemoDates<T>(value: T): T {
    if (deltaDays === 0) return value
    return rebaseValue(JSON.parse(JSON.stringify(value))) as T
}

export function expandDemoRows<T extends DemoRow>(source: T[], target = 60): T[] {
    if (source.length === 0 || source.length >= target) return rebaseDemoDates(source)

    const rows = source.map((row) => cloneRow(row))
    for (let index = source.length + 1; index <= target; index += 1) {
        rows.push(enhanceRow(source[(index - 1) % source.length]!, index))
    }

    return rebaseDemoDates(rows)
}
