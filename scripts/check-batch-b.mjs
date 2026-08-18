import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { book, modules } from '../docs/spec-book/manifest.mjs'
import { pageReadiness, readinessDimensions } from '../docs/spec-book/readiness.mjs'
import { pageReconciliation } from '../docs/spec-book/reconciliation.mjs'
import { tbdRegistry } from '../docs/spec-book/tbd-registry.mjs'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const repositoryRoot = path.resolve(scriptDirectory, '..')
const outputRoot = path.join(repositoryRoot, 'public/provider-specs')
const failures = []
let assertionCount = 0
const batchBPageIds = ['dashboard', 'monitoring-overview', 'risk-reports', 'risk-alerts']
const manifestPages = modules.flatMap((module) => module.pages)

assert(['0.10.0-batch-b-draft', '0.11.0-batch-c-draft', '0.12.0-batch-d-draft', '0.13.0-phase-two-seal', '0.14.0-phase-three-pack-01-draft', '0.14.1-phase-three-pack-01-evidence-pending', '0.15.0-phase-three-pack-02-baseline', '0.16.0-phase-three-contract-baselines', '0.17.0-phase-three-pack-03-baseline', '0.18.0-phase-three-pack-03-source-aligned'].includes(book.version), '規格網站版本不得早於 Batch B Draft')
assert(book.status.includes('Batch B Draft Complete') || book.status.includes('Batch C Draft Complete') || book.status.includes('Batch D Draft Complete') || book.status.includes('Draft Sealed') || book.status.includes('Decision Pack 01 Draft') || book.status.includes('Pack 01 Backend Evidence Pending') || book.status.includes('Monitoring & Risk Baseline') || book.status.includes('Product Contract Baselines'), '規格網站狀態不得早於 Batch B Draft Complete')

for (const pageId of batchBPageIds) {
    const page = manifestPages.find((item) => item.id === pageId)
    assert(Boolean(page), `${pageId} 必須存在於 manifest`)
    assert(page?.status === 'draft', `${pageId} 必須標示 Draft`)
    assert(Boolean(page?.content), `${pageId} 必須使用完整內容來源`)
    assert(page?.visualAtTop === true, `${pageId} 必須使用 Overview-first 畫面示意`)
    assert((page?.visualZones || []).length === 6, `${pageId} 必須有六個快速導覽區塊`)
    assert(pageReadiness[pageId]?.batch === 'B', `${pageId} 必須屬於 Batch B`)
    assert(Boolean(pageReconciliation[pageId]), `${pageId} 必須有三層校準資料`)
    assert(tbdRegistry.some((item) => item.pageIds.includes(pageId)), `${pageId} 必須連結集中 TBD`)

    for (const dimension of readinessDimensions.productUi) {
        assert(pageReadiness[pageId][dimension.key] === 'complete', `${pageId} 的 ${dimension.label} 應完成`)
    }
    for (const key of ['responsiveA11y', 'acceptance', 'dependencies']) {
        assert(pageReadiness[pageId][key] === 'complete', `${pageId} 的 ${key} 應完成`)
    }

    const html = await readFile(path.join(outputRoot, `${pageId}.html`), 'utf8')
    for (const requiredText of ['驗收條件', '待確認事項', 'API 契約', 'Test 排除']) {
        assert(html.includes(requiredText), `${pageId} 缺少完整 Draft 必要內容：${requiredText}`)
    }
    assert((html.match(/class="anatomy-zone /g) || []).length === 6, `${pageId} 畫面示意應有六個可點擊區塊`)
    assert(html.includes('id="page-visual-overview"'), `${pageId} 缺少置頂畫面示意`)
    assert(!html.includes('PAGE_VISUAL_START') && !html.includes('PAGE_VISUAL_END'), `${pageId} 仍含未替換畫面標記`)
}

const dashboardHtml = await readFile(path.join(outputRoot, 'dashboard.html'), 'utf8')
for (const text of ['即時狀態', '營運摘要', '通知中心仍為 Deferred', 'TBD-EXT-002']) {
    assert(dashboardHtml.includes(text), `儀表板缺少：${text}`)
}

const monitoringHtml = await readFile(path.join(outputRoot, 'monitoring-overview.html'), 'utf8')
for (const text of ['11 個主要欄位', 'processing', 'Risk Event 與 Alert', 'GGAP P95']) {
    assert(monitoringHtml.includes(text), `監控總覽缺少：${text}`)
}

const riskReportsHtml = await readFile(path.join(outputRoot, 'risk-reports.html'), 'utf8')
for (const text of ['15 個主要欄位', 'rolling 24', '本頁全程唯讀', 'risk_event_id']) {
    assert(riskReportsHtml.includes(text), `風控報表缺少：${text}`)
}

const riskAlertsHtml = await readFile(path.join(outputRoot, 'risk-alerts.html'), 'utf8')
for (const text of ['16 個主要欄位', 'optimistic concurrency', '只阻擋該 scope 的新 Launch', '既有 Round']) {
    assert(riskAlertsHtml.includes(text), `風控告警缺少：${text}`)
}

const css = await readFile(path.join(outputRoot, 'assets/site.css'), 'utf8')
for (const selector of ['.ops-anatomy', '.ops-anatomy__cards--five', '.ops-anatomy__attention', '.ops-anatomy__actions']) {
    assert(css.includes(selector), `Batch B 畫面示意缺少樣式：${selector}`)
}

if (failures.length) {
    console.error(`Batch B validation failed (${failures.length}/${assertionCount})`)
    failures.forEach((failure) => console.error(`- ${failure}`))
    process.exitCode = 1
} else {
    console.log(`Batch B validation passed: ${assertionCount} assertions across ${batchBPageIds.length} pages`)
}

function assert(condition, message) {
    assertionCount += 1
    if (!condition) failures.push(message)
}
