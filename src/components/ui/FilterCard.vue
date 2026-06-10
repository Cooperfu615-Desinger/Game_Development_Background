<script setup lang="ts">
/**
 * FilterCard — 列表頁的查詢條件卡片。
 *
 * 取代 demo 移植頁面中重複 30 次的樣板：
 *   <SectionCard class="merchant-filter-card">
 *     <template #header>
 *       <div class="dialog-title-block"><h2>標題</h2><p>描述</p></div>
 *     </template>
 *     ...篩選 grid...
 *   </SectionCard>
 *
 * 標題 / 描述用 props，篩選 grid 放預設 slot（各頁不同，不抽）。
 * 樣式沿用全域 demo-pages.css，不在此寫 <style>。
 */
import SectionCard from './SectionCard.vue'

defineProps<{ title: string; description?: string }>()
</script>

<template>
    <SectionCard class="merchant-filter-card">
        <template #header>
            <div class="dialog-title-block">
                <h2>{{ title }}</h2>
                <p v-if="description">{{ description }}</p>
            </div>
        </template>
        <slot />
    </SectionCard>
</template>
