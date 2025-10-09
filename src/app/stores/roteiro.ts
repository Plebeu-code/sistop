import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  Roteiro, 
  RoteiroItem, 
  RoteiroComentario, 
  RoteiroComentarioI18n,
  RoteiroStatus,
  ComentarioType,
  RoteiroFilter,
  TimelineTrack,
  EDL,
  EDLItem,
  EDLValidationResult
} from '../../shared/types'
import { useUserStore } from './user'
import { useClipStore } from './clip'

export const useRoteiroStore = defineStore('roteiro', () => {
  const userStore = useUserStore()
  const clipStore = useClipStore()
  
  // Helper para obter usuário atual
  const getCurrentUser = () => {
    const user = userStore.user
    if (!user) throw new Error('Usuário não autenticado')
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: [...user.roles],
      permissions: [...user.permissions],
      avatar: user.avatar
    }
  }
  
  // State
  const roteiros = ref<Roteiro[]>([])
  const currentRoteiro = ref<Roteiro | null>(null)
  const timelineTracks = ref<TimelineTrack[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Mock data - roteiros existentes
  const initializeMockData = () => {
    if (roteiros.value.length === 0) {
      const mockRoteiros: Roteiro[] = [
        {
          id: '1',
          title: 'Roteiro - Episódio 001',
          description: 'Roteiro principal do primeiro episódio sobre tecnologia',
          pautaId: 'pauta-1',
          totalDuration: 1800, // 30 minutos
          status: 'in_progress',
          items: [],
          allowDuplicates: false,
          createdBy: getCurrentUser(),
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
          metadata: {
            version: '1.0',
            notes: 'Primeira versão do roteiro'
          }
        },
        {
          id: '2',
          title: 'Roteiro - Entrevista Especial',
          description: 'Roteiro para entrevista com especialista em IA',
          pautaId: 'pauta-2',
          totalDuration: 1200, // 20 minutos
          status: 'draft',
          items: [],
          allowDuplicates: true,
          createdBy: getCurrentUser(),
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60),
          metadata: {
            version: '0.5',
            notes: 'Rascunho inicial'
          }
        }
      ]
      
      roteiros.value = mockRoteiros
    }

    // Mock timeline tracks
    if (timelineTracks.value.length === 0) {
      const mockTimelineTracks: TimelineTrack[] = [
        {
          id: 'track-video-1',
          type: 'video',
          items: [],
          locked: false,
          visible: true
        },
        {
          id: 'track-audio-1', 
          type: 'audio',
          items: [],
          locked: false,
          visible: true,
          volume: 1.0
        },
        {
          id: 'track-voice-pt',
          type: 'voice',
          items: [],
          locked: false,
          visible: true,
          volume: 1.0
        },
        {
          id: 'track-voice-en',
          type: 'voice',
          items: [],
          locked: false,
          visible: true,
          volume: 0.8
        }
      ]
      
      timelineTracks.value = mockTimelineTracks
    }
  }

  // Computed
  const roteirosByStatus = computed(() => {
    const grouped: Record<RoteiroStatus, Roteiro[]> = {
      draft: [],
      in_progress: [],
      review: [],
      approved: [],
      published: []
    }
    
    roteiros.value.forEach(roteiro => {
      grouped[roteiro.status].push(roteiro)
    })
    
    return grouped
  })

  const totalDuration = computed(() => {
    if (!currentRoteiro.value) return 0
    return currentRoteiro.value.items.reduce((total, item) => total + item.clip.duration, 0)
  })

  const roteiroStats = computed(() => ({
    total: roteiros.value.length,
    draft: roteirosByStatus.value.draft.length,
    inProgress: roteirosByStatus.value.in_progress.length,
    review: roteirosByStatus.value.review.length,
    approved: roteirosByStatus.value.approved.length,
    published: roteirosByStatus.value.published.length
  }))

  // Actions
  const createRoteiro = async (data: {
    title: string
    description?: string
    pautaId: string
    allowDuplicates?: boolean
  }) => {
    const newRoteiro: Roteiro = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description,
      pautaId: data.pautaId,
      totalDuration: 0,
      status: 'draft',
      items: [],
      allowDuplicates: data.allowDuplicates || false,
      createdBy: getCurrentUser(),
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        version: '1.0'
      }
    }

    roteiros.value.push(newRoteiro)
    return newRoteiro
  }

  const updateRoteiro = async (id: string, updates: Partial<Roteiro>) => {
    const index = roteiros.value.findIndex(r => r.id === id)
    if (index >= 0) {
      const updatedRoteiro = {
        ...roteiros.value[index],
        ...updates,
        updatedAt: new Date()
      }
      roteiros.value[index] = updatedRoteiro
      
      if (currentRoteiro.value?.id === id) {
        currentRoteiro.value = updatedRoteiro
      }
      
      return updatedRoteiro
    }
    throw new Error('Roteiro não encontrado')
  }

  const deleteRoteiro = async (id: string) => {
    const index = roteiros.value.findIndex(r => r.id === id)
    if (index >= 0) {
      roteiros.value.splice(index, 1)
      if (currentRoteiro.value?.id === id) {
        currentRoteiro.value = null
      }
    }
  }

  const loadRoteiro = (id: string) => {
    const roteiro = roteiros.value.find(r => r.id === id)
    if (roteiro) {
      currentRoteiro.value = roteiro
      return roteiro
    }
    throw new Error('Roteiro não encontrado')
  }

  const addItemToRoteiro = async (roteiroId: string, clipId: string) => {
    const roteiro = roteiros.value.find(r => r.id === roteiroId)
    const clip = clipStore.clips.find((c: any) => c.id === clipId)
    
    if (!roteiro || !clip) {
      throw new Error('Roteiro ou clip não encontrado')
    }

    // Verificar duplicidade se política não permitir
    if (!roteiro.allowDuplicates) {
      const isDuplicate = roteiro.items.some(item => item.clipId === clipId)
      if (isDuplicate) {
        throw new Error('Clip já existe no roteiro. Política de duplicidade não permite repetição.')
      }
    }

    const startTime = roteiro.items.reduce((total, item) => total + item.clip.duration, 0)
    
    const newItem: RoteiroItem = {
      id: Date.now().toString(),
      roteiroId,
      clipId,
      clip,
      order: roteiro.items.length,
      startTime,
      endTime: startTime + clip.duration,
      comments: [],
      translations: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    roteiro.items.push(newItem)
    roteiro.totalDuration += clip.duration
    roteiro.updatedAt = new Date()

    // Atualizar timeline
    updateTimeline(roteiro)

    if (currentRoteiro.value?.id === roteiroId) {
      currentRoteiro.value = roteiro
    }

    return newItem
  }

  const removeItemFromRoteiro = async (roteiroId: string, itemId: string) => {
    const roteiro = roteiros.value.find(r => r.id === roteiroId)
    if (!roteiro) throw new Error('Roteiro não encontrado')

    const itemIndex = roteiro.items.findIndex(item => item.id === itemId)
    if (itemIndex < 0) throw new Error('Item não encontrado')

    const removedItem = roteiro.items[itemIndex]
    if (!removedItem) throw new Error('Item não encontrado')
    
    roteiro.items.splice(itemIndex, 1)
    roteiro.totalDuration -= removedItem.clip.duration

    // Recalcular ordem e tempos
    let currentTime = 0
    roteiro.items.forEach((item, index) => {
      item.order = index
      item.startTime = currentTime
      item.endTime = currentTime + item.clip.duration
      currentTime += item.clip.duration
    })

    roteiro.updatedAt = new Date()

    // Atualizar timeline
    updateTimeline(roteiro)

    if (currentRoteiro.value?.id === roteiroId) {
      currentRoteiro.value = roteiro
    }
  }

  const reorderItems = async (roteiroId: string, fromIndex: number, toIndex: number) => {
    const roteiro = roteiros.value.find(r => r.id === roteiroId)
    if (!roteiro) throw new Error('Roteiro não encontrado')

    const items = [...roteiro.items]
    const [movedItem] = items.splice(fromIndex, 1)
    if (!movedItem) throw new Error('Item não encontrado')
    
    items.splice(toIndex, 0, movedItem)

    // Recalcular ordem e tempos
    let currentTime = 0
    items.forEach((item, index) => {
      item.order = index
      item.startTime = currentTime
      item.endTime = currentTime + item.clip.duration
      currentTime += item.clip.duration
    })

    roteiro.items = items
    roteiro.updatedAt = new Date()

    // Atualizar timeline
    updateTimeline(roteiro)

    if (currentRoteiro.value?.id === roteiroId) {
      currentRoteiro.value = roteiro
    }
  }

  const addComment = async (itemId: string, data: {
    text: string
    timestamp?: number
    type: ComentarioType
  }) => {
    let targetItem: RoteiroItem | null = null
    let targetRoteiro: Roteiro | null = null

    // Encontrar item em todos os roteiros
    for (const roteiro of roteiros.value) {
      const item = roteiro.items.find(i => i.id === itemId)
      if (item) {
        targetItem = item
        targetRoteiro = roteiro
        break
      }
    }

    if (!targetItem || !targetRoteiro) {
      throw new Error('Item não encontrado')
    }

    const newComment: RoteiroComentario = {
      id: Date.now().toString(),
      roteiroItemId: itemId,
      text: data.text,
      timestamp: data.timestamp,
      type: data.type,
      createdBy: getCurrentUser(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    targetItem.comments.push(newComment)
    targetRoteiro.updatedAt = new Date()

    if (currentRoteiro.value?.id === targetRoteiro.id) {
      currentRoteiro.value = targetRoteiro
    }

    return newComment
  }

  const updateComment = async (commentId: string, updates: Partial<RoteiroComentario>) => {
    let targetComment: RoteiroComentario | null = null
    let targetRoteiro: Roteiro | null = null

    // Encontrar comentário em todos os roteiros
    for (const roteiro of roteiros.value) {
      for (const item of roteiro.items) {
        const comment = item.comments.find(c => c.id === commentId)
        if (comment) {
          targetComment = comment
          targetRoteiro = roteiro
          break
        }
      }
      if (targetComment) break
    }

    if (!targetComment || !targetRoteiro) {
      throw new Error('Comentário não encontrado')
    }

    Object.assign(targetComment, updates, { updatedAt: new Date() })
    targetRoteiro.updatedAt = new Date()

    if (currentRoteiro.value?.id === targetRoteiro.id) {
      currentRoteiro.value = targetRoteiro
    }

    return targetComment
  }

  const generateTranslation = async (commentId: string, language: string) => {
    // Mock da geração de tradução
    const mockTranslation: RoteiroComentarioI18n = {
      id: Date.now().toString(),
      comentarioId: commentId,
      language,
      text: `[Tradução automática para ${language}] Texto traduzido`,
      status: 'generated',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        translatedBy: 'AI-Assistant',
        voice: language === 'en' ? 'en-US-Standard-A' : 'pt-BR-Standard-A',
        duration: 3.5,
        generatedAt: new Date()
      }
    }

    // Encontrar item e adicionar tradução
    let targetItem: RoteiroItem | null = null
    for (const roteiro of roteiros.value) {
      for (const item of roteiro.items) {
        if (item.comments.some(c => c.id === commentId)) {
          targetItem = item
          break
        }
      }
      if (targetItem) break
    }

    if (targetItem) {
      targetItem.translations.push(mockTranslation)
    }

    return mockTranslation
  }

  const updateTimeline = (roteiro: Roteiro) => {
    const videoTrack = timelineTracks.value.find(t => t.type === 'video')
    const voiceTrack = timelineTracks.value.find(t => t.type === 'voice')
    
    if (videoTrack) {
      videoTrack.items = roteiro.items.map(item => ({
        id: `timeline-${item.id}`,
        trackId: videoTrack.id,
        roteiroItemId: item.id,
        startTime: item.startTime,
        duration: item.clip.duration,
        label: item.clip.title,
        type: 'clip' as const,
        color: '#3b82f6'
      }))
    }

    if (voiceTrack) {
      voiceTrack.items = roteiro.items
        .filter(item => item.comments.length > 0)
        .map(item => ({
          id: `voice-${item.id}`,
          trackId: voiceTrack.id,
          roteiroItemId: item.id,
          startTime: item.startTime,
          duration: item.clip.duration,
          label: `Locução - ${item.clip.title}`,
          type: 'voice' as const,
          color: '#10b981'
        }))
    }
  }

  const filterRoteiros = (filter: RoteiroFilter) => {
    return roteiros.value.filter(roteiro => {
      if (filter.search) {
        const search = filter.search.toLowerCase()
        if (!roteiro.title.toLowerCase().includes(search) && 
            !roteiro.description?.toLowerCase().includes(search)) {
          return false
        }
      }

      if (filter.status && roteiro.status !== filter.status) {
        return false
      }

      if (filter.pautaId && roteiro.pautaId !== filter.pautaId) {
        return false
      }

      if (filter.createdBy && roteiro.createdBy.id !== filter.createdBy) {
        return false
      }

      if (filter.dateFrom && roteiro.createdAt < filter.dateFrom) {
        return false
      }

      if (filter.dateTo && roteiro.createdAt > filter.dateTo) {
        return false
      }

      return true
    })
  }

  // Initialize store
  initializeMockData()

  return {
    // State
    roteiros,
    currentRoteiro,
    timelineTracks,
    loading,
    error,

    // Computed
    roteirosByStatus,
    totalDuration,
    roteiroStats,

    // Actions
    createRoteiro,
    updateRoteiro,
    deleteRoteiro,
    loadRoteiro,
    addItemToRoteiro,
    removeItemFromRoteiro,
    reorderItems,
    addComment,
    updateComment,
    generateTranslation,
    filterRoteiros,
    // EDL Functions
    generateEDL,
    validateEDL,
    exportEDL
  }

  // ============================================
  // EDL GENERATION FUNCTIONS
  // ============================================

  /**
   * Valida uma timeline para geração de EDL
   */
  function validateEDL(roteiroId: string, _idioma: string = 'pt'): EDLValidationResult {
    const roteiro = roteiros.value.find(r => r.id === roteiroId)
    if (!roteiro) {
      return {
        isValid: false,
        totalDurationMs: 0,
        gaps: [],
        overlaps: [],
        inconsistentOrder: true,
        warnings: ['Roteiro não encontrado'],
        errors: ['Roteiro não encontrado']
      }
    }

    const items = roteiro.items
      .map(item => ({
        id: item.id,
        startMs: item.startTime * 1000,
        endMs: item.endTime * 1000,
        order: item.order
      }))
      .sort((a, b) => a.order - b.order)

    const gaps: Array<{ startMs: number; endMs: number; durationMs: number }> = []
    const overlaps: Array<{ startMs: number; endMs: number; items: string[] }> = []
    const warnings: string[] = []
    const errors: string[] = []
    
    let totalDurationMs = 0
    let inconsistentOrder = false

    // Verificar ordem consistente
    for (let i = 0; i < items.length - 1; i++) {
      const currentItem = items[i]
      const nextItem = items[i + 1]
      if (currentItem && nextItem && currentItem.order >= nextItem.order) {
        inconsistentOrder = true
        errors.push(`Ordem inconsistente entre itens ${i + 1} e ${i + 2}`)
      }
    }

    // Verificar gaps e overlaps
    for (let i = 0; i < items.length; i++) {
      const current = items[i]
      if (!current) continue
      
      totalDurationMs = Math.max(totalDurationMs, current.endMs)

      if (i < items.length - 1) {
        const next = items[i + 1]
        if (!next) continue
        
        // Gap detection
        if (next.startMs > current.endMs) {
          const gapDuration = next.startMs - current.endMs
          if (gapDuration > 100) { // Gap maior que 100ms
            gaps.push({
              startMs: current.endMs,
              endMs: next.startMs,
              durationMs: gapDuration
            })
            warnings.push(`Gap de ${gapDuration}ms entre itens ${i + 1} e ${i + 2}`)
          }
        }
        
        // Overlap detection
        if (current.endMs > next.startMs) {
          const overlapDuration = current.endMs - next.startMs
          overlaps.push({
            startMs: next.startMs,
            endMs: current.endMs,
            items: [current.id, next.id]
          })
          errors.push(`Overlap de ${overlapDuration}ms entre itens ${i + 1} e ${i + 2}`)
        }
      }
    }

    // Verificar duração mínima
    if (totalDurationMs < 1000) {
      warnings.push('Duração total muito baixa (menos de 1 segundo)')
    }

    const isValid = errors.length === 0 && !inconsistentOrder

    return {
      isValid,
      totalDurationMs,
      gaps,
      overlaps,
      inconsistentOrder,
      warnings,
      errors
    }
  }

  /**
   * Gera EDL a partir de um roteiro
   */
  function generateEDL(roteiroId: string, idioma: string = 'pt'): EDL | null {
    const roteiro = roteiros.value.find(r => r.id === roteiroId)
    if (!roteiro) return null

    // Validar antes de gerar
    const validationResult = validateEDL(roteiroId, idioma)

    // Gerar itens do EDL
    const edlItems: EDLItem[] = roteiro.items
      .sort((a, b) => a.order - b.order)
      .map((item, index) => {
        const startMs = item.startTime * 1000
        const endMs = item.endTime * 1000
        
        // Mock de voice stem path baseado no idioma
        const voiceStem = item.comments && item.comments.length > 0
          ? `voice/${idioma}/${item.id}_${idioma}.wav`
          : undefined

        return {
          clipId: item.clipId,
          inMs: Math.round(startMs),
          outMs: Math.round(endMs),
          ordem: index + 1,
          voiceStem
        }
      })

    const edl: EDL = {
      roteiroId,
      idiomaId: generateMockIdiomaId(idioma),
      itens: edlItems,
      mix: {
        targetLufs: -16
      },
      metadata: {
        version: '1.0',
        createdAt: new Date(),
        totalDurationMs: validationResult.totalDurationMs,
        validationResult
      }
    }

    return edl
  }

  /**
   * Exporta EDL como JSON e força download
   */
  function exportEDL(roteiroId: string, idioma: string = 'pt'): boolean {
    try {
      const edl = generateEDL(roteiroId, idioma)
      if (!edl) return false

      const roteiro = roteiros.value.find(r => r.id === roteiroId)
      
      // Mock: salvar no store para demonstração
      if (roteiro) {
        roteiro.updatedAt = new Date()
        // Em produção, aqui criaria o arquivo e forçaria o download
        // const filename = `${roteiro.title}_${idioma}_edl.json`
        // const jsonContent = JSON.stringify(edl, null, 2)
        // downloadFile(jsonContent, filename, 'application/json')
      }

      return true
    } catch {
      return false
    }
  }

  /**
   * Helper para gerar ID mock de idioma
   */
  function generateMockIdiomaId(idioma: string): string {
    const idiomaMap: Record<string, string> = {
      'pt': 'idioma-pt-br-001',
      'en': 'idioma-en-us-001', 
      'es': 'idioma-es-es-001',
      'fr': 'idioma-fr-fr-001'
    }
    return idiomaMap[idioma] || 'idioma-unknown-001'
  }
})