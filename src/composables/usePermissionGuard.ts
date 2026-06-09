/**
 * usePermissionGuard — 元件層級的權限/資料範圍 helper
 *
 * 提供 reactive 的權限判斷給 template 直接用，例如：
 *   <button v-if="can('merchants.create')">新增商戶</button>
 *   <div v-if="canSee('merchants', 'apiKey')">{{ row.apiKey }}</div>
 *
 * 內部就是包一層 usePermissionStore，但語意更清楚。
 */
import { computed } from 'vue'
import { usePermissionStore } from '@/stores/permission'
import type { PermissionKey } from '@/types/portal'

export function usePermissionGuard() {
    const store = usePermissionStore()

    const can = (key: PermissionKey) => store.hasPermission(key)
    const canAny = (keys: PermissionKey[]) => store.hasAnyPermission(keys)
    const canAll = (keys: PermissionKey[]) => store.hasAllPermissions(keys)
    const canSee = (module: string, field: string) => store.canSeeField(module, field)

    const dataScope = computed(() => store.dataScope)
    const roleLabel = computed(() => store.currentRole.label)

    return {
        can,
        canAny,
        canAll,
        canSee,
        dataScope,
        roleLabel,
    }
}
