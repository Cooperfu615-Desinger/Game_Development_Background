<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { api } from '@/services/apiClient'
import SectionCard from '@/components/ui/SectionCard.vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import CurrencyAmount from '@/components/ui/CurrencyAmount.vue'

type Severity = 'success' | 'info' | 'warn' | 'danger' | 'secondary'

interface CommissionRow {
  period: string; agent: string; merchant: string; bet: number; ggr: number
  commissionType: string; commissionRate: number; commission: number
  currency: string; settlementStatus: string
}

const rows = reactive<CommissionRow[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const data = await api.get<CommissionRow[]>('/api/agents/v2/commissions')
    rows.splice(0, rows.length, ...data)
  } finally {
    loading.value = false
  }
})

function money(value: number, currency: string) {
  const sign = value < 0 ? '-' : ''
  return `${currency} ${sign}${Math.abs(value).toLocaleString('en-US', { maximumFractionDigits: 2 })}`
}
function statusSeverity(s: string): Severity {
  if (s === '已鎖定') return 'success'
  if (s === '爭議中') return 'danger'
  return 'warn'
}
</script>

<template>
  <div class="page-stack">
    <SectionCard>
      <template #header>
        <div class="dialog-title-block">
          <h2>佣金報表</h2>
          <p>本代理線下各商戶的佣金結算（依資料範圍 own-agent-line 篩選）。</p>
        </div>
      </template>
      <DataTable :value="rows" :loading="loading" paginator :rows="10" scrollable table-style="min-width: 960px">
        <Column field="period" header="期間" style="width: 100px" />
        <Column field="merchant" header="商戶" style="width: 150px" />
        <Column header="Bet" style="width: 150px">
          <template #body="{ data }"><CurrencyAmount :value="money(data.bet, data.currency)" /></template>
        </Column>
        <Column header="GGR" style="width: 150px">
          <template #body="{ data }"><CurrencyAmount :value="money(data.ggr, data.currency)" :negative="data.ggr < 0" /></template>
        </Column>
        <Column field="commissionType" header="佣金類型" style="width: 110px" />
        <Column header="佣金比例" style="width: 100px">
          <template #body="{ data }">{{ (data.commissionRate * 100).toFixed(2) }}%</template>
        </Column>
        <Column header="佣金金額" style="width: 150px">
          <template #body="{ data }"><CurrencyAmount :value="money(data.commission, data.currency)" :negative="data.commission < 0" /></template>
        </Column>
        <Column header="結算" style="width: 100px">
          <template #body="{ data }"><Tag :value="data.settlementStatus" :severity="statusSeverity(data.settlementStatus)" /></template>
        </Column>
      </DataTable>
    </SectionCard>
  </div>
</template>
