# 遊戲商 Provider Portal 文件索引

> 文件版本：2.0.0
> 更新日期：2026-08-04
> 文件狀態：Provider Portal 方向整理中

## 閱讀前提

本專案是 GGAP 的其中一個 Provider Portal，服務對象是遊戲商本身。
遊戲商負責遊戲主資料、遊戲規則、點數與 USDT 換算、遊戲上下架、遊戲紀錄、監控與遊戲商財務報表；GGAP 負責聚合平台、代理商與會員側的平台能力。

目前產品方向已與早期「遊戲開發商總控後台」不同。`docs/archive/` 內的文件只作為歷史決策、實作過程與 QA 備查，不可直接作為新功能規格依據。

## 現行文件

### 1. GGAP 平台規格

- [`GGAP_final_system_spec_tech.html`](./GGAP_final_system_spec_tech.html)
  - GGAP 平台的系統、業務、資料、API、財務與安全規格。
  - 此文件是 GGAP 端的參考依據，不等同於遊戲商 Provider Portal 規格。
  - Provider Portal 所需的對接契約仍需另行整理。

### 2. 專案交接文件

- [`handoff/project-status.md`](./handoff/project-status.md)
- [`handoff/frontend.md`](./handoff/frontend.md)
- [`handoff/backend.md`](./handoff/backend.md)
- [`handoff/api-contract.md`](./handoff/api-contract.md)

> 上述交接文件已依 Provider Portal 方向整理，並將「目前原型實況」與「目標規格草案」分開標示。正式 API 與資料欄位仍需由後端與 GGAP 對接團隊核准。

### 3. 技術參考

- [`TECH_QUICK_REFERENCE.md`](./TECH_QUICK_REFERENCE.md)
  - 目前前端技術棧、常用指令、目錄、API client 與 Provider 開發原則。
  - 若與實際程式碼不一致，以程式碼與最新交接文件為準。

## 待建立的現行產品規格

以下文件是目前整理階段的主要缺口，後續應建立並加入本索引：

1. Provider Portal 產品與功能規格
2. Provider 與 GGAP 對接契約
3. Game Round 與遊戲紀錄規格
4. 遊戲商財務與報表指標定義
5. 通知中心規格
6. Provider Portal 導覽列與頁面範圍規格

在上述文件完成前，不應直接沿用封存區內舊有的玩家、代理商、商戶、獎池或平台管理規格。

## 封存文件

- [`archive/README.md`](./archive/README.md)

封存內容依性質分為：

- [`archive/legacy/`](./archive/legacy/)：早期產品、架構、開發與技術轉移文件。
- [`archive/qa/`](./archive/qa/)：舊版原型 QA 報告。
- [`archive/superpowers/`](./archive/superpowers/)：已完成的歷史規格與執行計畫。

封存文件保留原始內容與檔名，主要用途是追溯過去的設計決策、實作過程與測試結果。

## 文件優先級

發生內容衝突時，請依以下順序判斷：

1. 最新確認的產品決策與已核准的 Provider Portal 規格
2. GGAP 最新平台規格
3. 最新的 API 與前後端交接文件
4. 實際程式碼與測試結果
5. `docs/archive/` 歷史文件

## 更新規則

- 新的產品決策應先整理成現行規格，再修改原型或 API 文件。
- 舊規格不直接覆寫；若已失效，移入 `docs/archive/` 並保留歷史脈絡。
- GGAP 規格若由對接團隊提供新版本，應以新版本取代現行參考檔，並保留舊版備查。
- 文件中的路由、API、資料欄位與畫面狀態，應定期與實際程式碼核對。
