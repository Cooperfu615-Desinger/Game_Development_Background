<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
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

type TransactionRow = {
  id: string;
  orderId: string;
  merchant: string;
  playerId: string;
  type: string;
  amount: string;
  transactionCurrency: string;
  walletCurrency: string;
  status: string;
  apiCode: string;
  retryCount: number;
  time: string;
  nextRetryAt: string;
  walletMode: string;
  request: string;
  response: string;
  note: string;
};

const filters = reactive({
  transactionId: '',
  orderId: '',
  merchant: '全部商戶',
  playerId: '',
  type: '全部類型',
  status: '全部狀態',
  currency: '全部幣別',
  apiCode: '全部回應碼',
  retrying: '全部',
  time: [null, null] as [Date | null, Date | null]
});

const selectedTransaction = ref<TransactionRow | null>(null);
const detailVisible = ref(false);
const resendVisible = ref(false);
const manualVisible = ref(false);
const manualReason = ref('');

const transactionRows = reactive<TransactionRow[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await fetch('/api/transactions/v2/list');
    const data: TransactionRow[] = await res.json();
    transactionRows.splice(0, transactionRows.length, ...data);
  } finally {
    loading.value = false;
  }
});

const merchantOptions = computed(() => ['全部商戶', ...Array.from(new Set(transactionRows.map((row) => row.merchant)))]);
const typeOptions = ['全部類型', '扣款', '派彩', '轉入', '轉出', '退款', '回補'];
const statusOptions = ['全部狀態', '已完成', '重試中', '人工處理', '失敗'];
const currencyOptions = ['全部幣別', 'USDT', 'USD', 'TWD'];
const apiCodeOptions = ['全部回應碼', '200', '409', '500', '504'];
const retryOptions = ['全部', '重試中', '無重試'];

const summaryCards = computed(() => {
  const retrying = transactionRows.filter((row) => row.status === '重試中').length;
  const manual = transactionRows.filter((row) => row.status === '人工處理').length;
  const success = transactionRows.filter((row) => row.status === '已完成').length;

  return [
    { label: '交易總數', value: String(transactionRows.length), helper: '扣款、派彩、轉入轉出與回補交易' },
    { label: '成功交易', value: String(success), helper: 'API 回應 200 並完成回寫' },
    { label: '重試中', value: String(retrying), helper: '依錢包重試策略排程' },
    { label: '人工處理', value: String(manual), helper: '停止自動重試，需營運確認' }
  ];
});

function resetFilters() {
  filters.transactionId = '';
  filters.orderId = '';
  filters.merchant = '全部商戶';
  filters.playerId = '';
  filters.type = '全部類型';
  filters.status = '全部狀態';
  filters.currency = '全部幣別';
  filters.apiCode = '全部回應碼';
  filters.retrying = '全部';
  filters.time = [null, null];
}

function openDetail(row: TransactionRow) {
  selectedTransaction.value = row;
  detailVisible.value = true;
}

function openResend(row: TransactionRow) {
  selectedTransaction.value = row;
  resendVisible.value = true;
}

function openManual(row: TransactionRow) {
  selectedTransaction.value = row;
  manualReason.value = '';
  manualVisible.value = true;
}
</script>

<template>
  <div class="page-stack transactions-page">
    <div class="agent-summary-grid">
      <article v-for="item in summaryCards" :key="item.label" class="agent-summary-card">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <small>{{ item.helper }}</small>
      </article>
    </div>

    <SectionCard class="merchant-filter-card">
      <template #header>
        <div class="dialog-title-block">
          <h2>查詢條件</h2>
        <p>查詢錢包交易、注單關聯、轉帳錢包進出、API 回應碼、重試與人工處理狀態。</p>
        </div>
      </template>

      <div class="trade-filter-grid">
        <div class="field trade-filter-keyword">
          <label>交易單號</label>
          <InputText v-model="filters.transactionId" placeholder="輸入交易單號" fluid />
        </div>
        <div class="field trade-filter-keyword">
          <label>注單號</label>
          <InputText v-model="filters.orderId" placeholder="輸入注單號" fluid />
        </div>
        <div class="field">
          <label>商戶</label>
          <Select v-model="filters.merchant" :options="merchantOptions" fluid />
        </div>
        <div class="field">
          <label>玩家 ID</label>
          <InputText v-model="filters.playerId" placeholder="玩家 ID" fluid />
        </div>
        <div class="field">
          <label>交易類型</label>
          <Select v-model="filters.type" :options="typeOptions" fluid />
        </div>
        <div class="field">
          <label>交易狀態</label>
          <Select v-model="filters.status" :options="statusOptions" fluid />
        </div>
        <div class="field">
          <label>幣別</label>
          <Select v-model="filters.currency" :options="currencyOptions" fluid />
        </div>
        <div class="field">
          <label>API 回應碼</label>
          <Select v-model="filters.apiCode" :options="apiCodeOptions" fluid />
        </div>
        <div class="field">
          <label>是否重試中</label>
          <Select v-model="filters.retrying" :options="retryOptions" fluid />
        </div>
        <DateTimeRangeField v-model="filters.time" class="trade-date-range" />
        <div class="trade-filter-actions">
          <Button label="查詢" icon="pi pi-search" />
          <Button label="重置" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" />
        </div>
      </div>
    </SectionCard>

    <div class="agent-command-bar">
      <div>
        <span class="table-count"><Badge :value="transactionRows.length" severity="info" /> 筆交易</span>
        <p>交易不可刪除或直接改寫；重送、人工標記與 API Trace 都會保留操作紀錄。</p>
      </div>
      <div class="agent-command-actions">
        <Button label="匯出" icon="pi pi-download" severity="secondary" outlined />
      </div>
    </div>

    <SectionCard class="merchant-table-card trade-table-card">
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
        table-style="min-width: 1500px"
      >
        <Column field="id" header="交易單號" frozen style="width: 188px; min-width: 188px">
          <template #body="{ data }">
            <strong class="linkish" @click="openDetail(data)">{{ data.id }}</strong>
          </template>
        </Column>
        <Column field="orderId" header="注單號" style="width: 172px; min-width: 172px">
          <template #body="{ data }">
            <strong class="agent-primary-text">{{ data.orderId }}</strong>
          </template>
        </Column>
        <Column field="merchant" header="商戶" style="width: 140px; min-width: 140px" />
        <Column field="playerId" header="玩家 ID" style="width: 140px; min-width: 140px">
          <template #body="{ data }">
            <SensitiveValue :value="data.playerId" />
          </template>
        </Column>
        <Column field="type" header="交易類型" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 104px; min-width: 104px">
          <template #body="{ data }">
            <Tag :value="data.type" severity="info" />
          </template>
        </Column>
        <Column field="amount" header="交易金額" header-class="agent-table-cell-right" body-class="agent-table-cell-right" style="width: 132px; min-width: 132px">
          <template #body="{ data }">
            <CurrencyAmount :value="data.amount" :negative="data.amount.includes('-')" />
          </template>
        </Column>
        <Column field="transactionCurrency" header="交易幣別" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 104px; min-width: 104px" />
        <Column field="walletCurrency" header="錢包幣別" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 104px; min-width: 104px" />
        <Column field="status" header="狀態" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 112px; min-width: 112px">
          <template #body="{ data }">
            <StatusTag :value="data.status" />
          </template>
        </Column>
        <Column field="apiCode" header="API 回應碼" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 112px; min-width: 112px">
          <template #body="{ data }">
            <StatusTag :value="data.apiCode === '200' ? '正常' : `錯誤 ${data.apiCode}`" />
          </template>
        </Column>
        <Column field="retryCount" header="重試次數" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 100px; min-width: 100px">
          <template #body="{ data }">
            <strong>{{ data.retryCount }}</strong>
          </template>
        </Column>
        <Column field="time" header="時間" style="width: 168px; min-width: 168px" />
        <Column header="操作" frozen align-frozen="right" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 176px; min-width: 176px">
          <template #body="{ data }">
            <div class="row-actions">
              <Button v-tooltip.top="'查看交易'" icon="pi pi-eye" text severity="secondary" aria-label="查看交易" @click="openDetail(data)" />
              <Button v-tooltip.top="'重送交易'" icon="pi pi-sync" text severity="secondary" aria-label="重送交易" @click="openResend(data)" />
              <Button v-tooltip.top="'標記人工處理'" icon="pi pi-user-edit" text severity="secondary" aria-label="標記人工處理" @click="openManual(data)" />
              <Button v-tooltip.top="'查看注單'" icon="pi pi-ticket" text severity="secondary" aria-label="查看注單" />
            </div>
          </template>
        </Column>
      </DataTable>
    </SectionCard>

    <Dialog v-model:visible="detailVisible" modal dismissable-mask header="交易詳情" class="entity-dialog">
      <div v-if="selectedTransaction" class="entity-dialog-body">
        <section class="dialog-section">
          <h3>交易摘要</h3>
          <div class="detail-grid dialog-detail-grid">
            <div><span>交易單號</span><strong>{{ selectedTransaction.id }}</strong></div>
            <div><span>注單號</span><strong>{{ selectedTransaction.orderId }}</strong></div>
            <div><span>商戶</span><strong>{{ selectedTransaction.merchant }}</strong></div>
            <div><span>玩家 ID</span><SensitiveValue :value="selectedTransaction.playerId" /></div>
            <div><span>交易類型</span><strong>{{ selectedTransaction.type }}</strong></div>
            <div><span>交易金額</span><CurrencyAmount :value="selectedTransaction.amount" :negative="selectedTransaction.amount.includes('-')" /></div>
            <div><span>交易幣別</span><strong>{{ selectedTransaction.transactionCurrency }}</strong></div>
            <div><span>錢包幣別</span><strong>{{ selectedTransaction.walletCurrency }}</strong></div>
            <div><span>狀態</span><StatusTag :value="selectedTransaction.status" /></div>
            <div><span>API 回應碼</span><strong>{{ selectedTransaction.apiCode }}</strong></div>
            <div><span>重試次數</span><strong>{{ selectedTransaction.retryCount }}</strong></div>
            <div><span>下一次重試</span><strong>{{ selectedTransaction.nextRetryAt }}</strong></div>
          </div>
        </section>

        <section class="dialog-section">
          <h3>API Trace</h3>
          <div class="detail-grid dialog-detail-grid">
            <div class="detail-field-wide">
              <span>API Request</span>
              <SensitiveValue :value="selectedTransaction.request" />
            </div>
            <div class="detail-field-wide">
              <span>API Response</span>
              <SensitiveValue :value="selectedTransaction.response" />
            </div>
            <div><span>錢包模式</span><strong>{{ selectedTransaction.walletMode }}</strong></div>
            <div><span>交易時間</span><strong>{{ selectedTransaction.time }}</strong></div>
            <div class="detail-field-wide"><span>處理備註</span><strong>{{ selectedTransaction.note }}</strong></div>
          </div>
        </section>
      </div>

      <template #footer>
        <div class="dialog-footer-actions">
          <Button label="關閉" severity="secondary" outlined @click="detailVisible = false" />
          <Button label="重送交易" icon="pi pi-sync" severity="secondary" outlined @click="selectedTransaction && openResend(selectedTransaction)" />
          <Button label="人工處理" icon="pi pi-user-edit" @click="selectedTransaction && openManual(selectedTransaction)" />
        </div>
      </template>
    </Dialog>

    <Dialog v-model:visible="resendVisible" modal dismissable-mask header="重送交易確認" class="confirm-dialog">
      <div v-if="selectedTransaction" class="confirm-dialog-body">
        <i class="pi pi-sync" />
        <div>
          <h3>確認重送 {{ selectedTransaction.id }}？</h3>
          <p>重送會重新呼叫商戶錢包 API，正式環境必須由後端檢查冪等鍵、交易狀態與操作權限。</p>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer-actions">
          <Button label="取消" severity="secondary" outlined @click="resendVisible = false" />
          <Button label="確認重送" icon="pi pi-check" @click="resendVisible = false" />
        </div>
      </template>
    </Dialog>

    <Dialog v-model:visible="manualVisible" modal dismissable-mask header="標記人工處理" class="confirm-dialog">
      <div v-if="selectedTransaction" class="confirm-dialog-body">
        <i class="pi pi-user-edit" />
        <div>
          <h3>將 {{ selectedTransaction.id }} 標記為人工處理？</h3>
          <p>標記後會停止自動重試，並保留給營運或技術人員接手處理。</p>
        </div>
      </div>
      <div class="field">
        <label>處理原因</label>
        <Textarea v-model="manualReason" rows="3" auto-resize placeholder="輸入人工處理原因、錢包回覆或對帳說明" fluid />
      </div>
      <template #footer>
        <div class="dialog-footer-actions">
          <Button label="取消" severity="secondary" outlined @click="manualVisible = false" />
          <Button label="確認標記" icon="pi pi-check" @click="manualVisible = false" />
        </div>
      </template>
    </Dialog>
  </div>
</template>
