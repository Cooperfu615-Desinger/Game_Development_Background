<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from 'primevue/button'

const router = useRouter()
</script>

<template>
    <div class="error-page">
        <div class="error-card">
            <div class="error-code">404</div>
            <h1 class="error-title">頁面不存在</h1>
            <p class="error-description">
                您尋找的頁面已被移除、變更名稱，或暫時無法使用。
            </p>
            <div class="error-actions">
                <Button label="返回首頁" icon="pi pi-home" @click="router.push('/')" />
                <Button label="返回上一頁" severity="secondary" outlined @click="router.go(-1)" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.error-page {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    background: var(--hig-bg-base);
}

.error-card {
    text-align: center;
    max-width: 28rem;
    padding: 3rem 2rem;
}

.error-code {
    font-size: 6rem;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.04em;
    color: var(--hig-text-tertiary);
    margin-bottom: 1.5rem;
    font-variant-numeric: tabular-nums;
}

.error-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--hig-text-primary);
    margin: 0 0 0.75rem;
    letter-spacing: -0.01em;
}

.error-description {
    color: var(--hig-text-secondary);
    margin: 0 0 2rem;
    font-size: 0.9375rem;
    line-height: 1.5;
}

.error-actions {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    flex-wrap: wrap;
}

@media (max-width: 480px) {
    .error-code {
        font-size: 4.5rem;
    }
}
</style>
