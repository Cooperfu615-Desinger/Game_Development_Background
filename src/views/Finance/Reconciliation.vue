<script setup lang="ts">
import { NCard, NTag, NIcon, NAlert } from 'naive-ui'
import { CompareArrowsOutlined } from '@vicons/material'
</script>

<template>
    <div class="flex flex-col gap-6">
        <div class="flex items-center gap-2">
            <n-icon size="24"><CompareArrowsOutlined /></n-icon>
            <h1 class="text-2xl font-bold">對帳確認</h1>
        </div>

        <n-alert type="info" :show-icon="true">
            對帳流程：聚合商推送結算單 → 系統自動比對內部注單資料 → 人工確認差異 → 核准結算
        </n-alert>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <n-card class="h-[100px]">
                <div class="flex flex-col gap-1">
                    <p class="text-xs text-gray-500">待確認筆數</p>
                    <p class="text-2xl font-bold text-gray-300">—</p>
                </div>
            </n-card>
            <n-card class="h-[100px]">
                <div class="flex flex-col gap-1">
                    <p class="text-xs text-gray-500">本月差異金額</p>
                    <p class="text-2xl font-bold text-gray-300">—</p>
                </div>
            </n-card>
            <n-card class="h-[100px]">
                <div class="flex flex-col gap-1">
                    <p class="text-xs text-gray-500">已確認筆數</p>
                    <p class="text-2xl font-bold text-gray-300">—</p>
                </div>
            </n-card>
        </div>

        <n-card title="對帳列表（聚合商推送單 vs 內部資料）">
            <div class="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
                <n-icon size="48" color="#d1d5db"><CompareArrowsOutlined /></n-icon>
                <p class="text-sm">並排顯示聚合商數字與內部計算數字，標記差異並提供確認/異議操作</p>
                <n-tag type="warning" size="small">開發中</n-tag>
            </div>
        </n-card>
    </div>
</template>
