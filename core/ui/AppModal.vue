<script setup lang="ts">
const store = useModalStore()

const ICON: Record<string, string> = {
  danger:  'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
  warning: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
  info:    'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z',
}

const ICON_WRAP: Record<string, string> = {
  danger:  'bg-rose-100 dark:bg-rose-400/20',
  warning: 'bg-amber-100 dark:bg-amber-400/20',
  info:    'bg-sky-100 dark:bg-sky-400/20',
}

const ICON_COLOR: Record<string, string> = {
  danger:  'text-rose-600 dark:text-rose-400',
  warning: 'text-amber-600 dark:text-amber-400',
  info:    'text-sky-600 dark:text-sky-400',
}

const CONFIRM_BTN: Record<string, string> = {
  danger:  'bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-rose-500',
  warning: 'bg-amber-600 text-white hover:bg-amber-500 focus-visible:ring-amber-500',
  info:    'bg-emerald-600 text-white hover:bg-emerald-500 focus-visible:ring-emerald-500',
}

function onBackdrop(e: MouseEvent) {
  if (e.target === e.currentTarget) store._resolve(false)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') store._resolve(false)
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="store.isOpen && store.current"
        class="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
        tabindex="-1"
        @click="onBackdrop"
        @keydown.esc="store._resolve(false)"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />

        <!-- Panel -->
        <Transition
          enter-active-class="duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4 sm:translate-y-0"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="store.current"
            class="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="`modal-title-${store.current.id}`"
          >
            <div class="p-6">

              <!-- Icon + title -->
              <div class="flex items-start gap-4">
                <div
                  class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  :class="ICON_WRAP[store.current.variant ?? 'info']"
                >
                  <svg
                    class="h-5 w-5"
                    :class="ICON_COLOR[store.current.variant ?? 'info']"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" :d="ICON[store.current.variant ?? 'info']" />
                  </svg>
                </div>

                <div class="flex-1 pt-0.5">
                  <h3
                    :id="`modal-title-${store.current.id}`"
                    class="text-base font-bold text-slate-950 dark:text-white"
                  >
                    {{ store.current.title }}
                  </h3>
                  <p class="mt-1.5 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {{ store.current.body }}
                  </p>
                </div>
              </div>

              <!-- Actions -->
              <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  class="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  @click="store._resolve(false)"
                >
                  {{ store.current.cancelLabel ?? 'Cancel' }}
                </button>
                <button
                  type="button"
                  class="inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2"
                  :class="CONFIRM_BTN[store.current.variant ?? 'info']"
                  @click="store._resolve(true)"
                >
                  {{ store.current.confirmLabel ?? 'Confirm' }}
                </button>
              </div>

            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
