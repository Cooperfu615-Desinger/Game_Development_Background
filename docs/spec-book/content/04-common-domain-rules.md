# 共通領域規則

本章集中定義所有頁面都必須遵守的業務與資料規則。頁面章節只描述例外或該頁特有行為。

## Game Round

- Game Round 是 Provider 的主要遊戲紀錄單位。
- 不建立獨立 Game Session 導覽或報表。
- 財務頁不建立第二套 Game Round 明細；單筆詳情沿用 `/reports`。
- 老虎機與目前單人 Crash 以單筆結算完成的 Game Round 為主。
- 未來多人玩法再增加共享局號與參與者關係。

## Game、Version、Artifact 與 Release

- `game_id` 表示長期穩定遊戲主體，不因版本更新而更換。
- Version 是程式、數值、設定、素材與相容性的功能快照；正式狀態為 `draft`、`candidate`、`approved`、`published`、`retired`、`cancelled`。
- Artifact 是以 `build_id`、manifest 與 checksum 識別的不可變執行產物；重建即產生新 `build_id`。
- Release Record 是一次環境發布事實。重試、重新發布與回滾都建立新 `release_id`，不得覆寫歷史。
- 同一 Game × Environment 同時只有一筆 Active Release；`published` Version 不必然是目前 Active。
- Test 可反覆 build；DEMO 通過後 Production 必須發布同一 Artifact，不得重新 build。

## Launch 與既有 Round

- Provider 可使用短效 Launch Context 綁定 Game、Version、Build、Release、environment 與 GGAP Context，但不建立長期 Game Session 主資料。
- 發布、回滾、維護、暫停或隔離只改變新 Launch 與新 Round；既有 Round 永久依建立時的 Version、Build、Release、數值、倍率與限額快照完成。
- `maintenance`、`suspended` 或隔離後仍接受既有 Round 必要的 Settlement、Cancel、Refund、Callback、查詢與冪等重試。
- 晚到請求先依 `round_id` 找回原快照；找不到時進入異常處理，不建立假 Round。

## 環境隔離

| 環境 | 使用方式 | 可進入正式財務 | 可進入 Provider 風控 |
|---|---|---:|---:|
| Production | GGAP 正式遊戲服務 | 是 | 是 |
| DEMO | 官網／大廳沙盒試玩 | 否 | 是，但不得與 Production 混合 |
| Test | 前後端與 QA 驗證 | 否 | 否 |

正式財務與遊戲紀錄不得混入 DEMO 或 Test。Test 不出現在 Provider 風控監控、告警與摘要中。

## 全域可用性與 GGAP Gate

- Provider 全域可用性為 `unpublished`、`available`、`maintenance`、`suspended`、`retired`，與 Version／Release 狀態分開。
- Production Release 成功不自動代表全域上架。
- 上架等待 GGAP ACK 後才對外開放；維護、暫停、隔離與退役先由 Provider 本地拒絕新 Launch，再可靠通知 GGAP。
- GGAP 只對 Provider 已可用的遊戲控制代理商個別開放；Provider 不維護代理商開關。

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

## 公開內容與大廳契約

- DP04 的六個核心物件為 Content Entry、Content Revision、Published Snapshot、Publish Job、Preview Manifest 與 Publication Event；各自使用穩定 ID，不以名稱、版號或單一 `status` 混用。
- 官網 Banner、官網 Static Content、Lobby Game Content 與 Lobby Catalog 共用發布引擎，但各自擁有獨立 publication scope、Revision、Job、Snapshot、失敗與 Restore 歷程。
- 每次成功儲存建立不可變 Revision；編輯、儲存、驗證與預覽都不改變公開內容。只有成功 Job 可以原子切換 Published Snapshot，切換前失敗保留舊 Snapshot。
- 第一版固定 `zh-TW`、`zh-CN`、`en`、`ja` 四語原子發布。欄位只能使用 `STRICT`、`FALLBACK` 或 `OPTIONAL_HIDE`，Snapshot 保存 requested／resolved locale 與 exact Asset Version。
- Lobby 是否可玩同時受 DP03 Provider global availability、DP04 Published Catalog／Game Content 與 GGAP 代理商 Launch Gate 控制；任一層阻擋即不可 Launch。
- `maintenance`、`suspended`、`retired` 是 DP03 runtime safety overlay，不寫回 DP04 Content Revision；coming soon／playable 是 DP04 內容語意。
- DEMO telemetry 只提供 readiness／quality evidence，不會自動發布或改寫 Revision，且不進入 Production Game Round、財務、會員、錢包或 Provider 風控。

## 共用資料狀態

頁面至少應考慮初次載入、查詢中、空資料、無資料、部分來源失敗、全部來源失敗、權限不足與資料版本衝突。內容頁另需涵蓋 Revision／Publication Conflict、Approval、Job、Delivery、Manifest／Asset／Dependency 狀態。不得沿用舊值冒充最新資料，也不得把無資料視為正常。
