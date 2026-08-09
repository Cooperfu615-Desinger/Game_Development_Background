<script setup lang="ts">
import { computed, ref } from 'vue'
import { demoGameRows, formatUsd } from './data'
import './game-lobby.css'

const period = ref('今日')
const totalActivePlayers = computed(() => demoGameRows.reduce((sum, row) => sum + row.activePlayers, 0))
const totalSessions = computed(() => demoGameRows.reduce((sum, row) => sum + row.sessions, 0))
const totalBets = computed(() => demoGameRows.reduce((sum, row) => sum + row.betCount, 0))
const totalTurnover = computed(() => demoGameRows.reduce((sum, row) => sum + row.turnoverUsd, 0))
const maxTrend = computed(() => Math.max(...demoGameRows.flatMap((row) => row.trend)))
</script>

<template>
    <div class="lobby-page page-stack">
        <div class="lobby-toolbar">
            <span class="lobby-helper">數據期間</span>
            <div class="lobby-segmented" aria-label="數據期間">
                <button v-for="option in ['今日', '近 7 日', '近 30 日']" :key="option" :class="{ 'is-active': period === option }" type="button" @click="period = option">{{ option }}</button>
            </div>
        </div>

        <div class="lobby-stat-grid">
            <article class="lobby-stat-card"><span>目前在線玩家</span><strong>{{ totalActivePlayers }}</strong><small>即時 Demo 帳號</small></article>
            <article class="lobby-stat-card"><span>遊戲 Session</span><strong>{{ totalSessions.toLocaleString() }}</strong><small>{{ period }}累計</small></article>
            <article class="lobby-stat-card"><span>投注筆數</span><strong>{{ totalBets.toLocaleString() }}</strong><small>Demo 行為紀錄</small></article>
            <article class="lobby-stat-card"><span>投注總額</span><strong>{{ formatUsd(totalTurnover) }}</strong><small>固定 USD Demo 額度</small></article>
        </div>

        <div class="lobby-grid-2">
            <section class="lobby-panel">
                <header class="lobby-panel-header"><div><h2>玩家活躍趨勢</h2><p>以遊戲大廳 Demo 在線玩家數呈現。</p></div><span class="lobby-status is-live">即時資料</span></header>
                <div class="lobby-bars" aria-label="玩家活躍趨勢圖">
                    <div v-for="(value, index) in demoGameRows[0].trend" :key="index" style="flex: 1; min-width: 0;">
                        <div class="lobby-bar" :style="{ height: `${Math.max(18, (value / maxTrend) * 100)}%` }" />
                        <div class="lobby-bar-label">{{ index === 6 ? '現在' : `${6 - index}h` }}</div>
                    </div>
                </div>
            </section>

            <section class="lobby-panel">
                <header class="lobby-panel-header"><div><h2>Demo 規則</h2><p>目前以固定規則產生資料。</p></div></header>
                <ul class="lobby-check-list">
                    <li><div class="lobby-check-main"><i class="pi pi-wallet" /><div><strong>初始額度</strong><small>每次產生帳號固定 USD 10,000</small></div></div></li>
                    <li><div class="lobby-check-main"><i class="pi pi-refresh" /><div><strong>帳號派發</strong><small>後端隨機生成，不建立帳號池</small></div></div></li>
                    <li><div class="lobby-check-main"><i class="pi pi-chart-line" /><div><strong>資料用途</strong><small>營運參考，不列入正式財務報表</small></div></div></li>
                </ul>
            </section>
        </div>

        <section class="lobby-panel">
            <header class="lobby-panel-header"><div><h2>各遊戲 Demo 表現</h2><p>可依時間、遊戲與遊戲類型擴充篩選。</p></div><button class="lobby-button is-secondary" type="button">匯出數據</button></header>
            <div class="lobby-table-wrap">
                <table class="lobby-table">
                    <thead><tr><th>遊戲</th><th>目前玩家</th><th>Session</th><th>投注筆數</th><th>投注總額 USD</th><th>遊玩時間</th></tr></thead>
                    <tbody>
                        <tr v-for="row in demoGameRows" :key="row.gameId">
                            <td><strong>{{ row.gameName }}</strong><small>{{ row.type }}</small></td>
                            <td>{{ row.activePlayers }}</td>
                            <td>{{ row.sessions.toLocaleString() }}</td>
                            <td>{{ row.betCount.toLocaleString() }}</td>
                            <td><strong>{{ formatUsd(row.turnoverUsd) }}</strong></td>
                            <td>{{ row.playMinutes.toLocaleString() }} min</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    </div>
</template>
