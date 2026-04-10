# Game Developer Dashboard — Design System

> 現代科幻風格，深色優先，面向遊戲運營人員的後台設計規範

---

## 1. 設計原則

| 原則 | 說明 |
|------|------|
| **數據優先** | 關鍵指標永遠在視覺焦點，用戶 3 秒內找到目標數據 |
| **科幻現代** | 霓虹藍為品牌色，帶光暈感邊框和數字動畫體現技術感 |
| **深色護眼** | 深藍黑底色系，長時間使用不疲勞，文字對比度 ≥ 4.5:1 |
| **層級清晰** | 用顏色明度和字號區分主次，避免信息噪音 |

---

## 2. 配色方案

### 主色（Neon Cyan）
| Token | HEX | RGB | Tailwind Class | 用途 |
|-------|-----|-----|----------------|------|
| `primary-300` | `#33DDFF` | `51, 221, 255` | `text-primary-300` | 懸停高亮 |
| `primary-400` | `#00D4FF` | `0, 212, 255` | `text-primary-400` | 品牌主色、連結、重點數字 |
| `primary-500` | `#00AACC` | `0, 170, 204` | `text-primary-500` | 按鈕背景、強調 |
| `primary-600` | `#007A99` | `0, 122, 153` | `text-primary-600` | 按鈕懸停 |
| `primary-900` | `#001A26` | `0, 26, 38` | `bg-primary-900` | 深色強調背景 |

### 強調色（Electric Purple）
| Token | HEX | Tailwind Class | 用途 |
|-------|-----|----------------|------|
| `accent-400` | `#C084FC` | `text-accent-400` | 次要強調、圖表色 |
| `accent-500` | `#A855F7` | `text-accent-500` | 強調按鈕、特殊標籤 |
| `accent-600` | `#9333EA` | `text-accent-600` | 強調懸停 |

### 狀態色
| 狀態 | Token | HEX | Tailwind Class | 含義 |
|------|-------|-----|----------------|------|
| 上架/正常 | `status-online` | `#10B981` | `text-status-online` | 運行中、可用 |
| 下架/停用 | `status-offline` | `#6B7280` | `text-status-offline` | 停用、下架 |
| 異常/錯誤 | `status-error` | `#EF4444` | `text-status-error` | 錯誤、異常 |
| 進行中/待審 | `status-pending` | `#F59E0B` | `text-status-pending` | 處理中、待審核 |
| 信息/排程 | `status-info` | `#3B82F6` | `text-status-info` | 信息、排程 |

### 中性色（深色主題）
| Token | HEX | 用途 |
|-------|-----|------|
| `neutral-50` | `#E8F4FD` | 主要文字（白偏藍） |
| `neutral-200` | `#B8D0E8` | 次要文字 |
| `neutral-400` | `#8FA3BE` | 輔助文字、佔位符 |
| `neutral-600` | `#4A6080` | 禁用文字 |
| `neutral-800` | `#1A2236` | 卡片背景（elevated） |
| `neutral-850` | `#141B2D` | 卡片背景（base） |
| `neutral-900` | `#0F1525` | 頁面背景（surface） |
| `neutral-950` | `#0A0E1A` | 最深背景（base） |

### 背景層級
```
Layer 0: #0A0E1A  →  最底層（body 背景）
Layer 1: #0F1525  →  側邊欄、頂欄
Layer 2: #141B2D  →  卡片、模塊
Layer 3: #1A2236  →  懸浮卡片、下拉菜單
Layer 4: #1E2740  →  tooltip、彈窗
```

### 邊框色
| Token | HEX / 透明度 | 用途 |
|-------|-------------|------|
| `border-subtle` | `#152540` | 分隔線 |
| `border-default` | `#1E3054` | 卡片邊框 |
| `border-strong` | `#2A4270` | 強調邊框 |
| `border-glow` | `rgba(0,212,255,0.3)` | 霓虹光暈邊框 |
| `border-accent-glow` | `rgba(168,85,247,0.3)` | 紫色光暈邊框 |

### 圖表顏色集（ECharts）
```js
chartColors: [
  '#00D4FF', // neon cyan
  '#A855F7', // electric purple
  '#10B981', // emerald green
  '#F59E0B', // amber
  '#EF4444', // red
  '#3B82F6', // blue
  '#EC4899', // pink
  '#14B8A6', // teal
]
```

---

## 3. 排版系統

### 字體
```css
font-family: 'Inter', 'Noto Sans TC', system-ui, -apple-system, sans-serif;
font-family-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
```
- **Inter**：正文、UI 標籤，現代感強
- **Noto Sans TC**：繁體中文，與 Inter 相容
- **JetBrains Mono**：數字、代碼、API Key（等寬讓數字對齊）

### 字號階梯
| Token | Size | Line Height | Weight | 用途 |
|-------|------|-------------|--------|------|
| `text-display` | `36px / 2.25rem` | `1.2` | `700` | 大數字指標 |
| `text-h1` | `28px / 1.75rem` | `1.3` | `700` | 頁面標題 |
| `text-h2` | `22px / 1.375rem` | `1.4` | `600` | 模塊標題 |
| `text-h3` | `18px / 1.125rem` | `1.4` | `600` | 卡片標題 |
| `text-h4` | `15px / 0.9375rem` | `1.5` | `600` | 小標題 |
| `text-body` | `14px / 0.875rem` | `1.6` | `400` | 正文 |
| `text-sm` | `13px / 0.8125rem` | `1.5` | `400` | 輔助文字 |
| `text-xs` | `12px / 0.75rem` | `1.4` | `400` | 標籤、徽章 |
| `text-mono` | `13px / 0.8125rem` | `1.5` | `500` | 數字、代碼 |

### 數字排版特殊樣式
```css
/* 統計數字 — 大、醒目 */
.stat-number {
  font-size: 2.25rem;
  font-weight: 700;
  font-family: 'JetBrains Mono';
  letter-spacing: -0.02em;
  color: #E8F4FD;
}

/* 金額 — 帶幣別符號 */
.amount-value {
  font-family: 'JetBrains Mono';
  font-variant-numeric: tabular-nums;
}

/* 百分比趨勢 */
.trend-up   { color: #10B981; }
.trend-down { color: #EF4444; }
.trend-flat { color: #8FA3BE; }
```

---

## 4. 間距與柵格

### 間距系統（4px 基準）
```
space-1  =  4px   卡片內細間距
space-2  =  8px   元素間緊湊間距
space-3  =  12px  標籤、按鈕內邊距
space-4  =  16px  標準元素間距
space-5  =  20px  卡片內邊距（緊）
space-6  =  24px  卡片內邊距（標準）
space-8  =  32px  模塊間距
space-10 =  40px  大區塊間距
space-12 =  48px  頁面頂部間距
```

### 柵格系統
| 視窗 | 斷點 | 欄數 | Gap | 用途 |
|------|------|------|-----|------|
| 手機 | `< 768px` | 1 | 16px | 緊急訪問 |
| 平板 | `768px+` | 2 | 20px | 基本操作 |
| 筆電 | `1024px+` | 3 | 24px | 標準使用 |
| 桌面 | `1366px+` | 4 | 24px | 完整功能 |
| 大屏 | `1920px+` | 4-6 | 32px | 數據展示 |

### Dashboard Widget 布局規則
```
大卡片 (span-2)：核心指標、主趨勢圖
中卡片 (span-1)：次要統計、排行榜
小卡片 (span-1/2)：狀態指示、快速操作

平板模式：大卡片自動 span 全寬
手機模式：所有卡片堆疊為單列
```

---

## 5. 組件規範

### Button
```
Size     Height  Padding(H)  Font
lg       44px    24px        15px/600
md       36px    20px        14px/500
sm       30px    16px        13px/500
xs       24px    12px        12px/500

Variant     Background          Border              Text
primary     #00D4FF → #00AACC   none                #0A0E1A (dark)
secondary   transparent         border-glow         #00D4FF
danger      #EF444420           #EF444450           #EF4444
ghost       transparent         border-default      neutral-200
```

### Card / Widget
```
border-radius:   12px
background:      #141B2D
border:          1px solid #1E3054
padding:         24px
box-shadow:      0 4px 24px rgba(0,0,0,0.4)

hover:
  border-color:  rgba(0,212,255,0.3)
  box-shadow:    0 4px 32px rgba(0,212,255,0.08)
```

### StatCard（統計卡片）
```
結構：
┌─────────────────────────────┐
│  [icon]  標題文字     [trend]│
│                             │
│  2,847,293                  │  ← stat-number
│  ▲ 12.4%  vs 上月           │  ← TrendValue
└─────────────────────────────┘

高度：120px（固定）
```

### Tag / StatusBadge
```
上架     bg:#10B98120  border:#10B98150  text:#10B981
下架     bg:#6B728020  border:#6B728050  text:#9CA3AF
異常     bg:#EF444420  border:#EF444450  text:#EF4444
待審核   bg:#F59E0B20  border:#F59E0B50  text:#F59E0B
信息     bg:#3B82F620  border:#3B82F650  text:#3B82F6
```

### Table
```
行高：              48px
斑馬紋：            odd: transparent / even: rgba(255,255,255,0.02)
hover：             background: rgba(0,212,255,0.05)
頭部背景：          #1A2236
頭部文字：          neutral-400, 12px, uppercase, letter-spacing:0.05em
分隔線：            border-bottom: 1px solid #152540
```

### Modal / Drawer
```
背景遮罩：       rgba(0,0,0,0.7) + backdrop-blur(4px)
Modal 背景：     #141B2D
Modal 邊框：     1px solid #2A4270
Drawer 背景：    #0F1525
Drawer 邊框：    1px solid #1E3054 (left side only)
border-radius：  Modal: 16px / Drawer: 0
```

---

## 6. 動畫規範

### 時間函數
```css
--ease-snappy:  cubic-bezier(0.4, 0, 0.2, 1)   /* 標準 UI 過渡 */
--ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1) /* 彈性彈出 */
--ease-gentle:  cubic-bezier(0.25, 0.46, 0.45, 0.94) /* 緩入緩出 */
```

### 標準時長
```
instant:   0ms     無需動畫的邏輯切換
micro:     100ms   按鈕按壓、checkbox
fast:      150ms   顏色、背景過渡
base:      200ms   懸停效果、淡入
medium:    300ms   卡片、下拉展開
slow:      500ms   頁面切換、modal
number:    800ms   數字滾動動畫
```

### 頁面載入：漸入序列
```css
/* 內容從上到下依次出現 */
.animate-in {
  animation: fadeSlideIn 300ms ease-out both;
}
.animate-in:nth-child(1) { animation-delay: 0ms; }
.animate-in:nth-child(2) { animation-delay: 60ms; }
.animate-in:nth-child(3) { animation-delay: 120ms; }
/* ... 每個子元素延遲 60ms */

@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

### 數字滾動
```
使用 CountUp.js 或自訂 composable
時長：800ms，ease-out
從 0 計到目標值（或從舊值計到新值）
```

### 卡片懸停光暈
```css
.glow-card:hover {
  box-shadow:
    0 4px 32px rgba(0, 212, 255, 0.08),
    0 0 0 1px rgba(0, 212, 255, 0.2);
  transition: all 200ms ease;
}
```

---

## 7. 響應式設計

### Dashboard Widget 堆疊規則
```
1920px+  → grid-cols-4  主圖表 col-span-2
1366px   → grid-cols-4  主圖表 col-span-2
1024px   → grid-cols-2  主圖表 col-span-2（全寬）
768px    → grid-cols-2  主圖表 col-span-2（全寬）
< 768px  → grid-cols-1  全部單列
```

### 表格響應式
```
≥1024px：顯示所有欄位
768-1023px：隱藏次要欄（排名、備注）
< 768px：卡片模式（每列轉為卡片）
```

### Sidebar 響應式
```
≥1024px：固定展開（240px）
768-1023px：懸浮模式（可展開/收起）
< 768px：底部導航欄（Tab Bar）
```

---

## 8. WCAG 對比度

| 前景 | 背景 | 比例 | 等級 |
|------|------|------|------|
| `#E8F4FD` | `#141B2D` | 12.1:1 | AAA |
| `#00D4FF` | `#141B2D` | 8.2:1 | AAA |
| `#8FA3BE` | `#141B2D` | 4.8:1 | AA |
| `#10B981` | `#141B2D` | 5.1:1 | AA |
| `#EF4444` | `#141B2D` | 5.3:1 | AA |
| `#F59E0B` | `#141B2D` | 6.1:1 | AA |
