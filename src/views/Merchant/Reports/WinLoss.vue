<script setup lang="ts">
import { ref, onMounted, computed, h } from 'vue'
import { NCard, NDataTable, NDatePicker, NSpace, NButton } from 'naive-ui'
import { useI18n } from 'vue-i18n'

import type { DataTableColumns } from 'naive-ui'

const { t } = useI18n()

interface BetLog {
    id: string
    time: string
    game_name: string
    bet: number
    win: number
    status: 'win' | 'loss'
}

const loading = ref(false)
const list = ref<BetLog[]>([])
const dateRange = ref<[number, number] | null>(null)

const columns = computed<DataTableColumns<BetLog>>(() => [
    { title: t('betLog.time'), key: 'time', align: 'right' },
    { title: t('betLog.roundId'), key: 'id', align: 'right' },
    { title: t('betLog.game'), key: 'game_name', align: 'right' },
    { 
        title: t('betLog.bet'), 
        key: 'bet',
        align: 'right',
        render: (row: BetLog) => row.bet.toFixed(2)
    },
    { 
        title: t('betLog.win'), 
        key: 'win',
        align: 'right',
        render: (row: BetLog) => h(
            'span',
            { class: row.win > 0 ? 'text-green-600 font-bold' : 'text-gray-500' },
            row.win.toFixed(2)
        )
    },
    {
        title: t('betLog.payout'),
        key: 'payout',
        align: 'right',
        render: (row: BetLog) => {
            const p = row.win / (row.bet || 1)
            return p.toFixed(2) + 'x'
        }
    }
])

const fetchData = async () => {
    loading.value = true
    try {
        const res = await fetch('/api/v2/agent/report/win-loss', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                date_start: dateRange.value?.[0],
                date_end: dateRange.value?.[1]
            })
        })
        const data = await res.json()
        list.value = data.data.list
    } finally {
        loading.value = false
    }
}

onMounted(() => fetchData())
</script>

<template>
    <div class="p-6 space-y-4">
        <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold">{{ t('agent.winLossReport') }}</h1>
            <n-space>
                <n-date-picker v-model:value="dateRange" type="daterange" clearable />
                <n-button type="primary" @click="fetchData">{{ t('common.search') }}</n-button>
            </n-space>
        </div>

        <n-card>
            <n-data-table 
                :columns="columns" 
                :data="list" 
                :loading="loading" 
                :pagination="{ pageSize: 10 }"
            />
        </n-card>
    </div>
</template>
