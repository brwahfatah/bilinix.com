<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  description?: string
  tone?: 'neutral' | 'danger'
}>(), {
  tone: 'neutral'
})
</script>

<template>
  <div
    class="rounded-lg border p-8 text-center"
    :class="tone === 'danger'
      ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300'
      : 'border-dashed border-slate-300 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'"
  >
    <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
      <slot name="icon">
        <svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h10M4 18h7" />
        </svg>
      </slot>
    </div>
    <h2 class="mt-5 text-xl font-bold text-slate-950 dark:text-white">
      {{ title }}
    </h2>
    <p v-if="description" class="mx-auto mt-2 max-w-md text-sm leading-6">
      {{ description }}
    </p>
    <div v-if="$slots.actions" class="mt-6 flex justify-center gap-3">
      <slot name="actions" />
    </div>
  </div>
</template>
