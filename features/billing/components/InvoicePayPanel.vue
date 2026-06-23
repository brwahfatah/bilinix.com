<script setup lang="ts">
import type { InvoiceEntity } from '~/domain/billing/InvoiceEntity'

const props = defineProps<{
  entity: InvoiceEntity
  loading?: boolean
  cryptoLoading?: boolean
}>()

const emit = defineEmits<{
  pay: []
  'pay:crypto': []
}>()

const config = useRuntimeConfig()

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <section
    class="rounded-xl p-6 shadow-xl"
    :class="entity.isPaid
      ? 'bg-emerald-50 dark:bg-emerald-400/10'
      : entity.isOverdue
        ? 'bg-rose-950 text-white dark:bg-rose-950'
        : 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'"
  >
    <div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <!-- Amount block -->
      <div>
        <p
          class="text-sm font-bold"
          :class="entity.isPaid
            ? 'text-emerald-600 dark:text-emerald-400'
            : entity.isOverdue
              ? 'text-rose-300'
              : 'text-slate-300 dark:text-slate-600'"
        >
          {{ entity.isPaid ? 'Amount paid' : entity.isOverdue ? 'Overdue amount' : 'Total due' }}
        </p>
        <p
          class="mt-2 text-4xl font-black"
          :class="entity.isPaid ? 'text-emerald-700 dark:text-emerald-300' : ''"
        >
          {{ formatCurrency(entity.amount, entity.currency) }}
        </p>
        <p
          v-if="entity.isPaid && entity.paidAt"
          class="mt-1.5 text-sm text-emerald-600 dark:text-emerald-400"
        >
          Paid on {{ formatDate(entity.paidAt) }}
        </p>
        <p
          v-if="entity.isOverdue"
          class="mt-1.5 text-sm font-semibold text-rose-300"
        >
          {{ entity.daysOverdue }} day{{ entity.daysOverdue !== 1 ? 's' : '' }} overdue — was due {{ formatDate(entity.dueAt) }}
        </p>
        <p
          v-if="entity.isDueSoon"
          class="mt-1.5 text-sm font-semibold text-amber-300 dark:text-amber-500"
        >
          Due in {{ entity.daysUntilDue }} day{{ entity.daysUntilDue !== 1 ? 's' : '' }}
        </p>
      </div>

      <!-- Action block -->
      <div class="shrink-0">
        <!-- Paid state -->
        <div
          v-if="entity.isPaid"
          class="flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-5 py-3 dark:border-emerald-400/30 dark:bg-emerald-400/20"
        >
          <svg class="h-5 w-5 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
          </svg>
          <span class="font-bold text-emerald-700 dark:text-emerald-300">Invoice paid</span>
        </div>

        <!-- Cancelled / refunded -->
        <div
          v-else-if="entity.isCancelled || entity.isRefunded"
          class="rounded-xl border border-slate-300 px-5 py-3 text-center text-sm font-bold text-slate-300 dark:border-slate-600 dark:text-slate-400"
        >
          {{ entity.isCancelled ? 'Cancelled' : 'Refunded' }}
        </div>

        <!-- Payment buttons -->
        <div v-else-if="entity.canPay" class="flex flex-col gap-3 sm:flex-row">
          <!-- Stripe (kept in codebase; hidden when feature flag is off) -->
          <AppButton
            v-if="config.public.enableStripe"
            variant="outline"
            size="lg"
            :loading="loading"
            :disabled="loading || cryptoLoading"
            class="min-w-[160px]"
            @click="emit('pay')"
          >
            {{ loading ? 'Processing…' : 'Pay Invoice' }}
          </AppButton>

          <!-- NOWPayments crypto -->
          <AppButton
            v-if="config.public.enableNowPayments"
            variant="primary"
            size="lg"
            :loading="cryptoLoading"
            :disabled="loading || cryptoLoading"
            class="min-w-[180px]"
            @click="emit('pay:crypto')"
          >
            <template v-if="!cryptoLoading">
              <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              </svg>
              Pay with Crypto
            </template>
            <template v-else>Processing…</template>
          </AppButton>
        </div>
      </div>
    </div>
  </section>
</template>
