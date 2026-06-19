<script setup lang="ts">
import type { Vps, VpsPowerAction } from '../types/vps'

const props = defineProps<{
  vps: Vps
  loading?: boolean
}>()

const emit = defineEmits<{
  action: [action: VpsPowerAction]
}>()

interface PowerButton {
  action: VpsPowerAction
  label: string
  classes: string
  disabled?: boolean
}

const buttons = computed((): PowerButton[] => [
  {
    action: 'start',
    label: 'Start',
    classes: 'bg-emerald-600 text-white hover:bg-emerald-500',
    disabled: props.vps.status === 'running' || props.vps.status === 'provisioning',
  },
  {
    action: 'reboot',
    label: 'Reboot',
    classes: 'bg-slate-800 text-white hover:bg-slate-700 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100',
    disabled: props.vps.status !== 'running',
  },
  {
    action: 'stop',
    label: 'Shutdown',
    classes: 'bg-amber-500 text-white hover:bg-amber-400',
    disabled: props.vps.status !== 'running',
  },
])
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <h2 class="text-xl font-black text-slate-950 dark:text-white">Power Controls</h2>
    <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
      Run power actions on this server. Status updates automatically.
    </p>

    <div class="mt-6 flex flex-wrap gap-3">
      <button
        v-for="btn in buttons"
        :key="btn.action"
        type="button"
        :disabled="btn.disabled || loading"
        class="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40"
        :class="btn.classes"
        @click="emit('action', btn.action)"
      >
        <svg v-if="loading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        {{ btn.label }}
      </button>
    </div>
  </section>
</template>
