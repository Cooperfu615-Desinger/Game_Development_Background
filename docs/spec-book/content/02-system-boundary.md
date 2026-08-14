# 系統與責任邊界

Provider Portal 與 GGAP 是同一條遊戲服務鏈路上的不同責任系統。Provider 擁有遊戲與遊戲結果；GGAP 擁有聚合平台、下游營運主體、錢包與平台帳務。

## 責任矩陣

| 項目 | Provider | GGAP |
|---|---|---|
| 遊戲主資料、版本、規則、RTP、限紅、素材 | 擁有與管理 | 同步／讀取 |
| 遊戲全域上架、下架與維護 | 控制 | 接收狀態 |
| 已上架遊戲的代理商個別開關 | 不控制 | 控制 |
| 代理商、商戶、會員主資料 | 不建立、不管理 | 建立與管理 |
| 會員登入與平台錢包 | 不負責 | 負責 |
| Provider 點數與換算規則 | 計算與保存 | 依契約傳送／接收 |
| Game Round | 產生與保存 | 傳入脈絡、接收結果 |
| Provider 財務與風控 | 產出自身資料 | 可讀取或外部比對 |
| 平台結算與對帳 | 提供正確資料 | 負責執行 |

## 對接資料脈絡

GGAP 可將 `agent_id`、`merchant_id`、`member_id` 與幣別脈絡傳入 Provider。這些欄位是 Game Round 或技術追蹤快照，不代表 Provider 建立或管理相關主資料。

## 狀態必須分離

至少存在三種不可合併的狀態：

1. Provider 遊戲全域狀態。
2. GGAP 對特定代理商的遊戲可見狀態。
3. Game Round 處理與結算狀態。

Provider Portal 只控制第一種。第二種可在正式契約核准後顯示同步結果，但不能作為 Provider 主資料控制。

## Game Session 邊界

GGAP 平台可以建立啟動、錢包或匯率脈絡的 Session；Provider Portal 不因此建立獨立 Game Session 業務模組。Provider 的主要業務紀錄仍是 Game Round。DEMO 大廳目前顯示的 Session 是隔離的展示統計，不得混入正式 Game Round、財務或風控模型。

## 風控隔離

Provider 隔離是為限制異常擴大而暫時阻擋指定範圍的新 Launch，不等於 GGAP 代理商個別開關。既有 Game Round 的 Settle、Callback、必要重試及 audit 必須繼續運作。
