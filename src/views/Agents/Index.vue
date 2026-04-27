<script setup lang="ts">
import { NCard, NTag, NIcon, NSelect } from 'naive-ui'
import { GroupsOutlined } from '@vicons/material'

const aggregatorOptions = [
    { label: '全部聚合商', value: undefined },
    { label: '自家聚合商 (Self)', value: 'self' }
]
</script>

<template>
    <div class="flex flex-col gap-6">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
                <n-icon size="24"><GroupsOutlined /></n-icon>
                <h1 class="text-2xl font-bold">代理分析</h1>
            </div>
            <n-select
                :options="aggregatorOptions"
                :default-value="undefined"
                class="w-48"
                placeholder="篩選聚合商"
            />
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <n-card class="h-[100px]">
                <div class="flex flex-col gap-1">
                    <p class="text-xs text-gray-500">代理總數</p>
                    <p class="text-2xl font-bold text-gray-300">—</p>
                </div>
            </n-card>
            <n-card class="h-[100px]">
                <div class="flex flex-col gap-1">
                    <p class="text-xs text-gray-500">本月總流水</p>
                    <p class="text-2xl font-bold text-gray-300">—</p>
                </div>
            </n-card>
            <n-card class="h-[100px]">
                <div class="flex flex-col gap-1">
                    <p class="text-xs text-gray-500">活躍代理</p>
                    <p class="text-2xl font-bold text-gray-300">—</p>
                </div>
            </n-card>
            <n-card class="h-[100px]">
                <div class="flex flex-col gap-1">
                    <p class="text-xs text-gray-500">平均 ARPU</p>
                    <p class="text-2xl font-bold text-gray-300">—</p>
                </div>
            </n-card>
        </div>

        <n-card title="代理排行（按流水）">
            <div class="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
                <n-icon size="48" color="#d1d5db"><GroupsOutlined /></n-icon>
                <p class="text-sm">代理流水排行、玩家人數、ARPU 分析</p>
                <n-tag type="warning" size="small">開發中</n-tag>
            </div>
        </n-card>

        <n-card title="玩家列表">
            <div class="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
                <p class="text-sm">依代理篩選的玩家列表與投注記錄</p>
                <n-tag type="warning" size="small">開發中</n-tag>
            </div>
        </n-card>
    </div>
</template>
