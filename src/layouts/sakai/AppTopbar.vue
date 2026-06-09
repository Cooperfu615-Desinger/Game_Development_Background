<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSakaiLayout } from './useSakaiLayout'
import { useAuthStore } from '@/stores/auth'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

const { toggleMenu, toggleDarkMode, isDarkTheme } = useSakaiLayout()
const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const userName = computed(() => authStore.userInfo?.name ?? 'Developer')
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
        </div>

        <div class="layout-topbar-actions">
            <!-- Dark mode toggle -->
            <button
                class="layout-topbar-action"
                :aria-label="isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode'"
                @click="toggleDarkMode"
            >
                <i :class="['pi', isDarkTheme ? 'pi-sun' : 'pi-moon']" />
            </button>

            <!-- Language switcher -->
            <LanguageSwitcher />

            <!-- User info + logout -->
            <div class="layout-topbar-user">
                <div class="layout-topbar-user-text">
                    <div class="layout-topbar-user-name">{{ userName }}</div>
                    <div class="layout-topbar-user-role">Game Developer</div>
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
