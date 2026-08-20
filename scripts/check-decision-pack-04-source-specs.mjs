import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { book } from '../docs/spec-book/manifest.mjs'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const repositoryRoot = path.resolve(scriptDirectory, '..')
const docsRoot = path.join(repositoryRoot, 'docs')
const sourceNames = {
    portal: 'PROVIDER_PORTAL_SPEC.md',
    navigation: 'PROVIDER_PORTAL_NAVIGATION_SPEC.md',
    pageMap: 'PROVIDER_PORTAL_PAGE_MAP.md',
    website: 'GAME_WEBSITE_SPEC.md',
    lobby: 'GAME_LOBBY_SPEC.md',
    banners: 'spec-book/content/modules/official-website/website-banners.md',
    content: 'spec-book/content/modules/official-website/website-content.md',
    releases: 'spec-book/content/modules/official-website/website-releases.md',
    overview: 'spec-book/content/modules/official-website/lobby-overview.md',
    games: 'spec-book/content/modules/official-website/lobby-games.md',
    management: 'spec-book/content/modules/official-website/lobby-management.md',
    demo: 'spec-book/content/modules/official-website/lobby-demo.md',
    preview: 'spec-book/content/modules/official-website/lobby-preview.md',
    common: 'spec-book/content/04-common-domain-rules.md',
    api: 'spec-book/content/06-api-and-integration.md',
    security: 'spec-book/content/07-security-and-permissions.md',
    nfr: 'spec-book/content/08-non-functional-requirements.md',
    qa: 'spec-book/content/09-acceptance-and-qa.md',
    dictionary: 'spec-book/content/appendices/data-dictionary.md',
    enums: 'spec-book/content/appendices/status-enums.md',
    pack: 'spec-book/content/appendices/decision-pack-04-content-publishing-contract.md',
}
const sources = Object.fromEntries(await Promise.all(Object.entries(sourceNames).map(async ([key, name]) => [key, await readFile(path.join(docsRoot, name), 'utf8')])))
const projectIndex = await readFile(path.join(docsRoot, 'PROJECT_TRANSFER_INDEX.md'), 'utf8')
const reconciliation = await readFile(path.join(docsRoot, 'spec-book/reconciliation.mjs'), 'utf8')
const dependencies = await readFile(path.join(docsRoot, 'spec-book/dependencies.mjs'), 'utf8')
const packageJson = await readFile(path.join(repositoryRoot, 'package.json'), 'utf8')
const failures = []
let assertionCount = 0

assert(book.version === '0.21.0-phase-three-pack-04-source-aligned', '規格網站版本必須標示 DP04 Source Alignment')
assert(projectIndex.includes('文件版本：2.28.0'), '專案交接索引必須同步 DP04 Source Alignment 版本')
assert(projectIndex.includes('Decision Pack 02–04 已同步至對應原始 Spec MD'), '交接索引必須記錄 DP04 Spec MD 已同步')
assert(projectIndex.includes('本版本未修改 Portal Vue／mock'), '交接索引必須保留尚未修改原型的邊界')
assert(packageJson.includes('spec:decision-pack-04-source-check'), 'package scripts 必須提供 DP04 source check')

for (const key of ['portal', 'website', 'lobby']) {
    assert(sources[key].includes('Decision Pack 04'), `${sourceNames[key]} 必須連結或標示 Decision Pack 04`)
    assert(sources[key].includes('目前需求基準'), `${sourceNames[key]} 必須標示目前需求基準`)
}

for (const key of ['banners', 'content', 'releases', 'overview', 'games', 'management', 'demo', 'preview']) {
    assert(sources[key].includes('DP04'), `${sourceNames[key]} 必須標示 DP04 已同步`)
    assert(sources[key].includes('實作 Mapping'), `${sourceNames[key]} 必須把剩餘缺口限定為實作 Mapping`)
}

for (const text of [
    'Content Entry',
    'Content Revision',
    'Published Snapshot',
    'Publish Job',
    'Preview Manifest',
    'Publication Event',
    'Website Banner',
    'Website Static Content',
    '`STRICT`',
    '`FALLBACK`',
    '`OPTIONAL_HIDE`',
    '失敗保持舊 Snapshot',
    '第二人核准',
    'Restore',
]) assert(sources.website.includes(text), `官網根規格缺少：${text}`)

for (const text of [
    'Lobby Game Content',
    'Lobby Catalog',
    '三層公開控制',
    'Published Catalog',
    'runtime safety overlay',
    'GGAP Gate',
    'exact Preview Manifest',
    'Sandbox credit',
    '不形成 Provider 會員、錢包或正式 Game Session',
]) assert(sources.lobby.includes(text), `大廳根規格缺少：${text}`)

for (const text of ['content_entry_id', 'revision_id', 'snapshot_id', 'publish_job_id', 'preview_manifest_id', 'publication_event_id', 'expected_published_revision_id']) {
    assert(sources.dictionary.includes(`\`${text}\``), `資料字典缺少：${text}`)
}

for (const text of ['Content Revision 狀態', 'Content Publish Job 狀態', 'Content Public 與 Delivery 狀態', '內容欄位語系政策']) {
    assert(sources.enums.includes(text), `狀態枚舉缺少：${text}`)
}

for (const text of [
    '公開內容與大廳契約',
    '官網 Banner、官網 Static Content、Lobby Game Content 與 Lobby Catalog',
    'DP03 Provider global availability',
    'GGAP 代理商 Launch Gate',
]) assert(sources.common.includes(text), `共通領域規則缺少：${text}`)

for (const text of [
    '官網與大廳內容發布 API',
    'Create Revision',
    'Create／Query Preview Manifest',
    'Publish／Disable／Restore Job',
    'PUBLICATION_CONFLICT',
]) assert(sources.api.includes(text), `API 共通規格缺少：${text}`)

for (const text of ['內容發布 Capability 與安全', 'High-risk Approve', 'Preview token', 'Emergency Disable']) {
    assert(sources.security.includes(text), `安全共通規格缺少：${text}`)
}

for (const text of ['publication scope', 'expected published revision', 'Delivery 驗證失敗', 'Preview Manifest']) {
    assert(sources.nfr.includes(text), `NFR 共通規格缺少：${text}`)
}

for (const text of ['內容發布契約驗收', 'Preview Manifest 固定 exact', 'Restore 都建立新 Job', 'Published Catalog 固定 exact']) {
    assert(sources.qa.includes(text), `QA 共通規格缺少：${text}`)
}

for (const [key, required] of Object.entries({
    banners: ['不可變 Revision', '四語原子發布', 'Restore'],
    content: ['高風險通道', 'Preview Manifest', '不同一人的核准'],
    releases: ['Published Snapshot', 'Restore 是正式能力', '補償'],
    overview: ['Published Catalog', 'runtime safety overlay', 'Sandbox credit'],
    games: ['Published Catalog', 'exact Game Content Revision', 'Delivery'],
    management: ['Lobby Game Content', 'Lobby Catalog', 'expected published revision'],
    demo: ['readiness／quality evidence', '不參與內容發布', 'Sandbox credit'],
    preview: ['exact Preview Manifest', 'draft／public', '不得追蹤 latest'],
})) {
    for (const text of required) assert(sources[key].includes(text), `${sourceNames[key]} 缺少：${text}`)
}

assert(sources.pack.includes('本包已回寫 `docs/GAME_WEBSITE_SPEC.md`'), 'DP04 後續章節必須記錄 Source Spec 已回寫')
assert(sources.pack.includes('Portal 原型仍維持既有 mock'), 'DP04 必須保留原型尚未同步的邊界')
assert(reconciliation.includes('產品語意已對齊'), '三層校準必須記錄 DP04 產品語意已對齊')
assert(dependencies.includes('官網與大廳任何發布成功或失敗都不得自動改變另一條流'), '依賴圖必須確認四條發布流獨立')

const synchronizedText = Object.values(sources).join('\n')
for (const forbidden of [
    '玩家狀態固定 Draft',
    '遊戲一定會顯示在大廳中',
    '正式 fallback 待',
    '是否共用版本序列待',
    '正式法律審核角色仍待確認',
    'TBD-DOM-005`：官網內容與大廳發布是否保持獨立',
]) assert(!synchronizedText.includes(forbidden), `同步後規格不得保留舊產品規則：${forbidden}`)

if (failures.length) {
    console.error(`Decision Pack 04 source spec validation failed (${failures.length}/${assertionCount})`)
    failures.forEach((failure) => console.error(`- ${failure}`))
    process.exitCode = 1
} else {
    console.log(`Decision Pack 04 source spec validation passed: ${assertionCount} assertions`)
    console.log('Coverage: 5 cross-module sources / 8 website-lobby pages / common domain, data, enum, API, security, NFR and QA')
}

function assert(condition, message) {
    assertionCount += 1
    if (!condition) failures.push(message)
}
