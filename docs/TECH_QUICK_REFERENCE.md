# 技術快速查閱

> 更新日期：2026-08-04
> 適用範圍：Provider Portal 原型

本文件只整理目前實際使用的前端工具與工作方式。產品責任邊界請以 `docs/handoff/` 與最新 Provider 規格為準。

## 1. 技術棧

| 類別 | 技術 |
|---|---|
| Framework | Vue 3.5 + TypeScript |
| Build | Vite 7 |
| UI | PrimeVue 4、PrimeIcons、`@primeuix/themes` |
| CSS | Tailwind CSS 3、`tailwindcss-primeui` |
| State | Pinia 3、`pinia-plugin-persistedstate` |
| Router | Vue Router 4，Hash history |
| i18n | Vue I18n 11，主要語系為 zh-TW |
| Charts | ECharts / vue-echarts、Chart.js / PrimeVue Chart |
| Mock | MSW 2、faker |
| Utility | `big.js`、`date-fns`、VueUse |
| Deploy | GitHub Pages，GitHub Actions |

`package.json` 的 package name 仍是歷史名稱 `aggregator-core`，不代表目前產品定位；若要修改需另立版本變更。

## 2. 常用命令

```bash
npm install
npm run dev
npm run build
npm run type-check
npm run preview
```

目前沒有獨立 lint 或 unit test script。文件或原型變更至少執行：

```bash
npm run build
npm run type-check
```

## 3. 目錄結構

```text
src/
├── api/             舊版 API 型別或服務
├── assets/          靜態資源
├── components/      共用 UI 與圖表元件
├── composables/     頁面資料與業務邏輯
├── config/          導覽與應用設定
├── layouts/         MainLayout、Sakai layout
├── locales/         zh-TW 翻譯
├── mocks/            MSW browser、handlers、mock data
├── plugins/          PrimeVue 等 plugin 初始化
├── router/           Vue Router 與 portal route factory
├── services/         apiClient、mock auth
├── stores/           Pinia stores
├── styles/           全域樣式
├── types/            TypeScript 型別
├── utils/            共用工具
└── views/            頁面 view
```

文件：

```text
docs/
├── GGAP_final_system_spec_tech.html  GGAP 平台外部規格
├── PROJECT_TRANSFER_INDEX.md         文件入口
├── TECH_QUICK_REFERENCE.md           本文件
├── handoff/                          現行工程交接
└── archive/                          歷史文件備查
```

## 4. PrimeVue 使用方式

元件依目前專案模式在頁面中使用；新增頁面請優先採用 PrimeVue，不要引入已封存文件中的 Naive UI 寫法。

```vue
<script setup lang="ts">
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
</script>

<template>
  <DataTable :value="rows" paginator :rows="20">
    <Column field="game_name" header="遊戲" sortable />
    <Column field="bet_points" header="投注點數" />
  </DataTable>
  <InputText v-model="search" />
  <InputNumber v-model="amount" />
  <Select v-model="selected" :options="options" option-label="label" option-value="value" />
  <Tag value="已上架" severity="success" />
  <Button label="儲存" severity="primary" />
  <Dialog v-model:visible="visible" modal header="詳情">內容</Dialog>
</template>
```

## 5. API client

```ts
import { api } from '@/services/apiClient'

const games = await api.get<GameRow[]>('/api/provider/v1/games')
await api.patch('/api/provider/v1/games/game-001', { status: 'published' })
```

目前 `api` 支援：`get`、`post`、`put`、`patch`、`del`。

- 自動從 `authStore.token` 附加 bearer token。
- JSON body 自動序列化。
- 非 2xx 拋出錯誤。
- 回應直接解析 JSON，不自動包裝 `{ code, data }`。
- `/api/provider/v1/*` 目前是 Provider API 草案；實際 mock 仍有許多舊 `/api/*` 路徑。

新增頁面請優先使用 `api.*`，不要直接使用 `fetch`。若暫時必須直接呼叫，需在 handoff 文件記錄，並在真後端接入前完成遷移。

## 6. Provider 資料使用原則

- 不在前端建立 Provider 以外的代理商、商戶或會員主檔。
- Game Round 是遊戲紀錄主體，不建立 Game Session 導覽。
- 點數與 USDT 使用字串或 decimal 處理，避免 JavaScript 浮點誤差。
- 報表主要顯示遊戲商點數，同時保留 USDT 展開與匯出欄位。
- 金額計算使用 `big.js`。
- 時間統計預設使用 `settled_at`；`started_at` 可為空。

```ts
import Big from 'big.js'

const averageBet = new Big(totalBetPoints).div(betCount || 1).toFixed(2)
const perPlayerBet = new Big(totalBetPoints).div(playerCount || 1).toFixed(2)
```

## 7. 狀態與互動

列表頁應具備：

- loading 狀態
- empty 狀態
- error / retry 狀態
- 分頁、排序與篩選
- 需要變更時的確認與成功 / 失敗通知

遊戲狀態、Game Round 狀態、通知已讀狀態等應使用明確的 union type，不要在頁面散落任意字串。

```ts
export type GameStatus = 'draft' | 'published' | 'unpublished' | 'maintenance' | 'retired'
export type GameType = 'slots' | 'crash' | 'table'
export type RoundStatus = 'settled' | 'cancelled' | 'rollback'
```

以上 Provider 狀態名稱仍需與後端確認後才可視為正式契約。

## 8. 路由與導覽

目前路由與 `src/config/menu-sakai.ts` 仍是舊版三 Portal 原型。下一階段目標導覽為：

```text
總覽
遊戲管理
數據與報表
遊戲商財務
遊戲監控與風控
GGAP 對接
通知中心
官網管理
系統設定
```

調整導覽時，頁面可以先使用空白或佔位內容，但路由名稱、權限 key、文件說明要同步更新。

## 9. Mock API

MSW handler 位於 `src/mocks/handlers/`，共用註冊在 `src/mocks/handlers/index.ts`。

```ts
import { http, HttpResponse } from 'msw'

export const providerHandlers = [
  http.get('/api/provider/v1/games', () => {
    return HttpResponse.json([])
  }),
]
```

Mock 只用於展示載入、篩選、分頁與互動。它不能取代後端的 provider_id 隔離、權限、冪等、金額精度與 audit log。

## 10. 圖表與日期

- 複雜互動圖表可使用 ECharts。
- 一般統計圖可使用 PrimeVue `Chart` / Chart.js。
- 金額不要直接用 JavaScript `number` 做多次加減。
- API 時間以 ISO 8601 為主；畫面格式化可使用 `date-fns`。
- 報表查詢應清楚標示時區與時間區間，預設統計時間為 `settled_at`。

## 11. 檔案與文件規則

- 新增 Provider 產品規格放在 `docs/` 現行區，不放入 `docs/archive/`。
- 舊規格不直接覆寫；失效內容移至 archive 並更新 `PROJECT_TRANSFER_INDEX.md`。
- GGAP HTML 保持為外部平台參考，不將 Provider Portal 細節直接寫入其中。
- 避免新增只描述舊 supplier / agent / merchant 的頁面、API 或型別。

## 12. 部署

push `main` 後由 `.github/workflows/deploy.yml` 部署 GitHub Pages。部署前執行：

```bash
npm run build
npm run type-check
git status --short
```
