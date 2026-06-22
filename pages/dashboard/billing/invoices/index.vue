<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth', ssr: false })

const store = useBillingStore()
const route = useRoute()
const notify = useNotification()
const { triggerPayInvoice } = useBillingActions()

await useAsyncData('billing-list', () => store.fetchList(), { lazy: true })

// ── Handle Stripe redirect result ──────────────────────────────────────────
onMounted(() => {
  const payment = route.query.payment as string | undefined

  if (payment === 'success') {
    notify.success(
      'Payment received',
      'Your payment is being processed. The invoice will be marked paid shortly.',
    )
    // Refresh invoice list so new status is reflected as soon as webhook fires
    store.fetchList()
    // Clean the query string without triggering a navigation
    navigateTo('/dashboard/billing/invoices', { replace: true })
  } else if (payment === 'cancelled') {
    notify.warning(
      'Payment cancelled',
      'You cancelled the payment. You can retry from the invoice page.',
    )
    navigateTo('/dashboard/billing/invoices', { replace: true })
  }
})

async function handlePay(id: string) {
  await triggerPayInvoice(id)
}
</script>

<template>
  <div class="space-y-8">

    <UiPageHeader
      eyebrow="Billing"
      title="Invoices"
      description="Review invoice status, totals, and payment history."
    />

    <!-- Summary cards — always shown (use skeleton while loading) -->
    <InvoiceSummaryCards
      :total-invoices="store.totalInvoices"
      :total-paid="store.totalPaid"
      :total-outstanding="store.totalOutstanding"
      :overdue-count="store.overdueCount"
      :loading="store.loading"
    />

    <!-- Error state -->
    <AppEmptyState
      v-if="store.error && !store.loading"
      title="Could not load invoices"
      :description="store.error.message"
      tone="danger"
      icon="invoice"
    >
      <template #actions>
        <AppButton variant="outline" @click="store.fetchList()">Retry</AppButton>
      </template>
    </AppEmptyState>

    <!-- Invoice table — handles loading + empty internally via AppDataTable -->
    <InvoiceTable
      v-else
      :invoices="store.items"
      :loading="store.loading"
      @view="(id) => navigateTo(`/dashboard/billing/invoices/${id}`)"
      @pay="handlePay"
    />

  </div>
</template>
