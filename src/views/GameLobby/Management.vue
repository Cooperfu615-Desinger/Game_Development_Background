<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { lobbyGames, statusClass, type LobbyGameStatus } from './data'
import './game-lobby.css'

type ManagementTab = 'basic' | 'parameters' | 'content' | 'media' | 'check'

const route = useRoute()
const selectedId = ref(String(route.query.gameId ?? lobbyGames[0].id))
const activeTab = ref<ManagementTab>('basic')
const savedMessage = ref('')
const statusDraft = ref<LobbyGameStatus>('已推出')

const selectedGame = computed(() => lobbyGames.find((game) => game.id === selectedId.value) ?? lobbyGames[0])

watch(selectedGame, (game) => {
    statusDraft.value = game.status
}, { immediate: true })

const tabs: Array<{ key: ManagementTab; label: string }> = [
    { key: 'basic', label: '基本資料' },
    { key: 'parameters', label: '遊戲參數' },
    { key: 'content', label: '公開內容' },
    { key: 'media', label: '圖片與影片' },
    { key: 'check', label: '狀態與公開檢查' },
]

const statusOptions: LobbyGameStatus[] = ['即將開放', '已推出', '維護中']

const checklist = [
    { label: '基本資料完整', detail: 'Game ID、分類、版號與上架時間已確認。' },
    { label: '四語系內容完整', detail: '繁中、簡中、英文、日本語皆有名稱與說明。' },
    { label: '公開數值完整', detail: 'RTP、波動度、最高倍率皆已設定並可公開。' },
    { label: '圖片素材已設定', detail: '卡片縮圖與詳細說明圖片已就緒。' },
    { label: 'YouTube 影片連結有效', detail: '目前已設定遊戲展示影片連結。' },
]

function saveDraft() {
    savedMessage.value = '骨架模式：已模擬儲存草稿。正式 API 尚未接入。'
}

function runCheck() {
    activeTab.value = 'check'
    savedMessage.value = '骨架模式：公開檢查已完成，所有項目目前顯示為通過。'
}
</script>

<template>
    <div class="lobby-page page-stack">
        <section class="lobby-panel management-context">
            <div>
                <span class="lobby-eyebrow">CURRENT GAME</span>
                <h2>{{ selectedGame.name }}</h2>
                <p>{{ selectedGame.code }} · {{ selectedGame.type }} · 目前版號 {{ selectedGame.version }}</p>
            </div>
            <div class="lobby-toolbar-actions">
                <select v-model="selectedId" class="lobby-select" aria-label="選擇遊戲">
                    <option v-for="game in lobbyGames" :key="game.id" :value="game.id">{{ game.name }}</option>
                </select>
                <span class="lobby-status" :class="statusClass(statusDraft)">{{ statusDraft }}</span>
            </div>
        </section>

        <div v-if="savedMessage" class="lobby-notice"><i class="pi pi-info-circle" /> {{ savedMessage }}</div>

        <section class="lobby-panel">
            <div class="lobby-segmented management-tabs" role="tablist" aria-label="遊戲管理區塊">
                <button v-for="tab in tabs" :key="tab.key" :class="{ 'is-active': activeTab === tab.key }" type="button" @click="activeTab = tab.key">{{ tab.label }}</button>
            </div>

            <div v-if="activeTab === 'basic'" class="lobby-form-grid management-content">
                <div class="lobby-form-field"><label>Game ID</label><input class="lobby-input" :value="selectedGame.id" readonly /></div>
                <div class="lobby-form-field"><label>遊戲代碼</label><input class="lobby-input" :value="selectedGame.code" readonly /></div>
                <div class="lobby-form-field"><label>遊戲類型</label><input class="lobby-input" :value="selectedGame.type" /></div>
                <div class="lobby-form-field"><label>目前版號</label><input class="lobby-input" :value="selectedGame.version" /></div>
                <div class="lobby-form-field"><label>遊戲上架時間</label><input class="lobby-input" :value="selectedGame.releaseAt" /></div>
                <div class="lobby-form-field"><label>資料最後更新</label><input class="lobby-input" :value="selectedGame.updatedAt" readonly /></div>
                <div class="lobby-form-field is-wide"><label>內部備註</label><textarea class="lobby-textarea" placeholder="僅供 Provider 內部使用的備註，暫不接正式儲存。" /></div>
            </div>

            <div v-else-if="activeTab === 'parameters'" class="lobby-form-grid management-content">
                <div class="lobby-form-field"><label>RTP</label><input class="lobby-input" :value="`${selectedGame.rtp.toFixed(2)}%`" /></div>
                <div class="lobby-form-field"><label>波動度</label><input class="lobby-input" :value="selectedGame.volatility" /></div>
                <div class="lobby-form-field"><label>最高倍率</label><input class="lobby-input" :value="selectedGame.maxMultiplier" /></div>
                <div class="lobby-form-field"><label>投注幣別</label><input class="lobby-input" value="USD" readonly /></div>
                <div class="lobby-form-field"><label>最低投注額</label><input class="lobby-input" :value="selectedGame.minBet" /></div>
                <div class="lobby-form-field"><label>最高投注額</label><input class="lobby-input" :value="selectedGame.maxBet" /></div>
                <div class="lobby-form-field is-wide"><small>RTP、波動度與最高倍率是大廳玩家必須看見的公開資訊；正式數值來源與版本契約確認後再接 API。</small></div>
            </div>

            <div v-else-if="activeTab === 'content'" class="management-content">
                <div class="lobby-toolbar"><div><h3>公開文字</h3><p class="lobby-helper">以下先以繁中示意，正式版本會提供四語系欄位。</p></div><span class="lobby-status is-live">四語系欄位已預留</span></div>
                <div class="lobby-form-grid">
                    <div class="lobby-form-field"><label>繁中遊戲名稱</label><input class="lobby-input" :value="selectedGame.name" /></div>
                    <div class="lobby-form-field"><label>簡中遊戲名稱</label><input class="lobby-input" :value="selectedGame.name" /></div>
                    <div class="lobby-form-field"><label>English title</label><input class="lobby-input" value="Provider Game Title" /></div>
                    <div class="lobby-form-field"><label>日本語タイトル</label><input class="lobby-input" value="Provider Game Title" /></div>
                    <div class="lobby-form-field is-wide"><label>繁中簡述</label><textarea class="lobby-textarea" :value="selectedGame.description" /></div>
                    <div class="lobby-form-field is-wide"><label>玩法說明</label><textarea class="lobby-textarea" :value="`${selectedGame.description} 本區將承接完整玩家端規則說明。`" /></div>
                </div>
            </div>

            <div v-else-if="activeTab === 'media'" class="management-content">
                <div class="lobby-form-grid">
                    <div class="lobby-form-field is-wide"><label>遊戲卡片圖片</label><div class="management-media-preview"><div class="lobby-game-art" :class="selectedGame.art"><span class="lobby-game-art-label">{{ selectedGame.code }}</span></div><div><strong>目前使用的展示圖</strong><small>正式素材服務接入後，這裡會顯示實際圖片。</small></div></div></div>
                    <div class="lobby-form-field is-wide"><label>YouTube 影片連結</label><input class="lobby-input" :value="selectedGame.youtubeUrl" placeholder="https://www.youtube.com/watch?v=..." /><small>目前只保存 YouTube URL，不上傳影片檔案。</small></div>
                    <div class="lobby-form-field is-wide"><label>YouTube 封面圖 URL（可選）</label><input class="lobby-input" value="https://img.youtube.com/vi/provider-demo/maxresdefault.jpg" /></div>
                </div>
            </div>

            <div v-else class="management-content">
                <div class="lobby-grid-2">
                    <div>
                        <div class="lobby-panel-header"><div><h3>玩家狀態</h3><p>狀態會直接反映到遊戲大廳。</p></div></div>
                        <div class="management-status-picker">
                            <button v-for="status in statusOptions" :key="status" type="button" :class="['lobby-status-option', statusClass(status), { 'is-selected': statusDraft === status }]" @click="statusDraft = status">
                                <span class="lobby-status" :class="statusClass(status)">{{ status }}</span>
                                <small v-if="status === '即將開放'">資料可見，不可試玩</small>
                                <small v-else-if="status === '已推出'">可進入 Demo</small>
                                <small v-else>保留展示，暫停試玩</small>
                            </button>
                        </div>
                    </div>
                    <div>
                        <div class="lobby-panel-header"><div><h3>公開檢查清單</h3><p>完成後可從大廳預覽確認整體成果。</p></div><strong class="lobby-check-result">5 / 5</strong></div>
                        <ul class="lobby-check-list">
                            <li v-for="item in checklist" :key="item.label"><div class="lobby-check-main"><i class="pi pi-check-circle" /><div><strong>{{ item.label }}</strong><small>{{ item.detail }}</small></div></div><span class="lobby-check-result">通過</span></li>
                        </ul>
                    </div>
                </div>
                <div class="lobby-toolbar management-footer-actions"><span class="lobby-helper">骨架階段先以本地狀態展示，正式版本會接入檢查結果與權限。</span><div class="lobby-toolbar-actions"><button class="lobby-button is-secondary" type="button" @click="runCheck">重新檢查</button><button class="lobby-button" type="button" @click="saveDraft">儲存草稿</button><router-link class="lobby-button" :to="{ name: 'GameLobbyPreview', query: { gameId: selectedGame.id } }">預覽整個大廳</router-link></div></div>
            </div>
        </section>
    </div>
</template>

<style scoped>
.management-context { display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; margin-bottom: 1rem; background: linear-gradient(135deg, #fbfffd, #eef9f5); }
.management-context h2 { margin-bottom: 0.35rem; font-size: 1.35rem; }
.management-context p { margin-bottom: 0; color: var(--lobby-muted); font-size: 0.8rem; }
.management-context .lobby-select { min-width: 11rem; }
.management-content { padding-top: 1.2rem; }
.management-tabs { width: max-content; max-width: 100%; overflow-x: auto; }
.management-media-preview { display: flex; align-items: center; gap: 1rem; padding: 0.75rem; border: 1px solid var(--lobby-line); border-radius: 0.8rem; background: var(--lobby-soft); }
.management-media-preview .lobby-game-art { width: 10rem; min-height: 6rem; border-radius: 0.65rem; }
.management-media-preview strong, .management-media-preview small { display: block; }
.management-media-preview small { margin-top: 0.35rem; color: var(--lobby-muted); line-height: 1.5; }
.management-status-picker { display: grid; gap: 0.65rem; }
.lobby-status-option { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.75rem; border: 1px solid var(--lobby-line); border-radius: 0.8rem; background: #fff; cursor: pointer; text-align: left; }
.lobby-status-option.is-selected { border-color: var(--lobby-teal); box-shadow: 0 0 0 2px rgba(20, 124, 120, 0.1); }
.lobby-status-option small { color: var(--lobby-muted); font-size: 0.72rem; }
.management-footer-actions { margin-top: 1.2rem; padding-top: 1.1rem; border-top: 1px solid #edf3f1; }
.lobby-notice { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; padding: 0.75rem 0.9rem; color: #266e67; border: 1px solid #c7e8dc; border-radius: 0.75rem; background: #f0fbf6; font-size: 0.8rem; }
@media (max-width: 760px) { .management-context { align-items: stretch; flex-direction: column; } .management-context .lobby-select { min-width: 0; } .management-footer-actions { align-items: stretch; } }
</style>
