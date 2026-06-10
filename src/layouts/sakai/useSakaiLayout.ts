/**
 * Sakai Layout composable — Apple HIG flavor
 *
 * 從 Sakai 5 的 layout.js 移植，加上：
 *   - TypeScript 型別
 *   - 預設深色模式（與既有頁面視覺一致）
 *   - LocalStorage 持久化 darkTheme / staticMenuInactive
 *
 * 注意：此 composable 用 module-level 共享 state，
 *      Phase 3 之後可考慮搬到 Pinia store。
 */
import { computed, reactive, watch } from 'vue'

interface LayoutConfig {
    darkTheme: boolean
    menuMode: 'static' | 'overlay'
}

interface LayoutState {
    staticMenuInactive: boolean
    overlayMenuActive: boolean
    mobileMenuActive: boolean
    profileSidebarVisible: boolean
    sidebarExpanded: boolean
    menuHoverActive: boolean
    activeMenuItem: string | null
    activePath: string | null
}

const STORAGE_KEY = 'sakai-layout'

interface PersistedState {
    darkTheme?: boolean
    staticMenuInactive?: boolean
}

const readPersisted = (): PersistedState => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        return raw ? (JSON.parse(raw) as PersistedState) : {}
    } catch {
        return {}
    }
}

const persisted = readPersisted()

// ─── State — module-level shared ───────────────────────────────────────────
const layoutConfig = reactive<LayoutConfig>({
    darkTheme: persisted.darkTheme ?? false,  // 預設亮色（對齊參考 demo；demo-pages.css 為亮色設計）
    menuMode: 'static',
})

const layoutState = reactive<LayoutState>({
    staticMenuInactive: persisted.staticMenuInactive ?? false,
    overlayMenuActive: false,
    mobileMenuActive: false,
    profileSidebarVisible: false,
    sidebarExpanded: false,
    menuHoverActive: false,
    activeMenuItem: null,
    activePath: null,
})

// 初次套用 dark class
if (typeof window !== 'undefined') {
    if (layoutConfig.darkTheme) document.documentElement.classList.add('app-dark')
    else document.documentElement.classList.remove('app-dark')
}

// 持久化
watch(
    () => [layoutConfig.darkTheme, layoutState.staticMenuInactive],
    () => {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    darkTheme: layoutConfig.darkTheme,
                    staticMenuInactive: layoutState.staticMenuInactive,
                })
            )
        } catch {
            // ignore
        }
    },
    { deep: true }
)

// ─── Helpers ───────────────────────────────────────────────────────────────
const isDesktop = () => typeof window !== 'undefined' && window.innerWidth > 991

// ─── Public API ────────────────────────────────────────────────────────────
export function useSakaiLayout() {
    const toggleDarkMode = () => {
        layoutConfig.darkTheme = !layoutConfig.darkTheme
        document.documentElement.classList.toggle('app-dark', layoutConfig.darkTheme)
    }

    const toggleMenu = () => {
        if (isDesktop()) {
            if (layoutConfig.menuMode === 'static') {
                layoutState.staticMenuInactive = !layoutState.staticMenuInactive
            } else {
                layoutState.overlayMenuActive = !layoutState.overlayMenuActive
            }
        } else {
            layoutState.mobileMenuActive = !layoutState.mobileMenuActive
        }
    }

    const hideMobileMenu = () => {
        layoutState.mobileMenuActive = false
    }

    const isDarkTheme = computed(() => layoutConfig.darkTheme)
    const hasOpenOverlay = computed(() => layoutState.overlayMenuActive)

    return {
        layoutConfig,
        layoutState,
        isDarkTheme,
        hasOpenOverlay,
        toggleDarkMode,
        toggleMenu,
        hideMobileMenu,
        isDesktop,
    }
}
