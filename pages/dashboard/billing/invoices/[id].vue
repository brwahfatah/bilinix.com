<script setup lang="ts">
import { InvoiceEntity } from '~/domain/billing/InvoiceEntity'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const route = useRoute()
const id = route.params.id as string

const store = useBillingStore()
const { triggerPayInvoice, isPaying } = useBillingActions()

const paying = isPaying(id)

await useAsyncData(`invoice-${id}`, () => store.fetchOne(id), { lazy: true })

const entity = computed(() =>
  store.current?.id === id ? InvoiceEntity.from(store.current) : null,
)

async function handlePay() {
  await triggerPayInvoice(id)
}

function formatDate(date: Date | null): string {
  if (!date) return 'N/A'
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="space-y-8">

    <!-- Loading skeleton -->
    <div v-if="store.loading" class="space-y-4">
      <AppSkeleton height="h-10" width="w-72" />
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AppSkeleton v-for="i in 4" :key="i" height="h-20" rounded="rounded-xl" />
      </div>
      <AppSkeleton height="h-64" rounded="rounded-xl" />
      <AppSkeleton height="h-24" rounded="rounded-xl" />
    </div>

    <template v-else-if="entity">

      <UiPageHeader
        eyebrow="Invoice"
        :title="entity.number"
        :description="`Issued on ${formatDate(entity.issuedAt)}`"
      >
        <template #actions>
          <AppStatusBadge :status="entity.status" />
          <AppButton
            variant="outline"
            size="sm"
            @click="navigateTo('/dashboard/billing/invoices')"
          >
            ← All invoices
          </AppButton>
        </template>
      </UiPageHeader>

      <!-- Overdue urgent banner -->
      <div
        v-if="entity.isOverdue"
        class="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-400/20 dark:bg-rose-400/10"
      >
        <svg class="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.73 0-2.813-1.874-1.948-3.374l7.27-12.61c.866-1.5 3.032-1.5 3.898 0l7.27 12.61zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <div>
          <p class="font-bold text-rose-800 dark:text-rose-200">
            This invoice is {{ entity.daysOverdue }} day{{ entity.daysOverdue !== 1 ? 's' : '' }} overdue.
          </p>
          <p class="mt-0.5 text-sm text-rose-700 dark:text-rose-300">
            Pay now to prevent service interruption.
          </p>
        </div>
      </div>

      <!-- Due-soon warning -->
      <div
        v-else-if="entity.isDueSoon"
        class="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-400/20 dark:bg-amber-400/10"
      >
        <svg class="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <span class="font-semibold text-amber-800 dark:text-amber-200">
          Due in {{ entity.daysUntilDue }} day{{ entity.daysUntilDue !== 1 ? 's' : '' }}. Pay before {{ formatDate(entity.dueAt) }}.
        </span>
      </div>

      <!-- Notes -->
      <div
        v-if="entity.notes"
        class="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300"
      >
        {{ entity.notes }}
      </div>

      <!-- Invoice items breakdown -->
      <InvoiceItemsPanel
        :items="entity.items"
        :subtotal="entity.subtotal"
        :tax-amount="entity.taxAmount"
        :total="entity.amount"
        :currency="entity.currency"
      />

      <!-- Pay panel -->
      <InvoicePayPanel
        :entity="entity"
        :loading="paying"
        @pay="handlePay"
      />

    </template>

    <!-- Not found -->
    <AppEmptyState
      v-else
      icon="invoice"
      title="Invoice not found"
      description="This invoice could not be loaded or no longer exists."
    >
      <template #actions>
        <AppButton variant="outline" @click="navigateTo('/dashboard/billing/invoices')">
          Back to invoices
        </AppButton>
      </template>
    </AppEmptyState>

  </div>
</template>
