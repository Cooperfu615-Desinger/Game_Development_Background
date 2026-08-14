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

## 第一階段製作範圍（已凍結）

| 製作範圍 | 數量 | 頁面／模組 |
|---|---:|---|
| Baseline | 1 | 遊戲紀錄 |
| Active | 20 | 儀表板 1、遊戲管理 6、遊戲商財務 2、遊戲監控與風控 3、官方網站與遊戲大廳 8 |
| Deferred | 11 | GGAP 對接 5、通知中心 2、系統設定 4 |
| Blocked | 0 | 無 |

本輪共處理 21 頁，包含 1 頁 Baseline 與 20 頁 Active。Deferred 頁面只保留 route、程式追溯、延後原因、重新啟動所需輸入及「不可作為開發依據」聲明，不製作頁面畫面示意、欄位、互動、API、權限、狀態模型或驗收草案。

### 延後模組

- **GGAP 對接**：等待取得並整合 GGAP 現行正式規格。
- **通知中心**：通知類型、生命週期、偏好及權限仍待產品定義。
- **系統設定**：Provider 使用者、角色、權限、憑證與操作稽核模型仍待完成。

### 環境與發布的本輪邊界

「環境與發布」仍列為 Active，但本輪只整理 Provider 自有責任：Production／DEMO 環境、遊戲全域上架／下架、版本與素材發布、發布前驗證，以及發布狀態／歷程。GGAP 同步、各代理商個別開放、跨系統重試與正式整合契約只標示責任邊界與依賴，等待 GGAP 規格後補充，不得自行推定。

## 第二階段製作進度

Batch A 已完成三頁完整 Draft：

- 遊戲紀錄：維護既有 Baseline，補齊兩個財務頁的資料來源、deep link 與集中 TBD 對照。
- 財務總覽：完成查詢、八張摘要卡、財務／活動趨勢、遊戲排行、匯出、狀態、API 責任與驗收規格。
- 代理商 × 遊戲彙總：完成查詢、六張摘要卡、11 欄彙總、排序分頁、Game Round 導流、自訂匯出、狀態、API 責任與驗收規格。

Batch B 已完成四頁完整 Draft：

- 儀表板：完成即時狀態、Production 營運摘要、趨勢、待處理工作、遊戲概況與通知 Deferred 邊界。
- 監控總覽：完成五張指標卡、目前狀態／分析窗口、11 欄遊戲列表、大型詳情與精確導流。
- 風控報表：完成 Risk Event 滾動時間、五張摘要、待關注排序、15 欄列表、詳情與完整結果匯出。
- 風控告警／處理：完成 Alert 五張工作卡、16 欄佇列、大型詳情、操作前置條件、隔離 Guardrail 與 audit 骨架。

Batch C 已完成遊戲管理六頁完整 Draft：

- 遊戲列表：三環境摘要、八類篩選、14 欄寬表、RTP Tips、詳情與導流。
- 環境與發布：目標環境矩陣、發布組合、佇列、preflight、高風險操作及歷程；程式仍為 Placeholder。
- 遊戲設定：維護／限紅模板、Provider 點數、基礎 enum、草稿、審核與版本 snapshot。
- 數值設定：理論數值與 RTP 監控分離、模擬／驗證／審核及發布參照。
- 遊戲版本：artifact、相容性、lineage、組合參照及建立新 release job 的回復模型。
- 遊戲素材：不可變素材版本、安全預覽、檔案驗證／掃描、審核與引用。

Batch A–C 頁面仍是 Draft；正式公式、門檻、decimal 精度、狀態生命週期、API schema、權限與外部契約仍依集中 TBD 管理。其餘 Batch D 頁面維持 Active／Outline，等待後續整理。

## 完整頁面矩陣

<!-- GENERATED_PAGE_MATRIX -->

## 舊 route 邊界

`/aggregators/*`、`/agents/*`、`/merchants/*`、`/players/*`、`/orders/*`、`/transactions/*`、`/settlements/*`、`/risk/*`、`/jackpots/*`、`/agent/*` 與 `/merchant/*` 仍可能存在程式中，但不屬於新版主要導覽。
