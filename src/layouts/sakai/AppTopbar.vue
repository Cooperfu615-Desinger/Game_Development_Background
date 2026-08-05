<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSakaiLayout } from './useSakaiLayout'
import { useAuthStore } from '@/stores/auth'
import { decodeToken } from '@/services/auth/mockToken'

const { toggleMenu, toggleDarkMode, isDarkTheme } = useSakaiLayout()
const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

// 顯示名綁當前 token 的 actorName，切 Portal 即時更新（QA L-4）。
// userInfo.name 只在登入時寫死，切 Portal 不會變。token 缺失時退回登入名。
const userName = computed(
    () => decodeToken(authStore.token)?.actorName ?? authStore.userInfo?.name ?? 'Developer'
)
const userInitial = computed(() => userName.value.charAt(0).toUpperCase())

const handleLogout = () => {
    authStore.logout()
    router.push('/login')
}
</script>

<template>
    <header class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button
                class="layout-menu-button layout-topbar-action"
                aria-label="Toggle menu"
                @click="toggleMenu"
            >
                <i class="pi pi-bars" />
            </button>
            <div class="layout-topbar-identity">
                <strong>{{ t('menu.providerPortal') }}</strong>
                <span>{{ t('menu.providerPortalDescription') }}</span>
            </div>
        </div>

        <div class="layout-topbar-actions">
            <!-- 通知中心先保留入口，實際未讀資料於通知模組接入時補上。 -->
            <button class="layout-topbar-action" aria-label="通知" @click="router.push('/notifications')">
                <i class="pi pi-bell" />
            </button>

            <!-- Dark mode toggle -->
            <button
                class="layout-topbar-action"
                :aria-label="isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode'"
                @click="toggleDarkMode"
            >
                <i :class="['pi', isDarkTheme ? 'pi-sun' : 'pi-moon']" />
            </button>

            <!-- User info + logout -->
            <div class="layout-topbar-user">
                <div class="layout-topbar-user-text">
                    <div class="layout-topbar-user-name">{{ userName }}</div>
                    <div class="layout-topbar-user-role">{{ t('menu.providerPortal') }}</div>
                </div>
                <div class="layout-topbar-avatar" :title="userName">
                    {{ userInitial }}
                </div>
                <button
                    class="layout-topbar-action"
                    :aria-label="t('menu.logout')"
                    :title="t('menu.logout')"
                    @click="handleLogout"
                >
                    <i class="pi pi-sign-out" />
                </button>
            </div>
        </div>
    </header>
</template>
