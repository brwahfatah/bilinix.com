export type InvoiceStatus = 'unpaid' | 'paid' | 'overdue' | 'cancelled' | 'refunded'

export interface InvoiceItem {
  id: string
  type: 'vps' | 'domain' | 'hosting' | 'dedicated' | 'addon' | 'other'
  description: string
  quantity: number
  unitPrice: number
  amount: number
  serviceId?: string
}

export interface Invoice {
  id: string
  number: string
  status: InvoiceStatus
  amount: number
  subtotal: number
  taxAmount: number
  currency: string
  items: InvoiceItem[]
  issuedAt: string
  dueAt: string
  paidAt: string | null
  notes: string | null
}

export interface PayInvoicePayload {
  invoiceId: string
  method?: 'balance' | 'card' | 'paypal'
}

export interface PayInvoiceResult {
  paymentUrl?: string
  paidInline: boolean
}

export interface BillingSummary {
  totalInvoices: number
  totalPaid: number
  totalOutstanding: number
  overdueCount: number
}
