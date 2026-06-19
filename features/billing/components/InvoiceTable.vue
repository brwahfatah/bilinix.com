<script setup lang="ts">
import { InvoiceEntity } from '~/domain/billing/InvoiceEntity'
import type { Invoice } from '../types/billing'
import type { Column } from '~/core/ui/AppDataTable.vue'

const props = defineProps<{
  invoices: Invoice[]
  loading?: boolean
}>()

const emit = defineEmits<{
  view: [id: string]
  pay: [id: string]
}>()

const store = useBillingStore()

const columns: Column<Invoice>[] = [
  { key: 'number', label: 'Invoice', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'issuedAt', label: 'Date', sortable: true },
  { key: 'dueAt', label: 'Due Date', sortable: true },
  { key: 'amount', label: 'Amount', sortable: true, align: 'right' },
]

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatAmount(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}
</script>

<template>
  <AppDataTable
    :columns="columns"
    :rows="invoices"
    :loading="loading"
    row-key="id"
    clickable
    @row-click="(row) => emit('view', row.id)"
  >
    <!-- Invoice number + item count -->
    <template #cell-number="{ row }">
      <div>
        <p class="font-bold text-slate-950 dark:text-white">{{ row.number }}</p>
        <p class="mt-0.5 text-xs text-slate-400">
          {{ row.items.length }} item{{ row.items.length !== 1 ? 's' : '' }}
        </p>
      </div>
    </template>

    <!-- Status badge -->
    <template #cell-status="{ row }">
      <AppStatusBadge :status="row.status" />
    </template>

    <!-- Issue date -->
    <template #cell-issuedAt="{ row }">
      <span class="text-sm text-slate-600 dark:text-slate-400">{{ formatDate(row.issuedAt) }}</span>
    </template>

    <!-- Due date with overdue highlight -->
    <template #cell-dueAt="{ row }">
      <span
        class="text-sm"
        :class="row.status === 'overdue'
          ? 'font-semibold text-rose-600 dark:text-rose-400'
          : 'text-slate-600 dark:text-slate-400'"
      >
        {{ formatDate(row.dueAt) }}
      </span>
    </template>

    <!-- Amount -->
    <template #cell-amount="{ row }">
      <span class="font-bold text-slate-950 dark:text-white">
        {{ formatAmount(row.amount, row.currency) }}
      </span>
    </template>

    <!-- Actions -->
    <template #actions="{ row }">
      <div class="flex items-center justify-end gap-2" @click.stop>
        <AppButton
          v-if="InvoiceEntity.from(row).canPay"
          variant="primary"
          size="sm"
          :loading="store.isPaying(row.id)"
          :disabled="store.isPaying(row.id)"
          @click="emit('pay', row.id)"
        >
          Pay now
        </AppButton>
        <AppButton variant="outline" size="sm" @click="emit('view', row.id)">
          View
        </AppButton>
      </div>
    </template>

    <template #empty>
      <AppEmptyState
        icon="invoice"
        title="No invoices yet"
        description="Your invoices will appear here after your first purchase."
      />
    </template>
  </AppDataTable>
</template>
