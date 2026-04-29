<script setup lang="ts">
import { darkTheme } from 'naive-ui'
import { NConfigProvider, NMessageProvider, NDialogProvider, NGlobalStyle, zhTW, dateZhTW, enUS, dateEnUS } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

// Lead Dev Note:
// Using NConfigProvider to enforce Dark Theme globally.
// NMessageProvider is required for useMessage() composable.
// NGlobalStyle handles global style resets from Naive UI.

const { locale } = useI18n()

// Theme Overrides — Neon Cyan (aligned with design-tokens.css)
const themeOverrides = {
  common: {
    primaryColor: '#00D4FF',
    primaryColorHover: '#33DDFF',
    primaryColorPressed: '#00AACC',
    primaryColorSuppl: '#003D4D',
    borderRadius: '8px',
    fontFamily: "Rajdhani, 'Noto Sans TC', system-ui, sans-serif",
  },
  Button: {
    textColorPrimary: '#0A0E1A',
    fontWeight: '600',
  },
  Menu: {
    itemColorActive: 'rgba(0, 212, 255, 0.12)',
    itemTextColorActive: '#00D4FF',
    itemIconColorActive: '#00D4FF',
    itemColorActiveHover: 'rgba(0, 212, 255, 0.16)',
    itemTextColorActiveHover: '#33DDFF',
    itemIconColorActiveHover: '#33DDFF',
  },
  DataTable: {
    thColor: '#0F1525',
    tdColor: '#141B2D',
    tdColorHover: 'rgba(0, 212, 255, 0.05)',
    borderColor: '#1E3054',
  },
  Card: {
    color: '#141B2D',
    colorModal: '#141B2D',
    borderColor: '#1E3054',
  },
}

const naiveLocale = computed(() => {
  return locale.value === 'zh-TW' ? zhTW : enUS
})

const naiveDateLocale = computed(() => {
  return locale.value === 'zh-TW' ? dateZhTW : dateEnUS
})
</script>

<template>
  <n-config-provider :theme="darkTheme" :theme-overrides="themeOverrides" :locale="naiveLocale" :date-locale="naiveDateLocale">
    <n-global-style />
    <n-dialog-provider>
      <n-message-provider>
        <div class="min-h-screen bg-[#0A0E1A] text-white">
          <router-view />
        </div>
      </n-message-provider>
    </n-dialog-provider>
  </n-config-provider>
</template>
