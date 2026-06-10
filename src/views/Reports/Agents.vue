<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue';
import { api } from '@/services/apiClient';
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
import SummaryCardGrid from '@/components/ui/SummaryCardGrid.vue';
import FilterCard from '@/components/ui/FilterCard.vue';

type Severity = 'success' | 'info' | 'warn' | 'danger' | 'secondary';

interface AgentReportRow {
  code: string;
  agent: string;
  level: string;
  parent: string;
  merchants: number;
  currency: string;
  bet: number;
  win: number;
  ggr: number;
  commissionType: string;
  commissionRate: number;
  commission: number;
  settlementStatus: string;
  status: string;
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
  agent: '全部代理',
  level: '全部層級',
  currency: '全部幣別',
  settlementStatus: '全部狀態',
  commissionType: '全部佣金',
  mode: '對帳幣別'
});

const selectedRow = ref<AgentReportRow | null>(null);
const detailDialogVisible = ref(false);

const agentOptions = ['全部代理', 'Asia Master', 'Prime Network', 'Nova Agent', 'Royal Partner', 'Star Affiliate'];
const levelOptions = ['全部層級', '一級代理', '二級代理', '三級代理'];
const currencyOptions = ['全部幣別', 'USDT', 'USD', 'TWD'];
const settlementStatusOptions = ['全部狀態', '待對帳', '對帳中', '待審核', '已鎖定', '爭議中'];
const commissionTypeOptions = ['全部佣金', 'GGR', 'Turnover', 'Fixed'];
const modeOptions = ['原幣別', '對帳幣別'];

const agentRows = reactive<AgentReportRow[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const data = await api.get<AgentReportRow[]>('/api/reports/v2/agents');
    agentRows.splice(0, agentRows.length, ...data);
  } finally {
    loading.value = false;
  }
});

const trendRows = [
  { date: '05/15', ggr: 62000, commission: 4920 },
  { date: '05/16', ggr: 71400, commission: 5440 },
  { date: '05/17', ggr: 69400, commission: 5120 },
  { date: '05/18', ggr: 81200, commission: 6380 },
  { date: '05/19', ggr: 93400, commission: 7120 },
  { date: '05/20', ggr: 88600, commission: 6810 },
  { date: '05/21', ggr: 104800, commission: 8384 }
];

const filteredRows = computed(() => agentRows.filter((row) => {
  const matchAgent = filters.agent === '全部代理' || row.agent === filters.agent;
  const matchLevel = filters.level === '全部層級' || row.level === filters.level;
  const matchCurrency = filters.currency === '全部幣別' || row.currency === filters.currency;
  const matchStatus = filters.settlementStatus === '全部狀態' || row.settlementStatus === filters.settlementStatus;
  const matchCommission = filters.commissionType === '全部佣金' || row.commissionType === filters.commissionType;
  return matchAgent && matchLevel && matchCurrency && matchStatus && matchCommission;
}));

const summaryCards = computed(() => {
  const rows = filteredRows.value;
  const ggr = rows.reduce((sum, row) => sum + row.ggr, 0);
  const commission = rows.reduce((sum, row) => sum + row.commission, 0);
  const merchants = rows.reduce((sum, row) => sum + row.merchants, 0);
  const pending = rows.filter((row) => row.settlementStatus !== '已鎖定').length;
  return [
    { label: '代理數', value: String(rows.length), helper: `下屬商戶 ${merchants}`, icon: 'pi pi-sitemap', severity: 'info' as Severity },
    { label: '代理 GGR', value: formatMoney(ggr, 'USDT'), helper: '依目前篩選條件統計', icon: 'pi pi-chart-line', severity: ggr < 0 ? 'danger' as Severity : 'success' as Severity },
    { label: '佣金金額', value: formatMoney(commission, 'USDT'), helper: '含 GGR、流水與固定方案', icon: 'pi pi-wallet', severity: commission < 0 ? 'danger' as Severity : 'success' as Severity },
    { label: '待處理結算', value: String(pending), helper: '待對帳、待審核或爭議中', icon: 'pi pi-clock', severity: pending > 0 ? 'warn' as Severity : 'success' as Severity }
  ];
});

const trendData = computed(() => ({
  labels: trendRows.map((row) => row.date),
  datasets: [
    { label: 'GGR', data: trendRows.map((row) => row.ggr), borderColor: '#315f8c', backgroundColor: 'rgba(49, 95, 140, .14)', tension: 0.35, fill: true, pointRadius: 3 },
    { label: '佣金', data: trendRows.map((row) => row.commission), borderColor: '#b86f21', backgroundColor: 'rgba(184, 111, 33, .10)', tension: 0.35, fill: false, pointRadius: 3 }
  ]
}));

const rankingData = computed(() => ({
  labels: filteredRows.value.map((row) => row.agent),
  datasets: [
    {
      label: '佣金',
      data: filteredRows.value.map((row) => row.commission),
      backgroundColor: filteredRows.value.map((row) => row.commission < 0 ? '#a94442' : '#315f8c'),
      borderRadius: 8,
      maxBarThickness: 30
    }
  ]
}));

const commissionTypeData = computed(() => {
  const types = ['GGR', 'Turnover', 'Fixed'];
  return {
    labels: ['GGR', '流水', '固定'],
    datasets: [
      {
        data: types.map((type) => filteredRows.value.filter((row) => row.commissionType === type).length),
        backgroundColor: ['#315f8c', '#256d63', '#b86f21'],
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
  if (['已鎖定', '啟用'].includes(value)) return 'success';
  if (['待對帳', '對帳中', '待審核', '觀察'].includes(value)) return 'warn';
  if (value === '爭議中') return 'danger';
  return 'info';
}

function openDetail(row: AgentReportRow) {
  selectedRow.value = row;
  detailDialogVisible.value = true;
}

function resetFilters() {
  filters.range = [startDate, today];
  filters.agent = '全部代理';
  filters.level = '全部層級';
  filters.currency = '全部幣別';
  filters.settlementStatus = '全部狀態';
  filters.commissionType = '全部佣金';
  filters.mode = '對帳幣別';
}
</script>

<template>
  <div class="page-stack reports-page agent-report-page">
    <FilterCard title="查詢條件" description="依時間、代理、層級、幣別、佣金類型與結算狀態查詢代理營收與佣金。">

      <div class="trade-filter-grid">
        <DateTimeRangeField v-model="filters.range" class="trade-date-range" />
        <div class="field">
          <label>代理</label>
          <Select v-model="filters.agent" :options="agentOptions" fluid />
        </div>
        <div class="field">
          <label>代理層級</label>
          <Select v-model="filters.level" :options="levelOptions" fluid />
        </div>
        <div class="field">
          <label>幣別</label>
          <Select v-model="filters.currency" :options="currencyOptions" fluid />
        </div>
        <div class="field">
          <label>佣金類型</label>
          <Select v-model="filters.commissionType" :options="commissionTypeOptions" fluid />
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
    </FilterCard>

    <SummaryCardGrid :cards="summaryCards" />

    <section class="risk-overview-chart-grid">
      <SectionCard class="chart-card chart-card-large">
        <template #header>
          <div class="dialog-title-block">
            <h2>代理營收趨勢</h2>
            <p>比較代理 GGR 與佣金金額的近 7 日變化。</p>
          </div>
        </template>
        <Chart class="prime-dashboard-chart prime-dashboard-chart--large" type="line" :data="trendData" :options="chartOptions" :canvas-props="{ role: 'img', 'aria-label': '代理營收趨勢' }" />
      </SectionCard>

      <SectionCard class="chart-card">
        <template #header>
          <div class="dialog-title-block">
            <h2>代理佣金排行</h2>
            <p>快速查看主要代理佣金貢獻與負佣金。</p>
          </div>
        </template>
        <Chart class="prime-dashboard-chart prime-dashboard-chart--small" type="bar" :data="rankingData" :options="horizontalChartOptions" :canvas-props="{ role: 'img', 'aria-label': '代理佣金排行' }" />
      </SectionCard>

      <SectionCard class="chart-card">
        <template #header>
          <div class="dialog-title-block">
            <h2>佣金類型分布</h2>
            <p>依目前篩選條件統計代理佣金方案。</p>
          </div>
        </template>
        <Chart class="prime-dashboard-chart prime-dashboard-chart--small" type="doughnut" :data="commissionTypeData" :options="doughnutOptions" :canvas-props="{ role: 'img', 'aria-label': '代理佣金類型分布' }" />
      </SectionCard>
    </section>

    <SectionCard class="merchant-table-card">
      <template #header>
        <div class="dialog-title-block">
          <h2>代理明細</h2>
          <p>代理報表用於查詢營收、佣金與結算狀態；佣金比例正式異動需送審。</p>
        </div>
      </template>

      <DataTable :value="filteredRows" :loading="loading" paginator :rows="10" :rows-per-page-options="[5, 10, 20, 50, 100]" scrollable table-style="min-width: 1280px">
        <Column field="code" header="代理代號" style="width: 116px; min-width: 116px" />
        <Column field="agent" header="代理名稱" style="width: 150px; min-width: 150px" />
        <Column field="level" header="層級" style="width: 112px; min-width: 112px" />
        <Column field="parent" header="上級代理" style="width: 140px; min-width: 140px" />
        <Column field="merchants" header="商戶數" header-class="agent-table-cell-right" body-class="agent-table-cell-right" style="width: 92px; min-width: 92px" />
        <Column header="GGR" style="width: 136px; min-width: 136px">
          <template #body="{ data }"><CurrencyAmount :value="formatMoney(data.ggr, data.currency)" :negative="data.ggr < 0" /></template>
        </Column>
        <Column field="commissionType" header="佣金類型" style="width: 120px; min-width: 120px" />
        <Column header="佣金比例" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 112px; min-width: 112px">
          <template #body="{ data }"><SensitiveValue :value="data.commissionType === 'Fixed' ? '-' : `${(data.commissionRate * 100).toFixed(2)}%`" /></template>
        </Column>
        <Column header="佣金金額" style="width: 136px; min-width: 136px">
          <template #body="{ data }"><SensitiveValue :value="formatMoney(data.commission, data.currency)" /></template>
        </Column>
        <Column field="settlementStatus" header="結算" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 112px; min-width: 112px">
          <template #body="{ data }"><Tag :value="data.settlementStatus" :severity="tagSeverity(data.settlementStatus)" /></template>
        </Column>
        <Column field="status" header="狀態" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 92px; min-width: 92px">
          <template #body="{ data }"><Tag :value="data.status" :severity="tagSeverity(data.status)" /></template>
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
          <span>代理報表明細</span>
          <small>{{ selectedRow?.code }}</small>
        </div>
      </template>

      <div v-if="selectedRow" class="dialog-section">
        <h3>{{ selectedRow.agent }}</h3>
        <p class="dialog-section-note">{{ selectedRow.note }}</p>
        <div class="detail-grid dialog-detail-grid">
          <div><span>層級</span><strong>{{ selectedRow.level }}</strong></div>
          <div><span>上級代理</span><strong>{{ selectedRow.parent }}</strong></div>
          <div><span>商戶數</span><strong>{{ selectedRow.merchants }}</strong></div>
          <div><span>GGR</span><CurrencyAmount :value="formatMoney(selectedRow.ggr, selectedRow.currency)" :negative="selectedRow.ggr < 0" /></div>
          <div><span>佣金類型</span><strong>{{ selectedRow.commissionType }}</strong></div>
          <div><span>佣金比例</span><SensitiveValue :value="selectedRow.commissionType === 'Fixed' ? '-' : `${(selectedRow.commissionRate * 100).toFixed(2)}%`" /></div>
          <div><span>佣金金額</span><SensitiveValue :value="formatMoney(selectedRow.commission, selectedRow.currency)" /></div>
          <div><span>結算狀態</span><Tag :value="selectedRow.settlementStatus" :severity="tagSeverity(selectedRow.settlementStatus)" /></div>
          <div><span>代理狀態</span><Tag :value="selectedRow.status" :severity="tagSeverity(selectedRow.status)" /></div>
          <div><span>更新時間</span><strong>{{ selectedRow.updatedAt }}</strong></div>
        </div>
      </div>

      <template #footer>
        <Button label="關閉" severity="secondary" outlined @click="detailDialogVisible = false" />
        <Button label="查看結算單" icon="pi pi-file-check" />
      </template>
    </Dialog>
  </div>
</template>
