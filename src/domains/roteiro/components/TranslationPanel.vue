<template>
  <div class="translation-panel h-full flex flex-col">
    <!-- Header -->
    <div class="flex-shrink-0 p-4 border-b border-gray-200">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-900">
          Tradução & Locução
        </h3>
        
        <div class="flex items-center space-x-2">
          <Button
            label="Gerar Todas"
            icon="pi pi-play"
            size="small"
            @click="generateAllTranslations"
          />
          <Button
            label="Configurações"
            icon="pi pi-cog"
            severity="secondary"
            size="small"
            @click="showSettings = true"
          />
        </div>
      </div>

      <!-- Language Tabs -->
      <div class="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          v-for="lang in supportedLanguages"
          :key="lang.code"
          class="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors"
          :class="{
            'bg-white text-blue-600 shadow-sm': selectedLanguage === lang.code,
            'text-gray-600 hover:text-gray-900': selectedLanguage !== lang.code
          }"
          @click="selectedLanguage = lang.code"
        >
          {{ lang.flag }} {{ lang.name }}
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-hidden">
      <div class="h-full overflow-y-auto p-4">
        <!-- No segments message -->
        <div
          v-if="segments.length === 0"
          class="text-center py-12"
        >
          <i class="pi pi-microphone text-4xl text-gray-400 mb-4" />
          <h4 class="text-lg font-medium text-gray-900 mb-2">
            Nenhum Segmento Disponível
          </h4>
          <p class="text-gray-600">
            Crie segmentos no player para visualizar as opções de tradução e locução
          </p>
        </div>

        <!-- Segments List -->
        <div
          v-else
          class="space-y-4"
        >
          <div
            v-for="(segment, index) in segments"
            :key="segment.id"
            class="translation-segment"
          >
            <div class="bg-white border border-gray-200 rounded-lg p-6">
              <!-- Segment Header -->
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h4 class="font-medium text-gray-900">
                    Segmento {{ index + 1 }}
                  </h4>
                  <p class="text-sm text-gray-600">
                    {{ formatTime(segment.startTime) }} - {{ formatTime(segment.endTime) }}
                  </p>
                </div>
                
                <div class="flex items-center space-x-2">
                  <Badge
                    :value="getSegmentStatus(segment.id)"
                    :severity="getStatusSeverity(getSegmentStatus(segment.id))"
                  />
                  <Button
                    icon="pi pi-play"
                    severity="secondary"
                    size="small"
                    @click="playSegment(segment)"
                  />
                </div>
              </div>

              <!-- Original Comments (PT) -->
              <div class="mb-6">
                <div class="flex items-center justify-between mb-3">
                  <h5 class="font-medium text-gray-900">
                    🇧🇷 Português (Original)
                  </h5>
                  <Button
                    label="Adicionar Comentário"
                    icon="pi pi-plus"
                    size="small"
                    @click="addComment(segment.id, 'pt')"
                  />
                </div>

                <div
                  v-if="getSegmentComments(segment.id, 'pt').length === 0"
                  class="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg"
                >
                  <i class="pi pi-comment text-2xl text-gray-400 mb-2" />
                  <p class="text-gray-600">
                    Nenhum comentário em português
                  </p>
                </div>

                <div
                  v-else
                  class="space-y-3"
                >
                  <div
                    v-for="comment in getSegmentComments(segment.id, 'pt')"
                    :key="comment.id"
                    class="comment-card"
                  >
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div class="flex justify-between items-start mb-2">
                        <div class="flex items-center space-x-2">
                          <Badge
                            :value="comment.type.toUpperCase()"
                            severity="info"
                            class="text-xs"
                          />
                          <span
                            v-if="comment.timestamp"
                            class="text-xs text-gray-600"
                          >
                            @ {{ formatTime(comment.timestamp) }}
                          </span>
                        </div>
                        
                        <div class="flex space-x-1">
                          <Button
                            icon="pi pi-pencil"
                            severity="secondary"
                            text
                            size="small"
                            @click="editComment(comment)"
                          />
                          <Button
                            icon="pi pi-trash"
                            severity="danger"
                            text
                            size="small"
                            @click="deleteComment(comment.id)"
                          />
                        </div>
                      </div>
                      
                      <p class="text-gray-900 mb-3">
                        {{ comment.text }}
                      </p>
                      
                      <!-- Audio Controls -->
                      <div class="flex items-center space-x-3">
                        <Button
                          icon="pi pi-volume-up"
                          label="Gerar Áudio"
                          severity="success"
                          size="small"
                          @click="generateAudio(comment.id, 'pt')"
                        />
                        
                        <div
                          v-if="getAudioStatus(comment.id, 'pt') === 'generated'"
                          class="flex items-center space-x-2"
                        >
                          <Button
                            icon="pi pi-play"
                            severity="secondary"
                            size="small"
                            @click="playAudio(comment.id, 'pt')"
                          />
                          <Button
                            icon="pi pi-refresh"
                            severity="warning"
                            size="small"
                            @click="regenerateAudio(comment.id, 'pt')"
                          />
                          <span class="text-xs text-green-600">
                            ✓ Gerado
                          </span>
                        </div>
                        
                        <div
                          v-else-if="getAudioStatus(comment.id, 'pt') === 'generating'"
                          class="flex items-center space-x-2"
                        >
                          <ProgressSpinner size="16px" />
                          <span class="text-xs text-blue-600">
                            Gerando...
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Translation for Selected Language -->
              <div
                v-if="selectedLanguage !== 'pt'"
                class="border-t border-gray-200 pt-6"
              >
                <div class="flex items-center justify-between mb-3">
                  <h5 class="font-medium text-gray-900">
                    {{ getLanguageFlag(selectedLanguage) }} {{ getLanguageName(selectedLanguage) }}
                  </h5>
                  <div class="flex items-center space-x-2">
                    <Button
                      label="Traduzir Tudo"
                      icon="pi pi-language"
                      size="small"
                      @click="translateAllComments(segment.id, selectedLanguage)"
                    />
                    <Button
                      label="Gerar Áudios"
                      icon="pi pi-volume-up"
                      severity="success"
                      size="small"
                      @click="generateAllAudios(segment.id, selectedLanguage)"
                    />
                  </div>
                </div>

                <div
                  v-if="getTranslations(segment.id, selectedLanguage).length === 0"
                  class="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg"
                >
                  <i class="pi pi-globe text-2xl text-gray-400 mb-2" />
                  <p class="text-gray-600">
                    Nenhuma tradução disponível
                  </p>
                  <Button
                    label="Iniciar Tradução"
                    icon="pi pi-language"
                    class="mt-3"
                    @click="translateAllComments(segment.id, selectedLanguage)"
                  />
                </div>

                <div
                  v-else
                  class="space-y-3"
                >
                  <div
                    v-for="translation in getTranslations(segment.id, selectedLanguage)"
                    :key="translation.id"
                    class="translation-card"
                  >
                    <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div class="flex justify-between items-start mb-2">
                        <div class="flex items-center space-x-2">
                          <Badge
                            :value="translation.status.toUpperCase()"
                            :severity="getTranslationStatusSeverity(translation.status)"
                            class="text-xs"
                          />
                          <span class="text-xs text-gray-600">
                            {{ getLanguageName(translation.language) }}
                          </span>
                        </div>
                        
                        <div class="flex space-x-1">
                          <Button
                            icon="pi pi-pencil"
                            severity="secondary"
                            text
                            size="small"
                            @click="editTranslation(translation)"
                          />
                          <Button
                            icon="pi pi-refresh"
                            severity="warning"
                            text
                            size="small"
                            @click="retranslate(translation.id)"
                          />
                        </div>
                      </div>
                      
                      <p class="text-gray-900 mb-3">
                        {{ translation.text }}
                      </p>
                      
                      <!-- Audio Controls -->
                      <div class="flex items-center space-x-3">
                        <Button
                          icon="pi pi-volume-up"
                          label="Gerar Áudio"
                          severity="success"
                          size="small"
                          @click="generateAudio(translation.comentarioId, translation.language)"
                        />
                        
                        <div
                          v-if="translation.audioUrl"
                          class="flex items-center space-x-2"
                        >
                          <Button
                            icon="pi pi-play"
                            severity="secondary"
                            size="small"
                            @click="playAudio(translation.comentarioId, translation.language)"
                          />
                          <Button
                            icon="pi pi-refresh"
                            severity="warning"
                            size="small"
                            @click="regenerateAudio(translation.comentarioId, translation.language)"
                          />
                          <span class="text-xs text-green-600">
                            ✓ Áudio disponível
                          </span>
                        </div>
                        
                        <div
                          v-else-if="translation.status === 'generated'"
                          class="text-xs text-orange-600"
                        >
                          Áudio pendente
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Settings Dialog -->
    <Dialog
      :visible="showSettings"
      :modal="true"
      :closable="true"
      header="Configurações de Tradução e Locução"
      class="w-full max-w-2xl"
      @update:visible="showSettings = $event"
    >
      <div class="space-y-6">
        <!-- Voice Settings -->
        <div>
          <h4 class="text-lg font-medium text-gray-900 mb-4">
            Configurações de Voz
          </h4>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="lang in supportedLanguages"
              :key="lang.code"
              class="space-y-2"
            >
              <label class="block text-sm font-medium text-gray-700">
                {{ lang.flag }} {{ lang.name }}
              </label>
              <Dropdown
                v-model="voiceSettings[lang.code]"
                :options="getVoiceOptions(lang.code)"
                option-label="name"
                option-value="id"
                placeholder="Selecionar voz"
                class="w-full"
              />
            </div>
          </div>
        </div>

        <!-- Translation Settings -->
        <div class="border-t border-gray-200 pt-6">
          <h4 class="text-lg font-medium text-gray-900 mb-4">
            Configurações de Tradução
          </h4>
          
          <div class="space-y-4">
            <div class="flex items-center space-x-3">
              <Checkbox
                v-model="translationSettings.autoTranslate"
                binary
              />
              <label class="text-sm text-gray-700">
                Traduzir automaticamente novos comentários
              </label>
            </div>
            
            <div class="flex items-center space-x-3">
              <Checkbox
                v-model="translationSettings.autoGenerateAudio"
                binary
              />
              <label class="text-sm text-gray-700">
                Gerar áudio automaticamente após tradução
              </label>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end space-x-2">
          <Button
            label="Cancelar"
            severity="secondary"
            @click="showSettings = false"
          />
          <Button
            label="Salvar"
            @click="saveSettings"
          />
        </div>
      </template>
    </Dialog>

    <!-- Comment/Translation Edit Dialog -->
    <Dialog
      :visible="showEditDialog"
      :modal="true"
      :closable="true"
      :header="editingTranslation ? 'Editar Tradução' : 'Editar Comentário'"
      class="w-full max-w-md"
      @update:visible="showEditDialog = $event"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Texto
          </label>
          <Textarea
            v-model="editForm.text"
            rows="4"
            placeholder="Digite o texto..."
            class="w-full"
          />
        </div>

        <div v-if="!editingTranslation">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Tipo
          </label>
          <Dropdown
            v-model="editForm.type"
            :options="commentTypeOptions"
            option-label="label"
            option-value="value"
            placeholder="Selecionar tipo"
            class="w-full"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end space-x-2">
          <Button
            label="Cancelar"
            severity="secondary"
            @click="cancelEdit"
          />
          <Button
            label="Salvar"
            @click="saveEdit"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from 'primevue/button'
import Badge from 'primevue/badge'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import Textarea from 'primevue/textarea'
import Checkbox from 'primevue/checkbox'
import ProgressSpinner from 'primevue/progressspinner'
import { useToastStore, useRoteiroStore } from '../../../app/stores'
import type { RoteiroComentario, RoteiroComentarioI18n, ComentarioType, TranslationStatus } from '../../../shared/types'

// Props
const props = defineProps<{
  segments: Array<{
    id: string
    startTime: number
    endTime: number
    comments: RoteiroComentario[]
  }>
}>()

// Emits
const emit = defineEmits<{
  'play-segment': [segment: any]
  'comment-added': [segmentId: string, comment: RoteiroComentario]
  'translation-generated': [commentId: string, translation: RoteiroComentarioI18n]
}>()

const toastStore = useToastStore()
const roteiroStore = useRoteiroStore()

// State
const selectedLanguage = ref('pt')
const showSettings = ref(false)
const showEditDialog = ref(false)
const editingComment = ref<RoteiroComentario | null>(null)
const editingTranslation = ref<RoteiroComentarioI18n | null>(null)

// Mock data
const supportedLanguages = [
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' }
]

const voiceSettings = ref({
  pt: 'pt-BR-Standard-A',
  en: 'en-US-Standard-A',
  es: 'es-ES-Standard-A',
  fr: 'fr-FR-Standard-A'
})

const translationSettings = ref({
  autoTranslate: false,
  autoGenerateAudio: false
})

const editForm = ref({
  text: '',
  type: 'note' as ComentarioType
})

const commentTypeOptions = [
  { label: 'Direção', value: 'direction' },
  { label: 'Nota', value: 'note' },
  { label: 'Roteiro', value: 'script' },
  { label: 'Técnico', value: 'technical' },
  { label: 'Feedback', value: 'feedback' }
]

// Mock translations storage
const translations = ref<RoteiroComentarioI18n[]>([])
const audioStatus = ref<Record<string, Record<string, 'pending' | 'generating' | 'generated'>>>({})

// Methods
const getSegmentComments = (segmentId: string, language: string) => {
  const segment = props.segments.find(s => s.id === segmentId)
  if (!segment) return []
  
  if (language === 'pt') {
    return segment.comments
  }
  
  return segment.comments
}

const getTranslations = (segmentId: string, language: string) => {
  const segment = props.segments.find(s => s.id === segmentId)
  if (!segment) return []
  
  const segmentTranslations: RoteiroComentarioI18n[] = []
  
  segment.comments.forEach(comment => {
    const translation = translations.value.find(t => 
      t.comentarioId === comment.id && t.language === language
    )
    if (translation) {
      segmentTranslations.push(translation)
    }
  })
  
  return segmentTranslations
}

const getSegmentStatus = (segmentId: string) => {
  const segment = props.segments.find(s => s.id === segmentId)
  if (!segment || segment.comments.length === 0) return 'Sem comentários'
  
  const hasAudio = segment.comments.some(comment => 
    getAudioStatus(comment.id, selectedLanguage.value) === 'generated'
  )
  
  if (selectedLanguage.value !== 'pt') {
    const hasTranslations = getTranslations(segmentId, selectedLanguage.value).length > 0
    if (!hasTranslations) return 'Pendente tradução'
    if (!hasAudio) return 'Pendente locução'
  }
  
  return hasAudio ? 'Completo' : 'Pendente locução'
}

const getStatusSeverity = (status: string) => {
  const severities: Record<string, string> = {
    'Completo': 'success',
    'Pendente locução': 'warning',
    'Pendente tradução': 'info',
    'Sem comentários': 'secondary'
  }
  return severities[status] || 'secondary'
}

const getAudioStatus = (commentId: string, language: string) => {
  return audioStatus.value[commentId]?.[language] || 'pending'
}

const getLanguageFlag = (code: string) => {
  return supportedLanguages.find(lang => lang.code === code)?.flag || ''
}

const getLanguageName = (code: string) => {
  return supportedLanguages.find(lang => lang.code === code)?.name || code
}

const getTranslationStatusSeverity = (status: TranslationStatus) => {
  const severities: Record<TranslationStatus, string> = {
    pending: 'info',
    generated: 'success',
    error: 'danger',
    approved: 'success'
  }
  return severities[status] || 'secondary'
}

const getVoiceOptions = (languageCode: string) => {
  // Mock voice options
  const voices: Record<string, Array<{ id: string; name: string }>> = {
    pt: [
      { id: 'pt-BR-Standard-A', name: 'Feminina (Padrão)' },
      { id: 'pt-BR-Standard-B', name: 'Masculina (Padrão)' },
      { id: 'pt-BR-Neural2-A', name: 'Feminina (Neural)' },
      { id: 'pt-BR-Neural2-B', name: 'Masculina (Neural)' }
    ],
    en: [
      { id: 'en-US-Standard-A', name: 'Female (Standard)' },
      { id: 'en-US-Standard-B', name: 'Male (Standard)' },
      { id: 'en-US-Neural2-A', name: 'Female (Neural)' },
      { id: 'en-US-Neural2-B', name: 'Male (Neural)' }
    ],
    es: [
      { id: 'es-ES-Standard-A', name: 'Femenina (Estándar)' },
      { id: 'es-ES-Standard-B', name: 'Masculina (Estándar)' }
    ],
    fr: [
      { id: 'fr-FR-Standard-A', name: 'Féminine (Standard)' },
      { id: 'fr-FR-Standard-B', name: 'Masculine (Standard)' }
    ]
  }
  
  return voices[languageCode] || []
}

// Actions
const addComment = (segmentId: string, language: string) => {
  // Mock - open comment dialog
  toastStore.info('Adicionar Comentário', `Adicionar comentário em ${getLanguageName(language)}`)
}

const editComment = (comment: RoteiroComentario) => {
  editingComment.value = comment
  editingTranslation.value = null
  editForm.value = {
    text: comment.text,
    type: comment.type
  }
  showEditDialog.value = true
}

const editTranslation = (translation: RoteiroComentarioI18n) => {
  editingTranslation.value = translation
  editingComment.value = null
  editForm.value = {
    text: translation.text,
    type: 'note'
  }
  showEditDialog.value = true
}

const deleteComment = (commentId: string) => {
  toastStore.info('Comentário Removido', 'Comentário removido com sucesso')
}

const generateAudio = (commentId: string, language: string) => {
  if (!audioStatus.value[commentId]) {
    audioStatus.value[commentId] = {}
  }
  
  audioStatus.value[commentId][language] = 'generating'
  
  // Mock generation
  setTimeout(() => {
    audioStatus.value[commentId][language] = 'generated'
    toastStore.success('Áudio Gerado', `Áudio gerado em ${getLanguageName(language)}`)
  }, 2000)
}

const regenerateAudio = (commentId: string, language: string) => {
  generateAudio(commentId, language)
  toastStore.info('Regenerando Áudio', 'Regenerando áudio com novas configurações')
}

const playAudio = (commentId: string, language: string) => {
  toastStore.info('Reproduzindo Áudio', `Reproduzindo áudio em ${getLanguageName(language)}`)
}

const playSegment = (segment: any) => {
  emit('play-segment', segment)
}

const translateAllComments = (segmentId: string, language: string) => {
  const segment = props.segments.find(s => s.id === segmentId)
  if (!segment) return
  
  segment.comments.forEach(comment => {
    const mockTranslation: RoteiroComentarioI18n = {
      id: Date.now().toString() + Math.random(),
      comentarioId: comment.id,
      language,
      text: `[Tradução para ${getLanguageName(language)}] ${comment.text}`,
      status: 'generated',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        translatedBy: 'AI-Assistant',
        generatedAt: new Date()
      }
    }
    
    translations.value.push(mockTranslation)
    emit('translation-generated', comment.id, mockTranslation)
  })
  
  toastStore.success('Tradução Completa', `Comentários traduzidos para ${getLanguageName(language)}`)
}

const generateAllAudios = (segmentId: string, language: string) => {
  const translationsList = getTranslations(segmentId, language)
  
  translationsList.forEach(translation => {
    generateAudio(translation.comentarioId, language)
  })
  
  toastStore.info('Gerando Áudios', `Gerando áudios em ${getLanguageName(language)}`)
}

const generateAllTranslations = () => {
  props.segments.forEach(segment => {
    supportedLanguages.forEach(lang => {
      if (lang.code !== 'pt') {
        translateAllComments(segment.id, lang.code)
      }
    })
  })
  
  toastStore.success('Processamento Iniciado', 'Traduzindo e gerando áudios para todos os idiomas')
}

const retranslate = (translationId: string) => {
  const translation = translations.value.find(t => t.id === translationId)
  if (translation) {
    translation.status = 'generated'
    translation.text = `[Retradução] ${translation.text}`
    translation.updatedAt = new Date()
    
    toastStore.success('Retradução Completa', 'Texto retraduzido com sucesso')
  }
}

const saveSettings = () => {
  showSettings.value = false
  toastStore.success('Configurações Salvas', 'Configurações de tradução e locução salvas')
}

const saveEdit = () => {
  if (editingComment.value) {
    editingComment.value.text = editForm.value.text
    editingComment.value.type = editForm.value.type
    toastStore.success('Comentário Atualizado', 'Comentário atualizado com sucesso')
  } else if (editingTranslation.value) {
    editingTranslation.value.text = editForm.value.text
    toastStore.success('Tradução Atualizada', 'Tradução atualizada com sucesso')
  }
  
  cancelEdit()
}

const cancelEdit = () => {
  showEditDialog.value = false
  editingComment.value = null
  editingTranslation.value = null
  editForm.value = {
    text: '',
    type: 'note'
  }
}

// Utility functions
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.translation-segment {
  transition: all 0.2s ease;
}

.translation-segment:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.comment-card,
.translation-card {
  transition: all 0.2s ease;
}

.comment-card:hover,
.translation-card:hover {
  transform: translateX(4px);
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>

