<script setup lang="ts">
import type { HostingAccount } from '../types/hosting'
import type { Column } from '~/core/ui/AppDataTable.vue'

defineProps<{
  accounts: HostingAccount[]
  loading?: boolean
}>()

const emit = defineEmits<{
  manage: [id: string]
}>()

const columns: Column<HostingAccount>[] = [
  { key: 'plan', label: 'Plan', sortable: true },
  { key: 'domain', label: 'Domain' },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'billingCycle', label: 'Billing' },
  { key: 'nextDueDate', label: 'Next Due' },
]

function formatDate(iso: string): string {
  if (!iso || iso === '0000-00-00') return '-'
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <AppDataTable
    :columns="columns"
    :rows="accounts"
    :loading="loading"
    row-key="id"
    clickable
    @row-click="emit('manage', $event.id)"
  >
    <template #cell-plan="{ row }">
      <div>
        <p class="font-bold text-slate-950 dark:text-white">{{ row.plan }}</p>
        <p v-if="row.recurringAmount !== '0.00'" class="mt-0.5 text-xs text-slate-400">${{ row.recurringAmount }}/{{ row.billingCycle.toLowerCase() === 'annually' ? 'yr' : 'mo' }}</p>
      </div>
    </template>

    <template #cell-domain="{ row }">
      <span class="text-sm" :class="row.domain ? 'font-medium text-slate-700 dark:text-slate-300' : 'text-slate-400'">
        {{ row.domain || 'No domain set' }}
      </span>
    </template>

    <template #cell-status="{ row }">
      <AppStatusBadge :status="row.status" dot />
    </template>

    <template #cell-billingCycle="{ row }">
      <span class="text-sm text-slate-600 dark:text-slate-300">{{ row.billingCycle }}</span>
    </template>

    <template #cell-nextDueDate="{ row }">
      <span class="text-sm text-slate-600 dark:text-slate-300">{{ formatDate(row.nextDueDate) }}</span>
    </template>

    <template #actions="{ row }">
      <div class="flex items-center justify-end gap-2">
        <AppButton variant="outline" size="sm" @click.stop="emit('manage', row.id)">
          Manage
        </AppButton>
        <a
          v-if="row.controlPanelUrl && row.status === 'active'"
          :href="row.controlPanelUrl"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:hover:bg-emerald-400/20"
          @click.stop
        >
          Control Panel
          <svg class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>
      </div>
    </template>

    <template #empty>
      <AppEmptyState
        icon="server"
        title="No hosting accounts yet"
        description="Order a hosting plan and it will appear here after provisioning."
      >
        <template #actions>
          <AppButton @click="navigateTo('/hosting')">Browse Plans</AppButton>
        </template>
      </AppEmptyState>
    </template>
  </AppDataTable>
</template>
