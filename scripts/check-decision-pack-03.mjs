import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { appendices, book, modules } from '../docs/spec-book/manifest.mjs'
import { tbdRegistry } from '../docs/spec-book/tbd-registry.mjs'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const repositoryRoot = path.resolve(scriptDirectory, '..')
const outputRoot = path.join(repositoryRoot, 'public/provider-specs')
const decisionPackId = 'decision-pack-03-game-release-lifecycle'
const decisionPack = appendices.find((item) => item.id === decisionPackId)
const html = await readFile(path.join(outputRoot, `${decisionPackId}.html`), 'utf8')
const css = await readFile(path.join(outputRoot, 'assets/site.css'), 'utf8')
const searchIndex = await readFile(path.join(outputRoot, 'assets/search-index.js'), 'utf8')
const openIssues = await readFile(path.join(outputRoot, 'open-issues.html'), 'utf8')
const documentControl = await readFile(path.join(outputRoot, 'document-control.html'), 'utf8')
const changelog = await readFile(path.join(outputRoot, 'changelog.html'), 'utf8')
const projectIndex = await readFile(path.join(repositoryRoot, 'docs/PROJECT_TRANSFER_INDEX.md'), 'utf8')
const deferredPages = modules.flatMap((module) => module.pages).filter((page) => page.scope === 'deferred')
const environmentPage = modules.flatMap((module) => module.pages).find((page) => page.id === 'game-environments')
const expectedTbd = {
    'TBD-DOM-001': 'partial',
    'TBD-DOM-003': 'partial',
    'TBD-DAT-004': 'definition',
    'TBD-API-005': 'definition',
    'TBD-SEC-001': 'external',
    'TBD-SEC-003': 'partial',
    'TBD-NFR-003': 'partial',
    'TBD-EXT-001': 'external',
}
const failures = []
let assertionCount = 0

assert(book.version === '0.20.0-phase-three-pack-04-baseline', '規格網站版本必須保留 Decision Pack 03 並包含 Pack 04 基準')
assert(book.status === 'Phase 3 · Product Contract Baselines', '規格網站狀態必須維持 Product Contract Baselines')
assert(Boolean(decisionPack), 'manifest 必須包含 Decision Pack 03')
assert(decisionPack?.number === 'N', 'Decision Pack 03 必須使用附錄 N')
assert(decisionPack?.status === 'confirmed', 'Decision Pack 03 必須標示為目前已確認的產品需求基準')
assert(decisionPack?.content === 'content/appendices/decision-pack-03-game-release-lifecycle.md', 'Decision Pack 03 必須指向正式 Markdown 來源')

for (const [id, status] of Object.entries(expectedTbd)) {
    const item = tbdRegistry.find((candidate) => candidate.id === id)
    assert(Boolean(item), `集中 TBD 缺少 ${id}`)
    assert(item?.status === status, `${id} 的實作驗證狀態不得被產品基準暗中改寫`)
    assert(html.includes(`open-issues.html#${id.toLowerCase()}`), `Decision Pack 03 缺少 ${id} 的集中追蹤連結`)
}

assert(tbdRegistry.length === 30, 'Decision Pack 03 不得增加、刪除或暗中解決集中 TBD')
assert(deferredPages.length === 11, 'GGAP、通知中心與系統設定的 11 個 Deferred 頁面必須維持不變')
assert(deferredPages.every((page) => page.status === 'outline' && !page.content), 'Deferred 頁面不得因 Decision Pack 03 產生推測內容')
assert(environmentPage?.prototype === 'complete', '環境與發布必須標示為已有內容原型')
assert(environmentPage?.component === 'src/views/Games/Environments.vue', '環境與發布 manifest 必須追溯實際原型元件')

for (const text of [
    'Decision Pack 03｜遊戲版本與發布生命週期',
    '目前需求基準',
    'Game Version',
    'Build Artifact',
    'Release Record',
    'Active Release',
    'release_status_history',
    'draft',
    'candidate',
    'approved',
    'published',
    'retired',
    'cancelled',
    'Test → DEMO → Production',
    '同一份 Artifact',
    '標準快速發布',
    '高風險發布',
    '單一發布管理者',
    '第二人核准',
    'unpublished',
    'available',
    'maintenance',
    'suspended',
    'Provider global status',
    'desired_state',
    'actual_state',
    'Launch Context',
    '不建立 Game Session',
    'Game Round 永久固定版本',
    'Append-only Audit',
    '實作接軌檢查清單',
    '不是本包的阻擋或待決策',
]) {
    assert(html.includes(text), `Decision Pack 03 缺少必要內容：${text}`)
}

assert((html.match(/class="decision-item-meta"/g) || []).length === 8, 'Decision Pack 03 必須包含八個契約群組')
assert((html.match(/class="decision-recommendation"/g) || []).length === 8, '每個契約群組必須包含目前需求基準')
assert((html.match(/<li><b>0[1-6]<\/b><strong>/g) || []).length === 6, 'Decision Pack 03 必須包含六段版本發布鏈')
assert((html.match(/class="release-lane release-lane--/g) || []).length === 2, 'Decision Pack 03 必須呈現快速與高風險兩種發布通道')
assert(!html.includes('請責任方確認'), 'Decision Pack 03 不應使用逐題核准問卷')
assert(!html.includes('替代方案比較'), 'Decision Pack 03 不應使用替代方案比較')
assert(!html.includes('Backend Evidence Pending'), 'Decision Pack 03 不應標示 Backend Evidence Pending')
assert(!html.includes('GENERATED_'), 'Decision Pack 03 不得包含未替換的生成標記')

for (const anchor of [
    '1-四個核心物件與責任邊界',
    '2-版本與發布狀態',
    '3-三環境晉級',
    '4-快速發布與高風險發布',
    '5-全域可用性與-ggap-邊界',
    '6-失敗回滾與緊急控制',
    '7-launch-與-game-round-相容性',
    '8-權限稽核通知與驗收',
]) {
    assert(html.includes(`href="#${anchor}"`), `Decision Pack 03 摘要缺少快速導覽：${anchor}`)
    assert(html.includes(`id="${anchor}"`), `Decision Pack 03 缺少快速導覽目標：${anchor}`)
}

for (const selector of [
    '.decision-pack-hero--release',
    '.decision-pack-hero__nav--release',
    '.release-lifecycle-flow',
    '.release-lifecycle-flow li:not(:last-child)::after',
    '.release-environment-rail',
    '.release-lanes',
    '.release-lane--fast',
    '.release-lane--guarded',
    'content: attr(data-pack)',
    '@media (max-width: 900px)',
    '@media (max-width: 620px)',
    '@media print',
]) {
    assert(css.includes(selector), `Decision Pack 03 缺少網站樣式：${selector}`)
}

assert(html.includes('data-pack="DP / 03"'), 'Decision Pack 03 必須顯示正確識別')
assert(html.includes('status-badge status-confirmed">已確認'), 'Decision Pack 03 必須顯示產品需求基準已確認狀態')
assert(searchIndex.includes(`"url":"${decisionPackId}.html"`), 'Decision Pack 03 必須進入全文搜尋索引')
assert(openIssues.includes(`${decisionPackId}.html`), '集中追蹤頁必須提供 Decision Pack 03 入口')
assert(openIssues.includes('實作 Mapping'), '集中追蹤頁必須說明 Backend Git 不阻擋產品需求成立')
assert(documentControl.includes(book.version), '文件治理頁必須同步 Decision Pack 03 版本')
assert(documentControl.includes('標準快速發布＋高風險發布'), '文件治理頁必須記錄簡化後的雙通道')
assert(changelog.includes('0.18.0-phase-three-pack-03-source-aligned'), '版本紀錄必須記載 Decision Pack 03 Spec MD 同步')
assert(projectIndex.includes('文件版本：2.27.0'), '專案交接索引必須同步目前 Decision Pack 文件版本')
assert(projectIndex.includes(`${decisionPackId}.html`), '專案交接索引必須提供 Decision Pack 03 入口')
assert(projectIndex.includes('Decision Pack 02、03 已同步至對應原始 Spec MD'), '專案交接索引必須記錄 Pack 03 Spec MD 已同步')
assert(projectIndex.includes('decision-pack-03-implementation-reconciliation.html'), '專案交接索引必須提供 Decision Pack 03 實作差異清單入口')

if (failures.length) {
    console.error(`Decision Pack 03 validation failed (${failures.length}/${assertionCount})`)
    failures.forEach((failure) => console.error(`- ${failure}`))
    process.exitCode = 1
} else {
    console.log(`Decision Pack 03 validation passed: ${assertionCount} assertions`)
    console.log('Coverage: 8 contract groups / 6-step release chain / 2 risk lanes / 8 tracked implementation mappings / 11 Deferred pages preserved')
}

function assert(condition, message) {
    assertionCount += 1
    if (!condition) failures.push(message)
}
