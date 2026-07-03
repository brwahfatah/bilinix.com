export type HostingStatus = 'active' | 'pending' | 'suspended' | 'terminated'

export interface HostingAccount {
  id: string
  plan: string
  domain: string
  status: HostingStatus
  billingCycle: string
  registrationDate: string
  nextDueDate: string
  recurringAmount: string
  serverHostname: string
  diskUsage: number
  diskLimit: number
  bwUsage: number
  bwLimit: number
  username: string
  controlPanelUrl: string
}

export interface HostingInvoice {
  id: number
  status: string
  date: string
  dueDate: string
  datePaid: string
  total: string
  description: string
}
