# 遊戲管理總後台 — 調整計畫分析

**日期**：2026-05-29
**輸入**：老闆提供的《遊戲管理總後台規格書》(`index.html`，Spec v2.0)
**目的**：對照規格書與目前實作，找出差異與調整路徑

---

## 一、規格書範圍速讀

### 產品定位
B2B **遊戲管理總後台**，供「**遊戲供應商**」與「**平台管理方**」管理代理、商戶、遊戲、獎池、交易、風控、報表、結算、系統權限。**不含玩家前台**。

### 核心對象與資料模型
| 角色 | 說明 | 對應 Portal |
|---|---|---|
| **Supplier**（供應商）| 我們自己，提供遊戲與後台 | Supplier Portal |
| **Agent**（代理）| 多層分潤代理，掛在 Supplier 底下 | Agent Portal |
| **Merchant**（商戶）| 真正運營遊戲、面對玩家的廠商 | Merchant Portal |

### 規格書分階段（V1→V4）
| 版本 | 主題 | 包含模組 |
|---|---|---|
| **V1** | 基礎管理版 | 系統 + 代理 + 商戶 + 基礎儀錶板 |
| **V2** | 營運串接版 | 遊戲管理 + 商戶遊戲授權 + 交易明細 |
| **V3** | 風控結算版 | 報表 + 結算 + 風控 + 審核流程 |
| **V4** | 完整商業版 | 三 Portal + 獎池 + 通知 + Webhook + API Key |

### 跨模組共通機制
- **權限**：RBAC + ABAC + dataScope + 欄位權限 + Object-level authorization
- **狀態機**：商戶 / 遊戲 / 注單 / 結算 都有明確生命週期
- **敏感操作**：Confirm + Approval + Log（修改前 / 修改後留痕）
- **報表公式**：GGR、RTP、折算 GGR、上繳比例、供應商應收、最終應收
- **API 錯誤碼**：通用 / 商戶遊戲 / 交易錢包 / 報表權限 四類

---

## 二、目前實作 vs 規格書 對照表

| 規格書模組 | 規格書版本 | 目前實作 | 狀態 | 落差 |
|---|---|---|---|---|
| 系統管理 — 帳號 | V1 | — | ❌ 無 | 完全缺 |
| 系統管理 — 角色權限 | V1 | `Settings/Permissions.vue` | ⚠️ Skeleton | 只有空頁面 |
| 系統管理 — API Key | V1+V4 | `Settings/ApiKeys.vue` | ✅ 有基本版 | 缺 Webhook、安全紀錄 |
| 系統管理 — 操作 Log | V1 | — | ❌ 無 | 完全缺 |
| 系統管理 — 幣別 / 語系 | V1 | i18n ✅ / 幣別 ❌ | ⚠️ 部分 | 缺幣別管理 |
| 代理管理 | V1 | `Aggregators/` | ⚠️ **概念不對應** | 目前是「聚合商」單層，非多層分潤代理 |
| 商戶管理 | V1 | `Platforms/` | ⚠️ **概念不對應** | 目前「平台」近似商戶但 schema 不同 |
| 基礎儀錶板 | V1 | `Dashboard/` | ✅ 有 | 完整度 OK |
| 遊戲管理 | V2 | `Games/` | ⚠️ 部分 | 缺版本、素材、幣別/語系、限額模板 |
| 商戶遊戲授權 | V2 | `Aggregators/GameConfig*` | ⚠️ 概念類似 | 需重整為「商戶 ↔ 遊戲」授權矩陣 |
| 交易明細（注單）| V2 | `Finance/Transactions.vue` | ⚠️ Skeleton | 缺注單詳情、API Trace |
| 報表總覽 | V3 | — | ❌ 無 | 完全缺 |
| 結算單 | V3 | `Finance/Settlements.vue` | ⚠️ Skeleton | 完全缺 |
| 對帳 / 異常處理 | V3 | `Finance/Reconciliation.vue` | ⚠️ Skeleton | 完全缺 |
| 風控中心 | V3 | — | ❌ 無 | 完全缺 |
| 審核流程 | V3 | — | ❌ 無 | 完全缺 |
| Agent Portal | V4 | — | ❌ 無 | 完全缺 |
| Merchant Portal | V4 | — | ❌ 無 | 完全缺 |
| 獎池管理 | V4 | — | ❌ 無 | 完全缺 |
| 通知中心 / Webhook | V4 | — | ❌ 無 | 完全缺 |

### 概念對應決策（最關鍵）

| 目前命名 | 規格書命名 | 建議處理 |
|---|---|---|
| Game Developer（我們）| Supplier（供應商）| **保留現名**，UI 上仍稱「遊戲開發商」即可，技術上是同一角色 |
| Aggregator（聚合商）| Agent（代理）| **重命名 + 重設計**：目前是單層平面，要改成多層分潤代理 |
| Platform（遊戲平台）| Merchant（商戶）| **重命名 + 補欄位**：補 API 金鑰、錢包設定、分潤、結算幣別 |
| Player（玩家）| 無對應主檔 | **保留**，但定位為「跨商戶的玩家紀錄查詢」非獨立資料 |

---

## 三、目前進度落點

```
V1 完整度： ████░░░░░░░░ ~35%
            ├─ 儀表板 ✅
            ├─ 系統管理 ⚠️ skeleton
            ├─ 代理管理 ⚠️ 概念需重做
            └─ 商戶管理 ⚠️ 概念需重做

V2 完整度： ███░░░░░░░░░ ~25%
            ├─ 遊戲管理 ⚠️ 基本 CRUD
            ├─ 商戶遊戲授權 ⚠️ Aggregator 端有原型
            └─ 交易明細 ⚠️ skeleton

V3 完整度： █░░░░░░░░░░░ ~5%（全是空殼）

V4 完整度： ░░░░░░░░░░░░ 0%
```

---

## 四、調整計畫 — 三條路線可選

### 路線 A：嚴格對齊 Spec V1，先補齊基礎管理層
**先做：** 系統管理（帳號 / 角色 / Log / 幣別）→ 代理管理重構 → 商戶管理重構 → 儀表板補強。
**之後再做：** V2 遊戲與商戶遊戲授權。

| 優點 | 缺點 |
|---|---|
| 與 spec 完全同步，老闆驗收最直接 | 大幅重構聚合商與平台，先前的工作會被改寫 |
| 為 V2/V3 打穩權限與資料地基 | 短期內看不到新功能 demo |

---

### 路線 B：先補 V2 缺口（遊戲管理完整化 → 商戶遊戲授權 → 交易明細）
**先做：** 遊戲管理補版本/素材/幣別 → 商戶遊戲授權矩陣 → 注單詳情與 API Trace。
**之後再做：** 回頭補 V1 系統管理 + 代理重構 + 商戶重構。

| 優點 | 缺點 |
|---|---|
| 接續用戶現在要做的「遊戲管理」，順勢延伸 | V1 的代理/商戶概念落差會持續累積 |
| 可短期看到完整營運串接 demo | 等到回頭做 V1 時要改的 schema 更多 |

---

### 路線 C（建議）：**雙線並行** — 名詞先對齊、模組分層補強
**第 1 步（小重構 / 1~2 天）**：純命名 + schema 對齊
- 把 `Aggregator` 概念在 UI/路由/i18n 改稱「代理」，補充「上級代理 / 條件比例 / 上繳比例 / 結算幣別」欄位
- 把 `Platform` 在 UI/路由/i18n 改稱「商戶」，補充「綁定代理 / API Key / 錢包 API / 分潤」欄位
- Player 改為「玩家查詢」工具頁

**第 2 步（接續用戶意願）**：把遊戲管理推到 V2 完成度
- 補遊戲版本、素材、支援幣別、支援語系、限額模板
- 新增「商戶可用遊戲」授權矩陣（從 Aggregator 端的原型搬出來重構）
- 補完整詳情頁（取代目前佔位 `Detail.vue`）

**第 3 步**：補 V2 交易明細
- 注單列表 / 詳情 / API Trace
- 異常標記（V3 才做退款補單）

**第 4 步**：回頭補 V1 系統管理硬骨頭
- 帳號管理、角色權限（取代 skeleton）、操作 Log、幣別管理

**第 5 步起**：依用戶優先序選 V3 模組（報表 / 結算 / 風控 / 審核）

| 優點 | 缺點 |
|---|---|
| 命名先對齊，後續所有對話與文件都同步 | 第 1 步是純重構，沒有新功能 |
| 接續用戶想做的遊戲管理 | 整體節奏較雜 |
| 跨 V1/V2 漸進補齊 | |

---

## 五、需老闆 / 用戶確認的關鍵決策

1. **路線選擇**：A / B / C 哪一條？
2. **代理層級**：規格書暗示多層代理（一級 / 二級 / 三級），目前完全沒有。要支援幾層？
3. **三 Portal 策略**：V4 才做，但**前端工程是否共用一個專案**？這影響當下的 Layout 設計。
4. **V1 mock 範圍**：規格書「待確認事項」問「V1 是否完全 mock API」。目前都是 MSW mock，這項建議直接定案為「全 mock」。
5. **權限系統什麼時候動工**：RBAC + dataScope + 欄位權限是 V4 才完整化，但 mock 角色至少要在 V1 有。要先做哪些？

---

## 六、立即可做（不論最終選哪條路線都要做）

這幾件事跟路線選擇無關，應該先做掉：

1. ✅ **修好遊戲管理空白頁**（已完成 — 補 `NDialogProvider`）
2. ⏳ **重命名 i18n key**：`aggregator` → `agent`、`platform` → `merchant`（為命名對齊鋪路）
3. ⏳ **建立 spec 中的型別檔**：先把規格書中的核心型別（AdminUser、Agent、Merchant、Game、Order、Transaction、Settlement、RiskAlert）建成 TS interface，後續實作直接引用
4. ⏳ **建立報表公式 utility**：GGR、RTP、折算 GGR、上繳比例、應收計算放到 `utils/finance.ts`

---

## 七、我的建議

選 **路線 C**，理由：
- 用戶剛說「想做遊戲管理」，路線 C 不打斷這個動線
- 第 1 步的命名對齊只動 i18n / 路由 / 少數欄位，1~2 天可完成，後續所有工作都跟 spec 對齊
- 不需立刻處理多層代理 / 三 Portal 等大規模架構決策，可邊做邊談
- 風控 / 結算這些複雜模組往後推，等基礎更穩再動工

---

## 八、補充：參考 demo `game-supplier-admin-demo` 解析

老闆另外提供了一個已完成的參考 demo (`bcbaicang-tech/game-supplier-admin-demo`)，這份 demo 把規格書的 V1~V4 全部都實作出來了。重點分析如下。

### 技術棧差異
| 項目 | 參考 Demo | 我們目前 |
|---|---|---|
| UI 框架 | **PrimeVue** + Sakai 模板 | **Naive UI** + 科幻 Dark theme |
| 路由 | `createWebHashHistory` | `createWebHistory` |
| 狀態 | Pinia | Composables（無 Pinia） |
| 圖表 | Chart.js | ECharts |
| Mock | LocalStorage（無 MSW） | MSW + faker |
| 樣式 | PrimeFlex + Tailwind | Tailwind + 自訂 design tokens |

### 架構模式 — **Catalog-Driven**（重要！）
參考 demo 把所有頁面定義成 `catalog.ts` 裡的資料：
```ts
type PageSpec = {
    label: string; path: string; icon: string;
    type: 'dashboard' | 'list' | 'form' | 'detail' | 'report' | 'builder' | 'approval' | 'log';
    group: string; responsibility: string;
    filters?: PageField[]; columns?: TableColumn[]; formSections?: FormSection[];
}
```
然後用 4 個通用元件 (`ListView`, `FormView`, `DetailView`, 加上 `DashboardView`) 渲染 80% 的頁面。新增一頁只要在 catalog 加一筆。

我們目前是**傳統一頁一檔**模式 — 每個頁面從 script、template、composable 全部手寫。
這是巨大的架構差異，**要不要遷移是個關鍵決策**。

### 完整選單結構（9 個群組）
```
1. 儀錶板
2. 代理管理        (代理列表 + 代理設定)
3. 商戶管理        (商戶列表 + 商戶設定 — API/錢包/RTP/結算)
4. 遊戲管理 ⭐     (6 個子頁，見下方)
5. 獎池管理        (獎池列表 + 設定 + 流水 + 派發紀錄)
6. 交易明細        (下注明細 + 交易紀錄 + 異常注單 + 異常交易)
7. 風控中心        (總覽 + 告警 + 規則Builder + 案件 + 處理紀錄)
8. 報表總覽        (總覽 + 商戶/代理/遊戲/RTP 報表 + 結算列表 + 結算詳情)
9. 系統管理        (管理員 + 角色權限Builder + 操作紀錄 + 審核流程 + 幣別 + 語系)
```

### 遊戲管理子頁細節 ⭐（用戶最想做的部分）
| 子頁 | 路徑 | 類型 | 說明 |
|---|---|---|---|
| 遊戲列表 | `/games` | list | 主檔查詢、上下架、維護狀態 |
| 遊戲設定 | `/games/settings` | form | 全域配置：維護週期、限紅模板、類型、語系 |
| **數值設定** | `/games/math` | **builder** | **RTP、波動率、賠率表、模擬結果、審核狀態** |
| 遊戲版本 | `/games/versions` | list | 發佈紀錄、回滾、維護公告 |
| 遊戲素材 | `/games/assets` | list | icon、banner、多語系素材、版本檔案 |
| **商戶遊戲開關** | `/games/merchant-access` | **builder** | **依商戶控管可用遊戲、限額模板、RTP 生效範圍** |

我們目前只有「遊戲列表」一個頁面 + 一個 Detail.vue 佔位符。

### Portal 路由結構（三 Portal 共用一個前端）
```
Supplier (我們):   /dashboard, /agents, /merchants, /games/*, /jackpots/*, ...
Agent Portal:      /agent/dashboard, /agent/merchants, /agent/games, /agent/orders, ...
Merchant Portal:   /merchant/dashboard, /merchant/profile, /merchant/api-wallet, ...
```
**確認** spec 待確認事項中的「Portal 是否共用前端工程」 → 答案：**共用一個 Vue 工程**，靠路由前綴和 `dataScope` 切換。

### 需要新增決策的關鍵問題
1. **架構模式**：要學參考 demo 的 catalog-driven 嗎？
   - ✅ 優點：新增頁面成本極低、CRUD 頁面一致性高
   - ❌ 缺點：客製化頁面（如平台分析、儀表板）難套用、需要大重構
   - 💡 折衷：**catalog-driven 通用模式 + 特殊頁面用客製檔** 同時並存
2. **UI 框架**：保留 Naive UI 還是切換 PrimeVue？
   - 保留 Naive UI：科幻風格保留、不重做、與參考 demo 視覺不同
   - 切換 PrimeVue：完全跟參考 demo 對齊、大量重做
3. **遊戲管理拆 6 子頁**：要照參考 demo 拆成 6 個子模組嗎？

### 新建議：路線 D — **參考 demo 學架構，保留我們科幻 UI**
1. **保留** Naive UI + 我們的設計系統（科幻風 + 漸進改善）
2. **學** catalog-driven 架構，把通用 CRUD 頁面（如管理員、幣別、語系、操作紀錄、角色權限）抽出來
3. **學** 三 Portal 共用前端的路由架構，但實作 mock 即可
4. **照搬** 模組劃分：9 個選單群組、遊戲管理 6 子頁
5. **順著用戶要做遊戲管理**：先把遊戲管理 6 子頁全部建好，作為第一個完整模組

**為什麼這條路線最好：**
- 視覺上保留我們已花心力打造的科幻 Dark 風格
- 架構上學習參考 demo 的成熟模式，減少未來重複工作
- 接續用戶當下意願（做遊戲管理）並完整推到 V2 水準
