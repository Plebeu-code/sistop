<template>
  <Dialog
    :visible="visible"
    :modal="true"
    :closable="true"
    :header="isEditing ? 'Editar Pauta' : 'Nova Pauta'"
    class="w-full max-w-4xl"
    @update:visible="$emit('update:visible', $event)"
  >
    <form
      class="space-y-6"
      @submit.prevent="handleSubmit"
    >
      <!-- Título -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label
            for="titulo"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Título *
          </label>
          <InputText
            id="titulo"
            v-model="form.titulo"
            :class="{ 'p-invalid': errors.titulo }"
            class="w-full"
            placeholder="Digite o título da pauta"
          />
          <small
            v-if="errors.titulo"
            class="p-error"
          >{{ errors.titulo }}</small>
        </div>

        <!-- Canal -->
        <div>
          <label
            for="canal"
            class="block text-sm font-medium text-gray-700 mb-2"
          >
            Canal *
          </label>
          <Dropdown
            id="canal"
            v-model="form.canal"
            :options="pautaStore.canais"
            option-label="nome"
            placeholder="Selecione o canal"
            :class="{ 'p-invalid': errors.canal }"
            class="w-full"
          >
            <template #option="{ option }">
              <div class="flex items-center">
                <div
                  class="w-3 h-3 rounded-full mr-2"
                  :style="{ backgroundColor: option.cor }"
                />
                {{ option.nome }}
              </div>
            </template>
          </Dropdown>
          <small
            v-if="errors.canal"
            class="p-error"
          >{{ errors.canal }}</small>
        </div>
      </div>

      <!-- Objetivo -->
      <div>
        <label
          for="objetivo"
          class="block text-sm font-medium text-gray-700 mb-2"
        >
          Objetivo *
        </label>
        <Textarea
          id="objetivo"
          v-model="form.objetivo"
          :class="{ 'p-invalid': errors.objetivo }"
          class="w-full"
          rows="3"
          placeholder="Descreva o objetivo da pauta"
        />
        <small
          v-if="errors.objetivo"
          class="p-error"
        >{{ errors.objetivo }}</small>
      </div>

      <!-- Notas -->
      <div>
        <label
          for="notas"
          class="block text-sm font-medium text-gray-700 mb-2"
        >
          Notas
        </label>
        <Textarea
          id="notas"
          v-model="form.notas"
          class="w-full"
          rows="2"
          placeholder="Notas adicionais (opcional)"
        />
      </div>

      <!-- Referências YouTube -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Referências YouTube
        </label>
        <div class="space-y-2">
          <div
            v-for="(_, index) in form.refsYoutube"
            :key="index"
            class="flex gap-2"
          >
            <InputText
              v-model="form.refsYoutube[index]"
              class="flex-1"
              placeholder="https://youtube.com/watch?v=..."
            />
            <Button
              type="button"
              icon="pi pi-trash"
              severity="danger"
              text
              @click="removeYouTubeRef(index)"
            />
          </div>
          <Button
            type="button"
            icon="pi pi-plus"
            label="Adicionar Referência"
            text
            @click="addYouTubeRef"
          />
        </div>
      </div>

      <!-- Thumbnail -->
      <div>
        <label
          for="thumb"
          class="block text-sm font-medium text-gray-700 mb-2"
        >
          Thumbnail (URL)
        </label>
        <InputText
          id="thumb"
          v-model="form.thumb"
          class="w-full"
          placeholder="https://exemplo.com/imagem.jpg"
        />
      </div>

      <!-- Idiomas e Vozes -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Idiomas *
          </label>
          <MultiSelect
            v-model="form.idiomas"
            :options="idiomasOptions"
            option-label="label"
            option-value="value"
            placeholder="Selecione os idiomas"
            :class="{ 'p-invalid': errors.idiomas }"
            class="w-full"
          />
          <small
            v-if="errors.idiomas"
            class="p-error"
          >{{ errors.idiomas }}</small>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Vozes *
          </label>
          <MultiSelect
            v-model="form.vozes"
            :options="vozesDisponiveis"
            option-label="nome"
            placeholder="Selecione as vozes"
            :class="{ 'p-invalid': errors.vozes }"
            class="w-full"
          >
            <template #option="{ option }">
              <div class="flex items-center justify-between w-full">
                <span>{{ option.nome }}</span>
                <div class="text-xs text-gray-500">
                  {{ option.genero }} - {{ option.idioma }}
                </div>
              </div>
            </template>
          </MultiSelect>
          <small
            v-if="errors.vozes"
            class="p-error"
          >{{ errors.vozes }}</small>
        </div>
      </div>

      <!-- Roteirista -->
      <div v-can="'edit_pauta'">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Roteirista
        </label>
        <Dropdown
          v-model="form.roteirista"
          :options="roteiristasDisponiveis"
          option-label="name"
          placeholder="Selecione um roteirista (opcional)"
          class="w-full"
          show-clear
        />
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
          :label="isEditing ? 'Atualizar' : 'Criar Pauta'"
          :loading="pautaStore.loading"
          :disabled="!isFormValid"
        />
      </div>
    </form>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Dropdown from 'primevue/dropdown'
import MultiSelect from 'primevue/multiselect'
import Button from 'primevue/button'
import { usePautaStore } from '../../../app/stores'
import { IDIOMAS } from '../../../shared/constants'
import type { Pauta, User } from '../../../shared/types'

const props = defineProps<{
  visible: boolean
  pauta?: Pauta
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  success: [pauta: Pauta]
}>()

const pautaStore = usePautaStore()

const isEditing = computed(() => !!props.pauta)

const form = ref({
  titulo: '',
  objetivo: '',
  notas: '',
  refsYoutube: [''],
  thumb: '',
  canal: null as any,
  idiomas: [] as string[],
  vozes: [] as any[],
  roteirista: null as User | null
})

const errors = ref({
  titulo: '',
  objetivo: '',
  canal: '',
  idiomas: '',
  vozes: ''
})

const idiomasOptions = computed(() => {
  return Object.entries(IDIOMAS).map(([value, label]) => ({
    value,
    label
  }))
})

const vozesDisponiveis = computed(() => {
  if (!form.value.idiomas.length) return []
  return pautaStore.vozes.filter(voz => 
    form.value.idiomas.includes(voz.idioma)
  )
})

const roteiristasDisponiveis = computed(() => {
  // Mock - em produção viria da API
  return [
    { id: '3', name: 'Maria Roteirista', email: 'roteirista@sistop.com' },
    { id: '6', name: 'João Roteirista', email: 'joao.roteirista@sistop.com' }
  ]
})

const isFormValid = computed(() => {
  return form.value.titulo.trim() !== '' &&
         form.value.objetivo.trim() !== '' &&
         form.value.canal !== null &&
         form.value.idiomas.length > 0 &&
         form.value.vozes.length > 0
})

const validateForm = () => {
  errors.value = {
    titulo: '',
    objetivo: '',
    canal: '',
    idiomas: '',
    vozes: ''
  }

  if (!form.value.titulo.trim()) {
    errors.value.titulo = 'Título é obrigatório'
  }

  if (!form.value.objetivo.trim()) {
    errors.value.objetivo = 'Objetivo é obrigatório'
  }

  if (!form.value.canal) {
    errors.value.canal = 'Canal é obrigatório'
  }

  if (form.value.idiomas.length === 0) {
    errors.value.idiomas = 'Selecione pelo menos um idioma'
  }

  if (form.value.vozes.length === 0) {
    errors.value.vozes = 'Selecione pelo menos uma voz'
  }

  return Object.values(errors.value).every(error => error === '')
}

const addYouTubeRef = () => {
  form.value.refsYoutube.push('')
}

const removeYouTubeRef = (index: number) => {
  form.value.refsYoutube.splice(index, 1)
}

const resetForm = () => {
  form.value = {
    titulo: '',
    objetivo: '',
    notas: '',
    refsYoutube: [''],
    thumb: '',
    canal: null,
    idiomas: [],
    vozes: [],
    roteirista: null
  }
  errors.value = {
    titulo: '',
    objetivo: '',
    canal: '',
    idiomas: '',
    vozes: ''
  }
}

const loadPautaData = () => {
  if (props.pauta) {
    form.value = {
      titulo: props.pauta.titulo,
      objetivo: props.pauta.objetivo,
      notas: props.pauta.notas || '',
      refsYoutube: props.pauta.refsYoutube.length ? props.pauta.refsYoutube : [''],
      thumb: props.pauta.thumb || '',
      canal: props.pauta.canal,
      idiomas: props.pauta.idiomas,
      vozes: props.pauta.vozes,
      roteirista: props.pauta.roteirista || null
    }
  }
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    const pautaData = {
      titulo: form.value.titulo.trim(),
      objetivo: form.value.objetivo.trim(),
      notas: form.value.notas.trim() || undefined,
      refsYoutube: form.value.refsYoutube.filter(refUrl => refUrl.trim() !== ''),
      thumb: form.value.thumb.trim() || undefined,
      canal: form.value.canal,
      idiomas: form.value.idiomas as any,
      vozes: form.value.vozes,
      roteirista: form.value.roteirista || undefined
    }

    let result
    if (isEditing.value && props.pauta) {
      result = await pautaStore.updatePauta(props.pauta.id, pautaData as any)
    } else {
      result = await pautaStore.createPauta(pautaData as any)
    }

    if (result) {
      emit('success', result)
      emit('update:visible', false)
      resetForm()
    }
  } catch (error) {
    // eslint-disable-next-line no-undef
    console.error('Erro ao salvar pauta:', error)
  }
}

// Watchers
watch(() => props.visible, (visible) => {
  if (visible) {
    if (props.pauta) {
      loadPautaData()
    } else {
      resetForm()
    }
  }
})

watch(() => form.value.idiomas, () => {
  // Filtrar vozes quando idiomas mudam
  form.value.vozes = form.value.vozes.filter(voz => 
    form.value.idiomas.includes(voz.idioma)
  )
})

onMounted(() => {
  if (props.visible && props.pauta) {
    loadPautaData()
  }
})
</script>

