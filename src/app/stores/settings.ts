import { defineStore } from 'pinia'
import { ref, readonly } from 'vue'
import type { AppSettings } from '../../shared/types'
import { THEMES, LANGUAGES, LOCAL_STORAGE_KEYS } from '../../shared/constants'

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<AppSettings['theme']>('light')
  const language = ref<AppSettings['language']>('pt-BR')
  const sidebarCollapsed = ref(false)

  const setTheme = (newTheme: AppSettings['theme']) => {
    theme.value = newTheme
    localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, newTheme)
    applyTheme()
  }

  const setLanguage = (newLanguage: AppSettings['language']) => {
    language.value = newLanguage
    localStorage.setItem(LOCAL_STORAGE_KEYS.LANGUAGE, newLanguage)
  }

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
    localStorage.setItem(LOCAL_STORAGE_KEYS.SIDEBAR_COLLAPSED, String(sidebarCollapsed.value))
  }

  const applyTheme = () => {
    // Sempre aplicar tema claro apenas
    const root = document.documentElement
    root.classList.remove('dark')
  }

  const loadSettings = () => {
    const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEYS.THEME) as AppSettings['theme']
    const savedLanguage = localStorage.getItem(LOCAL_STORAGE_KEYS.LANGUAGE) as AppSettings['language']
    const savedSidebarState = localStorage.getItem(LOCAL_STORAGE_KEYS.SIDEBAR_COLLAPSED)

    if (savedTheme && Object.values(THEMES).includes(savedTheme)) {
      theme.value = savedTheme
      applyTheme()
    }

    if (savedLanguage && Object.values(LANGUAGES).includes(savedLanguage)) {
      language.value = savedLanguage
    }

    if (savedSidebarState) {
      sidebarCollapsed.value = savedSidebarState === 'true'
    }
  }

  return {
    theme: readonly(theme),
    language: readonly(language),
    sidebarCollapsed: readonly(sidebarCollapsed),
    setTheme,
    setLanguage,
    toggleSidebar,
    loadSettings
  }
})