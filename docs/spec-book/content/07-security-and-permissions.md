# 安全與權限

Provider Portal 是單一 Provider 內部系統。資料隔離、正式操作授權與敏感資訊保護必須由後端強制執行。

## 身份與資料範圍

正式 token 至少需表達使用者、`provider_id`、Provider 內部角色、permission、簽發與過期資訊。舊原型的 supplier／agent／merchant Portal 切換模型不作為正式身份設計。

## 權限原則

- 讀取、匯出、版本編輯、Test／DEMO 發布、Production 發布、風控處理、憑證輪替與系統設定需分開授權。
- 一般 Production Release 由一位發布管理者在自動檢查後執行；只有 RTP、金額、限額、契約、migration、安全、略過檢查或無安全回滾等高風險變更要求第二人核准。
- 高風險提交者不得代替第二位核准者；Version、Artifact 或高風險內容改變時，既有核准失效。
- 緊急停用可由緊急處理者單人立即執行，不等待 GGAP ACK；解除需健康驗證與具權限確認。
- 導向頁必須重新檢查資料存在性與權限，不信任來源頁 query。

## 敏感資料

- Secret、私鑰、完整 token 與簽章不得出現在一般列表或 log。
- API key 只顯示遮罩與輪替狀態；正式 secret 原則上只在建立時顯示一次。
- 會員 ID 是否遮罩及可見角色仍待確認。

## 稽核

重要操作需保存操作者／System、角色與 permission snapshot、`provider_id`、資源、環境、操作前後、原因、結果、時間、Request／correlation／trace ID、IP 與 User Agent。Version、Artifact checksum、核准、Release、上下架、回滾、隔離、緊急停用與 audit 不得由一般頁面直接刪除；更正採追加紀錄。
