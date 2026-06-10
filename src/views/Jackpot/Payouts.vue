<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Button from 'primevue/button';
import Badge from 'primevue/badge';
import Dialog from 'primevue/dialog';
import SectionCard from '@/components/ui/SectionCard.vue';
import StatusTag from '@/components/ui/StatusTag.vue';
import CurrencyAmount from '@/components/ui/CurrencyAmount.vue';
import DateTimeRangeField from '@/components/ui/DateTimeRangeField.vue';
import SensitiveValue from '@/components/ui/SensitiveValue.vue';
import SummaryCardGrid from '@/components/ui/SummaryCardGrid.vue';

type PayoutRow = {
  id: string;
  jackpot: string;
  merchant: string;
  game: string;
  playerId: string;
  orderId: string;
  payoutAmount: string;
  currency: string;
  status: string;
  reviewStatus: string;
  payoutAt: string;
  reviewer: string;
  walletTxId: string;
  note: string;
};

const filters = reactive({
  keyword: '',
  jackpot: '全部獎池',
  merchant: '全部商戶',
  status: '全部狀態',
  currency: '全部幣別',
  payoutAt: [null, null] as [Date | null, Date | null]
});

const selectedPayout = ref<PayoutRow | null>(null);
const detailVisible = ref(false);

const payoutRows = reactive<PayoutRow[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await fetch('/api/jackpot/v2/payouts');
    payoutRows.splice(0, payoutRows.length, ...await res.json());
  } finally {
    loading.value = false;
  }
});

const jackpotOptions = computed(() => ['全部獎池', ...Array.from(new Set(payoutRows.map((row) => row.jackpot)))]);
const merchantOptions = computed(() => ['全部商戶', ...Array.from(new Set(payoutRows.map((row) => row.merchant)))]);
const statusOptions = ['全部狀態', '已派發', '處理中', '待處理', '失敗'];
const currencyOptions = ['全部幣別', 'USDT', 'USD', 'TWD'];

const summaryCards = computed(() => {
  const pending = payoutRows.filter((row) => row.reviewStatus === '待審核').length;
  const done = payoutRows.filter((row) => row.status === '已派發').length;
  const total = payoutRows.length;

  return [
    { label: '派發筆數', value: String(total), helper: `已派發 ${done}，待審核 ${pending}` },
    { label: '派發成功率', value: total > 0 ? `${((done / total) * 100).toFixed(1)}%` : '0.0%', helper: '依目前 Demo 資料統計' },
    { label: '高額審核', value: String(pending), helper: '高額與異常錢包回應需審核' },
    { label: '關聯資料', value: '注單 / 交易', helper: '不可刪除原始派發紀錄' }
  ];
});

function resetFilters() {
  filters.keyword = '';
  filters.jackpot = '全部獎池';
  filters.merchant = '全部商戶';
  filters.status = '全部狀態';
  filters.currency = '全部幣別';
  filters.payoutAt = [null, null];
}

function openDetail(row: PayoutRow) {
  selectedPayout.value = row;
  detailVisible.value = true;
}
</script>

<template>
  <div class="page-stack jackpot-payouts-page">
    <SummaryCardGrid :cards="summaryCards" />

    <SectionCard class="merchant-filter-card">
      <template #header>
        <div class="dialog-title-block">
          <h2>查詢條件</h2>
          <p>查詢獎池派發、得獎玩家、關聯注單、錢包交易與審核狀態。</p>
        </div>
      </template>

      <div class="jackpot-filter-grid">
        <div class="field jackpot-filter-keyword">
          <label>關鍵字</label>
          <InputText v-model="filters.keyword" placeholder="輸入派發單號、玩家 ID 或注單號" fluid />
        </div>
        <div class="field">
          <label>獎池</label>
          <Select v-model="filters.jackpot" :options="jackpotOptions" fluid />
        </div>
        <div class="field">
          <label>商戶</label>
          <Select v-model="filters.merchant" :options="merchantOptions" fluid />
        </div>
        <div class="field">
          <label>狀態</label>
          <Select v-model="filters.status" :options="statusOptions" fluid />
        </div>
        <div class="field">
          <label>幣別</label>
          <Select v-model="filters.currency" :options="currencyOptions" fluid />
        </div>
        <DateTimeRangeField
          class="jackpot-date-range"
          :model-value="filters.payoutAt"
          @update:model-value="filters.payoutAt = $event"
        />
        <div class="jackpot-filter-actions">
          <Button label="查詢" icon="pi pi-search" />
          <Button label="重置" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" />
        </div>
      </div>
    </SectionCard>

    <div class="agent-command-bar">
      <div>
        <span class="table-count"><Badge :value="payoutRows.length" severity="info" /> 筆派發</span>
        <p>派發紀錄不可刪除；高額、失敗、逾時派發需保留審核與操作紀錄。</p>
      </div>
      <div class="agent-command-actions">
        <Button label="匯出" icon="pi pi-download" severity="secondary" outlined />
      </div>
    </div>

    <SectionCard class="merchant-table-card jackpot-table-card">
      <DataTable
        :value="payoutRows"
        :loading="loading"
        scrollable
        paginator
        :rows="10"
        :rows-per-page-options="[5, 10, 20, 50, 100]"
        paginator-template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
        current-page-report-template="{first}-{last} / {totalRecords}"
        data-key="id"
        table-style="min-width: 1320px"
      >
        <Column field="id" header="派發單號" frozen style="width: 184px; min-width: 184px">
          <template #body="{ data }">
            <strong class="linkish" @click="openDetail(data)">{{ data.id }}</strong>
          </template>
        </Column>
        <Column field="jackpot" header="獎池" style="width: 144px; min-width: 144px" />
        <Column field="merchant" header="商戶" style="width: 144px; min-width: 144px">
          <template #body="{ data }">
            <strong class="agent-primary-text">{{ data.merchant }}</strong>
            <small class="agent-secondary-text">{{ data.game }}</small>
          </template>
        </Column>
        <Column field="playerId" header="玩家 ID" style="width: 132px; min-width: 132px" />
        <Column field="orderId" header="關聯注單" style="width: 168px; min-width: 168px" />
        <Column field="payoutAmount" header="派發金額" header-class="agent-table-cell-right" body-class="agent-table-cell-right" style="width: 144px; min-width: 144px">
          <template #body="{ data }">
            <CurrencyAmount :value="data.payoutAmount" />
          </template>
        </Column>
        <Column field="currency" header="幣別" style="width: 84px; min-width: 84px" />
        <Column field="status" header="狀態" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 104px; min-width: 104px">
          <template #body="{ data }">
            <StatusTag :value="data.status" />
          </template>
        </Column>
        <Column field="reviewStatus" header="審核" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 104px; min-width: 104px">
          <template #body="{ data }">
            <StatusTag :value="data.reviewStatus" />
          </template>
        </Column>
        <Column field="payoutAt" header="派發時間" style="width: 168px; min-width: 168px" />
        <Column field="walletTxId" header="錢包交易" style="width: 136px; min-width: 136px" />
        <Column header="操作" frozen align-frozen="right" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 104px; min-width: 104px">
          <template #body="{ data }">
            <div class="row-actions">
              <Button v-tooltip.top="'查看派發'" icon="pi pi-eye" text severity="secondary" aria-label="查看派發" @click="openDetail(data)" />
              <Button v-tooltip.top="'查看審核'" icon="pi pi-shield" text severity="secondary" aria-label="查看審核" />
            </div>
          </template>
        </Column>
      </DataTable>
    </SectionCard>

    <Dialog v-model:visible="detailVisible" modal dismissable-mask header="派發紀錄詳情" class="entity-dialog">
      <div v-if="selectedPayout" class="entity-dialog-body">
        <section class="dialog-section">
          <h3>派發摘要</h3>
          <div class="detail-grid dialog-detail-grid">
            <div><span>派發單號</span><strong>{{ selectedPayout.id }}</strong></div>
            <div><span>獎池</span><strong>{{ selectedPayout.jackpot }}</strong></div>
            <div><span>商戶</span><strong>{{ selectedPayout.merchant }}</strong></div>
            <div><span>遊戲</span><strong>{{ selectedPayout.game }}</strong></div>
            <div><span>玩家 ID</span><SensitiveValue :value="selectedPayout.playerId" /></div>
            <div><span>關聯注單</span><strong>{{ selectedPayout.orderId }}</strong></div>
            <div><span>派發金額</span><CurrencyAmount :value="selectedPayout.payoutAmount" /></div>
            <div><span>派發時間</span><strong>{{ selectedPayout.payoutAt }}</strong></div>
          </div>
        </section>

        <section class="dialog-section">
          <h3>審核與交易</h3>
          <div class="detail-grid dialog-detail-grid">
            <div><span>派發狀態</span><StatusTag :value="selectedPayout.status" /></div>
            <div><span>審核狀態</span><StatusTag :value="selectedPayout.reviewStatus" /></div>
            <div><span>審核人</span><strong>{{ selectedPayout.reviewer }}</strong></div>
            <div><span>錢包交易</span><SensitiveValue :value="selectedPayout.walletTxId" /></div>
            <div class="detail-field-wide"><span>備註</span><strong>{{ selectedPayout.note }}</strong></div>
          </div>
        </section>
      </div>

      <template #footer>
        <div class="dialog-footer-actions">
          <Button label="關閉" severity="secondary" outlined @click="detailVisible = false" />
          <Button label="查看注單" icon="pi pi-receipt" severity="secondary" outlined />
          <Button label="查看交易" icon="pi pi-wallet" />
        </div>
      </template>
    </Dialog>
  </div>
</template>
