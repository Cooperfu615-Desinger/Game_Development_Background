import { access, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { appendices, book, modules } from '../docs/spec-book/manifest.mjs'
import { deferredDependencies, dependencyChains } from '../docs/spec-book/dependencies.mjs'
import { pageReadiness, readinessDimensions } from '../docs/spec-book/readiness.mjs'
import { pageReconciliation } from '../docs/spec-book/reconciliation.mjs'
import { tbdRegistry } from '../docs/spec-book/tbd-registry.mjs'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const repositoryRoot = path.resolve(scriptDirectory, '..')
const outputRoot = path.join(repositoryRoot, 'public/provider-specs')
const contentPages = modules.flatMap((module) => module.pages)
const assessedPages = contentPages.filter((page) => ['baseline', 'active'].includes(page.scope))
const deferredPages = contentPages.filter((page) => page.scope === 'deferred')
const siteCss = await readFile(path.join(outputRoot, 'assets/site.css'), 'utf8')
const searchIndex = await readFile(path.join(outputRoot, 'assets/search-index.js'), 'utf8')
const authSource = await readFile(path.join(repositoryRoot, 'src/views/Auth/index.vue'), 'utf8')
const zhLocale = await readFile(path.join(repositoryRoot, 'src/locales/zh-TW.json'), 'utf8')
const failures = []
let assertionCount = 0

assert(['0.13.0-phase-two-seal', '0.14.0-phase-three-pack-01-draft', '0.14.1-phase-three-pack-01-evidence-pending', '0.15.0-phase-three-pack-02-baseline', '0.16.0-phase-three-contract-baselines', '0.17.0-phase-three-pack-03-baseline', '0.18.0-phase-three-pack-03-source-aligned'].includes(book.version), '規格網站版本不得早於 Phase 2 Seal')
assert(['Phase 2 · Draft Sealed', 'Phase 3 · Decision Pack 01 Draft', 'Phase 3 · Pack 01 Backend Evidence Pending', 'Phase 3 · Monitoring & Risk Baseline', 'Phase 3 · Product Contract Baselines'].includes(book.status), '規格網站狀態不得早於 Phase 2 Draft Sealed')
assert(assessedPages.length === 21, 'Phase 2 必須封版 21 個 Baseline／Active 頁面')
assert(deferredPages.length === 11, 'Deferred 頁面必須維持 11 頁')
assert(appendices.some((item) => item.id === 'phase-two-validation-report'), '附錄必須納入第二階段封版驗證報告')

const expectedBatches = { A: 3, B: 4, C: 6, D: 8 }
for (const [batch, expectedCount] of Object.entries(expectedBatches)) {
    assert(assessedPages.filter((page) => pageReadiness[page.id]?.batch === batch).length === expectedCount, `Batch ${batch} 頁數必須為 ${expectedCount}`)
}

for (const page of assessedPages) {
    assert(page.status === 'draft', `${page.id} 封版後仍必須維持 Draft，不得誤標 Confirmed`)
    assert(Boolean(page.content), `${page.id} 必須有完整內容來源`)
    assert(page.visualAtTop === true, `${page.id} 必須使用 Overview-first 畫面示意`)
    assert((page.visualZones || []).length === 6, `${page.id} 必須有六個快速導覽區塊`)
    assert(Boolean(pageReadiness[page.id]), `${page.id} 必須有完成度資料`)
    assert(Boolean(pageReconciliation[page.id]), `${page.id} 必須有三層校準資料`)
    assert(tbdRegistry.some((item) => item.pageIds.includes(page.id)), `${page.id} 必須關聯集中 TBD`)

    for (const dimension of readinessDimensions.productUi) {
        assert(pageReadiness[page.id][dimension.key] === 'complete', `${page.id} 的 ${dimension.label} 必須為完整`)
    }
    for (const key of ['api', 'data', 'permissions']) {
        assert(pageReadiness[page.id][key] === 'partial', `${page.id} 的 ${key} 必須維持部分，等待第三階段契約收斂`)
    }
    for (const key of ['responsiveA11y', 'acceptance', 'dependencies']) {
        assert(pageReadiness[page.id][key] === 'complete', `${page.id} 的 ${key} 必須為完整`)
    }

    const html = await readFile(path.join(outputRoot, `${page.id}.html`), 'utf8')
    assert(html.includes('id="page-visual-overview"'), `${page.id} 缺少置頂畫面示意`)
    assert((html.match(/class="anatomy-zone /g) || []).length === 6, `${page.id} 畫面示意必須有六區`)
    assert(html.includes('aria-current="page"'), `${page.id} 缺少目前導覽狀態`)
    assert(!html.includes('GENERATED_'), `${page.id} 仍含未替換生成標記`)
    for (const zone of page.visualZones) {
        assert(html.includes(`id="${zone.href.slice(1)}"`), `${page.id} 缺少快速導覽錨點：${zone.href}`)
    }
    assert(searchIndex.includes(`"url":"${page.id}.html"`), `${page.id} 未進入全文搜尋索引`)
}

for (const page of deferredPages) {
    assert(page.status === 'outline', `${page.id} 必須維持 Outline`)
    assert(!page.content, `${page.id} 不得建立推測性的完整內容來源`)
    assert(!page.visualAtTop && !(page.visualZones || []).length, `${page.id} 不得建立畫面示意`)
    assert(!pageReadiness[page.id] && !pageReconciliation[page.id], `${page.id} 不得進入 Active 完成度或校準資料`)

    const html = await readFile(path.join(outputRoot, `${page.id}.html`), 'utf8')
    for (const text of ['延後製作', '重新啟動前需要的輸入', '不可作為前端、後端或 QA 的開發依據']) {
        assert(html.includes(text), `${page.id} 缺少 Deferred 限制：${text}`)
    }
    assert(!html.includes('id="page-visual-overview"'), `${page.id} 不得輸出畫面示意`)
}

assert(deferredDependencies.length === 3, 'Deferred 外部依賴必須維持 GGAP、通知中心、系統設定三項')
assert(dependencyChains.length === 4, '跨頁依賴必須維持四條核心業務鏈')
assert(tbdRegistry.length === 30, '集中 TBD 必須維持 30 項並交由第三階段收斂')
assert(tbdRegistry.every((item) => ['partial', 'definition', 'external'].includes(item.status)), 'Phase 2 不得把尚未核准的集中 TBD 標成已解決')

for (const selector of ['@media (max-width: 1180px)', '@media (max-width: 900px)', '@media (max-width: 620px)', '@media print', '.page-outline', '.visual-quick-map']) {
    assert(siteCss.includes(selector), `規格網站缺少封版樣式：${selector}`)
}

assert(authSource.includes('provider-specs/index.html'), '登入頁缺少規格文件入口')
assert(authSource.includes("t('login.specDocs')"), '登入頁缺少規格文件按鈕文案鍵')
assert(zhLocale.includes('"specDocs": "規格文件"'), '繁中語系缺少規格文件文案')
await assertAccessible(path.join(outputRoot, 'phase-two-validation-report.html'), '缺少第二階段封版驗證報告 HTML')

if (failures.length) {
    console.error(`Phase 2 seal validation failed (${failures.length}/${assertionCount})`)
    failures.forEach((failure) => console.error(`- ${failure}`))
    process.exitCode = 1
} else {
    console.log(`Phase 2 seal validation passed: ${assertionCount} assertions`)
    console.log(`Coverage: ${assessedPages.length} Draft pages / 126 visual zones, ${deferredPages.length} Deferred pages, ${tbdRegistry.length} open TBDs`)
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
