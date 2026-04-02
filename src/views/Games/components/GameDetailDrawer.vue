<script setup lang="ts">
import { NDrawer, NDrawerContent, NDescriptions, NDescriptionsItem, NTag, NButton } from 'naive-ui'
import type { Game } from '@/types/game'

const props = defineProps<{
    show: boolean
    game: Game | null
}>()

const emit = defineEmits<{
    (e: 'update:show', v: boolean): void
    (e: 'edit', game: Game): void
}>()

const statusType = (s: Game['status']) => s === 'active' ? 'success' : 'default'
const statusLabel = (s: Game['status']) => s === 'active' ? '上架中' : '已下架'

const categoryLabel: Record<Game['category'], string> = {
    slot: '老虎機', table: '桌遊', live: '真人', fishing: '捕魚'
}

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('zh-TW')
</script>

<template>
    <n-drawer
        :show="show"
        :width="400"
        placement="right"
        @update:show="emit('update:show', $event)"
    >
        <n-drawer-content :title="game?.name ?? '遊戲詳情'" closable>
            <template v-if="game">
                <n-descriptions :column="1" label-placement="left" bordered>
                    <n-descriptions-item label="遊戲 ID">
                        {{ game.id }}
                    </n-descriptions-item>
                    <n-descriptions-item label="狀態">
                        <n-tag :type="statusType(game.status)" size="small">
                            {{ statusLabel(game.status) }}
                        </n-tag>
                    </n-descriptions-item>
                    <n-descriptions-item label="類別">
                        {{ categoryLabel[game.category] }}
                    </n-descriptions-item>
                    <n-descriptions-item label="RTP">
                        {{ game.rtp.toFixed(1) }}%
                    </n-descriptions-item>
                    <n-descriptions-item label="版本">
                        {{ game.version }}
                    </n-descriptions-item>
                    <n-descriptions-item label="活躍玩家">
                        {{ game.activeUsers.toLocaleString() }}
                    </n-descriptions-item>
                    <n-descriptions-item label="上架時間">
                        {{ formatDate(game.publishedAt) }}
                    </n-descriptions-item>
                    <n-descriptions-item v-if="game.description" label="描述">
                        {{ game.description }}
                    </n-descriptions-item>
                </n-descriptions>
            </template>

            <template #footer>
                <div class="flex justify-end gap-2">
                    <n-button @click="emit('update:show', false)">關閉</n-button>
                    <n-button
                        type="primary"
                        @click="game && emit('edit', game)"
                    >
                        編輯
                    </n-button>
                </div>
            </template>
        </n-drawer-content>
    </n-drawer>
</template>
