import { access, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { appendices, crossCutting, foundation, modules, scopeLabels } from '../docs/spec-book/manifest.mjs'
import { pageReadiness, readinessDimensions, readinessLevels } from '../docs/spec-book/readiness.mjs'
import { pageReconciliation, reconciliationStates } from '../docs/spec-book/reconciliation.mjs'
import { deferredDependencies, dependencyChains, dependencyKinds, dependencyMaturity } from '../docs/spec-book/dependencies.mjs'
import { blockingScopes, tbdCategories, tbdPriorities, tbdRegistry, tbdStatuses } from '../docs/spec-book/tbd-registry.mjs'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const repositoryRoot = path.resolve(scriptDirectory, '..')
const outputRoot = path.join(repositoryRoot, 'public/provider-specs')
const contentPages = modules.flatMap((module) => module.pages)
const assessedPages = contentPages.filter((page) => ['baseline', 'active'].includes(page.scope))
const readinessDimensionList = [...readinessDimensions.productUi, ...readinessDimensions.delivery]
const expectedIds = [
    'index',
    ...foundation.map((item) => item.id),
    ...modules.flatMap((module) => [module.id, ...module.pages.map((page) => page.id)]),
    ...crossCutting.map((item) => item.id),
    ...appendices.map((item) => item.id),
]
const failures = []

assert(contentPages.length === 32, `內容頁應為 32，實際為 ${contentPages.length}`)
assert(contentPages.filter((page) => page.prototype === 'complete').length === 25, '已有內容原型頁應為 25')
assert(contentPages.filter((page) => page.prototype === 'placeholder').length === 7, 'Placeholder 頁應為 7')
assert(contentPages.filter((page) => page.scope === 'baseline').length === 1, 'Baseline 頁應為 1')
assert(contentPages.filter((page) => page.scope === 'active').length === 20, 'Active 頁應為 20')
assert(contentPages.filter((page) => page.scope === 'deferred').length === 11, 'Deferred 頁應為 11')
assert(contentPages.filter((page) => page.scope === 'blocked').length === 0, '目前不應有 Blocked 頁')
assert(contentPages.every((page) => scopeLabels[page.scope]), '所有內容頁都必須使用已定義的製作範圍')
assert(contentPages.find((page) => page.id === 'game-environments')?.scope === 'active', '環境與發布應保留為 Active')
assert(assessedPages.length === 21, '完成度矩陣應評估 21 頁')
assert(Object.keys(pageReadiness).length === assessedPages.length, '完成度資料筆數應與本輪頁數一致')
assert(assessedPages.every((page) => pageReadiness[page.id]), '所有 Baseline／Active 頁都必須有完成度資料')
assert(contentPages.filter((page) => page.scope === 'deferred').every((page) => !pageReadiness[page.id]), 'Deferred 頁不應進行完成度評估')
assert(readinessDimensionList.length === 12, '完成度矩陣應包含 12 個評估面向')
assert(assessedPages.every((page) => readinessDimensionList.every((dimension) => readinessLevels[pageReadiness[page.id][dimension.key]])), '所有完成度值都必須使用已定義評級')
assert(['A', 'B', 'C', 'D'].every((batch, index) => assessedPages.filter((page) => pageReadiness[page.id].batch === batch).length === [3, 4, 6, 8][index]), 'A–D 批次頁數應為 3、4、6、8')
assert(assessedPages.every((page) => pageReadiness[page.id].blockers.length > 0), '每個本輪頁面都必須列出待補主題')
assert(Object.keys(pageReconciliation).length === assessedPages.length, '三層校準資料筆數應與本輪頁數一致')
assert(assessedPages.every((page) => pageReconciliation[page.id]), '所有 Baseline／Active 頁都必須有三層校準資料')
assert(contentPages.filter((page) => page.scope === 'deferred').every((page) => !pageReconciliation[page.id]), 'Deferred 頁不應建立三層校準')
assert(assessedPages.every((page) => reconciliationStates[pageReconciliation[page.id].state]), '所有頁面都必須使用已定義的校準狀態')
assert(assessedPages.every((page) => ['confirmed', 'prototype', 'target'].every((key) => pageReconciliation[page.id][key].length > 0)), '每個本輪頁面都必須包含三層校準內容')
assert(['aligned', 'attention', 'gap'].every((state, index) => assessedPages.filter((page) => pageReconciliation[page.id].state === state).length === [8, 13, 0][index]), '校準狀態頁數應為 8、13、0')
const dependencyPageIds = new Set(dependencyChains.flatMap((chain) => chain.nodes.flatMap((node) => node.pageIds)))
const dependencyEdges = dependencyChains.flatMap((chain) => chain.edges)
assert(dependencyChains.length === 4, '跨頁依賴圖應包含四條核心業務鏈')
assert(dependencyEdges.length === 15, '跨頁依賴圖應包含 15 條依賴關係')
assert(assessedPages.every((page) => dependencyPageIds.has(page.id)), '所有 Baseline／Active 頁都必須出現在依賴圖')
assert(contentPages.filter((page) => page.scope === 'deferred').every((page) => !dependencyPageIds.has(page.id)), 'Deferred 頁不可成為核心業務鏈節點')
assert(dependencyChains.every((chain) => chain.edges.length === chain.nodes.length - 1), '每條核心業務鏈必須是可追溯的線性節點／箭頭序列')
assert(dependencyChains.every((chain) => {
    const nodeIds = new Set(chain.nodes.map((node) => node.id))
    return chain.edges.every((edge) => nodeIds.has(edge.from) && nodeIds.has(edge.to) && dependencyKinds[edge.kind] && dependencyMaturity[edge.maturity])
}), '依賴箭頭必須參照同鏈節點並使用已定義類型與成熟度')
assert(deferredDependencies.length === 3, '應包含 GGAP、通知中心與系統設定三項 Deferred 依賴')
assert(deferredDependencies.every((item) => item.targets.every((pageId) => assessedPages.some((page) => page.id === pageId))), 'Deferred 依賴只能指向 Baseline／Active 頁')
assert(deferredDependencies.find((item) => item.id === 'settings-dependency')?.targets.length === assessedPages.length, '系統設定安全邊界應影響全部本輪頁面')
const tbdIds = new Set(tbdRegistry.map((item) => item.id))
const assessedPageIds = new Set(assessedPages.map((page) => page.id))
const dependencyChainIds = new Set(dependencyChains.map((chain) => chain.id))
assert(tbdRegistry.length === 30, `集中 TBD 應包含 30 項，實際為 ${tbdRegistry.length}`)
assert(tbdIds.size === tbdRegistry.length, '集中 TBD ID 不可重複')
assert(Object.keys(tbdCategories).every((category, index) => tbdRegistry.filter((item) => item.category === category).length === [6, 6, 6, 5, 4, 3][index]), 'TBD 六分類筆數應為 6、6、6、5、4、3')
assert(tbdRegistry.every((item) => /^TBD-[A-Z]{3}-\d{3}$/.test(item.id)), '所有集中 TBD 必須使用穩定 TBD-XXX-000 ID')
assert(tbdRegistry.every((item) => tbdCategories[item.category] && tbdStatuses[item.status] && tbdPriorities[item.priority]), '所有集中 TBD 必須使用已定義分類、狀態與優先級')
assert(tbdRegistry.every((item) => item.title && item.question && item.neededBy && item.owners.length && item.pageIds.length && item.blocks.length), '所有集中 TBD 必須包含問題、責任方、影響頁面、阻擋範圍與需要時間')
assert(tbdRegistry.every((item) => item.pageIds.every((pageId) => assessedPageIds.has(pageId))), '集中 TBD 只能連結 Baseline／Active 頁面')
assert(tbdRegistry.every((item) => item.chainIds.every((chainId) => dependencyChainIds.has(chainId))), '集中 TBD 只能連結已定義業務鏈')
assert(tbdRegistry.every((item) => item.blocks.every((scope) => blockingScopes[scope])), '集中 TBD 必須使用已定義阻擋範圍')
assert(assessedPages.every((page) => tbdRegistry.some((item) => item.pageIds.includes(page.id))), '所有 Baseline／Active 頁面都必須至少關聯一項集中 TBD')
assert(tbdRegistry.filter((item) => item.category === 'external').length === deferredDependencies.length, 'External TBD 應對應三項 Deferred 外部依賴')
for (const id of ['TBD-API-001', 'TBD-SEC-001', 'TBD-NFR-004', 'TBD-EXT-003']) {
    assert(tbdRegistry.find((item) => item.id === id)?.pageIds.length === assessedPages.length, `${id} 應影響全部本輪頁面`)
}
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
    assert(!html.includes('GENERATED_'), `${fileName} 仍含未替換的生成標記`)

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
for (const requiredText of ['Overview first', '製作範圍必須獨立管理', '逐面向完成度稽核', '可複製的頁面規格模板', '移植至其他專案', 'Provider Portal 專案接續方式']) {
    assert(authoringGuideHtml.includes(requiredText), `規格書撰寫與交接規範缺少必要內容：${requiredText}`)
}

const readinessHtml = await readFile(path.join(outputRoot, 'page-readiness-matrix.html'), 'utf8')
for (const requiredText of ['21', '產品與 UI 完成度', '開發交付完成度', '待補主題與阻擋', 'GAME_ROUND_RECORDS_SPEC.md']) {
    assert(readinessHtml.includes(requiredText), `第一階段完成度矩陣缺少必要內容：${requiredText}`)
}
assert((readinessHtml.match(/class="readiness-badge /g) || []).length === assessedPages.length * readinessDimensionList.length, '完成度矩陣評級數量不正確')

const reconciliationHtml = await readFile(path.join(outputRoot, 'page-reconciliation.html'), 'utf8')
for (const requiredText of ['已確認產品規則', '現行原型實況', '目標草案／待確認', 'DEMO 餘額 USD 10,000.00', 'Provider 不建立或管理代理商主資料']) {
    assert(reconciliationHtml.includes(requiredText), `第一階段頁面三層校準缺少必要內容：${requiredText}`)
}
assert((reconciliationHtml.match(/class="reconciliation-card /g) || []).length === assessedPages.length, '三層校準卡片數量不正確')
assert((reconciliationHtml.match(/class="reconciliation-confirmed"/g) || []).length === assessedPages.length, '三層校準缺少已確認產品規則欄')
assert((reconciliationHtml.match(/class="reconciliation-prototype"/g) || []).length === assessedPages.length, '三層校準缺少原型實況欄')
assert((reconciliationHtml.match(/class="reconciliation-target"/g) || []).length === assessedPages.length, '三層校準缺少目標草案欄')

const dependencyHtml = await readFile(path.join(outputRoot, 'page-dependency-map.html'), 'utf8')
for (const requiredText of ['Game Round 與財務鏈', '監控與風控鏈', '遊戲生命週期鏈', '官網與遊戲大廳鏈', 'Deferred 外部依賴', 'credit 不代表錢包']) {
    assert(dependencyHtml.includes(requiredText), `第一階段跨頁依賴圖缺少必要內容：${requiredText}`)
}
assert((dependencyHtml.match(/class="dependency-chain"/g) || []).length === dependencyChains.length, '跨頁依賴圖業務鏈數量不正確')
assert((dependencyHtml.match(/class="dependency-node"/g) || []).length === dependencyChains.reduce((total, chain) => total + chain.nodes.length, 0), '跨頁依賴圖節點數量不正確')
assert((dependencyHtml.match(/class="dependency-edge /g) || []).length === dependencyEdges.length, '跨頁依賴圖箭頭數量不正確')
assert((dependencyHtml.match(/class="deferred-dependency-card"/g) || []).length === deferredDependencies.length, 'Deferred 依賴卡片數量不正確')

const tbdHtml = await readFile(path.join(outputRoot, 'open-issues.html'), 'utf8')
for (const requiredText of ['集中 TBD 登錄', '產品領域與生命週期', '資料、計算與保存', '介面與整合契約', '權限、敏感資料與稽核', '效能、可靠性與可用性', '外部規格與延後模組依賴', '頁面覆蓋索引']) {
    assert(tbdHtml.includes(requiredText), `集中 TBD 登錄缺少必要內容：${requiredText}`)
}
assert((tbdHtml.match(/class="tbd-card"/g) || []).length === tbdRegistry.length, '集中 TBD 卡片數量不正確')
assert((tbdHtml.match(/class="tbd-priority tbd-priority-p0"/g) || []).length === tbdRegistry.filter((item) => item.priority === 'P0').length, '集中 TBD P0 數量不正確')
assert(assessedPages.every((page) => tbdHtml.includes(`href="${page.id}.html"`)), '集中 TBD 頁面覆蓋索引必須連結所有本輪頁面')

const sealReportHtml = await readFile(path.join(outputRoot, 'phase-one-validation-report.html'), 'utf8')
for (const requiredText of ['第一階段封版 Gate', 'main@d827c59', 'Gate 結果', '251 項 assertion', '阻擋缺陷', '非阻擋注意事項', '封版判定與重開條件']) {
    assert(sealReportHtml.includes(requiredText), `第一階段封版驗證報告缺少必要內容：${requiredText}`)
}
assert(sealReportHtml.includes('PASS'), '第一階段封版驗證報告缺少 PASS 結論')
assert(sealReportHtml.includes('不表示 21 個頁面已全部成為 Confirmed 規格'), '第一階段封版報告必須避免被誤讀為全部規格已確認')

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
assert(siteCss.includes('.readiness-summary-grid'), '規格網站缺少完成度摘要樣式')
assert(siteCss.includes('.readiness-badge.readiness-missing'), '規格網站缺少完成度評級樣式')
assert(siteCss.includes('.reconciliation-columns'), '規格網站缺少三層校準欄位樣式')
assert(siteCss.includes('.reconciliation-state-attention'), '規格網站缺少校準狀態樣式')
assert(siteCss.includes('.dependency-flow'), '規格網站缺少跨頁依賴流程樣式')
assert(siteCss.includes('.dependency-edge__guardrail'), '規格網站缺少依賴 Guardrail 樣式')
assert(siteCss.includes('.tbd-summary-grid'), '規格網站缺少集中 TBD 摘要樣式')
assert(siteCss.includes('.tbd-card__question'), '規格網站缺少集中 TBD 問題卡樣式')
assert(siteCss.includes('.tbd-priority-p0'), '規格網站缺少集中 TBD 優先級樣式')

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
