<script setup lang="ts">
import type { InvoiceItem } from '../types/billing'

defineProps<{
  items: InvoiceItem[]
  subtotal: number
  taxAmount: number
  total: number
  currency: string
}>()

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

const TYPE_LABELS: Record<string, string> = {
  vps: 'VPS',
  domain: 'Domain',
  hosting: 'Hosting',
  dedicated: 'Dedicated',
  addon: 'Add-on',
  other: 'Other',
}
</script>

<template>
  <section class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div class="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
      <h2 class="text-lg font-bold text-slate-950 dark:text-white">Billed Services</h2>
    </div>

    <div class="divide-y divide-slate-100 dark:divide-slate-800">
      <article
        v-for="item in items"
        :key="item.id"
        class="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-start sm:justify-between"
      >
        <div class="flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {{ TYPE_LABELS[item.type] ?? item.type }}
            </span>
            <p class="font-semibold text-slate-950 dark:text-white">{{ item.description }}</p>
          </div>
          <p v-if="item.serviceId" class="mt-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            Service ID: {{ item.serviceId }}
          </p>
          <p v-if="item.quantity > 1" class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {{ item.quantity }} × {{ formatCurrency(item.unitPrice, currency) }}
          </p>
        </div>
        <p class="text-right font-bold text-slate-950 dark:text-white">
          {{ formatCurrency(item.amount, currency) }}
        </p>
      </article>
    </div>

    <!-- Totals -->
    <div class="border-t border-slate-200 px-6 py-4 dark:border-slate-800">
      <div class="ml-auto max-w-xs space-y-2">
        <div class="flex justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>Subtotal</span>
          <span>{{ formatCurrency(subtotal, currency) }}</span>
        </div>
        <div class="flex justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>Tax</span>
          <span>{{ formatCurrency(taxAmount, currency) }}</span>
        </div>
        <div class="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-950 dark:border-slate-700 dark:text-white">
          <span>Total</span>
          <span>{{ formatCurrency(total, currency) }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
