<script setup lang="ts">
import { computed } from 'vue'
import { useCart } from '~/composables/useCart'

const props = defineProps<{
  tld: string
  price: number
  popular?: boolean
}>()

const emit = defineEmits<{
  register: [{ tld: string; price: number }]
}>()

const { items, locked } = useCart()

const inCart = computed(() =>
  items.value.some((item) => item.type === 'domain' && item.meta?.tld === props.tld)
)

const buttonDisabled = computed(() => locked.value || inCart.value)

const buttonText = computed(() => {
  if (locked.value) return 'Cart Locked'
  if (inCart.value) return 'Added'
  return 'Register'
})

const buttonClass = computed(() => {
  if (locked.value || inCart.value) {
    return 'cursor-not-allowed bg-slate-300 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
  }

  return 'bg-emerald-600 text-white hover:bg-emerald-700'
})

const handleRegister = () => {
  if (locked.value || inCart.value) return
  emit('register', { tld: props.tld, price: props.price })
}
</script>

<template>
  <article
    class="relative flex h-full flex-col rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
    :class="popular ? 'ring-2 ring-emerald-500 dark:ring-emerald-400' : ''"
  >
    <span
      v-if="popular"
      class="absolute right-4 top-4 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white"
    >
      Popular
    </span>

    <h3 class="mt-4 text-4xl font-black text-slate-950 dark:text-white">
      {{ tld }}
    </h3>

    <p class="mt-4 flex-1 text-sm text-slate-500 dark:text-slate-400">
      Starting at
      <span class="font-bold text-slate-950 dark:text-white">${{ price }}/yr</span>
    </p>

    <button
      type="button"
      class="mt-6 rounded-lg px-4 py-3 text-sm font-bold transition"
      :class="buttonClass"
      :disabled="buttonDisabled"
      @click="handleRegister"
    >
      {{ buttonText }}
    </button>
  </article>
</template>
