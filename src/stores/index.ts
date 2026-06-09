/**
 * Stores barrel — 統一匯出所有 Pinia store
 *
 * 使用方式：
 *   import { useAuthStore, usePortalStore, usePermissionStore, useUiStore } from '@/stores'
 */
export { useAuthStore, type UserInfo } from './auth'
export { usePortalStore } from './portal'
export { usePermissionStore } from './permission'
export { useUiStore } from './ui'

// Type re-exports for convenience
export type {
    PortalType,
    PortalDefinition,
    DataScope,
    PermissionKey,
    Role,
    UiPreferences,
} from '@/types/portal'
