<script setup lang="ts">
/**
 * Design System Showcase Page
 * 色板、組件、排版的視覺預覽頁面
 * 路由：/design-system（開發環境專用）
 */

import { ref } from 'vue'
import StatCard    from '@/components/ui/StatCard.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import TrendValue  from '@/components/ui/TrendValue.vue'
import DataCard    from '@/components/ui/DataCard.vue'

const mockLoading = ref(false)
function toggleLoading() {
  mockLoading.value = true
  setTimeout(() => { mockLoading.value = false }, 2000)
}

const colors = [
  { label: 'primary-400', hex: '#00D4FF', dark: false },
  { label: 'primary-500', hex: '#00AACC', dark: false },
  { label: 'primary-600', hex: '#007A99', dark: false },
  { label: 'primary-900', hex: '#001A26', dark: true  },
  { label: 'accent-500',  hex: '#A855F7', dark: false },
  { label: 'accent-600',  hex: '#9333EA', dark: false },
  { label: 'neutral-50',  hex: '#E8F4FD', dark: false },
  { label: 'neutral-400', hex: '#8FA3BE', dark: false },
  { label: 'neutral-800', hex: '#1A2236', dark: true  },
  { label: 'neutral-850', hex: '#141B2D', dark: true  },
  { label: 'neutral-900', hex: '#0F1525', dark: true  },
  { label: 'neutral-950', hex: '#0A0E1A', dark: true  },
]

const statusColors = [
  { status: 'online'  as const, hex: '#10B981' },
  { status: 'offline' as const, hex: '#6B7280' },
  { status: 'error'   as const, hex: '#EF4444' },
  { status: 'pending' as const, hex: '#F59E0B' },
  { status: 'info'    as const, hex: '#3B82F6' },
]

const chartColors = [
  '#00D4FF', '#A855F7', '#10B981',
  '#F59E0B', '#EF4444', '#3B82F6',
  '#EC4899', '#14B8A6',
]
</script>

<template>
  <div class="min-h-screen p-8 space-y-12" style="background: var(--color-bg-base);">
    <div>
      <h1 class="text-h1 text-[var(--color-text-primary)] mb-1">Design System</h1>
      <p class="text-sm text-[var(--color-text-muted)]">
        Game Developer Dashboard — 現代科幻風格設計規範預覽
      </p>
    </div>

    <!-- ─── 色板 ─────────────────────────────── -->
    <section>
      <h2 class="text-h3 text-[var(--color-text-primary)] mb-4">品牌色板</h2>
      <div class="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-3">
        <div
          v-for="c in colors"
          :key="c.label"
          class="rounded-card overflow-hidden border border-[var(--color-border-subtle)]"
        >
          <div
            class="h-16 w-full"
            :style="{ background: c.hex }"
          />
          <div class="p-2 bg-[var(--color-bg-card)]">
            <div class="text-[11px] font-mono text-[var(--color-text-muted)]">{{ c.label }}</div>
            <div class="text-[11px] font-mono text-[var(--color-text-secondary)]">{{ c.hex }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 狀態色 -->
    <section>
      <h2 class="text-h3 text-[var(--color-text-primary)] mb-4">狀態色</h2>
      <div class="flex flex-wrap gap-4">
        <div
          v-for="s in statusColors"
          :key="s.status"
          class="flex items-center gap-3"
        >
          <div class="w-12 h-12 rounded-card" :style="{ background: s.hex }" />
          <div>
            <div class="text-xs font-mono text-[var(--color-text-muted)]">{{ s.status }}</div>
            <div class="text-xs font-mono text-[var(--color-text-secondary)]">{{ s.hex }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 圖表色 -->
    <section>
      <h2 class="text-h3 text-[var(--color-text-primary)] mb-4">圖表顏色集</h2>
      <div class="flex gap-2">
        <div
          v-for="(hex, i) in chartColors"
          :key="i"
          class="flex flex-col items-center gap-2"
        >
          <div class="w-10 h-10 rounded-md" :style="{ background: hex }" />
          <span class="text-[10px] font-mono text-[var(--color-text-muted)]">{{ i + 1 }}</span>
        </div>
      </div>
    </section>

    <!-- ─── StatCard ────────────────────────── -->
    <section>
      <h2 class="text-h3 text-[var(--color-text-primary)] mb-4">StatCard 統計卡片</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="本月 GGR"
          :value="28472930"
          prefix="NT$"
          :trend="12.4"
          icon="💰"
          format="currency"
          variant="primary"
        />
        <StatCard
          label="活躍玩家 (DAU)"
          :value="84921"
          suffix="人"
          :trend="-3.2"
          icon="👥"
          format="number"
        />
        <StatCard
          label="平均留存率"
          :value="68.5"
          :trend="5.1"
          icon="📊"
          format="percent"
          :decimals="1"
          variant="accent"
        />
        <StatCard
          label="上架遊戲數"
          :value="47"
          suffix="款"
          icon="🎮"
          format="raw"
          subtext="含測試版 12 款"
        />
      </div>
    </section>

    <!-- ─── StatusBadge ──────────────────────── -->
    <section>
      <h2 class="text-h3 text-[var(--color-text-primary)] mb-4">StatusBadge 狀態標籤</h2>
      <div class="flex flex-wrap gap-3">
        <StatusBadge status="online" />
        <StatusBadge status="offline" />
        <StatusBadge status="error" />
        <StatusBadge status="pending" />
        <StatusBadge status="info" label="排程中" />
        <StatusBadge status="online" label="審核通過" size="sm" />
        <StatusBadge status="pending" label="待上架" :dot="false" />
      </div>
    </section>

    <!-- ─── TrendValue ───────────────────────── -->
    <section>
      <h2 class="text-h3 text-[var(--color-text-primary)] mb-4">TrendValue 趨勢值</h2>
      <div class="flex flex-wrap gap-6 items-center">
        <TrendValue :value="12.4" size="xs" />
        <TrendValue :value="12.4" size="sm" show-label />
        <TrendValue :value="12.4" size="md" show-label />
        <TrendValue :value="-8.2" size="sm" show-label />
        <TrendValue :value="0" size="sm" show-label />
        <TrendValue :value="5.3" size="sm" inverse show-label label="成本降低" />
      </div>
    </section>

    <!-- ─── DataCard ─────────────────────────── -->
    <section>
      <h2 class="text-h3 text-[var(--color-text-primary)] mb-4">DataCard 資料卡片容器</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DataCard title="預設卡片" icon="📋">
          <p class="text-sm text-[var(--color-text-muted)]">
            這是卡片內容區，可放入任何組件。
          </p>
        </DataCard>

        <DataCard title="帶操作按鈕" icon="⚙️">
          <template #actions>
            <button class="ds-btn-ghost text-xs h-7 px-3">刷新</button>
          </template>
          <p class="text-sm text-[var(--color-text-muted)]">帶操作按鈕的卡片。</p>
        </DataCard>

        <DataCard
          title="載入狀態"
          icon="⏳"
          :loading="mockLoading"
          description="點擊按鈕觸發載入"
        >
          <template #actions>
            <button class="ds-btn-primary text-xs h-7 px-3" @click="toggleLoading">
              觸發載入
            </button>
          </template>
          <p class="text-sm text-[var(--color-text-muted)]">正常內容在此。</p>
        </DataCard>
      </div>
    </section>

    <!-- ─── Buttons ──────────────────────────── -->
    <section>
      <h2 class="text-h3 text-[var(--color-text-primary)] mb-4">按鈕</h2>
      <div class="flex flex-wrap gap-3 items-center">
        <button class="ds-btn-primary">主要按鈕</button>
        <button class="ds-btn-secondary">次要按鈕</button>
        <button class="ds-btn-ghost">幽靈按鈕</button>
        <button class="ds-btn-danger">危險操作</button>
      </div>
    </section>

    <!-- ─── Typography ───────────────────────── -->
    <section>
      <h2 class="text-h3 text-[var(--color-text-primary)] mb-4">排版系統</h2>
      <div class="ds-card space-y-3">
        <p class="ds-stat-number">2,847,293</p>
        <p class="text-h1 text-[var(--color-text-primary)]">H1 頁面標題 28px/700</p>
        <p class="text-h2 text-[var(--color-text-primary)]">H2 模塊標題 22px/600</p>
        <p class="text-h3 text-[var(--color-text-primary)]">H3 卡片標題 18px/600</p>
        <p class="text-h4 text-[var(--color-text-secondary)]">H4 小標題 15px/600</p>
        <p class="text-body text-[var(--color-text-secondary)]">Body 正文 14px/400 — 玩家在平台上消費的遊戲點數和儲值行為</p>
        <p class="text-sm text-[var(--color-text-muted)]">SM 輔助文字 13px — 上次更新：2026-04-10 14:30</p>
        <p class="ds-label">LABEL 標籤文字</p>
        <hr class="ds-divider" />
        <p class="ds-text-glow text-h2">霓虹光暈文字效果</p>
      </div>
    </section>
  </div>
</template>
