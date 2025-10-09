<template>
  <div class="video-player-container">
    <!-- Video Player -->
    <div class="relative bg-black rounded-lg overflow-hidden">
      <!-- Simulated Video Display -->
      <div
        class="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative"
        @click="togglePlayPause"
      >
        <!-- Video Simulation -->
        <div
          v-if="asset"
          class="absolute inset-0 flex items-center justify-center"
        >
          <div class="text-center text-white">
            <i
              class="text-8xl mb-4"
              :class="asset.type === 'video' ? 'pi pi-video' : 'pi pi-volume-up'"
            />
            <h3 class="text-xl font-semibold mb-2">
              {{ asset.title || asset.originalName }}
            </h3>
            <p class="text-gray-300">
              {{ formatDuration(playerState.duration) }}
            </p>
          </div>
        </div>

        <!-- Play/Pause Overlay -->
        <div 
          v-if="!playerState.isPlaying"
          class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 cursor-pointer"
        >
          <Button
            icon="pi pi-play"
            severity="secondary"
            rounded
            size="large"
            class="w-16 h-16 text-2xl"
            @click.stop="play"
          />
        </div>

        <!-- Loading Overlay -->
        <div
          v-if="playerState.isLoading"
          class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50"
        >
          <ProgressSpinner />
        </div>

        <!-- Error Overlay -->
        <div
          v-if="playerState.hasError"
          class="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-50"
        >
          <div class="text-center text-white">
            <i class="pi pi-exclamation-triangle text-4xl mb-2" />
            <p>{{ playerState.errorMessage || 'Erro no player' }}</p>
          </div>
        </div>

        <!-- In/Out Point Markers -->
        <div
          v-if="inPoint !== null"
          class="absolute left-0 top-0 w-1 h-full bg-green-500 z-10"
          :style="{ left: `${(inPoint / playerState.duration) * 100}%` }"
        >
          <div class="absolute -top-8 -left-2 bg-green-500 text-white text-xs px-1 py-0.5 rounded">
            IN
          </div>
        </div>

        <div
          v-if="outPoint !== null"
          class="absolute left-0 top-0 w-1 h-full bg-red-500 z-10"
          :style="{ left: `${(outPoint / playerState.duration) * 100}%` }"
        >
          <div class="absolute -top-8 -left-2 bg-red-500 text-white text-xs px-1 py-0.5 rounded">
            OUT
          </div>
        </div>

        <!-- Clip Preview Overlay -->
        <div
          v-if="inPoint !== null && outPoint !== null"
          class="absolute top-0 h-full bg-blue-500 bg-opacity-20 z-5"
          :style="{ 
            left: `${(inPoint / playerState.duration) * 100}%`,
            width: `${((outPoint - inPoint) / playerState.duration) * 100}%`
          }"
        />
      </div>

      <!-- Progress Bar -->
      <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
        <div class="flex items-center space-x-3 text-white">
          <!-- Play/Pause Button -->
          <Button
            :icon="playerState.isPlaying ? 'pi pi-pause' : 'pi pi-play'"
            severity="secondary"
            text
            @click="togglePlayPause"
          />

          <!-- Time Display -->
          <span class="text-sm font-mono min-w-[8rem]">
            {{ formatTime(playerState.currentTime) }} / {{ formatTime(playerState.duration) }}
          </span>

          <!-- Progress Slider -->
          <div class="flex-1 relative">
            <Slider
              v-model="sliderValue"
              :min="0"
              :max="playerState.duration"
              :step="0.1"
              class="w-full"
              @change="handleSliderChange"
            />
          </div>

          <!-- Volume Control -->
          <div class="flex items-center space-x-2">
            <Button
              :icon="playerState.isMuted || playerState.volume === 0 ? 'pi pi-volume-off' : 'pi pi-volume-up'"
              severity="secondary"
              text
              @click="toggleMute"
            />
            <Slider
              v-model="volumeSlider"
              :min="0"
              :max="100"
              class="w-16"
              @change="handleVolumeChange"
            />
          </div>

          <!-- Playback Speed -->
          <Dropdown
            v-model="speedOption"
            :options="speedOptions"
            option-label="label"
            option-value="value"
            class="w-20"
            @change="handleSpeedChange"
          />
        </div>
      </div>
    </div>

    <!-- Controls Panel -->
    <Card class="mt-4">
      <template #content>
        <div class="space-y-4">
          <!-- Clip Controls Row 1 -->
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <h3 class="text-lg font-semibold text-gray-900">
                Controles de Clipping
              </h3>
              <Badge
                v-if="clipDuration >= 2"
                :value="`${formatDuration(clipDuration)}`"
                severity="success"
              />
              <Badge
                v-else-if="inPoint !== null && outPoint !== null"
                value="< 2s (mínimo)"
                severity="danger"
              />
            </div>

            <div class="flex items-center space-x-2">
              <Button
                label="Preview Clip"
                icon="pi pi-play"
                size="small"
                :disabled="!canPreviewClip"
                @click="previewClip"
              />
              <Button
                label="Reset"
                icon="pi pi-refresh"
                severity="secondary"
                size="small"
                @click="resetMarkers"
              />
            </div>
          </div>

          <!-- In/Out Point Controls -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- In Point -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">
                Ponto de Entrada (IN)
              </label>
              <div class="flex items-center space-x-2">
                <InputNumber
                  v-model="inPointInput"
                  :min="0"
                  :max="playerState.duration"
                  :step="0.1"
                  :format="false"
                  class="flex-1"
                  placeholder="0.0"
                  @blur="updateInPoint"
                />
                <Button
                  label="Set IN"
                  icon="pi pi-flag"
                  severity="success"
                  size="small"
                  @click="setInPoint"
                />
                <Button
                  icon="pi pi-step-backward"
                  severity="secondary"
                  size="small"
                  text
                  @click="snapToPreviousFrame"
                />
                <Button
                  icon="pi pi-step-forward"
                  severity="secondary"
                  size="small"
                  text
                  @click="snapToNextFrame"
                />
              </div>
              <small class="text-gray-600">
                {{ formatTime(inPoint || 0) }}
              </small>
            </div>

            <!-- Out Point -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">
                Ponto de Saída (OUT)
              </label>
              <div class="flex items-center space-x-2">
                <InputNumber
                  v-model="outPointInput"
                  :min="0"
                  :max="playerState.duration"
                  :step="0.1"
                  :format="false"
                  class="flex-1"
                  placeholder="0.0"
                  @blur="updateOutPoint"
                />
                <Button
                  label="Set OUT"
                  icon="pi pi-flag"
                  severity="danger"
                  size="small"
                  @click="setOutPoint"
                />
                <Button
                  icon="pi pi-step-backward"
                  severity="secondary"
                  size="small"
                  text
                  @click="snapToPreviousFrame"
                />
                <Button
                  icon="pi pi-step-forward"
                  severity="secondary"
                  size="small"
                  text
                  @click="snapToNextFrame"
                />
              </div>
              <small class="text-gray-600">
                {{ formatTime(outPoint || playerState.duration) }}
              </small>
            </div>
          </div>

          <!-- Clip Information -->
          <div
            v-if="inPoint !== null && outPoint !== null"
            class="p-3 bg-gray-50 rounded-lg"
          >
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span class="font-medium text-gray-600">Duração:</span>
                <div class="font-mono">
                  {{ formatDuration(clipDuration) }}
                </div>
              </div>
              <div>
                <span class="font-medium text-gray-600">Entrada:</span>
                <div class="font-mono">
                  {{ formatTime(inPoint) }}
                </div>
              </div>
              <div>
                <span class="font-medium text-gray-600">Saída:</span>
                <div class="font-mono">
                  {{ formatTime(outPoint) }}
                </div>
              </div>
              <div>
                <span class="font-medium text-gray-600">Válido:</span>
                <Badge
                  :value="clipDuration >= 2 ? 'Sim' : 'Não'"
                  :severity="clipDuration >= 2 ? 'success' : 'danger'"
                />
              </div>
            </div>

            <!-- Validation Messages -->
            <div
              v-if="clipDuration < 2"
              class="mt-2 text-sm text-red-600"
            >
              <i class="pi pi-exclamation-triangle mr-1" />
              Duração mínima do clip é de 2 segundos
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="flex items-center justify-between pt-2 border-t">
            <div class="flex items-center space-x-2">
              <span class="text-sm font-medium text-gray-700">Ações Rápidas:</span>
              <Button
                label="Início"
                size="small"
                severity="secondary"
                @click="seekToStart"
              />
              <Button
                label="Meio"
                size="small"
                severity="secondary"
                @click="seekToMiddle"
              />
              <Button
                label="Fim"
                size="small"
                severity="secondary"
                @click="seekToEnd"
              />
            </div>

            <div class="flex items-center space-x-2">
              <Button
                label="Criar Clip"
                icon="pi pi-plus"
                :disabled="!canCreateClip"
                @click="$emit('create-clip', { inPoint, outPoint, duration: clipDuration })"
              />
            </div>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Slider from 'primevue/slider'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import Badge from 'primevue/badge'
import ProgressSpinner from 'primevue/progressspinner'
import type { Asset, PlayerState } from '../../../shared/types'

const props = defineProps<{
  asset: Asset | null
  autoplay?: boolean
}>()

const emit = defineEmits<{
  'create-clip': [data: { inPoint: number | null; outPoint: number | null; duration: number }]
  'time-update': [time: number]
  'duration-change': [duration: number]
}>()

// Player State
const playerState = ref<PlayerState>({
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 80,
  isMuted: false,
  playbackRate: 1,
  isLoading: false,
  hasError: false
})

// Clip Markers
const inPoint = ref<number | null>(null)
const outPoint = ref<number | null>(null)
const inPointInput = ref<number | null>(null)
const outPointInput = ref<number | null>(null)

// UI State
const sliderValue = ref(0)
const volumeSlider = ref(80)
const speedOption = ref(1)

// Mock video duration based on asset type
const initializeDuration = () => {
  if (props.asset) {
    // Use asset duration if available, otherwise mock based on type
    const mockDuration = props.asset.duration || (props.asset.type === 'video' ? 180 : 30)
    playerState.value.duration = mockDuration
    sliderValue.value = 0
  }
}

// Speed options
const speedOptions = [
  { label: '0.5x', value: 0.5 },
  { label: '0.75x', value: 0.75 },
  { label: '1x', value: 1 },
  { label: '1.25x', value: 1.25 },
  { label: '1.5x', value: 1.5 },
  { label: '2x', value: 2 }
]

// Computed
const clipDuration = computed(() => {
  if (inPoint.value !== null && outPoint.value !== null) {
    return Math.max(0, outPoint.value - inPoint.value)
  }
  return 0
})

const canPreviewClip = computed(() => {
  return inPoint.value !== null && outPoint.value !== null && clipDuration.value >= 2
})

const canCreateClip = computed(() => {
  return canPreviewClip.value
})

// Player simulation (simplified)
const startPlayback = () => {
  // Simplified playback simulation
  if (playerState.value.isPlaying) {
    // Update time periodically would go here in real implementation
  }
}

const stopPlayback = () => {
  // Stop playback simulation
}

// Controls
const play = () => {
  playerState.value.isPlaying = true
  startPlayback()
}

const pause = () => {
  playerState.value.isPlaying = false
  stopPlayback()
}

const togglePlayPause = () => {
  if (playerState.value.isPlaying) {
    pause()
  } else {
    play()
  }
}

const seek = (time: number) => {
  const clampedTime = Math.max(0, Math.min(time, playerState.value.duration))
  playerState.value.currentTime = clampedTime
  sliderValue.value = clampedTime
  emit('time-update', clampedTime)
}

const toggleMute = () => {
  playerState.value.isMuted = !playerState.value.isMuted
}

const setInPoint = () => {
  inPoint.value = playerState.value.currentTime
  inPointInput.value = playerState.value.currentTime
}

const setOutPoint = () => {
  outPoint.value = playerState.value.currentTime
  outPointInput.value = playerState.value.currentTime
}

const updateInPoint = () => {
  if (inPointInput.value !== null && inPointInput.value >= 0) {
    inPoint.value = Math.min(inPointInput.value, playerState.value.duration)
  }
}

const updateOutPoint = () => {
  if (outPointInput.value !== null && outPointInput.value >= 0) {
    outPoint.value = Math.min(outPointInput.value, playerState.value.duration)
  }
}

const previewClip = () => {
  if (inPoint.value !== null) {
    seek(inPoint.value)
    play()
  }
}

const resetMarkers = () => {
  inPoint.value = null
  outPoint.value = null
  inPointInput.value = null
  outPointInput.value = null
}

const snapToPreviousFrame = () => {
  const frameStep = 1 / 30 // Assume 30fps
  seek(playerState.value.currentTime - frameStep)
}

const snapToNextFrame = () => {
  const frameStep = 1 / 30 // Assume 30fps
  seek(playerState.value.currentTime + frameStep)
}

const seekToStart = () => {
  seek(0)
}

const seekToMiddle = () => {
  seek(playerState.value.duration / 2)
}

const seekToEnd = () => {
  seek(playerState.value.duration)
}

// Event Handlers
const handleSliderChange = (value: number) => {
  seek(value)
}

const handleVolumeChange = (value: number) => {
  playerState.value.volume = value
  playerState.value.isMuted = value === 0
}

const handleSpeedChange = (value: number) => {
  playerState.value.playbackRate = value
}

// Utility Functions
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSecs = Math.floor(seconds % 60)
  return `${minutes}m ${remainingSecs}s`
}

// Watchers
watch(() => props.asset, (newAsset) => {
  if (newAsset) {
    pause()
    initializeDuration()
    resetMarkers()
    emit('duration-change', playerState.value.duration)
  }
}, { immediate: true })

watch(volumeSlider, (value) => {
  handleVolumeChange(value)
})

// Lifecycle
onMounted(() => {
  if (props.asset) {
    initializeDuration()
    if (props.autoplay) {
      play()
    }
  }
})

onUnmounted(() => {
  stopPlayback()
})

// Keyboard shortcuts removed for simplicity
</script>

<style scoped>
.video-player-container {
  max-width: 100%;
}

.aspect-video {
  aspect-ratio: 16 / 9;
}

/* Custom slider styles */
:deep(.p-slider .p-slider-handle) {
  background: #6366f1;
  border-color: #6366f1;
}

:deep(.p-slider .p-slider-range) {
  background: #6366f1;
}

/* Progress bar on video */
:deep(.video-progress .p-slider) {
  height: 4px;
}

:deep(.video-progress .p-slider .p-slider-handle) {
  width: 12px;
  height: 12px;
  margin-top: -4px;
}
</style>

