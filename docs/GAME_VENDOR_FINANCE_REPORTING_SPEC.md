# 遊戲商財務與報表共通規格

> 版本：0.2.0
> 更新日期：2026-08-08
> 狀態：財務總覽與代理商 × 遊戲彙總前端原型已完成；正式 API、權限與財務資料契約待確認

本文件是 Provider Portal 財務模組的共通規格，定義財務責任邊界、資料範圍、金額呈現、統計公式、對帳邊界與匯出原則。

各頁面的畫面、查詢條件、列表欄位與互動細節，應以本文件的共通原則為基礎，再以頁面專屬規格為準。

## 1. 產品定位

遊戲商財務是 Provider 對自己遊戲營運結果的財務統計，不是 GGAP 的平台財務、代理商結算或會員錢包。

Provider 財務報表的主要資料來源是 Provider 保存的 Game Round。GGAP 的平台比對與最終結算由財務或 GGAP 端執行。

Provider Portal 的財務報表重點是產出正確、可追溯、可依代理商與遊戲查看的 Provider 數據，不在 Provider Portal 內模擬 GGAP 對帳結果。

## 2. 財務頁面與關聯文件

| 功能 | Route | 本文件責任 | 頁面專屬規格 |
|---|---|---|---|
| 財務總覽 | `/finance` | 共通資料、公式、環境與金額原則 | [`GAME_VENDOR_FINANCE_OVERVIEW_SPEC.md`](./GAME_VENDOR_FINANCE_OVERVIEW_SPEC.md) |
| 代理商 × 遊戲彙總 | `/finance/agent-games` | 共通資料、公式、環境與金額原則 | [`GAME_VENDOR_FINANCE_AGENT_GAME_SPEC.md`](./GAME_VENDOR_FINANCE_AGENT_GAME_SPEC.md) |
| 遊戲紀錄 | `/reports` | 作為單筆 Game Round 的唯一明細來源 | [`GAME_ROUND_RECORDS_SPEC.md`](./GAME_ROUND_RECORDS_SPEC.md) |

財務頁面不建立獨立的 Game Round 財務明細頁。財務彙總若需要查看單筆資料，統一導入 `/reports`「遊戲紀錄」，避免同一筆 Game Round 出現兩套明細呈現。

Game Round 的資料結構、狀態與時間欄位，另依 [`GAME_ROUND_AND_REPORTING_SPEC.md`](./GAME_ROUND_AND_REPORTING_SPEC.md) 定義。

## 3. 與 GGAP 的責任邊界

| 項目 | Provider Portal | GGAP |
|---|---|---|
| 遊戲投注與派彩紀錄 | 保存 Provider Game Round 並產出 Provider 統計 | 傳入代理商、商戶、會員與幣別脈絡，保存平台側紀錄 |
| Provider 點數 | 定義遊戲點數、規則與統計方式 | 不改寫 Provider 遊戲規則 |
| USDT | 保存每筆 Game Round 對接時的換算結果 | 以 USDT 對接，並負責代理商側的下游金額／幣別轉換 |
| 遊戲商財務 | 提供 Provider 點數與 USDT 對照報表 | 可讀取或與 Provider 數據進行外部比對 |
| 平台財務／結算 | 不負責 | 負責 GGAP 平台側的財務與結算 |
| 對帳狀態 | 不在 Provider 財務報表呈現 | 由財務流程或 GGAP 對帳流程處理 |
| 代理商個別開關遊戲 | 不負責 | 對已由 Provider 上架的遊戲，依代理商個別開啟或關閉 |

Provider Portal 不建立 Provider 錢包、代理商錢包或會員錢包，也不管理代理商、商戶或會員主資料。

## 4. 共通資料範圍

### 4.1 資料來源與環境

- 財務統計來源為 Provider 保存的 Game Round。
- 正式財務報表預設只統計 `environment=production`。
- DEMO 可以實際遊玩，但 DEMO Game Round 必須獨立查詢與統計，不得混入正式投注、輸贏或 GGR。
- 測試環境資料只供 QA 測試與監控，不進入正式財務統計。
- Provider Portal 財務報表不提供環境混合統計。

### 4.2 統計時間與有效資料

- 財務報表預設依 `settled_at` 統計。
- 報表必須明確標示時區與查詢時間區間。
- 只有有效結算的 Game Round 進入一般財務彙總。
- 取消、失敗、重複、回滾資料應依狀態另列或排除，不可默默併入有效投注。
- 摘要數字應依完整篩選結果計算，不受列表分頁影響。
- 匯總查詢必須套用 Provider 隔離與正式使用者權限。

原型目前顯示 `UTC+08:00 · Asia/Taipei`，正式版本仍需由後端確認時區、最大查詢區間與查詢限制。

## 5. 金額與幣別呈現原則

- Provider 報表主要顯示 Provider 點數。
- USDT 顯示為對照資訊，使用者可透過展開、詳細資訊或匯出查看。
- 匯出資料同時包含 Provider 點數與 USDT 欄位。
- 金額欄位應標示數值精度、幣別與統計時間區間。
- 欄位標題旁提供 info tooltip，說明公式、統計時間與換算規則。
- 同一筆 Game Round 的 USDT 使用當次保存的換算結果，不可使用目前最新規則覆蓋歷史結果。
- 報表資料應保留換算規則版本或報表資料版本，方便日後追溯。

點數精度、USDT 精度、換算規則來源、四捨五入方式與版本鎖定方式，仍需由 Provider、後端與 GGAP 對接團隊確認。

## 6. 共通統計指標與公式

| 指標 | 公式／定義 |
|---|---|
| 投注總額 | `SUM(bet_points)` |
| USDT 投注總額 | `SUM(bet_usdt)`，實際換算規則待核准 |
| 派彩總額 | `SUM(payout_points)` |
| USDT 派彩總額 | `SUM(payout_usdt)`，實際換算規則待核准 |
| 投注筆數 | 有效結算 Game Round 數量 |
| 玩家人數 | 指定範圍內產生有效 Game Round 的不重複會員人數 |
| 平均投注額 | 投注總額 ÷ 投注筆數 |
| 人均投注額 | 投注總額 ÷ 不重複玩家人數 |
| 淨輸贏 | `SUM(net_result_points)`；目前老虎機與單人 Crash 單局為 `payout_points - bet_points` |
| GGR | 目前原型採 `投注總額 - 派彩總額`，正式定義與正負方向待 Provider 核准 |

目前原型可將淨輸贏與 GGR 視為相反方向的營運指標，但正式版本必須由 Provider 核准 `net_result_points`、GGR 與正負方向的關係。

若計算分母為 0，API 應回傳明確的 `null` 或 `zero` 語意；前端統一顯示 `-`，不可出現 Infinity 或 NaN。

平均投注額、人均投注額與 GGR 等公式，應透過欄位旁 info tooltip 提供使用者確認。

## 7. 單筆 Game Round 導入原則

財務彙總不建立第二套單筆明細。使用者從財務彙總進入明細時，統一導入 `/reports`「遊戲紀錄」，並帶入目前的：

- 時間區間
- 代理商
- 遊戲類型
- 遊戲
- 正式環境範圍

單筆資料的欄位、詳情內容、排序、查詢與匯出，依 [`GAME_ROUND_RECORDS_SPEC.md`](./GAME_ROUND_RECORDS_SPEC.md) 為準。

## 8. 對帳責任邊界

Provider 財務報表不提供以下 GGAP 對帳狀態：

- 已匹配
- 資料不一致
- 待處理
- GGAP 差異金額
- 對帳批次狀態

Provider Portal 的責任是產出一致、可追溯的 Provider 數據。實際與 GGAP 比對由財務或 GGAP 執行；若 Provider 偵測到自身資料異常，應以監控告警或資料品質狀態呈現，不冒充 GGAP 對帳結果。

## 9. 共通匯出與權限原則

匯出資料至少應包含：

- 報表產生時間與時區
- 查詢時間區間
- 代理商 ID／名稱
- 遊戲 ID／名稱／類型
- 投注筆數與玩家人數
- Provider 點數投注、派彩、輸贏與 GGR
- USDT 投注、派彩、輸贏與 GGR
- 平均投注額與人均投注額
- 使用的換算規則版本或報表資料版本

頁面專屬的匯出欄位選擇、必要欄位與檔案格式，依各頁規格定義。代理商 × 遊戲彙總的自訂欄位匯出見 [`GAME_VENDOR_FINANCE_AGENT_GAME_SPEC.md`](./GAME_VENDOR_FINANCE_AGENT_GAME_SPEC.md)。

正式版本的匯出需受權限與最大資料量限制；大範圍匯出可採非同步產檔，並透過通知中心告知完成。

原型階段權限暫時全開，不處理正式資料遮罩與 permission key。正式角色與權限應由 Provider 團隊另行確認，並由後端強制執行資料隔離與操作授權。

## 10. 待確認事項

- GGR 與 `net_result_points` 的正式定義、正負方向與棋牌適用方式。
- 點數與 USDT 的精度、換算規則來源、四捨五入與版本鎖定。
- 報表資料快照、重算策略與資料版本。
- 正式 API 的查詢條件、狀態、錯誤格式與最大查詢區間。
- CSV、XLSX 的單次匯出上限與非同步產檔流程。
- 財務月結或日結是否需要鎖定報表版本。
- DEMO 是否需要獨立的財務樣式報表，以及沙盒點數的顯示方式。
- Provider 正式角色、permission key、資料遮罩與稽核事件。
