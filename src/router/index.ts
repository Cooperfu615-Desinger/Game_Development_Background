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
            // ── 代理 / 商戶管理 ──────────────────────────
            {
                path: 'agents',
                name: 'AgentList',
                component: () => import('@/views/Agents/Index.vue'),
                meta: { title: 'menu.agentList' }
            },
            {
                path: 'agents/settings',
                name: 'AgentSettings',
                component: () => import('@/views/Agents/Settings.vue'),
                meta: { title: 'menu.agentSettings' }
            },
            {
                path: 'merchants',
                name: 'MerchantList',
                component: () => import('@/views/Merchants/Index.vue'),
                meta: { title: 'menu.merchantList' }
            },
            {
                path: 'merchants/settings',
                name: 'MerchantSettings',
                component: () => import('@/views/Merchants/Settings.vue'),
                meta: { title: 'menu.merchantSettings' }
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
                path: 'transactions',
                name: 'TransactionList',
                component: () => import('@/views/Transactions/Index.vue'),
                meta: { title: 'menu.transactionList' }
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
            {
                path: 'orders/:id',
                name: 'OrderDetail',
                component: () => import('@/views/Detail/EntityDetail.vue'),
                meta: { title: 'menu.orders' }
            },
            {
                path: 'transactions/:id',
                name: 'TransactionDetail',
                component: () => import('@/views/Detail/EntityDetail.vue'),
                meta: { title: 'menu.transactionList' }
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

            // ── 風控中心（V3） ────────────────────────────
            {
                path: 'risk',
                name: 'RiskOverview',
                component: () => import('../views/Risk/Overview.vue'),
                meta: { title: 'menu.riskOverview' }
            },
            {
                path: 'risk/alerts',
                name: 'RiskAlerts',
                component: () => import('../views/Risk/Alerts.vue'),
                meta: { title: 'menu.riskAlerts' }
            },
            {
                path: 'risk/rules',
                name: 'RiskRules',
                component: () => import('../views/Risk/Rules.vue'),
                meta: { title: 'menu.riskRules' }
            },
            {
                path: 'risk/rule-builder',
                name: 'RiskRuleBuilder',
                component: () => import('../views/Risk/RuleBuilder.vue'),
                meta: { title: 'menu.riskRuleBuilder' }
            },
            {
                path: 'risk/cases',
                name: 'RiskCases',
                component: () => import('../views/Risk/Cases.vue'),
                meta: { title: 'menu.riskCases' }
            },
            {
                path: 'risk/actions',
                name: 'RiskActions',
                component: () => import('../views/Risk/Actions.vue'),
                meta: { title: 'menu.riskActions' }
            },

            // ── 獎池管理（V4） ─────────────────────────────
            {
                path: 'jackpots',
                name: 'Jackpots',
                component: () => import('../views/Jackpot/Index.vue'),
                meta: { title: 'menu.jackpotList' }
            },
            {
                path: 'jackpots/settings',
                name: 'JackpotSettings',
                component: () => import('../views/Jackpot/Settings.vue'),
                meta: { title: 'menu.jackpotSettings' }
            },
            {
                path: 'jackpots/transactions',
                name: 'JackpotTransactions',
                component: () => import('../views/Jackpot/Transactions.vue'),
                meta: { title: 'menu.jackpotTransactions' }
            },
            {
                path: 'jackpots/payouts',
                name: 'JackpotPayouts',
                component: () => import('../views/Jackpot/Payouts.vue'),
                meta: { title: 'menu.jackpotPayouts' }
            },

            // ── 系統管理（V1 完整版） ────────────────────
            {
                path: 'system/admins',
                name: 'SystemAdmins',
                component: () => import('../views/System/Admins.vue'),
                meta: { title: 'menu.systemAdmins' }
            },
            {
                path: 'system/roles',
                name: 'SystemRoles',
                component: () => import('../views/System/Roles.vue'),
                meta: { title: 'menu.systemRoles' }
            },
            {
                path: 'system/logs',
                name: 'SystemLogs',
                component: () => import('../views/System/Logs.vue'),
                meta: { title: 'menu.systemLogs' }
            },
            {
                path: 'system/approvals',
                name: 'SystemApprovals',
                component: () => import('../views/System/Approvals.vue'),
                meta: { title: 'menu.systemApprovals' }
            },
            {
                path: 'system/currencies',
                name: 'SystemCurrencies',
                component: () => import('../views/System/Currencies.vue'),
                meta: { title: 'menu.systemCurrencies' }
            },
            {
                path: 'system/languages',
                name: 'SystemLanguages',
                component: () => import('../views/System/Languages.vue'),
                meta: { title: 'menu.systemLanguages' }
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
