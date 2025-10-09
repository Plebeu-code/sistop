import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import type { Pauta, PautaStatus, EventLog, Notification, Canal, Voz } from '../../shared/types'
import { useUserStore } from './user'
import { useToastStore } from './toast'

export const usePautaStore = defineStore('pauta', () => {
  const pautas = ref<Pauta[]>([])
  const eventLogs = ref<EventLog[]>([])
  const notifications = ref<Notification[]>([])
  const loading = ref(false)

  const userStore = useUserStore()
  const toastStore = useToastStore()

  // Mock data para canais
  const canais = ref<Canal[]>([
    { id: '1', nome: 'Canal Principal', descricao: 'Canal principal do sistema', cor: '#3B82F6' },
    { id: '2', nome: 'Canal Secundário', descricao: 'Canal para conteúdo alternativo', cor: '#10B981' },
    { id: '3', nome: 'Canal Especial', descricao: 'Canal para eventos especiais', cor: '#F59E0B' }
  ])

  // Mock data para vozes
  const vozes = ref<Voz[]>([
    { id: '1', nome: 'Ana', genero: 'feminino', idioma: 'pt-BR', amostra: '/samples/ana.mp3' },
    { id: '2', nome: 'Carlos', genero: 'masculino', idioma: 'pt-BR', amostra: '/samples/carlos.mp3' },
    { id: '3', nome: 'Sarah', genero: 'feminino', idioma: 'en-US', amostra: '/samples/sarah.mp3' },
    { id: '4', nome: 'Mike', genero: 'masculino', idioma: 'en-US', amostra: '/samples/mike.mp3' },
    { id: '5', nome: 'Alex', genero: 'neutro', idioma: 'pt-BR', amostra: '/samples/alex.mp3' }
  ])

  // Computed properties
  const pautasPorStatus = computed(() => {
    const grupos: Record<PautaStatus, Pauta[]> = {
      rascunho: [],
      em_planejamento: [],
      em_producao: [],
      em_revisao: [],
      finalizada: [],
      cancelada: []
    }

    pautas.value.forEach(pauta => {
      grupos[pauta.status].push(pauta)
    })

    return grupos
  })

  const totalPautas = computed(() => pautas.value.length)

  // Actions
  const fetchPautas = async () => {
    loading.value = true
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data inicial
      pautas.value = [
        {
          id: '1',
          titulo: 'Como fazer café perfeito',
          objetivo: 'Ensinar técnicas de preparo de café',
          notas: 'Incluir diferentes métodos de preparo',
          refsYoutube: ['https://youtube.com/watch?v=abc123'],
          thumb: 'https://via.placeholder.com/300x200',
          canal: canais.value[0]!,
          idiomas: ['pt-BR'],
          vozes: [vozes.value[0]!],
          status: 'em_planejamento',
          createdAt: new Date('2024-10-01'),
          updatedAt: new Date('2024-10-01'),
          createdBy: userStore.user?.id || '1'
        },
        {
          id: '2',
          titulo: 'Dicas de programação',
          objetivo: 'Compartilhar boas práticas de desenvolvimento',
          notas: 'Focar em JavaScript e TypeScript',
          refsYoutube: ['https://youtube.com/watch?v=def456'],
          canal: canais.value[1]!,
          idiomas: ['pt-BR', 'en-US'],
          vozes: [vozes.value[1]!, vozes.value[3]!],
          status: 'rascunho',
          createdAt: new Date('2024-10-02'),
          updatedAt: new Date('2024-10-02'),
          createdBy: userStore.user?.id || '1'
        }
      ]
    } catch (error) {
      toastStore.error('Erro', 'Falha ao carregar pautas')
    } finally {
      loading.value = false
    }
  }

  const createPauta = async (pautaData: Omit<Pauta, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'status'>) => {
    loading.value = true
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500))

      const novaPauta: Pauta = {
        ...pautaData,
        id: Date.now().toString(),
        status: 'rascunho',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userStore.user?.id || '1'
      }

      pautas.value.push(novaPauta)

      // Registrar event log
      await logEvent('criacao', 'pauta', novaPauta.id, `Pauta "${novaPauta.titulo}" criada`, novaPauta)

      toastStore.success('Sucesso', 'Pauta criada com sucesso!')
      return novaPauta
    } catch (error) {
      toastStore.error('Erro', 'Falha ao criar pauta')
      throw error
    } finally {
      loading.value = false
    }
  }

  const updatePauta = async (id: string, pautaData: Partial<Pauta>) => {
    loading.value = true
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500))

      const index = pautas.value.findIndex(p => p.id === id)
      if (index === -1) throw new Error('Pauta não encontrada')

      const pautaAnterior = { ...pautas.value[index] }
      pautas.value[index] = {
        ...pautas.value[index],
        ...pautaData,
        updatedAt: new Date()
      }

      // Registrar event log
      await logEvent('edicao', 'pauta', id, `Pauta "${pautas.value[index].titulo}" editada`, {
        anterior: pautaAnterior,
        atual: pautas.value[index]
      })

      toastStore.success('Sucesso', 'Pauta atualizada com sucesso!')
      return pautas.value[index]
    } catch (error) {
      toastStore.error('Erro', 'Falha ao atualizar pauta')
      throw error
    } finally {
      loading.value = false
    }
  }

  const deletePauta = async (id: string) => {
    loading.value = true
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 500))

      const index = pautas.value.findIndex(p => p.id === id)
      if (index === -1) throw new Error('Pauta não encontrada')

      const pautaRemovida = pautas.value[index]
      pautas.value.splice(index, 1)

      // Registrar event log
      await logEvent('cancelar', 'pauta', id, `Pauta "${pautaRemovida.titulo}" removida`, pautaRemovida)

      toastStore.success('Sucesso', 'Pauta removida com sucesso!')
    } catch (error) {
      toastStore.error('Erro', 'Falha ao remover pauta')
      throw error
    } finally {
      loading.value = false
    }
  }

  const iniciarProducao = async (id: string) => {
    loading.value = true
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const pauta = pautas.value.find(p => p.id === id)
      if (!pauta) throw new Error('Pauta não encontrada')

      if (pauta.status !== 'em_planejamento') {
        throw new Error('Pauta deve estar em planejamento para iniciar produção')
      }

      // Atualizar status
      pauta.status = 'em_producao'
      pauta.updatedAt = new Date()

      // Gerar deep link para storyboard
      // eslint-disable-next-line no-undef
      pauta.deepLink = `${window.location.origin}/storyboard/${id}?from=pauta`

      // Registrar event log
      await logEvent('iniciar_producao', 'pauta', id, `Produção iniciada para pauta "${pauta.titulo}"`, {
        deepLink: pauta.deepLink,
        statusAnterior: 'em_planejamento',
        statusAtual: 'em_producao'
      })

      // Enviar notificação
      if (pauta.roteirista) {
        await sendNotification({
          tipo: 'pauta_iniciada',
          titulo: 'Produção Iniciada',
          mensagem: `A produção da pauta "${pauta.titulo}" foi iniciada e está disponível para roteirização.`,
          destinatario: pauta.roteirista.id
        })
      }

      toastStore.success('Produção Iniciada', `Pauta "${pauta.titulo}" em produção!`)
      return pauta
    } catch (error) {
      toastStore.error('Erro', error instanceof Error ? error.message : 'Falha ao iniciar produção')
      throw error
    } finally {
      loading.value = false
    }
  }

  const changeStatus = async (id: string, newStatus: PautaStatus) => {
    loading.value = true
    try {
      // eslint-disable-next-line no-undef
      await new Promise(resolve => setTimeout(resolve, 500))

      const pauta = pautas.value.find(p => p.id === id)
      if (!pauta) throw new Error('Pauta não encontrada')

      const statusAnterior = pauta.status
      pauta.status = newStatus
      pauta.updatedAt = new Date()

      // Registrar event log
      await logEvent('status_change', 'pauta', id, `Status da pauta "${pauta.titulo}" alterado`, {
        statusAnterior,
        statusAtual: newStatus
      })

      toastStore.success('Status Atualizado', `Pauta movida para ${newStatus}`)
      return pauta
    } catch (error) {
      toastStore.error('Erro', 'Falha ao alterar status')
      throw error
    } finally {
      loading.value = false
    }
  }

  const logEvent = async (
    tipo: EventLog['tipo'],
    entidade: string,
    entidadeId: string,
    descricao: string,
    dados?: any
  ) => {
    const eventLog: EventLog = {
      id: Date.now().toString(),
      tipo,
      entidade,
      entidadeId,
      descricao,
      dados,
      usuario: userStore.user?.id || 'sistema',
      timestamp: new Date()
    }

    eventLogs.value.push(eventLog)
    return eventLog
  }

  const sendNotification = async (notificationData: Omit<Notification, 'id' | 'lida' | 'createdAt'>) => {
    const notification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      lida: false,
      createdAt: new Date()
    }

    notifications.value.push(notification)
    return notification
  }

  const getPautaById = (id: string) => {
    return pautas.value.find(p => p.id === id)
  }

  const getEventLogsByPauta = (pautaId: string) => {
    return eventLogs.value.filter(log => log.entidadeId === pautaId)
  }

  return {
    // State
    pautas: readonly(pautas),
    eventLogs: readonly(eventLogs),
    notifications: readonly(notifications),
    canais,
    vozes,
    loading: readonly(loading),

    // Computed
    pautasPorStatus,
    totalPautas,

    // Actions
    fetchPautas,
    createPauta,
    updatePauta,
    deletePauta,
    iniciarProducao,
    changeStatus,
    logEvent,
    sendNotification,
    getPautaById,
    getEventLogsByPauta
  }
})