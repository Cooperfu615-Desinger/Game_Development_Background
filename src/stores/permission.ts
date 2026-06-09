/**
 * usePermissionStore — RBAC + ABAC 權限控管
 *
 * - RBAC：透過 `hasPermission('merchants.create')` 判斷功能權限
 * - ABAC：透過 `dataScope` 限制資料可見範圍
 * - 欄位權限：透過 `canSeeField(...)` 控制（V4 才會大量使用）
 *
 * 目前角色為 mock，登入後由後端決定（Phase 6+）。
 */
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { DataScope, PermissionKey, Role } from '@/types/portal'

// ─── 預設角色定義（mock） ─────────────────────────────────────────
const MOCK_ROLES: Role[] = [
    {
        id: 'role-super-admin',
        name: 'super-admin',
        label: '總管理員',
        description: '完整權限，包含系統設定與審核',
        permissions: ['*'], // 通配符：所有權限
        dataScope: 'all',
    },
    {
        id: 'role-operations',
        name: 'operations',
        label: '營運人員',
        description: '管理商戶 / 代理 / 遊戲 / 注單',
        permissions: [
            'dashboard.view',
            'merchants.view', 'merchants.create', 'merchants.edit',
            'agents.view', 'agents.edit',
            'games.view', 'games.edit',
            'orders.view',
            'transactions.view',
            'reports.view', 'reports.export',
        ],
        dataScope: 'all',
    },
    {
        id: 'role-finance',
        name: 'finance',
        label: '財務人員',
        description: '結算 / 報表 / 對帳',
        permissions: [
            'dashboard.view',
            'reports.view', 'reports.export',
            'settlements.view', 'settlements.create', 'settlements.lock',
            'reconciliation.view',
            'transactions.view',
        ],
        dataScope: 'all',
    },
    {
        id: 'role-risk',
        name: 'risk',
        label: '風控人員',
        description: '風控告警 / 案件 / 處理紀錄',
        permissions: [
            'dashboard.view',
            'risk.view', 'risk.handle',
            'orders.view', 'orders.mark-abnormal',
            'transactions.view',
        ],
        dataScope: 'all',
    },
    {
        id: 'role-agent-user',
        name: 'agent-user',
        label: '代理使用者',
        description: 'Agent Portal 角色',
        permissions: [
            'dashboard.view',
            'merchants.view',
            'reports.view',
            'commissions.view',
        ],
        dataScope: 'own-agent-line',
    },
    {
        id: 'role-merchant-user',
        name: 'merchant-user',
        label: '商戶使用者',
        description: 'Merchant Portal 角色',
        permissions: [
            'dashboard.view',
            'orders.view',
            'transactions.view',
            'reports.view',
            'settlements.view',
        ],
        dataScope: 'own-merchant',
    },
]

export const usePermissionStore = defineStore(
    'permission',
    () => {
        // ─── 可選角色清單 ──────────────────────────────────────
        const availableRoles = ref<Role[]>(MOCK_ROLES)

        // ─── 當前角色 ─────────────────────────────────────────
        const currentRoleId = ref<string>('role-super-admin')

        const currentRole = computed<Role>(() => {
            return (
                availableRoles.value.find((r) => r.id === currentRoleId.value) ??
                availableRoles.value[0]!
            )
        })

        const permissions = computed<PermissionKey[]>(() => currentRole.value.permissions)
        const dataScope = computed<DataScope>(() => currentRole.value.dataScope)

        // ─── 權限判斷 ─────────────────────────────────────────
        /**
         * 是否擁有某 permission key
         * 支援通配符 '*'（總管理員）
         */
        const hasPermission = (key: PermissionKey): boolean => {
            if (permissions.value.includes('*')) return true
            return permissions.value.includes(key)
        }

        /**
         * 任一 permission 命中即為 true
         */
        const hasAnyPermission = (keys: PermissionKey[]): boolean => {
            return keys.some(hasPermission)
        }

        /**
         * 全部 permission 都要命中
         */
        const hasAllPermissions = (keys: PermissionKey[]): boolean => {
            return keys.every(hasPermission)
        }

        /**
         * 欄位權限 — Phase 4+ 才會大量使用，目前先 stub
         * @param _module 模組名（merchants / agents / games...）
         * @param _field 欄位名（apiKey / webhookUrl ...）
         */
        const canSeeField = (_module: string, _field: string): boolean => {
            // 簡單規則：總管理員看全部，其他角色看一般欄位
            return permissions.value.includes('*') || true
        }

        // ─── Actions ──────────────────────────────────────────
        const switchRole = (roleId: string) => {
            const role = availableRoles.value.find((r) => r.id === roleId)
            if (role) currentRoleId.value = roleId
        }

        const reset = () => {
            currentRoleId.value = 'role-super-admin'
        }

        return {
            availableRoles,
            currentRoleId,
            currentRole,
            permissions,
            dataScope,
            hasPermission,
            hasAnyPermission,
            hasAllPermissions,
            canSeeField,
            switchRole,
            reset,
        }
    },
    {
        persist: {
            key: 'permission',
            pick: ['currentRoleId'],
        },
    }
)
