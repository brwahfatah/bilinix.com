import type { Invoice, InvoiceStatus, InvoiceItem } from '~/features/billing/types/billing'

export class InvoiceEntity {
  readonly id: string
  readonly number: string
  readonly status: InvoiceStatus
  readonly amount: number
  readonly subtotal: number
  readonly taxAmount: number
  readonly currency: string
  readonly items: InvoiceItem[]
  readonly issuedAt: Date
  readonly dueAt: Date
  readonly paidAt: Date | null
  readonly notes: string | null

  constructor(data: Invoice) {
    this.id = data.id
    this.number = data.number
    this.status = data.status
    this.amount = data.amount
    this.subtotal = data.subtotal
    this.taxAmount = data.taxAmount
    this.currency = data.currency
    this.items = data.items
    this.issuedAt = new Date(data.issuedAt)
    this.dueAt = new Date(data.dueAt)
    this.paidAt = data.paidAt ? new Date(data.paidAt) : null
    this.notes = data.notes
  }

  // ---------------------------------------------------------------------------
  // State predicates
  // ---------------------------------------------------------------------------

  get isPaid(): boolean {
    return this.status === 'paid'
  }

  get isUnpaid(): boolean {
    return this.status === 'unpaid'
  }

  get isOverdue(): boolean {
    return this.status === 'overdue'
  }

  get isCancelled(): boolean {
    return this.status === 'cancelled'
  }

  get isRefunded(): boolean {
    return this.status === 'refunded'
  }

  get requiresAction(): boolean {
    return this.isUnpaid || this.isOverdue
  }

  // ---------------------------------------------------------------------------
  // Business eligibility
  // ---------------------------------------------------------------------------

  get canPay(): boolean {
    return this.isUnpaid || this.isOverdue
  }

  // ---------------------------------------------------------------------------
  // Business computed values
  // ---------------------------------------------------------------------------

  get daysOverdue(): number {
    if (!this.isOverdue) return 0
    return Math.floor((Date.now() - this.dueAt.getTime()) / 86_400_000)
  }

  get daysUntilDue(): number {
    return Math.ceil((this.dueAt.getTime() - Date.now()) / 86_400_000)
  }

  get isDueSoon(): boolean {
    return this.isUnpaid && this.daysUntilDue >= 0 && this.daysUntilDue <= 3
  }

  get itemCount(): number {
    return this.items.length
  }

  get serviceTypes(): string[] {
    return [...new Set(this.items.map((i) => i.type))]
  }

  get displayAmount(): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.currency,
    }).format(this.amount)
  }

  // ---------------------------------------------------------------------------
  // Factory + serializer
  // ---------------------------------------------------------------------------

  static from(data: Invoice): InvoiceEntity {
    return new InvoiceEntity(data)
  }

  toPlain(): Invoice {
    return {
      id: this.id,
      number: this.number,
      status: this.status,
      amount: this.amount,
      subtotal: this.subtotal,
      taxAmount: this.taxAmount,
      currency: this.currency,
      items: this.items,
      issuedAt: this.issuedAt.toISOString(),
      dueAt: this.dueAt.toISOString(),
      paidAt: this.paidAt?.toISOString() ?? null,
      notes: this.notes,
    }
  }
}
