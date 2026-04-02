import { h } from 'vue'
import type { Component } from 'vue'
import { RouterLink } from 'vue-router'
import type { MenuOption } from 'naive-ui'
import { NIcon } from 'naive-ui'
import {
    DashboardOutlined,
    BarChartOutlined,
    DescriptionOutlined,
    AttachMoneyOutlined,
    CodeOutlined,
    SportsEsportsOutlined,
    PeopleAltOutlined,
    AccountBalanceWalletOutlined
} from '@vicons/material'

// Icon render helper
const renderIcon = (icon: Component) => () => h(NIcon, null, { default: () => h(icon) })

/**
 * Merchant Backend Menu Configuration
 * Based on DESIGN_SPEC.md Section 3: Merchant Backend (商戶後台)
 * All labels use i18n t() function for reactive language switching
 */
export const merchantMenuOptions = (t: (key: string) => string): MenuOption[] => [
    {
        type: 'group',
        label: t('menu.overview'),
        key: 'overview-group',
        children: [
            {
                label: () => h(RouterLink, { to: '/merchant/dashboard' }, { default: () => t('menu.merchantDashboard') }),
                key: 'merchant-dashboard',
                icon: renderIcon(DashboardOutlined)
            }
        ]
    },
    {
        type: 'group',
        label: t('menu.gameManagement'),
        key: 'game-group',
        children: [
            {
                label: () => h(RouterLink, { to: '/merchant/games' }, { default: () => t('menu.myGames') }),
                key: 'merchant-games',
                icon: renderIcon(SportsEsportsOutlined)
            }
        ]
    },
    {
        type: 'group',
        label: t('menu.reportCenter'),
        key: 'report-group',
        children: [
            {
                label: () => h(RouterLink, { to: '/merchant/reports/daily' }, { default: () => t('menu.dailyRevenue') }),
                key: 'DailyReport',
                icon: renderIcon(BarChartOutlined)
            },
            {
                label: () => h(RouterLink, { to: '/merchant/reports/bet-query' }, { default: () => t('menu.betQuery') }),
                key: 'merchant-bet-query',
                icon: renderIcon(DescriptionOutlined)
            }
        ]
    },
    {
        type: 'group',
        label: t('menu.financeCenter'),
        key: 'finance-group',
        children: [
            {
                label: () => h(RouterLink, { to: '/merchant/finance/invoices' }, { default: () => t('menu.myInvoices') }),
                key: 'merchant-invoices',
                icon: renderIcon(AttachMoneyOutlined)
            },
            {
                label: () => h(RouterLink, { to: '/merchant/finance/funds' }, { default: () => t('merchant.fundRecord.title') }),
                key: 'merchant-funds',
                icon: renderIcon(AccountBalanceWalletOutlined)
            }
        ]
    },
    {
        type: 'group',
        label: t('menu.orgManagement'),
        key: 'org-group',
        children: [
            {
                label: () => h(RouterLink, { to: '/merchant/organization/sub-list' }, { default: () => t('menu.subAgent') }),
                key: 'sub-agent-list',
                icon: renderIcon(PeopleAltOutlined)
            }
        ]
    },
    {
        type: 'group',
        label: t('menu.developer'),
        key: 'developer-group',
        children: [
            {
                label: () => h(RouterLink, { to: '/merchant/developer' }, { default: () => t('menu.integrationInfo') }),
                key: 'DeveloperCenter',
                icon: renderIcon(CodeOutlined)
            }
        ]
    }
]
