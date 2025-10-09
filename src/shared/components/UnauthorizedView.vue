<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full text-center">
      <div class="mb-8">
        <i class="pi pi-ban text-6xl text-red-500 mb-4"></i>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">
          Acesso Negado
        </h1>
        <p class="text-gray-600">
          Você não tem permissão para acessar esta página.
        </p>
      </div>
      
      <button
        @click="$router.go(-1)"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Voltar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Unauthorized view logic
</script>

