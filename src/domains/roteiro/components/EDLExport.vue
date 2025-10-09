<template>
  <div class="edl-export">
    <!-- Export Button -->
    <Button
      :label="buttonLabel"
      :icon="buttonIcon"
      :severity="buttonSeverity"
      :loading="isExporting"
      :disabled="!canExport"
      @click="showExportDialog = true"
    />

    <!-- Export Dialog -->
    <Dialog
      :visible="showExportDialog"
      :modal="true"
      :closable="true"
      header="Exportar EDL (Edit Decision List)"
      class="w-full max-w-3xl"
      @update:visible="showExportDialog = $event"
    >
      <div class="space-y-6">
        <!-- Export Info -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-center space-x-3">
            <i class="pi pi-info-circle text-blue-600" />
            <div>
              <h4 class="font-medium text-blue-900">
                Sobre o EDL
              </h4>
              <p class="text-sm text-blue-700 mt-1">
                O EDL (Edit Decision List) é um arquivo JSON que contém todas as informações 
                necessárias para a montagem automática do vídeo final.
              </p>
            </div>
          </div>
        </div>

        <!-- Language Selection -->
        <div>
          <h4 class="text-lg font-medium text-gray-900 mb-3">
            Configurações de Exportação
          </h4>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Idioma para Locução
              </label>
              <Dropdown
                v-model="selectedLanguage"
                :options="languageOptions"
                option-label="label"
                option-value="value"
                placeholder="Selecionar idioma"
                class="w-full"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Volume Alvo (LUFS)
              </label>
              <InputNumber
                v-model="targetLufs"
                :min="-30"
                :max="-6"
                :step="1"
                suffix=" LUFS"
                class="w-full"
              />
            </div>
          </div>
        </div>

        <!-- Validation Section -->
        <div v-if="validationResult">
          <h4 class="text-lg font-medium text-gray-900 mb-3">
            Validação da Timeline
          </h4>
          
          <!-- Validation Summary -->
          <div class="grid grid-cols-3 gap-4 mb-4">
            <div
              class="text-center p-3 rounded-lg"
              :class="validationResult.isValid ? 'bg-green-100' : 'bg-red-100'"
            >
              <div
                class="text-2xl font-bold"
                :class="validationResult.isValid ? 'text-green-600' : 'text-red-600'"
              >
                {{ validationResult.isValid ? '✓' : '✗' }}
              </div>
              <div
                class="text-sm font-medium"
                :class="validationResult.isValid ? 'text-green-700' : 'text-red-700'"
              >
                {{ validationResult.isValid ? 'Válido' : 'Inválido' }}
              </div>
            </div>
            
            <div class="text-center p-3 bg-yellow-100 rounded-lg">
              <div class="text-2xl font-bold text-yellow-600">
                {{ validationResult.gaps.length }}
              </div>
              <div class="text-sm font-medium text-yellow-700">
                Lacunas
              </div>
            </div>
            
            <div class="text-center p-3 bg-red-100 rounded-lg">
              <div class="text-2xl font-bold text-red-600">
                {{ validationResult.overlaps.length }}
              </div>
              <div class="text-sm font-medium text-red-700">
                Sobreposições
              </div>
            </div>
          </div>

          <!-- Duration Info -->
          <div class="bg-gray-50 rounded-lg p-4 mb-4">
            <div class="flex justify-between items-center text-sm">
              <span class="text-gray-600">Duração Total:</span>
              <span class="font-medium text-gray-900">
                {{ formatDuration(validationResult.totalDurationMs) }}
              </span>
            </div>
          </div>

          <!-- Issues List -->
          <div v-if="validationResult.errors.length > 0 || validationResult.warnings.length > 0">
            <Accordion :multiple="true">
              <AccordionTab v-if="validationResult.errors.length > 0">
                <template #header>
                  <div class="flex items-center space-x-2">
                    <i class="pi pi-exclamation-triangle text-red-500" />
                    <span class="font-medium">Erros ({{ validationResult.errors.length }})</span>
                  </div>
                </template>
                
                <div class="space-y-2">
                  <div
                    v-for="(error, index) in validationResult.errors"
                    :key="`error-${index}`"
                    class="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700"
                  >
                    {{ error }}
                  </div>
                </div>
              </AccordionTab>
              
              <AccordionTab v-if="validationResult.warnings.length > 0">
                <template #header>
                  <div class="flex items-center space-x-2">
                    <i class="pi pi-exclamation-circle text-yellow-500" />
                    <span class="font-medium">Avisos ({{ validationResult.warnings.length }})</span>
                  </div>
                </template>
                
                <div class="space-y-2">
                  <div
                    v-for="(warning, index) in validationResult.warnings"
                    :key="`warning-${index}`"
                    class="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700"
                  >
                    {{ warning }}
                  </div>
                </div>
              </AccordionTab>
            </Accordion>
          </div>
        </div>

        <!-- Preview Section -->
        <div v-if="edlPreview">
          <h4 class="text-lg font-medium text-gray-900 mb-3">
            Preview do EDL
          </h4>
          
          <div class="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto max-h-64">
            <pre>{{ JSON.stringify(edlPreview, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between">
          <div class="flex space-x-2">
            <Button
              label="Validar"
              icon="pi pi-check"
              severity="info"
              @click="validateTimeline"
            />
            <Button
              label="Preview"
              icon="pi pi-eye"
              severity="secondary"
              @click="generatePreview"
            />
          </div>
          
          <div class="flex space-x-2">
            <Button
              label="Cancelar"
              severity="secondary"
              @click="showExportDialog = false"
            />
            <Button
              label="Exportar EDL"
              icon="pi pi-download"
              :disabled="!canExportNow"
              :loading="isExporting"
              @click="exportEDL"
            />
          </div>
        </div>
      </template>
    </Dialog>

    <!-- Success Toast (manual) -->
    <div
      v-if="showSuccessToast"
      class="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out"
    >
      <div class="flex items-center space-x-2">
        <i class="pi pi-check-circle" />
        <span>EDL exportado com sucesso!</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import { useRoteiroStore, useToastStore } from '../../../app/stores'
import type { EDL, EDLValidationResult } from '../../../shared/types'

// Props
const props = defineProps<{
  roteiroId?: string
  compact?: boolean
}>()

const roteiroStore = useRoteiroStore()
const toastStore = useToastStore()

// State
const showExportDialog = ref(false)
const isExporting = ref(false)
const selectedLanguage = ref('pt')
const targetLufs = ref(-16)
const validationResult = ref<EDLValidationResult | null>(null)
const edlPreview = ref<EDL | null>(null)
const showSuccessToast = ref(false)

// Language options
const languageOptions = [
  { label: '🇧🇷 Português', value: 'pt' },
  { label: '🇺🇸 English', value: 'en' },
  { label: '🇪🇸 Español', value: 'es' },
  { label: '🇫🇷 Français', value: 'fr' }
]

// Computed
const currentRoteiro = computed(() => roteiroStore.currentRoteiro)

const canExport = computed(() => {
  return (props.roteiroId || currentRoteiro.value?.id) !== undefined
})

const canExportNow = computed(() => {
  return canExport.value && (!validationResult.value || validationResult.value.errors.length === 0)
})

const buttonLabel = computed(() => {
  if (props.compact) return ''
  return isExporting.value ? 'Exportando...' : 'Exportar EDL'
})

const buttonIcon = computed(() => {
  return isExporting.value ? 'pi pi-spin pi-spinner' : 'pi pi-download'
})

const buttonSeverity = computed(() => {
  if (!canExport.value) return 'secondary'
  if (validationResult.value && !validationResult.value.isValid) return 'warning'
  return 'success'
})

// Methods
const validateTimeline = () => {
  const roteiroId = props.roteiroId || currentRoteiro.value?.id
  if (!roteiroId) return
  
  validationResult.value = roteiroStore.validateEDL(roteiroId, selectedLanguage.value)
  toastStore.info('Validação Completa', 
    validationResult.value.isValid 
      ? 'Timeline válida para exportação' 
      : `${validationResult.value.errors.length} erros encontrados`
  )
}

const generatePreview = () => {
  const roteiroId = props.roteiroId || currentRoteiro.value?.id
  if (!roteiroId) return
  
  edlPreview.value = roteiroStore.generateEDL(roteiroId, selectedLanguage.value)
  toastStore.info('Preview Gerado', 'Preview do EDL atualizado')
}

const exportEDL = async () => {
  const roteiroId = props.roteiroId || currentRoteiro.value?.id
  if (!roteiroId) return
  
  isExporting.value = true
  
  try {
    const success = roteiroStore.exportEDL(roteiroId, selectedLanguage.value)
    
    if (success) {
      showExportDialog.value = false
      showSuccessToast.value = true
      
      toastStore.success('Exportação Concluída', 
        `EDL exportado em ${selectedLanguage.value.toUpperCase()}`)
    } else {
      toastStore.error('Erro na Exportação', 'Falha ao exportar o EDL')
    }
  } finally {
    isExporting.value = false
  }
}

const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  if (minutes > 0) {
    return `${minutes}min ${remainingSeconds}s`
  }
  return `${remainingSeconds}s`
}

// Auto-validate when dialog opens
watch(showExportDialog, (isOpen) => {
  if (isOpen) {
    validateTimeline()
    generatePreview()
  }
})

// Reset validation when language changes
watch(selectedLanguage, () => {
  validationResult.value = null
  edlPreview.value = null
})
</script>

<style scoped>
.animate-fade-in-out {
  animation: fadeInOut 3s ease-in-out;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-10px); }
  15% { opacity: 1; transform: translateY(0); }
  85% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-10px); }
}

/* Custom scrollbar for JSON preview */
.overflow-auto::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>

