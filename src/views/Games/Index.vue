<script setup lang="ts">
import { ref } from 'vue'
import { NButton, NSpace, NIcon, useMessage } from 'naive-ui'
import { FileDownloadOutlined, SportsEsportsOutlined } from '@vicons/material'
import { useGameManagement } from '@/composables/useGameManagement'
import type { Game } from '@/types/game'
import GameFilterBar from './components/GameFilterBar.vue'
import GameTable from './components/GameTable.vue'
import GameDetailDrawer from './components/GameDetailDrawer.vue'
import GameEditModal from './components/GameEditModal.vue'

const message = useMessage()

const {
    games, total, loading, filters, selectedIds,
    toggleStatus, batchToggle, updateGame, exportCSV, resetFilters
} = useGameManagement()

// Drawer & Modal state
const showDrawer = ref(false)
const showModal = ref(false)
const activeGame = ref<Game | null>(null)

const handleView = (game: Game) => {
    activeGame.value = game
    showDrawer.value = true
}

const handleEdit = (game: Game) => {
    activeGame.value = game
    showModal.value = true
    showDrawer.value = false
}

const handleSave = async (id: string, patch: Partial<Game>) => {
    const ok = await updateGame(id, patch)
    if (ok) message.success('已儲存')
    else message.error('儲存失敗')
}
</script>

<template>
    <div class="flex flex-col gap-4">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
                <n-icon size="24"><SportsEsportsOutlined /></n-icon>
                <h1 class="text-2xl font-bold">遊戲管理</h1>
            </div>
            <n-space>
                <n-button
                    v-if="selectedIds.length"
                    @click="batchToggle('active')"
                >
                    批量上架 ({{ selectedIds.length }})
                </n-button>
                <n-button
                    v-if="selectedIds.length"
                    @click="batchToggle('inactive')"
                >
                    批量下架 ({{ selectedIds.length }})
                </n-button>
                <n-button @click="exportCSV">
                    <template #icon>
                        <n-icon><FileDownloadOutlined /></n-icon>
                    </template>
                    匯出 CSV
                </n-button>
            </n-space>
        </div>

        <!-- Filter Bar -->
        <GameFilterBar
            :filters="filters"
            :loading="loading"
            @update:filters="filters = $event"
            @reset="resetFilters"
        />

        <!-- Table -->
        <GameTable
            :games="games"
            :total="total"
            :loading="loading"
            :filters="filters"
            @update:filters="filters = $event"
            @view="handleView"
            @edit="handleEdit"
            @toggle-status="toggleStatus"
            @update:selected="selectedIds = $event"
        />

        <!-- Detail Drawer -->
        <GameDetailDrawer
            v-model:show="showDrawer"
            :game="activeGame"
            @edit="handleEdit"
        />

        <!-- Edit Modal -->
        <GameEditModal
            v-model:show="showModal"
            :game="activeGame"
            @save="handleSave"
        />
    </div>
</template>
