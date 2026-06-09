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
