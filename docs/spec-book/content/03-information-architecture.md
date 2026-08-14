# 資訊架構與頁面地圖

Provider Portal 的主要導覽包含九個工作群組、32 個可進入的內容頁，以及一個將 `/website` 導向 Banner 管理的入口 route。

## 導覽原則

- 主導覽只呈現遊戲商自身需要完成的工作。
- 舊代理商、商戶、會員、平台、錢包、交易、結算與 Jackpot route 可保留作遷移參考，但不得出現在 Provider 主選單。
- 已完成頁面保留內容原型；尚未完成頁面顯示責任清楚的 Placeholder。
- 導覽名稱、route、頁面責任、規格與 permission key 必須能互相追溯。

## 目前頁面成熟度

| 類型 | 數量 | 定義 |
|---|---:|---|
| 已有內容原型 | 24 | 已具備主要畫面內容；不代表正式 API 或權限完成 |
| Placeholder | 8 | 已有 route 與 mock blueprint，主要規格或內容待整理 |
| Redirect | 1 | `/website` 導向 `/website/banners`，不計入 32 個內容頁 |

## 完整頁面矩陣

<!-- GENERATED_PAGE_MATRIX -->

## 舊 route 邊界

`/aggregators/*`、`/agents/*`、`/merchants/*`、`/players/*`、`/orders/*`、`/transactions/*`、`/settlements/*`、`/risk/*`、`/jackpots/*`、`/agent/*` 與 `/merchant/*` 仍可能存在程式中，但不屬於新版主要導覽。
