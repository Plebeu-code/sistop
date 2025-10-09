import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AdminUser, Projeto, VoiceProfile, Canal, User, UserRole } from '@/shared/types'
import { useToastStore } from './toast'

/**
 * Store para gerenciar Admin - Usuários, Projetos, Canais, Vozes
 * TAREFA 11 — Admin
 */
export const useAdminStore = defineStore('admin', () => {
  const toastStore = useToastStore()

  // Estado reativo
  const users = ref<AdminUser[]>([])
  const projetos = ref<Projeto[]>([])
  const voiceProfiles = ref<VoiceProfile[]>([])
  const canais = ref<Canal[]>([])
  const isLoading = ref(false)

  // Computeds
  const activeUsers = computed(() => users.value.filter(u => u.contaAtiva))
  const inactiveUsers = computed(() => users.value.filter(u => !u.contaAtiva))
  const adminUsers = computed(() => users.value.filter(u => u.roles.includes('admin')))
  
  const activeProjetos = computed(() => projetos.value.filter(p => p.status === 'ativo'))
  const activeVoices = computed(() => voiceProfiles.value.filter(v => v.ativo))
  
  const usersByRole = computed(() => {
    const stats: Record<UserRole, number> = {
      admin: 0,
      manager: 0,
      editor: 0,
      viewer: 0
    }
    
    users.value.forEach(user => {
      user.roles.forEach(role => {
        if (role in stats) {
          stats[role as UserRole]++
        }
      })
    })
    
    return stats
  })

  // ======================
  // USUÁRIOS
  // ======================
  
  async function fetchUsers() {
    isLoading.value = true
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (users.value.length === 0) {
        createMockUsers()
      }
      
      return users.value
    } finally {
      isLoading.value = false
    }
  }

  async function createUser(userData: Partial<AdminUser>): Promise<AdminUser> {
    isLoading.value = true
    try {
      const newUser: AdminUser = {
        id: generateId('user'),
        name: userData.name || '',
        email: userData.email || '',
        roles: userData.roles || ['viewer'],
        permissions: userData.permissions || [],
        avatar: userData.avatar,
        ultimoAcesso: undefined,
        tentativasLogin: 0,
        contaAtiva: true,
        configuracoes: {
          notificacoes: true,
          tema: 'light',
          idioma: 'pt-BR'
        }
      }

      users.value.push(newUser)
      toastStore.success('Usuário Criado', `${newUser.name} foi adicionado ao sistema`)
      
      return newUser
    } finally {
      isLoading.value = false
    }
  }

  async function updateUser(id: string, updates: Partial<AdminUser>): Promise<AdminUser | null> {
    isLoading.value = true
    try {
      const index = users.value.findIndex(u => u.id === id)
      if (index === -1) {
        throw new Error('Usuário não encontrado')
      }

      const updatedUser = {
        ...users.value[index],
        ...updates
      }

      users.value[index] = updatedUser
      toastStore.success('Usuário Atualizado', `${updatedUser.name} foi modificado`)
      
      return updatedUser
    } catch (error) {
      toastStore.error('Erro', 'Não foi possível atualizar o usuário')
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function deleteUser(id: string): Promise<boolean> {
    isLoading.value = true
    try {
      const index = users.value.findIndex(u => u.id === id)
      if (index === -1) {
        throw new Error('Usuário não encontrado')
      }

      const user = users.value[index]
      users.value.splice(index, 1)
      toastStore.success('Usuário Removido', `${user.name} foi removido do sistema`)
      
      return true
    } catch (error) {
      toastStore.error('Erro', 'Não foi possível remover o usuário')
      return false
    } finally {
      isLoading.value = false
    }
  }

  function toggleUserStatus(id: string) {
    const user = users.value.find(u => u.id === id)
    if (user) {
      user.contaAtiva = !user.contaAtiva
      const status = user.contaAtiva ? 'ativada' : 'desativada'
      toastStore.info('Status Alterado', `Conta de ${user.name} foi ${status}`)
    }
  }

  // ======================
  // PROJETOS
  // ======================

  async function fetchProjetos() {
    isLoading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 400))
      
      if (projetos.value.length === 0) {
        createMockProjetos()
      }
      
      return projetos.value
    } finally {
      isLoading.value = false
    }
  }

  async function createProjeto(projetoData: Partial<Projeto>): Promise<Projeto> {
    isLoading.value = true
    try {
      const newProjeto: Projeto = {
        id: generateId('proj'),
        nome: projetoData.nome || '',
        descricao: projetoData.descricao,
        status: projetoData.status || 'ativo',
        canais: projetoData.canais || [],
        configuracoes: {
          idiomasPadrao: ['pt-BR'],
          qualidadeVideo: '1080p',
          formatoExportacao: ['mp4', 'mov']
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }

      projetos.value.push(newProjeto)
      toastStore.success('Projeto Criado', `${newProjeto.nome} foi adicionado`)
      
      return newProjeto
    } finally {
      isLoading.value = false
    }
  }

  async function updateProjeto(id: string, updates: Partial<Projeto>): Promise<Projeto | null> {
    isLoading.value = true
    try {
      const index = projetos.value.findIndex(p => p.id === id)
      if (index === -1) {
        throw new Error('Projeto não encontrado')
      }

      const updatedProjeto = {
        ...projetos.value[index],
        ...updates,
        updatedAt: new Date()
      }

      projetos.value[index] = updatedProjeto
      toastStore.success('Projeto Atualizado', `${updatedProjeto.nome} foi modificado`)
      
      return updatedProjeto
    } catch (error) {
      toastStore.error('Erro', 'Não foi possível atualizar o projeto')
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function deleteProjeto(id: string): Promise<boolean> {
    isLoading.value = true
    try {
      const index = projetos.value.findIndex(p => p.id === id)
      if (index === -1) {
        throw new Error('Projeto não encontrado')
      }

      const projeto = projetos.value[index]
      projetos.value.splice(index, 1)
      toastStore.success('Projeto Removido', `${projeto.nome} foi removido`)
      
      return true
    } catch (error) {
      toastStore.error('Erro', 'Não foi possível remover o projeto')
      return false
    } finally {
      isLoading.value = false
    }
  }

  // ======================
  // VOZES
  // ======================

  async function fetchVoiceProfiles() {
    isLoading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      if (voiceProfiles.value.length === 0) {
        createMockVoices()
      }
      
      return voiceProfiles.value
    } finally {
      isLoading.value = false
    }
  }

  async function createVoiceProfile(voiceData: Partial<VoiceProfile>): Promise<VoiceProfile> {
    isLoading.value = true
    try {
      const newVoice: VoiceProfile = {
        id: generateId('voice'),
        nome: voiceData.nome || '',
        idioma: voiceData.idioma || 'pt-BR',
        genero: voiceData.genero || 'neutro',
        idade: voiceData.idade || 'adulto',
        estilo: voiceData.estilo || 'casual',
        provedor: voiceData.provedor || 'azure',
        configuracoes: {
          velocidade: 1.0,
          tom: 0,
          volume: 0.8,
          pausas: 1.0
        },
        ativo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      voiceProfiles.value.push(newVoice)
      toastStore.success('Voz Criada', `Perfil ${newVoice.nome} foi adicionado`)
      
      return newVoice
    } finally {
      isLoading.value = false
    }
  }

  async function updateVoiceProfile(id: string, updates: Partial<VoiceProfile>): Promise<VoiceProfile | null> {
    isLoading.value = true
    try {
      const index = voiceProfiles.value.findIndex(v => v.id === id)
      if (index === -1) {
        throw new Error('Perfil de voz não encontrado')
      }

      const updatedVoice = {
        ...voiceProfiles.value[index],
        ...updates,
        updatedAt: new Date()
      }

      voiceProfiles.value[index] = updatedVoice
      toastStore.success('Voz Atualizada', `${updatedVoice.nome} foi modificado`)
      
      return updatedVoice
    } catch (error) {
      toastStore.error('Erro', 'Não foi possível atualizar o perfil de voz')
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function deleteVoiceProfile(id: string): Promise<boolean> {
    isLoading.value = true
    try {
      const index = voiceProfiles.value.findIndex(v => v.id === id)
      if (index === -1) {
        throw new Error('Perfil de voz não encontrado')
      }

      const voice = voiceProfiles.value[index]
      voiceProfiles.value.splice(index, 1)
      toastStore.success('Voz Removida', `${voice.nome} foi removido`)
      
      return true
    } catch (error) {
      toastStore.error('Erro', 'Não foi possível remover o perfil de voz')
      return false
    } finally {
      isLoading.value = false
    }
  }

  function toggleVoiceStatus(id: string) {
    const voice = voiceProfiles.value.find(v => v.id === id)
    if (voice) {
      voice.ativo = !voice.ativo
      const status = voice.ativo ? 'ativada' : 'desativada'
      toastStore.info('Status Alterado', `Voz ${voice.nome} foi ${status}`)
    }
  }

  // ======================
  // CANAIS
  // ======================

  async function fetchCanais() {
    isLoading.value = true
    try {
      await new Promise(resolve => setTimeout(resolve, 200))
      
      if (canais.value.length === 0) {
        createMockCanais()
      }
      
      return canais.value
    } finally {
      isLoading.value = false
    }
  }

  async function createCanal(canalData: Partial<Canal>): Promise<Canal> {
    isLoading.value = true
    try {
      const newCanal: Canal = {
        id: generateId('canal'),
        nome: canalData.nome || '',
        descricao: canalData.descricao,
        cor: canalData.cor || '#3b82f6'
      }

      canais.value.push(newCanal)
      toastStore.success('Canal Criado', `${newCanal.nome} foi adicionado`)
      
      return newCanal
    } finally {
      isLoading.value = false
    }
  }

  async function updateCanal(id: string, updates: Partial<Canal>): Promise<Canal | null> {
    isLoading.value = true
    try {
      const index = canais.value.findIndex(c => c.id === id)
      if (index === -1) {
        throw new Error('Canal não encontrado')
      }

      const updatedCanal = { ...canais.value[index], ...updates }
      canais.value[index] = updatedCanal
      toastStore.success('Canal Atualizado', `${updatedCanal.nome} foi modificado`)
      
      return updatedCanal
    } catch (error) {
      toastStore.error('Erro', 'Não foi possível atualizar o canal')
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function deleteCanal(id: string): Promise<boolean> {
    isLoading.value = true
    try {
      const index = canais.value.findIndex(c => c.id === id)
      if (index === -1) {
        throw new Error('Canal não encontrado')
      }

      const canal = canais.value[index]
      canais.value.splice(index, 1)
      toastStore.success('Canal Removido', `${canal.nome} foi removido`)
      
      return true
    } catch (error) {
      toastStore.error('Erro', 'Não foi possível remover o canal')
      return false
    } finally {
      isLoading.value = false
    }
  }

  // ======================
  // DADOS MOCK
  // ======================

  function createMockUsers() {
    const mockUsers: AdminUser[] = [
      {
        id: 'user-admin-001',
        name: 'Admin Sistema',
        email: 'admin@sistop.com',
        roles: ['admin'],
        permissions: ['view_admin', 'manage_users', 'manage_projects', 'view_reports'],
        avatar: undefined,
        ultimoAcesso: new Date(),
        tentativasLogin: 0,
        contaAtiva: true,
        configuracoes: {
          notificacoes: true,
          tema: 'light',
          idioma: 'pt-BR'
        }
      },
      {
        id: 'user-manager-001',
        name: 'João Manager',
        email: 'joao@sistop.com',
        roles: ['manager'],
        permissions: ['view_jobs', 'manage_content'],
        avatar: undefined,
        ultimoAcesso: new Date(Date.now() - 3600000),
        tentativasLogin: 0,
        contaAtiva: true,
        configuracoes: {
          notificacoes: true,
          tema: 'light',
          idioma: 'pt-BR'
        }
      },
      {
        id: 'user-editor-001',
        name: 'Maria Editora',
        email: 'maria@sistop.com',
        roles: ['editor'],
        permissions: ['view_content', 'edit_content'],
        avatar: undefined,
        ultimoAcesso: new Date(Date.now() - 7200000),
        tentativasLogin: 1,
        contaAtiva: true,
        configuracoes: {
          notificacoes: false,
          tema: 'light',
          idioma: 'pt-BR'
        }
      }
    ]

    users.value.push(...mockUsers)
  }

  function createMockProjetos() {
    const mockProjetos: Projeto[] = [
      {
        id: 'proj-alpha-001',
        nome: 'Projeto Alpha',
        descricao: 'Projeto principal de conteúdo audiovisual',
        status: 'ativo',
        canais: [],
        configuracoes: {
          idiomasPadrao: ['pt-BR', 'en-US'],
          qualidadeVideo: '4K',
          formatoExportacao: ['mp4', 'mov', 'avi']
        },
        createdAt: new Date(Date.now() - 86400000 * 30),
        updatedAt: new Date()
      },
      {
        id: 'proj-beta-002',
        nome: 'Projeto Beta',
        descricao: 'Projeto de testes e experimentação',
        status: 'ativo',
        canais: [],
        configuracoes: {
          idiomasPadrao: ['pt-BR'],
          qualidadeVideo: '1080p',
          formatoExportacao: ['mp4']
        },
        createdAt: new Date(Date.now() - 86400000 * 15),
        updatedAt: new Date(Date.now() - 86400000 * 2)
      }
    ]

    projetos.value.push(...mockProjetos)
  }

  function createMockVoices() {
    const mockVoices: VoiceProfile[] = [
      {
        id: 'voice-001',
        nome: 'Clara - Feminina Jovem',
        idioma: 'pt-BR',
        genero: 'feminino',
        idade: 'jovem',
        estilo: 'casual',
        provedor: 'azure',
        configuracoes: {
          velocidade: 1.0,
          tom: 0,
          volume: 0.8,
          pausas: 1.0
        },
        ativo: true,
        createdAt: new Date(Date.now() - 86400000 * 10),
        updatedAt: new Date()
      },
      {
        id: 'voice-002',
        nome: 'Roberto - Masculino Formal',
        idioma: 'pt-BR',
        genero: 'masculino',
        idade: 'adulto',
        estilo: 'formal',
        provedor: 'google',
        configuracoes: {
          velocidade: 0.9,
          tom: -10,
          volume: 0.9,
          pausas: 1.2
        },
        ativo: true,
        createdAt: new Date(Date.now() - 86400000 * 5),
        updatedAt: new Date(Date.now() - 86400000)
      }
    ]

    voiceProfiles.value.push(...mockVoices)
  }

  function createMockCanais() {
    const mockCanais: Canal[] = [
      {
        id: 'canal-news-001',
        nome: 'SisTop News',
        descricao: 'Canal de notícias e informações',
        cor: '#ef4444'
      },
      {
        id: 'canal-entertainment-002',
        nome: 'SisTop Entertainment',
        descricao: 'Canal de entretenimento e cultura',
        cor: '#8b5cf6'
      },
      {
        id: 'canal-sports-003',
        nome: 'SisTop Sports',
        descricao: 'Canal de esportes e competições',
        cor: '#10b981'
      }
    ]

    canais.value.push(...mockCanais)
  }

  // Utility
  function generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  return {
    // State
    users,
    projetos,
    voiceProfiles,
    canais,
    isLoading,
    
    // Getters
    activeUsers,
    inactiveUsers,
    adminUsers,
    activeProjetos,
    activeVoices,
    usersByRole,
    
    // Users Actions
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    
    // Projetos Actions
    fetchProjetos,
    createProjeto,
    updateProjeto,
    deleteProjeto,
    
    // Voices Actions
    fetchVoiceProfiles,
    createVoiceProfile,
    updateVoiceProfile,
    deleteVoiceProfile,
    toggleVoiceStatus,
    
    // Canais Actions
    fetchCanais,
    createCanal,
    updateCanal,
    deleteCanal
  }
})