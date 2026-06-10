import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  base: '/Game_Development_Background/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    // 兩個合理的大 chunk：vendor-primevue（996KB/gzip 206KB，全站共用的
    // 設計系統，hash 穩定可長期快取）與 mocks browser chunk（789KB，
    // dynamic import 不阻塞首屏）。頁面 chunk 仍以預設 500KB 為心理目標。
    chunkSizeWarningLimit: 1024,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined

          // Mock 基礎設施（msw/faker）不在這裡指定：強制併成單一 chunk 會把
          // faker 全部 locale 拉進來（788KB → 3.2MB）；維持 main.ts dynamic
          // import 的自然邊界即可

          // 圖表庫 — echarts 只有 Platforms / Players 用（隨頁面 chunk 載入）
          if (/node_modules\/(echarts|zrender|vue-echarts)\//.test(id)) return 'vendor-echarts'
          if (/node_modules\/chart\.js\//.test(id)) return 'vendor-chartjs'

          // PrimeVue 生態
          if (/node_modules\/(primevue|@primevue|@primeuix|primeicons|tailwindcss-primeui)\//.test(id)) return 'vendor-primevue'

          // Vue 核心生態 — 幾乎所有 chunk 都依賴
          if (/node_modules\/(vue|@vue|vue-router|pinia|pinia-plugin-persistedstate|vue-i18n|@intlify|vue-demi|@vueuse)\//.test(id)) return 'vendor-vue'

          return undefined
        }
      }
    }
  }
})
