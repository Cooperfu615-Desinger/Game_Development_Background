<script setup lang="ts">
import Tag from 'primevue/tag'
import Skeleton from 'primevue/skeleton'
import type { Aggregator } from '@/types/aggregator'

defineProps<{ aggregator: Aggregator | null; loading: boolean }>()

type Severity = 'success' | 'danger' | 'warn'
const connectionMeta = (s: Aggregator['connectionStatus']): { severity: Severity; label: string } => {
    if (s === 'connected') return { severity: 'success', label: '已連線' }
    if (s === 'disconnected') return { severity: 'danger', label: '離線' }
    return { severity: 'warn', label: '待確認' }
}

const maskKey = (key: string) =>
    key.length > 16 ? key.slice(0, 10) + '••••••••••••' + key.slice(-4) : '••••••••'
</script>

<template>
    <section class="hig-card">
        <header class="hig-card-header">
            <h2 class="hig-card-title">基本資訊 & API 設定</h2>
        </header>
        <div class="hig-card-body">
            <!-- Loading -->
            <div v-if="loading" class="flex flex-col gap-3">
                <Skeleton v-for="i in 6" :key="i" height="1.75rem" />
            </div>

            <!-- Content -->
            <dl v-else-if="aggregator" class="info-grid">
                <div class="info-cell">
                    <dt>聚合商名稱</dt>
                    <dd>{{ aggregator.name }}</dd>
                </div>
                <div class="info-cell">
                    <dt>唯一代碼</dt>
                    <dd><span class="mono">{{ aggregator.code }}</span></dd>
                </div>

                <div class="info-cell">
                    <dt>啟用狀態</dt>
                    <dd>
                        <Tag
                            :severity="aggregator.status === 'active' ? 'success' : 'secondary'"
                            :value="aggregator.status === 'active' ? '啟用中' : '已停用'"
                        />
                    </dd>
                </div>
                <div class="info-cell">
                    <dt>串接狀態</dt>
                    <dd>
                        <Tag
                            :severity="connectionMeta(aggregator.connectionStatus).severity"
                            :value="connectionMeta(aggregator.connectionStatus).label"
                            rounded
                        />
                    </dd>
                </div>

                <div class="info-cell info-cell-wide">
                    <dt>API Endpoint</dt>
                    <dd><span class="mono break-all">{{ aggregator.apiEndpoint }}</span></dd>
                </div>

                <div class="info-cell info-cell-wide">
                    <dt>API Key</dt>
                    <dd><span class="mono text-secondary">{{ maskKey(aggregator.apiKey) }}</span></dd>
                </div>

                <div class="info-cell">
                    <dt>已開放遊戲</dt>
                    <dd>{{ aggregator.gameCount }} / {{ aggregator.totalGames }} 款</dd>
                </div>
                <div class="info-cell">
                    <dt>建立時間</dt>
                    <dd>{{ aggregator.createdAt.slice(0, 10) }}</dd>
                </div>

                <div v-if="aggregator.description" class="info-cell info-cell-wide">
                    <dt>備註</dt>
                    <dd>{{ aggregator.description }}</dd>
                </div>
            </dl>
        </div>
    </section>
</template>

<style scoped>
.info-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem 1.5rem;
    margin: 0;
}

.info-cell {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.625rem 0.875rem;
    background: var(--hig-bg-fill);
    border-radius: var(--hig-radius-md);
    min-width: 0;
}
.info-cell-wide {
    grid-column: span 2;
}

.info-cell dt {
    font-size: 0.75rem;
    color: var(--hig-text-secondary);
    font-weight: 500;
}
.info-cell dd {
    margin: 0;
    color: var(--hig-text-primary);
    font-size: 0.9375rem;
}

.mono {
    font-family: var(--hig-font-mono);
    font-size: 0.8125rem;
}

.text-secondary {
    color: var(--hig-text-secondary);
}

@media (max-width: 640px) {
    .info-grid {
        grid-template-columns: 1fr;
    }
    .info-cell-wide {
        grid-column: span 1;
    }
}
</style>
