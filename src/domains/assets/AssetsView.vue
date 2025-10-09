<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">
      {{ $t('navigation.assets') }}
    </h1>
    
    <div class="grid gap-6">
      <!-- Upload Section - Visível para quem pode fazer upload -->
      <div v-can="'upload_assets'" class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i class="pi pi-upload mr-2"></i>
          Upload de Assets
        </h2>
        <p class="text-gray-600 mb-4">
          Faça upload de novos assets para o sistema.
        </p>
        <button class="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          <i class="pi pi-cloud-upload mr-2"></i>
          Fazer Upload
        </button>
      </div>

      <!-- Curadoria Section - Visível para quem pode fazer curadoria -->
      <div v-can="'curadoria_assets'" class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i class="pi pi-check-circle mr-2"></i>
          Curadoria de Assets
        </h2>
        <p class="text-gray-600 mb-4">
          Revise e aprove assets carregados.
        </p>
        <div class="space-y-2">
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span class="text-sm">asset_video_001.mp4</span>
            <div class="space-x-2">
              <button class="text-green-600 hover:text-green-800">
                <i class="pi pi-check"></i>
              </button>
              <button class="text-red-600 hover:text-red-800">
                <i class="pi pi-times"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- General Assets View -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i class="pi pi-images mr-2"></i>
          Lista de Assets
        </h2>
        <p class="text-gray-600">
          Visualize todos os assets disponíveis no sistema.
        </p>
      </div>

      <!-- Researcher Note -->
      <div v-can="{ roles: ['pesquisador'] }" class="bg-green-50 border border-green-200 rounded-lg p-4">
        <div class="flex items-start">
          <i class="pi pi-info-circle text-green-600 mt-1 mr-2"></i>
          <div>
            <h3 class="text-sm font-medium text-green-800">
              Área do Pesquisador
            </h3>
            <p class="text-sm text-green-700 mt-1">
              Como pesquisador, você tem acesso especial às funcionalidades de upload e curadoria de assets.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Assets logic would go here
</script>

