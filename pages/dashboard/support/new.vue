<script setup lang="ts">
import type { CreateTicketPayload } from '~/features/support/types/ticket'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const vpsStore = useVpsStore()
const { triggerCreateTicket, isSubmitting } = useTicketActions()

// Pre-load VPS list for the related-server dropdown
await useAsyncData('new-ticket-vps', () => vpsStore.fetchList(), { lazy: true })

const vpsOptions = computed(() =>
  vpsStore.items.map((v) => ({ value: v.id, label: `${v.name} (${v.ip ?? 'provisioning'})` })),
)

async function handleSubmit(payload: CreateTicketPayload) {
  const id = await triggerCreateTicket(payload)
  if (id) {
    await navigateTo(`/dashboard/support/${id}`)
  }
}
</script>

<template>
  <div class="space-y-8">

    <!-- Header -->
    <div class="flex items-center gap-4">
      <button
        class="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
        @click="navigateTo('/dashboard/support')"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
      </button>
      <div>
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400">Support</p>
        <h1 class="mt-0.5 text-3xl font-black text-slate-950 dark:text-white">Open a Ticket</h1>
      </div>
    </div>

    <!-- Form card -->
    <div class="grid gap-8 lg:grid-cols-3">
      <AppCard class="lg:col-span-2" padding="lg">
        <NewTicketForm
          :vps-options="vpsOptions"
          :loading="isSubmitting"
          @submit="handleSubmit"
          @cancel="navigateTo('/dashboard/support')"
        />
      </AppCard>

      <!-- Sidebar hints -->
      <div class="space-y-5">
        <AppCard title="Before you submit" padding="md">
          <ul class="space-y-3">
            <li
              v-for="tip in [
                'Check our knowledge base for instant answers.',
                'Include your server\'s ID and IP address if relevant.',
                'Attach error messages or screenshots if possible.',
                'Urgent issues (production down) will be prioritised.',
              ]"
              :key="tip"
              class="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300"
            >
              <svg class="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              {{ tip }}
            </li>
          </ul>
        </AppCard>

        <AppCard title="Response times" padding="md">
          <div class="space-y-2.5">
            <div
              v-for="row in [
                { priority: 'Urgent', time: '< 1 hour', color: 'text-rose-600 dark:text-rose-400' },
                { priority: 'High',   time: '< 4 hours', color: 'text-amber-600 dark:text-amber-400' },
                { priority: 'Normal', time: '< 12 hours', color: 'text-sky-600 dark:text-sky-400' },
                { priority: 'Low',    time: '< 24 hours', color: 'text-slate-500 dark:text-slate-400' },
              ]"
              :key="row.priority"
              class="flex items-center justify-between text-sm"
            >
              <span class="font-semibold" :class="row.color">{{ row.priority }}</span>
              <span class="text-slate-500 dark:text-slate-400">{{ row.time }}</span>
            </div>
          </div>
        </AppCard>
      </div>
    </div>

  </div>
</template>
