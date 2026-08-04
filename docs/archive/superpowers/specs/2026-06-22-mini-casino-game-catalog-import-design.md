# Mini Casino 遊戲目錄導入後台原型 — 設計文件

**日期**：2026-06-22  
**狀態**：已核准（方案 B）  
**範圍**：`src/types/game.ts` + `src/mocks/handlers/games.ts`

---

## 目標

以 Mini Casino 真實 28 款遊戲取代後台原型現有的假資料（20 款隨機名稱），讓遊戲管理模組的 mock 資料反映真實遊戲目錄。採方案 B：同步擴充 `Game` 型別，帶入遊戲數學參數欄位。

---

## 背景與限制

- Mini Casino 位於 `/Users/cooperfu/Desktop/Mini_Casino/`，**只讀，不改**。
- 資料源：`packages/shared/src/game-rules/*.ts`（每款一個檔案）。
- 商戶遊戲開關（`MerchantAccess.vue`）mock 不動；素材頁（`Assets.vue`）維持占位資料。
- `Games/Index.vue` 使用 `GameRow = Record<string, unknown>`，型別擴充不會 break 現有 view。

---

## 分類規則

| category | 遊戲 |
|---|---|
| `table` | baccarat, baccarat_p2p, dragon_tiger, niuniu, caribbean_poker, tuitongzi, pai_gow, mini_bj, video_poker |
| `instant` | crash, plinko, tower, mines, hilo, limbo, flip, wheel, pump, keno, dice, dice_size, color_guess, zoo, chicken, packs, three_pick, shoot_dragon_gate |
| `sport` | basketball |

---

## 型別變更（`src/types/game.ts`）

### category union

```ts
// 舊：'slot' | 'table' | 'live' | 'fishing'
// 新：
category: 'table' | 'instant' | 'sport'
```

### 新增欄位（全部 optional，避免破壞現有 consumers）

```ts
export interface Game {
  id: string
  name: string
  status: 'active' | 'inactive'
  version: string
  rtp: number
  activeUsers: number
  publishedAt: string
  category: 'table' | 'instant' | 'sport'
  description?: string
  // 以下為新增遊戲數學參數
  chipDenominations?: number[]
  minBet?: number
  maxBetRatio?: number
  betZoneCount?: number         // betZones.length，避免傳遞字串陣列型別複雜度
  singleBetOnly?: boolean
  payoutModel?: string
}

export interface GameFilter {
  status: 'active' | 'inactive' | undefined
  search: string
  category: Game['category'] | undefined
  page: number
  pageSize: number
}
```

---

## Mock 資料（`src/mocks/handlers/games.ts`）

### 完整 28 款遊戲定義

以靜態陣列取代目前的 `GAME_NAMES.map(...)` 動態生成。每款固定欄位：

| gameId | displayName | category | rtp | chips | minBet | maxBetRatio | betZoneCount | singleBetOnly | payoutModel |
|---|---|---|---|---|---|---|---|---|---|
| baccarat | 百家樂 | table | 98.9 | [10,50,100,500] | 10 | 0.30 | 5 | — | — |
| baccarat_p2p | 百家樂 P2P | table | 99.0 | [10,50,100,500] | 10 | 0.50 | 1 | — | — |
| dragon_tiger | 龍虎 | table | 96.6 | [10,50,100,500] | 10 | 0.30 | 12 | — | — |
| niuniu | 牛牛 | table | 97.0 | [10,50,100,500] | 10 | 0.30 | 4 | — | — |
| caribbean_poker | 加勒比海撲克 | table | 94.8 | [100,500,1000,5000] | 100 | 0.25 | 2 | — | — |
| tuitongzi | 推筒子 | table | 97.0 | [10,50,100,500] | 10 | 0.30 | 3 | — | — |
| pai_gow | 牌九 | table | 97.3 | [100,500,1000,5000] | 100 | 0.50 | 1 | — | — |
| mini_bj | 迷你21點 | table | 99.0 | [10,50,100,500] | 10 | 0.50 | 1 | — | — |
| video_poker | 視訊撲克 | table | 99.5 | [10,50,100,500] | 10 | 0.50 | 1 | — | — |
| crash | Crash | instant | 99.0 | [100,500,1000,5000] | 100 | 0.50 | 1 | — | — |
| plinko | Plinko | instant | 97.0 | [100,500,1000,5000] | 100 | 0.50 | 1 | — | — |
| tower | Tower | instant | 99.0 | [100,500,1000,5000] | 100 | 0.50 | 1 | — | — |
| mines | Mines | instant | 99.0 | [100,500,1000,5000] | 100 | 0.50 | 1 | — | — |
| hilo | HiLo | instant | 97.0 | [10,50,100,500] | 10 | 0.50 | 1 | — | — |
| limbo | Limbo | instant | 97.0 | [100,500,1000,5000] | 100 | 0.50 | 1 | — | — |
| flip | Flip | instant | 99.0 | [100,500,1000,5000] | 100 | 0.50 | 2 | — | — |
| wheel | Wheel | instant | 97.0 | [100,500,1000,5000] | 100 | 0.50 | 1 | — | — |
| pump | Pump | instant | 98.0 | [100,500,1000,5000] | 100 | 0.50 | 1 | — | — |
| keno | Keno | instant | 97.0 | [100,500,1000,5000] | 100 | 0.50 | 1 | — | — |
| dice | Dice | instant | 98.0 | [100,500,1000,5000] | 100 | 0.50 | 4 | — | — |
| dice_size | 大小 | instant | 97.2 | [100,500,1000,5000] | 100 | 0.50 | 3 | — | — |
| color_guess | 猜顏色 | instant | 97.0 | [100,500,1000,5000] | 100 | 0.50 | 4 | — | — |
| zoo | Zoo | instant | 98.0 | [100,500,1000,5000] | 100 | 0.50 | 6 | — | — |
| chicken | Chicken Road | instant | 99.0 | [100,500,1000,5000] | 100 | 0.50 | 1 | — | — |
| packs | Packs | instant | 97.0 | [10,50,100,500] | 10 | 0.30 | 1 | — | — |
| three_pick | Three Pick | instant | 97.0 | [100,500,1000,5000] | 100 | 0.50 | 1 | true | total_multiplier |
| shoot_dragon_gate | 射龍門 | instant | 97.0 | [10,50,100,500] | 20 | 0.50 | 2 | — | — |
| basketball | 籃球投籃機 | sport | 96.0 | [10,50,100,500] | 10 | 0.50 | 1 | — | — |

### 版本與狀態規則

- `version`：固定 `"1.0.0"`（prototype 不需假造隨機版本號）
- `status`：預設 `active`，保留 `inactive` 給少數展示用（可指定 1-2 款）
- `activeUsers`：保留 `faker.number.int` 隨機值（展示用，不需固定）
- `publishedAt`：保留 `faker.date.past` 隨機值（展示用）

### RTP 推算說明

| 推算基準 | 適用遊戲 |
|---|---|
| 規則檔直接有 `rtp` 欄位 | crash (99%), pump (98%), zoo (98%) |
| `houseEdge = 0.99` → rtp 99% | mines, tower, chicken |
| `targetHouseEdge: 0.04` → rtp 96% | basketball |
| 業界慣例估算 | 其餘 table / instant 遊戲 |

---

## 變更範圍

| 檔案 | 動作 |
|---|---|
| `src/types/game.ts` | category union 更新 + 新增 optional 欄位 |
| `src/mocks/handlers/games.ts` | 替換 mockGames 靜態定義 |
| 其他所有檔案 | **不動** |

---

## 不在範圍內

- `MerchantAccess.vue` mock（現有結構已支援 28 款）
- `Assets.vue` mock（維持占位資料）
- Math.vue 的 `/api/games/v2/math` endpoint（獨立資料，不相干）
- Mini Casino 任何檔案（只讀）
