<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue';
import { api } from '@/services/apiClient';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import Button from 'primevue/button';
import Badge from 'primevue/badge';
import Dialog from 'primevue/dialog';
import SectionCard from '@/components/ui/SectionCard.vue';
import StatusTag from '@/components/ui/StatusTag.vue';
import DateTimeRangeField from '@/components/ui/DateTimeRangeField.vue';
import SummaryCardGrid from '@/components/ui/SummaryCardGrid.vue';
import FilterCard from '@/components/ui/FilterCard.vue';

type AssetRow = {
  id: string;
  game: string;
  type: string;
  locale: string;
  version: string;
  size: string;
  fileSize: string;
  status: string;
  relatedVersion: string;
  updatedAt: string;
  owner: string;
  palette: string;
  note: string;
};

const filters = reactive({
  keyword: '',
  game: '全部遊戲',
  type: '全部類型',
  locale: '全部語系',
  status: '全部狀態',
  updatedAt: [null, null] as [Date | null, Date | null]
});

const selectedAsset = ref<AssetRow | null>(null);
const detailVisible = ref(false);
const uploadVisible = ref(false);

const assetRows = reactive<AssetRow[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const data = await api.get<AssetRow[]>('/api/games/v2/assets');
    assetRows.splice(0, assetRows.length, ...data);
  } finally {
    loading.value = false;
  }
});


const gameOptions = computed(() => ['全部遊戲', ...Array.from(new Set(assetRows.map((row) => row.game)))]);
const typeOptions = ['全部類型', 'Icon', 'Banner', 'Loading', 'Table Skin'];
const localeOptions = ['全部語系', '繁中', '英文', '泰文', '越南文'];
const statusOptions = ['全部狀態', '已發布', '測試中', '維護中', '待審核'];

const summaryCards = computed(() => {
  const published = assetRows.filter((row) => row.status === '已發布').length;
  const review = assetRows.filter((row) => row.status === '待審核').length;
  const locales = new Set(assetRows.map((row) => row.locale)).size;

  return [
    { label: '素材總數', value: String(assetRows.length), helper: `已發布 ${published}，待審核 ${review}` },
    { label: '支援語系', value: String(locales), helper: '依目前素材資料統計' },
    { label: '關聯版本', value: String(new Set(assetRows.map((row) => row.relatedVersion)).size), helper: '素材需綁定遊戲版本' },
    { label: '上傳方式', value: '入口', helper: 'Demo 先保留上傳彈窗' }
  ];
});

function resetFilters() {
  filters.keyword = '';
  filters.game = '全部遊戲';
  filters.type = '全部類型';
  filters.locale = '全部語系';
  filters.status = '全部狀態';
  filters.updatedAt = [null, null];
}

function openDetail(row: AssetRow) {
  selectedAsset.value = row;
  detailVisible.value = true;
}
</script>

<template>
  <div class="page-stack game-assets-page">
    <SummaryCardGrid :cards="summaryCards" />

    <FilterCard title="查詢條件" description="查詢遊戲素材、語系、素材版本、狀態與更新時間。">

      <div class="asset-filter-grid">
        <div class="field asset-filter-keyword">
          <label>關鍵字</label>
          <InputText v-model="filters.keyword" placeholder="輸入素材代號或遊戲名稱" fluid />
        </div>
        <div class="field">
          <label>遊戲</label>
          <Select v-model="filters.game" :options="gameOptions" fluid />
        </div>
        <div class="field">
          <label>素材類型</label>
          <Select v-model="filters.type" :options="typeOptions" fluid />
        </div>
        <div class="field">
          <label>語系</label>
          <Select v-model="filters.locale" :options="localeOptions" fluid />
        </div>
        <div class="field">
          <label>狀態</label>
          <Select v-model="filters.status" :options="statusOptions" fluid />
        </div>
        <DateTimeRangeField
          class="asset-date-range"
          :model-value="filters.updatedAt"
          @update:model-value="filters.updatedAt = $event"
        />
        <div class="asset-filter-actions">
          <Button label="查詢" icon="pi pi-search" />
          <Button label="重置" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" />
        </div>
      </div>
    </FilterCard>

    <div class="agent-command-bar">
      <div>
        <span class="table-count"><Badge :value="assetRows.length" severity="info" /> 筆素材</span>
        <p>素材需綁定遊戲版本；正式素材替換需保留審核與操作紀錄。</p>
      </div>
      <div class="agent-command-actions">
        <Button label="上傳素材" icon="pi pi-upload" @click="uploadVisible = true" />
        <Button label="匯出" icon="pi pi-download" severity="secondary" outlined />
      </div>
    </div>

    <SectionCard class="merchant-table-card asset-table-card">
      <DataTable
        :value="assetRows"
        :loading="loading"
        scrollable
        paginator
        :rows="10"
        :rows-per-page-options="[5, 10, 20, 50, 100]"
        paginator-template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
        current-page-report-template="{first}-{last} / {totalRecords}"
        data-key="id"
        table-style="min-width: 1240px"
      >
        <Column field="id" header="素材代號" frozen style="width: 176px; min-width: 176px">
          <template #body="{ data }">
            <strong class="linkish" @click="openDetail(data)">{{ data.id }}</strong>
          </template>
        </Column>
        <Column header="預覽" style="width: 92px; min-width: 92px">
          <template #body="{ data }">
            <div class="asset-thumb" :class="data.palette">
              <i class="pi pi-image" />
            </div>
          </template>
        </Column>
        <Column field="game" header="遊戲" style="width: 148px; min-width: 148px">
          <template #body="{ data }">
            <strong class="agent-primary-text">{{ data.game }}</strong>
          </template>
        </Column>
        <Column field="type" header="類型" style="width: 108px; min-width: 108px" />
        <Column field="locale" header="語系" style="width: 92px; min-width: 92px" />
        <Column field="version" header="素材版本" style="width: 148px; min-width: 148px" />
        <Column field="size" header="尺寸" style="width: 120px; min-width: 120px" />
        <Column field="fileSize" header="檔案大小" style="width: 104px; min-width: 104px" />
        <Column field="status" header="狀態" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 108px; min-width: 108px">
          <template #body="{ data }">
            <StatusTag :value="data.status" />
          </template>
        </Column>
        <Column field="relatedVersion" header="關聯版本" style="width: 128px; min-width: 128px" />
        <Column field="updatedAt" header="更新時間" style="width: 168px; min-width: 168px" />
        <Column header="操作" frozen align-frozen="right" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 104px; min-width: 104px">
          <template #body="{ data }">
            <div class="row-actions">
              <Button v-tooltip.top="'查看素材'" icon="pi pi-eye" text severity="secondary" aria-label="查看素材" @click="openDetail(data)" />
              <Button v-tooltip.top="'替換素材'" icon="pi pi-upload" text severity="secondary" aria-label="替換素材" @click="uploadVisible = true" />
            </div>
          </template>
        </Column>
      </DataTable>
    </SectionCard>

    <Dialog v-model:visible="detailVisible" modal dismissable-mask header="素材詳情" class="entity-dialog">
      <div v-if="selectedAsset" class="entity-dialog-body">
        <section class="dialog-section">
          <h3>素材預覽</h3>
          <div class="asset-preview-panel" :class="selectedAsset.palette">
            <i class="pi pi-image" />
            <strong>{{ selectedAsset.type }}</strong>
            <span>{{ selectedAsset.size }}</span>
          </div>
        </section>

        <section class="dialog-section">
          <h3>素材資料</h3>
          <div class="detail-grid dialog-detail-grid">
            <div><span>素材代號</span><strong>{{ selectedAsset.id }}</strong></div>
            <div><span>遊戲</span><strong>{{ selectedAsset.game }}</strong></div>
            <div><span>類型</span><strong>{{ selectedAsset.type }}</strong></div>
            <div><span>語系</span><strong>{{ selectedAsset.locale }}</strong></div>
            <div><span>素材版本</span><strong>{{ selectedAsset.version }}</strong></div>
            <div><span>關聯版本</span><strong>{{ selectedAsset.relatedVersion }}</strong></div>
            <div><span>狀態</span><StatusTag :value="selectedAsset.status" /></div>
            <div><span>負責單位</span><strong>{{ selectedAsset.owner }}</strong></div>
            <div><span>檔案大小</span><strong>{{ selectedAsset.fileSize }}</strong></div>
            <div><span>更新時間</span><strong>{{ selectedAsset.updatedAt }}</strong></div>
            <div class="detail-field-wide"><span>備註</span><strong>{{ selectedAsset.note }}</strong></div>
          </div>
        </section>
      </div>

      <template #footer>
        <div class="dialog-footer-actions">
          <Button label="關閉" severity="secondary" outlined @click="detailVisible = false" />
          <Button label="替換素材" icon="pi pi-upload" @click="uploadVisible = true" />
        </div>
      </template>
    </Dialog>

    <Dialog v-model:visible="uploadVisible" modal dismissable-mask header="上傳素材" class="disable-agent-dialog">
      <div class="disable-dialog-body">
        <div class="disable-warning-card">
          <i class="pi pi-upload" />
          <div>
            <strong>Demo 版先保留上傳入口。</strong>
            <p>正式串接 API 後，素材替換需上傳檔案、綁定素材版本、記錄語系與審核流程。</p>
          </div>
        </div>
        <div class="dialog-form-grid">
          <div class="field field-span-6">
            <label>遊戲</label>
            <Select :options="gameOptions.filter((item) => item !== '全部遊戲')" placeholder="選擇遊戲" fluid />
          </div>
          <div class="field field-span-6">
            <label>素材類型</label>
            <Select :options="typeOptions.filter((item) => item !== '全部類型')" placeholder="選擇素材類型" fluid />
          </div>
          <div class="field field-span-6">
            <label>語系</label>
            <Select :options="localeOptions.filter((item) => item !== '全部語系')" placeholder="選擇語系" fluid />
          </div>
          <div class="field field-span-6">
            <label>關聯版本</label>
            <InputText placeholder="例如 v2.4.2" fluid />
          </div>
          <div class="field field-span-12">
            <label>上傳備註</label>
            <Textarea rows="3" placeholder="正式環境替換素材需填寫原因" fluid />
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="取消" severity="secondary" outlined @click="uploadVisible = false" />
        <Button label="建立上傳草稿" icon="pi pi-check" @click="uploadVisible = false" />
      </template>
    </Dialog>
  </div>
</template>
