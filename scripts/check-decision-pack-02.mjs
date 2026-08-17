import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { appendices, book, modules } from '../docs/spec-book/manifest.mjs'
import { tbdRegistry } from '../docs/spec-book/tbd-registry.mjs'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const repositoryRoot = path.resolve(scriptDirectory, '..')
const outputRoot = path.join(repositoryRoot, 'public/provider-specs')
const decisionPackId = 'decision-pack-02-monitoring-risk'
const decisionPack = appendices.find((item) => item.id === decisionPackId)
const html = await readFile(path.join(outputRoot, `${decisionPackId}.html`), 'utf8')
const css = await readFile(path.join(outputRoot, 'assets/site.css'), 'utf8')
const searchIndex = await readFile(path.join(outputRoot, 'assets/search-index.js'), 'utf8')
const openIssues = await readFile(path.join(outputRoot, 'open-issues.html'), 'utf8')
const documentControl = await readFile(path.join(outputRoot, 'document-control.html'), 'utf8')
const changelog = await readFile(path.join(outputRoot, 'changelog.html'), 'utf8')
const projectIndex = await readFile(path.join(repositoryRoot, 'docs/PROJECT_TRANSFER_INDEX.md'), 'utf8')
const deferredPages = modules.flatMap((module) => module.pages).filter((page) => page.scope === 'deferred')
const expectedTbd = {
    'TBD-DOM-004': 'partial',
    'TBD-DAT-003': 'partial',
    'TBD-DAT-004': 'definition',
    'TBD-DAT-005': 'partial',
    'TBD-API-004': 'definition',
    'TBD-SEC-003': 'definition',
    'TBD-NFR-003': 'partial',
    'TBD-EXT-001': 'external',
}
const failures = []
let assertionCount = 0

assert(book.version === '0.15.0-phase-three-pack-02-baseline', '規格網站版本必須標示 Decision Pack 02 Baseline')
assert(book.status === 'Phase 3 · Monitoring & Risk Baseline', '規格網站狀態必須標示 Monitoring & Risk Baseline')
assert(Boolean(decisionPack), 'manifest 必須包含 Decision Pack 02')
assert(decisionPack?.number === 'M', 'Decision Pack 02 必須使用附錄 M')
assert(decisionPack?.status === 'confirmed', 'Decision Pack 02 必須標示為目前已確認的產品需求基準')
assert(decisionPack?.content === 'content/appendices/decision-pack-02-monitoring-risk.md', 'Decision Pack 02 必須指向正式 Markdown 來源')

for (const [id, status] of Object.entries(expectedTbd)) {
    const item = tbdRegistry.find((candidate) => candidate.id === id)
    assert(Boolean(item), `集中 TBD 缺少 ${id}`)
    assert(item?.status === status, `${id} 的外部驗證狀態不得被產品基準暗中改寫`)
    assert(html.includes(`open-issues.html#${id.toLowerCase()}`), `Decision Pack 02 缺少 ${id} 的集中追蹤連結`)
}

assert(tbdRegistry.length === 30, 'Decision Pack 02 不得增加、刪除或暗中解決集中 TBD')
assert(deferredPages.length === 11, 'GGAP、通知中心與系統設定的 11 個 Deferred 頁面必須維持不變')
assert(deferredPages.every((page) => page.status === 'outline' && !page.content), 'Deferred 頁面不得因 Decision Pack 02 產生推測內容')

for (const text of [
    'Decision Pack 02｜監控與風控共用產品契約',
    '目前需求基準',
    'Monitoring Signal',
    'Detection Result',
    'Risk Event',
    'Mitigation Job',
    'event_fingerprint',
    'recurrence_group_id',
    'open',
    'recovering',
    'resolved',
    'invalidated',
    'in_progress',
    'monitoring',
    'resolution_code',
    'observe_only',
    'approval_required',
    'automatic',
    'desired_state',
    'actual_state',
    'Launch Gate',
    'outbox',
    'allowed_actions',
    '外部驗證點',
]) {
    assert(html.includes(text), `Decision Pack 02 缺少必要內容：${text}`)
}

assert((html.match(/class="decision-item-meta"/g) || []).length === 5, 'Decision Pack 02 必須包含五個契約群組')
assert((html.match(/class="decision-recommendation"/g) || []).length === 5, '每個契約群組必須包含目前需求基準')
assert((html.match(/<li><b>0[1-6]<\/b><strong>/g) || []).length === 6, 'Decision Pack 02 必須包含六段處理閉環')
assert(!html.includes('請責任方確認'), 'Decision Pack 02 不應使用逐題核准問卷')
assert(!html.includes('替代方案比較'), 'Decision Pack 02 不應使用替代方案比較')
assert(!html.includes('GENERATED_'), 'Decision Pack 02 不得包含未替換的生成標記')

for (const anchor of [
    '1-領域模型與責任鏈',
    '2-risk-event-與-alert-生命週期',
    '3-規則評估與嚴重度',
    '4-緩解工作與隔離控制',
    '5-ggap-通知-可靠性與稽核',
]) {
    assert(html.includes(`href="#${anchor}"`), `Decision Pack 02 摘要缺少快速導覽：${anchor}`)
    assert(html.includes(`id="${anchor}"`), `Decision Pack 02 缺少快速導覽目標：${anchor}`)
}

for (const selector of [
    '.decision-pack-hero--risk',
    '.risk-contract-flow',
    '.risk-contract-flow li:not(:last-child)::after',
    'content: attr(data-pack)',
    '@media (max-width: 900px)',
    '@media (max-width: 620px)',
    '@media print',
]) {
    assert(css.includes(selector), `Decision Pack 02 缺少網站樣式：${selector}`)
}

assert(html.includes('data-pack="DP / 02"'), 'Decision Pack 02 必須顯示正確識別')
assert(html.includes('status-badge status-confirmed">已確認'), 'Decision Pack 02 必須顯示產品需求基準已確認狀態')
assert(searchIndex.includes(`"url":"${decisionPackId}.html"`), 'Decision Pack 02 必須進入全文搜尋索引')
assert(openIssues.includes(`${decisionPackId}.html`), '集中追蹤頁必須提供 Decision Pack 02 入口')
assert(openIssues.includes('產品需求基準'), '集中追蹤頁必須說明 Decision Pack 02 定位')
assert(documentControl.includes(book.version), '文件治理頁必須同步 Decision Pack 02 版本')
assert(documentControl.includes('Signal → Detection Result → Risk Event → Alert → Mitigation Job → Recovery'), '文件治理頁必須記錄完整處理閉環')
assert(changelog.includes('0.15.0-phase-three-pack-02-baseline'), '版本紀錄必須記載 Decision Pack 02')
assert(projectIndex.includes(`${decisionPackId}.html`), '專案交接索引必須提供 Decision Pack 02 入口')
assert(projectIndex.includes('現行 Portal 仍為前端 mock'), '專案交接索引必須揭露現行程式狀態')

if (failures.length) {
    console.error(`Decision Pack 02 validation failed (${failures.length}/${assertionCount})`)
    failures.forEach((failure) => console.error(`- ${failure}`))
    process.exitCode = 1
} else {
    console.log(`Decision Pack 02 validation passed: ${assertionCount} assertions`)
    console.log('Coverage: 5 contract groups / 6-step risk loop / 8 tracked external verification items / 11 Deferred pages preserved')
}

function assert(condition, message) {
    assertionCount += 1
    if (!condition) failures.push(message)
}
