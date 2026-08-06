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
import { buildProviderMenu, type MenuItem } from '@/config/menu-sakai'

const route = useRoute()
const { t } = useI18n()

const findMenuPath = (items: MenuItem[], target: string, ancestors: string[]): string[] | null => {
    for (const item of items) {
        const itemPath = [...ancestors, item.label]

        // Search children first because a parent group and its first page can
        // intentionally share the same route, such as /lobby.
        if (item.items) {
            const nestedPath = findMenuPath(item.items, target, itemPath)
            if (nestedPath) return nestedPath
        }

        if (item.to === target) return itemPath
    }

    return null
}

const located = computed(() => {
    const menu = buildProviderMenu(t)

    for (const group of menu) {
        const path = findMenuPath(group.items, route.path, [group.label])
        if (path) {
            return {
                trail: path,
                page: path[path.length - 1],
            }
        }
    }

    // 不在選單上的路由（詳情頁等）退回 meta.title
    const metaKey = route.meta.title as string | undefined
    const page = metaKey ? t(metaKey) : ''
    return { trail: page ? [page] : [], page }
})
</script>

<template>
    <section v-if="located.page" class="layout-page-header">
        <div class="layout-breadcrumbs">
            <template v-for="(crumb, index) in located.trail" :key="`${crumb}-${index}`">
                <i v-if="index > 0" class="pi pi-angle-right" />
                <span>{{ crumb }}</span>
            </template>
        </div>
        <h1>{{ located.page }}</h1>
    </section>
</template>
