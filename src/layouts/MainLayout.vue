<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
    NLayout, NLayoutSider, NLayoutHeader, NLayoutContent, NLayoutFooter,
    NButton, NAvatar, NDropdown, NTag, NIcon
} from 'naive-ui'
import { MenuOpenOutlined, MenuOutlined } from '@vicons/material'
import { useAuthStore } from '../stores/auth'
import { useI18n } from 'vue-i18n'
import AppMenu from './AppMenu.vue'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const collapsed = ref(false)

const userName = computed(() => authStore.userInfo?.name ?? 'Developer')

const userOptions = computed(() => [
    { label: t('menu.logout'), key: 'logout' }
])

const handleUserSelect = (key: string) => {
    if (key === 'logout') {
        authStore.logout()
        router.push('/login')
    }
}
</script>

<template>
  <n-layout has-sider class="h-screen">
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="240"
      :collapsed="collapsed"
      show-trigger="bar"
      @collapse="collapsed = true"
      @expand="collapsed = false"
      :inverted="true"
    >
      <div class="h-16 flex items-center justify-center overflow-hidden whitespace-nowrap">
        <span v-if="!collapsed" class="text-base font-bold text-white tracking-widest pl-4">Game Dev Hub</span>
        <span v-else class="text-base font-bold text-white">GD</span>
      </div>
      <AppMenu :collapsed="collapsed" />
    </n-layout-sider>

    <n-layout>
      <n-layout-header bordered class="h-16 flex items-center justify-between px-6">
        <n-button quaternary circle @click="collapsed = !collapsed">
          <template #icon>
            <n-icon size="22">
              <MenuOpenOutlined v-if="!collapsed" />
              <MenuOutlined v-else />
            </n-icon>
          </template>
        </n-button>

        <div class="flex items-center gap-4">
          <LanguageSwitcher />
          <div class="text-right hidden md:block">
            <div class="text-sm font-semibold">{{ userName }}</div>
            <div class="text-xs opacity-50">Game Developer</div>
          </div>
          <n-dropdown :options="userOptions" @select="handleUserSelect">
            <n-avatar
              round
              size="medium"
              :src="`https://ui-avatars.com/api/?name=${userName}&background=0D8ABC&color=fff`"
              class="cursor-pointer"
            />
          </n-dropdown>
        </div>
      </n-layout-header>

      <n-layout-content content-style="padding: 24px; min-height: calc(100vh - 120px);">
        <router-view />
      </n-layout-content>

      <n-layout-footer bordered class="p-4 text-center">
        <n-tag :bordered="false" size="small" class="opacity-40">
          Game Developer Dashboard · v0.1.0
        </n-tag>
      </n-layout-footer>
    </n-layout>
  </n-layout>
</template>
