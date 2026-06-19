<script setup lang="ts">
import { useNotificationStore } from '~/stores/useNotificationStore'
import type { NotificationType } from '~/stores/useNotificationStore'

const store = useNotificationStore()

const TYPE_CONFIG: Record<NotificationType, { icon: string; bar: string; iconClass: string }> = {
  success: {
    bar: 'bg-emerald-500',
    iconClass: 'text-emerald-500',
    icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  error: {
    bar: 'bg-rose-500',
    iconClass: 'text-rose-500',
    icon: 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z',
  },
  warning: {
    bar: 'bg-amber-500',
    iconClass: 'text-amber-500',
    icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
  },
  info: {
    bar: 'bg-sky-500',
    iconClass: 'text-sky-500',
    icon: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z',
  },
}
</script>

<template>
  <Teleport to="body">
    <div
      aria-live="assertive"
      class="pointer-events-none fixed inset-x-0 bottom-0 z-[9999] flex flex-col items-end gap-2 px-4 pb-6 sm:bottom-4 sm:right-4 sm:left-auto sm:w-full sm:max-w-sm"
    >
      <TransitionGroup
        enter-active-class="transform ease-out duration-300 transition"
        enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-for="notif in store.items"
          :key="notif.id"
          class="pointer-events-auto w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
        >
          <!-- Colored top bar -->
          <div class="h-1 w-full" :class="TYPE_CONFIG[notif.type].bar" />

          <div class="flex items-start gap-3 p-4">
            <svg
              class="mt-0.5 h-5 w-5 shrink-0"
              :class="TYPE_CONFIG[notif.type].iconClass"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" :d="TYPE_CONFIG[notif.type].icon" />
            </svg>

            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-slate-950 dark:text-white">{{ notif.title }}</p>
              <p v-if="notif.message" class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{{ notif.message }}</p>
            </div>

            <button
              type="button"
              class="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
              @click="store.dismiss(notif.id)"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
