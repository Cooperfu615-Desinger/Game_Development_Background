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
import DateTimeRangeField from '@/components/ui/DateTimeRangeField.vue';
import SectionCard from '@/components/ui/SectionCard.vue';
import SensitiveValue from '@/components/ui/SensitiveValue.vue';

type Severity = 'success' | 'info' | 'warn' | 'danger' | 'secondary';

const router = useRouter();

const today = new Date();
const startDate = new Date(today);
startDate.setDate(today.getDate() - 6);
startDate.setHours(0, 0, 0, 0);
today.setHours(23, 59, 59, 0);

const filters = reactive({
  range: [startDate, today] as [Date | null, Date | null],
  merchant: '全部商戶',
  riskLevel: '全部風險',
  source: '全部來源',
  mode: '營運總覽'
});

const merchantOptions = ['全部商戶', 'Golden Dragon', 'LuckyPlay', 'Nova Gaming', 'Royal H5'];
const riskLevelOptions = ['全部風險', '高風險', '中風險', '低風險'];
const sourceOptions = ['全部來源', '規則命中', '交易異常', '玩家行為', '錢包 API'];
const modeOptions = ['營運總覽', '處理效率'];

const kpiCards = [
  { label: '待處理告警', value: '12', helper: '高風險 5 / 中風險 7', delta: '+3', severity: 'warn' as Severity, icon: 'pi pi-bell' },
  { label: '高風險案件', value: '4', helper: 'P1 2 / P2 2', delta: '+1', severity: 'danger' as Severity, icon: 'pi pi-shield' },
  { label: 'SLA 達成率', value: '92.8%', helper: '逾時 3 / 準時 39', delta: '-2.1%', severity: 'warn' as Severity, icon: 'pi pi-stopwatch' },
  { label: '誤報率', value: '7.4%', helper: '近 7 日人工排除 2 筆', delta: '-1.8%', severity: 'success' as Severity, icon: 'pi pi-sliders-h' }
];

const trendRows = [
  { date: '05/15', alerts: 12, cases: 4, closed: 8, overdue: 1 },
  { date: '05/16', alerts: 18, cases: 6, closed: 10, overdue: 2 },
  { date: '05/17', alerts: 10, cases: 3, closed: 9, overdue: 1 },
  { date: '05/18', alerts: 22, cases: 7, closed: 11, overdue: 3 },
  { date: '05/19', alerts: 16, cases: 5, closed: 14, overdue: 1 },
  { date: '05/20', alerts: 27, cases: 9, closed: 15, overdue: 4 },
  { date: '05/21', alerts: 21, cases: 6, closed: 12, overdue: 2 }
];

const pendingAlerts = reactive<any[]>([]);
const ruleHealthRows = reactive<any[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await fetch('/api/risk/v2/overview');
    const data = await res.json();
    pendingAlerts.splice(0, pendingAlerts.length, ...(data.pendingAlerts ?? []));
    ruleHealthRows.splice(0, ruleHealthRows.length, ...(data.ruleHealthRows ?? []));
  } finally {
    loading.value = false;
  }
});

const quickLinks = [
  { label: '查看告警', desc: '指派、建案、關閉或排除告警', icon: 'pi pi-bell', path: '/risks/alerts' },
  { label: '風控案件', desc: '追蹤案件處理進度與 SLA', icon: 'pi pi-folder-open', path: '/risks/cases' },
  { label: '風控規則', desc: '維護條件、門檻、週期與動作', icon: 'pi pi-code', path: '/risks/rules' },
  { label: '處理紀錄', desc: '查詢不可修改的風控操作紀錄', icon: 'pi pi-history', path: '/risks/actions' }
];

const trendData = computed(() => ({
  labels: trendRows.map((row) => row.date),
  datasets: [
    {
      label: '告警',
      data: trendRows.map((row) => row.alerts),
      borderColor: '#315f8c',
      backgroundColor: 'rgba(49, 95, 140, .14)',
      tension: 0.35,
      fill: true,
      pointRadius: 3
    },
    {
      label: '建案',
      data: trendRows.map((row) => row.cases),
      borderColor: '#b86f21',
      backgroundColor: 'rgba(184, 111, 33, .10)',
      tension: 0.35,
      fill: false,
      pointRadius: 3
    },
    {
      label: '結案',
      data: trendRows.map((row) => row.closed),
      borderColor: '#256d63',
      backgroundColor: 'rgba(37, 109, 99, .10)',
      tension: 0.35,
      fill: false,
      pointRadius: 3
    },
    {
      label: '逾時',
      data: trendRows.map((row) => row.overdue),
      borderColor: '#a94442',
      backgroundColor: 'rgba(169, 68, 66, .08)',
      tension: 0.35,
      fill: false,
      pointRadius: 3
    }
  ]
}));

const sourceData = {
  labels: ['規則命中', '交易異常', '玩家行為', '錢包 API'],
  datasets: [
    {
      data: [38, 31, 19, 12],
      backgroundColor: ['#315f8c', '#256d63', '#b86f21', '#a94442'],
      borderWidth: 0
    }
  ]
};

const severityData = {
  labels: ['高風險', '中風險', '低風險'],
  datasets: [
    {
      label: '告警數',
      data: [9, 24, 18],
      backgroundColor: ['#a94442', '#b86f21', '#256d63'],
      borderRadius: 8,
      maxBarThickness: 34
    }
  ]
};

const workloadData = {
  labels: ['Iris Chen', 'Mia Chen', 'Alex Wang', '未指派'],
  datasets: [
    {
      label: '告警',
      data: [3, 4, 2, 3],
      backgroundColor: '#315f8c',
      borderRadius: 8,
      maxBarThickness: 28
    },
    {
      label: '案件',
      data: [2, 3, 2, 1],
      backgroundColor: '#b86f21',
      borderRadius: 8,
      maxBarThickness: 28
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
    y: { grid: { color: 'rgba(100, 112, 125, .16)' }, ticks: { color: '#64707d', font: { size: 11 }, precision: 0 } }
  }
};

const horizontalChartOptions = {
  ...chartOptions,
  indexAxis: 'y',
  scales: {
    x: { grid: { color: 'rgba(100, 112, 125, .16)' }, ticks: { color: '#64707d', font: { size: 11 }, precision: 0 } },
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

function tagSeverity(value: string): Severity {
  if (['高風險', '需調整', '逾時'].includes(value)) return 'danger';
  if (['中風險', '待處理', '處理中', '觀察'].includes(value)) return 'warn';
  if (['低風險', '已建案', '健康', '結案'].includes(value)) return 'success';
  return 'info';
}

function resetFilters() {
  filters.range = [startDate, today];
  filters.merchant = '全部商戶';
  filters.riskLevel = '全部風險';
  filters.source = '全部來源';
  filters.mode = '營運總覽';
}
</script>

<template>
  <div class="page-stack risk-overview-page">
    <SectionCard class="merchant-filter-card">
      <template #header>
        <div class="dialog-title-block">
          <h2>風控總覽</h2>
          <p>彙整告警、案件、規則命中與處理效率，協助營運快速判斷今日風險狀態。</p>
        </div>
      </template>

      <div class="trade-filter-grid">
        <DateTimeRangeField v-model="filters.range" class="trade-date-range" />
        <div class="field">
          <label>商戶</label>
          <Select v-model="filters.merchant" :options="merchantOptions" fluid />
        </div>
        <div class="field">
          <label>風險等級</label>
          <Select v-model="filters.riskLevel" :options="riskLevelOptions" fluid />
        </div>
        <div class="field">
          <label>來源</label>
          <Select v-model="filters.source" :options="sourceOptions" fluid />
        </div>
        <div class="field">
          <label>模式</label>
          <SelectButton v-model="filters.mode" :options="modeOptions" />
        </div>
        <div class="trade-filter-actions">
          <Button label="查詢" icon="pi pi-search" />
          <Button label="重置" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" />
        </div>
      </div>
    </SectionCard>

    <section class="agent-summary-grid">
      <article v-for="item in kpiCards" :key="item.label" class="agent-summary-card risk-overview-kpi">
        <div class="risk-overview-kpi-head">
          <span class="agent-section-icon"><i :class="item.icon" /></span>
          <Tag :value="item.delta" :severity="item.severity" />
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
            <h2>近 7 日風控處理趨勢</h2>
            <p>比較告警、建案、結案與逾時量，觀察風險是否集中升溫。</p>
          </div>
        </template>
        <Chart class="prime-dashboard-chart prime-dashboard-chart--large" type="line" :data="trendData" :options="chartOptions" :canvas-props="{ role: 'img', 'aria-label': '近 7 日風控處理趨勢' }" />
      </SectionCard>

      <SectionCard class="chart-card">
        <template #header>
          <div class="dialog-title-block">
            <h2>告警來源</h2>
            <p>依規則、交易、玩家與錢包來源分布。</p>
          </div>
        </template>
        <Chart class="prime-dashboard-chart prime-dashboard-chart--small" type="doughnut" :data="sourceData" :options="doughnutOptions" :canvas-props="{ role: 'img', 'aria-label': '告警來源分布' }" />
      </SectionCard>

      <SectionCard class="chart-card">
        <template #header>
          <div class="dialog-title-block">
            <h2>風險等級分布</h2>
            <p>高、中、低風險告警數量。</p>
          </div>
        </template>
        <Chart class="prime-dashboard-chart prime-dashboard-chart--small" type="bar" :data="severityData" :options="chartOptions" :canvas-props="{ role: 'img', 'aria-label': '風險等級分布' }" />
      </SectionCard>
    </section>

    <section class="risk-overview-insight-grid">
      <SectionCard>
        <template #header>
          <div class="dialog-title-block">
            <h2>處理人負載</h2>
            <p>查看待處理告警與案件是否集中在特定人員。</p>
          </div>
        </template>
        <Chart class="prime-dashboard-chart prime-dashboard-chart--medium" type="bar" :data="workloadData" :options="horizontalChartOptions" :canvas-props="{ role: 'img', 'aria-label': '處理人負載' }" />
      </SectionCard>

      <SectionCard>
        <template #header>
          <div class="dialog-title-block">
            <h2>待處理告警</h2>
            <p>優先處理高風險與即將逾時項目。</p>
          </div>
        </template>
        <DataTable :value="pendingAlerts" :loading="loading" scrollable table-style="min-width: 760px">
          <Column field="id" header="告警單號" />
          <Column field="title" header="告警內容" />
          <Column field="merchant" header="商戶" />
          <Column header="玩家 ID">
            <template #body="{ data }">
              <SensitiveValue :value="data.playerId" />
            </template>
          </Column>
          <Column field="level" header="風險" header-class="agent-table-cell-center" body-class="agent-table-cell-center">
            <template #body="{ data }">
              <Tag :value="data.level" :severity="tagSeverity(data.level)" />
            </template>
          </Column>
          <Column field="status" header="狀態" header-class="agent-table-cell-center" body-class="agent-table-cell-center">
            <template #body="{ data }">
              <Tag :value="data.status" :severity="tagSeverity(data.status)" />
            </template>
          </Column>
          <Column field="time" header="發生時間" />
        </DataTable>
      </SectionCard>
    </section>

    <section class="two-column">
      <SectionCard>
        <template #header>
          <div class="dialog-title-block">
            <h2>規則健康度</h2>
            <p>命中率、誤報率與建案數，用來判斷規則是否需要調整。</p>
          </div>
        </template>
        <DataTable :value="ruleHealthRows" :loading="loading" scrollable table-style="min-width: 640px">
          <Column field="rule" header="規則名稱" />
          <Column field="hits" header="命中" header-class="agent-table-cell-center" body-class="agent-table-cell-center" />
          <Column field="falsePositive" header="誤報率" />
          <Column field="cases" header="建案" header-class="agent-table-cell-center" body-class="agent-table-cell-center" />
          <Column field="status" header="狀態" header-class="agent-table-cell-center" body-class="agent-table-cell-center">
            <template #body="{ data }">
              <Tag :value="data.status" :severity="tagSeverity(data.status)" />
            </template>
          </Column>
        </DataTable>
      </SectionCard>

      <SectionCard>
        <template #header>
          <div class="dialog-title-block">
            <h2>快速入口</h2>
            <p>保留常用風控流程入口，完整功能仍以左側選單為主。</p>
          </div>
        </template>
        <div class="risk-overview-links">
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
