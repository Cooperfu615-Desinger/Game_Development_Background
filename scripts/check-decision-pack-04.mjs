import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { appendices, book, modules } from '../docs/spec-book/manifest.mjs'
import { tbdRegistry } from '../docs/spec-book/tbd-registry.mjs'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const repositoryRoot = path.resolve(scriptDirectory, '..')
const outputRoot = path.join(repositoryRoot, 'public/provider-specs')
const decisionPackId = 'decision-pack-04-content-publishing-contract'
const decisionPack = appendices.find((item) => item.id === decisionPackId)
const source = await readFile(path.join(repositoryRoot, 'docs/spec-book/content/appendices/decision-pack-04-content-publishing-contract.md'), 'utf8')
const html = await readFile(path.join(outputRoot, `${decisionPackId}.html`), 'utf8')
const css = await readFile(path.join(outputRoot, 'assets/site.css'), 'utf8')
const searchIndex = await readFile(path.join(outputRoot, 'assets/search-index.js'), 'utf8')
const openIssues = await readFile(path.join(outputRoot, 'open-issues.html'), 'utf8')
const documentControl = await readFile(path.join(outputRoot, 'document-control.html'), 'utf8')
const changelog = await readFile(path.join(outputRoot, 'changelog.html'), 'utf8')
const projectIndex = await readFile(path.join(repositoryRoot, 'docs/PROJECT_TRANSFER_INDEX.md'), 'utf8')
const allPages = modules.flatMap((module) => module.pages)
const deferredPages = allPages.filter((page) => page.scope === 'deferred')
const affectedPageIds = [
    'website-banners',
    'website-content',
    'website-releases',
    'lobby-overview',
    'lobby-games',
    'lobby-management',
    'lobby-demo',
    'lobby-preview',
]
const affectedPages = affectedPageIds.map((id) => allPages.find((page) => page.id === id))
const expectedTbd = {
    'TBD-DOM-005': 'definition',
    'TBD-DOM-006': 'partial',
    'TBD-DAT-003': 'partial',
    'TBD-DAT-004': 'definition',
    'TBD-DAT-006': 'definition',
    'TBD-API-001': 'definition',
    'TBD-API-006': 'definition',
    'TBD-SEC-001': 'external',
    'TBD-SEC-003': 'partial',
    'TBD-SEC-005': 'definition',
    'TBD-NFR-002': 'partial',
    'TBD-NFR-003': 'partial',
    'TBD-NFR-004': 'partial',
    'TBD-EXT-003': 'external',
}
const failures = []
let assertionCount = 0

assert(book.version === '0.20.0-phase-three-pack-04-baseline', '規格網站版本必須標示 Decision Pack 04 產品需求基準')
assert(book.updatedAt === '2026-08-20', '規格網站更新日期必須同步 Decision Pack 04')
assert(book.status === 'Phase 3 · Product Contract Baselines', '規格網站狀態必須維持 Product Contract Baselines')
assert(Boolean(decisionPack), 'manifest 必須包含 Decision Pack 04')
assert(decisionPack?.number === 'P', 'Decision Pack 04 必須使用附錄 P')
assert(decisionPack?.status === 'confirmed', 'Decision Pack 04 必須標示為目前已確認的產品需求基準')
assert(decisionPack?.content === 'content/appendices/decision-pack-04-content-publishing-contract.md', 'Decision Pack 04 必須指向正式 Markdown 來源')

for (const [id, status] of Object.entries(expectedTbd)) {
    const item = tbdRegistry.find((candidate) => candidate.id === id)
    assert(Boolean(item), `集中 TBD 缺少 ${id}`)
    assert(item?.status === status, `${id} 的實作 Mapping 狀態不得被產品基準暗中改寫`)
    assert(html.includes(`open-issues.html#${id.toLowerCase()}`), `Decision Pack 04 缺少 ${id} 的集中追蹤連結`)
}

assert(tbdRegistry.length === 30, 'Decision Pack 04 不得增加、刪除或暗中解決集中 TBD')
assert(deferredPages.length === 11, 'GGAP、通知中心與系統設定的 11 個 Deferred 頁面必須維持不變')
assert(deferredPages.every((page) => page.status === 'outline' && !page.content), 'Deferred 頁面不得因 Decision Pack 04 產生推測內容')
assert(affectedPages.every(Boolean), 'Decision Pack 04 的八個對應頁面必須全部存在')
assert(affectedPages.every((page) => page?.prototype === 'complete'), 'Decision Pack 04 的八個對應頁面必須維持已有內容原型')
assert(affectedPages.every((page) => page?.content), 'Decision Pack 04 的八個對應頁面必須保留第二階段正式 Markdown 來源')

for (const text of [
    'Decision Pack 04｜官網與大廳內容發布契約',
    '目前需求基準',
    'Content Entry',
    'Content Revision',
    'Published Snapshot',
    'Publish Job',
    'Preview Manifest',
    'Publication Event',
    '01 · WEBSITE',
    'Lobby Game Content',
    'Lobby Catalog',
    'draft',
    'ready',
    'superseded',
    'archived',
    'propagating',
    'degraded',
    'STRICT',
    'FALLBACK',
    'OPTIONAL_HIDE',
    'zh-TW',
    'zh-CN',
    'security-revoked',
    'Authoritative Pre-publish Validation',
    'Execution-time Revalidation',
    'BLOCKING',
    'expected_published_revision_id',
    'Emergency Disable',
    '一般內容快速通道',
    '高風險第二人核准',
    'Revision Conflict',
    'Publication Conflict',
    'Append-only Audit',
    '37 個驗收情境',
    'DP03 × DP04 公開結果矩陣',
    '兩層契約',
    '後端最少語意能力',
    'GGAP Git 不影響',
    '不是等待 Backend Git',
]) {
    assert(html.includes(text), `Decision Pack 04 缺少必要內容：${text}`)
}

assert((html.match(/class="decision-item-meta"/g) || []).length === 9, 'Decision Pack 04 必須包含九個契約群組')
assert((html.match(/class="decision-recommendation"/g) || []).length === 9, '每個契約群組必須包含目前需求基準')
assert((html.match(/<li><b>0[1-6]<\/b><strong>/g) || []).length === 6, 'Decision Pack 04 必須包含六段內容發布鏈')
assert((html.match(/<article><b>0[1-4] · /g) || []).length === 4, 'Decision Pack 04 必須呈現四條獨立發布流')
assert((html.match(/class="content-approval-lane content-approval-lane--/g) || []).length === 2, 'Decision Pack 04 必須呈現快速與高風險兩種治理通道')
assert(!html.includes('請責任方確認'), 'Decision Pack 04 不應使用逐題核准問卷')
assert(!html.includes('替代方案比較'), 'Decision Pack 04 不應使用替代方案比較')
assert(!html.includes('Backend Evidence Pending'), 'Decision Pack 04 不應標示 Backend Evidence Pending')
assert(!html.includes('GENERATED_'), 'Decision Pack 04 不得包含未替換的生成標記')

const acceptanceSection = source.split('### 8.6 最低 37 個驗收情境')[1]?.split('---')[0] ?? ''
assert((acceptanceSection.match(/^\d+\. /gm) || []).length === 37, 'Decision Pack 04 必須包含正好 37 個最低驗收情境')

for (const anchor of [
    '1-核心物件與責任邊界',
    '2-共用引擎與獨立發布流',
    '3-revision-job-與公開生命週期',
    '4-多語內容素材與-fallback',
    '5-驗證與精確預覽',
    '6-發布排程停用與還原',
    '7-權限核准併發與稽核',
    '8-跨頁依賴替代狀態與驗收',
    '9-後端契約原型對照與外部邊界',
]) {
    assert(html.includes(`href="#${anchor}"`), `Decision Pack 04 摘要缺少快速導覽：${anchor}`)
    assert(html.includes(`id="${anchor}"`), `Decision Pack 04 缺少快速導覽目標：${anchor}`)
}

for (const selector of [
    '.decision-pack-hero--content',
    '.decision-pack-hero__nav--content',
    '.content-publishing-flow',
    '.content-publishing-flow li:not(:last-child)::after',
    '.publishing-stream-grid',
    '.content-approval-lanes',
    '.content-approval-lane--fast',
    '.content-approval-lane--guarded',
    'content: attr(data-pack)',
    '@media (max-width: 900px)',
    '@media (max-width: 620px)',
    '@media print',
]) {
    assert(css.includes(selector), `Decision Pack 04 缺少網站樣式：${selector}`)
}

assert(html.includes('data-pack="DP / 04"'), 'Decision Pack 04 必須顯示正確識別')
assert(html.includes('status-badge status-confirmed">已確認'), 'Decision Pack 04 必須顯示產品需求基準已確認狀態')
assert(searchIndex.includes(`"url":"${decisionPackId}.html"`), 'Decision Pack 04 必須進入全文搜尋索引')
assert(openIssues.includes(`${decisionPackId}.html`), '集中追蹤頁必須提供 Decision Pack 04 入口')
assert(openIssues.includes('CDN'), '集中追蹤頁必須說明外部實作 Mapping 不阻擋產品需求成立')
assert(documentControl.includes(book.version), '文件治理頁必須同步 Decision Pack 04 版本')
assert(documentControl.includes('37 個跨頁驗收情境'), '文件治理頁必須記錄 Decision Pack 04 驗收基準')
assert(changelog.includes('0.20.0-phase-three-pack-04-baseline'), '版本紀錄必須記載 Decision Pack 04 基準')
assert(projectIndex.includes('文件版本：2.27.0'), '專案交接索引必須同步 Decision Pack 04 文件版本')
assert(projectIndex.includes(`${decisionPackId}.html`), '專案交接索引必須提供 Decision Pack 04 入口')
assert(projectIndex.includes('Portal Vue 原型尚未依 DP04 回寫或修改'), '專案交接索引必須保留 DP04 尚未同步原型的邊界')

if (failures.length) {
    console.error(`Decision Pack 04 validation failed (${failures.length}/${assertionCount})`)
    failures.forEach((failure) => console.error(`- ${failure}`))
    process.exitCode = 1
} else {
    console.log(`Decision Pack 04 validation passed: ${assertionCount} assertions`)
    console.log('Coverage: 9 contract groups / 6-step publishing chain / 4 independent streams / 4 locales / 2 risk lanes / 37 acceptance scenarios / 11 Deferred pages preserved')
}

function assert(condition, message) {
    assertionCount += 1
    if (!condition) failures.push(message)
}
