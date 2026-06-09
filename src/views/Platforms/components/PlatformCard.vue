<script setup lang="ts">
import { useRouter } from 'vue-router'
import Tag from 'primevue/tag'
import type { Platform } from '@/types/platform'

const props = defineProps<{ platform: Platform }>()
const router = useRouter()

const goto = () => router.push(`/platforms/${props.platform.id}`)

const fmt = (n: number) =>
    n >= 10000
        ? `$${(n / 1000).toFixed(1)}K`
        : `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`

const fmtCount = (n: number) => n.toLocaleString('en-US')
</script>

<template>
    <article class="platform-card" tabindex="0" @click="goto" @keyup.enter="goto">
        <!-- 左側：平台名稱 + Tags -->
        <div class="platform-side">
            <span class="platform-name">{{ platform.name }}</span>
            <div class="platform-tags">
                <Tag
                    :severity="platform.status === 'active' ? 'success' : 'secondary'"
                    :value="platform.status === 'active' ? '● 對接中' : '● 未對接'"
                    rounded
                />
                <Tag
                    :severity="platform.hasAgentSystem ? 'info' : 'secondary'"
                    :value="platform.hasAgentSystem ? '有代理系統' : '無代理系統'"
                />
            </div>
        </div>

        <!-- 中間：6 個數字 -->
        <div class="platform-metrics">
            <div class="metric">
                <span class="metric-label">玩家總數</span>
                <span class="metric-value">{{ fmtCount(platform.playerCount) }}</span>
            </div>
            <div class="metric">
                <span class="metric-label">活躍玩家</span>
                <span class="metric-value">{{ fmtCount(platform.activePlayers) }}</span>
            </div>
            <div class="metric">
                <span class="metric-label">流水</span>
                <span class="metric-value">{{ fmt(platform.turnover) }}</span>
            </div>
            <div class="metric">
                <span class="metric-label">GGR</span>
                <span class="metric-value metric-green">{{ fmt(platform.ggr) }}</span>
            </div>
            <div class="metric">
                <span class="metric-label">JP 次數</span>
                <span class="metric-value">{{ platform.jpCount }} 次</span>
            </div>
            <div class="metric">
                <span class="metric-label">JP 總金額</span>
                <span class="metric-value metric-amber">{{ fmt(platform.jpTotal) }}</span>
            </div>
        </div>

        <!-- 右箭頭 -->
        <i class="pi pi-chevron-right platform-arrow" />
    </article>
</template>

<style scoped>
.platform-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    padding: 1.25rem 1.5rem;
    background: var(--hig-bg-surface);
    border: 1px solid var(--hig-border-default);
    border-radius: var(--hig-radius-card);
    box-shadow: var(--hig-shadow-sm);
    cursor: pointer;
    transition:
        border-color var(--hig-duration-fast) var(--hig-ease),
        box-shadow var(--hig-duration-fast) var(--hig-ease),
        transform var(--hig-duration-fast) var(--hig-ease);
}
.platform-card:hover,
.platform-card:focus-visible {
    border-color: var(--hig-blue);
    box-shadow: var(--hig-shadow-md);
    transform: translateY(-1px);
    outline: none;
}

.platform-side {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 10rem;
}
.platform-name {
    font-size: 1rem;
    font-weight: 700;
    color: var(--hig-text-primary);
    letter-spacing: -0.005em;
}
.platform-tags {
    display: flex;
    gap: 0.375rem;
    flex-wrap: wrap;
}

.platform-metrics {
    flex: 1 1 auto;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem 1.5rem;
}
@media (min-width: 1024px) {
    .platform-metrics {
        grid-template-columns: repeat(6, minmax(0, 1fr));
    }
}

.metric {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
}
.metric-label {
    font-size: 0.75rem;
    color: var(--hig-text-secondary);
}
.metric-value {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--hig-text-primary);
    font-variant-numeric: tabular-nums;
}
.metric-green {
    color: var(--hig-green);
}
.metric-amber {
    color: var(--hig-orange);
}

.platform-arrow {
    color: var(--hig-text-tertiary);
    font-size: 1.125rem;
    flex-shrink: 0;
}
</style>
