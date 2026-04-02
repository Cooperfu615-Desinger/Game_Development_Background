import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useStorage } from '@vueuse/core'

export type UserRole = 'MASTER' | 'MERCHANT'

export interface UserInfo {
    name: string
    role: UserRole
    merchantCode?: string // Only for MERCHANT role
}

export const useAuthStore = defineStore('auth', () => {
    // Persisted state using @vueuse/core for automatic localStorage sync
    const token = useStorage<string | null>('auth_token', null)
    const userRole = useStorage<UserRole | null>('auth_role', null)
    const userInfo = useStorage<UserInfo | null>('auth_user', null)

    // Computed getters
    const isAuthenticated = computed(() => !!token.value)
    const isMaster = computed(() => userRole.value === 'MASTER')
    const isMerchant = computed(() => userRole.value === 'MERCHANT')

    /**
     * Login action - calls mock API and stores credentials
     * @param username - Username
     * @param password - Password
     * @returns Promise resolving to success boolean
     */
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
                userRole.value = data.role
                userInfo.value = {
                    name: data.name,
                    role: data.role,
                    merchantCode: data.code
                }
                return { success: true }
            } else {
                return { success: false, message: data.message || 'Login failed' }
            }
        } catch (error) {
            console.error('Login error:', error)
            return { success: false, message: 'Network error' }
        }
    }

    /**
     * Logout action - clears all auth state
     */
    const logout = () => {
        token.value = null
        userRole.value = null
        userInfo.value = null
    }

    /**
     * Check if user is authenticated (for route guards)
     * @returns boolean indicating authentication status
     */
    const checkAuth = (): boolean => {
        return !!token.value && !!userRole.value
    }

    /**
     * Check if user can access a specific role's routes
     * @param requiredRole - The role required to access the route
     * @returns boolean indicating access permission
     */
    const canAccessRole = (requiredRole: 'master' | 'merchant'): boolean => {
        if (!isAuthenticated.value) return false

        // MASTER can access everything (god mode for testing)
        if (isMaster.value) return true

        // MERCHANT can only access merchant routes
        if (requiredRole === 'merchant' && isMerchant.value) return true

        return false
    }

    return {
        // State
        token,
        userRole,
        userInfo,
        // Getters
        isAuthenticated,
        isMaster,
        isMerchant,
        // Actions
        login,
        logout,
        checkAuth,
        canAccessRole
    }
})
