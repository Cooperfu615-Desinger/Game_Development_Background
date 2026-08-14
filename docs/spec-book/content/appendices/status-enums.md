# 狀態與枚舉

本頁集中管理跨頁狀態。標記為 Draft 的枚舉仍需由後端確認正式 API 值。

## Game Round 狀態（Draft）

| API 值 | 顯示名稱 | 一般財務統計 |
|---|---|---:|
| `processing` | 處理中 | 否 |
| `settled` | 已結算 | 有效資料才納入 |
| `cancelled` | 已取消 | 否 |
| `rollback` | 已回滾 | 否或另列 |
| `failed` | 結算失敗 | 否 |

## 環境

| API 值 | 顯示名稱 | Provider 風控 |
|---|---|---:|
| `production` | 正式環境（Production） | 是 |
| `demo` | 展示環境（DEMO） | 是，獨立統計 |
| `test` | 測試環境（Test） | 否 |

## 風控事件狀態

`pending`、`investigating`、`mitigated`、`closed`、`false_positive` 的正式顯示與 Risk Event／Alert 用詞需依各自規格區分。

## 自動緩解狀態

| API 值 | 顯示名稱 |
|---|---|
| `not_required` | 不需處理 |
| `pending` | 處理中 |
| `applied` | 已套用 |
| `failed` | 處理失敗 |
| `released` | 已解除 |
