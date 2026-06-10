// src/mocks/scope.ts
// MSW handler 端 scope 過濾 — 模擬後端依 auth token 的 dataScope 過濾資料。
import { decodeToken } from '@/services/auth/mockToken'

interface ScopeKeys {
    agentKey?: string     // own-agent-line 比對欄位（如 'agent'）
    merchantKey?: string  // own-merchant 比對欄位（如 'merchant'）
}

export function scopeRows<T extends Record<string, unknown>>(
    request: Request,
    rows: T[],
    keys: ScopeKeys,
): T[] {
    const auth = request.headers.get('Authorization')
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
    const payload = decodeToken(token)
    if (!payload || payload.dataScope === 'all') return rows
    if (payload.dataScope === 'none') return []

    if (payload.dataScope === 'own-agent-line') {
        if (!keys.agentKey) {
            console.warn('[scope] own-agent-line 但 handler 未提供 agentKey，pass-through')
            return rows
        }
        return rows.filter((r) => String(r[keys.agentKey!]) === payload.actorName)
    }
    if (payload.dataScope === 'own-merchant') {
        return rows.filter((r) => {
            const byName = keys.merchantKey && String(r[keys.merchantKey]) === payload.actorName
            const byCode = 'code' in r && String((r as Record<string, unknown>).code) === payload.actorId
            return byName || byCode
        })
    }
    return rows
}
