<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
}>()
</script>

<template>
  <div :class="['max-w-3xl', align === 'center' ? 'mx-auto text-center' : '']">
    <p v-if="eyebrow" class="text-sm font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
      {{ eyebrow }}
    </p>
    <h2 class="mt-3 text-3xl font-bold tracking-normal text-slate-950 dark:text-white sm:text-4xl">
      {{ title }}
    </h2>
    <p v-if="description" class="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
      {{ description }}
    </p>
  </div>
</template>
