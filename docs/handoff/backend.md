# 後端交接文件：Provider Portal 與 GGAP 邊界

> 狀態日期：2026-08-04
> 文件狀態：Provider 邊界草案，待後端與 GGAP 對接團隊確認

本專案目前沒有真實後端；`src/mocks/` 只模擬前端流程。GGAP 的平台開發在另一個專案進行，本文件先整理遊戲商 Provider Portal 需要的後端責任與對接缺口。

## 1. 系統責任邊界

### Provider Portal / 遊戲商後端負責

- Provider 自己的遊戲主資料、遊戲類型、版本與資產
- 遊戲規則、RTP、遊戲商點數、限紅與點數換算規則
- 遊戲全域上架、下架、維護與版本狀態
- 接收 GGAP 傳入的遊戲請求脈絡
- 建立不可任意改寫的 Game Round 紀錄
- 由 Game Round 產生遊戲數據、遊戲商財務與風控報表
- Provider 使用者、角色、權限、通知與官網內容

### GGAP 負責

- 代理商、商戶、會員、平台錢包與平台交易
- GGAP 自己的代理商幣別與金額換算
- 平台側財務、結算與對帳
- 針對已上架遊戲，依代理商個別開啟 / 關閉
- 聚合多家 Provider 的平台級報表

Provider 不應建立平台會員錢包，也不應要求 Provider Portal 管理代理商與商戶主資料。

## 2. GGAP 依據與目前缺口

`docs/GGAP_final_system_spec_tech.html` 是 GGAP 平台的系統依據，涵蓋 GGAP Admin、Agent、Merchant 與 Provider Adapter 等平台側設計。

目前仍缺少 Provider Portal 對接契約，至少需要補齊：

1. GGAP 如何呼叫 Provider 的遊戲清單與遊戲啟動 / 結算接口。
2. Provider 如何識別 GGAP、代理商、商戶與會員。
3. USDT 與 Provider 點數的換算欄位與精度。
4. Game Round 的唯一識別、冪等鍵、重試與補單規則。
5. Provider 上架狀態與 GGAP 代理商開關狀態如何分離。
6. 錯誤、逾時、回呼、簽章與重放攻擊防護。
7. Provider 報表與 GGAP 平台報表的欄位對應方式。

## 3. Provider 身份與資料範圍

目前 mock token 的 `supplier / agent / merchant` 三 Portal 欄位只供舊原型使用，正式 Provider token 不應沿用這個模型。

目標 token 欄位草案：

| 欄位 | 說明 |
|---|---|
| `sub` | Provider 使用者 ID |
| `provider_id` | 所屬遊戲商 ID |
| `role` | Provider 內部角色 |
| `permissions` | 後端授權用權限集合 |
| `iat` / `exp` | 簽發與過期時間 |
| `jti` | 可選，用於撤銷與追蹤 |

資料查詢以 `provider_id` 為必要隔離條件。代理商、商戶、會員欄位只作為 Game Round 的 GGAP 業務脈絡，不代表 Provider 可以管理這些主體。

## 4. Game Round 資料模型草案

Game Round 是 Provider 的主要業務紀錄；不建立 Game Session 作為獨立模組。

### 必要識別與脈絡

| 欄位 | 說明 |
|---|---|
| `round_id` | Provider 端唯一局號 |
| `external_round_id` | GGAP 傳入的局號或請求識別 |
| `provider_id` | 遊戲商隔離鍵 |
| `game_id` / `game_name` | 遊戲識別與顯示名稱 |
| `game_type` | slots、crash、table 等 |
| `agent_id` | GGAP 代理商識別，可為快照欄位 |
| `merchant_id` | 若 GGAP 脈絡有提供，可為快照欄位 |
| `member_id` | GGAP 會員識別，不由 Provider 建立會員主檔 |
| `currency` | GGAP 標準幣別，現階段以 USDT 為主 |

### 金額與時間

| 欄位 | 說明 |
|---|---|
| `bet_points` | Provider 遊戲點數投注額 |
| `win_points` | Provider 遊戲點數派彩額 |
| `net_points` | 依 Provider 定義的淨輸贏或 GGR 方向 |
| `bet_usdt` / `win_usdt` / `net_usdt` | 對應換算值，需保存換算規則版本 |
| `conversion_rule_id` | 使用的點數 / USDT 換算規則 |
| `started_at` | 棋牌或多人玩法可使用；slots / 單人 Crash 可為空 |
| `settled_at` | 結算完成時間，報表主要時間欄位 |
| `status` | settled、cancelled、rollback 等，實際值待確認 |

同一筆 Game Round 的點數與 USDT 應保存當時的換算結果，不應只在查詢時套用最新規則。

## 5. 報表資料原則

- Provider 報表以遊戲商點數為主要顯示值，USDT 作為次要顯示與匯出欄位。
- 主要維度是時間、代理商、遊戲；代理商與會員只作為 GGAP 傳入的分析脈絡。
- 主要指標：投注筆數、玩家人數、投注總額、平均投注額、人均投注額、輸贏、GGR。
- `settled_at` 是預設統計時間；未結算、失敗、重複、回滾資料需依狀態規則排除。
- 平均投注額 = 投注總額 ÷ 投注筆數。
- 人均投注額 = 投注總額 ÷ 不重複玩家人數。
- 不在 Provider 報表加入 GGAP 對帳狀態；對帳由財務或 GGAP 端執行。

## 6. 建議的 Provider API 資源

以下路徑是整理用的目標草案，尚未代表 GGAP 已核准的正式路徑：

| 資源 | 目的 |
|---|---|
| `GET /api/provider/v1/games` | Provider 遊戲主資料列表 |
| `GET /api/provider/v1/games/:id` | 遊戲詳情、規則、版本、資產 |
| `PATCH /api/provider/v1/games/:id` | 遊戲全域狀態或主資料更新 |
| `GET /api/provider/v1/game-rounds` | Game Round 明細查詢 |
| `GET /api/provider/v1/game-rounds/:id` | Game Round 詳情 |
| `GET /api/provider/v1/reports/game-rounds` | 時間 × 代理商 × 遊戲聚合 |
| `GET /api/provider/v1/finance/summary` | 遊戲商財務彙總 |
| `GET /api/provider/v1/monitoring/alerts` | 遊戲與對接監控告警 |
| `GET /api/provider/v1/notifications` | Provider 通知中心 |
| `PATCH /api/provider/v1/notifications/:id/read` | 通知已讀 |

正式後端需在實作前確認命名、分頁、排序、權限、錯誤格式與版本策略。

## 7. 安全與一致性要求

- 正式環境使用後端簽發與驗證的 JWT 或等效 token；mock token 不可沿用。
- 所有 Provider 查詢必須由後端強制套用 `provider_id` 隔離。
- Game Round 建立與結算需要冪等鍵，重試不得產生重複投注。
- 修改遊戲上下架、規則、限紅與換算規則應留下操作者與版本紀錄。
- API 不應把 secret、私鑰或完整敏感憑證放在一般列表回傳。
- 報表聚合必須在後端依查詢條件重新計算，不可直接回傳未套範圍的總數。

## 8. 待確認事項

- Provider 點數的最小精度與 USDT 換算方向。
- `net_points` 的正負定義，以及 GGR 是否另存欄位。
- Crash / 棋牌未結算、取消、退款與回滾的狀態流程。
- GGAP 會提供哪些代理商 / 商戶 / 會員欄位，以及是否需要快照保存。
- 多人玩法的共享局號與參與者模型。
