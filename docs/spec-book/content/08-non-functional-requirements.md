# 非功能性需求

## 效能與資料量

- 大型列表使用後端分頁、排序與篩選。
- 匯出上限與同步／非同步門檻需由後端契約確認。
- 儀表板、監控與告警的更新頻率必須考量後端負載及資料新鮮度。

## 可用性與韌性

- 部分來源失敗時，保留成功來源並清楚標記受影響區塊。
- 自動緩解、告警與 GGAP 通知不得依賴使用者開啟前端頁面。
- 寫入操作需防止重複送出及併發覆蓋。
- 同一 Game × Environment 同時只能執行一筆會改變 Active Release 的工作；切換前失敗維持舊版本，切換後硬性驗證失敗使用預先指定 Artifact 回滾。
- 每次 Production Release 必須有安全回滾目標；若無安全回滾，Release Plan 必須標示並準備停止新 Launch 與 Forward Fix。
- Provider 維護、暫停與隔離不依賴 GGAP ACK 才生效；外部通知需使用 outbox／等價可靠投遞、冪等與可觀測重試。
- 發布流程需具自動預檢、健康與 Launch 驗證、原子切換 Active Release、觀察窗口與 traceability。
- 同一 DP04 publication scope 同時只能有一筆未完成的 state-changing Job；不同 scope 可以平行發布。
- 內容 Publish、Disable 與 Restore 必須綁定 exact Revision、expected published revision 與 idempotency key；切換前失敗保留舊 Published Snapshot。
- 排程 Job 不追蹤 latest，執行前重新驗證權限、核准、素材撤銷、DP03 依賴與 concurrency。
- Snapshot 切換需為原子操作或提供等價保證；Delivery 驗證失敗要記錄補償，無法安全回復時明確標示 `degraded`／`failed`。
- Preview Manifest、Published Snapshot 與歷史預覽必須固定 renderer、語系解析、exact Asset Version 與 checksum，避免內容漂移。

## 響應式與無障礙

- 依頁面內容採 1500px 寬版或主內容完整寬度。
- 寬表格在自身容器水平捲動，不造成整個 document 溢出。
- 主要操作支援鍵盤，圖示按鈕具有可讀標籤。
- 狀態不得只依賴顏色表達。

## 瀏覽器與裝置

正式支援範圍尚待確認。原型至少驗證目前主流桌機瀏覽器與窄版 viewport，不將手機版縮放視為響應式完成。

## 資料保存

Game Round、Risk Event、Alert、Release、Artifact manifest、Content Revision、Published Snapshot、Publish Job、Publication Event、請求紀錄、通知、匯出檔案與 audit 的保存期限、查詢期限及歸檔策略仍待後端與法遵需求確認。已公開 Content Revision／Snapshot／Job／Event 不得 hard delete。舊 Artifact 至少保留到「Launch Token 最長有效期＋Round 最長合理生命週期＋Callback／重試期間＋安全緩衝」結束。
