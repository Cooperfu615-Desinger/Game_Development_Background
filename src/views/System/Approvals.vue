<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue';
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
import SensitiveValue from '@/components/ui/SensitiveValue.vue';

type Severity = 'success' | 'info' | 'warn' | 'danger' | 'secondary';
type ApprovalStatus = '待審核' | '已核准' | '已駁回' | '已取消';

interface ApprovalRow {
  id: string;
  module: string;
  type: string;
  targetId: string;
  targetName: string;
  applicant: string;
  applicantGroup: string;
  reviewer: string;
  level: string;
  priority: string;
  status: ApprovalStatus;
  beforeValue: string;
  afterValue: string;
  reason: string;
  riskNote: string;
  relatedLog: string;
  requestedAt: string;
  reviewedAt: string;
  comment: string;
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
  type: allOption,
  applicant: allOption,
  status: allOption,
  priority: allOption,
  range: [startDate, now] as [Date | null, Date | null]
});

const selectedApproval = ref<ApprovalRow | null>(null);
const detailVisible = ref(false);
const decisionVisible = ref(false);
const decisionType = ref<'approve' | 'reject'>('approve');
const decisionComment = ref('');

const approvalRows = reactive<ApprovalRow[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await fetch('/api/system/v2/approvals');
    approvalRows.splice(0, approvalRows.length, ...await res.json());
  } finally {
    loading.value = false;
  }
});

const moduleOptions = computed(() => [allOption, ...Array.from(new Set(approvalRows.map((row) => row.module)))]);
const typeOptions = computed(() => [allOption, ...Array.from(new Set(approvalRows.map((row) => row.type)))]);
const applicantOptions = computed(() => [allOption, ...Array.from(new Set(approvalRows.map((row) => row.applicant)))]);
const statusOptions: (ApprovalStatus | '全部')[] = ['全部', '待審核', '已核准', '已駁回', '已取消'];
const priorityOptions = [allOption, '高', '中', '低'];

const filteredRows = computed(() => {
  const keyword = filters.keyword.trim().toLowerCase();
  return approvalRows.filter((row) => {
    const matchKeyword = !keyword || [row.id, row.targetId, row.targetName, row.reason, row.relatedLog].some((value) => value.toLowerCase().includes(keyword));
    const matchModule = filters.module === allOption || row.module === filters.module;
    const matchType = filters.type === allOption || row.type === filters.type;
    const matchApplicant = filters.applicant === allOption || row.applicant === filters.applicant;
    const matchStatus = filters.status === allOption || row.status === filters.status;
    const matchPriority = filters.priority === allOption || row.priority === filters.priority;
    const matchTime = isWithinRange(row.requestedAt, filters.range);
    return matchKeyword && matchModule && matchType && matchApplicant && matchStatus && matchPriority && matchTime;
  });
});

const summaryCards = computed(() => {
  const rows = approvalRows;
  const pending = rows.filter((row) => row.status === '待審核').length;
  const high = rows.filter((row) => row.status === '待審核' && row.priority === '高').length;
  return [
    { label: '待審核', value: String(pending), helper: `高優先 ${high}`, severity: pending > 0 ? 'warn' as Severity : 'success' as Severity },
    { label: '已核准', value: String(rows.filter((row) => row.status === '已核准').length), helper: '已寫入操作紀錄', severity: 'success' as Severity },
    { label: '已駁回', value: String(rows.filter((row) => row.status === '已駁回').length), helper: '需補資料後重送', severity: 'danger' as Severity },
    { label: '敏感模組', value: String(new Set(rows.filter((row) => row.level === '二審').map((row) => row.module)).size), helper: '二審或高風險異動', severity: 'secondary' as Severity }
  ];
});

const pendingRows = computed(() => approvalRows.filter((row) => row.status === '待審核'));

function resetFilters() {
  filters.keyword = '';
  filters.module = allOption;
  filters.type = allOption;
  filters.applicant = allOption;
  filters.status = allOption;
  filters.priority = allOption;
  filters.range = [startDate, now];
}

function openDetail(row: ApprovalRow) {
  selectedApproval.value = row;
  detailVisible.value = true;
}

function openDecision(row: ApprovalRow, type: 'approve' | 'reject') {
  selectedApproval.value = row;
  decisionType.value = type;
  decisionComment.value = type === 'approve' ? '已確認修改前後與影響範圍，核准此審核單。' : '資料不足或風險過高，請補充後重新送審。';
  decisionVisible.value = true;
}

function submitDecision() {
  if (!selectedApproval.value) return;
  selectedApproval.value.status = decisionType.value === 'approve' ? '已核准' : '已駁回';
  selectedApproval.value.reviewer = 'Supplier Admin';
  selectedApproval.value.reviewedAt = '2026-05-22 12:10:00';
  selectedApproval.value.comment = decisionComment.value;
  decisionVisible.value = false;
  detailVisible.value = false;
}

function tagSeverity(value: string): Severity {
  if (['已核准', '低'].includes(value)) return 'success';
  if (['待審核', '中'].includes(value)) return 'warn';
  if (['已駁回', '高', '已取消'].includes(value)) return 'danger';
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
  <div class="page-stack reports-page system-approvals-page">
    <section class="summary-grid">
      <article v-for="item in summaryCards" :key="item.label" class="agent-summary-card">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <small>{{ item.helper }}</small>
      </article>
    </section>

    <section class="risk-overview-insight-grid">
      <SectionCard>
        <template #header>
          <div class="dialog-title-block">
            <h2>審核待辦</h2>
            <p>優先處理正式環境、二審與高優先級異動。</p>
          </div>
        </template>
        <div class="risk-action-list">
          <article v-for="row in pendingRows.slice(0, 3)" :key="row.id">
            <span>{{ row.id }} · {{ row.module }}</span>
            <strong>{{ row.type }} / {{ row.targetName }}</strong>
            <p>{{ row.reason }}</p>
          </article>
        </div>
      </SectionCard>

      <SectionCard>
        <template #header>
          <div class="dialog-title-block">
            <h2>治理規則</h2>
            <p>前端只做操作流程展示，正式安全邊界仍由後端驗證。</p>
          </div>
        </template>
        <div class="system-warning-strip">
          <i class="pi pi-shield" />
          <span>RTP、賠率表、分潤、代理佣金、對帳幣別、錢包 API、退款、補單與結算鎖定都需送審並留下操作紀錄。</span>
        </div>
      </SectionCard>
    </section>

    <SectionCard class="merchant-filter-card">
      <template #header>
        <div class="dialog-title-block">
          <h2>查詢條件</h2>
          <p>查詢審核單、模組、申請人、狀態、優先級與申請時間。</p>
        </div>
      </template>

      <div class="trade-filter-grid">
        <div class="field trade-filter-keyword">
          <label>關鍵字</label>
          <InputText v-model="filters.keyword" placeholder="輸入審核單、目標單號、目標名稱、原因或操作紀錄" fluid />
        </div>
        <div class="field">
          <label>模組</label>
          <Select v-model="filters.module" :options="moduleOptions" fluid />
        </div>
        <div class="field">
          <label>類型</label>
          <Select v-model="filters.type" :options="typeOptions" fluid />
        </div>
        <div class="field">
          <label>申請人</label>
          <Select v-model="filters.applicant" :options="applicantOptions" fluid />
        </div>
        <div class="field">
          <label>狀態</label>
          <Select v-model="filters.status" :options="statusOptions" fluid />
        </div>
        <div class="field">
          <label>優先級</label>
          <Select v-model="filters.priority" :options="priorityOptions" fluid />
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
        <span class="table-count"><Badge :value="filteredRows.length" severity="info" /> 筆審核單</span>
        <p>核准或駁回後會保留審核人、審核時間、意見與關聯操作紀錄。</p>
      </div>
      <div class="agent-command-actions">
        <Button label="匯出審核單" icon="pi pi-download" severity="secondary" outlined />
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
        <Column field="id" header="審核單號" style="width: 156px; min-width: 156px">
          <template #body="{ data }">
            <strong class="linkish" @click="openDetail(data)">{{ data.id }}</strong>
          </template>
        </Column>
        <Column field="module" header="模組" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 116px; min-width: 116px">
          <template #body="{ data }"><Tag :value="data.module" severity="info" /></template>
        </Column>
        <Column field="type" header="類型" style="width: 150px; min-width: 150px" />
        <Column field="targetName" header="目標" style="width: 190px; min-width: 190px">
          <template #body="{ data }">
            <strong class="agent-primary-text">{{ data.targetName }}</strong>
            <small class="agent-secondary-text">{{ data.targetId }}</small>
          </template>
        </Column>
        <Column field="applicant" header="申請人" style="width: 138px; min-width: 138px">
          <template #body="{ data }">
            <strong class="agent-primary-text">{{ data.applicant }}</strong>
            <small class="agent-secondary-text">{{ data.applicantGroup }}</small>
          </template>
        </Column>
        <Column field="level" header="層級" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 88px; min-width: 88px">
          <template #body="{ data }"><Tag :value="data.level" :severity="data.level === '二審' ? 'warn' : 'info'" /></template>
        </Column>
        <Column field="priority" header="優先級" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 94px; min-width: 94px">
          <template #body="{ data }"><Tag :value="data.priority" :severity="tagSeverity(data.priority)" /></template>
        </Column>
        <Column field="status" header="狀態" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 104px; min-width: 104px">
          <template #body="{ data }"><Tag :value="data.status" :severity="tagSeverity(data.status)" /></template>
        </Column>
        <Column field="requestedAt" header="申請時間" style="width: 168px; min-width: 168px" />
        <Column field="reviewer" header="審核人" style="width: 128px; min-width: 128px" />
        <Column field="relatedLog" header="操作紀錄" style="width: 148px; min-width: 148px" />
        <Column header="操作" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 150px; min-width: 150px">
          <template #body="{ data }">
            <div class="row-actions">
              <Button v-tooltip.top="'檢視'" icon="pi pi-eye" text severity="secondary" aria-label="檢視" @click="openDetail(data)" />
              <Button v-if="data.status === '待審核'" v-tooltip.top="'核准'" icon="pi pi-check" text severity="success" aria-label="核准" @click="openDecision(data, 'approve')" />
              <Button v-if="data.status === '待審核'" v-tooltip.top="'駁回'" icon="pi pi-times" text severity="danger" aria-label="駁回" @click="openDecision(data, 'reject')" />
            </div>
          </template>
        </Column>
      </DataTable>
    </SectionCard>

    <Dialog v-model:visible="detailVisible" modal dismissable-mask header="審核單詳情" class="entity-dialog">
      <div v-if="selectedApproval" class="entity-dialog-body">
        <section class="dialog-section">
          <h3>審核摘要</h3>
          <div class="detail-grid dialog-detail-grid">
            <div><span>審核單號</span><strong>{{ selectedApproval.id }}</strong></div>
            <div><span>模組</span><strong>{{ selectedApproval.module }}</strong></div>
            <div><span>類型</span><strong>{{ selectedApproval.type }}</strong></div>
            <div><span>狀態</span><Tag :value="selectedApproval.status" :severity="tagSeverity(selectedApproval.status)" /></div>
            <div><span>層級</span><Tag :value="selectedApproval.level" :severity="selectedApproval.level === '二審' ? 'warn' : 'info'" /></div>
            <div><span>優先級</span><Tag :value="selectedApproval.priority" :severity="tagSeverity(selectedApproval.priority)" /></div>
            <div><span>目標單號</span><strong>{{ selectedApproval.targetId }}</strong></div>
            <div><span>目標名稱</span><strong>{{ selectedApproval.targetName }}</strong></div>
            <div><span>操作紀錄</span><strong>{{ selectedApproval.relatedLog }}</strong></div>
          </div>
        </section>

        <section class="dialog-section">
          <h3>異動內容</h3>
          <div class="detail-grid dialog-detail-grid">
            <div class="detail-field-wide"><span>修改前</span><SensitiveValue :value="selectedApproval.beforeValue" /></div>
            <div class="detail-field-wide"><span>修改後</span><SensitiveValue :value="selectedApproval.afterValue" /></div>
            <div class="detail-field-wide"><span>申請原因</span><strong>{{ selectedApproval.reason }}</strong></div>
            <div class="detail-field-wide"><span>風險提醒</span><SensitiveValue :value="selectedApproval.riskNote" /></div>
          </div>
        </section>

        <section class="dialog-section">
          <h3>申請與審核</h3>
          <div class="detail-grid dialog-detail-grid">
            <div><span>申請人</span><strong>{{ selectedApproval.applicant }}</strong></div>
            <div><span>申請群組</span><strong>{{ selectedApproval.applicantGroup }}</strong></div>
            <div><span>申請時間</span><strong>{{ selectedApproval.requestedAt }}</strong></div>
            <div><span>審核人</span><strong>{{ selectedApproval.reviewer }}</strong></div>
            <div><span>審核時間</span><strong>{{ selectedApproval.reviewedAt }}</strong></div>
            <div class="detail-field-wide"><span>審核意見</span><strong>{{ selectedApproval.comment || '尚未審核' }}</strong></div>
          </div>
        </section>
      </div>

      <template #footer>
        <div class="dialog-footer-actions">
          <Button label="關閉" severity="secondary" outlined @click="detailVisible = false" />
          <Button v-if="selectedApproval?.status === '待審核'" label="駁回" icon="pi pi-times" severity="danger" outlined @click="openDecision(selectedApproval, 'reject')" />
          <Button v-if="selectedApproval?.status === '待審核'" label="核准" icon="pi pi-check" @click="openDecision(selectedApproval, 'approve')" />
        </div>
      </template>
    </Dialog>

    <Dialog v-model:visible="decisionVisible" modal dismissable-mask class="confirm-dialog" :header="decisionType === 'approve' ? '核准審核單' : '駁回審核單'">
      <div v-if="selectedApproval" class="entity-dialog-body">
        <p>
          {{ decisionType === 'approve' ? '核准後此異動會被視為可套用，正式系統需由後端再次驗證權限並寫入操作紀錄。' : '駁回後申請人需補充資料或重新送審，原始資料不會被異動。' }}
        </p>
        <div class="detail-grid dialog-detail-grid">
          <div><span>審核單</span><strong>{{ selectedApproval.id }}</strong></div>
          <div><span>類型</span><strong>{{ selectedApproval.type }}</strong></div>
          <div class="detail-field-wide"><span>目標</span><strong>{{ selectedApproval.targetName }}</strong></div>
        </div>
        <div class="field">
          <label>審核意見</label>
          <Textarea v-model="decisionComment" rows="4" auto-resize fluid />
        </div>
      </div>

      <template #footer>
        <Button label="取消" severity="secondary" outlined @click="decisionVisible = false" />
        <Button
          :label="decisionType === 'approve' ? '確認核准' : '確認駁回'"
          :icon="decisionType === 'approve' ? 'pi pi-check' : 'pi pi-times'"
          :severity="decisionType === 'approve' ? 'success' : 'danger'"
          @click="submitDecision"
        />
      </template>
    </Dialog>
  </div>
</template>
