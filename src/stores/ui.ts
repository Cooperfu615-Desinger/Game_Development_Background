/**
 * useUiStore — 應用層級 UI 偏好設定
 *
 * 比 useSakaiLayout 更上層：
 *   - useSakaiLayout：layout shell 的 transient 狀態（sidebar 開合、暗色切換）
 *   - useUiStore：跨頁 / 跨會話的「使用者設定」（主題色、密度、語言偏好）
 *
 * Phase 5 清理 Naive UI 後，可考慮把 useSakaiLayout 內的部分狀態合進來。
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UiPreferences } from '@/types/portal'

export const useUiStore = defineStore(
    'ui',
    () => {
        // ─── 主題色 ──────────────────────────────────────────
        // null = 用 PrimeVue 預設 Apple Blue
        const accentColor = ref<UiPreferences['accentColor']>(null)

        // ─── 表格密度 ────────────────────────────────────────
        const tableDensity = ref<UiPreferences['tableDensity']>('comfortable')

        // ─── Sidebar 預設收合 ────────────────────────────────
        // 與 useSakaiLayout.staticMenuInactive 同步（這邊只記偏好）
        const sidebarCollapsedPreference = ref<UiPreferences['sidebarCollapsed']>(false)

        // ─── Actions ─────────────────────────────────────────
        const setAccentColor = (color: string | null) => {
            accentColor.value = color
        }

        const setTableDensity = (density: UiPreferences['tableDensity']) => {
            tableDensity.value = density
        }

        const setSidebarCollapsedPreference = (collapsed: boolean) => {
            sidebarCollapsedPreference.value = collapsed
        }

        const reset = () => {
            accentColor.value = null
            tableDensity.value = 'comfortable'
            sidebarCollapsedPreference.value = false
        }

        return {
            accentColor,
            tableDensity,
            sidebarCollapsedPreference,
            setAccentColor,
            setTableDensity,
            setSidebarCollapsedPreference,
            reset,
        }
    },
    {
        persist: {
            key: 'ui',
            pick: ['accentColor', 'tableDensity', 'sidebarCollapsedPreference'],
        },
    }
)
