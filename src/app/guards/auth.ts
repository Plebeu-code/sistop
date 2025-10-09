import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useUserStore } from '../stores'
import { useRBAC } from '../../shared/composables/useRBAC'
import type { UserRole, Permission } from '../../shared/types'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    roles?: UserRole[]
    permissions?: Permission[]
  }
}

export const authGuard = (
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const userStore = useUserStore()
  const rbac = useRBAC()
  
  const requiresAuth = to.meta?.requiresAuth ?? true
  const requiredRoles = to.meta?.roles
  const requiredPermissions = to.meta?.permissions

  // If route doesn't require auth, allow access
  if (!requiresAuth) {
    next()
    return
  }

  // If user is not authenticated, redirect to login
  if (!userStore.isAuthenticated) {
    next('/login')
    return
  }

  // Check permissions first (more granular)
  if (requiredPermissions && requiredPermissions.length > 0) {
    if (rbac.canAny(requiredPermissions)) {
      next()
      return
    } else {
      next('/unauthorized')
      return
    }
  }

  // Fallback to roles check
  if (requiredRoles && requiredRoles.length > 0) {
    if (userStore.hasAnyRole(requiredRoles)) {
      next()
      return
    } else {
      next('/unauthorized')
      return
    }
  }

  // If no specific roles or permissions required, allow access for authenticated users
  next()
}