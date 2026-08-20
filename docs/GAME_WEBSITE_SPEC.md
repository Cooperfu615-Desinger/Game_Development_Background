# Provider Portal 遊戲官網工作規格

> 版本：0.2.0
> 更新日期：2026-08-20
> 狀態：目前需求基準；已同步 Decision Pack 04，正式 API、permission key、Renderer 與 CDN 路徑待實作 Mapping

本文件定義 Provider Portal「遊戲官網」的內容維護與發布需求。產品語意以 `DP-04` 為準：編輯內容不會直接改變公開網站，只有成功完成的 Publish Job 可以切換 Published Snapshot。實際 Backend、Storage、Queue、Scheduler、CDN 與公開前台技術選型不在本文件預設。

## 1. 產品定位與責任邊界

遊戲官網是 Provider 自有的玩家資訊網站，本階段負責：

- 官網 Banner 的版位、四語文案、CTA、素材、排程與發布。
- 條款、隱私權政策、負責任遊戲及聯絡資訊的維護與發布。
- 指定 Revision 的驗證與精確預覽。
- Publish、Schedule、Disable、Restore 的工作與結果追溯。

本模組不建立完整 CMS、全站版型編輯、SEO、公告、活動或網站分析；也不管理 GGAP、代理商、商戶、會員、錢包或遊戲版本。官網內容與遊戲大廳共用發布引擎，但各自擁有獨立 Revision、Job、Snapshot 與失敗歷程。

## 2. 導覽與路由

| 頁面 | 前端路由 | 責任 |
|---|---|---|
| Banner 管理 | `/website/banners` | 管理 Banner Entry、Revision、驗證、預覽與發布工作 |
| 內容管理 | `/website/content` | 管理法務、責任遊戲與聯絡資訊 |
| 發布紀錄 | `/website/releases` | 查詢官網 Job、Snapshot、Publication Event 與錯誤 |

`/website` 可作相容入口並導向 Banner 管理。官網發布紀錄不混入 Lobby、DP03 遊戲版本或 GGAP 上架紀錄。

## 3. 發布物件

| 物件 | 責任 | 主要識別 |
|---|---|---|
| Content Entry | 穩定的 Banner 或官網內容主體 | `content_entry_id` |
| Content Revision | 一次完整儲存形成的不可變內容快照 | `revision_id` |
| Published Snapshot | 目前真正公開的確切內容 | `snapshot_id` |
| Publish Job | Publish、Disable 或 Restore 的一次執行 | `publish_job_id` |
| Preview Manifest | 固定 Revision、語系、素材、裝置與解析結果 | `preview_manifest_id` |
| Publication Event | Append-only 的操作、執行、失敗與補償證據 | `publication_event_id` |

每次成功儲存建立新的 Revision，不原地覆寫既有 Revision。Revision、Publish Job、Public 與 Delivery 必須各自保存狀態，不得以單一 `status` 混用。

## 4. 獨立發布流與 Publication Scope

官網包含兩條互不連動的發布流：

1. Website Banner：單一 Banner Entry 或版位為 publication scope。
2. Website Static Content：單一條款、隱私權、負責任遊戲或聯絡資訊區塊為 scope。

同一 scope 同時只有一個有效 Published Snapshot，且最多一筆尚未完成的 state-changing Job；不同 scope 可平行執行。第一版不提供官網與大廳整站原子發布。

## 5. Banner 管理

Banner Revision 至少包含：

| 欄位 | 說明 |
|---|---|
| 內部名稱與 Entry ID | Provider 內部辨識與追溯 |
| 版位與排序 | 顯示位置、同版位順序及衝突檢查 |
| 生效區間 | 開始／結束時間、時區與有效窗口 |
| CTA | 類型、顯示文字、內部路由或允許的 HTTPS 網域 |
| 四語文案 | 眉標、標題、簡述、按鈕文字 |
| 裝置素材 | Desktop／Mobile 的確切 `asset_version_id` |
| Revision 證據 | base revision、驗證、預覽、核准與操作者 |

Banner 頁提供查詢、選取、編輯 local buffer、儲存新 Revision、驗證、預覽、立即／排程發布、停用與還原入口。素材 binary 由 DP03 管理；DP04 只引用不可變版本，不得引用 `latest`。

## 6. 內容管理

| 內容類型 | 輸入形式 | 語系政策 | 風險通道 |
|---|---|---|---|
| 使用條款 | 受限富文字 | `STRICT` | 高風險第二人核准 |
| 隱私權政策 | 受限富文字 | `STRICT` | 高風險第二人核准 |
| 負責任遊戲 | 受限富文字 | `STRICT` | 高風險第二人核准 |
| 聯絡資訊 | 結構化欄位 | 欄位依 `STRICT`／`FALLBACK` | 一般；新增外部網域時為高風險 |

富文字必須通過後端 sanitize、允許標籤／連結／嵌入來源與 CSP 規則。內容區塊各自版本化、發布、停用與還原，不以整個官網作為單一可變草稿。

## 7. 語系與素材

第一版固定 `zh-TW`、`zh-CN`、`en`、`ja` 四語並原子發布，不提供語系個別發布。

| 政策 | 行為 |
|---|---|
| `STRICT` | 所有必要語系有效才可發布 |
| `FALLBACK` | 依固定鏈解析並在預覽與 Snapshot 保存來源 |
| `OPTIONAL_HIDE` | 缺少時只隱藏該非必要欄位 |

預設 fallback：`zh-TW` 無 fallback；`zh-CN → zh-TW`；`en → zh-TW`；`ja → en → zh-TW`。含文字圖片必須有 locale-specific 版本；沒有文字的共用素材可用 `und`。Published Snapshot 保存 requested／resolved locale、fallback chain、隱藏結果與確切素材 checksum。

## 8. 驗證與精確預覽

驗證分為 Edit-time、後端權威 Pre-publish 與 Job 執行前 Revalidation。結果分成 `BLOCKING`、`WARNING`、`INFO`；Blocking 不可略過，Warning 必須確認並保存原因。

官網共通檢查包含：

- schema、必填、四語與欄位語系政策。
- 素材存在、安全掃描、格式、尺寸、裝置、alt text 與 checksum。
- CTA、HTTPS、domain allowlist、redirect、富文字與嵌入安全。
- 版位、排序、排程時區與開始／結束時間。
- base revision、expected published revision、權限、核准與同 scope Job。

Preview Manifest 固定確切 Revision、每一區塊的 draft／public 來源、語系解析、素材版本、renderer version、validation result 與 manifest hash。允許組合預覽，但每個區塊必須標示來源；重新整理不得靜默切換 `latest`。Preview token 短效、具 scope、可撤銷、不得長期放在 URL，且不可被搜尋引擎或公開 CDN 索引。

## 9. 發布、排程、停用與還原

`job_type` 第一版包含 `publish`、`disable`、`restore`。

- 立即發布：驗證 → 必要核准 → scope lock → 產生 Snapshot → 傳播 → 原子切換 → Delivery 驗證。
- 排程發布：以 UTC 保存，介面顯示 `Asia/Taipei` 與時區；綁定 exact Revision，不追蹤 latest，執行前重驗動態依賴。
- 一般停用：具權限、填寫原因、通過必要核准並建立 Job。
- 緊急停用：只能減少公開範圍，可由專屬能力立即執行並進入事後覆核。
- 還原：將歷史 Snapshot 複製為新 Revision，重新比較、驗證、核准，再建立新 Job；不是原地回滾。
- 重試：建立新的 `publish_job_id` 並保存 `retry_of_job_id`。

任何切換前失敗都保持舊 Snapshot；換言之，發布失敗保持舊 Snapshot，不得留下半新半舊內容。切換後 Delivery 異常必須記錄補償結果，並以 `propagating`、`degraded` 或 `failed` 明確呈現。

## 10. 狀態

| 維度 | API 值 |
|---|---|
| Revision | `draft`、`ready`、`superseded`、`archived` |
| Publish Job | `queued`、`scheduled`、`running`、`succeeded`、`failed`、`cancelled` |
| Public | `unpublished`、`published`、`disabled` |
| Delivery | `propagating`、`healthy`、`degraded`、`failed` |

列表及詳情必須顯示對應維度，不得把「草稿」「已發布」「傳播失敗」放入同一狀態欄位。

## 11. 權限、核准與併發

產品先定義 Content Read、Edit、Preview、Submit、Publish、Disable／Restore、High-risk Approve、Emergency Disable、Publication Audit Read 等 capability；角色名稱與 permission key 待系統設定 Mapping。

- 一般 Banner、既有網域 CTA 與低風險內容可由一位具發布能力者完成。
- 法務、新外部網域、重要警語、主要 CTA／素材等高風險內容要求不同一人的第二人核准。
- 核准綁定 Revision、Manifest、Validation、Scope 與 expected published revision；任一證據改變即失效。
- 儲存使用 base revision／ETag；公開切換使用 expected published revision。同 scope 衝突不得盲目覆蓋。
- `allowed_actions` 只提供 UI 呈現；後端仍須逐次授權。

## 12. 發布紀錄

官網發布紀錄可依時間、內容類型、scope、Job 狀態、操作者與 ID 查詢，並顯示：

- Publish Job、來源 Revision、目標／目前 Snapshot。
- Job 類型、狀態、有效時間、建立者、核准者與原因。
- Validation、Warning 確認、Event timeline 與 Delivery 狀態。
- 失敗階段、error code、activation 是否發生、補償、retry／restore 關聯與 trace ID。

Publication Event 與 Audit 為 append-only；內容停用、還原或封存不得刪除歷史。

## 13. 替代狀態與錯誤

三頁至少支援 Loading、Empty、Query Failed、Partial／Stale、Forbidden、Revision Missing、Validation Failed、Revision／Publication Conflict、Approval Required／Expired、Job Queued／Scheduled／Running／Failed，以及 Delivery Propagating／Degraded／Failed。

`Forbidden`、`Revision Conflict`、`Publication Conflict`、`Approval Required`、`Job In Progress`、`Validation Failed` 與 `Dependency Changed` 必須提供不同說明、下一步及 `trace_id`，不可統一顯示「操作失敗」。

## 14. 資料與事件語意

正式後端至少需提供 Entry／Revision 查詢與建立、Validation、Preview Manifest／Token、Submit／Approve／Reject、Publish／Disable／Restore Job、取消排程、Job Timeline、Published Snapshot 與 Allowed Actions。狀態變更請求需包含 base／expected revision、request ID、idempotency key、actor、reason與必要證據。

最低事件包含 `content_revision_created`、`content_validation_completed`、`content_submitted`、`content_approved`、`content_rejected`、`publish_job_created`、`publish_job_started`、`published_snapshot_activated`、`publish_job_failed`、`publish_compensated`、`content_disabled`、`content_restored` 與 Delivery degraded／recovered。通知中心可消費事件，但不影響發布是否成功。

## 15. 非本模組範圍

- 公告、活動、全站版型、導覽、Footer、SEO 與網站分析。
- Banner 曝光、點擊、轉換與廣告競價。
- DP03 Game／Version／Artifact／Release 編輯。
- GGAP 代理商開關、Launch Gate、錢包、會員與平台結算。
- 通知中心的管道、偏好、已讀與保存介面。
- 角色名稱、正式 permission key、API URL、資料表、Queue、CDN 與 Renderer 技術選型。

## 16. 實作 Mapping 待補

下列項目不影響本文件產品需求成立，取得 Backend／Infrastructure 證據後補對照：

- API path／method、request／response schema、transport error 與正式 enum。
- Content／Revision／Job／Snapshot／Audit 的資料表、索引與保存政策。
- Scheduler、Worker、Queue、Outbox、Lock、冪等與補償設計。
- Object Storage、CDN、cache invalidation、公開前台 Renderer 與原子切換方式。
- Capability 對應角色與 permission key，以及正式 audit／trace／metric 格式。

---
