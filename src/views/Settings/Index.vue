<script setup lang="ts">
import { ref } from 'vue'
import {
    NCard, NForm, NFormItem, NSwitch, NSelect,
    NDivider, NTag, NSpace
} from 'naive-ui'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const langOptions = [
    { label: '繁體中文', value: 'zh-TW' },
    { label: 'English', value: 'en' }
]

const handleLangChange = (val: string) => {
    locale.value = val
    localStorage.setItem('locale', val)
}

// 通知設定（本地狀態，無需 API）
const notifications = ref({
    settlementReady: true,
    invoiceDue: true,
    gameStatusChange: false,
    loginAlert: true
})
</script>

<template>
    <div class="flex flex-col gap-6 max-w-2xl">
        <h1 class="text-2xl font-bold">系統設置</h1>

        <!-- 語言設定 -->
        <n-card title="語言設定">
            <n-form label-placement="left" :label-width="120">
                <n-form-item label="介面語言">
                    <n-select
                        :value="locale"
                        :options="langOptions"
                        class="w-48"
                        @update:value="handleLangChange"
                    />
                </n-form-item>
            </n-form>
        </n-card>

        <!-- 通知設定 -->
        <n-card title="通知設定">
            <n-form label-placement="left" :label-width="160">
                <n-form-item label="結算完成通知">
                    <n-switch v-model:value="notifications.settlementReady" />
                </n-form-item>
                <n-form-item label="發票到期提醒">
                    <n-switch v-model:value="notifications.invoiceDue" />
                </n-form-item>
                <n-form-item label="遊戲狀態變更">
                    <n-switch v-model:value="notifications.gameStatusChange" />
                </n-form-item>
                <n-form-item label="異地登入警示">
                    <n-switch v-model:value="notifications.loginAlert" />
                </n-form-item>
            </n-form>
        </n-card>

        <!-- 系統資訊 -->
        <n-card title="系統資訊">
            <n-space vertical>
                <div class="flex items-center justify-between">
                    <span class="opacity-60">版本</span>
                    <n-tag :bordered="false" size="small">v0.1.0 Prototype</n-tag>
                </div>
                <n-divider class="!my-2" />
                <div class="flex items-center justify-between">
                    <span class="opacity-60">API 模式</span>
                    <n-tag type="warning" :bordered="false" size="small">MSW Mock</n-tag>
                </div>
                <n-divider class="!my-2" />
                <div class="flex items-center justify-between">
                    <span class="opacity-60">框架</span>
                    <span class="text-sm opacity-60">Vue 3 + Naive UI + Vite</span>
                </div>
            </n-space>
        </n-card>
    </div>
</template>
