export const APP_NAME = 'SisTop'

export const THEMES = {
  LIGHT: 'light'
} as const

export const LANGUAGES = {
  PT_BR: 'pt-BR',
  EN_US: 'en-US'
} as const

export const USER_ROLES = {
  ADMIN: 'admin',
  PRODUTOR: 'produtor',
  ROTEIRISTA: 'roteirista',
  PESQUISADOR: 'pesquisador',
  EDITOR: 'editor',
  VIEWER: 'viewer',
  MANAGER: 'manager'
} as const

export const PERMISSIONS = {
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_ADMIN: 'view_admin',
  VIEW_ASSETS: 'view_assets',
  VIEW_CLIPPING: 'view_clipping',
  VIEW_STORYBOARD: 'view_storyboard',
  VIEW_TTS: 'view_tts',
  VIEW_JOBS: 'view_jobs',
  VIEW_PAUTA: 'view_pauta',
  VIEW_ROTEIRO: 'view_roteiro',
  VIEW_REPORTS: 'view_reports',
  UPLOAD_ASSETS: 'upload_assets',
  CURADORIA_ASSETS: 'curadoria_assets',
  CREATE_PAUTA: 'create_pauta',
  EDIT_PAUTA: 'edit_pauta',
  CREATE_STORYBOARD: 'create_storyboard',
  EDIT_STORYBOARD: 'edit_storyboard',
  CREATE_ROTEIRO: 'create_roteiro',
  EDIT_ROTEIRO: 'edit_roteiro',
  MANAGE_USERS: 'manage_users',
  MANAGE_PROJECTS: 'manage_projects',
  MANAGE_CONTENT: 'manage_content',
  VIEW_CONTENT: 'view_content',
  EDIT_CONTENT: 'edit_content',
  MANAGE_SYSTEM: 'manage_system'
} as const

// Mapeamento de roles para permissões
export const ROLE_PERMISSIONS = {
  admin: [
    'view_dashboard',
    'view_admin',
    'view_assets',
    'view_clipping',
    'view_storyboard',
    'view_tts',
    'view_jobs',
    'view_pauta',
    'view_roteiro',
    'view_reports',
    'upload_assets',
    'curadoria_assets',
    'create_pauta',
    'edit_pauta',
    'create_storyboard',
    'edit_storyboard',
    'create_roteiro',
    'edit_roteiro',
    'manage_users',
    'manage_projects',
    'manage_content',
    'view_content',
    'edit_content',
    'manage_system'
  ],
  manager: [
    'view_dashboard',
    'view_assets',
    'view_clipping',
    'view_storyboard',
    'view_tts',
    'view_jobs',
    'view_pauta',
    'view_roteiro',
    'view_reports',
    'upload_assets',
    'curadoria_assets',
    'create_pauta',
    'edit_pauta',
    'create_storyboard',
    'edit_storyboard',
    'create_roteiro',
    'edit_roteiro',
    'manage_content',
    'view_content',
    'edit_content'
  ],
  editor: [
    'view_dashboard',
    'view_assets',
    'view_clipping',
    'view_storyboard',
    'view_tts',
    'view_pauta',
    'view_roteiro',
    'upload_assets',
    'create_storyboard',
    'edit_storyboard',
    'create_roteiro',
    'edit_roteiro',
    'view_content',
    'edit_content'
  ],
  viewer: [
    'view_dashboard',
    'view_assets',
    'view_clipping',
    'view_storyboard',
    'view_pauta',
    'view_roteiro',
    'view_content'
  ],
  produtor: [
    'view_dashboard',
    'view_admin',
    'view_pauta',
    'create_pauta',
    'edit_pauta',
    'view_jobs'
  ],
  roteirista: [
    'view_dashboard',
    'view_storyboard',
    'create_storyboard',
    'edit_storyboard',
    'view_pauta'
  ],
  pesquisador: [
    'view_dashboard',
    'view_assets',
    'upload_assets',
    'curadoria_assets',
    'view_clipping'
  ]
} as const

export const LOCAL_STORAGE_KEYS = {
  THEME: 'sistop-theme',
  LANGUAGE: 'sistop-language',
  SIDEBAR_COLLAPSED: 'sistop-sidebar-collapsed',
  TOKEN: 'sistop-token'
} as const

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  ADMIN: '/admin',
  ASSETS: '/assets',
  CLIPPING: '/clipping',
  STORYBOARD: '/storyboard',
  TTS: '/tts',
  JOBS: '/jobs',
  PAUTA: '/pauta'
} as const

export const PAUTA_STATUS = {
  RASCUNHO: 'rascunho',
  EM_PLANEJAMENTO: 'em_planejamento',
  EM_PRODUCAO: 'em_producao',
  EM_REVISAO: 'em_revisao',
  FINALIZADA: 'finalizada',
  CANCELADA: 'cancelada'
} as const

export const PAUTA_STATUS_LABELS = {
  rascunho: { label: 'Rascunho', color: 'bg-gray-500' },
  em_planejamento: { label: 'Em Planejamento', color: 'bg-blue-500' },
  em_producao: { label: 'Em Produção', color: 'bg-yellow-500' },
  em_revisao: { label: 'Em Revisão', color: 'bg-purple-500' },
  finalizada: { label: 'Finalizada', color: 'bg-green-500' },
  cancelada: { label: 'Cancelada', color: 'bg-red-500' }
} as const

export const IDIOMAS = {
  'pt-BR': 'Português (Brasil)',
  'en-US': 'English (US)',
  'es-ES': 'Español',
  'fr-FR': 'Français'
} as const

export const GENEROS_VOZ = {
  masculino: 'Masculino',
  feminino: 'Feminino',
  neutro: 'Neutro'
} as const