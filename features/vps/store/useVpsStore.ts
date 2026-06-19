import { defineStore } from 'pinia'
import { vpsService } from '../service/vpsService'
import { buildApiError } from '~/types/api'
import type { Vps, VpsPowerAction } from '../types/vps'
import type { ApiError } from '~/types/api'

interface VpsState {
  items: Vps[]
  current: Vps | null
  loading: boolean
  // Keyed by VPS id so multiple rows can show independent loading indicators
  actionLoading: Record<string, boolean>
  error: ApiError | null
}

export const useVpsStore = defineStore('vps', {
  state: (): VpsState => ({
    items: [],
    current: null,
    loading: false,
    actionLoading: {},
    error: null,
  }),

  getters: {
    runningCount: (state) => state.items.filter((v) => v.status === 'running').length,
    byId: (state) => (id: string) => state.items.find((v) => v.id === id),
    isActioning: (state) => (id: string) => !!state.actionLoading[id],
    anyActionLoading: (state) => Object.keys(state.actionLoading).length > 0,
  },

  actions: {
    async fetchList() {
      this.loading = true
      this.error = null
      try {
        this.items = await vpsService.list()
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
        this.current = await vpsService.get(id)
      } catch (e) {
        this.error = buildApiError(e)
        throw e
      } finally {
        this.loading = false
      }
    },

    async powerAction(id: string, action: VpsPowerAction) {
      this.actionLoading[id] = true
      this.error = null

      // Optimistic UI — update status immediately, roll back on failure
      const listItem = this.items.find((v) => v.id === id)
      const prevListStatus = listItem?.status
      const prevCurrentStatus = this.current?.status

      const optimisticStatus: Record<VpsPowerAction, Vps['status']> = {
        start: 'running',
        stop: 'stopped',
        reboot: 'rebooting',
        destroy: 'error',
      }

      if (listItem) listItem.status = optimisticStatus[action]
      if (this.current?.id === id) this.current.status = optimisticStatus[action]

      try {
        const updated = await vpsService.powerAction(id, action)
        const idx = this.items.findIndex((v) => v.id === id)
        if (idx !== -1) this.items[idx] = updated
        if (this.current?.id === id) this.current = updated
      } catch (e) {
        // Rollback optimistic update
        if (listItem && prevListStatus) listItem.status = prevListStatus
        if (this.current?.id === id && prevCurrentStatus) this.current.status = prevCurrentStatus
        this.error = buildApiError(e)
        throw e
      } finally {
        delete this.actionLoading[id]
      }
    },

    async destroy(id: string) {
      this.actionLoading[id] = true
      this.error = null
      try {
        await vpsService.destroy(id)
        this.items = this.items.filter((v) => v.id !== id)
        if (this.current?.id === id) this.current = null
      } catch (e) {
        this.error = buildApiError(e)
        throw e
      } finally {
        delete this.actionLoading[id]
      }
    },

    async rename(id: string, name: string) {
      this.actionLoading[id] = true
      this.error = null
      try {
        const updated = await vpsService.rename(id, name)
        const idx = this.items.findIndex((v) => v.id === id)
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
