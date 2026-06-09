<script setup lang="ts">
import Drawer from 'primevue/drawer'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import type { Game } from '@/types/game'

const props = defineProps<{
    show: boolean
    game: Game | null
}>()

const emit = defineEmits<{
    (e: 'update:show', v: boolean): void
    (e: 'edit', game: Game): void
}>()

const categoryLabel: Record<Game['category'], string> = {
    slot: '老虎機',
    table: '桌遊',
    live: '真人',
    fishing: '捕魚',
}

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('zh-TW')

const onEdit = () => {
    if (props.game) emit('edit', props.game)
}
</script>

<template>
    <Drawer
        :visible="show"
        position="right"
        :style="{ width: '24rem' }"
        :header="game?.name ?? '遊戲詳情'"
        @update:visible="(v) => emit('update:show', v)"
    >
        <div v-if="game" class="flex flex-col">
            <div class="info-row">
                <span class="info-label">遊戲 ID</span>
                <span class="info-value mono">{{ game.id }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">狀態</span>
                <Tag
                    :severity="game.status === 'active' ? 'success' : 'secondary'"
                    :value="game.status === 'active' ? '上架中' : '已下架'"
                />
            </div>
            <div class="info-row">
                <span class="info-label">類別</span>
                <span class="info-value">{{ categoryLabel[game.category] }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">RTP</span>
                <span class="info-value">{{ game.rtp.toFixed(1) }}%</span>
            </div>
            <div class="info-row">
                <span class="info-label">版本</span>
                <span class="info-value mono">{{ game.version }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">活躍玩家</span>
                <span class="info-value">{{ game.activeUsers.toLocaleString() }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">上架時間</span>
                <span class="info-value">{{ formatDate(game.publishedAt) }}</span>
            </div>
            <div v-if="game.description" class="info-row info-row-stacked">
                <span class="info-label">描述</span>
                <span class="info-value description">{{ game.description }}</span>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-2">
                <Button label="關閉" severity="secondary" outlined @click="emit('update:show', false)" />
                <Button label="編輯" :disabled="!game" @click="onEdit" />
            </div>
        </template>
    </Drawer>
</template>

<style scoped>
.info-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.625rem 0;
    border-bottom: 1px solid var(--hig-border-subtle);
    gap: 1rem;
}
.info-row:last-child {
    border-bottom: none;
}
.info-row-stacked {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.375rem;
}

.info-label {
    font-size: 0.8125rem;
    color: var(--hig-text-secondary);
    font-weight: 500;
}
.info-value {
    font-size: 0.875rem;
    color: var(--hig-text-primary);
}
.info-value.mono {
    font-family: var(--hig-font-mono);
    font-size: 0.8125rem;
}
.info-value.description {
    line-height: 1.5;
}
</style>
