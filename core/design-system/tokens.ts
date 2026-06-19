// Single source of truth for all design decisions.
// Every component, store, and page imports from here — never defines its own colors.

// ---------------------------------------------------------------------------
// STATUS SYSTEM
// The canonical map for every status value across VPS, domains, invoices, tickets.
// ---------------------------------------------------------------------------

export type StatusVariant =
  | 'success'    // running, active, paid, enabled, available
  | 'warning'    // pending, provisioning, rebooting, unpaid, suspended
  | 'danger'     // error, expired, terminated, cancelled, failed
  | 'neutral'    // unknown, stopped, inactive

export interface StatusToken {
  variant: StatusVariant
  dot: string        // Tailwind class for the indicator dot
  badge: string      // Tailwind classes for badge background + text
  text: string       // Tailwind class for standalone text
  label: string      // Display label
  animated?: boolean // Whether the dot should pulse
}

export const STATUS_MAP: Record<string, StatusToken> = {
  // ── Success states ──────────────────────────────────────────────────────
  running:     { variant: 'success', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20', text: 'text-emerald-700 dark:text-emerald-400', label: 'Running' },
  active:      { variant: 'success', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20', text: 'text-emerald-700 dark:text-emerald-400', label: 'Active' },
  paid:        { variant: 'success', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20', text: 'text-emerald-700 dark:text-emerald-400', label: 'Paid' },
  enabled:     { variant: 'success', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20', text: 'text-emerald-700 dark:text-emerald-400', label: 'Enabled' },
  available:   { variant: 'success', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20', text: 'text-emerald-700 dark:text-emerald-400', label: 'Available' },
  open:        { variant: 'success', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20', text: 'text-emerald-700 dark:text-emerald-400', label: 'Open' },

  // ── Warning states ───────────────────────────────────────────────────────
  provisioning: { variant: 'warning', dot: 'bg-sky-500',    badge: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/20',       text: 'text-sky-700 dark:text-sky-400',    label: 'Provisioning', animated: true },
  rebooting:    { variant: 'warning', dot: 'bg-amber-500',  badge: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20', text: 'text-amber-700 dark:text-amber-400', label: 'Rebooting',    animated: true },
  pending:      { variant: 'warning', dot: 'bg-amber-500',  badge: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20', text: 'text-amber-700 dark:text-amber-400', label: 'Pending' },
  unpaid:       { variant: 'warning', dot: 'bg-amber-500',  badge: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20', text: 'text-amber-700 dark:text-amber-400', label: 'Unpaid' },
  suspended:    { variant: 'warning', dot: 'bg-orange-500', badge: 'bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-400/10 dark:text-orange-300 dark:ring-orange-400/20', text: 'text-orange-700 dark:text-orange-400', label: 'Suspended' },
  'in-progress':          { variant: 'warning', dot: 'bg-sky-500',   badge: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/20',             text: 'text-sky-700 dark:text-sky-400',    label: 'In Progress', animated: true },
  answered:               { variant: 'warning', dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20', text: 'text-amber-700 dark:text-amber-400', label: 'Answered' },
  'pending-transfer':     { variant: 'warning', dot: 'bg-sky-500',   badge: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/20',             text: 'text-sky-700 dark:text-sky-400',    label: 'Pending Transfer', animated: true },
  'pending-registration': { variant: 'warning', dot: 'bg-sky-500',   badge: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/20',             text: 'text-sky-700 dark:text-sky-400',    label: 'Pending', animated: true },
  'grace-period':         { variant: 'warning', dot: 'bg-orange-500', badge: 'bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-400/10 dark:text-orange-300 dark:ring-orange-400/20', text: 'text-orange-700 dark:text-orange-400', label: 'Grace Period' },
  redemption:             { variant: 'danger',  dot: 'bg-rose-500',  badge: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20',         text: 'text-rose-700 dark:text-rose-400',   label: 'Redemption' },

  // ── Danger states ────────────────────────────────────────────────────────
  error:       { variant: 'danger', dot: 'bg-rose-500', badge: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20',     text: 'text-rose-700 dark:text-rose-400',   label: 'Error' },
  expired:     { variant: 'danger', dot: 'bg-rose-500', badge: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20',     text: 'text-rose-700 dark:text-rose-400',   label: 'Expired' },
  cancelled:   { variant: 'danger', dot: 'bg-rose-500', badge: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20',     text: 'text-rose-700 dark:text-rose-400',   label: 'Cancelled' },
  terminated:  { variant: 'danger', dot: 'bg-rose-500', badge: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20',     text: 'text-rose-700 dark:text-rose-400',   label: 'Terminated' },
  failed:      { variant: 'danger', dot: 'bg-rose-500', badge: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20',     text: 'text-rose-700 dark:text-rose-400',   label: 'Failed' },
  taken:       { variant: 'danger', dot: 'bg-rose-500', badge: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20',     text: 'text-rose-700 dark:text-rose-400',   label: 'Taken' },
  overdue:     { variant: 'danger', dot: 'bg-rose-500', badge: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20',     text: 'text-rose-700 dark:text-rose-400',   label: 'Overdue' },
  closed:      { variant: 'danger', dot: 'bg-rose-500', badge: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20',     text: 'text-rose-700 dark:text-rose-400',   label: 'Closed' },

  // ── Neutral states ───────────────────────────────────────────────────────
  stopped:     { variant: 'neutral', dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-700 ring-slate-600/10 dark:bg-slate-800 dark:text-slate-300 dark:ring-white/10',   text: 'text-slate-600 dark:text-slate-400', label: 'Stopped' },
  inactive:    { variant: 'neutral', dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-700 ring-slate-600/10 dark:bg-slate-800 dark:text-slate-300 dark:ring-white/10',   text: 'text-slate-600 dark:text-slate-400', label: 'Inactive' },
  unknown:     { variant: 'neutral', dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-700 ring-slate-600/10 dark:bg-slate-800 dark:text-slate-300 dark:ring-white/10',   text: 'text-slate-600 dark:text-slate-400', label: 'Unknown' },
}

export const FALLBACK_STATUS: StatusToken = {
  variant: 'neutral',
  dot: 'bg-slate-400',
  badge: 'bg-slate-100 text-slate-700 ring-slate-600/10 dark:bg-slate-800 dark:text-slate-300 dark:ring-white/10',
  text: 'text-slate-600 dark:text-slate-400',
  label: 'Unknown',
}

export function getStatusToken(status: string | null | undefined): StatusToken {
  if (!status) return FALLBACK_STATUS
  return STATUS_MAP[status.toLowerCase()] ?? { ...FALLBACK_STATUS, label: status }
}

// ---------------------------------------------------------------------------
// BUTTON VARIANTS
// ---------------------------------------------------------------------------

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

export const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:   'bg-emerald-600 text-white hover:bg-emerald-500 focus-visible:ring-emerald-500',
  secondary: 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 focus-visible:ring-slate-500',
  danger:    'bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-rose-500',
  ghost:     'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 focus-visible:ring-slate-500',
  outline:   'border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 focus-visible:ring-slate-500',
}

export const BUTTON_SIZES: Record<ButtonSize, string> = {
  xs: 'h-7 px-2.5 text-xs rounded-lg gap-1',
  sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
  md: 'h-10 px-4 text-sm rounded-xl gap-2',
  lg: 'h-12 px-5 text-sm rounded-xl gap-2',
}

// ---------------------------------------------------------------------------
// SPACING / LAYOUT TOKENS
// ---------------------------------------------------------------------------

export const PAGE_PADDING = 'px-4 py-8 sm:px-6 lg:px-8'
export const CARD_BASE = 'rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900'
export const CARD_HOVER = 'transition hover:-translate-y-0.5 hover:shadow-card-hover'
export const TABLE_HEADER = 'bg-slate-50 text-left text-xs font-black uppercase tracking-widest text-slate-400 dark:bg-slate-950'
export const TABLE_CELL = 'px-6 py-4 text-sm'
export const TABLE_ROW_HOVER = 'transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30'
