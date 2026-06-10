# 前端交接文件（Phase C1：Portal / Scope / Permission 架構）

本文件給接手前端、並準備換上真實後端的工程師。涵蓋架構接縫、API client 用法、頁面取數模式、Portal 切換、權限機制、換真後端步驟、路由 factory 用法與已知限制。

語言：TypeScript + Vue 3 `<script setup>` + Pinia + vue-router（hash 模式）+ MSW（mock 後端）。

---

## 1. 架構接縫圖

C1 的核心是「身份 → token → 請求 → scope 過濾」的一條線，加上路由與選單層的 RBAC：

```
                 使用者
                   │ 點 Topbar Portal 切換器（PrimeVue Select）
                   ▼
        portalStore.switchPortal(type)
                   │  syncPortal(type)：
                   │   ├─ authStore.applyMockIdentity(type)  → 重新簽發 token
                   │   └─ permissionStore.switchRole(role)    → 切換 RBAC 角色
                   ▼
        authStore.token  (mock JWT，內含 portal / role / dataScope / actorId / actorName)
                   │
                   ▼
   api.get/post/put/del  (src/services/apiClient.ts)
                   │  自動附 Authorization: Bearer <token>
                   ▼
        fetch(path)  ──────────────►  MSW handler（攔截 /api/*）
                                             │  scopeRows(request, rows, keys)
                                             │   讀 Authorization → decodeToken
                                             │   依 dataScope 過濾資料列
                                             ▼
                                       回傳已過濾的 JSON
                   ◄─────────────────────────┘
                   ▼
              頁面 reactive rows

   ── 另一條平行線：路由守衛 + 選單 RBAC ──
   router.beforeEach:
     1) 驗證 requiresAuth
     2) to.meta.portal ≠ 目前 portal → portalStore.syncPortal(meta)（不導頁）
     3) to.meta.permission 存在且 !hasPermission(need) → redirect /403
   選單 / 按鈕層：usePermissionStore().hasPermission(key) 決定顯示與否
```

關鍵：**整條鏈上「換真後端」只會動到 `apiClient.ts` 一個檔**（base URL + token 來源）。scope 過濾在 C1 由 MSW 的 `scope.ts` 模擬，正式環境改由後端負責。

---

## 2. API client 用法（`src/services/apiClient.ts`）

```ts
import { api } from '@/services/apiClient'
```

四個方法：

| 方法 | 簽章 | 說明 |
|---|---|---|
| `api.get` | `api.get<T>(path): Promise<T>` | GET |
| `api.post` | `api.post<T>(path, body?): Promise<T>` | POST，body 自動 JSON 序列化 |
| `api.put` | `api.put<T>(path, body?): Promise<T>` | PUT，body 自動 JSON 序列化 |
| `api.del` | `api.del<T>(path): Promise<T>` | DELETE |

行為：

- 當 `authStore.token` 存在時，自動附 `Authorization: Bearer <token>`。
- `post` / `put` 自動設定 `Content-Type: application/json` 並 `JSON.stringify(body)`。
- 非 2xx 會 `throw new Error(...)`。
- 解析 JSON；空 body 回傳 `null`。
- `useAuthStore()` 在 request function「內部」呼叫，避免 Pinia 尚未初始化的問題（Pinia-safe）。
- `api.get<T>(path)` 的回傳，等同於遷移前 `await res.json()` 的回傳——遷移是「行為不變」的。

範例：

```ts
// 讀取列表
const list = await api.get<MerchantRow[]>('/api/merchants/v2/list')

// 建立資源
const created = await api.post<ApiKey>('/api/settings/api-keys', { label: '新金鑰' })

// 刪除
await api.del('/api/settings/api-keys/key-001')
```

> 注意：`api.put` / `api.del` 目前在程式庫中**尚未被使用**（C1 未遷移 mutation）；`apiClient` 也**沒有 `patch` 方法**（唯一的 PATCH 呼叫仍是原生 fetch）。詳見第 8 節已知限制。

---

## 3. 頁面取數模式範本

C1 遷移後，頁面取數模式維持不變，只是把 `fetch().then(r => r.json())` 換成 `api.get`：

```ts
const rows = reactive<XxxRow[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const data = await api.get<XxxRow[]>('/api/xxx/v2/list')
    rows.splice(0, rows.length, ...data)
  } finally {
    loading.value = false
  }
})
```

`reactive` 陣列以 `splice(0, length, ...data)` 原地替換，保留既有 reactivity 參考。

---

## 4. Portal 切換（`src/stores/portal.ts`）

有兩個函式，差別在於「是否導頁」：

### `switchPortal(type)` — 使用者主動切換

1. 呼叫 `syncPortal(type)`（更新身份 / token / 角色）。
2. 導向該 portal 的首頁：
   - supplier → `/dashboard`
   - agent / merchant → `/${type}/dashboard`

Topbar 切換器（`AppTopbar.vue`）透過 PrimeVue `Select` 的 `@update:model-value` 呼叫 `switchPortal`。

### `syncPortal(type)` — 不導頁

僅同步狀態，不做任何導航：

1. 設定 `currentType`。
2. 透過 `authStore.applyMockIdentity(type)` 重新簽發 token。
3. 透過 `permissionStore.switchRole(PORTAL_IDENTITIES[type].role)` 切換角色。

### 為何 `beforeEach` 用 `syncPortal` 而非 `switchPortal`

深連結（deep-link）場景：使用者直接打開 `/agent/merchants`。此時若呼叫 `switchPortal`，它會再次 `router.push` 到 portal 首頁，把使用者「彈走」離開原本想去的頁。`syncPortal` 只更新身份不導頁，使深連結能正確停在目標頁。因此路由守衛一律用 `syncPortal`。

---

## 5. 權限（`src/stores/permission.ts`）

`usePermissionStore()` 暴露的 RBAC API（**這就是真正的 helper**）：

| 成員 | 型別 | 說明 |
|---|---|---|
| `permissions` | `computed<PermissionKey[]>` | 目前角色的權限清單 |
| `dataScope` | `computed<DataScope>` | 目前角色的資料範圍 |
| `hasPermission(key)` | `(key) => boolean` | 單一權限判斷，處理 `'*'` 萬用字元 |
| `hasAnyPermission(keys)` | `(keys) => boolean` | 任一符合 |
| `hasAllPermissions(keys)` | `(keys) => boolean` | 全部符合 |
| `switchRole(roleId)` | `(roleId) => void` | 切換角色 |
| `currentRole` | `computed<Role>` | 目前角色物件 |

按鈕 / 欄位層 gating 範例：

```ts
const perm = usePermissionStore()
const canCreate = computed(() => perm.hasPermission('merchants.create'))
```

> spec 曾提到的 `can()` helper **並未加入**；`hasPermission` 就是該 helper。日後若想要更短的別名，可加一層 `can` 薄包裝，但目前請直接用 `hasPermission`。

### 路由層權限機制（`meta.permission`）

路由守衛已備好機制：若 `to.meta.permission` 有值且 `!hasPermission(need)` → 導向 `/403`（`views/Error/403.vue`）。

**C1 並未在任何共用頁設定 `meta.permission`** —— 機制已就緒、但尚未啟用。C2 起可在路由 def 上加 `meta.permission` 來開啟頁面層 gating。

---

## 6. 換真後端步驟

1. **改 `src/services/apiClient.ts`**：
   - 設定真實 API base URL（把 `fetch(path)` 改為 `fetch(BASE_URL + path)` 或注入環境變數）。
   - 把 token 來源從 mock token 改為真實登入流程取得的 JWT（`authStore.token` 的賦值來源）。
2. **移除 MSW**：拿掉 `src/mocks/browser.ts` 的啟動程式碼（通常在 `main.ts` 的開發啟動分支）。
3. **scope 改由後端負責**：`src/mocks/scope.ts` 是模擬，正式環境刪除其攔截路徑，由後端依 token 的 `dataScope` 做資料過濾（規則見 `backend.md`）。
4. **完成剩餘 token 遷移（重要）**：把所有仍用原生 `fetch(\`...\`)`（template literal）的呼叫，改為 `api.*`，否則啟用真 auth 後它們會 401。完整清單見第 8 節已知限制 H#1。
   - 其中包含的 PATCH 呼叫需要在 `apiClient` 補上 `patch` 方法（目前不存在）。

只要前三步做完，整條請求鏈上其餘程式碼都不需要改動。

---

## 7. 路由 factory 用法（`src/router/portalRoutes.ts` + `src/router/index.ts`）

`portalRoutes(portal, defs)` 是一個 factory：把「共用頁定義」映射成帶 portal 前綴的路由。

對每個 def 產出：

```ts
{
  path: `${portal}/${path}`,
  name: `${portal}-${name}`,
  meta: { title, portal, requiresAuth: true },
  component,
}
```

`SHARED_DEFS` 是 8 個共用頁定義（dashboard, merchants, games, orders, transactions, reports, settlements, risk）。它們在 `MainLayout` 的 children 中對 `'agent'` 與 `'merchant'` 各展開一次，於是 `/agent/*` 與 `/merchant/*` **共用同一批元件**。supplier 維持無前綴路由。`meta.portal` 驅動 portal 同步。

### 新增一個 portal 共用頁（C2）

在 `SHARED_DEFS` 加一筆 def，factory 會自動為 agent 與 merchant 兩個前綴各產生路由。

### 新增 portal 專屬頁

不要放進 `SHARED_DEFS`；改在該 portal 的 children 後面附加「只屬於該 portal」的路由即可。

---

## 8. 已知限制

### H#1 — Token 覆蓋缺口（最重要）

C1 只遷移了**單引號** `fetch('/api…')` 的呼叫（共 43 處、跨 38 檔）到 `api.*`，因此**只有這些呼叫會帶 bearer token**。其餘以 **template literal** `fetch(\`...\`)` 寫成的呼叫刻意排除在 C1 範圍外，仍呼叫原生 `fetch`（**不帶 token**）。這不只含 mutation，也含部分 GET 讀取：

- `useAggregators.fetchAggregators` + `toggleStatus`（PATCH）
- `usePlayerAnalytics.fetchOverview` / `fetchPlayers`
- `usePlatforms`、`usePlatformDetail`、`useAggregatorDetail`
- `useFinance`（使用 `window.fetch`）
- mutation 類如 `ApiKeys` 的 DELETE

對 mock 後端無害（MSW 不檢查 token），但**啟用真 auth 前，這些每一處都必須遷移到 `api.*`，否則會 401**。其中 PATCH 呼叫需先在 `apiClient` 補 `patch` 方法（目前不存在）。

### H#2 — Mock token 不是真 auth

base64 明文 payload，簽章是字面值 `mocksig`，從不驗證。正式環境由後端發放並驗證真 JWT。

### H#3 — Sticky portal 與選單絕對路徑

supplier 路由不帶 `meta.portal`，因此「目前 active portal」會一直維持，直到再次使用 Topbar 切換器。側邊選單連結是**絕對的 supplier 路徑**（例如 `/merchants` 而非 `/agent/merchants`）：點它會留在目前 portal（token 仍是當前身份），但 URL 前綴會被丟掉。C2 可把選單連結改指向帶前綴的路徑。

### H#4 — Aggregate 端點的 scope 為 best-effort

reports、dashboard 等聚合端點在 mock 中是 pass-through / best-effort；正式後端必須依 scope 重新計算聚合結果（見 `backend.md`）。

### H#5 — 無單元測試框架

本專案刻意不引入單元測試框架。驗證方式為 `vite build` + 完整 `vue-tsc --noEmit` + 瀏覽器手動抽查。

---

相關文件：scope 過濾規則的權威定義見 `backend.md`；端點 × 權限 × scope 的總表見 `api-contract.md`。
