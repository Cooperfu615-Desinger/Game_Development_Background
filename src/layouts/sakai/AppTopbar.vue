<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Select from 'primevue/select'
import { useSakaiLayout } from './useSakaiLayout'
import { useAuthStore } from '@/stores/auth'
import { usePortalStore } from '@/stores/portal'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import type { PortalDefinition } from '@/types/portal'

const { toggleMenu, toggleDarkMode, isDarkTheme } = useSakaiLayout()
const router = useRouter()
const authStore = useAuthStore()
const portalStore = usePortalStore()
const { t } = useI18n()

// Agent / Merchant Portal 路由屬 V4（Phase B），先以停用選項呈現
const portalOptionDisabled = (option: PortalDefinition) => option.type !== 'supplier'

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
            <div class="layout-topbar-identity">
                <strong>{{ portalStore.current.label }}</strong>
                <span>{{ portalStore.current.description }}</span>
            </div>
        </div>

        <div class="layout-topbar-actions">
            <!-- Portal switcher（Agent/Merchant 為 Phase B，先停用） -->
            <Select
                v-model="portalStore.currentType"
                :options="portalStore.portals"
                option-label="label"
                option-value="type"
                :option-disabled="portalOptionDisabled"
                class="layout-portal-select"
                aria-label="切換 Portal"
            />

            <!-- Notifications（視覺對齊 demo，功能屬通知中心 V4） -->
            <button class="layout-topbar-action" aria-label="通知">
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
