<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

interface ApiKey {
    id: string
    name: string
    key: string
    createdAt: string
    lastUsedAt: string | null
    status: 'active' | 'revoked'
}

const toast = useToast()
const confirm = useConfirm()

const apiKeys = ref<ApiKey[]>([])
const loading = ref(false)

// ─── Create modal ───────────────────────────────────────
const showModal = ref(false)
const newKeyName = ref('')
const creating = ref(false)

// ─── Helpers ────────────────────────────────────────────
const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('zh-TW') : '從未使用'

const maskKey = (key: string) => key.slice(0, 10) + '••••••••••••••••' + key.slice(-4)

const copyKey = async (key: string) => {
    try {
        await navigator.clipboard.writeText(key)
        toast.add({ severity: 'success', summary: '已複製到剪貼簿', life: 1500 })
    } catch {
        toast.add({ severity: 'error', summary: '無法存取剪貼簿', life: 2500 })
    }
}

const revokeKey = (k: ApiKey) => {
    confirm.require({
        message: `確定要撤銷「${k.name}」嗎？此操作無法復原。`,
        header: '撤銷 API 密鑰',
        icon: 'pi pi-exclamation-triangle',
        rejectLabel: '取消',
        acceptLabel: '撤銷',
        rejectProps: { severity: 'secondary', outlined: true },
        acceptProps: { severity: 'danger' },
        accept: async () => {
            await fetch(`/api/settings/api-keys/${k.id}`, { method: 'DELETE' })
            k.status = 'revoked'
            toast.add({ severity: 'success', summary: '已撤銷', life: 1500 })
        },
    })
}

// ─── API ────────────────────────────────────────────────
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
            body: JSON.stringify({ name: newKeyName.value }),
        })
        const json = await res.json()
        apiKeys.value.unshift(json.data)
        showModal.value = false
        newKeyName.value = ''
        toast.add({ severity: 'success', summary: 'API 密鑰已建立', life: 2000 })
    } finally {
        creating.value = false
    }
}

const handleCloseModal = () => {
    showModal.value = false
    newKeyName.value = ''
}

onMounted(fetchKeys)
</script>

<template>
    <div class="hig-page max-w-4xl">
        <header class="hig-page-header">
            <h1 class="hig-page-title">
                <i class="pi pi-key" />
                API 密鑰管理
            </h1>
            <Button label="新增密鑰" icon="pi pi-plus" @click="showModal = true" />
        </header>

        <section class="hig-card">
            <DataTable
                :value="apiKeys"
                :loading="loading"
                :pt="{ root: { class: 'border-0' } }"
            >
                <Column field="name" header="名稱" />
                <Column header="API Key">
                    <template #body="{ data }">
                        <div class="flex items-center gap-2">
                            <code class="apikey-mono">{{ maskKey(data.key) }}</code>
                            <Button
                                v-if="data.status === 'active'"
                                icon="pi pi-copy"
                                text
                                rounded
                                size="small"
                                aria-label="複製 API 密鑰"
                                @click="copyKey(data.key)"
                            />
                        </div>
                    </template>
                </Column>
                <Column header="狀態" style="width: 100px">
                    <template #body="{ data }">
                        <Tag
                            :severity="data.status === 'active' ? 'success' : 'secondary'"
                            :value="data.status === 'active' ? '使用中' : '已撤銷'"
                        />
                    </template>
                </Column>
                <Column field="createdAt" header="建立時間" style="width: 130px">
                    <template #body="{ data }">{{ formatDate(data.createdAt) }}</template>
                </Column>
                <Column field="lastUsedAt" header="最後使用" style="width: 130px">
                    <template #body="{ data }">{{ formatDate(data.lastUsedAt) }}</template>
                </Column>
                <Column header="操作" style="width: 100px">
                    <template #body="{ data }">
                        <Button
                            label="撤銷"
                            severity="danger"
                            size="small"
                            outlined
                            :disabled="data.status === 'revoked'"
                            @click="revokeKey(data)"
                        />
                    </template>
                </Column>
            </DataTable>
        </section>

        <!-- Create dialog -->
        <Dialog
            :visible="showModal"
            modal
            header="建立 API 密鑰"
            :style="{ width: '24rem' }"
            :draggable="false"
            :closable="false"
            @update:visible="(v) => !v && handleCloseModal()"
        >
            <div class="flex flex-col gap-2">
                <label for="key-name" class="text-sm font-medium">名稱</label>
                <InputText
                    id="key-name"
                    v-model="newKeyName"
                    placeholder="例：Production Key"
                    fluid
                    @keydown.enter="createKey"
                />
            </div>
            <template #footer>
                <Button label="取消" severity="secondary" outlined @click="handleCloseModal" />
                <Button label="建立" :loading="creating" @click="createKey" />
            </template>
        </Dialog>

        <Toast position="top-right" />
        <ConfirmDialog />
    </div>
</template>

<style scoped>
.apikey-mono {
    font-family: var(--hig-font-mono);
    font-size: 0.8125rem;
    color: var(--hig-text-secondary);
    letter-spacing: 0.02em;
}
</style>
