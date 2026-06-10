<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import MultiSelect from 'primevue/multiselect';
import ToggleSwitch from 'primevue/toggleswitch';
import SelectButton from 'primevue/selectbutton';
import Button from 'primevue/button';
import SectionCard from '@/components/ui/SectionCard.vue';
import SensitiveValue from '@/components/ui/SensitiveValue.vue';

type FieldType = 'text' | 'select' | 'multi' | 'number' | 'money' | 'percent' | 'switch' | 'mode' | 'secret' | 'textarea';

type PageField = {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
};

type FormSection = {
  title: string;
  fields: PageField[];
};

const router = useRouter();

const irreversible = '正式環境修改錢包 API、RTP、分潤比例、對帳幣別需送審。';

const formSections: FormSection[] = [
  {
    title: '基本資料',
    fields: [
      { key: 'code', label: '商戶代號', type: 'text' },
      { key: 'name', label: '商戶名稱', type: 'text' },
      { key: 'agent', label: '所屬代理', type: 'select', options: ['Asia Master', 'Prime Network', 'Royal Partner'] },
      { key: 'enabled', label: '啟用商戶', type: 'switch' }
    ]
  },
  {
    title: '幣別 / 語系',
    fields: [
      { key: 'currencies', label: '支援幣別', type: 'multi', options: ['USDT', 'USD', 'TWD', 'HKD', 'VND'] },
      { key: 'settlementCurrency', label: '對帳幣別', type: 'select', options: ['USDT', 'USD', 'TWD'] },
      { key: 'languages', label: '支援語系', type: 'multi', options: ['繁體中文', '英文', '泰文', '越南文'] }
    ]
  },
  {
    title: 'API / 錢包',
    fields: [
      { key: 'apiMode', label: '環境模式', type: 'mode', options: ['測試', '正式'] },
      { key: 'walletUrl', label: '錢包 API', type: 'secret' },
      { key: 'timeout', label: '逾時秒數', type: 'number' },
      { key: 'allowRetry', label: '允許重送', type: 'switch' }
    ]
  },
  {
    title: 'RTP / 分潤 / 結算',
    fields: [
      { key: 'rtp', label: '預設 RTP', type: 'percent' },
      { key: 'revenueShare', label: '分潤比例', type: 'percent' },
      { key: 'settlementCycle', label: '結算週期', type: 'select', options: ['日結', '週結', '月結'] }
    ]
  }
];

const form = reactive<Record<string, unknown>>({
  code: 'MER-NEW',
  name: '',
  agent: 'Asia Master',
  enabled: true,
  currencies: ['USDT'],
  settlementCurrency: 'USDT',
  languages: ['繁體中文'],
  apiMode: '測試',
  walletUrl: '',
  timeout: 30,
  allowRetry: true,
  rtp: 96,
  revenueShare: 0,
  settlementCycle: '月結'
});

function options(field: PageField) {
  return field.options ?? [];
}
</script>

<template>
  <div class="form-layout">
    <aside class="anchor-list">
      <a v-for="section in formSections" :key="section.title" :href="`#${section.title}`">{{ section.title }}</a>
    </aside>

    <div class="page-stack">
      <section class="notice-card">
        <i class="pi pi-exclamation-triangle" />
        <span>{{ irreversible }}</span>
      </section>

      <SectionCard v-for="section in formSections" :id="section.title" :key="section.title">
        <template #header>
          <div class="dialog-title-block">
            <h2>{{ section.title }}</h2>
            <p>依規格使用 InputNumber、ToggleSwitch、SelectButton 與 SensitiveValue。</p>
          </div>
        </template>

        <div class="form-grid">
          <div v-for="field in section.fields" :key="field.key" class="field" :class="{ 'field-wide': field.type === 'textarea' }">
            <label>{{ field.label }}</label>
            <InputText v-if="field.type === 'text'" v-model="form[field.key]" fluid />
            <Select v-else-if="field.type === 'select'" v-model="form[field.key]" :options="options(field)" fluid />
            <MultiSelect v-else-if="field.type === 'multi'" v-model="form[field.key]" :options="options(field)" display="chip" fluid />
            <InputNumber v-else-if="field.type === 'number'" v-model="form[field.key]" :min="0" fluid />
            <InputNumber v-else-if="field.type === 'money'" v-model="form[field.key]" mode="currency" currency="USD" locale="en-US" fluid />
            <InputNumber v-else-if="field.type === 'percent'" v-model="form[field.key]" suffix="%" :min="0" :max="100" :max-fraction-digits="2" fluid />
            <ToggleSwitch v-else-if="field.type === 'switch'" v-model="form[field.key]" />
            <SelectButton v-else-if="field.type === 'mode'" v-model="form[field.key]" :options="options(field)" />
            <Textarea v-else-if="field.type === 'textarea'" v-model="form[field.key]" rows="4" fluid />
            <SensitiveValue v-else-if="field.type === 'secret'" value="sensitive-demo-value" />
          </div>
        </div>
      </SectionCard>

      <div class="sticky-actions">
        <Button label="取消" severity="secondary" outlined @click="router.push('/merchants')" />
        <Button label="送出審核" icon="pi pi-check" />
      </div>
    </div>
  </div>
</template>
