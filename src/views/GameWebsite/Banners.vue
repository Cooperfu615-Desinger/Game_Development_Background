<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import {
    websiteBanners,
    websiteLocales,
    websiteStatusClass,
    type WebsiteBannerStatus,
    type WebsiteLocale,
} from './data'
import './website.css'

type BannerFilter = '全部' | WebsiteBannerStatus

const bannerFilters: BannerFilter[] = ['全部', '已發布', '草稿', '已停用']
const activeFilter = ref<BannerFilter>('全部')
const selectedBannerId = ref(websiteBanners[0].id)
const editorLocale = ref<WebsiteLocale>('繁中')
const previewLocale = ref<WebsiteLocale>('繁中')
const previewVisible = ref(true)
const notice = ref('')

const selectedBanner = computed(() => websiteBanners.find((banner) => banner.id === selectedBannerId.value) ?? websiteBanners[0])
const filteredBanners = computed(() => activeFilter.value === '全部'
    ? websiteBanners
    : websiteBanners.filter((banner) => banner.status === activeFilter.value))
const previewCopy = computed(() => selectedBanner.value.copies[previewLocale.value])

const draft = reactive<{
    name: string
    status: WebsiteBannerStatus
    order: number
    link: string
    title: string
    description: string
    ctaLabel: string
}>({
    name: '',
    status: '草稿',
    order: 1,
    link: '',
    title: '',
    description: '',
    ctaLabel: '',
})

const syncDraft = () => {
    const banner = selectedBanner.value
    const copy = banner.copies[editorLocale.value]
    Object.assign(draft, {
        name: banner.name,
        status: banner.status,
        order: banner.order,
        link: banner.link,
        title: copy.title,
        description: copy.description,
        ctaLabel: copy.ctaLabel,
    })
}

watch(selectedBanner, syncDraft, { immediate: true })
watch(editorLocale, syncDraft)

const showNotice = (message: string) => {
    notice.value = message
    window.setTimeout(() => {
        notice.value = ''
    }, 2400)
}

const selectBanner = (id: string) => {
    selectedBannerId.value = id
    previewVisible.value = true
}

const saveDraft = () => showNotice('Banner 草稿已暫存（目前為原型操作，不會寫入正式資料）。')
const publishBanner = () => showNotice('已模擬發布流程，正式 API 串接後會建立網站版本紀錄。')
</script>

<template>
    <div class="website-page">
        <header class="website-page-header">
            <div>
                <div class="website-page-kicker">OFFICIAL WEBSITE / BANNERS</div>
                <h1 class="website-page-title">Banner 管理</h1>
                <p class="website-page-description">管理官網推廣視覺與文案。Banner 可獨立預覽與發布，不需要開啟整體官網預覽。</p>
            </div>
            <div class="website-header-actions">
                <RouterLink class="website-button" :to="{ name: 'GameWebsiteReleases' }">
                    <i class="pi pi-history" />
                    發布紀錄
                </RouterLink>
                <button class="website-button primary" type="button" @click="showNotice('新增 Banner 流程已預留，接入素材上傳 API 後啟用。')">
                    <i class="pi pi-plus" />
                    新增 Banner
                </button>
            </div>
        </header>

        <div v-if="notice" class="website-notice" role="status">
            <i class="pi pi-check-circle" />
            <span>{{ notice }}</span>
        </div>

        <section class="website-kpi-grid" aria-label="Banner 摘要">
            <article class="website-kpi-card">
                <span class="website-kpi-label">目前 Banner</span>
                <strong class="website-kpi-value">{{ websiteBanners.length }}</strong>
                <span class="website-kpi-footnote">包含 1 筆草稿</span>
            </article>
            <article class="website-kpi-card">
                <span class="website-kpi-label">已發布</span>
                <strong class="website-kpi-value">{{ websiteBanners.filter((banner) => banner.status === '已發布').length }}</strong>
                <span class="website-kpi-footnote">官網目前可見內容</span>
            </article>
            <article class="website-kpi-card">
                <span class="website-kpi-label">最後更新</span>
                <strong class="website-kpi-value" style="font-size: 1.35rem; letter-spacing: -0.03em;">2026.08.05</strong>
                <span class="website-kpi-footnote">Provider Editor</span>
            </article>
        </section>

        <section class="website-panel">
            <div class="website-panel-header">
                <div>
                    <div class="website-panel-kicker">CAMPAIGN INVENTORY</div>
                    <h2 class="website-panel-title">Banner 素材與內容</h2>
                    <p class="website-panel-note">目前先以首頁區塊作為管理單位，未來可依官網版型擴充位置。</p>
                </div>
            </div>

            <div class="website-toolbar">
                <div class="website-filter-group" aria-label="Banner 狀態篩選">
                    <button
                        v-for="filter in bannerFilters"
                        :key="filter"
                        class="website-filter-button"
                        :class="{ 'is-active': activeFilter === filter }"
                        type="button"
                        @click="activeFilter = filter"
                    >
                        {{ filter }}
                    </button>
                </div>
                <span class="website-panel-note">{{ filteredBanners.length }} 筆內容</span>
            </div>

            <div class="website-banners-layout">
                <div class="website-banner-list" aria-label="Banner 清單">
                    <button
                        v-for="banner in filteredBanners"
                        :key="banner.id"
                        class="website-banner-row"
                        :class="{ 'is-selected': selectedBannerId === banner.id }"
                        type="button"
                        @click="selectBanner(banner.id)"
                    >
                        <span class="website-banner-thumb" :class="banner.imageClass">{{ String(banner.order).padStart(2, '0') }}</span>
                        <span>
                            <span class="website-banner-row-title">{{ banner.name }}</span>
                            <span class="website-banner-row-meta">{{ banner.slot }} · {{ banner.updatedAt }}</span>
                        </span>
                        <span class="website-status" :class="websiteStatusClass(banner.status)">{{ banner.status }}</span>
                    </button>
                </div>

                <div class="website-editor-card">
                    <div class="website-editor-main">
                        <div class="website-panel-header" style="margin-bottom: 0;">
                            <div>
                                <div class="website-panel-kicker">EDIT CONTENT</div>
                                <h3 class="website-panel-title">{{ selectedBanner.name }}</h3>
                            </div>
                            <span class="website-status" :class="websiteStatusClass(selectedBanner.status)">{{ selectedBanner.status }}</span>
                        </div>

                        <div class="website-locale-switcher" aria-label="Banner 編輯語系">
                            <button
                                v-for="locale in websiteLocales"
                                :key="locale"
                                class="website-locale-button"
                                :class="{ 'is-active': editorLocale === locale }"
                                type="button"
                                @click="editorLocale = locale"
                            >
                                {{ locale }}
                            </button>
                        </div>

                        <div class="website-field-grid">
                            <div class="website-field is-wide">
                                <label for="website-banner-name">內部名稱</label>
                                <input id="website-banner-name" v-model="draft.name" type="text">
                            </div>
                            <div class="website-field">
                                <label for="website-banner-status">狀態</label>
                                <select id="website-banner-status" v-model="draft.status">
                                    <option value="已發布">已發布</option>
                                    <option value="草稿">草稿</option>
                                    <option value="已停用">已停用</option>
                                </select>
                            </div>
                            <div class="website-field">
                                <label for="website-banner-order">顯示順序</label>
                                <input id="website-banner-order" v-model.number="draft.order" min="1" type="number">
                            </div>
                            <div class="website-field is-wide">
                                <label for="website-banner-title">{{ editorLocale }} 標題</label>
                                <input id="website-banner-title" v-model="draft.title" type="text">
                            </div>
                            <div class="website-field is-wide">
                                <label for="website-banner-description">{{ editorLocale }} 簡述</label>
                                <textarea id="website-banner-description" v-model="draft.description" rows="3" />
                            </div>
                            <div class="website-field">
                                <label for="website-banner-cta">按鈕文字</label>
                                <input id="website-banner-cta" v-model="draft.ctaLabel" type="text">
                            </div>
                            <div class="website-field">
                                <label for="website-banner-link">連結</label>
                                <input id="website-banner-link" v-model="draft.link" type="text">
                            </div>
                        </div>

                        <div class="website-editor-actions">
                            <button class="website-button" type="button" @click="saveDraft">
                                <i class="pi pi-save" />
                                儲存草稿
                            </button>
                            <button class="website-button accent" type="button" @click="publishBanner">
                                <i class="pi pi-send" />
                                發布 Banner
                            </button>
                        </div>
                    </div>

                    <aside class="website-editor-meta" aria-label="Banner 發布資訊">
                        <h3 class="website-meta-heading">發布資訊</h3>
                        <dl class="website-meta-list">
                            <div><dt>顯示位置</dt><dd>{{ selectedBanner.slot }}</dd></div>
                            <div><dt>開始時間</dt><dd>{{ selectedBanner.startAt }}</dd></div>
                            <div><dt>結束時間</dt><dd>{{ selectedBanner.endAt }}</dd></div>
                            <div><dt>最後更新</dt><dd>{{ selectedBanner.updatedAt }}</dd></div>
                        </dl>
                        <div class="website-content-side-note">
                            <i class="pi pi-info-circle" />
                            <span>Banner 預覽只聚焦於單一推廣區塊，不代表完整官網成果。</span>
                        </div>
                    </aside>
                </div>
            </div>
        </section>

        <section v-if="previewVisible" class="website-preview-panel" aria-label="Banner 預覽">
            <div class="website-preview-panel-header">
                <div>
                    <div class="website-preview-kicker">SINGLE BANNER PREVIEW</div>
                    <h2 class="website-panel-title">{{ selectedBanner.name }} · 預覽</h2>
                    <p class="website-panel-note">用於檢查 Banner 文案與視覺，不開啟整體官網預覽。</p>
                </div>
                <div class="website-locale-switcher">
                    <button
                        v-for="locale in websiteLocales"
                        :key="locale"
                        class="website-locale-button"
                        :class="{ 'is-active': previewLocale === locale }"
                        type="button"
                        @click="previewLocale = locale"
                    >
                        {{ locale }}
                    </button>
                </div>
            </div>
            <div class="website-preview-stage">
                <div class="website-banner-preview" :class="selectedBanner.imageClass">
                    <div class="website-banner-preview-copy">
                        <span class="eyebrow">{{ previewCopy.eyebrow }}</span>
                        <h3>{{ previewCopy.title }}</h3>
                        <p>{{ previewCopy.description }}</p>
                        <span class="website-preview-cta">{{ previewCopy.ctaLabel }} <i class="pi pi-arrow-up-right" /></span>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>
