<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Badge from 'primevue/badge';
import Dialog from 'primevue/dialog';
import DateTimeRangeField from '@/components/ui/DateTimeRangeField.vue';
import SectionCard from '@/components/ui/SectionCard.vue';
import SummaryCardGrid from '@/components/ui/SummaryCardGrid.vue';

type Severity = 'success' | 'info' | 'warn' | 'danger' | 'secondary';

type RiskRuleRow = {
  id: string;
  name: string;
  category: string;
  scope: string;
  target: string;
  threshold: string;
  cycle: string;
  action: string;
  notify: string;
  status: string;
  reviewStatus: string;
  riskLevel: string;
  hitCount: number;
  falsePositiveRate: string;
  owner: string;
  updatedAt: string;
  description: string;
};

const router = useRouter();

const allOption = '全部';

const filters = reactive({
  keyword: '',
  category: allOption,
  scope: allOption,
  status: allOption,
  reviewStatus: allOption,
  owner: allOption,
  updatedAt: [null, null] as [Date | null, Date | null]
});

const selectedRule = ref<RiskRuleRow | null>(null);
const detailVisible = ref(false);
const disableVisible = ref(false);
const copyVisible = ref(false);
const disableReason = ref('');
const copyName = ref('');

const ruleRows = reactive<RiskRuleRow[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await fetch('/api/risk/v2/rules');
    ruleRows.splice(0, ruleRows.length, ...await res.json());
  } finally {
    loading.value = false;
  }
});

const categoryOptions = computed(() => [allOption, ...Array.from(new Set(ruleRows.map((row) => row.category)))]);
const scopeOptions = computed(() => [allOption, ...Array.from(new Set(ruleRows.map((row) => row.scope)))]);
const statusOptions = computed(() => [allOption, '啟用', '待審核', '停用']);
const reviewOptions = computed(() => [allOption, '已核准', '送審中', '退回']);
const ownerOptions = computed(() => [allOption, ...Array.from(new Set(ruleRows.map((row) => row.owner)))]);

const filteredRows = computed(() => {
  const keyword = filters.keyword.trim().toLowerCase();
  return ruleRows.filter((row) => {
    const matchKeyword = !keyword || [row.id, row.name, row.category, row.target, row.action].some((value) => value.toLowerCase().includes(keyword));
    const matchCategory = filters.category === allOption || row.category === filters.category;
    const matchScope = filters.scope === allOption || row.scope === filters.scope;
    const matchStatus = filters.status === allOption || row.status === filters.status;
    const matchReview = filters.reviewStatus === allOption || row.reviewStatus === filters.reviewStatus;
    const matchOwner = filters.owner === allOption || row.owner === filters.owner;
    return matchKeyword && matchCategory && matchScope && matchStatus && matchReview && matchOwner;
  });
});

const summaryCards = computed(() => {
  const active = ruleRows.filter((row) => row.status === '啟用').length;
  const review = ruleRows.filter((row) => row.reviewStatus === '送審中').length;
  const highFalsePositive = ruleRows.filter((row) => Number(row.falsePositiveRate.replace('%', '')) >= 10).length;

  return [
    { label: '規則總數', value: String(ruleRows.length), helper: '涵蓋錢包、投注、派彩與 RTP 監控' },
    { label: '啟用中', value: String(active), helper: '命中後依動作建立案件或通知' },
    { label: '待審核', value: String(review), helper: '條件、門檻或範圍變更需核准' },
    { label: '需校準', value: String(highFalsePositive), helper: '誤報率偏高，建議調整門檻' }
  ];
});

function tagSeverity(value: string): Severity {
  if (['停用', '高風險', '嚴重'].includes(value)) return 'danger';
  if (['待審核', '送審中', '中風險'].includes(value)) return 'warn';
  if (['啟用', '已核准', '低風險'].includes(value)) return 'success';
  return 'info';
}

function resetFilters() {
  filters.keyword = '';
  filters.category = allOption;
  filters.scope = allOption;
  filters.status = allOption;
  filters.reviewStatus = allOption;
  filters.owner = allOption;
  filters.updatedAt = [null, null];
}

function openDetail(row: RiskRuleRow) {
  selectedRule.value = row;
  detailVisible.value = true;
}

function openDisable(row: RiskRuleRow) {
  selectedRule.value = row;
  disableReason.value = '';
  disableVisible.value = true;
}

function openCopy(row: RiskRuleRow) {
  selectedRule.value = row;
  copyName.value = `${row.name} - 複本`;
  copyVisible.value = true;
}

function confirmCopy() {
  if (!selectedRule.value) return;
  router.push({
    path: '/risks/rules/new',
    query: {
      copyFrom: selectedRule.value.id,
      draftName: copyName.value
    }
  });
}

function confirmDisable() {
  if (!selectedRule.value) return;
  selectedRule.value.reviewStatus = '送審中';
  selectedRule.value.status = '待審核';
  disableVisible.value = false;
}
</script>

<template>
  <div class="page-stack risk-rules-page">
    <SummaryCardGrid :cards="summaryCards" />

    <SectionCard class="merchant-filter-card">
      <template #header>
        <div class="dialog-title-block">
          <h2>查詢條件</h2>
          <p>查詢風控規則、審核狀態、適用範圍與負責人。</p>
        </div>
      </template>

      <div class="trade-filter-grid">
        <div class="field trade-filter-keyword">
          <label>關鍵字</label>
          <InputText v-model="filters.keyword" placeholder="輸入規則代號、名稱或條件" fluid />
        </div>
        <div class="field">
          <label>規則分類</label>
          <Select v-model="filters.category" :options="categoryOptions" fluid />
        </div>
        <div class="field">
          <label>生效範圍</label>
          <Select v-model="filters.scope" :options="scopeOptions" fluid />
        </div>
        <div class="field">
          <label>狀態</label>
          <Select v-model="filters.status" :options="statusOptions" fluid />
        </div>
        <div class="field">
          <label>審核狀態</label>
          <Select v-model="filters.reviewStatus" :options="reviewOptions" fluid />
        </div>
        <div class="field">
          <label>負責人</label>
          <Select v-model="filters.owner" :options="ownerOptions" fluid />
        </div>
        <DateTimeRangeField v-model="filters.updatedAt" class="trade-date-range" />
        <div class="trade-filter-actions">
          <Button label="查詢" icon="pi pi-search" />
          <Button label="重置" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" />
        </div>
      </div>
    </SectionCard>

    <div class="agent-command-bar">
      <div>
        <span class="table-count"><Badge :value="filteredRows.length" severity="info" /> 筆規則</span>
        <p>規則不可硬刪除；停用、門檻、範圍與處置動作變更會留下操作紀錄並依正式環境送審。</p>
      </div>
      <div class="agent-command-actions">
        <Button label="新增規則" icon="pi pi-plus" @click="router.push('/risks/rules/new')" />
        <Button label="匯出" icon="pi pi-download" severity="secondary" outlined />
      </div>
    </div>

    <SectionCard class="merchant-table-card trade-table-card">
      <DataTable
        :value="filteredRows"
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
        <Column field="id" header="規則代號" frozen style="width: 132px; min-width: 132px">
          <template #body="{ data }">
            <strong class="linkish" @click="openDetail(data)">{{ data.id }}</strong>
          </template>
        </Column>
        <Column field="name" header="規則名稱" style="width: 190px; min-width: 190px">
          <template #body="{ data }">
            <strong class="agent-primary-text">{{ data.name }}</strong>
            <small class="agent-secondary-text">{{ data.category }}</small>
          </template>
        </Column>
        <Column field="scope" header="範圍" style="width: 110px; min-width: 110px" />
        <Column field="target" header="監控目標" style="width: 170px; min-width: 170px" />
        <Column field="threshold" header="門檻" style="width: 132px; min-width: 132px" />
        <Column field="cycle" header="週期" style="width: 104px; min-width: 104px" />
        <Column field="action" header="處置動作" style="width: 148px; min-width: 148px" />
        <Column field="riskLevel" header="風險" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 108px; min-width: 108px">
          <template #body="{ data }">
            <Tag :value="data.riskLevel" :severity="tagSeverity(data.riskLevel)" />
          </template>
        </Column>
        <Column field="status" header="狀態" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 106px; min-width: 106px">
          <template #body="{ data }">
            <Tag :value="data.status" :severity="tagSeverity(data.status)" />
          </template>
        </Column>
        <Column field="reviewStatus" header="審核" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 112px; min-width: 112px">
          <template #body="{ data }">
            <Tag :value="data.reviewStatus" :severity="tagSeverity(data.reviewStatus)" />
          </template>
        </Column>
        <Column field="hitCount" header="命中" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 82px; min-width: 82px">
          <template #body="{ data }">
            <strong>{{ data.hitCount }}</strong>
          </template>
        </Column>
        <Column field="falsePositiveRate" header="誤報率" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 92px; min-width: 92px" />
        <Column field="owner" header="負責人" style="width: 122px; min-width: 122px" />
        <Column field="updatedAt" header="更新時間" style="width: 168px; min-width: 168px" />
        <Column header="操作" frozen align-frozen="right" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 156px; min-width: 156px">
          <template #body="{ data }">
            <div class="row-actions">
              <Button v-tooltip.top="'檢視'" icon="pi pi-eye" text severity="secondary" aria-label="檢視" @click="openDetail(data)" />
              <Button v-tooltip.top="'複製'" icon="pi pi-copy" text severity="secondary" aria-label="複製" @click="openCopy(data)" />
              <Button v-tooltip.top="'編輯'" icon="pi pi-pencil" text severity="secondary" aria-label="編輯" @click="router.push(`/risks/rules/${data.id}/edit`)" />
              <Button v-tooltip.top="'停用'" icon="pi pi-ban" text severity="secondary" aria-label="停用" @click="openDisable(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </SectionCard>

    <Dialog v-model:visible="detailVisible" modal dismissable-mask header="風控規則詳情" class="entity-dialog">
      <div v-if="selectedRule" class="entity-dialog-body">
        <section class="dialog-section">
          <h3>規則摘要</h3>
          <div class="detail-grid dialog-detail-grid">
            <div><span>規則代號</span><strong>{{ selectedRule.id }}</strong></div>
            <div><span>規則名稱</span><strong>{{ selectedRule.name }}</strong></div>
            <div><span>分類</span><strong>{{ selectedRule.category }}</strong></div>
            <div><span>範圍</span><strong>{{ selectedRule.scope }}</strong></div>
            <div><span>風險等級</span><Tag :value="selectedRule.riskLevel" :severity="tagSeverity(selectedRule.riskLevel)" /></div>
            <div><span>狀態</span><Tag :value="selectedRule.status" :severity="tagSeverity(selectedRule.status)" /></div>
            <div><span>審核狀態</span><Tag :value="selectedRule.reviewStatus" :severity="tagSeverity(selectedRule.reviewStatus)" /></div>
            <div><span>負責人</span><strong>{{ selectedRule.owner }}</strong></div>
          </div>
        </section>

        <section class="dialog-section">
          <h3>條件與動作</h3>
          <div class="detail-grid dialog-detail-grid">
            <div><span>監控目標</span><strong>{{ selectedRule.target }}</strong></div>
            <div><span>門檻</span><strong>{{ selectedRule.threshold }}</strong></div>
            <div><span>週期</span><strong>{{ selectedRule.cycle }}</strong></div>
            <div><span>處置動作</span><strong>{{ selectedRule.action }}</strong></div>
            <div><span>通知對象</span><strong>{{ selectedRule.notify }}</strong></div>
            <div><span>命中次數</span><strong>{{ selectedRule.hitCount }}</strong></div>
            <div><span>誤報率</span><strong>{{ selectedRule.falsePositiveRate }}</strong></div>
            <div><span>更新時間</span><strong>{{ selectedRule.updatedAt }}</strong></div>
            <div class="detail-field-wide"><span>說明</span><strong>{{ selectedRule.description }}</strong></div>
          </div>
        </section>
      </div>

      <template #footer>
        <div class="dialog-footer-actions">
          <Button label="關閉" severity="secondary" outlined @click="detailVisible = false" />
          <Button label="複製規則" icon="pi pi-copy" severity="secondary" outlined @click="selectedRule && openCopy(selectedRule)" />
          <Button label="編輯規則" icon="pi pi-pencil" @click="selectedRule && router.push(`/risks/rules/${selectedRule.id}/edit`)" />
        </div>
      </template>
    </Dialog>

    <Dialog v-model:visible="copyVisible" modal dismissable-mask header="複製風控規則" class="confirm-dialog">
      <div v-if="selectedRule" class="confirm-dialog-body">
        <i class="pi pi-copy" />
        <div>
          <h3>複製 {{ selectedRule.id }}</h3>
          <p>會以原規則的範圍、條件、門檻與通知動作建立草稿，正式啟用前仍需送審。</p>
        </div>
      </div>
      <div class="dialog-form-grid">
        <div class="field detail-field-wide">
          <label>新規則名稱</label>
          <InputText v-model="copyName" fluid />
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer-actions">
          <Button label="取消" severity="secondary" outlined @click="copyVisible = false" />
          <Button label="建立草稿" icon="pi pi-check" @click="confirmCopy" />
        </div>
      </template>
    </Dialog>

    <Dialog v-model:visible="disableVisible" modal dismissable-mask header="停用風控規則" class="disable-agent-dialog">
      <div v-if="selectedRule" class="disable-agent-body">
        <div class="disable-agent-warning">
          <i class="pi pi-exclamation-triangle" />
          <div>
            <strong>停用 {{ selectedRule.id }} 需送審</strong>
            <p>停用後不會再觸發新案件或通知，但歷史命中、審核與操作紀錄會保留。</p>
          </div>
        </div>
        <div class="disable-agent-summary">
          <div><span>規則名稱</span><strong>{{ selectedRule.name }}</strong></div>
          <div><span>目前狀態</span><Tag :value="selectedRule.status" :severity="tagSeverity(selectedRule.status)" /></div>
        </div>
        <div class="field">
          <label>停用原因</label>
          <Textarea v-model="disableReason" rows="3" auto-resize placeholder="請填寫停用原因，將寫入審核單與操作紀錄" fluid />
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer-actions">
          <Button label="取消" severity="secondary" outlined @click="disableVisible = false" />
          <Button label="送出審核" icon="pi pi-check" @click="confirmDisable" />
        </div>
      </template>
    </Dialog>
  </div>
</template>
