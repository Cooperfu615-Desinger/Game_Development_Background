import { access, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { appendices, crossCutting, foundation, modules, scopeLabels } from '../docs/spec-book/manifest.mjs'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const repositoryRoot = path.resolve(scriptDirectory, '..')
const outputRoot = path.join(repositoryRoot, 'public/provider-specs')
const contentPages = modules.flatMap((module) => module.pages)
const expectedIds = [
    'index',
    ...foundation.map((item) => item.id),
    ...modules.flatMap((module) => [module.id, ...module.pages.map((page) => page.id)]),
    ...crossCutting.map((item) => item.id),
    ...appendices.map((item) => item.id),
]
const failures = []

assert(contentPages.length === 32, `內容頁應為 32，實際為 ${contentPages.length}`)
assert(contentPages.filter((page) => page.prototype === 'complete').length === 24, '已有內容原型頁應為 24')
assert(contentPages.filter((page) => page.prototype === 'placeholder').length === 8, 'Placeholder 頁應為 8')
assert(contentPages.filter((page) => page.scope === 'baseline').length === 1, 'Baseline 頁應為 1')
assert(contentPages.filter((page) => page.scope === 'active').length === 20, 'Active 頁應為 20')
assert(contentPages.filter((page) => page.scope === 'deferred').length === 11, 'Deferred 頁應為 11')
assert(contentPages.filter((page) => page.scope === 'blocked').length === 0, '目前不應有 Blocked 頁')
assert(contentPages.every((page) => scopeLabels[page.scope]), '所有內容頁都必須使用已定義的製作範圍')
assert(contentPages.find((page) => page.id === 'game-environments')?.scope === 'active', '環境與發布應保留為 Active')
assert(new Set(expectedIds).size === expectedIds.length, '文件 ID 不可重複')

for (const asset of ['assets/site.css', 'assets/site.js', 'assets/search-index.js']) {
    try {
        await access(path.join(outputRoot, asset))
    } catch {
        failures.push(`缺少網站資源：${asset}`)
    }
}

for (const id of expectedIds) {
    const fileName = id === 'index' ? 'index.html' : `${id}.html`
    const filePath = path.join(outputRoot, fileName)
    let html = ''
    try {
        html = await readFile(filePath, 'utf8')
    } catch {
        failures.push(`缺少頁面：${fileName}`)
        continue
    }

    assert(html.includes('<html lang="zh-Hant">'), `${fileName} 缺少繁體中文語系宣告`)
    assert(html.includes('<main id="main-content"'), `${fileName} 缺少主要內容 landmark`)
    assert(html.includes('aria-current="page"'), `${fileName} 缺少目前導覽狀態`)
    assert(!html.includes('GENERATED_PAGE_MATRIX'), `${fileName} 仍含未替換的生成標記`)

    const localHtmlLinks = [...html.matchAll(/href="([^"#?]+\.html)(?:[?#][^"]*)?"/g)].map((match) => match[1])
    for (const link of localHtmlLinks) {
        try {
            await access(path.resolve(outputRoot, link))
        } catch {
            failures.push(`${fileName} 連到不存在的頁面：${link}`)
        }
    }
}

const pilotHtml = await readFile(path.join(outputRoot, 'game-round-records.html'), 'utf8')
for (const requiredText of ['PILOT 章節', 'API 契約草案', '驗收條件', '待確認事項', 'Production only']) {
    assert(pilotHtml.includes(requiredText), `遊戲紀錄缺少必要內容：${requiredText}`)
}

assert((pilotHtml.match(/class="anatomy-zone /g) || []).length === 6, '遊戲紀錄應包含六個畫面解剖區塊')
assert(pilotHtml.includes('Game Round 詳情 Dialog'), '遊戲紀錄示意缺少原型詳情 Dialog')
assert(pilotHtml.includes('href="#8-game-round-明細"'), '遊戲紀錄示意缺少明細章節連結')
assert(pilotHtml.includes('id="page-visual-overview"'), '遊戲紀錄缺少置頂頁面示意')
assert(pilotHtml.includes('data-anatomy-toggle'), '遊戲紀錄缺少頁面示意展開控制')
assert((pilotHtml.match(/class="visual-quick-map"/g) || []).length === 1, '遊戲紀錄應包含一組快速區塊導覽')
assert(!pilotHtml.includes('PAGE_VISUAL_START') && !pilotHtml.includes('PAGE_VISUAL_END'), '遊戲紀錄仍含頁面示意來源標記')
assert(!pilotHtml.includes('規格來源'), '遊戲紀錄追溯卡不應顯示規格來源')
assert(!pilotHtml.includes('畫面原型'), '遊戲紀錄追溯卡不應顯示畫面原型')
assert(!pilotHtml.includes('page-anatomy__caption'), '遊戲紀錄畫面示意不應重複顯示圖說頁首')
assert(
    pilotHtml.indexOf('id="page-visual-overview"') < pilotHtml.indexOf('id="章節狀態"'),
    '遊戲紀錄頁面示意應出現在詳細章節之前',
)

const authoringGuideHtml = await readFile(path.join(outputRoot, 'spec-book-authoring-guide.html'), 'utf8')
for (const requiredText of ['Overview first', '製作範圍必須獨立管理', '可複製的頁面規格模板', '移植至其他專案', 'Provider Portal 專案接續方式']) {
    assert(authoringGuideHtml.includes(requiredText), `規格書撰寫與交接規範缺少必要內容：${requiredText}`)
}

for (const page of contentPages.filter((item) => item.scope === 'deferred')) {
    const html = await readFile(path.join(outputRoot, `${page.id}.html`), 'utf8')
    for (const requiredText of ['延後製作', '重新啟動前需要的輸入', '不可作為前端、後端或 QA 的開發依據']) {
        assert(html.includes(requiredText), `${page.id} 缺少延後頁必要內容：${requiredText}`)
    }
    assert(!html.includes('後續完整章節骨架'), `${page.id} 不應顯示一般待整理骨架`)
    assert(!html.includes('page-visual-overview'), `${page.id} 不應顯示頁面畫面示意`)
}

const siteCss = await readFile(path.join(outputRoot, 'assets/site.css'), 'utf8')
assert(siteCss.includes('Provider Portal-aligned documentation skin'), '規格網站缺少 Portal 視覺對齊層')
assert(siteCss.includes('@media print'), '規格網站缺少列印樣式')
assert(siteCss.includes('--annotation: #478eff'), '畫面示意編號應使用統一藍色')
assert(siteCss.includes('width: 100%;\n    max-width: none;'), '規格內文應填滿目錄以外的主欄寬度')

const indexHtml = await readFile(path.join(outputRoot, 'index.html'), 'utf8')
for (const relativeAsset of ['assets/site.css', 'assets/search-index.js', 'assets/site.js']) {
    assert(indexHtml.includes(relativeAsset), `首頁缺少離線相對資源：${relativeAsset}`)
}

if (failures.length) {
    console.error(`Spec site validation failed (${failures.length})`)
    failures.forEach((failure) => console.error(`- ${failure}`))
    process.exitCode = 1
} else {
    console.log(`Spec site validation passed: ${expectedIds.length} documents, ${contentPages.length} content pages, all local links resolved`)
}

function assert(condition, message) {
    if (!condition) failures.push(message)
}
