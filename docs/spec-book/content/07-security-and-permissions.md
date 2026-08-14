# 安全與權限

Provider Portal 是單一 Provider 內部系統。資料隔離、正式操作授權與敏感資訊保護必須由後端強制執行。

## 身份與資料範圍

正式 token 至少需表達使用者、`provider_id`、Provider 內部角色、permission、簽發與過期資訊。舊原型的 supplier／agent／merchant Portal 切換模型不作為正式身份設計。

## 權限原則

- 讀取、匯出、發布、正式環境啟用、風控處理、憑證輪替與系統設定需分開授權。
- 正式環境高風險操作需確認原因，必要時增加二次確認或雙人核准。
- 導向頁必須重新檢查資料存在性與權限，不信任來源頁 query。

## 敏感資料

- Secret、私鑰、完整 token 與簽章不得出現在一般列表或 log。
- API key 只顯示遮罩與輪替狀態；正式 secret 原則上只在建立時顯示一次。
- 會員 ID 是否遮罩及可見角色仍待確認。

## 稽核

重要操作需保存操作者、角色、`provider_id`、資源、操作前後、原因、結果、時間、Request ID、IP 與 User Agent。已保存的業務紀錄與 audit 不得由一般頁面直接刪除。
