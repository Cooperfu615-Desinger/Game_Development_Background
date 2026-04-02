import { authHandlers } from './auth'
import { dashboardHandlers } from './dashboard'
import { gameHandlers } from './games'
import { playerHandlers } from './players'
import { financeHandlers } from './finance'
import { settingsHandlers } from './settings'

export const handlers = [
    ...authHandlers,
    ...dashboardHandlers,
    ...gameHandlers,
    ...playerHandlers,
    ...financeHandlers,
    ...settingsHandlers
]
