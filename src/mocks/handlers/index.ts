import { authHandlers } from './auth'
import { dashboardHandlers } from './dashboard'
import { gameHandlers } from './games'
import { playerHandlers } from './players'

export const handlers = [
    ...authHandlers,
    ...dashboardHandlers,
    ...gameHandlers,
    ...playerHandlers
]
