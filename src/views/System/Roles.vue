<script setup lang="ts">
import { computed, reactive, ref, watch, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import Tree from 'primevue/tree';
import SectionCard from '@/components/ui/SectionCard.vue';
import SensitiveValue from '@/components/ui/SensitiveValue.vue';

type Severity = 'success' | 'info' | 'warn' | 'danger' | 'secondary';
type PermissionKey = 'menu' | 'view' | 'detail' | 'operate' | 'export' | 'sensitive' | 'approve';
type PermissionSelection = Record<string, { checked: boolean; partialChecked: boolean }>;
type RoleEditorMode = 'create' | 'edit';

interface PermissionRow {
  module: string;
  description: string;
  permissions: Record<PermissionKey, boolean>;
}

interface RoleRow {
  id: string;
  name: string;
  portal: string;
  dataScope: string;
  users: number;
  status: string;
  approvalLevel: string;
  amountLimit: number;
  updatedAt: string;
  owner: string;
  note: string;
  matrix: PermissionRow[];
}

const permissionColumns: { key: PermissionKey; label: string; helper: string }[] = [
  { key: 'menu', label: '選單', helper: '是否顯示於 Sidebar' },
  { key: 'view', label: '查看', helper: '列表與報表查看' },
  { key: 'detail', label: '詳情', helper: '物件詳情查看' },
  { key: 'operate', label: '操作', helper: '新增、編輯、停用等操作' },
  { key: 'export', label: '匯出', helper: '匯出報表或清單' },
  { key: 'sensitive', label: '敏感欄位', helper: 'API Key、RTP、分潤、IP 等' },
  { key: 'approve', label: '審核', helper: '敏感異動審核' }
];

const moduleTemplates = [
  ['代理管理', '代理資料、佣金比例、結算幣別與綁定商戶'],
  ['商戶管理', '商戶 API、錢包、遊戲可見範圍與分潤'],
  ['遊戲管理', '遊戲上下架、維護排程、限紅模板與素材'],
  ['數值設定', 'RTP、波動率、賠率表、版本與模擬結果'],
  ['獎池管理', '獎池規則、累積比例、派發與人工調整'],
  ['交易明細', '注單、交易、退款、補單與 API Trace'],
  ['風控中心', '告警、規則、案件與處理紀錄'],
  ['報表總覽', '商戶、代理、遊戲、RTP 與結算報表'],
  ['系統管理', '管理員、角色權限、審核流程與操作紀錄']
];

function makeMatrix(level: 'admin' | 'ops' | 'finance' | 'risk' | 'support') {
  return moduleTemplates.map(([module, description]) => {
    const base = {
      menu: true,
      view: true,
      detail: true,
      operate: false,
      export: false,
      sensitive: false,
      approve: false
    };

    if (level === 'admin') {
      Object.assign(base, { operate: true, export: true, sensitive: true, approve: true });
    }

    if (level === 'ops') {
      Object.assign(base, {
        operate: ['代理管理', '商戶管理', '遊戲管理'].includes(module),
        export: ['代理管理', '商戶管理', '報表總覽'].includes(module),
        sensitive: ['商戶管理', '交易明細'].includes(module)
      });
      if (['數值設定', '系統管理'].includes(module)) Object.assign(base, { operate: false, approve: false, sensitive: false });
    }

    if (level === 'finance') {
      Object.assign(base, {
        menu: ['代理管理', '商戶管理', '交易明細', '報表總覽', '系統管理'].includes(module),
        view: ['代理管理', '商戶管理', '交易明細', '報表總覽', '系統管理'].includes(module),
        detail: ['代理管理', '商戶管理', '交易明細', '報表總覽'].includes(module),
        operate: module === '報表總覽',
        export: ['交易明細', '報表總覽'].includes(module),
        sensitive: ['代理管理', '商戶管理', '報表總覽'].includes(module),
        approve: ['報表總覽', '交易明細'].includes(module)
      });
    }

    if (level === 'risk') {
      Object.assign(base, {
        menu: ['交易明細', '風控中心', '報表總覽'].includes(module),
        view: ['交易明細', '風控中心', '報表總覽'].includes(module),
        detail: ['交易明細', '風控中心'].includes(module),
        operate: module === '風控中心',
        export: false,
        sensitive: ['交易明細', '風控中心'].includes(module),
        approve: module === '風控中心'
      });
    }

    if (level === 'support') {
      Object.assign(base, {
        menu: ['商戶管理', '交易明細', '風控中心'].includes(module),
        view: ['商戶管理', '交易明細', '風控中心'].includes(module),
        detail: ['商戶管理', '交易明細'].includes(module),
        operate: false,
        export: false,
        sensitive: false,
        approve: false
      });
    }

    return { module, description, permissions: base };
  });
}

const roles = ref<RoleRow[]>([]);
const loading = ref(true);

const filters = reactive({
  keyword: '',
  portal: '全部 Portal',
  status: '全部狀態',
  dataScope: '全部範圍'
});

const portalOptions = ['全部 Portal', 'Supplier Portal', 'Agent Portal', 'Merchant Portal'];
const statusOptions = ['全部狀態', '啟用', '停用', '待審核'];
const dataScopeOptions = ['全部範圍', '全部資料', '指定代理', '指定商戶', '僅本人'];
const roleTemplateOptions = ['空白權限', '複製目前角色', '營運主管', '財務主管', '風控人員', '客服人員'];
const selectedRole = ref<RoleRow | null>(null);
const permissionSelectionKeys = ref<PermissionSelection>({});
const expandedPermissionKeys = ref<Record<string, boolean>>({});
const roleEditorMode = ref<RoleEditorMode>('edit');
const detailVisible = ref(false);
const editVisible = ref(false);
const reviewVisible = ref(false);
const roleForm = reactive({
  name: '',
  owner: '',
  portal: 'Supplier Portal',
  dataScope: '全部資料',
  status: '啟用',
  approvalLevel: '一審',
  amountLimit: 0,
  template: '複製目前角色',
  note: ''
});

onMounted(async () => {
  try {
    const res = await fetch('/api/system/v2/roles');
    roles.value = await res.json();
    if (roles.value.length) selectedRole.value = roles.value[0];
  } finally {
    loading.value = false;
  }
});

const filteredRoles = computed(() => roles.value.filter((role) => {
  const keyword = filters.keyword.trim().toLowerCase();
  const matchKeyword = !keyword || [role.id, role.name, role.owner].some((value) => value.toLowerCase().includes(keyword));
  const matchPortal = filters.portal === '全部 Portal' || role.portal === filters.portal;
  const matchStatus = filters.status === '全部狀態' || role.status === filters.status;
  const matchScope = filters.dataScope === '全部範圍' || role.dataScope === filters.dataScope;
  return matchKeyword && matchPortal && matchStatus && matchScope;
}));

const selectedStats = computed(() => {
  if (!selectedRole.value) {
    return [
      { label: '角色使用者', value: '0', helper: '-', icon: 'pi pi-users', severity: 'info' as Severity },
      { label: '可見模組', value: '0', helper: '共 0 個模組', icon: 'pi pi-list', severity: 'success' as Severity },
      { label: '敏感欄位', value: '0', helper: '需欄位級授權', icon: 'pi pi-eye', severity: 'secondary' as Severity },
      { label: '審核權限', value: '0', helper: '匯出 0 個模組', icon: 'pi pi-check-circle', severity: 'secondary' as Severity }
    ];
  }
  const matrix = selectedRole.value.matrix;
  const modules = matrix.length;
  const sensitive = matrix.filter((row) => row.permissions.sensitive).length;
  const approvals = matrix.filter((row) => row.permissions.approve).length;
  const exports = matrix.filter((row) => row.permissions.export).length;
  return [
    { label: '角色使用者', value: String(selectedRole.value.users), helper: selectedRole.value.portal, icon: 'pi pi-users', severity: 'info' as Severity },
    { label: '可見模組', value: String(matrix.filter((row) => row.permissions.menu).length), helper: `共 ${modules} 個模組`, icon: 'pi pi-list', severity: 'success' as Severity },
    { label: '敏感欄位', value: String(sensitive), helper: '需欄位級授權', icon: 'pi pi-eye', severity: sensitive > 0 ? 'warn' as Severity : 'secondary' as Severity },
    { label: '審核權限', value: String(approvals), helper: `匯出 ${exports} 個模組`, icon: 'pi pi-check-circle', severity: approvals > 0 ? 'danger' as Severity : 'secondary' as Severity }
  ];
});

const permissionTreeNodes = computed(() => {
  if (!selectedRole.value) return [];
  return selectedRole.value.matrix.map((row) => ({
    key: moduleNodeKey(row),
    label: row.module,
    icon: 'pi pi-folder',
    data: {
      type: 'module',
      description: row.description
    },
    children: permissionColumns.map((column) => ({
      key: permissionNodeKey(row, column.key),
      label: column.label,
      icon: column.key === 'sensitive' || column.key === 'approve' ? 'pi pi-shield' : 'pi pi-check-circle',
      data: {
        type: 'permission',
        module: row.module,
        permission: column.label,
        description: column.helper,
        key: column.key
      }
    }))
  }));
});

const grantedPermissions = computed(() => {
  if (!selectedRole.value) return [];
  return selectedRole.value.matrix.flatMap((row) => (
    permissionColumns
      .filter((column) => row.permissions[column.key])
      .map((column) => ({
        id: `${row.module}-${column.key}`,
        module: row.module,
        permission: column.label,
        description: column.helper,
        scope: row.description,
        sensitive: column.key === 'sensitive' || column.key === 'approve'
      }))
  ));
});

const roleDialogTitle = computed(() => (roleEditorMode.value === 'create' ? '新增權限群組' : '編輯角色'));
const roleDialogSubmitLabel = computed(() => (roleEditorMode.value === 'create' ? '建立並調整權限' : '儲存變更'));

watch(selectedRole, () => {
  hydratePermissionTree();
}, { immediate: true });

watch(permissionSelectionKeys, () => {
  syncPermissionTreeToMatrix();
}, { deep: true });

function selectRole(role: RoleRow) {
  selectedRole.value = role;
}

function openDetail(role: RoleRow) {
  selectedRole.value = role;
  detailVisible.value = true;
}

function openCreate() {
  roleEditorMode.value = 'create';
  Object.assign(roleForm, {
    name: '',
    owner: 'Security Admin',
    portal: 'Supplier Portal',
    dataScope: '全部資料',
    status: '待審核',
    approvalLevel: '一審',
    amountLimit: 0,
    template: '複製目前角色',
    note: ''
  });
  editVisible.value = true;
}

function openEdit(role: RoleRow) {
  roleEditorMode.value = 'edit';
  selectedRole.value = role;
  Object.assign(roleForm, {
    name: role.name,
    owner: role.owner,
    portal: role.portal,
    dataScope: role.dataScope,
    status: role.status,
    approvalLevel: role.approvalLevel,
    amountLimit: role.amountLimit,
    template: '複製目前角色',
    note: role.note
  });
  editVisible.value = true;
}

function saveRole() {
  if (roleEditorMode.value === 'create') {
    const newRole: RoleRow = {
      id: nextRoleId(),
      name: roleForm.name.trim() || '未命名權限群組',
      portal: roleForm.portal,
      dataScope: roleForm.dataScope,
      users: 0,
      status: roleForm.status,
      approvalLevel: roleForm.approvalLevel,
      amountLimit: roleForm.amountLimit,
      updatedAt: '2026-05-22 11:45:00',
      owner: roleForm.owner.trim() || 'Security Admin',
      note: roleForm.note || '自訂權限群組，建立後需完成權限樹設定並送審。',
      matrix: makeTemplateMatrix(roleForm.template)
    };
    roles.value.unshift(newRole);
    selectedRole.value = newRole;
    editVisible.value = false;
    return;
  }

  if (!selectedRole.value) {
    editVisible.value = false;
    return;
  }

  Object.assign(selectedRole.value, {
    name: roleForm.name,
    owner: roleForm.owner,
    portal: roleForm.portal,
    dataScope: roleForm.dataScope,
    status: roleForm.status,
    approvalLevel: roleForm.approvalLevel,
    amountLimit: roleForm.amountLimit,
    note: roleForm.note,
    updatedAt: '2026-05-22 11:20:00'
  });
  editVisible.value = false;
}

function resetFilters() {
  filters.keyword = '';
  filters.portal = '全部 Portal';
  filters.status = '全部狀態';
  filters.dataScope = '全部範圍';
}

function moduleNodeKey(row: PermissionRow) {
  return `module:${row.module}`;
}

function permissionNodeKey(row: PermissionRow, key: PermissionKey) {
  return `permission:${row.module}:${key}`;
}

function cloneMatrix(matrix: PermissionRow[]) {
  return matrix.map((row) => ({
    module: row.module,
    description: row.description,
    permissions: { ...row.permissions }
  }));
}

function makeEmptyMatrix() {
  return moduleTemplates.map(([module, description]) => ({
    module,
    description,
    permissions: {
      menu: false,
      view: false,
      detail: false,
      operate: false,
      export: false,
      sensitive: false,
      approve: false
    }
  }));
}

function makeTemplateMatrix(template: string) {
  if (template === '空白權限') return makeEmptyMatrix();
  if (template === '營運主管') return makeMatrix('ops');
  if (template === '財務主管') return makeMatrix('finance');
  if (template === '風控人員') return makeMatrix('risk');
  if (template === '客服人員') return makeMatrix('support');
  return selectedRole.value ? cloneMatrix(selectedRole.value.matrix) : makeEmptyMatrix();
}

function nextRoleId() {
  const next = roles.value.length + 1;
  return `ROLE-CUSTOM-${String(next).padStart(2, '0')}`;
}

function hydratePermissionTree() {
  const selection: PermissionSelection = {};
  const expanded: Record<string, boolean> = {};

  if (!selectedRole.value) {
    permissionSelectionKeys.value = selection;
    expandedPermissionKeys.value = expanded;
    return;
  }

  selectedRole.value.matrix.forEach((row) => {
    const moduleKey = moduleNodeKey(row);
    expanded[moduleKey] = true;
    let checkedCount = 0;

    permissionColumns.forEach((column) => {
      if (row.permissions[column.key]) {
        selection[permissionNodeKey(row, column.key)] = { checked: true, partialChecked: false };
        checkedCount += 1;
      }
    });

    if (checkedCount === permissionColumns.length) {
      selection[moduleKey] = { checked: true, partialChecked: false };
    } else if (checkedCount > 0) {
      selection[moduleKey] = { checked: false, partialChecked: true };
    }
  });

  permissionSelectionKeys.value = selection;
  expandedPermissionKeys.value = expanded;
}

function syncPermissionTreeToMatrix() {
  if (!selectedRole.value) return;
  selectedRole.value.matrix.forEach((row) => {
    permissionColumns.forEach((column) => {
      row.permissions[column.key] = Boolean(permissionSelectionKeys.value[permissionNodeKey(row, column.key)]?.checked);
    });
  });
}

function tagSeverity(value: string): Severity {
  if (['啟用', '全部資料', 'Supplier Portal'].includes(value)) return 'success';
  if (['待審核', '指定代理', '指定商戶', '一審'].includes(value)) return 'warn';
  if (['停用', '二審'].includes(value)) return 'danger';
  if (value.includes('Portal')) return 'info';
  return 'secondary';
}

function formatLimit(value: number) {
  if (!value) return '不限額';
  return `USDT ${value.toLocaleString('en-US')}`;
}
</script>

<template>
  <div class="page-stack reports-page system-roles-page">
    <section class="summary-grid">
      <article v-for="item in selectedStats" :key="item.label" class="agent-summary-card">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <small>{{ item.helper }}</small>
      </article>
    </section>

    <SectionCard class="merchant-filter-card">
      <template #header>
        <div class="dialog-title-block">
          <h2>查詢條件</h2>
          <p>查詢角色、Portal、資料範圍與啟用狀態。</p>
        </div>
      </template>

      <div class="trade-filter-grid">
        <div class="field trade-filter-keyword">
          <label>關鍵字</label>
          <InputText v-model="filters.keyword" placeholder="輸入角色代號、名稱或負責人" fluid />
        </div>
        <div class="field">
          <label>Portal</label>
          <Select v-model="filters.portal" :options="portalOptions" fluid />
        </div>
        <div class="field">
          <label>資料範圍</label>
          <Select v-model="filters.dataScope" :options="dataScopeOptions" fluid />
        </div>
        <div class="field">
          <label>狀態</label>
          <Select v-model="filters.status" :options="statusOptions" fluid />
        </div>
        <div class="trade-filter-actions system-role-filter-actions">
          <Button label="查詢" icon="pi pi-search" />
          <Button label="重置" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" />
        </div>
      </div>
    </SectionCard>

    <div class="system-role-layout">
      <SectionCard class="merchant-table-card system-role-list-card">
        <template #header>
          <div class="dialog-title-block">
            <h2>角色清單</h2>
            <p>選取角色後可用權限樹調整該職位可見模組與操作權限。</p>
          </div>
          <Button label="新增權限群組" icon="pi pi-plus" @click="openCreate" />
        </template>

        <DataTable :value="filteredRoles" :loading="loading" data-key="id" selection-mode="single" :selection="selectedRole" scrollable table-style="min-width: 700px" @row-click="selectRole($event.data)">
          <Column field="id" header="角色代號" style="min-width: 118px">
            <template #body="{ data }">
              <strong class="agent-code">{{ data.id }}</strong>
            </template>
          </Column>
          <Column header="角色名稱" style="min-width: 150px">
            <template #body="{ data }">
              <strong>{{ data.name }}</strong>
              <span class="agent-secondary-text">{{ data.owner }}</span>
            </template>
          </Column>
          <Column field="portal" header="Portal" style="min-width: 132px">
            <template #body="{ data }"><Tag :value="data.portal" :severity="tagSeverity(data.portal)" /></template>
          </Column>
          <Column field="dataScope" header="資料範圍" style="min-width: 110px">
            <template #body="{ data }"><Tag :value="data.dataScope" :severity="tagSeverity(data.dataScope)" /></template>
          </Column>
          <Column field="status" header="狀態" style="width: 100px">
            <template #body="{ data }"><Tag :value="data.status" :severity="tagSeverity(data.status)" /></template>
          </Column>
          <Column header="操作" style="width: 110px">
            <template #body="{ data }">
              <div class="table-actions">
                <Button v-tooltip.top="'檢視'" icon="pi pi-eye" text rounded severity="secondary" aria-label="檢視" @click.stop="openDetail(data)" />
                <Button v-tooltip.top="'編輯'" icon="pi pi-pencil" text rounded severity="secondary" aria-label="編輯" @click.stop="openEdit(data)" />
              </div>
            </template>
          </Column>
        </DataTable>
      </SectionCard>

      <SectionCard class="system-role-policy-card">
        <template #header>
          <div class="dialog-title-block">
            <h2>{{ selectedRole ? selectedRole.name : '—' }} 權限摘要</h2>
            <p>審核層級、金額上限與資料範圍需由後端二次驗證。</p>
          </div>
          <div class="section-inline-actions">
            <Button label="送出審核" icon="pi pi-send" severity="secondary" outlined @click="reviewVisible = true" />
            <Button label="編輯角色" icon="pi pi-pencil" :disabled="!selectedRole" @click="selectedRole && openEdit(selectedRole)" />
          </div>
        </template>

        <div v-if="selectedRole" class="system-role-meta-grid">
          <div><span>角色代號</span><strong>{{ selectedRole.id }}</strong></div>
          <div><span>Portal</span><Tag :value="selectedRole.portal" :severity="tagSeverity(selectedRole.portal)" /></div>
          <div><span>資料範圍</span><Tag :value="selectedRole.dataScope" :severity="tagSeverity(selectedRole.dataScope)" /></div>
          <div><span>審核層級</span><Tag :value="selectedRole.approvalLevel" :severity="tagSeverity(selectedRole.approvalLevel)" /></div>
          <div><span>審核金額上限</span><SensitiveValue :value="formatLimit(selectedRole.amountLimit)" /></div>
          <div><span>最近更新</span><strong>{{ selectedRole.updatedAt }}</strong></div>
        </div>
      </SectionCard>
    </div>

    <SectionCard class="merchant-table-card">
      <template #header>
        <div class="dialog-title-block">
          <h2>權限樹與授權列表</h2>
          <p>使用權限樹管理模組與動作，下方列表即時呈現已授權項目。</p>
        </div>
      </template>

      <div class="permission-tree-layout">
        <div class="permission-tree-panel">
          <Tree
            v-model:selectionKeys="permissionSelectionKeys"
            v-model:expandedKeys="expandedPermissionKeys"
            :value="permissionTreeNodes"
            selection-mode="checkbox"
            filter
            filter-mode="lenient"
            class="permission-tree"
            aria-label="角色權限樹"
          >
            <template #default="{ node }">
              <div class="permission-tree-node">
                <strong>{{ node.label }}</strong>
                <small>{{ node.data?.description }}</small>
              </div>
            </template>
          </Tree>
        </div>

        <div class="permission-granted-panel">
          <div class="permission-granted-head">
            <div>
              <h3>已授權項目</h3>
              <p>依目前權限樹勾選結果即時整理。</p>
            </div>
            <Tag :value="`${grantedPermissions.length} 項`" severity="info" />
          </div>

          <DataTable :value="grantedPermissions" paginator :rows="8" :rows-per-page-options="[8, 16, 32]" scrollable table-style="min-width: 680px">
            <Column field="module" header="模組" style="min-width: 150px" />
            <Column field="permission" header="權限" style="min-width: 110px">
              <template #body="{ data }">
                <Tag :value="data.permission" :severity="data.sensitive ? 'warn' : 'success'" />
              </template>
            </Column>
            <Column field="description" header="說明" style="min-width: 190px" />
            <Column field="scope" header="資料範圍" style="min-width: 220px">
              <template #body="{ data }">
                <span class="agent-secondary-text">{{ data.scope }}</span>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </SectionCard>

    <Dialog v-model:visible="detailVisible" modal dismissable-mask class="entity-dialog" header="角色權限詳情">
      <div v-if="selectedRole" class="entity-dialog-body">
        <section class="dialog-section">
          <h3>{{ selectedRole.name }}</h3>
          <div class="detail-grid dialog-detail-grid">
            <div><span>角色代號</span><strong>{{ selectedRole.id }}</strong></div>
            <div><span>Portal</span><Tag :value="selectedRole.portal" :severity="tagSeverity(selectedRole.portal)" /></div>
            <div><span>資料範圍</span><Tag :value="selectedRole.dataScope" :severity="tagSeverity(selectedRole.dataScope)" /></div>
            <div><span>狀態</span><Tag :value="selectedRole.status" :severity="tagSeverity(selectedRole.status)" /></div>
            <div><span>審核層級</span><Tag :value="selectedRole.approvalLevel" :severity="tagSeverity(selectedRole.approvalLevel)" /></div>
            <div><span>審核金額上限</span><SensitiveValue :value="formatLimit(selectedRole.amountLimit)" /></div>
            <div><span>使用者數</span><strong>{{ selectedRole.users }}</strong></div>
            <div><span>負責人</span><strong>{{ selectedRole.owner }}</strong></div>
            <div class="detail-field-wide"><span>內部備註</span><SensitiveValue :value="selectedRole.note" /></div>
          </div>
        </section>
      </div>
      <template #footer>
        <span />
        <Button label="關閉" severity="secondary" outlined @click="detailVisible = false" />
      </template>
    </Dialog>

    <Dialog v-model:visible="editVisible" modal dismissable-mask class="entity-dialog" :header="roleDialogTitle">
      <div class="entity-dialog-body">
        <section class="dialog-section">
          <h3>權限群組設定</h3>
          <p class="dialog-section-note">
            {{ roleEditorMode === 'create' ? '先建立職位權限群組，再於權限樹逐項調整模組與操作權限。' : '修改資料範圍、敏感欄位與審核權限時，正式環境需送審。' }}
          </p>
          <div class="dialog-form-grid">
            <div class="field field-span-6">
              <label>權限群組 / 職位名稱</label>
              <InputText v-model="roleForm.name" placeholder="例如：商戶營運主管、代理財務審核" fluid />
            </div>
            <div class="field field-span-6">
              <label>負責人</label>
              <InputText v-model="roleForm.owner" placeholder="輸入維護此權限群組的人員" fluid />
            </div>
            <div class="field field-span-6">
              <label>Portal</label>
              <Select v-model="roleForm.portal" :options="portalOptions.slice(1)" fluid />
            </div>
            <div class="field field-span-6" v-if="roleEditorMode === 'create'">
              <label>初始權限模板</label>
              <Select v-model="roleForm.template" :options="roleTemplateOptions" fluid />
            </div>
            <div class="field field-span-4">
              <label>資料範圍</label>
              <Select v-model="roleForm.dataScope" :options="dataScopeOptions.slice(1)" fluid />
            </div>
            <div class="field field-span-4">
              <label>狀態</label>
              <Select v-model="roleForm.status" :options="statusOptions.slice(1)" fluid />
            </div>
            <div class="field field-span-4">
              <label>審核層級</label>
              <Select v-model="roleForm.approvalLevel" :options="['無', '一審', '二審']" fluid />
            </div>
            <div class="field field-span-6">
              <label>審核金額上限</label>
              <InputNumber v-model="roleForm.amountLimit" mode="decimal" :min="0" :max-fraction-digits="0" fluid />
            </div>
            <div class="field field-span-12">
              <label>內部備註</label>
              <Textarea v-model="roleForm.note" rows="4" auto-resize fluid />
            </div>
          </div>
        </section>
      </div>
      <template #footer>
        <Button label="取消" severity="secondary" outlined @click="editVisible = false" />
        <Button :label="roleDialogSubmitLabel" icon="pi pi-check" @click="saveRole" />
      </template>
    </Dialog>

    <Dialog v-model:visible="reviewVisible" modal dismissable-mask class="confirm-dialog" header="送出權限審核">
      <p>
        角色權限異動會影響選單、資料範圍、敏感欄位與審核行為。正式環境需建立審核單並記錄修改前後差異。
      </p>
      <template #footer>
        <Button label="取消" severity="secondary" outlined @click="reviewVisible = false" />
        <Button label="送出審核" icon="pi pi-send" severity="danger" @click="reviewVisible = false" />
      </template>
    </Dialog>
  </div>
</template>
