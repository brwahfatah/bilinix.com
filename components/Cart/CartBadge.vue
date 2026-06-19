<template>
  <NuxtLink
    to="/cart"
    class="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
    aria-label="Open cart"
    title="Cart"
  >
    <svg
      class="h-5 w-5"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M3 4h2l2.2 10.4A2 2 0 0 0 9.1 16h7.8a2 2 0 0 0 1.9-1.4L21 7H6M9 20h.01M17 20h.01" />
    </svg>

    <span
      v-if="count"
      class="absolute -right-1.5 -top-1.5 min-w-5 rounded-full bg-emerald-600 px-1.5 py-0.5 text-center text-xs font-bold leading-4 text-white"
      :class="animate && 'animate-bounce'"
    >
      {{ count }}
    </span>
  </NuxtLink>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useCart } from '~/composables/useCart'

const { count, lastAction } = useCart()
const animate = ref(false)

watch(lastAction, (val) => {
  if (val === 'add') {
    animate.value = true
    setTimeout(() => (animate.value = false), 600)
  }
})
</script>
