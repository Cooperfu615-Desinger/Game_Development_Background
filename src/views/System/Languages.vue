<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue';
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
type LanguageStatus = '啟用' | '停用' | '待審核';

interface LanguageRow {
  code: string;
  name: string;
  nativeName: string;
  locale: string;
  direction: string;
  portalEnabled: boolean;
  gameAssetEnabled: boolean;
  defaultLanguage: boolean;
  translationCoverage: number;
  status: LanguageStatus;
  owner: string;
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
  status: allOption,
  scope: allOption,
  owner: allOption,
  range: [startDate, now] as [Date | null, Date | null]
});

const languageRows = reactive<LanguageRow[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await fetch('/api/system/v2/languages');
    languageRows.splice(0, languageRows.length, ...await res.json());
  } finally {
    loading.value = false;
  }
});

const selectedLanguage = ref<LanguageRow | null>(null);
const detailVisible = ref(false);
const formVisible = ref(false);
const isEditing = ref(false);

const statusOptions = [allOption, '啟用', '停用', '待審核'];
const scopeOptions = [allOption, 'Portal', '遊戲素材', '預設語系'];
const ownerOptions = computed(() => [allOption, ...Array.from(new Set(languageRows.map((row) => row.owner)))]);
const directionOptions = ['LTR', 'RTL'];
const formStatusOptions: LanguageStatus[] = ['啟用', '停用', '待審核'];

const languageForm = reactive<LanguageRow>({
  code: '',
  name: '',
  nativeName: '',
  locale: '',
  direction: 'LTR',
  portalEnabled: true,
  gameAssetEnabled: false,
  defaultLanguage: false,
  translationCoverage: 0,
  status: '待審核',
  owner: 'Localization',
  updatedAt: '2026-05-22 12:30:00',
  note: ''
});

const filteredRows = computed(() => {
  const keyword = filters.keyword.trim().toLowerCase();
  return languageRows.filter((row) => {
    const matchKeyword = !keyword || [row.code, row.name, row.nativeName, row.locale, row.note].some((value) => value.toLowerCase().includes(keyword));
    const matchStatus = filters.status === allOption || row.status === filters.status;
    const matchScope = filters.scope === allOption
      || (filters.scope === 'Portal' && row.portalEnabled)
      || (filters.scope === '遊戲素材' && row.gameAssetEnabled)
      || (filters.scope === '預設語系' && row.defaultLanguage);
    const matchOwner = filters.owner === allOption || row.owner === filters.owner;
    const matchTime = isWithinRange(row.updatedAt, filters.range);
    return matchKeyword && matchStatus && matchScope && matchOwner && matchTime;
  });
});

const summaryCards = computed(() => {
  const rows = filteredRows.value;
  const avgCoverage = rows.length ? Math.round(rows.reduce((sum, row) => sum + row.translationCoverage, 0) / rows.length) : 0;
  return [
    { label: '語系數', value: String(rows.length), helper: `啟用 ${rows.filter((row) => row.status === '啟用').length}`, severity: 'info' as Severity },
    { label: 'Portal 支援', value: String(rows.filter((row) => row.portalEnabled).length), helper: '可於後台切換顯示', severity: 'success' as Severity },
    { label: '素材支援', value: String(rows.filter((row) => row.gameAssetEnabled).length), helper: '可綁定遊戲素材與文案', severity: 'warn' as Severity },
    { label: '平均覆蓋率', value: `${avgCoverage}%`, helper: 'Portal 與素材文案完成度', severity: avgCoverage >= 90 ? 'success' as Severity : 'warn' as Severity }
  ];
});

const defaultLanguage = computed(() => languageRows.find((row) => row.defaultLanguage) ?? languageRows[0]);
const incompleteLanguages = computed(() => languageRows
  .filter((row) => row.translationCoverage < 90)
  .sort((a, b) => a.translationCoverage - b.translationCoverage));

const governanceCards = computed(() => [
  { label: '預設語系', value: defaultLanguage.value?.name ?? '-', helper: defaultLanguage.value?.locale ?? '-' },
  { label: 'Portal 可用', value: String(languageRows.filter((row) => row.portalEnabled).length), helper: '可在後台切換' },
  { label: '素材可用', value: String(languageRows.filter((row) => row.gameAssetEnabled).length), helper: '遊戲素材與文案' },
  { label: '待補翻譯', value: String(incompleteLanguages.value.length), helper: '覆蓋率低於 90%' }
]);

function assignForm(row?: LanguageRow) {
  Object.assign(languageForm, row ? { ...row } : {
    code: '',
    name: '',
    nativeName: '',
    locale: '',
    direction: 'LTR',
    portalEnabled: true,
    gameAssetEnabled: false,
    defaultLanguage: false,
    translationCoverage: 0,
    status: '待審核',
    owner: 'Localization',
    updatedAt: '2026-05-22 12:30:00',
    note: ''
  });
}

function openCreate() {
  isEditing.value = false;
  selectedLanguage.value = null;
  assignForm();
  formVisible.value = true;
}

function openEdit(row: LanguageRow) {
  isEditing.value = true;
  selectedLanguage.value = row;
  assignForm(row);
  formVisible.value = true;
}

function openDetail(row: LanguageRow) {
  selectedLanguage.value = row;
  detailVisible.value = true;
}

function submitForm() {
  if (languageForm.defaultLanguage) {
    languageRows.forEach((row) => {
      row.defaultLanguage = row.code === languageForm.code;
    });
    languageForm.portalEnabled = true;
  }

  if (isEditing.value && selectedLanguage.value) {
    Object.assign(selectedLanguage.value, { ...languageForm, updatedAt: '2026-05-22 12:30:00' });
  } else {
    languageRows.unshift({
      ...languageForm,
      code: languageForm.code || languageForm.locale || `lang-${languageRows.length + 1}`,
      locale: languageForm.locale || languageForm.code
    });
  }
  formVisible.value = false;
}

function resetFilters() {
  filters.keyword = '';
  filters.status = allOption;
  filters.scope = allOption;
  filters.owner = allOption;
  filters.range = [startDate, now];
}

function tagSeverity(value: string): Severity {
  if (['啟用', 'Portal', '遊戲素材'].includes(value)) return 'success';
  if (['待審核', '預設語系'].includes(value)) return 'warn';
  if (['停用'].includes(value)) return 'danger';
  return 'secondary';
}

function coverageSeverity(value: number): Severity {
  if (value >= 90) return 'success';
  if (value >= 60) return 'warn';
  return 'danger';
}

function isWithinRange(value: string, range: [Date | null, Date | null]) {
  const time = new Date(value.replace(' ', 'T')).getTime();
  const start = range[0]?.getTime() ?? Number.NEGATIVE_INFINITY;
  const end = range[1]?.getTime() ?? Number.POSITIVE_INFINITY;
  return time >= start && time <= end;
}
</script>

<template>
  <div class="page-stack reports-page system-languages-page">
    <section class="summary-grid">
      <article v-for="item in summaryCards" :key="item.label" class="agent-summary-card">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <small>{{ item.helper }}</small>
      </article>
    </section>

    <section class="risk-overview-insight-grid language-governance-grid">
      <SectionCard>
        <template #header>
          <div class="dialog-title-block">
            <h2>語系治理</h2>
            <p>確認預設語系、Portal 顯示與遊戲素材支援是否一致。</p>
          </div>
        </template>
        <div class="system-role-meta-grid">
          <div v-for="item in governanceCards" :key="item.label">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
            <small class="agent-secondary-text">{{ item.helper }}</small>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <template #header>
          <div class="dialog-title-block">
            <h2>翻譯待補</h2>
            <p>覆蓋率不足會影響 Portal 文案、遊戲素材與商戶展示品質。</p>
          </div>
        </template>
        <div class="risk-action-list">
          <article v-for="row in incompleteLanguages.slice(0, 3)" :key="row.code">
            <span>{{ row.code }} · {{ row.owner }}</span>
            <strong>{{ row.name }} / {{ row.translationCoverage }}%</strong>
            <p>{{ row.note }}</p>
          </article>
        </div>
      </SectionCard>
    </section>

    <FilterCard title="查詢條件" description="查詢語系代碼、Portal 顯示、遊戲素材支援、翻譯覆蓋率與狀態。">

      <div class="trade-filter-grid">
        <div class="field trade-filter-keyword">
          <label>關鍵字</label>
          <InputText v-model="filters.keyword" placeholder="輸入語系代碼、名稱、Locale 或備註" fluid />
        </div>
        <div class="field">
          <label>支援範圍</label>
          <Select v-model="filters.scope" :options="scopeOptions" fluid />
        </div>
        <div class="field">
          <label>負責人</label>
          <Select v-model="filters.owner" :options="ownerOptions" fluid />
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
        <span class="table-count"><Badge :value="filteredRows.length" severity="info" /> 筆語系</span>
        <p>新增語系、預設語系、Portal 顯示與遊戲素材語系異動都應保留審核與操作紀錄。</p>
      </div>
      <div class="agent-command-actions">
        <Button label="新增語系" icon="pi pi-plus" @click="openCreate" />
        <Button label="匯出" icon="pi pi-download" severity="secondary" outlined />
      </div>
    </div>

    <SectionCard class="merchant-table-card trade-table-card">
      <DataTable :value="filteredRows" :loading="loading" scrollable paginator :rows="10" :rows-per-page-options="[5, 10, 20, 50, 100]" data-key="code" table-style="min-width: 1260px">
        <Column field="code" header="語系代碼" style="width: 118px; min-width: 118px">
          <template #body="{ data }"><strong class="agent-code">{{ data.code }}</strong></template>
        </Column>
        <Column header="語系名稱" style="width: 200px; min-width: 200px">
          <template #body="{ data }">
            <strong class="agent-primary-text">{{ data.name }}</strong>
            <small class="agent-secondary-text">{{ data.nativeName }}</small>
          </template>
        </Column>
        <Column field="locale" header="Locale" style="width: 120px; min-width: 120px" />
        <Column field="direction" header="方向" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 88px; min-width: 88px" />
        <Column header="支援範圍" style="width: 260px; min-width: 260px">
          <template #body="{ data }">
            <div class="system-chip-list">
              <Tag :value="data.portalEnabled ? 'Portal' : '無 Portal'" :severity="data.portalEnabled ? 'success' : 'secondary'" />
              <Tag :value="data.gameAssetEnabled ? '遊戲素材' : '無素材'" :severity="data.gameAssetEnabled ? 'info' : 'secondary'" />
              <Tag v-if="data.defaultLanguage" value="預設語系" severity="warn" />
            </div>
          </template>
        </Column>
        <Column field="translationCoverage" header="覆蓋率" style="width: 168px; min-width: 168px">
          <template #body="{ data }">
            <div class="language-coverage-cell">
              <div>
                <strong>{{ data.translationCoverage }}%</strong>
                <Tag :value="coverageSeverity(data.translationCoverage) === 'success' ? '完整' : '待補'" :severity="coverageSeverity(data.translationCoverage)" />
              </div>
              <ProgressBar
                :value="data.translationCoverage"
                :show-value="false"
                :class="['language-coverage-bar', `language-coverage-bar--${coverageSeverity(data.translationCoverage)}`]"
              />
            </div>
          </template>
        </Column>
        <Column field="status" header="狀態" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 104px; min-width: 104px">
          <template #body="{ data }"><Tag :value="data.status" :severity="tagSeverity(data.status)" /></template>
        </Column>
        <Column field="owner" header="負責人" style="width: 128px; min-width: 128px" />
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

    <Dialog v-model:visible="detailVisible" modal dismissable-mask class="entity-dialog" header="語系詳情">
      <div v-if="selectedLanguage" class="entity-dialog-body">
        <section class="dialog-section">
          <h3>{{ selectedLanguage.name }} / {{ selectedLanguage.nativeName }}</h3>
          <div class="detail-grid dialog-detail-grid">
            <div><span>語系代碼</span><strong>{{ selectedLanguage.code }}</strong></div>
            <div><span>Locale</span><strong>{{ selectedLanguage.locale }}</strong></div>
            <div><span>文字方向</span><strong>{{ selectedLanguage.direction }}</strong></div>
            <div><span>Portal</span><Tag :value="selectedLanguage.portalEnabled ? '支援' : '不支援'" :severity="selectedLanguage.portalEnabled ? 'success' : 'danger'" /></div>
            <div><span>遊戲素材</span><Tag :value="selectedLanguage.gameAssetEnabled ? '支援' : '不支援'" :severity="selectedLanguage.gameAssetEnabled ? 'success' : 'danger'" /></div>
            <div>
              <span>覆蓋率</span>
              <div class="language-coverage-cell">
                <div>
                  <strong>{{ selectedLanguage.translationCoverage }}%</strong>
                  <Tag :value="coverageSeverity(selectedLanguage.translationCoverage) === 'success' ? '完整' : '待補'" :severity="coverageSeverity(selectedLanguage.translationCoverage)" />
                </div>
                <ProgressBar
                  :value="selectedLanguage.translationCoverage"
                  :show-value="false"
                  :class="['language-coverage-bar', `language-coverage-bar--${coverageSeverity(selectedLanguage.translationCoverage)}`]"
                />
              </div>
            </div>
            <div><span>狀態</span><Tag :value="selectedLanguage.status" :severity="tagSeverity(selectedLanguage.status)" /></div>
            <div><span>負責人</span><strong>{{ selectedLanguage.owner }}</strong></div>
            <div class="detail-field-wide"><span>備註</span><SensitiveValue :value="selectedLanguage.note" /></div>
          </div>
        </section>
      </div>
      <template #footer>
        <Button label="關閉" severity="secondary" outlined @click="detailVisible = false" />
      </template>
    </Dialog>

    <Dialog v-model:visible="formVisible" modal dismissable-mask class="entity-dialog" :header="isEditing ? '編輯語系' : '新增語系'">
      <div class="entity-dialog-body">
        <section class="dialog-section">
          <h3>語系設定</h3>
          <p class="dialog-section-note">預設語系、Portal 顯示與遊戲素材語系會影響商戶可見內容，正式環境異動需送審。</p>
          <div class="dialog-form-grid">
            <div class="field field-span-3">
              <label>語系代碼</label>
              <InputText v-model="languageForm.code" :disabled="isEditing" placeholder="zh-TW" fluid />
            </div>
            <div class="field field-span-3">
              <label>Locale</label>
              <InputText v-model="languageForm.locale" placeholder="zh-TW" fluid />
            </div>
            <div class="field field-span-3">
              <label>顯示名稱</label>
              <InputText v-model="languageForm.name" placeholder="繁體中文" fluid />
            </div>
            <div class="field field-span-3">
              <label>原生名稱</label>
              <InputText v-model="languageForm.nativeName" placeholder="繁體中文" fluid />
            </div>
            <div class="field field-span-4">
              <label>文字方向</label>
              <Select v-model="languageForm.direction" :options="directionOptions" fluid />
            </div>
            <div class="field field-span-4">
              <label>翻譯覆蓋率</label>
              <InputNumber v-model="languageForm.translationCoverage" suffix="%" :min="0" :max="100" :max-fraction-digits="0" fluid />
            </div>
            <div class="field field-span-4">
              <label>狀態</label>
              <Select v-model="languageForm.status" :options="formStatusOptions" fluid />
            </div>
            <div class="field field-span-6">
              <label>負責人</label>
              <InputText v-model="languageForm.owner" placeholder="Localization" fluid />
            </div>
            <div class="field field-span-2 switch-field">
              <label>Portal</label>
              <div class="dialog-control"><ToggleSwitch v-model="languageForm.portalEnabled" /></div>
            </div>
            <div class="field field-span-2 switch-field">
              <label>遊戲素材</label>
              <div class="dialog-control"><ToggleSwitch v-model="languageForm.gameAssetEnabled" /></div>
            </div>
            <div class="field field-span-2 switch-field">
              <label>預設語系</label>
              <div class="dialog-control"><ToggleSwitch v-model="languageForm.defaultLanguage" /></div>
            </div>
            <div class="field field-span-12">
              <label>備註 / 異動原因</label>
              <Textarea v-model="languageForm.note" rows="4" auto-resize fluid />
            </div>
          </div>
        </section>
      </div>
      <template #footer>
        <Button label="取消" severity="secondary" outlined @click="formVisible = false" />
        <Button :label="isEditing ? '儲存變更' : '建立語系'" icon="pi pi-check" @click="submitForm" />
      </template>
    </Dialog>
  </div>
</template>
