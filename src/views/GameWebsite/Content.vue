<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import {
    websiteContact,
    websiteContent,
    websiteContentTabs,
    websiteLocales,
    type WebsiteContentKey,
    type WebsiteContact,
    type WebsiteLocale,
} from './data'
import './website.css'

const activeSection = ref<WebsiteContentKey>('terms')
const activeLocale = ref<WebsiteLocale>('繁中')
const contentDraft = ref('')
const notice = ref('')

const contactDraft = reactive<WebsiteContact>({
    supportEmail: '',
    supportHours: '',
    address: '',
    responseNote: '',
})

const activeTab = computed(() => websiteContentTabs.find((tab) => tab.key === activeSection.value) ?? websiteContentTabs[0])
const isContact = computed(() => activeSection.value === 'contact')
const contentLength = computed(() => contentDraft.value.length)

const syncEditor = () => {
    if (isContact.value) {
        Object.assign(contactDraft, websiteContact[activeLocale.value])
        return
    }
    contentDraft.value = websiteContent[activeSection.value][activeLocale.value]
}

watch([activeSection, activeLocale], syncEditor, { immediate: true })

const showNotice = (message: string) => {
    notice.value = message
    window.setTimeout(() => {
        notice.value = ''
    }, 2400)
}

const saveDraft = () => showNotice('內容草稿已暫存（目前為原型操作，不會寫入正式資料）。')
const publishContent = () => showNotice(`${activeTab.value.label} 已模擬發布，正式 API 串接後會進入版本紀錄。`)
</script>

<template>
    <div class="website-page">
        <div v-if="notice" class="website-notice" role="status">
            <i class="pi pi-check-circle" />
            <span>{{ notice }}</span>
        </div>

        <section class="website-kpi-grid" aria-label="官網內容摘要">
            <article class="website-kpi-card">
                <span class="website-kpi-label">管理區塊</span>
                <strong class="website-kpi-value">04</strong>
                <span class="website-kpi-footnote">條款、政策、玩家保護、聯絡</span>
            </article>
            <article class="website-kpi-card">
                <span class="website-kpi-label">支援語系</span>
                <strong class="website-kpi-value">04</strong>
                <span class="website-kpi-footnote">繁中／簡中／English／日本語</span>
            </article>
            <article class="website-kpi-card">
                <span class="website-kpi-label">目前狀態</span>
                <strong class="website-kpi-value" style="font-size: 1.35rem; letter-spacing: -0.03em;">已發布</strong>
                <span class="website-kpi-footnote">最後檢視 2026-08-04</span>
            </article>
        </section>

        <section class="website-panel">
            <div class="website-content-layout">
                <aside>
                    <div class="website-panel-kicker">CONTENT AREAS</div>
                    <h2 class="website-panel-title">網站內容</h2>
                    <p class="website-panel-note" style="margin-bottom: 0.85rem;">同一個入口維護所有低頻更新內容。</p>
                    <div class="website-section-tabs" role="tablist" aria-label="官網內容區塊">
                        <button
                            v-for="tab in websiteContentTabs"
                            :key="tab.key"
                            class="website-section-tab"
                            :class="{ 'is-active': activeSection === tab.key }"
                            type="button"
                            role="tab"
                            :aria-selected="activeSection === tab.key"
                            @click="activeSection = tab.key"
                        >
                            <strong>{{ tab.label }}</strong>
                            <span>{{ tab.note }}</span>
                        </button>
                    </div>
                </aside>

                <div class="website-content-editor">
                    <div class="website-content-editor-toolbar">
                        <div>
                            <div class="website-panel-kicker">EDITING {{ activeTab.label.toUpperCase() }}</div>
                            <h2 class="website-panel-title">{{ activeTab.note }}</h2>
                        </div>
                        <div class="website-locale-switcher" aria-label="內容編輯語系">
                            <button
                                v-for="locale in websiteLocales"
                                :key="locale"
                                class="website-locale-button"
                                :class="{ 'is-active': activeLocale === locale }"
                                type="button"
                                @click="activeLocale = locale"
                            >
                                {{ locale }}
                            </button>
                        </div>
                    </div>

                    <template v-if="!isContact">
                        <div class="website-richtext-toolbar" aria-label="簡易格式工具列">
                            <button class="website-richtext-tool" type="button" aria-label="粗體">B</button>
                            <button class="website-richtext-tool" type="button" aria-label="斜體"><i>I</i></button>
                            <button class="website-richtext-tool" type="button" aria-label="標題">H2</button>
                            <button class="website-richtext-tool" type="button" aria-label="條列">☷</button>
                        </div>
                        <textarea v-model="contentDraft" class="website-content-textarea" :aria-label="`${activeLocale} ${activeTab.label} 內容`" />
                        <div class="website-content-side-note">
                            <i class="pi pi-info-circle" />
                            <span>目前提供簡易文字編輯骨架；正式接入後可替換為富文字編輯器並保留發布版本。</span>
                        </div>
                    </template>

                    <template v-else>
                        <div class="website-contact-grid">
                            <div class="website-field is-wide">
                                <label for="website-contact-email">客服 Email</label>
                                <input id="website-contact-email" v-model="contactDraft.supportEmail" type="email">
                            </div>
                            <div class="website-field">
                                <label for="website-contact-hours">服務時間</label>
                                <input id="website-contact-hours" v-model="contactDraft.supportHours" type="text">
                            </div>
                            <div class="website-field">
                                <label for="website-contact-address">聯絡地址</label>
                                <input id="website-contact-address" v-model="contactDraft.address" type="text">
                            </div>
                            <div class="website-field is-wide">
                                <label for="website-contact-note">回覆說明</label>
                                <textarea id="website-contact-note" v-model="contactDraft.responseNote" rows="5" />
                            </div>
                        </div>
                        <div class="website-content-side-note">
                            <i class="pi pi-info-circle" />
                            <span>聯絡資訊使用結構化欄位，方便未來由官網前台直接套用。</span>
                        </div>
                    </template>

                    <div class="website-editor-actions" style="margin-top: 1rem;">
                        <button class="website-button" type="button" @click="saveDraft">
                            <i class="pi pi-save" />
                            儲存草稿
                        </button>
                        <button class="website-button accent" type="button" @click="publishContent">
                            <i class="pi pi-send" />
                            發布此區塊
                        </button>
                        <span v-if="!isContact" class="website-panel-note">{{ contentLength }} 字元 · {{ activeLocale }}</span>
                    </div>
                </div>
            </div>
        </section>

        <section class="website-panel" style="margin-top: 1rem;">
            <div class="website-panel-header" style="margin-bottom: 0;">
                <div>
                    <div class="website-panel-kicker">PUBLISH CHECK</div>
                    <h2 class="website-panel-title">發布前檢查</h2>
                    <p class="website-panel-note">目前以人工確認為主，不建立完整官網預覽流程。</p>
                </div>
                <span class="website-status is-published">基本資料完整</span>
            </div>
        </section>
    </div>
</template>
