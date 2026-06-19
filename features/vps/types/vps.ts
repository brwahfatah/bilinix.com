// VPS domain types — the single source of truth for this feature.
// All components, stores, and services import from here.

export type VpsStatus =
  | 'running'
  | 'stopped'
  | 'rebooting'
  | 'provisioning'
  | 'error'
  | 'suspended'

export type VpsPowerAction = 'start' | 'stop' | 'reboot' | 'destroy'

export interface VpsSpec {
  cpu: number       // vCPU count
  ramGb: number
  diskGb: number
  bandwidthTb: number
}

export interface Vps {
  id: string
  name: string
  status: VpsStatus
  ip: string | null
  ipv6: string | null
  os: string
  region: string
  plan: string
  spec: VpsSpec
  createdAt: string
  expiresAt: string
  monthlyPrice: number
}

export interface VpsPowerHistory {
  action: VpsPowerAction
  performedAt: string
  initiatedBy: string
}

// Shape of the order form — ready for a wizard UI
export interface CreateVpsPayload {
  name: string
  planId: string
  regionId: string
  osId: string
  sshKeyIds: string[]
}
