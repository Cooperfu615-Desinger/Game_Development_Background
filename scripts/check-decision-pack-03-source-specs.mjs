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
    list: 'GAME_LIST_SPEC.md',
    ggap: 'PROVIDER_GGAP_INTEGRATION_CONTRACT.md',
    gameList: 'spec-book/content/modules/game-management/game-list.md',
    environments: 'spec-book/content/modules/game-management/game-environments.md',
    settings: 'spec-book/content/modules/game-management/game-settings.md',
    math: 'spec-book/content/modules/game-management/game-math.md',
    versions: 'spec-book/content/modules/game-management/game-versions.md',
    assets: 'spec-book/content/modules/game-management/game-assets.md',
    common: 'spec-book/content/04-common-domain-rules.md',
    api: 'spec-book/content/06-api-and-integration.md',
    security: 'spec-book/content/07-security-and-permissions.md',
    nfr: 'spec-book/content/08-non-functional-requirements.md',
    qa: 'spec-book/content/09-acceptance-and-qa.md',
    dictionary: 'spec-book/content/appendices/data-dictionary.md',
    enums: 'spec-book/content/appendices/status-enums.md',
}
const sources = Object.fromEntries(await Promise.all(Object.entries(sourceNames).map(async ([key, name]) => [key, await readFile(path.join(docsRoot, name), 'utf8')])))
const pack = await readFile(path.join(docsRoot, 'spec-book/content/appendices/decision-pack-03-game-release-lifecycle.md'), 'utf8')
const projectIndex = await readFile(path.join(docsRoot, 'PROJECT_TRANSFER_INDEX.md'), 'utf8')
const packageJson = await readFile(path.join(repositoryRoot, 'package.json'), 'utf8')
const failures = []
let assertionCount = 0

assert(book.version === '0.21.0-phase-three-pack-04-source-aligned', '規格網站版本必須保留 Pack 03 並包含 Pack 04 Source Alignment')
assert(projectIndex.includes('文件版本：2.28.0'), '專案交接索引必須同步目前 Decision Pack 文件版本')
assert(projectIndex.includes('Decision Pack 02–04 已同步至對應原始 Spec MD'), '專案交接索引必須記錄 Pack 03 Spec MD 同步狀態')
assert(packageJson.includes('spec:decision-pack-03-source-check'), 'package scripts 必須提供 Pack 03 source check')

for (const key of ['portal', 'list', 'ggap']) {
    assert(sources[key].includes('Decision Pack 03'), `${sourceNames[key]} 必須連結 Decision Pack 03`)
    assert(sources[key].includes('目前需求基準') || sources[key].includes('目前產品責任基準'), `${sourceNames[key]} 必須標示目前需求基準`)
}

for (const key of ['gameList', 'environments', 'settings', 'math', 'versions', 'assets']) {
    assert(sources[key].includes('已同步 Decision Pack 03'), `${sourceNames[key]} 必須標示已同步 Decision Pack 03`)
}

for (const text of [
    'Game、Version、Artifact 與 Release',
    '同一 Game × Environment 同時只有一筆 Active Release',
    'DEMO 通過後 Production 必須發布同一 Artifact',
    'Launch Context',
    '不建立長期 Game Session',
    '既有 Round 永久依建立時的 Version',
    '全域可用性與 GGAP Gate',
    '`unpublished`、`available`、`maintenance`、`suspended`、`retired`',
]) assert(sources.common.includes(text), `共通領域規則缺少：${text}`)

for (const text of [
    'Test → DEMO → Production',
    '快速／高風險發布',
    '同一 Artifact',
    'Test 可由具權限編輯者快速發布 build',
    '一般 Release 採自動檢查加一位發布管理者',
    '高風險通道',
    '緊急停用',
    '上架未 ACK 不對外開放',
    '回滾建立新紀錄',
]) assert(sources.environments.includes(text), `環境與發布規格缺少：${text}`)

for (const text of [
    '`version_id`、語意版號與 `build_id` 分開',
    'Artifact 以 `build_id`、manifest、checksum',
    '`draft`、`candidate`、`approved`、`published`、`retired`、`cancelled`',
    '`published` 只代表曾成功發布 Production',
    '回滾不是把 Version 狀態改回去',
]) assert(sources.versions.includes(text), `遊戲版本規格缺少：${text}`)

for (const text of [
    '遊戲投注結構、投注幣別倍率、下注限額方案',
    '固定倍率映射',
    '不直接套用即時市場匯率',
    '高風險 Release',
]) assert(sources.settings.includes(text), `遊戲設定規格缺少：${text}`)

for (const text of [
    '數值變更自動走高風險第二人核准',
    '核准不等於發布',
    '既有 Round 固定原數值快照',
]) assert(sources.math.includes(text), `數值設定規格缺少：${text}`)

for (const text of [
    'Game Version／Artifact manifest',
    '被 Version、Artifact、Release、Game Round 引用',
    '純展示且具安全回滾的素材可走快速通道',
]) assert(sources.assets.includes(text), `遊戲素材規格缺少：${text}`)

for (const text of [
    'Provider 全域可用性',
    'Active Release',
    'Production 發布成功不自動把 Game 切成 `available`',
    'GGAP 同步不等於代理商開放',
]) assert(sources.gameList.includes(text), `遊戲列表頁規格缺少：${text}`)

for (const text of [
    'Game、Version、Artifact、Release 與 Active Release 必須使用不同 ID',
    '一般 Release 自動檢查通過後允許發布管理者一人執行',
    'outbox／等價可靠投遞',
]) assert(sources.api.includes(text), `API 共用規格缺少：${text}`)

for (const text of [
    '高風險變更要求第二人核准',
    '緊急停用可由緊急處理者單人立即執行',
    'permission snapshot',
]) assert(sources.security.includes(text), `安全共用規格缺少：${text}`)

for (const text of [
    '原子切換 Active Release',
    'Forward Fix',
    'Launch Token 最長有效期＋Round 最長合理生命週期',
]) assert(sources.nfr.includes(text), `NFR 共用規格缺少：${text}`)

for (const text of [
    'Draft 不可直接發布 Production',
    'Production Artifact 與 DEMO 驗證 Artifact 不同時必須拒絕',
    '舊 Round 晚到 Settlement／Callback',
]) assert(sources.qa.includes(text), `QA 共用規格缺少：${text}`)

for (const text of ['`version_id`', '`build_id`', '`artifact_checksum`', '`release_id`', '`active_release_id`', '`launch_id`', '`release_event_id`']) {
    assert(sources.dictionary.includes(text), `資料字典缺少：${text}`)
}

for (const text of ['Game Version 狀態', 'Release 主要顯示狀態', 'Provider 全域可用性', '`candidate`', '`published`', '`suspended`']) {
    assert(sources.enums.includes(text), `狀態枚舉缺少：${text}`)
}

for (const text of [
    'Provider 全域上架等待 GGAP ACK 後才對外開放',
    'Production 必須使用同一份 Artifact',
    'Launch Context 綁定',
    '不建立長期 Game Session',
]) assert(sources.ggap.includes(text), `GGAP 補充契約缺少：${text}`)

for (const text of ['Game', 'Version', 'Artifact', 'Release Record', '快速發布與高風險發布', 'Launch 與 Game Round 相容性']) {
    assert(pack.includes(text), `Decision Pack 03 上游缺少：${text}`)
}

const synchronizedText = Object.values(sources).join('\n')
for (const forbidden of [
    '測試環境只提供部署版本與健康監控，不提供操作按鈕',
    '前後端 / DevOps 部署，Portal 只讀監控',
    'Test 的 allowed actions 永遠只讀',
    '正式雙人核准待決策',
    'Test 無操作',
]) assert(!synchronizedText.includes(forbidden), `同步後規格不得保留舊規則：${forbidden}`)

if (failures.length) {
    console.error(`Decision Pack 03 source spec validation failed (${failures.length}/${assertionCount})`)
    failures.forEach((failure) => console.error(`- ${failure}`))
    process.exitCode = 1
} else {
    console.log(`Decision Pack 03 source spec validation passed: ${assertionCount} assertions`)
    console.log('Coverage: 5 cross-module sources / 6 game pages / common domain, data, enum, API, security, NFR and QA')
}

function assert(condition, message) {
    assertionCount += 1
    if (!condition) failures.push(message)
}
