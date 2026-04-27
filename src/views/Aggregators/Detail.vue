<script setup lang="ts">
import { NCard, NTag, NIcon, NBreadcrumb, NBreadcrumbItem } from 'naive-ui'
import { HubOutlined } from '@vicons/material'
import { useRoute } from 'vue-router'

const route = useRoute()
const aggregatorId = route.params.id as string
</script>

<template>
    <div class="flex flex-col gap-6">
        <n-breadcrumb>
            <n-breadcrumb-item href="/aggregators">聚合商管理</n-breadcrumb-item>
            <n-breadcrumb-item>{{ aggregatorId }}</n-breadcrumb-item>
        </n-breadcrumb>

        <div class="flex items-center gap-2">
            <n-icon size="24"><HubOutlined /></n-icon>
            <h1 class="text-2xl font-bold">聚合商詳情</h1>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <n-card title="基本資訊 & API 設定">
                <div class="flex flex-col items-center justify-center py-10 gap-3 text-gray-400">
                    <p class="text-sm">API 端點、金鑰、串接狀態設定</p>
                    <n-tag type="warning" size="small">開發中</n-tag>
                </div>
            </n-card>
            <n-card title="遊戲配置 & Bet Range">
                <div class="flex flex-col items-center justify-center py-10 gap-3 text-gray-400">
                    <p class="text-sm">各遊戲開放狀態與投注範圍設定</p>
                    <n-tag type="warning" size="small">開發中</n-tag>
                </div>
            </n-card>
        </div>
    </div>
</template>
