<template>
  <div class="clipping-view">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">
          Sistema de Clipping
        </h1>
        <p class="text-gray-600 mt-1">
          Crie clips reutilizáveis marcando pontos de entrada e saída
        </p>
      </div>
      
      <div class="flex items-center space-x-3">
        <Dropdown
          v-model="selectedAsset"
          :options="availableAssets"
          option-label="displayName"
          placeholder="Selecionar Asset"
          class="w-64"
          show-clear
        />
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card class="text-center">
        <template #content>
          <div class="py-4">
            <i class="pi pi-video text-3xl text-purple-500 mb-2" />
            <div class="text-2xl font-bold text-gray-900">
              {{ clipStore.clipStats.totalClips }}
            </div>
            <div class="text-sm text-gray-600">
              Total de Clips
            </div>
          </div>
        </template>
      </Card>

      <Card class="text-center">
        <template #content>
          <div class="py-4">
            <i class="pi pi-clock text-3xl text-blue-500 mb-2" />
            <div class="text-2xl font-bold text-gray-900">
              {{ formatDuration(clipStore.clipStats.totalDuration) }}
            </div>
            <div class="text-sm text-gray-600">
              Duração Total
            </div>
          </div>
        </template>
      </Card>

      <Card class="text-center">
        <template #content>
          <div class="py-4">
            <i class="pi pi-chart-bar text-3xl text-green-500 mb-2" />
            <div class="text-2xl font-bold text-gray-900">
              {{ formatDuration(clipStore.clipStats.averageDuration) }}
            </div>
            <div class="text-sm text-gray-600">
              Duração Média
            </div>
          </div>
        </template>
      </Card>

      <Card class="text-center">
        <template #content>
          <div class="py-4">
            <i class="pi pi-bookmark text-3xl text-orange-500 mb-2" />
            <div class="text-2xl font-bold text-gray-900">
              {{ selectedAsset ? clipStore.clipsByAsset(selectedAsset.id).length : 0 }}
            </div>
            <div class="text-sm text-gray-600">
              Clips do Asset
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <!-- Video Player - Takes 2/3 width on large screens -->
      <div class="xl:col-span-2">
        <Card>
          <template #header>
            <div class="flex justify-between items-center p-6 pb-0">
              <h2 class="text-xl font-semibold text-gray-900">
                Player de Vídeo
              </h2>
              <div class="flex items-center space-x-2">
                <Badge
                  v-if="selectedAsset"
                  :value="selectedAsset.type.toUpperCase()"
                  severity="info"
                />
                <Button
                  v-if="clipMarkers.inPoint !== null && clipMarkers.outPoint !== null"
                  label="Criar Clip"
                  icon="pi pi-plus"
                  size="small"
                  @click="openClipForm"
                />
              </div>
            </div>
          </template>

          <template #content>
            <div v-if="selectedAsset">
              <VideoPlayer
                :asset="selectedAsset"
                @create-clip="handleCreateClip"
                @time-update="handleTimeUpdate"
                @duration-change="handleDurationChange"
              />
            </div>
            
            <div
              v-else
              class="text-center py-12"
            >
              <i class="pi pi-video text-4xl text-gray-400 mb-4" />
              <h3 class="text-lg font-medium text-gray-900 mb-2">
                Selecione um Asset
              </h3>
              <p class="text-gray-600">
                Escolha um asset de vídeo ou áudio para começar a criar clips
              </p>
            </div>
          </template>
        </Card>
      </div>

      <!-- Clips List - Takes 1/3 width on large screens -->
      <div class="xl:col-span-1">
        <ClipsList
          :selected-asset="selectedAsset"
          @create-clip="openClipForm"
          @edit-clip="handleEditClip"
          @play-clip="handlePlayClip"
          @clip-selected="handleClipSelected"
        />
      </div>
    </div>

    <!-- Recent Activity -->
    <Card class="mt-6">
      <template #header>
        <div class="flex justify-between items-center p-6 pb-0">
          <h2 class="text-xl font-semibold text-gray-900">
            Atividade Recente
          </h2>
          <Button
            icon="pi pi-refresh"
            severity="secondary"
            size="small"
            @click="refreshActivity"
          />
        </div>
      </template>

      <template #content>
        <div v-if="recentActivity.length === 0">
          <div class="text-center py-8">
            <i class="pi pi-history text-4xl text-gray-400 mb-4" />
            <p class="text-gray-600">
              Nenhuma atividade recente
            </p>
          </div>
        </div>

        <div
          v-else
          class="space-y-4"
        >
          <div
            v-for="activity in recentActivity"
            :key="activity.id"
            class="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
          >
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <i
                class="text-blue-600"
                :class="getActivityIcon(activity.type)"
              />
            </div>
            
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900">
                {{ getActivityDescription(activity) }}
              </p>
              <p class="text-xs text-gray-600">
                {{ formatActivityTime(activity.timestamp) }}
              </p>
            </div>
            
            <Badge
              :value="activity.type"
              :severity="getActivitySeverity(activity.type)"
              class="text-xs"
            />
          </div>
        </div>
      </template>
    </Card>

    <!-- Clip Form Dialog -->
    <ClipForm
      :visible="showClipForm"
      :asset="selectedAsset"
      :clip="selectedClip || undefined"
      :initial-in-point="clipMarkers.inPoint || undefined"
      :initial-out-point="clipMarkers.outPoint || undefined"
      @update:visible="showClipForm = $event"
      @success="handleClipSuccess"
      @preview="handleClipPreview"
    />

    <!-- Asset Selection Helper -->
    <Dialog
      :visible="!selectedAsset && showAssetHelper"
      :modal="true"
      :closable="true"
      header="Selecionar Asset para Clipping"
      class="w-full max-w-2xl"
      @update:visible="showAssetHelper = $event"
    >
      <div class="mb-4">
        <p class="text-gray-700 mb-4">
          Para começar a criar clips, você precisa selecionar um asset de vídeo ou áudio.
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            v-for="asset in videoAudioAssets"
            :key="asset.id"
            class="cursor-pointer transition-all hover:shadow-md border-2 hover:border-blue-500"
            @click="selectAssetFromHelper(asset)"
          >
            <template #content>
              <div class="p-4">
                <div class="flex items-center space-x-3 mb-3">
                  <div class="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                    <i
                      class="text-lg"
                      :class="asset.type === 'video' ? 'pi pi-video text-purple-500' : 'pi pi-volume-up text-blue-500'"
                    />
                  </div>
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900">
                      {{ asset.title || asset.originalName }}
                    </h4>
                    <p class="text-sm text-gray-600">
                      {{ formatDuration(asset.duration || 0) }}
                    </p>
                  </div>
                </div>
                
                <div class="flex justify-between items-center text-xs text-gray-500">
                  <span>{{ asset.type.toUpperCase() }}</span>
                  <span>{{ clipStore.clipsByAsset(asset.id).length }} clips</span>
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <Button
            label="Fechar"
            severity="secondary"
            @click="showAssetHelper = false"
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
import Dropdown from 'primevue/dropdown'
import Badge from 'primevue/badge'
import Dialog from 'primevue/dialog'
import { useAssetStore, useClipStore } from '../../../app/stores'
import VideoPlayer from '../components/VideoPlayer.vue'
import ClipsList from '../components/ClipsList.vue'
import ClipForm from '../components/ClipForm.vue'
import type { Asset, Clip } from '../../../shared/types'

const assetStore = useAssetStore()
const clipStore = useClipStore()

// State
const selectedAsset = ref<Asset | null>(null)
const selectedClip = ref<Clip | null>(null)
const showClipForm = ref(false)
const showAssetHelper = ref(false)

// Player state
const clipMarkers = ref({
  inPoint: null as number | null,
  outPoint: null as number | null
})

// Mock recent activity
const recentActivity = ref([
  {
    id: '1',
    type: 'created',
    clipTitle: 'Abertura do Telejornal',
    assetName: 'Programa Principal',
    timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 min ago
  },
  {
    id: '2',
    type: 'updated',
    clipTitle: 'Entrevista Principal',
    assetName: 'Programa Principal',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
  },
  {
    id: '3',
    type: 'deleted',
    clipTitle: 'Clip de Teste',
    assetName: 'Material de Arquivo',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4) // 4 hours ago
  }
])

// Computed
const availableAssets = computed(() => {
  return assetStore.assets
    .filter(asset => asset.type === 'video' || asset.type === 'audio')
    .map(asset => ({
      ...asset,
      displayName: `${asset.title || asset.originalName} (${formatDuration(asset.duration || 0)})`
    }))
})

const videoAudioAssets = computed(() => {
  return assetStore.assets
    .filter(asset => asset.type === 'video' || asset.type === 'audio')
    .slice(0, 6) // Show max 6 in helper
})

// Methods
const openClipForm = () => {
  selectedClip.value = null
  showClipForm.value = true
}

const handleCreateClip = (data: { inPoint: number | null; outPoint: number | null }) => {
  clipMarkers.value.inPoint = data.inPoint
  clipMarkers.value.outPoint = data.outPoint
  openClipForm()
}

const handleEditClip = (clip: Clip) => {
  selectedClip.value = clip
  showClipForm.value = true
}

const handlePlayClip = (clip: Clip) => {
  // Find and select the asset for this clip
  const asset = assetStore.assets.find(a => a.id === clip.assetId)
  if (asset) {
    selectedAsset.value = asset
    // Here you would seek to the clip's in point and play
    // This would be implemented in the VideoPlayer component
  }
}

const handleClipSelected = (clip: Clip) => {
  selectedClip.value = clip
  // Optional: Auto-select the asset
  const asset = assetStore.assets.find(a => a.id === clip.assetId)
  if (asset && asset.id !== selectedAsset.value?.id) {
    selectedAsset.value = asset
  }
}

const handleClipSuccess = (clip: Clip) => {
  selectedClip.value = null
  
  // Add to recent activity
  recentActivity.value.unshift({
    id: Date.now().toString(),
    type: selectedClip.value ? 'updated' : 'created',
    clipTitle: clip.title,
    assetName: selectedAsset.value?.title || selectedAsset.value?.originalName || 'Asset',
    timestamp: new Date()
  })
  
  // Keep only last 10 activities
  if (recentActivity.value.length > 10) {
    recentActivity.value = recentActivity.value.slice(0, 10)
  }
}

const handleClipPreview = (data: { inPoint: number; outPoint: number }) => {
  // This would control the video player to preview the clip
  clipMarkers.value.inPoint = data.inPoint
  clipMarkers.value.outPoint = data.outPoint
}

const handleTimeUpdate = () => {
  // Handle time updates from video player if needed
}

const handleDurationChange = () => {
  // Handle duration changes from video player if needed
}

const selectAssetFromHelper = (asset: Asset) => {
  selectedAsset.value = asset
  showAssetHelper.value = false
}

const refreshActivity = () => {
  // In a real app, this would fetch from API
  // For now it's just a placeholder
}

// Activity helpers
const getActivityIcon = (type: string): string => {
  const icons: Record<string, string> = {
    created: 'pi pi-plus',
    updated: 'pi pi-pencil',
    deleted: 'pi pi-trash',
    played: 'pi pi-play',
    exported: 'pi pi-download'
  }
  return icons[type] || 'pi pi-circle'
}

const getActivityDescription = (activity: any): string => {
  const actions: Record<string, string> = {
    created: 'criou o clip',
    updated: 'atualizou o clip',
    deleted: 'removeu o clip',
    played: 'reproduziu o clip',
    exported: 'exportou o clip'
  }
  
  const action = actions[activity.type] || 'interagiu com o clip'
  return `${action} "${activity.clipTitle}" do asset "${activity.assetName}"`
}

const getActivitySeverity = (type: string): string => {
  const severities: Record<string, string> = {
    created: 'success',
    updated: 'info',
    deleted: 'danger',
    played: 'secondary',
    exported: 'help'
  }
  return severities[type] || 'secondary'
}

const formatActivityTime = (timestamp: Date): string => {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return 'Agora mesmo'
  if (minutes < 60) return `${minutes} min atrás`
  if (hours < 24) return `${hours}h atrás`
  return `${days}d atrás`
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

// Lifecycle
onMounted(() => {
  // Show asset helper if no assets available for clipping
  if (videoAudioAssets.value.length === 0) {
    showAssetHelper.value = false // Don't show if no assets
  } else if (!selectedAsset.value) {
    // Auto-select first video/audio asset if available
    const assets = assetStore.assets.filter(asset => asset.type === 'video' || asset.type === 'audio')
    if (assets.length > 0 && assets[0]) {
      selectedAsset.value = assets[0]
    }
  }
})
</script>

<style scoped>
.clipping-view {
  min-height: calc(100vh - 2rem);
}

/* Custom scrollbar for activity list */
.activity-scroll {
  max-height: 400px;
  overflow-y: auto;
}

.activity-scroll::-webkit-scrollbar {
  width: 4px;
}

.activity-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.activity-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.activity-scroll::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>

