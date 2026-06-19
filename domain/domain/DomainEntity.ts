import type { Domain, DomainStatus } from '~/features/domain/types/domain'

export class DomainEntity {
  readonly id: string
  readonly name: string
  readonly tld: string
  readonly status: DomainStatus
  readonly autoRenew: Domain['autoRenew']
  readonly registeredAt: Date
  readonly expiresAt: Date
  readonly nameservers: string[]
  readonly registrantContact: Domain['registrantContact']
  readonly locked: boolean
  readonly privacyProtection: boolean
  readonly annualPrice: number

  constructor(data: Domain) {
    this.id = data.id
    this.name = data.name
    this.tld = data.tld
    this.status = data.status
    this.autoRenew = data.autoRenew
    this.registeredAt = new Date(data.registeredAt)
    this.expiresAt = new Date(data.expiresAt)
    this.nameservers = [...data.nameservers]
    this.registrantContact = data.registrantContact
    this.locked = data.locked
    this.privacyProtection = data.privacyProtection
    this.annualPrice = data.annualPrice
  }

  // ---------------------------------------------------------------------------
  // Status predicates
  // ---------------------------------------------------------------------------

  get isActive(): boolean {
    return this.status === 'active'
  }

  get isExpired(): boolean {
    return this.status === 'expired'
  }

  get isPending(): boolean {
    return this.status === 'pending-registration' || this.status === 'pending-transfer'
  }

  get isSuspended(): boolean {
    return this.status === 'suspended'
  }

  get isInGracePeriod(): boolean {
    return this.status === 'grace-period'
  }

  // ---------------------------------------------------------------------------
  // Business computed values
  // ---------------------------------------------------------------------------

  get daysUntilExpiry(): number {
    return Math.ceil((this.expiresAt.getTime() - Date.now()) / 86_400_000)
  }

  get isExpiringSoon(): boolean {
    return this.daysUntilExpiry <= 30 && this.daysUntilExpiry > 0 && this.isActive
  }

  get isAutoRenewEnabled(): boolean {
    return this.autoRenew === 'enabled'
  }

  get fullName(): string {
    return this.name
  }

  // ---------------------------------------------------------------------------
  // Action eligibility
  // ---------------------------------------------------------------------------

  get canRenew(): boolean {
    return this.isExpired || this.isActive || this.isInGracePeriod
  }

  get canToggleLock(): boolean {
    return this.isActive
  }

  get canEditNameservers(): boolean {
    return this.isActive
  }

  // ---------------------------------------------------------------------------
  // Factory
  // ---------------------------------------------------------------------------

  static from(data: Domain | null | undefined): DomainEntity | null {
    if (!data) return null
    return new DomainEntity(data)
  }
}
