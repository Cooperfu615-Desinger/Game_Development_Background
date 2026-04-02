<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { NMenu } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { menuOptions } from '../config/menu'

const route = useRoute()
const { t } = useI18n()

const options = computed(() => menuOptions(t))

const activeKey = computed(() => route.name as string)

// Keep collapsed state in sync if needed externally
defineProps<{ collapsed: boolean }>()
</script>

<template>
  <n-menu
    :collapsed="collapsed"
    :collapsed-width="64"
    :collapsed-icon-size="22"
    :options="options"
    :value="activeKey"
    :inverted="true"
  />
</template>
