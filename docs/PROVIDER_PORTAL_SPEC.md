# Provider Portal 產品與功能規格

> 版本：0.8.0
> 更新日期：2026-08-18
> 狀態：目前需求基準；已同步 Decision Pack 01、02、03，正式 API、權限與既有系統 Mapping 待確認

## 1. 產品定位

Provider Portal 是 GGAP 的其中一個 Provider Portal，服務對象是遊戲商團隊。它不是另一套聚合平台，也不是代理商、商戶或會員後台。

Provider Portal 的核心任務是：

1. 管理遊戲商自己的遊戲產品。
2. 接收 GGAP 傳來的遊戲請求與業務脈絡。
3. 保存可追蹤的 Game Round。
4. 產生遊戲商自己的數據、財務與監控報表。
5. 管理遊戲官網、遊戲大廳內容與 Provider 內部設定。

## 2. 使用者與責任

### 2.1 Provider 使用者

Provider Portal 只服務遊戲商內部人員。正式角色可再拆分為營運、財務、風控、技術與管理員，但資料範圍都以同一個 Provider 為邊界。

### 2.2 Provider 負責

- 遊戲主資料、遊戲類型、版本、資產與展示內容
- 遊戲規則、RTP、點數規則、換算規則與限紅
- 遊戲全域上架、下架、維護與版本管理
- 接收 GGAP 傳入的代理商、商戶、會員與幣別脈絡
- Game Round、遊戲商點數與 USDT 換算結果
- 遊戲數據、遊戲商財務、監控、風控與通知
- 遊戲商官網內容

### 2.3 GGAP 負責

- 聚合多家 Provider
- 代理商、商戶、會員、平台錢包與平台交易
- 代理商側的金額與幣別轉換
- 對已由 Provider 上架的遊戲，依代理商個別開啟或關閉
- GGAP 平台財務、結算、對帳與平台級風控

Provider Portal 不建立 Provider 錢包，也不把代理商、商戶或會員管理列為主要功能。

## 3. 功能範圍

| 模組 | Provider Portal 責任 | 目前原型狀態 |
|---|---|---|
| 總覽 | Provider 遊戲、投注、GGR、告警、發布、通知與 GGAP 連線健康 | 儀表板獨立前端 mock 原型已完成 |
| 遊戲管理 | 主資料、規則、數學、版本、資產、全域上下架 | 既有頁面原型；環境與發布為 Placeholder blueprint |
| 數據與報表 | 遊戲紀錄、Game Round 查詢與匯出 | `/reports` 遊戲紀錄原型已完成 |
| 遊戲商財務 | 點數、USDT、投注、輸贏、GGR、財務總覽與代理商 × 遊戲彙總 | 財務總覽與代理商 × 遊戲彙總原型已完成 |
| 遊戲監控與風控 | 遊戲健康、異常局、請求失敗與風控告警 | 監控總覽、風控報表與風控告警／處理的獨立前端 mock 原型已完成 |
| GGAP 對接 | 連線、同步、請求、結算與錯誤狀態 | Phase 3 mock blueprint |
| 通知中心 | 站內通知、已讀與通知偏好 | Phase 3 mock blueprint |
| 遊戲官網 | Banner、條款、隱私權、負責任遊戲、聯絡資訊與發布紀錄 | 已完成前端原型骨架，後續接正式內容、圖片、發布與權限 |
| 遊戲大廳 | 遊戲公開資料、三種玩家狀態、DEMO環境數據與完整大廳預覽 | 已完成五頁前端原型骨架，後續接正式遊戲、狀態、素材與 DEMO API |
| 系統設定 | Provider 使用者、角色、權限、API key、操作紀錄 | 保留 |

### 3.1 目前前端原型成果

- `/reports` 已建立 Provider Game Round 明細頁原型，支援查詢、排序、分頁、詳情與 CSV / XLSX 匯出。
- `/lobby`、`/lobby/games`、`/lobby/management`、`/lobby/demo`、`/lobby/preview` 已建立遊戲大廳五頁原型。
- `/website/banners`、`/website/content`、`/website/releases` 已建立遊戲官網三頁原型，`/website` 會導向 Banner 管理。
- `/monitoring` 已由 `MonitoringOverview.vue` 承接獨立 mock 原型，包含五張摘要卡、期間查詢、遊戲監控列表、詳情、失敗狀態與跨頁導向；`/monitoring/risk-reports` 與 `/monitoring/alerts` 也由獨立內容頁承接。
- `/dashboard` 已由 `Provider/Dashboard.vue` 承接獨立 mock 原型；`/games/environments`、`/ggap/*`、`/notifications/*` 仍使用共用 Provider Placeholder 頁面骨架。
- 目前主要導覽共有 32 個可進入的內容頁，其中 24 個已有完整內容原型，8 個使用 Provider Placeholder；完整頁面地圖見 [`PROVIDER_PORTAL_PAGE_MAP.md`](./PROVIDER_PORTAL_PAGE_MAP.md)。
- 上述頁面目前以原型展示資料呈現，不代表正式 API、權限、狀態碼、精度與後端資料契約已定稿。

## 4. 已確認的核心原則

### 4.1 Game Round

- Game Round 是主要業務紀錄單位。
- 不建立獨立的 Game Session 導覽或報表。
- 不建立獨立的 Game Round 財務明細頁；財務頁進入單筆資料時沿用「遊戲紀錄」頁面。
- 老虎機與目前單人 Crash Game 以單筆結算完成的 Game Round 為主。
- 棋牌可保留開始時間與結算時間。
- 未來多人玩法才增加共享局號與參與者關係。

### 4.2 金額

- GGAP 與 Provider 之間以 USDT 為主要標準幣別。
- Provider 點數是遊戲內計算單位，換算規則與限紅由 Provider 定義。
- Provider 報表以點數為主，USDT 作為換算檢視與匯出欄位。
- 每筆 Game Round 應保留當時的換算結果與換算規則版本。

### 4.3 報表

- 報表預設以 `settled_at` 統計。
- 主要維度是時間、代理商、遊戲。
- 主要指標包含投注筆數、玩家人數、投注總額、平均投注額、人均投注額、輸贏與 GGR。
- Provider Portal 不顯示 GGAP 對帳狀態；實際比對由財務或 GGAP 執行。

### 4.4 環境與版本啟用

遊戲版本與發布生命週期統一依 [`Decision Pack 03｜遊戲版本與發布生命週期`](./spec-book/content/appendices/decision-pack-03-game-release-lifecycle.md)。Game、Version、Artifact 與 Release Record 是四個不同物件；目前生效版本只由各環境的 Active Release 判定。

正式、DEMO 與測試環境必須分開管理，不使用單一 `environmentMode` 互相切換，資料、憑證、Game Round、統計與稽核永久隔離。

| 環境 | 使用方式 | Provider Portal 操作 |
|---|---|---|
| 正式環境 | GGAP 正式遊戲服務，可產生正式 Game Round | 只接受已在 DEMO 通過的同一 Artifact；可發布、回滾、維護、暫停及管理全域可用性 |
| 官網 DEMO | 可實際遊玩，但使用隔離的 DEMO / 沙盒資料 | 驗證正式候選 Artifact；可發布、回滾、維護與停止新 Launch |
| 測試環境 | 供前後端與測試團隊快速驗證 | 具權限編輯者可建立 Test Release、替換 build 與重跑驗證；不納入正式監控風控 |

版本與發布責任如下：

- Provider 擁有遊戲主資料、Version、Artifact 關聯、環境 Release、全域上下架及不可變歷程；工程與 DevOps 提供建置、部署與健康檢查能力。
- Test 可反覆驗證不同 build；Version 成為正式候選後綁定確切 Artifact，DEMO 通過後 Production 必須使用同一份 Artifact。
- 一般 Release 採自動檢查加一位發布管理者；RTP、金額、限額、契約、migration、安全或無安全回滾等高風險變更才要求第二人核准。
- Production 發布成功不等於全域上架；Game 的 `unpublished`、`available`、`maintenance`、`suspended`、`retired` 與 Release 狀態分開。
- 發布、回滾、下架、維護或隔離只改變新 Launch 與新 Round；既有 Game Round 依建立時固定的 Version、Build、Release、數值、倍率與限額完成。
- 每次重試與回滾建立新的 Release Record，不覆寫失敗或歷史紀錄；無安全回滾版本時停止新 Launch 並等待 Forward Fix。

DEMO 遊戲雖然可以實際遊玩，但其 Game Round、點數與資料必須與正式環境隔離，不應進入正式遊戲商財務或 GGAP 正式結算。

Provider 可使用短效 Launch Context 綁定遊戲、版本、Artifact、Release、環境與 GGAP 脈絡，但不建立長期 Game Session 主資料。Game Round 仍是唯一主要業務紀錄單位。

## 5. 不在目前範圍

- Provider 錢包與會員錢包
- 代理商、商戶、會員主資料管理
- GGAP 平台交易與平台結算
- GGAP 對帳匹配狀態管理
- 代理商逐一開關遊戲的控制台
- 獨立跨機台 Jackpot 管理
- Provider 專屬活動管理
- 遊戲官網公告與活動管理（暫不納入目前階段）

跨機台 Jackpot 與活動未來若有需求，需另立規格，不直接恢復舊版模組。

## 6. 目前原型驗收方向

- 使用者能以 Provider 身份登入並只看自己的資料。
- 可查看與管理遊戲主資料、全域上下架與維護狀態。
- 可查看 Game Round 明細與聚合報表。
- 報表同時支援點數顯示、USDT 展開與雙幣別匯出。
- 可查看 GGAP 對接狀態與錯誤通知。
- 可從通知中心查看、標示已讀並依權限處理通知。
- 可進入遊戲官網的 Banner、法務與聯絡資訊、發布與版本紀錄原型。
- 可進入遊戲大廳的總覽、遊戲清單、遊戲管理、DEMO環境數據與大廳預覽原型。
- 舊代理商、商戶、會員與 Jackpot 頁面不出現在新版主要導覽。

## 7. 目前頁面原型原則

- 已完成的遊戲列表、遊戲紀錄、財務總覽、代理商 × 遊戲彙總、遊戲官網與遊戲大廳頁面保留既有內容。
- 尚未具備正式內容的頁面先以共用 Provider Placeholder 呈現：頁面標題、功能說明、責任範圍、Prototype / Mock data 標示、預計內容區塊、展示資料、空資料狀態與 API 待接說明；風控報表與風控告警／處理已不再使用 Placeholder。
- Placeholder 說明區塊依頁面成熟度使用；已完成主要內容規劃的頁面應直接從摘要卡、查詢、列表、圖表或操作內容開始，不重複顯示說明 Hero、頁面資訊與 blueprint。
- 各頁外層寬度、1500px 寬版頁與無固定最大寬度頁的規則，統一依 [`PROVIDER_PORTAL_UI_LAYOUT_SPEC.md`](./PROVIDER_PORTAL_UI_LAYOUT_SPEC.md) 執行。
- Prototype / Mock data 只用於確認資訊架構與欄位方向，不代表正式數字、狀態、權限或資料流。
- 儀表板內容與資料時間語意依 [`PROVIDER_DASHBOARD_SPEC.md`](./PROVIDER_DASHBOARD_SPEC.md)；Provider 風控事件定義、自動緩解與隔離統一依 [`PROVIDER_RISK_CONTROL_SPEC.md`](./PROVIDER_RISK_CONTROL_SPEC.md)；監控與風控頁面內容依 [`PROVIDER_MONITORING_OVERVIEW_SPEC.md`](./PROVIDER_MONITORING_OVERVIEW_SPEC.md)、[`PROVIDER_RISK_REPORT_SPEC.md`](./PROVIDER_RISK_REPORT_SPEC.md) 與 [`PROVIDER_RISK_ALERT_HANDLING_SPEC.md`](./PROVIDER_RISK_ALERT_HANDLING_SPEC.md) 執行。
- 不在 Placeholder 階段新增平台錢包、商戶、會員、代理商管理、平台結算、平台對帳或活動功能。
- 「DEMO環境數據」使用隔離 DEMO／沙盒資料，不進入遊戲紀錄與遊戲商財務。

## 8. 待確認事項

- Provider 內部角色與細部 permission key。
- 後端既有遊戲／版本／發布 enum 與目前需求基準的 Mapping。
- Provider 點數精度、USDT 換算精度與四捨五入規則。
- GGAP 對接的正式 API、簽章、回呼與重試規則。
- 官網管理的內容類型與發布流程。
- 多人 Crash / 棋牌的共享局號與參與者模型。
