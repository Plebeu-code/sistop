<template>
  <div class="reports-view">
    <!-- Header -->
    <div class="reports-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <i class="pi pi-chart-bar" />
            Relatórios & Rastreabilidade
          </h1>
          <p class="page-subtitle">
            Análise de uso de clips, assets e performance de canais
          </p>
        </div>
        
        <div class="header-actions">
          <Button
            label="Dados Mock"
            icon="pi pi-database"
            severity="secondary"
            :disabled="isGenerating"
            @click="createMockData"
          />
          <Button
            label="Limpar Dados"
            icon="pi pi-trash"
            severity="danger"
            outlined
            :disabled="isGenerating"
            @click="clearData"
          />
        </div>
      </div>
    </div>

    <!-- Estatísticas Rápidas -->
    <div class="stats-grid">
      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <div class="stat-icon total">
              <i class="pi pi-video" />
            </div>
            <div class="stat-info">
              <div class="stat-value">
                {{ totalUsages }}
              </div>
              <div class="stat-label">
                Total de Usos
              </div>
            </div>
          </div>
        </template>
      </Card>

      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <div class="stat-icon duration">
              <i class="pi pi-clock" />
            </div>
            <div class="stat-info">
              <div class="stat-value">
                {{ formatDuration(totalDurationUsed) }}
              </div>
              <div class="stat-label">
                Tempo Total
              </div>
            </div>
          </div>
        </template>
      </Card>

      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <div class="stat-icon languages">
              <i class="pi pi-globe" />
            </div>
            <div class="stat-info">
              <div class="stat-value">
                {{ Object.keys(usagesByLanguage).length }}
              </div>
              <div class="stat-label">
                Idiomas
              </div>
            </div>
          </div>
        </template>
      </Card>

      <Card class="stat-card">
        <template #content>
          <div class="stat-content">
            <div class="stat-icon channels">
              <i class="pi pi-sitemap" />
            </div>
            <div class="stat-info">
              <div class="stat-value">
                {{ Object.keys(usagesByChannel).length }}
              </div>
              <div class="stat-label">
                Canais
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Filtros de Relatório -->
    <Card class="filters-card">
      <template #title>
        <div class="card-title">
          <i class="pi pi-filter" />
          Filtros de Relatório
        </div>
      </template>
      
      <template #content>
        <div class="filters-grid">
          <div class="filter-group">
            <label for="projeto">Projeto</label>
            <Dropdown
              id="projeto"
              v-model="reportCriteria.projeto"
              :options="projetos"
              option-label="nome"
              option-value="id"
              placeholder="Todos os projetos"
              show-clear
            />
          </div>

          <div class="filter-group">
            <label for="canal">Canal</label>
            <Dropdown
              id="canal"
              v-model="reportCriteria.canalId"
              :options="canais"
              option-label="nome"
              option-value="id"
              placeholder="Todos os canais"
              show-clear
            />
          </div>

          <div class="filter-group">
            <label for="pauta">Pauta</label>
            <Dropdown
              id="pauta"
              v-model="reportCriteria.pautaId"
              :options="pautas"
              option-label="titulo"
              option-value="id"
              placeholder="Todas as pautas"
              show-clear
            />
          </div>

          <div class="filter-group">
            <label for="idioma">Idioma</label>
            <Dropdown
              id="idioma"
              v-model="reportCriteria.idioma"
              :options="idiomas"
              option-label="nome"
              option-value="codigo"
              placeholder="Todos os idiomas"
              show-clear
            />
          </div>

          <div class="filter-group">
            <label for="dataInicio">Data Início</label>
            <Calendar
              id="dataInicio"
              v-model="reportCriteria.dataInicio"
              date-format="dd/mm/yy"
              placeholder="Selecionar data"
              show-clear
            />
          </div>

          <div class="filter-group">
            <label for="dataFim">Data Fim</label>
            <Calendar
              id="dataFim"
              v-model="reportCriteria.dataFim"
              date-format="dd/mm/yy"
              placeholder="Selecionar data"
              show-clear
            />
          </div>
        </div>

        <div class="filters-actions">
          <Button
            label="Gerar Relatório"
            icon="pi pi-chart-line"
            :loading="isGenerating"
            :disabled="totalUsages === 0"
            @click="generateReport"
          />
          <Button
            label="Limpar Filtros"
            icon="pi pi-filter-slash"
            severity="secondary"
            outlined
            @click="clearFilters"
          />
        </div>
      </template>
    </Card>

    <!-- Resultados do Relatório -->
    <div
      v-if="currentReport"
      class="report-results"
    >
      <!-- Resumo Executivo -->
      <Card class="summary-card">
        <template #title>
          <div class="card-title">
            <i class="pi pi-chart-pie" />
            Resumo Executivo
          </div>
        </template>
        
        <template #content>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-label">
                Clips Analisados
              </div>
              <div class="summary-value">
                {{ currentReport.totalClips }}
              </div>
            </div>
            <div class="summary-item">
              <div class="summary-label">
                Duração Total
              </div>
              <div class="summary-value">
                {{ formatDuration(currentReport.totalDuracao) }}
              </div>
            </div>
            <div class="summary-item">
              <div class="summary-label">
                Assets Únicos
              </div>
              <div class="summary-value">
                {{ currentReport.assetsUsados.length }}
              </div>
            </div>
            <div class="summary-item">
              <div class="summary-label">
                Canais Ativos
              </div>
              <div class="summary-value">
                {{ Object.keys(currentReport.contagemPorCanal).length }}
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Gráficos de Distribuição -->
      <div class="charts-grid">
        <Card class="chart-card">
          <template #title>
            Distribuição por Idioma
          </template>
          <template #content>
            <div class="language-stats">
              <div
                v-for="(count, language) in currentReport.contagemPorIdioma"
                :key="language"
                class="language-item"
              >
                <div class="language-info">
                  <span class="language-name">{{ getLanguageName(language) }}</span>
                  <span class="language-count">{{ count }} clips</span>
                </div>
                <ProgressBar
                  :value="(count / currentReport.totalClips) * 100"
                  class="language-progress"
                />
              </div>
            </div>
          </template>
        </Card>

        <Card class="chart-card">
          <template #title>
            Distribuição por Canal
          </template>
          <template #content>
            <div class="channel-stats">
              <div
                v-for="(count, channel) in currentReport.contagemPorCanal"
                :key="channel"
                class="channel-item"
              >
                <div class="channel-info">
                  <span class="channel-name">{{ channel }}</span>
                  <span class="channel-count">{{ count }} clips</span>
                </div>
                <ProgressBar
                  :value="(count / currentReport.totalClips) * 100"
                  class="channel-progress"
                />
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Assets Mais Usados -->
      <Card class="assets-card">
        <template #title>
          <div class="card-title">
            <i class="pi pi-star" />
            Assets Mais Usados
          </div>
        </template>
        
        <template #content>
          <DataTable
            :value="currentReport.assetsUsados.slice(0, 10)"
            responsive-layout="scroll"
            class="assets-table"
          >
            <Column
              header="Asset"
              field="nomeAsset"
              sortable
            >
              <template #body="slotProps">
                <div class="asset-info">
                  <i class="pi pi-file" />
                  <span>{{ slotProps.data.nomeAsset }}</span>
                </div>
              </template>
            </Column>
            <Column
              header="Vezes Usado"
              field="vezesUsado"
              sortable
            >
              <template #body="slotProps">
                <Badge
                  :value="slotProps.data.vezesUsado"
                  severity="info"
                />
              </template>
            </Column>
            <Column
              header="Duração Total"
              field="duracaoTotal"
              sortable
            >
              <template #body="slotProps">
                {{ formatDuration(slotProps.data.duracaoTotal) }}
              </template>
            </Column>
            <Column
              header="Duração Média"
              sortable
            >
              <template #body="slotProps">
                {{ formatDuration(slotProps.data.duracaoTotal / slotProps.data.vezesUsado) }}
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>

      <!-- Exportação -->
      <Card class="export-card">
        <template #title>
          <div class="card-title">
            <i class="pi pi-download" />
            Exportar Relatório
          </div>
        </template>
        
        <template #content>
          <div class="export-options">
            <div class="export-info">
              <p>Exporte os dados completos do relatório nos formatos disponíveis:</p>
              <ul>
                <li><strong>CSV:</strong> Dados tabulares para análise em planilhas</li>
                <li><strong>JSON:</strong> Dados estruturados para integração</li>
              </ul>
            </div>
            
            <div class="export-actions">
              <Button
                label="Exportar CSV"
                icon="pi pi-file-excel"
                severity="success"
                @click="exportReport('csv')"
              />
              <Button
                label="Exportar JSON"
                icon="pi pi-code"
                severity="info"
                @click="exportReport('json')"
              />
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Estado Vazio -->
    <Card
      v-else-if="!isGenerating && totalUsages === 0"
      class="empty-state"
    >
      <template #content>
        <div class="empty-content">
          <i class="pi pi-chart-bar empty-icon" />
          <h3>Nenhum Uso Registrado</h3>
          <p>
            Ainda não há registros de uso de clips. 
            <br>
            Adicione clips aos roteiros para começar a rastreabilidade.
          </p>
          <Button
            label="Criar Dados de Exemplo"
            icon="pi pi-plus"
            @click="createMockData"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useClipUsageStore } from '@/app/stores/clipUsage'
import { usePautaStore } from '@/app/stores/pauta'
import type { RelatorioCriteria, RelatorioData, ExportFormat } from '@/shared/types'

// Stores
const clipUsageStore = useClipUsageStore()
const pautaStore = usePautaStore()

// Estado local
const reportCriteria = ref<RelatorioCriteria>({})
const currentReport = ref<RelatorioData | null>(null)
const isGenerating = ref(false)

// Dados para os filtros
const projetos = ref([
  { id: 'proj-1', nome: 'Projeto Alpha' },
  { id: 'proj-2', nome: 'Projeto Beta' },
  { id: 'proj-3', nome: 'Projeto Gamma' }
])

const canais = computed(() => {
  return pautaStore.pautas.map(p => p.canal).filter((canal, index, arr) => 
    arr.findIndex(c => c.id === canal.id) === index
  )
})

const pautas = computed(() => pautaStore.pautas)

const idiomas = ref([
  { codigo: 'pt-BR', nome: 'Português (Brasil)' },
  { codigo: 'en-US', nome: 'Inglês (EUA)' },
  { codigo: 'es-ES', nome: 'Espanhol (Espanha)' },
  { codigo: 'fr-FR', nome: 'Francês (França)' }
])

// Computeds da store
const { totalUsages, usagesByLanguage, usagesByChannel } = clipUsageStore

const totalDurationUsed = computed(() => {
  return clipUsageStore.clipUsages.reduce((sum, usage) => sum + usage.duracao, 0)
})

// Métodos
async function generateReport() {
  isGenerating.value = true
  try {
    currentReport.value = await clipUsageStore.generateReport(reportCriteria.value)
  } finally {
    isGenerating.value = false
  }
}

function exportReport(format: ExportFormat) {
  if (currentReport.value) {
    const timestamp = new Date().toISOString().split('T')[0]
    clipUsageStore.exportReport(
      currentReport.value,
      format,
      `relatorio_clips_${timestamp}`
    )
  }
}

function clearFilters() {
  reportCriteria.value = {}
  currentReport.value = null
}

function createMockData() {
  clipUsageStore.createMockUsages()
}

function clearData() {
  clipUsageStore.clearUsages()
  currentReport.value = null
}

function getLanguageName(code: string): string {
  const language = idiomas.value.find(l => l.codigo === code)
  return language?.nome || code
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  return `${minutes}m ${remainingSeconds}s`
}

// Lifecycle
onMounted(() => {
  // Criar dados mock se não houver
  if (totalUsages === 0) {
    createMockData()
  }
})
</script>

<style scoped>
.reports-view {
  padding: 1.5rem;
  background: var(--surface-ground);
  min-height: 100vh;
}

.reports-header {
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

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.stat-card {
  border: 1px solid var(--surface-border);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
}

.stat-icon.total { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-icon.duration { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.stat-icon.languages { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.stat-icon.channels { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-color);
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  margin-top: 0.25rem;
}

.filters-card {
  margin-bottom: 2rem;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: var(--text-color);
  font-size: 0.875rem;
}

.filters-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-start;
}

.report-results {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.summary-card {
  border: 1px solid var(--surface-border);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 2rem;
}

.summary-item {
  text-align: center;
}

.summary-label {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  margin-bottom: 0.5rem;
}

.summary-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.chart-card {
  border: 1px solid var(--surface-border);
}

.language-stats,
.channel-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.language-item,
.channel-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.language-info,
.channel-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.language-name,
.channel-name {
  font-weight: 500;
}

.language-count,
.channel-count {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

.language-progress,
.channel-progress {
  height: 0.5rem;
}

.assets-card {
  border: 1px solid var(--surface-border);
}

.asset-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.asset-info i {
  color: var(--text-color-secondary);
}

.export-card {
  border: 1px solid var(--surface-border);
}

.export-options {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.export-info {
  flex: 1;
}

.export-info ul {
  margin: 1rem 0 0 1.5rem;
  color: var(--text-color-secondary);
}

.export-actions {
  display: flex;
  gap: 0.75rem;
}

.empty-state {
  border: 1px solid var(--surface-border);
}

.empty-content {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  font-size: 4rem;
  color: var(--text-color-secondary);
  margin-bottom: 1rem;
}

.empty-content h3 {
  margin: 0 0 1rem 0;
  color: var(--text-color);
}

.empty-content p {
  color: var(--text-color-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .export-options {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>

