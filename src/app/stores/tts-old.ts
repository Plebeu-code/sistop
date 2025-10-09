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

  const getVoiceById = computed(() => {
    return (voiceId: string) => {
      for (const lang of availableLanguages.value) {
        const voice = lang.voices.find(v => v.id === voiceId)
        if (voice) return voice
      }
      return null
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

  async function generateTTS(comentarioId: string, language: string, text: string): Promise<boolean> {
    const stateIndex = ttsStates.value.findIndex(
      state => state.comentarioId === comentarioId && state.language === language
    )
    
    if (stateIndex === -1) {
      toastStore.error('Erro', 'Estado TTS não encontrado')
      return false
    }

    const currentState = ttsStates.value[stateIndex]
    const languageInfo = getLanguageByCode.value(language)
    
    try {
      // Atualizar estado para "generating"
      ttsStates.value[stateIndex] = {
        comentarioId,
        language,
        status: 'generating',
        progress: 0,
        error: undefined,
        voice: currentState.voice
      }

      // Simular progresso de geração
      await simulateProgress(stateIndex)
      
      // Simular geração de áudio
      const audioData = await simulateAudioGeneration(text, currentState.voice || currentConfig.value.defaultVoice)
      
      // Atualizar estado para "generated"
      ttsStates.value[stateIndex] = {
        comentarioId,
        language,
        status: 'generated',
        audioUrl: audioData.url,
        duration: audioData.duration,
        generatedAt: new Date(),
        progress: 100,
        voice: currentState.voice
      }

      toastStore.success(
        'TTS Gerado',
        `Áudio gerado em ${languageInfo?.name || language} (${audioData.duration}s)`
      )
      
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      ttsStates.value[stateIndex] = {
        comentarioId,
        language,
        status: 'error',
        error: errorMessage,
        progress: 0,
        voice: currentState.voice
      }
      
      toastStore.error('Erro TTS', `Falha ao gerar áudio: ${errorMessage}`)
      return false
    }
  }

  async function regenerateTTS(comentarioId: string, language: string, text: string): Promise<boolean> {
    const state = getTTSState.value(comentarioId, language)
    if (!state) return false

    // Reset do estado antes de regenerar
    const stateIndex = ttsStates.value.findIndex(
      s => s.comentarioId === comentarioId && s.language === language
    )
    
    if (stateIndex !== -1) {
      ttsStates.value[stateIndex] = {
        ...state,
        status: 'idle',
        audioUrl: undefined,
        duration: undefined,
        generatedAt: undefined,
        error: undefined,
        progress: 0
      }
    }

    return await generateTTS(comentarioId, language, text)
  }

  function playTTS(comentarioId: string, language: string) {
    const state = getTTSState.value(comentarioId, language)
    if (!state || !state.audioUrl) {
      toastStore.warning('Aviso', 'Áudio não disponível')
      return
    }

    const stateIndex = ttsStates.value.findIndex(
      s => s.comentarioId === comentarioId && s.language === language
    )

    if (stateIndex !== -1) {
      ttsStates.value[stateIndex] = {
        ...state,
        status: 'playing'
      }

      // Simular reprodução
      setTimeout(() => {
        if (ttsStates.value[stateIndex]) {
          ttsStates.value[stateIndex] = {
            ...ttsStates.value[stateIndex],
            status: 'generated'
          }
        }
      }, (state.duration || 3) * 1000)
    }
  }

  function updateConfig(newConfig: Partial<TTSConfig>) {
    currentConfig.value = {
      ...currentConfig.value,
      ...newConfig
    }
  }

  function updateVoice(comentarioId: string, language: string, voiceId: string) {
    const stateIndex = ttsStates.value.findIndex(
      state => state.comentarioId === comentarioId && state.language === language
    )
    
    if (stateIndex !== -1) {
      ttsStates.value[stateIndex] = {
        ...ttsStates.value[stateIndex],
        voice: voiceId
      }
    }
  }

  // Funções auxiliares de simulação
  async function simulateProgress(stateIndex: number) {
    const steps = [10, 25, 50, 75, 90]
    
    for (const progress of steps) {
      await new Promise(resolve => setTimeout(resolve, 200))
      if (ttsStates.value[stateIndex]) {
        ttsStates.value[stateIndex] = {
          ...ttsStates.value[stateIndex],
          progress
        }
      }
    }
  }

  async function simulateAudioGeneration(text: string, voiceId: string) {
    // Simular tempo de processamento baseado no tamanho do texto
    const processingTime = Math.min(text.length * 10, 2000)
    await new Promise(resolve => setTimeout(resolve, processingTime))
    
    // Gerar dados simulados do áudio
    const wordsCount = text.split(' ').length
    const estimatedDuration = Math.max(wordsCount * 0.6, 1) // ~0.6s por palavra
    
    // URL simulada do áudio
    const audioUrl = `data:audio/wav;base64,${btoa(`mock-audio-${voiceId}-${Date.now()}`)}`
    
    return {
      url: audioUrl,
      duration: Math.round(estimatedDuration * 10) / 10 // arredondar para 1 decimal
    }
  }

  function clearTTSStates() {
    ttsStates.value = []
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
    getVoiceById,
    
    // Ações
    initializeTTSStates,
    generateTTS,
    regenerateTTS,
    playTTS,
    updateConfig,
    updateVoice,
    clearTTSStates
  }
})