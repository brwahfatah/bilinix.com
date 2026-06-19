<script setup lang="ts">
import type { Vps } from '../types/vps'
import { formatCurrency, formatDate } from '~/utils/formatters'

defineProps<{ vps: Vps }>()
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

    <article class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p class="text-xs font-black uppercase tracking-widest text-slate-400">IP Address</p>
      <p class="mt-2 font-mono text-sm font-bold text-slate-950 dark:text-white">
        {{ vps.ip ?? 'Pending…' }}
      </p>
    </article>

    <article class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p class="text-xs font-black uppercase tracking-widest text-slate-400">Operating System</p>
      <p class="mt-2 text-sm font-bold text-slate-950 dark:text-white">{{ vps.os }}</p>
      <p class="text-xs text-slate-400">{{ vps.region }}</p>
    </article>

    <article class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p class="text-xs font-black uppercase tracking-widest text-slate-400">Resources</p>
      <div class="mt-2 space-y-0.5 text-sm font-bold text-slate-950 dark:text-white">
        <p>{{ vps.spec.cpu }} vCPU · {{ vps.spec.ramGb }}GB RAM</p>
        <p class="text-xs font-semibold text-slate-400">{{ vps.spec.diskGb }}GB SSD · {{ vps.spec.bandwidthTb }}TB BW</p>
      </div>
    </article>

    <article class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p class="text-xs font-black uppercase tracking-widest text-slate-400">Billing</p>
      <p class="mt-2 text-sm font-bold text-slate-950 dark:text-white">
        {{ formatCurrency(vps.monthlyPrice) }}<span class="text-xs font-semibold text-slate-400">/mo</span>
      </p>
      <p class="text-xs text-slate-400">Renews {{ formatDate(vps.expiresAt) }}</p>
    </article>

  </div>
</template>
