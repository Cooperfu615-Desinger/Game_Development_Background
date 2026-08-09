<script setup lang="ts">
import { computed, ref } from 'vue'
import { lobbyGames, statusClass, type LobbyGameStatus } from './data'
import './game-lobby.css'

const keyword = ref('')
const statusFilter = ref<'全部' | LobbyGameStatus>('全部')

const filteredGames = computed(() => {
    const normalizedKeyword = keyword.value.trim().toLowerCase()
    return lobbyGames.filter((game) => {
        const matchesKeyword = !normalizedKeyword || [game.name, game.code, game.type].some((value) => value.toLowerCase().includes(normalizedKeyword))
        const matchesStatus = statusFilter.value === '全部' || game.status === statusFilter.value
        return matchesKeyword && matchesStatus
    })
})
</script>

<template>
    <div class="lobby-page page-stack">
        <section class="lobby-panel">
            <div class="lobby-toolbar">
                <div class="lobby-toolbar-actions" style="flex: 1; max-width: 34rem;">
                    <input v-model="keyword" class="lobby-input" type="search" placeholder="搜尋遊戲名稱、代碼或類型" aria-label="搜尋遊戲" />
                </div>
                <div class="lobby-segmented" aria-label="遊戲狀態篩選">
                    <button :class="{ 'is-active': statusFilter === '全部' }" @click="statusFilter = '全部'">全部</button>
                    <button :class="{ 'is-active': statusFilter === '已推出' }" @click="statusFilter = '已推出'">已推出</button>
                    <button :class="{ 'is-active': statusFilter === '即將開放' }" @click="statusFilter = '即將開放'">即將開放</button>
                    <button :class="{ 'is-active': statusFilter === '維護中' }" @click="statusFilter = '維護中'">維護中</button>
                </div>
            </div>

            <div class="lobby-table-wrap">
                <table class="lobby-table">
                    <thead>
                        <tr>
                            <th>遊戲</th>
                            <th>版號</th>
                            <th>上架時間</th>
                            <th>狀態</th>
                            <th>RTP</th>
                            <th>波動度</th>
                            <th>最高倍率</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="game in filteredGames" :key="game.id">
                            <td>
                                <div class="lobby-game-mini">
                                    <div class="lobby-game-mini-art" :class="game.art" aria-hidden="true" />
                                    <div><strong>{{ game.name }}</strong><small>{{ game.code }} · {{ game.type }}</small></div>
                                </div>
                            </td>
                            <td>{{ game.version }}</td>
                            <td>{{ game.releaseAt }}</td>
                            <td><span class="lobby-status" :class="statusClass(game.status)">{{ game.status }}</span></td>
                            <td><strong>{{ game.rtp.toFixed(2) }}%</strong></td>
                            <td>{{ game.volatility }}</td>
                            <td>{{ game.maxMultiplier }}</td>
                            <td>
                                <div class="lobby-toolbar-actions">
                                    <router-link class="lobby-button is-quiet" :to="{ name: 'GameLobbyManagement', query: { gameId: game.id } }">詳情</router-link>
                                    <router-link class="lobby-link" :to="{ name: 'GameLobbyPreview', query: { gameId: game.id } }">預覽</router-link>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    </div>
</template>
