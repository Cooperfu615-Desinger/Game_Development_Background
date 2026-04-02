<script setup lang="ts">
import { ref, watch } from 'vue'
import { 
    NModal, NList, NListItem, NThing, NTag, NSwitch, 
    NInputNumber, NButton, useMessage, NSpin
} from 'naive-ui'
import { useI18n } from 'vue-i18n'

interface Props {
    show: boolean
    merchantId: number | null
}
const props = defineProps<Props>()
const emit = defineEmits(['update:show'])

const { t } = useI18n()
const message = useMessage()
const loading = ref(false)
const saving = ref(false)
const subscriptions = ref<any[]>([])

// Fetch subscriptions when modal opens
watch(() => props.show, async (newVal) => {
    if (newVal && props.merchantId) {
        loading.value = true
        try {
            const res = await fetch(`/api/v2/merchant/${props.merchantId}/providers`).then(r => r.json())
            if (res.code === 0) {
                subscriptions.value = res.data
            }
        } catch (e) {
            message.error(t('subscription.loadFailed'))
        } finally {
            loading.value = false
        }
    }
})

const handleSave = async () => {
    if (!props.merchantId) return
    saving.value = true
    try {
        const res = await fetch(`/api/v2/merchant/${props.merchantId}/providers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscriptions.value)
        }).then(r => r.json())

        if (res.code === 0) {
            message.success(t('subscription.saveSuccess'))
            emit('update:show', false)
        } else {
            message.error(res.msg || 'Save failed')
        }
    } catch (e) {
        message.error(t('subscription.saveFailed'))
    } finally {
        saving.value = false
    }
}

const handleClose = () => {
    emit('update:show', false)
}
</script>

<template>
    <n-modal
        :show="show"
        @update:show="handleClose"
        preset="card"
        :title="t('subscription.title')"
        class="w-[600px]"
    >
        <div v-if="loading" class="h-64 flex justify-center items-center">
            <n-spin size="large" />
        </div>
        
        <div v-else class="space-y-4">
            <n-list hoverable clickable>
                <n-list-item v-for="sub in subscriptions" :key="sub.providerId">
                    <template #prefix>
                        <div class="w-12 h-12 bg-gray-700 rounded flex items-center justify-center text-lg font-bold">
                            {{ sub.code?.toUpperCase().slice(0, 2) }}
                        </div>
                    </template>
                    
                    <n-thing :title="sub.name" content-style="margin-top: 10px;">
                        <template #description>
                            <n-tag v-if="sub.globalStatus === 'maintenance'" type="warning" size="small" :bordered="false">
                                ⚠️ {{ t('subscription.providerMaintenance') }}
                            </n-tag>
                            <n-tag v-else type="success" size="small" :bordered="false">
                                {{ t('status.active') }}
                            </n-tag>
                        </template>

                        <div class="flex items-center justify-between gap-4 mt-2">
                            <div class="flex items-center gap-2">
                                <span class="text-sm text-gray-400">{{ t('subscription.enableProvider') }}</span>
                                <n-switch 
                                    :value="sub.status === 'active'"
                                    @update:value="(val) => sub.status = val ? 'active' : 'disabled'"
                                />
                            </div>

                            <div v-if="sub.status === 'active'" class="flex items-center gap-2">
                                <span class="text-sm text-gray-400">{{ t('subscription.revenueShare') }}</span>
                                <n-input-number 
                                    v-model:value="sub.revenueShare" 
                                    :min="0" :max="100" 
                                    size="small" 
                                    class="w-24"
                                >
                                    <template #suffix>%</template>
                                </n-input-number>
                            </div>
                        </div>

                        <div v-if="sub.status === 'active'" class="mt-3">
                            <n-button size="tiny" secondary type="warning" @click="message.info(t('subscription.gameExclusionPlaceholder'))">
                                🚫 {{ t('subscription.gameExclusion') }}
                            </n-button>
                        </div>
                    </n-thing>
                </n-list-item>
            </n-list>
        </div>

        <template #footer>
            <div class="flex justify-end gap-3">
                <n-button @click="handleClose">{{ t('common.cancel') }}</n-button>
                <n-button type="primary" :loading="saving" @click="handleSave" :disabled="loading">
                    {{ t('common.save') }}
                </n-button>
            </div>
        </template>
    </n-modal>
</template>
