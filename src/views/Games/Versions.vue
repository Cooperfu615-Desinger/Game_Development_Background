<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Button from 'primevue/button';
import Badge from 'primevue/badge';
import Dialog from 'primevue/dialog';
import SectionCard from '@/components/ui/SectionCard.vue';
import StatusTag from '@/components/ui/StatusTag.vue';
import DateTimeRangeField from '@/components/ui/DateTimeRangeField.vue';
import SensitiveValue from '@/components/ui/SensitiveValue.vue';
import { expandDemoRows } from '@/utils/demoRows';

type VersionRow = {
  id: string;
  game: string;
  version: string;
  assetVersion: string;
  status: string;
  releaseType: string;
  releaseAt: string;
  scope: string;
  affectedMerchants: number;
  rollbackTarget: string;
  owner: string;
  summary: string;
  changeLog: string[];
};

const filters = reactive({
  keyword: '',
  game: '全部遊戲',
  status: '全部狀態',
  releaseType: '全部類型',
  releasedAt: [null, null] as [Date | null, Date | null]
});

const selectedVersion = ref<VersionRow | null>(null);
const detailVisible = ref(false);

const versionRows = reactive<VersionRow[]>(expandDemoRows([
  {
    id: 'REL-20260520-001',
    game: 'Fortune Tiger',
    version: 'v2.4.1',
    assetVersion: 'asset-2026.05',
    status: '已發布',
    releaseType: '正式發布',
    releaseAt: '2026-05-20 03:30:00',
    scope: '全部正式商戶',
    affectedMerchants: 18,
    rollbackTarget: 'v2.4.0',
    owner: 'Game Tech',
    summary: '優化載入速度與錢包回呼容錯。',
    changeLog: ['修正 H5 首次載入偶發白屏', '補強錢包回呼逾時重試', '更新繁中與英文素材']
  },
  {
    id: 'REL-20260518-002',
    game: 'Royal Spin',
    version: 'v1.9.8',
    assetVersion: 'asset-2026.04',
    status: '維護中',
    releaseType: '修補發布',
    releaseAt: '2026-05-18 02:00:00',
    scope: '指定商戶',
    affectedMerchants: 12,
    rollbackTarget: 'v1.9.7',
    owner: 'Platform Team',
    summary: '修補錢包回調壓測問題，目前仍在維護排程內。',
    changeLog: ['調整交易重送節流', '補上維護公告文案', '更新 TWD 幣別素材']
  },
  {
    id: 'REL-20260516-003',
    game: 'Baccarat Pro',
    version: 'v3.1.0-beta',
    assetVersion: 'asset-2026.05-beta',
    status: '測試中',
    releaseType: '測試發布',
    releaseAt: '2026-05-16 15:20:00',
    scope: '測試商戶',
    affectedMerchants: 5,
    rollbackTarget: 'v3.0.9',
    owner: 'Table Game Team',
    summary: '新版桌台流程進入 QA 驗收。',
    changeLog: ['新增桌台狀態同步', '調整 Web 版路由', '補泰文素材']
  },
  {
    id: 'REL-20260512-004',
    game: 'Crash Rocket',
    version: 'v0.8.3',
    assetVersion: 'asset-2026.05-dev',
    status: '待審核',
    releaseType: '預發布',
    releaseAt: '2026-05-12 18:45:00',
    scope: '內部測試',
    affectedMerchants: 0,
    rollbackTarget: '-',
    owner: 'Game Lab',
    summary: '等待版本審核與數值驗收後才可進入測試商戶。',
    changeLog: ['新增倍率動畫', '調整 Web/H5 共用入口', '補越南文素材']
  }
], 60));

const gameOptions = computed(() => ['全部遊戲', ...Array.from(new Set(versionRows.map((row) => row.game)))]);
const statusOptions = ['全部狀態', '已發布', '測試中', '維護中', '待審核', '已回滾'];
const releaseTypeOptions = ['全部類型', '正式發布', '修補發布', '測試發布', '預發布'];

const summaryCards = computed(() => {
  const released = versionRows.filter((row) => row.status === '已發布').length;
  const review = versionRows.filter((row) => row.status === '待審核').length;
  const merchants = versionRows.reduce((sum, row) => sum + row.affectedMerchants, 0);

  return [
    { label: '版本紀錄', value: String(versionRows.length), helper: `已發布 ${released}，待審核 ${review}` },
    { label: '影響商戶', value: String(merchants), helper: '依目前版本紀錄加總' },
    { label: '回滾基準', value: '保留', helper: '每次發布需保留上一版目標' },
    { label: '數值調整', value: '分離', helper: 'RTP 與數值請至數值設定' }
  ];
});

function resetFilters() {
  filters.keyword = '';
  filters.game = '全部遊戲';
  filters.status = '全部狀態';
  filters.releaseType = '全部類型';
  filters.releasedAt = [null, null];
}

function openDetail(row: VersionRow) {
  selectedVersion.value = row;
  detailVisible.value = true;
}
</script>

<template>
  <div class="page-stack game-versions-page">
    <div class="agent-summary-grid">
      <article v-for="item in summaryCards" :key="item.label" class="agent-summary-card">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <small>{{ item.helper }}</small>
      </article>
    </div>

    <SectionCard class="merchant-filter-card">
      <template #header>
        <div class="dialog-title-block">
          <h2>查詢條件</h2>
          <p>查詢遊戲版本、發布狀態、發布類型與影響範圍。</p>
        </div>
      </template>

      <div class="version-filter-grid">
        <div class="field version-filter-keyword">
          <label>關鍵字</label>
          <InputText v-model="filters.keyword" placeholder="輸入版本號、遊戲或發布單號" fluid />
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
          <label>發布類型</label>
          <Select v-model="filters.releaseType" :options="releaseTypeOptions" fluid />
        </div>
        <DateTimeRangeField
          class="version-date-range"
          :model-value="filters.releasedAt"
          @update:model-value="filters.releasedAt = $event"
        />
        <div class="version-filter-actions">
          <Button label="查詢" icon="pi pi-search" />
          <Button label="重置" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" />
        </div>
      </div>
    </SectionCard>

    <div class="agent-command-bar">
      <div>
        <span class="table-count"><Badge :value="versionRows.length" severity="info" /> 筆版本</span>
        <p>版本頁只記錄發布與回滾；RTP、波動率與賠率表請在數值設定管理。</p>
      </div>
      <div class="agent-command-actions">
        <Button label="新增發布紀錄" icon="pi pi-plus" />
        <Button label="匯出" icon="pi pi-download" severity="secondary" outlined />
      </div>
    </div>

    <SectionCard class="merchant-table-card version-table-card">
      <DataTable
        :value="versionRows"
        scrollable
        paginator
        :rows="10"
        :rows-per-page-options="[5, 10, 20, 50, 100]"
        paginator-template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
        current-page-report-template="{first}-{last} / {totalRecords}"
        data-key="id"
        table-style="min-width: 1280px"
      >
        <Column field="id" header="發布單號" frozen style="width: 164px; min-width: 164px">
          <template #body="{ data }">
            <strong class="linkish" @click="openDetail(data)">{{ data.id }}</strong>
          </template>
        </Column>
        <Column field="game" header="遊戲" style="width: 148px; min-width: 148px">
          <template #body="{ data }">
            <strong class="agent-primary-text">{{ data.game }}</strong>
          </template>
        </Column>
        <Column field="version" header="程式版本" style="width: 116px; min-width: 116px" />
        <Column field="assetVersion" header="素材版本" style="width: 148px; min-width: 148px" />
        <Column field="status" header="狀態" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 112px; min-width: 112px">
          <template #body="{ data }">
            <StatusTag :value="data.status" />
          </template>
        </Column>
        <Column field="releaseType" header="發布類型" style="width: 120px; min-width: 120px" />
        <Column field="releaseAt" header="發布時間" style="width: 172px; min-width: 172px" />
        <Column field="scope" header="影響範圍" style="width: 136px; min-width: 136px" />
        <Column field="affectedMerchants" header="影響商戶" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 104px; min-width: 104px" />
        <Column field="rollbackTarget" header="回滾目標" style="width: 116px; min-width: 116px" />
        <Column header="操作" frozen align-frozen="right" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 104px; min-width: 104px">
          <template #body="{ data }">
            <div class="row-actions">
              <Button v-tooltip.top="'查看版本'" icon="pi pi-eye" text severity="secondary" aria-label="查看版本" @click="openDetail(data)" />
              <Button v-tooltip.top="'建立回滾申請'" icon="pi pi-undo" text severity="secondary" aria-label="建立回滾申請" />
            </div>
          </template>
        </Column>
      </DataTable>
    </SectionCard>

    <Dialog v-model:visible="detailVisible" modal dismissable-mask header="版本詳情" class="entity-dialog">
      <div v-if="selectedVersion" class="entity-dialog-body">
        <section class="dialog-section">
          <h3>發布摘要</h3>
          <div class="detail-grid dialog-detail-grid">
            <div><span>發布單號</span><strong>{{ selectedVersion.id }}</strong></div>
            <div><span>遊戲</span><strong>{{ selectedVersion.game }}</strong></div>
            <div><span>程式版本</span><strong>{{ selectedVersion.version }}</strong></div>
            <div><span>素材版本</span><strong>{{ selectedVersion.assetVersion }}</strong></div>
            <div><span>狀態</span><StatusTag :value="selectedVersion.status" /></div>
            <div><span>發布類型</span><strong>{{ selectedVersion.releaseType }}</strong></div>
            <div><span>發布時間</span><strong>{{ selectedVersion.releaseAt }}</strong></div>
            <div><span>回滾目標</span><SensitiveValue :value="selectedVersion.rollbackTarget" /></div>
          </div>
        </section>

        <section class="dialog-section">
          <h3>更新內容</h3>
          <p class="dialog-section-note">{{ selectedVersion.summary }}</p>
          <ul class="version-change-list">
            <li v-for="item in selectedVersion.changeLog" :key="item">{{ item }}</li>
          </ul>
        </section>

        <section class="dialog-section">
          <h3>影響範圍</h3>
          <div class="detail-grid dialog-detail-grid">
            <div><span>範圍</span><strong>{{ selectedVersion.scope }}</strong></div>
            <div><span>影響商戶</span><strong>{{ selectedVersion.affectedMerchants }}</strong></div>
            <div><span>負責單位</span><strong>{{ selectedVersion.owner }}</strong></div>
            <div><span>數值設定</span><strong>未在此頁調整</strong></div>
          </div>
        </section>
      </div>

      <template #footer>
        <div class="dialog-footer-actions">
          <Button label="關閉" severity="secondary" outlined @click="detailVisible = false" />
          <Button label="建立回滾申請" icon="pi pi-undo" severity="warn" />
        </div>
      </template>
    </Dialog>
  </div>
</template>
