<script setup lang="ts">
import { NIcon, NSelect, NSkeleton, NCard } from 'naive-ui'
import { GroupsOutlined } from '@vicons/material'
import { usePlatforms } from '@/composables/usePlatforms'
import PlatformCard from './components/PlatformCard.vue'

const { platforms, loading, selectedAggregatorId, period } = usePlatforms()

const aggregatorOptions = [
    { label: '自家聚合商', value: 'agg-001' },
    { label: '測試環境',   value: 'agg-002' },
]

const periodOptions = [
    { label: '本週', value: 'week' },
    { label: '本月', value: 'month' },
]
</script>

<template>
    <div class="flex flex-col gap-6">
        <!-- Header -->
        <div class="flex items-center justify-between flex-wrap gap-3">
            <div class="flex items-center gap-2">
                <n-icon size="24"><GroupsOutlined /></n-icon>
                <h1 class="text-2xl font-bold">平台分析</h1>
            </div>
            <div class="flex items-center gap-3">
                <n-select
                    v-model:value="selectedAggregatorId"
                    :options="aggregatorOptions"
                    class="w-44"
                />
                <div class="flex rounded overflow-hidden border border-gray-600">
                    <button
                        v-for="opt in periodOptions"
                        :key="opt.value"
                        class="px-3 py-1 text-sm transition-colors"
                        :class="period === opt.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-transparent text-gray-400 hover:text-white'"
                        @click="period = opt.value as 'week' | 'month'"
                    >
                        {{ opt.label }}
                    </button>
                </div>
            </div>
        </div>

        <!-- 平台卡片列表 -->
        <div v-if="loading" class="flex flex-col gap-4">
            <n-card v-for="i in 3" :key="i" class="h-[96px]">
                <n-skeleton text :repeat="2" />
            </n-card>
        </div>

        <div v-else class="flex flex-col gap-4">
            <PlatformCard
                v-for="p in platforms"
                :key="p.id"
                :platform="p"
            />
            <div v-if="platforms.length === 0" class="text-center py-12 text-gray-400">
                此聚合商目前沒有對接平台
            </div>
        </div>
    </div>
</template>
