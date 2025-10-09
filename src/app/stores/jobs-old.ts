import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Job, JobType, JobStatus, JobPriority, JobMetrics, JobQueueStats, JobLog } from '@/shared/types'
import { useToastStore } from './toast'

/**
 * Store para gerenciar Jobs e Monitoramento
 * TAREFA 09 — Monitoramento de Jobs
 */
export const useJobsStore = defineStore('jobs', () => {
  const toastStore = useToastStore()

  // Estado reativo
  const jobs = ref<Job[]>([])
  const isPolling = ref(false)
  const pollingInterval = ref<number | null>(null)

  // Configurações de Job Types
  const jobTypeConfig = {
    StartPauta: {
      name: 'Iniciar Pauta',
      icon: 'pi pi-play',
      color: '#10b981',
      averageDuration: 5,
      description: 'Inicialização de nova pauta'
    },
    SendEmail: {
      name: 'Enviar Email',
      icon: 'pi pi-envelope',
      color: '#3b82f6',
      averageDuration: 2,
      description: 'Envio de notificação por email'
    },
    Ingest: {
      name: 'Ingestão',
      icon: 'pi pi-cloud-upload',
      color: '#8b5cf6',
      averageDuration: 30,
      description: 'Upload e processamento inicial'
    },
    PreviewGen: {
      name: 'Gerar Preview',
      icon: 'pi pi-eye',
      color: '#06b6d4',
      averageDuration: 15,
      description: 'Geração de previews de mídia'
    },
    AI_Tagging: {
      name: 'IA Tagging',
      icon: 'pi pi-tags',
      color: '#f59e0b',
      averageDuration: 25,
      description: 'Análise e marcação automática por IA'
    },
    ClipRender: {
      name: 'Render Clip',
      icon: 'pi pi-video',
      color: '#ef4444',
      averageDuration: 45,
      description: 'Renderização de clipe de vídeo'
    },
    Translate: {
      name: 'Tradução',
      icon: 'pi pi-globe',
      color: '#84cc16',
      averageDuration: 20,
      description: 'Tradução automática de conteúdo'
    },
    PolishFluency: {
      name: 'Ajuste Fluência',
      icon: 'pi pi-pencil',
      color: '#6366f1',
      averageDuration: 10,
      description: 'Refinamento de texto e fluência'
    },
    TTS_Render: {
      name: 'Render TTS',
      icon: 'pi pi-volume-up',
      color: '#ec4899',
      averageDuration: 12,
      description: 'Geração de áudio texto-para-fala'
    },
    Assemble: {
      name: 'Montagem',
      icon: 'pi pi-th-large',
      color: '#f97316',
      averageDuration: 60,
      description: 'Montagem final de elementos'
    },
    Transcode: {
      name: 'Transcodificação',
      icon: 'pi pi-cog',
      color: '#64748b',
      averageDuration: 90,
      description: 'Conversão de formato de mídia'
    },
    Finalize: {
      name: 'Finalização',
      icon: 'pi pi-check-circle',
      color: '#059669',
      averageDuration: 35,
      description: 'Processamento final e entrega'
    }
  } as const

  // Computadas
  const jobsByType = computed(() => {
    const grouped: Record<JobType, Job[]> = {} as any
    
    // Inicializar todos os tipos
    Object.keys(jobTypeConfig).forEach(type => {
      grouped[type as JobType] = []
    })
    
    // Agrupar jobs por tipo
    jobs.value.forEach(job => {
      if (grouped[job.type]) {
        grouped[job.type].push(job)
      }
    })
    
    return grouped
  })

  const activeJobs = computed(() => {
    return jobs.value.filter(job => 
      job.status === 'running' || job.status === 'queued' || job.status === 'retrying'
    )
  })

  const completedJobs = computed(() => {
    return jobs.value.filter(job => job.status === 'completed')
  })

  const failedJobs = computed(() => {
    return jobs.value.filter(job => job.status === 'failed')
  })

  const queueStats = computed((): JobQueueStats => {
    const now = new Date()
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    const recentJobs = jobs.value.filter(job => job.createdAt >= last24h)
    const completedRecent = recentJobs.filter(job => job.status === 'completed')
    
    const totalWaitTime = jobs.value.reduce((acc, job) => {
      if (job.startedAt && job.createdAt) {
        return acc + (job.startedAt.getTime() - job.createdAt.getTime()) / 1000
      }
      return acc
    }, 0)
    
    const totalProcessTime = completedJobs.value.reduce((acc, job) => {
      return acc + (job.duration || 0)
    }, 0)
    
    return {
      totalJobs: jobs.value.length,
      activeJobs: activeJobs.value.length,
      completedJobs: completedJobs.value.length,
      failedJobs: failedJobs.value.length,
      averageWaitTime: jobs.value.length > 0 ? totalWaitTime / jobs.value.length : 0,
      averageProcessTime: completedJobs.value.length > 0 ? totalProcessTime / completedJobs.value.length : 0,
      throughputPerHour: completedRecent.length
    }
  })

  const jobMetrics = computed((): JobMetrics[] => {
    return Object.keys(jobTypeConfig).map(type => {
      const typeJobs = jobsByType.value[type as JobType] || []
      const completed = typeJobs.filter(job => job.status === 'completed')
      const failed = typeJobs.filter(job => job.status === 'failed')
      
      const totalDuration = completed.reduce((acc, job) => acc + (job.duration || 0), 0)
      const averageDuration = completed.length > 0 ? totalDuration / completed.length : 0
      
      const successRate = typeJobs.length > 0 ? (completed.length / typeJobs.length) * 100 : 0
      
      const lastCompleted = completed
        .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))[0]?.completedAt
      
      const lastFailed = failed
        .sort((a, b) => (b.failedAt?.getTime() || 0) - (a.failedAt?.getTime() || 0))[0]?.failedAt
      
      return {
        type: type as JobType,
        total: typeJobs.length,
        pending: typeJobs.filter(job => job.status === 'pending').length,
        queued: typeJobs.filter(job => job.status === 'queued').length,
        running: typeJobs.filter(job => job.status === 'running').length,
        completed: completed.length,
        failed: failed.length,
        cancelled: typeJobs.filter(job => job.status === 'cancelled').length,
        retrying: typeJobs.filter(job => job.status === 'retrying').length,
        averageDuration,
        successRate,
        lastCompleted,
        lastFailed
      }
    })
  })

  // Ações
  function createJob(type: JobType, data: any, priority: JobPriority = 'normal'): Job {
    const job: Job = {
      id: `job-${type.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      status: 'pending',
      priority,
      data,
      createdAt: new Date(),
      logs: [],
      retryCount: 0,
      maxRetries: 3,
      metadata: {
        version: '1.0',
        userId: 'user-demo',
        resourceType: type
      }
    }
    
    jobs.value.push(job)
    addJobLog(job.id, 'info', `Job ${type} criado`)
    
    // Simular início automático após um delay pequeno
    setTimeout(() => {
      if (getJobById(job.id)?.status === 'pending') {
        startJob(job.id)
      }
    }, Math.random() * 2000 + 500)
    
    return job
  }

  function getJobById(jobId: string): Job | undefined {
    return jobs.value.find(job => job.id === jobId)
  }

  function updateJobStatus(jobId: string, status: JobStatus, error?: string) {
    const jobIndex = jobs.value.findIndex(job => job.id === jobId)
    if (jobIndex === -1) return
    
    const job = jobs.value[jobIndex]
    const now = new Date()
    
    // Atualizar timestamps baseado no status
    switch (status) {
      case 'queued':
        job.startedAt = now
        break
      case 'running':
        if (!job.startedAt) job.startedAt = now
        break
      case 'completed':
        job.completedAt = now
        if (job.startedAt) {
          job.duration = (now.getTime() - job.startedAt.getTime()) / 1000
        }
        job.progress = 100
        break
      case 'failed':
        job.failedAt = now
        job.error = error || 'Falha desconhecida'
        break
    }
    
    jobs.value[jobIndex] = { ...job, status }
    addJobLog(jobId, status === 'failed' ? 'error' : 'info', 
      `Status alterado para: ${status}${error ? ` - ${error}` : ''}`)
  }

  function addJobLog(jobId: string, level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any) {
    const job = getJobById(jobId)
    if (!job) return
    
    const log: JobLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      jobId,
      level,
      message,
      timestamp: new Date(),
      data
    }
    
    job.logs.push(log)
  }

  async function startJob(jobId: string) {
    const job = getJobById(jobId)
    if (!job || job.status !== 'pending') return
    
    updateJobStatus(jobId, 'queued')
    addJobLog(jobId, 'info', 'Job adicionado à fila')
    
    // Simular processamento
    await simulateJobExecution(jobId)
  }

  async function simulateJobExecution(jobId: string) {
    const job = getJobById(jobId)
    if (!job) return
    
    try {
      // Mover para running
      updateJobStatus(jobId, 'running')
      addJobLog(jobId, 'info', 'Iniciando processamento')
      
      // Simular progresso
      const config = jobTypeConfig[job.type]
      const estimatedDuration = config.averageDuration + (Math.random() - 0.5) * 10
      const steps = 10
      
      for (let i = 1; i <= steps; i++) {
        await new Promise(resolve => {
          setTimeout(resolve, (estimatedDuration * 1000) / steps)
        })
        
        const progress = (i / steps) * 100
        job.progress = Math.round(progress)
        addJobLog(jobId, 'debug', `Progresso: ${job.progress}%`)
        
        // Simular falha ocasional (5% de chance)
        if (Math.random() < 0.05 && i > 3) {
          throw new Error(`Erro simulado durante processamento (${job.progress}%)`)
        }
      }
      
      // Completar com sucesso
      updateJobStatus(jobId, 'completed')
      addJobLog(jobId, 'info', 'Job concluído com sucesso')
      
      toastStore.success('Job Concluído', `${config.name} finalizado com sucesso`)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      updateJobStatus(jobId, 'failed', errorMessage)
      addJobLog(jobId, 'error', `Falha: ${errorMessage}`)
      
      // Tentar retry se ainda há tentativas
      if (job.retryCount < job.maxRetries) {
        setTimeout(() => {
          retryJob(jobId)
        }, 5000) // Retry após 5 segundos
      }
    }
  }

  async function retryJob(jobId: string) {
    const job = getJobById(jobId)
    if (!job || job.status !== 'failed') return
    
    job.retryCount++
    updateJobStatus(jobId, 'retrying')
    addJobLog(jobId, 'info', `Tentativa ${job.retryCount}/${job.maxRetries}`)
    
    // Aguardar um pouco antes de tentar novamente
    setTimeout(() => {
      updateJobStatus(jobId, 'pending')
      startJob(jobId)
    }, 2000)
    
    toastStore.info('Job Retry', `Tentativa ${job.retryCount} de ${job.maxRetries}`)
  }

  function reprocessJob(jobId: string) {
    const job = getJobById(jobId)
    if (!job) return
    
    // Reset do job
    job.retryCount = 0
    job.progress = 0
    job.startedAt = undefined
    job.completedAt = undefined
    job.failedAt = undefined
    job.duration = undefined
    job.error = undefined
    
    updateJobStatus(jobId, 'pending')
    addJobLog(jobId, 'info', 'Job reprocessado manualmente')
    
    // Iniciar novamente
    startJob(jobId)
    
    toastStore.info('Reprocessamento', 'Job adicionado novamente à fila')
  }

  function cancelJob(jobId: string) {
    const job = getJobById(jobId)
    if (!job || job.status === 'completed' || job.status === 'cancelled') return
    
    updateJobStatus(jobId, 'cancelled')
    addJobLog(jobId, 'warn', 'Job cancelado pelo usuário')
    
    toastStore.warning('Job Cancelado', 'Job removido da fila')
  }

  function startPolling(intervalMs: number = 5000) {
    if (isPolling.value) return
    
    isPolling.value = true
    pollingInterval.value = setInterval(() => {
      // Simular criação de novos jobs ocasionalmente
      if (Math.random() < 0.1) { // 10% de chance a cada poll
        const types = Object.keys(jobTypeConfig) as JobType[]
        const randomType = types[Math.floor(Math.random() * types.length)]
        const priorities: JobPriority[] = ['low', 'normal', 'high']
        const randomPriority = priorities[Math.floor(Math.random() * priorities.length)]
        
        createJob(randomType, { 
          auto: true, 
          timestamp: new Date().toISOString() 
        }, randomPriority)
      }
    }, intervalMs)
  }

  function stopPolling() {
    if (!isPolling.value || !pollingInterval.value) return
    
    clearInterval(pollingInterval.value)
    pollingInterval.value = null
    isPolling.value = false
  }

  function clearCompletedJobs() {
    const completedCount = completedJobs.value.length
    jobs.value = jobs.value.filter(job => job.status !== 'completed')
    
    toastStore.success('Limpeza', `${completedCount} jobs concluídos removidos`)
  }

  function createMockJobs() {
    const mockTypes: JobType[] = ['StartPauta', 'Ingest', 'AI_Tagging', 'ClipRender', 'TTS_Render', 'Assemble', 'Transcode', 'Finalize']
    const priorities: JobPriority[] = ['low', 'normal', 'high', 'urgent']
    
    // Criar alguns jobs com diferentes status para demonstração
    mockTypes.forEach((type, index) => {
      const priority = priorities[index % priorities.length]
      const job = createJob(type, { 
        mock: true, 
        demoIndex: index,
        description: `Job de demonstração para ${type}`
      }, priority)
      
      // Simular alguns jobs já concluídos
      if (index % 3 === 0) {
        setTimeout(() => {
          updateJobStatus(job.id, 'completed')
        }, 1000)
      }
      
      // Simular alguns jobs com falha
      if (index % 5 === 0) {
        setTimeout(() => {
          updateJobStatus(job.id, 'failed', 'Erro simulado para demonstração')
        }, 2000)
      }
    })
  }

  return {
    // Estado
    jobs,
    isPolling,
    jobTypeConfig,
    
    // Computadas
    jobsByType,
    activeJobs,
    completedJobs,
    failedJobs,
    queueStats,
    jobMetrics,
    
    // Ações
    createJob,
    getJobById,
    updateJobStatus,
    addJobLog,
    startJob,
    retryJob,
    reprocessJob,
    cancelJob,
    startPolling,
    stopPolling,
    clearCompletedJobs,
    createMockJobs
  }
})