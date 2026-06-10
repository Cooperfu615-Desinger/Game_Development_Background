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
import Badge from 'primevue/badge';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import SectionCard from '@/components/ui/SectionCard.vue';
import StatusTag from '@/components/ui/StatusTag.vue';
import DateTimeRangeField from '@/components/ui/DateTimeRangeField.vue';
import SensitiveValue from '@/components/ui/SensitiveValue.vue';
import SummaryCardGrid from '@/components/ui/SummaryCardGrid.vue';
import FilterCard from '@/components/ui/FilterCard.vue';

type AccessRow = {
  id: string;
  merchant: string;
  agent: string;
  game: string;
  gameType: string;
  environment: string;
  enabled: boolean;
  status: string;
  limitTemplates: string[];
  rtpMode: string;
  launchUrl: string;
  updatedAt: string;
  pendingReview: boolean;
  note: string;
};

const filters = reactive({
  keyword: '',
  merchant: '全部商戶',
  game: '全部遊戲',
  status: '全部狀態',
  environment: '全部環境',
  updatedAt: [null, null] as [Date | null, Date | null]
});

const selectedAccess = ref<AccessRow | null>(null);
const detailVisible = ref(false);
const editVisible = ref(false);

const accessRows = reactive<AccessRow[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await fetch('/api/games/v2/merchant-access');
    const data: AccessRow[] = await res.json();
    accessRows.splice(0, accessRows.length, ...data);
  } finally {
    loading.value = false;
  }
});


const merchantOptions = computed(() => ['全部商戶', ...Array.from(new Set(accessRows.map((row) => row.merchant)))]);
const gameOptions = computed(() => ['全部遊戲', ...Array.from(new Set(accessRows.map((row) => row.game)))]);
const statusOptions = ['全部狀態', '啟用', '測試中', '維護中', '待審核', '停用'];
const environmentOptions = ['全部環境', '測試', '正式'];
const limitTemplateOptions = ['標準限額', '低風險限額', '高額限額', 'VIP 限額'];
const rtpModeOptions = ['沿用遊戲預設', '商戶專屬版本', '待審核版本'];

const summaryCards = computed(() => {
  const enabled = accessRows.filter((row) => row.enabled).length;
  const pending = accessRows.filter((row) => row.pendingReview).length;
  const production = accessRows.filter((row) => row.environment === '正式').length;

  return [
    { label: '授權筆數', value: String(accessRows.length), helper: `入口啟用 ${enabled}` },
    { label: '正式環境', value: String(production), helper: '正式異動需送審' },
    { label: '待審核', value: String(pending), helper: '限紅、RTP 或入口異動' },
    { label: '限紅模板', value: String(limitTemplateOptions.length), helper: '由遊戲設定維護，可複選' }
  ];
});

function resetFilters() {
  filters.keyword = '';
  filters.merchant = '全部商戶';
  filters.game = '全部遊戲';
  filters.status = '全部狀態';
  filters.environment = '全部環境';
  filters.updatedAt = [null, null];
}

function openDetail(row: AccessRow) {
  selectedAccess.value = row;
  detailVisible.value = true;
}

function openEdit(row: AccessRow) {
  selectedAccess.value = { ...row, limitTemplates: [...row.limitTemplates] };
  editVisible.value = true;
}
</script>

<template>
  <div class="page-stack merchant-access-page">
    <SummaryCardGrid :cards="summaryCards" />

    <FilterCard title="查詢條件" description="查詢商戶可調用遊戲、入口狀態、限紅模板與正式環境審核狀態。">

      <div class="access-filter-grid">
        <div class="field access-filter-keyword">
          <label>關鍵字</label>
          <InputText v-model="filters.keyword" placeholder="輸入商戶、遊戲或授權代號" fluid />
        </div>
        <div class="field">
          <label>商戶</label>
          <Select v-model="filters.merchant" :options="merchantOptions" fluid />
        </div>
        <div class="field">
          <label>遊戲</label>
          <Select v-model="filters.game" :options="gameOptions" fluid />
        </div>
        <div class="field">
          <label>狀態</label>
          <Select v-model="filters.status" :options="statusOptions" fluid />
        </div>
        <div class="field">
          <label>環境</label>
          <Select v-model="filters.environment" :options="environmentOptions" fluid />
        </div>
        <DateTimeRangeField
          class="access-date-range"
          :model-value="filters.updatedAt"
          @update:model-value="filters.updatedAt = $event"
        />
        <div class="access-filter-actions">
          <Button label="查詢" icon="pi pi-search" />
          <Button label="重置" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" />
        </div>
      </div>
    </FilterCard>

    <div class="agent-command-bar">
      <div>
        <span class="table-count"><Badge :value="accessRows.length" severity="info" /> 筆授權</span>
        <p>商戶遊戲開關是 Launch API 的授權來源；正式環境異動需保留審核與操作紀錄。</p>
      </div>
      <div class="agent-command-actions">
        <Button label="新增授權" icon="pi pi-plus" />
        <Button label="匯出" icon="pi pi-download" severity="secondary" outlined />
      </div>
    </div>

    <SectionCard class="merchant-table-card access-table-card">
      <DataTable
        :value="accessRows"
        :loading="loading"
        scrollable
        paginator
        :rows="10"
        :rows-per-page-options="[5, 10, 20, 50, 100]"
        paginator-template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
        current-page-report-template="{first}-{last} / {totalRecords}"
        data-key="id"
        table-style="min-width: 1280px"
      >
        <Column field="id" header="授權代號" frozen style="width: 124px; min-width: 124px">
          <template #body="{ data }">
            <strong class="linkish" @click="openDetail(data)">{{ data.id }}</strong>
          </template>
        </Column>
        <Column field="merchant" header="商戶" style="width: 152px; min-width: 152px">
          <template #body="{ data }">
            <strong class="agent-primary-text">{{ data.merchant }}</strong>
            <small class="agent-secondary-text">{{ data.agent }}</small>
          </template>
        </Column>
        <Column field="game" header="遊戲" style="width: 148px; min-width: 148px" />
        <Column field="gameType" header="類型" style="width: 92px; min-width: 92px" />
        <Column field="environment" header="環境" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 92px; min-width: 92px">
          <template #body="{ data }">
            <Tag class="agent-token" :value="data.environment" :severity="data.environment === '正式' ? 'danger' : 'info'" />
          </template>
        </Column>
        <Column field="enabled" header="入口" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 80px; min-width: 80px">
          <template #body="{ data }">
            <ToggleSwitch v-model="data.enabled" />
          </template>
        </Column>
        <Column field="status" header="狀態" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 104px; min-width: 104px">
          <template #body="{ data }">
            <StatusTag :value="data.status" />
          </template>
        </Column>
        <Column field="limitTemplates" header="限紅模板" style="width: 152px; min-width: 152px">
          <template #body="{ data }">
            <span class="merchant-token-wrap" v-tooltip.top="data.limitTemplates.join(' / ')">
              <Tag class="merchant-token merchant-token--multi" :value="data.limitTemplates.length > 1 ? `${data.limitTemplates[0]} +${data.limitTemplates.length - 1}` : data.limitTemplates[0]" severity="info" />
            </span>
          </template>
        </Column>
        <Column field="rtpMode" header="RTP 模式" style="width: 144px; min-width: 144px" />
        <Column field="pendingReview" header="審核" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 92px; min-width: 92px">
          <template #body="{ data }">
            <StatusTag :value="data.pendingReview ? '待審核' : '已完成'" />
          </template>
        </Column>
        <Column field="updatedAt" header="更新時間" style="width: 168px; min-width: 168px" />
        <Column header="操作" frozen align-frozen="right" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 112px; min-width: 112px">
          <template #body="{ data }">
            <div class="row-actions">
              <Button v-tooltip.top="'查看授權'" icon="pi pi-eye" text severity="secondary" aria-label="查看授權" @click="openDetail(data)" />
              <Button v-tooltip.top="'編輯授權'" icon="pi pi-pencil" text severity="secondary" aria-label="編輯授權" @click="openEdit(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </SectionCard>

    <Dialog v-model:visible="detailVisible" modal dismissable-mask header="商戶遊戲授權詳情" class="entity-dialog">
      <div v-if="selectedAccess" class="entity-dialog-body">
        <section class="dialog-section">
          <h3>授權摘要</h3>
          <div class="detail-grid dialog-detail-grid">
            <div><span>授權代號</span><strong>{{ selectedAccess.id }}</strong></div>
            <div><span>商戶</span><strong>{{ selectedAccess.merchant }}</strong></div>
            <div><span>所屬代理</span><strong>{{ selectedAccess.agent }}</strong></div>
            <div><span>遊戲</span><strong>{{ selectedAccess.game }}</strong></div>
            <div><span>環境</span><Tag :value="selectedAccess.environment" :severity="selectedAccess.environment === '正式' ? 'danger' : 'info'" /></div>
            <div><span>入口啟用</span><StatusTag :value="selectedAccess.enabled ? '啟用' : '停用'" /></div>
            <div><span>狀態</span><StatusTag :value="selectedAccess.status" /></div>
            <div><span>審核狀態</span><StatusTag :value="selectedAccess.pendingReview ? '待審核' : '已完成'" /></div>
          </div>
        </section>

        <section class="dialog-section">
          <h3>模板與 Launch</h3>
          <div class="detail-grid dialog-detail-grid">
            <div><span>限紅模板</span><strong>{{ selectedAccess.limitTemplates.join(', ') }}</strong></div>
            <div><span>RTP 模式</span><strong>{{ selectedAccess.rtpMode }}</strong></div>
            <div><span>更新時間</span><strong>{{ selectedAccess.updatedAt }}</strong></div>
            <div><span>Launch URL</span><SensitiveValue :value="selectedAccess.launchUrl" /></div>
            <div class="detail-field-wide"><span>備註</span><strong>{{ selectedAccess.note }}</strong></div>
          </div>
        </section>
      </div>

      <template #footer>
        <div class="dialog-footer-actions">
          <Button label="關閉" severity="secondary" outlined @click="detailVisible = false" />
          <Button label="編輯授權" icon="pi pi-pencil" @click="selectedAccess && openEdit(selectedAccess)" />
        </div>
      </template>
    </Dialog>

    <Dialog v-model:visible="editVisible" modal dismissable-mask header="編輯商戶遊戲授權" class="entity-dialog">
      <div v-if="selectedAccess" class="entity-dialog-body">
        <section class="dialog-section">
          <h3>授權設定</h3>
          <p class="dialog-section-note">正式環境修改入口、限紅模板或 RTP 模式需送審；前端僅作 Demo UX 控制。</p>
          <div class="dialog-form-grid">
            <div class="field field-span-4">
              <label>商戶</label>
              <InputText v-model="selectedAccess.merchant" disabled fluid />
            </div>
            <div class="field field-span-4">
              <label>遊戲</label>
              <InputText v-model="selectedAccess.game" disabled fluid />
            </div>
            <div class="field field-span-4">
              <label>環境</label>
              <Select v-model="selectedAccess.environment" :options="['測試', '正式']" fluid />
            </div>
            <div class="field switch-field field-span-3">
              <label>入口啟用</label>
              <div class="dialog-control dialog-switch-control">
                <ToggleSwitch v-model="selectedAccess.enabled" />
              </div>
            </div>
            <div class="field field-span-3">
              <label>狀態</label>
              <Select v-model="selectedAccess.status" :options="['啟用', '測試中', '維護中', '待審核', '停用']" fluid />
            </div>
            <div class="field field-span-3">
              <label>RTP 模式</label>
              <Select v-model="selectedAccess.rtpMode" :options="rtpModeOptions" fluid />
            </div>
            <div class="field switch-field field-span-3">
              <label>送審狀態</label>
              <div class="dialog-control dialog-switch-control">
                <ToggleSwitch v-model="selectedAccess.pendingReview" />
              </div>
            </div>
            <div class="field field-span-12">
              <label>限紅模板</label>
              <MultiSelect v-model="selectedAccess.limitTemplates" :options="limitTemplateOptions" display="chip" fluid />
            </div>
            <div class="field field-span-12">
              <label>變更原因</label>
              <Textarea v-model="selectedAccess.note" rows="3" placeholder="正式環境異動需填寫原因" fluid />
            </div>
          </div>
        </section>
      </div>

      <template #footer>
        <div class="dialog-footer-actions">
          <Button label="取消" severity="secondary" outlined @click="editVisible = false" />
          <Button label="送出變更" icon="pi pi-check" @click="editVisible = false" />
        </div>
      </template>
    </Dialog>
  </div>
</template>
