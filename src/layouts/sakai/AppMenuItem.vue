<script setup lang="ts">
import { computed } from 'vue'
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

const fullPath = computed(() => {
    if (!props.item.to) return null
    return props.parentPath ? props.parentPath + props.item.to : props.item.to
})

const isActive = computed(() => {
    if (props.item.items) {
        return layoutState.activePath?.startsWith(props.item.to ?? '')
    }
    return layoutState.activePath === props.item.to
})

const itemClick = (event: MouseEvent, item: MenuItem) => {
    if (item.items) {
        if (isActive.value) {
            layoutState.activePath = layoutState.activePath?.replace(item.to ?? '', '') ?? null
        } else {
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
    <li :class="{ 'layout-root-menuitem': root, 'active-menuitem': isActive }">
        <div v-if="root && item.visible !== false" class="layout-menuitem-root-text">
            {{ item.label }}
        </div>

        <!-- Submenu trigger (no router-link, has children) -->
        <a
            v-if="(!item.to || item.items) && item.visible !== false"
            :href="item.url"
            :target="item.target"
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
            <ul v-show="root ? true : isActive" class="layout-submenu">
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
