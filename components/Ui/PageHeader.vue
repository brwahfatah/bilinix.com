<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  description?: string
}>()
</script>

<template>
  <div class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
    <div class="max-w-3xl">
      <p v-if="eyebrow" class="text-sm font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
        {{ eyebrow }}
      </p>
      <h1 class="mt-2 text-3xl font-black tracking-normal text-slate-950 dark:text-white sm:text-4xl">
        {{ title }}
      </h1>
      <p v-if="description" class="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
        {{ description }}
      </p>
    </div>
    <div v-if="$slots.actions" class="flex flex-wrap gap-3">
      <slot name="actions" />
    </div>
  </div>
</template>
