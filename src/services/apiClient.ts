// src/services/apiClient.ts
// 單一 API 出口：自動附 mock bearer token、統一錯誤。
// 換真後端時只改本檔（base URL / 真 token 來源）。
import { useAuthStore } from '@/stores/auth'

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const auth = useAuthStore()
    const headers: Record<string, string> = {}
    if (auth.token) headers['Authorization'] = `Bearer ${auth.token}`
    const init: RequestInit = { method, headers }
    if (body !== undefined) {
        headers['Content-Type'] = 'application/json'
        init.body = JSON.stringify(body)
    }
    const res = await fetch(path, init)
    if (!res.ok) throw new Error(`API ${method} ${path} failed: ${res.status}`)
    const text = await res.text()
    return (text ? JSON.parse(text) : null) as T
}

export const api = {
    get: <T = unknown>(path: string) => request<T>('GET', path),
    post: <T = unknown>(path: string, body?: unknown) => request<T>('POST', path, body),
    put: <T = unknown>(path: string, body?: unknown) => request<T>('PUT', path, body),
    patch: <T = unknown>(path: string, body?: unknown) => request<T>('PATCH', path, body),
    del: <T = unknown>(path: string) => request<T>('DELETE', path),
}
