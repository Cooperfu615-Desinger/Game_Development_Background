import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { portalRoutes, type PortalRouteDef } from './portalRoutes'
import i18n from '@/i18n'
import { decodeToken } from '@/services/auth/mockToken'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false })

// 共用頁（agent / merchant 前綴可達）— C1 取主要共用頁；C2 再加 Portal 專屬頁
const SHARED_DEFS: PortalRouteDef[] = [
    { path: 'dashboard', name: 'dashboard', component: () => import('@/views/Dashboard/Index.vue'), titleKey: 'menu.dashboard' },
    { path: 'merchants', name: 'merchants', component: () => import('@/views/Merchants/Index.vue'), titleKey: 'menu.merchantList' },
    { path: 'games', name: 'games', component: () => import('@/views/Games/Index.vue'), titleKey: 'menu.games' },
    { path: 'orders', name: 'orders', component: () => import('@/views/Orders/Index.vue'), titleKey: 'menu.orders' },
    { path: 'transactions', name: 'transactions', component: () => import('@/views/Transactions/Index.vue'), titleKey: 'menu.transactionList' },
    { path: 'reports', name: 'reports', component: () => import('@/views/Reports/Overview.vue'), titleKey: 'menu.reportsOverview' },
    { path: 'settlements', name: 'settlements', component: () => import('@/views/Settlements/Index.vue'), titleKey: 'menu.settlementList' },
    { path: 'risk', name: 'risk', component: () => import('@/views/Risk/Overview.vue'), titleKey: 'menu.riskOverview' },
    // ── 以下為 C2 Spec 2（H#3）補的 sub-page，覆蓋 agent/merchant 選單全部共用條目 ──
    { path: 'merchants/settings', name: 'merchants-settings', component: () => import('@/views/Merchants/Settings.vue'), titleKey: 'menu.merchantSettings' },
    { path: 'games/settings', name: 'games-settings', component: () => import('@/views/Games/Settings.vue'), titleKey: 'menu.gameSettings' },
    { path: 'games/math', name: 'games-math', component: () => import('@/views/Games/Math.vue'), titleKey: 'menu.gameMath' },
    { path: 'games/versions', name: 'games-versions', component: () => import('@/views/Games/Versions.vue'), titleKey: 'menu.gameVersions' },
    { path: 'games/assets', name: 'games-assets', component: () => import('@/views/Games/Assets.vue'), titleKey: 'menu.gameAssets' },
    { path: 'games/merchant-access', name: 'games-merchant-access', component: () => import('@/views/Games/MerchantAccess.vue'), titleKey: 'menu.gameMerchantAccess' },
    { path: 'orders/abnormal', name: 'orders-abnormal', component: () => import('@/views/Orders/Abnormal.vue'), titleKey: 'menu.ordersAbnormal' },
    { path: 'transactions/abnormal', name: 'transactions-abnormal', component: () => import('@/views/Transactions/Abnormal.vue'), titleKey: 'menu.transactionsAbnormal' },
    { path: 'reports/merchants', name: 'reports-merchants', component: () => import('@/views/Reports/Merchants.vue'), titleKey: 'menu.reportsMerchants' },
    { path: 'reports/agents', name: 'reports-agents', component: () => import('@/views/Reports/Agents.vue'), titleKey: 'menu.reportsAgents' },
    { path: 'reports/games', name: 'reports-games', component: () => import('@/views/Reports/Games.vue'), titleKey: 'menu.reportsGames' },
    { path: 'reports/rtp', name: 'reports-rtp', component: () => import('@/views/Reports/Rtp.vue'), titleKey: 'menu.reportsRtp' },
    { path: 'risk/alerts', name: 'risk-alerts', component: () => import('@/views/Risk/Alerts.vue'), titleKey: 'menu.riskAlerts' },
    { path: 'risk/rules', name: 'risk-rules', component: () => import('@/views/Risk/Rules.vue'), titleKey: 'menu.riskRules' },
    { path: 'risk/rule-builder', name: 'risk-rule-builder', component: () => import('@/views/Risk/RuleBuilder.vue'), titleKey: 'menu.riskRuleBuilder' },
    { path: 'risk/cases', name: 'risk-cases', component: () => import('@/views/Risk/Cases.vue'), titleKey: 'menu.riskCases' },
    { path: 'risk/actions', name: 'risk-actions', component: () => import('@/views/Risk/Actions.vue'), titleKey: 'menu.riskActions' },
]

// Portal 專屬頁（Spec 1 指向佔位頁；Spec 2 換真實頁）
const AGENT_ONLY_DEFS: PortalRouteDef[] = [
    { path: 'commissions', name: 'commissions', component: () => import('@/views/Agent/Commissions.vue'), titleKey: 'menu.commissions', permission: 'commissions.view' },
    { path: 'sub-accounts', name: 'sub-accounts', component: () => import('@/views/Portal/SubAccounts.vue'), titleKey: 'menu.subAccounts', permission: 'sub-accounts.view' },
]
const MERCHANT_ONLY_DEFS: PortalRouteDef[] = [
    { path: 'profile', name: 'profile', component: () => import('@/views/Merchant/Profile.vue'), titleKey: 'menu.merchantProfile', permission: 'merchant-profile.view' },
    { path: 'api-wallet', name: 'api-wallet', component: () => import('@/views/Merchant/ApiWallet.vue'), titleKey: 'menu.apiWallet', permission: 'api-wallet.view' },
    { path: 'sub-accounts', name: 'sub-accounts', component: () => import('@/views/Portal/SubAccounts.vue'), titleKey: 'menu.subAccounts', permission: 'sub-accounts.view' },
]

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
                component: () => import('../views/Provider/Placeholder.vue'),
                meta: {
                    title: 'menu.providerOverview',
                    providerPlaceholder: {
                        description: 'Provider 遊戲、營運數據、健康狀態與待處理通知的總覽入口。',
                        responsibility: '彙整 Provider 自有遊戲、營運摘要、健康狀態與通知入口，不管理 GGAP 平台資料。',
                    },
                }
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
                meta: { title: 'menu.providerGameList' }
            },
            {
                path: 'games/environments',
                name: 'GameEnvironments',
                component: () => import('../views/Provider/Placeholder.vue'),
                meta: {
                    title: 'menu.providerGameEnvironments',
                    providerPlaceholder: {
                        description: '管理正式、DEMO 與測試環境的版本狀態，以及已部署版本的發布入口。',
                        responsibility: '呈現環境與已部署版本狀態，保留正式與 DEMO 啟用／停用流程入口；不負責建置與部署。',
                    },
                }
            },
            {
                path: 'games/settings',
                name: 'GameSettings',
                component: () => import('../views/Games/Settings.vue'),
                meta: { title: 'menu.providerGameSettings' }
            },
            {
                path: 'games/math',
                name: 'GameMath',
                component: () => import('../views/Games/Math.vue'),
                meta: { title: 'menu.providerGameMath' }
            },
            {
                path: 'games/versions',
                name: 'GameVersions',
                component: () => import('../views/Games/Versions.vue'),
                meta: { title: 'menu.providerGameVersions' }
            },
            {
                path: 'games/assets',
                name: 'GameAssets',
                component: () => import('../views/Games/Assets.vue'),
                meta: { title: 'menu.providerGameAssets' }
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

            // ── 遊戲大廳 ─────────────────────────────────
            {
                path: 'lobby',
                name: 'GameLobbyOverview',
                component: () => import('@/views/GameLobby/Overview.vue'),
                meta: { title: 'menu.lobbyOverview' }
            },
            {
                path: 'lobby/games',
                name: 'GameLobbyGames',
                component: () => import('@/views/GameLobby/Games.vue'),
                meta: { title: 'menu.lobbyGameList' }
            },
            {
                path: 'lobby/management',
                name: 'GameLobbyManagement',
                component: () => import('@/views/GameLobby/Management.vue'),
                meta: { title: 'menu.lobbyGameManagement' }
            },
            {
                path: 'lobby/demo',
                name: 'GameLobbyDemoData',
                component: () => import('@/views/GameLobby/DemoData.vue'),
                meta: { title: 'menu.lobbyDemoData' }
            },
            {
                path: 'lobby/preview',
                name: 'GameLobbyPreview',
                component: () => import('@/views/GameLobby/Preview.vue'),
                meta: { title: 'menu.lobbyPreview' }
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
                component: () => import('../views/Reports/ProviderGameRounds.vue'),
                meta: {
                    title: 'menu.providerGameRounds',
                }
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

            // ── Provider 目標模組骨架 ───────────────────────
            {
                path: 'monitoring',
                name: 'ProviderMonitoring',
                component: () => import('../views/Provider/Placeholder.vue'),
                meta: {
                    title: 'menu.providerMonitoring',
                    providerPlaceholder: {
                        description: '遊戲健康、Game Round 異常、GGAP 請求與 Provider 風控告警。',
                        responsibility: '提供 Provider 遊戲服務與對接健康的監控入口，不取代 GGAP 平台級風控。',
                    },
                }
            },
            {
                path: 'monitoring/risk-reports',
                name: 'ProviderRiskReports',
                component: () => import('../views/Provider/RiskReports.vue'),
                meta: {
                    title: 'menu.providerMonitoringRiskReports',
                }
            },
            {
                path: 'monitoring/alerts',
                name: 'ProviderRiskAlerts',
                component: () => import('../views/Provider/RiskAlerts.vue'),
                meta: {
                    title: 'menu.providerMonitoringAlerts',
                }
            },
            {
                path: 'ggap',
                name: 'ProviderGgap',
                component: () => import('../views/Provider/Placeholder.vue'),
                meta: {
                    title: 'menu.providerGgap',
                    providerPlaceholder: {
                        description: 'Provider 與 GGAP 之間的連線、目錄同步、請求、回呼與錯誤狀態。',
                        responsibility: '提供 Provider 與 GGAP 對接健康的檢視入口，不管理 GGAP 平台帳務或代理商設定。',
                    },
                }
            },
            {
                path: 'ggap/catalog-sync',
                name: 'ProviderGgapCatalogSync',
                component: () => import('../views/Provider/Placeholder.vue'),
                meta: {
                    title: 'menu.providerGgapCatalogSync',
                    providerPlaceholder: {
                        description: '查看遊戲目錄同步狀態、最後同步時間與待處理的同步結果。',
                        responsibility: '追蹤 Provider 遊戲目錄對 GGAP 的同步狀態與結果。',
                    },
                }
            },
            {
                path: 'ggap/requests',
                name: 'ProviderGgapRequests',
                component: () => import('../views/Provider/Placeholder.vue'),
                meta: {
                    title: 'menu.providerGgapRequests',
                    providerPlaceholder: {
                        description: '追蹤啟動、結算與 Callback 的請求及回呼紀錄。',
                        responsibility: '提供對接請求與回呼事件的查詢入口，保留 Game Round 追蹤脈絡。',
                    },
                }
            },
            {
                path: 'ggap/errors',
                name: 'ProviderGgapErrors',
                component: () => import('../views/Provider/Placeholder.vue'),
                meta: {
                    title: 'menu.providerGgapErrors',
                    providerPlaceholder: {
                        description: '查看 GGAP 對接錯誤、重試次數、補送狀態與待處理事件。',
                        responsibility: '聚合對接錯誤與重試狀態，保留補送與後續處理的工作入口。',
                    },
                }
            },
            {
                path: 'ggap/settings',
                name: 'ProviderGgapSettings',
                component: () => import('../views/Provider/Placeholder.vue'),
                meta: {
                    title: 'menu.providerGgapSettings',
                    providerPlaceholder: {
                        description: '管理 API、Endpoint、憑證與遮罩後的對接設定展示。',
                        responsibility: '呈現 Provider 對接設定與敏感憑證的遮罩狀態，不在原型階段保存正式密鑰。',
                    },
                }
            },
            {
                path: 'notifications',
                name: 'ProviderNotifications',
                component: () => import('../views/Provider/Placeholder.vue'),
                meta: {
                    title: 'menu.providerNotifications',
                    providerPlaceholder: {
                        description: '集中處理 GGAP 對接、Game Round、財務、監控與安全通知。',
                        responsibility: '提供 Provider 內部通知的集中檢視入口，不取代外部郵件或 GGAP 平台通知。',
                    },
                }
            },
            {
                path: 'notifications/preferences',
                name: 'ProviderNotificationPreferences',
                component: () => import('../views/Provider/Placeholder.vue'),
                meta: {
                    title: 'menu.providerNotificationPreferences',
                    providerPlaceholder: {
                        description: '設定通知類型、嚴重度與 Provider 使用者的通知偏好入口。',
                        responsibility: '管理 Provider 使用者對站內通知類型與嚴重度的偏好設定入口。',
                    },
                }
            },
            {
                path: 'website',
                name: 'ProviderWebsite',
                redirect: { name: 'GameWebsiteBanners' },
                meta: { title: 'menu.providerWebsiteOverview' }
            },
            {
                path: 'website/banners',
                name: 'GameWebsiteBanners',
                component: () => import('../views/GameWebsite/Banners.vue'),
                meta: { title: 'menu.websiteBanners' }
            },
            {
                path: 'website/content',
                name: 'GameWebsiteContent',
                component: () => import('../views/GameWebsite/Content.vue'),
                meta: { title: 'menu.websiteContent' }
            },
            {
                path: 'website/releases',
                name: 'GameWebsiteReleases',
                component: () => import('../views/GameWebsite/Releases.vue'),
                meta: { title: 'menu.websiteReleases' }
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
                meta: { title: 'menu.providerAuditLogs' }
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
                path: 'finance',
                name: 'ProviderFinance',
                component: () => import('../views/Finance/Overview.vue'),
                meta: {
                    title: 'menu.providerFinance',
                }
            },
            {
                path: 'finance/agent-games',
                name: 'ProviderFinanceAgentGames',
                component: () => import('../views/Finance/AgentGames.vue'),
                meta: {
                    title: 'menu.providerFinanceAgentGames',
                }
            },
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
                meta: { title: 'menu.providerSettingsOverview' }
            },
            {
                path: 'settings/api-keys',
                name: 'ApiKeys',
                component: () => import('../views/Settings/ApiKeys.vue'),
                meta: { title: 'menu.providerApiKeys' }
            },
            {
                path: 'settings/permissions',
                name: 'Permissions',
                component: () => import('../views/Settings/Permissions.vue'),
                meta: { title: 'menu.providerUsersPermissions' }
            },

            // ── Portal 前綴路由（agent / merchant 共用頁）──────────
            ...portalRoutes('agent', [...SHARED_DEFS, ...AGENT_ONLY_DEFS]),
            ...portalRoutes('merchant', [...SHARED_DEFS, ...MERCHANT_ONLY_DEFS]),
        ]
    },

    // ================== AUTH ROUTES ==================
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Auth/index.vue'),
        meta: { title: 'login.title' }
    },

    // ================== DEV ONLY ==================
    {
        path: '/design-system',
        name: 'DesignSystem',
        component: () => import('../views/DesignSystem.vue'),
        meta: { title: 'Design System' }
    },

    // ================== 公開文件（交接文件檢視，免登入） ==================
    {
        path: '/docs/:slug?',
        name: 'HandoffDocs',
        component: () => import('../views/Docs/Index.vue'),
        meta: { title: 'menu.handoffDocs' }
    },

    // ================== FORBIDDEN ==================
    {
        path: '/403',
        name: 'Forbidden',
        component: () => import('../views/Error/403.vue'),
        meta: { title: 'common.403' }
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
    const isPublicDocs = to.path.startsWith('/docs')

    if (isLoginPath && isAuthenticated) {
        return next('/dashboard')
    }

    if (isLoginPath || isPublicDocs || to.name === 'NotFound') {
        return next()
    }

    if (!isAuthenticated) {
        return next(`/login?redirect=${to.fullPath}`)
    }

    // Portal deep-link 同步（不導頁，避免打斷當前導航）
    const portalMeta = to.meta.portal as 'supplier' | 'agent' | 'merchant' | undefined
    if (portalMeta) {
        const [{ usePortalStore }, { useAuthStore }] = await Promise.all([
            import('../stores/portal'),
            import('../stores/auth'),
        ])
        const portalStore = usePortalStore()
        const tokenPortal = decodeToken(useAuthStore().token)?.portal
        // 不只看 currentType：deep-link / 冷重載時 currentType 可能已是目標 portal
        // （持久化於 localStorage），但 token 仍是前一身份（sessionStorage），兩者可
        // desync。此時列表 onMounted 會帶舊 token fetch → 短暫 over-scope（QA M-2）。
        // 只要 token 的 portal claim 與目標不符就在 next() 前同步重簽，確保 fetch 對齊。
        if (portalStore.currentType !== portalMeta || tokenPortal !== portalMeta) {
            portalStore.syncPortal(portalMeta)
        }
    }

    // 權限守衛機制（C1 共用頁未設 meta.permission，僅建立機制 + /403 目標）
    const need = to.meta.permission as string | undefined
    if (need) {
        const { usePermissionStore } = await import('../stores/permission')
        if (!usePermissionStore().hasPermission(need)) {
            return next('/403')
        }
    }

    next()
})

router.afterEach((to) => {
    NProgress.done()
    // meta.title 是 i18n key（如 menu.dashboard）；直接塞分頁標題會露出原始
    // key（QA L-1）。改用 i18n 翻譯，key 不存在時 vue-i18n 會回傳原字串。
    const titleKey = to.meta.title ? String(to.meta.title) : ''
    const translated = titleKey ? i18n.global.t(titleKey) : ''
    document.title = translated ? `${translated} - Game Dev Dashboard` : 'Game Dev Dashboard'
})

export default router
