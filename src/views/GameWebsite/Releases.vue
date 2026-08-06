<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { websiteReleases, websiteStatusClass, type WebsiteReleaseStatus } from './data'
import './website.css'

type ReleaseFilter = '全部' | WebsiteReleaseStatus

const releaseFilters: ReleaseFilter[] = ['全部', '已發布', '草稿']
const activeFilter = ref<ReleaseFilter>('全部')
const selectedReleaseId = ref(websiteReleases[0].id)
const notice = ref('')

const filteredReleases = computed(() => activeFilter.value === '全部'
    ? websiteReleases
    : websiteReleases.filter((release) => release.status === activeFilter.value))
const selectedRelease = computed(() => websiteReleases.find((release) => release.id === selectedReleaseId.value) ?? websiteReleases[0])

const showNotice = (message: string) => {
    notice.value = message
    window.setTimeout(() => {
        notice.value = ''
    }, 2400)
}
</script>

<template>
    <div class="website-page">
        <header class="website-page-header">
            <div>
                <div class="website-page-kicker">OFFICIAL WEBSITE / RELEASES</div>
                <h1 class="website-page-title">發布與版本紀錄</h1>
                <p class="website-page-description">以簡單時間線追蹤 Banner、法務內容與聯絡資訊的發布狀態，不建立複雜的網站版本打包流程。</p>
            </div>
            <div class="website-header-actions">
                <RouterLink class="website-button" :to="{ name: 'GameWebsiteBanners' }">
                    <i class="pi pi-images" />
                    Banner 管理
                </RouterLink>
                <button class="website-button primary" type="button" @click="showNotice('建立版本流程已預留，待正式發布 API 確認後啟用。')">
                    <i class="pi pi-plus" />
                    建立版本
                </button>
            </div>
        </header>

        <div v-if="notice" class="website-notice" role="status">
            <i class="pi pi-check-circle" />
            <span>{{ notice }}</span>
        </div>

        <section class="website-kpi-grid" aria-label="發布摘要">
            <article class="website-kpi-card">
                <span class="website-kpi-label">目前正式版本</span>
                <strong class="website-kpi-value">v1.4.0</strong>
                <span class="website-kpi-footnote">2026-08-04 發布</span>
            </article>
            <article class="website-kpi-card">
                <span class="website-kpi-label">待發布草稿</span>
                <strong class="website-kpi-value">01</strong>
                <span class="website-kpi-footnote">Cobalt Notes Banner</span>
            </article>
            <article class="website-kpi-card">
                <span class="website-kpi-label">最近發布人員</span>
                <strong class="website-kpi-value" style="font-size: 1.35rem; letter-spacing: -0.03em;">Admin</strong>
                <span class="website-kpi-footnote">Provider Admin</span>
            </article>
        </section>

        <section class="website-panel">
            <div class="website-panel-header">
                <div>
                    <div class="website-release-kicker">CHANGE LOG</div>
                    <h2 class="website-panel-title">官網發布事件</h2>
                    <p class="website-panel-note">每次內容區塊發布會留下基本版本與操作者紀錄。</p>
                </div>
                <div class="website-filter-group" aria-label="發布狀態篩選">
                    <button
                        v-for="filter in releaseFilters"
                        :key="filter"
                        class="website-filter-button"
                        :class="{ 'is-active': activeFilter === filter }"
                        type="button"
                        @click="activeFilter = filter"
                    >
                        {{ filter }}
                    </button>
                </div>
            </div>

            <div class="website-release-layout">
                <div class="website-release-list" aria-label="版本列表">
                    <button
                        v-for="release in filteredReleases"
                        :key="release.id"
                        class="website-release-row"
                        :class="{ 'is-selected': selectedReleaseId === release.id }"
                        type="button"
                        @click="selectedReleaseId = release.id"
                    >
                        <span class="website-release-version">{{ release.version }}</span>
                        <span>
                            <span class="website-release-summary">{{ release.summary }}</span>
                            <span class="website-release-meta">{{ release.publishedAt }} · {{ release.publisher }}</span>
                            <span class="website-release-scope">
                                <span v-for="scope in release.scope" :key="scope" class="website-scope-chip">{{ scope }}</span>
                            </span>
                        </span>
                        <span class="website-status" :class="websiteStatusClass(release.status)">{{ release.status }}</span>
                    </button>
                </div>

                <aside class="website-release-detail" aria-label="版本詳情">
                    <div>
                        <div class="website-release-kicker">SELECTED RELEASE</div>
                        <h3>{{ selectedRelease.version }}</h3>
                    </div>
                    <p>{{ selectedRelease.summary }}</p>
                    <dl class="website-release-detail-list">
                        <div><dt>發布狀態</dt><dd><span class="website-status" :class="websiteStatusClass(selectedRelease.status)">{{ selectedRelease.status }}</span></dd></div>
                        <div><dt>發布人員</dt><dd>{{ selectedRelease.publisher }}</dd></div>
                        <div><dt>發布時間</dt><dd>{{ selectedRelease.publishedAt }}</dd></div>
                        <div><dt>內容範圍</dt><dd>{{ selectedRelease.scope.join('、') }}</dd></div>
                    </dl>
                    <div class="website-content-side-note">
                        <i class="pi pi-file-edit" />
                        <span>{{ selectedRelease.note }}</span>
                    </div>
                    <button class="website-button subtle" type="button" @click="showNotice('版本詳情檢視已完成，差異比對功能暫不納入第一階段。')">
                        <i class="pi pi-eye" />
                        查看摘要
                    </button>
                </aside>
            </div>
        </section>
    </div>
</template>
