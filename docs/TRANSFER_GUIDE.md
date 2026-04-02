# 項目技術架構轉化指南

**從 Aggregator 到遊戲開發商總控後台的完整路線圖**

---

## 📚 文檔概述

本目錄已生成 4 份關鍵文檔，用於指導新專案開發。請按照下列順序閱讀：

### 1️⃣ **ARCHITECTURE_ANALYSIS.md** (架構分析報告)
- **用途**: 深度分析現有 Aggregator 的完整架構
- **內容**:
  - 現有項目的技術棧詳解
  - 分層架構與模組化設計
  - 完整的目錄結構說明
  - 開發規範與最佳實踐
  - 新專案適配指南
- **閱讀時間**: 45-60 分鐘
- **適合人員**: 架構師、Tech Lead、初級開發者

### 2️⃣ **NEW_PROJECT_SETUP_GUIDE.md** (快速啟動指南)
- **用途**: 新專案的分步初始化指南
- **內容**:
  - 項目初始化步驟
  - 核心依賴安裝
  - 目錄結構建立
  - 配置文件調整
  - 路由與佈局重構
  - Mock API 配置
  - 第一個頁面實現
  - 構建與部署指引
- **閱讀時間**: 30-40 分鐘
- **適合人員**: 前端開發者、DevOps 工程師

### 3️⃣ **GAME_DEVELOPER_DASHBOARD_SPEC.md** (產品技術規範)
- **用途**: 遊戲開發商總控後台的完整技術規範
- **內容**:
  - 項目定位與業務模式
  - 系統架構圖
  - 核心功能模組詳解
  - 數據結構定義
  - API 規範詳細
  - 前端實現規範
  - Phase 1-3 發展路線圖
  - 指標計算公式
- **閱讀時間**: 60-90 分鐘
- **適合人員**: 產品經理、前後端工程師、數據分析師

### 4️⃣ **TRANSFER_GUIDE.md** (本文檔)
- **用途**: 文檔導航與項目交接指南
- **內容**:
  - 文檔概述
  - 快速檢查清單
  - 與 Aggregator 的映射關係
  - 團隊分工建議
  - 常見問題解答

---

## 🎯 快速開始 (5 分鐘版)

**如果你只有 5 分鐘時間，請執行以下操作：**

```bash
# 1. 克隆 Aggregator 項目
git clone <aggregator-repo> game-developer-dashboard
cd game-developer-dashboard

# 2. 安裝依賴
npm install --legacy-peer-deps

# 3. 啟動開發服務器
npm run dev

# 4. 訪問 http://localhost:5173
# 用任意信息登陸，查看現有的雙後台原型

# 5. 閱讀 ARCHITECTURE_ANALYSIS.md 第 2、3 部分
# 了解現有技術棧和架構設計
```

---

## 📊 文檔與 Aggregator 代碼的映射

| 文檔位置 | 對應 Aggregator 代碼 | 說明 |
|---------|-------------------|------|
| ARCHITECTURE_ANALYSIS.md #2.1 | `package.json` | 技術棧與依賴 |
| ARCHITECTURE_ANALYSIS.md #3.2 | `src/router/index.ts` | 路由架構 |
| ARCHITECTURE_ANALYSIS.md #4.1 | `src/` 目錄結構 | 完整檔案組織 |
| ARCHITECTURE_ANALYSIS.md #6 | `src/composables/`, `TECH_STANDARDS.md` | 開發規範 |
| NEW_PROJECT_SETUP_GUIDE.md #3 | `vite.config.ts`, `tsconfig.json` | 配置文件 |
| NEW_PROJECT_SETUP_GUIDE.md #4 | `src/router/index.ts`, `src/layouts/` | 路由與佈局 |
| NEW_PROJECT_SETUP_GUIDE.md #5 | `src/mocks/` | Mock API 配置 |
| GAME_DEVELOPER_DASHBOARD_SPEC.md #2 | `PROJECT_MANIFEST.md` | 業務定位與架構 |
| GAME_DEVELOPER_DASHBOARD_SPEC.md #3 | 新功能需求 | 遊戲開發商特定功能 |

---

## 🏗️ 項目創建工作流程

### 階段 1: 規劃與架構審查 (1-2 天)

**任務清單**:
- [ ] 產品經理閱讀 `GAME_DEVELOPER_DASHBOARD_SPEC.md`
- [ ] 架構師審查 `ARCHITECTURE_ANALYSIS.md` 中的新專案適配指南
- [ ] 技術負責人確認技術棧選型
- [ ] 團隊同步會議，確認功能範疇與交付日期

**輸出物**:
- ✅ 功能需求文檔 (基於 Spec)
- ✅ 項目時間表 (基於 Phase 1-3)
- ✅ 技術架構確認單

### 階段 2: 環境準備 (1 天)

**任務清單**:
- [ ] 遵循 `NEW_PROJECT_SETUP_GUIDE.md` #1-2 初始化項目
- [ ] 驗證 TypeScript 編譯、ESLint、Prettier 配置
- [ ] 本地開發環境正常運行 (`npm run dev`)
- [ ] MSW Mock 服務啟動成功

**輸出物**:
- ✅ 乾淨的項目目錄結構
- ✅ 所有依賴正確安裝
- ✅ 開發環境驗證通過

### 階段 3: 架構實現 (2-3 天)

**任務清單**:
- [ ] 參考 `NEW_PROJECT_SETUP_GUIDE.md` #4 建立新路由結構
- [ ] 建立統一的 MainLayout (替代 Master/Merchant 雙佈局)
- [ ] 實現 Pinia 狀態管理 (auth, game, analytics stores)
- [ ] 編寫第一批 composables (useGameManagement, usePlayerAnalytics 等)

**輸出物**:
- ✅ 新的路由結構
- ✅ 統一的頁面佈局
- ✅ 核心 composables

### 階段 4: 功能開發 (4-6 周)

**按優先級開發**:

1. **第 1 周**: Dashboard (儀表板)
   - 實時統計卡片
   - ECharts 營收趨勢圖
   - 熱門遊戲 TOP 5

2. **第 2 周**: Game Management (遊戲管理)
   - 遊戲列表 (搜索、排序、分頁)
   - 遊戲上架/下架
   - 版本管理

3. **第 3 周**: Player Analytics (玩家分析)
   - 玩家概況統計
   - 留存率報表
   - 消費分析

4. **第 4-5 周**: Finance (財務結算)
   - 結算報表
   - 交易記錄
   - 發票管理

5. **第 6 周**: Polish & Testing
   - 界面優化
   - 功能測試
   - 性能優化

### 階段 5: 測試與交付 (1-2 周)

**測試清單**:
- [ ] 功能測試 (所有 CRUD 操作)
- [ ] 跨瀏覽器測試 (Chrome, Firefox, Safari)
- [ ] 響應式設計驗證 (Desktop, Tablet, Mobile)
- [ ] 性能測試 (Lighthouse, 加載時間)
- [ ] 無障礙測試 (WCAG 2.1 AA)

**交付物**:
- ✅ 完整的前台代碼
- ✅ 詳細的技術文檔
- ✅ Mock API 規範
- ✅ 開發與部署指南

---

## 👥 團隊分工建議

### 推薦團隊組成

```
遊戲開發商總控後台開發團隊
├─ 1 x Tech Lead / Architect
│  └─ 責任: 技術決策、架構設計、Code Review
├─ 2-3 x Frontend Engineers
│  └─ 責任: UI 開發、業務邏輯、Bug Fix
├─ 1-2 x Backend Engineers (後期)
│  └─ 責任: API 開發、數據庫設計、集成
├─ 1 x QA/Test Engineer
│  └─ 責任: 功能測試、性能測試、文檔驗證
└─ 1 x Product Manager (兼職)
   └─ 責任: 需求管理、優先級排序、驗收
```

### 前端工程師的日常工作流程

```
Daily Standup (9:00 AM)
  ├─ 昨日完成的工作
  ├─ 今日計劃
  └─ 遇到的問題

開發工作 (9:30 AM - 5:00 PM)
  ├─ 新功能開發 (使用 composables)
  ├─ 本地測試 (MSW Mock 數據)
  ├─ Code Review (GitHub Pull Request)
  └─ Bug Fix

每日總結
  ├─ 代碼提交與同步
  ├─ 更新進度追蹤
  └─ 文檔更新
```

---

## ❓ 常見問題 (FAQ)

### Q1: 我該從哪裡開始？

**A:** 按照以下順序:

1. **先讀** `ARCHITECTURE_ANALYSIS.md` 第 1-3 部分 (了解現有架構)
2. **再讀** `GAME_DEVELOPER_DASHBOARD_SPEC.md` 第 1-3 部分 (了解新項目)
3. **然後按照** `NEW_PROJECT_SETUP_GUIDE.md` 初始化項目
4. **最後** 參考 `GAME_DEVELOPER_DASHBOARD_SPEC.md` 第 4-6 部分 進行開發

### Q2: Aggregator 中的哪些代碼可以直接複用？

**A:** 以下部分可以直接複用:

```
✅ 完全複用:
  - src/plugins/echarts.ts
  - src/i18n.ts (翻譯框架，但內容需更新)
  - src/utils/*.ts
  - src/components/Common/*.vue
  - 配置文件 (tsconfig, vite.config, tailwind.config)

✅ 部分複用 (需修改):
  - src/layouts/ (改為單一佈局)
  - src/router/ (改為新的路由結構)
  - src/mocks/ (Mock 數據需重寫)
  - src/locales/ (翻譯內容需重寫)

❌ 不複用:
  - src/views/Master/ (Master Admin 特定)
  - src/views/Merchant/ (Merchant Portal 特定)
  - src/mocks/handlers.ts (API 規範不同)
  - src/types/merchant.ts, src/types/provider.ts (實體不同)
```

### Q3: 如何自己寫 Mock API？

**A:** 參考 `NEW_PROJECT_SETUP_GUIDE.md` 第 5 部分:

```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/games', () => {
    return HttpResponse.json({
      code: 0,
      data: [...]  // FakerJS 生成數據
    })
  })
]
```

### Q4: 如何與真實後端 API 對接？

**A:** 3 個步驟:

1. **關閉 MSW**: `VITE_USE_MOCK=false` (環境變數)
2. **配置 API 基礎 URL**: `VITE_API_BASE_URL=https://api.example.com`
3. **在 composables 中實現真實調用**:

```typescript
// src/composables/useGameManagement.ts
const fetchGames = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/games`)
  // ...
}
```

### Q5: 新項目與 Aggregator 的主要區別是什麼？

**A:** 關鍵差異:

| 方面 | Aggregator | 遊戲開發商後台 |
|------|-----------|--------------|
| **後台數量** | 雙後台 (Master + Merchant) | 單一後台 |
| **主要用戶** | 聚合商 & 運營商 | 遊戲開發商 |
| **核心功能** | 遊戲聚合、清算 | 遊戲管理、營收監控 |
| **路由結構** | `/admin/`, `/merchant/` | `/dashboard/`, `/games/`, `/analytics/` |
| **數據模型** | 商戶、供應商、玩家 | 遊戲、玩家、交易、結算 |
| **風控焦點** | 運營商風控 | 遊戲異常監控 |

### Q6: 怎樣才能快速看到成果？

**A:** 按照以下快速路徑:

```bash
# 1. 初始化項目 (1 小時)
npm create vite@latest game-dashboard -- --template vue-ts
cd game-dashboard && npm install

# 2. 複製 Aggregator 的核心配置 (30 分鐘)
# 複製: tsconfig, vite.config, tailwind.config, src/plugins, src/i18n

# 3. 建立簡單的儀表板頁面 (2 小時)
# 參考 NEW_PROJECT_SETUP_GUIDE.md 第 7.1 部分

# 4. npm run dev 查看結果
# 已有一個可運行的儀表板原型！
```

**總計 3.5 小時可看到第一個可運行的頁面。**

### Q7: 如何保持代碼質量？

**A:** 遵循 `ARCHITECTURE_ANALYSIS.md` 第 6 部分的規範:

```typescript
// ✅ 推薦: 邏輯分離
const { games, loading, fetchGames } = useGameManagement()

// ❌ 禁止: 邏輯在組件中
const games = ref([])
const loading = ref(false)
const fetchGames = async () => { ... }  // ❌ 不應在組件中
```

**定期進行 Code Review，確保遵守以下規則:**
1. ✅ 禁止手寫 CSS (使用 Tailwind)
2. ✅ 禁止使用任意型別 (TypeScript Strict)
3. ✅ 禁止手刻按鈕 (使用 Naive UI)
4. ✅ 邏輯必須分離到 composables

### Q8: 交付時需要提交哪些文檔？

**A:** 最小化文檔清單:

```
交付物:
├─ 1. 前台代碼
│  └─ 完整的 Vue SPA (src/)
│
├─ 2. API 規範文檔
│  └─ 基於 GAME_DEVELOPER_DASHBOARD_SPEC.md 的詳細 API 清單
│
├─ 3. 開發指南
│  └─ 如何在本地運行、測試、構建的說明
│
├─ 4. 部署指南
│  └─ 如何部署到 Vercel 或其他平台
│
└─ 5. Mock 數據規範
   └─ MSW handlers 的詳細說明
```

---

## 📋 完整檢查清單

### 項目啟動前

- [ ] 團隊所有成員已閱讀 `ARCHITECTURE_ANALYSIS.md`
- [ ] 產品經理已批准 `GAME_DEVELOPER_DASHBOARD_SPEC.md`
- [ ] Tech Lead 已規劃技術棧與架構
- [ ] 項目經理已制定時間表

### 開發過程中

- [ ] 每天進行 Standup 同步
- [ ] 每周進行 Code Review
- [ ] 按照 Phase 1 的功能清單逐項完成
- [ ] 定期更新進度文檔
- [ ] 及時記錄 Bug 和改進建議

### 交付前

- [ ] 所有 Phase 1 功能已完成
- [ ] 已通過功能測試和跨瀏覽器測試
- [ ] 代碼質量檢查通過 (ESLint, TypeScript)
- [ ] 前後端 API 規範已簽署確認
- [ ] 部署環境已配置 (Vercel 或自建服務器)
- [ ] 文檔已完成 (API、開發、部署指南)
- [ ] 團隊已進行交接培訓

### 交付後

- [ ] 後端團隊接手 API 開發
- [ ] 前端代碼進行最終 Review
- [ ] Mock 數據與真實 API 進行集成測試
- [ ] Phase 2 需求規劃已完成

---

## 🔗 快速鏈接

| 資源 | 位置 | 用途 |
|------|------|------|
| Aggregator 倉庫 | `<repo-url>` | 參考代碼 |
| 新項目初始化 | `NEW_PROJECT_SETUP_GUIDE.md` | 啟動指南 |
| API 規範 | `GAME_DEVELOPER_DASHBOARD_SPEC.md` | API 文檔 |
| 技術棧詳解 | `ARCHITECTURE_ANALYSIS.md #2` | 依賴列表 |
| 最佳實踐 | `ARCHITECTURE_ANALYSIS.md #6` | 開發規範 |
| 發展路線圖 | `GAME_DEVELOPER_DASHBOARD_SPEC.md #7` | 時間表 |

---

## 💬 反饋與改進

如有以下情況，請及時更新文檔：

- ✏️ 新增功能模組
- 🐛 發現文檔錯誤
- 🎯 添加新的最佳實踐
- 📊 更新技術決策
- 🔄 調整發展路線圖

**文檔維護責任**: Tech Lead 和所有核心開發者

---

## 📞 聯絡方式

- **技術支持**: @Tech Lead
- **產品相關**: @Product Manager
- **進度追蹤**: 項目管理工具 (Linear / Jira)
- **代碼 Review**: GitHub Pull Requests

---

**祝你的項目開發順利！🚀**

**最後更新**: 2026-03-31
**版本**: 1.0.0
