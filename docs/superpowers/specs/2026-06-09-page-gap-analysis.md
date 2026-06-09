# 規格書 vs Demo vs 我們 — 頁面缺口分析

**日期**：2026-06-09
**目的**：盤點我們現有頁面、對照規格書 + Demo，整理需要新增的頁面清單

---

## 一、目前已有頁面（22 頁）

### Phase 4 + 6 已完成
```
✅ /login                           Auth
✅ /404 / /403                      Error
✅ /dashboard                       儀表板
✅ /aggregators + /:id              聚合商管理（2 頁）
✅ /games                           遊戲列表
✅ /games/settings                  遊戲設定        ⭐ Phase 6
✅ /games/math                      數值設定        ⭐ Phase 6
✅ /games/versions                  遊戲版本        ⭐ Phase 6
✅ /games/assets                    遊戲素材        ⭐ Phase 6
✅ /games/merchant-access           商戶遊戲開關    ⭐ Phase 6
✅ /games/:id                       遊戲詳情（佔位）
✅ /platforms + /:id                平台分析（2 頁）
✅ /players                         玩家分析
✅ /finance/settlements             結算報表
✅ /finance/reconciliation          對帳確認
✅ /finance/transactions            交易記錄
✅ /finance/invoices                發票管理
✅ /settings + /api-keys + /permissions  系統設置（3 頁）
✅ /design-system                   設計系統展示
```

---

## 二、Demo 有但我們沒有的頁面（13 頁）

### 🎯 對應規格書「報表總覽」
| Demo | 中文名 | 規格書要求 |
|---|---|---|
| `ReportOverviewView` | **報表總覽** | ✅ V3 必要 |
| `MerchantReportView` | **商戶報表** | ✅ V3 必要 |
| `AgentReportView` | **代理報表** | ✅ V3 必要 |
| `GameReportView` | **遊戲報表** | ✅ V3 必要 |
| `RtpReportView` | **RTP 報表** | ✅ V3 必要 |

### 🎯 對應規格書「結算」
| Demo | 中文名 | 規格書要求 |
|---|---|---|
| `SettlementListView` | **結算單列表** | ⚠️ 我們有「結算報表」，但 demo 的更專業 |
| `SettlementDetailView` | **結算單詳情** | ❌ 完全缺，我們沒有結算詳情頁 |

### 🎯 對應規格書「風控中心」（V3）
| Demo | 中文名 |
|---|---|
| `RiskOverviewView` | **風控總覽** |
| `RiskAlertsView` | **告警列表** |
| `RiskRulesView` | **風控規則** |
| `RiskRuleBuilderView` | **規則 Builder** |
| `RiskCasesView` | **風控案件** |
| `RiskActionsView` | **處理紀錄** |

### 🎯 對應規格書「獎池管理」（V4）
| Demo | 中文名 |
|---|---|
| `JackpotListView` | **獎池列表** |
| `JackpotSettingsView` | **獎池設定** |
| `JackpotTransactionsView` | **獎池流水** |
| `JackpotPayoutsView` | **派發紀錄** |

### 🎯 對應規格書「交易明細」（V2 強化）
| Demo | 中文名 | 我們目前 |
|---|---|---|
| `OrderListView` | **下注明細**（注單） | ❌ 完全缺（我們只有交易記錄沒注單） |
| `AbnormalOrdersView` | **異常注單** | ❌ 完全缺 |
| `TransactionListView` | **交易紀錄**（API 級） | ⚠️ 我們的版本是 finance/transactions，但比較陽春 |
| `AbnormalTransactionsView` | **異常交易** | ❌ 完全缺 |

### 🎯 對應規格書「系統管理」（V1+V4 完整版）
| Demo | 中文名 | 我們目前 |
|---|---|---|
| `SystemAdminsView` | **管理員列表** | ❌ 完全缺 |
| `SystemRolesView` | **角色權限**（Builder） | ⚠️ 我們的 /settings/permissions 是只讀，沒編輯能力 |
| `SystemLogsView` | **操作紀錄** | ❌ 完全缺 |
| `SystemApprovalsView` | **審核流程** | ❌ 完全缺 |
| `SystemCurrenciesView` | **幣別管理** | ❌ 完全缺 |
| `SystemLanguagesView` | **語系管理** | ❌ 完全缺（我們有 i18n 切換但沒管理頁） |

---

## 三、規格書要求但 Demo / 我們都沒做完整的（V4 階段）

### Agent Portal / Merchant Portal
規格書 V4 要做 3 個 Portal，但 Demo 雖然有 portals 切換邏輯，**前端工程只有一份**，靠路由前綴 + dataScope 切換 — 我們也是同樣設計，但目前還沒實作 portal 切換 UI。

| 規格書 | 我們需要做的 |
|---|---|
| Agent Portal `/agent/*` | 路由前綴策略、portal store 已準備、需要 UI |
| Merchant Portal `/merchant/*` | 同上 |

---

## 四、依優先順序整理 — 我們缺什麼

### 🔴 P0（V2 完整版必要）— 7 頁
規格書 V2「營運串接版」必要範圍，我們已做 4/7：

| 頁面 | 路徑 | 來源 |
|---|---|---|
| 🟢 遊戲管理 6 子頁 | `/games/*` | ✅ 已做 |
| **下注明細** | `/orders` | ❌ 來自 demo OrderListView |
| **異常注單** | `/orders/abnormal` | ❌ 來自 demo AbnormalOrdersView |
| 交易紀錄（強化版） | `/transactions` | ⚠️ 升級 finance/transactions |
| **異常交易** | `/transactions/abnormal` | ❌ 來自 demo AbnormalTransactionsView |

### 🟡 P1（V3 風控結算版）— 13 頁
規格書 V3 範圍，我們目前 0/13：

| 模組 | 子頁數 | 頁面 |
|---|---|---|
| 報表總覽 | 5 | 總覽 + 商戶/代理/遊戲/RTP |
| 結算 | 2 | 結算單列表 + 詳情 |
| 風控中心 | 6 | 總覽 + 告警 + 規則 + Builder + 案件 + 處理紀錄 |

### 🟠 P2（V1 系統管理硬骨頭）— 6 頁
規格書 V1 範圍，我們已有 skeleton 但內容缺：

| 頁面 | 路徑 | 現況 |
|---|---|---|
| 管理員列表 | `/system/admins` | ❌ 全新 |
| 角色權限 (Builder) | `/system/roles` | ⚠️ /settings/permissions 是只讀，要升級 |
| 操作紀錄 | `/system/logs` | ❌ 全新 |
| 審核流程 | `/system/approvals` | ❌ 全新 |
| 幣別管理 | `/system/currencies` | ❌ 全新 |
| 語系管理 | `/system/languages` | ❌ 全新 |

### 🔵 P3（V4 完整商業版）— 4 + Portal
規格書 V4 範圍：

| 模組 | 子頁數 |
|---|---|
| 獎池管理 | 4（列表 + 設定 + 流水 + 派發） |
| Supplier Portal 完整版 | — |
| Agent Portal | 5+ |
| Merchant Portal | 5+ |
| 通知 / Webhook / 安全 / 登入紀錄 | 4+ |

---

## 五、總帳

| 規格書版本 | 應有頁面 | 我們已有 | 缺口 |
|---|---|---|---|
| V1 基礎管理 | 11 | 8（部分 skeleton） | **6** |
| V2 營運串接 | 7 | 6 | **3** |
| V3 風控結算 | 13 | 0 | **13** |
| V4 完整商業 | 20+ | 0 | **20+** |
| **合計** | **51+** | **22** | **42+** |

---

## 六、Demo 程式可直接套用率

對 Phase 6 的 5 頁我們已驗證**直接複製 + 適配可用**。對其他 demo 頁面套用率估計：

| 類別 | 套用率 | 原因 |
|---|---|---|
| 報表系列（5 頁） | **90%** | 都是 DataTable + 篩選 + 圖表，與 GameMath 結構類似 |
| 結算系列（2 頁） | **90%** | 同上 |
| 風控系列（6 頁） | **85%** | RuleBuilder 較複雜，需要時間建 |
| 獎池系列（4 頁） | **90%** | CRUD + 流水查詢 |
| 注單 / 異常交易系列（4 頁） | **90%** | 同 GameMath 結構 |
| 系統管理（6 頁） | **80%** | RoleBuilder 較複雜 |

→ **平均 88% 直接套用**，剩 12% 是路徑/型別/MSW 接口適配

---

## 七、建議路線

### 🎯 路線 A：照 V2 → V3 → V1 → V4 順序補
```
1. P0 (V2 缺口 3 頁)        — 0.5 ~ 1 天
2. P1 (V3 全部 13 頁)       — 3 ~ 5 天
3. P2 (V1 系統硬骨頭 6 頁)   — 2 ~ 3 天
4. P3 (V4 — 看老闆排程)
```

### 🎯 路線 B：照「對老闆 demo 衝擊力」順序補
```
1. 報表總覽 + 結算單詳情      — 視覺強烈、可秀
2. 風控中心（總覽 + Builder）  — 高技術含量
3. V2 注單異常處理            — 業務深度
4. 系統管理 / 獎池            — 後補
```

### 💡 我的建議
**路線 A（照規格書版本）**：因為 V2 缺口已少、V3 是規格書最有業務深度的部分（GGR/RTP/結算/風控全在這），補完 V3 之後**已可對外展示一個接近完整的商業後台**。

---

## 八、需要你拍板的事

1. **路線選擇**：A 還是 B？
2. **下一階段（Phase 7）優先做哪一塊**：
   - 7.1 V2 缺口（注單 + 異常處理）
   - 7.2 V3 報表 + 結算
   - 7.3 V3 風控
   - 7.4 V1 系統管理
   - 7.5 V4 獎池
3. **要不要把 demo 14 頁先「全部」搬過來放著**（用同樣 Phase 6 機械套用流程），路由先不接，之後逐頁啟用？這樣可以最大化套用速度，缺點是有未連結的死碼。
