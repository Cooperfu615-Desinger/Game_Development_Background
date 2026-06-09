<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import type { Game } from '@/types/game'

const props = defineProps<{
    show: boolean
    game: Game | null
}>()

const emit = defineEmits<{
    (e: 'update:show', v: boolean): void
    (e: 'save', id: string, patch: Partial<Game>): void
}>()

const saving = ref(false)

const model = reactive({ name: '', rtp: 95, description: '' })
const errors = reactive({ name: '', rtp: '' })

watch(
    () => props.game,
    (g) => {
        if (g) {
            model.name = g.name
            model.rtp = g.rtp
            model.description = g.description ?? ''
            errors.name = ''
            errors.rtp = ''
        }
    },
    { immediate: true }
)

const validate = (): boolean => {
    errors.name = ''
    errors.rtp = ''
    if (!model.name.trim()) errors.name = '請輸入遊戲名稱'
    if (model.rtp < 80 || model.rtp > 99) errors.rtp = 'RTP 需介於 80 ~ 99'
    return !errors.name && !errors.rtp
}

const handleSave = async () => {
    if (!validate() || !props.game) return
    saving.value = true
    emit('save', props.game.id, {
        name: model.name,
        rtp: model.rtp,
        description: model.description,
    })
    emit('update:show', false)
    saving.value = false
}

const close = () => emit('update:show', false)
</script>

<template>
    <Dialog
        :visible="show"
        modal
        :header="`編輯遊戲：${game?.name ?? ''}`"
        :style="{ width: '30rem' }"
        :draggable="false"
        :closable="false"
        :close-on-escape="false"
        @update:visible="(v) => !v && close()"
    >
        <div class="flex flex-col gap-4">
            <div class="field">
                <label for="game-name">遊戲名稱 <span class="required">*</span></label>
                <InputText
                    id="game-name"
                    v-model="model.name"
                    placeholder="請輸入遊戲名稱"
                    :invalid="!!errors.name"
                    fluid
                />
                <small v-if="errors.name" class="error">{{ errors.name }}</small>
            </div>

            <div class="field">
                <label for="game-rtp">RTP (%) <span class="required">*</span></label>
                <InputNumber
                    id="game-rtp"
                    v-model="model.rtp"
                    :min="80"
                    :max="99"
                    :min-fraction-digits="1"
                    :max-fraction-digits="1"
                    :step="0.1"
                    show-buttons
                    :invalid="!!errors.rtp"
                    fluid
                />
                <small v-if="errors.rtp" class="error">{{ errors.rtp }}</small>
            </div>

            <div class="field">
                <label for="game-desc">描述</label>
                <Textarea
                    id="game-desc"
                    v-model="model.description"
                    :rows="3"
                    placeholder="選填"
                    fluid
                />
            </div>
        </div>

        <template #footer>
            <Button label="取消" severity="secondary" outlined @click="close" />
            <Button label="儲存" :loading="saving" @click="handleSave" />
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
</style>
