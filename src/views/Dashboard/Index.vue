<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Select from 'primevue/select';
import SelectButton from 'primevue/selectbutton';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Chart from 'primevue/chart';
import SectionCard from '@/components/ui/SectionCard.vue';
import CurrencyAmount from '@/components/ui/CurrencyAmount.vue';
import DateTimeRangeField from '@/components/ui/DateTimeRangeField.vue';
import StatusTag from '@/components/ui/StatusTag.vue';

type DashboardKpi = {
  label: string;
  value: string;
  delta: string;
  icon: string;
  helper: string;
  negative?: boolean;
};

type RevenueTrendRow = {
  date: string;
  bet: number;
  win: number;
  ggr: number;
};

type MerchantRankRow = {
  code: string;
  name: string;
  agent: string;
  currency: string;
  bet: string;
  ggr: string;
  rtp: string;
  status: string;
};

type RiskAlertRow = {
  id: string;
  level: string;
  status: string;
  message: string;
  meta: string;
};

const today = new Date();
const startDate = new Date(today);
startDate.setDate(today.getDate() - 6);
startDate.setHours(0, 0, 0, 0);
today.setHours(23, 59, 59, 0);

const filters = ref({
  range: [startDate, today] as [Date | null, Date | null],
  agent: null,
  merchant: null,
  currency: null,
  gameType: null,
  mode: 'settlement'
});

const kpis = reactive<DashboardKpi[]>([]);
const revenueRows = reactive<RevenueTrendRow[]>([]);
const topMerchantRows = reactive<MerchantRankRow[]>([]);
const latestRiskRows = reactive<RiskAlertRow[]>([]);
const loadingMerchants = ref(true);

onMounted(async () => {
  try {
    const [kpiRes, trendRes, rankRes, riskRes] = await Promise.all([
      fetch('/api/dashboard/v2/kpis'),
      fetch('/api/dashboard/v2/revenue-trend'),
      fetch('/api/dashboard/v2/merchant-rank'),
      fetch('/api/dashboard/v2/risk-alerts')
    ]);
    kpis.splice(0, kpis.length, ...await kpiRes.json());
    revenueRows.splice(0, revenueRows.length, ...await trendRes.json());
    topMerchantRows.splice(0, topMerchantRows.length, ...await rankRes.json());
    latestRiskRows.splice(0, latestRiskRows.length, ...await riskRes.json());
  } finally {
    loadingMerchants.value = false;
  }
});

const chartData = computed(() => ({
  labels: revenueRows.map((row) => row.date),
  datasets: [
    { label: 'Bet', data: revenueRows.map((row) => row.bet), borderColor: '#315f8c', backgroundColor: 'rgba(49, 95, 140, .12)', tension: 0.35, fill: true },
    { label: 'Win', data: revenueRows.map((row) => row.win), borderColor: '#256d63', backgroundColor: 'rgba(37, 109, 99, .10)', tension: 0.35, fill: true },
    { label: 'GGR', data: revenueRows.map((row) => row.ggr), borderColor: '#b86f21', backgroundColor: 'rgba(184, 111, 33, .10)', tension: 0.35, fill: false }
  ]
}));

const currencyData = {
  labels: ['USDT', 'USD', 'TWD'],
  datasets: [{ data: [52, 27, 21], backgroundColor: ['#315f8c', '#256d63', '#b86f21'], borderWidth: 0 }]
};

const rtpData = computed(() => ({
  labels: revenueRows.map((row) => row.date),
  datasets: [
    { label: '實際 RTP', data: [94.2, 96.1, 91.8, 105.6, 98.4, 97.2, 101.3], borderColor: '#b86f21', tension: 0.35 },
    { label: '理論 RTP', data: [96, 96, 96, 96, 96, 96, 96], borderColor: '#64707d', borderDash: [6, 6], tension: 0.2 }
  ]
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 9 } }
  },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: 'rgba(100, 112, 125, .18)' } }
  }
};

const healthCards = [
  { label: 'API 成功率', value: '99.82%', helper: '近 15 分鐘失敗 7 筆', icon: 'pi pi-send', severity: 'success' },
  { label: '錢包同步', value: '正常', helper: '主錢包與轉帳錢包延遲 < 1s', icon: 'pi pi-wallet', severity: 'success' },
  { label: '待審核異動', value: '12', helper: 'RTP、匯率、分潤與退款', icon: 'pi pi-shield', severity: 'warning' },
  { label: '高風險告警', value: '3', helper: '需風控今日處理', icon: 'pi pi-exclamation-triangle', severity: 'danger' }
];

const operationalNotes = [
  { title: '結算前檢查', text: 'TWD 與 USD 匯率已更新，VND 尚未進入正式結算。', icon: 'pi pi-dollar' },
  { title: '遊戲維護', text: 'Royal H5 每週三 03:00-03:30 維護排程已生效。', icon: 'pi pi-calendar-clock' },
  { title: '資料同步', text: '商戶報表與注單明細同步完成，無延遲批次。', icon: 'pi pi-database' }
];
</script>

<template>
  <div class="page-stack dashboard-page">
    <section class="dashboard-health-grid">
      <article v-for="item in healthCards" :key="item.label" class="dashboard-health-card" :class="`dashboard-health-card--${item.severity}`">
        <span><i :class="item.icon" />{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <small>{{ item.helper }}</small>
      </article>
    </section>

    <SectionCard class="merchant-filter-card dashboard-filter-card">
      <template #header>
        <div class="dialog-title-block">
          <h2>營運篩選</h2>
          <p>依目前 Supplier Portal dataScope 查詢代理、商戶、幣別與遊戲類型。</p>
        </div>
      </template>
      <div class="filter-grid dashboard-filter">
        <DateTimeRangeField v-model="filters.range" class="filter-date-range" />
        <div class="field">
          <label>代理</label>
          <Select v-model="filters.agent" :options="['全部代理', 'Asia Master', 'Prime Network']" placeholder="全部代理" fluid />
        </div>
        <div class="field">
          <label>商戶</label>
          <Select v-model="filters.merchant" :options="['全部商戶', 'Golden Dragon', 'LuckyPlay']" placeholder="全部商戶" fluid />
        </div>
        <div class="field">
          <label>幣別</label>
          <Select v-model="filters.currency" :options="['全部幣別', 'USDT', 'USD', 'TWD']" placeholder="全部幣別" fluid />
        </div>
        <div class="field">
          <label>遊戲類型</label>
          <Select v-model="filters.gameType" :options="['全部類型', '老虎機', '桌遊', '小遊戲']" placeholder="全部類型" fluid />
        </div>
        <div class="field mode-field">
          <label>報表模式</label>
          <SelectButton v-model="filters.mode" :options="[{ label: '原幣別', value: 'original' }, { label: '對帳幣別', value: 'settlement' }]" option-label="label" option-value="value" />
        </div>
        <div class="filter-actions">
          <Button label="查詢" icon="pi pi-search" />
          <Button label="重置" icon="pi pi-refresh" severity="secondary" outlined />
        </div>
      </div>
    </SectionCard>

    <section class="kpi-grid">
      <article v-for="item in kpis" :key="item.label" class="kpi-card" :class="{ negative: item.negative }">
        <div class="kpi-top">
          <span class="kpi-icon"><i :class="item.icon" /></span>
          <Tag :value="item.delta" :severity="item.negative ? 'danger' : 'success'" />
        </div>
        <p>{{ item.label }}</p>
        <strong>{{ item.value }}</strong>
        <small>{{ item.helper }}</small>
      </article>
    </section>

    <section class="dashboard-main-grid">
      <SectionCard class="chart-card chart-card-large">
        <template #header>
          <div class="dialog-title-block">
            <h2>近 7 日營收趨勢</h2>
            <p>比較 Bet、Win 與 GGR 的變化。</p>
          </div>
        </template>
        <div class="chart-box large">
          <Chart type="line" :data="chartData" :options="chartOptions" />
        </div>
      </SectionCard>

      <div class="dashboard-side-stack">
        <SectionCard class="chart-card">
          <template #header>
            <div class="dialog-title-block">
              <h2>幣別分布</h2>
              <p>依目前顯示模式統計 GGR 幣別占比。</p>
            </div>
          </template>
          <Chart class="prime-dashboard-chart prime-dashboard-chart--small" type="doughnut" :data="currencyData" :options="{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }" />
        </SectionCard>

        <SectionCard>
          <template #header>
            <div class="dialog-title-block">
              <h2>今日提醒</h2>
              <p>營運、財務與風控需要留意的項目。</p>
            </div>
          </template>
          <div class="dashboard-note-list">
            <article v-for="item in operationalNotes" :key="item.title">
              <i :class="item.icon" />
              <div>
                <strong>{{ item.title }}</strong>
                <p>{{ item.text }}</p>
              </div>
            </article>
          </div>
        </SectionCard>
      </div>
    </section>

    <SectionCard class="chart-card">
      <template #header>
        <div class="dialog-title-block">
          <h2>RTP 趨勢</h2>
          <p>比較實際 RTP 與理論 RTP，偏離時會進入數值監控流程。</p>
        </div>
      </template>
      <Chart class="prime-dashboard-chart prime-dashboard-chart--medium" type="line" :data="rtpData" :options="chartOptions" />
    </SectionCard>

    <section class="two-column">
      <SectionCard>
        <template #header>
          <div class="dialog-title-block">
            <h2>商戶排行</h2>
            <p>依 GGR 與投注量排序。</p>
          </div>
        </template>
        <DataTable :value="topMerchantRows" :loading="loadingMerchants" scrollable>
          <Column field="code" header="商戶代號" />
          <Column field="name" header="商戶名稱" />
          <Column field="agent" header="所屬代理" />
          <Column field="currency" header="幣別" />
          <Column field="bet" header="投注金額" />
          <Column header="GGR">
            <template #body="{ data }">
              <CurrencyAmount :value="data.ggr" :negative="data.ggr.startsWith('-')" />
            </template>
          </Column>
          <Column field="rtp" header="RTP" />
          <Column header="狀態">
            <template #body="{ data }">
              <StatusTag :value="data.status" />
            </template>
          </Column>
        </DataTable>
      </SectionCard>

      <SectionCard>
        <template #header>
          <div class="dialog-title-block">
            <h2>最新風控告警</h2>
            <p>高、中、待處理風控事件。</p>
          </div>
        </template>
        <div class="risk-list">
          <article v-for="row in latestRiskRows" :key="row.id" class="risk-row">
            <div>
              <div class="risk-row-head">
                <strong>{{ row.id }}</strong>
                <StatusTag :value="row.level" />
                <StatusTag :value="row.status" />
              </div>
              <p>{{ row.message }}</p>
              <small>{{ row.meta }}</small>
            </div>
            <Button icon="pi pi-arrow-right" text severity="secondary" />
          </article>
        </div>
      </SectionCard>
    </section>
  </div>
</template>
