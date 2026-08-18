# 狀態與枚舉

本頁集中管理跨頁狀態。Decision Pack 已確認的 Version、Release 與全域可用性是目前需求基準；標記為 Draft 的其他枚舉仍需由後端確認正式 API 值。

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

## Game Version 狀態

| API 值 | 顯示名稱 | 主要語意 |
|---|---|---|
| `draft` | 草稿 | 可編輯並建立 Test build |
| `candidate` | 發布候選 | 已綁定確切 Artifact，可進行 DEMO 驗證 |
| `approved` | 已核准 | 必要驗證與核准完成，可建立 Production Release |
| `published` | 已發布 | 曾成功發布 Production；不代表目前 Active |
| `retired` | 已退役 | 不再接受新 Launch、一般發布或回滾引用 |
| `cancelled` | 已取消 | 未成功發布的版本停止開發，歷史保留 |

## Release 主要顯示狀態

| 顯示名稱 | 主要語意 |
|---|---|
| 準備中 | 草稿、提交、自動檢查或需要修正 |
| 等待核准 | 高風險 Release 等待第二位管理者 |
| 已排程 | 檢查與必要核准完成，等待執行 |
| 發布中 | 預檢、部署、驗證或 Active 切換進行中 |
| 已成功 | 本 Release 已成為 Active |
| 已失敗 | 本次嘗試停止，保留階段與原因 |
| 已取消 | 不可逆副作用前由具權限者取消 |
| 已回滾 | 本 Release 已由新的回滾 Release 取代 |

## Provider 全域可用性

| API 值 | 顯示名稱 | 新 Launch |
|---|---|---:|
| `unpublished` | 未上架 | 拒絕 |
| `available` | 已上架 | 仍需通過 Active Release 與 GGAP Gate |
| `maintenance` | 維護中 | 拒絕 |
| `suspended` | 已暫停 | 立即拒絕 |
| `retired` | 已退役 | 永久拒絕，歷史保留 |

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
