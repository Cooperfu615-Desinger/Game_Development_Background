<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Badge from 'primevue/badge';
import Dialog from 'primevue/dialog';
import SectionCard from '@/components/ui/SectionCard.vue';
import StatusTag from '@/components/ui/StatusTag.vue';
import CurrencyAmount from '@/components/ui/CurrencyAmount.vue';
import DateTimeRangeField from '@/components/ui/DateTimeRangeField.vue';
import SensitiveValue from '@/components/ui/SensitiveValue.vue';

type JackpotRow = {
  code: string;
  name: string;
  type: string;
  currency: string;
  balance: string;
  contributionRate: number;
  payoutRule: string;
  boundGames: number;
  merchants: number;
  status: string;
  reviewStatus: string;
  updatedAt: string;
  maintainer: string;
  note: string;
};

const router = useRouter();

const filters = reactive({
  keyword: '',
  status: '全部狀態',
  currency: '全部幣別',
  type: '全部類型',
  updatedAt: [null, null] as [Date | null, Date | null]
});

const selectedJackpot = ref<JackpotRow | null>(null);
const detailVisible = ref(false);
const archiveVisible = ref(false);
const archiveReason = ref('');

const jackpotRows = reactive<JackpotRow[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await fetch('/api/jackpot/v2/list');
    jackpotRows.splice(0, jackpotRows.length, ...await res.json());
  } finally {
    loading.value = false;
  }
});

const statusOptions = ['全部狀態', '啟用', '觀察中', '維護中', '停用', '已封存'];
const currencyOptions = ['全部幣別', 'USDT', 'USD', 'TWD'];
const typeOptions = computed(() => ['全部類型', ...Array.from(new Set(jackpotRows.map((row) => row.type)))]);

const summaryCards = computed(() => {
  const active = jackpotRows.filter((row) => row.status === '啟用').length;
  const pending = jackpotRows.filter((row) => row.reviewStatus === '待審核').length;
  const boundGames = jackpotRows.reduce((sum, row) => sum + row.boundGames, 0);

  return [
    { label: '獎池總數', value: String(jackpotRows.length), helper: `啟用 ${active}，待審核 ${pending}` },
    { label: '綁定遊戲', value: String(boundGames), helper: '依目前獎池設定加總' },
    { label: '敏感異動', value: String(pending), helper: '比例、派發、金額設定需審核' },
    { label: '資料規則', value: '不可硬刪', helper: '僅可停用或封存' }
  ];
});

function resetFilters() {
  filters.keyword = '';
  filters.status = '全部狀態';
  filters.currency = '全部幣別';
  filters.type = '全部類型';
  filters.updatedAt = [null, null];
}

function openDetail(row: JackpotRow) {
  selectedJackpot.value = row;
  detailVisible.value = true;
}

function openArchive(row: JackpotRow) {
  selectedJackpot.value = row;
  archiveReason.value = '';
  archiveVisible.value = true;
}
</script>

<template>
  <div class="page-stack jackpot-list-page">
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
          <p>查詢獎池狀態、幣別、累積比例、綁定遊戲與待審核設定。</p>
        </div>
      </template>

      <div class="jackpot-filter-grid">
        <div class="field jackpot-filter-keyword">
          <label>關鍵字</label>
          <InputText v-model="filters.keyword" placeholder="輸入獎池代號或名稱" fluid />
        </div>
        <div class="field">
          <label>狀態</label>
          <Select v-model="filters.status" :options="statusOptions" fluid />
        </div>
        <div class="field">
          <label>幣別</label>
          <Select v-model="filters.currency" :options="currencyOptions" fluid />
        </div>
        <div class="field">
          <label>獎池類型</label>
          <Select v-model="filters.type" :options="typeOptions" fluid />
        </div>
        <DateTimeRangeField
          class="jackpot-date-range"
          :model-value="filters.updatedAt"
          @update:model-value="filters.updatedAt = $event"
        />
        <div class="jackpot-filter-actions">
          <Button label="查詢" icon="pi pi-search" />
          <Button label="重置" icon="pi pi-refresh" severity="secondary" outlined @click="resetFilters" />
        </div>
      </div>
    </SectionCard>

    <div class="agent-command-bar">
      <div>
        <span class="table-count"><Badge :value="jackpotRows.length" severity="info" /> 個獎池</span>
        <p>獎池不可硬刪除；金額、累積比例與派發規則修改需保留審核與操作紀錄。</p>
      </div>
      <div class="agent-command-actions">
        <Button label="獎池設定" icon="pi pi-cog" severity="secondary" outlined @click="router.push('/jackpots/settings')" />
        <Button label="新增獎池" icon="pi pi-plus" />
        <Button label="匯出" icon="pi pi-download" severity="secondary" outlined />
      </div>
    </div>

    <SectionCard class="merchant-table-card jackpot-table-card">
      <DataTable
        :value="jackpotRows"
        :loading="loading"
        scrollable
        paginator
        :rows="10"
        :rows-per-page-options="[5, 10, 20, 50, 100]"
        paginator-template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink RowsPerPageDropdown"
        current-page-report-template="{first}-{last} / {totalRecords}"
        data-key="code"
        table-style="min-width: 1360px"
      >
        <Column field="code" header="獎池代號" frozen style="width: 156px; min-width: 156px">
          <template #body="{ data }">
            <strong class="linkish" @click="openDetail(data)">{{ data.code }}</strong>
          </template>
        </Column>
        <Column field="name" header="獎池名稱" style="width: 164px; min-width: 164px">
          <template #body="{ data }">
            <strong class="agent-primary-text">{{ data.name }}</strong>
            <small class="agent-secondary-text">{{ data.type }}</small>
          </template>
        </Column>
        <Column field="balance" header="目前餘額" header-class="agent-table-cell-right" body-class="agent-table-cell-right" style="width: 150px; min-width: 150px">
          <template #body="{ data }">
            <CurrencyAmount :value="data.balance" />
          </template>
        </Column>
        <Column field="currency" header="幣別" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 84px; min-width: 84px">
          <template #body="{ data }">
            <Tag :value="data.currency" severity="info" />
          </template>
        </Column>
        <Column field="contributionRate" header="累積比例" header-class="agent-table-cell-right" body-class="agent-table-cell-right" style="width: 104px; min-width: 104px">
          <template #body="{ data }">{{ data.contributionRate.toFixed(2) }}%</template>
        </Column>
        <Column field="boundGames" header="遊戲 / 商戶" style="width: 124px; min-width: 124px">
          <template #body="{ data }">
            <strong class="agent-primary-text">{{ data.boundGames }} 款</strong>
            <small class="agent-secondary-text">{{ data.merchants }} 商戶</small>
          </template>
        </Column>
        <Column field="payoutRule" header="派發規則" style="width: 184px; min-width: 184px" />
        <Column field="status" header="狀態" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 104px; min-width: 104px">
          <template #body="{ data }">
            <StatusTag :value="data.status" />
          </template>
        </Column>
        <Column field="reviewStatus" header="審核" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 104px; min-width: 104px">
          <template #body="{ data }">
            <StatusTag :value="data.reviewStatus" />
          </template>
        </Column>
        <Column field="updatedAt" header="更新時間" style="width: 168px; min-width: 168px" />
        <Column header="操作" frozen align-frozen="right" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 142px; min-width: 142px">
          <template #body="{ data }">
            <div class="row-actions">
              <Button v-tooltip.top="'查看'" icon="pi pi-eye" text severity="secondary" aria-label="查看" @click="openDetail(data)" />
              <Button v-tooltip.top="'流水'" icon="pi pi-history" text severity="secondary" aria-label="流水" @click="router.push('/jackpots/transactions')" />
              <Button v-tooltip.top="'封存'" icon="pi pi-ban" text severity="danger" aria-label="封存" @click="openArchive(data)" />
            </div>
          </template>
        </Column>
      </DataTable>
    </SectionCard>

    <Dialog v-model:visible="detailVisible" modal dismissable-mask header="獎池詳情" class="entity-dialog">
      <div v-if="selectedJackpot" class="entity-dialog-body">
        <section class="dialog-section">
          <h3>獎池摘要</h3>
          <div class="detail-grid dialog-detail-grid">
            <div><span>獎池代號</span><strong>{{ selectedJackpot.code }}</strong></div>
            <div><span>獎池名稱</span><strong>{{ selectedJackpot.name }}</strong></div>
            <div><span>類型</span><strong>{{ selectedJackpot.type }}</strong></div>
            <div><span>幣別</span><strong>{{ selectedJackpot.currency }}</strong></div>
            <div><span>目前餘額</span><CurrencyAmount :value="selectedJackpot.balance" /></div>
            <div><span>累積比例</span><SensitiveValue :value="`${selectedJackpot.contributionRate.toFixed(2)}%`" /></div>
            <div><span>綁定遊戲</span><strong>{{ selectedJackpot.boundGames }} 款</strong></div>
            <div><span>綁定商戶</span><strong>{{ selectedJackpot.merchants }} 個</strong></div>
          </div>
        </section>
        <section class="dialog-section">
          <h3>規則與治理</h3>
          <div class="detail-grid dialog-detail-grid">
            <div><span>派發規則</span><strong>{{ selectedJackpot.payoutRule }}</strong></div>
            <div><span>狀態</span><StatusTag :value="selectedJackpot.status" /></div>
            <div><span>審核狀態</span><StatusTag :value="selectedJackpot.reviewStatus" /></div>
            <div><span>維護人</span><strong>{{ selectedJackpot.maintainer }}</strong></div>
            <div class="detail-field-wide"><span>備註</span><strong>{{ selectedJackpot.note }}</strong></div>
          </div>
        </section>
      </div>
      <template #footer>
        <div class="dialog-footer-actions">
          <Button label="關閉" severity="secondary" outlined @click="detailVisible = false" />
          <Button label="查看流水" icon="pi pi-history" severity="secondary" outlined @click="router.push('/jackpots/transactions')" />
          <Button label="派發紀錄" icon="pi pi-send" @click="router.push('/jackpots/payouts')" />
        </div>
      </template>
    </Dialog>

    <Dialog v-model:visible="archiveVisible" modal dismissable-mask header="封存獎池確認" class="confirm-dialog">
      <div v-if="selectedJackpot" class="confirm-dialog-body">
        <i class="pi pi-exclamation-triangle" />
        <div>
          <h3>確認封存 {{ selectedJackpot.name }}？</h3>
          <p>獎池不可硬刪除。封存後會停止新的累積與派發，既有流水、派發紀錄與審核紀錄仍會保留。</p>
        </div>
      </div>
      <div class="field">
        <label>封存原因</label>
        <Textarea v-model="archiveReason" rows="3" auto-resize placeholder="請輸入封存原因，正式環境會建立審核單。" fluid />
      </div>
      <template #footer>
        <div class="dialog-footer-actions">
          <Button label="取消" severity="secondary" outlined @click="archiveVisible = false" />
          <Button label="確認封存" icon="pi pi-check" severity="danger" @click="archiveVisible = false" />
        </div>
      </template>
    </Dialog>
  </div>
</template>
