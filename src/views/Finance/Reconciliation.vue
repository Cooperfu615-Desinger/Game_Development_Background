<script setup lang="ts">
import Message from 'primevue/message'
import Tag from 'primevue/tag'
</script>

<template>
    <div class="hig-page">
        <header class="hig-page-header">
            <h1 class="hig-page-title">
                <i class="pi pi-sync" />
                對帳確認
            </h1>
        </header>

        <Message severity="info" :closable="false">
            對帳流程：聚合商推送結算單 → 系統自動比對內部注單資料 → 人工確認差異 → 核准結算
        </Message>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div class="stat">
                <span class="stat-label">待確認筆數</span>
                <span class="stat-value muted">—</span>
            </div>
            <div class="stat">
                <span class="stat-label">本月差異金額</span>
                <span class="stat-value muted">—</span>
            </div>
            <div class="stat">
                <span class="stat-label">已確認筆數</span>
                <span class="stat-value muted">—</span>
            </div>
        </div>

        <section class="hig-card">
            <header class="hig-card-header">
                <h2 class="hig-card-title">對帳列表（聚合商推送單 vs 內部資料）</h2>
            </header>
            <div class="empty-state">
                <i class="pi pi-sync empty-icon" />
                <p class="empty-text">並排顯示聚合商數字與內部計算數字，標記差異並提供確認/異議操作</p>
                <Tag severity="warn" value="開發中" />
            </div>
        </section>
    </div>
</template>

<style scoped>
.stat {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    padding: 1rem;
    background: var(--hig-bg-surface);
    border: 1px solid var(--hig-border-default);
    border-radius: var(--hig-radius-card);
    box-shadow: var(--hig-shadow-sm);
    min-height: 5rem;
    justify-content: center;
}
.stat-label {
    font-size: 0.75rem;
    color: var(--hig-text-secondary);
}
.stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--hig-text-primary);
}
.muted {
    color: var(--hig-text-tertiary);
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.875rem;
    padding: 3rem 1rem;
    color: var(--hig-text-secondary);
}
.empty-icon {
    font-size: 3rem;
    color: var(--hig-text-tertiary);
}
.empty-text {
    font-size: 0.875rem;
    margin: 0;
    text-align: center;
}
</style>
