import { defineStore } from 'pinia'
import { domainService } from '../service/domainService'
import { buildApiError } from '~/types/api'
import type { Domain, UpdateDomainPayload } from '../types/domain'
import type { ApiError } from '~/types/api'

interface DomainState {
  items: Domain[]
  current: Domain | null
  loading: boolean
  actionLoading: Record<string, boolean>
  error: ApiError | null
}

export const useDomainStore = defineStore('domain', {
  state: (): DomainState => ({
    items: [],
    current: null,
    loading: false,
    actionLoading: {},
    error: null,
  }),

  getters: {
    activeCount: (state) => state.items.filter((d) => d.status === 'active').length,
    expiredCount: (state) => state.items.filter((d) => d.status === 'expired').length,
    byId: (state) => (id: string) => state.items.find((d) => d.id === id),
    isActioning: (state) => (id: string) => !!state.actionLoading[id],
  },

  actions: {
    async fetchList() {
      this.loading = true
      this.error = null
      try {
        this.items = await domainService.list()
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
        this.current = await domainService.get(id)
      } catch (e) {
        this.error = buildApiError(e)
        throw e
      } finally {
        this.loading = false
      }
    },

    async update(id: string, payload: UpdateDomainPayload) {
      this.actionLoading[id] = true
      this.error = null
      try {
        const updated = await domainService.update(id, payload)
        const idx = this.items.findIndex((d) => d.id === id)
        if (idx !== -1) this.items[idx] = updated
        if (this.current?.id === id) this.current = updated
      } catch (e) {
        this.error = buildApiError(e)
        throw e
      } finally {
        delete this.actionLoading[id]
      }
    },

    async renew(id: string) {
      this.actionLoading[id] = true
      this.error = null
      try {
        const updated = await domainService.renew(id)
        const idx = this.items.findIndex((d) => d.id === id)
        if (idx !== -1) this.items[idx] = updated
        if (this.current?.id === id) this.current = updated
      } catch (e) {
        this.error = buildApiError(e)
        throw e
      } finally {
        delete this.actionLoading[id]
      }
    },
  },
})
