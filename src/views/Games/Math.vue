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
import DateTimeRangeField from '@/components/ui/DateTimeRangeField.vue';
import SensitiveValue from '@/components/ui/SensitiveValue.vue';

type MathRow = {
  id: string;
  game: string;
  version: string;
  theoreticalRtp: number;
  actualRtp: number;
  deviation: number;
  volatility: string;
  status: string;
  effectiveScope: string;
  sampleBets: number;
  reviewNo: string;
  reviewer: string;
  updatedAt: string;
  note: string;
};

const filters = reactive({
  keyword: '',
  game: '全部遊戲',
  status: '全部狀態',
  volatility: '全部波動率',
  monitoredAt: [null, null] as [Date | null, Date | null]
});

const selectedMath = ref<MathRow | null>(null);
const detailVisible = ref(false);
const reviewVisible = ref(false);

const mathRows = reactive<MathRow[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await fetch('/api/games/v2/math');
    const data: MathRow[] = await res.json();
    mathRows.splice(0, mathRows.length, ...data);
  } finally {
    loading.value = false;
  }
});


const gameOptions = computed(() => ['全部遊戲', ...Array.from(new Set(mathRows.map((row) => row.game)))]);
const statusOptions = ['全部狀態', '已生效', '觀察中', '測試中', '待審核', '已封存'];
const volatilityOptions = ['全部波動率', '低', '中', '中高', '高'];

const summaryCards = computed(() => {
  const active = mathRows.filter((row) => row.status === '已生效').length;
  const pending = mathRows.filter((row) => row.status === '待審核').length;
  const deviated = mathRows.filter((row) => Math.abs(row.deviation) >= 5).length;
  const samples = mathRows.reduce((sum, row) => sum + row.sampleBets, 0);

  return [
    { label: '數值版本', value: String(mathRows.length), helper: `已生效 ${active}，待審核 ${pending}` },
    { label: 'RTP 偏離', value: String(deviated), helper: '偏離 >= 5% 需追蹤' },
    { label: '樣本注單', value: samples.toLocaleString('en-US'), helper: '依目前監控區間加總' },
    { label: '正式異動', value: '需審核', helper: 'RTP / 賠率表 / 生效範圍' }
  ];
});

const rtpTrend = [
  { label: '05/14', value: 95.8 },
  { label: '05/15', value: 96.1 },
  { label: '05/16', value: 99.4 },
  { label: '05/17', value: 101.2 },
  { label: '05/18', value: 98.6 },
  { label: '05/19', value: 103.1 },
  { label: '05/20', value: 101.4 }
];

function resetFilters() {
  filters.keyword = '';
  filters.game = '全部遊戲';
  filters.status = '全部狀態';
  filters.volatility = '全部波動率';
  filters.monitoredAt = [null, null];
}

function openDetail(row: MathRow) {
  selectedMath.value = row;
  detailVisible.value = true;
}

function openReview(row?: MathRow) {
  if (row) selectedMath.value = row;
  reviewVisible.value = true;
}

function deviationSeverity(row: MathRow) {
  const abs = Math.abs(row.deviation);
  if (abs >= 10) return 'danger';
  if (abs >= 5) return 'warn';
  return 'success';
}

function deviationLabel(value: number) {
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
}
</script>

<template>
  <div class="page-stack game-math-page">
    <div class="agent-summary-grid">
      <article v-for="item in summaryCards" :key="item.label" class="agent-summary-card">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <small>{{ item.helper }}</small>
      </article>
    </div>

    <section class="math-monitor-grid">
      <SectionCard>
        <template #header>
          <div class="dialog-title-block">
            <h2>RTP 監控趨勢</h2>
            <p>依時間區間觀察實際 RTP 是否偏離理論值。</p>
          </div>
        </template>
        <div class="rtp-trend">
          <div v-for="point in rtpTrend" :key="point.label" class="rtp-trend-bar">
            <span :style="{ height: `${Math.max(18, point.value - 80) * 4}px` }" />
            <small>{{ point.label }}</small>
            <strong>{{ point.value.toFixed(1) }}%</strong>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <template #header>
          <div class="dialog-title-block">
            <h2>審核提醒</h2>
            <p>正式環境的 RTP、賠率表與生效範圍異動不可直接套用。</p>
          </div>
        </template>
        <div class="math-review-panel">
          <div>
            <span>待審核數值</span>
            <strong>{{ mathRows.filter((row) => row.status === '待審核').length }}</strong>
          </div>
          <div>
            <span>高偏離監控</span>
            <strong>{{ mathRows.filter((row) => Math.abs(row.deviation) >= 10).length }}</strong>
          </div>
          <Button label="建立審核單" icon="pi pi-send" @click="openReview()" />
        </div>
      </SectionCard>
    </section>

    <SectionCard class="merchant-filter-card">
      <template #header>
        <div class="dialog-title-block">
          <h2>查詢條件</h2>
          <p>查詢數值版本、RTP 偏離、波動率、審核狀態與監控時間區間。</p>
        </div>
      </template>

      <div class="math-filter-grid">
        <div class="field math-filter-keyword">
          <label>關鍵字</label>
          <InputText v-model="filters.keyword" placeholder="輸入遊戲、數值版本或審核單號" fluid />
        </div>
        <div class="field">
          <label>遊戲</label>
          <Select v-model="filters.game" :options="gameOptions" fluid />
        </div>
        <div class="field">
          <label>狀態</label>
          <Select v-model="filters.status" :options="statusOptions" fluid />
        </div>
        <div class="field">
          <label>波動率</label>
          <Select v-model="filters.volatility" :options="volatilityOptions" fluid />
        </div>
        <DateTimeRangeField
          class="math-date-range"
          :model-value="filters.monitoredAt"
          @update:model-value="filters.monitoredAt = $event"
        />
        <div class="math-filter-actions">
          <Button label="查詢" icon="pi pi-search" />
          <Button label="重置" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" />
        </div>
      </div>
    </SectionCard>

    <div class="agent-command-bar">
      <div>
        <span class="table-count"><Badge :value="mathRows.length" severity="info" /> 筆數值</span>
        <p>已生效數值不可直接修改；需複製新版本、模擬、送審後生效。</p>
      </div>
      <div class="agent-command-actions">
        <Button label="新增數值版本" icon="pi pi-plus" />
        <Button label="匯出" icon="pi pi-download" severity="secondary" outlined />
      </div>
    </div>

    <SectionCard class="merchant-table-card math-table-card">
      <DataTable
        :value="mathRows"
        :loading="loading"
        scrollable
        paginator
        :rows="10"
        :rows-per-page-options="[5, 10, 20, 50, 100]"
        paginator-template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
        current-page-report-template="{first}-{last} / {totalRecords}"
        data-key="id"
        table-style="min-width: 1280px"
      >
        <Column field="id" header="數值代號" frozen style="width: 144px; min-width: 144px">
          <template #body="{ data }">
            <strong class="linkish" @click="openDetail(data)">{{ data.id }}</strong>
          </template>
        </Column>
        <Column field="game" header="遊戲" style="width: 148px; min-width: 148px">
          <template #body="{ data }">
            <strong class="agent-primary-text">{{ data.game }}</strong>
          </template>
        </Column>
        <Column field="version" header="數值版本" style="width: 128px; min-width: 128px" />
        <Column field="theoreticalRtp" header="理論 RTP" header-class="agent-table-cell-right" body-class="agent-table-cell-right" style="width: 104px; min-width: 104px">
          <template #body="{ data }">{{ data.theoreticalRtp.toFixed(2) }}%</template>
        </Column>
        <Column field="actualRtp" header="實際 RTP" header-class="agent-table-cell-right" body-class="agent-table-cell-right" style="width: 104px; min-width: 104px">
          <template #body="{ data }">{{ data.actualRtp.toFixed(2) }}%</template>
        </Column>
        <Column field="deviation" header="偏離" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 96px; min-width: 96px">
          <template #body="{ data }">
            <Tag :value="deviationLabel(data.deviation)" :severity="deviationSeverity(data)" />
          </template>
        </Column>
        <Column field="volatility" header="波動率" style="width: 92px; min-width: 92px" />
        <Column field="status" header="狀態" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 104px; min-width: 104px">
          <template #body="{ data }">
            <StatusTag :value="data.status" />
          </template>
        </Column>
        <Column field="sampleBets" header="樣本注單" header-class="agent-table-cell-right" body-class="agent-table-cell-right" style="width: 116px; min-width: 116px">
          <template #body="{ data }">{{ data.sampleBets.toLocaleString('en-US') }}</template>
        </Column>
        <Column field="reviewNo" header="審核單" style="width: 148px; min-width: 148px" />
        <Column field="updatedAt" header="更新時間" style="width: 168px; min-width: 168px" />
        <Column header="操作" frozen align-frozen="right" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 112px; min-width: 112px">
          <template #body="{ data }">
            <div class="row-actions">
              <Button v-tooltip.top="'查看數值'" icon="pi pi-eye" text severity="secondary" aria-label="查看數值" @click="openDetail(data)" />
              <Button v-tooltip.top="'送審'" icon="pi pi-send" text severity="secondary" aria-label="送審" @click="openReview(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </SectionCard>

    <Dialog v-model:visible="detailVisible" modal dismissable-mask header="數值版本詳情" class="entity-dialog">
      <div v-if="selectedMath" class="entity-dialog-body">
        <section class="dialog-section">
          <h3>數值摘要</h3>
          <div class="detail-grid dialog-detail-grid">
            <div><span>數值代號</span><strong>{{ selectedMath.id }}</strong></div>
            <div><span>遊戲</span><strong>{{ selectedMath.game }}</strong></div>
            <div><span>數值版本</span><SensitiveValue :value="selectedMath.version" /></div>
            <div><span>生效範圍</span><strong>{{ selectedMath.effectiveScope }}</strong></div>
            <div><span>理論 RTP</span><SensitiveValue :value="`${selectedMath.theoreticalRtp.toFixed(2)}%`" /></div>
            <div><span>實際 RTP</span><strong>{{ selectedMath.actualRtp.toFixed(2) }}%</strong></div>
            <div><span>偏離</span><Tag :value="deviationLabel(selectedMath.deviation)" :severity="deviationSeverity(selectedMath)" /></div>
            <div><span>波動率</span><strong>{{ selectedMath.volatility }}</strong></div>
          </div>
        </section>

        <section class="dialog-section">
          <h3>監控與審核</h3>
          <div class="detail-grid dialog-detail-grid">
            <div><span>樣本注單</span><strong>{{ selectedMath.sampleBets.toLocaleString('en-US') }}</strong></div>
            <div><span>審核單號</span><strong>{{ selectedMath.reviewNo }}</strong></div>
            <div><span>審核人</span><strong>{{ selectedMath.reviewer }}</strong></div>
            <div><span>狀態</span><StatusTag :value="selectedMath.status" /></div>
            <div class="detail-field-wide"><span>備註</span><strong>{{ selectedMath.note }}</strong></div>
          </div>
        </section>
      </div>

      <template #footer>
        <div class="dialog-footer-actions">
          <Button label="關閉" severity="secondary" outlined @click="detailVisible = false" />
          <Button label="複製新版本" icon="pi pi-copy" severity="secondary" outlined />
          <Button label="送審" icon="pi pi-send" @click="selectedMath && openReview(selectedMath)" />
        </div>
      </template>
    </Dialog>

    <Dialog v-model:visible="reviewVisible" modal dismissable-mask header="數值審核申請" class="disable-agent-dialog">
      <div class="disable-dialog-body">
        <div class="disable-warning-card">
          <i class="pi pi-shield" />
          <div>
            <strong>正式環境數值異動需送審。</strong>
            <p>修改 RTP、賠率表、波動率或生效範圍都必須建立審核單並留下操作紀錄。</p>
          </div>
        </div>
        <div class="dialog-form-grid">
          <div class="field field-span-6">
            <label>遊戲</label>
            <InputText :model-value="selectedMath?.game || ''" disabled fluid />
          </div>
          <div class="field field-span-6">
            <label>數值版本</label>
            <InputText :model-value="selectedMath?.version || ''" disabled fluid />
          </div>
          <div class="field field-span-6">
            <label>模擬次數</label>
            <InputNumber :model-value="1000000" :min="1000" fluid />
          </div>
          <div class="field field-span-6">
            <label>期望 RTP</label>
            <InputNumber :model-value="selectedMath?.theoreticalRtp || 96" :min="80" :max="120" suffix="%" :max-fraction-digits="2" fluid />
          </div>
          <div class="field field-span-12">
            <label>申請原因</label>
            <Textarea rows="3" placeholder="請輸入數值異動、偏離處理或版本送審原因" fluid />
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="取消" severity="secondary" outlined @click="reviewVisible = false" />
        <Button label="建立審核單" icon="pi pi-check" @click="reviewVisible = false" />
      </template>
    </Dialog>
  </div>
</template>
