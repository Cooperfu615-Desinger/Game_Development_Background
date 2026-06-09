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

type CaseAction = {
  time: string;
  actor: string;
  action: string;
  note: string;
};

type RiskCaseRow = {
  id: string;
  title: string;
  riskType: string;
  merchant: string;
  playerId: string;
  playerIp: string;
  riskLevel: string;
  priority: string;
  status: string;
  source: string;
  assignee: string;
  relatedAlert: string;
  relatedOrders: string[];
  relatedTransactions: string[];
  evidence: string;
  suggestion: string;
  createdAt: string;
  updatedAt: string;
  slaDueAt: string;
  lastAction: string;
  actions: CaseAction[];
};

const allOption = '全部';
const unassigned = '未指派';

const filters = reactive({
  keyword: '',
  riskType: allOption,
  merchant: allOption,
  riskLevel: allOption,
  status: allOption,
  assignee: allOption,
  createdAt: [null, null] as [Date | null, Date | null]
});

const selectedCase = ref<RiskCaseRow | null>(null);
const detailVisible = ref(false);
const assignVisible = ref(false);
const actionVisible = ref(false);
const closeVisible = ref(false);
const selectedAssignee = ref('Mia Chen');
const selectedCloseStatus = ref('已結案');
const selectedActionType = ref('補充紀錄');
const actionNote = ref('');

const caseRows = reactive<RiskCaseRow[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await fetch('/api/risk/v2/cases');
    const data: RiskCaseRow[] = await res.json();
    caseRows.splice(0, caseRows.length, ...data);
  } finally {
    loading.value = false;
  }
});

const riskTypeOptions = computed(() => [allOption, ...Array.from(new Set(caseRows.map((row) => row.riskType)))]);
const merchantOptions = computed(() => [allOption, ...Array.from(new Set(caseRows.map((row) => row.merchant)))]);
const riskLevelOptions = computed(() => [allOption, '高風險', '中風險', '低風險']);
const statusOptions = computed(() => [allOption, '待指派', '調查中', '處理中', '待覆核', '已結案', '已退回']);
const assigneeOptions = computed(() => [allOption, ...Array.from(new Set(caseRows.map((row) => row.assignee))), 'Mia Chen', 'Iris Chen', 'Alex Wang', 'Supplier Admin']);
const assignOptions = ['Mia Chen', 'Iris Chen', 'Alex Wang', 'Supplier Admin', '技術值班', '財務覆核'];
const actionTypeOptions = ['補充紀錄', '通知商戶', '送交覆核', '標記人工處理', '要求補件'];
const closeStatusOptions = ['已結案', '已退回'];

const filteredRows = computed(() => {
  const keyword = filters.keyword.trim().toLowerCase();
  return caseRows.filter((row) => {
    const matchKeyword = !keyword || [row.id, row.title, row.merchant, row.playerId, row.relatedAlert, ...row.relatedOrders, ...row.relatedTransactions].some((value) => value.toLowerCase().includes(keyword));
    const matchType = filters.riskType === allOption || row.riskType === filters.riskType;
    const matchMerchant = filters.merchant === allOption || row.merchant === filters.merchant;
    const matchRisk = filters.riskLevel === allOption || row.riskLevel === filters.riskLevel;
    const matchStatus = filters.status === allOption || row.status === filters.status;
    const matchAssignee = filters.assignee === allOption || row.assignee === filters.assignee;
    return matchKeyword && matchType && matchMerchant && matchRisk && matchStatus && matchAssignee;
  });
});

const summaryCards = computed(() => {
  const highRisk = caseRows.filter((row) => row.riskLevel === '高風險').length;
  const pending = caseRows.filter((row) => ['待指派', '調查中', '處理中', '待覆核'].includes(row.status)).length;
  const unassignedCount = caseRows.filter((row) => row.assignee === unassigned).length;

  return [
    { label: '案件總數', value: String(caseRows.length), helper: '由告警、交易與數值監控流轉' },
    { label: '待處理', value: String(pending), helper: '需要指派、覆核或結案' },
    { label: '高風險', value: String(highRisk), helper: '優先追蹤與升級處理' },
    { label: '未指派', value: String(unassignedCount), helper: '需要補上處理人' }
  ];
});

function tagSeverity(value: string): Severity {
  if (['高風險', 'P1', '已退回'].includes(value)) return 'danger';
  if (['中風險', 'P2', '待指派', '調查中', '處理中', '待覆核'].includes(value)) return 'warn';
  if (['低風險', 'P4', '已結案'].includes(value)) return 'success';
  return 'info';
}

function resetFilters() {
  filters.keyword = '';
  filters.riskType = allOption;
  filters.merchant = allOption;
  filters.riskLevel = allOption;
  filters.status = allOption;
  filters.assignee = allOption;
  filters.createdAt = [null, null];
}

function openDetail(row: RiskCaseRow) {
  selectedCase.value = row;
  detailVisible.value = true;
}

function openAssign(row: RiskCaseRow) {
  selectedCase.value = row;
  selectedAssignee.value = row.assignee === unassigned ? 'Mia Chen' : row.assignee;
  actionNote.value = '';
  assignVisible.value = true;
}

function openAction(row: RiskCaseRow) {
  selectedCase.value = row;
  selectedActionType.value = '補充紀錄';
  actionNote.value = '';
  actionVisible.value = true;
}

function openClose(row: RiskCaseRow) {
  selectedCase.value = row;
  selectedCloseStatus.value = '已結案';
  actionNote.value = '';
  closeVisible.value = true;
}

function appendAction(row: RiskCaseRow, action: string, actor: string, note: string) {
  const now = '2026-05-21 10:30:00';
  row.actions.unshift({ time: now, actor, action, note: note || '-' });
  row.lastAction = `${actor} ${action}${note ? `：${note}` : ''}`;
  row.updatedAt = now;
}

function confirmAssign() {
  if (!selectedCase.value) return;
  selectedCase.value.assignee = selectedAssignee.value;
  selectedCase.value.status = selectedCase.value.status === '待指派' ? '調查中' : selectedCase.value.status;
  appendAction(selectedCase.value, '指派案件', 'Supplier Admin', `指派給 ${selectedAssignee.value}。${actionNote.value}`);
  assignVisible.value = false;
}

function confirmAction() {
  if (!selectedCase.value) return;
  appendAction(selectedCase.value, selectedActionType.value, selectedCase.value.assignee === unassigned ? 'Supplier Admin' : selectedCase.value.assignee, actionNote.value);
  if (selectedActionType.value === '送交覆核') selectedCase.value.status = '待覆核';
  if (selectedActionType.value === '標記人工處理') selectedCase.value.status = '處理中';
  actionVisible.value = false;
}

function confirmClose() {
  if (!selectedCase.value) return;
  selectedCase.value.status = selectedCloseStatus.value;
  appendAction(selectedCase.value, selectedCloseStatus.value, selectedCase.value.assignee === unassigned ? 'Supplier Admin' : selectedCase.value.assignee, actionNote.value);
  closeVisible.value = false;
}
</script>

<template>
  <div class="page-stack risk-cases-page">
    <div class="agent-summary-grid">
      <article v-for="item in summaryCards" :key="item.label" class="agent-summary-card">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <small>{{ item.helper }}</small>
      </article>
    </div>

    <SectionCard class="merchant-filter-card">
      <template #header>
        <div class="dialog-title-block">
          <h2>查詢條件</h2>
          <p>查詢風控案件、風險類型、處理狀態、關聯告警與處理人。</p>
        </div>
      </template>

      <div class="trade-filter-grid">
        <div class="field trade-filter-keyword">
          <label>關鍵字</label>
          <InputText v-model="filters.keyword" placeholder="輸入案件、玩家、告警、注單或交易單號" fluid />
        </div>
        <div class="field">
          <label>風險類型</label>
          <Select v-model="filters.riskType" :options="riskTypeOptions" fluid />
        </div>
        <div class="field">
          <label>商戶</label>
          <Select v-model="filters.merchant" :options="merchantOptions" fluid />
        </div>
        <div class="field">
          <label>風險等級</label>
          <Select v-model="filters.riskLevel" :options="riskLevelOptions" fluid />
        </div>
        <div class="field">
          <label>案件狀態</label>
          <Select v-model="filters.status" :options="statusOptions" fluid />
        </div>
        <div class="field">
          <label>處理人</label>
          <Select v-model="filters.assignee" :options="assigneeOptions" fluid />
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
        <span class="table-count"><Badge :value="filteredRows.length" severity="info" /> 筆案件</span>
        <p>案件處理紀錄不可竄改；指派、補充紀錄、覆核與結案會同步保留在操作軌跡。</p>
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
        table-style="min-width: 1660px"
      >
        <Column field="id" header="案件單號" frozen style="width: 156px; min-width: 156px">
          <template #body="{ data }">
            <strong class="linkish" @click="openDetail(data)">{{ data.id }}</strong>
          </template>
        </Column>
        <Column field="title" header="案件名稱" style="width: 190px; min-width: 190px">
          <template #body="{ data }">
            <strong class="agent-primary-text">{{ data.title }}</strong>
            <small class="agent-secondary-text">{{ data.source }}</small>
          </template>
        </Column>
        <Column field="riskType" header="類型" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 112px; min-width: 112px">
          <template #body="{ data }">
            <Tag :value="data.riskType" severity="info" />
          </template>
        </Column>
        <Column field="merchant" header="商戶" style="width: 132px; min-width: 132px" />
        <Column field="playerId" header="玩家 ID" style="width: 148px; min-width: 148px">
          <template #body="{ data }">
            <SensitiveValue :value="data.playerId" />
          </template>
        </Column>
        <Column field="riskLevel" header="風險" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 100px; min-width: 100px">
          <template #body="{ data }">
            <Tag :value="data.riskLevel" :severity="tagSeverity(data.riskLevel)" />
          </template>
        </Column>
        <Column field="priority" header="優先" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 88px; min-width: 88px">
          <template #body="{ data }">
            <Tag :value="data.priority" :severity="tagSeverity(data.priority)" />
          </template>
        </Column>
        <Column field="status" header="狀態" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 112px; min-width: 112px">
          <template #body="{ data }">
            <Tag :value="data.status" :severity="tagSeverity(data.status)" />
          </template>
        </Column>
        <Column field="assignee" header="處理人" style="width: 116px; min-width: 116px" />
        <Column header="關聯資料" style="width: 150px; min-width: 150px">
          <template #body="{ data }">
            <strong class="agent-primary-text">{{ data.relatedOrders.length }} 注單</strong>
            <small class="agent-secondary-text">{{ data.relatedTransactions.length }} 交易</small>
          </template>
        </Column>
        <Column field="slaDueAt" header="SLA" style="width: 168px; min-width: 168px" />
        <Column field="updatedAt" header="更新時間" style="width: 168px; min-width: 168px" />
        <Column header="操作" frozen align-frozen="right" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 156px; min-width: 156px">
          <template #body="{ data }">
            <div class="row-actions">
              <Button v-tooltip.top="'檢視'" icon="pi pi-eye" text severity="secondary" aria-label="檢視" @click="openDetail(data)" />
              <Button v-tooltip.top="'指派'" icon="pi pi-user-plus" text severity="secondary" aria-label="指派" @click="openAssign(data)" />
              <Button v-tooltip.top="'紀錄'" icon="pi pi-file-edit" text severity="secondary" aria-label="紀錄" @click="openAction(data)" />
              <Button v-tooltip.top="'結案'" icon="pi pi-check-circle" text severity="secondary" aria-label="結案" @click="openClose(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </SectionCard>

    <Dialog v-model:visible="detailVisible" modal dismissable-mask header="風控案件詳情" class="entity-dialog">
      <div v-if="selectedCase" class="entity-dialog-body">
        <section class="dialog-section">
          <h3>案件摘要</h3>
          <div class="detail-grid dialog-detail-grid">
            <div><span>案件單號</span><strong>{{ selectedCase.id }}</strong></div>
            <div><span>案件名稱</span><strong>{{ selectedCase.title }}</strong></div>
            <div><span>風險類型</span><strong>{{ selectedCase.riskType }}</strong></div>
            <div><span>來源</span><strong>{{ selectedCase.source }}</strong></div>
            <div><span>商戶</span><strong>{{ selectedCase.merchant }}</strong></div>
            <div><span>玩家 ID</span><SensitiveValue :value="selectedCase.playerId" /></div>
            <div><span>玩家 IP</span><SensitiveValue :value="selectedCase.playerIp" /></div>
            <div><span>風險等級</span><Tag :value="selectedCase.riskLevel" :severity="tagSeverity(selectedCase.riskLevel)" /></div>
            <div><span>優先級</span><Tag :value="selectedCase.priority" :severity="tagSeverity(selectedCase.priority)" /></div>
            <div><span>案件狀態</span><Tag :value="selectedCase.status" :severity="tagSeverity(selectedCase.status)" /></div>
            <div><span>處理人</span><strong>{{ selectedCase.assignee }}</strong></div>
            <div><span>SLA 到期</span><strong>{{ selectedCase.slaDueAt }}</strong></div>
          </div>
        </section>

        <section class="dialog-section">
          <h3>關聯資料與判斷</h3>
          <div class="detail-grid dialog-detail-grid">
            <div><span>關聯告警</span><strong>{{ selectedCase.relatedAlert }}</strong></div>
            <div><span>建立時間</span><strong>{{ selectedCase.createdAt }}</strong></div>
            <div class="detail-field-wide">
              <span>關聯注單</span>
              <strong>{{ selectedCase.relatedOrders.length ? selectedCase.relatedOrders.join('、') : '-' }}</strong>
            </div>
            <div class="detail-field-wide">
              <span>關聯交易</span>
              <strong>{{ selectedCase.relatedTransactions.length ? selectedCase.relatedTransactions.join('、') : '-' }}</strong>
            </div>
            <div class="detail-field-wide"><span>證據</span><strong>{{ selectedCase.evidence }}</strong></div>
            <div class="detail-field-wide"><span>處理建議</span><strong>{{ selectedCase.suggestion }}</strong></div>
            <div class="detail-field-wide"><span>最近處理</span><strong>{{ selectedCase.lastAction }}</strong></div>
          </div>
        </section>

        <section class="dialog-section">
          <h3>處理紀錄</h3>
          <div class="risk-action-list">
            <article v-for="item in selectedCase.actions" :key="`${item.time}-${item.action}`">
              <span>{{ item.time }}</span>
              <strong>{{ item.action }} / {{ item.actor }}</strong>
              <p>{{ item.note }}</p>
            </article>
          </div>
        </section>
      </div>

      <template #footer>
        <div class="dialog-footer-actions">
          <Button label="關閉" severity="secondary" outlined @click="detailVisible = false" />
          <Button label="新增紀錄" icon="pi pi-file-edit" severity="secondary" outlined @click="selectedCase && openAction(selectedCase)" />
          <Button label="結案" icon="pi pi-check" @click="selectedCase && openClose(selectedCase)" />
        </div>
      </template>
    </Dialog>

    <Dialog v-model:visible="assignVisible" modal dismissable-mask header="指派案件" class="confirm-dialog">
      <div v-if="selectedCase" class="confirm-dialog-body">
        <i class="pi pi-user-plus" />
        <div>
          <h3>指派 {{ selectedCase.id }}</h3>
          <p>指派後會更新案件處理人，並在案件處理紀錄中留下操作軌跡。</p>
        </div>
      </div>
      <div class="dialog-form-grid">
        <div class="field">
          <label>處理人</label>
          <Select v-model="selectedAssignee" :options="assignOptions" fluid />
        </div>
        <div class="field detail-field-wide">
          <label>指派備註</label>
          <Textarea v-model="actionNote" rows="3" auto-resize placeholder="請填寫指派原因或需要注意的關聯資料" fluid />
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer-actions">
          <Button label="取消" severity="secondary" outlined @click="assignVisible = false" />
          <Button label="確認指派" icon="pi pi-check" @click="confirmAssign" />
        </div>
      </template>
    </Dialog>

    <Dialog v-model:visible="actionVisible" modal dismissable-mask header="新增處理紀錄" class="confirm-dialog">
      <div v-if="selectedCase" class="confirm-dialog-body">
        <i class="pi pi-file-edit" />
        <div>
          <h3>{{ selectedCase.id }}</h3>
          <p>處理紀錄會保留在案件內，正式系統需同步寫入不可竄改操作紀錄。</p>
        </div>
      </div>
      <div class="dialog-form-grid">
        <div class="field">
          <label>處理動作</label>
          <Select v-model="selectedActionType" :options="actionTypeOptions" fluid />
        </div>
        <div class="field detail-field-wide">
          <label>處理內容</label>
          <Textarea v-model="actionNote" rows="3" auto-resize placeholder="請填寫處理內容、查核結果或後續追蹤事項" fluid />
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer-actions">
          <Button label="取消" severity="secondary" outlined @click="actionVisible = false" />
          <Button label="儲存紀錄" icon="pi pi-check" @click="confirmAction" />
        </div>
      </template>
    </Dialog>

    <Dialog v-model:visible="closeVisible" modal dismissable-mask header="案件結案" class="confirm-dialog">
      <div v-if="selectedCase" class="confirm-dialog-body">
        <i class="pi pi-check-circle" />
        <div>
          <h3>{{ selectedCase.id }}</h3>
          <p>結案前請確認注單、交易、商戶通知與必要覆核都已完成。</p>
        </div>
      </div>
      <div class="dialog-form-grid">
        <div class="field">
          <label>結案結果</label>
          <Select v-model="selectedCloseStatus" :options="closeStatusOptions" fluid />
        </div>
        <div class="field detail-field-wide">
          <label>結案原因</label>
          <Textarea v-model="actionNote" rows="3" auto-resize placeholder="請填寫結案判斷、處理結果或退回原因" fluid />
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer-actions">
          <Button label="取消" severity="secondary" outlined @click="closeVisible = false" />
          <Button label="確認送出" icon="pi pi-check" @click="confirmClose" />
        </div>
      </template>
    </Dialog>
  </div>
</template>
