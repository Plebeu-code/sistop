<template>
  <Badge
    :severity="statusSeverity"
    :class="statusClass"
  >
    <template #default>
      <div class="status-content">
        <i
          :class="statusIcon"
          class="status-icon"
        />
        <span class="status-text">{{ statusLabel }}</span>
      </div>
    </template>
  </Badge>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { JobStatus } from '@/shared/types'

interface Props {
  status: JobStatus
}

const props = defineProps<Props>()

const statusConfig = {
  pending: {
    label: 'Pendente',
    severity: 'secondary' as const,
    icon: 'pi pi-clock',
    class: 'status-pending'
  },
  queued: {
    label: 'Na Fila',
    severity: 'info' as const,
    icon: 'pi pi-hourglass',
    class: 'status-queued'
  },
  running: {
    label: 'Executando',
    severity: 'info' as const,
    icon: 'pi pi-spin pi-spinner',
    class: 'status-running'
  },
  completed: {
    label: 'Concluído',
    severity: 'success' as const,
    icon: 'pi pi-check-circle',
    class: 'status-completed'
  },
  failed: {
    label: 'Falhou',
    severity: 'danger' as const,
    icon: 'pi pi-exclamation-triangle',
    class: 'status-failed'
  },
  cancelled: {
    label: 'Cancelado',
    severity: 'warning' as const,
    icon: 'pi pi-ban',
    class: 'status-cancelled'
  },
  retrying: {
    label: 'Tentando',
    severity: 'warning' as const,
    icon: 'pi pi-refresh',
    class: 'status-retrying'
  }
}

const currentConfig = computed(() => {
  return statusConfig[props.status] || statusConfig.pending
})

const statusLabel = computed(() => currentConfig.value.label)
const statusSeverity = computed(() => currentConfig.value.severity)
const statusIcon = computed(() => currentConfig.value.icon)
const statusClass = computed(() => currentConfig.value.class)
</script>

<style scoped>
.status-content {
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

/* Animações para estados específicos */
.status-running .status-icon {
  animation: spin 1s linear infinite;
}

.status-retrying .status-icon {
  animation: rotate 2s ease-in-out infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes rotate {
  0%, 100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg);
  }
}

/* Cores customizadas por estado */
:deep(.status-pending) {
  background: var(--surface-100);
  color: var(--text-color-secondary);
  border: 1px solid var(--surface-300);
}

:deep(.status-queued) {
  background: var(--blue-100);
  color: var(--blue-700);
  border: 1px solid var(--blue-300);
}

:deep(.status-running) {
  background: var(--cyan-100);
  color: var(--cyan-700);
  border: 1px solid var(--cyan-300);
}

:deep(.status-completed) {
  background: var(--green-100);
  color: var(--green-700);
  border: 1px solid var(--green-300);
}

:deep(.status-failed) {
  background: var(--red-100);
  color: var(--red-700);
  border: 1px solid var(--red-300);
}

:deep(.status-cancelled) {
  background: var(--orange-100);
  color: var(--orange-700);
  border: 1px solid var(--orange-300);
}

:deep(.status-retrying) {
  background: var(--yellow-100);
  color: var(--yellow-700);
  border: 1px solid var(--yellow-300);
}

/* Responsividade */
@media (max-width: 768px) {
  .status-content {
    gap: 0.25rem;
    font-size: 0.7rem;
  }
  
  .status-icon {
    font-size: 0.65rem;
  }
}
</style>

