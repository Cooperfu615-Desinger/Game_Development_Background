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
 * 每個群組先提供一個可進入的 route；尚未完成的模組由 route 顯示
 * ProviderPlaceholder，避免把舊平台語意誤當成新版產品能力。
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
            key: 'providerGameLobby',
            label: t('menu.gameLobby'),
            items: [
                { label: t('menu.lobbyOverview'), icon: 'pi pi-fw pi-home', to: '/lobby' },
                { label: t('menu.lobbyGameList'), icon: 'pi pi-fw pi-th-large', to: '/lobby/games' },
                { label: t('menu.lobbyGameManagement'), icon: 'pi pi-fw pi-sliders-h', to: '/lobby/management' },
                { label: t('menu.lobbyDemoData'), icon: 'pi pi-fw pi-chart-bar', to: '/lobby/demo' },
                { label: t('menu.lobbyPreview'), icon: 'pi pi-fw pi-desktop', to: '/lobby/preview' },
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
            ],
        },
        {
            key: 'providerMonitoring',
            label: t('menu.providerMonitoring'),
            items: [
                { label: t('menu.providerMonitoringOverview'), icon: 'pi pi-fw pi-shield', to: '/monitoring' },
            ],
        },
        {
            key: 'providerGgap',
            label: t('menu.providerGgap'),
            items: [
                { label: t('menu.providerGgapOverview'), icon: 'pi pi-fw pi-link', to: '/ggap' },
            ],
        },
        {
            key: 'providerNotifications',
            label: t('menu.providerNotifications'),
            items: [
                { label: t('menu.providerNotificationsOverview'), icon: 'pi pi-fw pi-bell', to: '/notifications' },
            ],
        },
        {
            key: 'providerWebsite',
            label: t('menu.providerWebsite'),
            items: [
                { label: t('menu.providerWebsiteOverview'), icon: 'pi pi-fw pi-globe', to: '/website' },
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
