/**
 * PrimeVue 4 設定 — Apple HIG 主題
 *
 * 採用 Aura preset，覆寫成仿 macOS Sonoma / iCloud 風格：
 *   - 主色：Apple Blue (#007AFF)
 *   - 圓角：偏圓潤
 *   - 表面色：白霧 / 深炭灰
 *   - CSS layer 順序確保與 Tailwind 共存
 *
 * 與既有 Naive UI 並存（Phase 1~4 過渡期）
 */
import type { App } from 'vue'
import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'
import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

// ─── Apple HIG Preset ──────────────────────────────────────────────────────
//
// 仿 Apple 系統色票（取自 Apple HIG colour list）
// Light:  iCloud 後台 / System Preferences 風格
// Dark:   macOS Sonoma Dark Mode 風格
//
const AppleHIG = definePreset(Aura, {
    semantic: {
        primary: {
            50:  '#E6F2FF',
            100: '#BCDEFF',
            200: '#8EC8FF',
            300: '#5DB1FF',
            400: '#3399FF',
            500: '#007AFF',   // ← Apple Blue (主色)
            600: '#0064D1',
            700: '#0050A4',
            800: '#003D7A',
            900: '#002952',
            950: '#001833',
        },
        // Apple System Colors
        green:    { 500: '#34C759' },
        orange:   { 500: '#FF9500' },
        red:      { 500: '#FF3B30' },
        yellow:   { 500: '#FFCC00' },
        purple:   { 500: '#AF52DE' },
        pink:     { 500: '#FF2D55' },
        indigo:   { 500: '#5856D6' },
        teal:     { 500: '#5AC8FA' },

        colorScheme: {
            light: {
                surface: {
                    0:   '#FFFFFF',
                    50:  '#F9FAFB',
                    100: '#F2F4F7',
                    200: '#E4E7EC',
                    300: '#D0D5DD',
                    400: '#98A2B3',
                    500: '#667085',
                    600: '#475467',
                    700: '#344054',
                    800: '#1D2939',
                    900: '#101828',
                    950: '#0C111D',
                },
                primary: {
                    color: '{primary.500}',
                    contrastColor: '#ffffff',
                    hoverColor: '{primary.600}',
                    activeColor: '{primary.700}',
                },
            },
            dark: {
                surface: {
                    // 方向必須與 Aura 一致：0=最亮、950=最深。
                    // Aura dark 把 content.background 映到 {surface.900}、
                    // formField.background 映到 {surface.950}，故卡片/輸入框取
                    // 高 index 的深色。先前此 scale 寫反（0=深、950=白）→ 輸入框
                    // 變白底白字。
                    0:   '#FFFFFF',
                    50:  '#F2F2F7',
                    100: '#E5E5EA',
                    200: '#D1D1D6',
                    300: '#C7C7CC',
                    400: '#AEAEB2',
                    500: '#8E8E93',
                    600: '#636366',
                    700: '#48484A',
                    800: '#2C2C2E',
                    900: '#1C1C1E',    // content.background — 卡片 / Modal / 表格
                    950: '#000000',    // formField.background — 輸入框（macOS 深色系統底）
                },
                primary: {
                    color: '{primary.400}',
                    contrastColor: '#000000',
                    hoverColor: '{primary.300}',
                    activeColor: '{primary.200}',
                },
            },
        },
    },
})

// ─── Install ───────────────────────────────────────────────────────────────
export function setupPrimeVue(app: App) {
    app.use(PrimeVue, {
        theme: {
            preset: AppleHIG,
            options: {
                // 用 .app-dark class 切換深色模式（PrimeVue 只能正確生成純
                // class 選擇器；帶 html/:root 前綴會被錯誤巢狀成 `& :root` 而失效）。
                darkModeSelector: '.app-dark',
                // 不啟用 cssLayer：開啟時 PrimeVue 會把 token 同時輸出到
                // @layer primevue 與 unlayered :root，unlayered 亮色 :root 因注入
                // 順序在後而蓋掉深色 .app-dark → 深色完全失效（卡片/輸入框維持亮色）。
                // 本專案的 Tailwind utility（flex/gap/grid/w-full）只用在純 div 與
                // VChart，不落在 PrimeVue 元件上，故移除 cssLayer 無 utility 覆蓋衝突。
            },
        },
        ripple: true,
    })
    app.use(ConfirmationService)
    app.use(ToastService)
}
