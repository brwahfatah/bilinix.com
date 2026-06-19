<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const store = useTicketStore()
const { canCreate } = usePermissions()

await useAsyncData('ticket-list', () => store.fetchList(), { lazy: true })

function handleView(ticket: { id: string }) {
  navigateTo(`/dashboard/support/${ticket.id}`)
}
</script>

<template>
  <div class="space-y-8">

    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400">Support</p>
        <h1 class="mt-1 text-3xl font-black text-slate-950 dark:text-white">My Tickets</h1>
        <p class="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          Track and manage your support requests with our team.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <!-- Open ticket count badge -->
        <span
          v-if="store.openCount > 0"
          class="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20"
        >
          {{ store.openCount }} open
        </span>
        <AppButton
          v-if="canCreate('ticket')"
          variant="primary"
          size="sm"
          @click="navigateTo('/dashboard/support/new')"
        >
          Open ticket
        </AppButton>
      </div>
    </div>

    <!-- Ticket list -->
    <TicketList
      :tickets="store.items"
      :loading="store.loading"
      @view="handleView"
    />

  </div>
</template>
