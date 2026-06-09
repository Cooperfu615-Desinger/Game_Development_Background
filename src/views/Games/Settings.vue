<!--
    Games / Settings (`/games/settings`)
    From: reference demo GameSettingsView.vue (adapted)

    全域配置：維護週期、限紅模板、基礎選項。
    單款遊戲只「套用模板」，RTP 與版本在其他子頁管理。
-->
<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import DatePicker from 'primevue/datepicker'
import ToggleSwitch from 'primevue/toggleswitch'
import { SectionCard } from '@/components/ui'

const maintenanceTemplates = reactive<any[]>([])

const limitTemplates = reactive<any[]>([])

const baseSettings = reactive<any>({
    gameTypes: [],
    platforms: [],
    languages: [],
    defaultMaintenanceCycle: '',
    requireApprovalForProduction: false,
})

const loading = ref(true)

onMounted(async () => {
    try {
        const res = await fetch('/api/games/v2/settings')
        const data = await res.json()
        maintenanceTemplates.splice(
            0,
            maintenanceTemplates.length,
            ...data.maintenanceTemplates.map((t: any) => ({
                ...t,
                start: new Date(t.start),
                end: new Date(t.end),
            }))
        )
        limitTemplates.splice(0, limitTemplates.length, ...data.limitTemplates)
        Object.assign(baseSettings, data.baseSettings)
    } finally {
        loading.value = false
    }
})

const cycleOptions = ['每日', '每週', '每月', '指定日期']
const dayOptions = ['每日', '週一', '週二', '週三', '週四', '週五', '週六', '週日', '每月 1 日', '每月 15 日']
const scopeOptions = ['全部遊戲', '指定遊戲']
const currencyOptions = ['USDT', 'USD', 'TWD']
const gameTypeOptions = ['老虎機', '桌遊', '小遊戲', '真人']
const platformOptions = ['H5', 'Web', 'App']
const languageOptions = ['繁中', '英文', '泰文', '越南文']
</script>

<template>
    <div class="page-stack">
        <!-- Overview -->
        <SectionCard>
            <template #header>
                <div class="dialog-title-block">
                    <h2>遊戲設定</h2>
                    <p>管理全域模板與基礎配置；單款遊戲只套用模板，不在這裡修改 RTP 或版本紀錄。</p>
                </div>
            </template>

            <div class="settings-overview-grid">
                <article>
                    <span>維護週期模板</span>
                    <strong>{{ maintenanceTemplates.length }}</strong>
                    <small>每日、每週、每月與指定時段</small>
                </article>
                <article>
                    <span>限紅模板</span>
                    <strong>{{ limitTemplates.length }}</strong>
                    <small>可在單款遊戲複選套用</small>
                </article>
                <article>
                    <span>正式異動</span>
                    <strong>需審核</strong>
                    <small>上架、維護、限紅與可見範圍</small>
                </article>
            </div>
        </SectionCard>

        <!-- 維護週期模板 -->
        <SectionCard>
            <template #header>
                <div class="dialog-title-block">
                    <h2>維護週期模板</h2>
                    <p>維護通常以固定週期設定，排程生效時遊戲不可啟動新局。</p>
                </div>
            </template>

            <DataTable :value="maintenanceTemplates" :loading="loading" data-key="name" table-style="min-width: 56rem">
                <Column field="name" header="模板名稱" style="width: 12rem; min-width: 12rem">
                    <template #body="{ data }">
                        <InputText v-model="data.name" fluid />
                    </template>
                </Column>
                <Column field="cycle" header="週期" style="width: 8rem; min-width: 8rem">
                    <template #body="{ data }">
                        <Select v-model="data.cycle" :options="cycleOptions" fluid />
                    </template>
                </Column>
                <Column field="day" header="日期" style="width: 10rem; min-width: 10rem">
                    <template #body="{ data }">
                        <Select v-model="data.day" :options="dayOptions" fluid />
                    </template>
                </Column>
                <Column header="起始時間" style="width: 9rem; min-width: 9rem">
                    <template #body="{ data }">
                        <DatePicker v-model="data.start" time-only show-seconds hour-format="24" fluid />
                    </template>
                </Column>
                <Column header="結束時間" style="width: 9rem; min-width: 9rem">
                    <template #body="{ data }">
                        <DatePicker v-model="data.end" time-only show-seconds hour-format="24" fluid />
                    </template>
                </Column>
                <Column field="scope" header="範圍" style="width: 9rem; min-width: 9rem">
                    <template #body="{ data }">
                        <Select v-model="data.scope" :options="scopeOptions" fluid />
                    </template>
                </Column>
                <Column
                    field="enabled"
                    header="啟用"
                    header-class="agent-table-cell-center"
                    body-class="agent-table-cell-center"
                    style="width: 5.5rem; min-width: 5.5rem"
                >
                    <template #body="{ data }">
                        <ToggleSwitch v-model="data.enabled" />
                    </template>
                </Column>
            </DataTable>
        </SectionCard>

        <!-- 限紅模板 -->
        <SectionCard>
            <template #header>
                <div class="dialog-title-block">
                    <h2>限紅模板</h2>
                    <p>模板可複選套用到遊戲；金額與次數欄位使用 InputNumber，避免普通文字輸入。</p>
                </div>
            </template>

            <DataTable :value="limitTemplates" :loading="loading" data-key="name" table-style="min-width: 60rem">
                <Column field="name" header="模板名稱" style="width: 10rem; min-width: 10rem">
                    <template #body="{ data }">
                        <InputText v-model="data.name" fluid />
                    </template>
                </Column>
                <Column field="currencies" header="幣別" style="width: 14rem; min-width: 14rem">
                    <template #body="{ data }">
                        <MultiSelect
                            v-model="data.currencies"
                            :options="currencyOptions"
                            display="chip"
                            fluid
                        />
                    </template>
                </Column>
                <Column field="minBet" header="最小投注" style="width: 8.5rem; min-width: 8.5rem">
                    <template #body="{ data }">
                        <InputNumber v-model="data.minBet" :min="0" fluid />
                    </template>
                </Column>
                <Column field="maxBet" header="最大投注" style="width: 8.5rem; min-width: 8.5rem">
                    <template #body="{ data }">
                        <InputNumber v-model="data.maxBet" :min="0" fluid />
                    </template>
                </Column>
                <Column field="maxPayout" header="派彩上限" style="width: 9rem; min-width: 9rem">
                    <template #body="{ data }">
                        <InputNumber v-model="data.maxPayout" :min="0" fluid />
                    </template>
                </Column>
                <Column
                    field="enabled"
                    header="啟用"
                    header-class="agent-table-cell-center"
                    body-class="agent-table-cell-center"
                    style="width: 5.5rem; min-width: 5.5rem"
                >
                    <template #body="{ data }">
                        <ToggleSwitch v-model="data.enabled" />
                    </template>
                </Column>
            </DataTable>
        </SectionCard>

        <!-- 基礎選項 -->
        <SectionCard>
            <template #header>
                <div class="dialog-title-block">
                    <h2>基礎選項</h2>
                    <p>管理遊戲類型、平台與語系選項，供遊戲列表與新增流程引用。</p>
                </div>
            </template>

            <div class="dialog-form-grid">
                <div class="field field-span-4">
                    <label>遊戲類型</label>
                    <MultiSelect v-model="baseSettings.gameTypes" :options="gameTypeOptions" display="chip" fluid />
                </div>
                <div class="field field-span-4">
                    <label>支援平台</label>
                    <MultiSelect v-model="baseSettings.platforms" :options="platformOptions" display="chip" fluid />
                </div>
                <div class="field field-span-4">
                    <label>支援語系</label>
                    <MultiSelect v-model="baseSettings.languages" :options="languageOptions" display="chip" fluid />
                </div>
                <div class="field field-span-4">
                    <label>預設維護週期</label>
                    <Select v-model="baseSettings.defaultMaintenanceCycle" :options="cycleOptions" fluid />
                </div>
                <div class="field switch-field field-span-4">
                    <label>正式環境異動需審核</label>
                    <div class="dialog-switch-control">
                        <ToggleSwitch v-model="baseSettings.requireApprovalForProduction" />
                    </div>
                </div>
            </div>
        </SectionCard>
    </div>
</template>
