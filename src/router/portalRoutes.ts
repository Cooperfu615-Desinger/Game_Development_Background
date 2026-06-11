// src/router/portalRoutes.ts
// 前綴路由 factory：用同一批共用元件，產生 /agent/* /merchant/* 前綴路由，
// 差異由 meta.portal 表達。C2 起 def 可帶 permission → 啟用 meta.permission 守衛。
import type { RouteRecordRaw } from 'vue-router'
import type { PortalType } from '@/types/portal'

export interface PortalRouteDef {
    path: string
    name: string
    component: () => Promise<unknown>
    titleKey: string
    permission?: string
}

export function portalRoutes(portal: PortalType, defs: PortalRouteDef[]): RouteRecordRaw[] {
    return defs.map((d) => ({
        path: `${portal}/${d.path}`,
        name: `${portal}-${d.name}`,
        component: d.component as RouteRecordRaw['component'],
        meta: {
            title: d.titleKey,
            portal,
            requiresAuth: true,
            ...(d.permission ? { permission: d.permission } : {}),
        },
    }))
}
