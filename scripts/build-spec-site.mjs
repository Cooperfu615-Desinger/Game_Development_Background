import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { marked } from 'marked'
import {
    appendices,
    book,
    crossCutting,
    foundation,
    modules,
    scopeLabels,
    statusLabels,
} from '../docs/spec-book/manifest.mjs'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const repositoryRoot = path.resolve(scriptDirectory, '..')
const sourceRoot = path.join(repositoryRoot, 'docs/spec-book')
const outputRoot = path.join(repositoryRoot, 'public/provider-specs')
const outputAssets = path.join(outputRoot, 'assets')

marked.use({
    gfm: true,
    breaks: false,
})

await mkdir(outputAssets, { recursive: true })

const allContentPages = modules.flatMap((module) =>
    module.pages.map((page, index) => ({
        ...page,
        number: `${module.number}.${index + 1}`,
        kind: 'content-page',
        moduleId: module.id,
        moduleTitle: module.title,
    })),
)

const documents = [
    {
        id: 'index',
        title: '規格書首頁',
        summary: book.description,
        status: 'draft',
        kind: 'home',
        number: '—',
    },
    ...foundation.map((item) => ({ ...item, kind: 'foundation' })),
    ...modules.flatMap((module) => [
        {
            id: module.id,
            number: module.number,
            title: module.title,
            summary: module.summary,
            status: module.pages.some((page) => page.status === 'draft') ? 'draft' : 'outline',
            scope: moduleScope(module),
            kind: 'module',
            moduleId: module.id,
            moduleTitle: module.title,
        },
        ...allContentPages.filter((page) => page.moduleId === module.id),
    ]),
    ...crossCutting.map((item) => ({ ...item, kind: 'cross-cutting' })),
    ...appendices.map((item) => ({ ...item, kind: 'appendix' })),
]

const pageMatrixMarkdown = createPageMatrix()
const renderedDocuments = []

for (const document of documents) {
    let markdown = ''
    let visualHtml = ''

    if (document.kind === 'home') {
        markdown = createHomeMarkdown()
    } else if (document.kind === 'module') {
        markdown = createModuleMarkdown(document)
    } else if (document.content) {
        markdown = await readFile(path.join(sourceRoot, document.content), 'utf8')
    } else if (document.generatedMatrix) {
        markdown = `# ${document.title}\n\n${pageMatrixMarkdown}`
    } else if (document.kind === 'content-page') {
        markdown = createOutlineMarkdown(document)
    }

    if (document.generatedMatrix) {
        const marker = '<!-- GENERATED_PAGE_MATRIX -->'
        markdown = markdown.includes(marker)
            ? markdown.replace(marker, pageMatrixMarkdown)
            : `${markdown}\n\n${pageMatrixMarkdown}`
    }

    if (document.visualAtTop) {
        const visualMarker = /<!-- PAGE_VISUAL_START -->([\s\S]*?)<!-- PAGE_VISUAL_END -->/
        const visualMatch = markdown.match(visualMarker)
        if (!visualMatch) {
            throw new Error(`${document.id} 已設定 visualAtTop，但找不到 PAGE_VISUAL 標記`)
        }
        visualHtml = visualMatch[1].trim()
        markdown = markdown.replace(visualMarker, '').replace(/\n{3,}/g, '\n\n')
    }

    const rendered = renderMarkdown(markdown)
    renderedDocuments.push({
        ...document,
        markdown,
        visualHtml,
        articleHtml: rendered.html,
        outline: rendered.outline,
        searchText: markdownToSearchText(markdown),
    })
}

for (const [index, document] of renderedDocuments.entries()) {
    const previous = index > 0 ? renderedDocuments[index - 1] : null
    const next = index < renderedDocuments.length - 1 ? renderedDocuments[index + 1] : null
    const fileName = document.id === 'index' ? 'index.html' : `${document.id}.html`
    const html = renderDocument(document, previous, next)
    await writeFile(path.join(outputRoot, fileName), normalizeGeneratedText(html), 'utf8')
}

await copyFile(path.join(sourceRoot, 'site/site.css'), path.join(outputAssets, 'site.css'))
await copyFile(path.join(sourceRoot, 'site/site.js'), path.join(outputAssets, 'site.js'))
await writeFile(
    path.join(outputAssets, 'search-index.js'),
    `window.SPEC_SEARCH_INDEX = ${safeJson(renderedDocuments.map((document) => ({
        title: document.title,
        number: document.number,
        summary: document.summary,
        status: document.status,
        scope: document.scope,
        module: document.moduleTitle || sectionLabel(document.kind),
        url: document.id === 'index' ? 'index.html' : `${document.id}.html`,
        text: document.searchText.slice(0, 12000),
    })))};\n`,
    'utf8',
)

console.log(`Provider spec site generated: ${renderedDocuments.length} documents, ${allContentPages.length} content pages`)
console.log(`Output: ${path.relative(repositoryRoot, outputRoot)}/index.html`)

function renderDocument(document, previous, next) {
    const status = statusLabels[document.status] || statusLabels.outline
    const scope = document.scope ? scopeLabels[document.scope] : null
    const isHome = document.kind === 'home'
    const pageTitle = isHome ? book.title : `${document.title}｜${book.title}`
    const eyebrow = breadcrumbFor(document)

    return `<!doctype html>
<html lang="zh-Hant">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${escapeHtml(document.summary || book.description)}">
    <meta name="color-scheme" content="light">
    <title>${escapeHtml(pageTitle)}</title>
    <link rel="stylesheet" href="assets/site.css">
    <script src="assets/search-index.js" defer></script>
    <script src="assets/site.js" defer></script>
</head>
<body data-page-id="${escapeHtml(document.id)}">
    <a class="skip-link" href="#main-content">跳至主要內容</a>
    <header class="topbar">
        <button class="icon-button nav-trigger" type="button" data-nav-trigger aria-label="開啟規格目錄" aria-expanded="false" aria-controls="spec-navigation">
            <span></span><span></span><span></span>
        </button>
        <a class="wordmark" href="index.html" aria-label="回到規格書首頁">
            <span class="wordmark-mark" aria-hidden="true">▦</span>
            <span><strong>Provider Portal</strong><small>產品與系統規格書</small></span>
        </a>
        <button class="search-trigger" type="button" data-search-trigger>
            <span aria-hidden="true">⌕</span>
            <span>搜尋規格</span>
            <kbd>⌘ K</kbd>
        </button>
        <div class="topbar-meta">
            <strong class="spec-context-label">SPEC</strong>
            <span>${escapeHtml(book.version)}</span>
            <span class="topbar-status">${escapeHtml(book.status)}</span>
        </div>
    </header>

    <div class="shell">
        <aside class="sidebar" id="spec-navigation" data-sidebar>
            <div class="sidebar-intro">
                <span class="sidebar-kicker">SPECIFICATION MANUAL</span>
                <p>${escapeHtml(book.updatedAt)} 更新</p>
            </div>
            <nav aria-label="規格書章節">
                ${renderNavigation(document.id)}
            </nav>
            <div class="sidebar-legend">
                <p>規格狀態</p>
                ${Object.entries(statusLabels).map(([key, item]) => `<span><i class="status-dot status-${item.tone}"></i>${escapeHtml(item.label)}</span>`).join('')}
            </div>
        </aside>
        <button class="sidebar-scrim" type="button" data-nav-close aria-label="關閉規格目錄"></button>

        <main id="main-content" class="main-content" tabindex="-1">
            <div class="page-frame ${isHome ? 'home-frame' : ''}">
                <header class="page-header">
                    <div>
                        <p class="eyebrow">${escapeHtml(eyebrow)}</p>
                        <h1>${escapeHtml(document.title)}</h1>
                        <p class="page-summary">${escapeHtml(document.summary || '')}</p>
                    </div>
                    <div class="page-status-stack">
                        <span class="status-badge status-${status.tone}">${escapeHtml(status.label)}</span>
                        ${scope ? `<span class="scope-badge scope-${scope.tone}">${escapeHtml(scope.label)}</span>` : ''}
                        ${document.pilot ? '<span class="pilot-badge">PILOT 章節</span>' : ''}
                    </div>
                </header>

                ${renderMetadata(document)}
                ${renderVisualOverview(document)}

                <div class="content-layout">
                    <article class="spec-content">
                        ${document.articleHtml}
                    </article>
                    ${renderOutline(document.outline)}
                </div>

                ${renderPreviousNext(previous, next)}
                <footer class="document-footer">
                    <span>${escapeHtml(book.owner)}</span>
                    <span>${escapeHtml(book.version)} · ${escapeHtml(book.updatedAt)}</span>
                </footer>
            </div>
        </main>
    </div>

    <dialog class="search-dialog" data-search-dialog aria-labelledby="search-dialog-title">
        <div class="search-dialog-header">
            <div>
                <p class="eyebrow">全文檢索</p>
                <h2 id="search-dialog-title">搜尋規格書</h2>
            </div>
            <button class="icon-button dialog-close" type="button" data-search-close aria-label="關閉搜尋">×</button>
        </div>
        <label class="search-field">
            <span class="sr-only">輸入章節、route、欄位或關鍵字</span>
            <span aria-hidden="true">⌕</span>
            <input type="search" data-search-input autocomplete="off" placeholder="例如：Game Round、/reports、USDT">
        </label>
        <p class="search-hint" data-search-hint>可搜尋章節名稱、內文、route、欄位與技術值。</p>
        <div class="search-results" data-search-results></div>
    </dialog>
</body>
</html>`
}

function renderNavigation(activeId) {
    const groups = [
        {
            title: '開始閱讀',
            id: 'nav-start',
            open: foundation.some((item) => item.id === activeId) || activeId === 'index',
            items: [
                { id: 'index', title: '規格書首頁', number: '—', status: 'draft' },
                ...foundation,
            ],
        },
        ...modules.map((module) => ({
            title: `${module.number} ${module.title}`,
            id: `nav-${module.id}`,
            open: activeId === module.id || module.pages.some((page) => page.id === activeId),
            items: [
                { ...module, title: '模組總覽', status: module.pages.some((page) => page.status === 'draft') ? 'draft' : 'outline', scope: moduleScope(module) },
                ...module.pages,
            ],
        })),
        {
            title: '共通規格',
            id: 'nav-cross-cutting',
            open: crossCutting.some((item) => item.id === activeId),
            items: crossCutting,
        },
        {
            title: '附錄',
            id: 'nav-appendices',
            open: appendices.some((item) => item.id === activeId),
            items: appendices,
        },
    ]

    return groups.map((group) => `
        <details class="nav-group" ${group.open ? 'open' : ''}>
            <summary>${escapeHtml(group.title)}<span aria-hidden="true"></span></summary>
            <div class="nav-items">
                ${group.items.map((item) => {
                    const status = statusLabels[item.status] || statusLabels.outline
                    const url = item.id === 'index' ? 'index.html' : `${item.id}.html`
                    return `<a href="${url}" ${item.id === activeId ? 'aria-current="page"' : ''}>
                        <i class="status-dot status-${status.tone}" aria-hidden="true"></i>
                        <span>${escapeHtml(item.title)}</span>
                        ${item.scope === 'deferred' ? '<b class="nav-scope nav-scope-deferred">延後</b>' : item.pilot ? '<b>PILOT</b>' : ''}
                    </a>`
                }).join('')}
            </div>
        </details>
    `).join('')
}

function renderMetadata(document) {
    if (document.kind === 'home') {
        return ''
    }

    const fields = [
        ['章節編號', document.number],
        ['規格狀態', (statusLabels[document.status] || statusLabels.outline).label],
    ]

    if (document.kind === 'content-page') {
        fields.push(
            ['Route', document.route],
            ['前端元件', document.component],
        )
    }

    return `<section class="metadata-card" aria-label="章節追溯資訊">
        <div class="metadata-grid">
            ${fields.map(([label, value]) => `<div><span>${escapeHtml(label)}</span><code>${escapeHtml(value || '—')}</code></div>`).join('')}
        </div>
    </section>`
}

function renderVisualOverview(document) {
    if (!document.visualHtml) {
        return ''
    }

    const panelId = `${document.id}-visual-panel`
    const zones = document.visualZones || []
    const notes = document.visualNotes || []

    return `<section id="page-visual-overview" class="page-visual-overview" aria-labelledby="page-visual-title">
        <div class="visual-overview-header">
            <div>
                <p class="visual-overview-kicker">PAGE ANATOMY · OVERVIEW FIRST</p>
                <h2 id="page-visual-title">${escapeHtml(document.visualTitle || '頁面畫面示意')}</h2>
                <p>${escapeHtml(document.visualSummary || '先掌握頁面結構，再進入詳細規格。')}</p>
            </div>
            <button class="visual-toggle" type="button" data-anatomy-toggle aria-expanded="true" aria-controls="${escapeHtml(panelId)}">
                <span data-anatomy-toggle-label>收合畫面示意</span>
                <i aria-hidden="true">⌃</i>
            </button>
        </div>
        ${zones.length ? `<nav class="visual-quick-map" aria-label="頁面區塊快速導覽">
            ${zones.map((zone) => `<a href="${escapeHtml(zone.href)}"><strong>${escapeHtml(zone.number)}</strong><span>${escapeHtml(zone.label)}</span><i aria-hidden="true">↘</i></a>`).join('')}
        </nav>` : ''}
        ${notes.length ? `<div class="visual-scope-notes" aria-label="畫面閱讀邊界">
            <span>閱讀邊界</span>
            ${notes.map((note) => `<small>${escapeHtml(note)}</small>`).join('')}
        </div>` : ''}
        <div id="${escapeHtml(panelId)}" class="visual-overview-panel" data-anatomy-panel>
            ${document.visualHtml}
        </div>
        <p class="visual-overview-disclaimer">畫面示意用於定位元件與閱讀順序；實際欄位、狀態與行為仍以本頁詳細規格及正式契約為準。</p>
    </section>
    <a class="visual-return" data-visual-return href="#page-visual-overview" hidden><span aria-hidden="true">↑</span> 回到畫面示意</a>`
}

function renderOutline(outline) {
    if (!outline.length) {
        return ''
    }

    return `<aside class="page-outline" aria-label="本頁目錄">
        <p>本頁目錄</p>
        <nav>${outline.map((heading) => `<a class="outline-level-${heading.depth}" href="#${heading.id}">${escapeHtml(heading.text)}</a>`).join('')}</nav>
        <a class="back-to-top" href="#main-content">回到頁首 ↑</a>
    </aside>`
}

function renderPreviousNext(previous, next) {
    return `<nav class="previous-next" aria-label="上一章與下一章">
        ${previous ? `<a class="previous-link" href="${previous.id === 'index' ? 'index.html' : `${previous.id}.html`}"><span>← 上一章</span><strong>${escapeHtml(previous.title)}</strong></a>` : '<span></span>'}
        ${next ? `<a class="next-link" href="${next.id}.html"><span>下一章 →</span><strong>${escapeHtml(next.title)}</strong></a>` : '<span></span>'}
    </nav>`
}

function renderMarkdown(markdown) {
    const outline = []
    const usedIds = new Map()
    const withoutFirstTitle = markdown.replace(/^#\s+.+(?:\r?\n)+/, '')
    const withAnchors = withoutFirstTitle.replace(/^(#{2,4})\s+(.+)$/gm, (_, hashes, rawText) => {
        const depth = hashes.length
        const text = stripInlineMarkdown(rawText)
        const baseId = slugify(text)
        const count = usedIds.get(baseId) || 0
        usedIds.set(baseId, count + 1)
        const id = count ? `${baseId}-${count + 1}` : baseId
        if (depth <= 3) {
            outline.push({ depth, text, id })
        }
        return `<h${depth} id="${id}">${marked.parseInline(rawText)}</h${depth}>`
    })
    const html = marked.parse(withAnchors)
        .replaceAll('<table>', '<div class="table-scroll" tabindex="0"><table>')
        .replaceAll('</table>', '</table></div>')

    return { html, outline }
}

function createHomeMarkdown() {
    const currentRoundCount = allContentPages.filter((page) => ['baseline', 'active'].includes(page.scope)).length
    const deferredCount = allContentPages.filter((page) => page.scope === 'deferred').length
    const baselineCount = allContentPages.filter((page) => page.scope === 'baseline').length

    return `# 規格書首頁

<section class="home-hero">
<div class="hero-copy">
<p class="hero-index">PRODUCT / FRONTEND / BACKEND / QA</p>
<h2>把畫面原型，轉成可以共同開發與驗收的規格。</h2>
<p>本網站集中整理 Provider Portal 的產品邊界、32 個內容頁、共通資料規則與跨系統契約。Markdown 是可維護來源，HTML 是主要審閱介面。</p>
</div>
<div class="hero-rule" aria-hidden="true"><span>GGAP</span><i></i><span>PROVIDER</span></div>
</section>

<section class="metric-grid" aria-label="目前規格進度">
<div><strong>${allContentPages.length}</strong><span>內容頁</span><small>九個工作模組</small></div>
<div><strong>${currentRoundCount}</strong><span>本輪範圍</span><small>含基準範本與本輪製作</small></div>
<div><strong>${deferredCount}</strong><span>延後製作</span><small>等待必要規格與決策</small></div>
<div class="metric-accent"><strong>${baselineCount}</strong><span>基準範本</span><small>遊戲紀錄</small></div>
</section>

## 建議閱讀順序

1. **產品定位與目標**：先確認這是一個遊戲商後台，而非 GGAP 平台管理後台。
2. **系統與責任邊界**：確認 Provider、GGAP 與外部角色各自負責的資料與操作。
3. **共通領域規則**：統一 Game Round、正式／測試隔離、點數與 USDT 的口徑。
4. **資訊架構與頁面地圖**：從 32 頁矩陣進入各模組規格。
5. **遊戲紀錄**：以首個完整章節檢視頁面規格的深度、結構與待決事項表達方式。

## 本階段輸出界線

規格網站的撰寫格式與第一階段製作範圍已定版。32 個內容頁中，21 頁納入本輪（1 頁基準範本、20 頁本輪製作），11 頁延後。延後頁面只保留等待原因與必要輸入，不建立畫面、欄位、API 或驗收草案。

## 四個不可混淆的核心原則

- Provider 不建立錢包，也不管理代理商、商戶或會員主資料。
- Game Round 是主要業務紀錄單位，不另建 Game Session。
- 正式財務與遊戲紀錄不得混入 DEMO 或 Test；Test 不納入 Provider 風控監控。
- 金額以 Provider 點數為主，USDT 只作換算對照。

## 規格狀態怎麼看

| 狀態 | 意義 | 開發解讀 |
| --- | --- | --- |
| 已確認 | 已完成責任方確認 | 可作為正式實作與驗收依據 |
| 草案 | 結構或內容已成形，仍有待決項 | 可評估與拆工，不可把 TBD 當成契約 |
| 待整理 | 已知頁面、來源與責任，細節尚未收斂 | 先補規格，不直接推導 API |
| 待決策 | 存在會影響資料或流程的選項 | 需指定責任人與阻擋範圍 |

## 製作範圍怎麼看

| 範圍 | 意義 | 本階段處理方式 |
| --- | --- | --- |
| 基準範本 | 已完成完整試作並作為其他頁面的撰寫標準 | 維護並用於品質校正 |
| 本輪製作 | 納入目前規格完善範圍 | 依批次整理、審閱與驗收 |
| 延後製作 | 必要規格或產品決策尚未完成 | 僅保留延後說明，不作為開發依據 |
| 受阻 | 已開始整理，但遇到明確且無法繞過的阻擋 | 記錄阻擋條件與責任方 |
`
}

function createModuleMarkdown(document) {
    const module = modules.find((item) => item.id === document.moduleId)
    const rows = module.pages.map((page, index) => {
        const status = statusLabels[page.status] || statusLabels.outline
        const scope = scopeLabels[page.scope] || scopeLabels.active
        const prototype = page.prototype === 'complete' ? '已有內容原型' : 'Placeholder'
        return `| ${index + 1} | [${page.title}](${page.id}.html) | \`${page.route}\` | ${prototype} | ${status.label} | ${scope.label} |`
    }).join('\n')

    return `# ${module.title}

## 模組目的

${module.summary}

## 頁面清單

| # | 頁面 | Route | 畫面現況 | 規格狀態 | 製作範圍 |
| ---: | --- | --- | --- | --- | --- |
${rows}

## 模組整理原則

- 各頁規格需能追溯至 route、前端元件與原始 Spec Markdown。
- 已有內容原型只代表畫面骨架存在，不代表正式 API、權限或資料流已完成。
- Placeholder 移除條件與頁面寬度遵守 \`PROVIDER_PORTAL_UI_LAYOUT_SPEC.md\`。
- 未確認的資料欄位、狀態、API 與權限必須標示 Draft 或 TBD。

## 模組共通待補內容

- 角色與 permission key。
- 正式 request／response schema 與錯誤碼。
- 跨頁導流、URL query 與返回狀態。
- Loading、empty、error、permission denied 等頁面狀態。
- 前端、後端、整合、資料品質與響應式驗收條件。
`
}

function createOutlineMarkdown(document) {
    if (document.scope === 'deferred') {
        return createDeferredMarkdown(document)
    }

    const sourceList = document.sources?.map((source) => `- \`${source}\``).join('\n') || '- 尚待指定'
    const prototype = document.prototype === 'complete'
        ? '目前已有內容原型；正式 API、權限與互動資料流仍待規格化。'
        : '目前為 Placeholder；必須達到 UI Layout Spec 的移除條件後才能替換。'

    return `# ${document.title}

> 本章目前為「待整理」骨架。以下內容用來確定後續規格必須回答的問題，不代表尚未確認的行為已成為正式需求。

## 頁面定位

${document.summary} ${prototype}

## 規格來源

${sourceList}

## 既有程式對應

| 項目 | 內容 |
| --- | --- |
| Route | \`${document.route}\` |
| 前端元件 | \`${document.component}\` |
| 畫面現況 | ${document.prototype === 'complete' ? '已有內容原型' : 'Placeholder'} |

## 後續完整章節骨架

1. 目的、使用者與主要使用情境。
2. 範圍、責任邊界與明確排除項目。
3. 名詞、資料來源、計算口徑與環境隔離。
4. 資訊架構、欄位、篩選、列表、詳情與互動規則。
5. 狀態模型、空白／載入／錯誤／權限不足狀態。
6. API request／response、錯誤、分頁、排序與匯出契約。
7. 安全、權限、稽核、響應式與可存取性。
8. 前端、後端、整合、資料品質與 QA 驗收條件。
9. 待確認事項、責任人、阻擋範圍與規格完成條件。

## 本章完成條件

- 已逐條整併來源 Spec，且無互相矛盾的責任或名詞。
- 與實際 route、左側導覽、頁面原型及元件對應完成核對。
- Draft、TBD 與 Confirmed 內容可清楚區分。
- 前端與後端能據此估工、拆分介面契約並建立驗收案例。
`
}

function createDeferredMarkdown(document) {
    const requiredInputs = document.requiredInputs?.map((item) => `- ${item}`).join('\n') || '- 由產品與責任方補充正式輸入。'

    return `# ${document.title}

<div class="deferred-notice">
<strong>本頁延後製作</strong>
<p>${document.deferredReason || '必要規格與產品決策尚未完成。'}</p>
</div>

## 延後原因

${document.deferredReason || '必要規格與產品決策尚未完成。'} 在責任方提供並確認下列輸入前，本頁不進入規格撰寫與開發估工。

## 重新啟動前需要的輸入

${requiredInputs}

## 本階段邊界

- 本頁 route 與現行前端元件僅供資訊架構追溯。
- 不建立頁面畫面示意、欄位、互動、API、權限、狀態模型或驗收草案。
- 既有 mock、Placeholder 與來源文件中的未確認內容，不得推定為正式需求。
- 本頁目前**不可作為前端、後端或 QA 的開發依據**。
`
}

function createPageMatrix() {
    const rows = modules.flatMap((module) => module.pages.map((page) => {
        const status = statusLabels[page.status] || statusLabels.outline
        const scope = scopeLabels[page.scope] || scopeLabels.active
        const prototype = page.prototype === 'complete' ? '內容原型' : 'Placeholder'
        return `| ${module.title} | [${page.title}](${page.id}.html) | \`${page.route}\` | ${prototype} | ${status.label} | ${scope.label} | \`${page.component}\` |`
    }))

    return `| 模組 | 頁面 | Route | 畫面現況 | 規格狀態 | 製作範圍 | 前端元件 |
| --- | --- | --- | --- | --- | --- | --- |
${rows.join('\n')}`
}

function moduleScope(module) {
    const scopes = new Set(module.pages.map((page) => page.scope))
    if (scopes.size === 1) return [...scopes][0]
    if (scopes.has('blocked')) return 'blocked'
    if (scopes.has('active')) return 'active'
    if (scopes.has('baseline')) return 'baseline'
    return 'deferred'
}

function breadcrumbFor(document) {
    if (document.kind === 'home') return '規格入口 · SINGLE SOURCE OF REVIEW'
    if (document.kind === 'content-page') return `${document.number} · ${document.moduleTitle}`
    if (document.kind === 'module') return `${document.number} · 功能模組總覽`
    if (document.kind === 'appendix') return `附錄 ${document.number}`
    return `${document.number} · ${sectionLabel(document.kind)}`
}

function sectionLabel(kind) {
    const labels = {
        home: '規格入口',
        foundation: '基礎規格',
        module: '功能模組',
        'content-page': '頁面規格',
        'cross-cutting': '共通規格',
        appendix: '附錄',
    }
    return labels[kind] || '規格章節'
}

function markdownToSearchText(markdown) {
    return markdown
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/[\[\]#*_`>|~-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

function stripInlineMarkdown(value) {
    return value
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[*_`~]/g, '')
        .trim()
}

function slugify(value) {
    const slug = value
        .normalize('NFKC')
        .toLowerCase()
        .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
        .replace(/^-+|-+$/g, '')
    return slug || 'section'
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;')
}

function safeJson(value) {
    return JSON.stringify(value)
        .replaceAll('<', '\\u003c')
        .replaceAll('\u2028', '\\u2028')
        .replaceAll('\u2029', '\\u2029')
}

function normalizeGeneratedText(value) {
    return `${String(value).replace(/[ \t]+$/gm, '').replace(/\n*$/, '')}\n`
}
