import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import type { User, UserRole, Permission } from '../../shared/types'
import { ROLE_PERMISSIONS } from '../../shared/constants'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value && !!token.value)

  const hasRole = (role: UserRole): boolean => {
    return user.value?.roles.includes(role) ?? false
  }

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.some(role => hasRole(role))
  }

  const isAdmin = computed(() => hasRole('admin'))

  const login = (userData: User, authToken: string) => {
    user.value = userData
    token.value = authToken
    localStorage.setItem('sistop-token', authToken)
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('sistop-token')
  }

  // Gera permissões baseadas nos roles
  const generatePermissions = (roles: UserRole[]) => {
    const permissions = new Set<string>()
    roles.forEach(role => {
      const rolePermissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS]
      if (rolePermissions) {
        rolePermissions.forEach(permission => permissions.add(permission))
      }
    })
    return Array.from(permissions) as Permission[]
  }

  // Simular usuário logado para desenvolvimento
  const simulateLogin = (userType: 'admin' | 'produtor' | 'roteirista' | 'pesquisador' = 'admin') => {
    let mockUser: User
    
    switch (userType) {
      case 'produtor':
        mockUser = {
          id: '2',
          name: 'João Produtor',
          email: 'produtor@sistop.com',
          roles: ['produtor'],
          permissions: generatePermissions(['produtor']),
          avatar: 'https://via.placeholder.com/40'
        }
        break
      case 'roteirista':
        mockUser = {
          id: '3',
          name: 'Maria Roteirista',
          email: 'roteirista@sistop.com',
          roles: ['roteirista'],
          permissions: generatePermissions(['roteirista']),
          avatar: 'https://via.placeholder.com/40'
        }
        break
      case 'pesquisador':
        mockUser = {
          id: '4',
          name: 'Carlos Pesquisador',
          email: 'pesquisador@sistop.com',
          roles: ['pesquisador'],
          permissions: generatePermissions(['pesquisador']),
          avatar: 'https://via.placeholder.com/40'
        }
        break
      default:
        mockUser = {
          id: '1',
          name: 'Admin User',
          email: 'admin@sistop.com',
          roles: ['admin'],
          permissions: generatePermissions(['admin']),
          avatar: 'https://via.placeholder.com/40'
        }
    }
    
    login(mockUser, 'mock-token-123')
  }

  return {
    user: readonly(user),
    token: readonly(token),
    isAuthenticated,
    isAdmin,
    hasRole,
    hasAnyRole,
    login,
    logout,
    simulateLogin
  }
})