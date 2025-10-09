/**
 * Demonstração da funcionalidade EDL
 * TAREFA 07 — Geração de EDL (Frontend)
 */

// Exemplo de EDL gerado pelo sistema
const exemploEDL = {
  "roteiroId": "roteiro-123-abc",
  "idiomaId": "idioma-pt-br-001", 
  "itens": [
    {
      "clipId": "clip-video-001",
      "inMs": 0,
      "outMs": 15000,
      "ordem": 1,
      "voiceStem": "voice/pt/segment-1_pt.wav"
    },
    {
      "clipId": "clip-video-002", 
      "inMs": 15000,
      "outMs": 32500,
      "ordem": 2,
      "voiceStem": "voice/pt/segment-2_pt.wav"
    },
    {
      "clipId": "clip-video-003",
      "inMs": 32500,
      "outMs": 45000,
      "ordem": 3
      // Sem voiceStem - segmento sem locução
    }
  ],
  "mix": {
    "targetLufs": -16
  },
  "metadata": {
    "version": "1.0",
    "createdAt": "2025-10-07T14:30:00.000Z",
    "totalDurationMs": 45000,
    "validationResult": {
      "isValid": true,
      "totalDurationMs": 45000,
      "gaps": [],
      "overlaps": [],
      "inconsistentOrder": false,
      "warnings": [],
      "errors": []
    }
  }
}

// Exemplo de validação com problemas
const exemploValidacaoComProblemas = {
  "isValid": false,
  "totalDurationMs": 42500,
  "gaps": [
    {
      "startMs": 30000,
      "endMs": 32500, 
      "durationMs": 2500
    }
  ],
  "overlaps": [
    {
      "startMs": 15000,
      "endMs": 17000,
      "items": ["clip-video-001", "clip-video-002"]
    }
  ],
  "inconsistentOrder": false,
  "warnings": [
    "Gap de 2500ms entre itens 2 e 3"
  ],
  "errors": [
    "Overlap de 2000ms entre itens 1 e 2"
  ]
}

console.log('📺 Exemplo de EDL válido:', exemploEDL)
console.log('⚠️  Exemplo de validação com problemas:', exemploValidacaoComProblemas)

export { exemploEDL, exemploValidacaoComProblemas }