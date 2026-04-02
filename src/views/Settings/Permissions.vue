<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import { NCard, NDataTable, NTag, NSpace, NSkeleton } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'

interface Permission {
    id: string
    role: string
    description: string
    permissions: string[]
}

const PERM_LABELS: Record<string, string> = {
    read: '讀取', write: '寫入', delete: '刪除',
    manage: '管理', finance: '財務'
}

const PERM_TYPES: Record<string, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
    read: 'default', write: 'info', delete: 'error',
    manage: 'warning', finance: 'success'
}

const permissions = ref<Permission[]>([])
const loading = ref(false)

const columns: DataTableColumns<Permission> = [
    { title: '角色', key: 'role', width: 120 },
    { title: '說明', key: 'description' },
    {
        title: '權限', key: 'permissions',
        render: (row) => h(NSpace, { size: 'small' }, {
            default: () => row.permissions.map(p =>
                h(NTag, {
                    key: p,
                    type: PERM_TYPES[p] ?? 'default',
                    size: 'small',
                    bordered: false
                }, { default: () => PERM_LABELS[p] ?? p })
            )
        })
    }
]

onMounted(async () => {
    loading.value = true
    try {
        const res = await fetch('/api/settings/permissions')
        const json = await res.json()
        permissions.value = json.data.items
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <div class="flex flex-col gap-4 max-w-3xl">
        <h1 class="text-2xl font-bold">權限管理</h1>

        <n-card title="角色權限一覽">
            <n-skeleton v-if="loading" :repeat="4" text />
            <n-data-table
                v-else
                :columns="columns"
                :data="permissions"
                :pagination="false"
            />
        </n-card>
    </div>
</template>
