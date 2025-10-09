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
      throughputPerHour: completedJobs.value.length
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
    
    return job
  }

  function getJobById(jobId: string): Job | undefined {
    return jobs.value.find(job => job.id === jobId)
  }

  function updateJobStatus(jobId: string, status: JobStatus, error?: string) {
    const jobIndex = jobs.value.findIndex(job => job.id === jobId)
    if (jobIndex === -1) return
    
    const currentJob = jobs.value[jobIndex]
    const now = new Date()
    
    const updatedJob: Job = {
      ...currentJob,
      status
    }
    
    // Atualizar timestamps baseado no status
    switch (status) {
      case 'queued':
        updatedJob.startedAt = now
        break
      case 'running':
        if (!updatedJob.startedAt) updatedJob.startedAt = now
        break
      case 'completed':
        updatedJob.completedAt = now
        if (updatedJob.startedAt) {
          updatedJob.duration = (now.getTime() - updatedJob.startedAt.getTime()) / 1000
        }
        updatedJob.progress = 100
        break
      case 'failed':
        updatedJob.failedAt = now
        updatedJob.error = error || 'Falha desconhecida'
        break
    }
    
    jobs.value[jobIndex] = updatedJob
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

  function reprocessJob(jobId: string) {
    const jobIndex = jobs.value.findIndex(job => job.id === jobId)
    if (jobIndex === -1) return
    
    const currentJob = jobs.value[jobIndex]
    
    // Reset do job
    const resetJob: Job = {
      ...currentJob,
      status: 'pending',
      retryCount: 0,
      progress: 0,
      startedAt: undefined,
      completedAt: undefined,
      failedAt: undefined,
      duration: undefined,
      error: undefined
    }
    
    jobs.value[jobIndex] = resetJob
    addJobLog(jobId, 'info', 'Job reprocessado manualmente')
    
    toastStore.info('Reprocessamento', 'Job adicionado novamente à fila')
  }

  function cancelJob(jobId: string) {
    const job = getJobById(jobId)
    if (!job || job.status === 'completed' || job.status === 'cancelled') return
    
    updateJobStatus(jobId, 'cancelled')
    addJobLog(jobId, 'warn', 'Job cancelado pelo usuário')
    
    toastStore.warning('Job Cancelado', 'Job removido da fila')
  }

  function startPolling() {
    isPolling.value = true
    toastStore.info('Polling', 'Monitoramento automático iniciado')
  }

  function stopPolling() {
    isPolling.value = false
    toastStore.info('Polling', 'Monitoramento automático pausado')
  }

  function clearCompletedJobs() {
    const completedCount = completedJobs.value.length
    jobs.value = jobs.value.filter(job => job.status !== 'completed')
    
    toastStore.success('Limpeza', `${completedCount} jobs concluídos removidos`)
  }

  function createMockJobs() {
    const mockTypes: JobType[] = ['StartPauta', 'SendEmail', 'Ingest', 'PreviewGen', 'AI_Tagging', 'ClipRender', 'Translate', 'PolishFluency', 'TTS_Render', 'Assemble', 'Transcode', 'Finalize']
    const priorities: JobPriority[] = ['low', 'normal', 'high', 'urgent']
    const statuses: JobStatus[] = ['pending', 'queued', 'running', 'completed', 'failed', 'retrying']
    
    // Criar jobs de demonstração
    mockTypes.forEach((type, index) => {
      const priority = priorities[index % priorities.length]
      const status = statuses[index % statuses.length]
      
      const job = createJob(type, { 
        mock: true, 
        demoIndex: index,
        description: `Job de demonstração para ${type}`
      }, priority)
      
      // Simular diferentes estados
      updateJobStatus(job.id, status)
      
      // Adicionar logs de exemplo
      addJobLog(job.id, 'info', `Job ${type} inicializado`)
      addJobLog(job.id, 'debug', `Parâmetros: ${JSON.stringify(job.data)}`)
      
      if (status === 'completed') {
        job.duration = jobTypeConfig[type].averageDuration + Math.random() * 10
        job.progress = 100
        addJobLog(job.id, 'info', 'Processamento concluído com sucesso')
      } else if (status === 'failed') {
        job.error = 'Erro simulado para demonstração'
        addJobLog(job.id, 'error', 'Falha durante o processamento')
      } else if (status === 'running') {
        job.progress = Math.floor(Math.random() * 80) + 10 // 10-90%
        addJobLog(job.id, 'info', `Progresso atual: ${job.progress}%`)
      }
    })
    
    toastStore.success('Mock Jobs', `${mockTypes.length} jobs de exemplo criados`)
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
    reprocessJob,
    cancelJob,
    startPolling,
    stopPolling,
    clearCompletedJobs,
    createMockJobs
  }
})