<script setup lang="ts">
defineProps<{
  totalInvoices: number
  totalPaid: number
  totalOutstanding: number
  overdueCount: number
  loading?: boolean
}>()

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}
</script>

<template>
  <section class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

    <!-- Total invoices -->
    <article class="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">Total invoices</p>
      <template v-if="loading">
        <AppSkeleton height="h-8" width="w-16" class="mt-2" />
      </template>
      <p v-else class="mt-2 text-3xl font-black text-slate-950 dark:text-white">{{ totalInvoices }}</p>
    </article>

    <!-- Paid amount -->
    <article class="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">Paid</p>
      <template v-if="loading">
        <AppSkeleton height="h-8" width="w-28" class="mt-2" />
      </template>
      <p v-else class="mt-2 text-3xl font-black text-emerald-600 dark:text-emerald-400">
        {{ formatCurrency(totalPaid) }}
      </p>
    </article>

    <!-- Outstanding -->
    <article class="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <p class="text-sm font-semibold text-slate-500 dark:text-slate-400">Outstanding</p>
      <template v-if="loading">
        <AppSkeleton height="h-8" width="w-24" class="mt-2" />
      </template>
      <p
        v-else
        class="mt-2 text-3xl font-black"
        :class="totalOutstanding > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-950 dark:text-white'"
      >
        {{ formatCurrency(totalOutstanding) }}
      </p>
    </article>

    <!-- Overdue count -->
    <article
      class="rounded-xl border p-5"
      :class="overdueCount > 0
        ? 'border-rose-200 bg-rose-50 dark:border-rose-400/20 dark:bg-rose-400/10'
        : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'"
    >
      <p
        class="text-sm font-semibold"
        :class="overdueCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'"
      >
        Overdue
      </p>
      <template v-if="loading">
        <AppSkeleton height="h-8" width="w-10" class="mt-2" />
      </template>
      <p
        v-else
        class="mt-2 text-3xl font-black"
        :class="overdueCount > 0 ? 'text-rose-700 dark:text-rose-300' : 'text-slate-950 dark:text-white'"
      >
        {{ overdueCount }}
      </p>
    </article>

  </section>
</template>
