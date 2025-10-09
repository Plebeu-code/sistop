<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 flex items-center justify-center p-4 relative">
    <!-- Background Pattern -->
    <div class="absolute inset-0 opacity-20">
      <div class="absolute inset-0" style="background-image: radial-gradient(circle at 25px 25px, rgba(255,255,255,0.2) 2px, transparent 0), radial-gradient(circle at 75px 75px, rgba(255,255,255,0.1) 2px, transparent 0); background-size: 100px 100px;"></div>
    </div>
    
    <!-- Login Card -->
    <Card class="w-full max-w-md shadow-2xl border-0 overflow-hidden bg-white/95 backdrop-blur-sm relative z-10">
      <template #header>
        <div class="bg-gradient-to-r from-blue-700 to-blue-500 text-white p-8 text-center relative overflow-hidden">
          <!-- Background decoration -->
          <div class="absolute inset-0 bg-gradient-to-tr from-blue-800/30 to-transparent"></div>
          
          <!-- Logo/Icon -->
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/15 backdrop-blur-sm mb-6 relative z-10 shadow-lg">
            <i class="pi pi-shield text-white text-3xl"></i>
          </div>
          
          <!-- Title -->
          <h1 class="text-3xl font-bold mb-2 relative z-10">SisTop</h1>
          <p class="text-blue-100 text-sm relative z-10 font-medium">Sistema de Gestão de Conteúdo</p>
        </div>
      </template>

      <template #content>
        <div class="p-8 space-y-6">
          <!-- Demo Notice -->
          <Message 
            severity="info" 
            :closable="false"
            class="text-sm"
          >
            Ambiente de demonstração - RBAC ativo
          </Message>

          <!-- Login Form -->
          <form @submit.prevent="handleLogin" class="space-y-6">
            <!-- User Profile Selector -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">
                <i class="pi pi-user mr-2"></i>
                Perfil de Usuário
              </label>
              <Button
                type="button"
                @click="showProfileSelector = true"
                class="w-full justify-between bg-white border-2 border-blue-200 text-gray-900 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                :pt="{ 
                  root: { 
                    class: 'bg-white border-2 border-blue-200 text-gray-900 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200' 
                  } 
                }"
              >
                <div class="flex items-center">
                  <div class="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center mr-3 shadow-sm">
                    <i :class="currentUser.icon" class="text-white"></i>
                  </div>
                  <div class="text-left">
                    <div class="font-medium">{{ currentUser.label }}</div>
                    <div class="text-xs text-gray-500">{{ currentUser.description }}</div>
                  </div>
                </div>
                <i class="pi pi-chevron-down text-gray-500"></i>
              </Button>
            </div>

            <!-- Email Field -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                <i class="pi pi-envelope mr-2 text-gray-500"></i>
                E-mail
              </label>
              <InputText
                id="email"
                v-model="currentUser.email"
                type="email"
                readonly
                class="w-full bg-white border-blue-200 text-gray-900"
                placeholder="Digite seu e-mail"
                :pt="{ 
                  root: { 
                    class: 'cursor-not-allowed opacity-75 bg-white border-blue-200 text-gray-900' 
                  } 
                }"
              />
            </div>

            <!-- Password Field -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                <i class="pi pi-lock mr-2 text-gray-500"></i>
                Senha
              </label>
              <Password
                id="password"
                v-model="passwordDemo"
                readonly
                class="fullcamp"
                :feedback="false"
                toggle-mask
                placeholder="Digite sua senha"
                :pt="{ 
                  root: { 
                    class: 'w-full bg-white' 
                  },
                  input: { 
                    class: 'w-full cursor-not-allowed opacity-75 bg-white border-blue-200 text-gray-900' 
                  },
                  toggleButton: {
                    class: 'cursor-not-allowed opacity-75 bg-white border-blue-200 text-blue-600'
                  }
                }"
              />
            </div>

            <!-- Login Button -->
            <Button
              type="submit"
              :loading="loading"
              :disabled="loading"
              class="w-full py-4 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 border-0 shadow-lg transform hover:scale-[1.02] transition-all duration-200"
              severity="primary"
            >
              <template #icon>
                <i :class="loading ? 'pi pi-spin pi-spinner' : 'pi pi-sign-in'" class="mr-2"></i>
              </template>
              {{ loading ? 'Entrando...' : 'Entrar no Sistema' }}
            </Button>
          </form>

          <!-- Demo Info -->
          <div class="text-center pt-4 border-t border-gray-200">
            <p class="text-xs text-gray-500">
              <i class="pi pi-info-circle mr-1"></i>
              Demonstração • Usuário: <strong>{{ currentUser.name }}</strong>
            </p>
          </div>
        </div>
      </template>
    </Card>

    <!-- Profile Selector Dialog -->
    <Dialog
      v-model:visible="showProfileSelector"
      modal
      :closable="true"
      :draggable="false"
      class="w-full max-w-md"
      header="Selecionar Perfil de Usuário"
    >
      <div class="space-y-3">
        <div
          v-for="userType in userTypes"
          :key="userType.value"
          @click="selectUserType(userType.value)"
          class="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer transition-all duration-200 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md"
          :class="{
            'bg-blue-500 border-blue-500 text-white shadow-lg': selectedUserType === userType.value
          }"
        >
          <!-- Icon -->
          <div 
            class="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center mr-4"
            :class="{
              'bg-white/20 text-white shadow-sm': selectedUserType === userType.value,
              'bg-blue-100 text-blue-600': selectedUserType !== userType.value
            }"
          >
            <i :class="userType.icon" class="text-xl"></i>
          </div>
          
          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <h3 
                class="text-sm font-semibold"
                :class="{
                  'text-white': selectedUserType === userType.value,
                  'text-gray-900': selectedUserType !== userType.value
                }"
              >
                {{ userType.label }}
              </h3>
              <i 
                v-if="selectedUserType === userType.value"
                class="pi pi-check text-white"
              ></i>
            </div>
            <p 
              class="text-xs mt-1"
              :class="{
                'text-blue-100': selectedUserType === userType.value,
                'text-gray-500': selectedUserType !== userType.value
              }"
            >
              {{ userType.description }}
            </p>
            <div class="flex items-center mt-2 text-xs" 
                 :class="{
                   'text-blue-200': selectedUserType === userType.value,
                   'text-gray-500': selectedUserType !== userType.value
                 }">
              <i class="pi pi-envelope mr-1"></i>
              {{ userType.email }}
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button
            type="button"
            @click="showProfileSelector = false"
            severity="secondary"
            outlined
          >
            Cancelar
          </Button>
          <Button
            type="button"
            @click="confirmUserSelection"
            severity="primary"
          >
            Confirmar
          </Button>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore, useToastStore } from '../../app/stores'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Message from 'primevue/message'
import Dialog from 'primevue/dialog'

const router = useRouter()
const userStore = useUserStore()
const toastStore = useToastStore()

const loading = ref(false)
const passwordDemo = ref('123456')
const showProfileSelector = ref(false)
const selectedUserType = ref<'admin' | 'produtor' | 'roteirista' | 'pesquisador'>('admin')

const userTypes = [
  {
    value: 'admin' as const,
    label: 'Administrador',
    description: 'Acesso completo ao sistema',
    email: 'admin@sistop.com',
    name: 'Admin User',
    icon: 'pi pi-shield'
  },
  {
    value: 'produtor' as const,
    label: 'Produtor',
    description: 'Gestão de pautas e produção',
    email: 'produtor@sistop.com',
    name: 'João Produtor',
    icon: 'pi pi-video'
  },
  {
    value: 'roteirista' as const,
    label: 'Roteirista',
    description: 'Criação e edição de roteiros',
    email: 'roteirista@sistop.com',
    name: 'Maria Roteirista',
    icon: 'pi pi-file-edit'
  },
  {
    value: 'pesquisador' as const,
    label: 'Pesquisador',
    description: 'Upload e curadoria de assets',
    email: 'pesquisador@sistop.com',
    name: 'Carlos Pesquisador',
    icon: 'pi pi-search'
  }
]

const currentUser = computed(() => {
  return userTypes.find(user => user.value === selectedUserType.value)!
})

const selectUserType = (userType: typeof selectedUserType.value) => {
  selectedUserType.value = userType
}

const confirmUserSelection = () => {
  showProfileSelector.value = false
  toastStore.info('Perfil selecionado', `Perfil alterado para ${currentUser.value.label}`)
}

const handleLogin = async () => {
  loading.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Login with selected user type
    userStore.simulateLogin(selectedUserType.value)
    toastStore.success('Login realizado', `Bem-vindo, ${currentUser.value.name}!`)
    
    router.push('/')
  } catch (error) {
    toastStore.error('Erro no login', 'Credenciais inválidas')
  } finally {
    loading.value = false
  }
}
</script>
<style scoped>
/* Force white background for all form elements */
:deep(.p-inputtext) {
  width: 100% !important;
  background-color: white !important;
  border-color: #dbeafe !important;
  color: #1f2937 !important;
}

:deep(.p-password) {
  width: 100% !important;
}

:deep(.p-password input) {
  background-color: white !important;
  border-color: #dbeafe !important;
  color: #1f2937 !important;
}

:deep(.p-password .p-password-toggle) {
  background-color: white !important;
  border-color: #dbeafe !important;
  color: #2563eb !important;
}

:deep(.p-password .p-password-toggle:hover) {
  background-color: #eff6ff !important;
  color: #1d4ed8 !important;
}

:deep(.p-button) {
  background-color: white !important;
  border-color: #dbeafe !important;
  color: #1f2937 !important;
}

:deep(.p-button:hover) {
  background-color: #eff6ff !important;
  border-color: #93c5fd !important;
}

:deep(.p-button.p-button-primary) {
  background-color: #3b82f6 !important;
  border-color: #3b82f6 !important;
  color: white !important;
}

:deep(.p-button.p-button-primary:hover) {
  background-color: #2563eb !important;
  border-color: #2563eb !important;
}

:deep(.p-message) {
  background-color: #eff6ff !important;
  border-color: #3b82f6 !important;
  color: #1e40af !important;
}

:deep(.p-dialog) {
  background-color: white !important;
}

:deep(.p-dialog .p-dialog-header) {
  background-color: white !important;
  color: #1f2937 !important;
  border-bottom-color: #e5e7eb !important;
}

:deep(.p-dialog .p-dialog-content) {
  background-color: white !important;
  color: #1f2937 !important;
}

:deep(.p-dialog .p-dialog-footer) {
  background-color: white !important;
  border-top-color: #e5e7eb !important;
}

:deep(.p-card) {
  background-color: white !important;
  color: #1f2937 !important;
}

:deep(.p-card .p-card-header) {
  background-color: transparent !important;
  color: inherit !important;
}

:deep(.p-card .p-card-content) {
  background-color: transparent !important;
  color: inherit !important;
}

/* Additional overrides for any dark theme remnants */
:deep(*) {
  --p-surface-ground: white !important;
  --p-surface-section: white !important;
  --p-surface-card: white !important;
  --p-content-color: #1f2937 !important;
}
</style>


