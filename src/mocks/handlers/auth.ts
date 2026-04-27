import { http, HttpResponse, delay } from 'msw'

const USERS = [
    {
        username: 'admin',
        password: 'admin123',
        token: 'mock-admin-token',
        name: '總管理員',
        email: 'admin@gamedev.com'
    },
    {
        username: 'tech',
        password: 'tech123',
        token: 'mock-tech-token',
        name: '技術工程師',
        email: 'tech@gamedev.com'
    },
    {
        username: 'pm',
        password: 'pm123',
        token: 'mock-pm-token',
        name: 'Product Manager',
        email: 'pm@gamedev.com'
    },
    {
        username: 'developer',
        password: 'dev123',
        token: 'mock-developer-token',
        name: 'Game Developer',
        email: 'dev@example.com'
    },
]

export const authHandlers = [
    http.post('/api/login', async ({ request }) => {
        await delay(400)
        const body = await request.json() as { username: string; password: string }
        const user = USERS.find(
            u => u.username === body.username && u.password === body.password
        )

        if (user) {
            return HttpResponse.json({
                success: true,
                token: user.token + '-' + Date.now(),
                name: user.name,
                email: user.email
            })
        }

        return HttpResponse.json({
            success: false,
            message: '帳號或密碼錯誤'
        }, { status: 401 })
    })
]
