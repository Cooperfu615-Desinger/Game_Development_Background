import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { appendices, book, modules } from '../docs/spec-book/manifest.mjs'
import { pageReconciliation } from '../docs/spec-book/reconciliation.mjs'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const repositoryRoot = path.resolve(scriptDirectory, '..')
const outputRoot = path.join(repositoryRoot, 'public/provider-specs')
const reconciliationId = 'decision-pack-03-implementation-reconciliation'
const appendix = appendices.find((item) => item.id === reconciliationId)
const pages = modules.flatMap((module) => module.pages)
const environmentPage = pages.find((page) => page.id === 'game-environments')

const read = (relativePath) => readFile(path.join(repositoryRoot, relativePath), 'utf8')
const [
    html,
    searchIndex,
    openIssues,
    projectIndex,
    router,
    lifecycleTypes,
    lifecycleMock,
    lifecycleHandlers,
    roundTypes,
    roundHandlers,
    environmentView,
] = await Promise.all([
    read(`public/provider-specs/${reconciliationId}.html`),
    read('public/provider-specs/assets/search-index.js'),
    read('public/provider-specs/open-issues.html'),
    read('docs/PROJECT_TRANSFER_INDEX.md'),
    read('src/router/index.ts'),
    read('src/types/providerGameLifecycle.ts'),
    read('src/mocks/providerGameLifecycle.ts'),
    read('src/mocks/handlers/providerGameLifecycle.ts'),
    read('src/types/gameRound.ts'),
    read('src/mocks/handlers/providerGameRounds.ts'),
    read('src/views/Games/Environments.vue'),
])

const failures = []
let assertionCount = 0

assert(book.version === '0.21.0-phase-three-pack-04-source-aligned', '規格網站版本必須保留 DP03 差異清單並包含 Pack 04 Source Alignment')
assert(appendix?.number === 'O', 'DP03 實作差異清單必須使用附錄 O')
assert(appendix?.status === 'confirmed', 'DP03 實作差異清單必須標示為已確認的現況對照')
assert(appendix?.content === 'content/appendices/decision-pack-03-implementation-reconciliation.md', '附錄 O 必須追溯正式 Markdown 來源')
assert(pages.length === 32, '內容頁總數必須維持 32')
assert(pages.filter((page) => page.prototype === 'complete').length === 25, '內容原型頁必須為 25')
assert(pages.filter((page) => page.prototype === 'placeholder').length === 7, 'Placeholder 頁必須為 7')
assert(environmentPage?.prototype === 'complete', '環境與發布必須標示為內容原型')
assert(environmentPage?.component === 'src/views/Games/Environments.vue', '環境與發布必須追溯實際 Vue 元件')
assert(pageReconciliation['game-environments']?.state === 'attention', '環境與發布應列為 mock 邊界注意，而非原型缺口')
assert(router.includes("import('../views/Games/Environments.vue')"), 'Router 必須載入環境與發布實際元件')

for (const status of ['ALIGNED_PROTOTYPE', 'MOCK_ONLY', 'BACKEND_PENDING', 'GGAP_PENDING', 'OUT_OF_SCOPE']) {
    assert(html.includes(status), `差異清單缺少狀態：${status}`)
}

for (const text of [
    'Decision Pack 03｜原型實作差異清單',
    'a1d5098',
    'c774bf8',
    '頁面與程式對照',
    '八組 DP03 契約對照',
    'Mock-only 行為清單',
    '待 Provider Backend 與部署工具 Mapping',
    '待 GGAP Mapping',
    '正式上線前阻擋清單',
    '已存在',
    '與需求衝突',
    '無法由 Git 判斷',
]) {
    assert(html.includes(text), `差異清單缺少必要內容：${text}`)
}

for (const component of [
    'src/views/Games/Index.vue',
    'src/views/Games/Versions.vue',
    'src/views/Games/Environments.vue',
    'src/views/Games/Settings.vue',
    'src/views/Games/Math.vue',
    'src/views/Games/Assets.vue',
    'src/views/Reports/ProviderGameRounds.vue',
]) {
    assert(html.includes(component), `差異清單缺少程式追溯：${component}`)
}

for (const token of ['ReleaseRecord', 'LifecycleSnapshot', 'EnvironmentDeployment']) {
    assert(lifecycleTypes.includes(token) || lifecycleMock.includes(token), `集中生命週期模型缺少：${token}`)
}
for (const endpoint of [
    '/api/provider/game-lifecycle',
    '/versions',
    '/releases/:id/approve',
    '/releases/:id/execute',
    '/releases/:id/rollback',
    '/games/:id/availability',
]) {
    assert(lifecycleHandlers.includes(endpoint), `集中生命週期 mock API 缺少：${endpoint}`)
}
for (const field of ['game_version', 'build_id', 'release_id', 'settings_snapshot_id', 'math_snapshot_id', 'asset_bundle_id', 'currency_multiplier_snapshot']) {
    assert(roundTypes.includes(field), `Game Round 型別缺少不可變快照欄位：${field}`)
    assert(roundHandlers.includes(field), `Game Round mock 缺少不可變快照值：${field}`)
}

assert(environmentView.includes('發布模擬已完成'), '環境與發布操作必須明確標示為模擬')
assert(searchIndex.includes(`"url":"${reconciliationId}.html"`), 'DP03 實作差異清單必須進入全文搜尋索引')
assert(openIssues.includes(`${reconciliationId}.html`), '集中 TBD 頁必須提供 DP03 實作差異清單入口')
assert(projectIndex.includes(`${reconciliationId}.html`), '專案交接索引必須提供 DP03 實作差異清單入口')
assert(projectIndex.includes('文件版本：2.28.0'), '專案交接索引必須同步目前 Decision Pack 文件版本')
assert(!html.includes('GENERATED_'), 'DP03 實作差異清單不得包含未替換的生成標記')

if (failures.length) {
    console.error(`Decision Pack 03 reconciliation validation failed (${failures.length}/${assertionCount})`)
    failures.forEach((failure) => console.error(`- ${failure}`))
    process.exitCode = 1
} else {
    console.log(`Decision Pack 03 reconciliation validation passed: ${assertionCount} assertions`)
    console.log('Coverage: 5 difference states / 7 pages / 8 DP03 contract groups / Provider Backend and GGAP mappings / go-live blockers')
}

function assert(condition, message) {
    assertionCount += 1
    if (!condition) failures.push(message)
}
