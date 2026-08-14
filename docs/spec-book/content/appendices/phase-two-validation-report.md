# 第二階段封版驗證報告

## 1. 驗證結論

第二階段封版 Gate **通過**。Batch A–D 共 21 個 Baseline／Active 頁面均已完成一致的完整 Draft：產品與 UI 規格、Overview-first 畫面示意、頁面狀態、驗收骨架、跨頁依賴及集中 TBD 追溯皆可交付產品、前端、後端與 QA 進行下一輪契約審閱。

本次封版是 **Draft Seal**，不是正式核准。21 頁仍維持 Draft；API、資料／計算與權限／稽核三個交付面向維持 Partial，30 項集中 TBD 維持 Open。GGAP 對接、通知中心與系統設定共 11 頁繼續 Deferred，不因本次封版而產生推測規格。

| 項目 | 結果 |
|---|---|
| 驗證日期 | 2026-08-14（Asia/Taipei） |
| 封版輸入基準 | `main@9ce2d07` |
| 規格網站版本 | `0.13.0-phase-two-seal` |
| Gate 結果 | PASS |
| 阻擋缺陷 | 0 |
| 非阻擋注意事項 | 3 |
| 下一階段 | Phase 3：共用契約與集中 TBD 收斂 |

## 2. 驗證範圍

本次驗證涵蓋第二階段四個批次及其共同依賴：

1. Batch A：遊戲紀錄、財務總覽、代理商 × 遊戲彙總，共 3 頁。
2. Batch B：儀表板、監控總覽、風控報表、風控告警／處理，共 4 頁。
3. Batch C：遊戲列表、環境與發布、遊戲設定、數值設定、遊戲版本、遊戲素材，共 6 頁。
4. Batch D：遊戲官網 3 頁與遊戲大廳 5 頁，共 8 頁。
5. 四條核心業務鏈、30 項集中 TBD、三項 Deferred 外部依賴及登入頁規格文件入口。

不在本次封版判定範圍內：正式 API／schema、permission key、金額與百分比精度、正式監控門檻、發布與核准狀態機、GGAP 正式契約、通知中心、系統設定，以及正式核准 PDF 快照。

## 3. 驗證方法與結果

### 3.1 自動化 Gate

| Gate | 指令／檢查 | 結果 | 驗證內容 |
|---|---|---|---|
| 規格網站完整性 | `npm run spec:check` | PASS | 62 份文件、32 個內容頁、離線資源、內部連結、搜尋索引與生成標記 |
| 第一階段基準 | `node scripts/check-phase-one-seal.mjs` | PASS | 251 項 assertion；範圍、route、元件、來源、核心邊界、依賴及 TBD 基準 |
| Batch A | `node scripts/check-batch-a.mjs` | PASS | 81 項 assertion／3 頁 |
| Batch B | `node scripts/check-batch-b.mjs` | PASS | 118 項 assertion／4 頁 |
| Batch C | `node scripts/check-batch-c.mjs` | PASS | 170 項 assertion／6 頁 |
| Batch D | `node scripts/check-batch-d.mjs` | PASS | 262 項 assertion／8 頁 |
| 第二階段封版 | `node scripts/check-phase-two-seal.mjs` | PASS | 741 項 assertion；21 頁 Draft、126 個示意區塊、11 頁 Deferred 與登入入口 |
| TypeScript／Vue | `npm run type-check` | PASS | Vue 與 TypeScript 型別 |
| 正式建置 | `npm run build` | PASS | Vite production build 與規格網站重新產生 |
| Git 差異格式 | `git diff --check` | PASS | 空白錯誤與衝突標記 |

後續可使用 `npm run spec:seal` 一次重跑規格網站、第一階段基準、Batch A–D、第二階段封版、型別與 production build。

### 3.2 數量與交付覆蓋

| 驗證對象 | 封版結果 | 判定 |
|---|---:|---|
| 規格網站文件 | 62 | PASS；包含第一、第二階段驗證報告 |
| 內容頁 | 32 | PASS |
| 已有內容原型／Placeholder | 24／8 | PASS；Phase 2 中「環境與發布」仍是唯一 Active Placeholder |
| Baseline／Active／Deferred／Blocked | 1／20／11／0 | PASS |
| Phase 2 完整 Draft 頁 | 21 | PASS；Batch A／B／C／D 分別為 3／4／6／8 頁 |
| 產品與 UI 完成度 | 126／126 Complete | PASS；21 頁 × 6 面向 |
| 響應式、驗收、跨頁依賴 | 63／63 Complete | PASS；21 頁 × 3 面向 |
| API、資料、權限 | 63／63 Partial | PASS；明確交由 Phase 3 收斂，未誤標完成 |
| Overview-first 快速區塊 | 126 | PASS；21 頁 × 6 區，均可連至目標章節 |
| 核心業務鏈 | 4 條／19 節點／15 關係 | PASS |
| Deferred 外部依賴 | 3 | PASS；GGAP、通知中心、系統設定 |
| 集中 TBD | 30 Open | PASS；未將未核准內容誤標為已解決 |

第一階段 252 個完成度評級格為 Complete 85、Partial 108、Missing 59；第二階段封版後為 Complete 189、Partial 63、Missing 0。這代表規格骨架與交付說明已補齊，不代表 63 個技術契約面向已核准。

### 3.3 網站與追溯驗證

- 62 份 HTML 均使用繁體中文語系、主要內容 landmark、目前導覽狀態及可解析的本機相對連結。
- 21 個完整 Draft 頁均具置頂六區畫面示意、頁內目錄、快速區塊導覽、返回閱讀動線與搜尋索引。
- Desktop、Tablet、Mobile 與列印樣式規則仍存在；內文寬度不受舊版固定最大寬度限制。
- 登入頁保留「交接文件」，並另有「規格文件」入口，可依 Vite base path 開啟規格網站首頁。
- 32 個 route、Provider 九群組主導覽、manifest 元件與來源 Spec 檔案持續可追溯。

## 4. 跨 Batch 一致性結論

### 4.1 Game Round 與財務

- Game Round 維持主要業務紀錄單位，不另建正式 Game Session。
- 財務總覽與代理商 × 遊戲彙總均由 Production Game Round 聚合，並可回查遊戲紀錄。
- Provider 點數為主值，USDT 是保存且可追溯的換算對照；正式精度與更正規則仍為 TBD。
- 代理商只作為 GGAP 傳入的交易脈絡快照，不代表 Provider 建立代理商主資料。

### 4.2 監控與風控

- 監控總覽維持唯讀觀察，Risk Event 負責分析，Alert 負責人工處理，三者不混為同一狀態。
- Production／DEMO 必須分開選擇，Test 不進 Provider 風控監控。
- 隔離只阻擋指定 scope 的新 Launch；既有 Game Round 繼續完成並保留真實結果。
- 正式門檻、更新頻率、操作權限、冪等與 GGAP 通知仍需 Phase 3 或外部契約確認。

### 4.3 遊戲生命週期

- 遊戲主資料、一般設定、數值版本、程式版本、素材版本與 release job 維持不同責任物件。
- Test 維持只讀送測脈絡；Provider Production／DEMO 發布不取代 GGAP 的代理商個別開關。
- 「環境與發布」雖有完整目標 Draft，程式仍為 Placeholder；必須符合頁內移除條件後才能替換。
- 正式發布組合、狀態機、核准、併發、回復與 GGAP 同步仍屬集中 TBD。

### 4.4 官網與遊戲大廳

- 官網內容草稿、公開 snapshot、發布 job 與歷史紀錄維持分離。
- 大廳遊戲資料引用 Provider 遊戲主資料，但大廳公開狀態不取代 Provider 全域上下架或 GGAP 代理商開關。
- DEMO identity、展示 credit 與試玩工作階段不建立正式會員、錢包或 Game Session，也不進入 Production Game Round、財務或風控。
- 正式內容 schema、素材／語系 fallback、安全清理、發布與 DEMO API 仍需 Phase 3 收斂。

## 5. Deferred 與未完成契約

- GGAP 對接 5 頁、通知中心 2 頁、系統設定 4 頁維持 Deferred。
- 11 頁只保留 route、程式追溯、延後原因、必要輸入與不可開發聲明；不建立畫面示意、完成度或三層校準。
- 30 項集中 TBD 維持 Open。正式決議必須同步更新共通章節、受影響頁面、資料字典、enum、API、權限及測試。
- Phase 3 應先處理跨頁共用契約，再處理頁面局部契約，避免每頁各自定義 Game Round、財務、發布、監控或權限口徑。

## 6. 非阻擋注意事項

1. Vite 建置仍提示 `caniuse-lite` 資料已有 8 個月未更新；依既定決策，待整份規格書完成後一次更新並重跑瀏覽器相容性驗證。
2. 自動 Gate 驗證 DOM、連結、響應式規則與 build，不取代實際瀏覽器的像素級 Desktop／Mobile 人工抽看；人工抽看由產品審閱流程執行。
3. 規格網站尚未輸出正式單一 HTML 與 PDF 核准快照；應待第一批契約升格為 Confirmed 後再產生，避免把 Draft／TBD 誤封為正式契約。

## 7. 封版判定與重開條件

第二階段以本報告、`0.13.0-phase-two-seal` 及其輸入基準作為 Draft 封版紀錄。發生下列任一情況時，必須重跑 `npm run spec:seal` 並更新報告或版本紀錄：

1. 21 個 Draft 頁的範圍、批次、route、元件或畫面結構改變。
2. Provider／GGAP 責任、Game Round、Production／DEMO／Test 或點數／USDT 邊界改變。
3. 財務聚合、Risk Event／Alert、發布生命週期或官網／大廳資料責任改變。
4. 集中 TBD、跨頁依賴或 Deferred 影響範圍發生重大調整。
5. GGAP、通知中心或系統設定取得必要輸入並重新排入 Active。

## 8. 第三階段入口

Phase 3 應以共用契約為批次，而不是再次逐頁補寫：

1. Domain／Data：Game Round、財務公式、時間、精度與 enum。
2. API：查詢、分頁、排序、匯出、錯誤與冪等。
3. Security：Provider identity、角色、permission key、資料 scope 與 audit。
4. Lifecycle：遊戲、版本、素材、官網與大廳的發布、核准、併發與回復。
5. Monitoring／Risk：指標、門檻、更新頻率、Risk Event／Alert 與操作副作用。
6. QA／NFR：效能、保存、可用性、資料品質與正式驗收案例。

進入 Phase 3 不代表解除 Deferred。GGAP、通知中心與系統設定仍需等取得必要規格後，另行評估是否重新排入範圍。
