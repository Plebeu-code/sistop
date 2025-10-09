import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Asset, AssetFilter, UploadProgress, AssetStatus, CuratoriaAction, User } from '../../shared/types'
import { useUserStore } from './user'
import { useToastStore } from './toast'

export const useAssetStore = defineStore('asset', () => {
  const userStore = useUserStore()
  const toastStore = useToastStore()

  // State
  const assets = ref<Asset[]>([])
  const uploads = ref<UploadProgress[]>([])
  const curatoriaActions = ref<CuratoriaAction[]>([])
  const loading = ref(false)
  const uploadLoading = ref(false)

  // Mock data for development
  const mockFornecedores = [
    'Getty Images',
    'Shutterstock',
    'Adobe Stock',
    'Pexels',
    'Unsplash',
    'Freepik',
    'Interno'
  ]

  const mockCategories = [
    'Background Music',
    'Sound Effects',
    'Voiceover',
    'Stock Footage',
    'Motion Graphics',
    'Images',
    'Documents'
  ]

  const mockTags = [
    'corporate', 'energetic', 'calm', 'dramatic', 'upbeat', 'ambient',
    'technology', 'nature', 'business', 'lifestyle', 'education',
    'healthcare', 'finance', 'travel', 'food', '4k', 'hd', 'portrait',
    'landscape', 'people', 'objects', 'abstract'
  ]

  // Getters
  const assetsByStatus = computed(() => {
    return (status: AssetStatus) => assets.value.filter(asset => asset.status === status)
  })

  const stagingAssets = computed(() => assetsByStatus.value('staging'))
  const approvedAssets = computed(() => assetsByStatus.value('approved'))
  const rejectedAssets = computed(() => assetsByStatus.value('rejected'))

  const totalAssetsSize = computed(() => {
    return assets.value.reduce((total, asset) => total + asset.size, 0)
  })

  const getFilteredAssets = computed(() => {
    return (filter: AssetFilter) => {
      let filtered = [...assets.value]

      if (filter.search) {
        const search = filter.search.toLowerCase()
        filtered = filtered.filter(asset =>
          asset.title?.toLowerCase().includes(search) ||
          asset.filename.toLowerCase().includes(search) ||
          asset.description?.toLowerCase().includes(search) ||
          asset.tags.some(tag => tag.toLowerCase().includes(search))
        )
      }

      if (filter.type?.length) {
        filtered = filtered.filter(asset => filter.type!.includes(asset.type))
      }

      if (filter.status?.length) {
        filtered = filtered.filter(asset => filter.status!.includes(asset.status))
      }

      if (filter.tags?.length) {
        filtered = filtered.filter(asset =>
          filter.tags!.some(tag => asset.tags.includes(tag))
        )
      }

      if (filter.fornecedor) {
        filtered = filtered.filter(asset => asset.fornecedor === filter.fornecedor)
      }

      if (filter.dateFrom) {
        filtered = filtered.filter(asset => asset.createdAt >= filter.dateFrom!)
      }

      if (filter.dateTo) {
        filtered = filtered.filter(asset => asset.createdAt <= filter.dateTo!)
      }

      if (filter.durationMin !== undefined) {
        filtered = filtered.filter(asset =>
          asset.duration !== undefined && asset.duration >= filter.durationMin!
        )
      }

      if (filter.durationMax !== undefined) {
        filtered = filtered.filter(asset =>
          asset.duration !== undefined && asset.duration <= filter.durationMax!
        )
      }

      if (filter.licenseType?.length) {
        filtered = filtered.filter(asset =>
          asset.licenseType && filter.licenseType!.includes(asset.licenseType)
        )
      }

      return filtered
    }
  })

  // Actions
  const fetchAssets = async () => {
    loading.value = true
    try {
      // Simulando delay da API
      // eslint-disable-next-line no-undef
      await new Promise(resolve => setTimeout(resolve, 800))

      // Dados mock para desenvolvimento
      const mockAssets: Asset[] = [
        {
          id: '1',
          filename: 'corporate-background-music.mp3',
          originalName: 'Corporate Background Music.mp3',
          type: 'audio',
          status: 'staging',
          size: 5242880, // 5MB
          duration: 180, // 3 minutos
          uploadedBy: {
            id: '1',
            name: 'Admin User',
            email: 'admin@sistop.com',
            roles: ['admin'],
            permissions: []
          },
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
          title: 'Corporate Background Music',
          description: 'Música de fundo corporativa energética',
          tags: ['corporate', 'energetic', 'background'],
          category: 'Background Music',
          fornecedor: 'Getty Images',
          licenseType: 'licensed',
          rightsType: 'full',
          previewPath: '/mock/previews/corporate-bg-preview.mp3'
        },
        {
          id: '2',
          filename: 'tech-presentation-4k.mp4',
          originalName: 'Technology Presentation 4K.mp4',
          type: 'video',
          status: 'approved',
          size: 104857600, // 100MB
          duration: 45,
          dimensions: { width: 3840, height: 2160 },
          uploadedBy: {
            id: '2',
            name: 'Produtor User',
            email: 'produtor@sistop.com',
            roles: ['produtor'],
            permissions: []
          },
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-12'),
          title: 'Technology Presentation',
          description: 'Apresentação sobre tecnologia em 4K',
          tags: ['technology', '4k', 'presentation', 'business'],
          category: 'Stock Footage',
          fornecedor: 'Adobe Stock',
          licenseType: 'royalty_free',
          rightsType: 'full',
          previewPath: '/mock/previews/tech-preview.mp4',
          processedPath: '/mock/processed/tech-presentation-4k.mp4',
          thumbnailPath: '/mock/thumbnails/tech-thumb.jpg',
          approvedBy: {
            id: '1',
            name: 'Admin User',
            email: 'admin@sistop.com',
            roles: ['admin'],
            permissions: []
          },
          approvedAt: new Date('2024-01-12'),
          videoIntelligence: {
            labels: ['technology', 'computer', 'office', 'presentation'],
            faces: 2,
            text: ['Innovation', 'Future', 'Technology'],
            scenes: 5,
            adult: false,
            violence: false
          }
        },
        {
          id: '3',
          filename: 'nature-landscape.jpg',
          originalName: 'Beautiful Nature Landscape.jpg',
          type: 'image',
          status: 'staging',
          size: 2097152, // 2MB
          dimensions: { width: 1920, height: 1080 },
          uploadedBy: {
            id: '4',
            name: 'Pesquisador User',
            email: 'pesquisador@sistop.com',
            roles: ['pesquisador'],
            permissions: []
          },
          createdAt: new Date('2024-01-20'),
          updatedAt: new Date('2024-01-20'),
          title: 'Beautiful Nature Landscape',
          description: 'Paisagem natural deslumbrante para backgrounds',
          tags: ['nature', 'landscape', 'beautiful', 'hd'],
          category: 'Images',
          fornecedor: 'Unsplash',
          licenseType: 'creative_commons',
          rightsType: 'full',
          previewPath: '/mock/previews/nature-landscape-preview.jpg'
        }
      ]

      assets.value = mockAssets
    } catch (error) {
      toastStore.error('Erro', 'Erro ao carregar assets')
      throw error
    } finally {
      loading.value = false
    }
  }

  const startUpload = async (files: File[]) => {
    uploadLoading.value = true
    
    for (const file of files) {
      const uploadProgress: UploadProgress = {
        id: `upload-${Date.now()}-${Math.random()}`,
        filename: file.name,
        size: file.size,
        uploaded: 0,
        progress: 0,
        speed: 0,
        timeRemaining: 0,
        status: 'uploading'
      }

      uploads.value.push(uploadProgress)

      // Simular upload com progresso
      await simulateUpload(uploadProgress, file)
    }

    uploadLoading.value = false
  }

  const simulateUpload = async (uploadProgress: UploadProgress, file: File) => {
    const totalSize = file.size
    const chunkSize = totalSize / 100 // 100 chunks
    let uploaded = 0

    return new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        uploaded += chunkSize
        uploadProgress.uploaded = Math.min(uploaded, totalSize)
        uploadProgress.progress = Math.round((uploadProgress.uploaded / totalSize) * 100)
        uploadProgress.speed = chunkSize * 10 // Simular velocidade
        uploadProgress.timeRemaining = Math.round((totalSize - uploaded) / uploadProgress.speed)

        if (uploadProgress.progress >= 100) {
          clearInterval(interval)
          uploadProgress.status = 'completed'
          
          // Criar asset após upload
          createAssetFromUpload(uploadProgress, file)
          resolve()
        }
      }, 100) // Update every 100ms
    })
  }

  const createAssetFromUpload = async (uploadProgress: UploadProgress, file: File) => {
    try {
      const user = userStore.user
      if (!user) throw new Error('Usuário não encontrado')

      // Determinar tipo do arquivo
      const getAssetType = (filename: string): Asset['type'] => {
        const ext = filename.toLowerCase().split('.').pop()
        if (['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(ext || '')) return 'video'
        if (['mp3', 'wav', 'aac', 'flac', 'ogg'].includes(ext || '')) return 'audio'
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return 'image'
        return 'document'
      }

      const assetType = getAssetType(file.name)
      
      // Simular geração de preview
      const previewPath = `/mock/previews/${uploadProgress.id}-preview.${assetType === 'video' ? 'mp4' : assetType === 'audio' ? 'mp3' : 'jpg'}`
      
      const newAsset: Asset = {
        id: `asset-${Date.now()}-${Math.random()}`,
        filename: `${uploadProgress.id}-${file.name}`,
        originalName: file.name,
        type: assetType,
        status: 'staging',
        size: file.size,
        duration: assetType === 'video' || assetType === 'audio' ? Math.floor(Math.random() * 300) + 30 : undefined,
        dimensions: assetType === 'image' || assetType === 'video' ? {
          width: 1920,
          height: 1080
        } : undefined,
        previewPath,
        uploadedBy: user as User,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
        licenseType: 'custom',
        rightsType: 'limited'
      }

      // Simular Video Intelligence para vídeos
      if (assetType === 'video') {
        newAsset.videoIntelligence = {
          labels: ['auto-detected', 'sample', 'content'],
          faces: Math.floor(Math.random() * 5),
          text: ['Sample', 'Text', 'Detection'],
          scenes: Math.floor(Math.random() * 10) + 1,
          adult: false,
          violence: false
        }
      }

      assets.value.unshift(newAsset)
      
      // Log da ação
      await logCuratoriaAction('upload', newAsset.id, {
        filename: file.name,
        size: file.size,
        type: assetType
      })

      toastStore.success('Upload', `Asset "${file.name}" carregado com sucesso`)
    } catch (error) {
      toastStore.error('Erro', 'Erro ao criar asset após upload')
    }
  }

  const updateAssetMetadata = async (assetId: string, metadata: Partial<Asset>) => {
    loading.value = true
    try {
      // eslint-disable-next-line no-undef
      await new Promise(resolve => setTimeout(resolve, 500))

      const index = assets.value.findIndex(a => a.id === assetId)
      if (index === -1) throw new Error('Asset não encontrado')

      const originalAsset = { ...assets.value[index] }
      assets.value[index] = {
        ...assets.value[index],
        ...metadata,
        updatedAt: new Date()
      }

      await logCuratoriaAction('edit_metadata', assetId, {
        changes: metadata,
        previous: originalAsset
      })

      toastStore.success('Sucesso', 'Metadados atualizados com sucesso')
      return assets.value[index]
    } catch (error) {
      toastStore.error('Erro', 'Erro ao atualizar metadados')
      throw error
    } finally {
      loading.value = false
    }
  }

  const approveAsset = async (assetId: string, notes?: string) => {
    loading.value = true
    try {
      // eslint-disable-next-line no-undef
      await new Promise(resolve => setTimeout(resolve, 1000))

      const index = assets.value.findIndex(a => a.id === assetId)
      if (index === -1) throw new Error('Asset não encontrado')

      const user = userStore.currentUser
      if (!user) throw new Error('Usuário não encontrado')

      const asset = assets.value[index]
      
      const updatedAsset = {
        ...asset,
        status: 'approved' as AssetStatus,
        approvedBy: user as any,
        approvedAt: new Date(),
        updatedAt: new Date(),
        // Simular move para bucket processed
        processedPath: `/mock/processed/${asset.filename}`
      }
      assets.value[index] = updatedAsset as any

      await logCuratoriaAction('approve', assetId, {
        notes,
        previousStatus: asset.status
      })

      toastStore.success('Aprovado', `Asset "${asset.title || asset.filename}" aprovado com sucesso`)
      return assets.value[index]
    } catch (error) {
      toastStore.error('Erro', 'Erro ao aprovar asset')
      throw error
    } finally {
      loading.value = false
    }
  }

  const rejectAsset = async (assetId: string, reason: string) => {
    loading.value = true
    try {
      // eslint-disable-next-line no-undef
      await new Promise(resolve => setTimeout(resolve, 500))

      const index = assets.value.findIndex(a => a.id === assetId)
      if (index === -1) throw new Error('Asset não encontrado')

      const user = userStore.currentUser
      if (!user) throw new Error('Usuário não encontrado')

      const asset = assets.value[index]
      
      const updatedAsset = {
        ...asset,
        status: 'rejected' as AssetStatus,
        rejectedBy: user as any,
        rejectedAt: new Date(),
        rejectionReason: reason,
        updatedAt: new Date()
      }
      assets.value[index] = updatedAsset as any

      await logCuratoriaAction('reject', assetId, {
        reason,
        previousStatus: asset.status
      })

      toastStore.success('Rejeitado', `Asset "${asset.title || asset.filename}" rejeitado`)
      return assets.value[index]
    } catch (error) {
      toastStore.error('Erro', 'Erro ao rejeitar asset')
      throw error
    } finally {
      loading.value = false
    }
  }

  const deleteAsset = async (assetId: string) => {
    loading.value = true
    try {
      // eslint-disable-next-line no-undef
      await new Promise(resolve => setTimeout(resolve, 500))

      const index = assets.value.findIndex(a => a.id === assetId)
      if (index === -1) throw new Error('Asset não encontrado')

      const asset = assets.value[index]!
      assets.value.splice(index, 1)

      await logCuratoriaAction('delete', assetId, {
        filename: asset.filename,
        title: asset.title
      })

      toastStore.success('Excluído', `Asset "${asset.title || asset.filename}" excluído`)
    } catch (error) {
      toastStore.error('Erro', 'Erro ao excluir asset')
      throw error
    } finally {
      loading.value = false
    }
  }

  const logCuratoriaAction = async (action: CuratoriaAction['action'], assetId: string, details: Record<string, any>, notes?: string) => {
    const user = userStore.user
    if (!user) return

    const curatoriaAction: CuratoriaAction = {
      id: `action-${Date.now()}-${Math.random()}`,
      assetId,
      action,
      performedBy: user as User,
      timestamp: new Date(),
      details,
      notes
    }

    curatoriaActions.value.unshift(curatoriaAction)
  }

  const removeUpload = (uploadId: string) => {
    const index = uploads.value.findIndex(u => u.id === uploadId)
    if (index !== -1) {
      uploads.value.splice(index, 1)
    }
  }

  const clearCompletedUploads = () => {
    uploads.value = uploads.value.filter(u => u.status !== 'completed')
  }

  return {
    // State
    assets,
    uploads,
    curatoriaActions,
    loading,
    uploadLoading,

    // Mock data
    mockFornecedores,
    mockCategories,
    mockTags,

    // Getters
    assetsByStatus,
    stagingAssets,
    approvedAssets,
    rejectedAssets,
    totalAssetsSize,
    getFilteredAssets,

    // Actions
    fetchAssets,
    startUpload,
    updateAssetMetadata,
    approveAsset,
    rejectAsset,
    deleteAsset,
    removeUpload,
    clearCompletedUploads,
    logCuratoriaAction
  }
})