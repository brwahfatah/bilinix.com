<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const route = useRoute()
const id = route.params.id as string

const store = useHostingStore()

await useAsyncData(`hosting-${id}`, () => store.fetchOne(id), { lazy: true })
store.fetchInvoices(id)

const account = computed(() =>
  store.current?.id === id ? store.current : null,
)

function formatDate(iso: string): string {
  if (!iso || iso === '0000-00-00') return '-'
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatMb(mb: number): string {
  if (!mb || mb <= 0) return 'Unlimited'
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`
  return `${mb} MB`
}

function usagePercent(used: number, limit: number): number {
  if (!limit || limit <= 0) return 0
  return Math.min(Math.round((used / limit) * 100), 100)
}

const isExpiringSoon = computed(() => {
  if (!account.value?.nextDueDate) return false
  const due = new Date(account.value.nextDueDate)
  const now = new Date()
  const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return diff > 0 && diff <= 14
})

const daysUntilDue = computed(() => {
  if (!account.value?.nextDueDate) return 0
  const due = new Date(account.value.nextDueDate)
  return Math.max(0, Math.ceil((due.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
})

function invoiceStatusClass(status: string): string {
  const s = status.toLowerCase()
  if (s === 'paid') return 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-400/10'
  if (s === 'unpaid' || s === 'overdue') return 'text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-400/10'
  return 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-400/10'
}
</script>

<template>
  <div class="space-y-8">

    <div v-if="store.loading" class="space-y-4">
      <AppSkeleton height="h-10" width="w-64" />
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AppSkeleton v-for="i in 4" :key="i" height="h-20" rounded="rounded-xl" />
      </div>
      <AppSkeleton height="h-40" rounded="rounded-2xl" />
    </div>

    <template v-else-if="account">

      <UiPageHeader
        eyebrow="Hosting Account"
        :title="account.plan"
        :description="account.domain || 'No domain configured'"
      >
        <template #actions>
          <AppStatusBadge :status="account.status" dot />
          <AppButton
            variant="outline"
            size="sm"
            @click="navigateTo('/dashboard/services/hosting')"
          >
            &larr; All accounts
          </AppButton>
        </template>
      </UiPageHeader>

      <!-- Expiry warning -->
      <div
        v-if="isExpiringSoon"
        class="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-400/20 dark:bg-amber-400/10"
      >
        <svg class="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <span class="font-semibold text-amber-800 dark:text-amber-200">
          This account is due in {{ daysUntilDue }} day{{ daysUntilDue !== 1 ? 's' : '' }}. Renew to avoid service interruption.
        </span>
      </div>

      <!-- Info grid -->
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Plan -->
        <div class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Plan</p>
          <p class="mt-1 text-lg font-black text-slate-950 dark:text-white">{{ account.plan }}</p>
          <p class="mt-0.5 text-xs text-slate-500">${{ account.recurringAmount }} / {{ account.billingCycle.toLowerCase() === 'annually' ? 'year' : 'month' }}</p>
        </div>
        <!-- Domain -->
        <div class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Domain</p>
          <p class="mt-1 text-lg font-black text-slate-950 dark:text-white">{{ account.domain || '-' }}</p>
          <p class="mt-0.5 text-xs text-slate-500">{{ account.serverHostname ? `Server: ${account.serverHostname}` : '' }}</p>
        </div>
        <!-- Registration -->
        <div class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Registered</p>
          <p class="mt-1 text-lg font-black text-slate-950 dark:text-white">{{ formatDate(account.registrationDate) }}</p>
          <p class="mt-0.5 text-xs text-slate-500">Next due: {{ formatDate(account.nextDueDate) }}</p>
        </div>
        <!-- Billing -->
        <div class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Billing</p>
          <p class="mt-1 text-lg font-black text-slate-950 dark:text-white">{{ account.billingCycle }}</p>
          <p class="mt-0.5 text-xs text-slate-500">${{ account.recurringAmount }}</p>
        </div>
      </div>

      <!-- Control Panel Login Details -->
      <div class="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200">Control Panel Access</h3>
        <div class="mt-3 grid gap-4 sm:grid-cols-3">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Username</p>
            <p class="mt-1 font-mono text-sm font-bold text-slate-950 dark:text-white">{{ account.username || 'Not provisioned yet' }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Panel URL</p>
            <a
              v-if="account.controlPanelUrl"
              :href="account.controlPanelUrl"
              target="_blank"
              rel="noopener"
              class="mt-1 block text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
            >{{ account.controlPanelUrl }}</a>
            <p v-else class="mt-1 text-sm text-slate-500">-</p>
          </div>
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Password</p>
            <p class="mt-1 text-sm text-slate-500">Sent in your welcome email</p>
          </div>
        </div>
        <div class="mt-4 flex flex-wrap items-center gap-3">
          <a
            v-if="account.controlPanelUrl"
            :href="account.controlPanelUrl"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            Login to Control Panel
          </a>
          <span v-if="account.status !== 'active'" class="text-xs text-slate-500">
            Panel login is available once the account is active.
          </span>
        </div>
      </div>

      <!-- Disk & bandwidth usage -->
      <div class="grid gap-3 sm:grid-cols-2">
        <!-- Disk -->
        <div class="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div class="flex items-center justify-between">
            <p class="text-sm font-bold text-slate-700 dark:text-slate-200">Disk Usage</p>
            <p class="text-xs font-semibold text-slate-500">{{ formatMb(account.diskUsage) }} / {{ formatMb(account.diskLimit) }}</p>
          </div>
          <div class="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              class="h-full rounded-full transition-all"
              :class="usagePercent(account.diskUsage, account.diskLimit) > 85 ? 'bg-rose-500' : 'bg-emerald-500'"
              :style="{ width: `${usagePercent(account.diskUsage, account.diskLimit)}%` }"
            />
          </div>
        </div>
        <!-- Bandwidth -->
        <div class="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div class="flex items-center justify-between">
            <p class="text-sm font-bold text-slate-700 dark:text-slate-200">Bandwidth</p>
            <p class="text-xs font-semibold text-slate-500">{{ formatMb(account.bwUsage) }} / {{ formatMb(account.bwLimit) }}</p>
          </div>
          <div class="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              class="h-full rounded-full transition-all"
              :class="usagePercent(account.bwUsage, account.bwLimit) > 85 ? 'bg-rose-500' : 'bg-emerald-500'"
              :style="{ width: `${usagePercent(account.bwUsage, account.bwLimit)}%` }"
            />
          </div>
        </div>
      </div>

      <!-- Account Invoices -->
      <div class="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200">Invoices for this account</h3>
        </div>

        <div v-if="store.invoicesLoading" class="p-5">
          <AppSkeleton height="h-8" />
          <AppSkeleton height="h-8" class="mt-2" />
        </div>

        <div v-else-if="store.invoices.length === 0" class="px-5 py-8 text-center text-sm text-slate-500">
          No invoices found for this hosting account.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-800">
              <tr>
                <th class="px-5 py-3">Invoice</th>
                <th class="px-5 py-3">Description</th>
                <th class="px-5 py-3">Date</th>
                <th class="px-5 py-3">Total</th>
                <th class="px-5 py-3">Status</th>
                <th class="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-for="inv in store.invoices" :key="inv.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td class="whitespace-nowrap px-5 py-3 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">#{{ inv.id }}</td>
                <td class="px-5 py-3 text-slate-600 dark:text-slate-400">{{ inv.description }}</td>
                <td class="whitespace-nowrap px-5 py-3 text-slate-500">{{ formatDate(inv.date) }}</td>
                <td class="whitespace-nowrap px-5 py-3 font-semibold text-slate-700 dark:text-slate-300">${{ inv.total }}</td>
                <td class="whitespace-nowrap px-5 py-3">
                  <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-bold" :class="invoiceStatusClass(inv.status)">
                    {{ inv.status }}
                  </span>
                </td>
                <td class="whitespace-nowrap px-5 py-3">
                  <AppButton
                    v-if="inv.status.toLowerCase() === 'unpaid' || inv.status.toLowerCase() === 'overdue'"
                    size="xs"
                    @click="navigateTo(`/dashboard/billing/invoices/${inv.id}`)"
                  >
                    Pay
                  </AppButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </template>

    <AppEmptyState
      v-else
      icon="server"
      title="Account not found"
      description="This hosting account could not be loaded or no longer exists."
    >
      <template #actions>
        <AppButton variant="outline" @click="navigateTo('/dashboard/services/hosting')">
          Back to hosting
        </AppButton>
      </template>
    </AppEmptyState>

  </div>
</template>
