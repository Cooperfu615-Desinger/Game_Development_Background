<script setup lang="ts">
import { computed } from 'vue'
import { demoGameRows, formatUsd, lobbyGames, statusClass } from './data'
import './game-lobby.css'

const liveCount = computed(() => lobbyGames.filter((game) => game.status === '已推出').length)
const upcomingCount = computed(() => lobbyGames.filter((game) => game.status === '即將開放').length)
const maintenanceCount = computed(() => lobbyGames.filter((game) => game.status === '維護中').length)
const activePlayers = computed(() => demoGameRows.reduce((sum, game) => sum + game.activePlayers, 0))
const todayTurnover = computed(() => demoGameRows.reduce((sum, game) => sum + game.turnoverUsd, 0))
const topDemoGames = computed(() => [...demoGameRows].sort((a, b) => b.activePlayers - a.activePlayers).slice(0, 3))
</script>

<template>
    <div class="lobby-page page-stack">
        <section class="lobby-hero">
            <div class="lobby-hero-content">
                <div class="lobby-hero-kicker"><i class="pi pi-sparkles" /> GAME LOBBY / OPERATIONS</div>
                <h1>遊戲大廳營運總覽</h1>
                <p>掌握遊戲推出狀態、Demo 使用熱度與目前公開內容，快速找到需要檢查或處理的遊戲。</p>
            </div>
        </section>

        <div class="lobby-stat-grid">
            <article class="lobby-stat-card">
                <span>已推出遊戲</span>
                <strong>{{ liveCount }}</strong>
                <small>目前可進入 Demo</small>
            </article>
            <article class="lobby-stat-card">
                <span>即將開放</span>
                <strong>{{ upcomingCount }}</strong>
                <small>資料已公開，等待推出</small>
            </article>
            <article class="lobby-stat-card">
                <span>維護中</span>
                <strong>{{ maintenanceCount }}</strong>
                <small>暫時不可啟動</small>
            </article>
            <article class="lobby-stat-card">
                <span>目前 Demo 玩家</span>
                <strong>{{ activePlayers }}</strong>
                <small>即時在線帳號</small>
            </article>
        </div>

        <div class="lobby-grid-2">
            <section class="lobby-panel">
                <header class="lobby-panel-header">
                    <div>
                        <h2>遊戲推出狀態</h2>
                        <p>所有遊戲都會顯示在大廳，狀態決定玩家是否能開始試玩。</p>
                    </div>
                    <router-link class="lobby-link" to="/lobby/games">查看清單 →</router-link>
                </header>
                <ul class="lobby-activity-list">
                    <li v-for="game in lobbyGames.slice(0, 5)" :key="game.id" class="lobby-activity-row">
                        <div class="lobby-game-mini">
                            <div class="lobby-game-mini-art" :class="game.art" aria-hidden="true" />
                            <div>
                                <strong>{{ game.name }}</strong>
                                <small>{{ game.type }} · {{ game.version }}</small>
                            </div>
                        </div>
                        <span class="lobby-status" :class="statusClass(game.status)">{{ game.status }}</span>
                    </li>
                </ul>
            </section>

            <section class="lobby-panel">
                <header class="lobby-panel-header">
                    <div>
                        <h2>Demo 今日摘要</h2>
                        <p>固定 USD 額度的試玩行為，作為遊戲營運參考。</p>
                    </div>
                    <router-link class="lobby-link" to="/lobby/demo">完整數據 →</router-link>
                </header>
                <div class="lobby-stat-card" style="box-shadow: none; border: 0; padding: 0;">
                    <span>今日 Demo 投注額</span>
                    <strong>{{ formatUsd(todayTurnover) }}</strong>
                    <small>不列入正式財務報表</small>
                </div>
                <div v-for="game in topDemoGames" :key="game.gameId" class="lobby-progress-row">
                    <span>{{ game.gameName }}</span>
                    <strong>{{ game.activePlayers }} 人</strong>
                </div>
            </section>
        </div>

        <div class="lobby-grid-3">
            <section class="lobby-panel">
                <header class="lobby-panel-header"><div><h3>資料管理</h3><p>編輯參數、內容與遊戲素材。</p></div></header>
                <router-link class="lobby-button" to="/lobby/management">進入遊戲管理 <i class="pi pi-arrow-right" /></router-link>
            </section>
            <section class="lobby-panel">
                <header class="lobby-panel-header"><div><h3>完整大廳預覽</h3><p>檢查四語系、Desktop 與 Mobile 成果。</p></div></header>
                <router-link class="lobby-button is-secondary" to="/lobby/preview">開啟大廳預覽 <i class="pi pi-external-link" /></router-link>
            </section>
            <section class="lobby-panel">
                <header class="lobby-panel-header"><div><h3>公開檢查</h3><p>四語系與公開指標需要全部完成。</p></div></header>
                <div class="lobby-progress"><span style="width: 82%" /></div>
                <div class="lobby-progress-row"><span>目前完成度</span><strong>82%</strong></div>
            </section>
        </div>
    </div>
</template>
