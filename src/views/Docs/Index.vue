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
    'project-status': { title: '專案現況總覽', order: 0 },
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
        const content = await doc.load()
        if (activeSlug.value !== doc.slug) return // 已切到別份文件，丟棄過期結果
        html.value = await marked.parse(content)
    } catch {
        if (activeSlug.value !== doc.slug) return
        loadError.value = true
        html.value = ''
    } finally {
        if (activeSlug.value === doc.slug) loading.value = false
    }
}

function select(slug: string) {
    if (slug === activeSlug.value) return
    // spec 決策：用 replace，切換文件不堆歷史紀錄
    router.replace(`/docs/${slug}`)
}

// 無 slug / slug 不存在 → 顯示第一份（網址不動）
watch(
    () => route.params.slug,
    (slug) => {
        if (!route.path.startsWith('/docs')) return // 離開本頁時不要再載
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
}
.markdown-body :deep(th) {
    background: var(--hig-bg-fill);
    font-weight: 600;
    text-align: left;
    white-space: nowrap;
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
