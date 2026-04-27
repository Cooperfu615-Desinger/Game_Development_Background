<script setup lang="ts">
import { ref } from 'vue'
import { NCard, NIcon, NBreadcrumb, NBreadcrumbItem, useMessage } from 'naive-ui'
import { HubOutlined } from '@vicons/material'
import { useRoute } from 'vue-router'
import { useAggregatorDetail } from '@/composables/useAggregatorDetail'
import AggregatorInfoCard from './components/AggregatorInfoCard.vue'
import GameConfigTable from './components/GameConfigTable.vue'
import GameConfigEditModal from './components/GameConfigEditModal.vue'
import type { AggregatorGameConfig, BetRangeCurrency } from '@/types/aggregator'

const route = useRoute()
const message = useMessage()
const aggregatorId = route.params.id as string

const {
    aggregator, gameConfigs,
    loadingInfo, loadingGames, updatingGame,
    toggleGameEnabled, updateGameConfig,
} = useAggregatorDetail(aggregatorId)

// ── 編輯彈窗 ───────────────────────────────────────────────────────────────
const showEdit = ref(false)
const editingConfig = ref<AggregatorGameConfig | null>(null)
const saving = ref(false)

const handleEdit = (config: AggregatorGameConfig) => {
    editingConfig.value = config
    showEdit.value = true
}

const handleSave = async (
    gameId: string,
    patch: { enabled: boolean; betRanges: BetRangeCurrency[] }
) => {
    saving.value = true
    const ok = await updateGameConfig(gameId, patch)
    saving.value = false
    if (ok) {
        message.success('配置已儲存')
        showEdit.value = false
    } else {
        message.error('儲存失敗，請重試')
    }
}
</script>

<template>
    <div class="flex flex-col gap-6">
        <!-- Breadcrumb -->
        <n-breadcrumb>
            <n-breadcrumb-item href="/aggregators">聚合商管理</n-breadcrumb-item>
            <n-breadcrumb-item>{{ aggregator?.name ?? aggregatorId }}</n-breadcrumb-item>
        </n-breadcrumb>

        <!-- Header -->
        <div class="flex items-center gap-2">
            <n-icon size="24"><HubOutlined /></n-icon>
            <h1 class="text-2xl font-bold">{{ aggregator?.name ?? '聚合商詳情' }}</h1>
        </div>

        <!-- 基本資訊 -->
        <AggregatorInfoCard :aggregator="aggregator" :loading="loadingInfo" />

        <!-- 遊戲配置表格 -->
        <n-card title="遊戲配置 & Bet Range">
            <template #header-extra>
                <span class="text-sm text-gray-400">
                    已開放 {{ aggregator?.gameCount ?? 0 }} / {{ aggregator?.totalGames ?? 0 }} 款
                </span>
            </template>
            <GameConfigTable
                :configs="gameConfigs"
                :loading="loadingGames"
                :updating-game="updatingGame"
                @toggle-enabled="toggleGameEnabled"
                @edit="handleEdit"
            />
        </n-card>

        <!-- 編輯彈窗 -->
        <GameConfigEditModal
            v-model:show="showEdit"
            :config="editingConfig"
            :saving="saving"
            @save="handleSave"
        />
    </div>
</template>
