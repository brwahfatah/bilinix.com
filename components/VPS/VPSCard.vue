<script setup lang="ts">
import { computed } from 'vue'

type VpsPlan = {
  id: number
  name: string
  cpu: string
  ram: string
  storage: string
  price: number
  popular?: boolean
}

const props = defineProps<{
  plan: VpsPlan
  disabled?: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  order: [{ plan: VpsPlan; period: number }]
}>()

const isDisabled = computed(() => props.disabled || props.loading)

const submit = (period: number) => {
  if (isDisabled.value) return
  emit('order', { plan: props.plan, period })
}
</script>

<template>
  <article
    class="relative flex h-full flex-col rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
    :class="[plan.popular ? 'ring-2 ring-emerald-500 dark:ring-emerald-400' : '', disabled ? 'opacity-80' : '']"
  >
    <span
      v-if="plan.popular"
      class="absolute right-4 top-4 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white"
    >
      Popular
    </span>

    <div class="pr-20">
      <h3 class="text-xl font-bold text-slate-950 dark:text-white">
        {{ plan.name }}
      </h3>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Production-ready virtual server
      </p>
    </div>

    <div class="mt-6">
      <span class="text-4xl font-black text-slate-950 dark:text-white">${{ plan.price }}</span>
      <span class="text-sm text-slate-500 dark:text-slate-400"> / mo</span>
    </div>

    <ul class="mt-6 flex-1 space-y-3 text-sm text-slate-700 dark:text-slate-300">
      <li class="flex items-center gap-3">
        <span class="h-2 w-2 rounded-full bg-emerald-500" />
        {{ plan.cpu }}
      </li>
      <li class="flex items-center gap-3">
        <span class="h-2 w-2 rounded-full bg-emerald-500" />
        {{ plan.ram }}
      </li>
      <li class="flex items-center gap-3">
        <span class="h-2 w-2 rounded-full bg-emerald-500" />
        {{ plan.storage }}
      </li>
      <li class="flex items-center gap-3">
        <span class="h-2 w-2 rounded-full bg-emerald-500" />
        Full root access
      </li>
      <li class="flex items-center gap-3">
        <span class="h-2 w-2 rounded-full bg-emerald-500" />
        1 Gbps network
      </li>
    </ul>

    <div class="mt-8 grid gap-3">
      <button
        type="button"
        class="rounded-lg px-4 py-3 text-sm font-bold transition"
        :class="isDisabled ? 'cursor-not-allowed bg-slate-300 text-slate-600 dark:bg-slate-800 dark:text-slate-400' : 'bg-emerald-600 text-white hover:bg-emerald-700'"
        :disabled="isDisabled"
        @click="submit(1)"
      >
        <span v-if="loading">Preparing...</span>
        <span v-else-if="disabled">Added to Cart</span>
        <span v-else>Deploy Monthly</span>
      </button>

      <button
        type="button"
        class="rounded-lg border px-4 py-3 text-sm font-bold transition"
        :class="isDisabled ? 'cursor-not-allowed border-slate-300 text-slate-500 dark:border-slate-800 dark:text-slate-500' : 'border-slate-300 text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800'"
        :disabled="isDisabled"
        @click="submit(12)"
      >
        Deploy Yearly
      </button>
    </div>
  </article>
</template>
