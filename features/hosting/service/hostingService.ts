import type { HostingAccount, HostingInvoice, HostingStatus } from '../types/hosting'
import { api } from '~/utils/apiClient'

interface LaravelHosting {
  id: string
  plan: string
  domain: string
  status: string
  billing_cycle: string
  registration_date: string
  next_due_date: string
  recurring_amount: string
  server_hostname: string
  disk_usage: number
  disk_limit: number
  bw_usage: number
  bw_limit: number
  username: string
  control_panel_url: string
}

interface LaravelInvoice {
  id: number
  status: string
  date: string
  due_date: string
  date_paid: string
  total: string
  description: string
}

interface LaravelResponse<T> {
  data: T
  message: string
  errors: null
}

function normalizeStatus(raw: string): HostingStatus {
  const s = raw.toLowerCase()
  if (s === 'active') return 'active'
  if (s === 'suspended') return 'suspended'
  if (s === 'terminated' || s === 'cancelled') return 'terminated'
  return 'pending'
}

function laravelToHosting(h: LaravelHosting): HostingAccount {
  return {
    id: String(h.id),
    plan: h.plan || 'Hosting Plan',
    domain: h.domain || '',
    status: normalizeStatus(h.status),
    billingCycle: h.billing_cycle || '',
    registrationDate: h.registration_date || '',
    nextDueDate: h.next_due_date || '',
    recurringAmount: h.recurring_amount || '0.00',
    serverHostname: h.server_hostname || '',
    diskUsage: h.disk_usage || 0,
    diskLimit: h.disk_limit || 0,
    bwUsage: h.bw_usage || 0,
    bwLimit: h.bw_limit || 0,
    username: h.username || '',
    controlPanelUrl: h.control_panel_url || '',
  }
}

export const hostingService = {
  async list(): Promise<HostingAccount[]> {
    const res = await api<LaravelResponse<LaravelHosting[]>>('/hosting')
    return (Array.isArray(res.data) ? res.data : []).map(laravelToHosting)
  },

  async get(id: string): Promise<HostingAccount> {
    const res = await api<LaravelResponse<LaravelHosting>>(`/hosting/${id}`)
    return laravelToHosting(res.data)
  },

  async invoices(id: string): Promise<HostingInvoice[]> {
    const res = await api<LaravelResponse<LaravelInvoice[]>>(`/hosting/${id}/invoices`)
    return (Array.isArray(res.data) ? res.data : []).map((inv) => ({
      id: inv.id,
      status: inv.status || '',
      date: inv.date || '',
      dueDate: inv.due_date || '',
      datePaid: inv.date_paid || '',
      total: inv.total || '0.00',
      description: inv.description || '',
    }))
  },
}
