<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue';
import { api } from '@/services/apiClient';
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
import SummaryCardGrid from '@/components/ui/SummaryCardGrid.vue';
import FilterCard from '@/components/ui/FilterCard.vue';

type AbnormalTransactionRow = {
  caseId: string;
  transactionId: string;
  orderId: string;
  merchant: string;
  playerId: string;
  type: string;
  abnormalType: string;
  amount: string;
  currency: string;
  apiCode: string;
  retryCount: number;
  status: string;
  assignee: string;
  occurredAt: string;
  lastActionAt: string;
  request: string;
  response: string;
  reason: string;
  suggestion: string;
};

const filters = reactive({
  keyword: '',
  merchant: '全部商戶',
  type: '全部類型',
  abnormalType: '全部異常',
  status: '全部狀態',
  apiCode: '全部回應碼',
  assignee: '全部處理人',
  occurredAt: [null, null] as [Date | null, Date | null]
});

const selectedCase = ref<AbnormalTransactionRow | null>(null);
const detailVisible = ref(false);
const resendVisible = ref(false);
const closeVisible = ref(false);
const closeNote = ref('');

const abnormalRows = reactive<AbnormalTransactionRow[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const data = await api.get<AbnormalTransactionRow[]>('/api/transactions/v2/abnormal');
    abnormalRows.splice(0, abnormalRows.length, ...data);
  } finally {
    loading.value = false;
  }
});

const merchantOptions = computed(() => ['全部商戶', ...Array.from(new Set(abnormalRows.map((row) => row.merchant)))]);
const typeOptions = ['全部類型', '扣款', '派彩', '轉入', '轉出', '退款', '回補'];
const abnormalTypeOptions = ['全部異常', '錢包逾時', '重複交易', '轉帳差異', '餘額不足', 'API 回應異常'];
const statusOptions = ['全部狀態', '待處理', '重試中', '待確認', '人工處理', '已結案'];
const apiCodeOptions = ['全部回應碼', '200', '402', '409', '500', '504'];
const assigneeOptions = computed(() => ['全部處理人', ...Array.from(new Set(abnormalRows.map((row) => row.assignee)))]);

const summaryCards = computed(() => {
  const retrying = abnormalRows.filter((row) => row.status === '重試中').length;
  const manual = abnormalRows.filter((row) => row.status === '人工處理').length;
  const transferDiff = abnormalRows.filter((row) => row.abnormalType === '轉帳差異').length;

  return [
    { label: '異常案件', value: String(abnormalRows.length), helper: '錢包與 API 異常需留痕處理' },
    { label: '重試中', value: String(retrying), helper: '系統仍會依策略重送' },
    { label: '人工處理', value: String(manual), helper: '已停止自動重送' },
    { label: '轉帳差異', value: String(transferDiff), helper: '轉入轉出與錢包入帳差異' }
  ];
});

function resetFilters() {
  filters.keyword = '';
  filters.merchant = '全部商戶';
  filters.type = '全部類型';
  filters.abnormalType = '全部異常';
  filters.status = '全部狀態';
  filters.apiCode = '全部回應碼';
  filters.assignee = '全部處理人';
  filters.occurredAt = [null, null];
}

function openDetail(row: AbnormalTransactionRow) {
  selectedCase.value = row;
  detailVisible.value = true;
}

function openResend(row: AbnormalTransactionRow) {
  selectedCase.value = row;
  resendVisible.value = true;
}

function openClose(row: AbnormalTransactionRow) {
  selectedCase.value = row;
  closeNote.value = '';
  closeVisible.value = true;
}
</script>

<template>
  <div class="page-stack abnormal-transactions-page">
    <SummaryCardGrid :cards="summaryCards" />

    <FilterCard title="查詢條件" description="查詢錢包逾時、重複交易、轉帳差異、API 回應異常與處理狀態。">

      <div class="trade-filter-grid">
        <div class="field trade-filter-keyword">
          <label>關鍵字</label>
          <InputText v-model="filters.keyword" placeholder="案件、交易、注單或玩家 ID" fluid />
        </div>
        <div class="field">
          <label>商戶</label>
          <Select v-model="filters.merchant" :options="merchantOptions" fluid />
        </div>
        <div class="field">
          <label>交易類型</label>
          <Select v-model="filters.type" :options="typeOptions" fluid />
        </div>
        <div class="field">
          <label>異常類型</label>
          <Select v-model="filters.abnormalType" :options="abnormalTypeOptions" fluid />
        </div>
        <div class="field">
          <label>狀態</label>
          <Select v-model="filters.status" :options="statusOptions" fluid />
        </div>
        <div class="field">
          <label>API 回應碼</label>
          <Select v-model="filters.apiCode" :options="apiCodeOptions" fluid />
        </div>
        <div class="field">
          <label>處理人</label>
          <Select v-model="filters.assignee" :options="assigneeOptions" fluid />
        </div>
        <DateTimeRangeField v-model="filters.occurredAt" class="trade-date-range" />
        <div class="trade-filter-actions">
          <Button label="查詢" icon="pi pi-search" />
          <Button label="重置" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" />
        </div>
      </div>
    </FilterCard>

    <div class="agent-command-bar">
      <div>
        <span class="table-count"><Badge :value="abnormalRows.length" severity="info" /> 筆異常交易</span>
        <p>異常交易不可直接改寫原始資料；重送、人工處理與結案都必須留下 API Trace 與操作紀錄。</p>
      </div>
      <div class="agent-command-actions">
        <Button label="匯出" icon="pi pi-download" severity="secondary" outlined />
      </div>
    </div>

    <SectionCard class="merchant-table-card trade-table-card">
      <DataTable
        :value="abnormalRows"
        :loading="loading"
        scrollable
        paginator
        :rows="10"
        :rows-per-page-options="[5, 10, 20, 50, 100]"
        paginator-template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
        current-page-report-template="{first}-{last} / {totalRecords}"
        data-key="caseId"
        table-style="min-width: 1580px"
      >
        <Column field="caseId" header="案件編號" frozen style="width: 156px; min-width: 156px">
          <template #body="{ data }">
            <strong class="linkish" @click="openDetail(data)">{{ data.caseId }}</strong>
          </template>
        </Column>
        <Column field="transactionId" header="交易單號" style="width: 188px; min-width: 188px">
          <template #body="{ data }">
            <strong class="agent-primary-text">{{ data.transactionId }}</strong>
            <small class="agent-secondary-text">{{ data.orderId }}</small>
          </template>
        </Column>
        <Column field="merchant" header="商戶" style="width: 132px; min-width: 132px" />
        <Column field="playerId" header="玩家 ID" style="width: 132px; min-width: 132px">
          <template #body="{ data }">
            <SensitiveValue :value="data.playerId" />
          </template>
        </Column>
        <Column field="type" header="交易類型" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 104px; min-width: 104px">
          <template #body="{ data }">
            <Tag :value="data.type" severity="info" />
          </template>
        </Column>
        <Column field="abnormalType" header="異常類型" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 116px; min-width: 116px">
          <template #body="{ data }">
            <StatusTag :value="data.abnormalType" />
          </template>
        </Column>
        <Column field="amount" header="交易金額" header-class="agent-table-cell-right" body-class="agent-table-cell-right" style="width: 132px; min-width: 132px">
          <template #body="{ data }">
            <CurrencyAmount :value="data.amount" :negative="data.amount.includes('-')" />
          </template>
        </Column>
        <Column field="apiCode" header="API 回應碼" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 112px; min-width: 112px">
          <template #body="{ data }">
            <StatusTag :value="data.apiCode === '200' ? '正常' : `錯誤 ${data.apiCode}`" />
          </template>
        </Column>
        <Column field="retryCount" header="重試" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 82px; min-width: 82px">
          <template #body="{ data }">
            <strong>{{ data.retryCount }}</strong>
          </template>
        </Column>
        <Column field="status" header="狀態" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 112px; min-width: 112px">
          <template #body="{ data }">
            <StatusTag :value="data.status" />
          </template>
        </Column>
        <Column field="assignee" header="處理人" style="width: 112px; min-width: 112px" />
        <Column field="occurredAt" header="發生時間" style="width: 168px; min-width: 168px" />
        <Column header="操作" frozen align-frozen="right" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 148px; min-width: 148px">
          <template #body="{ data }">
            <div class="row-actions">
              <Button v-tooltip.top="'查看案件'" icon="pi pi-eye" text severity="secondary" aria-label="查看案件" @click="openDetail(data)" />
              <Button v-tooltip.top="'重送交易'" icon="pi pi-sync" text severity="secondary" aria-label="重送交易" @click="openResend(data)" />
              <Button v-tooltip.top="'結案'" icon="pi pi-check-circle" text severity="secondary" aria-label="結案" @click="openClose(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </SectionCard>

    <Dialog v-model:visible="detailVisible" modal dismissable-mask header="異常交易詳情" class="entity-dialog">
      <div v-if="selectedCase" class="entity-dialog-body">
        <section class="dialog-section">
          <h3>案件摘要</h3>
          <div class="detail-grid dialog-detail-grid">
            <div><span>案件編號</span><strong>{{ selectedCase.caseId }}</strong></div>
            <div><span>交易單號</span><strong>{{ selectedCase.transactionId }}</strong></div>
            <div><span>注單號</span><strong>{{ selectedCase.orderId }}</strong></div>
            <div><span>商戶</span><strong>{{ selectedCase.merchant }}</strong></div>
            <div><span>玩家 ID</span><SensitiveValue :value="selectedCase.playerId" /></div>
            <div><span>交易類型</span><strong>{{ selectedCase.type }}</strong></div>
            <div><span>異常類型</span><StatusTag :value="selectedCase.abnormalType" /></div>
            <div><span>狀態</span><StatusTag :value="selectedCase.status" /></div>
            <div><span>交易金額</span><CurrencyAmount :value="selectedCase.amount" :negative="selectedCase.amount.includes('-')" /></div>
            <div><span>API 回應碼</span><strong>{{ selectedCase.apiCode }}</strong></div>
            <div><span>重試次數</span><strong>{{ selectedCase.retryCount }}</strong></div>
            <div><span>處理人</span><strong>{{ selectedCase.assignee }}</strong></div>
          </div>
        </section>

        <section class="dialog-section">
          <h3>API Trace 與處理建議</h3>
          <div class="detail-grid dialog-detail-grid">
            <div class="detail-field-wide"><span>API Request</span><SensitiveValue :value="selectedCase.request" /></div>
            <div class="detail-field-wide"><span>API Response</span><SensitiveValue :value="selectedCase.response" /></div>
            <div class="detail-field-wide"><span>異常原因</span><strong>{{ selectedCase.reason }}</strong></div>
            <div class="detail-field-wide"><span>處理建議</span><strong>{{ selectedCase.suggestion }}</strong></div>
            <div><span>發生時間</span><strong>{{ selectedCase.occurredAt }}</strong></div>
            <div><span>最後處理時間</span><strong>{{ selectedCase.lastActionAt }}</strong></div>
          </div>
        </section>
      </div>

      <template #footer>
        <div class="dialog-footer-actions">
          <Button label="關閉" severity="secondary" outlined @click="detailVisible = false" />
          <Button label="重送交易" icon="pi pi-sync" severity="secondary" outlined @click="selectedCase && openResend(selectedCase)" />
          <Button label="結案" icon="pi pi-check" @click="selectedCase && openClose(selectedCase)" />
        </div>
      </template>
    </Dialog>

    <Dialog v-model:visible="resendVisible" modal dismissable-mask header="重送交易確認" class="confirm-dialog">
      <div v-if="selectedCase" class="confirm-dialog-body">
        <i class="pi pi-sync" />
        <div>
          <h3>確認重送 {{ selectedCase.transactionId }}？</h3>
          <p>重送前需確認冪等鍵、商戶錢包狀態與目前案件狀態。正式環境會由後端再次檢查權限與交易狀態。</p>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer-actions">
          <Button label="取消" severity="secondary" outlined @click="resendVisible = false" />
          <Button label="確認重送" icon="pi pi-check" @click="resendVisible = false" />
        </div>
      </template>
    </Dialog>

    <Dialog v-model:visible="closeVisible" modal dismissable-mask header="異常交易結案" class="confirm-dialog">
      <div v-if="selectedCase" class="confirm-dialog-body">
        <i class="pi pi-check-circle" />
        <div>
          <h3>將 {{ selectedCase.caseId }} 結案？</h3>
          <p>結案會保留目前處理結果與 API Trace，後續不可刪除，只能新增補充紀錄。</p>
        </div>
      </div>
      <div class="field">
        <label>結案說明</label>
        <Textarea v-model="closeNote" rows="3" auto-resize placeholder="輸入對帳結果、重送結果或人工處理說明" fluid />
      </div>
      <template #footer>
        <div class="dialog-footer-actions">
          <Button label="取消" severity="secondary" outlined @click="closeVisible = false" />
          <Button label="確認結案" icon="pi pi-check" @click="closeVisible = false" />
        </div>
      </template>
    </Dialog>
  </div>
</template>
