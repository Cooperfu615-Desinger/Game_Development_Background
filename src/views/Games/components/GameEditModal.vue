<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
    NModal, NCard, NForm, NFormItem, NInput, NInputNumber,
    NSelect, NButton, NSpace
} from 'naive-ui'
import type { FormInst } from 'naive-ui'
import type { Game } from '@/types/game'

const props = defineProps<{
    show: boolean
    game: Game | null
}>()

const emit = defineEmits<{
    (e: 'update:show', v: boolean): void
    (e: 'save', id: string, patch: Partial<Game>): void
}>()

const formRef = ref<FormInst | null>(null)
const saving = ref(false)

const model = ref({ name: '', rtp: 95, description: '' })

watch(() => props.game, (g) => {
    if (g) {
        model.value = { name: g.name, rtp: g.rtp, description: g.description ?? '' }
    }
}, { immediate: true })

const rules = computed(() => ({
    name: { required: true, message: '請輸入遊戲名稱', trigger: 'blur' },
    rtp: {
        required: true,
        type: 'number' as const,
        min: 80,
        max: 99,
        message: 'RTP 需介於 80 ~ 99',
        trigger: 'blur'
    }
}))

const handleSave = async () => {
    try {
        await formRef.value?.validate()
        if (!props.game) return
        saving.value = true
        emit('save', props.game.id, {
            name: model.value.name,
            rtp: model.value.rtp,
            description: model.value.description
        })
        emit('update:show', false)
    } catch {
        // validation error
    } finally {
        saving.value = false
    }
}
</script>

<template>
    <n-modal
        :show="show"
        @update:show="emit('update:show', $event)"
        preset="card"
        :title="`編輯遊戲：${game?.name ?? ''}`"
        class="w-[480px]"
        :mask-closable="false"
    >
        <n-form ref="formRef" :model="model" :rules="rules" label-placement="left" :label-width="80">
            <n-form-item label="遊戲名稱" path="name">
                <n-input v-model:value="model.name" placeholder="請輸入遊戲名稱" />
            </n-form-item>
            <n-form-item label="RTP (%)" path="rtp">
                <n-input-number
                    v-model:value="model.rtp"
                    :min="80"
                    :max="99"
                    :precision="1"
                    :step="0.1"
                    class="w-full"
                />
            </n-form-item>
            <n-form-item label="描述" path="description">
                <n-input
                    v-model:value="model.description"
                    type="textarea"
                    :rows="3"
                    placeholder="選填"
                />
            </n-form-item>
        </n-form>

        <template #footer>
            <n-space justify="end">
                <n-button @click="emit('update:show', false)">取消</n-button>
                <n-button type="primary" :loading="saving" @click="handleSave">儲存</n-button>
            </n-space>
        </template>
    </n-modal>
</template>
