<script setup lang="ts">
import { computed } from 'vue'

interface Props {
    value: number
    currency?: string
    showSign?: boolean
    compact?: boolean
    color?: string  // Custom color class
}

const props = withDefaults(defineProps<Props>(), {
    currency: 'USD',
    showSign: false,
    compact: false,
    color: ''  // Empty string means use default color logic
})

// Format number with thousand separators
const formattedValue = computed(() => {
    const absValue = Math.abs(props.value)
    
    // Compact format for large numbers
    if (props.compact && absValue >= 1000000) {
        return (absValue / 1000000).toFixed(2) + 'M'
    } else if (props.compact && absValue >= 1000) {
        return (absValue / 1000).toFixed(1) + 'K'
    }
    
    // Standard format with thousand separators
    return absValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })
})

// Currency symbol mapping
const currencySymbol = computed(() => {
    const symbols: Record<string, string> = {
        USD: '$',
        TWD: 'NT$',
        CNY: '¥',
        THB: '฿',
        VND: '₫',
        USDT: 'USDT '
    }
    return symbols[props.currency] || props.currency + ' '
})

// Color class based on value (positive = green, negative = red)
const colorClass = computed(() => {
    // If custom color is provided, use it
    if (props.color) return props.color
    
    // Otherwise use default logic
    if (props.value > 0) return 'text-green-500'
    if (props.value < 0) return 'text-red-500'
    return 'text-gray-400'
})

// Sign prefix
const signPrefix = computed(() => {
    if (!props.showSign) return ''
    if (props.value > 0) return '+'
    if (props.value < 0) return '-'
    return ''
})
</script>

<template>
    <span :class="['font-mono tabular-nums', colorClass]">
        {{ signPrefix }}{{ currencySymbol }}{{ formattedValue }}
    </span>
</template>
