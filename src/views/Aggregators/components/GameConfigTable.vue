<script setup lang="ts">
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import ToggleSwitch from 'primevue/toggleswitch'
import Button from 'primevue/button'
import type { AggregatorGameConfig } from '@/types/aggregator'

defineProps<{
    configs: AggregatorGameConfig[]
    loading: boolean
    updatingGame: string | null
}>()

const emit = defineEmits<{
    (e: 'toggle-enabled', gameId: string, enabled: boolean): void
    (e: 'edit', config: AggregatorGameConfig): void
}>()

const categoryLabel = (cat: AggregatorGameConfig['category']) =>
    cat === 'slot' ? '老虎機' : cat === 'crash' ? 'Crash' : '棋牌'

type Severity = 'info' | 'warn' | 'secondary'
const categorySeverity = (cat: AggregatorGameConfig['category']): Severity =>
    cat === 'slot' ? 'info' : cat === 'crash' ? 'warn' : 'secondary'
</script>

<template>
    <DataTable
        :value="configs"
        :loading="loading"
        data-key="gameId"
        :pt="{ root: { class: 'border-0' } }"
    >
        <Column header="遊戲" style="min-width: 12rem">
            <template #body="{ data }">
                <div>
                    <p class="font-medium text-sm">{{ data.gameName }}</p>
                    <p class="text-xs text-secondary">{{ data.gameId }}</p>
                </div>
            </template>
        </Column>

        <Column header="類型" style="width: 90px">
            <template #body="{ data }">
                <Tag
                    :severity="categorySeverity(data.category)"
                    :value="categoryLabel(data.category)"
                />
            </template>
        </Column>

        <Column header="開放" style="width: 80px">
            <template #body="{ data }">
                <ToggleSwitch
                    :model-value="data.enabled"
                    :disabled="updatingGame === data.gameId"
                    @update:model-value="(v) => emit('toggle-enabled', data.gameId, v)"
                />
            </template>
        </Column>

        <Column header="已配置幣別" style="min-width: 11rem">
            <template #body="{ data }">
                <div v-if="!data.enabled || data.betRanges.length === 0">
                    <span class="text-sm text-tertiary">— 尚未配置</span>
                </div>
                <div v-else class="flex flex-wrap gap-1">
                    <Tag
                        v-for="r in data.betRanges"
                        :key="r.currency"
                        :value="r.currency"
                        severity="secondary"
                    />
                </div>
            </template>
        </Column>

        <Column header="USDT 投注範圍" style="width: 170px">
            <template #body="{ data }">
                <template v-if="data.betRanges.find((r: { currency: string }) => r.currency === 'USDT')">
                    <span class="text-sm font-mono">
                        ${{ data.betRanges.find((r: { currency: string }) => r.currency === 'USDT').minBet }}
                        ~ ${{ data.betRanges.find((r: { currency: string }) => r.currency === 'USDT').maxBet }}
                    </span>
                </template>
                <span v-else class="text-sm text-tertiary">—</span>
            </template>
        </Column>

        <Column header="操作" style="width: 80px">
            <template #body="{ data }">
                <Button
                    label="編輯"
                    text
                    size="small"
                    @click="emit('edit', data)"
                />
            </template>
        </Column>
    </DataTable>
</template>

<style scoped>
.text-secondary {
    color: var(--hig-text-secondary);
}
.text-tertiary {
    color: var(--hig-text-tertiary);
}
</style>
