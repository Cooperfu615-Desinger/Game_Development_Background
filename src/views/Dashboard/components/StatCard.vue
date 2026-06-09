<script setup lang="ts">
import Skeleton from 'primevue/skeleton'
import Tag from 'primevue/tag'

const props = defineProps<{
    label: string
    value: string
    trend?: number
    loading: boolean
    icon: string
}>()

const trendSeverity = (v: number): 'success' | 'danger' =>
    v >= 0 ? 'success' : 'danger'

const trendText = (v: number) => `${v >= 0 ? '↑' : '↓'} ${Math.abs(v).toFixed(1)}%`
</script>

<template>
    <div class="stat-card">
        <div class="stat-card-content">
            <div class="stat-card-label">{{ label }}</div>
            <div class="stat-card-main">
                <Skeleton v-if="loading" width="8rem" height="1.75rem" />
                <div v-else class="stat-card-value">{{ value }}</div>
                <Tag
                    v-if="!loading && trend !== undefined"
                    :severity="trendSeverity(trend)"
                    :value="trendText(trend)"
                    class="stat-card-tag"
                />
            </div>
        </div>
        <div class="stat-card-icon">{{ icon }}</div>
    </div>
</template>

<style scoped>
.stat-card {
    background: var(--hig-bg-surface);
    border: 1px solid var(--hig-border-default);
    border-radius: var(--hig-radius-card);
    box-shadow: var(--hig-shadow-sm);
    padding: 1.25rem;
    height: 140px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    transition: box-shadow var(--hig-duration-fast) var(--hig-ease);
}
.stat-card:hover {
    box-shadow: var(--hig-shadow-md);
}

.stat-card-content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    min-width: 0;
}

.stat-card-label {
    font-size: 0.8125rem;
    color: var(--hig-text-secondary);
    font-weight: 500;
}

.stat-card-main {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
}

.stat-card-value {
    font-size: 1.625rem;
    font-weight: 700;
    color: var(--hig-text-primary);
    line-height: 1.1;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
}

.stat-card-tag {
    align-self: flex-start;
}

.stat-card-icon {
    font-size: 2rem;
    opacity: 0.4;
    line-height: 1;
}
</style>
