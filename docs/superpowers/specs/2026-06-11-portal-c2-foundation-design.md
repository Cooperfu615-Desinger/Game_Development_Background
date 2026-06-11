# Phase C2 — Spec 1「Portal 地基」設計 Spec

**日期**：2026-06-11
**分支**：`feat/phase-c2-portal-foundation`（自 main `0b912d9` 開）
**範圍**：C2 拆兩份 spec；本文件只設計 **Spec 1（地基／鋪線）**，**不含 Spec 2 任何頁面內容、不新增 MSW 端點 / seed**。
**前置**：C1（Portal/Scope/Permission 架構地基）已 SHIPPED（merge `6a2ca81`）。

---

## 一、目的

C1 已把「身份 → token → apiClient → MSW scope → 路由/選單 RBAC」這條線鋪好，並讓**共用頁**在 `/agent/*` `/merchant/*` 前綴下可達。但「Portal 專屬頁」這條支線只到一半：

- `buildMenuForPortal` 只會「**過濾** supplier 完整選單」，無法 append 各 Portal 專屬條目。
- `portalRoutes` factory 不會帶 `meta.permission`，C1 的 `/403` 守衛機制因此**從未被任何頁面啟用**。
- `apiClient` 缺 `patch`（C1 H#1 記載）。
- supplier 路由無 `meta.portal`，切回 supplier 時 portal 狀態不會復位（C1 H#3 的一半）。

**Spec 1 目標**：把上述四點補齊，讓「**選單條目 → 前綴路由 → 權限守衛 → 頁面**」這條鏈在三 Portal 下完整且可驗證地跑起來——但路由先指向**佔位頁**，真實頁面內容留給 Spec 2。

### 目標（Goals）

1. `apiClient.patch`：補上唯一缺的 HTTP 動詞（收 C1 H#1 半個缺口，與大遷移無關）。
2. `buildMenuForPortal` 升級為「**過濾 + append Portal 專屬條目**」。
3. `MOCK_ROLES` 新增 Portal 專屬 permission key，掛到 agent / merchant 角色。
4. `portalRoutes` factory 支援 `meta.permission`；新增「Portal 專屬路由 defs」餵同一 factory；**首次啟用** C1 的 `/403` 守衛。
5. supplier 路由補 `meta.portal='supplier'`（收 C1 H#3 半個缺口）。
6. 一個共用**佔位頁**元件，讓上述鏈在 build + 瀏覽器皆可驗證。

### 非目標（Non-Goals，屬 Spec 2 或之後）

- Spec 2 任何頁面實作內容（佣金報表、子帳號、商戶資料、API錢包 等真實 UI / 資料）。
- 任何新 MSW 端點 / seed。
- C1 H#1 的 backtick / `window.fetch` → `api.*` 大遷移（接真後端開驗章前再單獨一票；mock 不會 401）。
- C1 H#3 的另一半：把**共用頁**選單連結從絕對 supplier 路徑改成前綴路徑（留 Spec 2）。
- merge / push main / 部署（皆由人決定）。

---

## 二、Spec 1 鋪的「Portal 專屬頁」清單（只佔位，不放內容）

| Portal | 專屬頁（佔位） | 前綴路由 | titleKey | meta.permission |
|---|---|---|---|---|
| agent | 佣金報表 | `/agent/commissions` | `menu.commissions` | `commissions.view` |
| agent | 子帳號 | `/agent/sub-accounts` | `menu.subAccounts` | `sub-accounts.view` |
| merchant | 商戶資料 | `/merchant/profile` | `menu.merchantProfile` | `merchant-profile.view` |
| merchant | API錢包 | `/merchant/api-wallet` | `menu.apiWallet` | `api-wallet.view` |
| merchant | 子帳號 | `/merchant/sub-accounts` | `menu.subAccounts` | `sub-accounts.view` |

> merchant 風控（告警）群組在 C1 的 `MERCHANT_ALLOW` 已含 `riskGroup`（指向既有共用 risk 頁），**Spec 1 不新增**。

**全部 5 條前綴路由的 `component` 一律指向同一個佔位頁** `PortalPagePlaceholder.vue`。Spec 2 時逐條把 `component` 換成真實頁，再刪佔位頁。

---

## 三、模組設計（逐點）

### 3.1 `apiClient.patch` — `src/services/apiClient.ts`

`request()` 已支援帶 body 的任意 method，只缺對外的 `patch` 包裝。新增一行：

```ts
export const api = {
    get: <T = unknown>(path: string) => request<T>('GET', path),
    post: <T = unknown>(path: string, body?: unknown) => request<T>('POST', path, body),
    put: <T = unknown>(path: string, body?: unknown) => request<T>('PUT', path, body),
    patch: <T = unknown>(path: string, body?: unknown) => request<T>('PATCH', path, body),
    del: <T = unknown>(path: string) => request<T>('DELETE', path),
}
```

> 本 Spec **只補方法、不遷移呼叫端**。現存唯一 PATCH 仍是原生 fetch（H#1 大遷移留待之後）。

### 3.2 佔位頁 — `src/views/_Placeholder/PortalPagePlaceholder.vue`

單一共用元件，被 5 條 Portal 專屬路由共用。職責：

- 讀 `route.meta.title`（i18n key）顯示頁名，證明「路由 → 頁面」生效。
- 顯示 portal（`route.meta.portal`）與「此頁將於 Phase C2 Spec 2 實作」字樣。
- 純展示、無資料抓取、無 store 依賴（避免引入 Spec 2 內容）。

採 demo-pages.css / PrimeVue 既有風格的簡單卡片即可（設計系統見 memory `project-design-system`）。Spec 2 換真頁時刪除本元件目錄。

### 3.3 Portal 專屬 permission key — `src/stores/permission.ts`

命名沿用既有 `<module>.<action>` 風格（`PermissionKey = string`，loose，**不需改型別**）。在 `MOCK_ROLES` 修改：

- `role-agent-user`：已有 `commissions.view`（**確認即可**）；**新增** `sub-accounts.view`。
- `role-merchant-user`：**新增** `merchant-profile.view`、`api-wallet.view`、`sub-accounts.view`。

其餘角色不動。`role-super-admin` 是 `['*']`，自動涵蓋新 key。

**為何 supplier（super-admin）也能過**：`hasPermission` 對 `'*'` 回 true，所以 supplier 訪問任何 Portal 專屬路由都會被 syncPortal 切成對應角色後再判，或以 `'*'` 通過——見 §4 驗證。

### 3.4 `portalRoutes` factory 支援 `meta.permission` — `src/router/portalRoutes.ts`

`PortalRouteDef` 加可選 `permission`，factory 在有值時把它放進 `meta`：

```ts
interface PortalRouteDef {
    path: string
    name: string
    component: () => Promise<unknown>
    titleKey: string
    permission?: string          // ← 新增：有值才設 meta.permission
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

向下相容：SHARED_DEFS 沒有 `permission`，產出的 meta 與 C1 完全相同。

### 3.5 Portal 專屬路由 defs — `src/router/index.ts`

比照 `SHARED_DEFS`，新增**各 Portal 各一份**專屬 defs（因 agent / merchant 專屬頁不同），全部指向佔位頁：

```ts
import PortalPagePlaceholder from '@/views/_Placeholder/PortalPagePlaceholder.vue'
const placeholder = () => import('@/views/_Placeholder/PortalPagePlaceholder.vue')

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

children 內展開（與既有 `portalRoutes('agent'/'merchant', SHARED_DEFS)` 並列，合併同 portal）：

```ts
...portalRoutes('agent', [...SHARED_DEFS, ...AGENT_ONLY_DEFS]),
...portalRoutes('merchant', [...SHARED_DEFS, ...MERCHANT_ONLY_DEFS]),
```

> 路由 `name` 由 factory 加 portal 前綴（`agent-sub-accounts` / `merchant-sub-accounts`），故兩個 `sub-accounts` 不衝突。

### 3.6 supplier 路由補 `meta.portal`（C1 H#3 半修）— `src/router/index.ts`

不逐一改 ~50 條 supplier 子路由，而是在 **MainLayout 父路由**設一次：

```ts
{
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    meta: { requiresAuth: true, portal: 'supplier' },   // ← 加 portal
    children: [ ... ]
}
```

**vue-router meta 合併語意**：`to.meta` 由 matched 陣列（父→子）合併，子記錄同 key 覆蓋父。故：

- supplier 子路由（無自帶 portal）→ 繼承父的 `portal: 'supplier'`。
- agent/merchant 前綴路由（factory 設 `portal: 'agent'/'merchant'`）→ 覆蓋父 → 仍是各自 portal。

效果：導到任何 supplier 頁時 `to.meta.portal==='supplier'`，`beforeEach` 會 `syncPortal('supplier')` 復位身份/角色，解決 sticky-portal（切回 supplier 不再卡在前一個 portal）。

> **已知行為變更（在範圍內、需 reviewer 知悉）**：agent/merchant 選單中的**共用頁條目**目前仍是絕對 supplier 路徑（如 `/merchants`，H#3 另一半）。補完 supplier `meta.portal` 後，從 agent/merchant 點這些共用條目會 `syncPortal('supplier')`、復位成 supplier。這正是「絕對 supplier 路徑＝supplier 語境」的一致解讀；把共用條目改指前綴路徑屬 Spec 2。

### 3.7 `buildMenuForPortal` 升級為「過濾 + append」— `src/config/menu-sakai.ts`

維持既有「群組 key 白名單過濾」，於過濾結果後 **append 各 Portal 專屬群組**（連結用前綴路徑）：

```ts
function agentPortalGroups(t: Composer['t']): MenuGroup[] {
    return [{
        key: 'agentSelf',
        label: t('menu.agentGroup'),   // 沿用既有「代理管理」群組標籤
        items: [
            { label: t('menu.commissions'), icon: 'pi pi-fw pi-percentage', to: '/agent/commissions' },
            { label: t('menu.subAccounts'), icon: 'pi pi-fw pi-users', to: '/agent/sub-accounts' },
        ],
    }]
}

function merchantPortalGroups(t: Composer['t']): MenuGroup[] {
    return [{
        key: 'merchantSelf',
        label: t('menu.merchantGroup'),  // 沿用既有「商戶管理」群組標籤
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

> 群組標籤沿用既有 i18n（`menu.agentGroup`/`menu.merchantGroup`），只新增**葉節點**標籤 key。新群組 `key`（`agentSelf`/`merchantSelf`）不在 ALLOW 白名單也無妨——它們是 append 上去的，不經過濾。

### 3.8 新增 i18n key — `src/locales/{zh-TW,en}.json`

`menu` 區塊新增 4 個 key（兩語系都加）：

| key | zh-TW | en |
|---|---|---|
| `menu.commissions` | 佣金報表 | Commissions |
| `menu.subAccounts` | 子帳號 | Sub-Accounts |
| `menu.merchantProfile` | 商戶資料 | Merchant Profile |
| `menu.apiWallet` | API 與錢包 | API & Wallet |

`common` 區塊新增佔位頁文案 1 個 key（兩語系）：

| key | zh-TW | en |
|---|---|---|
| `common.c2Placeholder` | 此頁面將於 Phase C2 Spec 2 實作 | This page will be implemented in Phase C2 Spec 2 |

---

## 四、佔位頁怎麼處理 & 鏈如何驗證（回應上層提問）

**佔位頁策略**：5 條 Portal 專屬路由全部指向同一個 `PortalPagePlaceholder.vue`。它顯示 `meta.title`（頁名）＋ portal ＋ `common.c2Placeholder`。好處：(a) 單檔、零依賴、build 穩；(b) 讓「路由 → 頁面」可見；(c) Spec 2 只需逐條換 `component`、刪此檔，無需動 factory / 守衛 / 選單。

**鏈：選單 → 路由 → 權限守衛 → 頁面 的驗證方法**

1. **build / 型別**：
   - `node node_modules/vite/bin/vite.js build`（須見 `✓ built in`，無 error）
   - `node node_modules/vue-tsc/bin/vue-tsc.js --noEmit`（exit 0）

2. **瀏覽器正向（守衛 PASS 路徑）**：preview → 登入（supplier）→ Topbar 切 **agent**：
   - 選單出現「佣金報表 / 子帳號」；點之 → URL `#/agent/commissions`、`#/agent/sub-accounts`，佔位頁渲染、頁名正確、Topbar 身份 Asia Master、console 無 error（agent 角色有 `commissions.view`/`sub-accounts.view`，守衛放行）。
   - 切 **merchant**：選單出現「商戶資料 / API與錢包 / 子帳號」；點之 → `#/merchant/profile`、`#/merchant/api-wallet`、`#/merchant/sub-accounts` 佔位頁渲染（merchant 角色有對應 3 個 key）。
   - 切回 **supplier**：因 supplier `meta.portal` 已補，身份/選單復位為 supplier 完整版（驗 H#3 半修）。

3. **瀏覽器反向（守衛 DENY 路徑，證明 `/403` 真的會擋）**：
   利用 C1 既成事實——`beforeEach` 只在 `currentType !== portalMeta` 時才 `syncPortal`（**同 portal 內導航不會重置角色**）。在 console：
   ```js
   const portal = usePortalStore(); const perm = usePermissionStore()
   portal.syncPortal('agent')              // currentType='agent'、role=agent-user
   perm.switchRole('role-merchant-user')   // 強制成「缺 commissions.view」的角色；currentType 仍 'agent'
   location.hash = '#/agent/commissions'   // portalMeta==='agent'===currentType → 不 re-sync → 角色維持 merchant-user
   // 預期：hasPermission('commissions.view') 為 false → next('/403') → 導向 403 頁
   ```
   看到 `/403` 即證明守衛的 deny 分支被真正啟用。

   > （若無法在 console 直接拿到 `usePortalStore`/`usePermissionStore`，改用既有暴露方式或 `app.config.globalProperties`；驗證概念不變：同 portal + 強制缺權角色 → `/403`。）

---

## 五、檔案清單

**新增**
- `src/views/_Placeholder/PortalPagePlaceholder.vue`

**修改**
- `src/services/apiClient.ts`（+`patch`）
- `src/stores/permission.ts`（agent/merchant 角色 +新 key）
- `src/router/portalRoutes.ts`（`PortalRouteDef.permission` + meta）
- `src/router/index.ts`（AGENT/MERCHANT_ONLY_DEFS + 展開 + MainLayout `meta.portal`）
- `src/config/menu-sakai.ts`（過濾 + append 專屬群組）
- `src/locales/zh-TW.json`、`src/locales/en.json`（+5 key）

**不動**：`mockToken.ts`、`scope.ts`、`portal.ts`、`auth.ts`（皆已就緒，本 Spec 只依賴不修改）。

---

## 六、風險與緩解

| 風險 | 緩解 |
|---|---|
| 兩個 `sub-accounts` route 同名衝突 | factory 加 portal 前綴（`agent-sub-accounts` / `merchant-sub-accounts`），不衝突 |
| MainLayout 加 `meta.portal` 誤改 agent/merchant 前綴頁的 portal | vue-router 子覆蓋父，前綴頁 factory 已自帶 portal，覆蓋父值；已於 §3.6 論證 |
| supplier `meta.portal` 改變共用頁選單點擊行為 | 在範圍內的預期改變，§3.6 已標註；共用條目改前綴路徑屬 Spec 2 |
| 守衛 deny 路徑在 app 內因 auto-sync 難觸發 | §4 反向驗證利用「同 portal 不 re-sync」精準觸發 `/403`，不需改 C1 行為 |
| 新增 menu key 漏某語系 → 顯示 raw key | Task 內兩語系同步加，build 後瀏覽器抽查標籤為中文/英文非 key |
| 佔位頁引入 Spec 2 依賴 | 佔位頁限定純展示、零 store / 零 fetch；§3.2 約束 |

---

## 七、Spec 1 / Spec 2 邊界

- **Spec 1（本文件）**：鋪線——`patch`、選單 append、權限 key、`meta.permission` 守衛首啟、Portal 專屬路由（指佔位頁）、supplier `meta.portal`。產物：可 build、可瀏覽器驗證的完整「選單→路由→守衛→佔位頁」鏈。
- **Spec 2（後續）**：把 5 個佔位頁換成真實頁（佣金報表 / 子帳號 / 商戶資料 / API錢包），含所需新 MSW 端點 / seed / scope；並（視需要）把共用頁選單連結改前綴路徑（H#3 另一半）。
