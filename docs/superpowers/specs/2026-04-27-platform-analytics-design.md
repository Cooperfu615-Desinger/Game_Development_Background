# 平台分析模組設計文件

**日期**：2026-04-27  
**狀態**：已核准，待實作  
**取代**：原「代理分析（Agents）」頁面骨架

---

## 一、背景與業務脈絡

### 業務鏈
```
遊戲開發商（我們）
    └── 聚合商（Aggregator）
            └── 遊戲平台 / 運營商（Platform / Operator）← 本模組主角
                    └── 代理（Agent）← 玩家欄位，非獨立實體
                            └── 玩家（Player）
```

- 我們不直接管理代理，代理資訊由聚合商回傳的注單資料中的 `agentId` 欄位提供
- 同一代理可能同時掛在多個聚合商底下，因此頁面以「聚合商視角下的平台」為篩選維度
- 部分遊戲平台（如：老子有錢、星城 ONLINE）**沒有代理系統**，此類平台的玩家資料不顯示 AgentID 欄位
- 初期第一個接入平台為同集團自家產品，預設顯示「自家聚合商」

---

## 二、頁面架構

### 路由
| 路徑 | 頁面 | 說明 |
|---|---|---|
| `/platforms` | `Index.vue` | 平台列表 |
| `/platforms/:id` | `Detail.vue` | 平台詳細 |
| `/agents` | redirect → `/platforms` | 向下相容舊路由 |

### 選單
- 名稱：`平台分析`（原「代理分析」）
- 路徑：`/platforms`
- Icon：沿用 `GroupsOutlined`

---

## 三、資料模型

### `Platform`（平台列表項目）
```typescript
interface Platform {
    id: string                        // 'plat-001'
    name: string                      // '自家平台'
    aggregatorId: string              // 'agg-001'
    aggregatorName: string            // '自家聚合商'
    hasAgentSystem: boolean           // 是否有代理系統
    status: 'active' | 'inactive'     // 對接狀態
    // 以下數字隨週期（週/月）切換
    playerCount: number               // 玩家總數（累計，不隨週期變動）
    activePlayers: number             // 活躍玩家（本期有投注行為）
    turnover: number                  // 流水（本期總投注額）
    ggr: number                       // GGR（本期遊戲毛利）
    jpCount: number                   // JP 觸發次數（本期）
    jpTotal: number                   // JP 派出總金額（本期）
}
```

### `PlatformStats`（詳細頁數字卡）
```typescript
interface PlatformStats {
    playerCount: number               // 玩家總數（累計）
    activePlayers: number             // 活躍玩家（本期）
    turnover: number                  // 流水（本期）
    ggr: number                       // GGR（本期）
    jpCount: number                   // JP 次數（本期）
    jpTotal: number                   // JP 總金額（本期）
    avgTurnoverPerPlayer: number      // 平均每玩家流水 = turnover ÷ activePlayers
    maxJpAmount: number               // 最大單筆 JP 金額（本期）
}
```

### `TrendPoint`（趨勢圖資料點）
```typescript
interface TrendPoint {
    date: string      // 'YYYY-MM-DD'
    turnover: number  // 當日流水
    ggr: number       // 當日 GGR
}
```

### `PlatformPlayer`（玩家列表項目）
```typescript
interface PlatformPlayer {
    playerId: string          // 聚合商回傳的玩家識別碼
    agentId: string | null    // 代理 ID；無代理系統平台為 null
    totalTurnover: number     // 累計流水（歷史）
    periodTurnover: number    // 本期流水（隨週/月切換）
    lastActiveAt: string      // 最後活躍時間（ISO 8601）
}
```

### Mock 初始資料（3 個平台）
| 平台 ID | 名稱 | 聚合商 | 有代理系統 |
|---|---|---|---|
| `plat-001` | 自家平台 | 自家聚合商（agg-001） | ✅ 有 |
| `plat-002` | 老子有錢 | 自家聚合商（agg-001） | ❌ 無 |
| `plat-003` | 星城 ONLINE | 自家聚合商（agg-001） | ❌ 無 |

---

## 四、API 端點（MSW Mock）

| Method | Path | 說明 |
|---|---|---|
| `GET` | `/api/platforms` | 平台列表，支援 `?aggregatorId=&period=week\|month` |
| `GET` | `/api/platforms/:id` | 單一平台基本資訊 |
| `GET` | `/api/platforms/:id/stats` | 詳細頁數字卡，支援 `?period=week\|month` |
| `GET` | `/api/platforms/:id/trend` | 趨勢圖資料，支援 `?period=week\|month` |
| `GET` | `/api/platforms/:id/players` | 玩家列表，支援 `?period=&search=&page=&limit=` |

---

## 五、列表頁（`/platforms`）

### 佈局
```
頁首：標題「平台分析」+ 聚合商 Selector + 週/月 Toggle
主體：平台卡片垂直排列（每個平台一張橫向寬卡）
```

### 卡片內容
- **左側**：平台名稱、狀態 Tag（對接中 / 未對接）、代理系統 Tag（有/無）
- **右側**：6 個數字並排（玩家總數、活躍玩家、流水、GGR、JP 次數、JP 總金額）+ 右箭頭

### 互動
- 聚合商 Selector 預設「自家聚合商」，切換後重新載入平台列表
- 週 / 月 Toggle 切換後所有卡片數字同步更新（玩家總數為累計值，不變）
- 整張卡片可點擊，進入 `/platforms/:id`

### 元件
```
views/Platforms/
├── Index.vue
└── components/
    └── PlatformCard.vue
```

---

## 六、詳細頁（`/platforms/:id`）

### 佈局（從上到下）
```
頁首：← 返回、平台名稱、狀態 Tag、代理系統 Tag、週/月 Toggle
第一層：8 個數字卡（2 列 × 4 欄）
第二層：流水趨勢圖
第三層：玩家列表（含搜尋框）
```

### 數字卡（共 8 個）
| 位置 | 卡片 |
|---|---|
| 第一列 | 玩家總數 / 活躍玩家 / 流水 / GGR |
| 第二列 | JP 次數 / JP 總金額 / 平均每玩家流水 / 最大單筆 JP |

### 趨勢圖
- 類型：雙折線（ECharts，`shallowRef` 模式）
- 資料：流水（藍色）＋ GGR（綠色）
- X 軸：本週 → 最近 7 天日期；本月 → 最近 30 天日期
- 隨 Toggle 重新載入資料

### 玩家列表
| 欄位 | 說明 |
|---|---|
| 玩家 ID | 聚合商回傳識別碼 |
| AgentID | **僅 `hasAgentSystem === true` 的平台顯示此欄** |
| 累計流水 | 歷史總計，不隨週期變動 |
| 本期流水 | 隨週 / 月 Toggle 連動 |
| 最後活躍時間 | 格式化顯示 |

- 搜尋框：依玩家 ID 模糊搜尋
- 分頁：每頁 20 筆
- AgentID 欄：`hasAgentSystem === false` 時整欄不渲染（非顯示「—」）

### 元件
```
views/Platforms/
├── Detail.vue
└── components/
    ├── PlatformStatCards.vue       # 8 個數字卡
    ├── PlatformTrendChart.vue      # 流水趨勢圖
    └── PlatformPlayerTable.vue     # 玩家列表
```

---

## 七、Composables

### `usePlatforms.ts`
- `platforms`：平台列表（ref）
- `loading`：載入狀態
- `selectedAggregatorId`：選中的聚合商（預設 `agg-001`）
- `period`：`'week' | 'month'`（預設 `'month'`）
- `fetchPlatforms()`：呼叫 `GET /api/platforms`

### `usePlatformDetail.ts`
- `platform`：平台基本資訊
- `stats`：詳細頁數字卡資料
- `trendData`：趨勢圖資料點陣列
- `players`：玩家列表
- `total`：玩家總筆數（分頁用）
- `period`：`'week' | 'month'`
- `search`：玩家 ID 搜尋關鍵字
- `page`：當前頁碼
- `loading*`：各區塊獨立 loading 狀態

---

## 八、異動清單

| 檔案 | 動作 |
|---|---|
| `src/router/index.ts` | 新增 `/platforms`、`/platforms/:id`；`/agents` redirect |
| `src/config/menu.ts` | 「代理分析」→「平台分析」，路徑改 `/platforms` |
| `src/types/platform.ts` | 新建：`Platform`、`PlatformStats`、`TrendPoint`、`PlatformPlayer` |
| `src/mocks/handlers/platforms.ts` | 新建：5 個 API endpoint + mock 資料 |
| `src/mocks/handlers/index.ts` | 加入 `platformHandlers` |
| `src/composables/usePlatforms.ts` | 新建 |
| `src/composables/usePlatformDetail.ts` | 新建 |
| `src/views/Platforms/Index.vue` | 新建 |
| `src/views/Platforms/Detail.vue` | 新建 |
| `src/views/Platforms/components/PlatformCard.vue` | 新建 |
| `src/views/Platforms/components/PlatformStatCards.vue` | 新建 |
| `src/views/Platforms/components/PlatformTrendChart.vue` | 新建 |
| `src/views/Platforms/components/PlatformPlayerTable.vue` | 新建 |
| `src/views/Agents/Index.vue` | 可保留或移除（路由 redirect 後不再直接訪問） |
