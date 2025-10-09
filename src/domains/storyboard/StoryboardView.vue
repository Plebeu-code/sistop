<template>
  <div class="storyboard-view">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">
          {{ $t('navigation.storyboard') }}
        </h1>
        <p class="text-gray-600 mt-1">
          Crie e gerencie storyboards usando clips reutilizáveis
        </p>
      </div>
      
      <div class="flex items-center space-x-3">
        <Button
          label="Novo Storyboard"
          icon="pi pi-plus"
          @click="createNewStoryboard"
        />
      </div>
    </div>

    <!-- Main Layout -->
    <div class="grid grid-cols-1 xl:grid-cols-4 gap-6">
      <!-- Storyboard Canvas - Takes 3/4 width -->
      <div class="xl:col-span-3">
        <Card>
          <template #header>
            <div class="flex justify-between items-center p-6 pb-0">
              <h2 class="text-xl font-semibold text-gray-900">
                Canvas do Storyboard
              </h2>
              <div class="flex items-center space-x-2">
                <Badge
                  v-if="currentStoryboard"
                  :value="`${storyboardItems.length} itens`"
                  severity="info"
                />
                <Button
                  icon="pi pi-save"
                  size="small"
                  :disabled="!currentStoryboard"
                  @click="saveStoryboard"
                />
              </div>
            </div>
          </template>

          <template #content>
            <div v-if="!currentStoryboard" class="text-center py-12">
              <i class="pi pi-video text-4xl text-gray-400 mb-4" />
              <h3 class="text-lg font-medium text-gray-900">
                Nenhum Storyboard Selecionado
              </h3>
              <p class="text-gray-600">
                Crie um novo storyboard ou selecione um existente para começar
              </p>
              <Button
                label="Criar Storyboard"
                icon="pi pi-plus"
                @click="createNewStoryboard"
              />
            </div>

            <div v-else class="space-y-4">
              <!-- Storyboard Timeline -->
              <div class="bg-gray-50">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="font-medium text-gray-900">
                    Timeline - {{ currentStoryboard.title }}
                  </h3>
                  <div class="text-sm text-gray-600">
                    Duração total: {{ formatDuration(totalDuration) }}
                  </div>
                </div>

                <!-- Timeline Items -->
                <div class="space-y-2">
                  <div
                    v-for="(item, index) in storyboardItems"
                    :key="item.id"
                    class="flex items-center space-x-3 p-3 bg-white"
                  >
                    <!-- Drag Handle -->
                    <div class="cursor-move text-gray-400">
                      <i class="pi pi-bars" />
                    </div>

                    <!-- Clip Info -->
                    <div class="flex-1">
                      <div class="flex items-center space-x-3">
                        <div class="w-16 h-12 bg-gray-200">
                          <i class="pi pi-video text-gray-500" />
                        </div>
                        <div>
                          <h4 class="font-medium text-gray-900">
                            {{ item.clip.title }}
                          </h4>
                          <p class="text-sm text-gray-600">
                            {{ formatDuration(item.clip.duration) }} | {{ item.clip.tags.join(', ') }}
                          </p>
                        </div>
                      </div>
                    </div>

                    <!-- Timeline Position -->
                    <div class="text-sm text-gray-600">
                      {{ formatTime(item.startTime) }} - {{ formatTime(item.endTime) }}
                    </div>

                    <!-- Actions -->
                    <div class="flex items-center space-x-2">
                      <Button
                        icon="pi pi-pencil"
                        size="small"
                        severity="secondary"
                        @click="editStoryboardItem(item)"
                      />
                      <Button
                        icon="pi pi-trash"
                        size="small"
                        severity="danger"
                        @click="removeFromStoryboard(index)"
                      />
                    </div>
                  </div>

                  <!-- Drop Zone -->
                  <div
                    class="border-2 border-dashed border-gray-300"
                    @drop="handleDrop"
                    @dragover.prevent
                    @dragenter.prevent
                  >
                    <i class="pi pi-cloud-upload text-2xl text-gray-400 mb-2" />
                    <p class="text-gray-600">
                      Arraste clips aqui para adicionar ao storyboard
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Clips Search Panel - Takes 1/4 width -->
      <div class="xl:col-span-1">
        <Card>
          <template #header>
            <div class="p-6 pb-0">
              <h2 class="text-xl font-semibold text-gray-900">
                Painel de Clips
              </h2>
              
              <!-- Search -->
              <div class="relative mb-4">
                <i class="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <InputText
                  v-model="clipSearch"
                  placeholder="Buscar clips..."
                  class="w-full pl-10"
                />
              </div>

              <!-- Filters -->
              <div class="flex items-center space-x-2 mb-4">
                <Dropdown
                  v-model="selectedAssetFilter"
                  :options="assetFilterOptions"
                  option-label="label"
                  option-value="value"
                  placeholder="Todos os Assets"
                  class="flex-1"
                  show-clear
                />
              </div>

              <!-- Tags Filter -->
              <div class="flex flex-wrap gap-1 mb-4">
                <Tag
                  v-for="tag in popularTags"
                  :key="tag"
                  :value="tag"
                  :severity="selectedTags.includes(tag) ? 'primary' : 'secondary'"
                  class="cursor-pointer text-xs"
                  @click="toggleTag(tag)"
                />
              </div>
            </div>
          </template>

          <template #content>
            <div class="p-0">
              <!-- Clips List -->
              <div v-if="filteredClips.length === 0" class="text-center py-8">
                <i class="pi pi-video text-3xl text-gray-400 mb-3" />
                <p class="text-gray-600">
                  Nenhum clip encontrado
                </p>
                <Button
                  label="Ir para Clipping"
                  icon="pi pi-external-link"
                  size="small"
                  class="mt-3"
                  @click="goToClipping"
                />
              </div>

              <div v-else class="space-y-2 max-h-96 overflow-y-auto">
                <div
                  v-for="clip in filteredClips"
                  :key="clip.id"
                  class="p-3 border border-gray-200"
                  draggable="true"
                  @dragstart="handleDragStart($event, clip)"
                  @click="previewClip(clip)"
                >
                  <div class="flex items-start space-x-3">
                    <div class="w-12 h-8 bg-gray-200">
                      <i class="pi pi-video text-xs text-gray-500" />
                    </div>
                    
                    <div class="flex-1 min-w-0">
                      <h4 class="font-medium text-sm text-gray-900">
                        {{ clip.title }}
                      </h4>
                      <p class="text-xs text-gray-600">
                        {{ formatDuration(clip.duration) }}
                      </p>
                      
                      <!-- Tags -->
                      <div class="flex flex-wrap gap-1 mt-1">
                        <Tag
                          v-for="tag in clip.tags.slice(0, 2)"
                          :key="tag"
                          :value="tag"
                          severity="secondary"
                          class="text-xs"
                        />
                        <span
                          v-if="clip.tags.length > 2"
                          class="text-xs text-gray-500"
                        >
                          +{{ clip.tags.length - 2 }}
                        </span>
                      </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex flex-col space-y-1">
                      <Button
                        icon="pi pi-plus"
                        size="small"
                        severity="primary"
                        @click.stop="addToStoryboard(clip)"
                      />
                      <Button
                        icon="pi pi-eye"
                        size="small"
                        severity="secondary"
                        @click.stop="previewClip(clip)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- Existing Storyboards -->
    <Card class="mt-6">
      <template #header>
        <div class="flex justify-between items-center p-6 pb-0">
          <h2 class="text-xl font-semibold text-gray-900">
            Storyboards Existentes
          </h2>
        </div>
      </template>

      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            v-for="storyboard in existingStoryboards"
            :key="storyboard.id"
            class="cursor-pointer transition-all hover:shadow-md border-2 hover:border-blue-500"
            @click="loadStoryboard(storyboard)"
          >
            <template #content>
              <div class="p-4">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="font-medium text-gray-900">
                    {{ storyboard.title }}
                  </h3>
                  <Badge
                    :value="`${storyboard.itemCount} itens`"
                    severity="info"
                  />
                </div>
                
                <p class="text-sm text-gray-600">
                  {{ storyboard.description }}
                </p>
                
                <div class="flex justify-between items-center text-xs text-gray-500">
                  <span>{{ formatDuration(storyboard.totalDuration) }}</span>
                  <span>{{ formatDate(storyboard.updatedAt) }}</span>
                </div>
              </div>
            </template>
          </Card>
        </div>
      </template>
    </Card>

    <!-- Clip Preview Dialog -->
    <Dialog
      :visible="showClipPreview"
      :modal="true"
      :closable="true"
      header="Preview do Clip"
      class="w-full max-w-2xl"
      @update:visible="showClipPreview = $event"
    >
      <div v-if="previewingClip" class="space-y-4">
        <div class="aspect-video bg-gray-200">
          <i class="pi pi-play text-4xl text-gray-500" />
        </div>
        
        <div>
          <h3 class="font-medium text-gray-900">
            {{ previewingClip.title }}
          </h3>
          <p class="text-sm text-gray-600">
            {{ previewingClip.description }}
          </p>
          
          <div class="flex items-center space-x-4 text-sm text-gray-600">
            <span>Duração: {{ formatDuration(previewingClip.duration) }}</span>
            <span>In: {{ formatTime(previewingClip.inPoint) }}</span>
            <span>Out: {{ formatTime(previewingClip.outPoint) }}</span>
          </div>
          
          <div class="flex flex-wrap gap-1 mt-3">
            <Tag
              v-for="tag in previewingClip.tags"
              :key="tag"
              :value="tag"
              severity="secondary"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end space-x-2">
          <Button
            label="Adicionar ao Storyboard"
            icon="pi pi-plus"
            @click="previewingClip && addToStoryboard(previewingClip); showClipPreview = false"
          />
          <Button
            label="Fechar"
            severity="secondary"
            @click="showClipPreview = false"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Badge from 'primevue/badge'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import { useAssetStore, useClipStore, useToastStore } from '../../app/stores'
import type { Clip } from '../../shared/types'

const router = useRouter()
const assetStore = useAssetStore()
const clipStore = useClipStore()
const toastStore = useToastStore()

// Storyboard types
interface StoryboardItem {
  id: string
  clip: Clip
  startTime: number
  endTime: number
  order: number
}

interface Storyboard {
  id: string
  title: string
  description: string
  items: StoryboardItem[]
  totalDuration: number
  itemCount: number
  createdAt: Date
  updatedAt: Date
}

// State
const currentStoryboard = ref<Storyboard | null>(null)
const storyboardItems = ref<StoryboardItem[]>([])
const clipSearch = ref('')
const selectedAssetFilter = ref<string | null>(null)
const selectedTags = ref<string[]>([])
const showClipPreview = ref(false)
const previewingClip = ref<Clip | null>(null)

// Mock existing storyboards
const existingStoryboards = ref<Storyboard[]>([
  {
    id: '1',
    title: 'Episódio 001 - Abertura',
    description: 'Storyboard da abertura do primeiro episódio',
    items: [],
    totalDuration: 120,
    itemCount: 5,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
  },
  {
    id: '2',
    title: 'Episódio 002 - Entrevista',
    description: 'Sequência da entrevista principal',
    items: [],
    totalDuration: 240,
    itemCount: 8,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60)
  }
])

// Computed
const totalDuration = computed(() => {
  return storyboardItems.value.reduce((total, item) => total + item.clip.duration, 0)
})

const filteredClips = computed(() => {
  let clips = clipStore.clips

  // Filter by search
  if (clipSearch.value) {
    const search = clipSearch.value.toLowerCase()
    clips = clips.filter((clip: Clip) => 
      clip.title.toLowerCase().includes(search) ||
      clip.description?.toLowerCase().includes(search) ||
      clip.tags.some((tag: string) => tag.toLowerCase().includes(search))
    )
  }

  // Filter by asset
  if (selectedAssetFilter.value) {
    clips = clips.filter((clip: Clip) => clip.assetId === selectedAssetFilter.value)
  }

  // Filter by tags
  if (selectedTags.value.length > 0) {
    clips = clips.filter((clip: Clip) => 
      selectedTags.value.some((tag: string) => clip.tags.includes(tag))
    )
  }

  return clips
})

const assetFilterOptions = computed(() => {
  const assets = assetStore.assets.filter((asset: any) => 
    asset.type === 'video' || asset.type === 'audio'
  )
  
  return assets.map((asset: any) => ({
    label: asset.title || asset.originalName,
    value: asset.id
  }))
})

const popularTags = computed(() => {
  const tagCounts: Record<string, number> = {}
  
  clipStore.clips.forEach((clip: Clip) => {
    clip.tags.forEach((tag: string) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    })
  })
  
  return Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([tag]) => tag)
})

// Methods
const createNewStoryboard = () => {
  const title = `Novo Storyboard ${existingStoryboards.value.length + 1}`
  
  currentStoryboard.value = {
    id: Date.now().toString(),
    title,
    description: 'Novo storyboard criado',
    items: [],
    totalDuration: 0,
    itemCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  storyboardItems.value = []
  
  toastStore.success('Sucesso', `Storyboard "${title}" criado com sucesso`)
}

const loadStoryboard = (storyboard: Storyboard) => {
  currentStoryboard.value = storyboard
  storyboardItems.value = storyboard.items
  
  toastStore.info('Storyboard Carregado', `"${storyboard.title}" carregado com ${storyboard.itemCount} itens`)
}

const saveStoryboard = () => {
  if (!currentStoryboard.value) return
  
  // Update storyboard data
  currentStoryboard.value.items = storyboardItems.value
  currentStoryboard.value.totalDuration = totalDuration.value
  currentStoryboard.value.itemCount = storyboardItems.value.length
  currentStoryboard.value.updatedAt = new Date()
  
  // Update in list if exists, otherwise add
  const existingIndex = existingStoryboards.value.findIndex(s => s.id === currentStoryboard.value!.id)
  if (existingIndex >= 0) {
    existingStoryboards.value[existingIndex] = { ...currentStoryboard.value }
  } else {
    existingStoryboards.value.push({ ...currentStoryboard.value })
  }
  
  toastStore.success('Salvo', `Storyboard "${currentStoryboard.value.title}" salvo com sucesso`)
}

const addToStoryboard = (clip: Clip) => {
  if (!currentStoryboard.value) {
    createNewStoryboard()
  }
  
  const startTime = storyboardItems.value.reduce((total, item) => total + item.clip.duration, 0)
  
  const newItem: StoryboardItem = {
    id: Date.now().toString(),
    clip,
    startTime,
    endTime: startTime + clip.duration,
    order: storyboardItems.value.length
  }
  
  storyboardItems.value.push(newItem)
  
  toastStore.success('Clip Adicionado', `"${clip.title}" adicionado ao storyboard`)
}

const removeFromStoryboard = (index: number) => {
  const item = storyboardItems.value[index]
  if (!item) return
  
  storyboardItems.value.splice(index, 1)
  
  // Recalculate times
  let currentTime = 0
  storyboardItems.value.forEach((item, idx) => {
    item.startTime = currentTime
    item.endTime = currentTime + item.clip.duration
    item.order = idx
    currentTime += item.clip.duration
  })
  
  toastStore.info('Clip Removido', `"${item.clip.title}" removido do storyboard`)
}

const editStoryboardItem = (item: StoryboardItem) => {
  // In a real app, this would open an edit dialog
  toastStore.info('Edição', `Editar "${item.clip.title}"`)
}

const previewClip = (clip: Clip) => {
  previewingClip.value = clip
  showClipPreview.value = true
}

const goToClipping = () => {
  router.push('/clipping')
}

const toggleTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag)
  if (index >= 0) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

// Drag and Drop
const handleDragStart = (event: DragEvent, clip: Clip) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/json', JSON.stringify(clip))
    event.dataTransfer.effectAllowed = 'copy'
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  
  if (event.dataTransfer) {
    try {
      const clipData = JSON.parse(event.dataTransfer.getData('application/json'))
      addToStoryboard(clipData)
    } catch (error) {
      console.error('Error parsing dropped data:', error)
    }
  }
}

// Utility functions
const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSecs = Math.floor(seconds % 60)
  return `${minutes}m ${remainingSecs}s`
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Lifecycle
onMounted(() => {
  // Load clips if not already loaded
  if (clipStore.clips.length === 0) {
    // In a real app, this would fetch from API
  }
})
</script>

<style scoped>
.storyboard-view {
  min-height: calc(100vh - 2rem);
}

/* Timeline styling */
.timeline-item {
  transition: all 0.2s ease;
}

.timeline-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Drag and drop styles */
.drag-over {
  border-color: #3b82f6 !important;
  background-color: #eff6ff;
}

/* Custom scrollbar */
.clips-scroll {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.clips-scroll::-webkit-scrollbar {
  width: 4px;
}

.clips-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.clips-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.clips-scroll::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>


