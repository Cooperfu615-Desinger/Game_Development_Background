<script setup lang="ts">
import { ref, onMounted, computed, h } from 'vue'
import { 
    NCard, NButton, NDataTable, NTag, NModal, NForm, NFormItem, NInput, NSelect,
    useMessage, type DataTableColumns 
} from 'naive-ui'
import { useI18n } from 'vue-i18n'
import type { Staff, JobLevel } from '../../../types/system'

const { t } = useI18n()
const message = useMessage()

const staffList = ref<Staff[]>([])
const jobLevels = ref<JobLevel[]>([])
const loading = ref(false)
const showModal = ref(false)

const formModel = ref({
    id: 0,
    username: '',
    realname: '',
    email: '',
    password: '',
    job_level_id: 0,
    status: 'active' as 'active' | 'disabled'
})

const jobLevelOptions = computed(() => 
    jobLevels.value.map(jl => ({ label: jl.name, value: jl.id }))
)

const columns = computed<DataTableColumns<Staff>>(() => [
    { title: t('system.username'), key: 'username', width: 150 },
    { title: t('system.realname'), key: 'realname', width: 150 },
    { title: t('system.email'), key: 'email', ellipsis: { tooltip: true } },
    { 
        title: t('system.jobLevel'), 
        key: 'job_level_name',
        width: 180,
        render: (row) => h(
            NTag, 
            { type: 'info', bordered: false }, 
            { default: () => row.job_level_name || 'N/A' }
        )
    },
    { title: t('system.lastLogin'), key: 'last_login', width: 180 },
    { 
        title: t('finance.status'),
        key: 'status',
        width: 100,
        render: (row) => h(
            NTag, 
            { type: row.status === 'active' ? 'success' : 'error', bordered: false }, 
            { default: () => row.status === 'active' ? t('status.active') : t('status.disabled') }
        )
    },
    {
        title: t('columns.action'),
        key: 'action',
        width: 100,
        render: (row) => h(
            NButton, 
            { size: 'small', onClick: () => editStaff(row) }, 
            { default: () => t('common.edit') }
        )
    }
])

const fetchStaff = async () => {
    loading.value = true
    try {
        const res = await fetch('/api/v2/system/staff')
        const data = await res.json()
        staffList.value = data.data.list
    } finally {
        loading.value = false
    }
}

const fetchJobLevels = async () => {
    try {
        const res = await fetch('/api/admin/job-levels')
        const data = await res.json()
        jobLevels.value = data.data.list
    } catch (error) {
        message.error('Failed to load job levels')
    }
}

const editStaff = (row: Staff) => {
    formModel.value = {
        id: row.id,
        username: row.username,
        realname: row.realname,
        email: row.email,
        password: '',  // Reset password field for edit mode
        job_level_id: row.job_level_id,
        status: row.status
    }
    showModal.value = true
}

const addStaff = () => {
    formModel.value = { 
        id: 0, 
        username: '', 
        realname: '',
        email: '',
        password: '',
        job_level_id: 0, 
        status: 'active' 
    }
    showModal.value = true
}

const handleSubmit = async () => {
    try {
        await fetch('/api/v2/system/staff', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formModel.value)
        })
        message.success('Staff saved successfully')
        showModal.value = false
        await fetchStaff()
    } catch (error) {
        message.error('Failed to save')
    }
}

onMounted(async () => {
    await fetchJobLevels()
    await fetchStaff()
})
</script>

<template>
    <div class="p-6 space-y-4">
        <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold">{{ t('system.staffList') }}</h1>
            <n-button type="primary" @click="addStaff">{{ t('system.addStaff') }}</n-button>
        </div>

        <n-card>
            <n-data-table :columns="columns" :data="staffList" :loading="loading" />
        </n-card>

        <n-modal v-model:show="showModal" preset="card" :title="formModel.id ? t('system.editStaff') : t('system.addStaff')" class="w-[600px]">
            <n-form ref="formRef" :model="formModel">
                <n-form-item :label="t('system.username')" required>
                    <n-input v-model:value="formModel.username" :disabled="!!formModel.id" />
                </n-form-item>
                <n-form-item :label="t('system.realname')" required>
                    <n-input v-model:value="formModel.realname" />
                </n-form-item>
                <n-form-item :label="t('system.email')" required>
                    <n-input v-model:value="formModel.email" />
                </n-form-item>
                <n-form-item 
                    :label="formModel.id ? t('system.resetPassword') : t('system.password')" 
                    :required="!formModel.id"
                >
                    <n-input 
                        v-model:value="formModel.password" 
                        type="password"
                        show-password-on="click"
                        :placeholder="formModel.id ? t('system.editPasswordPlaceholder') : t('system.passwordPlaceholder')"
                    />
                </n-form-item>
                <n-form-item :label="t('system.jobLevel')" required>
                    <n-select 
                        v-model:value="formModel.job_level_id" 
                        :options="jobLevelOptions" 
                        :placeholder="t('system.assignJobLevel')"
                    />
                </n-form-item>
                <n-form-item :label="t('finance.status')" v-if="formModel.id">
                    <n-select 
                        v-model:value="formModel.status" 
                        :options="[{label: t('status.active'), value:'active'}, {label: t('status.disabled'), value:'disabled'}]" 
                    />
                </n-form-item>
            </n-form>
            <div class="flex justify-end gap-2 mt-4">
                <n-button @click="showModal = false">{{ t('common.cancel') }}</n-button>
                <n-button type="primary" @click="handleSubmit">{{ t('common.save') }}</n-button>
            </div>
        </n-modal>
    </div>
</template>
