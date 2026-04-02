<script setup lang="ts">
import { ref, onMounted, computed, h, reactive } from 'vue'
import { 
    NCard, NDataTable, NTag, NButton, useMessage, NSpace, NSwitch, 
    NModal, NForm, NFormItem, NInput, NInputNumber, NSlider, NPopover, NIcon
} from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { 
    AddOutlined, EditOutlined, LinkOutlined, AccountBalanceWalletOutlined, 
    SearchOutlined 
} from '@vicons/material'
import type { Agent } from '../../../types/agent'

const { t } = useI18n()
const message = useMessage()

// State
const list = ref<Agent[]>([])
const loading = ref(false)
const searchAccount = ref('')

// Modals
const showAgentModal = ref(false)
const agentModalMode = ref<'create' | 'edit'>('create')
const agentForm = reactive({
    id: 0,
    account: '',
    password: '',
    commission_rate: 30,
    status: true, // true = active, false = disabled
    note: ''
})

const showTransferModal = ref(false)
const transferForm = reactive({
    targetId: 0,
    targetName: '',
    currentBalance: 0, // Agent's balance
    amount: 0,
    type: 'deposit' as 'deposit' | 'withdraw' // deposit = transfer into agent
})
const transferring = ref(false)
const submitting = ref(false)

const agentModalTitle = computed(() => {
    return agentModalMode.value === 'create' 
        ? t('merchant.agent.createTitle') 
        : t('merchant.agent.editTitle')
})

// Columns
// Columns
const columns = computed(() => [
    { title: 'ID', key: 'id', width: 80, sorter: 'default' as const },
    { 
        title: t('merchant.agent.account'), 
        key: 'account',
        width: 160,
        sorter: 'default' as const,
        render: (row: Agent) => h('div', { class: 'font-bold' }, row.account)
    },
    { 
        title: t('merchant.agent.playerCount'), 
        key: 'player_count',
        sorter: 'default' as const,
        render: (row: Agent) => row.player_count?.toLocaleString() || 0
    },
    { 
        title: t('merchant.agent.monthlyPerformance'), 
        key: 'monthly_performance',
        sorter: 'default' as const,
        render: (row: Agent) => row.monthly_performance ? row.monthly_performance.toLocaleString() : '0'
    },
    { 
        title: t('merchant.agent.commissionRate'), 
        key: 'commission_rate',
        sorter: 'default' as const,
        render: (row: Agent) => h(NTag, { type: 'info', bordered: false }, { default: () => `${row.commission_rate ?? row.percent ?? 0}%` })
    },
    { 
        title: t('merchant.agent.balance'), 
        key: 'balance',
        sorter: 'default' as const,
        render: (row: Agent) => h('span', { class: 'font-mono' }, row.balance.toLocaleString())
    },
    { 
        title: t('merchant.agent.status'), 
        key: 'status',
        width: 140,
        render: (row: Agent) => h('div', { class: 'flex items-center gap-2' }, [
            h(NSwitch, {
                value: row.state === 'active',
                size: 'small',
                onUpdateValue: (val) => handleStatusChange(row, val)
            }),
            h('span', { class: 'text-xs text-gray-400' }, row.state === 'active' ? t('common.enabled') : t('common.disabled')) 
        ])
    },
    { 
        title: t('merchant.agent.actions'), 
        key: 'actions',
        width: 180,
        render: (row: Agent) => h(NSpace, { size: 'small' }, {
            default: () => [
                h(NButton, { 
                    size: 'small', secondary: true, type: 'warning',
                    onClick: () => openTransfer(row)
                }, { icon: () => h(AccountBalanceWalletOutlined) }),
                h(NButton, { 
                    size: 'small', secondary: true, type: 'primary',
                    onClick: () => openEdit(row)
                }, { icon: () => h(EditOutlined) }),
                h(NPopover, { trigger: 'click', placement: 'bottom' }, {
                    trigger: () => h(NButton, { size: 'small', secondary: true }, { icon: () => h(LinkOutlined) }),
                    default: () => h('div', { class: 'p-2 flex gap-2 items-center bg-[#18181c] rounded border border-gray-700' }, [
                        h('span', { class: 'text-gray-200 px-2 py-1 text-xs break-all' }, 
                            `https://platform.com/r/${row.promotion_code || 'REF' + row.id}`
                        ),
                        h(NButton, { 
                            size: 'tiny', type: 'primary',
                            onClick: () => copyLink(`https://platform.com/r/${row.promotion_code || 'REF' + row.id}`)
                        }, { default: () => t('merchant.agent.copySuccess') })
                    ])
                })
            ]
        })
    }
])

// Actions
const fetchData = async () => {
    loading.value = true
    try {
        const res = await fetch('/api/v2/agent/sub-agents')
        const data = await res.json()
        if (data.code === 0) {
            list.value = data.data.list
        }
    } finally {
        loading.value = false
    }
}

const handleStatusChange = async (row: Agent, active: boolean) => {
    // Optimistic Update
    const oldState = row.state
    row.state = active ? 'active' : 'disabled'
    try {
        await fetch(`/api/v2/merchant/agents/${row.id}`, {
            method: 'PUT',
            body: JSON.stringify({ state: row.state })
        })
        message.success(t('common.success'))
    } catch (e) {
        row.state = oldState
        message.error(t('common.failed'))
    }
}

const copyLink = (url: string) => {
    navigator.clipboard.writeText(url)
    message.success(t('merchant.agent.copySuccess'))
}

// Modal Handlers
const openCreate = () => {
    agentModalMode.value = 'create'
    agentForm.id = 0
    agentForm.account = ''
    agentForm.password = ''
    agentForm.commission_rate = 30
    agentForm.status = true
    agentForm.note = ''
    showAgentModal.value = true
}

const openEdit = (row: Agent) => {
    agentModalMode.value = 'edit'
    agentForm.id = row.id
    agentForm.account = row.account
    agentForm.commission_rate = row.commission_rate ?? row.percent ?? 30
    agentForm.status = row.state === 'active'
    agentForm.note = row.description || ''
    showAgentModal.value = true
}

const submitAgent = async () => {
    if (agentModalMode.value === 'create' && !agentForm.account) {
        message.error(t('form.required', { field: t('merchant.agent.account') }))
        return
    }
    
    submitting.value = true
    try {
        const url = agentModalMode.value === 'create' 
            ? '/api/v2/merchant/agents' 
            : `/api/v2/merchant/agents/${agentForm.id}`
        
        const method = agentModalMode.value === 'create' ? 'POST' : 'PUT'
        
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...agentForm,
                state: agentForm.status ? 'active' : 'disabled'
            })
        })
        
        const json = await res.json()
        if (json.code === 0) {
            message.success(t('common.success'))
            showAgentModal.value = false
            fetchData()
        } else {
            message.error(json.msg)
        }
    } finally {
        submitting.value = false
    }
}

const openTransfer = (row: Agent) => {
    transferForm.targetId = row.id
    transferForm.targetName = row.account
    transferForm.currentBalance = row.balance
    transferForm.amount = 0
    transferForm.type = 'deposit'
    showTransferModal.value = true
}

const submitTransfer = async () => {
    if (transferForm.amount <= 0) {
        message.warning(t('merchant.agent.transferAmount') + ' > 0')
        return
    }
    
    transferring.value = true
    try {
        const res = await fetch(`/api/v2/merchant/agents/${transferForm.targetId}/transfer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: transferForm.amount,
                type: transferForm.type
            })
        })
        const json = await res.json()
        if (json.code === 0) {
            message.success(t('common.success'))
            showTransferModal.value = false
            fetchData()
        } else {
            message.error(json.msg)
        }
    } finally {
        transferring.value = false
    }
}

onMounted(fetchData)
</script>

<template>
    <div class="p-6 space-y-4">
        <!-- Header -->
        <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold flex items-center gap-2">
                {{ t('merchant.agent.title') }}
            </h1>
            <div class="flex gap-2">
                <NInput v-model:value="searchAccount" :placeholder="t('merchant.agent.account')" class="w-48">
                    <template #prefix><NIcon :component="SearchOutlined" /></template>
                </NInput>
                <n-button type="primary" @click="openCreate">
                    <template #icon><NIcon :component="AddOutlined" /></template>
                    {{ t('merchant.agent.addAgent') }}
                </n-button>
            </div>
        </div>

        <!-- Table -->
        <n-card :bordered="false" class="shadow-sm">
            <n-data-table 
                :columns="columns" 
                :data="list" 
                :loading="loading" 
                :single-line="false"
            />
        </n-card>

        <!-- Create/Edit Modal -->
        <!-- Create/Edit Modal -->
        <n-modal v-model:show="showAgentModal">
            <n-card
                style="width: 600px"
                :title="agentModalTitle"
                :bordered="false"
                size="huge"
                role="dialog"
                aria-modal="true"
                closable
                @close="showAgentModal = false"
            >
                <n-form label-placement="left" label-width="120">
                    <n-form-item :label="t('merchant.agent.account')" required>
                        <n-input v-model:value="agentForm.account" :disabled="agentModalMode === 'edit'" />
                    </n-form-item>
                    <n-form-item v-if="agentModalMode === 'create'" :label="t('merchant.agent.password')" required>
                        <n-input v-model:value="agentForm.password" type="password" show-password-on="click" />
                    </n-form-item>
                    <n-form-item :label="t('merchant.agent.commissionRate')">
                        <div class="w-full px-2">
                            <n-slider v-model:value="agentForm.commission_rate" :step="1" :max="100" />
                        </div>
                        <span class="ml-4 w-12 text-right font-bold">{{ agentForm.commission_rate }}%</span>
                    </n-form-item>
                    <n-form-item :label="t('merchant.agent.status')">
                        <n-switch v-model:value="agentForm.status">
                            <template #checked>{{ t('common.enabled') }}</template>
                            <template #unchecked>{{ t('common.disabled') }}</template>
                        </n-switch>
                    </n-form-item>
                    <n-form-item :label="t('merchant.agent.note')">
                        <n-input v-model:value="agentForm.note" type="textarea" />
                    </n-form-item>
                </n-form>
                <template #footer>
                    <div class="flex justify-end gap-2">
                        <n-button @click="showAgentModal = false">{{ t('common.cancel') }}</n-button>
                        <n-button type="primary" :loading="submitting" @click="submitAgent">{{ t('common.confirm') }}</n-button>
                    </div>
                </template>
            </n-card>
        </n-modal>

        <!-- Transfer Modal -->
        <n-modal v-model:show="showTransferModal" preset="card" :title="t('merchant.agent.transferTitle')" class="w-[500px]">
            <div class="bg-[#18181c] p-4 rounded mb-4 border border-gray-700">
                <div class="flex justify-between mb-2">
                    <span class="text-gray-500">{{ t('merchant.agent.account') }}</span>
                    <span class="font-bold">{{ transferForm.targetName }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-500">{{ t('merchant.agent.balance') }}</span>
                    <span class="font-mono">{{ transferForm.currentBalance.toLocaleString() }}</span>
                </div>
            </div>
            
            <n-form>
                 <n-form-item :label="t('merchant.agent.transferAmount')">
                    <n-input-number 
                        v-model:value="transferForm.amount" 
                        class="w-full" 
                        :min="1"
                        :show-button="false"
                    >
                        <template #prefix>$</template>
                    </n-input-number>
                </n-form-item>
            </n-form>

            <template #footer>
                <div class="flex justify-end gap-2">
                    <n-button @click="showTransferModal = false">{{ t('common.cancel') }}</n-button>
                    <n-button type="primary" :loading="transferring" @click="submitTransfer">{{ t('common.confirm') }}</n-button>
                </div>
            </template>
        </n-modal>
    </div>
</template>
