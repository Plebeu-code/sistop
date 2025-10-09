/**
 * Demonstração da TAREFA 08 — Idiomas & TTS (UI de estados)
 * 
 * Este arquivo mostra como usar a funcionalidade TTS implementada
 */

import type { TTSState, TTSLanguage, RoteiroComentario } from '@/shared/types'

// Exemplo de comentários do roteiro
export const exemploComentarios: RoteiroComentario[] = [
  {
    id: 'comment-direction-1',
    roteiroItemId: 'item-intro',
    text: 'Fale com tom entusiasmado e pausas dramáticas para criar impacto. Lembre-se de olhar diretamente para a câmera.',
    timestamp: 0,
    type: 'direction',
    createdBy: {
      id: 'director-001',
      name: 'Ana Silva',
      email: 'ana@sistop.com',
      roles: ['diretor'],
      permissions: [],
      avatar: undefined
    },
    createdAt: new Date('2025-01-07T09:00:00Z'),
    updatedAt: new Date('2025-01-07T09:30:00Z')
  },
  {
    id: 'comment-note-1',
    roteiroItemId: 'item-dados',
    text: 'IMPORTANTE: Verificar os dados mais recentes do IBGE antes da gravação. Os números podem ter mudado desde a última atualização.',
    timestamp: 45000,
    type: 'note',
    createdBy: {
      id: 'researcher-001',
      name: 'Carlos Oliveira',
      email: 'carlos@sistop.com',
      roles: ['pesquisador'],
      permissions: [],
      avatar: undefined
    },
    createdAt: new Date('2025-01-07T10:15:00Z'),
    updatedAt: new Date('2025-01-07T10:15:00Z')
  },
  {
    id: 'comment-script-1',
    roteiroItemId: 'item-abertura',
    text: 'Versão alternativa para o público internacional: "Welcome to our special technology program, where innovation meets reality."',
    timestamp: 15000,
    type: 'script',
    createdBy: {
      id: 'writer-001',
      name: 'Maria Santos',
      email: 'maria@sistop.com',
      roles: ['roteirista'],
      permissions: [],
      avatar: undefined
    },
    createdAt: new Date('2025-01-07T11:00:00Z'),
    updatedAt: new Date('2025-01-07T11:00:00Z')
  },
  {
    id: 'comment-technical-1',
    roteiroItemId: 'item-transicao',
    text: 'Configurar fade-in de 2 segundos com trilha sonora de fundo. Volume da música deve estar em -18dB para não competir com a narração.',
    timestamp: 120000,
    type: 'technical',
    createdBy: {
      id: 'tech-001',
      name: 'Roberto Lima',
      email: 'roberto@sistop.com',
      roles: ['editor'],
      permissions: [],
      avatar: undefined
    },
    createdAt: new Date('2025-01-07T12:30:00Z'),
    updatedAt: new Date('2025-01-07T12:30:00Z')
  },
  {
    id: 'comment-feedback-1',
    roteiroItemId: 'item-conclusao',
    text: 'Feedback do cliente: Gostaram muito do conceito, mas pediram para tornar a conclusão mais otimista e inspiradora.',
    timestamp: 180000,
    type: 'feedback',
    createdBy: {
      id: 'producer-001',
      name: 'Fernanda Costa',
      email: 'fernanda@sistop.com',
      roles: ['produtor'],
      permissions: [],
      avatar: undefined
    },
    createdAt: new Date('2025-01-07T14:00:00Z'),
    updatedAt: new Date('2025-01-07T14:00:00Z')
  }
]

// Exemplo de estados TTS para demonstração
export const exemploEstadosTTS: TTSState[] = [
  // Comentário 1 - Direction (alguns já gerados)
  {
    comentarioId: 'comment-direction-1',
    language: 'pt-br',
    status: 'generated',
    audioUrl: 'mock-audio-direction-pt-br-1704614400000',
    duration: 8.4,
    voice: 'pt-br-neural-female',
    generatedAt: new Date('2025-01-07T09:45:00Z'),
    progress: 100
  },
  {
    comentarioId: 'comment-direction-1',
    language: 'en-us',
    status: 'generated',
    audioUrl: 'mock-audio-direction-en-us-1704614400000',
    duration: 7.8,
    voice: 'en-us-neural-female',
    generatedAt: new Date('2025-01-07T09:50:00Z'),
    progress: 100
  },
  {
    comentarioId: 'comment-direction-1',
    language: 'es-es',
    status: 'idle',
    voice: 'es-es-neural-female'
  },
  {
    comentarioId: 'comment-direction-1',
    language: 'fr-fr',
    status: 'error',
    error: 'Falha na conexão com o serviço de TTS',
    voice: 'fr-fr-neural-female'
  },

  // Comentário 2 - Note (em processamento)
  {
    comentarioId: 'comment-note-1',
    language: 'pt-br',
    status: 'generating',
    progress: 60,
    voice: 'pt-br-neural-male'
  },
  {
    comentarioId: 'comment-note-1',
    language: 'en-us',
    status: 'idle',
    voice: 'en-us-neural-male'
  },
  {
    comentarioId: 'comment-note-1',
    language: 'es-es',
    status: 'idle',
    voice: 'es-es-neural-male'
  },
  {
    comentarioId: 'comment-note-1',
    language: 'fr-fr',
    status: 'idle',
    voice: 'fr-fr-neural-male'
  },

  // Comentário 3 - Script (mix de estados)
  {
    comentarioId: 'comment-script-1',
    language: 'pt-br',
    status: 'generated',
    audioUrl: 'mock-audio-script-pt-br-1704618000000',
    duration: 5.2,
    voice: 'pt-br-standard-female',
    generatedAt: new Date('2025-01-07T11:15:00Z'),
    progress: 100
  },
  {
    comentarioId: 'comment-script-1',
    language: 'en-us',
    status: 'playing',
    audioUrl: 'mock-audio-script-en-us-1704618000000',
    duration: 4.8,
    voice: 'en-us-standard-female',
    generatedAt: new Date('2025-01-07T11:20:00Z'),
    progress: 100
  },
  {
    comentarioId: 'comment-script-1',
    language: 'es-es',
    status: 'pending',
    voice: 'es-es-neural-female'
  },
  {
    comentarioId: 'comment-script-1',
    language: 'fr-fr',
    status: 'idle',
    voice: 'fr-fr-neural-female'
  }
]

// Exemplo de configuração TTS
export const exemploConfigTTS = {
  defaultVoice: 'pt-br-neural-female',
  speed: 1.0,
  pitch: 0,
  volume: 85
}

// Função para calcular estatísticas de exemplo
export function calcularEstatisticasTTS(estados: TTSState[]) {
  const comentariosUnicos = new Set(estados.map(e => e.comentarioId)).size
  const audiosGerados = estados.filter(e => e.status === 'generated').length
  const emProcessamento = estados.filter(e => e.status === 'generating').length
  const comErros = estados.filter(e => e.status === 'error').length
  
  return {
    totalComentarios: comentariosUnicos,
    totalAudiosGerados: audiosGerados,
    emProcessamento,
    comErros,
    taxaSucesso: audiosGerados > 0 ? ((audiosGerados / estados.length) * 100).toFixed(1) : '0'
  }
}

// Exemplo de uso da interface TTS
export const exemploUsoTTS = {
  // Como inicializar comentários
  inicializar: `
    const ttsStore = useTTSStore()
    const comentarios = ttsStore.createMockComentarios()
    ttsStore.initializeTTSStates(comentarios)
  `,
  
  // Como gerar TTS
  gerar: `
    await ttsStore.generateTTS('comment-1', 'pt-br', 'Texto para converter')
  `,
  
  // Como reproduzir
  reproduzir: `
    ttsStore.playTTS('comment-1', 'pt-br')
  `,
  
  // Como verificar estado
  verificar: `
    const estado = ttsStore.getTTSState('comment-1', 'pt-br')
    console.log('Status:', estado?.status)
    console.log('Duração:', estado?.duration, 'segundos')
  `
}

// Cenários de teste para demonstração
export const cenariosDemonstracao = {
  cenario1: {
    nome: 'Comentário Multilíngue Completo',
    descricao: 'Um comentário com TTS gerado em todos os idiomas',
    comentario: exemploComentarios[0],
    expectativa: 'Todos os idiomas devem mostrar status "generated" com players de áudio'
  },
  
  cenario2: {
    nome: 'Processamento em Andamento',
    descricao: 'Comentário sendo processado em tempo real',
    comentario: exemploComentarios[1],
    expectativa: 'Barra de progresso visível, status "generating" animado'
  },
  
  cenario3: {
    nome: 'Estados Mistos',
    descricao: 'Comentário com diferentes estados por idioma',
    comentario: exemploComentarios[2],
    expectativa: 'Estados variados: generated, playing, pending, idle'
  },
  
  cenario4: {
    nome: 'Tratamento de Erros',
    descricao: 'Como a interface lida com falhas de TTS',
    comentario: exemploComentarios[0], // mesmo comentário com erro em francês
    expectativa: 'Status "error" com mensagem descritiva, opção de regenerar'
  }
}

console.log('📢 TTS Demo carregado!')
console.log('Estatísticas:', calcularEstatisticasTTS(exemploEstadosTTS))
console.log('Cenários disponíveis:', Object.keys(cenariosDemonstracao))

export {
  exemploComentarios as comentarios,
  exemploEstadosTTS as estados,
  exemploConfigTTS as config
}