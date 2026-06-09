<!--
    StatusTag — 智能狀態 Tag（依文字內容自動配色）
    From: reference demo (PrimeVue 4: 'warning' → 'warn')

    使用範例：
        <StatusTag value="已生效" />        → success
        <StatusTag value="待審核" />        → warn
        <StatusTag value="高風險" />        → danger
        <StatusTag value="其他" />           → info
-->
<script setup lang="ts">
import { computed } from 'vue'
import Tag from 'primevue/tag'

const props = defineProps<{ value: string }>()

const dangerKeywords = [
    '停用', '下架', '終止', '失敗', '異常', '高風險', '高額中獎',
    '錢包逾時', '風控覆核', '人工處理',
    'high risk', 'warning', 'danger',
]
const warningKeywords = [
    '待審核', '待處理', '處理中', '維護中', '測試中', '待確認',
    '派彩中', '重試中',
    'pending', 'processing', 'review',
]
const successKeywords = [
    '已結案', '已完成', '已發布', '已派發', '已上架', '已入帳',
    '已扣帳', '已結算', '已生效', '正常', '啟用', '上架',
    'settled', 'active',
]

type Severity = 'success' | 'warn' | 'danger' | 'info'

const severity = computed<Severity>(() => {
    const value = props.value.toLowerCase()
    if (dangerKeywords.some((k) => value.includes(k.toLowerCase()))) return 'danger'
    if (warningKeywords.some((k) => value.includes(k.toLowerCase()))) return 'warn'
    if (successKeywords.some((k) => value.includes(k.toLowerCase()))) return 'success'
    return 'info'
})
</script>

<template>
    <Tag :value="value" :severity="severity" />
</template>
