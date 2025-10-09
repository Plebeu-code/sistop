<template>
  <div class="timeline-panel h-full flex flex-col">
    <!-- Header -->
    <div class="flex-shrink-0 p-4 border-b border-gray-200">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-900">
          Timeline
        </h3>
        
        <div class="flex items-center space-x-2">
          <Button
            label="Limpar Tudo"
            icon="pi pi-trash"
            severity="danger"
            size="small"
            @click="clearTimeline"
          />
          <EDLExport compact />
          <Button
            label="Exportar Timeline"
            icon="pi pi-download"
            severity="success"
            size="small"
            @click="exportTimeline"
          />
          <Button
            label="Validar"
            icon="pi pi-check-circle"   
            size="small"
            @click="validateTimeline"
          />
        </div>
      </div>

      <!-- Timeline Controls -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-2">
            <label class="text-sm font-medium text-gray-700">
              Zoom:
            </label>
            <Slider
              v-model="zoomLevel"
              :min="0.1"
              :max="2"
              :step="0.1"
              class="w-24"
            />
            <span class="text-sm text-gray-600">
              {{ Math.round(zoomLevel * 100) }}%
            </span>
          </div>
          
          <div class="flex items-center space-x-2">
            <Button
              icon="pi pi-play"
              :severity="isPlaying ? 'success' : 'secondary'"
              size="small"
              @click="togglePlayback"
            />
            <Button
              icon="pi pi-pause"
              severity="secondary"
              size="small"
              @click="pausePlayback"
            />
            <Button
              icon="pi pi-stop"
              severity="secondary"
              size="small"
              @click="stopPlayback"
            />
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <Badge
            :value="`${timelineItems.length} itens`"
            severity="info"
          />
          <Badge
            :value="`${formatTime(totalDuration)}`"
            severity="success"
          />
        </div>
      </div>
    </div>

    <!-- Timeline Ruler -->
    <div class="flex-shrink-0 bg-gray-50 border-b border-gray-200">
      <div
        class="timeline-ruler relative h-8 overflow-x-auto"
        :style="{ width: `${timelineWidth}px` }"
      >
        <!-- Time markers -->
        <div
          v-for="marker in timeMarkers"
          :key="marker.time"
          class="absolute top-0 h-full border-l border-gray-300"
          :style="{ left: `${marker.position}px` }"
        >
          <span class="absolute top-1 left-1 text-xs text-gray-600">
            {{ formatTime(marker.time) }}
          </span>
        </div>
        
        <!-- Playhead -->
        <div
          class="absolute top-0 h-full w-0.5 bg-red-500 z-10 pointer-events-none"
          :style="{ left: `${playheadPosition}px` }"
        >
          <div class="absolute -top-1 -left-2 w-4 h-2 bg-red-500 rounded-sm" />
        </div>
      </div>
    </div>

    <!-- Timeline Tracks -->
    <div class="flex-1 overflow-auto">
      <div
        class="timeline-container relative"
        :style="{ width: `${timelineWidth}px`, minHeight: '400px' }"
      >
        <!-- Grid lines -->
        <div class="absolute inset-0 pointer-events-none">
          <div
            v-for="marker in timeMarkers"
            :key="`grid-${marker.time}`"
            class="absolute top-0 bottom-0 w-px bg-gray-200 opacity-50"
            :style="{ left: `${marker.position}px` }"
          />
        </div>

        <!-- Tracks -->
        <div
          v-for="track in tracks"
          :key="track.id"
          class="timeline-track relative border-b border-gray-200"
          :style="{ height: `${trackHeight}px` }"
        >
          <!-- Track Header -->
          <div class="absolute left-0 top-0 w-48 h-full bg-gray-100 border-r border-gray-200 flex items-center px-4 z-10">
            <div class="flex items-center space-x-3 w-full">
              <div
                class="w-4 h-4 rounded"
                :style="{ backgroundColor: track.color }"
              />
              <div class="flex-1 min-w-0">
                <h4 class="font-medium text-gray-900 truncate">
                  {{ track.name }}
                </h4>
                <p class="text-xs text-gray-600">
                  {{ track.type }}
                </p>
              </div>
              <Button
                icon="pi pi-cog"
                severity="secondary"
                text
                size="small"
                @click="editTrack(track)"
              />
            </div>
          </div>

          <!-- Track Content Area -->
          <div
            class="track-content ml-48 h-full relative"
            @drop="onDrop($event, track.id)"
            @dragover="onDragOver"
            @dragenter="onDragEnter"
            @dragleave="onDragLeave"
          >
            <!-- Timeline Items in Track -->
            <div
              v-for="item in getTrackItems(track.id)"
              :key="item.id"
              class="timeline-item absolute cursor-move"
              :class="{
                'border-red-500 bg-red-100': hasConflict(item),
                'border-blue-500 bg-blue-100': item.id === selectedItemId,
                'border-gray-300 bg-white': !hasConflict(item) && item.id !== selectedItemId
              }"
              :style="getItemStyle(item)"
              :draggable="true"
              @dragstart="onDragStart($event, item)"
              @click="selectItem(item)"
              @contextmenu.prevent="showItemContextMenu($event, item)"
            >
              <!-- Item Content -->
              <div class="p-2 h-full flex items-center space-x-2">
                <div
                  class="w-2 h-2 rounded-full flex-shrink-0"
                  :style="{ backgroundColor: getItemTypeColor(item.type) }"
                />
                <div class="flex-1 min-w-0">
                  <h5 class="text-xs font-medium text-gray-900 truncate">
                    {{ item.title }}
                  </h5>
                  <p class="text-xs text-gray-600">
                    {{ formatTime(item.startTime) }} - {{ formatTime(item.endTime) }}
                  </p>
                </div>
                
                <!-- Conflict Indicator -->
                <i
                  v-if="hasConflict(item)"
                  class="pi pi-exclamation-triangle text-red-500 text-xs"
                />
              </div>

              <!-- Resize Handles -->
              <div
                class="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize bg-transparent hover:bg-blue-500"
                @mousedown="startResize($event, item, 'left')"
              />
              <div
                class="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize bg-transparent hover:bg-blue-500"
                @mousedown="startResize($event, item, 'right')"
              />
            </div>
          </div>
        </div>

        <!-- Drop Zone Indicator -->
        <div
          v-if="showDropZone"
          class="absolute border-2 border-dashed border-blue-500 bg-blue-100 rounded opacity-50 pointer-events-none"
          :style="dropZoneStyle"
        />
      </div>
    </div>

    <!-- Context Menu -->
    <ContextMenu
      ref="contextMenu"
      :model="contextMenuItems"
    />

    <!-- Item Details Dialog -->
    <Dialog
      :visible="showItemDialog"
      :modal="true"
      :closable="true"
      header="Detalhes do Item"
      class="w-full max-w-md"
      @update:visible="showItemDialog = $event"
    >
      <div
        v-if="selectedItem"
        class="space-y-4"
      >
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Título
          </label>
          <InputText
            v-model="itemForm.title"
            placeholder="Título do item"
            class="w-full"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Início
            </label>
            <InputNumber
              v-model="itemForm.startTime"
              :min="0"
              :max="totalDuration"
              :step="0.1"
              suffix=" s"
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Fim
            </label>
            <InputNumber
              v-model="itemForm.endTime"
              :min="itemForm.startTime + 0.1"
              :max="totalDuration"
              :step="0.1"
              suffix=" s"
              class="w-full"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Tipo
          </label>
          <Dropdown
            v-model="itemForm.type"
            :options="itemTypeOptions"
            option-label="label"
            option-value="value"
            placeholder="Selecionar tipo"
            class="w-full"
          />
        </div>

        <!-- Conflict Warning -->
        <div
          v-if="hasConflict(selectedItem)"
          class="p-3 bg-red-100 border border-red-300 rounded-lg"
        >
          <div class="flex items-center space-x-2">
            <i class="pi pi-exclamation-triangle text-red-500" />
            <span class="text-sm text-red-700">
              Este item possui conflitos de sobreposição
            </span>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between">
          <Button
            label="Excluir"
            icon="pi pi-trash"
            severity="danger"
            @click="deleteItem"
          />
          <div class="flex space-x-2">
            <Button
              label="Cancelar"
              severity="secondary"
              @click="showItemDialog = false"
            />
            <Button
              label="Salvar"
              @click="saveItem"
            />
          </div>
        </div>
      </template>
    </Dialog>

    <!-- Validation Results Dialog -->
    <Dialog
      :visible="showValidationDialog"
      :modal="true"
      :closable="true"
      header="Resultados da Validação"
      class="w-full max-w-2xl"
      @update:visible="showValidationDialog = $event"
    >
      <div
        v-if="validationResults"
        class="space-y-4"
      >
        <!-- Summary -->
        <div class="grid grid-cols-3 gap-4">
          <div class="text-center p-4 bg-green-100 rounded-lg">
            <div class="text-2xl font-bold text-green-600">
              {{ validationResults.valid }}
            </div>
            <div class="text-sm text-green-700">
              Válidos
            </div>
          </div>
          <div class="text-center p-4 bg-red-100 rounded-lg">
            <div class="text-2xl font-bold text-red-600">
              {{ validationResults.conflicts }}
            </div>
            <div class="text-sm text-red-700">
              Conflitos
            </div>
          </div>
          <div class="text-center p-4 bg-yellow-100 rounded-lg">
            <div class="text-2xl font-bold text-yellow-600">
              {{ validationResults.gaps }}
            </div>
            <div class="text-sm text-yellow-700">
              Lacunas
            </div>
          </div>
        </div>

        <!-- Issues List -->
        <div
          v-if="validationResults.issues.length > 0"
          class="space-y-2"
        >
          <h4 class="font-medium text-gray-900">
            Problemas Encontrados:
          </h4>
          <div
            v-for="issue in validationResults.issues"
            :key="issue.id"
            class="p-3 border border-gray-200 rounded-lg"
          >
            <div class="flex items-start space-x-3">
              <i
                class="pi mt-1"
                :class="{
                  'pi-exclamation-triangle text-red-500': issue.type === 'conflict',
                  'pi-info-circle text-yellow-500': issue.type === 'gap',
                  'pi-check-circle text-green-500': issue.type === 'valid'
                }"
              />
              <div>
                <h5 class="font-medium text-gray-900">
                  {{ issue.title }}
                </h5>
                <p class="text-sm text-gray-600">
                  {{ issue.description }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ formatTime(issue.startTime) }} - {{ formatTime(issue.endTime) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end space-x-2">
          <Button
            label="Corrigir Automaticamente"
            icon="pi pi-wrench"
            severity="warning"
            @click="autoFix"
          />
          <Button
            label="Fechar"
            @click="showValidationDialog = false"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Button from 'primevue/button'
import Badge from 'primevue/badge'
import Slider from 'primevue/slider'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import ContextMenu from 'primevue/contextmenu'
import EDLExport from './EDLExport.vue'
import { useToastStore } from '../../../app/stores'
import type { TimelineTrack as BaseTimelineTrack, TimelineItem as BaseTimelineItem } from '../../../shared/types'

// Extended types for timeline UI
interface TimelineTrack extends BaseTimelineTrack {
  name: string
  color: string
  order: number
}

interface TimelineItem extends BaseTimelineItem {
  title: string
  endTime: number
}

// Props
const props = defineProps<{
  segments?: Array<{
    id: string
    startTime: number
    endTime: number
    title?: string
    type?: string
  }>
}>()

// Emits
const emit = defineEmits<{
  'item-added': [item: TimelineItem]
  'item-updated': [item: TimelineItem]
  'item-deleted': [itemId: string]
  'timeline-validated': [results: any]
}>()

const toastStore = useToastStore()

// State
const zoomLevel = ref(1)
const isPlaying = ref(false)
const currentTime = ref(0)
const totalDuration = ref(300) // 5 minutes default
const trackHeight = 80
const selectedItemId = ref<string | null>(null)
const selectedItem = ref<TimelineItem | null>(null)

// Dialog states
const showItemDialog = ref(false)
const showValidationDialog = ref(false)
const showDropZone = ref(false)

// Drag & Drop
const draggedItem = ref<TimelineItem | null>(null)
const dropZoneStyle = ref({})

// Context Menu
const contextMenu = ref()
const contextMenuItems = ref([
  {
    label: 'Editar',
    icon: 'pi pi-pencil',
    command: () => editSelectedItem()
  },
  {
    label: 'Duplicar',
    icon: 'pi pi-copy',
    command: () => duplicateSelectedItem()
  },
  {
    label: 'Excluir',
    icon: 'pi pi-trash',
    command: () => deleteSelectedItem()
  }
])

// Form data
const itemForm = ref({
  title: '',
  startTime: 0,
  endTime: 0,
  type: 'segment'
})

const itemTypeOptions = [
  { label: 'Segmento de Vídeo', value: 'segment' },
  { label: 'Áudio', value: 'audio' },
  { label: 'Texto', value: 'text' },
  { label: 'Transição', value: 'transition' },
  { label: 'Efeito', value: 'effect' }
]

// Mock data
const tracks = ref<TimelineTrack[]>([
  {
    id: 'video-1',
    name: 'Vídeo Principal',
    type: 'video',
    color: '#3b82f6',
    order: 0,
    items: [],
    locked: false,
    visible: true
  },
  {
    id: 'audio-1', 
    name: 'Áudio/Narração',
    type: 'audio',
    color: '#10b981',
    order: 1,
    items: [],
    locked: false,
    visible: true
  },
  {
    id: 'text-1',
    name: 'Texto/Legendas',
    type: 'voice',
    color: '#f59e0b',
    order: 2,
    items: [],
    locked: false,
    visible: true
  },
  {
    id: 'effects-1',
    name: 'Efeitos',
    type: 'voice',
    color: '#8b5cf6',
    order: 3,
    items: [],
    locked: false,
    visible: true
  }
])

const timelineItems = ref<TimelineItem[]>([])
const validationResults = ref<any>(null)

// Computed
const timelineWidth = computed(() => {
  return Math.max(1200, totalDuration.value * zoomLevel.value * 10)
})

const timeMarkers = computed(() => {
  const markers = []
  const interval = Math.max(1, Math.floor(10 / zoomLevel.value))
  
  for (let time = 0; time <= totalDuration.value; time += interval) {
    markers.push({
      time,
      position: time * zoomLevel.value * 10
    })
  }
  
  return markers
})

const playheadPosition = computed(() => {
  return currentTime.value * zoomLevel.value * 10
})

// Methods
const getTrackItems = (trackId: string) => {
  return timelineItems.value.filter(item => item.trackId === trackId)
}

const getItemStyle = (item: TimelineItem) => {
  const left = item.startTime * zoomLevel.value * 10
  const width = (item.endTime - item.startTime) * zoomLevel.value * 10
  const top = 10
  const height = trackHeight - 20
  
  return {
    left: `${left}px`,
    width: `${width}px`,
    top: `${top}px`,
    height: `${height}px`,
    border: '2px solid',
    borderRadius: '4px'
  }
}

const getItemTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    segment: '#3b82f6',
    audio: '#10b981',
    text: '#f59e0b',
    transition: '#ef4444',
    effect: '#8b5cf6'
  }
  return colors[type] || '#6b7280'
}

const hasConflict = (item: TimelineItem) => {
  return timelineItems.value.some(other => 
    other.id !== item.id &&
    other.trackId === item.trackId &&
    !(other.endTime <= item.startTime || other.startTime >= item.endTime)
  )
}

const selectItem = (item: TimelineItem) => {
  selectedItemId.value = item.id
  selectedItem.value = item
}

const showItemContextMenu = (event: any, item: TimelineItem) => {
  selectItem(item)
  if (contextMenu.value && contextMenu.value.show) {
    contextMenu.value.show(event)
  }
}

// Drag & Drop handlers
const onDragStart = (event: any, item: TimelineItem) => {
  draggedItem.value = item
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', item.id)
  }
}

const onDragOver = (event: any) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const onDragEnter = (event: any) => {
  event.preventDefault()
  showDropZone.value = true
}

const onDragLeave = (event: any) => {
  event.preventDefault()
  showDropZone.value = false
}

const onDrop = (event: any, trackId: string) => {
  event.preventDefault()
  showDropZone.value = false
  
  if (!draggedItem.value) return
  
  // Mock position calculation
  const newStartTime = Math.max(0, Math.random() * 100)
  const duration = draggedItem.value.endTime - draggedItem.value.startTime
  
  // Update item position
  draggedItem.value.startTime = newStartTime
  draggedItem.value.endTime = newStartTime + duration
  draggedItem.value.trackId = trackId
  
  // Check for conflicts
  if (hasConflict(draggedItem.value)) {
    toastStore.warning('Conflito Detectado', 'Item possui sobreposição com outros itens')
  }
  
  emit('item-updated', draggedItem.value)
  draggedItem.value = null
}

// Playback controls
const togglePlayback = () => {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    startPlayback()
  }
}

const pausePlayback = () => {
  isPlaying.value = false
}

const stopPlayback = () => {
  isPlaying.value = false
  currentTime.value = 0
}

const startPlayback = () => {
  // Mock playback - simplified
  toastStore.info('Playback', 'Timeline playback iniciado')
}

// Timeline management
const clearTimeline = () => {
  timelineItems.value = []
  toastStore.success('Timeline Limpa', 'Todos os itens foram removidos da timeline')
}

const exportTimeline = () => {
  // Mock export
  toastStore.success('Timeline Exportada', 'Arquivo JSON salvo com sucesso')
}

const validateTimeline = () => {
  const conflicts: any[] = []
  const gaps: any[] = []
  let validCount = 0
  
  // Check for conflicts
  timelineItems.value.forEach(item => {
    const conflictItems = timelineItems.value.filter(other =>
      other.id !== item.id &&
      other.trackId === item.trackId &&
      !(other.endTime <= item.startTime || other.startTime >= item.endTime)
    )
    
    if (conflictItems.length > 0) {
      conflicts.push({
        id: item.id,
        type: 'conflict',
        title: `Conflito: ${item.title}`,
        description: `Sobrepõe com ${conflictItems.length} item(s)`,
        startTime: item.startTime,
        endTime: item.endTime
      })
    } else {
      validCount++
    }
  })
  
  // Check for gaps (simplified)
  tracks.value.forEach(track => {
    const trackItems = getTrackItems(track.id).sort((a, b) => a.startTime - b.startTime)
    
    for (let i = 0; i < trackItems.length - 1; i++) {
      const current = trackItems[i]
      const next = trackItems[i + 1]
      
      if (next && current && next.startTime > current.endTime + 1) { // Gap larger than 1 second
        gaps.push({
          id: `gap-${i}`,
          type: 'gap',
          title: `Lacuna em ${track.name}`,
          description: `Espaço de ${(next.startTime - current.endTime).toFixed(1)}s`,
          startTime: current.endTime,
          endTime: next.startTime
        })
      }
    }
  })
  
  validationResults.value = {
    valid: validCount,
    conflicts: conflicts.length,
    gaps: gaps.length,
    issues: [...conflicts, ...gaps]
  }
  
  showValidationDialog.value = true
  emit('timeline-validated', validationResults.value)
  
  toastStore.info('Validação Completa', `${conflicts.length} conflitos e ${gaps.length} lacunas encontradas`)
}

const autoFix = () => {
  // Simple auto-fix: resolve conflicts by moving items
  const conflictItems = timelineItems.value.filter(item => hasConflict(item))
  
  conflictItems.forEach(item => {
    const trackItems = getTrackItems(item.trackId)
      .filter(other => other.id !== item.id)
      .sort((a, b) => a.startTime - b.startTime)
    
    let newStartTime = item.startTime
    const duration = item.endTime - item.startTime
    
    // Find next available slot
    for (const other of trackItems) {
      if (newStartTime + duration > other.startTime && newStartTime < other.endTime) {
        newStartTime = other.endTime
      }
    }
    
    item.startTime = newStartTime
    item.endTime = newStartTime + duration
  })
  
  showValidationDialog.value = false
  toastStore.success('Correção Automática', `${conflictItems.length} conflitos resolvidos`)
}

// Item management
const editSelectedItem = () => {
  if (!selectedItem.value) return
  
  itemForm.value = {
    title: selectedItem.value.title,
    startTime: selectedItem.value.startTime,
    endTime: selectedItem.value.endTime,
    type: selectedItem.value.type
  }
  
  showItemDialog.value = true
}

const duplicateSelectedItem = () => {
  if (!selectedItem.value) return
  
  const newItem: TimelineItem = {
    ...selectedItem.value,
    id: Date.now().toString(),
    startTime: selectedItem.value.endTime,
    endTime: selectedItem.value.endTime + (selectedItem.value.endTime - selectedItem.value.startTime),
    title: `${selectedItem.value.title} (Cópia)`
  }
  
  timelineItems.value.push(newItem)
  emit('item-added', newItem)
  
  toastStore.success('Item Duplicado', 'Item copiado para a timeline')
}

const deleteSelectedItem = () => {
  if (!selectedItem.value) return
  
  const index = timelineItems.value.findIndex(item => item.id === selectedItem.value!.id)
  if (index !== -1) {
    timelineItems.value.splice(index, 1)
    emit('item-deleted', selectedItem.value.id)
    selectedItem.value = null
    selectedItemId.value = null
    toastStore.success('Item Removido', 'Item removido da timeline')
  }
}

const deleteItem = () => {
  deleteSelectedItem()
  showItemDialog.value = false
}

const saveItem = () => {
  if (!selectedItem.value) return
  
  selectedItem.value.title = itemForm.value.title
  selectedItem.value.startTime = itemForm.value.startTime
  selectedItem.value.endTime = itemForm.value.endTime
  selectedItem.value.type = itemForm.value.type as 'clip' | 'voice' | 'transition'
  
  emit('item-updated', selectedItem.value)
  showItemDialog.value = false
  
  toastStore.success('Item Atualizado', 'Alterações salvas com sucesso')
}

const editTrack = (track: TimelineTrack) => {
  toastStore.info('Editar Track', `Configurações da track ${track.name}`)
}

// Resize functionality
const startResize = (_event: any, item: TimelineItem, direction: 'left' | 'right') => {
  // Mock resize
  toastStore.info('Redimensionar', `Redimensionando item ${direction === 'left' ? 'pela esquerda' : 'pela direita'}`)
  emit('item-updated', item)
}

// Initialize with segments from props
const initializeFromSegments = () => {
  if (props.segments && props.segments.length > 0) {
    props.segments.forEach((segment, index) => {
      const item: TimelineItem = {
        id: segment.id,
        title: segment.title || `Segmento ${index + 1}`,
        startTime: segment.startTime,
        endTime: segment.endTime,
        duration: segment.endTime - segment.startTime,
        type: 'clip',
        trackId: 'video-1'
      }
      
      timelineItems.value.push(item)
    })
    
    // Update total duration based on segments
    const maxEndTime = Math.max(...props.segments.map(s => s.endTime))
    if (maxEndTime > totalDuration.value) {
      totalDuration.value = Math.ceil(maxEndTime + 30) // Add 30s buffer
    }
  }
}

// Utility functions
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// Lifecycle
onMounted(() => {
  initializeFromSegments()
})

onUnmounted(() => {
  isPlaying.value = false
})
</script>

<style scoped>
.timeline-panel {
  background: #ffffff;
}



.timeline-ruler {
  background: linear-gradient(to right, transparent 0%, transparent 50%, rgba(0, 0, 0, 0.05) 50%, rgba(0, 0, 0, 0.05) 100%);
  background-size: 20px 100%;
}

.timeline-container {
  background: repeating-linear-gradient(
    to right,
    transparent,
    transparent 19px,
    rgba(0, 0, 0, 0.1) 19px,
    rgba(0, 0, 0, 0.1) 20px
  );
}

.timeline-track {
  transition: background-color 0.2s ease;
}

.timeline-track:hover {
  background-color: rgba(0, 0, 0, 0.02);
}



.timeline-item {
  transition: all 0.2s ease;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.timeline-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.track-content {
  min-height: 80px;
  position: relative;
}

.track-content.drag-over {
  background-color: rgba(59, 130, 246, 0.1);
}

/* Custom scrollbar */
.overflow-auto::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}






</style>

