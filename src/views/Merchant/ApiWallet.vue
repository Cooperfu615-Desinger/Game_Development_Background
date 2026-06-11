<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/services/apiClient'
import SectionCard from '@/components/ui/SectionCard.vue'
import SensitiveValue from '@/components/ui/SensitiveValue.vue'
import Tag from 'primevue/tag'

type Severity = 'success' | 'info' | 'warn' | 'danger' | 'secondary'

interface MerchantRow {
  walletType: string; apiStatus: string
  apiKey: string; secretKey: string; walletApi: string; callbackUrl: string
}

const wallet = ref<MerchantRow | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    // self-view：own-merchant scope → 1 筆；憑證欄位在同一列
    const rows = await api.get<MerchantRow[]>('/api/merchants/v2/list')
    wallet.value = rows[0] ?? null
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
          <h2>API 與錢包</h2>
          <p>本商戶的錢包介接與 API 憑證；密鑰預設遮罩，點眼睛圖示可顯示。</p>
        </div>
      </template>
      <div v-if="loading">載入中…</div>
      <div v-else-if="!wallet">（無資料）</div>
      <div v-else class="detail-grid">
        <div><span>錢包類型</span><strong>{{ wallet.walletType }}</strong></div>
        <div><span>API 狀態</span><Tag :value="wallet.apiStatus" :severity="statusSeverity(wallet.apiStatus)" /></div>
        <div><span>錢包 API</span><strong>{{ wallet.walletApi }}</strong></div>
        <div><span>回呼網址</span><strong>{{ wallet.callbackUrl }}</strong></div>
        <div><span>API Key</span><SensitiveValue :value="wallet.apiKey || '-'" /></div>
        <div><span>Secret Key</span><SensitiveValue :value="wallet.secretKey || '-'" /></div>
      </div>
    </SectionCard>
  </div>
</template>
