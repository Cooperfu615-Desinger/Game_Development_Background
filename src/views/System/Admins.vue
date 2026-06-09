<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import MultiSelect from 'primevue/multiselect';
import ToggleSwitch from 'primevue/toggleswitch';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Badge from 'primevue/badge';
import Dialog from 'primevue/dialog';
import DateTimeRangeField from '@/components/ui/DateTimeRangeField.vue';
import SectionCard from '@/components/ui/SectionCard.vue';
import SensitiveValue from '@/components/ui/SensitiveValue.vue';

type AdminStatus = '啟用' | '停用' | '鎖定' | '待啟用';
type Severity = 'success' | 'info' | 'warn' | 'danger' | 'secondary';

interface AdminRow {
  id: string;
  account: string;
  name: string;
  email: string;
  portal: string;
  groups: string[];
  dataScope: string;
  twoFactor: boolean;
  status: AdminStatus;
  lastLogin: string;
  createdAt: string;
  allowedIp: string;
  note: string;
}

const now = new Date();
const startDate = new Date(now);
startDate.setDate(now.getDate() - 30);
startDate.setHours(0, 0, 0, 0);
now.setHours(23, 59, 59, 0);

const filters = reactive({
  keyword: '',
  portal: '全部 Portal',
  group: '全部群組',
  dataScope: '全部範圍',
  status: '全部狀態',
  twoFactor: '全部',
  range: [startDate, now] as [Date | null, Date | null]
});

const portalOptions = ['全部 Portal', 'Supplier Portal', 'Agent Portal', 'Merchant Portal'];
const groupOptions = ['全部群組', '系統管理員', '營運主管', '財務主管', '風控人員', '客服人員', '技術人員'];
const dataScopeOptions = ['全部範圍', '全部資料', '指定代理', '指定商戶', '僅本人'];
const statusOptions = ['全部狀態', '啟用', '停用', '鎖定', '待啟用'];
const twoFactorOptions = ['全部', '已啟用', '未啟用'];
const formPortalOptions = portalOptions.slice(1);
const formGroupOptions = groupOptions.slice(1);
const formDataScopeOptions = dataScopeOptions.slice(1);

const adminRows = reactive<AdminRow[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await fetch('/api/system/v2/admins');
    adminRows.splice(0, adminRows.length, ...await res.json());
  } finally {
    loading.value = false;
  }
});

const selectedAdmin = ref<AdminRow | null>(null);
const detailVisible = ref(false);
const formVisible = ref(false);
const disableVisible = ref(false);
const unlockVisible = ref(false);
const isEditing = ref(false);
const activeStep = ref('基本資料');
const disableReason = ref('');

const emptyForm = () => ({
  id: '',
  account: '',
  name: '',
  email: '',
  password: '',
  portal: 'Supplier Portal',
  groups: ['營運主管'],
  dataScope: '全部資料',
  twoFactor: true,
  status: '待啟用' as AdminStatus,
  allowedIp: '',
  note: ''
});

const adminForm = reactive(emptyForm());

const formSteps = [
  { label: '基本資料', icon: 'pi pi-id-card' },
  { label: '帳號安全', icon: 'pi pi-lock' },
  { label: '權限範圍', icon: 'pi pi-shield' },
  { label: '備註', icon: 'pi pi-file-edit' }
];

const filteredRows = computed(() => adminRows.filter((row) => {
  const keyword = filters.keyword.trim().toLowerCase();
  const matchKeyword = !keyword || [row.id, row.account, row.name, row.email].some((value) => value.toLowerCase().includes(keyword));
  const matchPortal = filters.portal === '全部 Portal' || row.portal === filters.portal;
  const matchGroup = filters.group === '全部群組' || row.groups.includes(filters.group);
  const matchScope = filters.dataScope === '全部範圍' || row.dataScope === filters.dataScope;
  const matchStatus = filters.status === '全部狀態' || row.status === filters.status;
  const matchTwoFactor = filters.twoFactor === '全部' || (filters.twoFactor === '已啟用' ? row.twoFactor : !row.twoFactor);
  return matchKeyword && matchPortal && matchGroup && matchScope && matchStatus && matchTwoFactor;
}));

const summaryCards = computed(() => {
  const rows = filteredRows.value;
  const active = rows.filter((row) => row.status === '啟用').length;
  const locked = rows.filter((row) => row.status === '鎖定').length;
  const missingTwoFactor = rows.filter((row) => !row.twoFactor).length;
  return [
    { label: '管理員數', value: String(rows.length), helper: `啟用 ${active} / 停用 ${rows.filter((row) => row.status === '停用').length}`, icon: 'pi pi-users', severity: 'info' as Severity },
    { label: '已啟用 2FA', value: String(rows.filter((row) => row.twoFactor).length), helper: `未啟用 ${missingTwoFactor}`, icon: 'pi pi-shield', severity: missingTwoFactor > 0 ? 'warn' as Severity : 'success' as Severity },
    { label: '鎖定帳號', value: String(locked), helper: '連續登入失敗或人工鎖定', icon: 'pi pi-lock', severity: locked > 0 ? 'danger' as Severity : 'success' as Severity },
    { label: 'Portal 範圍', value: String(new Set(rows.map((row) => row.portal)).size), helper: 'Supplier / Agent / Merchant', icon: 'pi pi-sitemap', severity: 'secondary' as Severity }
  ];
});

function assignForm(row?: AdminRow) {
  const source = row
    ? {
        id: row.id,
        account: row.account,
        name: row.name,
        email: row.email,
        password: '',
        portal: row.portal,
        groups: [...row.groups],
        dataScope: row.dataScope,
        twoFactor: row.twoFactor,
        status: row.status,
        allowedIp: row.allowedIp,
        note: row.note
      }
    : emptyForm();
  Object.assign(adminForm, source);
}

function openCreate() {
  isEditing.value = false;
  activeStep.value = '基本資料';
  assignForm();
  formVisible.value = true;
}

function openEdit(row: AdminRow) {
  selectedAdmin.value = row;
  isEditing.value = true;
  activeStep.value = '基本資料';
  assignForm(row);
  formVisible.value = true;
}

function openDetail(row: AdminRow) {
  selectedAdmin.value = row;
  detailVisible.value = true;
}

function submitForm() {
  if (isEditing.value && selectedAdmin.value) {
    Object.assign(selectedAdmin.value, {
      account: adminForm.account,
      name: adminForm.name,
      email: adminForm.email,
      portal: adminForm.portal,
      groups: [...adminForm.groups],
      dataScope: adminForm.dataScope,
      twoFactor: adminForm.twoFactor,
      status: adminForm.status,
      allowedIp: adminForm.allowedIp || '不限',
      note: adminForm.note
    });
  } else {
    adminRows.unshift({
      id: `ADM-${String(adminRows.length + 1).padStart(3, '0')}`,
      account: adminForm.account || 'new.admin',
      name: adminForm.name || 'New Admin',
      email: adminForm.email || 'new.admin@example.com',
      portal: adminForm.portal,
      groups: [...adminForm.groups],
      dataScope: adminForm.dataScope,
      twoFactor: adminForm.twoFactor,
      status: adminForm.status,
      lastLogin: '-',
      createdAt: '2026-05-22 10:30:00',
      allowedIp: adminForm.allowedIp || '不限',
      note: adminForm.note || 'Demo 建立資料，正式環境需由後端驗證權限。'
    });
  }
  formVisible.value = false;
}

function openDisable(row: AdminRow) {
  selectedAdmin.value = row;
  disableReason.value = '';
  disableVisible.value = true;
}

function confirmDisable() {
  if (!selectedAdmin.value) return;
  selectedAdmin.value.status = '停用';
  selectedAdmin.value.note = disableReason.value || selectedAdmin.value.note;
  disableVisible.value = false;
}

function openUnlock(row: AdminRow) {
  selectedAdmin.value = row;
  unlockVisible.value = true;
}

function confirmUnlock() {
  if (!selectedAdmin.value) return;
  selectedAdmin.value.status = '啟用';
  selectedAdmin.value.note = '已由 Supplier Admin 解鎖，需保留操作紀錄。';
  unlockVisible.value = false;
}

function resetFilters() {
  filters.keyword = '';
  filters.portal = '全部 Portal';
  filters.group = '全部群組';
  filters.dataScope = '全部範圍';
  filters.status = '全部狀態';
  filters.twoFactor = '全部';
  filters.range = [startDate, now];
}

function tagSeverity(value: string): Severity {
  if (['啟用', '已啟用', '全部資料'].includes(value)) return 'success';
  if (['待啟用', '未啟用', '指定代理', '指定商戶'].includes(value)) return 'warn';
  if (['停用', '鎖定'].includes(value)) return 'danger';
  if (value.includes('Portal')) return 'info';
  return 'secondary';
}
</script>

<template>
  <div class="page-stack reports-page system-admins-page">
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
          <p>查詢管理員帳號、Portal、群組、資料範圍、2FA 與狀態。</p>
        </div>
      </template>

      <div class="trade-filter-grid">
        <div class="field trade-filter-keyword">
          <label>關鍵字</label>
          <InputText v-model="filters.keyword" placeholder="輸入帳號、姓名或 Email" fluid />
        </div>
        <div class="field">
          <label>Portal</label>
          <Select v-model="filters.portal" :options="portalOptions" fluid />
        </div>
        <div class="field">
          <label>管理員群組</label>
          <Select v-model="filters.group" :options="groupOptions" fluid />
        </div>
        <div class="field">
          <label>資料範圍</label>
          <Select v-model="filters.dataScope" :options="dataScopeOptions" fluid />
        </div>
        <div class="field">
          <label>狀態</label>
          <Select v-model="filters.status" :options="statusOptions" fluid />
        </div>
        <div class="field">
          <label>2FA</label>
          <Select v-model="filters.twoFactor" :options="twoFactorOptions" fluid />
        </div>
        <DateTimeRangeField v-model="filters.range" class="trade-date-range" />
        <div class="trade-filter-actions">
          <Button label="查詢" icon="pi pi-search" />
          <Button label="重置" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" />
        </div>
      </div>
    </SectionCard>

    <div class="toolbar-row">
      <span class="table-count"><Badge :value="filteredRows.length" severity="info" /> 筆管理員</span>
      <div>
        <Button label="新增管理員" icon="pi pi-plus" @click="openCreate" />
        <Button label="欄位設定" icon="pi pi-sliders-h" severity="secondary" outlined />
        <Button label="匯出" icon="pi pi-download" severity="secondary" outlined />
      </div>
    </div>

    <SectionCard class="merchant-table-card">
      <DataTable :value="filteredRows" :loading="loading" paginator :rows="10" :rows-per-page-options="[5, 10, 20, 50, 100]" scrollable table-style="min-width: 1220px">
        <Column field="id" header="編號" style="width: 118px">
          <template #body="{ data }">
            <strong class="agent-code">{{ data.id }}</strong>
          </template>
        </Column>
        <Column header="帳號 / 姓名" style="min-width: 210px">
          <template #body="{ data }">
            <strong>{{ data.account }}</strong>
            <span class="agent-secondary-text">{{ data.name }}</span>
          </template>
        </Column>
        <Column field="portal" header="Portal" style="min-width: 150px">
          <template #body="{ data }">
            <Tag :value="data.portal" :severity="tagSeverity(data.portal)" />
          </template>
        </Column>
        <Column header="群組" style="min-width: 210px">
          <template #body="{ data }">
            <div class="system-chip-list">
              <Tag v-for="group in data.groups" :key="group" :value="group" severity="secondary" />
            </div>
          </template>
        </Column>
        <Column field="dataScope" header="資料範圍" style="min-width: 130px">
          <template #body="{ data }">
            <Tag :value="data.dataScope" :severity="tagSeverity(data.dataScope)" />
          </template>
        </Column>
        <Column field="twoFactor" header="2FA" style="width: 110px">
          <template #body="{ data }">
            <Tag :value="data.twoFactor ? '已啟用' : '未啟用'" :severity="data.twoFactor ? 'success' : 'warn'" />
          </template>
        </Column>
        <Column field="status" header="狀態" style="width: 110px">
          <template #body="{ data }">
            <Tag :value="data.status" :severity="tagSeverity(data.status)" />
          </template>
        </Column>
        <Column field="lastLogin" header="最後登入" style="min-width: 170px" />
        <Column field="createdAt" header="建立時間" style="min-width: 170px" />
        <Column header="操作" style="width: 180px">
          <template #body="{ data }">
            <div class="table-actions">
              <Button v-tooltip.top="'檢視'" icon="pi pi-eye" text rounded severity="secondary" aria-label="檢視" @click="openDetail(data)" />
              <Button v-tooltip.top="'編輯'" icon="pi pi-pencil" text rounded severity="secondary" aria-label="編輯" @click="openEdit(data)" />
              <Button v-tooltip.top="'解鎖'" icon="pi pi-lock-open" text rounded severity="secondary" aria-label="解鎖" :disabled="data.status !== '鎖定'" @click="openUnlock(data)" />
              <Button v-tooltip.top="'停用'" icon="pi pi-ban" text rounded severity="danger" aria-label="停用" :disabled="data.status === '停用'" @click="openDisable(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </SectionCard>

    <Dialog v-model:visible="detailVisible" modal dismissable-mask class="entity-dialog" header="管理員詳情">
      <div v-if="selectedAdmin" class="entity-dialog-body">
        <section class="dialog-section">
          <h3>帳號摘要</h3>
          <div class="detail-grid dialog-detail-grid">
            <div><span>編號</span><strong>{{ selectedAdmin.id }}</strong></div>
            <div><span>帳號</span><strong>{{ selectedAdmin.account }}</strong></div>
            <div><span>姓名</span><strong>{{ selectedAdmin.name }}</strong></div>
            <div><span>Email</span><SensitiveValue :value="selectedAdmin.email" /></div>
            <div><span>Portal</span><Tag :value="selectedAdmin.portal" :severity="tagSeverity(selectedAdmin.portal)" /></div>
            <div><span>狀態</span><Tag :value="selectedAdmin.status" :severity="tagSeverity(selectedAdmin.status)" /></div>
            <div><span>2FA</span><Tag :value="selectedAdmin.twoFactor ? '已啟用' : '未啟用'" :severity="selectedAdmin.twoFactor ? 'success' : 'warn'" /></div>
            <div><span>資料範圍</span><Tag :value="selectedAdmin.dataScope" :severity="tagSeverity(selectedAdmin.dataScope)" /></div>
            <div class="detail-field-wide"><span>允許 IP</span><SensitiveValue :value="selectedAdmin.allowedIp" /></div>
            <div class="detail-field-wide"><span>內部備註</span><SensitiveValue :value="selectedAdmin.note" /></div>
          </div>
        </section>
      </div>
      <template #footer>
        <span />
        <Button label="關閉" severity="secondary" outlined @click="detailVisible = false" />
      </template>
    </Dialog>

    <Dialog v-model:visible="formVisible" modal dismissable-mask class="entity-dialog" :header="isEditing ? '編輯管理員' : '新增管理員'">
      <div class="entity-dialog-body">
        <nav class="dialog-stepper">
          <button v-for="step in formSteps" :key="step.label" class="dialog-step" :class="{ active: activeStep === step.label }" type="button" @click="activeStep = step.label">
            <i :class="step.icon" />
            <span>{{ step.label }}</span>
          </button>
        </nav>

        <section v-if="activeStep === '基本資料'" class="dialog-section">
          <h3>基本資料</h3>
          <p class="dialog-section-note">建立後台登入帳號，正式環境仍需由後端驗證帳號唯一性。</p>
          <div class="dialog-form-grid">
            <div class="field field-span-6">
              <label>登入帳號</label>
              <InputText v-model="adminForm.account" placeholder="例如 supplier.ops" fluid />
              <small>建議使用英文、數字與半形句點。</small>
            </div>
            <div class="field field-span-6">
              <label>姓名</label>
              <InputText v-model="adminForm.name" placeholder="輸入管理員姓名" fluid />
            </div>
            <div class="field field-span-6">
              <label>Email</label>
              <InputText v-model="adminForm.email" placeholder="name@example.com" fluid />
            </div>
            <div class="field field-span-6">
              <label>初始密碼</label>
              <InputText v-model="adminForm.password" type="password" :placeholder="isEditing ? '留空代表不變更' : '設定初始密碼'" fluid />
              <small>正式環境建議改為一次性邀請連結。</small>
            </div>
          </div>
        </section>

        <section v-else-if="activeStep === '帳號安全'" class="dialog-section">
          <h3>帳號安全</h3>
          <div class="dialog-form-grid">
            <div class="field field-span-4">
              <label>狀態</label>
              <Select v-model="adminForm.status" :options="statusOptions.slice(1)" fluid />
            </div>
            <div class="field field-span-4 switch-field">
              <label>啟用 2FA</label>
              <div class="dialog-control dialog-switch-control">
                <ToggleSwitch v-model="adminForm.twoFactor" />
              </div>
            </div>
            <div class="field field-span-4">
              <label>允許 IP</label>
              <InputText v-model="adminForm.allowedIp" placeholder="不限或輸入 IP / CIDR" fluid />
            </div>
            <div class="field field-span-12">
              <label>安全提醒</label>
              <div class="system-warning-strip">
                <i class="pi pi-shield" />
                <span>停用、解鎖、重設密碼與正式環境權限異動都應留下操作紀錄。</span>
              </div>
            </div>
          </div>
        </section>

        <section v-else-if="activeStep === '權限範圍'" class="dialog-section">
          <h3>權限範圍</h3>
          <p class="dialog-section-note">前端僅做 UX 控制，正式權限仍由 RBAC / ABAC / dataScope 驗證。</p>
          <div class="dialog-form-grid">
            <div class="field field-span-6">
              <label>Portal</label>
              <Select v-model="adminForm.portal" :options="formPortalOptions" fluid />
            </div>
            <div class="field field-span-6">
              <label>資料範圍</label>
              <Select v-model="adminForm.dataScope" :options="formDataScopeOptions" fluid />
            </div>
            <div class="field field-span-12">
              <label>管理員群組</label>
              <MultiSelect v-model="adminForm.groups" :options="formGroupOptions" display="chip" placeholder="選擇群組" fluid />
            </div>
          </div>
        </section>

        <section v-else class="dialog-section">
          <h3>備註</h3>
          <div class="dialog-form-grid">
            <div class="field field-span-12">
              <label>內部備註</label>
              <Textarea v-model="adminForm.note" rows="4" auto-resize placeholder="輸入內部備註或權限異動原因" fluid />
            </div>
          </div>
        </section>
      </div>
      <template #footer>
        <Button label="關閉" severity="secondary" outlined @click="formVisible = false" />
        <Button :label="isEditing ? '儲存變更' : '建立管理員'" icon="pi pi-check" @click="submitForm" />
      </template>
    </Dialog>

    <Dialog v-model:visible="disableVisible" modal dismissable-mask class="disable-agent-dialog" header="停用管理員確認">
      <div v-if="selectedAdmin" class="disable-agent-body">
        <p>管理員不可硬刪除。停用後此帳號將無法登入，但操作紀錄會完整保留。</p>
        <div class="disable-agent-summary">
          <div><span>帳號</span><strong>{{ selectedAdmin.account }}</strong></div>
          <div><span>目前狀態</span><Tag :value="selectedAdmin.status" :severity="tagSeverity(selectedAdmin.status)" /></div>
        </div>
        <div class="field">
          <label>停用原因</label>
          <Textarea v-model="disableReason" rows="3" auto-resize placeholder="請輸入停用原因" fluid />
        </div>
      </div>
      <template #footer>
        <Button label="取消" severity="secondary" outlined @click="disableVisible = false" />
        <Button label="確認停用" icon="pi pi-check" severity="danger" @click="confirmDisable" />
      </template>
    </Dialog>

    <Dialog v-model:visible="unlockVisible" modal dismissable-mask class="confirm-dialog" header="解鎖管理員確認">
      <p v-if="selectedAdmin">
        確認要解鎖 <strong>{{ selectedAdmin.account }}</strong> 嗎？此操作會寫入操作紀錄，正式環境需再次驗證操作者權限。
      </p>
      <template #footer>
        <Button label="取消" severity="secondary" outlined @click="unlockVisible = false" />
        <Button label="確認解鎖" icon="pi pi-lock-open" @click="confirmUnlock" />
      </template>
    </Dialog>
  </div>
</template>
