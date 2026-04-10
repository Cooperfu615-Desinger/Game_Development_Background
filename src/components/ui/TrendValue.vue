<script setup lang="ts">
/**
 * TrendValue — 趨勢值顯示組件
 * 顯示增長率，附帶方向箭頭和顏色
 *
 * Usage:
 *   <TrendValue :value="12.4" />              → ▲ 12.4%
 *   <TrendValue :value="-3.2" />              → ▼ 3.2%
 *   <TrendValue :value="0" label="持平" />    → — 持平
 *   <TrendValue :value="5.6" show-label />    → ▲ 5.6% vs 上月
 */

interface Props {
  /** 增長率（正數=增長，負數=下降） */
  value: number
  /** 小數位數 */
  decimals?: number
  /** 自定義標籤（如 "vs 上月"） */
  label?: string
  /** 是否顯示對比標籤 */
  showLabel?: boolean
  /** 反轉顏色（某些指標下降是好事，如成本、錯誤率） */
  inverse?: boolean
  /** 顯示尺寸 */
  size?: 'xs' | 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  decimals:  1,
  label:     'vs 上月',
  showLabel: false,
  inverse:   false,
  size:      'sm',
})

const isPositive = computed(() => props.value > 0)
const isNegative = computed(() => props.value < 0)
const isFlat     = computed(() => props.value === 0)

/** 是否顯示為「好」的狀態（考慮 inverse） */
const isGood = computed(() => {
  if (props.inverse) return isNegative.value
  return isPositive.value
})

const isBad = computed(() => {
  if (props.inverse) return isPositive.value
  return isNegative.value
})

const arrow = computed(() => {
  if (isPositive.value) return '▲'
  if (isNegative.value) return '▼'
  return '—'
})

const displayValue = computed(() => {
  const abs = Math.abs(props.value)
  return `${abs.toFixed(props.decimals)}%`
})

const colorClass = computed(() => {
  if (isFlat.value) return 'trend-flat'
  if (isGood.value) return 'trend-up'
  if (isBad.value)  return 'trend-down'
  return 'trend-flat'
})

const sizeClass = computed(() => ({
  xs: 'text-[11px]',
  sm: 'text-xs',
  md: 'text-sm',
}[props.size]))

import { computed } from 'vue'
</script>

<template>
  <span
    class="inline-flex items-center gap-1 font-mono font-medium"
    :class="[colorClass, sizeClass]"
  >
    <span class="text-[0.85em]">{{ arrow }}</span>
    <span>{{ displayValue }}</span>
    <span v-if="showLabel && !isFlat" class="font-sans opacity-60">
      {{ label }}
    </span>
  </span>
</template>

<style scoped>
.trend-up {
  color: var(--color-status-online);
}
.trend-down {
  color: var(--color-status-error);
}
.trend-flat {
  color: var(--color-text-muted);
}
</style>
