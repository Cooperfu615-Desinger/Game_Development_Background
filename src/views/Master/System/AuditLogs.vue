<script setup lang="ts">
import { ref, onMounted, computed, h } from 'vue'
import { 
    NCard, NDataTable, NTag, NDrawer, NDrawerContent, NCode, 
    NGrid, NGridItem, NDatePicker, NInput, NSelect, NButton, NIcon,
    type DataTableColumns 
} from 'naive-ui'
import { SearchOutlined } from '@vicons/material'
import { useI18n } from 'vue-i18n'
import type { AuditLog, AuditAction } from '../../../types/system'

const { t } = useI18n()

// Filters
const searchRange = ref<[number, number] | null>(null)
const searchOperator = ref('')
const searchAction = ref<AuditAction | 'all'>('all')

const logs = ref<AuditLog[]>([])
const loading = ref(false)
const showDetail = ref(false)
const selectedLog = ref<AuditLog | null>(null)

// Action Options for Select
const actionOptions = computed(() => [
    { label: t('common.all'), value: 'all' },
    { label: t('audit.types.login'), value: 'login' },
    { label: t('audit.types.logout'), value: 'logout' },
    { label: t('audit.types.create'), value: 'create' },
    { label: t('audit.types.update'), value: 'update' },
    { label: t('audit.types.delete'), value: 'delete' },
    { label: t('audit.types.other'), value: 'other' }
])

// Formatting Helpers
const formatDate = (isoString: string) => {
    if (!isoString) return '-'
    const date = new Date(isoString)
    return date.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).replace(/\//g, '-')
}

const getActionConfig = (action: string) => {
    switch (action) {
        case 'login':
        case 'logout':
            return { type: 'info', labelKey: `audit.types.${action}` }
        case 'create':
            return { type: 'success', labelKey: 'audit.types.create' }
        case 'update':
            return { type: 'warning', labelKey: 'audit.types.update' }
        case 'delete':
            return { type: 'error', labelKey: 'audit.types.delete' }
        default:
            return { type: 'default', labelKey: 'audit.types.other' }
    }
}

// Columns
const columns = computed<DataTableColumns<AuditLog>>(() => [
    { 
        title: t('audit.time'), 
        key: 'time',
        render: (row) => formatDate(row.time),
        width: 180
    },
    { 
        title: t('audit.operator'), 
        key: 'operator',
        width: 150
    },
    { 
        title: t('audit.action'), 
        key: 'action',
        width: 120,
        render: (row) => {
            const config = getActionConfig(row.action)
            return h(
                NTag, 
                { type: config.type as any, bordered: false, size: 'small' }, 
                { default: () => t(config.labelKey) }
            )
        }
    },
    { title: t('audit.target'), key: 'target' },
    { 
        title: t('audit.ip'), 
        key: 'ip',
        render: (row) => h('span', { class: 'font-mono text-xs' }, row.ip),
        width: 140
    },
    {
        title: t('audit.details'),
        key: 'details',
        width: 120,
        render: (row) => h(
            NButton, 
            { 
                text: true, 
                type: 'primary',
                size: 'small',
                onClick: () => viewDetail(row)
            }, 
            { default: () => t('audit.viewDetails') }
        )
    }
])

// Computed Filtered Logs
const filteredLogs = computed(() => {
    return logs.value.filter((log: AuditLog) => {
        // Filter by Operator
        if (searchOperator.value && !log.operator.toLowerCase().includes(searchOperator.value.toLowerCase())) {
            return false
        }
        // Filter by Action
        if (searchAction.value !== 'all' && log.action !== searchAction.value) {
            return false
        }
        // Filter by Time Range
        if (searchRange.value) {
            const logTime = new Date(log.time).getTime()
            const [start, end] = searchRange.value
            if (logTime < start || logTime > end) {
                return false
            }
        }
        return true
    })
})

const fetchLogs = async () => {
    loading.value = true
    try {
        const res = await fetch('/api/v2/system/audit-logs')
        const data = await res.json()
        if (data.code === 0) {
            logs.value = data.data.list
        }
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

const viewDetail = (row: AuditLog) => {
    selectedLog.value = row
    showDetail.value = true
}

const handleSearch = () => {
    // Client-side filtering is reactive via computed filteredLogs
    fetchLogs()
}

onMounted(() => fetchLogs())
</script>

<template>
    <div class="p-6 space-y-4">
        <h1 class="text-2xl font-bold">{{ t('menu.auditLog') }}</h1>

        <!-- Filter Grid -->
        <n-card size="small">
            <n-grid :x-gap="12" :y-gap="8" cols="1 s:2 m:4" responsive="screen">
                <n-grid-item>
                    <div class="text-xs text-gray-500 mb-1">{{ t('audit.filterTime') }}</div>
                    <n-date-picker 
                        v-model:value="searchRange" 
                        type="datetimerange" 
                        clearable 
                        class="w-full"
                    />
                </n-grid-item>
                <n-grid-item>
                    <div class="text-xs text-gray-500 mb-1">{{ t('audit.filterOperator') }}</div>
                    <n-input 
                        v-model:value="searchOperator" 
                        :placeholder="t('audit.filterOperator')" 
                        clearable
                        @keyup.enter="handleSearch"
                    />
                </n-grid-item>
                <n-grid-item>
                    <div class="text-xs text-gray-500 mb-1">{{ t('audit.filterAction') }}</div>
                    <n-select 
                        v-model:value="searchAction" 
                        :options="actionOptions" 
                    />
                </n-grid-item>
                <n-grid-item class="flex items-end">
                    <n-button type="primary" class="w-full" @click="handleSearch">
                        <template #icon>
                            <n-icon><SearchOutlined /></n-icon>
                        </template>
                        {{ t('common.search') }}
                    </n-button>
                </n-grid-item>
            </n-grid>
        </n-card>

        <!-- Data Table -->
        <n-card>
            <n-data-table 
                :columns="columns" 
                :data="filteredLogs" 
                :loading="loading" 
                :pagination="{ pageSize: 15 }"
                :row-key="(row: AuditLog) => row.id"
            />
        </n-card>

        <!-- Details Drawer -->
        <n-drawer v-model:show="showDetail" :width="500">
            <n-drawer-content :title="t('audit.details')">
                <div v-if="selectedLog" class="space-y-6">
                    <!-- Summary -->
                    <div class="grid grid-cols-2 gap-4 text-sm bg-gray-900 p-4 rounded-lg text-gray-100">
                        <div class="text-gray-400">{{ t('audit.time') }}</div>
                        <div class="font-medium">{{ formatDate(selectedLog.time) }}</div>
                        
                        <div class="text-gray-400">{{ t('audit.operator') }}</div>
                        <div class="font-bold text-white">{{ selectedLog.operator }}</div>
                        
                        <div class="text-gray-400">{{ t('audit.action') }}</div>
                        <div>
                            <n-tag :type="getActionConfig(selectedLog.action).type as any" size="small" :bordered="false">
                                {{ t(getActionConfig(selectedLog.action).labelKey) }}
                            </n-tag>
                        </div>

                        <div class="text-gray-400">{{ t('audit.ip') }}</div>
                        <div class="font-mono text-xs">{{ selectedLog.ip }}</div>
                    </div>

                    <!-- Target Info -->
                    <div>
                        <div class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{{ t('audit.target') }}</div>
                        <div class="p-3 border border-gray-700 rounded-md text-sm text-gray-200 bg-gray-900">
                            {{ selectedLog.target }}
                        </div>
                    </div>
                    
                    <!-- JSON Changes -->
                    <div>
                        <div class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{{ t('audit.details') }}</div>
                        <n-card size="small" class="bg-gray-900 text-gray-100 border-none">
                            <n-code :code="JSON.stringify(selectedLog.details, null, 2)" language="json" word-wrap />
                        </n-card>
                    </div>
                </div>
            </n-drawer-content>
        </n-drawer>
    </div>
</template>
