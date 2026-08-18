import { delay, http, HttpResponse } from 'msw'
import {
    approveRelease,
    createRollbackRelease,
    createVersionDraft,
    executeRelease,
    getLifecycleSnapshot,
    updateGameAvailability,
    updateVersionStatus,
} from '@/mocks/providerGameLifecycle'
import type {
    CreateVersionDraftPayload,
    UpdateAvailabilityPayload,
    UpdateVersionStatusPayload,
} from '@/types/providerGameLifecycle'

function errorResponse(error: unknown) {
    const code = error instanceof Error ? error.message : 'unknown_error'
    const status = code.endsWith('_not_found') ? 404 : 409
    return HttpResponse.json({ code }, { status })
}

export const providerGameLifecycleHandlers = [
    http.get('/api/provider/game-lifecycle', async () => {
        await delay(220)
        return HttpResponse.json(getLifecycleSnapshot())
    }),

    http.post('/api/provider/game-lifecycle/versions', async ({ request }) => {
        await delay(220)
        try {
            return HttpResponse.json(createVersionDraft(await request.json() as CreateVersionDraftPayload), { status: 201 })
        } catch (error) {
            return errorResponse(error)
        }
    }),

    http.patch('/api/provider/game-lifecycle/versions/:id/status', async ({ params, request }) => {
        await delay(180)
        try {
            const body = await request.json() as UpdateVersionStatusPayload
            return HttpResponse.json(updateVersionStatus(String(params.id), body.status))
        } catch (error) {
            return errorResponse(error)
        }
    }),

    http.patch('/api/provider/game-lifecycle/releases/:id/approve', async ({ params }) => {
        await delay(220)
        try {
            return HttpResponse.json(approveRelease(String(params.id)))
        } catch (error) {
            return errorResponse(error)
        }
    }),

    http.patch('/api/provider/game-lifecycle/releases/:id/execute', async ({ params }) => {
        await delay(420)
        try {
            return HttpResponse.json(executeRelease(String(params.id)))
        } catch (error) {
            return errorResponse(error)
        }
    }),

    http.post('/api/provider/game-lifecycle/releases/:id/rollback', async ({ params }) => {
        await delay(260)
        try {
            return HttpResponse.json(createRollbackRelease(String(params.id)), { status: 201 })
        } catch (error) {
            return errorResponse(error)
        }
    }),

    http.patch('/api/provider/game-lifecycle/games/:id/availability', async ({ params, request }) => {
        await delay(240)
        try {
            const body = await request.json() as UpdateAvailabilityPayload
            return HttpResponse.json(updateGameAvailability(String(params.id), body.availability, body.reason))
        } catch (error) {
            return errorResponse(error)
        }
    }),
]
