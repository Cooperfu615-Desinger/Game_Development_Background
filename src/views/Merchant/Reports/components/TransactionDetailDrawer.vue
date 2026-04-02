<script setup lang="ts">
import { ref, watch, h } from 'vue'
import { NDrawer, NDrawerContent, NDataTable, useMessage, NSpin } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import type { TransactionDetailRow } from '../../../../types/table'

const props = defineProps<{
    show: boolean
    date: string
}>()

const emit = defineEmits(['update:show'])

const { t } = useI18n()
const message = useMessage()
const loading = ref(false)
const list = ref<TransactionDetailRow[]>([])

const fetchTransactions = async () => {
    loading.value = true
    try {
        // Mock API call
        const res = await fetch(`/api/v2/merchant/reports/transactions?date=${props.date}`)
        const data = await res.json()
        if (data.code === 0) {
            list.value = data.data.list
        }
    } catch (e) {
        message.error('Failed to load transactions')
    } finally {
        loading.value = false
    }
}

watch(() => props.show, (newVal) => {
    if (newVal) {
        fetchTransactions()
    }
})

const columns: DataTableColumns<TransactionDetailRow> = [
    {
        title: t('merchantReports.betTime'),
        key: 'created_at',
        width: 160,
        render: (row) => new Date(row.created_at).toLocaleString()
    },
    {
        title: t('merchantReports.player'),
        key: 'player_id',
        width: 140
    },
    {
        title: t('merchantReports.game'),
        key: 'game_name',
        width: 140
    },
    {
        title: t('merchantReports.totalBet'),
        key: 'bet_amount',
        width: 120,
        align: 'right',
        render: (row: TransactionDetailRow) => row.bet_amount.toFixed(2)
    },
    {
        title: t('merchantReports.totalPayout'),
        key: 'payout_amount',
        width: 120,
        align: 'right',
        render: (row: TransactionDetailRow) => row.payout_amount.toFixed(2)
    },
    {
        title: t('merchantReports.netWin'),
        key: 'net_win',
        width: 120,
        align: 'right',
        render: (row: TransactionDetailRow) => {
            const val = row.net_win
            return h(
                'span',
                { class: val >= 0 ? 'text-green-500' : 'text-red-500' },
                val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2)
            )
        }
    }
]
</script>

<template>
    <n-drawer :show="show" :width="800" @update:show="(val) => emit('update:show', val)">
        <n-drawer-content :title="`${date} ${t('merchantReports.transactionDetails')}`" closable>
            <n-spin :show="loading">
                <n-data-table
                    :columns="columns"
                    :data="list"
                    :row-key="(row: TransactionDetailRow) => row.id"
                    striped
                />
            </n-spin>
        </n-drawer-content>
    </n-drawer>
</template>
