# 遊戲紀錄

## 章節狀態

| 項目 | 內容 |
| --- | --- |
| 規格成熟度 | Draft — 首個完整頁面規格範本 |
| 對應路由 | `/reports` |
| 前端元件 | `src/views/Reports/ProviderGameRounds.vue` |
| 主要來源 | `GAME_ROUND_RECORDS_SPEC.md`、`GAME_ROUND_AND_REPORTING_SPEC.md` |
| 本頁資料環境 | Production only |
| 主要業務單位 | Game Round |

> 本章同時作為後續內容頁規格的寫作範本。已確認規則與待確認內容分開呈現；標記為 Draft 或 TBD 的內容，在產品／後端確認前不得視為正式介面契約。

## 1. 目的與使用情境

遊戲紀錄提供遊戲商營運、客服、財務與技術人員查詢正式環境的 Game Round，核對玩家投注、派彩、輸贏與交易識別資訊，並在發生客訴、對帳差異或整合異常時取得可追溯的單筆明細。

主要使用情境：

1. 依時間、遊戲、幣別、狀態或識別碼查找特定 Game Round。
2. 從列表快速比較投注、有效投注、派彩及遊戲商輸贏。
3. 開啟單筆明細，核對 Provider 與 GGAP 雙方識別碼及時間軸。
4. 將目前查詢條件下的資料匯出，供營運分析或人工對帳。
5. 從監控、風控告警或財務報表帶入 Game Round 識別碼進行追查。

## 2. 範圍與責任邊界

### 2.1 本頁包含

- Provider 自有遊戲產生的正式 Game Round。
- Game Round 的查詢、排序、分頁、單筆明細與匯出入口。
- Provider 點數金額，以及依既定匯率換算的 USDT 對照值。
- Provider 與 GGAP 之間用於追蹤與對帳的識別資訊。
- 資料狀態、建立時間、結算時間及必要的異常提示。

### 2.2 本頁不包含

- DEMO 或 Test 環境的遊戲資料。
- Game Session；本產品以 Game Round 作為主要業務紀錄單位，不另外建立 Session 實體。
- 會員、代理商、商戶主資料的建立或維護。
- 會員錢包餘額、錢包調整或平台端資金操作。
- 代理商個別遊戲開關；該控制權屬於 GGAP。
- 直接修改、刪除或重算已成立的正式 Game Round。

### 2.3 資料可見性原則

- Provider Portal 僅顯示登入遊戲商所屬資料。
- 商戶與代理商可作為 GGAP 整合脈絡，但不在本頁呈現其主資料維護能力。
- 權限模型尚待正式定義；前端不可只依隱藏按鈕作為存取控制。
- 查詢與匯出均應由後端執行資料範圍檢核。

## 3. 名詞與計算口徑

| 名詞 | 定義 |
| --- | --- |
| Game Round | 一次可獨立追蹤、結算與對帳的遊戲回合，是本頁唯一主要紀錄單位。 |
| Provider 點數 | 本系統正式金額的主要呈現與計算單位。 |
| USDT 對照值 | 依指定匯率換算的參考金額，不取代 Provider 點數原值。 |
| 投注金額 | Game Round 接受的原始投注點數。 |
| 有效投注 | 依遊戲規則可計入報表與結算口徑的投注點數。 |
| 派彩金額 | Game Round 結果產生的派彩點數。 |
| 遊戲商輸贏 | 以遊戲商角度計算；暫定公式為「有效投注 − 派彩」，最終以財務口徑確認為準。 |
| Provider Round ID | Provider 端的 Game Round 唯一識別碼。 |
| GGAP Round ID | GGAP 端對應的 Game Round 識別碼。 |

> 金額欄位不得只顯示 USDT。若顯示換算值，必須同時保留 Provider 點數原值、換算匯率及匯率時間或版本，避免事後無法還原。

## 4. 資訊架構與頁面區塊

頁面由上至下分為六個區塊：

1. 頁首：標題、用途說明、最後資料更新時間與匯出入口。
2. 查詢條件：時間區間、識別碼、遊戲、幣別及狀態。
3. 查詢摘要：命中筆數、套用條件與必要的金額彙總。
4. 紀錄列表：主要欄位、排序、分頁與單筆明細入口。
5. 空白／錯誤狀態：無資料、查詢失敗、權限不足與匯出狀態。
6. Game Round 明細：以側邊抽屜或獨立內容區呈現單筆完整資訊。

<!-- PAGE_VISUAL_START -->
<figure class="page-anatomy" aria-label="遊戲紀錄頁面六區塊畫面示意">
    <div class="page-anatomy__canvas">
        <div class="page-anatomy__main">
            <a class="anatomy-zone anatomy-zone--header" href="#4-1-頁首行為" aria-label="前往第一區，頁首行為規格">
                <span class="anatomy-zone__number">01</span>
                <span class="anatomy-zone__body">
                    <span class="anatomy-zone__kicker">數據與報表　›　遊戲紀錄</span>
                    <strong>遊戲紀錄</strong>
                    <small>正式 Game Round 的查詢、對帳與追蹤入口</small>
                </span>
                <span class="anatomy-zone__meta">最後更新 2026-08-13 12:00</span>
                <span class="anatomy-zone__action">↻ 更新</span>
                <span class="anatomy-scope-rail">
                    <span class="anatomy-scope-item"><i>◉</i><small>資料範圍</small><strong>Production only</strong></span>
                    <span class="anatomy-scope-item"><i>▤</i><small>金額邏輯</small><strong>點數為主</strong></span>
                    <span class="anatomy-scope-item"><i>ⓘ</i><small>顯示原則</small><strong>USDT 於詳情提供</strong></span>
                </span>
            </a>
            <a class="anatomy-zone anatomy-zone--filters" href="#5-查詢條件" aria-label="前往第二區，查詢條件規格">
                <span class="anatomy-zone__number">02</span>
                <span class="anatomy-zone__label">查詢條件</span>
                <span class="anatomy-zone__description">依時間、遊戲、識別碼、會員與狀態查詢正式 Game Round。</span>
                <span class="anatomy-field anatomy-field--wide">結算時間區間 <i>2026-08-13 00:00　—　23:59</i></span>
                <span class="anatomy-field">遊戲名稱 / ID <i>搜尋遊戲</i></span>
                <span class="anatomy-field">代理商名稱 / ID <i>全部代理商</i></span>
                <span class="anatomy-field">遊戲類型 <i>全部類型　⌄</i></span>
                <span class="anatomy-field">Provider Round ID <i>完整 ID</i></span>
                <span class="anatomy-field">GGAP Round ID <i>完整 ID</i></span>
                <span class="anatomy-field">會員 ID <i>輸入會員 ID</i></span>
                <span class="anatomy-field">結算狀態 <i>全部狀態　⌄</i></span>
                <span class="anatomy-filter-actions"><b>⌕　查詢</b><i>↻　重置</i></span>
            </a>
            <a class="anatomy-zone anatomy-zone--summary" href="#7-查詢摘要與彙總" aria-label="前往第三區，查詢摘要與彙總規格">
                <span class="anatomy-zone__number">03</span>
                <span class="anatomy-zone__label">查詢摘要</span>
                <span class="anatomy-result-copy"><strong>目前顯示 17 筆正式 Game Round</strong><small>settled_at 新到舊排序 · Production only</small></span>
                <span class="anatomy-stat"><small>投注額</small><strong>1.82M</strong></span>
                <span class="anatomy-stat"><small>派彩額</small><strong>1.64M</strong></span>
                <span class="anatomy-toolbar-actions"><i>↻</i><b>▧ CSV</b><b>▦ Excel</b></span>
            </a>
            <a class="anatomy-zone anatomy-zone--records" href="#6-列表規格" aria-label="前往第四區，紀錄列表規格">
                <span class="anatomy-zone__number">04</span>
                <span class="anatomy-zone__label">紀錄列表</span>
                <span class="anatomy-table" aria-hidden="true">
                    <span class="anatomy-table__row anatomy-table__row--head"><i>#</i><i>結算時間</i><i>Provider Round ID</i><i>GGAP Round ID</i><i>遊戲名稱</i><i>狀態</i><i>操作</i></span>
                    <span class="anatomy-table__row"><i>1</i><i>15:18:42</i><i>round-…0098</i><i>ggap-r-8f31a9</i><i>星際寶藏</i><i class="anatomy-table__status">已結算</i><i class="anatomy-table__link">↗ 詳情</i></span>
                    <span class="anatomy-table__row"><i>2</i><i>15:14:18</i><i>round-…0097</i><i>ggap-r-7c20dd</i><i>Skyline Crash</i><i class="anatomy-table__status">已結算</i><i class="anatomy-table__link">↗ 詳情</i></span>
                    <span class="anatomy-table__row"><i>3</i><i>15:07:03</i><i>round-…0096</i><i>ggap-r-69b115</i><i>Mini Burst</i><i class="anatomy-table__status">處理中</i><i class="anatomy-table__link">↗ 詳情</i></span>
                </span>
                <span class="anatomy-pagination">1–17 / 17　　‹　›</span>
            </a>
            <a class="anatomy-zone anatomy-zone--states" href="#12-頁面狀態與錯誤處理" aria-label="前往第五區，頁面狀態與錯誤處理規格">
                <span class="anatomy-zone__number">05</span>
                <span class="anatomy-zone__label">替代狀態</span>
                <span class="anatomy-state"><i>⌕</i>無資料</span>
                <span class="anatomy-state anatomy-state--error"><i>!</i>查詢失敗</span>
                <span class="anatomy-state"><i>⊘</i>權限不足</span>
                <span class="anatomy-state"><i>⇩</i>匯出處理中</span>
                <small class="anatomy-state-note">依情境取代列表內容，不與正常列表同時顯示</small>
            </a>
        </div>
        <a class="anatomy-zone anatomy-zone--drawer" href="#8-game-round-明細" aria-label="前往第六區，Game Round 明細規格">
            <span class="anatomy-zone__number">06</span>
            <span class="anatomy-zone__label">Game Round 詳情 Dialog</span>
            <span class="anatomy-drawer__title">round-20260805-0098 / Game Round 詳情 <i>×</i></span>
            <span class="anatomy-drawer__hero"><small>PRODUCTION GAME ROUND</small><strong>星際寶藏</strong><i>slot-orbit · 老虎機 · 3.8.1</i></span>
            <span class="anatomy-drawer__status">已結算</span>
            <span class="anatomy-drawer__group"><strong>識別與狀態 <em>TRACEABILITY</em></strong><i>Provider / GGAP Round ID</i><i>Request ID / 狀態說明</i></span>
            <span class="anatomy-drawer__group"><strong>遊戲與 GGAP 脈絡 <em>CONTEXT SNAPSHOT</em></strong><i>遊戲 / 版本 / 代理商</i><i>會員 / GGAP 幣別</i></span>
            <span class="anatomy-drawer__group"><strong>時間 <em>EVENT TIMELINE</em></strong><i>建立 / 結算 / 更新時間</i></span>
            <span class="anatomy-drawer__group anatomy-drawer__group--amount"><strong>金額與換算 <em>POINTS FIRST</em></strong><i>投注額　100.00　1.00 USDT</i><i>派彩額　260.00　2.60 USDT</i><i>玩家淨輸贏　+160.00　+1.60 USDT</i></span>
            <small class="anatomy-drawer__note">現行原型：大型置中 Dialog<br>窄螢幕：接近全頁內容</small>
        </a>
    </div>
    <div class="page-anatomy__legend" aria-label="示意圖說明">
        <span><i></i>主要閱讀順序</span>
        <span><i></i>替代畫面狀態</span>
        <span><i></i>選取單筆後開啟</span>
        <small>參照現行原型；固定 mock 值不代表正式資料契約。</small>
    </div>
</figure>
<!-- PAGE_VISUAL_END -->

### 4.1 頁首行為

- 頁面主標題使用「遊戲紀錄」。
- 輔助說明明確指出「僅含正式環境 Game Round」。
- 「匯出」依目前已套用的查詢條件執行，不得匯出使用者無權查看的資料。
- 最後更新時間代表列表資料的查詢完成時間，不等同資料來源的最終結算時間。

## 5. 查詢條件

### 5.1 條件定義

| 介面欄位 | 技術欄位 | 型別 | 必填 | 預設 | 規則 |
| --- | --- | --- | --- | --- | --- |
| 時間類型 | `time_type` | enum | 是 | `settled_at` | Draft：可選結算時間或建立時間。 |
| 起始時間 | `start_at` | ISO 8601 datetime | 是 | 當日 00:00 | 與結束時間使用同一時區。 |
| 結束時間 | `end_at` | ISO 8601 datetime | 是 | 查詢當下 | 不得早於起始時間。 |
| 遊戲商遊戲回合 ID | `provider_round_id` | string | 否 | 空 | 精確比對；忽略前後空白。 |
| GGAP 遊戲回合 ID | `ggap_round_id` | string | 否 | 空 | 精確比對；忽略前後空白。 |
| 遊戲 | `game_id` | string | 否 | 全部 | 顯示遊戲名稱，送出穩定 ID。 |
| 遊戲類型 | `game_type` | enum | 否 | 全部 | 選項沿用遊戲主資料定義。 |
| 幣別 | `currency` | enum | 否 | 全部 | 此處為 Provider 點數計價幣別／代碼。 |
| 回合狀態 | `round_status` | enum[] | 否 | 全部 | 可複選；正式列舉值待後端契約確認。 |
| 每頁筆數 | `page_size` | integer | 是 | 20 | 建議選項：20、50、100。 |

### 5.2 查詢規則

- 預設時間區間及最大可查區間屬營運與效能政策，列為 TBD。
- 識別碼查詢若有值，可保留其他條件，但介面應提示實際套用的條件。
- 按下「查詢」後才套用表單變更；「重設」恢復預設值並重新查詢。
- 查詢條件需反映於 URL query string，以支援重新整理、書籤及跨頁帶入。
- URL 不得包含會員敏感資料；目前識別碼是否可放入 URL，須由資安與資料分級確認。
- 時區固定顯示於日期選擇器與列表欄名附近，禁止以瀏覽器時區默默轉換。
- 正式時區與日期格式目前沿用產品全域規則；若全域規則尚未確認，介面標示 `UTC+8` 只是 Draft，不得直接固化至 API。

### 5.3 驗證與提示

| 情境 | 介面反應 |
| --- | --- |
| 結束時間早於起始時間 | 欄位下方顯示錯誤，不送出請求。 |
| 區間超過上限 | 顯示允許的最大範圍，不送出請求。 |
| 無任何命中資料 | 保留條件並顯示空白狀態，不以錯誤提示取代。 |
| 識別碼格式不合法 | 顯示格式說明；正式規則待 ID 契約確認。 |
| 查詢逾時 | 顯示可重試訊息並保留所有條件。 |

## 6. 列表規格

### 6.1 欄位順序

| # | 顯示欄位 | 技術欄位 | 格式與行為 |
| ---: | --- | --- | --- |
| 1 | 結算時間 | `settled_at` | `YYYY-MM-DD HH:mm:ss`＋明示時區；未結算顯示「—」。 |
| 2 | 遊戲商遊戲回合 ID | `provider_round_id` | 等寬字；可複製；點擊開啟明細。 |
| 3 | GGAP 遊戲回合 ID | `ggap_round_id` | 等寬字；可複製；未取得時顯示「—」。 |
| 4 | 遊戲名稱 | `game_name` | 主文字；必要時以 `game_id` 作輔助。 |
| 5 | 遊戲類型 | `game_type` | 使用繁體中文顯示值，保留技術列舉於輔助資訊。 |
| 6 | 會員識別碼 | `member_ref` | 僅顯示允許的遮罩或外部參照值；不得顯示會員主資料。 |
| 7 | 幣別 | `currency` | 技術代碼，例如 `PTS`。 |
| 8 | 投注金額 | `bet_amount` | Provider 點數、右對齊、固定小數規則。 |
| 9 | 有效投注 | `valid_bet_amount` | Provider 點數、右對齊。 |
| 10 | 派彩金額 | `payout_amount` | Provider 點數、右對齊。 |
| 11 | 遊戲商輸贏 | `provider_net_amount` | Provider 角度；正負色彩不可作為唯一提示。 |
| 12 | USDT 對照值 | `provider_net_usdt` | 參考值；顯示換算提示，禁止取代點數欄位。 |
| 13 | 回合狀態 | `round_status` | 狀態標籤；文字與色彩雙重辨識。 |
| 14 | 建立時間 | `created_at` | `YYYY-MM-DD HH:mm:ss`＋明示時區。 |
| 15 | 更新時間 | `updated_at` | 用於辨識後續狀態異動。 |
| 16 | 操作 | — | 「查看明細」；不得提供編輯或刪除。 |

> 會員識別碼的來源、遮罩方式與名稱仍屬 TBD。Provider 不管理會員主資料；本欄僅供必要的交易追查，不能延伸為會員管理入口。

### 6.2 顯示格式

- 金額以千分位呈現，負數使用前置負號；小數位依幣別設定，不由前端自行四捨五入為固定兩位。
- `null`、缺值與數值 `0` 必須明確區分：缺值顯示「—」，零值顯示合法的 `0` 格式。
- ID 不換行並可複製；過長時可視覺截斷，但複製值與可存取名稱需保留完整內容。
- 狀態標籤採繁體中文主標籤；API enum 原值可在明細或輔助提示顯示。
- 表頭應保持可見；窄螢幕允許水平捲動，不可任意隱藏對帳必要欄位而未提供替代入口。

### 6.3 排序與分頁

- 預設以 `settled_at desc` 排序；未結算紀錄的順序規則列為 TBD。
- 可排序欄位建議為結算時間、投注金額、有效投注、派彩、遊戲商輸贏及建立時間。
- 排序由後端執行，前端不得只排序目前頁資料。
- 切換排序或每頁筆數時回到第一頁。
- 分頁需顯示總筆數、目前範圍、目前頁與總頁數；若後端採 cursor pagination，總頁數行為需另行調整。
- 分頁模型（offset 或 cursor）尚未確認，列為 API 契約 TBD。

## 7. 查詢摘要與彙總

查詢結果上方顯示：

- 命中總筆數。
- 查詢時間區間與時區。
- 已套用的非預設條件。
- Draft：投注、有效投注、派彩及遊戲商輸贏合計。

若顯示合計：

- 必須由後端針對完整查詢結果計算，不得加總目前頁資料冒充總計。
- 不同幣別不可直接合併為單一 Provider 點數總額。
- USDT 對照總額需揭露換算口徑；若各筆匯率不同，須以逐筆換算後加總並清楚標示。
- 合計與匯出使用相同查詢條件及資料版本策略。

## 8. Game Round 明細

### 8.1 開啟與關閉

- 從列表「遊戲商遊戲回合 ID」或「查看明細」開啟。
- Desktop 建議使用右側抽屜；Mobile 使用全頁內容。
- 開啟後可將識別碼反映於 URL，確切路由模型列為 TBD。
- 關閉後回到原列表捲動位置，保留查詢、排序及分頁。
- 支援直接連結時，重新整理仍應載入相同 Game Round 或顯示明確的不存在／無權限狀態。

### 8.2 明細區塊

#### 基本識別資訊

| 顯示欄位 | 技術欄位 | 備註 |
| --- | --- | --- |
| 遊戲商遊戲回合 ID | `provider_round_id` | 必須唯一且可複製。 |
| GGAP 遊戲回合 ID | `ggap_round_id` | 可為尚未取得；不可用空字串混同。 |
| 外部交易追蹤 ID | `external_transaction_id` | 是否存在與命名待整合契約確認。 |
| 回合狀態 | `round_status` | 顯示中文標籤與技術值。 |
| 資料環境 | `environment` | 本頁只允許 `production`。 |

#### 遊戲資訊

| 顯示欄位 | 技術欄位 | 備註 |
| --- | --- | --- |
| 遊戲 ID | `game_id` | 對應 Provider 遊戲主資料。 |
| 遊戲名稱 | `game_name` | 顯示回合成立時或查詢時名稱，版本策略待確認。 |
| 遊戲類型 | `game_type` | 使用既有列舉。 |
| 遊戲版本 | `game_version` | 應能追溯回合實際使用版本。 |
| 數值版本 | `math_version` | 若適用，應能追溯回合實際規則版本。 |

#### 參與者與整合參照

| 顯示欄位 | 技術欄位 | 備註 |
| --- | --- | --- |
| 會員識別碼 | `member_ref` | 只能呈現授權的外部參照或遮罩值。 |
| GGAP 參照 | `ggap_reference` | 格式待整合契約確認。 |
| 來源系統 | `source_system` | Draft；用於追查資料流，不作主資料管理。 |

#### 金額資訊

| 顯示欄位 | 技術欄位 | 備註 |
| --- | --- | --- |
| 投注金額 | `bet_amount` | Provider 點數原值。 |
| 有效投注 | `valid_bet_amount` | Provider 點數原值。 |
| 派彩金額 | `payout_amount` | Provider 點數原值。 |
| 遊戲商輸贏 | `provider_net_amount` | Provider 角度；公式需與財務規格一致。 |
| 幣別 | `currency` | 不得只由顯示符號推測。 |
| USDT 匯率 | `usdt_rate` | 匯率方向、精度與來源待確認。 |
| USDT 對照值 | `provider_net_usdt` | 僅供對照。 |
| 匯率時間／版本 | `rate_effective_at` / `rate_version` | 至少需有一種可重現依據。 |

#### 時間軸

| 顯示欄位 | 技術欄位 | 備註 |
| --- | --- | --- |
| 回合建立時間 | `created_at` | 必填。 |
| 投注接受時間 | `bet_accepted_at` | 是否獨立紀錄待確認。 |
| 結算時間 | `settled_at` | 未結算可為 `null`。 |
| 最後更新時間 | `updated_at` | 用於追蹤狀態變化。 |

#### 原始資訊與事件

- 是否顯示原始 request／response、遊戲結果 payload 或狀態事件時間軸，屬資安、個資與支援流程的共同決策，現階段標示 TBD。
- 若未來提供，敏感值必須遮罩，並設定獨立權限與稽核紀錄。
- 原始 payload 不得成為列表必要欄位，也不得阻塞一般查詢。

## 9. 狀態模型

正式 `round_status` enum 尚待 GGAP 整合契約與後端共同確認。介面骨架至少需區分以下語意，而非直接將下列英文視為已核准 API 值：

| 業務語意 | Draft 技術值 | 是否終態 | 說明 |
| --- | --- | --- | --- |
| 處理中 | `processing` | 否 | 回合已建立但尚未完成結算。 |
| 已結算 | `settled` | 是 | 回合已完成正常結算。 |
| 已取消 | `cancelled` | 是 | 回合依規則取消；金額口徑待定。 |
| 結算失敗 | `failed` | 否／待定 | 需後續重試或人工處理。 |
| 已調整 | `adjusted` | 是／待定 | 是否允許及其財務處理方式尚未定義。 |

狀態規則：

- 前端只依後端狀態呈現，不自行推導正式狀態。
- 狀態變更需具備可追溯時間與來源。
- 終態是否可再次變更、取消與調整的業務流程均列為 TBD。
- 相同列舉需在遊戲紀錄、財務、監控、風控及匯出中採一致語意。

## 10. 匯出規格

### 10.1 觸發與範圍

- 匯出套用目前已送出的查詢條件、排序及資料範圍權限。
- 不應只匯出目前頁；預設為完整命中結果，但受單次上限與非同步策略限制。
- 匯出格式暫定 CSV；XLSX 是否提供列為 TBD。
- 大量資料應建立非同步匯出任務，完成後透過站內通知或匯出中心下載；實際流程待通知與後端規格確認。

### 10.2 匯出欄位

- 至少包含列表的 15 個資料欄位，不包含「操作」。
- 時間欄位需包含時區或使用 ISO 8601。
- 金額輸出原始精度，不以畫面格式化字串取代數值。
- USDT 對照值需一併輸出匯率與匯率版本／時間。
- 匯出標頭語言、檔名格式、編碼與公式注入防護列為後端／資安驗收項目。

### 10.3 匯出狀態

介面至少區分：建立中、處理中、已完成、失敗、已過期。下載連結需具有效期與授權檢查，不得為永久公開網址。

## 11. API 契約草案

> 本節是前後端討論用 Draft，不是已核准的正式 API。路徑、欄位與分頁模型應在整合契約定稿後更新。

### 11.1 列表查詢

`GET /api/provider/v1/game-rounds`

建議 query parameters：

```text
time_type=settled_at
start_at=2026-08-13T00:00:00+08:00
end_at=2026-08-13T23:59:59+08:00
provider_round_id=
ggap_round_id=
game_id=
game_type=
currency=
round_status=
sort=settled_at:desc
page=1
page_size=20
```

建議 response envelope：

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 0,
    "total_pages": 0
  },
  "summary": {
    "by_currency": []
  },
  "meta": {
    "generated_at": "2026-08-13T12:00:00+08:00",
    "timezone": "Asia/Taipei"
  }
}
```

### 11.2 單筆明細

`GET /api/provider/v1/game-rounds/{provider_round_id}`

- 路徑識別碼採 Provider Round ID 或內部不可變 ID，待後端確認。
- 查無資料與無權限不可洩漏額外資料；HTTP status 與錯誤碼需納入共用錯誤契約。

### 11.3 建立匯出任務

`POST /api/provider/v1/game-round-exports`

- Request 重用已正規化的查詢條件。
- Response 回傳 export job ID、狀態、建立時間與預估／限制資訊。
- 任務查詢、下載與過期策略需納入正式匯出契約。

### 11.4 共用契約要求

- 金額使用字串或可保證精度的 decimal 表達，禁止以 binary floating point 傳遞正式財務值。
- 日期時間使用 ISO 8601 並包含 offset；另由 `meta.timezone` 說明顯示時區。
- Enum 使用穩定技術值，顯示文案由前端語系資源處理。
- 錯誤回應需包含穩定 `code`、可顯示訊息或訊息 key、追蹤 ID，以及必要的欄位錯誤。
- 列表與匯出需採一致的資料範圍、條件正規化與金額口徑。

## 12. 頁面狀態與錯誤處理

| 狀態 | 必要介面 |
| --- | --- |
| 首次載入 | 顯示列表骨架，不以全頁 Spinner 阻塞頁首與條件。 |
| 重新查詢 | 保留表單；列表顯示局部載入狀態並避免重複送出。 |
| 無資料 | 顯示「目前條件找不到正式遊戲紀錄」及重設條件入口。 |
| 查詢失敗 | 顯示可重試訊息與追蹤 ID；保留原查詢條件。 |
| 明細載入失敗 | 明細區顯示錯誤，不清空底層列表。 |
| 無權限 | 顯示權限不足，不透露資料是否存在。 |
| 匯出建立中 | 禁用重複觸發或提示已建立任務。 |
| 匯出失敗 | 顯示失敗原因類型與重試入口；不顯示內部例外。 |
| 部分欄位缺值 | 以「—」呈現並保留其他合法資料，不使整列崩潰。 |

## 13. 響應式與可存取性

### 13.1 Desktop

- 查詢條件可採多欄排列，主要操作保持在一致位置。
- 列表可水平捲動；識別碼、金額與操作欄的固定策略應以實際可用寬度測試。
- 明細抽屜寬度需足以閱讀 ID、金額與表格，不應遮蔽關閉操作。

### 13.2 Tablet 與 Mobile

- 查詢條件改為單欄或雙欄，操作按鈕需有清楚的套用／重設順序。
- 表格保留水平捲動，或轉為以單筆摘要卡＋明細方式呈現；若採卡片，不得遺失對帳必要欄位。
- 明細使用全頁呈現，提供明確返回列表操作並保留原狀態。

### 13.3 可存取性

- 所有表單欄位具程式可辨識的 label、錯誤說明與必填狀態。
- 表格使用正確表頭關聯；排序按鈕提供目前排序狀態。
- 鍵盤可操作查詢、分頁、複製 ID、開啟與關閉明細。
- 焦點開啟明細時移入明細，關閉後回到原觸發元素。
- 狀態與正負值不可僅依顏色傳達。
- 載入完成、錯誤及匯出狀態需以適當 live region 通知輔助科技。

## 14. 前端實作要求

- URL 是已套用查詢狀態的可重建來源，表單編輯狀態與已套用狀態分離。
- API request／response 透過明確型別與 mapper 轉為 view model，不在 template 內散落格式轉換。
- 金額格式化集中處理並依幣別精度設定；不得使用 `Number` 進行正式金額運算。
- 日期格式化集中處理，明示輸入與顯示時區。
- 列舉顯示值由共用定義管理，不在元件中重複硬編碼。
- 查詢競態需處理；較早的 response 不得覆蓋較新的查詢結果。
- 列表、明細及匯出錯誤狀態分開管理。
- 介面主文案使用台灣繁體中文，英文只保留技術值、ID、協定與必要選項輔助。

## 15. 後端實作要求

- 強制依登入 Provider 限制資料範圍，並對列表、明細、彙總、匯出採相同規則。
- Production 查詢不可混入 DEMO 或 Test 資料；環境隔離需在資料層或查詢層可驗證。
- 查詢條件、排序欄位及區間上限採 allowlist 驗證。
- 金額與匯率使用 decimal 精度；保留可重現換算結果的依據。
- 大量查詢與匯出需有資源限制、逾時策略及必要的非同步處理。
- 敏感識別資訊需依資料分級遮罩，查詢與匯出另行檢核權限。
- 記錄必要稽核資訊，包括查詢追蹤 ID 與匯出建立／下載事件；正式稽核範圍待資安規格確認。
- 索引與查詢計畫需以目標資料量驗證，不能只以 mock 資料判斷效能。

## 16. 整合與資料一致性

- Provider Round ID 與 GGAP Round ID 的唯一性、生成方、交換時點與重送行為必須在整合契約中定義。
- Game Round 狀態與金額口徑需與《財務總覽》及《代理商 × 遊戲彙總》一致；兩個財務頁只能聚合本頁所定義的有效 Production Game Round。
- `/finance` 負責全域摘要、趨勢與遊戲排行；`/finance/agent-games` 負責 `agent_id × game_id` 分組；兩頁都不得建立第二套 Game Round 詳情。
- `/finance/agent-games` 導回本頁時，必須帶入時間、代理商與遊戲條件；本頁重新執行 Provider scope 與權限驗證，不得信任來源 URL。
- 風控告警若關聯 Game Round，應以穩定 ID 導向本頁，而非複製一份不同口徑的回合資料。
- 匯率來源、方向、精度、有效時間與歷史重現策略需與財務模組共用。
- 遊戲名稱、版本及數值版本應能反映回合成立時的實際內容；採 snapshot 或 join 現行主資料仍待決定。
- 重送、冪等、延遲結算、取消、調整及資料更正流程需由 GGAP 整合契約與後端狀態模型共同補齊。

## 17. 驗收條件

### 17.1 功能驗收

1. 使用者可依有效時間區間查詢正式 Game Round，且列表不包含 DEMO／Test 資料。
2. 使用 Provider Round ID 或 GGAP Round ID 可精確定位授權範圍內的紀錄。
3. 切換排序與分頁時由後端取得正確資料，並保留其他查詢條件。
4. `0`、負數與缺值依規格正確顯示，不互相混淆。
5. 單筆明細可顯示識別、遊戲、金額與時間資訊，關閉後保留列表狀態。
6. 匯出套用與畫面一致的條件及資料權限，且不只匯出目前頁。
7. 不同幣別的彙總不會被直接加總為單一點數總額。
8. USDT 對照值不會取代 Provider 點數，且具有匯率追溯資訊。

### 17.2 權限與隔離驗收

1. 無法透過修改 URL、query 或 ID 讀取其他 Provider 的 Game Round。
2. 無權限與不存在的回應不洩漏敏感資料。
3. 列表、明細、彙總與匯出採相同資料範圍。
4. Test 資料不會進入正式查詢、彙總或匯出。

### 17.3 體驗與可存取性驗收

1. 查詢驗證錯誤可由鍵盤與輔助科技辨識。
2. 載入、空白、失敗與權限不足具有不同且可理解的狀態。
3. 1280px 寬度可完成查詢、閱讀列表與開啟明細，不發生頁面級非預期裁切。
4. 390px 寬度可完成相同核心流程，且明細返回後保留列表狀態。
5. 不依賴顏色即可辨識狀態與金額正負。

### 17.4 技術驗收

1. 金額傳輸與運算未使用會造成精度遺失的浮點流程。
2. 所有日期時間具明確 offset，畫面清楚標示顯示時區。
3. 查詢競態不會讓舊結果覆蓋新結果。
4. 失敗訊息保留可供支援追查的 request／trace ID。
5. 以預估正式資料量驗證列表查詢與匯出效能，門檻依非功能規格定稿。

## 18. 測試情境清單

| 類別 | 核心情境 |
| --- | --- |
| 查詢 | 預設條件、時間邊界、跨日、無資料、單一與多重條件、精確 ID。 |
| 金額 | 0、負數、大額、高精度、多幣別、匯率缺失。 |
| 狀態 | 處理中、已結算、取消、失敗、後續狀態更新。 |
| 分頁 | 首頁、末頁、查詢後總頁數改變、切換每頁筆數、排序。 |
| 明細 | 正常、缺欄位、找不到、無權限、直接連結、關閉後返回。 |
| 匯出 | 小量同步／非同步、大量超限、失敗重試、過期、權限變更。 |
| 隔離 | 跨 Provider ID、Test 資料混入嘗試、未授權匯出。 |
| 響應式 | Desktop、Tablet、390px Mobile、長 ID、長遊戲名稱。 |
| 可存取性 | 鍵盤、焦點順序、表格表頭、錯誤宣告、狀態非色彩辨識。 |

## 19. 待確認事項

| ID | 待確認事項 | 建議負責角色 | 是否阻擋正式開發 |
| --- | --- | --- | --- |
| GR-001 | 正式 `round_status` 列舉、終態與轉換規則。 | Product／Backend／GGAP | 是 |
| GR-002 | Provider Round ID 與 GGAP Round ID 的唯一性、生成與交換契約。 | Backend／GGAP | 是 |
| GR-003 | 預設與最大查詢時間區間。 | Product／Backend／SRE | 否，阻擋驗收 |
| GR-004 | 分頁採 offset 或 cursor，以及是否保證總筆數。 | Backend／Frontend | 是 |
| GR-005 | 遊戲商輸贏的正式公式與取消／調整口徑。 | Product／Finance／Backend | 是 |
| GR-006 | USDT 匯率來源、方向、精度、有效時間與歷史重現。 | Finance／Backend | 是 |
| GR-007 | 會員識別碼的來源、名稱、遮罩與查詢權限。 | Product／Security／GGAP | 是 |
| GR-008 | 回合名稱與版本資訊採交易 snapshot 或查詢時 join。 | Backend／Data | 是 |
| GR-009 | 明細是否可顯示原始 payload／事件時間軸及其權限。 | Security／Support／Backend | 否 |
| GR-010 | 匯出格式、上限、非同步流程、保存期限及通知方式。 | Product／Backend／Frontend | 是 |
| GR-011 | URL 是否允許帶入 Round ID，以及資料分級限制。 | Security／Frontend | 否 |
| GR-012 | 目標資料量、查詢延遲與匯出完成時間門檻。 | Product／Backend／SRE | 是，阻擋效能驗收 |
| GR-013 | 正式 API 路徑、錯誤 envelope 與 trace ID 規則。 | Backend／Frontend | 是 |
| GR-014 | 取消、調整、延遲結算與重送的處理流程。 | Product／Backend／GGAP | 是 |

上述 `GR-*` 為本頁既有局部追蹤碼；跨頁決策以集中 TBD 為治理入口：

| 集中 TBD | 對應本頁範圍 |
| --- | --- |
| `TBD-DOM-001`、`TBD-DOM-002` | Game Round 生命週期、有效財務資料、公式與正負方向 |
| `TBD-DAT-001`、`TBD-DAT-002`、`TBD-DAT-003`、`TBD-DAT-004` | 精度、匯率、識別快照、時區、保存與更正 |
| `TBD-API-001`、`TBD-API-002`、`TBD-API-003` | 共通 API、Round 查詢／詳情／匯出、財務 deep link |
| `TBD-SEC-001`、`TBD-SEC-002`、`TBD-SEC-004`、`TBD-EXT-003` | scope、遮罩、匯出、permission key 與 audit |
| `TBD-NFR-001`、`TBD-NFR-003` | 查詢／匯出效能、冪等、重試與可觀測性 |
| `TBD-EXT-001` | GGAP 正式識別、Callback、ACK 與重送契約 |

## 20. 規格完成條件

本章可由 Draft 升為 Confirmed 的條件：

1. 所有標記「阻擋正式開發」的待確認事項均有決議與責任人。
2. 正式 API schema、狀態 enum、錯誤契約與範例完成審查。
3. 金額、匯率及遊戲商輸贏口徑與財務模組一致。
4. 資料隔離、會員識別資訊與匯出權限通過資安審查。
5. 前端互動、響應式方案與可存取性驗收條件確認。
6. GGAP 整合識別碼與 Game Round 生命週期契約定稿。
