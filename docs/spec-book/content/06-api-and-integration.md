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
