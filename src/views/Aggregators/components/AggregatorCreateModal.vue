<script setup lang="ts">
import { ref, computed } from 'vue'
import {
    NModal, NCard, NForm, NFormItem, NInput,
    NButton, NSpace, NDivider, useMessage
} from 'naive-ui'
import type { FormInst, FormRules } from 'naive-ui'
import type { CreateAggregatorPayload } from '@/types/aggregator'

const props = defineProps<{ show: boolean; loading: boolean }>()
const emit = defineEmits<{
    (e: 'update:show', v: boolean): void
    (e: 'submit', payload: CreateAggregatorPayload): void
}>()

const message = useMessage()
const formRef = ref<FormInst | null>(null)
const form = ref<CreateAggregatorPayload>({
    name: '',
    code: '',
    apiEndpoint: '',
    description: '',
})

const rules: FormRules = {
    name: [{ required: true, message: '請輸入聚合商名稱', trigger: 'blur' }],
    code: [
        { required: true, message: '請輸入唯一代碼', trigger: 'blur' },
        { pattern: /^[a-z0-9-]+$/, message: '只允許小寫英文、數字、連字號', trigger: 'blur' },
    ],
    apiEndpoint: [
        { required: true, message: '請輸入 API Endpoint', trigger: 'blur' },
        { type: 'url', message: '請輸入有效的 URL 格式', trigger: 'blur' },
    ],
}

const isVisible = computed({
    get: () => props.show,
    set: (v) => emit('update:show', v),
})

const handleSubmit = () => {
    formRef.value?.validate(errors => {
        if (errors) {
            message.warning('請確認表單填寫正確')
            return
        }
        emit('submit', { ...form.value })
    })
}

const handleClose = () => {
    form.value = { name: '', code: '', apiEndpoint: '', description: '' }
    emit('update:show', false)
}
</script>

<template>
    <n-modal
        :show="isVisible"
        :mask-closable="false"
        @update:show="emit('update:show', $event)"
    >
        <n-card
            title="新增聚合商"
            style="width: 520px"
            :bordered="false"
            role="dialog"
            aria-modal="true"
        >
            <n-form ref="formRef" :model="form" :rules="rules" label-placement="top">
                <n-form-item label="聚合商名稱" path="name">
                    <n-input
                        v-model:value="form.name"
                        placeholder="例如：自家聚合商"
                        clearable
                    />
                </n-form-item>

                <n-form-item label="唯一代碼" path="code">
                    <n-input
                        v-model:value="form.code"
                        placeholder="例如：self、partner-a"
                        clearable
                    />
                    <template #feedback>
                        <span class="text-xs text-gray-500">只允許小寫英文、數字、連字號（-）</span>
                    </template>
                </n-form-item>

                <n-form-item label="API Endpoint" path="apiEndpoint">
                    <n-input
                        v-model:value="form.apiEndpoint"
                        placeholder="https://api.example.com/v1"
                        clearable
                    />
                </n-form-item>

                <n-form-item label="備註說明（選填）" path="description">
                    <n-input
                        v-model:value="form.description"
                        type="textarea"
                        :rows="3"
                        placeholder="備註此聚合商的用途或對接計劃..."
                    />
                </n-form-item>
            </n-form>

            <n-divider class="my-4" />

            <n-space justify="end">
                <n-button @click="handleClose">取消</n-button>
                <n-button type="primary" :loading="loading" @click="handleSubmit">
                    建立並前往配置
                </n-button>
            </n-space>
        </n-card>
    </n-modal>
</template>
