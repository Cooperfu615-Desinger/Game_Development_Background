<script setup lang="ts">
/**
 * AppBreadcrumb — 頁面層級麵包屑 + 標題（對齊參考 demo 的 page-header）
 *
 * Demo 把「群組 > 頁面」與 h1 放在 AppShell 的 page-header；
 * 我們的頁面內容不含 h1（標題在第一張卡的 header），由 layout 統一補上。
 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { buildProviderMenu } from '@/config/menu-sakai'

const route = useRoute()
const { t } = useI18n()

const located = computed(() => {
    const menu = buildProviderMenu(t)
    for (const group of menu) {
        const item = group.items.find((entry) => entry.to === route.path)
        if (item) return { group: group.label, page: item.label }
    }
    // 不在選單上的路由（詳情頁等）退回 meta.title
    const metaKey = route.meta.title as string | undefined
    return { group: '', page: metaKey ? t(metaKey) : '' }
})
</script>

<template>
    <section v-if="located.page" class="layout-page-header">
        <div class="layout-breadcrumbs">
            <template v-if="located.group">
                <span>{{ located.group }}</span>
                <i class="pi pi-angle-right" />
            </template>
            <span>{{ located.page }}</span>
        </div>
        <h1>{{ located.page }}</h1>
    </section>
</template>
