import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import Big from 'big.js'
import { exportToCSV } from '@/utils/csvExport'
import type {
    Settlement, SettlementFilter,
    Transaction, TransactionFilter,
    Invoice, InvoiceFilter
} from '@/types/finance'

// ── 結算報表 ───────────────────────────────────────
export function useSettlements() {
    const route = useRoute()
    const router = useRouter()

    const settlements = ref<Settlement[]>([])
    const total = ref(0)
    const loading = ref(false)

    const filters = ref<SettlementFilter>({
        startDate: null,
        endDate: null,
        status: (route.query.status as SettlementFilter['status']) ?? undefined,
        page: Number(route.query.page ?? 1),
        pageSize: 20
    })

    const syncToUrl = () => {
        const query: Record<string, string> = {}
        if (filters.value.status) query.status = filters.value.status
        if (filters.value.page > 1) query.page = String(filters.value.page)
        router.replace({ query })
    }

    const fetch = async () => {
        loading.value = true
        try {
            const params = new URLSearchParams()
            params.set('page', String(filters.value.page))
            params.set('limit', String(filters.value.pageSize))
            if (filters.value.status) params.set('status', filters.value.status)
            if (filters.value.startDate) params.set('startDate', filters.value.startDate)
            if (filters.value.endDate) params.set('endDate', filters.value.endDate)
            const res = await window.fetch(`/api/finance/settlements?${params}`)
            const json = await res.json()
            settlements.value = json.data.items
            total.value = json.data.total
        } finally {
            loading.value = false
        }
    }

    // 使用 big.js 計算總計
    const totalNetAmount = () =>
        settlements.value
            .reduce((acc, s) => acc.plus(new Big(s.netAmount)), new Big(0))
            .toFixed(2)

    watch(filters, () => { syncToUrl(); fetch() }, { deep: true, immediate: true })

    return { settlements, total, loading, filters, totalNetAmount, refetch: fetch }
}

// ── 交易記錄 ───────────────────────────────────────
export function useTransactions() {
    const route = useRoute()
    const router = useRouter()
    const message = useMessage()

    const transactions = ref<Transaction[]>([])
    const total = ref(0)
    const loading = ref(false)

    const filters = ref<TransactionFilter>({
        betId: (route.query.betId as string) ?? '',
        playerId: (route.query.playerId as string) ?? '',
        gameId: '',
        currency: undefined,
        startDate: null,
        endDate: null,
        page: Number(route.query.page ?? 1),
        pageSize: 20
    })

    const syncToUrl = () => {
        const query: Record<string, string> = {}
        if (filters.value.betId) query.betId = filters.value.betId
        if (filters.value.playerId) query.playerId = filters.value.playerId
        if (filters.value.page > 1) query.page = String(filters.value.page)
        router.replace({ query })
    }

    const fetch = async () => {
        loading.value = true
        try {
            const params = new URLSearchParams()
            params.set('page', String(filters.value.page))
            params.set('limit', String(filters.value.pageSize))
            if (filters.value.betId) params.set('betId', filters.value.betId)
            if (filters.value.playerId) params.set('playerId', filters.value.playerId)
            if (filters.value.currency) params.set('currency', filters.value.currency)
            const res = await window.fetch(`/api/finance/transactions?${params}`)
            const json = await res.json()
            transactions.value = json.data.items
            total.value = json.data.total
        } finally {
            loading.value = false
        }
    }

    const exportCSV = () => {
        if (!transactions.value.length) return
        exportToCSV(transactions.value, 'transactions-export', {
            id: 'ID', betId: 'Bet ID', playerId: '玩家 ID', playerName: '玩家名稱',
            gameName: '遊戲', type: '類型', amount: '金額', currency: '幣別', createdAt: '時間'
        })
        message.success('CSV 已匯出')
    }

    watch(filters, () => { syncToUrl(); fetch() }, { deep: true, immediate: true })

    return { transactions, total, loading, filters, exportCSV, refetch: fetch }
}

// ── 發票管理 ───────────────────────────────────────
export function useInvoices() {
    const route = useRoute()
    const router = useRouter()

    const invoices = ref<Invoice[]>([])
    const total = ref(0)
    const loading = ref(false)

    const filters = ref<InvoiceFilter>({
        status: (route.query.status as InvoiceFilter['status']) ?? undefined,
        page: Number(route.query.page ?? 1),
        pageSize: 20
    })

    const syncToUrl = () => {
        const query: Record<string, string> = {}
        if (filters.value.status) query.status = filters.value.status
        if (filters.value.page > 1) query.page = String(filters.value.page)
        router.replace({ query })
    }

    const fetch = async () => {
        loading.value = true
        try {
            const params = new URLSearchParams()
            params.set('page', String(filters.value.page))
            params.set('limit', String(filters.value.pageSize))
            if (filters.value.status) params.set('status', filters.value.status)
            const res = await window.fetch(`/api/finance/invoices?${params}`)
            const json = await res.json()
            invoices.value = json.data.items
            total.value = json.data.total
        } finally {
            loading.value = false
        }
    }

    watch(filters, () => { syncToUrl(); fetch() }, { deep: true, immediate: true })

    return { invoices, total, loading, filters, refetch: fetch }
}
