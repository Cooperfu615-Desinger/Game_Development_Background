import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false })

const routes: RouteRecordRaw[] = [
    // ================== ROOT REDIRECT ==================
    {
        path: '/',
        redirect: '/dashboard'
    },

    // ================== MAIN APP ROUTES ==================
    {
        path: '/',
        component: () => import('../layouts/MainLayout.vue'),
        meta: { requiresAuth: true },
        children: [
            // ── 儀表板 ──────────────────────────────────
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: () => import('../views/Dashboard/Index.vue'),
                meta: { title: 'menu.dashboard' }
            },

            // ── 聚合商管理 ──────────────────────────────
            {
                path: 'aggregators',
                name: 'Aggregators',
                component: () => import('../views/Aggregators/Index.vue'),
                meta: { title: 'menu.aggregators' }
            },
            {
                path: 'aggregators/:id',
                name: 'AggregatorDetail',
                component: () => import('../views/Aggregators/Detail.vue'),
                meta: { title: 'menu.aggregatorDetail' }
            },

            // ── 遊戲管理 ────────────────────────────────
            {
                path: 'games',
                name: 'Games',
                component: () => import('../views/Games/Index.vue'),
                meta: { title: 'menu.games' }
            },
            {
                path: 'games/:id',
                name: 'GameDetail',
                component: () => import('../views/Games/Detail.vue'),
                meta: { title: 'menu.gameDetail' }
            },

            // ── 玩家 & 代理 ─────────────────────────────
            {
                path: 'agents',
                name: 'Agents',
                component: () => import('../views/Agents/Index.vue'),
                meta: { title: 'menu.agents' }
            },
            {
                path: 'players',
                name: 'Players',
                component: () => import('../views/Players/Index.vue'),
                meta: { title: 'menu.players' }
            },

            // ── 財務 ────────────────────────────────────
            {
                path: 'finance/settlements',
                name: 'Settlements',
                component: () => import('../views/Finance/Settlements.vue'),
                meta: { title: 'menu.settlements' }
            },
            {
                path: 'finance/reconciliation',
                name: 'Reconciliation',
                component: () => import('../views/Finance/Reconciliation.vue'),
                meta: { title: 'menu.reconciliation' }
            },
            {
                path: 'finance/transactions',
                name: 'Transactions',
                component: () => import('../views/Finance/Transactions.vue'),
                meta: { title: 'menu.transactions' }
            },
            // 向下相容舊路由
            {
                path: 'finance/invoices',
                redirect: '/finance/reconciliation'
            },

            // ── 系統設置 ────────────────────────────────
            {
                path: 'settings',
                name: 'Settings',
                component: () => import('../views/Settings/Index.vue'),
                meta: { title: 'menu.settings' }
            },
            {
                path: 'settings/api-keys',
                name: 'ApiKeys',
                component: () => import('../views/Settings/ApiKeys.vue'),
                meta: { title: 'menu.apiKeys' }
            },
            {
                path: 'settings/permissions',
                name: 'Permissions',
                component: () => import('../views/Settings/Permissions.vue'),
                meta: { title: 'menu.permissions' }
            }
        ]
    },

    // ================== AUTH ROUTES ==================
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Auth/index.vue'),
        meta: { title: 'common.login' }
    },

    // ================== DEV ONLY ==================
    {
        path: '/design-system',
        name: 'DesignSystem',
        component: () => import('../views/DesignSystem.vue'),
        meta: { title: 'Design System' }
    },

    // ================== FALLBACK ==================
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('../views/Error/404.vue'),
        meta: { title: 'common.404' }
    }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

router.beforeEach(async (to, _from, next) => {
    NProgress.start()

    const { useAuthStore } = await import('../stores/auth')
    const authStore = useAuthStore()

    const isAuthenticated = authStore.isAuthenticated
    const isLoginPath = to.path === '/login'

    if (isLoginPath && isAuthenticated) {
        return next('/dashboard')
    }

    if (isLoginPath || to.name === 'NotFound') {
        return next()
    }

    if (!isAuthenticated) {
        return next(`/login?redirect=${to.fullPath}`)
    }

    next()
})

router.afterEach((to) => {
    NProgress.done()
    const title = to.meta.title ? `${String(to.meta.title)} - Game Dev Dashboard` : 'Game Dev Dashboard'
    document.title = title
})

export default router
