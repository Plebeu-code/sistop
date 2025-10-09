<template>
  <div class="curadoria-component">
    <!-- Filtros -->
    <Card class="mb-6">
      <template #title>
        <div class="flex items-center justify-between">
          <span>Filtros</span>
          <Button
            icon="pi pi-refresh"
            text
            size="small"
            @click="resetFilters"
          />
        </div>
      </template>
      
      <template #content>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Busca -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <InputText
              v-model="filters.search"
              placeholder="Título, filename, tags..."
              class="w-full"
            />
          </div>

          <!-- Tipo -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <MultiSelect
              v-model="filters.type"
              :options="typeOptions"
              option-label="label"
              option-value="value"
              placeholder="Todos os tipos"
              class="w-full"
            />
          </div>

          <!-- Status -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <MultiSelect
              v-model="filters.status"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="Todos os status"
              class="w-full"
            />
          </div>

          <!-- Fornecedor -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Fornecedor
            </label>
            <Dropdown
              v-model="filters.fornecedor"
              :options="assetStore.mockFornecedores"
              placeholder="Todos fornecedores"
              class="w-full"
              show-clear
            />
          </div>

          <!-- Tags -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <MultiSelect
              v-model="filters.tags"
              :options="assetStore.mockTags"
              placeholder="Selecionar tags"
              class="w-full"
              filter
            />
          </div>

          <!-- Duração -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Duração (min)
            </label>
            <div class="flex gap-2">
              <InputNumber
                v-model="filters.durationMin"
                placeholder="Min"
                :min="0"
                class="flex-1"
              />
              <InputNumber
                v-model="filters.durationMax"
                placeholder="Max"
                :min="0"
                class="flex-1"
              />
            </div>
          </div>

          <!-- Data -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Data de Upload
            </label>
            <div class="flex gap-2">
              <Calendar
                v-model="filters.dateFrom"
                placeholder="De"
                date-format="dd/mm/yy"
                class="flex-1"
                update-model-type="date"
              />
              <Calendar
                v-model="filters.dateTo"
                placeholder="Até"
                date-format="dd/mm/yy"
                class="flex-1"
                update-model-type="date"
              />
            </div>
          </div>

          <!-- Licença -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Licença
            </label>
            <MultiSelect
              v-model="filters.licenseType"
              :options="licenseOptions"
              option-label="label"
              option-value="value"
              placeholder="Todas licenças"
              class="w-full"
            />
          </div>
        </div>

        <div class="flex justify-between items-center mt-4 pt-4 border-t">
          <div class="text-sm text-gray-600">
            {{ filteredAssets.length }} de {{ assetStore.assets.length }} assets
          </div>
          <Button
            label="Limpar Filtros"
            icon="pi pi-filter-slash"
            severity="secondary"
            @click="clearFilters"
          />
        </div>
      </template>
    </Card>

    <!-- Tabela de Assets -->
    <Card>
      <template #title>
        <div class="flex items-center justify-between">
          <span>Assets para Curadoria</span>
          <div class="flex gap-2">
            <Button
              icon="pi pi-download"
              label="Exportar"
              size="small"
              severity="secondary"
              @click="exportAssets"
            />
            <Button
              icon="pi pi-refresh"
              :loading="assetStore.loading"
              @click="assetStore.fetchAssets()"
            />
          </div>
        </div>
      </template>

      <template #content>
        <DataTable
          :value="filteredAssets"
          :loading="assetStore.loading"
          paginator
          :rows="20"
          :rows-per-page-options="[10, 20, 50]"
          data-key="id"
          filter-display="row"
          :global-filter-fields="['title', 'filename', 'description']"
          responsive-layout="scroll"
          class="p-datatable-sm"
          @row-click="handleRowClick"
        >
          <!-- Preview Column -->
          <Column
            header="Preview"
            style="width: 80px"
          >
            <template #body="{ data }">
              <div
                class="preview-container w-16 h-12 bg-gray-100 rounded cursor-pointer flex items-center justify-center"
                @click="openPreview(data)"
              >
                <i
                  v-if="data.previewPath"
                  class="pi pi-eye text-blue-500"
                />
                <i
                  v-else
                  class="pi pi-image text-gray-400"
                />
              </div>
            </template>
          </Column>

          <!-- Filename -->
          <Column
            field="filename"
            header="Arquivo"
            sortable
            style="min-width: 200px"
          >
            <template #body="{ data }">
              <div>
                <div class="font-medium text-sm">
                  {{ data.title || data.originalName }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ data.filename }}
                </div>
              </div>
            </template>
          </Column>

          <!-- Type -->
          <Column
            field="type"
            header="Tipo"
            sortable
            style="width: 100px"
          >
            <template #body="{ data }">
              <Badge
                :value="getTypeLabel(data.type)"
                :severity="getTypeSeverity(data.type)"
              />
            </template>
          </Column>

          <!-- Status -->
          <Column
            field="status"
            header="Status"
            sortable
            style="width: 120px"
          >
            <template #body="{ data }">
              <Badge
                :value="getStatusLabel(data.status)"
                :severity="getStatusSeverity(data.status)"
              />
            </template>
          </Column>

          <!-- Size & Duration -->
          <Column
            header="Tamanho/Duração"
            style="width: 120px"
          >
            <template #body="{ data }">
              <div class="text-sm">
                <div>{{ formatBytes(data.size) }}</div>
                <div
                  v-if="data.duration"
                  class="text-xs text-gray-500"
                >
                  {{ formatDuration(data.duration) }}
                </div>
              </div>
            </template>
          </Column>

          <!-- Tags -->
          <Column
            header="Tags"
            style="min-width: 200px"
          >
            <template #body="{ data }">
              <div class="flex flex-wrap gap-1">
                <Badge
                  v-for="tag in data.tags.slice(0, 3)"
                  :key="tag"
                  :value="tag"
                  severity="secondary"
                  class="text-xs"
                />
                <Badge
                  v-if="data.tags.length > 3"
                  :value="`+${data.tags.length - 3}`"
                  severity="secondary"
                  class="text-xs"
                />
              </div>
            </template>
          </Column>

          <!-- Fornecedor -->
          <Column
            field="fornecedor"
            header="Fornecedor"
            sortable
            style="width: 120px"
          />

          <!-- Upload Info -->
          <Column
            header="Upload"
            style="width: 140px"
          >
            <template #body="{ data }">
              <div class="text-sm">
                <div>{{ data.uploadedBy.name }}</div>
                <div class="text-xs text-gray-500">
                  {{ formatDate(data.createdAt) }}
                </div>
              </div>
            </template>
          </Column>

          <!-- Actions -->
          <Column
            header="Ações"
            style="width: 150px"
          >
            <template #body="{ data }">
              <div class="flex gap-1">
                <Button
                  icon="pi pi-pencil"
                  size="small"
                  text
                  @click="editAsset(data)"
                />
                <Button
                  v-if="data.status === 'staging'"
                  icon="pi pi-check"
                  size="small"
                  severity="success"
                  text
                  @click="approveAsset(data)"
                />
                <Button
                  v-if="data.status === 'staging'"
                  icon="pi pi-times"
                  size="small"
                  severity="danger"
                  text
                  @click="rejectAsset(data)"
                />
                <Button
                  icon="pi pi-trash"
                  size="small"
                  severity="danger"
                  text
                  @click="deleteAsset(data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Preview Dialog -->
    <Dialog
      :visible="showPreview"
      :modal="true"
      :closable="true"
      header="Preview do Asset"
      class="w-full max-w-4xl"
      @update:visible="showPreview = $event"
    >
      <div
        v-if="selectedAsset"
        class="preview-content"
      >
        <!-- Video Preview -->
        <div
          v-if="selectedAsset.type === 'video'"
          class="mb-4"
        >
          <video
            controls
            class="w-full max-h-96 bg-black rounded"
          >
            <source
              :src="selectedAsset.previewPath"
              type="video/mp4"
            >
            Preview não disponível
          </video>
          <p class="text-sm text-gray-500 mt-2">
            Preview de 3-5s (simulado) - Duração completa: {{ formatDuration(selectedAsset.duration || 0) }}
          </p>
        </div>

        <!-- Audio Preview -->
        <div
          v-else-if="selectedAsset.type === 'audio'"
          class="mb-4"
        >
          <audio
            controls
            class="w-full"
          >
            <source
              :src="selectedAsset.previewPath"
              type="audio/mpeg"
            >
            Preview não disponível
          </audio>
          <p class="text-sm text-gray-500 mt-2">
            Preview de 3-5s (simulado) - Duração completa: {{ formatDuration(selectedAsset.duration || 0) }}
          </p>
        </div>

        <!-- Image Preview -->
        <div
          v-else-if="selectedAsset.type === 'image'"
          class="mb-4"
        >
          <img
            :src="selectedAsset.previewPath"
            :alt="selectedAsset.title || selectedAsset.filename"
            class="max-w-full max-h-96 rounded"
          >
        </div>

        <!-- Document Preview -->
        <div
          v-else
          class="mb-4 p-8 bg-gray-100 rounded text-center"
        >
          <i class="pi pi-file text-4xl text-gray-400 mb-2" />
          <p class="text-gray-600">
            Preview não disponível para documentos
          </p>
        </div>

        <!-- Asset Info -->
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Título:</strong> {{ selectedAsset.title || 'Sem título' }}
          </div>
          <div>
            <strong>Tipo:</strong> {{ getTypeLabel(selectedAsset.type) }}
          </div>
          <div>
            <strong>Tamanho:</strong> {{ formatBytes(selectedAsset.size) }}
          </div>
          <div v-if="selectedAsset.duration">
            <strong>Duração:</strong> {{ formatDuration(selectedAsset.duration) }}
          </div>
          <div>
            <strong>Status:</strong> {{ getStatusLabel(selectedAsset.status) }}
          </div>
          <div>
            <strong>Fornecedor:</strong> {{ selectedAsset.fornecedor || 'N/A' }}
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import MultiSelect from 'primevue/multiselect'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import Badge from 'primevue/badge'
import Dialog from 'primevue/dialog'
import Calendar from 'primevue/calendar'
import InputNumber from 'primevue/inputnumber'
import { useAssetStore, useToastStore } from '../../../app/stores'
import type { AssetFilter, Asset } from '../../../shared/types'

const emit = defineEmits<{
  'edit-asset': [asset: Asset]
  'approve-asset': [asset: Asset]
  'reject-asset': [asset: Asset]
  'delete-asset': [asset: Asset]
}>()

const assetStore = useAssetStore()
const toastStore = useToastStore()

const filters = ref<AssetFilter>({
  search: '',
  type: [],
  status: [],
  tags: [],
  fornecedor: undefined,
  dateFrom: undefined,
  dateTo: undefined,
  durationMin: undefined,
  durationMax: undefined,
  licenseType: []
})

const showPreview = ref(false)
const selectedAsset = ref<Asset | null>(null)

const typeOptions = [
  { label: 'Vídeo', value: 'video' },
  { label: 'Áudio', value: 'audio' },
  { label: 'Imagem', value: 'image' },
  { label: 'Documento', value: 'document' }
]

const statusOptions = [
  { label: 'Upload', value: 'uploading' },
  { label: 'Staging', value: 'staging' },
  { label: 'Processando', value: 'processing' },
  { label: 'Aprovado', value: 'approved' },
  { label: 'Rejeitado', value: 'rejected' },
  { label: 'Arquivado', value: 'archived' }
]

const licenseOptions = [
  { label: 'Royalty Free', value: 'royalty_free' },
  { label: 'Creative Commons', value: 'creative_commons' },
  { label: 'Licenciado', value: 'licensed' },
  { label: 'Personalizado', value: 'custom' }
]

const filteredAssets = computed(() => {
  return assetStore.getFilteredAssets({
    search: filters.value.search,
    type: filters.value.type,
    status: filters.value.status,
    tags: filters.value.tags,
    fornecedor: filters.value.fornecedor,
    dateFrom: filters.value.dateFrom,
    dateTo: filters.value.dateTo,
    durationMin: filters.value.durationMin,
    durationMax: filters.value.durationMax,
    licenseType: filters.value.licenseType
  })
})

const getTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    video: 'Vídeo',
    audio: 'Áudio',
    image: 'Imagem',
    document: 'Documento'
  }
  return labels[type] || type
}

const getTypeSeverity = (type: string): string => {
  const severities: Record<string, string> = {
    video: 'info',
    audio: 'warning',
    image: 'success',
    document: 'secondary'
  }
  return severities[type] || 'secondary'
}

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    uploading: 'Upload',
    staging: 'Staging',
    processing: 'Processando',
    approved: 'Aprovado',
    rejected: 'Rejeitado',
    archived: 'Arquivado'
  }
  return labels[status] || status
}

const getStatusSeverity = (status: string): string => {
  const severities: Record<string, string> = {
    uploading: 'info',
    staging: 'warning',
    processing: 'info',
    approved: 'success',
    rejected: 'danger',
    archived: 'secondary'
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

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const clearFilters = () => {
  filters.value = {
    search: '',
    type: [],
    status: [],
    tags: [],
    fornecedor: undefined,
    dateFrom: undefined,
    dateTo: undefined,
    durationMin: undefined,
    durationMax: undefined,
    licenseType: []
  }
}

const resetFilters = () => {
  clearFilters()
  assetStore.fetchAssets()
}

const exportAssets = () => {
  // Simular export
  toastStore.success('Exportação', 'Export iniciado - arquivo será baixado em breve')
}

const handleRowClick = (event: any) => {
  // Prevent row click when clicking on action buttons
  if (!event.originalEvent.target.closest('.p-button')) {
    editAsset(event.data)
  }
}

const openPreview = (asset: Asset) => {
  selectedAsset.value = asset
  showPreview.value = true
}

const editAsset = (asset: Asset) => {
  emit('edit-asset', asset)
}

const approveAsset = (asset: Asset) => {
  emit('approve-asset', asset)
}

const rejectAsset = (asset: Asset) => {
  emit('reject-asset', asset)
}

const deleteAsset = (asset: Asset) => {
  emit('delete-asset', asset)
}

onMounted(() => {
  assetStore.fetchAssets()
})
</script>

<style scoped>
.preview-container {
  transition: all 0.2s;
}

.preview-container:hover {
  transform: scale(1.05);
  background-color: rgb(59 130 246 / 0.1);
}

.preview-content video,
.preview-content audio,
.preview-content img {
  border-radius: 8px;
}
</style>

