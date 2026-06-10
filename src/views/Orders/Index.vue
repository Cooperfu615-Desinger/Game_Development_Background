<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
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
import FilterCard from '@/components/ui/FilterCard.vue';

type OrderRow = {
  id: string;
  roundId: string;
  merchant: string;
  playerId: string;
  game: string;
  gameType: string;
  betAmount: string;
  winAmount: string;
  ggr: string;
  currency: string;
  settlementCurrency: string;
  convertedGgr: string;
  status: string;
  riskStatus: string;
  transactionStatus: string;
  betAt: string;
  settledAt: string;
  result: string;
  ip: string;
  note: string;
};

const filters = reactive({
  keyword: '',
  merchant: '全部商戶',
  game: '全部遊戲',
  gameType: '全部類型',
  status: '全部狀態',
  currency: '全部幣別',
  abnormal: '全部',
  minAmount: null as number | null,
  maxAmount: null as number | null,
  betAt: [null, null] as [Date | null, Date | null]
});

const selectedOrder = ref<OrderRow | null>(null);
const detailVisible = ref(false);
const markAbnormalVisible = ref(false);
const abnormalReason = ref('');

const orderRows = reactive<OrderRow[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await fetch('/api/orders/v2/list');
    const data: OrderRow[] = await res.json();
    orderRows.splice(0, orderRows.length, ...data);
  } finally {
    loading.value = false;
  }
});

const merchantOptions = computed(() => ['全部商戶', ...Array.from(new Set(orderRows.map((row) => row.merchant)))]);
const gameOptions = computed(() => ['全部遊戲', ...Array.from(new Set(orderRows.map((row) => row.game)))]);
const gameTypeOptions = computed(() => ['全部類型', ...Array.from(new Set(orderRows.map((row) => row.gameType)))]);
const statusOptions = ['全部狀態', '已結算', '已派彩', '派彩中', '待確認', '已取消'];
const currencyOptions = ['全部幣別', 'USDT', 'USD', 'TWD'];
const abnormalOptions = ['全部', '正常', '異常', '待覆核'];

const summaryCards = computed(() => {
  const pending = orderRows.filter((row) => ['派彩中', '待確認'].includes(row.status)).length;
  const abnormal = orderRows.filter((row) => row.riskStatus !== '正常').length;
  const completed = orderRows.filter((row) => row.transactionStatus === '已完成').length;

  return [
    { label: '注單筆數', value: String(orderRows.length), helper: `已完成交易 ${completed}` },
    { label: '待處理', value: String(pending), helper: '派彩中與待確認注單' },
    { label: '風控標記', value: String(abnormal), helper: '高額、逾時或覆核中' },
    { label: '資料規則', value: '不可刪改', helper: '原始投注與派彩金額不可直接修改' }
  ];
});

function resetFilters() {
  filters.keyword = '';
  filters.merchant = '全部商戶';
  filters.game = '全部遊戲';
  filters.gameType = '全部類型';
  filters.status = '全部狀態';
  filters.currency = '全部幣別';
  filters.abnormal = '全部';
  filters.minAmount = null;
  filters.maxAmount = null;
  filters.betAt = [null, null];
}

function openDetail(row: OrderRow) {
  selectedOrder.value = row;
  detailVisible.value = true;
}

function openMarkAbnormal(row: OrderRow) {
  selectedOrder.value = row;
  abnormalReason.value = '';
  markAbnormalVisible.value = true;
}
</script>

<template>
  <div class="page-stack orders-page">
    <SummaryCardGrid :cards="summaryCards" />

    <FilterCard title="查詢條件" description="查詢注單、局號、商戶、玩家、遊戲、金額區間與投注時間。">

      <div class="trade-filter-grid">
        <div class="field trade-filter-keyword">
          <label>關鍵字</label>
          <InputText v-model="filters.keyword" placeholder="輸入注單號、局號或玩家 ID" fluid />
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
          <label>遊戲類型</label>
          <Select v-model="filters.gameType" :options="gameTypeOptions" fluid />
        </div>
        <div class="field">
          <label>注單狀態</label>
          <Select v-model="filters.status" :options="statusOptions" fluid />
        </div>
        <div class="field">
          <label>幣別</label>
          <Select v-model="filters.currency" :options="currencyOptions" fluid />
        </div>
        <div class="field">
          <label>是否異常</label>
          <Select v-model="filters.abnormal" :options="abnormalOptions" fluid />
        </div>
        <div class="field">
          <label>最小金額</label>
          <InputNumber v-model="filters.minAmount" mode="decimal" :min="0" placeholder="0" fluid />
        </div>
        <div class="field">
          <label>最大金額</label>
          <InputNumber v-model="filters.maxAmount" mode="decimal" :min="0" placeholder="不限" fluid />
        </div>
        <DateTimeRangeField
          class="trade-date-range"
          :model-value="filters.betAt"
          @update:model-value="filters.betAt = $event"
        />
        <div class="trade-filter-actions">
          <Button label="查詢" icon="pi pi-search" />
          <Button label="重置" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" />
        </div>
      </div>
    </FilterCard>

    <div class="agent-command-bar">
      <div>
        <span class="table-count"><Badge :value="orderRows.length" severity="info" /> 筆注單</span>
        <p>原始注單不可新增、刪除或直接修改金額；退款、補單與異常標記需進審核流程。</p>
      </div>
      <div class="agent-command-actions">
        <Button label="匯出" icon="pi pi-download" severity="secondary" outlined />
      </div>
    </div>

    <SectionCard class="merchant-table-card trade-table-card">
      <DataTable
        :value="orderRows"
        :loading="loading"
        scrollable
        paginator
        :rows="10"
        :rows-per-page-options="[5, 10, 20, 50, 100]"
        paginator-template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
        current-page-report-template="{first}-{last} / {totalRecords}"
        data-key="id"
        table-style="min-width: 1540px"
      >
        <Column field="id" header="注單號" frozen style="width: 172px; min-width: 172px">
          <template #body="{ data }">
            <strong class="linkish" @click="openDetail(data)">{{ data.id }}</strong>
          </template>
        </Column>
        <Column field="roundId" header="局號" style="width: 168px; min-width: 168px" />
        <Column field="merchant" header="商戶" style="width: 138px; min-width: 138px" />
        <Column field="playerId" header="玩家 ID" style="width: 128px; min-width: 128px">
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
        <Column field="betAmount" header="投注金額" header-class="agent-table-cell-right" body-class="agent-table-cell-right" style="width: 128px; min-width: 128px">
          <template #body="{ data }">
            <CurrencyAmount :value="data.betAmount" />
          </template>
        </Column>
        <Column field="winAmount" header="派彩金額" header-class="agent-table-cell-right" body-class="agent-table-cell-right" style="width: 128px; min-width: 128px">
          <template #body="{ data }">
            <CurrencyAmount :value="data.winAmount" />
          </template>
        </Column>
        <Column field="ggr" header="GGR" header-class="agent-table-cell-right" body-class="agent-table-cell-right" style="width: 128px; min-width: 128px">
          <template #body="{ data }">
            <CurrencyAmount :value="data.ggr" :negative="data.ggr.includes('-')" />
          </template>
        </Column>
        <Column field="settlementCurrency" header="對帳幣別" style="width: 92px; min-width: 92px" />
        <Column field="convertedGgr" header="折算 GGR" header-class="agent-table-cell-right" body-class="agent-table-cell-right" style="width: 128px; min-width: 128px">
          <template #body="{ data }">
            <CurrencyAmount :value="data.convertedGgr" :negative="data.convertedGgr.includes('-')" />
          </template>
        </Column>
        <Column field="status" header="狀態" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 104px; min-width: 104px">
          <template #body="{ data }">
            <StatusTag :value="data.status" />
          </template>
        </Column>
        <Column field="riskStatus" header="風控" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 112px; min-width: 112px">
          <template #body="{ data }">
            <StatusTag :value="data.riskStatus" />
          </template>
        </Column>
        <Column field="transactionStatus" header="交易" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 112px; min-width: 112px">
          <template #body="{ data }">
            <StatusTag :value="data.transactionStatus" />
          </template>
        </Column>
        <Column field="betAt" header="投注時間" style="width: 168px; min-width: 168px" />
        <Column header="操作" frozen align-frozen="right" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 128px; min-width: 128px">
          <template #body="{ data }">
            <div class="row-actions">
              <Button v-tooltip.top="'查看注單'" icon="pi pi-eye" text severity="secondary" aria-label="查看注單" @click="openDetail(data)" />
              <Button v-tooltip.top="'標記異常'" icon="pi pi-flag" text severity="secondary" aria-label="標記異常" @click="openMarkAbnormal(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </SectionCard>

    <Dialog v-model:visible="detailVisible" modal dismissable-mask header="注單詳情" class="entity-dialog">
      <div v-if="selectedOrder" class="entity-dialog-body">
        <section class="dialog-section">
          <h3>注單摘要</h3>
          <div class="detail-grid dialog-detail-grid">
            <div><span>注單號</span><strong>{{ selectedOrder.id }}</strong></div>
            <div><span>局號</span><strong>{{ selectedOrder.roundId }}</strong></div>
            <div><span>商戶</span><strong>{{ selectedOrder.merchant }}</strong></div>
            <div><span>玩家 ID</span><SensitiveValue :value="selectedOrder.playerId" /></div>
            <div><span>遊戲</span><strong>{{ selectedOrder.game }}</strong></div>
            <div><span>遊戲結果</span><strong>{{ selectedOrder.result }}</strong></div>
            <div><span>投注時間</span><strong>{{ selectedOrder.betAt }}</strong></div>
            <div><span>結算時間</span><strong>{{ selectedOrder.settledAt }}</strong></div>
          </div>
        </section>

        <section class="dialog-section">
          <h3>金額與風控</h3>
          <div class="detail-grid dialog-detail-grid">
            <div><span>投注金額</span><CurrencyAmount :value="selectedOrder.betAmount" /></div>
            <div><span>派彩金額</span><CurrencyAmount :value="selectedOrder.winAmount" /></div>
            <div><span>GGR</span><CurrencyAmount :value="selectedOrder.ggr" :negative="selectedOrder.ggr.includes('-')" /></div>
            <div><span>折算 GGR</span><CurrencyAmount :value="selectedOrder.convertedGgr" :negative="selectedOrder.convertedGgr.includes('-')" /></div>
            <div><span>注單狀態</span><StatusTag :value="selectedOrder.status" /></div>
            <div><span>風控狀態</span><StatusTag :value="selectedOrder.riskStatus" /></div>
            <div><span>交易狀態</span><StatusTag :value="selectedOrder.transactionStatus" /></div>
            <div><span>玩家 IP</span><SensitiveValue :value="selectedOrder.ip" /></div>
            <div class="detail-field-wide"><span>備註</span><strong>{{ selectedOrder.note }}</strong></div>
          </div>
        </section>
      </div>

      <template #footer>
        <div class="dialog-footer-actions">
          <Button label="關閉" severity="secondary" outlined @click="detailVisible = false" />
          <Button label="查看交易" icon="pi pi-wallet" severity="secondary" outlined />
          <Button label="標記異常" icon="pi pi-flag" @click="selectedOrder && openMarkAbnormal(selectedOrder)" />
        </div>
      </template>
    </Dialog>

    <Dialog v-model:visible="markAbnormalVisible" modal dismissable-mask header="標記異常注單" class="confirm-dialog">
      <div v-if="selectedOrder" class="confirm-dialog-body">
        <i class="pi pi-flag" />
        <div>
          <h3>確認標記 {{ selectedOrder.id }}？</h3>
          <p>標記後會進入異常注單流程。原始投注金額、派彩金額與遊戲結果仍不可直接修改。</p>
        </div>
      </div>
      <div class="field">
        <label>標記原因</label>
        <Textarea v-model="abnormalReason" rows="3" auto-resize placeholder="請輸入異常原因，後續會留在操作紀錄。" fluid />
      </div>
      <template #footer>
        <div class="dialog-footer-actions">
          <Button label="取消" severity="secondary" outlined @click="markAbnormalVisible = false" />
          <Button label="確認標記" icon="pi pi-check" @click="markAbnormalVisible = false" />
        </div>
      </template>
    </Dialog>
  </div>
</template>
