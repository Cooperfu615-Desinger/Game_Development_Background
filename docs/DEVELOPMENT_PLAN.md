# 開發計劃
# 博弈遊戲開發商的總控後台

**開始日期**: 2026-04-02
**目標交付**: Phase 1 完整前台原型
**開發模式**: 單人 + Claude Code 協作

---

## 整體進度概覽

```
Week 1  [架構]   ████████░░  環境、路由、佈局、登入
Week 2  [儀板]   ░░░░░░░░░░  Dashboard + ECharts
Week 3  [遊戲]   ░░░░░░░░░░  遊戲管理模組
Week 4  [玩家]   ░░░░░░░░░░  玩家分析模組
Week 5  [財務]   ░░░░░░░░░░  財務結算模組
Week 6  [設置]   ░░░░░░░░░░  系統設置 + 收尾
```

---

## Week 1：架構搭建

> 目標：從 Aggregator 改造出乾淨的基礎架構，npm run dev 可看到完整框架

### Day 1-2：環境準備

- [ ] 基於 Aggregator 建立新專案資料夾
- [ ] 清除 Master/Merchant 雙後台相關代碼
- [ ] 確認 npm install 成功、npm run dev 正常啟動
- [ ] 確認 TypeScript、Tailwind、Naive UI 正常運作

### Day 3-4：路由與佈局

- [ ] 重構 `src/router/index.ts`（新路由結構）
- [ ] 建立 `src/layouts/MainLayout.vue`（統一側邊欄 + 頂部欄）
- [ ] 建立 `src/layouts/AppMenu.vue`（動態菜單 + 路由同步）
- [ ] 確認 Sidebar active-key 隨路由變化正確高亮

### Day 5-6：認證 + Pinia

- [ ] 建立 `src/stores/auth.ts`（登入狀態、Token 管理）
- [ ] 建立 `src/views/Auth/Login.vue`（登入表單）
- [ ] 設定路由守衛（requiresAuth）
- [ ] 確認登入 → 跳轉 → 登出完整流程

### Day 7：MSW 與基礎 Mock

- [ ] 確認 MSW 在開發環境啟動（console 顯示 [MSW] active）
- [ ] 建立 `src/mocks/handlers/index.ts`（統一匯出）
- [ ] 建立 `src/mocks/handlers/auth.ts`（登入 API Mock）
- [ ] 建立 `src/mocks/handlers/dashboard.ts`（Dashboard API Mock）

### Week 1 驗收標準

```
✅ npm run dev 無報錯
✅ 訪問 / 自動跳轉到 /login
✅ 登入後跳轉到 /dashboard（顯示空白頁面即可）
✅ 側邊菜單顯示所有功能入口
✅ 登出功能正常
✅ MSW active 顯示在瀏覽器 console
```

---

## Week 2：Dashboard 儀表板

> 目標：完整的儀表板頁面，含統計卡片、趨勢圖、熱門遊戲

### 功能清單

- [ ] 四個統計卡片（活躍玩家、今日營收、周增長率、在線人數）
- [ ] 營收趨勢折線圖（ECharts，可切換日/周/月）
- [ ] 熱門遊戲 TOP 5 排行（含玩家數、營收佔比）
- [ ] 玩家來源分佈圓餅圖
- [ ] 頁面自動刷新機制（5 分鐘 interval）

### 組件拆分

```
views/Dashboard/Index.vue
  ├── components/StatCard.vue        (四個指標卡片)
  ├── components/RevenueTrendChart.vue  (ECharts 折線圖)
  ├── components/TopGamesTable.vue    (熱門遊戲排行)
  └── components/PlayerSourceChart.vue  (來源圓餅圖)
```

### Composable

```
composables/useDashboard.ts
  - stats: 統計卡片數據
  - revenueChart: 圖表 option
  - topGames: 熱門遊戲列表
  - autoRefresh: 5 分鐘自動刷新
```

### Mock API

```
GET /api/dashboard/stats   → 四個指標數字
GET /api/dashboard/revenue?period=7d  → 圖表數據
GET /api/dashboard/top-games  → 熱門遊戲列表
```

### Week 2 驗收標準

```
✅ 四個統計卡片顯示正確數字
✅ 趨勢圖表可切換時間範圍
✅ 熱門遊戲排行正確排序
✅ 頁面載入時有 loading 狀態
✅ Dashboard Widget 固定高度，不因數據改變而跳動
```

---

## Week 3：遊戲管理模組

> 目標：完整的遊戲管理頁面，含列表、詳情、上下架

### 功能清單

- [ ] 遊戲列表頁（搜索、狀態篩選、排序、分頁）
- [ ] 遊戲狀態一鍵切換（上架/下架 toggle，含確認對話框）
- [ ] 遊戲詳情抽屜（不跳轉頁面，右側滑出）
- [ ] 遊戲基本信息編輯（名稱、RTP、描述）
- [ ] CSV 導出功能
- [ ] 批量操作（選取多個遊戲後批量上架/下架）

### 組件拆分

```
views/Games/Index.vue
  ├── components/GameFilterBar.vue   (搜索 + 篩選)
  ├── components/GameTable.vue       (n-data-table)
  ├── components/GameDetailDrawer.vue  (詳情側抽屜)
  └── components/GameEditModal.vue   (編輯彈窗)
```

### TypeScript 型別

```typescript
// types/game.ts
interface Game {
  id: string
  name: string
  status: 'active' | 'inactive'
  version: string
  rtp: number
  activeUsers: number
  publishedAt: string
}
```

### Mock API

```
GET  /api/games?status&search&page&limit  → 列表（分頁）
GET  /api/games/:id                       → 單一詳情
PATCH /api/games/:id                      → 更新（狀態/資訊）
```

### Week 3 驗收標準

```
✅ 列表支援搜索、篩選、排序、分頁
✅ 上架/下架有確認對話框
✅ 詳情從右側滑出（不跳頁）
✅ 篩選條件同步到 URL Query
✅ 空狀態有友善提示
✅ CSV 導出含所有欄位
```

---

## Week 4：玩家分析模組

> 目標：玩家數據分析頁面，含概況、留存、消費分佈

### 功能清單

- [ ] 玩家概況（DAU/WAU/MAU 趨勢圖）
- [ ] 留存率報表（D1、D7、D30）
- [ ] 消費分析（ARPU、充值金額分佈直方圖）
- [ ] 玩家來源地圖（按國家/地區）
- [ ] 玩家列表查詢（支援 PlayerID、用戶名搜索）
- [ ] 玩家詳情（單一玩家的遊戲記錄、充值記錄）

### 組件拆分

```
views/Players/Index.vue        (概況 + 留存)
views/Players/List.vue         (玩家列表)
views/Players/Detail.vue       (單一玩家詳情)
  ├── components/RetentionChart.vue
  ├── components/ArpuChart.vue
  └── components/PlayerTable.vue
```

### Mock API

```
GET /api/analytics/overview?period=7d  → DAU/WAU/MAU
GET /api/analytics/retention           → 留存率資料
GET /api/analytics/arpu               → ARPU 趨勢
GET /api/players?search&country&page  → 玩家列表
GET /api/players/:id                  → 玩家詳情
```

### Week 4 驗收標準

```
✅ 所有圖表正常顯示（ECharts）
✅ 留存率可按遊戲篩選
✅ 玩家列表支援搜索與分頁
✅ 玩家詳情顯示完整交易記錄
```

---

## Week 5：財務結算模組

> 目標：財務報表頁面，含結算、交易記錄、發票

### 功能清單

- [ ] 結算報表列表（日/周/月結算，可按時間範圍查詢）
- [ ] 結算詳情（收入、分潤、手續費明細）
- [ ] 交易記錄查詢（支援 BetID、PlayerID、時間區間、幣別）
- [ ] 發票列表（狀態追蹤：草稿/確認/已付款）
- [ ] 發票詳情與下載（PDF 格式）
- [ ] 月財務匯總圖表

### 組件拆分

```
views/Finance/Settlements.vue   (結算報表)
views/Finance/Transactions.vue  (交易記錄)
views/Finance/Invoices.vue      (發票管理)
  ├── components/SettlementCard.vue
  ├── components/TransactionTable.vue
  └── components/InvoiceStatusBadge.vue
```

### Mock API

```
GET /api/finance/settlements?startDate&endDate  → 結算列表
GET /api/finance/settlements/:id               → 結算詳情
GET /api/finance/transactions?...              → 交易記錄
GET /api/finance/invoices                      → 發票列表
GET /api/finance/invoices/:id/download         → PDF 下載
```

### Week 5 驗收標準

```
✅ 結算報表支援日期範圍篩選
✅ 交易記錄支援多維度搜索
✅ 金額計算使用 big.js
✅ 發票狀態有正確顯示
✅ CSV 導出功能正常
```

---

## Week 6：系統設置 + 收尾

> 目標：設置頁面完成 + 全體測試 + 交付準備

### 功能清單

- [ ] API 密鑰管理（生成、重置、複製）
- [ ] IP 白名單設定
- [ ] 帳號權限管理（角色列表、權限設定）
- [ ] 系統通知設置
- [ ] 語言切換（繁體中文 / English）

### 收尾工作

- [ ] 全站 TypeScript 零錯誤（`npm run type-check`）
- [ ] 所有頁面測試（Chrome + Firefox + Safari）
- [ ] 整理 Mock API 文檔（給後端夥伴）
- [ ] 更新 `DEVELOPMENT_NOTES.md`
- [ ] 準備交付說明文檔

### Week 6 驗收標準

```
✅ npm run build 成功
✅ 所有 Phase 1 功能完成
✅ 無 TypeScript 錯誤
✅ Mock API 文檔完整
✅ 部署到 Vercel 可訪問
✅ 交付文檔已準備
```

---

## 進度追蹤

> 每完成一個 Week，在下方填寫完成日期與備注

| Phase | 開始 | 完成 | 備注 |
|-------|------|------|------|
| Week 1 架構 | 2026-04-02 | — | |
| Week 2 Dashboard | — | — | |
| Week 3 遊戲管理 | — | — | |
| Week 4 玩家分析 | — | — | |
| Week 5 財務結算 | — | — | |
| Week 6 收尾交付 | — | — | |

---

## 交付物清單

交付給前後端夥伴時，需提供：

```
□ 前台源代碼（Vue SPA）
□ Mock API 文檔（每個 endpoint 的 request/response 格式）
□ 數據結構文檔（TypeScript types）
□ 環境變數說明（.env.example）
□ 本地啟動指南（README 更新）
□ Vercel 部署連結（線上 Demo）
```
