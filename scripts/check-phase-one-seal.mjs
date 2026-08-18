import { access, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { appendices, crossCutting, foundation, modules } from '../docs/spec-book/manifest.mjs'
import { pageReadiness, readinessDimensions } from '../docs/spec-book/readiness.mjs'
import { pageReconciliation } from '../docs/spec-book/reconciliation.mjs'
import { deferredDependencies, dependencyChains } from '../docs/spec-book/dependencies.mjs'
import { tbdRegistry } from '../docs/spec-book/tbd-registry.mjs'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const repositoryRoot = path.resolve(scriptDirectory, '..')
const outputRoot = path.join(repositoryRoot, 'public/provider-specs')
const contentPages = modules.flatMap((module) => module.pages)
const assessedPages = contentPages.filter((page) => ['baseline', 'active'].includes(page.scope))
const deferredPages = contentPages.filter((page) => page.scope === 'deferred')
const routerSource = await readFile(path.join(repositoryRoot, 'src/router/index.ts'), 'utf8')
const menuSource = await readFile(path.join(repositoryRoot, 'src/config/menu-sakai.ts'), 'utf8')
const boundarySource = await readFile(path.join(repositoryRoot, 'docs/spec-book/content/02-system-boundary.md'), 'utf8')
const architectureSource = await readFile(path.join(repositoryRoot, 'docs/spec-book/content/03-information-architecture.md'), 'utf8')
const domainSource = await readFile(path.join(repositoryRoot, 'docs/spec-book/content/04-common-domain-rules.md'), 'utf8')
const siteCss = await readFile(path.join(outputRoot, 'assets/site.css'), 'utf8')
const failures = []
let assertionCount = 0

assert(contentPages.length === 32, '內容頁總數必須維持 32')
assert(contentPages.filter((page) => page.prototype === 'complete').length === 25, '已有內容原型頁必須維持 25')
assert(contentPages.filter((page) => page.prototype === 'placeholder').length === 7, 'Placeholder 頁必須維持 7')
assert(assessedPages.length === 21, '第一階段 Baseline／Active 頁必須維持 21')
assert(deferredPages.length === 11, 'Deferred 頁必須維持 11')
assert(modules.length === 9, 'Provider 主資訊架構必須維持九個工作群組')
assert((menuSource.match(/key: 'provider[A-Za-z]+'/g) || []).length === modules.length, '實際 Provider 導覽必須包含九個工作群組')

for (const page of contentPages) {
    const routePath = page.route.replace(/^\//, '')
    assert(routerSource.includes(`path: '${routePath}'`), `${page.id} 的 route 未出現在 router：${page.route}`)
    assert(menuSource.includes(`to: '${page.route}'`), `${page.id} 的 route 未出現在 Provider 主導覽：${page.route}`)
    assert(routerSource.includes(page.component.replace(/^src\//, '')), `${page.id} 的 manifest 元件與 router 不一致：${page.component}`)
    await assertAccessible(path.join(repositoryRoot, page.component), `${page.id} 的前端元件不存在：${page.component}`)
    for (const source of page.sources) {
        await assertAccessible(path.join(repositoryRoot, source), `${page.id} 的規格來源不存在：${source}`)
    }
}

for (const legacyRoute of ['/aggregators', '/agents', '/merchants', '/players', '/orders', '/transactions', '/settlements', '/risk', '/jackpots']) {
    assert(!menuSource.includes(`to: '${legacyRoute}'`), `Provider 主導覽不應包含 legacy route：${legacyRoute}`)
}

const readinessKeys = [...readinessDimensions.productUi, ...readinessDimensions.delivery].map((dimension) => dimension.key)
assert(assessedPages.every((page) => pageReadiness[page.id]), '21 個本輪頁面必須全部有完成度資料')
assert(assessedPages.every((page) => readinessKeys.every((key) => pageReadiness[page.id][key])), '21 個本輪頁面必須完成 12 面向評級')
assert(assessedPages.every((page) => pageReconciliation[page.id]), '21 個本輪頁面必須全部有三層校準')
assert(assessedPages.every((page) => dependencyChains.some((chain) => chain.nodes.some((node) => node.pageIds.includes(page.id)))), '21 個本輪頁面必須全部出現在跨頁依賴圖')
assert(assessedPages.every((page) => tbdRegistry.some((item) => item.pageIds.includes(page.id))), '21 個本輪頁面必須全部關聯集中 TBD')
assert(deferredPages.every((page) => !pageReadiness[page.id] && !pageReconciliation[page.id]), 'Deferred 頁不可出現在完成度或三層校準資料')
assert(deferredDependencies.length === 3, 'Deferred 外部依賴必須維持 GGAP、通知中心、系統設定三項')
assert(dependencyChains.length === 4, '第一階段跨頁依賴必須維持四條核心業務鏈')
assert(dependencyChains.flatMap((chain) => chain.edges).length === 15, '第一階段跨頁依賴必須維持 15 條關係')
assert(tbdRegistry.length === 30, '集中 TBD 必須維持 30 項')

for (const text of ['Provider 擁有遊戲與遊戲結果', '已上架遊戲的代理商個別開關', '不建立、不管理', '會員登入與平台錢包', 'Provider 的主要業務紀錄仍是 Game Round']) {
    assert(boundarySource.includes(text), `系統責任邊界缺少封版 guardrail：${text}`)
}
for (const text of ['不建立獨立 Game Session', '正式財務與遊戲紀錄不得混入 DEMO 或 Test', 'Test 不出現在 Provider 風控監控', 'Provider 點數為主要顯示值', 'USDT']) {
    assert(domainSource.includes(text), `共通領域規則缺少封版 guardrail：${text}`)
}
for (const text of ['九個工作群組', '32 個可進入的內容頁', '1 頁 Baseline', '20 頁 Active', '| Deferred | 11 |', '不可作為開發依據']) {
    assert(architectureSource.includes(text), `資訊架構缺少封版範圍聲明：${text}`)
}

const representativePages = [
    'index',
    'game-round-records',
    'page-readiness-matrix',
    'page-reconciliation',
    'page-dependency-map',
    'open-issues',
    'ggap-overview',
]
for (const id of representativePages) {
    const html = await readFile(path.join(outputRoot, `${id}.html`), 'utf8')
    assert(html.includes('<html lang="zh-Hant">'), `${id} 代表頁缺少繁體中文語系`)
    assert(html.includes('<main id="main-content"'), `${id} 代表頁缺少主要內容 landmark`)
    assert(html.includes('aria-current="page"'), `${id} 代表頁缺少目前導覽狀態`)
    assert(!html.includes('GENERATED_'), `${id} 代表頁仍包含未替換生成標記`)
}

const deferredSample = await readFile(path.join(outputRoot, 'ggap-overview.html'), 'utf8')
for (const text of ['延後製作', '等待取得並整合 GGAP 現行正式規格', '不可作為前端、後端或 QA 的開發依據']) {
    assert(deferredSample.includes(text), `GGAP Deferred 代表頁缺少必要限制：${text}`)
}
assert(!deferredSample.includes('page-visual-overview'), 'GGAP Deferred 代表頁不應建立畫面示意')

for (const selector of ['@media (max-width: 1180px)', '@media (max-width: 900px)', '@media (max-width: 620px)', '@media print', '.page-outline', '.tbd-card', '.dependency-flow', '.reconciliation-columns']) {
    assert(siteCss.includes(selector), `規格網站樣式缺少封版檢查項目：${selector}`)
}

const expectedDocumentCount = 1 + foundation.length + modules.length + contentPages.length + crossCutting.length + appendices.length
const nodeCount = dependencyChains.reduce((total, chain) => total + chain.nodes.length, 0)
if (failures.length) {
    console.error(`Phase 1 seal validation failed (${failures.length}/${assertionCount})`)
    failures.forEach((failure) => console.error(`- ${failure}`))
    process.exitCode = 1
} else {
    console.log(`Phase 1 seal validation passed: ${assertionCount} assertions`)
    console.log(`Coverage: ${expectedDocumentCount} documents, ${contentPages.length} content pages, ${assessedPages.length} assessed pages, ${dependencyChains.length} chains / ${nodeCount} nodes / 15 edges, ${tbdRegistry.length} TBDs`)
}

function assert(condition, message) {
    assertionCount += 1
    if (!condition) failures.push(message)
}

async function assertAccessible(filePath, message) {
    assertionCount += 1
    try {
        await access(filePath)
    } catch {
        failures.push(message)
    }
}
