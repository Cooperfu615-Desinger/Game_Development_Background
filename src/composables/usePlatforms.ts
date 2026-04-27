// src/composables/usePlatforms.ts
import { ref, watch, onMounted } from 'vue'
import type { Platform } from '@/types/platform'

export function usePlatforms() {
    const platforms = ref<Platform[]>([])
    const loading = ref(false)
    const selectedAggregatorId = ref('agg-001')
    const period = ref<'week' | 'month'>('month')

    const fetchPlatforms = async () => {
        loading.value = true
        try {
            const params = new URLSearchParams({
                aggregatorId: selectedAggregatorId.value,
                period: period.value,
            })
            const res = await fetch(`/api/platforms?${params}`)
            if (!res.ok) return
            const json = await res.json() as { data: Platform[] }
            platforms.value = json.data
        } finally {
            loading.value = false
        }
    }

    watch([selectedAggregatorId, period], () => fetchPlatforms())
    onMounted(fetchPlatforms)

    return {
        platforms,
        loading,
        selectedAggregatorId,
        period,
        fetchPlatforms,
    }
}
