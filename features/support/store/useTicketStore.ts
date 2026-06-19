import { defineStore } from 'pinia'
import { ticketService } from '../service/ticketService'
import { buildApiError } from '~/types/api'
import type { Ticket, CreateTicketPayload, ReplyTicketPayload } from '../types/ticket'
import type { ApiError } from '~/types/api'

interface TicketState {
  items: Ticket[]
  current: Ticket | null
  loading: boolean
  submitting: boolean
  error: ApiError | null
}

export const useTicketStore = defineStore('ticket', {
  state: (): TicketState => ({
    items: [],
    current: null,
    loading: false,
    submitting: false,
    error: null,
  }),

  getters: {
    openCount: (state) =>
      state.items.filter((t) => t.status === 'open' || t.status === 'in-progress').length,

    byId: (state) => (id: string) => state.items.find((t) => t.id === id),
  },

  actions: {
    async fetchList() {
      this.loading = true
      this.error = null
      try {
        this.items = await ticketService.list()
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
        this.current = await ticketService.get(id)
      } catch (e) {
        this.error = buildApiError(e)
        throw e
      } finally {
        this.loading = false
      }
    },

    async createTicket(payload: CreateTicketPayload): Promise<Ticket> {
      this.submitting = true
      this.error = null
      try {
        const ticket = await ticketService.create(payload)
        this.items = [ticket, ...this.items]
        return ticket
      } catch (e) {
        this.error = buildApiError(e)
        throw e
      } finally {
        this.submitting = false
      }
    },

    async addReply(payload: ReplyTicketPayload): Promise<void> {
      this.submitting = true
      this.error = null
      try {
        const updated = await ticketService.reply(payload)
        const idx = this.items.findIndex((t) => t.id === payload.ticketId)
        if (idx !== -1) this.items[idx] = updated
        if (this.current?.id === payload.ticketId) this.current = updated
      } catch (e) {
        this.error = buildApiError(e)
        throw e
      } finally {
        this.submitting = false
      }
    },

    async closeTicket(id: string): Promise<void> {
      this.submitting = true
      this.error = null
      try {
        const updated = await ticketService.close(id)
        const idx = this.items.findIndex((t) => t.id === id)
        if (idx !== -1) this.items[idx] = updated
        if (this.current?.id === id) this.current = updated
      } catch (e) {
        this.error = buildApiError(e)
        throw e
      } finally {
        this.submitting = false
      }
    },
  },
})
