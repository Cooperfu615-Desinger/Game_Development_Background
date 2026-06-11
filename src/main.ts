import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import router from './router'
import './style.css'
import App from './App.vue'
import i18n from './i18n'
// echarts 註冊已移到使用它的元件（Platforms/Players），不進首屏 bundle
import { setupPrimeVue } from './plugins/primevue'

async function prepareApp() {
    const { worker } = await import('./mocks/browser')
    await worker.start({
        // 靜音 MSW 內建的逐請求 console log（Request/Handler/Response 刷屏，
        // 長 session 多次 HMR 後更出現雙倍輸出）。本專案是 mock-backed demo，
        // 正式環境亦掛 MSW，故不能停掉 worker，只關掉它的日誌（QA C-1）。
        quiet: true,
        onUnhandledRequest: 'bypass',
        serviceWorker: {
            // BASE_URL 在本地是 '/'，GitHub Pages 是 '/Game_Development_Background/'
            url: import.meta.env.BASE_URL + 'mockServiceWorker.js'
        }
    })
}

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
app.use(router)
setupPrimeVue(app)
app.use(i18n)

prepareApp().then(() => {
    app.mount('#app')
}).catch(e => {
    console.error('Failed to start MSW:', e)
    app.mount('#app')
})
