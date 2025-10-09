import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ClipUsage, RelatorioCriteria, RelatorioData, ExportFormat } from '@/shared/types'
import { useToastStore } from './toast'
import { usePautaStore } from './pauta'
import { useAssetStore } from './asset'

/**
 * Store para gerenciar Rastreabilidade e Relatórios
 * TAREFA 10 — Rastreabilidade & Relatórios
 */
export const useClipUsageStore = defineStore('clipUsage', () => {
  const toastStore = useToastStore()
  const pautaStore = usePautaStore()
  const assetStore = useAssetStore()

  // Estado reativo
  const clipUsages = ref<ClipUsage[]>([])
  const isGeneratingReport = ref(false)

  // Computeds
  const totalUsages = computed(() => clipUsages.value.length)
  
  const usagesByLanguage = computed(() => {
    const stats: Record<string, number> = {}
    clipUsages.value.forEach(usage => {
      stats[usage.idioma] = (stats[usage.idioma] || 0) + 1
    })
    return stats
  })

  const usagesByChannel = computed(() => {
    const stats: Record<string, { count: number; totalDuration: number }> = {}
    clipUsages.value.forEach(usage => {
      const channel = usage.contexto.tituloCanal
      if (!stats[channel]) {
        stats[channel] = { count: 0, totalDuration: 0 }
      }
      stats[channel].count++
      stats[channel].totalDuration += usage.duracao
    })
    return stats
  })

  const mostUsedAssets = computed(() => {
    const assetStats: Record<string, { count: number; totalDuration: number; name: string }> = {}
    
    clipUsages.value.forEach(usage => {
      const assetId = usage.assetId
      if (!assetStats[assetId]) {
        assetStats[assetId] = {
          count: 0,
          totalDuration: 0,
          name: usage.contexto.nomeAsset
        }
      }
      assetStats[assetId].count++
      assetStats[assetId].totalDuration += usage.duracao
    })

    return Object.entries(assetStats)
      .map(([id, stats]) => ({ assetId: id, ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  })

  // Actions
  function generateClipUsage(params: {
    clipId: string
    assetId: string
    pautaId: string
    roteiroId: string
    canalId: string
    idioma: string
    posicao: number
    startTime: number
    endTime: number
  }): ClipUsage {
    const duracao = params.endTime - params.startTime
    
    // Buscar contexto
    const pauta = pautaStore.pautas.find(p => p.id === params.pautaId)
    const asset = assetStore.assets.find(a => a.id === params.assetId)
    const canal = pauta?.canal

    const clipUsage: ClipUsage = {
      id: generateId(),
      clipId: params.clipId,
      assetId: params.assetId,
      pautaId: params.pautaId,
      roteiroId: params.roteiroId,
      canalId: params.canalId,
      idioma: params.idioma,
      posicao: params.posicao,
      startTime: params.startTime,
      endTime: params.endTime,
      duracao,
      contexto: {
        tituloCanal: canal?.nome || 'Canal Desconhecido',
        tituloPauta: pauta?.titulo || 'Pauta Desconhecida',
        tituloRoteiro: `Roteiro ${params.roteiroId.slice(-8)}`,
        nomeAsset: asset?.filename || 'Asset Desconhecido',
        nomeClip: `Clip ${params.clipId.slice(-8)}`
      },
      metadados: {
        versao: '1.0',
        tags: [],
        observacoes: ''
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    clipUsages.value.push(clipUsage)
    
    toastStore.success(
      'Uso Registrado',
      `Clip adicionado à timeline - ${Math.round(duracao)}s em ${clipUsage.contexto.tituloCanal}`
    )

    return clipUsage
  }

  async function generateReport(criteria: RelatorioCriteria = {}): Promise<RelatorioData> {
    isGeneratingReport.value = true

    try {
      // Filtrar usos baseado nos critérios
      let filteredUsages = clipUsages.value

      if (criteria.canalId) {
        filteredUsages = filteredUsages.filter(u => u.canalId === criteria.canalId)
      }

      if (criteria.pautaId) {
        filteredUsages = filteredUsages.filter(u => u.pautaId === criteria.pautaId)
      }

      if (criteria.idioma) {
        filteredUsages = filteredUsages.filter(u => u.idioma === criteria.idioma)
      }

      if (criteria.dataInicio) {
        filteredUsages = filteredUsages.filter(u => u.createdAt >= criteria.dataInicio!)
      }

      if (criteria.dataFim) {
        filteredUsages = filteredUsages.filter(u => u.createdAt <= criteria.dataFim!)
      }

      // Calcular estatísticas
      const totalClips = filteredUsages.length
      const totalDuracao = filteredUsages.reduce((sum, u) => sum + u.duracao, 0)

      const contagemPorIdioma: Record<string, number> = {}
      const contagemPorCanal: Record<string, number> = {}
      const assetStats: Record<string, { vezesUsado: number; duracaoTotal: number; nome: string }> = {}
      const clipStats: Record<string, { vezesUsado: number; duracaoTotal: number; nome: string }> = {}

      filteredUsages.forEach(usage => {
        // Por idioma
        contagemPorIdioma[usage.idioma] = (contagemPorIdioma[usage.idioma] || 0) + 1
        
        // Por canal
        contagemPorCanal[usage.contexto.tituloCanal] = (contagemPorCanal[usage.contexto.tituloCanal] || 0) + 1

        // Assets
        if (!assetStats[usage.assetId]) {
          assetStats[usage.assetId] = {
            vezesUsado: 0,
            duracaoTotal: 0,
            nome: usage.contexto.nomeAsset
          }
        }
        assetStats[usage.assetId].vezesUsado++
        assetStats[usage.assetId].duracaoTotal += usage.duracao

        // Clips
        if (!clipStats[usage.clipId]) {
          clipStats[usage.clipId] = {
            vezesUsado: 0,
            duracaoTotal: 0,
            nome: usage.contexto.nomeClip
          }
        }
        clipStats[usage.clipId].vezesUsado++
        clipStats[usage.clipId].duracaoTotal += usage.duracao
      })

      const assetsUsados = Object.entries(assetStats).map(([assetId, stats]) => ({
        assetId,
        nomeAsset: stats.nome,
        vezesUsado: stats.vezesUsado,
        duracaoTotal: stats.duracaoTotal
      })).sort((a, b) => b.vezesUsado - a.vezesUsado)

      const clipsUsados = Object.entries(clipStats).map(([clipId, stats]) => ({
        clipId,
        nomeClip: stats.nome,
        vezesUsado: stats.vezesUsado,
        duracaoTotal: stats.duracaoTotal
      })).sort((a, b) => b.vezesUsado - a.vezesUsado)

      const report: RelatorioData = {
        totalClips,
        totalDuracao,
        contagemPorIdioma,
        contagemPorCanal,
        assetsUsados,
        clipsUsados,
        usos: filteredUsages
      }

      await new Promise(resolve => setTimeout(resolve, 800)) // Simular processamento

      toastStore.success('Relatório Gerado', `${totalClips} usos analisados em ${Math.round(totalDuracao/60)} minutos de conteúdo`)

      return report

    } finally {
      isGeneratingReport.value = false
    }
  }

  function exportReport(data: RelatorioData, format: ExportFormat, filename: string = 'relatorio_clip_usage') {
    try {
      let content: string
      let mimeType: string
      let extension: string

      if (format === 'csv') {
        content = generateCSV(data)
        mimeType = 'text/csv'
        extension = 'csv'
      } else {
        content = JSON.stringify(data, null, 2)
        mimeType = 'application/json'
        extension = 'json'
      }

      // Download mock
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}.${extension}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toastStore.success('Exportado', `Relatório salvo como ${filename}.${extension}`)

    } catch (error) {
      toastStore.error('Erro na Exportação', 'Não foi possível exportar o relatório')
    }
  }

  function generateCSV(data: RelatorioData): string {
    const headers = [
      'Asset ID',
      'Nome Asset',
      'Clip ID',
      'Nome Clip',
      'Canal',
      'Pauta',
      'Idioma',
      'Posição',
      'Duração (s)',
      'Data Uso'
    ]

    const rows = data.usos.map(uso => [
      uso.assetId,
      uso.contexto.nomeAsset,
      uso.clipId,
      uso.contexto.nomeClip,
      uso.contexto.tituloCanal,
      uso.contexto.tituloPauta,
      uso.idioma,
      uso.posicao.toString(),
      uso.duracao.toFixed(2),
      uso.createdAt.toLocaleDateString('pt-BR')
    ])

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
  }

  // Mock data para demonstração
  function createMockUsages() {
    const mockUsages: Partial<ClipUsage>[] = [
      {
        clipId: 'clip-001',
        assetId: 'asset-video-001',
        pautaId: 'pauta-001',
        roteiroId: 'roteiro-001',
        canalId: 'canal-001',
        idioma: 'pt-BR',
        posicao: 1,
        startTime: 0,
        endTime: 30,
        duracao: 30
      },
      {
        clipId: 'clip-002',
        assetId: 'asset-audio-001',
        pautaId: 'pauta-001',
        roteiroId: 'roteiro-001',
        canalId: 'canal-001',
        idioma: 'pt-BR',
        posicao: 2,
        startTime: 15,
        endTime: 45,
        duracao: 30
      },
      {
        clipId: 'clip-003',
        assetId: 'asset-video-002',
        pautaId: 'pauta-002',
        roteiroId: 'roteiro-002',
        canalId: 'canal-002',
        idioma: 'en-US',
        posicao: 1,
        startTime: 0,
        endTime: 60,
        duracao: 60
      }
    ]

    mockUsages.forEach(usage => {
      if (usage.clipId && usage.assetId && usage.pautaId && usage.roteiroId && 
          usage.canalId && usage.idioma !== undefined && usage.posicao !== undefined &&
          usage.startTime !== undefined && usage.endTime !== undefined) {
        generateClipUsage({
          clipId: usage.clipId,
          assetId: usage.assetId,
          pautaId: usage.pautaId,
          roteiroId: usage.roteiroId,
          canalId: usage.canalId,
          idioma: usage.idioma,
          posicao: usage.posicao,
          startTime: usage.startTime,
          endTime: usage.endTime
        })
      }
    })
  }

  function clearUsages() {
    clipUsages.value = []
    toastStore.info('Dados Limpos', 'Histórico de uso de clips removido')
  }

  // Utility
  function generateId(): string {
    return `usage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  return {
    // State
    clipUsages,
    isGeneratingReport,
    
    // Getters
    totalUsages,
    usagesByLanguage,
    usagesByChannel,
    mostUsedAssets,
    
    // Actions
    generateClipUsage,
    generateReport,
    exportReport,
    createMockUsages,
    clearUsages
  }
})