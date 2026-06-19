<script setup lang="ts">
import { TicketEntity } from '~/domain/support/TicketEntity'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const route = useRoute()
const id = route.params.id as string

const store = useTicketStore()
const { triggerReply, triggerClose, isSubmitting } = useTicketActions()

await useAsyncData(`ticket-${id}`, () => store.fetchOne(id))

const entity = computed(() => TicketEntity.from(store.current))

// Reply form state — local UI state only, not in store
const replyText = ref('')
const replyError = ref('')

function validateReply(): boolean {
  replyError.value = replyText.value.trim().length < 10
    ? 'Reply must be at least 10 characters.'
    : ''
  return !replyError.value
}

async function handleReply() {
  if (!validateReply()) return
  const ok = await triggerReply(
    { ticketId: id, message: replyText.value.trim() },
    store.current?.subject ?? '',
  )
  if (ok) replyText.value = ''
}

async function handleClose() {
  const ok = await triggerClose(id, store.current?.subject ?? '')
  if (ok) await navigateTo('/dashboard/support')
}

// ── Priority display config (same as TicketList — kept local) ──────────────
const PRIORITY_LABEL: Record<string, string> = {
  low: 'Low', normal: 'Normal', high: 'High', urgent: 'Urgent',
}
const PRIORITY_BADGE: Record<string, string> = {
  low:    'bg-slate-100 text-slate-600 ring-slate-600/10 dark:bg-slate-800 dark:text-slate-300 dark:ring-white/10',
  normal: 'bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/20',
  high:   'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20',
  urgent: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20',
}
const DEPARTMENT_LABEL: Record<string, string> = {
  technical: 'Technical Support',
  billing:   'Billing & Payments',
  sales:     'Sales',
  general:   'General',
}
</script>

<template>
  <div class="space-y-8">

    <!-- Back nav -->
    <div class="flex items-center gap-4">
      <button
        class="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
        @click="navigateTo('/dashboard/support')"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
      </button>
      <p class="text-sm text-slate-400">
        <NuxtLink to="/dashboard/support" class="hover:text-slate-600 dark:hover:text-slate-200">
          Support
        </NuxtLink>
        <span class="mx-2">·</span>
        <span class="text-slate-600 dark:text-slate-300 font-semibold">
          {{ store.current?.id.toUpperCase() }}
        </span>
      </p>
    </div>

    <!-- Loading -->
    <template v-if="store.loading && !store.current">
      <AppSkeleton height="h-24" rounded="rounded-2xl" />
      <AppSkeleton height="h-96" rounded="rounded-2xl" />
    </template>

    <!-- Ticket not found -->
    <AppEmptyState
      v-else-if="!store.current"
      icon="ticket"
      title="Ticket not found"
      description="This ticket may have been deleted or you don't have access to it."
      tone="danger"
    >
      <template #actions>
        <AppButton variant="outline" size="sm" @click="navigateTo('/dashboard/support')">
          Back to tickets
        </AppButton>
      </template>
    </AppEmptyState>

    <template v-else-if="store.current && entity">

      <!-- Ticket header card -->
      <AppCard padding="md">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div class="space-y-2">
            <h1 class="text-xl font-black text-slate-950 dark:text-white">
              {{ store.current.subject }}
            </h1>
            <div class="flex flex-wrap items-center gap-3">
              <!-- Status -->
              <AppStatusBadge :status="store.current.status" />

              <!-- Priority -->
              <span
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1"
                :class="PRIORITY_BADGE[store.current.priority] ?? PRIORITY_BADGE.normal"
              >
                {{ PRIORITY_LABEL[store.current.priority] }}
              </span>

              <!-- Department -->
              <span class="text-xs text-slate-400">
                {{ DEPARTMENT_LABEL[store.current.department] }}
              </span>

              <!-- Opened date -->
              <span class="text-xs text-slate-400">
                Opened {{ new Date(store.current.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }}
              </span>
            </div>
          </div>

          <!-- Close button -->
          <AppButton
            v-if="entity.canClose"
            variant="outline"
            size="sm"
            :loading="isSubmitting"
            @click="handleClose"
          >
            Close ticket
          </AppButton>
        </div>
      </AppCard>

      <!-- Closed banner -->
      <div
        v-if="entity.isClosed"
        class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 dark:border-slate-700 dark:bg-slate-800/50"
      >
        <svg class="h-5 w-5 shrink-0 text-slate-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <p class="text-sm text-slate-600 dark:text-slate-300">
          This ticket is closed. Reply below to reopen it.
        </p>
      </div>

      <!-- Message thread -->
      <AppCard title="Conversation" padding="md">
        <TicketMessageThread :messages="store.current.messages" />
      </AppCard>

      <!-- Reply form -->
      <AppCard v-if="entity.canReply" title="Reply" padding="md">
        <form class="space-y-4" @submit.prevent="handleReply">
          <AppFormField for="reply" :error="replyError">
            <AppTextarea
              id="reply"
              v-model="replyText"
              :rows="4"
              placeholder="Type your reply here..."
              :error="!!replyError"
              :disabled="isSubmitting"
            />
          </AppFormField>
          <div class="flex justify-end">
            <AppButton
              type="submit"
              variant="primary"
              :loading="isSubmitting"
            >
              Send reply
            </AppButton>
          </div>
        </form>
      </AppCard>

    </template>

  </div>
</template>
