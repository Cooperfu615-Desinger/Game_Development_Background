<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { buildSakaiMenu } from '@/config/menu-sakai'
import AppMenuItem from './AppMenuItem.vue'

const { t } = useI18n()
const model = computed(() => buildSakaiMenu(t))
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
