export const websiteLocales = ['繁中', '簡中', 'English', '日本語'] as const
export type WebsiteLocale = (typeof websiteLocales)[number]

export type WebsiteBannerStatus = '已發布' | '草稿' | '已停用'

export interface WebsiteBannerCopy {
    eyebrow: string
    title: string
    description: string
    ctaLabel: string
}

export interface WebsiteBanner {
    id: string
    name: string
    slot: string
    status: WebsiteBannerStatus
    order: number
    updatedAt: string
    startAt: string
    endAt: string
    imageClass: string
    link: string
    copies: Record<WebsiteLocale, WebsiteBannerCopy>
}

export const websiteBanners: WebsiteBanner[] = [
    {
        id: 'banner-aurora',
        name: 'Aurora Launch / 迎光而行',
        slot: '首頁主視覺',
        status: '已發布',
        order: 1,
        updatedAt: '2026-08-04 15:20',
        startAt: '2026-08-01 00:00',
        endAt: '—',
        imageClass: 'website-art-aurora',
        link: '/games/aurora',
        copies: {
            繁中: { eyebrow: 'NEW RELEASE', title: '在極光之下，開始下一局', description: '探索 Provider 最新推出的遊戲體驗。', ctaLabel: '探索遊戲' },
            簡中: { eyebrow: 'NEW RELEASE', title: '在极光之下，开始下一局', description: '探索 Provider 最新推出的游戏体验。', ctaLabel: '探索游戏' },
            English: { eyebrow: 'NEW RELEASE', title: 'Your next round begins beneath the aurora.', description: 'Discover the latest game experience from our studio.', ctaLabel: 'Explore games' },
            日本語: { eyebrow: 'NEW RELEASE', title: 'オーロラの下で、次のゲームへ。', description: 'Provider の最新ゲーム体験をお楽しみください。', ctaLabel: 'ゲームを見る' },
        },
    },
    {
        id: 'banner-midnight',
        name: 'Midnight Table / 深夜牌局',
        slot: '首頁第二區塊',
        status: '已發布',
        order: 2,
        updatedAt: '2026-07-28 10:05',
        startAt: '2026-07-25 00:00',
        endAt: '2026-09-30 23:59',
        imageClass: 'website-art-midnight',
        link: '/games/midnight-table',
        copies: {
            繁中: { eyebrow: 'TABLE GAMES', title: '夜色正好，牌局剛剛開始', description: '以清晰規則與俐落節奏，享受每一次決策。', ctaLabel: '查看詳情' },
            簡中: { eyebrow: 'TABLE GAMES', title: '夜色正好，牌局刚刚开始', description: '以清晰规则与利落节奏，享受每一次决策。', ctaLabel: '查看详情' },
            English: { eyebrow: 'TABLE GAMES', title: 'The table is set for a midnight run.', description: 'Clear rules, sharp pacing, and room for every decision.', ctaLabel: 'View details' },
            日本語: { eyebrow: 'TABLE GAMES', title: '夜が深まり、ゲームが始まる。', description: '明快なルールとテンポで、一手一手を楽しめます。', ctaLabel: '詳細を見る' },
        },
    },
    {
        id: 'banner-cobalt',
        name: 'Cobalt Notes / 藍色備忘',
        slot: '首頁第三區塊',
        status: '草稿',
        order: 3,
        updatedAt: '2026-08-05 09:40',
        startAt: '尚未排程',
        endAt: '—',
        imageClass: 'website-art-cobalt',
        link: '/games/cobalt-notes',
        copies: {
            繁中: { eyebrow: 'COMING SOON', title: '一段還沒揭曉的藍色故事', description: '新的遊戲內容正在準備中，敬請期待。', ctaLabel: '先收藏' },
            簡中: { eyebrow: 'COMING SOON', title: '一段还未揭晓的蓝色故事', description: '新的游戏内容正在准备中，敬请期待。', ctaLabel: '先收藏' },
            English: { eyebrow: 'COMING SOON', title: 'A blue story, not yet fully revealed.', description: 'Something new is taking shape. Stay close.', ctaLabel: 'Save for later' },
            日本語: { eyebrow: 'COMING SOON', title: 'まだ明かされていない、青い物語。', description: '新しいゲームを準備しています。どうぞお楽しみに。', ctaLabel: '保存する' },
        },
    },
]

export type WebsiteContentKey = 'terms' | 'privacy' | 'responsible' | 'contact'

export const websiteContentTabs: Array<{ key: WebsiteContentKey; label: string; note: string }> = [
    { key: 'terms', label: '條款', note: '使用條款與服務規範' },
    { key: 'privacy', label: '隱私權政策', note: '資料使用與隱私說明' },
    { key: 'responsible', label: '負責任遊戲', note: '玩家保護與自我管理' },
    { key: 'contact', label: '聯絡資訊', note: '客服與 Provider 聯繫方式' },
]

export const websiteContent: Record<Exclude<WebsiteContentKey, 'contact'>, Record<WebsiteLocale, string>> = {
    terms: {
        繁中: '歡迎使用 Provider 提供的遊戲與相關服務。使用本網站或啟動遊戲前，請先閱讀並同意本條款。玩家應遵守所在地適用的法律與規範，並妥善保管自己的帳號資訊。',
        簡中: '欢迎使用 Provider 提供的游戏与相关服务。使用本网站或启动游戏前，请先阅读并同意本条款。玩家应遵守所在地适用的法律与规范，并妥善保管自己的账号信息。',
        English: 'Welcome to the games and services provided by our studio. Please read and accept these terms before using the website or launching a game. Players are responsible for following the laws and regulations that apply to them.',
        日本語: 'Provider が提供するゲームおよび関連サービスをご利用いただきありがとうございます。本サイトの利用またはゲームの起動前に、本規約をご確認ください。プレイヤーは適用される法令を遵守し、アカウント情報を適切に管理するものとします。',
    },
    privacy: {
        繁中: '我們重視玩家的隱私。此政策說明我們如何收集、使用、保存與保護網站及服務運作所需的資訊。除非法律要求或為提供服務所必要，我們不會任意分享個人資料。',
        簡中: '我们重视玩家的隐私。本政策说明我们如何收集、使用、保存与保护网站及服务运营所需的信息。除非法律要求或为提供服务所必要，我们不会任意分享个人资料。',
        English: 'We value player privacy. This policy explains how we collect, use, retain, and protect the information needed to operate our website and services. Personal data is not shared without a legal basis or service necessity.',
        日本語: 'プレイヤーのプライバシーを大切にしています。本ポリシーでは、サイトおよびサービスの運営に必要な情報の収集、利用、保管、保護について説明します。',
    },
    responsible: {
        繁中: '遊戲應該是一種娛樂。請依照自己的時間與預算進行遊戲，不要使用生活所需的金錢。若遊戲開始影響日常生活，請暫停並尋求可信任的協助。',
        簡中: '游戏应该是一种娱乐。请按照自己的时间与预算进行游戏，不要使用生活所需的金钱。若游戏开始影响日常生活，请暂停并寻求可信任的帮助。',
        English: 'Gaming should remain entertainment. Play within your own time and budget, never with money needed for daily life. If gaming begins to affect your routine, take a break and seek trusted support.',
        日本語: 'ゲームはあくまで娯楽として楽しみましょう。時間と予算を決め、生活に必要なお金は使わないでください。日常生活に影響を感じたら、いったん休み、信頼できる窓口へ相談してください。',
    },
}

export interface WebsiteContact {
    supportEmail: string
    supportHours: string
    address: string
    responseNote: string
}

export const websiteContact: Record<WebsiteLocale, WebsiteContact> = {
    繁中: { supportEmail: 'support@example-provider.com', supportHours: '每日 09:00–18:00（UTC+8）', address: '台北市信義區 Provider Studio', responseNote: '一般問題將於 2 個工作日內回覆。' },
    簡中: { supportEmail: 'support@example-provider.com', supportHours: '每日 09:00–18:00（UTC+8）', address: '台北市信义区 Provider Studio', responseNote: '一般问题将在 2 个工作日内回复。' },
    English: { supportEmail: 'support@example-provider.com', supportHours: 'Daily 09:00–18:00 (UTC+8)', address: 'Provider Studio, Xinyi District, Taipei', responseNote: 'General enquiries are answered within two business days.' },
    日本語: { supportEmail: 'support@example-provider.com', supportHours: '毎日 09:00–18:00（UTC+8）', address: '台北市信義区 Provider Studio', responseNote: 'お問い合わせには通常2営業日以内に返信します。' },
}

export type WebsiteReleaseStatus = '已發布' | '草稿'

export interface WebsiteRelease {
    id: string
    version: string
    status: WebsiteReleaseStatus
    scope: string[]
    summary: string
    publishedAt: string
    publisher: string
    note: string
}

export const websiteReleases: WebsiteRelease[] = [
    {
        id: 'release-1-4',
        version: 'v1.4.0',
        status: '已發布',
        scope: ['Banner', '負責任遊戲'],
        summary: '更新 Aurora Launch 主視覺與玩家保護內容。',
        publishedAt: '2026-08-04 15:20',
        publisher: 'Provider Admin',
        note: '配合新遊戲曝光檔期發布。',
    },
    {
        id: 'release-1-3',
        version: 'v1.3.0',
        status: '已發布',
        scope: ['隱私權政策', '聯絡資訊'],
        summary: '整理服務聯絡方式並更新資料使用說明。',
        publishedAt: '2026-07-21 11:05',
        publisher: 'Provider Admin',
        note: '年度內容檢視。',
    },
    {
        id: 'release-1-5',
        version: 'v1.5.0',
        status: '草稿',
        scope: ['Banner'],
        summary: '準備 Cobalt Notes 預告 Banner，尚未排程發布。',
        publishedAt: '尚未發布',
        publisher: 'Provider Editor',
        note: '等待遊戲公開日期確認。',
    },
]

export const websiteStatusClass = (status: WebsiteBannerStatus | WebsiteReleaseStatus) => {
    if (status === '已發布') return 'is-published'
    if (status === '草稿') return 'is-draft'
    return 'is-disabled'
}
