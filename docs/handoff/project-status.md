# 專案現況總覽 / Project Status

> 狀態日期：2026-08-04
> 目前分支：`main`
> 文件狀態：Provider Portal 方向整理中

## 1. 產品定位

本專案是 GGAP 的其中一個 **Provider Portal**，使用者是遊戲商團隊。它的用途是協助遊戲商管理自己的遊戲、接收 GGAP 遊戲請求、保存 Game Round，以及查看遊戲商自己的監控與財務報表。

### 遊戲商負責

- 遊戲主資料、遊戲類型、版本與資產
- 遊戲規則、RTP、點數規則與限紅
- 遊戲全域上下架與維護狀態
- 接收 GGAP 提供的代理商、會員與幣別脈絡
- 保存完整 Game Round 與遊戲商點數 / USDT 資料
- 遊戲數據、遊戲商財務、監控與風控報表
- 遊戲商官網內容管理

### GGAP 負責

- 聚合平台、代理商、商戶與會員側的平台能力
- 代理商與會員的登入、錢包、交易與平台帳務
- 將下游金額轉換為代理商或商戶使用的金額
- 對已由遊戲商上架的遊戲，依代理商個別開啟或關閉
- GGAP 自身的財務、結算與平台風控

遊戲商不建立自己的錢包、代理商錢包或會員錢包，也不把代理商 / 商戶管理當作 Provider Portal 的主要功能。

## 2. 目前原型狀態

目前程式仍是早期三 Portal 原型，尚未完成 Provider Portal 導覽與責任邊界調整。它目前適合用於規格討論與畫面確認，不是正式營運系統。

| 項目 | 現況 |
|---|---|
| 前端 | Vue 3 + TypeScript + Vite + PrimeVue 4 |
| 後端 | 尚未接入真實後端；目前使用 MSW mock handlers |
| 認證 | mock token，尚未接真實登入與 JWT 驗證 |
| 資料 | mock / faker 資料，不代表正式資料模型 |
| Portal | 舊版 supplier / agent / merchant 三 Portal 架構仍在程式中 |
| 遊戲資料 | 已有遊戲清單、詳情、數學、版本、資產等原型頁 |
| 報表 | 已有舊版平台 / 代理 / 商戶導向報表，需重新定義為 Provider 報表 |
| Game Round | 尚未建立正式的 Provider Game Round 資料模型與頁面 |
| 通知中心 | 尚未建立，產品方向已確認需要 |
| 官網管理 | 尚未建立現行 Provider Portal 頁面 |

### 原型規模快照

以下數量是目前程式結構的規模參考，不代表已完成的產品功能數量：

- `src/views/`：73 個 Vue view 檔案
- `src/router/`：包含舊版 supplier / agent / merchant 路由
- `src/mocks/handlers/`：17 個 mock handler 模組
- Pinia store：auth、portal、permission、ui 等 4 個主要 store

## 3. 目標導覽與實作狀態

| 目標導覽 | 目前原型 | 後續處理 |
|---|---|---|
| 總覽 | `/dashboard` | 改為 Provider 指標與健康狀態 |
| 遊戲管理 | `/games` 及數個子頁 | 保留並移除商戶控制語意，補上 Provider 遊戲狀態 |
| 數據與報表 | `/reports`、舊平台 / 代理 / 商戶報表 | 改為 Game Round 聚合報表與明細查詢 |
| 遊戲商財務 | 舊 `/finance`、`/settlements`、`/transactions` | 改為遊戲商自己的帳務與統計，不建立平台錢包 |
| 遊戲監控與風控 | `/risk` | 改為遊戲商遊戲、Game Round、異常與營運告警 |
| GGAP 對接 | 舊 `/aggregators` | 改為 GGAP 連線、同步、請求與錯誤狀態檢視 |
| 通知中心 | 尚未建立 | 必須建立，先以站內通知為主 |
| 官網管理 | 尚未建立 | 後續建立遊戲商官網內容管理 |
| 系統設定 | `/system`、`/settings` | 保留，重新整理為 Provider 管理設定 |

以下功能目前不列入新版主要導覽：代理商管理、商戶管理、會員管理、平台管理、獨立獎池管理、遊戲商自有活動。獎池與活動未來若有明確需求，再另立規格。

## 4. 已確認的資料方向

### Game Round 是主要業務單位

- 不建立獨立的 Game Session 模組。
- 老虎機與目前單人 Crash Game 以一筆結算完成的 Game Round 為主。
- 棋牌類型可保留 `started_at` 與 `settled_at`；老虎機 / 單人 Crash 仍以 `settled_at` 為主要時間。
- 未來多人 Crash 或多人玩法才增加共享局號與參與者關係，不改變單人玩法的基本記錄模型。

### 金額與報表

- GGAP 與遊戲商之間以 USDT 為主要標準幣別。
- 遊戲商點數是遊戲內計算單位，換算規則與限紅由遊戲商定義。
- 報表主要顯示遊戲商點數；需要時可查看換算後的 USDT。
- 匯出資料同時包含點數與 USDT 欄位。
- 主要聚合維度為時間、代理商、遊戲；指標包含投注筆數、玩家人數、投注總額、平均投注額、人均投注額、輸贏與 GGR。
- Provider Portal 不顯示「已匹配 / 不一致 / 待處理」等對帳狀態；實際 GGAP 比對由財務執行。

## 5. 技術與交接狀態

- `src/services/apiClient.ts` 是目前 API 單一出口，支援 `get`、`post`、`put`、`patch`、`del`。
- `src/mocks/` 只模擬前端流程，不是正式 API 實作。
- `src/stores/portal.ts`、`src/stores/auth.ts` 仍包含三 Portal 與 mock identity，後續需要改為 Provider 身份模型。
- `src/config/menu-sakai.ts` 仍是舊版選單，下一階段會先調整導覽列，其他頁面先維持空白或佔位狀態。
- `docs/GGAP_final_system_spec_tech.html` 是 GGAP 平台依據；Provider Portal 的對接契約需另行建立，不能直接把 GGAP Admin Portal 規格當成遊戲商畫面規格。

## 6. 下一階段優先工作

1. 完成新版 Provider Portal 導覽列與路由範圍。
2. 建立 Provider Portal 產品與功能規格。
3. 建立 Provider 與 GGAP 的對接契約。
4. 定義 Game Round、點數 / USDT 與報表指標。
5. 再依核准規格調整原型頁面與 mock API。

## 7. 驗證與啟動

```bash
npm run dev
npm run build
npm run type-check
```

目前部署流程是 push 到 `main` 後由 GitHub Actions 部署 GitHub Pages。正式後端接入前，仍需完成真實登入、API 授權、錯誤狀態與資料權限驗證。
