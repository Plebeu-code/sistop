<template>
  <div class="layout-wrapper">
    <!-- Skip Link for Accessibility -->
    <a 
      href="#main-content" 
      class="skip-link"
      @click="skipToMain"
      @keydown.enter="skipToMain"
    >
      {{ $t('accessibility.skipToMain') }}
    </a>

    <!-- Header -->
    <AppHeader 
      @toggle-sidebar="settingsStore.toggleSidebar" 
      @keydown.escape="handleEscape"
    />
    
    <!-- Layout Container -->
    <div class="layout-container">
      <!-- Sidebar -->
      <AppSidebar 
        :collapsed="settingsStore.sidebarCollapsed"
        @keydown.escape="handleEscape"
      />
      
      <!-- Main Content -->
      <main 
        id="main-content"
        class="layout-main"
        :class="mainContentClasses"
        role="main"
        :aria-label="$t('accessibility.mainContent')"
        tabindex="-1"
      >
        <div class="content-wrapper">
          <!-- Breadcrumb Navigation -->
          <nav 
            v-if="showBreadcrumb" 
            class="breadcrumb-nav"
            aria-label="Breadcrumb"
          >
            <Breadcrumb 
              :model="breadcrumbItems"
              class="breadcrumb-component"
            >
              <template #item="{ item }">
                <router-link 
                  v-if="item.to" 
                  :to="item.to"
                  class="breadcrumb-link"
                >
                  <i v-if="item.icon" :class="item.icon" />
                  {{ item.label }}
                </router-link>
                <span v-else class="breadcrumb-text">
                  <i v-if="item.icon" :class="item.icon" />
                  {{ item.label }}
                </span>
              </template>
            </Breadcrumb>
          </nav>

          <!-- Route Content -->
          <div class="route-content">
            <Suspense>
              <template #default>
                <RouterView v-slot="{ Component, route }">
                  <transition
                    name="route-transition"
                    mode="out-in"
                    @enter="onRouteEnter"
                    @leave="onRouteLeave"
                  >
                    <KeepAlive 
                      :include="keepAliveRoutes"
                      :max="5"
                    >
                      <component 
                        :is="Component" 
                        :key="route.fullPath"
                        class="route-component"
                      />
                    </KeepAlive>
                  </transition>
                </RouterView>
              </template>
              
              <template #fallback>
                <div class="loading-container">
                  <ProgressSpinner 
                    style="width: 50px; height: 50px"
                    stroke-width="4"
                    animation-duration="1s"
                  />
                  <p class="loading-text">{{ $t('common.loading') }}...</p>
                </div>
              </template>
            </Suspense>
          </div>
        </div>
      </main>
    </div>

    <!-- Global Toast -->
    <AppToast />

    <!-- Global Loading Overlay -->
    <div 
      v-if="isGlobalLoading" 
      class="global-loading-overlay"
      role="progressbar"
      :aria-label="$t('accessibility.loading')"
    >
      <div class="loading-content">
        <ProgressSpinner 
          style="width: 60px; height: 60px"
          stroke-width="3"
          animation-duration="1.2s"
        />
        <p class="loading-message">{{ loadingMessage }}</p>
      </div>
    </div>

    <!-- Accessibility Announcements -->
    <div 
      id="aria-live-region"
      aria-live="polite"
      aria-atomic="true"
      class="sr-only"
    >
      {{ ariaAnnouncement }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSettingsStore, useUserStore } from '../stores'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'
import AppToast from './AppToast.vue'

const { t } = useI18n()
const route = useRoute()
const settingsStore = useSettingsStore()
const userStore = useUserStore()

// Reactive state
const isGlobalLoading = ref(false)
const loadingMessage = ref('')
const ariaAnnouncement = ref('')

// Accessibility functions
function skipToMain() {
  const mainContent = document.getElementById('main-content')
  if (mainContent) {
    mainContent.focus()
    announceToScreenReader(t('accessibility.skippedToMain'))
  }
}

function handleEscape(_event: KeyboardEvent) {
  // Handle escape key for closing modals, dropdowns, etc.
  const activeElement = document.activeElement as HTMLElement
  if (activeElement && activeElement.blur) {
    activeElement.blur()
  }
}

function announceToScreenReader(message: string) {
  ariaAnnouncement.value = message
  setTimeout(() => {
    ariaAnnouncement.value = ''
  }, 1000)
}

// Computed properties
const mainContentClasses = computed(() => ({
  'layout-main--collapsed': settingsStore.sidebarCollapsed,
  'layout-main--expanded': !settingsStore.sidebarCollapsed
}))

const showBreadcrumb = computed(() => {
  // Show breadcrumb for all routes except dashboard
  return route.name !== 'dashboard'
})

const breadcrumbItems = computed(() => {
  const items = [
    {
      label: t('navigation.dashboard'),
      icon: 'pi pi-home',
      to: '/'
    }
  ]

  // Add current route breadcrumb
  if (route.name && route.name !== 'dashboard') {
    const routeLabel = t(`navigation.${String(route.name)}`)
    items.push({
      label: routeLabel,
      icon: getRouteIcon(route.name as string),
      to: route.path
    })
  }

  return items
})

const keepAliveRoutes = computed(() => [
  'dashboard',
  'assets',
  'jobs',
  'reports'
])

// Route helpers
function getRouteIcon(routeName: string): string {
  const iconMap: Record<string, string> = {
    admin: 'pi pi-cog',
    assets: 'pi pi-folder',
    clipping: 'pi pi-scissors',
    storyboard: 'pi pi-th-large',
    tts: 'pi pi-volume-up',
    jobs: 'pi pi-briefcase',
    pauta: 'pi pi-calendar',
    roteiro: 'pi pi-video',
    reports: 'pi pi-chart-bar'
  }
  return iconMap[routeName] || 'pi pi-circle'
}

// Route transition handlers
function onRouteEnter(el: Element) {
  // Smooth entry animation
  const element = el as HTMLElement
  element.style.opacity = '0'
  element.style.transform = 'translateY(10px)'
  
  setTimeout(() => {
    element.style.transition = 'all 0.3s ease'
    element.style.opacity = '1'
    element.style.transform = 'translateY(0)'
  }, 50)
}

function onRouteLeave(el: Element) {
  // Smooth exit animation
  const element = el as HTMLElement
  element.style.transition = 'all 0.2s ease'
  element.style.opacity = '0'
  element.style.transform = 'translateY(-5px)'
}

// Global loading state
function setGlobalLoading(loading: boolean, message = '') {
  isGlobalLoading.value = loading
  loadingMessage.value = message
  
  if (loading) {
    announceToScreenReader(t('accessibility.loading'))
  }
}

// Keyboard shortcuts
function handleGlobalKeyboard(event: KeyboardEvent) {
  // Alt + M: Focus main content
  if (event.altKey && event.key === 'm') {
    event.preventDefault()
    skipToMain()
    return
  }

  // Alt + N: Focus navigation
  if (event.altKey && event.key === 'n') {
    event.preventDefault()
    const nav = document.querySelector('[role="navigation"]') as HTMLElement
    if (nav) {
      nav.focus()
      announceToScreenReader(t('accessibility.focusedNavigation'))
    }
    return
  }

  // Ctrl + /: Show keyboard shortcuts help
  if (event.ctrlKey && event.key === '/') {
    event.preventDefault()
    announceToScreenReader(t('accessibility.keyboardShortcuts'))
    // Could open a help modal here
    return
  }
}

// Watch route changes for announcements
watch(route, (newRoute, oldRoute) => {
  if (newRoute.name !== oldRoute?.name) {
    nextTick(() => {
      const routeLabel = newRoute.name ? t(`navigation.${String(newRoute.name)}`) : t('common.page')
      announceToScreenReader(t('accessibility.navigatedTo', { page: routeLabel }))
    })
  }
})

// Lifecycle
onMounted(() => {
  settingsStore.loadSettings()
  
  // Simulate login for development
  if (!userStore.isAuthenticated) {
    userStore.simulateLogin()
  }

  // Add global keyboard event listeners
  document.addEventListener('keydown', handleGlobalKeyboard)

  // Add focus management for accessibility
  document.addEventListener('focusin', (event) => {
    const target = event.target as HTMLElement
    if (target && target.classList.contains('focusable')) {
      target.classList.add('focused')
    }
  })

  document.addEventListener('focusout', (event) => {
    const target = event.target as HTMLElement
    if (target && target.classList.contains('focusable')) {
      target.classList.remove('focused')
    }
  })

  // Announce page load
  nextTick(() => {
    announceToScreenReader(t('accessibility.applicationLoaded'))
  })
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeyboard)
})

// Expose global loading for child components
defineExpose({
  setGlobalLoading,
  announceToScreenReader
})
</script>

<style scoped>
/* Layout Wrapper */
.layout-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--surface-ground);
  color: var(--text-color);
}

/* Skip Link for Accessibility */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  z-index: 10000;
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  color: var(--primary-color-text);
  text-decoration: none;
  border-radius: 0 0 0.5rem 0;
  font-weight: 600;
  transition: all 0.3s ease;
}

.skip-link:focus {
  top: 0;
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* Layout Container */
.layout-container {
  display: flex;
  flex: 1;
  position: relative;
}

/* Main Content */
.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 4rem);
  margin-left: 16rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--surface-ground);
}

.layout-main--collapsed {
  margin-left: 4rem;
}

.layout-main--expanded {
  margin-left: 16rem;
}

.layout-main:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: -2px;
}

/* Content Wrapper */
.content-wrapper {
  padding: 1.5rem;
  padding-top: 5rem; /* Account for fixed header */
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Breadcrumb Navigation */
.breadcrumb-nav {
  background: var(--surface-card);
  border-radius: var(--border-radius);
  padding: 0.75rem 1rem;
  border: 1px solid var(--surface-border);
}

.breadcrumb-component {
  margin: 0;
}

.breadcrumb-link {
  color: var(--primary-color);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: calc(var(--border-radius) / 2);
  transition: all 0.2s ease;
}

.breadcrumb-link:hover {
  background: var(--primary-50);
  color: var(--primary-600);
}

.breadcrumb-link:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

.breadcrumb-text {
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
}

/* Route Content */
.route-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Route Component */
.route-component {
  flex: 1;
  animation: fadeInUp 0.3s ease-out;
}

/* Route Transitions */
.route-transition-enter-active,
.route-transition-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.route-transition-enter-from {
  opacity: 0;
  transform: translateY(1rem);
}

.route-transition-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}

/* Loading States */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
}

.loading-text {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
  margin: 0;
}

/* Global Loading Overlay */
.global-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

.loading-content {
  background: var(--surface-card);
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--shadow-5);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  min-width: 12rem;
}

.loading-message {
  color: var(--text-color);
  font-size: 0.875rem;
  margin: 0;
  text-align: center;
}

/* Screen Reader Only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Focus Management */
.focusable.focused {
  box-shadow: 0 0 0 2px var(--primary-color);
  border-radius: var(--border-radius);
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(1rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .layout-main {
    margin-left: 0;
  }
  
  .layout-main--collapsed,
  .layout-main--expanded {
    margin-left: 0;
  }
  
  .content-wrapper {
    padding: 1rem;
    padding-top: 4.5rem;
  }
  
  .breadcrumb-nav {
    padding: 0.5rem;
  }
}

/* High Contrast Mode Support */
@media (prefers-contrast: high) {
  .skip-link:focus {
    outline: 3px solid;
  }
  
  .breadcrumb-link:focus-visible {
    outline: 3px solid;
  }
  
  .focusable.focused {
    box-shadow: 0 0 0 3px currentColor;
  }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  .layout-main,
  .route-transition-enter-active,
  .route-transition-leave-active,
  .global-loading-overlay,
  .route-component {
    transition: none;
    animation: none;
  }
}

/* Print Styles */
@media print {
  .skip-link,
  .global-loading-overlay {
    display: none;
  }
  
  .layout-main {
    margin-left: 0;
  }
  
  .content-wrapper {
    padding: 0;
  }
}
</style>

