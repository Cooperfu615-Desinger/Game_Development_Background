<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { useGameManagement } from '@/composables/useGameManagement'
import type { Game } from '@/types/game'
import GameFilterBar from './components/GameFilterBar.vue'
import GameTable from './components/GameTable.vue'
import GameDetailDrawer from './components/GameDetailDrawer.vue'
import GameEditModal from './components/GameEditModal.vue'

const toast = useToast()

const {
    games,
    total,
    loading,
    filters,
    selectedIds,
    toggleStatus,
    batchToggle,
    updateGame,
    exportCSV,
    resetFilters,
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
    if (ok) toast.add({ severity: 'success', summary: '已儲存', life: 1500 })
    else toast.add({ severity: 'error', summary: '儲存失敗', life: 2500 })
}
</script>

<template>
    <div class="hig-page">
        <!-- Header -->
        <header class="hig-page-header">
            <h1 class="hig-page-title">
                <i class="pi pi-th-large" />
                遊戲管理
            </h1>
            <div class="flex items-center gap-2 flex-wrap">
                <Button
                    v-if="selectedIds.length"
                    :label="`批量上架 (${selectedIds.length})`"
                    severity="secondary"
                    outlined
                    size="small"
                    @click="batchToggle('active')"
                />
                <Button
                    v-if="selectedIds.length"
                    :label="`批量下架 (${selectedIds.length})`"
                    severity="secondary"
                    outlined
                    size="small"
                    @click="batchToggle('inactive')"
                />
                <Button
                    label="匯出 CSV"
                    icon="pi pi-download"
                    severity="secondary"
                    outlined
                    @click="exportCSV"
                />
            </div>
        </header>

        <!-- Filter Bar -->
        <GameFilterBar
            :filters="filters"
            :loading="loading"
            @update:filters="filters = $event"
            @reset="resetFilters"
        />

        <!-- Table -->
        <section class="hig-card">
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
        </section>

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

        <Toast position="top-right" />
    </div>
</template>
