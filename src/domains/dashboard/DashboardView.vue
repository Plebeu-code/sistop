<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-6">
    <!-- Header -->
    <div class="mb-8 bg-white rounded-xl shadow-sm border border-blue-100 p-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p class="text-blue-600 mt-1 font-medium">
            Bem-vindo ao sistema de gestão de conteúdo
          </p>
        </div>
        <div class="flex items-center space-x-4">
          <Button
            @click="refreshData"
            icon="pi pi-refresh"
            class="bg-blue-500 hover:bg-blue-600 border-blue-500 text-white"
            :loading="isRefreshing"
          />
          <div class="relative p-2 bg-blue-50 rounded-lg">
            <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse absolute top-1 right-1"></div>
            <i class="pi pi-bell text-blue-600 text-xl"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card 
        v-for="stat in stats" 
        :key="stat.id"
        class="hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 border border-blue-100 bg-gradient-to-br from-white to-blue-50"
        @click="stat.action"
      >
        <template #content>
          <div class="flex items-center p-6">
            <div class="w-14 h-14 rounded-xl flex items-center justify-center mr-4 shadow-lg" 
                 :class="stat.bgColor">
              <i :class="stat.icon" class="text-white text-xl"></i>
            </div>
            <div class="flex-1">
              <h3 class="text-sm font-semibold text-blue-900 mb-1">{{ stat.title }}</h3>
              <div class="flex items-center space-x-2 mb-1">
                <span class="text-2xl font-bold text-blue-700">{{ stat.value.toLocaleString() }}</span>
                <span class="text-xs font-medium px-2 py-1 rounded-full flex items-center space-x-1" 
                      :class="stat.changeClass">
                  <i :class="stat.changeIcon"></i>
                  {{ stat.change }}
                </span>
              </div>
              <p class="text-xs text-blue-600">{{ stat.description }}</p>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Welcome Message -->
    <Card class="mb-8 border border-blue-100 shadow-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white">
      <template #content>
        <div class="p-6">
          <h2 class="text-xl font-bold text-white mb-4 flex items-center">
            <i class="pi pi-sparkles mr-3 text-blue-200"></i>
            Bem-vindo ao SisTop
          </h2>
          <p class="text-blue-100 font-medium">
            Esta é sua dashboard principal. Aqui você pode visualizar estatísticas gerais do sistema e navegar pelos diferentes módulos disponíveis.
          </p>
        </div>
      </template>
    </Card>

    <!-- Quick Actions -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-blue-900 mb-6 relative flex items-center">
        <i class="pi pi-bolt text-blue-600 mr-3"></i>
        Acesso Rápido
        <div class="absolute -bottom-2 left-0 w-16 h-1 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full"></div>
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          v-for="action in quickActions"
          :key="action.id"
          v-can="action.permission"
          class="hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-2 border border-blue-100 bg-white hover:bg-blue-50"
          @click="navigateTo(action.route)"
        >
          <template #content>
            <div class="p-6">
              <div class="flex items-center justify-between mb-6">
                <div class="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-blue-500 to-blue-600">
                  <i :class="action.icon" class="text-white text-xl"></i>
                </div>
                <div v-if="action.badge" 
                     class="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full w-7 h-7 flex items-center justify-center font-bold shadow-lg">
                  {{ action.badge }}
                </div>
              </div>
              
              <div class="mb-6">
                <h3 class="text-lg font-bold text-blue-900 mb-2">{{ action.title }}</h3>
                <p class="text-sm text-blue-600 mb-4 font-medium">{{ action.description }}</p>
                
                <div v-if="action.stats" class="flex space-x-6">
                  <div v-for="stat in action.stats" :key="stat.label" class="text-center">
                    <span class="block text-lg font-bold text-blue-700">{{ stat.value }}</span>
                    <span class="text-xs text-blue-500 font-medium">{{ stat.label }}</span>
                  </div>
                </div>
              </div>
              
              <div class="pt-4 border-t border-blue-100">
                <Button
                  :label="action.buttonText"
                  :icon="action.buttonIcon"
                  class="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 font-semibold"
                />
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- Toast Component -->
    <Toast position="top-right" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Toast from 'primevue/toast'

const router = useRouter()
const toast = useToast()

// Reactive data
const isRefreshing = ref(false)
const showQuickMenu = ref(false)

// Stats Data
const stats = ref([
  {
    id: 'users',
    title: 'Usuários Ativos',
    value: 1234,
    change: '+12%',
    changeClass: 'text-white bg-green-500',
    changeIcon: 'pi pi-arrow-up',
    description: 'Total de usuários',
    icon: 'pi pi-users',
    bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
    action: () => navigateTo('/admin')
  },
  {
    id: 'assets',
    title: 'Assets Digitais',
    value: 5678,
    change: '+8%',
    changeClass: 'text-white bg-green-500',
    changeIcon: 'pi pi-arrow-up',
    description: 'Arquivos gerenciados',
    icon: 'pi pi-file',
    bgColor: 'bg-gradient-to-br from-blue-600 to-blue-700',
    action: () => navigateTo('/assets')
  },
  {
    id: 'projects',
    title: 'Projetos Ativos',
    value: 89,
    change: '-3%',
    changeClass: 'text-white bg-red-500',
    changeIcon: 'pi pi-arrow-down',
    description: 'Em produção',
    icon: 'pi pi-calendar',
    bgColor: 'bg-gradient-to-br from-blue-400 to-blue-500',
    action: () => navigateTo('/pauta')
  },
  {
    id: 'performance',
    title: 'Performance',
    value: 98,
    change: '+5%',
    changeClass: 'text-white bg-green-500',
    changeIcon: 'pi pi-arrow-up',
    description: 'Sistema otimizado',
    icon: 'pi pi-chart-line',
    bgColor: 'bg-gradient-to-br from-blue-500 to-blue-700',
    action: () => showToast('info', 'Sistema', 'Performance em 98%!')
  }
])

// Quick Actions
const quickActions = ref([
  {
    id: 'admin',
    title: 'Administração',
    description: 'Gerencie usuários, permissões e configurações do sistema',
    icon: 'pi pi-shield',
    route: '/admin',
    permission: 'view_admin',
    buttonText: 'Acessar Admin',
    buttonIcon: 'pi pi-arrow-right',
    badge: '3',
    stats: [
      { label: 'Usuários', value: '124' },
      { label: 'Pendências', value: '3' }
    ]
  },
  {
    id: 'pauta',
    title: 'Pautas',
    description: 'Crie e gerencie pautas de produção e cronogramas',
    icon: 'pi pi-calendar',
    iconBg: 'bg-blue-500',
    cardClass: 'border-l-4 border-blue-500',
    route: '/pauta',
    permission: { roles: ['produtor'] },
    buttonText: 'Ver Pautas',
    buttonIcon: 'pi pi-arrow-right',
    stats: [
      { label: 'Ativas', value: '12' },
      { label: 'Concluídas', value: '89' }
    ]
  },
  {
    id: 'storyboard',
    title: 'Storyboard',
    description: 'Desenvolva roteiros e storyboards visuais',
    icon: 'pi pi-video',
    iconBg: 'bg-purple-500',
    cardClass: 'border-l-4 border-purple-500',
    route: '/storyboard',
    permission: { roles: ['roteirista'] },
    buttonText: 'Criar Roteiro',
    buttonIcon: 'pi pi-arrow-right',
    stats: [
      { label: 'Rascunhos', value: '8' },
      { label: 'Aprovados', value: '24' }
    ]
  },
  {
    id: 'assets',
    title: 'Assets Digitais',
    description: 'Upload, curadoria e organização de assets',
    icon: 'pi pi-images',
    iconBg: 'bg-green-500',
    cardClass: 'border-l-4 border-green-500',
    route: '/assets',
    permission: { roles: ['pesquisador'] },
    buttonText: 'Gerenciar Assets',
    buttonIcon: 'pi pi-arrow-right',
    stats: [
      { label: 'Arquivos', value: '5.6k' },
      { label: 'Aprovados', value: '94%' }
    ]
  },
  {
    id: 'reports',
    title: 'Relatórios',
    description: 'Visualize métricas e relatórios detalhados',
    icon: 'pi pi-chart-bar',
    iconBg: 'bg-yellow-500',
    cardClass: 'border-l-4 border-yellow-500',
    route: '/relatorios',
    permission: 'view_reports',
    buttonText: 'Ver Relatórios',
    buttonIcon: 'pi pi-arrow-right',
    stats: [
      { label: 'Relatórios', value: '15' },
      { label: 'Automatizados', value: '8' }
    ]
  },
  {
    id: 'demo',
    title: 'Demonstração',
    description: 'Explore componentes e funcionalidades do PrimeVue',
    icon: 'pi pi-sparkles',
    iconBg: 'bg-pink-500',
    cardClass: 'border-l-4 border-pink-500',
    route: '/demo',
    permission: true,
    buttonText: 'Ver Demo',
    buttonIcon: 'pi pi-arrow-right',
    stats: [
      { label: 'Componentes', value: '50+' },
      { label: 'Exemplos', value: '100+' }
    ]
  }
])

// Methods
const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail?: string) => {
  toast.add({
    severity,
    summary,
    detail: detail || `Demonstração ${severity} do PrimeVue integrado com TailwindCSS`,
    life: 3000
  })
}

const refreshData = async () => {
  isRefreshing.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    showToast('success', 'Dados atualizados', 'Dashboard sincronizada com sucesso!')
  } finally {
    isRefreshing.value = false
  }
}



const navigateTo = (route: string) => {
  showQuickMenu.value = false
  router.push(route)
}

// Counter Animation for Stats
const animateCounters = () => {
  const counters = document.querySelectorAll('.stat-value')
  counters.forEach((counter) => {
    const target = parseInt(counter.getAttribute('data-target') || '0')
    const duration = 2000
    const start = 0
    const increment = target / (duration / 16)
    let current = start
    
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        current = target
        clearInterval(timer)
      }
      counter.textContent = Math.floor(current).toLocaleString()
    }, 16)
  })
}

// Lifecycle
onMounted(() => {
  setTimeout(animateCounters, 500)
})
</script>

<style scoped>
/* Dashboard Container */
.dashboard-container {
  animation: fadeIn 0.6s ease-out;
}

/* Header Animations */
.header-section {
  transform: translateY(0);
  transition: all 0.7s ease;
}

.animate-fade-in-down {
  animation: fadeInDown 0.8s ease-out;
}

.animate-bounce-subtle {
  animation: bounceSubtle 2s infinite;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.stat-card {
  transform: translateY(0);
  transition: all 0.3s ease;
  cursor: pointer;
  animation: slideUp 0.6s ease-out both;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 0.75rem;
}

.stat-card:hover {
  transform: translateY(-8px) scale(1.02);
  background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.1) 100%);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  position: relative;
}

.stat-icon-container {
  position: relative;
  width: 4rem;
  height: 4rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.stat-icon {
  color: white;
  font-size: 1.5rem;
  position: relative;
  z-index: 10;
}

.stat-pulse {
  position: absolute;
  inset: 0;
  border-radius: 0.75rem;
  opacity: 0.2;
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.stat-value-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.stat-change {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stat-description {
  font-size: 0.75rem;
  color: #6b7280;
}

/* Animation Classes */
.animate-delay-0 { animation-delay: 0.1s; }
.animate-delay-1 { animation-delay: 0.2s; }
.animate-delay-2 { animation-delay: 0.3s; }
.animate-delay-3 { animation-delay: 0.4s; }

.animate-slide-up {
  animation: slideUp 0.6s ease-out;
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

/* Keyframes */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes bounceSubtle {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-5px);
  }
  60% {
    transform: translateY(-3px);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.6s ease-out;
}

/* Responsive */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(1, 1fr);
    gap: 1rem;
  }
}


</style>

