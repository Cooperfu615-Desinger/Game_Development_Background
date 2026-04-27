<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
    NModal, NCard, NButton, NSpace, NSwitch, NDataTable,
    NSelect, NInputNumber, NTag, NDivider, useMessage
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
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

const message = useMessage()

// ── 本地編輯狀態 ───────────────────────────────────────────────────────────
const localEnabled = ref(false)
const localRanges = ref<BetRangeCurrency[]>([])
const addCurrency = ref<string | null>(null)

watch(() => props.config, (c) => {
    if (!c) return
    localEnabled.value = c.enabled
    localRanges.value = c.betRanges.map(r => ({ ...r }))
}, { immediate: true })

// ── 可新增幣別（排除已有的）─────────────────────────────────────────────────
const availableCurrencies = computed(() =>
    SUPPORTED_CURRENCIES
        .filter(c => !localRanges.value.some(r => r.currency === c))
        .map(c => ({ label: c, value: c }))
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
    localRanges.value = localRanges.value.filter(r => r.currency !== currency)
}

// ── 表格欄位 ───────────────────────────────────────────────────────────────
const rangeColumns = computed<DataTableColumns<BetRangeCurrency>>(() => [
    { title: '幣別', key: 'currency', width: 80,
      render: r => r.currency },
    { title: '最小投注', key: 'minBet', width: 140,
      render: r => {
          const master = MASTER_LIMITS[r.currency]
          return h(NInputNumber, {
              value: r.minBet,
              min: master?.minBet ?? 0,
              max: r.maxBet,
              size: 'small',
              style: 'width: 110px',
              onUpdateValue: (v: number | null) => { if (v !== null) r.minBet = v }
          })
      }
    },
    { title: '最大投注', key: 'maxBet', width: 140,
      render: r => {
          const master = MASTER_LIMITS[r.currency]
          return h(NInputNumber, {
              value: r.maxBet,
              min: r.minBet,
              max: master?.maxBet ?? 999999,
              size: 'small',
              style: 'width: 110px',
              onUpdateValue: (v: number | null) => { if (v !== null) r.maxBet = v }
          })
      }
    },
    { title: '最大彩金', key: 'maxWin', width: 160,
      render: r => {
          const master = MASTER_LIMITS[r.currency]
          return h(NInputNumber, {
              value: r.maxWin,
              min: r.maxBet,
              max: master?.maxWin ?? 9999999,
              size: 'small',
              style: 'width: 130px',
              onUpdateValue: (v: number | null) => { if (v !== null) r.maxWin = v }
          })
      }
    },
    { title: '上限參考', key: 'master', width: 160,
      render: r => {
          const m = MASTER_LIMITS[r.currency]
          if (!m) return '—'
          return h('span', { class: 'text-xs text-gray-400' },
              `≤ ${m.maxBet} / ${m.maxWin}`)
      }
    },
    { title: '', key: 'del', width: 60,
      render: r => h(NButton, {
          size: 'tiny', type: 'error', text: true,
          onClick: () => handleRemoveCurrency(r.currency)
      }, { default: () => '移除' })
    },
])

// ── 儲存 ───────────────────────────────────────────────────────────────────
const handleSave = () => {
    if (!props.config) return
    // 驗證每個幣別的 min < max
    const invalid = localRanges.value.find(r => r.minBet >= r.maxBet)
    if (invalid) {
        message.warning(`${invalid.currency}：最小投注必須小於最大投注`)
        return
    }
    emit('save', props.config.gameId, {
        enabled: localEnabled.value,
        betRanges: localRanges.value,
    })
}

// h 函式需要在 <script setup> 範圍內使用
import { h } from 'vue'
</script>

<template>
    <n-modal
        :show="show"
        :mask-closable="false"
        @update:show="$emit('update:show', $event)"
    >
        <n-card
            style="width: 700px"
            :bordered="false"
            role="dialog"
            aria-modal="true"
        >
            <template #header>
                <span v-if="config">
                    {{ config.gameName }}
                    <n-tag size="small" class="ml-2" :bordered="false">
                        {{ config.category === 'slot' ? '老虎機' : config.category === 'crash' ? 'Crash' : '棋牌' }}
                    </n-tag>
                </span>
            </template>

            <div v-if="config" class="flex flex-col gap-4">
                <!-- 開放開關 -->
                <div class="flex items-center gap-3">
                    <span class="text-sm font-medium">對此聚合商開放</span>
                    <n-switch v-model:value="localEnabled" />
                </div>

                <n-divider class="my-0" />

                <!-- 幣別 Bet Range 表格 -->
                <div>
                    <p class="text-sm font-medium mb-2">幣別投注範圍設定</p>
                    <n-data-table
                        :columns="rangeColumns"
                        :data="localRanges"
                        :row-key="(r: BetRangeCurrency) => r.currency"
                        size="small"
                        :pagination="false"
                    />
                </div>

                <!-- 新增幣別 -->
                <div class="flex items-center gap-2">
                    <n-select
                        v-model:value="addCurrency"
                        :options="availableCurrencies"
                        placeholder="選擇幣別"
                        class="w-36"
                        size="small"
                        :disabled="availableCurrencies.length === 0"
                    />
                    <n-button
                        size="small"
                        :disabled="!addCurrency"
                        @click="handleAddCurrency"
                    >
                        + 新增幣別
                    </n-button>
                </div>
            </div>

            <n-divider class="my-4" />

            <n-space justify="end">
                <n-button @click="$emit('update:show', false)">取消</n-button>
                <n-button type="primary" :loading="saving" @click="handleSave">
                    儲存配置
                </n-button>
            </n-space>
        </n-card>
    </n-modal>
</template>
