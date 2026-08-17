import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const repositoryRoot = path.resolve(scriptDirectory, '..')
const docsRoot = path.join(repositoryRoot, 'docs')
const sourceNames = {
    control: 'PROVIDER_RISK_CONTROL_SPEC.md',
    monitoring: 'PROVIDER_MONITORING_OVERVIEW_SPEC.md',
    report: 'PROVIDER_RISK_REPORT_SPEC.md',
    alert: 'PROVIDER_RISK_ALERT_HANDLING_SPEC.md',
    dashboard: 'PROVIDER_DASHBOARD_SPEC.md',
}
const sources = Object.fromEntries(await Promise.all(Object.entries(sourceNames).map(async ([key, name]) => [key, await readFile(path.join(docsRoot, name), 'utf8')])))
const pack = await readFile(path.join(docsRoot, 'spec-book/content/appendices/decision-pack-02-monitoring-risk.md'), 'utf8')
const projectIndex = await readFile(path.join(docsRoot, 'PROJECT_TRANSFER_INDEX.md'), 'utf8')
const failures = []
let assertionCount = 0

for (const key of ['control', 'monitoring', 'report', 'alert']) {
    assert(sources[key].includes('Decision Pack 02'), `${sourceNames[key]} 必須連結 Decision Pack 02`)
    assert(sources[key].includes('目前需求基準'), `${sourceNames[key]} 必須標示為目前需求基準`)
    assert(sources[key].includes('Production') && sources[key].includes('DEMO') && sources[key].includes('Test'), `${sourceNames[key]} 必須明示 Production／DEMO／Test 邊界`)
}

for (const text of [
    'Monitoring Signal',
    'Detection Result',
    'Risk Event',
    'Alert',
    'Mitigation Job',
    'Isolation Control',
    'GGAP Delivery',
    'event_fingerprint',
    'recurrence_group_id',
    '`open`',
    '`recovering`',
    '`resolved`',
    '`invalidated`',
    '`new`',
    '`in_progress`',
    '`monitoring`',
    '`closed`',
    '`resolution_code`',
    '`observe_only`',
    '`approval_required`',
    '`automatic`',
    '`desired_state`',
    '`actual_state`',
    'outbox',
    '`acknowledged`',
    '`allowed_actions`',
    '外部驗證點',
]) {
    assert(sources.control.includes(text), `共用風控規範缺少必要契約：${text}`)
}

for (const text of [
    'Signal 與 Detection Result',
    '`no_data`',
    '`insufficient_sample`',
    '`evaluation_failed`',
    '`alert_status` 是 `new`、`in_progress` 或 `monitoring`',
    '`risk_event_status` 是 `open` 或 `recovering`',
    '未恢復異常',
    '詳情維持唯讀',
]) {
    assert(sources.monitoring.includes(text), `監控總覽規格缺少必要同步內容：${text}`)
}

for (const text of [
    '`risk_event_status=open`',
    '`risk_event_status=recovering`',
    '`resolved` 或 `invalidated`',
    'event_fingerprint',
    'recurrence_group_id',
    'Detection Result ID',
    'Mitigation Job 彙總狀態',
    '隔離 desired／actual state',
    'GGAP Delivery 狀態',
    'Risk Event 詳情維持唯讀',
]) {
    assert(sources.report.includes(text), `風控報表規格缺少必要同步內容：${text}`)
}

for (const text of [
    '狀態只使用 `open`、`recovering`、`resolved`、`invalidated`',
    '狀態只使用 `new`、`in_progress`、`monitoring`、`closed`',
    '`false_positive` 是 Alert 結案的 `resolution_code`',
    'Mitigation Job 彙總狀態',
    '隔離 desired／actual state',
    '`pending`、`sending`、`sent`、`acknowledged`、`failed`',
    '`allowed_actions`',
    'idempotency_key',
    'version 或等價 optimistic concurrency control',
    '結案守門條件',
    '現行原型與後續實作',
]) {
    assert(sources.alert.includes(text), `風控告警／處理規格缺少必要同步內容：${text}`)
}

for (const text of [
    '`new`、`in_progress` 與 `monitoring`',
    '`resolution_code`',
    '`open` 或 `recovering`',
    '不合併成一筆新的 Dashboard 事件',
    'Decision Pack 02',
]) {
    assert(sources.dashboard.includes(text), `Dashboard 規格缺少必要引用：${text}`)
}

assert(!sources.control.includes('待處理 → 調查中 → 已緩解 → 已關閉'), '共用規範不得保留舊 Risk Event 人工作業生命週期')
assert(!sources.report.includes('狀態為待處理') && !sources.report.includes('狀態為調查中'), '風控報表不得使用舊的人工作業狀態描述 Risk Event')
assert(!sources.alert.includes('Alert API 狀態建議使用'), '告警規格不得把舊 Alert enum 保留為候選方案')
assert(!sources.alert.includes('`pending`、`investigating`、`mitigated`、`closed`'), '告警規格不得保留舊 Alert enum')
assert(!sources.alert.includes('`false_positive`。Alert'), 'false_positive 不得再作 Alert status')

for (const text of ['Monitoring Signal', 'Detection Result', 'Risk Event', 'Alert', 'Mitigation Job', 'Recovery']) {
    assert(pack.includes(text), `Decision Pack 02 上游缺少 ${text}`)
}

assert(projectIndex.includes('文件版本：2.24.0'), '專案交接索引必須同步 Decision Pack 02 Spec MD 與 Decision Pack 03 版本')
assert(projectIndex.includes('Decision Pack 02 已同步至監控與風控原始 Spec MD'), '專案交接索引必須記錄 Spec MD 同步狀態')

if (failures.length) {
    console.error(`Decision Pack 02 source spec validation failed (${failures.length}/${assertionCount})`)
    failures.forEach((failure) => console.error(`- ${failure}`))
    process.exitCode = 1
} else {
    console.log(`Decision Pack 02 source spec validation passed: ${assertionCount} assertions`)
    console.log('Coverage: 4 synchronized source specs / 1 Dashboard boundary / legacy Event and Alert lifecycles rejected')
}

function assert(condition, message) {
    assertionCount += 1
    if (!condition) failures.push(message)
}
