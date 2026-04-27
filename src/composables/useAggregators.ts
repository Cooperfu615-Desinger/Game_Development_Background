import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Aggregator, AggregatorFilter, CreateAggregatorPayload } from '@/types/aggregator'

export function useAggregators() {
    const router = useRouter()
    const aggregators = ref<Aggregator[]>([])
    const total = ref(0)
    const loading = ref(false)
    const creating = ref(false)

    const filters = ref<AggregatorFilter>({
        status: undefined,
        search: '',
        page: 1,
        pageSize: 10,
    })

    // ── 讀取列表 ──────────────────────────────────────────────────────────────
    const fetchAggregators = async () => {
        loading.value = true
        try {
            const params = new URLSearchParams()
            if (filters.value.status) params.set('status', filters.value.status)
            if (filters.value.search) params.set('search', filters.value.search)
            params.set('page', String(filters.value.page))
            params.set('pageSize', String(filters.value.pageSize))

            const res = await fetch(`/api/aggregators?${params}`)
            const json = await res.json() as { data: Aggregator[]; total: number }
            aggregators.value = json.data
            total.value = json.total
        } finally {
            loading.value = false
        }
    }

    // ── 切換啟用狀態 ──────────────────────────────────────────────────────────
    const toggleStatus = async (id: string, currentStatus: Aggregator['status']) => {
        const newStatus: Aggregator['status'] = currentStatus === 'active' ? 'inactive' : 'active'
        // 樂觀更新
        aggregators.value = aggregators.value.map(a =>
            a.id === id ? { ...a, status: newStatus } : a
        )
        await fetch(`/api/aggregators/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        })
    }

    // ── 新增聚合商 ────────────────────────────────────────────────────────────
    const createAggregator = async (payload: CreateAggregatorPayload): Promise<boolean> => {
        creating.value = true
        try {
            const res = await fetch('/api/aggregators', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            if (!res.ok) return false
            const newAgg = await res.json() as Aggregator
            // 導向詳情頁
            await router.push(`/aggregators/${newAgg.id}`)
            return true
        } finally {
            creating.value = false
        }
    }

    // ── 重置篩選 ──────────────────────────────────────────────────────────────
    const resetFilters = () => {
        filters.value = { status: undefined, search: '', page: 1, pageSize: 10 }
    }

    watch(filters, () => fetchAggregators(), { deep: true })
    onMounted(fetchAggregators)

    return {
        aggregators, total, loading, creating,
        filters, fetchAggregators, toggleStatus, createAggregator, resetFilters,
    }
}
