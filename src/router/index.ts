import { createRouter, createWebHashHistory } from 'vue-router'
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
                path: 'games/settings',
                name: 'GameSettings',
                component: () => import('../views/Games/Settings.vue'),
                meta: { title: 'menu.gameSettings' }
            },
            {
                path: 'games/math',
                name: 'GameMath',
                component: () => import('../views/Games/Math.vue'),
                meta: { title: 'menu.gameMath' }
            },
            {
                path: 'games/versions',
                name: 'GameVersions',
                component: () => import('../views/Games/Versions.vue'),
                meta: { title: 'menu.gameVersions' }
            },
            {
                path: 'games/assets',
                name: 'GameAssets',
                component: () => import('../views/Games/Assets.vue'),
                meta: { title: 'menu.gameAssets' }
            },
            {
                path: 'games/merchant-access',
                name: 'GameMerchantAccess',
                component: () => import('../views/Games/MerchantAccess.vue'),
                meta: { title: 'menu.gameMerchantAccess' }
            },
            {
                path: 'games/:id',
                name: 'GameDetail',
                component: () => import('../views/Games/Detail.vue'),
                meta: { title: 'menu.gameDetail' }
            },

            // ── 平台分析 ──────────────────────────────────
            {
                path: 'platforms',
                name: 'Platforms',
                component: () => import('../views/Platforms/Index.vue'),
                meta: { title: 'menu.platforms' }
            },
            {
                path: 'platforms/:id',
                name: 'PlatformDetail',
                component: () => import('../views/Platforms/Detail.vue'),
                meta: { title: 'menu.platformDetail' }
            },
            {
                path: 'agents',
                redirect: '/platforms'
            },
            {
                path: 'players',
                name: 'Players',
                component: () => import('../views/Players/Index.vue'),
                meta: { title: 'menu.players' }
            },

            // ── 交易明細 ────────────────────────────────
            {
                path: 'orders',
                name: 'Orders',
                component: () => import('../views/Orders/Index.vue'),
                meta: { title: 'menu.orders' }
            },
            {
                path: 'orders/abnormal',
                name: 'OrdersAbnormal',
                component: () => import('../views/Orders/Abnormal.vue'),
                meta: { title: 'menu.ordersAbnormal' }
            },
            {
                path: 'transactions/abnormal',
                name: 'TransactionsAbnormal',
                component: () => import('../views/Transactions/Abnormal.vue'),
                meta: { title: 'menu.transactionsAbnormal' }
            },

            // ── 報表 ─────────────────────────────────────
            {
                path: 'reports',
                name: 'ReportsOverview',
                component: () => import('../views/Reports/Overview.vue'),
                meta: { title: 'menu.reportsOverview' }
            },
            {
                path: 'reports/merchants',
                name: 'ReportsMerchants',
                component: () => import('../views/Reports/Merchants.vue'),
                meta: { title: 'menu.reportsMerchants' }
            },
            {
                path: 'reports/agents',
                name: 'ReportsAgents',
                component: () => import('../views/Reports/Agents.vue'),
                meta: { title: 'menu.reportsAgents' }
            },
            {
                path: 'reports/games',
                name: 'ReportsGames',
                component: () => import('../views/Reports/Games.vue'),
                meta: { title: 'menu.reportsGames' }
            },
            {
                path: 'reports/rtp',
                name: 'ReportsRtp',
                component: () => import('../views/Reports/Rtp.vue'),
                meta: { title: 'menu.reportsRtp' }
            },

            // ── 結算單（V3） ──────────────────────────────
            {
                path: 'settlements',
                name: 'SettlementsV3',
                component: () => import('../views/Settlements/Index.vue'),
                meta: { title: 'menu.settlementList' }
            },
            {
                path: 'settlements/:id',
                name: 'SettlementDetail',
                component: () => import('../views/Settlements/Detail.vue'),
                meta: { title: 'menu.settlementDetail' }
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
    history: createWebHashHistory(import.meta.env.BASE_URL),
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
