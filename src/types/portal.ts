/**
 * Portal & 權限相關型別
 *
 * 對應規格書「總後台 / Agent Portal / Merchant Portal」三 Portal 架構。
 * Phase 3 階段全為 mock，Phase 6+ 才接真 API。
 */

// ─── Portal ─────────────────────────────────────────────────────────────────
export type PortalType = 'supplier' | 'agent' | 'merchant'

export interface PortalDefinition {
    type: PortalType
    label: string
    description: string
}

// ─── DataScope (ABAC) ───────────────────────────────────────────────────────
/**
 * dataScope 控制使用者可看到哪些資料。
 *   - all：全部（供應商）
 *   - own-agent-line：自己這條代理線下所有代理 / 商戶（代理）
 *   - own-merchant：只能看自己的商戶（商戶）
 *   - none：除自己外什麼都看不到（極少用，多半開發測試）
 */
export type DataScope = 'all' | 'own-agent-line' | 'own-merchant' | 'none'

// ─── Role / Permission ──────────────────────────────────────────────────────
/**
 * Permission key 採點分隔命名空間：`<module>.<action>`
 *   範例： 'merchants.view' / 'merchants.create' / 'reports.export'
 *
 * RBAC 透過 role 對應一組 permissions；
 * ABAC 透過 dataScope 再做資料層級篩選。
 */
export type PermissionKey = string

export interface Role {
    id: string
    name: string
    label: string
    description?: string
    permissions: PermissionKey[]
    dataScope: DataScope
}

// ─── UI ─────────────────────────────────────────────────────────────────────
/**
 * 應用層級的 UI 設定 — 主題色、密度、語言等，
 * 比 useSakaiLayout 偏「跨頁設定」性質。
 */
export interface UiPreferences {
    /** 主題色 hex；null 用 PrimeVue 預設 */
    accentColor: string | null
    /** 表格密度 */
    tableDensity: 'compact' | 'comfortable' | 'spacious'
    /** 全局 Sidebar 收合（與 Sakai layout 同步） */
    sidebarCollapsed: boolean
}
