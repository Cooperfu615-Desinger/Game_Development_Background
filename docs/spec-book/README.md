# Provider Portal 規格網站來源

本目錄是 Provider Portal 規格網站的可維護來源。網站由 `scripts/build-spec-site.mjs` 產生，輸出到 `public/provider-specs/`。

## 文件角色

- `manifest.mjs`：規格書章節樹、32 個內容頁、成熟度、製作範圍、route、來源規格與前端對應的集中索引。
- `readiness.mjs`：本輪 21 頁的 A–D 批次、逐面向完成度與待補主題。
- `reconciliation.mjs`：本輪 21 頁的已確認規則、原型實況、目標草案與校準狀態。
- `content/`：已整理成規格書章節的 Markdown 來源。
- `SPEC_BOOK_AUTHORING_GUIDE.md`：已定版的撰寫、維護、驗收與跨專案移植規範；可獨立分享。
- `public/provider-specs/`：自動產生的多頁 HTML 閱讀網站，不作為人工編輯來源。

## 規格狀態

- `confirmed`：已確認，可作為開發依據。
- `draft`：方向已定，仍有待核准欄位或契約。
- `outline`：已建立章節與來源，內容尚未完整整理。
- `tbd`：核心決策尚未形成。

## 製作範圍

- `baseline`：已完成完整試作，作為後續頁面的撰寫基準。
- `active`：納入目前規格完善範圍。
- `deferred`：等待必要規格或產品決策，只顯示延後說明。
- `blocked`：已開始整理，但遇到明確且無法繞過的阻擋。

頁面原型成熟度、規格成熟度與製作範圍是三個不同欄位。畫面已有完整 mock 原型，不代表 API、權限或資料契約已確認，也不代表已排入本輪。

目前第一階段範圍為 1 頁 Baseline、20 頁 Active、11 頁 Deferred。

逐面向完成度只使用 `complete`、`partial`、`missing`、`na`，用來說明目前規格素材是否足夠，不代表產品或程式開發進度。

頁面三層校準必須將 confirmed、prototype reality 與 unconfirmed target 分開；原型中可操作或可見的內容，不得直接寫成正式產品規則。

## 產生網站

```bash
npm run spec:build
```

入口：`public/provider-specs/index.html`

執行 `npm run dev` 或 `npm run build` 前，也會自動重新產生規格網站。

## 視覺對齊原則

- 規格網站沿用 Provider Portal 的 Apple HIG 語言：淺灰底、白色毛玻璃導覽、Apple Blue 互動色、12px 卡片與柔和陰影。
- 頁面畫面示意優先參照實際原型的元件、密度與狀態，而不是只套用相近色票。
- 規格導覽、成熟度與 01–06 藍色標註屬文件介面，不得混同為正式產品功能或狀態色。
- 內容頁採「Overview first」閱讀順序：標題與追溯資訊之後先呈現頁面畫面示意，再進入詳細規格；手機版先顯示區塊索引，完整畫面可展開。
- 畫面示意中的區塊必須可連到對應詳細章節，詳細閱讀時需保留回到畫面示意的入口。
- `site/site.css` 是規格網站專用樣式來源；不可為了視覺相似而直接依賴 Portal runtime CSS。
- 產生結果使用相對路徑，需維持 `public/provider-specs/index.html` 可離線閱讀。

## 編輯原則

1. 共通規則只在共通章節定義，頁面規格以連結引用。
2. Mock 數字、展示資料與正式契約分開標記。
3. 新的正式決策先更新規格來源，再同步原型與 API 文件。
4. 未核准的 API path、enum、精度、門檻與 permission key 必須標示為 `Draft` 或 `TBD`。
5. 既有 `docs/*.md` 目前仍是來源依據；規格網站完成核准前，不取代原文件優先級。
