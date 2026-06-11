<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue';
import { api } from '@/services/apiClient';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import ToggleSwitch from 'primevue/toggleswitch';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import SelectButton from 'primevue/selectbutton';
import SectionCard from '@/components/ui/SectionCard.vue';
import StatusTag from '@/components/ui/StatusTag.vue';
import SensitiveValue from '@/components/ui/SensitiveValue.vue';
import SummaryCardGrid from '@/components/ui/SummaryCardGrid.vue';

type RuleTemplate = {
  id: string;
  name: string;
  type: string;
  currency: string;
  contributionRate: number;
  triggerMode: string;
  payoutCap: number;
  reviewRequired: boolean;
  status: string;
  updatedAt: string;
};

type ScheduleTemplate = {
  id: string;
  name: string;
  cycle: string;
  timeWindow: string;
  scope: string;
  status: string;
};

const activeMode = ref('派發規則');
const editDialogVisible = ref(false);
const selectedRule = ref<RuleTemplate | null>(null);

const settings = reactive({
  defaultCurrency: 'USDT',
  settlementCurrency: 'USDT',
  allowMultiCurrency: true,
  requirePayoutReview: true,
  requireManualAdjustReview: true,
  reserveOriginalCurrencyReport: true,
  balanceAlertThreshold: 100000,
  maxManualAdjustAmount: 5000,
  auditRetentionDays: 365,
  effectiveEnvironment: '正式'
});

const ruleTemplates = reactive<RuleTemplate[]>([]);
const scheduleTemplates = reactive<ScheduleTemplate[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const data = await api.get<any>('/api/jackpot/v2/settings');
    if (data.settings) Object.assign(settings, data.settings);
    if (data.ruleTemplates) ruleTemplates.splice(0, ruleTemplates.length, ...data.ruleTemplates);
    if (data.scheduleTemplates) scheduleTemplates.splice(0, scheduleTemplates.length, ...data.scheduleTemplates);
  } finally {
    loading.value = false;
  }
});

const modeOptions = ['派發規則', '維護排程', '審核治理'];
const currencyOptions = ['USDT', 'USD', 'TWD'];
const environmentOptions = ['測試', '正式'];
const triggerOptions = ['隨機觸發', '固定時段', '下注觸發', '人工派發'];

const summaryCards = computed(() => {
  const pending = ruleTemplates.filter((row) => row.status === '待審核').length + scheduleTemplates.filter((row) => row.status === '待審核').length;
  const reviewRules = ruleTemplates.filter((row) => row.reviewRequired).length;

  return [
    { label: '規則模板', value: String(ruleTemplates.length), helper: `需審核 ${reviewRules} 組` },
    { label: '維護排程', value: String(scheduleTemplates.length), helper: '每日 / 每週 / 每月' },
    { label: '待審核', value: String(pending), helper: '正式規則異動需覆核' },
    { label: '目前環境', value: settings.effectiveEnvironment, helper: '正式設定會影響派發計算' }
  ];
});

function openRule(row?: RuleTemplate) {
  selectedRule.value = row
    ? { ...row }
    : {
        id: 'JPR-NEW',
        name: '',
        type: '全域累積',
        currency: settings.defaultCurrency,
        contributionRate: 1,
        triggerMode: '隨機觸發',
        payoutCap: 100000,
        reviewRequired: true,
        status: '待審核',
        updatedAt: '尚未建立'
      };
  editDialogVisible.value = true;
}
</script>

<template>
  <div class="page-stack jackpot-settings-page">
    <SummaryCardGrid :cards="summaryCards" />

    <SectionCard>
      <template #header>
        <div class="dialog-title-block">
          <h2>全域獎池設定</h2>
          <p>定義幣別、審核門檻、人工調整限制與操作紀錄保留規則。</p>
        </div>
      </template>

      <div class="jackpot-settings-grid">
        <div class="field">
          <label>預設幣別</label>
          <Select v-model="settings.defaultCurrency" :options="currencyOptions" fluid />
        </div>
        <div class="field">
          <label>對帳幣別</label>
          <Select v-model="settings.settlementCurrency" :options="currencyOptions" fluid />
        </div>
        <div class="field">
          <label>生效環境</label>
          <SelectButton v-model="settings.effectiveEnvironment" :options="environmentOptions" />
        </div>
        <div class="field">
          <label>餘額告警門檻</label>
          <InputNumber v-model="settings.balanceAlertThreshold" mode="decimal" :min="0" fluid />
        </div>
        <div class="field">
          <label>人工調整上限</label>
          <InputNumber v-model="settings.maxManualAdjustAmount" mode="decimal" :min="0" fluid />
        </div>
        <div class="field">
          <label>操作紀錄保留天數</label>
          <InputNumber v-model="settings.auditRetentionDays" :min="30" fluid />
        </div>
      </div>

      <div class="jackpot-switch-grid">
        <div>
          <span>允許多幣別獎池</span>
          <ToggleSwitch v-model="settings.allowMultiCurrency" />
        </div>
        <div>
          <span>派發需審核</span>
          <ToggleSwitch v-model="settings.requirePayoutReview" />
        </div>
        <div>
          <span>人工調整需審核</span>
          <ToggleSwitch v-model="settings.requireManualAdjustReview" />
        </div>
        <div>
          <span>保留原幣別報表</span>
          <ToggleSwitch v-model="settings.reserveOriginalCurrencyReport" />
        </div>
      </div>
    </SectionCard>

    <SectionCard>
      <template #header>
        <div class="dialog-title-block">
          <h2>設定項目</h2>
          <p>派發規則、維護排程與審核治理分開維護，避免敏感規則混在同一張表。</p>
        </div>
        <SelectButton v-model="activeMode" :options="modeOptions" />
      </template>

      <DataTable
        v-if="activeMode === '派發規則'"
        :value="ruleTemplates"
        :loading="loading"
        scrollable
        data-key="id"
        table-style="min-width: 980px"
      >
        <Column field="id" header="規則代號" style="width: 150px; min-width: 150px">
          <template #body="{ data }">
            <strong class="linkish" @click="openRule(data)">{{ data.id }}</strong>
          </template>
        </Column>
        <Column field="name" header="規則名稱" style="width: 210px; min-width: 210px" />
        <Column field="type" header="類型" style="width: 120px; min-width: 120px" />
        <Column field="currency" header="幣別" style="width: 84px; min-width: 84px" />
        <Column field="contributionRate" header="累積比例" header-class="agent-table-cell-right" body-class="agent-table-cell-right" style="width: 112px; min-width: 112px">
          <template #body="{ data }">
            <SensitiveValue :value="`${data.contributionRate.toFixed(2)}%`" />
          </template>
        </Column>
        <Column field="triggerMode" header="觸發方式" style="width: 120px; min-width: 120px" />
        <Column field="payoutCap" header="派發上限" header-class="agent-table-cell-right" body-class="agent-table-cell-right" style="width: 120px; min-width: 120px">
          <template #body="{ data }">{{ data.payoutCap.toLocaleString('en-US') }}</template>
        </Column>
        <Column field="status" header="狀態" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 104px; min-width: 104px">
          <template #body="{ data }">
            <StatusTag :value="data.status" />
          </template>
        </Column>
        <Column header="操作" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 88px; min-width: 88px">
          <template #body="{ data }">
            <Button v-tooltip.top="'編輯規則'" icon="pi pi-pencil" text severity="secondary" aria-label="編輯規則" @click="openRule(data)" />
          </template>
        </Column>
      </DataTable>

      <DataTable
        v-else-if="activeMode === '維護排程'"
        :value="scheduleTemplates"
        :loading="loading"
        scrollable
        data-key="id"
        table-style="min-width: 820px"
      >
        <Column field="id" header="排程代號" style="width: 150px; min-width: 150px" />
        <Column field="name" header="排程名稱" style="width: 180px; min-width: 180px" />
        <Column field="cycle" header="週期" style="width: 100px; min-width: 100px" />
        <Column field="timeWindow" header="固定時間區間" style="width: 220px; min-width: 220px" />
        <Column field="scope" header="範圍" style="width: 140px; min-width: 140px" />
        <Column field="status" header="狀態" header-class="agent-table-cell-center" body-class="agent-table-cell-center" style="width: 104px; min-width: 104px">
          <template #body="{ data }">
            <StatusTag :value="data.status" />
          </template>
        </Column>
      </DataTable>

      <div v-else class="jackpot-governance-list">
        <article>
          <i class="pi pi-shield" />
          <div>
            <strong>正式環境修改需送審</strong>
            <span>累積比例、派發上限、派發規則、人工調整上限與封存獎池。</span>
          </div>
        </article>
        <article>
          <i class="pi pi-lock" />
          <div>
            <strong>金額設定不可直接覆寫</strong>
            <span>所有金額增減都需形成獎池流水，並關聯申請單或系統事件。</span>
          </div>
        </article>
        <article>
          <i class="pi pi-history" />
          <div>
            <strong>操作紀錄不可刪除</strong>
            <span>審核單、修改前後值、申請人、審核人與意見都需保留。</span>
          </div>
        </article>
      </div>

      <div class="section-inline-actions">
        <Button label="新增規則" icon="pi pi-plus" @click="openRule()" />
        <Button label="送出審核" icon="pi pi-send" severity="secondary" outlined />
      </div>
    </SectionCard>

    <Dialog v-model:visible="editDialogVisible" modal dismissable-mask header="獎池規則設定" class="entity-dialog">
      <div v-if="selectedRule" class="entity-dialog-body">
        <section class="dialog-section">
          <h3>規則內容</h3>
          <div class="dialog-form-grid">
            <div class="field field-span-4">
              <label>規則名稱</label>
              <InputText v-model="selectedRule.name" fluid />
            </div>
            <div class="field field-span-4">
              <label>獎池類型</label>
              <Select v-model="selectedRule.type" :options="['全域累積', '每日派發', '小額累積', '指定商戶']" fluid />
            </div>
            <div class="field field-span-4">
              <label>幣別</label>
              <Select v-model="selectedRule.currency" :options="currencyOptions" fluid />
            </div>
            <div class="field field-span-4">
              <label>觸發方式</label>
              <Select v-model="selectedRule.triggerMode" :options="triggerOptions" fluid />
            </div>
            <div class="field field-span-4">
              <label>累積比例</label>
              <InputNumber v-model="selectedRule.contributionRate" suffix="%" :min="0" :max="100" :min-fraction-digits="2" :max-fraction-digits="2" fluid />
            </div>
            <div class="field field-span-4">
              <label>派發上限</label>
              <InputNumber v-model="selectedRule.payoutCap" mode="decimal" :min="0" fluid />
            </div>
            <div class="field switch-field field-span-4">
              <label>需審核</label>
              <ToggleSwitch v-model="selectedRule.reviewRequired" />
            </div>
          </div>
        </section>
        <section class="dialog-section">
          <h3>送審提示</h3>
          <p class="dialog-section-note">正式環境修改累積比例、派發上限或觸發方式會建立審核單，前端僅做 UX 控制，後端仍需驗證 RBAC / ABAC / field-level authorization。</p>
        </section>
      </div>
      <template #footer>
        <div class="dialog-footer-actions">
          <Button label="關閉" severity="secondary" outlined @click="editDialogVisible = false" />
          <Button label="儲存草稿" icon="pi pi-save" severity="secondary" outlined />
          <Button label="送出審核" icon="pi pi-send" @click="editDialogVisible = false" />
        </div>
      </template>
    </Dialog>
  </div>
</template>
