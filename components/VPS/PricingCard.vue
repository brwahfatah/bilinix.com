<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  plan: {
    name: string
    description: string
    price: number
    monthly?: number
    yearly?: number
    features: string[]
    popular?: boolean
    effectiveBilling?: string
    annualOnly?: boolean
  }
  billing: string
}>()

const savingsPercent = computed(() => {
  if (!props.plan.monthly || !props.plan.yearly) return 0
  return Math.round((1 - props.plan.yearly / (props.plan.monthly * 12)) * 100)
})

const perMonth = computed(() => {
  if (!props.plan.yearly) return 0
  return (props.plan.yearly / 12).toFixed(2)
})
</script>

<template>
  <article
    class="relative flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
    :class="plan.popular && 'ring-2 ring-emerald-500 dark:ring-emerald-400'"
  >
    <div
      v-if="plan.popular"
      class="absolute right-4 top-4 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white"
    >
      Popular
    </div>

    <div class="pr-20">
      <h3 class="text-xl font-bold text-slate-950 dark:text-white">
        {{ plan.name }}
      </h3>
      <p class="mt-3 min-h-12 text-sm leading-6 text-slate-600 dark:text-slate-300">
        {{ plan.description }}
      </p>
    </div>

    <div v-if="plan.annualOnly && billing === 'monthly'" class="mt-6">
      <span class="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-700 dark:bg-amber-400/10 dark:text-amber-400">Annual billing only</span>
    </div>

    <div :class="plan.annualOnly && billing === 'monthly' ? 'mt-4' : 'mt-8'">
      <span class="text-4xl font-black text-slate-950 dark:text-white">${{ plan.price }}</span>
      <span class="text-sm text-slate-500 dark:text-slate-400"> / {{ (plan.effectiveBilling || billing) === 'yearly' ? 'yr' : 'mo' }}</span>
      <p v-if="(plan.effectiveBilling || billing) === 'yearly' && savingsPercent > 0" class="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
        ${{ perMonth }}/mo — save {{ savingsPercent }}% vs monthly
      </p>
    </div>

    <ul class="mt-8 flex-1 space-y-3">
      <li v-for="feature in plan.features" :key="feature" class="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
        <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
          <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="m5 13 4 4L19 7" />
          </svg>
        </span>
        <span>{{ feature }}</span>
      </li>
    </ul>

    <NuxtLink
      to="/auth/signup"
      class="mt-8 inline-flex justify-center rounded-lg bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
    >
      Choose Plan
    </NuxtLink>
  </article>
</template>
