<script setup lang="ts">
/**
 * StatCard — 統計卡片組件
 * 展示核心指標數字 + 趨勢變化 + 比較說明
 *
 * Usage:
 *   <StatCard
 *     label="本月 GGR"
 *     :value="2847293"
 *     prefix="NT$"
 *     :trend="12.4"
 *     trend-label="vs 上月"
 *     icon="💰"
 *     format="currency"
 *   />
 */

import { computed, ref, onMounted } from 'vue'
import TrendValue from './TrendValue.vue'

type FormatType = 'number' | 'currency' | 'percent' | 'raw'

interface Props {
  /** 指標標籤 */
  label: string
  /** 主要數值 */
  value: number | string
  /** 前綴符號（如 NT$、$、¥） */
  prefix?: string
  /** 後綴符號（如 次、人、%） */
  suffix?: string
  /** 趨勢百分比（正=增長，負=下降） */
  trend?: number
  /** 趨勢對比說明 */
  trendLabel?: string
  /** 圖示 */
  icon?: string
  /** 數字格式化類型 */
  format?: FormatType
  /** 小數位數 */
  decimals?: number
  /** 是否啟用數字滾動動畫 */
  animated?: boolean
  /** 卡片顏色主題 */
  variant?: 'default' | 'primary' | 'accent'
  /** 副說明文字 */
  subtext?: string
}

const props = withDefaults(defineProps<Props>(), {
  format:    'number',
  decimals:  0,
  animated:  true,
  variant:   'default',
  trendLabel: 'vs 上月',
})

// ── 數字格式化 ──
function formatValue(val: number | string): string {
  if (typeof val === 'string') return val
  if (props.format === 'raw') return String(val)

  const num = Number(val)
  if (isNaN(num)) return String(val)

  if (props.format === 'percent') {
    return `${num.toFixed(props.decimals)}%`
  }
  if (props.format === 'currency' || props.format === 'number') {
    // 縮寫大數：1K, 1M, 1B
    if (Math.abs(num) >= 1_000_000_000) {
      return `${(num / 1_000_000_000).toFixed(1)}B`
    }
    if (Math.abs(num) >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(1)}M`
    }
    if (Math.abs(num) >= 10_000) {
      return num.toLocaleString('zh-TW', { maximumFractionDigits: props.decimals })
    }
    return num.toLocaleString('zh-TW', {
      minimumFractionDigits: props.decimals,
      maximumFractionDigits: props.decimals,
    })
  }
  return num.toLocaleString()
}

// ── 滾動動畫 ──
const displayValue = ref<number | string>(props.animated && typeof props.value === 'number' ? 0 : props.value)
const isAnimating  = ref(false)

onMounted(() => {
  if (!props.animated || typeof props.value !== 'number') return
  isAnimating.value = true
  const target   = props.value
  const duration = 800
  const start    = performance.now()

  function step(now: number) {
    const elapsed  = now - start
    const progress = Math.min(elapsed / duration, 1)
    // easeOutExpo
    const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
    displayValue.value = Math.round(target * eased)
    if (progress < 1) {
      requestAnimationFrame(step)
    } else {
      displayValue.value = target
      isAnimating.value  = false
    }
  }
  requestAnimationFrame(step)
})

const formattedValue = computed(() => formatValue(displayValue.value))

// ── 樣式 ──
const variantStyle = computed(() => ({
  default: {},
  primary: {
    borderColor: 'var(--color-border-glow)',
    boxShadow:   'var(--shadow-card), 0 0 16px var(--color-primary-glow)',
  },
  accent: {
    borderColor: 'var(--color-border-accent)',
    boxShadow:   'var(--shadow-card), 0 0 16px var(--color-accent-glow)',
  },
}[props.variant]))

const valueColor = computed(() => ({
  default: 'var(--color-text-primary)',
  primary: 'var(--color-primary)',
  accent:  'var(--color-accent)',
}[props.variant]))
</script>

<template>
  <div
    class="ds-card animate-fade-slide-in"
    :style="variantStyle"
    style="min-height: 120px;"
  >
    <!-- Header: label + icon -->
    <div class="flex items-start justify-between mb-3">
      <span class="ds-label">{{ label }}</span>
      <span v-if="icon" class="ds-metric-icon text-lg" :class="variant === 'accent' ? 'ds-metric-icon-accent' : ''">{{ icon }}</span>
    </div>

    <!-- Main value -->
    <div class="flex items-end gap-2 mb-1.5">
      <div
        class="ds-stat-number"
        :style="{ color: valueColor }"
      >
        <span v-if="prefix" class="text-[1.25rem] opacity-70 mr-0.5">{{ prefix }}</span>
        {{ formattedValue }}
        <span v-if="suffix" class="text-[1.25rem] opacity-70 ml-0.5">{{ suffix }}</span>
      </div>
    </div>

    <!-- Trend + subtext -->
    <div class="flex items-center justify-between">
      <TrendValue
        v-if="trend !== undefined"
        :value="trend"
        :label="trendLabel"
        show-label
        size="sm"
      />
      <span v-if="subtext" class="text-xs text-[var(--color-text-muted)]">
        {{ subtext }}
      </span>
    </div>
  </div>
</template>
