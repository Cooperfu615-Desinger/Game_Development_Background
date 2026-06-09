import { authHandlers } from './auth'
import { dashboardHandlers } from './dashboard'
import { gameHandlers } from './games'
import { gameAdminHandlers } from './gameAdmin'
import { orderAdminHandlers } from './orderAdmin'
import { playerHandlers } from './players'
import { financeHandlers } from './finance'
import { settingsHandlers } from './settings'
import { aggregatorsHandlers } from './aggregators'
import { platformHandlers } from './platforms'
import { reportAdminHandlers } from './reportAdmin'
import { riskAdminHandlers } from './riskAdmin'
import { systemAdminHandlers } from './systemAdmin'

export const handlers = [
    ...authHandlers,
    ...dashboardHandlers,
    ...gameHandlers,
    ...gameAdminHandlers,
    ...orderAdminHandlers,
    ...playerHandlers,
    ...financeHandlers,
    ...settingsHandlers,
    ...aggregatorsHandlers,
    ...platformHandlers,
    ...reportAdminHandlers,
    ...riskAdminHandlers,
    ...systemAdminHandlers,
]
