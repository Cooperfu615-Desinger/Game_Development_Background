<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useSakaiLayout } from './useSakaiLayout'
import type { MenuItem } from '@/config/menu-sakai'

const props = withDefaults(
    defineProps<{
        item: MenuItem
        root?: boolean
        parentPath?: string | null
    }>(),
    {
        root: true,
        parentPath: null,
    }
)

const { layoutState, isDesktop } = useSakaiLayout()
const isExpanded = ref(false)

const fullPath = computed(() => {
    return props.item.to ?? props.parentPath
})

const isActive = computed(() => {
    if (props.item.items) {
        return Boolean(props.item.to && layoutState.activePath?.startsWith(props.item.to))
    }
    return layoutState.activePath === props.item.to
})

watch(
    isActive,
    (active) => {
        isExpanded.value = active
    },
    { immediate: true }
)

const itemClick = (event: MouseEvent, item: MenuItem) => {
    if (item.items) {
        event.preventDefault()

        // Route changes open the active group automatically, while a click
        // can explicitly collapse or expand it without changing the route.
        isExpanded.value = !isExpanded.value
        if (isExpanded.value && !isActive.value) {
            layoutState.activePath = fullPath.value
            layoutState.menuHoverActive = true
        }
    } else {
        layoutState.overlayMenuActive = false
        layoutState.mobileMenuActive = false
        layoutState.menuHoverActive = false
    }
}

const onMouseEnter = () => {
    if (isDesktop() && props.root && props.item.items && layoutState.menuHoverActive) {
        layoutState.activePath = fullPath.value
    }
}
</script>

<template>
    <li :class="{ 'layout-root-menuitem': root, 'active-menuitem': isActive, 'expanded-menuitem': isExpanded }">
        <div v-if="root && item.visible !== false" class="layout-menuitem-root-text">
            {{ item.label }}
        </div>

        <!-- Submenu trigger (no router-link, has children) -->
        <a
            v-if="(!item.to || item.items) && item.visible !== false"
            :href="item.url"
            :target="item.target"
            :class="{ 'layout-menuitem-parent': item.items }"
            tabindex="0"
            @click="itemClick($event, item)"
            @mouseenter="onMouseEnter"
        >
            <i :class="item.icon" class="layout-menuitem-icon" />
            <span class="layout-menuitem-text">{{ item.label }}</span>
            <i v-if="item.items" class="pi pi-fw pi-angle-down layout-submenu-toggler" />
        </a>

        <!-- Leaf with router link -->
        <router-link
            v-if="item.to && !item.items && item.visible !== false"
            :to="item.to"
            exact-active-class="active-route"
            tabindex="0"
            @click="itemClick($event, item)"
            @mouseenter="onMouseEnter"
        >
            <i :class="item.icon" class="layout-menuitem-icon" />
            <span class="layout-menuitem-text">{{ item.label }}</span>
        </router-link>

        <Transition v-if="item.items && item.visible !== false" name="layout-submenu">
            <ul v-show="root ? true : isExpanded" :class="{ 'layout-submenu-nested': !root }" class="layout-submenu">
                <AppMenuItem
                    v-for="child in item.items"
                    :key="child.label + '_' + (child.to ?? '')"
                    :item="child"
                    :root="false"
                    :parent-path="fullPath"
                />
            </ul>
        </Transition>
    </li>
</template>
