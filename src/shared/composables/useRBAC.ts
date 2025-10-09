import { computed } from 'vue'
import { useUserStore } from '../../app/stores'
import { ROLE_PERMISSIONS } from '../constants'
import type { UserRole, Permission } from '../types'

export function useRBAC() {
  const userStore = useUserStore()

  const user = computed(() => userStore.user)
  const isAuthenticated = computed(() => userStore.isAuthenticated)

  // Verifica se o usuário tem um papel específico
  const hasRole = (role: UserRole): boolean => {
    return userStore.hasRole(role)
  }

  // Verifica se o usuário tem qualquer um dos papéis especificados
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return userStore.hasAnyRole(roles)
  }

  // Verifica se o usuário tem uma permissão específica
  const can = (permission: Permission): boolean => {
    if (!user.value) return false

    // Verifica se o usuário tem a permissão diretamente
    if (user.value.permissions?.includes(permission)) {
      return true
    }

    // Verifica se algum dos roles do usuário tem a permissão
    return user.value.roles.some(role => {
      const rolePermissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS]
      return rolePermissions?.includes(permission as never)
    })
  }

  // Verifica se o usuário tem qualquer uma das permissões especificadas
  const canAny = (permissions: Permission[]): boolean => {
    return permissions.some(permission => can(permission))
  }

  // Verifica se o usuário tem todas as permissões especificadas
  const canAll = (permissions: Permission[]): boolean => {
    return permissions.every(permission => can(permission))
  }

  // Shortcut para verificar se é admin
  const isAdmin = computed(() => hasRole('admin'))

  // Shortcut para verificar papéis específicos
  const isProdutor = computed(() => hasRole('produtor'))
  const isRoteirista = computed(() => hasRole('roteirista'))
  const isPesquisador = computed(() => hasRole('pesquisador'))

  return {
    user,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    can,
    canAny,
    canAll,
    isAdmin,
    isProdutor,
    isRoteirista,
    isPesquisador
  }
}