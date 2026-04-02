# 博弈遊戲開發商的總控後台 - 技術規範書

**版本**: 1.0.0
**狀態**: 設計階段
**最後更新**: 2026-03-31
**目標發佈**: Phase 1 (核心功能)

---

## 目錄

1. [項目概述](#1-項目概述)
2. [系統架構](#2-系統架構)
3. [核心功能模組](#3-核心功能模組)
4. [數據結構定義](#4-數據結構定義)
5. [API 規範](#5-api-規範)
6. [前端實現規範](#6-前端實現規範)
7. [發展路線圖](#7-發展路線圖)

---

## 1. 項目概述

### 1.1 項目定位

本系統是一個**遊戲開發商管理系統**，面向遊戲開發廠商，提供：

- 🎮 **遊戲資產管理**: 遊戲版本、上線/下線、更新管理
- 📊 **營收數據監控**: 實時營收、玩家活躍度、轉化率分析
- 🎯 **玩家行為分析**: 玩家來源、留存率、消費習慣
- ⚠️ **風險控制**: 異常檢測、自動告警、防作弊
- 🔧 **服務配置**: API 密鑰、白名單、速率限制
- 💰 **財務對帳**: 交易記錄、分潤結算、發票管理

### 1.2 用戶角色

| 角色 | 描述 | 權限範圍 |
|------|------|---------|
| **CEO/Owner** | 遊戲公司老闆 | 財務數據、全局決策 |
| **Game Manager** | 遊戲運營管理者 | 遊戲發佈、上下線、配置 |
| **Data Analyst** | 數據分析師 | 報表查詢、數據導出 |
| **Tech Admin** | 技術管理員 | API 管理、系統設置 |
| **Finance Officer** | 財務人員 | 結算管理、發票開具 |

### 1.3 核心指標

| 指標 | 目標值 | 說明 |
|------|-------|------|
| API 響應時間 | < 200ms | P95 |
| 頁面加載時間 | < 2s | 首屏 |
| 數據查詢時間 | < 500ms | ClickHouse |
| 系統可用性 | 99.9% | 年度 SLA |
| 玩家活躍度更新 | < 5 分鐘 | 實時性 |

---

## 2. 系統架構

### 2.1 整體架構圖

```
┌─────────────────────────────────────────────────────────┐
│            遊戲開發商總控後台 (前台)                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Vue 3 SPA + TypeScript                            │  │
│  │ Naive UI + Tailwind CSS + Pinia                   │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                      │
                      │ REST API / HTTPS
                      │
┌─────────────────────────────────────────────────────────┐
│              後端服務 (未來交付)                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Golang/Node.js API Gateway                        │  │
│  │ ├─ Auth Service (認證)                            │  │
│  │ ├─ Game Service (遊戲管理)                        │  │
│  │ ├─ Analytics Service (數據分析)                  │  │
│  │ ├─ Finance Service (財務管理)                    │  │
│  │ └─ Risk Control Service (風控)                   │  │
│  └───────────────────────────────────────────────────┘  │
│                      │                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐          │
│  │PostgreSQL│  │ClickHouse│  │ Redis Cluster│         │
│  │(OLTP)    │  │ (OLAP)   │  │ (Cache)      │         │
│  └──────────┘  └──────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────┘
```

### 2.2 分層架構

```
┌─────────────────────────────────────────┐
│    Presentation Layer (views/)          │
│  - Dashboard                            │
│  - Games Management                     │
│  - Players Analytics                    │
│  - Finance & Settlement                 │
└─────────────────────────────────────────┘
          │              │
┌─────────┴──────────────┴─────────────────┐
│  Business Logic Layer (composables/)    │
│  - useGameManagement()                  │
│  - usePlayerAnalytics()                 │
│  - useFinanceReport()                   │
│  - useRiskControl()                     │
└─────────────────────────────────────────┘
          │              │
┌─────────┴──────────────┴─────────────────┐
│  Data Layer (stores/ + api/)            │
│  - Pinia Stores                         │
│  - API Calls                            │
│  - Data Caching                         │
└─────────────────────────────────────────┘
          │              │
┌─────────┴──────────────┴─────────────────┐
│  Mock Layer (mocks/)                    │
│  - MSW Handlers                         │
│  - FakerJS Data                         │
└─────────────────────────────────────────┘
```

---

## 3. 核心功能模組

### 3.1 Phase 1: 核心功能 (MVP)

#### 🟢 3.1.1 儀表板 (Dashboard)

**實時監控視圖**

```
┌──────────────────────────────────────────────┐
│ 儀表板                      [日期範圍] [刷新]  │
├──────────────────────────────────────────────┤
│                                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐     │
│  │ 活躍玩家 │  │ 今日營收 │  │ 周增長  │     │
│  │ 1,234  │  │ $5,000  │  │ +12.5% │     │
│  └─────────┘  └─────────┘  └─────────┘     │
│                                              │
│  ┌──────────────────────────────────────┐  │
│  │ 實時營收趨勢 (折線圖)                 │  │
│  │                                      │  │
│  │ ▁▂▃▄▅▆▇█ (時間序列)                │  │
│  └──────────────────────────────────────┘  │
│                                              │
│  ┌──────────────────────────────────────┐  │
│  │ 熱門遊戲 TOP 5                       │  │
│  │ 1. 遊戲 A - 500 活躍玩家             │  │
│  │ 2. 遊戲 B - 300 活躍玩家             │  │
│  │ ...                                  │  │
│  └──────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

**指標**:
- 總活躍玩家數
- 今日營收 (USD)
- 周增長率 (%)
- 在線人數實時值

#### 🟢 3.1.2 遊戲管理 (Game Management)

**功能列表**:
- ✅ 遊戲列表查詢 (搜索、排序、分頁)
- ✅ 遊戲上架/下架 (一鍵切換)
- ✅ 版本管理 (當前版本、升級版本)
- ✅ 基本信息編輯 (名稱、描述、RTP)
- ⏳ 配置截圖與宣傳圖
- ⏳ 遊戲分類管理

**頁面結構**:

```
┌──────────────────────────────────────────┐
│ 遊戲管理          [+ 新增遊戲] [導出]    │
├──────────────────────────────────────────┤
│ [搜索...] [篩選 ▼] [日期範圍]            │
├──────────────────────────────────────────┤
│ ID | 名稱     | 版本  | 玩家 | 狀態 | 操作 │
├──────────────────────────────────────────┤
│ 1  | 遊戲 A   | 1.2.3 | 500  | 🟢   | [...]│
│ 2  | 遊戲 B   | 1.1.0 | 300  | 🔴   | [...]│
│ ... (分頁)                                │
└──────────────────────────────────────────┘
```

#### 🟢 3.1.3 玩家分析 (Player Analytics)

**功能列表**:
- ✅ 玩家概況統計 (總數、新增、活躍)
- ✅ 玩家來源分析 (按渠道、地區、推廣員)
- ✅ 留存率報表 (1日、7日、30日)
- ✅ 消費分析 (充值、消費額、客單價)
- ⏳ 玩家細分群組

**指標體系**:

| 指標 | 定義 | 更新頻率 |
|------|------|---------|
| DAU | 日活躍用戶 | 實時 |
| WAU | 周活躍用戶 | 每小時 |
| MAU | 月活躍用戶 | 每天 |
| 新增玩家 | 今日註冊玩家 | 實時 |
| 次日留存 | D1 留存率 | 每天 |
| ARPU | 平均每用戶營收 | 每小時 |
| LTV | 生命週期價值 | 每周 |

#### 🟢 3.1.4 財務與結算 (Finance & Settlement)

**功能列表**:
- ✅ 日結算報表 (收入、分潤、手續費)
- ✅ 交易記錄查詢 (玩家充值、消費)
- ✅ 分潤計算與展示
- ✅ 發票管理 (生成、下載、查詢)
- ⏳ 對帳單對比

**財務流程**:

```
玩家消費 → 交易記錄 → 日清算 → 分潤計算 → 結算單 → 開具發票
```

### 3.2 Phase 2: 進階功能 (待擴展)

- 🔵 遊戲版本灰度發佈 (Canary Release)
- 🔵 A/B 測試管理
- 🔵 自定義報表生成
- 🔵 團隊權限管理
- 🔵 審計日誌 (Audit Log)

### 3.3 Phase 3: 高級功能 (未來計劃)

- 🟠 機器學習風控模型
- 🟠 實時推送通知 (WebSocket)
- 🟠 API 成本優化建議
- 🟠 玩家流失預警

---

## 4. 數據結構定義

### 4.1 核心實體

#### Game (遊戲)

```typescript
interface Game {
  id: string                  // UUID
  name: string               // 遊戲名稱
  description: string        // 遊戲描述
  status: 'active' | 'inactive'  // 狀態
  version: string           // 當前版本
  rtp: number              // RTP (Return to Player) %
  publishedAt: Date        // 發佈日期
  provider: string         // 提供商 ID
  coverImageUrl: string    // 封面圖
  metadata: {
    category: string       // 分類
    minBet: number        // 最小下注
    maxBet: number        // 最大下注
    maxLines: number      // 最大線數
  }
}
```

#### Player (玩家)

```typescript
interface Player {
  id: string               // UUID
  username: string        // 用戶名
  email: string          // 郵箱
  country: string        // 國家/地區
  currency: string       // 貨幣
  status: 'active' | 'inactive' | 'banned'
  joinedAt: Date        // 加入日期
  lastLoginAt: Date     // 最後登陸
  totalSpent: number    // 總消費金額
  totalWon: number      // 總獲獎金額
}
```

#### Transaction (交易記錄)

```typescript
interface Transaction {
  id: string                     // 交易 ID
  playerId: string              // 玩家 ID
  gameId: string                // 遊戲 ID
  type: 'bet' | 'win' | 'refund'  // 交易類型
  amount: number                // 金額
  currency: string              // 貨幣
  baseAmount: number            // 基準幣種金額
  status: 'pending' | 'completed' | 'failed'
  createdAt: Date              // 創建時間
  roundId: string              // 遊戲輪次 ID
  metadata: any                // 擴展信息
}
```

#### Settlement (結算單)

```typescript
interface Settlement {
  id: string                        // 結算 ID
  period: 'daily' | 'weekly' | 'monthly'  // 結算週期
  startDate: Date                   // 開始日期
  endDate: Date                     // 結束日期
  totalRevenue: number              // 總營收
  commissionRate: number            // 分潤比例 (%)
  commission: number                // 應付分潤
  fees: number                      // 平台費用
  payable: number                   // 應付款
  status: 'draft' | 'confirmed' | 'paid'
  invoiceId: string                 // 發票 ID
  createdAt: Date                   // 創建時間
  confirmedAt: Date | null          // 確認時間
}
```

### 4.2 ClickHouse 分析表

#### GameMetrics (遊戲指標)

```sql
CREATE TABLE game_metrics (
  date Date,
  gameId String,
  activeUsers UInt32,
  newPlayers UInt32,
  totalBets Decimal(18, 2),
  totalWins Decimal(18, 2),
  ggrAmount Decimal(18, 2),
  rtp Float32
) ENGINE = MergeTree
ORDER BY (date, gameId)
```

#### PlayerBehavior (玩家行為)

```sql
CREATE TABLE player_behavior (
  date Date,
  playerId String,
  gameId String,
  sessionCount UInt16,
  sessionDuration UInt32,
  totalBet Decimal(18, 2),
  totalWin Decimal(18, 2),
  lastLoginAt DateTime
) ENGINE = MergeTree
ORDER BY (date, playerId)
```

---

## 5. API 規範

### 5.1 認證 API

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}

HTTP/1.1 200 OK
{
  "code": 0,
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "1",
      "email": "admin@example.com",
      "role": "admin",
      "permissions": ["read:games", "write:games"]
    }
  }
}
```

### 5.2 遊戲 API

#### 獲取遊戲列表

```http
GET /api/games?page=1&limit=20&status=active&search=game

HTTP/1.1 200 OK
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": "game-1",
        "name": "遊戲 A",
        "status": "active",
        "version": "1.2.3",
        "activeUsers": 500
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50
    }
  }
}
```

#### 獲取遊戲詳情

```http
GET /api/games/{gameId}

HTTP/1.1 200 OK
{
  "code": 0,
  "data": {
    "id": "game-1",
    "name": "遊戲 A",
    "description": "描述...",
    "status": "active",
    "version": "1.2.3",
    "rtp": 95.5,
    "publishedAt": "2026-01-15T10:00:00Z"
  }
}
```

#### 更新遊戲狀態

```http
PATCH /api/games/{gameId}
Content-Type: application/json

{
  "status": "inactive"
}

HTTP/1.1 200 OK
{
  "code": 0,
  "data": {
    "id": "game-1",
    "status": "inactive"
  }
}
```

### 5.3 分析 API

#### 獲取儀表板數據

```http
GET /api/analytics/dashboard?startDate=2026-03-01&endDate=2026-03-31

HTTP/1.1 200 OK
{
  "code": 0,
  "data": {
    "summary": {
      "activeUsers": 1234,
      "todayRevenue": 5000.50,
      "weekGrowth": 12.5
    },
    "charts": {
      "revenueByDate": [...]
    }
  }
}
```

#### 玩家分析

```http
GET /api/analytics/players?gameId=game-1&period=7d

HTTP/1.1 200 OK
{
  "code": 0,
  "data": {
    "dau": 500,
    "retention_d1": 45.5,
    "retention_d7": 20.3,
    "arpu": 12.5,
    "topCountries": [
      { "country": "US", "count": 200 },
      { "country": "JP", "count": 150 }
    ]
  }
}
```

### 5.4 財務 API

#### 獲取結算報表

```http
GET /api/finance/settlements?startDate=2026-03-01&endDate=2026-03-31

HTTP/1.1 200 OK
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": "settlement-1",
        "period": "2026-03-01",
        "totalRevenue": 50000,
        "commission": 5000,
        "payable": 4800,
        "status": "confirmed"
      }
    ]
  }
}
```

---

## 6. 前端實現規範

### 6.1 目錄結構

```
src/
├── views/
│   ├── Dashboard/
│   │   └── Index.vue
│   ├── Games/
│   │   ├── Index.vue
│   │   ├── Detail.vue
│   │   └── Edit.vue
│   ├── Players/
│   │   ├── Index.vue
│   │   └── Detail.vue
│   ├── Finance/
│   │   ├── Settlements.vue
│   │   ├── Invoices.vue
│   │   └── Transactions.vue
│   └── Settings/
│       ├── General.vue
│       ├── ApiKeys.vue
│       └── Permissions.vue
│
├── composables/
│   ├── useGameManagement.ts
│   ├── usePlayerAnalytics.ts
│   ├── useFinanceReport.ts
│   └── useRiskControl.ts
│
├── types/
│   ├── game.ts
│   ├── player.ts
│   ├── transaction.ts
│   └── settlement.ts
│
├── stores/
│   ├── auth.ts
│   ├── game.ts
│   ├── analytics.ts
│   └── settings.ts
│
└── mocks/
    ├── handlers.ts
    ├── data/
    │   ├── games.ts
    │   ├── players.ts
    │   └── transactions.ts
```

### 6.2 組件命名規範

| 組件類型 | 命名約定 | 示例 |
|---------|---------|------|
| 頁面視圖 | PascalCase | `Dashboard.vue`, `GameDetail.vue` |
| 業務組件 | PascalCase | `GameCard.vue`, `PlayerTable.vue` |
| 通用組件 | PascalCase | `DateRangePicker.vue`, `StatCard.vue` |
| Composable | camelCase | `useGameManagement.ts` |
| Type | PascalCase | `Game.ts`, `Player.ts` |
| Store | camelCase | `auth.ts`, `game.ts` |

### 6.3 TypeScript 規範

```typescript
// ✅ 推薦
export interface GameFilter {
  status?: 'active' | 'inactive'
  search?: string
  page?: number
  limit?: number
}

export type GameStatus = 'active' | 'inactive' | 'maintenance'

// ❌ 禁止
interface game {  // 小寫開頭
  status: any    // 使用 any
}
```

### 6.4 組件規範

```vue
<template>
  <div class="space-y-4">
    <PageHeader title="遊戲管理" />

    <PageFilterBar v-model="filters" />

    <n-data-table
      :columns="columns"
      :data="games"
      :loading="loading"
      :pagination="pagination"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameManagement } from '@/composables/useGameManagement'
import PageHeader from '@/components/PageHeader.vue'
import PageFilterBar from '@/components/PageFilterBar.vue'

// 邏輯全部在 composable 中
const { games, loading, filters, pagination, updateFilter } = useGameManagement()

const columns = computed(() => [
  { title: '遊戲名稱', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
  { title: '狀態', key: 'status' },
  { title: '操作', key: 'actions', render: (row) => renderActions(row) }
])
</script>
```

---

## 7. 發展路線圖

### 🟢 Phase 1: MVP (Core Features)

**預計完成**: 2026-Q2

```
Week 1-2: 項目初始化
├─ 環境搭建
├─ 基礎 Mock API 編寫
└─ 登陸頁面實現

Week 3-4: 儀表板
├─ 儀表板佈局
├─ 實時數據加載
└─ 圖表集成

Week 5-6: 遊戲管理
├─ 遊戲列表
├─ 遊戲上架/下架
└─ 版本管理

Week 7-8: 玩家分析
├─ 玩家概況
├─ 留存率報表
└─ 消費分析

Week 9-10: 財務結算
├─ 結算報表
├─ 交易記錄
└─ 發票管理

Week 11-12: 測試 & 優化
├─ 功能測試
├─ 性能優化
└─ 文檔完善
```

### 🔵 Phase 2: 進階功能

**預計完成**: 2026-Q3

- [ ] 版本灰度發佈
- [ ] A/B 測試框架
- [ ] 自定義報表
- [ ] 團隊協作
- [ ] 審計日誌

### 🟠 Phase 3: 高級功能

**預計完成**: 2026-Q4

- [ ] 機器學習風控
- [ ] WebSocket 實時通知
- [ ] 成本優化建議
- [ ] 玩家流失預警

---

## 附錄 A: 常見指標計算公式

### A.1 營收相關

```
GGR (Gross Gaming Revenue) = 總下注 - 總獲獎
NGR (Net Gaming Revenue) = GGR - 退款

玩家應收 = NGR × 分潤比例 %
平台費用 = NGR × 費用比例 %
應付款 = 玩家應收 - 平台費用
```

### A.2 玩家相關

```
DAU (Daily Active Users) = 當日活躍玩家數

留存率(Dn) = (D+n 還在遊玩的玩家 / D 當日新增玩家) × 100%

ARPU = 總營收 / 總活躍玩家

LTV = 累計單玩家收益

轉化率 = 購買玩家 / 總訪問 × 100%
```

---

## 附錄 B: 安全與風控設計

### B.1 API 安全

```
所有 API 請求需要:
✅ HTTPS 加密
✅ JWT Token 驗證
✅ 速率限制 (Rate Limiting)
✅ 請求簽名驗證 (HMAC-SHA256)
✅ IP 白名單檢查 (可選)
```

### B.2 風控告警

```
監控指標:
📌 異常 RTP 檢測 (> 120% 或 < 70%)
📌 單玩家異常消費 (> 月平均 3 倍)
📌 API 錯誤率升高 (> 5%)
📌 請求延遲告警 (> 1000ms)
```

---

**文檔完成！祝開發順利 🚀**
