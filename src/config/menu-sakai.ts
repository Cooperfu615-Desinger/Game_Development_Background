/**
 * Provider Portal 的 Sakai 導覽資料。
 *
 * 舊版原型仍保留 supplier / agent / merchant 三 Portal 的 route 與 view，
 * 但新版主要工作區只呈現 Provider 的九個工作群組。未列在此處的 legacy
 * route 仍可作為相容與遷移參考，不應再從主要導覽新增入口。
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

/**
 * Provider Portal 目標導覽。
 *
 * 各工作群組先提供清楚的入口；官網相關能力再依「遊戲官網／遊戲大廳」
 * 分層，尚未完成的模組由 route 顯示 ProviderPlaceholder，避免把舊平台
 * 語意誤當成新版產品能力。
 */
export function buildProviderMenu(t: Composer['t']): MenuGroup[] {
    return [
        {
            key: 'providerOverview',
            label: t('menu.providerOverview'),
            items: [
                { label: t('menu.dashboard'), icon: 'pi pi-fw pi-home', to: '/dashboard' },
            ],
        },
        {
            key: 'providerGames',
            label: t('menu.providerGames'),
            items: [
                { label: t('menu.providerGameList'), icon: 'pi pi-fw pi-th-large', to: '/games' },
                { label: t('menu.providerGameVersions'), icon: 'pi pi-fw pi-code', to: '/games/versions' },
                { label: t('menu.providerGameSettings'), icon: 'pi pi-fw pi-sliders-h', to: '/games/settings' },
                { label: t('menu.providerGameMath'), icon: 'pi pi-fw pi-calculator', to: '/games/math' },
                { label: t('menu.providerGameAssets'), icon: 'pi pi-fw pi-images', to: '/games/assets' },
                { label: t('menu.providerGameEnvironments'), icon: 'pi pi-fw pi-cloud', to: '/games/environments' },
            ],
        },
        {
            key: 'providerReports',
            label: t('menu.providerReports'),
            items: [
                { label: t('menu.providerGameRounds'), icon: 'pi pi-fw pi-list', to: '/reports' },
            ],
        },
        {
            key: 'providerFinance',
            label: t('menu.providerFinance'),
            items: [
                { label: t('menu.providerFinanceOverview'), icon: 'pi pi-fw pi-chart-line', to: '/finance' },
                { label: t('menu.providerFinanceAgentGames'), icon: 'pi pi-fw pi-sitemap', to: '/finance/agent-games' },
            ],
        },
        {
            key: 'providerMonitoring',
            label: t('menu.providerMonitoring'),
            items: [
                { label: t('menu.providerMonitoringOverview'), icon: 'pi pi-fw pi-shield', to: '/monitoring' },
                { label: t('menu.providerMonitoringRiskReports'), icon: 'pi pi-fw pi-chart-line', to: '/monitoring/risk-reports' },
                { label: t('menu.providerMonitoringAlerts'), icon: 'pi pi-fw pi-bell', to: '/monitoring/alerts' },
            ],
        },
        {
            key: 'providerGgap',
            label: t('menu.providerGgap'),
            items: [
                { label: t('menu.providerGgapOverview'), icon: 'pi pi-fw pi-link', to: '/ggap' },
                { label: t('menu.providerGgapCatalogSync'), icon: 'pi pi-fw pi-sync', to: '/ggap/catalog-sync' },
                { label: t('menu.providerGgapRequests'), icon: 'pi pi-fw pi-send', to: '/ggap/requests' },
                { label: t('menu.providerGgapErrors'), icon: 'pi pi-fw pi-exclamation-triangle', to: '/ggap/errors' },
                { label: t('menu.providerGgapSettings'), icon: 'pi pi-fw pi-cog', to: '/ggap/settings' },
            ],
        },
        {
            key: 'providerNotifications',
            label: t('menu.providerNotifications'),
            items: [
                { label: t('menu.providerNotificationsOverview'), icon: 'pi pi-fw pi-bell', to: '/notifications' },
                { label: t('menu.providerNotificationPreferences'), icon: 'pi pi-fw pi-sliders-h', to: '/notifications/preferences' },
            ],
        },
        {
            key: 'providerWebsite',
            label: t('menu.providerWebsite'),
            items: [
                {
                    label: t('menu.providerWebsiteOverview'),
                    icon: 'pi pi-fw pi-globe',
                    to: '/website',
                    items: [
                        { label: t('menu.websiteBanners'), icon: 'pi pi-fw pi-images', to: '/website/banners' },
                        { label: t('menu.websiteContent'), icon: 'pi pi-fw pi-file-edit', to: '/website/content' },
                        { label: t('menu.websiteReleases'), icon: 'pi pi-fw pi-history', to: '/website/releases' },
                    ],
                },
                {
                    label: t('menu.gameLobby'),
                    icon: 'pi pi-fw pi-th-large',
                    to: '/lobby',
                    items: [
                        { label: t('menu.lobbyOverview'), icon: 'pi pi-fw pi-home', to: '/lobby' },
                        { label: t('menu.lobbyGameList'), icon: 'pi pi-fw pi-th-large', to: '/lobby/games' },
                        { label: t('menu.lobbyGameManagement'), icon: 'pi pi-fw pi-sliders-h', to: '/lobby/management' },
                        { label: t('menu.lobbyDemoData'), icon: 'pi pi-fw pi-chart-bar', to: '/lobby/demo' },
                        { label: t('menu.lobbyPreview'), icon: 'pi pi-fw pi-desktop', to: '/lobby/preview' },
                    ],
                },
            ],
        },
        {
            key: 'providerSettings',
            label: t('menu.providerSettings'),
            items: [
                { label: t('menu.providerSettingsOverview'), icon: 'pi pi-fw pi-cog', to: '/settings' },
                { label: t('menu.providerUsersPermissions'), icon: 'pi pi-fw pi-users', to: '/settings/permissions' },
                { label: t('menu.providerApiKeys'), icon: 'pi pi-fw pi-key', to: '/settings/api-keys' },
                { label: t('menu.providerAuditLogs'), icon: 'pi pi-fw pi-history', to: '/system/logs' },
            ],
        },
    ]
}

/**
 * Compatibility alias for layout code and legacy integrations.
 * New code should use buildProviderMenu directly.
 */
export function buildSakaiMenu(t: Composer['t']): MenuGroup[] {
    return buildProviderMenu(t)
}

/**
 * Compatibility wrapper for the previous three-Portal menu API.
 * The main application is now Provider-only; portal-specific legacy routes
 * remain available only for migration and direct-link compatibility.
 */
export function buildMenuForPortal(t: Composer['t'], _portal: PortalType): MenuGroup[] {
    return buildProviderMenu(t)
}
