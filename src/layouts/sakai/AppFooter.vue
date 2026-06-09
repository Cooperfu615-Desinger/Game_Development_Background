<script setup lang="ts">
import { computed } from 'vue'

const year = computed(() => 2026)
</script>

<template>
    <footer class="layout-footer">
        <span class="layout-footer-text">
            Game Developer Dashboard · v0.1.0 · © {{ year }}
        </span>
    </footer>
</template>
