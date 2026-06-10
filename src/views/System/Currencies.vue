<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue';
import { api } from '@/services/apiClient';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import ToggleSwitch from 'primevue/toggleswitch';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Badge from 'primevue/badge';
import Dialog from 'primevue/dialog';
import ProgressBar from 'primevue/progressbar';
import DateTimeRangeField from '@/components/ui/DateTimeRangeField.vue';
import SectionCard from '@/components/ui/SectionCard.vue';
import SensitiveValue from '@/components/ui/SensitiveValue.vue';
import FilterCard from '@/components/ui/FilterCard.vue';

type Severity = 'success' | 'info' | 'warn' | 'danger' | 'secondary';
type CurrencyStatus = '啟用' | '停用' | '待審核';
type CurrencyCategory = '法幣' | '穩定幣' | '加密幣';
type RateSource = '每日匯率' | '固定匯率' | '手動維護' | '待接匯率源';

interface CurrencyRow {
  code: string;
  name: string;
  symbol: string;
  category: CurrencyCategory;
  decimalPlaces: number;
  walletSupported: boolean;
  settlementSupported: boolean;
  reportSupported: boolean;
  defaultSettlement: boolean;
  fxRate: number;
  rateSource: RateSource;
  status: CurrencyStatus;
  updatedAt: string;
  note: string;
}

const allOption = '全部';
const now = new Date();
const startDate = new Date(now);
startDate.setDate(now.getDate() - 30);
startDate.setHours(0, 0, 0, 0);
now.setHours(23, 59, 59, 0);

const filters = reactive({
  keyword: '',
  category: allOption,
  status: allOption,
  settlement: allOption,
  range: [startDate, now] as [Date | null, Date | null]
});

const currencyRows = reactive<CurrencyRow[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const data = await api.get<CurrencyRow[]>('/api/system/v2/currencies');
    currencyRows.splice(0, currencyRows.length, ...data);
  } finally {
    loading.value = false;
  }
});

const selectedCurrency = ref<CurrencyRow | null>(null);
const detailVisible = ref(false);
const formVisible = ref(false);
const isEditing = ref(false);

const formCategoryOptions: CurrencyCategory[] = ['法幣', '穩定幣', '加密幣'];
const formStatusOptions: CurrencyStatus[] = ['啟用', '停用', '待審核'];
const rateSourceOptions: RateSource[] = ['每日匯率', '固定匯率', '手動維護', '待接匯率源'];
const categoryOptions = computed(() => [allOption, ...formCategoryOptions]);
const statusOptions = [allOption, ...formStatusOptions];
const settlementOptions = [allOption, '可對帳', '不可對帳', '預設對帳'];

const currencyForm = reactive<CurrencyRow>({
  code: '',
  name: '',
  symbol: '',
  category: '法幣',
  decimalPlaces: 2,
  walletSupported: true,
  settlementSupported: true,
  reportSupported: true,
  defaultSettlement: false,
  fxRate: 1,
  rateSource: '每日匯率',
  status: '待審核',
  updatedAt: '2026-05-22 12:20:00',
  note: ''
});

const filteredRows = computed(() => {
  const keyword = filters.keyword.trim().toLowerCase();
  return currencyRows.filter((row) => {
    const matchKeyword = !keyword || [row.code, row.name, row.symbol, row.note].some((value) => value.toLowerCase().includes(keyword));
    const matchCategory = filters.category === allOption || row.category === filters.category;
    const matchStatus = filters.status === allOption || row.status === filters.status;
    const matchSettlement = filters.settlement === allOption
      || (filters.settlement === '可對帳' && row.settlementSupported)
      || (filters.settlement === '不可對帳' && !row.settlementSupported)
      || (filters.settlement === '預設對帳' && row.defaultSettlement);
    const matchTime = isWithinRange(row.updatedAt, filters.range);
    return matchKeyword && matchCategory && matchStatus && matchSettlement && matchTime;
  });
});

const defaultSettlementCurrency = computed(() => currencyRows.find((row) => row.defaultSettlement) ?? currencyRows[0]);
const auditRequiredRows = computed(() => currencyRows.filter((row) => row.status === '待審核' || row.rateSource === '手動維護' || row.rateSource === '待接匯率源'));

const summaryCards = computed(() => {
  const rows = filteredRows.value;
  return [
    { label: '幣別數', value: String(rows.length), helper: `啟用 ${rows.filter((row) => row.status === '啟用').length}`, severity: 'info' as Severity },
    { label: '錢包支援', value: String(rows.filter((row) => row.walletSupported).length), helper: '可用於玩家錢包交易', severity: 'success' as Severity },
    { label: '對帳支援', value: String(rows.filter((row) => row.settlementSupported).length), helper: '可作為結算或折算幣別', severity: 'warn' as Severity },
    { label: '待審核', value: String(rows.filter((row) => row.status === '待審核').length), helper: '匯率或支援範圍異動', severity: 'danger' as Severity }
  ];
});

const governanceCards = computed(() => [
  { label: '預設對帳', value: defaultSettlementCurrency.value?.code ?? '-', helper: defaultSettlementCurrency.value?.name ?? '-' },
  { label: '每日匯率', value: String(currencyRows.filter((row) => row.rateSource === '每日匯率').length), helper: '依外部匯率源更新' },
  { label: '正式可結算', value: String(currencyRows.filter((row) => row.status === '啟用' && row.settlementSupported).length), helper: '可進入結算單' },
  { label: '需補設定', value: String(auditRequiredRows.value.length), helper: '待審核或匯率源未完成' }
]);

function assignForm(row?: CurrencyRow) {
  Object.assign(currencyForm, row ? { ...row } : {
    code: '',
    name: '',
    symbol: '',
    category: '法幣',
    decimalPlaces: 2,
    walletSupported: true,
    settlementSupported: false,
    reportSupported: true,
    defaultSettlement: false,
    fxRate: 1,
    rateSource: '每日匯率',
    status: '待審核',
    updatedAt: '2026-05-22 12:20:00',
    note: ''
  });
}

function openCreate() {
  isEditing.value = false;
  selectedCurrency.value = null;
  assignForm();
  formVisible.value = true;
}

function openEdit(row: CurrencyRow) {
  isEditing.value = true;
  selectedCurrency.value = row;
  assignForm(row);
  formVisible.value = true;
}

function openDetail(row: CurrencyRow) {
  selectedCurrency.value = row;
  detailVisible.value = true;
}

function submitForm() {
  if (currencyForm.defaultSettlement) {
    currencyRows.forEach((row) => {
      row.defaultSettlement = row.code === currencyForm.code;
    });
    currencyForm.settlementSupported = true;
  }

  if (isEditing.value && selectedCurrency.value) {
    Object.assign(selectedCurrency.value, { ...currencyForm, updatedAt: '2026-05-22 12:20:00' });
  } else {
    currencyRows.unshift({ ...currencyForm, code: currencyForm.code.toUpperCase() || `CUR${currencyRows.length + 1}` });
  }
  formVisible.value = false;
}

function resetFilters() {
  filters.keyword = '';
  filters.category = allOption;
  filters.status = allOption;
  filters.settlement = allOption;
  filters.range = [startDate, now];
}

function supportScore(row: CurrencyRow) {
  return [row.walletSupported, row.settlementSupported, row.reportSupported].filter(Boolean).length / 3 * 100;
}

function supportSeverity(row: CurrencyRow): Severity {
  const score = supportScore(row);
  if (score >= 100) return 'success';
  if (score >= 67) return 'warn';
  if (score > 0) return 'info';
  return 'danger';
}

function supportLabel(row: CurrencyRow) {
  return `${Math.round(supportScore(row))}%`;
}

function supportTags(row: CurrencyRow) {
  return [
    { label: row.walletSupported ? '錢包' : '無錢包', severity: row.walletSupported ? 'success' as Severity : 'secondary' as Severity },
    { label: row.settlementSupported ? '對帳' : '不可對帳', severity: row.settlementSupported ? 'info' as Severity : 'danger' as Severity },
    { label: row.reportSupported ? '報表' : '無報表', severity: row.reportSupported ? 'success' as Severity : 'secondary' as Severity },
    ...(row.defaultSettlement ? [{ label: '預設', severity: 'warn' as Severity }] : [])
  ];
}

function tagSeverity(value: string): Severity {
  if (['啟用', '穩定幣', '可對帳', '固定匯率'].includes(value)) return 'success';
  if (['待審核', '法幣', '每日匯率'].includes(value)) return 'warn';
  if (['停用', '不可對帳', '手動維護', '待接匯率源'].includes(value)) return 'danger';
  return 'secondary';
}

function auditReason(row: CurrencyRow) {
  if (row.status === '待審核') return '啟用或支援範圍異動待審核';
  if (row.rateSource === '待接匯率源') return '匯率來源尚未完成串接';
  if (row.rateSource === '手動維護') return '手動匯率正式異動需審核';
  return '需財務確認';
}

function isWithinRange(value: string, range: [Date | null, Date | null]) {
  const time = new Date(value.replace(' ', 'T')).getTime();
  const start = range[0]?.getTime() ?? Number.NEGATIVE_INFINITY;
  const end = range[1]?.getTime() ?? Number.POSITIVE_INFINITY;
  return time >= start && time <= end;
}
</script>

<template>
  <div class="page-stack reports-page system-currencies-page">
    <section class="summary-grid">
      <article v-for="item in summaryCards" :key="item.label" class="agent-summary-card">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <small>{{ item.helper }}</small>
      </article>
    </section>

    <section class="risk-overview-insight-grid currency-governance-grid">
      <SectionCard>
        <template #header>
          <div class="dialog-title-block">
            <h2>幣別治理</h2>
            <p>確認預設對帳幣別、正式結算支援與匯率來源。</p>
          </div>
        </template>
        <div class="system-role-meta-grid">
          <div v-for="item in governanceCards" :key="item.label">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
            <small>{{ item.helper }}</small>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <template #header>
          <div class="dialog-title-block">
            <h2>待審核與匯率風險</h2>
            <p>正式環境匯率、對帳幣別與錢包支援異動都應送審。</p>
          </div>
        </template>
        <div class="risk-action-list currency-risk-list">
          <article v-for="row in auditRequiredRows" :key="row.code">
            <span>{{ row.code }} · {{ row.rateSource }}</span>
            <strong>{{ row.name }} / {{ row.status }}</strong>
            <p>{{ auditReason(row) }}</p>
          </article>
        </div>
      </SectionCard>
    </section>

    <FilterCard title="查詢條件" description="查詢幣別、小數位、錢包支援、對帳支援、匯率來源與狀態。">

      <div class="trade-filter-grid">
        <div class="field trade-filter-keyword">
          <label>關鍵字</label>
          <InputText v-model="filters.keyword" placeholder="輸入幣別代碼、名稱或備註" fluid />
        </div>
        <div class="field">
          <label>類型</label>
          <Select v-model="filters.category" :options="categoryOptions" fluid />
        </div>
        <div class="field">
          <label>對帳支援</label>
          <Select v-model="filters.settlement" :options="settlementOptions" fluid />
        </div>
        <div class="field">
          <label>狀態</label>
          <Select v-model="filters.status" :options="statusOptions" fluid />
        </div>
        <DateTimeRangeField v-model="filters.range" class="trade-date-range" />
        <div class="trade-filter-actions">
          <Button label="查詢" icon="pi pi-search" />
          <Button label="重置" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" />
        </div>
      </div>
    </FilterCard>

    <div class="agent-command-bar">
      <div>
        <span class="table-count"><Badge :value="filteredRows.length" severity="info" /> 筆幣別</span>
        <p>新增幣別、匯率、小數位與正式對帳設定異動都應建立審核單並留下操作紀錄。</p>
      </div>
      <div class="agent-command-actions">
        <Button label="新增幣別" icon="pi pi-plus" @click="openCreate" />
        <Button label="匯出" icon="pi pi-download" severity="secondary" outlined />
      </div>
    </div>

    <SectionCard class="merchant-table-card trade-table-card">
      <DataTable :value="filteredRows" :loading="loading" scrollable paginator :rows="10" :rows-per-page-options="[5, 10, 20, 50, 100]" data-key="code" table-style="min-width: 1280px">
        <Column field="code" header="幣別" style="width: 108px; min-width: 108px">
          <template #body="{ data }"><strong class="agent-code">{{ data.code }}</strong></template>
        </Column>
        <Column header="名稱" style="width: 190px; min-width: 190px">
          <template #body="{ data }">
            <strong class="agent-primary-text">{{ data.name }}</strong>
            <small class="agent-secondary-text">{{ data.symbol }}</small>
          </template>
        </Column>
        <Column field="category" header="類型" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 104px; min-width: 104px">
          <template #body="{ data }"><Tag :value="data.category" :severity="tagSeverity(data.category)" /></template>
        </Column>
        <Column field="decimalPlaces" header="小數位" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 92px; min-width: 92px" />
        <Column header="支援範圍" style="width: 286px; min-width: 286px">
          <template #body="{ data }">
            <div class="currency-support-cell">
              <div>
                <strong>{{ supportLabel(data) }}</strong>
                <span>{{ data.defaultSettlement ? '預設對帳' : '一般幣別' }}</span>
              </div>
              <ProgressBar
                :value="supportScore(data)"
                :show-value="false"
                :class="['language-coverage-bar', `language-coverage-bar--${supportSeverity(data)}`]"
              />
              <div class="system-chip-list">
                <Tag v-for="tag in supportTags(data)" :key="tag.label" :value="tag.label" :severity="tag.severity" />
              </div>
            </div>
          </template>
        </Column>
        <Column field="fxRate" header="對 USDT 匯率" style="width: 150px; min-width: 150px">
          <template #body="{ data }"><SensitiveValue :value="data.fxRate.toFixed(6)" /></template>
        </Column>
        <Column field="rateSource" header="匯率來源" style="width: 130px; min-width: 130px">
          <template #body="{ data }"><Tag :value="data.rateSource" :severity="tagSeverity(data.rateSource)" /></template>
        </Column>
        <Column field="status" header="狀態" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 104px; min-width: 104px">
          <template #body="{ data }"><Tag :value="data.status" :severity="tagSeverity(data.status)" /></template>
        </Column>
        <Column field="updatedAt" header="更新時間" style="width: 168px; min-width: 168px" />
        <Column header="操作" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 112px; min-width: 112px">
          <template #body="{ data }">
            <div class="row-actions">
              <Button v-tooltip.top="'檢視'" icon="pi pi-eye" text severity="secondary" aria-label="檢視" @click="openDetail(data)" />
              <Button v-tooltip.top="'編輯'" icon="pi pi-pencil" text severity="secondary" aria-label="編輯" @click="openEdit(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </SectionCard>

    <Dialog v-model:visible="detailVisible" modal dismissable-mask class="entity-dialog" header="幣別詳情">
      <div v-if="selectedCurrency" class="entity-dialog-body">
        <section class="dialog-section">
          <h3>{{ selectedCurrency.code }} / {{ selectedCurrency.name }}</h3>
          <div class="detail-grid dialog-detail-grid">
            <div><span>幣別代碼</span><strong>{{ selectedCurrency.code }}</strong></div>
            <div><span>符號</span><strong>{{ selectedCurrency.symbol }}</strong></div>
            <div><span>類型</span><Tag :value="selectedCurrency.category" :severity="tagSeverity(selectedCurrency.category)" /></div>
            <div><span>小數位</span><strong>{{ selectedCurrency.decimalPlaces }}</strong></div>
            <div><span>錢包支援</span><Tag :value="selectedCurrency.walletSupported ? '支援' : '不支援'" :severity="selectedCurrency.walletSupported ? 'success' : 'danger'" /></div>
            <div><span>對帳支援</span><Tag :value="selectedCurrency.settlementSupported ? '支援' : '不支援'" :severity="selectedCurrency.settlementSupported ? 'success' : 'danger'" /></div>
            <div><span>報表支援</span><Tag :value="selectedCurrency.reportSupported ? '支援' : '不支援'" :severity="selectedCurrency.reportSupported ? 'success' : 'danger'" /></div>
            <div><span>預設對帳</span><Tag :value="selectedCurrency.defaultSettlement ? '是' : '否'" :severity="selectedCurrency.defaultSettlement ? 'warn' : 'secondary'" /></div>
            <div><span>對 USDT 匯率</span><SensitiveValue :value="selectedCurrency.fxRate.toFixed(6)" /></div>
            <div><span>匯率來源</span><Tag :value="selectedCurrency.rateSource" :severity="tagSeverity(selectedCurrency.rateSource)" /></div>
            <div class="detail-field-wide"><span>備註</span><SensitiveValue :value="selectedCurrency.note" /></div>
          </div>
        </section>
      </div>
      <template #footer>
        <Button label="關閉" severity="secondary" outlined @click="detailVisible = false" />
      </template>
    </Dialog>

    <Dialog v-model:visible="formVisible" modal dismissable-mask class="entity-dialog" :header="isEditing ? '編輯幣別' : '新增幣別'">
      <div class="entity-dialog-body">
        <section class="dialog-section">
          <h3>幣別設定</h3>
          <p class="dialog-section-note">匯率、小數位、錢包與對帳支援會影響報表與結算，正式環境異動需送審。</p>
          <div v-if="currencyForm.defaultSettlement" class="system-warning-strip">
            <i class="pi pi-shield"></i>
            <span>設為預設對帳幣別後，其他幣別會自動取消預設；正式環境需審核通過後才可生效。</span>
          </div>
          <div class="dialog-form-grid">
            <div class="field field-span-3">
              <label>幣別代碼</label>
              <InputText v-model="currencyForm.code" :disabled="isEditing" placeholder="USDT" fluid />
            </div>
            <div class="field field-span-5">
              <label>名稱</label>
              <InputText v-model="currencyForm.name" placeholder="幣別名稱" fluid />
            </div>
            <div class="field field-span-4">
              <label>符號</label>
              <InputText v-model="currencyForm.symbol" placeholder="$" fluid />
            </div>
            <div class="field field-span-4">
              <label>類型</label>
              <Select v-model="currencyForm.category" :options="formCategoryOptions" fluid />
            </div>
            <div class="field field-span-4">
              <label>小數位</label>
              <InputNumber v-model="currencyForm.decimalPlaces" :min="0" :max="8" :max-fraction-digits="0" fluid />
            </div>
            <div class="field field-span-4">
              <label>狀態</label>
              <Select v-model="currencyForm.status" :options="formStatusOptions" fluid />
            </div>
            <div class="field field-span-6">
              <label>對 USDT 匯率</label>
              <InputNumber v-model="currencyForm.fxRate" :min="0" :max-fraction-digits="8" fluid />
            </div>
            <div class="field field-span-6">
              <label>匯率來源</label>
              <Select v-model="currencyForm.rateSource" :options="rateSourceOptions" fluid />
            </div>
            <div class="field field-span-3 switch-field">
              <label>錢包支援</label>
              <div class="dialog-control"><ToggleSwitch v-model="currencyForm.walletSupported" /></div>
            </div>
            <div class="field field-span-3 switch-field">
              <label>對帳支援</label>
              <div class="dialog-control"><ToggleSwitch v-model="currencyForm.settlementSupported" /></div>
            </div>
            <div class="field field-span-3 switch-field">
              <label>報表支援</label>
              <div class="dialog-control"><ToggleSwitch v-model="currencyForm.reportSupported" /></div>
            </div>
            <div class="field field-span-3 switch-field">
              <label>預設對帳</label>
              <div class="dialog-control"><ToggleSwitch v-model="currencyForm.defaultSettlement" /></div>
            </div>
            <div class="field field-span-12">
              <label>備註 / 異動原因</label>
              <Textarea v-model="currencyForm.note" rows="4" auto-resize fluid />
            </div>
          </div>
        </section>
      </div>
      <template #footer>
        <Button label="取消" severity="secondary" outlined @click="formVisible = false" />
        <Button :label="isEditing ? '儲存變更' : '建立幣別'" icon="pi pi-check" @click="submitForm" />
      </template>
    </Dialog>
  </div>
</template>
