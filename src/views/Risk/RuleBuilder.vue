<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import MultiSelect from 'primevue/multiselect';
import DatePicker from 'primevue/datepicker';
import ToggleSwitch from 'primevue/toggleswitch';
import SelectButton from 'primevue/selectbutton';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import SectionCard from '@/components/ui/SectionCard.vue';
import SensitiveValue from '@/components/ui/SensitiveValue.vue';
import StatusTag from '@/components/ui/StatusTag.vue';

const route = useRoute();
const router = useRouter();

const isEdit = computed(() => route.path.endsWith('/edit'));
const ruleId = computed(() => String(route.params.id ?? 'RR-DRAFT'));
const copyFrom = typeof route.query.copyFrom === 'string' ? route.query.copyFrom : '';
const draftName = typeof route.query.draftName === 'string' ? route.query.draftName : '';

const categoryOptions = ['高額派彩', '錢包異常', '投注頻率', 'RTP 偏移', 'API 回應異常', '玩家風險'];
const statusOptions = ['草稿', '啟用', '停用', '待審核'];
const ownerOptions = ['Iris Chen', 'Mia Chen', 'Alex Wang', 'Supplier Admin'];
const scopeModeOptions = ['全域', '指定商戶', '指定遊戲'];
const environmentOptions = ['測試', '正式'];
const merchantOptions = ['Golden Dragon', 'LuckyPlay', 'Nova Gaming', 'Royal H5', 'Fortune Hall'];
const gameOptions = ['Fortune Tiger', 'Royal Spin', 'Blackjack Live', 'Candy Pop', 'Jackpot Rush'];
const currencyOptions = ['USDT', 'TWD', 'USD', 'JPY', 'PHP'];
const targetOptions = ['單筆派彩金額', '玩家投注頻率', '錢包 API 失敗次數', 'RTP 偏移百分比', '重複交易次數'];
const operatorOptions = ['大於等於', '大於', '小於等於', '等於'];
const riskLevelOptions = ['低風險', '中風險', '高風險', '嚴重'];
const actionOptions = ['只發送通知', '建立風控案件', '暫停遊戲入口', '標記人工處理', '鎖定交易重試'];
const notifyGroupOptions = ['風控群組', '財務群組', '營運群組', '技術值班'];
const channelOptions = ['後台通知', 'Email', 'Webhook'];

const form = reactive({
  code: isEdit.value ? ruleId.value : copyFrom ? `${copyFrom}-COPY` : 'RR-DRAFT',
  name: isEdit.value ? '高額 Jackpot 派彩' : draftName,
  category: isEdit.value ? '高額派彩' : '高額派彩',
  status: isEdit.value ? '待審核' : '草稿',
  owner: isEdit.value ? 'Iris Chen' : 'Supplier Admin',
  description: isEdit.value ? '監控單筆高額 Jackpot 派彩，超過門檻時建立案件並通知風控與財務。' : copyFrom ? `由 ${copyFrom} 複製建立，請確認條件、範圍與處置動作後再送審。` : '',
  scopeMode: isEdit.value ? '指定遊戲' : '指定商戶',
  environment: isEdit.value ? '正式' : '測試',
  merchants: isEdit.value ? ['Golden Dragon', 'Royal H5'] : [] as string[],
  games: isEdit.value ? ['Fortune Tiger', 'Jackpot Rush'] : [] as string[],
  currencies: isEdit.value ? ['USDT', 'USD'] : ['USDT'] as string[],
  target: isEdit.value ? '單筆派彩金額' : '玩家投注頻率',
  operator: '大於等於',
  amountLimit: isEdit.value ? 50000 : 10000,
  hitCountLimit: isEdit.value ? 3 : 5,
  rtpDeviation: isEdit.value ? 3 : 2,
  cycleMinutes: isEdit.value ? 10 : 15,
  cooldownMinutes: isEdit.value ? 30 : 20,
  riskLevel: isEdit.value ? '高風險' : '中風險',
  action: isEdit.value ? '建立風控案件' : '只發送通知',
  createCase: isEdit.value,
  notifyOps: true,
  stopRetry: false,
  requireReview: true,
  notifyGroups: isEdit.value ? ['風控群組', '財務群組'] : ['風控群組'] as string[],
  channels: isEdit.value ? ['後台通知', 'Email'] : ['後台通知'] as string[],
  effectiveAt: null as Date | null,
  changeReason: isEdit.value ? '調整高額派彩門檻並補齊正式環境審核資料。' : '',
  internalNote: '',
  auditToken: isEdit.value ? 'AUD-RISK-RR-JP-001-20260520' : '建立後產生'
});

const pageTitle = computed(() => (isEdit.value ? '編輯風控規則' : '新增風控規則'));
const primaryAction = computed(() => (isEdit.value ? '送出變更審核' : '建立規則'));

const scopeSummary = computed(() => {
  if (form.scopeMode === '全域') return '全部商戶與遊戲';
  if (form.scopeMode === '指定遊戲') return form.games.length ? form.games.join('、') : '尚未選擇遊戲';
  return form.merchants.length ? form.merchants.join('、') : '尚未選擇商戶';
});

const conditionSummary = computed(() => {
  const value = form.target === 'RTP 偏移百分比' ? `${form.rtpDeviation}%` : form.target.includes('金額') ? `USDT ${form.amountLimit.toLocaleString()}` : `${form.hitCountLimit} 次`;
  return `${form.target} ${form.operator} ${value}，週期 ${form.cycleMinutes} 分鐘`;
});

function goBack() {
  router.push('/risks/rules');
}
</script>

<template>
  <div class="form-layout agent-settings-layout risk-rule-builder-layout">
    <nav class="anchor-list agent-anchor-list">
      <a href="#rule-basic"><i class="pi pi-id-card" /> 基本資料</a>
      <a href="#rule-scope"><i class="pi pi-sitemap" /> 生效範圍</a>
      <a href="#rule-condition"><i class="pi pi-sliders-h" /> 條件門檻</a>
      <a href="#rule-action"><i class="pi pi-bolt" /> 通知動作</a>
      <a href="#rule-review"><i class="pi pi-verified" /> 審核備註</a>
    </nav>

    <div class="page-stack agent-settings-page risk-rule-builder-page">
      <section class="agent-review-strip risk-builder-strip">
        <div>
          <strong>{{ pageTitle }}</strong>
          <p>正式環境的條件、門檻、適用範圍與處置動作變更，都需要送審並留下操作紀錄。</p>
        </div>
        <div class="review-chip-list">
          <Tag value="Rule Builder" severity="info" />
          <Tag :value="form.environment" :severity="form.environment === '正式' ? 'danger' : 'info'" />
          <Tag value="需 RBAC / ABAC 驗證" severity="warn" />
        </div>
      </section>

      <SectionCard id="rule-basic" class="agent-form-card">
        <template #header>
          <div class="dialog-title-block">
            <div class="agent-section-title">
              <span class="agent-section-icon"><i class="pi pi-id-card" /></span>
              <div>
                <h2>基本資料</h2>
                <p>定義規則名稱、分類、狀態與負責人，方便後續審核與追蹤。</p>
              </div>
            </div>
          </div>
        </template>

        <div class="agent-form-grid">
          <div class="field agent-form-field">
            <label>規則代號</label>
            <InputText v-model="form.code" :disabled="isEdit" placeholder="系統自動產生" fluid />
            <small>新增送出後會產生正式規則代號。</small>
          </div>
          <div class="field agent-form-field">
            <label>規則名稱</label>
            <InputText v-model="form.name" placeholder="輸入規則名稱" fluid />
          </div>
          <div class="field agent-form-field">
            <label>規則分類</label>
            <Select v-model="form.category" :options="categoryOptions" fluid />
          </div>
          <div class="field agent-form-field">
            <label>狀態</label>
            <Select v-model="form.status" :options="statusOptions" fluid />
          </div>
          <div class="field agent-form-field">
            <label>負責人</label>
            <Select v-model="form.owner" :options="ownerOptions" fluid />
          </div>
          <div class="field agent-form-field">
            <label>審核追蹤碼</label>
            <SensitiveValue :value="form.auditToken" />
          </div>
          <div class="field agent-form-field field-wide">
            <label>規則說明</label>
            <Textarea v-model="form.description" rows="3" auto-resize placeholder="描述規則目的、使用情境與注意事項" fluid />
          </div>
        </div>
      </SectionCard>

      <SectionCard id="rule-scope" class="agent-form-card">
        <template #header>
          <div class="dialog-title-block">
            <div class="agent-section-title">
              <span class="agent-section-icon"><i class="pi pi-sitemap" /></span>
              <div>
                <h2>生效範圍</h2>
                <p>指定規則套用在哪些商戶、遊戲、幣別與環境。正式環境切換會進入審核。</p>
              </div>
            </div>
          </div>
        </template>

        <div class="agent-form-grid">
          <div class="field agent-form-field">
            <label>範圍模式</label>
            <SelectButton v-model="form.scopeMode" :options="scopeModeOptions" />
          </div>
          <div class="field agent-form-field">
            <label>環境模式</label>
            <SelectButton v-model="form.environment" :options="environmentOptions" />
            <small>{{ form.environment === '正式' ? '正式環境會影響真實風控處置，送出後需審核。' : '測試模式只供沙盒驗證，不會觸發正式處置。' }}</small>
          </div>
          <div class="field agent-form-field">
            <label>幣別</label>
            <MultiSelect v-model="form.currencies" :options="currencyOptions" display="chip" placeholder="選擇幣別" fluid />
          </div>
          <div class="field agent-form-field">
            <label>指定商戶</label>
            <MultiSelect v-model="form.merchants" :options="merchantOptions" display="chip" placeholder="選擇商戶" :disabled="form.scopeMode === '全域'" fluid />
          </div>
          <div class="field agent-form-field">
            <label>指定遊戲</label>
            <MultiSelect v-model="form.games" :options="gameOptions" display="chip" placeholder="選擇遊戲" :disabled="form.scopeMode === '全域'" fluid />
          </div>
          <div class="field agent-form-field">
            <label>生效時間</label>
            <DatePicker v-model="form.effectiveAt" show-icon show-time hour-format="24" placeholder="選擇日期時間" fluid />
          </div>
        </div>
      </SectionCard>

      <SectionCard id="rule-condition" class="agent-form-card">
        <template #header>
          <div class="dialog-title-block">
            <div class="agent-section-title">
              <span class="agent-section-icon"><i class="pi pi-sliders-h" /></span>
              <div>
                <h2>條件與門檻</h2>
                <p>數值欄位統一使用 InputNumber，避免金額、比例與次數被一般文字欄位混用。</p>
              </div>
            </div>
          </div>
        </template>

        <div class="agent-form-grid">
          <div class="field agent-form-field">
            <label>監控目標</label>
            <Select v-model="form.target" :options="targetOptions" fluid />
          </div>
          <div class="field agent-form-field">
            <label>比較條件</label>
            <Select v-model="form.operator" :options="operatorOptions" fluid />
          </div>
          <div class="field agent-form-field">
            <label>金額門檻</label>
            <InputNumber v-model="form.amountLimit" mode="currency" currency="USD" locale="en-US" fluid />
          </div>
          <div class="field agent-form-field">
            <label>觸發次數</label>
            <InputNumber v-model="form.hitCountLimit" :min="1" suffix=" 次" fluid />
          </div>
          <div class="field agent-form-field">
            <label>RTP 偏移</label>
            <InputNumber v-model="form.rtpDeviation" :min="0" :max="100" :min-fraction-digits="1" :max-fraction-digits="2" suffix="%" fluid />
          </div>
          <div class="field agent-form-field">
            <label>統計週期</label>
            <InputNumber v-model="form.cycleMinutes" :min="1" suffix=" 分鐘" fluid />
          </div>
          <div class="field agent-form-field">
            <label>冷卻時間</label>
            <InputNumber v-model="form.cooldownMinutes" :min="0" suffix=" 分鐘" fluid />
          </div>
        </div>
      </SectionCard>

      <SectionCard id="rule-action" class="agent-form-card">
        <template #header>
          <div class="dialog-title-block">
            <div class="agent-section-title">
              <span class="agent-section-icon"><i class="pi pi-bolt" /></span>
              <div>
                <h2>通知與動作</h2>
                <p>定義命中規則後的風險等級、通知對象與後續處置。</p>
              </div>
            </div>
          </div>
        </template>

        <div class="agent-form-grid">
          <div class="field agent-form-field">
            <label>風險等級</label>
            <Select v-model="form.riskLevel" :options="riskLevelOptions" fluid />
          </div>
          <div class="field agent-form-field">
            <label>處置動作</label>
            <Select v-model="form.action" :options="actionOptions" fluid />
          </div>
          <div class="field agent-form-field">
            <label>通知群組</label>
            <MultiSelect v-model="form.notifyGroups" :options="notifyGroupOptions" display="chip" placeholder="選擇群組" fluid />
          </div>
          <div class="field agent-form-field">
            <label>通知通道</label>
            <MultiSelect v-model="form.channels" :options="channelOptions" display="chip" placeholder="選擇通道" fluid />
          </div>
          <div class="field agent-form-field switch-field">
            <label>自動建立案件</label>
            <ToggleSwitch v-model="form.createCase" />
          </div>
          <div class="field agent-form-field switch-field">
            <label>通知營運值班</label>
            <ToggleSwitch v-model="form.notifyOps" />
          </div>
          <div class="field agent-form-field switch-field">
            <label>鎖定交易重試</label>
            <ToggleSwitch v-model="form.stopRetry" />
          </div>
          <div class="field agent-form-field switch-field">
            <label>需要審核</label>
            <ToggleSwitch v-model="form.requireReview" />
          </div>
        </div>
      </SectionCard>

      <SectionCard id="rule-review" class="agent-form-card">
        <template #header>
          <div class="dialog-title-block">
            <div class="agent-section-title">
              <span class="agent-section-icon"><i class="pi pi-verified" /></span>
              <div>
                <h2>審核與預覽</h2>
                <p>送出前確認規則摘要，正式環境變更會產生審核單。</p>
              </div>
            </div>
          </div>
        </template>

        <div class="risk-builder-review-grid">
          <div class="risk-rule-preview">
            <h3>規則預覽</h3>
            <ul>
              <li><span>範圍</span><strong>{{ scopeSummary }}</strong></li>
              <li><span>條件</span><strong>{{ conditionSummary }}</strong></li>
              <li><span>動作</span><strong>{{ form.action }} / {{ form.riskLevel }}</strong></li>
              <li><span>通知</span><strong>{{ form.notifyGroups.join('、') || '尚未選擇' }}</strong></li>
            </ul>
            <div class="risk-preview-footer">
              <StatusTag :value="form.status" />
              <Tag :value="form.requireReview ? '需要審核' : '不需審核'" :severity="form.requireReview ? 'warn' : 'success'" />
            </div>
          </div>

          <div class="agent-form-grid risk-builder-note-grid">
            <div class="field agent-form-field field-wide">
              <label>變更原因</label>
              <Textarea v-model="form.changeReason" rows="3" auto-resize placeholder="請填寫新增或修改規則的原因" fluid />
            </div>
            <div class="field agent-form-field field-wide">
              <label>內部備註</label>
              <Textarea v-model="form.internalNote" rows="3" auto-resize placeholder="補充審核人需要知道的上下文" fluid />
              <small>內部備註屬敏感資料，正式系統需由後端做欄位級權限控管。</small>
            </div>
          </div>
        </div>
      </SectionCard>

      <div class="sticky-actions agent-sticky-actions">
        <Button label="返回列表" icon="pi pi-arrow-left" severity="secondary" outlined @click="goBack" />
        <Button label="儲存草稿" icon="pi pi-save" severity="secondary" outlined />
        <Button :label="primaryAction" icon="pi pi-check" />
      </div>
    </div>
  </div>
</template>
