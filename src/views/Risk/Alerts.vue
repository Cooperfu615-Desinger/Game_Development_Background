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
import SummaryCardGrid from '@/components/ui/SummaryCardGrid.vue';

type Severity = 'success' | 'info' | 'warn' | 'danger' | 'secondary';

type RiskAlertRow = {
  id: string;
  ruleId: string;
  ruleName: string;
  alertType: string;
  merchant: string;
  playerId: string;
  playerIp: string;
  relatedOrder: string;
  relatedTransaction: string;
  caseId: string;
  riskLevel: string;
  status: string;
  assignee: string;
  hitValue: string;
  threshold: string;
  source: string;
  occurredAt: string;
  updatedAt: string;
  summary: string;
  evidence: string;
  suggestion: string;
};

const allOption = '全部';
const unassigned = '未指派';

const filters = reactive({
  keyword: '',
  alertType: allOption,
  merchant: allOption,
  riskLevel: allOption,
  status: allOption,
  assignee: allOption,
  occurredAt: [null, null] as [Date | null, Date | null]
});

const selectedAlert = ref<RiskAlertRow | null>(null);
const detailVisible = ref(false);
const assignVisible = ref(false);
const createCaseVisible = ref(false);
const closeVisible = ref(false);
const ignoreVisible = ref(false);
const selectedAssignee = ref('Mia Chen');
const selectedCloseStatus = ref('已關閉');
const actionNote = ref('');

const alertRows = reactive<RiskAlertRow[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await fetch('/api/risk/v2/alerts');
    alertRows.splice(0, alertRows.length, ...await res.json());
  } finally {
    loading.value = false;
  }
});

const alertTypeOptions = computed(() => [allOption, ...Array.from(new Set(alertRows.map((row) => row.alertType)))]);
const merchantOptions = computed(() => [allOption, ...Array.from(new Set(alertRows.map((row) => row.merchant)))]);
const riskLevelOptions = computed(() => [allOption, '嚴重', '高風險', '中風險', '低風險']);
const statusOptions = computed(() => [allOption, '新告警', '已指派', '處理中', '已建案', '已關閉', '已忽略']);
const assigneeOptions = computed(() => [allOption, ...Array.from(new Set(alertRows.map((row) => row.assignee))), 'Mia Chen', 'Iris Chen', 'Alex Wang', 'Supplier Admin']);
const assignOptions = ['Mia Chen', 'Iris Chen', 'Alex Wang', 'Supplier Admin', '技術值班'];
const closeStatusOptions = ['已關閉', '已忽略'];

const filteredRows = computed(() => {
  const keyword = filters.keyword.trim().toLowerCase();
  return alertRows.filter((row) => {
    const matchKeyword = !keyword || [row.id, row.ruleId, row.ruleName, row.merchant, row.playerId, row.relatedOrder, row.relatedTransaction].some((value) => value.toLowerCase().includes(keyword));
    const matchType = filters.alertType === allOption || row.alertType === filters.alertType;
    const matchMerchant = filters.merchant === allOption || row.merchant === filters.merchant;
    const matchRisk = filters.riskLevel === allOption || row.riskLevel === filters.riskLevel;
    const matchStatus = filters.status === allOption || row.status === filters.status;
    const matchAssignee = filters.assignee === allOption || row.assignee === filters.assignee;
    return matchKeyword && matchType && matchMerchant && matchRisk && matchStatus && matchAssignee;
  });
});

const summaryCards = computed(() => {
  const pending = alertRows.filter((row) => ['新告警', '已指派', '處理中'].includes(row.status)).length;
  const highRisk = alertRows.filter((row) => ['嚴重', '高風險'].includes(row.riskLevel)).length;
  const caseReady = alertRows.filter((row) => row.status === '已建案').length;

  return [
    { label: '告警總數', value: String(alertRows.length), helper: '來自規則、交易與數值監控' },
    { label: '待處理', value: String(pending), helper: '需要指派、建案或關閉' },
    { label: '高風險以上', value: String(highRisk), helper: '建議優先處理與追蹤' },
    { label: '已建案', value: String(caseReady), helper: '已流轉到風控案件' }
  ];
});

function tagSeverity(value: string): Severity {
  if (['嚴重', '高風險', '新告警'].includes(value)) return 'danger';
  if (['中風險', '已指派', '處理中'].includes(value)) return 'warn';
  if (['低風險', '已關閉'].includes(value)) return 'success';
  if (['已忽略'].includes(value)) return 'secondary';
  return 'info';
}

function resetFilters() {
  filters.keyword = '';
  filters.alertType = allOption;
  filters.merchant = allOption;
  filters.riskLevel = allOption;
  filters.status = allOption;
  filters.assignee = allOption;
  filters.occurredAt = [null, null];
}

function openDetail(row: RiskAlertRow) {
  selectedAlert.value = row;
  detailVisible.value = true;
}

function openAssign(row: RiskAlertRow) {
  selectedAlert.value = row;
  selectedAssignee.value = row.assignee === unassigned ? 'Mia Chen' : row.assignee;
  actionNote.value = '';
  assignVisible.value = true;
}

function openCreateCase(row: RiskAlertRow) {
  selectedAlert.value = row;
  actionNote.value = '';
  createCaseVisible.value = true;
}

function openClose(row: RiskAlertRow) {
  selectedAlert.value = row;
  selectedCloseStatus.value = '已關閉';
  actionNote.value = '';
  closeVisible.value = true;
}

function openIgnore(row: RiskAlertRow) {
  selectedAlert.value = row;
  selectedCloseStatus.value = '已忽略';
  actionNote.value = '';
  ignoreVisible.value = true;
}

function confirmAssign() {
  if (!selectedAlert.value) return;
  selectedAlert.value.assignee = selectedAssignee.value;
  selectedAlert.value.status = selectedAlert.value.status === '新告警' ? '已指派' : selectedAlert.value.status;
  assignVisible.value = false;
}

function confirmCreateCase() {
  if (!selectedAlert.value) return;
  selectedAlert.value.caseId = selectedAlert.value.caseId === '-' ? `RC-${selectedAlert.value.id.replace('RAL-', '')}` : selectedAlert.value.caseId;
  selectedAlert.value.status = '已建案';
  createCaseVisible.value = false;
}

function confirmClose() {
  if (!selectedAlert.value) return;
  selectedAlert.value.status = selectedCloseStatus.value;
  closeVisible.value = false;
  ignoreVisible.value = false;
}
</script>

<template>
  <div class="page-stack risk-alerts-page">
    <SummaryCardGrid :cards="summaryCards" />

    <SectionCard class="merchant-filter-card">
      <template #header>
        <div class="dialog-title-block">
          <h2>查詢條件</h2>
          <p>查詢規則命中、錢包異常、RTP 偏移與玩家行為告警。</p>
        </div>
      </template>

      <div class="trade-filter-grid">
        <div class="field trade-filter-keyword">
          <label>關鍵字</label>
          <InputText v-model="filters.keyword" placeholder="輸入告警、規則、玩家、注單或交易單號" fluid />
        </div>
        <div class="field">
          <label>告警類型</label>
          <Select v-model="filters.alertType" :options="alertTypeOptions" fluid />
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
          <label>告警狀態</label>
          <Select v-model="filters.status" :options="statusOptions" fluid />
        </div>
        <div class="field">
          <label>處理人</label>
          <Select v-model="filters.assignee" :options="assigneeOptions" fluid />
        </div>
        <DateTimeRangeField v-model="filters.occurredAt" class="trade-date-range" />
        <div class="trade-filter-actions">
          <Button label="查詢" icon="pi pi-search" />
          <Button label="重置" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" />
        </div>
      </div>
    </SectionCard>

    <div class="agent-command-bar">
      <div>
        <span class="table-count"><Badge :value="filteredRows.length" severity="info" /> 筆告警</span>
        <p>告警來源與命中證據不可竄改；指派、建案、關閉與忽略都會寫入風控處理紀錄。</p>
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
        table-style="min-width: 1680px"
      >
        <Column field="id" header="告警單號" frozen style="width: 156px; min-width: 156px">
          <template #body="{ data }">
            <strong class="linkish" @click="openDetail(data)">{{ data.id }}</strong>
          </template>
        </Column>
        <Column field="ruleName" header="命中規則" style="width: 184px; min-width: 184px">
          <template #body="{ data }">
            <strong class="agent-primary-text">{{ data.ruleName }}</strong>
            <small class="agent-secondary-text">{{ data.ruleId }}</small>
          </template>
        </Column>
        <Column field="alertType" header="類型" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 112px; min-width: 112px">
          <template #body="{ data }">
            <Tag :value="data.alertType" severity="info" />
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
        <Column field="status" header="狀態" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 112px; min-width: 112px">
          <template #body="{ data }">
            <Tag :value="data.status" :severity="tagSeverity(data.status)" />
          </template>
        </Column>
        <Column field="hitValue" header="命中值" style="width: 132px; min-width: 132px" />
        <Column field="threshold" header="門檻" style="width: 148px; min-width: 148px" />
        <Column field="assignee" header="處理人" style="width: 116px; min-width: 116px" />
        <Column field="caseId" header="案件" style="width: 142px; min-width: 142px">
          <template #body="{ data }">
            <strong :class="data.caseId === '-' ? 'agent-secondary-text' : 'linkish'">{{ data.caseId }}</strong>
          </template>
        </Column>
        <Column field="occurredAt" header="發生時間" style="width: 168px; min-width: 168px" />
        <Column header="操作" frozen align-frozen="right" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 178px; min-width: 178px">
          <template #body="{ data }">
            <div class="row-actions">
              <Button v-tooltip.top="'檢視'" icon="pi pi-eye" text severity="secondary" aria-label="檢視" @click="openDetail(data)" />
              <Button v-tooltip.top="'指派'" icon="pi pi-user-plus" text severity="secondary" aria-label="指派" @click="openAssign(data)" />
              <Button v-tooltip.top="'建案'" icon="pi pi-folder-plus" text severity="secondary" aria-label="建案" @click="openCreateCase(data)" />
              <Button v-tooltip.top="'關閉'" icon="pi pi-check-circle" text severity="secondary" aria-label="關閉" @click="openClose(data)" />
              <Button v-tooltip.top="'忽略'" icon="pi pi-times-circle" text severity="secondary" aria-label="忽略" @click="openIgnore(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </SectionCard>

    <Dialog v-model:visible="detailVisible" modal dismissable-mask header="告警詳情" class="entity-dialog">
      <div v-if="selectedAlert" class="entity-dialog-body">
        <section class="dialog-section">
          <h3>告警摘要</h3>
          <div class="detail-grid dialog-detail-grid">
            <div><span>告警單號</span><strong>{{ selectedAlert.id }}</strong></div>
            <div><span>命中規則</span><strong>{{ selectedAlert.ruleName }}</strong></div>
            <div><span>規則代號</span><strong>{{ selectedAlert.ruleId }}</strong></div>
            <div><span>來源</span><strong>{{ selectedAlert.source }}</strong></div>
            <div><span>商戶</span><strong>{{ selectedAlert.merchant }}</strong></div>
            <div><span>玩家 ID</span><SensitiveValue :value="selectedAlert.playerId" /></div>
            <div><span>玩家 IP</span><SensitiveValue :value="selectedAlert.playerIp" /></div>
            <div><span>風險等級</span><Tag :value="selectedAlert.riskLevel" :severity="tagSeverity(selectedAlert.riskLevel)" /></div>
            <div><span>狀態</span><Tag :value="selectedAlert.status" :severity="tagSeverity(selectedAlert.status)" /></div>
            <div><span>處理人</span><strong>{{ selectedAlert.assignee }}</strong></div>
            <div><span>命中值</span><strong>{{ selectedAlert.hitValue }}</strong></div>
            <div><span>門檻</span><strong>{{ selectedAlert.threshold }}</strong></div>
          </div>
        </section>

        <section class="dialog-section">
          <h3>關聯資料與證據</h3>
          <div class="detail-grid dialog-detail-grid">
            <div><span>關聯注單</span><strong>{{ selectedAlert.relatedOrder }}</strong></div>
            <div><span>關聯交易</span><strong>{{ selectedAlert.relatedTransaction }}</strong></div>
            <div><span>風控案件</span><strong>{{ selectedAlert.caseId }}</strong></div>
            <div><span>發生時間</span><strong>{{ selectedAlert.occurredAt }}</strong></div>
            <div class="detail-field-wide"><span>摘要</span><strong>{{ selectedAlert.summary }}</strong></div>
            <div class="detail-field-wide"><span>命中證據</span><strong>{{ selectedAlert.evidence }}</strong></div>
            <div class="detail-field-wide"><span>處理建議</span><strong>{{ selectedAlert.suggestion }}</strong></div>
          </div>
        </section>
      </div>

      <template #footer>
        <div class="dialog-footer-actions">
          <Button label="關閉" severity="secondary" outlined @click="detailVisible = false" />
          <Button label="指派" icon="pi pi-user-plus" severity="secondary" outlined @click="selectedAlert && openAssign(selectedAlert)" />
          <Button label="建立案件" icon="pi pi-folder-plus" @click="selectedAlert && openCreateCase(selectedAlert)" />
        </div>
      </template>
    </Dialog>

    <Dialog v-model:visible="assignVisible" modal dismissable-mask header="指派告警" class="confirm-dialog">
      <div v-if="selectedAlert" class="confirm-dialog-body">
        <i class="pi pi-user-plus" />
        <div>
          <h3>指派 {{ selectedAlert.id }}</h3>
          <p>指派後會更新告警處理人，並在處理紀錄中留下操作軌跡。</p>
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

    <Dialog v-model:visible="createCaseVisible" modal dismissable-mask header="建立風控案件" class="confirm-dialog">
      <div v-if="selectedAlert" class="confirm-dialog-body">
        <i class="pi pi-folder-plus" />
        <div>
          <h3>由 {{ selectedAlert.id }} 建立案件</h3>
          <p>案件會帶入告警摘要、命中證據、關聯注單與關聯交易，後續在風控案件頁追蹤。</p>
        </div>
      </div>
      <div class="field">
        <label>建案原因</label>
        <Textarea v-model="actionNote" rows="3" auto-resize placeholder="請填寫建案原因、處理優先級或需要追蹤的重點" fluid />
      </div>
      <template #footer>
        <div class="dialog-footer-actions">
          <Button label="取消" severity="secondary" outlined @click="createCaseVisible = false" />
          <Button label="確認建案" icon="pi pi-check" @click="confirmCreateCase" />
        </div>
      </template>
    </Dialog>

    <Dialog v-model:visible="closeVisible" modal dismissable-mask header="關閉告警" class="confirm-dialog">
      <div v-if="selectedAlert" class="confirm-dialog-body">
        <i class="pi pi-check-circle" />
        <div>
          <h3>關閉 {{ selectedAlert.id }}</h3>
          <p>關閉前請確認已完成必要查核；關閉原因會寫入不可竄改的風控處理紀錄。</p>
        </div>
      </div>
      <div class="dialog-form-grid">
        <div class="field">
          <label>處理結果</label>
          <Select v-model="selectedCloseStatus" :options="closeStatusOptions" fluid />
        </div>
        <div class="field detail-field-wide">
          <label>關閉原因</label>
          <Textarea v-model="actionNote" rows="3" auto-resize placeholder="請填寫判斷結果、處置方式或後續觀察事項" fluid />
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer-actions">
          <Button label="取消" severity="secondary" outlined @click="closeVisible = false" />
          <Button label="確認關閉" icon="pi pi-check" @click="confirmClose" />
        </div>
      </template>
    </Dialog>

    <Dialog v-model:visible="ignoreVisible" modal dismissable-mask header="忽略告警" class="confirm-dialog">
      <div v-if="selectedAlert" class="confirm-dialog-body">
        <i class="pi pi-times-circle" />
        <div>
          <h3>忽略 {{ selectedAlert.id }}</h3>
          <p>忽略適用於誤報或已確認無需處理的告警；系統仍會保存原始命中資料。</p>
        </div>
      </div>
      <div class="field">
        <label>忽略原因</label>
        <Textarea v-model="actionNote" rows="3" auto-resize placeholder="請填寫忽略原因，例如樣本不足、活動名單或已由其他案件處理" fluid />
      </div>
      <template #footer>
        <div class="dialog-footer-actions">
          <Button label="取消" severity="secondary" outlined @click="ignoreVisible = false" />
          <Button label="確認忽略" icon="pi pi-check" @click="confirmClose" />
        </div>
      </template>
    </Dialog>
  </div>
</template>
