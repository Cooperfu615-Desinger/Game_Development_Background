<script setup lang="ts">
import { ref } from 'vue'
import Breadcrumb from 'primevue/breadcrumb'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { useRoute, useRouter } from 'vue-router'
import { useAggregatorDetail } from '@/composables/useAggregatorDetail'
import AggregatorInfoCard from './components/AggregatorInfoCard.vue'
import GameConfigTable from './components/GameConfigTable.vue'
import GameConfigEditModal from './components/GameConfigEditModal.vue'
import type { AggregatorGameConfig, BetRangeCurrency } from '@/types/aggregator'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const aggregatorId = route.params.id as string

const {
    aggregator,
    gameConfigs,
    loadingInfo,
    loadingGames,
    updatingGame,
    toggleGameEnabled,
    updateGameConfig,
} = useAggregatorDetail(aggregatorId)

const breadcrumbHome = { icon: 'pi pi-home', route: '/' }
const breadcrumbItems = [
    { label: '聚合商管理', route: '/aggregators' },
    { label: aggregator.value?.name ?? aggregatorId },
]

const onBreadcrumbItemClick = (item: { route?: string }) => {
    if (item.route) router.push(item.route)
}

// ── 編輯彈窗 ───────────────────────────────────────────
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
        toast.add({ severity: 'success', summary: '配置已儲存', life: 1500 })
        showEdit.value = false
    } else {
        toast.add({ severity: 'error', summary: '儲存失敗，請重試', life: 2500 })
    }
}
</script>

<template>
    <div class="hig-page">
        <!-- Breadcrumb -->
        <Breadcrumb
            :model="breadcrumbItems"
            :home="breadcrumbHome"
            :pt="{ root: { class: 'border-0 px-0 bg-transparent' } }"
        >
            <template #item="{ item }">
                <span
                    class="breadcrumb-link"
                    :class="{ 'cursor-pointer': item.route }"
                    @click="onBreadcrumbItemClick(item)"
                >
                    {{ item.label }}
                </span>
            </template>
        </Breadcrumb>

        <!-- Header -->
        <header class="hig-page-header">
            <h1 class="hig-page-title">
                <i class="pi pi-share-alt" />
                {{ aggregator?.name ?? '聚合商詳情' }}
            </h1>
        </header>

        <!-- 基本資訊 -->
        <AggregatorInfoCard :aggregator="aggregator" :loading="loadingInfo" />

        <!-- 遊戲配置表格 -->
        <section class="hig-card">
            <header class="hig-card-header">
                <h2 class="hig-card-title">遊戲配置 & Bet Range</h2>
                <span class="text-sm text-secondary">
                    已開放 {{ aggregator?.gameCount ?? 0 }} / {{ aggregator?.totalGames ?? 0 }} 款
                </span>
            </header>
            <GameConfigTable
                :configs="gameConfigs"
                :loading="loadingGames"
                :updating-game="updatingGame"
                @toggle-enabled="toggleGameEnabled"
                @edit="handleEdit"
            />
        </section>

        <!-- 編輯彈窗 -->
        <GameConfigEditModal
            v-model:show="showEdit"
            :config="editingConfig"
            :saving="saving"
            @save="handleSave"
        />

        <Toast position="top-right" />
    </div>
</template>

<style scoped>
.breadcrumb-link {
    color: var(--hig-text-secondary);
    transition: color var(--hig-duration-fast) var(--hig-ease);
}
.breadcrumb-link.cursor-pointer:hover {
    color: var(--hig-blue);
}
.text-secondary {
    color: var(--hig-text-secondary);
}
</style>
