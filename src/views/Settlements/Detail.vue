<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import CurrencyAmount from '@/components/ui/CurrencyAmount.vue';
import SectionCard from '@/components/ui/SectionCard.vue';
import SensitiveValue from '@/components/ui/SensitiveValue.vue';
import SummaryCardGrid from '@/components/ui/SummaryCardGrid.vue';

type Severity = 'success' | 'info' | 'warn' | 'danger' | 'secondary';

const route = useRoute();
const router = useRouter();
const lockDialogVisible = ref(false);
const disputeDialogVisible = ref(false);
const disputeReason = ref('');

interface SettlementDetail {
  id: string;
  merchant: string;
  merchantCode: string;
  agent: string;
  cycle: string;
  period: string;
  status: string;
  currency: string;
  lockedBy: string;
  generatedAt: string;
  updatedAt: string;
  owner: string;
  note: string;
}

const settlement = reactive<SettlementDetail>({
  id: String(route.params.id || 'SET-202605-GD-001'),
  merchant: '',
  merchantCode: '',
  agent: '',
  cycle: '',
  period: '',
  status: '',
  currency: '',
  lockedBy: '',
  generatedAt: '',
  updatedAt: '',
  owner: '',
  note: ''
});

const loading = ref(true);

onMounted(async () => {
  try {
    const res = await fetch(`/api/settlements/v2/detail/${route.params.id}`);
    const data: SettlementDetail = await res.json();
    Object.assign(settlement, data);
  } finally {
    loading.value = false;
  }
});

const currencyRows = [
  { currency: 'USDT', bet: 1268800, win: 1195200, ggr: 73600, fxRate: '1.000000', settlementGgr: 73600, revenueShare: 0.32, receivable: 23552 },
  { currency: 'USD', bet: 182400, win: 175200, ggr: 7200, fxRate: '1.000000', settlementGgr: 7200, revenueShare: 0.32, receivable: 2304 },
  { currency: 'TWD', bet: 1680000, win: 1605200, ggr: 74800, fxRate: '0.031250', settlementGgr: 2337.5, revenueShare: 0.32, receivable: 748 }
];

const adjustmentRows = ref([
  { id: 'ADJ-001', type: '退款', amount: -1200, currency: 'USDT', reason: '異常注單退款', status: '待審核', applicant: 'Risk Admin' },
  { id: 'ADJ-002', type: '補單', amount: 0, currency: 'USDT', reason: '僅補交易紀錄，不調整金額', status: '已確認', applicant: 'Support Admin' },
  { id: 'ADJ-003', type: '人工折讓', amount: 800, currency: 'USD', reason: '商務協議調整', status: '待審核', applicant: 'Finance Admin' }
]);

const reconciliationSteps = computed(() => [
  { label: '產生結算單', status: '已完成', owner: '系統', time: settlement.generatedAt, note: '依結算週期彙總注單、交易、GGR 與匯率。' },
  { label: '商戶對帳', status: '已完成', owner: 'Golden Dragon', time: '2026-05-21 19:10:44', note: '商戶已下載明細並完成初步核對。' },
  { label: '財務覆核', status: '處理中', owner: settlement.owner, time: '2026-05-22 10:12:08', note: '等待退款調整項審核。' },
  { label: '鎖定結算單', status: settlement.status === '已鎖定' ? '已完成' : '待處理', owner: settlement.lockedBy, time: settlement.status === '已鎖定' ? settlement.updatedAt : '-', note: '鎖定後不可修改金額、分潤與調整項。' }
]);

const auditRows = ref([
  { time: '2026-05-21 18:24:12', actor: 'System', action: '產生結算單', target: settlement.id, result: '成功' },
  { time: '2026-05-21 19:10:44', actor: 'Merchant Admin', action: '下載對帳明細', target: settlement.id, result: '成功' },
  { time: '2026-05-22 09:48:31', actor: 'Risk Admin', action: '送出退款調整', target: 'ADJ-001', result: '待審核' }
]);

const totals = computed(() => {
  const settlementGgr = currencyRows.reduce((sum, row) => sum + row.settlementGgr, 0);
  const receivable = currencyRows.reduce((sum, row) => sum + row.receivable, 0);
  const adjustment = adjustmentRows.value.reduce((sum, row) => sum + row.amount, 0);
  return {
    settlementGgr,
    receivable: receivable + adjustment,
    adjustment,
    pendingAdjustments: adjustmentRows.value.filter((row) => row.status === '待審核').length
  };
});

const summaryCards = computed(() => [
  { label: '結算狀態', value: settlement.status, helper: `負責人 ${settlement.owner}`, icon: 'pi pi-file-check', severity: tagSeverity(settlement.status) },
  { label: '折算 GGR', value: formatMoney(totals.value.settlementGgr, settlement.currency), helper: '依對帳幣別與匯率折算', icon: 'pi pi-chart-line', severity: totals.value.settlementGgr < 0 ? 'danger' as Severity : 'success' as Severity },
  { label: '供應商應收', value: formatMoney(totals.value.receivable, settlement.currency), helper: '含分潤與調整項', icon: 'pi pi-wallet', severity: totals.value.receivable < 0 ? 'danger' as Severity : 'success' as Severity },
  { label: '待審調整', value: String(totals.value.pendingAdjustments), helper: '需完成審核才能鎖定', icon: 'pi pi-exclamation-triangle', severity: totals.value.pendingAdjustments > 0 ? 'warn' as Severity : 'success' as Severity }
]);

function formatMoney(value: number, currency: string) {
  const sign = value < 0 ? '-' : '';
  return `${currency} ${sign}${Math.abs(value).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

function tagSeverity(value: string): Severity {
  if (['已鎖定', '已完成', '已確認', '成功'].includes(value)) return 'success';
  if (['待審核', '待處理', '處理中', '待審調整'].includes(value)) return 'warn';
  if (['爭議中', '失敗'].includes(value)) return 'danger';
  return 'info';
}

function confirmLock() {
  settlement.status = '已鎖定';
  settlement.lockedBy = 'Supplier Admin';
  settlement.updatedAt = '2026-05-22 10:45:00';
  auditRows.value.unshift({
    time: settlement.updatedAt,
    actor: 'Supplier Admin',
    action: '鎖定結算單',
    target: settlement.id,
    result: '成功'
  });
  lockDialogVisible.value = false;
}

function confirmDispute() {
  settlement.status = '爭議中';
  settlement.note = disputeReason.value || '標記爭議，等待財務與商戶重新對帳。';
  settlement.updatedAt = '2026-05-22 10:45:00';
  auditRows.value.unshift({
    time: settlement.updatedAt,
    actor: 'Supplier Admin',
    action: '標記爭議',
    target: settlement.id,
    result: '成功'
  });
  disputeDialogVisible.value = false;
}
</script>

<template>
  <div class="page-stack settlements-page settlement-detail-page">
    <div class="settlement-detail-actions">
      <Button label="返回列表" icon="pi pi-arrow-left" severity="secondary" outlined @click="router.push('/settlements')" />
      <div>
        <Button label="標記爭議" icon="pi pi-flag" severity="secondary" outlined :disabled="settlement.status === '已鎖定'" @click="disputeDialogVisible = true" />
        <Button label="鎖定結算單" icon="pi pi-lock" severity="danger" :disabled="settlement.status === '已鎖定'" @click="lockDialogVisible = true" />
        <Button label="匯出明細" icon="pi pi-download" />
      </div>
    </div>

    <SummaryCardGrid :cards="summaryCards" />

    <SectionCard>
      <template #header>
        <div class="dialog-title-block">
          <h2>結算摘要</h2>
          <p>查看商戶、代理、週期、對帳幣別與鎖定狀態。</p>
        </div>
      </template>
      <div class="detail-grid settlement-detail-grid">
        <div><span>結算單號</span><strong>{{ settlement.id }}</strong></div>
        <div><span>商戶</span><strong>{{ settlement.merchant }} / {{ settlement.merchantCode }}</strong></div>
        <div><span>代理</span><strong>{{ settlement.agent }}</strong></div>
        <div><span>結算週期</span><strong>{{ settlement.cycle }}</strong></div>
        <div><span>結算區間</span><strong>{{ settlement.period }}</strong></div>
        <div><span>對帳幣別</span><strong>{{ settlement.currency }}</strong></div>
        <div><span>狀態</span><Tag :value="settlement.status" :severity="tagSeverity(settlement.status)" /></div>
        <div><span>鎖定人</span><strong>{{ settlement.lockedBy }}</strong></div>
        <div><span>更新時間</span><strong>{{ settlement.updatedAt }}</strong></div>
        <div class="detail-field-wide"><span>內部備註</span><SensitiveValue :value="settlement.note" /></div>
      </div>
    </SectionCard>

    <section class="two-column settlement-detail-columns">
      <SectionCard>
        <template #header>
          <div class="dialog-title-block">
            <h2>多幣別結算</h2>
            <p>各原幣別依匯率折算為對帳幣別後計算分潤。</p>
          </div>
        </template>
        <DataTable :value="currencyRows" :loading="loading" scrollable table-style="min-width: 760px">
          <Column field="currency" header="原幣別" />
          <Column header="Bet">
            <template #body="{ data }">
              <CurrencyAmount :value="formatMoney(data.bet, data.currency)" />
            </template>
          </Column>
          <Column header="Win">
            <template #body="{ data }">
              <CurrencyAmount :value="formatMoney(data.win, data.currency)" />
            </template>
          </Column>
          <Column header="GGR">
            <template #body="{ data }">
              <CurrencyAmount :value="formatMoney(data.ggr, data.currency)" :negative="data.ggr < 0" />
            </template>
          </Column>
          <Column field="fxRate" header="匯率" />
          <Column header="折算 GGR">
            <template #body="{ data }">
              <CurrencyAmount :value="formatMoney(data.settlementGgr, settlement.currency)" :negative="data.settlementGgr < 0" />
            </template>
          </Column>
        </DataTable>
      </SectionCard>

      <SectionCard>
        <template #header>
          <div class="dialog-title-block">
            <h2>分潤與調整項</h2>
            <p>分潤比例、退款、補單與人工折讓都需保留審核紀錄。</p>
          </div>
        </template>
        <DataTable :value="adjustmentRows" :loading="loading" scrollable table-style="min-width: 680px">
          <Column field="id" header="調整單號" />
          <Column field="type" header="類型" />
          <Column header="金額">
            <template #body="{ data }">
              <CurrencyAmount :value="formatMoney(data.amount, data.currency)" :negative="data.amount < 0" />
            </template>
          </Column>
          <Column field="reason" header="原因" />
          <Column field="status" header="狀態" header-class="agent-table-cell-center" body-class="agent-table-cell-center">
            <template #body="{ data }">
              <Tag :value="data.status" :severity="tagSeverity(data.status)" />
            </template>
          </Column>
        </DataTable>
      </SectionCard>
    </section>

    <section class="two-column settlement-detail-columns">
      <SectionCard>
        <template #header>
          <div class="dialog-title-block">
            <h2>對帳流程</h2>
            <p>追蹤產生、商戶確認、財務覆核與鎖定狀態。</p>
          </div>
        </template>
        <div class="settlement-step-list">
          <article v-for="step in reconciliationSteps" :key="step.label" class="settlement-step">
            <span class="agent-section-icon"><i class="pi pi-check" /></span>
            <div>
              <div class="risk-row-head">
                <strong>{{ step.label }}</strong>
                <Tag :value="step.status" :severity="tagSeverity(step.status)" />
              </div>
              <p>{{ step.note }}</p>
              <small>{{ step.owner }} / {{ step.time }}</small>
            </div>
          </article>
        </div>
      </SectionCard>

      <SectionCard>
        <template #header>
          <div class="dialog-title-block">
            <h2>操作紀錄</h2>
            <p>結算單不可刪除；鎖定、爭議與調整都需留下紀錄。</p>
          </div>
        </template>
        <DataTable :value="auditRows" :loading="loading" scrollable table-style="min-width: 620px">
          <Column field="time" header="時間" />
          <Column field="actor" header="操作者" />
          <Column field="action" header="操作" />
          <Column field="target" header="目標" />
          <Column field="result" header="結果" header-class="agent-table-cell-center" body-class="agent-table-cell-center">
            <template #body="{ data }">
              <Tag :value="data.result" :severity="tagSeverity(data.result)" />
            </template>
          </Column>
        </DataTable>
      </SectionCard>
    </section>

    <Dialog v-model:visible="lockDialogVisible" modal dismissable-mask class="confirm-dialog" :style="{ width: 'min(520px, calc(100vw - 32px))' }">
      <template #header>
        <div class="dialog-title-block">
          <span>鎖定結算單</span>
          <small>{{ settlement.id }}</small>
        </div>
      </template>
      <div class="disable-agent-warning">
        <i class="pi pi-lock" />
        <div>
          <strong>鎖定後不可再修改金額、分潤比例與調整項。</strong>
          <p>正式環境鎖定結算單需送審，並由後端驗證 RBAC、資料範圍與操作權限。</p>
        </div>
      </div>
      <template #footer>
        <Button label="取消" severity="secondary" outlined @click="lockDialogVisible = false" />
        <Button label="確認鎖定" icon="pi pi-check" severity="danger" @click="confirmLock" />
      </template>
    </Dialog>

    <Dialog v-model:visible="disputeDialogVisible" modal dismissable-mask class="entity-dialog settlement-dialog" :style="{ width: 'min(640px, calc(100vw - 32px))' }">
      <template #header>
        <div class="dialog-title-block">
          <span>標記爭議</span>
          <small>{{ settlement.id }}</small>
        </div>
      </template>
      <div class="dialog-section">
        <h3>爭議原因</h3>
        <p class="dialog-section-note">標記爭議後需重新對帳，鎖定前不得作為正式付款資料。</p>
        <Textarea v-model="disputeReason" rows="4" auto-resize placeholder="輸入爭議原因" fluid />
      </div>
      <template #footer>
        <Button label="取消" severity="secondary" outlined @click="disputeDialogVisible = false" />
        <Button label="標記爭議" icon="pi pi-flag" severity="danger" @click="confirmDispute" />
      </template>
    </Dialog>
  </div>
</template>
