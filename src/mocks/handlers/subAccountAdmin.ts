import { http, HttpResponse, delay } from 'msw'
import { scopeRows } from '@/mocks/scope'

// ──────────────────────────────────────────────────────────────
// 子帳號（C2 Spec 2）— type + seed
// 固定 9 筆（不 expandDemoRows）：all=9 / own-agent-line(Asia Master)=3 / own-merchant(Golden Dragon)=4
// agent 列只帶 agent、merchant 列只帶 merchant，使 scopeRows 乾淨切分
// ──────────────────────────────────────────────────────────────

type SubAccountRow = {
    id: string
    username: string
    displayName: string
    ownerType: 'agent' | 'merchant' // 保留供未來欄位/篩選用；MVP 頁面不顯示
    agent: string
    merchant: string
    role: string
    status: string
    lastLoginAt: string
    createdAt: string
}

const SEED_SUB_ACCOUNTS: SubAccountRow[] = [
    // agent (Asia Master) 操作子帳號
    { id: 'SA-AG-001', username: 'asia.ops1', displayName: '代理營運 A', ownerType: 'agent', agent: 'Asia Master', merchant: '', role: '營運', status: '啟用', lastLoginAt: '2026-05-21 09:12', createdAt: '2026-01-10 10:00' },
    { id: 'SA-AG-002', username: 'asia.fin', displayName: '代理財務', ownerType: 'agent', agent: 'Asia Master', merchant: '', role: '財務', status: '啟用', lastLoginAt: '2026-05-20 17:40', createdAt: '2026-02-02 14:30' },
    { id: 'SA-AG-003', username: 'asia.view', displayName: '代理唯讀', ownerType: 'agent', agent: 'Asia Master', merchant: '', role: '唯讀', status: '停用', lastLoginAt: '2026-04-30 11:05', createdAt: '2026-03-18 09:24' },
    // 其他 agent
    { id: 'SA-AG-101', username: 'prime.ops', displayName: 'Prime 營運', ownerType: 'agent', agent: 'Prime Network', merchant: '', role: '營運', status: '啟用', lastLoginAt: '2026-05-21 08:00', createdAt: '2026-02-12 15:40' },
    // merchant (Golden Dragon) 操作子帳號
    { id: 'SA-ME-001', username: 'golden.admin', displayName: '商戶管理員', ownerType: 'merchant', agent: '', merchant: 'Golden Dragon', role: '管理員', status: '啟用', lastLoginAt: '2026-05-21 10:22', createdAt: '2026-01-18 09:30' },
    { id: 'SA-ME-002', username: 'golden.fin', displayName: '商戶財務', ownerType: 'merchant', agent: '', merchant: 'Golden Dragon', role: '財務', status: '啟用', lastLoginAt: '2026-05-20 18:01', createdAt: '2026-02-04 14:12' },
    { id: 'SA-ME-003', username: 'golden.risk', displayName: '商戶風控', ownerType: 'merchant', agent: '', merchant: 'Golden Dragon', role: '風控', status: '啟用', lastLoginAt: '2026-05-19 16:44', createdAt: '2026-03-11 16:40' },
    { id: 'SA-ME-004', username: 'golden.view', displayName: '商戶唯讀', ownerType: 'merchant', agent: '', merchant: 'Golden Dragon', role: '唯讀', status: '停用', lastLoginAt: '2026-04-22 11:05', createdAt: '2026-04-22 10:30' },
    // 其他 merchant
    { id: 'SA-ME-101', username: 'lucky.admin', displayName: 'Lucky 管理員', ownerType: 'merchant', agent: '', merchant: 'LuckyPlay', role: '管理員', status: '啟用', lastLoginAt: '2026-05-21 09:00', createdAt: '2026-02-04 14:12' },
]

// ──────────────────────────────────────────────────────────────
// Handlers
// ──────────────────────────────────────────────────────────────

export const subAccountAdminHandlers = [
    http.get('/api/sub-accounts/v2/list', async ({ request }) => {
        await delay(250)
        return HttpResponse.json(scopeRows(request, SEED_SUB_ACCOUNTS, { agentKey: 'agent', merchantKey: 'merchant' }))
    }),
]
