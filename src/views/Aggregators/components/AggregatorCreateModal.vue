<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import type { CreateAggregatorPayload } from '@/types/aggregator'

const props = defineProps<{ show: boolean; loading: boolean }>()
const emit = defineEmits<{
    (e: 'update:show', v: boolean): void
    (e: 'submit', payload: CreateAggregatorPayload): void
}>()

const toast = useToast()

const form = reactive<CreateAggregatorPayload>({
    name: '',
    code: '',
    apiEndpoint: '',
    description: '',
})

const errors = reactive({ name: '', code: '', apiEndpoint: '' })

// Reset when reopened
watch(
    () => props.show,
    (show) => {
        if (show) {
            form.name = ''
            form.code = ''
            form.apiEndpoint = ''
            form.description = ''
            errors.name = ''
            errors.code = ''
            errors.apiEndpoint = ''
        }
    }
)

const isValidUrl = (s: string) => {
    try {
        new URL(s)
        return true
    } catch {
        return false
    }
}

const validate = (): boolean => {
    errors.name = ''
    errors.code = ''
    errors.apiEndpoint = ''

    if (!form.name.trim()) errors.name = '請輸入聚合商名稱'
    if (!form.code.trim()) {
        errors.code = '請輸入唯一代碼'
    } else if (!/^[a-z0-9-]+$/.test(form.code)) {
        errors.code = '只允許小寫英文、數字、連字號'
    }
    if (!form.apiEndpoint.trim()) {
        errors.apiEndpoint = '請輸入 API Endpoint'
    } else if (!isValidUrl(form.apiEndpoint)) {
        errors.apiEndpoint = '請輸入有效的 URL 格式'
    }
    return !errors.name && !errors.code && !errors.apiEndpoint
}

const handleSubmit = () => {
    if (!validate()) {
        toast.add({ severity: 'warn', summary: '請確認表單填寫正確', life: 2000 })
        return
    }
    emit('submit', { ...form })
}

const close = () => emit('update:show', false)
</script>

<template>
    <Dialog
        :visible="show"
        modal
        header="新增聚合商"
        :style="{ width: '32rem' }"
        :draggable="false"
        :closable="false"
        :close-on-escape="false"
        @update:visible="(v) => !v && close()"
    >
        <div class="flex flex-col gap-4">
            <!-- 名稱 -->
            <div class="field">
                <label for="agg-name">聚合商名稱 <span class="required">*</span></label>
                <InputText
                    id="agg-name"
                    v-model="form.name"
                    placeholder="例如：自家聚合商"
                    :invalid="!!errors.name"
                    fluid
                />
                <small v-if="errors.name" class="error">{{ errors.name }}</small>
            </div>

            <!-- 唯一代碼 -->
            <div class="field">
                <label for="agg-code">唯一代碼 <span class="required">*</span></label>
                <InputText
                    id="agg-code"
                    v-model="form.code"
                    placeholder="例如：self、partner-a"
                    :invalid="!!errors.code"
                    fluid
                />
                <small v-if="errors.code" class="error">{{ errors.code }}</small>
                <small v-else class="hint">只允許小寫英文、數字、連字號（-）</small>
            </div>

            <!-- API Endpoint -->
            <div class="field">
                <label for="agg-endpoint">API Endpoint <span class="required">*</span></label>
                <InputText
                    id="agg-endpoint"
                    v-model="form.apiEndpoint"
                    placeholder="https://api.example.com/v1"
                    :invalid="!!errors.apiEndpoint"
                    fluid
                />
                <small v-if="errors.apiEndpoint" class="error">{{ errors.apiEndpoint }}</small>
            </div>

            <!-- 備註 -->
            <div class="field">
                <label for="agg-desc">備註說明（選填）</label>
                <Textarea
                    id="agg-desc"
                    v-model="form.description"
                    :rows="3"
                    placeholder="備註此聚合商的用途或對接計劃..."
                    fluid
                />
            </div>
        </div>

        <template #footer>
            <Button label="取消" severity="secondary" outlined @click="close" />
            <Button label="建立並前往配置" :loading="loading" @click="handleSubmit" />
        </template>
    </Dialog>
</template>

<style scoped>
.field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
}
.field label {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--hig-text-primary);
}
.required {
    color: var(--hig-red);
}
.error {
    color: var(--hig-red);
    font-size: 0.75rem;
}
.hint {
    color: var(--hig-text-tertiary);
    font-size: 0.75rem;
}
</style>
