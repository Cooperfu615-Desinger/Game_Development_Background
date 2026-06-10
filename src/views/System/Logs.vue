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

type Severity = 'success' | 'info' | 'warn' | 'danger' | 'secondary';

interface SystemLogRow {
  id: string;
  module: string;
  action: string;
  targetType: string;
  targetId: string;
  portal: string;
  operator: string;
  roleGroup: string;
  dataScope: string;
  result: string;
  approvalNo: string;
  beforeValue: string;
  afterValue: string;
  reason: string;
  ip: string;
  userAgent: string;
  createdAt: string;
}

const allOption = '全部';
const now = new Date();
const startDate = new Date(now);
startDate.setDate(now.getDate() - 14);
startDate.setHours(0, 0, 0, 0);
now.setHours(23, 59, 59, 0);

const filters = reactive({
  keyword: '',
  module: allOption,
  action: allOption,
  portal: allOption,
  operator: allOption,
  result: allOption,
  range: [startDate, now] as [Date | null, Date | null]
});

const selectedLog = ref<SystemLogRow | null>(null);
const detailVisible = ref(false);

const logRows = reactive<SystemLogRow[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await fetch('/api/system/v2/logs');
    logRows.splice(0, logRows.length, ...await res.json());
  } finally {
    loading.value = false;
  }
});

const moduleOptions = computed(() => [allOption, ...Array.from(new Set(logRows.map((row) => row.module)))]);
const actionOptions = computed(() => [allOption, ...Array.from(new Set(logRows.map((row) => row.action)))]);
const portalOptions = computed(() => [allOption, ...Array.from(new Set(logRows.map((row) => row.portal)))]);
const operatorOptions = computed(() => [allOption, ...Array.from(new Set(logRows.map((row) => row.operator)))]);
const resultOptions = [allOption, '成功', '待審核', '失敗'];

const filteredRows = computed(() => {
  const keyword = filters.keyword.trim().toLowerCase();
  return logRows.filter((row) => {
    const matchKeyword = !keyword || [row.id, row.targetId, row.operator, row.reason, row.approvalNo].some((value) => value.toLowerCase().includes(keyword));
    const matchModule = filters.module === allOption || row.module === filters.module;
    const matchAction = filters.action === allOption || row.action === filters.action;
    const matchPortal = filters.portal === allOption || row.portal === filters.portal;
    const matchOperator = filters.operator === allOption || row.operator === filters.operator;
    const matchResult = filters.result === allOption || row.result === filters.result;
    const matchTime = isWithinRange(row.createdAt, filters.range);
    return matchKeyword && matchModule && matchAction && matchPortal && matchOperator && matchResult && matchTime;
  });
});

const summaryCards = computed(() => {
  const rows = filteredRows.value;
  return [
    { label: '操作紀錄', value: String(rows.length), helper: '不可新增、修改、刪除', severity: 'info' as Severity },
    { label: '敏感異動', value: String(rows.filter((row) => row.approvalNo !== '-').length), helper: '關聯審核單或正式異動', severity: 'warn' as Severity },
    { label: '失敗操作', value: String(rows.filter((row) => row.result === '失敗').length), helper: '需追蹤原因與後續處理', severity: 'danger' as Severity },
    { label: '操作人數', value: String(new Set(rows.map((row) => row.operator)).size), helper: '依目前查詢條件統計', severity: 'secondary' as Severity }
  ];
});

function resetFilters() {
  filters.keyword = '';
  filters.module = allOption;
  filters.action = allOption;
  filters.portal = allOption;
  filters.operator = allOption;
  filters.result = allOption;
  filters.range = [startDate, now];
}

function openDetail(row: SystemLogRow) {
  selectedLog.value = row;
  detailVisible.value = true;
}

function tagSeverity(value: string): Severity {
  if (['成功'].includes(value)) return 'success';
  if (['待審核'].includes(value)) return 'warn';
  if (['失敗'].includes(value)) return 'danger';
  if (value.includes('Portal')) return 'info';
  return 'secondary';
}

function isWithinRange(value: string, range: [Date | null, Date | null]) {
  const time = new Date(value.replace(' ', 'T')).getTime();
  const start = range[0]?.getTime() ?? Number.NEGATIVE_INFINITY;
  const end = range[1]?.getTime() ?? Number.POSITIVE_INFINITY;
  return time >= start && time <= end;
}
</script>

<template>
  <div class="page-stack reports-page system-logs-page">
    <section class="summary-grid">
      <article v-for="item in summaryCards" :key="item.label" class="agent-summary-card">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <small>{{ item.helper }}</small>
      </article>
    </section>

    <SectionCard class="merchant-filter-card">
      <template #header>
        <div class="dialog-title-block">
          <h2>查詢條件</h2>
          <p>操作紀錄僅提供查詢、檢視與匯出；正式資料由後端不可竄改寫入。</p>
        </div>
      </template>

      <div class="trade-filter-grid">
        <div class="field trade-filter-keyword">
          <label>關鍵字</label>
          <InputText v-model="filters.keyword" placeholder="輸入紀錄單號、目標單號、操作人、審核單或原因" fluid />
        </div>
        <div class="field">
          <label>模組</label>
          <Select v-model="filters.module" :options="moduleOptions" fluid />
        </div>
        <div class="field">
          <label>動作</label>
          <Select v-model="filters.action" :options="actionOptions" fluid />
        </div>
        <div class="field">
          <label>Portal</label>
          <Select v-model="filters.portal" :options="portalOptions" fluid />
        </div>
        <div class="field">
          <label>操作人</label>
          <Select v-model="filters.operator" :options="operatorOptions" fluid />
        </div>
        <div class="field">
          <label>結果</label>
          <Select v-model="filters.result" :options="resultOptions" fluid />
        </div>
        <DateTimeRangeField v-model="filters.range" class="trade-date-range" />
        <div class="trade-filter-actions">
          <Button label="查詢" icon="pi pi-search" />
          <Button label="重置" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" />
        </div>
      </div>
    </SectionCard>

    <div class="agent-command-bar">
      <div>
        <span class="table-count"><Badge :value="filteredRows.length" severity="info" /> 筆操作紀錄</span>
        <p>所有紀錄需保留操作前後、操作者、資料範圍、IP、User Agent 與審核單關聯。</p>
      </div>
      <div class="agent-command-actions">
        <Button label="匯出紀錄" icon="pi pi-download" severity="secondary" outlined />
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
        table-style="min-width: 1500px"
      >
        <Column field="id" header="紀錄單號" style="width: 156px; min-width: 156px">
          <template #body="{ data }">
            <strong class="linkish" @click="openDetail(data)">{{ data.id }}</strong>
          </template>
        </Column>
        <Column field="module" header="模組" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 116px; min-width: 116px">
          <template #body="{ data }"><Tag :value="data.module" severity="info" /></template>
        </Column>
        <Column field="action" header="動作" style="width: 150px; min-width: 150px" />
        <Column field="targetId" header="目標" style="width: 156px; min-width: 156px">
          <template #body="{ data }">
            <strong class="agent-primary-text">{{ data.targetId }}</strong>
            <small class="agent-secondary-text">{{ data.targetType }}</small>
          </template>
        </Column>
        <Column field="operator" header="操作人" style="width: 140px; min-width: 140px">
          <template #body="{ data }">
            <strong class="agent-primary-text">{{ data.operator }}</strong>
            <small class="agent-secondary-text">{{ data.roleGroup }}</small>
          </template>
        </Column>
        <Column field="portal" header="Portal" style="width: 132px; min-width: 132px">
          <template #body="{ data }"><Tag :value="data.portal" :severity="tagSeverity(data.portal)" /></template>
        </Column>
        <Column field="dataScope" header="資料範圍" style="width: 112px; min-width: 112px" />
        <Column field="result" header="結果" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 96px; min-width: 96px">
          <template #body="{ data }"><Tag :value="data.result" :severity="tagSeverity(data.result)" /></template>
        </Column>
        <Column field="approvalNo" header="審核單" style="width: 150px; min-width: 150px" />
        <Column field="ip" header="來源 IP" style="width: 126px; min-width: 126px">
          <template #body="{ data }"><SensitiveValue :value="data.ip" /></template>
        </Column>
        <Column field="createdAt" header="操作時間" style="width: 168px; min-width: 168px" />
        <Column header="操作" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 92px; min-width: 92px">
          <template #body="{ data }">
            <div class="row-actions">
              <Button v-tooltip.top="'檢視'" icon="pi pi-eye" text severity="secondary" aria-label="檢視" @click="openDetail(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </SectionCard>

    <Dialog v-model:visible="detailVisible" modal dismissable-mask header="操作紀錄詳情" class="entity-dialog">
      <div v-if="selectedLog" class="entity-dialog-body">
        <section class="dialog-section">
          <h3>紀錄摘要</h3>
          <div class="detail-grid dialog-detail-grid">
            <div><span>紀錄單號</span><strong>{{ selectedLog.id }}</strong></div>
            <div><span>模組</span><strong>{{ selectedLog.module }}</strong></div>
            <div><span>動作</span><strong>{{ selectedLog.action }}</strong></div>
            <div><span>目標單號</span><strong>{{ selectedLog.targetId }}</strong></div>
            <div><span>目標類型</span><strong>{{ selectedLog.targetType }}</strong></div>
            <div><span>結果</span><Tag :value="selectedLog.result" :severity="tagSeverity(selectedLog.result)" /></div>
            <div><span>Portal</span><Tag :value="selectedLog.portal" :severity="tagSeverity(selectedLog.portal)" /></div>
            <div><span>資料範圍</span><strong>{{ selectedLog.dataScope }}</strong></div>
            <div><span>審核單</span><strong>{{ selectedLog.approvalNo }}</strong></div>
          </div>
        </section>

        <section class="dialog-section">
          <h3>操作人與來源</h3>
          <div class="detail-grid dialog-detail-grid">
            <div><span>操作人</span><strong>{{ selectedLog.operator }}</strong></div>
            <div><span>權限群組</span><strong>{{ selectedLog.roleGroup }}</strong></div>
            <div><span>操作時間</span><strong>{{ selectedLog.createdAt }}</strong></div>
            <div><span>來源 IP</span><SensitiveValue :value="selectedLog.ip" /></div>
            <div class="detail-field-wide"><span>User Agent</span><SensitiveValue :value="selectedLog.userAgent" /></div>
          </div>
        </section>

        <section class="dialog-section">
          <h3>異動內容</h3>
          <div class="detail-grid dialog-detail-grid">
            <div class="detail-field-wide"><span>修改前</span><SensitiveValue :value="selectedLog.beforeValue" /></div>
            <div class="detail-field-wide"><span>修改後</span><SensitiveValue :value="selectedLog.afterValue" /></div>
            <div class="detail-field-wide"><span>原因</span><strong>{{ selectedLog.reason }}</strong></div>
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
