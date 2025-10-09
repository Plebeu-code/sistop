import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TTSState, TTSLanguage, TTSConfig, RoteiroComentario } from '@/shared/types'
import { useToastStore } from './toast'

/**
 * Store para gerenciar estados de TTS (Text-to-Speech)
 * TAREFA 08 — Idiomas & TTS (UI de estados)
 */
export const useTTSStore = defineStore('tts', () => {
  const toastStore = useToastStore()

  // Estado reativo
  const ttsStates = ref<TTSState[]>([])
  const currentConfig = ref<TTSConfig>({
    defaultVoice: 'pt-br-neural-female',
    speed: 1.0,
    pitch: 0,
    volume: 80
  })

  // Idiomas disponíveis
  const availableLanguages = ref<TTSLanguage[]>([
    {
      code: 'pt-br',
      name: 'Português (Brasil)',
      flag: '🇧🇷',
      voices: [
        { id: 'pt-br-neural-female', name: 'Camila (Neural)', gender: 'female', type: 'neural' },
        { id: 'pt-br-neural-male', name: 'Ricardo (Neural)', gender: 'male', type: 'neural' },
        { id: 'pt-br-standard-female', name: 'Vitória (Standard)', gender: 'female', type: 'standard' }
      ]
    },
    {
      code: 'en-us',
      name: 'English (US)',
      flag: '🇺🇸',
      voices: [
        { id: 'en-us-neural-female', name: 'Aria (Neural)', gender: 'female', type: 'neural' },
        { id: 'en-us-neural-male', name: 'Davis (Neural)', gender: 'male', type: 'neural' },
        { id: 'en-us-standard-female', name: 'Jenny (Standard)', gender: 'female', type: 'standard' }
      ]
    },
    {
      code: 'es-es',
      name: 'Español (España)',
      flag: '🇪🇸',
      voices: [
        { id: 'es-es-neural-female', name: 'Elvira (Neural)', gender: 'female', type: 'neural' },
        { id: 'es-es-neural-male', name: 'Álvaro (Neural)', gender: 'male', type: 'neural' }
      ]
    },
    {
      code: 'fr-fr',
      name: 'Français (France)',
      flag: '🇫🇷',
      voices: [
        { id: 'fr-fr-neural-female', name: 'Denise (Neural)', gender: 'female', type: 'neural' },
        { id: 'fr-fr-neural-male', name: 'Henri (Neural)', gender: 'male', type: 'neural' }
      ]
    }
  ])

  // Computadas
  const getTTSStatesByComentario = computed(() => {
    return (comentarioId: string) => {
      return ttsStates.value.filter(state => state.comentarioId === comentarioId)
    }
  })

  const getTTSState = computed(() => {
    return (comentarioId: string, language: string) => {
      return ttsStates.value.find(state => 
        state.comentarioId === comentarioId && state.language === language
      )
    }
  })

  const getLanguageByCode = computed(() => {
    return (code: string) => {
      return availableLanguages.value.find(lang => lang.code === code)
    }
  })

  // Ações
  function initializeTTSStates(comentarios: RoteiroComentario[]) {
    const newStates: TTSState[] = []
    
    comentarios.forEach(comentario => {
      availableLanguages.value.forEach(language => {
        const existingState = getTTSState.value(comentario.id, language.code)
        
        if (!existingState) {
          newStates.push({
            comentarioId: comentario.id,
            language: language.code,
            status: 'idle',
            voice: language.voices[0]?.id || currentConfig.value.defaultVoice
          })
        }
      })
    })
    
    ttsStates.value.push(...newStates)
  }

  function updateTTSState(comentarioId: string, language: string, updates: Partial<TTSState>) {
    const stateIndex = ttsStates.value.findIndex(
      state => state.comentarioId === comentarioId && state.language === language
    )
    
    if (stateIndex !== -1) {
      const currentState = ttsStates.value[stateIndex]
      ttsStates.value[stateIndex] = {
        comentarioId: currentState.comentarioId,
        language: currentState.language,
        status: updates.status || currentState.status,
        audioUrl: updates.audioUrl !== undefined ? updates.audioUrl : currentState.audioUrl,
        duration: updates.duration !== undefined ? updates.duration : currentState.duration,
        voice: updates.voice || currentState.voice,
        generatedAt: updates.generatedAt !== undefined ? updates.generatedAt : currentState.generatedAt,
        error: updates.error !== undefined ? updates.error : currentState.error,
        progress: updates.progress !== undefined ? updates.progress : currentState.progress
      }
    }
  }

  async function generateTTS(comentarioId: string, language: string, text: string): Promise<boolean> {
    const languageInfo = getLanguageByCode.value(language)
    
    try {
      // Atualizar estado para "generating"
      updateTTSState(comentarioId, language, {
        status: 'generating',
        progress: 0,
        error: undefined
      })

      // Simular progresso (sem usar setInterval)
      const progressSteps = [20, 40, 60, 80, 100]
      for (const progress of progressSteps) {
        await new Promise(resolve => {
          // Usar requestAnimationFrame se disponível, senão Promise resolve imediato
          if (typeof requestAnimationFrame !== 'undefined') {
            requestAnimationFrame(() => resolve(undefined))
          } else {
            Promise.resolve().then(() => resolve(undefined))
          }
        })
        updateTTSState(comentarioId, language, { progress })
      }
      
      // Simular dados do áudio gerado
      const wordsCount = text.split(' ').length
      const estimatedDuration = Math.max(wordsCount * 0.6, 1)
      const mockAudioUrl = `mock-audio-${comentarioId}-${language}-${Date.now()}`
      
      // Atualizar estado para "generated"
      updateTTSState(comentarioId, language, {
        status: 'generated',
        audioUrl: mockAudioUrl,
        duration: Math.round(estimatedDuration * 10) / 10,
        generatedAt: new Date(),
        progress: 100
      })

      toastStore.success(
        'TTS Gerado',
        `Áudio gerado em ${languageInfo?.name || language} (${Math.round(estimatedDuration * 10) / 10}s)`
      )
      
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      updateTTSState(comentarioId, language, {
        status: 'error',
        error: errorMessage,
        progress: 0
      })
      
      toastStore.error('Erro TTS', `Falha ao gerar áudio: ${errorMessage}`)
      return false
    }
  }

  async function regenerateTTS(comentarioId: string, language: string, text: string): Promise<boolean> {
    // Reset do estado antes de regenerar
    updateTTSState(comentarioId, language, {
      status: 'idle',
      audioUrl: undefined,
      duration: undefined,
      generatedAt: undefined,
      error: undefined,
      progress: 0
    })

    return await generateTTS(comentarioId, language, text)
  }

  function playTTS(comentarioId: string, language: string) {
    const state = getTTSState.value(comentarioId, language)
    if (!state || !state.audioUrl) {
      toastStore.warning('Aviso', 'Áudio não disponível')
      return
    }

    updateTTSState(comentarioId, language, { status: 'playing' })

    // Simular fim da reprodução
    Promise.resolve().then(() => {
      updateTTSState(comentarioId, language, { status: 'generated' })
    })
  }

  function updateConfig(newConfig: Partial<TTSConfig>) {
    currentConfig.value = {
      ...currentConfig.value,
      ...newConfig
    }
  }

  function updateVoice(comentarioId: string, language: string, voiceId: string) {
    updateTTSState(comentarioId, language, { voice: voiceId })
  }

  function clearTTSStates() {
    ttsStates.value = []
  }

  function createMockComentarios(): RoteiroComentario[] {
    const mockUser = {
      id: 'user-1',
      name: 'Editor Teste',
      email: 'editor@test.com',
      roles: [] as any[],
      permissions: [] as any[],
      avatar: undefined
    }

    return [
      {
        id: 'comment-1',
        roteiroItemId: 'item-1',
        text: 'Esta é uma direção para o apresentador sobre como falar esta parte do roteiro.',
        timestamp: 0,
        type: 'direction',
        createdBy: mockUser,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'comment-2',
        roteiroItemId: 'item-2',
        text: 'Nota importante: verificar dados estatísticos antes da gravação final.',
        timestamp: 15000,
        type: 'note',
        createdBy: mockUser,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'comment-3',
        roteiroItemId: 'item-3',
        text: 'Script alternativo: "Bem-vindos ao nosso programa especial sobre tecnologia".',
        timestamp: 30000,
        type: 'script',
        createdBy: mockUser,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  }

  return {
    // Estado
    ttsStates,
    currentConfig,
    availableLanguages,
    
    // Computadas
    getTTSStatesByComentario,
    getTTSState,
    getLanguageByCode,
    
    // Ações
    initializeTTSStates,
    updateTTSState,
    generateTTS,
    regenerateTTS,
    playTTS,
    updateConfig,
    updateVoice,
    clearTTSStates,
    createMockComentarios
  }
})