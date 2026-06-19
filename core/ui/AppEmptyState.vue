<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  description?: string
  tone?: 'neutral' | 'danger'
  icon?: 'server' | 'domain' | 'invoice' | 'ticket' | 'search' | 'default'
}>(), {
  tone: 'neutral',
  icon: 'default',
})

const ICONS = {
  server: 'M21.75 17.25v.75a3 3 0 01-3 3H5.25a3 3 0 01-3-3v-.75m16.5-7.5v.75a3 3 0 01-3 3H5.25a3 3 0 01-3-3v-.75m16.5-7.5v.75a3 3 0 01-3 3H5.25a3 3 0 01-3-3V2.25m16.5 0H5.25',
  domain: 'M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244',
  invoice: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z',
  ticket: 'M16.5 6v.75a3.75 3.75 0 01-7.5 0V6a3.75 3.75 0 017.5 0zM11.25 3h1.5m-1.5 0A3.75 3.75 0 007.5 6.75m3.75-3.75A3.75 3.75 0 0116.5 6.75M3 16.5v1.875C3 19.26 3.74 20 4.625 20H19.5c.864 0 1.5-.614 1.5-1.5V16.5m-18 0V12m18 4.5V12m-18 0V8.25C3 7.26 3.74 6.5 4.625 6.5H7.5m12 5.75v-5c0-.966-.8-1.75-1.75-1.75H16.5',
  search: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z',
  default: 'M4 6h16M4 12h10M4 18h7',
}
</script>

<template>
  <div
    class="rounded-2xl border p-10 text-center"
    :class="tone === 'danger'
      ? 'border-rose-200 bg-rose-50 dark:border-rose-400/20 dark:bg-rose-400/10'
      : 'border-dashed border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'"
  >
    <div
      class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
      :class="tone === 'danger'
        ? 'bg-rose-100 dark:bg-rose-400/20'
        : 'bg-slate-100 dark:bg-slate-800'"
    >
      <slot name="icon">
        <svg
          class="h-7 w-7"
          :class="tone === 'danger' ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500'"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" :d="ICONS[icon]" />
        </svg>
      </slot>
    </div>

    <h3
      class="mt-5 text-xl font-black"
      :class="tone === 'danger'
        ? 'text-rose-800 dark:text-rose-200'
        : 'text-slate-950 dark:text-white'"
    >
      {{ title }}
    </h3>

    <p
      v-if="description"
      class="mx-auto mt-2 max-w-sm text-sm leading-6"
      :class="tone === 'danger'
        ? 'text-rose-700 dark:text-rose-300'
        : 'text-slate-500 dark:text-slate-400'"
    >
      {{ description }}
    </p>

    <div v-if="$slots.actions" class="mt-6 flex justify-center gap-3">
      <slot name="actions" />
    </div>
  </div>
</template>
