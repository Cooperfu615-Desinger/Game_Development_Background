<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import SelectButton from 'primevue/selectbutton';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import CurrencyAmount from '@/components/ui/CurrencyAmount.vue';
import DateTimeRangeField from '@/components/ui/DateTimeRangeField.vue';
import SectionCard from '@/components/ui/SectionCard.vue';
import SensitiveValue from '@/components/ui/SensitiveValue.vue';

type SettlementStatus = '待對帳' | '對帳中' | '待審核' | '已鎖定' | '爭議中';
type Severity = 'success' | 'info' | 'warn' | 'danger' | 'secondary';

const router = useRouter();

interface SettlementRow {
  id: string;
  merchant: string;
  agent: string;
  cycle: string;
  period: string;
  currency: string;
  bet: number;
  win: number;
  ggr: number;
  revenueShare: number;
  adjustment: number;
  receivable: number;
  fxRate: string;
  status: SettlementStatus;
  lockedBy: string;
  updatedAt: string;
  note: string;
}

const today = new Date();
const startDate = new Date(today);
startDate.setDate(today.getDate() - 30);
startDate.setHours(0, 0, 0, 0);
today.setHours(23, 59, 59, 0);

const filters = reactive({
  keyword: '',
  range: [startDate, today] as [Date | null, Date | null],
  merchant: '全部商戶',
  agent: '全部代理',
  status: '全部狀態',
  currency: '全部幣別',
  mode: '對帳幣別'
});

const selectedSettlement = ref<SettlementRow | null>(null);
const detailDialogVisible = ref(false);
const lockDialogVisible = ref(false);
const disputeDialogVisible = ref(false);
const disputeReason = ref('');

const merchantOptions = ['全部商戶', 'Golden Dragon', 'LuckyPlay', 'Nova Gaming', 'Royal H5'];
const agentOptions = ['全部代理', 'Asia Master', 'Prime Network', 'Nova Agent', 'Royal Partner'];
const statusOptions = ['全部狀態', '待對帳', '對帳中', '待審核', '已鎖定', '爭議中'];
const currencyOptions = ['全部幣別', 'USDT', 'USD', 'TWD'];
const modeOptions = ['原幣別', '對帳幣別'];

const settlements = reactive<SettlementRow[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await fetch('/api/settlements/v2/list');
    const data: SettlementRow[] = await res.json();
    settlements.splice(0, settlements.length, ...data);
  } finally {
    loading.value = false;
  }
});

const filteredSettlements = computed(() => settlements.filter((row) => {
  const keyword = filters.keyword.trim().toLowerCase();
  const matchKeyword = !keyword || [row.id, row.merchant, row.agent].some((value) => value.toLowerCase().includes(keyword));
  const matchMerchant = filters.merchant === '全部商戶' || row.merchant === filters.merchant;
  const matchAgent = filters.agent === '全部代理' || row.agent === filters.agent;
  const matchStatus = filters.status === '全部狀態' || row.status === filters.status;
  const matchCurrency = filters.currency === '全部幣別' || row.currency === filters.currency;
  return matchKeyword && matchMerchant && matchAgent && matchStatus && matchCurrency;
}));

const summaryCards = computed(() => {
  const rows = filteredSettlements.value;
  const totalReceivable = rows.reduce((sum, row) => sum + row.receivable, 0);
  const totalGgr = rows.reduce((sum, row) => sum + row.ggr, 0);
  const locked = rows.filter((row) => row.status === '已鎖定').length;
  const dispute = rows.filter((row) => row.status === '爭議中').length;

  return [
    { label: '結算單數', value: String(rows.length), helper: `已鎖定 ${locked} / 爭議 ${dispute}`, icon: 'pi pi-file-check', severity: 'info' as Severity },
    { label: 'GGR', value: formatMoney(totalGgr, 'USDT'), helper: '依目前篩選條件統計', icon: 'pi pi-chart-line', severity: totalGgr < 0 ? 'danger' as Severity : 'success' as Severity },
    { label: '供應商應收', value: formatMoney(totalReceivable, 'USDT'), helper: '含分潤與調整項', icon: 'pi pi-wallet', severity: totalReceivable < 0 ? 'danger' as Severity : 'success' as Severity },
    { label: '待處理', value: String(rows.filter((row) => !['已鎖定'].includes(row.status)).length), helper: '待對帳、待審核與爭議中', icon: 'pi pi-clock', severity: 'warn' as Severity }
  ];
});

function formatMoney(value: number, currency: string) {
  const sign = value < 0 ? '-' : '';
  return `${currency} ${sign}${Math.abs(value).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

function tagSeverity(status: string): Severity {
  if (status === '已鎖定') return 'success';
  if (status === '爭議中') return 'danger';
  if (['待審核', '待對帳'].includes(status)) return 'warn';
  if (status === '對帳中') return 'info';
  return 'secondary';
}

function openDetail(row: SettlementRow) {
  selectedSettlement.value = row;
  detailDialogVisible.value = true;
}

function openLock(row: SettlementRow) {
  selectedSettlement.value = row;
  lockDialogVisible.value = true;
}

function confirmLock() {
  if (!selectedSettlement.value) return;
  selectedSettlement.value.status = '已鎖定';
  selectedSettlement.value.lockedBy = 'Supplier Admin';
  selectedSettlement.value.updatedAt = '2026-05-22 10:30:00';
  lockDialogVisible.value = false;
}

function openDispute(row: SettlementRow) {
  selectedSettlement.value = row;
  disputeReason.value = row.note;
  disputeDialogVisible.value = true;
}

function confirmDispute() {
  if (!selectedSettlement.value) return;
  selectedSettlement.value.status = '爭議中';
  selectedSettlement.value.note = disputeReason.value || '標記爭議，等待財務與商戶對帳。';
  selectedSettlement.value.updatedAt = '2026-05-22 10:30:00';
  disputeDialogVisible.value = false;
}

function resetFilters() {
  filters.keyword = '';
  filters.range = [startDate, today];
  filters.merchant = '全部商戶';
  filters.agent = '全部代理';
  filters.status = '全部狀態';
  filters.currency = '全部幣別';
  filters.mode = '對帳幣別';
}
</script>

<template>
  <div class="page-stack settlements-page">
    <SectionCard class="merchant-filter-card">
      <template #header>
        <div class="dialog-title-block">
          <h2>查詢條件</h2>
          <p>查詢商戶、代理、週期、幣別、分潤、調整項與鎖定狀態。</p>
        </div>
      </template>

      <div class="trade-filter-grid">
        <div class="field trade-filter-keyword">
          <label>關鍵字</label>
          <InputText v-model="filters.keyword" placeholder="輸入結算單號、商戶或代理" fluid />
        </div>
        <DateTimeRangeField v-model="filters.range" class="trade-date-range" />
        <div class="field">
          <label>商戶</label>
          <Select v-model="filters.merchant" :options="merchantOptions" fluid />
        </div>
        <div class="field">
          <label>代理</label>
          <Select v-model="filters.agent" :options="agentOptions" fluid />
        </div>
        <div class="field">
          <label>狀態</label>
          <Select v-model="filters.status" :options="statusOptions" fluid />
        </div>
        <div class="field">
          <label>幣別</label>
          <Select v-model="filters.currency" :options="currencyOptions" fluid />
        </div>
        <div class="field">
          <label>報表模式</label>
          <SelectButton v-model="filters.mode" :options="modeOptions" />
        </div>
        <div class="trade-filter-actions">
          <Button label="查詢" icon="pi pi-search" />
          <Button label="重置" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" />
        </div>
      </div>
    </SectionCard>

    <section class="agent-summary-grid">
      <article v-for="item in summaryCards" :key="item.label" class="agent-summary-card">
        <div class="risk-overview-kpi-head">
          <span class="agent-section-icon"><i :class="item.icon" /></span>
          <Tag :value="item.label" :severity="item.severity" />
        </div>
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <small>{{ item.helper }}</small>
      </article>
    </section>

    <div class="toolbar-row">
      <div class="section-count">
        <span class="count-badge">{{ filteredSettlements.length }}</span>
        <strong>筆結算單</strong>
      </div>
      <div>
        <Button label="欄位設定" icon="pi pi-sliders-h" severity="secondary" outlined />
        <Button label="匯出" icon="pi pi-download" severity="secondary" outlined />
      </div>
    </div>

    <SectionCard class="merchant-table-card">
      <DataTable
        :value="filteredSettlements"
        :loading="loading"
        paginator
        :rows="10"
        :rows-per-page-options="[5, 10, 20, 50, 100]"
        scrollable
        table-style="min-width: 1280px"
      >
        <Column field="id" header="結算單號" style="width: 170px; min-width: 170px" />
        <Column field="merchant" header="商戶" style="width: 150px; min-width: 150px" />
        <Column field="agent" header="代理" style="width: 150px; min-width: 150px" />
        <Column field="cycle" header="週期" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 86px; min-width: 86px" />
        <Column field="period" header="結算區間" style="width: 190px; min-width: 190px" />
        <Column field="currency" header="幣別" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 92px; min-width: 92px">
          <template #body="{ data }">
            <Tag class="agent-token agent-token--currency" :value="data.currency" severity="info" />
          </template>
        </Column>
        <Column header="GGR" style="width: 130px; min-width: 130px">
          <template #body="{ data }">
            <CurrencyAmount :value="formatMoney(data.ggr, data.currency)" :negative="data.ggr < 0" />
          </template>
        </Column>
        <Column header="分潤比例" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 112px; min-width: 112px">
          <template #body="{ data }">
            <SensitiveValue :value="`${(data.revenueShare * 100).toFixed(2)}%`" />
          </template>
        </Column>
        <Column header="調整項" style="width: 120px; min-width: 120px">
          <template #body="{ data }">
            <CurrencyAmount :value="formatMoney(data.adjustment, data.currency)" :negative="data.adjustment < 0" />
          </template>
        </Column>
        <Column header="應收" style="width: 130px; min-width: 130px">
          <template #body="{ data }">
            <SensitiveValue :value="formatMoney(data.receivable, data.currency)" />
          </template>
        </Column>
        <Column field="fxRate" header="匯率" style="width: 110px; min-width: 110px" />
        <Column field="status" header="狀態" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 112px; min-width: 112px">
          <template #body="{ data }">
            <Tag :value="data.status" :severity="tagSeverity(data.status)" />
          </template>
        </Column>
        <Column field="updatedAt" header="更新時間" style="width: 160px; min-width: 160px" />
        <Column header="操作" frozen align-frozen="right" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 152px; min-width: 152px">
          <template #body="{ data }">
            <div class="row-actions">
              <Button icon="pi pi-eye" text rounded severity="secondary" aria-label="查看" @click="router.push(`/settlements/${data.id}`)" />
              <Button icon="pi pi-lock" text rounded severity="secondary" aria-label="鎖定" :disabled="data.status === '已鎖定'" @click="openLock(data)" />
              <Button icon="pi pi-flag" text rounded severity="secondary" aria-label="標記爭議" :disabled="data.status === '已鎖定'" @click="openDispute(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </SectionCard>

    <Dialog v-model:visible="detailDialogVisible" modal dismissable-mask class="entity-dialog settlement-dialog" :style="{ width: 'min(960px, calc(100vw - 32px))' }">
      <template #header>
        <div class="dialog-title-block">
          <span>結算單詳情</span>
          <small>{{ selectedSettlement?.id }}</small>
        </div>
      </template>

      <div v-if="selectedSettlement" class="settlement-review-panel">
        <section class="dialog-section">
          <h3>結算摘要</h3>
          <div class="dialog-detail-grid">
            <div><span>商戶</span><strong>{{ selectedSettlement.merchant }}</strong></div>
            <div><span>代理</span><strong>{{ selectedSettlement.agent }}</strong></div>
            <div><span>週期</span><strong>{{ selectedSettlement.cycle }}</strong></div>
            <div><span>結算區間</span><strong>{{ selectedSettlement.period }}</strong></div>
            <div><span>幣別</span><strong>{{ selectedSettlement.currency }}</strong></div>
            <div><span>狀態</span><Tag :value="selectedSettlement.status" :severity="tagSeverity(selectedSettlement.status)" /></div>
          </div>
        </section>

        <section class="dialog-section">
          <h3>金額與分潤</h3>
          <div class="settlement-money-grid">
            <div><span>總投注</span><CurrencyAmount :value="formatMoney(selectedSettlement.bet, selectedSettlement.currency)" /></div>
            <div><span>總派彩</span><CurrencyAmount :value="formatMoney(selectedSettlement.win, selectedSettlement.currency)" /></div>
            <div><span>GGR</span><CurrencyAmount :value="formatMoney(selectedSettlement.ggr, selectedSettlement.currency)" :negative="selectedSettlement.ggr < 0" /></div>
            <div><span>分潤比例</span><SensitiveValue :value="`${(selectedSettlement.revenueShare * 100).toFixed(2)}%`" /></div>
            <div><span>調整項</span><CurrencyAmount :value="formatMoney(selectedSettlement.adjustment, selectedSettlement.currency)" :negative="selectedSettlement.adjustment < 0" /></div>
            <div><span>供應商應收</span><SensitiveValue :value="formatMoney(selectedSettlement.receivable, selectedSettlement.currency)" /></div>
          </div>
        </section>

        <section class="dialog-section">
          <h3>對帳備註</h3>
          <p class="dialog-section-note">{{ selectedSettlement.note }}</p>
          <div class="dialog-detail-grid">
            <div><span>匯率</span><strong>{{ selectedSettlement.fxRate }}</strong></div>
            <div><span>鎖定人</span><strong>{{ selectedSettlement.lockedBy }}</strong></div>
            <div><span>更新時間</span><strong>{{ selectedSettlement.updatedAt }}</strong></div>
          </div>
        </section>
      </div>

      <template #footer>
        <Button label="關閉" severity="secondary" outlined @click="detailDialogVisible = false" />
        <Button label="匯出明細" icon="pi pi-download" />
      </template>
    </Dialog>

    <Dialog v-model:visible="lockDialogVisible" modal dismissable-mask class="confirm-dialog" :style="{ width: 'min(520px, calc(100vw - 32px))' }">
      <template #header>
        <div class="dialog-title-block">
          <span>鎖定結算單</span>
          <small>{{ selectedSettlement?.id }}</small>
        </div>
      </template>
      <div class="disable-agent-warning">
        <i class="pi pi-lock" />
        <div>
          <strong>鎖定後不可再修改金額、分潤比例與調整項。</strong>
          <p>正式環境鎖定結算單需送審並留下操作紀錄；此 Demo 會直接更新狀態。</p>
        </div>
      </div>
      <template #footer>
        <Button label="取消" severity="secondary" outlined @click="lockDialogVisible = false" />
        <Button label="確認鎖定" icon="pi pi-check" severity="danger" @click="confirmLock" />
      </template>
    </Dialog>

    <Dialog v-model:visible="disputeDialogVisible" modal dismissable-mask class="entity-dialog settlement-dialog" :style="{ width: 'min(640px, calc(100vw - 32px))' }">
      <template #header>
        <div class="dialog-title-block">
          <span>標記爭議</span>
          <small>{{ selectedSettlement?.id }}</small>
        </div>
      </template>
      <div class="dialog-section">
        <h3>爭議原因</h3>
        <p class="dialog-section-note">標記爭議後，結算單需由財務與商戶重新對帳，鎖定前不得匯出正式付款資料。</p>
        <Textarea v-model="disputeReason" rows="4" auto-resize placeholder="輸入爭議原因" fluid />
      </div>
      <template #footer>
        <Button label="取消" severity="secondary" outlined @click="disputeDialogVisible = false" />
        <Button label="標記爭議" icon="pi pi-flag" severity="danger" @click="confirmDispute" />
      </template>
    </Dialog>
  </div>
</template>
