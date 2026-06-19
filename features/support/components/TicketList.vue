<script setup lang="ts">
import type { Column } from '~/core/ui/AppDataTable.vue'
import type { Ticket } from '../types/ticket'

defineProps<{
  tickets: Ticket[]
  loading?: boolean
}>()

const emit = defineEmits<{
  view: [ticket: Ticket]
}>()

// ---------------------------------------------------------------------------
// Priority display config (support-specific, not in global tokens)
// ---------------------------------------------------------------------------
const PRIORITY_CONFIG: Record<string, { badge: string; label: string }> = {
  low:    { badge: 'bg-slate-100 text-slate-600 ring-slate-600/10 dark:bg-slate-800 dark:text-slate-300 dark:ring-white/10', label: 'Low' },
  normal: { badge: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/20', label: 'Normal' },
  high:   { badge: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20', label: 'High' },
  urgent: { badge: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20', label: 'Urgent' },
}

const DEPARTMENT_LABEL: Record<string, string> = {
  technical: 'Technical',
  billing:   'Billing',
  sales:     'Sales',
  general:   'General',
}

const COLUMNS: Column<Ticket>[] = [
  { key: 'subject',    label: 'Subject',     sortable: false },
  { key: 'priority',   label: 'Priority',    sortable: false, align: 'center' },
  { key: 'status',     label: 'Status',      sortable: false, align: 'center' },
  { key: 'updatedAt',  label: 'Last Updated', sortable: true, align: 'right' },
]

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3_600_000)
  const d = Math.floor(h / 24)
  if (h < 1) return 'Just now'
  if (d < 1) return `${h}h ago`
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<template>
  <AppDataTable
    :columns="COLUMNS"
    :rows="tickets"
    :loading="loading"
    :skeleton-rows="4"
    row-key="id"
    clickable
    @row-click="emit('view', $event)"
  >
    <!-- Subject column — ticket ID + subject + department tag -->
    <template #cell-subject="{ row }">
      <div class="flex flex-col gap-0.5">
        <span class="font-bold text-slate-950 dark:text-white">{{ row.subject }}</span>
        <div class="flex items-center gap-2">
          <span class="font-mono text-xs text-slate-400">{{ row.id.toUpperCase() }}</span>
          <span class="text-xs text-slate-400">·</span>
          <span class="text-xs text-slate-400">{{ DEPARTMENT_LABEL[row.department] }}</span>
          <span class="text-xs text-slate-400">·</span>
          <span class="text-xs text-slate-400">{{ row.messages.length }} message{{ row.messages.length !== 1 ? 's' : '' }}</span>
        </div>
      </div>
    </template>

    <!-- Priority badge -->
    <template #cell-priority="{ value }">
      <span
        class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1"
        :class="(PRIORITY_CONFIG[value as string] ?? PRIORITY_CONFIG['normal'])!.badge"
      >
        {{ (PRIORITY_CONFIG[value as string] ?? PRIORITY_CONFIG['normal'])!.label }}
      </span>
    </template>

    <!-- Status badge — reuses global AppStatusBadge -->
    <template #cell-status="{ value }">
      <AppStatusBadge :status="value as string" />
    </template>

    <!-- Last updated — human-readable -->
    <template #cell-updatedAt="{ value }">
      <span class="text-slate-500 dark:text-slate-400">{{ relativeDate(value as string) }}</span>
    </template>

    <!-- Empty state -->
    <template #empty>
      <AppEmptyState
        icon="ticket"
        title="No support tickets"
        description="Open a ticket and our team will get back to you within a few hours."
      />
    </template>
  </AppDataTable>
</template>
