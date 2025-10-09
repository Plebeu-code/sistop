import type { App, DirectiveBinding } from 'vue'
import { useUserStore } from '../../app/stores'
import { ROLE_PERMISSIONS } from '../constants'
import type { UserRole, Permission } from '../types'

interface CanBinding {
  permission?: Permission
  role?: UserRole
  permissions?: Permission[]
  roles?: UserRole[]
  requireAll?: boolean // Para permissions/roles, se deve ter todas (AND) ou pelo menos uma (OR)
}

function checkPermission(
  user: any,
  permission: Permission
): boolean {
  if (!user) return false

  // Verifica se o usuário tem a permissão diretamente
  if (user.permissions?.includes(permission)) {
    return true
  }

  // Verifica se algum dos roles do usuário tem a permissão
  return user.roles.some((role: UserRole) => {
    const rolePermissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS]
    return rolePermissions?.includes(permission as never)
  })
}

function evaluateBinding(binding: DirectiveBinding<CanBinding>): boolean {
  const userStore = useUserStore()
  const user = userStore.user

  if (!user || !userStore.isAuthenticated) {
    return false
  }

  const value = binding.value

  // Se for uma string, trata como permissão
  if (typeof value === 'string') {
    return checkPermission(user, value as Permission)
  }

  // Se for um objeto com configurações
  if (typeof value === 'object' && value !== null) {
    // Verifica permissão única
    if (value.permission) {
      return checkPermission(user, value.permission)
    }

    // Verifica role único
    if (value.role) {
      return user.roles.includes(value.role)
    }

    // Verifica múltiplas permissões
    if (value.permissions && Array.isArray(value.permissions)) {
      if (value.requireAll) {
        return value.permissions.every(permission => checkPermission(user, permission))
      } else {
        return value.permissions.some(permission => checkPermission(user, permission))
      }
    }

    // Verifica múltiplos roles
    if (value.roles && Array.isArray(value.roles)) {
      if (value.requireAll) {
        return value.roles.every(role => user.roles.includes(role))
      } else {
        return value.roles.some(role => user.roles.includes(role))
      }
    }
  }

  return false
}

export const vCan = {
  mounted(el: HTMLElement, binding: DirectiveBinding<CanBinding>) {
    const hasPermission = evaluateBinding(binding)
    
    if (!hasPermission) {
      // Remove o elemento se não tiver permissão
      el.style.display = 'none'
      el.setAttribute('data-v-can-hidden', 'true')
    }
  },

  updated(el: HTMLElement, binding: DirectiveBinding<CanBinding>) {
    const hasPermission = evaluateBinding(binding)
    
    if (hasPermission) {
      if (el.getAttribute('data-v-can-hidden') === 'true') {
        el.style.display = ''
        el.removeAttribute('data-v-can-hidden')
      }
    } else {
      el.style.display = 'none'
      el.setAttribute('data-v-can-hidden', 'true')
    }
  }
}

// Plugin para registrar a diretiva globalmente
export const RBACPlugin = {
  install(app: App) {
    app.directive('can', vCan)
  }
}