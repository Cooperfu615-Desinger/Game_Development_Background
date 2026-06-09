<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSakaiLayout } from './useSakaiLayout'
import AppMenu from './AppMenu.vue'

const { layoutState, isDesktop, hasOpenOverlay } = useSakaiLayout()
const route = useRoute()
const sidebarRef = ref<HTMLElement | null>(null)
let outsideClickListener: ((e: MouseEvent) => void) | null = null

watch(
    () => route.path,
    (newPath) => {
        layoutState.activePath = newPath
        layoutState.overlayMenuActive = false
        layoutState.mobileMenuActive = false
        layoutState.menuHoverActive = false
    },
    { immediate: true }
)

watch(hasOpenOverlay, (open) => {
    if (!isDesktop()) return
    if (open) bindOutsideClick()
    else unbindOutsideClick()
})

const bindOutsideClick = () => {
    if (outsideClickListener) return
    outsideClickListener = (event: MouseEvent) => {
        const topbarBtn = document.querySelector('.layout-menu-button')
        const target = event.target as Node
        const inside =
            sidebarRef.value?.isSameNode(target) ||
            sidebarRef.value?.contains(target) ||
            topbarBtn?.isSameNode(target) ||
            topbarBtn?.contains(target)
        if (!inside) layoutState.overlayMenuActive = false
    }
    document.addEventListener('click', outsideClickListener)
}

const unbindOutsideClick = () => {
    if (!outsideClickListener) return
    document.removeEventListener('click', outsideClickListener)
    outsideClickListener = null
}

onBeforeUnmount(unbindOutsideClick)
</script>

<template>
    <aside ref="sidebarRef" class="layout-sidebar">
        <div class="layout-sidebar-brand">
            <i class="pi pi-th-large layout-sidebar-brand-icon" />
            <span class="layout-sidebar-brand-text">Game Dev Hub</span>
        </div>
        <AppMenu />
    </aside>
</template>
