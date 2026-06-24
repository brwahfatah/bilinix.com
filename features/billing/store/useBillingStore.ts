import { defineStore } from 'pinia'
import { billingService } from '../service/billingService'
import { buildApiError } from '~/types/api'
import type { Invoice } from '../types/billing'
import type { ApiError } from '~/types/api'

// Inspect invoice line-item descriptions to determine which Hestia hosting
// package should be provisioned. Returns null if this is not a hosting invoice
// (e.g. VPS, domain, SSL) so the caller can skip provisioning.
function getHostingPackageFromInvoice(invoice: Invoice | null): string | null {
  if (!invoice) return null
  for (const item of invoice.items ?? []) {
    const d = item.description.toLowerCase()
    if (d.includes('agency') || d.includes('unlimited')) return 'AGENCY'
    if (d.includes('business')) return 'BUSINESS'
    if (d.includes('starter') || d.includes('shared') || d.includes('hosting')) return 'STARTER'
  }
  return null
}

interface BillingState {
  items: Invoice[]
  current: Invoice | null
  loading: boolean
  payingId: string | null
  cryptoPayingId: string | null
  error: ApiError | null
}

export const useBillingStore = defineStore('billing', {
  state: (): BillingState => ({
    items: [],
    current: null,
    loading: false,
    payingId: null,
    cryptoPayingId: null,
    error: null,
  }),

  getters: {
    totalInvoices: (state) => state.items.length,
    totalPaid: (state) =>
      state.items
        .filter((inv) => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.amount, 0),
    totalOutstanding: (state) =>
      state.items
        .filter((inv) => inv.status !== 'paid' && inv.status !== 'cancelled')
        .reduce((sum, inv) => sum + inv.amount, 0),
    overdueCount: (state) => state.items.filter((inv) => inv.status === 'overdue').length,
    byId: (state) => (id: string) => state.items.find((inv) => inv.id === id),
    isPaying: (state) => (id: string) => state.payingId === id,
    isCryptoPaying: (state) => (id: string) => state.cryptoPayingId === id,
  },

  actions: {
    async fetchList() {
      this.loading = true
      this.error = null
      try {
        this.items = await billingService.list()
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
        this.current = await billingService.get(id)
      } catch (e) {
        this.error = buildApiError(e)
        throw e
      } finally {
        this.loading = false
      }
    },

    async payInvoice(id: string) {
      this.payingId = id
      this.error = null
      try {
        const result = await billingService.pay(id)

        if (result.paymentUrl) {
          window.location.href = result.paymentUrl
          return result
        }

        // Inline payment succeeded — update state immediately
        const listItem = this.items.find((inv) => inv.id === id)
        if (listItem) {
          listItem.status = 'paid'
          listItem.paidAt = new Date().toISOString()
        }
        if (this.current?.id === id) {
          this.current.status = 'paid'
          this.current.paidAt = new Date().toISOString()
        }

        return result
      } catch (e) {
        this.error = buildApiError(e)
        throw e
      } finally {
        this.payingId = null
      }
    },

    async payWithCrypto(id: string) {
      this.cryptoPayingId = id
      this.error = null
      try {
        // Pass the known invoice amount so fake-mode server-side doesn't default to $1
        const inv = this.items.find((i) => i.id === id) ?? (this.current?.id === id ? this.current : null)
        // Derive the Hestia hosting package from invoice line items so the server
        // can provision the account automatically after payment completes
        const hostingPackage = getHostingPackageFromInvoice(inv)
        const result = await billingService.payWithCrypto(id, inv?.amount, hostingPackage ?? undefined)
        if (result.paymentUrl) {
          window.location.href = result.paymentUrl
          return result
        }
        return result
      } catch (e) {
        this.error = buildApiError(e)
        throw e
      } finally {
        this.cryptoPayingId = null
      }
    },
  },
})
