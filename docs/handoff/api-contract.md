# API 契約總表：Provider Portal 工作草案

> 狀態日期：2026-08-04
> 契約狀態：前端原型可用；Provider 正式 API 尚待 GGAP 與後端確認

本文件分開記錄「目前前端 mock 的傳輸方式」與「新版 Provider API 的目標資源」。目標路徑、欄位與錯誤格式在後端確認前，不得視為正式 API。

## 1. 目前前端傳輸層

入口：`src/services/apiClient.ts`

| 方法 | 實作 | 說明 |
|---|---|---|
| `api.get<T>(path)` | 已有 | GET，附加 mock bearer token |
| `api.post<T>(path, body?)` | 已有 | JSON body |
| `api.put<T>(path, body?)` | 已有 | JSON body |
| `api.patch<T>(path, body?)` | 已有 | JSON body |
| `api.del<T>(path)` | 已有 | DELETE |

目前行為：

- 使用 `authStore.token` 時附上 `Authorization: Bearer <token>`。
- 非 2xx 回應拋出錯誤。
- 回應直接解析 JSON；沒有自動套用 `{ code, data }` 包裝。
- MSW 只在本地原型攔截 `/api/*`。
- 一些舊頁面仍使用原生 `fetch`，正式後端接入前需完成遷移與錯誤狀態處理。

## 2. 舊版 mock API 分類

以下路徑是目前原型的歷史資料來源，不是新版 Provider API 契約：

| 類別 | 目前路徑範例 | 新版處理 |
|---|---|---|
| 舊 Portal | `/api/agents/*`、`/api/merchants/*`、`/api/sub-accounts/*` | 不列為 Provider 主要資源 |
| 聚合平台 | `/api/aggregators/*`、`/api/platforms/*` | 改為 GGAP 對接狀態與連線資源 |
| 會員分析 | `/api/players/*`、`/api/analytics/*` | 由 Game Round 脈絡提供統計，不建立 Provider 會員主檔 |
| 舊交易 | `/api/orders/*`、`/api/transactions/*` | 改為 Game Round 與遊戲商財務資料 |
| 舊結算 | `/api/finance/*`、`/api/settlements/*` | 重新定義為遊戲商財務；平台結算留在 GGAP |
| 舊獎池 | `/api/jackpot/*` | 目前不建立獨立 Provider 模組 |
| 遊戲 | `/api/games/*` | 保留概念，改成 Provider 遊戲主資料資源 |
| 報表 | `/api/reports/*`、`/api/dashboard/*` | 改成 Provider Game Round 聚合 |

## 3. Provider API 目標資源草案

以下是供前後端討論的工作契約，`/api/provider/v1` 只是暫定命名：

| method | path | 用途 | 狀態 |
|---|---|---|---|
| GET | `/api/provider/v1/games` | 遊戲主資料列表 | 待確認 |
| GET | `/api/provider/v1/games/:id` | 遊戲詳情、版本、資產、規則 | 待確認 |
| PATCH | `/api/provider/v1/games/:id` | 遊戲全域資料或上下架狀態 | 待確認 |
| GET | `/api/provider/v1/game-rounds` | Game Round 分頁查詢 | 待確認 |
| GET | `/api/provider/v1/game-rounds/:id` | Game Round 明細 | 待確認 |
| GET | `/api/provider/v1/reports/game-rounds` | 時間 × 代理商 × 遊戲聚合 | 待確認 |
| GET | `/api/provider/v1/finance/summary` | 遊戲商財務統計 | 待確認 |
| GET | `/api/provider/v1/monitoring/alerts` | 遊戲、請求、結算異常 | 待確認 |
| GET | `/api/provider/v1/notifications` | 通知列表 | 待確認 |
| PATCH | `/api/provider/v1/notifications/:id/read` | 標示通知已讀 | 待確認 |

Provider Portal 不需要自行提供代理商、商戶、會員錢包與平台結算 API。

## 4. 共用查詢參數草案

列表與報表資源預計共用以下參數，實際名稱待確認：

| 參數 | 說明 |
|---|---|
| `page` / `page_size` | 分頁，後端應限制最大筆數 |
| `from` / `to` | 時間區間；報表預設使用 `settled_at` |
| `game_id` | 遊戲篩選 |
| `game_type` | slots、crash、table 等 |
| `agent_id` | GGAP 傳入的代理商脈絡篩選 |
| `member_id` | 需要查單一會員時使用，不代表 Provider 會員主檔 |
| `status` | Game Round 或遊戲狀態 |
| `sort` / `order` | 排序欄位與方向 |

## 5. Game Round 回應欄位草案

### 識別與 GGAP 脈絡

```json
{
  "round_id": "round-001",
  "external_round_id": "ggap-round-001",
  "provider_id": "provider-001",
  "game_id": "game-001",
  "game_name": "Example Slot",
  "game_type": "slots",
  "agent_id": "agent-001",
  "merchant_id": "merchant-001",
  "member_id": "member-001",
  "currency": "USDT"
}
```

### 金額、規則與時間

```json
{
  "bet_points": "100.00",
  "win_points": "80.00",
  "net_points": "-20.00",
  "bet_usdt": "1.00",
  "win_usdt": "0.80",
  "net_usdt": "-0.20",
  "conversion_rule_id": "rule-001",
  "started_at": null,
  "settled_at": "2026-08-04T10:00:00Z",
  "status": "settled"
}
```

金額建議以字串或 decimal 傳輸，避免 JavaScript 浮點誤差。點數與 USDT 必須保存當次使用的換算規則版本。

## 6. 報表指標契約草案

預設聚合維度：時間、代理商、遊戲。

| 指標 | 定義 |
|---|---|
| 投注筆數 | 符合條件且有效結算的 Game Round 數量 |
| 玩家人數 | `member_id` 不重複數 |
| 投注總額 | `bet_points` 加總；USDT 顯示 `bet_usdt` 加總 |
| 平均投注額 | 投注總額 ÷ 投注筆數 |
| 人均投注額 | 投注總額 ÷ 不重複玩家人數 |
| 輸贏 | 依正式定義計算 `win_points` 或淨輸贏 |
| GGR | 依 Provider 核准的正負方向定義 |

Provider 報表不回傳 GGAP 對帳狀態；對帳由財務或 GGAP 另行處理。報表匯出必須同時提供點數與 USDT 欄位。

## 7. 寫入一致性與錯誤處理

- Game Round 建立 / 結算必須接受冪等鍵，重試不得重複入帳。
- `external_round_id` 與 Provider `round_id` 的唯一性規則需確認。
- 失敗、取消、退款、回滾資料不可直接混入有效投注統計。
- API 錯誤至少需要 HTTP status、穩定 error code、可讀 message、request id。
- 分頁、排序與時間區間必須由後端驗證，避免查詢無上限。
- 修改遊戲狀態、規則、限紅與換算規則需留下 audit log。

## 8. 待後端確認清單

- 正式 base URL、版本策略與認證方式。
- Provider / GGAP 的簽章、回呼與重試規則。
- Game Round 狀態機與退款 / 回滾行為。
- 點數最小精度、USDT 匯率來源與換算四捨五入規則。
- `net_points`、GGR 的定義與正負方向。
- 代理商、商戶、會員欄位是否需要保存快照。
- 多人 Crash / 棋牌的共享局號與參與者欄位。
