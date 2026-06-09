<!--
    CurrencyAmount — 金額顯示（tabular-nums，紅綠色語意）
    From: reference demo

    使用範例：
        <CurrencyAmount value="$1,234.56" />
        <CurrencyAmount value="-$200" negative />
-->
<script setup lang="ts">
defineProps<{
    value: string
    negative?: boolean
}>()
</script>

<template>
    <span class="amount" :class="{ negative }">{{ value }}</span>
</template>

<style scoped>
.amount {
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--hig-text-primary);
}
.amount.negative {
    color: var(--hig-red);
}
</style>
