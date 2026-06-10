<script setup lang="ts">
/**
 * SummaryCardGrid — 列表頁頂部的指標摘要卡片格。
 *
 * 取代 demo 移植頁面中重複 26 次的 `agent-summary-grid` 區塊。
 * 兩種卡片形狀，由資料是否帶 icon 決定：
 *   - 純三件式：{ label, value, helper }
 *   - 帶標頭：額外 { icon, severity } → 上方多一列 icon + Tag（Reports / Settlements 用）
 *
 * 樣式沿用全域 demo-pages.css 的 .agent-summary-grid / .agent-summary-card /
 * .risk-overview-kpi-head / .agent-section-icon，不在此寫 <style>。
 *
 * 注意：Risk/Overview 用 kpiCards + 額外 class + Tag 顯示 delta，屬一次性變體，
 *      未納入本元件。
 */
import Tag from 'primevue/tag'

type Severity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'

export interface SummaryCard {
    label: string
    value: string | number
    helper?: string
    icon?: string
    severity?: Severity
}

defineProps<{ cards: SummaryCard[] }>()
</script>

<template>
    <section class="agent-summary-grid">
        <article v-for="item in cards" :key="item.label" class="agent-summary-card">
            <div v-if="item.icon" class="risk-overview-kpi-head">
                <span class="agent-section-icon"><i :class="item.icon" /></span>
                <Tag :value="item.label" :severity="item.severity" />
            </div>
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
            <small>{{ item.helper }}</small>
        </article>
    </section>
</template>
