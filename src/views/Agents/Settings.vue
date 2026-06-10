<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import MultiSelect from 'primevue/multiselect';
import SelectButton from 'primevue/selectbutton';
import ToggleSwitch from 'primevue/toggleswitch';
import DatePicker from 'primevue/datepicker';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import SectionCard from '@/components/ui/SectionCard.vue';
import SensitiveValue from '@/components/ui/SensitiveValue.vue';

type AgentFieldType =
  | 'text'
  | 'select'
  | 'multi'
  | 'number'
  | 'money'
  | 'percent'
  | 'switch'
  | 'mode'
  | 'textarea'
  | 'secret'
  | 'datetime';

type AgentField = {
  key: string;
  label: string;
  type: AgentFieldType;
  options?: string[];
  helper?: string;
  wide?: boolean;
};

type AgentSection = {
  id: string;
  title: string;
  description: string;
  icon: string;
  fields: AgentField[];
};

const router = useRouter();

const form = reactive<Record<string, unknown>>({
  code: 'AG-006',
  name: '',
  parentAgent: '無',
  status: '啟用',
  enabled: true,
  testMode: false,
  commissionType: 'GGR 分潤',
  commissionRate: 8,
  tieredCommission: false,
  tier1Rate: 5,
  tier2Rate: 8,
  effectiveAt: null,
  settlementCurrency: 'USDT',
  reconciliationCurrency: 'USDT',
  settlementCycle: '月結',
  minimumSettlementAmount: 1000,
  timezone: 'Asia/Taipei',
  fxSource: '系統參考匯率',
  dataScope: '代理底下商戶',
  visibleMerchants: ['Golden Dragon', 'LuckyPlay'],
  reportScope: '商戶與代理報表',
  gameCategories: ['老虎機', '桌遊'],
  viewPlayerId: true,
  viewSensitiveFields: false,
  allowSubAgents: true,
  allowMerchantBinding: true,
  merchantLimit: 20,
  merchantApprovalRequired: true,
  apiDocAccess: true,
  merchantApiAccess: false,
  ipWhitelist: '',
  callbackAccess: false,
  contactName: '',
  contactEmail: '',
  financeContact: '',
  techContact: '',
  internalNote: '',
  changeReason: ''
});

const agentSections: AgentSection[] = [
  {
    id: 'basic',
    title: '基本資料',
    description: '建立代理識別、上級關係與啟用狀態。',
    icon: 'pi pi-id-card',
    fields: [
      { key: 'code', label: '代理代號', type: 'text', helper: '正式建立後不建議修改。' },
      { key: 'name', label: '代理名稱', type: 'text' },
      { key: 'parentAgent', label: '上級代理', type: 'select', options: ['無', 'AG-001 星河代理', 'AG-003 Global Partner'] },
      { key: 'status', label: '代理狀態', type: 'select', options: ['啟用', '測試中', '待審核', '停用'] },
      { key: 'enabled', label: '啟用代理', type: 'switch', helper: '停用不會刪除資料，只停止後續營運操作。' },
      { key: 'testMode', label: '測試模式', type: 'switch' }
    ]
  },
  {
    id: 'commission',
    title: '佣金設定',
    description: '設定代理分潤方式、比例與生效時間，正式異動需送審。',
    icon: 'pi pi-percentage',
    fields: [
      { key: 'commissionType', label: '佣金類型', type: 'select', options: ['GGR 分潤', '流水', '固定'] },
      { key: 'commissionRate', label: '佣金比例', type: 'percent', helper: '正式環境修改需建立審核單。' },
      { key: 'tieredCommission', label: '啟用階梯佣金', type: 'switch' },
      { key: 'tier1Rate', label: '第一級比例', type: 'percent' },
      { key: 'tier2Rate', label: '第二級比例', type: 'percent' },
      { key: 'effectiveAt', label: '生效時間', type: 'datetime' }
    ]
  },
  {
    id: 'settlement',
    title: '結算設定',
    description: '設定結算幣別、週期、門檻與匯率來源。',
    icon: 'pi pi-wallet',
    fields: [
      { key: 'settlementCurrency', label: '結算幣別', type: 'select', options: ['USDT', 'USD', 'TWD'] },
      { key: 'reconciliationCurrency', label: '對帳幣別', type: 'select', options: ['USDT', 'USD', 'TWD'] },
      { key: 'settlementCycle', label: '結算週期', type: 'select', options: ['日結', '週結', '月結'] },
      { key: 'minimumSettlementAmount', label: '最小結算金額', type: 'money' },
      { key: 'timezone', label: '結算時區', type: 'select', options: ['Asia/Taipei', 'UTC', 'Asia/Bangkok'] },
      { key: 'fxSource', label: '匯率來源', type: 'select', options: ['系統參考匯率', '人工覆核匯率', '商戶合約匯率'] }
    ]
  },
  {
    id: 'scope',
    title: '資料範圍',
    description: '定義代理可查看的商戶、遊戲、報表與敏感欄位。',
    icon: 'pi pi-shield',
    fields: [
      { key: 'dataScope', label: 'dataScope', type: 'select', options: ['代理底下商戶', '指定商戶', '僅報表'] },
      { key: 'visibleMerchants', label: '可查看商戶', type: 'multi', options: ['Golden Dragon', 'LuckyPlay', 'Nova Gaming', 'Royal H5'] },
      { key: 'gameCategories', label: '遊戲類型', type: 'multi', options: ['老虎機', '桌遊', '真人', '街機'] },
      { key: 'reportScope', label: '報表範圍', type: 'select', options: ['商戶與代理報表', '僅商戶報表', '僅佣金摘要'] },
      { key: 'viewPlayerId', label: '可查看玩家 ID', type: 'switch' },
      { key: 'viewSensitiveFields', label: '可查看敏感欄位', type: 'switch', helper: '玩家 IP、分潤比例與內部備註屬敏感欄位。' }
    ]
  },
  {
    id: 'permission',
    title: '商戶與下級代理',
    description: '控制代理是否能建立下級代理、綁定商戶與觸發審核。',
    icon: 'pi pi-sitemap',
    fields: [
      { key: 'allowSubAgents', label: '允許建立下級代理', type: 'switch' },
      { key: 'allowMerchantBinding', label: '允許綁定商戶', type: 'switch' },
      { key: 'merchantLimit', label: '最大商戶數', type: 'number' },
      { key: 'merchantApprovalRequired', label: '商戶綁定需審核', type: 'switch' },
      { key: 'apiDocAccess', label: '可下載 API 文件', type: 'switch' },
      { key: 'merchantApiAccess', label: '可查看商戶 API', type: 'switch' }
    ]
  },
  {
    id: 'contact',
    title: '聯絡人與備註',
    description: '維護營運、財務、技術聯絡方式與此次變更原因。',
    icon: 'pi pi-address-book',
    fields: [
      { key: 'contactName', label: '主要聯絡人', type: 'text' },
      { key: 'contactEmail', label: '電子信箱', type: 'text' },
      { key: 'financeContact', label: '財務聯絡人', type: 'text' },
      { key: 'techContact', label: '技術聯絡人', type: 'text' },
      { key: 'internalNote', label: '內部備註', type: 'secret' },
      { key: 'changeReason', label: '變更原因', type: 'textarea', wide: true }
    ]
  }
];

const reviewItems = [
  '佣金比例',
  '結算幣別',
  '對帳幣別',
  '匯率來源',
  'dataScope',
  '停用代理'
];

function options(field: AgentField) {
  return field.options ?? [];
}
</script>

<template>
  <div class="form-layout agent-settings-layout">
    <aside class="anchor-list agent-anchor-list">
      <a v-for="section in agentSections" :key="section.id" :href="`#${section.id}`">
        <i :class="section.icon" />
        <span>{{ section.title }}</span>
      </a>
    </aside>

    <div class="page-stack agent-settings-page">
      <section class="agent-review-strip">
        <div>
          <strong>審核規則</strong>
          <p>代理不可硬刪除；正式環境修改商業條件、結算與資料範圍時，需送審並保留操作紀錄。</p>
        </div>
        <div class="review-chip-list">
          <Tag v-for="item in reviewItems" :key="item" :value="item" severity="warn" />
        </div>
      </section>

      <SectionCard v-for="section in agentSections" :id="section.id" :key="section.id" class="agent-form-card">
        <template #header>
          <div class="agent-section-title">
            <span class="agent-section-icon"><i :class="section.icon" /></span>
            <div class="dialog-title-block">
              <h2>{{ section.title }}</h2>
              <p>{{ section.description }}</p>
            </div>
          </div>
        </template>

        <div class="agent-form-grid">
          <div
            v-for="field in section.fields"
            :key="field.key"
            class="field agent-form-field"
            :class="{ 'field-wide': field.wide || field.type === 'textarea' || field.type === 'multi' }"
          >
            <label>{{ field.label }}</label>
            <InputText v-if="field.type === 'text'" v-model="form[field.key]" fluid />
            <Select v-else-if="field.type === 'select'" v-model="form[field.key]" :options="options(field)" fluid />
            <MultiSelect v-else-if="field.type === 'multi'" v-model="form[field.key]" :options="options(field)" display="chip" fluid />
            <InputNumber v-else-if="field.type === 'number'" v-model="form[field.key]" :min="0" fluid />
            <InputNumber v-else-if="field.type === 'money'" v-model="form[field.key]" mode="currency" currency="USD" locale="en-US" :min="0" fluid />
            <InputNumber v-else-if="field.type === 'percent'" v-model="form[field.key]" suffix="%" :min="0" :max="100" :max-fraction-digits="2" fluid />
            <ToggleSwitch v-else-if="field.type === 'switch'" v-model="form[field.key]" />
            <SelectButton v-else-if="field.type === 'mode'" v-model="form[field.key]" :options="options(field)" />
            <DatePicker v-else-if="field.type === 'datetime'" v-model="form[field.key]" show-icon show-time show-seconds hour-format="24" date-format="yy-mm-dd" fluid />
            <Textarea v-else-if="field.type === 'textarea'" v-model="form[field.key]" rows="4" fluid />
            <SensitiveValue v-else-if="field.type === 'secret'" value="internal-note-visible-after-approval" />
            <small v-if="field.helper">{{ field.helper }}</small>
          </div>
        </div>
      </SectionCard>

      <div class="sticky-actions agent-sticky-actions">
        <Button label="取消" severity="secondary" outlined @click="router.push('/agents')" />
        <Button label="儲存草稿" icon="pi pi-save" severity="secondary" outlined />
        <Button label="送出審核" icon="pi pi-check" />
      </div>
    </div>
  </div>
</template>
