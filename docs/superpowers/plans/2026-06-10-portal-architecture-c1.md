# Portal/Scope/Permission 架構地基（C1）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把躺著的 Portal / RBAC / ABAC 型別變成一條可執行、可交接的架構接縫：mock bearer token → apiClient → MSW scope 過濾 → 路由/選單權限守衛 → portal 切換生效，並產出三份交接文件。

**Architecture:** 單一前端多 Portal。`switchPortal` 換發編碼身份的 mock token；`apiClient` 統一附帶；MSW `scope.ts` 解 token 依 dataScope 過濾（示範後端契約）；`router.beforeEach` + 依 portal 產生的選單做 RBAC；`/agent/*` `/merchant/*` 前綴路由由 factory 產生指向共用元件。

**Tech Stack:** Vue 3 + TS + Pinia + vue-router(hash) + MSW + Vite。**本專案無單元測試框架**；每個 Task 的驗證 = `node node_modules/vite/bin/vite.js build`（須見 `built in`）+ 必要時 preview 瀏覽器抽查。

**驗證指令（全程通用）：**
```bash
node node_modules/vite/bin/vite.js build > /tmp/build.log 2>&1; tail -2 /tmp/build.log
```
預期：出現 `✓ built in`，無 `error`。

**分支：** `feat/phase-c1-portal-architecture`（spec 已 commit 在此分支）。

---

## 檔案結構

**新增**
- `src/services/auth/mockToken.ts` — token 編 / 解碼 + 三內建身份
- `src/services/apiClient.ts` — fetch 包裝、附 token、錯誤處理
- `src/mocks/scope.ts` — handler 端 scope 過濾 helper
- `src/router/portalRoutes.ts` — 前綴路由 factory
- `docs/handoff/frontend.md` / `backend.md` / `api-contract.md`

**修改**
- `src/stores/auth.ts` — `applyMockIdentity()`
- `src/stores/portal.ts` — `switchPortal()` 連動 token / role / 導頁
- `src/config/menu-sakai.ts` — `buildMenuForPortal(t, portal)`
- `src/router/index.ts` — beforeEach 權限守衛 + 掛前綴路由
- `src/layouts/sakai/AppTopbar.vue` — 啟用 agent/merchant 切換
- `src/layouts/sakai/AppSidebar.vue`（或選單組裝處）— 依 portal 取選單
- ~38 view/composable — `fetch('/api')` → `api.get(...)`
- list 類 MSW handlers — 套 `scopeRows`
- `src/mocks/handlers/agentAdmin.ts` 等 — seed 擁有權鍵對齊

---

## Task 1: Mock Bearer Token 服務

**Files:**
- Create: `src/services/auth/mockToken.ts`
- Modify: `src/stores/auth.ts`

- [ ] **Step 1: 建立 mockToken.ts**

```ts
// src/services/auth/mockToken.ts
// Mock JWT 風格 token：base64url(header).base64url(payload).<固定簽章>
// ⚠️ 明文、不加密、不驗章，僅供 demo / 交接示意。正式 token 由後端發放與驗證。

export type PortalType = 'supplier' | 'agent' | 'merchant'
export type DataScope = 'all' | 'own-agent-line' | 'own-merchant' | 'none'

export interface TokenPayload {
    sub: string
    portal: PortalType
    role: string
    dataScope: DataScope
    actorId: string
    actorName: string
    iat: number
    exp: number
}

const MOCK_SIG = 'mocksig'

function b64urlEncode(obj: unknown): string {
    const json = JSON.stringify(obj)
    // 支援中文：先 encodeURIComponent → unescape → btoa
    return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlDecode<T>(s: string): T | null {
    try {
        const pad = s.replace(/-/g, '+').replace(/_/g, '/')
        const json = decodeURIComponent(escape(atob(pad)))
        return JSON.parse(json) as T
    } catch {
        return null
    }
}

export function encodeToken(payload: TokenPayload): string {
    const header = b64urlEncode({ alg: 'none', typ: 'JWT' })
    const body = b64urlEncode(payload)
    return `${header}.${body}.${MOCK_SIG}`
}

export function decodeToken(token: string | null | undefined): TokenPayload | null {
    if (!token) return null
    const parts = token.split('.')
    if (parts.length !== 3) return null
    return b64urlDecode<TokenPayload>(parts[1]!)
}

// 三個內建身份（切換 portal = 以該身份檢視）
// 固定簽發時間，避免 Date.now() 造成每次 build 結果不同
const ISSUED_AT = 1_780_000_000 // 2026 春，固定值
const ONE_YEAR = 31_536_000

export const PORTAL_IDENTITIES: Record<PortalType, TokenPayload> = {
    supplier: {
        sub: 'user-sup-001', portal: 'supplier', role: 'role-super-admin',
        dataScope: 'all', actorId: 'SUP-001', actorName: '供應商管理員',
        iat: ISSUED_AT, exp: ISSUED_AT + ONE_YEAR,
    },
    agent: {
        sub: 'user-agent-001', portal: 'agent', role: 'role-agent-user',
        dataScope: 'own-agent-line', actorId: 'AG-001', actorName: 'Asia Master',
        iat: ISSUED_AT, exp: ISSUED_AT + ONE_YEAR,
    },
    merchant: {
        sub: 'user-merchant-001', portal: 'merchant', role: 'role-merchant-user',
        dataScope: 'own-merchant', actorId: 'MER-001', actorName: 'Golden Dragon',
        iat: ISSUED_AT, exp: ISSUED_AT + ONE_YEAR,
    },
}

export function tokenForPortal(portal: PortalType): string {
    return encodeToken(PORTAL_IDENTITIES[portal])
}
```

- [ ] **Step 2: authStore 加 applyMockIdentity，登入時預設 supplier 身份**

`src/stores/auth.ts` — import 並新增 action：
```ts
import { tokenForPortal, type PortalType } from '@/services/auth/mockToken'

// ...在 store 內，token/userInfo 之後：
const applyMockIdentity = (portal: PortalType) => {
    token.value = tokenForPortal(portal)
}
```
在 `login()` 成功設定 token 後改為：
```ts
// 原本：token.value = data.token
// 改為（讓 token 一律是可解碼的 portal token，預設 supplier）：
applyMockIdentity('supplier')
userInfo.value = { name: data.name, email: data.email }
```
return 區塊加入 `applyMockIdentity`。

- [ ] **Step 3: build 驗證**

Run 驗證指令。預期 `✓ built in`，無 error。

- [ ] **Step 4: Commit**

```bash
git add src/services/auth/mockToken.ts src/stores/auth.ts
git commit -m "feat(c1): mock bearer token 服務 + authStore.applyMockIdentity"
```

---

## Task 2: API Client chokepoint + fetch 遷移

**Files:**
- Create: `src/services/apiClient.ts`
- Modify: ~38 個 view/composable（`fetch('/api...')` → `api`）

- [ ] **Step 1: 建立 apiClient.ts**

```ts
// src/services/apiClient.ts
// 單一 API 出口：自動附 mock bearer token、統一錯誤。
// 換真後端時只改本檔（base URL / 真 token 來源）。
import { useAuthStore } from '@/stores/auth'

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const auth = useAuthStore()
    const headers: Record<string, string> = {}
    if (auth.token) headers['Authorization'] = `Bearer ${auth.token}`
    const init: RequestInit = { method, headers }
    if (body !== undefined) {
        headers['Content-Type'] = 'application/json'
        init.body = JSON.stringify(body)
    }
    const res = await fetch(path, init)
    if (!res.ok) throw new Error(`API ${method} ${path} failed: ${res.status}`)
    const text = await res.text()
    return (text ? JSON.parse(text) : null) as T
}

export const api = {
    get: <T = unknown>(path: string) => request<T>('GET', path),
    post: <T = unknown>(path: string, body?: unknown) => request<T>('POST', path, body),
    put: <T = unknown>(path: string, body?: unknown) => request<T>('PUT', path, body),
    del: <T = unknown>(path: string) => request<T>('DELETE', path),
}
```

> 注意：`useAuthStore()` 在 module scope 之外呼叫（在 request 內），確保 Pinia 已初始化。

- [ ] **Step 2: 遷移所有 `fetch('/api/...')` 呼叫**

逐檔把 `const res = await fetch('/api/x/v2/y'); rows.splice(0, rows.length, ...await res.json())` 形式改為：
```ts
import { api } from '@/services/apiClient'
// ...
const data = await api.get<XxxRow[]>('/api/x/v2/y')
rows.splice(0, rows.length, ...data)
```
範圍：43 處 / 38 檔。用以下指令列出全部待改清單：
```bash
grep -rln "fetch('/api" src/views src/composables
```
逐檔處理：移除 `const res = await fetch(...)` + `await res.json()` 兩步，換成單行 `api.get`。POST/PUT 端點（若有）對應 `api.post/put`。**保留各頁既有的 try/finally + loading 結構**。

> auth store 的 `/api/login` 呼叫**不改**（登入前還沒有 token，且它在 store 內、非頁面 fetch 模式）。

- [ ] **Step 3: build 驗證**

Run 驗證指令。若有型別錯誤（api.get 泛型）逐一補上回傳型別。

- [ ] **Step 4: 瀏覽器抽查**

preview_start → 登入 → 開 /orders、/agents、/reports，確認資料正常載入（Authorization header 已隨 apiClient 送出，但此時 scope 尚未套用，資料應全量）。

- [ ] **Step 5: Commit**

```bash
git add src/services/apiClient.ts src/views src/composables
git commit -m "feat(c1): apiClient chokepoint + 43 處 fetch 遷移（自動附 bearer token）"
```

---

## Task 3: Mock seed 擁有權鍵對齊

**Files:**
- Modify: `src/mocks/handlers/agentAdmin.ts`（讓 AG-001 對得上 merchant 的 agent 欄位）

**背景：** merchant/order 等資料的擁有權欄位用 `agent: 'Asia Master'`、`merchant: 'Golden Dragon'`；agent 列表 AG-001 名稱為「星河代理」。scope 過濾 own-agent-line 以 `actorName='Asia Master'` 比對 merchant.agent，需確保資料對得上。

- [ ] **Step 1: 確認 merchant seed 的 agent 值池**

```bash
grep -oE "agent: '[^']*'" src/mocks/handlers/merchantAdmin.ts | sort -u
```
預期看到 `Asia Master` / `Prime Network` / `Nova Agent` / `Royal Partner`。確認 `Asia Master` 至少對應一筆 merchant（MER-001）。

- [ ] **Step 2: agentAdmin seed 補一筆／改名讓 AG-001 = Asia Master**

把 `src/mocks/handlers/agentAdmin.ts` seed 第一筆（AG-001）的 `name` 改為 `'Asia Master'`（或新增 code='AG-001', name='Asia Master' 一筆置頂），使 agent 內建身份（actorId AG-001 / actorName 'Asia Master'）在 agent 列表與 merchant.agent 欄位皆可對應。其餘 seed 不動。

- [ ] **Step 3: build 驗證**

Run 驗證指令。

- [ ] **Step 4: Commit**

```bash
git add src/mocks/handlers/agentAdmin.ts
git commit -m "fix(c1): 對齊 mock 擁有權鍵（AG-001 = Asia Master）供 scope 過濾"
```

---

## Task 4: Scope helper + 套用 list handlers

**Files:**
- Create: `src/mocks/scope.ts`
- Modify: `src/mocks/handlers/{merchantAdmin,orderAdmin,riskAdmin}.ts`（示範套用）

- [ ] **Step 1: 建立 scope.ts**

```ts
// src/mocks/scope.ts
// MSW handler 端 scope 過濾 — 模擬後端依 auth token 的 dataScope 過濾資料。
import { decodeToken } from '@/services/auth/mockToken'

interface ScopeKeys {
    agentKey?: string     // own-agent-line 比對欄位（如 'agent'）
    merchantKey?: string  // own-merchant 比對欄位（如 'merchant'）
}

export function scopeRows<T extends Record<string, unknown>>(
    request: Request,
    rows: T[],
    keys: ScopeKeys,
): T[] {
    const auth = request.headers.get('Authorization')
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
    const payload = decodeToken(token)
    if (!payload || payload.dataScope === 'all') return rows
    if (payload.dataScope === 'none') return []

    if (payload.dataScope === 'own-agent-line') {
        if (!keys.agentKey) {
            console.warn('[scope] own-agent-line 但 handler 未提供 agentKey，pass-through')
            return rows
        }
        return rows.filter((r) => String(r[keys.agentKey!]) === payload.actorName)
    }
    if (payload.dataScope === 'own-merchant') {
        if (!keys.merchantKey) {
            console.warn('[scope] own-merchant 但 handler 未提供 merchantKey，pass-through')
            return rows
        }
        return rows.filter((r) => String(r[keys.merchantKey!]) === payload.actorName)
    }
    return rows
}
```

- [ ] **Step 2: 套用到 merchantAdmin list handler**

`src/mocks/handlers/merchantAdmin.ts` 的 `/api/merchants/v2/list`：
```ts
import { scopeRows } from '@/mocks/scope'
// handler 內：
http.get('/api/merchants/v2/list', async ({ request }) => {
    await delay(250)
    const rows = expandDemoRows(SEED_LIST)
    return HttpResponse.json(scopeRows(request, rows, { agentKey: 'agent', merchantKey: 'code' }))
}),
```
> own-merchant 比對 merchant 自己：用 `code`（MER-001 = actorId）。注意 actorName='Golden Dragon' 但 code='MER-001'；own-merchant 改用 actorId 比 code。**修正 scope.ts own-merchant 分支：同時接受 actorName 比 merchantKey 或 actorId 比 'code'。** 採下方加強版。

- [ ] **Step 3: 加強 scope.ts own-merchant（同時支援 name 與 code 比對）**

把 own-merchant 分支改為：
```ts
if (payload.dataScope === 'own-merchant') {
    return rows.filter((r) => {
        const byName = keys.merchantKey && String(r[keys.merchantKey]) === payload.actorName
        const byCode = 'code' in r && String((r as Record<string, unknown>).code) === payload.actorId
        return byName || byCode
    })
}
```

- [ ] **Step 4: 套用到 orderAdmin、riskAdmin 的 list handlers**

`orderAdmin.ts` 的 `/api/orders/v2/list`、`/api/orders/v2/abnormal`、`/api/transactions/v2/list`、`/api/transactions/v2/abnormal`：
```ts
return HttpResponse.json(scopeRows(request, rows, { merchantKey: 'merchant' }))
```
（這些資料無 agent 欄位，own-agent-line 會 pass-through 並 warn — 可接受；契約文件註明）

`riskAdmin.ts` 的 alerts/cases list：同樣 `{ merchantKey: 'merchant' }`。

> 確保 handler 簽名解構出 `{ request }`。

- [ ] **Step 5: build + 瀏覽器驗證 scope 生效**

build 後 preview：
1. supplier portal 開 /merchants → 看到 60 筆
2. 在 console 手動驗證（暫時）：`fetch('/api/merchants/v2/list', { headers: { Authorization: 'Bearer ' + <agent token> }}).then(r=>r.json()).then(d=>d.length)` 應 < 60（只剩 Asia Master 的）
   （取 agent token：`import('@/services/auth/mockToken')` 不便，可在 Task 5 完成後用 UI 切換驗）

- [ ] **Step 6: Commit**

```bash
git add src/mocks/scope.ts src/mocks/handlers/merchantAdmin.ts src/mocks/handlers/orderAdmin.ts src/mocks/handlers/riskAdmin.ts
git commit -m "feat(c1): MSW scope 過濾 helper + 套用 merchant/order/risk list handlers"
```

---

## Task 5: Portal 切換連動 token / role / 導頁

**Files:**
- Modify: `src/stores/portal.ts`

- [ ] **Step 1: switchPortal 連動**

`src/stores/portal.ts` 的 `switchPortal`：
```ts
import { useAuthStore } from '@/stores/auth'
import { usePermissionStore } from '@/stores/permission'
import { PORTAL_IDENTITIES } from '@/services/auth/mockToken'
import router from '@/router'

const switchPortal = (type: PortalType) => {
    currentType.value = type
    const auth = useAuthStore()
    auth.applyMockIdentity(type)
    const perm = usePermissionStore()
    perm.setRole(PORTAL_IDENTITIES[type].role)   // 若 permissionStore 無 setRole，於本 task 一併新增
    // 導向該 portal 首頁
    const home = type === 'supplier' ? '/dashboard' : `/${type}/dashboard`
    router.push(home).catch(() => {})
}
```

- [ ] **Step 2: permissionStore 補 setRole（若無）**

`src/stores/permission.ts`：確認/新增
```ts
const setRole = (roleId: string) => { currentRoleId.value = roleId }
// return 區塊加入 setRole
```

- [ ] **Step 3: build 驗證**

Run 驗證指令。（UI 切換驗證留待 Task 8 啟用切換器後）

- [ ] **Step 4: Commit**

```bash
git add src/stores/portal.ts src/stores/permission.ts
git commit -m "feat(c1): switchPortal 連動 token/role/導頁"
```

---

## Task 6: 依 Portal 產生選單

**Files:**
- Modify: `src/config/menu-sakai.ts`
- Modify: 選單組裝處（讀 portalStore.currentType 傳入）

- [ ] **Step 1: menu-sakai 改為 buildMenuForPortal**

把現有 `buildSakaiMenu(t)` 保留為 supplier 完整選單，新增：
```ts
import type { PortalType } from '@/types/portal'

const AGENT_GROUP_LABELS = ['menu.overview', 'menu.merchantGroup', 'menu.gameManagement', 'menu.orderGroup', 'menu.reportGroup']
// merchant 同理列白名單

export function buildMenuForPortal(t: Composer['t'], portal: PortalType): MenuGroup[] {
    const full = buildSakaiMenu(t)
    if (portal === 'supplier') return full
    // agent / merchant：以群組 label key 白名單過濾
    // （C1 先以群組為單位篩；C2 再加 Portal 專屬條目）
    const allow = portal === 'agent' ? AGENT_ALLOW : MERCHANT_ALLOW
    return full.filter((g) => allow.includes(g.labelKey))   // 需在 group 結構保留 labelKey
}
```
> 若 MenuGroup 目前只存 `label`（已 t() 翻譯），需在 build 時保留原 key 以供過濾——改 buildSakaiMenu 內每組附 `key` 欄位（type MenuGroup 加 `key?: string`）。

- [ ] **Step 2: 選單組裝處改用 buildMenuForPortal**

找到呼叫 `buildSakaiMenu` 的地方（AppSidebar / AppMenu）：
```bash
grep -rln "buildSakaiMenu" src/layouts src/components
```
改為：
```ts
import { usePortalStore } from '@/stores/portal'
const portal = usePortalStore()
const menu = computed(() => buildMenuForPortal(t, portal.currentType))
```

- [ ] **Step 3: build + 瀏覽器驗證**

build 後 preview，supplier 下選單應與現狀一致（完整）。

- [ ] **Step 4: Commit**

```bash
git add src/config/menu-sakai.ts src/layouts
git commit -m "feat(c1): buildMenuForPortal — 選單依 portal 切換"
```

---

## Task 7: 前綴路由 factory + 權限守衛

**Files:**
- Create: `src/router/portalRoutes.ts`
- Modify: `src/router/index.ts`

- [ ] **Step 1: portalRoutes factory**

```ts
// src/router/portalRoutes.ts
import type { RouteRecordRaw } from 'vue-router'
import type { PortalType } from '@/types/portal'

// 共用頁在 agent/merchant 下可達的對照（path 去前綴 → component）
// C1 只接共用頁；C2 再加 Portal 專屬頁
interface PortalRouteDef { path: string; name: string; component: () => Promise<unknown>; titleKey: string }

export function portalRoutes(portal: PortalType, defs: PortalRouteDef[]): RouteRecordRaw[] {
    return defs.map((d) => ({
        path: `${portal}/${d.path}`,
        name: `${portal}-${d.name}`,
        component: d.component as RouteRecordRaw['component'],
        meta: { title: d.titleKey, portal, requiresAuth: true },
    }))
}
```

- [ ] **Step 2: 在 router/index.ts 掛 agent/merchant 共用頁前綴路由**

於 MainLayout children 內加入（dashboard 用既有 Dashboard/Index 等共用元件）：
```ts
import { portalRoutes } from './portalRoutes'

const SHARED_DEFS = [
    { path: 'dashboard', name: 'dashboard', component: () => import('@/views/Dashboard/Index.vue'), titleKey: 'menu.dashboard' },
    { path: 'orders', name: 'orders', component: () => import('@/views/Orders/Index.vue'), titleKey: 'menu.orders' },
    { path: 'transactions', name: 'transactions', component: () => import('@/views/Transactions/Index.vue'), titleKey: 'menu.transactionList' },
    { path: 'reports', name: 'reports', component: () => import('@/views/Reports/Overview.vue'), titleKey: 'menu.reportsOverview' },
    // ...（共用頁，依 spec 路由清單，C1 取交集）
]
// children 陣列展開：
...portalRoutes('agent', SHARED_DEFS),
...portalRoutes('merchant', SHARED_DEFS),
```

- [ ] **Step 3: beforeEach 權限守衛**

`router/index.ts` 既有 `beforeEach` 內，認證通過後加 portal 同步：
```ts
// to.meta.portal 存在時，同步 portalStore（深連結進 /agent/* 也能對）
const portalMeta = to.meta.portal as 'agent' | 'merchant' | undefined
if (portalMeta) {
    const { usePortalStore } = await import('@/stores/portal')
    const p = usePortalStore()
    if (p.currentType !== portalMeta) p.switchPortal(portalMeta)
}
```
> C1 權限守衛先做「portal 同步 + requiresAuth」；細粒度 `meta.permission` 比對（無權限導 /403）作為本 task Step 4。

- [ ] **Step 4: meta.permission 守衛（共用頁暫不設限，保留機制）**

beforeEach 加：
```ts
const need = to.meta.permission as string | undefined
if (need) {
    const { usePermissionStore } = await import('@/stores/permission')
    if (!usePermissionStore().permissions.includes(need)) return next('/403')
}
```
（C1 不在共用頁設 `meta.permission`，僅建立機制；C2 專屬頁再標。）

- [ ] **Step 5: build + 瀏覽器驗證**

build 後 preview：直接導 `/agent/dashboard`、`/merchant/orders`，應正常渲染共用頁且 portalStore 同步成對應 portal。

- [ ] **Step 6: Commit**

```bash
git add src/router/portalRoutes.ts src/router/index.ts
git commit -m "feat(c1): 前綴路由 factory + portal 同步 / 權限守衛機制"
```

---

## Task 8: 啟用 Topbar agent/merchant 切換

**Files:**
- Modify: `src/layouts/sakai/AppTopbar.vue`

- [ ] **Step 1: 移除 agent/merchant 的 disabled**

A6 加的 `portalOptionDisabled` 改為一律可選：
```ts
// 移除 option-disabled 綁定，或讓它恆 false
const portalOptionDisabled = () => false
```
Select 的 `v-model="portalStore.currentType"` 改為呼叫 `switchPortal`（避免只改值不連動）：
```vue
<Select
  :model-value="portalStore.currentType"
  :options="portalStore.portals" option-label="label" option-value="type"
  @update:model-value="portalStore.switchPortal"
  class="layout-portal-select" aria-label="切換 Portal" />
```

- [ ] **Step 2: build + 瀏覽器完整驗證（核心驗收）**

build 後 preview：
1. 登入（supplier）→ /merchants 看到 60 筆
2. topbar 切 **agent** → 自動導 /agent/dashboard，選單變 agent 子集，topbar 身份顯示 Asia Master
3. 開 agent 下的 /agent/orders（或共用 orders）→ 資料筆數 < supplier（scope own-agent-line 生效）
4. 切 **merchant** → /merchant/dashboard，選單 merchant 子集
5. 開 merchant 下交易/訂單 → 只剩 Golden Dragon 的資料
6. 切回 supplier → 全量資料、完整選單
7. console 無 error

- [ ] **Step 3: Commit**

```bash
git add src/layouts/sakai/AppTopbar.vue
git commit -m "feat(c1): 啟用 topbar agent/merchant portal 切換（連動 scope/選單/身份）"
```

---

## Task 9: 交接文件

**Files:**
- Create: `docs/handoff/frontend.md`, `docs/handoff/backend.md`, `docs/handoff/api-contract.md`

- [ ] **Step 1: frontend.md**

內容（實寫，非占位）：
- 架構圖（切換器 → authStore → apiClient → MSW）
- `api` 用法（get/post/put/del + 範例）
- 頁面 fetch 模式（onMounted + reactive + loading，附範本）
- portal 切換（switchPortal 做了什麼）
- 權限：路由 meta.permission、`usePermissionStore().permissions`、未來 `can()` 用法
- **換真後端步驟**：只改 apiClient base URL + token 來源；移除 MSW；scope 由後端負責
- 路由 factory（新增 portal 共用頁 / 專屬頁的方法）

- [ ] **Step 2: backend.md**

- token payload 契約（欄位表，同 spec §3.1）
- **各 endpoint scope 過濾規則表**（同 spec §3.3，逐條：endpoint / 過濾欄位 / own-agent-line / own-merchant）
- 擁有權鍵對照（actorName / actorId 如何對到資料欄位）
- 權限矩陣（role × permission）
- API 清單（method / path / 用途）
- mock → 真後端對照（MSW handler 對應後端該實作什麼）

- [ ] **Step 3: api-contract.md**

- 總表：endpoint × method × 所需 permission × scope 行為 一覽
- 由 `grep -rhoE "http\.(get|post|put|delete)\('[^']*'" src/mocks/handlers` 產生 endpoint 清單後補欄位

- [ ] **Step 4: Commit**

```bash
git add docs/handoff
git commit -m "docs(c1): 前端/後端/API 契約交接文件"
```

---

## Self-Review 結果

- **Spec 覆蓋**：§3.1 token→Task1；§3.2 apiClient→Task2；§3.1 資料對齊→Task3；§3.3 scope→Task4；§3.5 切換→Task5；§3.4 選單→Task6、路由守衛→Task7；topbar→Task8；§4 文件→Task9。✓ 全覆蓋。
- **Placeholder**：核心新檔（mockToken/apiClient/scope/portalRoutes）均附完整程式碼；Task6/7 的選單白名單與 SHARED_DEFS 清單於實作時依當下路由補齊（已標方法）。
- **型別一致**：`TokenPayload`/`PortalType`/`DataScope` 跨 Task 一致；`PORTAL_IDENTITIES`、`tokenForPortal`、`decodeToken`、`scopeRows`、`applyMockIdentity`、`switchPortal`、`buildMenuForPortal`、`portalRoutes` 命名跨 Task 一致。
- **風險**：own-merchant 比對 name vs code 已在 Task4 Step3 加強；scope 對無對應欄位 pass-through + warn，不會把頁面意外清空到報錯。

## 執行順序與相依

1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9（線性；Task9 文件可與 8 後並行）。
