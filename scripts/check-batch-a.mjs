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
const batchAPageIds = ['game-round-records', 'finance-overview', 'finance-agent-games']
const manifestPages = modules.flatMap((module) => module.pages)

assert(['0.9.0-batch-a-draft', '0.10.0-batch-b-draft', '0.11.0-batch-c-draft', '0.12.0-batch-d-draft', '0.13.0-phase-two-seal', '0.14.0-phase-three-pack-01-draft', '0.14.1-phase-three-pack-01-evidence-pending', '0.15.0-phase-three-pack-02-baseline', '0.16.0-phase-three-contract-baselines', '0.17.0-phase-three-pack-03-baseline', '0.18.0-phase-three-pack-03-source-aligned', '0.19.0-phase-three-pack-03-reconciled', '0.20.0-phase-three-pack-04-baseline'].includes(book.version), '規格網站版本不得早於 Batch A Draft')

for (const pageId of batchAPageIds) {
    const page = manifestPages.find((item) => item.id === pageId)
    assert(Boolean(page), `${pageId} 必須存在於 manifest`)
    assert(page?.status === 'draft', `${pageId} 必須標示 Draft`)
    assert(Boolean(page?.content), `${pageId} 必須使用完整內容來源`)
    assert(page?.visualAtTop === true, `${pageId} 必須使用 Overview-first 畫面示意`)
    assert((page?.visualZones || []).length === 6, `${pageId} 必須有六個快速導覽區塊`)
    assert(pageReadiness[pageId]?.batch === 'A', `${pageId} 必須屬於 Batch A`)
    assert(Boolean(pageReconciliation[pageId]), `${pageId} 必須有三層校準資料`)
    assert(tbdRegistry.some((item) => item.pageIds.includes(pageId)), `${pageId} 必須連結集中 TBD`)

    const html = await readFile(path.join(outputRoot, `${pageId}.html`), 'utf8')
    for (const text of ['Production only', '驗收條件', '待確認事項', 'API 契約']) {
        assert(html.includes(text), `${pageId} 缺少完整 Draft 必要內容：${text}`)
    }
    assert((html.match(/class="anatomy-zone /g) || []).length === 6, `${pageId} 畫面示意應有六個可點擊區塊`)
    assert(html.includes('id="page-visual-overview"'), `${pageId} 缺少置頂畫面示意`)
    assert(!html.includes('PAGE_VISUAL_START') && !html.includes('PAGE_VISUAL_END'), `${pageId} 仍含未替換畫面標記`)
}

for (const pageId of ['finance-overview', 'finance-agent-games']) {
    for (const dimension of readinessDimensions.productUi) {
        assert(pageReadiness[pageId][dimension.key] === 'complete', `${pageId} 的 ${dimension.label} 應完成`)
    }
    for (const key of ['responsiveA11y', 'acceptance', 'dependencies']) {
        assert(pageReadiness[pageId][key] === 'complete', `${pageId} 的 ${key} 應完成`)
    }
}

const overviewHtml = await readFile(path.join(outputRoot, 'finance-overview.html'), 'utf8')
for (const text of ['八張摘要卡', '財務趨勢', '活動趨勢', '遊戲表現排行', 'TBD-API-003']) {
    assert(overviewHtml.includes(text), `財務總覽缺少：${text}`)
}

const agentGamesHtml = await readFile(path.join(outputRoot, 'finance-agent-games.html'), 'utf8')
for (const text of ['agent_id × game_id', '11 個主要欄位', 'Game Round 導流', '必要欄位', 'TBD-DAT-002']) {
    assert(agentGamesHtml.includes(text), `代理商 × 遊戲彙總缺少：${text}`)
}

const roundHtml = await readFile(path.join(outputRoot, 'game-round-records.html'), 'utf8')
for (const text of ['/finance', '/finance/agent-games', 'TBD-API-003']) {
    assert(roundHtml.includes(text), `遊戲紀錄缺少 Batch A 回填：${text}`)
}

const css = await readFile(path.join(outputRoot, 'assets/site.css'), 'utf8')
for (const selector of ['.finance-anatomy', '.finance-anatomy__summary', '.finance-anatomy__charts', '.finance-anatomy__table--agent']) {
    assert(css.includes(selector), `Batch A 畫面示意缺少樣式：${selector}`)
}

if (failures.length) {
    console.error(`Batch A validation failed (${failures.length}/${assertionCount})`)
    failures.forEach((failure) => console.error(`- ${failure}`))
    process.exitCode = 1
} else {
    console.log(`Batch A validation passed: ${assertionCount} assertions across ${batchAPageIds.length} pages`)
}

function assert(condition, message) {
    assertionCount += 1
    if (!condition) failures.push(message)
}
