import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { appendices, book, modules } from '../docs/spec-book/manifest.mjs'
import { tbdRegistry } from '../docs/spec-book/tbd-registry.mjs'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const repositoryRoot = path.resolve(scriptDirectory, '..')
const outputRoot = path.join(repositoryRoot, 'public/provider-specs')
const decisionPackId = 'decision-pack-01-round-finance'
const decisionPackPath = path.join(outputRoot, `${decisionPackId}.html`)
const scope = {
    'TBD-DOM-001': { priority: 'P0', status: 'partial' },
    'TBD-DOM-002': { priority: 'P0', status: 'partial' },
    'TBD-DAT-001': { priority: 'P0', status: 'partial' },
    'TBD-DAT-002': { priority: 'P0', status: 'partial' },
    'TBD-DAT-003': { priority: 'P1', status: 'partial' },
}
const deferredPages = modules.flatMap((module) => module.pages).filter((page) => page.scope === 'deferred')
const decisionPack = appendices.find((item) => item.id === decisionPackId)
const html = await readFile(decisionPackPath, 'utf8')
const css = await readFile(path.join(outputRoot, 'assets/site.css'), 'utf8')
const searchIndex = await readFile(path.join(outputRoot, 'assets/search-index.js'), 'utf8')
const openIssues = await readFile(path.join(outputRoot, 'open-issues.html'), 'utf8')
const documentControl = await readFile(path.join(outputRoot, 'document-control.html'), 'utf8')
const changelog = await readFile(path.join(outputRoot, 'changelog.html'), 'utf8')
const projectIndex = await readFile(path.join(repositoryRoot, 'docs/PROJECT_TRANSFER_INDEX.md'), 'utf8')
const failures = []
let assertionCount = 0

assert(book.version === '0.15.0-phase-three-pack-02-baseline', '規格網站版本必須包含 Decision Pack 02 Baseline')
assert(book.status === 'Phase 3 · Monitoring & Risk Baseline', '規格網站狀態必須標示 Monitoring & Risk Baseline')
assert(Boolean(decisionPack), 'manifest 必須包含 Decision Pack 01')
assert(decisionPack?.number === 'L', 'Decision Pack 01 必須使用附錄 L')
assert(decisionPack?.status === 'draft', 'Decision Pack 01 在核准前必須維持 Draft')
assert(decisionPack?.content === 'content/appendices/decision-pack-01-round-finance.md', 'Decision Pack 01 必須指向正式 Markdown 來源')

for (const [id, expected] of Object.entries(scope)) {
    const item = tbdRegistry.find((candidate) => candidate.id === id)
    assert(Boolean(item), `集中 TBD 缺少 ${id}`)
    assert(item?.priority === expected.priority, `${id} 優先級不得被決策包改寫`)
    assert(item?.status === expected.status, `${id} 未核准前必須維持 ${expected.status}`)
    assert(html.includes(`open-issues.html#${id.toLowerCase()}`), `Decision Pack 01 缺少 ${id} 的集中登錄連結`)
}

assert(tbdRegistry.length === 30, 'Decision Pack 01 不得增加、刪除或暗中解決集中 TBD')
assert(deferredPages.length === 11, 'GGAP、通知中心與系統設定的 11 個 Deferred 頁面必須維持不變')
assert(deferredPages.every((page) => page.status === 'outline' && !page.content), 'Deferred 頁面不得因決策包產生推測規格')

for (const text of [
    'Decision Pack 01｜Game Round、時間與財務基準',
    'Round 狀態與處理事件分離',
    'Provider ID 為主鍵',
    '時間基準必須明示',
    'Provider 固定計算 profile',
    '有效 Round 集合＋帶版本的 signed adjustment',
    'TBD-DAT-004',
    '不在本包決定',
    'GGAP 正式欄位',
    '暫存紀錄｜2026-08-17',
    'Round 1:N Bet',
    'USDT_ONLY',
    '重開本包所需證據',
]) {
    assert(html.includes(text), `Decision Pack 01 缺少必要內容：${text}`)
}

assert((html.match(/class="decision-item-meta"/g) || []).length === 5, 'Decision Pack 01 必須包含五個決策單元')
assert((html.match(/class="decision-recommendation"/g) || []).length === 5, '每個決策單元必須包含一個建議方案')
assert((html.match(/<b>Q(?:[1-9]|1[0-9]|20)<\/b>/g) || []).length === 20, 'Decision Pack 01 必須包含 Q1–Q20')
for (const anchor of [
    '1-game-round-正式生命週期',
    '2-跨系統識別碼與交易快照',
    '3-時間-時區與統計窗口',
    '4-點數-usdt-匯率與精度',
    '5-正式財務指標與正負方向',
]) {
    assert(html.includes(`href="#${anchor}"`), `決策包摘要缺少快速導覽：${anchor}`)
    assert(html.includes(`id="${anchor}"`), `決策包缺少快速導覽目標：${anchor}`)
}
assert(!html.includes('GENERATED_'), 'Decision Pack 01 不得包含未替換的生成標記')

for (const selector of [
    '.decision-pack-hero',
    '.decision-pack-hero__stats',
    '.decision-pack-hero__nav',
    '.decision-item-meta',
    '.decision-recommendation',
    '.decision-question-list',
    '@media (max-width: 900px)',
    '@media (max-width: 620px)',
    '@media print',
]) {
    assert(css.includes(selector), `Decision Pack 01 缺少網站樣式：${selector}`)
}

assert(searchIndex.includes(`"url":"${decisionPackId}.html"`), 'Decision Pack 01 必須進入全文搜尋索引')
assert(openIssues.includes(`${decisionPackId}.html`), '集中 TBD 頁必須提供 Decision Pack 01 入口')
assert(openIssues.includes('決策包是審閱材料，不是決議本身'), '集中 TBD 頁必須清楚區分決策包與正式決議')
assert(documentControl.includes(book.version), '文件治理頁必須同步 Decision Pack 01 版本')
assert(documentControl.includes('五項 TBD 的狀態未變更'), '文件治理頁必須揭露五項 TBD 尚未核准')
assert(changelog.includes('Q1–Q20'), '版本紀錄必須記載 Decision Pack 01 核准問題範圍')
assert(projectIndex.includes(`${decisionPackId}.html`), '專案交接索引必須提供 Decision Pack 01 入口')
assert(projectIndex.includes('五項集中 TBD 尚未核准'), '專案交接索引必須揭露決策狀態')

if (failures.length) {
    console.error(`Decision Pack 01 validation failed (${failures.length}/${assertionCount})`)
    failures.forEach((failure) => console.error(`- ${failure}`))
    process.exitCode = 1
} else {
    console.log(`Decision Pack 01 validation passed: ${assertionCount} assertions`)
    console.log('Coverage: 5 open TBDs / 5 recommendations / 20 approval questions / 11 Deferred pages preserved')
}

function assert(condition, message) {
    assertionCount += 1
    if (!condition) failures.push(message)
}
