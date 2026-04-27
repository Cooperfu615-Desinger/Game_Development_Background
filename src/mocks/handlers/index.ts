import { authHandlers } from './auth'
import { dashboardHandlers } from './dashboard'
import { gameHandlers } from './games'
import { playerHandlers } from './players'
import { financeHandlers } from './finance'
import { settingsHandlers } from './settings'
import { aggregatorsHandlers } from './aggregators'
import { platformHandlers } from './platforms'

export const handlers = [
    ...authHandlers,
    ...dashboardHandlers,
    ...gameHandlers,
    ...playerHandlers,
    ...financeHandlers,
    ...settingsHandlers,
    ...aggregatorsHandlers,
    ...platformHandlers,
]
