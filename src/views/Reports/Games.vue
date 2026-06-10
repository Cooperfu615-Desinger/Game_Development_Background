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

interface GameReportRow {
  id: string;
  game: string;
  gameType: string;
  status: string;
  merchants: number;
  currency: string;
  bet: number;
  win: number;
  ggr: number;
  rtp: number;
  rounds: number;
  avgBet: number;
  jackpotContribution: number;
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
  gameType: '全部類型',
  merchant: '全部商戶',
  currency: '全部幣別',
  status: '全部狀態',
  mode: '對帳幣別'
});

const selectedRow = ref<GameReportRow | null>(null);
const detailDialogVisible = ref(false);

const gameOptions = ['全部遊戲', 'Fortune Tiger', 'Royal H5', 'Blackjack Live', 'Baccarat Pro', 'Dragon Slot'];
const gameTypeOptions = ['全部類型', 'Slot', 'Table', 'Live'];
const merchantOptions = ['全部商戶', 'Golden Dragon', 'LuckyPlay', 'Nova Gaming', 'Royal H5'];
const currencyOptions = ['全部幣別', 'USDT', 'USD', 'TWD'];
const statusOptions = ['全部狀態', '上架', '維護中', '觀察'];
const modeOptions = ['原幣別', '對帳幣別'];

const gameRows = reactive<GameReportRow[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const data = await api.get<GameReportRow[]>('/api/reports/v2/games');
    gameRows.splice(0, gameRows.length, ...data);
  } finally {
    loading.value = false;
  }
});

const trendRows = [
  { date: '05/15', bet: 820000, win: 772000, ggr: 48000 },
  { date: '05/16', bet: 930000, win: 892000, ggr: 38000 },
  { date: '05/17', bet: 880000, win: 806500, ggr: 73500 },
  { date: '05/18', bet: 1028000, win: 972400, ggr: 55600 },
  { date: '05/19', bet: 1162000, win: 1104400, ggr: 57600 },
  { date: '05/20', bet: 1088000, win: 1011200, ggr: 76800 },
  { date: '05/21', bet: 1286800, win: 1212400, ggr: 74400 }
];

const filteredRows = computed(() => gameRows.filter((row) => {
  const matchGame = filters.game === '全部遊戲' || row.game === filters.game;
  const matchGameType = filters.gameType === '全部類型' || row.gameType === filters.gameType;
  const matchCurrency = filters.currency === '全部幣別' || row.currency === filters.currency;
  const matchStatus = filters.status === '全部狀態' || row.status === filters.status;
  return matchGame && matchGameType && matchCurrency && matchStatus;
}));

const summaryCards = computed(() => {
  const rows = filteredRows.value;
  const bet = rows.reduce((sum, row) => sum + row.bet, 0);
  const win = rows.reduce((sum, row) => sum + row.win, 0);
  const ggr = rows.reduce((sum, row) => sum + row.ggr, 0);
  const rounds = rows.reduce((sum, row) => sum + row.rounds, 0);
  const weightedRtp = rows.reduce((sum, row) => sum + row.rtp * row.rounds, 0) / Math.max(rounds, 1);
  return [
    { label: '總投注', value: formatMoney(bet, 'USDT'), helper: '依目前篩選條件統計', icon: 'pi pi-wallet', severity: 'info' as Severity },
    { label: '總派彩', value: formatMoney(win, 'USDT'), helper: '含所有遊戲類型', icon: 'pi pi-send', severity: 'success' as Severity },
    { label: 'GGR', value: formatMoney(ggr, 'USDT'), helper: ggr < 0 ? '本期可能為負' : 'Bet - Win', icon: 'pi pi-chart-line', severity: ggr < 0 ? 'danger' as Severity : 'success' as Severity },
    { label: '加權 RTP', value: `${weightedRtp.toFixed(2)}%`, helper: `${rounds.toLocaleString('en-US')} 局樣本`, icon: 'pi pi-percentage', severity: weightedRtp > 102 || weightedRtp < 90 ? 'warn' as Severity : 'info' as Severity }
  ];
});

const trendData = computed(() => ({
  labels: trendRows.map((row) => row.date),
  datasets: [
    { label: 'Bet', data: trendRows.map((row) => row.bet), borderColor: '#315f8c', backgroundColor: 'rgba(49, 95, 140, .14)', tension: 0.35, fill: true, pointRadius: 3 },
    { label: 'Win', data: trendRows.map((row) => row.win), borderColor: '#256d63', backgroundColor: 'rgba(37, 109, 99, .10)', tension: 0.35, fill: true, pointRadius: 3 },
    { label: 'GGR', data: trendRows.map((row) => row.ggr), borderColor: '#b86f21', backgroundColor: 'rgba(184, 111, 33, .10)', tension: 0.35, fill: false, pointRadius: 3 }
  ]
}));

const typeData = computed(() => {
  const groups = ['Slot', 'Table', 'Live'];
  return {
    labels: groups,
    datasets: [
      {
        data: groups.map((group) => filteredRows.value.filter((row) => row.gameType === group).reduce((sum, row) => sum + row.ggr, 0)),
        backgroundColor: ['#315f8c', '#256d63', '#b86f21'],
        borderWidth: 0
      }
    ]
  };
});

const rankingData = computed(() => ({
  labels: filteredRows.value.map((row) => row.game),
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
  if (value === '維護中') return 'warn';
  if (value === '觀察') return 'info';
  if (value === '上架') return 'success';
  return 'secondary';
}

function openDetail(row: GameReportRow) {
  selectedRow.value = row;
  detailDialogVisible.value = true;
}

function resetFilters() {
  filters.range = [startDate, today];
  filters.game = '全部遊戲';
  filters.gameType = '全部類型';
  filters.merchant = '全部商戶';
  filters.currency = '全部幣別';
  filters.status = '全部狀態';
  filters.mode = '對帳幣別';
}
</script>

<template>
  <div class="page-stack reports-page game-report-page">
    <FilterCard title="查詢條件" description="依時間、遊戲、商戶、類型、幣別與狀態查詢遊戲投注、派彩、GGR 與 RTP。">

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
          <label>幣別</label>
          <Select v-model="filters.currency" :options="currencyOptions" fluid />
        </div>
        <div class="field">
          <label>狀態</label>
          <Select v-model="filters.status" :options="statusOptions" fluid />
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
            <h2>遊戲營收趨勢</h2>
            <p>比較 Bet、Win 與 GGR 的近 7 日變化。</p>
          </div>
        </template>
        <Chart class="prime-dashboard-chart prime-dashboard-chart--large" type="line" :data="trendData" :options="chartOptions" :canvas-props="{ role: 'img', 'aria-label': '遊戲營收趨勢' }" />
      </SectionCard>

      <SectionCard class="chart-card">
        <template #header>
          <div class="dialog-title-block">
            <h2>遊戲類型分布</h2>
            <p>依遊戲類型統計 GGR 占比。</p>
          </div>
        </template>
        <Chart class="prime-dashboard-chart prime-dashboard-chart--small" type="doughnut" :data="typeData" :options="doughnutOptions" :canvas-props="{ role: 'img', 'aria-label': '遊戲類型 GGR 分布' }" />
      </SectionCard>

      <SectionCard class="chart-card">
        <template #header>
          <div class="dialog-title-block">
            <h2>遊戲 GGR 排行</h2>
            <p>快速查看主要遊戲貢獻與負 GGR。</p>
          </div>
        </template>
        <Chart class="prime-dashboard-chart prime-dashboard-chart--small" type="bar" :data="rankingData" :options="horizontalChartOptions" :canvas-props="{ role: 'img', 'aria-label': '遊戲 GGR 排行' }" />
      </SectionCard>
    </section>

    <SectionCard class="merchant-table-card">
      <template #header>
        <div class="dialog-title-block">
          <h2>遊戲明細</h2>
          <p>遊戲報表用於營運分析；RTP 異常判斷請搭配 RTP 報表與樣本量檢查。</p>
        </div>
      </template>

      <DataTable :value="filteredRows" :loading="loading" paginator :rows="10" :rows-per-page-options="[5, 10, 20, 50, 100]" scrollable table-style="min-width: 1220px">
        <Column field="game" header="遊戲" style="width: 150px; min-width: 150px" />
        <Column field="gameType" header="類型" style="width: 100px; min-width: 100px" />
        <Column field="merchants" header="商戶數" header-class="agent-table-cell-right" body-class="agent-table-cell-right" style="width: 100px; min-width: 100px" />
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
        <Column field="rounds" header="局數" header-class="agent-table-cell-right" body-class="agent-table-cell-right" style="width: 118px; min-width: 118px">
          <template #body="{ data }">{{ data.rounds.toLocaleString('en-US') }}</template>
        </Column>
        <Column header="Jackpot 貢獻" style="width: 136px; min-width: 136px">
          <template #body="{ data }"><CurrencyAmount :value="formatMoney(data.jackpotContribution, data.currency)" /></template>
        </Column>
        <Column field="status" header="狀態" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 100px; min-width: 100px">
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
          <span>遊戲報表明細</span>
          <small>{{ selectedRow?.id }}</small>
        </div>
      </template>

      <div v-if="selectedRow" class="dialog-section">
        <h3>{{ selectedRow.game }}</h3>
        <p class="dialog-section-note">{{ selectedRow.note }}</p>
        <div class="detail-grid dialog-detail-grid">
          <div><span>遊戲類型</span><strong>{{ selectedRow.gameType }}</strong></div>
          <div><span>商戶數</span><strong>{{ selectedRow.merchants }}</strong></div>
          <div><span>狀態</span><Tag :value="selectedRow.status" :severity="tagSeverity(selectedRow.status)" /></div>
          <div><span>Bet</span><CurrencyAmount :value="formatMoney(selectedRow.bet, selectedRow.currency)" /></div>
          <div><span>Win</span><CurrencyAmount :value="formatMoney(selectedRow.win, selectedRow.currency)" /></div>
          <div><span>GGR</span><CurrencyAmount :value="formatMoney(selectedRow.ggr, selectedRow.currency)" :negative="selectedRow.ggr < 0" /></div>
          <div><span>RTP</span><SensitiveValue :value="`${selectedRow.rtp.toFixed(2)}%`" /></div>
          <div><span>局數</span><strong>{{ selectedRow.rounds.toLocaleString('en-US') }}</strong></div>
          <div><span>平均投注</span><CurrencyAmount :value="formatMoney(selectedRow.avgBet, selectedRow.currency)" /></div>
          <div><span>Jackpot 貢獻</span><CurrencyAmount :value="formatMoney(selectedRow.jackpotContribution, selectedRow.currency)" /></div>
          <div><span>更新時間</span><strong>{{ selectedRow.updatedAt }}</strong></div>
        </div>
      </div>

      <template #footer>
        <Button label="關閉" severity="secondary" outlined @click="detailDialogVisible = false" />
        <Button label="查看 RTP 報表" icon="pi pi-percentage" />
      </template>
    </Dialog>
  </div>
</template>
