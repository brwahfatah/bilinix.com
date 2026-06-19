import type { Ticket, TicketStatus, TicketPriority, TicketDepartment, TicketMessage, CreateTicketPayload, ReplyTicketPayload } from '../types/ticket'
import { api } from '~/utils/apiClient'

// Shape returned by GET /api/tickets and GET /api/tickets/{id} (TicketDTO::toArray())
interface LaravelTicket {
  id: string
  subject: string
  department: string   // string name e.g. "Technical Support", "General"
  status: string
  priority: string
  created_at: string
  updated_at: string | null
  replies: Array<{
    id: string
    message: string    // body text — field name is "message" not "body"
    author: string     // display name — no author_role field
    created_at: string
  }>
}

// All Laravel API responses: { data, message, errors }
interface LaravelResponse<T> {
  data: T
  message: string
  errors: null
}

// Department string → integer ID mapping (matches WHMCS default department IDs)
const DEPT_ID_MAP: Record<string, number> = {
  technical:  1,
  billing:    2,
  sales:      3,
  general:    4,
}

// Nuxt priority → Laravel priority (Laravel only accepts: low | medium | high)
function toApiPriority(p: string): 'low' | 'medium' | 'high' {
  if (p === 'urgent') return 'high'
  if (p === 'normal') return 'medium'
  if (p === 'low')    return 'low'
  if (p === 'high')   return 'high'
  return 'medium'
}

function normalizeStatus(raw: string): TicketStatus {
  const s = raw.toLowerCase().replace(/[\s_]+/g, '-')
  if (s === 'answered') return 'answered'
  if (s === 'closed') return 'closed'
  if (s === 'in-progress') return 'in-progress'
  return 'open'
}

function normalizePriority(raw: string): TicketPriority {
  const s = raw.toLowerCase()
  if (s === 'urgent' || s === 'high') return 'high'
  if (s === 'medium' || s === 'normal') return 'normal'
  if (s === 'low') return 'low'
  return 'normal'
}

function normalizeDepartment(raw: string): TicketDepartment {
  const s = raw.toLowerCase()
  if (s.includes('bill')) return 'billing'
  if (s.includes('sale')) return 'sales'
  if (s.includes('tech') || s.includes('support')) return 'technical'
  return 'general'
}

function laravelToTicket(t: LaravelTicket): Ticket {
  const messages: TicketMessage[] = (t.replies ?? []).map((r) => ({
    id: String(r.id),
    ticketId: String(t.id),
    authorName: r.author,
    authorRole: 'support' as const,   // Laravel doesn't return role; default to support
    body: r.message,
    createdAt: r.created_at,
  }))

  return {
    id: String(t.id),
    subject: t.subject,
    status: normalizeStatus(t.status),
    priority: normalizePriority(t.priority),
    department: normalizeDepartment(t.department),
    messages,
    relatedServiceId: null,
    relatedServiceType: null,
    createdAt: t.created_at,
    updatedAt: t.updated_at || t.created_at,
  }
}

export const ticketService = {
  // GET /api/tickets → { data: [...] }
  async list(): Promise<Ticket[]> {
    const res = await api<LaravelResponse<LaravelTicket[]>>('/tickets')
    return (Array.isArray(res.data) ? res.data : []).map(laravelToTicket)
  },

  // GET /api/tickets/{id} → { data: {...} }
  async get(id: string): Promise<Ticket> {
    const res = await api<LaravelResponse<LaravelTicket>>(`/tickets/${id}`)
    return laravelToTicket(res.data)
  },

  // POST /api/tickets → { data: TicketDTO }
  // Laravel requires department_id (integer) and priority as low|medium|high
  async create(payload: CreateTicketPayload): Promise<Ticket> {
    const deptId = DEPT_ID_MAP[payload.department] ?? DEPT_ID_MAP.general
    const res = await api<LaravelResponse<LaravelTicket>>('/tickets', {
      method: 'POST',
      body: {
        subject:       payload.subject,
        department_id: deptId,
        priority:      toApiPriority(payload.priority),
        message:       payload.message,
      },
    })
    return laravelToTicket(res.data)
  },

  // POST /api/tickets/{id}/reply → { data: TicketDTO }
  async reply(payload: ReplyTicketPayload): Promise<Ticket> {
    const res = await api<LaravelResponse<LaravelTicket>>(
      `/tickets/${payload.ticketId}/reply`,
      { method: 'POST', body: { message: payload.message } }
    )
    return laravelToTicket(res.data)
  },

  // POST /api/tickets/{id}/close → { data: null, message }
  // Laravel returns no ticket body on close — fetch fresh state instead
  async close(id: string): Promise<Ticket> {
    await api(`/tickets/${id}/close`, { method: 'POST' })
    return this.get(id)
  },
}
