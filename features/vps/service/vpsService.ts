import type { Vps, VpsPowerAction, VpsStatus, CreateVpsPayload } from '../types/vps'
import { api } from '~/utils/apiClient'

// Shape returned by GET /api/vps and GET /api/vps/{id} (VpsDTO::toArray())
interface LaravelVps {
  id: string
  label: string      // display name — mapped from WHMCS domain/domainalias
  status: string     // 'active' | 'suspended' | 'terminated' | 'pending' etc.
  cpu: string        // e.g. "2" or "2 vCores" — may include unit suffix
  ram: string        // e.g. "4" or "4GB"
  disk: string       // e.g. "50" or "50GB"
  ip: string
  location: string | null
  expires_at: string | null
  created_at: string
}

// All Laravel API responses are wrapped: { data, message, errors }
interface LaravelResponse<T> {
  data: T
  message: string
  errors: null
}

function normalizeVpsStatus(raw: string): VpsStatus {
  const s = raw.toLowerCase()
  if (s === 'active' || s === 'running') return 'running'
  if (s === 'suspended' || s === 'stopped') return 'stopped'
  if (s === 'rebooting') return 'rebooting'
  if (s === 'provisioning' || s === 'pending') return 'provisioning'
  return 'error'
}

function parseIntFromSpec(v: string): number {
  const n = parseInt(String(v ?? '0'))
  return Number.isFinite(n) && n > 0 ? n : 0
}

function laravelToVps(v: LaravelVps): Vps {
  const cpu = parseIntFromSpec(v.cpu)
  const ram = parseIntFromSpec(v.ram)
  const disk = parseIntFromSpec(v.disk)

  return {
    id: String(v.id),
    name: v.label,
    status: normalizeVpsStatus(v.status),
    ip: v.ip || null,
    ipv6: null,
    os: 'Linux',
    region: v.location || '',
    plan: [
      cpu  > 0 ? `${cpu} vCPU`   : null,
      ram  > 0 ? `${ram}GB RAM`  : null,
      disk > 0 ? `${disk}GB`     : null,
    ].filter(Boolean).join(' / ') || 'N/A',
    spec: {
      cpu,
      ramGb: ram,
      diskGb: disk,
      bandwidthTb: 0,
    },
    createdAt: v.created_at,
    expiresAt: v.expires_at ?? v.created_at,
    monthlyPrice: 0,
  }
}

export const vpsService = {
  // GET /api/vps → { data: [...] }
  async list(): Promise<Vps[]> {
    const res = await api<LaravelResponse<LaravelVps[]>>('/vps')
    return (Array.isArray(res.data) ? res.data : []).map(laravelToVps)
  },

  // GET /api/vps/{id} → { data: {...} }
  async get(id: string): Promise<Vps> {
    const res = await api<LaravelResponse<LaravelVps>>(`/vps/${id}`)
    return laravelToVps(res.data)
  },

  // start/stop/reboot: POST /api/vps/{id}/{action} → { data: VpsDTO }
  // destroy: DELETE /api/vps/{id} → { data: null }
  async powerAction(id: string, action: VpsPowerAction): Promise<Vps> {
    if (action === 'destroy') {
      await api(`/vps/${id}`, { method: 'DELETE' })
      // VPS is terminated — return its last known state with error status
      return { ...(await this.get(id).catch(() => ({ id, name: id, status: 'error' as VpsStatus, ip: null, ipv6: null, os: 'Linux', region: '', plan: 'N/A', spec: { cpu: 0, ramGb: 0, diskGb: 0, bandwidthTb: 0 }, createdAt: new Date().toISOString(), expiresAt: new Date().toISOString(), monthlyPrice: 0 }))), status: 'error' as VpsStatus }
    }
    const res = await api<LaravelResponse<LaravelVps>>(`/vps/${id}/${action}`, { method: 'POST' })
    return laravelToVps(res.data)
  },

  // No rename endpoint in Laravel API
  async rename(_id: string, _name: string): Promise<Vps> {
    throw new Error('VPS rename is not supported by the API.')
  },

  // VPS creation goes through the order/checkout flow — not a direct call
  async create(_payload: CreateVpsPayload): Promise<Vps> {
    throw new Error('VPS creation uses the cart checkout flow.')
  },

  // DELETE /api/vps/{id}
  async destroy(id: string): Promise<void> {
    await api(`/vps/${id}`, { method: 'DELETE' })
  },
}
