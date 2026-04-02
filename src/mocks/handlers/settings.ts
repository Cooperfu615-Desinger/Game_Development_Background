import { http, HttpResponse, delay } from 'msw'
import { faker } from '@faker-js/faker'

interface ApiKey {
    id: string
    name: string
    key: string
    createdAt: string
    lastUsedAt: string | null
    status: 'active' | 'revoked'
}

interface Permission {
    id: string
    role: string
    description: string
    permissions: string[]
}

const mockApiKeys: ApiKey[] = [
    {
        id: 'key-001',
        name: 'Production API Key',
        key: 'gd_prod_' + faker.string.alphanumeric(32),
        createdAt: faker.date.past({ years: 1 }).toISOString(),
        lastUsedAt: faker.date.recent({ days: 3 }).toISOString(),
        status: 'active'
    },
    {
        id: 'key-002',
        name: 'Staging API Key',
        key: 'gd_stg_' + faker.string.alphanumeric(32),
        createdAt: faker.date.past({ years: 1 }).toISOString(),
        lastUsedAt: faker.date.recent({ days: 14 }).toISOString(),
        status: 'active'
    },
    {
        id: 'key-003',
        name: 'Old Development Key',
        key: 'gd_dev_' + faker.string.alphanumeric(32),
        createdAt: faker.date.past({ years: 2 }).toISOString(),
        lastUsedAt: null,
        status: 'revoked'
    }
]

const mockPermissions: Permission[] = [
    { id: 'role-001', role: 'Admin', description: '系統管理員', permissions: ['read', 'write', 'delete', 'manage'] },
    { id: 'role-002', role: 'Developer', description: '遊戲開發者', permissions: ['read', 'write'] },
    { id: 'role-003', role: 'Analyst', description: '數據分析師', permissions: ['read'] },
    { id: 'role-004', role: 'Finance', description: '財務人員', permissions: ['read', 'finance'] }
]

export const settingsHandlers = [
    // API Keys
    http.get('/api/settings/api-keys', async () => {
        await delay(300)
        return HttpResponse.json({ code: 0, data: { items: mockApiKeys } })
    }),

    http.post('/api/settings/api-keys', async ({ request }) => {
        await delay(500)
        const body = await request.json() as { name: string }
        const newKey: ApiKey = {
            id: `key-${faker.string.alphanumeric(6)}`,
            name: body.name,
            key: 'gd_' + faker.string.alphanumeric(32),
            createdAt: new Date().toISOString(),
            lastUsedAt: null,
            status: 'active'
        }
        mockApiKeys.unshift(newKey)
        return HttpResponse.json({ code: 0, data: newKey })
    }),

    http.delete('/api/settings/api-keys/:id', async ({ params }) => {
        await delay(400)
        const idx = mockApiKeys.findIndex(k => k.id === params.id)
        if (idx !== -1) mockApiKeys[idx]!.status = 'revoked'
        return HttpResponse.json({ code: 0 })
    }),

    // Permissions
    http.get('/api/settings/permissions', async () => {
        await delay(300)
        return HttpResponse.json({ code: 0, data: { items: mockPermissions } })
    })
]
