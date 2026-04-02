import { h } from 'vue'
import type { Component } from 'vue'
import { RouterLink } from 'vue-router'
import type { MenuOption } from 'naive-ui'
import { NIcon } from 'naive-ui'
import {
    DashboardOutlined,
    SportsEsportsOutlined,
    PeopleAltOutlined,
    AccountBalanceWalletOutlined,
    ReceiptLongOutlined,
    SwapHorizOutlined,
    SettingsOutlined,
    VpnKeyOutlined,
    AdminPanelSettingsOutlined
} from '@vicons/material'

const renderIcon = (icon: Component) => () => h(NIcon, null, { default: () => h(icon) })

export const menuOptions = (t: (key: string) => string): MenuOption[] => [
    {
        type: 'group',
        label: t('menu.overview'),
        key: 'overview-group',
        children: [
            {
                label: () => h(RouterLink, { to: '/dashboard' }, { default: () => t('menu.dashboard') }),
                key: 'Dashboard',
                icon: renderIcon(DashboardOutlined)
            }
        ]
    },
    {
        type: 'group',
        label: t('menu.gameManagement'),
        key: 'games-group',
        children: [
            {
                label: () => h(RouterLink, { to: '/games' }, { default: () => t('menu.games') }),
                key: 'Games',
                icon: renderIcon(SportsEsportsOutlined)
            },
            {
                label: () => h(RouterLink, { to: '/players' }, { default: () => t('menu.players') }),
                key: 'Players',
                icon: renderIcon(PeopleAltOutlined)
            }
        ]
    },
    {
        type: 'group',
        label: t('menu.finance'),
        key: 'finance-group',
        children: [
            {
                label: () => h(RouterLink, { to: '/finance/settlements' }, { default: () => t('menu.settlements') }),
                key: 'Settlements',
                icon: renderIcon(AccountBalanceWalletOutlined)
            },
            {
                label: () => h(RouterLink, { to: '/finance/transactions' }, { default: () => t('menu.transactions') }),
                key: 'Transactions',
                icon: renderIcon(SwapHorizOutlined)
            },
            {
                label: () => h(RouterLink, { to: '/finance/invoices' }, { default: () => t('menu.invoices') }),
                key: 'Invoices',
                icon: renderIcon(ReceiptLongOutlined)
            }
        ]
    },
    {
        type: 'group',
        label: t('menu.system'),
        key: 'system-group',
        children: [
            {
                label: () => h(RouterLink, { to: '/settings' }, { default: () => t('menu.settings') }),
                key: 'Settings',
                icon: renderIcon(SettingsOutlined)
            },
            {
                label: () => h(RouterLink, { to: '/settings/api-keys' }, { default: () => t('menu.apiKeys') }),
                key: 'ApiKeys',
                icon: renderIcon(VpnKeyOutlined)
            },
            {
                label: () => h(RouterLink, { to: '/settings/permissions' }, { default: () => t('menu.permissions') }),
                key: 'Permissions',
                icon: renderIcon(AdminPanelSettingsOutlined)
            }
        ]
    }
]
