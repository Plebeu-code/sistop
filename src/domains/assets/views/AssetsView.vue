<template>
  <div class="assets-view">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">
          Acervo de Assets
        </h1>
        <p class="text-gray-600 mt-1">
          Gerenciamento completo de upload e curadoria de assets
        </p>
      </div>
      
      <div class="flex items-center space-x-3">
        <Button
          label="Upload de Assets"
          icon="pi pi-upload"
          @click="showUploadDialog = true"
        />
        <Button
          v-if="hasPermission('curador')"
          label="Curadoria"
          icon="pi pi-filter"
          severity="secondary"
          @click="showCuradoriaDialog = true"
        />
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card class="text-center">
        <template #content>
          <div class="py-4">
            <i class="pi pi-upload text-3xl text-blue-500 mb-2" />
            <div class="text-2xl font-bold text-gray-900">
              {{ assetStore.assets.filter(a => a.status === 'uploading').length }}
            </div>
            <div class="text-sm text-gray-600">
              Em Upload
            </div>
          </div>
        </template>
      </Card>

      <Card class="text-center">
        <template #content>
          <div class="py-4">
            <i class="pi pi-clock text-3xl text-yellow-500 mb-2" />
            <div class="text-2xl font-bold text-gray-900">
              {{ assetStore.assets.filter(a => a.status === 'staging').length }}
            </div>
            <div class="text-sm text-gray-600">
              Aguardando Curadoria
            </div>
          </div>
        </template>
      </Card>

      <Card class="text-center">
        <template #content>
          <div class="py-4">
            <i class="pi pi-check text-3xl text-green-500 mb-2" />
            <div class="text-2xl font-bold text-gray-900">
              {{ assetStore.assets.filter(a => a.status === 'approved').length }}
            </div>
            <div class="text-sm text-gray-600">
              Aprovados
            </div>
          </div>
        </template>
      </Card>

      <Card class="text-center">
        <template #content>
          <div class="py-4">
            <i class="pi pi-database text-3xl text-purple-500 mb-2" />
            <div class="text-2xl font-bold text-gray-900">
              {{ assetStore.assets.length }}
            </div>
            <div class="text-sm text-gray-600">
              Total de Assets
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Assets Grid -->
    <Card>
      <template #header>
        <div class="flex justify-between items-center p-6 pb-0">
          <h2 class="text-xl font-semibold text-gray-900">
            Meus Assets Recentes
          </h2>
          <div class="flex items-center space-x-2">
            <Button
              icon="pi pi-refresh"
              severity="secondary"
              @click="refreshAssets"
            />
            <Dropdown
              v-model="selectedView"
              :options="viewOptions"
              option-label="label"
              option-value="value"
              placeholder="Visualização"
              class="w-32"
            />
          </div>
        </div>
      </template>

      <template #content>
        <div v-if="assetStore.loading && assetStore.assets.length === 0">
          <div class="flex justify-center items-center py-12">
            <ProgressSpinner />
          </div>
        </div>

        <div
          v-else-if="assetStore.assets.length === 0"
          class="text-center py-12"
        >
          <i class="pi pi-inbox text-4xl text-gray-400 mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            Nenhum asset encontrado
          </h3>
          <p class="text-gray-600 mb-4">
            Comece fazendo upload de seu primeiro asset
          </p>
          <Button
            label="Fazer Upload"
            icon="pi pi-upload"
            @click="showUploadDialog = true"
          />
        </div>

        <div
          v-else
          :class="selectedView === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-2'"
        >
          <div
            v-for="asset in recentAssets"
            :key="asset.id"
            :class="selectedView === 'grid' ? 'asset-card' : 'asset-row'"
            class="cursor-pointer transition-all hover:shadow-md"
            @click="selectAsset(asset)"
          >
            <Card
              v-if="selectedView === 'grid'"
              class="h-full"
            >
              <template #content>
                <div class="p-4">
                  <!-- Asset Type Icon -->
                  <div class="flex justify-between items-start mb-3">
                    <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <i
                        class="text-xl"
                        :class="getFileIcon(asset.type)"
                      />
                    </div>
                    <Badge
                      :value="getStatusLabel(asset.status)"
                      :severity="getStatusSeverity(asset.status)"
                      class="text-xs"
                    />
                  </div>

                  <!-- Asset Info -->
                  <h4 class="font-medium text-gray-900 mb-1 truncate">
                    {{ asset.title || asset.originalName }}
                  </h4>
                  <p class="text-sm text-gray-600 mb-2 truncate">
                    {{ asset.filename }}
                  </p>

                  <!-- Metadata -->
                  <div class="flex items-center justify-between text-xs text-gray-500">
                    <span>{{ formatBytes(asset.size) }}</span>
                    <span v-if="asset.duration">{{ formatDuration(asset.duration) }}</span>
                    <span>{{ formatDate(asset.createdAt) }}</span>
                  </div>

                  <!-- Tags -->
                  <div
                    v-if="asset.tags.length > 0"
                    class="flex flex-wrap gap-1 mt-2"
                  >
                    <Badge
                      v-for="tag in asset.tags.slice(0, 2)"
                      :key="tag"
                      :value="tag"
                      severity="secondary"
                      class="text-xs"
                    />
                    <Badge
                      v-if="asset.tags.length > 2"
                      :value="`+${asset.tags.length - 2}`"
                      severity="secondary"
                      class="text-xs"
                    />
                  </div>
                </div>
              </template>
            </Card>

            <!-- List View -->
            <div
              v-else
              class="flex items-center space-x-4 p-3 bg-white rounded-lg border"
            >
              <div class="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                <i
                  class="text-lg"
                  :class="getFileIcon(asset.type)"
                />
              </div>

              <div class="flex-1 min-w-0">
                <h4 class="font-medium text-gray-900 truncate">
                  {{ asset.title || asset.originalName }}
                </h4>
                <p class="text-sm text-gray-600 truncate">
                  {{ asset.filename }} • {{ formatBytes(asset.size) }}
                  <span v-if="asset.duration"> • {{ formatDuration(asset.duration) }}</span>
                </p>
              </div>

              <div class="flex items-center space-x-3">
                <Badge
                  :value="getStatusLabel(asset.status)"
                  :severity="getStatusSeverity(asset.status)"
                  class="text-xs"
                />
                <span class="text-xs text-gray-500">
                  {{ formatDate(asset.createdAt) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Load More -->
        <div
          v-if="recentAssets.length < assetStore.assets.length"
          class="text-center mt-6"
        >
          <Button
            label="Carregar Mais"
            severity="secondary"
            @click="loadMoreAssets"
          />
        </div>
      </template>
    </Card>

    <!-- Upload Dialog -->
    <Dialog
      :visible="showUploadDialog"
      :modal="true"
      :closable="true"
      header="Upload de Assets"
      class="w-full max-w-2xl"
      @update:visible="showUploadDialog = $event"
    >
      <AssetUpload @upload-complete="handleUploadComplete" />
    </Dialog>

    <!-- Curadoria Dialog -->
    <Dialog
      :visible="showCuradoriaDialog"
      :modal="true"
      :closable="true"
      header="Curadoria de Assets"
      class="w-full max-w-6xl"
      @update:visible="showCuradoriaDialog = $event"
    >
      <AssetCuradoria
        @edit-asset="handleEditAsset"
        @approve-asset="handleApproveAsset"
        @reject-asset="handleRejectAsset"
        @delete-asset="handleDeleteAsset"
      />
    </Dialog>

    <!-- Asset Metadata Form -->
    <AssetMetadataForm
      :visible="showMetadataForm"
      :asset="selectedAssetForEdit"
      @update:visible="showMetadataForm = $event"
      @success="handleMetadataSuccess"
    />

    <!-- Approval Confirmation Dialog -->
    <Dialog
      :visible="showApprovalDialog"
      :modal="true"
      :closable="true"
      header="Confirmar Aprovação"
      class="w-full max-w-md"
      @update:visible="showApprovalDialog = $event"
    >
      <div class="mb-4">
        <p class="text-gray-700 mb-3">
          Tem certeza que deseja aprovar este asset?
        </p>
        <div
          v-if="selectedAssetForApproval"
          class="p-3 bg-gray-50 rounded"
        >
          <div class="flex items-center space-x-3">
            <i
              class="text-lg"
              :class="getFileIcon(selectedAssetForApproval.type)"
            />
            <div>
              <div class="font-medium">
                {{ selectedAssetForApproval.title || selectedAssetForApproval.originalName }}
              </div>
              <div class="text-sm text-gray-600">
                {{ selectedAssetForApproval.filename }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <Button
            label="Cancelar"
            severity="secondary"
            @click="showApprovalDialog = false"
          />
          <Button
            label="Aprovar"
            severity="success"
            :loading="assetStore.loading"
            @click="confirmApproval"
          />
        </div>
      </template>
    </Dialog>

    <!-- Rejection Dialog -->
    <Dialog
      :visible="showRejectionDialog"
      :modal="true"
      :closable="true"
      header="Rejeitar Asset"
      class="w-full max-w-md"
      @update:visible="showRejectionDialog = $event"
    >
      <div class="mb-4">
        <div
          v-if="selectedAssetForRejection"
          class="p-3 bg-gray-50 rounded mb-4"
        >
          <div class="flex items-center space-x-3">
            <i
              class="text-lg"
              :class="getFileIcon(selectedAssetForRejection.type)"
            />
            <div>
              <div class="font-medium">
                {{ selectedAssetForRejection.title || selectedAssetForRejection.originalName }}
              </div>
              <div class="text-sm text-gray-600">
                {{ selectedAssetForRejection.filename }}
              </div>
            </div>
          </div>
        </div>

        <label
          for="rejectionReason"
          class="block text-sm font-medium text-gray-700 mb-2"
        >
          Motivo da Rejeição *
        </label>
        <Textarea
          id="rejectionReason"
          v-model="rejectionReason"
          class="w-full"
          rows="3"
          placeholder="Descreva o motivo da rejeição"
        />
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <Button
            label="Cancelar"
            severity="secondary"
            @click="showRejectionDialog = false"
          />
          <Button
            label="Rejeitar"
            severity="danger"
            :loading="assetStore.loading"
            :disabled="!rejectionReason.trim()"
            @click="confirmRejection"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Badge from 'primevue/badge'
import Dropdown from 'primevue/dropdown'
import Textarea from 'primevue/textarea'
import ProgressSpinner from 'primevue/progressspinner'
import { useAssetStore, useUserStore } from '../../../app/stores'
import AssetUpload from '../components/AssetUpload.vue'
import AssetCuradoria from '../components/AssetCuradoria.vue'
import AssetMetadataForm from '../components/AssetMetadataForm.vue'
import type { Asset } from '../../../shared/types'

const assetStore = useAssetStore()
const userStore = useUserStore()

// Dialog states
const showUploadDialog = ref(false)
const showCuradoriaDialog = ref(false)
const showMetadataForm = ref(false)
const showApprovalDialog = ref(false)
const showRejectionDialog = ref(false)

// Selected items
const selectedAssetForEdit = ref<Asset | undefined>()
const selectedAssetForApproval = ref<Asset | undefined>()
const selectedAssetForRejection = ref<Asset | undefined>()

// View options
const selectedView = ref<'grid' | 'list'>('grid')
const viewOptions = [
  { label: 'Grade', value: 'grid' },
  { label: 'Lista', value: 'list' }
]

// Pagination
const assetsPerPage = ref(12)
const currentPage = ref(1)

// Forms
const rejectionReason = ref('')

// Computed
const recentAssets = computed(() => {
  const sorted = [...assetStore.assets].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  return sorted.slice(0, currentPage.value * assetsPerPage.value)
})

const hasPermission = (role: string) => {
  return userStore.user?.roles.includes(role as any) || userStore.user?.roles.includes('admin')
}

// Methods
const refreshAssets = async () => {
  // In a real app, this would fetch from API
  // For now, it's just a placeholder
}

const loadMoreAssets = () => {
  currentPage.value++
}

const selectAsset = (asset: Asset) => {
  selectedAssetForEdit.value = asset
  showMetadataForm.value = true
}

const handleUploadComplete = () => {
  showUploadDialog.value = false
  // Asset is already added to store by AssetUpload component
}

const handleEditAsset = (asset: Asset) => {
  selectedAssetForEdit.value = asset
  showMetadataForm.value = true
}

const handleApproveAsset = (asset: Asset) => {
  selectedAssetForApproval.value = asset
  showApprovalDialog.value = true
}

const handleRejectAsset = (asset: Asset) => {
  selectedAssetForRejection.value = asset
  rejectionReason.value = ''
  showRejectionDialog.value = true
}

const handleDeleteAsset = async (asset: Asset) => {
  // This would show a confirmation dialog in a real app
  await assetStore.deleteAsset(asset.id)
}

const handleMetadataSuccess = () => {
  showMetadataForm.value = false
  selectedAssetForEdit.value = undefined
}

const confirmApproval = async () => {
  if (!selectedAssetForApproval.value) return

  await assetStore.approveAsset(selectedAssetForApproval.value.id, 'Aprovado via interface principal')
  showApprovalDialog.value = false
  selectedAssetForApproval.value = undefined
}

const confirmRejection = async () => {
  if (!selectedAssetForRejection.value || !rejectionReason.value.trim()) return

  await assetStore.rejectAsset(selectedAssetForRejection.value.id, rejectionReason.value.trim())
  showRejectionDialog.value = false
  selectedAssetForRejection.value = undefined
  rejectionReason.value = ''
}

// Utility functions
const getFileIcon = (type: string): string => {
  const icons: Record<string, string> = {
    video: 'pi pi-video text-purple-500',
    audio: 'pi pi-volume-up text-blue-500',
    image: 'pi pi-image text-green-500',
    document: 'pi pi-file text-gray-500'
  }
  return icons[type] || 'pi pi-file text-gray-500'
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

const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Lifecycle
onMounted(() => {
  // Load initial assets if needed
  if (assetStore.assets.length === 0) {
    // In a real app, we would call assetStore.loadAssets()
  }
})
</script>

<style scoped>
.asset-card {
  transition: transform 0.2s ease-in-out;
}

.asset-card:hover {
  transform: translateY(-2px);
}

.asset-row:hover {
  background-color: rgba(0, 0, 0, 0.02);
}


</style>

