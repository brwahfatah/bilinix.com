export type TicketStatus     = 'open' | 'in-progress' | 'answered' | 'closed'
export type TicketPriority   = 'low' | 'normal' | 'high' | 'urgent'
export type TicketDepartment = 'technical' | 'billing' | 'sales' | 'general'

export interface TicketMessage {
  id: string
  ticketId: string
  authorName: string
  authorRole: 'client' | 'support'
  body: string
  createdAt: string
}

export interface Ticket {
  id: string
  subject: string
  status: TicketStatus
  priority: TicketPriority
  department: TicketDepartment
  messages: TicketMessage[]
  relatedServiceId: string | null
  relatedServiceType: 'vps' | 'domain' | null
  createdAt: string
  updatedAt: string
}

export interface CreateTicketPayload {
  subject: string
  department: TicketDepartment
  priority: TicketPriority
  message: string
  relatedServiceId?: string
  relatedServiceType?: 'vps' | 'domain'
}

export interface ReplyTicketPayload {
  ticketId: string
  message: string
}
