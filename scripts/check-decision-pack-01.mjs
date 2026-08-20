import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { appendices, book, modules } from '../docs/spec-book/manifest.mjs'
import { tbdRegistry } from '../docs/spec-book/tbd-registry.mjs'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const repositoryRoot = path.resolve(scriptDirectory, '..')
const outputRoot = path.join(repositoryRoot, 'public/provider-specs')
const decisionPackId = 'decision-pack-01-round-finance'
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
    'TBD-DOM-001': { priority: 'P0', status: 'partial' },
    'TBD-DOM-002': { priority: 'P0', status: 'partial' },
    'TBD-DAT-001': { priority: 'P0', status: 'partial' },
    'TBD-DAT-002': { priority: 'P0', status: 'partial' },
    'TBD-DAT-003': { priority: 'P1', status: 'partial' },
    'TBD-EXT-001': { priority: 'P0', status: 'external' },
}
const failures = []
let assertionCount = 0

assert(book.version === '0.20.0-phase-three-pack-04-baseline', '規格網站版本必須包含 Decision Pack 04 產品需求基準')
assert(book.status === 'Phase 3 · Product Contract Baselines', '規格網站狀態必須標示 Product Contract Baselines')
assert(Boolean(decisionPack), 'manifest 必須包含 Decision Pack 01')
assert(decisionPack?.number === 'L', 'Decision Pack 01 必須使用附錄 L')
assert(decisionPack?.status === 'confirmed', 'Decision Pack 01 必須標示為目前已確認的產品需求基準')
assert(decisionPack?.content === 'content/appendices/decision-pack-01-round-finance.md', 'Decision Pack 01 必須指向正式 Markdown 來源')

for (const [id, expected] of Object.entries(expectedTbd)) {
    const item = tbdRegistry.find((candidate) => candidate.id === id)
    assert(Boolean(item), `集中 TBD 缺少 ${id}`)
    assert(item?.priority === expected.priority, `${id} 優先級不得被產品基準暗中改寫`)
    assert(item?.status === expected.status, `${id} 的外部驗證狀態不得被產品基準暗中改寫`)
    assert(html.includes(`open-issues.html#${id.toLowerCase()}`), `Decision Pack 01 缺少 ${id} 的集中追蹤連結`)
}

assert(tbdRegistry.length === 30, 'Decision Pack 01 不得增加、刪除或暗中解決集中 TBD')
assert(deferredPages.length === 11, 'GGAP、通知中心與系統設定的 11 個 Deferred 頁面必須維持不變')
assert(deferredPages.every((page) => page.status === 'outline' && !page.content), 'Deferred 頁面不得因 Decision Pack 01 產生推測內容')

for (const text of [
    'Decision Pack 01｜Game Round、投注與財務共用產品契約',
    '目前需求基準',
    'Round 1:N Bet',
    'bet_mode=single',
    'bet_mode=multiple',
    'payout_scope=bet',
    'payout_scope=round',
    'payout_scope=hybrid',
    'rolled_back',
    'round_count',
    'bet_count',
    'average_bet',
    'external_round_id',
    'settlement_id',
    'adjustment_id',
    'time_basis=settled_at',
    'Asia/Taipei',
    'Asia/Shanghai',
    'settlement_batch_id',
    '遊戲投注結構',
    '投注幣別倍率',
    '下注限額方案',
    'bet_currency_multiplier',
    'limit_scheme_id',
    'USDT_ONLY',
    'NATIVE_CURRENCY',
    'settlement_currency',
    'provider_points_per_usdt',
    'base_rate',
    'decimal string',
    'player_net',
    'provider_ggr',
    'provider_payable',
    'reconciliation evidence',
    '外部驗證點',
]) {
    assert(html.includes(text), `Decision Pack 01 缺少必要內容：${text}`)
}

assert((html.match(/class="decision-item-meta"/g) || []).length === 6, 'Decision Pack 01 必須包含六個契約群組')
assert((html.match(/class="decision-recommendation"/g) || []).length === 6, '每個契約群組必須包含目前需求基準')
assert((html.match(/<li><b>0[1-6]<\/b><strong>/g) || []).length === 6, 'Decision Pack 01 必須包含六段 Round／財務契約鏈')
assert(!html.includes('請責任方確認'), 'Decision Pack 01 不應再使用逐題核准問卷')
assert(!html.includes('替代方案比較'), 'Decision Pack 01 不應再使用替代方案比較')
assert(!html.includes('Backend Evidence Pending'), 'Decision Pack 01 不應再標示 Backend Evidence Pending')
assert(!html.includes('<b>Q1</b>'), 'Decision Pack 01 不應保留 Q1–Q20 審閱表')
assert(!html.includes('GENERATED_'), 'Decision Pack 01 不得包含未替換的生成標記')

for (const anchor of [
    '1-game-round-bet-與結算生命週期',
    '2-跨系統識別碼與交易快照',
    '3-時間-統計窗口與日結帳期',
    '4-遊戲投注結構-幣別倍率與下注限額',
    '5-provider-points-usdt-匯率與精度',
    '6-財務指標-調整與正式結算邊界',
]) {
    assert(html.includes(`href="#${anchor}"`), `Decision Pack 01 摘要缺少快速導覽：${anchor}`)
    assert(html.includes(`id="${anchor}"`), `Decision Pack 01 缺少快速導覽目標：${anchor}`)
}

for (const selector of [
    '.decision-pack-hero--round',
    '.decision-pack-hero__nav--six',
    '.round-contract-flow',
    '.round-contract-flow li:not(:last-child)::after',
    '.decision-item-meta',
    '.decision-recommendation',
    'content: attr(data-pack)',
    '@media (max-width: 900px)',
    '@media (max-width: 620px)',
    '@media print',
]) {
    assert(css.includes(selector), `Decision Pack 01 缺少網站樣式：${selector}`)
}

assert(html.includes('data-pack="DP / 01"'), 'Decision Pack 01 必須顯示正確識別')
assert(html.includes('status-badge status-confirmed">已確認'), 'Decision Pack 01 必須顯示產品需求基準已確認狀態')
assert(searchIndex.includes(`"url":"${decisionPackId}.html"`), 'Decision Pack 01 必須進入全文搜尋索引')
assert(openIssues.includes(`${decisionPackId}.html`), '集中追蹤頁必須提供 Decision Pack 01 入口')
assert(openIssues.includes('Round 1:N Bet'), '集中追蹤頁必須說明 Decision Pack 01 的產品需求基準')
assert(documentControl.includes(book.version), '文件治理頁必須同步 Decision Pack 01 版本')
assert(documentControl.includes('Round 1:N Bet'), '文件治理頁必須記錄 Decision Pack 01 的核心模型')
assert(changelog.includes('0.16.0-phase-three-contract-baselines'), '版本紀錄必須記載 Decision Pack 01 重寫')
assert(projectIndex.includes(`${decisionPackId}.html`), '專案交接索引必須提供 Decision Pack 01 入口')
assert(projectIndex.includes('現行 Portal 仍為前端 mock'), '專案交接索引必須揭露現行程式狀態')

if (failures.length) {
    console.error(`Decision Pack 01 validation failed (${failures.length}/${assertionCount})`)
    failures.forEach((failure) => console.error(`- ${failure}`))
    process.exitCode = 1
} else {
    console.log(`Decision Pack 01 validation passed: ${assertionCount} assertions`)
    console.log('Coverage: 6 contract groups / 6-step Round-finance chain / 6 tracked verification items / 11 Deferred pages preserved')
}

function assert(condition, message) {
    assertionCount += 1
    if (!condition) failures.push(message)
}
