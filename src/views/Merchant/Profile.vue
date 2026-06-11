<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/services/apiClient'
import SectionCard from '@/components/ui/SectionCard.vue'
import Tag from 'primevue/tag'

type Severity = 'success' | 'info' | 'warn' | 'danger' | 'secondary'

interface MerchantRow {
  code: string; name: string; agent: string; status: string
  currencies: string[]; defaultCurrency: string; settlementCurrency: string
  languages: string[]; environmentMode: string; walletType: string
  revenueType: string; revenueShare: string; contact: string; createdAt: string
}

const profile = ref<MerchantRow | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    // self-view：C1 已將此端點 scope 成 own-merchant，merchant token 下恰好 1 筆
    const rows = await api.get<MerchantRow[]>('/api/merchants/v2/list')
    profile.value = rows[0] ?? null
  } finally {
    loading.value = false
  }
})

function statusSeverity(s: string): Severity {
  if (s === '啟用') return 'success'
  if (s === '警示' || s === '待審核') return 'warn'
  if (s === '停用') return 'danger'
  return 'info'
}
</script>

<template>
  <div class="page-stack">
    <SectionCard>
      <template #header>
        <div class="dialog-title-block">
          <h2>商戶資料</h2>
          <p>檢視本商戶的基本設定資訊（唯讀）。</p>
        </div>
      </template>
      <div v-if="loading">載入中…</div>
      <div v-else-if="!profile">（無資料）</div>
      <div v-else class="detail-grid">
        <div><span>商戶名稱</span><strong>{{ profile.name }}</strong></div>
        <div><span>商戶代號</span><strong>{{ profile.code }}</strong></div>
        <div><span>所屬代理</span><strong>{{ profile.agent }}</strong></div>
        <div><span>狀態</span><Tag :value="profile.status" :severity="statusSeverity(profile.status)" /></div>
        <div><span>幣別</span><strong>{{ profile.currencies.join('、') }}</strong></div>
        <div><span>預設幣別</span><strong>{{ profile.defaultCurrency }}</strong></div>
        <div><span>結算幣別</span><strong>{{ profile.settlementCurrency }}</strong></div>
        <div><span>語系</span><strong>{{ profile.languages.join('、') }}</strong></div>
        <div><span>環境</span><strong>{{ profile.environmentMode }}</strong></div>
        <div><span>錢包類型</span><strong>{{ profile.walletType }}</strong></div>
        <div><span>分潤方式</span><strong>{{ profile.revenueType }} {{ profile.revenueShare }}</strong></div>
        <div><span>聯絡人</span><strong>{{ profile.contact }}</strong></div>
        <div><span>建立時間</span><strong>{{ profile.createdAt }}</strong></div>
      </div>
    </SectionCard>
  </div>
</template>
