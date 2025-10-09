<template>
  <!-- PrimeVue Toast Component -->
  <Toast 
    position="top-right"
    :breakpoints="{ '960px': { width: '100%', right: '0', left: '0' } }"
    @close="onToastClose"
  />
  
  <!-- Accessibility Announcer -->
  <div 
    ref="announcer"
    aria-live="polite" 
    aria-atomic="true" 
    class="sr-only"
  ></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'

// Composables
const toast = useToast()
const announcer = ref<HTMLElement>()

// Event handlers
const onToastClose = (event: any) => {
  // Handle toast close event if needed
  console.log('Toast closed:', event)
}

// Global toast methods for accessibility
const showAccessibleToast = (
  severity: 'success' | 'info' | 'warn' | 'error',
  summary: string,
  detail?: string,
  options?: any
) => {
  toast.add({
    severity,
    summary,
    detail,
    life: severity === 'error' ? 0 : 5000, // Error toasts don't auto-dismiss
    closable: true,
    ...options
  })
  
  // Announce to screen readers
  announceToScreenReader(`${severity}: ${summary}. ${detail || ''}`)
}

const announceToScreenReader = (message: string) => {
  if (announcer.value) {
    announcer.value.textContent = message
    
    // Clear after announcement
    setTimeout(() => {
      if (announcer.value) {
        announcer.value.textContent = ''
      }
    }, 1000)
  }
}

// Toast utility methods
const showSuccess = (summary: string, detail?: string) => {
  showAccessibleToast('success', summary, detail)
}

const showInfo = (summary: string, detail?: string) => {
  showAccessibleToast('info', summary, detail)
}

const showWarn = (summary: string, detail?: string) => {
  showAccessibleToast('warn', summary, detail)
}

const showError = (summary: string, detail?: string) => {
  showAccessibleToast('error', summary, detail, { life: 0 })
}

const clear = () => {
  toast.removeAllGroups()
}

// Keyboard event handler for toast dismissal
const handleKeyDown = (event: KeyboardEvent) => {
  // ESC key to close all toasts
  if (event.key === 'Escape') {
    clear()
    announceToScreenReader('Todas as notificações foram fechadas')
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
  
  // Make toast methods globally available
  if (typeof window !== 'undefined') {
    ;(window as any).showToast = {
      success: showSuccess,
      info: showInfo,
      warn: showWarn,
      error: showError,
      clear
    }
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  
  // Clean up global methods
  if (typeof window !== 'undefined') {
    delete (window as any).showToast
  }
})

// Expose methods
defineExpose({
  showSuccess,
  showInfo,
  showWarn,
  showError,
  clear,
  toast
})
</script>

<style>
/* Toast Accessibility Enhancements */
.p-toast {
  z-index: 9999;
}

.p-toast .p-toast-message {
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-4);
  border: 1px solid var(--surface-border);
  backdrop-filter: blur(8px);
}

/* Focus styles for toast messages */
.p-toast .p-toast-message:focus-within {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* Success toast */
.p-toast .p-toast-message-success {
  background: var(--green-50);
  border-color: var(--green-200);
  color: var(--green-900);
}

.p-toast .p-toast-message-success .p-toast-message-icon {
  color: var(--green-600);
}

.p-toast .p-toast-message-success .p-toast-icon-close {
  color: var(--green-600);
}

.p-toast .p-toast-message-success .p-toast-icon-close:hover {
  background: var(--green-100);
}

/* Info toast */
.p-toast .p-toast-message-info {
  background: var(--blue-50);
  border-color: var(--blue-200);
  color: var(--blue-900);
}

.p-toast .p-toast-message-info .p-toast-message-icon {
  color: var(--blue-600);
}

.p-toast .p-toast-message-info .p-toast-icon-close {
  color: var(--blue-600);
}

.p-toast .p-toast-message-info .p-toast-icon-close:hover {
  background: var(--blue-100);
}

/* Warning toast */
.p-toast .p-toast-message-warn {
  background: var(--yellow-50);
  border-color: var(--yellow-200);
  color: var(--yellow-900);
}

.p-toast .p-toast-message-warn .p-toast-message-icon {
  color: var(--yellow-600);
}

.p-toast .p-toast-message-warn .p-toast-icon-close {
  color: var(--yellow-600);
}

.p-toast .p-toast-message-warn .p-toast-icon-close:hover {
  background: var(--yellow-100);
}

/* Error toast */
.p-toast .p-toast-message-error {
  background: var(--red-50);
  border-color: var(--red-200);
  color: var(--red-900);
}

.p-toast .p-toast-message-error .p-toast-message-icon {
  color: var(--red-600);
}

.p-toast .p-toast-message-error .p-toast-icon-close {
  color: var(--red-600);
}

.p-toast .p-toast-message-error .p-toast-icon-close:hover {
  background: var(--red-100);
}

/* Toast content layout */
.p-toast .p-toast-message-content {
  padding: 1rem;
  gap: 0.75rem;
}

.p-toast .p-toast-summary {
  font-weight: 600;
  font-size: 0.875rem;
  margin: 0 0 0.25rem;
}

.p-toast .p-toast-detail {
  font-size: 0.8125rem;
  line-height: 1.4;
  margin: 0;
}

/* Close button accessibility */
.p-toast .p-toast-icon-close {
  border-radius: var(--border-radius);
  padding: 0.5rem;
  transition: all 0.2s ease;
}

.p-toast .p-toast-icon-close:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

/* Animation improvements */
.p-toast .p-toast-message-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.p-toast .p-toast-message-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.p-toast .p-toast-message-enter-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.p-toast .p-toast-message-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* Screen reader only class */
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

/* Responsive design */
@media (max-width: 960px) {
  .p-toast {
    width: 100% !important;
    left: 0 !important;
    right: 0 !important;
  }
  
  .p-toast .p-toast-message {
    margin: 0 1rem 0.5rem;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .p-toast .p-toast-message {
    border-width: 2px;
  }
  
  .p-toast .p-toast-icon-close:focus-visible {
    outline-width: 3px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .p-toast .p-toast-message-enter-active,
  .p-toast .p-toast-message-leave-active {
    transition: none;
  }
  
  .p-toast .p-toast-message-enter-from,
  .p-toast .p-toast-message-leave-to {
    transform: none;
  }
}
</style>

