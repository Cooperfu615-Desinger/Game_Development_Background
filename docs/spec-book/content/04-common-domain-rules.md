# 共通領域規則

本章集中定義所有頁面都必須遵守的業務與資料規則。頁面章節只描述例外或該頁特有行為。

## Game Round

- Game Round 是 Provider 的主要遊戲紀錄單位。
- 不建立獨立 Game Session 導覽或報表。
- 財務頁不建立第二套 Game Round 明細；單筆詳情沿用 `/reports`。
- 老虎機與目前單人 Crash 以單筆結算完成的 Game Round 為主。
- 未來多人玩法再增加共享局號與參與者關係。

## 環境隔離

| 環境 | 使用方式 | 可進入正式財務 | 可進入 Provider 風控 |
|---|---|---:|---:|
| Production | GGAP 正式遊戲服務 | 是 | 是 |
| DEMO | 官網／大廳沙盒試玩 | 否 | 是，但不得與 Production 混合 |
| Test | 前後端與 QA 驗證 | 否 | 否 |

正式財務與遊戲紀錄不得混入 DEMO 或 Test。Test 不出現在 Provider 風控監控、告警與摘要中。

## 金額與換算

- Provider 報表以 Provider 點數為主要顯示值。
- GGAP 與 Provider 目前以 USDT 為標準對接幣別。
- 每筆 Game Round 保存當次點數、USDT 換算結果與 `conversion_rule_id`。
- 歷史資料不得使用目前最新換算規則重新計算。
- 金額 API 建議使用 decimal string，不使用 JavaScript 浮點數。

## 時間

- 一般遊戲紀錄與財務報表預設依 `settled_at` 統計。
- 監控與風控依各頁定義使用滾動區間、目前狀態或 `detected_at`。
- API 時間必須包含可辨識時區；畫面需顯示所使用時區。
- 目前原型多使用 `UTC+08:00 · Asia/Taipei`，正式契約仍待核准。

## 顯示語言

- 一般介面使用台灣繁體中文。
- API 值、route、ID、錯誤碼、HTTP method、endpoint、版本號與正式欄位名稱不得翻譯或改值。
- `Provider Game Round ID` 主要顯示為「遊戲商遊戲回合 ID」。
- `GGAP Round ID` 主要顯示為「GGAP 遊戲回合 ID」。

## 共用資料狀態

頁面至少應考慮初次載入、查詢中、空資料、無資料、部分來源失敗、全部來源失敗、權限不足與資料版本衝突。不得沿用舊值冒充最新資料，也不得把無資料視為正常。
