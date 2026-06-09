<script setup lang="ts">
import Skeleton from 'primevue/skeleton'
import type { PlatformStats } from '@/types/platform'

defineProps<{
    stats: PlatformStats | null
    loading: boolean
}>()

const fmtMoney = (n: number) =>
    `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

const fmtNumber = (n: number) => n.toLocaleString('en-US')
</script>

<template>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="stat">
            <span class="stat-label">玩家總數</span>
            <Skeleton v-if="loading" width="6rem" height="1.5rem" />
            <span v-else class="stat-value">{{ fmtNumber(stats?.playerCount ?? 0) }}</span>
        </div>

        <div class="stat">
            <span class="stat-label">活躍玩家</span>
            <Skeleton v-if="loading" width="6rem" height="1.5rem" />
            <span v-else class="stat-value">{{ fmtNumber(stats?.activePlayers ?? 0) }}</span>
        </div>

        <div class="stat">
            <span class="stat-label">流水</span>
            <Skeleton v-if="loading" width="6rem" height="1.5rem" />
            <span v-else class="stat-value">{{ fmtMoney(stats?.turnover ?? 0) }}</span>
        </div>

        <div class="stat">
            <span class="stat-label">GGR</span>
            <Skeleton v-if="loading" width="6rem" height="1.5rem" />
            <span v-else class="stat-value stat-green">{{ fmtMoney(stats?.ggr ?? 0) }}</span>
        </div>

        <div class="stat">
            <span class="stat-label">JP 次數</span>
            <Skeleton v-if="loading" width="5rem" height="1.5rem" />
            <span v-else class="stat-value">{{ stats?.jpCount ?? 0 }} 次</span>
        </div>

        <div class="stat">
            <span class="stat-label">JP 總金額</span>
            <Skeleton v-if="loading" width="6rem" height="1.5rem" />
            <span v-else class="stat-value stat-amber">{{ fmtMoney(stats?.jpTotal ?? 0) }}</span>
        </div>

        <div class="stat">
            <span class="stat-label">平均每玩家流水</span>
            <Skeleton v-if="loading" width="6rem" height="1.5rem" />
            <span v-else class="stat-value">{{ fmtMoney(stats?.avgTurnoverPerPlayer ?? 0) }}</span>
        </div>

        <div class="stat">
            <span class="stat-label">最大單筆 JP</span>
            <Skeleton v-if="loading" width="6rem" height="1.5rem" />
            <span v-else class="stat-value">{{ fmtMoney(stats?.maxJpAmount ?? 0) }}</span>
        </div>
    </div>
</template>

<style scoped>
.stat {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    padding: 0.875rem 1rem;
    background: var(--hig-bg-surface);
    border: 1px solid var(--hig-border-default);
    border-radius: var(--hig-radius-card);
    box-shadow: var(--hig-shadow-sm);
    min-height: 4.5rem;
    justify-content: center;
}

.stat-label {
    font-size: 0.75rem;
    color: var(--hig-text-secondary);
    font-weight: 500;
}

.stat-value {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--hig-text-primary);
    letter-spacing: -0.01em;
    font-variant-numeric: tabular-nums;
    line-height: 1.2;
}

.stat-green {
    color: var(--hig-green);
}
.stat-amber {
    color: var(--hig-orange);
}
</style>
