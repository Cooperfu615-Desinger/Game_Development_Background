<!-- src/views/Platforms/components/PlatformCard.vue -->
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { NCard, NTag, NIcon } from 'naive-ui'
import { ChevronRightOutlined } from '@vicons/material'
import type { Platform } from '@/types/platform'

const props = defineProps<{ platform: Platform }>()
const router = useRouter()

const goto = () => router.push(`/platforms/${props.platform.id}`)

const fmt = (n: number) =>
    n >= 10000
        ? `$${(n / 1000).toFixed(1)}K`
        : `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`

const fmtCount = (n: number) => n.toLocaleString('en-US')
</script>

<template>
    <n-card
        class="cursor-pointer hover:border-blue-500 transition-colors"
        @click="goto"
    >
        <div class="flex items-center justify-between gap-4">
            <!-- 左側：平台名稱 + Tags -->
            <div class="flex flex-col gap-2 min-w-[160px]">
                <span class="text-base font-bold">{{ platform.name }}</span>
                <div class="flex items-center gap-2 flex-wrap">
                    <n-tag
                        :type="platform.status === 'active' ? 'success' : 'default'"
                        size="small"
                        round
                    >
                        {{ platform.status === 'active' ? '● 對接中' : '● 未對接' }}
                    </n-tag>
                    <n-tag
                        :type="platform.hasAgentSystem ? 'info' : 'default'"
                        size="small"
                    >
                        {{ platform.hasAgentSystem ? '有代理系統' : '無代理系統' }}
                    </n-tag>
                </div>
            </div>

            <!-- 中間：6 個數字 -->
            <div class="flex-1 grid grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-2">
                <div class="flex flex-col">
                    <span class="text-xs text-gray-500">玩家總數</span>
                    <span class="text-sm font-semibold">{{ fmtCount(platform.playerCount) }}</span>
                </div>
                <div class="flex flex-col">
                    <span class="text-xs text-gray-500">活躍玩家</span>
                    <span class="text-sm font-semibold">{{ fmtCount(platform.activePlayers) }}</span>
                </div>
                <div class="flex flex-col">
                    <span class="text-xs text-gray-500">流水</span>
                    <span class="text-sm font-semibold">{{ fmt(platform.turnover) }}</span>
                </div>
                <div class="flex flex-col">
                    <span class="text-xs text-gray-500">GGR</span>
                    <span class="text-sm font-semibold text-green-400">{{ fmt(platform.ggr) }}</span>
                </div>
                <div class="flex flex-col">
                    <span class="text-xs text-gray-500">JP 次數</span>
                    <span class="text-sm font-semibold">{{ platform.jpCount }} 次</span>
                </div>
                <div class="flex flex-col">
                    <span class="text-xs text-gray-500">JP 總金額</span>
                    <span class="text-sm font-semibold text-yellow-400">{{ fmt(platform.jpTotal) }}</span>
                </div>
            </div>

            <!-- 右箭頭 -->
            <n-icon size="20" class="text-gray-400 flex-shrink-0">
                <ChevronRightOutlined />
            </n-icon>
        </div>
    </n-card>
</template>
