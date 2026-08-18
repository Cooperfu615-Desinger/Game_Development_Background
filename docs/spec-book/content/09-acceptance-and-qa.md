# 驗收與 QA

規格書中的驗收條件應拆成前端、後端與整合三個層次，並能直接形成測試案例。

## 前端驗收

- 導覽、route、頁面標題與規格名稱一致。
- 查詢、排序、分頁、詳情與操作狀態符合頁面契約。
- Loading、空資料、錯誤、權限不足及窄版狀態完整。
- Prototype 操作不得暗示已修改正式資料。

## 後端驗收

- 所有查詢強制套用 `provider_id`。
- 環境、狀態、時間與金額口徑符合共通規則。
- 分頁、排序、冪等、錯誤及 audit 可被穩定驗證。
- 不回傳不屬於 Provider UI 的平台、商戶或會員主資料。

## 整合驗收

- 前端 query 與 API 欄位一致。
- 跨頁導向保留完整且正確的識別碼。
- Production、DEMO、Test 不發生資料混用。
- 點數與 USDT 的歷史換算結果可追溯。
- GGAP 重試、Callback 與通知不造成重複交易或狀態誤判。

## 發布生命週期驗收

- Draft 不可直接發布 Production；Production Artifact 與 DEMO 驗證 Artifact 不同時必須拒絕。
- 一般低風險版本在自動檢查通過後可由一位發布管理者立即或排程發布。
- RTP、限額、Callback 契約、migration 或安全變更自動進入高風險通道，提交者不能完成第二人核准。
- Active 切換前失敗時舊版本繼續服務；切換後健康驗證失敗時建立新的回滾 Release。
- Provider 維護／暫停而 GGAP 代理商仍開啟時，新 Launch 仍被 Provider 拒絕，既有 Round 依原版本完成。
- 舊 Round 晚到 Settlement／Callback 時依原 Version、Build、Release 與數值快照處理，不使用目前 Active Version 重算。
- Test、DEMO、Production 同時存在同一 Game 時，正式紀錄、財務、監控與風控不得混入 Test／DEMO。

## 規格完成定義

產品需求基準回答「希望具備什麼行為」；實作只有在前端能回答「如何呈現」、後端能回答「如何提供」，且 QA 能回答「如何驗證」時，才可標示為已接軌。
