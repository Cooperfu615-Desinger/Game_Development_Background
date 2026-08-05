# 通知中心規格

> 版本：0.1.0
> 更新日期：2026-08-04
> 狀態：工作規格，已確認需要通知中心

## 1. 目的

通知中心讓 Provider 團隊知道遊戲、GGAP 對接、Game Round、財務報表與系統安全的重要狀態。它是營運通知工具，不是 Provider 活動或行銷模組。

## 2. 通知範圍

| 類型 | 範例 | 優先級 |
|---|---|---|
| 遊戲管理 | 遊戲上架成功、下架完成、版本同步失敗 | 中 / 高 |
| GGAP 對接 | 連線中斷、目錄同步失敗、啟動請求錯誤、回呼失敗 | 高 |
| Game Round | 結算失敗、重複請求、回滾、異常延遲 | 高 |
| 財務與報表 | 匯出完成、資料品質異常、報表產檔失敗 | 中 / 高 |
| 監控與風控 | 異常投注、RTP / 遊戲健康指標異常 | 中 / 高 |
| 系統與安全 | API key 異動、登入異常、權限異動 | 高 |
| 官網管理 | 內容發布成功或失敗 | 低 / 中 |

以下不屬於目前通知中心：Provider 活動推播、會員行銷、代理商促銷。

## 3. 通知資料

| 欄位 | 說明 |
|---|---|
| `notification_id` | 唯一識別 |
| `type` | 通知類型 |
| `severity` | `info`、`success`、`warning`、`error`、`critical` |
| `title` | 短標題 |
| `message` | 摘要訊息 |
| `created_at` | 建立時間 |
| `read_at` | 已讀時間，可為空 |
| `actor_scope` | Provider、角色或指定使用者 |
| `resource_type` / `resource_id` | 可選，對應遊戲、Game Round、報表或對接事件 |
| `action_url` | 可選，導向處理頁 |
| `dedupe_key` | 防止同一事件重複通知 |
| `expires_at` | 可選，過期時間 |

## 4. 顯示與互動

### Topbar

- 顯示未讀數量。
- 點擊通知鈴鐺開啟最近通知。
- 高優先級通知可顯示明確顏色與狀態。
- 不以彈窗阻斷一般工作流程。

### 通知中心頁

- 依全部 / 未讀篩選。
- 依類型與優先級篩選。
- 支援分頁與時間排序。
- 點擊通知可進入對應的遊戲、Game Round、報表或對接狀態頁。
- 支援單筆已讀與全部標示已讀。

## 5. 觸發規則

- 同一 `dedupe_key` 在抑制時間內不重複建立通知。
- `critical` 與 `error` 預設不自動消失，直到使用者讀取。
- 報表匯出完成通知需包含檔案有效期限或下載狀態。
- 對接連線異常需在恢復時產生恢復通知，避免只留下失敗訊息。
- 通知建立與狀態變更需留下 audit log。

## 6. 通知偏好

第一階段先支援站內通知。後續可增加：

- 類型開關
- 嚴重度門檻
- 指定角色接收
- Email / webhook 等外部通道

外部通知通道需另立安全、重試與敏感資料遮罩規格。

## 7. 建議 API 草案

| method | path | 用途 |
|---|---|---|
| GET | `/api/provider/v1/notifications` | 通知列表 |
| GET | `/api/provider/v1/notifications/unread-count` | 未讀數量 |
| PATCH | `/api/provider/v1/notifications/:id/read` | 單筆已讀 |
| POST | `/api/provider/v1/notifications/read-all` | 全部已讀 |
| GET | `/api/provider/v1/notification-preferences` | 通知偏好 |
| PATCH | `/api/provider/v1/notification-preferences` | 更新通知偏好 |

路徑與回應格式仍需後端確認。

## 8. 權限與安全

- 使用者只能看到所屬 Provider 且有權限的通知。
- 通知內容不可直接暴露 API secret、完整會員敏感資料或簽章。
- 導向頁面仍需重新做權限檢查，不能只依賴通知中的 `action_url`。
- 系統級通知需記錄建立來源與操作者 / service identity。

## 9. 驗收方向

- Topbar 可顯示未讀數量。
- 通知中心可查詢、篩選、分頁與標示已讀。
- GGAP 對接失敗、Game Round 異常與報表匯出完成至少各有一種通知。
- 重複事件不產生無限重複通知。
- 使用者無法看到其他 Provider 的通知。
