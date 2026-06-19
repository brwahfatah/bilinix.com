<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCart, type CartItem } from '~/composables/useCart'

const router = useRouter()
const auth = useAuthStore()
const { items, total, removeItem } = useCart()
const loading = ref(false)

const cartItems = computed(() => items.value)
const cartEmpty = computed(() => !items.value.length)
const formatPrice = (v: number) => Number(v || 0).toFixed(2)
const itemTotal = (item: CartItem) => (item.price || 0) * (item.quantity || 1)

const typeConfig: Record<string, { label: string; color: string; iconBg: string; icon: string }> = {
  server: { label: 'VPS', color: 'text-sky-600 dark:text-sky-400', iconBg: 'bg-sky-50 dark:bg-sky-500/10', icon: 'M21.75 17.25v.75a3 3 0 01-3 3H5.25a3 3 0 01-3-3v-.75m16.5-7.5v.75a3 3 0 01-3 3H5.25a3 3 0 01-3-3v-.75m16.5-7.5v.75a3 3 0 01-3 3H5.25a3 3 0 01-3-3V2.25m16.5 0H5.25' },
  hosting: { label: 'Hosting', color: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: 'M12 21a9 9 0 009-9m-9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9h18' },
  dedicated: { label: 'Dedicated', color: 'text-violet-600 dark:text-violet-400', iconBg: 'bg-violet-50 dark:bg-violet-500/10', icon: 'm21 7.5-2.25-1.313M21 7.5v2.25m0-2.25-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15' },
  domain: { label: 'Domain', color: 'text-amber-600 dark:text-amber-400', iconBg: 'bg-amber-50 dark:bg-amber-500/10', icon: 'M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244' },
}

const DEFAULT_TYPE = { label: 'Service', color: 'text-sky-600 dark:text-sky-400', iconBg: 'bg-sky-50 dark:bg-sky-500/10', icon: 'M21.75 17.25v.75a3 3 0 01-3 3H5.25a3 3 0 01-3-3v-.75m16.5-7.5v.75a3 3 0 01-3 3H5.25a3 3 0 01-3-3v-.75m16.5-7.5v.75a3 3 0 01-3 3H5.25a3 3 0 01-3-3V2.25m16.5 0H5.25' }
const getType = (item: CartItem) => typeConfig[item.type] ?? DEFAULT_TYPE

const proceedToCheckout = async () => {
  if (cartEmpty.value || loading.value) return
  loading.value = true
  try {
    if (auth.isAuthenticated) {
      await router.push('/checkout')
    } else {
      await router.push({ path: '/auth/login', query: { redirect: '/checkout?auto=1' } })
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 py-12 dark:bg-[#09090b] sm:px-6 lg:px-8">
    <div class="mx-auto max-w-5xl space-y-8">

      <!-- Header -->
      <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p class="text-xs font-black uppercase tracking-widest text-slate-400">Shopping</p>
          <h1 class="mt-1 text-3xl font-black text-slate-950 dark:text-white">Your Cart</h1>
        </div>
        <div class="flex gap-3">
          <NuxtLink to="/hosting" class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900">
            + Add Hosting
          </NuxtLink>
          <NuxtLink to="/vps" class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900">
            + Add VPS
          </NuxtLink>
          <NuxtLink to="/domains" class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900">
            + Add Domain
          </NuxtLink>
        </div>
      </div>

      <!-- Empty cart -->
      <div v-if="cartEmpty" class="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
        <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
          <svg class="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
        </div>
        <h2 class="mt-5 text-xl font-black text-slate-950 dark:text-white">Your cart is empty</h2>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Browse hosting plans, VPS, dedicated servers, or domains to get started.</p>
        <div class="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <NuxtLink to="/hosting" class="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-500">
            View Hosting Plans
          </NuxtLink>
          <NuxtLink to="/domains" class="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-white dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900">
            Search Domains
          </NuxtLink>
        </div>
      </div>

      <!-- Cart items + summary -->
      <div v-else class="grid gap-8 lg:grid-cols-[1fr_320px]">
        <section class="space-y-3">
          <article
            v-for="item in cartItems"
            :key="`${item.id}-${item.period}`"
            class="rounded-2xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900"
          >
            <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div class="flex items-start gap-4">
                <!-- Type icon -->
                <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" :class="getType(item).iconBg">
                  <svg class="h-5 w-5" :class="getType(item).color" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" :d="getType(item).icon" />
                  </svg>
                </div>
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <h2 class="text-base font-black text-slate-950 dark:text-white">{{ item.name }}</h2>
                    <span class="rounded-full px-2.5 py-0.5 text-[11px] font-black capitalize"
                      :class="`${getType(item).iconBg} ${getType(item).color}`">
                      {{ getType(item).label }}
                    </span>
                  </div>

                  <dl class="mt-3 grid gap-x-6 gap-y-2 text-xs text-slate-600 dark:text-slate-400 sm:grid-cols-2">
                    <div class="flex gap-1.5">
                      <dt class="font-bold uppercase tracking-widest text-slate-400">Period</dt>
                      <dd>{{ item.periodLabel || `${item.period} month${item.period > 1 ? 's' : ''}` }}</dd>
                    </div>
                    <div v-if="item.meta?.os" class="flex gap-1.5">
                      <dt class="font-bold uppercase tracking-widest text-slate-400">OS</dt>
                      <dd>{{ item.meta.os }}</dd>
                    </div>
                    <div v-if="item.meta?.location" class="flex gap-1.5">
                      <dt class="font-bold uppercase tracking-widest text-slate-400">Location</dt>
                      <dd>{{ item.meta.location }}</dd>
                    </div>
                    <div v-if="item.meta?.domain || item.meta?.tld" class="flex gap-1.5">
                      <dt class="font-bold uppercase tracking-widest text-slate-400">TLD</dt>
                      <dd>{{ item.meta?.tld }}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div class="shrink-0 text-right">
                <p class="text-xl font-black text-slate-950 dark:text-white">${{ formatPrice(itemTotal(item)) }}</p>
                <button
                  type="button"
                  class="mt-2 text-xs font-bold text-rose-500 transition hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
                  @click="removeItem(item.id, item.period)"
                >
                  Remove
                </button>
              </div>
            </div>
          </article>
        </section>

        <!-- Order summary sidebar -->
        <aside>
          <div class="sticky top-20 rounded-2xl bg-slate-950 p-6 text-white dark:bg-slate-900">
            <p class="text-xs font-black uppercase tracking-widest text-slate-400">Summary</p>

            <div class="mt-5 space-y-3">
              <div v-for="item in cartItems" :key="item.id" class="flex items-center justify-between text-sm">
                <span class="truncate text-slate-300 max-w-[160px]">{{ item.name }}</span>
                <span class="font-semibold">${{ formatPrice(itemTotal(item)) }}</span>
              </div>
            </div>

            <div class="mt-5 border-t border-slate-800 pt-5">
              <div class="flex items-end justify-between">
                <span class="text-sm text-slate-400">Total</span>
                <span class="text-3xl font-black">${{ formatPrice(total) }}</span>
              </div>
              <p class="mt-1 text-xs text-slate-500">{{ cartItems.length }} item{{ cartItems.length > 1 ? 's' : '' }}</p>
            </div>

            <button
              type="button"
              class="mt-6 w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="loading || cartEmpty"
              @click="proceedToCheckout"
            >
              {{ loading ? 'Redirecting…' : 'Proceed to Checkout →' }}
            </button>
            <p class="mt-3 text-center text-[11px] text-slate-500">
              Secure checkout. Service provisioning begins after payment confirmation.
            </p>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>
