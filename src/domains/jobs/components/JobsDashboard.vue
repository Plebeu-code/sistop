<template>
  <div class="jobs-dashboard">
    <!-- Header com estatísticas gerais -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="title-section">
          <h2>
            <i class="pi pi-briefcase" />
            Dashboard de Jobs
          </h2>
          <p class="subtitle">
            Monitoramento de filas, tempos e falhas em tempo real
          </p>
        </div>
        
        <div class="header-actions">
          <Button
            :label="isPolling ? 'Pausar' : 'Iniciar'"
            :icon="isPolling ? 'pi pi-pause' : 'pi pi-play'"
            :severity="isPolling ? 'warning' : 'success'"
            size="small"
            @click="togglePolling"
          />
          <Button
            label="Limpar Concluídos"
            icon="pi pi-trash"
            severity="secondary"
            size="small"
            outlined
            @click="clearCompleted"
          />
          <Button
            label="Mock Jobs"
            icon="pi pi-plus"
            severity="info"
            size="small"
            outlined
            @click="createMockJobs"
          />
        </div>
      </div>
    </div>

    <!-- Cards de estatísticas -->
    <div class="stats-grid">
      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <div class="stat-icon total">
              <i class="pi pi-list" />
            </div>
            <div class="stat-info">
              <div class="stat-value">
                {{ queueStats.totalJobs }}
              </div>
              <div class="stat-label">
                Total de Jobs
              </div>
            </div>
          </div>
        </template>
      </Card>
      
      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <div class="stat-icon active">
              <i class="pi pi-spin pi-spinner" />
            </div>
            <div class="stat-info">
              <div class="stat-value">
                {{ queueStats.activeJobs }}
              </div>
              <div class="stat-label">
                Ativos
              </div>
            </div>
          </div>
        </template>
      </Card>
      
      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <div class="stat-icon completed">
              <i class="pi pi-check-circle" />
            </div>
            <div class="stat-info">
              <div class="stat-value">
                {{ queueStats.completedJobs }}
              </div>
              <div class="stat-label">
                Concluídos
              </div>
            </div>
          </div>
        </template>
      </Card>
      
      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <div class="stat-icon failed">
              <i class="pi pi-exclamation-triangle" />
            </div>
            <div class="stat-info">
              <div class="stat-value">
                {{ queueStats.failedJobs }}
              </div>
              <div class="stat-label">
                Falhas
              </div>
            </div>
          </div>
        </template>
      </Card>
      
      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <div class="stat-icon time">
              <i class="pi pi-clock" />
            </div>
            <div class="stat-info">
              <div class="stat-value">
                {{ formatDuration(queueStats.averageProcessTime) }}
              </div>
              <div class="stat-label">
                Tempo Médio
              </div>
            </div>
          </div>
        </template>
      </Card>
      
      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <div class="stat-icon throughput">
              <i class="pi pi-bolt" />
            </div>
            <div class="stat-info">
              <div class="stat-value">
                {{ queueStats.throughputPerHour }}
              </div>
              <div class="stat-label">
                Jobs/Hora
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Grid de métricas por tipo de job -->
    <div class="metrics-section">
      <div class="section-header">
        <h3>
          <i class="pi pi-chart-bar" />
          Métricas por Tipo de Job
        </h3>
        <div class="section-actions">
          <Button
            label="Atualizar"
            icon="pi pi-refresh"
            size="small"
            text
            @click="refreshMetrics"
          />
        </div>
      </div>
      
      <div class="metrics-grid">
        <Card
          v-for="metric in jobMetrics"
          :key="metric.type"
          class="metric-card"
        >
          <template #header>
            <div class="metric-header">
              <div class="metric-icon">
                <i
                  :class="jobTypeConfig[metric.type].icon"
                  :style="{ color: jobTypeConfig[metric.type].color }"
                />
              </div>
              <div class="metric-title">
                <h4>{{ jobTypeConfig[metric.type].name }}</h4>
                <small>{{ jobTypeConfig[metric.type].description }}</small>
              </div>
            </div>
          </template>
          
          <template #content>
            <div class="metric-content">
              <!-- Status badges -->
              <div class="status-badges">
                <Badge
                  v-if="metric.running > 0"
                  :value="metric.running"
                  severity="info"
                  class="status-badge"
                >
                  <i class="pi pi-spin pi-spinner" />
                  {{ metric.running }}
                </Badge>
                <Badge
                  v-if="metric.completed > 0"
                  :value="metric.completed"
                  severity="success"
                  class="status-badge"
                >
                  <i class="pi pi-check" />
                  {{ metric.completed }}
                </Badge>
                <Badge
                  v-if="metric.failed > 0"
                  :value="metric.failed"
                  severity="danger"
                  class="status-badge"
                >
                  <i class="pi pi-times" />
                  {{ metric.failed }}
                </Badge>
                <Badge
                  v-if="metric.queued > 0"
                  :value="metric.queued"
                  severity="warning"
                  class="status-badge"
                >
                  <i class="pi pi-clock" />
                  {{ metric.queued }}
                </Badge>
              </div>
              
              <!-- Métricas principais -->
              <div class="metric-stats">
                <div class="stat-row">
                  <span class="stat-name">Total:</span>
                  <span class="stat-value">{{ metric.total }}</span>
                </div>
                <div class="stat-row">
                  <span class="stat-name">Taxa de Sucesso:</span>
                  <span class="stat-value">{{ metric.successRate.toFixed(1) }}%</span>
                </div>
                <div class="stat-row">
                  <span class="stat-name">Duração Média:</span>
                  <span class="stat-value">{{ formatDuration(metric.averageDuration) }}</span>
                </div>
              </div>
              
              <!-- Progress bar da taxa de sucesso -->
              <div class="success-rate-bar">
                <ProgressBar
                  :value="metric.successRate"
                  :show-value="false"
                  class="success-progress"
                />
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- Tabela de jobs -->
    <div class="jobs-table-section">
      <div class="section-header">
        <h3>
          <i class="pi pi-table" />
          Lista de Jobs
        </h3>
        <div class="section-actions">
          <div class="filters">
            <Dropdown
              v-model="selectedStatus"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="Filtrar por Status"
              show-clear
              class="status-filter"
            />
            <Dropdown
              v-model="selectedType"
              :options="typeOptions"
              option-label="label"
              option-value="value"
              placeholder="Filtrar por Tipo"
              show-clear
              class="type-filter"
            />
          </div>
        </div>
      </div>
      
      <DataTable
        :value="filteredJobs"
        :paginator="true"
        :rows="10"
        :rows-per-page-options="[5, 10, 20, 50]"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        current-page-report-template="Mostrando {first} a {last} de {totalRecords} jobs"
        sort-field="createdAt"
        :sort-order="-1"
        responsive-layout="scroll"
        class="jobs-table"
      >
        <template #empty>
          <div class="empty-jobs">
            <i class="pi pi-inbox" />
            <p>Nenhum job encontrado</p>
          </div>
        </template>
        
        <Column
          field="id"
          header="ID"
          :sortable="true"
          style="min-width: 200px"
        >
          <template #body="slotProps">
            <code class="job-id">{{ slotProps.data.id }}</code>
          </template>
        </Column>
        
        <Column
          field="type"
          header="Tipo"
          :sortable="true"
          style="min-width: 150px"
        >
          <template #body="slotProps">
            <div class="job-type">
              <i
                :class="jobTypeConfig[slotProps.data.type as JobType]?.icon"
                :style="{ color: jobTypeConfig[slotProps.data.type as JobType]?.color }"
              />
              <span>{{ jobTypeConfig[slotProps.data.type as JobType]?.name }}</span>
            </div>
          </template>
        </Column>
        
        <Column
          field="status"
          header="Status"
          :sortable="true"
          style="min-width: 120px"
        >
          <template #body="slotProps">
            <JobStatusBadge :status="slotProps.data.status" />
          </template>
        </Column>
        
        <Column
          field="priority"
          header="Prioridade"
          :sortable="true"
          style="min-width: 100px"
        >
          <template #body="slotProps">
            <Badge
              :value="slotProps.data.priority"
              :severity="getPrioritySeverity(slotProps.data.priority)"
            />
          </template>
        </Column>
        
        <Column
          field="progress"
          header="Progresso"
          style="min-width: 120px"
        >
          <template #body="slotProps">
            <div
              v-if="slotProps.data.status === 'running' && slotProps.data.progress"
              class="progress-container"
            >
              <ProgressBar
                :value="slotProps.data.progress"
                class="job-progress"
              />
            </div>
            <span
              v-else
              class="no-progress"
            >-</span>
          </template>
        </Column>
        
        <Column
          field="duration"
          header="Duração"
          :sortable="true"
          style="min-width: 100px"
        >
          <template #body="slotProps">
            <span v-if="slotProps.data.duration">
              {{ formatDuration(slotProps.data.duration) }}
            </span>
            <span
              v-else-if="slotProps.data.status === 'running' && slotProps.data.startedAt"
              class="running-time"
            >
              {{ getRunningTime(slotProps.data.startedAt) }}
            </span>
            <span
              v-else
              class="no-duration"
            >-</span>
          </template>
        </Column>
        
        <Column
          field="createdAt"
          header="Criado"
          :sortable="true"
          style="min-width: 150px"
        >
          <template #body="slotProps">
            <small>{{ formatDateTime(slotProps.data.createdAt) }}</small>
          </template>
        </Column>
        
        <Column
          header="Ações"
          style="min-width: 150px"
        >
          <template #body="slotProps">
            <div class="job-actions">
              <Button
                v-if="canReprocess(slotProps.data)"
                v-tooltip.top="'Reprocessar'"
                icon="pi pi-refresh"
                size="small"
                severity="warning"
                text
                @click="reprocessJob(slotProps.data.id)"
              />
              <Button
                v-if="canCancel(slotProps.data)"
                v-tooltip.top="'Cancelar'"
                icon="pi pi-times"
                size="small"
                severity="danger"
                text
                @click="cancelJob(slotProps.data.id)"
              />
              <Button
                v-tooltip.top="'Ver Logs'"
                icon="pi pi-file-text"
                size="small"
                severity="info"
                text
                @click="showLogs(slotProps.data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Modal de logs -->
    <Dialog
      v-model:visible="showLogsDialog"
      :header="`Logs - ${selectedJob?.type || ''} (${selectedJob?.id || ''})`"
      :style="{ width: '800px', maxHeight: '80vh' }"
      modal
      maximizable
    >
      <div
        v-if="selectedJob"
        class="logs-container"
      >
        <div class="logs-header">
          <div class="job-summary">
            <h4>{{ jobTypeConfig[selectedJob.type].name }}</h4>
            <p>{{ jobTypeConfig[selectedJob.type].description }}</p>
            <div class="job-meta">
              <span><strong>Status:</strong> {{ selectedJob.status }}</span>
              <span><strong>Criado:</strong> {{ formatDateTime(selectedJob.createdAt) }}</span>
              <span
                v-if="selectedJob.duration"
              ><strong>Duração:</strong> {{ formatDuration(selectedJob.duration) }}</span>
            </div>
          </div>
        </div>
        
        <div class="logs-content">
          <div
            v-if="selectedJob.logs.length === 0"
            class="no-logs"
          >
            <i class="pi pi-info-circle" />
            <p>Nenhum log disponível para este job</p>
          </div>
          
          <div
            v-for="log in selectedJob.logs"
            :key="log.id"
            :class="['log-entry', `log-${log.level}`]"
          >
            <div class="log-timestamp">
              {{ formatTime(log.timestamp) }}
            </div>
            <div class="log-level">
              <Badge
                :value="log.level.toUpperCase()"
                :severity="getLogSeverity(log.level)"
              />
            </div>
            <div class="log-message">
              {{ log.message }}
            </div>
            <div
              v-if="log.data"
              class="log-data"
            >
              <code>{{ JSON.stringify(log.data, null, 2) }}</code>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <Button
          label="Fechar"
          icon="pi pi-times"
          @click="showLogsDialog = false"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useJobsStore } from '@/app/stores/jobs'
import type { Job, JobStatus, JobType, JobPriority } from '@/shared/types'
import JobStatusBadge from './JobStatusBadge.vue'

// Store
const jobsStore = useJobsStore()

// Estado local
const selectedStatus = ref<JobStatus | null>(null)
const selectedType = ref<JobType | null>(null)
const showLogsDialog = ref(false)
const selectedJob = ref<Job | null>(null)
const currentTime = ref(new Date())
const timeInterval = ref<any>(null)

// Computadas
const { jobs, isPolling, jobTypeConfig, queueStats, jobMetrics } = jobsStore

const filteredJobs = computed(() => {
  let filtered = jobs
  
  if (selectedStatus.value) {
    filtered = filtered.filter(job => job.status === selectedStatus.value)
  }
  
  if (selectedType.value) {
    filtered = filtered.filter(job => job.type === selectedType.value)
  }
  
  return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
})

const statusOptions = computed(() => [
  { label: 'Pendente', value: 'pending' },
  { label: 'Na Fila', value: 'queued' },
  { label: 'Executando', value: 'running' },
  { label: 'Concluído', value: 'completed' },
  { label: 'Falhou', value: 'failed' },
  { label: 'Cancelado', value: 'cancelled' },
  { label: 'Tentando Novamente', value: 'retrying' }
])

const typeOptions = computed(() => {
  return Object.keys(jobTypeConfig).map(type => ({
    label: jobTypeConfig[type as JobType].name,
    value: type
  }))
})

// Métodos
function togglePolling() {
  if (isPolling) {
    jobsStore.stopPolling()
  } else {
    jobsStore.startPolling()
  }
}

function clearCompleted() {
  jobsStore.clearCompletedJobs()
}

function createMockJobs() {
  jobsStore.createMockJobs()
}

function refreshMetrics() {
  // Mock refresh - em implementação real faria nova consulta
  // Auto refresh jobs
}

function reprocessJob(jobId: string) {
  jobsStore.reprocessJob(jobId)
}

function cancelJob(jobId: string) {
  jobsStore.cancelJob(jobId)
}

function showLogs(job: Job) {
  selectedJob.value = job
  showLogsDialog.value = true
}

function canReprocess(job: Job): boolean {
  return job.status === 'failed' || job.status === 'completed' || job.status === 'cancelled'
}

function canCancel(job: Job): boolean {
  return job.status === 'pending' || job.status === 'queued' || job.status === 'running'
}

function getPrioritySeverity(priority: JobPriority): string {
  const severities = {
    low: 'secondary',
    normal: 'info',
    high: 'warning',
    urgent: 'danger'
  }
  return severities[priority] || 'info'
}

function getLogSeverity(level: string): string {
  const severities = {
    debug: 'secondary',
    info: 'info',
    warn: 'warning',
    error: 'danger'
  }
  return severities[level] || 'info'
}

function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}m ${remainingSeconds}s`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date)
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date)
}

function getRunningTime(startedAt: Date): string {
  const elapsed = (currentTime.value.getTime() - startedAt.getTime()) / 1000
  return formatDuration(elapsed)
}

// Lifecycle
onMounted(() => {
  // Criar jobs de exemplo se não houver nenhum
  if (jobs.length === 0) {
    createMockJobs()
  }
  
  // Atualizar tempo atual a cada segundo para jobs em execução
  timeInterval.value = null
})

onUnmounted(() => {
  // Cleanup if needed
})
</script>

<style scoped>
.jobs-dashboard {
  padding: 1.5rem;
  background: var(--surface-ground);
}

.dashboard-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.title-section h2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
}

.title-section h2 i {
  color: var(--primary-color);
}

.subtitle {
  margin: 0;
  color: var(--text-color-secondary);
  font-size: 1rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  border: 1px solid var(--surface-border);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.stat-icon.total { background: var(--blue-500); }
.stat-icon.active { background: var(--orange-500); }
.stat-icon.completed { background: var(--green-500); }
.stat-icon.failed { background: var(--red-500); }
.stat-icon.time { background: var(--purple-500); }
.stat-icon.throughput { background: var(--teal-500); }

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  margin-top: 0.25rem;
}

.metrics-section {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--surface-border);
}

.section-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-color);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.metric-card {
  border: 1px solid var(--surface-border);
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

.metric-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--surface-100);
  font-size: 1.25rem;
}

.metric-title h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  color: var(--text-color);
}

.metric-title small {
  color: var(--text-color-secondary);
  font-size: 0.75rem;
}

.metric-content {
  padding: 0 1rem 1rem 1rem;
}

.status-badges {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.status-badge {
  font-size: 0.75rem;
}

.metric-stats {
  margin-bottom: 1rem;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.stat-name {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.stat-value {
  font-weight: 600;
  color: var(--text-color);
  font-size: 0.875rem;
}

.success-rate-bar {
  margin-top: 0.5rem;
}

.success-progress {
  height: 6px;
}

.jobs-table-section {
  margin-bottom: 2rem;
}

.filters {
  display: flex;
  gap: 0.75rem;
}

.status-filter,
.type-filter {
  min-width: 150px;
}

.jobs-table {
  margin-top: 1rem;
}

.empty-jobs {
  text-align: center;
  padding: 2rem;
  color: var(--text-color-secondary);
}

.empty-jobs i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.job-id {
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  background: var(--surface-100);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.job-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-container {
  width: 100%;
}

.job-progress {
  height: 6px;
}

.no-progress,
.no-duration {
  color: var(--text-color-secondary);
  font-style: italic;
}

.running-time {
  color: var(--orange-500);
  font-weight: 600;
}

.job-actions {
  display: flex;
  gap: 0.25rem;
}

.logs-container {
  max-height: 60vh;
}

.logs-header {
  border-bottom: 1px solid var(--surface-border);
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}

.job-summary h4 {
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
}

.job-summary p {
  margin: 0 0 1rem 0;
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.job-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.875rem;
}

.logs-content {
  max-height: 40vh;
  overflow-y: auto;
}

.no-logs {
  text-align: center;
  padding: 2rem;
  color: var(--text-color-secondary);
}

.no-logs i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.log-entry {
  display: grid;
  grid-template-columns: auto auto 1fr;
  gap: 1rem;
  padding: 0.75rem;
  border-bottom: 1px solid var(--surface-100);
  font-size: 0.875rem;
}

.log-entry:hover {
  background: var(--surface-50);
}

.log-timestamp {
  font-family: 'Courier New', monospace;
  color: var(--text-color-secondary);
  white-space: nowrap;
}

.log-level {
  white-space: nowrap;
}

.log-message {
  color: var(--text-color);
}

.log-data {
  grid-column: 1 / -1;
  margin-top: 0.5rem;
}

.log-data code {
  display: block;
  background: var(--surface-100);
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: pre-wrap;
  word-break: break-all;
}

/* Responsividade */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .filters {
    flex-direction: column;
  }
  
  .status-filter,
  .type-filter {
    min-width: auto;
  }
  
  .log-entry {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .job-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .jobs-dashboard {
    padding: 1rem;
  }
  
  .title-section h2 {
    font-size: 1.5rem;
  }
  
  .stat-content {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
}
</style>

