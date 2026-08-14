export const reconciliationStates = {
    aligned: { label: '大致一致', tone: 'aligned', description: '原型方向符合已確認邊界，仍需補正式契約。' },
    attention: { label: '邊界注意', tone: 'attention', description: '原型含 mock、暫名或可能被誤讀為正式能力的內容。' },
    gap: { label: '原型缺口', tone: 'gap', description: '現行畫面不足以呈現已確認責任或頁面仍為 Placeholder。' },
}

export const pageReconciliation = {
    dashboard: record('attention', [
        '本頁是 Provider 自身遊戲營運、財務、監控與風控的跨模組摘要入口。',
        '正式財務與 Game Round 指標不得混入 DEMO／Test；金額以 Provider 點數為主。',
        'Provider 不因摘要出現代理商、會員或通知脈絡而擁有其主資料。',
    ], [
        '已有期間切換、營運狀態卡、指標卡、趨勢、待處理事項、遊戲概況與最新通知。',
        '卡片數字、告警、通知及跨頁連結皆由前端 mock 提供。',
        'DEMO 目前只出現在環境／發布狀態說明，不納入正式財務指標。',
    ], [
        'Batch B Draft 已定義即時狀態、期間摘要、趨勢、工作入口、遊戲概況及局部降級的時間語意。',
        'Production 財務、Test 排除、精確 deep link 與各區塊驗收已有骨架；正式資料來源、API 與 permission key 仍待核准。',
        '通知中心維持 Deferred；儀表板只保留依賴與降級規則，不反推通知產品規格。',
    ]),
    'game-list': record('aligned', [
        'Provider 負責遊戲主資料、全域上架／下架狀態及各環境的遊戲可服務狀態。',
        'Production、DEMO 與 Test 必須分開顯示；GGAP 另行控制各代理商是否開放已上架遊戲。',
        '版本、數值與素材是 Provider 自有遊戲資料，但各自有獨立管理頁。',
    ], [
        '已有遊戲搜尋、環境狀態篩選、摘要、寬表格、單筆詳情 Dialog 與跨頁入口。',
        '版本發布操作明確標示等待「環境與發布」頁完成，目前以唯讀摘要呈現。',
        '列表、狀態、RTP 與詳情均使用前端 mock。',
    ], [
        'Batch C Draft 已定義三環境摘要、八類篩選、14 欄寬表、RTP Tips、詳情、狀態與精確導流。',
        'Test 只讀、pending release、營運控制與 GGAP 同步的互斥語意及驗收已有骨架。',
        '正式 enum、RTP／同步 API、permission 與外部 GGAP 契約仍依集中 TBD 管理。',
    ]),
    'game-environments': record('gap', [
        'Provider 負責 Production／DEMO 的版本與素材發布，以及遊戲的全域上架／下架。',
        'GGAP 對已上架遊戲控制各代理商是否開放；該能力不屬於 Provider 本頁。',
        'Test 可作開發驗證，但不得混入正式財務、Game Round 或 Provider 風控資料。',
    ], [
        '目前仍使用共用 Placeholder，以環境矩陣、待發布摘要與版本狀態表呈現 blueprint。',
        'Production、DEMO、Test 數量、版本與待發布佇列皆為 mock。',
        '沒有正式發布操作、驗證結果、失敗狀態或發布詳情。',
    ], [
        'Batch C Draft 已定義環境矩陣、發布組合、待發布佇列、preflight、操作前置條件、歷程及替代狀態。',
        'Production／DEMO 可分版、Test 只讀、既有 Round 不受阻斷及 Provider／GGAP 邊界已有完整驗收骨架。',
        '程式仍為 Placeholder；正式狀態機、API、核准／併發、補償與 GGAP 同步仍依集中 TBD 管理。',
    ]),
    'game-settings': record('attention', [
        'Provider 負責自身遊戲設定，不延伸為代理商、商戶或會員層級的設定中心。',
        '影響 Production 的設定變更必須與版本、環境及發布責任保持可追溯關係。',
    ], [
        '已有維護週期模板、限紅模板與基礎選項三個設定區。',
        '表單可在前端操作，包含正式環境是否需要審核等 mock 選項。',
        '沒有正式儲存、驗證、版本綁定、權限或稽核資料流。',
    ], [
        'Batch C Draft 已定義維護／限紅模板、Provider 點數、基礎 enum、版本 snapshot、草稿／驗證／送審與 audit。',
        '原型 USD／TWD 選項不升格為契約；Production 變更不再被視為直接表單儲存。',
        '正式 schema、時區／精度、API、permission、核准與併發仍依集中 TBD 管理。',
    ]),
    'game-math': record('attention', [
        'Provider 負責遊戲數值、RTP、波動度及賠率相關主資料與版本。',
        '數值設定與風控監測相關，但設定責任與異常監測責任不可混成同一資料模型。',
    ], [
        '已有數值摘要、RTP 趨勢、查詢、版本列表、詳情 Dialog 與審核申請 Dialog。',
        '「偏離 ≥ 5%」、審核狀態、樣本量與數值皆為展示 mock；匯出目前停用。',
        '頁面同時呈現設定版本與監控結果，但尚無正式資料來源區分。',
    ], [
        'Batch C Draft 已分開理論數值版本與監控 snapshot，定義趨勢、列表、詳情、模擬、驗證、審核及發布參照。',
        '原型偏離 ≥ 5% 明確保留為 mock；Production／DEMO 分離且 Test 排除風控。',
        '正式 decimal、賠率 schema、門檻／樣本、API、permission、審核與 audit 仍依集中 TBD 管理。',
    ]),
    'game-versions': record('attention', [
        'Provider 負責遊戲版本及全域發布，不管理商戶主資料或商戶層級發布。',
        '版本需與遊戲、數值、素材及環境維持可追溯關係。',
    ], [
        '已有摘要、版本／狀態／發布類型篩選、列表、新增發布入口、匯出與詳情 Dialog。',
        '狀態包含已發布、測試中、維護中、待審核、已回滾，皆為 mock。',
        '摘要中的「影響商戶」是展示欄位，不代表 Provider 建立或管理商戶主資料。',
    ], [
        'Batch C Draft 已定義 version ID／artifact、相容性、精確組合參照、lineage、引用、審核及回復 job。',
        '目標列表移除「影響商戶」管理語意，改用 Provider 環境／遊戲 scope；外部資料只能是 GGAP snapshot。',
        '正式狀態、artifact 保存、API、permission、核准、匯出與 audit 仍依集中 TBD 管理。',
    ]),
    'game-assets': record('aligned', [
        'Provider 負責自身遊戲素材，素材需能關聯遊戲、版本、語系及使用情境。',
        '素材管理不授予 Provider 維護代理商、商戶或會員資料的能力。',
    ], [
        '已有素材摘要、搜尋與篩選、列表、詳情預覽及上傳 Dialog。',
        '素材狀態、語系、關聯版本與上傳流程均為前端 mock。',
        '目前沒有檔案實際上傳、掃描、儲存、發布或失敗資料流。',
    ], [
        'Batch C Draft 已定義 asset／version ID、安全預覽、metadata、語系／usage、上傳、驗證、掃描、審核與 lineage。',
        '替換建立不可變新版本，已引用素材不覆寫；上傳 mock 不被視為正式檔案成功。',
        '正式格式／大小、fallback、儲存、API、下載／匯出、permission、保存與 audit 仍依集中 TBD 管理。',
    ]),
    'game-round-records': record('aligned', [
        'Game Round 是 Provider 的主要業務紀錄單位，不另建 Game Session。',
        '正式遊戲紀錄只包含 Production，不得混入 DEMO／Test；金額以 Provider 點數為主。',
        '代理商、會員及 GGAP 識別碼是交易脈絡快照，不是 Provider 主資料。',
    ], [
        '已有完整頁首、查詢、摘要、列表、替代狀態、匯出與 Game Round 詳情 Dialog。',
        '頁面以前端 mock 驗證 Production only、點數／USDT、雙方 Round ID 與錯誤狀態。',
        '目前是第一個完整規格 Baseline，但 API、資料與權限尚未正式接入。',
    ], [
        '正式 round status、ID 交換、重送、冪等與更正生命週期仍待整合契約。',
        '金額精度、會員識別遮罩、匯出限制與 permission key 尚待核准。',
        'API path、schema、錯誤碼、效能與保存期限仍是草案。',
    ]),
    'finance-overview': record('attention', [
        '本頁是 Provider 自身正式環境財務摘要，不是 GGAP 平台結算或錢包帳務。',
        '只統計有效 Production Game Round；點數為主，USDT 為換算對照。',
    ], [
        '已有期間、遊戲等查詢條件、八張摘要卡、財務／活躍趨勢及遊戲排行。',
        '公式、數字、匯率與圖表由前端 mock 計算，部分文案已標示 prototype／draft。',
        '匯出目前只顯示提示，未建立正式檔案流程。',
    ], [
        'Batch A Draft 已定義同一 applied filters 下的八項摘要、兩類趨勢、遊戲排行、狀態與驗收。',
        'API 能力與資料一致性責任已形成草案；正式 path、schema、公式、精度、匯率與效能門檻仍待核准。',
        '財務資料 scope、permission key、匯出保存與稽核仍依集中 TBD 管理。',
    ]),
    'finance-agent-games': record('attention', [
        '本頁以代理商 × 遊戲作 Provider 財務彙總，但 Provider 不建立或管理代理商主資料。',
        '聚合來源必須是有效 Production Game Round，並可回到授權範圍內的單筆紀錄。',
        '金額以 Provider 點數為主，USDT 僅作換算對照。',
    ], [
        '已有期間／代理商／遊戲查詢、結果摘要、彙總列表、排序分頁、Game Round 詳情與自訂匯出 Dialog。',
        '代理商名稱、會員人數、金額與明細皆為 mock 聚合。',
        '前端以代理商識別呈現報表脈絡，但未建立代理商維護功能。',
    ], [
        'Batch A Draft 已定義 agent_id × game_id 聚合、六項摘要、11 欄列表、伺服器排序分頁與 Round deep link。',
        '自訂匯出、頁面狀態、響應式、API 責任及驗收已有草案；正式 schema、精度與大量資料門檻仍待核准。',
        '代理商快照來源、歷史名稱、授權 scope、permission key 與 GGAP 契約仍依集中 TBD 管理。',
    ]),
    'monitoring-overview': record('aligned', [
        'Provider 監控自身遊戲服務、Game Round、與 GGAP 直接對接及自身告警。',
        'Test 不納入 Provider 風控監控；目前狀態與分析時間窗口必須分開。',
        'GGAP 與代理商之間的平台監控不屬於 Provider 本頁。',
    ], [
        '已有監控範圍／時間／關注項目查詢、五張摘要卡、遊戲監控列表與詳情 Dialog。',
        '健康、成功率、延遲、告警及未處理異常皆以 mock 資料呈現。',
        '可導向風控報表、告警處理及 Game Round，但目前只是前端 route。',
    ], [
        'Batch B Draft 已定義五張卡公式、目前狀態／分析窗口、11 欄列表、詳情、狀態與 deep link。',
        'Production／DEMO 單選、Test 排除、局部降級與無資料顯示已有交付骨架。',
        '正式門檻、採樣、更新頻率、API schema、敏感欄位與 permission key 仍依集中 TBD 管理。',
    ]),
    'risk-reports': record('aligned', [
        '本頁用於 Provider 自身 Risk Event 分析，不等同 Alert 工作佇列。',
        'Test 不納入 Provider 風控；事件需可追溯至相關 Game Round。',
        'Provider 隔離不等於 GGAP 代理商個別遊戲開關。',
    ], [
        '已有摘要、待關注異常、查詢、Risk Event 列表、詳情與關聯 Game Round。',
        '事件類型、嚴重度、門檻、自動緩解及 GGAP 通知均由 mock 呈現。',
        '頁面偏分析與追蹤，處理操作主要導向告警頁。',
    ], [
        'Batch B Draft 已定義 rolling window、五張卡、待關注排序、15 欄列表、大型詳情與精確 deep link。',
        '頁面維持唯讀，處理導向 Alert；Production／DEMO 單選與 Test 排除已有完整驗收骨架。',
        '正式 Event schema／enum、門檻、保存、API、遮罩、匯出與 permission key 仍依集中 TBD 管理。',
    ]),
    'risk-alerts': record('attention', [
        'Alert 是需要追蹤／處理的工作單位，與 Risk Event、緩解狀態及隔離狀態分開。',
        'Test 不納入 Provider 風控；任何隔離都不得阻斷既有 Round 的必要結算、Callback 與 audit。',
        'GGAP 通知狀態不代表 GGAP 已完成平台側處理。',
    ], [
        '已有告警摘要、豐富查詢、工作佇列、詳情、時間線、指派、隔離／解除與結案等操作。',
        '操作結果、狀態流轉、健康檢查、GGAP 通知及重試皆由前端 mock 模擬。',
        '畫面擬真度高，容易被誤認為正式處理流程已核准。',
    ], [
        'Batch B Draft 已定義五張工作卡、16 欄佇列、大型詳情、操作前置條件、四維狀態與衝突處理。',
        '隔離只阻擋新 Launch、既有 Round 持續 Settle／Callback／audit，且 GGAP 通知不等同平台完成。',
        '正式狀態機、allowed-actions、API、permission／核准、冪等、補償、保存與 audit 仍依集中 TBD 管理。',
    ]),
    'website-banners': record('aligned', [
        'Provider 可管理自身遊戲官網的 Banner 素材、文字與發布狀態。',
        '官網內容管理不延伸為 GGAP、代理商或商戶內容管理。',
    ], [
        '已有狀態篩選、Banner 清單、編輯表單、發布資訊與即時預覽。',
        '發布按鈕只顯示模擬提示；資料與素材均為前端 mock。',
        '目前沒有真實媒體上傳、排程、版本或發布 API。',
    ], [
        'Batch D Draft 已定義 Banner／revision、slot、排程、多語文案、素材參照、單筆預覽與發布工作。',
        '草稿與公開 snapshot 分離，發布失敗保持既有公開版本；外部連結、媒體及預覽安全已有驗收骨架。',
        '正式 schema、fallback、媒體限制、API、permission、核准及 audit 仍依集中 TBD 管理。',
    ]),
    'website-content': record('attention', [
        'Provider 可管理自身遊戲官網的法務、聯絡及已納入範圍的靜態內容。',
        '介面以台灣繁體中文為主，多語內容需明確標示語系與 fallback。',
    ], [
        '已有內容分頁、簡易文字編輯骨架、發布按鈕與發布前檢查區。',
        '畫面明示正式版本可能改用富文字編輯器，現況不是最終輸入模型。',
        '發布只顯示 mock 提示，未建立多語、版本與 API 資料流。',
    ], [
        'Batch D Draft 已定義四類內容、四語系 revision、受限富文字、結構化聯絡資訊及區塊獨立發布。',
        'HTML／連結安全、完整度、預覽、版本衝突與失敗不覆蓋公開內容已有驗收骨架。',
        '正式內容 schema、fallback、sanitization、API、特殊權限／核准及 audit 仍依集中 TBD 管理。',
    ]),
    'website-releases': record('attention', [
        'Provider 官網內容發布需留下版本、內容範圍、操作者與時間追溯。',
        '發布紀錄只涵蓋 Provider 自有官網，不代表遊戲版本或 GGAP 上架紀錄。',
    ], [
        '已有發布摘要、狀態篩選、事件列表與單筆版本詳情。',
        '版本、操作者、發布時間及內容差異皆為前端 mock。',
        '沒有真正發布、取消、回復或不可變快照資料流。',
    ], [
        'Batch D Draft 已定義官網 release／job、來源與結果 snapshot、狀態、列表、詳情、timeline 及精確來源導流。',
        '事件不可變、工作／公開狀態分離，回復建立新工作；不擴張為整站打包、全文差異或一鍵回滾。',
        '正式事件 schema、API、permission、錯誤遮罩、保存及 audit 仍依集中 TBD 管理。',
    ]),
    'lobby-overview': record('aligned', [
        '本模組是 Provider 自有遊戲大廳，不是 GGAP 平台大廳或錢包系統。',
        'DEMO 資料必須與 Production Game Round、財務及風控資料隔離。',
    ], [
        '已有遊戲推出狀態、Demo 今日摘要、資料管理、預覽與公開檢查入口。',
        '摘要數字、狀態與檢查結果皆由前端 mock 提供。',
        '頁面目前是導覽型總覽，沒有正式資料新鮮度或失敗狀態。',
    ], [
        'Batch D Draft 已定義三狀態摘要、需注意遊戲、DEMO telemetry、readiness、更新時間及精確工作入口。',
        'DEMO 試玩工作階段不是正式業務 Game Session，且與 Game Round、財務、風控、會員／錢包完全隔離。',
        '正式狀態／指標、來源、更新頻率、API、scope 與 permission 仍依集中 TBD 管理。',
    ]),
    'lobby-games': record('aligned', [
        '本頁呈現 Provider 自有大廳中的遊戲清單與公開資料。',
        '大廳是否顯示遊戲不取代 Provider 全域上架，也不取代 GGAP 代理商個別開放控制。',
    ], [
        '已有關鍵字搜尋、推出狀態篩選、遊戲表格、詳情管理與預覽入口。',
        '版號、上架時間、RTP、波動度、最高倍率與狀態皆為前端 mock。',
        '目前沒有批次選取、儲存、錯誤或正式 API。',
    ], [
        'Batch D Draft 已定義摘要、五類查詢、八欄列表、公開 snapshot、readiness 及精確管理／預覽導流。',
        '列表保持唯讀；大廳玩家狀態不取代 Provider 全域上架，也不取代 GGAP 代理商個別開放。',
        '正式納入／移除、排序、上游參照、API、scope 與 permission 仍依集中 TBD 管理。',
    ]),
    'lobby-management': record('attention', [
        'Provider 可管理自身大廳的公開文字、參數、素材與玩家可見狀態。',
        '公開資料需引用 Provider 遊戲主資料，不得建立另一份相互衝突的遊戲真實來源。',
    ], [
        '已有基本資料、遊戲參數、公開內容、圖片影片、狀態與公開檢查五個分頁。',
        '四語內容、公開數值、玩家狀態及 5／5 檢查結果均為 mock。',
        '表單可操作但沒有草稿、儲存、發布、衝突或權限資料流。',
    ], [
        'Batch D Draft 已分開上游唯讀主資料／核准數值與大廳可編輯內容，定義 draft／published revision。',
        '四語內容、素材／YouTube、三狀態、公開前 blocking、精確草稿預覽、衝突及發布 job 已有驗收骨架。',
        '正式欄位 schema、fallback、檢查規則、API、permission、核准及 audit 仍依集中 TBD 管理。',
    ]),
    'lobby-demo': record('attention', [
        'DEMO 是隔離的展示環境，不得混入正式 Game Round、財務或風控模型。',
        'Provider 不因 DEMO 大廳顯示玩家、Session 或餘額而建立會員或錢包主資料。',
    ], [
        '已有玩家活躍趨勢、Demo 規則、各遊戲表現及匯出按鈕。',
        '頁面明示目前用固定規則產生資料；趨勢、玩家、Session 與表現皆為 mock。',
        '匯出按鈕沒有正式檔案流程。',
    ], [
        'Batch D Draft 已定義 DEMO namespace、identity、試玩工作階段、摘要、趨勢、資料品質、遊戲表現與隔離匯出。',
        '原型 USD 10,000 不升格為錢包契約；DEMO session 只是 telemetry 分組，不建立正式 Game Session 業務單位。',
        '正式 credit／指標、去重、retention、API、識別遮罩與 permission 仍依集中 TBD 管理。',
    ]),
    'lobby-preview': record('attention', [
        '本頁只預覽 Provider 自有遊戲大廳，不建立正式玩家、會員或錢包能力。',
        '預覽中的 DEMO 資料必須與 Production 紀錄、財務與風控隔離。',
    ], [
        '已有類玩家端的大廳導覽、遊戲卡、推出狀態與試玩按鈕。',
        '頁首顯示「DEMO 餘額 USD 10,000.00」，目前只是視覺 mock，不是 Provider 錢包。',
        '預覽資料直接使用前端 mock，沒有草稿／公開版本切換或存取控制。',
    ], [
        'Batch D Draft 已定義 published／指定 draft revision、四語、雙裝置、分類、三狀態、詳情與修正導流。',
        '展示 credit 明確不是錢包；不可玩狀態阻擋 Launch，草稿失效不得靜默切換公開版本。',
        '正式 preview manifest、sandbox launch、token、CSP、cache、API 與 permission 仍依集中 TBD 管理。',
    ]),
}

function record(state, confirmed, prototype, target) {
    return { state, confirmed, prototype, target }
}
