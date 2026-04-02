<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { NDrawer, NDrawerContent, NButton, NSpace, NIcon, useMessage } from 'naive-ui'
import { ContentCopyRound, CheckCircleRound } from '@vicons/material'

interface Props {
    show: boolean
    title?: string
    data: any
    width?: number
}

const props = withDefaults(defineProps<Props>(), {
    title: 'Detail View',
    width: 600
})

const emit = defineEmits<{
    (e: 'update:show', value: boolean): void
}>()

const message = useMessage()
const copied = ref(false)

// Format JSON for display
const formattedJson = computed(() => {
    try {
        return JSON.stringify(props.data, null, 2)
    } catch {
        return String(props.data)
    }
})

// Copy JSON to clipboard
const handleCopy = async () => {
    try {
        await navigator.clipboard.writeText(formattedJson.value)
        copied.value = true
        message.success('Copied to clipboard!')
        setTimeout(() => {
            copied.value = false
        }, 2000)
    } catch (e) {
        message.error('Failed to copy')
    }
}

const handleClose = () => {
    emit('update:show', false)
}

// Reset copied state when drawer opens
watch(() => props.show, (newVal) => {
    if (newVal) {
        copied.value = false
    }
})
</script>

<template>
    <n-drawer 
        :show="show" 
        :width="width" 
        placement="right"
        @update:show="$emit('update:show', $event)"
    >
        <n-drawer-content :title="title" closable>
            <template #header>
                <div class="flex items-center justify-between w-full">
                    <span>{{ title }}</span>
                    <n-button 
                        size="small" 
                        :type="copied ? 'success' : 'default'"
                        @click="handleCopy"
                    >
                        <template #icon>
                            <n-icon :component="copied ? CheckCircleRound : ContentCopyRound" />
                        </template>
                        {{ copied ? 'Copied!' : 'Copy JSON' }}
                    </n-button>
                </div>
            </template>

            <div class="h-full flex flex-col">
                <!-- Summary Cards -->
                <div v-if="$slots.summary" class="mb-4">
                    <slot name="summary"></slot>
                </div>

                <!-- JSON Content -->
                <div class="flex-1 bg-slate-900 rounded-lg p-4 overflow-auto">
                    <pre class="text-sm font-mono text-green-400 whitespace-pre-wrap break-words">{{ formattedJson }}</pre>
                </div>
            </div>

            <template #footer>
                <n-space justify="end">
                    <n-button @click="handleClose">Close</n-button>
                </n-space>
            </template>
        </n-drawer-content>
    </n-drawer>
</template>
