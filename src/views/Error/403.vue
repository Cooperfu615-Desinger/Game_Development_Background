<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from 'primevue/button'

const router = useRouter()
</script>

<template>
    <div class="error-page">
        <div class="error-card">
            <div class="error-icon">
                <i class="pi pi-lock" />
            </div>
            <div class="error-code">403</div>
            <h1 class="error-title">沒有存取權限</h1>
            <p class="error-description">
                您的帳號目前沒有權限存取此區域。請聯絡管理員，或切換到其他帳號。
            </p>
            <div class="error-actions">
                <Button
                    label="切換帳號"
                    icon="pi pi-sign-out"
                    @click="router.push('/login')"
                />
                <Button
                    label="返回上一頁"
                    severity="secondary"
                    outlined
                    @click="router.go(-1)"
                />
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
    padding: 2.5rem 2rem;
}

.error-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 4rem;
    height: 4rem;
    margin: 0 auto 1rem;
    border-radius: var(--hig-radius-full);
    background: color-mix(in srgb, var(--hig-orange) 14%, transparent);
    color: var(--hig-orange);
    font-size: 1.75rem;
}

.error-code {
    font-size: 3rem;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.04em;
    color: var(--hig-text-tertiary);
    margin-bottom: 1rem;
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
</style>
