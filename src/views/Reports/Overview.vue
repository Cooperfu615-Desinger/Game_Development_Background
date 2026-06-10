<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Select from 'primevue/select';
import SelectButton from 'primevue/selectbutton';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Chart from 'primevue/chart';
import CurrencyAmount from '@/components/ui/CurrencyAmount.vue';
import DateTimeRangeField from '@/components/ui/DateTimeRangeField.vue';
import SectionCard from '@/components/ui/SectionCard.vue';
import SummaryCardGrid from '@/components/ui/SummaryCardGrid.vue';

type Severity = 'success' | 'info' | 'warn' | 'danger' | 'secondary';

const router = useRouter();

const today = new Date();
const startDate = new Date(today);
startDate.setDate(today.getDate() - 6);
startDate.setHours(0, 0, 0, 0);
today.setHours(23, 59, 59, 0);

const filters = reactive({
  range: [startDate, today] as [Date | null, Date | null],
  agent: '全部代理',
  merchant: '全部商戶',
  currency: '全部幣別',
  reportMode: '對帳幣別',
  granularity: '日報'
});

const agentOptions = ['全部代理', 'Asia Master', 'Prime Network', 'Nova Agent', 'Royal Partner'];
const merchantOptions = ['全部商戶', 'Golden Dragon', 'LuckyPlay', 'Nova Gaming', 'Royal H5'];
const currencyOptions = ['全部幣別', 'USDT', 'USD', 'TWD'];
const modeOptions = ['原幣別', '對帳幣別'];
const granularityOptions = ['日報', '週報', '月報'];

const trendRows = [
  { date: '05/15', bet: 1880000, win: 1772400, ggr: 107600, receivable: 34432 },
  { date: '05/16', bet: 2090000, win: 1988200, ggr: 101800, receivable: 32576 },
  { date: '05/17', bet: 1948000, win: 1811300, ggr: 136700, receivable: 43744 },
  { date: '05/18', bet: 2326000, win: 2186000, ggr: 140000, receivable: 44800 },
  { date: '05/19', bet: 2562000, win: 2424400, ggr: 137600, receivable: 44032 },
  { date: '05/20', bet: 2488000, win: 2311200, ggr: 176800, receivable: 56576 },
  { date: '05/21', bet: 2868200, win: 2693400, ggr: 174800, receivable: 55936 }
];

type ReportRow = {
  module: string;
  path: string;
  count: number;
  ggr: number;
  receivable: number;
  status: string;
  owner: string;
};

const reportRows = reactive<ReportRow[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await fetch('/api/reports/v2/overview');
    const data: ReportRow[] = await res.json();
    reportRows.splice(0, reportRows.length, ...data);
  } finally {
    loading.value = false;
  }
});

const quickLinks = [
  { label: '商戶報表', desc: 'Bet、Win、GGR、RTP、應收與結算狀態', icon: 'pi pi-building', path: '/reports/merchants' },
  { label: '代理報表', desc: '代理營收、佣金比例、佣金金額與結算狀態', icon: 'pi pi-sitemap', path: '/reports/agents' },
  { label: '遊戲報表', desc: '遊戲投注、派彩、GGR、RTP 與 Jackpot 貢獻', icon: 'pi pi-th-large', path: '/reports/games' },
  { label: 'RTP 報表', desc: '理論 RTP、實際 RTP、偏離值與樣本量', icon: 'pi pi-percentage', path: '/reports/rtp' },
  { label: '結算單列表', desc: '多幣別、匯率、分潤、調整項與鎖定狀態', icon: 'pi pi-file-check', path: '/settlements' }
];

const summaryCards = computed(() => {
  const latest = trendRows.at(-1) ?? trendRows[0];
  const previous = trendRows.at(-2) ?? latest;
  const ggrDelta = previous.ggr ? ((latest.ggr - previous.ggr) / previous.ggr) * 100 : 0;
  const receivableDelta = previous.receivable ? ((latest.receivable - previous.receivable) / previous.receivable) * 100 : 0;

  return [
    { label: '總投注', value: formatMoney(latest.bet, 'USDT'), helper: '近 7 日最新統計', icon: 'pi pi-wallet', severity: 'info' as Severity },
    { label: 'GGR', value: formatMoney(latest.ggr, 'USDT'), helper: `${formatDelta(ggrDelta)} 較前日`, icon: 'pi pi-chart-line', severity: ggrDelta < 0 ? 'danger' as Severity : 'success' as Severity },
    { label: '供應商應收', value: formatMoney(latest.receivable, 'USDT'), helper: `${formatDelta(receivableDelta)} 較前日`, icon: 'pi pi-file-check', severity: receivableDelta < 0 ? 'danger' as Severity : 'success' as Severity },
    { label: '待處理項目', value: '8', helper: '待審核、爭議、RTP 偏離與樣本不足', icon: 'pi pi-clock', severity: 'warn' as Severity }
  ];
});

const trendData = computed(() => ({
  labels: trendRows.map((row) => row.date),
  datasets: [
    { label: 'Bet', data: trendRows.map((row) => row.bet), borderColor: '#315f8c', backgroundColor: 'rgba(49, 95, 140, .14)', tension: 0.35, fill: true, pointRadius: 3 },
    { label: 'Win', data: trendRows.map((row) => row.win), borderColor: '#256d63', backgroundColor: 'rgba(37, 109, 99, .10)', tension: 0.35, fill: true, pointRadius: 3 },
    { label: 'GGR', data: trendRows.map((row) => row.ggr), borderColor: '#b86f21', backgroundColor: 'rgba(184, 111, 33, .10)', tension: 0.35, fill: false, pointRadius: 3 },
    { label: '應收', data: trendRows.map((row) => row.receivable), borderColor: '#a94442', backgroundColor: 'rgba(169, 68, 66, .08)', tension: 0.35, fill: false, pointRadius: 3 }
  ]
}));

const moduleData = computed(() => ({
  labels: reportRows.map((row) => row.module),
  datasets: [
    {
      label: 'GGR',
      data: reportRows.map((row) => row.ggr),
      backgroundColor: ['#315f8c', '#256d63', '#b86f21', '#64707d', '#a94442'],
      borderRadius: 8,
      maxBarThickness: 30
    }
  ]
}));

const settlementData = {
  labels: ['待對帳', '對帳中', '待審核', '已鎖定', '爭議中'],
  datasets: [
    {
      data: [1, 1, 1, 1, 1],
      backgroundColor: ['#64707d', '#315f8c', '#b86f21', '#256d63', '#a94442'],
      borderWidth: 0
    }
  ]
};

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

function formatDelta(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

function tagSeverity(value: string): Severity {
  if (value.includes('爭議') || value.includes('偏離')) return 'danger';
  if (value.includes('待') || value.includes('觀察') || value.includes('樣本')) return 'warn';
  if (value.includes('已鎖定')) return 'success';
  return 'info';
}

function resetFilters() {
  filters.range = [startDate, today];
  filters.agent = '全部代理';
  filters.merchant = '全部商戶';
  filters.currency = '全部幣別';
  filters.reportMode = '對帳幣別';
  filters.granularity = '日報';
}
</script>

<template>
  <div class="page-stack reports-page report-overview-page">
    <SectionCard class="merchant-filter-card">
      <template #header>
        <div class="dialog-title-block">
          <h2>查詢條件</h2>
          <p>彙整商戶、代理、遊戲、RTP 與結算資料，作為營運報表入口。</p>
        </div>
      </template>

      <div class="trade-filter-grid">
        <DateTimeRangeField v-model="filters.range" class="trade-date-range" />
        <div class="field">
          <label>代理</label>
          <Select v-model="filters.agent" :options="agentOptions" fluid />
        </div>
        <div class="field">
          <label>商戶</label>
          <Select v-model="filters.merchant" :options="merchantOptions" fluid />
        </div>
        <div class="field">
          <label>幣別</label>
          <Select v-model="filters.currency" :options="currencyOptions" fluid />
        </div>
        <div class="field">
          <label>報表模式</label>
          <SelectButton v-model="filters.reportMode" :options="modeOptions" />
        </div>
        <div class="field">
          <label>週期</label>
          <SelectButton v-model="filters.granularity" :options="granularityOptions" />
        </div>
        <div class="trade-filter-actions">
          <Button label="查詢" icon="pi pi-search" />
          <Button label="重置" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" />
        </div>
      </div>
    </SectionCard>

    <SummaryCardGrid :cards="summaryCards" />

    <section class="risk-overview-chart-grid">
      <SectionCard class="chart-card chart-card-large">
        <template #header>
          <div class="dialog-title-block">
            <h2>營運報表趨勢</h2>
            <p>比較 Bet、Win、GGR 與供應商應收的近 7 日變化。</p>
          </div>
        </template>
        <Chart class="prime-dashboard-chart prime-dashboard-chart--large" type="line" :data="trendData" :options="chartOptions" :canvas-props="{ role: 'img', 'aria-label': '營運報表趨勢' }" />
      </SectionCard>

      <SectionCard class="chart-card">
        <template #header>
          <div class="dialog-title-block">
            <h2>模組 GGR 摘要</h2>
            <p>依報表模組查看主要 GGR 貢獻。</p>
          </div>
        </template>
        <Chart class="prime-dashboard-chart prime-dashboard-chart--small" type="bar" :data="moduleData" :options="horizontalChartOptions" :canvas-props="{ role: 'img', 'aria-label': '報表模組 GGR 摘要' }" />
      </SectionCard>

      <SectionCard class="chart-card">
        <template #header>
          <div class="dialog-title-block">
            <h2>結算狀態分布</h2>
            <p>追蹤待對帳、待審核、已鎖定與爭議狀態。</p>
          </div>
        </template>
        <Chart class="prime-dashboard-chart prime-dashboard-chart--small" type="doughnut" :data="settlementData" :options="doughnutOptions" :canvas-props="{ role: 'img', 'aria-label': '結算狀態分布' }" />
      </SectionCard>
    </section>

    <section class="two-column">
      <SectionCard>
        <template #header>
          <div class="dialog-title-block">
            <h2>報表模組摘要</h2>
            <p>各報表的核心數字與待處理狀態。</p>
          </div>
        </template>

        <DataTable :value="reportRows" :loading="loading" scrollable table-style="min-width: 760px">
          <Column field="module" header="模組" />
          <Column field="count" header="筆數" header-class="agent-table-cell-right" body-class="agent-table-cell-right" />
          <Column header="GGR">
            <template #body="{ data }">
              <CurrencyAmount :value="formatMoney(data.ggr, 'USDT')" :negative="data.ggr < 0" />
            </template>
          </Column>
          <Column header="應收">
            <template #body="{ data }">
              <CurrencyAmount :value="formatMoney(data.receivable, 'USDT')" :negative="data.receivable < 0" />
            </template>
          </Column>
          <Column field="status" header="狀態">
            <template #body="{ data }">
              <Tag :value="data.status" :severity="tagSeverity(data.status)" />
            </template>
          </Column>
          <Column header="操作" header-class="agent-table-cell-center" body-class="agent-table-cell-center">
            <template #body="{ data }">
              <Button icon="pi pi-arrow-right" text rounded severity="secondary" aria-label="前往報表" @click="router.push(data.path)" />
            </template>
          </Column>
        </DataTable>
      </SectionCard>

      <SectionCard>
        <template #header>
          <div class="dialog-title-block">
            <h2>快速入口</h2>
            <p>進入各報表與結算流程，完整功能仍以左側選單為主。</p>
          </div>
        </template>
        <div class="risk-overview-links report-overview-links">
          <button v-for="item in quickLinks" :key="item.path" type="button" @click="router.push(item.path)">
            <i :class="item.icon" />
            <span>
              <strong>{{ item.label }}</strong>
              <small>{{ item.desc }}</small>
            </span>
            <i class="pi pi-arrow-right" />
          </button>
        </div>
      </SectionCard>
    </section>
  </div>
</template>
