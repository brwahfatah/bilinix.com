<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useCart } from '~/composables/useCart'
import { vpsPlans as staticPlans } from '~/data/site'

type VpsPlan = {
  id: number
  name: string
  tagline?: string
  cpu: string
  ram: string
  storage: string
  bandwidth?: string
  price: number
  whmcs_product_id?: number
}

const route = useRoute()
const { addItem } = useCart()
const config = useRuntimeConfig()

const fallback = staticPlans.map((p) => ({
  id: p.id,
  name: p.name,
  tagline: p.tagline,
  cpu: p.cpu,
  ram: p.ram,
  storage: p.storage,
  bandwidth: p.bandwidth,
  price: p.price,
  whmcs_product_id: p.whmcs_product_id,
}))

const plan = ref<VpsPlan | null>(null)
const hostname = ref('')
const billing = ref(route.query.period === '12' ? 'yearly' : 'monthly')
const os = ref('ubuntu_22')
const location = ref('sbg3')
const loading = ref(false)
const error = ref('')
const added = ref(false)

const osOptions = [
  { value: 'ubuntu_22', label: 'Ubuntu 22.04 LTS' },
  { value: 'ubuntu_24', label: 'Ubuntu 24.04 LTS' },
  { value: 'debian_12', label: 'Debian 12 (Bookworm)' },
  { value: 'almalinux_9', label: 'AlmaLinux 9' },
  { value: 'rocky_9', label: 'Rocky Linux 9' },
  { value: 'windows_2022', label: 'Windows Server 2022 (+$10/mo)' },
]

const locationOptions = [
  { value: 'sbg3', label: 'Strasbourg, France 🇫🇷', dc: 'SBG3' },
  { value: 'gra9', label: 'Gravelines, France 🇫🇷', dc: 'GRA9' },
  { value: 'rbx9', label: 'Roubaix, France 🇫🇷', dc: 'RBX9' },
  { value: 'lim1', label: 'London, UK 🇬🇧', dc: 'LIM1' },
  { value: 'bhs6', label: 'Beauharnois, Canada 🇨🇦', dc: 'BHS6' },
  { value: 'waw1', label: 'Ashburn, USA 🇺🇸', dc: 'WAW1' },
]

const hostnameRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/
const hostnameValid = computed(() => hostname.value.length >= 3 && hostnameRegex.test(hostname.value))
const months = computed(() => (billing.value === 'yearly' ? 12 : 1))
const discount = computed(() => (billing.value === 'yearly' ? 0.15 : 0))

const windowsAddon = computed(() => (os.value === 'windows_2022' ? 10 : 0))

const totalPrice = computed(() => {
  if (!plan.value) return 0
  const base = (plan.value.price + windowsAddon.value) * months.value
  return base - base * discount.value
})

const perMonth = computed(() => {
  if (!plan.value) return 0
  return (plan.value.price + windowsAddon.value) * (1 - discount.value)
})

const canSubmit = computed(() => plan.value && hostnameValid.value && !loading.value)

onMounted(async () => {
  let plans = [...fallback]
  try {
    // Laravel: GET /api/products/grouped → { data: { vps: [...] } }
    const res: any = await $fetch(`${config.public.apiBase}/products/grouped`)
    const apiVps = res?.data?.vps ?? res?.plans
    if (Array.isArray(apiVps) && apiVps.length) {
      plans = apiVps.map((p: any, i: number) => ({
        ...fallback[i] ?? fallback[0],
        id: Number(p.id) || i + 1,
        name: p.name ?? fallback[i]?.name ?? '',
        price: (parseFloat(p.price) || fallback[i]?.price) ?? 0,
        whmcs_product_id: Number(p.id) || fallback[i]?.whmcs_product_id,
      })) as typeof fallback
    }
  } catch {}

  const id = Number(route.query.plan)
  plan.value = plans.find((p) => p.id === id) ?? null
  if (!plan.value) await navigateTo('/vps')
})

const submit = async (dest: 'cart' | 'checkout') => {
  if (!canSubmit.value || !plan.value) return

  loading.value = true
  error.value = ''
  added.value = false

  try {
    await addItem({
      id: crypto.randomUUID(),
      type: 'server',
      name: `${plan.value.name} — ${hostname.value}`,
      price: totalPrice.value,
      quantity: 1,
      period: months.value,
      periodLabel: billing.value === 'yearly' ? 'Yearly' : 'Monthly',
      meta: {
        plan_id: plan.value.id,
        whmcs_product_id: plan.value.whmcs_product_id ?? plan.value.id,
        hostname: hostname.value,
        os: os.value,
        location: location.value,
        product_type: 'vps',
      },
    })

    added.value = true
    await navigateTo(dest === 'cart' ? '/cart' : '/checkout')
  } catch {
    error.value = 'Failed to add to cart. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-6xl">

      <!-- Back link -->
      <NuxtLink to="/vps" class="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
        Back to VPS plans
      </NuxtLink>

      <div v-if="!plan" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />
          <p class="mt-4 text-sm text-slate-500">Loading configurator…</p>
        </div>
      </div>

      <template v-else>
        <!-- Header -->
        <div class="mb-8">
          <p class="text-sm font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Configure</p>
          <h1 class="mt-2 text-4xl font-black tracking-tight text-slate-950 dark:text-white">{{ plan.name }}</h1>
          <p class="mt-2 text-base text-slate-600 dark:text-slate-400">{{ plan.tagline ?? 'Set up your server and deploy in under 2 minutes.' }}</p>
        </div>

        <div class="grid gap-8 lg:grid-cols-[1fr_340px]">

          <!-- Left: config form -->
          <div class="space-y-6">

            <!-- Billing period -->
            <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
              <h2 class="text-sm font-black uppercase tracking-widest text-slate-500">Billing Period</h2>
              <div class="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  class="flex flex-col rounded-xl border-2 p-4 text-left transition"
                  :class="billing === 'monthly'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'"
                  @click="billing = 'monthly'"
                >
                  <span class="font-bold text-slate-950 dark:text-white">Monthly</span>
                  <span class="mt-1 text-sm text-slate-500">Pay month-to-month</span>
                </button>
                <button
                  type="button"
                  class="relative flex flex-col rounded-xl border-2 p-4 text-left transition"
                  :class="billing === 'yearly'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'"
                  @click="billing = 'yearly'"
                >
                  <span class="absolute -top-2.5 right-3 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-black text-white">Save 15%</span>
                  <span class="font-bold text-slate-950 dark:text-white">Annual</span>
                  <span class="mt-1 text-sm text-slate-500">Pay once a year</span>
                </button>
              </div>
            </section>

            <!-- Hostname -->
            <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
              <h2 class="text-sm font-black uppercase tracking-widest text-slate-500">Hostname</h2>
              <div class="mt-4">
                <input
                  v-model="hostname"
                  class="h-12 w-full rounded-xl border bg-white px-4 text-slate-950 outline-none transition focus:ring-2 dark:bg-slate-950 dark:text-white"
                  :class="hostname && !hostnameValid
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20 dark:border-slate-700'"
                  placeholder="my-production-server"
                />
                <p v-if="hostname && !hostnameValid" class="mt-2 text-sm text-rose-600 dark:text-rose-400">
                  Use 3+ lowercase letters, numbers, or hyphens. Must start and end with a letter or number.
                </p>
                <p v-else class="mt-2 text-xs text-slate-400">Lowercase letters, numbers, and hyphens only.</p>
              </div>
            </section>

            <!-- OS -->
            <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
              <h2 class="text-sm font-black uppercase tracking-widest text-slate-500">Operating System</h2>
              <div class="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  v-for="option in osOptions"
                  :key="option.value"
                  type="button"
                  class="flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm font-semibold transition"
                  :class="os === option.value
                    ? 'border-emerald-500 bg-emerald-50 text-slate-950 dark:bg-emerald-500/10 dark:text-white'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300'"
                  @click="os = option.value"
                >
                  <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" :class="os === option.value ? 'bg-emerald-500' : 'bg-slate-100 dark:bg-slate-800'">
                    <svg class="h-3.5 w-3.5" :class="os === option.value ? 'text-white' : 'text-slate-400'" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0H3" />
                    </svg>
                  </div>
                  {{ option.label }}
                </button>
              </div>
            </section>

            <!-- Datacenter -->
            <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
              <h2 class="text-sm font-black uppercase tracking-widest text-slate-500">Datacenter</h2>
              <div class="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  v-for="loc in locationOptions"
                  :key="loc.value"
                  type="button"
                  class="flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition"
                  :class="location === loc.value
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'"
                  @click="location = loc.value"
                >
                  <span class="text-sm font-semibold text-slate-950 dark:text-white">{{ loc.label }}</span>
                  <span class="ml-2 text-[10px] font-bold text-slate-400">{{ loc.dc }}</span>
                </button>
              </div>
            </section>

            <p v-if="error" class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300">
              {{ error }}
            </p>
          </div>

          <!-- Right: order summary -->
          <aside class="h-fit">
            <div class="sticky top-24 rounded-2xl bg-slate-950 p-6 text-white dark:bg-slate-900">
              <p class="text-xs font-black uppercase tracking-widest text-slate-400">Order Summary</p>
              <h2 class="mt-3 text-xl font-black">{{ plan.name }}</h2>

              <!-- Specs -->
              <div class="mt-5 space-y-2.5">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-slate-400">CPU</span>
                  <span class="font-semibold">{{ plan.cpu }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-slate-400">RAM</span>
                  <span class="font-semibold">{{ plan.ram }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-slate-400">Storage</span>
                  <span class="font-semibold">{{ plan.storage }}</span>
                </div>
                <div v-if="plan.bandwidth" class="flex items-center justify-between text-sm">
                  <span class="text-slate-400">Network</span>
                  <span class="font-semibold">{{ plan.bandwidth }}</span>
                </div>
              </div>

              <div class="mt-5 border-t border-slate-800 pt-5">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-slate-400">OS</span>
                  <span class="font-semibold">{{ osOptions.find((o) => o.value === os)?.label ?? os }}</span>
                </div>
                <div class="mt-2 flex items-center justify-between text-sm">
                  <span class="text-slate-400">Location</span>
                  <span class="font-semibold">{{ locationOptions.find((l) => l.value === location)?.dc }}</span>
                </div>
                <div class="mt-2 flex items-center justify-between text-sm">
                  <span class="text-slate-400">Billing</span>
                  <span class="font-semibold capitalize">{{ billing }}</span>
                </div>
              </div>

              <div class="mt-5 border-t border-slate-800 pt-5">
                <div class="flex items-end justify-between">
                  <span class="text-sm text-slate-400">Total</span>
                  <div class="text-right">
                    <div class="text-3xl font-black">${{ totalPrice.toFixed(2) }}</div>
                    <div class="text-xs text-slate-400">
                      {{ billing === 'yearly' ? `($${perMonth.toFixed(2)}/mo, billed annually)` : '/month' }}
                    </div>
                  </div>
                </div>
                <div v-if="billing === 'yearly'" class="mt-2 rounded-lg bg-emerald-500/15 px-3 py-2 text-center text-xs font-bold text-emerald-400">
                  You save ${{ ((plan.price + windowsAddon) * 12 * 0.15).toFixed(2) }} vs monthly
                </div>
              </div>

              <div class="mt-6 space-y-3">
                <button
                  type="button"
                  class="w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="!canSubmit"
                  @click="submit('checkout')"
                >
                  {{ loading ? 'Adding…' : 'Deploy Now →' }}
                </button>
                <button
                  type="button"
                  class="w-full rounded-xl border border-slate-700 py-3.5 text-sm font-bold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="!canSubmit"
                  @click="submit('cart')"
                >
                  Add to Cart
                </button>
              </div>

              <p v-if="!hostnameValid && hostname === ''" class="mt-3 text-center text-xs text-slate-500">
                Enter a hostname to continue.
              </p>
            </div>
          </aside>
        </div>
      </template>
    </div>
  </div>
</template>
