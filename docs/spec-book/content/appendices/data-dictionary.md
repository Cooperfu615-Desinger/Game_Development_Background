# 資料字典

本頁將集中管理跨模組共用欄位。目前先建立第一批核心識別與金額欄位，完整型別、長度與索引待後端確認。

## 核心識別

| 欄位 | 說明 | 備註 |
|---|---|---|
| `provider_id` | Provider tenant 隔離鍵 | 所有 Provider 查詢必須套用 |
| `round_id` | Provider Game Round 唯一識別 | 畫面顯示「遊戲商遊戲回合 ID」 |
| `external_round_id` | GGAP 傳入或對應的 Round ID | 畫面顯示「GGAP 遊戲回合 ID」 |
| `request_id` | 單次 API 請求追蹤與冪等 | 不等同 Round ID |
| `provider_event_id` | Provider／GGAP Callback 或通知去重識別 | 不等同風控事件 |
| `risk_event_id` | Provider Risk Event 識別 | 格式 `rsk_<ULID>` |
| `alert_id` | Provider 風控處理工作項目識別 | 一個 Risk Event 第一版對應一個主要 Alert |

## 遊戲版本與發布識別

| 欄位 | 說明 | 備註 |
|---|---|---|
| `game_id` | Provider 遊戲長期穩定識別 | 不因版本更新而更換 |
| `version_id` | Game Version 功能快照識別 | 與顯示版號、Build 分開 |
| `build_id` | 不可變 Build Artifact 識別 | 重新建置必須產生新值 |
| `artifact_checksum` | Artifact manifest／內容完整性校驗 | 不得由檔名或 URL 取代 |
| `release_id` | 單次環境發布、重試或回滾紀錄 | Release Record 不可覆寫 |
| `active_release_id` | Game × Environment 目前生效 Release | 同一時間最多一筆 |
| `launch_id` | 短效 Launch Context 識別 | 不是 Game Session 或 Round ID |
| `release_event_id` | 發布／全域狀態外部投遞事件識別 | 用於 outbox、冪等與 GGAP ACK |

## Game Round 金額

| 欄位 | 說明 |
|---|---|
| `bet_points` | Provider 點數投注額 |
| `payout_points` | Provider 點數派彩額 |
| `net_result_points` | 玩家淨輸贏點數，現階段為派彩減投注 |
| `bet_usdt` | 當次投注換算結果 |
| `payout_usdt` | 當次派彩換算結果 |
| `net_result_usdt` | 依當次規則直接換算的淨輸贏，不以已四捨五入欄位相減 |
| `conversion_rule_id` | 當次使用的換算規則版本 |

## 時間

| 欄位 | 說明 |
|---|---|
| `started_at` | Game Round 開始時間；部分單人遊戲可空 |
| `settled_at` | 結算完成時間；一般報表主要時間 |
| `created_at` | 技術建立時間 |
| `updated_at` | 技術最後更新時間 |
| `detected_at` | Risk Event 被偵測時間 |
