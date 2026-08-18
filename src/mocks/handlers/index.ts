import { authHandlers } from './auth'
import { dashboardAdminHandlers } from './dashboardAdmin'
import { gameHandlers } from './games'
import { gameAdminHandlers } from './gameAdmin'
import { orderAdminHandlers } from './orderAdmin'
import { playerHandlers } from './players'
import { financeHandlers } from './finance'
import { settingsHandlers } from './settings'
import { aggregatorsHandlers } from './aggregators'
import { agentAdminHandlers } from './agentAdmin'
import { merchantAdminHandlers } from './merchantAdmin'
import { platformHandlers } from './platforms'
import { reportAdminHandlers } from './reportAdmin'
import { riskAdminHandlers } from './riskAdmin'
import { systemAdminHandlers } from './systemAdmin'
import { jackpotAdminHandlers } from './jackpotAdmin'
import { subAccountAdminHandlers } from './subAccountAdmin'
import { providerGameRoundHandlers } from './providerGameRounds'
import { providerGameLifecycleHandlers } from './providerGameLifecycle'

export const handlers = [
    ...authHandlers,
    ...dashboardAdminHandlers,
    ...gameHandlers,
    ...gameAdminHandlers,
    ...orderAdminHandlers,
    ...playerHandlers,
    ...financeHandlers,
    ...settingsHandlers,
    ...aggregatorsHandlers,
    ...agentAdminHandlers,
    ...merchantAdminHandlers,
    ...platformHandlers,
    ...reportAdminHandlers,
    ...riskAdminHandlers,
    ...systemAdminHandlers,
    ...jackpotAdminHandlers,
    ...subAccountAdminHandlers,
    ...providerGameRoundHandlers,
    ...providerGameLifecycleHandlers,
]
