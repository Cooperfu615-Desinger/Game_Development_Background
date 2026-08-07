# Game Round 與遊戲紀錄 / 報表規格

> 版本：0.1.0
> 更新日期：2026-08-06
> 狀態：工作規格，欄位命名與原型金額公式已確認，正式 API 仍待後端確認

## 1. 設計原則

- Game Round 是 Provider 的主要遊戲紀錄單位。
- Game Record、Game Session 與交易事件不作為三個平行主模組；相關資料整合在 Game Round 或其事件欄位中。
- 交易事件可作為技術追蹤資料，但不建立主要交易事件報表。
- 報表由 Game Round 聚合產生，明細可回到原始 Game Round。

## 2. 遊戲類型與時間

| 遊戲類型 | `started_at` | `settled_at` | 說明 |
|---|---|---|---|
| 老虎機 | 可選 | 必填 | 玩家按 Spin 到結算的開始時間目前用途較低，保留欄位即可 |
| 單人 Crash Game | 可選 | 必填 | 目前 27 款玩法皆為單人，基本模型與老虎機相同 |
| 棋牌 / 桌上遊戲 | 建議保留 | 必填 | 可表達一局開始與結算的時間差 |
| 未來多人玩法 | 必填或依玩法 | 必填 | 另加共享局號與參與者資料 |

所有報表預設使用 `settled_at`；若要分析進行時間，才使用 `started_at`。

## 3. Game Round 欄位

### 3.1 識別與脈絡

| 欄位 | 必填 | 說明 |
|---|---:|---|
| `round_id` | 是 | Provider 端唯一識別 |
| `external_round_id` | 是 | GGAP 傳入或對應的外部局號 |
| `provider_id` | 是 | Provider 資料隔離鍵 |
| `game_id` | 是 | 遊戲識別 |
| `game_name` | 是 | 當時的遊戲名稱快照 |
| `game_type` | 是 | `slots`、`crash`、`table` 等 |
| `agent_id` | 視 GGAP 提供 | 代理商識別快照 |
| `merchant_id` | 視 GGAP 提供 | 商戶識別快照，不代表 Provider 管理商戶 |
| `member_id` | 是 | GGAP 會員識別，不建立 Provider 會員主檔 |
| `currency` | 是 | 對接標準，現階段為 `USDT` |
| `request_id` | 是 | 請求冪等與追蹤識別 |
| `environment` | 是 | `production`、`demo`、`test`，用於資料隔離 |

### 3.2 金額與規則

| 欄位 | 必填 | 說明 |
|---|---:|---|
| `bet_points` | 是 | Provider 點數投注額 |
| `payout_points` | 是 | Provider 點數派彩額 |
| `net_result_points` | 是 | 玩家淨輸贏點數；目前老虎機與單人 Crash 為 `payout_points - bet_points` |
| `bet_usdt` | 是 | 投注額換算值 |
| `payout_usdt` | 是 | 派彩額換算值 |
| `net_result_usdt` | 是 | 依當次換算規則將 `net_result_points` 換算為 USDT；不可用已四捨五入的派彩與投注 USDT 再相減 |
| `conversion_rule_id` | 是 | 當次使用的換算規則版本 |
| `limit_rule_id` | 視需要 | 當次限紅或遊戲規則版本 |

金額建議使用 decimal / string，不使用 JavaScript 浮點數。換算結果需保存，不可只在報表查詢時使用最新規則重算。

### 3.3 時間與狀態

| 欄位 | 說明 |
|---|---|
| `started_at` | 棋牌或多人玩法可使用；老虎機 / 單人 Crash 可為空 |
| `settled_at` | 結算完成時間，預設報表時間 |
| `status` | `processing`、`settled`、`cancelled`、`rollback` 等，正式枚舉待確認 |
| `settlement_version` | 結算或修正版本，可選 |
| `created_at` / `updated_at` | 技術追蹤時間 |

## 4. Game Round 狀態流程

```text
processing -> settled
processing -> cancelled
settled -> rollback（只允許明確的補償 / 回滾流程）
```

- 只有有效 `settled` Game Round 進入一般投注與輸贏報表。
- `cancelled`、重複、失敗或回滾資料需依正式財務規則排除或另列。
- 不直接刪除已保存的 Game Round；修正需留下事件與 audit log。

### 4.1 環境資料隔離

- `production` Game Round 進入正式遊戲商數據與財務報表。
- `demo` Game Round 可以實際遊玩，但只能進入 DEMO / 沙盒資料與獨立統計，不得混入正式財務或 GGAP 正式結算。
- `test` / QA Game Round 只供送測版本驗證與測試查詢，預設不進入正式財務報表。
- `round_id` 與 `external_round_id` 的唯一性需包含環境識別，避免不同環境重複局號互相覆蓋。

## 5. 明細與報表關係

### Game Round 明細

可查詢單筆紀錄，至少顯示：

- 遊戲、玩法、局號與狀態
- 代理商與會員脈絡；`merchant_id` 若因 GGAP 追蹤需要保存，屬後端隱藏快照，不作為 Provider UI、查詢或報表維度
- 開始時間（若有）與結算時間
- 點數投注、派彩、淨值
- USDT 投注、派彩、淨值
- 換算規則、限紅版本與原始請求識別
- 失敗、取消、回滾或重試資訊

### 聚合報表

預設維度為：

1. 指定時間區間
2. 代理商
3. 遊戲

可再依遊戲類型或會員查詢，但會員明細不應取代 Game Round 主資料。

## 6. 報表指標與公式

| 指標 | 公式 / 定義 |
|---|---|
| 投注筆數 | 有效 `settled` Game Round 數量 |
| 玩家人數 | `member_id` 不重複數 |
| 投注總額 | `SUM(bet_points)`，USDT 同理 |
| 平均投注額 | 投注總額 ÷ 投注筆數 |
| 人均投注額 | 投注總額 ÷ 不重複玩家人數 |
| 玩家淨輸贏 | `SUM(net_result_points)`；USDT 使用 `SUM(net_result_usdt)` |
| GGR | 依 Provider 核准的 GGR 定義計算 |

筆數或玩家數為 0 時，平均值顯示 `-` 或 0 的規則需統一，不可讓前端自行決定。

## 7. 點數與 USDT 顯示

- 列表主要顯示遊戲商點數。
- 點擊或展開數值可查看對應 USDT。
- 欄位旁 info tooltip 顯示公式與換算規則。
- 匯出同時提供點數與 USDT，不以其中一種取代另一種。
- 顯示換算值時應標示幣別與精度。

## 8. 資料排除與品質

一般報表至少排除：

- 無法驗證來源的資料
- 重複冪等鍵
- 失敗且未結算的請求
- 已取消或已回滾的有效投注
- 不屬於目前 Provider 的資料

資料異常應進入監控與通知，而不是靜默修改原始紀錄。

## 9. 未來多人玩法

多人 Crash 或棋牌需要時再擴充：

- `shared_round_id`
- `participant_id`
- `participant_role`
- 共享局開始 / 結束時間

單人 slots 與單人 Crash 不需要為了未來多人玩法預先建立 Game Session 模組。

## 10. 待確認事項

- `net_result_points` 與 GGR 的關係，以及 GGR 的正負方向。
- 退款、回滾與補單是否以新 round 或事件表示。
- Game Round 保存期限與查詢期限。
- 會員 ID 是否需要遮罩或欄位權限。
- 報表時區、最大查詢區間與匯出上限。
- DEMO 使用的沙盒點數 / 錢包來源，以及 DEMO 是否需要獨立的遊戲統計報表。
