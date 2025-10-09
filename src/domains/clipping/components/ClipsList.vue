<template>
  <div class="clips-list">
    <!-- Header -->
    <div class="flex justify-between items-center mb-4">
      <div class="flex items-center space-x-3">
        <h3 class="text-lg font-semibold text-gray-900">
          Lista de Clips
        </h3>
        <Badge
          :value="filteredClips.length.toString()"
          severity="info"
        />
        <Badge
          v-if="selectedAsset"
          :value="selectedAsset.title || selectedAsset.originalName"
          severity="secondary"
        />
      </div>

      <div class="flex items-center space-x-2">
        <Button
          icon="pi pi-plus"
          label="Novo Clip"
          size="small"
          :disabled="!selectedAsset"
          @click="$emit('create-clip')"
        />
        <Button
          icon="pi pi-refresh"
          severity="secondary"
          size="small"
          @click="refreshClips"
        />
      </div>
    </div>

    <!-- Filters -->
    <Card class="mb-4">
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Search -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <InputText
              v-model="filters.search"
              placeholder="Título, descrição ou tags..."
              class="w-full"
            />
          </div>

          <!-- Duration Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Duração
            </label>
            <div class="flex items-center space-x-2">
              <InputNumber
                v-model="filters.durationMin"
                placeholder="Min (s)"
                :min="0"
                :max="3600"
                class="flex-1"
              />
              <span class="text-gray-500">até</span>
              <InputNumber
                v-model="filters.durationMax"
                placeholder="Max (s)"
                :min="0"
                :max="3600"
                class="flex-1"
              />
            </div>
          </div>

          <!-- Tags Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <MultiSelect
              v-model="filters.tags"
              :options="availableTags"
              placeholder="Selecionar tags"
              class="w-full"
              display="chip"
              :max-selected-labels="3"
            />
          </div>
        </div>

        <div class="flex justify-between items-center mt-4">
          <Button
            label="Limpar Filtros"
            severity="secondary"
            size="small"
            @click="clearFilters"
          />
          
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-600">
              {{ filteredClips.length }} clip(s) encontrado(s)
            </span>
            <Dropdown
              v-model="sortBy"
              :options="sortOptions"
              option-label="label"
              option-value="value"
              placeholder="Ordenar por"
              class="w-40"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- Loading State -->
    <div
      v-if="clipStore.loading"
      class="flex justify-center items-center py-8"
    >
      <ProgressSpinner />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredClips.length === 0"
      class="text-center py-8"
    >
      <i class="pi pi-video text-4xl text-gray-400 mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">
        {{ selectedAsset ? 'Nenhum clip encontrado' : 'Selecione um asset' }}
      </h3>
      <p class="text-gray-600 mb-4">
        {{ selectedAsset 
          ? 'Use o player para criar clips marcando pontos de entrada e saída'
          : 'Escolha um asset de vídeo para visualizar e criar clips'
        }}
      </p>
      <Button
        v-if="selectedAsset"
        label="Criar Primeiro Clip"
        icon="pi pi-plus"
        @click="$emit('create-clip')"
      />
    </div>

    <!-- Clips Grid -->
    <div
      v-else
      class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
    >
      <Card
        v-for="clip in sortedClips"
        :key="clip.id"
        class="clip-card cursor-pointer transition-all hover:shadow-lg"
        @click="selectClip(clip)"
      >
        <template #header>
          <!-- Thumbnail -->
          <div class="relative">
            <img
              v-if="clip.thumbnailUrl"
              :src="clip.thumbnailUrl"
              :alt="clip.title"
              class="w-full h-32 object-cover"
            >
            <div
              v-else
              class="w-full h-32 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center"
            >
              <i class="pi pi-video text-2xl text-gray-500" />
            </div>

            <!-- Duration Badge -->
            <Badge
              :value="formatDuration(clip.duration)"
              class="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white"
            />

            <!-- Play Button Overlay -->
            <div class="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-30">
              <Button
                icon="pi pi-play"
                rounded
                severity="secondary"
                @click.stop="playClip(clip)"
              />
            </div>
          </div>
        </template>

        <template #content>
          <div class="p-4">
            <!-- Title -->
            <h4 class="font-semibold text-gray-900 mb-2 line-clamp-2">
              {{ clip.title }}
            </h4>

            <!-- Description -->
            <p
              v-if="clip.description"
              class="text-sm text-gray-600 mb-3 line-clamp-2"
            >
              {{ clip.description }}
            </p>

            <!-- Metadata -->
            <div class="space-y-2 text-xs text-gray-500">
              <div class="flex justify-between">
                <span>Entrada:</span>
                <span class="font-mono">{{ formatTime(clip.inPoint) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Saída:</span>
                <span class="font-mono">{{ formatTime(clip.outPoint) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Criado:</span>
                <span>{{ formatDate(clip.createdAt) }}</span>
              </div>
            </div>

            <!-- Tags -->
            <div
              v-if="clip.tags.length > 0"
              class="flex flex-wrap gap-1 mt-3"
            >
              <Badge
                v-for="tag in clip.tags.slice(0, 3)"
                :key="tag"
                :value="tag"
                severity="secondary"
                class="text-xs"
              />
              <Badge
                v-if="clip.tags.length > 3"
                :value="`+${clip.tags.length - 3}`"
                severity="info"
                class="text-xs"
              />
            </div>
          </div>
        </template>

        <template #footer>
          <div class="flex justify-between items-center p-4 pt-0">
            <div class="flex items-center space-x-1">
              <Button
                icon="pi pi-play"
                severity="success"
                size="small"
                text
                @click.stop="playClip(clip)"
              />
              <Button
                icon="pi pi-pencil"
                severity="info"
                size="small"
                text
                @click.stop="editClip(clip)"
              />
              <Button
                icon="pi pi-copy"
                severity="secondary"
                size="small"
                text
                @click.stop="duplicateClip(clip)"
              />
            </div>

            <div class="flex items-center space-x-1">
              <Button
                icon="pi pi-download"
                severity="help"
                size="small"
                text
                @click.stop="exportClip(clip)"
              />
              <Button
                icon="pi pi-trash"
                severity="danger"
                size="small"
                text
                @click.stop="confirmDelete(clip)"
              />
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog
      :visible="showDeleteDialog"
      :modal="true"
      :closable="true"
      header="Confirmar Exclusão"
      class="w-full max-w-md"
      @update:visible="showDeleteDialog = $event"
    >
      <div
        v-if="clipToDelete"
        class="mb-4"
      >
        <p class="text-gray-700 mb-3">
          Tem certeza que deseja excluir este clip?
        </p>
        <div class="p-3 bg-gray-50 rounded border-l-4 border-red-500">
          <div class="font-medium">
            {{ clipToDelete.title }}
          </div>
          <div class="text-sm text-gray-600">
            Duração: {{ formatDuration(clipToDelete.duration) }}
          </div>
        </div>
        <p class="text-sm text-red-600 mt-2">
          <i class="pi pi-exclamation-triangle mr-1" />
          Esta ação não pode ser desfeita.
        </p>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <Button
            label="Cancelar"
            severity="secondary"
            @click="showDeleteDialog = false"
          />
          <Button
            label="Excluir"
            severity="danger"
            :loading="clipStore.loading"
            @click="deleteClip"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import MultiSelect from 'primevue/multiselect'
import Dropdown from 'primevue/dropdown'
import Badge from 'primevue/badge'
import Dialog from 'primevue/dialog'
import ProgressSpinner from 'primevue/progressspinner'
import { useClipStore } from '../../../app/stores'
import type { Asset, Clip, ClipFilter } from '../../../shared/types'

const props = defineProps<{
  selectedAsset?: Asset | null
}>()

const emit = defineEmits<{
  'create-clip': []
  'edit-clip': [clip: Clip]
  'play-clip': [clip: Clip]
  'clip-selected': [clip: Clip]
}>()

const clipStore = useClipStore()

// Local state
const filters = ref<ClipFilter>({
  search: '',
  tags: [],
  durationMin: undefined,
  durationMax: undefined
})

const sortBy = ref('createdAt')
const showDeleteDialog = ref(false)
const clipToDelete = ref<Clip | null>(null)

// Sort options
const sortOptions = [
  { label: 'Mais Recente', value: 'createdAt' },
  { label: 'Título A-Z', value: 'title' },
  { label: 'Duração Menor', value: 'duration' },
  { label: 'Duração Maior', value: 'duration-desc' }
]

// Computed
const availableTags = computed(() => {
  const tags = new Set<string>()
  clipStore.clips.forEach((clip: Clip) => {
    clip.tags.forEach(tag => tags.add(tag))
  })
  return Array.from(tags).sort()
})

const filteredClips = computed(() => {
  const assetFilter = props.selectedAsset 
    ? { ...filters.value, assetId: props.selectedAsset.id }
    : filters.value

  return clipStore.getFilteredClips(assetFilter)
})

const sortedClips = computed(() => {
  const clips = [...filteredClips.value]
  
  switch (sortBy.value) {
    case 'title':
      return clips.sort((a, b) => a.title.localeCompare(b.title))
    case 'duration':
      return clips.sort((a, b) => a.duration - b.duration)
    case 'duration-desc':
      return clips.sort((a, b) => b.duration - a.duration)
    case 'createdAt':
    default:
      return clips.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
})

// Methods
const refreshClips = () => {
  // In a real app, this would fetch from API
  // For now it's just a placeholder
}

const clearFilters = () => {
  filters.value = {
    search: '',
    tags: [],
    durationMin: undefined,
    durationMax: undefined
  }
}

const selectClip = (clip: Clip) => {
  emit('clip-selected', clip)
}

const playClip = (clip: Clip) => {
  emit('play-clip', clip)
}

const editClip = (clip: Clip) => {
  emit('edit-clip', clip)
}

const duplicateClip = async (clip: Clip) => {
  await clipStore.duplicateClip(clip.id)
}

const exportClip = async (clip: Clip) => {
  await clipStore.exportClip(clip.id)
}

const confirmDelete = (clip: Clip) => {
  clipToDelete.value = clip
  showDeleteDialog.value = true
}

const deleteClip = async () => {
  if (clipToDelete.value) {
    const success = await clipStore.deleteClip(clipToDelete.value.id)
    if (success) {
      showDeleteDialog.value = false
      clipToDelete.value = null
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
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Watchers
watch(() => props.selectedAsset, () => {
  // Clear filters when asset changes
  clearFilters()
}, { immediate: true })
</script>

<style scoped>
.clip-card {
  transition: transform 0.2s ease-in-out;
}

.clip-card:hover {
  transform: translateY(-2px);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

