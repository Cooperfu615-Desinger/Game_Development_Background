# Provider Portal 遊戲大廳工作規格

> 版本：0.2.0
> 更新日期：2026-08-20
> 狀態：目前需求基準；已同步 Decision Pack 03／04，正式 API、permission key、Renderer 與 GGAP Launch Mapping 待補

本文件定義 Provider 自有玩家遊戲大廳的內容、Catalog、預覽與 DEMO telemetry。Decision Pack 03 管理遊戲技術可用性，Decision Pack 04（DP04）管理大廳公開內容，GGAP 管理代理商 Launch Gate；三者不得合併為單一狀態。

## 1. 產品定位與責任邊界

大廳模組負責：

- 單款遊戲公開名稱、介紹、標籤、CTA 與素材的 Content Revision。
- 跨遊戲收錄、排序、分組與置頂的 Catalog Revision。
- 驗證、精確預覽、發布、排程、停用、還原與歷程。
- 已公開 Catalog 的總覽與玩家可見清單。
- 隔離的 DEMO readiness 與 telemetry。

本模組不建立 Game／Version／Artifact／Release，不管理 GGAP 平台、代理商、會員、錢包或結算。DEMO identity、credit 與技術工作階段不形成 Provider 會員、錢包或正式 Game Session，也不得進入 Production Game Round、財務或 Provider 風控。

## 2. 導覽與路由

| 頁面 | 路由 | 責任 |
|---|---|---|
| 大廳總覽 | `/lobby` | 唯讀查看 Published Catalog、內容、readiness 與 Delivery 摘要 |
| 遊戲清單 | `/lobby/games` | 查詢 Published Catalog 內的公開遊戲結果 |
| 遊戲管理 | `/lobby/management` | 編輯 Game Content／Catalog Revision 與執行發布流程 |
| DEMO 環境數據 | `/lobby/demo` | 查詢 Sandbox readiness、telemetry 與資料品質 |
| 大廳預覽 | `/lobby/preview` | 依 exact Preview Manifest 檢查玩家端成果 |

舊版 `/games/*` 只保留相容或遷移用途，不代表新版功能入口。

## 3. 三層公開控制

| 控制層 | 責任 | 結果 |
|---|---|---|
| DP03 技術可用性 | Provider Game／Release | `available`、`maintenance`、`suspended`、`retired` 等 runtime 狀態 |
| DP04 內容可見性 | Lobby Game Content／Catalog | 顯示何種內容、是否收錄、排序、coming soon／playable 語意 |
| GGAP Launch Gate | GGAP | 特定代理商最終是否可啟動遊戲 |

玩家可玩條件為：DP03 允許新 Launch、DP04 Published Snapshot 顯示 playable 且遊戲存在於 Published Catalog，最後再通過 GGAP Gate。DP04 不得繞過另外兩層。

## 4. 公開結果矩陣

| 組合 | 玩家結果 |
|---|---|
| DP03 `available`＋DP04 published playable | 顯示 Launch；啟動時仍驗證 GGAP Gate |
| DP03 `maintenance`＋DP04 published | 內容可見，runtime overlay 顯示維護並停用 CTA |
| DP03 `suspended`＋DP04 published | 不可 Launch，依安全政策顯示不可用或隱藏 |
| DP04 published coming soon＋尚不可用 | 顯示即將推出，不可 Launch |
| DP03 `retired`＋DP04 published | 不可 Launch，建立停用／Catalog 移除工作提示 |
| DP04 `disabled` 或未被 Catalog 收錄 | 不公開該 scope |

「即將推出」是內容呈現模式；「維護／暫停／退役」是 DP03 runtime safety overlay。遊戲不一定顯示於大廳，是否收錄由 Published Catalog 決定。

## 5. 兩條獨立發布流

1. Lobby Game Content：每款遊戲的四語名稱、介紹、標籤、CTA、公開參數與素材。
2. Lobby Catalog：跨遊戲的收錄、排序、分組、置頂，以及每個項目採用的確切 Game Content Revision。

兩條流共用 Content Entry、Revision、Validation、Preview Manifest、Publish Job、Published Snapshot 與 Publication Event，但分開版本化與發布。單款內容更新不自動重排 Catalog；Catalog 發布也不原地修改單款內容。Catalog Snapshot 不得在讀取時追蹤 `latest`。

## 6. 大廳總覽

總覽是唯讀營運入口，摘要來源為目前 Published Catalog／Game Content Snapshot、DP03 runtime overlay、Delivery 與 DEMO telemetry。至少呈現：

- 公開 Catalog 遊戲數、playable／coming soon／maintenance／unavailable 衍生結果。
- Delivery healthy／propagating／degraded／failed 摘要。
- 需處理的內容、素材撤銷、依賴變動與發布工作。
- DEMO 活躍與品質摘要，清楚標示 Sandbox／Mock 與資料更新時間。
- 導向遊戲管理、Catalog、DEMO 數據及大廳預覽的精確入口。

總覽不得直接編輯、核准或發布，也不得用摘要卡建立另一套狀態真實來源。

## 7. 大廳遊戲清單

遊戲清單只呈現 Published Catalog 的玩家公開投影，不等同 DP03 Game Master。主要欄位包括遊戲、類型、公開版本／內容版本、Catalog 位置、玩家顯示狀態、DP03 runtime overlay、Delivery、更新時間與詳情／預覽入口。

支援名稱、代碼、類型、顯示狀態與 Delivery 篩選；排序與分頁以正式後端結果為準。未被 Published Catalog 收錄的 Game、草稿 Content Revision 與未成功發布的 Catalog 不得出現在此清單。

## 8. 遊戲管理

### 8.1 Lobby Game Content

| 區塊 | 內容 |
|---|---|
| 參照資料 | `game_id`、exact DP03 Version／Asset reference；唯讀，不複製主資料 |
| 公開參數 | RTP、波動度、最高倍率等經核准可公開摘要 |
| 四語內容 | 名稱、簡述、玩法、標籤、CTA 與替代文字 |
| 素材 | 卡片、詳情、Desktop／Mobile、locale 與影片參照 |
| 顯示語意 | coming soon／playable、可見性與安全替代文案 |
| 發布證據 | Revision、Validation、Preview、Approval、Job、Snapshot |

圖片與媒體只引用 DP03 不可變 `asset_version_id`；YouTube 或外部影片必須通過 HTTPS、domain allowlist、嵌入與 CSP 規則。

### 8.2 Lobby Catalog

Catalog Revision 保存完整收錄集合、排序、分組、置頂、每個項目的 exact Game Content Revision 與依賴快照。Catalog 使用整份 Revision 作 optimistic lock，不由伺服器盲目合併兩位操作者的排序。

## 9. 語系、素材與驗證

第一版固定 `zh-TW`、`zh-CN`、`en`、`ja` 四語原子發布。欄位依 `STRICT`、`FALLBACK`、`OPTIONAL_HIDE` 處理，預設鏈為 `zh-CN → zh-TW`、`en → zh-TW`、`ja → en → zh-TW`。Snapshot 保存實際 resolved locale、隱藏結果與 exact asset version。

驗證至少包含：

- Game／Version／Asset reference 存在、相容、安全且未撤銷。
- 四語、fallback、素材尺寸／裝置／alt text、URL／CSP。
- coming soon／playable 語意與 DP03 狀態不衝突。
- Catalog 收錄完整性、重複、排序、孤立項目與 exact content revision。
- base revision、expected published revision、權限、核准與同 scope active Job。

Blocking 不可略過；Warning 需確認並記錄理由。發布與排程執行前必須重驗會變動的 DP03 狀態、素材撤銷、核准與 concurrency。

## 10. 精確大廳預覽

Preview Manifest 固定：Catalog Revision、每款 Game Content Revision、各區塊 draft／public 來源、四語解析、裝置、exact Asset、DP03 dependency snapshot、renderer version、validation result 與 hash。

- 支援 Desktop／Mobile 與四語視角。
- 可組合 draft 與 public，但每個區塊必須標示來源。
- 重新整理、切換語系或裝置不得自動改用 latest。
- 預覽只讀，不提供編輯、核准或發布。
- Preview token 短效、可撤銷、具 scope，不得置於可分享 URL 或公開 CDN。
- DEMO Launch 僅能進 Sandbox；GGAP Gate 尚未可用時顯示明確阻擋狀態。

## 11. 發布、停用與還原

Publish、Disable、Restore 都建立獨立 Job。立即與排程發布綁定 exact Revision、expected published revision、Validation、Approval 與 idempotency key。同一 publication scope 只允許一筆未完成的 state-changing Job。

切換前失敗保留舊 Snapshot；切換後 Delivery 驗證失敗執行補償並記錄 `degraded`／`failed`。Restore 由歷史 Snapshot 建立新 Revision，重新驗證與發布，不改寫歷史。Emergency Disable 只能減少公開範圍，需專屬能力、原因與事後覆核。

## 12. DEMO 環境數據

DEMO 頁只提供 Sandbox readiness、telemetry 與資料品質，不參與 DP04 發布事實：

- 指標可包含活躍測試 identity、技術工作階段、試玩事件、展示 credit、遊玩時間與錯誤率。
- 額度為 Sandbox credit／Provider Demo Points，不是 USD、USDT、Provider 正式點數或錢包餘額。
- DEMO 指標良好不自動發布；不佳只形成 Validation Warning、readiness 或工作脈絡，不修改 Revision。
- Demo 技術工作階段不得命名或建模為正式業務 Game Session。
- DEMO／Test 不進入 Production Game Round、財務、正式報表或 Provider 風控。

正式 identity 生成、credit、技術工作階段、資料保留與 telemetry 公式待 Backend Mapping，但不改變上述隔離邊界。

## 13. 狀態與權限

Revision：`draft`、`ready`、`superseded`、`archived`；Job：`queued`、`scheduled`、`running`、`succeeded`、`failed`、`cancelled`；Public：`unpublished`、`published`、`disabled`；Delivery：`propagating`、`healthy`、`degraded`、`failed`。

Capability 包含 Read、Edit、Preview、Submit、Publish、Disable／Restore、High-risk Approve、Emergency Disable 與 Audit Read。一般文案與小範圍排序可走一人快速通道；playable 語意、大量 Catalog、新外部網域、重要素材或安全 Warning 要求第二人核准。`allowed_actions` 不取代後端逐次授權。

## 14. 替代狀態與 Deep Link

所有頁面涵蓋 Loading、Empty、Query Failed、Partial／Stale、Forbidden、Revision Missing、Dependency Unavailable、Validation Failed、Revision／Publication Conflict、Approval Required／Expired、Job In Progress／Failed 及 Delivery Propagating／Degraded／Failed。

允許以 `content_entry_id`、`revision_id`、`publish_job_id`、`game_id`、`catalog_revision_id`、`mode`、`locale`、`device` 導流並重載；Preview token 與秘密資料不得進 URL。目標不存在或無權限時顯示明確狀態，不可靜默改看目前公開版本。

## 15. 非本模組範圍

- DP03 Game／Version／Artifact／Release、數值與素材 binary 管理。
- GGAP 代理商個別開關、Launch API、會員、錢包、平台結算與對帳。
- 官網 Banner、法務內容、公告、活動與完整 CMS。
- Production Game Round、財務、Provider 風控或正式 Session。
- 正式 API URL、資料表、Queue、CDN、Renderer、permission key 與通知介面。

## 16. 實作 Mapping 待補

產品需求以本文件與 DP03／DP04 成立；取得後端與 GGAP 證據後補：

- Entry／Revision／Catalog／Job／Snapshot／Event 的 API、schema、enum、資料表與索引。
- DP03 Game／Version／Asset／global state 的實際欄位與事件。
- Scheduler、Queue、Lock、冪等、原子切換、補償、CDN 與公開 Renderer。
- Capability 與 permission key、Audit／Trace／Metrics／Log 保存政策。
- GGAP Launch Gate request／response／error Mapping；只影響最後可玩性，不改變 DP04 內容生命週期。

---
