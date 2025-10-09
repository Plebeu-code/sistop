export interface User {
  id: string
  name: string
  email: string
  roles: UserRole[]
  permissions: Permission[]
  avatar?: string
}

export type UserRole = 'admin' | 'produtor' | 'roteirista' | 'pesquisador' | 'editor' | 'viewer' | 'manager'

export type Permission = 
  | 'view_dashboard'
  | 'view_admin'
  | 'view_assets'
  | 'view_clipping'
  | 'view_storyboard'
  | 'view_tts'
  | 'view_jobs'
  | 'view_pauta'
  | 'view_roteiro'
  | 'view_reports'
  | 'upload_assets'
  | 'curadoria_assets'
  | 'create_pauta'
  | 'edit_pauta'
  | 'create_storyboard'
  | 'edit_storyboard'
  | 'create_roteiro'
  | 'edit_roteiro'
  | 'manage_users'
  | 'manage_projects'
  | 'manage_content'
  | 'view_content'
  | 'edit_content'
  | 'manage_system'

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  token: string | null
}

export interface AppSettings {
  theme: 'light'
  language: 'pt-BR' | 'en-US'
  sidebarCollapsed: boolean
}

export interface MenuItem {
  id: string
  label: string
  icon?: string
  route?: string
  children?: MenuItem[]
  roles?: UserRole[]
  permission?: Permission
  visible?: boolean
}

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}

export interface Pauta {
  id: string
  titulo: string
  objetivo: string
  notas?: string
  refsYoutube: string[]
  thumb?: string
  canal: Canal
  idiomas: Idioma[]
  vozes: Voz[]
  roteirista?: User
  status: PautaStatus
  createdAt: Date
  updatedAt: Date
  createdBy: string
  deepLink?: string
}

export type PautaStatus = 'rascunho' | 'em_planejamento' | 'em_producao' | 'em_revisao' | 'finalizada' | 'cancelada'

export interface Canal {
  id: string
  nome: string
  descricao?: string
  cor: string
}

export type Idioma = 'pt-BR' | 'en-US' | 'es-ES' | 'fr-FR'

export interface Voz {
  id: string
  nome: string
  genero: 'masculino' | 'feminino' | 'neutro'
  idioma: Idioma
  amostra?: string
}

export interface EventLog {
  id: string
  tipo: EventLogType
  entidade: string
  entidadeId: string
  descricao: string
  dados?: Record<string, any>
  usuario: string
  timestamp: Date
}

export type EventLogType = 'criacao' | 'edicao' | 'status_change' | 'iniciar_producao' | 'finalizar' | 'cancelar'

export interface Notification {
  id: string
  tipo: 'pauta_iniciada' | 'pauta_finalizada' | 'pauta_cancelada' | 'atribuicao'
  titulo: string
  mensagem: string
  destinatario: string
  lida: boolean
  createdAt: Date
}

// Tipos para Assets e Upload & Curadoria
export type AssetStatus = 'uploading' | 'staging' | 'processing' | 'approved' | 'rejected' | 'archived'
export type AssetType = 'video' | 'audio' | 'image' | 'document'
export type LicenseType = 'royalty_free' | 'creative_commons' | 'licensed' | 'custom'
export type RightsType = 'full' | 'limited' | 'restricted'

export interface Asset {
  id: string
  filename: string
  originalName: string
  type: AssetType
  status: AssetStatus
  size: number // bytes
  duration?: number // segundos para vídeo/áudio
  dimensions?: {
    width: number
    height: number
  }
  previewPath?: string
  processedPath?: string
  thumbnailPath?: string
  uploadedBy: User
  createdAt: Date
  updatedAt: Date
  
  // Metadados de Curadoria
  title?: string
  description?: string
  tags: string[]
  category?: string
  fornecedor?: string
  
  // Direitos e Licenças
  licenseType?: LicenseType
  rightsType?: RightsType
  licenseDetails?: string
  copyrightHolder?: string
  expirationDate?: Date
  
  // Video Intelligence (simulado)
  videoIntelligence?: {
    labels: string[]
    faces: number
    text: string[]
    scenes: number
    adult: boolean
    violence: boolean
  }
  
  // Aprovação
  approvedBy?: User
  approvedAt?: Date
  rejectedBy?: User
  rejectedAt?: Date
  rejectionReason?: string
}

export interface UploadProgress {
  id: string
  filename: string
  size: number
  uploaded: number
  progress: number // 0-100
  speed: number // bytes/s
  timeRemaining: number // segundos
  status: 'uploading' | 'processing' | 'completed' | 'error' | 'paused'
  error?: string
}

export interface AssetFilter {
  search?: string
  type?: AssetType[]
  status?: AssetStatus[]
  tags?: string[]
  fornecedor?: string
  dateFrom?: Date
  dateTo?: Date
  durationMin?: number
  durationMax?: number
  licenseType?: LicenseType[]
}

export interface CuratoriaAction {
  id: string
  assetId: string
  action: 'approve' | 'reject' | 'edit_metadata' | 'add_tags' | 'change_license' | 'upload' | 'delete'
  performedBy: User
  timestamp: Date
  details: Record<string, any>
  notes?: string
}

// === CLIPPING TYPES ===

export interface Clip {
  id: string
  assetId: string
  title: string
  description?: string
  inPoint: number // in seconds
  outPoint: number // in seconds
  duration: number // calculated: outPoint - inPoint
  tags: string[]
  thumbnailUrl?: string
  createdBy: User
  createdAt: Date
  updatedAt: Date
  metadata?: {
    fps?: number
    resolution?: string
    bitrate?: number
    format?: string
  }
}

export interface ClipValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface PlayerState {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  playbackRate: number
  isLoading: boolean
  hasError: boolean
  errorMessage?: string
}

export interface PlayerControls {
  play: () => void
  pause: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  setPlaybackRate: (rate: number) => void
  toggleMute: () => void
  setInPoint: (time: number) => void
  setOutPoint: (time: number) => void
  previewClip: () => void
  snapToFrame: (direction: 'prev' | 'next') => void
}

export interface ClipFilter {
  search?: string
  assetId?: string
  tags?: string[]
  durationMin?: number
  durationMax?: number
  dateFrom?: Date
  dateTo?: Date
  createdBy?: string
}

export interface ClipFormData {
  title: string
  description?: string
  inPoint: number
  outPoint: number
  tags: string[]
}

export type ClipEvent = 
  | { type: 'created'; clip: Clip }
  | { type: 'updated'; clip: Clip }
  | { type: 'deleted'; clipId: string }
  | { type: 'played'; clip: Clip }
  | { type: 'exported'; clip: Clip; format: string }

// Tipos para Sistema de Roteiro
export interface Roteiro {
  id: string
  title: string
  description?: string
  pautaId: string
  totalDuration: number
  status: RoteiroStatus
  items: RoteiroItem[]
  allowDuplicates: boolean // flag de política de duplicidade
  createdBy: User
  createdAt: Date
  updatedAt: Date
  metadata?: {
    version?: string
    notes?: string
    approvedBy?: string
    approvedAt?: Date
  }
}

export type RoteiroStatus = 'draft' | 'in_progress' | 'review' | 'approved' | 'published'

export interface RoteiroItem {
  id: string
  roteiroId: string
  clipId: string
  clip: Clip // dados do clip incluídos
  order: number
  startTime: number // posição na timeline
  endTime: number
  comments: RoteiroComentario[]
  translations: RoteiroComentarioI18n[]
  createdAt: Date
  updatedAt: Date
}

export interface RoteiroComentario {
  id: string
  roteiroItemId: string
  text: string
  timestamp?: number // tempo específico no clip para o comentário
  type: ComentarioType
  createdBy: User
  createdAt: Date
  updatedAt: Date
}

export type ComentarioType = 'direction' | 'note' | 'script' | 'technical' | 'feedback'

export interface RoteiroComentarioI18n {
  id: string
  comentarioId: string
  language: string
  text: string
  audioUrl?: string // URL do áudio gerado
  status: TranslationStatus
  createdAt: Date
  updatedAt: Date
  metadata?: {
    translatedBy?: string
    voice?: string
    duration?: number
    generatedAt?: Date
  }
}

export type TranslationStatus = 'pending' | 'generated' | 'error' | 'approved'

export interface RoteiroFilter {
  search?: string
  status?: RoteiroStatus
  pautaId?: string
  createdBy?: string
  dateFrom?: Date
  dateTo?: Date
  tags?: string[]
}

export interface TimelineTrack {
  id: string
  type: 'video' | 'audio' | 'voice'
  items: TimelineItem[]
  locked: boolean
  visible: boolean
  volume?: number
}

export interface TimelineItem {
  id: string
  trackId: string
  roteiroItemId?: string
  startTime: number
  duration: number
  color?: string
  label?: string
  type: 'clip' | 'voice' | 'transition'
}

export interface SearchFilter {
  query?: string
  tags?: string[]
  category?: string
  duration?: {
    min?: number
    max?: number
  }
  supplier?: string
  type?: AssetType
  classification?: string
}

// EDL (Edit Decision List) Types
export interface EDLItem {
  clipId: string
  inMs: number
  outMs: number
  ordem: number
  voiceStem?: string
}

export interface EDLMix {
  targetLufs: number
}

export interface EDL {
  roteiroId: string
  idiomaId: string
  itens: EDLItem[]
  mix: EDLMix
  metadata?: {
    version: string
    createdAt: Date
    totalDurationMs: number
    validationResult?: EDLValidationResult
  }
}

export interface EDLValidationResult {
  isValid: boolean
  totalDurationMs: number
  gaps: Array<{
    startMs: number
    endMs: number
    durationMs: number
  }>
  overlaps: Array<{
    startMs: number
    endMs: number
    items: string[]
  }>
  inconsistentOrder: boolean
  warnings: string[]
  errors: string[]
}

// TTS Types
export interface TTSState {
  comentarioId: string
  language: string
  status: TTSStatus
  audioUrl?: string
  duration?: number // em segundos
  voice?: string
  generatedAt?: Date
  error?: string
  progress?: number // 0-100 para progresso de geração
}

export type TTSStatus = 'idle' | 'pending' | 'generating' | 'generated' | 'error' | 'playing'

export interface TTSLanguage {
  code: string
  name: string
  flag: string // emoji ou ícone
  voices: TTSVoice[]
}

export interface TTSVoice {
  id: string
  name: string
  gender: 'male' | 'female'
  type: 'neural' | 'standard'
}

export interface TTSConfig {
  defaultVoice: string
  speed: number // 0.5 - 2.0
  pitch: number // -50 to +50
  volume: number // 0 - 100
}

// Job Types
export interface Job {
  id: string
  type: JobType
  status: JobStatus
  priority: JobPriority
  data: JobData
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  failedAt?: Date
  duration?: number // em segundos
  progress?: number // 0-100
  error?: string
  logs: JobLog[]
  retryCount: number
  maxRetries: number
  metadata?: {
    userId?: string
    resourceId?: string
    resourceType?: string
    version?: string
  }
}

export type JobType = 
  | 'StartPauta'
  | 'SendEmail'
  | 'Ingest'
  | 'PreviewGen'
  | 'AI_Tagging'
  | 'ClipRender'
  | 'Translate'
  | 'PolishFluency'
  | 'TTS_Render'
  | 'Assemble'
  | 'Transcode'
  | 'Finalize'

export type JobStatus = 
  | 'pending'
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'retrying'

export type JobPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface JobData {
  [key: string]: any
}

export interface JobLog {
  id: string
  jobId: string
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  timestamp: Date
  data?: any
}

export interface JobMetrics {
  type: JobType
  total: number
  pending: number
  queued: number
  running: number
  completed: number
  failed: number
  cancelled: number
  retrying: number
  averageDuration: number // em segundos
  successRate: number // 0-100
  lastCompleted?: Date
  lastFailed?: Date
}

export interface JobQueueStats {
  totalJobs: number
  activeJobs: number
  completedJobs: number
  failedJobs: number
  averageWaitTime: number
  averageProcessTime: number
  throughputPerHour: number
}

// ======================
// TAREFA 10 - Rastreabilidade & Relatórios
// ======================

export interface ClipUsage {
  id: string
  clipId: string
  assetId: string
  pautaId: string
  roteiroId: string
  canalId: string
  idioma: string
  posicao: number
  startTime: number
  endTime: number
  duracao: number
  contexto: {
    tituloCanal: string
    tituloPauta: string
    tituloRoteiro: string
    nomeAsset: string
    nomeClip: string
  }
  metadados: {
    versao?: string
    tags?: string[]
    observacoes?: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface RelatorioCriteria {
  projeto?: string
  canalId?: string
  pautaId?: string
  idioma?: string
  dataInicio?: Date
  dataFim?: Date
  incluirMetadados?: boolean
}

export interface RelatorioData {
  totalClips: number
  totalDuracao: number
  contagemPorIdioma: Record<string, number>
  contagemPorCanal: Record<string, number>
  assetsUsados: Array<{
    assetId: string
    nomeAsset: string
    vezesUsado: number
    duracaoTotal: number
  }>
  clipsUsados: Array<{
    clipId: string
    nomeClip: string
    vezesUsado: number
    duracaoTotal: number
  }>
  usos: ClipUsage[]
}

export type ExportFormat = 'csv' | 'json'

// ======================
// TAREFA 11 - Admin
// ======================

export interface Projeto {
  id: string
  nome: string
  descricao?: string
  status: 'ativo' | 'inativo' | 'arquivado'
  canais: Canal[]
  configuracoes: {
    idiomasPadrao: string[]
    qualidadeVideo: string
    formatoExportacao: string[]
  }
  createdAt: Date
  updatedAt: Date
}

export interface VoiceProfile {
  id: string
  nome: string
  idioma: string
  genero: 'masculino' | 'feminino' | 'neutro'
  idade: 'crianca' | 'jovem' | 'adulto' | 'idoso'
  estilo: 'formal' | 'casual' | 'dramatico' | 'narrativo'
  provedor: 'azure' | 'google' | 'amazon' | 'openai'
  configuracoes: {
    velocidade: number
    tom: number
    volume: number
    pausas: number
  }
  preview?: string
  ativo: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AdminUser extends User {
  ultimoAcesso?: Date
  tentativasLogin: number
  contaAtiva: boolean
  configuracoes: {
    notificacoes: boolean
    tema: 'light'
    idioma: string
  }
}