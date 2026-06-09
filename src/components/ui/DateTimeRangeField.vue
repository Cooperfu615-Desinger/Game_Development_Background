<!--
    DateTimeRangeField — 起始/結束日期時間範圍選擇
    From: reference demo

    使用範例（v-model 接 [Date | null, Date | null]）：
        <DateTimeRangeField v-model="form.range" />
-->
<script setup lang="ts">
import { computed } from 'vue'
import DatePicker from 'primevue/datepicker'

const range = defineModel<[Date | null, Date | null]>({ required: true })

const startValue = computed({
    get: () => range.value?.[0] ?? null,
    set: (v: Date | null) => {
        range.value = [v, range.value?.[1] ?? null]
    },
})

const endValue = computed({
    get: () => range.value?.[1] ?? null,
    set: (v: Date | null) => {
        range.value = [range.value?.[0] ?? null, v]
    },
})
</script>

<template>
    <div class="date-time-range">
        <div class="field">
            <label>起始時間</label>
            <DatePicker
                v-model="startValue"
                show-icon
                show-time
                show-seconds
                hour-format="24"
                date-format="yy-mm-dd"
                fluid
            />
        </div>
        <div class="field">
            <label>結束時間</label>
            <DatePicker
                v-model="endValue"
                show-icon
                show-time
                show-seconds
                hour-format="24"
                date-format="yy-mm-dd"
                fluid
            />
        </div>
    </div>
</template>

<style scoped>
.date-time-range {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
    min-width: 0;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    min-width: 0;
}

.field label {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--hig-text-secondary);
}

@media (max-width: 640px) {
    .date-time-range {
        grid-template-columns: 1fr;
    }
}
</style>
