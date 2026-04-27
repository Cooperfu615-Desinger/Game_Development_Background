<!-- src/views/Platforms/components/PlatformStatCards.vue -->
<script setup lang="ts">
import { NCard, NStatistic, NSkeleton } from 'naive-ui'
import type { PlatformStats } from '@/types/platform'

defineProps<{
    stats: PlatformStats | null
    loading: boolean
}>()

const fmtMoney = (n: number) =>
    `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
</script>

<template>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- 第一列 -->
        <n-card class="h-[100px]">
            <n-skeleton v-if="loading" text :width="80" />
            <n-statistic v-else label="玩家總數" :value="stats?.playerCount ?? 0" />
        </n-card>
        <n-card class="h-[100px]">
            <n-skeleton v-if="loading" text :width="80" />
            <n-statistic v-else label="活躍玩家" :value="stats?.activePlayers ?? 0" />
        </n-card>
        <n-card class="h-[100px]">
            <n-skeleton v-if="loading" text :width="80" />
            <n-statistic
                v-else
                label="流水"
                :value="fmtMoney(stats?.turnover ?? 0)"
            />
        </n-card>
        <n-card class="h-[100px]">
            <n-skeleton v-if="loading" text :width="80" />
            <n-statistic
                v-else
                label="GGR"
                :value="fmtMoney(stats?.ggr ?? 0)"
            />
        </n-card>

        <!-- 第二列 -->
        <n-card class="h-[100px]">
            <n-skeleton v-if="loading" text :width="80" />
            <n-statistic
                v-else
                label="JP 次數"
                :value="stats?.jpCount ?? 0"
                suffix="次"
            />
        </n-card>
        <n-card class="h-[100px]">
            <n-skeleton v-if="loading" text :width="80" />
            <n-statistic
                v-else
                label="JP 總金額"
                :value="fmtMoney(stats?.jpTotal ?? 0)"
            />
        </n-card>
        <n-card class="h-[100px]">
            <n-skeleton v-if="loading" text :width="80" />
            <n-statistic
                v-else
                label="平均每玩家流水"
                :value="fmtMoney(stats?.avgTurnoverPerPlayer ?? 0)"
            />
        </n-card>
        <n-card class="h-[100px]">
            <n-skeleton v-if="loading" text :width="80" />
            <n-statistic
                v-else
                label="最大單筆 JP"
                :value="fmtMoney(stats?.maxJpAmount ?? 0)"
            />
        </n-card>
    </div>
</template>
