import { authHandlers } from './auth'
import { dashboardHandlers } from './dashboard'
import { gameHandlers } from './games'

export const handlers = [
    ...authHandlers,
    ...dashboardHandlers,
    ...gameHandlers
]
