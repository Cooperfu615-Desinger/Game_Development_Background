<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

interface PlaceholderMeta {
    description?: string
}

const route = useRoute()
const { t } = useI18n()

const pageTitle = computed(() => {
    const titleKey = String(route.meta.title ?? 'menu.providerPortal')
    return t(titleKey)
})

const description = computed(() => {
    const meta = route.meta.providerPlaceholder
    if (meta && typeof meta === 'object' && 'description' in meta) {
        return String((meta as PlaceholderMeta).description ?? '')
    }
    return 'Provider Portal 工作模組骨架已建立，後續將依核准規格接入資料與互動。'
})

const foundationCards = [
    {
        eyebrow: 'OWNERSHIP',
        title: 'Provider-owned',
        body: '只呈現遊戲商自己需要管理的遊戲、數據、財務、監控與內容工作。',
        icon: 'pi pi-building',
    },
    {
        eyebrow: 'NEXT CONTRACT',
        title: '等待正式契約',
        body: 'API、權限、狀態碼、點數精度與 USDT 換算規則確認後再接入真實資料。',
        icon: 'pi pi-file-edit',
    },
    {
        eyebrow: 'BOUNDARY',
        title: 'GGAP 分工清楚',
        body: '代理商開關、平台錢包、會員與 GGAP 平台結算留在 GGAP 責任範圍。',
        icon: 'pi pi-link',
    },
]
</script>

<template>
    <div class="provider-placeholder-page page-stack">
        <section class="provider-placeholder-hero" aria-labelledby="provider-placeholder-title">
            <div class="provider-placeholder-grid" aria-hidden="true" />
            <div class="provider-placeholder-hero-content">
                <div class="provider-placeholder-kicker">
                    <span class="provider-placeholder-mark"><i class="pi pi-bolt" /></span>
                    <span>PROVIDER PORTAL / PHASE 1</span>
                </div>
                <h1 id="provider-placeholder-title">{{ pageTitle }}</h1>
                <p>{{ description }}</p>
            </div>
            <div class="provider-placeholder-status">
                <span class="provider-placeholder-status-dot" />
                <span>導覽骨架已建立</span>
            </div>
        </section>

        <section class="provider-placeholder-cards" aria-label="Provider Portal foundation">
            <article v-for="card in foundationCards" :key="card.eyebrow" class="provider-placeholder-card">
                <div class="provider-placeholder-card-icon"><i :class="card.icon" /></div>
                <span>{{ card.eyebrow }}</span>
                <h2>{{ card.title }}</h2>
                <p>{{ card.body }}</p>
            </article>
        </section>

        <section class="provider-placeholder-next">
            <div>
                <span class="provider-placeholder-next-label">NEXT HANDOFF</span>
                <h2>這個頁面先保留為清楚的工作入口</h2>
                <p>下一階段會以 Game Round、Provider 點數 / USDT 與通知契約為基礎，逐步替換這個佔位狀態。</p>
            </div>
            <div class="provider-placeholder-next-badge">
                <i class="pi pi-arrow-right" />
                <span>待規格核准</span>
            </div>
        </section>
    </div>
</template>

<style scoped>
.provider-placeholder-page {
    max-width: 1180px;
    margin: 0 auto;
    padding-bottom: 2rem;
}

.provider-placeholder-hero {
    position: relative;
    min-height: 18rem;
    overflow: hidden;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 2rem;
    padding: 2.5rem;
    color: #f4fbf8;
    border: 1px solid rgba(20, 104, 104, 0.28);
    border-radius: 1.5rem;
    background:
        radial-gradient(circle at 88% 18%, rgba(126, 231, 199, 0.28), transparent 28%),
        linear-gradient(132deg, #0d2731 0%, #104852 54%, #166b69 100%);
    box-shadow: 0 1.5rem 3.5rem rgba(13, 39, 49, 0.18);
}

.provider-placeholder-grid {
    position: absolute;
    inset: 0;
    opacity: 0.22;
    background-image:
        linear-gradient(rgba(220, 255, 243, 0.16) 1px, transparent 1px),
        linear-gradient(90deg, rgba(220, 255, 243, 0.16) 1px, transparent 1px);
    background-size: 2rem 2rem;
    mask-image: linear-gradient(135deg, black 0%, transparent 72%);
}

.provider-placeholder-hero-content,
.provider-placeholder-status {
    position: relative;
    z-index: 1;
}

.provider-placeholder-hero-content {
    max-width: 48rem;
}

.provider-placeholder-kicker,
.provider-placeholder-next-label {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    color: #a9e8d2;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.16em;
}

.provider-placeholder-mark {
    display: inline-grid;
    width: 1.75rem;
    height: 1.75rem;
    place-items: center;
    color: #0d2731;
    border-radius: 0.55rem;
    background: #a9e8d2;
}

.provider-placeholder-hero h1 {
    margin: 1.4rem 0 0.7rem;
    color: #ffffff;
    font-size: clamp(2rem, 4vw, 3.25rem);
    letter-spacing: -0.04em;
}

.provider-placeholder-hero p {
    max-width: 42rem;
    margin: 0;
    color: rgba(244, 251, 248, 0.8);
    font-size: 1rem;
    line-height: 1.75;
}

.provider-placeholder-status {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    flex-shrink: 0;
    padding: 0.7rem 0.9rem;
    color: #d9fff1;
    border: 1px solid rgba(169, 232, 210, 0.3);
    border-radius: 999px;
    background: rgba(5, 31, 38, 0.28);
    font-size: 0.8rem;
    font-weight: 700;
}

.provider-placeholder-status-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: #8ff0c8;
    box-shadow: 0 0 0 0.25rem rgba(143, 240, 200, 0.12);
}

.provider-placeholder-cards {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
    margin-top: 1rem;
}

.provider-placeholder-card,
.provider-placeholder-next {
    border: 1px solid var(--hig-border-default);
    border-radius: 1.1rem;
    background: var(--hig-bg-surface);
    box-shadow: var(--hig-shadow-sm);
}

.provider-placeholder-card {
    min-height: 13rem;
    padding: 1.35rem;
}

.provider-placeholder-card-icon {
    display: grid;
    width: 2.5rem;
    height: 2.5rem;
    place-items: center;
    margin-bottom: 1.25rem;
    color: #0d6965;
    border-radius: 0.8rem;
    background: #e4f6ef;
    font-size: 1.1rem;
}

.provider-placeholder-card > span {
    color: var(--hig-text-tertiary);
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.14em;
}

.provider-placeholder-card h2,
.provider-placeholder-next h2 {
    margin: 0.45rem 0 0.55rem;
    color: var(--hig-text-primary);
    font-size: 1.05rem;
}

.provider-placeholder-card p,
.provider-placeholder-next p {
    margin: 0;
    color: var(--hig-text-secondary);
    font-size: 0.875rem;
    line-height: 1.7;
}

.provider-placeholder-next {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    margin-top: 1rem;
    padding: 1.35rem 1.5rem;
    border-left: 0.25rem solid #2a9a83;
}

.provider-placeholder-next-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    flex-shrink: 0;
    color: #12675d;
    font-size: 0.8rem;
    font-weight: 800;
}

@media (max-width: 760px) {
    .provider-placeholder-hero {
        min-height: auto;
        align-items: flex-start;
        flex-direction: column;
        padding: 1.5rem;
    }

    .provider-placeholder-status {
        margin-top: 0.25rem;
    }

    .provider-placeholder-cards {
        grid-template-columns: 1fr;
    }

    .provider-placeholder-card {
        min-height: auto;
    }

    .provider-placeholder-next {
        align-items: flex-start;
        flex-direction: column;
    }
}
</style>
