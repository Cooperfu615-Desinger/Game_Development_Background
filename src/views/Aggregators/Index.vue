<script setup lang="ts">
import { NCard, NTag, NButton, NIcon } from 'naive-ui'
import { HubOutlined, AddOutlined } from '@vicons/material'
</script>

<template>
    <div class="flex flex-col gap-6">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
                <n-icon size="24"><HubOutlined /></n-icon>
                <h1 class="text-2xl font-bold">聚合商管理</h1>
            </div>
            <n-button type="primary" disabled>
                <template #icon><n-icon><AddOutlined /></n-icon></template>
                新增聚合商
            </n-button>
        </div>

        <n-card>
            <div class="flex flex-col items-center justify-center py-16 gap-4 text-gray-400">
                <n-icon size="64" color="#d1d5db"><HubOutlined /></n-icon>
                <p class="text-lg font-medium">聚合商管理</p>
                <p class="text-sm">管理所有聚合商連線、遊戲配置與 Bet Range 設定</p>
                <n-tag type="warning" size="small">開發中</n-tag>
            </div>
        </n-card>
    </div>
</template>
