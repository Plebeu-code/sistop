<template>
  <div class="tts-view">
    <div class="view-header">
      <div class="header-content">
        <div class="title-section">
          <h1>
            <i class="pi pi-volume-up" />
            TTS Manager
          </h1>
          <p class="subtitle">
            Gerenciamento de texto-para-fala por comentário e idioma
          </p>
        </div>
        
        <div class="header-stats">
          <div class="stat-card">
            <div class="stat-value">{{ totalComentarios }}</div>
            <div class="stat-label">Comentários</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ totalAudiosGerados }}</div>
            <div class="stat-label">Áudios Gerados</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ totalIdiomas }}</div>
            <div class="stat-label">Idiomas</div>
          </div>
        </div>
      </div>
    </div>

    <div class="view-content">
      <TTSManager :roteiro-id="roteiroId" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTTSStore } from '@/app/stores/tts'
import TTSManager from './components/TTSManager.vue'

// Props
interface Props {
  roteiroId?: string
}

const props = withDefaults(defineProps<Props>(), {
  roteiroId: 'roteiro-demo'
})

// Store
const ttsStore = useTTSStore()

// Estado
const roteiroId = ref(props.roteiroId)

// Computadas para estatísticas
const totalComentarios = computed(() => {
  // Contar comentários únicos pelos IDs
  const comentarioIds = new Set(ttsStore.ttsStates.map(state => state.comentarioId))
  return comentarioIds.size
})

const totalAudiosGerados = computed(() => {
  return ttsStore.ttsStates.filter(state => state.status === 'generated').length
})

const totalIdiomas = computed(() => {
  return ttsStore.availableLanguages.length
})

// Lifecycle
onMounted(() => {
  // Inicialização já é feita no TTSManager
})
</script>

<style scoped>
.tts-view {
  min-height: 100vh;
  background: var(--surface-ground);
}

.view-header {
  background: var(--surface-card);
  border-bottom: 1px solid var(--surface-border);
  padding: 2rem 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.title-section h1 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-color);
}

.title-section h1 i {
  color: var(--primary-color);
  font-size: 2.25rem;
}

.subtitle {
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-color-secondary);
  font-weight: 400;
}

.header-stats {
  display: flex;
  gap: 1.5rem;
}

.stat-card {
  text-align: center;
  padding: 1rem 1.5rem;
  background: var(--surface-ground);
  border: 1px solid var(--surface-border);
  border-radius: var(--border-radius);
  min-width: 100px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.25rem;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.view-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 2rem 2rem;
}

/* Responsividade */
@media (max-width: 968px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
  }
  
  .header-stats {
    justify-content: center;
  }
  
  .title-section h1 {
    font-size: 2rem;
  }
  
  .title-section h1 i {
    font-size: 1.75rem;
  }
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 1rem;
  }
  
  .view-content {
    padding: 0 1rem 2rem 1rem;
  }
  
  .header-stats {
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .stat-card {
    flex: 1;
    min-width: 80px;
    padding: 0.75rem 1rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .stat-label {
    font-size: 0.75rem;
  }
  
  .title-section h1 {
    font-size: 1.75rem;
  }
  
  .subtitle {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .view-header {
    padding: 1.5rem 0;
  }
  
  .title-section h1 {
    font-size: 1.5rem;
    gap: 0.5rem;
  }
  
  .title-section h1 i {
    font-size: 1.5rem;
  }
  
  .subtitle {
    font-size: 0.9rem;
  }
  
  .header-stats {
    gap: 0.75rem;
  }
  
  .stat-card {
    padding: 0.5rem 0.75rem;
  }
  
  .stat-value {
    font-size: 1.25rem;
  }
  
  .stat-label {
    font-size: 0.7rem;
  }
}
</style>

