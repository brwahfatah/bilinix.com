import type { Domain, DomainStatus, DomainContact, UpdateDomainPayload } from '../types/domain'
import { api } from '~/utils/apiClient'

// Shape returned by GET /api/domains and GET /api/domains/{id} (DomainDTO::toArray())
interface LaravelDomain {
  id: string
  domain: string
  status: string
  expiry_date: string | null
  auto_renew: boolean
  locked: boolean
  id_protection: boolean
  nameservers: string[]
  registrant: {
    name: string
    email: string
    country: string
  } | null
  created_at: string
}

// All Laravel API responses: { data, message, errors }
interface LaravelResponse<T> {
  data: T
  message: string
  errors: null
}

function normalizeDomainStatus(raw: string): DomainStatus {
  const s = raw.toLowerCase().replace(/\s+/g, '-')
  if (s === 'active') return 'active'
  if (s === 'expired') return 'expired'
  if (s.includes('grace')) return 'grace-period'
  if (s.includes('redemption')) return 'redemption'
  if (s.includes('transfer')) return 'pending-transfer'
  if (s.includes('pending')) return 'pending-registration'
  if (s === 'suspended' || s === 'cancelled') return 'suspended'
  return 'active'
}

function extractTld(domain: string): string {
  const parts = domain.split('.')
  return parts.length >= 2 ? `.${parts[parts.length - 1]}` : ''
}

function laravelToDomain(d: LaravelDomain): Domain {
  const contact: DomainContact = {
    name: d.registrant?.name || '',
    email: d.registrant?.email || '',
    phone: '',
    address: '',
    city: '',
    country: d.registrant?.country || '',
  }

  const nameservers =
    Array.isArray(d.nameservers) && d.nameservers.length >= 2
      ? d.nameservers
      : ['ns1.beeliin.com', 'ns2.beeliin.com']

  return {
    id: String(d.id),
    name: d.domain,
    tld: extractTld(d.domain),
    status: normalizeDomainStatus(d.status),
    autoRenew: d.auto_renew ? 'enabled' : 'disabled',
    registeredAt: d.created_at,
    expiresAt: d.expiry_date ?? d.created_at,
    nameservers,
    registrantContact: contact,
    locked: d.locked,
    privacyProtection: d.id_protection,
    annualPrice: 0,
  }
}

export const domainService = {
  // GET /api/domains → { data: [...] }
  async list(): Promise<Domain[]> {
    const res = await api<LaravelResponse<LaravelDomain[]>>('/domains')
    const raw = Array.isArray(res.data) ? res.data : []
    return raw.map(laravelToDomain)
  },

  // GET /api/domains/{id} → { data: {...} }
  async get(id: string): Promise<Domain> {
    const res = await api<LaravelResponse<LaravelDomain>>(`/domains/${id}`)
    return laravelToDomain(res.data)
  },

  // Laravel has separate endpoints for each mutation — no single PATCH /domains/{id}.
  // We call only what changed, then fetch the final state.
  async update(id: string, payload: UpdateDomainPayload): Promise<Domain> {
    const current = await this.get(id)
    const calls: Promise<any>[] = []

    // Auto-renew: toggle only when desired state differs from current
    if (payload.autoRenew !== undefined) {
      const wantEnabled = payload.autoRenew === 'enabled'
      const currentEnabled = current.autoRenew === 'enabled'
      if (wantEnabled !== currentEnabled) {
        calls.push(api(`/domains/${id}/auto-renew`, { method: 'POST' }))
      }
    }

    // Lock state: use explicit lock/unlock endpoints
    if (payload.locked === true) {
      calls.push(api(`/domains/${id}/lock`, { method: 'POST' }))
    } else if (payload.locked === false) {
      calls.push(api(`/domains/${id}/unlock`, { method: 'POST' }))
    }

    // Nameservers
    if (payload.nameservers && payload.nameservers.length >= 2) {
      calls.push(
        api(`/domains/${id}/nameservers`, {
          method: 'PATCH',
          body: { nameservers: payload.nameservers },
        })
      )
    }

    // privacyProtection: no Laravel endpoint exists — not yet supported

    if (calls.length > 0) await Promise.all(calls)
    return this.get(id)
  },

  // POST /api/domains/{id}/renew → { data: DomainDTO }
  async renew(id: string): Promise<Domain> {
    const res = await api<LaravelResponse<LaravelDomain>>(`/domains/${id}/renew`, {
      method: 'POST',
    })
    return laravelToDomain(res.data)
  },
}
