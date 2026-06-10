<script setup lang="ts">
import { computed, reactive, ref, watch, onMounted } from 'vue';
import { api } from '@/services/apiClient';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import SelectButton from 'primevue/selectbutton';
import ToggleSwitch from 'primevue/toggleswitch';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Badge from 'primevue/badge';
import Dialog from 'primevue/dialog';
import SectionCard from '@/components/ui/SectionCard.vue';
import StatusTag from '@/components/ui/StatusTag.vue';
import DateTimeRangeField from '@/components/ui/DateTimeRangeField.vue';
import SensitiveValue from '@/components/ui/SensitiveValue.vue';
import SummaryCardGrid from '@/components/ui/SummaryCardGrid.vue';

type DialogMode = 'view' | 'edit' | 'create';
type AgentDialogPanel = 'basic' | 'account' | 'commercial' | 'permission';

type PageField = {
  key: string;
  label: string;
  type: 'text' | 'select' | 'dateRange';
  options?: string[];
};

type AgentRow = {
  code: string;
  name: string;
  parentAgent: string;
  contact: string;
  merchantCount: number;
  commissionType: string;
  commissionRate: string;
  settlementCurrency: string;
  status: string;
  createdAt: string;
};

const filters = reactive<Record<string, unknown>>({});
const dialogVisible = ref(false);
const dialogMode = ref<DialogMode>('view');
const activeDialogPanel = ref<AgentDialogPanel>('basic');
const selectedRow = ref<Record<string, unknown> | null>(null);
const disableDialogVisible = ref(false);
const disableTarget = ref<Record<string, unknown> | null>(null);
const disableReason = ref('');

const rows = reactive<AgentRow[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const data = await api.get<AgentRow[]>('/api/agents/v2/list');
    rows.splice(0, rows.length, ...data);
  } finally {
    loading.value = false;
  }
});

const agentStatusOptions = ['全部狀態', '啟用', '測試中', '待審核', '停用'];
const agentCurrencyOptions = ['全部幣別', 'USDT', 'USD', 'TWD'];
const agentCommissionOptions = ['全部類型', 'GGR 分潤', '流水', '固定'];
const agentLevelOptions = ['一級代理', '二級代理', '三級代理'];
const agentNameOptions = computed(() => ['全部代理', ...rows.map((row) => `${row.code} ${row.name}`)]);
const levelOneAgentOptions = computed(() => rows.filter((row) => row.parentAgent === '-').map((row) => `${row.code} ${row.name}`));
const levelTwoAgentOptions = computed(() => rows.filter((row) => row.parentAgent !== '-').map((row) => `${row.code} ${row.name}`));
const parentAgentOptions = computed(() => {
  const level = String(selectedRow.value?.agentLevel ?? '一級代理');
  if (level === '一級代理') return ['不綁定'];
  if (level === '二級代理') return ['不綁定（待指派）', ...levelOneAgentOptions.value];
  return ['不綁定（待指派）', ...levelTwoAgentOptions.value];
});
const pageSizeOptions = [5, 10, 20, 50, 100];
const paginatorTemplate = 'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown';
const currentPageReportTemplate = '{first}-{last} / {totalRecords}';

const agentFilters: PageField[] = [
  { key: 'keyword', label: '關鍵字', type: 'text' },
  { key: 'agentName', label: '代理名稱', type: 'select' },
  { key: 'status', label: '狀態', type: 'select', options: agentStatusOptions },
  { key: 'settlementCurrency', label: '結算幣別', type: 'select', options: agentCurrencyOptions },
  { key: 'commissionType', label: '佣金類型', type: 'select', options: agentCommissionOptions },
  { key: 'createdAt', label: '建立時間', type: 'dateRange' }
];

const agentSummary = computed(() => {
  const active = rows.filter((row) => row.status === '啟用').length;
  const testing = rows.filter((row) => row.status === '測試中').length;
  const pending = rows.filter((row) => row.status === '待審核').length;
  const disabled = rows.filter((row) => row.status === '停用').length;
  const merchants = rows.reduce((sum, row) => sum + Number(row.merchantCount || 0), 0);

  return [
    { label: '代理總數', value: String(rows.length), helper: `啟用 ${active}，測試 ${testing}` },
    { label: '綁定商戶', value: String(merchants), helper: '依目前代理資料範圍統計' },
    { label: '待審核變更', value: String(pending), helper: '佣金、幣別、資料範圍異動' },
    { label: '停用代理', value: String(disabled), helper: '不可硬刪除，僅可停用' }
  ];
});

const dialogTitle = computed(() => {
  if (dialogMode.value === 'create') return '新增代理';
  if (dialogMode.value === 'edit') return '編輯代理';
  return '代理詳情';
});

const agentDialogPanels = [
  { key: 'basic', label: '基本資料', icon: 'pi pi-id-card' },
  { key: 'account', label: '帳號安全', icon: 'pi pi-lock' },
  { key: 'commercial', label: '佣金結算', icon: 'pi pi-wallet' },
  { key: 'permission', label: '權限聯絡', icon: 'pi pi-shield' }
] as const;

const activePanelIndex = computed(() => agentDialogPanels.findIndex((panel) => panel.key === activeDialogPanel.value));
const canMovePrev = computed(() => activePanelIndex.value > 0);
const canMoveNext = computed(() => activePanelIndex.value < agentDialogPanels.length - 1);

const passwordMismatch = computed(() => {
  if (dialogMode.value === 'view' || !selectedRow.value) return false;
  const password = String(selectedRow.value.password ?? '');
  const confirmPassword = String(selectedRow.value.confirmPassword ?? '');
  return Boolean(password || confirmPassword) && password !== confirmPassword;
});
const passwordRequiredMissing = computed(() => {
  if (dialogMode.value !== 'create' || !selectedRow.value) return false;
  return !String(selectedRow.value.password ?? '') || !String(selectedRow.value.confirmPassword ?? '');
});
const agentSaveDisabled = computed(() => passwordMismatch.value || passwordRequiredMissing.value);
const disableReasonInvalid = computed(() => disableReason.value.trim().length < 6);

watch(
  () => selectedRow.value?.agentLevel,
  (level) => {
    if (!selectedRow.value) return;
    if (level === '一級代理') selectedRow.value.parentAgent = '不綁定';
    if (level !== '一級代理' && !parentAgentOptions.value.includes(String(selectedRow.value.parentAgent))) {
      selectedRow.value.parentAgent = '不綁定（待指派）';
    }
  }
);

function options(field: PageField) {
  if (field.key === 'agentName') return agentNameOptions.value;
  return field.options ?? [];
}

function agentLevel(row: Record<string, unknown>) {
  return String(row.agentLevel ?? (row.parentAgent && row.parentAgent !== '-' ? '二級代理' : '一級代理'));
}

function rangeValue(key: string) {
  if (!filters[key]) filters[key] = [null, null] as [Date | null, Date | null];
  return filters[key] as [Date | null, Date | null];
}

function setRangeValue(key: string, value: [Date | null, Date | null]) {
  filters[key] = value;
}

function resetFilters() {
  Object.keys(filters).forEach((key) => {
    filters[key] = Array.isArray(filters[key]) ? [null, null] : undefined;
  });
}

function blankRow() {
  return normalizeAgentRow({
    code: 'AG-NEW',
    name: '',
    parentAgent: '-',
    contact: '',
    merchantCount: 0,
    commissionType: 'GGR 分潤',
    commissionRate: '0.00%',
    settlementCurrency: 'USDT',
    status: '待審核'
  });
}

function normalizeAgentRow(row: Record<string, unknown>) {
  const code = String(row.code ?? 'AG-NEW');
  const commissionRateText = String(row.commissionRate ?? '0').replace('%', '');
  const inferredLevel = row.agentLevel ?? (row.parentAgent && row.parentAgent !== '-' ? '二級代理' : '一級代理');
  return {
    agentLevel: inferredLevel,
    loginAccount: code.toLowerCase().replace('-', '_'),
    password: '',
    confirmPassword: '',
    forcePasswordChange: true,
    require2fa: true,
    email: '',
    phone: '',
    dataScope: '代理底下商戶',
    allowSubAgents: true,
    allowMerchantBinding: true,
    settlementCycle: '月結',
    commissionRateValue: Number.isFinite(Number(commissionRateText)) ? Number(commissionRateText) : 0,
    changeReason: '',
    ...row
  };
}

function openDialog(mode: DialogMode, row?: Record<string, unknown>) {
  dialogMode.value = mode;
  activeDialogPanel.value = 'basic';
  const source = mode === 'create' ? blankRow() : { ...(row ?? {}) };
  selectedRow.value = normalizeAgentRow(source);
  dialogVisible.value = true;
}

function setAgentPanel(panel: AgentDialogPanel) {
  activeDialogPanel.value = panel;
}

function moveAgentPanel(delta: -1 | 1) {
  const nextPanel = agentDialogPanels[activePanelIndex.value + delta];
  if (nextPanel) activeDialogPanel.value = nextPanel.key;
}

function switchDialogToEdit() {
  if (!selectedRow.value) return;
  selectedRow.value = normalizeAgentRow(selectedRow.value);
  dialogMode.value = 'edit';
  activeDialogPanel.value = 'basic';
}

function saveDialog() {
  if (agentSaveDisabled.value) {
    activeDialogPanel.value = 'account';
    return;
  }

  dialogVisible.value = false;
}

function openDisableDialog(row: Record<string, unknown>) {
  disableTarget.value = row;
  disableReason.value = '';
  disableDialogVisible.value = true;
}

function confirmDisableAgent() {
  if (!disableTarget.value || disableReasonInvalid.value) return;
  disableTarget.value.status = '停用';
  disableDialogVisible.value = false;
}

function openDetail(row: Record<string, unknown>) {
  openDialog('view', row);
}

function editRow(row: Record<string, unknown>) {
  openDialog('edit', row);
}

function addRow() {
  openDialog('create');
}
</script>

<template>
  <div class="page-stack agent-list-page">
    <SummaryCardGrid :cards="agentSummary" />

    <SectionCard class="agent-filter-card">
      <template #header>
        <div class="dialog-title-block">
          <h2>查詢條件</h2>
          <p>查詢代理基本資料、佣金規則、結算幣別與狀態。</p>
        </div>
      </template>

      <div class="agent-filter-grid">
        <template v-for="field in agentFilters" :key="field.key">
          <DateTimeRangeField
            v-if="field.type === 'dateRange'"
            class="agent-date-range"
            :model-value="rangeValue(field.key)"
            @update:model-value="setRangeValue(field.key, $event)"
          />
          <div v-else class="field">
            <label>{{ field.label }}</label>
            <InputText v-if="field.type === 'text'" v-model="filters[field.key]" placeholder="輸入代理代號或名稱" fluid />
            <Select v-else-if="field.type === 'select'" v-model="filters[field.key]" :options="options(field)" :placeholder="field.label" fluid />
          </div>
        </template>
        <div class="agent-filter-actions">
          <Button label="查詢" icon="pi pi-search" />
          <Button label="重置" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" />
        </div>
      </div>
    </SectionCard>

    <div class="agent-command-bar">
      <div>
        <span class="table-count"><Badge :value="rows.length" severity="info" /> 筆代理</span>
        <p>代理不可硬刪除；查看、編輯與新增皆以彈窗處理，不離開列表脈絡。</p>
      </div>
      <div class="agent-command-actions">
        <Button label="新增代理" icon="pi pi-plus" @click="addRow" />
        <Button label="欄位設定" icon="pi pi-sliders-h" severity="secondary" outlined />
        <Button label="匯出" icon="pi pi-download" severity="secondary" outlined />
      </div>
    </div>

    <SectionCard class="agent-table-card">
      <DataTable
        :value="rows"
        :loading="loading"
        scrollable
        paginator
        :rows="10"
        :rows-per-page-options="pageSizeOptions"
        :paginator-template="paginatorTemplate"
        :current-page-report-template="currentPageReportTemplate"
        data-key="code"
        table-style="min-width: 1380px"
      >
        <Column field="code" header="代理代號" frozen style="width: 120px; min-width: 120px">
          <template #body="{ data }">
            <strong class="linkish" @click="openDetail(data)">{{ data.code }}</strong>
          </template>
        </Column>
        <Column field="name" header="代理名稱" style="width: 160px; min-width: 160px">
          <template #body="{ data }">
            <strong class="agent-primary-text">{{ data.name }}</strong>
          </template>
        </Column>
        <Column field="parentAgent" header="上級代理" style="width: 128px; min-width: 128px">
          <template #body="{ data }">
            <span class="agent-secondary-text">{{ data.parentAgent }}</span>
          </template>
        </Column>
        <Column header="代理層級" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 116px; min-width: 116px">
          <template #body="{ data }">
            <span class="agent-token-wrap">
              <Tag class="agent-token agent-token--level" :value="agentLevel(data)" />
            </span>
          </template>
        </Column>
        <Column field="contact" header="主要聯絡人" style="width: 148px; min-width: 148px">
          <template #body="{ data }">
            <span class="agent-secondary-text">{{ data.contact }}</span>
          </template>
        </Column>
        <Column field="merchantCount" header="綁定商戶" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 112px; min-width: 112px" />
        <Column field="commissionType" header="佣金類型" style="width: 120px; min-width: 120px" />
        <Column field="commissionRate" header="佣金比例" header-class="agent-table-cell-right" body-class="agent-table-cell-right" style="width: 112px; min-width: 112px" />
        <Column field="settlementCurrency" header="結算幣別" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 116px; min-width: 116px">
          <template #body="{ data }">
            <span class="agent-token-wrap">
              <Tag class="agent-token agent-token--currency" :value="data.settlementCurrency" severity="info" />
            </span>
          </template>
        </Column>
        <Column field="status" header="狀態" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 116px; min-width: 116px">
          <template #body="{ data }">
            <span class="agent-token-wrap">
              <StatusTag class="agent-token agent-token--status" :value="data.status" />
            </span>
          </template>
        </Column>
        <Column field="createdAt" header="建立時間" style="width: 160px; min-width: 160px" />
        <Column header="操作" frozen align-frozen="right" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 128px; min-width: 128px">
          <template #body="{ data }">
            <div class="row-actions">
              <Button v-tooltip.top="'查看代理'" icon="pi pi-eye" text severity="secondary" aria-label="查看代理" @click="openDialog('view', data)" />
              <Button v-tooltip.top="'編輯代理'" icon="pi pi-pencil" text severity="secondary" aria-label="編輯代理" @click="editRow(data)" />
              <Button
                v-tooltip.top="data.status === '停用' ? '代理已停用' : '停用代理'"
                icon="pi pi-ban"
                text
                severity="danger"
                aria-label="停用代理"
                :disabled="data.status === '停用'"
                @click="openDisableDialog(data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </SectionCard>

    <Dialog v-model:visible="dialogVisible" modal dismissable-mask :header="dialogTitle" class="entity-dialog">
      <div v-if="selectedRow" class="entity-dialog-body">
        <div class="dialog-stepper" role="tablist" aria-label="代理資料分段">
          <button
            v-for="panel in agentDialogPanels"
            :key="panel.key"
            type="button"
            class="dialog-step"
            :class="{ active: activeDialogPanel === panel.key }"
            @click="setAgentPanel(panel.key)"
          >
            <i :class="panel.icon" />
            <span>{{ panel.label }}</span>
          </button>
        </div>

        <template v-if="dialogMode === 'view'">
          <section v-show="activeDialogPanel === 'basic'" class="dialog-section">
            <h3>基本資料</h3>
            <div class="detail-grid dialog-detail-grid">
              <div><span>代理代號</span><strong>{{ selectedRow.code }}</strong></div>
              <div><span>代理名稱</span><strong>{{ selectedRow.name || '-' }}</strong></div>
              <div><span>上級代理</span><strong>{{ selectedRow.parentAgent || '-' }}</strong></div>
              <div><span>狀態</span><StatusTag :value="String(selectedRow.status || '-')" /></div>
              <div><span>主要聯絡人</span><strong>{{ selectedRow.contact || '-' }}</strong></div>
              <div><span>綁定商戶</span><strong>{{ selectedRow.merchantCount ?? 0 }}</strong></div>
            </div>
          </section>

          <section v-show="activeDialogPanel === 'account'" class="dialog-section">
            <h3>帳號與安全</h3>
            <div class="detail-grid dialog-detail-grid">
              <div><span>登入帳號</span><strong>{{ selectedRow.loginAccount }}</strong></div>
              <div><span>密碼</span><SensitiveValue value="password-is-never-readable" /></div>
              <div><span>強制首次改密碼</span><strong>{{ selectedRow.forcePasswordChange ? '是' : '否' }}</strong></div>
              <div><span>啟用 2FA</span><strong>{{ selectedRow.require2fa ? '是' : '否' }}</strong></div>
            </div>
          </section>

          <section v-show="activeDialogPanel === 'commercial'" class="dialog-section">
            <h3>佣金與結算</h3>
            <div class="detail-grid dialog-detail-grid">
              <div><span>佣金類型</span><strong>{{ selectedRow.commissionType }}</strong></div>
              <div><span>佣金比例</span><strong>{{ selectedRow.commissionRate }}</strong></div>
              <div><span>結算幣別</span><strong>{{ selectedRow.settlementCurrency }}</strong></div>
              <div><span>結算週期</span><strong>{{ selectedRow.settlementCycle }}</strong></div>
            </div>
          </section>

          <section v-show="activeDialogPanel === 'permission'" class="dialog-section">
            <h3>權限與資料範圍</h3>
            <div class="detail-grid dialog-detail-grid">
              <div><span>dataScope</span><strong>{{ selectedRow.dataScope }}</strong></div>
              <div><span>允許建立下級代理</span><strong>{{ selectedRow.allowSubAgents ? '是' : '否' }}</strong></div>
              <div><span>允許綁定商戶</span><strong>{{ selectedRow.allowMerchantBinding ? '是' : '否' }}</strong></div>
            </div>
          </section>
        </template>

        <div v-else class="agent-dialog-form">
          <section v-show="activeDialogPanel === 'basic'" class="dialog-section">
            <h3>基本資料</h3>
            <p class="dialog-section-note">先決定代理層級，再決定是否綁定到指定上級代理。正式環境建議二、三級代理必須綁定上級。</p>
            <div class="dialog-form-grid agent-basic-grid">
              <div class="field field-span-12">
                <label>代理層級</label>
                <SelectButton v-model="selectedRow.agentLevel" :options="agentLevelOptions" />
              </div>
              <div class="field field-span-6">
                <label>綁定上級代理</label>
                <Select v-model="selectedRow.parentAgent" :options="parentAgentOptions" class="truncate-select" fluid />
                <small>{{ selectedRow.agentLevel === '一級代理' ? '一級代理不綁定上級。' : '可暫不綁定，但正式開通前建議完成指派。' }}</small>
              </div>
              <div class="field field-span-3">
                <label>代理狀態</label>
                <Select v-model="selectedRow.status" :options="['啟用', '測試中', '待審核', '停用']" fluid />
              </div>
              <div class="field field-span-3">
                <label>綁定商戶數</label>
                <InputNumber v-model="selectedRow.merchantCount" :min="0" fluid />
              </div>
              <div class="field field-span-4">
                <label>代理代號</label>
                <InputText v-model="selectedRow.code" fluid />
              </div>
              <div class="field field-span-8">
                <label>代理名稱</label>
                <InputText v-model="selectedRow.name" fluid />
              </div>
            </div>
          </section>

          <section v-show="activeDialogPanel === 'account'" class="dialog-section">
            <h3>帳號與安全</h3>
            <p class="dialog-section-note">登入帳號會提供給代理後台使用；密碼只可設定或重設，不提供檢視。</p>
            <div class="dialog-form-grid">
              <div class="field field-span-4">
                <label>登入帳號</label>
                <div class="dialog-control">
                  <InputText v-model="selectedRow.loginAccount" autocomplete="off" fluid />
                </div>
              </div>
              <div class="field field-span-4">
                <label>{{ dialogMode === 'create' ? '初始密碼' : '重設密碼' }}</label>
                <div class="dialog-control">
                  <InputText v-model="selectedRow.password" type="password" autocomplete="new-password" fluid />
                </div>
                <small>檢視時不會明文顯示密碼；正式環境需由後端雜湊保存。</small>
              </div>
              <div class="field field-span-4">
                <label>確認密碼</label>
                <div class="dialog-control">
                  <InputText v-model="selectedRow.confirmPassword" type="password" autocomplete="new-password" fluid />
                </div>
                <small v-if="passwordMismatch" class="field-error">兩次輸入的密碼不一致。</small>
                <small v-else-if="passwordRequiredMissing" class="field-error">新增代理時需設定初始密碼並再次確認。</small>
              </div>
              <div class="field switch-field field-span-3">
                <label>強制首次登入改密碼</label>
                <div class="dialog-control dialog-switch-control">
                  <ToggleSwitch v-model="selectedRow.forcePasswordChange" />
                </div>
              </div>
              <div class="field switch-field field-span-3">
                <label>啟用 2FA</label>
                <div class="dialog-control dialog-switch-control">
                  <ToggleSwitch v-model="selectedRow.require2fa" />
                </div>
              </div>
            </div>
          </section>

          <section v-show="activeDialogPanel === 'commercial'" class="dialog-section">
            <h3>佣金與結算</h3>
            <p class="dialog-section-note">佣金比例、結算幣別與結算週期屬敏感商業條件，正式環境需送審。</p>
            <div class="dialog-form-grid">
              <div class="field field-span-3">
                <label>佣金類型</label>
                <Select v-model="selectedRow.commissionType" :options="['GGR 分潤', '流水', '固定']" fluid />
              </div>
              <div class="field field-span-3">
                <label>佣金比例</label>
                <InputNumber v-model="selectedRow.commissionRateValue" suffix="%" :min="0" :max="100" :max-fraction-digits="2" fluid />
              </div>
              <div class="field field-span-3">
                <label>結算幣別</label>
                <Select v-model="selectedRow.settlementCurrency" :options="['USDT', 'USD', 'TWD']" fluid />
              </div>
              <div class="field field-span-3">
                <label>結算週期</label>
                <Select v-model="selectedRow.settlementCycle" :options="['日結', '週結', '月結']" fluid />
              </div>
            </div>
          </section>

          <section v-show="activeDialogPanel === 'permission'" class="dialog-section">
            <h3>權限與聯絡資訊</h3>
            <p class="dialog-section-note">dataScope 會影響代理可查看的商戶、注單、交易與報表資料。</p>
            <div class="dialog-form-grid">
              <div class="field field-span-6">
                <label>dataScope</label>
                <Select v-model="selectedRow.dataScope" :options="['代理底下商戶', '指定商戶', '僅報表']" class="truncate-select" fluid />
              </div>
              <div class="field switch-field field-span-3">
                <label>允許建立下級代理</label>
                <div class="dialog-control dialog-switch-control">
                  <ToggleSwitch v-model="selectedRow.allowSubAgents" />
                </div>
              </div>
              <div class="field switch-field field-span-3">
                <label>允許綁定商戶</label>
                <div class="dialog-control dialog-switch-control">
                  <ToggleSwitch v-model="selectedRow.allowMerchantBinding" />
                </div>
              </div>
              <div class="field field-span-4">
                <label>主要聯絡人</label>
                <InputText v-model="selectedRow.contact" fluid />
              </div>
              <div class="field field-span-4">
                <label>電子信箱</label>
                <InputText v-model="selectedRow.email" fluid />
              </div>
              <div class="field field-span-4">
                <label>電話 / 通訊帳號</label>
                <InputText v-model="selectedRow.phone" fluid />
              </div>
              <div class="field field-span-12">
                <label>變更原因</label>
                <Textarea v-model="selectedRow.changeReason" rows="3" fluid />
              </div>
            </div>
          </section>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer-left">
          <Button v-if="canMovePrev" label="上一步" icon="pi pi-angle-left" severity="secondary" outlined @click="moveAgentPanel(-1)" />
        </div>
        <div class="dialog-footer-actions">
          <Button label="關閉" severity="secondary" outlined @click="dialogVisible = false" />
          <Button
            v-if="canMoveNext"
            label="下一步"
            icon="pi pi-angle-right"
            icon-pos="right"
            severity="secondary"
            outlined
            @click="moveAgentPanel(1)"
          />
          <Button v-if="dialogMode === 'view'" label="編輯代理" icon="pi pi-pencil" @click="switchDialogToEdit" />
          <Button
            v-else
            :label="dialogMode === 'create' ? '建立代理' : '儲存變更'"
            icon="pi pi-check"
            :disabled="agentSaveDisabled"
            @click="saveDialog"
          />
        </div>
      </template>
    </Dialog>

    <Dialog v-model:visible="disableDialogVisible" modal dismissable-mask header="停用代理確認" class="disable-agent-dialog">
      <div v-if="disableTarget" class="disable-agent-body">
        <div class="disable-agent-warning">
          <i class="pi pi-exclamation-triangle" />
          <div>
            <strong>代理不可硬刪除，僅能停用。</strong>
            <p>停用後仍會保留注單、交易、結算與操作紀錄；正式系統需送出操作紀錄並依權限審核。</p>
          </div>
        </div>

        <div class="disable-agent-summary">
          <div>
            <span>代理代號</span>
            <strong>{{ disableTarget.code }}</strong>
          </div>
          <div>
            <span>代理名稱</span>
            <strong>{{ disableTarget.name }}</strong>
          </div>
          <div>
            <span>代理層級</span>
            <strong>{{ agentLevel(disableTarget) }}</strong>
          </div>
          <div>
            <span>綁定商戶</span>
            <strong>{{ disableTarget.merchantCount ?? 0 }}</strong>
          </div>
        </div>

        <div class="field">
          <label>停用原因</label>
          <Textarea v-model="disableReason" rows="3" auto-resize placeholder="請輸入停用原因，至少 6 個字" fluid />
          <small v-if="disableReasonInvalid" class="field-error">請填寫至少 6 個字，方便後續稽核追蹤。</small>
        </div>
      </div>

      <template #footer>
        <Button label="取消" severity="secondary" outlined @click="disableDialogVisible = false" />
        <Button label="確認停用" icon="pi pi-ban" severity="danger" :disabled="disableReasonInvalid" @click="confirmDisableAgent" />
      </template>
    </Dialog>
  </div>
</template>
