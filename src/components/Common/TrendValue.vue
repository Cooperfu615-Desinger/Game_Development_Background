<script setup lang="ts">
import { computed } from 'vue'
import { NText } from 'naive-ui'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
    value: number
}

const props = defineProps<Props>()

const isPositive = computed(() => props.value > 0)
const isNegative = computed(() => props.value < 0)

const color = computed(() => {
    if (isPositive.value) return 'success'
    if (isNegative.value) return 'error'
    return 'default'
})

const arrow = computed(() => {
    if (isPositive.value) return '↑'
    if (isNegative.value) return '↓'
    return ''
})

const formattedValue = computed(() => {
    const sign = props.value > 0 ? '+' : ''
    return `${sign}${props.value.toFixed(2)}%`
})
</script>

<template>
    <div class="flex items-center gap-1 text-xs opacity-80">
        <span class="text-gray-400">{{ t('merchantDashboard.compareYesterdayPeriod') }}</span>
        <n-text :type="color" class="font-medium">
            {{ arrow }} {{ formattedValue }}
        </n-text>
    </div>
</template>
