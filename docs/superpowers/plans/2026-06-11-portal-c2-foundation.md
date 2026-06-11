# Phase C2 — Spec 1「Portal 地基」Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 C2「Portal 專屬頁」這條支線的地基鋪完整——補 `apiClient.patch`、選單能 append Portal 專屬條目、新增 Portal 專屬 permission key、首次啟用 `meta.permission` 守衛、Portal 專屬路由（指向佔位頁）、supplier 補 `meta.portal`——讓「選單 → 路由 → 守衛 → 頁面」鏈在三 Portal 完整且可驗證。**不放任何 Spec 2 頁面內容。**

**Architecture:** 站在 C1 既成接縫上。`portalRoutes(portal, defs)` factory 擴充支援 `meta.permission`；新增 `AGENT_ONLY_DEFS`/`MERCHANT_ONLY_DEFS`（全指向共用佔位頁）餵同一 factory；`buildMenuForPortal` 改為「過濾 + append」；`MOCK_ROLES` 加 Portal 專屬 key；supplier 在 MainLayout 父路由補一次 `meta.portal`，靠 vue-router 子覆蓋父讓前綴頁不受影響。

**Tech Stack:** Vue 3 + TS + Pinia + vue-router(hash) + PrimeVue + MSW + Vite。**本專案無單元測試框架**。

**驗證指令（全程通用）：**
```bash
node node_modules/vite/bin/vite.js build > /tmp/build.log 2>&1; tail -3 /tmp/build.log    # 須見 "✓ built in"，無 error
node node_modules/vue-tsc/bin/vue-tsc.js --noEmit; echo "tsc exit: $?"                      # 須 exit 0
```

**分支：** `feat/phase-c2-portal-foundation`（spec 已 commit 在此分支）。

**執行順序與相依：** 1（patch，獨立）→ 2（佔位頁＋i18n）→ 3（權限 key）→ 4（factory＋路由＋supplier meta.portal）→ 5（選單 append）→ 6（全鏈瀏覽器驗證）。Task 4 依賴 2、3；Task 5 依賴 2、4；Task 6 依賴全部。

---

## 檔案結構

**新增**
- `src/views/_Placeholder/PortalPagePlaceholder.vue` — 5 條 Portal 專屬路由共用的佔位頁（純展示）

**修改**
- `src/services/apiClient.ts` — `api.patch`
- `src/locales/zh-TW.json` / `src/locales/en.json` — +4 menu key、+1 common key
- `src/stores/permission.ts` — agent/merchant 角色 +新 permission key
- `src/router/portalRoutes.ts` — `PortalRouteDef.permission` → meta
- `src/router/index.ts` — `AGENT_ONLY_DEFS`/`MERCHANT_ONLY_DEFS` + 展開 + MainLayout `meta.portal`
- `src/config/menu-sakai.ts` — `buildMenuForPortal` 過濾 + append

---

## Task 1: `apiClient.patch`

**Files:**
- Modify: `src/services/apiClient.ts:21-26`

- [ ] **Step 1: 在 api 物件加 patch**

把 `export const api = { ... }` 改為（在 `put` 與 `del` 之間插入 `patch`）：

```ts
export const api = {
    get: <T = unknown>(path: string) => request<T>('GET', path),
    post: <T = unknown>(path: string, body?: unknown) => request<T>('POST', path, body),
    put: <T = unknown>(path: string, body?: unknown) => request<T>('PUT', path, body),
    patch: <T = unknown>(path: string, body?: unknown) => request<T>('PATCH', path, body),
    del: <T = unknown>(path: string) => request<T>('DELETE', path),
}
```

> `request()` 已支援帶 body 的任意 method，無需改動。本步驟**只加方法、不遷移任何呼叫端**。

- [ ] **Step 2: build + tsc 驗證**

```bash
node node_modules/vite/bin/vite.js build > /tmp/build.log 2>&1; tail -3 /tmp/build.log
node node_modules/vue-tsc/bin/vue-tsc.js --noEmit; echo "tsc exit: $?"
```
預期：`✓ built in`、tsc exit 0。

- [ ] **Step 3: Commit**

```bash
git add src/services/apiClient.ts
git commit -m "feat(c2): apiClient.patch（補齊 HTTP 動詞，收 H#1 半個缺口）"
```

---

## Task 2: 佔位頁元件 + i18n key

**Files:**
- Create: `src/views/_Placeholder/PortalPagePlaceholder.vue`
- Modify: `src/locales/zh-TW.json`、`src/locales/en.json`

- [ ] **Step 1: 建立佔位頁**

`src/views/_Placeholder/PortalPagePlaceholder.vue`（純展示、零 store、零 fetch）：

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const { t } = useI18n()

const titleKey = computed(() => (route.meta.title as string | undefined) ?? '')
const pageTitle = computed(() => (titleKey.value ? t(titleKey.value) : ''))
const portal = computed(() => (route.meta.portal as string | undefined) ?? '')
</script>

<template>
    <div class="card flex flex-column align-items-center justify-content-center gap-3" style="min-height: 60vh">
        <i class="pi pi-wrench" style="font-size: 2.5rem; color: var(--text-color-secondary)" />
        <h2 class="m-0">{{ pageTitle }}</h2>
        <p class="m-0 text-color-secondary">{{ portal }} · {{ route.path }}</p>
        <p class="m-0 text-color-secondary">{{ t('common.c2Placeholder') }}</p>
    </div>
</template>
```

> 樣式沿用既有 PrimeVue / demo-pages.css utility class；若專案無 `card` class，改用最接近的容器 class（參考其他 view）。

- [ ] **Step 2: 加 menu i18n key（zh-TW）**

`src/locales/zh-TW.json` 的 `menu` 物件內，新增 4 個 key（接在任一既有 menu key 後，注意逗號）：

```json
"commissions": "佣金報表",
"subAccounts": "子帳號",
"merchantProfile": "商戶資料",
"apiWallet": "API 與錢包",
```

`common` 物件內新增：

```json
"c2Placeholder": "此頁面將於 Phase C2 Spec 2 實作",
```

- [ ] **Step 3: 加 menu i18n key（en）**

`src/locales/en.json` 的 `menu` 物件內：

```json
"commissions": "Commissions",
"subAccounts": "Sub-Accounts",
"merchantProfile": "Merchant Profile",
"apiWallet": "API & Wallet",
```

`common` 物件內：

```json
"c2Placeholder": "This page will be implemented in Phase C2 Spec 2",
```

- [ ] **Step 4: JSON 合法性 + build + tsc 驗證**

```bash
node -e "JSON.parse(require('fs').readFileSync('src/locales/zh-TW.json','utf8')); JSON.parse(require('fs').readFileSync('src/locales/en.json','utf8')); console.log('json ok')"
node node_modules/vite/bin/vite.js build > /tmp/build.log 2>&1; tail -3 /tmp/build.log
node node_modules/vue-tsc/bin/vue-tsc.js --noEmit; echo "tsc exit: $?"
```
預期：`json ok`、`✓ built in`、tsc exit 0。

- [ ] **Step 5: Commit**

```bash
git add src/views/_Placeholder/PortalPagePlaceholder.vue src/locales/zh-TW.json src/locales/en.json
git commit -m "feat(c2): Portal 專屬頁佔位元件 + 選單/佔位 i18n key（zh-TW/en）"
```

---

## Task 3: Portal 專屬 permission key

**Files:**
- Modify: `src/stores/permission.ts:68-93`（`role-agent-user` 與 `role-merchant-user` 的 `permissions`）

- [ ] **Step 1: 擴 agent / merchant 角色權限**

`role-agent-user` 的 `permissions` 陣列（原已含 `commissions.view`）改為：

```ts
        permissions: [
            'dashboard.view',
            'merchants.view',
            'reports.view',
            'commissions.view',
            'sub-accounts.view',
        ],
```

`role-merchant-user` 的 `permissions` 陣列改為：

```ts
        permissions: [
            'dashboard.view',
            'orders.view',
            'transactions.view',
            'reports.view',
            'settlements.view',
            'merchant-profile.view',
            'api-wallet.view',
            'sub-accounts.view',
        ],
```

> `PermissionKey = string`（loose），新增 key **不需改型別**。`role-super-admin` 的 `['*']` 自動涵蓋。其餘角色不動。

- [ ] **Step 2: build + tsc 驗證**

```bash
node node_modules/vite/bin/vite.js build > /tmp/build.log 2>&1; tail -3 /tmp/build.log
node node_modules/vue-tsc/bin/vue-tsc.js --noEmit; echo "tsc exit: $?"
```
預期：`✓ built in`、tsc exit 0。

- [ ] **Step 3: Commit**

```bash
git add src/stores/permission.ts
git commit -m "feat(c2): agent/merchant 角色新增 Portal 專屬 permission key"
```

---

## Task 4: portalRoutes factory 支援 permission + Portal 專屬路由 + supplier meta.portal

**Files:**
- Modify: `src/router/portalRoutes.ts:7-21`
- Modify: `src/router/index.ts:10-19`（SHARED_DEFS 區塊附近加 ONLY_DEFS）、`:29-33`（MainLayout meta）、`:377-378`（展開）

- [ ] **Step 1: factory 加 `permission`**

`src/router/portalRoutes.ts` 改為：

```ts
// src/router/portalRoutes.ts
// 前綴路由 factory：用同一批共用元件，產生 /agent/* /merchant/* 前綴路由，
// 差異由 meta.portal 表達。C2 起 def 可帶 permission → 啟用 meta.permission 守衛。
import type { RouteRecordRaw } from 'vue-router'
import type { PortalType } from '@/types/portal'

interface PortalRouteDef {
    path: string
    name: string
    component: () => Promise<unknown>
    titleKey: string
    permission?: string
}

export function portalRoutes(portal: PortalType, defs: PortalRouteDef[]): RouteRecordRaw[] {
    return defs.map((d) => ({
        path: `${portal}/${d.path}`,
        name: `${portal}-${d.name}`,
        component: d.component as RouteRecordRaw['component'],
        meta: {
            title: d.titleKey,
            portal,
            requiresAuth: true,
            ...(d.permission ? { permission: d.permission } : {}),
        },
    }))
}
```

> SHARED_DEFS 無 `permission`，產出 meta 與 C1 相同（向下相容）。

- [ ] **Step 2: 在 router/index.ts 加 Portal 專屬 defs**

`src/router/index.ts` 的 `SHARED_DEFS` 常數**之後**新增（共用佔位頁）：

```ts
const placeholder = () => import('@/views/_Placeholder/PortalPagePlaceholder.vue')

// Portal 專屬頁（Spec 1 指向佔位頁；Spec 2 換真實頁）
const AGENT_ONLY_DEFS = [
    { path: 'commissions', name: 'commissions', component: placeholder, titleKey: 'menu.commissions', permission: 'commissions.view' },
    { path: 'sub-accounts', name: 'sub-accounts', component: placeholder, titleKey: 'menu.subAccounts', permission: 'sub-accounts.view' },
]
const MERCHANT_ONLY_DEFS = [
    { path: 'profile', name: 'profile', component: placeholder, titleKey: 'menu.merchantProfile', permission: 'merchant-profile.view' },
    { path: 'api-wallet', name: 'api-wallet', component: placeholder, titleKey: 'menu.apiWallet', permission: 'api-wallet.view' },
    { path: 'sub-accounts', name: 'sub-accounts', component: placeholder, titleKey: 'menu.subAccounts', permission: 'sub-accounts.view' },
]
```

- [ ] **Step 3: MainLayout 父路由補 `meta.portal`**

`src/router/index.ts` 的 MainLayout 路由（`path: '/'`、`component: MainLayout`）：

```ts
    {
        path: '/',
        component: () => import('../layouts/MainLayout.vue'),
        meta: { requiresAuth: true, portal: 'supplier' },
        children: [
```

> vue-router 子覆蓋父：supplier 子頁繼承 `portal:'supplier'`；agent/merchant 前綴頁由 factory 自帶 portal，覆蓋父值。

- [ ] **Step 4: 展開 Portal 專屬路由**

`src/router/index.ts` children 內既有兩行：

```ts
            ...portalRoutes('agent', SHARED_DEFS),
            ...portalRoutes('merchant', SHARED_DEFS),
```

改為（合併共用頁 + 專屬頁）：

```ts
            ...portalRoutes('agent', [...SHARED_DEFS, ...AGENT_ONLY_DEFS]),
            ...portalRoutes('merchant', [...SHARED_DEFS, ...MERCHANT_ONLY_DEFS]),
```

- [ ] **Step 5: build + tsc 驗證**

```bash
node node_modules/vite/bin/vite.js build > /tmp/build.log 2>&1; tail -3 /tmp/build.log
node node_modules/vue-tsc/bin/vue-tsc.js --noEmit; echo "tsc exit: $?"
```
預期：`✓ built in`、tsc exit 0（兩個 `sub-accounts` 因 factory 加 portal 前綴而 route name 不衝突）。

- [ ] **Step 6: 路由註冊抽查（瀏覽器 console）**

preview → 登入後 console 執行（證明路由 + meta.permission 已註冊）：

```js
['/agent/commissions','/agent/sub-accounts','/merchant/profile','/merchant/api-wallet','/merchant/sub-accounts']
  .forEach(p => { const r = $router?.resolve?.(p) ?? null; console.log(p, r && r.meta) })
```
> 若 `$router` 不可得，改在後續 Task 6 用導航方式驗證。預期每條 meta 含 `portal` 與對應 `permission`。

- [ ] **Step 7: Commit**

```bash
git add src/router/portalRoutes.ts src/router/index.ts
git commit -m "feat(c2): portalRoutes 支援 meta.permission + Portal 專屬路由（佔位頁）+ supplier meta.portal"
```

---

## Task 5: `buildMenuForPortal` 過濾 + append 專屬條目

**Files:**
- Modify: `src/config/menu-sakai.ts:175-184`

- [ ] **Step 1: 新增 Portal 專屬群組 builder + 改 buildMenuForPortal**

`src/config/menu-sakai.ts` 檔末 `AGENT_ALLOW`/`MERCHANT_ALLOW` 與 `buildMenuForPortal` 區塊改為：

```ts
// 各 Portal 可見的共用選單群組（白名單過濾）
const AGENT_ALLOW = ['overview', 'merchantGroup', 'gameManagement', 'orderGroup', 'reportGroup']
const MERCHANT_ALLOW = ['overview', 'merchantGroup', 'gameManagement', 'orderGroup', 'reportGroup', 'riskGroup']

// Portal 專屬條目（連結用前綴路徑，指向 Spec 1 佔位頁 / Spec 2 真實頁）
function agentPortalGroups(t: Composer['t']): MenuGroup[] {
    return [{
        key: 'agentSelf',
        label: t('menu.agentGroup'),
        items: [
            { label: t('menu.commissions'), icon: 'pi pi-fw pi-percentage', to: '/agent/commissions' },
            { label: t('menu.subAccounts'), icon: 'pi pi-fw pi-users', to: '/agent/sub-accounts' },
        ],
    }]
}

function merchantPortalGroups(t: Composer['t']): MenuGroup[] {
    return [{
        key: 'merchantSelf',
        label: t('menu.merchantGroup'),
        items: [
            { label: t('menu.merchantProfile'), icon: 'pi pi-fw pi-id-card', to: '/merchant/profile' },
            { label: t('menu.apiWallet'), icon: 'pi pi-fw pi-wallet', to: '/merchant/api-wallet' },
            { label: t('menu.subAccounts'), icon: 'pi pi-fw pi-users', to: '/merchant/sub-accounts' },
        ],
    }]
}

export function buildMenuForPortal(t: Composer['t'], portal: PortalType): MenuGroup[] {
    const full = buildSakaiMenu(t)
    if (portal === 'supplier') return full
    const allow = portal === 'agent' ? AGENT_ALLOW : MERCHANT_ALLOW
    const filtered = full.filter((g) => g.key !== undefined && allow.includes(g.key))
    const extra = portal === 'agent' ? agentPortalGroups(t) : merchantPortalGroups(t)
    return [...filtered, ...extra]
}
```

> 群組標籤沿用既有 `menu.agentGroup`/`menu.merchantGroup`，只用 Task 2 新增的葉節點 key。新群組 `key` 不在 ALLOW 也無妨（append 不經過濾）。

- [ ] **Step 2: build + tsc 驗證**

```bash
node node_modules/vite/bin/vite.js build > /tmp/build.log 2>&1; tail -3 /tmp/build.log
node node_modules/vue-tsc/bin/vue-tsc.js --noEmit; echo "tsc exit: $?"
```
預期：`✓ built in`、tsc exit 0。

- [ ] **Step 3: Commit**

```bash
git add src/config/menu-sakai.ts
git commit -m "feat(c2): buildMenuForPortal 過濾 + append Portal 專屬選單條目"
```

---

## Task 6: 全鏈瀏覽器驗證（選單 → 路由 → 守衛 → 頁面）

**Files:** 無（純驗證）。

> 提醒：dev server 長 session 多次 HMR 後 MSW service worker 可能失同步（回 404 / SPA fallback），**hard reload 即恢復**，非程式 bug。

- [ ] **Step 1: 啟動 preview 並登入**

`preview_start` → 開站 → 登入（預設 supplier 身份）。

- [ ] **Step 2: 正向（守衛 PASS）— agent**

Topbar 切 **agent**：
- 選單底部出現專屬群組，含「佣金報表」「子帳號」（標籤為中文，非 raw key）。
- 點「佣金報表」→ URL `#/agent/commissions`，佔位頁渲染、標題「佣金報表」、顯示 `agent · /agent/commissions` 與佔位文案；Topbar 身份 Asia Master；console 無 error。
- 點「子帳號」→ `#/agent/sub-accounts` 佔位頁渲染。
（agent 角色具 `commissions.view`/`sub-accounts.view`，守衛放行。）

- [ ] **Step 3: 正向（守衛 PASS）— merchant**

Topbar 切 **merchant**：
- 專屬群組出現「商戶資料」「API 與錢包」「子帳號」。
- 逐一點 → `#/merchant/profile`、`#/merchant/api-wallet`、`#/merchant/sub-accounts` 佔位頁渲染、標題正確、console 無 error。
（merchant 角色具 `merchant-profile.view`/`api-wallet.view`/`sub-accounts.view`。）

- [ ] **Step 4: H#3 半修驗證 — 切回 supplier**

Topbar 切回 **supplier** → 自動導 supplier 首頁、選單復位為完整 supplier 版、Topbar 身份復位。再隨意點一個 supplier 頁，確認 portal 狀態維持 supplier（不卡在前一 portal）。

- [ ] **Step 5: 反向（守衛 DENY → /403）**

在 console（利用「同 portal 不 re-sync」精準觸發 deny）：

```js
const portal = usePortalStore(); const perm = usePermissionStore()
portal.syncPortal('agent')              // currentType='agent'、role=agent-user
perm.switchRole('role-merchant-user')   // 強制成缺 commissions.view 的角色；currentType 仍 'agent'
location.hash = '#/agent/commissions'   // portalMeta==='agent'===currentType → 不 re-sync → 角色維持 merchant-user
```
預期：因 `hasPermission('commissions.view') === false` → `next('/403')` → 畫面導向 `/403`。看到 403 頁即證明守衛 deny 分支已啟用。

> 若 console 取不到 `usePortalStore`/`usePermissionStore`，改用專案既有的 store 暴露管道（或 pinia devtools）操作；驗證概念不變。驗證後 hard reload 復位狀態。

- [ ] **Step 6: 截圖存證**

`preview_screenshot`：(a) agent 專屬選單 + 佣金佔位頁；(b) merchant 專屬選單 + 商戶資料佔位頁；(c) /403 deny 結果。

- [ ] **Step 7: 無 commit**

本 Task 純驗證，不產生程式碼變更。若驗證中發現 bug，回對應 Task 修正後重跑。

---

## Self-Review 結果

- **Spec 覆蓋**：§3.1 patch→Task1；§3.2 佔位頁→Task2；§3.8 i18n→Task2；§3.3 權限 key→Task3；§3.4 factory permission→Task4 Step1；§3.5 專屬 defs→Task4 Step2/4；§3.6 supplier meta.portal→Task4 Step3；§3.7 選單 append→Task5；§四 鏈驗證→Task6。✓ 全覆蓋。
- **Placeholder 掃描**：佔位頁是**刻意**的 Spec 1 產物（§3.2 約束純展示），非計畫 placeholder；其餘步驟皆附完整程式碼 / 指令。
- **型別 / 命名一致**：`PortalRouteDef.permission`、`AGENT_ONLY_DEFS`/`MERCHANT_ONLY_DEFS`、`placeholder`、`agentPortalGroups`/`merchantPortalGroups`、permission key（`commissions.view`/`sub-accounts.view`/`merchant-profile.view`/`api-wallet.view`）、i18n key（`menu.commissions`/`menu.subAccounts`/`menu.merchantProfile`/`menu.apiWallet`/`common.c2Placeholder`）跨 Task 一致。
- **風險**：兩個 `sub-accounts` 由 factory portal 前綴去重；MainLayout `meta.portal` 由 vue-router 子覆蓋父確保前綴頁不受影響；守衛 deny 用「同 portal 不 re-sync」精準觸發，皆已於 spec §六 列明。

## 明確不做（重申）

- 不做 Spec 2 任何頁面內容 / 新 MSW 端點 / seed。
- 不做 H#1 backtick / `window.fetch` → `api.*` 大遷移。
- 不把共用頁選單連結改前綴路徑（H#3 另一半，留 Spec 2）。
- 不 merge、不 push main、不部署。

## 執行交接

本回合**只到計畫**。實作回合用 superpowers:subagent-driven-development：每 Task 一個 subagent（implementer → spec 審 → code-quality 審 → build + vue-tsc），關鍵頁（Task 6）瀏覽器實證。Task 1→6 線性執行。
