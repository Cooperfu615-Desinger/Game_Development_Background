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
const batchCPageIds = ['game-list', 'game-environments', 'game-settings', 'game-math', 'game-versions', 'game-assets']
const manifestPages = modules.flatMap((module) => module.pages)

assert(book.version === '0.11.0-batch-c-draft', '規格網站版本應標示 Batch C Draft')
assert(book.status.includes('Batch C Draft Complete'), '規格網站狀態應標示 Batch C Draft Complete')

for (const pageId of batchCPageIds) {
    const page = manifestPages.find((item) => item.id === pageId)
    assert(Boolean(page), `${pageId} 必須存在於 manifest`)
    assert(page?.status === 'draft', `${pageId} 必須標示 Draft`)
    assert(Boolean(page?.content), `${pageId} 必須使用完整內容來源`)
    assert(page?.visualAtTop === true, `${pageId} 必須使用 Overview-first 畫面示意`)
    assert((page?.visualZones || []).length === 6, `${pageId} 必須有六個快速導覽區塊`)
    assert(pageReadiness[pageId]?.batch === 'C', `${pageId} 必須屬於 Batch C`)
    assert(Boolean(pageReconciliation[pageId]), `${pageId} 必須有三層校準資料`)
    assert(tbdRegistry.some((item) => item.pageIds.includes(pageId)), `${pageId} 必須連結集中 TBD`)

    for (const dimension of readinessDimensions.productUi) {
        assert(pageReadiness[pageId][dimension.key] === 'complete', `${pageId} 的 ${dimension.label} 應完成`)
    }
    for (const key of ['responsiveA11y', 'acceptance', 'dependencies']) {
        assert(pageReadiness[pageId][key] === 'complete', `${pageId} 的 ${key} 應完成`)
    }

    const html = await readFile(path.join(outputRoot, `${pageId}.html`), 'utf8')
    for (const requiredText of ['待確認事項', 'API 契約草案', 'TBD-API-005']) {
        assert(html.includes(requiredText), `${pageId} 缺少完整 Draft 必要內容：${requiredText}`)
    }
    assert(html.includes('Draft 移除條件') || html.includes('Placeholder 移除條件'), `${pageId} 缺少 Draft／Placeholder 移除條件`)
    assert((html.match(/class="anatomy-zone /g) || []).length === 6, `${pageId} 畫面示意應有六個可點擊區塊`)
    assert(html.includes('id="page-visual-overview"'), `${pageId} 缺少置頂畫面示意`)
    assert(!html.includes('PAGE_VISUAL_START') && !html.includes('PAGE_VISUAL_END'), `${pageId} 仍含未替換畫面標記`)
}

const listHtml = await readFile(path.join(outputRoot, 'game-list.html'), 'utf8')
for (const text of ['14 欄', 'Test 只讀', 'GGAP 同步不等於代理商個別開放', 'RTP Tips']) assert(listHtml.includes(text), `遊戲列表缺少：${text}`)

const environmentsHtml = await readFile(path.join(outputRoot, 'game-environments.html'), 'utf8')
for (const text of ['程式仍為 Placeholder', '發布組合', '只影響新 Launch', '代理商個別開放仍屬 GGAP']) assert(environmentsHtml.includes(text), `環境與發布缺少：${text}`)

const settingsHtml = await readFile(path.join(outputRoot, 'game-settings.html'), 'utf8')
for (const text of ['Provider 點數', 'USD／TWD 選項不是正式契約', 'active 模板需複製新版本']) assert(settingsHtml.includes(text), `遊戲設定缺少：${text}`)

const mathHtml = await readFile(path.join(outputRoot, 'game-math.html'), 'utf8')
for (const text of ['設定版本與監控指標不得混成', '偏離 ≥ 5%', 'Test 不進 Provider 風控']) assert(mathHtml.includes(text), `數值設定缺少：${text}`)

const versionsHtml = await readFile(path.join(outputRoot, 'game-versions.html'), 'utf8')
for (const text of ['商戶主資料', '回復不是把版本狀態改回去', 'artifact checksum']) assert(versionsHtml.includes(text), `遊戲版本缺少：${text}`)

const assetsHtml = await readFile(path.join(outputRoot, 'game-assets.html'), 'utf8')
for (const text of ['不可變素材版本', '惡意檔案掃描', '不得覆寫舊檔']) assert(assetsHtml.includes(text), `遊戲素材缺少：${text}`)

const css = await readFile(path.join(outputRoot, 'assets/site.css'), 'utf8')
for (const selector of ['.lifecycle-anatomy', '.lifecycle-anatomy__matrix', '.lifecycle-anatomy__chart', '.lifecycle-anatomy__table--asset']) {
    assert(css.includes(selector), `Batch C 畫面示意缺少樣式：${selector}`)
}

if (failures.length) {
    console.error(`Batch C validation failed (${failures.length}/${assertionCount})`)
    failures.forEach((failure) => console.error(`- ${failure}`))
    process.exitCode = 1
} else {
    console.log(`Batch C validation passed: ${assertionCount} assertions across ${batchCPageIds.length} pages`)
}

function assert(condition, message) {
    assertionCount += 1
    if (!condition) failures.push(message)
}
