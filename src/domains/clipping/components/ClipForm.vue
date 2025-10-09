<template>
  <Dialog
    :visible="visible"
    :modal="true"
    :closable="true"
    :header="isEditing ? 'Editar Clip' : 'Criar Novo Clip'"
    class="w-full max-w-2xl"
    @update:visible="$emit('update:visible', $event)"
  >
    <div
      v-if="asset"
      class="clip-form"
    >
      <!-- Asset Info -->
      <div class="mb-6 p-4 bg-gray-50 rounded-lg">
        <div class="flex items-start space-x-4">
          <div class="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
            <i
              class="text-lg"
              :class="asset.type === 'video' ? 'pi pi-video text-purple-500' : 'pi pi-volume-up text-blue-500'"
            />
          </div>
          <div class="flex-1">
            <h4 class="font-semibold text-gray-900">
              {{ asset.title || asset.originalName }}
            </h4>
            <p class="text-sm text-gray-600">
              {{ asset.filename }} • {{ formatDuration(asset.duration || 0) }}
            </p>
          </div>
        </div>
      </div>

      <form @submit.prevent="handleSubmit">
        <!-- Title -->
        <div class="mb-4">
          <label
            for="title"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Título do Clip *
          </label>
          <InputText
            id="title"
            v-model="form.title"
            :class="{ 'p-invalid': errors.title }"
            class="w-full"
            placeholder="Digite o título do clip"
            maxlength="100"
          />
          <small
            v-if="errors.title"
            class="p-error"
          >{{ errors.title }}</small>
          <small class="text-gray-500 text-xs">
            {{ form.title.length }}/100 caracteres
          </small>
        </div>

        <!-- Description -->
        <div class="mb-4">
          <label
            for="description"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Descrição
          </label>
          <Textarea
            id="description"
            v-model="form.description"
            class="w-full"
            rows="3"
            placeholder="Descrição opcional do clip"
            maxlength="500"
          />
          <small class="text-gray-500 text-xs">
            {{ (form.description || '').length }}/500 caracteres
          </small>
        </div>

        <!-- Time Points -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <!-- In Point -->
          <div>
            <label
              for="inPoint"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              Ponto de Entrada (IN) *
            </label>
            <div class="flex items-center space-x-2">
              <InputNumber
                id="inPoint"
                v-model="form.inPoint"
                :class="{ 'p-invalid': errors.inPoint }"
                :min="0"
                :max="maxDuration"
                :step="0.1"
                :format="false"
                class="flex-1"
                placeholder="0.0"
              />
              <span class="text-sm text-gray-500">s</span>
            </div>
            <small
              v-if="errors.inPoint"
              class="p-error"
            >{{ errors.inPoint }}</small>
            <small class="text-gray-500 text-xs">
              {{ formatTime(form.inPoint || 0) }}
            </small>
          </div>

          <!-- Out Point -->
          <div>
            <label
              for="outPoint"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              Ponto de Saída (OUT) *
            </label>
            <div class="flex items-center space-x-2">
              <InputNumber
                id="outPoint"
                v-model="form.outPoint"
                :class="{ 'p-invalid': errors.outPoint }"
                :min="0"
                :max="maxDuration"
                :step="0.1"
                :format="false"
                class="flex-1"
                placeholder="0.0"
              />
              <span class="text-sm text-gray-500">s</span>
            </div>
            <small
              v-if="errors.outPoint"
              class="p-error"
            >{{ errors.outPoint }}</small>
            <small class="text-gray-500 text-xs">
              {{ formatTime(form.outPoint || 0) }}
            </small>
          </div>
        </div>

        <!-- Duration Display -->
        <div
          v-if="form.inPoint !== null && form.outPoint !== null"
          class="mb-4 p-3 rounded-lg"
          :class="clipDuration >= 2 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'"
        >
          <div class="flex items-center justify-between">
            <div>
              <span class="text-sm font-medium">Duração do Clip:</span>
              <span
                class="ml-2 font-mono text-lg"
                :class="clipDuration >= 2 ? 'text-green-700' : 'text-red-700'"
              >
                {{ formatDuration(clipDuration) }}
              </span>
            </div>
            <Badge
              :value="clipDuration >= 2 ? 'Válido' : 'Muito Curto'"
              :severity="clipDuration >= 2 ? 'success' : 'danger'"
            />
          </div>
          
          <div
            v-if="clipDuration < 2"
            class="mt-2 text-sm text-red-600"
          >
            <i class="pi pi-exclamation-triangle mr-1" />
            Duração mínima do clip é de 2 segundos
          </div>
        </div>

        <!-- Tags -->
        <div class="mb-6">
          <label
            for="tags"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Tags
          </label>
          
          <!-- Current Tags -->
          <div
            v-if="form.tags.length > 0"
            class="flex flex-wrap gap-2 mb-3"
          >
            <div
              v-for="tag in form.tags"
              :key="tag"
              class="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm cursor-pointer hover:bg-blue-200"
              @click="removeTag(tag)"
            >
              <span>{{ tag }}</span>
              <i class="pi pi-times ml-1 text-xs" />
            </div>
          </div>

          <!-- Tag Input -->
          <AutoComplete
            v-model="newTag"
            :suggestions="filteredTags"
            placeholder="Digite uma tag e pressione Enter"
            class="w-full"
            @complete="searchTags"
            @keydown.enter="addTag"
            @item-select="onTagSelect"
          />
          
          <!-- Quick Tags -->
          <div class="mt-2">
            <span class="text-xs text-gray-600 mr-2">Tags sugeridas:</span>
            <Button
              v-for="quickTag in quickTags"
              :key="quickTag"
              :label="quickTag"
              severity="secondary"
              size="small"
              text
              class="mr-1 mb-1"
              @click="addQuickTag(quickTag)"
            />
          </div>
          
          <small class="text-gray-500 text-xs">
            Clique nas tags para remover • Max: 10 tags
          </small>
        </div>

        <!-- Preview -->
        <div
          v-if="form.inPoint !== null && form.outPoint !== null && clipDuration >= 2"
          class="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
        >
          <div class="flex items-center justify-between mb-3">
            <h4 class="font-medium text-blue-900">
              Preview do Clip
            </h4>
            <Button
              label="Testar Clip"
              icon="pi pi-play"
              size="small"
              @click="previewClip"
            />
          </div>
          
          <div class="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span class="text-blue-700 font-medium">Início:</span>
              <div class="font-mono">
                {{ formatTime(form.inPoint) }}
              </div>
            </div>
            <div>
              <span class="text-blue-700 font-medium">Fim:</span>
              <div class="font-mono">
                {{ formatTime(form.outPoint) }}
              </div>
            </div>
            <div>
              <span class="text-blue-700 font-medium">Duração:</span>
              <div class="font-mono">
                {{ formatDuration(clipDuration) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Validation Messages -->
        <div
          v-if="validationResult && !validationResult.isValid"
          class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <h4 class="font-medium text-red-900 mb-2">
            Erros de Validação:
          </h4>
          <ul class="text-sm text-red-700 space-y-1">
            <li
              v-for="error in validationResult.errors"
              :key="error"
            >
              <i class="pi pi-times-circle mr-1" />
              {{ error }}
            </li>
          </ul>
        </div>

        <!-- Warnings -->
        <div
          v-if="validationResult && validationResult.warnings.length > 0"
          class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
        >
          <h4 class="font-medium text-yellow-900 mb-2">
            Avisos:
          </h4>
          <ul class="text-sm text-yellow-700 space-y-1">
            <li
              v-for="warning in validationResult.warnings"
              :key="warning"
            >
              <i class="pi pi-exclamation-triangle mr-1" />
              {{ warning }}
            </li>
          </ul>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            label="Cancelar"
            severity="secondary"
            @click="$emit('update:visible', false)"
          />
          <Button
            type="submit"
            :label="isEditing ? 'Atualizar Clip' : 'Criar Clip'"
            :loading="clipStore.loading"
            :disabled="!isFormValid"
          />
        </div>
      </form>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import InputNumber from 'primevue/inputnumber'
import AutoComplete from 'primevue/autocomplete'
import Button from 'primevue/button'
import Badge from 'primevue/badge'
import { useClipStore } from '../../../app/stores'
import type { Asset, Clip, ClipFormData, ClipValidation } from '../../../shared/types'

const props = defineProps<{
  visible: boolean
  asset: Asset | null
  clip?: Clip
  initialInPoint?: number
  initialOutPoint?: number
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  success: [clip: Clip]
  preview: [data: { inPoint: number; outPoint: number }]
}>()

const clipStore = useClipStore()

const isEditing = computed(() => !!props.clip)

// Form state
const form = ref<ClipFormData>({
  title: '',
  description: '',
  inPoint: 0,
  outPoint: 0,
  tags: []
})

const errors = ref({
  title: '',
  inPoint: '',
  outPoint: ''
})

const newTag = ref('')
const filteredTags = ref<string[]>([])
const validationResult = ref<ClipValidation | null>(null)

// Computed
const maxDuration = computed(() => props.asset?.duration || 3600)

const clipDuration = computed(() => {
  if (form.value.inPoint !== null && form.value.outPoint !== null) {
    return Math.max(0, form.value.outPoint - form.value.inPoint)
  }
  return 0
})

const isFormValid = computed(() => {
  return form.value.title.trim() !== '' &&
         form.value.inPoint !== null &&
         form.value.outPoint !== null &&
         form.value.inPoint < form.value.outPoint &&
         clipDuration.value >= 2
})

const quickTags = computed(() => {
  const assetType = props.asset?.type
  const commonTags = ['importante', 'destaque', 'intro', 'outro', 'transição']
  
  const typeSpecificTags = {
    video: ['entrevista', 'sonora', 'standup', 'externas', 'vinheta'],
    audio: ['trilha', 'efeito', 'narração', 'música', 'ambiente']
  }
  
  const suggested = [
    ...commonTags,
    ...(typeSpecificTags[assetType as keyof typeof typeSpecificTags] || [])
  ]
  
  return suggested.filter(tag => !form.value.tags.includes(tag)).slice(0, 6)
})

// Methods
const loadClipData = () => {
  if (props.clip) {
    form.value = {
      title: props.clip.title,
      description: props.clip.description || '',
      inPoint: props.clip.inPoint,
      outPoint: props.clip.outPoint,
      tags: [...props.clip.tags]
    }
  } else {
    // New clip with initial points
    form.value = {
      title: '',
      description: '',
      inPoint: props.initialInPoint || 0,
      outPoint: props.initialOutPoint || (props.asset?.duration || 30),
      tags: []
    }
  }
}

const resetForm = () => {
  form.value = {
    title: '',
    description: '',
    inPoint: 0,
    outPoint: 0,
    tags: []
  }
  errors.value = {
    title: '',
    inPoint: '',
    outPoint: ''
  }
  validationResult.value = null
}

const validateForm = () => {
  if (!props.asset) return false

  validationResult.value = clipStore.validateClip(form.value)
  
  // Clear previous errors
  errors.value = {
    title: '',
    inPoint: '',
    outPoint: ''
  }

  // Set specific field errors
  if (!form.value.title.trim()) {
    errors.value.title = 'Título é obrigatório'
  }

  if (form.value.inPoint >= form.value.outPoint) {
    errors.value.inPoint = 'Ponto de entrada deve ser menor que saída'
    errors.value.outPoint = 'Ponto de saída deve ser maior que entrada'
  }

  return validationResult.value.isValid
}

const handleSubmit = async () => {
  if (!props.asset || !validateForm()) return

  try {
    let result: Clip | undefined

    if (isEditing.value && props.clip) {
      result = await clipStore.updateClip(props.clip.id, form.value)
    } else {
      result = await clipStore.createClip(props.asset.id, form.value)
    }

    if (result) {
      emit('success', result)
      emit('update:visible', false)
      resetForm()
    }
  } catch {
    // Error already handled by store
  }
}

const previewClip = () => {
  emit('preview', {
    inPoint: form.value.inPoint,
    outPoint: form.value.outPoint
  })
}

// Tag management
const searchTags = (event: any) => {
  const query = event.query.toLowerCase()
  filteredTags.value = clipStore.mockTags.filter(tag => 
    tag.toLowerCase().includes(query) && !form.value.tags.includes(tag)
  )
}

const addTag = () => {
  const tag = newTag.value.trim().toLowerCase()
  if (tag && !form.value.tags.includes(tag) && form.value.tags.length < 10) {
    form.value.tags.push(tag)
    newTag.value = ''
  }
}

const onTagSelect = (event: any) => {
  const tag = event.value
  if (tag && !form.value.tags.includes(tag) && form.value.tags.length < 10) {
    form.value.tags.push(tag)
    newTag.value = ''
  }
}

const addQuickTag = (tag: string) => {
  if (!form.value.tags.includes(tag) && form.value.tags.length < 10) {
    form.value.tags.push(tag)
  }
}

const removeTag = (tag: string) => {
  const index = form.value.tags.indexOf(tag)
  if (index !== -1) {
    form.value.tags.splice(index, 1)
  }
}

// Utility functions
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 10)
  return `${minutes}:${secs.toString().padStart(2, '0')}.${ms}`
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
watch(() => props.visible, (visible) => {
  if (visible) {
    loadClipData()
  } else {
    resetForm()
  }
})

watch(() => [form.value.inPoint, form.value.outPoint], () => {
  if (form.value.inPoint !== null && form.value.outPoint !== null) {
    validateForm()
  }
}, { deep: true })
</script>

<style scoped>
.clip-form {
  max-height: 80vh;
  overflow-y: auto;
}
</style>

