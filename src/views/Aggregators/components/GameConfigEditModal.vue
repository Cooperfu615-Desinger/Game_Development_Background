<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Dialog from 'primevue/dialog'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Select from 'primevue/select'
import InputNumber from 'primevue/inputnumber'
import ToggleSwitch from 'primevue/toggleswitch'
import Button from 'primevue/button'
import Divider from 'primevue/divider'
import { useToast } from 'primevue/usetoast'
import type { AggregatorGameConfig, BetRangeCurrency } from '@/types/aggregator'
import { MASTER_LIMITS, SUPPORTED_CURRENCIES } from '@/types/aggregator'

const props = defineProps<{
    show: boolean
    config: AggregatorGameConfig | null
    saving: boolean
}>()
const emit = defineEmits<{
    (e: 'update:show', v: boolean): void
    (e: 'save', gameId: string, patch: { enabled: boolean; betRanges: BetRangeCurrency[] }): void
}>()

const toast = useToast()

// ── 本地編輯狀態 ───────────────────────────────────────────
const localEnabled = ref(false)
const localRanges = ref<BetRangeCurrency[]>([])
const addCurrency = ref<string | null>(null)

watch(
    () => props.config,
    (c) => {
        if (!c) return
        localEnabled.value = c.enabled
        localRanges.value = c.betRanges.map((r) => ({ ...r }))
        addCurrency.value = null
    },
    { immediate: true }
)

// ── 可新增幣別 ─────────────────────────────────────────────
const availableCurrencies = computed(() =>
    SUPPORTED_CURRENCIES
        .filter((c) => !localRanges.value.some((r) => r.currency === c))
        .map((c) => ({ label: c, value: c }))
)

const handleAddCurrency = () => {
    if (!addCurrency.value) return
    const master = MASTER_LIMITS[addCurrency.value]
    localRanges.value.push({
        currency: addCurrency.value,
        minBet: master?.minBet ?? 1,
        maxBet: master?.maxBet ?? 100,
        maxWin: master?.maxWin ?? 10000,
    })
    addCurrency.value = null
}

const handleRemoveCurrency = (currency: string) => {
    localRanges.value = localRanges.value.filter((r) => r.currency !== currency)
}

const categoryLabel = (cat: AggregatorGameConfig['category']) =>
    cat === 'slot' ? '老虎機' : cat === 'crash' ? 'Crash' : '棋牌'

// ── 儲存 ───────────────────────────────────────────────────
const handleSave = () => {
    if (!props.config) return
    const invalid = localRanges.value.find((r) => r.minBet >= r.maxBet)
    if (invalid) {
        toast.add({
            severity: 'warn',
            summary: `${invalid.currency}：最小投注必須小於最大投注`,
            life: 2500,
        })
        return
    }
    emit('save', props.config.gameId, {
        enabled: localEnabled.value,
        betRanges: localRanges.value,
    })
}

const close = () => emit('update:show', false)
</script>

<template>
    <Dialog
        :visible="show"
        modal
        :style="{ width: '44rem' }"
        :draggable="false"
        :closable="false"
        :close-on-escape="false"
        @update:visible="(v) => !v && close()"
    >
        <template #header>
            <div v-if="config" class="flex items-center gap-2">
                <span class="font-semibold">{{ config.gameName }}</span>
                <Tag severity="secondary" :value="categoryLabel(config.category)" />
            </div>
        </template>

        <div v-if="config" class="flex flex-col gap-4">
            <!-- 開放開關 -->
            <div class="flex items-center gap-3">
                <span class="text-sm font-medium">對此聚合商開放</span>
                <ToggleSwitch v-model="localEnabled" />
            </div>

            <Divider class="my-0" />

            <!-- 幣別 Bet Range 表格 -->
            <div>
                <p class="text-sm font-medium mb-2">幣別投注範圍設定</p>
                <DataTable
                    :value="localRanges"
                    data-key="currency"
                    size="small"
                    :pt="{ root: { class: 'border-1 rounded' } }"
                >
                    <Column field="currency" header="幣別" style="width: 80px" />

                    <Column header="最小投注" style="width: 140px">
                        <template #body="{ data, index }">
                            <InputNumber
                                v-model="localRanges[index].minBet"
                                :min="MASTER_LIMITS[data.currency]?.minBet ?? 0"
                                :max="localRanges[index].maxBet"
                                :pt="{ root: { class: 'w-28' } }"
                                show-buttons
                                button-layout="horizontal"
                                size="small"
                            />
                        </template>
                    </Column>

                    <Column header="最大投注" style="width: 140px">
                        <template #body="{ data, index }">
                            <InputNumber
                                v-model="localRanges[index].maxBet"
                                :min="localRanges[index].minBet"
                                :max="MASTER_LIMITS[data.currency]?.maxBet ?? 999999"
                                :pt="{ root: { class: 'w-28' } }"
                                show-buttons
                                button-layout="horizontal"
                                size="small"
                            />
                        </template>
                    </Column>

                    <Column header="最大彩金" style="width: 160px">
                        <template #body="{ data, index }">
                            <InputNumber
                                v-model="localRanges[index].maxWin"
                                :min="localRanges[index].maxBet"
                                :max="MASTER_LIMITS[data.currency]?.maxWin ?? 9999999"
                                :pt="{ root: { class: 'w-32' } }"
                                show-buttons
                                button-layout="horizontal"
                                size="small"
                            />
                        </template>
                    </Column>

                    <Column header="上限參考" style="width: 150px">
                        <template #body="{ data }">
                            <span v-if="MASTER_LIMITS[data.currency]" class="text-xs text-tertiary">
                                ≤ {{ MASTER_LIMITS[data.currency].maxBet }}
                                / {{ MASTER_LIMITS[data.currency].maxWin }}
                            </span>
                            <span v-else class="text-tertiary">—</span>
                        </template>
                    </Column>

                    <Column style="width: 70px">
                        <template #body="{ data }">
                            <Button
                                label="移除"
                                severity="danger"
                                text
                                size="small"
                                @click="handleRemoveCurrency(data.currency)"
                            />
                        </template>
                    </Column>
                </DataTable>
            </div>

            <!-- 新增幣別 -->
            <div class="flex items-center gap-2">
                <Select
                    v-model="addCurrency"
                    :options="availableCurrencies"
                    option-label="label"
                    option-value="value"
                    placeholder="選擇幣別"
                    :disabled="availableCurrencies.length === 0"
                    class="w-36"
                />
                <Button
                    label="+ 新增幣別"
                    severity="secondary"
                    outlined
                    size="small"
                    :disabled="!addCurrency"
                    @click="handleAddCurrency"
                />
            </div>
        </div>

        <template #footer>
            <Button label="取消" severity="secondary" outlined @click="close" />
            <Button label="儲存配置" :loading="saving" @click="handleSave" />
        </template>
    </Dialog>
</template>

<style scoped>
.text-tertiary {
    color: var(--hig-text-tertiary);
}
</style>
