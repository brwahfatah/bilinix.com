import type { Invoice, InvoiceStatus, InvoiceItem, PayInvoiceResult } from '../types/billing'
import { api } from '~/utils/apiClient'

// Shape returned by GET /api/billing/invoices and GET /api/billing/invoices/{id}
// (InvoiceDTO::toArray())
interface LaravelInvoice {
  id: string
  number: string
  status: string         // 'paid' | 'unpaid' | 'overdue' | 'cancelled' | 'refunded'
  subtotal: string       // decimal string e.g. "29.99"
  tax: string            // decimal string e.g. "0.00"
  total: string          // decimal string — the payable amount
  due_date: string | null
  paid_at: string | null
  notes: string | null
  items: Array<{
    description: string
    amount: string        // decimal string
  }>
}

// All Laravel API responses: { data, message, errors }
interface LaravelResponse<T> {
  data: T
  message: string
  errors: null
}

function normalizeStatus(raw: string, dueAt: string | null): InvoiceStatus {
  const s = raw.toLowerCase()
  if (s === 'paid') return 'paid'
  if (s === 'cancelled' || s === 'canceled') return 'cancelled'
  if (s === 'refunded') return 'refunded'
  if (s === 'overdue') return 'overdue'
  // Secondary overdue check: if still unpaid and due date has passed
  if (dueAt && new Date(dueAt) < new Date()) return 'overdue'
  return 'unpaid'
}

function laravelToInvoice(inv: LaravelInvoice): Invoice {
  const total = parseFloat(inv.total) || 0
  const subtotal = parseFloat(inv.subtotal) || 0
  const tax = parseFloat(inv.tax) || 0
  const status = normalizeStatus(inv.status, inv.due_date)

  const items: InvoiceItem[] = (inv.items ?? []).map((line, i) => ({
    id: String(i + 1),
    type: 'other' as InvoiceItem['type'],
    description: line.description,
    quantity: 1,
    unitPrice: parseFloat(line.amount) || 0,
    amount: parseFloat(line.amount) || 0,
  }))

  return {
    id: String(inv.id),
    number: inv.number || `INV-${inv.id}`,
    status,
    amount: total,
    subtotal,
    taxAmount: tax,
    currency: 'USD',
    items,
    issuedAt: inv.due_date ?? new Date().toISOString(),
    dueAt: inv.due_date ?? new Date().toISOString(),
    paidAt: inv.paid_at || null,
    notes: inv.notes || null,
  }
}

export const billingService = {
  // GET /api/billing/invoices → { data: [...] }
  async list(): Promise<Invoice[]> {
    const res = await api<LaravelResponse<LaravelInvoice[]>>('/billing/invoices')
    const raw = Array.isArray(res.data) ? res.data : []
    return raw.map(laravelToInvoice)
  },

  // GET /api/billing/invoices/{id} → { data: {...} }
  async get(id: string): Promise<Invoice> {
    const res = await api<LaravelResponse<LaravelInvoice>>(`/billing/invoices/${id}`)
    return laravelToInvoice(res.data)
  },

  // POST /api/billing/invoices/{id}/pay → { data: { payment_url: "..." }, message }
  async pay(id: string): Promise<PayInvoiceResult> {
    const res = await api<LaravelResponse<{ payment_url?: string; checkout_url?: string }>>(
      `/billing/invoices/${id}/pay`,
      { method: 'POST' }
    )
    const url = res.data?.payment_url || res.data?.checkout_url
    if (url) {
      return { paidInline: false, paymentUrl: url }
    }
    return { paidInline: true }
  },

  // POST /api/payments/create — creates a NOWPayments invoice and returns the checkout URL
  async payWithCrypto(id: string): Promise<PayInvoiceResult> {
    const res = (await $fetch('/api/payments/create', {
      method: 'POST',
      body: { invoice_id: id },
    })) as { payment_url: string; payment_id: string; order_id: string }
    if (res.payment_url) {
      return { paidInline: false, paymentUrl: res.payment_url }
    }
    return { paidInline: false }
  },

  // Compute billing summary from the invoice list — no dedicated endpoint
  async summary(): Promise<{ totalPaid: number; totalOutstanding: number; overdueCount: number }> {
    const invoiceList = await this.list()
    const totalPaid = invoiceList
      .filter((inv) => inv.status === 'paid')
      .reduce((s, inv) => s + inv.amount, 0)
    const totalOutstanding = invoiceList
      .filter((inv) => inv.status !== 'paid' && inv.status !== 'cancelled')
      .reduce((s, inv) => s + inv.amount, 0)
    const overdueCount = invoiceList.filter((inv) => inv.status === 'overdue').length

    return { totalPaid, totalOutstanding, overdueCount }
  },
}
