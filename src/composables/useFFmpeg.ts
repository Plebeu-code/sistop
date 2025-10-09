import { ref } from 'vue'

// Global declarations
declare const console: any
declare const document: any
declare const URL: any
declare const Blob: any
declare const setTimeout: any

export interface VideoSettings {
  resolution: string
  fps: number
  quality: string
  format: string
  bitrate?: string
}

export interface TimelineItem {
  id: number
  title: string
  startTime: number
  duration: number
  file?: any
  url?: string
  type: 'video' | 'audio' | 'image'
  thumbnail?: string
  opacity?: number
  volume?: number
}

export interface ExportProgress {
  phase: 'preparing' | 'processing' | 'encoding' | 'finalizing' | 'complete'
  progress: number
  message: string
  timeRemaining?: number
}

export const useFFmpeg = () => {
  const isLoaded = ref(true) // Simplified - assume always loaded
  const isLoading = ref(false)
  const exportProgress = ref<ExportProgress>({
    phase: 'preparing',
    progress: 0,
    message: 'Pronto para exportar'
  })

  // Initialize - simplified
  const load = async () => {
    try {
      isLoading.value = true
      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 1000))
      isLoaded.value = true
      console.log('FFmpeg carregado (simulado)')
    } catch (error) {
      console.error('Erro ao carregar FFmpeg:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Export video - simplified for now
  const exportVideo = async (
    videoItems: TimelineItem[],
    audioItems: TimelineItem[],
    settings: VideoSettings,
    totalDuration: number
  ): Promise<any> => {
    try {
      exportProgress.value = {
        phase: 'preparing',
        progress: 0,
        message: 'Preparando exportação...'
      }

      // Simulate export process
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200))
        exportProgress.value = {
          phase: 'encoding',
          progress: i,
          message: `Processando... ${i}%`,
          timeRemaining: i < 100 ? (100 - i) * 2 : 0
        }
      }

      exportProgress.value = {
        phase: 'complete',
        progress: 100,
        message: 'Exportação concluída!'
      }

      // Create a dummy blob for now
      return new Blob(['dummy video data'], { type: `video/${settings.format}` })
    } catch (error) {
      console.error('Erro na exportação:', error)
      throw error
    }
  }

  // Create thumbnail - simplified
  const createThumbnail = async (file: any): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      video.onloadedmetadata = () => {
        canvas.width = 120
        canvas.height = 68
        video.currentTime = 1 // Get frame at 1 second
      }
      
      video.onseeked = () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const thumbnail = canvas.toDataURL('image/jpeg', 0.7)
          resolve(thumbnail)
        } else {
          resolve('/api/placeholder/120/68')
        }
        URL.revokeObjectURL(video.src)
      }
      
      video.onerror = () => {
        resolve('/api/placeholder/120/68')
        URL.revokeObjectURL(video.src)
      }
      
      video.src = URL.createObjectURL(file)
    })
  }

  // Get video duration
  const getVideoDuration = async (file: any): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      
      video.onloadedmetadata = () => {
        resolve(video.duration)
        URL.revokeObjectURL(video.src)
      }
      
      video.onerror = () => {
        resolve(30) // Default fallback
        URL.revokeObjectURL(video.src)
      }
      
      video.src = URL.createObjectURL(file)
    })
  }

  // Get audio duration
  const getAudioDuration = async (file: any): Promise<number> => {
    return new Promise((resolve) => {
      const audio = document.createElement('audio')
      audio.preload = 'metadata'
      
      audio.onloadedmetadata = () => {
        resolve(audio.duration)
        URL.revokeObjectURL(audio.src)
      }
      
      audio.onerror = () => {
        resolve(30) // Default fallback
        URL.revokeObjectURL(audio.src)
      }
      
      audio.src = URL.createObjectURL(file)
    })
  }

  return {
    isLoaded,
    isLoading,
    exportProgress,
    load,
    exportVideo,
    createThumbnail,
    getVideoDuration,
    getAudioDuration
  }
}