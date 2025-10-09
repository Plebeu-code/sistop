<template>
  <div class="admin-view">
    <!-- Header -->
    <div class="admin-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <i class="pi pi-cog" />
            Administração
          </h1>
          <p class="page-subtitle">
            Gestão de usuários, projetos, canais e configurações do sistema
          </p>
        </div>
        
        <div class="header-stats">
          <div class="stat-item">
            <span class="stat-value">{{ activeUsers.length }}</span>
            <span class="stat-label">Usuários Ativos</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ activeProjetos.length }}</span>
            <span class="stat-label">Projetos</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ canais.length }}</span>
            <span class="stat-label">Canais</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Menu de Navegação -->
    <div class="admin-nav">
      <Button
        v-for="tab in adminTabs"
        :key="tab.id"
        :label="tab.label"
        :icon="tab.icon"
        :severity="activeTab === tab.id ? 'primary' : 'secondary'"
        :outlined="activeTab !== tab.id"
        @click="activeTab = tab.id"
        class="nav-button"
      />
    </div>

    <!-- Conteúdo das Abas -->
    <div class="admin-content">
      <!-- Usuários -->
      <div v-if="activeTab === 'users'" class="tab-content">
        <UsersManagement />
      </div>

      <!-- Projetos -->
      <div v-if="activeTab === 'projects'" class="tab-content">
        <ProjectsManagement />
      </div>

      <!-- Canais -->
      <div v-if="activeTab === 'channels'" class="tab-content">
        <ChannelsManagement />
      </div>

      <!-- Vozes -->
      <div v-if="activeTab === 'voices'" class="tab-content">
        <VoicesManagement />
      </div>

      <!-- Configurações -->
      <div v-if="activeTab === 'settings'" class="tab-content">
        <SystemSettings />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/app/stores/admin'
import UsersManagement from './components/UsersManagement.vue'
import ProjectsManagement from './components/ProjectsManagement.vue'
import ChannelsManagement from './components/ChannelsManagement.vue'
import VoicesManagement from './components/VoicesManagement.vue'
import SystemSettings from './components/SystemSettings.vue'

// Store
const adminStore = useAdminStore()

// Estado local
const activeTab = ref('users')

// Computeds da store
const { activeUsers, activeProjetos, canais } = adminStore

// Configuração das abas
const adminTabs = [
  {
    id: 'users',
    label: 'Usuários',
    icon: 'pi pi-users'
  },
  {
    id: 'projects',
    label: 'Projetos',
    icon: 'pi pi-folder'
  },
  {
    id: 'channels',
    label: 'Canais',
    icon: 'pi pi-sitemap'
  },
  {
    id: 'voices',
    label: 'Vozes',
    icon: 'pi pi-volume-up'
  },
  {
    id: 'settings',
    label: 'Configurações',
    icon: 'pi pi-sliders-h'
  }
]

// Lifecycle
onMounted(async () => {
  // Carregar dados iniciais
  await Promise.all([
    adminStore.fetchUsers(),
    adminStore.fetchProjetos(),
    adminStore.fetchCanais(),
    adminStore.fetchVoiceProfiles()
  ])
})
</script>

<style scoped>
.admin-view {
  padding: 1.5rem;
  background: var(--surface-ground);
  min-height: 100vh;
}

.admin-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.title-section {
  flex: 1;
}

.page-title {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-title i {
  color: var(--primary-color);
}

.page-subtitle {
  margin: 0;
  color: var(--text-color-secondary);
  font-size: 1.1rem;
}

.header-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1;
}

.stat-label {
  display: block;
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  margin-top: 0.25rem;
}

.admin-nav {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  padding: 0.5rem;
  background: var(--surface-card);
  border-radius: var(--border-radius);
  border: 1px solid var(--surface-border);
}

.nav-button {
  flex: 1;
  justify-content: center;
}

.admin-content {
  background: var(--surface-card);
  border-radius: var(--border-radius);
  border: 1px solid var(--surface-border);
  min-height: 600px;
}

.tab-content {
  padding: 1.5rem;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-stats {
    justify-content: space-around;
  }
  
  .admin-nav {
    flex-wrap: wrap;
  }
  
  .nav-button {
    flex: 1 1 calc(50% - 0.25rem);
    min-width: 120px;
  }
}
</style>

