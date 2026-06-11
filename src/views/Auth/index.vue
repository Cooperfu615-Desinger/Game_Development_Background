<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Divider from 'primevue/divider'
import Toast from 'primevue/toast'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const toast = useToast()
const authStore = useAuthStore()

// ─── Form state ────────────────────────────────────────
const loading = ref(false)
const model = reactive({ username: '', password: '' })
const errors = reactive({ username: '', password: '' })

// ─── Validation ────────────────────────────────────────
const validate = (): boolean => {
    errors.username = ''
    errors.password = ''

    if (!model.username.trim()) {
        errors.username = t('form.required', { field: t('login.account') })
    }
    if (!model.password) {
        errors.password = t('form.required', { field: t('login.password') })
    }
    return !errors.username && !errors.password
}

// ─── Submit ─────────────────────────────────────────────
const doLogin = async () => {
    loading.value = true
    try {
        const result = await authStore.login(model.username, model.password)
        if (result.success) {
            toast.add({
                severity: 'success',
                summary: t('login.success'),
                life: 2000,
            })
            const redirect = route.query.redirect as string | undefined
            router.push(redirect ?? '/dashboard')
        } else {
            toast.add({
                severity: 'error',
                summary: result.message || t('login.failed'),
                life: 4000,
            })
        }
    } finally {
        loading.value = false
    }
}

const handleLogin = async () => {
    if (!validate()) return
    await doLogin()
}

// ─── Quick login demo users ─────────────────────────────
const QUICK_USERS = [
    { label: '👑 總管理員', username: 'admin', password: 'admin123' },
    { label: '🔧 技術', username: 'tech', password: 'tech123' },
    { label: '📋 PM', username: 'pm', password: 'pm123' },
]

const quickLogin = async (username: string, password: string) => {
    model.username = username
    model.password = password
    await doLogin()
}

const openDocs = () => {
    // hash mode：resolve().href = '#/docs'（相對 URL，對當前頁解析），本機與 GitHub Pages 皆正確
    window.open(router.resolve('/docs').href, '_blank')
}

const submitLabel = computed(() => (loading.value ? t('login.authenticating') : t('login.submit')))
</script>

<template>
    <div class="login-page">
        <!-- Login card -->
        <div class="login-card">
            <header class="login-header">
                <div class="login-emoji">🎮</div>
                <h1 class="login-title">{{ t('login.appName') }}</h1>
                <p class="login-subtitle">{{ t('login.subtitle') }}</p>
            </header>

            <form class="login-form" @submit.prevent="handleLogin">
                <div class="login-field">
                    <label for="username">{{ t('login.account') }}</label>
                    <InputText
                        id="username"
                        v-model="model.username"
                        :placeholder="t('login.placeholderUsername')"
                        :invalid="!!errors.username"
                        autocomplete="username"
                        fluid
                    />
                    <small v-if="errors.username" class="login-error">{{ errors.username }}</small>
                </div>

                <div class="login-field">
                    <label for="password">{{ t('login.password') }}</label>
                    <Password
                        v-model="model.password"
                        :placeholder="t('login.placeholderPassword')"
                        :feedback="false"
                        toggle-mask
                        :invalid="!!errors.password"
                        :input-props="{ id: 'password', autocomplete: 'current-password' }"
                        fluid
                    />
                    <small v-if="errors.password" class="login-error">{{ errors.password }}</small>
                </div>

                <Button
                    type="submit"
                    :label="submitLabel"
                    :loading="loading"
                    fluid
                    class="login-submit"
                />
            </form>

            <Divider align="center" class="my-4">
                <span class="text-xs opacity-60">快速登入（Demo 用）</span>
            </Divider>

            <div class="login-quick">
                <Button
                    v-for="u in QUICK_USERS"
                    :key="u.username"
                    :label="u.label"
                    size="small"
                    severity="secondary"
                    outlined
                    :disabled="loading"
                    @click="quickLogin(u.username, u.password)"
                />
                <Button
                    :label="t('login.docs')"
                    size="small"
                    severity="secondary"
                    outlined
                    @click="openDocs"
                />
            </div>
        </div>

        <Toast position="top-center" />
    </div>
</template>

<style scoped>
.login-page {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--hig-bg-base);
    overflow: hidden;
}

/* Card */
.login-card {
    position: relative;
    z-index: 1;
    width: 24rem;
    padding: 2.25rem 2rem;
    border-radius: var(--hig-radius-card);
    background: var(--hig-bg-surface);
    border: 1px solid var(--hig-border-default);
    box-shadow: var(--hig-shadow-lg);
    backdrop-filter: var(--hig-blur-md);
    -webkit-backdrop-filter: var(--hig-blur-md);
}

/* Header */
.login-header {
    text-align: center;
    margin-bottom: 1.75rem;
}
.login-emoji {
    font-size: 2.25rem;
    margin-bottom: 0.5rem;
}
.login-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--hig-text-primary);
    margin: 0 0 0.25rem;
    letter-spacing: -0.01em;
}
.login-subtitle {
    font-size: 0.8125rem;
    color: var(--hig-text-secondary);
    margin: 0;
}

/* Form */
.login-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}
.login-field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
}
.login-field label {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--hig-text-primary);
}
.login-error {
    color: var(--hig-red);
    font-size: 0.75rem;
}
.login-submit {
    margin-top: 0.5rem;
}

/* Quick login */
.login-quick {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
}
</style>
