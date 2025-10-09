<template>
  <div class="upload-component">
    <!-- Drop Zone -->
    <div
      ref="dropZone"
      class="drop-zone border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200"
      :class="{
        'border-blue-400 bg-blue-50': isDragOver,
        'border-gray-300': !isDragOver,
        'cursor-not-allowed opacity-50': uploading
      }"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      @click="!uploading && $refs.fileInput?.click()"
    >
      <div class="flex flex-col items-center space-y-4">
        <!-- Icon -->
        <div class="text-6xl">
          <i
            v-if="uploading"
            class="pi pi-spin pi-spinner text-blue-500"
          />
          <i
            v-else-if="isDragOver"
            class="pi pi-cloud-upload text-blue-500"
          />
          <i
            v-else
            class="pi pi-upload text-gray-400"
          />
        </div>

        <!-- Text -->
        <div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            {{ uploading ? 'Fazendo upload...' : isDragOver ? 'Solte os arquivos aqui' : 'Arraste arquivos ou clique para selecionar' }}
          </h3>
          <p class="text-sm text-gray-500">
            Suporte para vídeos, áudios, imagens e documentos
          </p>
          <p class="text-xs text-gray-400 mt-2">
            Máximo {{ maxFileSize }}MB por arquivo
          </p>
        </div>

        <!-- Upload Button -->
        <Button
          v-if="!uploading && !isDragOver"
          label="Selecionar Arquivos"
          icon="pi pi-plus"
          @click.stop="$refs.fileInput?.click()"
        />
      </div>

      <!-- Hidden File Input -->
      <input
        ref="fileInput"
        type="file"
        multiple
        class="hidden"
        :accept="acceptedTypes"
        @change="handleFileSelect"
      >
    </div>

    <!-- Upload Progress List -->
    <div
      v-if="assetStore.uploads.length > 0"
      class="mt-6 space-y-3"
    >
      <div class="flex items-center justify-between">
        <h4 class="text-sm font-medium text-gray-900">
          Uploads em Andamento ({{ activeUploads }})
        </h4>
        <Button
          v-if="completedUploads > 0"
          label="Limpar Concluídos"
          icon="pi pi-trash"
          text
          size="small"
          @click="assetStore.clearCompletedUploads()"
        />
      </div>

      <div class="space-y-2">
        <div
          v-for="upload in assetStore.uploads"
          :key="upload.id"
          class="bg-white rounded-lg p-4 border border-gray-200"
        >
          <!-- Upload Header -->
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center space-x-3">
              <i
                class="text-lg"
                :class="getFileIcon(upload.filename)"
              />
              <div>
                <p class="text-sm font-medium text-gray-900">
                  {{ upload.filename }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ formatBytes(upload.size) }}
                </p>
              </div>
            </div>

            <!-- Upload Actions -->
            <div class="flex items-center space-x-2">
              <Badge
                :value="getUploadStatusLabel(upload.status)"
                :severity="getUploadStatusSeverity(upload.status)"
              />
              <Button
                v-if="upload.status === 'completed' || upload.status === 'error'"
                icon="pi pi-times"
                text
                size="small"
                @click="assetStore.removeUpload(upload.id)"
              />
            </div>
          </div>

          <!-- Progress Bar -->
          <div
            v-if="upload.status === 'uploading' || upload.status === 'processing'"
            class="mb-2"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs text-gray-500">
                {{ upload.progress }}%
              </span>
              <span
                v-if="upload.status === 'uploading'"
                class="text-xs text-gray-500"
              >
                {{ formatBytes(upload.speed) }}/s • {{ formatTime(upload.timeRemaining) }} restante
              </span>
            </div>
            <ProgressBar
              :value="upload.progress"
              class="h-2"
            />
          </div>

          <!-- Error Message -->
          <div
            v-if="upload.status === 'error' && upload.error"
            class="mt-2 p-2 bg-red-50 rounded text-sm text-red-600"
          >
            {{ upload.error }}
          </div>

          <!-- Success Message -->
          <div
            v-if="upload.status === 'completed'"
            class="mt-2 flex items-center text-sm text-green-600"
          >
            <i class="pi pi-check-circle mr-2" />
            Upload concluído - Asset criado em staging
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import Button from 'primevue/button'
import Badge from 'primevue/badge'
import ProgressBar from 'primevue/progressbar'
import { useAssetStore, useToastStore } from '../../../app/stores'

const assetStore = useAssetStore()
const toastStore = useToastStore()

const dropZone = ref<any>(null)
const fileInput = ref<any>(null)
const isDragOver = ref(false)
const uploading = ref(false)

const maxFileSize = 500 // MB
const acceptedTypes = 'video/*,audio/*,image/*,.pdf,.doc,.docx,.txt'

const activeUploads = computed(() => 
  assetStore.uploads.filter(u => u.status === 'uploading' || u.status === 'processing').length
)

const completedUploads = computed(() => 
  assetStore.uploads.filter(u => u.status === 'completed').length
)

const handleDragOver = (event: any) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (event: any) => {
  event.preventDefault()
  // Only set to false if leaving the drop zone itself
  if (!dropZone.value?.contains(event.relatedTarget)) {
    isDragOver.value = false
  }
}

const handleDrop = (event: any) => {
  event.preventDefault()
  isDragOver.value = false
  
  const files = Array.from(event.dataTransfer?.files || [])
  processFiles(files)
}

const handleFileSelect = (event: any) => {
  const target = event.target
  const files = Array.from(target.files || [])
  processFiles(files)
  
  // Reset input
  target.value = ''
}

const processFiles = async (files: any[]) => {
  if (files.length === 0) return

  // Validate files
  const validFiles = files.filter(file => validateFile(file))
  
  if (validFiles.length === 0) {
    toastStore.error('Erro', 'Nenhum arquivo válido selecionado')
    return
  }

  if (validFiles.length !== files.length) {
    toastStore.warning('Atenção', `${files.length - validFiles.length} arquivo(s) foram ignorados por não atenderem aos critérios`)
  }

  uploading.value = true
  try {
    await assetStore.startUpload(validFiles)
    toastStore.success('Sucesso', `${validFiles.length} arquivo(s) iniciado(s)`)
  } catch {
    toastStore.error('Erro', 'Erro ao iniciar upload')
  } finally {
    uploading.value = false
  }
}

const validateFile = (file: any): boolean => {
  // Check file size
  const maxBytes = maxFileSize * 1024 * 1024
  if (file.size > maxBytes) {
    toastStore.error('Arquivo muito grande', `"${file.name}" excede ${maxFileSize}MB`)
    return false
  }

  // Check file type
  const allowedTypes = [
    // Video
    'video/mp4', 'video/avi', 'video/mov', 'video/mkv', 'video/webm',
    // Audio
    'audio/mp3', 'audio/wav', 'audio/aac', 'audio/flac', 'audio/ogg', 'audio/mpeg',
    // Image
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    // Document
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'
  ]

  if (!allowedTypes.includes(file.type)) {
    toastStore.error('Tipo não suportado', `"${file.name}" tem tipo não suportado`)
    return false
  }

  return true
}

const getFileIcon = (filename: string): string => {
  const ext = filename.toLowerCase().split('.').pop()
  
  if (['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(ext || '')) {
    return 'pi pi-video text-purple-500'
  }
  if (['mp3', 'wav', 'aac', 'flac', 'ogg'].includes(ext || '')) {
    return 'pi pi-volume-up text-blue-500'
  }
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
    return 'pi pi-image text-green-500'
  }
  return 'pi pi-file text-gray-500'
}

const getUploadStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    uploading: 'Enviando',
    processing: 'Processando',
    completed: 'Concluído',
    error: 'Erro',
    paused: 'Pausado'
  }
  return labels[status] || status
}

const getUploadStatusSeverity = (status: string): string => {
  const severities: Record<string, string> = {
    uploading: 'info',
    processing: 'warning',
    completed: 'success',
    error: 'danger',
    paused: 'secondary'
  }
  return severities[status] || 'secondary'
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${Math.round(seconds)}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  return `${minutes}m ${remainingSeconds}s`
}

// Cleanup on unmount
onUnmounted(() => {
  isDragOver.value = false
})
</script>

<style scoped>
.drop-zone {
  min-height: 200px;
  cursor: pointer;
}

.drop-zone:hover:not(.cursor-not-allowed) {
  border-color: rgb(59 130 246);
  background-color: rgb(239 246 255);
}


</style>

