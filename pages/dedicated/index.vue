<script setup lang="ts">
import { useRouter } from 'vue-router'
import { dedicatedPlans } from '~/data/site'
import { useCart } from '~/composables/useCart'

const router = useRouter()
const { addItem, items } = useCart()

const serverInCart = (planId: number) =>
  items.value.some((item) => item.type === 'server' && item.meta?.whmcs_product_id === planId)

const orderPlan = async (plan: typeof dedicatedPlans[0]) => {
  if (serverInCart(plan.id)) {
    router.push('/cart')
    return
  }

  await addItem({
    id: `dedicated-${plan.id}`,
    type: 'server',
    name: `Dedicated ${plan.name}`,
    price: plan.price,
    period: 1,
    periodLabel: 'Monthly',
    meta: {
      whmcs_product_id: plan.whmcs_product_id || plan.id,
      plan_id: plan.id,
      product_type: 'dedicated',
      provider: plan.provider,
      location: plan.location,
    },
  })

  router.push('/cart')
}

const dedicatedFeatures = [
  { title: 'Full hardware access', desc: 'You own every cycle. No sharing, no noisy neighbours. Dedicated CPU, RAM, and storage.' },
  { title: 'Enterprise Anti-DDoS', desc: 'Integrated DDoS mitigation on every server. Enterprise-grade protection, no extra cost.' },
  { title: 'IPMI / iDRAC', desc: 'Out-of-band management. Reboot, reinstall OS, and access the console remotely even when the OS is down.' },
  { title: 'Unmetered bandwidth', desc: 'All dedicated plans include unmetered outbound traffic on a 1 Gbps or 2 Gbps uplink.' },
  { title: 'SLA hardware replacement', desc: 'Guaranteed hardware replacement within 24 hours. Critical parts within 4 hours.' },
  { title: 'IPv4 + /64 IPv6 block', desc: 'Each server includes 1 dedicated IPv4 and a /64 IPv6 block at no additional charge.' },
]
</script>

<template>
  <div class="bg-white dark:bg-slate-950">

    <!-- ───── HERO ───── -->
    <section class="relative overflow-hidden bg-[#020617]">
      <div class="absolute inset-0 bg-grid-pattern-dark bg-grid-60 opacity-40" />
      <div class="absolute -left-48 -top-32 h-[500px] w-[500px] rounded-full bg-violet-500/10 blur-3xl" />
      <div class="absolute -right-48 top-20 h-[400px] w-[400px] rounded-full bg-rose-500/8 blur-3xl" />

      <div class="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-3xl text-center">
          <div class="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 animate-enter anim-d0">
            <span class="h-1.5 w-1.5 rounded-full bg-violet-400" />
            <span class="text-xs font-semibold text-violet-400">Bare-metal · Enterprise infrastructure · Full IPMI access</span>
          </div>

          <h1 class="mt-6 text-5xl font-black leading-[1.08] tracking-tight text-white sm:text-6xl animate-enter anim-d0">
            Dedicated Servers
            <br />
            <span class="bg-gradient-to-r from-violet-400 to-rose-400 bg-clip-text text-transparent">enterprise hardware.</span>
          </h1>

          <p class="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-400 animate-enter anim-d100">
            Entire physical servers, exclusively yours. Enterprise DDR4 ECC RAM, NVMe storage, and global anti-DDoS protection. No hypervisor overhead.
          </p>

          <div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row animate-enter anim-d200">
            <a href="#plans" class="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-violet-500">
              Compare Servers
              <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m19 9 7-7-7-7" /></svg>
            </a>
            <NuxtLink to="/vps" class="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-6 py-3.5 text-sm font-bold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800">
              Need VPS instead? →
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- ───── FEATURES ───── -->
    <section class="px-4 py-16 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="(feat, i) in dedicatedFeatures"
            :key="feat.title"
            class="rounded-2xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900 animate-enter"
            :style="{ animationDelay: `${i * 75}ms` }"
          >
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/10">
              <svg class="h-5 w-5 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <h3 class="mt-4 font-bold text-slate-950 dark:text-white">{{ feat.title }}</h3>
            <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{{ feat.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ───── PLANS ───── -->
    <section id="plans" class="border-y border-slate-200 bg-slate-50 px-4 py-20 dark:border-slate-800 dark:bg-slate-900/30 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="mx-auto max-w-xl text-center">
          <p class="text-sm font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">Servers</p>
          <h2 class="mt-3 text-4xl font-black tracking-tight text-slate-950 dark:text-white">Bare-metal server lineup</h2>
          <p class="mt-3 text-base text-slate-600 dark:text-slate-400">All servers include IPMI access, anti-DDoS, and unmetered bandwidth.</p>
        </div>

        <div class="mt-12 grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
          <article
            v-for="(plan, i) in dedicatedPlans"
            :key="plan.id"
            class="relative flex flex-col rounded-2xl border p-6 shadow-card transition hover:shadow-card-hover animate-enter"
            :style="{ animationDelay: `${400 + i * 75}ms` }"
            :class="plan.popular
              ? 'border-violet-500/40 bg-slate-950 ring-1 ring-violet-500/20'
              : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'"
          >
            <div v-if="plan.badge" class="absolute -top-3.5 left-5">
              <span class="rounded-full px-3 py-1 text-xs font-black"
                :class="plan.popular ? 'bg-violet-500 text-white' : 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'">
                {{ plan.badge }}
              </span>
            </div>

            <div class="flex items-start justify-between">
              <div>
                <p class="text-xs font-black uppercase tracking-widest"
                  :class="plan.popular ? 'text-violet-400' : 'text-slate-500 dark:text-slate-400'">
                  {{ plan.name }}
                </p>
                <p class="mt-1 text-[11px]" :class="plan.popular ? 'text-slate-500' : 'text-slate-400'">
                  {{ plan.location }}
                </p>
              </div>
              <span class="text-lg">{{ plan.provider === 'ovh' ? '🟠' : '🔵' }}</span>
            </div>

            <div class="mt-5 flex items-end gap-1">
              <span class="text-4xl font-black tabular-nums"
                :class="plan.popular ? 'text-white' : 'text-slate-950 dark:text-white'">
                ${{ plan.price.toFixed(2) }}
              </span>
              <span class="mb-1 text-xs font-semibold text-slate-400">/mo</span>
            </div>

            <!-- Specs -->
            <div class="mt-5 space-y-2.5">
              <div class="flex items-center justify-between border-b pb-2"
                :class="plan.popular ? 'border-slate-800' : 'border-slate-100 dark:border-slate-800'">
                <span class="text-xs" :class="plan.popular ? 'text-slate-400' : 'text-slate-500'">Processor</span>
                <span class="text-xs font-bold" :class="plan.popular ? 'text-white' : 'text-slate-900 dark:text-white'">{{ plan.processor }}</span>
              </div>
              <div class="flex items-center justify-between border-b pb-2"
                :class="plan.popular ? 'border-slate-800' : 'border-slate-100 dark:border-slate-800'">
                <span class="text-xs" :class="plan.popular ? 'text-slate-400' : 'text-slate-500'">Cores</span>
                <span class="text-xs font-bold" :class="plan.popular ? 'text-white' : 'text-slate-900 dark:text-white'">{{ plan.cores }}</span>
              </div>
              <div class="flex items-center justify-between border-b pb-2"
                :class="plan.popular ? 'border-slate-800' : 'border-slate-100 dark:border-slate-800'">
                <span class="text-xs" :class="plan.popular ? 'text-slate-400' : 'text-slate-500'">RAM</span>
                <span class="text-xs font-bold" :class="plan.popular ? 'text-white' : 'text-slate-900 dark:text-white'">{{ plan.ram }}</span>
              </div>
              <div class="flex items-center justify-between border-b pb-2"
                :class="plan.popular ? 'border-slate-800' : 'border-slate-100 dark:border-slate-800'">
                <span class="text-xs" :class="plan.popular ? 'text-slate-400' : 'text-slate-500'">Storage</span>
                <span class="text-xs font-bold" :class="plan.popular ? 'text-white' : 'text-slate-900 dark:text-white'">{{ plan.storage }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs" :class="plan.popular ? 'text-slate-400' : 'text-slate-500'">Bandwidth</span>
                <span class="text-xs font-bold" :class="plan.popular ? 'text-white' : 'text-slate-900 dark:text-white'">{{ plan.bandwidth }}</span>
              </div>
            </div>

            <button
              type="button"
              class="mt-6 w-full rounded-xl py-3 text-sm font-bold transition"
              :class="serverInCart(plan.id)
                ? 'bg-emerald-600 text-white'
                : plan.popular
                  ? 'bg-violet-500 text-white hover:bg-violet-400'
                  : 'bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100'"
              @click="orderPlan(plan)"
            >
              {{ serverInCart(plan.id) ? 'In Cart →' : 'Order Server' }}
            </button>
          </article>
        </div>
      </div>
    </section>

    <!-- ───── CTA ───── -->
    <section class="px-4 py-20 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <div class="relative overflow-hidden rounded-3xl bg-[#020617] p-10 text-center">
          <div class="absolute inset-0 bg-grid-pattern-dark bg-grid-60 opacity-30" />
          <div class="absolute -right-32 top-0 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
          <div class="relative">
            <h2 class="text-3xl font-black text-white">Need a custom dedicated configuration?</h2>
            <p class="mt-3 text-slate-400">Open a support ticket and our team will configure a custom bare-metal quote within 24 hours.</p>
            <div class="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <NuxtLink to="/auth/signup" class="rounded-xl bg-violet-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-violet-400">
                Create account & order
              </NuxtLink>
              <a href="#plans" class="rounded-xl border border-slate-700 px-6 py-3 text-sm font-bold text-slate-300 transition hover:bg-slate-800">
                View standard plans
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
