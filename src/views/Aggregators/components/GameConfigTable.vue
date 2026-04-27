<script setup lang="ts">
import { computed, h } from 'vue'
import { NDataTable, NTag, NSwitch, NButton, NSpace } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import type { AggregatorGameConfig } from '@/types/aggregator'

const props = defineProps<{
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
const categoryType = (cat: AggregatorGameConfig['category']) =>
    cat === 'slot' ? 'info' as const : cat === 'crash' ? 'warning' as const : 'default' as const

const columns = computed<DataTableColumns<AggregatorGameConfig>>(() => [
    {
        title: '遊戲', key: 'gameName', width: 200,
        render: row => h('div', [
            h('p', { class: 'font-medium text-sm' }, row.gameName),
            h('p', { class: 'text-xs text-gray-500' }, row.gameId),
        ])
    },
    {
        title: '類型', key: 'category', width: 90,
        render: row => h(NTag, {
            type: categoryType(row.category), size: 'small', bordered: false
        }, { default: () => categoryLabel(row.category) })
    },
    {
        title: '開放', key: 'enabled', width: 80,
        render: row => h(NSwitch, {
            value: row.enabled,
            size: 'small',
            loading: props.updatingGame === row.gameId,
            onUpdateValue: (v: boolean) => emit('toggle-enabled', row.gameId, v),
        })
    },
    {
        title: '已配置幣別', key: 'betRanges', width: 160,
        render: row => {
            if (!row.enabled || row.betRanges.length === 0)
                return h('span', { class: 'text-gray-400 text-sm' }, '— 尚未配置')
            return h(NSpace, { size: 4 }, {
                default: () => row.betRanges.map(r =>
                    h(NTag, { size: 'tiny', bordered: false }, { default: () => r.currency })
                )
            })
        }
    },
    {
        title: 'USDT 投注範圍', key: 'usdtRange', width: 170,
        render: row => {
            const usdt = row.betRanges.find(r => r.currency === 'USDT')
            if (!usdt) return h('span', { class: 'text-gray-400 text-sm' }, '—')
            return h('span', { class: 'text-sm font-mono' },
                `$${usdt.minBet} ~ $${usdt.maxBet}`)
        }
    },
    {
        title: '操作', key: 'action', width: 80, fixed: 'right',
        render: row => h(NButton, {
            size: 'small', text: true, type: 'primary',
            onClick: () => emit('edit', row)
        }, { default: () => '編輯' })
    },
])
</script>

<template>
    <n-data-table
        :columns="columns"
        :data="configs"
        :loading="loading"
        :row-key="(row: AggregatorGameConfig) => row.gameId"
        :pagination="false"
        scroll-x="780"
    />
</template>
