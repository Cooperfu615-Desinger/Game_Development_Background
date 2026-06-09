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
