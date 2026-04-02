import { createApp } from 'vue'
import { createPinia } from 'pinia'
import naive from 'naive-ui'
import router from './router'
import './style.css'
import App from './App.vue'
import i18n from './i18n'
import './plugins/echarts'

async function prepareApp() {
    const { worker } = await import('./mocks/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
}

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(naive)
app.use(i18n)

prepareApp().then(() => {
    app.mount('#app')
}).catch(e => {
    console.error('Failed to start MSW:', e)
    app.mount('#app')
})
