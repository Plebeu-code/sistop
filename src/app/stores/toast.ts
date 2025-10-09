import { defineStore } from 'pinia'
import { ref, readonly } from 'vue'
import type { Toast } from '../../shared/types'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString()
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || 5000
    }
    
    toasts.value.push(newToast)

    // Auto remove toast after duration
    setTimeout(() => {
      removeToast(id)
    }, newToast.duration!)
  }

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const clearAll = () => {
    toasts.value = []
  }

  const success = (title: string, message: string, duration?: number) => {
    addToast({ type: 'success', title, message, duration })
  }

  const error = (title: string, message: string, duration?: number) => {
    addToast({ type: 'error', title, message, duration })
  }

  const warning = (title: string, message: string, duration?: number) => {
    addToast({ type: 'warning', title, message, duration })
  }

  const info = (title: string, message: string, duration?: number) => {
    addToast({ type: 'info', title, message, duration })
  }

  return {
    toasts: readonly(toasts),
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info
  }
})