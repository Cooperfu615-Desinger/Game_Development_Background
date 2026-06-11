<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/services/apiClient'
import SectionCard from '@/components/ui/SectionCard.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'

type Severity = 'success' | 'info' | 'warn' | 'danger' | 'secondary'

interface SubAccountRow {
  id: string; username: string; displayName: string
  ownerType: 'agent' | 'merchant'; agent: string; merchant: string
  role: string; status: string; lastLoginAt: string; createdAt: string
}

const route = useRoute()
const portal = computed(() => (route.meta.portal as string | undefined) ?? '')
const title = computed(() => (portal.value === 'agent' ? '代理子帳號' : '商戶子帳號'))

const rows = reactive<SubAccountRow[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const data = await api.get<SubAccountRow[]>('/api/sub-accounts/v2/list')
    rows.splice(0, rows.length, ...data)
  } finally {
    loading.value = false
  }
})

function statusSeverity(s: string): Severity {
  if (s === '啟用') return 'success'
  if (s === '停用') return 'danger'
  return 'info'
}
</script>

<template>
  <div class="page-stack">
    <SectionCard>
      <template #header>
        <div class="dialog-title-block">
          <h2>{{ title }}</h2>
          <p>管理本帳號下的操作子帳號（依資料範圍篩選，僅顯示自己的）。</p>
        </div>
      </template>
      <DataTable :value="rows" :loading="loading" paginator :rows="10" scrollable table-style="min-width: 800px">
        <Column field="username" header="帳號" style="width: 160px" />
        <Column field="displayName" header="顯示名稱" style="width: 150px" />
        <Column field="role" header="角色" style="width: 110px" />
        <Column header="狀態" style="width: 100px">
          <template #body="{ data }"><Tag :value="data.status" :severity="statusSeverity(data.status)" /></template>
        </Column>
        <Column field="lastLoginAt" header="最後登入" style="width: 160px" />
        <Column field="createdAt" header="建立時間" style="width: 160px" />
      </DataTable>
    </SectionCard>
  </div>
</template>
