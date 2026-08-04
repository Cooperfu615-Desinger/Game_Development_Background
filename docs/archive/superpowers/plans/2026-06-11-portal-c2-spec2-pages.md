# Phase C2 — Spec 2「Portal 專屬實頁 + H#3」Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 C2 Spec 1 的 5 條佔位路由換成真實頁（merchant 商戶資料 / API錢包、agent 佣金報表、agent+merchant 子帳號），加 2 個 scoped MSW 端點，並解 C1 H#3（agent/merchant 選單連結全前綴化、零死連結、token 永留自己 portal、不退回 supplier）。

**Architecture:** vertical-slice 順序：先把 merchant 商戶資料做成範本（self-view 複用既有 `/api/merchants/v2/list` 取 `rows[0]`）→ 套到 API錢包 → 佣金報表（新端點 own-agent-line）→ 子帳號（新端點 + portal 參數化共用元件）→ 最後 H#3（擴 `SHARED_DEFS` 全覆蓋 sub-page + `buildMenuForPortal` 前綴轉換，**不補 supplier `meta.portal`**）。新端點一律走 `scopeRows()`。

**Tech Stack:** Vue 3 + TS + Pinia + vue-router(hash) + PrimeVue + vue-i18n + MSW + Vite。**無單元測試框架**；驗證＝build + vue-tsc + preview。

**驗證指令（全程通用）：**
```bash
node node_modules/vite/bin/vite.js build > /tmp/build.log 2>&1; tail -3 /tmp/build.log    # 須見 "✓ built in"
node node_modules/vue-tsc/bin/vue-tsc.js --noEmit; echo "tsc exit: $?"                      # 須 exit 0
```

**分支：** `feat/phase-c2-spec2-portal-pages`（spec 已 commit 在此分支）。

**相依：** Task 1→2→3→4→5→6→7 線性。Task 4 末刪佔位頁（5 條路由全換真元件後）。Task 7 純驗證。

---

## 檔案結構

**新增**：`src/views/Merchant/Profile.vue`、`src/views/Merchant/ApiWallet.vue`、`src/views/Agent/Commissions.vue`、`src/views/Portal/SubAccounts.vue`、`src/mocks/handlers/subAccountAdmin.ts`
**修改**：`src/router/index.ts`（5 ONLY_DEFS 換元件 + 擴 SHARED_DEFS）、`src/config/menu-sakai.ts`（前綴轉換）、`src/mocks/handlers/agentAdmin.ts`（+commissions）、`src/mocks/handlers/index.ts`（註冊）、`docs/handoff/{backend,api-contract}.md`
**刪除**：`src/views/_Placeholder/PortalPagePlaceholder.vue`

**共用慣例（所有新頁）**：`<script setup lang="ts">` + `import { api } from '@/services/apiClient'` + `reactive`/`ref` + `onMounted` 取數（`rows.splice(0, rows.length, ...data)`）+ `SectionCard`；mirror `src/views/Reports/Agents.vue`。金額用 `CurrencyAmount`，狀態用 PrimeVue `Tag`，secret 用 `SensitiveValue`。

---

## Task 1: merchant 商戶資料 self-view（範本）

**Files:** Create `src/views/Merchant/Profile.vue`；Modify `src/router/index.ts`（MERCHANT_ONLY_DEFS 的 `profile` def）

- [ ] **Step 1: 建立 `src/views/Merchant/Profile.vue`**

```vue
<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { api } from '@/services/apiClient'
import SectionCard from '@/components/ui/SectionCard.vue'
import Tag from 'primevue/tag'

interface MerchantRow {
  code: string; name: string; agent: string; status: string
  currencies: string[]; defaultCurrency: string; settlementCurrency: string
  languages: string[]; environmentMode: string; walletType: string
  revenueType: string; revenueShare: string; contact: string; createdAt: string
}

const profile = reactive<Partial<MerchantRow>>({})
const loading = ref(true)

onMounted(async () => {
  try {
    // self-view：C1 已將此端點 scope 成 own-merchant，merchant token 下恰好 1 筆
    const rows = await api.get<MerchantRow[]>('/api/merchants/v2/list')
    Object.assign(profile, rows[0] ?? {})
  } finally {
    loading.value = false
  }
})

function statusSeverity(s?: string) {
  if (s === '啟用') return 'success'
  if (s === '警示' || s === '待審核') return 'warn'
  return 'info'
}
</script>

<template>
  <div class="page-stack">
    <SectionCard>
      <template #header>
        <div class="dialog-title-block">
          <h2>商戶資料</h2>
          <p>檢視本商戶的基本設定資訊（唯讀）。</p>
        </div>
      </template>
      <div v-if="loading">載入中…</div>
      <div v-else class="detail-grid">
        <div><span>商戶名稱</span><strong>{{ profile.name }}</strong></div>
        <div><span>商戶代號</span><strong>{{ profile.code }}</strong></div>
        <div><span>所屬代理</span><strong>{{ profile.agent }}</strong></div>
        <div><span>狀態</span><Tag :value="profile.status" :severity="statusSeverity(profile.status)" /></div>
        <div><span>幣別</span><strong>{{ (profile.currencies || []).join('、') }}</strong></div>
        <div><span>預設幣別</span><strong>{{ profile.defaultCurrency }}</strong></div>
        <div><span>結算幣別</span><strong>{{ profile.settlementCurrency }}</strong></div>
        <div><span>語系</span><strong>{{ (profile.languages || []).join('、') }}</strong></div>
        <div><span>環境</span><strong>{{ profile.environmentMode }}</strong></div>
        <div><span>錢包類型</span><strong>{{ profile.walletType }}</strong></div>
        <div><span>分潤方式</span><strong>{{ profile.revenueType }} {{ profile.revenueShare }}</strong></div>
        <div><span>聯絡人</span><strong>{{ profile.contact }}</strong></div>
        <div><span>建立時間</span><strong>{{ profile.createdAt }}</strong></div>
      </div>
    </SectionCard>
  </div>
</template>
```
> `detail-grid` / `dialog-title-block` / `page-stack` 為專案既有 class（見 `Reports/Agents.vue`）。不需新 CSS。

- [ ] **Step 2: 路由換真元件**

`src/router/index.ts` 的 `MERCHANT_ONLY_DEFS`，把 `profile` 那筆的 `component: placeholder` 改為：
```ts
    { path: 'profile', name: 'profile', component: () => import('@/views/Merchant/Profile.vue'), titleKey: 'menu.merchantProfile', permission: 'merchant-profile.view' },
```
（其餘 4 筆暫留 `placeholder`，後續 task 換。）

- [ ] **Step 3: build + tsc 驗證**

```bash
node node_modules/vite/bin/vite.js build > /tmp/build.log 2>&1; tail -3 /tmp/build.log
node node_modules/vue-tsc/bin/vue-tsc.js --noEmit; echo "tsc exit: $?"
```

- [ ] **Step 4: Commit**

```bash
git add src/views/Merchant/Profile.vue src/router/index.ts
git commit -m "feat(c2): merchant 商戶資料 self-view（複用 merchants list own-merchant 取首筆）"
```

---

## Task 2: merchant API錢包（secret 遮罩）

**Files:** Create `src/views/Merchant/ApiWallet.vue`；Modify `src/router/index.ts`（`api-wallet` def）

- [ ] **Step 1: 建立 `src/views/Merchant/ApiWallet.vue`**

```vue
<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { api } from '@/services/apiClient'
import SectionCard from '@/components/ui/SectionCard.vue'
import SensitiveValue from '@/components/ui/SensitiveValue.vue'

interface MerchantRow {
  name: string; walletType: string; apiStatus: string
  apiKey: string; secretKey: string; walletApi: string; callbackUrl: string
}

const wallet = reactive<Partial<MerchantRow>>({})
const loading = ref(true)

onMounted(async () => {
  try {
    // self-view：own-merchant scope → 1 筆；憑證欄位在同一列
    const rows = await api.get<MerchantRow[]>('/api/merchants/v2/list')
    Object.assign(wallet, rows[0] ?? {})
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="page-stack">
    <SectionCard>
      <template #header>
        <div class="dialog-title-block">
          <h2>API 與錢包</h2>
          <p>本商戶的錢包介接與 API 憑證；密鑰預設遮罩，點眼睛圖示可顯示。</p>
        </div>
      </template>
      <div v-if="loading">載入中…</div>
      <div v-else class="detail-grid">
        <div><span>錢包類型</span><strong>{{ wallet.walletType }}</strong></div>
        <div><span>API 狀態</span><strong>{{ wallet.apiStatus }}</strong></div>
        <div><span>錢包 API</span><strong>{{ wallet.walletApi }}</strong></div>
        <div><span>回呼網址</span><strong>{{ wallet.callbackUrl }}</strong></div>
        <div><span>API Key</span><SensitiveValue :value="wallet.apiKey || '-'" /></div>
        <div><span>Secret Key</span><SensitiveValue :value="wallet.secretKey || '-'" /></div>
      </div>
    </SectionCard>
  </div>
</template>
```
> secret 用 `SensitiveValue`（既有元件，預設遮罩 `••••`，點眼睛切換）。頁面已由路由 `meta.permission='api-wallet.view'` 守衛；不啟用欄位級 canSeeField。

- [ ] **Step 2: 路由換真元件**

`MERCHANT_ONLY_DEFS` 的 `api-wallet` 那筆：
```ts
    { path: 'api-wallet', name: 'api-wallet', component: () => import('@/views/Merchant/ApiWallet.vue'), titleKey: 'menu.apiWallet', permission: 'api-wallet.view' },
```

- [ ] **Step 3: build + tsc 驗證**（同 Task 1 Step 3）

- [ ] **Step 4: Commit**

```bash
git add src/views/Merchant/ApiWallet.vue src/router/index.ts
git commit -m "feat(c2): merchant API錢包頁（SensitiveValue 遮罩 secret；路由級 api-wallet.view 守衛）"
```

---

## Task 3: agent 佣金報表（新 scoped 端點）

**Files:** Modify `src/mocks/handlers/agentAdmin.ts`；Create `src/views/Agent/Commissions.vue`；Modify `src/router/index.ts`（`commissions` def）

- [ ] **Step 1: agentAdmin.ts 加 commissions 端點 + seed**

在 `src/mocks/handlers/agentAdmin.ts`：頂部 import 加 `scopeRows`（若無）：
```ts
import { scopeRows } from '@/mocks/scope'
```
檔案內（`AgentRow` 之後）加型別 + seed：
```ts
type CommissionRow = {
    period: string
    agent: string
    merchant: string
    bet: number
    ggr: number
    commissionType: string
    commissionRate: number
    commission: number
    currency: string
    settlementStatus: string
}

const SEED_COMMISSIONS: CommissionRow[] = [
    { period: '2026-05', agent: 'Asia Master', merchant: 'Golden Dragon', bet: 1286800, ggr: 74400, commissionType: 'GGR', commissionRate: 0.08, commission: 5952, currency: 'USDT', settlementStatus: '待審核' },
    { period: '2026-05', agent: 'Asia Master', merchant: 'Dragon Club', bet: 736500, ggr: 42220, commissionType: 'GGR', commissionRate: 0.08, commission: 3377.6, currency: 'USDT', settlementStatus: '待對帳' },
    { period: '2026-04', agent: 'Asia Master', merchant: 'Golden Dragon', bet: 1102300, ggr: 61800, commissionType: 'GGR', commissionRate: 0.08, commission: 4944, currency: 'USDT', settlementStatus: '已鎖定' },
    { period: '2026-05', agent: 'Prime Network', merchant: 'LuckyPlay', bet: 8842000, ggr: 666000, commissionType: 'Turnover', commissionRate: 0.015, commission: 132630, currency: 'TWD', settlementStatus: '對帳中' },
    { period: '2026-05', agent: 'Nova Agent', merchant: 'Nova Gaming', bet: 316400, ggr: 21480, commissionType: 'GGR', commissionRate: 0.06, commission: 1288.8, currency: 'USD', settlementStatus: '已鎖定' },
    { period: '2026-05', agent: 'Royal Partner', merchant: 'Royal H5', bet: 542000, ggr: -27200, commissionType: 'GGR', commissionRate: 0.05, commission: -1360, currency: 'USDT', settlementStatus: '爭議中' },
]
```
在 `agentAdminHandlers` 陣列加 handler：
```ts
    http.get('/api/agents/v2/commissions', async ({ request }) => {
        await delay(250)
        return HttpResponse.json(scopeRows(request, SEED_COMMISSIONS, { agentKey: 'agent' }))
    }),
```
> supplier(all)=6 筆；agent(Asia Master)=3 筆（驗證點）。own-merchant 無 agentKey 命中 → 空（merchant 無此頁，可接受）。

- [ ] **Step 2: 建立 `src/views/Agent/Commissions.vue`**

```vue
<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { api } from '@/services/apiClient'
import SectionCard from '@/components/ui/SectionCard.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import CurrencyAmount from '@/components/ui/CurrencyAmount.vue'

interface CommissionRow {
  period: string; agent: string; merchant: string; bet: number; ggr: number
  commissionType: string; commissionRate: number; commission: number
  currency: string; settlementStatus: string
}

const rows = reactive<CommissionRow[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const data = await api.get<CommissionRow[]>('/api/agents/v2/commissions')
    rows.splice(0, rows.length, ...data)
  } finally {
    loading.value = false
  }
})

function money(value: number, currency: string) {
  const sign = value < 0 ? '-' : ''
  return `${currency} ${sign}${Math.abs(value).toLocaleString('en-US', { maximumFractionDigits: 2 })}`
}
function statusSeverity(s: string) {
  if (s === '已鎖定') return 'success'
  if (s === '爭議中') return 'danger'
  return 'warn'
}
</script>

<template>
  <div class="page-stack">
    <SectionCard>
      <template #header>
        <div class="dialog-title-block">
          <h2>佣金報表</h2>
          <p>本代理線下各商戶的佣金結算（依資料範圍 own-agent-line 篩選）。</p>
        </div>
      </template>
      <DataTable :value="rows" :loading="loading" paginator :rows="10" scrollable table-style="min-width: 960px">
        <Column field="period" header="期間" style="width: 100px" />
        <Column field="merchant" header="商戶" style="width: 150px" />
        <Column header="Bet" style="width: 150px">
          <template #body="{ data }"><CurrencyAmount :value="money(data.bet, data.currency)" /></template>
        </Column>
        <Column header="GGR" style="width: 150px">
          <template #body="{ data }"><CurrencyAmount :value="money(data.ggr, data.currency)" :negative="data.ggr < 0" /></template>
        </Column>
        <Column field="commissionType" header="佣金類型" style="width: 110px" />
        <Column header="佣金比例" style="width: 100px">
          <template #body="{ data }">{{ (data.commissionRate * 100).toFixed(2) }}%</template>
        </Column>
        <Column header="佣金金額" style="width: 150px">
          <template #body="{ data }"><CurrencyAmount :value="money(data.commission, data.currency)" :negative="data.commission < 0" /></template>
        </Column>
        <Column header="結算" style="width: 100px">
          <template #body="{ data }"><Tag :value="data.settlementStatus" :severity="statusSeverity(data.settlementStatus)" /></template>
        </Column>
      </DataTable>
    </SectionCard>
  </div>
</template>
```

- [ ] **Step 3: 路由換真元件**

`AGENT_ONLY_DEFS` 的 `commissions` 那筆：
```ts
    { path: 'commissions', name: 'commissions', component: () => import('@/views/Agent/Commissions.vue'), titleKey: 'menu.commissions', permission: 'commissions.view' },
```

- [ ] **Step 4: build + tsc 驗證**（同上）

- [ ] **Step 5: Commit**

```bash
git add src/mocks/handlers/agentAdmin.ts src/views/Agent/Commissions.vue src/router/index.ts
git commit -m "feat(c2): agent 佣金報表頁 + /api/agents/v2/commissions（own-agent-line scope）"
```

---

## Task 4: 子帳號（共用 portal 參數化元件 + 新 scoped 端點）+ 刪佔位頁

**Files:** Create `src/mocks/handlers/subAccountAdmin.ts`、`src/views/Portal/SubAccounts.vue`；Modify `src/mocks/handlers/index.ts`、`src/router/index.ts`；Delete `src/views/_Placeholder/PortalPagePlaceholder.vue`

- [ ] **Step 1: 建立 `src/mocks/handlers/subAccountAdmin.ts`**

```ts
import { http, HttpResponse, delay } from 'msw'
import { scopeRows } from '@/mocks/scope'

type SubAccountRow = {
    id: string
    username: string
    displayName: string
    ownerType: 'agent' | 'merchant'
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
    { id: 'SA-ME-004', username: 'golden.view', displayName: '商戶唯讀', ownerType: 'merchant', agent: '', merchant: 'Golden Dragon', role: '唯讀', status: '停用', lastLoginAt: '2026-04-22 11:05', createdAt: '2026-04-22 11:05' },
    // 其他 merchant
    { id: 'SA-ME-101', username: 'lucky.admin', displayName: 'Lucky 管理員', ownerType: 'merchant', agent: '', merchant: 'LuckyPlay', role: '管理員', status: '啟用', lastLoginAt: '2026-05-21 09:00', createdAt: '2026-02-04 14:12' },
]

export const subAccountAdminHandlers = [
    http.get('/api/sub-accounts/v2/list', async ({ request }) => {
        await delay(250)
        return HttpResponse.json(scopeRows(request, SEED_SUB_ACCOUNTS, { agentKey: 'agent', merchantKey: 'merchant' }))
    }),
]
```
> supplier(all)=9；agent(Asia Master)=3（agent==='Asia Master'）；merchant(Golden Dragon)=4（merchant==='Golden Dragon'）。各 portal 只見自己（驗證點）。

- [ ] **Step 2: 註冊 handler**

`src/mocks/handlers/index.ts`：import + 展開：
```ts
import { subAccountAdminHandlers } from './subAccountAdmin'
// ...handlers 陣列加：
    ...subAccountAdminHandlers,
```

- [ ] **Step 3: 建立 `src/views/Portal/SubAccounts.vue`（portal 參數化）**

```vue
<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/services/apiClient'
import SectionCard from '@/components/ui/SectionCard.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'

interface SubAccountRow {
  id: string; username: string; displayName: string
  ownerType: 'agent' | 'merchant'; agent: string; merchant: string
  role: string; status: string; lastLoginAt: string; createdAt: string
}

const route = useRoute()
const portal = computed(() => (route.meta.portal as string | undefined) ?? '')
const title = computed(() => (portal.value === 'agent' ? '代理子帳號' : '商戶子帳號'))

const rows = reactive<SubAccountRow[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const data = await api.get<SubAccountRow[]>('/api/sub-accounts/v2/list')
    rows.splice(0, rows.length, ...data)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="page-stack">
    <SectionCard>
      <template #header>
        <div class="dialog-title-block">
          <h2>{{ title }}</h2>
          <p>管理本帳號下的操作子帳號（依資料範圍篩選，僅顯示自己的）。</p>
        </div>
      </template>
      <DataTable :value="rows" :loading="loading" paginator :rows="10" scrollable table-style="min-width: 800px">
        <Column field="username" header="帳號" style="width: 160px" />
        <Column field="displayName" header="顯示名稱" style="width: 150px" />
        <Column field="role" header="角色" style="width: 110px" />
        <Column header="狀態" style="width: 100px">
          <template #body="{ data }"><Tag :value="data.status" :severity="data.status === '啟用' ? 'success' : 'secondary'" /></template>
        </Column>
        <Column field="lastLoginAt" header="最後登入" style="width: 160px" />
        <Column field="createdAt" header="建立時間" style="width: 160px" />
      </DataTable>
    </SectionCard>
  </div>
</template>
```

- [ ] **Step 4: 兩條 sub-accounts 路由換真元件**

`src/router/index.ts`：`AGENT_ONLY_DEFS` 的 `sub-accounts` 與 `MERCHANT_ONLY_DEFS` 的 `sub-accounts` 兩筆，`component` 改為：
```ts
component: () => import('@/views/Portal/SubAccounts.vue'),
```
（agent 那筆 permission 維持 `sub-accounts.view`、titleKey `menu.subAccounts`；merchant 那筆同。）

- [ ] **Step 5: 刪佔位頁 + 移除 import**

此時 5 條 ONLY_DEFS 全指真元件，`placeholder` 不再被引用。`src/router/index.ts` 移除：
```ts
const placeholder = () => import('@/views/_Placeholder/PortalPagePlaceholder.vue')
```
並刪檔：
```bash
git rm src/views/_Placeholder/PortalPagePlaceholder.vue
```
> 確認 `grep -rn "_Placeholder" src` 無殘留引用。

- [ ] **Step 6: build + tsc 驗證**（須無「placeholder 未使用」或缺檔錯誤）

- [ ] **Step 7: Commit**

```bash
git add src/mocks/handlers/subAccountAdmin.ts src/mocks/handlers/index.ts src/views/Portal/SubAccounts.vue src/router/index.ts
git commit -m "feat(c2): 子帳號共用頁（portal 參數化）+ /api/sub-accounts/v2/list（scope）+ 刪佔位頁"
```

---

## Task 5: H#3 — 擴 SHARED_DEFS 全覆蓋 + 選單前綴轉換（不補 supplier meta.portal）

**Files:** Modify `src/router/index.ts`（擴 SHARED_DEFS）、`src/config/menu-sakai.ts`（前綴轉換）

- [ ] **Step 1: 擴 `SHARED_DEFS`（+17 sub-page）**

`src/router/index.ts` 的 `SHARED_DEFS` 陣列，於既有 8 筆後加入（path → 既有元件；titleKey 用既有 menu key）：
```ts
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
```
> factory 會為 agent/merchant 各產生前綴路由（`agent-merchants-settings` / `merchant-merchants-settings`…），名稱不衝突。SHARED_DEFS 無 `permission` → 共用頁不設守衛（與 C1 一致）。**不要動 MainLayout 父路由 meta**（不補 `portal:'supplier'`）。

- [ ] **Step 2: `buildMenuForPortal` 加共用群組前綴轉換**

`src/config/menu-sakai.ts`：在 `buildMenuForPortal` 之前加 helper，並改 `buildMenuForPortal` 對 `filtered` 套用前綴：
```ts
// 把共用群組 item 的 to 由 /x 改寫成 /${portal}/x（遞迴）；附加的 self 群組已是前綴路徑、不經此函式
function prefixMenuItem(item: MenuItem, portal: PortalType): MenuItem {
    const next: MenuItem = { ...item }
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
```
> 只轉換 `filtered`（共用群組）；`extra`（agentSelf/merchantSelf）已是 `/agent/*` `/merchant/*` 前綴，保持不變。supplier 直接回 `full`（不前綴）。

- [ ] **Step 3: build + tsc 驗證**（須無重複 route name；前綴路由總數增加）

- [ ] **Step 4: Commit**

```bash
git add src/router/index.ts src/config/menu-sakai.ts
git commit -m "feat(c2): 解 H#3 — 擴 SHARED_DEFS 覆蓋全 sub-page + 選單共用條目前綴化（不補 supplier meta.portal）"
```

---

## Task 6: 交接文件補登（backend.md + api-contract.md）

**Files:** Modify `docs/handoff/backend.md`、`docs/handoff/api-contract.md`

- [ ] **Step 1: backend.md 補新端點 scope 規則**

在 `docs/handoff/backend.md` 的「各 endpoint scope 過濾規則」表後（或新增小節「C2 Spec 2 新增端點」）加入：
```markdown
### C2 Spec 2 新增 / 複用端點

| endpoint | 過濾鍵 | own-agent-line | own-merchant |
|---|---|---|---|
| `GET /api/agents/v2/commissions`（新） | `agentKey:'agent'` | `agent==='Asia Master'` | 空（無 agentKey 命中） |
| `GET /api/sub-accounts/v2/list`（新） | `agentKey:'agent'`,`merchantKey:'merchant'` | `agent==='Asia Master'` | `merchant==='Golden Dragon'` |
| `GET /api/merchants/v2/list`（self-view 複用，取首筆） | 同 C1 | — | 1 筆（MER-001） |

> **self-view 複用 trade-off**：merchant 商戶資料 / API錢包 直接複用 own-merchant scope 後的 `/api/merchants/v2/list` 首筆。該 list 列含憑證（apiKey/secretKey/walletApi/callbackUrl），supplier(all) 下會回含 secret 的多筆——**正式後端必須把憑證移到專屬 own-merchant scoped 端點（如 `/api/merchant/v2/credentials`），不可放在 list**。
> **commissions own-agent-line**：mock 採 `agent` 欄位直接比對 actorName；sub-agent 線遞迴為真後端 TODO（同 C1 order/risk 註記）。
```

- [ ] **Step 2: api-contract.md 補端點列**

在 `docs/handoff/api-contract.md` 對應區塊加列：
```markdown
| `/api/agents/v2/commissions` | GET | `commissions.view` | scope 過濾（agentKey:`agent`）：own-agent-line 留 Asia Master；own-merchant 空 |
| `/api/sub-accounts/v2/list` | GET | `sub-accounts.view` | scope 過濾（agentKey:`agent` / merchantKey:`merchant`）：各 portal 只見自己 |
```

- [ ] **Step 3: build 驗證**（文件變更，build 仍應綠）+ Commit

```bash
git add docs/handoff/backend.md docs/handoff/api-contract.md
git commit -m "docs(c2): backend/api-contract 補 Spec 2 新端點 scope 規則 + self-view 複用 trade-off"
```

---

## Task 7: 全鏈瀏覽器驗證（三 portal 正向 + scope 筆數 + H#3 + 反向守衛）

**Files:** 無（純驗證，controller 執行）。

> 提醒：dev server 長 session HMR 後 MSW 失同步（404 / SPA fallback）→ hard reload 恢復，非 bug。

- [ ] **Step 1: preview_start → 登入 supplier**

- [ ] **Step 2: 正向渲染（切 merchant）**
  - `switchPortal('merchant')` → 點「商戶專區 / 商戶資料」→ 顯示 Golden Dragon 自己那筆基本資訊。
  - 點「API 與錢包」→ apiKey/secretKey 預設遮罩 `••••`；點眼睛 → 顯示明文（`SensitiveValue`）。
  - 點「子帳號」→ 4 筆（Golden Dragon 的）。

- [ ] **Step 3: 正向渲染（切 agent）**
  - `switchPortal('agent')` → 「代理專區 / 佣金報表」→ DataTable 渲染，筆數 = Asia Master 線（3 筆）。
  - 「子帳號」→ 3 筆（Asia Master 的）。

- [ ] **Step 4: scope 筆數驗證（console 對照）**
  在 console 比對 supplier vs portal 筆數（直接打端點＋帶各身份 token，或用 UI 切換後讀）：
  - `/api/agents/v2/commissions`：supplier=6、agent=3。
  - `/api/sub-accounts/v2/list`：supplier=9、agent=3、merchant=4。

- [ ] **Step 5: H#3 驗證**
  - 在 agent portal 點共用條目（如「商戶列表」「代理報表」「商戶設定」）→ URL 變 `/agent/merchants`、`/agent/reports/agents`、`/agent/merchants/settings`，**頁面正常渲染（無死連結）**、topbar 仍「代理後台」、`portalStore.currentType` 仍 `agent`（未退回 supplier）。
  - merchant portal 同樣抽查含 sub-page（如「告警列表」→ `/merchant/risk/alerts`）。
  - 確認切回 supplier 僅能透過 Topbar 切換器。

- [ ] **Step 6: 反向守衛仍在（/403）**
  沿用 Spec 1 手法：`syncPortal('agent')` → `perm.switchRole('role-merchant-user')`（缺 commissions.view）→ `location.hash='#/agent/commissions'` → 同 portal 不 re-sync → 導 `/403`。

- [ ] **Step 7: 截圖存證 + console 無 error**
  preview_screenshot：(a) merchant 商戶資料；(b) merchant API錢包（遮罩態）；(c) agent 佣金報表；(d) 子帳號；(e) H#3 前綴 URL 一例；(f) /403。`preview_console_logs level=error` 應無。

- [ ] **Step 8: 無 commit**（純驗證；發現 bug 回對應 task 修正後重跑）

---

## Self-Review 結果

- **Spec 覆蓋**：§3.1 self-view→Task1/2；§3.2 commissions→Task3；§3.3 sub-accounts→Task4；§二 H#3→Task5；§三/四 文件→Task6；§六 驗證→Task7。刪佔位頁→Task4 Step5。✓ 全覆蓋。
- **Placeholder 掃描**：各頁皆附完整 `<script setup>` + template；handler 附完整 seed；H#3 附 17 筆 def 全文。無 TODO/占位。
- **型別 / 命名一致**：`MerchantRow`/`CommissionRow`/`SubAccountRow` 跨 handler 與頁面一致；端點路徑 `/api/agents/v2/commissions`、`/api/sub-accounts/v2/list` 跨 handler/頁面/文件一致；scope key（agentKey:`agent`/merchantKey:`merchant`/`code`）與 C1 `scopeRows` 契約一致；route `permission`/`titleKey` 與 Spec 1 既有 key 一致。
- **H#3 安全**：不補 supplier `meta.portal`（Task5 Step1 明示），前綴路由帶 `meta.portal` → token 恆 scoped、無逃逸；擴 SHARED_DEFS 消死連結；§二取捨/否決方案已記。

## 明確不做（重申）

- 不做 H#1 backtick/window.fetch→api.* 大遷移。
- 不全面啟用 canSeeField（API錢包用路由級權限 + UI 遮罩）。
- 不改 C1 pass-through 報表/聚合端點為真 scope。
- 不補 supplier meta.portal（H#3 用擴 SHARED_DEFS + 前綴轉換）。
- 不 merge / push / deploy；不併入 RouteMeta 型別 chip。

## 執行交接

實作回合用 superpowers:subagent-driven-development：每 task implementer → spec 審 → code-quality 審 → build + vue-tsc；關鍵頁（Task 7）controller 瀏覽器實證。Task 1→7 線性。
