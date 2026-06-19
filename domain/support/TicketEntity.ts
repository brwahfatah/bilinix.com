import type { Ticket, TicketMessage } from '~/features/support/types/ticket'

export class TicketEntity {
  constructor(private readonly data: Ticket) {}

  // ── Status predicates ──────────────────────────────────────────────────
  get isOpen(): boolean        { return this.data.status === 'open' }
  get isInProgress(): boolean  { return this.data.status === 'in-progress' }
  get isAnswered(): boolean    { return this.data.status === 'answered' }
  get isClosed(): boolean      { return this.data.status === 'closed' }

  // ── Eligibility ────────────────────────────────────────────────────────
  get canReply(): boolean  { return !this.isClosed }
  get canClose(): boolean  { return !this.isClosed }

  // ── Derived data ───────────────────────────────────────────────────────
  get messageCount(): number { return this.data.messages.length }

  get lastMessage(): TicketMessage | null {
    return this.data.messages.at(-1) ?? null
  }

  get lastMessageAt(): Date | null {
    return this.lastMessage ? new Date(this.lastMessage.createdAt) : null
  }

  // True when the most recent message is from the client (waiting on support)
  get waitingForSupport(): boolean {
    return this.lastMessage?.authorRole === 'client'
  }

  get hasSupportReply(): boolean {
    return this.data.messages.some((m) => m.authorRole === 'support')
  }

  // ── Factory ────────────────────────────────────────────────────────────
  static from(data: Ticket | null | undefined): TicketEntity | null {
    if (!data) return null
    return new TicketEntity(data)
  }

  toPlain(): Ticket { return this.data }
}
