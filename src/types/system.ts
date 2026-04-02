// Permission types
export type Permission =
    | 'dashboard'
    | 'merchant'
    | 'merchant:read'
    | 'merchant:write'
    | 'finance'
    | 'finance:read'
    | 'finance:write'
    | 'reports'
    | 'reports:daily'
    | 'reports:bet'
    | 'system'
    | 'system:job-levels'

// Job Level interface
export interface JobLevel {
    id: number
    name: string
    description: string
    permissions: Permission[]
    member_count?: number  // Computed field: number of staff assigned
    created_at: string
    updated_at: string
}

// Staff interface (updated for RBAC)
export interface Staff {
    id: number
    username: string
    realname: string
    email: string
    status: 'active' | 'disabled'
    job_level_id: number  // Foreign key to JobLevel
    job_level_name?: string  //  Included in API responses for display
    created_at: string
    last_login?: string
}

// Audit Log Types
export type AuditAction = 'login' | 'logout' | 'create' | 'update' | 'delete' | 'other'

export interface AuditLog {
    id: string
    time: string      // ISO Timestamp
    operator: string  // Username
    action: AuditAction
    target: string    // e.g., "Merchant: OP-1001", "System"
    ip: string
    details: Record<string, unknown>
}
