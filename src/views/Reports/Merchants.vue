<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Select from 'primevue/select';
import SelectButton from 'primevue/selectbutton';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import Chart from 'primevue/chart';
import CurrencyAmount from '@/components/ui/CurrencyAmount.vue';
import DateTimeRangeField from '@/components/ui/DateTimeRangeField.vue';
import SectionCard from '@/components/ui/SectionCard.vue';
import SensitiveValue from '@/components/ui/SensitiveValue.vue';

type Severity = 'success' | 'info' | 'warn' | 'danger' | 'secondary';

interface MerchantReportRow {
  code: string;
  merchant: string;
  agent: string;
  walletType: string;
  currency: string;
  bet: number;
  win: number;
  ggr: number;
  rtp: number;
  revenueShare: number;
  receivable: number;
  activePlayers: number;
  settlementStatus: string;
  apiStatus: string;
  updatedAt: string;
  note: string;
}

const today = new Date();
const startDate = new Date(today);
startDate.setDate(today.getDate() - 6);
startDate.setHours(0, 0, 0, 0);
today.setHours(23, 59, 59, 0);

const filters = reactive({
  range: [startDate, today] as [Date | null, Date | null],
  merchant: '全部商戶',
  agent: '全部代理',
  currency: '全部幣別',
  walletType: '全部錢包',
  settlementStatus: '全部狀態',
  mode: '對帳幣別'
});

const selectedRow = ref<MerchantReportRow | null>(null);
const detailDialogVisible = ref(false);

const merchantOptions = ['全部商戶', 'Golden Dragon', 'LuckyPlay', 'Nova Gaming', 'Royal H5', 'Dragon Club'];
const agentOptions = ['全部代理', 'Asia Master', 'Prime Network', 'Nova Agent', 'Royal Partner'];
const currencyOptions = ['全部幣別', 'USDT', 'USD', 'TWD'];
const walletOptions = ['全部錢包', '單一錢包', '轉帳錢包'];
const settlementStatusOptions = ['全部狀態', '待對帳', '對帳中', '待審核', '已鎖定', '爭議中'];
const modeOptions = ['原幣別', '對帳幣別'];

const merchantRows = reactive<MerchantReportRow[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await fetch('/api/reports/v2/merchants');
    const data: MerchantReportRow[] = await res.json();
    merchantRows.splice(0, merchantRows.length, ...data);
  } finally {
    loading.value = false;
  }
});

const trendRows = [
  { date: '05/15', bet: 980000, win: 922000, ggr: 58000, receivable: 18560 },
  { date: '05/16', bet: 1120000, win: 1062400, ggr: 57600, receivable: 18432 },
  { date: '05/17', bet: 1048000, win: 968300, ggr: 79700, receivable: 25504 },
  { date: '05/18', bet: 1286000, win: 1213600, ggr: 72400, receivable: 23168 },
  { date: '05/19', bet: 1462000, win: 1394400, ggr: 67600, receivable: 21632 },
  { date: '05/20', bet: 1388000, win: 1301200, ggr: 86800, receivable: 27776 },
  { date: '05/21', bet: 1568200, win: 1483400, ggr: 84800, receivable: 27136 }
];

const filteredRows = computed(() => merchantRows.filter((row) => {
  const matchMerchant = filters.merchant === '全部商戶' || row.merchant === filters.merchant;
  const matchAgent = filters.agent === '全部代理' || row.agent === filters.agent;
  const matchCurrency = filters.currency === '全部幣別' || row.currency === filters.currency;
  const matchWallet = filters.walletType === '全部錢包' || row.walletType === filters.walletType;
  const matchStatus = filters.settlementStatus === '全部狀態' || row.settlementStatus === filters.settlementStatus;
  return matchMerchant && matchAgent && matchCurrency && matchWallet && matchStatus;
}));

const summaryCards = computed(() => {
  const rows = filteredRows.value;
  const bet = rows.reduce((sum, row) => sum + row.bet, 0);
  const ggr = rows.reduce((sum, row) => sum + row.ggr, 0);
  const receivable = rows.reduce((sum, row) => sum + row.receivable, 0);
  const activePlayers = rows.reduce((sum, row) => sum + row.activePlayers, 0);
  return [
    { label: '商戶數', value: String(rows.length), helper: `活躍玩家 ${activePlayers.toLocaleString('en-US')}`, icon: 'pi pi-building', severity: 'info' as Severity },
    { label: '總投注', value: formatMoney(bet, 'USDT'), helper: '依目前篩選條件統計', icon: 'pi pi-wallet', severity: 'info' as Severity },
    { label: 'GGR', value: formatMoney(ggr, 'USDT'), helper: ggr < 0 ? '本期可能為負' : 'Bet - Win', icon: 'pi pi-chart-line', severity: ggr < 0 ? 'danger' as Severity : 'success' as Severity },
    { label: '供應商應收', value: formatMoney(receivable, 'USDT'), helper: '含分潤與結算狀態', icon: 'pi pi-file-check', severity: receivable < 0 ? 'danger' as Severity : 'success' as Severity }
  ];
});

const trendData = computed(() => ({
  labels: trendRows.map((row) => row.date),
  datasets: [
    { label: 'Bet', data: trendRows.map((row) => row.bet), borderColor: '#315f8c', backgroundColor: 'rgba(49, 95, 140, .14)', tension: 0.35, fill: true, pointRadius: 3 },
    { label: 'GGR', data: trendRows.map((row) => row.ggr), borderColor: '#b86f21', backgroundColor: 'rgba(184, 111, 33, .10)', tension: 0.35, fill: false, pointRadius: 3 },
    { label: '應收', data: trendRows.map((row) => row.receivable), borderColor: '#256d63', backgroundColor: 'rgba(37, 109, 99, .10)', tension: 0.35, fill: false, pointRadius: 3 }
  ]
}));

const rankingData = computed(() => ({
  labels: filteredRows.value.map((row) => row.merchant),
  datasets: [
    {
      label: 'GGR',
      data: filteredRows.value.map((row) => row.ggr),
      backgroundColor: filteredRows.value.map((row) => row.ggr < 0 ? '#a94442' : '#315f8c'),
      borderRadius: 8,
      maxBarThickness: 30
    }
  ]
}));

const settlementData = computed(() => {
  const statuses = ['待對帳', '對帳中', '待審核', '已鎖定', '爭議中'];
  return {
    labels: statuses,
    datasets: [
      {
        data: statuses.map((status) => filteredRows.value.filter((row) => row.settlementStatus === status).length),
        backgroundColor: ['#64707d', '#315f8c', '#b86f21', '#256d63', '#a94442'],
        borderWidth: 0
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 9, font: { size: 12 } } },
    tooltip: { mode: 'index', intersect: false }
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#64707d', font: { size: 11 } } },
    y: { grid: { color: 'rgba(100, 112, 125, .16)' }, ticks: { color: '#64707d', font: { size: 11 } } }
  }
};

const horizontalChartOptions = {
  ...chartOptions,
  indexAxis: 'y',
  scales: {
    x: { grid: { color: 'rgba(100, 112, 125, .16)' }, ticks: { color: '#64707d', font: { size: 11 } } },
    y: { grid: { display: false }, ticks: { color: '#64707d', font: { size: 11 } } }
  }
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '64%',
  plugins: {
    legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 9, font: { size: 12 } } }
  }
};

function formatMoney(value: number, currency: string) {
  const sign = value < 0 ? '-' : '';
  return `${currency} ${sign}${Math.abs(value).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

function tagSeverity(value: string): Severity {
  if (['已鎖定', '正常'].includes(value)) return 'success';
  if (['待對帳', '對帳中', '待審核', '警示'].includes(value)) return 'warn';
  if (value === '爭議中') return 'danger';
  return 'info';
}

function openDetail(row: MerchantReportRow) {
  selectedRow.value = row;
  detailDialogVisible.value = true;
}

function resetFilters() {
  filters.range = [startDate, today];
  filters.merchant = '全部商戶';
  filters.agent = '全部代理';
  filters.currency = '全部幣別';
  filters.walletType = '全部錢包';
  filters.settlementStatus = '全部狀態';
  filters.mode = '對帳幣別';
}
</script>

<template>
  <div class="page-stack reports-page merchant-report-page">
    <SectionCard class="merchant-filter-card">
      <template #header>
        <div class="dialog-title-block">
          <h2>查詢條件</h2>
          <p>依時間、商戶、代理、錢包、幣別與結算狀態查詢 Bet / Win / GGR / RTP / 應收。</p>
        </div>
      </template>

      <div class="trade-filter-grid">
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
          <label>幣別</label>
          <Select v-model="filters.currency" :options="currencyOptions" fluid />
        </div>
        <div class="field">
          <label>錢包</label>
          <Select v-model="filters.walletType" :options="walletOptions" fluid />
        </div>
        <div class="field">
          <label>結算狀態</label>
          <Select v-model="filters.settlementStatus" :options="settlementStatusOptions" fluid />
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

    <section class="risk-overview-chart-grid">
      <SectionCard class="chart-card chart-card-large">
        <template #header>
          <div class="dialog-title-block">
            <h2>商戶營收趨勢</h2>
            <p>比較 Bet、GGR 與供應商應收的近 7 日變化。</p>
          </div>
        </template>
        <Chart class="prime-dashboard-chart prime-dashboard-chart--large" type="line" :data="trendData" :options="chartOptions" :canvas-props="{ role: 'img', 'aria-label': '商戶營收趨勢' }" />
      </SectionCard>

      <SectionCard class="chart-card">
        <template #header>
          <div class="dialog-title-block">
            <h2>商戶 GGR 排行</h2>
            <p>快速查看主要商戶貢獻與負 GGR。</p>
          </div>
        </template>
        <Chart class="prime-dashboard-chart prime-dashboard-chart--small" type="bar" :data="rankingData" :options="horizontalChartOptions" :canvas-props="{ role: 'img', 'aria-label': '商戶 GGR 排行' }" />
      </SectionCard>

      <SectionCard class="chart-card">
        <template #header>
          <div class="dialog-title-block">
            <h2>結算狀態分布</h2>
            <p>依目前篩選條件統計商戶結算狀態。</p>
          </div>
        </template>
        <Chart class="prime-dashboard-chart prime-dashboard-chart--small" type="doughnut" :data="settlementData" :options="doughnutOptions" :canvas-props="{ role: 'img', 'aria-label': '商戶結算狀態分布' }" />
      </SectionCard>
    </section>

    <SectionCard class="merchant-table-card">
      <template #header>
        <div class="dialog-title-block">
          <h2>商戶明細</h2>
          <p>商戶報表用於營收、RTP、分潤與結算狀態檢視；正式對帳仍以結算單為準。</p>
        </div>
      </template>

      <DataTable :value="filteredRows" :loading="loading" paginator :rows="10" :rows-per-page-options="[5, 10, 20, 50, 100]" scrollable table-style="min-width: 1280px">
        <Column field="code" header="商戶代號" style="width: 116px; min-width: 116px" />
        <Column field="merchant" header="商戶名稱" style="width: 150px; min-width: 150px" />
        <Column field="agent" header="所屬代理" style="width: 150px; min-width: 150px" />
        <Column field="walletType" header="錢包" style="width: 116px; min-width: 116px" />
        <Column header="Bet" style="width: 136px; min-width: 136px">
          <template #body="{ data }"><CurrencyAmount :value="formatMoney(data.bet, data.currency)" /></template>
        </Column>
        <Column header="Win" style="width: 136px; min-width: 136px">
          <template #body="{ data }"><CurrencyAmount :value="formatMoney(data.win, data.currency)" /></template>
        </Column>
        <Column header="GGR" style="width: 136px; min-width: 136px">
          <template #body="{ data }"><CurrencyAmount :value="formatMoney(data.ggr, data.currency)" :negative="data.ggr < 0" /></template>
        </Column>
        <Column header="RTP" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 96px; min-width: 96px">
          <template #body="{ data }"><SensitiveValue :value="`${data.rtp.toFixed(2)}%`" /></template>
        </Column>
        <Column header="分潤" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 104px; min-width: 104px">
          <template #body="{ data }"><SensitiveValue :value="`${(data.revenueShare * 100).toFixed(2)}%`" /></template>
        </Column>
        <Column header="應收" style="width: 136px; min-width: 136px">
          <template #body="{ data }"><SensitiveValue :value="formatMoney(data.receivable, data.currency)" /></template>
        </Column>
        <Column field="activePlayers" header="活躍玩家" header-class="agent-table-cell-right" body-class="agent-table-cell-right" style="width: 112px; min-width: 112px">
          <template #body="{ data }">{{ data.activePlayers.toLocaleString('en-US') }}</template>
        </Column>
        <Column field="settlementStatus" header="結算" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 112px; min-width: 112px">
          <template #body="{ data }"><Tag :value="data.settlementStatus" :severity="tagSeverity(data.settlementStatus)" /></template>
        </Column>
        <Column field="apiStatus" header="API" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 92px; min-width: 92px">
          <template #body="{ data }"><Tag :value="data.apiStatus" :severity="tagSeverity(data.apiStatus)" /></template>
        </Column>
        <Column field="updatedAt" header="更新時間" style="width: 160px; min-width: 160px" />
        <Column header="操作" frozen align-frozen="right" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 86px; min-width: 86px">
          <template #body="{ data }">
            <Button icon="pi pi-eye" text rounded severity="secondary" aria-label="查看" @click="openDetail(data)" />
          </template>
        </Column>
      </DataTable>
    </SectionCard>

    <Dialog v-model:visible="detailDialogVisible" modal dismissable-mask class="entity-dialog settlement-dialog" :style="{ width: 'min(860px, calc(100vw - 32px))' }">
      <template #header>
        <div class="dialog-title-block">
          <span>商戶報表明細</span>
          <small>{{ selectedRow?.code }}</small>
        </div>
      </template>

      <div v-if="selectedRow" class="dialog-section">
        <h3>{{ selectedRow.merchant }}</h3>
        <p class="dialog-section-note">{{ selectedRow.note }}</p>
        <div class="detail-grid dialog-detail-grid">
          <div><span>所屬代理</span><strong>{{ selectedRow.agent }}</strong></div>
          <div><span>錢包類型</span><strong>{{ selectedRow.walletType }}</strong></div>
          <div><span>幣別</span><strong>{{ selectedRow.currency }}</strong></div>
          <div><span>Bet</span><CurrencyAmount :value="formatMoney(selectedRow.bet, selectedRow.currency)" /></div>
          <div><span>Win</span><CurrencyAmount :value="formatMoney(selectedRow.win, selectedRow.currency)" /></div>
          <div><span>GGR</span><CurrencyAmount :value="formatMoney(selectedRow.ggr, selectedRow.currency)" :negative="selectedRow.ggr < 0" /></div>
          <div><span>RTP</span><SensitiveValue :value="`${selectedRow.rtp.toFixed(2)}%`" /></div>
          <div><span>分潤比例</span><SensitiveValue :value="`${(selectedRow.revenueShare * 100).toFixed(2)}%`" /></div>
          <div><span>供應商應收</span><SensitiveValue :value="formatMoney(selectedRow.receivable, selectedRow.currency)" /></div>
          <div><span>活躍玩家</span><strong>{{ selectedRow.activePlayers.toLocaleString('en-US') }}</strong></div>
          <div><span>結算狀態</span><Tag :value="selectedRow.settlementStatus" :severity="tagSeverity(selectedRow.settlementStatus)" /></div>
          <div><span>API 狀態</span><Tag :value="selectedRow.apiStatus" :severity="tagSeverity(selectedRow.apiStatus)" /></div>
        </div>
      </div>

      <template #footer>
        <Button label="關閉" severity="secondary" outlined @click="detailDialogVisible = false" />
        <Button label="查看結算單" icon="pi pi-file-check" />
      </template>
    </Dialog>
  </div>
</template>
