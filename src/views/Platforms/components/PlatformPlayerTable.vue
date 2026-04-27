<script setup lang="ts">
import { computed } from 'vue'
import { NDataTable, NInput, NPagination } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import type { PlatformPlayer } from '@/types/platform'

const props = defineProps<{
    players: PlatformPlayer[]
    total: number
    loading: boolean
    hasAgentSystem: boolean
    search: string
    page: number
}>()

const emit = defineEmits<{
    (e: 'update:search', v: string): void
    (e: 'update:page', v: number): void
}>()

const fmtMoney = (n: number) =>
    `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('zh-TW')

const columns = computed<DataTableColumns<PlatformPlayer>>(() => {
    const base: DataTableColumns<PlatformPlayer> = [
        {
            title: '玩家 ID',
            key: 'playerId',
            render: (row) => row.playerId,
        },
        {
            title: '累計流水',
            key: 'totalTurnover',
            render: (row) => fmtMoney(row.totalTurnover),
            sorter: (a, b) => a.totalTurnover - b.totalTurnover,
        },
        {
            title: '本期流水',
            key: 'periodTurnover',
            render: (row) => fmtMoney(row.periodTurnover),
            sorter: (a, b) => a.periodTurnover - b.periodTurnover,
        },
        {
            title: '最後活躍',
            key: 'lastActiveAt',
            render: (row) => fmtDate(row.lastActiveAt),
        },
    ]

    if (props.hasAgentSystem) {
        base.splice(1, 0, {
            title: 'AgentID',
            key: 'agentId',
            render: (row) => row.agentId ?? '—',
        })
    }

    return base
})
</script>

<template>
    <div class="flex flex-col gap-4">
        <div class="flex justify-between items-center">
            <span class="text-sm text-gray-400">共 {{ total }} 位玩家</span>
            <n-input
                :value="search"
                placeholder="搜尋玩家 ID..."
                clearable
                class="w-56"
                @update:value="emit('update:search', $event)"
            />
        </div>

        <n-data-table
            :columns="columns"
            :data="players"
            :loading="loading"
            :pagination="false"
            :row-key="(r: PlatformPlayer) => r.playerId"
            size="small"
        />

        <div class="flex justify-end">
            <n-pagination
                :page="page"
                :page-count="Math.ceil(total / 20)"
                @update:page="emit('update:page', $event)"
            />
        </div>
    </div>
</template>
