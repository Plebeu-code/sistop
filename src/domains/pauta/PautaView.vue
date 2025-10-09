<template>
  <div class="pauta-module">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          Pautas
        </h1>
        <p class="text-gray-600 mt-1">
          Gerencie o planejamento e produção de conteúdo
        </p>
      </div>
      
      <div class="flex gap-3">
        <!-- View Toggle -->
        <div class="flex bg-gray-100 rounded-lg p-1">
          <Button
            icon="pi pi-table"
            :class="{ '!bg-white shadow-sm': viewMode === 'kanban' }"
            text
            size="small"
            @click="viewMode = 'kanban'"
          />
          <Button
            icon="pi pi-list"
            :class="{ '!bg-white shadow-sm': viewMode === 'list' }"
            text
            size="small"
            @click="viewMode = 'list'"
          />
        </div>

        <!-- Create Button -->
        <Button
          v-can="'create_pauta'"
          label="Nova Pauta"
          icon="pi pi-plus"
          @click="showCreateDialog = true"
        />
      </div>
    </div>

    <!-- Kanban View -->
    <PautaKanban
      v-if="viewMode === 'kanban'"
      @edit-pauta="handleEditPauta"
      @delete-pauta="handleDeletePauta"
      @start-production="handleStartProduction"
    />

    <!-- List View (Future implementation) -->
    <div
      v-else
      class="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
    >
      <div class="text-center text-gray-500">
        <i class="pi pi-list text-4xl mb-4" />
        <h3 class="text-lg font-medium mb-2">
          Visualização em Lista
        </h3>
        <p>Em desenvolvimento...</p>
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <PautaForm
      v-model:visible="showCreateDialog"
      :pauta="selectedPauta"
      @success="handlePautaSuccess"
    />

    <!-- Delete Confirmation Dialog -->
    <Dialog
      :visible="showDeleteDialog"
      :modal="true"
      :closable="true"
      header="Confirmar Exclusão"
      class="w-full max-w-md"
      @update:visible="showDeleteDialog = $event"
    >
      <div class="flex items-start space-x-3">
        <i class="pi pi-exclamation-triangle text-orange-500 text-xl mt-1" />
        <div>
          <p class="text-gray-700 mb-4">
            Tem certeza que deseja excluir a pauta 
            <strong>"{{ selectedPauta?.titulo }}"</strong>?
          </p>
          <p class="text-sm text-gray-500">
            Esta ação não pode ser desfeita.
          </p>
        </div>
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
            :loading="pautaStore.loading"
            @click="confirmDelete"
          />
        </div>
      </template>
    </Dialog>

    <!-- Start Production Confirmation -->
    <Dialog
      :visible="showProductionDialog"
      :modal="true"
      :closable="true"
      header="Iniciar Produção"
      class="w-full max-w-md"
      @update:visible="showProductionDialog = $event"
    >
      <div class="flex items-start space-x-3">
        <i class="pi pi-play-circle text-blue-500 text-xl mt-1" />
        <div>
          <p class="text-gray-700 mb-4">
            Deseja iniciar a produção da pauta 
            <strong>"{{ selectedPauta?.titulo }}"</strong>?
          </p>
          <p class="text-sm text-gray-500">
            O status será alterado para "Em Produção" e será registrado no histórico.
          </p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <Button
            label="Cancelar"
            severity="secondary"
            @click="showProductionDialog = false"
          />
          <Button
            label="Iniciar Produção"
            icon="pi pi-play"
            :loading="pautaStore.loading"
            @click="confirmStartProduction"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import PautaForm from './components/PautaForm.vue'
import PautaKanban from './components/PautaKanban.vue'
import { usePautaStore, useToastStore } from '../../app/stores'
import type { Pauta } from '../../shared/types'

const pautaStore = usePautaStore()
const toastStore = useToastStore()

const viewMode = ref<'kanban' | 'list'>('kanban')
const showCreateDialog = ref(false)
const showDeleteDialog = ref(false)
const showProductionDialog = ref(false)
const selectedPauta = ref<Pauta | undefined>(undefined)

const handleEditPauta = (pauta: Pauta) => {
  selectedPauta.value = pauta
  showCreateDialog.value = true
}

const handleDeletePauta = (pauta: Pauta) => {
  selectedPauta.value = pauta
  showDeleteDialog.value = true
}

const handleStartProduction = (pauta: Pauta) => {
  selectedPauta.value = pauta
  showProductionDialog.value = true
}

const handlePautaSuccess = () => {
  if (selectedPauta.value) {
    toastStore.success('Sucesso', 'Pauta atualizada com sucesso!')
  } else {
    toastStore.success('Sucesso', 'Pauta criada com sucesso!')
  }
  selectedPauta.value = undefined
}

const confirmDelete = async () => {
  if (!selectedPauta.value) return

  try {
    await pautaStore.deletePauta(selectedPauta.value.id)
    toastStore.success('Sucesso', 'Pauta excluída com sucesso!')
    showDeleteDialog.value = false
    selectedPauta.value = undefined
  } catch {
    toastStore.error('Erro', 'Erro ao excluir pauta')
  }
}

const confirmStartProduction = async () => {
  if (!selectedPauta.value) return

  try {
    await pautaStore.iniciarProducao(selectedPauta.value.id)
    toastStore.success('Sucesso', 'Produção iniciada com sucesso!')
    showProductionDialog.value = false
    selectedPauta.value = undefined
  } catch {
    toastStore.error('Erro', 'Erro ao iniciar produção')
  }
}

// Watch dialog visibility to reset selection
import { watch } from 'vue'
watch([showCreateDialog, showDeleteDialog, showProductionDialog], () => {
  if (!showCreateDialog.value && !showDeleteDialog.value && !showProductionDialog.value) {
    selectedPauta.value = undefined
  }
})
</script>

<style scoped>
.pauta-module {
  @apply p-6;
}
</style>

