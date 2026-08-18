# 遊戲列表

## 章節狀態

| 項目 | 內容 |
| --- | --- |
| 規格成熟度 | 目前需求基準 — 已同步 Decision Pack 03 |
| 製作範圍 | Active |
| 對應路由 | `/games` |
| 前端元件 | `src/views/Games/Index.vue` |
| 主要來源 | `GAME_LIST_SPEC.md`、`PROVIDER_PORTAL_SPEC.md`、`Decision Pack 03` |
| 頁面角色 | Provider 遊戲主資料與三環境摘要入口 |

> 本頁是唯讀總覽與跨頁入口，不直接發布版本、調整 RTP／限額、上傳素材或控制代理商個別開關。Game、Version、Artifact、Release 與全域可用性依 Decision Pack 03；實際 API 名稱與 GGAP payload 取得後只做 Mapping。

## 1. 目的與責任邊界

- 顯示 Provider 所有遊戲，包括尚未部署、啟用或上架者。
- 同時比較 Production、DEMO、Test 的版本與狀態，並查看 Production／DEMO RTP 摘要。
- 顯示 Provider 全域可用性及 GGAP 目錄／Release／狀態事件同步結果，提供詳情與相關管理頁導流。
- 不建立錢包、代理商、商戶或會員主資料；GGAP 同步不等於代理商個別開放。
- 本列表不提供 Test 操作；具權限編輯者可在環境與發布頁建立 Test Release。Test 不得進入正式 Game Round、財務、監控或 Provider 風控。

## 2. 核心資料與環境規則

- `game_id` 是穩定主鍵；名稱、類型、環境版本與狀態不得作 join key。
- Production／DEMO 顯示 Active Release 與主要 Release 結果；Test 顯示目前 Active／驗證中的 Version 與 build 狀態。
- 無 Active Release 時顯示 `—` 與未發布；`＋` 只代表有較新候選／Release，不取代目前生效版號。
- Provider 全域可用性固定分為 `unpublished`、`available`、`maintenance`、`suspended`、`retired`，與 Release 狀態分開；Production 發布成功不自動把 Game 切成 `available`。
- 下架、維護或暫停新局只阻擋新 Launch，不改寫既有 Game Round。

## 3. 六區塊資訊架構

1. 環境摘要：Production 上架、DEMO 上架、需要留意。
2. 查詢條件：主資料、三環境、全域可用性、同步與 RTP 狀態。
3. 結果摘要：命中數、applied filters、排序與唯讀說明。
4. 遊戲寬列表：14 個欄位與兩層群組表頭。
5. RTP Tips 與狀態：理論／實際／偏差／樣本／窗口／更新。
6. 遊戲詳情：三環境、全域可用性、同步及跨頁導流。

<!-- PAGE_VISUAL_START -->
<figure class="page-anatomy lifecycle-anatomy lifecycle-anatomy--list" aria-label="遊戲列表六區塊畫面示意">
  <div class="lifecycle-anatomy__canvas">
    <a class="anatomy-zone lifecycle-anatomy__cards" href="#4-環境摘要" aria-label="前往第一區，環境摘要"><span class="anatomy-zone__number">01</span><span><small>正式上架</small><strong>14</strong><i>Production</i></span><span><small>DEMO 上架</small><strong>12</strong><i>隔離資料</i></span><span><small>需要留意</small><strong>3</strong><i>維護／同步／版本</i></span></a>
    <a class="anatomy-zone lifecycle-anatomy__filters" href="#5-查詢與結果摘要" aria-label="前往第二區，查詢條件"><span class="anatomy-zone__number">02</span><strong>查詢條件</strong><i>代號／名稱</i><i>類型</i><i>正式狀態</i><i>DEMO 狀態</i><i>Test 狀態</i><i>全域可用性</i><i>GGAP 同步</i><i>RTP 監控</i><b>查詢</b></a>
    <a class="anatomy-zone lifecycle-anatomy__toolbar" href="#5-查詢與結果摘要" aria-label="前往第三區，結果摘要"><span class="anatomy-zone__number">03</span><strong>18 款遊戲</strong><small>預設依 game_id 排序 · 每頁 10 筆</small><i>版本啟用與發布請至環境與發布</i></a>
    <a class="anatomy-zone lifecycle-anatomy__table" href="#6-遊戲列表規格" aria-label="前往第四區，遊戲列表"><span class="anatomy-zone__number">04</span><strong>遊戲寬列表</strong><small>遊戲資訊　Production（版號／狀態／RTP）　DEMO（版號／狀態／RTP）　Test（版號／狀態）　營運　GGAP　詳情</small><i>GAME-001　星際寶藏　老虎機　v1.4.2 ＋　上架　96.08%　v1.4.2　上架　95.96%　v1.5.0　已部署　正常　已同步</i></a>
    <div class="lifecycle-anatomy__split">
      <a class="anatomy-zone lifecycle-anatomy__tip" href="#7-rtp-tips-與狀態" aria-label="前往第五區，RTP Tips"><span class="anatomy-zone__number">05</span><small>RTP TIPS</small><strong>實際 RTP 96.08%</strong><i>理論 96.00% · 偏差 +0.08% · 12,480 Round · 近 24h · 正常</i></a>
      <a class="anatomy-zone lifecycle-anatomy__detail" href="#8-遊戲詳情與導流" aria-label="前往第六區，遊戲詳情"><span class="anatomy-zone__number">06</span><small>GAME SUMMARY</small><strong>星際寶藏 / GAME-001</strong><i>Production · DEMO · Test · 全域可用性 · GGAP 同步</i></a>
    </div>
  </div>
  <div class="page-anatomy__legend"><span><i></i>Provider 遊戲主資料</span><span><i></i>三環境摘要</span><small>參照現行 `/games` 原型；GGAP 同步不代表代理商開放。</small></div>
</figure>
<!-- PAGE_VISUAL_END -->

## 4. 環境摘要

- Production 上架與 DEMO 上架分別計算；不得合併為「總上架」。
- 需要留意包含維護、部署／同步失敗、同步中、尚未同步及有 pending release；正式規則由 API 回傳，不由前端猜測。
- 摘要來自完整 Provider 遊戲集合，不受目前分頁影響；來源失敗不得顯示 0。

## 5. 查詢與結果摘要

| 條件 | 技術值／規則 |
| --- | --- |
| 遊戲代號／名稱 | `keyword`，搜尋 `game_code`、`game_name`。 |
| 類型 | `game_type`，選項來自主資料 enum。 |
| 正式／DEMO／Test 狀態 | 各自獨立欄位，不使用單一 environmentMode。 |
| 全域可用性 | Game 層級狀態，不由 Production Release 推導。 |
| GGAP 同步 | 只顯示已知直接同步結果。 |
| RTP 監控 | 比對 Production 或 DEMO 的監控狀態；正式語意由 API 核准。 |

- 編輯條件不立即改變結果；按查詢才套用。重置恢復全部並查詢。
- 預設 `game_id asc`，每頁 10 筆；正式分頁、排序由伺服器處理。

## 6. 遊戲列表規格

桌機版兩層表頭共 14 欄：遊戲代號、遊戲名稱、類型；Production 版號／狀態／RTP；DEMO 版號／狀態／RTP；Test 版號／狀態；全域可用性；GGAP 同步；詳情。

- Production／DEMO 版號是 Active Release 指向的 Version；Release ID 在詳情另列。Test 不把 `build_id` 當版號。
- 正式候選必須使用同一 Artifact 由 DEMO 晉級 Production；因發布時點不同，各環境可暫時有不同 Active Release。
- RTP 欄只顯示實際值；無資料顯示 `—`，不可顯示 0%。
- 狀態使用文字、圖示與低飽和色，不得只靠顏色。
- Desktop 使用水平捲動與必要凍結欄；Mobile 轉為每遊戲卡片，仍保留三環境與詳情入口。

## 7. RTP Tips 與狀態

Tips 至少顯示理論 RTP、實際 RTP、偏差、統計 Round 數、時間窗口、最後更新、監控狀態與規則版本。偏差不代表已形成 Risk Event；門檻、樣本與風控關聯依 `TBD-DAT-005`。Test 不顯示 RTP。

## 8. 遊戲詳情與導流

- 詳情 Dialog 顯示三環境 Active Version／Release、Production／DEMO RTP、全域可用性、GGAP 同步與更新時間。
- Production／DEMO 版號、狀態及 `＋` 導向 `/games/environments?game_id=...&environment=...`。
- 全域可用性導向 `/games/environments?game_id=...`；設定、數值、版本、素材使用各自 route 與精確 `game_id`。
- GGAP 對接模組目前 Deferred；只顯示同步摘要與依賴，不承諾可用細節頁。

## 9. 頁面狀態與錯誤處理

首次載入顯示摘要／篩選／表格 skeleton；查無資料保留條件與清除入口；查詢失敗顯示重新載入；局部 RTP／同步失敗以 `—` 與來源狀態呈現；Forbidden 不先渲染資料；pending release、stale、無資料需分開。

## 10. API 契約草案

| 能力 | 必要輸出 |
| --- | --- |
| 摘要／列表 | 三項摘要、14 欄、`total`、穩定排序、`generated_at`、source failures。 |
| 遊戲詳情 | 主資料、三環境 Active Release snapshot、RTP、全域可用性、同步、allowed links。 |
| 篩選選項 | 有權 Provider scope 內的類型與狀態 enum。 |

正式 path、schema、狀態轉換及 permission key 依 `TBD-API-001`、`TBD-API-005`、`TBD-DOM-003`、`TBD-SEC-001`。

## 11. 前後端交付與驗收

前端需分開 draft／applied filters、保留穩定 ID 與各環境語意、不從列資料反算摘要；後端強制 Provider scope，提供三環境及直接 GGAP snapshot，不回傳代理商主資料。

驗收條件：14 欄與兩層表頭完整；三環境不混用；本列表不直接發布；RTP Tips 含樣本與窗口；`＋` 不取代生效版；全域可用性與 Release 分離；GGAP 同步不等於代理商開放；Loading／empty／error／stale／Forbidden 可驗收；Desktop／Mobile 可操作。

## 12. 測試重點

- 多條件組合、排序分頁、快速重查與 response race。
- 無版本、pending release、部署／同步失敗、無 RTP 與樣本不足。
- 三環境狀態組合、詳情焦點與各 route deep link。
- 長遊戲名稱／ID、寬表格、390px 卡片與鍵盤操作。

## 13. 待確認事項

- `TBD-DOM-003`：現有資料模型與 DP03 Game／Version／Artifact／Release 的 Mapping。
- `TBD-DAT-005`：RTP 門檻、窗口與樣本。
- `TBD-API-001`、`TBD-API-005`：共通及遊戲生命週期 API。
- `TBD-SEC-001`：資料 scope 與 permission key。
- `TBD-NFR-001`、`TBD-NFR-004`：列表效能、響應式與可存取性。
- `TBD-EXT-003`：系統設定／角色模型。

## 14. 實作接軌條件

目前產品行為依本頁與 Decision Pack 03 成立；正式遊戲 schema、API、權限與 deep link 取得後建立 Mapping，並以驗收結果更新實作狀態。
