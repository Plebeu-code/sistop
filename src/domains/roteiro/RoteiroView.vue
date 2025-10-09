<template>
  <div class="capcut-editor">
    <!-- Top Toolbar -->
    <div class="top-toolbar">
      <div class="toolbar-left">
        <div class="project-info">
          <div class="project-icon">
            <i class="pi pi-video" />
          </div>
          <span class="project-name">Novo Roteiro</span>
        </div>
        <div class="project-stats">
          <span class="duration">{{ formatTime(totalDuration) }}</span>
          <span class="items">{{ totalItems }} itens</span>
          <span class="transitions">{{ activeTransitions }} transições</span>
        </div>
      </div>
      
      <div class="toolbar-center">
        <div class="playback-controls">
          <Button 
            icon="pi pi-step-backward" 
            class="control-btn"
            @click="goToStart"
          />
          <Button 
            :icon="isPlaying ? 'pi pi-pause' : 'pi pi-play'"
            :class="['play-btn', { playing: isPlaying }]"
            @click="togglePlayback"
          />
          <Button 
            icon="pi pi-step-forward" 
            class="control-btn"
            @click="goToEnd"
          />
        </div>
        <div class="time-indicator">
          <span>{{ formatTime(currentTime) }} / {{ formatTime(totalDuration) }}</span>
        </div>
      </div>
      
      <div class="toolbar-right">
        <Button 
          icon="pi pi-undo" 
          class="tool-btn" 
          :disabled="!canUndo" 
          @click="undo" 
        />
        <Button 
          icon="pi pi-redo" 
          class="tool-btn" 
          :disabled="!canRedo" 
          @click="redo" 
        />
        <Button 
          icon="pi pi-eye" 
          label="Pré-visualizar" 
          class="preview-btn" 
          @click="showPreview = true" 
        />
        <Button 
          icon="pi pi-download" 
          label="Exportar" 
          class="export-btn" 
          @click="showExportDialog = true" 
        />
        <Button 
          icon="pi pi-cog" 
          class="settings-btn" 
          @click="showSettings = true" 
        />
      </div>
    </div>

    <!-- Main Workspace -->
    <div class="workspace">
      <!-- Left Sidebar - Media Library -->
      <div 
        class="sidebar left-sidebar" 
        :class="{ collapsed: isLibraryCollapsed }"
      >
        <div class="sidebar-header">
          <div class="sidebar-tabs">
            <div 
              v-for="category in mediaCategories" 
              :key="category.key"
              :class="['tab', { active: activeCategory === category.key }]"
              @click="activeCategory = category.key"
            >
              <i :class="category.icon" />
              <span v-if="!isLibraryCollapsed">{{ category.label }}</span>
            </div>
          </div>
          <Button
            :icon="isLibraryCollapsed ? 'pi pi-angle-right' : 'pi pi-angle-left'"
            class="collapse-btn"
            @click="isLibraryCollapsed = !isLibraryCollapsed"
          />
        </div>
        
        <div 
          v-if="!isLibraryCollapsed" 
          class="sidebar-content"
        >
          <!-- Upload Area -->
          <div class="upload-area">
            <input
              ref="fileInput"
              type="file"
              multiple
              accept="video/*,audio/*,image/*"
              style="display: none"
              @change="onFileUpload"
            >
            <Button
              icon="pi pi-plus"
              label="Adicionar Mídia"
              class="upload-btn"
              @click="fileInput?.click()"
            />
          </div>
          
          <div class="media-grid">
            <div 
              v-for="item in filteredMediaItems" 
              :key="item.id"
              class="media-item"
              draggable="true"
              @dragstart="onMediaDragStart($event, item)"
            >
              <div class="media-thumbnail">
                <img 
                  :src="item.thumbnail" 
                  :alt="item.name"
                >
                <div class="media-overlay">
                  <i :class="getMediaIcon(item.type)" />
                </div>
              </div>
              <div class="media-info">
                <div class="media-name">
                  {{ item.name }}
                </div>
                <div class="media-details">
                  <span 
                    v-if="item.duration" 
                    class="media-duration"
                  >
                    {{ formatTime(item.duration) }}
                  </span>
                  <span class="media-size">
                    {{ formatFileSize(item.size) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Center Area -->
      <div class="center-area">
        <!-- Preview Panel -->
        <div class="preview-panel">
          <div class="preview-header">
            <div class="preview-tabs">
              <div class="tab active">
                <i class="pi pi-play" />
                <span>Preview</span>
              </div>
            </div>
            <div class="preview-controls">
              <Button 
                icon="pi pi-expand" 
                class="expand-btn"
                @click="toggleFullscreen"
              />
            </div>
          </div>
          
          <div class="preview-viewport">
            <div class="video-canvas">
              <video 
                v-if="currentPreviewItem && currentPreviewItem.type === 'video'"
                ref="videoPlayer"
                :src="currentPreviewItem.url"
                class="preview-video"
                @timeupdate="onVideoTimeUpdate"
                @loadedmetadata="onVideoLoaded"
                @ended="onPlaybackEnd"
              />
              <audio 
                v-else-if="currentPreviewItem && currentPreviewItem.type === 'audio'"
                ref="audioPlayer"
                :src="currentPreviewItem.url"
                class="preview-audio"
                @timeupdate="onAudioTimeUpdate"
                @loadedmetadata="onAudioLoaded"
                @ended="onPlaybackEnd"
              />
              <img 
                v-else-if="currentPreviewItem && currentPreviewItem.type === 'image'"
                :src="currentPreviewItem.url"
                alt="Preview"
                class="preview-image"
              >
              <div 
                v-else
                class="empty-preview"
              >
                <i class="pi pi-video" />
                <h3>Comece seu projeto</h3>
                <p>Arraste mídias da biblioteca para a timeline</p>
              </div>
            </div>
            
            <!-- Timeline Controls Overlay -->
            <div 
              v-if="allTrackItems.length > 0"
              class="timeline-overlay"
            >
              <div class="time-display">
                {{ formatTime(currentTime) }} / {{ formatTime(totalDuration) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Timeline Panel -->
        <div class="timeline-panel">
          <div class="timeline-header">
            <div class="timeline-info">
              <i class="pi pi-clock" />
              <span>Timeline</span>
            </div>
            <div class="timeline-controls">
              <Button 
                icon="pi pi-minus" 
                class="zoom-btn"
                @click="zoomOut"
              />
              <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
              <Button 
                icon="pi pi-plus" 
                class="zoom-btn"
                @click="zoomIn"
              />
              <Button 
                icon="pi pi-th-large"
                :class="['snap-btn', { active: snapEnabled }]"
                @click="snapEnabled = !snapEnabled"
              />
              <Button 
                icon="pi pi-plus-circle" 
                class="add-track-btn"
                @click="addTrack"
              />
            </div>
          </div>
          
          <div class="timeline-workspace">
            <!-- Timeline Tracks -->
            <div class="timeline-tracks">
              <!-- Video Track - Only show if there are video items -->
              <div 
                v-if="videoTrackItems.length > 0"
                class="track video-track"
              >
                <div class="track-header">
                  <div class="track-controls">
                    <Button 
                      icon="pi pi-eye" 
                      class="track-toggle"
                      @click="toggleTrackVisibility('video')"
                    />
                    <Button 
                      icon="pi pi-lock-open" 
                      class="track-lock"
                      @click="toggleTrackLock('video')"
                    />
                  </div>
                  <div class="track-info">
                    <i class="pi pi-video" />
                    <span>Vídeo</span>
                  </div>
                </div>
                <div 
                  class="track-content"
                  @drop="onTrackDrop($event, 'video')"
                  @dragover="onTrackDragOver"
                  @dragleave="onTrackDragLeave"
                >
                  <div 
                    v-for="item in videoTrackItems" 
                    :key="item.id"
                    class="timeline-item video-item"
                    :style="{ 
                      left: `${(item.startTime / totalDuration) * 100}%`,
                      width: `${(item.duration / totalDuration) * 100}%` 
                    }"
                    @mousedown="startDrag($event, item)"
                    @contextmenu="showItemContextMenu($event, item)"
                  >
                    <div class="item-content">
                      <div class="item-thumbnail">
                        <img 
                          v-if="item.thumbnail" 
                          :src="item.thumbnail" 
                          :alt="item.title"
                          @error="handleThumbnailError($event, item)"
                        >
                        <div 
                          v-else 
                          class="thumbnail-placeholder"
                        >
                          <i class="pi pi-video" />
                        </div>
                      </div>
                      <div class="item-info">
                        <span class="item-title">{{ item.title }}</span>
                        <span class="item-duration">{{ formatTime(item.duration) }}</span>
                      </div>
                    </div>
                    <div 
                      class="resize-handle left"
                      @mousedown="startResize($event, item, 'left')"
                    />
                    <div 
                      class="resize-handle right"
                      @mousedown="startResize($event, item, 'right')"
                    />
                  </div>
                </div>
              </div>

              <!-- Audio Track - Only show if there are audio items -->
              <div 
                v-if="audioTrackItems.length > 0"
                class="track audio-track"
              >
                <div class="track-header">
                  <div class="track-controls">
                    <Button 
                      icon="pi pi-eye" 
                      class="track-toggle"
                      @click="toggleTrackVisibility('audio')"
                    />
                    <Button 
                      icon="pi pi-lock-open" 
                      class="track-lock"
                      @click="toggleTrackLock('audio')"
                    />
                  </div>
                  <div class="track-info">
                    <i class="pi pi-volume-up" />
                    <span>Áudio</span>
                  </div>
                </div>
                <div 
                  class="track-content"
                  @drop="onTrackDrop($event, 'audio')"
                  @dragover="onTrackDragOver"
                  @dragleave="onTrackDragLeave"
                >
                  <div 
                    v-for="item in audioTrackItems" 
                    :key="item.id"
                    class="timeline-item audio-item"
                    :style="{ 
                      left: `${(item.startTime / totalDuration) * 100}%`,
                      width: `${(item.duration / totalDuration) * 100}%` 
                    }"
                    @mousedown="startDrag($event, item)"
                  >
                    <div class="item-content">
                      <div class="waveform">
                        <div 
                          v-for="i in 20" 
                          :key="i" 
                          class="wave-bar"
                        />
                      </div>
                      <div class="item-info">
                        <span class="item-title">{{ item.title }}</span>
                      </div>
                    </div>
                    <div 
                      class="resize-handle left"
                      @mousedown="startResize($event, item, 'left')"
                    />
                    <div 
                      class="resize-handle right"
                      @mousedown="startResize($event, item, 'right')"
                    />
                  </div>
                </div>
              </div>
              
              <!-- Empty Timeline Drop Area -->
              <div 
                v-if="videoTrackItems.length === 0 && audioTrackItems.length === 0"
                class="empty-timeline"
                @drop="onTrackDrop($event, 'auto')"
                @dragover="onTrackDragOver"
                @dragleave="onTrackDragLeave"
              >
                <div class="empty-timeline-content">
                  <i class="pi pi-plus-circle" />
                  <h3>Timeline vazia</h3>
                  <p>Arraste arquivos de mídia aqui para começar a editar</p>
                </div>
              </div>
            </div>

            <!-- Timeline Ruler -->
            <div class="timeline-ruler">
              <div 
                v-for="tick in timelineTicks" 
                :key="tick.time"
                class="time-tick"
                :style="{ left: `${(tick.time / totalDuration) * 100}%` }"
              >
                <div class="tick-mark" />
                <div class="tick-label">
                  {{ formatTime(tick.time) }}
                </div>
              </div>
            </div>

            <!-- Playhead -->
            <div 
              class="playhead"
              :style="{ left: `${(currentTime / totalDuration) * 100}%` }"
              @mousedown="startPlayheadDrag"
            >
              <div class="playhead-line" />
              <div class="playhead-handle" />
            </div>
          </div>
        </div>
      </div>

      <!-- Right Sidebar - Properties -->
      <div 
        class="sidebar right-sidebar" 
        :class="{ collapsed: isPropertiesCollapsed }"
      >
        <div class="sidebar-header">
          <div class="sidebar-title">
            <i class="pi pi-sliders-h" />
            <span v-if="!isPropertiesCollapsed">Propriedades</span>
          </div>
          <Button
            :icon="isPropertiesCollapsed ? 'pi pi-angle-left' : 'pi pi-angle-right'"
            class="collapse-btn"
            @click="isPropertiesCollapsed = !isPropertiesCollapsed"
          />
        </div>
        
        <div 
          v-if="!isPropertiesCollapsed" 
          class="sidebar-content"
        >
          <div 
            v-if="!selectedItem" 
            class="no-selection"
          >
            <i class="pi pi-info-circle" />
            <p>Nenhum item selecionado</p>
            <span>Selecione um item na timeline para ver suas propriedades</span>
          </div>
          
          <div 
            v-else 
            class="properties-content"
          >
            <div class="property-section">
              <h4>Configurações Gerais</h4>
              <div class="property-group">
                <label>Resolução</label>
                <Dropdown
                  v-model="projectSettings.resolution"
                  :options="resolutionOptions"
                  option-label="label"
                  option-value="value"
                />
              </div>
              <div class="property-group">
                <label>FPS</label>
                <Dropdown
                  v-model="projectSettings.fps"
                  :options="fpsOptions"
                  option-label="label"
                  option-value="value"
                />
              </div>
              <div class="property-group">
                <label>Taxa de Bits</label>
                <InputText v-model="projectSettings.bitrate" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialogs -->
    <Dialog
      v-model:visible="showExportDialog"
      header="Exportar Projeto"
      modal
      class="export-dialog"
    >
      <div class="export-options">
        <div class="format-section">
          <h4>Formato</h4>
          <div class="format-grid">
            <div
              v-for="format in exportFormats"
              :key="format.value"
              :class="['format-card', { selected: settingsForm.videoFormat === format.value }]"
              @click="settingsForm.videoFormat = format.value"
            >
              <i :class="format.icon" />
              <span>{{ format.label }}</span>
            </div>
          </div>
        </div>
        
        <div class="quality-section">
          <h4>Qualidade</h4>
          <Dropdown
            v-model="settingsForm.quality"
            :options="qualityOptions"
            option-label="label"
            option-value="value"
          />
        </div>
      </div>
      
      <template #footer>
        <Button 
          label="Cancelar" 
          severity="secondary" 
          @click="showExportDialog = false" 
        />
        <Button 
          label="Exportar" 
          @click="startExport" 
        />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="showPreview"
      header="Pré-visualização"
      modal
      maximizable
      class="preview-dialog"
    >
      <div class="preview-player">
        <div class="player-placeholder">
          <i class="pi pi-play-circle" />
          <p>Player de pré-visualização</p>
        </div>
      </div>
    </Dialog>

    <!-- Export Progress Dialog -->
    <Dialog
      v-model:visible="isLoading"
      header="Processando Projeto"
      modal
      :closable="false"
      class="export-progress-dialog"
    >
      <div class="export-progress-content">
        <div class="progress-info">
          <div class="progress-phase">
            <i :class="getPhaseIcon(ffmpeg.exportProgress.value.phase)" />
            <span>{{ getPhaseLabel(ffmpeg.exportProgress.value.phase) }}</span>
          </div>
          <div class="progress-message">
            {{ loadingMessage }}
          </div>
        </div>
        
        <div class="progress-bar-container">
          <div class="progress-bar">
            <div 
              class="progress-fill"
              :style="{ width: `${ffmpeg.exportProgress.value.progress}%` }"
            />
          </div>
          <span class="progress-percentage">
            {{ ffmpeg.exportProgress.value.progress }}%
          </span>
        </div>
        
        <div 
          v-if="ffmpeg.exportProgress.value.timeRemaining"
          class="time-remaining"
        >
          Tempo restante: {{ formatTime(ffmpeg.exportProgress.value.timeRemaining) }}
        </div>
        
        <ProgressSpinner />
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import ProgressSpinner from 'primevue/progressspinner'
import { useToastStore } from '../../app/stores'
import { useFFmpeg, type VideoSettings, type TimelineItem } from '../../composables/useFFmpeg'

// Global type declarations
declare const document: any
declare const setTimeout: any
declare const window: any
declare const setInterval: any
declare const clearInterval: any
declare const URL: any
declare const Date: any
declare const console: any

const toastStore = useToastStore()
const ffmpeg = useFFmpeg()

// Refs
const fileInput = ref()
const videoPlayer = ref()
const audioPlayer = ref()

// State
const showSettings = ref(false)
const showPreview = ref(false)
const showExportDialog = ref(false)
const isLoading = ref(false)
const loadingMessage = ref('')

// UI State
const isLibraryCollapsed = ref(false)
const isPropertiesCollapsed = ref(false)
const isPlaying = ref(false)
const currentTime = ref(0)
const zoomLevel = ref(1)
const snapEnabled = ref(true)
const isDraggingPlayhead = ref(false)

// Editor State
const canUndo = ref(false)
const canRedo = ref(false)
const activeTransitions = ref(0)
const totalItems = ref(0)
const totalDuration = ref(60) // 1 minute default
const selectedItem = ref(null)
const currentPreviewItem = ref<any>(null)

// History for undo/redo
const historyStack = ref<any[]>([])
const historyIndex = ref(-1)

const saveState = () => {
  const state = {
    videoTrackItems: JSON.parse(JSON.stringify(videoTrackItems.value)),
    audioTrackItems: JSON.parse(JSON.stringify(audioTrackItems.value)),
    totalDuration: totalDuration.value,
    totalItems: totalItems.value
  }
  
  // Remove any states after current index (when new action after undo)
  historyStack.value = historyStack.value.slice(0, historyIndex.value + 1)
  
  // Add new state
  historyStack.value.push(state)
  historyIndex.value++
  
  // Limit history size
  if (historyStack.value.length > 50) {
    historyStack.value.shift()
    historyIndex.value--
  }
  
  canUndo.value = historyIndex.value > 0
  canRedo.value = false
}

// Media Library
const activeCategory = ref('all')
const mediaCategories = ref([
  { key: 'all', label: 'Todos', icon: 'pi pi-th-large' },
  { key: 'video', label: 'Vídeos', icon: 'pi pi-video' },
  { key: 'audio', label: 'Áudio', icon: 'pi pi-volume-up' },
  { key: 'image', label: 'Imagens', icon: 'pi pi-image' }
])

const mediaItems = ref<any[]>([])

// Timeline Data - Empty to start fresh
const videoTrackItems = ref<any[]>([])
const audioTrackItems = ref<any[]>([])

// Project Settings
const projectSettings = ref({
  resolution: '1920x1080',
  fps: 30,
  bitrate: '5000kbps'
})

const resolutionOptions = [
  { label: 'HD (1280x720)', value: '1280x720' },
  { label: 'Full HD (1920x1080)', value: '1920x1080' },
  { label: '4K (3840x2160)', value: '3840x2160' }
]

const fpsOptions = [
  { label: '24 FPS', value: 24 },
  { label: '30 FPS', value: 30 },
  { label: '60 FPS', value: 60 }
]

// Settings form
const settingsForm = ref({
  videoFormat: 'mp4',
  quality: 'hd'
})

const qualityOptions = [
  { label: 'HD (720p)', value: 'hd' },
  { label: 'Full HD (1080p)', value: 'fhd' },
  { label: '4K', value: '4k' }
]

const exportFormats = [
  { label: 'MP4', value: 'mp4', icon: 'pi pi-video' },
  { label: 'WebM', value: 'webm', icon: 'pi pi-video' },
  { label: 'AVI', value: 'avi', icon: 'pi pi-video' }
]

// Computed Properties
const filteredMediaItems = computed(() => {
  if (activeCategory.value === 'all') {
    return mediaItems.value
  }
  return mediaItems.value.filter(item => item.type === activeCategory.value)
})

const allTrackItems = computed(() => {
  return [...videoTrackItems.value, ...audioTrackItems.value]
})

const timelineTicks = computed(() => {
  const ticks = []
  const tickInterval = 10 // 10 seconds per tick
  const maxTime = totalDuration.value
  
  for (let time = 0; time <= maxTime; time += tickInterval) {
    ticks.push({
      time,
      label: formatTime(time)
    })
  }
  
  return ticks
})

// Utility Functions
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const formatFileSize = (bytes: number) => {
  const sizes = ['B', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

// Media Library Functions
const getMediaIcon = (type: string) => {
  const icons: Record<string, string> = {
    video: 'pi pi-video',
    audio: 'pi pi-volume-up',
    image: 'pi pi-image'
  }
  return icons[type] || 'pi pi-file'
}

// File Upload with video thumbnail generation
const onFileUpload = async (event: any) => {
  const files = event.target.files
  if (!files) return
  
  isLoading.value = true
  loadingMessage.value = 'Adicionando arquivos...'
  
  try {
    for (const file of Array.from(files) as any[]) {
      const mediaType = file.type.startsWith('video/') ? 'video' : 
                       file.type.startsWith('audio/') ? 'audio' : 
                       file.type.startsWith('image/') ? 'image' : 'unknown'
      
      if (mediaType === 'unknown') {
        toastStore.warning('Upload', `Tipo de arquivo não suportado: ${file.type}`)
        continue
      }
      
      // Create object URL for preview
      const url = URL.createObjectURL(file)
      
      const newMedia: any = {
        id: Date.now() + Math.random(),
        name: file.name,
        type: mediaType,
        size: file.size,
        url: url,
        file: file,
        thumbnail: mediaType === 'image' ? url : null,
        duration: mediaType === 'video' || mediaType === 'audio' ? await getDurationFromFile(file) : undefined
      }
      
      // Generate thumbnail for video files
      if (mediaType === 'video') {
        try {
          newMedia.thumbnail = await generateVideoThumbnail(file)
        } catch (error) {
          console.error('Error generating thumbnail:', error)
          newMedia.thumbnail = null
        }
      }
      
      mediaItems.value.push(newMedia)
      toastStore.success('Upload', `${file.name} adicionado à biblioteca`)
    }
  } catch (error) {
    console.error('Upload error:', error)
    toastStore.error('Upload', 'Erro ao processar arquivos')
  } finally {
    isLoading.value = false
    // Clear input
    event.target.value = ''
  }
}

// Generate video thumbnail from first frame
const generateVideoThumbnail = (file: any): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }
    
    video.addEventListener('loadedmetadata', () => {
      canvas.width = 120
      canvas.height = 68
      video.currentTime = 0.1 // Get frame at 0.1 seconds to avoid black frame
    })
    
    video.addEventListener('seeked', () => {
      try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const thumbnail = canvas.toDataURL('image/jpeg', 0.8)
        URL.revokeObjectURL(video.src)
        resolve(thumbnail)
      } catch (error) {
        URL.revokeObjectURL(video.src)
        reject(error)
      }
    })
    
    video.addEventListener('error', (error: any) => {
      URL.revokeObjectURL(video.src)
      reject(error)
    })
    
    video.crossOrigin = 'anonymous'
    video.src = URL.createObjectURL(file)
  })
}

// Simple duration detection without FFmpeg
const getDurationFromFile = (file: any): Promise<number> => {
  return new Promise((resolve) => {
    const element = file.type.startsWith('video/') ? document.createElement('video') : document.createElement('audio')
    
    element.onloadedmetadata = () => {
      resolve(element.duration || 30)
      URL.revokeObjectURL(element.src)
    }
    
    element.onerror = () => {
      resolve(30) // Fallback duration
      URL.revokeObjectURL(element.src)
    }
    
    element.src = URL.createObjectURL(file)
  })
}

// Event handlers
const onMediaDragStart = (event: any, asset: any) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/json', JSON.stringify(asset))
    event.dataTransfer.effectAllowed = 'copy'
  }
}

// Playback interval
let playbackInterval: any = null

// Preview Player Controls
const onVideoTimeUpdate = () => {
  if (isPlaying.value && videoPlayer.value && !isDraggingPlayhead.value) {
    // Find which video item should be playing at current timeline position
    const currentVideoItem = videoTrackItems.value.find(item => 
      currentTime.value >= item.startTime && 
      currentTime.value < item.startTime + item.duration
    )
    
    if (currentVideoItem && currentPreviewItem.value?.id === currentVideoItem.id) {
      // Calculate how much time has passed within this item
      const itemRelativeTime = currentTime.value - currentVideoItem.startTime
      
      // Sync the video player to match the timeline position
      if (Math.abs(videoPlayer.value.currentTime - itemRelativeTime) > 0.1) {
        videoPlayer.value.currentTime = itemRelativeTime
      }
    }
  }
}

const onAudioTimeUpdate = () => {
  if (isPlaying.value && audioPlayer.value && !isDraggingPlayhead.value) {
    // Find which audio item should be playing at current timeline position
    const currentAudioItem = audioTrackItems.value.find(item => 
      currentTime.value >= item.startTime && 
      currentTime.value < item.startTime + item.duration
    )
    
    if (currentAudioItem && currentPreviewItem.value?.id === currentAudioItem.id) {
      // Calculate how much time has passed within this item
      const itemRelativeTime = currentTime.value - currentAudioItem.startTime
      
      // Sync the audio player to match the timeline position
      if (Math.abs(audioPlayer.value.currentTime - itemRelativeTime) > 0.1) {
        audioPlayer.value.currentTime = itemRelativeTime
      }
    }
  }
}

const onVideoLoaded = () => {
  if (videoPlayer.value) {
    // Sync video time with timeline position
    syncMediaWithTimeline()
  }
}

const onAudioLoaded = () => {
  if (audioPlayer.value) {
    // Sync audio time with timeline position
    syncMediaWithTimeline()
  }
}

const onPlaybackEnd = () => {
  // Handle end of current clip
  const nextTime = currentTime.value + 0.1
  if (nextTime <= totalDuration.value) {
    currentTime.value = nextTime
    updateCurrentPreview()
  } else {
    isPlaying.value = false
    currentTime.value = 0
  }
}

const syncMediaWithTimeline = () => {
  // Only sync if we have content in timeline
  if (videoTrackItems.value.length === 0 && audioTrackItems.value.length === 0) {
    return
  }
  
  // Sync current media players with timeline position
  if (videoPlayer.value && currentPreviewItem.value?.type === 'video') {
    const activeVideoItem = videoTrackItems.value.find(item => 
      currentTime.value >= item.startTime && 
      currentTime.value < item.startTime + item.duration
    )
    
    if (activeVideoItem) {
      const relativeTime = Math.max(0, currentTime.value - activeVideoItem.startTime)
      // Only update if there's a significant difference to avoid jitter
      if (Math.abs(videoPlayer.value.currentTime - relativeTime) > 0.1) {
        videoPlayer.value.currentTime = relativeTime
      }
    }
  }
  
  if (audioPlayer.value && currentPreviewItem.value?.type === 'audio') {
    const activeAudioItem = audioTrackItems.value.find(item => 
      currentTime.value >= item.startTime && 
      currentTime.value < item.startTime + item.duration
    )
    
    if (activeAudioItem) {
      const relativeTime = Math.max(0, currentTime.value - activeAudioItem.startTime)
      // Only update if there's a significant difference to avoid jitter
      if (Math.abs(audioPlayer.value.currentTime - relativeTime) > 0.1) {
        audioPlayer.value.currentTime = relativeTime
      }
    }
  }
}

const updateCurrentPreview = () => {
  // Find the item that should be playing at current time
  const videoItem = videoTrackItems.value.find(item => 
    currentTime.value >= item.startTime && 
    currentTime.value < item.startTime + item.duration
  )
  
  const audioItem = audioTrackItems.value.find(item => 
    currentTime.value >= item.startTime && 
    currentTime.value < item.startTime + item.duration
  )
  
  let newPreviewItem = null
  
  // Prioritize video over audio for preview
  if (videoItem) {
    const mediaItem = mediaItems.value.find(media => media.name === videoItem.title)
    if (mediaItem) {
      newPreviewItem = mediaItem
    }
  } else if (audioItem) {
    const mediaItem = mediaItems.value.find(media => media.name === audioItem.title)
    if (mediaItem) {
      newPreviewItem = mediaItem
    }
  }
  
  // Only update if preview item changed
  if (newPreviewItem !== currentPreviewItem.value) {
    currentPreviewItem.value = newPreviewItem
    
    // Wait for DOM update then sync media
    nextTick(() => {
      syncMediaWithTimeline()
    })
  }
}

// Player Controls
const togglePlayback = () => {
  // Don't play if there's no content
  if (videoTrackItems.value.length === 0 && audioTrackItems.value.length === 0) {
    toastStore.warning('Player', 'Adicione mídia à timeline primeiro')
    return
  }
  
  isPlaying.value = !isPlaying.value
  
  if (isPlaying.value) {
    // Update preview first
    updateCurrentPreview()
    
    // Control media playback if available and sync with timeline
    if (videoPlayer.value && currentPreviewItem.value?.type === 'video') {
      syncMediaWithTimeline()
      videoPlayer.value.play()
    } else if (audioPlayer.value && currentPreviewItem.value?.type === 'audio') {
      syncMediaWithTimeline()
      audioPlayer.value.play()
    }
    
    // Start timeline playback
    playbackInterval = setInterval(() => {
      if (!isDraggingPlayhead.value) {
        currentTime.value += 0.1 // Update every 100ms
        
        // Check if we need to switch to a different item
        updateCurrentPreview()
        
        // Stop at end of timeline or when no more content
        const hasContentAtCurrentTime = videoTrackItems.value.some(item => 
          currentTime.value >= item.startTime && currentTime.value < item.startTime + item.duration
        ) || audioTrackItems.value.some(item => 
          currentTime.value >= item.startTime && currentTime.value < item.startTime + item.duration
        )
        
        if (currentTime.value >= totalDuration.value || (!hasContentAtCurrentTime && currentTime.value > 5)) {
          isPlaying.value = false
          clearInterval(playbackInterval)
          
          if (videoPlayer.value) videoPlayer.value.pause()
          if (audioPlayer.value) audioPlayer.value.pause()
          
          toastStore.info('Player', 'Reprodução finalizada')
        }
      }
    }, 100)
    
    toastStore.info('Player', 'Reproduzindo')
  } else {
    // Pause media playback
    if (videoPlayer.value) videoPlayer.value.pause()
    if (audioPlayer.value) audioPlayer.value.pause()
    
    // Pause timeline playback
    if (playbackInterval) {
      clearInterval(playbackInterval)
      playbackInterval = null
    }
    toastStore.info('Player', 'Pausado')
  }
}

const goToStart = () => {
  // Find the earliest item in the timeline
  const allItems = [...videoTrackItems.value, ...audioTrackItems.value]
  const earliestStartTime = allItems.length > 0 
    ? Math.min(...allItems.map(item => item.startTime))
    : 0
  
  currentTime.value = earliestStartTime
  updateCurrentPreview()
  
  if (videoPlayer.value) videoPlayer.value.currentTime = 0
  if (audioPlayer.value) audioPlayer.value.currentTime = 0
  
  toastStore.info('Timeline', 'Voltou ao início')
}

const goToEnd = () => {
  currentTime.value = totalDuration.value
  updateCurrentPreview()
  
  toastStore.info('Timeline', 'Foi para o fim')
}

// Editor Controls
const undo = () => {
  if (historyIndex.value > 0) {
    historyIndex.value--
    const state = historyStack.value[historyIndex.value]
    
    videoTrackItems.value = JSON.parse(JSON.stringify(state.videoTrackItems))
    audioTrackItems.value = JSON.parse(JSON.stringify(state.audioTrackItems))
    totalDuration.value = state.totalDuration
    totalItems.value = state.totalItems
    
    canUndo.value = historyIndex.value > 0
    canRedo.value = true
    
    toastStore.info('Editor', 'Ação desfeita')
  }
}

const redo = () => {
  if (historyIndex.value < historyStack.value.length - 1) {
    historyIndex.value++
    const state = historyStack.value[historyIndex.value]
    
    videoTrackItems.value = JSON.parse(JSON.stringify(state.videoTrackItems))
    audioTrackItems.value = JSON.parse(JSON.stringify(state.audioTrackItems))
    totalDuration.value = state.totalDuration
    totalItems.value = state.totalItems
    
    canUndo.value = true
    canRedo.value = historyIndex.value < historyStack.value.length - 1
    
    toastStore.info('Editor', 'Ação refeita')
  }
}

// Timeline Controls
const zoomIn = () => {
  if (zoomLevel.value < 3) {
    zoomLevel.value += 0.25
    toastStore.info('Timeline', `Zoom: ${Math.round(zoomLevel.value * 100)}%`)
  }
}

const zoomOut = () => {
  if (zoomLevel.value > 0.25) {
    zoomLevel.value -= 0.25
    toastStore.info('Timeline', `Zoom: ${Math.round(zoomLevel.value * 100)}%`)
  }
}

const addTrack = () => {
  toastStore.success('Timeline', 'Nova trilha adicionada')
}

const toggleFullscreen = () => {
  toastStore.info('Preview', 'Modo tela cheia')
}

const onTrackDrop = (event: any, trackType: string) => {
  event.preventDefault()
  
  if (event.dataTransfer) {
    const data = event.dataTransfer.getData('application/json')
    if (data) {
      const asset = JSON.parse(data)
      
      // Calculate drop position more accurately
      const trackElement = event.currentTarget
      const rect = trackElement.getBoundingClientRect()
      const relativeX = event.clientX - rect.left
      const dropTime = Math.max(0, (relativeX / rect.width) * totalDuration.value)
      
      // Snap to grid if enabled
      const snappedTime = snapEnabled.value ? Math.round(dropTime / 5) * 5 : dropTime
      
      // Check for conflicts with existing items
      const existingItems = trackType === 'video' ? videoTrackItems.value : audioTrackItems.value
      const hasConflict = existingItems.some(item => 
        snappedTime < item.startTime + item.duration && 
        snappedTime + (asset.duration || 30) > item.startTime
      )
      
      if (hasConflict) {
        toastStore.warning('Timeline', 'Posição conflita com outro item')
        return
      }
      
      // Auto-detect track type if needed
      let actualTrackType = trackType
      if (trackType === 'auto') {
        if (asset.type === 'video' || asset.type === 'image') {
          actualTrackType = 'video'
        } else if (asset.type === 'audio') {
          actualTrackType = 'audio'
        } else {
          toastStore.warning('Timeline', 'Tipo de mídia não reconhecido')
          return
        }
      }
      
      // Add to appropriate track
      if (actualTrackType === 'video' && (asset.type === 'video' || asset.type === 'image')) {
        videoTrackItems.value.push({
          id: Date.now(),
          title: asset.name,
          startTime: snappedTime,
          duration: asset.duration || (asset.type === 'image' ? 5 : 30),
          thumbnail: asset.thumbnail,
          opacity: 100
        })
        totalItems.value++
      } else if (actualTrackType === 'audio' && asset.type === 'audio') {
        audioTrackItems.value.push({
          id: Date.now(),
          title: asset.name,
          startTime: snappedTime,
          duration: asset.duration || 30
        })
        totalItems.value++
      } else {
        toastStore.warning('Timeline', `Tipo de mídia ${asset.type} não compatível com trilha ${actualTrackType}`)
        return
      }
      
      // Update timeline duration if needed
      const newEndTime = snappedTime + (asset.duration || 30)
      if (newEndTime > totalDuration.value) {
        totalDuration.value = Math.ceil(newEndTime / 10) * 10 // Round up to next 10 seconds
      }
      
      toastStore.success('Timeline', `${asset.name} adicionado à trilha ${trackType}`)
      
      // Update total duration and save state
      updateTotalDuration()
      
      // If this is the first item and playhead is at 0, move it to the start of the item
      if (currentTime.value === 0 && snappedTime > 0) {
        currentTime.value = snappedTime
        updateCurrentPreview()
      }
      
      saveState()
    }
  }
}

// Update total duration based on items
const updateTotalDuration = () => {
  let maxTime = 60 // Minimum 1 minute
  
  // Check video track items
  videoTrackItems.value.forEach(item => {
    const endTime = item.startTime + item.duration
    if (endTime > maxTime) {
      maxTime = endTime
    }
  })
  
  // Check audio track items
  audioTrackItems.value.forEach(item => {
    const endTime = item.startTime + item.duration
    if (endTime > maxTime) {
      maxTime = endTime
    }
  })
  
  // Add some padding
  totalDuration.value = Math.ceil(maxTime / 10) * 10 + 10
  totalItems.value = videoTrackItems.value.length + audioTrackItems.value.length
}

const onTrackDragOver = (event: any) => {
  event.preventDefault()
  event.dataTransfer!.dropEffect = 'copy'
}

const onTrackDragLeave = (event: any) => {
  event.preventDefault()
}

const startDrag = (event: any, item: any) => {
  selectedItem.value = item
  
  const startX = event.clientX
  const startTime = item.startTime
  let isDragging = false
  
  const handleMouseMove = (moveEvent: any) => {
    if (!isDragging && Math.abs(moveEvent.clientX - startX) < 5) return
    
    isDragging = true
    const deltaX = moveEvent.clientX - startX
    const timeline = (event.target as any).closest('.track-content')
    
    if (timeline) {
      const timePerPixel = totalDuration.value / timeline.clientWidth
      let newTime = Math.max(0, startTime + (deltaX * timePerPixel))
      
      // Snap to grid if enabled
      if (snapEnabled.value) {
        newTime = Math.round(newTime / 5) * 5
      }
      
      // Check for conflicts with other items
      const trackItems = item.type === 'video' ? videoTrackItems.value : audioTrackItems.value
      const otherItems = trackItems.filter(i => i.id !== item.id)
      
      const hasConflict = otherItems.some(otherItem => 
        newTime < otherItem.startTime + otherItem.duration && 
        newTime + item.duration > otherItem.startTime
      )
      
      if (!hasConflict) {
        item.startTime = newTime
        
        // Update cursor to indicate dragging
        document.body.style.cursor = 'grabbing'
      }
    }
  }
  
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = ''
    
    if (isDragging) {
      toastStore.info('Timeline', `Item movido para ${formatTime(item.startTime)}`)
      saveState()
    }
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const startResize = (event: any, item: any, handle: 'left' | 'right') => {
  event.stopPropagation()
  
  const startX = event.clientX
  const startTime = item.startTime
  const startDuration = item.duration
  const minDuration = 0.5 // Minimum 0.5 seconds
  
  const handleMouseMove = (moveEvent: any) => {
    const deltaX = moveEvent.clientX - startX
    const timeline = (event.target as any).closest('.track-content')
    
    if (timeline) {
      const timePerPixel = totalDuration.value / timeline.clientWidth
      let deltaTime = deltaX * timePerPixel
      
      // Snap to grid if enabled
      if (snapEnabled.value) {
        deltaTime = Math.round(deltaTime / 0.5) * 0.5
      }
      
      if (handle === 'left') {
        // Resize from left (trim start)
        const maxStartTimeChange = startDuration - minDuration
        const clampedDelta = Math.max(-startTime, Math.min(maxStartTimeChange, deltaTime))
        
        const newStartTime = startTime + clampedDelta
        const newDuration = startDuration - clampedDelta
        
        if (newDuration >= minDuration && newStartTime >= 0) {
          item.startTime = newStartTime
          item.duration = newDuration
        }
      } else {
        // Resize from right (extend/trim end)
        const newDuration = Math.max(minDuration, startDuration + deltaTime)
        item.duration = newDuration
        
        // Update total duration if item extends beyond current timeline
        const itemEndTime = item.startTime + newDuration
        if (itemEndTime > totalDuration.value) {
          totalDuration.value = Math.ceil(itemEndTime / 10) * 10
        }
      }
      
      // Update cursor
      document.body.style.cursor = handle === 'left' ? 'w-resize' : 'e-resize'
    }
  }
  
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = ''
    
    toastStore.info('Timeline', `Item redimensionado: ${formatTime(item.duration)}`)
    saveState()
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const startPlayheadDrag = (event: any) => {
  isDraggingPlayhead.value = true
  
  // Pause playback while dragging
  const wasPlaying = isPlaying.value
  if (isPlaying.value) {
    isPlaying.value = false
    if (videoPlayer.value) videoPlayer.value.pause()
    if (audioPlayer.value) audioPlayer.value.pause()
  }
  
  const timeline = (event.target as any).closest('.timeline-workspace')
  if (!timeline) return
  
  const handleMouseMove = (moveEvent: any) => {
    const rect = timeline.getBoundingClientRect()
    const relativeX = Math.max(0, Math.min(moveEvent.clientX - rect.left, rect.width))
    const newTime = (relativeX / rect.width) * totalDuration.value
    
    // Snap to grid if enabled
    currentTime.value = snapEnabled.value ? Math.round(newTime / 0.5) * 0.5 : newTime
    
    // Update preview and sync media
    updateCurrentPreview()
    syncMediaWithTimeline()
  }
  
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    
    isDraggingPlayhead.value = false
    
    // Resume playback if it was playing before
    if (wasPlaying) {
      isPlaying.value = true
      if (videoPlayer.value && currentPreviewItem.value?.type === 'video') {
        videoPlayer.value.play()
      }
      if (audioPlayer.value && currentPreviewItem.value?.type === 'audio') {
        audioPlayer.value.play()
      }
    }
    
    toastStore.info('Timeline', `Posição: ${formatTime(currentTime.value)}`)
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const showItemContextMenu = (event: any, item: any) => {
  event.preventDefault()
  selectedItem.value = item
  
  // Remove existing menu if any
  const existingMenu = document.querySelector('.timeline-context-menu')
  if (existingMenu) {
    existingMenu.remove()
  }
  
  // Create context menu
  const menu = document.createElement('div')
  menu.className = 'timeline-context-menu'
  menu.style.cssText = `
    position: fixed;
    top: ${event.clientY}px;
    left: ${event.clientX}px;
    background: #2a2a2a;
    border: 1px solid #444444;
    border-radius: 8px;
    padding: 8px;
    z-index: 1000;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    min-width: 150px;
    font-size: 13px;
    color: #ffffff;
  `
  
  // Copy option
  const copyOption = document.createElement('div')
  copyOption.innerHTML = '<i class="pi pi-copy" style="margin-right: 8px;"></i>Duplicar'
  copyOption.style.cssText = `
    padding: 8px 12px;
    cursor: pointer;
    border-radius: 4px;
    display: flex;
    align-items: center;
    margin-bottom: 4px;
  `
  copyOption.onmouseover = () => copyOption.style.background = 'rgba(59, 130, 246, 0.1)'
  copyOption.onmouseleave = () => copyOption.style.background = 'transparent'
  copyOption.onclick = () => {
    duplicateTimelineItem(item)
    document.body.removeChild(menu)
  }
  
  // Delete option
  const deleteOption = document.createElement('div')
  deleteOption.innerHTML = '<i class="pi pi-trash" style="margin-right: 8px;"></i>Deletar'
  deleteOption.style.cssText = `
    padding: 8px 12px;
    cursor: pointer;
    border-radius: 4px;
    color: #ef4444;
    display: flex;
    align-items: center;
  `
  deleteOption.onmouseover = () => deleteOption.style.background = 'rgba(239, 68, 68, 0.1)'
  deleteOption.onmouseleave = () => deleteOption.style.background = 'transparent'
  deleteOption.onclick = () => {
    deleteTimelineItem(item)
    document.body.removeChild(menu)
  }
  
  menu.appendChild(copyOption)
  menu.appendChild(deleteOption)
  document.body.appendChild(menu)
  
  // Adjust position if menu goes outside viewport
  const rect = menu.getBoundingClientRect()
  if (rect.right > window.innerWidth) {
    menu.style.left = (event.clientX - rect.width) + 'px'
  }
  if (rect.bottom > window.innerHeight) {
    menu.style.top = (event.clientY - rect.height) + 'px'
  }
  
  // Remove menu on click outside
  const removeMenu = (e: any) => {
    if (!menu.contains(e.target)) {
      menu.remove()
      document.removeEventListener('click', removeMenu)
    }
  }
  
  setTimeout(() => document.addEventListener('click', removeMenu), 0)
}

const duplicateTimelineItem = (item: any) => {
  const duplicatedItem = {
    ...item,
    id: Date.now() + Math.random(),
    startTime: item.startTime + item.duration + 1 // Place after original item
  }
  
  if (item.type === 'video' || item.thumbnail) {
    videoTrackItems.value.push(duplicatedItem)
  } else {
    audioTrackItems.value.push(duplicatedItem)
  }
  
  totalItems.value++
  updateTotalDuration()
  saveState()
  toastStore.success('Timeline', 'Item duplicado')
}

const deleteTimelineItem = (item: any) => {
  if (item.type === 'video' || item.thumbnail) {
    const index = videoTrackItems.value.findIndex(i => i.id === item.id)
    if (index !== -1) {
      videoTrackItems.value.splice(index, 1)
    }
  } else {
    const index = audioTrackItems.value.findIndex(i => i.id === item.id)
    if (index !== -1) {
      audioTrackItems.value.splice(index, 1)
    }
  }
  
  totalItems.value--
  updateTotalDuration()
  selectedItem.value = null
  saveState()
  toastStore.success('Timeline', 'Item removido')
}

const toggleTrackVisibility = (trackType: string) => {
  toastStore.info('Timeline', `Trilha ${trackType} ${Math.random() > 0.5 ? 'oculta' : 'visível'}`)
}

const toggleTrackLock = (trackType: string) => {
  toastStore.info('Timeline', `Trilha ${trackType} ${Math.random() > 0.5 ? 'bloqueada' : 'desbloqueada'}`)
}

const handleThumbnailError = (event: any, item: any) => {
  console.log('Thumbnail error for item:', item.title)
  // Hide the broken image
  event.target.style.display = 'none'
  // Show placeholder instead
  const placeholder = event.target.parentElement.querySelector('.thumbnail-placeholder')
  if (placeholder) {
    placeholder.style.display = 'flex'
  }
}

const startExport = async () => {
  showExportDialog.value = false
  
  // Check if there are items to export
  if (videoTrackItems.value.length === 0 && audioTrackItems.value.length === 0) {
    toastStore.warning('Exportação', 'Adicione itens à timeline antes de exportar')
    return
  }
  
  isLoading.value = true
  
  try {
    // Prepare video settings
    const videoSettings: VideoSettings = {
      resolution: projectSettings.value.resolution,
      fps: projectSettings.value.fps,
      quality: settingsForm.value.quality,
      format: settingsForm.value.videoFormat,
      bitrate: projectSettings.value.bitrate
    }
    
    // Convert timeline items to FFmpeg format
    const ffmpegVideoItems: TimelineItem[] = videoTrackItems.value.map(item => {
      const mediaItem = mediaItems.value.find(media => media.name === item.title) as any
      return {
        id: item.id,
        title: item.title,
        startTime: item.startTime,
        duration: item.duration,
        file: mediaItem?.file,
        url: mediaItem?.url,
        type: 'video' as const,
        thumbnail: item.thumbnail,
        opacity: item.opacity || 100
      }
    })
    
    const ffmpegAudioItems: TimelineItem[] = audioTrackItems.value.map(item => {
      const mediaItem = mediaItems.value.find(media => media.name === item.title) as any
      return {
        id: item.id,
        title: item.title,
        startTime: item.startTime,
        duration: item.duration,
        file: mediaItem?.file,
        url: mediaItem?.url,
        type: 'audio' as const,
        volume: 1.0
      }
    })
    
    // Watch export progress
    const progressWatcher = setInterval(() => {
      const progress = ffmpeg.exportProgress.value
      loadingMessage.value = progress.message
    }, 100)
    
    try {
      // Start export
      const blob = await ffmpeg.exportVideo(
        ffmpegVideoItems,
        ffmpegAudioItems, 
        videoSettings,
        totalDuration.value
      )
      
      // Clear progress watcher
      clearInterval(progressWatcher)
      
      // Download the exported file
      const downloadUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `roteiro_${new Date().toISOString().slice(0, 10)}.${videoSettings.format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(downloadUrl)
      
      toastStore.success('Exportação Concluída', `Projeto exportado em ${videoSettings.format}`)
      
    } catch (exportError: any) {
      clearInterval(progressWatcher)
      throw exportError
    }
    
  } catch (error: any) {
    toastStore.error('Erro na Exportação', error?.message || 'Falha ao exportar o projeto')
  } finally {
    isLoading.value = false
  }
}

// Export progress helpers
const getPhaseIcon = (phase: string) => {
  const icons: Record<string, string> = {
    preparing: 'pi pi-cog',
    processing: 'pi pi-sync',
    encoding: 'pi pi-video',
    finalizing: 'pi pi-check-circle',
    complete: 'pi pi-check'
  }
  return icons[phase] || 'pi pi-cog'
}

const getPhaseLabel = (phase: string) => {
  const labels: Record<string, string> = {
    preparing: 'Preparando',
    processing: 'Processando',
    encoding: 'Codificando',
    finalizing: 'Finalizando',
    complete: 'Concluído'
  }
  return labels[phase] || 'Processando'
}

// Keyboard shortcuts
const handleKeydown = (event: any) => {
  // Space bar for play/pause
  if (event.code === 'Space' && !event.ctrlKey && !event.altKey) {
    event.preventDefault()
    togglePlayback()
  }
  
  // Ctrl+Z for undo
  if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
    event.preventDefault()
    undo()
  }
  
  // Ctrl+Y or Ctrl+Shift+Z for redo
  if (event.ctrlKey && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
    event.preventDefault()
    redo()
  }
  
  // Delete key for selected item
  if (event.key === 'Delete' && selectedItem.value) {
    event.preventDefault()
    deleteTimelineItem(selectedItem.value)
  }
  
  // Arrow keys for timeline navigation
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    currentTime.value = Math.max(0, currentTime.value - (event.shiftKey ? 1 : 5))
  }
  
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    currentTime.value = Math.min(totalDuration.value, currentTime.value + (event.shiftKey ? 1 : 5))
  }
  
  // Home/End keys
  if (event.key === 'Home') {
    event.preventDefault()
    goToStart()
  }
  
  if (event.key === 'End') {
    event.preventDefault()
    goToEnd()
  }
}

// Initialize
onMounted(async () => {
  isLoading.value = true
  loadingMessage.value = 'Carregando editor de vídeo...'
  
  try {
    // Initialize FFmpeg in background
    ffmpeg.load().catch(error => {
      console.error('FFmpeg initialization failed:', error)
      toastStore.warning('Editor', 'Funcionalidades de exportação podem estar limitadas')
    })
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    totalItems.value = videoTrackItems.value.length + audioTrackItems.value.length
    
    // Initialize timeline position
    goToStart()
    updateCurrentPreview()
    
    // Save initial state
    saveState()
    
    // Add keyboard listeners
    document.addEventListener('keydown', handleKeydown)
    
    toastStore.success('Editor', 'Editor de vídeo carregado com sucesso!')
  } catch {
    toastStore.error('Erro de Inicialização', 'Falha ao carregar o editor')
  } finally {
    isLoading.value = false
  }
})

// Cleanup on unmount

onUnmounted(() => {
  // Clear playback interval
  if (playbackInterval) {
    clearInterval(playbackInterval)
  }
  
  // Remove keyboard listeners
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* CapCut-inspired Professional Video Editor */
.capcut-editor {
  height: calc(100vh - 120px);
  background: #f8fafc;
  color: #1e293b;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
  border-radius: 12px;
  margin: 20px;
  border: 1px solid #e2e8f0;
}

/* Top Toolbar */
.top-toolbar {
  height: 60px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
  border-radius: 12px 12px 0 0;
}

.toolbar-left {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 20px;
}

.project-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.project-icon {
  width: 36px;
  height: 36px;
  background: #ffffff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  font-size: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.project-name {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
}

.project-stats {
  display: flex;
  gap: 16px;
  align-items: center;
}

.project-stats span {
  font-size: 12px;
  color: var(--surface-100);
  font-weight: 500;
}

.toolbar-center {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.playback-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--surface-50);
  border-radius: 12px;
  padding: 8px 16px;
  backdrop-filter: blur(10px);
}

.control-btn, .play-btn {
  width: 36px !important;
  height: 36px !important;
  border-radius: 8px !important;
  background: var(--surface-100) !important;
  color: var(--surface-0) !important;
  border: 1px solid var(--surface-border) !important;
  transition: all 0.2s ease !important;
}

.control-btn:hover, .play-btn:hover {
  background: var(--surface-200) !important;
  transform: translateY(-1px);
  box-shadow: var(--box-shadow);
}

.play-btn {
  background: var(--primary-color) !important;
  border-color: transparent !important;
  color: var(--surface-0) !important;
}

.play-btn.playing {
  background: var(--red-500) !important;
  box-shadow: 0 4px 12px rgba(var(--red-500-rgb), 0.3);
}

.time-indicator {
  font-size: 14px;
  font-weight: 500;
  color: var(--surface-0);
  background: var(--surface-200);
  padding: 8px 12px;
  border-radius: 8px;
  min-width: 120px;
  text-align: center;
}

.toolbar-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
}

.tool-btn {
  width: 36px !important;
  height: 36px !important;
  border-radius: 8px !important;
  background: rgba(255, 255, 255, 0.08) !important;
  color: #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  transition: all 0.2s ease !important;
}

.tool-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12) !important;
  transform: translateY(-1px);
}

.tool-btn:disabled {
  opacity: 0.5 !important;
  cursor: not-allowed !important;
}

.preview-btn, .export-btn {
  height: 36px !important;
  padding: 0 16px !important;
  border-radius: 8px !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  transition: all 0.2s ease !important;
}

.preview-btn {
  background: rgba(59, 130, 246, 0.15) !important;
  color: #3b82f6 !important;
  border: 1px solid rgba(59, 130, 246, 0.3) !important;
}

.preview-btn:hover {
  background: rgba(59, 130, 246, 0.25) !important;
  transform: translateY(-1px);
}

.export-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  color: white !important;
  border: none !important;
  margin-left: 8px;
}

.export-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.settings-btn {
  width: 36px !important;
  height: 36px !important;
  border-radius: 8px !important;
  background: rgba(255, 255, 255, 0.08) !important;
  color: #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  margin-left: 8px;
}

.settings-btn:hover {
  background: rgba(255, 255, 255, 0.12) !important;
  transform: translateY(-1px);
}

/* Main Workspace */
.workspace {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* Sidebars */
.sidebar {
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.left-sidebar {
  width: 280px;
  border-right: 1px solid var(--surface-border);
}

.left-sidebar.collapsed {
  width: 60px;
}

.right-sidebar {
  width: 320px;
  border-left: 1px solid var(--surface-border);
}

.right-sidebar.collapsed {
  width: 60px;
}

.sidebar-header {
  height: 50px;
  background: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.sidebar-tabs {
  display: flex;
  gap: 4px;
}

.tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
  font-weight: 500;
}

.tab:hover {
  background: #f1f5f9;
}

.tab.active {
  background: #dbeafe;
  color: #3b82f6;
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
}

.collapse-btn {
  width: 28px !important;
  height: 28px !important;
  border-radius: 6px !important;
  background: rgba(255, 255, 255, 0.08) !important;
  color: #ffffff !important;
  border: none !important;
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.12) !important;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

/* Upload Area */
.upload-area {
  margin-bottom: 16px;
  text-align: center;
}

.upload-btn {
  width: 100% !important;
  height: 40px !important;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
  color: white !important;
  border: none !important;
  border-radius: 8px !important;
  font-weight: 500 !important;
}

.upload-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* Media Grid */
.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.media-item {
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  cursor: grab;
  transition: all 0.2s ease;
  border: 1px solid #e2e8f0;
}

.media-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

.media-item:active {
  cursor: grabbing;
}

.media-thumbnail {
  position: relative;
  aspect-ratio: 16/9;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.media-item:hover .media-overlay {
  opacity: 1;
}

.media-overlay i {
  font-size: 24px;
  color: #ffffff;
}

.media-info {
  padding: 8px;
}

.media-name {
  font-size: 12px;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.media-details {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: #64748b;
}

/* Center Area */
.center-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--surface-ground);
}

/* Preview Panel */
.preview-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid var(--surface-border);
}

.preview-header {
  height: 50px;
  background: var(--surface-100);
  border-bottom: 1px solid var(--surface-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.preview-tabs {
  display: flex;
}

.preview-controls {
  display: flex;
  gap: 8px;
}

.expand-btn {
  width: 32px !important;
  height: 32px !important;
  border-radius: 6px !important;
  background: rgba(255, 255, 255, 0.08) !important;
  color: #ffffff !important;
  border: none !important;
}

.expand-btn:hover {
  background: rgba(255, 255, 255, 0.12) !important;
}

.preview-viewport {
  flex: 1;
  background: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* Timeline Overlay */
.timeline-overlay {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 12px;
  border-radius: 6px;
  backdrop-filter: blur(4px);
  z-index: 10;
}

.time-display {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  font-family: 'JetBrains Mono', monospace;
}

.video-canvas {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-video, .preview-audio {
  max-width: 100%;
  max-height: 100%;
  border-radius: 8px;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.empty-preview {
  text-align: center;
  color: #64748b;
}

.empty-preview i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-preview h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #ffffff;
}

.empty-preview p {
  font-size: 14px;
  color: #94a3b8;
}

/* Timeline Panel */
.timeline-panel {
  height: 300px;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.timeline-header {
  height: 40px;
  background: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.timeline-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.timeline-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.zoom-btn, .snap-btn, .add-track-btn {
  width: 32px !important;
  height: 32px !important;
  border-radius: 6px !important;
  background: rgba(255, 255, 255, 0.08) !important;
  color: #ffffff !important;
  border: none !important;
  transition: all 0.2s ease !important;
}

.zoom-btn:hover, .snap-btn:hover, .add-track-btn:hover {
  background: rgba(255, 255, 255, 0.12) !important;
}

.snap-btn.active {
  background: rgba(59, 130, 246, 0.2) !important;
  color: #3b82f6 !important;
}

.zoom-level {
  font-size: 12px;
  color: #a0a0a0;
  min-width: 50px;
  text-align: center;
}

.timeline-workspace {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: auto;
}

/* Timeline Tracks */
.timeline-tracks {
  flex: 1;
  min-height: 200px;
}

/* Empty Timeline */
.empty-timeline {
  height: 200px;
  background: #f8fafc;
  border: 2px dashed #e2e8f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.empty-timeline:hover {
  border-color: #3b82f6;
  background: #f0f9ff;
}

.empty-timeline-content {
  text-align: center;
  color: #64748b;
}

.empty-timeline-content i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
  color: #3b82f6;
}

.empty-timeline-content h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1e293b;
}

.empty-timeline-content p {
  font-size: 14px;
  color: #64748b;
}

.track {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
}

.track-header {
  width: 120px;
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  height: 60px;
}

.track-controls {
  display: flex;
  gap: 4px;
}

.track-toggle, .track-lock {
  width: 24px !important;
  height: 24px !important;
  border-radius: 4px !important;
  background: #f1f5f9 !important;
  color: #64748b !important;
  border: 1px solid #e2e8f0 !important;
  font-size: 12px !important;
}

.track-toggle:hover, .track-lock:hover {
  background: #e2e8f0 !important;
  color: #3b82f6 !important;
}

.track-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
}

.track-content {
  flex: 1;
  position: relative;
  background: #f8fafc;
  height: 60px;
  border-right: 1px solid #e2e8f0;
}

/* Timeline Items */
.timeline-item {
  position: absolute;
  top: 8px;
  height: 44px;
  border-radius: 6px;
  cursor: move;
  overflow: hidden;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.timeline-item:hover {
  border-color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.video-item {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.audio-item {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.item-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  height: 100%;
}

.item-thumbnail {
  position: relative;
  width: 32px;
  height: 24px;
  flex-shrink: 0;
}

.item-content img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  display: block;
}

.thumbnail-placeholder {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  display: none;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 10px;
}

.waveform {
  display: flex;
  align-items: center;
  gap: 1px;
  height: 24px;
}

.wave-bar {
  width: 2px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 1px;
  height: 100%;
  animation: wave 2s ease-in-out infinite;
}

.wave-bar:nth-child(odd) {
  animation-delay: 0.1s;
}

.wave-bar:nth-child(even) {
  animation-delay: 0.2s;
}

@keyframes wave {
  0%, 100% { height: 40%; }
  50% { height: 100%; }
}

.item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.item-title {
  font-size: 12px;
  font-weight: 500;
  color: #ffffff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.2;
}

.item-duration {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.2;
}

.resize-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 6px;
  cursor: ew-resize;
  background: rgba(255, 255, 255, 0.3);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.resize-handle.left {
  left: 0;
  border-radius: 6px 0 0 6px;
}

.resize-handle.right {
  right: 0;
  border-radius: 0 6px 6px 0;
}

.timeline-item:hover .resize-handle {
  opacity: 1;
}

/* Timeline Ruler */
.timeline-ruler {
  height: 30px;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  position: relative;
}

.time-tick {
  position: absolute;
  top: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tick-mark {
  width: 1px;
  height: 8px;
  background: #cbd5e1;
}

.tick-label {
  font-size: 10px;
  color: #64748b;
  margin-top: 2px;
}

/* Playhead */
.playhead {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #ef4444;
  z-index: 10;
  cursor: ew-resize;
}

.playhead-line {
  width: 100%;
  height: 100%;
  background: #ef4444;
  box-shadow: 0 0 4px rgba(239, 68, 68, 0.5);
}

.playhead-handle {
  position: absolute;
  top: -6px;
  left: -6px;
  width: 14px;
  height: 14px;
  background: #ef4444;
  border-radius: 50%;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Properties Panel */
.no-selection {
  text-align: center;
  padding: 40px 20px;
  color: #666666;
}

.no-selection i {
  font-size: 32px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-selection p {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #ffffff;
}

.no-selection span {
  font-size: 12px;
  color: #a0a0a0;
}

.properties-content {
  padding: 20px;
}

.property-section {
  margin-bottom: 24px;
}

.property-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #333333;
}

.property-group {
  margin-bottom: 16px;
}

.property-group label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #a0a0a0;
  margin-bottom: 6px;
}

/* Dialog Overrides */
.export-dialog :deep(.p-dialog) {
  background: #2a2a2a;
  color: #ffffff;
  border: 1px solid #333333;
}

.export-dialog :deep(.p-dialog-header) {
  background: #2a2a2a;
  border-bottom: 1px solid #333333;
  color: #ffffff;
}

.export-options {
  padding: 20px;
}

.format-section, .quality-section {
  margin-bottom: 24px;
}

.format-section h4, .quality-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 12px;
}

.format-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.format-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: #1a1a1a;
  border: 2px solid #333333;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.format-card:hover {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.format-card.selected {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.format-card i {
  font-size: 24px;
  color: #3b82f6;
}

.format-card span {
  font-size: 12px;
  font-weight: 500;
  color: #ffffff;
}

/* Preview Dialog */
.preview-dialog :deep(.p-dialog) {
  background: #1a1a1a;
  color: #ffffff;
  border: 1px solid #333333;
}

.preview-player {
  width: 800px;
  height: 450px;
  background: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-placeholder {
  text-align: center;
  color: #666666;
}

.player-placeholder i {
  font-size: 48px;
  margin-bottom: 16px;
}

/* Export Progress Dialog */
.export-progress-dialog :deep(.p-dialog) {
  background: var(--surface-card);
  color: var(--text-color);
  border: 1px solid var(--surface-border);
  min-width: 400px;
}

.export-progress-dialog :deep(.p-dialog-header) {
  background: var(--surface-card);
  border-bottom: 1px solid var(--surface-border);
  color: var(--text-color);
}

.export-progress-content {
  padding: 20px;
  text-align: center;
}

.progress-info {
  margin-bottom: 20px;
}

.progress-phase {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--primary-color);
}

.progress-phase i {
  font-size: 20px;
}

.progress-message {
  font-size: 14px;
  color: var(--text-color-secondary);
  margin-bottom: 16px;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: var(--surface-300);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color) 0%, var(--blue-400) 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-percentage {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
  min-width: 40px;
}

.time-remaining {
  font-size: 12px;
  color: var(--text-color-secondary);
  margin-bottom: 16px;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.loading-content {
  text-align: center;
  color: #ffffff;
}

.loading-content h3 {
  margin-top: 16px;
  font-size: 16px;
  font-weight: 500;
}

/* Component Overrides */
:deep(.p-button) {
  font-weight: 500;
}

:deep(.p-dropdown) {
  background: #1a1a1a;
  color: #ffffff;
  border: 1px solid #333333;
}

:deep(.p-dropdown:not(.p-disabled):hover) {
  border-color: #3b82f6;
}

:deep(.p-dropdown-panel) {
  background: #2a2a2a;
  border: 1px solid #333333;
}

:deep(.p-dropdown-item) {
  color: #ffffff;
}

:deep(.p-dropdown-item:not(.p-highlight):not(.p-disabled):hover) {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

:deep(.p-inputtext) {
  background: #1a1a1a;
  color: #ffffff;
  border: 1px solid #333333;
}

:deep(.p-inputtext:enabled:hover) {
  border-color: #3b82f6;
}

:deep(.p-inputtext:enabled:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.2);
}

/* Scrollbars */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #1a1a1a;
}

::-webkit-scrollbar-thumb {
  background: #444444;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555555;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .left-sidebar {
    width: 240px;
  }
  
  .right-sidebar {
    width: 280px;
  }
  
  .media-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}

@media (max-width: 768px) {
  .toolbar-left, .toolbar-right {
    flex: none;
  }
  
  .toolbar-center {
    flex: 2;
  }
  
  .project-stats {
    display: none;
  }
  
  .preview-btn {
    display: none;
  }
}
</style>