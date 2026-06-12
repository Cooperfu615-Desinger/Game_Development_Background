<!--
    SensitiveValue — 敏感資料遮罩 + 顯隱切換 + 複製
    From: reference demo (adapted to use --hig-* tokens)

    使用範例：
        <SensitiveValue value="sk_live_xxxxxxxxxx" />
-->
<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue'
import Button from 'primevue/button'

const props = defineProps<{ value: string }>()

const visible = ref(false)
const copied = ref(false)
const maskedValue = '••••••••••••'

// QA L-7：已還原（明文）狀態不可跨開關/重用保留。
//   1) 綁定值變更時重置 → 同一元件實例被另一筆資料重用時不會殘留前一筆明文。
//   2) unmount 時重置 → dialog 關閉若銷毀內容，下次掛載即為遮罩態（雙保險）。
function resetMask() {
    visible.value = false
    copied.value = false
}
watch(() => props.value, resetMask)
onUnmounted(resetMask)

const canCopy = computed(() => Boolean(props.value && props.value !== '-'))

async function copyValue() {
    if (!canCopy.value) return
    try {
        await navigator.clipboard.writeText(props.value)
    } catch {
        // Fallback for older browsers / insecure contexts
        const textarea = document.createElement('textarea')
        textarea.value = props.value
        textarea.setAttribute('readonly', '')
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
    }
    copied.value = true
    window.setTimeout(() => {
        copied.value = false
    }, 1400)
}
</script>

<template>
    <span class="sensitive-value">
        <code>{{ visible ? value : maskedValue }}</code>
        <Button
            :icon="visible ? 'pi pi-eye-slash' : 'pi pi-eye'"
            text
            rounded
            size="small"
            severity="secondary"
            :aria-label="visible ? '隱藏敏感資料' : '顯示敏感資料'"
            @click="visible = !visible"
        />
        <Button
            :icon="copied ? 'pi pi-check' : 'pi pi-copy'"
            text
            rounded
            size="small"
            :severity="copied ? 'success' : 'secondary'"
            :disabled="!canCopy"
            :aria-label="copied ? '已複製' : '複製敏感資料'"
            @click="copyValue"
        />
    </span>
</template>

<style scoped>
.sensitive-value {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    max-width: 100%;
    min-width: 0;
}

.sensitive-value code {
    font-family: var(--hig-font-mono);
    font-size: 0.8125rem;
    color: var(--hig-text-secondary);
    padding: 0.125rem 0.5rem;
    background: var(--hig-bg-fill);
    border-radius: var(--hig-radius-sm);
    letter-spacing: 0.02em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
