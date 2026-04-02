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
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: () => import('../views/Dashboard/Index.vue'),
                meta: { title: 'menu.dashboard' }
            },
            // Games
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
            // Players
            {
                path: 'players',
                name: 'Players',
                component: () => import('../views/Players/Index.vue'),
                meta: { title: 'menu.players' }
            },
            // Finance
            {
                path: 'finance/settlements',
                name: 'Settlements',
                component: () => import('../views/Finance/Settlements.vue'),
                meta: { title: 'menu.settlements' }
            },
            {
                path: 'finance/transactions',
                name: 'Transactions',
                component: () => import('../views/Finance/Transactions.vue'),
                meta: { title: 'menu.transactions' }
            },
            {
                path: 'finance/invoices',
                name: 'Invoices',
                component: () => import('../views/Finance/Invoices.vue'),
                meta: { title: 'menu.invoices' }
            },
            // Settings
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
