import { defineStore } from 'pinia'
import { hostingService } from '../service/hostingService'
import { buildApiError } from '~/types/api'
import type { HostingAccount } from '../types/hosting'
import type { ApiError } from '~/types/api'

interface HostingState {
  items: HostingAccount[]
  current: HostingAccount | null
  loading: boolean
  error: ApiError | null
}

export const useHostingStore = defineStore('hosting', {
  state: (): HostingState => ({
    items: [],
    current: null,
    loading: false,
    error: null,
  }),

  getters: {
    activeCount: (state) => state.items.filter((h) => h.status === 'active').length,
    byId: (state) => (id: string) => state.items.find((h) => h.id === id),
  },

  actions: {
    async fetchList() {
      this.loading = true
      this.error = null
      try {
        this.items = await hostingService.list()
      } catch (e) {
        this.error = buildApiError(e)
      } finally {
        this.loading = false
      }
    },

    async fetchOne(id: string) {
      this.loading = true
      this.error = null
      try {
        this.current = await hostingService.get(id)
      } catch (e) {
        this.error = buildApiError(e)
        throw e
      } finally {
        this.loading = false
      }
    },
  },
})
