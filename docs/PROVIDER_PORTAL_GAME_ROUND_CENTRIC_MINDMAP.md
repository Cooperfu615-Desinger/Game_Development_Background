---
config:
  layout: tidy-tree
  theme: neutral
---
mindmap
  root((遊戲紀錄 Game Round 業務核心))
    一條主要業務鏈
      遊戲與版本準備
        建立遊戲主資料
        設定一般規則與數值
        準備程式與素材版本
        組成 Production 與 DEMO Release
        玩家入口與 Launch
          官網與大廳提供內容與曝光
          Provider 控制遊戲全域上架
          GGAP 控制各代理商個別開放
          Launch 成功後進入玩法
          形成 Game Round
            保存遊戲 版本 識別 時間與金額
            成為查詢 財務 監控 風控與稽核依據
            向外形成管理資訊
              單筆交易追溯
              財務彙總與遊戲表現
              服務監控與異常分析
              Risk Event 與 Alert
              管理層儀表板
    核心本體 遊戲紀錄
      遊戲紀錄頁
        Route reports
        一列代表一筆 Game Round
        Provider Portal 主要業務追溯入口
        接收財務 監控 風控與支援導流
      一筆 Round 回答什麼
        哪一款遊戲
        使用哪個程式 數值與素材版本
        發生在哪個環境
        Provider GGAP 與 request 識別
        代理商與會員脈絡
        建立 開始 結算與更新時間
        投注 派彩 玩家淨輸贏與 GGR
        點數與 USDT 換算規則
        結算 取消 失敗或回滾狀態
      查詢與操作
        時間區間
        Round request 會員與代理商識別
        遊戲 幣別與狀態
        命中筆數與金額摘要
        伺服器排序與分頁
        單筆詳情
        CSV 與 Excel 匯出
        空資料 失敗 權限與匯出狀態
      單筆詳情
        Round 基本資料
        遊戲與版本 snapshot
        GGAP 與外部識別脈絡
        投注 派彩與換算結果
        狀態與時間軸
        錯誤 回滾與更正追溯
        敏感資料依權限遮罩
      資料邊界
        Game Round 是正式業務紀錄
        不另建正式 Game Session
        正式紀錄只使用 Production
        DEMO 與 Test 不得混入
        Test 不納入 Provider 風控
        Provider 不建立外部角色主資料或錢包
        外部識別只作脈絡與歷史 snapshot
        Provider 點數為主 USDT 為對照
        歷史紀錄不使用最新匯率覆寫
    上游一 遊戲成為可記錄版本 6 頁
      遊戲列表
        管理 Provider 遊戲主資料
        顯示類型 環境 Release 與全域狀態
        連結設定 數值 版本 素材與發布
        Game ID 保存到每筆 Round
      環境與發布
        管理 Production 與 DEMO
        將設定 數值 程式與素材組成 Release
        控制維護 停用與全域上下架
        維護或下架只阻擋新 Launch
        既有 Round 繼續完成
        Release ID 進入 Round snapshot
      遊戲設定
        管理一般規則與行為設定
        修改形成可追溯 revision
        發布指定實際使用版本
        Round 回查生效設定
      數值設定
        管理 RTP 機率與數值版本
        正式數值驗證後才發布
        Round 追溯 math revision
        監控分析數值偏離
      遊戲版本
        管理程式版本 相容性與建置資訊
        程式版本是 Release 組成
        新版本不覆寫歷史
        Round 保存實際執行版本
      遊戲素材
        管理圖片 影片 多語與素材版本
        素材以不可變版本進入 Release
        素材異動不改寫歷史
        玩家曝光與遊戲版本可追溯
    上游二 玩家曝光與 Launch 入口 8 頁
      官方網站 3 頁
        Banner 管理
          管理宣傳內容與曝光順序
          採草稿 預覽與發布
          不直接改變遊戲全域狀態
        靜態內容管理
          管理法務 聯絡資訊與靜態內容
          多語內容具版本與 fallback
          公開內容與遊戲資料分開治理
        發布紀錄
          保存官網內容發布事件
          追溯 revision 結果 時間與操作者
          失敗時保留上一公開版本
      遊戲大廳 5 頁
        大廳總覽
          顯示大廳狀態與遊戲推出情況
          提供管理 預覽與 DEMO 摘要
          不取代全域狀態或 GGAP 開關
        大廳遊戲清單
          顯示已納入大廳的遊戲
          呈現可玩 維護與未開放狀態
          提供管理與預覽導流
        大廳遊戲管理
          編輯標題 敘述 多語內容與媒體
          主資料 數值與版本維持上游唯讀
          公開前完成檢查 預覽與發布
        DEMO 環境數據
          觀察試玩使用量 趨勢與遊戲表現
          DEMO identity 與額度不是會員或錢包
          DEMO telemetry 不形成正式 Game Round
          不進正式財務與 Provider 風控
        大廳預覽
          預覽公開版本或指定草稿 revision
          支援語系 裝置與玩家狀態
          確認 Launch 前的玩家體驗
          預覽不改變公開狀態
      與 Game Round 的關係
        官網與大廳負責曝光與入口
        Launch 前確認遊戲與環境可用
        實際業務玩法才形成 Game Round
        DEMO 預覽不得冒充 Production Round
    下游一 財務報表 2 頁
      財務總覽
        來源是有效 Production Game Round
        依結算時間統計
        投注與派彩總額
        玩家淨輸贏與 Provider GGR
        投注筆數與玩家數
        趨勢 遊戲排行與匯出
        顯示更新時間與計算版本
      代理商乘遊戲彙總
        依 agent ID 與 game ID 聚合
        比較代理商與遊戲的投注 派彩及 GGR
        找出主要來源與異常差異
        不在 Provider 建立代理商主資料
        導回相同條件的 Game Round
      財務共同規則
        只納入有效 settled Production Round
        取消 失敗與完整回滾不形成效果
        玩家淨輸贏等於派彩減投注
        Provider GGR 等於投注減派彩
        點數為主 USDT 加總保存結果
        精度 rounding 與跨期更正待核准
    下游二 監控與風控 3 頁
      監控總覽
        觀察服務健康 成功率 延遲與新鮮度
        結合 Launch request Round 與服務指標
        分開 Production 與 DEMO
        完全排除 Test
        導向遊戲紀錄或風控報表
      風控報表
        將可疑行為整理為 Risk Event
        依時間 環境 遊戲 嚴重度與狀態分析
        從異常指標回查相關 Round
        用於分析而非人工工作佇列
      風控告警與處理
        需要處理的風險形成 Alert
        支援指派 緩解 隔離 解除與結案
        Alert 關聯 Risk Event 與受影響 Round
        隔離只阻擋新 Launch
        既有 Round 持續完成
        高風險操作需要 audit 與權限
      共同規則
        Risk Event 不等於 Alert
        Game Round 是交易證據
        Risk Event 是異常分析單位
        Alert 是人員工作單位
        Test 不進監控與風控
        DEMO 與 Production 不混合
        指標與門檻等待 Decision Pack 02
    下游三 管理層儀表板 1 頁
      儀表板
        呈現 Provider 跨模組營運狀態
        遊戲發布與環境摘要
        Production Game Round 摘要
        投注 派彩與 GGR 趨勢
        服務健康與異常摘要
        Risk Event Alert 與工作入口
        更新時間與資料新鮮度
      儀表板不是新資料來源
        遊戲資料來自遊戲管理
        財務來自有效 Game Round 聚合
        健康狀態來自監控
        風險工作來自 Risk Event 與 Alert
        儀表板只摘要不另立口徑
    Game Round 的六種業務價值
      可追溯
        回到遊戲 版本 時間 識別與處理事件
      可對帳
        單筆 Round 財務彙總與匯出口徑一致
      可監控
        從成功率 延遲與狀態找出問題
      可風控
        關聯 Risk Event Alert 與處理證據
      可發布
        回查實際程式 數值 設定與素材版本
      可決策
        形成財務 遊戲表現與管理層摘要
    目前涵蓋與限制
      已涵蓋 21 頁完整 Draft
        儀表板 1 頁
        遊戲管理 6 頁
        遊戲紀錄 1 頁
        遊戲商財務 2 頁
        監控與風控 3 頁
        官方網站與遊戲大廳 8 頁
      Draft 的意思
        產品與 UI 骨架完整
        查詢 列表 詳情 狀態與驗收可審閱
        不代表正式 API 權限與精度 Confirmed
      本圖未納入 11 個 Deferred 頁
        GGAP 對接 5 頁
        通知中心 2 頁
        系統設定 4 頁
        等待產品內容 後端實作與 GGAP 資料
      接下來收斂
        Decision Pack 01 Game Round 與財務
        Decision Pack 02 監控與風控
        Decision Pack 03 遊戲版本與發布
        官網與大廳發布契約
        後端契約模板與驗收案例
        Git 實作盤點與差異分析
