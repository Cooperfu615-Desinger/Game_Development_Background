<script setup lang="ts">
/**
 * DataCard — 數據卡片容器
 * 提供統一的卡片結構：標題、操作區、內容區
 *
 * Usage:
 *   <DataCard title="遊戲列表" icon="🎮">
 *     <template #actions>
 *       <button>刷新</button>
 *     </template>
 *     <YourContent />
 *   </DataCard>
 */

interface Props {
  /** 卡片標題 */
  title?: string
  /** 標題前的圖示（emoji 或 icon name） */
  icon?: string
  /** 卡片內邊距 */
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /** 開啟霓虹光暈邊框 */
  glow?: boolean
  /** 是否顯示載入狀態 */
  loading?: boolean
  /** 固定高度（px，0 = 自動） */
  height?: number
  /** 副標題/說明 */
  description?: string
}

const props = withDefaults(defineProps<Props>(), {
  padding: 'md',
  glow:    false,
  loading: false,
  height:  0,
})

const paddingClass = computed(() => ({
  none: 'p-0',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
}[props.padding]))

const cardStyle = computed(() => ({
  height: props.height ? `${props.height}px` : undefined,
}))

import { computed } from 'vue'
</script>

<template>
  <div
    class="ds-card flex flex-col"
    :class="[{ 'ds-card-glow': glow }, 'animate-fade-slide-in']"
    :style="cardStyle"
  >
    <!-- Header -->
    <div
      v-if="title || $slots.actions"
      class="flex items-center justify-between mb-4 flex-shrink-0"
    >
      <div class="flex flex-col gap-0.5 min-w-0">
        <div class="flex items-center gap-2">
          <span v-if="icon" class="text-base leading-none">{{ icon }}</span>
          <h3 class="ds-section-title truncate">{{ title }}</h3>
        </div>
        <p v-if="description" class="text-xs text-[var(--color-text-muted)]">
          {{ description }}
        </p>
      </div>
      <div v-if="$slots.actions" class="flex items-center gap-2 flex-shrink-0 ml-4">
        <slot name="actions" />
      </div>
    </div>

    <!-- Loading overlay -->
    <div
      v-if="loading"
      class="flex-1 flex items-center justify-center min-h-[80px]"
    >
      <div class="loading-spinner" />
    </div>

    <!-- Content -->
    <div
      v-else
      class="flex-1 min-h-0"
      :class="[title || $slots.actions ? '' : paddingClass]"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped>
.loading-spinner {
  width: 28px;
  height: 28px;
  border: 2px solid var(--color-border-default);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
