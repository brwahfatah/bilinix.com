<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status?: string | null
}>()

const label = computed(() => props.status || 'unknown')

const classes = computed(() => {
  const status = label.value.toLowerCase()

  if (['active', 'running', 'paid', 'enabled', 'available'].includes(status)) {
    return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20'
  }

  if (['pending', 'provisioning', 'rebooting', 'unpaid'].includes(status)) {
    return 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20'
  }

  if (['stopped', 'expired', 'suspended', 'terminated', 'failed', 'taken'].includes(status)) {
    return 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20'
  }

  return 'bg-slate-100 text-slate-700 ring-slate-600/10 dark:bg-slate-800 dark:text-slate-300 dark:ring-white/10'
})
</script>

<template>
  <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold capitalize ring-1" :class="classes">
    {{ label }}
  </span>
</template>
