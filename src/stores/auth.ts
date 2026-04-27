import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useStorage } from '@vueuse/core'

export interface UserInfo {
    name: string
    email?: string
}

export const useAuthStore = defineStore('auth', () => {
    // sessionStorage：關閉瀏覽器或換瀏覽器後 token 失效，強制重新登入
    const token = useStorage<string | null>('auth_token', null, sessionStorage)
    const userInfo = useStorage<UserInfo | null>('auth_user', null, sessionStorage)

    const isAuthenticated = computed(() => !!token.value)

    const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })

            const data = await response.json()

            if (data.success) {
                token.value = data.token
                userInfo.value = { name: data.name, email: data.email }
                return { success: true }
            } else {
                return { success: false, message: data.message || 'Login failed' }
            }
        } catch (error) {
            console.error('Login error:', error)
            return { success: false, message: 'Network error' }
        }
    }

    const logout = () => {
        token.value = null
        userInfo.value = null
    }

    return {
        token,
        userInfo,
        isAuthenticated,
        login,
        logout
    }
})
