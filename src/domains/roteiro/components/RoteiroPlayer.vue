<template>
  <div class="roteiro-player h-full flex flex-col">
    <!-- Header -->
    <div class="flex-shrink-0 p-4 border-b border-gray-200">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-900">
          Player de Roteiro
        </h3>
        
        <div class="flex items-center space-x-2">
          <Badge
            v-if="selectedAsset"
            :value="selectedAsset.type.toUpperCase()"
            severity="info"
          />
          <Badge
            v-if="activeSegments.length > 0"
            :value="`${activeSegments.length} trechos`"
            severity="success"
          />
        </div>
      </div>

      <!-- Asset Selection -->
      <div
        v-if="!selectedAsset"
        class="text-center py-8"
      >
        <i class="pi pi-video text-4xl text-gray-400 mb-3" />
        <p class="text-gray-600">
          Selecione um asset no painel de pesquisa para começar
        </p>
      </div>
    </div>

    <!-- Player Content -->
    <div
      v-if="selectedAsset"
      class="flex-1 flex flex-col"
    >
      <!-- Video Player Mock -->
      <div class="flex-shrink-0 bg-black rounded-lg mx-4 mt-4 relative">
        <div class="aspect-video flex items-center justify-center">
          <!-- Mock Video Display -->
          <div class="text-center text-white">
            <i class="pi pi-play text-6xl mb-4 opacity-50" />
            <h4 class="text-xl font-medium">
              {{ selectedAsset.title || selectedAsset.originalName }}
            </h4>
            <p class="text-sm opacity-75 mt-1">
              {{ formatDuration(selectedAsset.duration || 0) }}
            </p>
          </div>

          <!-- Overlay Controls -->
          <div class="absolute inset-0 bg-black bg-opacity-25 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Button
              :icon="isPlaying ? 'pi pi-pause' : 'pi pi-play'"
              severity="secondary"
              rounded
              size="large"
              @click="togglePlay"
            />
          </div>
        </div>

        <!-- Timeline -->
        <div class="absolute bottom-0 left-0 right-0 p-4">
          <div class="bg-gray-800 bg-opacity-75 rounded p-3">
            <!-- Progress Bar -->
            <div class="relative mb-2">
              <div class="h-2 bg-gray-600 rounded">
                <div
                  class="h-2 bg-blue-500 rounded transition-all duration-100"
                  :style="{ width: `${progressPercentage}%` }"
                />
              </div>
              
              <!-- Segment Markers -->
              <div
                v-for="segment in activeSegments"
                :key="segment.id"
                class="absolute top-0 h-2 bg-green-400 rounded opacity-75"
                :style="{
                  left: `${(segment.startTime / (selectedAsset.duration || 1)) * 100}%`,
                  width: `${((segment.endTime - segment.startTime) / (selectedAsset.duration || 1)) * 100}%`
                }"
              />
              
              <!-- Current Position Marker -->
              <div
                class="absolute top-0 w-1 h-2 bg-white"
                :style="{ left: `${progressPercentage}%` }"
              />
            </div>

            <!-- Controls -->
            <div class="flex items-center justify-between text-white text-sm">
              <div class="flex items-center space-x-4">
                <Button
                  icon="pi pi-step-backward"
                  severity="secondary"
                  size="small"
                  @click="previousSegment"
                />
                <Button
                  :icon="isPlaying ? 'pi pi-pause' : 'pi pi-play'"
                  severity="secondary"
                  size="small"
                  @click="togglePlay"
                />
                <Button
                  icon="pi pi-step-forward"
                  severity="secondary"
                  size="small"
                  @click="nextSegment"
                />
                
                <span>{{ formatTime(currentTime) }} / {{ formatTime(selectedAsset.duration || 0) }}</span>
              </div>

              <div class="flex items-center space-x-2">
                <Button
                  label="Marcar Início"
                  icon="pi pi-bookmark"
                  severity="success"
                  size="small"
                  @click="markSegmentStart"
                />
                <Button
                  label="Marcar Fim"
                  icon="pi pi-bookmark-fill"
                  severity="warning"
                  size="small"
                  :disabled="!pendingSegment.startTime"
                  @click="markSegmentEnd"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Segments List -->
      <div class="flex-1 p-4">
        <div class="flex justify-between items-center mb-4">
          <h4 class="text-lg font-medium text-gray-900">
            Trechos Selecionados
          </h4>
          
          <div class="text-sm text-gray-600">
            Duração total: {{ formatDuration(totalSegmentsDuration) }}
          </div>
        </div>

        <div
          v-if="activeSegments.length === 0"
          class="text-center py-8"
        >
          <i class="pi pi-scissors text-3xl text-gray-400 mb-3" />
          <p class="text-gray-600">
            Nenhum trecho selecionado
          </p>
          <p class="text-sm text-gray-500 mt-1">
            Use os botões "Marcar Início" e "Marcar Fim" para selecionar trechos
          </p>
        </div>

        <div
          v-else
          class="space-y-3 max-h-64 overflow-y-auto"
        >
          <div
            v-for="(segment, index) in activeSegments"
            :key="segment.id"
            class="segment-card"
          >
            <div class="bg-white border border-gray-200 rounded-lg p-4">
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <h5 class="font-medium text-gray-900">
                    Trecho {{ index + 1 }}
                  </h5>
                  <p class="text-sm text-gray-600">
                    {{ formatTime(segment.startTime) }} - {{ formatTime(segment.endTime) }}
                    ({{ formatDuration(segment.endTime - segment.startTime) }})
                  </p>
                </div>
                
                <div class="flex items-center space-x-2">
                  <Button
                    icon="pi pi-play"
                    severity="secondary"
                    size="small"
                    @click="playSegment(segment)"
                  />
                  <Button
                    icon="pi pi-pencil"
                    severity="secondary"
                    size="small"
                    @click="editSegment(segment)"
                  />
                  <Button
                    icon="pi pi-trash"
                    severity="danger"
                    size="small"
                    @click="removeSegment(segment.id)"
                  />
                </div>
              </div>

              <!-- Comments for this segment -->
              <div class="border-t border-gray-100 pt-3">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-sm font-medium text-gray-700">
                    Comentários ({{ segment.comments.length }})
                  </span>
                  <Button
                    label="Adicionar"
                    icon="pi pi-plus"
                    size="small"
                    @click="addComment(segment.id)"
                  />
                </div>

                <div
                  v-if="segment.comments.length === 0"
                  class="text-sm text-gray-500 italic"
                >
                  Nenhum comentário
                </div>

                <div
                  v-else
                  class="space-y-2"
                >
                  <div
                    v-for="comment in segment.comments"
                    :key="comment.id"
                    class="comment-item"
                  >
                    <div class="bg-gray-50 rounded p-2">
                      <div class="flex justify-between items-start mb-1">
                        <span class="text-xs font-medium text-gray-600">
                          {{ comment.type.toUpperCase() }}
                          <span
                            v-if="comment.timestamp"
                            class="ml-1"
                          >
                            @ {{ formatTime(comment.timestamp) }}
                          </span>
                        </span>
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
                      <p class="text-sm text-gray-900">
                        {{ comment.text }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Comment Dialog -->
    <Dialog
      :visible="showCommentDialog"
      :modal="true"
      :closable="true"
      header="Adicionar Comentário"
      class="w-full max-w-md"
      @update:visible="showCommentDialog = $event"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Comentário
          </label>
          <Dropdown
            v-model="commentForm.type"
            :options="commentTypeOptions"
            option-label="label"
            option-value="value"
            placeholder="Selecionar tipo"
            class="w-full"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Comentário
          </label>
          <Textarea
            v-model="commentForm.text"
            rows="4"
            placeholder="Digite seu comentário..."
            class="w-full"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Tempo Específico (opcional)
          </label>
          <InputNumber
            v-model="commentForm.timestamp"
            placeholder="Tempo em segundos"
            class="w-full"
            :min="0"
            :max="selectedAsset?.duration || 0"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end space-x-2">
          <Button
            label="Cancelar"
            severity="secondary"
            @click="cancelComment"
          />
          <Button
            label="Salvar"
            @click="saveComment"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Button from 'primevue/button'
import Badge from 'primevue/badge'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import Textarea from 'primevue/textarea'
import InputNumber from 'primevue/inputnumber'
import { useToastStore } from '../../../app/stores'
import type { Asset, ComentarioType } from '../../../shared/types'

// Props
const props = defineProps<{
  selectedAsset: Asset | null
}>()

// Emits
const emit = defineEmits<{
  'segment-created': [segment: VideoSegment]
  'comment-added': [segmentId: string, comment: SegmentComment]
}>()

const toastStore = useToastStore()

// Types
interface VideoSegment {
  id: string
  startTime: number
  endTime: number
  comments: SegmentComment[]
}

interface SegmentComment {
  id: string
  text: string
  type: ComentarioType
  timestamp?: number
  createdAt: Date
}

// State
const isPlaying = ref(false)
const currentTime = ref(0)
const activeSegments = ref<VideoSegment[]>([])
const pendingSegment = ref<{ startTime: number | null; endTime: number | null }>({
  startTime: null,
  endTime: null
})

// Comment Dialog
const showCommentDialog = ref(false)
const activeSegmentId = ref<string | null>(null)
const editingComment = ref<SegmentComment | null>(null)
const commentForm = ref({
  text: '',
  type: 'note' as ComentarioType,
  timestamp: null as number | null
})

// Mock playback
let playbackInterval: any = null

// Computed
const progressPercentage = computed(() => {
  if (!props.selectedAsset?.duration) return 0
  return (currentTime.value / props.selectedAsset.duration) * 100
})

const totalSegmentsDuration = computed(() => {
  return activeSegments.value.reduce((total, segment) => 
    total + (segment.endTime - segment.startTime), 0
  )
})

const commentTypeOptions = [
  { label: 'Direção', value: 'direction' },
  { label: 'Nota', value: 'note' },
  { label: 'Roteiro', value: 'script' },
  { label: 'Técnico', value: 'technical' },
  { label: 'Feedback', value: 'feedback' }
]

// Watchers
watch(() => props.selectedAsset, (newAsset) => {
  if (newAsset) {
    resetPlayer()
  }
})

// Methods
const resetPlayer = () => {
  isPlaying.value = false
  currentTime.value = 0
  activeSegments.value = []
  pendingSegment.value = { startTime: null, endTime: null }
  playbackInterval = null
}

const togglePlay = () => {
  isPlaying.value = !isPlaying.value
  // Mock playback - em uma implementação real, controlaríamos o player de vídeo
}

const startPlayback = () => {
  // Mock - em implementação real, iniciaria o playback do vídeo
  isPlaying.value = true
}

const stopPlayback = () => {
  isPlaying.value = false
}

const previousSegment = () => {
  const currentSegmentIndex = activeSegments.value.findIndex(segment => 
    currentTime.value >= segment.startTime && currentTime.value <= segment.endTime
  )
  
  if (currentSegmentIndex > 0 && activeSegments.value[currentSegmentIndex - 1]) {
    currentTime.value = activeSegments.value[currentSegmentIndex - 1].startTime
  } else if (activeSegments.value.length > 0 && activeSegments.value[activeSegments.value.length - 1]) {
    currentTime.value = activeSegments.value[activeSegments.value.length - 1].startTime
  }
}

const nextSegment = () => {
  const currentSegmentIndex = activeSegments.value.findIndex(segment => 
    currentTime.value >= segment.startTime && currentTime.value <= segment.endTime
  )
  
  if (currentSegmentIndex >= 0 && currentSegmentIndex < activeSegments.value.length - 1 && activeSegments.value[currentSegmentIndex + 1]) {
    currentTime.value = activeSegments.value[currentSegmentIndex + 1].startTime
  } else if (activeSegments.value.length > 0 && activeSegments.value[0]) {
    currentTime.value = activeSegments.value[0].startTime
  }
}

const markSegmentStart = () => {
  pendingSegment.value.startTime = currentTime.value
  
  toastStore.info('Início Marcado', `Início do trecho marcado em ${formatTime(currentTime.value)}`)
}

const markSegmentEnd = () => {
  if (!pendingSegment.value.startTime) {
    toastStore.error('Erro', 'Marque o início do trecho primeiro')
    return
  }
  
  if (currentTime.value <= pendingSegment.value.startTime) {
    toastStore.error('Erro', 'O fim deve ser posterior ao início')
    return
  }
  
  const newSegment: VideoSegment = {
    id: Date.now().toString(),
    startTime: pendingSegment.value.startTime,
    endTime: currentTime.value,
    comments: []
  }
  
  activeSegments.value.push(newSegment)
  activeSegments.value.sort((a, b) => a.startTime - b.startTime)
  
  emit('segment-created', newSegment)
  
  toastStore.success('Trecho Criado', 
    `Trecho de ${formatDuration(newSegment.endTime - newSegment.startTime)} criado`)
  
  // Reset pending segment
  pendingSegment.value = { startTime: null, endTime: null }
}

const playSegment = (segment: VideoSegment) => {
  currentTime.value = segment.startTime
  togglePlay()
}

const editSegment = (segment: VideoSegment) => {
  // Mock edit functionality
  toastStore.info('Edição', `Editando trecho de ${formatTime(segment.startTime)} a ${formatTime(segment.endTime)}`)
}

const removeSegment = (segmentId: string) => {
  const index = activeSegments.value.findIndex(s => s.id === segmentId)
  if (index >= 0) {
    activeSegments.value.splice(index, 1)
    toastStore.info('Trecho Removido', 'Trecho removido com sucesso')
  }
}

const addComment = (segmentId: string) => {
  activeSegmentId.value = segmentId
  editingComment.value = null
  commentForm.value = {
    text: '',
    type: 'note',
    timestamp: null
  }
  showCommentDialog.value = true
}

const editComment = (comment: SegmentComment) => {
  editingComment.value = comment
  commentForm.value = {
    text: comment.text,
    type: comment.type,
    timestamp: comment.timestamp || null
  }
  showCommentDialog.value = true
}

const deleteComment = (commentId: string) => {
  activeSegments.value.forEach(segment => {
    const commentIndex = segment.comments.findIndex(c => c.id === commentId)
    if (commentIndex >= 0) {
      segment.comments.splice(commentIndex, 1)
      toastStore.info('Comentário Removido', 'Comentário removido com sucesso')
    }
  })
}

const saveComment = () => {
  if (!commentForm.value.text.trim()) {
    toastStore.error('Erro', 'Digite um comentário')
    return
  }
  
  if (editingComment.value) {
    // Update existing comment
    editingComment.value.text = commentForm.value.text
    editingComment.value.type = commentForm.value.type
    editingComment.value.timestamp = commentForm.value.timestamp || undefined
    
    toastStore.success('Comentário Atualizado', 'Comentário atualizado com sucesso')
  } else {
    // Add new comment
    const newComment: SegmentComment = {
      id: Date.now().toString(),
      text: commentForm.value.text,
      type: commentForm.value.type,
      timestamp: commentForm.value.timestamp || undefined,
      createdAt: new Date()
    }
    
    const segment = activeSegments.value.find(s => s.id === activeSegmentId.value)
    if (segment) {
      segment.comments.push(newComment)
      emit('comment-added', segment.id, newComment)
      toastStore.success('Comentário Adicionado', 'Comentário adicionado com sucesso')
    }
  }
  
  cancelComment()
}

const cancelComment = () => {
  showCommentDialog.value = false
  activeSegmentId.value = null
  editingComment.value = null
  commentForm.value = {
    text: '',
    type: 'note',
    timestamp: null
  }
}

// Utility functions
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSecs = Math.floor(seconds % 60)
  return `${minutes}m ${remainingSecs}s`
}
</script>

<style scoped>
.segment-card {
  transition: all 0.2s ease;
}

.segment-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.comment-item {
  transition: all 0.2s ease;
}

.comment-item:hover {
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

