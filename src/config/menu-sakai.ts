/**
 * Sakai 格式的選單資料
 *
 * 把我們既有的 menu.ts（Naive UI VNode 格式）轉成 Sakai 的 plain object 格式：
 *   [{ label: '群組', items: [{ label: '頁面', icon: 'pi pi-xxx', to: '/path' }] }]
 *
 * Phase 5 移除 Naive UI 後，這個檔會取代 menu.ts 成為唯一選單來源。
 */
import type { Composer } from 'vue-i18n'

export interface MenuItem {
    label: string
    icon?: string
    to?: string
    url?: string
    target?: string
    items?: MenuItem[]
    visible?: boolean
}

export interface MenuGroup {
    label: string
    items: MenuItem[]
    separator?: false
}

export function buildSakaiMenu(t: Composer['t']): MenuGroup[] {
    return [
        // ── 概覽 ────────────────────────────────────────────
        {
            label: t('menu.overview'),
            items: [
                { label: t('menu.dashboard'), icon: 'pi pi-fw pi-home', to: '/dashboard' },
            ],
        },

        // ── 聚合商 ──────────────────────────────────────────
        {
            label: t('menu.aggregatorGroup'),
            items: [
                { label: t('menu.aggregators'), icon: 'pi pi-fw pi-share-alt', to: '/aggregators' },
            ],
        },

        // ── 遊戲管理 ────────────────────────────────────────
        {
            label: t('menu.gameManagement'),
            items: [
                { label: t('menu.games'), icon: 'pi pi-fw pi-th-large', to: '/games' },
                { label: t('menu.gameSettings'), icon: 'pi pi-fw pi-cog', to: '/games/settings' },
                { label: t('menu.gameMath'), icon: 'pi pi-fw pi-percentage', to: '/games/math' },
                { label: t('menu.gameVersions'), icon: 'pi pi-fw pi-history', to: '/games/versions' },
                { label: t('menu.gameAssets'), icon: 'pi pi-fw pi-images', to: '/games/assets' },
                { label: t('menu.gameMerchantAccess'), icon: 'pi pi-fw pi-sliders-h', to: '/games/merchant-access' },
            ],
        },

        // ── 玩家 & 代理 ─────────────────────────────────────
        {
            label: t('menu.playerAndAgent'),
            items: [
                { label: t('menu.platforms'), icon: 'pi pi-fw pi-users', to: '/platforms' },
                { label: t('menu.players'), icon: 'pi pi-fw pi-user', to: '/players' },
            ],
        },

        // ── 交易明細 ────────────────────────────────────────
        {
            label: t('menu.orderGroup'),
            items: [
                { label: t('menu.orders'), icon: 'pi pi-fw pi-ticket', to: '/orders' },
                { label: t('menu.ordersAbnormal'), icon: 'pi pi-fw pi-exclamation-triangle', to: '/orders/abnormal' },
                { label: t('menu.transactionsAbnormal'), icon: 'pi pi-fw pi-replay', to: '/transactions/abnormal' },
            ],
        },

        // ── 報表總覽（V3） ──────────────────────────────────
        {
            label: t('menu.reportGroup'),
            items: [
                { label: t('menu.reportsOverview'), icon: 'pi pi-fw pi-chart-pie', to: '/reports' },
                { label: t('menu.reportsMerchants'), icon: 'pi pi-fw pi-building', to: '/reports/merchants' },
                { label: t('menu.reportsAgents'), icon: 'pi pi-fw pi-sitemap', to: '/reports/agents' },
                { label: t('menu.reportsGames'), icon: 'pi pi-fw pi-th-large', to: '/reports/games' },
                { label: t('menu.reportsRtp'), icon: 'pi pi-fw pi-percentage', to: '/reports/rtp' },
                { label: t('menu.settlementList'), icon: 'pi pi-fw pi-file-check', to: '/settlements' },
            ],
        },

        // ── 風控中心（V3） ──────────────────────────────────
        {
            label: t('menu.riskGroup'),
            items: [
                { label: t('menu.riskOverview'), icon: 'pi pi-fw pi-shield', to: '/risk' },
                { label: t('menu.riskAlerts'), icon: 'pi pi-fw pi-bell', to: '/risk/alerts' },
                { label: t('menu.riskRules'), icon: 'pi pi-fw pi-code', to: '/risk/rules' },
                { label: t('menu.riskRuleBuilder'), icon: 'pi pi-fw pi-sliders-v', to: '/risk/rule-builder' },
                { label: t('menu.riskCases'), icon: 'pi pi-fw pi-folder-open', to: '/risk/cases' },
                { label: t('menu.riskActions'), icon: 'pi pi-fw pi-history', to: '/risk/actions' },
            ],
        },

        // ── 財務 ────────────────────────────────────────────
        {
            label: t('menu.finance'),
            items: [
                { label: t('menu.settlements'), icon: 'pi pi-fw pi-wallet', to: '/finance/settlements' },
                { label: t('menu.reconciliation'), icon: 'pi pi-fw pi-sync', to: '/finance/reconciliation' },
                { label: t('menu.transactions'), icon: 'pi pi-fw pi-arrows-h', to: '/finance/transactions' },
            ],
        },

        // ── 系統管理 ────────────────────────────────────────
        {
            label: t('menu.system'),
            items: [
                { label: t('menu.settings'), icon: 'pi pi-fw pi-cog', to: '/settings' },
                { label: t('menu.apiKeys'), icon: 'pi pi-fw pi-key', to: '/settings/api-keys' },
                { label: t('menu.permissions'), icon: 'pi pi-fw pi-shield', to: '/settings/permissions' },
            ],
        },
    ]
}
