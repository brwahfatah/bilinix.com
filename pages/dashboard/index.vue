<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth', ssr: false })

const dashboard = useDashboard()
const { canCreate } = usePermissions()

await useAsyncData('dashboard', () => dashboard.initialize(), { lazy: true })

// ---------------------------------------------------------------------------
// Greeting
// ---------------------------------------------------------------------------
const greeting = ref('')
const today = ref('')

onMounted(() => {
  const h = new Date().getHours()
  greeting.value = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  today.value = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
})

// ---------------------------------------------------------------------------
// Stat card definitions (data-driven, no hardcoded colors)
// ---------------------------------------------------------------------------
const TONE_TEXT = {
  success: 'text-emerald-600 dark:text-emerald-400',
  warning: 'text-amber-600 dark:text-amber-400',
  danger:  'text-rose-600 dark:text-rose-400',
  neutral: 'text-slate-500 dark:text-slate-400',
}

const statCards = computed(() => [
  {
    label: 'VPS Servers',
    value: String(dashboard.stats.value.totalVps),
    sub: dashboard.stats.value.activeVps > 0
      ? `${dashboard.stats.value.activeVps} running`
      : 'None active',
    subTone: dashboard.stats.value.activeVps > 0 ? 'success' : 'neutral',
    icon: 'M21.75 17.25v.75a3 3 0 01-3 3H5.25a3 3 0 01-3-3v-.75m16.5-7.5v.75a3 3 0 01-3 3H5.25a3 3 0 01-3-3v-.75m16.5-7.5v.75a3 3 0 01-3 3H5.25a3 3 0 01-3-3V2.25m16.5 0H5.25',
    iconBg:    'bg-sky-100 dark:bg-sky-400/20',
    iconColor: 'text-sky-600 dark:text-sky-400',
    link: '/dashboard/services/vps',
  },
  {
    label: 'My Domains',
    value: String(dashboard.stats.value.totalDomains),
    sub: dashboard.stats.value.expiredDomains > 0
      ? `${dashboard.stats.value.expiredDomains} expired`
      : dashboard.stats.value.totalDomains > 0
        ? 'All active'
        : 'Register a domain',
    subTone: dashboard.stats.value.expiredDomains > 0 ? 'danger' : 'success',
    icon: 'M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244',
    iconBg:    dashboard.stats.value.expiredDomains > 0
      ? 'bg-rose-100 dark:bg-rose-400/20'
      : 'bg-violet-100 dark:bg-violet-400/20',
    iconColor: dashboard.stats.value.expiredDomains > 0
      ? 'text-rose-600 dark:text-rose-400'
      : 'text-violet-600 dark:text-violet-400',
    link: '/dashboard/services/domains',
  },
  {
    label: 'Outstanding',
    value: formatCurrency(dashboard.stats.value.totalOutstanding),
    sub: dashboard.stats.value.unpaidCount > 0
      ? `${dashboard.stats.value.unpaidCount} invoice${dashboard.stats.value.unpaidCount !== 1 ? 's' : ''} pending`
      : 'All settled',
    subTone: dashboard.stats.value.totalOutstanding > 0 ? 'warning' : 'success',
    icon: 'M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z',
    iconBg:    dashboard.stats.value.totalOutstanding > 0
      ? 'bg-amber-100 dark:bg-amber-400/20'
      : 'bg-slate-100 dark:bg-slate-800',
    iconColor: dashboard.stats.value.totalOutstanding > 0
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-slate-500 dark:text-slate-400',
    link: '/dashboard/billing/invoices',
  },
  {
    label: 'Overdue',
    value: String(dashboard.stats.value.overdueCount),
    sub: dashboard.stats.value.overdueCount > 0 ? 'Requires action' : 'Nothing overdue',
    subTone: dashboard.stats.value.overdueCount > 0 ? 'danger' : 'success',
    icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
    iconBg:    dashboard.stats.value.overdueCount > 0
      ? 'bg-rose-100 dark:bg-rose-400/20'
      : 'bg-slate-100 dark:bg-slate-800',
    iconColor: dashboard.stats.value.overdueCount > 0
      ? 'text-rose-600 dark:text-rose-400'
      : 'text-slate-500 dark:text-slate-400',
    link: '/dashboard/billing/invoices',
  },
])

// ---------------------------------------------------------------------------
// Quick actions (permission-gated)
// ---------------------------------------------------------------------------
const quickActions = computed(() => [
  {
    label: 'Deploy VPS',
    description: 'KVM cloud VPS from $5.99/mo',
    to: '/vps',
    icon: 'M21.75 17.25v.75a3 3 0 01-3 3H5.25a3 3 0 01-3-3v-.75m16.5-7.5v.75a3 3 0 01-3 3H5.25a3 3 0 01-3-3v-.75m16.5-7.5v.75a3 3 0 01-3 3H5.25a3 3 0 01-3-3V2.25m16.5 0H5.25',
    iconBg:    'bg-sky-100 dark:bg-sky-400/20',
    iconColor: 'text-sky-600 dark:text-sky-400',
    shown: canCreate('vps'),
  },
  {
    label: 'Register Domain',
    description: '.com from $9.99/yr',
    to: '/domains',
    icon: 'M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244',
    iconBg:    'bg-amber-100 dark:bg-amber-400/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
    shown: canCreate('domain'),
  },
  {
    label: 'View Invoices',
    description: 'Billing history and payments',
    to: '/dashboard/billing/invoices',
    icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z',
    iconBg:    'bg-violet-100 dark:bg-violet-400/20',
    iconColor: 'text-violet-600 dark:text-violet-400',
    shown: canCreate('invoice'),
  },
  {
    label: 'Open Ticket',
    description: 'Get help from our support team',
    to: '/dashboard/support',
    icon: 'M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z',
    iconBg:    'bg-emerald-100 dark:bg-emerald-400/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    shown: canCreate('ticket'),
  },
])

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

function formatInvoiceDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="space-y-8">

    <!-- ─── HEADER ─────────────────────────────────────────────────────── -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ today }}</p>
        <h1 class="mt-1 text-3xl font-black text-slate-950 dark:text-white">
          {{ greeting }}, {{ dashboard.auth.displayName.split(' ')[0] }}.
        </h1>
      </div>
      <div class="flex items-center gap-2.5">
        <AppButton
          v-if="canCreate('vps')"
          variant="outline"
          size="sm"
          @click="navigateTo('/vps')"
        >
          Deploy VPS
        </AppButton>
        <AppButton
          variant="primary"
          size="sm"
          @click="navigateTo('/dashboard/services/vps')"
        >
          Manage Services
        </AppButton>
      </div>
    </div>

    <!-- ─── OVERDUE ALERT ───────────────────────────────────────────────── -->
    <div
      v-if="dashboard.stats.value.overdueCount > 0 && !dashboard.isLoading.value"
      class="flex items-center justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 dark:border-rose-400/20 dark:bg-rose-400/10"
    >
      <div class="flex items-center gap-3">
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-400/20">
          <svg class="h-5 w-5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <div>
          <p class="font-bold text-rose-800 dark:text-rose-200">
            {{ dashboard.stats.value.overdueCount }} overdue invoice{{ dashboard.stats.value.overdueCount !== 1 ? 's' : '' }}
          </p>
          <p class="text-sm text-rose-700 dark:text-rose-300">
            Pay now to prevent service interruption.
          </p>
        </div>
      </div>
      <AppButton
        variant="danger"
        size="sm"
        @click="navigateTo('/dashboard/billing/invoices')"
      >
        View invoices
      </AppButton>
    </div>

    <!-- ─── STAT CARDS ──────────────────────────────────────────────────── -->
    <section class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <template v-if="dashboard.isLoading.value">
        <AppSkeleton v-for="i in 4" :key="i" height="h-[108px]" rounded="rounded-2xl" />
      </template>

      <template v-else>
        <NuxtLink
          v-for="card in statCards"
          :key="card.label"
          :to="card.link"
          class="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <div class="flex items-start justify-between">
            <p class="text-xs font-bold uppercase tracking-widest text-slate-400">
              {{ card.label }}
            </p>
            <div class="flex h-9 w-9 items-center justify-center rounded-xl" :class="card.iconBg">
              <svg class="h-4 w-4" :class="card.iconColor" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" :d="card.icon" />
              </svg>
            </div>
          </div>
          <div>
            <p class="text-3xl font-black text-slate-950 dark:text-white">{{ card.value }}</p>
            <p class="mt-1 text-xs font-semibold" :class="TONE_TEXT[card.subTone as keyof typeof TONE_TEXT]">
              {{ card.sub }}
            </p>
          </div>
        </NuxtLink>
      </template>
    </section>

    <!-- ─── MAIN CONTENT ────────────────────────────────────────────────── -->
    <div class="grid gap-6 lg:grid-cols-3">

      <!-- VPS Overview (2/3) -->
      <AppCard title="Your Servers" class="lg:col-span-2">
        <template #header-action>
          <NuxtLink
            to="/dashboard/services/vps"
            class="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            Manage all →
          </NuxtLink>
        </template>

        <!-- Loading -->
        <div v-if="dashboard.isLoading.value" class="space-y-3">
          <AppSkeleton v-for="i in 3" :key="i" height="h-14" rounded="rounded-xl" />
        </div>

        <!-- Empty -->
        <AppEmptyState
          v-else-if="dashboard.recentVps.value.length === 0"
          icon="server"
          title="No servers yet"
          description="Deploy your first VPS to get started."
        >
          <template #actions>
            <AppButton v-if="canCreate('vps')" variant="primary" size="sm" @click="navigateTo('/vps')">
              Deploy VPS
            </AppButton>
          </template>
        </AppEmptyState>

        <!-- Server list -->
        <div v-else class="divide-y divide-slate-100 dark:divide-slate-800">
          <div
            v-for="vps in dashboard.recentVps.value"
            :key="vps.id"
            class="flex cursor-pointer items-center gap-4 py-3.5 transition hover:opacity-80"
            @click="navigateTo(`/dashboard/services/vps/${vps.id}`)"
          >
            <!-- Status dot -->
            <div class="shrink-0">
              <AppStatusBadge :status="vps.status" dot />
            </div>

            <!-- Name + plan -->
            <div class="min-w-0 flex-1">
              <p class="truncate font-bold text-slate-950 dark:text-white">{{ vps.name }}</p>
              <p class="text-xs text-slate-400">{{ vps.plan }} · {{ vps.region }}</p>
            </div>

            <!-- Spec pills -->
            <div class="hidden items-center gap-1.5 sm:flex">
              <span class="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {{ vps.spec.cpu }}vCPU
              </span>
              <span class="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {{ vps.spec.ramGb }}GB
              </span>
            </div>

            <!-- IP -->
            <p class="hidden font-mono text-xs text-slate-400 lg:block">
              {{ vps.ip ?? 'Provisioning…' }}
            </p>

            <!-- Chevron -->
            <svg class="h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        </div>

        <!-- VPS status summary footer -->
        <template v-if="!dashboard.isLoading.value && Object.keys(dashboard.vpsByStatus.value).length > 0" #footer>
          <div class="flex flex-wrap gap-4">
            <div
              v-for="(count, status) in dashboard.vpsByStatus.value"
              :key="status"
              class="flex items-center gap-1.5"
            >
              <AppStatusBadge :status="String(status)" dot />
              <span class="text-xs text-slate-400">{{ count }}</span>
            </div>
          </div>
        </template>
      </AppCard>

      <!-- Activity Feed (1/3) -->
      <AppCard title="Recent Activity">
        <div
          v-if="dashboard.activities.value.length === 0"
          class="py-4 text-center text-sm text-slate-400"
        >
          No activity yet
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="activity in dashboard.activities.value.slice(0, 8)"
            :key="activity.id"
            class="flex items-start gap-3"
          >
            <!-- Icon -->
            <div
              class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
              :class="dashboard.getActivityConfig(activity.type).iconBg"
            >
              <svg
                class="h-3.5 w-3.5"
                :class="dashboard.getActivityConfig(activity.type).iconColor"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" :d="dashboard.getActivityConfig(activity.type).icon" />
              </svg>
            </div>

            <!-- Content -->
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-slate-950 dark:text-white">
                {{ activity.label }}
              </p>
              <div class="mt-0.5 flex items-center gap-2">
                <span v-if="activity.meta" class="text-xs text-slate-400">{{ activity.meta }}</span>
                <span class="text-xs text-slate-300 dark:text-slate-600">·</span>
                <span class="text-xs text-slate-400">{{ dashboard.relativeTime(activity.timestamp) }}</span>
              </div>
            </div>
          </div>
        </div>
      </AppCard>

    </div>

    <!-- ─── BOTTOM ROW ──────────────────────────────────────────────────── -->
    <div class="grid gap-6 lg:grid-cols-2">

      <!-- Quick Actions -->
      <AppCard title="Quick Actions" padding="none">
        <div class="grid grid-cols-2 divide-x divide-y divide-slate-100 dark:divide-slate-800">
          <template v-for="action in quickActions" :key="action.label">
            <NuxtLink
              v-if="action.shown"
              :to="action.to"
              class="group flex items-center gap-3 p-5 transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                :class="action.iconBg"
              >
                <svg class="h-4 w-4" :class="action.iconColor" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" :d="action.icon" />
                </svg>
              </div>
              <div class="min-w-0">
                <p class="text-sm font-bold text-slate-950 dark:text-white">{{ action.label }}</p>
                <p class="mt-0.5 truncate text-xs text-slate-400">{{ action.description }}</p>
              </div>
            </NuxtLink>
          </template>
        </div>
      </AppCard>

      <!-- Recent Invoices -->
      <AppCard title="Recent Invoices">
        <template #header-action>
          <NuxtLink
            to="/dashboard/billing/invoices"
            class="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            View all →
          </NuxtLink>
        </template>

        <!-- Loading -->
        <div v-if="dashboard.isLoading.value" class="space-y-3">
          <AppSkeleton v-for="i in 3" :key="i" height="h-12" rounded="rounded-lg" />
        </div>

        <!-- Empty -->
        <div
          v-else-if="dashboard.recentInvoices.value.length === 0"
          class="py-4 text-center text-sm text-slate-400 dark:text-slate-500"
        >
          No invoices yet
        </div>

        <!-- Invoice rows -->
        <div v-else class="divide-y divide-slate-100 dark:divide-slate-800">
          <NuxtLink
            v-for="invoice in dashboard.recentInvoices.value"
            :key="invoice.id"
            :to="`/dashboard/billing/invoices/${invoice.id}`"
            class="flex items-center gap-4 py-3.5 transition hover:opacity-80"
          >
            <div class="min-w-0 flex-1">
              <p class="text-sm font-bold text-slate-950 dark:text-white">{{ invoice.number }}</p>
              <p class="text-xs text-slate-400">{{ formatInvoiceDate(invoice.issuedAt) }}</p>
            </div>
            <AppStatusBadge :status="invoice.status" />
            <p class="shrink-0 font-bold text-slate-950 dark:text-white">
              {{ formatCurrency(invoice.amount) }}
            </p>
          </NuxtLink>
        </div>

        <!-- Billing summary footer -->
        <template v-if="!dashboard.isLoading.value" #footer>
          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-500 dark:text-slate-400">
              Total outstanding
            </span>
            <span
              class="font-bold"
              :class="dashboard.stats.value.totalOutstanding > 0
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-emerald-600 dark:text-emerald-400'"
            >
              {{ formatCurrency(dashboard.stats.value.totalOutstanding) }}
            </span>
          </div>
        </template>
      </AppCard>

    </div>

  </div>
</template>
