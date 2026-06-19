import { defineStore } from 'pinia'

type Theme = 'light' | 'dark' | 'system'

interface AppState {
  sidebarOpen: boolean
  theme: Theme
  pageLoading: boolean
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    sidebarOpen: false,
    theme: 'system',
    pageLoading: false,
  }),

  getters: {
    isDark: (state): boolean => {
      if (state.theme === 'system' && import.meta.client) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      return state.theme === 'dark'
    },
  },

  actions: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },

    closeSidebar() {
      this.sidebarOpen = false
    },

    setTheme(theme: Theme) {
      this.theme = theme
      if (import.meta.client) {
        localStorage.setItem('theme', theme)
        document.documentElement.classList.toggle('dark', this.isDark)
      }
    },

    hydrateTheme() {
      if (!import.meta.client) return
      const saved = localStorage.getItem('theme') as Theme | null
      if (saved) this.theme = saved
      document.documentElement.classList.toggle('dark', this.isDark)
    },
  },
})
