// src/router/portalRoutes.ts
// 前綴路由 factory：用同一批共用元件，產生 /agent/* /merchant/* 前綴路由，
// 差異由 meta.portal 表達。C1 只接共用頁；C2 再加 Portal 專屬頁。
import type { RouteRecordRaw } from 'vue-router'
import type { PortalType } from '@/types/portal'

interface PortalRouteDef {
    path: string
    name: string
    component: () => Promise<unknown>
    titleKey: string
}

export function portalRoutes(portal: PortalType, defs: PortalRouteDef[]): RouteRecordRaw[] {
    return defs.map((d) => ({
        path: `${portal}/${d.path}`,
        name: `${portal}-${d.name}`,
        component: d.component as RouteRecordRaw['component'],
        meta: { title: d.titleKey, portal, requiresAuth: true },
    }))
}
