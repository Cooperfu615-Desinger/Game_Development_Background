import { h } from 'vue'
import type { Component } from 'vue'
import { RouterLink } from 'vue-router'
import type { MenuOption } from 'naive-ui'
import { NIcon } from 'naive-ui'
import {
    DashboardOutlined,
    HubOutlined,
    SportsEsportsOutlined,
    GroupsOutlined,
    PeopleAltOutlined,
    AccountBalanceWalletOutlined,
    CompareArrowsOutlined,
    SwapHorizOutlined,
    SettingsOutlined,
    VpnKeyOutlined,
    AdminPanelSettingsOutlined
} from '@vicons/material'

const renderIcon = (icon: Component) => () => h(NIcon, null, { default: () => h(icon) })

export const menuOptions = (t: (key: string) => string): MenuOption[] => [
    // ── 概覽 ──────────────────────────────────────────
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

    // ── 聚合商 ────────────────────────────────────────
    {
        type: 'group',
        label: t('menu.aggregatorGroup'),
        key: 'aggregator-group',
        children: [
            {
                label: () => h(RouterLink, { to: '/aggregators' }, { default: () => t('menu.aggregators') }),
                key: 'Aggregators',
                icon: renderIcon(HubOutlined)
            }
        ]
    },

    // ── 遊戲管理 ──────────────────────────────────────
    {
        type: 'group',
        label: t('menu.gameManagement'),
        key: 'games-group',
        children: [
            {
                label: () => h(RouterLink, { to: '/games' }, { default: () => t('menu.games') }),
                key: 'Games',
                icon: renderIcon(SportsEsportsOutlined)
            }
        ]
    },

    // ── 玩家 & 代理 ───────────────────────────────────
    {
        type: 'group',
        label: t('menu.playerAndAgent'),
        key: 'player-agent-group',
        children: [
            {
                label: () => h(RouterLink, { to: '/platforms' }, { default: () => t('menu.platforms') }),
                key: 'Platforms',
                icon: renderIcon(GroupsOutlined)
            },
            {
                label: () => h(RouterLink, { to: '/players' }, { default: () => t('menu.players') }),
                key: 'Players',
                icon: renderIcon(PeopleAltOutlined)
            }
        ]
    },

    // ── 財務 ──────────────────────────────────────────
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
                label: () => h(RouterLink, { to: '/finance/reconciliation' }, { default: () => t('menu.reconciliation') }),
                key: 'Reconciliation',
                icon: renderIcon(CompareArrowsOutlined)
            },
            {
                label: () => h(RouterLink, { to: '/finance/transactions' }, { default: () => t('menu.transactions') }),
                key: 'Transactions',
                icon: renderIcon(SwapHorizOutlined)
            }
        ]
    },

    // ── 系統管理 ──────────────────────────────────────
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
