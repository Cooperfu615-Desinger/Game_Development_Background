<script setup lang="ts">
import { NCard, NSkeleton, NTag } from 'naive-ui'

const props = defineProps<{
    label: string
    value: string
    trend?: number
    loading: boolean
    icon: string
}>()

const trendType = (v: number) => v >= 0 ? 'success' : 'error'
const trendText = (v: number) => `${v >= 0 ? '↑' : '↓'} ${Math.abs(v).toFixed(1)}%`
</script>

<template>
    <n-card class="h-[140px]">
        <div class="flex items-start justify-between h-full">
            <div class="flex flex-col justify-between h-full">
                <div class="text-sm opacity-50">{{ label }}</div>
                <div>
                    <n-skeleton v-if="loading" text :width="120" />
                    <div v-else class="text-2xl font-bold">{{ value }}</div>
                    <n-tag
                        v-if="!loading && trend !== undefined"
                        :type="trendType(trend)"
                        size="small"
                        class="mt-1"
                        :bordered="false"
                    >
                        {{ trendText(trend) }}
                    </n-tag>
                </div>
            </div>
            <div class="text-3xl opacity-20">{{ icon }}</div>
        </div>
    </n-card>
</template>
