<script setup lang="ts">
import { h, ref, computed } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { 
  NLayout, NLayoutSider, NLayoutHeader, NLayoutContent, NLayoutFooter,
  NMenu, NButton, NAvatar, NDropdown, NTag
} from 'naive-ui'
import type { MenuOption } from 'naive-ui'
import { 
  DashboardOutlined, 
  PeopleAltOutlined, 
  CasinoOutlined, 
  BarChartOutlined,
  MenuOpenOutlined,
  MenuOutlined,
  DescriptionOutlined,
  AttachMoneyOutlined
} from '@vicons/material'
import { NIcon } from 'naive-ui'
import { useAuthStore } from '../stores/auth'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const currentRoute = useRoute()
const authStore = useAuthStore()
const { t } = useI18n()

// State
const collapsed = ref(false)

// Menu Icon Helper
const renderIcon = (icon: any) => {
  return () => h(NIcon, null, { default: () => h(icon) })
}

// Menu Options
// Menu Options
const menuOptions = computed<MenuOption[]>(() => [
  {
    type: 'group',
    label: t('menu.masterAdmin'),
    key: 'master-admin',
    children: [
        {
            label: () => h(RouterLink, { to: '/admin/dashboard' }, { default: () => t('menu.dashboard') }),
            key: 'admin-dashboard',
            icon: renderIcon(DashboardOutlined)
        },
        {
            label: () => h(RouterLink, { to: '/admin/merchant/list' }, { default: () => t('menu.merchant') }),
            key: 'merchant-list',
            icon: renderIcon(PeopleAltOutlined)
        },
        {
            label: () => h(RouterLink, { to: '/admin/game-center/list' }, { default: () => t('menu.gameCenter') }),
            key: 'game-center',
            icon: renderIcon(CasinoOutlined)
        },
        {
            label: t('menu.dataCenter'),
            key: 'data-center',
            icon: renderIcon(BarChartOutlined),
            children: [
              {
                label: () => h(RouterLink, { to: '/admin/data-center/bet-log' }, { default: () => t('menu.betLogs') }),
                key: 'BetLog',
                icon: renderIcon(DescriptionOutlined)
              },
              {
                label: () => h(RouterLink, { to: '/admin/data-center/report' }, { default: () => t('menu.financialReport') }),
                key: 'FinancialReport',
                icon: renderIcon(AttachMoneyOutlined)
              }
            ]
        }
    ]
  },
  {
    type: 'divider',
    key: 'd1'
  },
  {
    type: 'group',
    label: t('menu.agentView'),
    key: 'agent-view',
    children: [
        {
          label: () => h(RouterLink, { to: '/agent/dashboard' }, { default: () => t('menu.dashboard') }),
          key: 'agent-dashboard',
          icon: renderIcon(DashboardOutlined)
        },
        {
          label: () => h(RouterLink, { to: '/agent/organization/sub-list' }, { default: () => t('menu.organization') }),
          key: 'sub-agent-list',
          icon: renderIcon(PeopleAltOutlined)
        },
        {
          label: () => h(RouterLink, { to: '/agent/reports' }, { default: () => t('menu.reports') }),
          key: 'agent-reports',
          icon: renderIcon(BarChartOutlined)
        }
    ]
  }
])

// Active Key Logic
const activeKey = computed(() => {
    // Map route names to menu keys if simple match isn't enough
    // For now, we use route name or simple mapping
    return currentRoute.name as string
})

// Header Dropdown
const userOptions = computed(() => [
    { label: t('menu.profile'), key: 'profile' },
    { label: t('menu.logout'), key: 'logout' }
])
const handleUserSelect = (key: string) => {
    if (key === 'logout') {
        authStore.logout()
        router.push('/login')
    }
}

const handleVersionClick = () => {
    window.alert('System Ready')
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
           <span v-if="!collapsed" class="text-xl font-bold text-white tracking-widest pl-4">Game Platform</span>
           <span v-else class="text-xl font-bold text-white">GP</span>
        </div>
      <n-menu
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="menuOptions"
        :value="activeKey"
        :inverted="true"
      />
    </n-layout-sider>

    <n-layout>
      <n-layout-header bordered class="h-16 flex items-center justify-between px-6 bg-[#18181c]">
         <div class="flex items-center">
            <n-button quaternary circle @click="collapsed = !collapsed">
                <template #icon>
                    <n-icon size="24">
                        <MenuOpenOutlined v-if="!collapsed"/>
                        <MenuOutlined v-else/>
                    </n-icon>
                </template>
            </n-button>
         </div>
         
         <div class="flex items-center gap-4">
             <div class="text-right hidden md:block">
                 <div class="text-sm font-bold">Admin User</div>
                 <div class="text-xs text-gray-400">Super Administrator</div>
             </div>
             <LanguageSwitcher />
             <n-dropdown :options="userOptions" @select="handleUserSelect">
                <n-avatar round size="medium" src="https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff" class="cursor-pointer" />
             </n-dropdown>
         </div>
      </n-layout-header>
      
      <n-layout-content content-style="padding: 24px; min-height: 85vh;">
         <router-view></router-view>
      </n-layout-content>
      <n-layout-footer bordered class="p-4 text-center">
          <n-tag :bordered="false" size="small" class="cursor-pointer opacity-50 hover:opacity-100 transition-opacity" @click="handleVersionClick">
             Version: v0.1.0 (Prototype)
          </n-tag>
      </n-layout-footer>
    </n-layout>
  </n-layout>
</template>
