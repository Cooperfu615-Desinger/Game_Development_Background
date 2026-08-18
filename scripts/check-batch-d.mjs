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
const batchDPageIds = ['website-banners', 'website-content', 'website-releases', 'lobby-overview', 'lobby-games', 'lobby-management', 'lobby-demo', 'lobby-preview']
const manifestPages = modules.flatMap((module) => module.pages)

assert(['0.12.0-batch-d-draft', '0.13.0-phase-two-seal', '0.14.0-phase-three-pack-01-draft', '0.14.1-phase-three-pack-01-evidence-pending', '0.15.0-phase-three-pack-02-baseline', '0.16.0-phase-three-contract-baselines', '0.17.0-phase-three-pack-03-baseline', '0.18.0-phase-three-pack-03-source-aligned', '0.19.0-phase-three-pack-03-reconciled'].includes(book.version), '規格網站版本不得早於 Batch D Draft')
assert(book.status.includes('Batch D Draft Complete') || book.status.includes('Draft Sealed') || book.status.includes('Decision Pack 01 Draft') || book.status.includes('Pack 01 Backend Evidence Pending') || book.status.includes('Monitoring & Risk Baseline') || book.status.includes('Product Contract Baselines'), '規格網站狀態不得早於 Batch D Draft Complete')

for (const pageId of batchDPageIds) {
    const page = manifestPages.find((item) => item.id === pageId)
    assert(Boolean(page), `${pageId} 必須存在於 manifest`)
    assert(page?.status === 'draft', `${pageId} 必須標示 Draft`)
    assert(Boolean(page?.content), `${pageId} 必須使用完整內容來源`)
    assert(page?.visualAtTop === true, `${pageId} 必須使用 Overview-first 畫面示意`)
    assert((page?.visualZones || []).length === 6, `${pageId} 必須有六個快速導覽區塊`)
    assert(pageReadiness[pageId]?.batch === 'D', `${pageId} 必須屬於 Batch D`)
    assert(Boolean(pageReconciliation[pageId]), `${pageId} 必須有三層校準資料`)
    assert(tbdRegistry.some((item) => item.pageIds.includes(pageId)), `${pageId} 必須連結集中 TBD`)

    for (const dimension of readinessDimensions.productUi) {
        assert(pageReadiness[pageId][dimension.key] === 'complete', `${pageId} 的 ${dimension.label} 應完成`)
    }
    for (const key of ['responsiveA11y', 'acceptance', 'dependencies']) {
        assert(pageReadiness[pageId][key] === 'complete', `${pageId} 的 ${key} 應完成`)
    }

    const html = await readFile(path.join(outputRoot, `${pageId}.html`), 'utf8')
    for (const requiredText of ['待確認', 'API', 'Draft 移除條件']) {
        assert(html.includes(requiredText), `${pageId} 缺少完整 Draft 必要內容：${requiredText}`)
    }
    assert((html.match(/class="anatomy-zone /g) || []).length === 6, `${pageId} 畫面示意應有六個可點擊區塊`)
    assert(html.includes('id="page-visual-overview"'), `${pageId} 缺少置頂畫面示意`)
    assert(!html.includes('PAGE_VISUAL_START') && !html.includes('PAGE_VISUAL_END'), `${pageId} 仍含未替換畫面標記`)
    for (const zone of page.visualZones) {
        assert(html.includes(`id="${zone.href.slice(1)}"`), `${pageId} 快速導覽缺少目標錨點：${zone.href}`)
    }
}

const bannersHtml = await readFile(path.join(outputRoot, 'website-banners.html'), 'utf8')
for (const text of ['單一 Banner 預覽', '草稿與公開版本分離', '素材版本']) assert(bannersHtml.includes(text), `Banner 管理缺少：${text}`)

const contentHtml = await readFile(path.join(outputRoot, 'website-content.html'), 'utf8')
for (const text of ['受限富文字', '結構化欄位', 'HTML sanitation']) assert(contentHtml.includes(text), `內容管理缺少：${text}`)

const releasesHtml = await readFile(path.join(outputRoot, 'website-releases.html'), 'utf8')
for (const text of ['不可變發布事件', '工作／公開狀態', '不提供全文差異']) assert(releasesHtml.includes(text), `發布紀錄缺少：${text}`)

const overviewHtml = await readFile(path.join(outputRoot, 'lobby-overview.html'), 'utf8')
for (const text of ['不建立會員或錢包主資料', '不是正式業務 Game Session', 'GGAP']) assert(overviewHtml.includes(text), `大廳總覽缺少：${text}`)

const gamesHtml = await readFile(path.join(outputRoot, 'lobby-games.html'), 'utf8')
for (const text of ['八個主要欄位', '清單唯讀', '不取代 Provider 全域上架']) assert(gamesHtml.includes(text), `大廳遊戲清單缺少：${text}`)

const managementHtml = await readFile(path.join(outputRoot, 'lobby-management.html'), 'utf8')
for (const text of ['上游唯讀', 'draft revision', '5 / 5']) assert(managementHtml.includes(text), `大廳遊戲管理缺少：${text}`)

const demoHtml = await readFile(path.join(outputRoot, 'lobby-demo.html'), 'utf8')
for (const text of ['DEMO namespace', '不納入正式 Game Round', '不是 Provider 會員、錢包']) assert(demoHtml.includes(text), `DEMO環境數據缺少：${text}`)

const previewHtml = await readFile(path.join(outputRoot, 'lobby-preview.html'), 'utf8')
for (const text of ['指定草稿 revision', '展示 credit', '草稿失效後不得靜默切到公開版']) assert(previewHtml.includes(text), `大廳預覽缺少：${text}`)

const css = await readFile(path.join(outputRoot, 'assets/site.css'), 'utf8')
for (const selector of ['.publishing-anatomy', '.publishing-anatomy--website', '.publishing-anatomy--lobby', '.publishing-anatomy__dark']) {
    assert(css.includes(selector), `Batch D 畫面示意缺少樣式：${selector}`)
}

if (failures.length) {
    console.error(`Batch D validation failed (${failures.length}/${assertionCount})`)
    failures.forEach((failure) => console.error(`- ${failure}`))
    process.exitCode = 1
} else {
    console.log(`Batch D validation passed: ${assertionCount} assertions across ${batchDPageIds.length} pages`)
}

function assert(condition, message) {
    assertionCount += 1
    if (!condition) failures.push(message)
}
