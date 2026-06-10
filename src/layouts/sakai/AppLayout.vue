<script setup lang="ts">
import { computed } from 'vue'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import { useSakaiLayout } from './useSakaiLayout'
import AppTopbar from './AppTopbar.vue'
import AppSidebar from './AppSidebar.vue'
import AppBreadcrumb from './AppBreadcrumb.vue'
import AppFooter from './AppFooter.vue'
import './sakai-layout.css'

const { layoutConfig, layoutState, hideMobileMenu } = useSakaiLayout()

const containerClass = computed(() => ({
    'layout-overlay': layoutConfig.menuMode === 'overlay',
    'layout-static': layoutConfig.menuMode === 'static',
    'layout-overlay-active': layoutState.overlayMenuActive,
    'layout-mobile-active': layoutState.mobileMenuActive,
    'layout-static-inactive': layoutState.staticMenuInactive,
}))
</script>

<template>
    <div class="layout-wrapper" :class="containerClass">
        <AppTopbar />
        <AppSidebar />

        <div class="layout-main-container">
            <main class="layout-main">
                <AppBreadcrumb />
                <router-view />
            </main>
            <AppFooter />
        </div>

        <div class="layout-mask" @click="hideMobileMenu" />

        <!-- PrimeVue services -->
        <Toast />
        <ConfirmDialog />
    </div>
</template>
