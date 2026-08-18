# Decision Pack 03｜原型實作差異清單

## 1. 文件定位

本文件記錄 Decision Pack 03《遊戲版本與發布生命週期》與目前 Provider Portal 原型之間的實作對照，作為產品、前端、後端、QA 與 GGAP 對接團隊的共同交接基準。

它回答三個問題：

1. 哪些產品能力已經能在 Portal 原型中檢視與操作。
2. 哪些操作目前只有前端 mock，不代表正式 Backend、CI/CD 或 GGAP 副作用。
3. 取得 Provider／GGAP Backend Git 後，還需要完成哪些 Mapping 與正式驗證。

| 項目 | 本次基準 |
|---|---|
| 上游需求 | Decision Pack 03｜遊戲版本與發布生命週期 |
| 原型實作提交 | `a1d5098`（P0）、`c774bf8`（P1） |
| 程式分支 | `codex/provider-monitoring-risk` |
| 對照日期 | 2026-08-18（Asia/Taipei） |
| 對照範圍 | 六個遊戲管理頁、共用生命週期 mock、Game Round 不可變快照 |
| 不代表 | 正式資料表、API、CI/CD、權限、Audit、Launch Gate 或 GGAP 串接已完成 |

## 2. 差異狀態定義

| 狀態 | 定義 | 可用方式 |
|---|---|---|
| `ALIGNED_PROTOTYPE` | 畫面、資訊架構與主要互動已對齊 DP03 | 可供產品審閱、前後端拆解與 QA 建立情境 |
| `MOCK_ONLY` | 原型可操作，但只更新瀏覽器記憶體中的 mock | 不可視為正式副作用或正式資料契約 |
| `BACKEND_PENDING` | 產品行為已定義，等待 Provider Backend、資料庫或部署工具實作 | 取得 Backend Git 後建立欄位、enum、API 與工作流 Mapping |
| `GGAP_PENDING` | Provider 責任已定義，但外部事件、ACK 或代理商開關契約待 GGAP 證據 | 取得 GGAP Git／規格後補 payload、冪等、重試與錯誤對照 |
| `OUT_OF_SCOPE` | 不屬於本輪 DP03 原型實作 | 不以本清單推測內容或標記完成 |

`ALIGNED_PROTOTYPE` 只表示原型已足以表達需求，不表示正式系統已完成。正式上線判定必須同時通過 Backend、GGAP、安全、資料與部署驗收。

## 3. 整體結論

DP03 的主要 Portal 原型差異已完成修正：Game、Version、Artifact、Release、Active Release、三環境、全域可用性與 Game Round 快照已使用同一組前端領域模型。六個遊戲管理頁不再各自維護互相矛盾的版本與發布狀態，`/games/environments` 也已由 Placeholder 替換為內容原型。

目前剩餘差異集中在正式副作用，而不是畫面骨架：資料仍由 MSW 與記憶體 mock 提供；發布不會觸發 CI/CD；上架不會送出 GGAP 事件；核准與權限沒有正式身分驗證；Game Round 快照尚未由 Backend 永久保存。

| 對照層 | 結論 |
|---|---|
| 產品責任與頁面分工 | 已對齊原型 |
| 主要狀態與跨頁資料語意 | 已對齊原型 |
| Prototype 互動與替代狀態 | 已完成並驗收 |
| 正式 API／資料持久化 | 待 Provider Backend |
| 真實建置／部署／回滾 | 待 CI/CD 與 SRE 工具 |
| GGAP Launch Gate／事件 ACK | 待 GGAP Backend／契約 |
| 正式權限、Audit 與通知 | 待 Backend 與系統設定規格 |

## 4. 頁面與程式對照

| 頁面 | Route／元件 | 已完成的原型能力 | 目前限制 | 狀態 |
|---|---|---|---|---|
| 遊戲列表 | `/games` · `src/views/Games/Index.vue` | 由 Active Release 推導三環境版本；分開 Release、全域可用性、GGAP 同步與 RTP 摘要；提供精確導流 | RTP 與同步值為 mock；不執行發布 | `ALIGNED_PROTOTYPE` |
| 遊戲版本 | `/games/versions` · `src/views/Games/Versions.vue` | Version／Artifact 分離、六狀態、不可變 build 資訊、候選成熟度、版本草稿與 Release 關聯 | 建立 Artifact 與驗證結果為 mock | `ALIGNED_PROTOTYPE`＋`MOCK_ONLY` |
| 環境與發布 | `/games/environments` · `src/views/Games/Environments.vue` | 三環境矩陣、待處理佇列、快速／高風險通道、覆核、發布、回復、全域狀態與 deep link | 不觸發 CI/CD、流量切換、健康檢查或 GGAP 通知 | `ALIGNED_PROTOTYPE`＋`MOCK_ONLY` |
| 遊戲設定 | `/games/settings` · `src/views/Games/Settings.vue` | 投注結構、固定幣別倍率、USDT 限額方案、設定快照及複製新草稿 | 沒有正式驗證、持久化、核准與併發控制 | `ALIGNED_PROTOTYPE`＋`MOCK_ONLY` |
| 數值設定 | `/games/math` · `src/views/Games/Math.vue` | 數值快照、理論／實際 RTP、Paytable、樣本、Guarded Lane、複製與送審 | 模擬樣本與覆核為 mock；沒有真實 Math Engine | `ALIGNED_PROTOTYPE`＋`MOCK_ONLY` |
| 遊戲素材 | `/games/assets` · `src/views/Games/Assets.vue` | 不可變 Asset ID、Bundle、checksum、storage ref、後繼素材與 Version 關聯 | 只建立 metadata；未上傳、掃描或儲存真實檔案 | `ALIGNED_PROTOTYPE`＋`MOCK_ONLY` |
| 遊戲紀錄 | `/reports` · `src/views/Reports/ProviderGameRounds.vue` | 詳情與匯出保存 Version、Build、Release、設定、數值、素材、投注結構、幣別倍率及限額快照 | 快照由 mock 建立，尚未由正式 Round 建立流程強制保存 | `ALIGNED_PROTOTYPE`＋`BACKEND_PENDING` |

## 5. 八組 DP03 契約對照

| DP03 契約 | 原型證據 | 已對齊內容 | 剩餘正式差異 | 判定 |
|---|---|---|---|---|
| DP03-01 核心物件 | `providerGameLifecycle.ts`、Version／Environment 頁 | Game、Version、Build Artifact、Release、Environment 分開建模 | 正式 schema、主鍵、migration、append-only status event | `BACKEND_PENDING` |
| DP03-02 狀態生命週期 | Version／Release 列表與詳情 | Version 成熟度與 Release 結果分離；Active Release 不複製到 Game | 後端 allowed actions、狀態守門、取消與失敗重試 | `BACKEND_PENDING` |
| DP03-03 三環境晉級 | Environment matrix | Test、DEMO、Production 分離；正式候選保存同一 build 關聯 | 真實憑證、資料庫、Artifact promotion 與環境隔離證據 | `BACKEND_PENDING` |
| DP03-04 雙發布通道 | Release 詳情與待處理佇列 | Fast／Guarded Lane、一般一人確認與高風險第二人覆核 | 真實風險分類、身分分離、排程、部署鎖與 CI/CD | `BACKEND_PENDING` |
| DP03-05 可用性與 GGAP | Game list、Environment availability | Production Release、Provider global status、GGAP sync 分開 | outbox、ACK、代理商開關查核、重試與狀態對帳 | `GGAP_PENDING` |
| DP03-06 回滾與緊急控制 | 新 Rollback Release、`suspended` 狀態 | 回復建立新 Release，不覆寫原發布紀錄 | 真實健康檢查、自動回滾、隔離 desired／actual state、Forward Fix | `BACKEND_PENDING` |
| DP03-07 Launch／Round 相容 | Game Round 詳情與匯出 | Round 保存完整生命週期快照，不依目前 Active Version 重算 | Launch Token 綁定、晚到 Callback、Bet／Settlement 共同快照與保存期 | `BACKEND_PENDING`＋`GGAP_PENDING` |
| DP03-08 權限與稽核 | 原型操作提示與 timeline | 畫面已區分覆核、發布、回復與緊急狀態 | 正式角色、permission、第二人限制、Audit、通知事件與保存 | `BACKEND_PENDING` |

## 6. 已完成的共用前端基礎

### 6.1 集中生命週期模型

`src/types/providerGameLifecycle.ts` 與 `src/mocks/providerGameLifecycle.ts` 已成為六個遊戲管理頁共同使用的原型資料來源，包含：

- Game 與 Provider 全域可用性。
- Game Version 與不可變 Build Artifact。
- Release Record、風險通道、驗證、核准與 timeline。
- Test／DEMO／Production 的 Active／Pending Release。
- 遊戲設定、數值、素材與下注限額快照。
- 固定投注幣別倍率 `USDT：USD：TWD：VND = 1：1：30：2000`。

### 6.2 集中 mock API

`src/mocks/handlers/providerGameLifecycle.ts` 已提供查詢、建立版本草稿、版本狀態、覆核、發布、回復、全域可用性、設定複製、數值複製／送審與素材建立等原型端點。

這些端點只用來驗證前端工作流與狀態呈現。重新整理或重新啟動 MSW 後資料可能重置，也沒有正式交易、部署或稽核保證。

### 6.3 Round 不可變快照

`src/types/gameRound.ts` 與 `src/mocks/handlers/providerGameRounds.ts` 已加入：

- `game_version`、`build_id`、`release_id`。
- `settings_snapshot_id`、`math_snapshot_id`、`asset_bundle_id`。
- 理論 RTP、投注結構、固定幣別倍率及下注限額方案快照。
- 環境與快照建立時間。

同一組欄位已進入 Game Round 詳情與 CSV／XLSX 匯出資料。正式 Backend 必須在 Round 建立時保存，不得在查詢時用目前設定回填。

## 7. Mock-only 行為清單

| 行為 | 原型目前做法 | 正式實作要求 |
|---|---|---|
| 建立 Version | 在記憶體陣列新增草稿 | DB transaction、唯一鍵、版本規則、actor 與 audit |
| 建立 Artifact | Version 轉 Candidate 時產生 mock build／checksum | CI build、Artifact Registry、manifest、簽章與不可變儲存 |
| 覆核 Release | 將第一筆 pending approval 改為 approved | 身分與權限驗證、提交者分離、樂觀鎖與 append-only event |
| 執行 Release | 直接把 mock Environment 指向新 Release | preflight、部署、健康檢查、原子切換、觀察與失敗補償 |
| 回復 | 建立新的 mock Release | 使用保留 Artifact、相容性檢查、真實流量切換與事故關聯 |
| 全域狀態 | 更新 Game 與 Environment mock | Provider Launch Gate 立即生效、可靠投遞 GGAP、ACK／重試 |
| 設定／數值草稿 | 複製前端物件並產生 ID | schema 驗證、版本引用、審核、併發與不可變保存 |
| 素材草稿 | 產生 metadata 與 mock checksum | upload session、病毒掃描、物件儲存、媒體驗證與 CDN |
| RTP／樣本 | 使用固定 mock 數值 | 由 Production Round／Math Engine 產生可追溯統計 |
| Game Round 快照 | handler 依 mock 資料組裝 | Round 建立 transaction 永久固定，Bet／Settlement／Callback 沿用 |

## 8. 待 Provider Backend 與部署工具 Mapping

取得 Provider Backend Git 後，至少需逐項確認：

1. Game、Version、Artifact、Release、Environment、Approval、Status History 與 Audit 的資料表及關聯。
2. 正式 ID、enum、時間欄位、Decimal 精度、錯誤碼、分頁與 idempotency 格式。
3. Candidate 綁定設定、數值、素材與 Artifact manifest 的 transaction 邊界。
4. Test → DEMO → Production 是否能 promotion 同一 Artifact，是否存在重新 build 風險。
5. 發布 preflight、排程、併發鎖、健康驗證、原子切換、自動回滾與補償工具。
6. Provider Launch Gate、維護、暫停、隔離 desired／actual state 與既有 Round 例外路徑。
7. Launch Token／Context 是否保存 Version、Build、Release 與 environment。
8. Round、Bet、Settlement、Cancel、Refund 與 Callback 是否共同引用不可變快照。
9. 角色、permission、第二人核准、緊急權限、敏感欄位及 append-only Audit。
10. 素材 upload、掃描、儲存、CDN、checksum、版本引用與保存政策。

每一項使用以下結果之一，不以猜測填值：`已存在`、`部分存在`、`尚未存在`、`與需求衝突`、`僅命名不同`、`無法由 Git 判斷`。

## 9. 待 GGAP Mapping

取得 GGAP Backend Git 或正式契約後，需補齊：

- Provider 遊戲目錄與 Active Release 的同步事件名稱及 payload。
- Provider global status 上架、維護、暫停、退役的事件版本。
- GGAP ACK、idempotency key、簽章、重試、死信與狀態對帳。
- GGAP 代理商遊戲開關與 Provider 全域可用性的最終 Launch Gate 判斷順序。
- Launch request／token 中的 Game、Version、Build、Release 與 environment 欄位。
- 新 Release 切換期間舊 Token、舊 Round、晚到 Callback 與強制失效策略。
- 同步失敗、長時間未 ACK、Provider 緊急停用及服務恢復的錯誤碼與通知方式。

Provider 不因等待 GGAP Mapping 而改變責任邊界：Provider 先保護自身 Launch Gate；GGAP 仍負責代理商、商戶、會員與錢包側資格。

## 10. 非本輪範圍

以下內容維持 `OUT_OF_SCOPE`，不因 DP03 原型完成而自動升格：

- GGAP 對接五頁的完整規格與原型。
- 通知中心兩頁。
- 系統設定四頁與正式使用者／權限管理。
- 真實 CI/CD、雲端資源、Secret、Artifact Registry 與正式環境操作。
- Backend schema、migration、資料保存與 production deployment。

## 11. 驗證證據

P0、P1 完成後已執行：

| 驗證 | 結果 |
|---|---|
| `npm run spec:decision-pack-03-source-check` | PASS；92 assertions |
| `npm run spec:seal` | PASS |
| `npm run type-check` | PASS |
| `npm run build` | PASS；1529 modules transformed |
| `git diff --check` | PASS |
| Desktop 1440 × 1000 | 六個生命週期頁與 Game Round 相關頁無頁面級水平溢位 |
| Mobile 390 × 844 | 非表格控制項在可視範圍；寬表格使用容器內捲動 |
| Browser Console | 0 error |

互動抽驗包含：設定快照複製後原紀錄不變、數值草稿進入 Guarded Lane、素材建立新 Asset／supersedes 關係、Test 最新驗證版本顯示、Release deep link，以及 Game Round 完整生命週期快照。

Build 仍只有既知的 Browserslist `caniuse-lite` 八個月未更新提示；依既定安排，待整份規格書完成後一次更新。

## 12. 正式上線前阻擋清單

| 優先層級 | 必要條件 | 未完成時的限制 |
|---|---|---|
| 上線阻擋 | 正式資料持久化與不可變 history／audit | 不可把 mock 狀態當正式發布事實 |
| 上線阻擋 | CI/CD、同 Artifact 晉級、健康檢查、原子切換與回滾 | 不可執行 Production 發布 |
| 上線阻擋 | Launch Gate、Round 快照與晚到交易相容 | 不可保證版本切換後金額與 Round 正確 |
| 上線阻擋 | 正式角色、permission、第二人核准與緊急權限 | 不可開放高風險或緊急操作 |
| 整合阻擋 | GGAP 事件、ACK、冪等、重試與代理商 Gate | 不可宣告外部遊戲開放狀態一致 |
| 功能阻擋 | 真實素材 upload／scan／storage | 不可把素材原型視為正式資產管理 |
| 後續優化 | 完整通知、操作紀錄查詢、部署觀察圖表 | 不阻擋原型審閱，但需在正式營運前安排 |

## 13. 維護與重開條件

發生下列任一情況時，必須更新本清單並重跑驗證：

1. DP03 產品責任、Version／Release 狀態或三環境晉級規則改變。
2. Provider Backend Git、資料表、CI/CD 或權限證據到位。
3. GGAP payload、ACK、Launch Gate 或代理商開關契約到位。
4. 六個遊戲管理頁或 Game Round 快照欄位增加、刪除或改名。
5. 原型操作開始觸發真實外部副作用。

後續 Mapping 只補實際命名與能力差異；若 Backend 現況與需求衝突，應留下「與需求衝突」紀錄並由產品決定調整方向，不得用現況程式靜默覆蓋 Decision Pack 03。
