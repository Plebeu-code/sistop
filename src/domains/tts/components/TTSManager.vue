<template>
  <div class="tts-manager">
    <!-- Header com configurações -->
    <div class="tts-header">
      <div class="header-title">
        <h3>
          <i class="pi pi-volume-up" />
          Gerenciamento TTS
        </h3>
        <p class="text-muted">
          Estados de texto-para-fala por comentário e idioma
        </p>
      </div>
      
      <div class="header-actions">
        <Button
          label="Gerar Todos"
          icon="pi pi-play"
          size="small"
          :disabled="isGeneratingAll"
          :loading="isGeneratingAll"
          @click="generateAllTTS"
        />
        <Button
          label="Configurações"
          icon="pi pi-cog"
          size="small"
          severity="secondary"
          outlined
          @click="showConfig = true"
        />
      </div>
    </div>

    <!-- Tabela/Cards de comentários -->
    <div
      v-if="comentarios.length === 0"
      class="no-comments"
    >
      <div class="empty-state">
        <i class="pi pi-comment" />
        <h4>Nenhum comentário encontrado</h4>
        <p>Adicione comentários aos itens do roteiro para gerar TTS</p>
        <Button
          label="Criar Comentários de Exemplo"
          icon="pi pi-plus"
          @click="createSampleComments"
        />
      </div>
    </div>

    <div
      v-else
      class="comments-grid"
    >
      <Card
        v-for="comentario in comentarios"
        :key="comentario.id"
        class="comment-card"
      >
        <template #header>
          <div class="comment-info">
            <div class="comment-type">
              <i :class="getCommentIcon(comentario.type)" />
              <span>{{ getCommentTypeLabel(comentario.type) }}</span>
            </div>
            <div class="comment-meta">
              <small class="text-muted">
                Por {{ comentario.createdBy.name }} • {{ formatTimestamp(comentario.timestamp) }}
              </small>
            </div>
          </div>
        </template>

        <template #content>
          <!-- Texto do comentário -->
          <div class="comment-text">
            <p>{{ comentario.text }}</p>
          </div>

          <!-- Grid de idiomas -->
          <div class="languages-grid">
            <div
              v-for="language in availableLanguages"
              :key="`${comentario.id}-${language.code}`"
              class="language-item"
            >
              <!-- Header do idioma -->
              <div class="language-header">
                <div class="language-info">
                  <span class="flag">{{ language.flag }}</span>
                  <span class="name">{{ language.name }}</span>
                </div>
                <div class="language-status">
                  <TTSStatusBadge
                    :status="getTTSStatus(comentario.id, language.code)"
                    :progress="getTTSProgress(comentario.id, language.code)"
                  />
                </div>
              </div>

              <!-- Controles do TTS -->
              <div class="tts-controls">
                <div class="primary-actions">
                  <Button
                    v-if="canPlay(comentario.id, language.code)"
                    v-tooltip.top="'Reproduzir áudio'"
                    icon="pi pi-play"
                    size="small"
                    severity="success"
                    :disabled="isPlaying(comentario.id, language.code)"
                    @click="playTTS(comentario.id, language.code)"
                  />
                  
                  <Button
                    v-if="canGenerate(comentario.id, language.code)"
                    v-tooltip.top="'Gerar TTS'"
                    icon="pi pi-microphone"
                    size="small"
                    severity="info"
                    :disabled="isGenerating(comentario.id, language.code)"
                    @click="generateTTS(comentario.id, language.code, comentario.text)"
                  />
                  
                  <Button
                    v-if="canRegenerate(comentario.id, language.code)"
                    v-tooltip.top="'Regenerar TTS'"
                    icon="pi pi-refresh"
                    size="small"
                    severity="warning"
                    :disabled="isGenerating(comentario.id, language.code)"
                    @click="regenerateTTS(comentario.id, language.code, comentario.text)"
                  />
                </div>

                <!-- Progress bar -->
                <div
                  v-if="isGenerating(comentario.id, language.code)"
                  class="progress-container"
                >
                  <ProgressBar
                    :value="getTTSProgress(comentario.id, language.code)"
                    :show-value="false"
                    class="tts-progress"
                  />
                </div>

                <!-- Info adicional -->
                <div
                  v-if="hasAudio(comentario.id, language.code)"
                  class="audio-info"
                >
                  <small class="text-muted">
                    <i class="pi pi-clock" />
                    {{ getTTSDuration(comentario.id, language.code) }}s
                    •
                    <i class="pi pi-user" />
                    {{ getTTSVoiceName(comentario.id, language.code) }}
                  </small>
                </div>

                <!-- Error message -->
                <div
                  v-if="hasError(comentario.id, language.code)"
                  class="error-info"
                >
                  <small class="text-danger">
                    <i class="pi pi-exclamation-triangle" />
                    {{ getTTSError(comentario.id, language.code) }}
                  </small>
                </div>
              </div>

              <!-- Audio player (mock) -->
              <div
                v-if="hasAudio(comentario.id, language.code)"
                class="audio-player"
              >
                <audio
                  controls
                  preload="none"
                  class="tts-audio"
                >
                  <source
                    :src="getAudioUrl(comentario.id, language.code)"
                    type="audio/wav"
                  >
                  Seu navegador não suporta áudio HTML5.
                </audio>
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Dialog de configurações -->
    <Dialog
      v-model:visible="showConfig"
      header="Configurações TTS"
      :style="{ width: '450px' }"
      modal
    >
      <div class="config-form">
        <div class="form-group">
          <label for="defaultVoice">Voz Padrão</label>
          <Dropdown
            id="defaultVoice"
            v-model="configForm.defaultVoice"
            :options="allVoices"
            option-label="name"
            option-value="id"
            placeholder="Selecione uma voz"
          />
        </div>

        <div class="form-group">
          <label for="speed">Velocidade</label>
          <Slider
            id="speed"
            v-model="configForm.speed"
            :min="0.5"
            :max="2"
            :step="0.1"
          />
          <small class="text-muted">{{ configForm.speed }}x</small>
        </div>

        <div class="form-group">
          <label for="volume">Volume</label>
          <Slider
            id="volume"
            v-model="configForm.volume"
            :min="0"
            :max="100"
            :step="5"
          />
          <small class="text-muted">{{ configForm.volume }}%</small>
        </div>
      </div>

      <template #footer>
        <Button
          label="Cancelar"
          icon="pi pi-times"
          text
          @click="showConfig = false"
        />
        <Button
          label="Salvar"
          icon="pi pi-check"
          @click="saveConfig"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTTSStore } from '@/app/stores/tts'
import type { RoteiroComentario } from '@/shared/types'
import TTSStatusBadge from './TTSStatusBadge.vue'

// Props
interface Props {
  roteiroId?: string
}

const props = withDefaults(defineProps<Props>(), {
  roteiroId: 'roteiro-demo'
})

// Store
const ttsStore = useTTSStore()

// Estado local
const showConfig = ref(false)
const isGeneratingAll = ref(false)
const comentarios = ref<RoteiroComentario[]>([])

// Form de configuração
const configForm = ref({
  defaultVoice: ttsStore.currentConfig.defaultVoice,
  speed: ttsStore.currentConfig.speed,
  volume: ttsStore.currentConfig.volume
})

// Computadas
const availableLanguages = computed(() => ttsStore.availableLanguages)

const allVoices = computed(() => {
  const voices = []
  for (const lang of ttsStore.availableLanguages) {
    for (const voice of lang.voices) {
      voices.push({
        id: voice.id,
        name: `${voice.name} (${lang.name})`,
        language: lang.code
      })
    }
  }
  return voices
})

// Métodos de status
function getTTSStatus(comentarioId: string, language: string) {
  const state = ttsStore.getTTSState(comentarioId, language)
  return state?.status || 'idle'
}

function getTTSProgress(comentarioId: string, language: string) {
  const state = ttsStore.getTTSState(comentarioId, language)
  return state?.progress || 0
}

function canPlay(comentarioId: string, language: string) {
  const status = getTTSStatus(comentarioId, language)
  return status === 'generated' && hasAudio(comentarioId, language)
}

function canGenerate(comentarioId: string, language: string) {
  const status = getTTSStatus(comentarioId, language)
  return status === 'idle' || status === 'error'
}

function canRegenerate(comentarioId: string, language: string) {
  const status = getTTSStatus(comentarioId, language)
  return status === 'generated' || status === 'error'
}

function isGenerating(comentarioId: string, language: string) {
  return getTTSStatus(comentarioId, language) === 'generating'
}

function isPlaying(comentarioId: string, language: string) {
  return getTTSStatus(comentarioId, language) === 'playing'
}

function hasAudio(comentarioId: string, language: string) {
  const state = ttsStore.getTTSState(comentarioId, language)
  return !!state?.audioUrl
}

function hasError(comentarioId: string, language: string) {
  const state = ttsStore.getTTSState(comentarioId, language)
  return !!state?.error
}

function getTTSDuration(comentarioId: string, language: string) {
  const state = ttsStore.getTTSState(comentarioId, language)
  return state?.duration?.toFixed(1) || '0.0'
}

function getTTSVoiceName(comentarioId: string, language: string) {
  const state = ttsStore.getTTSState(comentarioId, language)
  if (!state?.voice) return 'Voz padrão'
  
  for (const lang of ttsStore.availableLanguages) {
    const voice = lang.voices.find(v => v.id === state.voice)
    if (voice) return voice.name
  }
  return 'Voz desconhecida'
}

function getTTSError(comentarioId: string, language: string) {
  const state = ttsStore.getTTSState(comentarioId, language)
  return state?.error || ''
}

function getAudioUrl(comentarioId: string, language: string) {
  const state = ttsStore.getTTSState(comentarioId, language)
  return state?.audioUrl || ''
}

// Métodos de ação
async function generateTTS(comentarioId: string, language: string, text: string) {
  await ttsStore.generateTTS(comentarioId, language, text)
}

async function regenerateTTS(comentarioId: string, language: string, text: string) {
  await ttsStore.regenerateTTS(comentarioId, language, text)
}

function playTTS(comentarioId: string, language: string) {
  ttsStore.playTTS(comentarioId, language)
}

async function generateAllTTS() {
  isGeneratingAll.value = true
  
  try {
    for (const comentario of comentarios.value) {
      for (const language of availableLanguages.value) {
        if (canGenerate(comentario.id, language.code)) {
          await generateTTS(comentario.id, language.code, comentario.text)
        }
      }
    }
  } finally {
    isGeneratingAll.value = false
  }
}

function createSampleComments() {
  comentarios.value = ttsStore.createMockComentarios()
  ttsStore.initializeTTSStates(comentarios.value)
}

function saveConfig() {
  ttsStore.updateConfig(configForm.value)
  showConfig.value = false
}

// Utilitários
function getCommentIcon(type: string) {
  const icons = {
    direction: 'pi pi-arrow-right',
    note: 'pi pi-sticky-note',
    script: 'pi pi-file-edit',
    technical: 'pi pi-cog',
    feedback: 'pi pi-comment'
  }
  return icons[type as keyof typeof icons] || 'pi pi-comment'
}

function getCommentTypeLabel(type: string) {
  const labels = {
    direction: 'Direção',
    note: 'Nota',
    script: 'Script',
    technical: 'Técnico',
    feedback: 'Feedback'
  }
  return labels[type as keyof typeof labels] || type
}

function formatTimestamp(timestamp?: number) {
  if (!timestamp) return '00:00'
  const minutes = Math.floor(timestamp / 60000)
  const seconds = Math.floor((timestamp % 60000) / 1000)
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

// Lifecycle
onMounted(() => {
  // Inicializar com comentários de exemplo
  createSampleComments()
})
</script>

<style scoped>
.tts-manager {
  padding: 1rem;
}

.tts-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--surface-border);
}

.header-title h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
}

.header-title p {
  margin: 0;
  font-size: 0.9rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.no-comments {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-state {
  max-width: 400px;
  margin: 0 auto;
}

.empty-state i {
  font-size: 3rem;
  color: var(--text-color-secondary);
  margin-bottom: 1rem;
}

.empty-state h4 {
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
}

.empty-state p {
  margin: 0 0 1.5rem 0;
  color: var(--text-color-secondary);
}

.comments-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.comment-card {
  border: 1px solid var(--surface-border);
}

.comment-info {
  padding: 1rem 1rem 0 1rem;
}

.comment-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 0.25rem;
}

.comment-text {
  margin-bottom: 1.5rem;
}

.comment-text p {
  margin: 0;
  line-height: 1.5;
  color: var(--text-color);
}

.languages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.language-item {
  border: 1px solid var(--surface-border);
  border-radius: var(--border-radius);
  padding: 1rem;
  background: var(--surface-ground);
}

.language-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.language-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.language-info .flag {
  font-size: 1.2rem;
}

.language-info .name {
  font-weight: 500;
  color: var(--text-color);
}

.tts-controls {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.primary-actions {
  display: flex;
  gap: 0.5rem;
}

.progress-container {
  width: 100%;
}

.tts-progress {
  height: 4px;
}

.audio-info,
.error-info {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.audio-info i,
.error-info i {
  font-size: 0.8rem;
}

.audio-player {
  margin-top: 0.75rem;
}

.tts-audio {
  width: 100%;
  height: 32px;
}

.config-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: var(--text-color);
}

.text-muted {
  color: var(--text-color-secondary);
}

.text-danger {
  color: var(--red-500);
}

@media (max-width: 768px) {
  .tts-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .languages-grid {
    grid-template-columns: 1fr;
  }
  
  .primary-actions {
    flex-wrap: wrap;
  }
}
</style>

