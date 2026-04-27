<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
    useMessage,
    NCard, NForm, NFormItem, NInput, NButton, NText, NDivider
} from 'naive-ui'
import { useAuthStore } from '../../stores/auth'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const message = useMessage()
const authStore = useAuthStore()

const loading = ref(false)
const formRef = ref()
const model = ref({ username: '', password: '' })

const rules = computed(() => ({
    username: { required: true, message: t('form.required', { field: t('login.account') }), trigger: 'blur' },
    password: { required: true, message: t('form.required', { field: t('login.password') }), trigger: 'blur' }
}))

const doLogin = async () => {
    loading.value = true
    try {
        const result = await authStore.login(model.value.username, model.value.password)
        if (result.success) {
            message.success(t('login.success'))
            const redirect = route.query.redirect as string | undefined
            router.push(redirect ?? '/dashboard')
        } else {
            message.error(result.message || t('login.failed'))
        }
    } finally {
        loading.value = false
    }
}

const handleLogin = async () => {
    try {
        await formRef.value?.validate()
        await doLogin()
    } catch {
        // validation error
    }
}

// 快速登入：直接填入帳密並送出，不需手動按登入
const QUICK_USERS = [
    { label: '👑 總管理員', username: 'admin',     password: 'admin123' },
    { label: '🔧 技術',     username: 'tech',      password: 'tech123'  },
    { label: '📋 PM',       username: 'pm',        password: 'pm123'    },
]

const quickLogin = async (username: string, password: string) => {
    model.value = { username, password }
    await doLogin()
}
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
            <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        </div>

        <n-card class="w-96 relative z-10">
            <template #header>
                <div class="text-center py-2">
                    <div class="text-3xl mb-3">🎮</div>
                    <h1 class="text-xl font-bold mb-1">{{ t('login.appName') }}</h1>
                    <n-text depth="3" class="text-sm">{{ t('login.subtitle') }}</n-text>
                </div>
            </template>

            <n-form ref="formRef" :model="model" :rules="rules" size="large">
                <n-form-item path="username" :label="t('login.account')">
                    <n-input
                        v-model:value="model.username"
                        :placeholder="t('login.placeholderUsername')"
                        @keydown.enter="handleLogin"
                    />
                </n-form-item>

                <n-form-item path="password" :label="t('login.password')">
                    <n-input
                        v-model:value="model.password"
                        type="password"
                        show-password-on="click"
                        :placeholder="t('login.placeholderPassword')"
                        @keydown.enter="handleLogin"
                    />
                </n-form-item>

                <n-button
                    type="primary"
                    block
                    :loading="loading"
                    @click="handleLogin"
                    class="mt-2"
                    strong
                >
                    {{ loading ? t('login.authenticating') : t('login.submit') }}
                </n-button>
            </n-form>

            <template #footer>
                <n-divider class="my-2">
                    <n-text depth="3" class="text-xs">快速登入（Demo 用）</n-text>
                </n-divider>
                <div class="flex gap-2 justify-center">
                    <n-button
                        v-for="u in QUICK_USERS"
                        :key="u.username"
                        size="small"
                        :loading="loading"
                        @click="quickLogin(u.username, u.password)"
                    >
                        {{ u.label }}
                    </n-button>
                </div>
            </template>
        </n-card>
    </div>
</template>
