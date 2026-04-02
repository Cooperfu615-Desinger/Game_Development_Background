<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import {
    NCard, NDataTable, NTag, NButton, NModal,
    NForm, NFormItem, NInput, NSpace, NIcon,
    useMessage, useDialog
} from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { ContentCopyRound } from '@vicons/material'

interface ApiKey {
    id: string
    name: string
    key: string
    createdAt: string
    lastUsedAt: string | null
    status: 'active' | 'revoked'
}

const message = useMessage()
const dialog = useDialog()

const apiKeys = ref<ApiKey[]>([])
const loading = ref(false)
const showModal = ref(false)
const newKeyName = ref('')
const creating = ref(false)

const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('zh-TW') : '從未使用'

const maskKey = (key: string) =>
    key.slice(0, 10) + '••••••••••••••••' + key.slice(-4)

const copyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    message.success('已複製到剪貼簿')
}

const revokeKey = (k: ApiKey) => {
    dialog.warning({
        title: '撤銷 API 密鑰',
        content: `確定要撤銷「${k.name}」嗎？此操作無法復原。`,
        positiveText: '撤銷',
        negativeText: '取消',
        onPositiveClick: async () => {
            await fetch(`/api/settings/api-keys/${k.id}`, { method: 'DELETE' })
            k.status = 'revoked'
            message.success('已撤銷')
        }
    })
}

const columns: DataTableColumns<ApiKey> = [
    { title: '名稱', key: 'name' },
    {
        title: 'API Key', key: 'key',
        render: (row) => h(NSpace, { align: 'center', size: 'small' }, {
            default: () => [
                h('span', { class: 'font-mono text-xs' }, maskKey(row.key)),
                row.status === 'active'
                    ? h(NButton, {
                        text: true, size: 'tiny',
                        onClick: () => copyKey(row.key)
                    }, { icon: () => h(NIcon, null, { default: () => h(ContentCopyRound) }) })
                    : null
            ]
        })
    },
    {
        title: '狀態', key: 'status', width: 90,
        render: (row) => h(NTag, {
            type: row.status === 'active' ? 'success' : 'default',
            size: 'small', bordered: false
        }, { default: () => row.status === 'active' ? '使用中' : '已撤銷' })
    },
    { title: '建立時間', key: 'createdAt', width: 120, render: (row) => formatDate(row.createdAt) },
    { title: '最後使用', key: 'lastUsedAt', width: 120, render: (row) => formatDate(row.lastUsedAt) },
    {
        title: '操作', key: 'actions', width: 80,
        render: (row) => h(NButton, {
            size: 'tiny', type: 'error', disabled: row.status === 'revoked',
            onClick: () => revokeKey(row)
        }, { default: () => '撤銷' })
    }
]

const fetchKeys = async () => {
    loading.value = true
    try {
        const res = await fetch('/api/settings/api-keys')
        const json = await res.json()
        apiKeys.value = json.data.items
    } finally {
        loading.value = false
    }
}

const createKey = async () => {
    if (!newKeyName.value.trim()) return
    creating.value = true
    try {
        const res = await fetch('/api/settings/api-keys', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newKeyName.value })
        })
        const json = await res.json()
        apiKeys.value.unshift(json.data)
        showModal.value = false
        newKeyName.value = ''
        message.success('API 密鑰已建立')
    } finally {
        creating.value = false
    }
}

onMounted(fetchKeys)
</script>

<template>
    <div class="flex flex-col gap-4 max-w-4xl">
        <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold">API 密鑰管理</h1>
            <n-button type="primary" @click="showModal = true">+ 新增密鑰</n-button>
        </div>

        <n-card>
            <n-data-table
                :columns="columns"
                :data="apiKeys"
                :loading="loading"
                :pagination="false"
            />
        </n-card>

        <!-- 建立 Modal -->
        <n-modal
            v-model:show="showModal"
            preset="card"
            title="建立 API 密鑰"
            class="w-[420px]"
            :mask-closable="false"
        >
            <n-form label-placement="left" :label-width="80">
                <n-form-item label="名稱">
                    <n-input
                        v-model:value="newKeyName"
                        placeholder="例：Production Key"
                        @keydown.enter="createKey"
                    />
                </n-form-item>
            </n-form>
            <template #footer>
                <n-space justify="end">
                    <n-button @click="showModal = false">取消</n-button>
                    <n-button type="primary" :loading="creating" @click="createKey">建立</n-button>
                </n-space>
            </template>
        </n-modal>
    </div>
</template>
