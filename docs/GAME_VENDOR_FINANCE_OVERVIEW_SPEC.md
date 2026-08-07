# 遊戲商財務總覽原型規格

> 版本：0.1.0
> 更新日期：2026-08-07
> 狀態：前端原型骨架已完成，正式 API 與資料契約待確認

本文件只描述 Provider Portal 的「遊戲商財務 > 財務總覽」頁面。完整的財務責任邊界、報表種類、金額公式與匯出原則，請一併參考 [`GAME_VENDOR_FINANCE_REPORTING_SPEC.md`](./GAME_VENDOR_FINANCE_REPORTING_SPEC.md)。

## 1. 頁面定位

財務總覽是 Provider 查看指定期間遊戲營運與財務結果的入口，重點是快速掌握整體投注、派彩、輸贏與遊戲表現。

本頁不是：

- GGAP 平台財務或代理商結算頁面。
- GGAP 對帳比對頁面。
- Provider、代理商或會員錢包頁面。
- DEMO / 測試環境報表。
- 單筆 Game Round 明細頁。

## 2. 路由與資料範圍

| 項目 | 定義 |
|---|---|
| 導覽 | 遊戲商財務 > 財務總覽 |
| 路由 | `/finance` |
| 主要資料來源 | Provider 保存的 Game Round |
| 環境 | 僅 `production` |
| 統計時間 | 預設使用 `settled_at` |
| 時區 | 原型顯示 `UTC+08:00 · Asia/Taipei` |
| 有效資料 | 已完成且有效結算的 Game Round |

目前頁面使用 mock data，頁面上需明確標示 Prototype / Mock data，不代表正式資料模型或正式統計結果。

## 3. 查詢條件

查詢條件只保留財務總覽需要的範圍：

- 時間區間。
- 代理商。
- 遊戲類型。
- 遊戲。

原型提供以下快速時間選項：

- 今日。
- 昨日。
- 近 7 日。
- 近 30 日。
- 自訂。

目前原型預設使用近 7 日。正式版本仍需確認預設期間、最大查詢區間、時區與查詢限制。

不提供環境篩選器，因為本頁只處理正式環境資料。

## 4. 統計卡片

主要統計卡片共八項：

| 指標 | 主要顯示 | 原型公式 / 說明 |
|---|---|---|
| 投注總額 | Provider 點數，附 USDT 對照 | `SUM(bet_points)` |
| 派彩總額 | Provider 點數，附 USDT 對照 | `SUM(payout_points)` |
| 淨輸贏 | Provider 點數，附 USDT 對照 | 原型使用 `派彩總額 - 投注總額` |
| GGR | Provider 點數，附 USDT 對照 | 原型使用 `投注總額 - 派彩總額` |
| 投注筆數 | 筆數 | 有效 settled Game Round 數量 |
| 玩家人數 | 人數 | 正式版本應為指定範圍內不重複會員人數 |
| 平均投注額 | Provider 點數，附 USDT 對照 | 投注總額 ÷ 投注筆數 |
| 人均投注額 | Provider 點數，附 USDT 對照 | 投注總額 ÷ 不重複玩家人數 |

卡片標題旁提供 info tooltip，說明公式。正式 GGR 定義、正負方向與 `net_result_points` 的關係，仍需由 Provider 團隊核准。

## 5. 趨勢圖

### 5.1 財務金額趨勢

顯示：

- 投注額。
- 派彩額。
- 淨輸贏。
- GGR。

原型支援每日與每小時的展示型切換。

### 5.2 活躍度趨勢

顯示：

- 投注筆數。
- 不重複玩家人數。

原型支援每日與每小時的展示型切換。

## 6. 遊戲表現排行

總覽下方提供遊戲表現排行，依 GGR 由高至低排列。欄位包含：

- 遊戲名稱與遊戲 ID。
- 遊戲類型。
- 投注筆數。
- 玩家人數。
- 投注總額。
- 派彩總額。
- 淨輸贏。
- GGR。
- 平均投注額。
- 人均投注額。

主要金額顯示 Provider 點數，USDT 作為保存換算結果對照。總覽不加入代理商排行；代理商只作為查詢條件，代理商 × 遊戲的詳細分析另於後續彙總報表處理。

## 7. 原型階段限制

以下是目前原型刻意保留的限制，不視為本階段畫面完成的阻擋問題：

- 頁面使用固定 mock data，不接正式 API，也不保存查詢結果。
- 日期區間目前會更新頁面顯示的查詢範圍，但 mock 統計資料尚未依日期重新聚合。
- 趨勢圖使用固定展示資料，尚未依代理商、遊戲類型、遊戲或日期條件重新計算。
- 玩家人數目前由 mock 遊戲列資料組合；正式版本必須由後端提供不重複會員數，避免跨遊戲重複計算。
- 匯出按鈕目前只顯示原型提示，不產生正式 CSV / XLSX 檔案。
- USDT 顯示為每筆 Game Round 保存換算結果的 mock 對照，精度、規則版本與四捨五入方式待確認。

## 8. 不在本頁範圍

- 代理商排行。
- GGAP 已匹配、資料不一致、待處理等對帳狀態。
- GGAP 差異金額與對帳批次。
- 平台財務、平台結算與錢包餘額。
- DEMO 與測試環境資料。
- 財務月結、日結鎖定與正式版本快照。
- 正式權限、匯出上限與非同步產檔流程。

## 9. 驗收方向

- 可從左側導覽進入 `/finance`。
- 查詢條件包含時間區間、代理商、遊戲類型與遊戲。
- 顯示八項統計卡片。
- 顯示財務金額趨勢與活躍度趨勢。
- 顯示遊戲表現排行，不顯示代理商排行。
- Provider 點數為主要金額，USDT 為對照資訊。
- 頁面明確標示正式環境與原型 mock data。
- 桌面與手機版皆可閱讀，表格可在自身區域橫向查看，不造成整頁水平溢出。

## 10. 關聯文件

- [`GAME_VENDOR_FINANCE_REPORTING_SPEC.md`](./GAME_VENDOR_FINANCE_REPORTING_SPEC.md)
- [`GAME_ROUND_AND_REPORTING_SPEC.md`](./GAME_ROUND_AND_REPORTING_SPEC.md)
- [`GAME_ROUND_RECORDS_SPEC.md`](./GAME_ROUND_RECORDS_SPEC.md)
- [`PROVIDER_PORTAL_NAVIGATION_SPEC.md`](./PROVIDER_PORTAL_NAVIGATION_SPEC.md)
- [`handoff/project-status.md`](./handoff/project-status.md)
- [`handoff/frontend.md`](./handoff/frontend.md)
