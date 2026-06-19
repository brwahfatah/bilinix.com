import type { AppEventName } from '~/types/events'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DashboardActivity {
  id: string
  type: AppEventName
  label: string
  meta?: string
  timestamp: Date
}

const ACTIVITY_CONFIG: Partial<Record<string, {
  icon: string
  iconBg: string
  iconColor: string
}>> = {
  'vps:created': {
    icon: 'M21.75 17.25v.75a3 3 0 01-3 3H5.25a3 3 0 01-3-3v-.75m16.5-7.5v.75a3 3 0 01-3 3H5.25a3 3 0 01-3-3v-.75m16.5-7.5v.75a3 3 0 01-3 3H5.25a3 3 0 01-3-3V2.25m16.5 0H5.25',
    iconBg: 'bg-emerald-100 dark:bg-emerald-400/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  'vps:destroyed': {
    icon: 'M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0',
    iconBg: 'bg-rose-100 dark:bg-rose-400/20',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  'vps:power-action': {
    icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z',
    iconBg: 'bg-sky-100 dark:bg-sky-400/20',
    iconColor: 'text-sky-600 dark:text-sky-400',
  },
  'vps:renamed': {
    icon: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10',
    iconBg: 'bg-slate-100 dark:bg-slate-800',
    iconColor: 'text-slate-600 dark:text-slate-400',
  },
  'invoice:paid': {
    icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    iconBg: 'bg-emerald-100 dark:bg-emerald-400/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  'ticket:created': {
    icon: 'M16.5 6v.75a3.75 3.75 0 01-7.5 0V6a3.75 3.75 0 017.5 0zM11.25 3h1.5m-1.5 0A3.75 3.75 0 007.5 6.75m3.75-3.75A3.75 3.75 0 0116.5 6.75M3 16.5v1.875C3 19.26 3.74 20 4.625 20H19.5c.864 0 1.5-.614 1.5-1.5V16.5m-18 0V12m18 4.5V12m-18 0V8.25C3 7.26 3.74 6.5 4.625 6.5H7.5m12 5.75v-5c0-.966-.8-1.75-1.75-1.75H16.5',
    iconBg: 'bg-violet-100 dark:bg-violet-400/20',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  'ticket:replied': {
    icon: 'M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z',
    iconBg: 'bg-sky-100 dark:bg-sky-400/20',
    iconColor: 'text-sky-600 dark:text-sky-400',
  },
  'ticket:closed': {
    icon: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    iconBg: 'bg-slate-100 dark:bg-slate-800',
    iconColor: 'text-slate-500 dark:text-slate-400',
  },
}

const FALLBACK_ACTIVITY_CONFIG = {
  icon: 'M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18',
  iconBg: 'bg-slate-100 dark:bg-slate-800',
  iconColor: 'text-slate-500 dark:text-slate-400',
}

// Pre-seeded history so feed is never empty on first load
const SEED_ACTIVITIES: DashboardActivity[] = [
  { id: 'seed-1', type: 'vps:created', label: 'VPS "web-prod-01" deployed', meta: 'Frankfurt, DE', timestamp: new Date(Date.now() - 2 * 3600_000) },
  { id: 'seed-2', type: 'invoice:paid', label: 'Invoice INV-2025-001 paid', meta: '$43.97', timestamp: new Date(Date.now() - 5 * 3600_000) },
  { id: 'seed-3', type: 'vps:power-action', label: 'VPS "db-staging" stopped', meta: 'Amsterdam, NL', timestamp: new Date(Date.now() - 24 * 3600_000) },
  { id: 'seed-4', type: 'vps:created', label: 'VPS "ci-runner-01" provisioning', meta: 'Paris, FR', timestamp: new Date(Date.now() - 48 * 3600_000) },
]

// ---------------------------------------------------------------------------
// Relative time helper
// ---------------------------------------------------------------------------
export function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60_000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (diff < 60_000) return 'just now'
  if (hours < 1) return `${mins}m ago`
  if (days < 1) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------
export function useDashboard() {
  const vpsStore = useVpsStore()
  const billingStore = useBillingStore()
  const domainStore = useDomainStore()
  const auth = useAuthStore()
  const events = useAppEvents()

  // Activity feed — seeded with history, prepended as live events arrive
  const activities = ref<DashboardActivity[]>([...SEED_ACTIVITIES])

  function pushActivity(type: AppEventName, label: string, meta?: string) {
    activities.value.unshift({
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      label,
      meta,
      timestamp: new Date(),
    })
    if (activities.value.length > 20) activities.value.length = 20
  }

  // Auto-cleanup via useAppEvents onBeforeUnmount
  events.on('vps:created', (p) => pushActivity('vps:created', `VPS "${p.name}" deployed`, p.id))
  events.on('vps:destroyed', (p) => pushActivity('vps:destroyed', `VPS "${p.name}" destroyed`, p.id))
  events.on('vps:renamed', (p) => pushActivity('vps:renamed', `VPS renamed to "${p.newName}"`, `was "${p.oldName}"`))
  events.on('vps:power-action', (p) => pushActivity('vps:power-action', `VPS "${p.name}" ${p.action}ed`, p.id))
  events.on('invoice:paid', (p) => pushActivity('invoice:paid', `Invoice ${p.number} paid`, `$${p.amount.toFixed(2)}`))
  events.on('ticket:created', (p) => pushActivity('ticket:created', `Ticket opened: "${p.subject}"`, p.priority))
  events.on('ticket:replied', (p) => pushActivity('ticket:replied', `Reply sent on ticket ${p.id}`))
  events.on('ticket:closed', (p) => pushActivity('ticket:closed', `Ticket closed: "${p.subject}"`))

  // ---------------------------------------------------------------------------
  // Stats (derived from stores — no raw API calls)
  // ---------------------------------------------------------------------------
  const stats = computed(() => ({
    totalVps: vpsStore.items.length,
    activeVps: vpsStore.runningCount,
    totalOutstanding: billingStore.totalOutstanding,
    overdueCount: billingStore.overdueCount,
    totalInvoices: billingStore.totalInvoices,
    unpaidCount: billingStore.items.filter((inv) => inv.status === 'unpaid').length,
    totalDomains: domainStore.items.length,
    expiredDomains: domainStore.expiredCount,
  }))

  // VPS grouped by status for the status overview strip
  const vpsByStatus = computed(() => {
    const map: Record<string, number> = {}
    for (const v of vpsStore.items) {
      map[v.status] = (map[v.status] ?? 0) + 1
    }
    return map
  })

  // Recent invoices — latest 3 by issue date
  const recentInvoices = computed(() =>
    [...billingStore.items]
      .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime())
      .slice(0, 3),
  )

  // Latest VPS (most recently created, up to 5)
  const recentVps = computed(() =>
    [...vpsStore.items]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5),
  )

  // ---------------------------------------------------------------------------
  // Data loading — called once from page via useAsyncData
  // ---------------------------------------------------------------------------
  async function initialize(): Promise<void> {
    await Promise.all([
      vpsStore.fetchList(),
      billingStore.fetchList(),
      domainStore.fetchList(),
    ])
  }

  const isLoading = computed(() => vpsStore.loading || billingStore.loading || domainStore.loading)
  const hasError = computed(() => !!(vpsStore.error || billingStore.error || domainStore.error))

  return {
    // Data
    auth,
    stats,
    vpsByStatus,
    recentVps,
    recentInvoices,
    activities,
    isLoading,
    hasError,

    // Utils
    getActivityConfig: (type: string) => ACTIVITY_CONFIG[type] ?? FALLBACK_ACTIVITY_CONFIG,
    relativeTime,

    // Actions
    initialize,
  }
}
