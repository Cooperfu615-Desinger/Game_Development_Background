# 登入頁文件按鈕 + 交接文件檢視頁 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 登入頁快速登入列加「📚 交接文件」按鈕，另開新分頁顯示 docs/handoff/ 三份交接文件（左導覽、右 HTML 內容）。

**Architecture:** 新增免登入的頂層路由 `/docs/:slug?`（不掛 MainLayout），檢視頁用 `import.meta.glob` 在 build 時自動收錄 docs/handoff/*.md（lazy chunk），以 `marked` 轉 HTML 後 `v-html` 呈現。Spec：`docs/superpowers/specs/2026-06-11-login-docs-viewer-design.md`。

**Tech Stack:** Vue 3 + PrimeVue 4（Apple HIG preset）、vue-router 4（hash mode、base `/Game_Development_Background/`）、vue-i18n、新依賴 `marked`。

**驗證方式：** 本專案無單元測試（CLAUDE.md 既定），每個 task 以 `vue-tsc --noEmit` 把關，最後 task 統一 build + preview 抽查。

---

### Task 1: 安裝 marked 依賴

**Files:**
- Modify: `package.json`（npm 自動寫入）

- [ ] **Step 1: 安裝**

```bash
cd /Users/cooperfu/Desktop/Game_Development_Background
npm install marked
```

Expected: `package.json` dependencies 出現 `"marked": "^16.x"`（minor 版號以 npm 實際安裝為準），無 peer dependency 錯誤。

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat(docs-viewer): 加 marked 依賴（交接文件 md→html 渲染）"
```

---

### Task 2: i18n keys（兩語系）

**Files:**
- Modify: `src/locales/zh-TW.json`（`login` 區塊約 190 行起、`menu` 區塊約 61 行起）
- Modify: `src/locales/en.json`（`login` 區塊約 183 行起、`menu` 區塊約 61 行起）

- [ ] **Step 1: zh-TW 加 2 key**

`login` 區塊（在 `"subtitle"` 後加）：

```json
        "subtitle": "遊戲開發商管理後台",
        "docs": "📚 交接文件"
```

`menu` 區塊（在 `"dashboard"` 後加）：

```json
        "dashboard": "儀表板",
        "handoffDocs": "交接文件",
```

- [ ] **Step 2: en 加 2 key**

`login` 區塊（在 `"subtitle"` 後加）：

```json
        "subtitle": "Admin Management System",
        "docs": "📚 Handoff Docs"
```

`menu` 區塊開頭加：

```json
        "handoffDocs": "Handoff Docs",
```

- [ ] **Step 3: 驗證 JSON 合法**

```bash
node -e "JSON.parse(require('fs').readFileSync('src/locales/zh-TW.json','utf8')); JSON.parse(require('fs').readFileSync('src/locales/en.json','utf8')); console.log('OK')"
```

Expected: 輸出 `OK`。

- [ ] **Step 4: Commit**

```bash
git add src/locales/zh-TW.json src/locales/en.json
git commit -m "feat(docs-viewer): i18n key login.docs / menu.handoffDocs（zh-TW + en）"
```

---

### Task 3: 交接文件檢視頁

**Files:**
- Create: `src/views/Docs/Index.vue`

設計重點（spec §3–4）：
- `import.meta.glob<string>('../../../docs/handoff/*.md', { query: '?raw', import: 'default' })`
  — 相對路徑從 `src/views/Docs/` 回到專案根；lazy（不加 eager）→ 每份文件獨立 chunk。
- 已知三份固定標題與順序，未知檔案以檔名為標題、字母序排後。
- 單向資料流：導覽點擊 → `router.replace` 改 slug → `watch` route 載入渲染。
  無 slug / slug 不存在 → 顯示第一份、**網址不動**。
- 頁面 chrome 文字（載入中/失敗/側欄標題）硬編 zh-TW —— 文件內容本身即 zh-TW，
  spec §5 只要求按鈕與 meta.title 走 i18n。
- `v-html` 無 sanitizer：自家 repo 文件，prototype 取捨（spec §4 已記錄）。

- [ ] **Step 1: 建立 `src/views/Docs/Index.vue`**

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'

// build 時自動收錄 docs/handoff/ 全部 .md；lazy import，點開該文件才載 chunk
const modules = import.meta.glob<string>('../../../docs/handoff/*.md', {
    query: '?raw',
    import: 'default',
})

// 已知文件給固定標題與順序；未來新增的檔案以檔名為標題、字母序排後
const KNOWN: Record<string, { title: string; order: number }> = {
    'frontend': { title: '前端交接', order: 1 },
    'backend': { title: '後端交接', order: 2 },
    'api-contract': { title: 'API 契約總表', order: 3 },
}

interface DocEntry {
    slug: string
    title: string
    load: () => Promise<string>
}

const docs: DocEntry[] = Object.entries(modules)
    .map(([path, load]) => {
        const slug = path.split('/').pop()!.replace(/\.md$/, '')
        return { slug, title: KNOWN[slug]?.title ?? slug, load }
    })
    .sort((a, b) => {
        const ao = KNOWN[a.slug]?.order ?? 99
        const bo = KNOWN[b.slug]?.order ?? 99
        return ao - bo || a.slug.localeCompare(b.slug)
    })

const route = useRoute()
const router = useRouter()

const activeSlug = ref('')
const html = ref('')
const loading = ref(false)
const loadError = ref(false)

async function show(doc: DocEntry) {
    activeSlug.value = doc.slug
    loading.value = true
    loadError.value = false
    try {
        html.value = await marked.parse(await doc.load())
    } catch {
        loadError.value = true
        html.value = ''
    } finally {
        loading.value = false
    }
}

function select(slug: string) {
    if (slug === activeSlug.value) return
    router.replace(`/docs/${slug}`)
}

// 無 slug / slug 不存在 → 顯示第一份（網址不動）
watch(
    () => route.params.slug,
    (slug) => {
        const doc = docs.find((d) => d.slug === slug) ?? docs[0]
        if (doc && doc.slug !== activeSlug.value) show(doc)
    },
    { immediate: true }
)
</script>

<template>
    <div class="docs-page">
        <aside class="docs-nav">
            <h1 class="docs-nav-title">📚 交接文件</h1>
            <button
                v-for="d in docs"
                :key="d.slug"
                class="docs-nav-item"
                :class="{ active: d.slug === activeSlug }"
                @click="select(d.slug)"
            >
                {{ d.title }}
            </button>
            <p class="docs-nav-note">內容為部署當下的 docs/handoff/ 快照</p>
        </aside>

        <main class="docs-content">
            <div v-if="loading" class="docs-status">載入中…</div>
            <div v-else-if="loadError" class="docs-status">文件載入失敗，請重新整理頁面</div>
            <article v-else class="markdown-body" v-html="html" />
        </main>
    </div>
</template>

<style scoped>
.docs-page {
    position: fixed;
    inset: 0;
    display: flex;
    background: var(--hig-bg-base);
}

/* ── 左側導覽 ─────────────────────────────── */
.docs-nav {
    width: 15rem;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 1.5rem 1rem;
    background: var(--hig-bg-sidebar);
    border-right: 1px solid var(--hig-border-default);
}
.docs-nav-title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--hig-text-primary);
    margin: 0 0.5rem 0.75rem;
}
.docs-nav-item {
    text-align: left;
    padding: 0.5rem 0.75rem;
    border: none;
    border-radius: var(--hig-radius-md);
    background: transparent;
    color: var(--hig-text-primary);
    font-size: 0.875rem;
    cursor: pointer;
    transition: background var(--hig-duration-fast) var(--hig-ease);
}
.docs-nav-item:hover {
    background: var(--hig-bg-fill-hover);
}
.docs-nav-item.active {
    background: var(--hig-blue);
    color: var(--hig-text-inverse);
    font-weight: 600;
}
.docs-nav-note {
    margin-top: auto;
    padding: 0 0.5rem;
    font-size: 0.6875rem;
    color: var(--hig-text-tertiary);
}

/* ── 右側內容 ─────────────────────────────── */
.docs-content {
    flex: 1;
    overflow: auto;
    padding: 2rem 3rem;
}
.docs-status {
    color: var(--hig-text-secondary);
    font-size: 0.875rem;
    padding: 2rem 0;
}

/* ── Markdown 內容（v-html，需 :deep）────────── */
.markdown-body {
    max-width: 56rem;
    color: var(--hig-text-primary);
    font-size: 0.875rem;
    line-height: 1.7;
}
.markdown-body :deep(h1) {
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    margin: 0 0 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--hig-border-default);
}
.markdown-body :deep(h2) {
    font-size: 1.1875rem;
    font-weight: 600;
    margin: 2rem 0 0.75rem;
}
.markdown-body :deep(h3) {
    font-size: 1rem;
    font-weight: 600;
    margin: 1.5rem 0 0.5rem;
}
.markdown-body :deep(h4) {
    font-size: 0.875rem;
    font-weight: 600;
    margin: 1.25rem 0 0.5rem;
}
.markdown-body :deep(p) {
    margin: 0.5rem 0;
}
.markdown-body :deep(ul),
.markdown-body :deep(ol) {
    padding-left: 1.5rem;
    margin: 0.5rem 0;
}
.markdown-body :deep(li) {
    margin: 0.25rem 0;
}
.markdown-body :deep(code) {
    font-family: var(--hig-font-mono);
    font-size: 0.8125em;
    background: var(--hig-bg-fill);
    padding: 0.125rem 0.375rem;
    border-radius: var(--hig-radius-sm);
}
.markdown-body :deep(pre) {
    background: var(--hig-bg-fill);
    border: 1px solid var(--hig-border-subtle);
    border-radius: var(--hig-radius-md);
    padding: 0.75rem 1rem;
    overflow-x: auto;
    margin: 0.75rem 0;
}
.markdown-body :deep(pre code) {
    background: transparent;
    padding: 0;
}
.markdown-body :deep(table) {
    border-collapse: collapse;
    margin: 0.75rem 0;
    display: block;
    overflow-x: auto;
    max-width: 100%;
}
.markdown-body :deep(th),
.markdown-body :deep(td) {
    border: 1px solid var(--hig-border-default);
    padding: 0.375rem 0.75rem;
    font-size: 0.8125rem;
    white-space: nowrap;
}
.markdown-body :deep(th) {
    background: var(--hig-bg-fill);
    font-weight: 600;
    text-align: left;
}
.markdown-body :deep(tr:nth-child(even) td) {
    background: var(--hig-bg-surface);
}
.markdown-body :deep(blockquote) {
    margin: 0.75rem 0;
    padding: 0.25rem 1rem;
    border-left: 3px solid var(--hig-blue);
    color: var(--hig-text-secondary);
}
.markdown-body :deep(hr) {
    border: none;
    border-top: 1px solid var(--hig-border-default);
    margin: 1.5rem 0;
}
.markdown-body :deep(a) {
    color: var(--hig-blue);
}
</style>
```

- [ ] **Step 2: 型別檢查**

```bash
node node_modules/vue-tsc/bin/vue-tsc.js --noEmit
```

Expected: exit 0。（此時頁面尚無路由，僅確認元件本身編譯通過。）

- [ ] **Step 3: Commit**

```bash
git add src/views/Docs/Index.vue
git commit -m "feat(docs-viewer): 交接文件檢視頁（glob 自動收錄 + marked 渲染 + HIG 樣式）"
```

---

### Task 4: 路由 + 免認證白名單

**Files:**
- Modify: `src/router/index.ts`（`/design-system` 路由後約 425 行；`beforeEach` 約 456–464 行）

- [ ] **Step 1: 加頂層路由**

在 `// ================== DEV ONLY ==================` 區塊的 `/design-system` 路由後面加：

```ts
    // ================== 公開文件（交接文件檢視，免登入） ==================
    {
        path: '/docs/:slug?',
        name: 'HandoffDocs',
        component: () => import('../views/Docs/Index.vue'),
        meta: { title: 'menu.handoffDocs' }
    },
```

- [ ] **Step 2: beforeEach 白名單**

現況（約 456–464 行）：

```ts
    const isAuthenticated = authStore.isAuthenticated
    const isLoginPath = to.path === '/login'

    if (isLoginPath && isAuthenticated) {
        return next('/dashboard')
    }

    if (isLoginPath || to.name === 'NotFound') {
        return next()
    }
```

改為（只動第二個 if，比照 login 的免認證放行；`startsWith('/docs')` 只會命中本路由——
其餘以 docs 開頭的路徑不存在）：

```ts
    const isAuthenticated = authStore.isAuthenticated
    const isLoginPath = to.path === '/login'
    const isPublicDocs = to.path.startsWith('/docs')

    if (isLoginPath && isAuthenticated) {
        return next('/dashboard')
    }

    if (isLoginPath || isPublicDocs || to.name === 'NotFound') {
        return next()
    }
```

注意：頁面標題會顯示原始 key（`menu.handoffDocs - Game Dev Dashboard`）——
afterEach 不 translate 是全 app 既有行為（CLAUDE.md backlog），**不要順手修**。

- [ ] **Step 3: 型別檢查**

```bash
node node_modules/vue-tsc/bin/vue-tsc.js --noEmit
```

Expected: exit 0。

- [ ] **Step 4: Commit**

```bash
git add src/router/index.ts
git commit -m "feat(docs-viewer): /docs/:slug? 公開路由 + beforeEach 免認證白名單"
```

---

### Task 5: 登入頁按鈕

**Files:**
- Modify: `src/views/auth/index.vue`（script 約 75–81 行間、template 約 135–146 行的 `.login-quick` 區塊）

- [ ] **Step 1: script 加 handler**

在 `quickLogin` 函式後加（`router` 已於 14 行宣告）：

```ts
const openDocs = () => {
    // hash mode：resolve().href = `${base}#/docs`，本機與 GitHub Pages 皆正確
    window.open(router.resolve('/docs').href, '_blank')
}
```

- [ ] **Step 2: template 加按鈕**

`.login-quick` 內、`v-for` 的 Button 後面加（不設 `:disabled="loading"`——
看文件不是登入行為，登入中也可點）：

```vue
                <Button
                    :label="t('login.docs')"
                    size="small"
                    severity="secondary"
                    outlined
                    @click="openDocs"
                />
```

- [ ] **Step 3: 型別檢查**

```bash
node node_modules/vue-tsc/bin/vue-tsc.js --noEmit
```

Expected: exit 0。

- [ ] **Step 4: Commit**

```bash
git add src/views/auth/index.vue
git commit -m "feat(docs-viewer): 登入頁快速登入列加「交接文件」按鈕（另開新分頁）"
```

---

### Task 6: 整體驗證（build + preview 抽查）

**Files:** 無新改動（驗證 task；發現問題回頭修對應 task 並補 commit）

- [ ] **Step 1: Build**

```bash
node node_modules/vite/bin/vite.js build > /tmp/build.log 2>&1; tail -5 /tmp/build.log
```

Expected: 見 `built in`；輸出含 docs 頁 chunk 與三份 md 各自的 chunk（lazy glob）。

- [ ] **Step 2: 型別檢查（最終）**

```bash
node node_modules/vue-tsc/bin/vue-tsc.js --noEmit
```

Expected: exit 0。

- [ ] **Step 3: Preview 抽查**

啟 dev server 後逐項確認（用 preview 工具）：

1. `/login` 快速登入列有第四顆「📚 交接文件」按鈕，樣式與前三顆一致。
2. 點擊另開新分頁，網址為 `…/#/docs`，顯示第一份文件（前端交接）。
3. 左導覽三項齊全且順序為：前端交接 → 後端交接 → API 契約總表；
   點「後端交接」內容切換、網址變 `#/docs/backend`。
4. api-contract 的寬表格正常渲染（框線、TH 底色、可橫向捲動）。
5. 直連 `#/docs/backend` 重新整理仍顯示後端交接；亂打 `#/docs/xxx` fallback 顯示第一份。
6. 未登入直連 `#/dashboard` 仍被導去 `/login`（守衛不受影響）。
7. 語言切到 en，登入頁按鈕顯示「📚 Handoff Docs」。

（若遇 MSW service worker 失同步的 404，hard reload 即可——已知 dev 環境現象，非 bug。）

- [ ] **Step 4: 回報**

整理「改了什麼 / 怎麼驗證 / `git diff main --stat`」停下等 review。
不 merge、不 push（CLAUDE.md 規範，push main 會自動部署）。
