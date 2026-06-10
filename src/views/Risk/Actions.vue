<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Badge from 'primevue/badge';
import Dialog from 'primevue/dialog';
import DateTimeRangeField from '@/components/ui/DateTimeRangeField.vue';
import SectionCard from '@/components/ui/SectionCard.vue';
import SensitiveValue from '@/components/ui/SensitiveValue.vue';
import SummaryCardGrid from '@/components/ui/SummaryCardGrid.vue';

type Severity = 'success' | 'info' | 'warn' | 'danger' | 'secondary';

type RiskActionRow = {
  id: string;
  module: string;
  actionType: string;
  targetType: string;
  targetId: string;
  merchant: string;
  playerId: string;
  operator: string;
  role: string;
  result: string;
  riskLevel: string;
  beforeStatus: string;
  afterStatus: string;
  note: string;
  ip: string;
  userAgent: string;
  source: string;
  createdAt: string;
};

const allOption = '全部';

const filters = reactive({
  keyword: '',
  module: allOption,
  actionType: allOption,
  merchant: allOption,
  riskLevel: allOption,
  result: allOption,
  operator: allOption,
  createdAt: [null, null] as [Date | null, Date | null]
});

const selectedAction = ref<RiskActionRow | null>(null);
const detailVisible = ref(false);

const actionRows = reactive<RiskActionRow[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await fetch('/api/risk/v2/actions');
    const data: RiskActionRow[] = await res.json();
    actionRows.splice(0, actionRows.length, ...data);
  } finally {
    loading.value = false;
  }
});

const moduleOptions = computed(() => [allOption, ...Array.from(new Set(actionRows.map((row) => row.module)))]);
const actionOptions = computed(() => [allOption, ...Array.from(new Set(actionRows.map((row) => row.actionType)))]);
const merchantOptions = computed(() => [allOption, ...Array.from(new Set(actionRows.map((row) => row.merchant)))]);
const riskOptions = computed(() => [allOption, '高風險', '中風險', '低風險']);
const resultOptions = computed(() => [allOption, '成功', '待審核', '失敗']);
const operatorOptions = computed(() => [allOption, ...Array.from(new Set(actionRows.map((row) => row.operator)))]);

const filteredRows = computed(() => {
  const keyword = filters.keyword.trim().toLowerCase();
  return actionRows.filter((row) => {
    const matchKeyword = !keyword || [row.id, row.targetId, row.note, row.operator, row.playerId].some((value) => value.toLowerCase().includes(keyword));
    const matchModule = filters.module === allOption || row.module === filters.module;
    const matchAction = filters.actionType === allOption || row.actionType === filters.actionType;
    const matchMerchant = filters.merchant === allOption || row.merchant === filters.merchant;
    const matchRisk = filters.riskLevel === allOption || row.riskLevel === filters.riskLevel;
    const matchResult = filters.result === allOption || row.result === filters.result;
    const matchOperator = filters.operator === allOption || row.operator === filters.operator;
    return matchKeyword && matchModule && matchAction && matchMerchant && matchRisk && matchResult && matchOperator;
  });
});

const summaryCards = computed(() => {
  const highRisk = actionRows.filter((row) => row.riskLevel === '高風險').length;
  const manual = actionRows.filter((row) => ['指派', '建案', '補充紀錄', '送交覆核', '結案'].includes(row.actionType)).length;
  const review = actionRows.filter((row) => row.result === '待審核').length;

  return [
    { label: '處理紀錄', value: String(actionRows.length), helper: '只可查詢與匯出，不可修改' },
    { label: '高風險相關', value: String(highRisk), helper: '關聯高風險告警或案件' },
    { label: '人工操作', value: String(manual), helper: '由管理員或風控人員執行' },
    { label: '待審核', value: String(review), helper: '涉及規則或敏感處置變更' }
  ];
});

function tagSeverity(value: string): Severity {
  if (['高風險', '失敗'].includes(value)) return 'danger';
  if (['中風險', '待審核', '送審中', '待覆核'].includes(value)) return 'warn';
  if (['低風險', '成功', '已結案'].includes(value)) return 'success';
  return 'info';
}

function resetFilters() {
  filters.keyword = '';
  filters.module = allOption;
  filters.actionType = allOption;
  filters.merchant = allOption;
  filters.riskLevel = allOption;
  filters.result = allOption;
  filters.operator = allOption;
  filters.createdAt = [null, null];
}

function openDetail(row: RiskActionRow) {
  selectedAction.value = row;
  detailVisible.value = true;
}
</script>

<template>
  <div class="page-stack risk-actions-page">
    <SummaryCardGrid :cards="summaryCards" />

    <SectionCard class="merchant-filter-card">
      <template #header>
        <div class="dialog-title-block">
          <h2>查詢條件</h2>
          <p>查詢風控告警、案件、規則與交易處置的不可竄改操作紀錄。</p>
        </div>
      </template>

      <div class="trade-filter-grid">
        <div class="field trade-filter-keyword">
          <label>關鍵字</label>
          <InputText v-model="filters.keyword" placeholder="輸入紀錄、目標單號、操作人、玩家或備註" fluid />
        </div>
        <div class="field">
          <label>模組</label>
          <Select v-model="filters.module" :options="moduleOptions" fluid />
        </div>
        <div class="field">
          <label>動作類型</label>
          <Select v-model="filters.actionType" :options="actionOptions" fluid />
        </div>
        <div class="field">
          <label>商戶</label>
          <Select v-model="filters.merchant" :options="merchantOptions" fluid />
        </div>
        <div class="field">
          <label>風險等級</label>
          <Select v-model="filters.riskLevel" :options="riskOptions" fluid />
        </div>
        <div class="field">
          <label>結果</label>
          <Select v-model="filters.result" :options="resultOptions" fluid />
        </div>
        <div class="field">
          <label>操作人</label>
          <Select v-model="filters.operator" :options="operatorOptions" fluid />
        </div>
        <DateTimeRangeField v-model="filters.createdAt" class="trade-date-range" />
        <div class="trade-filter-actions">
          <Button label="查詢" icon="pi pi-search" />
          <Button label="重置" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" />
        </div>
      </div>
    </SectionCard>

    <div class="agent-command-bar">
      <div>
        <span class="table-count"><Badge :value="filteredRows.length" severity="info" /> 筆處理紀錄</span>
        <p>處理紀錄不可新增、修改或刪除；正式系統需由後端寫入並保存 IP、來源與操作前後狀態。</p>
      </div>
      <div class="agent-command-actions">
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
        table-style="min-width: 1580px"
      >
        <Column field="id" header="紀錄單號" frozen style="width: 156px; min-width: 156px">
          <template #body="{ data }">
            <strong class="linkish" @click="openDetail(data)">{{ data.id }}</strong>
          </template>
        </Column>
        <Column field="module" header="模組" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 92px; min-width: 92px">
          <template #body="{ data }">
            <Tag :value="data.module" severity="info" />
          </template>
        </Column>
        <Column field="actionType" header="動作" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 112px; min-width: 112px">
          <template #body="{ data }">
            <Tag :value="data.actionType" severity="info" />
          </template>
        </Column>
        <Column field="targetId" header="目標單號" style="width: 156px; min-width: 156px">
          <template #body="{ data }">
            <strong class="agent-primary-text">{{ data.targetId }}</strong>
            <small class="agent-secondary-text">{{ data.targetType }}</small>
          </template>
        </Column>
        <Column field="merchant" header="商戶" style="width: 128px; min-width: 128px" />
        <Column field="playerId" header="玩家 ID" style="width: 138px; min-width: 138px">
          <template #body="{ data }">
            <SensitiveValue :value="data.playerId" />
          </template>
        </Column>
        <Column field="operator" header="操作人" style="width: 128px; min-width: 128px">
          <template #body="{ data }">
            <strong class="agent-primary-text">{{ data.operator }}</strong>
            <small class="agent-secondary-text">{{ data.role }}</small>
          </template>
        </Column>
        <Column field="riskLevel" header="風險" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 100px; min-width: 100px">
          <template #body="{ data }">
            <Tag :value="data.riskLevel" :severity="tagSeverity(data.riskLevel)" />
          </template>
        </Column>
        <Column field="result" header="結果" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 100px; min-width: 100px">
          <template #body="{ data }">
            <Tag :value="data.result" :severity="tagSeverity(data.result)" />
          </template>
        </Column>
        <Column field="afterStatus" header="操作後" style="width: 112px; min-width: 112px" />
        <Column field="ip" header="來源 IP" style="width: 126px; min-width: 126px">
          <template #body="{ data }">
            <SensitiveValue :value="data.ip" />
          </template>
        </Column>
        <Column field="createdAt" header="操作時間" style="width: 168px; min-width: 168px" />
        <Column header="操作" frozen align-frozen="right" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 92px; min-width: 92px">
          <template #body="{ data }">
            <div class="row-actions">
              <Button v-tooltip.top="'檢視'" icon="pi pi-eye" text severity="secondary" aria-label="檢視" @click="openDetail(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </SectionCard>

    <Dialog v-model:visible="detailVisible" modal dismissable-mask header="風控處理紀錄" class="entity-dialog">
      <div v-if="selectedAction" class="entity-dialog-body">
        <section class="dialog-section">
          <h3>紀錄摘要</h3>
          <div class="detail-grid dialog-detail-grid">
            <div><span>紀錄單號</span><strong>{{ selectedAction.id }}</strong></div>
            <div><span>模組</span><strong>{{ selectedAction.module }}</strong></div>
            <div><span>動作類型</span><strong>{{ selectedAction.actionType }}</strong></div>
            <div><span>目標單號</span><strong>{{ selectedAction.targetId }}</strong></div>
            <div><span>目標類型</span><strong>{{ selectedAction.targetType }}</strong></div>
            <div><span>商戶</span><strong>{{ selectedAction.merchant }}</strong></div>
            <div><span>玩家 ID</span><SensitiveValue :value="selectedAction.playerId" /></div>
            <div><span>操作人</span><strong>{{ selectedAction.operator }}</strong></div>
            <div><span>角色</span><strong>{{ selectedAction.role }}</strong></div>
            <div><span>結果</span><Tag :value="selectedAction.result" :severity="tagSeverity(selectedAction.result)" /></div>
            <div><span>風險等級</span><Tag :value="selectedAction.riskLevel" :severity="tagSeverity(selectedAction.riskLevel)" /></div>
            <div><span>操作時間</span><strong>{{ selectedAction.createdAt }}</strong></div>
          </div>
        </section>

        <section class="dialog-section">
          <h3>操作前後與來源</h3>
          <div class="detail-grid dialog-detail-grid">
            <div><span>操作前</span><strong>{{ selectedAction.beforeStatus }}</strong></div>
            <div><span>操作後</span><strong>{{ selectedAction.afterStatus }}</strong></div>
            <div><span>來源</span><strong>{{ selectedAction.source }}</strong></div>
            <div><span>來源 IP</span><SensitiveValue :value="selectedAction.ip" /></div>
            <div class="detail-field-wide"><span>User Agent</span><SensitiveValue :value="selectedAction.userAgent" /></div>
            <div class="detail-field-wide"><span>處理備註</span><strong>{{ selectedAction.note }}</strong></div>
          </div>
        </section>
      </div>

      <template #footer>
        <div class="dialog-footer-actions">
          <Button label="關閉" severity="secondary" outlined @click="detailVisible = false" />
        </div>
      </template>
    </Dialog>
  </div>
</template>
