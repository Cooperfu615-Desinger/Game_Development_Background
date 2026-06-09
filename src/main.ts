import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import router from './router'
import './style.css'
import App from './App.vue'
import i18n from './i18n'
import './plugins/echarts'
import { setupPrimeVue } from './plugins/primevue'

async function prepareApp() {
    const { worker } = await import('./mocks/browser')
    await worker.start({
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
