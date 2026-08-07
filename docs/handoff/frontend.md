# 前端交接文件：Provider Portal

> 狀態日期：2026-08-07
> 文件狀態：Provider Portal 第一輪導覽、Game Round、遊戲大廳與遊戲官網前端原型已建立；部分頁面與路由仍是舊版原型

本文件說明目前前端實際結構、目前仍存在的舊原型邊界，以及下一階段調整原型時應遵循的方向。

產品範圍與導覽依據：[`PROVIDER_PORTAL_SPEC.md`](../PROVIDER_PORTAL_SPEC.md)、[`PROVIDER_PORTAL_NAVIGATION_SPEC.md`](../PROVIDER_PORTAL_NAVIGATION_SPEC.md)。

## 1. 前端定位

前端是遊戲商的 Provider Portal 原型，不負責實作 GGAP 的代理商、商戶或會員後台。現有程式仍保留三 Portal 代碼，這些內容只代表歷史原型，不代表新版產品範圍。

新版前端的主要工作面向：

- Provider 遊戲主資料、版本、資產、規則與上下架
- Game Round 查詢與遊戲商財務 / 報表
- 遊戲監控、異常與風控告警
- GGAP 對接狀態與通知
- 遊戲官網與遊戲大廳內容管理
- Provider 內部系統設定與權限

## 2. 主要目錄

| 路徑 | 用途 | 目前狀態 |
|---|---|---|
| `src/views/` | 頁面 | 含舊版及可重用的原型頁 |
| `src/components/` | 共用 UI 與圖表元件 | 可沿用，但新增頁面需遵循 PrimeVue 4 |
| `src/composables/` | 頁面資料與互動邏輯 | 部分仍以舊平台 / 代理 / 商戶命名 |
| `src/stores/` | Pinia 狀態 | auth、portal、permission、ui；portal store 後續需簡化 |
| `src/router/` | Vue Router 路由 | 目前仍有舊三 Portal 與大量 legacy route |
| `src/config/menu-sakai.ts` | 側邊導覽 | 已建立 Provider 目標導覽；仍保留部分舊版入口相容 |
| `src/services/apiClient.ts` | API 單一出口 | 目前已支援 GET / POST / PUT / PATCH / DELETE |
| `src/mocks/handlers/` | MSW mock API | 只供原型展示，不是正式 API 契約 |
| `src/views/GameLobby/` | 遊戲大廳頁面與展示資料 | 已建立五個前端原型入口；正式資料與 DEMO API 待接 |
| `src/views/GameWebsite/` | 遊戲官網頁面與展示資料 | 已建立三個前端原型入口；正式內容、素材與發布 API 待接 |
| `src/views/Docs/` | 文件檢視器 | 目前主要載入 `docs/handoff/*.md` |

## 3. 目前路由實況

目前仍存在下列 legacy route 群組：

- `/dashboard`
- `/aggregators/*`
- `/games/*`
- `/platforms/*`
- `/agents/*`
- `/merchants/*`
- `/players/*`
- `/orders/*`
- `/transactions/*`
- `/reports/*`
- `/settlements/*`
- `/risk/*`
- `/jackpots/*`
- `/system/*`
- `/settings/*`
- `/agent/*`、`/merchant/*`

這些路由先不在本文件中宣告為新版已完成。下一階段應先調整側邊導覽與 Provider 路由，再逐步移除或改寫無關頁面。

目前已建立的 Provider 目標頁面：

- `/reports`：Provider Game Round 明細，支援查詢、排序、分頁、詳情與 CSV / XLSX 匯出。
- `/lobby`、`/lobby/games`、`/lobby/management`、`/lobby/demo`、`/lobby/preview`：遊戲大廳五個前端原型入口。
- `/website/banners`、`/website/content`、`/website/releases`：遊戲官網三個前端原型入口；`/website` 會導向 Banner 管理。

上述頁面目前以原型展示資料呈現，正式 API、權限、狀態碼、精度與錯誤處理仍待確認。

## 4. 目標導覽對應

| Provider 導覽 | 頁面範圍 | 實作建議 |
|---|---|---|
| 總覽 | Provider 遊戲數、上架狀態、投注 / GGR、異常通知 | 先沿用 Dashboard 容器，資料改為 Provider 指標 |
| 遊戲管理 | 遊戲列表、詳情、數學、版本、資產、上下架 | 舊版 `Games` 頁面群仍保留；新版遊戲大廳另有獨立五頁原型 |
| 數據與報表 | Game Round 明細、代理 × 遊戲聚合、遊戲統計 | 不再以平台 / 商戶報表作為主入口 |
| 遊戲大廳 | 大廳總覽、遊戲清單、遊戲管理、DEMO 數據、大廳預覽 | 已建立 `/lobby/*` 五頁原型；後續接正式遊戲資料、狀態與 DEMO 數據 API |
| 遊戲商財務 | 點數、USDT、投注、輸贏、GGR、財務彙總 | 不建立 Provider wallet；不把平台結算當成 Provider 帳務 |
| 遊戲監控與風控 | 異常 Game Round、遊戲健康、告警、風控紀錄 | 沿用 Risk 元件，但需改資料語意 |
| GGAP 對接 | 連線、同步、請求、錯誤、回呼狀態 | 取代 `/aggregators` 的平台管理語意 |
| 通知中心 | 站內通知列表、已讀、通知偏好 | 新增頁面與 topbar 通知入口 |
| 官方網站 | 遊戲官網 Banner、法務與聯絡資訊、發布與版本紀錄；遊戲大廳為同一主選單下的獨立子導覽 | 已建立 `/website/*` 三頁原型；公告與活動暫不納入現階段，與 GGAP 平台功能分離 |
| 系統設定 | Provider 使用者、權限、API key、語系等 | 保留設定框架，重新定義 Provider 權限 |

### 不應出現在 Provider 主要選單

- 代理商管理
- 商戶管理
- 會員管理
- 平台管理
- Provider 錢包
- 獨立 Jackpot 管理
- GGAP 平台對帳狀態

GGAP 對已上架遊戲依代理商開啟 / 關閉的功能，屬 GGAP 的代理商側能力。Provider Portal 可以顯示同步或對接狀態，但不應把代理商逐一開關當成遊戲商主資料控制。

## 5. API client

```ts
import { api } from '@/services/apiClient'

const response = await api.get<GameRow[]>('/api/provider/v1/games')
await api.patch('/api/provider/v1/games/game-001', { status: 'published' })
```

目前 `apiClient` 的行為：

- 從 `authStore.token` 自動附加 `Authorization: Bearer <token>`。
- JSON body 自動設定 `Content-Type` 與序列化。
- 非 2xx 回應會拋出 `Error`。
- 回傳內容直接解析為 JSON，不會自動包成 `{ code, data }`。
- 目前 mock 路徑仍是 `/api/*`；`/api/provider/v1/*` 是待後端確認的目標命名，不代表已實作。

頁面資料請優先使用 `api.*`。接真後端前，需持續清查仍直接使用 `fetch` 或 `window.fetch` 的頁面，避免漏帶正式 token。

## 6. 認證與權限現況

目前 `authStore` 與 `portalStore` 仍會建立 supplier / agent / merchant mock identity；這是舊原型相容層，下一階段應改為：

- 單一 Provider Portal 身份
- Provider 內部角色與 permission
- Provider tenant / provider_id 資料範圍
- 後端簽發與驗證的正式 token

前端 `hasPermission` 只控制 UX 顯示，正式授權與資料過濾必須由後端強制執行。

## 7. Game Round 與報表畫面原則

目前 `src/views/Reports/ProviderGameRounds.vue` 已作為 `/reports` 的 Provider Game Round 原型頁，包含日期、遊戲、代理商、Round、外部 Round、會員與狀態篩選，預設依 `settled_at` 排序，並提供明細視窗及 CSV / XLSX 匯出。頁面已呈現 Provider 點數、USDT、換算率 / 規則、狀態與時間欄位；正式回應格式、資料精度、權限與錯誤處理仍待後端契約確認。

- Game Round 是主要明細單位，不新增 Game Session 導覽。
- slots / 單人 Crash 主要顯示 `settled_at`；棋牌可顯示 `started_at` 與 `settled_at`。
- 點數為主要顯示值，USDT 為可展開或匯出的換算值。
- 平均投注額、人均投注額等公式需由欄位旁 info tooltip 顯示。
- 報表是 Provider 自己整合的統計，不顯示 GGAP 對帳狀態。

遊戲大廳 DEMO 數據中的 Session 只代表展示用的統計欄位，不建立獨立的 Game Session 模組。

## 8. 文件檢視器注意事項

目前文件檢視器是透過 `import.meta.glob` 收錄 `docs/handoff/*.md`。封存文件移至 `docs/archive/` 後，不會被當作現行 handoff 載入；若未來需要查閱封存內容，應另加明確的 archive 入口，不要混入現行文件清單。

## 9. 驗證方式

```bash
npm run build
npm run type-check
npm run dev
```

目前沒有單元測試框架。原型變更至少需完成 `git diff --check`、build、type-check，以及桌機 / 行動尺寸的頁面抽查。
