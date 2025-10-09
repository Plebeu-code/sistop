<template>
  <div class="search-panel h-full flex flex-col">
    <!-- Header -->
    <div class="flex-shrink-0 p-4 border-b border-gray-200">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        Painel de Pesquisa
      </h3>
      
      <!-- Search Input -->
      <div class="relative mb-4">
        <i class="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <InputText
          v-model="searchQuery"
          placeholder="Buscar no acervo..."
          class="w-full pl-10"
          @input="onSearchInput"
        />
      </div>

      <!-- Filters -->
      <div class="space-y-3">
        <!-- Tags Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <MultiSelect
            v-model="selectedTags"
            :options="availableTags"
            placeholder="Selecionar tags"
            class="w-full"
            :max-selected-labels="2"
            @change="onFiltersChange"
          />
        </div>

        <!-- Classification Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Classificação
          </label>
          <Dropdown
            v-model="selectedClassification"
            :options="classificationOptions"
            placeholder="Todas as classificações"
            class="w-full"
            show-clear
            @change="onFiltersChange"
          />
        </div>

        <!-- Duration Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Duração
          </label>
          <div class="flex space-x-2">
            <InputNumber
              v-model="durationMin"
              placeholder="Min (s)"
              class="flex-1"
              :min="0"
              @blur="onFiltersChange"
            />
            <InputNumber
              v-model="durationMax"
              placeholder="Max (s)"
              class="flex-1"
              :min="0"
              @blur="onFiltersChange"
            />
          </div>
        </div>

        <!-- Supplier Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Fornecedor
          </label>
          <Dropdown
            v-model="selectedSupplier"
            :options="supplierOptions"
            placeholder="Todos os fornecedores"
            class="w-full"
            show-clear
            @change="onFiltersChange"
          />
        </div>

        <!-- Asset Type Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Tipo
          </label>
          <Dropdown
            v-model="selectedType"
            :options="typeOptions"
            placeholder="Todos os tipos"
            class="w-full"
            show-clear
            @change="onFiltersChange"
          />
        </div>
      </div>

      <!-- Clear Filters -->
      <Button
        label="Limpar Filtros"
        icon="pi pi-filter-slash"
        severity="secondary"
        size="small"
        class="w-full mt-3"
        @click="clearFilters"
      />
    </div>

    <!-- Results -->
    <div class="flex-1 overflow-hidden">
      <div class="h-full overflow-y-auto p-4">
        <div
          v-if="loading"
          class="text-center py-8"
        >
          <ProgressSpinner size="30px" />
          <p class="text-gray-600 mt-2">
            Pesquisando...
          </p>
        </div>

        <div
          v-else-if="filteredAssets.length === 0"
          class="text-center py-8"
        >
          <i class="pi pi-search text-3xl text-gray-400 mb-3" />
          <p class="text-gray-600">
            Nenhum asset encontrado
          </p>
        </div>

        <div
          v-else
          class="space-y-3"
        >
          <div
            v-for="asset in filteredAssets"
            :key="asset.id"
            class="search-result-card"
            @mouseenter="showPreview(asset, $event)"
            @mouseleave="hidePreview"
            @click="selectAsset(asset)"
          >
            <div class="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <!-- Thumbnail -->
              <div class="w-16 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                <i
                  class="text-lg"
                  :class="getAssetIcon(asset.type)"
                />
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <h4 class="font-medium text-gray-900 truncate">
                  {{ asset.title || asset.originalName }}
                </h4>
                
                <p class="text-sm text-gray-600 line-clamp-2 mt-1">
                  {{ asset.description || 'Sem descrição' }}
                </p>

                <!-- Metadata -->
                <div class="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                  <span v-if="asset.duration">
                    {{ formatDuration(asset.duration) }}
                  </span>
                  <span v-if="asset.supplier">
                    {{ asset.supplier }}
                  </span>
                  <span>{{ asset.type.toUpperCase() }}</span>
                </div>

                <!-- Tags -->
                <div class="flex flex-wrap gap-1 mt-2">
                  <Tag
                    v-for="tag in asset.tags.slice(0, 3)"
                    :key="tag"
                    :value="tag"
                    severity="secondary"
                    class="text-xs"
                  />
                  <span
                    v-if="asset.tags.length > 3"
                    class="text-xs text-gray-500"
                  >
                    +{{ asset.tags.length - 3 }}
                  </span>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex-shrink-0">
                <Button
                  icon="pi pi-plus"
                  size="small"
                  severity="primary"
                  @click.stop="addToRoteiro(asset)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview Tooltip -->
    <div
      v-if="previewAsset"
      ref="previewTooltip"
      class="preview-tooltip"
      :style="tooltipStyle"
    >
      <div class="bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm">
        <!-- Preview Content -->
        <div class="aspect-video bg-gray-200 rounded mb-3 flex items-center justify-center">
          <i
            class="text-2xl text-gray-500"
            :class="getAssetIcon(previewAsset.type)"
          />
        </div>

        <h4 class="font-medium text-gray-900 mb-2">
          {{ previewAsset.title || previewAsset.originalName }}
        </h4>

        <div class="space-y-2 text-sm text-gray-600">
          <div
            v-if="previewAsset.duration"
            class="flex justify-between"
          >
            <span>Duração:</span>
            <span>{{ formatDuration(previewAsset.duration) }}</span>
          </div>
          
          <div
            v-if="previewAsset.dimensions"
            class="flex justify-between"
          >
            <span>Resolução:</span>
            <span>{{ previewAsset.dimensions.width }}x{{ previewAsset.dimensions.height }}</span>
          </div>
          
          <div class="flex justify-between">
            <span>Tamanho:</span>
            <span>{{ formatFileSize(previewAsset.size) }}</span>
          </div>
          
          <div
            v-if="previewAsset.supplier"
            class="flex justify-between"
          >
            <span>Fornecedor:</span>
            <span>{{ previewAsset.supplier }}</span>
          </div>
          
          <div
            v-if="previewAsset.license"
            class="flex justify-between"
          >
            <span>Licença:</span>
            <span class="capitalize">{{ previewAsset.license.replace('_', ' ') }}</span>
          </div>
          
          <div class="flex justify-between">
            <span>Criado:</span>
            <span>{{ formatDate(previewAsset.createdAt) }}</span>
          </div>
        </div>

        <!-- Full tags -->
        <div
          v-if="previewAsset.tags.length > 0"
          class="mt-3"
        >
          <p class="text-xs font-medium text-gray-700 mb-1">
            Tags:
          </p>
          <div class="flex flex-wrap gap-1">
            <Tag
              v-for="tag in previewAsset.tags"
              :key="tag"
              :value="tag"
              severity="secondary"
              class="text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import MultiSelect from 'primevue/multiselect'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import ProgressSpinner from 'primevue/progressspinner'
import { useAssetStore } from '../../../app/stores'
import type { Asset, SearchFilter } from '../../../shared/types'

const emit = defineEmits<{
  'select-asset': [asset: Asset]
  'add-to-roteiro': [asset: Asset]
}>()

const assetStore = useAssetStore()

// State
const searchQuery = ref('')
const selectedTags = ref<string[]>([])
const selectedClassification = ref<string | null>(null)
const durationMin = ref<number | null>(null)
const durationMax = ref<number | null>(null)
const selectedSupplier = ref<string | null>(null)
const selectedType = ref<string | null>(null)
const loading = ref(false)
const previewAsset = ref<Asset | null>(null)
const previewTooltip = ref<HTMLElement>()
const tooltipStyle = ref<Record<string, string>>({})

// Search debounce
let searchTimeout: any

// Computed
const searchFilter = computed((): SearchFilter => ({
  query: searchQuery.value || undefined,
  tags: selectedTags.value.length > 0 ? selectedTags.value : undefined,
  category: selectedClassification.value || undefined,
  duration: (durationMin.value !== null || durationMax.value !== null) ? {
    min: durationMin.value || undefined,
    max: durationMax.value || undefined
  } : undefined,
  supplier: selectedSupplier.value || undefined,
  type: selectedType.value as any || undefined,
  classification: selectedClassification.value || undefined
}))

const filteredAssets = computed(() => {
  let assets = assetStore.assets.filter(asset => 
    asset.status === 'approved' && (asset.type === 'video' || asset.type === 'audio')
  )

  const filter = searchFilter.value

  // Text search
  if (filter.query) {
    const query = filter.query.toLowerCase()
    assets = assets.filter(asset =>
      asset.title?.toLowerCase().includes(query) ||
      asset.originalName.toLowerCase().includes(query) ||
      asset.description?.toLowerCase().includes(query) ||
      asset.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  // Tags filter
  if (filter.tags && filter.tags.length > 0) {
    assets = assets.filter(asset =>
      filter.tags!.some(tag => asset.tags.includes(tag))
    )
  }

  // Classification filter
  if (filter.classification) {
    assets = assets.filter(asset => asset.category === filter.classification)
  }

  // Duration filter
  if (filter.duration) {
    assets = assets.filter(asset => {
      if (!asset.duration) return false
      if (filter.duration!.min && asset.duration < filter.duration!.min) return false
      if (filter.duration!.max && asset.duration > filter.duration!.max) return false
      return true
    })
  }

  // Supplier filter
  if (filter.supplier) {
    assets = assets.filter(asset => asset.supplier === filter.supplier)
  }

  // Type filter
  if (filter.type) {
    assets = assets.filter(asset => asset.type === filter.type)
  }

  return assets.slice(0, 50) // Limit results
})

const availableTags = computed(() => {
  const tags = new Set<string>()
  assetStore.assets.forEach(asset => {
    asset.tags.forEach(tag => tags.add(tag))
  })
  return Array.from(tags).sort()
})

const classificationOptions = computed(() => {
  const categories = new Set<string>()
  assetStore.assets.forEach(asset => {
    if (asset.category) categories.add(asset.category)
  })
  return Array.from(categories).sort()
})

const supplierOptions = computed(() => {
  const suppliers = new Set<string>()
  assetStore.assets.forEach(asset => {
    if (asset.supplier) suppliers.add(asset.supplier)
  })
  return Array.from(suppliers).sort()
})

const typeOptions = [
  { label: 'Vídeo', value: 'video' },
  { label: 'Áudio', value: 'audio' },
  { label: 'Imagem', value: 'image' },
  { label: 'Documento', value: 'document' }
]

// Methods
const onSearchInput = () => {
  clearTimeout(searchTimeout)
  loading.value = true
  
  searchTimeout = setTimeout(() => {
    loading.value = false
  }, 300)
}

const onFiltersChange = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 200)
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedTags.value = []
  selectedClassification.value = null
  durationMin.value = null
  durationMax.value = null
  selectedSupplier.value = null
  selectedType.value = null
}

const selectAsset = (asset: Asset) => {
  emit('select-asset', asset)
}

const addToRoteiro = (asset: Asset) => {
  emit('add-to-roteiro', asset)
}

const showPreview = async (asset: Asset, event: MouseEvent) => {
  previewAsset.value = asset
  
  await nextTick()
  
  if (previewTooltip.value) {
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    const tooltipRect = previewTooltip.value.getBoundingClientRect()
    
    let left = rect.right + 10
    let top = rect.top
    
    // Adjust if tooltip goes off screen
    if (left + tooltipRect.width > window.innerWidth) {
      left = rect.left - tooltipRect.width - 10
    }
    
    if (top + tooltipRect.height > window.innerHeight) {
      top = window.innerHeight - tooltipRect.height - 10
    }
    
    tooltipStyle.value = {
      position: 'fixed',
      left: `${left}px`,
      top: `${top}px`,
      zIndex: '1000'
    }
  }
}

const hidePreview = () => {
  previewAsset.value = null
}

const getAssetIcon = (type: string): string => {
  const icons: Record<string, string> = {
    video: 'pi pi-video',
    audio: 'pi pi-volume-up',
    image: 'pi pi-image',
    document: 'pi pi-file'
  }
  return icons[type] || 'pi pi-file'
}

const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSecs = Math.floor(seconds % 60)
  return `${minutes}m ${remainingSecs}s`
}

const formatFileSize = (bytes: number): string => {
  const sizes = ['B', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

// Lifecycle
onMounted(() => {
  // Initialize with some search if needed
})
</script>

<style scoped>
.search-panel {
  background: white;
}



.search-result-card {
  transition: all 0.2s ease;
}

.search-result-card:hover {
  transform: translateY(-1px);
}

.preview-tooltip {
  pointer-events: none;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

