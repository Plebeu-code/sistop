<template>
  <header 
    id="main-header"
    class="modern-header"
    role="banner"
  >
    <!-- Header Container -->
    <div class="header-container">
      <!-- Left Section -->
      <div class="header-left">
        <!-- Menu Toggle -->
        <Button
          v-tooltip.bottom="sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'"
          :icon="sidebarCollapsed ? 'pi pi-bars' : 'pi pi-times'"
          class="menu-toggle"
          text
          rounded
          :aria-label="sidebarCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'"
          :aria-expanded="!sidebarCollapsed"
          aria-controls="main-sidebar"
          @click="$emit('toggle-sidebar')"
        />
        
        <!-- Brand -->
        <router-link 
          to="/"
          class="brand-container"
          :aria-label="'Ir para página inicial - ' + (appTitle || $t('app.name'))"
        >
          <div class="brand-icon-wrapper">
            <i class="pi pi-shield brand-icon" />
          </div>
          <div class="brand-content">
            <span class="brand-title">{{ appTitle || $t('app.name') }}</span>
            <span class="brand-subtitle">Sistema de Gestão</span>
          </div>
        </router-link>
        
        <!-- Breadcrumb -->
        <div
          v-if="!isMobile"
          class="breadcrumb-container"
        >
          <i class="pi pi-chevron-right breadcrumb-separator" />
          <span class="breadcrumb-current">{{ currentPageTitle }}</span>
        </div>
      </div>

      <!-- Center Section -->
      <div class="header-center">
        <!-- Advanced Search -->
        <div
          v-if="showSearch && !isMobile"
          class="search-wrapper"
        >
          <div class="search-input-group">
            <i class="pi pi-search search-icon" />
            <InputText
              v-model="searchQuery"
              placeholder="Buscar em todo o sistema..."
              class="search-input"
              aria-label="Campo de busca avançada"
              @keydown.enter="performSearch"
              @keydown.escape="clearSearch"
              @focus="showSearchSuggestions = true"
              @blur="hideSearchSuggestions"
            />
            <Button
              v-if="searchQuery"
              icon="pi pi-times"
              class="search-clear"
              text
              rounded
              size="small"
              @click="clearSearch"
            />
          </div>
          
          <!-- Search Suggestions -->
          <div
            v-if="showSearchSuggestions && searchSuggestions.length"
            class="search-suggestions"
          >
            <div 
              v-for="suggestion in searchSuggestions" 
              :key="suggestion.id"
              class="search-suggestion-item"
              @click="selectSuggestion(suggestion)"
            >
              <i
                :class="suggestion.icon"
                class="suggestion-icon"
              />
              <div class="suggestion-content">
                <span class="suggestion-title">{{ suggestion.title }}</span>
                <span class="suggestion-type">{{ suggestion.type }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Section -->
      <div class="header-right">
        <!-- Quick Actions -->
        <div
          v-if="!isMobile"
          class="quick-actions"
        >
          <Button
            v-tooltip.bottom="'Centro de ajuda'"
            icon="pi pi-question-circle"
            class="quick-action-btn"
            text
            rounded
            @click="openHelp"
          />
        </div>

        <!-- Notifications -->
        <div
          v-if="showNotifications"
          class="notification-container"
        >
          <Button
            v-tooltip.bottom="`${unreadNotifications} notificações não lidas`"
            icon="pi pi-bell"
            class="notification-button"
            text
            rounded
            badge-class="notification-badge"
            :aria-label="`Notificações - ${unreadNotifications} não lidas`"
            @click="toggleNotificationPanel"
          />
          
          <!-- Notification Panel -->
          <div
            v-if="showNotificationPanel"
            class="notification-panel"
          >
            <div class="notification-header">
              <h3>Notificações</h3>
              <Button
                icon="pi pi-times"
                class="close-panel-btn"
                text
                rounded
                size="small"
                @click="showNotificationPanel = false"
              />
            </div>
            
            <div class="notification-list">
              <div 
                v-for="notification in notifications" 
                :key="notification.id"
                class="notification-item"
                :class="{ 'notification-item--unread': !notification.read }"
              >
                <div class="notification-content">
                  <h4>{{ notification.title }}</h4>
                  <p>{{ notification.message }}</p>
                  <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- User Profile -->
        <div class="user-container">
          <Button
            class="user-button"
            text
            rounded
            :aria-label="`Menu do usuário - ${userStore.user?.name || 'Usuário'}`"
            @click="toggleUserMenu"
          >
            <Avatar
              :image="userStore.user?.avatar"
              :label="getUserInitials()"
              class="user-avatar"
              shape="circle"
              size="normal"
            />
            <span class="user-name">{{ userStore.user?.name || 'Usuário' }}</span>
            <i 
              class="pi pi-chevron-down user-chevron"
              :class="{ 'user-chevron--open': showUserMenu }"
              aria-hidden="true"
            />
          </Button>
        
          <!-- User Menu Dropdown -->
          <div 
            v-if="showUserMenu"
            class="user-dropdown"
            role="menu"
            aria-labelledby="user-menu-title"
          >
            <div class="user-dropdown-header">
              <Avatar
                :image="userStore.user?.avatar"
                :label="getUserInitials()"
                class="user-dropdown-avatar"
                shape="circle"
                size="large"
              />
              <div class="user-info">
                <h4
                  id="user-menu-title"
                  class="user-dropdown-name"
                >
                  {{ userStore.user?.name || 'Usuário' }}
                </h4>
                <p class="user-dropdown-email">
                  {{ userStore.user?.email || 'usuario@example.com' }}
                </p>
              </div>
            </div>
          
            <Divider />
          
            <div class="user-menu-items">
              <Button
                icon="pi pi-user"
                label="Perfil"
                class="user-menu-item"
                text
                role="menuitem"
                @click="goToProfile"
              />
              <Button
                icon="pi pi-cog"
                label="Configurações"
                class="user-menu-item"
                text
                role="menuitem"
                @click="goToSettings"
              />
            
              <Divider />
            
              <Button
                icon="pi pi-sign-out"
                label="Sair"
                class="user-menu-item user-menu-item--danger"
                text
                role="menuitem"
                @click="logout"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'

import Avatar from 'primevue/avatar'
import Divider from 'primevue/divider'
import { useSettingsStore, useUserStore } from '../stores'

// Props
interface Props {
  sidebarCollapsed?: boolean
  appTitle?: string
  showSearch?: boolean
  showNotifications?: boolean
}

withDefaults(defineProps<Props>(), {
  sidebarCollapsed: false,
  appTitle: '',
  showSearch: true,
  showNotifications: true
})

// Emits
defineEmits<{
  'toggle-sidebar': []
}>()

// Composables
const { locale } = useI18n()
const router = useRouter()
const settingsStore = useSettingsStore()
const userStore = useUserStore()

// Reactive state
const searchQuery = ref('')
const showUserMenu = ref(false)
const showNotificationPanel = ref(false)
const showSearchSuggestions = ref(false)
const showQuickAdd = ref(false)
const isMobile = ref(false)

// Mock data
const notifications = ref([
  {
    id: 1,
    type: 'info',
    title: 'Sistema atualizado',
    message: 'Nova versão disponível com melhorias de performance',
    createdAt: new Date().toISOString(),
    read: false
  },
  {
    id: 2,
    type: 'warning',
    title: 'Backup pendente',
    message: 'Realize o backup dos dados importantes',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    read: true
  }
])

const searchSuggestions = ref([
  { id: 1, title: 'Dashboard', type: 'Página', icon: 'pi pi-chart-bar' },
  { id: 2, title: 'Usuários', type: 'Módulo', icon: 'pi pi-users' },
  { id: 3, title: 'Relatórios', type: 'Funcionalidade', icon: 'pi pi-file-pdf' }
])

// Computed
const unreadNotifications = computed(() => 
  notifications.value.filter(n => !n.read).length
)

const currentPageTitle = computed(() => {
  const routeName = router.currentRoute.value.name
  const titleMap: Record<string, string> = {
    'dashboard': 'Dashboard',
    'users': 'Usuários',
    'reports': 'Relatórios',
    'settings': 'Configurações'
  }
  return titleMap[routeName as string] || 'Página Atual'
})

// Methods
const getUserInitials = () => {
  const name = userStore.user?.name || 'U'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

const performSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      name: 'search',
      query: { q: searchQuery.value.trim() }
    })
  }
}

const clearSearch = () => {
  searchQuery.value = ''
}

const toggleNotificationPanel = () => {
  showNotificationPanel.value = !showNotificationPanel.value
  showUserMenu.value = false
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  showNotificationPanel.value = false
}

const hideSearchSuggestions = () => {
  setTimeout(() => {
    showSearchSuggestions.value = false
  }, 200)
}

const selectSuggestion = (suggestion: any) => {
  searchQuery.value = suggestion.title
  showSearchSuggestions.value = false
  performSearch()
}

const openHelp = () => {
  window.open('/help', '_blank')
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Agora'
  if (diffMins < 60) return `${diffMins}m atrás`
  if (diffHours < 24) return `${diffHours}h atrás`
  if (diffDays < 7) return `${diffDays}d atrás`
  return date.toLocaleDateString('pt-BR')
}

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

const goToProfile = () => {
  showUserMenu.value = false
  router.push('/profile')
}

const goToSettings = () => {
  showUserMenu.value = false
  router.push('/settings')
}

const logout = () => {
  showUserMenu.value = false
  userStore.logout()
  router.push('/login')
}

const toggleLanguage = () => {
  const newLanguage = settingsStore.language === 'pt-BR' ? 'en-US' : 'pt-BR'
  settingsStore.setLanguage(newLanguage)
  locale.value = newLanguage
}

// Click outside to close dropdowns
const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  
  if (!target.closest('.notification-container')) {
    showNotificationPanel.value = false
  }
  
  if (!target.closest('.user-container')) {
    showUserMenu.value = false
  }
  
  if (!target.closest('.search-wrapper')) {
    showSearchSuggestions.value = false
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', checkMobile)
  checkMobile()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
/* Modern Header Layout */
.modern-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 4.5rem;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.06);
  z-index: 1000;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 1.5rem;
  max-width: 100%;
}

/* Left Section */
.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.menu-toggle {
  width: 2.75rem !important;
  height: 2.75rem !important;
  border-radius: 12px !important;
  background: rgba(59, 130, 246, 0.08) !important;
  border: 1px solid rgba(59, 130, 246, 0.15) !important;
  color: #3b82f6 !important;
  transition: all 0.2s ease !important;
}

.menu-toggle:hover {
  background: rgba(59, 130, 246, 0.12) !important;
  border-color: rgba(59, 130, 246, 0.25) !important;
  transform: translateY(-1px);
}

.brand-container {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  text-decoration: none;
  padding: 0.5rem 0.875rem;
  border-radius: 12px;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.brand-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 197, 253, 0.03) 100%);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.brand-container:hover::before {
  opacity: 1;
}

.brand-icon-wrapper {
  position: relative;
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

.brand-icon {
  color: white;
  font-size: 1.125rem;
}

.brand-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.brand-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
  letter-spacing: -0.025em;
}

.brand-subtitle {
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
  line-height: 1;
}

.breadcrumb-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 1rem;
}

.breadcrumb-separator {
  color: #cbd5e1;
  font-size: 0.75rem;
}

.breadcrumb-current {
  font-size: 0.875rem;
  font-weight: 500;
  color: #475569;
}

/* Center Section */
.header-center {
  flex: 2;
  display: flex;
  justify-content: center;
  max-width: 600px;
  margin: 0 2rem;
}

.search-wrapper {
  position: relative;
  width: 100%;
  max-width: 28rem;
}

.search-input-group {
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.search-input-group:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 4px 16px rgba(0, 0, 0, 0.08);
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: #64748b;
  font-size: 0.875rem;
  z-index: 1;
}

.search-input {
  width: 100% !important;
  height: 2.75rem !important;
  padding: 0 3rem 0 2.75rem !important;
  border: none !important;
  background: transparent !important;
  border-radius: 16px !important;
  font-size: 0.875rem !important;
  color: #1e293b !important;
}

.search-input::placeholder {
  color: #94a3b8 !important;
}

.search-clear {
  position: absolute;
  right: 0.5rem;
  width: 1.75rem !important;
  height: 1.75rem !important;
  border-radius: 8px !important;
  background: rgba(239, 68, 68, 0.08) !important;
  color: #ef4444 !important;
}

.search-suggestions {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  z-index: 1001;
  max-height: 20rem;
  overflow-y: auto;
}

.search-suggestion-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.search-suggestion-item:hover {
  background: rgba(59, 130, 246, 0.05);
}

.suggestion-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #3b82f6;
  font-size: 0.875rem;
}

.suggestion-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.suggestion-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
}

.suggestion-type {
  font-size: 0.75rem;
  color: #64748b;
}

/* Right Section */
.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  justify-content: flex-end;
}

.quick-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-right: 0.5rem;
}

.quick-action-btn {
  width: 2.25rem !important;
  height: 2.25rem !important;
  border-radius: 10px !important;
  background: rgba(59, 130, 246, 0.06) !important;
  color: #3b82f6 !important;
  transition: all 0.2s ease !important;
}

.quick-action-btn:hover {
  background: rgba(59, 130, 246, 0.1) !important;
  transform: translateY(-1px);
}

.notification-container {
  position: relative;
}

.notification-button {
  width: 2.5rem !important;
  height: 2.5rem !important;
  border-radius: 12px !important;
  background: white !important;
  border: 1px solid rgba(59, 130, 246, 0.15) !important;
  color: #3b82f6 !important;
  position: relative !important;
  transition: all 0.2s ease !important;
}

.notification-button:hover {
  background: rgba(59, 130, 246, 0.05) !important;
  border-color: rgba(59, 130, 246, 0.25) !important;
  transform: translateY(-1px);
}

.notification-panel {
  position: absolute;
  top: calc(100% + 0.75rem);
  right: 0;
  width: 22rem;
  background: white;
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 16px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  animation: slideDown 0.2s ease;
}

.notification-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.25rem 0.75rem;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
}

.notification-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.close-panel-btn {
  width: 1.75rem !important;
  height: 1.75rem !important;
  border-radius: 6px !important;
  background: rgba(239, 68, 68, 0.08) !important;
  color: #ef4444 !important;
}

.notification-list {
  max-height: 16rem;
  overflow-y: auto;
}

.notification-item {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  transition: background-color 0.15s ease;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item--unread {
  background: rgba(59, 130, 246, 0.02);
  border-left: 3px solid #3b82f6;
}

.notification-item:hover {
  background: rgba(59, 130, 246, 0.03);
}

.notification-content h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem;
}

.notification-content p {
  font-size: 0.8125rem;
  color: #64748b;
  margin: 0 0 0.5rem;
  line-height: 1.4;
}

.notification-time {
  font-size: 0.75rem;
  color: #94a3b8;
}

.language-toggle {
  width: 2.5rem !important;
  height: 2.5rem !important;
  border-radius: 12px !important;
  background: white !important;
  border: 1px solid rgba(59, 130, 246, 0.15) !important;
  transition: all 0.2s ease !important;
}

.language-toggle:hover {
  background: rgba(59, 130, 246, 0.05) !important;
  border-color: rgba(59, 130, 246, 0.25) !important;
  transform: translateY(-1px);
}

.language-text {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #3b82f6;
}

.user-container {
  position: relative;
  margin-left: 0.5rem;
}

.user-button {
  display: flex !important;
  align-items: center !important;
  gap: 0.625rem !important;
  padding: 0.5rem 0.875rem !important;
  background: white !important;
  border: 1px solid rgba(59, 130, 246, 0.15) !important;
  border-radius: 12px !important;
  transition: all 0.2s ease !important;
  min-width: 0 !important;
}

.user-button:hover {
  background: rgba(59, 130, 246, 0.05) !important;
  border-color: rgba(59, 130, 246, 0.25) !important;
  transform: translateY(-1px);
}

.user-avatar {
  flex-shrink: 0;
  width: 2rem !important;
  height: 2rem !important;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
  color: white !important;
  font-weight: 600 !important;
  font-size: 0.75rem !important;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 6rem;
}

.user-chevron {
  color: #64748b;
  font-size: 0.75rem;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.user-chevron--open {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 0.75rem);
  right: 0;
  width: 18rem;
  background: white;
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 16px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  animation: slideDown 0.2s ease;
  overflow: hidden;
}

.user-dropdown-header {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.04) 0%, rgba(147, 197, 253, 0.02) 100%);
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
}

.user-dropdown-avatar {
  width: 3rem !important;
  height: 3rem !important;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
  color: white !important;
  font-weight: 600 !important;
  font-size: 1rem !important;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-dropdown-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-dropdown-email {
  font-size: 0.8125rem;
  color: #64748b;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-menu-items {
  padding: 0.5rem;
}

.user-menu-item {
  width: 100% !important;
  justify-content: flex-start !important;
  padding: 0.75rem 1rem !important;
  border-radius: 10px !important;
  background: transparent !important;
  color: #1e293b !important;
  font-weight: 500 !important;
  margin-bottom: 0.25rem !important;
  transition: all 0.15s ease !important;
}

.user-menu-item:hover {
  background: rgba(59, 130, 246, 0.05) !important;
  color: #3b82f6 !important;
}

.user-menu-item--danger {
  color: #ef4444 !important;
}

.user-menu-item--danger:hover {
  background: rgba(239, 68, 68, 0.05) !important;
  color: #dc2626 !important;
}

.user-menu-items {
  padding: 0.5rem;
}

.user-menu-item {
  width: 100%;
  justify-content: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: var(--border-radius);
  margin-bottom: 0.25rem;
}

.user-menu-item:last-child {
  margin-bottom: 0;
}

.user-menu-item--danger {
  color: var(--red-500);
}

.user-menu-item--danger:hover {
  background: var(--red-50);
  color: var(--red-600);
}

/* Animations */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-0.5rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-actions {
    gap: 0.5rem;
  }
  
  .search-input {
    width: 12rem;
  }
  
  .user-name {
    display: none;
  }
  
  .user-dropdown {
    width: calc(100vw - 2rem);
    right: -1rem;
  }
}

/* Animations */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-0.5rem) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .header-center {
    margin: 0 1rem;
  }
  
  .breadcrumb-container {
    display: none;
  }
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 1rem;
  }
  
  .brand-subtitle {
    display: none;
  }
  
  .header-center {
    display: none;
  }
  
  .quick-actions {
    display: none;
  }
  
  .user-name {
    display: none;
  }
  
  .user-dropdown {
    right: -0.5rem;
    width: calc(100vw - 2rem);
    max-width: 20rem;
  }
  
  .notification-panel {
    right: -0.5rem;
    width: calc(100vw - 2rem);
    max-width: 20rem;
  }
}

@media (max-width: 480px) {
  .modern-header {
    height: 4rem;
  }
  
  .header-container {
    padding: 0 0.75rem;
  }
  
  .brand-title {
    font-size: 1rem;
  }
  
  .brand-icon-wrapper {
    width: 2.25rem;
    height: 2.25rem;
  }
  
  .language-toggle {
    width: 2.25rem !important;
    height: 2.25rem !important;
  }
  
  .notification-button {
    width: 2.25rem !important;
    height: 2.25rem !important;
  }
}

/* Focus and Accessibility */
.menu-toggle:focus-visible,
.notification-button:focus-visible,
.language-toggle:focus-visible,
.user-button:focus-visible,
.quick-action-btn:focus-visible {
  outline: 2px solid #3b82f6 !important;
  outline-offset: 2px !important;
}

.search-input:focus {
  outline: none !important;
}

/* Badge Enhancement */
.notification-badge {
  animation: pulse 2s infinite !important;
}

/* Scrollbar Styling */
.notification-list::-webkit-scrollbar,
.search-suggestions::-webkit-scrollbar {
  width: 4px;
}

.notification-list::-webkit-scrollbar-track,
.search-suggestions::-webkit-scrollbar-track {
  background: rgba(59, 130, 246, 0.05);
  border-radius: 2px;
}

.notification-list::-webkit-scrollbar-thumb,
.search-suggestions::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.3);
  border-radius: 2px;
}

.notification-list::-webkit-scrollbar-thumb:hover,
.search-suggestions::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.5);
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  .notification-badge {
    animation: none !important;
  }
}
</style>

