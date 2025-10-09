<template>
  <Dialog
    :visible="visible"
    :modal="true"
    :closable="true"
    :header="isEditing ? 'Editar Metadados do Asset' : 'Asset'"
    class="w-full max-w-4xl"
    @update:visible="$emit('update:visible', $event)"
  >
    <div
      v-if="asset"
      class="asset-metadata-form"
    >
      <!-- Asset Preview -->
      <div class="mb-6 p-4 bg-gray-50 rounded-lg">
        <div class="flex items-start space-x-4">
          <!-- Preview Thumbnail -->
          <div class="preview-thumbnail w-24 h-16 bg-gray-200 rounded flex items-center justify-center">
            <i
              class="text-2xl"
              :class="getFileIcon(asset.type)"
            />
          </div>
          
          <!-- Asset Info -->
          <div class="flex-1">
            <h4 class="font-semibold text-gray-900">
              {{ asset.title || asset.originalName }}
            </h4>
            <p class="text-sm text-gray-600">
              {{ asset.filename }}
            </p>
            <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span>{{ getTypeLabel(asset.type) }}</span>
              <span>{{ formatBytes(asset.size) }}</span>
              <span v-if="asset.duration">{{ formatDuration(asset.duration) }}</span>
              <Badge
                :value="getStatusLabel(asset.status)"
                :severity="getStatusSeverity(asset.status)"
              />
            </div>
          </div>
        </div>
      </div>

      <form @submit.prevent="handleSubmit">
        <!-- Basic Metadata -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- Title -->
          <div>
            <label
              for="title"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              Título *
            </label>
            <InputText
              id="title"
              v-model="form.title"
              :class="{ 'p-invalid': errors.title }"
              class="w-full"
              placeholder="Título do asset"
            />
            <small
              v-if="errors.title"
              class="p-error"
            >{{ errors.title }}</small>
          </div>

          <!-- Category -->
          <div>
            <label
              for="category"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              Categoria
            </label>
            <Dropdown
              id="category"
              v-model="form.category"
              :options="assetStore.mockCategories"
              placeholder="Selecione uma categoria"
              class="w-full"
              show-clear
            />
          </div>

          <!-- Fornecedor -->
          <div>
            <label
              for="fornecedor"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              Fornecedor
            </label>
            <Dropdown
              id="fornecedor"
              v-model="form.fornecedor"
              :options="assetStore.mockFornecedores"
              placeholder="Selecione o fornecedor"
              class="w-full"
              show-clear
            />
          </div>

          <!-- License Type -->
          <div>
            <label
              for="licenseType"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              Tipo de Licença *
            </label>
            <Dropdown
              id="licenseType"
              v-model="form.licenseType"
              :options="licenseTypeOptions"
              option-label="label"
              option-value="value"
              placeholder="Selecione o tipo de licença"
              :class="{ 'p-invalid': errors.licenseType }"
              class="w-full"
            />
            <small
              v-if="errors.licenseType"
              class="p-error"
            >{{ errors.licenseType }}</small>
          </div>

          <!-- Rights Type -->
          <div>
            <label
              for="rightsType"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              Tipo de Direitos *
            </label>
            <Dropdown
              id="rightsType"
              v-model="form.rightsType"
              :options="rightsTypeOptions"
              option-label="label"
              option-value="value"
              placeholder="Selecione o tipo de direitos"
              :class="{ 'p-invalid': errors.rightsType }"
              class="w-full"
            />
            <small
              v-if="errors.rightsType"
              class="p-error"
            >{{ errors.rightsType }}</small>
          </div>

          <!-- Copyright Holder -->
          <div>
            <label
              for="copyrightHolder"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              Detentor dos Direitos
            </label>
            <InputText
              id="copyrightHolder"
              v-model="form.copyrightHolder"
              class="w-full"
              placeholder="Nome do detentor dos direitos"
            />
          </div>

          <!-- Expiration Date -->
          <div v-if="form.licenseType === 'licensed'">
            <label
              for="expirationDate"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              Data de Expiração
            </label>
            <Calendar
              id="expirationDate"
              v-model="form.expirationDate"
              date-format="dd/mm/yy"
              placeholder="Data de expiração da licença"
              class="w-full"
              update-model-type="date"
            />
          </div>
        </div>

        <!-- Description -->
        <div class="mb-6">
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
            placeholder="Descrição detalhada do asset"
          />
        </div>

        <!-- Tags -->
        <div class="mb-6">
          <label
            for="tags"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Tags
          </label>
          <div class="flex flex-wrap gap-2 mb-3">
            <div
              v-for="tag in form.tags"
              :key="tag"
              class="inline-flex items-center px-2 py-1 bg-gray-200 text-gray-800 rounded text-sm cursor-pointer hover:bg-gray-300"
              @click="removeTag(tag)"
            >
              <span>{{ tag }}</span>
              <i class="pi pi-times ml-1 text-xs" />
            </div>
          </div>
          <AutoComplete
            v-model="newTag"
            :suggestions="filteredTags"
            placeholder="Digite uma tag e pressione Enter"
            class="w-full"
            @complete="searchTags"
            @keydown.enter="addTag"
            @item-select="onTagSelect"
          />
          <small class="text-gray-500 text-xs">
            Digite tags e pressione Enter. Clique nas tags para remover.
          </small>
        </div>

        <!-- License Details -->
        <div class="mb-6">
          <label
            for="licenseDetails"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Detalhes da Licença
          </label>
          <Textarea
            id="licenseDetails"
            v-model="form.licenseDetails"
            class="w-full"
            rows="2"
            placeholder="Informações adicionais sobre a licença"
          />
        </div>

        <!-- Video Intelligence (Read-only) -->
        <div
          v-if="asset.videoIntelligence && asset.type === 'video'"
          class="mb-6"
        >
          <h4 class="text-sm font-medium text-gray-700 mb-3">
            Video Intelligence (Simulado)
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">
                Labels Detectadas
              </label>
              <div class="flex flex-wrap gap-1">
                <Badge
                  v-for="label in asset.videoIntelligence.labels"
                  :key="label"
                  :value="label"
                  severity="info"
                  class="text-xs"
                />
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">
                Texto Detectado
              </label>
              <div class="flex flex-wrap gap-1">
                <Badge
                  v-for="text in asset.videoIntelligence.text"
                  :key="text"
                  :value="text"
                  severity="secondary"
                  class="text-xs"
                />
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">
                Rostos Detectados
              </label>
              <span class="text-sm">{{ asset.videoIntelligence.faces }}</span>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">
                Cenas
              </label>
              <span class="text-sm">{{ asset.videoIntelligence.scenes }}</span>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">
                Conteúdo Adulto
              </label>
              <Badge
                :value="asset.videoIntelligence.adult ? 'Sim' : 'Não'"
                :severity="asset.videoIntelligence.adult ? 'danger' : 'success'"
                class="text-xs"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">
                Violência
              </label>
              <Badge
                :value="asset.videoIntelligence.violence ? 'Sim' : 'Não'"
                :severity="asset.videoIntelligence.violence ? 'danger' : 'success'"
                class="text-xs"
              />
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-between pt-6 border-t">
          <div class="flex gap-2">
            <Button
              v-if="asset.status === 'staging'"
              label="Aprovar Asset"
              icon="pi pi-check"
              severity="success"
              :loading="assetStore.loading"
              @click="handleApprove"
            />
            <Button
              v-if="asset.status === 'staging'"
              label="Rejeitar Asset"
              icon="pi pi-times"
              severity="danger"
              :loading="assetStore.loading"
              @click="showRejectDialog = true"
            />
          </div>
          
          <div class="flex gap-3">
            <Button
              type="button"
              label="Cancelar"
              severity="secondary"
              @click="$emit('update:visible', false)"
            />
            <Button
              type="submit"
              label="Salvar Metadados"
              :loading="assetStore.loading"
              :disabled="!isFormValid"
            />
          </div>
        </div>
      </form>
    </div>

    <!-- Reject Dialog -->
    <Dialog
      :visible="showRejectDialog"
      :modal="true"
      :closable="true"
      header="Rejeitar Asset"
      class="w-full max-w-md"
      @update:visible="showRejectDialog = $event"
    >
      <div class="mb-4">
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
            @click="showRejectDialog = false"
          />
          <Button
            label="Rejeitar"
            severity="danger"
            :loading="assetStore.loading"
            :disabled="!rejectionReason.trim()"
            @click="handleReject"
          />
        </div>
      </template>
    </Dialog>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import Badge from 'primevue/badge'
import Calendar from 'primevue/calendar'
import AutoComplete from 'primevue/autocomplete'
import { useAssetStore } from '../../../app/stores'
import type { Asset } from '../../../shared/types'

const props = defineProps<{
  visible: boolean
  asset?: Asset
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  success: [asset: Asset]
}>()

const assetStore = useAssetStore()

const isEditing = computed(() => !!props.asset)

const form = ref({
  title: '',
  description: '',
  tags: [] as string[],
  category: '',
  fornecedor: '',
  licenseType: '',
  rightsType: '',
  licenseDetails: '',
  copyrightHolder: '',
  expirationDate: null as Date | null
})

const errors = ref({
  title: '',
  licenseType: '',
  rightsType: ''
})

const newTag = ref('')
const filteredTags = ref<string[]>([])
const showRejectDialog = ref(false)
const rejectionReason = ref('')

const licenseTypeOptions = [
  { label: 'Royalty Free', value: 'royalty_free' },
  { label: 'Creative Commons', value: 'creative_commons' },
  { label: 'Licenciado', value: 'licensed' },
  { label: 'Personalizado', value: 'custom' }
]

const rightsTypeOptions = [
  { label: 'Direitos Completos', value: 'full' },
  { label: 'Direitos Limitados', value: 'limited' },
  { label: 'Direitos Restritos', value: 'restricted' }
]

const isFormValid = computed(() => {
  return form.value.title.trim() !== '' &&
         form.value.licenseType !== '' &&
         form.value.rightsType !== ''
})

const validateForm = () => {
  errors.value = {
    title: '',
    licenseType: '',
    rightsType: ''
  }

  if (!form.value.title.trim()) {
    errors.value.title = 'Título é obrigatório'
  }

  if (!form.value.licenseType) {
    errors.value.licenseType = 'Tipo de licença é obrigatório'
  }

  if (!form.value.rightsType) {
    errors.value.rightsType = 'Tipo de direitos é obrigatório'
  }

  return Object.values(errors.value).every(error => error === '')
}

const loadAssetData = () => {
  if (props.asset) {
    form.value = {
      title: props.asset.title || '',
      description: props.asset.description || '',
      tags: [...props.asset.tags],
      category: props.asset.category || '',
      fornecedor: props.asset.fornecedor || '',
      licenseType: props.asset.licenseType || '',
      rightsType: props.asset.rightsType || '',
      licenseDetails: props.asset.licenseDetails || '',
      copyrightHolder: props.asset.copyrightHolder || '',
      expirationDate: props.asset.expirationDate || null
    }
  }
}

const resetForm = () => {
  form.value = {
    title: '',
    description: '',
    tags: [],
    category: '',
    fornecedor: '',
    licenseType: '',
    rightsType: '',
    licenseDetails: '',
    copyrightHolder: '',
    expirationDate: null
  }
  errors.value = {
    title: '',
    licenseType: '',
    rightsType: ''
  }
}

const searchTags = (event: any) => {
  const query = event.query.toLowerCase()
  filteredTags.value = assetStore.mockTags.filter(tag => 
    tag.toLowerCase().includes(query) && !form.value.tags.includes(tag)
  )
}

const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !form.value.tags.includes(tag)) {
    form.value.tags.push(tag)
    newTag.value = ''
  }
}

const onTagSelect = (event: any) => {
  const tag = event.value
  if (tag && !form.value.tags.includes(tag)) {
    form.value.tags.push(tag)
    newTag.value = ''
  }
}

const removeTag = (tag: string) => {
  const index = form.value.tags.indexOf(tag)
  if (index !== -1) {
    form.value.tags.splice(index, 1)
  }
}

const handleSubmit = async () => {
  if (!validateForm() || !props.asset) return

  try {
    const metadata = {
      title: form.value.title.trim(),
      description: form.value.description.trim() || undefined,
      tags: form.value.tags,
      category: form.value.category || undefined,
      fornecedor: form.value.fornecedor || undefined,
      licenseType: form.value.licenseType as any,
      rightsType: form.value.rightsType as any,
      licenseDetails: form.value.licenseDetails.trim() || undefined,
      copyrightHolder: form.value.copyrightHolder.trim() || undefined,
      expirationDate: form.value.expirationDate || undefined
    }

    const updatedAsset = await assetStore.updateAssetMetadata(props.asset.id, metadata)
    if (updatedAsset) {
      emit('success', updatedAsset)
    }
    emit('update:visible', false)
    resetForm()
  } catch {
    // Error already handled by store
  }
}

const handleApprove = async () => {
  if (!props.asset) return

  try {
    const approvedAsset = await assetStore.approveAsset(props.asset.id, 'Aprovado via formulário de curadoria')
    if (approvedAsset) {
      emit('success', approvedAsset)
    }
    emit('update:visible', false)
    resetForm()
  } catch {
    // Error already handled by store
  }
}

const handleReject = async () => {
  if (!props.asset || !rejectionReason.value.trim()) return

  try {
    const rejectedAsset = await assetStore.rejectAsset(props.asset.id, rejectionReason.value.trim())
    if (rejectedAsset) {
      emit('success', rejectedAsset)
    }
    emit('update:visible', false)
    showRejectDialog.value = false
    rejectionReason.value = ''
    resetForm()
  } catch {
    // Error already handled by store
  }
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

const getTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    video: 'Vídeo',
    audio: 'Áudio',
    image: 'Imagem',
    document: 'Documento'
  }
  return labels[type] || type
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

// Watchers
watch(() => props.visible, (visible) => {
  if (visible) {
    if (props.asset) {
      loadAssetData()
    } else {
      resetForm()
    }
  }
})

watch(() => showRejectDialog.value, (visible) => {
  if (!visible) {
    rejectionReason.value = ''
  }
})
</script>

