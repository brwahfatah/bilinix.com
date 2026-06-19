// VPS Domain Entity
// This is the business model — NOT the API response shape.
// It owns all business rules about what a VPS can do.
// The service layer maps API responses → VpsEntity instances.

import type { Vps, VpsStatus, VpsPowerAction } from '~/features/vps/types/vps'

export class VpsEntity {
  readonly id: string
  readonly name: string
  readonly status: VpsStatus
  readonly ip: string | null
  readonly ipv6: string | null
  readonly os: string
  readonly region: string
  readonly plan: string
  readonly spec: Vps['spec']
  readonly createdAt: Date
  readonly expiresAt: Date
  readonly monthlyPrice: number

  constructor(data: Vps) {
    this.id = data.id
    this.name = data.name
    this.status = data.status
    this.ip = data.ip
    this.ipv6 = data.ipv6
    this.os = data.os
    this.region = data.region
    this.plan = data.plan
    this.spec = data.spec
    this.createdAt = new Date(data.createdAt)
    this.expiresAt = new Date(data.expiresAt)
    this.monthlyPrice = data.monthlyPrice
  }

  // ---------------------------------------------------------------------------
  // State predicates — used in templates and use cases
  // ---------------------------------------------------------------------------

  get isRunning(): boolean {
    return this.status === 'running'
  }

  get isStopped(): boolean {
    return this.status === 'stopped'
  }

  get isProvisioning(): boolean {
    return this.status === 'provisioning'
  }

  get isRebooting(): boolean {
    return this.status === 'rebooting'
  }

  get isInTransition(): boolean {
    return this.status === 'provisioning' || this.status === 'rebooting'
  }

  get isSuspended(): boolean {
    return this.status === 'suspended'
  }

  get hasError(): boolean {
    return this.status === 'error'
  }

  // ---------------------------------------------------------------------------
  // Power action eligibility — UI uses these to enable/disable buttons
  // ---------------------------------------------------------------------------

  get canStart(): boolean {
    return this.isStopped || this.hasError
  }

  get canStop(): boolean {
    return this.isRunning
  }

  get canReboot(): boolean {
    return this.isRunning
  }

  get canDestroy(): boolean {
    // Cannot destroy a server that is actively provisioning
    return !this.isProvisioning
  }

  availableActions(): VpsPowerAction[] {
    const actions: VpsPowerAction[] = []
    if (this.canStart) actions.push('start')
    if (this.canReboot) actions.push('reboot')
    if (this.canStop) actions.push('stop')
    if (this.canDestroy) actions.push('destroy')
    return actions
  }

  // ---------------------------------------------------------------------------
  // Business computed values
  // ---------------------------------------------------------------------------

  get daysUntilExpiry(): number {
    return Math.ceil((this.expiresAt.getTime() - Date.now()) / 86_400_000)
  }

  get isExpiringSoon(): boolean {
    return this.daysUntilExpiry <= 7 && this.daysUntilExpiry > 0
  }

  get isExpired(): boolean {
    return this.daysUntilExpiry <= 0
  }

  get displayAddress(): string {
    return this.ip ?? (this.isProvisioning ? 'Provisioning…' : 'N/A')
  }

  get specSummary(): string {
    return `${this.spec.cpu} vCPU · ${this.spec.ramGb}GB RAM · ${this.spec.diskGb}GB SSD`
  }

  // ---------------------------------------------------------------------------
  // Factory — creates entity from raw API/service response
  // ---------------------------------------------------------------------------
  static from(data: Vps): VpsEntity {
    return new VpsEntity(data)
  }

  // Serialize back to plain object for store storage (Pinia cannot store class instances)
  toPlain(): Vps {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
      ip: this.ip,
      ipv6: this.ipv6,
      os: this.os,
      region: this.region,
      plan: this.plan,
      spec: this.spec,
      createdAt: this.createdAt.toISOString(),
      expiresAt: this.expiresAt.toISOString(),
      monthlyPrice: this.monthlyPrice,
    }
  }
}
