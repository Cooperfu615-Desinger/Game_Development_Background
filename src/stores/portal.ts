/**
 * usePortalStore — Portal 切換狀態
 *
 * 規格書定義三 Portal：
 *   - supplier：總後台（我們自己）
 *   - agent：代理後台
 *   - merchant：商戶後台
 *
 * 目前實作以「mock 切換」為主，未來透過真實登入身份自動鎖定。
 */
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { PortalType, PortalDefinition } from '@/types/portal'
import { useAuthStore } from '@/stores/auth'
import { usePermissionStore } from '@/stores/permission'
import { PORTAL_IDENTITIES } from '@/services/auth/mockToken'
import router from '@/router'

export const usePortalStore = defineStore(
    'portal',
    () => {
        // ─── 三個 Portal 定義 ──────────────────────────────────
        const portals: PortalDefinition[] = [
            { type: 'supplier', label: '供應商總後台', description: '完整管理權限' },
            { type: 'agent', label: '代理後台', description: '查看代理線下商戶與報表' },
            { type: 'merchant', label: '商戶後台', description: '管理自己的遊戲、注單、結算' },
        ]

        // ─── 當前 Portal ──────────────────────────────────────
        const currentType = ref<PortalType>('supplier')

        const current = computed<PortalDefinition>(() => {
            return portals.find((p) => p.type === currentType.value) ?? portals[0]!
        })

        // ─── Actions ──────────────────────────────────────────
        const switchPortal = (type: PortalType) => {
            currentType.value = type
            // 換發該 portal 內建身份的 mock token
            useAuthStore().applyMockIdentity(type)
            // 設定對應角色（沿用既有 switchRole；roleId 取自內建身份）
            usePermissionStore().switchRole(PORTAL_IDENTITIES[type].role)
            // 導向該 portal 首頁（agent/merchant 前綴路由於 Task 7 掛上）
            const home = type === 'supplier' ? '/dashboard' : `/${type}/dashboard`
            router.push(home).catch(() => {})
        }

        const reset = () => {
            currentType.value = 'supplier'
        }

        return {
            portals,
            currentType,
            current,
            switchPortal,
            reset,
        }
    },
    {
        persist: {
            // 持久化選定 Portal 到 localStorage
            key: 'portal',
            pick: ['currentType'],
        },
    }
)
