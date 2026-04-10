<script setup lang="ts">
/**
 * StatusBadge — 狀態標籤組件
 * 支援 5 種業務狀態，帶發光圓點指示器
 *
 * Usage:
 *   <StatusBadge status="online" />
 *   <StatusBadge status="offline" label="已下架" />
 *   <StatusBadge status="pending" :dot="false" />
 */

import { computed } from 'vue'

type StatusType = 'online' | 'offline' | 'error' | 'pending' | 'info'

interface Props {
  status: StatusType
  /** 自定義顯示文字（不填則用預設） */
  label?: string
  /** 是否顯示圓點指示器 */
  dot?: boolean
  /** 尺寸 */
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  dot:  true,
  size: 'md',
})

const defaultLabels: Record<StatusType, string> = {
  online:  '上架中',
  offline: '已下架',
  error:   '異常',
  pending: '待審核',
  info:    '信息',
}

const displayLabel = computed(() => props.label ?? defaultLabels[props.status])

const statusConfig = computed(() => ({
  online: {
    bg:     'var(--color-status-online-bg)',
    border: 'var(--color-status-online-border)',
    text:   'var(--color-status-online)',
    dot:    '#10B981',
    glow:   'rgba(16, 185, 129, 0.5)',
  },
  offline: {
    bg:     'var(--color-status-offline-bg)',
    border: 'var(--color-status-offline-border)',
    text:   'var(--color-status-offline)',
    dot:    '#6B7280',
    glow:   'transparent',
  },
  error: {
    bg:     'var(--color-status-error-bg)',
    border: 'var(--color-status-error-border)',
    text:   'var(--color-status-error)',
    dot:    '#EF4444',
    glow:   'rgba(239, 68, 68, 0.5)',
  },
  pending: {
    bg:     'var(--color-status-pending-bg)',
    border: 'var(--color-status-pending-border)',
    text:   'var(--color-status-pending)',
    dot:    '#F59E0B',
    glow:   'rgba(245, 158, 11, 0.5)',
  },
  info: {
    bg:     'var(--color-status-info-bg)',
    border: 'var(--color-status-info-border)',
    text:   'var(--color-status-info)',
    dot:    '#3B82F6',
    glow:   'rgba(59, 130, 246, 0.5)',
  },
}[props.status]))

const sizeClass = computed(() => ({
  sm: 'px-2 py-0.5 text-[11px] gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
}[props.size]))
</script>

<template>
  <span
    class="inline-flex items-center rounded-tag border font-medium whitespace-nowrap"
    :class="sizeClass"
    :style="{
      background:   statusConfig.bg,
      borderColor:  statusConfig.border,
      color:        statusConfig.text,
    }"
  >
    <!-- 指示圓點 -->
    <span
      v-if="dot"
      class="dot-indicator"
      :style="{
        background:  statusConfig.dot,
        boxShadow:   `0 0 6px ${statusConfig.glow}`,
      }"
      :class="{ 'dot-pulse': status === 'online' || status === 'pending' }"
    />
    {{ displayLabel }}
  </span>
</template>

<style scoped>
.dot-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-pulse {
  animation: dotPulse 2s ease-in-out infinite;
}

@keyframes dotPulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}
</style>
