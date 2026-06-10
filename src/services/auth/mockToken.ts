// src/services/auth/mockToken.ts
// Mock JWT 風格 token：base64url(header).base64url(payload).<固定簽章>
// ⚠️ 明文、不加密、不驗章，僅供 demo / 交接示意。正式 token 由後端發放與驗證。

export type PortalType = 'supplier' | 'agent' | 'merchant'
export type DataScope = 'all' | 'own-agent-line' | 'own-merchant' | 'none'

export interface TokenPayload {
    sub: string
    portal: PortalType
    role: string
    dataScope: DataScope
    actorId: string
    actorName: string
    iat: number
    exp: number
}

const MOCK_SIG = 'mocksig'

function b64urlEncode(obj: unknown): string {
    const json = JSON.stringify(obj)
    // 支援中文：先 encodeURIComponent → unescape → btoa
    return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlDecode<T>(s: string): T | null {
    try {
        const pad = s.replace(/-/g, '+').replace(/_/g, '/')
        const json = decodeURIComponent(escape(atob(pad)))
        return JSON.parse(json) as T
    } catch {
        return null
    }
}

export function encodeToken(payload: TokenPayload): string {
    const header = b64urlEncode({ alg: 'none', typ: 'JWT' })
    const body = b64urlEncode(payload)
    return `${header}.${body}.${MOCK_SIG}`
}

export function decodeToken(token: string | null | undefined): TokenPayload | null {
    if (!token) return null
    const parts = token.split('.')
    if (parts.length !== 3) return null
    return b64urlDecode<TokenPayload>(parts[1]!)
}

// 三個內建身份（切換 portal = 以該身份檢視）
// 固定簽發時間，避免 Date.now() 造成每次 build 結果不同
const ISSUED_AT = 1_780_000_000 // 2026 春，固定值
const ONE_YEAR = 31_536_000

export const PORTAL_IDENTITIES: Record<PortalType, TokenPayload> = {
    supplier: {
        sub: 'user-sup-001', portal: 'supplier', role: 'role-super-admin',
        dataScope: 'all', actorId: 'SUP-001', actorName: '供應商管理員',
        iat: ISSUED_AT, exp: ISSUED_AT + ONE_YEAR,
    },
    agent: {
        sub: 'user-agent-001', portal: 'agent', role: 'role-agent-user',
        dataScope: 'own-agent-line', actorId: 'AG-001', actorName: 'Asia Master',
        iat: ISSUED_AT, exp: ISSUED_AT + ONE_YEAR,
    },
    merchant: {
        sub: 'user-merchant-001', portal: 'merchant', role: 'role-merchant-user',
        dataScope: 'own-merchant', actorId: 'MER-001', actorName: 'Golden Dragon',
        iat: ISSUED_AT, exp: ISSUED_AT + ONE_YEAR,
    },
}

export function tokenForPortal(portal: PortalType): string {
    return encodeToken(PORTAL_IDENTITIES[portal])
}
