<template>
  <div class="tts-status-badge">
    <Badge
      :value="statusLabel"
      :severity="statusSeverity"
      :class="statusClass"
    >
      <template #value>
        <div class="badge-content">
          <i
            :class="statusIcon"
            class="status-icon"
          />
          <span class="status-text">{{ statusLabel }}</span>
          <div
            v-if="status === 'generating' && progress > 0"
            class="progress-indicator"
          >
            <small>({{ progress }}%)</small>
          </div>
        </div>
      </template>
    </Badge>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TTSStatus } from '@/shared/types'

interface Props {
  status: TTSStatus
  progress?: number
}

const props = withDefaults(defineProps<Props>(), {
  progress: 0
})

const statusConfig = {
  idle: {
    label: 'Pendente',
    severity: 'secondary' as const,
    icon: 'pi pi-clock',
    class: 'status-idle'
  },
  pending: {
    label: 'Na Fila',
    severity: 'info' as const,
    icon: 'pi pi-hourglass',
    class: 'status-pending'
  },
  generating: {
    label: 'Gerando',
    severity: 'info' as const,
    icon: 'pi pi-spin pi-spinner',
    class: 'status-generating'
  },
  generated: {
    label: 'Gerado',
    severity: 'success' as const,
    icon: 'pi pi-check-circle',
    class: 'status-generated'
  },
  playing: {
    label: 'Reproduzindo',
    severity: 'success' as const,
    icon: 'pi pi-play',
    class: 'status-playing'
  },
  error: {
    label: 'Erro',
    severity: 'danger' as const,
    icon: 'pi pi-exclamation-triangle',
    class: 'status-error'
  }
}

const currentConfig = computed(() => {
  return statusConfig[props.status] || statusConfig.idle
})

const statusLabel = computed(() => currentConfig.value.label)
const statusSeverity = computed(() => currentConfig.value.severity)
const statusIcon = computed(() => currentConfig.value.icon)
const statusClass = computed(() => currentConfig.value.class)
</script>

<style scoped>
.tts-status-badge {
  display: inline-flex;
  align-items: center;
}

.badge-content {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-icon {
  font-size: 0.7rem;
}

.status-text {
  white-space: nowrap;
}

.progress-indicator {
  opacity: 0.8;
}

.progress-indicator small {
  font-size: 0.65rem;
  font-weight: 500;
}

/* Animações para estados específicos */
.status-generating .status-icon {
  animation: spin 1s linear infinite;
}

.status-playing .status-icon {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

/* Cores customizadas por estado */
:deep(.status-idle) {
  background: var(--surface-100);
  color: var(--text-color-secondary);
  border: 1px solid var(--surface-300);
}

:deep(.status-pending) {
  background: var(--blue-100);
  color: var(--blue-700);
  border: 1px solid var(--blue-300);
}

:deep(.status-generating) {
  background: var(--cyan-100);
  color: var(--cyan-700);
  border: 1px solid var(--cyan-300);
}

:deep(.status-generated) {
  background: var(--green-100);
  color: var(--green-700);
  border: 1px solid var(--green-300);
}

:deep(.status-playing) {
  background: var(--green-200);
  color: var(--green-800);
  border: 1px solid var(--green-400);
  box-shadow: 0 0 0 2px var(--green-100);
}

:deep(.status-error) {
  background: var(--red-100);
  color: var(--red-700);
  border: 1px solid var(--red-300);
}

/* Responsividade */
@media (max-width: 768px) {
  .badge-content {
    gap: 0.25rem;
    font-size: 0.7rem;
  }
  
  .status-icon {
    font-size: 0.65rem;
  }
  
  .progress-indicator small {
    font-size: 0.6rem;
  }
}
</style>

