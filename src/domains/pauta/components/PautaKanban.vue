<template>
  <div class="pauta-kanban">
    <!-- Filtros -->
    <div class="mb-6 bg-gray-50 p-4 rounded-lg">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Buscar
          </label>
          <InputText
            v-model="filters.search"
            placeholder="Título, objetivo..."
            class="w-full"
          />
        </div>
        
        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Canal
          </label>
          <Dropdown
            v-model="filters.canal"
            :options="canalOptions"
            option-label="nome"
            option-value="id"
            placeholder="Todos os canais"
            class="w-full"
            show-clear
          />
        </div>

        <div>
          <label
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Roteirista
          </label>
          <Dropdown
            v-model="filters.roteirista"
            :options="roteiristaOptions"
            option-label="name"
            option-value="id"
            placeholder="Todos roteiristas"
            class="w-full"
            show-clear
          />
        </div>

        <div class="flex items-end">
          <Button
            label="Limpar Filtros"
            icon="pi pi-filter-slash"
            severity="secondary"
            @click="clearFilters"
          />
        </div>
      </div>
    </div>

    <!-- Kanban Board -->
    <div class="kanban-board grid grid-cols-1 lg:grid-cols-5 gap-4">
      <div
        v-for="status in statusColumns"
        :key="status.key"
        class="kanban-column bg-gray-100 rounded-lg p-4"
      >
        <!-- Column Header -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center">
            <div
              class="w-3 h-3 rounded-full mr-2"
              :class="status.colorClass"
            />
            <h3 class="font-semibold text-gray-800">
              {{ status.label }}
            </h3>
            <Badge
              :value="getStatusCount(status.key as PautaStatus)"
              class="ml-2"
              severity="info"
            />
          </div>
        </div>

        <!-- Draggable Cards Container -->
        <div
          :id="`status-${status.key}`"
          class="kanban-cards min-h-[200px] space-y-3"
          @drop="onDrop($event, status.key as PautaStatus)"
          @dragover="onDragOver"
          @dragenter="onDragEnter"
        >
          <div
            v-for="pauta in getFilteredPautasByStatus(status.key as PautaStatus)"
            :key="pauta.id"
            :draggable="canMovePauta(pauta as any)"
            class="kanban-card bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-move hover:shadow-md transition-shadow"
            :class="{ 'opacity-50': !canMovePauta(pauta as any) }"
            @dragstart="onDragStart($event, pauta as any)"
            @dragend="onDragEnd"
          >
            <!-- Card Header -->
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center space-x-2">
                <div
                  class="w-3 h-3 rounded-full"
                  :style="{ backgroundColor: pauta.canal.cor }"
                />
                <span class="text-xs text-gray-500">
                  {{ pauta.canal.nome }}
                </span>
              </div>
              <div class="dropdown-container opacity-0 hover:opacity-100 transition-opacity">
                <Button
                  icon="pi pi-ellipsis-v"
                  text
                  size="small"
                  class="p-0 w-6 h-6"
                  @click="toggleCardMenu(pauta.id)"
                />
                <!-- Simple dropdown menu -->
                <div
                  v-if="activeCardMenu === pauta.id"
                  class="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]"
                >
                  <Button
                    v-can="'edit_pauta'"
                    label="Editar"
                    icon="pi pi-pencil"
                    text
                    size="small"
                    class="w-full justify-start p-2"
                    @click="handleEditPauta(pauta as any)"
                  />
                  <Button
                    v-can="'delete_pauta'"
                    label="Excluir"
                    icon="pi pi-trash"
                    text
                    size="small"
                    severity="danger"
                    class="w-full justify-start p-2"
                    @click="handleDeletePauta(pauta as any)"
                  />
                </div>
              </div>
            </div>

            <!-- Card Content -->
            <div class="mb-3">
              <h4 class="font-medium text-gray-900 text-sm leading-tight mb-2">
                {{ pauta.titulo }}
              </h4>
              <p class="text-xs text-gray-600 line-clamp-2">
                {{ pauta.objetivo }}
              </p>
            </div>

            <!-- Card Metadata -->
            <div class="space-y-2">
              <!-- Idiomas -->
              <div
                v-if="pauta.idiomas.length"
                class="flex flex-wrap gap-1"
              >
                <Badge
                  v-for="idioma in pauta.idiomas.slice(0, 2)"
                  :key="idioma"
                  :value="getIdiomaLabel(idioma)"
                  severity="secondary"
                  class="text-xs"
                />
                <Badge
                  v-if="pauta.idiomas.length > 2"
                  :value="`+${pauta.idiomas.length - 2}`"
                  severity="secondary"
                  class="text-xs"
                />
              </div>

              <!-- Roteirista -->
              <div
                v-if="pauta.roteirista"
                class="flex items-center text-xs text-gray-500"
              >
                <i class="pi pi-user mr-1" />
                {{ pauta.roteirista.name }}
              </div>

              <!-- Data -->
              <div class="flex items-center justify-between text-xs text-gray-500">
                <span>{{ formatDate(pauta.updatedAt.toISOString()) }}</span>
                <span
                  v-if="pauta.refsYoutube.length"
                  class="flex items-center"
                >
                  <i class="pi pi-youtube mr-1" />
                  {{ pauta.refsYoutube.length }}
                </span>
              </div>
            </div>

            <!-- Action Button -->
            <div
              v-if="pauta.status === 'em_planejamento'"
              class="mt-3 pt-3 border-t border-gray-200"
            >
              <Button
                v-can="'start_production'"
                label="Iniciar Produção"
                icon="pi pi-play"
                size="small"
                class="w-full"
                @click="handleStartProduction(pauta as any)"
              />
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-if="getFilteredPautasByStatus(status.key as PautaStatus).length === 0"
            class="flex flex-col items-center justify-center py-8 text-gray-400"
          >
            <i class="pi pi-inbox text-2xl mb-2" />
            <span class="text-sm">Nenhuma pauta</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div
      v-if="pautaStore.loading"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <ProgressSpinner />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import Badge from 'primevue/badge'
import ProgressSpinner from 'primevue/progressspinner'
import { usePautaStore } from '../../../app/stores'
import { IDIOMAS } from '../../../shared/constants'
import type { Pauta, PautaStatus } from '../../../shared/types'

// DOM types - using any for compatibility
type DragEvent = any
type Event = any

const emit = defineEmits<{
  'edit-pauta': [pauta: Pauta]
  'delete-pauta': [pauta: Pauta]
  'start-production': [pauta: Pauta]
}>()

const pautaStore = usePautaStore()

const filters = ref({
  search: '',
  canal: null as string | null,
  roteirista: null as string | null
})

const draggedPauta = ref<Pauta | null>(null)
const activeCardMenu = ref<string | null>(null)

const statusColumns = computed(() => [
  { key: 'rascunho', label: 'Rascunho', colorClass: 'bg-gray-400' },
  { key: 'em_planejamento', label: 'Em Planejamento', colorClass: 'bg-blue-400' },
  { key: 'em_producao', label: 'Em Produção', colorClass: 'bg-yellow-400' },
  { key: 'em_revisao', label: 'Em Revisão', colorClass: 'bg-orange-400' },
  { key: 'finalizada', label: 'Finalizada', colorClass: 'bg-green-400' }
])

const canalOptions = computed(() => [
  { id: 'all', nome: 'Todos os canais' },
  ...pautaStore.canais
])

const roteiristaOptions = computed(() => {
  const roteiristas = new Set<string>()
  const options: Array<{ id: string; name: string }> = []
  
  pautaStore.pautas.forEach(pauta => {
    if (pauta.roteirista && !roteiristas.has(pauta.roteirista.id)) {
      roteiristas.add(pauta.roteirista.id)
      options.push({
        id: pauta.roteirista.id,
        name: pauta.roteirista.name
      })
    }
  })
  
  return options
})

const filteredPautas = computed(() => {
  let pautas = [...pautaStore.pautas]

  // Filtro de busca
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    pautas = pautas.filter(pauta =>
      pauta.titulo.toLowerCase().includes(search) ||
      pauta.objetivo.toLowerCase().includes(search)
    )
  }

  // Filtro de canal
  if (filters.value.canal) {
    pautas = pautas.filter(pauta => pauta.canal.id === filters.value.canal)
  }

  // Filtro de roteirista
  if (filters.value.roteirista) {
    pautas = pautas.filter(pauta => 
      pauta.roteirista?.id === filters.value.roteirista
    )
  }

  return pautas
})

const getFilteredPautasByStatus = (status: PautaStatus) => {
  return filteredPautas.value.filter(pauta => pauta.status === status)
}

const getStatusCount = (status: PautaStatus) => {
  return getFilteredPautasByStatus(status).length
}

const getIdiomaLabel = (idioma: string) => {
  return IDIOMAS[idioma as keyof typeof IDIOMAS] || idioma
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit'
  })
}

const canMovePauta = (pauta: Pauta) => {
  // Lógica de permissões para mover pautas
  return pauta.status !== 'finalizada'
}

const clearFilters = () => {
  filters.value = {
    search: '',
    canal: null,
    roteirista: null
  }
}

const toggleCardMenu = (pautaId: string) => {
  activeCardMenu.value = activeCardMenu.value === pautaId ? null : pautaId
}

const handleEditPauta = (pauta: Pauta) => {
  emit('edit-pauta', pauta)
  activeCardMenu.value = null
}

const handleDeletePauta = (pauta: Pauta) => {
  emit('delete-pauta', pauta)
  activeCardMenu.value = null
}

const handleStartProduction = (pauta: Pauta) => {
  emit('start-production', pauta)
}

// Drag and Drop handlers
const onDragStart = (event: DragEvent, pauta: Pauta) => {
  if (!canMovePauta(pauta)) {
    event.preventDefault()
    return
  }
  
  draggedPauta.value = pauta
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', pauta.id)
  }
}

const onDragEnd = () => {
  draggedPauta.value = null
}

const onDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const onDragEnter = (event: DragEvent) => {
  event.preventDefault()
}

const onDrop = async (event: DragEvent, newStatus: PautaStatus) => {
  event.preventDefault()
  
  if (!draggedPauta.value || draggedPauta.value.status === newStatus) {
    return
  }

  try {
    await pautaStore.changeStatus(draggedPauta.value.id, newStatus)
  } catch (error) {
    // eslint-disable-next-line no-undef
    console.error('Erro ao alterar status:', error)
  } finally {
    draggedPauta.value = null
  }
}

// Click outside to close menu
const handleClickOutside = (event: Event) => {
  const target = event.target as any
  if (!target.closest('.dropdown-container')) {
    activeCardMenu.value = null
  }
}

onMounted(() => {
  pautaStore.fetchPautas()
  // eslint-disable-next-line no-undef
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  // eslint-disable-next-line no-undef
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.kanban-column {
  min-height: 500px;
}

.kanban-cards {
  transition: background-color 0.2s;
}

.kanban-cards:hover {
  @apply bg-gray-50;
}

.dropdown-container {
  position: relative;
}
</style>

