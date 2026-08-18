# API 與整合契約

本章是 Provider Portal API 的共通骨架。正式 base URL、版本、錯誤碼、分頁格式與認證方式仍需由後端及 GGAP 對接團隊核准。

## 共通原則

- 所有 Provider 查詢由後端強制套用 `provider_id`。
- 前端權限只控制 UX，不可取代後端授權。
- 金額以 decimal string 傳輸。
- 時間使用含時區的標準格式。
- List API 支援明確分頁、排序、篩選及穩定 tie-breaker。
- 重要寫入操作必須具備 Request ID、冪等、併發保護與 audit log。

## 建議回應骨架

```json
{
  "data": [],
  "meta": {
    "request_id": "req_...",
    "generated_at": "2026-08-13T12:00:00+08:00",
    "timezone": "Asia/Taipei",
    "page": 1,
    "page_size": 20,
    "total": 0
  },
  "errors": []
}
```

> 此格式是規格書結構示例，尚未標記為 Confirmed。

## 錯誤要求

錯誤至少需要穩定 `error_code`、可讀訊息、`request_id`、HTTP status，以及是否可重試的語意。欄位驗證錯誤需能定位到具體參數。

## GGAP 對接

GGAP 對接需另行核准簽章、防重放、啟動、結算、Callback、ACK、有限重試與補送契約。`provider_event_id` 用於通知重送去重，不能取代 `risk_event_id`。

## 遊戲版本與發布 API

- Game、Version、Artifact、Release 與 Active Release 必須使用不同 ID 與 schema；不得以一個 `status` 或一筆可變紀錄同時表示內容成熟度、部署結果及目前生效版本。
- Artifact API 至少回傳 `build_id`、manifest、checksum、來源 commit、建置時間與驗證結果；Artifact 建立後不可覆寫。
- Release 寫入至少帶 `release_id`、目標環境、Version／Build、風險通道、排程、回滾目標、idempotency key 與 optimistic concurrency version。
- 一般 Release 自動檢查通過後允許發布管理者一人執行；高風險 Release 必須回傳 approval requirement 與第二位核准者證據。
- 發布、重試、取消與回滾均回傳可持續查詢的 job／Release ID；重新整理頁面後可由 ID 恢復狀態，不依賴前端計時器維持真實結果。
- 上架事件等待 GGAP ACK 後才成為外部可用；停用事件先由 Provider 本地阻擋並以 outbox／等價可靠投遞重試。實際 event name、payload 與 ACK 格式待 Backend Git Mapping。
