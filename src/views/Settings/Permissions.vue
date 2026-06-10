<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/services/apiClient'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Skeleton from 'primevue/skeleton'

interface Permission {
    id: string
    role: string
    description: string
    permissions: string[]
}

const PERM_LABELS: Record<string, string> = {
    read: '讀取',
    write: '寫入',
    delete: '刪除',
    manage: '管理',
    finance: '財務',
}

// 對應 PrimeVue Tag 的 severity
const PERM_SEVERITY: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
    read: 'secondary',
    write: 'info',
    delete: 'danger',
    manage: 'warn',
    finance: 'success',
}

const permissions = ref<Permission[]>([])
const loading = ref(false)

onMounted(async () => {
    loading.value = true
    try {
        const json = await api.get<{ data: { items: Permission[] } }>('/api/settings/permissions')
        permissions.value = json.data.items
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <div class="hig-page max-w-3xl">
        <header class="hig-page-header">
            <h1 class="hig-page-title">
                <i class="pi pi-shield" />
                權限管理
            </h1>
        </header>

        <section class="hig-card">
            <header class="hig-card-header">
                <h2 class="hig-card-title">角色權限一覽</h2>
            </header>

            <!-- Loading state -->
            <div v-if="loading" class="hig-card-body">
                <div class="flex flex-col gap-3">
                    <Skeleton v-for="i in 4" :key="i" height="2.5rem" />
                </div>
            </div>

            <!-- Data table -->
            <DataTable
                v-else
                :value="permissions"
                :pt="{ root: { class: 'border-0' } }"
            >
                <Column field="role" header="角色" style="width: 120px" />
                <Column field="description" header="說明" />
                <Column header="權限">
                    <template #body="{ data }">
                        <div class="flex flex-wrap gap-1.5">
                            <Tag
                                v-for="p in data.permissions"
                                :key="p"
                                :severity="PERM_SEVERITY[p] ?? 'secondary'"
                                :value="PERM_LABELS[p] ?? p"
                            />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </section>
    </div>
</template>
