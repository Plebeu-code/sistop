import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Clip, ClipFilter, ClipValidation, ClipFormData, User } from '../../shared/types'
import { useUserStore } from './user'
import { useToastStore } from './toast'

export const useClipStore = defineStore('clip', () => {
  const userStore = useUserStore()
  const toastStore = useToastStore()

  // State
  const clips = ref<Clip[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Mock data
  const generateMockClips = (): Clip[] => {
    const mockUser: User = {
      id: '1',
      name: 'João Silva',
      email: 'joao@exemplo.com',
      roles: ['editor'],
      permissions: ['view_assets', 'edit_pauta', 'view_admin'],
      avatar: 'https://via.placeholder.com/40'
    }

    return [
      {
        id: 'clip-1',
        assetId: 'asset-1',
        title: 'Abertura do Telejornal',
        description: 'Vinheta de abertura com logo e música de fundo',
        inPoint: 0,
        outPoint: 15.5,
        duration: 15.5,
        tags: ['abertura', 'vinheta', 'telejornal'],
        thumbnailUrl: 'https://via.placeholder.com/320x180/6366f1/white?text=Abertura',
        createdBy: mockUser,
        createdAt: new Date('2024-12-01T10:00:00'),
        updatedAt: new Date('2024-12-01T10:00:00'),
        metadata: {
          fps: 30,
          resolution: '1920x1080',
          bitrate: 5000,
          format: 'mp4'
        }
      },
      {
        id: 'clip-2',
        assetId: 'asset-1',
        title: 'Entrevista Principal',
        description: 'Entrevista com o prefeito sobre as obras da cidade',
        inPoint: 45.2,
        outPoint: 125.8,
        duration: 80.6,
        tags: ['entrevista', 'prefeito', 'obras', 'cidade'],
        thumbnailUrl: 'https://via.placeholder.com/320x180/10b981/white?text=Entrevista',
        createdBy: mockUser,
        createdAt: new Date('2024-12-01T10:15:00'),
        updatedAt: new Date('2024-12-01T10:15:00'),
        metadata: {
          fps: 30,
          resolution: '1920x1080',
          bitrate: 5000,
          format: 'mp4'
        }
      },
      {
        id: 'clip-3',
        assetId: 'asset-2',
        title: 'Imagens Externas',
        description: 'Tomadas aéreas da cidade durante o dia',
        inPoint: 12.0,
        outPoint: 28.5,
        duration: 16.5,
        tags: ['externas', 'drone', 'cidade', 'dia'],
        thumbnailUrl: 'https://via.placeholder.com/320x180/f59e0b/white?text=Drone',
        createdBy: mockUser,
        createdAt: new Date('2024-12-01T11:00:00'),
        updatedAt: new Date('2024-12-01T11:00:00'),
        metadata: {
          fps: 30,
          resolution: '4096x2160',
          bitrate: 8000,
          format: 'mp4'
        }
      },
      {
        id: 'clip-4',
        assetId: 'asset-3',
        title: 'Sonora do Especialista',
        description: 'Comentário técnico sobre o projeto urbanístico',
        inPoint: 30.5,
        outPoint: 65.2,
        duration: 34.7,
        tags: ['sonora', 'especialista', 'urbanismo', 'técnico'],
        thumbnailUrl: 'https://via.placeholder.com/320x180/8b5cf6/white?text=Sonora',
        createdBy: mockUser,
        createdAt: new Date('2024-12-01T12:00:00'),
        updatedAt: new Date('2024-12-01T12:00:00'),
        metadata: {
          fps: 30,
          resolution: '1920x1080',
          bitrate: 5000,
          format: 'mp4'
        }
      },
      {
        id: 'clip-5',
        assetId: 'asset-4',
        title: 'Stand Up Repórter',
        description: 'Passagem do repórter no local das obras',
        inPoint: 5.0,
        outPoint: 22.8,
        duration: 17.8,
        tags: ['standup', 'repórter', 'passagem', 'obras'],
        thumbnailUrl: 'https://via.placeholder.com/320x180/ef4444/white?text=StandUp',
        createdBy: mockUser,
        createdAt: new Date('2024-12-01T13:30:00'),
        updatedAt: new Date('2024-12-01T13:30:00'),
        metadata: {
          fps: 30,
          resolution: '1920x1080',
          bitrate: 5000,
          format: 'mp4'
        }
      },
      {
        id: 'clip-6',
        assetId: 'asset-5',
        title: 'Vinheta de Passagem',
        description: 'Transição musical entre blocos',
        inPoint: 0,
        outPoint: 4.2,
        duration: 4.2,
        tags: ['vinheta', 'transição', 'música', 'bloco'],
        thumbnailUrl: 'https://via.placeholder.com/320x180/06b6d4/white?text=Vinheta',
        createdBy: mockUser,
        createdAt: new Date('2024-12-01T14:00:00'),
        updatedAt: new Date('2024-12-01T14:00:00'),
        metadata: {
          fps: 30,
          resolution: '1920x1080',
          bitrate: 3000,
          format: 'mp4'
        }
      }
    ]
  }

  // Initialize with mock data
  clips.value = generateMockClips()

  // Mock tags for autocomplete
  const mockTags = [
    'abertura', 'vinheta', 'telejornal', 'entrevista', 'prefeito', 'obras', 'cidade',
    'externas', 'drone', 'dia', 'noite', 'sonora', 'especialista', 'urbanismo',
    'técnico', 'standup', 'repórter', 'passagem', 'transição', 'música', 'bloco',
    'fechamento', 'creditos', 'breaking', 'urgente', 'ao-vivo', 'arquivo',
    'cobertura', 'evento', 'política', 'economia', 'esporte', 'cultura',
    'saúde', 'educação', 'segurança', 'trânsito', 'clima', 'internacional'
  ]

  // Computed
  const clipsByAsset = computed(() => {
    return (assetId: string) => clips.value.filter(clip => clip.assetId === assetId)
  })

  const getFilteredClips = computed(() => {
    return (filter: ClipFilter) => {
      return clips.value.filter(clip => {
        // Search filter
        if (filter.search) {
          const searchLower = filter.search.toLowerCase()
          const matchesTitle = clip.title.toLowerCase().includes(searchLower)
          const matchesDescription = clip.description?.toLowerCase().includes(searchLower)
          const matchesTags = clip.tags.some(tag => tag.toLowerCase().includes(searchLower))
          
          if (!matchesTitle && !matchesDescription && !matchesTags) {
            return false
          }
        }

        // Asset filter
        if (filter.assetId && clip.assetId !== filter.assetId) {
          return false
        }

        // Tags filter
        if (filter.tags && filter.tags.length > 0) {
          const hasMatchingTag = filter.tags.some(tag => clip.tags.includes(tag))
          if (!hasMatchingTag) {
            return false
          }
        }

        // Duration filters
        if (filter.durationMin && clip.duration < filter.durationMin) {
          return false
        }

        if (filter.durationMax && clip.duration > filter.durationMax) {
          return false
        }

        // Date filters
        if (filter.dateFrom && clip.createdAt < filter.dateFrom) {
          return false
        }

        if (filter.dateTo && clip.createdAt > filter.dateTo) {
          return false
        }

        // Created by filter
        if (filter.createdBy && clip.createdBy.id !== filter.createdBy) {
          return false
        }

        return true
      })
    }
  })

  const clipStats = computed(() => {
    const totalClips = clips.value.length
    const totalDuration = clips.value.reduce((sum, clip) => sum + clip.duration, 0)
    const averageDuration = totalClips > 0 ? totalDuration / totalClips : 0
    
    const clipsByAssetCount = clips.value.reduce((acc, clip) => {
      acc[clip.assetId] = (acc[clip.assetId] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalClips,
      totalDuration,
      averageDuration,
      clipsByAssetCount,
      shortClips: clips.value.filter(c => c.duration < 10).length,
      mediumClips: clips.value.filter(c => c.duration >= 10 && c.duration < 60).length,
      longClips: clips.value.filter(c => c.duration >= 60).length
    }
  })

  // Actions
  const validateClip = (data: ClipFormData): ClipValidation => {
    const errors: string[] = []
    const warnings: string[] = []

    // Basic validation
    if (!data.title.trim()) {
      errors.push('Título é obrigatório')
    }

    if (data.title.length < 3) {
      errors.push('Título deve ter pelo menos 3 caracteres')
    }

    if (data.title.length > 100) {
      errors.push('Título não pode exceder 100 caracteres')
    }

    // Time validation
    if (data.inPoint < 0) {
      errors.push('Ponto de entrada não pode ser negativo')
    }

    if (data.outPoint < 0) {
      errors.push('Ponto de saída não pode ser negativo')
    }

    if (data.inPoint >= data.outPoint) {
      errors.push('Ponto de entrada deve ser menor que o ponto de saída')
    }

    const duration = data.outPoint - data.inPoint
    if (duration < 2) {
      errors.push('Duração mínima do clip é de 2 segundos')
    }

    // Warnings
    if (duration < 5) {
      warnings.push('Clips muito curtos podem não ser úteis para edição')
    }

    if (duration > 300) {
      warnings.push('Clips muito longos podem ser difíceis de gerenciar')
    }

    if (data.tags.length === 0) {
      warnings.push('Adicionar tags facilita a busca posterior')
    }

    if (data.tags.length > 10) {
      warnings.push('Muitas tags podem tornar a organização confusa')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  const createClip = async (assetId: string, data: ClipFormData): Promise<Clip | undefined> => {
    try {
      loading.value = true
      error.value = null

      // Validate
      const validation = validateClip(data)
      if (!validation.isValid) {
        validation.errors.forEach(err => toastStore.error('Erro de Validação', err))
        return undefined
      }

      // Show warnings
      validation.warnings.forEach(warning => toastStore.warn('Atenção', warning))

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))

      const user = userStore.user
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const newClip: Clip = {
        id: `clip-${Date.now()}`,
        assetId,
        title: data.title.trim(),
        description: data.description?.trim(),
        inPoint: data.inPoint,
        outPoint: data.outPoint,
        duration: data.outPoint - data.inPoint,
        tags: [...data.tags],
        thumbnailUrl: `https://via.placeholder.com/320x180/6366f1/white?text=${encodeURIComponent(data.title)}`,
        createdBy: user as User,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          fps: 30,
          resolution: '1920x1080',
          bitrate: 5000,
          format: 'mp4'
        }
      }

      clips.value.push(newClip)
      toastStore.success('Clip Criado', `Clip "${newClip.title}" criado com sucesso`)
      
      return newClip
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      error.value = message
      toastStore.error('Erro', `Falha ao criar clip: ${message}`)
      return undefined
    } finally {
      loading.value = false
    }
  }

  const updateClip = async (id: string, data: Partial<ClipFormData>): Promise<Clip | undefined> => {
    try {
      loading.value = true
      error.value = null

      const clipIndex = clips.value.findIndex(c => c.id === id)
      if (clipIndex === -1) {
        throw new Error('Clip não encontrado')
      }

      const currentClip = clips.value[clipIndex]
      if (!currentClip) {
        throw new Error('Clip não encontrado')
      }

      // Create updated data
      const updatedData: ClipFormData = {
        title: data.title ?? currentClip.title,
        description: data.description ?? currentClip.description,
        inPoint: data.inPoint ?? currentClip.inPoint,
        outPoint: data.outPoint ?? currentClip.outPoint,
        tags: data.tags ?? currentClip.tags
      }

      // Validate
      const validation = validateClip(updatedData)
      if (!validation.isValid) {
        validation.errors.forEach(err => toastStore.error('Erro de Validação', err))
        return undefined
      }

      // Show warnings
      validation.warnings.forEach(warning => toastStore.warn('Atenção', warning))

      // Simulate API delay - removed for simplicity

      const updatedClip: Clip = {
        ...currentClip,
        title: updatedData.title.trim(),
        description: updatedData.description?.trim(),
        inPoint: updatedData.inPoint,
        outPoint: updatedData.outPoint,
        duration: updatedData.outPoint - updatedData.inPoint,
        tags: [...updatedData.tags],
        updatedAt: new Date()
      }

      clips.value[clipIndex] = updatedClip
      toastStore.success('Clip Atualizado', `Clip "${updatedClip.title}" atualizado com sucesso`)
      
      return updatedClip
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      error.value = message
      toastStore.error('Erro', `Falha ao atualizar clip: ${message}`)
      return undefined
    } finally {
      loading.value = false
    }
  }

  const deleteClip = async (id: string): Promise<boolean> => {
    try {
      loading.value = true
      error.value = null

      const clipIndex = clips.value.findIndex(c => c.id === id)
      if (clipIndex === -1) {
        throw new Error('Clip não encontrado')
      }

      const clip = clips.value[clipIndex]
      if (!clip) {
        throw new Error('Clip não encontrado')
      }

      // Simulate API delay - removed for simplicity

      clips.value.splice(clipIndex, 1)
      toastStore.success('Clip Removido', `Clip "${clip.title}" removido com sucesso`)
      
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      error.value = message
      toastStore.error('Erro', `Falha ao remover clip: ${message}`)
      return false
    } finally {
      loading.value = false
    }
  }

  const duplicateClip = async (id: string): Promise<Clip | undefined> => {
    try {
      const originalClip = clips.value.find(c => c.id === id)
      if (!originalClip) {
        throw new Error('Clip não encontrado')
      }

      const duplicateData: ClipFormData = {
        title: `${originalClip.title} (Cópia)`,
        description: originalClip.description,
        inPoint: originalClip.inPoint,
        outPoint: originalClip.outPoint,
        tags: [...originalClip.tags]
      }

      return await createClip(originalClip.assetId, duplicateData)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      toastStore.error('Erro', `Falha ao duplicar clip: ${message}`)
      return undefined
    }
  }

  const getClipById = (id: string): Clip | undefined => {
    return clips.value.find(c => c.id === id)
  }

  const exportClip = async (id: string, format: 'mp4' | 'mov' | 'avi' = 'mp4'): Promise<boolean> => {
    try {
      loading.value = true
      
      const clip = clips.value.find(c => c.id === id)
      if (!clip) {
        throw new Error('Clip não encontrado')
      }

      // Simulate export process - removed for simplicity

      toastStore.success('Export Concluído', `Clip "${clip.title}" exportado como ${format.toUpperCase()}`)
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      toastStore.error('Erro', `Falha ao exportar clip: ${message}`)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    clips: clips as any,
    loading: loading as any,
    error: error as any,
    
    // Mock data
    mockTags,
    
    // Computed
    clipsByAsset,
    getFilteredClips,
    clipStats,
    
    // Actions
    validateClip,
    createClip,
    updateClip,
    deleteClip,
    duplicateClip,
    getClipById,
    exportClip
  }
})