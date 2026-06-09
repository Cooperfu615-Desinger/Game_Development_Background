<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
    <div class="hig-page">
        <header class="hig-page-header">
            <h1 class="hig-page-title">
                <i class="pi pi-th-large" />
                遊戲詳情 #{{ route.params.id }}
            </h1>
        </header>

        <section class="hig-card">
            <div class="hig-card-body">
                <p class="text-secondary">Game Detail — 待 Phase 6 用新技術棧實作</p>
            </div>
        </section>
    </div>
</template>

<style scoped>
.text-secondary {
    color: var(--hig-text-secondary);
}
</style>
