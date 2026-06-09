<script setup lang="ts">
import { ref } from 'vue'
import Select from 'primevue/select'
import ToggleSwitch from 'primevue/toggleswitch'
import Tag from 'primevue/tag'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const langOptions = [
    { label: '繁體中文', value: 'zh-TW' },
    { label: 'English', value: 'en' },
]

const handleLangChange = (val: string) => {
    locale.value = val
    localStorage.setItem('locale', val)
}

// 通知設定（本地狀態）
const notifications = ref({
    settlementReady: true,
    invoiceDue: true,
    gameStatusChange: false,
    loginAlert: true,
})
</script>

<template>
    <div class="hig-page max-w-2xl">
        <header class="hig-page-header">
            <h1 class="hig-page-title">
                <i class="pi pi-cog" />
                系統設置
            </h1>
        </header>

        <!-- 語言設定 -->
        <section class="hig-card">
            <header class="hig-card-header">
                <h2 class="hig-card-title">語言設定</h2>
            </header>
            <div class="hig-card-body">
                <div class="setting-row">
                    <label for="lang-select">介面語言</label>
                    <Select
                        id="lang-select"
                        :model-value="locale"
                        :options="langOptions"
                        option-label="label"
                        option-value="value"
                        class="w-56"
                        @update:model-value="handleLangChange"
                    />
                </div>
            </div>
        </section>

        <!-- 通知設定 -->
        <section class="hig-card">
            <header class="hig-card-header">
                <h2 class="hig-card-title">通知設定</h2>
            </header>
            <div class="hig-card-body">
                <div class="setting-row">
                    <label>結算完成通知</label>
                    <ToggleSwitch v-model="notifications.settlementReady" />
                </div>
                <div class="setting-row">
                    <label>發票到期提醒</label>
                    <ToggleSwitch v-model="notifications.invoiceDue" />
                </div>
                <div class="setting-row">
                    <label>遊戲狀態變更</label>
                    <ToggleSwitch v-model="notifications.gameStatusChange" />
                </div>
                <div class="setting-row">
                    <label>異地登入警示</label>
                    <ToggleSwitch v-model="notifications.loginAlert" />
                </div>
            </div>
        </section>

        <!-- 系統資訊 -->
        <section class="hig-card">
            <header class="hig-card-header">
                <h2 class="hig-card-title">系統資訊</h2>
            </header>
            <div class="hig-card-body">
                <div class="hig-row">
                    <span class="hig-row-label">版本</span>
                    <Tag severity="secondary" value="v0.1.0 Prototype" />
                </div>
                <div class="hig-row">
                    <span class="hig-row-label">API 模式</span>
                    <Tag severity="warn" value="MSW Mock" />
                </div>
                <div class="hig-row">
                    <span class="hig-row-label">框架</span>
                    <span class="hig-row-value">Vue 3 + PrimeVue + Vite</span>
                </div>
            </div>
        </section>
    </div>
</template>

<style scoped>
.setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0;
    gap: 1rem;
}
.setting-row + .setting-row {
    border-top: 1px solid var(--hig-border-subtle);
}
.setting-row label {
    color: var(--hig-text-primary);
    font-size: 0.9375rem;
    font-weight: 500;
}
</style>
