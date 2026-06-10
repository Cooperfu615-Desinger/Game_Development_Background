<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Timeline from 'primevue/timeline';
import SectionCard from '@/components/ui/SectionCard.vue';
import SensitiveValue from '@/components/ui/SensitiveValue.vue';
import StatusTag from '@/components/ui/StatusTag.vue';
import CurrencyAmount from '@/components/ui/CurrencyAmount.vue';

const route = useRoute();
const { t } = useI18n();

// 路由 meta.title 是 i18n key（menu.*），標題照 demo 格式「{頁面}詳情」
const pageLabel = computed(() => {
  const key = route.meta.title as string | undefined;
  return key ? t(key) : '';
});

const fields = [
  ['代號', String(route.params.id ?? 'DEMO-001')],
  ['名稱', 'Golden Dragon'],
  ['資料範圍', '供應商 / 全部'],
  ['錢包類型', '轉帳錢包'],
  ['對帳幣別', 'USDT'],
  ['API 狀態', '啟用']
];

const relatedRows = [
  { item: '最近注單', count: 128, status: '正常' },
  { item: '錢包交易', count: 402, status: '正常' },
  { item: '風控告警', count: 3, status: '待審核' }
];

const timelineItems = ['建立資料', '設定 API / 錢包', '送審敏感欄位', '審核通過'];
</script>

<template>
  <div class="page-stack">
    <section class="summary-grid">
      <SectionCard><p class="metric-label">狀態</p><StatusTag value="啟用" /></SectionCard>
      <SectionCard><p class="metric-label">本期 GGR</p><CurrencyAmount value="USDT -5,688,600" negative /></SectionCard>
      <SectionCard><p class="metric-label">RTP</p><strong class="metric-value">105.63%</strong></SectionCard>
      <SectionCard><p class="metric-label">敏感欄位</p><SensitiveValue value="sk_live_demo_secret" /></SectionCard>
    </section>

    <SectionCard>
      <template #header>
        <div class="dialog-title-block">
          <h2>{{ pageLabel }}詳情</h2>
          <p>詳情頁不可用 disabled input 假裝欄位；使用 Detail Grid 呈現摘要、敏感資料與關聯紀錄。</p>
        </div>
      </template>

      <div class="detail-grid">
        <div v-for="[label, value] in fields" :key="label">
          <span>{{ label }}</span>
          <strong>{{ value }}</strong>
        </div>
        <div>
          <span>API Key</span>
          <SensitiveValue value="pk_live_supplier_demo_key" />
        </div>
        <div>
          <span>回呼 URL</span>
          <SensitiveValue value="https://wallet.example/callback" />
        </div>
        <div>
          <span>審核規則</span>
          <strong>敏感欄位正式環境修改需送審</strong>
        </div>
      </div>
    </SectionCard>

    <SectionCard>
      <template #header>
        <div class="dialog-title-block">
          <h2>關聯資料</h2>
          <p>未來正式 API 可用同頁 tabs 接注單、交易、報表、操作紀錄。</p>
        </div>
      </template>
      <DataTable :value="relatedRows">
        <Column field="item" header="資料類型" />
        <Column field="count" header="數量" />
        <Column header="狀態">
          <template #body="{ data }">
            <StatusTag :value="data.status" />
          </template>
        </Column>
      </DataTable>
    </SectionCard>

    <SectionCard>
      <template #header>
        <div class="dialog-title-block">
          <h2>操作紀錄</h2>
          <p>操作紀錄不可新增、修改或刪除。</p>
        </div>
      </template>
      <Timeline :value="timelineItems">
        <template #content="{ item }">
          <p class="timeline-title">{{ item }}</p>
          <small>Supplier Admin · 2026-05-19</small>
        </template>
      </Timeline>
    </SectionCard>
  </div>
</template>
