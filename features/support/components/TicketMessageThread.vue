<script setup lang="ts">
import type { TicketMessage } from '../types/ticket'

defineProps<{
  messages: TicketMessage[]
}>()

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Support avatar initials from author name
function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>

<template>
  <div class="space-y-6">
    <article
      v-for="msg in messages"
      :key="msg.id"
      class="flex gap-3"
      :class="msg.authorRole === 'client' ? 'flex-row-reverse' : 'flex-row'"
    >
      <!-- Avatar -->
      <div
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black"
        :class="msg.authorRole === 'client'
          ? 'bg-emerald-600 text-white'
          : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'"
      >
        {{ initials(msg.authorName) }}
      </div>

      <!-- Bubble -->
      <div
        class="max-w-[78%] space-y-1"
        :class="msg.authorRole === 'client' ? 'items-end' : 'items-start'"
      >
        <!-- Meta row -->
        <div
          class="flex items-center gap-2 text-xs text-slate-400"
          :class="msg.authorRole === 'client' ? 'flex-row-reverse' : 'flex-row'"
        >
          <span class="font-semibold text-slate-600 dark:text-slate-300">
            {{ msg.authorName }}
          </span>
          <span>·</span>
          <time :datetime="msg.createdAt">{{ formatTime(msg.createdAt) }}</time>
          <!-- Support badge -->
          <span
            v-if="msg.authorRole === 'support'"
            class="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-bold text-sky-700 ring-1 ring-sky-600/20 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/20"
          >
            Support
          </span>
        </div>

        <!-- Message body -->
        <div
          class="rounded-2xl px-4 py-3 text-sm leading-relaxed"
          :class="msg.authorRole === 'client'
            ? 'rounded-tr-sm bg-emerald-600 text-white'
            : 'rounded-tl-sm border border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200'"
        >
          {{ msg.body }}
        </div>
      </div>
    </article>
  </div>
</template>
