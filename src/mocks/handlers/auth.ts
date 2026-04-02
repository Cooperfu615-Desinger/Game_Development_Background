import { http, HttpResponse, delay } from 'msw'

export const authHandlers = [
    http.post('/api/login', async ({ request }) => {
        await delay(500)
        const body = await request.json() as { username: string; password: string }
        const { username, password } = body

        if (username === 'developer' && password === 'dev123') {
            return HttpResponse.json({
                success: true,
                token: 'mock-developer-token-' + Date.now(),
                name: 'Game Developer',
                email: 'dev@example.com'
            })
        }

        return HttpResponse.json({
            success: false,
            message: 'Invalid username or password'
        }, { status: 401 })
    })
]
