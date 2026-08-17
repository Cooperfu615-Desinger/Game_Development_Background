---
config:
  layout: tidy-tree
  theme: neutral
---
mindmap
  root((Provider Portal 管理層總覽))
    產品定位與責任邊界
      Provider Portal
        GGAP 生態系中的遊戲商後台
        服務產品 營運 財務 風控 技術團隊
        目前以產品 UI 資訊架構與規格骨架為主
        API 權限與整合契約依決策包定版
      Provider 負責
        遊戲主資料與規則
        數值 RTP 程式與素材版本
        Production 與 DEMO 發布
        全域上架 下架與維護
        Game Round 與遊戲紀錄
        遊戲商財務
        自身監控與風控
        官方網站與遊戲大廳
      Provider 不負責
        不建立會員主資料
        不建立代理商或商戶主資料
        不建立或管理玩家錢包
        不管理代理商個別遊戲開關
      GGAP 負責
        聚合平台能力
        代理商 商戶 會員與錢包脈絡
        遊戲啟動與跨系統交易整合
        已上架遊戲的代理商個別開放控制
        正式對接契約等待最新資料整合
    六個核心運作機制
      Game Round 業務核心
        一個玩家業務回合對應一筆主要紀錄
        不另建正式 Game Session
        串連紀錄 財務 監控 風控與稽核
        重試不得重複產生財務效果
        取消 回滾與更正必須可追溯
      三種環境隔離
        Production
          正式遊戲紀錄
          正式財務
          Provider 監控與風控
        DEMO
          展示與試玩 telemetry
          不建立正式會員或錢包
          不進正式財務與 Game Round
        Test
          開發與測試用途
          不進正式紀錄 財務與風控
      遊戲版本與發布
        遊戲主資料
        一般設定版本
        數值版本
        程式版本
        素材版本
        組成 Production 與 DEMO Release
        維護或下架阻擋新 Launch
        已開始 Round 繼續完成
      金額與財務
        Provider 點數為主值
        USDT 為換算對照
        每筆 Round 保存當時換算規則
        歷史資料不使用最新匯率覆寫
        玩家淨輸贏等於派彩減投注
        Provider GGR 等於投注減派彩
        精度與 rounding 待核准
      監控與風控分層
        Monitoring 觀察健康
        Risk Event 分析異常
        Alert 形成處理工作
        Mitigation 執行緩解
        Isolation 阻擋新 Launch
        Audit 保存操作證據
      內容發布
        Draft 草稿
        指定 revision 預覽
        公開前檢查
        發布形成可追溯版本
        發布失敗保留上一公開版本
        官網 大廳 全域狀態分開管理
    功能模組 共 32 頁
      總覽 1 頁
        儀表板
          Production 營運摘要
          遊戲 財務 監控與風控入口
          趨勢與待處理工作
      遊戲管理 6 頁
        遊戲列表
          主資料 環境狀態與 Release 摘要
        環境與發布
          Production 與 DEMO 發布生命週期
        遊戲設定
          一般規則與設定版本
        數值設定
          RTP 機率與遊戲數值版本
        遊戲版本
          程式版本與相容性
        遊戲素材
          圖片 影片 多語與素材版本
      數據與報表 1 頁
        遊戲紀錄
          以 Game Round 為主要紀錄
          多條件查詢與必要金額摘要
          單筆完整詳情與匯出
          財務 監控與風控追溯入口
      遊戲商財務 2 頁
        財務總覽
          投注 派彩 淨輸贏與 GGR
          趨勢 排行 更新時間與匯出
        代理商乘遊戲彙總
          代理商與遊戲交叉分析
          導回相同條件的 Game Round
      遊戲監控與風控 3 頁
        監控總覽
          服務健康 成功率 延遲與遊戲狀態
        風控報表
          Risk Event 嚴重度 趨勢與分析
        風控告警與處理
          Alert 指派 緩解 隔離與解除
      GGAP 對接 5 頁 Deferred
        對接總覽
        遊戲目錄同步
        請求紀錄
        錯誤與補送
        對接設定
        等待最新 Git 契約與測試資料
      通知中心 2 頁 Deferred
        通知列表
        通知偏好
        等待通知產品與事件契約
      官方網站與遊戲大廳 8 頁
        官方網站 3 頁
          Banner 管理
          靜態內容管理
          發布紀錄
        遊戲大廳 5 頁
          大廳總覽
          遊戲清單
          遊戲管理
          DEMO 環境數據
          大廳預覽
      系統設定 4 頁 Deferred
        設定總覽
        使用者與權限
        API Key 與憑證
        操作紀錄
        等待角色 權限 憑證與 audit 規格
    重要報表與工作入口
      跨模組營運
        儀表板
          掌握 Production 營運狀態
          連結財務 監控 風控與工作入口
      單筆交易追溯
        遊戲紀錄
          回查完整 Game Round 脈絡
          支援財務 客服 技術與風控調查
      財務分析
        財務總覽
          整體投注 派彩 淨輸贏與 GGR
        代理商乘遊戲彙總
          找出主要來源 遊戲表現與差異
      服務與風險管理
        監控總覽
          找出服務異常與遊戲健康問題
        風控報表
          分析 Risk Event 與異常趨勢
        風控告警與處理
          執行指派 緩解 隔離 解除與結案
      內容與體驗
        官方網站發布紀錄
          追蹤公開內容版本
        大廳總覽與 DEMO 數據
          掌握公開準備度與試玩表現
    目前規格進度
      Phase 1 已完成
        32 頁範圍凍結
        三層校準與完成度盤點
        四條跨頁業務鏈
        30 項集中 TBD
      Phase 2 已完成 Draft 封版
        21 頁完整 Draft
        查詢 列表 詳情 狀態與驗收骨架
        Overview first 畫面示意
        11 頁維持 Deferred
      Phase 3 進行中
        Decision Pack 01
          Game Round 生命週期
          識別碼與交易快照
          時間 時區與統計窗口
          點數 USDT 匯率與精度
          財務指標與正負方向
        等待 GGAP 與 Provider 後端資料
        後續形成後端 Contract Baseline
    接下來七項規格工作
      1 拆分 Decision Pack 01
        現在可由產品決策
        可先定方向再補技術值
        等待 GGAP 或後端證據
      2 Decision Pack 02 監控與風控
        Risk Event Alert 緩解與隔離
        指標 門檻 窗口與採樣
      3 Decision Pack 03 遊戲版本與發布
        設定 數值 程式與素材版本
        Release 與環境發布
      4 官網與大廳內容發布契約
        草稿 revision 預覽 發布與追溯
        多語 素材與公開狀態
      5 後端契約交付模板
        Domain API schema enum 錯誤 冪等 audit
      6 跨系統驗收情境
        正常 重送 逾時 失敗 回滾 更正與隔離
      7 Git 接收與差異分析
        Repository branch tag commit 與部署版本
        GGAP 現況後端與目標規格差異
        程式現況是證據但不自動成為正式契約
    決策與治理
      文件優先級
        最新核准的 Provider 產品決策
        GGAP 最新正式契約
        API 與前後端交接文件
        實際程式碼與測試結果
        歷史封存文件
      契約形成
        GGAP 正式內容作為外部約束
        Provider 定義自身產品與資料規則
        後端依正式規格提出 Technical Design
        程式現況先作證據再經責任方核准
      不可混淆
        有內容原型不等於正式契約
        Draft 封版不等於 API 與權限 Confirmed
        TBD 是內容待決
        Deferred 是尚未排入製作
        GGAP 代理商開關不等於 Provider 全域上下架
