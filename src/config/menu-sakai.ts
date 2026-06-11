/**
 * Sakai 格式的選單資料
 *
 * 把我們既有的 menu.ts（Naive UI VNode 格式）轉成 Sakai 的 plain object 格式：
 *   [{ label: '群組', items: [{ label: '頁面', icon: 'pi pi-xxx', to: '/path' }] }]
 *
 * Phase 5 移除 Naive UI 後，這個檔會取代 menu.ts 成為唯一選單來源。
 */
import type { Composer } from 'vue-i18n'
import type { PortalType } from '@/types/portal'

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
    key?: string
    label: string
    items: MenuItem[]
    separator?: false
}

export function buildSakaiMenu(t: Composer['t']): MenuGroup[] {
    return [
        // ── 概覽 ────────────────────────────────────────────
        {
            key: 'overview',
            label: t('menu.overview'),
            items: [
                { label: t('menu.dashboard'), icon: 'pi pi-fw pi-home', to: '/dashboard' },
            ],
        },

        // ── 代理管理 ────────────────────────────────────────
        {
            key: 'agentGroup',
            label: t('menu.agentGroup'),
            items: [
                { label: t('menu.agentList'), icon: 'pi pi-fw pi-list', to: '/agents' },
                { label: t('menu.agentSettings'), icon: 'pi pi-fw pi-sliders-h', to: '/agents/settings' },
            ],
        },

        // ── 商戶管理 ────────────────────────────────────────
        {
            key: 'merchantGroup',
            label: t('menu.merchantGroup'),
            items: [
                { label: t('menu.merchantList'), icon: 'pi pi-fw pi-list', to: '/merchants' },
                { label: t('menu.merchantSettings'), icon: 'pi pi-fw pi-cog', to: '/merchants/settings' },
            ],
        },

        // ── 遊戲管理 ────────────────────────────────────────
        {
            key: 'gameManagement',
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

        // ── 獎池管理（V4） ──────────────────────────────────
        {
            key: 'jackpotGroup',
            label: t('menu.jackpotGroup'),
            items: [
                { label: t('menu.jackpotList'), icon: 'pi pi-fw pi-star', to: '/jackpots' },
                { label: t('menu.jackpotSettings'), icon: 'pi pi-fw pi-cog', to: '/jackpots/settings' },
                { label: t('menu.jackpotTransactions'), icon: 'pi pi-fw pi-history', to: '/jackpots/transactions' },
                { label: t('menu.jackpotPayouts'), icon: 'pi pi-fw pi-send', to: '/jackpots/payouts' },
            ],
        },

        // ── 交易明細 ────────────────────────────────────────
        {
            key: 'orderGroup',
            label: t('menu.orderGroup'),
            items: [
                { label: t('menu.orders'), icon: 'pi pi-fw pi-ticket', to: '/orders' },
                { label: t('menu.transactionList'), icon: 'pi pi-fw pi-wallet', to: '/transactions' },
                { label: t('menu.ordersAbnormal'), icon: 'pi pi-fw pi-exclamation-triangle', to: '/orders/abnormal' },
                { label: t('menu.transactionsAbnormal'), icon: 'pi pi-fw pi-replay', to: '/transactions/abnormal' },
            ],
        },

        // ── 風控中心（V3） ──────────────────────────────────
        {
            key: 'riskGroup',
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

        // ── 報表總覽（V3） ──────────────────────────────────
        {
            key: 'reportGroup',
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

        // ── 系統管理（V1 完整版） ────────────────────────────
        {
            key: 'system',
            label: t('menu.system'),
            items: [
                { label: t('menu.systemAdmins'), icon: 'pi pi-fw pi-users', to: '/system/admins' },
                { label: t('menu.systemRoles'), icon: 'pi pi-fw pi-lock', to: '/system/roles' },
                { label: t('menu.systemLogs'), icon: 'pi pi-fw pi-history', to: '/system/logs' },
                { label: t('menu.systemApprovals'), icon: 'pi pi-fw pi-check-circle', to: '/system/approvals' },
                { label: t('menu.systemCurrencies'), icon: 'pi pi-fw pi-dollar', to: '/system/currencies' },
                { label: t('menu.systemLanguages'), icon: 'pi pi-fw pi-language', to: '/system/languages' },
                { label: t('menu.settings'), icon: 'pi pi-fw pi-cog', to: '/settings' },
                { label: t('menu.apiKeys'), icon: 'pi pi-fw pi-key', to: '/settings/api-keys' },
            ],
        },

        // ── 以下為規格書有、demo 沒有的補充群組 ──────────────
        // ── 聚合商 ──────────────────────────────────────────
        {
            key: 'aggregatorGroup',
            label: t('menu.aggregatorGroup'),
            items: [
                { label: t('menu.aggregators'), icon: 'pi pi-fw pi-share-alt', to: '/aggregators' },
            ],
        },

        // ── 玩家 & 代理 ─────────────────────────────────────
        {
            key: 'playerAndAgent',
            label: t('menu.playerAndAgent'),
            items: [
                { label: t('menu.platforms'), icon: 'pi pi-fw pi-users', to: '/platforms' },
                { label: t('menu.players'), icon: 'pi pi-fw pi-user', to: '/players' },
            ],
        },

        // ── 財務 ────────────────────────────────────────────
        {
            key: 'finance',
            label: t('menu.finance'),
            items: [
                { label: t('menu.settlements'), icon: 'pi pi-fw pi-wallet', to: '/finance/settlements' },
                { label: t('menu.reconciliation'), icon: 'pi pi-fw pi-sync', to: '/finance/reconciliation' },
                { label: t('menu.transactions'), icon: 'pi pi-fw pi-arrows-h', to: '/finance/transactions' },
            ],
        },
    ]
}

// 各 Portal 可見的共用選單群組（白名單過濾）
const AGENT_ALLOW = ['overview', 'merchantGroup', 'gameManagement', 'orderGroup', 'reportGroup']
const MERCHANT_ALLOW = ['overview', 'merchantGroup', 'gameManagement', 'orderGroup', 'reportGroup', 'riskGroup']

// Portal 專屬條目（連結用前綴路徑，指向 Spec 1 佔位頁 / Spec 2 真實頁）
// 群組 label 用獨立 key（menu.agentSelf / menu.merchantSelf），不重用 menu.agentGroup/merchantGroup，避免與既有群組撞名
function agentPortalGroups(t: Composer['t']): MenuGroup[] {
    return [{
        key: 'agentSelf',
        label: t('menu.agentSelf'),
        items: [
            { label: t('menu.commissions'), icon: 'pi pi-fw pi-percentage', to: '/agent/commissions' },
            { label: t('menu.subAccounts'), icon: 'pi pi-fw pi-users', to: '/agent/sub-accounts' },
        ],
    }]
}

function merchantPortalGroups(t: Composer['t']): MenuGroup[] {
    return [{
        key: 'merchantSelf',
        label: t('menu.merchantSelf'),
        items: [
            { label: t('menu.merchantProfile'), icon: 'pi pi-fw pi-id-card', to: '/merchant/profile' },
            { label: t('menu.apiWallet'), icon: 'pi pi-fw pi-wallet', to: '/merchant/api-wallet' },
            { label: t('menu.subAccounts'), icon: 'pi pi-fw pi-users', to: '/merchant/sub-accounts' },
        ],
    }]
}

// 把共用群組 item 的 to 由 /x 改寫成 /${portal}/x（遞迴）；附加的 self 群組已是前綴路徑、不經此函式
function prefixMenuItem(item: MenuItem, portal: PortalType): MenuItem {
    const next: MenuItem = { ...item }
    // 只動內部路由 to；url-only（外部連結）item 無 to，第一個條件即跳過
    if (item.to && item.to.startsWith('/')) next.to = `/${portal}${item.to}`
    if (item.items) next.items = item.items.map((c) => prefixMenuItem(c, portal))
    return next
}

function prefixGroups(groups: MenuGroup[], portal: PortalType): MenuGroup[] {
    return groups.map((g) => ({ ...g, items: g.items.map((it) => prefixMenuItem(it, portal)) }))
}

export function buildMenuForPortal(t: Composer['t'], portal: PortalType): MenuGroup[] {
    const full = buildSakaiMenu(t)
    if (portal === 'supplier') return full
    const allow = portal === 'agent' ? AGENT_ALLOW : MERCHANT_ALLOW
    const filtered = prefixGroups(full.filter((g) => g.key !== undefined && allow.includes(g.key)), portal)
    const extra = portal === 'agent' ? agentPortalGroups(t) : merchantPortalGroups(t)
    return [...filtered, ...extra]
}
