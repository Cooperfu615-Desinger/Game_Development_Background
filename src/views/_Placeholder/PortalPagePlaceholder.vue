<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import SectionCard from '@/components/ui/SectionCard.vue'

const route = useRoute()
const { t } = useI18n()

const titleKey = computed(() => (route.meta.title as string | undefined) ?? '')
const pageTitle = computed(() => (titleKey.value ? t(titleKey.value) : ''))
const portal = computed(() => (route.meta.portal as string | undefined) ?? '')
</script>

<template>
    <SectionCard style="min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem">
        <i class="pi pi-wrench" style="font-size: 2.5rem; color: var(--hig-text-secondary)" />
        <h2 style="margin: 0">{{ pageTitle }}</h2>
        <p style="margin: 0; color: var(--hig-text-secondary)">{{ portal || '—' }} · {{ route.path }}</p>
        <p style="margin: 0; color: var(--hig-text-secondary)">{{ t('common.c2Placeholder') }}</p>
    </SectionCard>
</template>
