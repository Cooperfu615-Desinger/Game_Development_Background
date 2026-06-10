<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import MultiSelect from 'primevue/multiselect';
import ToggleSwitch from 'primevue/toggleswitch';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Badge from 'primevue/badge';
import Dialog from 'primevue/dialog';
import SectionCard from '@/components/ui/SectionCard.vue';
import StatusTag from '@/components/ui/StatusTag.vue';
import CurrencyAmount from '@/components/ui/CurrencyAmount.vue';
import DateTimeRangeField from '@/components/ui/DateTimeRangeField.vue';
import SensitiveValue from '@/components/ui/SensitiveValue.vue';
import SummaryCardGrid from '@/components/ui/SummaryCardGrid.vue';

type MerchantRow = Record<string, unknown>;
type DialogMode = 'view' | 'edit' | 'create';
type MerchantDialogPanel = 'basic' | 'api' | 'wallet' | 'games' | 'settlement' | 'contact';

type PageField = {
  key: string;
  label: string;
  type: 'text' | 'select' | 'dateRange';
  options?: string[];
};

const filters = reactive<Record<string, unknown>>({});
const dialogVisible = ref(false);
const dialogMode = ref<DialogMode>('view');
const activeMerchantPanel = ref<MerchantDialogPanel>('basic');
const selectedRow = ref<MerchantRow | null>(null);
const disableDialogVisible = ref(false);
const disableTarget = ref<MerchantRow | null>(null);
const disableReason = ref('');
const environmentConfirmVisible = ref(false);
const pendingEnvironmentMode = ref('');

const rows = reactive<MerchantRow[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await fetch('/api/merchants/v2/list');
    rows.splice(0, rows.length, ...await res.json());
  } finally {
    loading.value = false;
  }
});

const merchantStatusOptions = ['全部狀態', '啟用', '警示', '待審核', '停用'];
const merchantCurrencyOptions = ['全部幣別', 'USDT', 'USD', 'TWD'];
const merchantWalletOptions = ['全部錢包', '單一', '轉帳'];
const merchantApiStatusOptions = ['全部 API 狀態', '啟用', '警示', '待審核', '停用'];
const merchantEnvironmentOptions = ['全部環境', '測試', '正式'];
const merchantAgentOptions = computed(() => ['全部代理', ...Array.from(new Set(rows.map((row) => String(row.agent))))]);
const merchantGameOptions = ['GAME-001 Fortune Tiger', 'GAME-002 Royal Spin', 'GAME-003 Baccarat Pro', 'GAME-004 Crash Rocket'];
const merchantGameLimitOptions = ['標準限額', '低風險限額', '高額限額', 'VIP 限額'];
const merchantRtpModeOptions = ['沿用遊戲預設', '商戶專屬 RTP', '待審核版本'];
const pageSizeOptions = [5, 10, 20, 50, 100];
const paginatorTemplate = 'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown';
const currentPageReportTemplate = '{first}-{last} / {totalRecords}';

const merchantFilters: PageField[] = [
  { key: 'keyword', label: '關鍵字', type: 'text' },
  { key: 'agent', label: '所屬代理', type: 'select' },
  { key: 'status', label: '商戶狀態', type: 'select', options: merchantStatusOptions },
  { key: 'environmentMode', label: '環境模式', type: 'select', options: merchantEnvironmentOptions },
  { key: 'apiStatus', label: 'API 狀態', type: 'select', options: merchantApiStatusOptions },
  { key: 'walletType', label: '錢包類型', type: 'select', options: merchantWalletOptions },
  { key: 'currency', label: '支援幣別', type: 'select', options: merchantCurrencyOptions },
  { key: 'createdAt', label: '建立時間', type: 'dateRange' }
];

const merchantSummary = computed(() => {
  const active = rows.filter((row) => row.status === '啟用').length;
  const warning = rows.filter((row) => row.status === '警示').length;
  const review = rows.filter((row) => row.status === '待審核').length;
  const games = rows.reduce((sum, row) => sum + Number(row.gameCount || 0), 0);

  return [
    { label: '商戶總數', value: String(rows.length), helper: `啟用 ${active}，警示 ${warning}` },
    { label: '可調用遊戲', value: String(games), helper: '依商戶授權範圍統計' },
    { label: '待審核設定', value: String(review), helper: 'API、錢包或回呼設定待確認' },
    { label: '錢包類型', value: '2', helper: '單一 / 轉帳' }
  ];
});

const dialogTitle = computed(() => {
  if (dialogMode.value === 'create') return '新增商戶';
  if (dialogMode.value === 'edit') return '編輯商戶';
  return '商戶詳情';
});

const merchantDialogPanels = [
  { key: 'basic', label: '基本資料', icon: 'pi pi-building' },
  { key: 'api', label: 'API / 安全', icon: 'pi pi-key' },
  { key: 'wallet', label: '錢包設定', icon: 'pi pi-wallet' },
  { key: 'games', label: '遊戲 / RTP', icon: 'pi pi-th-large' },
  { key: 'settlement', label: '分潤結算', icon: 'pi pi-percentage' },
  { key: 'contact', label: '聯絡備註', icon: 'pi pi-address-book' }
] as const;

const isProductionEnvironment = computed(() => selectedRow.value?.environmentMode === '正式');
const nextEnvironmentMode = computed(() => (isProductionEnvironment.value ? '測試' : '正式'));
const environmentConfirmTitle = computed(() => (pendingEnvironmentMode.value === '正式' ? '切換至正式模式' : '切回測試模式'));
const environmentConfirmLead = computed(() => (pendingEnvironmentMode.value === '正式' ? '這會影響正式計算與營運資料' : '確認切回測試模式'));
const environmentConfirmMessage = computed(() =>
  pendingEnvironmentMode.value === '正式'
    ? '切換為正式後，商戶 API、錢包交易、RTP、分潤與結算設定都會被視為正式營運設定。後續修改敏感欄位需走審核流程並留下操作紀錄。'
    : '切回測試後，後續設定會回到沙盒驗證情境，不應再作為正式結算或真實錢包計算依據。'
);
const disableReasonInvalid = computed(() => disableReason.value.trim().length < 6);

function options(field: PageField) {
  if (field.key === 'agent') return merchantAgentOptions.value;
  return field.options ?? [];
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

function merchantGgrLabel(row: MerchantRow) {
  const currency = String(row.settlementCurrency ?? row.defaultCurrency ?? 'USDT');
  const ggr = String(row.ggr ?? '0');
  return `${currency} ${ggr}`;
}

function merchantRtpLabel(row: MerchantRow) {
  if (row.rtpValue !== undefined && row.rtpValue !== null && row.rtpValue !== '') {
    return `${Number(row.rtpValue).toFixed(2)}%`;
  }
  return String(row.rtp ?? '-');
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
  return normalizeMerchantRow({
    code: 'MER-NEW',
    name: '',
    agent: 'Asia Master',
    status: '待審核'
  });
}

function normalizeMerchantRow(row: MerchantRow) {
  const rtpText = String(row.rtp ?? '96').replace('%', '');
  return {
    currencies: ['USDT'],
    defaultCurrency: 'USDT',
    settlementCurrency: 'USDT',
    languages: ['繁中'],
    environmentMode: '測試',
    walletType: '單一',
    apiStatus: '待審核',
    gameCount: 0,
    gameLaunchEnabled: true,
    availableGames: ['GAME-001 Fortune Tiger'],
    gameLimitTemplate: '標準限額',
    merchantRtpMode: '沿用遊戲預設',
    merchantMathScope: '全商戶預設',
    revenueType: 'GGR 分潤',
    revenueShare: '0.00%',
    rtp: '96.00%',
    rtpValue: Number.isFinite(Number(rtpText)) ? Number(rtpText) : 96,
    apiKey: 'pk_live_new_merchant_key',
    secretKey: 'sk_live_new_secret_once',
    walletApi: '',
    callbackUrl: '',
    contact: '',
    note: '',
    createdAt: '2026-05-19 00:00',
    ...row
  };
}

function openDialog(mode: DialogMode, row?: MerchantRow) {
  dialogMode.value = mode;
  activeMerchantPanel.value = 'basic';
  const source = mode === 'create' ? blankRow() : { ...(row ?? {}) };
  selectedRow.value = normalizeMerchantRow(source);
  dialogVisible.value = true;
}

function switchDialogToEdit() {
  if (!selectedRow.value) return;
  selectedRow.value = normalizeMerchantRow(selectedRow.value);
  dialogMode.value = 'edit';
  activeMerchantPanel.value = 'basic';
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

function openDisableDialog(row: MerchantRow) {
  disableTarget.value = row;
  disableReason.value = '';
  disableDialogVisible.value = true;
}

function confirmDisableMerchant() {
  if (!disableTarget.value || disableReasonInvalid.value) return;
  disableTarget.value.status = '停用';
  disableDialogVisible.value = false;
}
</script>

<template>
  <div class="page-stack merchant-list-page">
    <SummaryCardGrid :cards="merchantSummary" />

    <SectionCard class="merchant-filter-card">
      <template #header>
        <div class="dialog-title-block">
          <h2>查詢條件</h2>
          <p>查詢商戶基本資料、環境模式、API 狀態、錢包類型與支援幣別。</p>
        </div>
      </template>
      <div class="merchant-filter-grid">
        <template v-for="field in merchantFilters" :key="field.key">
          <DateTimeRangeField
            v-if="field.type === 'dateRange'"
            class="merchant-date-range"
            :model-value="rangeValue(field.key)"
            @update:model-value="setRangeValue(field.key, $event)"
          />
          <div v-else class="field" :class="`merchant-filter-field--${field.key}`">
            <label>{{ field.label }}</label>
            <InputText v-if="field.type === 'text'" v-model="filters[field.key]" placeholder="輸入商戶代號或名稱" fluid />
            <Select v-else-if="field.type === 'select'" v-model="filters[field.key]" :options="options(field)" :placeholder="field.label" fluid />
          </div>
        </template>
        <div class="merchant-filter-actions">
          <Button label="查詢" icon="pi pi-search" />
          <Button label="重置" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" />
        </div>
      </div>
    </SectionCard>

    <div class="toolbar-row">
      <span><Badge :value="rows.length" severity="info" /> 筆商戶</span>
      <div>
        <Button label="新增商戶" icon="pi pi-plus" @click="openDialog('create')" />
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
        <Column field="code" header="商戶代號" frozen style="width: 120px; min-width: 120px">
          <template #body="{ data }">
            <strong class="linkish" @click="openDialog('view', data)">{{ data.code }}</strong>
          </template>
        </Column>
        <Column field="name" header="商戶名稱" style="width: 160px; min-width: 160px">
          <template #body="{ data }">
            <strong class="agent-primary-text">{{ data.name }}</strong>
          </template>
        </Column>
        <Column field="agent" header="所屬代理" style="width: 150px; min-width: 150px" />
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
              <Tag
                class="agent-token merchant-environment-token"
                :value="data.environmentMode || '測試'"
                :severity="data.environmentMode === '正式' ? 'danger' : 'info'"
              />
            </span>
          </template>
        </Column>
        <Column field="currencies" header="支援幣別" style="width: 128px; min-width: 128px">
          <template #body="{ data }">
            <span class="merchant-token-wrap" v-tooltip.top="multiTooltip(data.currencies)">
              <Tag class="merchant-token merchant-token--multi" :value="compactMultiLabel(data.currencies)" severity="info" />
            </span>
          </template>
        </Column>
        <Column field="walletType" header="錢包類型" style="width: 120px; min-width: 120px" />
        <Column field="apiStatus" header="API 狀態" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 104px; min-width: 104px">
          <template #body="{ data }">
            <span class="agent-token-wrap">
              <StatusTag class="agent-token agent-token--status" :value="data.apiStatus" />
            </span>
          </template>
        </Column>
        <Column field="gameCount" header="遊戲數" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 96px; min-width: 96px" />
        <Column header="操作" frozen align-frozen="right" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 128px; min-width: 128px">
          <template #body="{ data }">
            <div class="row-actions">
              <Button v-tooltip.top="'查看商戶'" icon="pi pi-eye" text severity="secondary" aria-label="查看商戶" @click="openDialog('view', data)" />
              <Button v-tooltip.top="'編輯商戶'" icon="pi pi-pencil" text severity="secondary" aria-label="編輯商戶" @click="openDialog('edit', data)" />
              <Button
                v-tooltip.top="data.status === '停用' ? '商戶已停用' : '停用商戶'"
                icon="pi pi-ban"
                text
                severity="danger"
                aria-label="停用商戶"
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
        <div class="dialog-stepper merchant-dialog-stepper" role="tablist" aria-label="商戶資料分段">
          <button
            v-for="panel in merchantDialogPanels"
            :key="panel.key"
            type="button"
            class="dialog-step"
            :class="{ active: activeMerchantPanel === panel.key }"
            @click="activeMerchantPanel = panel.key"
          >
            <i :class="panel.icon" />
            <span>{{ panel.label }}</span>
          </button>
        </div>

        <template v-if="dialogMode === 'view'">
          <section v-show="activeMerchantPanel === 'basic'" class="dialog-section">
            <h3>基本資料</h3>
            <div class="detail-grid dialog-detail-grid">
              <div><span>商戶代號</span><strong>{{ selectedRow.code }}</strong></div>
              <div><span>商戶名稱</span><strong>{{ selectedRow.name || '-' }}</strong></div>
              <div><span>所屬代理</span><strong>{{ selectedRow.agent || '-' }}</strong></div>
              <div><span>狀態</span><StatusTag :value="String(selectedRow.status || '-')" /></div>
              <div><span>支援幣別</span><strong>{{ tags(selectedRow.currencies).join(', ') }}</strong></div>
              <div><span>支援語系</span><strong>{{ tags(selectedRow.languages).join(', ') }}</strong></div>
            </div>
          </section>

          <section v-show="activeMerchantPanel === 'api'" class="dialog-section">
            <h3>API / 安全</h3>
            <div class="detail-grid dialog-detail-grid">
              <div><span>API 狀態</span><StatusTag :value="String(selectedRow.apiStatus || '-')" /></div>
              <div><span>環境模式</span><strong>{{ selectedRow.environmentMode || '-' }}</strong></div>
              <div><span>API 金鑰</span><SensitiveValue :value="String(selectedRow.apiKey || '-')" /></div>
              <div><span>Secret 金鑰</span><SensitiveValue :value="String(selectedRow.secretKey || '-')" /></div>
              <div><span>回呼 URL</span><SensitiveValue :value="String(selectedRow.callbackUrl || '-')" /></div>
            </div>
          </section>

          <section v-show="activeMerchantPanel === 'wallet'" class="dialog-section">
            <h3>錢包設定</h3>
            <div class="detail-grid dialog-detail-grid">
              <div><span>錢包類型</span><strong>{{ selectedRow.walletType }}</strong></div>
              <div><span>錢包 API</span><SensitiveValue :value="String(selectedRow.walletApi || '-')" /></div>
              <div><span>預設幣別</span><strong>{{ selectedRow.defaultCurrency }}</strong></div>
              <div><span>對帳幣別</span><strong>{{ selectedRow.settlementCurrency }}</strong></div>
            </div>
          </section>

          <section v-show="activeMerchantPanel === 'games'" class="dialog-section">
            <h3>遊戲 / RTP</h3>
            <p class="dialog-section-note">商戶只能啟動已授權的遊戲；正式環境調整遊戲授權、限額模板或商戶專屬 RTP 需送審。</p>
            <div class="detail-grid dialog-detail-grid">
              <div><span>遊戲入口</span><StatusTag :value="selectedRow.gameLaunchEnabled ? '啟用' : '停用'" /></div>
              <div><span>可調用遊戲數</span><strong>{{ tags(selectedRow.availableGames).filter(Boolean).length || selectedRow.gameCount || 0 }}</strong></div>
              <div><span>限額模板</span><strong>{{ selectedRow.gameLimitTemplate || '-' }}</strong></div>
              <div><span>RTP 模式</span><strong>{{ selectedRow.merchantRtpMode || '-' }}</strong></div>
              <div><span>商戶 RTP</span><SensitiveValue :value="merchantRtpLabel(selectedRow)" /></div>
              <div><span>數值範圍</span><strong>{{ selectedRow.merchantMathScope || '-' }}</strong></div>
              <div class="detail-field-wide">
                <span>授權遊戲</span>
                <div class="merchant-authorized-games">
                  <Tag
                    v-for="game in tags(selectedRow.availableGames).filter(Boolean)"
                    :key="String(game)"
                    :value="String(game)"
                    severity="info"
                  />
                </div>
              </div>
              <div><span>近 7 日投注</span><CurrencyAmount :value="String(selectedRow.bet || '-')" /></div>
              <div><span>近 7 日 GGR</span><CurrencyAmount :value="String(selectedRow.ggr || '-')" :negative="String(selectedRow.ggr || '').includes('-')" /></div>
            </div>
          </section>

          <section v-show="activeMerchantPanel === 'settlement'" class="dialog-section">
            <h3>分潤結算</h3>
            <div class="detail-grid dialog-detail-grid">
              <div><span>分潤類型</span><strong>{{ selectedRow.revenueType }}</strong></div>
              <div><span>分潤比例</span><SensitiveValue :value="String(selectedRow.revenueShare || '-')" /></div>
              <div><span>對帳幣別</span><strong>{{ selectedRow.settlementCurrency }}</strong></div>
              <div><span>建立時間</span><strong>{{ selectedRow.createdAt }}</strong></div>
            </div>
          </section>

          <section v-show="activeMerchantPanel === 'contact'" class="dialog-section">
            <h3>聯絡備註</h3>
            <div class="detail-grid dialog-detail-grid">
              <div><span>主要聯絡人</span><strong>{{ selectedRow.contact || '-' }}</strong></div>
              <div><span>內部備註</span><SensitiveValue :value="String(selectedRow.note || '-')" /></div>
            </div>
          </section>
        </template>

        <div v-else class="agent-dialog-form">
          <section v-show="activeMerchantPanel === 'basic'" class="dialog-section">
            <h3>基本資料</h3>
            <div class="dialog-form-grid">
              <div class="field field-span-4">
                <label>商戶代號</label>
                <InputText v-model="selectedRow.code" fluid />
              </div>
              <div class="field field-span-4">
                <label>商戶名稱</label>
                <InputText v-model="selectedRow.name" fluid />
              </div>
              <div class="field field-span-4">
                <label>所屬代理</label>
                <Select v-model="selectedRow.agent" :options="merchantAgentOptions" class="truncate-select" fluid />
              </div>
              <div class="field field-span-3">
                <label>商戶狀態</label>
                <Select v-model="selectedRow.status" :options="['啟用', '警示', '待審核', '停用']" fluid />
              </div>
              <div class="field field-span-3">
                <label>預設幣別</label>
                <Select v-model="selectedRow.defaultCurrency" :options="['USDT', 'USD', 'TWD']" fluid />
              </div>
              <div class="field field-span-6">
                <label>支援幣別</label>
                <MultiSelect v-model="selectedRow.currencies" :options="['USDT', 'USD', 'TWD']" display="chip" fluid />
              </div>
              <div class="field field-span-12">
                <label>支援語系</label>
                <MultiSelect v-model="selectedRow.languages" :options="['繁中', '英文', '泰文', '越南文']" display="chip" fluid />
              </div>
            </div>
          </section>

          <section v-show="activeMerchantPanel === 'api'" class="dialog-section">
            <h3>API / 安全</h3>
            <div class="dialog-form-grid">
              <div class="field field-span-3">
                <label>API 狀態</label>
                <Select v-model="selectedRow.apiStatus" :options="['啟用', '警示', '待審核', '停用']" fluid />
              </div>
              <div class="field field-span-3 environment-action-field">
                <label>環境模式</label>
                <div class="field-action-control">
                  <Tag :value="String(selectedRow.environmentMode || '測試')" :severity="isProductionEnvironment ? 'danger' : 'info'" />
                  <Button
                    :label="isProductionEnvironment ? '切回測試' : '切換正式'"
                    :icon="isProductionEnvironment ? 'pi pi-undo' : 'pi pi-shield'"
                    :severity="isProductionEnvironment ? 'secondary' : 'danger'"
                    :outlined="isProductionEnvironment"
                    @click="requestEnvironmentMode()"
                  />
                </div>
                <small>{{ isProductionEnvironment ? '正式模式納入 API、錢包與結算計算。' : '測試模式不納入正式結算。' }}</small>
              </div>
              <div class="field field-span-3">
                <label>API 金鑰</label>
                <SensitiveValue :value="String(selectedRow.apiKey || '-')" />
              </div>
              <div class="field field-span-3">
                <label>Secret 金鑰</label>
                <SensitiveValue :value="String(selectedRow.secretKey || '-')" />
              </div>
              <div class="field field-span-12">
                <label>回呼 URL</label>
                <InputText v-model="selectedRow.callbackUrl" fluid />
                <small>正式環境修改回呼 URL 需送審。</small>
              </div>
            </div>
          </section>

          <section v-show="activeMerchantPanel === 'wallet'" class="dialog-section">
            <h3>錢包設定</h3>
            <div class="dialog-form-grid">
              <div class="field field-span-6">
                <label>錢包類型</label>
                <Select v-model="selectedRow.walletType" :options="['單一', '轉帳']" fluid />
              </div>
              <div class="field field-span-6">
                <label>對帳幣別</label>
                <Select v-model="selectedRow.settlementCurrency" :options="['USDT', 'USD', 'TWD']" fluid />
              </div>
              <div class="field field-span-12">
                <label>錢包 API</label>
                <InputText v-model="selectedRow.walletApi" fluid />
                <small>正式環境修改錢包 API 需送審。</small>
              </div>
            </div>
          </section>

          <section v-show="activeMerchantPanel === 'games'" class="dialog-section">
            <h3>遊戲 / RTP</h3>
            <p class="dialog-section-note">先決定商戶可見遊戲，再套用限額模板與 RTP 模式；正式環境的敏感異動需送審。</p>
            <div class="dialog-form-grid">
              <div class="field switch-field field-span-3">
                <label>遊戲入口</label>
                <div class="dialog-control dialog-switch-control">
                  <ToggleSwitch v-model="selectedRow.gameLaunchEnabled" />
                </div>
              </div>
              <div class="field field-span-3">
                <label>限額模板</label>
                <Select v-model="selectedRow.gameLimitTemplate" :options="merchantGameLimitOptions" fluid />
              </div>
              <div class="field field-span-3">
                <label>RTP 模式</label>
                <Select v-model="selectedRow.merchantRtpMode" :options="merchantRtpModeOptions" fluid />
              </div>
              <div class="field field-span-3">
                <label>商戶 RTP</label>
                <InputNumber v-model="selectedRow.rtpValue" :min="80" :max="120" :min-fraction-digits="2" :max-fraction-digits="2" suffix="%" fluid />
                <small>正式環境修改需送審。</small>
              </div>
              <div class="field field-span-12">
                <label>授權遊戲</label>
                <MultiSelect
                  v-model="selectedRow.availableGames"
                  :options="merchantGameOptions"
                  display="chip"
                  filter
                  placeholder="選擇此商戶可啟用的遊戲"
                  fluid
                />
                <small>未授權的遊戲不應出現在商戶後台與 Launch API 回傳結果。</small>
              </div>
              <div class="field field-span-12">
                <label>數值範圍</label>
                <Select v-model="selectedRow.merchantMathScope" :options="['全商戶預設', '依遊戲版本', '商戶專屬版本']" fluid />
              </div>
              <div class="field field-span-6 merchant-game-metric">
                <label>近 7 日投注</label>
                <CurrencyAmount :value="String(selectedRow.bet || '-')" />
              </div>
              <div class="field field-span-6 merchant-game-metric">
                <label>近 7 日 GGR</label>
                <CurrencyAmount :value="String(selectedRow.ggr || '-')" :negative="String(selectedRow.ggr || '').includes('-')" />
              </div>
            </div>
          </section>

          <section v-show="activeMerchantPanel === 'settlement'" class="dialog-section">
            <h3>分潤結算</h3>
            <div class="dialog-form-grid">
              <div class="field field-span-4">
                <label>分潤類型</label>
                <Select v-model="selectedRow.revenueType" :options="['GGR 分潤', '流水', '固定']" fluid />
              </div>
              <div class="field field-span-4">
                <label>分潤比例</label>
                <InputText v-model="selectedRow.revenueShare" fluid />
              </div>
              <div class="field field-span-4">
                <label>建立時間</label>
                <InputText v-model="selectedRow.createdAt" fluid />
              </div>
            </div>
          </section>

          <section v-show="activeMerchantPanel === 'contact'" class="dialog-section">
            <h3>聯絡備註</h3>
            <div class="dialog-form-grid">
              <div class="field field-span-6">
                <label>主要聯絡人</label>
                <InputText v-model="selectedRow.contact" fluid />
              </div>
              <div class="field field-span-12">
                <label>內部備註</label>
                <Textarea v-model="selectedRow.note" rows="3" fluid />
              </div>
            </div>
          </section>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer-actions">
          <Button label="關閉" severity="secondary" outlined @click="dialogVisible = false" />
          <Button v-if="dialogMode === 'view'" label="編輯商戶" icon="pi pi-pencil" @click="switchDialogToEdit" />
          <Button
            v-else
            :label="dialogMode === 'create' ? '建立商戶' : '儲存變更'"
            icon="pi pi-check"
            @click="saveDialog"
          />
        </div>
      </template>
    </Dialog>

    <Dialog v-model:visible="disableDialogVisible" modal dismissable-mask header="停用商戶確認" class="disable-agent-dialog">
      <div v-if="disableTarget" class="disable-agent-body">
        <div class="disable-agent-warning">
          <i class="pi pi-exclamation-triangle" />
          <div>
            <strong>商戶不可硬刪除，僅能停用。</strong>
            <p>停用後仍會保留注單、交易、結算與操作紀錄；正式系統需送出操作紀錄並依權限審核。</p>
          </div>
        </div>

        <div class="disable-agent-summary">
          <div>
            <span>商戶代號</span>
            <strong>{{ disableTarget.code }}</strong>
          </div>
          <div>
            <span>商戶名稱</span>
            <strong>{{ disableTarget.name }}</strong>
          </div>
          <div>
            <span>API 狀態</span>
            <strong>{{ disableTarget.apiStatus }}</strong>
          </div>
          <div>
            <span>可調用遊戲</span>
            <strong>{{ disableTarget.gameCount ?? 0 }}</strong>
          </div>
          <div>
            <span>錢包類型</span>
            <strong>{{ disableTarget.walletType }}</strong>
          </div>
          <div>
            <span>未結算 GGR</span>
            <strong>{{ merchantGgrLabel(disableTarget) }}</strong>
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
        <Button label="確認停用" icon="pi pi-ban" severity="danger" :disabled="disableReasonInvalid" @click="confirmDisableMerchant" />
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
