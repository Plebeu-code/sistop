<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Header demonstrativo -->
    <header class="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div class="content-container">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-4">
            <i class="pi pi-desktop text-2xl text-blue-600" />
            <h1 class="text-xl font-bold text-gray-900">
              SisTop Integration Demo
            </h1>
          </div>
          
          <div class="flex items-center space-x-4">
            <Button
              label="Notifications"
              icon="pi pi-bell"
              badge="3"
              badge-class="bg-red-500"
              class="p-button-outlined"
              @click="showToast"
            />
          </div>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="content-container py-8">
      <!-- Hero Section -->
      <section class="text-center mb-12">
        <h2 class="text-4xl font-bold text-gray-900 mb-4">
          PrimeVue + TailwindCSS
        </h2>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Demonstração da integração perfeita entre componentes PrimeVue e utilitários TailwindCSS
        </p>
      </section>

      <!-- Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <!-- Card 1: Components -->
        <Card class="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <template #header>
            <div class="h-32 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
              <i class="pi pi-palette text-4xl text-white" />
            </div>
          </template>
          <template #title>
            Componentes Modernos
          </template>
          <template #content>
            <p class="text-gray-600 mb-4">
              Componentes PrimeVue estilizados com TailwindCSS para uma experiência visual consistente.
            </p>
            <div class="flex flex-wrap gap-2">
              <Tag
                value="Vue 3"
                severity="success"
                class="font-medium"
              />
              <Tag
                value="TypeScript"
                severity="info"
                class="font-medium"
              />
              <Tag
                value="Responsive"
                severity="warning"
                class="font-medium"
              />
            </div>
          </template>
          <template #footer>
            <Button 
              label="Explorar" 
              icon="pi pi-arrow-right" 
              class="w-full bg-blue-600 hover:bg-blue-700 transform hover:scale-105 transition-all"
              @click="showDialog('components')"
            />
          </template>
        </Card>

        <!-- Card 2: Forms -->
        <Card class="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <template #header>
            <div class="h-32 bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
              <i class="pi pi-file-edit text-4xl text-white" />
            </div>
          </template>
          <template #title>
            Formulários Avançados
          </template>
          <template #content>
            <p class="text-gray-600 mb-4">
              Formulários com validação, máscaras e componentes customizados.
            </p>
            <div class="space-y-3">
              <InputText 
                v-model="sampleInput" 
                placeholder="Digite algo..." 
                class="w-full"
              />
              <Dropdown 
                v-model="selectedOption" 
                :options="dropdownOptions" 
                option-label="name"
                placeholder="Selecione uma opção"
                class="w-full"
              />
            </div>
          </template>
          <template #footer>
            <Button 
              label="Ver Mais" 
              icon="pi pi-eye" 
              class="w-full bg-green-600 hover:bg-green-700 transform hover:scale-105 transition-all"
              @click="showDialog('forms')"
            />
          </template>
        </Card>

        <!-- Card 3: Data -->
        <Card class="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <template #header>
            <div class="h-32 bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
              <i class="pi pi-chart-bar text-4xl text-white" />
            </div>
          </template>
          <template #title>
            Visualização de Dados
          </template>
          <template #content>
            <p class="text-gray-600 mb-4">
              Tabelas, gráficos e dashboards com design responsivo.
            </p>
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="flex justify-between items-center mb-2">
                <span class="text-sm font-medium">Performance</span>
                <span class="text-sm text-green-600">+12%</span>
              </div>
              <ProgressBar
                :value="75"
                class="mb-2"
              />
              <div class="text-xs text-gray-500">
                75% do objetivo
              </div>
            </div>
          </template>
          <template #footer>
            <Button 
              label="Dashboard" 
              icon="pi pi-chart-line" 
              class="w-full bg-purple-600 hover:bg-purple-700 transform hover:scale-105 transition-all"
              @click="showDialog('data')"
            />
          </template>
        </Card>
      </div>

      <!-- Interactive Demo Section -->
      <section class="bg-white rounded-2xl shadow-xl p-8 mb-12">
        <h3 class="text-2xl font-bold text-gray-900 mb-6 text-center">
          Demonstração Interativa
        </h3>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Left side: Controls -->
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Tema
              </label>
              <SelectButton 
                v-model="selectedTheme" 
                :options="themeOptions" 
                option-label="name"
                class="w-full"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Severidade
              </label>
              <div class="flex flex-wrap gap-2">
                <Button 
                  v-for="severity in severities"
                  :key="severity"
                  :label="severity"
                  :severity="severity.toLowerCase()"
                  size="small"
                  @click="showToast(severity.toLowerCase())"
                />
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Slider Demo
              </label>
              <Slider
                v-model="sliderValue"
                class="w-full mb-2"
              />
              <div class="text-center text-lg font-semibold text-blue-600">
                {{ sliderValue }}%
              </div>
            </div>
          </div>
          
          <!-- Right side: Preview -->
          <div class="bg-gray-50 rounded-xl p-6">
            <h4 class="text-lg font-semibold text-gray-900 mb-4">
              Preview em Tempo Real
            </h4>
            <div class="space-y-4">
              <div class="flex items-center justify-between p-3 bg-white rounded-lg shadow">
                <span class="text-sm text-gray-600">Tema Atual:</span>
                <Badge
                  :value="selectedTheme?.name || 'Padrão'"
                  severity="info"
                />
              </div>
              
              <div class="flex items-center justify-between p-3 bg-white rounded-lg shadow">
                <span class="text-sm text-gray-600">Valor do Slider:</span>
                <ProgressBar
                  :value="sliderValue"
                  class="w-24"
                />
              </div>
              
              <div class="p-3 bg-white rounded-lg shadow">
                <div class="text-sm text-gray-600 mb-2">
                  Status do Sistema:
                </div>
                <div class="flex items-center space-x-2">
                  <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span class="text-sm font-medium text-green-600">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Grid -->
      <section class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="bg-white rounded-xl p-6 shadow-lg">
          <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <i class="pi pi-palette text-blue-600 mr-2" />
            Personalização Total
          </h4>
          <ul class="space-y-2 text-gray-600">
            <li class="flex items-center">
              <i class="pi pi-check text-green-500 mr-2" />
              CSS Custom Properties
            </li>
            <li class="flex items-center">
              <i class="pi pi-check text-green-500 mr-2" />
              Responsive Design
            </li>
            <li class="flex items-center">
              <i class="pi pi-check text-green-500 mr-2" />
              Acessibilidade WCAG
            </li>
          </ul>
        </div>
        
        <div class="bg-white rounded-xl p-6 shadow-lg">
          <h4 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <i class="pi pi-cog text-purple-600 mr-2" />
            Performance Otimizada
          </h4>
          <ul class="space-y-2 text-gray-600">
            <li class="flex items-center">
              <i class="pi pi-check text-green-500 mr-2" />
              Tree Shaking
            </li>
            <li class="flex items-center">
              <i class="pi pi-check text-green-500 mr-2" />
              Code Splitting
            </li>
            <li class="flex items-center">
              <i class="pi pi-check text-green-500 mr-2" />
              Lazy Loading
            </li>
            <li class="flex items-center">
              <i class="pi pi-check text-green-500 mr-2" />
              Bundle Otimizado
            </li>
          </ul>
        </div>
      </section>
    </main>

    <!-- Dialog Demo -->
    <Dialog 
      v-model:visible="dialogVisible" 
      :header="dialogTitle"
      :style="{ width: '50vw' }"
      :breakpoints="{ '960px': '75vw', '641px': '90vw' }"
      modal
    >
      <div class="space-y-4">
        <p class="text-gray-600">
          {{ dialogContent }}
        </p>
        
        <div class="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
          <div class="flex items-start">
            <i class="pi pi-info-circle text-blue-500 mr-2 mt-0.5" />
            <div>
              <h5 class="font-semibold text-blue-900">
                Integração Perfeita
              </h5>
              <p class="text-sm text-blue-700 mt-1">
                PrimeVue e TailwindCSS trabalham juntos para criar interfaces modernas e funcionais.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <Button 
          label="Fechar" 
          icon="pi pi-times" 
          class="p-button-text" 
          @click="dialogVisible = false" 
        />
        <Button 
          label="Confirmar" 
          icon="pi pi-check" 
          class="bg-blue-600 hover:bg-blue-700" 
          @click="dialogVisible = false" 
        />
      </template>
    </Dialog>

    <!-- Toast Container -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import SelectButton from 'primevue/selectbutton'
import Slider from 'primevue/slider'
import ProgressBar from 'primevue/progressbar'
import Tag from 'primevue/tag'
import Badge from 'primevue/badge'
import Toast from 'primevue/toast'

// Composables
const toast = useToast()

// Reactive data
const sampleInput = ref('')
const selectedOption = ref(null)
const selectedTheme = ref({ name: 'Aura', value: 'aura' })
const sliderValue = ref(65)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogContent = ref('')

// Options
const dropdownOptions = ref([
  { name: 'Opção 1', value: 'opt1' },
  { name: 'Opção 2', value: 'opt2' },
  { name: 'Opção 3', value: 'opt3' }
])

const themeOptions = ref([
  { name: 'Aura', value: 'aura' },
  { name: 'Lara', value: 'lara' },
  { name: 'Material', value: 'material' }
])

const severities = ref(['Success', 'Info', 'Warn', 'Error'])

// Methods
const showToast = (severity: string = 'info') => {
  const messages = {
    success: { summary: 'Sucesso!', detail: 'Operação realizada com sucesso' },
    info: { summary: 'Informação', detail: 'Esta é uma mensagem informativa' },
    warn: { summary: 'Atenção', detail: 'Cuidado com esta ação' },
    error: { summary: 'Erro', detail: 'Ocorreu um erro na operação' }
  }
  
  const message = messages[severity as keyof typeof messages] || messages.info
  
  toast.add({
    severity: severity as any,
    summary: message.summary,
    detail: message.detail,
    life: 4000
  })
}

const showDialog = (type: string) => {
  const content = {
    components: {
      title: 'Componentes PrimeVue',
      content: 'Explore a vasta biblioteca de componentes PrimeVue, todos integrados perfeitamente com TailwindCSS para máxima flexibilidade de design.'
    },
    forms: {
      title: 'Formulários Avançados',
      content: 'Crie formulários complexos com validação em tempo real, máscaras de entrada e componentes customizados.'
    },
    data: {
      title: 'Visualização de Dados',
      content: 'Implemente dashboards interativos com tabelas, gráficos e métricas em tempo real.'
    }
  }
  
  const info = content[type as keyof typeof content]
  if (info) {
    dialogTitle.value = info.title
    dialogContent.value = info.content
    dialogVisible.value = true
  }
}
</script>

<style scoped>
/* Animações customizadas */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

/* Gradient text */
.gradient-text {
  background: linear-gradient(45deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Hover effects */
.hover-lift {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}
</style>

