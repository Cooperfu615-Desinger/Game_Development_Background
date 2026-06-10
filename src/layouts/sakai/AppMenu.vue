<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { buildMenuForPortal } from '@/config/menu-sakai'
import { usePortalStore } from '@/stores/portal'
import AppMenuItem from './AppMenuItem.vue'

const { t } = useI18n()
const portal = usePortalStore()
const model = computed(() => buildMenuForPortal(t, portal.currentType))
</script>

<template>
    <ul class="layout-menu">
        <AppMenuItem
            v-for="(group, i) in model"
            :key="i"
            :item="group as any"
            :root="true"
        />
    </ul>
</template>
