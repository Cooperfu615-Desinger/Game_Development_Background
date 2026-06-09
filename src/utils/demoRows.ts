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

export function expandDemoRows<T extends DemoRow>(source: T[], target = 60): T[] {
    if (source.length === 0 || source.length >= target) return source

    const rows = source.map((row) => cloneRow(row))
    for (let index = source.length + 1; index <= target; index += 1) {
        rows.push(enhanceRow(source[(index - 1) % source.length]!, index))
    }

    return rows
}
