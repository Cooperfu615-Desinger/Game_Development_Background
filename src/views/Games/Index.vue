<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue';
import { api } from '@/services/apiClient';
import { useRouter } from 'vue-router';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import MultiSelect from 'primevue/multiselect';
import SelectButton from 'primevue/selectbutton';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Badge from 'primevue/badge';
import Dialog from 'primevue/dialog';
import SectionCard from '@/components/ui/SectionCard.vue';
import StatusTag from '@/components/ui/StatusTag.vue';
import DateTimeRangeField from '@/components/ui/DateTimeRangeField.vue';
import SensitiveValue from '@/components/ui/SensitiveValue.vue';
import SummaryCardGrid from '@/components/ui/SummaryCardGrid.vue';
import FilterCard from '@/components/ui/FilterCard.vue';

type GameRow = Record<string, unknown>;
type DialogMode = 'view' | 'edit' | 'create';
type GameDialogPanel = 'basic' | 'operations' | 'resources';

type PageField = {
  key: string;
  label: string;
  type: 'text' | 'select' | 'dateRange';
  options?: string[];
};

const router = useRouter();
const filters = reactive<Record<string, unknown>>({});
const dialogVisible = ref(false);
const dialogMode = ref<DialogMode>('view');
const activeGamePanel = ref<GameDialogPanel>('basic');
const selectedRow = ref<GameRow | null>(null);
const disableDialogVisible = ref(false);
const disableTarget = ref<GameRow | null>(null);
const disableReason = ref('');
const maintenanceDialogVisible = ref(false);
const maintenanceTarget = ref<GameRow | null>(null);
const maintenanceScope = ref('單一遊戲');
const maintenanceGameCode = ref('');
const maintenanceRange = ref<[Date | null, Date | null]>([null, null]);
const maintenanceReason = ref('');
const environmentConfirmVisible = ref(false);
const pendingEnvironmentMode = ref('');

const rows = reactive<GameRow[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const data = await api.get<GameRow[]>('/api/games/v2/list');
    rows.splice(0, rows.length, ...data);
  } finally {
    loading.value = false;
  }
});

const gameStatusOptions = ['全部狀態', '上架', '測試中', '維護中', '待審核', '下架'];
const gameTypeOptions = ['全部類型', '老虎機', '桌遊', '小遊戲', '真人'];
const gamePlatformOptions = ['全部平台', 'H5', 'Web', 'App'];
const gameEnvironmentOptions = ['全部環境', '測試', '正式'];
const gameMerchantOptions = ['MER-001 Golden Dragon', 'MER-002 LuckyPlay', 'MER-003 Nova Gaming', 'MER-004 Royal H5'];
const gameLimitTemplateOptions = ['標準限額', '低風險限額', '高額限額', 'VIP 限額'];
const pageSizeOptions = [5, 10, 20, 50, 100];
const paginatorTemplate = 'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown';
const currentPageReportTemplate = '{first}-{last} / {totalRecords}';

const gameFilters: PageField[] = [
  { key: 'keyword', label: '關鍵字', type: 'text' },
  { key: 'type', label: '遊戲類型', type: 'select', options: gameTypeOptions },
  { key: 'status', label: '遊戲狀態', type: 'select', options: gameStatusOptions },
  { key: 'environmentMode', label: '環境模式', type: 'select', options: gameEnvironmentOptions },
  { key: 'platform', label: '支援平台', type: 'select', options: gamePlatformOptions },
  { key: 'createdAt', label: '建立時間', type: 'dateRange' }
];

const gameSummary = computed(() => {
  const live = rows.filter((row) => row.status === '上架').length;
  const testing = rows.filter((row) => row.status === '測試中').length;
  const maintenance = rows.filter((row) => row.status === '維護中').length;
  const merchants = rows.reduce((sum, row) => sum + Number(row.merchantCount || 0), 0);

  return [
    { label: '遊戲總數', value: String(rows.length), helper: `上架 ${live}，測試 ${testing}` },
    { label: '可見商戶', value: String(merchants), helper: '依目前遊戲授權範圍統計' },
    { label: '維護中', value: String(maintenance), helper: '維護期間不可啟動新局' },
    { label: '技術權責', value: '技術', helper: '新增與版本設定由技術方處理' }
  ];
});

const dialogTitle = computed(() => {
  if (dialogMode.value === 'create') return '新增遊戲';
  if (dialogMode.value === 'edit') return '編輯遊戲';
  return '遊戲詳情';
});

const gameDialogPanels = [
  { key: 'basic', label: '主檔資料', icon: 'pi pi-th-large' },
  { key: 'operations', label: '營運控制', icon: 'pi pi-sliders-h' },
  { key: 'resources', label: '關聯資源', icon: 'pi pi-link' }
] as const;

const isProductionEnvironment = computed(() => selectedRow.value?.environmentMode === '正式');
const nextEnvironmentMode = computed(() => (isProductionEnvironment.value ? '測試' : '正式'));
const environmentConfirmTitle = computed(() => (pendingEnvironmentMode.value === '正式' ? '切換至正式模式' : '切回測試模式'));
const environmentConfirmLead = computed(() => (pendingEnvironmentMode.value === '正式' ? '這會影響正式計算與營運資料' : '確認切回測試模式'));
const environmentConfirmMessage = computed(() =>
  pendingEnvironmentMode.value === '正式'
    ? '切換為正式後，遊戲會被視為正式營運設定，影響商戶可調用與報表統計。後續修改敏感欄位需走審核流程並留下操作紀錄。'
    : '切回測試後，後續設定會回到沙盒驗證情境，不應再作為正式結算或真實錢包計算依據。'
);
const disableReasonInvalid = computed(() => disableReason.value.trim().length < 6);
const maintenanceReasonInvalid = computed(() => maintenanceReason.value.trim().length < 6);
const maintenanceRangeInvalid = computed(() => !maintenanceRange.value[0] || !maintenanceRange.value[1]);
const maintenanceInvalid = computed(() => maintenanceReasonInvalid.value || maintenanceRangeInvalid.value || (maintenanceScope.value === '單一遊戲' && !maintenanceGameCode.value));
const maintenanceGameOptions = computed(() => rows.map((row) => `${row.code} ${row.name}`));

function options(field: PageField) {
  return field.options ?? [];
}

function environmentSeverity(value: unknown) {
  return value === '正式' ? 'danger' : 'info';
}

function tags(value: unknown) {
  return Array.isArray(value) ? value : [value];
}

function compactMultiLabel(value: unknown) {
  const list = tags(value).filter(Boolean).map(String);
  if (!list.length) return '-';
  if (list.length === 1) return list[0];
  return `${list[0]} +${list.length - 1}`;
}

function multiTooltip(value: unknown) {
  return tags(value).filter(Boolean).join(' / ');
}

function booleanLabel(value: unknown) {
  return value ? '是' : '否';
}

function maintenanceLabel(row: GameRow) {
  return row.maintenance ? '維護中' : '正常';
}

function maintenanceWindowLabel(row: GameRow) {
  const start = String(row.maintenanceStart ?? '').replace('T', ' ').slice(0, 16);
  const end = String(row.maintenanceEnd ?? '').replace('T', ' ').slice(0, 16);
  if (!start || !end) return '未排程';
  return `${start} - ${end}`;
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
  return normalizeGameRow({
    code: 'GAME-NEW',
    name: '',
    type: '老虎機',
    status: '待審核'
  });
}

function normalizeGameRow(row: GameRow) {
  return {
    type: '老虎機',
    status: '待審核',
    environmentMode: '測試',
    platform: ['H5'],
    currencies: ['USDT'],
    languages: ['繁中'],
    version: 'v0.1.0',
    mathVersion: 'RTP 96.00%',
    rtp: '96.00%',
    volatility: '中',
    merchantCount: 0,
    visibleMerchants: [],
    limitTemplates: ['標準限額'],
    defaultLimitTemplate: '標準限額',
    minBet: 1,
    maxBet: 1000,
    maintenance: false,
    maintenanceStart: '',
    maintenanceEnd: '',
    technicalOwner: 'Game Tech',
    packageId: '',
    assetVersion: '',
    note: '',
    ...row
  };
}

function openDialog(mode: DialogMode, row?: GameRow) {
  dialogMode.value = mode;
  activeGamePanel.value = 'basic';
  const source = mode === 'create' ? blankRow() : { ...(row ?? {}) };
  selectedRow.value = normalizeGameRow(source);
  dialogVisible.value = true;
}

function switchDialogToEdit() {
  if (!selectedRow.value) return;
  selectedRow.value = normalizeGameRow(selectedRow.value);
  dialogMode.value = 'edit';
  activeGamePanel.value = 'basic';
}

function saveDialog() {
  dialogVisible.value = false;
}

function requestEnvironmentMode(value?: string | number | null) {
  const nextValue = String(value ?? nextEnvironmentMode.value);
  if (!selectedRow.value) return;

  if (nextValue === selectedRow.value.environmentMode) return;
  pendingEnvironmentMode.value = nextValue;
  environmentConfirmVisible.value = true;
}

function confirmEnvironmentMode() {
  if (selectedRow.value && pendingEnvironmentMode.value) {
    selectedRow.value.environmentMode = pendingEnvironmentMode.value;
  }
  pendingEnvironmentMode.value = '';
  environmentConfirmVisible.value = false;
}

function cancelEnvironmentMode() {
  pendingEnvironmentMode.value = '';
  environmentConfirmVisible.value = false;
}

function openDisableDialog(row: GameRow) {
  disableTarget.value = row;
  disableReason.value = '';
  disableDialogVisible.value = true;
}

function confirmDisableGame() {
  if (!disableTarget.value || disableReasonInvalid.value) return;
  disableTarget.value.status = '下架';
  disableTarget.value.maintenance = false;
  disableDialogVisible.value = false;
}

function openMaintenanceDialog(row?: GameRow) {
  maintenanceTarget.value = row ?? null;
  maintenanceScope.value = row ? '單一遊戲' : '全部遊戲';
  maintenanceGameCode.value = row ? `${row.code} ${row.name}` : '';
  maintenanceRange.value = [null, null];
  maintenanceReason.value = '';
  maintenanceDialogVisible.value = true;
}

function confirmMaintenance() {
  if (maintenanceInvalid.value) return;
  const targets = maintenanceScope.value === '全部遊戲'
    ? rows
    : rows.filter((row) => `${row.code} ${row.name}` === maintenanceGameCode.value);

  targets.forEach((row) => {
    row.maintenance = true;
    row.status = '維護中';
    row.maintenanceStart = maintenanceRange.value[0]?.toISOString() ?? '';
    row.maintenanceEnd = maintenanceRange.value[1]?.toISOString() ?? '';
  });

  maintenanceDialogVisible.value = false;
}
</script>

<template>
  <div class="page-stack game-list-page">
    <SummaryCardGrid :cards="gameSummary" />

    <section class="technical-owner-banner">
      <i class="pi pi-code" />
      <div>
        <strong>遊戲新增與版本設定由技術方負責</strong>
        <p>營運端可查看、下架、維護與控管商戶可見範圍；遊戲主檔、程式版本、素材版本與數值版本需由技術流程建立。</p>
      </div>
    </section>

    <FilterCard title="查詢條件" description="查詢遊戲主檔、環境模式、上下架狀態、維護狀態與支援平台。">
      <div class="merchant-filter-grid">
        <template v-for="field in gameFilters" :key="field.key">
          <DateTimeRangeField
            v-if="field.type === 'dateRange'"
            class="merchant-date-range"
            :model-value="rangeValue(field.key)"
            @update:model-value="setRangeValue(field.key, $event)"
          />
          <div v-else class="field" :class="`merchant-filter-field--${field.key}`">
            <label>{{ field.label }}</label>
            <InputText v-if="field.type === 'text'" v-model="filters[field.key]" placeholder="輸入遊戲代號或名稱" fluid />
            <Select v-else-if="field.type === 'select'" v-model="filters[field.key]" :options="options(field)" :placeholder="field.label" fluid />
          </div>
        </template>
        <div class="merchant-filter-actions">
          <Button label="查詢" icon="pi pi-search" />
          <Button label="重置" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" />
        </div>
      </div>
    </FilterCard>

    <div class="agent-command-bar">
      <div>
        <span class="table-count"><Badge :value="rows.length" severity="info" /> 款遊戲</span>
        <p>遊戲不可硬刪除；正式環境上下架、維護與數值版本變更需保留操作紀錄。</p>
      </div>
      <div class="agent-command-actions">
        <Button label="維護排程" icon="pi pi-calendar-clock" severity="secondary" outlined @click="openMaintenanceDialog()" />
        <Button label="新增遊戲" icon="pi pi-plus" @click="openDialog('create')" />
        <Button label="欄位設定" icon="pi pi-sliders-h" severity="secondary" outlined />
        <Button label="匯出" icon="pi pi-download" severity="secondary" outlined />
      </div>
    </div>

    <SectionCard class="merchant-table-card">
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
        table-style="min-width: 1220px"
      >
        <Column field="code" header="遊戲代號" frozen style="width: 128px; min-width: 128px">
          <template #body="{ data }">
            <strong class="linkish" @click="openDialog('view', data)">{{ data.code }}</strong>
          </template>
        </Column>
        <Column field="name" header="遊戲名稱" style="width: 168px; min-width: 168px">
          <template #body="{ data }">
            <strong class="agent-primary-text">{{ data.name }}</strong>
          </template>
        </Column>
        <Column field="type" header="類型" style="width: 96px; min-width: 96px" />
        <Column field="status" header="狀態" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 104px; min-width: 104px">
          <template #body="{ data }">
            <span class="agent-token-wrap">
              <StatusTag class="agent-token agent-token--status" :value="data.status" />
            </span>
          </template>
        </Column>
        <Column field="environmentMode" header="環境" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 104px; min-width: 104px">
          <template #body="{ data }">
            <span class="agent-token-wrap">
              <Tag class="agent-token" :value="data.environmentMode" :severity="environmentSeverity(data.environmentMode)" />
            </span>
          </template>
        </Column>
        <Column field="version" header="程式版本" style="width: 116px; min-width: 116px" />
        <Column field="assetVersion" header="素材版本" style="width: 136px; min-width: 136px" />
        <Column field="platform" header="平台" style="width: 112px; min-width: 112px">
          <template #body="{ data }">
            <span class="merchant-token-wrap" v-tooltip.top="multiTooltip(data.platform)">
              <Tag class="merchant-token merchant-token--multi" :value="compactMultiLabel(data.platform)" severity="secondary" />
            </span>
          </template>
        </Column>
        <Column field="merchantCount" header="授權商戶" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 104px; min-width: 104px" />
        <Column field="maintenance" header="維護排程" style="width: 168px; min-width: 168px">
          <template #body="{ data }">
            <div class="maintenance-cell">
              <Tag class="agent-token" :value="maintenanceLabel(data)" :severity="data.maintenance ? 'warn' : 'success'" />
              <small>{{ maintenanceWindowLabel(data) }}</small>
            </div>
          </template>
        </Column>
        <Column header="操作" frozen align-frozen="right" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 128px; min-width: 128px">
          <template #body="{ data }">
            <div class="row-actions">
              <Button v-tooltip.top="'查看遊戲'" icon="pi pi-eye" text severity="secondary" aria-label="查看遊戲" @click="openDialog('view', data)" />
              <Button
                v-tooltip.top="'設定維護排程'"
                icon="pi pi-wrench"
                text
                severity="secondary"
                aria-label="維護設定"
                :disabled="data.status === '下架'"
                @click="openMaintenanceDialog(data)"
              />
              <Button v-tooltip.top="'營運控制'" icon="pi pi-sliders-h" text severity="secondary" aria-label="營運控制" @click="openDialog('edit', data)" />
              <Button
                v-tooltip.top="data.status === '下架' ? '遊戲已下架' : '下架遊戲'"
                icon="pi pi-ban"
                text
                severity="danger"
                aria-label="下架遊戲"
                :disabled="data.status === '下架'"
                @click="openDisableDialog(data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </SectionCard>

    <Dialog v-model:visible="dialogVisible" modal dismissable-mask :header="dialogTitle" class="entity-dialog">
      <div v-if="selectedRow" class="entity-dialog-body">
        <div class="dialog-stepper" role="tablist" aria-label="遊戲資料分段">
          <button
            v-for="panel in gameDialogPanels"
            :key="panel.key"
            type="button"
            class="dialog-step"
            :class="{ active: activeGamePanel === panel.key }"
            @click="activeGamePanel = panel.key"
          >
            <i :class="panel.icon" />
            <span>{{ panel.label }}</span>
          </button>
        </div>

        <template v-if="dialogMode === 'view'">
          <section v-show="activeGamePanel === 'basic'" class="dialog-section">
            <h3>主檔資料</h3>
            <div class="detail-grid dialog-detail-grid">
              <div><span>遊戲代號</span><strong>{{ selectedRow.code }}</strong></div>
              <div><span>遊戲名稱</span><strong>{{ selectedRow.name || '-' }}</strong></div>
              <div><span>遊戲類型</span><strong>{{ selectedRow.type }}</strong></div>
              <div><span>狀態</span><StatusTag :value="String(selectedRow.status || '-')" /></div>
              <div><span>環境模式</span><Tag :value="String(selectedRow.environmentMode || '測試')" :severity="environmentSeverity(selectedRow.environmentMode)" /></div>
              <div><span>維護中</span><strong>{{ booleanLabel(selectedRow.maintenance) }}</strong></div>
            </div>
          </section>

          <section v-show="activeGamePanel === 'operations'" class="dialog-section">
            <h3>營運控制</h3>
            <div class="detail-grid dialog-detail-grid">
              <div><span>套用限紅模板</span><strong>{{ tags(selectedRow.limitTemplates || selectedRow.defaultLimitTemplate).join(', ') }}</strong></div>
              <div><span>投注區間</span><strong>{{ selectedRow.minBet ?? '-' }} - {{ selectedRow.maxBet ?? '-' }}</strong></div>
              <div><span>授權商戶</span><strong>{{ selectedRow.merchantCount ?? 0 }}</strong></div>
              <div><span>維護排程</span><strong>{{ maintenanceWindowLabel(selectedRow) }}</strong></div>
              <div><span>支援語系</span><strong>{{ tags(selectedRow.languages).join(', ') }}</strong></div>
              <div><span>支援幣別</span><strong>{{ tags(selectedRow.currencies).join(', ') }}</strong></div>
            </div>
          </section>

          <section v-show="activeGamePanel === 'resources'" class="dialog-section">
            <h3>關聯資源</h3>
            <p class="dialog-section-note">版本、素材、數值與商戶開關都有專用頁；遊戲列表只提供摘要與入口。</p>
            <div class="detail-grid dialog-detail-grid">
              <div><span>程式版本</span><strong>{{ selectedRow.version }}</strong></div>
              <div><span>素材版本</span><strong>{{ selectedRow.assetVersion || '-' }}</strong></div>
              <div><span>數值版本</span><SensitiveValue :value="String(selectedRow.mathVersion || '-')" /></div>
              <div><span>理論 RTP</span><SensitiveValue :value="String(selectedRow.rtp || '-')" /></div>
              <div><span>Package ID</span><SensitiveValue :value="String(selectedRow.packageId || '-')" /></div>
              <div><span>負責單位</span><strong>{{ selectedRow.technicalOwner || '-' }}</strong></div>
            </div>
            <div class="related-route-actions">
              <Button label="版本紀錄" icon="pi pi-history" severity="secondary" outlined @click="router.push('/games/versions')" />
              <Button label="素材管理" icon="pi pi-images" severity="secondary" outlined @click="router.push('/games/assets')" />
              <Button label="數值設定" icon="pi pi-percentage" severity="secondary" outlined @click="router.push('/games/math')" />
              <Button label="商戶開關" icon="pi pi-sliders-h" severity="secondary" outlined @click="router.push('/games/merchant-access')" />
            </div>
          </section>
        </template>

        <div v-else class="agent-dialog-form">
          <section v-show="activeGamePanel === 'basic'" class="dialog-section">
            <h3>主檔資料</h3>
            <p class="dialog-section-note">遊戲主檔由技術方建立；營運異動正式狀態時需保留審核與操作紀錄。</p>
            <div class="dialog-form-grid">
              <div class="field field-span-3">
                <label>遊戲代號</label>
                <InputText v-model="selectedRow.code" fluid />
              </div>
              <div class="field field-span-5">
                <label>遊戲名稱</label>
                <InputText v-model="selectedRow.name" fluid />
              </div>
              <div class="field field-span-2">
                <label>遊戲類型</label>
                <Select v-model="selectedRow.type" :options="['老虎機', '桌遊', '小遊戲', '真人']" fluid />
              </div>
              <div class="field field-span-2">
                <label>狀態</label>
                <Select v-model="selectedRow.status" :options="['上架', '測試中', '維護中', '待審核', '下架']" fluid />
              </div>
              <div class="field field-span-3 environment-action-field">
                <label>環境模式</label>
                <div class="field-action-control">
                  <Tag :value="String(selectedRow.environmentMode || '測試')" :severity="environmentSeverity(selectedRow.environmentMode)" />
                  <Button label="送審切換" icon="pi pi-shield" severity="secondary" outlined @click="requestEnvironmentMode()" />
                </div>
                <small>正式環境會影響商戶可調用與報表統計。</small>
              </div>
              <div class="field field-span-3 environment-action-field">
                <label>維護排程</label>
                <div class="field-action-control">
                  <Tag :value="maintenanceLabel(selectedRow)" :severity="selectedRow.maintenance ? 'warn' : 'success'" />
                  <Button label="設定" icon="pi pi-calendar-clock" severity="secondary" outlined @click="openMaintenanceDialog(selectedRow)" />
                </div>
                <small>{{ maintenanceWindowLabel(selectedRow) }}</small>
              </div>
              <div class="field field-span-3">
                <label>可見商戶數</label>
                <InputNumber v-model="selectedRow.merchantCount" :min="0" fluid />
              </div>
            </div>
          </section>

          <section v-show="activeGamePanel === 'operations'" class="dialog-section">
            <h3>營運控制</h3>
            <p class="dialog-section-note">此處只處理單款遊戲的營運狀態與模板套用；版本、素材、數值與商戶授權請至專用頁。</p>
            <div class="dialog-form-grid">
              <div class="field field-span-3">
                <label>支援平台</label>
                <MultiSelect v-model="selectedRow.platform" :options="['H5', 'Web', 'App']" display="chip" fluid />
              </div>
              <div class="field field-span-3">
                <label>支援幣別</label>
                <MultiSelect v-model="selectedRow.currencies" :options="['USDT', 'USD', 'TWD']" display="chip" fluid />
              </div>
              <div class="field field-span-4">
                <label>套用限紅模板</label>
                <MultiSelect v-model="selectedRow.limitTemplates" :options="gameLimitTemplateOptions" display="chip" fluid />
                <small>模板內容由「遊戲設定」維護，可複選套用。</small>
              </div>
              <div class="field field-span-4">
                <label>最小投注</label>
                <InputNumber v-model="selectedRow.minBet" :min="0" fluid />
              </div>
              <div class="field field-span-4">
                <label>最大投注</label>
                <InputNumber v-model="selectedRow.maxBet" :min="0" fluid />
              </div>
              <div class="field field-span-6">
                <label>支援語系</label>
                <MultiSelect v-model="selectedRow.languages" :options="['繁中', '英文', '泰文', '越南文']" display="chip" fluid />
              </div>
              <div class="field field-span-6">
                <label>可見商戶</label>
                <MultiSelect
                  v-model="selectedRow.visibleMerchants"
                  :options="gameMerchantOptions"
                  display="chip"
                  filter
                  placeholder="選擇可見此遊戲的商戶"
                  fluid
                />
                <small>未授權的商戶不應在後台與 Launch API 看到此遊戲。</small>
              </div>
              <div class="field field-span-12">
                <label>變更原因</label>
                <Textarea v-model="selectedRow.changeReason" rows="3" placeholder="正式環境調整可見範圍需填寫原因" fluid />
              </div>
            </div>
          </section>

          <section v-show="activeGamePanel === 'resources'" class="dialog-section">
            <h3>關聯資源</h3>
            <p class="dialog-section-note">以下資料在專用頁維護，避免遊戲列表承擔版本、素材與數值的審核流程。</p>
            <div class="detail-grid dialog-detail-grid">
              <div><span>程式版本</span><strong>{{ selectedRow.version }}</strong></div>
              <div><span>素材版本</span><strong>{{ selectedRow.assetVersion || '-' }}</strong></div>
              <div><span>數值版本</span><SensitiveValue :value="String(selectedRow.mathVersion || '-')" /></div>
              <div><span>理論 RTP</span><SensitiveValue :value="String(selectedRow.rtp || '-')" /></div>
            </div>
            <div class="related-route-actions">
              <Button label="版本紀錄" icon="pi pi-history" severity="secondary" outlined @click="router.push('/games/versions')" />
              <Button label="素材管理" icon="pi pi-images" severity="secondary" outlined @click="router.push('/games/assets')" />
              <Button label="數值設定" icon="pi pi-percentage" severity="secondary" outlined @click="router.push('/games/math')" />
              <Button label="商戶開關" icon="pi pi-sliders-h" severity="secondary" outlined @click="router.push('/games/merchant-access')" />
            </div>
          </section>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer-actions">
          <Button label="關閉" severity="secondary" outlined @click="dialogVisible = false" />
          <Button v-if="dialogMode === 'view'" label="編輯遊戲" icon="pi pi-pencil" @click="switchDialogToEdit" />
          <Button
            v-else
            :label="dialogMode === 'create' ? '建立遊戲' : '儲存變更'"
            icon="pi pi-check"
            @click="saveDialog"
          />
        </div>
      </template>
    </Dialog>

    <Dialog v-model:visible="disableDialogVisible" modal dismissable-mask header="下架遊戲確認" class="disable-agent-dialog">
      <div v-if="disableTarget" class="disable-agent-body">
        <div class="disable-agent-warning">
          <i class="pi pi-exclamation-triangle" />
          <div>
            <strong>遊戲不可硬刪除，僅能下架。</strong>
            <p>下架後仍會保留版本、素材、數值、商戶可見範圍與操作紀錄；正式系統需送審。</p>
          </div>
        </div>

        <div class="disable-agent-summary">
          <div>
            <span>遊戲代號</span>
            <strong>{{ disableTarget.code }}</strong>
          </div>
          <div>
            <span>遊戲名稱</span>
            <strong>{{ disableTarget.name }}</strong>
          </div>
          <div>
            <span>遊戲類型</span>
            <strong>{{ disableTarget.type }}</strong>
          </div>
          <div>
            <span>授權商戶</span>
            <strong>{{ disableTarget.merchantCount ?? 0 }}</strong>
          </div>
        </div>

        <div class="field">
          <label>下架原因</label>
          <Textarea v-model="disableReason" rows="3" auto-resize placeholder="請輸入下架原因，至少 6 個字" fluid />
          <small v-if="disableReasonInvalid" class="field-error">請填寫至少 6 個字，方便後續稽核追蹤。</small>
        </div>
      </div>

      <template #footer>
        <Button label="取消" severity="secondary" outlined @click="disableDialogVisible = false" />
        <Button label="確認下架" icon="pi pi-ban" severity="danger" :disabled="disableReasonInvalid" @click="confirmDisableGame" />
      </template>
    </Dialog>

    <Dialog v-model:visible="maintenanceDialogVisible" modal dismissable-mask header="維護排程設定" class="disable-agent-dialog">
      <div class="disable-agent-body">
        <div class="disable-agent-warning">
          <i class="pi pi-wrench" />
          <div>
            <strong>維護排程會影響玩家啟動新局。</strong>
            <p>可設定全部遊戲或單一遊戲維護，必須指定固定起訖時間；維護期間保留歷史注單與報表，但不可啟動新局。</p>
          </div>
        </div>

        <div class="maintenance-schedule-grid">
          <div class="field">
            <label>維護範圍</label>
            <SelectButton v-model="maintenanceScope" :options="['全部遊戲', '單一遊戲']" />
          </div>
          <div class="field">
            <label>指定遊戲</label>
            <Select v-model="maintenanceGameCode" :options="maintenanceGameOptions" :disabled="maintenanceScope === '全部遊戲'" placeholder="選擇遊戲" fluid />
          </div>
          <DateTimeRangeField v-model="maintenanceRange" class="maintenance-range-field" />
          <div class="field field-wide">
            <label>維護原因</label>
            <Textarea v-model="maintenanceReason" rows="3" auto-resize placeholder="請輸入維護原因，至少 6 個字" fluid />
            <small v-if="maintenanceReasonInvalid" class="field-error">請填寫至少 6 個字，方便後續稽核追蹤。</small>
            <small v-else-if="maintenanceRangeInvalid" class="field-error">請設定維護起始與結束時間。</small>
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="取消" severity="secondary" outlined @click="maintenanceDialogVisible = false" />
        <Button label="建立維護排程" icon="pi pi-check" severity="warn" :disabled="maintenanceInvalid" @click="confirmMaintenance" />
      </template>
    </Dialog>

    <Dialog v-model:visible="environmentConfirmVisible" modal dismissable-mask :header="environmentConfirmTitle" class="environment-confirm-dialog">
      <div class="environment-confirm-content">
        <div class="environment-confirm-icon">
          <i class="pi pi-exclamation-triangle" />
        </div>
        <div>
          <strong>{{ environmentConfirmLead }}</strong>
          <p>{{ environmentConfirmMessage }}</p>
        </div>
      </div>

      <template #footer>
        <Button label="先不要" severity="secondary" outlined @click="cancelEnvironmentMode" />
        <Button
          :label="pendingEnvironmentMode === '正式' ? '確認切換正式' : '確認切回測試'"
          icon="pi pi-check"
          :severity="pendingEnvironmentMode === '正式' ? 'danger' : 'secondary'"
          @click="confirmEnvironmentMode"
        />
      </template>
    </Dialog>
  </div>
</template>
