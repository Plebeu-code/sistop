<template>
  <div class="capcut-editor">
    <!-- Top Toolbar -->
    <div class="top-toolbar">
      <div class="toolbar-left">
        <div class="project-info">
          <div class="project-icon">
            <i class="pi pi-video"></i>
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
          <Button
            icon="pi pi-step-forward"
            class="control-btn"
            text
            rounded
            v-tooltip="'Ir para fim'"
            @click="goToEnd"
          />
          
          <div class="time-display">
            <span class="current-time">{{ formatTime(currentTime) }}</span>
            <span class="time-separator">/</span>
            <span class="total-time">{{ formatTime(totalDuration) }}</span>
          </div>
        </div>
      </div>

      <div class="header-right">
        <div class="action-buttons">
          <!-- Quick Actions -->
          <div class="quick-actions">
            <Button
              icon="pi pi-undo"
              class="action-btn"
              text
              rounded
              v-tooltip="'Desfazer (Ctrl+Z)'"
              :disabled="!canUndo"
              @click="undo"
            />
            <Button
              icon="pi pi-redo"
              class="action-btn"
              text
              rounded
              v-tooltip="'Refazer (Ctrl+Y)'"
              :disabled="!canRedo"
              @click="redo"
            />
            
            <div class="separator"></div>
            
            <Button
              icon="pi pi-save"
              class="action-btn save-btn"
              text
              rounded
              v-tooltip="'Salvar (Ctrl+S)'"
              @click="saveRoteiro"
            />
          </div>

          <!-- Export Actions -->
          <div class="export-actions">
            <Button
              label="Pré-visualizar"
              icon="pi pi-eye"
              class="preview-btn"
              @click="showPreview = true"
            />
            <Button
              label="Exportar"
              icon="pi pi-download"
              class="export-btn"
              @click="showExportDialog = true"
            />
          </div>

          <!-- Settings -->
          <Button
            icon="pi pi-cog"
            class="settings-btn"
            text
            rounded
            v-tooltip="'Configurações'"
            @click="showSettings = true"
          />
        </div>
      </div>
    </div>

    <!-- Professional Workspace -->
    <div class="editor-workspace">
      <!-- Left Sidebar - Media Library -->
      <div class="media-library" :class="{ 'collapsed': isLibraryCollapsed }">
        <div class="library-header">
          <div class="library-title">
            <i class="pi pi-folder-open library-icon" />
            <span v-if="!isLibraryCollapsed">Biblioteca de Mídia</span>
          </div>
          <Button
            :icon="isLibraryCollapsed ? 'pi pi-angle-right' : 'pi pi-angle-left'"
            class="collapse-btn"
            text
            rounded
            size="small"
            @click="isLibraryCollapsed = !isLibraryCollapsed"
          />
        </div>
        
        <div class="library-content" v-if="!isLibraryCollapsed">
          <!-- Media Grid -->
          <div class="media-grid">
            <div class="media-categories">
              <div class="category-tabs">
                <button 
                  v-for="category in mediaCategories" 
                  :key="category.key"
                  :class="['category-tab', { 'active': activeCategory === category.key }]"
                  @click="activeCategory = category.key"
                >
                  <i :class="category.icon"></i>
                  <span>{{ category.label }}</span>
                </button>
              </div>
            </div>
            
            <div class="media-items">
              <div 
                v-for="item in filteredMediaItems" 
                :key="item.id"
                class="media-item"
                draggable="true"
                @dragstart="onMediaDragStart($event, item)"
                @click="onAssetSelected(item)"
              >
                <div class="media-thumbnail">
                  <img v-if="item.thumbnail" :src="item.thumbnail" :alt="item.title" />
                  <div v-else class="media-placeholder">
                    <i :class="getMediaIcon(item.type)"></i>
                  </div>
                  <div class="media-duration" v-if="item.duration">
                    {{ formatTime(item.duration) }}
                  </div>
                </div>
                <div class="media-info">
                  <div class="media-title">{{ item.title || item.filename }}</div>
                  <div class="media-meta">{{ item.type }} • {{ formatFileSize(item.size) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Editor Area -->
      <div class="main-editor">
        <!-- Video Preview -->
        <div class="preview-container">
          <div class="preview-header">
            <div class="preview-title">
              <i class="pi pi-video" />
              <span>Preview</span>
            </div>
            
            <div class="preview-controls">
              <Button
                icon="pi pi-expand"
                class="preview-action"
                text
                rounded
                size="small"
                v-tooltip="'Tela cheia'"
                @click="toggleFullscreen"
              />
              <Button
                icon="pi pi-cog"
                class="preview-action"
                text
                rounded
                size="small"
                v-tooltip="'Configurações de preview'"
                @click="showPreviewSettings = true"
              />
            </div>
          </div>

          <div class="preview-viewport">
            <RoteiroPlayer
              :selected-asset="null"
              :current-time="currentTime"
              :is-playing="isPlaying"
              @segment-created="onSegmentCreated"
              @comment-added="onCommentAdded"
              @time-update="onTimeUpdate"
            />
            
            <!-- Preview Overlay -->
            <div class="preview-overlay" v-if="!currentRoteiro?.items?.length">
              <div class="empty-state">
                <i class="pi pi-video empty-icon" />
                <h3>Comece seu projeto</h3>
                <p>Arraste mídias da biblioteca para a timeline</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Timeline Editor -->
        <div class="timeline-container">
          <div class="timeline-header">
            <div class="timeline-title">
              <i class="pi pi-sliders-h" />
              <span>Timeline</span>
            </div>

            <div class="timeline-toolbar">
              <!-- Zoom Controls -->
              <div class="zoom-controls">
                <Button
                  icon="pi pi-search-minus"
                  class="zoom-btn"
                  text
                  rounded
                  size="small"
                  v-tooltip="'Reduzir zoom'"
                  @click="zoomOut"
                />
                <div class="zoom-display">{{ Math.round(zoomLevel * 100) }}%</div>
                <Button
                  icon="pi pi-search-plus"
                  class="zoom-btn"
                  text
                  rounded
                  size="small"
                  v-tooltip="'Aumentar zoom'"
                  @click="zoomIn"
                />
              </div>

              <!-- Snapping -->
              <Button
                :icon="snapEnabled ? 'pi pi-link' : 'pi pi-link-slash'"
                class="snap-btn"
                :class="{ 'active': snapEnabled }"
                text
                rounded
                size="small"
                v-tooltip="snapEnabled ? 'Desativar snap' : 'Ativar snap'"
                @click="snapEnabled = !snapEnabled"
              />

              <!-- Track Controls -->
              <Button
                icon="pi pi-plus"
                class="track-btn"
                text
                rounded
                size="small"
                v-tooltip="'Adicionar trilha'"
                @click="addTrack"
              />
            </div>
          </div>

          <div class="timeline-editor">
            <!-- Timeline Ruler -->
            <div class="timeline-ruler">
              <div class="ruler-container" :style="{ transform: `scaleX(${zoomLevel})` }">
                <div 
                  v-for="tick in timelineTicks" 
                  :key="tick.time"
                  class="ruler-tick"
                  :style="{ left: `${tick.position}px` }"
                >
                  <div class="tick-mark" :class="tick.type"></div>
                  <div class="tick-label" v-if="tick.showLabel">{{ formatTime(tick.time) }}</div>
                </div>
              </div>
            </div>

            <!-- Timeline Tracks -->
            <div class="timeline-tracks">
              <!-- Video Track -->
              <div class="timeline-track video-track">
                <div class="track-header">
                  <div class="track-info">
                    <i class="pi pi-video"></i>
                    <span>Vídeo</span>
                  </div>
                  <div class="track-controls">
                    <Button
                      icon="pi pi-eye"
                      class="track-toggle visible"
                      text
                      rounded
                      size="small"
                      @click="toggleTrackVisibility('video')"
                    />
                    <Button
                      icon="pi pi-lock-open"
                      class="track-toggle"
                      text
                      rounded
                      size="small"
                      @click="toggleTrackLock('video')"
                    />
                  </div>
                </div>
                <div class="track-content" 
                     @drop="onTrackDrop($event, 'video')"
                     @dragover="onTrackDragOver"
                     @dragleave="onTrackDragLeave">
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
                      <div class="item-thumbnail" v-if="item.thumbnail">
                        <img :src="item.thumbnail" :alt="item.title">
                      </div>
                      <div class="item-info">
                        <div class="item-title">{{ item.title }}</div>
                        <div class="item-duration">{{ formatTime(item.duration) }}</div>
                      </div>
                    </div>
                    <!-- Resize handles -->
                    <div class="resize-handle left" @mousedown="startResize($event, item, 'left')"></div>
                    <div class="resize-handle right" @mousedown="startResize($event, item, 'right')"></div>
                  </div>
                </div>
              </div>

              <!-- Audio Track -->
              <div class="timeline-track audio-track">
                <div class="track-header">
                  <div class="track-info">
                    <i class="pi pi-volume-up"></i>
                    <span>Áudio</span>
                  </div>
                  <div class="track-controls">
                    <Button
                      icon="pi pi-eye"
                      class="track-toggle visible"
                      text
                      rounded
                      size="small"
                      @click="toggleTrackVisibility('audio')"
                    />
                    <Button
                      icon="pi pi-lock-open"
                      class="track-toggle"
                      text
                      rounded
                      size="small"
                      @click="toggleTrackLock('audio')"
                    />
                  </div>
                </div>
                <div class="track-content"
                     @drop="onTrackDrop($event, 'audio')"
                     @dragover="onTrackDragOver"
                     @dragleave="onTrackDragLeave">
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
                      <div class="item-waveform">
                        <!-- SVG waveform would go here -->
                        <svg class="waveform-svg" viewBox="0 0 100 30">
                          <path d="M0,15 Q25,5 50,15 T100,15" stroke="currentColor" fill="none" stroke-width="1"/>
                        </svg>
                      </div>
                      <div class="item-info">
                        <div class="item-title">{{ item.title }}</div>
                      </div>
                    </div>
                    <div class="resize-handle left" @mousedown="startResize($event, item, 'left')"></div>
                    <div class="resize-handle right" @mousedown="startResize($event, item, 'right')"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Playhead -->
            <div 
              class="timeline-playhead" 
              :style="{ left: `${(currentTime / totalDuration) * 100}%` }"
              @mousedown="startPlayheadDrag"
            >
              <div class="playhead-line"></div>
              <div class="playhead-handle"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel - Properties -->
      <div class="properties-panel" :class="{ 'collapsed': isPropertiesCollapsed }">
        <div class="panel-header">
          <div class="panel-title">
            <i class="pi pi-sliders-v" />
            <span v-if="!isPropertiesCollapsed">Propriedades</span>
          </div>
          <Button
            :icon="isPropertiesCollapsed ? 'pi pi-angle-left' : 'pi pi-angle-right'"
            class="collapse-btn"
            text
            rounded
            size="small"
            @click="isPropertiesCollapsed = !isPropertiesCollapsed"
          />
        </div>

        <div class="panel-content" v-if="!isPropertiesCollapsed">
          <!-- Selected Item Properties -->
          <div class="properties-section" v-if="selectedItem">
            <div class="section-header">
              <i class="pi pi-cog"></i>
              <span>Propriedades do Item</span>
            </div>
            
            <div class="property-groups">
              <!-- Basic Properties -->
              <div class="property-group">
                <h4 class="group-title">Geral</h4>
                <div class="property-item">
                  <label>Nome</label>
                  <InputText v-model="selectedItem.title" class="property-input" />
                </div>
                <div class="property-item">
                  <label>Duração</label>
                  <div class="duration-controls">
                    <InputNumber v-model="selectedItem.duration" suffix="s" class="property-input" />
                  </div>
                </div>
                <div class="property-item">
                  <label>Posição</label>
                  <InputNumber v-model="selectedItem.startTime" suffix="s" class="property-input" />
                </div>
              </div>

              <!-- Transform Properties -->
              <div class="property-group">
                <h4 class="group-title">Transformação</h4>
                <div class="property-item">
                  <label>Escala</label>
                  <div class="transform-controls">
                    <InputNumber v-model="selectedItem.scale" :min="0.1" :max="5" :step="0.1" class="property-input small" />
                    <Button icon="pi pi-link" class="link-btn" text size="small" />
                  </div>
                </div>
                <div class="property-item">
                  <label>Rotação</label>
                  <InputNumber v-model="selectedItem.rotation" suffix="°" class="property-input" />
                </div>
                <div class="property-item">
                  <label>Opacidade</label>
                  <div class="opacity-control">
                    <Slider v-model="selectedItem.opacity" :min="0" :max="100" class="opacity-slider" />
                    <span class="opacity-value">{{ selectedItem.opacity }}%</span>
                  </div>
                </div>
              </div>

              <!-- Effects -->
              <div class="property-group">
                <h4 class="group-title">Efeitos</h4>
                <div class="effects-list">
                  <div v-for="effect in availableEffects" :key="effect.id" class="effect-item">
                    <div class="effect-info">
                      <i :class="effect.icon"></i>
                      <span>{{ effect.name }}</span>
                    </div>
                    <Button 
                      icon="pi pi-plus" 
                      class="add-effect-btn"
                      text 
                      size="small"
                      @click="addEffect(effect)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- No Selection State -->
          <div class="no-selection" v-else>
            <div class="empty-state">
              <i class="pi pi-info-circle"></i>
              <h3>Nenhum item selecionado</h3>
              <p>Selecione um item na timeline para ver suas propriedades</p>
            </div>
          </div>

          <!-- Project Properties -->
          <div class="properties-section">
            <div class="section-header">
              <i class="pi pi-cog"></i>
              <span>Projeto</span>
            </div>
            
            <div class="property-groups">
              <div class="property-group">
                <h4 class="group-title">Configurações Gerais</h4>
                <div class="property-item">
                  <label>Resolução</label>
                  <Dropdown 
                    v-model="projectSettings.resolution" 
                    :options="resolutionOptions"
                    option-label="label"
                    option-value="value"
                    class="property-input"
                  />
                </div>
                <div class="property-item">
                  <label>FPS</label>
                  <Dropdown 
                    v-model="projectSettings.fps" 
                    :options="fpsOptions"
                    option-label="label"
                    option-value="value"
                    class="property-input"
                  />
                </div>
                <div class="property-item">
                  <label>Taxa de Bits</label>
                  <InputText v-model="projectSettings.bitrate" class="property-input" />
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
      header="Configurações do Roteiro"
      class="w-full max-w-2xl"
      @update:visible="showSettings = $event"
    >
      <div class="space-y-6">
        <!-- Project Settings -->
        <div>
          <h4 class="text-lg font-medium text-gray-900 mb-4">
            Configurações do Projeto
          </h4>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Título do Roteiro
              </label>
              <InputText
                v-model="settingsForm.title"
                placeholder="Digite o título"
                class="w-full"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Duração Alvo (min)
              </label>
              <InputNumber
                v-model="settingsForm.targetDuration"
                :min="1"
                :max="120"
                suffix=" min"
                class="w-full"
              />
            </div>
          </div>

          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <Textarea
              v-model="settingsForm.description"
              rows="3"
              placeholder="Descrição do roteiro"
              class="w-full"
            />
          </div>
        </div>

        <!-- Workflow Settings -->
        <div class="border-t border-gray-200 pt-6">
          <h4 class="text-lg font-medium text-gray-900 mb-4">
            Configurações do Workflow
          </h4>
          
          <div class="space-y-3">
            <div class="flex items-center space-x-3">
              <Checkbox
                v-model="settingsForm.autoSave"
                binary
              />
              <label class="text-sm text-gray-700">
                Salvar automaticamente
              </label>
            </div>
            
            <div class="flex items-center space-x-3">
              <Checkbox
                v-model="settingsForm.validateOnChange"
                binary
              />
              <label class="text-sm text-gray-700">
                Validar timeline automaticamente
              </label>
            </div>
            
            <div class="flex items-center space-x-3">
              <Checkbox
                v-model="settingsForm.showPreviewOnHover"
                binary
              />
              <label class="text-sm text-gray-700">
                Mostrar preview ao passar o mouse
              </label>
            </div>
          </div>
        </div>

        <!-- Export Settings -->
        <div class="border-t border-gray-200 pt-6">
          <h4 class="text-lg font-medium text-gray-900 mb-4">
            Configurações de Exportação
          </h4>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Formato de Vídeo
              </label>
              <Dropdown
                v-model="settingsForm.videoFormat"
                :options="videoFormatOptions"
                option-label="label"
                option-value="value"
                placeholder="Selecionar formato"
                class="w-full"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Qualidade
              </label>
              <Dropdown
                v-model="settingsForm.quality"
                :options="qualityOptions"
                option-label="label"
                option-value="value"
                placeholder="Selecionar qualidade"
                class="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end space-x-2">
          <Button
            label="Cancelar"
            severity="secondary"
            @click="cancelSettings"
          />
          <Button
            label="Salvar"
            @click="saveSettings"
          />
        </div>
      </template>
    </Dialog>

    <!-- Modern Export Dialog -->
    <Dialog
      v-model:visible="showExportDialog"
      header="Exportar Projeto"
      class="export-dialog"
      :modal="true"
    >
      <div class="export-content">
        <div class="export-options">
          <h4>Formato de Saída</h4>
          <div class="format-grid">
            <div
              v-for="format in exportFormats"
              :key="format.value"
              class="format-option"
              :class="{ 'selected': settingsForm.videoFormat === format.value }"
              @click="settingsForm.videoFormat = format.value"
            >
              <i :class="format.icon" />
              <span>{{ format.label }}</span>
            </div>
          </div>
        </div>

        <div class="quality-settings">
          <h4>Qualidade</h4>
          <Dropdown
            v-model="settingsForm.quality"
            :options="qualityOptions"
            option-label="label"
            option-value="value"
            class="quality-dropdown"
          />
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <Button
            label="Cancelar"
            severity="secondary"
            @click="showExportDialog = false"
          />
          <Button
            label="Exportar"
            icon="pi pi-download"
            @click="startExport"
          />
        </div>
      </template>
    </Dialog>

    <!-- Preview Dialog -->
    <Dialog
      v-model:visible="showPreview"
      header="Pré-visualização"
      class="preview-dialog"
      :modal="true"
      maximizable
    >
      <div class="preview-content">
        <div class="preview-player">
          <!-- Full preview player would go here -->
          <div class="preview-placeholder">
            <i class="pi pi-video" />
            <p>Preview do projeto completo</p>
          </div>
        </div>
      </div>
    </Dialog>

    <!-- Loading Overlay -->
    <div
      v-if="isLoading"
      class="loading-overlay"
    >
      <div class="loading-content">
        <div class="loading-spinner">
          <ProgressSpinner strokeWidth="3" />
        </div>
        <div class="loading-text">
          <h3>{{ loadingMessage }}</h3>
          <p>Por favor, aguarde...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Checkbox from 'primevue/checkbox'
import Dropdown from 'primevue/dropdown'
import Slider from 'primevue/slider'
import ProgressSpinner from 'primevue/progressspinner'
import RoteiroPlayer from './components/RoteiroPlayer.vue'
import { useRoteiroStore, useToastStore } from '../../app/stores'
import type { 
  Asset, 
  RoteiroComentario, 
  RoteiroComentarioI18n, 
  TimelineItem 
} from '../../shared/types'

const roteiroStore = useRoteiroStore()
const toastStore = useToastStore()

// State
const showSettings = ref(false)
const showPreview = ref(false)
const showExportDialog = ref(false)
const showPreviewSettings = ref(false)
const isLoading = ref(false)
const loadingMessage = ref('')

// UI State
const isLibraryCollapsed = ref(false)
const isPropertiesCollapsed = ref(false)
const isPlaying = ref(false)
const currentTime = ref(0)
const zoomLevel = ref(1)
const snapEnabled = ref(true)

// Editor State
const canUndo = ref(false)
const canRedo = ref(false)
const activeTransitions = ref(3)
const totalItems = ref(0)
const totalDuration = ref(300) // 5 minutes default
const selectedItem = ref(null)

// Media Library
const activeCategory = ref('all')
const mediaCategories = ref([
  { key: 'all', label: 'Todos', icon: 'pi pi-th-large' },
  { key: 'video', label: 'Vídeos', icon: 'pi pi-video' },
  { key: 'audio', label: 'Áudio', icon: 'pi pi-volume-up' },
  { key: 'image', label: 'Imagens', icon: 'pi pi-image' }
])

const mediaItems = ref([
  {
    id: 'media-1',
    title: 'Vídeo Intro',
    filename: 'intro.mp4',
    type: 'video',
    duration: 30,
    size: 15728640,
    thumbnail: '/api/placeholder/120/68'
  },
  {
    id: 'media-2',
    title: 'Background Music',
    filename: 'bg_music.mp3',
    type: 'audio',
    duration: 180,
    size: 5242880
  },
  {
    id: 'media-3',
    title: 'Logo',
    filename: 'logo.png',
    type: 'image',
    size: 1048576,
    thumbnail: '/api/placeholder/120/68'
  }
])

// Timeline Data
const videoTrackItems = ref([
  {
    id: 'video-1',
    title: 'Vídeo Intro',
    startTime: 0,
    duration: 30,
    thumbnail: '/api/placeholder/120/68',
    scale: 1,
    rotation: 0,
    opacity: 100
  },
  {
    id: 'video-2',
    title: 'Conteúdo Principal',
    startTime: 30,
    duration: 120,
    thumbnail: '/api/placeholder/120/68',
    scale: 1,
    rotation: 0,
    opacity: 100
  }
])

const audioTrackItems = ref([
  {
    id: 'audio-1',
    title: 'Background Music',
    startTime: 0,
    duration: 180,
    scale: 1,
    rotation: 0,
    opacity: 100
  }
])

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

const availableEffects = [
  { id: 'fade', name: 'Fade In/Out', icon: 'pi pi-eye' },
  { id: 'blur', name: 'Blur', icon: 'pi pi-circle' },
  { id: 'color', name: 'Correção de Cor', icon: 'pi pi-palette' }
]

// Settings form
const settingsForm = ref({
  title: 'Meu Roteiro',
  description: '',
  targetDuration: 5,
  autoSave: true,
  validateOnChange: true,
  showPreviewOnHover: true,
  videoFormat: 'mp4',
  quality: 'hd'
})

const videoFormatOptions = [
  { label: 'MP4', value: 'mp4' },
  { label: 'WebM', value: 'webm' },
  { label: 'AVI', value: 'avi' }
]

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

// Current roteiro
const currentRoteiro = computed(() => roteiroStore.currentRoteiro)

// Mock segments for demonstration
const playerSegments = computed(() => {
  return [
    {
      id: 'segment-1',
      startTime: 0,
      endTime: 30,
      title: 'Segmento de Abertura',
      comments: []
    },
    {
      id: 'segment-2', 
      startTime: 30,
      endTime: 60,
      title: 'Conteúdo Principal',
      comments: []
    }
  ]
})

const timelineSegments = computed(() => {
  return playerSegments.value.map(segment => ({
    id: segment.id,
    startTime: segment.startTime,
    endTime: segment.endTime,
    title: segment.title,
    type: 'video'
  }))
})

const translationSegments = computed(() => {
  return playerSegments.value
})

// Event handlers
const onAssetSelected = (asset: Asset) => {
  toastStore.info('Asset Selecionado', `${asset.title || asset.filename} adicionado ao roteiro`)
  
  // Add asset to roteiro
  if (currentRoteiro.value) {
    roteiroStore.addItemToRoteiro(currentRoteiro.value.id, {
      clipId: asset.id,
      startTime: 0,
      duration: asset.duration || 30,
      order: currentRoteiro.value.items.length,
      metadata: {
        title: asset.title || asset.filename,
        description: asset.description
      }
    })
  }
}

// Media item drag and drop handlers
const onMediaDragStart = (event: DragEvent, asset: Asset) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/json', JSON.stringify(asset))
    event.dataTransfer.effectAllowed = 'copy'
  }
}

const onTimelineDrop = (event: DragEvent) => {
  event.preventDefault()
  const data = event.dataTransfer?.getData('application/json')
  if (data) {
    const asset = JSON.parse(data) as Asset
    onAssetSelected(asset)
  }
}

const onSegmentCreated = (segment: any) => {
  toastStore.success('Segmento Criado', 'Novo segmento adicionado com sucesso')
  
  // Add to roteiro if needed
  if (currentRoteiro.value) {
    roteiroStore.addItemToRoteiro(currentRoteiro.value.id, {
      clipId: segment.assetId || 'mock-asset',
      startTime: segment.startTime,
      duration: segment.endTime - segment.startTime,
      order: currentRoteiro.value.items.length,
      metadata: {
        title: segment.title || `Segmento ${currentRoteiro.value.items.length + 1}`
      }
    })
  }
}

const onSegmentUpdated = (segment: any) => {
  toastStore.info('Segmento Atualizado', 'Segmento modificado com sucesso')
  
  // Update roteiro item
  if (currentRoteiro.value) {
    const item = currentRoteiro.value.items.find(i => i.id === segment.id)
    if (item) {
      item.startTime = segment.startTime
      item.duration = segment.endTime - segment.startTime
      if (segment.title) {
        item.metadata = { ...item.metadata, title: segment.title }
      }
    }
  }
}

const onCommentAdded = (segmentId: string, comment: RoteiroComentario) => {
  toastStore.success('Comentário Adicionado', 'Comentário salvo com sucesso')
  
  if (currentRoteiro.value) {
    roteiroStore.addComment(currentRoteiro.value.id, segmentId, comment)
  }
}

const onTranslationGenerated = (_commentId: string, translation: RoteiroComentarioI18n) => {
  toastStore.success('Tradução Gerada', `Tradução em ${translation.language} criada`)
}

const onPlaySegment = (segment: any) => {
  toastStore.info('Reproduzir Segmento', `Reproduzindo segmento: ${segment.title}`)
}

const onTimelineItemAdded = (_item: TimelineItem) => {
  toastStore.success('Item Adicionado', 'Item adicionado à timeline')
}

const onTimelineItemUpdated = (item: TimelineItem) => {
  toastStore.info('Item Atualizado', 'Item da timeline modificado')
  
  // Mock update - simplified
  // Mock update functionality
}

const onTimelineItemDeleted = (_itemId: string) => {
  toastStore.warning('Item Removido', 'Item removido da timeline')
}

const onTimelineValidated = (results: any) => {
  const { conflicts, gaps } = results
  
  if (conflicts === 0 && gaps === 0) {
    toastStore.success('Timeline Válida', 'Timeline sem problemas')
  } else {
    toastStore.warning('Problemas na Timeline', `${conflicts} conflitos e ${gaps} lacunas encontradas`)
  }
}

// Utility Functions
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}h ${mins}m ${secs}s`
  }
  return `${mins}m ${secs}s`
}

// Player Controls
const togglePlayback = () => {
  isPlaying.value = !isPlaying.value
  toastStore.info('Player', isPlaying.value ? 'Reproduzindo' : 'Pausado')
}

const goToStart = () => {
  currentTime.value = 0
  toastStore.info('Timeline', 'Voltou ao início')
}

const goToEnd = () => {
  currentTime.value = totalDuration.value
  toastStore.info('Timeline', 'Foi para o fim')
}

const onTimeUpdate = (time: number) => {
  currentTime.value = time
}

// Editor Controls
const undo = () => {
  // Implement undo logic
  toastStore.info('Editor', 'Ação desfeita')
  canUndo.value = false
  canRedo.value = true
}

const redo = () => {
  // Implement redo logic
  toastStore.info('Editor', 'Ação refeita')
  canRedo.value = false
  canUndo.value = true
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

// Computed Properties
const filteredMediaItems = computed(() => {
  if (activeCategory.value === 'all') {
    return mediaItems.value
  }
  return mediaItems.value.filter(item => item.type === activeCategory.value)
})

const timelineTicks = computed(() => {
  const ticks = []
  const tickInterval = 10 // 10 seconds per tick
  const maxTime = totalDuration.value
  
  for (let time = 0; time <= maxTime; time += tickInterval) {
    ticks.push({
      time,
      position: (time / maxTime) * 1000, // Scale for zoom
      type: time % 60 === 0 ? 'major' : 'minor',
      showLabel: time % 30 === 0
    })
  }
  
  return ticks
})

// Media Library Functions
const getMediaIcon = (type: string) => {
  const icons: Record<string, string> = {
    video: 'pi pi-video',
    audio: 'pi pi-volume-up',
    image: 'pi pi-image'
  }
  return icons[type] || 'pi pi-file'
}

const formatFileSize = (bytes: number) => {
  const sizes = ['B', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

// Timeline drag and drop functionality (simplified for demo)
const handleTimelineDrop = (assetData: Asset) => {
  onAssetSelected(assetData)
}

// Timeline Functions
const onTrackDrop = (event: DragEvent, trackType: string) => {
  event.preventDefault()
  
  if (event.dataTransfer) {
    const data = JSON.parse(event.dataTransfer.getData('application/json'))
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    const position = (event.clientX - rect.left) / rect.width
    const startTime = position * totalDuration.value
    
    // Add item to appropriate track
    const newItem = {
      id: `${trackType}-${Date.now()}`,
      title: data.title,
      startTime: Math.round(startTime),
      duration: data.duration || 30,
      thumbnail: data.thumbnail,
      scale: 1,
      rotation: 0,
      opacity: 100
    }
    
    if (trackType === 'video') {
      videoTrackItems.value.push(newItem)
    } else if (trackType === 'audio') {
      audioTrackItems.value.push(newItem)
    }
    
    toastStore.success('Item Adicionado', `${data.title} adicionado à trilha ${trackType}`)
  }
}

const onTrackDragOver = (event: DragEvent) => {
  event.preventDefault()
  event.dataTransfer!.dropEffect = 'copy'
}

const onTrackDragLeave = (event: DragEvent) => {
  event.preventDefault()
}

const startDrag = (event: MouseEvent, item: any) => {
  selectedItem.value = item
  
  // Add drag logic here
  const startX = event.clientX
  const startTime = item.startTime
  
  const handleMouseMove = (moveEvent: MouseEvent) => {
    const deltaX = moveEvent.clientX - startX
    const timeline = (event.target as HTMLElement).closest('.track-content')
    if (timeline) {
      const timelineBounds = timeline.getBoundingClientRect()
      const deltaTime = (deltaX / timelineBounds.width) * totalDuration.value
      
      item.startTime = Math.max(0, Math.min(totalDuration.value - item.duration, startTime + deltaTime))
      
      if (snapEnabled.value) {
        item.startTime = Math.round(item.startTime / 5) * 5 // Snap to 5-second intervals
      }
    }
  }
  
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const startResize = (event: MouseEvent, item: any, handle: 'left' | 'right') => {
  event.stopPropagation()
  
  const startX = event.clientX
  const startTime = item.startTime
  const startDuration = item.duration
  
  const handleMouseMove = (moveEvent: MouseEvent) => {
    const deltaX = moveEvent.clientX - startX
    const timeline = (event.target as HTMLElement).closest('.track-content')
    if (timeline) {
      const timelineBounds = timeline.getBoundingClientRect()
      const deltaTime = (deltaX / timelineBounds.width) * totalDuration.value
      
      if (handle === 'left') {
        const newStartTime = Math.max(0, startTime + deltaTime)
        const newDuration = startDuration - (newStartTime - startTime)
        
        if (newDuration > 1) {
          item.startTime = newStartTime
          item.duration = newDuration
        }
      } else {
        const newDuration = Math.max(1, startDuration + deltaTime)
        if (startTime + newDuration <= totalDuration.value) {
          item.duration = newDuration
        }
      }
    }
  }
  
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const startPlayheadDrag = (event: MouseEvent) => {
  const timeline = (event.target as HTMLElement).closest('.timeline-editor')
  if (!timeline) return
  
  const handleMouseMove = (moveEvent: MouseEvent) => {
    const rect = timeline.getBoundingClientRect()
    const position = Math.max(0, Math.min(1, (moveEvent.clientX - rect.left) / rect.width))
    currentTime.value = position * totalDuration.value
  }
  
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const showItemContextMenu = (event: MouseEvent, item: any) => {
  event.preventDefault()
  selectedItem.value = item
  // Context menu logic would go here
}

const toggleTrackVisibility = (trackType: string) => {
  toastStore.info('Timeline', `Trilha ${trackType} ${Math.random() > 0.5 ? 'oculta' : 'visível'}`)
}

const toggleTrackLock = (trackType: string) => {
  toastStore.info('Timeline', `Trilha ${trackType} ${Math.random() > 0.5 ? 'bloqueada' : 'desbloqueada'}`)
}

const addEffect = (effect: any) => {
  if (selectedItem.value) {
    toastStore.success('Efeito Adicionado', `${effect.name} aplicado ao item`)
  }
}

const startExport = async () => {
  showExportDialog.value = false
  
  isLoading.value = true
  loadingMessage.value = 'Exportando projeto...'
  
  try {
    // Mock export operation
    await new Promise(resolve => window.setTimeout(resolve, 2000))
    
    toastStore.success('Exportação Concluída', `Projeto exportado em ${settingsForm.value.videoFormat}`)
  } catch {
    toastStore.error('Erro na Exportação', 'Falha ao exportar o projeto')
  } finally {
    isLoading.value = false
  }
}

// Actions
const saveRoteiro = async () => {
  if (!currentRoteiro.value) return
  
  isLoading.value = true
  loadingMessage.value = 'Salvando roteiro...'
  
  try {
    // Mock save operation
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toastStore.success('Roteiro Salvo', 'Roteiro salvo com sucesso')
    canUndo.value = false
  } catch {
    toastStore.error('Erro ao Salvar', 'Falha ao salvar o roteiro')
  } finally {
    isLoading.value = false
  }
}

const exportRoteiro = async () => {
  if (!currentRoteiro.value) return
  
  isLoading.value = true
  loadingMessage.value = 'Exportando roteiro...'
  
  try {
    // Mock export operation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    toastStore.success('Roteiro Exportado', `Roteiro exportado em ${settingsForm.value.videoFormat}`)
  } catch (error) {
    toastStore.error('Erro na Exportação', 'Falha ao exportar o roteiro')
  } finally {
    isLoading.value = false
  }
}

const saveSettings = () => {
  // Update current roteiro with settings
  if (currentRoteiro.value) {
    currentRoteiro.value.title = settingsForm.value.title
    currentRoteiro.value.description = settingsForm.value.description
  }
  
  showSettings.value = false
  toastStore.success('Configurações Salvas', 'Configurações aplicadas com sucesso')
}

const cancelSettings = () => {
  // Reset form to current values
  if (currentRoteiro.value) {
    settingsForm.value.title = currentRoteiro.value.title
    settingsForm.value.description = currentRoteiro.value.description || ''
  }
  
  showSettings.value = false
}

// Initialize
onMounted(async () => {
  isLoading.value = true
  loadingMessage.value = 'Carregando roteiro...'
  
  try {
    // Initialize or load roteiro
    if (!currentRoteiro.value) {
      await roteiroStore.createRoteiro({
        title: 'Novo Roteiro',
        description: 'Roteiro criado automaticamente',
        pautaId: 'default-pauta-id'
      })
    }
    
    // Load settings from roteiro
    if (currentRoteiro.value) {
      settingsForm.value.title = currentRoteiro.value.title
      settingsForm.value.description = currentRoteiro.value.description || ''
    }
    
  } catch {
    toastStore.error('Erro de Inicialização', 'Falha ao carregar o roteiro')
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
/* CapCut-inspired Professional Video Editor Styles */

.roteiro-editor {
  height: 100vh;
  background: #1a1a1a;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
}

/* Professional Header */
.editor-header {
  height: 64px;
  background: linear-gradient(135deg, #2a2a2a 0%, #1e1e1e 100%);
  border-bottom: 1px solid #333333;
  display: flex;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 100;
}

.header-left {
  flex: 1;
  display: flex;
  align-items: center;
}

.project-info {
  display: flex;
  align-items: center;
}

.project-title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.project-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.project-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.project-title {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  line-height: 1.2;
}

.project-stats {
  display: flex;
  gap: 16px;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #a0a0a0;
  font-weight: 500;
}

.stat-item i {
  font-size: 11px;
  color: #3b82f6;
}

/* Timeline Controls in Header */
.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.timeline-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 8px 16px;
  backdrop-filter: blur(10px);
}

.control-btn, .play-btn {
  width: 36px !important;
  height: 36px !important;
  border-radius: 8px !important;
  background: rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  transition: all 0.2s ease !important;
}

.control-btn:hover, .play-btn:hover {
  background: rgba(255, 255, 255, 0.15) !important;
  border-color: rgba(59, 130, 246, 0.5) !important;
  transform: translateY(-1px);
}

.play-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
  border-color: #3b82f6 !important;
}

.play-btn.playing {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
  border-color: #ef4444 !important;
  animation: pulse 2s infinite;
}

.time-display {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: 500;
}

.current-time {
  color: #3b82f6;
}

.time-separator {
  color: #666666;
}

.total-time {
  color: #a0a0a0;
}

/* Header Right Actions */
.header-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 16px;
}

.quick-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.action-btn {
  width: 32px !important;
  height: 32px !important;
  border-radius: 6px !important;
  background: transparent !important;
  color: #a0a0a0 !important;
  transition: all 0.2s ease !important;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
}

.save-btn:hover {
  color: #10b981 !important;
}

.separator {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0 4px;
}

.export-actions {
  display: flex;
  gap: 8px;
}

.preview-btn {
  background: rgba(59, 130, 246, 0.1) !important;
  color: #3b82f6 !important;
  border: 1px solid rgba(59, 130, 246, 0.3) !important;
  border-radius: 8px !important;
  padding: 6px 12px !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  transition: all 0.2s ease !important;
}

.preview-btn:hover {
  background: rgba(59, 130, 246, 0.2) !important;
  border-color: rgba(59, 130, 246, 0.5) !important;
}

.export-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  color: white !important;
  border: none !important;
  border-radius: 8px !important;
  padding: 6px 12px !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3) !important;
  transition: all 0.2s ease !important;
}

.export-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4) !important;
}

.settings-btn {
  width: 36px !important;
  height: 36px !important;
  border-radius: 8px !important;
  background: rgba(255, 255, 255, 0.05) !important;
  color: #a0a0a0 !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  transition: all 0.2s ease !important;
}

.settings-btn:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
}

/* Professional Workspace */
.editor-workspace {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* Media Library */
.media-library {
  width: 280px;
  background: #262626;
  border-right: 1px solid #333333;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.media-library.collapsed {
  width: 56px;
}

.library-header {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  border-bottom: 1px solid #333333;
  background: #2a2a2a;
}

.library-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
}

.library-title i {
  color: #3b82f6;
  font-size: 14px;
}

.collapse-btn {
  width: 24px !important;
  height: 24px !important;
  background: rgba(255, 255, 255, 0.05) !important;
  color: #a0a0a0 !important;
  border-radius: 4px !important;
  transition: all 0.2s ease !important;
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
}

.library-content {
  flex: 1;
  overflow: hidden;
}

/* Main Editor Area */
.main-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Preview Container */
.preview-container {
  height: 320px;
  background: #1a1a1a;
  border-bottom: 1px solid #333333;
  display: flex;
  flex-direction: column;
}

.preview-header {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: #2a2a2a;
  border-bottom: 1px solid #333333;
}

.preview-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
}

.preview-title i {
  color: #3b82f6;
  font-size: 13px;
}

.preview-controls {
  display: flex;
  gap: 4px;
}

.preview-action {
  width: 24px !important;
  height: 24px !important;
  background: rgba(255, 255, 255, 0.05) !important;
  color: #a0a0a0 !important;
  border-radius: 4px !important;
  transition: all 0.2s ease !important;
}

.preview-action:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
}

.preview-viewport {
  flex: 1;
  background: #000000;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
}

.empty-state {
  text-align: center;
  color: #666666;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: #333333;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 8px;
}

.empty-state p {
  font-size: 14px;
  margin: 0;
  color: #999999;
}

/* Timeline Container */
.timeline-container {
  flex: 1;
  background: #1e1e1e;
  display: flex;
  flex-direction: column;
  min-height: 200px;
}

.timeline-header {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: #2a2a2a;
  border-bottom: 1px solid #333333;
}

.timeline-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
}

.timeline-title i {
  color: #3b82f6;
  font-size: 13px;
}

.timeline-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 4px;
}

.zoom-btn {
  width: 24px !important;
  height: 24px !important;
  background: transparent !important;
  color: #a0a0a0 !important;
  border-radius: 4px !important;
  transition: all 0.2s ease !important;
}

.zoom-btn:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
}

.zoom-display {
  font-size: 11px;
  font-weight: 600;
  color: #ffffff;
  min-width: 40px;
  text-align: center;
}

.snap-btn {
  width: 28px !important;
  height: 28px !important;
  background: rgba(255, 255, 255, 0.05) !important;
  color: #a0a0a0 !important;
  border-radius: 6px !important;
  transition: all 0.2s ease !important;
}

.snap-btn.active {
  background: rgba(59, 130, 246, 0.2) !important;
  color: #3b82f6 !important;
}

.snap-btn:hover {
  background: rgba(255, 255, 255, 0.1) !important;
}

.track-btn {
  width: 28px !important;
  height: 28px !important;
  background: rgba(16, 185, 129, 0.1) !important;
  color: #10b981 !important;
  border-radius: 6px !important;
  transition: all 0.2s ease !important;
}

.track-btn:hover {
  background: rgba(16, 185, 129, 0.2) !important;
}

.timeline-editor {
  flex: 1;
  overflow: hidden;
}

/* Properties Panel */
.properties-panel {
  width: 320px;
  background: #262626;
  border-left: 1px solid #333333;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.properties-panel.collapsed {
  width: 56px;
}

.panel-header {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  border-bottom: 1px solid #333333;
  background: #2a2a2a;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
}

.panel-title i {
  color: #3b82f6;
  font-size: 14px;
}

.panel-content {
  flex: 1;
  overflow: hidden;
}

/* Export Dialog */
.export-dialog {
  background: #1a1a1a !important;
  border: 1px solid #333333 !important;
  border-radius: 12px !important;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8) !important;
}

.export-content {
  padding: 24px;
  color: #ffffff;
}

.export-options h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 16px;
  color: #ffffff;
}

.format-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.format-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.format-option:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(59, 130, 246, 0.5);
}

.format-option.selected {
  background: rgba(59, 130, 246, 0.2);
  border-color: #3b82f6;
}

.format-option i {
  font-size: 24px;
  color: #3b82f6;
}

.format-option span {
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
}

.quality-settings h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px;
  color: #ffffff;
}

.quality-dropdown {
  width: 100% !important;
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #333333;
}

/* Preview Dialog */
.preview-dialog {
  background: #000000 !important;
  border: 1px solid #333333 !important;
  border-radius: 12px !important;
}

.preview-content {
  padding: 0;
  background: #000000;
  min-height: 400px;
}

.preview-player {
  width: 100%;
  height: 400px;
  background: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-placeholder {
  text-align: center;
  color: #666666;
}

.preview-placeholder i {
  font-size: 64px;
  margin-bottom: 16px;
  color: #333333;
}

.preview-placeholder p {
  font-size: 16px;
  margin: 0;
  color: #999999;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

.loading-content {
  background: #1a1a1a;
  border: 1px solid #333333;
  border-radius: 12px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
}

.loading-spinner {
  color: #3b82f6;
}

.loading-text {
  text-align: center;
}

.loading-text h3 {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 8px;
}

.loading-text p {
  font-size: 14px;
  color: #999999;
  margin: 0;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Scrollbars */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  transition: background 0.2s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .media-library {
    width: 240px;
  }
  
  .properties-panel {
    width: 280px;
  }
  
  .preview-container {
    height: 280px;
  }
}

@media (max-width: 768px) {
  .editor-header {
    padding: 0 12px;
  }
  
  .project-stats {
    display: none;
  }
  
  .quick-actions {
    display: none;
  }
  
  .media-library,
  .properties-panel {
    position: absolute;
    top: 64px;
    bottom: 0;
    z-index: 200;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .media-library:not(.collapsed),
  .properties-panel:not(.collapsed) {
    transform: translateX(0);
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .editor-header,
  .media-library,
  .properties-panel {
    border-color: #666666;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>


