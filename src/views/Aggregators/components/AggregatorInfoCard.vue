<script setup lang="ts">
import { NCard, NTag, NDescriptions, NDescriptionsItem, NSkeleton } from 'naive-ui'
import type { Aggregator } from '@/types/aggregator'

defineProps<{ aggregator: Aggregator | null; loading: boolean }>()

const connectionTag = (s: Aggregator['connectionStatus']) => {
    if (s === 'connected')    return { type: 'success' as const, label: '已連線' }
    if (s === 'disconnected') return { type: 'error'   as const, label: '離線'   }
    return                           { type: 'warning' as const, label: '待確認' }
}

const maskKey = (key: string) =>
    key.length > 16 ? key.slice(0, 10) + '••••••••••••' + key.slice(-4) : '••••••••'
</script>

<template>
    <n-card title="基本資訊 & API 設定">
        <n-skeleton v-if="loading" text :repeat="6" />
        <n-descriptions v-else-if="aggregator" :column="2" bordered label-placement="left">
            <n-descriptions-item label="聚合商名稱">
                {{ aggregator.name }}
            </n-descriptions-item>
            <n-descriptions-item label="唯一代碼">
                <span class="font-mono text-sm">{{ aggregator.code }}</span>
            </n-descriptions-item>
            <n-descriptions-item label="啟用狀態">
                <n-tag :type="aggregator.status === 'active' ? 'success' : 'default'" size="small">
                    {{ aggregator.status === 'active' ? '啟用中' : '已停用' }}
                </n-tag>
            </n-descriptions-item>
            <n-descriptions-item label="串接狀態">
                <n-tag :type="connectionTag(aggregator.connectionStatus).type" size="small" round>
                    {{ connectionTag(aggregator.connectionStatus).label }}
                </n-tag>
            </n-descriptions-item>
            <n-descriptions-item label="API Endpoint" :span="2">
                <span class="font-mono text-sm break-all">{{ aggregator.apiEndpoint }}</span>
            </n-descriptions-item>
            <n-descriptions-item label="API Key" :span="2">
                <span class="font-mono text-sm text-gray-400">{{ maskKey(aggregator.apiKey) }}</span>
            </n-descriptions-item>
            <n-descriptions-item label="已開放遊戲">
                {{ aggregator.gameCount }} / {{ aggregator.totalGames }} 款
            </n-descriptions-item>
            <n-descriptions-item label="建立時間">
                {{ aggregator.createdAt.slice(0, 10) }}
            </n-descriptions-item>
            <n-descriptions-item v-if="aggregator.description" label="備註" :span="2">
                {{ aggregator.description }}
            </n-descriptions-item>
        </n-descriptions>
    </n-card>
</template>
