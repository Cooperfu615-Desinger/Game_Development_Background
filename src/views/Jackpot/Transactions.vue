<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Badge from 'primevue/badge';
import Dialog from 'primevue/dialog';
import SectionCard from '@/components/ui/SectionCard.vue';
import StatusTag from '@/components/ui/StatusTag.vue';
import CurrencyAmount from '@/components/ui/CurrencyAmount.vue';
import DateTimeRangeField from '@/components/ui/DateTimeRangeField.vue';
import SensitiveValue from '@/components/ui/SensitiveValue.vue';
import SummaryCardGrid from '@/components/ui/SummaryCardGrid.vue';
import FilterCard from '@/components/ui/FilterCard.vue';

type JackpotTransactionRow = {
  id: string;
  jackpot: string;
  merchant: string;
  game: string;
  type: string;
  direction: 'in' | 'out';
  amount: string;
  currency: string;
  balanceBefore: string;
  balanceAfter: string;
  relatedNo: string;
  operator: string;
  status: string;
  reconciled: string;
  occurredAt: string;
  reason: string;
};

const filters = reactive({
  keyword: '',
  jackpot: '全部獎池',
  merchant: '全部商戶',
  type: '全部類型',
  currency: '全部幣別',
  occurredAt: [null, null] as [Date | null, Date | null]
});

const selectedTransaction = ref<JackpotTransactionRow | null>(null);
const detailVisible = ref(false);

const transactionRows = reactive<JackpotTransactionRow[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await fetch('/api/jackpot/v2/transactions');
    transactionRows.splice(0, transactionRows.length, ...await res.json());
  } finally {
    loading.value = false;
  }
});

const jackpotOptions = computed(() => ['全部獎池', ...Array.from(new Set(transactionRows.map((row) => row.jackpot)))]);
const merchantOptions = computed(() => ['全部商戶', ...Array.from(new Set(transactionRows.map((row) => row.merchant)))]);
const typeOptions = computed(() => ['全部類型', ...Array.from(new Set(transactionRows.map((row) => row.type)))]);
const currencyOptions = ['全部幣別', 'USDT', 'USD', 'TWD'];

const summaryCards = computed(() => {
  const inCount = transactionRows.filter((row) => row.direction === 'in').length;
  const outCount = transactionRows.filter((row) => row.direction === 'out').length;
  const pending = transactionRows.filter((row) => row.reconciled === '待審核').length;

  return [
    { label: '流水筆數', value: String(transactionRows.length), helper: `入池 ${inCount}，出池 ${outCount}` },
    { label: '待覆核', value: String(pending), helper: '人工調整與回補需保留審核' },
    { label: '流水類型', value: String(typeOptions.value.length - 1), helper: '累積 / 派發 / 回補 / 調整' },
    { label: '資料規則', value: '不可刪除', helper: '流水為獎池對帳依據' }
  ];
});

const flowSummary = computed(() => {
  const incoming = transactionRows.filter((row) => row.direction === 'in');
  const outgoing = transactionRows.filter((row) => row.direction === 'out');

  return [
    { label: '入池筆數', value: incoming.length, tone: 'success' },
    { label: '出池筆數', value: outgoing.length, tone: 'danger' },
    { label: '人工處理', value: transactionRows.filter((row) => row.operator !== 'System').length, tone: 'warn' }
  ];
});

function resetFilters() {
  filters.keyword = '';
  filters.jackpot = '全部獎池';
  filters.merchant = '全部商戶';
  filters.type = '全部類型';
  filters.currency = '全部幣別';
  filters.occurredAt = [null, null];
}

function openDetail(row: JackpotTransactionRow) {
  selectedTransaction.value = row;
  detailVisible.value = true;
}
</script>

<template>
  <div class="page-stack jackpot-transactions-page">
    <SummaryCardGrid :cards="summaryCards" />

    <SectionCard>
      <template #header>
        <div class="dialog-title-block">
          <h2>流水方向</h2>
          <p>先區分入池與出池，再追蹤人工處理與覆核狀態。</p>
        </div>
      </template>
      <div class="jackpot-flow-grid">
        <article v-for="item in flowSummary" :key="item.label" class="jackpot-flow-card" :class="`jackpot-flow-card--${item.tone}`">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </article>
      </div>
    </SectionCard>

    <FilterCard title="查詢條件" description="查詢獎池累積、派發、回補與人工調整流水。">

      <div class="jackpot-filter-grid">
        <div class="field jackpot-filter-keyword">
          <label>關鍵字</label>
          <InputText v-model="filters.keyword" placeholder="輸入流水單號、關聯單號或操作人" fluid />
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
          <label>異動類型</label>
          <Select v-model="filters.type" :options="typeOptions" fluid />
        </div>
        <div class="field">
          <label>幣別</label>
          <Select v-model="filters.currency" :options="currencyOptions" fluid />
        </div>
        <DateTimeRangeField
          class="jackpot-date-range"
          :model-value="filters.occurredAt"
          @update:model-value="filters.occurredAt = $event"
        />
        <div class="jackpot-filter-actions">
          <Button label="查詢" icon="pi pi-search" />
          <Button label="重置" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" />
        </div>
      </div>
    </FilterCard>

    <div class="agent-command-bar">
      <div>
        <span class="table-count"><Badge :value="transactionRows.length" severity="info" /> 筆流水</span>
        <p>獎池流水不可硬刪除；正式環境人工回補、扣減與比例調整需送審。</p>
      </div>
      <div class="agent-command-actions">
        <Button label="匯出" icon="pi pi-download" severity="secondary" outlined />
      </div>
    </div>

    <SectionCard class="merchant-table-card jackpot-table-card">
      <DataTable
        :value="transactionRows"
        :loading="loading"
        scrollable
        paginator
        :rows="10"
        :rows-per-page-options="[5, 10, 20, 50, 100]"
        paginator-template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
        current-page-report-template="{first}-{last} / {totalRecords}"
        data-key="id"
        table-style="min-width: 1460px"
      >
        <Column field="id" header="流水單號" frozen style="width: 180px; min-width: 180px">
          <template #body="{ data }">
            <strong class="linkish" @click="openDetail(data)">{{ data.id }}</strong>
          </template>
        </Column>
        <Column field="jackpot" header="獎池" style="width: 140px; min-width: 140px" />
        <Column field="merchant" header="商戶 / 遊戲" style="width: 156px; min-width: 156px">
          <template #body="{ data }">
            <strong class="agent-primary-text">{{ data.merchant }}</strong>
            <small class="agent-secondary-text">{{ data.game }}</small>
          </template>
        </Column>
        <Column field="type" header="異動類型" style="width: 112px; min-width: 112px">
          <template #body="{ data }">
            <Tag :value="data.type" severity="info" />
          </template>
        </Column>
        <Column field="direction" header="方向" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 92px; min-width: 92px">
          <template #body="{ data }">
            <Tag :value="data.direction === 'in' ? '入池' : '出池'" :severity="data.direction === 'in' ? 'success' : 'danger'" />
          </template>
        </Column>
        <Column field="amount" header="異動金額" header-class="agent-table-cell-right" body-class="agent-table-cell-right" style="width: 132px; min-width: 132px">
          <template #body="{ data }">
            <CurrencyAmount :value="data.amount" :negative="data.direction === 'out'" />
          </template>
        </Column>
        <Column field="balanceBefore" header="異動前" header-class="agent-table-cell-right" body-class="agent-table-cell-right" style="width: 144px; min-width: 144px">
          <template #body="{ data }">
            <CurrencyAmount :value="data.balanceBefore" />
          </template>
        </Column>
        <Column field="balanceAfter" header="異動後" header-class="agent-table-cell-right" body-class="agent-table-cell-right" style="width: 144px; min-width: 144px">
          <template #body="{ data }">
            <CurrencyAmount :value="data.balanceAfter" />
          </template>
        </Column>
        <Column field="relatedNo" header="關聯單號" style="width: 160px; min-width: 160px" />
        <Column field="operator" header="操作人" style="width: 120px; min-width: 120px" />
        <Column field="status" header="狀態" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 104px; min-width: 104px">
          <template #body="{ data }">
            <StatusTag :value="data.status" />
          </template>
        </Column>
        <Column field="reconciled" header="對帳" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 104px; min-width: 104px">
          <template #body="{ data }">
            <StatusTag :value="data.reconciled" />
          </template>
        </Column>
        <Column field="occurredAt" header="異動時間" style="width: 168px; min-width: 168px" />
        <Column header="操作" frozen align-frozen="right" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 88px; min-width: 88px">
          <template #body="{ data }">
            <div class="row-actions">
              <Button v-tooltip.top="'查看流水'" icon="pi pi-eye" text severity="secondary" aria-label="查看流水" @click="openDetail(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </SectionCard>

    <Dialog v-model:visible="detailVisible" modal dismissable-mask header="獎池流水詳情" class="entity-dialog">
      <div v-if="selectedTransaction" class="entity-dialog-body">
        <section class="dialog-section">
          <h3>流水摘要</h3>
          <div class="detail-grid dialog-detail-grid">
            <div><span>流水單號</span><strong>{{ selectedTransaction.id }}</strong></div>
            <div><span>獎池</span><strong>{{ selectedTransaction.jackpot }}</strong></div>
            <div><span>異動類型</span><strong>{{ selectedTransaction.type }}</strong></div>
            <div><span>方向</span><StatusTag :value="selectedTransaction.direction === 'in' ? '已入帳' : '已扣帳'" /></div>
            <div><span>商戶</span><strong>{{ selectedTransaction.merchant }}</strong></div>
            <div><span>遊戲</span><strong>{{ selectedTransaction.game }}</strong></div>
            <div><span>關聯單號</span><SensitiveValue :value="selectedTransaction.relatedNo" /></div>
            <div><span>異動時間</span><strong>{{ selectedTransaction.occurredAt }}</strong></div>
          </div>
        </section>

        <section class="dialog-section">
          <h3>金額與對帳</h3>
          <div class="detail-grid dialog-detail-grid">
            <div><span>異動金額</span><CurrencyAmount :value="selectedTransaction.amount" :negative="selectedTransaction.direction === 'out'" /></div>
            <div><span>異動前餘額</span><CurrencyAmount :value="selectedTransaction.balanceBefore" /></div>
            <div><span>異動後餘額</span><CurrencyAmount :value="selectedTransaction.balanceAfter" /></div>
            <div><span>幣別</span><strong>{{ selectedTransaction.currency }}</strong></div>
            <div><span>狀態</span><StatusTag :value="selectedTransaction.status" /></div>
            <div><span>對帳狀態</span><StatusTag :value="selectedTransaction.reconciled" /></div>
            <div><span>操作人</span><strong>{{ selectedTransaction.operator }}</strong></div>
            <div class="detail-field-wide"><span>異動原因</span><strong>{{ selectedTransaction.reason }}</strong></div>
          </div>
        </section>
      </div>

      <template #footer>
        <div class="dialog-footer-actions">
          <Button label="關閉" severity="secondary" outlined @click="detailVisible = false" />
          <Button label="查看關聯單" icon="pi pi-link" severity="secondary" outlined />
          <Button label="匯出紀錄" icon="pi pi-download" />
        </div>
      </template>
    </Dialog>
  </div>
</template>
