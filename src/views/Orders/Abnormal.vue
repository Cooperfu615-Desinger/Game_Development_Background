<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
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

type AbnormalOrderRow = {
  caseId: string;
  orderId: string;
  roundId: string;
  merchant: string;
  playerId: string;
  game: string;
  gameType: string;
  abnormalType: string;
  betAmount: string;
  winAmount: string;
  ggr: string;
  currency: string;
  orderStatus: string;
  processStatus: string;
  riskLevel: string;
  actionType: string;
  assignee: string;
  occurredAt: string;
  lastActionAt: string;
  playerIp: string;
  gameResult: string;
  reason: string;
  suggestion: string;
};

const filters = reactive({
  keyword: '',
  merchant: '全部商戶',
  game: '全部遊戲',
  abnormalType: '全部異常',
  processStatus: '全部狀態',
  riskLevel: '全部風險',
  actionType: '全部處理',
  occurredAt: [null, null] as [Date | null, Date | null]
});

const selectedCase = ref<AbnormalOrderRow | null>(null);
const detailVisible = ref(false);
const refundVisible = ref(false);
const makeupVisible = ref(false);
const closeVisible = ref(false);
const refundAmount = ref<number | null>(null);
const makeupAmount = ref<number | null>(null);
const processNote = ref('');

const abnormalRows = reactive<AbnormalOrderRow[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await fetch('/api/orders/v2/abnormal');
    const data: AbnormalOrderRow[] = await res.json();
    abnormalRows.splice(0, abnormalRows.length, ...data);
  } finally {
    loading.value = false;
  }
});

const merchantOptions = computed(() => ['全部商戶', ...Array.from(new Set(abnormalRows.map((row) => row.merchant)))]);
const gameOptions = computed(() => ['全部遊戲', ...Array.from(new Set(abnormalRows.map((row) => row.game)))]);
const abnormalTypeOptions = ['全部異常', '高額派彩', '派彩逾時', '結果不一致', '重複下注'];
const processStatusOptions = ['全部狀態', '待處理', '待確認', '人工處理', '已結案'];
const riskLevelOptions = ['全部風險', '高風險', '中風險', '低風險'];
const actionTypeOptions = ['全部處理', '退款', '補單', '風控覆核', '風控標記', '結案'];

const summaryCards = computed(() => {
  const pending = abnormalRows.filter((row) => ['待處理', '待確認'].includes(row.processStatus)).length;
  const reviewRequired = abnormalRows.filter((row) => ['退款', '補單'].includes(row.actionType)).length;
  const highRisk = abnormalRows.filter((row) => row.riskLevel === '高風險').length;

  return [
    { label: '異常注單', value: String(abnormalRows.length), helper: '不可改寫原始注單，只能建立處理紀錄' },
    { label: '待處理', value: String(pending), helper: '待營運或風控確認' },
    { label: '退款 / 補單', value: String(reviewRequired), helper: '正式環境需送審' },
    { label: '高風險', value: String(highRisk), helper: '高額派彩或結果不一致' }
  ];
});

function resetFilters() {
  filters.keyword = '';
  filters.merchant = '全部商戶';
  filters.game = '全部遊戲';
  filters.abnormalType = '全部異常';
  filters.processStatus = '全部狀態';
  filters.riskLevel = '全部風險';
  filters.actionType = '全部處理';
  filters.occurredAt = [null, null];
}

function openDetail(row: AbnormalOrderRow) {
  selectedCase.value = row;
  detailVisible.value = true;
}

function openRefund(row: AbnormalOrderRow) {
  selectedCase.value = row;
  refundAmount.value = null;
  processNote.value = '';
  refundVisible.value = true;
}

function openMakeup(row: AbnormalOrderRow) {
  selectedCase.value = row;
  makeupAmount.value = null;
  processNote.value = '';
  makeupVisible.value = true;
}

function openClose(row: AbnormalOrderRow) {
  selectedCase.value = row;
  processNote.value = '';
  closeVisible.value = true;
}
</script>

<template>
  <div class="page-stack abnormal-orders-page">
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
          <p>查詢異常注單、退款補單、風控覆核與處理狀態。</p>
        </div>
      </template>

      <div class="trade-filter-grid">
        <div class="field trade-filter-keyword">
          <label>關鍵字</label>
          <InputText v-model="filters.keyword" placeholder="案件、注單、局號或玩家 ID" fluid />
        </div>
        <div class="field">
          <label>商戶</label>
          <Select v-model="filters.merchant" :options="merchantOptions" fluid />
        </div>
        <div class="field">
          <label>遊戲</label>
          <Select v-model="filters.game" :options="gameOptions" fluid />
        </div>
        <div class="field">
          <label>異常類型</label>
          <Select v-model="filters.abnormalType" :options="abnormalTypeOptions" fluid />
        </div>
        <div class="field">
          <label>處理狀態</label>
          <Select v-model="filters.processStatus" :options="processStatusOptions" fluid />
        </div>
        <div class="field">
          <label>風險等級</label>
          <Select v-model="filters.riskLevel" :options="riskLevelOptions" fluid />
        </div>
        <div class="field">
          <label>處理方式</label>
          <Select v-model="filters.actionType" :options="actionTypeOptions" fluid />
        </div>
        <DateTimeRangeField v-model="filters.occurredAt" class="trade-date-range" />
        <div class="trade-filter-actions">
          <Button label="查詢" icon="pi pi-search" />
          <Button label="重置" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" />
        </div>
      </div>
    </SectionCard>

    <div class="agent-command-bar">
      <div>
        <span class="table-count"><Badge :value="abnormalRows.length" severity="info" /> 筆異常注單</span>
        <p>注單不可刪除或直接改寫；退款、補單、風控標記與結案都會留下審核與操作紀錄。</p>
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
        table-style="min-width: 1700px"
      >
        <Column field="caseId" header="案件編號" frozen style="width: 156px; min-width: 156px">
          <template #body="{ data }">
            <strong class="linkish" @click="openDetail(data)">{{ data.caseId }}</strong>
          </template>
        </Column>
        <Column field="orderId" header="注單號 / 局號" style="width: 188px; min-width: 188px">
          <template #body="{ data }">
            <strong class="agent-primary-text">{{ data.orderId }}</strong>
            <small class="agent-secondary-text">{{ data.roundId }}</small>
          </template>
        </Column>
        <Column field="merchant" header="商戶" style="width: 132px; min-width: 132px" />
        <Column field="playerId" header="玩家 ID" style="width: 132px; min-width: 132px">
          <template #body="{ data }">
            <SensitiveValue :value="data.playerId" />
          </template>
        </Column>
        <Column field="game" header="遊戲" style="width: 146px; min-width: 146px">
          <template #body="{ data }">
            <strong class="agent-primary-text">{{ data.game }}</strong>
            <small class="agent-secondary-text">{{ data.gameType }}</small>
          </template>
        </Column>
        <Column field="abnormalType" header="異常類型" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 116px; min-width: 116px">
          <template #body="{ data }">
            <StatusTag :value="data.abnormalType" />
          </template>
        </Column>
        <Column field="betAmount" header="投注金額" header-class="agent-table-cell-right" body-class="agent-table-cell-right" style="width: 122px; min-width: 122px">
          <template #body="{ data }">
            <CurrencyAmount :value="data.betAmount" />
          </template>
        </Column>
        <Column field="winAmount" header="派彩金額" header-class="agent-table-cell-right" body-class="agent-table-cell-right" style="width: 122px; min-width: 122px">
          <template #body="{ data }">
            <CurrencyAmount :value="data.winAmount" />
          </template>
        </Column>
        <Column field="ggr" header="GGR" header-class="agent-table-cell-right" body-class="agent-table-cell-right" style="width: 122px; min-width: 122px">
          <template #body="{ data }">
            <CurrencyAmount :value="data.ggr" :negative="data.ggr.includes('-')" />
          </template>
        </Column>
        <Column field="riskLevel" header="風險" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 96px; min-width: 96px">
          <template #body="{ data }">
            <StatusTag :value="data.riskLevel" />
          </template>
        </Column>
        <Column field="actionType" header="處理方式" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 104px; min-width: 104px">
          <template #body="{ data }">
            <Tag :value="data.actionType" severity="info" />
          </template>
        </Column>
        <Column field="processStatus" header="處理狀態" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 112px; min-width: 112px">
          <template #body="{ data }">
            <StatusTag :value="data.processStatus" />
          </template>
        </Column>
        <Column field="assignee" header="處理人" style="width: 112px; min-width: 112px" />
        <Column field="occurredAt" header="發生時間" style="width: 168px; min-width: 168px" />
        <Column header="操作" frozen align-frozen="right" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 172px; min-width: 172px">
          <template #body="{ data }">
            <div class="row-actions">
              <Button v-tooltip.top="'查看案件'" icon="pi pi-eye" text severity="secondary" aria-label="查看案件" @click="openDetail(data)" />
              <Button v-tooltip.top="'退款'" icon="pi pi-undo" text severity="secondary" aria-label="退款" @click="openRefund(data)" />
              <Button v-tooltip.top="'補單'" icon="pi pi-plus-circle" text severity="secondary" aria-label="補單" @click="openMakeup(data)" />
              <Button v-tooltip.top="'結案'" icon="pi pi-check-circle" text severity="secondary" aria-label="結案" @click="openClose(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </SectionCard>

    <Dialog v-model:visible="detailVisible" modal dismissable-mask header="異常注單詳情" class="entity-dialog">
      <div v-if="selectedCase" class="entity-dialog-body">
        <section class="dialog-section">
          <h3>案件摘要</h3>
          <div class="detail-grid dialog-detail-grid">
            <div><span>案件編號</span><strong>{{ selectedCase.caseId }}</strong></div>
            <div><span>注單號</span><strong>{{ selectedCase.orderId }}</strong></div>
            <div><span>局號</span><strong>{{ selectedCase.roundId }}</strong></div>
            <div><span>商戶</span><strong>{{ selectedCase.merchant }}</strong></div>
            <div><span>玩家 ID</span><SensitiveValue :value="selectedCase.playerId" /></div>
            <div><span>玩家 IP</span><SensitiveValue :value="selectedCase.playerIp" /></div>
            <div><span>遊戲</span><strong>{{ selectedCase.game }}</strong></div>
            <div><span>遊戲結果</span><strong>{{ selectedCase.gameResult }}</strong></div>
            <div><span>異常類型</span><StatusTag :value="selectedCase.abnormalType" /></div>
            <div><span>風險等級</span><StatusTag :value="selectedCase.riskLevel" /></div>
            <div><span>注單狀態</span><StatusTag :value="selectedCase.orderStatus" /></div>
            <div><span>處理狀態</span><StatusTag :value="selectedCase.processStatus" /></div>
          </div>
        </section>

        <section class="dialog-section">
          <h3>金額與處理建議</h3>
          <div class="detail-grid dialog-detail-grid">
            <div><span>投注金額</span><CurrencyAmount :value="selectedCase.betAmount" /></div>
            <div><span>派彩金額</span><CurrencyAmount :value="selectedCase.winAmount" /></div>
            <div><span>GGR</span><CurrencyAmount :value="selectedCase.ggr" :negative="selectedCase.ggr.includes('-')" /></div>
            <div><span>建議處理</span><strong>{{ selectedCase.actionType }}</strong></div>
            <div><span>處理人</span><strong>{{ selectedCase.assignee }}</strong></div>
            <div><span>發生時間</span><strong>{{ selectedCase.occurredAt }}</strong></div>
            <div class="detail-field-wide"><span>異常原因</span><strong>{{ selectedCase.reason }}</strong></div>
            <div class="detail-field-wide"><span>處理建議</span><strong>{{ selectedCase.suggestion }}</strong></div>
          </div>
        </section>
      </div>

      <template #footer>
        <div class="dialog-footer-actions">
          <Button label="關閉" severity="secondary" outlined @click="detailVisible = false" />
          <Button label="退款" icon="pi pi-undo" severity="secondary" outlined @click="selectedCase && openRefund(selectedCase)" />
          <Button label="補單" icon="pi pi-plus-circle" severity="secondary" outlined @click="selectedCase && openMakeup(selectedCase)" />
          <Button label="結案" icon="pi pi-check" @click="selectedCase && openClose(selectedCase)" />
        </div>
      </template>
    </Dialog>

    <Dialog v-model:visible="refundVisible" modal dismissable-mask header="建立退款審核" class="confirm-dialog">
      <div v-if="selectedCase" class="confirm-dialog-body">
        <i class="pi pi-undo" />
        <div>
          <h3>針對 {{ selectedCase.orderId }} 建立退款？</h3>
          <p>退款不會改寫原始注單，正式環境需送審並由後端檢查錢包、權限與資料範圍。</p>
        </div>
      </div>
      <div class="dialog-form-grid">
        <div class="field">
          <label>退款金額</label>
          <InputNumber v-model="refundAmount" mode="decimal" :min="0" :min-fraction-digits="2" :max-fraction-digits="2" placeholder="0.00" fluid />
        </div>
        <div class="field">
          <label>處理幣別</label>
          <InputText :model-value="selectedCase?.currency ?? ''" disabled fluid />
        </div>
        <div class="field detail-field-wide">
          <label>退款原因</label>
          <Textarea v-model="processNote" rows="3" auto-resize placeholder="輸入退款原因、對帳結果或風控說明" fluid />
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer-actions">
          <Button label="取消" severity="secondary" outlined @click="refundVisible = false" />
          <Button label="送出審核" icon="pi pi-check" @click="refundVisible = false" />
        </div>
      </template>
    </Dialog>

    <Dialog v-model:visible="makeupVisible" modal dismissable-mask header="建立補單審核" class="confirm-dialog">
      <div v-if="selectedCase" class="confirm-dialog-body">
        <i class="pi pi-plus-circle" />
        <div>
          <h3>針對 {{ selectedCase.orderId }} 建立補單？</h3>
          <p>補單會建立新的錢包交易與審核紀錄，不會直接修改原始投注或派彩金額。</p>
        </div>
      </div>
      <div class="dialog-form-grid">
        <div class="field">
          <label>補單金額</label>
          <InputNumber v-model="makeupAmount" mode="decimal" :min="0" :min-fraction-digits="2" :max-fraction-digits="2" placeholder="0.00" fluid />
        </div>
        <div class="field">
          <label>處理幣別</label>
          <InputText :model-value="selectedCase?.currency ?? ''" disabled fluid />
        </div>
        <div class="field detail-field-wide">
          <label>補單原因</label>
          <Textarea v-model="processNote" rows="3" auto-resize placeholder="輸入補單原因、交易單號或錢包回覆" fluid />
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer-actions">
          <Button label="取消" severity="secondary" outlined @click="makeupVisible = false" />
          <Button label="送出審核" icon="pi pi-check" @click="makeupVisible = false" />
        </div>
      </template>
    </Dialog>

    <Dialog v-model:visible="closeVisible" modal dismissable-mask header="異常注單結案" class="confirm-dialog">
      <div v-if="selectedCase" class="confirm-dialog-body">
        <i class="pi pi-check-circle" />
        <div>
          <h3>將 {{ selectedCase.caseId }} 結案？</h3>
          <p>結案後仍會保留案件、注單、處理說明與操作紀錄，後續只能新增補充紀錄。</p>
        </div>
      </div>
      <div class="field">
        <label>結案說明</label>
        <Textarea v-model="processNote" rows="3" auto-resize placeholder="輸入遊戲結果、錢包確認、風控覆核或對帳說明" fluid />
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
