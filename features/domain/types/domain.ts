export type DomainStatus =
  | 'active'
  | 'expired'
  | 'pending-transfer'
  | 'pending-registration'
  | 'suspended'
  | 'grace-period'
  | 'redemption'

export type DomainAutoRenew = 'enabled' | 'disabled'

export interface DomainContact {
  name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
}

export interface Domain {
  id: string
  name: string
  tld: string
  status: DomainStatus
  autoRenew: DomainAutoRenew
  registeredAt: string
  expiresAt: string
  nameservers: string[]
  registrantContact: DomainContact
  locked: boolean
  privacyProtection: boolean
  annualPrice: number
}

export interface UpdateDomainPayload {
  autoRenew?: DomainAutoRenew
  locked?: boolean
  privacyProtection?: boolean
  nameservers?: string[]
}
