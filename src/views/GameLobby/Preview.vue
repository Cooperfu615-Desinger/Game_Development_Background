<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { localeOptions, lobbyGames, statusClass, type LobbyGame } from './data'
import './game-lobby.css'

const route = useRoute()
const device = ref<'Desktop' | 'Mobile'>('Desktop')
const locale = ref<(typeof localeOptions)[number]>('繁中')
const dataMode = ref<'正式版本' | '編輯草稿'>('編輯草稿')
const category = ref('全部')
const selectedGame = ref<LobbyGame | null>(lobbyGames.find((game) => game.id === route.query.gameId) ?? null)

const categories = ['全部', ...Array.from(new Set(lobbyGames.map((game) => game.type)))]
const filteredGames = computed(() => category.value === '全部' ? lobbyGames : lobbyGames.filter((game) => game.type === category.value))
</script>

<template>
    <div class="lobby-page page-stack">
        <section class="lobby-panel">
            <div class="lobby-toolbar">
                <div class="lobby-toolbar-actions">
                    <span class="lobby-helper">資料版本</span>
                    <div class="lobby-segmented" aria-label="預覽資料版本">
                        <button :class="{ 'is-active': dataMode === '正式版本' }" type="button" @click="dataMode = '正式版本'">正式版本</button>
                        <button :class="{ 'is-active': dataMode === '編輯草稿' }" type="button" @click="dataMode = '編輯草稿'">編輯草稿</button>
                    </div>
                </div>
                <div class="lobby-toolbar-actions">
                    <span class="lobby-helper">預覽裝置</span>
                    <div class="lobby-segmented">
                        <button :class="{ 'is-active': device === 'Desktop' }" type="button" @click="device = 'Desktop'">Desktop</button>
                        <button :class="{ 'is-active': device === 'Mobile' }" type="button" @click="device = 'Mobile'">Mobile</button>
                    </div>
                </div>
                <div class="lobby-segmented" aria-label="預覽語系">
                    <button v-for="item in localeOptions" :key="item" :class="{ 'is-active': locale === item }" type="button" @click="locale = item">{{ item }}</button>
                </div>
            </div>

            <div class="lobby-preview-shell" :class="{ 'is-mobile-preview': device === 'Mobile' }">
                <div class="lobby-preview-browserbar"><div class="lobby-preview-dots"><span /><span /><span /></div><span>provider-game-lobby.preview · {{ dataMode }} · {{ locale }}</span><span>預覽模式</span></div>
                <div class="lobby-preview-body">
                    <nav class="lobby-preview-nav"><div class="lobby-preview-brand">PROVIDER<small>GAME LOBBY</small></div><div class="lobby-preview-wallet">DEMO 餘額<strong>USD 10,000.00</strong></div></nav>
                    <div class="lobby-preview-categories">
                        <button v-for="item in categories" :key="item" class="lobby-preview-category" :class="{ 'is-active': category === item }" type="button" @click="category = item">{{ item }}</button>
                    </div>
                    <div class="lobby-preview-grid">
                        <article v-for="game in filteredGames" :key="game.id" class="lobby-preview-card" @click="selectedGame = game">
                            <div class="lobby-game-art" :class="game.art"><span class="lobby-game-art-label">{{ game.code }}</span></div>
                            <div class="lobby-preview-card-body"><h3>{{ game.name }}</h3><p>{{ game.type }} · RTP {{ game.rtp.toFixed(2) }}%</p><button class="lobby-preview-card-action" type="button" :disabled="game.status !== '已推出'">{{ game.status === '已推出' ? '立即試玩' : game.status }}</button></div>
                        </article>
                    </div>
                    <div v-if="selectedGame" class="preview-detail-strip"><div><span>目前選取</span><strong>{{ selectedGame.name }}</strong><small>{{ selectedGame.description }}</small></div><button type="button" @click="selectedGame = null">關閉詳情</button></div>
                    <footer class="lobby-preview-footer">負責任遊戲宣告 · Demo 模式僅供試玩，不涉及真實資金</footer>
                </div>
            </div>
        </section>
    </div>
</template>

<style scoped>
.lobby-preview-shell { transition: max-width 220ms ease; }
.lobby-preview-shell.is-mobile-preview { max-width: 32rem; margin: 0 auto; }
.lobby-preview-card { cursor: pointer; transition: transform 160ms ease, border-color 160ms ease; }
.lobby-preview-card:hover { transform: translateY(-2px); border-color: rgba(142, 226, 201, 0.45); }
.lobby-preview-card-action { cursor: pointer; }
.lobby-preview-card-action:disabled { cursor: not-allowed; }
.preview-detail-strip { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-top: 1rem; padding: 0.9rem 1rem; color: #dff8ef; border: 1px solid rgba(143, 225, 195, 0.22); border-radius: 0.75rem; background: rgba(143, 225, 195, 0.08); }
.preview-detail-strip span, .preview-detail-strip small { display: block; color: #8fb4b1; font-size: 0.66rem; }
.preview-detail-strip strong { display: block; margin: 0.2rem 0; font-size: 0.85rem; }
.preview-detail-strip small { max-width: 34rem; line-height: 1.45; }
.preview-detail-strip button { flex: 0 0 auto; padding: 0.45rem 0.65rem; border: 1px solid rgba(143, 225, 195, 0.28); border-radius: 0.45rem; color: #9be6cb; background: transparent; cursor: pointer; font-size: 0.7rem; }
.lobby-preview-footer { margin-top: 1.2rem; color: #718b8d; font-size: 0.65rem; text-align: center; }
@media (max-width: 700px) { .preview-detail-strip { align-items: stretch; flex-direction: column; } }
</style>
