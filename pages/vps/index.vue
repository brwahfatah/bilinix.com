<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { vpsPlans as staticPlans } from '~/data/site'
import { useCart } from '~/composables/useCart'

type VpsPlan = {
  id: number
  name: string
  tagline: string
  cpu: string
  ram: string
  storage: string
  bandwidth: string
  price: number
  popular?: boolean
  badge?: string
  whmcs_product_id?: number
  features: string[]
}

const config = useRuntimeConfig()
const router = useRouter()
const { items } = useCart()

const plans = ref<VpsPlan[]>([...staticPlans])
const loadingPlans = ref(false)

const serverInCart = (planId: number) =>
  items.value.some((item) => item.type === 'server' && item.meta?.plan_id === planId)

const goToConfigure = (plan: VpsPlan) => {
  router.push({ path: '/vps/configure', query: { plan: String(plan.id) } })
}

const ovhLocations = [
  { city: 'Frankfurt', country: 'Germany', flag: '🇩🇪', dc: 'FRA1' },
  { city: 'Amsterdam', country: 'Netherlands', flag: '🇳🇱', dc: 'AMS2' },
  { city: 'Paris', country: 'France', flag: '🇫🇷', dc: 'CDG1' },
  { city: 'London', country: 'UK', flag: '🇬🇧', dc: 'LON1' },
  { city: 'Toronto', country: 'Canada', flag: '🇨🇦', dc: 'YYZ1' },
  { city: 'New York', country: 'USA', flag: '🇺🇸', dc: 'NYC1' },
]

const techSpecs = [
  { label: 'Virtualisation', value: 'KVM' },
  { label: 'Network', value: 'Up to 2 Gbps' },
  { label: 'IPv4', value: '1 included' },
  { label: 'IPv6', value: '/128 block' },
  { label: 'Boot time', value: '< 2 minutes' },
  { label: 'OS options', value: '8 templates' },
  { label: 'Snapshots', value: 'Comfort+' },
  { label: 'DDoS', value: 'All plans' },
]

onMounted(async () => {
  loadingPlans.value = true
  try {
    // Laravel: GET /api/products/grouped → { data: { vps: [...] } }
    const res = await $fetch(`${config.public.apiBase}/products/grouped`) as {
      data?: { vps?: Array<{ id: string; name: string; price: string; featured?: boolean }> }
      plans?: VpsPlan[]
    }
    const apiVps = res?.data?.vps ?? res?.plans
    if (Array.isArray(apiVps) && apiVps.length) {
      plans.value = apiVps.map((p: any, i: number) => ({
        ...staticPlans[i] ?? {},
        id: Number(p.id) || i + 1,
        name: p.name ?? staticPlans[i]?.name ?? '',
        price: (parseFloat(p.price) || staticPlans[i]?.price) ?? 0,
        popular: p.featured ?? false,
      })) as VpsPlan[]
    }
  } catch {
    plans.value = [...staticPlans]
  } finally {
    loadingPlans.value = false
  }
})
</script>

<template>
  <div class="bg-white dark:bg-slate-950">

    <!-- ───── HERO ───── -->
    <section class="relative overflow-hidden bg-[#020617]">
      <div class="absolute inset-0 bg-grid-pattern-dark bg-grid-60 opacity-40" />
      <div class="absolute -left-48 -top-32 h-[500px] w-[500px] rounded-full bg-sky-500/10 blur-3xl" />
      <div class="absolute -right-48 top-20 h-[400px] w-[400px] rounded-full bg-emerald-500/8 blur-3xl" />

      <div class="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:grid lg:grid-cols-[1fr_0.85fr] lg:items-center lg:gap-12 lg:px-8">
        <div class="max-w-2xl">
          <div class="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 animate-enter anim-d0">
            <span class="h-1.5 w-1.5 rounded-full bg-sky-400" />
            <span class="text-xs font-semibold text-sky-400">KVM · NVMe SSD · Enterprise backbone</span>
          </div>

          <h1 class="mt-6 text-5xl font-black leading-[1.08] tracking-tight text-white sm:text-6xl animate-enter anim-d0">
            Cloud VPS
            <br />
            <span class="bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">with full control.</span>
          </h1>

          <p class="mt-6 text-lg leading-8 text-slate-400 animate-enter anim-d100">
            KVM virtualisation, NVMe SSD, root access. Deploy in under 2 minutes on OVH's global network. Cancel anytime.
          </p>

          <div class="mt-8 flex flex-col gap-3 sm:flex-row animate-enter anim-d200">
            <a href="#plans" class="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-sky-400">
              See Plans
              <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m19 9 7-7-7-7" /></svg>
            </a>
            <NuxtLink to="/dedicated" class="inline-flex items-center justify-center rounded-xl border border-slate-700 px-6 py-3.5 text-sm font-bold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800">
              Need dedicated? →
            </NuxtLink>
          </div>

          <div class="mt-10 flex flex-wrap items-center gap-4 animate-enter anim-d200">
            <span class="flex items-center gap-2 text-sm text-slate-400">
              <svg class="h-4 w-4 text-sky-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
              Full root / SSH access
            </span>
            <span class="flex items-center gap-2 text-sm text-slate-400">
              <svg class="h-4 w-4 text-sky-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
              DDoS protection included
            </span>
            <span class="flex items-center gap-2 text-sm text-slate-400">
              <svg class="h-4 w-4 text-sky-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
              Hourly billing available
            </span>
          </div>
        </div>

        <!-- Right: spec sheet mock -->
        <div class="mt-12 hidden lg:block animate-enter anim-d300">
          <div class="animate-float space-y-3 rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div class="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <p class="text-xs font-bold uppercase tracking-widest text-slate-500">VPS Comfort</p>
                <p class="mt-1 text-2xl font-black text-white">$11.99<span class="text-sm font-semibold text-slate-400">/mo</span></p>
              </div>
              <span class="rounded-full bg-sky-500/15 px-3 py-1 text-xs font-bold text-sky-400">Popular</span>
            </div>
            <div class="grid grid-cols-2 gap-3 py-2">
              <div class="rounded-xl bg-slate-950 p-3">
                <p class="text-[10px] text-slate-500">CPU</p>
                <p class="mt-1 text-sm font-black text-white">4 vCores</p>
              </div>
              <div class="rounded-xl bg-slate-950 p-3">
                <p class="text-[10px] text-slate-500">RAM</p>
                <p class="mt-1 text-sm font-black text-white">4 GB DDR5</p>
              </div>
              <div class="rounded-xl bg-slate-950 p-3">
                <p class="text-[10px] text-slate-500">Storage</p>
                <p class="mt-1 text-sm font-black text-white">80 GB NVMe</p>
              </div>
              <div class="rounded-xl bg-slate-950 p-3">
                <p class="text-[10px] text-slate-500">Bandwidth</p>
                <p class="mt-1 text-sm font-black text-white">500 Mbps</p>
              </div>
            </div>
            <div class="rounded-xl bg-slate-950 p-4">
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Available datacenters</p>
              <div class="flex flex-wrap gap-2">
                <span v-for="loc in ovhLocations.slice(0,4)" :key="loc.dc" class="text-[11px] rounded bg-slate-800 px-2 py-1 text-slate-300">{{ loc.flag }} {{ loc.dc }}</span>
              </div>
            </div>
            <button class="w-full rounded-xl bg-sky-500 py-3 text-sm font-bold text-white hover:bg-sky-400 transition">
              Configure & Deploy →
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ───── TECH SPECS BAR ───── -->
    <section class="border-b border-slate-200 bg-slate-50 px-4 py-6 dark:border-slate-800 dark:bg-slate-900">
      <div class="mx-auto max-w-7xl">
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          <div v-for="spec in techSpecs" :key="spec.label" class="text-center">
            <p class="text-[11px] font-bold uppercase tracking-widest text-slate-400">{{ spec.label }}</p>
            <p class="mt-1 text-sm font-black text-slate-950 dark:text-white">{{ spec.value }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ───── VPS PLANS ───── -->
    <section id="plans" class="px-4 py-20 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="mx-auto max-w-xl text-center">
          <p class="text-sm font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400">Plans</p>
          <h2 class="mt-3 text-4xl font-black tracking-tight text-slate-950 dark:text-white">Choose your VPS</h2>
          <p class="mt-3 text-base text-slate-600 dark:text-slate-400">All plans billed monthly. Annual discount available at checkout.</p>
        </div>

        <div class="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <article
            v-for="(plan, i) in plans"
            :key="plan.id"
            class="relative flex flex-col rounded-2xl border p-6 shadow-card transition hover:shadow-card-hover animate-enter"
            :style="{ animationDelay: `${400 + i * 75}ms` }"
            :class="plan.popular
              ? 'border-sky-500/40 bg-slate-950 ring-1 ring-sky-500/20'
              : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'"
          >
            <div v-if="plan.badge" class="absolute -top-3.5 left-5">
              <span class="rounded-full px-3 py-1 text-xs font-black"
                :class="plan.popular ? 'bg-sky-500 text-white' : 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'">
                {{ plan.badge }}
              </span>
            </div>

            <p class="text-xs font-black uppercase tracking-widest"
              :class="plan.popular ? 'text-sky-400' : 'text-slate-500 dark:text-slate-400'">
              {{ plan.name }}
            </p>
            <p class="mt-1 text-xs"
              :class="plan.popular ? 'text-slate-400' : 'text-slate-500'">
              {{ plan.tagline }}
            </p>

            <div class="mt-5 flex items-end gap-1">
              <span class="text-4xl font-black tabular-nums"
                :class="plan.popular ? 'text-white' : 'text-slate-950 dark:text-white'">
                ${{ plan.price.toFixed(2) }}
              </span>
              <span class="mb-1 text-xs font-semibold text-slate-400">/mo</span>
            </div>

            <!-- Spec pills -->
            <div class="mt-5 grid grid-cols-2 gap-2">
              <div class="rounded-lg p-2.5 text-center" :class="plan.popular ? 'bg-slate-900' : 'bg-slate-50 dark:bg-slate-950'">
                <p class="text-[10px] font-semibold" :class="plan.popular ? 'text-slate-500' : 'text-slate-400'">CPU</p>
                <p class="mt-0.5 text-xs font-black" :class="plan.popular ? 'text-white' : 'text-slate-900 dark:text-white'">{{ plan.cpu }}</p>
              </div>
              <div class="rounded-lg p-2.5 text-center" :class="plan.popular ? 'bg-slate-900' : 'bg-slate-50 dark:bg-slate-950'">
                <p class="text-[10px] font-semibold" :class="plan.popular ? 'text-slate-500' : 'text-slate-400'">RAM</p>
                <p class="mt-0.5 text-xs font-black" :class="plan.popular ? 'text-white' : 'text-slate-900 dark:text-white'">{{ plan.ram }}</p>
              </div>
              <div class="rounded-lg p-2.5 text-center" :class="plan.popular ? 'bg-slate-900' : 'bg-slate-50 dark:bg-slate-950'">
                <p class="text-[10px] font-semibold" :class="plan.popular ? 'text-slate-500' : 'text-slate-400'">Storage</p>
                <p class="mt-0.5 text-xs font-black" :class="plan.popular ? 'text-white' : 'text-slate-900 dark:text-white'">{{ plan.storage }}</p>
              </div>
              <div class="rounded-lg p-2.5 text-center" :class="plan.popular ? 'bg-slate-900' : 'bg-slate-50 dark:bg-slate-950'">
                <p class="text-[10px] font-semibold" :class="plan.popular ? 'text-slate-500' : 'text-slate-400'">Network</p>
                <p class="mt-0.5 text-xs font-black" :class="plan.popular ? 'text-white' : 'text-slate-900 dark:text-white'">{{ plan.bandwidth }}</p>
              </div>
            </div>

            <ul class="mt-5 flex-1 space-y-2">
              <li v-for="feat in plan.features" :key="feat" class="flex items-center gap-2 text-xs">
                <svg class="h-3.5 w-3.5 shrink-0" :class="plan.popular ? 'text-sky-400' : 'text-emerald-500'"
                  fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <span :class="plan.popular ? 'text-slate-300' : 'text-slate-600 dark:text-slate-400'">{{ feat }}</span>
              </li>
            </ul>

            <button
              type="button"
              class="mt-6 w-full rounded-xl py-3 text-sm font-bold transition"
              :class="serverInCart(plan.id)
                ? 'bg-emerald-600 text-white'
                : plan.popular
                  ? 'bg-sky-500 text-white hover:bg-sky-400'
                  : 'bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100'"
              @click="goToConfigure(plan)"
            >
              {{ serverInCart(plan.id) ? 'In Cart — Configure' : 'Deploy VPS' }}
            </button>
          </article>
        </div>
      </div>
    </section>

    <!-- ───── DATACENTER LOCATIONS ───── -->
    <section class="border-y border-slate-200 bg-slate-50 px-4 py-16 dark:border-slate-800 dark:bg-slate-900/30 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p class="text-sm font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400">OVH Datacenters</p>
            <h2 class="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">Deploy closer to your users</h2>
            <p class="mt-3 max-w-lg text-base text-slate-600 dark:text-slate-400">
              Choose your datacenter at configuration. All locations share OVH's backbone and DDoS protection.
            </p>
          </div>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div
              v-for="loc in ovhLocations"
              :key="loc.dc"
              class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900"
            >
              <span class="text-2xl">{{ loc.flag }}</span>
              <div>
                <p class="text-sm font-bold text-slate-950 dark:text-white">{{ loc.city }}</p>
                <p class="text-xs text-slate-500">{{ loc.dc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ───── CTA ───── -->
    <section class="px-4 py-20 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="relative overflow-hidden rounded-3xl bg-[#020617] p-10 text-center">
          <div class="absolute inset-0 bg-grid-pattern-dark bg-grid-60 opacity-30" />
          <div class="absolute -left-32 top-0 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
          <div class="relative">
            <h2 class="text-3xl font-black text-white">Deploy your VPS in under 2 minutes.</h2>
            <p class="mt-3 text-slate-400">Root access, KVM, NVMe SSD. No contracts. Cancel anytime.</p>
            <div class="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="#plans" class="rounded-xl bg-sky-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-sky-400">
                View VPS plans
              </a>
              <NuxtLink to="/dedicated" class="rounded-xl border border-slate-700 px-6 py-3 text-sm font-bold text-slate-300 transition hover:bg-slate-800">
                Need dedicated servers? →
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
