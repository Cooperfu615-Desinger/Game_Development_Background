<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue';
import { api } from '@/services/apiClient';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
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

interface RtpRow {
  id: string;
  game: string;
  gameType: string;
  merchant: string;
  mathVersion: string;
  targetRtp: number;
  actualRtp: number;
  rounds: number;
  bet: number;
  win: number;
  ggr: number;
  currency: string;
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
  game: '全部遊戲',
  merchant: '全部商戶',
  gameType: '全部類型',
  status: '全部狀態',
  currency: '全部幣別',
  mode: '實際 RTP'
});

const selectedRow = ref<RtpRow | null>(null);
const detailDialogVisible = ref(false);

const gameOptions = ['全部遊戲', 'Fortune Tiger', 'Royal H5', 'Blackjack Live', 'Baccarat Pro'];
const merchantOptions = ['全部商戶', 'Golden Dragon', 'LuckyPlay', 'Nova Gaming', 'Royal H5'];
const gameTypeOptions = ['全部類型', 'Slot', 'Table', 'Live'];
const statusOptions = ['全部狀態', '正常', '觀察', '偏離', '樣本不足'];
const currencyOptions = ['全部幣別', 'USDT', 'USD', 'TWD'];
const modeOptions = ['實際 RTP', '偏離值'];

const rtpRows = reactive<RtpRow[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const data = await api.get<RtpRow[]>('/api/reports/v2/rtp');
    rtpRows.splice(0, rtpRows.length, ...data);
  } finally {
    loading.value = false;
  }
});

const trendRows = [
  { date: '05/15', actual: 96.2, target: 96, upper: 99, lower: 93 },
  { date: '05/16', actual: 97.1, target: 96, upper: 99, lower: 93 },
  { date: '05/17', actual: 94.8, target: 96, upper: 99, lower: 93 },
  { date: '05/18', actual: 98.4, target: 96, upper: 99, lower: 93 },
  { date: '05/19', actual: 101.6, target: 96, upper: 99, lower: 93 },
  { date: '05/20', actual: 100.2, target: 96, upper: 99, lower: 93 },
  { date: '05/21', actual: 101.8, target: 96, upper: 99, lower: 93 }
];

const filteredRows = computed(() => rtpRows.filter((row) => {
  const matchGame = filters.game === '全部遊戲' || row.game === filters.game;
  const matchMerchant = filters.merchant === '全部商戶' || row.merchant === filters.merchant;
  const matchGameType = filters.gameType === '全部類型' || row.gameType === filters.gameType;
  const matchStatus = filters.status === '全部狀態' || row.status === filters.status;
  const matchCurrency = filters.currency === '全部幣別' || row.currency === filters.currency;
  return matchGame && matchMerchant && matchGameType && matchStatus && matchCurrency;
}));

const summaryCards = computed(() => {
  const rows = filteredRows.value;
  const weightedActual = rows.reduce((sum, row) => sum + row.actualRtp * row.rounds, 0) / Math.max(rows.reduce((sum, row) => sum + row.rounds, 0), 1);
  const maxDeviation = Math.max(...rows.map((row) => Math.abs(deviation(row))), 0);
  const deviated = rows.filter((row) => Math.abs(deviation(row)) >= 3).length;
  const rounds = rows.reduce((sum, row) => sum + row.rounds, 0);
  return [
    { label: '加權實際 RTP', value: `${weightedActual.toFixed(2)}%`, helper: '依樣本局數加權計算', icon: 'pi pi-percentage', severity: 'info' as Severity },
    { label: '最大偏離', value: `${maxDeviation.toFixed(2)}%`, helper: '偏離 >= 5% 需追蹤', icon: 'pi pi-exclamation-triangle', severity: maxDeviation >= 5 ? 'danger' as Severity : 'warn' as Severity },
    { label: '偏離項目', value: String(deviated), helper: '實際 RTP 與理論 RTP 差距 >= 3%', icon: 'pi pi-shield', severity: deviated > 0 ? 'warn' as Severity : 'success' as Severity },
    { label: '樣本局數', value: rounds.toLocaleString('en-US'), helper: '樣本不足不可直接判定異常', icon: 'pi pi-database', severity: 'success' as Severity }
  ];
});

const trendData = computed(() => ({
  labels: trendRows.map((row) => row.date),
  datasets: [
    { label: '實際 RTP', data: trendRows.map((row) => row.actual), borderColor: '#315f8c', backgroundColor: 'rgba(49, 95, 140, .14)', tension: 0.35, fill: true, pointRadius: 3 },
    { label: '理論 RTP', data: trendRows.map((row) => row.target), borderColor: '#256d63', borderDash: [6, 6], tension: 0.2, pointRadius: 0 },
    { label: '上限', data: trendRows.map((row) => row.upper), borderColor: '#b86f21', borderDash: [4, 4], tension: 0.2, pointRadius: 0 },
    { label: '下限', data: trendRows.map((row) => row.lower), borderColor: '#a94442', borderDash: [4, 4], tension: 0.2, pointRadius: 0 }
  ]
}));

const deviationData = computed(() => ({
  labels: filteredRows.value.map((row) => `${row.game} / ${row.merchant}`),
  datasets: [
    {
      label: '偏離值',
      data: filteredRows.value.map((row) => Number(deviation(row).toFixed(2))),
      backgroundColor: filteredRows.value.map((row) => Math.abs(deviation(row)) >= 5 ? '#a94442' : Math.abs(deviation(row)) >= 3 ? '#b86f21' : '#256d63'),
      borderRadius: 8,
      maxBarThickness: 30
    }
  ]
}));

const sampleData = computed(() => {
  const groups = ['Slot', 'Table', 'Live'];
  return {
    labels: groups,
    datasets: [
      {
        data: groups.map((group) => filteredRows.value.filter((row) => row.gameType === group).reduce((sum, row) => sum + row.rounds, 0)),
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

function deviation(row: RtpRow) {
  return row.actualRtp - row.targetRtp;
}

function formatMoney(value: number, currency: string) {
  const sign = value < 0 ? '-' : '';
  return `${currency} ${sign}${Math.abs(value).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

function tagSeverity(value: string): Severity {
  if (value === '偏離') return 'danger';
  if (['觀察', '樣本不足'].includes(value)) return 'warn';
  if (value === '正常') return 'success';
  return 'info';
}

function deviationSeverity(value: number): Severity {
  const abs = Math.abs(value);
  if (abs >= 5) return 'danger';
  if (abs >= 3) return 'warn';
  return 'success';
}

function openDetail(row: RtpRow) {
  selectedRow.value = row;
  detailDialogVisible.value = true;
}

function resetFilters() {
  filters.range = [startDate, today];
  filters.game = '全部遊戲';
  filters.merchant = '全部商戶';
  filters.gameType = '全部類型';
  filters.status = '全部狀態';
  filters.currency = '全部幣別';
  filters.mode = '實際 RTP';
}
</script>

<template>
  <div class="page-stack reports-page rtp-report-page">
    <FilterCard title="查詢條件" description="依時間、商戶、遊戲、幣別與監控狀態比較理論 RTP、實際 RTP 與偏離值。">

      <div class="trade-filter-grid">
        <DateTimeRangeField v-model="filters.range" class="trade-date-range" />
        <div class="field">
          <label>遊戲</label>
          <Select v-model="filters.game" :options="gameOptions" fluid />
        </div>
        <div class="field">
          <label>商戶</label>
          <Select v-model="filters.merchant" :options="merchantOptions" fluid />
        </div>
        <div class="field">
          <label>遊戲類型</label>
          <Select v-model="filters.gameType" :options="gameTypeOptions" fluid />
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
    </FilterCard>

    <SummaryCardGrid :cards="summaryCards" />

    <section class="risk-overview-chart-grid">
      <SectionCard class="chart-card chart-card-large">
        <template #header>
          <div class="dialog-title-block">
            <h2>RTP 監控趨勢</h2>
            <p>比較實際 RTP、理論 RTP 與容許上下限。</p>
          </div>
        </template>
        <Chart class="prime-dashboard-chart prime-dashboard-chart--large" type="line" :data="trendData" :options="chartOptions" :canvas-props="{ role: 'img', 'aria-label': 'RTP 監控趨勢' }" />
      </SectionCard>

      <SectionCard class="chart-card">
        <template #header>
          <div class="dialog-title-block">
            <h2>偏離排行</h2>
            <p>依遊戲與商戶顯示實際 RTP 偏離理論值。</p>
          </div>
        </template>
        <Chart class="prime-dashboard-chart prime-dashboard-chart--small" type="bar" :data="deviationData" :options="horizontalChartOptions" :canvas-props="{ role: 'img', 'aria-label': 'RTP 偏離排行' }" />
      </SectionCard>

      <SectionCard class="chart-card">
        <template #header>
          <div class="dialog-title-block">
            <h2>樣本分布</h2>
            <p>樣本局數依遊戲類型分布。</p>
          </div>
        </template>
        <Chart class="prime-dashboard-chart prime-dashboard-chart--small" type="doughnut" :data="sampleData" :options="doughnutOptions" :canvas-props="{ role: 'img', 'aria-label': 'RTP 樣本分布' }" />
      </SectionCard>
    </section>

    <SectionCard class="merchant-table-card">
      <template #header>
        <div class="dialog-title-block">
          <h2>RTP 明細</h2>
          <p>RTP 正式異常需由數值團隊與風控共同判斷，樣本不足不可直接調整數值版本。</p>
        </div>
      </template>

      <DataTable :value="filteredRows" :loading="loading" paginator :rows="10" :rows-per-page-options="[5, 10, 20, 50, 100]" scrollable table-style="min-width: 1220px">
        <Column field="game" header="遊戲" style="width: 150px; min-width: 150px" />
        <Column field="merchant" header="商戶" style="width: 150px; min-width: 150px" />
        <Column field="mathVersion" header="數值版本" style="width: 140px; min-width: 140px" />
        <Column header="理論 RTP" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 110px; min-width: 110px">
          <template #body="{ data }">
            <SensitiveValue :value="`${data.targetRtp.toFixed(2)}%`" />
          </template>
        </Column>
        <Column header="實際 RTP" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 110px; min-width: 110px">
          <template #body="{ data }">
            <strong>{{ data.actualRtp.toFixed(2) }}%</strong>
          </template>
        </Column>
        <Column header="偏離" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 96px; min-width: 96px">
          <template #body="{ data }">
            <Tag :value="`${deviation(data) > 0 ? '+' : ''}${deviation(data).toFixed(2)}%`" :severity="deviationSeverity(deviation(data))" />
          </template>
        </Column>
        <Column field="rounds" header="樣本局數" header-class="agent-table-cell-right" body-class="agent-table-cell-right" style="width: 120px; min-width: 120px">
          <template #body="{ data }">{{ data.rounds.toLocaleString('en-US') }}</template>
        </Column>
        <Column header="Bet" style="width: 128px; min-width: 128px">
          <template #body="{ data }"><CurrencyAmount :value="formatMoney(data.bet, data.currency)" /></template>
        </Column>
        <Column header="Win" style="width: 128px; min-width: 128px">
          <template #body="{ data }"><CurrencyAmount :value="formatMoney(data.win, data.currency)" /></template>
        </Column>
        <Column header="GGR" style="width: 128px; min-width: 128px">
          <template #body="{ data }"><CurrencyAmount :value="formatMoney(data.ggr, data.currency)" :negative="data.ggr < 0" /></template>
        </Column>
        <Column field="status" header="狀態" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 104px; min-width: 104px">
          <template #body="{ data }">
            <Tag :value="data.status" :severity="tagSeverity(data.status)" />
          </template>
        </Column>
        <Column field="updatedAt" header="更新時間" style="width: 160px; min-width: 160px" />
        <Column header="操作" frozen align-frozen="right" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 86px; min-width: 86px">
          <template #body="{ data }">
            <Button icon="pi pi-eye" text rounded severity="secondary" aria-label="查看" @click="openDetail(data)" />
          </template>
        </Column>
      </DataTable>
    </SectionCard>

    <Dialog v-model:visible="detailDialogVisible" modal dismissable-mask class="entity-dialog settlement-dialog" :style="{ width: 'min(840px, calc(100vw - 32px))' }">
      <template #header>
        <div class="dialog-title-block">
          <span>RTP 監控明細</span>
          <small>{{ selectedRow?.id }}</small>
        </div>
      </template>

      <div v-if="selectedRow" class="dialog-section">
        <h3>{{ selectedRow.game }} / {{ selectedRow.merchant }}</h3>
        <p class="dialog-section-note">{{ selectedRow.note }}</p>
        <div class="detail-grid dialog-detail-grid">
          <div><span>遊戲類型</span><strong>{{ selectedRow.gameType }}</strong></div>
          <div><span>數值版本</span><strong>{{ selectedRow.mathVersion }}</strong></div>
          <div><span>幣別</span><strong>{{ selectedRow.currency }}</strong></div>
          <div><span>理論 RTP</span><SensitiveValue :value="`${selectedRow.targetRtp.toFixed(2)}%`" /></div>
          <div><span>實際 RTP</span><strong>{{ selectedRow.actualRtp.toFixed(2) }}%</strong></div>
          <div><span>偏離</span><Tag :value="`${deviation(selectedRow) > 0 ? '+' : ''}${deviation(selectedRow).toFixed(2)}%`" :severity="deviationSeverity(deviation(selectedRow))" /></div>
          <div><span>樣本局數</span><strong>{{ selectedRow.rounds.toLocaleString('en-US') }}</strong></div>
          <div><span>Bet</span><CurrencyAmount :value="formatMoney(selectedRow.bet, selectedRow.currency)" /></div>
          <div><span>Win</span><CurrencyAmount :value="formatMoney(selectedRow.win, selectedRow.currency)" /></div>
          <div><span>GGR</span><CurrencyAmount :value="formatMoney(selectedRow.ggr, selectedRow.currency)" :negative="selectedRow.ggr < 0" /></div>
          <div><span>狀態</span><Tag :value="selectedRow.status" :severity="tagSeverity(selectedRow.status)" /></div>
          <div><span>更新時間</span><strong>{{ selectedRow.updatedAt }}</strong></div>
        </div>
      </div>

      <template #footer>
        <Button label="關閉" severity="secondary" outlined @click="detailDialogVisible = false" />
        <Button label="建立風控案件" icon="pi pi-shield" severity="danger" :disabled="!selectedRow || Math.abs(deviation(selectedRow)) < 3" />
      </template>
    </Dialog>
  </div>
</template>
