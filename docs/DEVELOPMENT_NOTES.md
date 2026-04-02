# 開發筆記
# 博弈遊戲開發商的總控後台

> 記錄所有設計決策、技術選型理由、遇到的問題與解決方案。
> 每次重要決策請立即記錄，這份文件是交接後端夥伴的重要參考。

---

## 📋 格式說明

每條記錄請使用以下格式：

```
### YYYY-MM-DD — [模組] 決策標題

**背景**: 為什麼需要做這個決策
**方案**: 選擇了什麼，以及對比了哪些替代方案
**原因**: 選擇這個方案的理由
**影響**: 這個決策影響了哪些文件或後續開發
**後端備注**: 需要後端配合的事項（如有）
```

---

## 🏗️ 架構決策

### 2026-04-02 — [架構] 從雙後台改為單一後台

**背景**: Aggregator 原有 Master Admin（`/admin/*`）與 Merchant Portal（`/merchant/*`）的雙後台架構，但遊戲開發商後台只有一種用戶。

**方案**: 採用單一 `MainLayout.vue`，路由結構改為 `/dashboard`、`/games`、`/players`、`/finance`、`/settings`。

**原因**: 避免不必要的複雜度。角色權限控制通過 Pinia auth store 的 `role` 欄位決定功能顯示範圍，而非路由隔離。

**影響**:
- `src/layouts/` 只保留 `MainLayout.vue`
- `src/router/index.ts` 完全重構
- 刪除 Aggregator 的 `Master/` 和 `Merchant/` views

---

## 🔧 技術決策

> 在此記錄技術選型的決定

---

## 🎨 UI/UX 決策

> 在此記錄介面設計相關決定

---

## 🐛 問題與解決方案

> 記錄遇到的問題及如何解決

---

## 📡 API 設計備注

> 記錄 Mock API 的重要設計，供後端夥伴參考

### API 通用格式

所有 API 回傳使用統一格式：

```json
// 成功
{ "code": 0, "data": { ... } }

// 列表（分頁）
{ "code": 0, "data": { "items": [...], "total": 100, "page": 1, "limit": 20 } }

// 錯誤
{ "code": 1001, "message": "未授權" }
```

### 認證方式

- **前台登入**: Cookie Token + Redis Session（後端實作）
- **MSW Mock**: 登入後存 token 至 localStorage，每次請求帶 `Authorization: Bearer <token>` header

---

## 📊 數據結構版本記錄

> 記錄 TypeScript types 的重大變更

### v1.0 — 2026-04-02 — 初始 types 定義

```typescript
// types/game.ts
interface Game {
  id: string
  name: string
  status: 'active' | 'inactive'
  version: string
  rtp: number
  activeUsers: number
  publishedAt: string  // ISO 8601
}
```

---

## 📝 每周回顧

### Week 1 回顧（2026-04-02 ~ ）

**完成**:
- (待填寫)

**遇到的問題**:
- (待填寫)

**下周重點**:
- (待填寫)

---

## 🤝 交接備注

> 給前後端夥伴的重要提示（在交付時更新此章節）

### 前端夥伴接手時注意

- Mock API 全部在 `src/mocks/handlers/` 中
- 要切換成真實 API：設定 `VITE_USE_MOCK=false` 環境變數
- 所有 API 呼叫都在 `composables/` 中的 `fetch` 呼叫，統一替換即可

### 後端夥伴接手時注意

- Mock API 的 request/response 格式即為期望的 API 規格
- 詳細說明在 `GAME_DEVELOPER_DASHBOARD_SPEC.md` 第 5 章
- 所有金額欄位單位：USD（前台顯示時做幣別換算）
- 時間欄位格式：ISO 8601 UTC（`2026-04-02T08:00:00Z`）
